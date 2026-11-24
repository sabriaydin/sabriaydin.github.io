/* HungerMan - elektrikli cihaz hazneleri (0.29.0)
   Jeneratör yalnızca yakıt, taret yalnızca ok, elektrikli ocak yalnızca pişirilebilen malzeme alır. Kurallar hem sandık ekranında hem sunucuda uygulanır.
   PISIRME: ocağın pişirebildiği girdiler (fırın ya da kamp ateşinde tek malzemeyle yapılan tarifler; kömür gerekmez). */
import { BLOKLAR, ESYALAR } from '../bloklar.js';
import { TARIFLER, GRUPLAR, istasyonlar } from './uretim.js';

/* Yakıt: eşya -> yanma süresi (sn) */
export const YAKIT = { 257: 40, 8: 15, 10: 15, 12: 15, 144: 15, 3005: 15, 14: 4, 38: 4, 39: 4, 256: 1 };
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
  /* 0.33.0: fırın ve kamp ateşi: yuvaya göre kural (girdi, yakıt, çıktı) */
  if (b.firinKap === 'firin') return { ad: 'Fırın', firin: 'firin', not: 'Girdi: pişirilecek ya da eritilecek malzeme · Yakıt: kömür, kütük, kalas, çubuk. Fırın, yanında beklenmeden çalışır.',
    izin: id => !!PISIRME[id] || !!YAKIT[id], yuva: (i, id) => (i === 0 ? !!PISIRME[id] : i === 1 ? !!YAKIT[id] : false) };
  if (b.firinKap === 'ates') return { ad: 'Kamp Ateşi', firin: 'ates', not: 'Çiğ yiyecekler yakıt gerekmeden pişer (8 sn). Kamp ateşi, yanında beklenmeden çalışır.',
    izin: atesteMi, yuva: (i, id) => i === 0 && atesteMi(id) };
  return null;
}
export const kapFiltresiId = id => kapFiltresi(BLOKLAR[id]);
/* 0.33.0: hazne boyu (fırın 3, kamp ateşi 2, diğerleri 27) ve hazne olan bloklar */
export const kapBoyu = b => (b && b.firinKap === 'firin' ? 3 : b && b.firinKap === 'ates' ? 2 : 27);
export const kapMi = b => !!(b && (b.sandik || b.firinKap));
const atesteMi = id => { const q = PISIRME[id]; if (!q) return false; const e = ESYALAR[q.cikti]; return !!(e && (e.yemek || e.tur === 'yiyecek')); };
