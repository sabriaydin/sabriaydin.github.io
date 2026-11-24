/* HungerMan - üretim tarifleri
   istasyon: null (her yerde), 'masa' (Üretim Masası yakınında), 'firin' (Fırın yakınında), 'ates' (Kamp Ateşi), 'simya' (Simya Masası), 'tencere' (Tencere)
   Girdi olarak eşya kimliği ya da grup adı ('kalas', 'kutuk') kullanılabilir. */
import { aletId, ESYALAR, ZIRH_MALZEME, KIYAFETLER, TARIM, VAZO_BOS, YUN_RENKLERI, YAPI_ID, YAPI_MALZEME, DUVAR_MALZEME, CIT_MALZEME, RENK8, MUTFAK, COKLU_ID, YAPI37, YAPI_MALZEME37, DUVAR_MALZEME37, ESYA37 } from '../bloklar.js';

export const GRUPLAR = {
  kalas: { ad: 'Herhangi bir kalas', idler: [14, 38, 39, YAPI_ID.akasyaKalas] },
  kutuk: { ad: 'Herhangi bir kütük', idler: [8, 10, 12, 144, 3005] }
};
export const ISTASYON_ADI = { masa: 'Üretim Masası', firin: 'Fırın', ates: 'Kamp Ateşi', simya: 'Simya Masası', tencere: 'Tencere', degirmen: 'Değirmen Taşı', taskesme: 'Taş Kesme Tezgâhı' };
export const ISTASYON_BLOK = { masa: 32, firin: 33, ates: 48, simya: 140, tencere: 232, degirmen: MUTFAK.degirmen, taskesme: COKLU_ID.tasKesme };
/* Tarifin istasyon koşulu: yok, tek istasyon ya da istasyonlardan biri */
export const istasyonlar = t => (!t.istasyon ? [] : Array.isArray(t.istasyon) ? t.istasyon : [t.istasyon]);
export const istasyonVar = (t, mevcut) => { const l = istasyonlar(t); return !l.length || l.some(k => mevcut.has(k)); };
export const istasyonMetni = t => istasyonlar(t).map(k => ISTASYON_ADI[k]).join(' veya ');
/* 0.24.0: yakında çalışan bir Elektrikli Ocak varsa fırın ve ateş tariflerinde kömür harcanmaz (ana.js yakın istasyonları bulurken ayarlar) */
export const ELOCAK = { aktif: false };
export const girdiListesi = t => (ELOCAK.aktif && istasyonlar(t).some(k => k === 'firin' || k === 'ates') && t.girdi.length > 1 ? t.girdi.filter(([g]) => g !== 257) : t.girdi);

export const KATEGORILER = [['hepsi', 'Tümü'], ['alet', 'Aletler'], ['savas', 'Savaş'], ['blok', 'Bloklar'], ['malzeme', 'Malzemeler'], ['yiyecek', 'Yiyecek ve Bakım'], ['yapi', 'Yapı'], ['mobilya', 'Mobilya'], ['giyim', 'Giyim'], ['mekanik', 'Mekanik'], ['elektrik', 'Elektrik']];

const R = [];
const t = (cikti, adet, girdi, istasyon, kategori) => R.push({ cikti, adet, girdi, istasyon: istasyon || null, kategori });

/* Bloklar */
t(14, 4, [[8, 1]], null, 'blok');
t(38, 4, [[10, 1]], null, 'blok');
t(39, 4, [[12, 1]], null, 'blok');
t(14, 4, [[144, 1]], null, 'blok');
t(14, 4, [[3005, 1]], null, 'blok');   // 0.41.0: mangrov kütüğü
t(32, 1, [['kalas', 4]], null, 'blok');
t(46, 4, [[256, 1], [257, 1]], null, 'blok');
t(33, 1, [[15, 8]], 'masa', 'blok');
t(35, 4, [[2, 4]], 'masa', 'blok');
t(37, 2, [[2, 2]], 'masa', 'blok');
t(24, 1, [[5, 4]], 'masa', 'blok');
t(34, 4, [[5, 4], [257, 1]], 'firin', 'blok');
t(2, 4, [[15, 4], [257, 1]], 'firin', 'blok');

/* Malzemeler */
t(256, 4, [['kalas', 2]], null, 'malzeme');
t(257, 1, [['kutuk', 1]], 'firin', 'malzeme');
t(259, 2, [[258, 2], [257, 1]], 'firin', 'malzeme');
t(261, 2, [[260, 2], [257, 1]], 'firin', 'malzeme');
t(263, 2, [[262, 2], [257, 1]], 'firin', 'malzeme');
t(270, 4, [['kalas', 3]], 'masa', 'malzeme');

/* Aletler: kazma, balta, kürek, kılıç */
const MAL = ['kalas', 15, 259, 261, 264];
MAL.forEach((m, mi) => {
  t(aletId(mi, 'kazma'), 1, [[m, 3], [256, 2]], 'masa', 'alet');
  t(aletId(mi, 'balta'), 1, [[m, 3], [256, 2]], 'masa', 'alet');
  t(aletId(mi, 'kurek'), 1, [[m, 1], [256, 2]], 'masa', 'alet');
  t(aletId(mi, 'kilic'), 1, [[m, 2], [256, 1]], 'masa', 'alet');
});

/* Yiyecek ve bakım */
t(269, 1, [[36, 2], [270, 1]], null, 'yiyecek');
t(268, 1, [[267, 4]], null, 'yiyecek');

/* Hayatta kalma ve savaş (2. aşama) */
t(48, 1, [[256, 3], [257, 1], ['kutuk', 3]], null, 'blok');
t(47, 1, [[49, 3], ['kalas', 3]], 'masa', 'blok');
t(284, 1, [[267, 3]], null, 'malzeme');
t(286, 1, [[256, 3], [284, 3]], 'masa', 'savas');
t(287, 4, [[256, 1], [283, 1], [285, 1]], null, 'savas');
const ZIRH_ADET = [5, 8, 7, 4];
ZIRH_MALZEME.slice(0, 4).forEach((m, mi) => ZIRH_ADET.forEach((a, pi) => t(400 + mi * 4 + pi, 1, [[m.mal, a]], 'masa', 'savas')));   // 0.33.0: yeni zırhların tarifleri dosyanın sonunda
/* Pişirme: kamp ateşi veya fırın */
for (const [cig, pismis] of [[271, 272], [273, 274], [275, 276], [277, 278], [279, 280]]) t(pismis, 1, [[cig, 1]], ['ates', 'firin'], 'yiyecek');

/* Köy ve tarım (3. aşama) */
t(293, 1, [[291, 3]], null, 'yiyecek');
t(52, 1, [[291, 9]], null, 'blok');
t(291, 9, [[52, 1]], null, 'malzeme');
t(50, 1, [['kalas', 8]], 'masa', 'blok');
t(51, 4, [[23, 4], [257, 1]], 'firin', 'blok');
t(290, 1, [[266, 1], [263, 4]], 'masa', 'yiyecek');
t(289, 1, [[34, 1], [36, 2], [265, 4]], ['ates', 'firin'], 'yiyecek');

/* Mağaralar (4. aşama) */
t(296, 3, [[295, 1]], null, 'malzeme');

/* Deniz (5. aşama) */
t(298, 1, [[297, 1]], ['ates', 'firin'], 'yiyecek');
t(452, 1, [[451, 1]], ['ates', 'firin'], 'yiyecek');
t(453, 1, [[256, 3], [284, 2]], 'masa', 'alet');
t(454, 1, [['kalas', 5], [256, 2]], 'masa', 'alet');
t(455, 1, [['kalas', 10], [49, 3], [284, 4], [256, 3]], 'masa', 'alet');
t(456, 1, [[34, 2], [259, 2], [284, 1]], 'masa', 'savas');
t(457, 1, [[282, 4], [284, 2]], 'masa', 'savas');
t(62, 1, [[65, 4]], null, 'blok');
t(63, 1, [[66, 4]], null, 'blok');
t(64, 1, [[67, 4]], null, 'blok');

/* İnşa blokları (0.11.0) */
[[14, 70, 82], [15, 74, 84], [35, 78, 86]].forEach(([mal, merdiven, yarim]) => {
  t(merdiven, 4, [[mal, 6]], 'masa', 'blok');
  t(yarim, 6, [[mal, 3]], 'masa', 'blok');
});
t(88, 3, [['kalas', 6]], 'masa', 'blok');
t(121, 2, [['kalas', 6]], 'masa', 'blok');
t(104, 3, [['kalas', 4], [256, 2]], 'masa', 'blok');
t(105, 1, [['kalas', 2], [256, 4]], 'masa', 'blok');
t(109, 16, [[34, 6]], 'masa', 'blok');
t(110, 3, [[256, 7]], 'masa', 'blok');
/* Boyalar ve renkli yün */
t(321, 2, [[26, 1]], null, 'malzeme');
t(323, 2, [[27, 1]], null, 'malzeme');
t(325, 2, [[44, 1]], null, 'malzeme');
t(324, 1, [[31, 2]], 'firin', 'malzeme');
t(327, 1, [[257, 1]], null, 'malzeme');
t(327, 2, [[451, 1]], null, 'malzeme');
t(322, 2, [[321, 1], [323, 1]], null, 'malzeme');
t(326, 2, [[321, 1], [325, 1]], null, 'malzeme');
t(326, 1, [[265, 3]], null, 'malzeme');
YUN_RENKLERI.forEach((r, i) => t(114 + i, 1, [[49, 1], [r.boya, 1]], null, 'blok'));
/* Tarım */
MAL.forEach((m, mi) => t(340 + mi, 1, [[m, 2], [256, 2]], 'masa', 'alet'));
t(330, 1, [[329, 1]], ['ates', 'firin'], 'yiyecek');
/* Örs ve simya */
t(139, 1, [[261, 8], [37, 2]], 'masa', 'blok');
t(140, 1, [[15, 3], [261, 1], [34, 1]], 'masa', 'blok');
t(156, 1, [[264, 2], [61, 2], [37, 4]], 'masa', 'blok');
t(159, 2, [[261, 1], [46, 1]], 'masa', 'blok');
/* 0.15.2: çöl tapınağı blokları */
t(160, 1, [[24, 1]], 'masa', 'blok');
t(161, 1, [[24, 1]], 'firin', 'blok');
t(162, 1, [[24, 1], [327, 1]], 'masa', 'blok');
t(163, 2, [[23, 2], [322, 1]], 'firin', 'blok');
t(164, 2, [[23, 2], [325, 1]], 'firin', 'blok');
t(178, 2, [[23, 2], [325, 1], [323, 1]], 'firin', 'blok');
t(165, 1, [[263, 9]], 'masa', 'blok');
t(263, 9, [[165, 1]], null, 'malzeme');
t(166, 4, [[24, 6]], 'masa', 'blok');
t(170, 6, [[24, 3]], 'masa', 'blok');
t(176, 2, [[24, 2]], 'masa', 'blok');
t(177, 6, [[24, 6]], 'masa', 'blok');
t(172, 1, [[161, 1], [178, 1], [263, 1]], 'masa', 'blok');
/* 0.15.3: haydut kampı blokları */
t(179, 2, [[49, 2]], 'masa', 'blok');
t(180, 2, [[179, 2], [321, 1]], 'masa', 'blok');
t(181, 1, [[14, 6], [261, 1]], 'masa', 'blok');
t(182, 16, [[261, 6]], 'masa', 'blok');
t(183, 1, [[52, 1], [321, 1]], 'masa', 'blok');
t(184, 2, [[8, 1]], 'masa', 'blok');
/* 0.15.4: buzul kulesi blokları */
t(186, 1, [[22, 4]], 'masa', 'blok');
t(185, 4, [[186, 4]], 'masa', 'blok');
t(196, 1, [[194, 2]], 'masa', 'blok');
t(190, 4, [[185, 6]], 'masa', 'blok');
t(194, 6, [[185, 3]], 'masa', 'blok');
t(187, 1, [[14, 6], [282, 3]], 'masa', 'blok');
t(188, 16, [[34, 6], [325, 1]], 'masa', 'blok');
t(189, 2, [[261, 1], [61, 1]], 'masa', 'blok');
t(197, 1, [[61, 1], [22, 1]], 'masa', 'blok');
/* 0.16.0: mobilyalar */
t(199, 2, [['kalas', 4], [256, 2]], 'masa', 'mobilya');
t(203, 1, [['kalas', 3], [256, 4]], 'masa', 'mobilya');
t(204, 1, [['kalas', 4], [114, 3]], 'masa', 'mobilya');
t(208, 3, [[49, 2]], 'masa', 'mobilya');
for (let i = 0; i < 7; i++) t(209 + i, 3, [[114 + i, 2]], 'masa', 'mobilya');
for (const [id, cicek] of [[216, 26], [217, 27], [218, 44]]) t(id, 1, [[23, 3], [cicek, 1]], 'masa', 'mobilya');
t(219, 1, [[261, 1], [46, 1], [49, 1]], 'masa', 'mobilya');
t(220, 1, [['kalas', 1], [49, 2], [324, 1]], 'masa', 'mobilya');
t(224, 1, [['kalas', 1], [49, 2], [325, 1]], 'masa', 'mobilya');
t(228, 1, [['kalas', 1], [49, 2], [321, 1]], 'masa', 'mobilya');
/* 0.17.0: mekanik bloklar */
t(233, 1, [[256, 1], [15, 1]], 'masa', 'mekanik');
t(235, 1, [[2, 1]], 'masa', 'mekanik');
t(237, 1, [['kalas', 2]], 'masa', 'mekanik');
t(239, 8, [[259, 1]], 'masa', 'mekanik');
t(241, 1, [[259, 4], [34, 1], [46, 1]], 'masa', 'mekanik');
t(243, 1, [[2, 3], [239, 2], [46, 1]], 'masa', 'mekanik');
t(251, 1, [['kalas', 8], [239, 1]], 'masa', 'mekanik');
t(252, 1, [[34, 3], ['kalas', 3], [259, 1]], 'masa', 'mekanik');
/* 0.16.0: mutfak, yemekler ve eyer */
t(232, 1, [[261, 5]], 'masa', 'mobilya');
t(462, 1, [[282, 5], [261, 1], [284, 2]], 'masa', 'malzeme');
t(463, 1, [[297, 1], [329, 1], [270, 1]], 'tencere', 'yiyecek');
t(464, 1, [[271, 1], [329, 1], [328, 1], [270, 1]], 'tencere', 'yiyecek');
t(465, 1, [[275, 1], [328, 1], [270, 1]], 'tencere', 'yiyecek');
t(466, 1, [[277, 1], [329, 1], [270, 1]], 'tencere', 'yiyecek');
t(470, 1, [[328, 1], [329, 1], [36, 1], [270, 1]], 'tencere', 'yiyecek');
t(467, 1, [[271, 1], [256, 1]], 'ates', 'yiyecek');
t(467, 1, [[277, 2], [256, 1]], 'ates', 'yiyecek');
t(468, 1, [[272, 1], [293, 1]], ['ates', 'tencere'], 'yiyecek');
t(469, 1, [[293, 1], [265, 3]], null, 'yiyecek');
t(198, 2, [[22, 1]], 'masa', 'blok');
t(331, 3, [[34, 3]], null, 'malzeme');
t(332, 1, [[331, 1], [283, 1], [265, 2]], 'simya', 'yiyecek');
t(333, 1, [[331, 1], [328, 2], [61, 1]], 'simya', 'yiyecek');
t(334, 1, [[331, 1], [297, 1], [299, 1]], 'simya', 'yiyecek');
t(335, 1, [[331, 1], [257, 2], [263, 1]], 'simya', 'yiyecek');
t(336, 1, [[331, 1], [450, 1], [296, 2]], 'simya', 'yiyecek');

/* 0.18.0: Yeraltı Diyarı */
t(473, 1, [[261, 1], [285, 1]], null, 'alet');
t(523, 1, [[2, 3], [239, 1], [46, 2]], 'masa', 'mekanik');   // 0.20.0: Geciktirici
/* 0.21.0: tarım ve hayvancılık */
t(475, 4, [[559, 1]], null, 'malzeme');
t(476, 1, [[568, 1]], null, 'malzeme');
t(477, 1, [[261, 3]], 'masa', 'alet');
t(481, 1, [[261, 2]], null, 'alet');
t(564, 1, [[560, 1], [46, 1]], null, 'blok');
t(569, 1, [['kalas', 6], [483, 3]], 'masa', 'blok');
t(484, 3, [[479, 1]], 'tencere', 'yiyecek');
t(485, 2, [[479, 1], [270, 2]], 'tencere', 'yiyecek');
t(486, 2, [[485, 1], [331, 2]], null, 'yiyecek');
t(487, 1, [[479, 1], [476, 2], [480, 1], [291, 3]], 'masa', 'yiyecek');
t(488, 1, [[559, 1], [476, 1], [480, 1]], 'firin', 'yiyecek');
t(489, 1, [[480, 2], [484, 1]], 'tencere', 'yiyecek');
t(490, 2, [[291, 3], [482, 1], [476, 1]], 'firin', 'yiyecek');
t(491, 1, [[480, 1]], 'tencere', 'yiyecek');
/* 0.24.0: elektrik */
t(495, 1, [[259, 2], [263, 1]], 'masa', 'elektrik');
t(496, 2, [[259, 4], [256, 1]], 'masa', 'elektrik');
t(503, 8, [[259, 1], [267, 2]], 'masa', 'elektrik');
t(497, 1, [[34, 6], [495, 1], [261, 2]], 'masa', 'elektrik');
t(498, 1, [[261, 10], [496, 4], [495, 2]], 'masa', 'elektrik');
t(499, 1, [['kalas', 12], [496, 3], [261, 2]], 'masa', 'elektrik');
t(500, 1, [[259, 4], [257, 2], [495, 1]], 'masa', 'elektrik');
t(501, 1, [[261, 6], [263, 2], [495, 1]], 'masa', 'elektrik');
t(502, 1, [[261, 10], [264, 1], [495, 2]], 'masa', 'elektrik');
t(826, 1, [[503, 2], [233, 1], [261, 1]], 'masa', 'elektrik');
t(852, 1, [[503, 2], [259, 2], [495, 1]], 'masa', 'elektrik');
t(856, 1, [[503, 2], [259, 2], [495, 1]], 'masa', 'elektrik');
t(860, 1, [[261, 8], [496, 3], [15, 6]], 'masa', 'elektrik');
t(504, 1, [[261, 10], [495, 3], [286, 1], [287, 16]], 'masa', 'elektrik');
t(872, 1, [[495, 1], [34, 1], [259, 2]], 'masa', 'elektrik');
t(920, 1, [[259, 4], [477, 1], [495, 1]], 'masa', 'elektrik');
t(620, 2, [[34, 2], [259, 1], [263, 1]], 'masa', 'elektrik');
t(622, 1, [[15, 6], [496, 2], [261, 2]], 'masa', 'elektrik');
t(624, 1, [[261, 3], [496, 3]], 'masa', 'elektrik');
/* 0.22.0: hayatta kalma */
t(494, 1, [[256, 3], [284, 1]], null, 'yiyecek');
t(493, 1, [[492, 3], [263, 2], [284, 1]], 'masa', 'alet');
t(595, 1, [[492, 4], [34, 1]], 'masa', 'blok');
t(514, 1, [[471, 4]], null, 'blok');
t(518, 4, [[512, 4]], 'firin', 'blok');
t(519, 1, [[518, 2]], 'masa', 'blok');
t(474, 1, [[472, 3], [264, 1], [256, 1]], 'masa', 'savas');
t(335, 1, [[331, 1], [472, 1]], 'simya', 'yiyecek');

/* ---------- 0.31.0: Yapı ve Dekorasyon (sona eklenir; tarif sırası favorilerle uyumlu kalır) ---------- */
const Y = YAPI_ID;
t(Y.akasyaKalas, 4, [[144, 1]], null, 'blok');
t(Y.cilaliTas, 4, [[2, 4], [257, 1]], 'firin', 'blok');
t(Y.parkeZemin, 4, [['kalas', 4]], 'masa', 'yapi');
t(Y.kareliZemin, 4, [[37, 2], [257, 2]], 'masa', 'yapi');
/* Merdiven, yarım blok, duvar ve çit */
YAPI_MALZEME.forEach(m => { t(m.merdiven, 4, [[m.taban, 6]], 'masa', 'yapi'); t(m.yarim, 6, [[m.taban, 3]], 'masa', 'yapi'); });
DUVAR_MALZEME.forEach(m => t(m.duvar, 6, [[m.taban, 6]], 'masa', 'yapi'));
CIT_MALZEME.forEach(m => t(m.cit, 3, [[m.taban, 4], [256, 2]], 'masa', 'yapi'));
/* Renkli cam, pişmiş kil ve beton */
t(Y.kil, 4, [[23, 4], [257, 1]], 'firin', 'blok');
t(Y.beton, 8, [[5, 4], [6, 4]], 'masa', 'blok');
t(346, 2, [[296, 1]], null, 'malzeme');
YUN_RENKLERI.forEach((r, i) => {
  t(Y.cam + i, 8, [[34, 8], [r.boya, 1]], 'masa', 'blok');
  t(Y.bolme + i, 16, [[Y.cam + i, 6]], 'masa', 'blok');
  t(Y.kil + i + 1, 8, [[Y.kil, 8], [r.boya, 1]], 'masa', 'blok');
  t(Y.beton + i + 1, 8, [[Y.beton, 8], [r.boya, 1]], 'masa', 'blok');
});
/* Mobilya ve süs */
t(Y.raf, 2, [['kalas', 3], [256, 2]], 'masa', 'mobilya');
RENK8.forEach((r, c) => {
  t(Y.perde + c * 8, 1, [[c ? 114 + c - 1 : 49, 3], [256, 1]], 'masa', 'mobilya');
  t(Y.sancak + c * 4, 1, [[c ? 114 + c - 1 : 49, 6], [256, 1]], 'masa', 'mobilya');
});
t(Y.mum, 2, [[483, 1], [284, 1]], null, 'mobilya');
t(Y.avize, 1, [[261, 4], [263, 1], [Y.mum, 4]], 'masa', 'mobilya');
t(Y.somine, 1, [[35, 8], [37, 1], ['kutuk', 2]], 'masa', 'mobilya');
t(Y.dolap, 1, [['kalas', 6], [50, 1]], 'masa', 'mobilya');
t(Y.sehpa, 1, [['kalas', 2], [256, 2]], 'masa', 'mobilya');
t(Y.vazo, 1, [[Y.kil, 2], [26, 1], [27, 1]], 'masa', 'mobilya');
/* Yapı Planı */
t(345, 1, [[256, 2], [282, 1], [325, 1]], 'masa', 'alet');

/* ---------- 0.33.0: kıyafetler ve yeni zırhlar (sona eklenir) ---------- */
const KIYAFET_TARIF = { 348: [[49, 2]], 349: [[291, 8]], 350: [[49, 3], [282, 1]], 351: [[284, 5]], 352: [[49, 5]], 353: [[282, 6]], 354: [[49, 5], [282, 4]], 355: [[284, 7]],
  356: [[284, 4]], 357: [[49, 4]], 358: [[49, 4], [282, 3]], 359: [[284, 3]], 360: [[282, 1], [284, 1]], 361: [[282, 2]], 362: [[49, 2], [282, 2]] };
KIYAFETLER.forEach(([id]) => t(id, 1, KIYAFET_TARIF[id], 'masa', 'giyim'));
ZIRH_MALZEME.slice(4).forEach((m, j) => ZIRH_ADET.forEach((a, pi) => t(416 + j * 4 + pi, 1, [[m.mal, a], ...(m.ek ? [[m.ek[0], Math.max(1, Math.round(m.ek[1] * a / 6))]] : [])], 'masa', 'savas')));

/* ---------- 0.34.0: tarım (sona eklenir) ---------- */
t(388, 1, [[261, 3], [256, 2]], 'masa', 'alet');
t(389, 1, [[264, 3], [256, 2]], 'masa', 'alet');
t(TARIM.kompost, 1, [['kalas', 7]], 'masa', 'blok');
t(284, 3, [[372, 2]], null, 'malzeme');
t(381, 1, [[380, 6], [331, 1]], 'masa', 'malzeme');
t(384, 1, [[367, 1]], 'ates', 'yiyecek');
t(385, 2, [[368, 4]], 'firin', 'yiyecek');
t(386, 1, [[379, 3], [331, 1]], 'masa', 'yiyecek');
t(382, 1, [[363, 2], [365, 1], [480, 2], [270, 1]], 'tencere', 'yiyecek');
t(383, 1, [[363, 1], [365, 1], [369, 1], [270, 1]], null, 'yiyecek');
t(387, 1, [[266, 1], [378, 2], [374, 2], [270, 1]], null, 'yiyecek');
t(377, 2, [[376, 1]], null, 'malzeme');

/* ---------- 0.35.0: kumaş, yeni yemekler (sona eklenir) ---------- */
t(391, 1, [[372, 3]], 'masa', 'malzeme');
t(351, 1, [[391, 3]], 'masa', 'giyim'); t(356, 1, [[391, 3]], 'masa', 'giyim'); t(355, 1, [[391, 4]], 'masa', 'giyim'); t(359, 1, [[391, 2]], 'masa', 'giyim');
t(392, 1, [[370, 1], [369, 1], [381, 1], [270, 1]], 'tencere', 'yiyecek');
t(393, 1, [[369, 3], [270, 1]], 'tencere', 'yiyecek');
t(394, 1, [[367, 3]], 'firin', 'yiyecek');
t(VAZO_BOS, 1, [[YAPI_ID.kil, 2]], 'masa', 'mobilya');
t(395, 1, [[365, 2], [381, 1], [270, 1]], null, 'yiyecek');

/* ---------- 0.36.0: mutfak, malzemeler ve etkili yemekler (sona eklenir) ---------- */
const M = MUTFAK;
t(M.degirmen, 1, [[2, 6], [256, 2]], 'masa', 'mobilya');
t(M.tezgah, 1, [['kalas', 4], [2, 2]], 'masa', 'mobilya');
t(M.kiler, 1, [['kalas', 6], [261, 1]], 'masa', 'mobilya');
t(M.fici, 1, [['kalas', 6], [261, 2]], 'masa', 'mobilya');
t(M.tandir, 1, [[960, 6], [23, 2]], 'masa', 'mobilya');
t(M.semaver, 1, [[259, 4], [261, 1]], 'masa', 'mobilya');
t(M.sepet, 1, [[568, 4], [293, 1]], 'masa', 'mobilya');
t(M.piknik, 1, [[568, 6], [391, 1]], 'masa', 'mobilya');
t(M.tabak, 2, [[960, 1]], 'masa', 'mobilya');
t(M.feslegen, 1, [[960, 1], [3, 1], [9, 2]], 'masa', 'mobilya');
t(M.sarimsak, 1, [[369, 3], [284, 1]], null, 'mobilya');
t(M.baharat, 1, [['kalas', 2], [434, 2], [397, 1]], 'masa', 'mobilya');
t(M.kavanoz, 1, [[331, 3], [380, 2]], null, 'mobilya');
t(M.bal, 1, [[331, 1], [483, 2]], null, 'mobilya');
t(M.unCuval, 1, [[391, 2], [396, 6]], 'masa', 'mobilya');
t(M.tuzCuval, 1, [[391, 2], [397, 6]], 'masa', 'mobilya');
t(320, 1, [[282, 1], [391, 2], [256, 1]], 'masa', 'alet');
/* Malzemeler: değirmende öğütülür */
t(396, 2, [[291, 3]], 'degirmen', 'malzeme');
t(397, 1, [[478, 1]], 'ates', 'malzeme');
t(436, 2, [[291, 2], [478, 1]], 'tencere', 'malzeme');
t(434, 3, [[365, 2]], 'degirmen', 'malzeme');
t(435, 2, [[271, 1]], 'degirmen', 'malzeme');
t(435, 2, [[277, 1]], 'degirmen', 'malzeme');
t(398, 1, [[479, 1]], 'masa', 'malzeme');
t(399, 2, [[479, 1]], 'ates', 'malzeme');
t(432, 3, [[396, 2], [478, 1], [397, 1]], 'masa', 'malzeme');
t(433, 1, [[363, 4], [397, 1], [331, 1]], 'tencere', 'malzeme');
/* Fırın ve tandır işleri */
t(437, 1, [[432, 1], [484, 1], [480, 1]], 'firin', 'yiyecek');
t(438, 3, [[432, 1], [476, 1]], 'firin', 'yiyecek');
t(439, 2, [[432, 2], [484, 1], [398, 1]], 'firin', 'yiyecek');
t(441, 2, [[432, 1], [435, 1], [363, 1], [365, 1]], 'firin', 'yiyecek');
t(443, 1, [[435, 2], [434, 1], [256, 1]], 'ates', 'yiyecek');
t(446, 1, [[329, 1], [398, 1], [484, 1]], 'firin', 'yiyecek');
t(507, 1, [[432, 1], [266, 3], [476, 1]], 'firin', 'yiyecek');
t(506, 4, [[396, 2], [398, 1], [476, 1]], 'firin', 'yiyecek');
t(339, 1, [[277, 2], [397, 1], [369, 1]], 'firin', 'yiyecek');
/* Tencere işleri */
t(440, 1, [[432, 1], [435, 1], [485, 1], [270, 1]], 'tencere', 'yiyecek');
t(442, 1, [[275, 1], [363, 1], [365, 1], [270, 1]], 'tencere', 'yiyecek');
t(447, 1, [[436, 2], [398, 1], [270, 1]], 'tencere', 'yiyecek');
t(449, 1, [[479, 1], [476, 1], [396, 1], [270, 1]], 'tencere', 'yiyecek');
t(505, 6, [[476, 3], [396, 1], [478, 1]], 'tencere', 'yiyecek');
t(510, 1, [[479, 1], [476, 1], [331, 1]], 'tencere', 'yiyecek');
t(509, 1, [[9, 2], [27, 1], [478, 1], [331, 1]], 'tencere', 'yiyecek');
/* Ateş ve tezgâh işleri */
t(444, 1, [[298, 1], [293, 1], [369, 1]], 'masa', 'yiyecek');
t(445, 1, [[297, 2], [396, 1], [381, 1]], 'ates', 'yiyecek');
t(337, 1, [[480, 2], [484, 1], [398, 1]], 'ates', 'yiyecek');
t(338, 1, [[484, 1], [380, 2], [480, 1], [363, 1], [293, 1]], 'masa', 'yiyecek');
t(448, 1, [[485, 1], [397, 1], [478, 1], [270, 1]], 'masa', 'yiyecek');
t(508, 2, [[479, 1], [476, 1], [374, 2], [22, 1]], 'masa', 'yiyecek');
t(511, 1, [[363, 2], [365, 1], [397, 1], [331, 1]], 'masa', 'yiyecek');
t(M.pasta, 1, [[396, 3], [480, 2], [476, 2], [374, 3], [399, 1]], 'firin', 'yiyecek');

/* ---------- 0.37.0: mobilya, dekor, yapı blokları ve yeni eşyalar (sona eklenir) ---------- */
const C = COKLU_ID, Y7 = YAPI37, E7 = ESYA37;
/* Malzemeler ve aletler */
t(E7.kagit, 3, [[568, 3]], 'masa', 'malzeme');
t(E7.kitap, 1, [[E7.kagit, 3], [282, 1]], null, 'malzeme');
t(E7.murekkep, 1, [[257, 1], [331, 1], [478, 1]], null, 'malzeme');
t(E7.civi, 8, [[261, 1]], 'masa', 'malzeme');
t(E7.halat, 1, [[284, 3]], null, 'malzeme');
t(E7.tugla, 1, [[23, 1]], 'firin', 'malzeme');
t(E7.hancer, 1, [[261, 1], [256, 1]], 'masa', 'savas');
t(E7.mizrak, 1, [[261, 1], [256, 3], [285, 1]], 'masa', 'savas');
t(E7.cekic, 1, [[261, 5], [256, 2]], 'masa', 'savas');
t(E7.obsidyen_kazma, 1, [[515, 3], [264, 1], [256, 2]], 'masa', 'alet');
t(E7.obsidyen_balta, 1, [[515, 3], [264, 1], [256, 2]], 'masa', 'alet');
t(E7.obsidyen_kurek, 1, [[515, 1], [264, 1], [256, 2]], 'masa', 'alet');
t(E7.obsidyen_kilic, 1, [[515, 2], [264, 1], [256, 1]], 'masa', 'savas');
t(E7.obsidyen_capa, 1, [[515, 2], [264, 1], [256, 2]], 'masa', 'alet');
t(E7.durbun, 1, [[34, 2], [259, 2]], 'masa', 'alet');
t(E7.cepSaati, 1, [[263, 4], [471, 1]], 'masa', 'alet');
t(E7.havaiFisek, 3, [[E7.kagit, 1], [257, 1], [471, 1]], null, 'malzeme');
/* İstasyon */
t(C.tasKesme, 1, [[2, 3], [261, 1], [37, 2]], 'masa', 'blok');
/* Yapı blokları: Taş Kesme Tezgâhında taş türleri */
t(Y7.kirectasi, 4, [[2, 4], [296, 1]], 'taskesme', 'yapi');
t(Y7.mermer, 1, [[Y7.kirectasi, 1]], 'firin', 'yapi');
t(Y7.cilaliMermer, 1, [[Y7.mermer, 1]], 'taskesme', 'yapi');
t(Y7.mermerTugla, 4, [[Y7.mermer, 4]], 'taskesme', 'yapi');
t(Y7.mermerSutun, 2, [[Y7.mermer, 2]], 'taskesme', 'yapi');
t(Y7.granit, 2, [[2, 2], [285, 1]], 'taskesme', 'yapi');
t(Y7.cilaliGranit, 1, [[Y7.granit, 1]], 'taskesme', 'yapi');
t(Y7.bazalt, 4, [[2, 4], [257, 1]], 'taskesme', 'yapi');
t(Y7.cilaliBazalt, 1, [[Y7.bazalt, 1]], 'taskesme', 'yapi');
t(Y7.kayrak, 4, [[2, 4], [23, 1]], 'taskesme', 'yapi');
t(Y7.kayrakKiremit, 4, [[Y7.kayrak, 4]], 'taskesme', 'yapi');
t(Y7.catlakTugla, 1, [[35, 1]], 'firin', 'yapi');
t(Y7.yosunluTugla, 1, [[35, 1], [147, 1]], 'masa', 'yapi');
t(Y7.altinSuslu, 4, [[943, 4], [263, 1]], 'taskesme', 'yapi');
t(Y7.fayans, 4, [[960, 4], [346, 1]], 'taskesme', 'yapi');
t(Y7.mozaik, 4, [[960, 1], [961, 1], [963, 1], [965, 1]], 'taskesme', 'yapi');
t(Y7.iznik, 2, [[164, 2], [321, 1]], 'taskesme', 'yapi');
t(Y7.kerpic, 2, [[23, 2], [52, 1]], 'masa', 'yapi');
t(Y7.eskiTugla, 1, [[E7.tugla, 4]], 'masa', 'yapi');
t(Y7.lambri, 4, [['kalas', 3], [256, 1]], 'masa', 'yapi');
t(Y7.kamis, 1, [[568, 9]], null, 'yapi');
t(Y7.hasir, 2, [[568, 4], [284, 1]], 'masa', 'yapi');
t(Y7.samanCati, 4, [[52, 2]], 'masa', 'yapi');
t(Y7.demirLevha, 4, [[261, 4], [E7.civi, 2]], 'masa', 'yapi');
t(Y7.bakirLevha, 4, [[259, 4], [E7.civi, 2]], 'masa', 'yapi');
t(Y7.pasliBakir, 1, [[Y7.bakirLevha, 1], [478, 1]], null, 'yapi');
t(Y7.camTugla, 4, [[34, 4]], 'taskesme', 'yapi');
t(Y7.ahsapKasa, 1, [['kalas', 4], [E7.civi, 2]], 'masa', 'blok');
YAPI_MALZEME37.forEach(m => { t(m.merdiven, 4, [[m.taban, 6]], 'masa', 'yapi'); t(m.yarim, 6, [[m.taban, 3]], 'masa', 'yapi'); });
DUVAR_MALZEME37.forEach(m => t(m.duvar, 6, [[m.taban, 6]], 'masa', 'yapi'));
/* Çok bloklu mobilya ve yapılar */
t(C.kanepe, 1, [['kalas', 4], [117, 6], [49, 3], [E7.civi, 4]], 'masa', 'mobilya');
t(C.ikiliKoltuk, 1, [['kalas', 3], [282, 6], [49, 2], [E7.civi, 3]], 'masa', 'mobilya');
t(C.bank, 1, [['kalas', 4], [261, 3]], 'masa', 'mobilya');
t(C.yemekMasasi, 1, [['kalas', 6], [256, 4], [E7.civi, 2]], 'masa', 'mobilya');
t(C.calismaMasasi, 1, [['kalas', 7], [256, 2], [E7.civi, 2]], 'masa', 'mobilya');
t(C.gardirop, 1, [['kalas', 8], [261, 1], [E7.civi, 2]], 'masa', 'mobilya');
t(C.buyukGardirop, 1, [['kalas', 14], [261, 2], [E7.civi, 4]], 'masa', 'mobilya');
t(C.dedeSaati, 1, [['kalas', 6], [263, 2], [34, 1], [471, 1]], 'masa', 'mobilya');
t(C.piyano, 1, [['kalas', 10], [261, 4], [120, 2], [49, 2]], 'masa', 'mobilya');
t(C.buzdolabi, 1, [[261, 8], [22, 4], [495, 1]], 'masa', 'mobilya');
t(C.kuvet, 1, [[960, 8], [259, 2]], 'masa', 'mobilya');
t(C.ciftYatak, 1, [['kalas', 6], [49, 6], [114, 2], [E7.civi, 2]], 'masa', 'mobilya');
t(C.ranza, 1, [['kalas', 8], [49, 6], [118, 1], [114, 1]], 'masa', 'mobilya');
t(C.uykuTulumu, 1, [[391, 4], [49, 2], [117, 1]], 'masa', 'mobilya');
t(C.hamak, 1, [['kutuk', 2], [391, 4], [E7.halat, 2]], 'masa', 'mobilya');
t(C.bilardo, 1, [['kalas', 12], [117, 6], [E7.civi, 4]], 'masa', 'mobilya');
t(C.ayakliLamba, 1, [[259, 3], [391, 2], [1190, 1]], 'masa', 'mobilya');
t(C.sokakLambasi, 1, [[261, 6], [34, 2], [471, 1]], 'masa', 'mobilya');
t(C.bayrakDiregi, 1, [[261, 4], [391, 3], [321, 2], [37, 2]], 'masa', 'mobilya');
t(C.kuyu, 1, [[15, 16], ['kalas', 4], [51, 5], [E7.halat, 1], [478, 1]], 'masa', 'mobilya');
t(C.pazarTezgahi, 1, [['kalas', 8], [391, 4], [321, 1], [266, 2]], 'masa', 'mobilya');
t(C.cardak, 1, [['kalas', 16], ['kutuk', 4], [51, 12], [E7.civi, 6]], 'masa', 'mobilya');
t(C.sovalyeHeykeli, 1, [[Y7.mermer, 3], [37, 8]], 'taskesme', 'mobilya');
t(C.cesme, 1, [[Y7.mermer, 12], [Y7.cilaliMermer, 4], [478, 1], [263, 1]], 'taskesme', 'mobilya');
t(C.boyAynasi, 1, [['kalas', 3], [34, 2], [261, 1]], 'masa', 'mobilya');
t(C.portmanto, 1, [['kalas', 2], [256, 4]], 'masa', 'mobilya');
t(C.teleskop, 1, [[259, 4], [34, 2], [256, 3]], 'masa', 'mobilya');
/* Tek bloklu dekor */
t(C.tabure, 1, [['kalas', 2], [256, 2], [282, 1]], 'masa', 'mobilya');
t(C.barTaburesi, 1, [[261, 2], [114, 1]], 'masa', 'mobilya');
t(C.minder, 2, [[114, 2], [49, 1]], null, 'mobilya');
t(C.sallananSandalye, 1, [['kalas', 4], [256, 4], [114, 1]], 'masa', 'mobilya');
t(C.daktilo, 1, [[261, 3], [E7.kagit, 1], [120, 1]], 'masa', 'mobilya');
t(C.gramofon, 1, [['kalas', 2], [259, 3], [120, 1]], 'masa', 'mobilya');
t(C.kure, 1, [[259, 2], [325, 1], [324, 1], [E7.kagit, 2]], 'masa', 'mobilya');
t(C.samdan, 1, [[259, 2], [1190, 3]], 'masa', 'mobilya');
t(C.kumSaati, 1, [[34, 2], [5, 1], ['kalas', 1]], 'masa', 'mobilya');
t(C.duvarSaati, 1, [['kalas', 2], [263, 1], [E7.kagit, 1]], 'masa', 'mobilya');
t(C.kitapYigini, 1, [[E7.kitap, 4]], null, 'mobilya');
t(C.kaktus, 1, [[960, 1], [5, 1], [324, 1]], 'masa', 'mobilya');
t(C.monstera, 1, [[960, 1], [3, 1], [9, 4]], 'masa', 'mobilya');
t(C.bonsai, 1, [[961, 1], [3, 1], [8, 1], [9, 2]], 'masa', 'mobilya');
t(C.semsiyelik, 1, [[259, 2], [391, 2]], 'masa', 'mobilya');
t(C.paspas, 2, [[267, 3]], null, 'mobilya');
t(C.copKovasi, 1, [[261, 3]], 'masa', 'mobilya');
t(C.metalVaril, 1, [[261, 6], [325, 1]], 'masa', 'mobilya');
t(C.kusKafesi, 1, [[259, 4], [283, 1]], 'masa', 'mobilya');
t(C.postaKutusu, 1, [[261, 3], [321, 1], [256, 1]], 'masa', 'mobilya');
t(C.bahceCucesi, 1, [[960, 2], [321, 1], [325, 1]], 'masa', 'mobilya');
t(C.lavabo, 1, [['kalas', 3], [Y7.mermer, 1], [259, 2]], 'masa', 'mobilya');
t(C.dikisMakinesi, 1, [[261, 4], ['kalas', 2], [284, 2]], 'masa', 'mobilya');
t(C.mangal, 1, [[261, 5], [257, 2]], 'masa', 'mobilya');
t(C.camasirSepeti, 1, [[568, 6], [391, 1]], 'masa', 'mobilya');
t(C.odunYigini, 1, [['kutuk', 6]], null, 'mobilya');
t(C.tabela, 1, [['kalas', 3], [256, 1]], null, 'mobilya');
t(C.gazLambasi, 1, [[259, 2], [34, 1], [1190, 1]], 'masa', 'mobilya');

export const TARIFLER = R;

export function girdiAdi(g) { return GRUPLAR[g] ? GRUPLAR[g].ad : (ESYALAR[g] ? ESYALAR[g].ad : '?'); }
export function girdiSay(env, g) { return GRUPLAR[g] ? GRUPLAR[g].idler.reduce((n, id) => n + env.say(id), 0) : env.say(g); }
export function girdiHarca(env, g, adet) {
  if (!GRUPLAR[g]) return env.harca(g, adet);
  for (const id of GRUPLAR[g].idler) { const k = Math.min(adet, env.say(id)); if (k) { env.harca(id, k); adet -= k; } }
  return adet === 0;
}
/* Kaç kez üretilebilir (malzemeye göre) */
export function kacKez(env, tarif) {
  let n = Infinity;
  for (const [g, a] of girdiListesi(tarif)) n = Math.min(n, Math.floor(girdiSay(env, g) / a));
  return n;
}
export function uret(env, tarif, kez = 1) {
  kez = Math.min(kez, kacKez(env, tarif));
  let yapilan = 0;
  for (let i = 0; i < kez; i++) {
    if (!env.bosYerVar(tarif.cikti, tarif.adet)) break;
    for (const [g, a] of girdiListesi(tarif)) girdiHarca(env, g, a);
    env.ekle(tarif.cikti, tarif.adet);
    /* 0.21.0: süt kovası ve bal şişesi gibi kaplı malzemelerin kabı geri verilir */
    for (const [g, a] of girdiListesi(tarif)) { const e = !GRUPLAR[g] && ESYALAR[g], kap = e && (e.kap || (e.kase ? 270 : 0)); if (kap) env.ekle(kap, a); }
    yapilan++;
  }
  return yapilan;
}
