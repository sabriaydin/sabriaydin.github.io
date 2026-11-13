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
      /* Derin zindanların bir kısmı Taş Muhafızın beklediği geniş, sütunlu ve aydınlatılmış bir salondur (0.15.1) */
      if (y < 30 && karma3(u.tohum ^ 0x6d75, x, y, zz) < 0.45) {
        z.boss = true; z.w = 17; z.d = 17;
        z.sandiklar = [[x - 7, y + 1, zz - 7], [x + 7, y + 1, zz - 7], [x - 7, y + 1, zz + 7], [x + 7, y + 1, zz + 7]];
        z.kapilar = [0, 1, 2, 3];
      }
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
      if (z && z.x + 10 >= x0 && z.x - 10 <= x1 && z.z + 10 >= z0 && z.z - 10 <= z1) out.push(z);
    }
  return out;
}

/* Bu konumdaki blok bir zindanın parçası mı (sandık ganimeti ve yuva türü için) */
export function zindanAt(u, x, y, z) {
  for (const zd of zindanlarAlan(u, x - 10, z - 10, x + 10, z + 10)) {
    if (Math.abs(x - zd.x) <= (zd.w >> 1) + 1 && Math.abs(z - zd.z) <= (zd.d >> 1) + 1 && y >= zd.y && y <= zd.y + (zd.boss ? 8 : 5)) return zd;
  }
  return null;
}

export function zindanYaz(u, v, x0, z0) {
  for (const zd of zindanlarAlan(u, x0, z0, x0 + PB - 1, z0 + PB - 1)) {
    if (zd.boss) { bossSalonuYaz(u, v, x0, z0, zd); continue; }
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

/* Taş Muhafız salonu: 17 x 17, 7 blok yüksekliğinde; yosunlu taş duvarlar, taş tuğla sütunlar, asılı fenerler ve duvar kristalleri,
   köşelerde sandıklar ve örümcek ağları; ortada boşluk (savaş alanı). Dört yönde koridor ağzı vardır. */
function bossSalonuYaz(u, v, x0, z0, zd) {
  const H = 9, Y = 8;
  const yaz = (x, y, z, id) => { if (x >= x0 && x < x0 + PB && z >= z0 && z < z0 + PB && y > 0 && y < PY) v[dizin(x - x0, y, z - z0)] = id; };
  const tas = (x, y, z) => (karma3(u.tohum ^ 0x60, x, y, z) < 0.45 ? 60 : 15);
  for (let dz = -H; dz <= H; dz++) for (let dx = -H; dx <= H; dx++) {
    const x = zd.x + dx, z = zd.z + dz, kenar = Math.abs(dx) === H || Math.abs(dz) === H;
    for (let dy = 0; dy <= Y; dy++) {
      const y = zd.y + dy;
      let id = 0;
      if (dy === 0) id = (Math.abs(dx) + Math.abs(dz)) % 4 === 0 ? 35 : tas(x, y, z);
      else if (dy === Y || kenar) id = dy === 4 && kenar && (dx + dz) % 4 === 0 ? 61 : tas(x, y, z);
      /* Kapı ağızları (3 geniş, 3 yüksek) */
      if (kenar && dy >= 1 && dy <= 3 && ((Math.abs(dx) <= 1 && Math.abs(dz) === H) || (Math.abs(dz) <= 1 && Math.abs(dx) === H))) id = 0;
      yaz(x, y, z, id);
    }
  }
  /* Sütunlar: taş tuğla, ortasında kristal halka */
  for (const [a, c] of [[-5, -5], [5, -5], [-5, 5], [5, 5]]) for (let dy = 1; dy < Y; dy++) for (const [ex, ez] of [[0, 0], [1, 0], [0, 1], [1, 1]]) yaz(zd.x + a + ex - (a > 0 ? 1 : 0), zd.y + dy, zd.z + c + ez - (c > 0 ? 1 : 0), dy === 3 ? 37 : 35);
  /* Asılı fenerler ve köşe ağları */
  for (const [a, c] of [[-5, 0], [5, 0], [0, -5], [0, 5], [-7, -7], [7, -7], [-7, 7], [7, 7], [0, 0]]) yaz(zd.x + a, zd.y + Y - 1, zd.z + c, 159);
  /* Zemin fenerleri: duvar dibinde, savaş alanını aydınlatır */
  for (const [a, c] of [[-8, -4], [-8, 4], [8, -4], [8, 4], [-4, -8], [4, -8], [-4, 8], [4, 8]]) yaz(zd.x + a, zd.y + 1, zd.z + c, 159);
  for (const [a, c] of [[-8, -8], [8, -8], [-8, 8], [8, 8], [-8, -6], [6, 8]]) { yaz(zd.x + a, zd.y + Y - 1, zd.z + c, 148); yaz(zd.x + a, zd.y + Y - 2, zd.z + c, 148); }
  for (const [x, y, z] of zd.sandiklar) yaz(x, y, z, 50);
}
