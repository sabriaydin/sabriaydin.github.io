/* HungerMan - blok, eşya ve alet tanımları (ana iş parçacığı ve işçiler ortak kullanır) */
import { CIHAZ, hucreYerel } from './cihazlar.js';
import { COKLU, cokluYerel } from './coklu.js';

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
  'kompost_yan', 'kompost_ic', 'kompost_hazir',
  'firin_on_a',   // 0.35.0
  /* 0.36.0: mutfak */
  'degirmen_ust', 'degirmen_yan', 'tezgah_ust', 'tezgah_on', 'kiler_on', 'fici_yan', 'fici_ust', 'pasta_ust', 'pasta_yan', 'pasta_ic', 'cuval_un', 'cuval_tuz', 'semaver', 'sepet', 'tandir', 'tabak', 'feslegen', 'sarimsak', 'kavanoz', 'kavanoz_bal', 'baharat',
  /* 0.36.1: iki bloklu yatak */
  'yatak_ahsap', 'yatak_yorgan', 'yatak_carsaf', 'yatak_yastik', 'yatak_dosek',
  /* 0.37.0: mobilya, dekor ve yapı blokları */
  'ahsap_cilali', 'doseme_yesil', 'doseme_kahve', 'doseme_kirmizi', 'demir_siyah', 'cekmece_on', 'kagit', 'murekkep', 'gardirop_alt', 'gardirop_ust', 'sarkac', 'saat_yuz',
  'piyano_govde', 'piyano_tus', 'pirinc', 'beyaz_emaye', 'buzdolabi_alt', 'buzdolabi_ust', 'krom', 'yorgan_mavi', 'tulum', 'tulum_ic', 'hamak_bez', 'halat', 'lambri',
  'bilardo_cuha', 'abajur', 'sokak_cam', 'bayrak_sol', 'bayrak_sag', 'kuyu_tas', 'kasa_elma', 'kasa_portakal', 'kasa_ekmek', 'tente', 'heykel', 'mermer', 'mermer_cilali',
  'ayna', 'teleskop_govde', 'kitap_sayfa', 'daktilo_tus', 'kure', 'duvar_saat', 'kaktus', 'monstera', 'paspas', 'varil_yan', 'varil_ust', 'posta_kirmizi', 'posta_on', 'ten',
  'kor_yatak', 'izgara', 'kebap_sis', 'tabela_on', 'tas_kesme_yan', 'tas_kesme_ust',
  'mermer_tugla', 'mermer_sutun_yan', 'mermer_sutun_ust', 'granit', 'granit_cilali', 'bazalt_yan', 'bazalt_ust', 'bazalt_cilali', 'kayrak', 'kayrak_kiremit', 'kirectasi',
  'kerpic', 'eski_tugla', 'catlak_tugla', 'yosunlu_tugla', 'fayans', 'mozaik', 'iznik', 'kamis_yan', 'kamis_ust', 'hasir', 'saman_cati', 'demir_levha', 'bakir_levha',
  'pasli_bakir', 'cam_tugla', 'altin_suslu', 'kasa_yan', 'kasa_ust',
  /* 0.41.0: yeni dünya üreticisinin doğa blokları */
  'kizil_kum', 'miselyum_ust', 'miselyum_yan', 'yaprak_kizil', 'yaprak_turuncu', 'yaprak_sari', 'mangrov_yan', 'mangrov_ust', 'mangrov_yaprak', 'mangrov_kok',
  'mantar_kirmizi_blok', 'mantar_kahve_blok', 'mantar_sap', 'mantar_ic', 'kirmizi_mantar', 'papatya', 'lale', 'lavanta', 'saz',
  /* 0.41.6: çalılar */
  'cali_yesil', 'cali_ladin', 'cali_savan', 'cali_sonbahar',
  /* 0.52.0: Bereket güncellemesi */
  'kuvars', 'kuvars_cilali', 'kuvars_tugla', 'kuvars_sutun_ust', 'kuvars_sutun_yan', 'traverten', 'traverten_tugla', 'andezit', 'andezit_cilali',
  'kizil_kumtasi_ust', 'kizil_kumtasi_yan', 'kizil_kumtasi_oyma', 'kumtasi_tugla', 'deniz_tasi', 'deniz_tasi_tugla', 'koyu_deniz_tasi', 'deniz_feneri_tasi',
  'obsidyen_tugla', 'isiltas_tugla', 'kirmizi_tugla', 'sari_tugla', 'siyah_tugla', 'tas_karo', 'terrazzo', 'arnavut', 'tugla_yol',
  'balik_sirti', 'koyu_lambri', 'kutuk_kaplama', 'kiremit_cati', 'mavi_kiremit', 'bakir_blok', 'kesme_bakir', 'yipranmis_bakir', 'yesil_bakir',
  'demir_blok', 'elmas_blok', 'komur_blok', 'kemik_ust', 'kemik_yan', 'bal_blok', 'akvaryum_ust', 'akvaryum', 'buzlu_cam', 'cerceveli_cam',
  ...['0', 'k', 't', 's', 'y', 'm', 'mo', 'si'].flatMap(e => ['siva_' + e, 'boyali_kalas_' + e, 'led_kapali_' + e, 'led_' + e]),
  'kagit_fener', 'tas_fener', 'demir_fener', 'proj_yan', 'proj_on', 'proj_on_a', 'vant_ust', 'vant_yan', 'vant_yan_a',
  ...['blender', 'kahve', 'tost', 'mikrodalga', 'dondurma', 'izgara', 'radyo'].flatMap(k => [k + '_yan', k + '_on', k + '_on_a']),
  ...['celtik', 'patlican', 'aycicegi', 'cay', 'kahve', 'kakao'].flatMap(k => [0, 1, 2, 3].map(e => k + e)),
  /* 0.53.0: Şebeke güncellemesi */
  'kazan', 'kazan_kapak', 'kazan_kapak_a', 'manometre', 'boru53', 'konteyner', 'konteyner_kapi', 'konteyner_ust', 'jeo_kaplama', 'jeo_isaret', 'kafes', 'izolator',
  'ekran_kasa', 'tv_dolap', 'kepenk', 'kepenk_kutu', 'kamera_govde', 'alarm_govde', 'alarm_kubbe', 'alarm_kubbe_a', 'refrakter', 'ark_ic', 'elektrot', 'sari_metal',
  'pompa_govde', 'sokak_led', 'sokak_led_a', 'camasir_on', 'beyaz_govde', 'testere', 'takip_panel', 'beton53',
  'm_govde', 'm_ve', 'm_veya', 'm_xor', 'm_degil', 'm_role', 'm_zaman', 'm_fotosel', 'm_fotosel_g', 'm_dugme', 'sigorta_on', 'sigorta_on_a',
  'klima_on', 'klima_on_a', 'klima_yan', 'cit_unite', 'cit_unite_a', 'ecit_tel'
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
/* 0.36.1: Yatak eşyası iki bloklu yatak kurar (YATAK); tek bloklu 47 eski kayıtlar ve yapılar için küçük yatak olarak kalır */
blok(47, { ad: 'Yatak', dok: { ust: 'yatak_yorgan', yan: 'yatak_ahsap', on: 'yatak_ahsap', alt: 'yatak_ahsap' }, cizim: C_SEKIL, opak: false, sekil: 'yatakTek', sertlik: 0.4, alet: 'balta', ses: 'yun', yatak: true });
blok(48, { ad: 'Kamp Ateşi', dok: 'kamp_atesi', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 1, alet: 'balta', ses: 'odun', isik: 15, mesale: true, istasyon: 'ates', firinKap: 'ates' });
blok(49, { ad: 'Yün', dok: 'yun', sertlik: 0.8, ses: 'yun' });
blok(50, { ad: 'Sandık', dok: { ust: 'sandik_ust', yan: 'sandik_yan', on: 'sandik_on', alt: 'sandik_ust' }, cizim: 5, opak: false, sertlik: 2.5, alet: 'balta', ses: 'odun', sandik: true, sekil: 'sandik' });
blok(51, { ad: 'Kiremit', dok: 'kiremit', sertlik: 1.5, alet: 'kazma', seviye: 1 });
blok(52, { ad: 'Saman Balyası', dok: ['saman_ust', 'saman_yan', 'saman_ust'], sertlik: 0.5, ses: 'bitki' });
for (let e = 0; e < 4; e++) blok(53 + e, { ad: e === 3 ? 'Olgun Buğday' : 'Buğday Fidesi', gizli: true, dok: 'bugday' + e, cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, ekin: e, sonraki: e < 3 ? 54 + e : 0,
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
  ekin: e, sonraki: e < 3 ? 556 + e : 558, meyve: e === 3, taban: 555, gizli: true, dusur: r => [[475, e === 3 ? 1 + (r() < 0.5 ? 1 : 0) : 1]], harita: 4 });
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
for (const C of Object.values(CIHAZ)) for (let a = 0; a < (C.durum || 1); a++) for (let f = 0; f < 4; f++) for (let i = 0; i < C.n; i++) {
  const [lx, ly, lz] = hucreYerel(C, i), k0 = C.taban + (a * 4 + f) * C.n;   // 0.53.0: durumlu cihazların açık hâli (a = 1) ayrı kimliklerdedir
  blok(k0 + i, { ad: C.ad, dok: 'panel_yan', cizim: C_SEKIL, opak: false, sertlik: C.sertlik, alet: C.alet, ses: C.ses, sekil: 'cihaz', gorunmez: true, ustuneKonmaz: true,
    cihaz: C.tur, yon: f, parca: i, lx, ly, lz, kok: k0, elektrik: C.elektrik, uretim: C.uretim || 0, kapasite: C.kapasite || 0, tuketim: C.tuketim || 0, gizli: true, dusur: () => [], harita: 2,
    ...(C.sandik && i === 0 ? { sandik: true } : {}),   // 0.29.0: taretin ok haznesi
    ...(C.hazne ? { hazne: true } : {}), ...(C.durum ? { acik: a, durumTaban: C.taban + f * C.n } : {}),
    ...(a && C.isikHucre === i ? { mesale: true, isik: C.isik || 15, lamba: true, isikRenk: C.isikRenk, isikKoni: C.isikKoni, isikNabiz: C.isikNabiz, isikTitre: C.isikTitre, isikOfset: C.isikOfset } : {}) });
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
for (let f = 0; f < 4; f++) blok(Y.raf + f, { ...MOB, ad: 'Duvar Rafı', dok: 'kalas', kati: false, sekil: 'raf', duvara: true, sandik: true, dolap: true, yon: f, taban: Y.raf, gizli: f > 0, dusur: () => [[Y.raf, 1]], harita: 14 });
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
  meyve: e === 3, meyveBlok: TARIM.karpuz, taban: TARIM.karpuzSap, gizli: true, mevsim: [0.7, 1.4, 0.5, 0], dusur: r => [[377, e === 3 ? 1 + (r() < 0.5 ? 1 : 0) : 1]], harita: 4 });
blok(TARIM.karpuz, { ad: 'Karpuz', dok: ['karpuz_ust', 'karpuz_yan', 'karpuz_ust'], sertlik: 1, alet: 'balta', ses: 'odun', harita: 117, dusur: r => [[376, 3 + Math.floor(r() * 4)]] });
/* Meyve ağaçları: fidan, meyvesiz yaprak ve meyveli yaprak (sağ tıkla toplanır; meyve zamanla yeniden olur) */
export const MEYVE_AGACLARI = [
  { k: 'elma', ad: 'Elma', meyve: 266, mevsim: [0.4, 1, 1.4, 0] }, { k: 'kiraz', ad: 'Kiraz', meyve: 378, mevsim: [1.2, 1.3, 0.2, 0] },
  { k: 'portakal', ad: 'Portakal', meyve: 379, mevsim: [0.6, 0.8, 1.2, 0.6] }, { k: 'zeytin', ad: 'Zeytin', meyve: 380, mevsim: [0.3, 0.8, 1.3, 0.2] }
];
export const MEYVE_YAPRAK = {};
export const MEYVE_YAPRAK_ID = new Set();   // 0.35.0: kar birikmesi için
MEYVE_AGACLARI.forEach(M => {
  const f = M.fidan = ayir(1), y = M.bos = ayir(1), d = M.dolu = ayir(1);
  blok(f, { ...T0, ad: `${M.ad} Fidanı`, dok: 'fidan_' + M.k, fidan: M.k, harita: 4 });
  const ort = { opak: false, kesik: true, sertlik: 0.2, alet: 'makas', ses: 'bitki', meyveAgaci: M.k, mevsim: M.mevsim, harita: 9, taban: y };
  blok(y, { ...ort, ad: `${M.ad} Ağacı Yaprağı`, dok: 'yaprak_' + M.k, dolu: d, dusur: r => { const o = []; if (r() < 1 / 14) o.push([f, 1]); if (r() < 1 / 30) o.push([256, 1]); return o; } });
  blok(d, { ...ort, ad: `${M.ad} Ağacı Yaprağı`, dok: 'yaprak_' + M.k + '_m', meyveli: true, bos: y, meyveId: M.meyve, gizli: true,
    dusur: r => { const o = [[M.meyve, 1 + (r() < 0.4 ? 1 : 0)]]; if (r() < 1 / 14) o.push([f, 1]); return o; } });
  MEYVE_YAPRAK[M.k] = M; MEYVE_YAPRAK_ID.add(y); MEYVE_YAPRAK_ID.add(d);
});
/* Kompost Kutusu: bitkisel atıklar konunca dolar (0-7), dolunca (8) gübre verir */
TARIM.kompost = ayir(9);
for (let s = 0; s < 9; s++) blok(TARIM.kompost + s, { ad: 'Kompost Kutusu', dok: s === 8 ? ['kompost_hazir', 'kompost_yan', 'kalas'] : ['kompost_ic', 'kompost_yan', 'kalas'], cizim: C_SEKIL, opak: false, sertlik: 1, alet: 'balta', ses: 'odun',
  sekil: 'kompost', kompost: s, taban: TARIM.kompost, gizli: s > 0, dusur: () => [[TARIM.kompost, 1]], harita: 14 });
/* 0.35.0: boş vazo: çiçek (gelincik, karahindiba, peygamber çiçeği) konunca çiçekli vazoya döner */
export const VAZO_BOS = ayir(1);
blok(VAZO_BOS, { ad: 'Vazo', dok: 'vazo', cizim: C_SEKIL, opak: false, sertlik: 0.3, ses: 'cam', sekil: 'vazo', bosVazo: true, harita: 2 });
/* 0.35.0: yanan fırın (çalışırken görünür, ışık verir); kırılınca fırın düşer */
export const FIRIN_YANAN = ayir(1);
blok(FIRIN_YANAN, { ad: 'Fırın', dok: { ust: 'firin_ust', yan: 'firin_yan', on: 'firin_on_a', alt: 'firin_ust' }, sertlik: 3.5, alet: 'kazma', seviye: 1, istasyon: 'firin', firinKap: 'firin', gizli: true, taban: 33,
  mesale: true, destekSiz: true, isik: 12, isi: [8, 4], dusur: () => [[33, 1]], harita: 2 });
/* ---------- 0.36.0: mutfak blokları ---------- */
export const MUTFAK = {};
const MB = { cizim: C_SEKIL, opak: false, sertlik: 1, alet: 'balta', ses: 'odun' };
MUTFAK.degirmen = ayir(1); blok(MUTFAK.degirmen, { ad: 'Değirmen Taşı', dok: ['degirmen_ust', 'degirmen_yan', 'degirmen_ust'], cizim: C_SEKIL, opak: false, sekil: 'degirmen', istasyon: 'degirmen', sertlik: 2.5, alet: 'kazma', ses: 'tas', harita: 2 });
MUTFAK.tezgah = ayir(4); for (let f = 0; f < 4; f++) blok(MUTFAK.tezgah + f, { ad: 'Mutfak Tezgâhı', dok: { ust: 'tezgah_ust', yan: 'dolap_yan', alt: 'dolap_ust', on: 'tezgah_on' }, onYon: f, dolap: true, yon: f, taban: MUTFAK.tezgah, gizli: f > 0, istasyon: 'masa', sertlik: 2, alet: 'balta', ses: 'odun', dusur: () => [[MUTFAK.tezgah, 1]], harita: 14 });
MUTFAK.kiler = ayir(4); for (let f = 0; f < 4; f++) blok(MUTFAK.kiler + f, { ad: 'Kiler Dolabı', dok: { ust: 'dolap_ust', yan: 'dolap_yan', alt: 'dolap_ust', on: 'kiler_on' }, onYon: f, dolap: true, yon: f, taban: MUTFAK.kiler, gizli: f > 0, sandik: true, sertlik: 2, alet: 'balta', ses: 'odun', dusur: () => [[MUTFAK.kiler, 1]], harita: 14 });
MUTFAK.fici = ayir(1); blok(MUTFAK.fici, { ad: 'Turşu Fıçısı', dok: ['fici_ust', 'fici_yan', 'fici_ust'], sandik: true, dolap: true, sertlik: 2, alet: 'balta', ses: 'odun', harita: 14 });
/* Çilekli pasta: sağ tıkla dilim yenir (4 dilim) */
MUTFAK.pasta = ayir(4); for (let d = 0; d < 4; d++) blok(MUTFAK.pasta + d, { ...MB, ad: 'Çilekli Pasta', dok: ['pasta_ust', 'pasta_yan', 'pasta_ic'], sekil: 'pasta', dilim: d, taban: MUTFAK.pasta, gizli: d > 0, sertlik: 0.5, alet: null, ses: 'yun', dusur: () => (d === 0 ? [[MUTFAK.pasta, 1]] : []), harita: 116 });
MUTFAK.semaver = ayir(1); blok(MUTFAK.semaver, { ...MB, ad: 'Semaver', dok: 'semaver', sekil: 'semaver', alet: 'kazma', ses: 'cam', mesale: true, isik: 7, harita: 2 });
MUTFAK.sepet = ayir(1); blok(MUTFAK.sepet, { ...MB, ad: 'Ekmek Sepeti', dok: 'sepet', sekil: 'sepet', sertlik: 0.4, harita: 14 });
MUTFAK.piknik = ayir(1); blok(MUTFAK.piknik, { ...MB, ad: 'Piknik Sepeti', dok: 'sepet', sekil: 'piknik', sandik: true, dolap: true, sertlik: 0.5, harita: 14 });
MUTFAK.tandir = ayir(1); blok(MUTFAK.tandir, { ...MB, ad: 'Tandır', dok: 'tandir', sekil: 'tandir', istasyon: 'firin', alet: 'kazma', ses: 'tas', sertlik: 2.5, mesale: true, destekSiz: true, isik: 9, isi: [10, 4], harita: 35 });
MUTFAK.tabak = ayir(1); blok(MUTFAK.tabak, { ...MB, ad: 'Yemek Tabağı', dok: 'tabak', sekil: 'tabak', kati: false, sertlik: 0.2, alet: null, ses: 'cam', harita: 2 });
MUTFAK.feslegen = ayir(1); blok(MUTFAK.feslegen, { ...MB, ad: 'Fesleğen Saksısı', dok: 'feslegen', sekil: 'feslegen', kati: false, sertlik: 0.2, alet: null, ses: 'bitki', harita: 4 });
MUTFAK.sarimsak = ayir(4); for (let f = 0; f < 4; f++) blok(MUTFAK.sarimsak + f, { ...MB, ad: 'Sarımsak Örgüsü', dok: 'sarimsak', sekil: 'sarimsak', duvara: true, kati: false, yon: f, taban: MUTFAK.sarimsak, gizli: f > 0, sertlik: 0.2, alet: null, ses: 'bitki', dusur: () => [[MUTFAK.sarimsak, 1]], harita: 2 });
MUTFAK.baharat = ayir(4); for (let f = 0; f < 4; f++) blok(MUTFAK.baharat + f, { ...MB, ad: 'Baharat Rafı', dok: 'kalas', sekil: 'baharat', duvara: true, kati: false, yon: f, taban: MUTFAK.baharat, gizli: f > 0, sertlik: 0.5, dusur: () => [[MUTFAK.baharat, 1]], harita: 14 });
MUTFAK.kavanoz = ayir(1); blok(MUTFAK.kavanoz, { ...MB, ad: 'Kavanozlar', dok: 'kavanoz', sekil: 'kavanoz', kati: false, sertlik: 0.2, alet: null, ses: 'cam', harita: 2 });
MUTFAK.bal = ayir(1); blok(MUTFAK.bal, { ...MB, ad: 'Bal Kavanozu', dok: 'kavanoz_bal', sekil: 'balKavanoz', kati: false, sertlik: 0.2, alet: null, ses: 'cam', harita: 2 });
MUTFAK.unCuval = ayir(1); blok(MUTFAK.unCuval, { ...MB, ad: 'Un Çuvalı', dok: 'cuval_un', sekil: 'cuval', sertlik: 0.5, alet: null, ses: 'yun', harita: 49 });
MUTFAK.tuzCuval = ayir(1); blok(MUTFAK.tuzCuval, { ...MB, ad: 'Tuz Çuvalı', dok: 'cuval_tuz', sekil: 'cuval', sertlik: 0.5, alet: null, ses: 'yun', harita: 49 });
/* ---------- 0.36.1: iki bloklu yatak ----------
   Kimlik: YATAK + yön * 2 + parça (0 ayak, 1 baş). Yön, ayaktan başa doğrudur (0 kuzey, 1 doğu, 2 güney, 3 batı). */
export const YATAK = ayir(8);
for (let f = 0; f < 4; f++) for (let p = 0; p < 2; p++) blok(YATAK + f * 2 + p, { ad: 'Yatak', dok: { ust: 'yatak_yorgan', yan: 'yatak_ahsap', on: 'yatak_ahsap', alt: 'yatak_ahsap' }, cizim: C_SEKIL, opak: false,
  sekil: 'yatak2', yatak: true, yatak2: true, yon: f, parca: p, taban: YATAK, gizli: true, sertlik: 0.4, alet: 'balta', ses: 'yun', dusur: () => [[47, 1]], harita: 14 });

/* ---------- 0.37.0: çok bloklu ve tek bloklu mobilya, dekor ve yapılar (coklu.js) ----------
   Her nesne 4 yön × hücre sayısı kimlik kullanır; eşyası taban kimliğidir (yön 0, hücre 0). */
export const COKLU_ID = {};
for (const D of Object.values(COKLU)) {
  const taban = ayir(4 * D.n), ilk = D.kutular.find(k => typeof k[6] === 'string');
  D.taban = taban; COKLU_ID[D.tur] = taban;
  for (let f = 0; f < 4; f++) for (let i = 0; i < D.n; i++) {
    const [lx, ly, lz] = cokluYerel(D, i);
    blok(taban + f * D.n + i, { ad: D.ad, dok: D.dok || (ilk ? ilk[6] : 'kalas'), cizim: C_SEKIL, opak: false, kati: D.kati !== false, sertlik: D.sertlik ?? 1, alet: D.alet ?? null, seviye: D.seviye || 0, ses: D.ses || 'odun',
      sekil: 'coklu', ck: D.tur, yon: f, parca: i, lx, ly, lz, taban, gizli: f > 0 || i > 0, dusur: () => [], harita: D.harita || 14, ikon3b: true,
      ...(D.oturak && ly === 0 ? { oturak: D.oturak } : {}), ...(D.yatak ? { yatak: true } : {}), ...(D.sandik ? { sandik: true, dolap: true } : {}),
      ...(D.isik && ly === D.h - 1 ? { isik: D.isik } : {}), ...(D.istasyon ? { istasyon: D.istasyon } : {}), ...(D.muzik ? { muzik: true } : {}) });
  }
}
/* 0.37.0: yeni yapı blokları */
export const YAPI37 = {};
const Y37 = (k, ad, dok, o = {}) => { const id = ayir(1); YAPI37[k] = id; blok(id, { ad, dok, sertlik: 1.8, alet: 'kazma', seviye: 1, ses: 'tas', harita: 2, ...o }); return id; };
Y37('mermer', 'Mermer', 'mermer', { harita: 49 }); Y37('cilaliMermer', 'Cilalı Mermer', 'mermer_cilali', { harita: 49 }); Y37('mermerTugla', 'Mermer Tuğla', 'mermer_tugla', { harita: 49 });
Y37('mermerSutun', 'Mermer Sütun', ['mermer_sutun_ust', 'mermer_sutun_yan', 'mermer_sutun_ust'], { harita: 49 });
Y37('granit', 'Granit', 'granit', { harita: 163 }); Y37('cilaliGranit', 'Cilalı Granit', 'granit_cilali', { harita: 163 });
Y37('bazalt', 'Bazalt', ['bazalt_ust', 'bazalt_yan', 'bazalt_ust'], { sertlik: 2 }); Y37('cilaliBazalt', 'Cilalı Bazalt', 'bazalt_cilali', { sertlik: 2 });
Y37('kayrak', 'Kayrak', 'kayrak'); Y37('kayrakKiremit', 'Kayrak Kiremit', 'kayrak_kiremit'); Y37('kirectasi', 'Kireçtaşı', 'kirectasi', { sertlik: 1.5, harita: 49 });
Y37('kerpic', 'Kerpiç', 'kerpic', { sertlik: 1, alet: 'kurek', seviye: 0, ses: 'toprak', harita: 163 });
Y37('eskiTugla', 'Eski Tuğla', 'eski_tugla', { harita: 163 }); Y37('catlakTugla', 'Çatlak Taş Tuğla', 'catlak_tugla'); Y37('yosunluTugla', 'Yosunlu Taş Tuğla', 'yosunlu_tugla');
Y37('fayans', 'Beyaz Fayans', 'fayans', { sertlik: 1.2, ses: 'cam', harita: 49 }); Y37('mozaik', 'Mozaik Zemin', 'mozaik', { sertlik: 1.2 }); Y37('iznik', 'İznik Çinisi', 'iznik', { sertlik: 1.2, ses: 'cam', harita: 114 });
Y37('lambri', 'Ahşap Lambri', 'lambri', { sertlik: 2, alet: 'balta', seviye: 0, ses: 'odun', harita: 14 });
Y37('kamis', 'Kamış Demeti', ['kamis_ust', 'kamis_yan', 'kamis_ust'], { sertlik: 0.8, alet: 'balta', seviye: 0, ses: 'bitki', harita: 4 });
Y37('hasir', 'Hasır Örgü', 'hasir', { sertlik: 0.6, alet: 'balta', seviye: 0, ses: 'yun', harita: 14 });
Y37('samanCati', 'Saman Çatı', 'saman_cati', { sertlik: 0.5, alet: null, seviye: 0, ses: 'bitki', harita: 49 });
Y37('demirLevha', 'Demir Levha', 'demir_levha', { sertlik: 3, seviye: 2 }); Y37('bakirLevha', 'Bakır Levha', 'bakir_levha', { sertlik: 3, seviye: 1, harita: 163 }); Y37('pasliBakir', 'Paslı Bakır Levha', 'pasli_bakir', { sertlik: 3, seviye: 1, harita: 114 });
Y37('camTugla', 'Cam Tuğla', 'cam_tugla', { opak: false, kesik: true, ayniGizle: true, sertlik: 0.6, alet: null, seviye: 0, ses: 'cam', harita: 34 });
Y37('altinSuslu', 'Altın Süslemeli Taş', 'altin_suslu', { sertlik: 2 }); Y37('ahsapKasa', 'Ahşap Kasa', ['kasa_ust', 'kasa_yan', 'kasa_ust'], { sertlik: 1.5, alet: 'balta', seviye: 0, ses: 'odun', harita: 14 });
/* Merdiven, yarım blok ve duvar çeşitleri */
export const YAPI_MALZEME37 = [{ ad: 'Mermer', taban: YAPI37.mermer }, { ad: 'Granit', taban: YAPI37.cilaliGranit }, { ad: 'Bazalt', taban: YAPI37.cilaliBazalt }, { ad: 'Kayrak', taban: YAPI37.kayrakKiremit }, { ad: 'Eski Tuğla', taban: YAPI37.eskiTugla }];
YAPI_MALZEME37.forEach(m => {
  const t = B[m.taban], o = yapiOrtak({ ...t, dok: t.dok }), mt = ayir(8), yt = ayir(2);
  m.merdiven = mt; m.yarim = yt;
  for (let f = 0; f < 4; f++) blok(mt + f, { ...o, ad: `${m.ad} Merdiven`, sekil: 'merdiven', yon: f, taban: mt, ters: mt + 4, gizli: f > 0, dusur: () => [[mt, 1]] });
  for (let f = 0; f < 4; f++) blok(mt + 4 + f, { ...o, ad: `${m.ad} Merdiven`, sekil: 'merdiven', yon: f, ust: 1, taban: mt, ters: mt + 4, gizli: true, dusur: () => [[mt, 1]] });
  for (let u = 0; u < 2; u++) blok(yt + u, { ...o, ad: `${m.ad} Yarım Blok`, sekil: 'yarim', ust: u, taban: yt, cift: m.taban, gizli: u > 0, dusur: () => [[yt, 1]] });
});
export const DUVAR_MALZEME37 = [{ ad: 'Mermer Tuğla', taban: YAPI37.mermerTugla }, { ad: 'Eski Tuğla', taban: YAPI37.eskiTugla }, { ad: 'Granit', taban: YAPI37.granit }];
DUVAR_MALZEME37.forEach(m => { m.duvar = ayir(1); blok(m.duvar, { ...yapiOrtak(B[m.taban]), ad: `${m.ad} Duvar`, sekil: 'duvar' }); });

/* ---------- 0.41.0: yeni dünya üreticisinin (sürüm 2) doğa blokları ----------
   Kimlikleri sabittir (3000'den başlar): sonradan eklenen eşya ve bloklar mevcut kimlikleri kaydırmaz. */
export const DOGA41 = { kizilKum: 3000, miselyum: 3001, kizilYaprak: 3002, turuncuYaprak: 3003, sariYaprak: 3004, mangrovKutuk: 3005, mangrovYaprak: 3006, mangrovKok: 3007,
  kirmiziMantarBlok: 3008, kahveMantarBlok: 3009, mantarSap: 3010, kirmiziMantar: 3011, papatya: 3012, lale: 3013, lavanta: 3014, saz: 3015, sazSu: 3016,
  devrikMeseX: 3017, devrikMeseZ: 3018, devrikLadinX: 3019, devrikLadinZ: 3020, devrikHusX: 3021, devrikHusZ: 3022,
  cali: 3023, ladinCali: 3024, savanCali: 3025, sonbaharCali: 3026, buyukCali: 3027 };
{
  const D = DOGA41;
  const yaprakDusur = r => { const o = []; if (r() < 1 / 16) o.push([40, 1]); if (r() < 1 / 30) o.push([256, 1]); return o; };
  blok(D.kizilKum, { ad: 'Kızıl Kum', dok: 'kizil_kum', sertlik: 0.5, alet: 'kurek', ses: 'kum', harita: 163 });
  blok(D.miselyum, { ad: 'Miselyum', dok: ['miselyum_ust', 'miselyum_yan', 'toprak'], sertlik: 0.6, alet: 'kurek', ses: 'cimen', dusur: () => [[3, 1]], harita: 119 });
  blok(D.kizilYaprak, { ad: 'Kızıl Sonbahar Yaprağı', dok: 'yaprak_kizil', opak: false, kesik: true, sertlik: 0.2, alet: 'makas', ses: 'bitki', dusur: yaprakDusur, harita: 114 });
  blok(D.turuncuYaprak, { ad: 'Turuncu Sonbahar Yaprağı', dok: 'yaprak_turuncu', opak: false, kesik: true, sertlik: 0.2, alet: 'makas', ses: 'bitki', dusur: yaprakDusur, harita: 115 });
  blok(D.sariYaprak, { ad: 'Sarı Sonbahar Yaprağı', dok: 'yaprak_sari', opak: false, kesik: true, sertlik: 0.2, alet: 'makas', ses: 'bitki', dusur: r => { const o = []; if (r() < 1 / 16) o.push([42, 1]); if (r() < 1 / 30) o.push([256, 1]); return o; }, harita: 116 });
  blok(D.mangrovKutuk, { ad: 'Mangrov Kütüğü', dok: ['mangrov_ust', 'mangrov_yan', 'mangrov_ust'], sertlik: 2, alet: 'balta', ses: 'odun', harita: 8 });
  blok(D.mangrovYaprak, { ad: 'Mangrov Yaprağı', dok: 'mangrov_yaprak', opak: false, kesik: true, sertlik: 0.2, alet: 'makas', ses: 'bitki', dusur: r => (r() < 1 / 30 ? [[256, 1]] : []), harita: 9 });
  blok(D.mangrovKok, { ad: 'Mangrov Kökü', dok: 'mangrov_kok', opak: false, kesik: true, sertlik: 0.7, alet: 'balta', ses: 'odun', harita: 8 });
  blok(D.kirmiziMantarBlok, { ad: 'Kırmızı Mantar Bloğu', dok: 'mantar_kirmizi_blok', sertlik: 0.2, alet: 'balta', ses: 'bitki', dusur: r => (r() < 0.3 ? [[D.kirmiziMantar, 1]] : []), harita: 114 });
  blok(D.kahveMantarBlok, { ad: 'Kahverengi Mantar Bloğu', dok: 'mantar_kahve_blok', sertlik: 0.2, alet: 'balta', ses: 'bitki', dusur: r => (r() < 0.3 ? [[36, 1]] : []), harita: 14 });
  blok(D.mantarSap, { ad: 'Mantar Sapı', dok: ['mantar_ic', 'mantar_sap', 'mantar_ic'], sertlik: 0.2, alet: 'balta', ses: 'bitki', harita: 49 });
  blok(D.kirmiziMantar, { ad: 'Kırmızı Mantar', dok: 'kirmizi_mantar', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, harita: 114 });
  blok(D.papatya, { ad: 'Papatya', dok: 'papatya', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, harita: 49 });
  blok(D.lale, { ad: 'Lale', dok: 'lale', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, harita: 114 });
  blok(D.lavanta, { ad: 'Lavanta', dok: 'lavanta', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, harita: 119 });
  blok(D.saz, { ad: 'Saz', dok: 'saz', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, harita: 4 });
  blok(D.sazSu, { ad: 'Saz', dok: 'saz', cizim: C_CAPRAZ, kati: false, opak: false, sertlik: 0, ses: 'bitki', bitki: true, suIcinde: true, sivi: true, gizli: true, dusur: () => [[D.saz, 1]], harita: 7 });
  /* 0.41.6: çalılar: yere yakın, kendine özgü biçimli (üst üste binen yuvarlak yaprak kümeleri) bitkiler; içinden geçilir */
  const caliDusur = r => { const o = []; if (r() < 0.25) o.push([256, 1]); if (r() < 0.06) o.push([40, 1]); return o; };
  for (const [id, ad, dok, ek] of [[D.cali, 'Çalı', 'cali_yesil', {}], [D.ladinCali, 'Ladin Çalısı', 'cali_ladin', {}], [D.savanCali, 'Savan Çalısı', 'cali_savan', {}],
    [D.sonbaharCali, 'Sonbahar Çalısı', 'cali_sonbahar', {}], [D.buyukCali, 'Büyük Çalı', 'cali_yesil', { buyuk: true }]])
    blok(id, { ad, dok, cizim: C_SEKIL, sekil: 'cali', kati: false, opak: false, sertlik: 0.3, alet: 'makas', ses: 'bitki', bitki: true, dusur: caliDusur, harita: id === D.savanCali ? 142 : id === D.sonbaharCali ? 115 : 9, ...ek });
  /* Devrik kütükler: yatay yatan ağaç gövdeleri (halkalı yüzler uçlardadır); kırılınca olağan kütük düşer */
  for (const [x, z, ad, dk, kutuk] of [[D.devrikMeseX, D.devrikMeseZ, 'Meşe', 'mese', 8], [D.devrikLadinX, D.devrikLadinZ, 'Ladin', 'ladin', 10], [D.devrikHusX, D.devrikHusZ, 'Huş', 'hus', 12]]) {
    blok(x, { ad: `Devrik ${ad} Kütüğü`, dok: [dk + '_yan', dk + '_yan', dk + '_yan'], devrik: [dk + '_ust', 0], sertlik: 2, alet: 'balta', ses: 'odun', gizli: true, dusur: () => [[kutuk, 1]], harita: kutuk });
    blok(z, { ad: `Devrik ${ad} Kütüğü`, dok: [dk + '_yan', dk + '_yan', dk + '_yan'], devrik: [dk + '_ust', 2], sertlik: 2, alet: 'balta', ses: 'odun', gizli: true, dusur: () => [[kutuk, 1]], harita: kutuk });
  }
}

/* ---------- 0.52.0: Bereket güncellemesi: yapı blokları, elektrikli cihazlar ve yeni ekinler ----------
   Kimlikler 2200'den başlayan ayrı aralıktan sırayla ayrılır (ayir52). Eski sıra (ayir) 2073'ten devam eder; 2073-2199 boştur.
   Sıra değişmez: kayıtlarla uyum için yeni bloklar ve eşyalar yalnızca bu bölümlerin sonuna eklenir. */
let ID52 = 2200;
const ayir52 = n => { const s = ID52; ID52 += n; return s; };
export const YAPI52 = {}, ESYA52 = {}, CIHAZ52 = {};
const Y52 = (k, ad, dok, o = {}) => { const id = ayir52(1); YAPI52[k] = id; blok(id, { ad, dok, sertlik: 1.8, alet: 'kazma', seviye: 1, ses: 'tas', harita: 2, ...o }); return id; };
const AHSAP52 = { alet: 'balta', seviye: 0, ses: 'odun', sertlik: 2, harita: 14 };
/* Taşlar, tuğlalar ve zeminler (Taş Kesme Tezgâhı) */
Y52('kuvars', 'Kuvars Bloğu', 'kuvars', { harita: 49, sertlik: 1.6 }); Y52('kuvarsCilali', 'Cilalı Kuvars', 'kuvars_cilali', { harita: 49 });
Y52('kuvarsTugla', 'Kuvars Tuğla', 'kuvars_tugla', { harita: 49 }); Y52('kuvarsSutun', 'Kuvars Sütun', ['kuvars_sutun_ust', 'kuvars_sutun_yan', 'kuvars_sutun_ust'], { harita: 49 });
Y52('traverten', 'Traverten', 'traverten', { harita: 116 }); Y52('travertenTugla', 'Traverten Tuğla', 'traverten_tugla', { harita: 116 });
Y52('andezit', 'Andezit', 'andezit'); Y52('andezitCilali', 'Cilalı Andezit', 'andezit_cilali');
Y52('kizilKumtasi', 'Kızıl Kumtaşı', ['kizil_kumtasi_ust', 'kizil_kumtasi_yan', 'kizil_kumtasi_ust'], { harita: 163, sertlik: 0.8 });
Y52('kizilKumtasiOyma', 'Oymalı Kızıl Kumtaşı', ['kizil_kumtasi_ust', 'kizil_kumtasi_oyma', 'kizil_kumtasi_ust'], { harita: 163, sertlik: 0.8 });
Y52('kizilKumtasiDuz', 'Düz Kızıl Kumtaşı', 'kizil_kumtasi_ust', { harita: 163, sertlik: 0.8 });
Y52('kumtasiTugla', 'Kumtaşı Tuğla', 'kumtasi_tugla', { harita: 24, sertlik: 0.8 });
Y52('denizTasi', 'Deniz Taşı', 'deniz_tasi', { harita: 118 }); Y52('denizTasiTugla', 'Deniz Taşı Tuğla', 'deniz_tasi_tugla', { harita: 118 });
Y52('koyuDenizTasi', 'Koyu Deniz Taşı', 'koyu_deniz_tasi', { harita: 118 });
Y52('denizFeneriTasi', 'Deniz Feneri Taşı', 'deniz_feneri_tasi', { mesale: true, isik: 15, soguk: true, sertlik: 0.6, alet: null, seviye: 0, ses: 'cam', harita: 49 });
Y52('obsidyenTugla', 'Obsidyen Tuğla', 'obsidyen_tugla', { sertlik: 8, seviye: 4, harita: 120 });
Y52('isiltasTugla', 'Işıltaş Tuğla', 'isiltas_tugla', { mesale: true, isik: 13, sertlik: 1.2, harita: 116 });
Y52('kirmiziTugla', 'Kırmızı Tuğla', 'kirmizi_tugla', { harita: 114 }); Y52('sariTugla', 'Sarı Tuğla', 'sari_tugla', { harita: 116 }); Y52('siyahTugla', 'Siyah Tuğla', 'siyah_tugla', { harita: 120 });
Y52('tasKaro', 'Taş Karo', 'tas_karo'); Y52('terrazzo', 'Terrazzo Zemin', 'terrazzo', { harita: 49, sertlik: 1.4 });
Y52('arnavut', 'Arnavut Kaldırımı', 'arnavut', { sertlik: 2 }); Y52('tuglaYol', 'Tuğla Yol', 'tugla_yol', { harita: 114 });
/* Ahşap ve çatı */
Y52('balikSirti', 'Balıksırtı Parke', 'balik_sirti', AHSAP52); Y52('koyuLambri', 'Koyu Ahşap Lambri', 'koyu_lambri', AHSAP52);
Y52('kutukKaplama', 'Kütük Kaplama', 'kutuk_kaplama', { ...AHSAP52, harita: 8 });
Y52('kiremitCati', 'Kiremit Çatı', 'kiremit_cati', { harita: 114, sertlik: 1.5 }); Y52('maviKiremit', 'Mavi Kiremit Çatı', 'mavi_kiremit', { harita: 118, sertlik: 1.5 });
/* Metal ve maden blokları (dokuz külçe ya da parça bir blok) */
Y52('bakirBlok', 'Bakır Blok', 'bakir_blok', { sertlik: 3, harita: 163 }); Y52('kesmeBakir', 'Kesme Bakır', 'kesme_bakir', { sertlik: 3, harita: 163 });
Y52('yipranmisBakir', 'Yıpranmış Bakır', 'yipranmis_bakir', { sertlik: 3, harita: 117 }); Y52('yesilBakir', 'Yeşillenmiş Bakır', 'yesil_bakir', { sertlik: 3, harita: 117 });
Y52('demirBlok', 'Demir Blok', 'demir_blok', { sertlik: 4, seviye: 2, harita: 49 }); Y52('elmasBlok', 'Elmas Blok', 'elmas_blok', { sertlik: 5, seviye: 3, harita: 118 });
Y52('komurBlok', 'Kömür Bloğu', 'komur_blok', { sertlik: 3, harita: 120 });
Y52('kemikBlok', 'Kemik Bloğu', ['kemik_ust', 'kemik_yan', 'kemik_ust'], { sertlik: 1.6, harita: 49 });
Y52('balBlok', 'Bal Bloğu', 'bal_blok', { sertlik: 0.5, alet: null, seviye: 0, ses: 'yun', harita: 116 });
/* Cam ve dekor */
Y52('akvaryum', 'Akvaryum', ['akvaryum_ust', 'akvaryum', 'kalas_koyu'], { sertlik: 0.5, alet: null, seviye: 0, ses: 'cam', harita: 118 });
Y52('buzluCam', 'Buzlu Cam', 'buzlu_cam', { opak: false, kesik: true, ayniGizle: true, sertlik: 0.3, alet: null, seviye: 0, ses: 'cam', harita: 34 });
Y52('cerceveliCam', 'Ahşap Çerçeveli Cam', 'cerceveli_cam', { opak: false, kesik: true, ayniGizle: true, sertlik: 0.4, alet: null, seviye: 0, ses: 'cam', harita: 34 });
/* Boyanabilir aileler: sıva ve boyalı kalas (8 renk; eldeki boyayla sağ tıklanınca renk değişir) */
YAPI52.siva = ayir52(8); YAPI52.boyaliKalas = ayir52(8);
RENK8.forEach((r, c) => {
  blok(YAPI52.siva + c, { ad: `${r.ad} Sıva`, dok: 'siva_' + r.ek, sertlik: 1, alet: 'kazma', seviye: 0, ses: 'tas', harita: c ? 113 + c : 49 });
  blok(YAPI52.boyaliKalas + c, { ad: `${r.ad} Boyalı Kalas`, dok: 'boyali_kalas_' + r.ek, ...AHSAP52, harita: c ? 113 + c : 49 });
});
boyaAile(Array.from({ length: 8 }, (_, c) => YAPI52.siva + c)); boyaAile(Array.from({ length: 8 }, (_, c) => YAPI52.boyaliKalas + c));
/* Fenerler (masa, raf ve çitin üstüne de konur) */
for (const [k, ad, dok, o] of [['kagitFener', 'Kâğıt Fener', 'kagit_fener', { alet: null, sertlik: 0.3, ses: 'yun' }], ['tasFener', 'Taş Fener', 'tas_fener', { alet: 'kazma', sertlik: 1.5 }],
  ['demirFener', 'Demir Fener', 'demir_fener', { alet: 'kazma', sertlik: 1 }]])
  Y52(k, ad, dok, { cizim: C_SEKIL, kati: false, opak: false, sekil: 'fener', mesale: true, isik: 15, lamba: true, seviye: 0, ...o });
/* Merdiven, yarım blok ve duvar çeşitleri */
export const YAPI_MALZEME52 = [{ ad: 'Kuvars', taban: YAPI52.kuvars }, { ad: 'Traverten Tuğla', taban: YAPI52.travertenTugla }, { ad: 'Andezit', taban: YAPI52.andezitCilali },
  { ad: 'Kızıl Kumtaşı', taban: YAPI52.kizilKumtasiDuz }, { ad: 'Deniz Taşı', taban: YAPI52.denizTasiTugla }, { ad: 'Kırmızı Tuğla', taban: YAPI52.kirmiziTugla },
  { ad: 'Kiremit', taban: YAPI52.kiremitCati }, { ad: 'Obsidyen Tuğla', taban: YAPI52.obsidyenTugla }, { ad: 'Balıksırtı', taban: YAPI52.balikSirti }];
YAPI_MALZEME52.forEach(m => {
  const t = B[m.taban], o = yapiOrtak({ ...t, dok: t.dok }), mt = ayir52(8), yt = ayir52(2);
  m.merdiven = mt; m.yarim = yt;
  for (let f = 0; f < 4; f++) blok(mt + f, { ...o, ad: `${m.ad} Merdiven`, sekil: 'merdiven', yon: f, taban: mt, ters: mt + 4, gizli: f > 0, dusur: () => [[mt, 1]] });
  for (let f = 0; f < 4; f++) blok(mt + 4 + f, { ...o, ad: `${m.ad} Merdiven`, sekil: 'merdiven', yon: f, ust: 1, taban: mt, ters: mt + 4, gizli: true, dusur: () => [[mt, 1]] });
  for (let u = 0; u < 2; u++) blok(yt + u, { ...o, ad: `${m.ad} Yarım Blok`, sekil: 'yarim', ust: u, taban: yt, cift: m.taban, gizli: u > 0, dusur: () => [[yt, 1]] });
});
export const DUVAR_MALZEME52 = [{ ad: 'Kuvars Tuğla', taban: YAPI52.kuvarsTugla }, { ad: 'Traverten', taban: YAPI52.travertenTugla }, { ad: 'Kızıl Kumtaşı', taban: YAPI52.kizilKumtasi },
  { ad: 'Deniz Taşı', taban: YAPI52.denizTasiTugla }, { ad: 'Kırmızı Tuğla', taban: YAPI52.kirmiziTugla }, { ad: 'Obsidyen Tuğla', taban: YAPI52.obsidyenTugla }, { ad: 'Arnavut Kaldırımı', taban: YAPI52.arnavut }];
DUVAR_MALZEME52.forEach(m => { m.duvar = ayir52(1); blok(m.duvar, { ...yapiOrtak(B[m.taban]), ad: `${m.ad} Duvar`, sekil: 'duvar' }); });

/* Elektrikli cihazlar. Tüketiciler (tuketim, taban + 1 çalışan hâli) elektrik ağının genel kuralıyla açılır ve söner.
   LED panel: 8 renk, ışık verir. Projektör: güçlü ışık. Vantilatör: çevresini serinletir. Mutfak cihazları çalışırken bir pişirme istasyonudur;
   Radyo çalışırken sağ tıkla müzik çalar. Yönlü cihazların ön yüzü oyuncuya bakar (yon: 0-3, taban + yon * 2 + açık). */
CIHAZ52.led = ayir52(16);
RENK8.forEach((r, c) => {
  const id = CIHAZ52.led + c * 2, soguk = [0, 5, 6].includes(c);
  blok(id, { ad: `${r.ad} LED Panel`, dok: 'led_kapali_' + r.ek, sertlik: 0.8, alet: null, seviye: 0, ses: 'cam', elektrik: 'ledpanel', tuketim: 0.3, acik: 0, taban: id, dusur: () => [[id, 1]], harita: 2 });
  blok(id + 1, { ad: `${r.ad} LED Panel`, dok: 'led_' + r.ek, sertlik: 0.8, alet: null, seviye: 0, ses: 'cam', elektrik: 'ledpanel', tuketim: 0.3, acik: 1, taban: id, gizli: true,
    mesale: true, isik: 15, lamba: true, ...(soguk ? { soguk: true } : {}), dusur: () => [[id, 1]], harita: c ? 113 + c : 49 });
});
const yonlu52 = (k, ad, ek, acikEk, dokuF) => {
  const taban = ayir52(8); CIHAZ52[k] = taban;
  for (let v = 0; v < 4; v++) for (let a = 0; a < 2; a++) blok(taban + v * 2 + a, { ad, ...ek, dok: dokuF(a), onYon: (v + 2) % 4, yon: v, cihaz52: taban, taban: taban + v * 2, acik: a,
    gizli: v + a > 0, dusur: () => [[taban, 1]], ...(a ? acikEk : {}) });
};
yonlu52('projektor', 'Projektör', { sertlik: 1.5, alet: 'kazma', ses: 'tas', elektrik: 'projektor', tuketim: 1.5, harita: 2 }, { mesale: true, isik: 22, lamba: true },
  a => ({ ust: 'proj_yan', yan: 'proj_yan', alt: 'proj_yan', on: a ? 'proj_on_a' : 'proj_on' }));
CIHAZ52.vantilator = ayir52(2);
for (let a = 0; a < 2; a++) blok(CIHAZ52.vantilator + a, { ad: 'Vantilatör', dok: ['vant_ust', a ? 'vant_yan_a' : 'vant_yan', 'vant_ust'], sertlik: 1.5, alet: 'kazma', ses: 'tas', elektrik: 'vantilator', tuketim: 1,
  acik: a, taban: CIHAZ52.vantilator, gizli: a > 0, dusur: () => [[CIHAZ52.vantilator, 1]], harita: 2, ...(a ? { mesale: true, isik: 1, isi: [-9, 6] } : {}) });
/* Mutfak cihazlarının kutuları (piksel, 0-16; yön 0'da ön yüz +z) */
export const CIHAZ52_KUTU = {
  blender: [[4, 0, 4, 12, 4, 12], [5, 4, 5, 11, 13, 11], [5, 13, 5, 11, 14, 11]],
  kahve: [[3, 0, 3, 13, 12, 12], [4, 0, 12, 12, 1, 15]],
  tost: [[2, 0, 3, 14, 6, 13]],
  mikrodalga: [[1, 0, 3, 15, 9, 14]],
  dondurma: [[2, 0, 3, 14, 13, 13]],
  izgara: [[1, 0, 2, 15, 4, 14], [1, 4, 2, 15, 6, 4]],
  radyo: [[2, 0, 4, 14, 9, 12], [11, 9, 6, 12, 15, 7]]
};
const MUTFAK52 = [['blender', 'Blender', 'blender', {}], ['kahve', 'Kahve Makinesi', 'kahve', {}], ['tost', 'Tost Makinesi', 'tost', { isi: [3, 2] }], ['mikrodalga', 'Mikrodalga', 'mikrodalga', { mesale: true, isik: 5 }],
  ['dondurma', 'Dondurma Makinesi', 'dondurma', {}], ['izgara', 'Elektrikli Izgara', 'izgara', { mesale: true, isik: 6, isi: [6, 3] }], ['radyo', 'Radyo', null, { muzik: true }]];
for (const [k, ad, ist, ek] of MUTFAK52)
  yonlu52(k, ad, { cizim: C_SEKIL, opak: false, sekil: 'cihaz52', model: k, sertlik: 1, alet: null, ses: 'tas', elektrik: 'mutfak52', tuketim: k === 'radyo' ? 0.5 : 2, harita: 2 },
    { ...(ist ? { istasyon: ist } : {}), ...ek }, a => ({ ust: k + '_yan', yan: k + '_yan', alt: k + '_yan', on: k + (a ? '_on_a' : '_on') }));

/* Yeni ekinler (4 evre; olgun bitkiden ürün ve tohum düşer, tekrar: olgun bitkiye sağ tıklanınca ürün toplanır) */
for (const k of ['pirinc', 'patlican', 'patlicanTohumu', 'aycicegi', 'cayYapragi', 'cayFidesi', 'kahve', 'kakao']) ESYA52[k] = ayir52(1);
export const EKIN52 = [
  { k: 'celtik', ad: 'Çeltik', urun: ESYA52.pirinc, tohum: ESYA52.pirinc, adet: [2, 4], mevsim: [0.8, 1.3, 0.7, 0] },
  { k: 'patlican', ad: 'Patlıcan', urun: ESYA52.patlican, tohum: ESYA52.patlicanTohumu, adet: [1, 3], tekrar: true, mevsim: [0.7, 1.4, 0.6, 0] },
  { k: 'aycicegi', ad: 'Ayçiçeği', urun: ESYA52.aycicegi, tohum: ESYA52.aycicegi, adet: [3, 6], mevsim: [0.8, 1.5, 0.5, 0] },
  { k: 'cay', ad: 'Çay', urun: ESYA52.cayYapragi, tohum: ESYA52.cayFidesi, adet: [2, 4], tekrar: true, mevsim: [1.2, 1, 0.8, 0.2] },
  { k: 'kahve', ad: 'Kahve', urun: ESYA52.kahve, tohum: ESYA52.kahve, adet: [2, 4], tekrar: true, mevsim: [0.9, 1.2, 0.8, 0] },
  { k: 'kakao', ad: 'Kakao', urun: ESYA52.kakao, tohum: ESYA52.kakao, adet: [1, 3], tekrar: true, mevsim: [0.9, 1.3, 0.8, 0] }
];
EKIN52.forEach(E => {
  const b = E.taban = ayir52(4);
  for (let e = 0; e < 4; e++) blok(b + e, { ...T0, ad: e === 3 ? `Olgun ${E.ad}` : `${E.ad} Fidesi`, dok: E.k + e, ekin: e, sonraki: e < 3 ? b + e + 1 : 0, gizli: true, mevsim: E.mevsim, tarimTur: E.k,
    ...(E.tekrar && e === 3 ? { tekrar: b + 2, urun: E.urun, urunAdet: E.adet } : {}), harita: 4,
    dusur: r => (e === 3 ? [[E.urun, E.adet[0] + Math.floor(r() * (E.adet[1] - E.adet[0] + 1))], ...(E.tohum !== E.urun ? [[E.tohum, 1 + Math.floor(r() * 2)]] : [])] : [[E.tohum, 1]]) });
  TARIM[E.k] = E;
});
/* Yabani tohumlar: saz çeltik, ot ve çalılar patlıcan, ayçiçeği ve çay, savan çalısı kahve, mangrov yaprağı kakao verebilir */
{
  const ek = (id, l) => { const b = B[id]; if (!b) return; const eski = b.dusur; b.dusur = r => { const o = eski ? [...eski(r)] : []; for (const [e, s] of l) if (r() < s) o.push([e, 1]); return o; }; };
  ek(DOGA41.saz, [[ESYA52.pirinc, 0.18]]); ek(DOGA41.cali, [[ESYA52.cayFidesi, 0.05], [ESYA52.patlicanTohumu, 0.05]]); ek(DOGA41.buyukCali, [[ESYA52.cayFidesi, 0.08]]);
  ek(DOGA41.savanCali, [[ESYA52.kahve, 0.08], [ESYA52.aycicegi, 0.06]]); ek(DOGA41.mangrovYaprak, [[ESYA52.kakao, 0.04]]); ek(25, [[ESYA52.aycicegi, 0.015], [ESYA52.patlicanTohumu, 0.012]]);
}

/* ---------- 0.53.0: Şebeke güncellemesi: tek bloklu elektrik parçaları ----------
   Kimlikler eski sıranın boş kalan 2073-2199 aralığından ayrılır (ayir53); yeni parçalar yalnızca bu bölümün sonuna eklenir.
   Mantık parçaları: alçak devre kutusu; bağlantı noktaları üstte (girişler batıda, çıkış doğuda). Açık hâl (taban + 1) gücü çıkışa geçirir. */
let ID53 = 2073;
const ayir53 = n => { const s = ID53; ID53 += n; return s; };
export const BLOK53 = {}, ESYA53 = {};
{
  const ort = { cizim: C_SEKIL, opak: false, sertlik: 0.8, alet: null, seviye: 0, ses: 'tas', harita: 2 };
  /* Zamanlayıcı: 4 süre (1, 2, 5, 10 sn) × açık; gücü sırayla bu sürelerle açıp keser */
  BLOK53.zaman = ayir53(8);
  for (let p = 0; p < 4; p++) for (let a = 0; a < 2; a++) blok(BLOK53.zaman + p * 2 + a, { ...ort, ad: 'Zamanlayıcı', dok: 'm_govde', sekil: 'mantik53', ust53: 'm_zaman', elektrik: 'zamanlayici', tuketim: 0.1,
    cesit: p, sure: [1, 2, 5, 10][p], acik: a, taban: BLOK53.zaman + p * 2, gizli: p + a > 0, dusur: () => [[BLOK53.zaman, 1]] });
  /* Gün Işığı Algılayıcı: kip 0 gece, 1 gündüz geçirir */
  BLOK53.fotosel = ayir53(4);
  for (let m = 0; m < 2; m++) for (let a = 0; a < 2; a++) blok(BLOK53.fotosel + m * 2 + a, { ...ort, ad: 'Gün Işığı Algılayıcı', dok: 'm_govde', sekil: 'mantik53', ust53: m ? 'm_fotosel_g' : 'm_fotosel', elektrik: 'fotosel', tuketim: 0.1,
    kip: m, acik: a, taban: BLOK53.fotosel + m * 2, gizli: m + a > 0, dusur: () => [[BLOK53.fotosel, 1]] });
  /* Mantık kapıları (iki giriş, bir çıkış), Röle ve Engelleyici (güç girişi + sinyal girişi), Elektrikli Düğme */
  for (const [k, ad, el, ust, ek] of [['ve', 'VE Kapısı', 'mantik', 'm_ve', { mantik: 've' }], ['veya', 'VEYA Kapısı', 'mantik', 'm_veya', { mantik: 'veya' }], ['xor', 'ÖZEL VEYA Kapısı', 'mantik', 'm_xor', { mantik: 'xor' }],
    ['role', 'Röle', 'role', 'm_role', {}], ['engel', 'Engelleyici', 'engelleyici', 'm_degil', {}], ['dugme', 'Elektrikli Düğme', 'edugme', 'm_dugme', {}]]) {
    const id = BLOK53[k] = ayir53(2);
    for (let a = 0; a < 2; a++) blok(id + a, { ...ort, ad, dok: 'm_govde', sekil: 'mantik53', ust53: ust, elektrik: el, tuketim: 0.1, acik: a, taban: id, gizli: a > 0, dusur: () => [[id, 1]], ...ek });
  }
  /* Sigorta: sınır (10, 25, 50, 100 E/sn) × atık; sınırı aşan güç 1 saniye sürerse atar ve ağı keser. Sağ tık: atıksa kurar, değilse sınırı değiştirir */
  BLOK53.sigorta = ayir53(8);
  for (let l = 0; l < 4; l++) for (let a = 0; a < 2; a++) blok(BLOK53.sigorta + l * 2 + a, { ...ort, ad: 'Sigorta', dok: 'm_govde', sekil: 'sigorta53', sertlik: 1.2, elektrik: 'sigorta',
    cesit: l, sinir: [10, 25, 50, 100][l], atik: a, taban: BLOK53.sigorta + l * 2, gizli: l + a > 0, dusur: () => [[BLOK53.sigorta, 1]] });
  /* Klima: duvara asılan iç ünite (yon: arkasının dayandığı duvarın tersi); çalışırken 7 blok içinde hissedilen sıcaklığı 22 °C'ye çeker */
  BLOK53.klima = ayir53(8);
  for (let f = 0; f < 4; f++) for (let a = 0; a < 2; a++) blok(BLOK53.klima + f * 2 + a, { ...ort, ad: 'Klima', dok: 'klima_yan', sekil: 'klima53', sertlik: 1.5, alet: 'kazma', elektrik: 'klima', tuketim: 2.5,
    klima53: true, yon: f, acik: a, taban: BLOK53.klima + f * 2, gizli: f + a > 0, dusur: () => [[BLOK53.klima, 1]], ...(a ? { mesale: true, isik: 1, klima: true } : {}) });
  /* Elektrikli Çit Ünitesi ve Elektrikli Çit: ünite çalışırken ona bitişik çit hattı (en çok 128 blok) elektriklenir; değen canavarlar çarpılır ve geri savrulur */
  BLOK53.citUnite = ayir53(2);
  for (let a = 0; a < 2; a++) blok(BLOK53.citUnite + a, { ad: 'Elektrikli Çit Ünitesi', dok: ['m_govde', a ? 'cit_unite_a' : 'cit_unite', 'm_govde'], sertlik: 2, alet: 'kazma', ses: 'tas', harita: 2,
    elektrik: 'citunite', tuketim: 4, acik: a, taban: BLOK53.citUnite, gizli: a > 0, dusur: () => [[BLOK53.citUnite, 1]] });
  BLOK53.ecit = ayir53(1);
  blok(BLOK53.ecit, { ad: 'Elektrikli Çit', dok: 'ecit_tel', cizim: C_SEKIL, opak: false, sertlik: 1.5, alet: 'kazma', seviye: 0, ses: 'tas', sekil: 'ecit', harita: 2 });
  /* 0.53.1: Kol ve Düğme elektrik ağına da bağlanır (giriş ve çıkış noktaları); mekanik devrelerdeki işlevleri aynen sürer */
  for (const id of [233, 234]) B[id].elektrik = 'kol';
  for (const id of [235, 236]) B[id].elektrik = 'dugme';
  /* Parçalar ve tozlar (eşya) */
  for (const k of ['motor', 'lityum', 'izolator', 'cip', 'ekran', 'demirTozu', 'bakirTozu', 'altinTozu']) ESYA53[k] = ayir53(1);
}

/* Hızlı erişim tabloları (0.18.0: blok kimlikleri 16 bittir; 256-511 eşyalara ayrılmıştır, yeni bloklar 512'den başlar) */
export const BLOK_UST = 4096;   // 0.31.0: 1024'ten 2048'e; 0.37.0: 4096'ya
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
  /* 0.41.0: devrik kütüklerin uç yüzleri (x ekseni: +x/-x, z ekseni: +z/-z) halkalıdır */
  if (b.devrik) { const h = T[b.devrik[0]]; if (b.devrik[1] === 0) { yuz[0] = h; yuz[1] = h; } else { yuz[4] = h; yuz[5] = h; } }
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
esya(294, { ad: 'Mektup', simge: 'mektup', yigin: 16, gorevEsyasi: true, ozellik: 'Görev eşyası: atılamaz, sandığa konamaz' });
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
esya(347, { ad: 'Köy Kolisi', simge: 'koli', yigin: 1, gorevEsyasi: true, ozellik: 'Görev eşyası: atılamaz, sandığa konamaz' });
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
/* 0.35.0: kumaş ve yeni yemekler */
esya(391, { ad: 'Kumaş', simge: 'kumas' });
esya(392, { ad: 'Lahana Sarması', simge: 'corba2', renk: '#7aa84a', tur: 'yiyecek', yemek: 9, kase: true, pismis: true });
esya(393, { ad: 'Soğan Çorbası', simge: 'corba2', renk: '#d8b060', tur: 'yiyecek', yemek: 6, kase: true, pismis: true, sicak: 40 });
esya(394, { ad: 'Mısır Ekmeği', simge: 'ekmek', renk: '#e8c040', tur: 'yiyecek', yemek: 6, pismis: true });
esya(395, { ad: 'Zeytinyağlı Biber', simge: 'corba2', renk: '#5aa83a', tur: 'yiyecek', yemek: 7, kase: true });
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
  serin: { ad: 'Serinlik', renk: '#8ad8f0', aciklama: 'Sıcağa karşı korur' },
  /* 0.36.0: yemeklerin verdiği yeni etkiler */
  kazmaHiz: { ad: 'Maden Gücü', renk: '#c8a04a', aciklama: 'Kazma ve kesme hızı %35 artar' },
  direnc: { ad: 'Direnç', renk: '#8a9aa8', aciklama: 'Alınan hasar %20 azalır' },
  sans: { ad: 'Şans', renk: '#5ad86a', aciklama: 'Cevher ve ganimetten fazladan ürün düşebilir' },
  tuy: { ad: 'Hafiflik', renk: '#e8e8f8', aciklama: 'Düşme hasarı yarıya iner' },
  odak: { ad: 'Odak', renk: '#b07aff', aciklama: 'Kazanılan deneyim %50 artar' }
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
/* 0.35.0: kıyafetler de yıpranır (dayanım), örste onarılır ve Koruma dışındaki zırh büyülerini alabilir */
KIYAFETLER.forEach(([id, ad, parca, renk, sekil, isi]) => esya(id, { ad, tur: 'kiyafet', yigin: 1, simge: 'kiyafet' + parca, renk, kiyafet: { parca, sekil, dayanim: [90, 140, 120, 100][parca] }, isi, alet: null }));

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
esya(473, { ad: 'Çakmak', tur: 'cakmak', yigin: 1, simge: 'cakmak2', ozellik: 'Odun yığınını kamp ateşine çevirir · Şömineyi ve balkabağı fenerini yakar · Ot, çalı ve örümcek ağını yakıp temizler · Buzu eritir · Canlıları tutuşturur',
  alet: { tur: 'cakmak', seviye: 0, hiz: 1, dayanim: 128, hasar: 1 } });
esya(474, { ad: 'Kor Kılıcı', tur: 'alet', yigin: 1, simge: 'kilic', renk: '#ff6a2a', yakar: true, ozellik: 'Vurulan canlıyı tutuşturur',
  alet: { tur: 'kilic', seviye: 5, hiz: 8, dayanim: 1300, hasar: 8 } });

/* 0.21.0: tarım ve hayvancılık eşyaları */
esya(475, { ad: 'Balkabağı Çekirdeği', simge: 'cekirdek', ekin: 555 });
esya(476, { ad: 'Şeker', simge: 'toz', renk: '#f6f4ee' });
esya(477, { ad: 'Kova', simge: 'kova', yigin: 16, kova: true, ozellik: 'Sudan su alır, inekten süt sağar' });
esya(478, { ad: 'Su Kovası', simge: 'kova', ic: '#3a6ad8', yigin: 1, suKovasi: true, kap: 477, ozellik: 'Suyu koyar; lavı obsidyene çevirir' });
esya(479, { ad: 'Süt Kovası', simge: 'kova', ic: '#f4f4ee', yigin: 1, tur: 'yiyecek', yenir: true, yemek: 1, temizle: true, kap: 477, ozellik: 'İçilince zehri ve olumsuz etkileri giderir' });
esya(480, { ad: 'Yumurta', simge: 'yumurta', yigin: 16 });
esya(481, { ad: 'Makas', tur: 'alet', yigin: 1, simge: 'makas', ozellik: 'Koyunu kırkar, yaprak keser, kovandan petek alır', alet: { tur: 'makas', seviye: 0, hiz: 6, dayanim: 238, hasar: 1 } });
esya(482, { ad: 'Bal Şişesi', simge: 'iksir', renk: '#e8a020', tur: 'yiyecek', yemek: 6, yigin: 16, kap: 331, zehirGider: true, ozellik: 'Zehri giderir' });
esya(483, { ad: 'Bal Peteği', simge: 'petek' });
yemek(484, 'Peynir', { simge: 'peynir', yemek: 4 });
yemek(485, 'Yoğurt', { simge: 'corba2', renk: '#f2f0e6', yemek: 5, kase: true }, 'yenilenme', 6);
/* ---------- 0.36.0: mutfak malzemeleri ve etkili yemekler ----------
   etkiler: [[etki, saniye], ...] — süreler aşçılık seviyesiyle uzar */
const Y36 = (id, ad, simge, renk, ek) => esya(id, { ad, simge, renk, ...ek });
Y36(396, 'Un', 'cuval', '#f2ede0'); Y36(397, 'Tuz', 'cuval', '#e8eef2'); Y36(398, 'Tereyağı', 'tereyag', '#f2d76a'); Y36(399, 'Kaymak', 'kavanoz', '#f6f0dc');
Y36(432, 'Hamur', 'hamur', '#efe2c0'); Y36(433, 'Salça', 'kavanoz', '#c8301e'); Y36(434, 'Pul Biber', 'baharat', '#b8281e'); Y36(435, 'Kıyma', 'kiyma', '#b8484a'); Y36(436, 'Bulgur', 'cuval', '#c8a050');
const Y36y = (id, ad, simge, renk, yemek, etkiler, ek = {}) => esya(id, { ad, simge, renk, tur: 'yiyecek', yemek, etkiler, pismis: true, yigin: ek.kase || ek.kap ? 1 : 16, ...ek,
  ozellik: [...etkiler.map(([k, t]) => `${ETKILER[k].ad} (${t} sn)`), ek.sicak ? 'Isıtır' : '', ek.serin ? 'Serinletir' : '', ek.temizle ? 'Olumsuz etkileri giderir' : ''].filter(Boolean).join(' · ') || null });
Y36y(437, 'Pide', 'pide', '#d8902a', 7, [['tokluk', 90]]);
Y36y(438, 'Simit', 'simit', '#b86a2a', 5, [['hiz', 45]]);
Y36y(439, 'Börek', 'pide', '#e8b860', 8, [['direnc', 120]]);
Y36y(440, 'Mantı', 'corba2', '#f2ead8', 11, [['guc', 120], ['tokluk', 60]], { kase: true });
Y36y(441, 'Lahmacun', 'pide', '#c8502a', 9, [['kazmaHiz', 150]]);
Y36y(442, 'Tavuk Sote', 'corba2', '#d8702a', 10, [['odak', 120]], { kase: true });
Y36y(443, 'Adana Kebap', 'kebap', '#a83a22', 10, [['guc', 150]]);
Y36y(444, 'Balık Ekmek', 'tabak', '#c89a5a', 9, [['nefes', 150]]);
Y36y(445, 'Hamsi Tava', 'tabak', '#9aa8b8', 7, [['nefes', 240]]);
Y36y(446, 'Kumpir', 'tabak', '#e8c060', 10, [['direnc', 150]]);
Y36y(447, 'Bulgur Pilavı', 'corba2', '#c8a050', 8, [['tokluk', 150]], { kase: true });
Y36y(448, 'Cacık', 'corba2', '#e8f2e0', 4, [['yenilenme', 20]], { kase: true, serin: 180, pismis: false });
Y36y(449, 'Sütlaç', 'corba2', '#f6ecd0', 6, [['yenilenme', 45]], { kase: true });
Y36y(505, 'Lokum', 'tatli', '#f0a0b8', 2, [['hiz', 60]]);
Y36y(506, 'Kurabiye', 'tatli', '#c88a4a', 2, [['odak', 45]]);
Y36y(507, 'Elmalı Turta', 'pide', '#c87a3a', 8, [['yenilenme', 40], ['sans', 60]]);
Y36y(508, 'Dondurma', 'tatli', '#f6e8e8', 4, [['tuy', 60]], { serin: 240, pismis: false });
Y36y(509, 'Bitki Çayı', 'icecek', '#8aa83a', 2, [['yenilenme', 15]], { kap: 331, temizle: true, pismis: false });
Y36y(510, 'Salep', 'icecek', '#f2e6cc', 3, [], { kap: 331, sicak: 300 });
Y36y(511, 'Turşu', 'kavanoz', '#7a9a3a', 3, [['tokluk', 90]], { kap: 331, pismis: false });
Y36y(337, 'Peynirli Omlet', 'tabak', '#f2d050', 7, [['odak', 90]]);
Y36y(338, 'Kahvaltı Tabağı', 'tabak', '#e8a03a', 12, [['tokluk', 180], ['yenilenme', 30]]);
Y36y(339, 'Kuzu Tandır', 'tabak', '#8a4a2a', 12, [['direnc', 180], ['guc', 60]]);
esya(320, { ad: 'Tarif Defteri', simge: 'defter', renk: '#8a3a2a', yigin: 1, ozellik: 'Sağ tık: aşçılık seviyesi ve yemek etkileri' });
/* ---------- 0.37.0: yeni eşyalar (kimlikleri sona ayrılır) ---------- */
export const ESYA37 = {};
const E37 = (k, o) => { const id = ayir(1); ESYA37[k] = id; esya(id, o); return id; };
E37('kagit', { ad: 'Kağıt', simge: 'kagit' });
E37('kitap', { ad: 'Kitap', simge: 'kitap', renk: '#8a3a2a' });
E37('murekkep', { ad: 'Mürekkep', simge: 'murekkep', yigin: 16 });
E37('civi', { ad: 'Çivi', simge: 'civi' });
E37('halat', { ad: 'Halat', simge: 'halat' });
E37('tugla', { ad: 'Tuğla', simge: 'tugla' });
E37('hancer', { ad: 'Hançer', tur: 'alet', yigin: 1, simge: 'hancer', renk: '#dcdcdc', ozellik: 'Kısa ve hafif bıçak',
  alet: { tur: 'kilic', seviye: 4, hiz: 6, dayanim: 220, hasar: 5 } });
E37('mizrak', { ad: 'Mızrak', tur: 'alet', yigin: 1, simge: 'mizrak', renk: '#dcdcdc', ozellik: 'Uzun saplı, ağır darbeli silah',
  alet: { tur: 'kilic', seviye: 4, hiz: 5, dayanim: 300, hasar: 8 } });
E37('cekic', { ad: 'Savaş Çekici', tur: 'alet', yigin: 1, simge: 'cekic', renk: '#b8b8c0', ozellik: 'En ağır yakın dövüş silahı',
  alet: { tur: 'kilic', seviye: 4, hiz: 4, dayanim: 420, hasar: 9.5 } });
const OBS = { seviye: 5, hiz: 9, dayanim: 2600, renk: '#3a2a5a' };
ALET_TURLERI.forEach(t => E37('obsidyen_' + t.tur, { ad: 'Obsidyen ' + t.ad, tur: 'alet', yigin: 1, simge: t.tur, renk: OBS.renk,
  alet: { tur: t.tur, seviye: OBS.seviye, hiz: OBS.hiz, dayanim: OBS.dayanim, hasar: t.hasar + 5 } }));
E37('obsidyen_capa', { ad: 'Obsidyen Çapa', tur: 'alet', yigin: 1, simge: 'capa', renk: OBS.renk, alet: { tur: 'capa', seviye: OBS.seviye, hiz: OBS.hiz, dayanim: OBS.dayanim, hasar: 3.5 } });
E37('durbun', { ad: 'Dürbün', simge: 'durbun', yigin: 1, ozellik: 'Sağ tık: yakınlaştırır / uzaklaştırır' });
E37('cepSaati', { ad: 'Cep Saati', simge: 'cepSaati', yigin: 1, ozellik: 'Sağ tık: günün saatini ve mevsimi gösterir' });
E37('havaiFisek', { ad: 'Havai Fişek', simge: 'fisek', yigin: 16, ozellik: 'Sağ tık: gökyüzüne fişek atar' });
/* 0.39.0: Büyülü Anahtar: Ada Bekçisi bırakır; kadim geçidi 30 dakika açar (tek kullanımlık) */
export const ESYA39 = {};
ESYA39.anahtar = ayir(1);
esya(ESYA39.anahtar, { ad: 'Büyülü Anahtar', simge: 'anahtar', yigin: 16, nadir: true, ozellik: 'Lanetli Ada’daki kadim geçide ya da diyardaki dönüş kapısına sağ tıklanınca iki geçidi 30 dakika açar · Tek kullanımlık' });
/* 0.45.0: özel oklar (yay hızlı erişim çubuğundaysa ilk sıradaki özel ok atılır; yoksa sıradan ok) */
export const ESYA45 = {};
ESYA45.atesOk = ayir(1); ESYA45.zehirOk = ayir(1);
esya(ESYA45.atesOk, { ad: 'Ateşli Ok', simge: 'ok', renk: '#ff7a2a', ozellik: 'Vurduğu canlıyı tutuşturur · Hızlı erişim çubuğundayken yayla önce bu ok atılır' });
esya(ESYA45.zehirOk, { ad: 'Zehirli Ok', simge: 'ok', renk: '#6fcf3a', ozellik: 'Vurduğu canlıyı 6 saniye zehirler · Hızlı erişim çubuğundayken yayla önce bu ok atılır' });
export const OKLAR = [287, ESYA45.atesOk, ESYA45.zehirOk];
/* 0.48.0: El Feneri: elde tutulunca bakılan yönü dar bir ışık konisiyle uzağa kadar aydınlatır */
export const ESYA48 = {};
ESYA48.elFeneri = ayir(1);
esya(ESYA48.elFeneri, { ad: 'El Feneri', simge: 'elFeneri', yigin: 1, ozellik: 'Elde tutulunca baktığınız yönü 24 blok uzağa kadar aydınlatır' });
yemek(486, 'Ayran', { simge: 'iksir', renk: '#f4f4ee', yemek: 3, kap: 331 }, 'hiz', 30);
yemek(487, 'Kek', { simge: 'kek', yemek: 12 }, 'tokluk', 120);
yemek(488, 'Balkabağı Turtası', { simge: 'turta', yemek: 8 });
yemek(489, 'Omlet', { simge: 'omlet', yemek: 7 }, 'guc', 20);
yemek(490, 'Baklava', { simge: 'baklava', yemek: 9 }, 'hiz', 45);
yemek(491, 'Haşlanmış Yumurta', { simge: 'yumurta', renk: '#f6f2e6', yemek: 4 });
/* 0.22.0: hayatta kalma */
esya(492, { ad: 'Yıldız Parçası', simge: 'yildiz', ozellik: 'Düşen meteorlardan elde edilir' });
esya(493, { ad: 'Eve Dönüş Tılsımı', tur: 'alet', yigin: 1, simge: 'tilsim', ozellik: 'Sağ tık basılı tutulunca doğma noktasına (son kullanılan yatak) ışınlar', alet: { tur: 'tilsim', seviye: 0, hiz: 1, dayanim: 8, hasar: 1 } });
esya(494, { ad: 'Atel', simge: 'atel', yigin: 16, tur: 'atel', ozellik: 'Kırık bacağı sarar: iyileşme hızlanır, yavaşlık azalır' });
/* Sıcak çorbalar soğuğa karşı ısıtır; ayran serinletir */
/* 0.24.0: elektrik parçaları */
esya(495, { ad: 'Devre Kartı', simge: 'devre', ozellik: 'Elektrikli cihazların yapımında kullanılır' });
esya(496, { ad: 'Bakır Bobin', simge: 'bobin', ozellik: 'Türbin, ocak ve ısıtıcı yapımında kullanılır' });
esya(503, { ad: 'Elektrik Kablosu', tur: 'kablo', simge: 'kablo', ozellik: 'Bir çıkış noktasından bir giriş noktasına çekilir; yüzeye sağ tık ara nokta ekler. Shift: düz çek, Shift + tekerlek: sarkma, R: iptal. Her 3 blok için 1 kablo harcanır' });
/* 0.25.0: çok bloklu cihazların eşyaları (sağ tıkla kurulur; R tuşu yönü çevirir) */
const CIHAZ_SIMGE = { gunes: 'cihazGunes', ruzgar: 'cihazRuzgar', su: 'cihazSu', bataryaK: 'cihazBatarya', bataryaO: 'cihazBatarya', bataryaB: 'cihazBatarya', taret: 'cihazTaret' };
for (const k of Object.keys(CIHAZ)) if (!CIHAZ_SIMGE[k]) CIHAZ_SIMGE[k] = 'c53_' + k;   // 0.53.0
for (const C of Object.values(CIHAZ)) esya(C.esya, { ad: C.ad, tur: 'cihaz', cihaz: C.tur, simge: CIHAZ_SIMGE[C.tur], boyut: { bataryaK: 0, bataryaO: 1, bataryaB: 2 }[C.tur], yigin: 16,
  ozellik: `${C.aciklama} · ${C.w} × ${C.d} taban, ${C.h} blok yükseklik` });
for (const [id, oz] of [[826, 'Ağı açar / keser: sağ tık ya da kol ve bakır tel sinyali. Duvara ya da zemine konur'], [860, 'Kömür, kütük, kalas ya da çubuk yakarak 20 E/sn üretir; çıkışına talep varken yakıt harcar. Sağ tık: yakıt deposu'], [872, 'Yakınında (7 blok) canlı varken gücü çıkışına geçirir; 0,5 E/sn harcar. Sağ tık: kip (herkes / oyuncular / canavarlar)'], [920, 'Çevresindeki 9 × 9 tarlayı sular ve ekinleri hızlandırır; 2 E/sn harcar'], [852, 'Bir girişteki gücü üç çıkışa, bağlı cihazların talebine göre böler'], [856, 'İki girişteki gücü toplayıp tek çıkıştan verir (ör. güneş panellerini birleştirmek için)'], [620, '0,5 E/sn harcar · Zemine, tavana ya da duvara konur'],
  [622, '4 E/sn harcar · Sağ tık: pişirme haznesi; çalışırken içine konan çiğ yiyecek ve fırın malzemelerini pişirir. Yakınındayken fırın ve kamp ateşi yerine geçer, kömür gerektirmez'], [624, '3 E/sn harcar · Çevresini ısıtır']]) E[id].ozellik = oz;
for (const id of [269, 463, 464, 465, 466, 470]) { E[id].sicak = 150; E[id].ozellik = (E[id].ozellik ? E[id].ozellik + ' · ' : '') + 'Isınma (150 saniye)'; }
E[486].serin = 150; E[486].ozellik += ' · Serinlik (150 saniye)';

/* ---------- 0.52.0: Bereket güncellemesi: ekin ürünleri, hayvan ürünleri, mutfak malzemeleri ve yemekler (kimlikler ayir52 sırasıyla) ---------- */
{
  const E52 = (k, o) => { const id = ESYA52[k] ?? (ESYA52[k] = ayir52(1)); esya(id, o); return id; };
  const T52 = TARIM;
  /* Ekin ürünleri ve tohumlar */
  E52('pirinc', { ad: 'Pirinç', simge: 'tohum', renk: '#f2eee0', ekin: T52.celtik.taban, ozellik: 'Tarlaya ekilir · Pilav, sushi ve yayla çorbasında kullanılır' });
  E52('patlican', { ad: 'Patlıcan', simge: 'patlican', tur: 'yiyecek', yemek: 2 });
  E52('patlicanTohumu', { ad: 'Patlıcan Tohumu', simge: 'tohum', renk: '#e8dca0', ekin: T52.patlican.taban });
  E52('aycicegi', { ad: 'Ayçiçeği Çekirdeği', simge: 'tohum', renk: '#3a3632', ekin: T52.aycicegi.taban, ozellik: 'Tarlaya ekilir · Kavrulur ya da yağı çıkarılır' });
  E52('cayYapragi', { ad: 'Çay Yaprağı', simge: 'yaprak52', renk: '#3f8a2e' });
  E52('cayFidesi', { ad: 'Çay Fidesi', simge: 'fide', renk: '#2f7a2a', ekin: T52.cay.taban });
  E52('kahve', { ad: 'Kahve Çekirdeği', simge: 'tohum', renk: '#5a3418', ekin: T52.kahve.taban, ozellik: 'Tarlaya ekilir · Değirmende öğütülür' });
  E52('kakao', { ad: 'Kakao Çekirdeği', simge: 'kakao', ekin: T52.kakao.taban, ozellik: 'Tarlaya ekilir · Değirmende kakao tozu olur' });
  /* Hayvan ürünleri */
  const et = (k, ad, simge, renk, yemek, pismis) => E52(k, { ad, simge, renk, tur: 'yiyecek', yemek, ...(pismis ? { pismis: true } : {}) });
  et('keciEti', 'Çiğ Keçi Eti', 'et', '#c8504a', 2); et('keciEtiPismis', 'Pişmiş Keçi Eti', 'et', '#8a4a2a', 6, true);
  et('ordekEti', 'Çiğ Ördek Eti', 'but', '#e8b0a0', 2); et('ordekPismis', 'Kızarmış Ördek', 'but', '#b8703a', 7, true);
  et('hindiEti', 'Çiğ Hindi Eti', 'but', '#eab8a8', 3); et('hindiPismis', 'Kızarmış Hindi', 'but', '#c07a3a', 8, true);
  et('geyikEti', 'Çiğ Geyik Eti', 'et', '#a83a34', 3); et('geyikPismis', 'Geyik Bifteği', 'et', '#6a3418', 9, true);
  et('yabanEti', 'Çiğ Yaban Domuzu Eti', 'et', '#d0706a', 3); et('yabanPismis', 'Pişmiş Yaban Domuzu Eti', 'et', '#9a5a2a', 9, true);
  et('levrek', 'Çiğ Levrek', 'balik', '#8a9aa0', 2); et('levrekPismis', 'Levrek Izgara', 'balik', '#b8885a', 7, true);
  et('palamut', 'Çiğ Palamut', 'balik', '#3a5a8a', 2); et('palamutPismis', 'Palamut Izgara', 'balik', '#8a6a4a', 7, true);
  E52('boynuz', { ad: 'Geyik Boynuzu', simge: 'boynuz', ozellik: 'Geyiklerden düşer · Avize ve süs yapımında kullanılır' });
  E52('tilkiKurku', { ad: 'Tilki Kürkü', simge: 'kurk', renk: '#d8742a' });
  E52('ayiPostu', { ad: 'Ayı Postu', simge: 'kurk', renk: '#5a3a22' });
  E52('deveYunu', { ad: 'Deve Yünü', simge: 'yumak', renk: '#c8a070' });
  E52('keciSutu', { ad: 'Keçi Sütü Kovası', simge: 'kova', ic: '#f8f6ea', yigin: 1, tur: 'yiyecek', yenir: true, yemek: 2, temizle: true, kap: 477, ozellik: 'Keçiden kovayla sağılır · İçilince olumsuz etkileri giderir' });
  /* Mutfak malzemeleri */
  E52('aycicekYagi', { ad: 'Ayçiçek Yağı', simge: 'iksir', renk: '#f2d04a', kap: 331 });
  E52('kakaoTozu', { ad: 'Kakao Tozu', simge: 'cuval', renk: '#5a3418' });
  E52('kahveTozu', { ad: 'Kahve Tozu', simge: 'cuval', renk: '#3a2416' });
  E52('krema', { ad: 'Krema', simge: 'kavanoz', renk: '#faf6ea' });
  E52('mayonez', { ad: 'Mayonez', simge: 'kavanoz', renk: '#f6eec0' });
  E52('ketcap', { ad: 'Ketçap', simge: 'kavanoz', renk: '#c8281e' });
  E52('sucuk', { ad: 'Sucuk', simge: 'sucuk', tur: 'yiyecek', yemek: 3 });
  E52('keciPeyniri', { ad: 'Keçi Peyniri', simge: 'tereyag', renk: '#f8f4ea', tur: 'yiyecek', yemek: 3 });
  /* Yemekler ve içecekler (etkiler aşçılık seviyesiyle uzar) */
  const Y = (k, ad, simge, renk, yemek, etkiler, ek) => { ESYA52[k] = ayir52(1); Y36y(ESYA52[k], ad, simge, renk, yemek, etkiler, ek); };
  Y('cikolata', 'Çikolata', 'cikolata', '#5a3418', 3, [['odak', 45]]);
  Y('pilav', 'Pirinç Pilavı', 'corba2', '#f4f0e2', 8, [['tokluk', 150]], { kase: true });
  Y('karniyarik', 'Karnıyarık', 'tabak', '#5a2a4a', 11, [['guc', 120]]);
  Y('imamBayildi', 'İmam Bayıldı', 'tabak', '#7a3a5a', 9, [['yenilenme', 30]]);
  Y('patlicanKebabi', 'Patlıcan Kebabı', 'kebap', '#5a2a4a', 10, [['guc', 150]]);
  Y('menemen', 'Menemen', 'tabak', '#e8742a', 7, [['odak', 90]]);
  Y('sucukluYumurta', 'Sucuklu Yumurta', 'tabak', '#c84a2a', 8, [['guc', 60], ['tokluk', 60]]);
  Y('pizza', 'Pizza', 'pizza', '#d8402a', 12, [['tokluk', 120], ['sans', 60]]);
  Y('hamburger', 'Hamburger', 'hamburger', '#8a4a22', 12, [['guc', 90], ['tokluk', 60]]);
  Y('sandvic', 'Peynirli Sandviç', 'sandvic', '#f2d870', 7, [['hiz', 60]]);
  Y('tost', 'Kaşarlı Sucuklu Tost', 'sandvic', '#c8502a', 9, [['odak', 90]]);
  Y('patatesKizartmasi', 'Patates Kızartması', 'patatesK', '#f2c84a', 6, [['hiz', 45]]);
  Y('misirCorbasi', 'Mısır Çorbası', 'corba2', '#f2d050', 7, [['yenilenme', 15]], { kase: true, sicak: 200 });
  Y('domatesCorbasi', 'Domates Çorbası', 'corba2', '#d8402a', 7, [['yenilenme', 15]], { kase: true, sicak: 200 });
  Y('ezogelin', 'Ezogelin Çorbası', 'corba2', '#c8602a', 8, [['direnc', 90]], { kase: true, sicak: 240 });
  Y('yaylaCorbasi', 'Yayla Çorbası', 'corba2', '#f2eee0', 7, [['yenilenme', 20]], { kase: true, sicak: 200 });
  Y('cobanSalatasi', 'Çoban Salatası', 'salata', '#d8402a', 5, [['yenilenme', 10]], { kase: true, serin: 120, pismis: false });
  Y('meyveSalatasi', 'Meyve Salatası', 'salata', '#e8283a', 6, [['hiz', 45]], { kase: true, serin: 150, pismis: false });
  Y('sezarSalata', 'Sezar Salata', 'salata', '#8ac05a', 9, [['direnc', 90]], { kase: true, pismis: false });
  Y('sushi', 'Sushi', 'sushi', '#f2f0e8', 8, [['nefes', 180]], { pismis: false });
  Y('hindiDolmasi', 'Hindi Dolması', 'tabak', '#b8703a', 14, [['tokluk', 180], ['guc', 60]]);
  Y('portakalliOrdek', 'Portakallı Ördek', 'tabak', '#e8842a', 13, [['yenilenme', 40], ['sans', 90]]);
  Y('geyikYahnisi', 'Geyik Yahnisi', 'corba2', '#6a3418', 13, [['guc', 150], ['direnc', 90]], { kase: true, sicak: 300 });
  Y('yabanKizartmasi', 'Yaban Domuzu Kızartması', 'et', '#8a4a22', 11, [['guc', 120]]);
  Y('gozleme', 'Peynirli Gözleme', 'pide', '#f2e6b0', 8, [['tokluk', 90]]);
  Y('keciGozleme', 'Keçi Peynirli Gözleme', 'pide', '#f8f4ea', 9, [['odak', 90]]);
  Y('cay', 'Demli Çay', 'fincan', '#a8401a', 1, [['hiz', 60]], { kap: 331, sicak: 240 });
  Y('turkKahvesi', 'Türk Kahvesi', 'fincan', '#3a2416', 1, [['hiz', 90], ['odak', 60]], { kap: 331 });
  Y('filtreKahve', 'Filtre Kahve', 'icecek', '#3a2416', 1, [['hiz', 150]], { kap: 331, sicak: 120 });
  Y('latte', 'Sütlü Kahve', 'icecek', '#b8885a', 3, [['hiz', 90], ['yenilenme', 20]], { kap: 331 });
  Y('sicakCikolata', 'Sıcak Çikolata', 'icecek', '#6a3a1e', 4, [['yenilenme', 30]], { kap: 331, sicak: 300 });
  Y('milkshake', 'Çilekli Milkshake', 'icecek', '#f0a0b8', 4, [['hiz', 60]], { kap: 331, serin: 200 });
  Y('smoothie', 'Meyve Smoothie', 'icecek', '#c8283a', 3, [['yenilenme', 30]], { kap: 331, serin: 240 });
  Y('elmaSuyu', 'Elma Suyu', 'icecek', '#e8c050', 2, [['hiz', 30]], { kap: 331, serin: 150, pismis: false });
  Y('cikolataliDondurma', 'Çikolatalı Dondurma', 'kulah', '#6a3a1e', 4, [['odak', 60]], { serin: 300, pismis: false });
  Y('cilekliDondurma', 'Çilekli Dondurma', 'kulah', '#f0a0b8', 4, [['hiz', 60]], { serin: 300, pismis: false });
  Y('brownie', 'Brownie', 'tatli', '#4a2a16', 7, [['odak', 90]]);
  Y('cikolataliKek', 'Çikolatalı Kek', 'kek2', '#5a3418', 10, [['tokluk', 90], ['odak', 60]]);
  Y('waffle', 'Waffle', 'waffle', '#d8a050', 7, [['hiz', 60]]);
  Y('pankek', 'Pankek', 'pankek', '#e8b860', 6, [['yenilenme', 20]]);
  Y('krep', 'Çikolatalı Krep', 'pide', '#6a3a1e', 8, [['hiz', 60], ['odak', 30]]);
  Y('cheesecake', 'Cheesecake', 'kek2', '#f6eed8', 9, [['sans', 90]]);
  Y('tiramisu', 'Tiramisu', 'kek2', '#8a5a3a', 9, [['hiz', 90], ['odak', 90]]);
  Y('kunefe', 'Künefe', 'tabak', '#e8902a', 10, [['guc', 60], ['sans', 60]]);
  Y('revani', 'Revani', 'tatli', '#f2c060', 7, [['hiz', 45]]);
  Y('irmikHelvasi', 'İrmik Helvası', 'corba2', '#e8c070', 7, [['direnc', 60]], { kase: true });
  Y('asure', 'Aşure', 'corba2', '#8a4a2a', 9, [['yenilenme', 40], ['sans', 60]], { kase: true });
  Y('kavrulmusCekirdek', 'Kavrulmuş Çekirdek', 'tohum', '#4a4440', 2, [['odak', 30]]);
  Y('izgaraKofte', 'Izgara Köfte', 'kofte', '#6a3418', 10, [['guc', 90]]);
  Y('izgaraSebze', 'Izgara Sebze', 'tabak', '#7a8a3a', 6, [['yenilenme', 20]]);
  Y('tavukSis', 'Tavuk Şiş', 'kebap', '#d8902a', 9, [['guc', 60], ['direnc', 60]]);
  Y('sosisli', 'Sucuklu Sandviç', 'sosisli', '#c84a2a', 9, [['hiz', 45], ['tokluk', 45]]);
  Y('misirEkmegi', 'Mısır Ekmeği', 'pide', '#f2c43c', 6, [['tokluk', 60]]);
  Y('kakaoluPuding', 'Kakaolu Puding', 'corba2', '#6a3a1e', 6, [['yenilenme', 30]], { kase: true });
}

/* ---------- 0.53.0: Şebeke güncellemesi: elektrik parçaları, cevher tozları ve tek bloklu parçaların açıklamaları ---------- */
{
  const S = ESYA53;
  esya(S.motor, { ad: 'Elektrik Motoru', simge: 'motor53', ozellik: 'Dönen parçaları olan elektrikli makinelerin yapımında kullanılır' });
  esya(S.lityum, { ad: 'Lityum Hücre', simge: 'lityum53', ozellik: 'Yüksek kapasiteli enerji depolarının yapımında kullanılır' });
  esya(S.izolator, { ad: 'Seramik İzolatör', simge: 'izolator53', ozellik: 'Elektrik direklerinin ve paratonerin yapımında kullanılır' });
  esya(S.cip, { ad: 'Mantık Çipi', simge: 'cip53', ozellik: 'Mantık kapıları, zamanlayıcı ve algılayıcıların yapımında kullanılır' });
  esya(S.ekran, { ad: 'Ekran Paneli', simge: 'ekran53', ozellik: 'Televizyon, monitör ve güç ölçerin yapımında kullanılır' });
  esya(S.demirTozu, { ad: 'Demir Tozu', simge: 'toz53', renk: '#b8a294', ozellik: 'Taş kırıcıdan çıkar; fırında ya da ark ocağında Demir Külçe olur' });
  esya(S.bakirTozu, { ad: 'Bakır Tozu', simge: 'toz53', renk: '#d88a52', ozellik: 'Taş kırıcıdan çıkar; fırında ya da ark ocağında Bakır Külçe olur' });
  esya(S.altinTozu, { ad: 'Altın Tozu', simge: 'toz53', renk: '#f2cc48', ozellik: 'Taş kırıcıdan çıkar; fırında ya da ark ocağında Altın Külçe olur' });
  const B5 = BLOK53;
  for (const [id, oz] of [
    [B5.zaman, 'Girişindeki gücü sırayla açıp keser · Sağ tık: süre (1, 2, 5, 10 sn) · 0,1 E/sn harcar'],
    [B5.fotosel, 'Geceleri (ya da gündüzleri) gücü çıkışına geçirir · Sağ tık: kip · 0,1 E/sn harcar'],
    [B5.ve, 'İki girişin ikisinde de güç varken çıkışa güç verir · 0,1 E/sn harcar'],
    [B5.veya, 'Girişlerden en az birinde güç varken çıkışa güç verir · 0,1 E/sn harcar'],
    [B5.xor, 'Girişlerden yalnızca birinde güç varken çıkışa güç verir · 0,1 E/sn harcar'],
    [B5.role, 'Sinyal girişinde (ikinci giriş) güç varken güç girişindekini çıkışa geçirir · 0,1 E/sn harcar'],
    [B5.engel, 'Sinyal girişinde (ikinci giriş) güç yokken güç girişindekini çıkışa geçirir · 0,1 E/sn harcar'],
    [B5.dugme, 'Basılınca gücü 5 saniye çıkışa geçirir (kepenk ve alarm için) · 0,1 E/sn harcar'],
    [B5.sigorta, 'Sınırı aşan güç 1 saniye sürerse atar ve arkasındaki ağı keser · Sağ tık: atıksa kurar, değilse sınırı değiştirir (10 / 25 / 50 / 100 E/sn)'],
    [B5.klima, '2,5 E/sn harcar · Duvara asılır; 7 blok içinde sıcaklığı 22 °C\'ye çeker (yazın serinletir, kışın ısıtır)'],
    [B5.citUnite, '4 E/sn harcar · Bitişiğindeki elektrikli çit hattını (en çok 128 blok) elektrikler'],
    [B5.ecit, 'Çit ünitesine bağlanınca elektriklenir: değen canavarlar çarpılıp geri savrulur, oyuncular hafifçe çarpılır']]) E[id].ozellik = oz;
  /* 0.53.1 */
  E[233].ozellik = 'Sağ tıkla açılıp kapanır. Mekanik: açıkken bakır tele güç verir · Elektrik: açıkken girişindeki gücü çıkışına geçirir (şalter gibi)';
  E[235].ozellik = 'Sağ tıkla basılır. Mekanik: 1 saniye güç verir · Elektrik: basılınca girişindeki gücü 3 saniye çıkışına geçirir';
}

/* Örste onarım malzemesi */
/* 0.40.4: gerçekçi düşme hasarı (yarım kalp cinsinden; oyuncu canı 20). 3 bloğa kadar hasar yoktur, sonra yükseklikle hızla artar:
   4 blok 1,6 · 6 blok 5,2 · 8 blok 9,5 · 10 blok 14,4 · 12 blok 20 (tam can). Yumuşak zemin azaltır: yün, halı, yatak, minder ve
   saman balyası %80, yapraklar %50, kar %40. altId: inilen blok (kar katmanı varsa o). */
export function dusmeHasari(d, altId) {
  const a = d - 3; if (a <= 0) return 0;
  let n = a * 1.5 + 0.08 * a * a;
  const b = BLOKLAR[altId];
  if (b) { if (b.ses === 'yun' || altId === 52) n *= 0.2; else if (b.ses === 'kar') n *= 0.6; else if (/Yaprağı$/.test(b.ad || '')) n *= 0.5; }
  return n;
}
export function onarimMalzemesi(id) {
  if (id >= 300 && id < 320) return [[14, 38, 39], [15], [259], [261], [264]][Math.floor((id - 300) / 4)];
  if (id >= 340 && id < 345) return [[14, 38, 39], [15], [259], [261], [264]][id - 340];
  if (id >= 400 && id < 432) return [ZIRH_MALZEME[Math.floor((id - 400) / 4)].mal];
  if (E[id] && E[id].kiyafet) return [49, 282, 284, 391];   // 0.35.0: kıyafetler yün, deri, ip ya da kumaşla onarılır
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
  kirilmaz: { ad: 'Kırılmazlık', maks: 3, uygun: e => !!(e && (e.alet || e.zirh || e.kiyafet)), aciklama: 'Eşya daha geç yıpranır' }
};
const ROMA = ['', 'I', 'II', 'III', 'IV', 'V'];
export const romaRakam = n => ROMA[n] || String(n);
export const buyuSeviye = (s, k) => (s && s.buyu ? s.buyu[k] || 0 : 0);
export const buyuluMu = s => !!(s && s.buyu && Object.keys(s.buyu).length);
export const buyuMetinleri = s => (buyuluMu(s) ? Object.entries(s.buyu).filter(([k]) => BUYULER[k]).map(([k, n]) => `${BUYULER[k].ad} ${romaRakam(n)}`) : []);
export const uygunBuyuler = id => Object.keys(BUYULER).filter(k => BUYULER[k].uygun(E[id]));
/* Yığın kopyası için büyü nesnesi (boşsa undefined) */
export const buyuKopya = b => (b && typeof b === 'object' && Object.keys(b).length ? { ...b } : undefined);

/* 0.35.0: soğuk dengesi: giysilerin soğuktan koruma değerleri yaklaşık yarıya indirildi (tam kürk takım bile en soğuk bölgede tek başına yetmez) */
for (const e of Object.values(E)) if (e && e.isi && e.isi.y) e.isi = { ...e.isi, y: Math.max(0.5, Math.round(e.isi.y * 0.55 * 2) / 2) };
export const ESYALAR = E;
export const maksDayanim = e => (e ? (e.alet ? e.alet.dayanim : e.zirh ? e.zirh.dayanim : e.kiyafet ? e.kiyafet.dayanim : null) : null);
export const esyaBilgi = id => E[id] || null;
/* 0.47.0: malzeme sesleri: metal eşyalar ve cihazlar 'metal', buz blokları 'buz' sesini kullanır */
for (const b of B) if (b) {
  if (b.ses === 'tas' && ([139, 159, 165, 182, 1411, 1923, 1993].includes(b.id) || b.cihaz || b.elektrik || b.sekil === 'cihaz')) b.ses = 'metal';
  else if (b.ses === 'cam' && /Buz/.test(b.ad || '')) b.ses = 'buz';
}
/* 0.53.6: elektrikli ışıkların rengi: lamba sıcak beyaz, projektör soğuk beyaz, LED paneller kendi renginde */
for (const id of [621, 843, 845, 847, 849, 851]) if (B[id] && B[id].mesale) B[id].isikRenk = [1, 0.88, 0.7];
for (const b of B) if (b && b.mesale && b.elektrik === 'projektor') b.isikRenk = [0.94, 0.97, 1];
for (const r of RENK8) { const c = parseInt(r.renk.slice(1), 16), v = [(c >> 16) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255], m = Math.max(...v, 0.01);
  for (const b of B) if (b && b.mesale && b.elektrik === 'ledpanel' && b.ad === `${r.ad} LED Panel`) b.isikRenk = v.map(x => 0.35 + 0.65 * x / m); }
/* 0.53.1: Kol ve Düğme elektrikli olsa da taş sesini korur */
for (const id of [233, 234, 235, 236]) B[id].ses = 'tas';
