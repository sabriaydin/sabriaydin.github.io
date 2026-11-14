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
  'mercan_k', 'mercan_m', 'mercan_s', 'mercan_dal_k', 'mercan_dal_m', 'mercan_dal_s', 'deniz_cayiri', 'istiridye',
  /* 0.11.0: inşa blokları, tarım, örs ve simya */
  'kapi_alt', 'kapi_ust', 'tuzak_kapi', 'tirmanma', 'yun_k', 'yun_t', 'yun_s', 'yun_y', 'yun_m', 'yun_mo', 'yun_si',
  'havuc0', 'havuc1', 'havuc2', 'havuc3', 'patates0', 'patates1', 'patates2', 'patates3', 'tarla', 'tarla_islak',
  'ors', 'simya_ust', 'simya_sise', 'demir_cubuk',
  /* 0.13.0: yeni biyomlar, mağara içerikleri */
  'kuru_cimen_ust', 'kuru_cimen_yan', 'bataklik_ust', 'bataklik_yan', 'akasya_yan', 'akasya_ust', 'akasya_yaprak', 'nilufer',
  'sarmasik', 'orumcek_agi', 'yosun_blok', 'sarkit', 'dikit', 'damlatasi', 'isikli_mantar', 'kar_katman', 'fidan_akasya',
  /* 0.14.0: büyü masası */
  'buyu_ust', 'buyu_yan', 'buyu_alt',
  /* 0.15.0: tuzaklar */
  'okatici_on', 'tuzak_teli',
  /* 0.15.1: asılı fener */
  'fener_kafes',
  /* 0.15.2: çöl tapınağı */
  'kumtasi_duz', 'kumtasi_oyma', 'hiyeroglif', 'pismis_turuncu', 'cini_mavi', 'altin_blok', 'sutun_yan', 'nemes_yan', 'nemes_ust', 'firavun_yuz',
  /* 0.15.3: haydut kampı */
  'cadir_bezi', 'cadir_cizgili', 'fici_yan', 'fici_ust', 'demir_parmaklik', 'hedef_on',
  /* 0.15.4: buzul kulesi */
  'buz_tugla', 'mavi_buz', 'kitaplik', 'vitray_mavi', 'buz_fener', 'buz_oyma', 'buz_kristal', 'buz_sarkit',
  /* 0.16.0: mobilya ve mutfak */
  'saksi', 'lamba', 'tablo_manzara', 'tablo_deniz', 'tablo_cicek', 'tencere', 'tencere_ust', 'minder_k',
  /* 0.17.0: mekanik bloklar */
  'bakir_tel_k', 'bakir_tel_a', 'bakir_lamba', 'bakir_lamba_a', 'ters_ust', 'ters_ust_a', 'muzik_kutu', 'muzik_ust', 'algi_ust', 'algi_ust_a', 'algi_yan', 'kol_bas', 'kol_bas_a',
  /* 0.18.0: Yeraltı Diyarı */
  'kor_tasi', 'kul_kumu', 'isiltas', 'obsidyen', 'gecit', 'kul_tugla', 'kul_tugla_oyma', 'kor_cev', 'magma', 'kizil_mantar',
  /* 0.20.0 */
  'gecik_ust', 'gecik_ust_a',
  /* 0.21.0: tarım ve hayvancılık */
  'kabak_sap0', 'kabak_sap1', 'kabak_sap2', 'kabak_sap3', 'balkabagi_ust', 'balkabagi_yan', 'balkabagi_yuz', 'balkabagi_fener', 'seker_kamisi',
  'kovan_ust', 'kovan_yan', 'kovan_on', 'kovan_on_bal',
  /* 0.22.0: hayatta kalma */
  'mezar', 'gok_tasi', 'yildiz_feneri'
];
export const T = Object.fromEntries(DOKULAR.map((n, i) => [n, i]));

/* Çizim türleri */
export const C_YOK = 0, C_KUP = 1, C_CAPRAZ = 2, C_SIVI = 3, C_LAV = 4;
/* Biçimli bloklar (merdiven, yarım blok, kapı, çit...): kutuları sekiller.js tanımlar */
export const C_SEKIL = 5;

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
blok(50, { ad: 'Sandık', dok: { ust: 'sandik_ust', yan: 'sandik_yan', on: 'sandik_on', alt: 'sandik_ust' }, cizim: 5, opak: false, sertlik: 2.5, alet: 'balta', ses: 'odun', sandik: true, sekil: 'sandik' });
blok(51, { ad: 'Kiremit', dok: 'kiremit', sertlik: 1.5, alet: 'kazma', seviye: 1 });
blok(52, { ad: 'Saman Balyası', dok: ['saman_ust', 'saman_yan', 'saman_ust'], sertlik: 0.5, ses: 'bitki' });
for (let e = 0; e < 4; e++) blok(53 + e, { ad: e === 3 ? 'Olgun Buğday' : 'Buğday Fidesi', dok: 'bugday' + e, cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, ekin: e, sonraki: e < 3 ? 54 + e : 0,
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

/* ---------- İnşa blokları (0.11.0) ----------
   yon: 0 kuzey (-z), 1 doğu (+x), 2 güney (+z), 3 batı (-x). Durum farkları (yön, açık / kapalı, üst / alt) ayrı blok numarasıdır;
   envanterde yalnızca taban blok görünür (gizli), kırılınca taban blok düşer. */
const ESKI_MAL = [
  { ad: 'Meşe', taban: 14, dok: 'kalas' },
  { ad: 'Parke Taş', taban: 15, dok: 'parke' },
  { ad: 'Taş Tuğla', taban: 35, dok: 'tas_tugla' }
];
ESKI_MAL.forEach((m, mi) => {
  const t = B[m.taban], ortak = { dok: m.dok, cizim: C_SEKIL, opak: false, sertlik: t.sertlik, alet: t.alet, seviye: t.seviye, ses: t.ses };
  const mt = 70 + mi * 4, yt = 82 + mi * 2;
  for (let f = 0; f < 4; f++) blok(mt + f, { ...ortak, ad: `${m.ad} Merdiven`, sekil: 'merdiven', yon: f, taban: mt, gizli: f > 0, dusur: () => [[mt, 1]] });
  for (let u = 0; u < 2; u++) blok(yt + u, { ...ortak, ad: `${m.ad} Yarım Blok`, sekil: 'yarim', ust: u, taban: yt, cift: m.taban, gizli: u > 0, dusur: () => [[yt, 1]] });
});
/* Ahşap kapı: 88 + yön * 4 + açık * 2 + üst */
for (let f = 0; f < 4; f++) for (let a = 0; a < 2; a++) for (let u = 0; u < 2; u++) {
  const id = 88 + f * 4 + a * 2 + u;
  blok(id, { ad: 'Ahşap Kapı', dok: u ? 'kapi_ust' : 'kapi_alt', cizim: C_SEKIL, opak: false, sertlik: 1.5, alet: 'balta', ses: 'odun', sekil: 'kapi', yon: f, acik: a, ust: u, taban: 88, gizli: id !== 88, dusur: () => [[88, 1]] });
}
blok(104, { ad: 'Meşe Çit', dok: 'kalas', cizim: C_SEKIL, opak: false, sertlik: 2, alet: 'balta', ses: 'odun', sekil: 'cit' });
/* Çit kapısı: 105 + eksen * 2 + açık (eksen 0: doğu-batı doğrultusunda) */
for (let e = 0; e < 2; e++) for (let a = 0; a < 2; a++) {
  const id = 105 + e * 2 + a;
  blok(id, { ad: 'Çit Kapısı', dok: 'kalas', cizim: C_SEKIL, kati: !a, opak: false, sertlik: 2, alet: 'balta', ses: 'odun', sekil: 'citKapi', eksen: e, acik: a, taban: 105, gizli: id !== 105, dusur: () => [[105, 1]] });
}
blok(109, { ad: 'Cam Bölme', dok: 'cam', cizim: C_SEKIL, opak: false, sertlik: 0.3, ses: 'cam', sekil: 'bolme', dusur: () => [] });
for (let f = 0; f < 4; f++) blok(110 + f, { ad: 'Tırmanma Merdiveni', dok: 'tirmanma', cizim: C_SEKIL, kati: false, opak: false, sertlik: 0.4, alet: 'balta', ses: 'odun', sekil: 'tirmanma', yon: f, taban: 110, gizli: f > 0, tirmanma: true, dusur: () => [[110, 1]] });
/* Renkli yünler */
export const YUN_RENKLERI = [
  { ad: 'Kırmızı', dok: 'yun_k', renk: '#b8322c', boya: 321 }, { ad: 'Turuncu', dok: 'yun_t', renk: '#e07a22', boya: 322 },
  { ad: 'Sarı', dok: 'yun_s', renk: '#e6c42e', boya: 323 }, { ad: 'Yeşil', dok: 'yun_y', renk: '#4f8a2c', boya: 324 },
  { ad: 'Mavi', dok: 'yun_m', renk: '#2f5bc0', boya: 325 }, { ad: 'Mor', dok: 'yun_mo', renk: '#7a3aa8', boya: 326 },
  { ad: 'Siyah', dok: 'yun_si', renk: '#26262c', boya: 327 }
];
YUN_RENKLERI.forEach((r, i) => blok(114 + i, { ad: `${r.ad} Yün`, dok: r.dok, sertlik: 0.8, ses: 'yun' }));
/* Tuzak kapı: 121 + yön * 2 + açık */
for (let f = 0; f < 4; f++) for (let a = 0; a < 2; a++) {
  const id = 121 + f * 2 + a;
  blok(id, { ad: 'Tuzak Kapı', dok: 'tuzak_kapi', cizim: C_SEKIL, kati: !a, opak: false, sertlik: 1.5, alet: 'balta', ses: 'odun', sekil: 'tuzak', yon: f, acik: a, taban: 121, gizli: id !== 121, dusur: () => [[121, 1]] });
}
/* Havuç ve patates ekinleri (dört evre) */
for (let e = 0; e < 4; e++) {
  blok(129 + e, { ad: e === 3 ? 'Olgun Havuç' : 'Havuç Fidesi', dok: 'havuc' + e, cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, ekin: e, sonraki: e < 3 ? 130 + e : 0, gizli: true,
    dusur: r => (e === 3 ? [[328, 2 + Math.floor(r() * 3)]] : [[328, 1]]) });
  blok(133 + e, { ad: e === 3 ? 'Olgun Patates' : 'Patates Fidesi', dok: 'patates' + e, cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, ekin: e, sonraki: e < 3 ? 134 + e : 0, gizli: true,
    dusur: r => (e === 3 ? [[329, 2 + Math.floor(r() * 3)]] : [[329, 1]]) });
}
/* Tarla toprağı: çapa ile işlenir; suya yakın ya da yağmur alan tarla ıslanır ve ekinler daha hızlı büyür */
blok(137, { ad: 'Tarla Toprağı', dok: ['tarla', 'toprak', 'toprak'], cizim: C_SEKIL, opak: false, sertlik: 0.6, alet: 'kurek', ses: 'toprak', sekil: 'tarla', tarla: true, dusur: () => [[3, 1]] });
blok(138, { ad: 'Islak Tarla Toprağı', dok: ['tarla_islak', 'toprak', 'toprak'], cizim: C_SEKIL, opak: false, sertlik: 0.6, alet: 'kurek', ses: 'toprak', sekil: 'tarla', tarla: true, islak: true, gizli: true, dusur: () => [[3, 1]] });
blok(139, { ad: 'Örs', dok: 'ors', cizim: C_SEKIL, opak: false, sertlik: 5, alet: 'kazma', seviye: 1, ses: 'tas', sekil: 'ors', istasyon: 'ors' });
blok(140, { ad: 'Simya Masası', dok: { ust: 'simya_ust', yan: 'parke', on: 'parke', alt: 'parke' }, cizim: C_SEKIL, opak: false, sertlik: 1.5, alet: 'kazma', ses: 'tas', sekil: 'simya', istasyon: 'simya' });
/* ---------- 0.13.0: yeni biyomların ve mağaraların blokları ---------- */
/* Kar katmanı: karlı bölgelerde yaprakların ve zeminin üstünde ince kar */
blok(141, { ad: 'Kar Katmanı', dok: 'kar_katman', cizim: C_SEKIL, kati: false, opak: false, sertlik: 0.1, alet: 'kurek', ses: 'kar', sekil: 'karKatman', bitki: true, degistirilebilir: true, dusur: () => [] });
blok(142, { ad: 'Kuru Çimenli Toprak', dok: ['kuru_cimen_ust', 'kuru_cimen_yan', 'toprak'], sertlik: 0.6, alet: 'kurek', ses: 'cimen', dusur: () => [[3, 1]] });
blok(143, { ad: 'Bataklık Çimeni', dok: ['bataklik_ust', 'bataklik_yan', 'toprak'], sertlik: 0.6, alet: 'kurek', ses: 'cimen', dusur: () => [[3, 1]] });
blok(144, { ad: 'Akasya Kütüğü', dok: ['akasya_ust', 'akasya_yan', 'akasya_ust'], sertlik: 2, alet: 'balta', ses: 'odun' });
blok(145, { ad: 'Akasya Yaprağı', dok: 'akasya_yaprak', opak: false, kesik: true, sertlik: 0.2, alet: 'makas', ses: 'bitki',
  dusur: r => { const o = []; if (r() < 1 / 16) o.push([155, 1]); if (r() < 1 / 30) o.push([256, 1]); return o; } });
blok(146, { ad: 'Nilüfer', dok: 'nilufer', cizim: C_SEKIL, kati: false, opak: false, sertlik: 0, ses: 'bitki', sekil: 'nilufer', bitki: true });
blok(147, { ad: 'Sarmaşık', dok: 'sarmasik', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0.2, alet: 'makas', ses: 'bitki', tirmanma: true, dusur: () => [] });
blok(148, { ad: 'Örümcek Ağı', dok: 'orumcek_agi', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 1.2, alet: 'kilic', ses: 'bitki', ag: true, dusur: r => (r() < 0.6 ? [[284, 1]] : []) });
blok(149, { ad: 'Yosun Bloğu', dok: 'yosun_blok', sertlik: 0.4, alet: 'kurek', ses: 'bitki' });
blok(150, { ad: 'Sarkıt', dok: 'sarkit', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0.8, alet: 'kazma', ses: 'tas', dusur: () => [[150, 1]] });
blok(151, { ad: 'Dikit', dok: 'dikit', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0.8, alet: 'kazma', ses: 'tas', bitki: true, dusur: () => [[150, 1]] });
blok(152, { ad: 'Damlataşı', dok: 'damlatasi', sertlik: 1.5, alet: 'kazma', seviye: 1, ses: 'tas' });
blok(153, { ad: 'Işıklı Mantar', dok: 'isikli_mantar', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, isik: 8, mesale: true });
/* 0.14.0: büyü masası (aletler ve zırhlar deneyim seviyesi ve parıltı kristali karşılığında büyülenir) */
blok(156, { ad: 'Büyü Masası', dok: { ust: 'buyu_ust', yan: 'buyu_yan', on: 'buyu_yan', alt: 'buyu_alt' }, sertlik: 5, alet: 'kazma', seviye: 1, ses: 'tas', istasyon: 'buyu' });
/* 0.15.0: tapınak tuzakları. Tuzak teline basılınca yakındaki ok atıcılar oyuncuya ok atar; tel kırılınca tuzak etkisizleşir */
blok(157, { ad: 'Ok Atıcı', dok: { ust: 'parke', yan: 'parke', on: 'okatici_on', alt: 'parke' }, sertlik: 3.5, alet: 'kazma', ses: 'tas', okAtici: true });
blok(158, { ad: 'Tuzak Teli', dok: 'tuzak_teli', cizim: C_SEKIL, kati: false, opak: false, sertlik: 0, ses: 'bitki', sekil: 'tel', tel: true, dusur: () => [[284, 1]] });
/* 0.15.1: fener (tavana asılır ya da zemine konur; yapıları aydınlatır) */
blok(159, { ad: 'Fener', dok: 'fener_kafes', cizim: C_SEKIL, kati: false, opak: false, sertlik: 0.6, ses: 'tas', sekil: 'fener', mesale: true, isik: 15 });
blok(155, { ad: 'Akasya Fidanı', dok: 'fidan_akasya', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, fidan: 'akasya' });
/* 0.15.2: çöl tapınağı blokları */
blok(160, { ad: 'Oymalı Kum Taşı', dok: ['kumtasi_duz', 'kumtasi_oyma', 'kumtasi_duz'], sertlik: 0.8, alet: 'kazma', seviye: 1 });
blok(161, { ad: 'Düz Kum Taşı', dok: 'kumtasi_duz', sertlik: 0.8, alet: 'kazma', seviye: 1 });
blok(162, { ad: 'Hiyeroglifli Kum Taşı', dok: ['kumtasi_duz', 'hiyeroglif', 'kumtasi_duz'], sertlik: 0.8, alet: 'kazma', seviye: 1 });
blok(163, { ad: 'Turuncu Pişmiş Toprak', dok: 'pismis_turuncu', sertlik: 1.2, alet: 'kazma', seviye: 1 });
blok(164, { ad: 'Mavi Çini', dok: 'cini_mavi', sertlik: 1.2, alet: 'kazma', seviye: 1, ses: 'cam' });
blok(165, { ad: 'Altın Blok', dok: 'altin_blok', sertlik: 3, alet: 'kazma', seviye: 4 });
{
  const t = B[24], ortak = { dok: 'kumtasi_duz', cizim: C_SEKIL, opak: false, sertlik: t.sertlik, alet: t.alet, seviye: t.seviye, ses: t.ses };
  for (let f = 0; f < 4; f++) blok(166 + f, { ...ortak, ad: 'Kum Taşı Merdiven', sekil: 'merdiven', yon: f, taban: 166, gizli: f > 0, dusur: () => [[166, 1]] });
  for (let u = 0; u < 2; u++) blok(170 + u, { ...ortak, ad: 'Kum Taşı Yarım Blok', sekil: 'yarim', ust: u, taban: 170, cift: 161, gizli: u > 0, dusur: () => [[170, 1]] });
}
/* Firavun heykeli başı: yüzü 172 güneye, 172 + k ise (k + 2) % 4 yönüne bakar (konunca oyuncuya döner) */
for (let k = 0; k < 4; k++) blok(172 + k, { ad: 'Firavun Heykeli Başı', dok: { ust: 'nemes_ust', yan: 'nemes_yan', alt: 'kumtasi_duz', on: 'firavun_yuz' }, onYon: (k + 2) % 4, yuzlu: true, taban: 172, gizli: k > 0, sertlik: 0.8, alet: 'kazma', seviye: 1, dusur: () => [[172, 1]] });
blok(176, { ad: 'Kum Taşı Sütun', dok: ['kumtasi_duz', 'sutun_yan', 'kumtasi_duz'], sertlik: 0.8, alet: 'kazma', seviye: 1 });
blok(177, { ad: 'Kum Taşı Korkuluk', dok: 'kumtasi_duz', cizim: C_SEKIL, opak: false, sertlik: 0.8, alet: 'kazma', seviye: 1, sekil: 'korkuluk' });
blok(178, { ad: 'Çizgili Çini', dok: 'nemes_yan', sertlik: 1.2, alet: 'kazma', seviye: 1, ses: 'cam' });
/* 0.15.3: haydut kampı blokları */
blok(179, { ad: 'Çadır Bezi', dok: 'cadir_bezi', sertlik: 0.8, ses: 'yun' });
blok(180, { ad: 'Çizgili Çadır Bezi', dok: 'cadir_cizgili', sertlik: 0.8, ses: 'yun' });
blok(181, { ad: 'Fıçı', dok: ['fici_ust', 'fici_yan', 'fici_ust'], sertlik: 2, alet: 'balta', ses: 'odun' });
blok(182, { ad: 'Demir Parmaklık', dok: 'demir_parmaklik', cizim: C_SEKIL, opak: false, sertlik: 5, alet: 'kazma', seviye: 1, ses: 'tas', sekil: 'bolme' });
blok(183, { ad: 'Hedef', dok: ['saman_ust', 'hedef_on', 'saman_ust'], sertlik: 0.5, ses: 'bitki' });
blok(184, { ad: 'Sivri Kazık', dok: ['mese_ust', 'mese_yan', 'mese_ust'], cizim: C_SEKIL, opak: false, sertlik: 2, alet: 'balta', ses: 'odun', sekil: 'kazik' });
/* 0.15.4: buzul kulesi blokları */
blok(185, { ad: 'Buz Tuğla', dok: 'buz_tugla', sertlik: 1.2, alet: 'kazma', seviye: 1, ses: 'cam' });
blok(186, { ad: 'Sıkışmış Buz', dok: 'mavi_buz', sertlik: 1, alet: 'kazma', ses: 'cam' });
blok(187, { ad: 'Kitaplık', dok: ['kalas', 'kitaplik', 'kalas'], sertlik: 1.5, alet: 'balta', ses: 'odun' });
blok(188, { ad: 'Mavi Vitray', dok: 'vitray_mavi', cizim: C_SEKIL, opak: false, sertlik: 0.3, ses: 'cam', sekil: 'bolme', dusur: () => [] });
blok(189, { ad: 'Buz Feneri', dok: 'buz_fener', cizim: C_SEKIL, opak: false, kati: false, sertlik: 0.5, ses: 'cam', sekil: 'fener', mesale: true, isik: 15, soguk: true });
{
  const ortak = { dok: 'buz_tugla', cizim: C_SEKIL, opak: false, sertlik: 1.2, alet: 'kazma', seviye: 1, ses: 'cam' };
  for (let f = 0; f < 4; f++) blok(190 + f, { ...ortak, ad: 'Buz Tuğla Merdiven', sekil: 'merdiven', yon: f, taban: 190, gizli: f > 0, dusur: () => [[190, 1]] });
  for (let u = 0; u < 2; u++) blok(194 + u, { ...ortak, ad: 'Buz Tuğla Yarım Blok', sekil: 'yarim', ust: u, taban: 194, cift: 185, gizli: u > 0, dusur: () => [[194, 1]] });
}
blok(196, { ad: 'Oymalı Buz Tuğla', dok: 'buz_oyma', sertlik: 1.2, alet: 'kazma', seviye: 1, ses: 'cam' });
blok(197, { ad: 'Buz Kristali', dok: 'buz_kristal', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 1, alet: 'kazma', ses: 'cam', isik: 12, mesale: true, soguk: true });
blok(198, { ad: 'Buz Sarkıtı', dok: 'buz_sarkit', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0.5, ses: 'cam' });
/* 0.16.0: mobilyalar ve tencere */
for (let f = 0; f < 4; f++) blok(199 + f, { ad: 'Sandalye', dok: 'kalas', cizim: C_SEKIL, opak: false, sertlik: 1.5, alet: 'balta', ses: 'odun', sekil: 'sandalye', yon: f, taban: 199, gizli: f > 0, oturak: 0.45, dusur: () => [[199, 1]] });
blok(203, { ad: 'Masa', dok: 'kalas', cizim: C_SEKIL, opak: false, sertlik: 1.5, alet: 'balta', ses: 'odun', sekil: 'masa' });
for (let f = 0; f < 4; f++) blok(204 + f, { ad: 'Koltuk', dok: 'kalas', cizim: C_SEKIL, opak: false, sertlik: 1.5, alet: 'balta', ses: 'yun', sekil: 'koltuk', yon: f, taban: 204, gizli: f > 0, oturak: 0.5, dusur: () => [[204, 1]] });
[['Beyaz', 'yun'], ...YUN_RENKLERI.map(r => [r.ad, r.dok])].forEach(([ad, dok], i) => blok(208 + i, { ad: `${ad} Halı`, dok, cizim: C_SEKIL, opak: false, sertlik: 0.2, ses: 'yun', sekil: 'hali' }));
[['Gelincikli Saksı', 'yun_k'], ['Karahindibalı Saksı', 'yun_s'], ['Peygamber Çiçekli Saksı', 'yun_m']].forEach(([ad, cicek], i) => blok(216 + i, { ad, dok: 'saksi', cizim: C_SEKIL, opak: false, sertlik: 0.2, ses: 'tas', sekil: 'saksi', cicek }));
blok(219, { ad: 'Masa Lambası', dok: 'lamba', cizim: C_SEKIL, opak: false, sertlik: 0.3, ses: 'cam', sekil: 'lamba', mesale: true, isik: 13, lamba: true });
[['Manzara', 'tablo_manzara'], ['Deniz', 'tablo_deniz'], ['Çiçekler', 'tablo_cicek']].forEach(([ad, dok], k) => {
  for (let f = 0; f < 4; f++) blok(220 + k * 4 + f, { ad: `Tablo (${ad})`, dok, cizim: C_SEKIL, opak: false, kati: false, sertlik: 0.2, ses: 'odun', sekil: 'tablo', yon: f, taban: 220 + k * 4, gizli: f > 0, dusur: () => [[220 + k * 4, 1]] });
});
blok(232, { ad: 'Tencere', dok: 'tencere', cizim: C_SEKIL, opak: false, sertlik: 2, alet: 'kazma', ses: 'tas', sekil: 'tencere', istasyon: 'tencere' });
/* 0.17.0: mekanik bloklar. mekanik: tür; kaynak: güç verir; tuketici: güçle çalışır. Durumlar ayrı kimliklerdir. */
for (let a = 0; a < 2; a++) {
  blok(233 + a, { ad: 'Kol', dok: 'parke', cizim: C_SEKIL, opak: false, kati: false, sertlik: 0.5, ses: 'tas', sekil: 'kol', mekanik: 'kol', acik: a, taban: 233, gizli: a > 0, dusur: () => [[233, 1]] });
  blok(235 + a, { ad: 'Düğme', dok: 'tas', cizim: C_SEKIL, opak: false, kati: false, sertlik: 0.5, ses: 'tas', sekil: 'dugme', mekanik: 'dugme', acik: a, taban: 235, gizli: a > 0, dusur: () => [[235, 1]] });
  blok(237 + a, { ad: 'Basınç Plakası', dok: 'kalas', cizim: C_SEKIL, opak: false, kati: false, sertlik: 0.5, ses: 'odun', sekil: 'plaka', mekanik: 'plaka', acik: a, taban: 237, gizli: a > 0, dusur: () => [[237, 1]] });
  blok(239 + a, { ad: 'Bakır Tel', dok: a ? 'bakir_tel_a' : 'bakir_tel_k', cizim: C_SEKIL, opak: false, kati: false, sertlik: 0, ses: 'tas', sekil: 'kablo', mekanik: 'tel', acik: a, taban: 239, gizli: a > 0, dusur: () => [[239, 1]] });
  blok(241 + a, { ad: 'Bakır Lamba', dok: a ? 'bakir_lamba_a' : 'bakir_lamba', sertlik: 1.5, alet: 'kazma', ses: 'cam', mekanik: 'lamba', acik: a, taban: 241, gizli: a > 0, dusur: () => [[241, 1]], ...(a ? { mesale: true, isik: 15 } : {}) });
  blok(252 + a, { ad: 'Işık Algılayıcı', dok: [a ? 'algi_ust_a' : 'algi_ust', 'algi_yan', 'kalas'], cizim: C_SEKIL, opak: false, sertlik: 1, alet: 'balta', ses: 'odun', sekil: 'algi', mekanik: 'algi', acik: a, taban: 252, gizli: a > 0, dusur: () => [[252, 1]] });
}
/* Ters çevirici: yon çıkış yönüdür; arkasından (karşı taraftan) güç gelmezse önüne güç verir; 243 + yon * 2 + yanık */
for (let f = 0; f < 4; f++) for (let a = 0; a < 2; a++) blok(243 + f * 2 + a, { ad: 'Ters Çevirici', dok: a ? 'ters_ust_a' : 'ters_ust', cizim: C_SEKIL, opak: false, sertlik: 0.3, ses: 'tas', sekil: 'ters', mekanik: 'ters', yon: f, acik: a, taban: 243, gizli: f + a > 0, dusur: () => [[243, 1]], ...(a ? { mesale: true, isik: 5 } : {}) });
blok(251, { ad: 'Müzik Kutusu', dok: ['muzik_ust', 'muzik_kutu', 'kalas'], sertlik: 1.2, alet: 'balta', ses: 'odun', mekanik: 'muzik' });

/* 0.18.0: Yeraltı Diyarı blokları (512'den başlar). harita: haritada gösterildiği eski blok */
blok(512, { ad: 'Kor Taşı', dok: 'kor_tasi', sertlik: 0.7, alet: 'kazma', seviye: 1, harita: 114 });
blok(513, { ad: 'Kül Kumu', dok: 'kul_kumu', sertlik: 0.6, alet: 'kurek', ses: 'kum', yavaslatir: true, harita: 6 });
blok(514, { ad: 'Işıltaş', dok: 'isiltas', sertlik: 0.4, ses: 'cam', mesale: true, isik: 15, lamba: true, parlak: true, dusur: r => [[471, 2 + Math.floor(r() * 3)]], harita: 116 });
blok(515, { ad: 'Obsidyen', dok: 'obsidyen', sertlik: 18, alet: 'kazma', seviye: 5, harita: 120 });
/* Diyar geçidi: 516 + eksen (0: düzlem x boyunca, 1: z boyunca); kırılmaz, çerçevesi kırılınca söner */
for (let e = 0; e < 2; e++) blok(516 + e, { ad: 'Diyar Geçidi', dok: 'gecit', cizim: C_SEKIL, kati: false, opak: false, ayniGizle: true, sertlik: -1, ses: 'cam', sekil: 'gecit', eksen: e, gecit: true,
  mesale: true, isik: 9, parlak: true, gizli: true, dusur: () => [], harita: 117 });
blok(518, { ad: 'Kül Tuğlası', dok: 'kul_tugla', sertlik: 3, alet: 'kazma', seviye: 1, harita: 120 });
blok(519, { ad: 'Oymalı Kül Tuğlası', dok: 'kul_tugla_oyma', sertlik: 3, alet: 'kazma', seviye: 1, harita: 120 });
blok(520, { ad: 'Kor Cevheri', dok: 'kor_cev', sertlik: 3, alet: 'kazma', seviye: 4, dusur: r => [[472, 1 + (r() < 0.3 ? 1 : 0)]], harita: 114 });
blok(521, { ad: 'Magma Bloğu', dok: 'magma', sertlik: 0.8, alet: 'kazma', seviye: 1, mesale: true, isik: 8, lamba: true, magma: true, parlak: true, harita: 59 });
/* 0.20.0: Geciktirici: arkasından gelen gücü önüne 1-4 adım (0,1-0,4 sn) gecikmeyle geçirir; sağ tıkla gecikme değişir.
   523 + yön * 8 + gecikme * 2 + açık (yön: çıkış yönü) */
for (let f = 0; f < 4; f++) for (let g = 0; g < 4; g++) for (let a = 0; a < 2; a++) blok(523 + f * 8 + g * 2 + a, { ad: 'Geciktirici', dok: a ? 'gecik_ust_a' : 'gecik_ust', cizim: C_SEKIL, opak: false, sertlik: 0.3, ses: 'tas',
  sekil: 'gecik', mekanik: 'gecik', yon: f, gecikme: g, acik: a, taban: 523, gizli: f + g + a > 0, dusur: () => [[523, 1]], harita: 2, ...(a ? { mesale: true, isik: 4 } : {}) });
/* ---------- 0.21.0: Tarım ve hayvancılık ---------- */
/* Balkabağı sapı: 4 evre; olgun sap (558) yanındaki boş toprağa balkabağı verir ve kalır */
for (let e = 0; e < 4; e++) blok(555 + e, { ad: e === 3 ? 'Olgun Balkabağı Sapı' : 'Balkabağı Sapı', dok: 'kabak_sap' + e, cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true,
  ekin: e, sonraki: e < 3 ? 556 + e : 558, meyve: e === 3, taban: 555, gizli: e > 0, dusur: r => [[475, e === 3 ? 1 + (r() < 0.5 ? 1 : 0) : 1]], harita: 4 });
blok(559, { ad: 'Balkabağı', dok: { ust: 'balkabagi_ust', yan: 'balkabagi_yan', alt: 'balkabagi_ust', on: 'balkabagi_yan' }, sertlik: 1, alet: 'balta', ses: 'odun', harita: 114 });
/* Oyma balkabağı ve balkabağı feneri: yüzü koyan oyuncuya döner */
for (let k = 0; k < 4; k++) blok(560 + k, { ad: 'Oyma Balkabağı', dok: { ust: 'balkabagi_ust', yan: 'balkabagi_yan', alt: 'balkabagi_ust', on: 'balkabagi_yuz' }, onYon: (k + 2) % 4, yuzlu: true, taban: 560,
  gizli: k > 0, sertlik: 1, alet: 'balta', ses: 'odun', dusur: () => [[560, 1]], harita: 114 });
for (let k = 0; k < 4; k++) blok(564 + k, { ad: 'Balkabağı Feneri', dok: { ust: 'balkabagi_ust', yan: 'balkabagi_yan', alt: 'balkabagi_ust', on: 'balkabagi_fener' }, onYon: (k + 2) % 4, yuzlu: true, taban: 564,
  gizli: k > 0, sertlik: 1, alet: 'balta', ses: 'odun', mesale: true, isik: 15, lamba: true, dusur: () => [[564, 1]], harita: 116 });
/* Şeker kamışı: suya komşu kum, toprak ya da çimen üstünde 3 boya kadar uzar */
blok(568, { ad: 'Şeker Kamışı', dok: 'seker_kamisi', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, kamis: true, sonraki: 568, harita: 4 });
/* Arı kovanı: 569 + yön * 6 + bal seviyesi (0-5); ön yüzü yön tarafına bakar; dolu kovandan şişeyle bal, makasla petek alınır */
for (let f = 0; f < 4; f++) for (let s = 0; s < 6; s++) blok(569 + f * 6 + s, { ad: 'Arı Kovanı', dok: { ust: 'kovan_ust', yan: 'kovan_yan', alt: 'kovan_ust', on: s === 5 ? 'kovan_on_bal' : 'kovan_on' },
  onYon: f, kovan: true, yon: f, bal: s, taban: 569, gizli: f + s > 0, sertlik: 0.6, alet: 'balta', ses: 'odun', dusur: () => [[569, 1]], harita: 116 });
/* 0.22.0: Mezar taşı: ölen oyuncunun eşyalarını saklar (sandık gibi açılır, boşalınca kaybolur) */
blok(593, { ad: 'Mezar Taşı', dok: 'mezar', cizim: 5, opak: false, sertlik: 1.5, alet: 'kazma', ses: 'tas', sandik: true, mezar: true, sekil: 'mezar', gizli: true, dusur: () => [], harita: 2 });
/* 0.22.0: Gök taşı: düşen meteorların çekirdeği; demir kazmayla kazılır, yıldız parçası verir */
blok(594, { ad: 'Gök Taşı', dok: 'gok_tasi', sertlik: 5, alet: 'kazma', seviye: 2, ses: 'tas', mesale: true, isik: 7, parlak: true, dusur: r => [[492, 1 + (r() < 0.45 ? 1 : 0)]], xp: 6, harita: 117 });
blok(595, { ad: 'Yıldız Feneri', dok: 'yildiz_feneri', sertlik: 0.4, ses: 'cam', mesale: true, isik: 15, lamba: true, parlak: true, harita: 116 });
blok(522, { ad: 'Kızıl Mantar', dok: 'kizil_mantar', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, harita: 114 });

/* Maden deneyimi */
for (const [id, xp] of [[16, 1], [18, 1], [17, 1], [19, 2], [20, 4], [61, 2], [58, 4], [520, 3]]) B[id].xp = xp;

export const BLOKLAR = B;
export const BLOK_SAYISI = B.length;

/* Hızlı erişim tabloları (0.18.0: blok kimlikleri 16 bittir; 256-511 eşyalara ayrılmıştır, yeni bloklar 512'den başlar) */
export const BLOK_UST = 1024;
export const KATI = new Uint8Array(BLOK_UST), OPAK = new Uint8Array(BLOK_UST), CIZIM = new Uint8Array(BLOK_UST), KESIK = new Uint8Array(BLOK_UST);
export const AYNI_GIZLE = new Uint8Array(BLOK_UST), SIVI = new Uint8Array(BLOK_UST), BITKI = new Uint8Array(BLOK_UST), LAV = new Uint8Array(BLOK_UST);
/* EKIN_SONRAKI: büyüyen ekinin sonraki evresi (0: büyümez) */
export const EKIN_SONRAKI = new Uint16Array(BLOK_UST);
/* Yüz dokuları: +x, -x, +y, -y, +z, -z */
export const YUZ_DOKU = new Uint8Array(BLOK_UST * 6);
for (const b of B) {
  if (!b) continue;
  KATI[b.id] = b.kati ? 1 : 0; OPAK[b.id] = b.opak ? 1 : 0; CIZIM[b.id] = b.cizim; KESIK[b.id] = b.kesik ? 1 : 0;
  AYNI_GIZLE[b.id] = b.ayniGizle ? 1 : 0; SIVI[b.id] = b.sivi ? 1 : 0; BITKI[b.id] = b.bitki ? 1 : 0; LAV[b.id] = b.lav ? 1 : 0;
  EKIN_SONRAKI[b.id] = b.sonraki || 0;
  let u, y, a, o;
  if (!b.dok) { u = y = a = o = 0; }
  else if (typeof b.dok === 'string') u = y = a = o = T[b.dok];
  else if (Array.isArray(b.dok)) { u = T[b.dok[0]]; y = T[b.dok[1]]; a = T[b.dok[2]]; o = y; }
  else { u = T[b.dok.ust]; y = T[b.dok.yan]; a = T[b.dok.alt]; o = T[b.dok.on]; }
  /* onYon: ön yüz dokusu verilen yöne (0 kuzey -z, 1 doğu +x, 2 güney +z, 3 batı -x) bakar; yoksa +z */
  const yuz = [y, y, u, a, b.onYon == null ? o : y, y];
  if (b.onYon != null) yuz[[5, 0, 4, 1][b.onYon]] = o;
  YUZ_DOKU.set(yuz, b.id * 6);
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
for (const b of B) if (b && b.id > 0) esya(b.id, { ad: b.ad, tur: 'blok', blok: b.id, ...(b.gizli ? { gizli: true } : {}) });

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

/* 0.11.0: boyalar, yeni ekinler, iksirler */
YUN_RENKLERI.forEach((r, i) => esya(321 + i, { ad: `${r.ad} Boya`, simge: 'boya', renk: r.renk }));
esya(328, { ad: 'Havuç', simge: 'havuc', tur: 'yiyecek', yemek: 3, ekin: 129 });
esya(329, { ad: 'Patates', simge: 'patates', renk: '#c8a25a', tur: 'yiyecek', yemek: 1, ekin: 133 });
esya(330, { ad: 'Fırınlanmış Patates', simge: 'patates', renk: '#b8742e', pismis: true, tur: 'yiyecek', yemek: 5 });
esya(331, { ad: 'Cam Şişe', simge: 'sise', yigin: 16 });
/* İksir etkileri: sure saniye */
export const ETKILER = {
  hiz: { ad: 'Hız', renk: '#7fd8ff', aciklama: 'Hareket hızı %30 artar' },
  gece: { ad: 'Gece Görüşü', renk: '#5a7aff', aciklama: 'Karanlıkta görüş açılır' },
  nefes: { ad: 'Su Altında Nefes', renk: '#3ac0c0', aciklama: 'Su altında oksijen azalmaz' },
  ates: { ad: 'Ateşe Dayanıklılık', renk: '#ff8a2a', aciklama: 'Lav ve yanma hasar vermez' },
  guc: { ad: 'Güç', renk: '#d83a3a', aciklama: 'Yakın dövüş hasarı %50 artar' },
  /* 0.14.0: canavarların verdiği olumsuz etkiler */
  /* 0.16.0: yemeklerin verdiği etkiler */
  yenilenme: { ad: 'Yenilenme', renk: '#e8668a', aciklama: 'Can her 2,5 saniyede 1 artar' },
  tokluk: { ad: 'Tokluk', renk: '#d8a24a', aciklama: 'Açlık azalmaz' },
  yavas: { ad: 'Yavaşlık', renk: '#7a8fa8', aciklama: 'Hareket hızı %40 azalır', kotu: true },
  aclik: { ad: 'Açlık', renk: '#8a7a3a', aciklama: 'Açlık hızla azalır', kotu: true },
  /* 0.22.0: yaralanma ve vücut ısısı */
  kanama: { ad: 'Kanama', renk: '#c81e1e', aciklama: 'Can azalır; bandaj durdurur', kotu: true },
  kirik: { ad: 'Kırık Bacak', renk: '#b8a890', aciklama: 'Yavaş yürünür, koşulamaz; atel iyileşmeyi hızlandırır', kotu: true },
  sicak: { ad: 'Isınma', renk: '#ff9a4a', aciklama: 'Soğuğa karşı korur' },
  serin: { ad: 'Serinlik', renk: '#8ad8f0', aciklama: 'Sıcağa karşı korur' }
};
[['hiz', 'Hız İksiri'], ['gece', 'Gece Görüşü İksiri'], ['nefes', 'Su Altında Nefes İksiri'], ['ates', 'Ateşe Dayanıklılık İksiri'], ['guc', 'Güç İksiri']].forEach(([k, ad], i) =>
  esya(332 + i, { ad, simge: 'iksir', renk: ETKILER[k].renk, tur: 'iksir', etki: { tur: k, sure: 180 }, yigin: 16, ozellik: `${ETKILER[k].aciklama} (3 dakika)` }));

/* 0.16.0: eyer ve yemekler (kâseli yemekler yenince kâse geri kalır) */
esya(462, { ad: 'Eyer', simge: 'eyer', yigin: 1, ozellik: 'Ehlileştirilmiş ata takılır; eyerli ata binilir' });
const yemek = (id, ad, o, etki, sure) => esya(id, { ad, tur: 'yiyecek', yigin: o.kase ? 1 : 16, ...o, ...(etki ? { etki: { tur: etki, sure }, ozellik: `${ETKILER[etki].ad} (${sure} saniye)` } : {}) });
yemek(463, 'Balık Çorbası', { simge: 'corba2', renk: '#d8c070', yemek: 8, kase: true }, 'nefes', 60);
yemek(464, 'Etli Güveç', { simge: 'corba2', renk: '#8a4a2a', yemek: 10, kase: true }, 'yenilenme', 20);
yemek(465, 'Tavuk Çorbası', { simge: 'corba2', renk: '#e8c068', yemek: 8, kase: true }, 'yenilenme', 10);
yemek(466, 'Kuzu Haşlama', { simge: 'corba2', renk: '#b07850', yemek: 9, kase: true }, 'tokluk', 90);
yemek(467, 'Şiş Kebap', { simge: 'kebap', yemek: 9 }, 'guc', 30);
yemek(468, 'Köfte Ekmek', { simge: 'kofte', yemek: 10 }, 'tokluk', 120);
yemek(469, 'Reçelli Ekmek', { simge: 'recel', yemek: 7 }, 'hiz', 30);
yemek(470, 'Sebze Çorbası', { simge: 'corba2', renk: '#d0803a', yemek: 8, kase: true }, 'yenilenme', 12);

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
/* Çapalar: 340 + malzeme; toprak ve çimeni tarla toprağına çevirir */
MALZEMELER.forEach((m, mi) => esya(340 + mi, { ad: m.ad + ' Çapa', tur: 'alet', yigin: 1, simge: 'capa', renk: m.renk,
  alet: { tur: 'capa', seviye: m.seviye, hiz: m.hiz, dayanim: m.dayanim, hasar: 1 + mi * 0.5 } }));
/* 0.15.0: boss ganimetleri (efsanevi eşyalar) */
esya(458, { ad: 'Güneş Kılıcı', tur: 'alet', yigin: 1, simge: 'kilic', renk: '#f2c43c', efsane: true, ozellik: 'Firavunun kılıcı · Vurulan canlıyı tutuşturur',
  alet: { tur: 'kilic', seviye: 5, hiz: 8, dayanim: 2200, hasar: 9 } });
esya(459, { ad: 'Buz Yayı', tur: 'yay', yigin: 1, simge: 'buzyay', efsane: true, ozellik: 'Buz büyücüsünün yayı · Okları canlıları yavaşlatır',
  alet: { tur: 'yay', seviye: 0, hiz: 1, dayanim: 900, hasar: 1 } });
esya(460, { ad: 'Reis Baltası', tur: 'alet', yigin: 1, simge: 'balta', renk: '#c0503c', efsane: true, ozellik: 'Haydut reisinin baltası',
  alet: { tur: 'balta', seviye: 5, hiz: 9, dayanim: 1900, hasar: 10 } });
esya(461, { ad: 'Muhafız Göğüslüğü', tur: 'zirh', yigin: 1, simge: 'zirh1', renk: '#7d8c96', efsane: true, ozellik: 'Taş muhafızın göğüslüğü',
  zirh: { parca: 1, puan: 9, dayanim: 900 }, alet: null });
/* 0.18.0: Yeraltı Diyarı eşyaları */
esya(471, { ad: 'Işıltaş Tozu', simge: 'toz', renk: '#f2c84a' });
esya(472, { ad: 'Kor Kristali', simge: 'kor_kristal' });
esya(473, { ad: 'Çakmak', tur: 'cakmak', yigin: 1, simge: 'cakmak2', ozellik: 'Obsidyen çerçevenin içine sağ tıklanınca Diyar Geçidi açılır',
  alet: { tur: 'cakmak', seviye: 0, hiz: 1, dayanim: 64, hasar: 1 } });
esya(474, { ad: 'Kor Kılıcı', tur: 'alet', yigin: 1, simge: 'kilic', renk: '#ff6a2a', yakar: true, ozellik: 'Vurulan canlıyı tutuşturur',
  alet: { tur: 'kilic', seviye: 5, hiz: 8, dayanim: 1300, hasar: 8 } });

/* 0.21.0: tarım ve hayvancılık eşyaları */
esya(475, { ad: 'Balkabağı Çekirdeği', simge: 'cekirdek', ekin: 555 });
esya(476, { ad: 'Şeker', simge: 'toz', renk: '#f6f4ee' });
esya(477, { ad: 'Kova', simge: 'kova', yigin: 16, kova: true, ozellik: 'Sudan su alır, inekten süt sağar' });
esya(478, { ad: 'Su Kovası', simge: 'kova', ic: '#3a6ad8', yigin: 1, suKovasi: true, ozellik: 'Suyu koyar; lavı obsidyene çevirir' });
esya(479, { ad: 'Süt Kovası', simge: 'kova', ic: '#f4f4ee', yigin: 1, tur: 'yiyecek', yenir: true, yemek: 1, temizle: true, kap: 477, ozellik: 'İçilince zehri ve olumsuz etkileri giderir' });
esya(480, { ad: 'Yumurta', simge: 'yumurta', yigin: 16 });
esya(481, { ad: 'Makas', tur: 'alet', yigin: 1, simge: 'makas', ozellik: 'Koyunu kırkar, yaprak keser, kovandan petek alır', alet: { tur: 'makas', seviye: 0, hiz: 6, dayanim: 238, hasar: 1 } });
esya(482, { ad: 'Bal Şişesi', simge: 'iksir', renk: '#e8a020', tur: 'yiyecek', yemek: 6, yigin: 16, kap: 331, zehirGider: true, ozellik: 'Zehri giderir' });
esya(483, { ad: 'Bal Peteği', simge: 'petek' });
yemek(484, 'Peynir', { simge: 'peynir', yemek: 4 });
yemek(485, 'Yoğurt', { simge: 'corba2', renk: '#f2f0e6', yemek: 5, kase: true }, 'yenilenme', 6);
yemek(486, 'Ayran', { simge: 'iksir', renk: '#f4f4ee', yemek: 3, kap: 331 }, 'hiz', 30);
yemek(487, 'Kek', { simge: 'kek', yemek: 12 }, 'tokluk', 120);
yemek(488, 'Balkabağı Turtası', { simge: 'turta', yemek: 8 });
yemek(489, 'Omlet', { simge: 'omlet', yemek: 7 }, 'guc', 20);
yemek(490, 'Baklava', { simge: 'baklava', yemek: 9 }, 'hiz', 45);
yemek(491, 'Haşlanmış Yumurta', { simge: 'yumurta', renk: '#f6f2e6', yemek: 4 });
/* 0.22.0: hayatta kalma */
esya(492, { ad: 'Yıldız Parçası', simge: 'yildiz', ozellik: 'Düşen meteorlardan elde edilir' });
esya(493, { ad: 'Eve Dönüş Tılsımı', tur: 'alet', yigin: 1, simge: 'tilsim', ozellik: 'Sağ tık basılı tutulunca doğma noktasına ışınlar', alet: { tur: 'tilsim', seviye: 0, hiz: 1, dayanim: 8, hasar: 1 } });
esya(494, { ad: 'Atel', simge: 'atel', yigin: 16, tur: 'atel', ozellik: 'Kırık bacağı sarar: iyileşme hızlanır, yavaşlık azalır' });
/* Sıcak çorbalar soğuğa karşı ısıtır; ayran serinletir */
for (const id of [269, 463, 464, 465, 466, 470]) { E[id].sicak = 150; E[id].ozellik = (E[id].ozellik ? E[id].ozellik + ' · ' : '') + 'Isınma (150 saniye)'; }
E[486].serin = 150; E[486].ozellik += ' · Serinlik (150 saniye)';

/* Örste onarım malzemesi */
export function onarimMalzemesi(id) {
  if (id >= 300 && id < 320) return [[14, 38, 39], [15], [259], [261], [264]][Math.floor((id - 300) / 4)];
  if (id >= 340 && id < 345) return [[14, 38, 39], [15], [259], [261], [264]][id - 340];
  if (id >= 400 && id < 416) return [ZIRH_MALZEME[Math.floor((id - 400) / 4)].mal];
  if (id === 286 || id === 453) return [284];
  if (id === 456) return [259];
  if (id === 457) return [282];
  if (id === 458 || id === 460) return [264];
  if (id === 459) return [284];
  if (id === 461) return [261];
  if (id === 473) return [261];
  if (id === 481) return [261];
  if (id === 474) return [472];
  return null;
}
export const aletId = (malzeme, tur) => 300 + malzeme * 4 + ALET_TURLERI.findIndex(t => t.tur === tur);

/* ---------- Büyüler (0.14.0) ----------
   Eşya yığınında buyu: { anahtar: seviye } olarak saklanır. uygun: eşya bilgisine göre büyünün uygulanabildiği eşyalar */
const ALET_TUR = (e, ...l) => !!(e && e.alet && l.includes(e.alet.tur));
const ZIRH_P = (e, ...l) => !!(e && e.zirh && (!l.length || l.includes(e.zirh.parca)));
export const BUYULER = {
  keskin: { ad: 'Keskinlik', maks: 5, uygun: e => ALET_TUR(e, 'kilic', 'balta'), aciklama: 'Yakın dövüş hasarı artar' },
  savurma: { ad: 'Savurma', maks: 2, uygun: e => ALET_TUR(e, 'kilic'), aciklama: 'Vurulan canlı daha uzağa savrulur' },
  yagma: { ad: 'Yağma', maks: 3, uygun: e => ALET_TUR(e, 'kilic'), aciklama: 'Canlılar daha çok ganimet düşürür' },
  verim: { ad: 'Verimlilik', maks: 5, uygun: e => ALET_TUR(e, 'kazma', 'balta', 'kurek', 'capa'), aciklama: 'Kazma hızı artar' },
  servet: { ad: 'Servet', maks: 3, uygun: e => ALET_TUR(e, 'kazma'), aciklama: 'Cevherlerden daha çok ürün düşer' },
  guc: { ad: 'Güç', maks: 5, uygun: e => ALET_TUR(e, 'yay'), aciklama: 'Ok hasarı artar' },
  cazibe: { ad: 'Cazibe', maks: 3, uygun: e => ALET_TUR(e, 'olta'), aciklama: 'Balıklar daha çabuk oltaya gelir' },
  koruma: { ad: 'Koruma', maks: 4, uygun: e => ZIRH_P(e), aciklama: 'Alınan hasar azalır' },
  solunum: { ad: 'Solunum', maks: 3, uygun: e => ZIRH_P(e, 0), aciklama: 'Su altında oksijen daha yavaş azalır' },
  tuy: { ad: 'Tüy Düşüşü', maks: 4, uygun: e => ZIRH_P(e, 3), aciklama: 'Düşme hasarı azalır' },
  kirilmaz: { ad: 'Kırılmazlık', maks: 3, uygun: e => !!(e && (e.alet || e.zirh)), aciklama: 'Eşya daha geç yıpranır' }
};
const ROMA = ['', 'I', 'II', 'III', 'IV', 'V'];
export const romaRakam = n => ROMA[n] || String(n);
export const buyuSeviye = (s, k) => (s && s.buyu ? s.buyu[k] || 0 : 0);
export const buyuluMu = s => !!(s && s.buyu && Object.keys(s.buyu).length);
export const buyuMetinleri = s => (buyuluMu(s) ? Object.entries(s.buyu).filter(([k]) => BUYULER[k]).map(([k, n]) => `${BUYULER[k].ad} ${romaRakam(n)}`) : []);
export const uygunBuyuler = id => Object.keys(BUYULER).filter(k => BUYULER[k].uygun(E[id]));
/* Yığın kopyası için büyü nesnesi (boşsa undefined) */
export const buyuKopya = b => (b && typeof b === 'object' && Object.keys(b).length ? { ...b } : undefined);

export const ESYALAR = E;
export const maksDayanim = e => (e ? (e.alet ? e.alet.dayanim : e.zirh ? e.zirh.dayanim : null) : null);
export const esyaBilgi = id => E[id] || null;
