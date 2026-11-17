/* HungerMan - köy yöneticisi: köylülerin ortaya çıkması, köye giriş bildirimi, itibar, takas, sandık ganimetleri
   Köylerin yeri ve yapısı tohumdan hesaplanır; burada yalnızca oyuncuya bağlı durum (itibar, takas sayıları, ölen köylüler) tutulur. */
import { koyBul, koylerAlan, KOY_BOLGE, MESLEK_ADI, UZMANLIK } from '../dunya/koy-uretici.js';
import { MESLEKLER, SEVIYELER, seviyeBul, UZMAN_TAKAS, GEZGIN_MALLAR } from './meslekler.js';
import { tekYapilar, YAPI_ADI } from '../dunya/yapi-uretici.js';
import { batiklarAlan } from '../dunya/batik-uretici.js';
import { zindanlarAlan } from '../dunya/zindan-uretici.js';
import { lanetliAda, ADA_AD } from '../dunya/ada-uretici.js';
import { karistir, uretec } from '../rastgele.js';
import { ESYALAR, maksDayanim } from '../bloklar.js';
import { zindanAt } from '../dunya/zindan-uretici.js';
import { madenAt } from '../dunya/maden-uretici.js';
import { batikAt } from '../dunya/batik-uretici.js';
import { yapiAt } from '../dunya/yapi-uretici.js';
import { DENIZ, diyarMi } from '../sabitler.js';
import { kaleAt } from '../dunya/diyar-uretici.js';

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
    this.gun = () => 1;  // 0.32.0: geçerli gün (ana.js ayarlar)
  }
  durum(id) {
    const d = this.kayit[id] || (this.kayit[id] = { itibar: 0, takas: {}, gorevNo: {}, olu: [] });
    /* 0.32.0: deneyim (köylü seviyesi), talep (arz ve talep), hediye (son hediye günü), zincir (zincir görev durumu) */
    if (!d.xp) { d.xp = {}; d.talep = {}; d.hediye = {}; d.zincir = {}; }
    return d;
  }
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
    if (icinde && icinde !== this.icindeki) {
      const U = UZMANLIK[icinde.uzmanlik];
      this.bildirim(`${icinde.ad} köyüne hoş geldiniz${U ? ` (${U.ad}: ${U.ozet.toLocaleLowerCase('tr')})` : ''}. ${this.itibarMetni(icinde.id)}`);
      /* 0.35.0: ziyaret edilen köy ve uzmanlığı (başarım ve söylentiler) */
      const d = this.durum(icinde.id); d.ziyaret = true; d.uz = icinde.uzmanlik;
    }
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

  /* ---------- İtibar (0.32.0: kademeler) ----------
     Güvenilmez (-40 ve altı): ticaret yok · Mesafeli (eksi) · Yabancı · Tanıdık (10+): zincir görevler · Dost (40+): özel takas, konaklama · Kahraman (70+): ek indirim, günlük hediye */
  itibar(id) { return this.durum(id).itibar; }
  itibarDegistir(id, n) { const d = this.durum(id); d.itibar = Math.max(-100, Math.min(100, d.itibar + n)); }
  kademe(id) { const i = this.itibar(id); return i >= 70 ? 4 : i >= 40 ? 3 : i >= 10 ? 2 : i <= -40 ? -2 : i < 0 ? -1 : 1; }
  itibarMetni(id) {
    return { 4: 'Bu köyün kahramanı olarak karşılanıyorsunuz.', 3: 'Köylüler sizi dost biliyor.', 2: 'Köylüler sizi tanıyor.', '-1': 'Köylüler size mesafeli.', '-2': 'Köylüler size güvenmiyor.' }[this.kademe(id)] || '';
  }
  itibarDerecesi(id) { return { 4: 'Kahraman', 3: 'Dost', 2: 'Tanıdık', 1: 'Yabancı', '-1': 'Mesafeli', '-2': 'Güvenilmez' }[this.kademe(id)]; }
  /* Sonraki kademe ve gereken itibar */
  sonrakiKademe(id) { const i = this.itibar(id); for (const [e, ad] of [[-39, 'Mesafeli'], [0, 'Yabancı'], [10, 'Tanıdık'], [40, 'Dost'], [70, 'Kahraman']]) if (i < e) return { ad, esik: e }; return null; }
  /* Fiyat çarpanı: iyi itibar indirim (Kahraman en çok %40), kötü itibar zam */
  carpan(id) { const i = this.itibar(id); return 1 - Math.max(-0.5, Math.min(i >= 70 ? 0.4 : 0.3, i / 150)); }

  /* ---------- 0.32.0: köylü seviyesi ---------- */
  koyluXp(koyId, idx) { return this.durum(koyId).xp[idx] || 0; }
  koyluSeviye(koyId, idx) { return seviyeBul(this.koyluXp(koyId, idx)); }
  xpEkle(koy, kl, n) {
    const d = this.durum(koy.id), once = seviyeBul(d.xp[kl.idx] || 0);
    d.xp[kl.idx] = (d.xp[kl.idx] || 0) + n;
    const sonra = seviyeBul(d.xp[kl.idx]);
    if (sonra > once) { this.bildirim(`${MESLEK_ADI[kl.meslek]} ${kl.ad} artık ${SEVIYELER[sonra].ad}! Yeni takaslar açıldı.`); if (this.seviyeAtladi) this.seviyeAtladi(koy, kl, sonra); }
    return sonra > once;
  }

  /* ---------- Takas ---------- */
  /* Gün ve köye bağlı karma (günlük fırsat ve köyün ihtiyacı) */
  gunKarma(koy, ek) { return uretec(karistir(this.uretici.tohum ^ Math.imul(this.gun() + 1, 2654435761) ^ Math.imul(koy.rx + 19, 4111) ^ Math.imul(koy.rz + 23, 6151) ^ Math.imul(ek + 1, 977)))(); }
  /* Köyün bugünkü ihtiyacı: bir köylünün mal karşılığı sikke verdiği takaslardan biri (istenen miktar %35 azalır) */
  ihtiyac(koy) {
    const l = [];
    for (const kl of koy.koylular) {
      const M = MESLEKLER[kl.meslek]; if (!M) continue;
      this.hamListe(koy, kl).forEach((t, i) => { if (t.al[0] === 288 && t.kilit == null) l.push([kl.idx, i]); });
    }
    return l.length ? l[Math.floor(this.gunKarma(koy, 999) * l.length)] : null;
  }
  /* 0.35.0: ziyaret edilen farklı uzmanlık sayısı */
  gezilenUzmanlik() { return new Set(Object.values(this.kayit).filter(d => d.ziyaret && d.uz).map(d => d.uz)).size; }
  /* 0.35.0: köyün uzmanlık meslekleri arasındaki köylü mü; önde gelen meslek mi */
  uzman(koy, kl) { const U = UZMANLIK[koy.uzmanlik]; if (!U) return 0; return U.meslekler[0] === kl.meslek ? 2 : U.meslekler.includes(kl.meslek) ? 1 : 0; }
  /* 0.35.0: demirci köyünde onarım ücreti (eldeki eşya); onarılamıyorsa null */
  onarimUcreti(koy, kl, s) {
    if (koy.uzmanlik !== 'demirci' || kl.meslek !== 'demirci' || !s) return null;
    const m = maksDayanim(ESYALAR[s.id]);
    if (!m || s.dayanim == null || s.dayanim >= m) return null;
    return Math.max(1, Math.ceil((1 - s.dayanim / m) * (ESYALAR[s.id].alet ? ESYALAR[s.id].alet.seviye + 3 : 6) * this.carpan(koy.id)));
  }
  onar(koy, kl, s, envanter) {
    const u = this.onarimUcreti(koy, kl, s);
    if (u == null) return 'Onarılacak eşya mevcut değil.';
    if (envanter.say(288) < u) return `Onarım için ${u} sikke gerekli.`;
    envanter.harca(288, u); s.dayanim = maksDayanim(ESYALAR[s.id]); envanter.bildir();
    this.itibarDegistir(koy.id, 1); this.xpEkle(koy, kl, 2);
    return null;
  }
  /* Ham liste: sabit + havuzdan 3 (eski kayıtlarla aynı sıra) + seviye takasları + Dost takası; kilit: gereken seviye ('dost': itibar)
     0.35.0: + köy uzmanlığına özgü takaslar (uzmanlık mesleklerinde) + ticaret kasabasında günün gezgin tüccar malları */
  hamListe(koy, kl) {
    const M = MESLEKLER[kl.meslek];
    const r = uretec(karistir(this.uretici.tohum ^ Math.imul(koy.rx + 3, 7333) ^ Math.imul(koy.rz + 5, 9551) ^ Math.imul(kl.idx + 11, 104729)));
    const havuz = [...M.havuz];
    for (let i = havuz.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [havuz[i], havuz[j]] = [havuz[j], havuz[i]]; }
    const l = [...M.sabit, ...havuz.slice(0, 3)].map(t => ({ ...t, kilit: null }));
    (M.seviye || []).forEach((sv, k) => sv.forEach(t => l.push({ ...t, kilit: k + 1 })));
    if (M.ozel) l.push({ ...M.ozel, kilit: 'dost' });
    const uz = this.uzman(koy, kl);
    if (uz) for (const t of UZMAN_TAKAS[koy.uzmanlik] || []) l.push({ ...t, kilit: null, uzman: true });
    if (koy.uzmanlik === 'ticaret') {
      const g = GEZGIN_MALLAR.length, a = Math.floor(this.gunKarma(koy, kl.idx + 700) * g);
      for (const i of [a, (a + 5) % g]) l.push({ ...GEZGIN_MALLAR[i], kilit: null, gezgin: true });
    }
    return l;
  }
  takasListesi(koy, kl) {
    const c = this.carpan(koy.id), d = this.durum(koy.id), sv = this.koyluSeviye(koy.id, kl.idx), dost = this.kademe(koy.id) >= 3;
    const kullanim = d.takas[kl.idx] || [], talep = d.talep[kl.idx] || {};
    /* 0.35.0: uzmanlık fiyatları: önde gelen meslek alışta %30, diğer uzmanlık meslekleri %15 ucuz; satışta daha az mal ister. Ticaret kasabasında takas hakkı 12 */
    const uz = this.uzman(koy, kl), uzAl = koy.uzmanlik === 'ticaret' ? 0.9 : [1, 0.85, 0.7][uz], uzSat = koy.uzmanlik === 'ticaret' ? 0.9 : [1, 0.9, 0.8][uz];
    const SINIR = koy.uzmanlik === 'ticaret' ? 12 : TAKAS_SINIRI;
    const ham = this.hamListe(koy, kl), ihtiyac = this.ihtiyac(koy);
    /* Günün fırsatı: açık, sikkeyle alınan takaslardan biri %25 indirimli */
    const alim = ham.map((t, i) => i).filter(i => ham[i].ver.some(([id]) => id === 288) && (ham[i].kilit == null || (typeof ham[i].kilit === 'number' && ham[i].kilit <= sv)));
    const firsat = alim.length ? alim[Math.floor(this.gunKarma(koy, kl.idx) * alim.length)] : -1;
    return ham.map((t, i) => {
      const acik = t.kilit == null || (t.kilit === 'dost' ? dost : t.kilit <= sv);
      const sikkeyle = t.ver.some(([id]) => id === 288);
      /* Arz ve talep: çok alınan pahalanır, çok satılan için daha fazla mal istenir (en çok %60); ertesi sabahlar yarıya iner */
      const tl = 1 + Math.min(0.6, 0.07 * (talep[i] || 0));
      const ozel = i === firsat ? 0.75 : ihtiyac && ihtiyac[0] === kl.idx && ihtiyac[1] === i ? 0.65 : 1;
      const k = c * tl * ozel * (sikkeyle ? uzAl : uzSat);
      const ver = t.ver.map(([id, n]) => [id, Math.max(1, Math.round(n * k))]);
      const taban = t.ver.map(([id, n]) => [id, Math.max(1, Math.round(n * c))]);
      const fark = Math.round((ver[0][1] / taban[0][1] - 1) * 100);
      return { ver, al: t.al, kalan: (t.gezgin ? 2 : SINIR) - (kullanim[i] || 0), sinir: t.gezgin ? 2 : SINIR, acik, kilit: t.kilit, firsat: i === firsat, ihtiyac: ozel === 0.65, fark, sikkeyle, uzman: !!t.uzman, gezgin: !!t.gezgin };
    });
  }
  takas(koy, kl, i, envanter) {
    if (this.itibar(koy.id) <= -40) return 'Köylüler sizinle ticaret yapmak istemiyor.';
    if (this.durum(koy.id).kapali === this.gun()) return 'Köylüler baskından sonra kaçıştı; bugün ticaret yapılmıyor.';   // 0.35.0
    const t = this.takasListesi(koy, kl)[i];
    if (!t || !t.acik) return 'Bu takas henüz açılmadı.';
    if (t.kalan <= 0) return 'Bu takas bugün için tükendi.';
    for (const [id, n] of t.ver) if (envanter.say(id) < n) return `Yeterli ${ESYALAR[id].ad} mevcut değil.`;
    for (const [id, n] of t.ver) envanter.harca(id, n);
    const k = envanter.ekle(t.al[0], t.al[1]);
    if (k) this.birak(t.al[0], k);
    const d = this.durum(koy.id);
    (d.takas[kl.idx] = d.takas[kl.idx] || [])[i] = ((d.takas[kl.idx] || [])[i] || 0) + 1;
    const tl = d.talep[kl.idx] = d.talep[kl.idx] || {}; tl[i] = (tl[i] || 0) + 1;
    this.itibarDegistir(koy.id, 1);
    /* Köylü deneyimi: takasın sikke değerine göre 1-4 */
    const sikke = [...t.ver, t.al].reduce((n, [id, a]) => n + (id === 288 ? a : 0), 0);
    this.xpEkle(koy, kl, Math.min(4, 1 + Math.floor(sikke / 4)) + (t.ihtiyac ? 2 : 0));
    return null;
  }
  /* Kahraman itibarında köylü günde bir kez hediye verir: [id, adet] ya da null */
  hediye(koy, kl, envanter) {
    if (this.kademe(koy.id) < 4) return null;
    const d = this.durum(koy.id), g = this.gun();
    if (d.hediye[kl.idx] === g) return null;
    const M = MESLEKLER[kl.meslek], l = M.hediye || [[288, 3]];
    const h = l[Math.floor(this.gunKarma(koy, kl.idx + 50) * l.length)];
    d.hediye[kl.idx] = g;
    const k = envanter.ekle(h[0], h[1]); if (k) this.birak(h[0], k);
    return h;
  }
  /* 0.32.0: söylentiler: köye yakın bilinen yapılar (yön ve uzaklık) */
  soylenti(koy, n) {
    const u = this.uretici, l = [];
    const ekle = (ad, x, z) => { const m = Math.hypot(x - koy.x, z - koy.z); if (m > 60 && m < 3000) l.push({ ad, x, z, m }); };
    for (const [tur, Y] of Object.entries(tekYapilar(u))) ekle(YAPI_ADI[tur], Y.x, Y.z);
    for (const b of batiklarAlan(u, koy.x - 900, koy.z - 900, koy.x + 900, koy.z + 900)) ekle('batık bir gemi', b.x, b.z);
    for (const z of zindanlarAlan(u, koy.x - 700, koy.z - 700, koy.x + 700, koy.z + 700)) ekle('bir yeraltı zindanı', z.x, z.z);
    try { const A = lanetliAda(u); ekle(ADA_AD, A.x, A.z); } catch (e) { /* yok sayılır */ }
    /* 0.35.0: başka köylerin uzmanlıkları (iki kat ağırlıkla) */
    for (const o of koylerAlan(u, koy.x - 1500, koy.z - 1500, koy.x + 1500, koy.z + 1500)) if (o.id !== koy.id && UZMANLIK[o.uzmanlik]) { const ad = `${o.ad} köyü (${UZMANLIK[o.uzmanlik].kisa.toLocaleLowerCase('tr')} alanında ünlü)`; ekle(ad, o.x, o.z); ekle(ad, o.x, o.z); }
    if (!l.length) return null;
    return l[Math.floor(this.gunKarma(koy, (n || 0) + 300) * l.length)];
  }
  /* Her sabah takas hakları yenilenir */
  sabah() {
    for (const d of Object.values(this.kayit)) {
      d.takas = {};
      /* 0.32.0: talep her sabah yarıya iner */
      if (d.talep) for (const t of Object.values(d.talep)) for (const i in t) { t[i] *= 0.5; if (t[i] < 0.3) delete t[i]; }
    }
  }

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
    if (diyarMi(x)) tur = kaleAt(this.uretici, x, y, z) ? 'kale' : 'diyar';   // 0.18.0
    const tablo = tur === 'kale' || tur === 'diyar'
      ? [[472, 1, 3, 0.6], [471, 2, 8, 0.6], [263, 2, 6, 0.6], [264, 1, 3, 0.45], [515, 1, 4, 0.4], [288, 5, 15], [290, 1, 2, 0.3], [335, 1, 2, 0.35], [473, 1, 1, 0.25], [287, 6, 16, 0.4], [316, 1, 1, 0.08], [319, 1, 1, 0.06], [474, 1, 1, 0.05], [412, 1, 1, 0.05]]
      : tur === 'tapinak'
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
