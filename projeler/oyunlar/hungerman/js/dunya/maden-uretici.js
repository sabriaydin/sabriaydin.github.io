/* HungerMan - terk edilmiş madenler: yeraltında, ahşap direklerle desteklenmiş dar koridorlar
   Dünya 112 x 112 bloklu hücrelere ayrılır; her hücrede tohuma göre en fazla bir maden bulunur.
   Merkezde bir oda, odadan dört yöne (bazıları dallanan) koridorlar uzanır. Koridorlarda çit direkleri ve kalas kirişler,
   yer yer meşaleler, örümcek ağları, ganimet sandıkları ve bazen bir örümcek yuvası bulunur.
   Koridor mağara boşluğundan geçerken altına kalas köprü kurulur. */
import { PB, PY, dizin } from '../sabitler.js';
import { karistir, uretec, karma3 } from '../rastgele.js';

export const MADEN_HUCRE = 112;
const YAYILMA = 64;   // madenin merkezinden en uzak noktası

export function madenBul(u, gx, gz) {
  const k = gx + ',' + gz;
  if (!u.madenOnbellek) u.madenOnbellek = new Map();
  if (u.madenOnbellek.has(k)) return u.madenOnbellek.get(k);
  let m = null;
  const r = uretec(karistir(u.tohum ^ Math.imul(gx, 0x2d6a5b3f) ^ Math.imul(gz, 0x1f83d9ab) ^ 0x6d6164));
  if (r() < 0.3) {
    const x = gx * MADEN_HUCRE + 24 + Math.floor(r() * (MADEN_HUCRE - 48));
    const z = gz * MADEN_HUCRE + 24 + Math.floor(r() * (MADEN_HUCRE - 48));
    const y = 18 + Math.floor(r() * 18);
    const o = u.kolon(x, z, {});
    if (o.h >= y + 14 && o.c > 0.05) {
      const koridorlar = [];
      /* Merkez odadan dört yöne ana koridorlar, bazılarından yan dallar */
      for (let yi = 0; yi < 4; yi++) {
        if (r() < 0.2) continue;
        const [ax, az] = [[1, 0], [0, 1], [-1, 0], [0, -1]][yi];
        const L = 18 + Math.floor(r() * 30);
        const k = { x: x + ax * 4, z: z + az * 4, ax, az, L, y };
        koridorlar.push(k);
        if (r() < 0.65) {
          const t = 8 + Math.floor(r() * (L - 10)), s = r() < 0.5 ? 1 : -1;
          koridorlar.push({ x: k.x + ax * t - az * s * 2, z: k.z + az * t + ax * s * 2, ax: -az * s, az: ax * s, L: 10 + Math.floor(r() * 18), y });
        }
      }
      const sandiklar = [];
      for (const k of koridorlar) if (r() < 0.55) { const t = 3 + Math.floor(r() * (k.L - 4)), s = r() < 0.5 ? 1 : -1; sandiklar.push([k.x + k.ax * t - k.az * s, y, k.z + k.az * t + k.ax * s]); }
      const yuva = r() < 0.35 ? [x, y, z] : null;
      m = { x, y, z, koridorlar, sandiklar, yuva, tohum: (r() * 1e9) | 0 };
    }
  }
  u.madenOnbellek.set(k, m);
  return m;
}

export function madenlerAlan(u, x0, z0, x1, z1) {
  const out = [];
  for (let gz = Math.floor((z0 - YAYILMA) / MADEN_HUCRE); gz <= Math.floor((z1 + YAYILMA) / MADEN_HUCRE); gz++)
    for (let gx = Math.floor((x0 - YAYILMA) / MADEN_HUCRE); gx <= Math.floor((x1 + YAYILMA) / MADEN_HUCRE); gx++) {
      const m = madenBul(u, gx, gz);
      if (m && m.x + YAYILMA >= x0 && m.x - YAYILMA <= x1 && m.z + YAYILMA >= z0 && m.z - YAYILMA <= z1) out.push(m);
    }
  return out;
}

/* Bu konum bir madenin içinde mi (sandık ganimeti ve yuva türü için) */
export function madenAt(u, x, y, z) {
  for (const m of madenlerAlan(u, x, z, x, z)) {
    if (y < m.y - 1 || y > m.y + 3) continue;
    if (Math.abs(x - m.x) <= 3 && Math.abs(z - m.z) <= 3) return m;
    for (const k of m.koridorlar) {
      const t = (x - k.x) * k.ax + (z - k.z) * k.az, p = (x - k.x) * -k.az + (z - k.z) * k.ax;
      if (t >= -1 && t <= k.L && Math.abs(p) <= 1) return m;
    }
  }
  return null;
}

const KATI_DEGIL = new Set([0, 7, 59, 25, 36, 43, 147, 148, 150, 151, 153]);

export function madenYaz(u, v, x0, z0) {
  for (const m of madenlerAlan(u, x0, z0, x0 + PB - 1, z0 + PB - 1)) {
    const ic = (x, z) => x >= x0 && x < x0 + PB && z >= z0 && z < z0 + PB;
    const set = (x, y, z, id) => { if (ic(x, z) && y > 0 && y < PY) v[dizin(x - x0, y, z - z0)] = id; };
    const al = (x, y, z) => (ic(x, z) && y > 0 && y < PY ? v[dizin(x - x0, y, z - z0)] : -1);
    const y = m.y;
    /* Merkez oda: 7 x 7, 4 yüksek; tabanı toprak */
    for (let dz = -3; dz <= 3; dz++) for (let dx = -3; dx <= 3; dx++) {
      for (let dy = 0; dy < 4; dy++) set(m.x + dx, y + dy, m.z + dz, 0);
      const a = al(m.x + dx, y - 1, m.z + dz);
      if (a !== -1 && KATI_DEGIL.has(a)) set(m.x + dx, y - 1, m.z + dz, 3); else if (a === 2 || a === 1) set(m.x + dx, y - 1, m.z + dz, 3);
    }
    for (const [dx, dz] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) for (let dy = 0; dy < 4; dy++) set(m.x + dx, y + dy, m.z + dz, 8);
    set(m.x - 2, y + 2, m.z - 3, 46); set(m.x + 2, y + 2, m.z + 3, 46);
    /* Koridorlar */
    for (const k of m.koridorlar) {
      const px = -k.az, pz = k.ax;
      for (let t = 0; t <= k.L; t++) {
        const cx = k.x + k.ax * t, cz = k.z + k.az * t;
        const destek = t % 4 === 2;
        for (let p = -1; p <= 1; p++) {
          const x = cx + px * p, z = cz + pz * p;
          if (!ic(x, z)) continue;
          for (let dy = 0; dy < 3; dy++) {
            const id = al(x, y + dy, z);
            if (id === 7 || id === 59) continue;   // su ve lav korunur
            set(x, y + dy, z, 0);
          }
          /* Boşluk üstünden geçerken kalas köprü */
          if (KATI_DEGIL.has(al(x, y - 1, z))) set(x, y - 1, z, 14);
          if (destek) {
            if (p !== 0) { set(x, y, z, 104); set(x, y + 1, z, 104); }
            set(x, y + 2, z, 14);
          } else {
            const s = karma3(m.tohum, x, y, z);
            if (p !== 0 && s < 0.07) set(x, y + 2, z, 148);
            else if (p !== 0 && t % 8 === 4 && s < 0.5) set(x, y + 1, z, 46);
          }
        }
      }
    }
    for (const [x, yy, z] of m.sandiklar) { if (!ic(x, z)) continue; set(x, yy, z, 50); set(x, yy + 1, z, 0); }
    /* Örümcek yuvası ve çevresinde ağlar */
    if (m.yuva) {
      const [x, yy, z] = m.yuva;
      set(x, yy, z, 58);
      for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) for (let dy = 0; dy < 3; dy++) {
        if ((dx || dz || dy) && al(x + dx, yy + dy, z + dz) === 0 && karma3(m.tohum ^ 9, x + dx, yy + dy, z + dz) < 0.3) set(x + dx, yy + dy, z + dz, 148);
      }
    }
  }
}
