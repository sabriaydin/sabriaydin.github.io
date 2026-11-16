/* HungerMan - mezar taşı (0.22.0)
   Ölen oyuncunun eşyaları yere saçılmaz; ölüm yerindeki mezar taşında (27 yuvalık sandık) saklanır. 27'den fazla eşya varsa
   yanına ikinci bir mezar konur. Lavda ya da suda ölünürse mezar yüzeydeki ilk güvenli yere konur. Mezar boşalınca kaybolur. */
import { BLOKLAR, SIVI, LAV, KATI } from '../bloklar.js';
import { PY } from '../sabitler.js';

export const MEZAR = 593;
const YAN = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1], [2, 0], [-2, 0], [0, 2], [0, -2]];

/* Konulabilir hücre: boş, ya da üstüne konulabilen bitki/su (lav değil) */
function bos(d, x, y, z) {
  if (y < 1 || y >= PY - 1) return false;
  const b = d.blok(x, y, z);
  return b === 0 || (BLOKLAR[b] && BLOKLAR[b].degistirilebilir && !LAV[b]) || (SIVI[b] && !LAV[b]);
}
/* Ölüm yerinin yakınında, altı katı ve lavsız bir hücre arar */
function yerBul(d, x, y, z, haric) {
  if (!d.yuklu(x, z)) return null;
  y = Math.max(1, Math.min(PY - 2, y));
  for (let dy = 0; dy < 48; dy++) for (const [a, c] of YAN) {
    const yy = y + dy, xx = x + a, zz = z + c;
    if (!d.yuklu(xx, zz) || haric.has(xx + ',' + yy + ',' + zz)) continue;
    if (bos(d, xx, yy, zz) && (KATI[d.blok(xx, yy - 1, zz)] || SIVI[d.blok(xx, yy - 1, zz)]) && !LAV[d.blok(xx, yy - 1, zz)]) return [xx, yy, zz];
  }
  /* Bulunamazsa ölüm yerinin üstündeki ilk boş hücre */
  for (let yy = y; yy < PY - 1; yy++) if (bos(d, x, yy, z) && !haric.has(x + ',' + yy + ',' + z)) return [x, yy, z];
  return null;
}
/* esyalar: { id, adet, dayanim, buyu } listesi. Dönen: konulan mezarların konumları (konulamayanlar kalan listede döner) */
export function mezarKoy(d, x, y, z, esyalar) {
  const konum = [], kalan = esyalar.slice(), haric = new Set();
  while (kalan.length && konum.length < 3) {
    const yer = yerBul(d, Math.floor(x), Math.floor(y), Math.floor(z), haric);
    if (!yer) break;
    const [mx, my, mz] = yer, k = mx + ',' + my + ',' + mz;
    haric.add(k);
    const yuvalar = new Array(27).fill(null);
    for (let i = 0; i < 27 && kalan.length; i++) { const s = kalan.shift(); yuvalar[i] = { id: s.id, adet: s.adet, ...(s.dayanim != null ? { dayanim: s.dayanim } : {}), ...(s.buyu ? { buyu: s.buyu } : {}) }; }
    d.sandiklar.set(k, yuvalar);
    d.blokKoy(mx, my, mz, MEZAR);
    konum.push(yer);
  }
  return { konum, kalan };
}
/* Mezar boşaldıysa kaldırır; kaldırıldıysa true */
export function mezarBosalt(d, k) {
  const [x, y, z] = String(k).split(',').map(Number);
  if (!d.yuklu(x, z) || d.blok(x, y, z) !== MEZAR) return false;
  const l = d.sandiklar.get(k);
  if (l && l.some(Boolean)) return false;
  d.sandiklar.delete(k);
  d.blokKoy(x, y, z, 0);
  return true;
}
