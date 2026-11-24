/* HungerMan - genel sabitler (ana iş parçacığı ve işçiler ortak kullanır) */
export const SURUM = '0.45.0';

/* Parça (chunk) boyutları: 16 x 16 taban, 256 yükseklik (0.41.0; önceden 128) */
export const PB = 16;            // parça kenarı
export const PY = 256;           // dünya yüksekliği (sürüm 1 dünyalarında arazi yalnızca alttaki 128 blokta bulunur)
export const PHACIM = PB * PB * PY;
export const DENIZ = 48;         // deniz seviyesi

/* Kıta ve dünya sınırı (blok). 0.41.0: dünyanın üretici sürümüne göre değişir (canlı bağlama: dunyaSurumAyarla ile ayarlanır;
   ana iş parçacığı dünya açılırken, işçiler "baslat" iletisinde çağırır).
   Sürüm 1 (eski dünyalar): kıta 2600, sınır 3600, diyar 470, bulut 132. Sürüm 2: kıta 4000, sınır 5400, diyar 690, bulut 196. */
export let URETICI_SURUM = 2;
export let KITA_YARICAP = 4000;
export let DUNYA_SINIRI = 5400;
export let DIYAR_SINIR = 690;         // diyarın merkeze uzaklık sınırı (blok)
export let BULUT_Y = 196;             // bulut katmanının yüksekliği
export let HARITA_OLCEK = 2;          // haritada kara yüksekliği bu sayıya bölünerek bir baytta saklanır
export function dunyaSurumAyarla(s) {
  URETICI_SURUM = s >= 2 ? 2 : 1;
  const yeni = URETICI_SURUM === 2;
  KITA_YARICAP = yeni ? 4000 : 2600; DUNYA_SINIRI = yeni ? 5400 : 3600; DIYAR_SINIR = yeni ? 690 : 470;
  BULUT_Y = yeni ? 196 : 132; HARITA_OLCEK = yeni ? 2 : 1;
}

/* 0.18.0: Yeraltı Diyarı, dünyadan çok uzakta (x = DIYAR_X çevresinde) ayrı bir bölgedir.
   Diyardaki 1 blok, dünyadaki 8 bloğa karşılık gelir: dünya (x, z) <-> diyar (DIYAR_X + x / 8, z / 8). */
export const DIYAR_X = 20000;
export const DIYAR_LAV = 31;          // lav denizinin yüzeyi
export const diyarMi = x => x > 10000;
/* Mevsimler: her biri 7 gün; yıl 28 gün */
export const MEVSIM_GUN = 7;
export const MEVSIMLER = ['İlkbahar', 'Yaz', 'Sonbahar', 'Kış'];
export const mevsimAl = gun => Math.floor(((gun || 1) - 1) / MEVSIM_GUN) % 4;
/* 0.20.0: mevsime göre gün uzunluğu: zamanın gündüz (0-0,5) ve gece (0,5-1) akış hızları; bir tam günün süresi değişmez.
   Yazın gündüz %62,5, kışın %37,5 sürer; ilkbahar ve sonbaharda gece ile gündüz eşittir. */
const ZAMAN_HIZI = [[1, 1], [0.8, 4 / 3], [1, 1], [4 / 3, 0.8]];
export const zamanHizi = (zaman, mevsim) => ZAMAN_HIZI[mevsim || 0][zaman < 0.5 ? 0 : 1];

/* Gün uzunluğu (saniye): 20 dakika */
export const GUN_SURESI = 1200;

/* Parça içi dizin: y katmanlı */
export const dizin = (x, y, z) => (y * PB + z) * PB + x;

/* Dolgulu hacim (meshleme için 18 x 18 x 128) */
export const DB = PB + 2;
export const ddizin = (x, y, z) => (y * DB + (z + 1)) * DB + (x + 1);

export const parcaAnahtar = (cx, cz) => cx + ',' + cz;
