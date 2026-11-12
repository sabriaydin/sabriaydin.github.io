/* HungerMan - çok oyunculu istemci: bir koda bağlanan oyuncunun tarafı
   Dünya aynı tohumdan yerelde üretilir; blok değişiklikleri, canlılar, yere düşen eşyalar, tekneler ve zaman sunucudan gelir.
   Hareket, envanter, can, görevler ve köy itibarı yerelde yürütülür ve düzenli olarak sunucuya kaydedilir. */
import { UzakOyuncular } from './uzak-oyuncular.js';
import { r2, r3, v3, durumDizisi, blokEfekti, sandikDizi, sandikKur } from './ortak.js';
import { koyBul, MESLEK_ADI } from '../dunya/koy-uretici.js';
import { BLOKLAR, ESYALAR } from '../bloklar.js';

const ZAMAN_ASIMI = 20000;

/* Envantere bu eşyadan kaç tane sığar */
function sigar(env, id, adet) {
  const max = env.yigin(id);
  let yer = 0;
  for (const s of env.yuvalar) { if (!s) yer += max; else if (max > 1 && s.id === id) yer += max - s.adet; if (yer >= adet) return adet; }
  return Math.min(adet, yer);
}

export class IstemciOyun {
  constructor(o) {
    Object.assign(this, o); // kanal, id (benim numaram), kod, oyun, sahne, ses, ad, arayuz
    this.benimId = this.id;
    this.liste = [];
    this.durumSayac = 0; this.kayitSayac = 15;
    this.uzak = new UzakOyuncular(this.sahne, this.oyun.dunya);
    this.kancalar();
    this.kanal.mesaj = m => this.mesaj(m);
    this.kanal.kapandi = () => { if (!this.kapali) { this.kapali = true; this.arayuz.koptu('Sunucuyla bağlantı kesildi.'); } };
  }
  gonder(m) { this.kanal.gonder(m); }

  kancalar() {
    const o = this.oyun;
    this.dinle = (x, y, z, id, eski, kaynak) => { if (kaynak !== 'ag') this.gonder({ t: 'b', b: [x, y, z, id], e: kaynak === 'yerel' ? 1 : 0 }); };
    o.dunya.dinleyiciler.push(this.dinle);
    o.dusenler.ag = {
      birakIste: (id, adet, dayanim, x, y, z, vx, vy, vz, gecikme) => this.gonder({ t: 'bk', a: [id, adet, dayanim ?? null, r2(x), r2(y), r2(z), r2(vx), r2(vy), r2(vz), gecikme] }),
      alIste: d => { const n = sigar(o.envanter, d.id, d.adet); if (n <= 0) return false; this.gonder({ t: 'al', i: d.ni, n }); return true; }
    };
    o.varliklar.ayna = true; o.varliklar.dinleyici = o.oyuncu.konum;
    o.varliklar.ag = {
      vur: (v, n, kaynak, op) => this.gonder({ t: 'vur', i: v.id, n, k: kaynak ? v3(kaynak) : null, it: (op && op.itme) ?? 1 }),
      okAt: (p, h, hasar) => this.gonder({ t: 'ok', p: v3(p), v: v3(h), h: hasar })
    };
    o.tekneler.ayna = true;
    o.tekneler.ag = {
      koyIste: (tur, x, y, z, yaw) => this.gonder({ t: 'tk', tur, p: [r2(x), r2(y), r2(z)], y: r3(yaw) }),
      binIste: t => this.gonder({ t: 'tb', i: t.ni }),
      indi: t => this.gonder({ t: 'ti', i: t.ni, p: [r2(t.p.x), r2(t.p.y), r2(t.p.z), r3(t.yaw)] }),
      vurIste: t => this.gonder({ t: 'tv', i: t.ni })
    };
    o.koyler.ayna = true;
  }

  /* Katılırken gelen ilk veriler */
  ilkVeri(m) {
    const o = this.oyun;
    for (const a of m.dusenler || []) o.dusenler.aynaEkle(a);
    for (const a of m.tekneler || []) this.tekneEkle(a);
    this.listeKur(m.oyuncular || []);
  }
  tekneEkle(a) {
    const T = this.oyun.tekneler;
    if (T.liste.some(t => t.ni === a[0])) return;
    const t = T.ekle(a[1], a[2], a[3], a[4], a[5], a[0]);
    t.can = a[6];
  }
  listeKur(l) {
    this.liste = l;
    const var_ = new Set();
    for (const [id, ad, renk] of l) { if (id === this.benimId) continue; this.uzak.ekle(id, ad, renk); var_.add(id); }
    for (const id of [...this.uzak.harita.keys()]) if (!var_.has(id)) this.uzak.sil(id);
    this.arayuz.liste();
  }
  oyuncuListesi() { return this.liste; }

  /* Sunucudan gelen köylü bilgisi: köy ve meslek tohumdan bulunur */
  koyluCoz(v, meta) {
    const [rx, rz] = String(meta[2] || '').split(',').map(Number);
    const koy = koyBul(this.oyun.dunya.uretici, rx, rz);
    const kl = koy && koy.koylular.find(k => k.idx === meta[3]);
    if (!koy || !kl) return;
    v.koy = koy; v.koylu = kl; v.ad = `${MESLEK_ADI[kl.meslek]} ${kl.ad}`;
  }

  mesaj(m) {
    const o = this.oyun;
    if (!o) return;
    switch (m.t) {
      case 's': {
        /* Zaman: küçük farklar yumuşatılır, gün değişimi ya da büyük fark doğrudan alınır */
        if (m.g > o.gun) { o.koyler.sabah(); o.hud.bildirim(`${m.g}. gün başladı`); }
        if (m.g !== o.gun || Math.abs(m.z - o.zaman) > 0.004) { o.gun = m.g; o.zaman = m.z; }
        else o.zaman += (m.z - o.zaman) * 0.2;
        for (const a of m.o) { if (a[0] === this.benimId) continue; this.uzak.durum(a[0], a.slice(1)); }
        o.varliklar.aynaUygula(m.v, (v, meta) => this.koyluCoz(v, meta));
        for (const b of m.b) { const t = o.tekneler.liste.find(x => x.ni === b[0]); if (t && t !== o.tekneler.binilen) t.hedef = b.slice(1); }
        break;
      }
      case 'b': {
        const [x, y, z, id] = m.b;
        if (!BLOKLAR[id]) return;
        const eski = o.dunya.blok(x, y, z);
        o.dunya.agBlok(x, y, z, id);
        if (m.e) blokEfekti(o, this.ses, x, y, z, id, eski);
        break;
      }
      case 'd+': for (const a of m.l) { a[7] = a[7] || 0.001; a[8] = a[8] || 0.001; a[9] = a[9] || 0.001; o.dusenler.aynaEkle(a); } break;
      case 'd-': o.dusenler.aynaSil(m.i); break;
      case 'da': o.dusenler.aynaAdet(m.i, m.n); break;
      case 'ver': {
        if (!ESYALAR[m.id]) return;
        const k = o.envanter.ekle(m.id, m.n, m.dy ?? undefined);
        this.ses.topla();
        if (k > 0) { const p = o.oyuncu.konum; o.dusenler.birak(m.id, k, p.x, p.y + 1, p.z, 0.001, 2, 0.001, m.dy ?? undefined, 1.5); }
        break;
      }
      case 'h': this.arayuz.hasar(m.n, m.s, m.k[0], m.k[1], m.a); break;
      case 'kv': o.koyler.itibarDegistir(m.k, -8); o.hud.bildirim('Köylüler bu davranıştan hoşlanmadı.'); break;
      case 'ol': o.gorevler.oldurme(m.tur); if (m.k) o.koyler.itibarDegistir(m.k, -30); break;
      case 'o+': o.varliklar.aynaOk(m.i, m.p, m.v, m.d); break;
      case 'o-': o.varliklar.aynaOkSil(m.i); break;
      case 't+': for (const a of m.l) this.tekneEkle(a); break;
      case 't-': {
        const t = o.tekneler.liste.find(x => x.ni === m.i);
        if (!t) return;
        if (t === o.tekneler.binilen) { o.tekneler.binilen = null; }
        o.tekneler.sil(t);
        break;
      }
      case 'tb': {
        const t = o.tekneler.liste.find(x => x.ni === m.i);
        if (!t) return;
        if (!m.ok) { o.hud.bildirim('Bu tekneyi başka bir oyuncu kullanıyor.'); return; }
        if (o.tekneler.binilen || o.hayatta.olu) { this.gonder({ t: 'ti', i: t.ni, p: [r2(t.p.x), r2(t.p.y), r2(t.p.z), r3(t.yaw)] }); return; }
        if (o.olta.aktif) o.olta.kaldir();
        t.onay = true; o.tekneler.bin(t, o.oyuncu); delete t.onay;
        o.hud.bildirim(`${t.T.ad}: W/S hız, A/D dümen. İnmek için C tuşuna basınız.`, 'tekne');
        break;
      }
      case 'sandik':
        if (m.kilitli) { o.hud.bildirim('Bu sandığı başka bir oyuncu kullanıyor.'); return; }
        this.arayuz.sandikAc(m.k, sandikKur(m.y));
        break;
      case 'skz': this.arayuz.sandikKapat(m.k); break;
      case 'oy': this.listeKur(m.l); break;
      case 'sh': if (m.s) this.arayuz.sohbet(null, m.s); else this.arayuz.sohbet(m.a, m.m, m.r); break;
      case 'uy': this.arayuz.uykuBaslat(); break;
      case 'ub': this.arayuz.bildirim(`Uyuyan oyuncular: ${m.n}/${m.a}. Gece, herkes yattığında atlanır.`); break;
      case 'kapandi': if (!this.kapali) { this.kapali = true; this.arayuz.koptu('Sunucu, dünyayı kapattı.'); } break;
    }
  }

  /* ---------- Oyuncunun işlemleri ---------- */
  sandikIste(x, y, z) { this.gonder({ t: 'sa', x, y, z }); }
  sandikKapat(k, yuvalar) { this.gonder({ t: 'sk', k, y: sandikDizi(yuvalar) }); }
  sandikKir(x, y, z) { this.gonder({ t: 'skr', x, y, z }); }
  sohbetGonder(s) { this.gonder({ t: 'sh', m: s }); }
  kayitGonder() {
    const o = this.oyun;
    if (!o || this.kapali) return;
    const p = o.oyuncu.konum;
    this.gonder({ t: 'ky', v: {
      oyuncu: { x: r3(p.x), y: r3(p.y), z: r3(p.z), yaw: o.oyuncu.yaw, pitch: o.oyuncu.pitch },
      envanter: o.envanter.disaAktar(), hayatta: o.hayatta.disaAktar(), dogum: o.dogum, olumNoktasi: o.olumNoktasi,
      gorevler: o.gorevler.disaAktar(), koyler: o.koyler.disaAktar()
    } });
  }

  guncelle(dt) {
    const o = this.oyun;
    this.durumSayac -= dt;
    if (this.durumSayac <= 0) {
      this.durumSayac = 1 / 12;
      const t = o.tekneler.binilen, m = { t: 'd', a: durumDizisi(o) };
      if (t) m.tk = [r2(t.p.x), r2(t.p.y), r2(t.p.z), r3(t.yaw), r2(t.hiz)];
      this.gonder(m);
    }
    this.kayitSayac -= dt;
    if (this.kayitSayac <= 0 && o.hazir) { this.kayitSayac = 15; this.kayitGonder(); }
    this.uzak.guncelle(dt, o.gunIsigi);
    if (performance.now() - this.kanal.sonAlim > ZAMAN_ASIMI) this.kanal.kapat();
  }

  /* Oyundan çıkarken: son kayıt gönderilir, bağlantı kapanır */
  kapat() {
    const k = this.kanal;
    k.kapandi = null;
    if (!this.kapali) {
      this.kayitGonder();
      this.gonder({ t: 'ayril' });
      this.kapali = true;
      setTimeout(() => k.kapat(), 500);
    } else k.kapat();
    const o = this.oyun;
    const i = o.dunya.dinleyiciler.indexOf(this.dinle); if (i >= 0) o.dunya.dinleyiciler.splice(i, 1);
    this.uzak.temizle();
  }
}
