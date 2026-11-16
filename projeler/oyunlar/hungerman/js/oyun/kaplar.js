/* HungerMan - elektrikli cihaz hazneleri (0.29.0)
   Jeneratör yalnızca yakıt, taret yalnızca ok, elektrikli ocak yalnızca pişirilebilen malzeme alır. Kurallar hem sandık ekranında hem sunucuda uygulanır.
   PISIRME: ocağın pişirebildiği girdiler (fırın ya da kamp ateşinde tek malzemeyle yapılan tarifler; kömür gerekmez). */
import { BLOKLAR, ESYALAR } from '../bloklar.js';
import { TARIFLER, GRUPLAR, istasyonlar } from './uretim.js';

/* Yakıt: eşya -> yanma süresi (sn) */
export const YAKIT = { 257: 40, 8: 15, 10: 15, 12: 15, 144: 15, 14: 4, 38: 4, 39: 4, 256: 1 };
export const OK_ESYALARI = new Set([287]);
/* Girdi eşyası -> { n: harcanan, cikti, adet } */
export const PISIRME = {};
for (const t of TARIFLER) {
  if (!istasyonlar(t).some(k => k === 'firin' || k === 'ates')) continue;
  const g = t.girdi.filter(([id]) => id !== 257);
  if (g.length !== 1) continue;
  const [id, n] = g[0];
  for (const i of GRUPLAR[id] ? GRUPLAR[id].idler : [id]) if (ESYALAR[i] && !PISIRME[i]) PISIRME[i] = { n, cikti: t.cikti, adet: t.adet };
}
export const PISIRME_SURE = 5;   // bir parti için saniye

/* Bloğun haznesi için kural: { ad, not, izin(id) } ya da null (sınırsız sandık) */
export function kapFiltresi(b) {
  if (!b) return null;
  if (b.elektrik === 'jenerator') return { ad: 'Yakıt Deposu', not: 'Yalnızca yakıt konabilir: kömür, kütük, kalas, çubuk.', izin: id => !!YAKIT[id] };
  if (b.elektrik === 'ocak') return { ad: 'Elektrikli Ocak', not: 'Pişirilecek malzemeleri koyunuz; ocak çalışırken sırayla pişirir (parti başına 5 sn).', izin: id => !!PISIRME[id] };
  if (b.cihaz === 'taret') return { ad: 'Taret Ok Haznesi', not: 'Yalnızca ok konabilir; her atış 1 ok harcar.', izin: id => OK_ESYALARI.has(id) };
  return null;
}
export const kapFiltresiId = id => kapFiltresi(BLOKLAR[id]);
