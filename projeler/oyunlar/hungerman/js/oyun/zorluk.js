/* HungerMan - zorluk ön ayarları ve denge ayarları (0.23.0)
   Zorluk ve denge değerleri dünyaya kaydedilir; çok oyunculuda sunucunun değerleri geçerlidir.
   Hardcore: tek can; ölünce dünya sona erer ve yalnızca izleyici olarak dolaşılabilir. */
export const ZORLUKLAR = {
  kolay: { ad: 'Kolay', hasar: 0.6, aclik: 0.7, canavar: 0.6, kanama: 0.5, isiHasar: false, aciklama: 'Canavarlar az ve zayıf, açlık yavaş; soğuk ve sıcak can götürmez.' },
  normal: { ad: 'Normal', hasar: 1, aclik: 1, canavar: 1, kanama: 1, isiHasar: true, aciklama: 'Dengeli hayatta kalma.' },
  zor: { ad: 'Zor', hasar: 1.4, aclik: 1.25, canavar: 1.35, kanama: 1.5, isiHasar: true, aciklama: 'Canavarlar kalabalık ve sert vurur, açlık hızlı, yaralar sık.' },
  hardcore: { ad: 'Hardcore', hasar: 1.4, aclik: 1.25, canavar: 1.35, kanama: 1.5, isiHasar: true, tekCan: true, aciklama: 'Zor ayarları ve tek can: ölünce dünya sona erer.' }
};
export const zorluk = k => ZORLUKLAR[k] || ZORLUKLAR.normal;
/* Oyun nesnesine uygular: açlık hızı, ısı hasarı ve ısı değişim hızı; o.Z diğer çarpanlar için okunur */
export function zorlukUygula(o) {
  if (!ZORLUKLAR[o.zorluk]) o.zorluk = 'normal';
  o.denge = dengeDuzelt(o.denge);
  const Z = o.Z = zorluk(o.zorluk);
  o.hayatta.yorCarpani = Z.aclik; o.hayatta.isiHasar = Z.isiHasar; o.hayatta.isiHizi = o.denge.isiHizi;
}
/* Denge: kanlıAy = kaç günde bir (0: kapalı), meteor = olasılık çarpanı (0: kapalı), isiHizi = vücut ısısı değişim hızı */
export const VARSAYILAN_DENGE = { kanliAy: 7, meteor: 1, isiHizi: 1 };
export function dengeDuzelt(d) {
  const r = { ...VARSAYILAN_DENGE, ...(d && typeof d === 'object' ? d : {}) };
  r.kanliAy = [0, 3, 5, 7, 10, 14].includes(+r.kanliAy) ? +r.kanliAy : 7;
  r.meteor = [0, 0.5, 1, 2].includes(+r.meteor) ? +r.meteor : 1;
  r.isiHizi = [0.5, 1, 1.6].includes(+r.isiHizi) ? +r.isiHizi : 1;
  return r;
}
/* Form seçenekleri: [değer, ad] */
export const DENGE_SECENEK = {
  kanliAy: [[0, 'Kapalı'], [3, '3 günde bir'], [5, '5 günde bir'], [7, 'Mevsim sonunda (7 gün)'], [10, '10 günde bir'], [14, '14 günde bir']],
  meteor: [[0, 'Kapalı'], [0.5, 'Az'], [1, 'Normal'], [2, 'Sık']],
  isiHizi: [[0.5, 'Yavaş'], [1, 'Normal'], [1.6, 'Hızlı']]
};
