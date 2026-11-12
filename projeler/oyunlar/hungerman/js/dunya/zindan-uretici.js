/* HungerMan - zindanlar: yeraltında canavar yuvası ve ganimet sandıkları bulunan taş odalar
   Dünya 56 x 56 bloklu hücrelere ayrılır; her hücrede tohuma göre en fazla bir zindan bulunur. */
import { PB, PY, dizin } from '../sabitler.js';
import { karistir, uretec, karma3 } from '../rastgele.js';

export const ZINDAN_HUCRE = 56;
export const YUVA_TURLERI = ['zombi', 'iskelet', 'orumcek'];

export function zindanBul(u, gx, gz) {
  const k = gx + ',' + gz;
  if (!u.zindanOnbellek) u.zindanOnbellek = new Map();
  if (u.zindanOnbellek.has(k)) return u.zindanOnbellek.get(k);
  let z = null;
  const r = uretec(karistir(u.tohum ^ Math.imul(gx, 0x3c6ef372) ^ Math.imul(gz, 0x14292967) ^ 0x7a696e));
  if (r() < 0.24) {
    const x = gx * ZINDAN_HUCRE + 10 + Math.floor(r() * (ZINDAN_HUCRE - 20));
    const zz = gz * ZINDAN_HUCRE + 10 + Math.floor(r() * (ZINDAN_HUCRE - 20));
    const y = 12 + Math.floor(r() * 26);
    const o = u.kolon(x, zz, {});
    if (o.h >= y + 12) {
      const w = r() < 0.5 ? 7 : 9, d = r() < 0.5 ? 7 : 9;
      const tur = YUVA_TURLERI[Math.floor(r() * 3)];
      const sandiklar = [[x - (w >> 1) + 1, y + 1, zz]];
      if (r() < 0.6) sandiklar.push([x + (w >> 1) - 1, y + 1, zz + (r() < 0.5 ? 1 : -1)]);
      const kapilar = [];
      for (let i = 0; i < 4; i++) if (r() < 0.55) kapilar.push(i);
      z = { x, y, z: zz, w, d, tur, sandiklar, kapilar };
    }
  }
  u.zindanOnbellek.set(k, z);
  return z;
}

export function zindanlarAlan(u, x0, z0, x1, z1) {
  const out = [];
  for (let gz = Math.floor(z0 / ZINDAN_HUCRE); gz <= Math.floor(z1 / ZINDAN_HUCRE); gz++)
    for (let gx = Math.floor(x0 / ZINDAN_HUCRE); gx <= Math.floor(x1 / ZINDAN_HUCRE); gx++) {
      const z = zindanBul(u, gx, gz);
      if (z && z.x + 6 >= x0 && z.x - 6 <= x1 && z.z + 6 >= z0 && z.z - 6 <= z1) out.push(z);
    }
  return out;
}

/* Bu konumdaki blok bir zindanın parçası mı (sandık ganimeti ve yuva türü için) */
export function zindanAt(u, x, y, z) {
  for (const zd of zindanlarAlan(u, x - 6, z - 6, x + 6, z + 6)) {
    if (Math.abs(x - zd.x) <= (zd.w >> 1) + 1 && Math.abs(z - zd.z) <= (zd.d >> 1) + 1 && y >= zd.y && y <= zd.y + 5) return zd;
  }
  return null;
}

export function zindanYaz(u, v, x0, z0) {
  for (const zd of zindanlarAlan(u, x0, z0, x0 + PB - 1, z0 + PB - 1)) {
    const hw = (zd.w >> 1) + 1, hd = (zd.d >> 1) + 1;
    for (let dz = -hd; dz <= hd; dz++) for (let dx = -hw; dx <= hw; dx++) {
      const x = zd.x + dx, z = zd.z + dz;
      if (x < x0 || x >= x0 + PB || z < z0 || z >= z0 + PB) continue;
      const kenar = Math.abs(dx) === hw || Math.abs(dz) === hd;
      for (let dy = 0; dy <= 5; dy++) {
        const y = zd.y + dy;
        if (y < 1 || y >= PY) continue;
        let id;
        if (dy === 0 || dy === 5 || kenar) id = karma3(u.tohum ^ 0x60, x, y, z) < 0.4 ? 60 : 15;
        else id = 0;
        /* Kapı açıklıkları: 0 kuzey, 1 doğu, 2 güney, 3 batı */
        if (kenar && dy >= 1 && dy <= 2) {
          if ((dz === -hd && dx === 0 && zd.kapilar.includes(0)) || (dx === hw && dz === 0 && zd.kapilar.includes(1)) ||
              (dz === hd && dx === 0 && zd.kapilar.includes(2)) || (dx === -hw && dz === 0 && zd.kapilar.includes(3))) id = 0;
        }
        v[dizin(x - x0, y, z - z0)] = id;
      }
    }
    const yaz = (x, y, z, id) => { if (x >= x0 && x < x0 + PB && z >= z0 && z < z0 + PB) v[dizin(x - x0, y, z - z0)] = id; };
    yaz(zd.x, zd.y + 1, zd.z, 58);
    for (const [x, y, z] of zd.sandiklar) yaz(x, y, z, 50);
  }
}
