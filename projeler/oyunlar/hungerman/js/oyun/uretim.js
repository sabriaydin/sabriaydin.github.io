/* HungerMan - üretim tarifleri
   istasyon: null (her yerde), 'masa' (Üretim Masası yakınında), 'firin' (Fırın yakınında)
   Girdi olarak eşya kimliği ya da grup adı ('kalas', 'kutuk') kullanılabilir. */
import { aletId, ESYALAR } from '../bloklar.js';

export const GRUPLAR = {
  kalas: { ad: 'Herhangi bir kalas', idler: [14, 38, 39] },
  kutuk: { ad: 'Herhangi bir kütük', idler: [8, 10, 12] }
};
export const ISTASYON_ADI = { masa: 'Üretim Masası', firin: 'Fırın' };
export const ISTASYON_BLOK = { masa: 32, firin: 33 };

export const KATEGORILER = [['hepsi', 'Tümü'], ['alet', 'Aletler'], ['blok', 'Bloklar'], ['malzeme', 'Malzemeler'], ['yiyecek', 'Yiyecek ve Bakım']];

const R = [];
const t = (cikti, adet, girdi, istasyon, kategori) => R.push({ cikti, adet, girdi, istasyon: istasyon || null, kategori });

/* Bloklar */
t(14, 4, [[8, 1]], null, 'blok');
t(38, 4, [[10, 1]], null, 'blok');
t(39, 4, [[12, 1]], null, 'blok');
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
