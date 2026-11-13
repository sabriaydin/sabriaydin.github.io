/* HungerMan - üretim tarifleri
   istasyon: null (her yerde), 'masa' (Üretim Masası yakınında), 'firin' (Fırın yakınında), 'ates' (Kamp Ateşi), 'simya' (Simya Masası), 'tencere' (Tencere)
   Girdi olarak eşya kimliği ya da grup adı ('kalas', 'kutuk') kullanılabilir. */
import { aletId, ESYALAR, ZIRH_MALZEME, YUN_RENKLERI } from '../bloklar.js';

export const GRUPLAR = {
  kalas: { ad: 'Herhangi bir kalas', idler: [14, 38, 39] },
  kutuk: { ad: 'Herhangi bir kütük', idler: [8, 10, 12, 144] }
};
export const ISTASYON_ADI = { masa: 'Üretim Masası', firin: 'Fırın', ates: 'Kamp Ateşi', simya: 'Simya Masası', tencere: 'Tencere' };
export const ISTASYON_BLOK = { masa: 32, firin: 33, ates: 48, simya: 140, tencere: 232 };
/* Tarifin istasyon koşulu: yok, tek istasyon ya da istasyonlardan biri */
export const istasyonlar = t => (!t.istasyon ? [] : Array.isArray(t.istasyon) ? t.istasyon : [t.istasyon]);
export const istasyonVar = (t, mevcut) => { const l = istasyonlar(t); return !l.length || l.some(k => mevcut.has(k)); };
export const istasyonMetni = t => istasyonlar(t).map(k => ISTASYON_ADI[k]).join(' veya ');

export const KATEGORILER = [['hepsi', 'Tümü'], ['alet', 'Aletler'], ['savas', 'Savaş'], ['blok', 'Bloklar'], ['malzeme', 'Malzemeler'], ['yiyecek', 'Yiyecek ve Bakım'], ['mobilya', 'Mobilya'], ['mekanik', 'Mekanik']];

const R = [];
const t = (cikti, adet, girdi, istasyon, kategori) => R.push({ cikti, adet, girdi, istasyon: istasyon || null, kategori });

/* Bloklar */
t(14, 4, [[8, 1]], null, 'blok');
t(38, 4, [[10, 1]], null, 'blok');
t(39, 4, [[12, 1]], null, 'blok');
t(14, 4, [[144, 1]], null, 'blok');
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
ZIRH_MALZEME.forEach((m, mi) => ZIRH_ADET.forEach((a, pi) => t(400 + mi * 4 + pi, 1, [[m.mal, a]], 'masa', 'savas')));
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
t(514, 1, [[471, 4]], null, 'blok');
t(518, 4, [[512, 4]], 'firin', 'blok');
t(519, 1, [[518, 2]], 'masa', 'blok');
t(474, 1, [[472, 3], [264, 1], [256, 1]], 'masa', 'savas');
t(335, 1, [[331, 1], [472, 1]], 'simya', 'yiyecek');

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
  for (const [g, a] of tarif.girdi) n = Math.min(n, Math.floor(girdiSay(env, g) / a));
  return n;
}
export function uret(env, tarif, kez = 1) {
  kez = Math.min(kez, kacKez(env, tarif));
  let yapilan = 0;
  for (let i = 0; i < kez; i++) {
    if (!env.bosYerVar(tarif.cikti, tarif.adet)) break;
    for (const [g, a] of tarif.girdi) girdiHarca(env, g, a);
    env.ekle(tarif.cikti, tarif.adet);
    yapilan++;
  }
  return yapilan;
}
