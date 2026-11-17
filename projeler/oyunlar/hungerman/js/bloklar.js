/* HungerMan - blok, eşya ve alet tanımları (ana iş parçacığı ve işçiler ortak kullanır) */
import { CIHAZ, hucreYerel } from './cihazlar.js';

/* ---------- Doku atlası döşeme dizinleri (0.31.0: 32 x 32 döşeme, 512 piksel) ---------- */
export const ATLAS_N = 32;
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
  'mezar', 'gok_tasi', 'yildiz_feneri',
  /* 0.24.0: elektrik */
  'gunes_panel', 'panel_yan', 'turbin_govde', 'turbin_pervane', 'su_carki', 'turbin_ust', 'batarya_ust',
  'batarya_yan0', 'batarya_yan1', 'batarya_yan2', 'batarya_yan3', 'batarya_yan4', 'ekablo', 'salter_k', 'salter_a',
  'elamba', 'elamba_a', 'eocak_ust', 'eocak_ust_a', 'eocak_yan', 'isitici', 'isitici_a',
  /* 0.26.0: şalter, lamba ve batarya ayrıntıları */
  'salter_govde', 'salter_on', 'led_yesil', 'led_kirmizi', 'lamba_kap', 'batarya_kasa', 'batarya_etiket', 'havalandirma', 'uyari', 'kablo_kilif',
  /* 0.28.0: jeneratör ve algılayıcı */
  'jen_govde', 'jen_on', 'sensor', 'sensor_a',
  /* 0.29.0: elektrikli ocak ve ısıtıcı */
  'ocak_cam', 'ocak_cam_a', 'isitici_izgara', 'isitici_izgara_a',
  /* 0.31.0: yapı ve dekorasyon */
  'akasya_kalas', 'cilali_tas', 'parke_zemin', 'kareli_zemin',
  'cam_k', 'cam_t', 'cam_s', 'cam_y', 'cam_m', 'cam_mo', 'cam_si',
  'kil_0', 'kil_k', 'kil_t', 'kil_s', 'kil_y', 'kil_m', 'kil_mo', 'kil_si',
  'beton_0', 'beton_k', 'beton_t', 'beton_s', 'beton_y', 'beton_m', 'beton_mo', 'beton_si',
  'dolap_on', 'dolap_yan', 'dolap_ust', 'somine_ic', 'mum_govde', 'mum_alev', 'kitap_sirt', 'vazo',
  /* 0.34.0: tarım */
  ...['domates', 'biber', 'misir', 'sogan', 'lahana', 'pamuk', 'cilek'].flatMap(k => [0, 1, 2, 3].map(e => k + e)),
  'karpuz_ust', 'karpuz_yan', 'karpuz_sap0', 'karpuz_sap1', 'karpuz_sap2', 'karpuz_sap3',
  'fidan_elma', 'fidan_kiraz', 'fidan_portakal', 'fidan_zeytin',
  'yaprak_elma', 'yaprak_elma_m', 'yaprak_kiraz', 'yaprak_kiraz_m', 'yaprak_portakal', 'yaprak_portakal_m', 'yaprak_zeytin', 'yaprak_zeytin_m',
  'kompost_yan', 'kompost_ic', 'kompost_hazir'
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
  dusur: r => { const s = r(); return s < 0.3 ? [[267, 1]] : s < 0.42 ? [[292, 1]] : s < 0.48 ? [[[364, 366, 368, 371, 373, 375, 377][Math.floor(r() * 7)], 1]] : []; } });   // 0.34.0: yeni tohumlar
blok(26, { ad: 'Gelincik', dok: 'gelincik', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true });
blok(27, { ad: 'Karahindiba', dok: 'karahindiba', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true });
blok(28, { ad: 'Böğürtlen Çalısı', dok: 'cali_dolu', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0.1, ses: 'bitki', bitki: true,
  dusur: r => [[29, 1], [265, 1 + Math.floor(r() * 2)]] });
blok(29, { ad: 'Böğürtlen Çalısı', dok: 'cali_bos', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0.1, ses: 'bitki', bitki: true });
blok(30, { ad: 'Kuru Çalı', dok: 'kuru_cali', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, degistirilebilir: true,
  dusur: r => (r() < 0.5 ? [[256, 1]] : []) });
blok(31, { ad: 'Deniz Yosunu', dok: 'yosun', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, suIcinde: true, sivi: true, dusur: () => [] });
blok(32, { ad: 'Üretim Masası', dok: { ust: 'masa_ust', yan: 'masa_yan', on: 'masa_on', alt: 'kalas' }, sertlik: 2.5, alet: 'balta', ses: 'odun', istasyon: 'masa' });
blok(33, { ad: 'Fırın', dok: { ust: 'firin_ust', yan: 'firin_yan', on: 'firin_on', alt: 'firin_ust' }, sertlik: 3.5, alet: 'kazma', seviye: 1, istasyon: 'firin', firinKap: 'firin' });
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
blok(48, { ad: 'Kamp Ateşi', dok: 'kamp_atesi', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 1, alet: 'balta', ses: 'odun', isik: 15, mesale: true, istasyon: 'ates', firinKap: 'ates' });
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
blok(594, { ad: 'Gök Taşı', dok: 'gok_tasi', sertlik: 5, alet: 'kazma', seviye: 4, ses: 'tas', mesale: true, isik: 7, parlak: true, dusur: r => [[492, 1 + (r() < 0.45 ? 1 : 0)]], xp: 6, harita: 117 });
blok(595, { ad: 'Yıldız Feneri', dok: 'yildiz_feneri', sertlik: 0.4, ses: 'cam', mesale: true, isik: 15, lamba: true, parlak: true, harita: 116 });
/* ---------- 0.24.0: Elektrik ----------
   elektrik: tür (gunes, ruzgar, su, batarya, kablo, salter, lamba, ocak, isitici). Elektrik bloklarına bitişik olan bloklar aynı ağdadır.
   uretim / tuketim: E/sn (en yüksek değer); kapasite: bataryanın depoladığı en çok enerji (E). Hesap oyun/elektrik.js'tedir. */
/* 0.25.0: üreticiler ve bataryalar gerçek boyutlarında çok bloklu cihazlardır (cihazlar.js). 0.24.0'ın tek bloklu sürümleri (596-616)
   eski kayıtlar için kalır; kırılınca yeni cihazın eşyasını verir. */
for (let id = 596; id <= 616; id++) { const e = id === 596 ? 497 : id <= 600 ? 498 : id === 601 ? 499 : id <= 606 ? 500 : id <= 611 ? 501 : 502;
  blok(id, { ad: 'Eski Elektrik Bloğu', dok: 'panel_yan', sertlik: 1, ses: 'tas', gizli: true, dusur: () => [[e, 1]], harita: 2 }); }
for (const C of Object.values(CIHAZ)) for (let f = 0; f < 4; f++) for (let i = 0; i < C.n; i++) {
  const [lx, ly, lz] = hucreYerel(C, i);
  blok(C.taban + f * C.n + i, { ad: C.ad, dok: 'panel_yan', cizim: C_SEKIL, opak: false, sertlik: C.sertlik, alet: C.alet, ses: C.ses, sekil: 'cihaz', gorunmez: true, ustuneKonmaz: true,
    cihaz: C.tur, yon: f, parca: i, lx, ly, lz, kok: C.taban + f * C.n, elektrik: C.elektrik, uretim: C.uretim || 0, kapasite: C.kapasite || 0, tuketim: C.tuketim || 0, gizli: true, dusur: () => [], harita: 2,
    ...(C.sandik && i === 0 ? { sandik: true } : {}) });   // 0.29.0: taretin ok haznesi
}
/* 0.26.0: kablolar Rust'taki gibi kablo aracıyla cihazdan cihaza çekilir (oyun/kablolar.js); eski yer kablosu (617) eski kayıtlar için iletmeye devam eder */
blok(617, { ad: 'Eski Yer Kablosu', dok: 'ekablo', cizim: C_SEKIL, opak: false, kati: false, sertlik: 0.2, ses: 'tas', sekil: 'ekablo', elektrik: 'kablo', gizli: true, dusur: () => [[503, 1]], harita: 2, port: [0.5, 0.1, 0.5] });
/* Şalter: duvara asılı (çeşit 0) ya da ayaklı (çeşit 1); 826 + çeşit * 8 + yön * 2 + açık. Yön, ön kapağın baktığı yöndür. Sağdaki kol yukarıdayken açıktır.
   618-619: 0.24.0'ın küp şalteri (eski kayıtlar) */
const SALTER = (cesit, f, a) => 826 + cesit * 8 + f * 2 + a;
for (let a = 0; a < 2; a++) blok(618 + a, { ad: 'Şalter', dok: a ? 'salter_a' : 'salter_k', sertlik: 1.5, alet: 'kazma', ses: 'tas', elektrik: 'salter', mekanik: 'salter', acik: a, taban: 618, gizli: true, dusur: () => [[826, 1]], harita: 2, port: [0.5, 1, 0.5] });
for (let c = 0; c < 2; c++) for (let f = 0; f < 4; f++) for (let a = 0; a < 2; a++) blok(SALTER(c, f, a), { ad: 'Şalter', dok: 'salter_govde', cizim: C_SEKIL, opak: false, sertlik: 1.5, alet: 'kazma', ses: 'tas',
  sekil: 'salter', cesit: c, yon: f, acik: a, taban: SALTER(c, f, 0), gizli: c + f + a > 0, elektrik: 'salter', mekanik: 'salter', dusur: () => [[826, 1]], harita: 2, port: c ? [0.5, 0.25, 0.6] : [0.5, 0.04, 0.75] });
/* 0.27.0: Dağıtıcı (1 giriş, 3 çıkış; gücü taleplere göre böler) ve Birleştirici (2 giriş, 1 çıkış; güçleri toplar): 852 / 856 + yön.
   Yön, çıkışların baktığı yöndür. */
for (let f = 0; f < 4; f++) {
  blok(852 + f, { ad: 'Dağıtıcı', dok: 'salter_govde', cizim: C_SEKIL, opak: false, sertlik: 1, alet: 'kazma', ses: 'tas', sekil: 'dagitici', yon: f, taban: 852, gizli: f > 0, elektrik: 'dagitici', dusur: () => [[852, 1]], harita: 2 });
  blok(856 + f, { ad: 'Birleştirici', dok: 'salter_govde', cizim: C_SEKIL, opak: false, sertlik: 1, alet: 'kazma', ses: 'tas', sekil: 'dagitici', birlestir: true, yon: f, taban: 856, gizli: f > 0, elektrik: 'birlestirici', dusur: () => [[856, 1]], harita: 2 });
}
/* 0.28.0: Yakıtlı Jeneratör: 860 + yön * 2 + çalışıyor. Yakıt deposu sandık gibi açılır (kömür, kütük, kalas, çubuk yakar). Yön, kontrol panelinin baktığı yöndür. */
for (let f = 0; f < 4; f++) for (let a = 0; a < 2; a++) blok(860 + f * 2 + a, { ad: 'Yakıtlı Jeneratör', dok: 'jen_govde', cizim: C_SEKIL, opak: false, sertlik: 3, alet: 'kazma', ses: 'tas', sekil: 'jenerator',
  yon: f, acik: a, taban: 860 + f * 2, gizli: f + a > 0, elektrik: 'jenerator', uretim: 20, sandik: true, ustuneKonmaz: true, dusur: () => [[860, 1]], harita: 2 });
/* 0.28.0: Hareket Algılayıcı: duvarda (çeşit 0) ya da ayaklı (1); 872 + ((çeşit * 4 + yön) * 3 + kip) * 2 + algılıyor. Kip: 0 herkes, 1 oyuncular, 2 canavarlar */
for (let c = 0; c < 2; c++) for (let f = 0; f < 4; f++) for (let m = 0; m < 3; m++) for (let a = 0; a < 2; a++) blok(872 + ((c * 4 + f) * 3 + m) * 2 + a, { ad: 'Hareket Algılayıcı', dok: a ? 'sensor_a' : 'sensor', cizim: C_SEKIL, opak: false,
  sertlik: 0.8, ses: 'tas', sekil: 'algilayici', cesit: c, yon: f, kip: m, acik: a, taban: 872 + ((c * 4 + f) * 3 + m) * 2, gizli: c + f + m + a > 0, elektrik: 'algilayici', tuketim: 0.5, dusur: () => [[872, 1]], harita: 2 });
/* 0.28.0: Sulama Fıskiyesi: çevresindeki tarlaları sular, ekinleri hızlandırır (920 + çalışıyor) */
for (let a = 0; a < 2; a++) blok(920 + a, { ad: 'Sulama Fıskiyesi', dok: 'demir_cubuk', cizim: C_SEKIL, opak: false, kati: false, sertlik: 0.8, ses: 'tas', sekil: 'fiskiye', acik: a, taban: 920, gizli: a > 0,
  elektrik: 'fiskiye', tuketim: 2, dusur: () => [[920, 1]], harita: 2 });
/* Elektrikli Lamba: zeminde ayaklı (620-621), tavanda sarkan (842-843), duvarda aplik (844 + yön * 2 + açık) */
const LAMBA_IS = { mesale: true, isik: 15, lamba: true };
for (let a = 0; a < 2; a++) {
  blok(620 + a, { ad: 'Elektrikli Lamba', dok: a ? 'elamba_a' : 'elamba', cizim: C_SEKIL, opak: false, sertlik: 0.8, ses: 'cam', sekil: 'elamba', cesit: 0, elektrik: 'lamba', tuketim: 0.5, acik: a, taban: 620, gizli: a > 0,
    dusur: () => [[620, 1]], harita: a ? 116 : 2, port: [0.5, 0.06, 0.5], ...(a ? LAMBA_IS : {}) });
  blok(842 + a, { ad: 'Elektrikli Lamba', dok: a ? 'elamba_a' : 'elamba', cizim: C_SEKIL, opak: false, sertlik: 0.8, ses: 'cam', sekil: 'elamba', cesit: 1, elektrik: 'lamba', tuketim: 0.5, acik: a, taban: 842, gizli: true,
    dusur: () => [[620, 1]], harita: a ? 116 : 2, port: [0.5, 1, 0.5], ...(a ? LAMBA_IS : {}) });
  for (let f = 0; f < 4; f++) blok(844 + f * 2 + a, { ad: 'Elektrikli Lamba', dok: a ? 'elamba_a' : 'elamba', cizim: C_SEKIL, opak: false, sertlik: 0.8, ses: 'cam', sekil: 'elamba', cesit: 2, yon: f, elektrik: 'lamba', tuketim: 0.5,
    acik: a, taban: 844 + f * 2, gizli: true, dusur: () => [[620, 1]], harita: a ? 116 : 2, port: [0.5, 0.36, 0.97], ...(a ? LAMBA_IS : {}) });
}
/* 0.29.0: Elektrikli Ocak (fırın bölmeli mutfak ocağı) ve Isıtıcı (ayaklı panel radyatör) yönlüdür; ön yüz oyuncuya bakar, bağlantı noktaları arka altta.
   Yön 0: 622-623 / 624-625 (eski kayıtlarla uyumlu); yön 1-3: ocak 920 + yön * 2 + açık, ısıtıcı 926 + yön * 2 + açık.
   Ocak bir pişirme haznesidir: çalışırken içindeki fırın / ateş malzemelerini sırayla pişirir. */
export const OCAK_ID = (f, a) => (f ? 920 + f * 2 + a : 622 + a);
export const ISITICI_ID = (f, a) => (f ? 926 + f * 2 + a : 624 + a);
for (let f = 0; f < 4; f++) for (let a = 0; a < 2; a++) {
  blok(OCAK_ID(f, a), { ad: 'Elektrikli Ocak', dok: 'eocak_yan', cizim: C_SEKIL, opak: false, sertlik: 2.5, alet: 'kazma', ses: 'tas', sekil: 'eocak', yon: f, elektrik: 'ocak', tuketim: 4, acik: a,
    taban: OCAK_ID(f, 0), gizli: f + a > 0, sandik: true, dusur: () => [[622, 1]], harita: 2, ...(a ? { mesale: true, isik: 6 } : {}) });
  blok(ISITICI_ID(f, a), { ad: 'Isıtıcı', dok: 'isitici', cizim: C_SEKIL, opak: false, sertlik: 2, alet: 'kazma', ses: 'tas', sekil: 'eisitici', yon: f, elektrik: 'isitici', tuketim: 3, acik: a,
    taban: ISITICI_ID(f, 0), gizli: f + a > 0, dusur: () => [[624, 1]], harita: 2, ...(a ? { mesale: true, isik: 7 } : {}) });
}
blok(522, { ad: 'Kızıl Mantar', dok: 'kizil_mantar', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, harita: 114 });

/* Maden deneyimi */
for (const [id, xp] of [[16, 1], [18, 1], [17, 1], [19, 2], [20, 4], [61, 2], [58, 4], [520, 3]]) B[id].xp = xp;

export const BLOKLAR = B;
export const BLOK_SAYISI = B.length;

/* 0.30.5: akan su: 934 + seviye - 1 (seviye 1-7; 7 kaynağa en yakın), 941: düşen su (şelale). Kaynak su (7) tükenmez ve akmaz, çevresine akar.
   Akan su kovayla alınamaz; kaynağı kesilince çekilir. */
export const AKAN_SU = L => 933 + L, DUSEN_SU = 941;
for (let L = 1; L <= 7; L++) blok(AKAN_SU(L), { ad: 'Akan Su', dok: 'su', cizim: C_SIVI, kati: false, opak: false, ayniGizle: true, sivi: true, sertlik: -1, ses: 'su', akis: L, gizli: true, harita: 7, dusur: () => [] });
blok(DUSEN_SU, { ad: 'Akan Su', dok: 'su', cizim: C_SIVI, kati: false, opak: false, ayniGizle: true, sivi: true, sertlik: -1, ses: 'su', akis: 8, dusen: true, gizli: true, harita: 7, dusur: () => [] });

/* ---------- 0.31.0: Yapı ve Dekorasyon ----------
   Kimlikler 942'den başlayarak sırayla ayrılır (sıra değişmez; kayıtlarla uyum için yeni bloklar yalnızca sona eklenir).
   RENK8: 0 beyaz / doğal, 1-7 YUN_RENKLERI sırası. Boyanabilir bloklar eldeki boyayla sağ tıklanınca renk değiştirir (boya(k): k renginin kimliği). */
let YENI_ID = 942;
const ayir = n => { const s = YENI_ID; YENI_ID += n; return s; };
export const RENK8 = [{ ad: 'Beyaz', ek: '0', renk: '#e9e6df' }, ...YUN_RENKLERI.map(r => ({ ad: r.ad, ek: r.dok.slice(4), renk: r.renk }))];
const boyaAile = idler => idler.forEach((id, k) => { B[id].renk8 = k; B[id].boya = c => idler[c]; });
const Y = {};   // 0.31.0 kimlik tablosu (uretim.js ve diğer modüller kullanır)
/* Yeni temel bloklar */
Y.akasyaKalas = ayir(1); blok(Y.akasyaKalas, { ad: 'Akasya Kalası', dok: 'akasya_kalas', sertlik: 2, alet: 'balta', ses: 'odun', harita: 14 });
Y.cilaliTas = ayir(1); blok(Y.cilaliTas, { ad: 'Cilalı Taş', dok: 'cilali_tas', sertlik: 1.8, alet: 'kazma', seviye: 1, ses: 'tas', harita: 2 });
Y.parkeZemin = ayir(1); blok(Y.parkeZemin, { ad: 'Parke Zemin', dok: 'parke_zemin', sertlik: 2, alet: 'balta', ses: 'odun', harita: 14 });
Y.kareliZemin = ayir(1); blok(Y.kareliZemin, { ad: 'Kareli Zemin', dok: 'kareli_zemin', sertlik: 1.8, alet: 'kazma', seviye: 1, ses: 'tas', harita: 37 });
/* Renkli cam ve renkli cam bölme (7 renk; 0: sıradan cam / cam bölme) */
Y.cam = ayir(7); Y.bolme = ayir(7);
YUN_RENKLERI.forEach((r, i) => {
  blok(Y.cam + i, { ad: `${r.ad} Cam`, dok: 'cam' + r.dok.slice(3), opak: false, kesik: true, ayniGizle: true, sertlik: 0.3, ses: 'cam', dusur: () => [], bolmeAile: true, harita: 34 });
  blok(Y.bolme + i, { ad: `${r.ad} Cam Bölme`, dok: 'cam' + r.dok.slice(3), cizim: C_SEKIL, opak: false, sertlik: 0.3, ses: 'cam', sekil: 'bolme', dusur: () => [], bolmeAile: true, harita: 34 });
});
/* Pişmiş kil ve beton (8 renk) */
Y.kil = ayir(8); Y.beton = ayir(8);
RENK8.forEach((r, i) => {
  blok(Y.kil + i, { ad: i ? `${r.ad} Pişmiş Kil` : 'Pişmiş Kil', dok: 'kil_' + r.ek, sertlik: 1.4, alet: 'kazma', seviye: 1, ses: 'tas', harita: 163 });
  blok(Y.beton + i, { ad: i ? `${r.ad} Beton` : 'Beton', dok: 'beton_' + r.ek, sertlik: 1.8, alet: 'kazma', seviye: 1, ses: 'tas', harita: i ? 114 + i - 1 : 2 });
});
/* Merdiven (4 yön + 4 ters yön) ve yarım blok (alt / üst) */
export const YAPI_MALZEME = [
  { ad: 'Ladin', taban: 38 }, { ad: 'Huş', taban: 39 }, { ad: 'Akasya', taban: Y.akasyaKalas }, { ad: 'Taş', taban: 2 }, { ad: 'Kesme Taş', taban: 37 },
  { ad: 'Yosunlu Parke Taş', taban: 60 }, { ad: 'Kiremit', taban: 51 }, { ad: 'Kül Tuğlası', taban: 518 }, { ad: 'Cilalı Taş', taban: Y.cilaliTas }, { ad: 'Beton', taban: Y.beton }
];
const yapiOrtak = t => ({ dok: t.dok, cizim: C_SEKIL, opak: false, sertlik: t.sertlik, alet: t.alet, seviye: t.seviye, ses: t.ses, harita: t.id < 256 ? t.id : t.harita || 2 });
YAPI_MALZEME.forEach(m => {
  const t = B[m.taban], o = yapiOrtak(t), mt = ayir(8), yt = ayir(2);
  m.merdiven = mt; m.yarim = yt;
  for (let f = 0; f < 4; f++) blok(mt + f, { ...o, ad: `${m.ad} Merdiven`, sekil: 'merdiven', yon: f, taban: mt, ters: mt + 4, gizli: f > 0, dusur: () => [[mt, 1]] });
  for (let f = 0; f < 4; f++) blok(mt + 4 + f, { ...o, ad: `${m.ad} Merdiven`, sekil: 'merdiven', yon: f, ust: 1, taban: mt, ters: mt + 4, gizli: true, dusur: () => [[mt, 1]] });
  for (let u = 0; u < 2; u++) blok(yt + u, { ...o, ad: `${m.ad} Yarım Blok`, sekil: 'yarim', ust: u, taban: yt, cift: m.taban, gizli: u > 0, dusur: () => [[yt, 1]] });
});
/* Eski merdivenlerin ters (tavana yaslanan) biçimleri */
for (const mt of [70, 74, 78, 166, 190]) {
  const ts = ayir(4), t = B[mt];
  for (let f = 0; f < 4; f++) { B[mt + f].ters = ts; blok(ts + f, { ...t, id: ts + f, yon: f, ust: 1, ters: ts, gizli: true, harita: t.harita }); }
}
/* Duvarlar: komşu duvarlara ve dolu bloklara bağlanır */
export const DUVAR_MALZEME = [
  { ad: 'Parke Taş', taban: 15 }, { ad: 'Taş Tuğla', taban: 35 }, { ad: 'Yosunlu Parke Taş', taban: 60 }, { ad: 'Kiremit', taban: 51 },
  { ad: 'Kül Tuğlası', taban: 518 }, { ad: 'Kum Taşı', taban: 24 }, { ad: 'Cilalı Taş', taban: Y.cilaliTas }, { ad: 'Taş', taban: 2 }
];
DUVAR_MALZEME.forEach(m => { m.duvar = ayir(1); blok(m.duvar, { ...yapiOrtak(B[m.taban]), ad: `${m.ad} Duvar`, sekil: 'duvar' }); });
/* Ahşap çitler (meşe çitle birbirine bağlanır) */
export const CIT_MALZEME = [{ ad: 'Ladin', taban: 38 }, { ad: 'Huş', taban: 39 }, { ad: 'Akasya', taban: Y.akasyaKalas }];
CIT_MALZEME.forEach(m => { m.cit = ayir(1); blok(m.cit, { ad: `${m.ad} Çit`, dok: B[m.taban].dok, cizim: C_SEKIL, opak: false, sertlik: 2, alet: 'balta', ses: 'odun', sekil: 'cit', harita: 14 }); });
/* Mobilya ve süs */
const MOB = { cizim: C_SEKIL, opak: false, sertlik: 1.2, alet: 'balta', ses: 'odun' };
Y.raf = ayir(4);
for (let f = 0; f < 4; f++) blok(Y.raf + f, { ...MOB, ad: 'Duvar Rafı', dok: 'kalas', kati: false, sekil: 'raf', duvara: true, yon: f, taban: Y.raf, gizli: f > 0, dusur: () => [[Y.raf, 1]], harita: 14 });
/* Perde: taban + renk * 8 + yön * 2 + açık; sağ tıkla açılır / kapanır */
Y.perde = ayir(64);
RENK8.forEach((r, c) => { for (let f = 0; f < 4; f++) for (let a = 0; a < 2; a++) {
  const tb = Y.perde + c * 8;
  blok(tb + f * 2 + a, { ad: `${r.ad} Perde`, dok: c ? YUN_RENKLERI[c - 1].dok : 'yun', cizim: C_SEKIL, opak: false, kati: false, sertlik: 0.3, ses: 'yun', sekil: 'perde', yon: f, acik: a, taban: tb, gizli: f + a > 0,
    renk8: c, boya: k => Y.perde + k * 8 + f * 2 + a, dusur: () => [[tb, 1]], harita: c ? 114 + c - 1 : 49 });
} });
Y.avize = ayir(1);
blok(Y.avize, { ad: 'Avize', dok: 'demir_cubuk', cizim: C_SEKIL, opak: false, kati: false, sertlik: 0.8, alet: 'kazma', ses: 'cam', sekil: 'avize', asili: true, destekSiz: true, mesale: true, isik: 15, harita: 2 });
/* Şömine: taban + yön * 2 + yanıyor; ön yüz oyuncuya bakar, sağ tıkla yakılır / söndürülür */
Y.somine = ayir(8);
for (let f = 0; f < 4; f++) for (let a = 0; a < 2; a++) blok(Y.somine + f * 2 + a, { ad: 'Şömine', dok: 'tas_tugla', cizim: C_SEKIL, opak: false, sertlik: 2.5, alet: 'kazma', ses: 'tas', sekil: 'somine', yon: f, acik: a, taban: Y.somine,
  gizli: f + a > 0, destekSiz: true, dusur: () => [[Y.somine, 1]], harita: 35, ...(a ? { mesale: true, isik: 13, isi: [18, 5] } : {}) });
/* Dolap: sandık gibi eşya saklar; kapakları oyuncuya bakar */
Y.dolap = ayir(4);
for (let f = 0; f < 4; f++) blok(Y.dolap + f, { ad: 'Dolap', dok: { ust: 'dolap_ust', yan: 'dolap_yan', alt: 'dolap_ust', on: 'dolap_on' }, onYon: f, dolap: true, yon: f, taban: Y.dolap, gizli: f > 0, sandik: true, sertlik: 2, alet: 'balta', ses: 'odun', dusur: () => [[Y.dolap, 1]], harita: 14 });
Y.sehpa = ayir(1); blok(Y.sehpa, { ...MOB, ad: 'Sehpa', dok: 'kalas_koyu', sekil: 'sehpa', harita: 14 });
Y.vazo = ayir(1); blok(Y.vazo, { ...MOB, ad: 'Çiçekli Vazo', dok: 'vazo', sertlik: 0.3, alet: null, ses: 'cam', sekil: 'vazo', harita: 2 });
Y.mum = ayir(1); blok(Y.mum, { ...MOB, ad: 'Mum', dok: 'mum_govde', kati: false, sertlik: 0.1, alet: null, ses: 'yun', sekil: 'mum', mesale: true, isik: 9, harita: 2 });
/* Sancak: taban + renk * 4 + yön; duvara asılır */
Y.sancak = ayir(32);
RENK8.forEach((r, c) => { for (let f = 0; f < 4; f++) {
  const tb = Y.sancak + c * 4;
  blok(tb + f, { ad: `${r.ad} Sancak`, dok: c ? YUN_RENKLERI[c - 1].dok : 'yun', cizim: C_SEKIL, opak: false, kati: false, sertlik: 0.3, ses: 'yun', sekil: 'sancak', duvara: true, yon: f, taban: tb, gizli: f > 0,
    renk8: c, boya: k => Y.sancak + k * 4 + f, dusur: () => [[tb, 1]], harita: c ? 114 + c - 1 : 49 });
} });
/* Boyanabilir aileler */
boyaAile([49, 114, 115, 116, 117, 118, 119, 120]);
boyaAile([208, 209, 210, 211, 212, 213, 214, 215]);
boyaAile([34, ...YUN_RENKLERI.map((r, i) => Y.cam + i)]);
boyaAile([109, ...YUN_RENKLERI.map((r, i) => Y.bolme + i)]);
boyaAile(RENK8.map((r, i) => Y.kil + i));
boyaAile(RENK8.map((r, i) => Y.beton + i));
for (const id of [34, 109, 182, 188]) B[id].bolmeAile = true;
export const YAPI_ID = Y;
export const YAPI_SON = YENI_ID;

/* ---------- 0.34.0: Tarım ----------
   Yeni ekinler (4 evre): tohumla ya da ürünün kendisiyle tarlaya / toprağa ekilir. tekrar: olgun bitkiye sağ tıklanınca ürün toplanır, bitki 3. evreye döner.
   mevsim: [ilkbahar, yaz, sonbahar, kış] büyüme çarpanı (0: o mevsimde büyümez). */
const T0 = { cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true };
export const TARIM = {};
export const EKIN_TURLERI = [
  { k: 'domates', ad: 'Domates', urun: 363, tohum: 364, adet: [2, 4], tekrar: true, mevsim: [0.8, 1.3, 0.6, 0] },
  { k: 'biber', ad: 'Biber', urun: 365, tohum: 366, adet: [2, 3], tekrar: true, mevsim: [0.8, 1.3, 0.6, 0] },
  { k: 'misir', ad: 'Mısır', urun: 367, tohum: 368, adet: [1, 3], mevsim: [0.9, 1.3, 0.7, 0] },
  { k: 'sogan', ad: 'Soğan', urun: 369, tohum: 369, adet: [2, 4], mevsim: [1, 0.8, 1, 0.5] },
  { k: 'lahana', ad: 'Lahana', urun: 370, tohum: 371, adet: [1, 1], mevsim: [1, 0.6, 1.1, 0.6] },
  { k: 'pamuk', ad: 'Pamuk', urun: 372, tohum: 373, adet: [2, 4], mevsim: [0.8, 1.3, 0.7, 0] },
  { k: 'cilek', ad: 'Çilek', urun: 374, tohum: 375, adet: [2, 4], tekrar: true, mevsim: [1.3, 1, 0.5, 0] }
];
EKIN_TURLERI.forEach(E => {
  const b = E.taban = ayir(4);
  for (let e = 0; e < 4; e++) blok(b + e, { ...T0, ad: e === 3 ? `Olgun ${E.ad}` : `${E.ad} Fidesi`, dok: E.k + e, ekin: e, sonraki: e < 3 ? b + e + 1 : 0, gizli: true, mevsim: E.mevsim, tarimTur: E.k,
    ...(E.tekrar && e === 3 ? { tekrar: b + 2, urun: E.urun, urunAdet: E.adet } : {}), harita: 4,
    dusur: r => (e === 3 ? [[E.urun, E.adet[0] + Math.floor(r() * (E.adet[1] - E.adet[0] + 1))], ...(E.tohum !== E.urun ? [[E.tohum, 1 + Math.floor(r() * 2)]] : [])] : [[E.tohum, 1]]) });
  TARIM[E.k] = E;
});
/* Karpuz: sap 4 evre; olgun sap yanındaki boş toprağa karpuz verir */
TARIM.karpuzSap = ayir(4); TARIM.karpuz = ayir(1);
for (let e = 0; e < 4; e++) blok(TARIM.karpuzSap + e, { ...T0, ad: e === 3 ? 'Olgun Karpuz Sapı' : 'Karpuz Sapı', dok: 'karpuz_sap' + e, ekin: e, sonraki: e < 3 ? TARIM.karpuzSap + e + 1 : TARIM.karpuzSap + 3,
  meyve: e === 3, meyveBlok: TARIM.karpuz, taban: TARIM.karpuzSap, gizli: e > 0, mevsim: [0.7, 1.4, 0.5, 0], dusur: r => [[377, e === 3 ? 1 + (r() < 0.5 ? 1 : 0) : 1]], harita: 4 });
blok(TARIM.karpuz, { ad: 'Karpuz', dok: ['karpuz_ust', 'karpuz_yan', 'karpuz_ust'], sertlik: 1, alet: 'balta', ses: 'odun', harita: 117, dusur: r => [[376, 3 + Math.floor(r() * 4)]] });
/* Meyve ağaçları: fidan, meyvesiz yaprak ve meyveli yaprak (sağ tıkla toplanır; meyve zamanla yeniden olur) */
export const MEYVE_AGACLARI = [
  { k: 'elma', ad: 'Elma', meyve: 266, mevsim: [0.4, 1, 1.4, 0] }, { k: 'kiraz', ad: 'Kiraz', meyve: 378, mevsim: [1.2, 1.3, 0.2, 0] },
  { k: 'portakal', ad: 'Portakal', meyve: 379, mevsim: [0.6, 0.8, 1.2, 0.6] }, { k: 'zeytin', ad: 'Zeytin', meyve: 380, mevsim: [0.3, 0.8, 1.3, 0.2] }
];
export const MEYVE_YAPRAK = {};
MEYVE_AGACLARI.forEach(M => {
  const f = M.fidan = ayir(1), y = M.bos = ayir(1), d = M.dolu = ayir(1);
  blok(f, { ...T0, ad: `${M.ad} Fidanı`, dok: 'fidan_' + M.k, fidan: M.k, harita: 4 });
  const ort = { opak: false, kesik: true, sertlik: 0.2, alet: 'makas', ses: 'bitki', meyveAgaci: M.k, mevsim: M.mevsim, harita: 9, taban: y };
  blok(y, { ...ort, ad: `${M.ad} Ağacı Yaprağı`, dok: 'yaprak_' + M.k, dolu: d, dusur: r => { const o = []; if (r() < 1 / 14) o.push([f, 1]); if (r() < 1 / 30) o.push([256, 1]); return o; } });
  blok(d, { ...ort, ad: `${M.ad} Ağacı Yaprağı`, dok: 'yaprak_' + M.k + '_m', meyveli: true, bos: y, meyveId: M.meyve, gizli: true,
    dusur: r => { const o = [[M.meyve, 1 + (r() < 0.4 ? 1 : 0)]]; if (r() < 1 / 14) o.push([f, 1]); return o; } });
  MEYVE_YAPRAK[M.k] = M;
});
/* Kompost Kutusu: bitkisel atıklar konunca dolar (0-7), dolunca (8) gübre verir */
TARIM.kompost = ayir(9);
for (let s = 0; s < 9; s++) blok(TARIM.kompost + s, { ad: 'Kompost Kutusu', dok: s === 8 ? ['kompost_hazir', 'kompost_yan', 'kalas'] : ['kompost_ic', 'kompost_yan', 'kalas'], cizim: C_SEKIL, opak: false, sertlik: 1, alet: 'balta', ses: 'odun',
  sekil: 'kompost', kompost: s, taban: TARIM.kompost, gizli: s > 0, dusur: () => [[TARIM.kompost, 1]], harita: 14 });

/* Hızlı erişim tabloları (0.18.0: blok kimlikleri 16 bittir; 256-511 eşyalara ayrılmıştır, yeni bloklar 512'den başlar) */
export const BLOK_UST = 2048;   // 0.31.0: 1024'ten 2048'e
export const KATI = new Uint8Array(BLOK_UST), OPAK = new Uint8Array(BLOK_UST), CIZIM = new Uint8Array(BLOK_UST), KESIK = new Uint8Array(BLOK_UST);
export const AYNI_GIZLE = new Uint8Array(BLOK_UST), SIVI = new Uint8Array(BLOK_UST), BITKI = new Uint8Array(BLOK_UST), LAV = new Uint8Array(BLOK_UST);
/* 0.30.5: SU_SEVIYE: su yüksekliği (0 su değil, 8 kaynak / düşen / su içi bitki, 1-7 akan su) */
export const SU_SEVIYE = new Uint8Array(BLOK_UST);
/* EKIN_SONRAKI: büyüyen ekinin sonraki evresi (0: büyümez) */
export const EKIN_SONRAKI = new Uint16Array(BLOK_UST);
/* Yüz dokuları: +x, -x, +y, -y, +z, -z */
export const YUZ_DOKU = new Uint16Array(BLOK_UST * 6);
for (const b of B) {
  if (!b) continue;
  KATI[b.id] = b.kati ? 1 : 0; OPAK[b.id] = b.opak ? 1 : 0; CIZIM[b.id] = b.cizim; KESIK[b.id] = b.kesik ? 1 : 0;
  AYNI_GIZLE[b.id] = b.ayniGizle ? 1 : 0; SIVI[b.id] = b.sivi ? 1 : 0; BITKI[b.id] = b.bitki ? 1 : 0; LAV[b.id] = b.lav ? 1 : 0;
  EKIN_SONRAKI[b.id] = b.sonraki || 0;
  SU_SEVIYE[b.id] = b.sivi && !b.lav ? (b.akis || 8) : 0;
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
/* 0.31.0: beyaz boya (boyalı blokları beyaza / doğal rengine döndürür) ve Yapı Planı (yapı kopyalama ve yapıştırma) */
esya(346, { ad: 'Beyaz Boya', simge: 'boya', renk: '#ecebe4' });
esya(345, { ad: 'Yapı Planı', simge: 'plan', tur: 'plan', yigin: 1 });
/* 0.32.0: teslimat görevlerinde taşınan koli */
esya(347, { ad: 'Köy Kolisi', simge: 'koli', yigin: 1 });
/* ---------- 0.34.0: tarım ürünleri, tohumlar, yemekler ve aletler ---------- */
esya(363, { ad: 'Domates', simge: 'domates', tur: 'yiyecek', yemek: 3 });
esya(364, { ad: 'Domates Tohumu', simge: 'tohum', renk: '#e8d080', ekin: TARIM.domates.taban });
esya(365, { ad: 'Biber', simge: 'biber', tur: 'yiyecek', yemek: 2 });
esya(366, { ad: 'Biber Tohumu', simge: 'tohum', renk: '#f0e0a0', ekin: TARIM.biber.taban });
esya(367, { ad: 'Mısır', simge: 'misir', tur: 'yiyecek', yemek: 2 });
esya(368, { ad: 'Mısır Tanesi', simge: 'tohum', renk: '#f2c43c', ekin: TARIM.misir.taban });
esya(369, { ad: 'Soğan', simge: 'sogan', tur: 'yiyecek', yemek: 1, ekin: TARIM.sogan.taban });
esya(370, { ad: 'Lahana', simge: 'lahana', tur: 'yiyecek', yemek: 3 });
esya(371, { ad: 'Lahana Tohumu', simge: 'tohum', renk: '#7a8a5a', ekin: TARIM.lahana.taban });
esya(372, { ad: 'Pamuk', simge: 'pamuk' });
esya(373, { ad: 'Pamuk Tohumu', simge: 'tohum', renk: '#5a4a3a', ekin: TARIM.pamuk.taban });
esya(374, { ad: 'Çilek', simge: 'cilek', tur: 'yiyecek', yemek: 2 });
esya(375, { ad: 'Çilek Fidesi', simge: 'fide', renk: '#3a8a3a', ekin: TARIM.cilek.taban });
esya(376, { ad: 'Karpuz Dilimi', simge: 'karpuz', tur: 'yiyecek', yemek: 2, serin: 20 });
esya(377, { ad: 'Karpuz Çekirdeği', simge: 'cekirdek', renk: '#2a2a2a', ekin: TARIM.karpuzSap });
esya(378, { ad: 'Kiraz', simge: 'kiraz', tur: 'yiyecek', yemek: 2 });
esya(379, { ad: 'Portakal', simge: 'portakal', tur: 'yiyecek', yemek: 3 });
esya(380, { ad: 'Zeytin', simge: 'zeytin', tur: 'yiyecek', yemek: 1 });
esya(381, { ad: 'Zeytinyağı', simge: 'iksir', renk: '#c8b830' });
esya(382, { ad: 'Menemen', simge: 'corba2', renk: '#d8542a', tur: 'yiyecek', yemek: 9, kase: true, pismis: true, sicak: 20 });
esya(383, { ad: 'Çoban Salatası', simge: 'corba2', renk: '#6aa83a', tur: 'yiyecek', yemek: 7, kase: true, serin: 30 });
esya(384, { ad: 'Közlenmiş Mısır', simge: 'misir', renk: '#c8902a', tur: 'yiyecek', yemek: 5, pismis: true });
esya(385, { ad: 'Patlamış Mısır', simge: 'patlamis', tur: 'yiyecek', yemek: 3, pismis: true });
esya(386, { ad: 'Portakal Suyu', simge: 'iksir', renk: '#f0901a', tur: 'yiyecek', yemek: 4, kap: 331, serin: 40 });
esya(387, { ad: 'Meyve Salatası', simge: 'corba2', renk: '#e85a6a', tur: 'yiyecek', yemek: 7, kase: true, iyilestirme: 2 });
esya(388, { ad: 'Demir Tırpan', tur: 'alet', yigin: 1, simge: 'tirpan', renk: '#dcdcdc', ozellik: 'Olgun ekinleri 3 × 3 alanda biçer ve tohum varsa yeniden eker; otları temizler',
  alet: { tur: 'tirpan', seviye: 4, hiz: 6, dayanim: 300, hasar: 4, alan: 1 } });
esya(389, { ad: 'Elmas Tırpan', tur: 'alet', yigin: 1, simge: 'tirpan', renk: '#52e3d6', ozellik: 'Olgun ekinleri 5 × 5 alanda biçer ve tohum varsa yeniden eker; otları temizler',
  alet: { tur: 'tirpan', seviye: 5, hiz: 8, dayanim: 1500, hasar: 6, alan: 2 } });
esya(390, { ad: 'Gübre', simge: 'kemik_tozu', renk: '#6a4a2a', gubre: true, ozellik: 'Ekinleri ve fidanları hızla büyütür' });
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
  { ad: 'Deri', puan: [1, 3, 2, 1], carpan: 5, renk: '#8a5a32', mal: 282, isi: { y: 3 } },
  { ad: 'Bakır', puan: [2, 4, 3, 1], carpan: 10, renk: '#d0773d', mal: 259, isi: { y: 1, g: 0.7 } },
  { ad: 'Demir', puan: [2, 6, 5, 2], carpan: 15, renk: '#d8d8d8', mal: 261, isi: { y: 1, g: 0.8 } },
  { ad: 'Elmas', puan: [3, 8, 6, 3], carpan: 33, renk: '#52e3d6', mal: 264, isi: { y: 1, g: 0.4 } },
  /* 0.33.0: farklı görünümlü yeni zırhlar (416-431). isi: y soğuktan koruma, s serinlik, g sıcakta ek ısınma (parça başına) */
  { ad: 'Zincir', puan: [2, 5, 4, 1], carpan: 12, renk: '#a8adb4', mal: 261, ek: [284, 2], isi: { y: 0.5, s: 0.5, g: 0.4 }, gorunum: 'zincir' },
  { ad: 'Altın', puan: [2, 5, 3, 1], carpan: 7, renk: '#f2c43c', mal: 263, isi: { y: 1, g: 1 }, gorunum: 'altin' },
  { ad: 'Kürk', puan: [1, 3, 2, 1], carpan: 6, renk: '#e8e0d0', mal: 49, ek: [282, 2], isi: { y: 6, g: 1.2 }, gorunum: 'kurk' },
  { ad: 'Obsidyen', puan: [3, 8, 6, 3], carpan: 42, renk: '#2a1d3a', mal: 515, ek: [264, 1], isi: { y: 2, g: 0.6 }, gorunum: 'obsidyen' }
];
const ZIRH_TABAN = [11, 16, 15, 13];
ZIRH_MALZEME.forEach((m, mi) => ZIRH_PARCALARI.forEach((pa, pi) => {
  esya(400 + mi * 4 + pi, { ad: m.ad + ' ' + pa, tur: 'zirh', yigin: 1, simge: 'zirh' + pi, renk: m.renk,
    zirh: { parca: pi, puan: m.puan[pi], dayanim: ZIRH_TABAN[pi] * m.carpan, gorunum: m.gorunum || null }, isi: m.isi, alet: null });
}));

/* 0.33.0: kıyafetler: zırhın altına giyilir (başlık, üst, alt, ayakkabı). isi: y soğuktan koruma (°C), s serinlik (sıcakta serinletir) */
export const KIYAFET_PARCALARI = ['Başlık', 'Üst', 'Alt', 'Ayakkabı'];
export const KIYAFETLER = [
  [348, 'Yün Bere', 0, '#b8423a', 'bere', { y: 3 }], [349, 'Hasır Şapka', 0, '#d8b860', 'hasir', { s: 3 }], [350, 'Kürk Başlık', 0, '#7a5a3e', 'kurk', { y: 5, g: 0.6 }],
  [351, 'Keten Gömlek', 1, '#e8e2d0', 'gomlek', { y: 1, s: 2 }], [352, 'Yün Kazak', 1, '#3a6ea5', 'kazak', { y: 4, g: 0.6 }], [353, 'Deri Ceket', 1, '#7a4a2a', 'ceket', { y: 3, g: 0.4 }],
  [354, 'Kürklü Mont', 1, '#6a4a32', 'mont', { y: 7, g: 1.4 }], [355, 'Çöl Cüppesi', 1, '#e8dcc0', 'cuppe', { y: 1, s: 4 }],
  [356, 'Keten Pantolon', 2, '#b8a888', 'pantolon', { y: 1, s: 1 }], [357, 'Yün Pantolon', 2, '#4a4a5a', 'pantolon', { y: 3, g: 0.4 }], [358, 'Kürklü Pantolon', 2, '#6a4a32', 'kurkPantolon', { y: 5, g: 1 }],
  [359, 'Şort', 2, '#3a6ea5', 'sort', { s: 2 }],
  [360, 'Sandalet', 3, '#a07040', 'sandalet', { s: 1 }], [361, 'Deri Ayakkabı', 3, '#5a3a22', 'ayakkabi', { y: 1 }], [362, 'Kürklü Çizme', 3, '#7a5a3e', 'cizme', { y: 4, g: 0.6 }]
];
KIYAFETLER.forEach(([id, ad, parca, renk, sekil, isi]) => esya(id, { ad, tur: 'kiyafet', yigin: 1, simge: 'kiyafet' + parca, renk, kiyafet: { parca, sekil }, isi, alet: null }));

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
esya(473, { ad: 'Çakmak', tur: 'cakmak', yigin: 1, simge: 'cakmak2', ozellik: 'Lanetli Ada’daki kadim geçidin çerçevesi bozulup sönerse onu yeniden yakar',
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
/* 0.24.0: elektrik parçaları */
esya(495, { ad: 'Devre Kartı', simge: 'devre', ozellik: 'Elektrikli cihazların yapımında kullanılır' });
esya(496, { ad: 'Bakır Bobin', simge: 'bobin', ozellik: 'Türbin, ocak ve ısıtıcı yapımında kullanılır' });
esya(503, { ad: 'Elektrik Kablosu', tur: 'kablo', simge: 'kablo', ozellik: 'Bir çıkış noktasından bir giriş noktasına çekilir; yüzeye sağ tık ara nokta ekler. Shift: düz çek, Shift + tekerlek: sarkma, R: iptal. Her 3 blok için 1 kablo harcanır' });
/* 0.25.0: çok bloklu cihazların eşyaları (sağ tıkla kurulur; R tuşu yönü çevirir) */
const CIHAZ_SIMGE = { gunes: 'cihazGunes', ruzgar: 'cihazRuzgar', su: 'cihazSu', bataryaK: 'cihazBatarya', bataryaO: 'cihazBatarya', bataryaB: 'cihazBatarya', taret: 'cihazTaret' };
for (const C of Object.values(CIHAZ)) esya(C.esya, { ad: C.ad, tur: 'cihaz', cihaz: C.tur, simge: CIHAZ_SIMGE[C.tur], boyut: { bataryaK: 0, bataryaO: 1, bataryaB: 2 }[C.tur], yigin: 16,
  ozellik: `${C.aciklama} · ${C.w} × ${C.d} taban, ${C.h} blok yükseklik` });
for (const [id, oz] of [[826, 'Ağı açar / keser: sağ tık ya da kol ve bakır tel sinyali. Duvara ya da zemine konur'], [860, 'Kömür, kütük, kalas ya da çubuk yakarak 20 E/sn üretir; çıkışına talep varken yakıt harcar. Sağ tık: yakıt deposu'], [872, 'Yakınında (7 blok) canlı varken gücü çıkışına geçirir; 0,5 E/sn harcar. Sağ tık: kip (herkes / oyuncular / canavarlar)'], [920, 'Çevresindeki 9 × 9 tarlayı sular ve ekinleri hızlandırır; 2 E/sn harcar'], [852, 'Bir girişteki gücü üç çıkışa, bağlı cihazların talebine göre böler'], [856, 'İki girişteki gücü toplayıp tek çıkıştan verir (ör. güneş panellerini birleştirmek için)'], [620, '0,5 E/sn harcar · Zemine, tavana ya da duvara konur'],
  [622, '4 E/sn harcar · Sağ tık: pişirme haznesi; çalışırken içine konan çiğ yiyecek ve fırın malzemelerini pişirir. Yakınındayken fırın ve kamp ateşi yerine geçer, kömür gerektirmez'], [624, '3 E/sn harcar · Çevresini ısıtır']]) E[id].ozellik = oz;
for (const id of [269, 463, 464, 465, 466, 470]) { E[id].sicak = 150; E[id].ozellik = (E[id].ozellik ? E[id].ozellik + ' · ' : '') + 'Isınma (150 saniye)'; }
E[486].serin = 150; E[486].ozellik += ' · Serinlik (150 saniye)';

/* Örste onarım malzemesi */
export function onarimMalzemesi(id) {
  if (id >= 300 && id < 320) return [[14, 38, 39], [15], [259], [261], [264]][Math.floor((id - 300) / 4)];
  if (id >= 340 && id < 345) return [[14, 38, 39], [15], [259], [261], [264]][id - 340];
  if (id >= 400 && id < 432) return [ZIRH_MALZEME[Math.floor((id - 400) / 4)].mal];
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
