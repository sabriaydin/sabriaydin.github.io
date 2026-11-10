/* HungerMan - dünya üreticisi
   Tohumdan belirlenimli olarak üretilir: aynı tohum her bilgisayarda aynı dünyayı verir (çok oyunculu için gerekli).
   Dünya, kıyıları denizle çevrili büyük bir kara parçasıdır; iç kısımda nehirler, dağlar ve farklı biyomlar bulunur. */
import { PB, PY, DENIZ, KITA_YARICAP, DUNYA_SINIRI, dizin } from '../sabitler.js';
import { Gurultu, karistir, karma2, karma3, uretec, yumusak } from '../rastgele.js';

export const BIYOMLAR = ['Okyanus', 'Derin Okyanus', 'Nehir', 'Kumsal', 'Karlı Kumsal', 'Dağlar', 'Tayga', 'Çöl', 'Orman', 'Huş Ormanı', 'Çayır'];
export const BY = { OKYANUS: 0, DERIN: 1, NEHIR: 2, KUMSAL: 3, KARLI_KUMSAL: 4, DAG: 5, TAYGA: 6, COL: 7, ORMAN: 8, HUS: 9, CAYIR: 10 };

/* Ağaç yerleşim ızgarası */
const HUCRE = 5;
const AGAC_OLASILIK = { [BY.ORMAN]: 0.8, [BY.HUS]: 0.72, [BY.TAYGA]: 0.62, [BY.CAYIR]: 0.05, [BY.DAG]: 0.1 };

export class Uretici {
  constructor(tohum) {
    this.tohum = tohum >>> 0;
    const g = k => new Gurultu(karistir(this.tohum + k * 7919));
    this.gK = g(1); this.gD = g(2); this.gT = g(3); this.gN = g(4); this.gM = g(5); this.gR = g(6);
    this.gNe = g(7); this.gH = g(8); this.gA = g(9); this.gB = g(10); this.gO = g(11); this.gG = g(12); this.gZ = g(13);
    this.ky = { x: 0, z: 0, h: 0, b: 0, c: 0, t: 0, d: 0 };
  }

  /* Bir sütunun yüksekliği, biyomu, kıtasallığı */
  kolon(x, z, o = this.ky) {
    const mesafe = Math.sqrt(x * x + z * z) / KITA_YARICAP;
    const dusus = 0.55 - 1.15 * mesafe * mesafe;
    let c = dusus + 0.42 * this.gK.f2(x / 1100, z / 1100, 4) + 0.12 * this.gD.f2(x / 260, z / 260, 3);
    if (Math.abs(x) > DUNYA_SINIRI - 200 || Math.abs(z) > DUNYA_SINIRI - 200) c = Math.min(c, -0.4);
    const t = this.gT.f2(x / 1600, z / 1600, 3) + (mesafe > 0.6 ? 0 : 0);
    const nem = this.gN.f2(x / 1200, z / 1200, 3);
    let h, dagK = 0;
    if (c < 0) {
      const derinlik = Math.min(1, -c * 3);
      h = DENIZ - 2 - derinlik * 26 + this.gD.g2(x / 40, z / 40) * 2;
    } else {
      h = DENIZ + 1 + c * 22;
      h += this.gH.f2(x / 140, z / 140, 3) * 7 * yumusak(0, 0.15, c);
      dagK = yumusak(0.05, 0.45, this.gM.f2(x / 1300 + 50, z / 1300, 2)) * yumusak(0.04, 0.2, c);
      if (dagK > 0) { let r = 1 - Math.abs(this.gR.f2(x / 420, z / 420, 4)); r *= r; h += dagK * r * 64; }
      if (c < 0.04) h = (DENIZ - 1) + (h - (DENIZ - 1)) * (c / 0.04);
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
    let b;
    if (h < DENIZ) b = c < 0 ? (h < DENIZ - 16 ? BY.DERIN : BY.OKYANUS) : BY.NEHIR;
    else if (h <= DENIZ + 2 && c < 0.08) b = t < -0.3 ? BY.KARLI_KUMSAL : BY.KUMSAL;
    else if (h > DENIZ + 44) b = BY.DAG;
    else if (t < -0.28) b = BY.TAYGA;
    else if (t > 0.3 && nem < 0) b = BY.COL;
    else if (nem > 0.12) b = t < 0 ? BY.HUS : BY.ORMAN;
    else b = BY.CAYIR;
    o.x = x; o.z = z; o.h = h; o.b = b; o.c = c; o.t = t; o.d = dagK;
    return o;
  }

  /* Mağara girişi bölgesi (yüzeye açılan tüneller); ağaçlar bu bölgeye konmaz */
  girisMi(x, z) { return this.gG.g2(x / 90, z / 90) > 0.62; }

  /* Yüzey bloğu */
  ustBlok(o, x, z) {
    switch (o.b) {
      case BY.TAYGA: return 45;
      case BY.COL: case BY.KUMSAL: case BY.KARLI_KUMSAL: return 5;
      case BY.DAG: return o.h > DENIZ + 56 ? 21 : (this.gD.g2(x / 30, z / 30) > 0.1 && o.h < DENIZ + 54 ? 4 : 2);
      case BY.OKYANUS: case BY.DERIN: { const n = this.gZ.g2(x / 50, z / 50); return n > 0.45 ? 23 : n < -0.4 ? 6 : 5; }
      case BY.NEHIR: return this.gZ.g2(x / 30, z / 30) > 0.3 ? 6 : 5;
      default: return 4;
    }
  }

  /* ---------- Parça üretimi ---------- */
  parcaUret(cx, cz) {
    const v = new Uint8Array(PB * PB * PY);
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
      if (ust === 5) altBlok = 5; else if (ust === 2 || ust === 21) altBlok = 2; else if (ust === 6 || ust === 23) altBlok = ust;
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
      if (h < DENIZ && o.t < -0.38) v[dizin(lx, DENIZ, lz)] = 22;
    }

    this.magaralar(v, x0, z0, kolonlar);
    this.cevherler(v, cx, cz);
    this.agaclar(v, x0, z0);
    this.bitkiler(v, x0, z0, kolonlar);
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
        if (oy) v[i] = 0;
      }
    }
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
      if (ust !== 4 && ust !== 45) continue;
      if (this.girisMi(x, z)) continue;
      let tur = 'mese';
      const s2 = karma2(this.tohum ^ 0x77, x, z);
      if (o.b === BY.TAYGA || o.b === BY.DAG) tur = 'ladin';
      else if (o.b === BY.HUS) tur = s2 < 0.85 ? 'hus' : 'mese';
      else if (o.b === BY.ORMAN) tur = s2 < 0.2 ? 'hus' : 'mese';
      liste.push([x, o.h + 1, z, tur]);
    }
    /* Önce yapraklar, sonra gövdeler: komşu parçalarda aynı sonucu verir */
    for (const a of liste) agacKur(set, a[0], a[1], a[2], a[3], uretec(karistir(this.tohum ^ Math.imul(a[0], 341873128) ^ Math.imul(a[2], 132897987))), 'yaprak');
    for (const a of liste) agacKur(set, a[0], a[1], a[2], a[3], uretec(karistir(this.tohum ^ Math.imul(a[0], 341873128) ^ Math.imul(a[2], 132897987))), 'govde');
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
        if (derin >= 2 && r < 0.07 && alt !== 7) {
          const boy = 1 + Math.floor(karma2(this.tohum ^ 0x31, x, z) * Math.min(4, derin - 1));
          for (let k = 1; k <= boy; k++) { const i = dizin(lx, h + k, lz); if (v[i] === 7) v[i] = 31; }
        }
        continue;
      }
      if (v[ust] !== 0) continue;
      let id = 0;
      if (alt === 4) {
        if (o.b === BY.CAYIR) id = r < 0.18 ? 25 : r < 0.2 ? 26 : r < 0.22 ? 27 : r < 0.226 ? 44 : r < 0.2285 ? 28 : 0;
        else if (o.b === BY.ORMAN) id = r < 0.1 ? 25 : r < 0.13 ? 43 : r < 0.136 ? 36 : r < 0.142 ? 28 : r < 0.146 ? 26 : 0;
        else if (o.b === BY.HUS) id = r < 0.12 ? 25 : r < 0.135 ? 27 : r < 0.145 ? 44 : r < 0.148 ? 28 : 0;
        else id = r < 0.05 ? 25 : 0;
      } else if (alt === 45) id = r < 0.05 ? 43 : r < 0.055 ? 36 : r < 0.06 ? 28 : 0;
      else if (alt === 5 && o.b === BY.COL) id = r < 0.012 ? 30 : 0;
      if (id) v[ust] = id;
    }
  }

  /* Oyuncunun doğacağı nokta: kıyıya yakın, çayır veya ormanda düz bir yer */
  dogumNoktasi() {
    const r = uretec(this.tohum ^ 0xabcdef);
    const o = {};
    for (let deneme = 0; deneme < 400; deneme++) {
      const aci = r() * Math.PI * 2;
      for (let m = 0.62; m > 0.05; m -= 0.01) {
        const x = Math.round(Math.cos(aci) * m * KITA_YARICAP), z = Math.round(Math.sin(aci) * m * KITA_YARICAP);
        this.kolon(x, z, o);
        if (o.c < 0.05) continue;
        if ((o.b === BY.CAYIR || o.b === BY.ORMAN || o.b === BY.HUS) && o.h >= DENIZ + 2 && o.h <= DENIZ + 16 && !this.girisMi(x, z)) {
          return { x: x + 0.5, y: o.h + 1, z: z + 0.5 };
        }
        break;
      }
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
  else boy = 4 + Math.floor(r() * 3);
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
