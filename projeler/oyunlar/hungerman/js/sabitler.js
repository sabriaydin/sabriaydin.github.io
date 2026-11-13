/* HungerMan - genel sabitler (ana iş parçacığı ve işçiler ortak kullanır) */
export const SURUM = '0.15.2';

/* Parça (chunk) boyutları: 16 x 16 taban, 128 yükseklik */
export const PB = 16;            // parça kenarı
export const PY = 128;           // dünya yüksekliği
export const PHACIM = PB * PB * PY;
export const DENIZ = 48;         // deniz seviyesi

/* Kıta ve dünya sınırı (blok) */
export const KITA_YARICAP = 2600;
export const DUNYA_SINIRI = 3600;

/* Gün uzunluğu (saniye): 20 dakika */
export const GUN_SURESI = 1200;

/* Parça içi dizin: y katmanlı */
export const dizin = (x, y, z) => (y * PB + z) * PB + x;

/* Dolgulu hacim (meshleme için 18 x 18 x 128) */
export const DB = PB + 2;
export const ddizin = (x, y, z) => (y * DB + (z + 1)) * DB + (x + 1);

export const parcaAnahtar = (cx, cz) => cx + ',' + cz;
