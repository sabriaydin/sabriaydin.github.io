/* HungerMan - ağaç kurucu: hem dünya üretiminde hem fidan büyümesinde kullanılır */
import { karma3 } from '../rastgele.js';
import { MEYVE_YAPRAK } from '../bloklar.js';

/* Ağaç kurucu: hem dünya üretiminde hem fidan büyümesinde kullanılır.
   kisim: 'yaprak' | 'govde' | 'hepsi' */
export function agacKur(set, x, y, z, tur, r, kisim = 'hepsi') {
  const yap = kisim !== 'govde', gov = kisim !== 'yaprak';
  let kutuk = 8, yaprak = 9, boy;
  if (tur === 'hus') { kutuk = 12; yaprak = 13; boy = 5 + Math.floor(r() * 3); }
  else if (tur === 'ladin') { kutuk = 10; yaprak = 11; boy = 6 + Math.floor(r() * 4); }
  else if (tur === 'akasya') { kutuk = 144; yaprak = 145; boy = 4 + Math.floor(r() * 2); }
  else boy = 4 + Math.floor(r() * 3);
  /* 0.34.0: meyve ağaçları (elma, kiraz, portakal, zeytin): meşe gövdeli, küçük taçlı; yaprakların bir kısmı meyveli */
  const M = MEYVE_YAPRAK[tur];
  if (M) {
    boy = 3 + Math.floor(r() * 2);
    const ust = y + boy;
    if (yap) for (let yy = ust - 2; yy <= ust + 1; yy++) {
      const ry = yy >= ust ? 1 : 2;
      for (let dz = -ry; dz <= ry; dz++) for (let dx = -ry; dx <= ry; dx++) {
        const kose = Math.abs(dx) === ry && Math.abs(dz) === ry;
        if (kose && (yy >= ust || karma3(78, x + dx, yy, z + dz) < 0.6)) continue;
        set(x + dx, yy, z + dz, karma3(79, x + dx, yy, z + dz) < 0.3 ? M.dolu : M.bos, true);
      }
    }
    if (gov) for (let k = 0; k < boy; k++) set(x, y + k, z, 8, false);
    return;
  }
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
