/* HungerMan - genel sabitler (ana iş parçacığı ve işçiler ortak kullanır) */
export const SURUM = '0.22.0';

/* Parça (chunk) boyutları: 16 x 16 taban, 128 yükseklik */
export const PB = 16;            // parça kenarı
export const PY = 128;           // dünya yüksekliği
export const PHACIM = PB * PB * PY;
export const DENIZ = 48;         // deniz seviyesi

/* Kıta ve dünya sınırı (blok) */
export const KITA_YARICAP = 2600;
export const DUNYA_SINIRI = 3600;

/* 0.18.0: Yeraltı Diyarı, dünyadan çok uzakta (x = DIYAR_X çevresinde) ayrı bir bölgedir.
   Diyardaki 1 blok, dünyadaki 8 bloğa karşılık gelir: dünya (x, z) <-> diyar (DIYAR_X + x / 8, z / 8). */
export const DIYAR_X = 20000;
export const DIYAR_SINIR = 470;       // diyarın merkeze uzaklık sınırı (blok)
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
