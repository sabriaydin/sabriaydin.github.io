/* HungerMan - çok bloklu mobilya ve yapılar (0.37.0)
   Her nesne gerçek boyutunda w (genişlik) × d (derinlik) × h (yükseklik) hücre kaplar; her hücre ayrı bir blok kimliğidir: taban + yön * n + hücre.
   Tasarım düzeni (yön 0): x doğuya, y yukarı, z güneye; nesnenin arkası kuzeyde (z = 0), önü güneyde (oyuncuya bakar).
   Kutular piksel biriminde verilir (1 blok = 16 piksel): [x0, y0, z0, x1, y1, z1, doku]. Doku bir ad ya da altı yüzün adları
   [+x, -x, +y, -y, +z, -z] olabilir; +z yüzü nesnenin önüdür. Hücrelere bölme ve döndürme sekiller.js'tedir.
   Kurulum: ayak izi oyuncunun önüne, ön yüz oyuncuya bakacak biçimde yerleşir; R tuşu döndürür.
   Bu dosya işçilerde de kullanılır (THREE içermez). */

const A = 'yatak_ahsap', C = 'ahsap_cilali', K = 'kalas';
const bacak4 = (W, D, h, t, k = 2, p = 1.5) => [[p, 0, p, p + k, h, p + k, t], [W - p - k, 0, p, W - p, h, p + k, t], [p, 0, D - p - k, p + k, h, D - p, t], [W - p - k, 0, D - p - k, W - p, h, D - p, t]];
const on = (t, o) => [t, t, t, t, o, t];
const ust = (t, u) => [t, t, u, t, t, t];

/* Koltuk takımı: n minder, kumaş f */
function koltuk(n, f) {
  const W = 16 * n, l = [...bacak4(W, 16, 2, A, 2, 2)];
  l.push([1, 2, 1, W - 1, 6, 15, f], [1, 6, 1, W - 1, 14, 4.5, f], [1.5, 14, 1.5, W - 1.5, 15, 4, f]);
  const iw = (W - 8) / n;
  for (let i = 0; i < n; i++) {
    const x0 = 4 + i * iw + (i ? 0.2 : 0), x1 = 4 + (i + 1) * iw - (i < n - 1 ? 0.2 : 0);
    l.push([x0, 6, 5, x1, 8.6, 15.4, f], [x0, 6, 4.5, x1, 13.5, 7, f]);
  }
  l.push([0, 2, 1, 4, 10, 15.5, f], [W - 4, 2, 1, W, 10, 15.5, f], [0.3, 10, 1.5, 3.7, 11, 15, f], [W - 3.7, 10, 1.5, W - 0.3, 11, 15, f]);
  return l;
}

/* Yatak gövdesi (genişlik W, uzunluk D, döşek tabanı y0); baş z = 0 tarafında */
function yatakGovde(W, D, y0, yorgan, iki) {
  const l = [[1, y0, 2, 2, y0 + 3, D - 2, A], [W - 2, y0, 2, W - 1, y0 + 3, D - 2, A],
    [2, y0, 2, W - 2, y0 + 4, D - 2, 'yatak_dosek'], [2, y0 + 4, 2, W - 2, y0 + 5, D - 2.4, 'yatak_carsaf']];
  if (iki) l.push([3, y0 + 5, 2.6, W / 2 - 0.5, y0 + 7.5, 8, 'yatak_yastik'], [W / 2 + 0.5, y0 + 5, 2.6, W - 3, y0 + 7.5, 8, 'yatak_yastik']);
  else l.push([3, y0 + 5, 2.6, W - 3, y0 + 7.5, 7, 'yatak_yastik']);
  l.push([1.6, y0 + 5, 10, W - 1.6, y0 + 5.6, D - 2.2, yorgan], [1.6, y0 + 5.6, 9, W - 1.6, y0 + 6.4, 11, 'yatak_carsaf'],
    [1.4, y0 + 1.5, 10, 1.6, y0 + 5.6, D - 2.2, yorgan], [W - 1.6, y0 + 1.5, 10, W - 1.4, y0 + 5.6, D - 2.2, yorgan], [1.6, y0 + 2, D - 2.4, W - 1.6, y0 + 5.6, D - 2.2, yorgan]);
  return l;
}

/* Sarkan hamak bezi ve ipler */
function hamak() {
  const l = [[1, 0, 6, 3, 28, 10, A], [45, 0, 6, 47, 28, 10, A], [0, 26, 5, 4, 27, 11, A], [44, 26, 5, 48, 27, 11, A]];
  for (let x = 8; x < 40; x += 2) { const y = 9 + Math.pow((x + 1 - 24) / 16, 2) * 5; l.push([x, y, 4, x + 2, y + 1, 12, 'hamak_bez']); }
  for (let i = 0; i < 5; i++) { const y = 23 - i * 2; l.push([3 + i, y, 7.5, 4 + i, y + 2, 8.5, 'halat'], [44 - i, y, 7.5, 45 - i, y + 2, 8.5, 'halat']); }
  l.push([3, 13.5, 4.5, 8, 14.2, 11.5, 'hamak_bez'], [40, 13.5, 4.5, 45, 14.2, 11.5, 'hamak_bez']);
  return l;
}

/* Bahçe çardağı: ahşap zemin, dört direk, üç yanda korkuluk, kademeli kiremit çatı */
function cardak() {
  const l = [[0, 0, 0, 48, 2, 48, 'lambri']];
  for (const [x, z] of [[2, 2], [43, 2], [2, 43], [43, 43]]) l.push([x, 2, z, x + 3, 34, z + 3, A]);
  l.push([5, 10, 2.5, 43, 11.5, 4.5, A], [2.5, 10, 5, 4.5, 11.5, 43, A], [43.5, 10, 5, 45.5, 11.5, 43, A]);
  for (let x = 8; x < 43; x += 5) l.push([x, 2, 3, x + 1, 10, 4, A]);
  for (let z = 8; z < 43; z += 5) l.push([3, 2, z, 4, 10, z + 1, A], [44, 2, z, 45, 10, z + 1, A]);
  l.push([0, 33, 0, 48, 34, 2, A], [0, 33, 46, 48, 34, 48, A], [0, 33, 2, 2, 34, 46, A], [46, 33, 2, 48, 34, 46, A]);
  for (let i = 0; i < 7; i++) l.push([i * 3, 34 + i * 2, i * 3, 48 - i * 3, 36 + i * 2, 48 - i * 3, 'kiremit']);
  l.push([22.5, 48 - 0.01, 22.5, 25.5, 48, 25.5, 'altin_blok']);
  return l;
}

/* Su kuyusu: taş bilezik, su, iki direk, makara, ip, kova ve kiremit çatı */
function kuyu() {
  const T = 'kuyu_tas', l = [[2, 0, 2, 30, 10, 5, T], [2, 0, 27, 30, 10, 30, T], [2, 0, 5, 5, 10, 27, T], [27, 0, 5, 30, 10, 27, T],
    [1.5, 10, 1.5, 30.5, 11, 5.5, 'kesme_tas'], [1.5, 10, 26.5, 30.5, 11, 30.5, 'kesme_tas'], [1.5, 10, 5.5, 5.5, 11, 26.5, 'kesme_tas'], [26.5, 10, 5.5, 30.5, 11, 26.5, 'kesme_tas'],
    [5, 0, 5, 27, 6, 27, 'su'], [3, 11, 14, 5, 30, 18, A], [27, 11, 14, 29, 30, 18, A], [5, 23, 15, 27, 25, 17, K], [29, 23.5, 15.5, 31, 24.5, 16.5, A], [30.5, 20.5, 15.5, 31.5, 24.5, 16.5, A],
    [15.5, 16, 15.5, 16.5, 23, 16.5, 'halat'], [13.5, 12, 13.5, 18.5, 16, 18.5, 'fici_yan']];
  for (let i = 0; i < 5; i++) l.push([0, 30 + i, 2 + i * 3, 32, 31 + i, 30 - i * 3, 'kiremit']);
  return l;
}

/* Mermer çeşme: havuz, ortada ayak, yalak, fıskiye ve dökülen sular */
function cesme() {
  const M = 'mermer', CM = 'mermer_cilali', l = [[2, 0, 2, 46, 7, 5, M], [2, 0, 43, 46, 7, 46, M], [2, 0, 5, 5, 7, 43, M], [43, 0, 5, 46, 7, 43, M],
    [1.5, 7, 1.5, 46.5, 8, 5.5, CM], [1.5, 7, 42.5, 46.5, 8, 46.5, CM], [1.5, 7, 5.5, 5.5, 8, 42.5, CM], [42.5, 7, 5.5, 46.5, 8, 42.5, CM],
    [5, 0, 5, 43, 5.5, 43, 'su'], [20, 0, 20, 28, 14, 28, M], [15, 14, 15, 33, 17, 33, CM], [16, 17, 16, 32, 17.4, 32, 'su'],
    [22, 17, 22, 26, 24, 26, M], [22.5, 24, 22.5, 25.5, 27, 25.5, 'altin_blok'],
    [14.4, 5.5, 23, 15, 15, 25, 'su'], [33, 5.5, 23, 33.6, 15, 25, 'su'], [23, 5.5, 14.4, 25, 15, 15, 'su'], [23, 5.5, 33, 25, 15, 33.6, 'su']];
  return l;
}

export const COKLU = {
  kanepe: { ad: 'Kanepe', w: 3, d: 1, h: 1, ses: 'yun', sertlik: 1.2, alet: 'balta', oturak: 0.55, harita: 114, kutular: koltuk(3, 'doseme_yesil') },
  ikiliKoltuk: { ad: 'İkili Deri Koltuk', w: 2, d: 1, h: 1, ses: 'yun', sertlik: 1.2, alet: 'balta', oturak: 0.55, harita: 14, kutular: koltuk(2, 'doseme_kahve') },
  bank: { ad: 'Park Bankı', w: 2, d: 1, h: 1, ses: 'odun', sertlik: 1.5, alet: 'balta', oturak: 0.53, harita: 14, kutular: (() => {
    const I = 'demir_siyah', l = [];
    for (const x of [2, 28]) l.push([x, 0, 4, x + 2, 7.5, 6, I], [x, 0, 11, x + 2, 7.5, 13, I], [x, 6.5, 3, x + 2, 7.5, 14, I], [x, 7.5, 11, x + 2, 10, 12.5, I], [x, 10, 4, x + 2, 11, 13, I], [x, 7.5, 3, x + 2, 16, 4.5, I]);
    l.push([15, 0, 7, 17, 7.5, 9, I], [0.5, 7.5, 4, 31.5, 8.5, 6.5, K], [0.5, 7.5, 7.5, 31.5, 8.5, 10, K], [0.5, 7.5, 11, 31.5, 8.5, 13.5, K],
      [0.5, 9.5, 2.6, 31.5, 11, 3.6, K], [0.5, 12, 2.6, 31.5, 13.5, 3.6, K], [0.5, 14.5, 2.6, 31.5, 15.8, 3.6, K]);
    return l; })() },
  yemekMasasi: { ad: 'Yemek Masası', w: 2, d: 1, h: 1, ses: 'odun', sertlik: 1.5, alet: 'balta', harita: 14, kutular: [
    [0, 14.5, 0.5, 32, 16, 15.5, C], [1.5, 12.5, 1.5, 30.5, 14.5, 14.5, C], ...bacak4(32, 16, 12.5, C, 2, 1.5), ...bacak4(32, 16, 1.5, C, 3, 1), [11, 15.95, 0.5, 21, 16, 15.5, 'yun_k']] },
  calismaMasasi: { ad: 'Çalışma Masası', w: 2, d: 1, h: 1, ses: 'odun', sertlik: 1.5, alet: 'balta', sandik: true, harita: 14, kutular: [
    [0, 14.5, 0, 32, 16, 15, C], [1, 0, 1, 13, 14.5, 14.5, on(C, 'cekmece_on')], [28.5, 0, 1, 30.5, 14.5, 3, C], [28.5, 0, 12.5, 30.5, 14.5, 14.5, C], [13, 7, 1, 28.5, 14.5, 2, C]] },
  gardirop: { ad: 'Gardırop', w: 1, d: 1, h: 2, ses: 'odun', sertlik: 2, alet: 'balta', sandik: true, harita: 14, kutular: [
    [0, 0, 0.5, 16, 1, 15.5, C], [0.5, 1, 1, 15.5, 16, 15, on(C, 'gardirop_alt')], [0.5, 16, 1, 15.5, 31, 15, on(C, 'gardirop_ust')], [0, 31, 0.5, 16, 32, 15.5, C]] },
  buyukGardirop: { ad: 'Büyük Gardırop', w: 2, d: 1, h: 2, ses: 'odun', sertlik: 2, alet: 'balta', sandik: true, harita: 14, kutular: [
    [0, 0, 0.5, 32, 1, 15.5, C], [0.5, 1, 1, 31.5, 16, 15, on(C, 'gardirop_alt')], [0.5, 16, 1, 31.5, 31, 15, on(C, 'gardirop_ust')], [0, 31, 0.5, 32, 32, 15.5, C],
    [15.5, 1, 15, 16.5, 31, 15.3, C]] },
  dedeSaati: { ad: 'Dede Saati', w: 1, d: 1, h: 2, ses: 'odun', sertlik: 1.5, alet: 'balta', harita: 14, kutular: [
    [2, 0, 3, 14, 10, 13, C], [1.5, 0, 2.5, 14.5, 1, 13.5, C], [3, 10, 4, 13, 22, 12, on(C, 'sarkac')], [1.5, 22, 2.5, 14.5, 31, 13.5, on(C, 'saat_yuz')], [1, 31, 2, 15, 32, 14, C]] },
  piyano: { ad: 'Piyano', w: 2, d: 1, h: 2, ses: 'odun', sertlik: 2, alet: 'balta', muzik: true, harita: 37, kutular: [
    [0, 0, 0.5, 32, 21, 7, 'piyano_govde'], [0, 21, 0.3, 32, 22, 7.2, 'piyano_govde'], [0, 9, 7, 32, 11, 13, 'piyano_govde'], [1, 11, 7.5, 31, 12, 12.5, 'piyano_tus'],
    [0, 9, 7, 1.5, 13, 13, 'piyano_govde'], [30.5, 9, 7, 32, 13, 13, 'piyano_govde'], [1, 0, 11, 2.5, 9, 12.5, 'piyano_govde'], [29.5, 0, 11, 31, 9, 12.5, 'piyano_govde'],
    [4, 13, 6.5, 28, 17, 7.5, 'piyano_govde'], [10, 13.5, 7.4, 22, 16.5, 7.7, 'kagit'], [13, 0.5, 7, 14, 1.5, 9.5, 'pirinc'], [18, 0.5, 7, 19, 1.5, 9.5, 'pirinc'],
    [6, 16, 6.8, 7.5, 18.5, 7.6, 'mum_govde'], [24.5, 16, 6.8, 26, 18.5, 7.6, 'mum_govde']] },
  buzdolabi: { ad: 'Buzdolabı', w: 1, d: 1, h: 2, ses: 'tas', sertlik: 2, alet: 'kazma', sandik: true, harita: 2, kutular: [
    [1, 0, 1, 15, 30.5, 15, 'beyaz_emaye'], [1, 0.5, 15, 15, 18, 15.5, on('beyaz_emaye', 'buzdolabi_alt')], [1, 18.5, 15, 15, 30, 15.5, on('beyaz_emaye', 'buzdolabi_ust')],
    [12.5, 10, 15.5, 13.5, 16.5, 16, 'krom'], [12.5, 20, 15.5, 13.5, 26.5, 16, 'krom']] },
  kuvet: { ad: 'Küvet', w: 2, d: 1, h: 1, ses: 'tas', sertlik: 2, alet: 'kazma', harita: 2, kutular: [
    [1, 2, 1, 31, 3, 15, 'beyaz_emaye'], [0, 2, 0.5, 32, 10, 1.5, 'beyaz_emaye'], [0, 2, 14.5, 32, 10, 15.5, 'beyaz_emaye'], [0, 2, 1.5, 1.5, 10, 14.5, 'beyaz_emaye'], [30.5, 2, 1.5, 32, 10, 14.5, 'beyaz_emaye'],
    [1.5, 3, 1.5, 30.5, 8, 14.5, 'su'], ...bacak4(32, 16, 2, 'pirinc', 2, 2), [27, 10, 7, 29, 13, 9, 'krom'], [27, 12, 3, 28.5, 13, 7, 'krom']] },
  ciftYatak: { ad: 'Çift Kişilik Yatak', w: 2, d: 2, h: 1, ses: 'yun', sertlik: 0.6, alet: 'balta', yatak: true, harita: 114, kutular: [
    [0.5, 0, 0.5, 2.5, 15, 2.5, A], [29.5, 0, 0.5, 31.5, 15, 2.5, A], [2.5, 4, 1, 29.5, 14, 2, A], [0.2, 15, 0.2, 31.8, 16, 2.8, A], [8, 8, 0.8, 24, 12, 1, A],
    ...yatakGovde(32, 32, 3, 'yatak_yorgan', true),
    [0.5, 0, 29.5, 2.5, 10, 31.5, A], [29.5, 0, 29.5, 31.5, 10, 31.5, A], [2.5, 3, 30, 29.5, 9, 31, A], [0.2, 10, 29.2, 31.8, 11, 31.8, A]] },
  ranza: { ad: 'Ranza', w: 1, d: 2, h: 2, ses: 'odun', sertlik: 0.8, alet: 'balta', yatak: true, harita: 14, kutular: (() => {
    const l = [[0.5, 0, 0.5, 2, 31, 2, A], [14, 0, 0.5, 15.5, 31, 2, A], [0.5, 0, 30, 2, 31, 31.5, A], [14, 0, 30, 15.5, 31, 31.5, A],
      [2, 3, 1, 14, 8, 2, A], [2, 3, 30, 14, 6, 31, A], [2, 19, 0.8, 14, 27, 1.8, A], [2, 19, 30.2, 14, 24, 31.2, A],
      [0.8, 24, 2, 1.8, 26.5, 30, A], [14.2, 24, 2, 15.2, 26.5, 30, A],
      ...yatakGovde(16, 32, 3, 'yorgan_mavi', false), ...yatakGovde(16, 32, 19, 'yatak_yorgan', false)];
    for (const y of [9, 13, 17]) l.push([3, y, 31, 13, y + 1, 31.8, A]);
    return l; })() },
  uykuTulumu: { ad: 'Uyku Tulumu', w: 1, d: 2, h: 1, ses: 'yun', sertlik: 0.3, alet: null, yatak: true, kati: false, harita: 4, kutular: [
    [2, 0, 1, 14, 2, 31, 'tulum'], [2.3, 2, 8, 13.7, 3, 30.5, 'tulum'], [3, 2, 1.5, 13, 2.6, 8, 'tulum_ic'], [3.5, 2.6, 2, 12.5, 4, 6, 'yatak_yastik'], [13.7, 0.5, 8, 14.2, 2.8, 30, 'krom']] },
  hamak: { ad: 'Hamak', w: 3, d: 1, h: 2, ses: 'yun', sertlik: 0.6, alet: 'balta', yatak: true, harita: 14, kutular: hamak() },
  bilardo: { ad: 'Bilardo Masası', w: 3, d: 2, h: 1, ses: 'odun', sertlik: 2, alet: 'balta', harita: 114, kutular: [
    ...bacak4(48, 32, 10, C, 4, 2), [22, 0, 2, 26, 10, 6, C], [22, 0, 26, 26, 10, 30, C], [0, 10, 0, 48, 13, 32, C], [2, 13, 2, 46, 13.6, 30, 'bilardo_cuha'],
    [0, 13, 0, 48, 15, 2, C], [0, 13, 30, 48, 15, 32, C], [0, 13, 2, 2, 15, 30, C], [46, 13, 2, 48, 15, 30, C],
    [2, 13.6, 2, 3.5, 13.7, 3.5, 'yun_si'], [44.5, 13.6, 2, 46, 13.7, 3.5, 'yun_si'], [2, 13.6, 28.5, 3.5, 13.7, 30, 'yun_si'], [44.5, 13.6, 28.5, 46, 13.7, 30, 'yun_si'], [23.3, 13.6, 2, 24.7, 13.7, 3, 'yun_si'], [23.3, 13.6, 29, 24.7, 13.7, 30, 'yun_si'],
    [32, 13.6, 15, 33, 14.6, 16, 'yun_k'], [33.2, 13.6, 14.2, 34.2, 14.6, 15.2, 'yun_s'], [33.2, 13.6, 16, 34.2, 14.6, 17, 'yun_m'], [34.4, 13.6, 15, 35.4, 14.6, 16, 'yun_y'], [12, 13.6, 15.5, 13, 14.6, 16.5, 'yun'],
    [6, 13.6, 21, 28, 14.1, 21.5, K]] },
  ayakliLamba: { ad: 'Ayaklı Lamba', w: 1, d: 1, h: 2, ses: 'cam', sertlik: 0.8, alet: null, isik: 13, harita: 2, kutular: [
    [5, 0, 5, 11, 1, 11, 'pirinc'], [6.5, 1, 6.5, 9.5, 2, 9.5, 'pirinc'], [7.5, 2, 7.5, 8.5, 23, 8.5, 'pirinc'], [4, 22, 4, 12, 30, 12, 'abajur'], [7.5, 30, 7.5, 8.5, 31, 8.5, 'pirinc']] },
  sokakLambasi: { ad: 'Sokak Lambası', w: 1, d: 1, h: 3, ses: 'tas', sertlik: 2, alet: 'kazma', isik: 15, harita: 2, kutular: [
    [4, 0, 4, 12, 3, 12, 'demir_siyah'], [5, 3, 5, 11, 5, 11, 'demir_siyah'], [6.5, 5, 6.5, 9.5, 40, 9.5, 'demir_siyah'], [5.5, 38, 5.5, 10.5, 40, 10.5, 'demir_siyah'],
    [4, 40, 4, 12, 41, 12, 'demir_siyah'], [4.5, 41, 4.5, 11.5, 46, 11.5, 'sokak_cam'], [3.5, 46, 3.5, 12.5, 47, 12.5, 'demir_siyah'], [7, 47, 7, 9, 48, 9, 'demir_siyah']] },
  bayrakDiregi: { ad: 'Bayrak Direği', w: 2, d: 1, h: 4, ses: 'tas', sertlik: 1.5, alet: 'kazma', harita: 2, kutular: [
    [0, 0, 5, 6, 2, 11, 'kesme_tas'], [2, 2, 7, 4, 62, 9, 'krom'], [1.5, 62, 6.5, 4.5, 64, 9.5, 'altin_blok'],
    [4, 48, 7.6, 16, 62, 8.4, 'bayrak_sol'], [16, 48, 7.6, 30, 62, 8.4, 'bayrak_sag']] },
  kuyu: { ad: 'Su Kuyusu', w: 2, d: 2, h: 3, ses: 'tas', sertlik: 2.5, alet: 'kazma', harita: 2, kutular: kuyu() },
  pazarTezgahi: { ad: 'Pazar Tezgâhı', w: 2, d: 1, h: 3, ses: 'odun', sertlik: 1.5, alet: 'balta', sandik: true, harita: 14, kutular: [
    [0, 0, 6, 32, 14, 16, K], [0, 14, 5, 32, 15.5, 16, 'kalas_koyu'], [2, 15.5, 7, 9, 18, 14, ust('sandik_yan', 'kasa_elma')], [11, 15.5, 7, 18, 18, 14, ust('sandik_yan', 'kasa_portakal')],
    [21, 15.5, 7, 30, 17.5, 14, ust('sandik_yan', 'kasa_ekmek')],
    [0.5, 0, 0.5, 2.5, 40, 2.5, A], [29.5, 0, 0.5, 31.5, 40, 2.5, A], [0.5, 15.5, 14, 2.5, 36, 16, A], [29.5, 15.5, 14, 31.5, 36, 16, A],
    [0, 40, 0, 32, 41, 4, 'tente'], [0, 39, 4, 32, 40, 8, 'tente'], [0, 38, 8, 32, 39, 12, 'tente'], [0, 37, 12, 32, 38, 16, 'tente'], [0, 35, 15.5, 32, 37, 16, 'tente']] },
  cardak: { ad: 'Bahçe Çardağı', w: 3, d: 3, h: 3, ses: 'odun', sertlik: 2, alet: 'balta', harita: 14, kutular: cardak() },
  sovalyeHeykeli: { ad: 'Şövalye Heykeli', w: 1, d: 1, h: 3, ses: 'tas', sertlik: 3, alet: 'kazma', seviye: 1, harita: 2, kutular: (() => {
    const S = 'heykel', M = 'mermer';
    return [[1, 0, 1, 15, 6, 15, M], [0.5, 6, 0.5, 15.5, 7, 15.5, 'mermer_cilali'], [4.5, 7, 6, 7.5, 20, 10, S], [8.5, 7, 6, 11.5, 20, 10, S], [4, 7, 5.5, 8, 9, 11, S], [8, 7, 5.5, 12, 9, 11, S],
      [4, 20, 5, 12, 31, 11, S], [3.5, 19, 4.5, 12.5, 21, 11.5, S], [2, 21, 6.5, 4, 30, 9.5, S], [12, 21, 6.5, 14, 30, 9.5, S], [2, 27, 5, 4.5, 31, 11, S], [11.5, 27, 5, 14, 31, 11, S],
      [0.5, 19, 9.5, 4.5, 29, 10.8, S], [12.5, 10, 10, 13.5, 33, 11, S], [10.5, 21, 9.5, 15.5, 22, 11.5, S],
      [5.5, 31, 5.5, 10.5, 37, 10.5, S], [6, 33, 10.5, 10, 34, 10.8, 'yun_si'], [7.5, 37, 5.5, 8.5, 40, 10, S]]; })() },
  cesme: { ad: 'Mermer Çeşme', w: 3, d: 3, h: 2, ses: 'tas', sertlik: 3, alet: 'kazma', seviye: 1, harita: 2, kutular: cesme() },
  boyAynasi: { ad: 'Boy Aynası', w: 1, d: 1, h: 2, ses: 'cam', sertlik: 0.8, alet: null, harita: 14, kutular: [
    [1, 0, 6, 15, 1.5, 10, C], [2, 1.5, 7, 14, 30, 9, C], [3, 2.5, 9, 13, 29, 9.2, 'ayna'], [5, 30, 7, 11, 31.5, 9, C]] },
  portmanto: { ad: 'Portmanto', w: 1, d: 1, h: 2, ses: 'odun', sertlik: 1, alet: 'balta', harita: 14, kutular: [
    [3, 0, 7, 13, 1.5, 9, A], [7, 0, 3, 9, 1.5, 13, A], [7, 1.5, 7, 9, 28, 9, A], [5, 25, 7.5, 7, 26, 8.5, A], [9, 25, 7.5, 11, 26, 8.5, A], [7.5, 25, 5, 8.5, 26, 7, A], [7.5, 25, 9, 8.5, 26, 11, A],
    [9, 14, 6.5, 13.5, 24.5, 11, 'yun_m'], [10, 24.5, 7.5, 12.5, 25.5, 10, 'yun_m'], [5, 28.5, 5, 11, 29.3, 11, 'yun_si'], [6, 29.3, 6, 10, 32, 10, 'yun_si'], [6, 29.3, 6, 10, 30, 10.05, 'yun_k']] },
  teleskop: { ad: 'Teleskop', w: 1, d: 1, h: 2, ses: 'cam', sertlik: 1, alet: null, harita: 2, kutular: (() => {
    const l = [[3, 0, 3, 4.5, 16, 4.5, A], [11.5, 0, 3, 13, 16, 4.5, A], [7.25, 0, 12, 8.75, 16, 13.5, A], [6, 16, 6, 10, 18, 10, 'pirinc']];
    for (let i = 0; i < 5; i++) { const z0 = 12 - i * 3, y0 = 17 + i * 2, k = i ? 0 : 0.5; l.push([6 + k, y0, z0, 10 - k, y0 + 4 - k * 2, z0 + 4, i === 4 ? 'pirinc' : 'teleskop_govde']); }
    l.push([7, 15, 13.5, 9, 18, 16, 'pirinc']);
    return l; })() }
};

/* ---------- Tek bloklu eşyalar (aynı kurulum: önizleme ve R ile döndürme) ---------- */
const T1 = (ad, o, kutular) => ({ ad, w: 1, d: 1, h: 1, ses: 'odun', sertlik: 1, alet: 'balta', harita: 14, ...o, kutular });
const kitap = (x0, y0, z0, x1, y1, z1, k) => [x0, y0, z0, x1, y1, z1, ['kitap_sayfa', 'kitap_sayfa', k, k, k, 'kitap_sayfa']];
const kutuk = (x0, y0, z0, x1, y1, z1) => [x0, y0, z0, x1, y1, z1, ['mese_ust', 'mese_ust', 'mese_yan', 'mese_yan', 'mese_yan', 'mese_yan']];
Object.assign(COKLU, {
  tabure: T1('Tabure', { oturak: 0.72 }, [...bacak4(16, 16, 10, A, 2, 3), [5, 4, 3.5, 11, 5, 4.5, A], [5, 4, 11.5, 11, 5, 12.5, A], [2.5, 10, 2.5, 13.5, 11.5, 13.5, C], [3, 11.5, 3, 13, 12.5, 13, 'doseme_kahve']]),
  barTaburesi: T1('Bar Taburesi', { oturak: 0.95, ses: 'tas', alet: 'kazma' }, [[4, 0, 4, 12, 1, 12, 'krom'], [7, 1, 7, 9, 14, 9, 'krom'], [4.5, 5, 7.5, 11.5, 5.8, 8.5, 'krom'], [7.5, 5, 4.5, 8.5, 5.8, 11.5, 'krom'],
    [3, 14, 3, 13, 15, 13, 'krom'], [3.3, 15, 3.3, 12.7, 16, 12.7, 'doseme_kirmizi']]),
  minder: T1('Yer Minderi', { oturak: 0.25, ses: 'yun', sertlik: 0.3, alet: null }, [[1, 0, 1, 15, 4, 15, 'minder_k'], [2, 4, 2, 14, 4.5, 14, 'minder_k'], [0.5, 0, 0.5, 1.5, 1.5, 1.5, 'altin_blok'], [14.5, 0, 0.5, 15.5, 1.5, 1.5, 'altin_blok'], [0.5, 0, 14.5, 1.5, 1.5, 15.5, 'altin_blok'], [14.5, 0, 14.5, 15.5, 1.5, 15.5, 'altin_blok']]),
  sallananSandalye: T1('Sallanan Sandalye', { oturak: 0.5 }, [[2, 0, 0.5, 4, 1.5, 15.5, A], [12, 0, 0.5, 14, 1.5, 15.5, A], [2, 1.5, 0, 4, 2.5, 1.5, A], [12, 1.5, 0, 14, 2.5, 1.5, A], [2, 1.5, 14.5, 4, 2.5, 16, A], [12, 1.5, 14.5, 14, 2.5, 16, A],
    [2, 1.5, 3, 3.5, 7, 4.5, A], [12.5, 1.5, 3, 14, 7, 4.5, A], [2, 1.5, 11, 3.5, 7, 12.5, A], [12.5, 1.5, 11, 14, 7, 12.5, A], [2, 7, 2, 14, 8.5, 13, A], [2.5, 8.5, 2.5, 13.5, 9.5, 12.5, 'yun_k'],
    [2, 8.5, 1.5, 3.5, 16, 3, A], [12.5, 8.5, 1.5, 14, 16, 3, A], [3.5, 14.5, 1.5, 12.5, 16, 3, A], [5, 9.5, 2, 6, 14.5, 2.8, A], [7.5, 9.5, 2, 8.5, 14.5, 2.8, A], [10, 9.5, 2, 11, 14.5, 2.8, A],
    [2, 11.5, 3, 3.5, 12.5, 12.5, A], [12.5, 11.5, 3, 14, 12.5, 12.5, A], [2, 8.5, 11, 3.5, 11.5, 12.5, A], [12.5, 8.5, 11, 14, 11.5, 12.5, A]]),
  daktilo: T1('Daktilo', { ses: 'tas', alet: 'kazma', kati: false }, [[3, 0, 4, 13, 3, 13, 'piyano_govde'], [3.5, 3, 9, 12.5, 3.8, 12.5, 'daktilo_tus'], [3.5, 3, 5, 12.5, 5, 9, 'piyano_govde'], [2, 5, 5, 14, 6.5, 6.5, 'piyano_govde'],
    [4, 6.5, 5.3, 12, 11, 5.7, 'kagit'], [1.5, 5.2, 5.2, 2, 6.3, 6.3, 'krom'], [14, 5.2, 5.2, 14.5, 6.3, 6.3, 'krom'], [12.5, 6.5, 5, 13.5, 7, 7, 'krom']]),
  gramofon: T1('Gramofon', { muzik: true, kati: false }, [[4, 0, 4, 12, 4, 12, C], [4.5, 4, 4.5, 11.5, 4.5, 11.5, 'yun_si'], [7.5, 4.5, 7.5, 8.5, 5, 8.5, 'pirinc'], [10, 4, 9, 11, 7, 10, 'pirinc'], [8, 6.5, 8, 10.5, 7, 9.5, 'pirinc'],
    [9.5, 6, 9.5, 10.5, 9, 10.5, 'pirinc'], [8.5, 9, 6.5, 11.5, 11, 9.5, 'pirinc'], [7, 10.5, 3.5, 13, 13, 7, 'pirinc'], [5.5, 12.5, 1, 14.5, 16, 4.5, 'pirinc'], [12, 1.5, 12, 13, 2.5, 14, 'krom']]),
  kure: T1('Dünya Küresi', { kati: false, ses: 'odun' }, [[5, 0, 5, 11, 1, 11, 'pirinc'], [7.5, 1, 7.5, 8.5, 4.5, 8.5, 'pirinc'], [3.5, 4, 7.5, 4.5, 13, 8.5, 'pirinc'], [11.5, 4, 7.5, 12.5, 13, 8.5, 'pirinc'], [4.5, 12.5, 7.5, 11.5, 13.5, 8.5, 'pirinc'],
    [5, 5, 5, 11, 12, 11, 'kure'], [5.5, 4.6, 5.5, 10.5, 5, 10.5, 'kure'], [5.5, 12, 5.5, 10.5, 12.4, 10.5, 'kure'], [4.6, 5.5, 5.5, 5, 11.5, 10.5, 'kure'], [11, 5.5, 5.5, 11.4, 11.5, 10.5, 'kure']]),
  samdan: T1('Şamdan', { isik: 11, kati: false, ses: 'tas', alet: null, sertlik: 0.4 }, [[5, 0, 5, 11, 1.5, 11, 'pirinc'], [7.25, 1.5, 7.25, 8.75, 8, 8.75, 'pirinc'], [3, 8, 7.25, 13, 9, 8.75, 'pirinc'],
    [3, 9, 6.75, 5.5, 10, 9.25, 'pirinc'], [6.75, 9, 6.75, 9.25, 10.5, 9.25, 'pirinc'], [10.5, 9, 6.75, 13, 10, 9.25, 'pirinc'],
    [3.5, 10, 7.25, 5, 14, 8.75, 'mum_govde'], [7.25, 10.5, 7.25, 8.75, 15, 8.75, 'mum_govde'], [11, 10, 7.25, 12.5, 14, 8.75, 'mum_govde'],
    [3.9, 14, 7.6, 4.6, 15.3, 8.4, 'mum_alev'], [7.65, 15, 7.6, 8.35, 16, 8.4, 'mum_alev'], [11.4, 14, 7.6, 12.1, 15.3, 8.4, 'mum_alev']]),
  kumSaati: T1('Kum Saati', { kati: false, ses: 'cam', alet: null, sertlik: 0.4 }, [[4, 0, 4, 12, 1.5, 12, C], [4, 13.5, 4, 12, 15, 12, C], [4.5, 1.5, 4.5, 5.5, 13.5, 5.5, C], [10.5, 1.5, 4.5, 11.5, 13.5, 5.5, C], [4.5, 1.5, 10.5, 5.5, 13.5, 11.5, C], [10.5, 1.5, 10.5, 11.5, 13.5, 11.5, C],
    [6, 1.5, 6, 10, 4, 10, 'kum'], [7.75, 4, 7.75, 8.25, 9, 8.25, 'kum'], [6.5, 10.5, 6.5, 9.5, 13.5, 9.5, 'kum'], [5.8, 1.5, 5.8, 10.2, 6, 10.2, 'cam'], [7, 6, 7, 9, 9, 9, 'cam'], [5.8, 9, 5.8, 10.2, 13.5, 10.2, 'cam']]),
  duvarSaati: T1('Duvar Saati', { kati: false, zeminsiz: true, sertlik: 0.5 }, [[3, 3, 0, 13, 13, 1.5, on(C, 'duvar_saat')], [4, 2, 0, 12, 3, 1.5, C], [4, 13, 0, 12, 14, 1.5, C], [2, 4, 0, 3, 12, 1.5, C], [13, 4, 0, 14, 12, 1.5, C]]),
  kitapYigini: T1('Kitap Yığını', { kati: false, sertlik: 0.4, alet: null, ses: 'yun' }, [kitap(3, 0, 3, 13, 2.5, 11, 'yun_k'), kitap(3.5, 2.5, 4, 12.5, 4.5, 11.5, 'yun_m'), kitap(4, 4.5, 3, 11.5, 6.5, 10, 'yun_y'), kitap(3.5, 6.5, 4.5, 12, 8, 11, 'yun_si'),
    [9, 8, 6, 10.5, 9.8, 7.5, 'mum_govde'], [9.4, 9.8, 6.4, 10.1, 10.8, 7.1, 'mum_alev']]),
  kaktus: T1('Kaktüs Saksısı', { kati: false, ses: 'tas', alet: null, sertlik: 0.3 }, [[5, 0, 5, 11, 5, 11, 'saksi'], [5.5, 5, 5.5, 10.5, 5.2, 10.5, 'toprak'], [6.5, 5, 6.5, 9.5, 15, 9.5, 'kaktus'],
    [3.5, 8, 7, 6.5, 9.5, 9, 'kaktus'], [3.5, 9.5, 7, 5, 12.5, 9, 'kaktus'], [9.5, 10, 7, 12, 11.5, 9, 'kaktus'], [11, 11.5, 7, 12.5, 14, 9, 'kaktus'], [7.5, 15, 7.5, 8.5, 15.6, 8.5, 'yun_k']]),
  monstera: T1('Deve Tabanı', { kati: false, ses: 'bitki', alet: null, sertlik: 0.3 }, [[4.5, 0, 4.5, 11.5, 6, 11.5, 'kil_0'], [5, 6, 5, 11, 6.2, 11, 'toprak'], [7.5, 6, 7.5, 8.5, 12, 8.5, 'monstera'],
    [1, 11, 2, 8, 11.5, 9, 'monstera'], [8, 12.5, 6, 15, 13, 13, 'monstera'], [3, 14, 7, 10, 14.5, 14, 'monstera'], [6.5, 9, 9, 12, 9.5, 15, 'monstera'], [9, 15, 1, 14, 15.5, 7, 'monstera']]),
  bonsai: T1('Bonsai', { kati: false, ses: 'bitki', alet: null, sertlik: 0.3 }, [[2, 0, 4, 14, 2, 12, 'kil_k'], [2.5, 2, 4.5, 13.5, 2.2, 11.5, 'toprak'], [7, 2, 7, 9, 6, 9, 'mese_yan'], [9, 5, 7.5, 12, 6, 8.5, 'mese_yan'], [4, 6, 7.5, 7, 7, 8.5, 'mese_yan'], [7.5, 6, 7.5, 8.5, 9, 8.5, 'mese_yan'],
    [9, 6, 5, 15, 9, 11, 'mese_yaprak'], [1, 7, 5, 7, 9.5, 11, 'mese_yaprak'], [4, 9, 4, 12, 12, 12, 'mese_yaprak']]),
  semsiyelik: T1('Şemsiyelik', { kati: false, ses: 'tas', alet: null, sertlik: 0.5 }, [[4, 0, 4, 12, 10, 12, 'pirinc'], [4.5, 10, 4.5, 11.5, 10.3, 11.5, 'yun_si'], [6, 4, 6, 7.2, 15, 7.2, 'yun_k'], [5.5, 15, 5.5, 6.5, 16, 7, 'yatak_ahsap'],
    [9, 3, 8, 10.2, 14, 9.2, 'yun_si'], [9.2, 14, 8.6, 10, 15, 10.5, 'yatak_ahsap'], [7.5, 3, 9.5, 8.7, 13, 10.7, 'yun_m']]),
  paspas: T1('Kapı Paspası', { kati: false, ses: 'yun', alet: null, sertlik: 0.2 }, [[1, 0, 3, 15, 0.6, 13, 'paspas']]),
  copKovasi: T1('Çöp Kovası', { kati: false, ses: 'tas', alet: 'kazma', sertlik: 1 }, [[4, 0, 4, 12, 10, 12, 'krom'], [3.5, 10, 3.5, 12.5, 11, 12.5, 'krom'], [7, 11, 7.5, 9, 12, 8.5, 'demir_siyah'], [6, 0, 12, 10, 1, 13.5, 'demir_siyah']]),
  metalVaril: T1('Metal Varil', { sandik: true, ses: 'tas', alet: 'kazma', sertlik: 2, harita: 114 }, [[2, 0, 4, 14, 16, 12, ust('varil_yan', 'varil_ust')], [4, 0, 2, 12, 16, 14, ust('varil_yan', 'varil_ust')],
    [1.8, 4, 3.8, 14.2, 5, 12.2, 'varil_yan'], [3.8, 4, 1.8, 12.2, 5, 14.2, 'varil_yan'], [1.8, 11, 3.8, 14.2, 12, 12.2, 'varil_yan'], [3.8, 11, 1.8, 12.2, 12, 14.2, 'varil_yan']]),
  kusKafesi: T1('Kuş Kafesi', { kati: false, ses: 'tas', alet: null, sertlik: 0.6 }, (() => {
    const l = [[3, 0, 3, 13, 1.5, 13, 'pirinc'], [3, 12, 3, 13, 13, 13, 'pirinc'], [5, 13, 5, 11, 14, 11, 'pirinc'], [7, 14, 7, 9, 15.5, 9, 'pirinc'], [7.5, 15.5, 7.5, 8.5, 16, 8.5, 'pirinc'],
      [3.5, 3.5, 7.75, 12.5, 4, 8.25, A], [6.5, 4, 7, 9, 6.5, 9, 'yun_s'], [8.5, 6, 7.5, 10, 7.5, 8.5, 'yun_s'], [10, 6.5, 7.8, 10.6, 6.9, 8.2, 'yun_t'], [5, 4.5, 7.5, 6.5, 5.2, 8.5, 'yun_s']];
    for (let i = 0; i <= 5; i++) { const v = 3 + i * 2; l.push([v, 1.5, 3, v + 0.4, 12, 3.4, 'pirinc'], [v, 1.5, 12.6, v + 0.4, 12, 13, 'pirinc'], [3, 1.5, v, 3.4, 12, v + 0.4, 'pirinc'], [12.6, 1.5, v, 13, 12, v + 0.4, 'pirinc']); }
    return l; })()),
  postaKutusu: T1('Posta Kutusu', { ses: 'tas', alet: 'kazma', sertlik: 1.5, sandik: true }, [[7, 0, 7, 9, 9, 9, A], [4, 9, 3, 12, 14, 13, on('posta_kirmizi', 'posta_on')], [4.5, 14, 3, 11.5, 15, 13, 'posta_kirmizi'], [12, 11, 8, 12.5, 15, 9, 'yun_s'], [12, 14, 8, 12.5, 15, 11, 'yun_s']]),
  bahceCucesi: T1('Bahçe Cücesi', { kati: false, ses: 'tas', alet: null, sertlik: 0.5 }, [[5, 0, 5, 11, 1, 11, 'cimen_ust'], [5.5, 1, 6.5, 7.5, 2, 10, 'yun_si'], [8.5, 1, 6.5, 10.5, 2, 10, 'yun_si'], [5.5, 2, 6, 10.5, 5, 10, 'yun_m'],
    [5, 5, 5.5, 11, 9, 10.5, 'yun_k'], [5, 6, 5.5, 11, 6.6, 10.6, 'yun_si'], [4, 6, 7, 5, 9, 9, 'yun_k'], [11, 6, 7, 12, 9, 9, 'yun_k'], [5.5, 9, 6, 10.5, 12, 10, 'ten'], [5.5, 7.6, 9.8, 10.5, 10.6, 10.6, 'yun'],
    [7.6, 10.4, 10, 8.4, 11.2, 10.8, 'ten'], [5, 12, 5.5, 11, 13, 10.5, 'yun_k'], [6, 13, 6.5, 10, 14.5, 9.5, 'yun_k'], [7, 14.5, 7, 9, 16, 9, 'yun_k']]),
  lavabo: T1('Lavabo', { ses: 'tas', alet: 'kazma', sertlik: 1.5, harita: 2 }, [[0.5, 0, 1, 15.5, 11, 15, on(C, 'dolap_on')], [0, 11, 0.5, 16, 12.5, 15.5, 'mermer'], [3, 12.5, 4, 13, 12.6, 12, 'krom'], [3.5, 12.5, 4.5, 12.5, 12.65, 11.5, 'su'],
    [7, 12.5, 1.5, 9, 15.5, 3, 'krom'], [7.5, 14.5, 3, 8.5, 15.5, 6, 'krom'], [4.5, 12.5, 2, 5.5, 13.5, 3, 'krom'], [10.5, 12.5, 2, 11.5, 13.5, 3, 'krom'], [0, 12.5, 0, 16, 16, 1, 'fayans']]),
  dikisMakinesi: T1('Dikiş Makinesi', { ses: 'tas', alet: 'kazma', sertlik: 1.2 }, [[0, 9.5, 1, 16, 11, 15, C], [1, 0, 2, 2.5, 9.5, 14, 'demir_siyah'], [13.5, 0, 2, 15, 9.5, 14, 'demir_siyah'], [2.5, 1, 5, 13.5, 1.8, 11, 'demir_siyah'],
    [3, 11, 6, 12, 12.5, 10, 'piyano_govde'], [3, 12.5, 7, 5, 15, 9, 'piyano_govde'], [3, 14.5, 7, 12, 16, 9, 'piyano_govde'], [10, 11, 6.5, 12.5, 16, 9.5, 'piyano_govde'],
    [11, 10, 7.75, 11.5, 11, 8.25, 'krom'], [12.5, 11.5, 6, 13.5, 15.5, 10, 'krom'], [5, 14.8, 9, 9, 15.8, 9.1, 'altin_blok']]),
  mangal: T1('Mangal', { istasyon: 'ates', isik: 8, ses: 'tas', alet: 'kazma', sertlik: 2, harita: 2 }, [...bacak4(16, 16, 8, 'demir_siyah', 1, 2), [1, 8, 3, 15, 12, 13, 'demir_siyah'], [2, 11, 4, 14, 11.6, 12, 'kor_yatak'],
    [1.5, 12, 3.5, 14.5, 12.4, 12.5, 'izgara'], [3, 12.4, 6, 13, 13.2, 6.8, 'kebap_sis'], [3, 12.4, 9, 13, 13.2, 9.8, 'kebap_sis'], [0, 10.5, 7.5, 1, 11, 8.5, 'demir_siyah'], [15, 10.5, 7.5, 16, 11, 8.5, 'demir_siyah']]),
  camasirSepeti: T1('Çamaşır Sepeti', { sandik: true, ses: 'yun', sertlik: 0.5 }, [[3, 0, 3, 13, 11, 13, 'sepet'], [3.5, 11, 3.5, 12.5, 12, 12.5, 'yun_m'], [5, 12, 5, 10, 12.8, 9, 'yun'], [9, 12, 7, 12, 12.6, 11, 'yun_k'], [2.5, 8, 7, 3, 10, 9, 'sepet'], [13, 8, 7, 13.5, 10, 9, 'sepet']]),
  odunYigini: T1('Odun Yığını', { ses: 'odun', sertlik: 1.5 }, [kutuk(0.5, 0, 1, 15.5, 4, 5), kutuk(1, 0, 5.5, 15, 4, 9.5), kutuk(0, 0, 10, 16, 4, 14), kutuk(1.5, 4, 3, 14.5, 8, 7), kutuk(0.5, 4, 7.5, 15.5, 8, 11.5), kutuk(2, 8, 5.5, 14, 12, 9.5)]),
  tabela: T1('Ahşap Tabela', { kati: false, sertlik: 1 }, [[7, 0, 7, 9, 10, 9, A], [1, 9, 7.5, 15, 15, 9, on(K, 'tabela_on')], [0.5, 15, 7, 15.5, 16, 9.5, A]]),
  gazLambasi: T1('Gaz Lambası', { isik: 12, kati: false, ses: 'cam', alet: null, sertlik: 0.4, harita: 2 }, [[5, 0, 5, 11, 2, 11, 'pirinc'], [5.5, 2, 5.5, 10.5, 5, 10.5, 'pirinc'], [6, 5, 6, 10, 12, 10, 'cam'], [7.5, 5.5, 7.5, 8.5, 8.5, 8.5, 'mum_alev'],
    [6.5, 12, 6.5, 9.5, 13, 9.5, 'pirinc'], [5, 12.5, 7.75, 11, 13.5, 8.25, 'pirinc'], [5, 9, 7.75, 5.5, 13, 8.25, 'pirinc'], [10.5, 9, 7.75, 11, 13, 8.25, 'pirinc']]),
  tasKesme: T1('Taş Kesme Tezgâhı', { istasyon: 'taskesme', ses: 'tas', alet: 'kazma', sertlik: 2.5, harita: 2 }, [[0, 0, 0, 16, 9, 16, ust('tas_kesme_yan', 'tas_kesme_ust')], [7.5, 9, 3, 8.5, 15, 13, 'krom'], [7, 13, 5, 9, 14, 11, 'demir_siyah'], [0, 9, 0, 16, 9.5, 2, 'demir_siyah']])
});

/* Hücre sayısı ve yerel konum: hücre i -> [lx, ly, lz] (lz tasarımda 0 arka, d - 1 ön) */
for (const [k, D] of Object.entries(COKLU)) { D.tur = k; D.n = D.w * D.d * D.h; }
export const cokluYerel = (D, i) => [i % D.w, Math.floor(i / (D.w * D.d)), Math.floor(i / D.w) % D.d];
/* Tasarım düzleminde yatay kaydırmanın dünyadaki karşılığı (yön 0: kuzey; 1: doğu ...) */
export function cokluDondur(dx, dz, yon) {
  switch (yon & 3) {
    case 1: return [-dz, dx];
    case 2: return [-dx, -dz];
    case 3: return [dz, -dx];
    default: return [dx, dz];
  }
}
/* Kurulumda hedef hücreye gelen tasarım hücresi: ortadaki sütun, ön sıra */
export const cokluCapa = D => [Math.floor((D.w - 1) / 2), D.d - 1];
/* Çapası (ax, ay, az) olan nesnenin bütün hücreleri: [x, y, z, hücre] */
export function cokluHucreler(D, yon, ax, ay, az) {
  const [cx, cz] = cokluCapa(D), l = [];
  for (let i = 0; i < D.n; i++) { const [lx, ly, lz] = cokluYerel(D, i), [dx, dz] = cokluDondur(lx - cx, lz - cz, yon); l.push([ax + dx, ay + ly, az + dz, i]); }
  return l;
}
/* Bir hücre bloğundan çapanın dünyadaki konumu */
export function cokluCapaKonumu(D, b, x, y, z) { const [cx, cz] = cokluCapa(D), [dx, dz] = cokluDondur(b.lx - cx, b.lz - cz, b.yon); return [x - dx, y - b.ly, z - dz]; }
/* Hücrenin kutuları (yön 0, hücre içi 0..1); doku adları korunur */
export function cokluHucreKutulari(D, i) {
  const [lx, ly, lz] = cokluYerel(D, i), out = [];
  for (const k of D.kutular) {
    const a = [Math.max(k[0] / 16, lx), Math.max(k[1] / 16, ly), Math.max(k[2] / 16, lz)], b = [Math.min(k[3] / 16, lx + 1), Math.min(k[4] / 16, ly + 1), Math.min(k[5] / 16, lz + 1)];
    if (a[0] >= b[0] - 1e-4 || a[1] >= b[1] - 1e-4 || a[2] >= b[2] - 1e-4) continue;
    out.push([a[0] - lx, a[1] - ly, a[2] - lz, b[0] - lx, b[1] - ly, b[2] - lz, k[6]]);
  }
  return out;
}
