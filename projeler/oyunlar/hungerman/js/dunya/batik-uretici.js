/* HungerMan - batık gemiler: okyanus tabanında, içinde hazine sandığı bulunan eski gemi gövdeleri
   Dünya 112 x 112 bloklu hücrelere ayrılır; derin sulu hücrelerde tohuma göre bir batık bulunur. */
import { PB, PY, DENIZ, dizin } from '../sabitler.js';
import { karistir, uretec, karma3 } from '../rastgele.js';

export const BATIK_HUCRE = 112;
const BOY = 15, EN = 5;

export function batikBul(u, gx, gz) {
  const k = gx + ',' + gz;
  if (!u.batikOnbellek) u.batikOnbellek = new Map();
  if (u.batikOnbellek.has(k)) return u.batikOnbellek.get(k);
  let b = null;
  const r = uretec(karistir(u.tohum ^ Math.imul(gx, 0x6a09e667) ^ Math.imul(gz, 0x3c6ef372) ^ 0x626174));
  if (r() < 0.45) {
    const x = gx * BATIK_HUCRE + 16 + Math.floor(r() * (BATIK_HUCRE - 32));
    const z = gz * BATIK_HUCRE + 16 + Math.floor(r() * (BATIK_HUCRE - 32));
    const o = u.kolon(x, z, {});
    if (o.h <= DENIZ - 9 && o.c < 0) {
      const eksen = r() < 0.5 ? 0 : 1;              // 0: boyu z ekseninde, 1: x ekseninde
      const kalas = r() < 0.5 ? 14 : 38;
      const kirik = 0.12 + r() * 0.12;
      const sandiklar = [[0, 1, 4]];                // yerel (genişlik, yükseklik, boy)
      if (r() < 0.6) sandiklar.push([0, 1, 11]);
      b = { x, z, y: o.h, eksen, kalas, kirik, sandiklar: sandiklar.map(([a, y, c]) => yerel({ x, z, y: o.h, eksen }, a, y, c)) };
    }
  }
  u.batikOnbellek.set(k, b);
  return b;
}

/* Yerel koordinat: a genişlik (-2..2), c boy (0..14) */
function yerel(b, a, y, c) {
  const l = c - (BOY >> 1);
  return b.eksen === 0 ? [b.x + a, b.y + y, b.z + l] : [b.x + l, b.y + y, b.z + a];
}

export function batiklarAlan(u, x0, z0, x1, z1) {
  const out = [];
  for (let gz = Math.floor((z0 - 10) / BATIK_HUCRE); gz <= Math.floor((z1 + 10) / BATIK_HUCRE); gz++)
    for (let gx = Math.floor((x0 - 10) / BATIK_HUCRE); gx <= Math.floor((x1 + 10) / BATIK_HUCRE); gx++) {
      const b = batikBul(u, gx, gz);
      if (b && b.x + 10 >= x0 && b.x - 10 <= x1 && b.z + 10 >= z0 && b.z - 10 <= z1) out.push(b);
    }
  return out;
}
export function batikAt(u, x, y, z) {
  for (const b of batiklarAlan(u, x, z, x, z)) for (const s of b.sandiklar) if (s[0] === x && s[1] === y && s[2] === z) return b;
  return null;
}

export function batikYaz(u, v, x0, z0) {
  for (const b of batiklarAlan(u, x0, z0, x0 + PB - 1, z0 + PB - 1)) {
    const set = (a, y, c, id, kirilabilir = true) => {
      const [x, yy, z] = yerel(b, a, y, c);
      if (x < x0 || x >= x0 + PB || z < z0 || z >= z0 + PB || yy < 1 || yy >= PY) return;
      if (kirilabilir && karma3(u.tohum ^ 0x6b6972, x, yy, z) < b.kirik) return;
      v[dizin(x - x0, yy, z - z0)] = id;
    };
    for (let c = 0; c < BOY; c++) {
      const yari = c < 2 || c > BOY - 3 ? 1 : 2;                 // uçlara doğru daralır
      /* Omurga ve taban */
      for (let a = -yari; a <= yari; a++) set(a, 0, c, b.kalas, false);
      set(0, -1, c, 8, false);
      /* Yan duvarlar */
      for (let y = 1; y <= 3; y++) { set(-yari, y, c, b.kalas); set(yari, y, c, b.kalas); }
      if (c === 0 || c === BOY - 1) for (let a = -yari; a <= yari; a++) for (let y = 1; y <= 3; y++) set(a, y, c, b.kalas);
      /* Güverte (ortası açık) */
      if (c < 3 || c > 8) for (let a = -yari; a <= yari; a++) set(a, 4, c, b.kalas);
    }
    /* Kamara */
    for (let c = 9; c <= 12; c++) for (let a = -2; a <= 2; a++) for (let y = 5; y <= 6; y++) if (Math.abs(a) === 2 || c === 9 || c === 12) set(a, y, c, y === 6 && (c === 10 || c === 11) && Math.abs(a) === 2 ? 34 : b.kalas);
    for (let c = 9; c <= 12; c++) for (let a = -2; a <= 2; a++) set(a, 7, c, b.kalas);
    /* Kırık direk */
    for (let y = 1; y <= 9; y++) set(0, y, 6, b.kalas === 14 ? 8 : 10, y > 6);
    /* Hazine sandıkları */
    for (const [x, y, z] of b.sandiklar) if (x >= x0 && x < x0 + PB && z >= z0 && z < z0 + PB) v[dizin(x - x0, y, z - z0)] = 50;
  }
}
