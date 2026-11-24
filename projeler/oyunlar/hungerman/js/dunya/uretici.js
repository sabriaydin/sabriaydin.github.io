/* HungerMan - dünya üreticisi, sürüm 2 (0.41.0)
   Tohumdan belirlenimli olarak üretilir: aynı tohum her bilgisayarda aynı dünyayı verir (çok oyunculu için gerekli).
   Dünya, kıyıları denizle çevrili büyük bir kara parçasıdır (yükseklik 256, kıta yarıçapı 4000, sınır 5400).
   Eski dünyalar (sürüm 1) dondurulmuş uretici-v1.js ile üretilir; hangi üreticinin kullanılacağı dünya kaydındaki "uretici" alanından bellidir.

   Sürüm 2'nin arazisi:
   - Arazi biçimi: sırt gürültüsüyle sivri zirveler ve keskin sırtlar, basamaklı vadiler ve uçurumlar, platolar, kayalık tepeler,
     sıcak ve kurak bölgelerde basamaklı kızıl kayalıklar (mesa), savanda alçak platolar, kanyonlar, doğal kemerler ve uçurum altı oyukları
   - Su: dağlardan denize uzanan, yüksek bölgelerde basamaklarla inen (basamaklarda şelale oluşan) nehirler, yüksek arazide göller,
     yalıyarlı, taşlı ve geniş kumsallı kıyılar, takımadalar ve açık denizde mantar adaları
   - Alt biyomlar (kolon().ab): çiçekli çayır, sık orman, sonbahar ormanı, kayalık tepeler, karlı zirveler, mangrov, mantar adası, kızıl kayalıklar, göl, taşlı kıyı, yalıyar
   - Bitki örtüsü: kalın gövdeli dev ağaçlar, farklı boylarda ağaçlar, devrik kütükler, çalılar, yosunlu kayalar, çakıl ve toprak lekeleri,
     mantar kümeleri, orman açıklıkları, çayırlarda ağaç kümeleri, göl ve nehir kıyılarında saz ve nilüfer
   - Yeraltı: kıvrımlı tüneller, derinlerde geniş mağara salonları, yeraltı gölleri ve nehirleri, yüzeye açılan mağara ağızları,
     derinliğe ve biyoma göre dağılan cevherler, mağara duvarlarında görünen büyük cevher damarları, granit, kireçtaşı ve bazalt kütleleri
   3B gürültüler 4 blokluk ızgarada örneklenip ara değerlenir (parça üretimi hızlıdır). */
import { PB, PY, PHACIM, DENIZ, KITA_YARICAP, DUNYA_SINIRI, dizin, diyarMi } from '../sabitler.js';
import { BIYOMLAR, BY, KARLI, SICAK, karliZirve, iklimBiyomu } from './biyom.js';
import { agacKur } from './agac.js';
import { agacKur2, AGAC_YARICAP } from './agac2.js';
import { UreticiV1 } from './uretici-v1.js';
import { diyarUret } from './diyar-uretici.js';
import { Gurultu, karistir, karma2, karma3, uretec, yumusak } from '../rastgele.js';
import { yapiYaz, yapilarAlan } from './yapi-uretici.js';
import { koyYaz, koyIcinde } from './koy-uretici.js';
import { zindanYaz } from './zindan-uretici.js';
import { batikYaz } from './batik-uretici.js';
import { adaYaz } from './ada-uretici.js';
import { madenYaz } from './maden-uretici.js';
import { MEYVE_YAPRAK_ID, DOGA41, YAPI37 } from '../bloklar.js';

export { BIYOMLAR, BY, KARLI, SICAK, karliZirve, iklimBiyomu, agacKur };
/* Dünyanın üretici sürümüne göre üretici (1: eski dünyalar, 2: 0.41.0 ve sonrası) */
export function ureticiOlustur(tohum, surum) { return surum >= 2 ? new UreticiV2(tohum) : new UreticiV1(tohum); }

const D = DOGA41;
const GRANIT = YAPI37.granit, KIRECTASI = YAPI37.kirectasi, BAZALT = YAPI37.bazalt;
/* Kızıl kayalıkların renk katmanları (pişmiş kil: düz, kırmızı, turuncu, sarı, beyaz; kum taşı) */
const BANT = [962, 960, 961, 962, 963, 24, 961, 960, 962, 966, 961, 963, 962, 960];
const YAPRAKLAR = new Set([9, 11, 13, 145, ...MEYVE_YAPRAK_ID, D.kizilYaprak, D.turuncuYaprak, D.sariYaprak, D.mangrovYaprak]);
const SONBAHAR_YAPRAK = [D.kizilYaprak, D.turuncuYaprak, D.sariYaprak];
const TAS = new Set([2, 3, 6, 15, GRANIT, KIRECTASI, BAZALT]);
const NEHIR_ADIM = 6, GOL_HUCRE = 360, MANTAR_HUCRE = 1200, KEMER_HUCRE = 260;
/* Ağaç ve süs ızgaraları (hücre boyu, tohum) */
const HUCRE = 5, CALI_HUCRE = 4, KUTUK_HUCRE = 9, KAYA_HUCRE = 11;
const lerp = (a, b, t) => a + (b - a) * t;
const yuzeyMi = ab => ab !== BY.OKYANUS && ab !== BY.DERIN;

/* 4 blokluk ızgarada örneklenen ve üç doğrusal ara değerlenen 3B gürültü (parça başına) */
class Izgara {
  constructor(fn, x0, z0, yUst) {
    this.NY = (yUst >> 2) + 2;
    const g = this.g = new Float32Array(25 * this.NY);
    for (let j = 0; j < this.NY; j++) for (let k = 0; k < 5; k++) for (let i = 0; i < 5; i++) g[(j * 5 + k) * 5 + i] = fn(x0 + i * 4, j * 4, z0 + k * 4);
  }
  al(lx, y, lz) {
    const i = lx >> 2, k = lz >> 2, j = y >> 2, fx = (lx & 3) / 4, fz = (lz & 3) / 4, fy = (y & 3) / 4, g = this.g;
    const b = (j * 5 + k) * 5 + i, u = b + 25;
    const a0 = g[b] + (g[b + 1] - g[b]) * fx, a1 = g[b + 5] + (g[b + 6] - g[b + 5]) * fx;
    const c0 = g[u] + (g[u + 1] - g[u]) * fx, c1 = g[u + 5] + (g[u + 6] - g[u + 5]) * fx;
    const a = a0 + (a1 - a0) * fz, c = c0 + (c1 - c0) * fz;
    return a + (c - a) * fy;
  }
}

/* Biyoma göre ağaç sıklığı (hücre başına olasılık) */
const AGAC_OLASILIK = {
  [BY.ORMAN]: 0.78, [BY.SIK]: 0.95, [BY.SONBAHAR]: 0.74, [BY.HUS]: 0.7, [BY.TAYGA]: 0.62, [BY.CAYIR]: 0.02, [BY.CICEKLI]: 0.015, [BY.DAG]: 0.1,
  [BY.KAYALIK]: 0.1, [BY.SAVAN]: 0.06, [BY.BATAKLIK]: 0.3, [BY.MANGROV]: 0.42, [BY.KARLI_OVA]: 0.03, [BY.MANTAR]: 0.08, [BY.YALIYAR]: 0.05
};

export class UreticiV2 {
  constructor(tohum) {
    this.tohum = tohum >>> 0;
    const g = k => new Gurultu(karistir(this.tohum + k * 7919));
    /* Sürüm 1 ile aynı anahtarlar (iklim gürültüleri aynı tohumda benzer bölgeler verir) */
    this.gK = g(1); this.gD = g(2); this.gT = g(3); this.gN = g(4); this.gM = g(5); this.gR = g(6);
    this.gNe = g(7); this.gH = g(8); this.gA = g(9); this.gB = g(10); this.gO = g(11); this.gG = g(12); this.gZ = g(13); this.gY = g(14); this.gY2 = g(15); this.gY3 = g(16);
    this.gC = g(17); this.gC2 = g(18);
    /* Sürüm 2 */
    this.gW = g(41); this.gAm = g(42); this.gAd = g(43); this.gKy = g(44); this.gP = g(45); this.gP2 = g(46); this.gTr = g(47); this.gMe = g(48); this.gMs = g(49);
    this.gNw = g(50); this.gRk = g(51); this.gRk2 = g(52); this.gAlt = g(53); this.gAc = g(54); this.gKm = g(55); this.gYm = g(56); this.gMk = g(57); this.gCi = g(58);
    this.gBm = g(59); this.gYg = g(60); this.gYn = g(61); this.gTs = g(62); this.gTs2 = g(63); this.gV = g(64); this.gVm = g(65); this.gU = g(66);
    this.ky = { x: 0, z: 0, h: 0, b: 0, c: 0, t: 0, d: 0, te: 0, n: 0 };
    this.golOnbellek = new Map();
  }

  /* ---------- Arazi ---------- */
  /* Ham arazi: nehir ve göl oyulmadan önceki yükseklik ve bölge bilgileri */
  arazi(x, z, o) {
    const wx = x + this.gW.f2(x / 700, z / 700, 2) * 140, wz = z + this.gW.f2(x / 700 + 37.1, z / 700 - 19.3, 2) * 140;
    const mesafe = Math.sqrt(x * x + z * z) / KITA_YARICAP;
    let c = 0.55 - 1.15 * mesafe * mesafe + 0.42 * this.gK.f2(wx / 1650, wz / 1650, 4) + 0.12 * this.gD.f2(wx / 390, wz / 390, 3);
    const sinir = Math.abs(x) > DUNYA_SINIRI - 200 || Math.abs(z) > DUNYA_SINIRI - 200;
    /* Takımadalar: kıyıya yakın denizlerde yer yer küçük ada kümeleri */
    let ada = 0, mantar = 0;
    if (!sinir && c < 0.15 && c > -0.75) {
      const tk = yumusak(0.2, 0.5, this.gAm.g2(x / 1500 + 13, z / 1500 - 7));
      if (tk > 0) { const a = this.gAd.f2(x / 240, z / 240, 3); ada = Math.max(0, a - 0.22) * 1.9 * tk * yumusak(-0.75, -0.45, c); if (ada > 0) c += ada; }
    }
    /* Mantar adaları: açık denizde seyrek */
    if (!sinir && c < -0.3) { mantar = this.mantarAda(x, z); if (mantar > 0) c = Math.max(c, -0.02 + mantar * 0.3); }
    if (sinir) c = Math.min(c, -0.4);
    const t = this.gT.f2(x / 2800, z / 2800, 2), nem = this.gN.f2(x / 2200, z / 2200, 2);
    let h, dagK = 0, bataklik = 0, plato = 0, kizil = 0, kayalik = 0, yali = 0, kt = 0, tm = 0;
    if (c < 0) {
      const derinlik = Math.min(1, -c * 3);
      h = DENIZ - 2 - derinlik * 30 + this.gD.g2(x / 40, z / 40) * 2;
    } else {
      kt = this.gKy.g2(x / 800, z / 800);
      h = DENIZ + 1 + c * 30;
      h += this.gH.f2(x / 180, z / 180, 3) * 10 * yumusak(0, 0.15, c);
      /* Yalıyar: kıyıdan hemen sonra dik yükselen kayalık kıyı */
      yali = yumusak(0.26, 0.4, kt) * (1 - Math.min(1, mantar * 4));
      if (yali > 0) h += yali * yumusak(0.0, 0.006, c) * (13 + 9 * this.gP2.g2(x / 200, z / 200));
      /* Geniş kumsal: alçak ve düz kıyı şeridi */
      const genis = yumusak(-0.22, -0.38, kt) * (1 - yumusak(0.07, 0.14, c));
      if (genis > 0) h = lerp(h, Math.min(h, DENIZ + 1 + c * 10), genis);
      /* Dağlar: çok katlı sırt gürültüsü (sivri zirveler, keskin sırtlar) */
      dagK = yumusak(0.05, 0.42, this.gM.f2(x / 1900 + 50, z / 1900, 2)) * yumusak(0.04, 0.22, c);
      if (dagK > 0) {
        let r = 0, a = 1, f = 1 / 560, w = 1, top = 0;
        for (let i = 0; i < 4; i++) {
          let n = 1 - Math.abs(this.gR.g2(wx * f + i * 17.3, wz * f - i * 9.1)); n *= n; n *= w;
          w = Math.min(1, n * 1.8); r += n * a; top += a; a *= 0.5; f *= 2.1;
        }
        r /= top;
        h += dagK * (Math.pow(r, 1.5) * 165 + r * 18);
      }
      /* Kayalık tepeler: dağ dışındaki yüksekçe, engebeli ve taşlık arazi */
      kayalik = yumusak(0.28, 0.44, this.gRk.g2(x / 760, z / 760)) * yumusak(0.1, 0.2, c) * (1 - Math.min(1, dagK * 2.5));
      if (kayalik > 0) h += kayalik * (10 + (1 - Math.abs(this.gRk2.f2(x / 70, z / 70, 3))) * 22);
      /* Platolar: dik kenarlı yüksek düzlükler */
      plato = yumusak(0.2, 0.27, this.gP.f2(x / 1200, z / 1200, 2)) * yumusak(0.08, 0.2, c) * (1 - Math.min(1, dagK * 2));
      if (plato > 0) h += plato * (20 + 12 * this.gP2.g2(x / 600, z / 600));
      /* Kızıl kayalıklar (mesa): sıcak ve kurak bölgelerde düz taban üstünde basamaklı, dik yamaçlı tepeler */
      kizil = yumusak(SICAK.SICAK - 0.04, SICAK.SICAK + 0.04, t) * yumusak(0.0, -0.1, nem) * yumusak(0.08, 0.22, this.gMe.g2(x / 1000, z / 1000)) * (1 - Math.min(1, dagK * 3)) * yumusak(0.06, 0.14, c);
      if (kizil > 0) {
        h = lerp(h, DENIZ + 6 + this.gH.f2(x / 100, z / 100, 2) * 3, kizil);
        const ms = this.gMs.f2(x / 230, z / 230, 3);
        const y = yumusak(0.0, 0.05, ms);
        if (y > 0) h += y * kizil * (20 + 22 * yumusak(0.05, 0.3, ms));
      }
      /* Savan platoları: alçak, düz tepeli */
      const sav = yumusak(SICAK.ILIK, SICAK.ILIK + 0.05, t) * yumusak(-0.05, -0.15, nem) * (1 - kizil) * (1 - Math.min(1, dagK * 3)) * yumusak(0.08, 0.16, c);
      if (sav > 0) { const ms2 = this.gMs.f2(x / 180 + 40, z / 180, 3); h += yumusak(0.22, 0.27, ms2) * sav * 15; }
      /* Basamaklı vadiler ve uçurumlar: belli bölgelerde yükseklik basamaklanır */
      tm = Math.max(yumusak(0.2, 0.45, this.gTr.g2(x / 800, z / 800)) * yumusak(0.1, 0.25, c), kizil * 0.95, plato > 0.03 && plato < 0.97 ? 0.8 : 0);
      if (tm > 0 && h > DENIZ + 6) {
        const A = kizil > 0.5 ? 4 : 6, q = h / A, f = q - Math.floor(q);
        h = lerp(h, (Math.floor(q) + yumusak(0.55, 0.85, f)) * A, tm);
      }
      if (c < 0.04) h = (DENIZ - 1) + (h - (DENIZ - 1)) * lerp(c / 0.04, 1, yali);
      /* Bataklık: ılıman ve çok nemli düzlükler deniz seviyesine yakın düzleşir */
      bataklik = yumusak(0.3, 0.4, nem) * yumusak(SICAK.SERIN, SICAK.SERIN + 0.08, t) * (1 - Math.min(1, dagK * 6)) * (1 - kayalik) * (1 - plato) * yumusak(0.06, 0.12, c);
      if (bataklik > 0) {
        const n = this.gZ.g2(x / 20, z / 20), hb = n > 0.22 ? DENIZ - 1 : DENIZ + 1 + (n < -0.3 ? 1 : 0);
        h += (hb - h) * bataklik;
      }
    }
    o.x = x; o.z = z; o.h = h; o.c = c; o.t = t; o.n = nem; o.d = dagK; o.bt = bataklik; o.pl = plato; o.kz = kizil; o.ky = kayalik; o.yl = yali; o.kt = kt; o.ma = mantar; o.ad = ada; o.tm = tm;
    return o;
  }

  /* Mantar adası (hücre başına en fazla bir): 0 dışında, 1 merkezde */
  mantarAda(x, z) {
    const hx = Math.floor(x / MANTAR_HUCRE), hz = Math.floor(z / MANTAR_HUCRE);
    if (karma2(this.tohum ^ 0x6d616e, hx, hz) > 0.4) return 0;
    const cx = hx * MANTAR_HUCRE + 120 + karma2(this.tohum ^ 0x6d616f, hx, hz) * (MANTAR_HUCRE - 240);
    const cz = hz * MANTAR_HUCRE + 120 + karma2(this.tohum ^ 0x6d6170, hx, hz) * (MANTAR_HUCRE - 240);
    if (Math.hypot(cx, cz) < KITA_YARICAP * 1.02) return 0;
    const R = 45 + karma2(this.tohum ^ 0x6d6171, hx, hz) * 45;
    const d = Math.hypot(x - cx, z - cz) / (R * (1 + 0.25 * this.gD.g2(x / 30, z / 30)));
    return d < 1 ? 1 - d : 0;
  }

  /* Göl (hücre başına en fazla bir): yüksek arazide, kıyısının en alçak noktasının altında sabit su seviyeli çanak */
  gol(hx, hz) {
    const k = hx * 65536 + hz;
    if (this.golOnbellek.has(k)) return this.golOnbellek.get(k);
    let G = null;
    if (karma2(this.tohum ^ 0x676f6c, hx, hz) < 0.42) {
      const cx = hx * GOL_HUCRE + 90 + Math.floor(karma2(this.tohum ^ 0x676f6d, hx, hz) * (GOL_HUCRE - 180));
      const cz = hz * GOL_HUCRE + 90 + Math.floor(karma2(this.tohum ^ 0x676f6e, hx, hz) * (GOL_HUCRE - 180));
      const R = 26 + karma2(this.tohum ^ 0x676f6f, hx, hz) * 44;
      const q = {};
      this.arazi(cx, cz, q);
      if (q.c > 0.1 && q.h > DENIZ + 6 && q.kz < 0.3 && q.bt < 0.3) {
        let min = 1e9, max = -1e9;
        for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; this.arazi(cx + Math.cos(a) * R * 1.05, cz + Math.sin(a) * R * 1.05, q); min = Math.min(min, q.h); max = Math.max(max, q.h); }
        const L = Math.floor(min) - 1;
        if (L > DENIZ + 3 && max - min < 34) G = { x: cx, z: cz, R, L, derin: 4 + Math.floor(karma2(this.tohum ^ 0x676f70, hx, hz) * 7) };
      }
    }
    if (this.golOnbellek.size > 4096) this.golOnbellek.clear();
    this.golOnbellek.set(k, G);
    return G;
  }

  /* Bir sütunun yüksekliği, ana biyomu (b), alt biyomu (ab), su seviyesi (su) ve iklimi */
  kolon(x, z, o = this.ky) {
    this.arazi(x, z, o);
    let h = o.h, su = DENIZ, golde = false, nehir = false;
    const c = o.c;
    /* Göller */
    if (c > 0.08) {
      const G = this.gol(Math.floor(x / GOL_HUCRE), Math.floor(z / GOL_HUCRE));
      if (G) {
        const d = Math.hypot(x - G.x, z - G.z) / (G.R * (1 + 0.22 * this.gD.g2(x / 70, z / 70) + 0.06 * this.gD.g2(x / 19, z / 19)));
        if (d < 1) { h = Math.min(h, G.L - 1 - Math.floor(G.derin * (1 - d * d))); su = G.L; golde = true; }
        else if (d < 1.25 && h > G.L + 1) h = G.L + 1 + (h - G.L - 1) * yumusak(1, 1.25, d);
      }
    }
    /* Nehirler: kıvrımlı çizgiler boyunca vadi oyulur; su seviyesi geniş ölçekli araziyi basamaklarla izler (basamaklarda şelale) */
    if (c > 0.02 && !golde) {
      const rx = x + this.gNw.g2(x / 160, z / 160) * 40, rz = z + this.gNw.g2(x / 160 + 71, z / 160 - 33) * 40;
      const rv = Math.abs(this.gNe.f2(rx / 1050, rz / 1050, 3));
      const W = 0.0085 + 0.0035 * this.gNw.g2(x / 400 + 5, z / 400);
      const ust = W * (o.d > 0.3 ? 2.8 : 4.6);
      if (rv < ust) {
        const hb = DENIZ + 1 + c * 30 + o.pl * 20 + o.d * 42 + o.ky * 12;
        let L = DENIZ;
        if (hb > DENIZ + 10) L = DENIZ + Math.floor((hb - DENIZ - 4) / NEHIR_ADIM) * NEHIR_ADIM;
        if (o.kz > 0.5) L = DENIZ;
        if (rv < W) { h = Math.min(h, L - 1 - Math.floor((1 - rv / W) * 2.5)); su = L; nehir = true; }
        else {
          const vadi = yumusak(W * 0.9, ust, rv), hedef = L + 1;
          if (h > hedef) h = hedef + (h - hedef) * vadi;
          else if (L > DENIZ) h = Math.max(h, hedef);
        }
      }
    }
    h = Math.floor(h);
    if (h < 3) h = 3; if (h > PY - 8) h = PY - 8;
    /* Yükseklikle soğuma */
    const te = o.t - Math.max(0, h - (DENIZ + 30)) * 0.0045;
    let b, ab;
    if (h < su && (h < DENIZ || golde || nehir)) {
      if (c < 0 && o.ma <= 0) b = h < DENIZ - 16 ? BY.DERIN : BY.OKYANUS;
      else if (golde) { b = BY.NEHIR; ab = BY.GOL; }
      else if (o.bt > 0.5) { b = BY.BATAKLIK; if (te > SICAK.ILIK - 0.02) ab = BY.MANGROV; }
      else b = c < 0 ? BY.OKYANUS : BY.NEHIR;
    }
    else if (o.ma > 0.05) { b = BY.ORMAN; ab = BY.MANTAR; }
    /* Kıyılar: karlı bölgelere ve donmuş denize komşu kıyılar karlıdır */
    else if (h <= DENIZ + 2 && c < 0.08) {
      b = te < SICAK.SOGUK + 0.08 ? BY.KARLI_KUMSAL : BY.KUMSAL;
      if (b === BY.KUMSAL && o.kt > 0.06) ab = BY.TASLI_KIYI;
    }
    else if (h > DENIZ + 55) { b = BY.DAG; if (karliZirve({ h: h - 40, te })) ab = BY.KARLI_ZIRVE; }
    else if (o.bt > 0.5) { b = BY.BATAKLIK; if (te > SICAK.ILIK - 0.02) ab = BY.MANGROV; }
    else if (o.kz > 0.4) { b = BY.COL; ab = BY.KIZIL; }
    else {
      b = iklimBiyomu(te, o.n);
      const s = this.gAlt.g2(x / 650, z / 650);
      if (o.ky > 0.5) ab = BY.KAYALIK;
      else if (o.yl > 0.5 && c < 0.06) ab = BY.YALIYAR;
      else if (b === BY.CAYIR && s > 0.28) ab = BY.CICEKLI;
      else if (b === BY.ORMAN && s > 0.22) ab = BY.SIK;
      else if ((b === BY.ORMAN || b === BY.HUS) && te < 0.12 && s < -0.28) ab = BY.SONBAHAR;
    }
    o.h = h; o.b = b; o.ab = ab; o.te = te; o.su = su; o.gl = golde; o.nh = nehir;
    return o;
  }

  /* Mağara girişi bölgesi (yüzeye açılan tüneller); ağaçlar bu bölgeye konmaz */
  girisMi(x, z) { return this.gG.g2(x / 90, z / 90) > 0.6; }

  /* Yüzey bloğu */
  ustBlok(o, x, z) {
    switch (o.ab ?? o.b) {
      case BY.MANTAR: return D.miselyum;
      case BY.KIZIL: return o.h > DENIZ + 16 && this.gD.g2(x / 14, z / 14) > -0.1 ? 142 : D.kizilKum;
      case BY.TASLI_KIYI: { const n = this.gZ.g2(x / 9, z / 9); return n > 0.25 ? 6 : n < -0.35 ? 2 : 5; }
      case BY.KARLI_ZIRVE: return 21;
      case BY.KAYALIK: { const n = this.gYm.g2(x / 16, z / 16); return n > 0.3 ? 2 : n < -0.55 ? 6 : 4; }
      case BY.GOL: { const n = this.gZ.g2(x / 24, z / 24); return n > 0.35 ? 23 : n < -0.3 ? 6 : 3; }
      case BY.MANGROV: return o.h < o.su ? 3 : 143;
      case BY.CICEKLI: case BY.SIK: case BY.SONBAHAR: case BY.YALIYAR: return o.b === BY.TAYGA || o.b === BY.KARLI_OVA ? 45 : o.b === BY.SAVAN ? 142 : 4;
    }
    switch (o.b) {
      case BY.TAYGA: case BY.KARLI_OVA: return 45;
      case BY.SAVAN: return 142;
      case BY.BATAKLIK: return 143;
      case BY.COL: case BY.KUMSAL: return 5;
      case BY.KARLI_KUMSAL: return 21;
      case BY.DAG: {
        if (o.te < SICAK.SOGUK) return o.h > DENIZ + 70 ? 21 : 45;
        if (o.te > 0.3) return o.h > DENIZ + 80 || this.gD.g2(x / 30, z / 30) > 0 ? 24 : 142;
        return this.gD.g2(x / 30, z / 30) > 0.1 && o.h < DENIZ + 75 ? (o.te > 0.2 ? 142 : 4) : 2;
      }
      case BY.OKYANUS: case BY.DERIN: { const n = this.gZ.g2(x / 50, z / 50); return n > 0.45 ? 23 : n < -0.4 ? 6 : 5; }
      case BY.NEHIR: return this.gZ.g2(x / 30, z / 30) > 0.3 ? 6 : 5;
      default: return 4;
    }
  }

  /* ---------- Parça üretimi ---------- */
  parcaUret(cx, cz) {
    if (diyarMi(cx * PB)) return diyarUret(this, cx, cz);   // Yeraltı Diyarı
    const v = new Uint16Array(PHACIM);
    const x0 = cx * PB, z0 = cz * PB;
    /* Kenarlı sütun tablosu (eğim hesabı için 18 x 18) */
    const K = new Array(18 * 18);
    for (let lz = -1; lz <= PB; lz++) for (let lx = -1; lx <= PB; lx++) K[(lz + 1) * 18 + lx + 1] = this.kolon(x0 + lx, z0 + lz, {});
    const kolonlar = new Array(PB * PB);
    let ustY = 0;
    for (let lz = 0; lz < PB; lz++) for (let lx = 0; lx < PB; lx++) {
      const o = K[(lz + 1) * 18 + lx + 1];
      kolonlar[lz * PB + lx] = o;
      const x = x0 + lx, z = z0 + lz, h = o.h;
      ustY = Math.max(ustY, h, o.su);
      /* Eğim: dört komşunun en büyük yükseklik farkı */
      let egim = 0;
      for (const j of [-1, 1, -18, 18]) egim = Math.max(egim, Math.abs(K[(lz + 1) * 18 + lx + 1 + j].h - h));
      o.eg = egim;
      let ust = this.ustBlok(o, x, z);
      const r = karma2(this.tohum, x, z);
      const ab = o.ab ?? o.b;
      /* Dik yamaçlarda kaya yüzeyi; kızıl kayalıklarda renk katmanları görünür */
      let kaya = 0;
      if (h >= o.su && yuzeyMi(ab)) {
        if (ab === BY.KIZIL) { if (egim >= 2) kaya = 2; }
        else if (egim >= 5 || (egim >= 3 && (o.b === BY.DAG || ab === BY.KAYALIK || ab === BY.YALIYAR))) kaya = 1;
        if (kaya === 1) ust = o.te < SICAK.SOGUK - 0.1 && egim < 6 && ab !== BY.YALIYAR ? 21 : (this.gTs.g2(x / 40, z / 40) > 0.35 ? GRANIT : 2);
        /* Çakıl ve toprak lekeleri */
        else if (ust === 4 || ust === 45) {
          const n = this.gYm.g2(x / 18, z / 18);
          if (n > 0.66 && (ab === BY.ORMAN || ab === BY.SIK || ab === BY.TAYGA || ab === BY.SONBAHAR || ab === BY.HUS)) ust = 3;
          else if (n < -0.7 && (o.b === BY.TAYGA || o.b === BY.DAG || ab === BY.KAYALIK)) ust = 6;
        }
      }
      if (o.nh && h < o.su) ust = this.gZ.g2(x / 22, z / 22) > 0.25 ? 6 : (this.gZ.g2(x / 22 + 9, z / 22) > 0.35 ? 23 : 5);
      /* Ana kaya */
      v[dizin(lx, 0, lz)] = 1;
      if (r < 0.6) v[dizin(lx, 1, lz)] = 1;
      if (r < 0.25) v[dizin(lx, 2, lz)] = 1;
      const dolgu = 3 + Math.floor(r * 2);
      let altBlok = 3;
      if (ust === 5 || ust === D.kizilKum) altBlok = ust === 5 ? 5 : D.kizilKum;
      else if (ust === 2 || ust === 21 || ust === GRANIT) altBlok = 2;
      else if (ust === 6 || ust === 23 || ust === 24) altBlok = ust;
      if (o.b === BY.KARLI_KUMSAL) altBlok = 5;
      for (let y = 1; y <= h; y++) {
        const i = dizin(lx, y, lz);
        if (v[i] === 1) continue;
        if (ab === BY.KIZIL && y > DENIZ + 2 && (y < h - 1 || kaya)) v[i] = y === h && !kaya ? ust : BANT[(y + Math.floor(this.gMs.g2(x / 90, z / 90) * 3) + 20) % BANT.length];
        else if (y === h) v[i] = ust;
        else if (y > h - dolgu) v[i] = (o.b === BY.COL && y < h - 2) ? 24 : (kaya ? 2 : altBlok);
        else v[i] = 2;
      }
      if (ust === 21 && (o.b === BY.DAG)) v[dizin(lx, h - 1, lz)] = 21;
      /* Su: deniz, göl ve nehir */
      for (let y = h + 1; y <= o.su; y++) v[dizin(lx, y, lz)] = 7;
      /* Deniz buzu: yalnız soğuk kıyıların yakınında */
      if (h < DENIZ && o.su === DENIZ && o.te < -0.36 && o.c > -0.35) v[dizin(lx, DENIZ, lz)] = 22;
      /* Göl buzu: çok soğuk yüksek göller donar */
      if (o.gl && o.te < SICAK.SOGUK - 0.05) v[dizin(lx, o.su, lz)] = 22;
    }

    const ymax = Math.min(PY - 2, ustY + 1);
    this.magaralar(v, x0, z0, kolonlar, ymax);
    this.taslar(v, x0, z0, kolonlar, ymax);
    this.cevherler(v, cx, cz, kolonlar);
    this.magaraSusle(v, x0, z0, kolonlar);
    madenYaz(this, v, x0, z0);
    zindanYaz(this, v, x0, z0);
    this.kemerler(v, x0, z0);
    this.kayalar(v, x0, z0);
    this.agaclar(v, x0, z0);
    this.kutukler(v, x0, z0);
    this.bitkiler(v, x0, z0, kolonlar);
    this.karKapla(v, kolonlar);
    yapiYaz(this, v, x0, z0);
    batikYaz(this, v, x0, z0);
    adaYaz(this, v, x0, z0);   // Lanetli Ada
    koyYaz(this, v, x0, z0);
    return v;
  }

  /* Mağaralar: kıvrımlı tüneller, derinlerde geniş salonlar, yeraltı gölleri ve nehirleri, lav gölleri, uçurum altı oyukları */
  magaralar(v, x0, z0, kolonlar, ymax) {
    const gA = this.gA, gB = this.gB, gO = this.gO, gBm = this.gBm;
    const tA = new Izgara((x, y, z) => gA.g3(x / 56, y / 38, z / 56), x0, z0, ymax);
    const tB = new Izgara((x, y, z) => gB.g3(x / 56 + 100, y / 38, z / 56), x0, z0, ymax);
    const tO = new Izgara((x, y, z) => gO.g3(x / 85, y / 45, z / 85), x0, z0, 72);
    const tS = new Izgara((x, y, z) => gBm.g3(x / 120, y / 52, z / 120) + 0.25 * gBm.g3(x / 34 + 50, y / 24, z / 34), x0, z0, 72);
    /* Yeraltı göllerinin bölgesi ve seviyesi; yeraltı nehirleri */
    const golB = this.gYg.g2((x0 + 8) / 240, (z0 + 8) / 240) > 0.15, golL = 20 + Math.floor((this.gYg.g2((x0 + 8) / 600 + 30, (z0 + 8) / 600) + 1) * 6);
    for (let lz = 0; lz < PB; lz++) for (let lx = 0; lx < PB; lx++) {
      const o = kolonlar[lz * PB + lx];
      const x = x0 + lx, z = z0 + lz;
      const kara = o.h >= o.su;
      const giris = kara && o.h >= DENIZ + 2 && this.girisMi(x, z);
      const ust = !kara ? o.h - 6 : (giris ? o.h : o.h - 5);
      /* Yeraltı nehri: yatay bir kanal; tabanı su dolu */
      const yn = Math.abs(this.gYn.g2((x + this.gW.g2(x / 90, z / 90) * 30) / 380, (z + this.gW.g2(x / 90 + 7, z / 90) * 30) / 380));
      const ynY = 22 + Math.floor((this.gYn.g2(x / 700 + 11, z / 700) + 1) * 5);
      const ynVar = yn < 0.016 && o.h > ynY + 12;
      for (let y = 4; y <= ust; y++) {
        const i = dizin(lx, y, lz);
        const b = v[i];
        if (b === 0 || b === 1 || b === 7) continue;
        const a = tA.al(lx, y, lz), c = tB.al(lx, y, lz);
        let oy = a * a + c * c < 0.0045;
        if (!oy && y < 72) {
          oy = tO.al(lx, y, lz) > 0.6 - (40 - Math.min(40, y)) * 0.004;
          /* Geniş mağara salonları: derinlere doğru büyür, yüzeyin en az 14 blok altında kalır */
          if (!oy && y > 6 && y < o.h - 14) oy = tS.al(lx, y, lz) > 0.62 - (64 - y) * 0.0035;
        }
        if (!oy && ynVar && y >= ynY - 2 && y <= ynY + 3 - Math.floor(yn / 0.016 * 3)) oy = true;
        if (!oy) continue;
        /* Derinlerde boşluklar lavla, yeraltı göl bölgelerinde suyla dolar */
        if (y <= 10) v[i] = y === 10 && this.gO.g3(x / 7, 3.5, z / 7) > 0.32 ? 515 : 59;
        else if ((golB && y <= golL && y < o.h - 10) || (ynVar && y <= ynY && Math.abs(y - ynY) <= 3)) v[i] = 7;
        else v[i] = 0;
      }
      /* Yarıklar (kanyonlar) */
      const dip = this.yarik(x, z, o);
      if (dip != null) for (let y = dip; y <= o.h; y++) { const i = dizin(lx, y, lz); if (v[i] !== 1 && v[i] !== 7) v[i] = 0; }
      /* Uçurum altı oyukları ve çıkıntılar: dik yamaçlarda yüzeyin altında oyuklar (üst kabuk kalır) */
      const ab = o.ab ?? o.b;
      if (kara && o.eg >= 6 && o.h > DENIZ + 10 && (ab === BY.KAYALIK || ab === BY.KIZIL || ab === BY.YALIYAR || o.b === BY.DAG || o.tm > 0.5)) {
        for (let y = Math.max(DENIZ + 2, o.h - 14); y <= o.h - 3; y++) {
          const n = this.gU.g3(x / 16, y / 9, z / 16);
          if (n > 0.42) { const i = dizin(lx, y, lz); if (v[i] !== 1 && v[i] !== 7) v[i] = 0; }
        }
      }
      /* Parıltı kristalleri: derin mağaraların tavan ve tabanında */
      for (let y = 6; y < Math.min(ust, 40); y++) {
        const i = dizin(lx, y, lz);
        if (v[i] !== 0) continue;
        const alt = v[dizin(lx, y - 1, lz)], tav = v[dizin(lx, y + 1, lz)];
        const s = karma3(this.tohum ^ 0x6b72, x, y, z);
        if ((tav === 2 && s < 0.007) || (alt === 2 && s < 0.004)) v[i] = 61;
      }
    }
  }

  /* Yarık: (x, z) sütunu bir yarığın içindeyse oyulacak en alt yüksekliği, değilse null döner */
  yarik(x, z, o) {
    if (o.h < DENIZ + 6 || o.h < o.su + 4) return null;
    const maske = this.gY.g2(x / 520, z / 520);
    if (maske <= 0.3) return null;
    const wx = x + this.gY3.g2(x / 90, z / 90) * 26, wz = z + this.gY3.g2(x / 90 + 50, z / 90 + 50) * 26;
    const r = Math.abs(this.gY2.g2(wx / 300, wz / 300));
    const w = 0.02 + Math.min(1, (maske - 0.3) / 0.25) * 0.03;
    if (r >= w) return null;
    if (koyIcinde(this, x, z, 12)) return null;
    const k = {};
    for (const [dx, dz] of [[7, 0], [-7, 0], [0, 7], [0, -7]]) { this.kolon(x + dx, z + dz, k); if (k.h < DENIZ + 4 || k.h < k.su + 2) return null; }
    const f = r / w;
    const merkez = Math.max(14, o.h - 26 - Math.floor(Math.abs(this.gY3.g2(x / 60 + 9, z / 60)) * 36));
    const dip = Math.round(merkez + (o.h - merkez) * Math.pow(f, 1.7));
    return dip < o.h - 1 ? dip : null;
  }

  /* Yeraltı taş çeşitliliği: granit, kireçtaşı ve (derinlerde) bazalt kütleleri */
  taslar(v, x0, z0, kolonlar, ymax) {
    const g1 = this.gTs, g2 = this.gTs2;
    const t1 = new Izgara((x, y, z) => g1.g3(x / 42, y / 28, z / 42), x0, z0, ymax);
    const t2 = new Izgara((x, y, z) => g2.g3(x / 36, y / 24, z / 36), x0, z0, 48);
    for (let lz = 0; lz < PB; lz++) for (let lx = 0; lx < PB; lx++) {
      const h = kolonlar[lz * PB + lx].h;
      for (let y = 3; y < h - 3; y++) {
        const i = dizin(lx, y, lz);
        if (v[i] !== 2) continue;
        const n = t1.al(lx, y, lz);
        if (n > 0.52) v[i] = GRANIT;
        else if (n < -0.56 && y > 24) v[i] = KIRECTASI;
        else if (y < 44 && t2.al(lx, y, lz) > 0.58) v[i] = BAZALT;
      }
    }
  }

  /* Cevherler: derinliğe ve biyoma göre damarlar; bazı bölgelerde mağara duvarlarında görünen büyük damarlar */
  cevherler(v, cx, cz, kolonlar) {
    const r = uretec(karistir(this.tohum ^ Math.imul(cx, 73856093) ^ Math.imul(cz, 19349663)));
    const damar = (id, adet, boy, yMin, yMax) => {
      for (let n = 0; n < adet; n++) {
        let x = r() * PB, y = yMin + r() * (yMax - yMin), z = r() * PB;
        const dx = r() * 2 - 1, dy = (r() * 2 - 1) * 0.5, dz = r() * 2 - 1;
        for (let k = 0; k < boy; k++) {
          const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
          if (ix >= 0 && ix < PB && iz >= 0 && iz < PB && iy > 0 && iy < PY) {
            const i = dizin(ix, iy, iz);
            if (v[i] === 2 || v[i] === GRANIT || v[i] === KIRECTASI || v[i] === BAZALT) v[i] = id;
          }
          x += dx + (r() - 0.5); y += dy + (r() - 0.5) * 0.6; z += dz + (r() - 0.5);
        }
      }
    };
    const m = kolonlar[8 * PB + 8], ab = m.ab ?? m.b;
    damar(16, 20, 9, 5, 130);
    damar(18, 10, 7, 8, 90);
    damar(17, 10, 6, 4, 70);
    damar(19, 3, 5, 2, 32);
    if (r() < 0.7) damar(20, 1 + (r() < 0.3 ? 1 : 0), 4, 2, 16);
    /* Dağlarda yüksek kömür ve demir; kayalık tepelerde bakır; kızıl kayalıklarda altın */
    if (m.d > 0.25) { damar(16, 14, 10, 70, Math.min(PY - 10, m.h)); damar(17, 8, 7, 60, Math.min(PY - 10, m.h)); }
    if (ab === BY.KAYALIK) damar(18, 10, 9, 30, Math.min(PY - 10, m.h));
    if (ab === BY.KIZIL) damar(19, 7, 6, 28, Math.min(PY - 10, m.h));
    /* Büyük damarlar: kalın, uzun şeritler (demir bazaltla, bakır granitle) */
    const bolge = this.gVm.g2((cx * PB + 8) / 300, (cz * PB + 8) / 300);
    if (Math.abs(bolge) > 0.45) {
      const demir = bolge > 0, cev = demir ? 17 : 18, dolgu = demir ? BAZALT : GRANIT, yMin = demir ? 6 : 24, yMax = demir ? 40 : 64;
      const t = new Izgara((x, y, z) => this.gV.g3(x / 46, y / 22, z / 46), cx * PB, cz * PB, yMax);
      for (let lz = 0; lz < PB; lz++) for (let lx = 0; lx < PB; lx++) for (let y = yMin; y < yMax; y++) {
        const i = dizin(lx, y, lz), b = v[i];
        if (b !== 2 && b !== GRANIT && b !== KIRECTASI && b !== BAZALT) continue;
        if (Math.abs(t.al(lx, y, lz)) > 0.05) continue;
        v[i] = karma3(this.tohum ^ 0x7665, cx * PB + lx, y, cz * PB + lz) < 0.22 ? cev : dolgu;
      }
    }
  }

  /* Mağara süslemesi: yosunlu mağaralar, damlataşı mağaraları; sıradan mağaralarda seyrek mantar ve örümcek ağı */
  magaraSusle(v, x0, z0, kolonlar) {
    for (let lz = 0; lz < PB; lz++) for (let lx = 0; lx < PB; lx++) {
      const o = kolonlar[lz * PB + lx];
      const x = x0 + lx, z = z0 + lz;
      const bolge = this.gC.g2(x / 150, z / 150), bolge2 = this.gC2.g2(x / 150, z / 150);
      const yosunlu = bolge > 0.32, damla = bolge < -0.36, ust = Math.min(o.h - 6, 90);
      for (let y = 6; y < ust; y++) {
        const i = dizin(lx, y, lz);
        if (v[i] !== 0) continue;
        const alt = v[i - PB * PB], tav = v[i + PB * PB];
        const s = karma3(this.tohum ^ 0x6d61, x, y, z), s2 = karma3(this.tohum ^ 0x7a61, x, y, z);
        if (yosunlu) {
          if (TAS.has(alt) && s < 0.75) { v[i - PB * PB] = 149; if (s2 < 0.14) v[i] = 25; else if (s2 < 0.17) v[i] = 153; else if (s2 < 0.19) v[i] = 43; }
          else if (TAS.has(tav) && s < 0.6) { v[i + PB * PB] = 149; if (s2 < 0.1) { const boy = 1 + Math.floor(s * 6); for (let k = 0; k < boy && v[i - k * PB * PB] === 0; k++) v[i - k * PB * PB] = 147; } }
        } else if (damla) {
          if (TAS.has(alt)) { if (s < 0.5) v[i - PB * PB] = 152; if (s2 < 0.07) v[i] = 151; }
          else if (TAS.has(tav)) { if (s < 0.5) v[i + PB * PB] = 152; if (s2 < 0.09) v[i] = 150; }
        } else if (y < 48) {
          if (TAS.has(alt) && s2 < 0.006) v[i] = bolge2 > 0.2 ? 153 : 36;
          else if (TAS.has(tav) && s2 < 0.003) v[i] = 148;
        }
      }
    }
  }

  /* Hücreye dayalı süslerin ortak yerleştiricisi: parçayı pay kadar aşan hücreleri tarar */
  hucreler(x0, z0, boy, pay, tohum, fn) {
    const h0x = Math.floor((x0 - pay) / boy), h1x = Math.floor((x0 + PB + pay) / boy);
    const h0z = Math.floor((z0 - pay) / boy), h1z = Math.floor((z0 + PB + pay) / boy);
    for (let hz = h0z; hz <= h1z; hz++) for (let hx = h0x; hx <= h1x; hx++) {
      const x = hx * boy + Math.floor(karma2(this.tohum ^ tohum, hx, hz) * (boy - 1));
      const z = hz * boy + Math.floor(karma2(this.tohum ^ (tohum + 1), hx, hz) * (boy - 1));
      if (x < x0 - pay || x >= x0 + PB + pay || z < z0 - pay || z >= z0 + PB + pay) continue;
      fn(x, z, karma2(this.tohum ^ (tohum + 2), hx, hz), hx, hz);
    }
  }
  /* Parça içine yazan yardımcı (sadeceBos: true yalnız boşluğa, 'kok' boşluk/su/bitkiye; doluysa false döner) */
  yazici(v, x0, z0) {
    return (x, y, z, id, sadeceBos) => {
      const lx = x - x0, lz = z - z0;
      if (lx < 0 || lx >= PB || lz < 0 || lz >= PB || y < 1 || y >= PY) return true;
      const i = dizin(lx, y, lz);
      if (sadeceBos === 'kok') { const b = v[i]; if (b !== 0 && b !== 7 && b !== 31 && b !== 68 && b !== 146 && b !== 25) return false; }
      else if (sadeceBos && v[i] !== 0 && v[i] !== 25) return true;
      v[i] = id;
      return true;
    };
  }
  /* Sütunda yerleşime uygun kara (göl, nehir, köy, yarık, mağara girişi dışı) */
  karaUygun(o, x, z, pay = 4) {
    if (o.h < o.su || o.h < DENIZ + 1) return false;
    if (this.girisMi(x, z) || koyIcinde(this, x, z, pay) || this.yarik(x, z, o) != null) return false;
    return true;
  }

  /* Ağaçlar: 5 x 5 hücre ızgarası, her hücrede en fazla bir ağaç (parça sınırlarını aşabilir) */
  agaclar(v, x0, z0) {
    const set = this.yazici(v, x0, z0);
    const liste = [];
    const o = {};
    this.hucreler(x0, z0, HUCRE, AGAC_YARICAP, 0x5bd1e995, (x, z, s) => {
      this.kolon(x, z, o);
      const ab = o.ab ?? o.b;
      let p = AGAC_OLASILIK[ab] ?? AGAC_OLASILIK[o.b];
      if (!p) return;
      /* Orman açıklıkları ve çayırlarda ağaç kümeleri */
      if (ab === BY.ORMAN || ab === BY.SIK || ab === BY.SONBAHAR || ab === BY.HUS || ab === BY.TAYGA) { if (this.gAc.g2(x / 110, z / 110) > 0.56) return; }
      else if (ab === BY.CAYIR || ab === BY.CICEKLI || ab === BY.SAVAN) { if (this.gKm.g2(x / 80, z / 80) > 0.5) p = ab === BY.SAVAN ? 0.3 : 0.5; }
      if (s > p) return;
      const mangrov = ab === BY.MANGROV;
      if (mangrov ? (o.h < DENIZ - 3 || o.su - o.h > 3) : o.h < o.su) return;
      if (o.b === BY.DAG && o.h > DENIZ + 85) return;
      const ust = this.ustBlok(o, x, z);
      if (!mangrov && ust !== 4 && ust !== 45 && ust !== 142 && ust !== 143 && ust !== D.miselyum) return;
      if (this.girisMi(x, z) || koyIcinde(this, x, z) || this.yarik(x, z, o) != null) return;
      const s2 = karma2(this.tohum ^ 0x77, x, z), s3 = karma2(this.tohum ^ 0x6d65, x, z);
      let tur = 'mese', yaprak = 0;
      if (ab === BY.MANTAR) tur = s2 < 0.5 ? 'dev_mantar_kirmizi' : 'dev_mantar_kahve';
      else if (mangrov) tur = 'mangrov';
      else if (o.b === BY.TAYGA || o.b === BY.KARLI_OVA || (o.b === BY.DAG && o.te < 0.15)) tur = o.b === BY.TAYGA ? (s2 < 0.1 ? 'dev_ladin' : s2 < 0.42 ? 'uzun_ladin' : 'ladin') : (s2 < 0.3 ? 'uzun_ladin' : 'ladin');
      else if (o.b === BY.SAVAN || (o.b === BY.DAG && o.te > 0.3)) tur = 'akasya';
      else if (o.b === BY.BATAKLIK) tur = 'bataklik';
      else if (ab === BY.SONBAHAR) { if (s2 < 0.3) { tur = 'sonbahar_hus'; yaprak = D.sariYaprak; } else if (s2 < 0.9) { tur = 'sonbahar_mese'; yaprak = SONBAHAR_YAPRAK[Math.floor(s3 * 3)]; } else tur = 'mese'; }
      else if (ab === BY.SIK) tur = s2 < 0.22 ? 'dev_mese' : s2 < 0.42 ? 'yuvarlak_mese' : s2 < 0.52 ? 'hus' : 'mese';
      else if (o.b === BY.HUS) tur = s2 < 0.35 ? 'uzun_hus' : s2 < 0.88 ? 'hus' : 'mese';
      else if (o.b === BY.ORMAN) tur = s2 < 0.05 ? 'dev_mese' : s2 < 0.2 ? 'hus' : s2 < 0.36 ? 'yuvarlak_mese' : 'mese';
      else if (ab === BY.KAYALIK) tur = s2 < 0.6 ? 'ladin' : 'mese';
      /* Çayırda elma ve kiraz, savanda zeytin ve portakal, ormanda seyrek elma ağaçları */
      if ((ab === BY.CAYIR || ab === BY.CICEKLI) && s3 < 0.24) tur = s3 < 0.13 ? 'elma' : 'kiraz';
      else if (o.b === BY.SAVAN && s3 < 0.2) tur = s3 < 0.12 ? 'zeytin' : 'portakal';
      else if (ab === BY.ORMAN && s3 < 0.03) tur = 'elma';
      liste.push([x, (mangrov ? Math.max(o.h, o.su) : o.h) + 1, z, tur, o.b, yaprak]);
    });
    const ur = a => uretec(karistir(this.tohum ^ Math.imul(a[0], 341873128) ^ Math.imul(a[2], 132897987)));
    /* Önce yapraklar, sonra gövdeler: komşu parçalarda aynı sonucu verir */
    for (const a of liste) agacKur2(set, a[0], a[1], a[2], a[3], ur(a), 'yaprak', a[5]);
    for (const a of liste) agacKur2(set, a[0], a[1], a[2], a[3], ur(a), 'govde', a[5]);
    /* Çiçekli bölgelerdeki meşe ve huşların bir kısmında gövdeye asılı arı kovanı (girişi dışa bakar) */
    for (const a of liste) {
      if ((a[3] !== 'mese' && a[3] !== 'hus') || !(a[4] === BY.CAYIR || a[4] === BY.ORMAN || a[4] === BY.HUS)) continue;
      if (karma2(this.tohum ^ 0xbee5, a[0], a[2]) > 0.012) continue;
      const d = Math.floor(karma2(this.tohum ^ 0xbee6, a[0], a[2]) * 4) % 4, [dx, dz] = [[0, -1], [1, 0], [0, 1], [-1, 0]][d];
      set(a[0] + dx, a[1] + 1, a[2] + dz, 569 + d * 6 + 2, true);
    }
    /* Çalılar */
    const CALI = { [BY.ORMAN]: 0.16, [BY.SIK]: 0.3, [BY.SONBAHAR]: 0.14, [BY.HUS]: 0.1, [BY.TAYGA]: 0.12, [BY.CAYIR]: 0.05, [BY.CICEKLI]: 0.03, [BY.SAVAN]: 0.1, [BY.KAYALIK]: 0.12, [BY.DAG]: 0.04, [BY.BATAKLIK]: 0.12, [BY.YALIYAR]: 0.08 };
    const cali = [];
    this.hucreler(x0, z0, CALI_HUCRE, 3, 0x63616c, (x, z, s) => {
      this.kolon(x, z, o);
      const ab = o.ab ?? o.b, p = CALI[ab] ?? CALI[o.b];
      if (!p || s > p || (o.b === BY.DAG && o.h > DENIZ + 80)) return;
      const ust = this.ustBlok(o, x, z);
      if ((ust !== 4 && ust !== 45 && ust !== 142 && ust !== 143) || !this.karaUygun(o, x, z)) return;
      const yaprak = o.b === BY.TAYGA || o.b === BY.DAG ? 11 : o.b === BY.SAVAN ? 145 : ab === BY.SONBAHAR ? SONBAHAR_YAPRAK[Math.floor(karma2(this.tohum ^ 0x63, x, z) * 3)] : 9;
      cali.push([x, o.h + 1, z, yaprak]);
    });
    for (const a of cali) agacKur2(set, a[0], a[1], a[2], 'cali', ur(a), 'yaprak', a[3]);
    for (const a of cali) agacKur2(set, a[0], a[1], a[2], 'cali', ur(a), 'govde', a[3]);
  }

  /* Devrik kütükler: ormanlarda yere yatmış ağaç gövdeleri (üstünde yer yer mantar) */
  kutukler(v, x0, z0) {
    const set = this.yazici(v, x0, z0), o = {}, q = {};
    const OLASILIK = { [BY.ORMAN]: 0.08, [BY.SIK]: 0.14, [BY.SONBAHAR]: 0.1, [BY.HUS]: 0.07, [BY.TAYGA]: 0.08, [BY.BATAKLIK]: 0.06 };
    this.hucreler(x0, z0, KUTUK_HUCRE, 7, 0x6b7574, (x, z, s) => {
      this.kolon(x, z, o);
      const ab = o.ab ?? o.b, p = OLASILIK[ab] ?? OLASILIK[o.b];
      if (!p || s > p || !this.karaUygun(o, x, z)) return;
      const yon = karma2(this.tohum ^ 0x6b75, x, z) < 0.5 ? 0 : 1, uz = 3 + Math.floor(karma2(this.tohum ^ 0x6b76, x, z) * 4);
      const tip = o.b === BY.TAYGA ? 1 : o.b === BY.HUS || ab === BY.SONBAHAR && s < p / 2 ? 2 : 0;
      const id = [[D.devrikMeseX, D.devrikMeseZ], [D.devrikLadinX, D.devrikLadinZ], [D.devrikHusX, D.devrikHusZ]][tip][yon];
      for (let k = 0; k < uz; k++) { this.kolon(x + (yon ? 0 : k), z + (yon ? k : 0), q); if (q.h !== o.h || q.h < q.su) return; }
      for (let k = 0; k < uz; k++) {
        const px = x + (yon ? 0 : k), pz = z + (yon ? k : 0);
        set(px, o.h + 1, pz, id, true);
        if (karma2(this.tohum ^ 0x6b77, px, pz) < 0.25) set(px, o.h + 2, pz, karma2(this.tohum ^ 0x6b78, px, pz) < 0.6 ? 36 : D.kirmiziMantar, true);
      }
    });
  }

  /* Kayalar: yarı gömülü, yosunlu ya da çıplak kaya öbekleri */
  kayalar(v, x0, z0) {
    const set = this.yazici(v, x0, z0), o = {};
    const OLASILIK = { [BY.KAYALIK]: 0.45, [BY.DAG]: 0.16, [BY.TAYGA]: 0.14, [BY.ORMAN]: 0.06, [BY.SIK]: 0.08, [BY.SONBAHAR]: 0.06, [BY.HUS]: 0.05, [BY.CAYIR]: 0.04, [BY.TASLI_KIYI]: 0.22, [BY.YALIYAR]: 0.12, [BY.SAVAN]: 0.05, [BY.KARLI_OVA]: 0.06, [BY.KARLI_ZIRVE]: 0.1 };
    this.hucreler(x0, z0, KAYA_HUCRE, 4, 0x6b6179, (x, z, s) => {
      this.kolon(x, z, o);
      const ab = o.ab ?? o.b, p = OLASILIK[ab] ?? OLASILIK[o.b];
      if (!p || s > p || o.h < o.su || o.h < DENIZ || this.girisMi(x, z) || koyIcinde(this, x, z, 6)) return;
      const R = 1 + karma2(this.tohum ^ 0x6b62, x, z) * 1.8, Ry = R * 0.8;
      const orman = ab === BY.ORMAN || ab === BY.SIK || ab === BY.SONBAHAR || o.b === BY.TAYGA || ab === BY.HUS;
      const tas = o.b === BY.SAVAN ? 24 : ab === BY.KAYALIK && s < p * 0.4 ? GRANIT : 2;
      const RI = Math.ceil(R);
      for (let dy = -1; dy <= Math.ceil(Ry); dy++) for (let dz = -RI; dz <= RI; dz++) for (let dx = -RI; dx <= RI; dx++) {
        if ((dx * dx + dz * dz) / (R * R) + (dy * dy) / (Ry * Ry) > 1) continue;
        const k = karma3(this.tohum ^ 0x6b63, x + dx, dy, z + dz);
        const id = orman ? (k < 0.4 ? 60 : k < 0.55 ? 149 : k < 0.8 ? 15 : 2) : (k < 0.25 ? 15 : k < 0.32 ? 60 : tas);
        set(x + dx, o.h + 1 + dy, z + dz, id, false);
      }
    });
  }

  /* Doğal kemerler: kızıl kayalıklarda, çölde, savanda, kayalık tepelerde ve yalıyarlarda */
  kemerler(v, x0, z0) {
    const set = this.yazici(v, x0, z0), o = {};
    this.hucreler(x0, z0, KEMER_HUCRE, 26, 0x6b656d, (x, z, s, hx, hz) => {
      if (s > 0.4) return;
      this.kolon(x, z, o);
      const ab = o.ab ?? o.b;
      if (!(ab === BY.KIZIL || ab === BY.COL || ab === BY.SAVAN || ab === BY.KAYALIK || ab === BY.YALIYAR) || !this.karaUygun(o, x, z, 30)) return;
      const r = uretec(karistir(this.tohum ^ Math.imul(hx, 0x4b1d) ^ Math.imul(hz, 0x2c9f)));
      const S = 9 + Math.floor(r() * 9), H = 7 + Math.floor(r() * 8), K = 2.2 + r() * 1.3, yon = r() < 0.5, gen = 1 + Math.floor(r() * 2);
      const q = {};
      let taban = o.h;
      for (const k of [-S, S]) { this.kolon(x + (yon ? 0 : k), z + (yon ? k : 0), q); taban = Math.min(taban, q.h); }
      const tas = ab === BY.KIZIL ? null : ab === BY.COL || ab === BY.SAVAN ? 24 : 2;
      for (let u = -S - 3; u <= S + 3; u++) for (let dy = -4; dy <= H + 3; dy++) {
        const ex = u / (S + 1.5), ey = dy / (H + 1.5), d = Math.sqrt(ex * ex + ey * ey);
        const kal = K / (S + 1.5);
        if (dy < 0 ? Math.abs(Math.abs(u) - S - 0.5) > K * 0.7 : (d > 1 || d < 1 - kal)) continue;
        for (let w = -gen; w <= gen; w++) {
          const px = x + (yon ? w : u), pz = z + (yon ? u : w), py = taban + dy;
          set(px, py, pz, tas || BANT[(py + 20) % BANT.length], false);
        }
      }
    });
  }

  /* Otlar, çiçekler, çalılar, mantar kümeleri, saz ve nilüfer, su altı bitkileri */
  bitkiler(v, x0, z0, kolonlar) {
    for (let lz = 0; lz < PB; lz++) for (let lx = 0; lx < PB; lx++) {
      const o = kolonlar[lz * PB + lx];
      const x = x0 + lx, z = z0 + lz, h = o.h, ab = o.ab ?? o.b;
      if (h + 2 >= PY) continue;
      const alt = v[dizin(lx, h, lz)], ust = dizin(lx, h + 1, lz);
      const r = karma2(this.tohum ^ 0x9e3779b9, x, z);
      if (alt === 7 || (h < o.su && v[ust] === 7)) {
        /* Su altı */
        const derin = o.su - h;
        if (alt === 7) continue;
        const ui = dizin(lx, h + 1, lz);
        /* Göl ve nehir kıyısının sığlarında saz, durgun yüzeyde nilüfer */
        if ((o.gl || o.nh || ab === BY.MANGROV || o.b === BY.BATAKLIK) && derin <= 2) {
          if (r < (o.gl ? 0.22 : 0.12) && v[ui] === 7 && derin === 1) { v[ui] = D.sazSu; if (v[ui + PB * PB] === 0) v[ui + PB * PB] = D.saz; continue; }
          if (r > 0.86 && v[dizin(lx, o.su + 1, lz)] === 0 && v[dizin(lx, o.su, lz)] === 7) v[dizin(lx, o.su + 1, lz)] = 146;
          continue;
        }
        if (o.gl && derin >= 2) { if (r < 0.025 && v[dizin(lx, o.su + 1, lz)] === 0 && v[dizin(lx, o.su, lz)] === 7) v[dizin(lx, o.su + 1, lz)] = 146; else if (r < 0.2 && v[ui] === 7) v[ui] = 68; continue; }
        /* Sıcak ve sığ sularda mercan resifleri */
        const resif = o.t > 0.1 && derin >= 3 && derin <= 16 && (o.b === BY.OKYANUS || o.b === BY.DERIN) && this.gZ.g2(x / 36 + 40, z / 36) > -0.05;
        if (resif) {
          const r2 = karma2(this.tohum ^ 0x6d6572, x, z), renk = Math.floor(((this.gG.g2(x / 14, z / 14) + 1) / 2) * 3) % 3;
          if (r2 < 0.42) { v[dizin(lx, h, lz)] = 62 + renk; if (r2 < 0.12 && derin >= 4) { v[ui] = 62 + ((renk + 1) % 3); if (v[ui + PB * PB] === 7) v[ui + PB * PB] = 65 + renk; } else if (v[ui] === 7) v[ui] = 65 + renk; }
          else if (r2 < 0.62 && v[ui] === 7) v[ui] = 65 + ((renk + 2) % 3);
          else if (r2 < 0.75 && v[ui] === 7) v[ui] = 68;
          continue;
        }
        if (derin >= 2 && r < 0.07) {
          const boy = 1 + Math.floor(karma2(this.tohum ^ 0x31, x, z) * Math.min(4, derin - 1));
          for (let k = 1; k <= boy; k++) { const i = dizin(lx, h + k, lz); if (v[i] === 7) v[i] = 31; }
        } else if (r < 0.26 && v[ui] === 7) v[ui] = 68;
        else if (derin >= 3 && r < 0.268 && (alt === 5 || alt === 6) && v[ui] === 7) v[ui] = 69;
        continue;
      }
      if (v[ust] !== 0) continue;
      let id = 0;
      /* Mantar kümeleri: gölgeli ormanlarda öbek öbek */
      const mk = this.gMk.g2(x / 12, z / 12);
      if ((ab === BY.SIK || ab === BY.ORMAN || o.b === BY.TAYGA || o.b === BY.BATAKLIK || ab === BY.SONBAHAR) && mk > 0.62 && (alt === 4 || alt === 45 || alt === 3 || alt === 143) && r < 0.3) id = r < 0.18 ? 36 : D.kirmiziMantar;
      else if (ab === BY.MANTAR && alt === D.miselyum) id = r < 0.06 ? 36 : r < 0.1 ? D.kirmiziMantar : 0;
      else if (alt === 4) {
        if (ab === BY.CICEKLI) {
          /* Çiçekli çayır: türler öbekler hâlinde (renkli lekeler) */
          const ci = this.gCi.g2(x / 22, z / 22), tur = ci > 0.35 ? (o.te > 0.18 ? D.lavanta : D.lale) : ci > 0.05 ? 26 : ci > -0.25 ? D.papatya : ci > -0.5 ? 27 : 44;
          id = r < 0.34 ? tur : r < 0.5 ? 25 : r < 0.53 ? D.papatya : 0;
        }
        else if (o.b === BY.CAYIR) id = r < 0.18 ? 25 : r < 0.2 ? 26 : r < 0.22 ? 27 : r < 0.226 ? 44 : r < 0.229 ? D.papatya : r < 0.231 ? 28 : 0;
        else if (ab === BY.SIK) id = r < 0.14 ? 25 : r < 0.24 ? 43 : r < 0.25 ? 28 : 0;
        else if (ab === BY.SONBAHAR) id = r < 0.14 ? 25 : r < 0.18 ? 43 : r < 0.19 ? 28 : 0;
        else if (o.b === BY.ORMAN) id = r < 0.1 ? 25 : r < 0.13 ? 43 : r < 0.136 ? 36 : r < 0.142 ? 28 : r < 0.146 ? 26 : 0;
        else if (o.b === BY.HUS) id = r < 0.12 ? 25 : r < 0.135 ? 27 : r < 0.145 ? 44 : r < 0.148 ? 28 : r < 0.152 ? D.papatya : 0;
        else id = r < 0.05 ? 25 : 0;
      } else if (alt === 45) id = o.b === BY.KARLI_OVA ? (r < 0.015 ? 30 : 0) : r < 0.05 ? 43 : r < 0.055 ? 36 : r < 0.06 ? 28 : 0;
      else if (alt === 142) id = ab === BY.KIZIL ? (r < 0.04 ? 30 : 0) : r < 0.3 ? 25 : r < 0.33 ? 30 : r < 0.335 ? 27 : 0;
      else if (alt === 143) id = r < 0.16 ? 25 : r < 0.2 ? 43 : r < 0.215 ? 36 : r < 0.218 ? 26 : 0;
      else if ((alt === 5 && o.b === BY.COL) || alt === D.kizilKum) id = r < 0.012 ? 30 : 0;
      /* Çayır ve ormanlarda balkabağı tarlaları */
      if (!id && (alt === 4 || alt === 45) && (o.b === BY.CAYIR || o.b === BY.ORMAN || o.b === BY.HUS || o.b === BY.TAYGA) && this.gG.g2(x / 30 + 77, z / 30 - 13) > 0.74 && karma2(this.tohum ^ 0xba1ab, x, z) < 0.035) id = 559;
      /* Su kıyısı: deniz seviyesindeki kıyılarda şeker kamışı, göl ve nehir kıyılarında saz */
      if (!id && (alt === 3 || alt === 4 || alt === 5 || alt === 143) && lx > 0 && lx < PB - 1 && lz > 0 && lz < PB - 1
        && (v[dizin(lx + 1, h, lz)] === 7 || v[dizin(lx - 1, h, lz)] === 7 || v[dizin(lx, h, lz + 1)] === 7 || v[dizin(lx, h, lz - 1)] === 7)) {
        if (h === DENIZ && o.c < 0.1 && karma2(this.tohum ^ 0x5e4e, x, z) < 0.5) {
          const boy = 1 + Math.floor(karma2(this.tohum ^ 0x5e4f, x, z) * 3);
          for (let k = 1; k <= boy && h + k < PY; k++) if (v[dizin(lx, h + k, lz)] === 0) v[dizin(lx, h + k, lz)] = 568;
          continue;
        }
        if (karma2(this.tohum ^ 0x7361, x, z) < 0.35) { v[ust] = D.saz; if (v[ust + PB * PB] === 0 && r < 0.5) v[ust + PB * PB] = D.saz; continue; }
      }
      if (id) v[ust] = id;
    }
  }

  /* Karlı biyomlarda ağaçların ve zeminin en üst bloğunun üstüne ince kar katmanı */
  karKapla(v, kolonlar) {
    for (let lz = 0; lz < PB; lz++) for (let lx = 0; lx < PB; lx++) {
      const o = kolonlar[lz * PB + lx];
      if (!KARLI.has(o.b) && !(o.b === BY.DAG && o.te < SICAK.SOGUK)) continue;
      for (let y = Math.min(PY - 2, o.h + 34); y > o.h; y--) {
        const b = v[dizin(lx, y, lz)];
        if (!b) continue;
        if (YAPRAKLAR.has(b) && !v[dizin(lx, y + 1, lz)]) v[dizin(lx, y + 1, lz)] = 141;
        break;
      }
    }
  }

  /* 0.41.0: çimen, yaprak ve su için biyom tonu (meshleyicide köşe rengi olarak kullanılır; iklim değerlerinden sürekli ve yumuşak geçişli).
     Dönüş: [çimen r, g, b, yaprak r, g, b, su r, g, b] (1 = değişiklik yok) */
  ton(o) {
    const sic = Math.max(-1, Math.min(1, o.te * 2)), nem = Math.max(-1, Math.min(1, o.n * 2.2));
    const kuru = Math.max(0, sic) * Math.max(0, -nem), soguk = Math.max(0, -sic), islak = Math.max(0, nem);
    let r = 1 + 0.16 * kuru - 0.08 * soguk - 0.06 * islak, g = 1 - 0.02 * kuru - 0.02 * soguk + 0.02 * islak, b = 1 - 0.22 * kuru + 0.05 * soguk - 0.06 * islak;
    const bt = o.bt || 0;
    r = lerp(r, 0.86, bt * 0.6); g = lerp(g, 0.92, bt * 0.6); b = lerp(b, 0.72, bt * 0.6);
    const ab = o.ab ?? o.b;
    let sr = 1, sg = 1, sb = 1;
    if (bt > 0.3) { sr = lerp(1, 0.72, bt); sg = lerp(1, 0.86, bt); sb = lerp(1, 0.62, bt); }
    else if (o.t > 0.15 && o.c < 0) { const w = Math.min(1, (o.t - 0.15) * 4); sr = lerp(1, 0.78, w); sg = lerp(1, 1.12, w); sb = lerp(1, 1.05, w); }
    else if (o.gl) { sr = 0.9; sg = 1.04; sb = 1.0; }
    if (ab === BY.MANTAR) { r = 1.05; g = 0.92; b = 1.02; }
    return [r, g, b, r * 0.98 + 0.02, g, b * 0.98 + 0.02, sr, sg, sb];
  }

  /* Oyuncunun doğacağı nokta: rastgele seçilen, köylerden uzak, düz ve kuru bir arazi */
  dogumNoktasi() { return this.dogumAday(); }
  /* Doğma noktası (yatak) yoksa yeniden doğuşta kullanılan rastgele güvenli konum (aynı kurallarla) */
  rastgeleDogum() { return this.dogumAday(uretec((Math.random() * 2147483647) | 0)); }
  dogumAday(r = uretec(this.tohum ^ 0xabcdef)) {
    const o = {}, q = {};
    const UYGUN = new Set([BY.CAYIR, BY.ORMAN, BY.HUS, BY.SAVAN]);
    for (let deneme = 0; deneme < 800; deneme++) {
      const aci = r() * Math.PI * 2, m = 0.1 + r() * 0.5;
      const x = Math.round(Math.cos(aci) * m * KITA_YARICAP), z = Math.round(Math.sin(aci) * m * KITA_YARICAP);
      this.kolon(x, z, o);
      if (o.c < 0.08 || !UYGUN.has(o.b) || o.ab === BY.KAYALIK || o.h < o.su + 1 || o.h < DENIZ + 3 || o.h > DENIZ + 24 || this.girisMi(x, z)) continue;
      if (koyIcinde(this, x, z, 90) || this.yarik(x, z, o) != null) continue;
      /* Keşfedilmesi gereken özel yapılardan en az 200 blok uzakta doğulur */
      if (yapilarAlan(this, x - 200, z - 200, x + 200, z + 200).some(Y => Math.hypot(Y.x - x, Y.z - z) < 200)) continue;
      /* Çevresi düz ve kara */
      let uygun = true;
      for (const [dx, dz] of [[6, 0], [-6, 0], [0, 6], [0, -6], [4, 4], [-4, -4]]) { this.kolon(x + dx, z + dz, q); if (q.h < q.su + 1 || q.h < DENIZ + 1 || Math.abs(q.h - o.h) > 3) { uygun = false; break; } }
      if (uygun) return { x: x + 0.5, y: o.h + 1, z: z + 0.5 };
    }
    for (let x = 0; x < KITA_YARICAP; x += 7) { this.kolon(x, 0, o); if (o.h > DENIZ + 1 && o.h >= o.su && o.b !== BY.DAG) return { x: x + 0.5, y: o.h + 1, z: 0.5 }; }
    return { x: 0.5, y: PY - 10, z: 0.5 };
  }
}
