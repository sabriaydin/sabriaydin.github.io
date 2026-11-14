/* HungerMan - dünya üreticisi
   Tohumdan belirlenimli olarak üretilir: aynı tohum her bilgisayarda aynı dünyayı verir (çok oyunculu için gerekli).
   Dünya, kıyıları denizle çevrili büyük bir kara parçasıdır; iç kısımda nehirler, dağlar ve farklı biyomlar bulunur. */
import { PB, PY, DENIZ, KITA_YARICAP, DUNYA_SINIRI, dizin, diyarMi } from '../sabitler.js';
import { diyarUret } from './diyar-uretici.js';
import { Gurultu, karistir, karma2, karma3, uretec, yumusak } from '../rastgele.js';
import { yapiYaz } from './yapi-uretici.js';
import { koyYaz, koyIcinde, enYakinKoy } from './koy-uretici.js';
import { zindanYaz } from './zindan-uretici.js';
import { batikYaz } from './batik-uretici.js';
import { madenYaz } from './maden-uretici.js';

export const BIYOMLAR = ['Okyanus', 'Derin Okyanus', 'Nehir', 'Kumsal', 'Karlı Kumsal', 'Dağlar', 'Tayga', 'Çöl', 'Orman', 'Huş Ormanı', 'Çayır', 'Savan', 'Bataklık', 'Karlı Ova'];
export const BY = { OKYANUS: 0, DERIN: 1, NEHIR: 2, KUMSAL: 3, KARLI_KUMSAL: 4, DAG: 5, TAYGA: 6, COL: 7, ORMAN: 8, HUS: 9, CAYIR: 10, SAVAN: 11, BATAKLIK: 12, KARLI_OVA: 13 };
/* Karla kaplı biyomlar (kar yağar, ağaçların üstünde kar katmanı oluşur) */
export const KARLI = new Set([BY.TAYGA, BY.KARLI_KUMSAL, BY.KARLI_OVA]);

/* İklim (0.13.0): sıcaklık ve nem geniş ölçekli, yumuşak gürültülerdir; yükseldikçe sıcaklık düşer.
   Biyom, sıcaklık kuşağı ve neme göre seçilir. Komşu kuşaklar birbirine uygun olduğundan çöl ile karlı bölgeler yan yana gelmez:
   soğuk (tayga, karlı ova) · serin (huş ormanı, çayır) · ılıman (orman, çayır, bataklık) · ılık (orman, çayır, savan) · sıcak (orman, savan, çöl) */
const SICAK = { SOGUK: -0.3, SERIN: -0.08, ILIK: 0.22, SICAK: 0.4 };

/* Ağaç yerleşim ızgarası */
const HUCRE = 5;
const AGAC_OLASILIK = { [BY.ORMAN]: 0.8, [BY.HUS]: 0.72, [BY.TAYGA]: 0.62, [BY.CAYIR]: 0.05, [BY.DAG]: 0.1, [BY.SAVAN]: 0.09, [BY.BATAKLIK]: 0.3, [BY.KARLI_OVA]: 0.03 };
const YAPRAKLAR = new Set([9, 11, 13, 145]);

/* Dağ zirvesi karla kaplı mı: yalnız serin iklimlerde ya da çok yüksek ve ılıman yerlerde */
export const karliZirve = o => (o.h > DENIZ + 56 && o.te < -0.05) || (o.h > DENIZ + 70 && o.te < 0.08);
/* Sıcaklık (yükseklik etkisi dahil) ve nemden kara biyomu */
export function iklimBiyomu(te, nem) {
  if (te < SICAK.SOGUK) return nem > -0.1 ? BY.TAYGA : BY.KARLI_OVA;
  if (te < SICAK.SERIN) return nem > 0.1 ? BY.HUS : BY.CAYIR;
  if (te < SICAK.ILIK) return nem > 0.02 ? BY.ORMAN : BY.CAYIR;
  if (te < SICAK.SICAK) return nem > 0.3 ? BY.ORMAN : nem > -0.12 ? BY.CAYIR : BY.SAVAN;
  return nem > 0.32 ? BY.ORMAN : nem > 0.0 ? BY.SAVAN : BY.COL;
}

export class Uretici {
  constructor(tohum) {
    this.tohum = tohum >>> 0;
    const g = k => new Gurultu(karistir(this.tohum + k * 7919));
    this.gK = g(1); this.gD = g(2); this.gT = g(3); this.gN = g(4); this.gM = g(5); this.gR = g(6);
    this.gNe = g(7); this.gH = g(8); this.gA = g(9); this.gB = g(10); this.gO = g(11); this.gG = g(12); this.gZ = g(13); this.gY = g(14); this.gY2 = g(15); this.gY3 = g(16);
    this.gC = g(17); this.gC2 = g(18);
    this.ky = { x: 0, z: 0, h: 0, b: 0, c: 0, t: 0, d: 0, te: 0, n: 0 };
  }

  /* Bir sütunun yüksekliği, biyomu, kıtasallığı */
  kolon(x, z, o = this.ky) {
    const mesafe = Math.sqrt(x * x + z * z) / KITA_YARICAP;
    const dusus = 0.55 - 1.15 * mesafe * mesafe;
    let c = dusus + 0.42 * this.gK.f2(x / 1100, z / 1100, 4) + 0.12 * this.gD.f2(x / 260, z / 260, 3);
    if (Math.abs(x) > DUNYA_SINIRI - 200 || Math.abs(z) > DUNYA_SINIRI - 200) c = Math.min(c, -0.4);
    /* İklim: geniş ölçekli, iki katmanlı (yumuşak geçişli) sıcaklık ve nem */
    const t = this.gT.f2(x / 1900, z / 1900, 2);
    const nem = this.gN.f2(x / 1500, z / 1500, 2);
    let h, dagK = 0, bataklik = 0;
    if (c < 0) {
      const derinlik = Math.min(1, -c * 3);
      h = DENIZ - 2 - derinlik * 26 + this.gD.g2(x / 40, z / 40) * 2;
    } else {
      h = DENIZ + 1 + c * 22;
      h += this.gH.f2(x / 140, z / 140, 3) * 7 * yumusak(0, 0.15, c);
      dagK = yumusak(0.05, 0.45, this.gM.f2(x / 1300 + 50, z / 1300, 2)) * yumusak(0.04, 0.2, c);
      if (dagK > 0) { let r = 1 - Math.abs(this.gR.f2(x / 420, z / 420, 4)); r *= r; h += dagK * r * 64; }
      if (c < 0.04) h = (DENIZ - 1) + (h - (DENIZ - 1)) * (c / 0.04);
      /* Bataklık: ılıman ve çok nemli düzlüklerde arazi deniz seviyesine yakın düzleşir, yer yer su birikintileri oluşur */
      bataklik = yumusak(0.3, 0.4, nem) * yumusak(SICAK.SERIN, SICAK.SERIN + 0.08, t) * (1 - yumusak(SICAK.ILIK + 0.05, SICAK.ILIK + 0.13, t)) * (1 - Math.min(1, dagK * 6)) * yumusak(0.06, 0.12, c);
      if (bataklik > 0) {
        const n = this.gZ.g2(x / 20, z / 20), hb = n > 0.22 ? DENIZ - 1 : DENIZ + 1 + (n < -0.3 ? 1 : 0);
        h += (hb - h) * bataklik;
      }
      /* Nehirler */
      if (c > 0.03) {
        const rv = Math.abs(this.gNe.f2(x / 700, z / 700, 3));
        let f = yumusak(0.012, 0.05, rv);
        f = 1 - (1 - f) * (1 - dagK);
        const hedef = DENIZ - 3;
        if (h > hedef) h = hedef + (h - hedef) * f;
      }
    }
    h = Math.floor(h);
    if (h < 3) h = 3; if (h > PY - 8) h = PY - 8;
    /* Yükseklikle soğuma */
    const te = t - Math.max(0, h - (DENIZ + 30)) * 0.006;
    let b;
    if (h < DENIZ) b = c < 0 ? (h < DENIZ - 16 ? BY.DERIN : BY.OKYANUS) : bataklik > 0.5 ? BY.BATAKLIK : BY.NEHIR;
    /* Kıyılar: karlı bölgelere ve donmuş denize komşu kıyılar karlıdır (kumsal buz ve kar ile yan yana gelmez) */
    else if (h <= DENIZ + 2 && c < 0.08) b = te < SICAK.SOGUK + 0.08 ? BY.KARLI_KUMSAL : BY.KUMSAL;
    else if (h > DENIZ + 44) b = BY.DAG;
    else if (bataklik > 0.5) b = BY.BATAKLIK;
    else b = iklimBiyomu(te, nem);
    o.x = x; o.z = z; o.h = h; o.b = b; o.c = c; o.t = t; o.d = dagK; o.te = te; o.n = nem;
    return o;
  }

  /* Mağara girişi bölgesi (yüzeye açılan tüneller); ağaçlar bu bölgeye konmaz */
  girisMi(x, z) { return this.gG.g2(x / 90, z / 90) > 0.62; }

  /* Yüzey bloğu */
  ustBlok(o, x, z) {
    switch (o.b) {
      case BY.TAYGA: case BY.KARLI_OVA: return 45;
      case BY.SAVAN: return 142;
      case BY.BATAKLIK: return 143;
      case BY.COL: case BY.KUMSAL: return 5;
      case BY.KARLI_KUMSAL: return 21;
      case BY.DAG: {
        /* Dağların tepesi iklime göre: soğukta kar, sıcakta kum taşı; arada taş ve çimen */
        if (karliZirve(o)) return 21;
        if (o.te < SICAK.SOGUK) return o.h > DENIZ + 50 ? 21 : 45;
        if (o.te > 0.3) return o.h > DENIZ + 52 || this.gD.g2(x / 30, z / 30) > 0 ? 24 : 142;
        return this.gD.g2(x / 30, z / 30) > 0.1 && o.h < DENIZ + 54 ? (o.te > 0.2 ? 142 : 4) : 2;
      }
      case BY.OKYANUS: case BY.DERIN: { const n = this.gZ.g2(x / 50, z / 50); return n > 0.45 ? 23 : n < -0.4 ? 6 : 5; }
      case BY.NEHIR: return this.gZ.g2(x / 30, z / 30) > 0.3 ? 6 : 5;
      default: return 4;
    }
  }

  /* ---------- Parça üretimi ---------- */
  parcaUret(cx, cz) {
    if (diyarMi(cx * PB)) return diyarUret(this, cx, cz);   // 0.18.0: Yeraltı Diyarı
    const v = new Uint16Array(PB * PB * PY);
    const x0 = cx * PB, z0 = cz * PB;
    const kolonlar = new Array(PB * PB);
    const ky = {};
    for (let lz = 0; lz < PB; lz++) for (let lx = 0; lx < PB; lx++) {
      const x = x0 + lx, z = z0 + lz;
      const o = this.kolon(x, z, {});
      kolonlar[lz * PB + lx] = o;
      const h = o.h, ust = this.ustBlok(o, x, z);
      const r = karma2(this.tohum, x, z);
      /* Ana kaya */
      v[dizin(lx, 0, lz)] = 1;
      if (r < 0.6) v[dizin(lx, 1, lz)] = 1;
      if (r < 0.25) v[dizin(lx, 2, lz)] = 1;
      const dolgu = 3 + Math.floor(r * 2);
      let altBlok = 3;
      if (ust === 5) altBlok = 5; else if (ust === 2 || ust === 21) altBlok = 2; else if (ust === 6 || ust === 23 || ust === 24) altBlok = ust;
      if (o.b === BY.KARLI_KUMSAL) altBlok = 5;
      for (let y = 1; y <= h; y++) {
        const i = dizin(lx, y, lz);
        if (v[i] === 1) continue;
        if (y === h) v[i] = ust;
        else if (y > h - dolgu) v[i] = (o.b === BY.COL && y < h - 2) ? 24 : altBlok;
        else v[i] = 2;
      }
      if (o.b === BY.DAG && ust === 21) v[dizin(lx, h - 1, lz)] = 21;
      /* Su */
      for (let y = h + 1; y <= DENIZ; y++) v[dizin(lx, y, lz)] = 7;
      /* Deniz buzu: yalnız soğuk kıyıların yakınında */
      if (h < DENIZ && o.te < -0.36 && o.c > -0.35) v[dizin(lx, DENIZ, lz)] = 22;
    }

    this.magaralar(v, x0, z0, kolonlar);
    this.cevherler(v, cx, cz);
    this.magaraSusle(v, x0, z0, kolonlar);
    madenYaz(this, v, x0, z0);
    zindanYaz(this, v, x0, z0);
    this.agaclar(v, x0, z0);
    this.bitkiler(v, x0, z0, kolonlar);
    this.karKapla(v, kolonlar);
    yapiYaz(this, v, x0, z0);
    batikYaz(this, v, x0, z0);
    koyYaz(this, v, x0, z0);
    return v;
  }

  /* Mağaralar: kıvrımlı tüneller ve derinlerde geniş oyuklar */
  magaralar(v, x0, z0, kolonlar) {
    for (let lz = 0; lz < PB; lz++) for (let lx = 0; lx < PB; lx++) {
      const o = kolonlar[lz * PB + lx];
      const x = x0 + lx, z = z0 + lz;
      const giris = o.h >= DENIZ + 2 && this.girisMi(x, z);
      const ust = o.h < DENIZ + 1 ? o.h - 5 : (giris ? o.h : o.h - 4);
      for (let y = 4; y <= ust; y++) {
        const i = dizin(lx, y, lz);
        const b = v[i];
        if (b === 0 || b === 1 || b === 7) continue;
        const a = this.gA.g3(x / 56, y / 38, z / 56), c = this.gB.g3(x / 56 + 100, y / 38, z / 56);
        let oy = a * a + c * c < 0.0042;
        if (!oy && y < 40) {
          const n = this.gO.g3(x / 85, y / 45, z / 85);
          oy = n > 0.58 - (40 - y) * 0.004;
        }
        /* Derinlerde boşluklar lavla dolar */
        if (oy) v[i] = y <= 10 ? (y === 10 && this.gO.g3(x / 7, 3.5, z / 7) > 0.32 ? 515 : 59) : 0;   // 0.18.0: lav göllerinin yüzeyinde obsidyen kabuklar
      }
      /* Yarıklar: yer yer yüzeye kadar açılan, kıvrılarak ilerleyen, kenarlarına doğru sığlaşan kanyonlar */
      const dip = this.yarik(x, z, o);
      if (dip != null) for (let y = dip; y <= o.h; y++) { const i = dizin(lx, y, lz); if (v[i] !== 1 && v[i] !== 7) v[i] = 0; }
      /* Parıltı kristalleri: derin mağaraların tavan ve tabanında */
      for (let y = 6; y < Math.min(ust, 36); y++) {
        const i = dizin(lx, y, lz);
        if (v[i] !== 0) continue;
        const alt = v[dizin(lx, y - 1, lz)], tav = v[dizin(lx, y + 1, lz)];
        const s = karma3(this.tohum ^ 0x6b72, x, y, z);
        if ((tav === 2 && s < 0.007) || (alt === 2 && s < 0.004)) v[i] = 61;
      }
    }
  }

  /* Yarık: (x, z) sütunu bir yarığın içindeyse oyulacak en alt yüksekliği, değilse null döner.
     Genişlik 8-18 blok; tabanı lav seviyesinin üstündedir; su kenarlarında ve köylerde oluşmaz. */
  yarik(x, z, o) {
    if (o.h < DENIZ + 6) return null;
    const maske = this.gY.g2(x / 420, z / 420);
    if (maske <= 0.3) return null;
    const wx = x + this.gY3.g2(x / 90, z / 90) * 26, wz = z + this.gY3.g2(x / 90 + 50, z / 90 + 50) * 26;
    const r = Math.abs(this.gY2.g2(wx / 260, wz / 260));
    const w = 0.02 + Math.min(1, (maske - 0.3) / 0.25) * 0.028;
    if (r >= w) return null;
    if (koyIcinde(this, x, z, 12)) return null;
    const k = {};
    for (const [dx, dz] of [[7, 0], [-7, 0], [0, 7], [0, -7]]) if (this.kolon(x + dx, z + dz, k).h < DENIZ + 4) return null;
    const f = r / w;
    const merkez = Math.max(14, o.h - 22 - Math.floor(Math.abs(this.gY3.g2(x / 60 + 9, z / 60)) * 30));
    const dip = Math.round(merkez + (o.h - merkez) * Math.pow(f, 1.7));
    return dip < o.h - 1 ? dip : null;
  }

  /* Cevher damarları (parçaya özgü rastgele) */
  cevherler(v, cx, cz) {
    const r = uretec(karistir(this.tohum ^ Math.imul(cx, 73856093) ^ Math.imul(cz, 19349663)));
    const damar = (id, adet, boy, yMin, yMax) => {
      for (let n = 0; n < adet; n++) {
        let x = r() * PB, y = yMin + r() * (yMax - yMin), z = r() * PB;
        const dx = r() * 2 - 1, dy = (r() * 2 - 1) * 0.5, dz = r() * 2 - 1;
        for (let k = 0; k < boy; k++) {
          const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
          if (ix >= 0 && ix < PB && iz >= 0 && iz < PB && iy > 0 && iy < PY) {
            const i = dizin(ix, iy, iz);
            if (v[i] === 2) v[i] = id;
          }
          x += dx + (r() - 0.5); y += dy + (r() - 0.5) * 0.6; z += dz + (r() - 0.5);
        }
      }
    };
    damar(16, 18, 9, 5, 110);
    damar(18, 9, 7, 8, 80);
    damar(17, 9, 6, 4, 64);
    damar(19, 3, 5, 2, 32);
    if (r() < 0.7) damar(20, 1 + (r() < 0.3 ? 1 : 0), 4, 2, 16);
  }

  /* Ağaçlar: 5 x 5 hücre ızgarası, her hücrede en fazla bir ağaç (parça sınırlarını aşabilir) */
  agaclar(v, x0, z0) {
    const set = (x, y, z, id, sadeceBos) => {
      const lx = x - x0, lz = z - z0;
      if (lx < 0 || lx >= PB || lz < 0 || lz >= PB || y < 1 || y >= PY) return;
      const i = dizin(lx, y, lz);
      if (sadeceBos && v[i] !== 0) return;
      v[i] = id;
    };
    const liste = [];
    const h0x = Math.floor((x0 - 4) / HUCRE), h1x = Math.floor((x0 + PB + 4) / HUCRE);
    const h0z = Math.floor((z0 - 4) / HUCRE), h1z = Math.floor((z0 + PB + 4) / HUCRE);
    const o = {};
    for (let hz = h0z; hz <= h1z; hz++) for (let hx = h0x; hx <= h1x; hx++) {
      const s = karma2(this.tohum ^ 0x5bd1e995, hx, hz);
      const x = hx * HUCRE + Math.floor(karma2(this.tohum ^ 0x1234, hx, hz) * 3);
      const z = hz * HUCRE + Math.floor(karma2(this.tohum ^ 0x4321, hx, hz) * 3);
      if (x < x0 - 3 || x >= x0 + PB + 3 || z < z0 - 3 || z >= z0 + PB + 3) continue;
      this.kolon(x, z, o);
      const p = AGAC_OLASILIK[o.b];
      if (!p || s > p || o.h < DENIZ + 1) continue;
      if (o.b === BY.DAG && o.h > DENIZ + 50) continue;
      const ust = this.ustBlok(o, x, z);
      if (ust !== 4 && ust !== 45 && ust !== 142 && ust !== 143) continue;
      if (this.girisMi(x, z)) continue;
      if (koyIcinde(this, x, z)) continue;
      if (this.yarik(x, z, o) != null) continue;
      let tur = 'mese';
      const s2 = karma2(this.tohum ^ 0x77, x, z);
      if (o.b === BY.TAYGA || o.b === BY.KARLI_OVA || (o.b === BY.DAG && o.te < 0.15)) tur = 'ladin';
      else if (o.b === BY.SAVAN || (o.b === BY.DAG && o.te > 0.3)) tur = 'akasya';
      else if (o.b === BY.BATAKLIK) tur = 'bataklik';
      else if (o.b === BY.HUS) tur = s2 < 0.85 ? 'hus' : 'mese';
      else if (o.b === BY.ORMAN) tur = s2 < 0.2 ? 'hus' : 'mese';
      liste.push([x, o.h + 1, z, tur, o.b]);
    }
    /* Önce yapraklar, sonra gövdeler: komşu parçalarda aynı sonucu verir */
    for (const a of liste) agacKur(set, a[0], a[1], a[2], a[3], uretec(karistir(this.tohum ^ Math.imul(a[0], 341873128) ^ Math.imul(a[2], 132897987))), 'yaprak');
    for (const a of liste) agacKur(set, a[0], a[1], a[2], a[3], uretec(karistir(this.tohum ^ Math.imul(a[0], 341873128) ^ Math.imul(a[2], 132897987))), 'govde');
    /* 0.21.0: çiçekli bölgelerdeki meşe ve huşların bir kısmında gövdeye asılı arı kovanı (girişi dışa bakar) */
    for (const a of liste) {
      if ((a[3] !== 'mese' && a[3] !== 'hus') || !(a[4] === BY.CAYIR || a[4] === BY.ORMAN || a[4] === BY.HUS)) continue;
      if (karma2(this.tohum ^ 0xbee5, a[0], a[2]) > 0.07) continue;
      const d = Math.floor(karma2(this.tohum ^ 0xbee6, a[0], a[2]) * 4) % 4, [dx, dz] = [[0, -1], [1, 0], [0, 1], [-1, 0]][d];
      set(a[0] + dx, a[1] + 1, a[2] + dz, 569 + d * 6 + 2, true);
    }
  }

  /* Otlar, çiçekler, çalılar, mantarlar, deniz yosunu */
  bitkiler(v, x0, z0, kolonlar) {
    for (let lz = 0; lz < PB; lz++) for (let lx = 0; lx < PB; lx++) {
      const o = kolonlar[lz * PB + lx];
      const x = x0 + lx, z = z0 + lz, h = o.h;
      if (h + 1 >= PY) continue;
      const alt = v[dizin(lx, h, lz)], ust = dizin(lx, h + 1, lz);
      const r = karma2(this.tohum ^ 0x9e3779b9, x, z);
      if (alt === 7 || (h < DENIZ && v[ust] === 7)) {
        /* Su altı */
        const derin = DENIZ - h;
        if (alt === 7) continue;
        const ui = dizin(lx, h + 1, lz);
        /* Sıcak ve sığ sularda mercan resifleri */
        const resif = o.t > 0.1 && derin >= 3 && derin <= 16 && (o.b === BY.OKYANUS || o.b === BY.DERIN) && this.gZ.g2(x / 36 + 40, z / 36) > -0.05;
        if (resif) {
          const r2 = karma2(this.tohum ^ 0x6d6572, x, z), renk = Math.floor(((this.gG.g2(x / 14, z / 14) + 1) / 2) * 3) % 3;
          if (r2 < 0.42) { v[dizin(lx, h, lz)] = 62 + renk; if (r2 < 0.12 && derin >= 4) { v[ui] = 62 + ((renk + 1) % 3); if (v[ui + PB * PB] === 7) v[ui + PB * PB] = 65 + renk; } else if (v[ui] === 7) v[ui] = 65 + renk; }
          else if (r2 < 0.62 && v[ui] === 7) v[ui] = 65 + ((renk + 2) % 3);
          else if (r2 < 0.75 && v[ui] === 7) v[ui] = 68;
          continue;
        }
        /* Bataklıkta su yüzeyinde nilüferler */
        if (o.b === BY.BATAKLIK && derin <= 2) { if (r < 0.14 && v[dizin(lx, DENIZ + 1, lz)] === 0) v[dizin(lx, DENIZ + 1, lz)] = 146; continue; }
        if (derin >= 2 && r < 0.07) {
          const boy = 1 + Math.floor(karma2(this.tohum ^ 0x31, x, z) * Math.min(4, derin - 1));
          for (let k = 1; k <= boy; k++) { const i = dizin(lx, h + k, lz); if (v[i] === 7) v[i] = 31; }
        } else if (r < 0.26 && v[ui] === 7) v[ui] = 68;
        else if (derin >= 3 && r < 0.268 && (alt === 5 || alt === 6) && v[ui] === 7) v[ui] = 69;
        continue;
      }
      if (v[ust] !== 0) continue;
      let id = 0;
      if (alt === 4) {
        if (o.b === BY.CAYIR) id = r < 0.18 ? 25 : r < 0.2 ? 26 : r < 0.22 ? 27 : r < 0.226 ? 44 : r < 0.2285 ? 28 : 0;
        else if (o.b === BY.ORMAN) id = r < 0.1 ? 25 : r < 0.13 ? 43 : r < 0.136 ? 36 : r < 0.142 ? 28 : r < 0.146 ? 26 : 0;
        else if (o.b === BY.HUS) id = r < 0.12 ? 25 : r < 0.135 ? 27 : r < 0.145 ? 44 : r < 0.148 ? 28 : 0;
        else id = r < 0.05 ? 25 : 0;
      } else if (alt === 45) id = o.b === BY.KARLI_OVA ? (r < 0.015 ? 30 : 0) : r < 0.05 ? 43 : r < 0.055 ? 36 : r < 0.06 ? 28 : 0;
      else if (alt === 142) id = r < 0.3 ? 25 : r < 0.33 ? 30 : r < 0.335 ? 27 : 0;
      else if (alt === 143) id = r < 0.16 ? 25 : r < 0.2 ? 43 : r < 0.215 ? 36 : r < 0.218 ? 26 : 0;
      else if (alt === 5 && o.b === BY.COL) id = r < 0.012 ? 30 : 0;
      /* 0.21.0: çayır ve ormanlarda balkabağı tarlaları; deniz seviyesindeki kıyılarda şeker kamışı */
      if (!id && (alt === 4 || alt === 45) && (o.b === BY.CAYIR || o.b === BY.ORMAN || o.b === BY.HUS || o.b === BY.TAYGA) && this.gG.g2(x / 30 + 77, z / 30 - 13) > 0.5 && karma2(this.tohum ^ 0xba1ab, x, z) < 0.1) id = 559;
      if (!id && (alt === 3 || alt === 4 || alt === 5) && h === DENIZ && lx > 0 && lx < PB - 1 && lz > 0 && lz < PB - 1 && karma2(this.tohum ^ 0x5e4e, x, z) < 0.5
        && (v[dizin(lx + 1, h, lz)] === 7 || v[dizin(lx - 1, h, lz)] === 7 || v[dizin(lx, h, lz + 1)] === 7 || v[dizin(lx, h, lz - 1)] === 7)) {
        const boy = 1 + Math.floor(karma2(this.tohum ^ 0x5e4f, x, z) * 3);
        for (let k = 1; k <= boy && h + k < PY; k++) if (v[dizin(lx, h + k, lz)] === 0) v[dizin(lx, h + k, lz)] = 568;
        continue;
      }
      if (id) v[ust] = id;
    }
  }

  /* Karlı biyomlarda ağaçların ve zeminin en üst bloğunun üstüne ince kar katmanı */
  karKapla(v, kolonlar) {
    for (let lz = 0; lz < PB; lz++) for (let lx = 0; lx < PB; lx++) {
      const o = kolonlar[lz * PB + lx];
      if (!KARLI.has(o.b) && !(o.b === BY.DAG && o.te < SICAK.SOGUK)) continue;
      for (let y = PY - 2; y > o.h; y--) {
        const b = v[dizin(lx, y, lz)];
        if (!b) continue;
        if (YAPRAKLAR.has(b) && !v[dizin(lx, y + 1, lz)]) v[dizin(lx, y + 1, lz)] = 141;
        break;
      }
    }
  }

  /* Mağara süslemesi: bölgelere göre yosunlu mağaralar (yosun, sarmaşık, ışıklı mantar), damlataşı mağaraları (sarkıt, dikit)
     ve sıradan mağaralarda seyrek mantar ile örümcek ağı */
  magaraSusle(v, x0, z0, kolonlar) {
    const TAS = new Set([2, 3, 6, 15]);
    for (let lz = 0; lz < PB; lz++) for (let lx = 0; lx < PB; lx++) {
      const o = kolonlar[lz * PB + lx];
      const x = x0 + lx, z = z0 + lz;
      const bolge = this.gC.g2(x / 150, z / 150), bolge2 = this.gC2.g2(x / 150, z / 150);
      const yosunlu = bolge > 0.32, damla = bolge < -0.36, ust = Math.min(o.h - 6, 70);
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
        } else if (y < 40) {
          if (TAS.has(alt) && s2 < 0.006) v[i] = bolge2 > 0.2 ? 153 : 36;
          else if (TAS.has(tav) && s2 < 0.003) v[i] = 148;
        }
      }
    }
  }

  /* Oyuncunun doğacağı nokta: rastgele seçilen, köylerden uzak, düz ve kuru bir arazi */
  dogumNoktasi() { return this.dogumAday(); }
  dogumAday() {
    const r = uretec(this.tohum ^ 0xabcdef);
    const o = {}, q = {};
    const UYGUN = new Set([BY.CAYIR, BY.ORMAN, BY.HUS, BY.SAVAN]);
    for (let deneme = 0; deneme < 600; deneme++) {
      const aci = r() * Math.PI * 2, m = 0.1 + r() * 0.5;
      const x = Math.round(Math.cos(aci) * m * KITA_YARICAP), z = Math.round(Math.sin(aci) * m * KITA_YARICAP);
      this.kolon(x, z, o);
      if (o.c < 0.08 || !UYGUN.has(o.b) || o.h < DENIZ + 3 || o.h > DENIZ + 18 || this.girisMi(x, z)) continue;
      if (koyIcinde(this, x, z, 90) || this.yarik(x, z, o) != null) continue;
      /* Çevresi düz ve kara */
      let uygun = true;
      for (const [dx, dz] of [[6, 0], [-6, 0], [0, 6], [0, -6], [4, 4], [-4, -4]]) { this.kolon(x + dx, z + dz, q); if (q.h < DENIZ + 1 || Math.abs(q.h - o.h) > 3) { uygun = false; break; } }
      if (uygun) return { x: x + 0.5, y: o.h + 1, z: z + 0.5 };
    }
    for (let x = 0; x < KITA_YARICAP; x += 7) { this.kolon(x, 0, o); if (o.h > DENIZ + 1 && o.b !== BY.DAG) return { x: x + 0.5, y: o.h + 1, z: 0.5 }; }
    return { x: 0.5, y: PY - 10, z: 0.5 };
  }
}

/* Ağaç kurucu: hem dünya üretiminde hem fidan büyümesinde kullanılır.
   kisim: 'yaprak' | 'govde' | 'hepsi' */
export function agacKur(set, x, y, z, tur, r, kisim = 'hepsi') {
  const yap = kisim !== 'govde', gov = kisim !== 'yaprak';
  let kutuk = 8, yaprak = 9, boy;
  if (tur === 'hus') { kutuk = 12; yaprak = 13; boy = 5 + Math.floor(r() * 3); }
  else if (tur === 'ladin') { kutuk = 10; yaprak = 11; boy = 6 + Math.floor(r() * 4); }
  else if (tur === 'akasya') { kutuk = 144; yaprak = 145; boy = 4 + Math.floor(r() * 2); }
  else boy = 4 + Math.floor(r() * 3);
  /* Akasya: gövde yukarıda bir yana eğilir, tepesi yassı ve geniş bir taç */
  if (tur === 'akasya') {
    const yon = Math.floor(r() * 4), [ax, az] = [[1, 0], [-1, 0], [0, 1], [0, -1]][yon], kayma = 1 + Math.floor(r() * 2);
    const tx = x + ax * kayma, tz = z + az * kayma, tepe = y + boy + 1;
    if (yap) {
      for (let dz = -3; dz <= 3; dz++) for (let dx = -3; dx <= 3; dx++) if (Math.abs(dx) + Math.abs(dz) <= 4 && !(Math.abs(dx) === 3 && Math.abs(dz) === 3)) set(tx + dx, tepe, tz + dz, yaprak, true);
      for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) set(tx + dx, tepe + 1, tz + dz, yaprak, true);
    }
    if (gov) {
      for (let k = 0; k < boy - 1; k++) set(x, y + k, z, kutuk, false);
      /* Eğik gövde: her basamak bir alttakine yüzeyden bağlanır (köşeden değil) */
      for (let k = 1; k <= kayma; k++) { set(x + ax * (k - 1), y + boy - 2 + k, z + az * (k - 1), kutuk, false); set(x + ax * k, y + boy - 2 + k, z + az * k, kutuk, false); }
      set(tx, tepe - 1, tz, kutuk, false);
    }
    return;
  }
  /* Bataklık ağacı: meşe biçimi, geniş taç ve sarkan sarmaşıklar */
  if (tur === 'bataklik') {
    const ust = y + boy;
    if (yap) {
      for (let yy = ust - 2; yy <= ust + 1; yy++) {
        const ry = yy >= ust ? 2 : 3;
        for (let dz = -ry; dz <= ry; dz++) for (let dx = -ry; dx <= ry; dx++) {
          /* Yuvarlak taç: köşeler ve dış kenarın bir kısmı boş kalır */
          const d2 = dx * dx + dz * dz;
          if (d2 > ry * ry + 1 || (d2 > (ry - 1) * (ry - 1) + 1 && karma3(93, x + dx, yy, z + dz) < 0.35)) continue;
          set(x + dx, yy, z + dz, 9, true);
        }
      }
      for (let dz = -4; dz <= 4; dz++) for (let dx = -4; dx <= 4; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dz)) !== 4 || karma3(91, x + dx, y, z + dz) > 0.45) continue;
        const uz = 1 + Math.floor(karma3(92, x + dx, y, z + dz) * 4);
        for (let k = 0; k < uz; k++) set(x + dx * 3 / 4 | 0, ust - 2 - k, z + dz * 3 / 4 | 0, 147, true);
      }
    }
    if (gov) for (let k = 0; k < boy; k++) set(x, y + k, z, 8, false);
    return;
  }
  if (yap) {
    if (tur === 'ladin') {
      const tepe = y + boy;
      set(x, tepe + 1, z, yaprak, true);
      for (let yy = tepe; yy >= y + 2; yy--) {
        const k = tepe - yy;
        const ry = k === 0 ? 1 : (k % 2 === 1 ? Math.min(3, 1 + (k >> 1)) : Math.max(1, (k >> 1)));
        for (let dz = -ry; dz <= ry; dz++) for (let dx = -ry; dx <= ry; dx++) {
          if (dx * dx + dz * dz > ry * ry + 1) continue;
          set(x + dx, yy, z + dz, yaprak, true);
        }
      }
    } else {
      const ust = y + boy;
      for (let yy = ust - 2; yy <= ust + 1; yy++) {
        const ry = yy >= ust ? 1 : 2;
        for (let dz = -ry; dz <= ry; dz++) for (let dx = -ry; dx <= ry; dx++) {
          const kose = Math.abs(dx) === ry && Math.abs(dz) === ry;
          if (kose && (yy >= ust || karma3(77, x + dx, yy, z + dz) < 0.5)) continue;
          set(x + dx, yy, z + dz, yaprak, true);
        }
      }
    }
  } else {
    /* Yalnız gövde aşamasında da aynı rastgele sırayı korumak için boy hesaplandı */
  }
  if (gov) for (let k = 0; k < boy; k++) set(x, y + k, z, kutuk, false);
}
