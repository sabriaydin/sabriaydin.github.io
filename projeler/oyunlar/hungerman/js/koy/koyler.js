/* HungerMan - köy yöneticisi: köylülerin ortaya çıkması, köye giriş bildirimi, itibar, takas, sandık ganimetleri
   Köylerin yeri ve yapısı tohumdan hesaplanır; burada yalnızca oyuncuya bağlı durum (itibar, takas sayıları, ölen köylüler) tutulur. */
import { koyBul, koylerAlan, KOY_BOLGE, MESLEK_ADI } from '../dunya/koy-uretici.js';
import { MESLEKLER } from './meslekler.js';
import { karistir, uretec } from '../rastgele.js';
import { ESYALAR } from '../bloklar.js';
import { zindanAt } from '../dunya/zindan-uretici.js';
import { madenAt } from '../dunya/maden-uretici.js';
import { batikAt } from '../dunya/batik-uretici.js';
import { yapiAt } from '../dunya/yapi-uretici.js';
import { DENIZ } from '../sabitler.js';

const GORUNME = 120, KAYBOLMA = 170;
const TAKAS_SINIRI = 8;

export class Koyler {
  constructor(o) {
    Object.assign(this, o); // uretici, varliklar, dunya, tekneler, bildirim, birak(id, adet)
    this.kayit = {};            // koyId -> { itibar, takas: {idx: [..]}, gorevNo: {idx: n}, olu: [] }
    this.nufus = new Map();     // koyId -> Map(idx -> varlık)
    this.sayac = 0;
    this.icindeki = null;
    this.ayna = false;   // çok oyunculu istemci: köylüleri ve limandaki tekneleri sunucu yönetir
  }
  durum(id) { return this.kayit[id] || (this.kayit[id] = { itibar: 0, takas: {}, gorevNo: {}, olu: [] }); }
  koy(id) { const [rx, rz] = id.split(',').map(Number); return koyBul(this.uretici, rx, rz); }

  /* ekKonumlar: çok oyunculu sunucuda diğer oyuncuların konumları (köylüler onların çevresinde de ortaya çıkar) */
  guncelle(dt, oyuncu, ekKonumlar) {
    this.sayac -= dt;
    if (this.sayac > 0) return;
    this.sayac = 1;
    const p = oyuncu.konum;
    /* Köye giriş */
    const k = koyBul(this.uretici, Math.floor(p.x / KOY_BOLGE), Math.floor(p.z / KOY_BOLGE));
    /* Köyün altındaki mağaralarda ya da çok yukarıda köyde sayılmaz: köy zemininin 8 blok altı ile 24 blok üstü arası */
    const icinde = k && Math.max(Math.abs(p.x - k.x), Math.abs(p.z - k.z)) < k.yaricap && p.y > k.y - 8 && p.y < k.y + 24 ? k : null;
    if (icinde && icinde !== this.icindeki) this.bildirim(`${icinde.ad} köyüne hoş geldiniz. ${this.itibarMetni(icinde.id)}`);
    this.icindeki = icinde;
    if (this.ayna) return;
    /* Köylüleri ortaya çıkar / kaldır */
    const konumlar = ekKonumlar && ekKonumlar.length ? [p, ...ekKonumlar] : [p];
    const yakin = new Map();
    for (const q of konumlar) for (const koy of koylerAlan(this.uretici, q.x - GORUNME, q.z - GORUNME, q.x + GORUNME, q.z + GORUNME)) {
      if (Math.hypot(koy.x - q.x, koy.z - q.z) <= GORUNME) yakin.set(koy.id, koy);
    }
    for (const koy of yakin.values()) {
      let n = this.nufus.get(koy.id);
      if (!n) { n = new Map(); this.nufus.set(koy.id, n); }
      const d = this.durum(koy.id);
      /* Limandaki tekneler bir kez denize indirilir (sonrası kayıtla taşınır) */
      if (koy.liman && !d.tekne && this.tekneler && koy.liman.tekneler.every(t => this.dunya.yuklu(t.x, t.z))) {
        for (const t of koy.liman.tekneler) this.tekneler.ekle(t.tur, t.x, DENIZ + 0.75, t.z, t.yaw);
        d.tekne = true;
      }
      for (const kl of koy.koylular) {
        if (n.has(kl.idx) || d.olu.includes(kl.idx)) continue;
        if (!this.dunya.yuklu(kl.kapi.x, kl.kapi.z) || !this.dunya.yuklu(koy.x, koy.z)) continue;
        const v = this.varliklar.ekle('koylu', kl.kapi.x + 0.5, kl.kapi.y + 0.2, kl.kapi.z + 0.5, { meslek: kl.meslek });
        v.koy = koy; v.koylu = kl; v.ad = `${MESLEK_ADI[kl.meslek]} ${kl.ad}`;
        n.set(kl.idx, v);
      }
    }
    for (const [id, n] of this.nufus) {
      const koy = this.koy(id);
      if (koy && konumlar.some(q => Math.hypot(koy.x - q.x, koy.z - q.z) < KAYBOLMA)) {
        for (const [idx, v] of n) if (!this.varliklar.liste.includes(v)) n.delete(idx);
        continue;
      }
      for (const v of n.values()) this.varliklar.kaldir(v);
      this.nufus.delete(id);
    }
  }

  /* ---------- İtibar ---------- */
  itibar(id) { return this.durum(id).itibar; }
  itibarDegistir(id, n) { const d = this.durum(id); d.itibar = Math.max(-100, Math.min(100, d.itibar + n)); }
  itibarMetni(id) {
    const i = this.itibar(id);
    return i >= 40 ? 'Köylüler size büyük saygı duyuyor.' : i >= 10 ? 'Köylüler sizi tanıyor.' : i <= -40 ? 'Köylüler size güvenmiyor.' : i < 0 ? 'Köylüler size mesafeli.' : '';
  }
  itibarDerecesi(id) { const i = this.itibar(id); return i >= 40 ? 'Saygın' : i >= 10 ? 'Tanıdık' : i <= -40 ? 'Güvenilmez' : i < 0 ? 'Mesafeli' : 'Yabancı'; }
  /* Fiyat çarpanı: iyi itibar indirim, kötü itibar zam */
  carpan(id) { const i = this.itibar(id); return 1 - Math.max(-0.5, Math.min(0.3, i / 150)); }

  /* ---------- Takas ---------- */
  takasListesi(koy, kl) {
    const M = MESLEKLER[kl.meslek];
    const r = uretec(karistir(this.uretici.tohum ^ Math.imul(koy.rx + 3, 7333) ^ Math.imul(koy.rz + 5, 9551) ^ Math.imul(kl.idx + 11, 104729)));
    const havuz = [...M.havuz];
    for (let i = havuz.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [havuz[i], havuz[j]] = [havuz[j], havuz[i]]; }
    const liste = [...M.sabit, ...havuz.slice(0, 3)];
    const c = this.carpan(koy.id);
    const kullanim = this.durum(koy.id).takas[kl.idx] || [];
    return liste.map((t, i) => {
      /* Sikke ödenen takaslarda fiyat, mal verilen takaslarda istenen miktar itibara göre değişir */
      const ver = t.ver.map(([id, n]) => [id, Math.max(1, Math.round(n * c))]);
      return { ver, al: t.al, kalan: TAKAS_SINIRI - (kullanim[i] || 0) };
    });
  }
  takas(koy, kl, i, envanter) {
    if (this.itibar(koy.id) <= -40) return 'Köylüler sizinle ticaret yapmak istemiyor.';
    const t = this.takasListesi(koy, kl)[i];
    if (!t || t.kalan <= 0) return 'Bu takas bugün için tükendi.';
    for (const [id, n] of t.ver) if (envanter.say(id) < n) return `Yeterli ${ESYALAR[id].ad} mevcut değil.`;
    for (const [id, n] of t.ver) envanter.harca(id, n);
    const k = envanter.ekle(t.al[0], t.al[1]);
    if (k) this.birak(t.al[0], k);
    const d = this.durum(koy.id);
    (d.takas[kl.idx] = d.takas[kl.idx] || [])[i] = ((d.takas[kl.idx] || [])[i] || 0) + 1;
    this.itibarDegistir(koy.id, 1);
    return null;
  }
  /* Her sabah takas hakları yenilenir */
  sabah() { for (const d of Object.values(this.kayit)) d.takas = {}; }

  /* Köylüye zarar verilirse */
  koyluVuruldu(v) { this.itibarDegistir(v.koy.id, -8); this.bildirim('Köylüler bu davranıştan hoşlanmadı.'); }
  /* sadeceDunya: çok oyunculuda köylüyü başka oyuncu öldürdüyse yalnızca köylü kalıcı olarak kaybolur (itibar onun) */
  koyluOldu(v, sadeceDunya) {
    const d = this.durum(v.koy.id);
    if (!d.olu.includes(v.koylu.idx)) d.olu.push(v.koylu.idx);
    if (!sadeceDunya) this.itibarDegistir(v.koy.id, -30);
    const n = this.nufus.get(v.koy.id); if (n) n.delete(v.koylu.idx);
  }

  /* Köy sandıklarındaki ganimet (ilk açılışta, konuma göre) */
  sandikGanimeti(x, y, z) {
    const r = uretec(karistir(this.uretici.tohum ^ Math.imul(x, 73856093) ^ Math.imul(y, 19349663) ^ Math.imul(z, 83492791)));
    const yuvalar = new Array(27).fill(null);
    const k = koyBul(this.uretici, Math.floor(x / KOY_BOLGE), Math.floor(z / KOY_BOLGE));
    let tur = 'ev';
    if (k) for (const b of k.binalar) if (Math.abs(b.x - x) <= b.w && Math.abs(b.z - z) <= b.w) tur = b.tur;
    if (zindanAt(this.uretici, x, y, z)) tur = 'zindan';
    else if (madenAt(this.uretici, x, y, z)) tur = 'maden';
    if (batikAt(this.uretici, x, y, z)) tur = 'batik';
    const yp = yapiAt(this.uretici, x, y, z); if (yp) tur = yp.tur;
    const tablo = tur === 'tapinak'
      ? [[263, 2, 7], [264, 1, 3, 0.5], [288, 5, 15], [290, 1, 2, 0.3], [289, 1, 2, 0.4], [61, 1, 4, 0.5], [281, 2, 6, 0.6], [295, 2, 6, 0.5], [412, 1, 1, 0.06], [319, 1, 1, 0.05], [5, 4, 10, 0.3], [331, 1, 3, 0.3]]
      : tur === 'ormanTapinak'
      ? [[288, 3, 10], [263, 1, 4, 0.6], [264, 1, 2, 0.35], [287, 6, 16, 0.6], [286, 1, 1, 0.3], [290, 1, 1, 0.25], [61, 1, 3, 0.4], [284, 2, 6, 0.5], [332, 1, 1, 0.2], [335, 1, 1, 0.2], [266, 2, 5, 0.5]]
      : tur === 'kule'
      ? [[261, 2, 6], [264, 1, 2, 0.4], [22, 2, 8, 0.5], [61, 2, 5, 0.6], [287, 6, 16, 0.6], [333, 1, 1, 0.3], [409, 1, 1, 0.12], [411, 1, 1, 0.12], [288, 3, 8], [276, 2, 5, 0.5]]
      : tur === 'kamp'
      ? [[288, 5, 15], [261, 1, 4, 0.6], [287, 4, 12, 0.6], [293, 2, 5, 0.7], [272, 2, 5, 0.6], [315, 1, 1, 0.2], [290, 1, 1, 0.15], [284, 2, 6, 0.5], [286, 1, 1, 0.2], [313, 1, 1, 0.12]]
      : tur === 'batik'
      ? [[288, 5, 16], [299, 1, 3, 0.65], [264, 1, 2, 0.3], [263, 2, 5, 0.5], [261, 2, 6, 0.5], [290, 1, 1, 0.2], [456, 1, 1, 0.25], [457, 1, 1, 0.25], [453, 1, 1, 0.3], [293, 1, 3, 0.4], [287, 4, 12, 0.4], [319, 1, 1, 0.05], [410, 1, 1, 0.08]]
      : tur === 'kulube'
      ? [[297, 2, 6], [298, 1, 4, 0.6], [453, 1, 1, 0.45], [284, 1, 4, 0.5], [288, 1, 4], [299, 1, 1, 0.15], [46, 2, 6, 0.5], [293, 1, 2, 0.4]]
      : tur === 'maden'
      ? [[257, 3, 10], [261, 1, 5, 0.6], [262, 1, 4, 0.45], [264, 1, 2, 0.15], [46, 4, 12], [293, 1, 3, 0.6], [284, 1, 4, 0.5], [295, 2, 5, 0.4], [312, 1, 1, 0.12], [290, 1, 1, 0.1], [61, 1, 3, 0.3], [288, 1, 6, 0.6], [331, 1, 3, 0.25]]
      : tur === 'zindan'
      ? [[261, 2, 6], [263, 1, 4], [264, 1, 2, 0.35], [290, 1, 1, 0.25], [286, 1, 1, 0.25], [287, 6, 16], [289, 1, 2, 0.35], [288, 3, 10], [409, 1, 1, 0.12], [410, 1, 1, 0.12], [315, 1, 1, 0.12], [319, 1, 1, 0.04], [295, 2, 6], [61, 1, 3, 0.3], [293, 1, 3, 0.5]]
      : tur === 'demirci'
      ? [[261, 1, 4], [259, 2, 6], [257, 3, 10], [315, 1, 1, 0.15], [312, 1, 1, 0.2], [408, 1, 1, 0.15], [264, 1, 2, 0.12], [288, 1, 4]]
      : [[293, 1, 4], [291, 2, 8], [292, 2, 6], [266, 1, 4], [46, 2, 8], [288, 1, 3], [272, 1, 3, 0.4], [267, 2, 6, 0.5], [284, 1, 3, 0.4], [261, 1, 2, 0.2]];
    for (const [id, a, b, olas = 0.7] of tablo) {
      if (r() > olas) continue;
      const n = a + Math.floor(r() * (b - a + 1));
      let i = Math.floor(r() * 27); while (yuvalar[i]) i = (i + 1) % 27;
      const e = ESYALAR[id];
      yuvalar[i] = { id, adet: e.yigin === 1 ? 1 : n, ...(e.alet || e.zirh ? { dayanim: (e.alet || e.zirh).dayanim } : {}) };
    }
    return yuvalar;
  }

  disaAktar() { return this.kayit; }
  iceAktar(o) { this.kayit = o || {}; }
}
