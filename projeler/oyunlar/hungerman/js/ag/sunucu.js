/* HungerMan - çok oyunculu sunucu: dünyayı açan oyuncunun tarayıcısında çalışır
   Dünya, canlılar, yere düşen eşyalar, tekneler, sandıklar ve zaman burada yönetilir; diğer oyunculara anlık durum gönderilir.
   Her oyuncu kendi hareketini, envanterini, görevlerini ve köy itibarını kendisi yürütür; sunucu bunları oyuncu adına kaydeder. */
import { THREE } from '../grafik/sahne.js';
import { AgSunucu } from './baglanti.js';
import { UzakOyuncular, RENKLER, B } from './uzak-oyuncular.js';
import { r2, r3, v3, durumDizisi, blokEfekti, sandikDizi, sandikKur } from './ortak.js';
import { SURUM, PB } from '../sabitler.js';
import { BLOKLAR, ESYALAR } from '../bloklar.js';
import { OTURMA } from '../oyun/binek.js';
import { mezarKoy, mezarBosalt } from '../oyun/mezar.js';

const MAKS = 8;                 // sunucu dahil en çok oyuncu
const ANLIK = 0.1;              // anlık durum gönderim aralığı (sn)
const CANLI_MENZIL = 96, TEKNE_MENZIL = 160;
const ZAMAN_ASIMI = 20000;      // bu süre veri gelmezse oyuncu düşmüş sayılır (ms)

export class SunucuOyun {
  constructor(o) {
    Object.assign(this, o); // oyun, sahne, ses, ad, arayuz: { bildirim, sohbet, liste, uykuBaslat, sandikKapat }
    this.ag = new AgSunucu();
    this.istemciler = new Map();
    this.sira = 0; this.renkSira = 1;
    this.anlik = 0;
    this.kilit = new Map();      // sandık anahtarı -> 'yerel' ya da oyuncu numarası
    this.uykuSay = -1;
    this.benimId = 0;
    this.kod = null;
  }

  async baslat() {
    this.ag.baglandi = k => this.baglandi(k);
    this.ag.hata = m => this.arayuz.bildirim(m);
    this.kod = await this.ag.baslat();
    this.uzak = new UzakOyuncular(this.sahne, this.oyun.dunya);
    this.kayitlar = this.oyun.oyuncuKayitlari || (this.oyun.oyuncuKayitlari = {});
    this.kancalar();
    return this.kod;
  }

  /* Oyun modüllerine ağ kancaları */
  kancalar() {
    const o = this.oyun;
    this.dinle = (x, y, z, id, eski, kaynak) => { if (kaynak !== 'ag') this.yay({ t: 'b', b: [x, y, z, id], e: kaynak === 'yerel' ? 1 : 0 }); };
    o.dunya.dinleyiciler.push(this.dinle);
    for (const d of o.dusenler.liste) if (!d.ni) d.ni = ++o.dusenler.sira;
    o.dusenler.ag = {
      eklendi: d => this.yay({ t: 'd+', l: [this.dusenVeri(d)] }),
      silindi: d => this.yay({ t: 'd-', i: d.ni }),
      adet: d => this.yay({ t: 'da', i: d.ni, n: d.adet })
    };
    o.varliklar.ag = {
      okEklendi: a => this.yay({ t: 'o+', i: a.ni, p: v3(a.p), v: v3(a.v), d: a.dusman ? 1 : 0, ...(a.ek && a.ek.tur ? { k: a.ek.tur } : {}) }),
      okSilindi: a => this.yay({ t: 'o-', i: a.ni })
    };
    o.varliklar.dinleyici = o.oyuncu.konum;
    for (const t of o.tekneler.liste) if (!t.ni) t.ni = ++o.tekneler.sira;
    o.tekneler.ag = {
      eklendi: t => this.yay({ t: 't+', l: [this.tekneVeri(t)] }),
      silindi: t => this.yay({ t: 't-', i: t.ni }),
      dolu: () => this.arayuz.bildirim('Bu tekneyi başka bir oyuncu kullanıyor.')
    };
  }

  dusenVeri(d) { const a = [d.ni, d.id, d.adet, d.dayanim ?? null, r2(d.p.x), r2(d.p.y), r2(d.p.z), r2(d.v.x), r2(d.v.y), r2(d.v.z), Math.max(0, r2(d.gecikme - d.yas))]; if (d.buyu) a.push(d.buyu); return a; }
  tekneVeri(t) { return [t.ni, t.tur, r2(t.p.x), r2(t.p.y), r2(t.p.z), r3(t.yaw), t.can]; }
  oyuncuListesi() { return [[0, this.ad, 0, 1], ...[...this.istemciler.values()].map(c => [c.id, c.ad, c.renk, 0])]; }
  konumlar() { const l = []; for (const c of this.istemciler.values()) if (c.durum) l.push(c.konum); return l; }

  /* Hazır oyunculara gönder (haric: gönderilmeyecek kanal) */
  yay(m, haric) { for (const c of this.istemciler.values()) if (c.k !== haric) c.k.gonder(m); }

  /* ---------- Bağlantılar ---------- */
  baglandi(k) {
    k.mesaj = m => this.mesaj(k, m);
    k.kapandi = () => this.ayrildi(k);
    setTimeout(() => { if (!k.istemci && !k.kapali) k.kapat(); }, 15000);
  }
  reddet(k, s) { k.gonder({ t: 'ret', s }); setTimeout(() => k.kapat(), 600); }

  karsila(k, m) {
    const o = this.oyun;
    const ad = String(m.ad || '').replace(/\s+/g, ' ').trim().slice(0, 16);
    const kucuk = ad.toLocaleLowerCase('tr');
    if (m.surum !== SURUM) return this.reddet(k, `Sürümler uyuşmuyor: sunucu ${SURUM}, sizin oyununuz ${m.surum || 'bilinmiyor'}. Sayfayı yenileyiniz.`);
    if (!ad) return this.reddet(k, 'Oyuncu adı gerekli.');
    if (this.istemciler.size >= MAKS - 1) return this.reddet(k, `Sunucu dolu (en çok ${MAKS} oyuncu).`);
    if (kucuk === this.ad.toLocaleLowerCase('tr') || [...this.istemciler.values()].some(c => c.ad.toLocaleLowerCase('tr') === kucuk)) return this.reddet(k, 'Bu adla bağlı bir oyuncu mevcut. Farklı bir ad seçiniz.');
    const id = ++this.sira;
    const renk = this.renkSira++ % RENKLER.length || this.renkSira++ % RENKLER.length;
    const kayit = this.kayitlar[kucuk] || null;
    const d = o.dunya.uretici.dogumNoktasi();
    const dogum = { x: d.x + Math.floor(Math.random() * 5) - 2 + 0.5, y: d.y, z: d.z + Math.floor(Math.random() * 5) - 2 + 0.5 };
    const c = { id, ad, k, renk, konum: new THREE.Vector3(), yaw: 0, pitch: 0, durum: null, olu: false, suda: false, yatakta: false, bilinen: new Set(), ctx: null };
    const p = kayit && kayit.oyuncu ? kayit.oyuncu : dogum;
    c.konum.set(p.x, p.y, p.z);
    k.istemci = c;
    this.istemciler.set(id, c);
    this.uzak.ekle(id, ad, renk);
    k.gonder({
      t: 'hg', id, surum: SURUM, ad: o.ad, tohum: o.tohum, zaman: o.zaman, gun: o.gun, komutlar: !!o.komutlar, zorluk: o.zorluk, denge: o.denge,
      degisiklikler: o.dunya.degisiklikleriAl(), kayit, dogum,
      dusenler: o.dusenler.liste.map(x => this.dusenVeri(x)),
      tekneler: o.tekneler.liste.map(t => this.tekneVeri(t)),
      oyuncular: this.oyuncuListesi()
    });
    this.yay({ t: 'oy', l: this.oyuncuListesi() });
    this.yay({ t: 'sh', s: `${ad} oyuna katıldı.` }, k);
    this.arayuz.sohbet(null, `${ad} oyuna katıldı.`);
    this.arayuz.liste();
  }

  ayrildi(k) {
    const c = k.istemci;
    if (!c || !this.istemciler.has(c.id)) return;
    const o = this.oyun;
    this.istemciler.delete(c.id);
    if (this.uzak) this.uzak.sil(c.id);
    for (const [s, sahip] of this.kilit) if (sahip === c.id) this.kilit.delete(s);
    for (const t of o.tekneler.liste) if (t.binen === c.id) { t.binen = null; t.hedef = null; t.hiz = 0; t.vy = 0; }
    for (const w of o.varliklar.liste) if (w.binen === c.id) { w.binen = null; w.binenHiz = 0; }
    if (this.kapali) return;
    this.yay({ t: 'oy', l: this.oyuncuListesi() });
    this.yay({ t: 'sh', s: `${c.ad} oyundan ayrıldı.` });
    this.arayuz.sohbet(null, `${c.ad} oyundan ayrıldı.`);
    this.arayuz.liste();
  }

  bul(liste, ni) { for (const x of liste) if (x.ni === ni) return x; return null; }

  mesaj(k, m) {
    const c = k.istemci;
    if (!c) { if (m.t === 'merhaba') this.karsila(k, m); return; }
    const o = this.oyun;
    switch (m.t) {
      case 'd': {   // oyuncu durumu
        const a = m.a;
        if (!Array.isArray(a) || a.length < 8) return;
        c.durum = a; c.konum.set(a[0], a[1], a[2]);
        c.olu = !!(a[6] & B.OLU); c.suda = !!(a[6] & B.SUDA); c.yatakta = !!(a[6] & B.YATAK);
        this.uzak.durum(c.id, a);
        if (m.tk && a[7] >= 0) { const t = this.bul(o.tekneler.liste, a[7]); if (t && t.binen === c.id) t.hedef = m.tk; }
        /* 0.16.0: istemcinin sürdüğü at, binicinin konumuyla taşınır */
        if (a.length > 8 && a[8] >= 0) {
          const w = o.varliklar.liste.find(x => x.id === a[8]);
          if (w && w.binen === c.id) {
            const s = performance.now(), gecen = Math.max(0.03, (s - (w.binenZaman || s - 100)) / 1000);
            w.binenHiz = Math.min(12, Math.hypot(a[0] - w.konum.x, a[2] - w.konum.z) / gecen); w.binenZaman = s;
            w.konum.set(a[0], a[1] - OTURMA, a[2]); w.yaw = a[3]; w.hedefYaw = a[3];
          }
        }
        break;
      }
      case 'b': {   // blok değişikliği
        const [x, y, z, id] = m.b;
        if (!BLOKLAR[id]) return;
        const eski = o.dunya.blok(x, y, z);
        o.dunya.agBlok(x, y, z, id);
        if (BLOKLAR[id].sandik) { const s = x + ',' + y + ',' + z; if (!o.dunya.sandiklar.has(s)) o.dunya.sandiklar.set(s, new Array(27).fill(null)); }
        this.yay(m, k);
        if (m.e) blokEfekti(o, this.ses, x, y, z, id, eski);
        break;
      }
      case 'bk': {  // eşya bırakma
        const a = m.a;
        if (!ESYALAR[a[0]] || !(a[1] > 0)) return;
        o.dusenler.birak(a[0], Math.min(64 * 36, a[1] | 0), a[3], a[4], a[5], a[6], a[7], a[8], a[2] ?? undefined, a[9], a[10] && typeof a[10] === 'object' ? a[10] : undefined);
        break;
      }
      case 'al': {  // eşya alma isteği
        const d = this.bul(o.dusenler.liste, m.i);
        if (!d) return;
        const n = Math.max(0, Math.min(m.n | 0, d.adet));
        if (!n) return;
        k.gonder({ t: 'ver', id: d.id, n, dy: d.dayanim ?? null, ...(d.buyu ? { b: d.buyu } : {}) });
        d.adet -= n;
        if (d.adet <= 0) { const i = o.dusenler.liste.indexOf(d); o.dusenler.sil(d); o.dusenler.liste.splice(i, 1); this.yay({ t: 'd-', i: d.ni }); }
        else this.yay({ t: 'da', i: d.ni, n: d.adet });
        break;
      }
      case 'vur': { // canlıya vuruş
        const w = o.varliklar.liste.find(v => v.id === m.i);
        if (!w || w.olu || w.konum.distanceTo(c.konum) > 9) return;
        const kaynak = m.k ? new THREE.Vector3(m.k[0], m.k[1], m.k[2]) : c.konum.clone();
        o.varliklar.hasarVer(w, Math.min(30, +m.n || 1), kaynak, { itme: Math.min(2.4, +m.it || 1), oyuncu: true, vuran: c, yagma: Math.max(0, Math.min(3, m.yg | 0)), ates: !!m.at });
        break;
      }
      case 'ce': { // 0.16.0: evcil hayvan / at etkileşimi
        const w = o.varliklar.liste.find(x => x.id === m.i);
        if (!w || w.olu || w.konum.distanceTo(c.konum) > 9) { c.k.gonder({ t: 'ce', i: m.i }); break; }
        const S = o.varliklar.canliEtkilesim(w, m.e | 0, c.ad);
        if (S.bin) w.binen = c.id;
        c.k.gonder({ t: 'ce', i: w.id, tk: S.tuket ? 1 : 0, m: S.mesaj, o: S.olay, b: S.bin ? 1 : 0, dg: S.degistir || 0, y: S.yipran ? 1 : 0, s: S.ses || null });
        break;
      }
      case 'ati': { // attan inme
        const w = o.varliklar.liste.find(x => x.id === m.i);
        if (w && w.binen === c.id && Array.isArray(m.p)) { w.binen = null; w.binenHiz = 0; w.konum.set(m.p[0], m.p[1], m.p[2]); w.yaw = m.p[3]; w.hiz.set(0, 0, 0); }
        break;
      }
      case 'bes': { // hayvan besleme
        const w = o.varliklar.liste.find(v => v.id === m.i);
        if (w && !w.olu && w.konum.distanceTo(c.konum) < 9) o.varliklar.besle(w, c);
        break;
      }
      case 'ok': o.varliklar.okAt(new THREE.Vector3(...m.p), new THREE.Vector3(...m.v), Math.min(24, +m.h || 2), false, c, m.yv ? { yavas: true } : null); break;
      case 'sa': {  // sandık açma
        const s = m.x + ',' + m.y + ',' + m.z;
        const sahip = this.kilit.get(s);
        if (sahip != null && sahip !== c.id) { k.gonder({ t: 'sandik', k: s, kilitli: 1 }); return; }
        let d = o.dunya.sandiklar.get(s);
        if (!d) { d = BLOKLAR[o.dunya.blok(m.x, m.y, m.z)].mezar ? new Array(27).fill(null) : o.koyler.sandikGanimeti(m.x, m.y, m.z); o.dunya.sandiklar.set(s, d); }
        this.kilit.set(s, c.id);
        k.gonder({ t: 'sandik', k: s, y: sandikDizi(d) });
        break;
      }
      case 'sk': {  // sandık kapandı: yeni içerik
        if (this.kilit.get(m.k) !== c.id) return;
        this.kilit.delete(m.k);
        const [x, y, z] = m.k.split(',').map(Number);
        const yuvalar = sandikKur(m.y).slice(0, 27);
        while (yuvalar.length < 27) yuvalar.push(null);
        if (o.dunya.yuklu(x, z) && !BLOKLAR[o.dunya.blok(x, y, z)].sandik) { for (const e of yuvalar) if (e) o.dusenler.birak(e.id, e.adet, x + 0.5, y + 0.5, z + 0.5, 0, 0, 0, e.dayanim, 0.5, e.buyu); return; }
        o.dunya.sandiklar.set(m.k, yuvalar);
        mezarBosalt(o.dunya, m.k);   // 0.22.0: boşaltılan mezar kaybolur
        break;
      }
      case 'mz': {  // 0.22.0: ölen istemcinin eşyaları mezar taşına
        const l = sandikKur(m.y).filter(Boolean).slice(0, 81), [x, y, z] = (m.p || []).map(Number);
        if (!l.length || ![x, y, z].every(Number.isFinite)) break;
        const r = mezarKoy(o.dunya, x, y, z, l);
        for (const e of r.kalan) o.dusenler.birak(e.id, e.adet, x, y + 1, z, 0, 2, 0, e.dayanim, 0.5, e.buyu);
        break;
      }
      case 'skr': { // sandık kırıldı: içindekiler yere düşer
        const s = m.x + ',' + m.y + ',' + m.z;
        const d = o.dunya.sandiklar.get(s) || o.koyler.sandikGanimeti(m.x, m.y, m.z);
        this.sandikKirildi(s);
        o.dunya.sandiklar.delete(s);
        for (const e of d) if (e) o.dusenler.birak(e.id, e.adet, m.x + 0.5, m.y + 0.5, m.z + 0.5, 0, 0, 0, e.dayanim, 0.5, e.buyu);
        break;
      }
      case 'tk': if (m.tur === 'sandal' || m.tur === 'yelkenli') o.tekneler.ekle(m.tur, m.p[0], m.p[1], m.p[2], m.y); break;
      case 'tb': {  // tekneye binme isteği
        const t = this.bul(o.tekneler.liste, m.i);
        const ok = !!t && !t.binen && o.tekneler.binilen !== t;
        if (ok) { t.binen = c.id; t.hedef = [t.p.x, t.p.y, t.p.z, t.yaw, 0]; }
        k.gonder({ t: 'tb', i: m.i, ok: ok ? 1 : 0 });
        break;
      }
      case 'ti': {  // tekneden inme
        const t = this.bul(o.tekneler.liste, m.i);
        if (t && t.binen === c.id) { t.binen = null; t.hedef = null; t.p.set(m.p[0], m.p[1], m.p[2]); t.yaw = m.p[3]; t.hiz = 0; t.vy = 0; }
        break;
      }
      case 'tv': { const t = this.bul(o.tekneler.liste, m.i); if (t && !t.binen && o.tekneler.binilen !== t) o.tekneler.vur(t); break; }
      case 'ky': if (m.v && typeof m.v === 'object') this.kayitlar[c.ad.toLocaleLowerCase('tr')] = m.v; break;
      case 'fs': {   // 0.23.0: özel mesaj: yalnızca alıcıya (sunucu oyuncusuysa sunucuya) iletilir
        const s = String(m.m || '').trim().slice(0, 200), h = String(m.h || '').toLocaleLowerCase('tr');
        if (!s) return;
        if (h === this.ad.toLocaleLowerCase('tr')) { this.arayuz.sohbet(`${c.ad} → size`, s, c.renk); c.k.gonder({ t: 'sh', a: `Siz → ${this.ad}`, r: c.renk, m: s }); break; }
        const hedef = [...this.istemciler.values()].find(x => x.ad.toLocaleLowerCase('tr') === h);
        if (hedef) { hedef.k.gonder({ t: 'sh', a: `${c.ad} → size`, r: c.renk, m: s }); c.k.gonder({ t: 'sh', a: `Siz → ${hedef.ad}`, r: c.renk, m: s }); }
        else c.k.gonder({ t: 'sh', s: `"${m.h}" adlı oyuncu bulunamadı.` });
        break;
      }
      case 'sh': {
        const s = String(m.m || '').trim().slice(0, 200);
        if (!s) return;
        this.yay({ t: 'sh', a: c.ad, r: c.renk, m: s });
        this.arayuz.sohbet(c.ad, s, c.renk);
        break;
      }
      case 'ayril': k.kapat(); break;
    }
  }

  /* ---------- Sunucu oyuncusunun işlemleri ---------- */
  sandikKilitle(s) { const sahip = this.kilit.get(s); if (sahip != null && sahip !== 'yerel') return false; this.kilit.set(s, 'yerel'); return true; }
  sandikBirak(s) { if (this.kilit.get(s) === 'yerel') this.kilit.delete(s); }
  /* Kırılan sandığı açık tutan oyuncunun penceresi kapatılır */
  sandikKirildi(s) {
    const sahip = this.kilit.get(s);
    this.kilit.delete(s);
    if (sahip === 'yerel') this.arayuz.sandikKapat();
    else if (sahip != null) { const c = this.istemciler.get(sahip); if (c) c.k.gonder({ t: 'skz', k: s }); }
  }
  /* Uzak oyuncunun bir canlıya vurması / öldürmesi: görev ve itibar o oyuncuda işlenir */
  vurusOlayi(w, c) { if (w.tur.koylu && w.koy) c.k.gonder({ t: 'kv', k: w.koy.id }); }
  olumOlayi(w, c, op) {
    c.k.gonder({ t: 'ol', tur: w.turAd, k: w.tur.koylu && w.koy ? w.koy.id : null, ok: op && op.ok ? 1 : 0 });
    if (w.tur.koylu && w.koy) this.oyun.koyler.koyluOldu(w, true);
  }
  sohbetGonder(s) { this.yay({ t: 'sh', a: this.ad, r: 0, m: s }); this.arayuz.sohbet(this.ad, s, 0); }
  /* 0.23.0: sunucu oyuncusunun özel mesajı ve oyuncu atma */
  fisilda(ad, s) {
    const h = [...this.istemciler.values()].find(x => x.ad.toLocaleLowerCase('tr') === String(ad).toLocaleLowerCase('tr'));
    if (!h) { this.arayuz.sohbet(null, `"${ad}" adlı oyuncu bulunamadı.`); return; }
    h.k.gonder({ t: 'sh', a: `${this.ad} → size`, r: 0, m: s }); this.arayuz.sohbet(`Siz → ${h.ad}`, s, 0);
  }
  at(ad) {
    const h = [...this.istemciler.values()].find(x => x.ad.toLocaleLowerCase('tr') === String(ad).toLocaleLowerCase('tr'));
    if (!h) return false;
    h.k.gonder({ t: 'atildi', s: 'Sunucu sizi oyundan çıkardı.' }); setTimeout(() => h.k.kapat(), 400);
    return true;
  }

  /* Canlılar için her oyuncunun bağlamı (ilk öğe sunucu oyuncusu) */
  ctxler(ctx) {
    const l = [ctx];
    for (const c of this.istemciler.values()) {
      if (!c.durum) continue;
      if (!c.ctx) c.ctx = { ad: c.ad, oyuncu: { konum: c.konum }, oyuncuyaVur: (n, v, kaynak) => this.vur(c, n, v, kaynak), okTopla: () => { c.k.gonder({ t: 'ver', id: 287, n: 1 }); return true; } };
      Object.assign(c.ctx, { oyuncuOlu: c.olu, oyuncuSuda: c.suda, gunIsigi: ctx.gunIsigi, gunSayisi: ctx.gunSayisi, isik: ctx.isik, firtina: ctx.firtina, yagmur: ctx.yagmur, kanliAy: ctx.kanliAy, zorlukCanavar: ctx.zorlukCanavar, eldeki: c.durum[5] | 0 });
      l.push(c.ctx);
    }
    ctx.oyuncular = l;
    return ctx;
  }
  vur(c, n, v, kaynak) { const k = kaynak || v.konum; if (v.kanli) n += 1; c.k.gonder({ t: 'h', n, s: v.turAd, k: [r2(k.x), r2(k.z)], a: v.tur.agu ? 1 : 0 }); }
  /* Deneyim: uzak oyuncunun beslediği hayvan yavruladığında */
  xpVer(c, n) { c.k.gonder({ t: 'xp', n }); }
  /* Yıldırım: tüm oyunculara gösterilir, yakındaki oyuncular hasar alır */
  simsek(x, y, z) {
    this.yay({ t: 'sim', p: [r2(x), r2(y), r2(z)] });
    for (const c of this.istemciler.values()) if (c.durum && !c.olu && (c.konum.x - x) ** 2 + (c.konum.y - y) ** 2 + (c.konum.z - z) ** 2 < 3.5 * 3.5) c.k.gonder({ t: 'h', n: 6, s: 'yildirim', k: [r2(x), r2(z)], a: 0 });
  }

  /* ---------- Döngü ---------- */
  guncelle(dt) {
    const o = this.oyun, simdi = performance.now();
    for (const c of [...this.istemciler.values()]) if (simdi - c.k.sonAlim > ZAMAN_ASIMI) c.k.kapat();
    o.dunya.ekMerkezler = this.konumlar().map(p => [Math.floor(p.x / PB), Math.floor(p.z / PB)]);
    this.uzak.guncelle(dt, o.gunIsigi);
    this.anlik -= dt;
    if (this.anlik <= 0) { this.anlik = ANLIK; this.anlikGonder(); }
    this.uykuKontrol();
  }

  anlikGonder() {
    const o = this.oyun;
    if (!this.istemciler.size) return;
    const ben = [0, ...durumDizisi(o)];
    const digerleri = [...this.istemciler.values()].filter(c => c.durum).map(c => [c.id, ...c.durum]);
    for (const c of this.istemciler.values()) {
      const v = [], bilinen = new Set(), cx = c.konum.x, cz = c.konum.z;
      for (const w of o.varliklar.liste) {
        const dx = w.konum.x - cx, dz = w.konum.z - cz;
        if (dx * dx + dz * dz > CANLI_MENZIL * CANLI_MENZIL) continue;
        let b = 0;
        if (w.olu) b |= 1; if (w.hasarZaman > 0) b |= 2; if (w.yaniyor) b |= 4; if (w.nisan) b |= 8; if (!w.m.kok.visible) b |= 16; if (!w.yerde || w.kacZaman > 0) b |= 32;
        if (w.yavru > 0) b |= 64; if (w.ask > 0) b |= 128; if (w.dinlen > 0) b |= 256; if (w.anim) b |= (w.anim & 7) << 9;
        if (w.oturuyor) b |= 4096; if (w.sahip) b |= 8192; if (w.eyer) b |= 16384; if (w.sahlan > 0) b |= 32768; if (w.kirkildi) b |= 65536; if (w.kanli) b |= 131072;
        const a = [w.id, r2(w.konum.x), r2(w.konum.y), r2(w.konum.z), r3(w.yaw), b, Math.max(0, Math.ceil(w.can))];
        if (!c.bilinen.has(w.id)) a.push(w.tur.koylu && w.koylu ? [w.turAd, w.koylu.meslek, w.koy.id, w.koylu.idx] : w.renk ? [w.turAd, 0, 0, 0, w.renk] : [w.turAd]);
        bilinen.add(w.id);
        v.push(a);
      }
      c.bilinen = bilinen;
      const t = [];
      for (const b of o.tekneler.liste) if ((b.p.x - cx) ** 2 + (b.p.z - cz) ** 2 < TEKNE_MENZIL * TEKNE_MENZIL) t.push([b.ni, r2(b.p.x), r2(b.p.y), r2(b.p.z), r3(b.yaw), r2(b.hiz)]);
      c.k.gonder({ t: 's', z: Math.round(o.zaman * 1e6) / 1e6, g: o.gun, o: [ben, ...digerleri.filter(a => a[0] !== c.id)], v, b: t, h: o.hava ? o.hava.durum : 'acik' });
    }
  }

  /* Gece tüm (canlı) oyuncular yataktaysa sabah olur */
  uykuKontrol() {
    const o = this.oyun;
    const gece = (o.zaman > 0.52 && o.zaman < 0.97) || (o.hava && o.hava.firtina);
    if (o.uyku > 0 || !gece) { this.uykuSay = -1; return; }
    let n = 0, t = 0;
    if (!o.hayatta.olu) { t++; if (o.yatakta) n++; }
    for (const c of this.istemciler.values()) if (c.durum && !c.olu) { t++; if (c.yatakta) n++; }
    if (!n) { this.uykuSay = -1; return; }
    if (n === t) { this.uykuSay = -1; this.yay({ t: 'uy' }); this.arayuz.uykuBaslat(); return; }
    const anahtar = n * 100 + t;
    if (anahtar === this.uykuSay) return;
    this.uykuSay = anahtar;
    for (const c of this.istemciler.values()) if (c.yatakta) c.k.gonder({ t: 'ub', n, a: t });
    if (o.yatakta) this.arayuz.bildirim(`Uyuyan oyuncular: ${n}/${t}. Gece, herkes yattığında atlanır.`);
  }

  kapat() {
    if (this.kapali) return;
    this.kapali = true;
    this.yay({ t: 'kapandi' });
    const kanallar = [...this.istemciler.values()].map(c => c.k);
    setTimeout(() => { for (const k of kanallar) k.kapat(); this.ag.kapat(); }, 400);
    const o = this.oyun;
    if (this.dinle) { const i = o.dunya.dinleyiciler.indexOf(this.dinle); if (i >= 0) o.dunya.dinleyiciler.splice(i, 1); }
    o.dusenler.ag = null; o.varliklar.ag = null; o.varliklar.dinleyici = null; o.tekneler.ag = null;
    o.dunya.ekMerkezler = [];
    for (const t of o.tekneler.liste) { t.binen = null; t.hedef = null; }
    if (this.uzak) this.uzak.temizle();
    this.istemciler.clear();
  }
}
