/* HungerMan - blok, eşya ve alet tanımları (ana iş parçacığı ve işçiler ortak kullanır) */

/* ---------- Doku atlası döşeme dizinleri (16 x 16 döşeme) ---------- */
export const DOKULAR = [
  'cimen_ust', 'cimen_yan', 'toprak', 'tas', 'anakaya', 'kum', 'cakil', 'su',
  'mese_yan', 'mese_ust', 'mese_yaprak', 'ladin_yan', 'ladin_ust', 'ladin_yaprak', 'hus_yan', 'hus_ust',
  'hus_yaprak', 'kalas', 'parke', 'komur_cev', 'demir_cev', 'bakir_cev', 'altin_cev', 'elmas_cev',
  'kar', 'kar_yan', 'buz', 'kil', 'kumtasi_yan', 'kumtasi_ust', 'uzun_ot', 'gelincik',
  'karahindiba', 'cali_dolu', 'cali_bos', 'kuru_cali', 'yosun', 'masa_ust', 'masa_yan', 'masa_on',
  'firin_on', 'firin_yan', 'firin_ust', 'cam', 'tas_tugla', 'mantar', 'fidan_mese', 'fidan_ladin',
  'fidan_hus', 'kesme_tas', 'kalas_koyu', 'kalas_acik', 'egrelti', 'mavi_cicek', 'mesale',
  'yatak_ust', 'yatak_yan', 'kamp_atesi', 'yun',
  'sandik_ust', 'sandik_yan', 'sandik_on', 'kiremit', 'saman_ust', 'saman_yan', 'bugday0', 'bugday1',
  'bugday2', 'bugday3', 'yol_ust', 'yol_yan', 'yuva', 'lav', 'yosunlu_parke', 'kristal',
  'mercan_k', 'mercan_m', 'mercan_s', 'mercan_dal_k', 'mercan_dal_m', 'mercan_dal_s', 'deniz_cayiri', 'istiridye'
];
export const T = Object.fromEntries(DOKULAR.map((n, i) => [n, i]));

/* Çizim türleri */
export const C_YOK = 0, C_KUP = 1, C_CAPRAZ = 2, C_SIVI = 3, C_LAV = 4;

/* ---------- Bloklar ---------- */
/* dok: tek ad veya [üst, yan, alt] ya da {ust, yan, alt, on} */
const B = [];
function blok(id, o) { B[id] = Object.assign({ id, cizim: C_KUP, kati: true, opak: true, kesik: false, ayniGizle: false, sivi: false, sertlik: 1, alet: null, seviye: 0, ses: 'tas', isik: 0 }, o); }

blok(0, { ad: 'Hava', cizim: C_YOK, kati: false, opak: false, sertlik: 0 });
blok(1, { ad: 'Ana Kaya', dok: 'anakaya', sertlik: -1 });
blok(2, { ad: 'Taş', dok: 'tas', sertlik: 1.5, alet: 'kazma', seviye: 1, dusur: () => [[15, 1]] });
blok(3, { ad: 'Toprak', dok: 'toprak', sertlik: 0.5, alet: 'kurek', ses: 'toprak' });
blok(4, { ad: 'Çimenli Toprak', dok: ['cimen_ust', 'cimen_yan', 'toprak'], sertlik: 0.6, alet: 'kurek', ses: 'cimen', dusur: () => [[3, 1]] });
blok(5, { ad: 'Kum', dok: 'kum', sertlik: 0.5, alet: 'kurek', ses: 'kum' });
blok(6, { ad: 'Çakıl', dok: 'cakil', sertlik: 0.6, alet: 'kurek', ses: 'kum', dusur: r => (r() < 0.12 ? [[285, 1]] : [[6, 1]]) });
blok(7, { ad: 'Su', dok: 'su', cizim: C_SIVI, kati: false, opak: false, ayniGizle: true, sivi: true, sertlik: -1, ses: 'su' });
blok(8, { ad: 'Meşe Kütüğü', dok: ['mese_ust', 'mese_yan', 'mese_ust'], sertlik: 2, alet: 'balta', ses: 'odun' });
blok(9, { ad: 'Meşe Yaprağı', dok: 'mese_yaprak', opak: false, kesik: true, sertlik: 0.2, alet: 'makas', ses: 'bitki',
  dusur: r => { const o = []; if (r() < 1 / 16) o.push([40, 1]); if (r() < 1 / 22) o.push([266, 1]); if (r() < 1 / 30) o.push([256, 1]); return o; } });
blok(10, { ad: 'Ladin Kütüğü', dok: ['ladin_ust', 'ladin_yan', 'ladin_ust'], sertlik: 2, alet: 'balta', ses: 'odun' });
blok(11, { ad: 'Ladin Yaprağı', dok: 'ladin_yaprak', opak: false, kesik: true, sertlik: 0.2, alet: 'makas', ses: 'bitki',
  dusur: r => { const o = []; if (r() < 1 / 16) o.push([41, 1]); if (r() < 1 / 30) o.push([256, 1]); return o; } });
blok(12, { ad: 'Huş Kütüğü', dok: ['hus_ust', 'hus_yan', 'hus_ust'], sertlik: 2, alet: 'balta', ses: 'odun' });
blok(13, { ad: 'Huş Yaprağı', dok: 'hus_yaprak', opak: false, kesik: true, sertlik: 0.2, alet: 'makas', ses: 'bitki',
  dusur: r => { const o = []; if (r() < 1 / 16) o.push([42, 1]); if (r() < 1 / 30) o.push([256, 1]); return o; } });
blok(14, { ad: 'Meşe Kalası', dok: 'kalas', sertlik: 2, alet: 'balta', ses: 'odun' });
blok(15, { ad: 'Parke Taş', dok: 'parke', sertlik: 2, alet: 'kazma', seviye: 1 });
blok(16, { ad: 'Kömür Cevheri', dok: 'komur_cev', sertlik: 3, alet: 'kazma', seviye: 1, dusur: r => [[257, 1 + (r() < 0.25 ? 1 : 0)]] });
blok(17, { ad: 'Demir Cevheri', dok: 'demir_cev', sertlik: 3, alet: 'kazma', seviye: 3, dusur: () => [[260, 1]] });
blok(18, { ad: 'Bakır Cevheri', dok: 'bakir_cev', sertlik: 3, alet: 'kazma', seviye: 2, dusur: r => [[258, 1 + Math.floor(r() * 2)]] });
blok(19, { ad: 'Altın Cevheri', dok: 'altin_cev', sertlik: 3, alet: 'kazma', seviye: 4, dusur: () => [[262, 1]] });
blok(20, { ad: 'Elmas Cevheri', dok: 'elmas_cev', sertlik: 3.5, alet: 'kazma', seviye: 4, dusur: () => [[264, 1]] });
blok(21, { ad: 'Kar', dok: 'kar', sertlik: 0.3, alet: 'kurek', ses: 'kar' });
blok(22, { ad: 'Buz', dok: 'buz', opak: false, kesik: true, ayniGizle: true, sertlik: 0.5, alet: 'kazma', ses: 'cam', dusur: () => [] });
blok(23, { ad: 'Kil', dok: 'kil', sertlik: 0.6, alet: 'kurek', ses: 'toprak' });
blok(24, { ad: 'Kum Taşı', dok: ['kumtasi_ust', 'kumtasi_yan', 'kumtasi_ust'], sertlik: 0.8, alet: 'kazma', seviye: 1 });
blok(25, { ad: 'Uzun Ot', dok: 'uzun_ot', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, degistirilebilir: true,
  dusur: r => { const s = r(); return s < 0.3 ? [[267, 1]] : s < 0.42 ? [[292, 1]] : []; } });
blok(26, { ad: 'Gelincik', dok: 'gelincik', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true });
blok(27, { ad: 'Karahindiba', dok: 'karahindiba', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true });
blok(28, { ad: 'Böğürtlen Çalısı', dok: 'cali_dolu', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0.1, ses: 'bitki', bitki: true,
  dusur: r => [[29, 1], [265, 1 + Math.floor(r() * 2)]] });
blok(29, { ad: 'Böğürtlen Çalısı', dok: 'cali_bos', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0.1, ses: 'bitki', bitki: true });
blok(30, { ad: 'Kuru Çalı', dok: 'kuru_cali', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, degistirilebilir: true,
  dusur: r => (r() < 0.5 ? [[256, 1]] : []) });
blok(31, { ad: 'Deniz Yosunu', dok: 'yosun', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, suIcinde: true, sivi: true, dusur: () => [] });
blok(32, { ad: 'Üretim Masası', dok: { ust: 'masa_ust', yan: 'masa_yan', on: 'masa_on', alt: 'kalas' }, sertlik: 2.5, alet: 'balta', ses: 'odun', istasyon: 'masa' });
blok(33, { ad: 'Fırın', dok: { ust: 'firin_ust', yan: 'firin_yan', on: 'firin_on', alt: 'firin_ust' }, sertlik: 3.5, alet: 'kazma', seviye: 1, istasyon: 'firin' });
blok(34, { ad: 'Cam', dok: 'cam', opak: false, kesik: true, ayniGizle: true, sertlik: 0.3, ses: 'cam', dusur: () => [] });
blok(35, { ad: 'Taş Tuğla', dok: 'tas_tugla', sertlik: 1.5, alet: 'kazma', seviye: 1 });
blok(36, { ad: 'Mantar', dok: 'mantar', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true });
blok(37, { ad: 'Kesme Taş', dok: 'kesme_tas', sertlik: 2, alet: 'kazma', seviye: 1 });
blok(38, { ad: 'Ladin Kalası', dok: 'kalas_koyu', sertlik: 2, alet: 'balta', ses: 'odun' });
blok(39, { ad: 'Huş Kalası', dok: 'kalas_acik', sertlik: 2, alet: 'balta', ses: 'odun' });
blok(40, { ad: 'Meşe Fidanı', dok: 'fidan_mese', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, fidan: 'mese' });
blok(41, { ad: 'Ladin Fidanı', dok: 'fidan_ladin', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, fidan: 'ladin' });
blok(42, { ad: 'Huş Fidanı', dok: 'fidan_hus', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, fidan: 'hus' });
blok(43, { ad: 'Eğrelti Otu', dok: 'egrelti', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, degistirilebilir: true,
  dusur: r => (r() < 1 / 3 ? [[267, 1]] : []) });
blok(44, { ad: 'Peygamber Çiçeği', dok: 'mavi_cicek', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true });
blok(45, { ad: 'Karlı Çimen', dok: ['kar', 'kar_yan', 'toprak'], sertlik: 0.6, alet: 'kurek', ses: 'kar', dusur: () => [[3, 1]] });

blok(46, { ad: 'Meşale', dok: 'mesale', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'odun', bitki: false, isik: 14, mesale: true });
blok(47, { ad: 'Yatak', dok: { ust: 'yatak_ust', yan: 'yatak_yan', on: 'yatak_yan', alt: 'kalas' }, sertlik: 0.4, alet: 'balta', ses: 'yun', yatak: true });
blok(48, { ad: 'Kamp Ateşi', dok: 'kamp_atesi', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 1, alet: 'balta', ses: 'odun', isik: 15, mesale: true, istasyon: 'ates' });
blok(49, { ad: 'Yün', dok: 'yun', sertlik: 0.8, ses: 'yun' });
blok(50, { ad: 'Sandık', dok: { ust: 'sandik_ust', yan: 'sandik_yan', on: 'sandik_on', alt: 'sandik_ust' }, sertlik: 2.5, alet: 'balta', ses: 'odun', sandik: true });
blok(51, { ad: 'Kiremit', dok: 'kiremit', sertlik: 1.5, alet: 'kazma', seviye: 1 });
blok(52, { ad: 'Saman Balyası', dok: ['saman_ust', 'saman_yan', 'saman_ust'], sertlik: 0.5, ses: 'bitki' });
for (let e = 0; e < 4; e++) blok(53 + e, { ad: e === 3 ? 'Olgun Buğday' : 'Buğday Fidesi', dok: 'bugday' + e, cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, ekin: e,
  dusur: r => (e === 3 ? [[291, 1], [292, 1 + Math.floor(r() * 3)]] : [[292, 1]]) });
blok(57, { ad: 'Toprak Yol', dok: ['yol_ust', 'yol_yan', 'toprak'], sertlik: 0.6, alet: 'kurek', ses: 'toprak', dusur: () => [[3, 1]] });
/* Mağaralar (4. aşama) */
blok(58, { ad: 'Canavar Yuvası', dok: 'yuva', opak: false, kesik: true, sertlik: 5, alet: 'kazma', seviye: 1, dusur: r => [[288, 2 + Math.floor(r() * 4)]], yuva: true });
blok(59, { ad: 'Lav', dok: 'lav', cizim: C_LAV, kati: false, opak: false, sivi: true, lav: true, sertlik: -1, ses: 'su', isik: 15 });
blok(60, { ad: 'Yosunlu Parke Taş', dok: 'yosunlu_parke', sertlik: 2, alet: 'kazma', seviye: 1 });
/* Su altı (5. aşama): mercanlar ve deniz bitkileri su içinde durur */
blok(62, { ad: 'Kırmızı Mercan Blok', dok: 'mercan_k', sertlik: 1, alet: 'kazma', ses: 'tas' });
blok(63, { ad: 'Mor Mercan Blok', dok: 'mercan_m', sertlik: 1, alet: 'kazma', ses: 'tas' });
blok(64, { ad: 'Sarı Mercan Blok', dok: 'mercan_s', sertlik: 1, alet: 'kazma', ses: 'tas' });
blok(65, { ad: 'Kırmızı Mercan', dok: 'mercan_dal_k', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, suIcinde: true, sivi: true });
blok(66, { ad: 'Mor Mercan', dok: 'mercan_dal_m', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, suIcinde: true, sivi: true });
blok(67, { ad: 'Sarı Mercan', dok: 'mercan_dal_s', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, suIcinde: true, sivi: true });
blok(68, { ad: 'Deniz Çayırı', dok: 'deniz_cayiri', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, suIcinde: true, sivi: true, dusur: () => [] });
blok(69, { ad: 'İstiridye', dok: 'istiridye', sertlik: 0.8, ses: 'tas', dusur: r => (r() < 0.4 ? [[299, 1]] : []) });
blok(61, { ad: 'Parıltı Kristali', dok: 'kristal', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 1, alet: 'kazma', seviye: 1, ses: 'cam', isik: 12, mesale: true });

export const BLOKLAR = B;
export const BLOK_SAYISI = B.length;

/* Hızlı erişim tabloları */
export const KATI = new Uint8Array(256), OPAK = new Uint8Array(256), CIZIM = new Uint8Array(256), KESIK = new Uint8Array(256);
export const AYNI_GIZLE = new Uint8Array(256), SIVI = new Uint8Array(256), BITKI = new Uint8Array(256), LAV = new Uint8Array(256);
/* Yüz dokuları: +x, -x, +y, -y, +z, -z */
export const YUZ_DOKU = new Uint8Array(256 * 6);
for (const b of B) {
  if (!b) continue;
  KATI[b.id] = b.kati ? 1 : 0; OPAK[b.id] = b.opak ? 1 : 0; CIZIM[b.id] = b.cizim; KESIK[b.id] = b.kesik ? 1 : 0;
  AYNI_GIZLE[b.id] = b.ayniGizle ? 1 : 0; SIVI[b.id] = b.sivi ? 1 : 0; BITKI[b.id] = b.bitki ? 1 : 0; LAV[b.id] = b.lav ? 1 : 0;
  let u, y, a, o;
  if (!b.dok) { u = y = a = o = 0; }
  else if (typeof b.dok === 'string') u = y = a = o = T[b.dok];
  else if (Array.isArray(b.dok)) { u = T[b.dok[0]]; y = T[b.dok[1]]; a = T[b.dok[2]]; o = y; }
  else { u = T[b.dok.ust]; y = T[b.dok.yan]; a = T[b.dok.alt]; o = T[b.dok.on]; }
  YUZ_DOKU.set([y, y, u, a, o, y], b.id * 6);
}

/* ---------- Eşyalar ---------- */
export const MALZEMELER = [
  { ad: 'Tahta', seviye: 1, hiz: 2, dayanim: 60, renk: '#a8783f' },
  { ad: 'Taş', seviye: 2, hiz: 4, dayanim: 132, renk: '#8d8d8d' },
  { ad: 'Bakır', seviye: 3, hiz: 5, dayanim: 200, renk: '#d0773d' },
  { ad: 'Demir', seviye: 4, hiz: 6, dayanim: 250, renk: '#dcdcdc' },
  { ad: 'Elmas', seviye: 5, hiz: 8, dayanim: 1561, renk: '#52e3d6' }
];
export const ALET_TURLERI = [
  { tur: 'kazma', ad: 'Kazma', hasar: 2 },
  { tur: 'balta', ad: 'Balta', hasar: 3 },
  { tur: 'kurek', ad: 'Kürek', hasar: 1.5 },
  { tur: 'kilic', ad: 'Kılıç', hasar: 4 }
];

const E = {};
function esya(id, o) { E[id] = Object.assign({ id, yigin: 64, tur: 'malzeme' }, o); }
for (const b of B) if (b && b.id > 0) esya(b.id, { ad: b.ad, tur: 'blok', blok: b.id });

esya(256, { ad: 'Çubuk', simge: 'cubuk' });
esya(257, { ad: 'Kömür', simge: 'komur', yakit: true });
esya(258, { ad: 'Ham Bakır', simge: 'ham', renk: '#d07a3e' });
esya(259, { ad: 'Bakır Külçe', simge: 'kulce', renk: '#d27b40' });
esya(260, { ad: 'Ham Demir', simge: 'ham', renk: '#cfa58a' });
esya(261, { ad: 'Demir Külçe', simge: 'kulce', renk: '#e0e0e0' });
esya(262, { ad: 'Ham Altın', simge: 'ham', renk: '#f2c43c' });
esya(263, { ad: 'Altın Külçe', simge: 'kulce', renk: '#f7d34a' });
esya(264, { ad: 'Elmas', simge: 'elmas' });
esya(265, { ad: 'Böğürtlen', simge: 'bogurtlen', tur: 'yiyecek', yemek: 2 });
esya(266, { ad: 'Elma', simge: 'elma', tur: 'yiyecek', yemek: 4 });
esya(267, { ad: 'Lif', simge: 'lif' });
esya(268, { ad: 'Bandaj', simge: 'bandaj', tur: 'iyilestir', iyilestir: 6, yigin: 16 });
esya(269, { ad: 'Mantar Çorbası', simge: 'corba', tur: 'yiyecek', yemek: 7, yigin: 1 });
esya(270, { ad: 'Kâse', simge: 'kase', yigin: 16 });
/* Hayvan ürünleri ve savaş */
esya(271, { ad: 'Çiğ Sığır Eti', simge: 'et', renk: '#c9443d', tur: 'yiyecek', yemek: 3 });
esya(272, { ad: 'Biftek', simge: 'et', renk: '#8a4a22', pismis: true, tur: 'yiyecek', yemek: 8 });
esya(273, { ad: 'Çiğ Domuz Eti', simge: 'et', renk: '#e88a8a', tur: 'yiyecek', yemek: 3 });
esya(274, { ad: 'Pişmiş Domuz Eti', simge: 'et', renk: '#b8743d', pismis: true, tur: 'yiyecek', yemek: 8 });
esya(275, { ad: 'Çiğ Tavuk', simge: 'but', renk: '#f0c4b0', tur: 'yiyecek', yemek: 2 });
esya(276, { ad: 'Pişmiş Tavuk', simge: 'but', renk: '#c98a48', pismis: true, tur: 'yiyecek', yemek: 6 });
esya(277, { ad: 'Çiğ Koyun Eti', simge: 'et', renk: '#d6555a', tur: 'yiyecek', yemek: 2 });
esya(278, { ad: 'Pişmiş Koyun Eti', simge: 'et', renk: '#9a5a30', pismis: true, tur: 'yiyecek', yemek: 6 });
esya(279, { ad: 'Çiğ Tavşan Eti', simge: 'but', renk: '#e8a090', tur: 'yiyecek', yemek: 3 });
esya(280, { ad: 'Pişmiş Tavşan Eti', simge: 'but', renk: '#b07440', pismis: true, tur: 'yiyecek', yemek: 5 });
esya(281, { ad: 'Çürük Et', simge: 'et', renk: '#7d8a3a', tur: 'yiyecek', yemek: 4, zehir: 0.8 });
esya(282, { ad: 'Deri', simge: 'deri' });
esya(283, { ad: 'Tüy', simge: 'tuy' });
esya(284, { ad: 'İp', simge: 'ip' });
esya(285, { ad: 'Çakmaktaşı', simge: 'cakmak' });
esya(286, { ad: 'Yay', simge: 'yay', tur: 'yay', yigin: 1, alet: { tur: 'yay', seviye: 0, hiz: 1, dayanim: 384, hasar: 1 } });
esya(287, { ad: 'Ok', simge: 'ok' });
/* Köyler ve tarım */
esya(288, { ad: 'Sikke', simge: 'sikke' });
esya(289, { ad: 'Şifa İksiri', simge: 'iksir', tur: 'iyilestir', iyilestir: 10, yigin: 16 });
esya(290, { ad: 'Altın Elma', simge: 'altin_elma', tur: 'yiyecek', yemek: 4, iyilestirme: 8, yigin: 16 });
esya(291, { ad: 'Buğday', simge: 'bugday' });
esya(292, { ad: 'Buğday Tohumu', simge: 'tohum', ekin: 53 });
esya(293, { ad: 'Ekmek', simge: 'ekmek', tur: 'yiyecek', yemek: 5 });
esya(294, { ad: 'Mektup', simge: 'mektup', yigin: 16 });
esya(295, { ad: 'Kemik', simge: 'kemik' });
esya(296, { ad: 'Kemik Tozu', simge: 'kemik_tozu', gubre: true });
/* Deniz (5. aşama) */
esya(297, { ad: 'Çiğ Balık', simge: 'balik', renk: '#8fb2c8', tur: 'yiyecek', yemek: 2 });
esya(298, { ad: 'Pişmiş Balık', simge: 'balik', renk: '#c98a48', pismis: true, tur: 'yiyecek', yemek: 6 });
esya(299, { ad: 'İnci', simge: 'inci' });
esya(450, { ad: 'Köpekbalığı Dişi', simge: 'dis' });
esya(451, { ad: 'Çiğ Ahtapot', simge: 'ahtapot', renk: '#b8506a', tur: 'yiyecek', yemek: 2 });
esya(452, { ad: 'Pişmiş Ahtapot', simge: 'ahtapot', renk: '#a0603a', pismis: true, tur: 'yiyecek', yemek: 6 });
esya(453, { ad: 'Olta', simge: 'olta', tur: 'olta', yigin: 1, alet: { tur: 'olta', seviye: 0, hiz: 1, dayanim: 64, hasar: 1 } });
esya(454, { ad: 'Sandal', simge: 'sandal', tur: 'tekne', tekne: 'sandal', yigin: 1 });
esya(455, { ad: 'Yelkenli', simge: 'yelkenli', tur: 'tekne', tekne: 'yelkenli', yigin: 1 });
esya(456, { ad: 'Dalış Maskesi', tur: 'zirh', yigin: 1, simge: 'maske', zirh: { parca: 0, puan: 1, dayanim: 120 }, alet: null, ozellik: 'Su altında oksijen üç kat yavaş azalır' });
esya(457, { ad: 'Palet', tur: 'zirh', yigin: 1, simge: 'palet', zirh: { parca: 3, puan: 1, dayanim: 120 }, alet: null, ozellik: 'Yüzme hızı artar' });

/* Zırhlar: 400 + malzeme * 4 + parça (0 kask, 1 göğüslük, 2 pantolon, 3 bot) */
export const ZIRH_PARCALARI = ['Kask', 'Göğüslük', 'Pantolon', 'Bot'];
export const ZIRH_MALZEME = [
  { ad: 'Deri', puan: [1, 3, 2, 1], carpan: 5, renk: '#8a5a32', mal: 282 },
  { ad: 'Bakır', puan: [2, 4, 3, 1], carpan: 10, renk: '#d0773d', mal: 259 },
  { ad: 'Demir', puan: [2, 6, 5, 2], carpan: 15, renk: '#d8d8d8', mal: 261 },
  { ad: 'Elmas', puan: [3, 8, 6, 3], carpan: 33, renk: '#52e3d6', mal: 264 }
];
const ZIRH_TABAN = [11, 16, 15, 13];
ZIRH_MALZEME.forEach((m, mi) => ZIRH_PARCALARI.forEach((pa, pi) => {
  esya(400 + mi * 4 + pi, { ad: m.ad + ' ' + pa, tur: 'zirh', yigin: 1, simge: 'zirh' + pi, renk: m.renk,
    zirh: { parca: pi, puan: m.puan[pi], dayanim: ZIRH_TABAN[pi] * m.carpan }, alet: null });
}));

/* Mantar bloğu da yenebilir */
E[36].yemek = 1; E[36].yenir = true;

/* Aletler: 300 + malzeme * 4 + tür */
MALZEMELER.forEach((m, mi) => ALET_TURLERI.forEach((t, ti) => {
  esya(300 + mi * 4 + ti, { ad: m.ad + ' ' + t.ad, tur: 'alet', yigin: 1, simge: t.tur, renk: m.renk,
    alet: { tur: t.tur, seviye: m.seviye, hiz: m.hiz, dayanim: m.dayanim, hasar: t.hasar + mi } });
}));
export const aletId = (malzeme, tur) => 300 + malzeme * 4 + ALET_TURLERI.findIndex(t => t.tur === tur);

export const ESYALAR = E;
export const maksDayanim = e => (e ? (e.alet ? e.alet.dayanim : e.zirh ? e.zirh.dayanim : null) : null);
export const esyaBilgi = id => E[id] || null;
