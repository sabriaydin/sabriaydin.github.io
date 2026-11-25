/* HungerMan - etkileşim: bakılan bloğu bulma, kazma/kırma, blok koyma, yeme, toplama */
import { THREE } from '../grafik/sahne.js';
import { buyuSeviye, BLOKLAR, ESYALAR, KATI, SIVI, BITKI, CIZIM, C_YOK, C_KUP, OPAK, ETKILER, EKIN_SONRAKI, OCAK_ID, ISITICI_ID, SU_SEVIYE, YAPI_ID, VAZO_BOS, YATAK, ESYA37, ESYA39, ESYA45, OKLAR } from '../bloklar.js';
import { COKLU, cokluHucreler, cokluCapaKonumu, cokluYerel } from '../coklu.js';
import { SEKIL, YONLER, hucreKutulari, kutuIsin, sinirKutusu } from '../sekiller.js';
import { ezgiTuru } from './mekanik.js';
import { CIHAZ, cihazHucreleri, kokKonumu, pervaneHucreleri, dondurXZ } from '../cihazlar.js';
import { KABLO, portlar, portBilgi, PORT_AD, kabloUcu, mesafe, yolUzunlugu, kabloMaliyeti } from './kablolar.js';
import { YapiPlani } from './yapi-plani.js';
import { PY } from '../sabitler.js';

const hexRgb = h => { h = (h || '#ffffff').replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255); };
const ZEMIN_MEK = { kol: 1, dugme: 1, plaka: 1, tel: 1, ters: 1, gecik: 1 };   // 0.17.0: altındaki blok kırılınca düşen mekanik bloklar

const ERISIM = 5;
/* 0.45.0: silah profilleri: b bekleme (sn), erim (blok), itme, supur (kılıç: yandakilere vurulan hasarın payı), alan (çekiç: hedefin
   çevresine), sirt (hançer: arkadan ya da fark edilmeden vurunca hasar çarpanı), durak (isabette kısa zaman yavaşlaması, sn) */
export const SILAHLAR = {
  el: { ad: 'El', b: 0.4, erim: 3.2, itme: 0.8, durak: 0.02 },
  kilic: { ad: 'Kılıç', b: 0.55, erim: 3.6, itme: 1, supur: 0.35, durak: 0.035 },
  hancer: { ad: 'Hançer', b: 0.38, erim: 3.0, itme: 0.6, sirt: 2, durak: 0.025 },
  mizrak: { ad: 'Mızrak', b: 0.85, erim: 4.7, itme: 1.3, durak: 0.045 },
  cekic: { ad: 'Savaş Çekici', b: 1.15, erim: 3.4, itme: 2.1, alan: 0.5, durak: 0.08 },
  balta: { ad: 'Balta', b: 0.8, erim: 3.4, itme: 1.3, durak: 0.06 },
  kazma: { ad: 'Kazma', b: 0.65, erim: 3.5, itme: 0.9, durak: 0.03 },
  kurek: { ad: 'Kürek', b: 0.6, erim: 3.5, itme: 0.9, durak: 0.03 }
};
export function silahProfili(id) {
  const e = ESYALAR[id];
  if (!e || e.tur !== 'alet' || !e.alet) return SILAHLAR.el;
  if (id === ESYA37.hancer) return SILAHLAR.hancer;
  if (id === ESYA37.mizrak) return SILAHLAR.mizrak;
  if (id === ESYA37.cekic) return SILAHLAR.cekic;
  return SILAHLAR[e.alet.tur] || SILAHLAR.el;
}
const TOPRAK = new Set([3, 4, 45, 137, 138]);   // fidan ve bitki dikilebilen zeminler
const TARLA = new Set([137, 138]);   // 0.38.4: tohum yalnızca çapalanmış tarlaya ekilir
/* 0.34.0: ekinin tohumu (evre 0 bloğunu eken eşya) */
let TOHUMLAR = null;
const tohumBul = taban => { if (!TOHUMLAR) { TOHUMLAR = new Map(); for (const e of Object.values(ESYALAR)) if (e && e.ekin && !TOHUMLAR.has(e.ekin)) TOHUMLAR.set(e.ekin, e); } return TOHUMLAR.get(taban); };
/* 0.34.0: kompost kutusuna konabilen bitkisel atıklar */
const organikMi = id => { const e = ESYALAR[id], b = BLOKLAR[id]; return !!(e && (e.ekin || [363, 365, 367, 369, 370, 374, 376, 378, 379, 380, 266, 291, 328, 329, 267, 559].includes(id) || (b && (b.bitki || b.kesik) && b.ses === 'bitki'))); };

export class Etkilesim {
  constructor(o) {
    Object.assign(this, o); // dunya, oyuncu, envanter, hayatta, dusenler, ses, sahne, arayuz, varliklar, olta, tekneler
    this.hedef = null;
    this.ilerleme = 0;
    this.kirilanAnahtar = '';
    this.sagBekleme = 0;
    this.solBekleme = 0;
    this.vurus = 0;
    this.kazmaSesSayac = 0;
    this.donus = 0;   // 0.25.0: R tuşuyla eklenen yön (0-3)
    this.kablo = null;   // 0.26.0: çekilmekte olan kablo { k, i: başlangıç noktası, tur, n: ara noktalar, s: sarkmalar, sark: çekilen parçanın sarkması }
    this.shift = false;  // 0.27.0: Shift basılı mı (düz hizalama)
    this.saldiriBekleme = 0; this.germe = 0; this.okUyari = 0; this.hedefCanli = null; this.hedefTekne = null; this.sagOnceki = false;
    this.plan = new YapiPlani(this);   // 0.31.0
  }

  /* Işın izleme (DDA) */
  isin(goz, yon) {
    let x = Math.floor(goz.x), y = Math.floor(goz.y), z = Math.floor(goz.z);
    const sx = Math.sign(yon.x), sy = Math.sign(yon.y), sz = Math.sign(yon.z);
    const tdx = Math.abs(1 / yon.x), tdy = Math.abs(1 / yon.y), tdz = Math.abs(1 / yon.z);
    let tx = (sx > 0 ? x + 1 - goz.x : goz.x - x) * tdx, ty = (sy > 0 ? y + 1 - goz.y : goz.y - y) * tdy, tz = (sz > 0 ? z + 1 - goz.z : goz.z - z) * tdz;
    let nx = 0, ny = 0, nz = 0, t = 0;
    const erisim = this.erisim || ERISIM;   // erisim: geliştirici modunda uzatılabilir
    for (let i = 0; i < 160 && t <= erisim; i++) {
      const id = this.dunya.blok(x, y, z);
      if (id && CIZIM[id] !== C_YOK && !(SIVI[id] && !BITKI[id])) {
        /* Biçimli bloklar: kutularına isabet aranır (açık kapının boşluğundan geçilebilir) */
        if (SEKIL[id]) {
          const k = hucreKutulari(this.dunya, x, y, z, id), r = kutuIsin(goz, yon, x, y, z, k, erisim);
          if (r) return { x, y, z, id, nx: r.nx, ny: r.ny, nz: r.nz, t: r.t, py: goz.y + yon.y * r.t - y, kutu: BLOKLAR[id].cihaz ? this.cihazKutusu(BLOKLAR[id], x, y, z) : sinirKutusu(k) };
        } else if (!BITKI[id] && !(BLOKLAR[id].mesale && CIZIM[id] !== C_KUP) || this.bitkiIsabet(goz, yon, x, y, z)) return { x, y, z, id, nx, ny, nz, t, py: goz.y + yon.y * t - y };
      }
      if (tx < ty && tx < tz) { x += sx; t = tx; tx += tdx; nx = -sx; ny = 0; nz = 0; }
      else if (ty < tz) { y += sy; t = ty; ty += tdy; nx = 0; ny = -sy; nz = 0; }
      else { z += sz; t = tz; tz += tdz; nx = 0; ny = 0; nz = -sz; }
    }
    return null;
  }
  /* Bitkiler hücrenin ortasındaki daha küçük bir kutu olarak seçilir */
  bitkiIsabet(o, d, x, y, z) {
    const a = [x + 0.2, y, z + 0.2], b = [x + 0.8, y + 0.85, z + 0.8];
    let t0 = 0, t1 = this.erisim || ERISIM;
    const oo = [o.x, o.y, o.z], dd = [d.x, d.y, d.z];
    for (let i = 0; i < 3; i++) {
      if (Math.abs(dd[i]) < 1e-9) { if (oo[i] < a[i] || oo[i] > b[i]) return false; continue; }
      let ta = (a[i] - oo[i]) / dd[i], tb = (b[i] - oo[i]) / dd[i];
      if (ta > tb) [ta, tb] = [tb, ta];
      t0 = Math.max(t0, ta); t1 = Math.min(t1, tb);
      if (t0 > t1) return false;
    }
    return true;
  }

  olay(k) { if (this.arayuz.olay) this.arayuz.olay(k); }
  istat(k, n = 1) { if (this.arayuz.istat) this.arayuz.istat(k, n); }   // 0.22.0
  /* E tuşu (0.15.1): hedefteki nesneyle etkileşim (kapı, sandık, istasyon, yatak, köylü, tekne). Sağ tık da aynı işleri yapar. */
  etkiles() {
    if (this.tekneler.binilen) return false;
    /* 0.16.0: attan inme, oturaktan kalkma */
    if (this.binek && this.binek.biniyor) { this.binek.in(); return true; }
    if (this.binek && this.binek.oturak) { this.binek.kalk(); return true; }
    if (this.hedefCanli && this.varliklar.etkilesimVar(this.hedefCanli, this.envanter.seciliId())) { this.canliEtkiles(this.hedefCanli); return true; }
    if (this.hedefTekne) {
      if (this.tekneler.bin(this.hedefTekne, this.oyuncu) !== false) { this.olay('tekne'); this.arayuz.bildirim(`${this.hedefTekne.T.ad}: W/S hız, A/D dümen. İnmek için C tuşuna basınız.`, 'tekne'); }
      return true;
    }
    if (this.hedefCanli && this.hedefCanli.tur.koylu) { this.arayuz.koyluAc(this.hedefCanli); return true; }
    if (this.hedefCanli && this.hedefCanli.tur.gezgin && this.arayuz.gezginAc) { this.arayuz.gezginAc(this.hedefCanli); return true; }   // 0.51.0
    const h = this.hedef;
    if (!h) return false;
    const b = BLOKLAR[h.id];
    if (b.oturak && this.binek) return this.binek.otur(h.x, h.y, h.z);
    if (b.firinKap && !this.shift) { this.arayuz.sandikAc(h.x, h.y, h.z); return true; }   // 0.33.0
    if (b.istasyon) { this.arayuz.envanterAc(b.istasyon); return true; }
    if (b.sandik || b.firinKap) { const [kx, ky, kz] = this.kokHucre(h.x, h.y, h.z, b); this.arayuz.sandikAc(kx, ky, kz); return true; }   // 0.33.0: fırın ve kamp ateşi haznesi; 0.37.0: çok bloklu dolapta kök hücre
    if (b.yatak) { this.arayuz.uyu(h); return true; }
    if (this.ac(h)) { this.vurus = 0.01; return true; }
    return false;
  }
  /* Evcil hayvan / at etkileşimi: tek oyunculuda ve sunucuda burada, istemcide sunucuda işlenir */
  canliEtkiles(v) {
    const eldeki = this.envanter.seciliId();
    if (this.varliklar.ayna) { if (this.agCanli) this.agCanli(v, eldeki); return; }
    this.canliSonuc(this.varliklar.canliEtkilesim(v, eldeki, this.oyuncuAdi), v);
  }
  canliSonuc(S, v) {
    if (S.tuket) { this.envanter.seciliAzalt(1); this.ses.ye(); this.vurus = 0.01; }
    /* 0.21.0: eldeki bir eşya başka bir eşyaya dönüşür (kova -> süt kovası); alet yıpranır */
    if (S.degistir) { this.envanter.seciliAzalt(1); this.envanter.ekle(S.degistir, 1); this.vurus = 0.01; }
    if (S.yipran) { this.aletYipran(); this.vurus = 0.01; }
    if (S.ses === 'sut') this.ses.sut(); else if (S.ses === 'kirp') this.ses.kirp();
    if (S.mesaj) this.arayuz.bildirim(S.mesaj);
    if (S.olay) this.olay(S.olay);
    if (S.bin && v && this.binek) { this.binek.bin(v); this.olay('binici'); }
  }
  aletBilgi() {
    const s = this.envanter.seciliYuva();
    const e = s && ESYALAR[s.id];
    return e && e.tur === 'alet' ? e.alet : null;
  }
  kirmaSuresi(id) {
    const b = BLOKLAR[id];
    if (!b || b.sertlik < 0) return Infinity;
    if (b.sertlik === 0 || this.aninda) return 0;   // aninda: geliştirici modunda anında kırma
    const a = this.aletBilgi();
    const dogru = a && b.alet === a.tur;
    const alabilir = b.seviye === 0 || (dogru && a.seviye >= b.seviye);
    let hiz = dogru ? a.hiz : 1;
    if (a && a.tur === 'kilic' && b.ses === 'bitki') hiz = 2;
    /* Verimlilik büyüsü: doğru aletle kazma hızı seviye başına %30 artar */
    if (dogru) hiz *= 1 + 0.3 * buyuSeviye(this.envanter.seciliYuva(), 'verim');
    if (this.hayatta.etki('kazmaHiz')) hiz *= 1.35;   // 0.36.0: Maden Gücü
    let s = b.sertlik * (alabilir ? 1.5 : 5) / hiz;
    if (this.oyuncu.basSuda) s *= 3;
    else if (!this.oyuncu.yerde && !this.oyuncu.suda) s *= 2;
    return s;
  }
  alabilir(id) {
    const b = BLOKLAR[id], a = this.aletBilgi();
    return b.seviye === 0 || (a && b.alet === a.tur && a.seviye >= b.seviye);
  }

  guncelle(dt, g) {
    const goz = this.oyuncu.gozKonumu(), yon = this.oyuncu.bakisYonu();
    this.hedef = this.isin(goz, yon);
    /* Canlı, bloktan daha yakınsa hedef odur */
    const vb = this.varliklar ? this.varliklar.isin(goz, yon, silahProfili(this.envanter.seciliId()).erim) : null;
    this.hedefCanli = null;
    if (vb && (!this.hedef || vb.t < this.hedef.t)) { this.hedefCanli = vb.v; this.hedef = null; }
    /* Tekne: en yakın hedefse binme ve kırma */
    const tb = this.tekneler ? this.tekneler.isin(goz, yon, 4.5) : null;
    this.hedefTekne = null;
    if (tb && (!this.hedef || tb.t < this.hedef.t) && (!this.hedefCanli || tb.t < vb.t)) { this.hedefTekne = tb.tekne; this.hedef = null; this.hedefCanli = null; }
    if (this.izleyici) { this.hedefCanli = null; this.hedefTekne = null; this.ilerleme = 0; this.germe = 0; return; }   // 0.23.0: Hardcore izleyici kipi
    const sagYeni = g.sag && !this.sagOnceki, solYeni = g.sol && !this.solOnceki;
    this.sagOnceki = g.sag; this.solOnceki = g.sol;
    this.sagBekleme -= dt; this.solBekleme -= dt; this.saldiriBekleme -= dt; this.okUyari -= dt;
    if (this.vurus > 0) { this.vurus += dt * 3.2; if (this.vurus >= 1) this.vurus = 0; }
    /* 0.29.0: elde kablo varken Rust'taki gibi: sol tık yerleştirir (başla, ara nokta, bağla), sağ tık son işlemi geri alır; blok kırılmaz */
    if (ESYALAR[this.envanter.seciliId()] && ESYALAR[this.envanter.seciliId()].tur === 'kablo') {
      this.ilerleme = 0; this.kirilanAnahtar = ''; this.germe = 0;
      if (solYeni) { if (this.kabloSol(this.hedef, g)) this.vurus = 0.01; }
      else if (sagYeni) { if (this.kabloSag(this.hedef, g)) this.vurus = 0.01; }
      this.sahne.secimGoster(null, 0);
      return;
    }

    const eldeki = this.envanter.seciliId();
    if (this.hedefTekne) {
      this.ilerleme = 0; this.kirilanAnahtar = ''; this.germe = 0;
      if (g.sag && this.sagBekleme <= 0 && !this.tekneler.binilen) {
        this.sagBekleme = 0.4;
        if (this.olta && this.olta.aktif) this.olta.kaldir();
        if (this.tekneler.bin(this.hedefTekne, this.oyuncu) !== false) { this.olay('tekne'); this.arayuz.bildirim(`${this.hedefTekne.T.ad}: W/S hız, A/D dümen. İnmek için C tuşuna basınız.`, 'tekne'); }
      } else if (g.sol && this.saldiriBekleme <= 0) { this.saldiriBekleme = 0.3; this.vurus = 0.01; this.tekneler.vur(this.hedefTekne); }
      this.sahne.secimGoster(null, 0);
      return;
    }
    /* 0.38.1: çakmakla canlı tutuşturulur (köylüler ve ateşe dayanıklılar hariç) */
    if (g.sag && this.hedefCanli && this.sagBekleme <= 0 && eldeki === 473 && !this.hedefCanli.tur.koylu) {
      this.sagBekleme = 0.6; this.germe = 0;
      const v = this.hedefCanli;
      this.cakmakSes();
      if (v.tur.atesBagisik) this.arayuz.bildirim(`${v.tur.ad} ateşe dayanıklıdır.`);
      else { v.atesSure = 6; v.ofkeli = !!v.tur.dusman || v.ofkeli; this.dusenler.renkliParcacik([1, 0.55, 0.15], v.konum.x, v.konum.y + v.tur.boy * 0.6, v.konum.z, 12); this.cakmakYipran(); }
      this.sahne.secimGoster(null, 0);
      return;
    }
    /* 0.16.0: evcil hayvan ve at etkileşimi (evcilleştirme, oturtma, eyer, binme) */
    if (g.sag && this.hedefCanli && this.sagBekleme <= 0 && this.varliklar.etkilesimVar(this.hedefCanli, eldeki)) {
      this.sagBekleme = 0.4; this.germe = 0;
      this.canliEtkiles(this.hedefCanli);
      this.sahne.secimGoster(null, 0);
      return;
    }
    /* Hayvan besleme: elindeki yemi seven hayvana sağ tık */
    if (g.sag && this.hedefCanli && this.sagBekleme <= 0 && this.varliklar.yemSever(this.hedefCanli, eldeki)) {
      this.sagBekleme = 0.4; this.germe = 0;
      const sonuc = this.varliklar.besle(this.hedefCanli, null);
      if (sonuc) { this.envanter.seciliAzalt(1); this.ses.ye(); this.vurus = 0.01; }
      else this.arayuz.bildirim('Bu hayvan şu anda beslenemez.');
      this.sahne.secimGoster(null, 0);
      return;
    }
    /* Köylü ile konuşma */
    if (g.sag && this.hedefCanli && (this.hedefCanli.tur.koylu || this.hedefCanli.tur.gezgin) && this.sagBekleme <= 0) {
      this.sagBekleme = 0.4; this.germe = 0;
      if (this.hedefCanli.tur.gezgin) { if (this.arayuz.gezginAc) this.arayuz.gezginAc(this.hedefCanli); } else this.arayuz.koyluAc(this.hedefCanli);
      this.sahne.secimGoster(null, 0);
      return;
    }
    /* Yay: sağ tık basılı tutulunca gerilir, bırakılınca ok atılır */
    const yayMi = !!(ESYALAR[eldeki] && ESYALAR[eldeki].tur === 'yay');
    if (yayMi) {
      if (g.sag) {
        if (this.okVar()) { if (this.germe === 0) this.ses.yayGer(); this.germe = Math.min(1, this.germe + dt); }
        else if (this.okUyari <= 0) { this.okUyari = 2; this.arayuz.bildirim('Atılacak ok mevcut değil.'); }
      } else if (this.germe > 0) { if (this.germe > 0.15) this.okAt(goz, yon); this.germe = 0; }
    } else this.germe = 0;

    /* Saldırı */
    const h = this.hedef;
    if (g.sol && this.hedefCanli) {
      this.ilerleme = 0; this.kirilanAnahtar = '';
      if (this.saldiriBekleme <= 0 && !this.savunma) { const S = silahProfili(this.envanter.seciliId()); this.saldir(this.hedefCanli, S); this.saldiriBekleme = S.b; this.saldiriSure = S.b; this.vurus = 0.01; }
    } else if (g.sol && h) {
      /* Kırma */
      const k = h.x + ',' + h.y + ',' + h.z + ',' + h.id;
      if (k !== this.kirilanAnahtar) { this.kirilanAnahtar = k; this.ilerleme = 0; }
      const sure = this.kirmaSuresi(h.id);
      if (sure === 0) { if (this.solBekleme <= 0) { this.kir(h); this.solBekleme = 0.2; } }
      else if (sure !== Infinity) {
        this.ilerleme += dt / sure;
        this.kazmaSesSayac -= dt;
        if (this.kazmaSesSayac <= 0) { this.kazmaSesSayac = 0.26; this.ses.kaz(BLOKLAR[h.id].ses); if (Math.random() < 0.5) this.dusenler.parcacik(h.id, h.x, h.y, h.z, 3); }
        if (this.ilerleme >= 1) { this.kir(h); this.ilerleme = 0; this.kirilanAnahtar = ''; this.solBekleme = 0.12; }
      }
      if (this.vurus === 0) this.vurus = 0.01;
    } else { this.ilerleme = 0; this.kirilanAnahtar = ''; if (g.sol && this.vurus === 0) this.vurus = 0.01; }

    /* Olta: her sağ tık bir kez atar ya da çeker (istasyon ve sandıklar yine açılır) */
    const eldeOlta = ESYALAR[eldeki] && ESYALAR[eldeki].tur === 'olta';
    const blokEtkin = h && (BLOKLAR[h.id].istasyon || BLOKLAR[h.id].sandik || BLOKLAR[h.id].yatak) && !g.egil;
    if (eldeOlta && !blokEtkin) {
      if (sagYeni && this.olta && this.olta.kullan()) this.vurus = 0.01;
    }
    /* 0.45.0: savunma: elde kılıç, hançer, mızrak, çekiç ya da balta varken sağ tık basılı tutulur (etkileşimli bloğa bakılmıyorsa).
       Önden gelen yakın ve ok saldırılarının hasarı %65 azalır; saldırıdan hemen önce (0,3 sn içinde) başlayan savunma saldırıyı tamamen
       savuşturur ve saldıranı sersemletir. Savunurken yavaş yürünür, koşulamaz ve saldırılamaz. */
    else if (g.sag && !yayMi && this.savunma) { /* savunma sürüyor */ }
    /* Kullanma / koyma (kullanılacak bir şey yoksa ve elde silah varsa savunmaya geçilir) */
    else if (g.sag && !yayMi && this.sagBekleme <= 0) {
      this.acildi = false;
      if (this.kullan(g)) { this.sagBekleme = this.acildi ? 0.45 : 0.22; this.vurus = 0.01; }
      else { this.sagBekleme = 0.05; if (sagYeni && this.savunabilir(eldeki)) { this.savunma = true; this.savunmaBas = performance.now(); } }
    }
    if (!g.sag || yayMi || !this.savunabilir(eldeki)) this.savunma = false;
    this.oyuncu.savunma = this.savunma;
    this.sahne.secimGoster(this.hedef, this.ilerleme);
  }
  savunabilir(id) {
    const S = silahProfili(id);
    return !(S === SILAHLAR.el || S === SILAHLAR.kazma || S === SILAHLAR.kurek);
  }

  saldir(v, S = silahProfili(this.envanter.seciliId())) {
    const a = this.aletBilgi();
    let hasar = a && a.tur !== 'yay' ? a.hasar : 1;
    const es = this.envanter.seciliYuva();
    /* Keskinlik: seviye başına +1 hasar (yarım kalp) */
    if (a && a.tur !== 'yay') hasar += buyuSeviye(es, 'keskin');
    if (this.hayatta.etki('guc')) hasar *= 1.5;
    const o = this.oyuncu;
    const kritik = !o.yerde && !o.suda && o.hiz.y < 0;
    if (kritik) { hasar *= 1.5; this.dusenler.renkliParcacik([1, 0.9, 0.5], v.konum.x, v.konum.y + v.tur.boy * 0.7, v.konum.z, 10); }
    /* 0.45.0: hançerle arkadan ya da fark edilmeden vuruş */
    let sirttan = false;
    if (S.sirt && !v.tur.boss) {
      const ax = o.konum.x - v.konum.x, az = o.konum.z - v.konum.z, bak = Math.atan2(-ax, -az) - v.yaw, f = Math.abs(Math.atan2(Math.sin(bak), Math.cos(bak)));
      if (!(v.farkinda > 0) || f > 2.1) { sirttan = true; hasar *= S.sirt; this.dusenler.renkliParcacik([0.85, 0.15, 0.15], v.konum.x, v.konum.y + v.tur.boy * 0.6, v.konum.z, 12); }
    }
    /* Savurma: geri itme seviye başına %60 artar; Yağma: ganimet artar */
    const itme = (o.kosuyor ? 1.5 : 1) * (1 + 0.6 * buyuSeviye(es, 'savurma')) * S.itme;
    /* Güneş Kılıcı vurulan canlıyı tutuşturur */
    if (this.varliklar.hasarVer(v, hasar, o.konum, { itme, oyuncu: true, yagma: buyuSeviye(es, 'yagma') + (this.hayatta.etki('sans') ? 1 : 0), ates: !!(es && (es.id === 458 || (ESYALAR[es.id] && ESYALAR[es.id].yakar))) })) {
      this.ses.vurus();
      if (kritik || sirttan || S.alan) this.ses.cal('vurus', 1.1, S.alan ? 0.6 : 0.8);   // 0.45.0: ağır ve kritik vuruş daha tok duyulur
      if (a && a.tur !== 'yay' && this.envanter.aletYipran(a.tur === 'kilic' ? 1 : 2)) { this.ses.aletKirildi(); this.arayuz.bildirim('Aletiniz kırıldı.'); }
      this.hayatta.yor(0.1);
      /* 0.45.0: isabet hissi: kısa zaman yavaşlaması (ağır ve kritik vuruşta daha uzun), kıvılcım */
      this.durak = Math.max(this.durak || 0, S.durak * (kritik || sirttan ? 1.8 : 1));
      this.dusenler.renkliParcacik(kritik ? [1, 0.85, 0.4] : [0.95, 0.95, 0.9], v.konum.x, v.konum.y + v.tur.boy * 0.6, v.konum.z, kritik ? 6 : 3);
      if (this.arayuz.hasarSayisi) this.arayuz.hasarSayisi(v.konum.x, v.konum.y + v.tur.boy + 0.2, v.konum.z, hasar, kritik || sirttan);
      /* Kılıç süpürmesi (yerde, koşmuyorken) ve çekiç darbesi yakındaki diğer canlılara da vurur */
      const pay = S.supur && o.yerde && !o.kosuyor ? S.supur : S.alan || 0;
      if (pay) for (const w of this.varliklar.liste) {
        if (w === v || w.olu || w.sahip || w.tur.koylu || (!w.tur.dusman && !w.ofkeli)) continue;
        if (w.konum.distanceToSquared(v.konum) > (S.alan ? 2.6 : 1.9) ** 2 || w.konum.distanceToSquared(o.konum) > 16) continue;
        this.varliklar.hasarVer(w, Math.max(1, Math.round(hasar * pay)), o.konum, { itme: itme * 0.7, oyuncu: true });
      }
      if (S.alan) { this.dusenler.renkliParcacik([0.55, 0.5, 0.45], v.konum.x, v.konum.y + 0.1, v.konum.z, 14); this.oyuncu.kamHiz -= 0.9; }
    }
  }

  /* 0.45.0: atılacak ok: hızlı erişim çubuğundaki ilk özel ok, yoksa sıradan ok, o da yoksa çantadaki ilk özel ok */
  okSec() {
    const Y = this.envanter.yuvalar;
    for (let i = 0; i < 9; i++) if (Y[i] && Y[i].id !== 287 && OKLAR.includes(Y[i].id)) return Y[i].id;
    if (this.envanter.say(287) > 0) return 287;
    for (const id of OKLAR) if (this.envanter.say(id) > 0) return id;
    return 287;
  }
  okVar() { return OKLAR.some(id => this.envanter.say(id) > 0); }
  okAt(goz, yon) {
    const g = this.germe;
    const p = goz.clone().addScaledVector(yon, 0.5);
    const tam = g >= 1;
    /* Güç büyüsü: ok hasarı seviye başına %25 artar */
    const gb = 1 + 0.25 * buyuSeviye(this.envanter.seciliYuva(), 'guc');
    /* Buz Yayı: oklar vurduğu canlıyı yavaşlatır */
    const okId = this.okSec(), ek = {};
    if (this.envanter.seciliId() === 459) ek.yavas = true;
    if (okId === ESYA45.atesOk) ek.ates = true;
    if (okId === ESYA45.zehirOk) ek.zehir = true;
    if (tam) ek.iz = true;
    this.varliklar.okAt(p, yon.clone().multiplyScalar(8 + 30 * g), (2 + g * 6 + (tam && Math.random() < 0.25 ? 2 : 0)) * gb, false, null, Object.keys(ek).length ? ek : null);
    this.envanter.harca(okId, 1);
    if (this.envanter.aletYipran(1)) { this.ses.aletKirildi(); this.arayuz.bildirim('Yayınız kırıldı.'); }
    this.ses.yayAt();
    this.vurus = 0.01;
  }

  kir(h) {
    const b = BLOKLAR[h.id];
    if (this.solBekleme > 0 && b.sertlik === 0) return;
    /* 0.34.0: tırpan: bitkiye vurulunca çevresindeki olgun ekinler biçilir (tohum varsa yeniden ekilir), otlar temizlenir */
    const ta = this.aletBilgi();
    if (ta && ta.tur === 'tirpan' && BITKI[h.id] && !b.fidan) { this.bic(h, ta.alan || 1); return; }
    if (b.cihaz) { this.cihazKir(h, b); return; }
    if (b.ck) { this.cokluKir(h, b); return; }   // 0.37.0
    const d = this.dunya, r = Math.random;
    const ust = d.blok(h.x, h.y + 1, h.z);
    /* Yan veya üstte su varsa boşluk suyla dolar */
    let yeni = 0;
    /* 0.30.5: su artık akar (dunya/su-akisi.js); açılan boşluğu akış doldurur. Lav akmadığı için lav boşluğu doldurur */
    for (const [dx, dy, dz] of [[0, 1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]]) { const n = d.blok(h.x + dx, h.y + dy, h.z + dz); if (n === 59 && !SU_SEVIYE[d.blok(h.x, h.y + 1, h.z)]) yeni = 59; }
    if (h.id === 31 || b.suIcinde) yeni = 7;
    if (!d.blokKoy(h.x, h.y, h.z, yeni)) return;
    if (b.yatak && this.arayuz.yatakKirildi) this.arayuz.yatakKirildi(h.x, h.y, h.z);   // 0.39.0: kayıt noktası iptali
    /* 0.36.1: iki bloklu yatağın diğer parçası da kaldırılır (eşya bir kez düşer) */
    if (b.yatak2) { const [dx, dz] = YONLER[b.yon], k = b.parca ? -1 : 1, ox = h.x + dx * k, oz = h.z + dz * k, ob = BLOKLAR[d.blok(ox, h.y, oz)]; if (ob && ob.yatak2 && ob.yon === b.yon && ob.parca !== b.parca) d.blokKoy(ox, h.y, oz, 0); }
    /* Kapının diğer yarısı da kaldırılır */
    if (b.sekil === 'kapi') { const oy = h.y + (b.ust ? -1 : 1), ob = d.blok(h.x, oy, h.z); if (BLOKLAR[ob] && BLOKLAR[ob].sekil === 'kapi') d.blokKoy(h.x, oy, h.z, 0); }
    if (b.xp && this.alabilir(h.id)) this.hayatta.xpEkle(b.xp);
    if (b.ekin === 3) this.olay('hasat');
    this.istat('kirilan');
    if (b.sandik || b.firinKap) for (const s of this.arayuz.sandikKirildi(h.x, h.y, h.z, !b.elektrik && !b.mezar && !b.dolap && !b.firinKap)) this.dusenler.birak(s.id, s.adet, h.x + 0.5, h.y + 0.5, h.z + 0.5, 0, 0, 0, s.dayanim, 0.5, s.buyu);
    this.ses.kir(b.ses);
    this.dusenler.parcacik(h.id, h.x, h.y, h.z);
    if (this.alabilir(h.id)) this.dusur(h.id, h.x, h.y, h.z, b.xp ? buyuSeviye(this.envanter.seciliYuva(), 'servet') + (this.hayatta.etki('sans') ? 1 : 0) : 0);
    const a = this.aletBilgi();
    if (a && b.sertlik > 0) {
      if (this.envanter.aletYipran(a.tur === 'kilic' ? 2 : 1)) { this.ses.aletKirildi(); this.arayuz.bildirim('Aletiniz kırıldı.'); }
    }
    this.hayatta.yor(0.025);
    /* Üstteki bitki/meşale desteksiz kalır */
    /* Üstteki kapı da düşer */
    if (BLOKLAR[ust] && BLOKLAR[ust].sekil === 'kapi' && !BLOKLAR[ust].ust) {
      d.blokKoy(h.x, h.y + 1, h.z, 0); if (BLOKLAR[d.blok(h.x, h.y + 2, h.z)].sekil === 'kapi') d.blokKoy(h.x, h.y + 2, h.z, 0);
      this.dusur(88, h.x, h.y + 1, h.z);
    }
    if ((BITKI[ust] || (BLOKLAR[ust] && ((BLOKLAR[ust].mesale && CIZIM[ust] !== C_KUP && !BLOKLAR[ust].gecit && !BLOKLAR[ust].destekSiz) || ZEMIN_MEK[BLOKLAR[ust].mekanik]))) && (!SIVI[ust] || BLOKLAR[ust].suIcinde)) {
      d.blokKoy(h.x, h.y + 1, h.z, BLOKLAR[ust].suIcinde ? 7 : 0);
      this.dusur(ust, h.x, h.y + 1, h.z);
      if (ust === 28 || ust === 29) { /* çalı tamamen düşer */ }
    }
    /* 0.31.0: alttaki avize tavanı kalmayınca düşer */
    const altB = BLOKLAR[d.blok(h.x, h.y - 1, h.z)];
    if (altB && altB.asili) { const ai = d.blok(h.x, h.y - 1, h.z); d.blokKoy(h.x, h.y - 1, h.z, 0); this.dusur(ai, h.x, h.y - 1, h.z); }
  }

  /* servet: Servet büyüsü seviyesi (cevherlerde blok dışındaki ürünler çoğalır) */
  /* 0.34.0: tırpanla biçme */
  bic(h, R) {
    const d = this.dunya, env = this.envanter;
    let n = 0;
    for (let dz = -R; dz <= R; dz++) for (let dx = -R; dx <= R; dx++) for (let dy = -1; dy <= 1; dy++) {
      const x = h.x + dx, y = h.y + dy, z = h.z + dz, id = d.blok(x, y, z), b = BLOKLAR[id];
      if (!b || !BITKI[id] || b.fidan || b.meyve) continue;
      const olgun = b.ekin === 3, ot = b.degistirilebilir && b.ekin == null;
      if (!olgun && !ot) continue;
      /* 0.35.0: yeniden ürün veren bitkiler (domates, biber, çilek) sökülmez, toplanır */
      if (b.tekrar != null && olgun) { const k = b.urunAdet[0] + Math.floor(Math.random() * (b.urunAdet[1] - b.urunAdet[0] + 1)); d.blokKoy(x, y, z, b.tekrar); this.dusenler.birak(b.urun, k, x + 0.5, y + 0.4, z + 0.5); this.olay('hasat'); n++; continue; }
      const liste = b.dusur ? b.dusur(Math.random) : [];
      d.blokKoy(x, y, z, 0);
      /* Yeniden ekim: düşenlerden ya da çantadan bir tohum */
      if (olgun) {
        const taban = id - 3, tohum = tohumBul(taban);
        if (tohum) {
          const i = liste.findIndex(([e, k]) => e === tohum.id && k > 0);
          if (i >= 0) { liste[i][1]--; d.blokKoy(x, y, z, taban); }
          else if (env.say(tohum.id) > 0) { env.harca(tohum.id, 1); d.blokKoy(x, y, z, taban); }
        }
        this.olay('hasat');
      }
      for (const [e, k] of liste) if (k > 0) this.dusenler.birak(e, k, x + 0.5, y + 0.4, z + 0.5);
      this.dusenler.parcacik(id, x, y, z, 3);
      n++;
    }
    if (n) { this.ses.kir('bitki'); this.vurus = 0.01; if (env.aletYipran(1)) { this.ses.aletKirildi(); this.arayuz.bildirim('Aletiniz kırıldı.'); } }
  }
  /* 0.34.0: olgun ekinden (domates, biber, çilek) ve meyveli yapraktan sağ tıkla toplama; kompost kutusu */
  topla(h) {
    const d = this.dunya, b = BLOKLAR[h.id], env = this.envanter;
    if (b.tekrar != null && b.ekin === 3) {
      const n = b.urunAdet[0] + Math.floor(Math.random() * (b.urunAdet[1] - b.urunAdet[0] + 1));
      d.blokKoy(h.x, h.y, h.z, b.tekrar); this.dusenler.birak(b.urun, n, h.x + 0.5, h.y + 0.5, h.z + 0.5);
      this.ses.koy('bitki'); this.olay('hasat'); return true;
    }
    /* 0.36.0: pasta: her sağ tıkta bir dilim yenir (4 dilim) */
    if (b.sekil === 'pasta') {
      if (this.hayatta.aclik >= 20) { this.arayuz.bildirim('Açlık çubuğu dolu.'); return true; }
      this.hayatta.ye(4); this.hayatta.etkiEkle('hiz', Math.round(40 * this.hayatta.asciCarpan));
      d.blokKoy(h.x, h.y, h.z, b.dilim >= 3 ? 0 : h.id + 1);
      this.ses.ye(); this.yemeAnim = 1; this.istat('yemek');
      this.dusenler.renkliParcacik([0.95, 0.85, 0.8], h.x + 0.5, h.y + 0.5, h.z + 0.5, 6);
      return true;
    }
    /* 0.35.0: vazoya çiçek konur ya da çiçek alınır */
    if (b.sekil === 'vazo') {
      const s = env.seciliYuva();
      if (b.bosVazo && s && [26, 27, 44].includes(s.id)) { env.seciliAzalt(1); d.blokKoy(h.x, h.y, h.z, YAPI_ID.vazo); this.ses.koy('bitki'); return true; }
      if (!b.bosVazo && !s) { d.blokKoy(h.x, h.y, h.z, VAZO_BOS); this.dusenler.birak(26, 1, h.x + 0.5, h.y + 0.8, h.z + 0.5); this.ses.koy('bitki'); return true; }
      return false;
    }
    if (b.meyveli) {
      d.blokKoy(h.x, h.y, h.z, b.bos); this.dusenler.birak(b.meyveId, 1 + (Math.random() < 0.35 ? 1 : 0), h.x + 0.5, h.y + 0.3, h.z + 0.5);
      this.ses.koy('bitki'); return true;
    }
    if (b.kompost != null) {
      if (b.kompost >= 8) { d.blokKoy(h.x, h.y, h.z, b.taban); this.dusenler.birak(390, 1 + (Math.random() < 0.5 ? 1 : 0), h.x + 0.5, h.y + 1, h.z + 0.5); this.ses.topla(); return true; }
      const s = env.seciliYuva(), e = s && ESYALAR[s.id];
      if (!e || !organikMi(s.id)) return false;
      env.seciliAzalt(1);
      d.blokKoy(h.x, h.y, h.z, h.id + 1);   // 0.35.0: her atık bir seviye doldurur
      this.arayuz.bildirim(b.kompost + 1 >= 8 ? 'Kompost doldu: gübre almak için sağ tıklayınız.' : `Kompost: ${b.kompost + 1} / 8`);
      this.dusenler.renkliParcacik([0.45, 0.65, 0.3], h.x + 0.5, h.y + 0.9, h.z + 0.5, 6); this.ses.koy('bitki');
      return true;
    }
    return false;
  }
  dusur(id, x, y, z, servet = 0) {
    const b = BLOKLAR[id];
    const liste = b.dusur ? b.dusur(Math.random) : [[id, 1]];
    for (const [e, n0] of liste) { const n = servet && e !== id ? n0 * (1 + Math.floor(Math.random() * (servet + 1))) : n0; if (n > 0) this.dusenler.birak(e, n, x + 0.5, y + 0.4, z + 0.5); }
  }

  /* ---------- 0.21.0: kova, makas, kovan ---------- */
  /* Bakış yönündeki ilk su bloğu (katı bloğa çarpınca durur) */
  suHedef() {
    const g = this.oyuncu.gozKonumu(), y = this.oyuncu.bakisYonu(), d = this.dunya;
    for (let t = 0; t < 5; t += 0.1) {
      const x = Math.floor(g.x + y.x * t), yy = Math.floor(g.y + y.y * t), z = Math.floor(g.z + y.z * t), id = d.blok(x, yy, z);
      if (id === 7) return { x, y: yy, z };
      if (KATI[id]) return null;
    }
    return null;
  }
  /* Kova: sudan su alınır (su kaynağı tükenmez); su kovası suyu koyar ve değdiği lavı obsidyene çevirir */
  kovaKullan(h, e) {
    const env = this.envanter, d = this.dunya;
    const degis = id => { env.seciliAzalt(1); env.ekle(id, 1); };
    if (e.kova) {
      const su = this.suHedef();
      if (!su) return false;
      degis(478); this.ses.sicrama(0.6); return true;
    }
    if (!h) return false;
    const x = h.x + h.nx, y = h.y + h.ny, z = h.z + h.nz, m = d.blok(x, y, z);
    if (m && !(BLOKLAR[m] && BLOKLAR[m].degistirilebilir && !SIVI[m])) return false;
    d.blokKoy(x, y, z, 7);
    let obs = 0;
    for (const [a, b, c] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) if (d.blok(x + a, y + b, z + c) === 59) { d.blokKoy(x + a, y + b, z + c, 515); obs++; }
    if (obs) { this.ses.yanma(); this.dusenler.renkliParcacik([0.7, 0.7, 0.75], x + 0.5, y + 0.5, z + 0.5, 12); this.arayuz.bildirim('Su lava değdi: lav obsidyene dönüştü.'); }
    degis(477); this.ses.sicrama(0.5); this.olay('kova');
    return true;
  }
  /* Makas: balkabağı oyulur (4 çekirdek düşer), dolu kovandan petek alınır */
  makasKullan(h) {
    const d = this.dunya, b = BLOKLAR[h.id];
    if (h.id === 559) {
      d.blokKoy(h.x, h.y, h.z, 560 + this.bakisYonu4());
      this.dusenler.birak(475, 4, h.x + 0.5 + h.nx * 0.6, h.y + 0.5, h.z + 0.5 + h.nz * 0.6);
      this.ses.kaz('odun'); this.aletYipran();
      return true;
    }
    if (b.kovan) return this.kovanHasat(h, 'makas');
    return false;
  }
  aletYipran() { if (this.envanter.aletYipran(1)) { this.ses.aletKirildi(); this.arayuz.bildirim('Aletiniz kırıldı.'); } }
  /* Dolu kovandan bal (şişeyle) ya da 3 petek (makasla); altında 5 blok içinde kamp ateşi yoksa arılar kızar (sunucuda) */
  kovanHasat(h, ile) {
    const b = BLOKLAR[h.id];
    if (b.bal < 5) { this.arayuz.bildirim(`Kovan henüz dolmadı (bal ${b.bal}/5). Arılar yakındaki çiçeklerden bal yapar.`); return true; }
    this.dunya.blokKoy(h.x, h.y, h.z, 569 + b.yon * 6);
    if (ile === 'sise') { this.envanter.seciliAzalt(1); this.envanter.ekle(482, 1); this.ses.ic(); }
    else { this.dusenler.birak(483, 3, h.x + 0.5 + h.nx * 0.7, h.y + 0.5, h.z + 0.5 + h.nz * 0.7); this.ses.kaz('toprak'); this.aletYipran(); }
    let ates = false;
    for (let k = 1; k <= 5 && !ates; k++) if (this.dunya.blok(h.x, h.y - k, h.z) === 48) ates = true;
    this.arayuz.bildirim(ates ? 'Kamp ateşinin dumanı arıları sakinleştirdi.' : 'Arılar kızdı! Kovanın 5 blok altına kamp ateşi yakılırsa arılar sakin kalır.');
    this.olay('aricilik');
    return true;
  }
  /* Şeker kamışı yeri: altında kamış ya da suya komşu kum, toprak, çimen */
  kamisYeri(x, y, z) {
    const d = this.dunya, alt = d.blok(x, y - 1, z);
    if (alt === 568) return true;
    if (![3, 4, 5, 45, 142, 143].includes(alt)) return false;
    for (const [a, c] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const n = d.blok(x + a, y - 1, z + c); if (n === 7 || n === 22) return true; }
    return false;
  }

  kullan(g) {
    const h = this.hedef, env = this.envanter;
    const s = env.seciliYuva(), e = s && ESYALAR[s.id];
    /* 0.26.0: elde kablo varken şalter açılıp kapanmaz (0.29.0: kablo tıkları guncelle'de işlenir) */
    if (e && e.tur === 'kablo') return false;
    /* 0.31.0: Yapı Planı: köşe seçme, kopyalama ve kurma */
    if (e && e.tur === 'plan') return this.plan.kullan(h, g);
    /* 0.31.0: boyanabilir bloklar (yün, halı, cam, cam bölme, pişmiş kil, beton, perde, sancak) eldeki boyanın rengine boyanır */
    if (h && e && (s.id === 346 || (s.id >= 321 && s.id <= 327)) && BLOKLAR[h.id].boya) {
      const yeni = BLOKLAR[h.id].boya(s.id === 346 ? 0 : s.id - 320);
      if (yeni != null && yeni !== h.id && this.dunya.blokKoy(h.x, h.y, h.z, yeni)) {
        env.seciliAzalt(1); this.ses.koy(BLOKLAR[yeni].ses); this.dusenler.renkliParcacik(hexRgb(e.renk), h.x + 0.5, h.y + 0.6, h.z + 0.5, 8);
        return true;
      }
    }
    /* 0.34.0: ekin ve meyve toplama, kompost */
    if (h && !g.egil && this.topla(h)) return true;
    /* İstasyonlar */
    /* 0.33.0: fırın ve kamp ateşi kendi haznesini açar (Shift ile üretim penceresi) */
    if (h && BLOKLAR[h.id].firinKap && !g.egil && !this.shift) { this.arayuz.sandikAc(h.x, h.y, h.z); return true; }
    if (h && BLOKLAR[h.id].istasyon && !g.egil) { this.arayuz.envanterAc(BLOKLAR[h.id].istasyon); return true; }
    /* ---------- 0.21.0: tarım ve hayvancılık ---------- */
    if (e && (e.kova || e.suKovasi)) { if (this.kovaKullan(h, e)) return true; }
    if (h && e && e.alet && e.alet.tur === 'makas' && this.makasKullan(h)) return true;
    if (h && e && s.id === 331 && BLOKLAR[h.id].kovan && this.kovanHasat(h, 'sise')) return true;
    /* 0.18.0: Çakmak: obsidyen çerçevenin içinde Diyar Geçidi açar; 0.38.1: ateş yakar, yakıp temizler, buz eritir */
    if (h && e && e.tur === 'cakmak') {
      if (this.cakmakKullan(h)) return true;
      this.cakmakSes();
      return true;
    }
    /* 0.39.0: Büyülü Anahtar kadim geçidi açar ve harcanır */
    if (h && s && s.id === ESYA39.anahtar && this.gecit) { if (this.gecit.anahtar(h)) env.seciliAzalt(1); return true; }
    /* Sandalye ve koltuk: oturulur (elde blok tutulurken ya da eğilirken blok konur) */
    if (h && BLOKLAR[h.id].oturak && !g.egil && !(e && e.tur === 'blok') && this.binek && this.binek.otur(h.x, h.y, h.z)) return true;
    /* Sandık */
    /* 0.37.0: piyano ve gramofon çalar */
    if (h && BLOKLAR[h.id].muzik && !g.egil) { this.ses.melodi([0, 3, 2][Math.floor(Math.random() * 3)]); this.dusenler.renkliParcacik([0.95, 0.85, 0.4], h.x + 0.5, h.y + 1.1, h.z + 0.5, 6); return true; }
    if (h && BLOKLAR[h.id].sandik && !g.egil) { const [kx, ky, kz] = this.kokHucre(h.x, h.y, h.z, BLOKLAR[h.id]); this.arayuz.sandikAc(kx, ky, kz); return true; }
    /* Yatak */
    if (h && BLOKLAR[h.id].yatak) { this.arayuz.uyu(h); return true; }
    /* Kapı, çit kapısı ve tuzak kapı açılıp kapanır (eğilirken blok konur) */
    if (h && !g.egil && this.ac(h)) { this.acildi = true; return true; }
    /* Böğürtlen toplama */
    if (h && h.id === 28) {
      this.dunya.blokKoy(h.x, h.y, h.z, 29);
      this.dusenler.birak(265, 2 + (Math.random() < 0.4 ? 1 : 0), h.x + 0.5, h.y + 0.6, h.z + 0.5);
      this.ses.topla();
      return true;
    }
    if (!e) return false;
    /* Tekne: bakılan su yüzeyine konur */
    if (e.tur === 'tekne') {
      if (!this.tekneler || this.tekneler.binilen) return false;
      const t = this.tekneler.koy(this.oyuncu.gozKonumu(), this.oyuncu.bakisYonu(), e.tekne, this.oyuncu.yaw);
      if (t) { env.seciliAzalt(1); this.ses.koy('odun'); this.arayuz.bildirim(`${t.T.ad} suya kondu. Binmek için sağ tıklayınız.`, 'tekne'); }
      else this.arayuz.bildirim('Tekne yalnızca açık su yüzeyine konabilir.', 'tekne');
      return true;
    }
    /* 0.36.0: Tarif Defteri: aşçılık seviyesi */
    if (s.id === 320) {
      const H = this.hayatta, L = H.asciSeviye;
      this.arayuz.bildirim(`Aşçılık seviyesi ${L}/10${L < 10 ? ` (%${Math.floor(H.asciIlerleme * 100)})` : ''}: yemek etkileri %${L * 8} uzun sürer${L >= 3 ? `, pişirmede %${L * 4} fazladan ürün olasılığı` : ''}.`);
      this.ses.topla(); return true;
    }
    /* Yiyecek ve bakım */
    if (e.zirh) { env.zirhGiy(); this.ses.zirhGiy(); return true; }
    if (e.kiyafet) { env.kiyafetGiy(); this.ses.zirhGiy(); return true; }   // 0.33.0
    /* Kemik tozu: ekinleri ve fidanları hızla büyütür, çimende çiçek açtırır */
    if (e.gubre && h) {
      const d = this.dunya;
      let oldu = false;
      if (BLOKLAR[h.id].meyve) { for (let k = 0; k < 4 && !oldu; k++) oldu = d.meyveVer(h.x, h.y, h.z); oldu = true; }
      else if (BLOKLAR[h.id].kamis) { let x = h.y; while (d.blok(h.x, x + 1, h.z) === 568) x++; d.kamisBuyut(h.x, x, h.z); oldu = true; }
      else if (EKIN_SONRAKI[h.id]) { let n = EKIN_SONRAKI[h.id]; if (Math.random() < 0.5 && EKIN_SONRAKI[n]) n = EKIN_SONRAKI[n]; d.blokKoy(h.x, h.y, h.z, n); oldu = true; }
      else if (BLOKLAR[h.id].fidan) { if (Math.random() < 0.45) d.fidanBuyut(h.x, h.y, h.z, BLOKLAR[h.id].fidan); oldu = true; }
      else if (h.id === 4 && h.ny === 1) {
        for (let k = 0; k < 10; k++) {
          const x = h.x + Math.floor(Math.random() * 5) - 2, z = h.z + Math.floor(Math.random() * 5) - 2;
          if (d.blok(x, h.y, z) === 4 && d.blok(x, h.y + 1, z) === 0) d.blokKoy(x, h.y + 1, z, [25, 25, 25, 26, 27, 44][Math.floor(Math.random() * 6)]);
        }
        oldu = true;
      }
      if (oldu) { env.seciliAzalt(1); this.dusenler.renkliParcacik([0.45, 0.85, 0.35], h.x + 0.5, h.y + 1, h.z + 0.5, 10); this.ses.topla(); return true; }
      return false;
    }
    /* Çapa: toprak ve çimen tarla toprağına çevrilir */
    if (e.alet && e.alet.tur === 'capa') {
      if (!h || ![3, 4, 45, 57].includes(h.id) || h.ny === -1) return false;
      const d = this.dunya;
      /* 0.38.4: her çapa yalnızca tıklanan bloğu işler (çapanın malzemesi dayanıklılığı ve hızı belirler) */
      const alan = [[0, 0]];
      let n = 0;
      for (const [a, c] of alan) {
        const x = h.x + a, z = h.z + c, id = d.blok(x, h.y, z);
        if (![3, 4, 45, 57].includes(id)) continue;
        const ust = d.blok(x, h.y + 1, z);
        if (ust && !(BLOKLAR[ust].degistirilebilir)) continue;
        if (ust) d.blokKoy(x, h.y + 1, z, 0);
        d.blokKoy(x, h.y, z, this.suYakin(x, h.y, z) ? 138 : 137); n++;
        this.dusenler.parcacik(3, x, h.y, z, 3);
      }
      if (!n) return false;
      this.ses.koy('toprak');
      if (env.aletYipran(1)) { this.ses.aletKirildi(); this.arayuz.bildirim('Aletiniz kırıldı.'); }
      return true;
    }
    /* 0.38.4: çapalanmamış toprağa tohum ekilmez (havuç, patates ve soğan bu durumda yenir) */
    if (e.ekin && h && TOPRAK.has(h.id) && !TARLA.has(h.id) && h.ny === 1 && !e.yemek) { this.arayuz.bildirim('Tohum yalnızca çapayla işlenmiş tarla toprağına ekilir.'); return true; }
    /* Tohum ekme (havuç ve patates hem ekilir hem yenir) */
    if (e.ekin && h && TARLA.has(h.id) && h.ny === 1 && this.dunya.blok(h.x, h.y + 1, h.z) === 0) {
      this.dunya.blokKoy(h.x, h.y + 1, h.z, e.ekin); env.seciliAzalt(1); this.ses.koy('bitki');
      /* 0.34.0: Shift basılıyken çevredeki 3 × 3 tarlaya da ekilir */
      if (this.shift) for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
        if ((!dx && !dz) || !env.seciliYuva() || env.seciliYuva().id !== s.id) continue;
        const x = h.x + dx, z = h.z + dz;
        if ((this.dunya.blok(x, h.y, z) === 137 || this.dunya.blok(x, h.y, z) === 138) && this.dunya.blok(x, h.y + 1, z) === 0) { this.dunya.blokKoy(x, h.y + 1, z, e.ekin); env.seciliAzalt(1); }
      }
      return true;
    }
    if (e.ekin && !e.yemek) return false;
    /* İksir: etkisi süre boyunca devam eder, boş şişe geri kalır */
    if (e.tur === 'iksir' && e.etki) {
      this.hayatta.etkiEkle(e.etki.tur, e.etki.sure); this.olay('iksir');
      env.seciliAzalt(1); env.ekle(331, 1); this.ses.ic();
      this.arayuz.bildirim(`${ETKILER[e.etki.tur].ad} etkisi başladı: 3 dakika.`, s.id);
      return true;
    }
    if ((e.tur === 'yiyecek' || e.yenir) && e.yemek) {
      if (this.hayatta.aclik >= 20 && !e.iyilestirme && !e.etki && !(e.etkiler && e.etkiler.length) && !e.temizle && !e.zehirGider && !e.sicak && !e.serin) { this.arayuz.bildirim('Açlık çubuğu dolu.'); return true; }
      /* 0.36.0: çoklu yemek etkileri; süre aşçılık seviyesiyle uzar */
      if (e.etkiler && e.etkiler.length) {
        const c = this.hayatta.asciCarpan;
        for (const [k, t] of e.etkiler) this.hayatta.etkiEkle(k, Math.round(t * c));
        this.arayuz.bildirim(e.etkiler.map(([k, t]) => `${ETKILER[k].ad} ${Math.round(t * c)} sn`).join(', '), s.id);
      }
      if (e.etki) { this.hayatta.etkiEkle(e.etki.tur, e.etki.sure); this.arayuz.bildirim(`${ETKILER[e.etki.tur].ad} etkisi: ${e.etki.sure} saniye.`, s.id); }
      if (e.iyilestirme) this.hayatta.iyiles(e.iyilestirme);
      if (this.hayatta.ye(e.yemek, e.zehir || 0)) this.arayuz.bildirim('Mide bulantısı: açlık bir süre daha hızlı azalır.');
      if (e.pismis) this.olay('pisir');
      /* 0.22.0: sıcak çorba ısıtır, ayran serinletir */
      if (e.sicak) { this.hayatta.etkiEkle('sicak', e.sicak); if (this.hayatta.vucut < 36) this.arayuz.bildirim('Sıcak çorba içinizi ısıttı.'); }
      if (e.serin) this.hayatta.etkiEkle('serin', e.serin);
      this.istat('yemek');
      env.seciliAzalt(1);
      if (e.kap) { env.ekle(e.kap, 1); this.ses.ic(); } else this.ses.ye();
      this.yemeAnim = 1;   // 0.23.0: el ağza götürülür
      if (s.id === 269 || e.kase) env.ekle(270, 1);
      /* 0.21.0: süt olumsuz etkileri ve zehri, bal zehri giderir */
      if (e.temizle || e.zehirGider) { const H = this.hayatta; H.zehir = 0; H.agu = 0; if (e.temizle) for (const k in H.etkiler) if (ETKILER[k] && ETKILER[k].kotu && k !== 'kanama' && k !== 'kirik') delete H.etkiler[k]; this.arayuz.bildirim(e.temizle ? 'Olumsuz etkiler geçti.' : 'Zehir geçti.'); }
      if (s.id >= 484 && s.id <= 491) this.olay('ciftci');
      if (s.id >= 463 && s.id <= 470) this.olay('gurme');
      return true;
    }
    if (e.tur === 'iyilestir') {
      /* 0.22.0: bandaj ve şifa iksiri kanamayı durdurur */
      const kanama = this.hayatta.etki('kanama');
      if (this.hayatta.can >= 20 && !kanama) { this.arayuz.bildirim('Canınız dolu.'); return true; }
      this.hayatta.iyiles(e.iyilestir); env.seciliAzalt(1); this.ses.topla();
      if (kanama) { delete this.hayatta.etkiler.kanama; this.arayuz.bildirim('Kanama durdu.'); if (s.id === 268) this.olay('ilkYardim'); }
      return true;
    }
    /* 0.22.0: atel kırık bacağı sarar */
    if (e.tur === 'atel') {
      const H = this.hayatta;
      if (!H.etki('kirik')) { this.arayuz.bildirim('Kırık bir kemik yok.'); return true; }
      if (H.atel) { this.arayuz.bildirim('Bacak zaten atelle sarılı.'); return true; }
      H.etkiler.kirik = Math.min(H.etkiler.kirik, 30); H.atel = true;
      env.seciliAzalt(1); this.ses.zirhGiy(); this.olay('atel');
      this.arayuz.bildirim('Atel sarıldı: kemik 30 saniyede kaynar.');
      return true;
    }
    /* 0.22.0: Eve Dönüş Tılsımı */
    if (e.alet && e.alet.tur === 'tilsim') { if (this.arayuz.tilsim) this.arayuz.tilsim(); return true; }
    /* 0.25.0: çok bloklu cihaz kurma */
    if (e.tur === 'cihaz' && h) {
      const y = this.cihazYeri(e.cihaz, h);
      if (!y) return false;
      if (!y.gecerli) { this.arayuz.bildirim(y.neden); return true; }
      const C = CIHAZ[e.cihaz], d = this.dunya;
      for (const [x, yy, z, i] of y.hucreler) d.blokKoy(x, yy, z, C.taban + y.yon * C.n + i);   // kök hücre önce konur
      env.seciliAzalt(1); this.istat('konulan'); this.ses.koy(C.ses);
      return true;
    }
    /* 0.37.0: çok bloklu / tek bloklu mobilya: önizlemeli kurulum */
    if (e.tur === 'blok' && h && BLOKLAR[e.blok].ck) {
      const y = this.cokluYeri(h, COKLU[BLOKLAR[e.blok].ck]);
      if (!y) return false;
      if (!y.gecerli) { this.arayuz.bildirim(y.neden); return true; }
      for (const [id, x, yy, z] of y.parcalar) this.dunya.blokKoy(x, yy, z, id);
      const D = COKLU[BLOKLAR[e.blok].ck];
      if (D.sandik && this.arayuz.sandikYerlesti) this.arayuz.sandikYerlesti(y.parcalar[0][1], y.parcalar[0][2], y.parcalar[0][3]);
      env.seciliAzalt(1); this.istat('konulan'); this.ses.koy(D.ses || 'odun');
      if (this.arayuz.blokKondu) this.arayuz.blokKondu(e.blok);
      return true;
    }
    /* 0.37.0: dürbün, cep saati, havai fişek */
    if (s.id === ESYA37.durbun) { this.durbun = !this.durbun; this.ses.tik && this.ses.tik(); return true; }
    if (s.id === ESYA37.cepSaati) {
      const z = this.arayuz.zaman ? this.arayuz.zaman() : null;
      if (z) { const dk = Math.floor(((z.zaman * 24 + 6) % 24) * 60); this.arayuz.bildirim(`Saat ${String(Math.floor(dk / 60)).padStart(2, '0')}:${String(dk % 60).padStart(2, '0')} · ${z.gun}. gün${z.mevsim ? ' · ' + z.mevsim : ''}`, s.id); }
      return true;
    }
    if (s.id === ESYA37.havaiFisek) {
      const P = this.oyuncu.konum, R = [[1, 0.3, 0.3], [0.4, 0.8, 1], [1, 0.9, 0.3], [0.5, 1, 0.5], [0.9, 0.5, 1]];
      env.seciliAzalt(1); this.ses.fisekAt();
      for (let i = 0; i < 3; i++) setTimeout(() => {
        const c = R[Math.floor(Math.random() * R.length)], x = P.x + (Math.random() - 0.5) * 6, y = P.y + 12 + Math.random() * 5, z = P.z + (Math.random() - 0.5) * 6;
        this.dusenler.renkliParcacik(c, x, y, z, 40); this.dusenler.renkliParcacik([1, 1, 0.9], x, y, z, 12);
        this.ses.fisekPatla();
      }, 700 + i * 380);
      this.olay && this.olay('fisek');
      return true;
    }
    /* 0.36.1: yatak iki blok olarak kurulur (ayak hedefte, baş bakış yönünde; R ile döndürülür) */
    if (s.id === 47 && h) {
      const y = this.yatakYeri(h);
      if (!y) return false;
      if (!y.gecerli) { this.arayuz.bildirim(y.neden); return true; }
      for (const [id, x, yy, z] of y.parcalar) this.dunya.blokKoy(x, yy, z, id);
      env.seciliAzalt(1); this.istat('konulan'); this.ses.koy('yun');
      return true;
    }
    /* Blok koyma */
    if (e.tur === 'blok' && h) {
      let id = e.blok;
      const d = this.dunya, eb = BLOKLAR[id];
      /* Yarım blok üstüne aynı yarım blok: tam blok olur */
      if (eb.sekil === 'yarim') {
        const hb0 = BLOKLAR[h.id];
        if (hb0.sekil === 'yarim' && hb0.taban === id && ((!hb0.ust && h.ny === 1) || (hb0.ust && h.ny === -1))) return this.koyVeHarca(h.x, h.y, h.z, hb0.cift, env);
      }
      let x = h.x + h.nx, y = h.y + h.ny, z = h.z + h.nz;
      const hb = BLOKLAR[h.id];
      if (hb.degistirilebilir) { x = h.x; y = h.y; z = h.z; }
      let mevcut = d.blok(x, y, z);
      if (eb.sekil === 'yarim') {
        const mb0 = BLOKLAR[mevcut];
        if (mb0 && mb0.sekil === 'yarim' && mb0.taban === id) return this.koyVeHarca(x, y, z, mb0.cift, env);
      }
      /* Biçimli blokların yönü ve durumu */
      const f = (this.bakisYonu4() + this.donus) % 4, yid = this.yonluId(eb, f);
      const sid = this.yuzeyId(eb, h, f);
      if (sid != null) id = sid;
      else if (yid != null && eb.sekil !== 'kapi') id = yid;
      else if (eb.sekil === 'tablo' || eb.duvara) {
        const yi = YONLER.findIndex(([a, b]) => a === -h.nx && b === -h.nz);
        if (h.ny !== 0 || yi < 0 || !(KATI[h.id] && OPAK[h.id])) { this.arayuz.bildirim(`${eb.sekil === 'tablo' ? 'Tablo' : eb.ad} katı bir duvarın yan yüzüne asılır.`); return true; }
        id = eb.taban + yi;
      }
      else if (eb.sekil === 'yarim') id = eb.taban + (h.ny === -1 || (h.ny === 0 && h.py > 0.5) ? 1 : 0);
      else if (eb.kamis && !this.kamisYeri(x, y, z)) { this.arayuz.bildirim('Şeker kamışı suya komşu kum, toprak ya da çimen üstüne veya başka bir kamışın üstüne konur.'); return true; }
      else if (eb.sekil === 'tirmanma') {
        const yi = YONLER.findIndex(([a, b]) => a === -h.nx && b === -h.nz);
        if (h.ny !== 0 || yi < 0 || !(KATI[h.id] && OPAK[h.id])) { this.arayuz.bildirim('Tırmanma merdiveni katı bir duvarın yan yüzüne konur.'); return true; }
        id = 110 + yi;
      } else if (eb.sekil === 'kapi') {
        const ust = d.blok(x, y + 1, z), alt = d.blok(x, y - 1, z);
        if ((mevcut && !BLOKLAR[mevcut].degistirilebilir) || (ust && !BLOKLAR[ust].degistirilebilir)) return false;
        if (!KATI[alt]) { this.arayuz.bildirim('Kapı katı bir zeminin üstüne konur.'); return true; }
        if (this.oyuncu.hucreyiKapliyor(x, y, z) || this.oyuncu.hucreyiKapliyor(x, y + 1, z)) return false;
        if (y + 1 >= PY - 1) return false;
        d.blokKoy(x, y, z, 88 + f * 4); d.blokKoy(x, y + 1, z, 88 + f * 4 + 1);
        env.seciliAzalt(1); this.ses.koy('odun');
        return true;
      }
      mevcut = d.blok(x, y, z);
      const mb = BLOKLAR[mevcut];
      const suBitkisi = !!BLOKLAR[id].suIcinde;
      const bitki = (BITKI[id] && !suBitkisi) || BLOKLAR[id].mesale;
      if (mevcut !== 0 && !(mb.degistirilebilir) && !(SIVI[mevcut] && !BITKI[mevcut] && !bitki)) return false;
      if (y < 1 || y >= PY - 1) return false;
      const alt = d.blok(x, y - 1, z);
      /* 0.31.0: avize tavana asılır */
      if (BLOKLAR[id].asili) { const ust = d.blok(x, y + 1, z); if (!(KATI[ust] && OPAK[ust])) { this.arayuz.bildirim(`${BLOKLAR[id].ad} katı bir tavana asılır.`); return true; } }
      else if (BLOKLAR[id].mesale && CIZIM[id] !== C_KUP && !(KATI[alt] && (OPAK[alt] || BLOKLAR[id].lamba))) { this.arayuz.bildirim('Meşale katı bir bloğun üstüne konur.'); return true; }
      if (ZEMIN_MEK[BLOKLAR[id].mekanik] && !(KATI[alt] && OPAK[alt])) { this.arayuz.bildirim(`${BLOKLAR[id].ad} katı bir bloğun üstüne konur.`); return true; }
      if (suBitkisi) {
        if (mevcut !== 7 || !KATI[alt]) { this.arayuz.bildirim('Bu bitki su altında katı bir zemine dikilir.'); return true; }
      } else if (BITKI[id]) {
        if (id === 36 || id === 153 ? !KATI[alt] : !TOPRAK.has(alt)) { this.arayuz.bildirim('Bu bitki toprak veya çimen üstüne dikilir.'); return true; }
        if (SIVI[mevcut]) return false;
      }
      /* 0.25.0: cihazların üstüne blok konmaz; rüzgâr türbininin pervane alanına katı blok konmaz */
      const altB = BLOKLAR[alt];
      if (altB && altB.ustuneKonmaz) { this.arayuz.bildirim(`${altB.ad} üstüne bir şey konamaz.`); return true; }
      if (KATI[id] && this.pervaneAlaninda(x, y, z)) { this.arayuz.bildirim('Rüzgâr türbininin pervanesi bu alanda döner; buraya blok konamaz.'); return true; }
      if (KATI[id] && this.oyuncu.hucreyiKapliyor(x, y, z)) return false;
      if (!d.blokKoy(x, y, z, id)) return false;
      if (BLOKLAR[id].sandik) this.arayuz.sandikYerlesti(x, y, z);
      if (this.arayuz.blokKondu) this.arayuz.blokKondu(id);   // 0.32.0: inşa görevleri
      env.seciliAzalt(1); this.istat('konulan');
      this.ses.koy(BLOKLAR[id].ses);
      return true;
    }
    return false;
  }

  /* 0.25.0: yönlü blokların yöne göre kimliği (yönsüzse null); f: bakış yönü + R ile eklenen dönüş */
  yonluId(eb, f) {
    if (eb.sekil === 'merdiven' || eb.sekil === 'sandalye' || eb.sekil === 'koltuk') return eb.taban + f;
    if (eb.yuzlu) return eb.taban + f;   // heykel başı, oyma balkabağı: yüzü oyuncuya döner
    if (eb.sekil === 'citKapi') return 105 + (f === 0 || f === 2 ? 0 : 1) * 2;
    if (eb.sekil === 'tuzak') return 121 + f * 2;
    if (eb.mekanik === 'ters') return 243 + f * 2;   // 0.17.0: çıkış, oyuncunun baktığı yöndedir
    if (eb.mekanik === 'gecik') return 523 + f * 8;   // 0.20.0
    if (eb.kovan) return 569 + ((f + 2) % 4) * 6;   // 0.21.0: arı kovanının girişi oyuncuya bakar
    if (eb.sekil === 'kapi') return 88 + f * 4;
    if (eb.sekil === 'dagitici') return eb.taban + f;   // 0.27.0: çıkışlar bakılan yöne
    if (eb.sekil === 'jenerator') return 860 + ((f + 2) % 4) * 2;   // 0.28.0: kontrol paneli oyuncuya bakar
    if (eb.sekil === 'eocak') return OCAK_ID((f + 2) % 4, 0);   // 0.29.0: ön yüz oyuncuya bakar
    if (eb.sekil === 'eisitici') return ISITICI_ID((f + 2) % 4, 0);
    /* 0.31.0: perde bakılan yöndeki kenara, şöminenin ve dolabın önü oyuncuya */
    if (eb.sekil === 'perde') return eb.taban + f * 2;
    if (eb.sekil === 'somine') return eb.taban + ((f + 2) % 4) * 2;
    if (eb.dolap) return eb.taban + (f + 2) % 4;
    return null;
  }
  /* ---------- 0.26.0 / 0.27.0: Rust tarzı kablo çekme ----------
     Kablo bir bağlantı noktasından (giriş ya da çıkış) başlar ve karşı türden boş bir noktada biter; yüzeylere sol tık ara nokta ekler (0.29.0: sağ tık geri alır).
     Shift basılıyken eklenen nokta son noktadan eksen boyunca düz hizalanır; Shift + fare tekerleği çekilen parçanın sarkmasını ayarlar (0: gergin). */
  isabetNoktasi(h) {
    const g = this.oyuncu.gozKonumu(), y = this.oyuncu.bakisYonu();
    return [g.x + y.x * h.t + h.nx * 0.04, g.y + y.y * h.t + h.ny * 0.04, g.z + y.z * h.t + h.nz * 0.04];
  }
  /* Bakılan bağlantı noktası: ışına en yakın (0,22 blok içinde) nokta { k, i, tur, p, ad, dolu } ya da null */
  bakilanPort() {
    const d = this.dunya, goz = this.oyuncu.gozKonumu(), yon = this.oyuncu.bakisYonu(), maks = (this.erisim || ERISIM) + 0.5, h = this.hedef;
    const sinir = h ? h.t + 0.35 : maks, hedefUc = h ? kabloUcu(d, h.x, h.y, h.z) : null;   // bakılan cihazın kendi noktaları kutusunun içinde de seçilir
    let en = null, enD = 0.22;
    for (const [k, [x, y, z]] of d.elektrikler) {
      if (Math.abs(x - goz.x) > 9 || Math.abs(z - goz.z) > 9 || Math.abs(y - goz.y) > 10) continue;
      const b = BLOKLAR[d.blok(x, y, z)], P = portlar(b);
      for (let i = 0; i < P.length; i++) {
        const q = portBilgi(d, k, i); if (!q) continue;
        const vx = q.p[0] - goz.x, vy = q.p[1] - goz.y, vz = q.p[2] - goz.z, t = vx * yon.x + vy * yon.y + vz * yon.z;
        if (t < 0 || t > (k === hedefUc ? maks : Math.min(maks, sinir))) continue;
        const dd = Math.sqrt(Math.max(0, vx * vx + vy * vy + vz * vz - t * t));
        if (dd < enD) { enD = dd; en = { k, i, tur: q.tur, p: q.p, ad: b.ad, dolu: !!(this.kablolar && this.kablolar.portKablosu(k, i)) }; }
      }
    }
    return en;
  }
  /* Shift ile düz hizalama: son noktadan en uzun eksen boyunca */
  hizala(son, p) {
    if (!this.shift) return p;
    const d = [p[0] - son[0], p[1] - son[1], p[2] - son[2]], e = d.map(Math.abs), m = e.indexOf(Math.max(...e)), q = son.slice();
    q[m] = p[m]; return q;
  }
  /* Çekilen kablonun şu anki durumu: noktalar (son nokta bakılan yer), sarkmalar, uzunluk, maliyet, geçerlilik */
  kabloOnizleme() {
    if (!this.kablo) return null;
    const bas = portBilgi(this.dunya, this.kablo.k, this.kablo.i);
    if (!bas) return null;
    const onceki = [bas.p, ...this.kablo.n], sonN = onceki[onceki.length - 1], port = this.bakilanPort(), h = this.hedef;
    let son, hedefPort = null, neden = '';
    if (port && !(port.k === this.kablo.k)) {
      son = port.p; hedefPort = port;
      if (port.tur === this.kablo.tur) neden = this.kablo.tur === 'cikis' ? 'Çıkış bir girişe bağlanmalıdır.' : 'Giriş bir çıkışa bağlanmalıdır.';
      else if (port.dolu) neden = 'Bu bağlantı noktası dolu.';
    } else if (h) son = this.hizala(sonN, this.isabetNoktasi(h));
    else { const g = this.oyuncu.gozKonumu(), y = this.oyuncu.bakisYonu(); son = this.hizala(sonN, [g.x + y.x * 3, g.y + y.y * 3, g.z + y.z * 3]); }
    const n = [...onceki, son], uz = yolUzunlugu(n), parca = mesafe(sonN, son);
    if (!neden && parca > KABLO.parca) neden = `Bir parça en çok ${KABLO.parca} blok olabilir; araya bir tutturma noktası ekleyiniz.`;
    else if (!neden && uz > KABLO.toplam) neden = `Kablo en çok ${KABLO.toplam} blok uzunluğunda olabilir.`;
    return { noktalar: n, sarkmalar: [...this.kablo.s, this.kablo.sark], uz, maliyet: kabloMaliyeti(uz), port: hedefPort, gecerli: !neden, neden, sark: this.kablo.sark };
  }
  kabloIptal(mesaj = 'Kablo çekme iptal edildi.') { if (!this.kablo) return; this.kablo = null; this.arayuz.bildirim(mesaj); }
  /* Shift + fare tekerleği: çekilen parçanın sarkması */
  kabloSarkma(yon) { if (!this.kablo) return false; this.kablo.sark = Math.max(0, Math.min(KABLO.sarkmaUst, Math.round((this.kablo.sark + yon * 0.1) * 10) / 10)); return true; }
  /* 0.29.0: sağ tık: çizerken son ara noktayı geri alır (ara nokta yoksa çekmeyi iptal eder);
     çizmiyorken bakılan kabloyu söker, C (eğilme) + sağ tık cihazın bütün kablolarını söker */
  kabloSag(h, g) {
    const K = this.kablolar;
    if (!K) return false;
    if (this.kablo) {
      const k = this.kablo;
      if (k.n.length) { k.n.pop(); k.sark = k.s.pop() ?? 0; this.ses.tik(); this.arayuz.bildirim(`Son ara nokta geri alındı (${k.n.length} ara nokta).`); }
      else this.kabloIptal();
      return true;
    }
    const uc = h && kabloUcu(this.dunya, h.x, h.y, h.z);
    if (g.egil && uc) {
      const l = K.cihazKablolari(uc);
      for (const w of l) this.arayuz.kabloSil(w.i, true);
      this.arayuz.bildirim(l.length ? `${l.length} kablo söküldü.` : 'Bu cihaza bağlı kablo yok.');
      return true;
    }
    const port = this.bakilanPort(), pw = port && port.dolu ? K.portKablosu(port.k, port.i) : null;
    let ki = pw ? pw.i : null;
    if (ki == null && this.arayuz.kabloIsin) { const goz = this.oyuncu.gozKonumu(), yon = this.oyuncu.bakisYonu(); ki = this.arayuz.kabloIsin(goz, yon, h ? h.t + 0.05 : ERISIM); }
    if (ki != null) { this.arayuz.kabloSil(ki, true); this.ses.kir('tas'); this.arayuz.bildirim('Kablo söküldü; kablolar envantere geri döndü.'); return true; }
    return false;
  }
  /* Sol tık: bağlantı noktasından çekmeye başlar, yüzeye ara nokta koyar, karşı noktada bağlar */
  kabloSol(h, g) {
    const K = this.kablolar, env = this.envanter;
    if (!K) return false;
    const port = this.bakilanPort();
    if (!this.kablo) {
      const uc = h && kabloUcu(this.dunya, h.x, h.y, h.z);
      if (!port) { if (uc) this.arayuz.bildirim('Kablo bir bağlantı noktasından çekilir: cihazın üzerindeki mavi (giriş) ya da turuncu (çıkış) noktaya bakınız.'); return !!uc; }
      if (port.dolu) { this.arayuz.bildirim(`Bu ${PORT_AD[port.tur].toLocaleLowerCase('tr')} noktasına zaten bir kablo takılı (sökmek için sağ tık).`); return true; }
      this.kablo = { k: port.k, i: port.i, tur: port.tur, n: [], s: [], sark: 0 }; this.ses.kol(true);
      this.arayuz.bildirim(`${port.ad}: ${PORT_AD[port.tur]} noktasından kablo çekiliyor.`);
      return true;
    }
    const o = this.kabloOnizleme();
    if (!o) { this.kabloIptal('Kablonun başladığı cihaz bulunamadı.'); return true; }
    if (o.port) {
      if (!o.gecerli) { this.arayuz.bildirim(o.neden); return true; }
      if (env.say(KABLO.esya) < o.maliyet) { this.arayuz.bildirim(`Yetersiz kablo: ${o.maliyet} Elektrik Kablosu gerekir.`); return true; }
      env.harca(KABLO.esya, o.maliyet);
      /* Kablo her zaman çıkıştan girişe kaydedilir */
      const k = this.kablo, ileri = k.tur === 'cikis', n = ileri ? k.n : [...k.n].reverse(), sk = [...k.s, k.sark], sr = ileri ? sk : sk.reverse();
      if (ileri) this.arayuz.kabloEkle(k.k, k.i, o.port.k, o.port.i, n, sr, o.uz);
      else this.arayuz.kabloEkle(o.port.k, o.port.i, k.k, k.i, n, sr, o.uz);
      this.kablo = null; this.ses.koy('tas');
      this.arayuz.bildirim(`Kablo bağlandı: ${o.uz.toFixed(1).replace('.', ',')} blok, ${o.maliyet} kablo harcandı.`);
      return true;
    }
    if (port && port.k === this.kablo.k) { this.arayuz.bildirim(this.kablo.n.length ? 'Kablo aynı cihaza bağlanamaz.' : 'Kablo aynı cihaza bağlanamaz; iptal için sağ tık.'); return true; }
    /* Ara tutturma noktası */
    if (!h) return true;
    if (!o.gecerli) { this.arayuz.bildirim(o.neden); return true; }
    if (this.kablo.n.length >= 10) { this.arayuz.bildirim('Bir kabloda en çok 10 ara nokta olabilir.'); return true; }
    this.kablo.n.push(o.noktalar[o.noktalar.length - 1]); this.kablo.s.push(this.kablo.sark); this.ses.koy('tas');
    return true;
  }

  /* 0.26.0: tıklanan yüzeye göre biçim alan bloklar: şalter (duvar / ayaklı), lamba (zemin / tavan / duvar) */
  yuzeyId(eb, h, f) {
    /* 0.31.0: merdiven bir bloğun alt yüzüne ya da yan yüzün üst yarısına konunca ters (tavana yaslanan) olur */
    if (eb.sekil === 'merdiven' && eb.ters != null) return (h.ny === -1 || (h.ny === 0 && h.py > 0.5) ? eb.ters : eb.taban) + f;
    if (eb.sekil !== 'salter' && eb.sekil !== 'elamba' && eb.sekil !== 'algilayici') return null;
    const yi = h.ny === 0 ? YONLER.findIndex(([a, b]) => a === h.nx && b === h.nz) : -1, duvar = yi >= 0 && KATI[h.id] && OPAK[h.id];
    if (eb.sekil === 'algilayici') return duvar ? 872 + yi * 6 : 872 + (4 + (f + 2) % 4) * 6;   // 0.28.0
    if (eb.sekil === 'salter') return duvar ? 826 + yi * 2 : 834 + ((f + 2) % 4) * 2;
    return h.ny === -1 && KATI[h.id] ? 842 : duvar ? 844 + yi * 2 : 620;
  }
  /* Elde tutulan eşya R ile döndürülebilir mi */
  dondurulebilir(id) { const e = ESYALAR[id]; return !!(e && (id === 47 || (e.tur === 'blok' && BLOKLAR[e.blok].ck) || e.tur === 'cihaz' || e.tur === 'plan' || (e.tur === 'blok' && (this.yonluId(BLOKLAR[e.blok], 0) != null || BLOKLAR[e.blok].sekil === 'salter' || BLOKLAR[e.blok].sekil === 'algilayici')))); }
  dondur() { this.donus = (this.donus + 1) % 4; return this.donus; }

  /* 0.25.0: cihazın kurulacağı yer ve kurulabilirliği: { yon, x, y, z (kök), hucreler, gecerli, neden } */
  cihazYeri(tur, h) {
    const C = CIHAZ[tur], d = this.dunya;
    if (!C || !h) return null;
    let x = h.x + h.nx, y = h.y + h.ny, z = h.z + h.nz;
    if (BLOKLAR[h.id] && BLOKLAR[h.id].degistirilebilir && !BLOKLAR[h.id].cihaz) { x = h.x; y = h.y; z = h.z; }
    const yon = ((this.bakisYonu4() + 2) % 4 + this.donus) % 4;   // ön yüz oyuncuya bakar
    const [ox, oz] = dondurXZ(Math.floor((C.w - 1) / 2), Math.floor((C.d - 1) / 2), yon);   // ayak izi hedefe ortalanır
    const ax = x - ox, az = z - oz, hucreler = cihazHucreleri(C, yon, ax, y, az);
    const sonuc = (gecerli, neden = '') => ({ cihaz: tur, yon, x: ax, y, z: az, hucreler, gecerli, neden });
    const ic = new Set(hucreler.map(q => q[0] + ',' + q[1] + ',' + q[2]));
    let su = 0;
    for (const [hx, hy, hz, i] of hucreler) {
      if (hy < 1 || hy >= PY - 2 || !d.yuklu(hx, hz)) return sonuc(false, 'Cihaz bu yüksekliğe sığmaz.');
      const q = d.blok(hx, hy, hz), qb = BLOKLAR[q];
      const bos = q === 0 || (qb && qb.degistirilebilir && !qb.cihaz) || (C.elektrik === 'su' && SIVI[q] && q !== 59);
      if (!bos) return sonuc(false, `${C.ad} için yer yok: ${C.w} × ${C.d} taban ve ${C.h} blok yükseklik gerekir.`);
      if (this.oyuncu.hucreyiKapliyor(hx, hy, hz)) return sonuc(false, 'Oyuncu cihazın kurulacağı yerde duruyor.');
      if (this.pervaneAlaninda(hx, hy, hz)) return sonuc(false, 'Burası bir rüzgâr türbininin pervane alanı.');
      if (Math.floor(i / (C.w * C.d)) !== 0) continue;
      /* alt sıra: zemin ve su */
      const alt = d.blok(hx, hy - 1, hz), altB = BLOKLAR[alt];
      if (altB && altB.ustuneKonmaz) return sonuc(false, `${altB.ad} üstüne bir şey konamaz.`);
      if (C.elektrik === 'su') {
        const [fx, fz] = dondurXZ(0, 1, yon);
        for (const [a, b, c] of [[0, -1, 0], [fx, 0, fz], [-fx, 0, -fz]]) { if (ic.has((hx + a) + ',' + (hy + b) + ',' + (hz + c))) continue; const w = d.blok(hx + a, hy + b, hz + c); if (SIVI[w] && w !== 59) su++; }
      } else if (!KATI[alt]) return sonuc(false, `${C.ad} düz ve katı bir zemine kurulur.`);
    }
    if (C.elektrik === 'su' && !su) return sonuc(false, 'Su çarkının alt kısmı suya değmelidir (çarkı suyun içine ya da kıyısına kurunuz).');
    if (C.elektrik === 'ruzgar') for (const [px, py, pz] of pervaneHucreleri(yon, ax, y, az)) {
      if (py >= PY - 1 || KATI[d.blok(px, py, pz)]) return sonuc(false, 'Pervanenin döneceği alan boş olmalıdır (yaklaşık 7 blok çapında).');
    }
    return sonuc(true);
  }
  /* ---------- 0.38.1: Çakmak ----------
     Odun yığını -> kamp ateşi; sönük şömine yanar; oyma balkabağı -> balkabağı feneri; örümcek ağı, ot, çalı ve kuru bitkiler 3 × 3 alanda yanarak temizlenir;
     buz suya, kar ve kar katmanı yok olur; canlılar tutuşur. Her kullanım dayanıklılıktan 1 düşer. */
  cakmakSes() { if (this.ses.cakmak) this.ses.cakmak(); else this.ses.tik(); }
  cakmakYipran() { if (this.envanter.aletYipran(1)) { this.ses.aletKirildi(); this.arayuz.bildirim('Çakmak tükendi.'); } }
  cakmakKullan(h) {
    const d = this.dunya, b = BLOKLAR[h.id];
    if (!b) return false;
    const alev = (x, y, z, n = 10) => this.dusenler.renkliParcacik([1, 0.55, 0.15], x + 0.5, y + 0.6, z + 0.5, n);
    const bitti = m => { this.cakmakSes(); this.cakmakYipran(); if (m) this.arayuz.bildirim(m); this.olay('cakmak'); return true; };
    /* Odun yığını tutuşturulunca kamp ateşi olur */
    if (b.ck === 'odunYigini') { d.blokKoy(h.x, h.y, h.z, 48); alev(h.x, h.y, h.z, 18); return bitti('Odun yığını tutuştu: kamp ateşi yandı.'); }
    /* Sönük şömine yanar */
    if (b.sekil === 'somine' && !b.acik) { d.blokKoy(h.x, h.y, h.z, b.taban + b.yon * 2 + 1); alev(h.x, h.y, h.z); return bitti(); }
    /* Oyma balkabağı -> balkabağı feneri */
    if (h.id >= 560 && h.id <= 563) { d.blokKoy(h.x, h.y, h.z, h.id + 4); alev(h.x, h.y, h.z, 6); return bitti(); }
    /* Örümcek ağı, ot, çalı ve kuru bitkiler: 3 × 3 alanda yanar (ekinler, fidanlar ve çiçekler korunur) */
    const yanar = id => id === 148 || id === 25 || id === 29 || id === 30 || id === 43 || id === 147;
    if (yanar(h.id)) {
      let n = 0;
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
        const x = h.x + dx, y = h.y + dy, z = h.z + dz, q = d.blok(x, y, z);
        if (!yanar(q)) continue;
        d.blokKoy(x, y, z, 0); alev(x, y, z, 6); this.dusenler.renkliParcacik([0.25, 0.25, 0.25], x + 0.5, y + 0.8, z + 0.5, 4); n++;
      }
      return bitti(n > 1 ? `${n} bitki ve ağ yanarak temizlendi.` : null);
    }
    /* Buz eriyip su olur; kar ve kar katmanı yok olur */
    if (h.id === 22 || h.id === 186) { d.blokKoy(h.x, h.y, h.z, 7); this.dusenler.renkliParcacik([0.7, 0.85, 1], h.x + 0.5, h.y + 0.6, h.z + 0.5, 10); return bitti(); }
    if (h.id === 21 || h.id === 141) { d.blokKoy(h.x, h.y, h.z, 0); this.dusenler.renkliParcacik([0.95, 0.97, 1], h.x + 0.5, h.y + 0.6, h.z + 0.5, 10); return bitti(); }
    return false;
  }
  /* 0.37.0: çok bloklu nesnenin kurulacağı yer: { coklu, yon, parcalar: [[id, x, y, z], ...], gecerli, neden } */
  cokluYeri(h, D) {
    if (!h || !D) return null;
    const d = this.dunya, hb = BLOKLAR[h.id];
    let x = h.x + h.nx, y = h.y + h.ny, z = h.z + h.nz;
    if (hb && hb.degistirilebilir) { x = h.x; y = h.y; z = h.z; }
    const yon = (this.bakisYonu4() + this.donus) % 4, hucreler = cokluHucreler(D, yon, x, y, z), kati = BLOKLAR[D.taban].kati;
    const parcalar = hucreler.map(([hx, hy, hz, i]) => [D.taban + yon * D.n + i, hx, hy, hz]);
    const sonuc = (gecerli, neden = '') => ({ coklu: D.tur, yon, x, y, z, parcalar, gecerli, neden });
    const boyut = D.n > 1 ? `${D.w} × ${D.d} taban ve ${D.h} blok yükseklik` : 'bir blok';
    for (const [hx, hy, hz, i] of hucreler) {
      if (hy < 1 || hy >= PY - 1 || !d.yuklu(hx, hz)) return sonuc(false, `${D.ad} buraya sığmaz.`);
      const q = d.blok(hx, hy, hz), qb = BLOKLAR[q];
      if (!(q === 0 || (qb && qb.degistirilebilir && !qb.cihaz))) return sonuc(false, `${D.ad} için ${boyut} boş yer gerekir.`);
      if (kati && this.oyuncu.hucreyiKapliyor(hx, hy, hz)) return sonuc(false, `${D.ad} kurulacak yerde durulmaktadır.`);
      if (this.pervaneAlaninda(hx, hy, hz)) return sonuc(false, 'Burası bir rüzgâr türbininin pervane alanı.');
      if (!D.zeminsiz && cokluYerel(D, i)[1] === 0) { const alt = d.blok(hx, hy - 1, hz), altB = BLOKLAR[alt]; if (!KATI[alt] || (altB && altB.ustuneKonmaz)) return sonuc(false, `${D.ad} düz ve katı bir zemine kurulur.`); }
    }
    return sonuc(true);
  }
  /* 0.39.0: bir yatağın bütün hücreleri (kayıt noktasının iptali için) */
  yatakHucreleri(h) {
    const b = BLOKLAR[h.id] || BLOKLAR[this.dunya.blok(h.x, h.y, h.z)];
    if (b && b.ck) { const D = COKLU[b.ck], [ax, ay, az] = cokluCapaKonumu(D, b, h.x, h.y, h.z); return cokluHucreler(D, b.yon, ax, ay, az).map(q => [q[0], q[1], q[2]]); }
    if (b && b.yatak2) { const [dx, dz] = YONLER[b.yon], k = b.parca ? -1 : 1; return [[h.x, h.y, h.z], [h.x + dx * k, h.y, h.z + dz * k]]; }
    return [[h.x, h.y, h.z]];
  }
  /* Çok bloklu nesnenin kök hücresi (sandık içeriği burada tutulur); diğer bloklar için kendisi */
  kokHucre(x, y, z, b) {
    if (!b || !b.ck) return [x, y, z];
    const D = COKLU[b.ck], [ax, ay, az] = cokluCapaKonumu(D, b, x, y, z), k = cokluHucreler(D, b.yon, ax, ay, az)[0];
    return [k[0], k[1], k[2]];
  }
  /* Herhangi bir hücresi kırılınca bütün nesne kalkar, eşyası bir kez düşer */
  cokluKir(h, b) {
    const d = this.dunya, D = COKLU[b.ck], [ax, ay, az] = cokluCapaKonumu(D, b, h.x, h.y, h.z);
    const hucreler = cokluHucreler(D, b.yon, ax, ay, az), [kx, ky, kz] = hucreler[0];
    if (D.sandik) for (const s of this.arayuz.sandikKirildi(kx, ky, kz, false)) this.dusenler.birak(s.id, s.adet, kx + 0.5, ky + 0.5, kz + 0.5, 0, 0, 0, s.dayanim, 0.5, s.buyu);
    if (D.yatak && this.arayuz.yatakKirildi) this.arayuz.yatakKirildi(h.x, h.y, h.z);   // 0.39.0
    for (const [x, y, z, i] of hucreler.reverse()) { const q = BLOKLAR[d.blok(x, y, z)]; if (q && q.ck === b.ck && q.yon === b.yon && q.parca === i) { d.blokKoy(x, y, z, 0); if (i % 2 === 0) this.dusenler.parcacik(h.id, x, y, z, 4); } }
    this.dusenler.birak(D.taban, 1, h.x + 0.5, h.y + 0.4, h.z + 0.5);
    this.ses.kir(b.ses); this.istat('kirilan');
    const a = this.aletBilgi();
    if (a && b.sertlik > 0 && this.envanter.aletYipran(1)) { this.ses.aletKirildi(); this.arayuz.bildirim('Aletiniz kırıldı.'); }
    this.hayatta.yor(0.03);
  }
  /* 0.36.1: iki bloklu yatağın kurulacağı yer: { yatak, yon, x, y, z, parcalar: [[id, x, y, z], ...], gecerli, neden } */
  yatakYeri(h) {
    if (!h) return null;
    const d = this.dunya, hb = BLOKLAR[h.id];
    let x = h.x + h.nx, y = h.y + h.ny, z = h.z + h.nz;
    if (hb && hb.degistirilebilir) { x = h.x; y = h.y; z = h.z; }
    const yon = (this.bakisYonu4() + this.donus) % 4, [dx, dz] = YONLER[yon];
    const parcalar = [[YATAK + yon * 2, x, y, z], [YATAK + yon * 2 + 1, x + dx, y, z + dz]];
    const sonuc = (gecerli, neden = '') => ({ yatak: true, yon, x, y, z, parcalar, gecerli, neden });
    for (const [, px, py, pz] of parcalar) {
      if (py < 1 || py >= PY - 1 || !d.yuklu(px, pz)) return sonuc(false, 'Yatak buraya sığmaz.');
      const q = d.blok(px, py, pz), qb = BLOKLAR[q];
      if (!(q === 0 || (qb && qb.degistirilebilir && !qb.cihaz))) return sonuc(false, 'Yatak için iki blok boş yer gerekir.');
      if (this.oyuncu.hucreyiKapliyor(px, py, pz)) return sonuc(false, 'Yatağın kurulacağı yerde durulmaktadır.');
      const alt = d.blok(px, py - 1, pz), altB = BLOKLAR[alt];
      if (!KATI[alt] || (altB && altB.ustuneKonmaz)) return sonuc(false, 'Yatak düz ve katı bir zemine kurulur.');
    }
    return sonuc(true);
  }
  /* 0.25.0: seçim kutusu bütün cihazı sarar (hücreye göre) */
  cihazKutusu(b, x, y, z) {
    const C = CIHAZ[b.cihaz], [ax, ay, az] = kokKonumu(b, x, y, z), s = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
    for (const k of C.carp) for (const lx of [k[0], k[3]]) for (const lz of [k[2], k[5]]) {
      const [dx, dz] = dondurXZ(lx - 0.5, lz - 0.5, b.yon), wx = ax + 0.5 + dx - x, wz = az + 0.5 + dz - z;
      s[0] = Math.min(s[0], wx); s[3] = Math.max(s[3], wx); s[2] = Math.min(s[2], wz); s[5] = Math.max(s[5], wz);
      s[1] = Math.min(s[1], ay + k[1] - y); s[4] = Math.max(s[4], ay + k[4] - y);
    }
    return s;
  }
  /* Bu hücre bir rüzgâr türbininin pervane alanında mı */
  pervaneAlaninda(x, y, z) {
    for (const [, [ax, ay, az]] of this.dunya.elektrikler) {
      if (Math.abs(ax - x) > 7 || Math.abs(az - z) > 7 || y < ay || y > ay + 12) continue;
      const b = BLOKLAR[this.dunya.blok(ax, ay, az)];
      if (!b || b.cihaz !== 'ruzgar' || b.parca) continue;
      for (const [px, py, pz] of pervaneHucreleri(b.yon, ax, ay, az)) if (px === x && py === y && pz === z) return true;
    }
    return false;
  }
  /* 0.25.0: cihazın herhangi bir hücresi kırılınca bütün cihaz kaldırılır ve eşyası düşer */
  cihazKir(h, b) {
    const d = this.dunya, C = CIHAZ[b.cihaz], [ax, ay, az] = kokKonumu(b, h.x, h.y, h.z);
    const hucreler = cihazHucreleri(C, b.yon, ax, ay, az).filter(([x, y, z]) => BLOKLAR[d.blok(x, y, z)] && BLOKLAR[d.blok(x, y, z)].cihaz === b.cihaz);
    for (const [x, y, z, i] of hucreler.reverse()) { d.blokKoy(x, y, z, 0); if (i % 3 === 0) this.dusenler.parcacik(h.id, x, y, z, 5); }   // kök hücre en son kalkar
    this.dusenler.birak(C.esya, 1, h.x + 0.5, h.y + 0.4, h.z + 0.5);
    if (C.sandik) for (const s of this.arayuz.sandikKirildi(ax, ay, az, false)) this.dusenler.birak(s.id, s.adet, ax + 0.5, ay + 0.5, az + 0.5, 0, 0, 0, s.dayanim, 0.5, s.buyu);   // 0.29.0: taretin okları
    this.ses.kir(C.ses); this.istat('kirilan');
    const a = this.aletBilgi();
    if (a && this.envanter.aletYipran(1)) { this.ses.aletKirildi(); this.arayuz.bildirim('Aletiniz kırıldı.'); }
    this.hayatta.yor(0.05);
  }
  /* 0.25.0: yerleştirme önizlemesi: elde cihaz ya da yönlü blok varken konulacağı yer */
  onizlemeBilgisi() {
    const s = this.envanter.seciliYuva(), e = s && ESYALAR[s.id], h = this.hedef;
    if (!e || !h || this.hedefCanli || this.hedefTekne) return null;
    if (e.tur === 'cihaz') return this.cihazYeri(e.cihaz, h);
    if (s.id === 47) return this.yatakYeri(h);   // 0.36.1
    if (e.tur === 'blok' && BLOKLAR[e.blok].ck) return this.cokluYeri(h, COKLU[BLOKLAR[e.blok].ck]);   // 0.37.0
    if (e.tur !== 'blok') return null;
    const eb = BLOKLAR[e.blok], f = (this.bakisYonu4() + this.donus) % 4, id = this.yuzeyId(eb, h, f) ?? this.yonluId(eb, f);
    if (id == null) return null;
    const d = this.dunya, hb = BLOKLAR[h.id];
    let x = h.x + h.nx, y = h.y + h.ny, z = h.z + h.nz;
    if (hb && hb.degistirilebilir) { x = h.x; y = h.y; z = h.z; }
    const q = d.blok(x, y, z), qb = BLOKLAR[q], alt = BLOKLAR[d.blok(x, y - 1, z)];
    const gecerli = (q === 0 || (qb && qb.degistirilebilir) || (SIVI[q] && q !== 59)) && !(alt && alt.ustuneKonmaz) && !(KATI[id] && (this.oyuncu.hucreyiKapliyor(x, y, z) || this.pervaneAlaninda(x, y, z)));
    return { id, x, y, z, gecerli };
  }

  /* Bakış yönü dört yöne yuvarlanır: 0 kuzey (-z), 1 doğu, 2 güney, 3 batı */
  bakisYonu4() { const y = this.oyuncu.yaw, dx = -Math.sin(y), dz = -Math.cos(y); return Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 1 : 3) : (dz > 0 ? 2 : 0); }
  koyVeHarca(x, y, z, id, env) {
    if (!this.dunya.blokKoy(x, y, z, id)) return false;
    env.seciliAzalt(1); this.ses.koy(BLOKLAR[id].ses);
    return true;
  }
  /* Kapı, çit kapısı, tuzak kapı */
  ac(h) {
    const b = BLOKLAR[h.id], d = this.dunya;
    if (b.sekil === 'kapi') {
      const yeniA = b.acik ? 0 : 1, oy = h.y + (b.ust ? -1 : 1), ob = BLOKLAR[d.blok(h.x, oy, h.z)];
      d.blokKoy(h.x, h.y, h.z, 88 + b.yon * 4 + yeniA * 2 + b.ust);
      if (ob && ob.sekil === 'kapi') d.blokKoy(h.x, oy, h.z, 88 + ob.yon * 4 + yeniA * 2 + ob.ust);
      this.ses.kapi(yeniA);
      return true;
    }
    if (b.sekil === 'citKapi') {
      if (b.acik && this.oyuncu.hucreyiKapliyor(h.x, h.y, h.z)) return true;
      d.blokKoy(h.x, h.y, h.z, 105 + b.eksen * 2 + (b.acik ? 0 : 1)); this.ses.kapi(!b.acik); return true;
    }
    if (b.sekil === 'tuzak') { d.blokKoy(h.x, h.y, h.z, 121 + b.yon * 2 + (b.acik ? 0 : 1)); this.ses.kapi(!b.acik); return true; }
    /* 0.31.0: perde açılıp kapanır, şömine yakılıp söndürülür */
    if (b.sekil === 'perde') { d.blokKoy(h.x, h.y, h.z, b.taban + b.yon * 2 + (b.acik ? 0 : 1)); this.ses.koy('yun'); return true; }
    if (b.sekil === 'somine') { d.blokKoy(h.x, h.y, h.z, b.taban + b.yon * 2 + (b.acik ? 0 : 1)); if (b.acik) this.ses.koy('tas'); else if (this.ses.cakmak) this.ses.cakmak(); else this.ses.koy('odun'); return true; }
    /* 0.17.0: kol açılıp kapanır, düğmeye basılır (bir saniye sonra kendiliğinden kalkar), müzik kutusu ezgisini çalar */
    /* 0.28.0: Hareket algılayıcının kipi sağ tıkla değişir */
    if (b.elektrik === 'algilayici') { const m = (b.kip + 1) % 3; d.blokKoy(h.x, h.y, h.z, h.id + (m - b.kip) * 2); this.ses.kol(true); this.arayuz.bildirim(`Hareket Algılayıcı: ${['herkesi', 'yalnızca oyuncuları', 'yalnızca canavarları'][m]} algılar.`); return true; }
    /* 0.24.0: Şalter elektrik ağını açar / keser */
    if (b.mekanik === 'salter') { d.blokKoy(h.x, h.y, h.z, b.taban + (b.acik ? 0 : 1)); this.ses.kol(!b.acik); this.arayuz.bildirim(b.acik ? 'Şalter kapatıldı: ağ kesildi.' : 'Şalter açıldı: ağ bağlandı.'); return true; }
    if (b.mekanik === 'kol') { d.blokKoy(h.x, h.y, h.z, b.acik ? 233 : 234); this.ses.kol(!b.acik); return true; }
    /* 0.20.0: Geciktiricinin gecikmesi sağ tıkla 1-4 adım arasında döner */
    if (b.mekanik === 'gecik') { d.blokKoy(h.x, h.y, h.z, 523 + b.yon * 8 + ((b.gecikme + 1) % 4) * 2 + b.acik); this.ses.kol(true); this.arayuz.bildirim(`Gecikme: ${((b.gecikme + 1) % 4) + 1} adım (${(((b.gecikme + 1) % 4) + 1) / 10} sn)`.replace('.', ',')); return true; }
    if (b.mekanik === 'dugme') { if (!b.acik) { d.blokKoy(h.x, h.y, h.z, 236); this.ses.dugme(); } return true; }
    if (b.mekanik === 'muzik') {
      const m = ezgiTuru(d.blok(h.x, h.y - 1, h.z)), V = this.varliklar;
      if (V && !V.ayna) V.efekt({ t: 'patlama', x: h.x + 0.5, y: h.y + 1.2, z: h.z + 0.5, c: [0.95, 0.5, 0.75], n: 6, ses: 'nota', m });
      else { this.ses.melodi(m, 1); this.dusenler.parcacik(251, h.x, h.y + 0.6, h.z, 4); }
      return true;
    }
    return false;
  }
  /* Tarlanın 4 blok çevresinde su var mı */
  suYakin(x, y, z) {
    for (let dy = 0; dy <= 1; dy++) for (let dz = -4; dz <= 4; dz++) for (let dx = -4; dx <= 4; dx++) { const b = this.dunya.blok(x + dx, y + dy, z + dz); if (b === 7 || b === 31) return true; }
    return false;
  }

  /* Elde tutulan eşyayı ileri at */
  at(hepsi) {
    const s = this.envanter.seciliYuva();
    if (!s) return;
    if (ESYALAR[s.id].gorevEsyasi) { this.arayuz.bildirim('Görev eşyası atılamaz.'); return; }   // 0.35.0
    const n = hepsi ? s.adet : 1;
    const goz = this.oyuncu.gozKonumu(), yon = this.oyuncu.bakisYonu();
    this.dusenler.birak(s.id, n, goz.x + yon.x * 0.5, goz.y - 0.3 + yon.y * 0.5, goz.z + yon.z * 0.5, yon.x * 5, yon.y * 5 + 2, yon.z * 5, s.dayanim, 1.5, s.buyu);
    this.envanter.seciliAzalt(n);
    this.vurus = 0.01;
  }
}

export { THREE };
