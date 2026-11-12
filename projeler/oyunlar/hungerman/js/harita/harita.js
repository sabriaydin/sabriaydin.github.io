/* HungerMan - keşif haritası
   Oyuncunun görüş mesafesine giren her parça, üstten görünüm olarak (sütun başına en üstteki blok ve yükseklik) saklanır.
   Parçalar 16 x 16 parçalık bölgelerde toplanır; her bölge 256 x 256 piksellik bir tuvale (1 piksel = 1 blok) boyanır.
   Bölge tuvalleri hem büyük haritada hem mini haritada ölçeklenerek çizilir. */
import { PB, PY, DENIZ, dizin } from '../sabitler.js';
import { KATI, SIVI, LAV, YUZ_DOKU, BLOKLAR } from '../bloklar.js';
import { doseme } from '../grafik/doku.js';

export const BOLGE = 16;
export const BOLGE_BLOK = BOLGE * PB;
const TARAMA = 0.35;      // yeni parçaların haritaya işlenme aralığı (sn)
const TARAMA_ADET = 14;   // bir taramada işlenen en çok parça

/* Bloğun üst yüz dokusunun ortalama rengi (0..255) */
const RENK = new Map();
function ustRenk(id) {
  let c = RENK.get(id);
  if (c) return c;
  c = [120, 120, 120];
  try {
    const d = doseme(YUZ_DOKU[id * 6 + 2]).getContext('2d').getImageData(0, 0, 16, 16).data;
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 128) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
    if (n) c = [r / n, g / n, b / n];
  } catch (e) { /* doku yok: gri */ }
  RENK.set(id, c);
  return c;
}

/* Bir sütunun haritadaki karşılığı: [blok, yükseklik]; su için blok = taban bloğu, yükseklik = 128 + derinlik */
function sutun(al) {
  for (let y = PY - 1; y > 0; y--) {
    const b = al(y);
    if (!b) continue;
    if (LAV[b]) return [b, y];
    if (SIVI[b]) {
      let d = 0, yy = y;
      while (yy > 0 && SIVI[al(yy)] && !LAV[al(yy)]) { d++; yy--; }
      return [al(yy) || 7, 128 + Math.min(127, d)];
    }
    if (!KATI[b] && !(BLOKLAR[b] && BLOKLAR[b].ekin != null)) continue;   // ot, çiçek, meşale görünmez; ekinler görünür
    return [b, y];
  }
  return [0, 0];
}
export function parcaHesapla(v) {
  const t = new Uint8Array(PB * PB * 2);
  for (let z = 0; z < PB; z++) for (let x = 0; x < PB; x++) {
    const [id, h] = sutun(y => v[dizin(x, y, z)]);
    t[z * PB + x] = id; t[PB * PB + z * PB + x] = h;
  }
  return t;
}

const SU_SIG = [70, 138, 192], SU_DERIN = [20, 50, 108];

export class Harita {
  constructor(dunya) {
    this.dunya = dunya;
    this.parcalar = new Map();   // "cx,cz" -> Uint8Array(512)
    this.bolgeler = new Map();   // "rx,rz" -> bölge
    this.taze = new Set();       // bu oturumda güncel hâli işlenen parçalar
    this.sayac = 0;
    this.sinir = null;           // keşfedilen alanın sınırları (blok): [x0, z0, x1, z1]
    this.dinle = (x, y, z) => this.blokDegisti(x, y, z);
    dunya.dinleyiciler.push(this.dinle);
  }
  temizle() { const i = this.dunya.dinleyiciler.indexOf(this.dinle); if (i >= 0) this.dunya.dinleyiciler.splice(i, 1); this.bolgeler.clear(); this.parcalar.clear(); }

  bolge(rx, rz, olustur) {
    const k = rx + ',' + rz;
    let b = this.bolgeler.get(k);
    if (!b && olustur) {
      const cv = document.createElement('canvas'); cv.width = cv.height = BOLGE_BLOK;
      const ctx = cv.getContext('2d');
      b = { k, rx, rz, cv, ctx, img: ctx.createImageData(BOLGE_BLOK, BOLGE_BLOK), boyaBekliyor: false, kirli: false, kayitKirli: false };
      this.bolgeler.set(k, b);
    }
    return b;
  }
  /* Çizime hazır bölge tuvali (yoksa null) */
  tuval(rx, rz) {
    const b = this.bolgeler.get(rx + ',' + rz);
    if (!b) return null;
    if (b.boyaBekliyor) this.bolgeBoya(b);
    if (b.kirli) { b.ctx.putImageData(b.img, 0, 0); b.kirli = false; }
    return b.cv;
  }

  kesfedildi(x, z) { return this.parcalar.has(Math.floor(x / PB) + ',' + Math.floor(z / PB)); }
  /* Sütun bilgisi: { id, h, su, derinlik } ya da keşfedilmemişse null */
  kolon(x, z) {
    x = Math.floor(x); z = Math.floor(z);
    const cx = Math.floor(x / PB), cz = Math.floor(z / PB), t = this.parcalar.get(cx + ',' + cz);
    if (!t) return null;
    const i = (z - cz * PB) * PB + (x - cx * PB), h = t[PB * PB + i];
    return { id: t[i], h: h >= 128 ? DENIZ : h, su: h >= 128, derinlik: h >= 128 ? h - 128 : 0 };
  }
  yukseklik(x, z) {
    const cx = Math.floor(x / PB), cz = Math.floor(z / PB), t = this.parcalar.get(cx + ',' + cz);
    if (!t) return null;
    const h = t[PB * PB + (z - cz * PB) * PB + (x - cx * PB)];
    return h >= 128 ? DENIZ : h;
  }

  /* ---------- Keşif ---------- */
  guncelle(dt) {
    this.sayac -= dt;
    if (this.sayac > 0) return;
    this.sayac = TARAMA;
    const d = this.dunya, [pcx, pcz] = d.merkez, R2 = (d.gorus + 0.5) ** 2;
    let n = 0;
    for (const [ox, oz, dd] of d.ofsetler) {
      if (dd > R2) break;
      const cx = pcx + ox, cz = pcz + oz, k = cx + ',' + cz;
      if (this.taze.has(k)) continue;
      const p = d.parcalar.get(k);
      if (!p || !p.v) continue;
      this.taze.add(k);
      const yeni = parcaHesapla(p.v), eski = this.parcalar.get(k);
      if (eski && eski.every((v, i) => v === yeni[i])) continue;
      this.ekle(cx, cz, yeni);
      if (++n >= TARAMA_ADET) break;
    }
  }
  sinirGenislet(cx, cz) {
    const x0 = cx * PB, z0 = cz * PB, x1 = x0 + PB, z1 = z0 + PB, s = this.sinir;
    if (!s) this.sinir = [x0, z0, x1, z1];
    else { if (x0 < s[0]) s[0] = x0; if (z0 < s[1]) s[1] = z0; if (x1 > s[2]) s[2] = x1; if (z1 > s[3]) s[3] = z1; }
  }
  ekle(cx, cz, veri) {
    this.parcalar.set(cx + ',' + cz, veri);
    this.sinirGenislet(cx, cz);
    const b = this.bolge(Math.floor(cx / BOLGE), Math.floor(cz / BOLGE), true);
    b.kayitKirli = true;
    this.parcaBoya(cx, cz); this.parcaBoya(cx + 1, cz); this.parcaBoya(cx, cz + 1);
  }
  /* Yüklü bir parçadaki blok değişince sütun yeniden hesaplanır */
  blokDegisti(x, y, z) {
    const cx = Math.floor(x / PB), cz = Math.floor(z / PB), t = this.parcalar.get(cx + ',' + cz);
    if (!t) return;
    const d = this.dunya;
    const [id, h] = sutun(yy => d.blok(x, yy, z));
    const i = (z - cz * PB) * PB + (x - cx * PB);
    if (t[i] === id && t[PB * PB + i] === h) return;
    t[i] = id; t[PB * PB + i] = h;
    const b = this.bolge(Math.floor(cx / BOLGE), Math.floor(cz / BOLGE));
    if (b) b.kayitKirli = true;
    this.pikselBoya(x, z); this.pikselBoya(x + 1, z); this.pikselBoya(x, z + 1);
  }

  /* ---------- Boyama ---------- */
  bolgeBoya(b) {
    b.boyaBekliyor = false;
    for (let j = 0; j < BOLGE; j++) for (let i = 0; i < BOLGE; i++) this.parcaBoya(b.rx * BOLGE + i, b.rz * BOLGE + j);
  }
  parcaBoya(cx, cz) {
    const t = this.parcalar.get(cx + ',' + cz);
    if (!t) return;
    const b = this.bolge(Math.floor(cx / BOLGE), Math.floor(cz / BOLGE));
    if (!b || b.boyaBekliyor) return;
    for (let z = 0; z < PB; z++) for (let x = 0; x < PB; x++) this.boya(b, t, cx * PB + x, cz * PB + z, z * PB + x);
  }
  pikselBoya(x, z) {
    const cx = Math.floor(x / PB), cz = Math.floor(z / PB), t = this.parcalar.get(cx + ',' + cz);
    if (!t) return;
    const b = this.bolge(Math.floor(cx / BOLGE), Math.floor(cz / BOLGE));
    if (!b || b.boyaBekliyor) return;
    this.boya(b, t, x, z, (z - cz * PB) * PB + (x - cx * PB));
  }
  boya(b, t, x, z, i) {
    const id = t[i], hh = t[PB * PB + i];
    const o = ((z - b.rz * BOLGE_BLOK) * BOLGE_BLOK + (x - b.rx * BOLGE_BLOK)) * 4, d = b.img.data;
    b.kirli = true;
    if (!id && !hh) { d[o] = 10; d[o + 1] = 9; d[o + 2] = 8; d[o + 3] = 255; return; }
    const doku = 1 + ((((x * 73856093) ^ (z * 19349663)) >>> 0) % 9 - 4) * 0.008;
    let r, g, bl;
    if (hh >= 128) {
      /* Su: derinleştikçe koyulaşır, sığda taban görünür */
      const der = hh - 128, f = Math.min(1, der / 22);
      r = SU_SIG[0] + (SU_DERIN[0] - SU_SIG[0]) * f; g = SU_SIG[1] + (SU_DERIN[1] - SU_SIG[1]) * f; bl = SU_SIG[2] + (SU_DERIN[2] - SU_SIG[2]) * f;
      if (der <= 5) { const c = ustRenk(id), k = 0.5 + der * 0.1; r = c[0] * 0.85 * (1 - k) + r * k; g = c[1] * 0.85 * (1 - k) + g * k; bl = c[2] * 0.85 * (1 - k) + bl * k; }
      /* Kıyı çizgisi: komşusu kara olan su biraz açık */
      const kn = this.yukseklikHam(x, z - 1), kw = this.yukseklikHam(x - 1, z);
      if ((kn != null && kn < 128) || (kw != null && kw < 128)) { r += 18; g += 20; bl += 16; }
    } else {
      const c = ustRenk(id);
      let k = 1;
      if (!LAV[id]) {
        const hn = this.yukseklik(x, z - 1) ?? hh, hw = this.yukseklik(x - 1, z) ?? hh;
        const fark = (hh - hn) + (hh - hw) * 0.5;
        k = 1 + Math.max(-0.3, Math.min(0.28, fark * 0.075));
        k *= 0.92 + Math.max(-0.16, Math.min(0.22, (hh - DENIZ) / 150));
      }
      r = c[0] * k; g = c[1] * k; bl = c[2] * k;
    }
    d[o] = Math.min(255, r * doku); d[o + 1] = Math.min(255, g * doku); d[o + 2] = Math.min(255, bl * doku); d[o + 3] = 255;
  }
  yukseklikHam(x, z) {
    const cx = Math.floor(x / PB), cz = Math.floor(z / PB), t = this.parcalar.get(cx + ',' + cz);
    return t ? t[PB * PB + (z - cz * PB) * PB + (x - cx * PB)] : null;
  }

  /* ---------- Kayıt ---------- */
  /* Değişen bölgeler: [{ k: 'rx,rz', p: [[sıra, Uint8Array]] }] */
  kirliBolgeler() {
    const l = [];
    for (const b of this.bolgeler.values()) {
      if (!b.kayitKirli) continue;
      b.kayitKirli = false;
      const p = [];
      for (let j = 0; j < BOLGE; j++) for (let i = 0; i < BOLGE; i++) { const t = this.parcalar.get((b.rx * BOLGE + i) + ',' + (b.rz * BOLGE + j)); if (t) p.push([j * BOLGE + i, t]); }
      l.push({ k: b.k, p });
    }
    return l;
  }
  iceAktar(kayitlar) {
    for (const r of kayitlar || []) {
      const k = String(r.id).split('|').pop(), [rx, rz] = k.split(',').map(Number);
      if (!Number.isFinite(rx) || !Number.isFinite(rz)) continue;
      const b = this.bolge(rx, rz, true);
      for (const [s, t] of r.p || []) {
        const cx = rx * BOLGE + (s % BOLGE), cz = rz * BOLGE + Math.floor(s / BOLGE), key = cx + ',' + cz;
        if (!this.parcalar.has(key) && t && t.length === PB * PB * 2) { this.parcalar.set(key, t instanceof Uint8Array ? t : new Uint8Array(t)); this.sinirGenislet(cx, cz); }
      }
      b.boyaBekliyor = true;
    }
  }
  /* Keşfedilen alan (blok kare) */
  get alan() { return this.parcalar.size * PB * PB; }
}
