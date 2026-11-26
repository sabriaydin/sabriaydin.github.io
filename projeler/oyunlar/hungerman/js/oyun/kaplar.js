/* HungerMan - elektrikli cihaz hazneleri (0.29.0)
   Jeneratör yalnızca yakıt, taret yalnızca ok, elektrikli ocak yalnızca pişirilebilen malzeme alır. Kurallar hem sandık ekranında hem sunucuda uygulanır.
   PISIRME: ocağın pişirebildiği girdiler (fırın ya da kamp ateşinde tek malzemeyle yapılan tarifler; kömür gerekmez). */
import { BLOKLAR, ESYALAR, ESYA53 } from '../bloklar.js';
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
  /* 0.53.0: buhar jeneratörü yakıt alır; dönüştürücü makinelerde üst sıra (9 yuva) girdi, alt iki sıra çıktı yuvasıdır; matkabın haznesine eşya konmaz */
  if (b.cihaz === 'buhar') return { ad: 'Buhar Jeneratörü: Yakıt Deposu', not: 'Yalnızca yakıt konabilir: kömür, kütük, kalas, çubuk. Kazanın yanında su olmalıdır.', izin: id => !!YAKIT[id] };
  if (b.cihaz && DONUSUM[b.cihaz]) { const D = DONUSUM[b.cihaz]; return { ad: D.ad, not: D.not, izin: id => !!D.tablo[id], yuva: (i, id) => i < GIRDI_YUVA && !!D.tablo[id] }; }
  if (b.cihaz === 'matkap') return { ad: 'Maden Matkabı Haznesi', not: 'Kazılan bloklar ve cevherler burada toplanır; hazne dolunca matkap durur.', izin: () => false, yuva: () => false };
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

/* ---------- 0.53.0: dönüştürücü makineler ----------
   tablo: girdi -> { n: harcanan, cikti, adet }; sure: bir parti (sn); paralel: aynı anda işlenen parti sayısı. Girdiler yalnızca ilk 9 yuvadan alınır, çıktılar sonraki 18 yuvaya konur. */
export const GIRDI_YUVA = 9;
const KERESTE = {}, KIRICI = {}, CAMASIR = {}, ARK = {};
for (const t of TARIFLER) {
  if (t.girdi.length !== 1 || !GRUPLAR.kalas.idler.includes(t.cikti) || t.istasyon) continue;
  const [g, n] = t.girdi[0];
  if (n === 1 && GRUPLAR.kutuk.idler.includes(g)) KERESTE[g] = { n: 1, cikti: t.cikti, adet: Math.round(t.adet * 1.5) };
}
for (const id of GRUPLAR.kalas.idler) KERESTE[id] = { n: 1, cikti: 256, adet: 3 };
Object.assign(KIRICI, { 260: { n: 1, cikti: ESYA53.demirTozu, adet: 2 }, 258: { n: 1, cikti: ESYA53.bakirTozu, adet: 2 }, 262: { n: 1, cikti: ESYA53.altinTozu, adet: 2 },
  2: { n: 1, cikti: 15, adet: 1 }, 15: { n: 1, cikti: 6, adet: 1 }, 6: { n: 1, cikti: 5, adet: 1 }, 295: { n: 1, cikti: 296, adet: 4 } });
for (let i = 0; i < 7; i++) { CAMASIR[114 + i] = { n: 1, cikti: 49, adet: 1 }; CAMASIR[209 + i] = { n: 1, cikti: 208, adet: 1 }; }   // renkli yün ve halı -> beyaz
for (const [id, q] of Object.entries(PISIRME)) { const e = ESYALAR[q.cikti]; if (e && !(e.yemek || e.tur === 'yiyecek')) ARK[id] = q; }   // eritme (yiyecekler değil)
export const DONUSUM = {
  camasir: { ad: 'Çamaşır Makinesi', tablo: CAMASIR, sure: 4, paralel: 1, not: 'Üst sıraya renkli yün ya da halı konur; beyaz hâlleri alt sıralarda toplanır.' },
  ark: { ad: 'Ark Ergitme Ocağı', tablo: ARK, sure: 1.5, paralel: 2, not: 'Üst sıraya cevher, toz ya da fırın malzemesi konur; eriyenler alt sıralarda toplanır. Yakıt gerekmez.' },
  kereste: { ad: 'Elektrikli Kereste Tezgâhı', tablo: KERESTE, sure: 2, paralel: 1, not: 'Üst sıraya kütük ya da kalas konur: kütükten 6 kalas, kalastan 3 çubuk çıkar.' },
  kirici: { ad: 'Taş Kırıcı', tablo: KIRICI, sure: 3, paralel: 1, not: 'Üst sıraya ham cevher, taş, parke taş, çakıl ya da kemik konur; ürünler alt sıralarda toplanır.' }
};
