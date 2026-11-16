/* HungerMan - çok bloklu cihazlar (0.25.0): güneş paneli, rüzgâr türbini, su çarkı ve bataryalar
   Bir cihaz, gerçek boyutlarında birden çok hücre kaplar. Her hücre ayrı bir blok kimliğidir: taban + yön * hücreSayısı + hücre.
   Hücreler görünmezdir (yalnızca çarpışma ve seçim kutuları); cihazın görünüşü ve dönen parçaları grafik/cihaz-cizici.js'te çizilir.
   Yerel düzen (yön 0): x ve z ayak izi, y yükseklik; cihazın önü -z (kuzey) tarafıdır. Yön, önün baktığı yöndür (0 kuzey, 1 doğu, 2 güney, 3 batı).
   Kök hücre (hücre 0) cihazın üretimini ve deposunu taşır; diğer hücreler yalnızca ağa iletir.
   Bu dosya işçilerde de kullanılır (THREE içermez). */

/* carp: yerel koordinatta çarpışma kutuları [x0, y0, z0, x1, y1, z1]; port: kablo bağlantı noktası (0.26.0) */
export const CIHAZ = {
  gunes: { port: [1, 0.45, 0.82], ad: 'Güneş Paneli', esya: 497, taban: 626, w: 2, d: 1, h: 1, elektrik: 'gunes', uretim: 10, sertlik: 1.5, alet: 'kazma', ses: 'cam',
    carp: [[0.05, 0, 0.05, 1.95, 0.95, 0.95]], aciklama: 'Gündüzleri en çok 10 E/sn üretir; üstü açık olmalıdır' },
  ruzgar: { port: [1, 0.32, 1.45], ad: 'Rüzgâr Türbini', esya: 498, taban: 634, w: 2, d: 2, h: 8, elektrik: 'ruzgar', uretim: 30, sertlik: 2.5, alet: 'kazma', ses: 'tas',
    carp: [[0.15, 0, 0.15, 1.85, 0.3, 1.85], [0.62, 0.3, 0.62, 1.38, 7.2, 1.38], [0.6, 7.2, 0.25, 1.4, 7.85, 1.95]],
    aciklama: 'En çok 30 E/sn üretir; yükseklik, rüzgâr ve fırtına artırır. Pervanenin döndüğü alan boş olmalıdır' },
  su: { port: [1.5, 1.98, 0.88], ad: 'Su Çarkı', esya: 499, taban: 762, w: 3, d: 1, h: 3, elektrik: 'su', uretim: 16, sertlik: 2, alet: 'balta', ses: 'odun',
    carp: [[0.05, 0, 0.25, 2.95, 2.95, 0.75], [1.35, 0, 0.02, 1.65, 1.7, 0.2], [1.35, 0, 0.8, 1.65, 1.7, 0.98]],
    aciklama: 'Çarkın alt sırasına değen her su bloğu için 1,5 E/sn üretir (en çok 16); kışın yarı yarıya' },
  bataryaK: { port: [0.3, 0.8, 0.48], ad: 'Küçük Batarya', esya: 500, taban: 798, w: 1, d: 1, h: 1, elektrik: 'batarya', kapasite: 1500, sertlik: 2, alet: 'kazma', ses: 'tas',
    carp: [[0.15, 0, 0.2, 0.85, 0.8, 0.8]], aciklama: '1.500 E depolar' },
  bataryaO: { port: [0.5, 1.76, 0.5], ad: 'Orta Batarya', esya: 501, taban: 802, w: 1, d: 1, h: 2, elektrik: 'batarya', kapasite: 6000, sertlik: 2.5, alet: 'kazma', ses: 'tas',
    carp: [[0.1, 0, 0.15, 0.9, 1.75, 0.85]], aciklama: '6.000 E depolar' },
  bataryaB: { port: [1, 1.9, 0.5], ad: 'Büyük Batarya', esya: 502, taban: 810, w: 2, d: 1, h: 2, elektrik: 'batarya', kapasite: 24000, sertlik: 3, alet: 'kazma', ses: 'tas',
    carp: [[0.05, 0, 0.1, 1.95, 1.9, 0.9]], aciklama: '24.000 E depolar' },
  /* 0.28.0: Otomatik Taret: çalışırken 16 blok içindeki canavarlara ok atar */
  taret: { ad: 'Otomatik Taret', esya: 504, taban: 868, w: 1, d: 1, h: 1, elektrik: 'taret', tuketim: 8, sertlik: 3, alet: 'kazma', ses: 'tas',
    carp: [[0.15, 0, 0.15, 0.85, 0.85, 0.85]], aciklama: 'Çalışırken 16 blok içindeki canavarlara ve öfkeli hayvanlara ok atar; 8 E/sn harcar' }
};
for (const [k, C] of Object.entries(CIHAZ)) { C.tur = k; C.n = C.w * C.d * C.h; }
export const CIHAZ_SON = 826;   // ilk boş blok kimliği

/* Hücre dizini <-> yerel konum */
export const hucreYerel = (C, i) => [i % C.w, Math.floor(i / (C.w * C.d)), Math.floor(i / C.w) % C.d];
/* Yerel yatay konumun (kök hücreye göre) dünyadaki kaydırması */
export function dondurXZ(lx, lz, yon) {
  switch (yon & 3) {
    case 1: return [-lz, lx];
    case 2: return [-lx, -lz];
    case 3: return [lz, -lx];
    default: return [lx, lz];
  }
}
/* Kök hücresi (ax, ay, az) olan cihazın bütün hücreleri: [x, y, z, hücre] */
export function cihazHucreleri(C, yon, ax, ay, az) {
  const l = [];
  for (let i = 0; i < C.n; i++) { const [lx, ly, lz] = hucreYerel(C, i), [dx, dz] = dondurXZ(lx, lz, yon); l.push([ax + dx, ay + ly, az + dz, i]); }
  return l;
}
/* Bir hücre bloğundan kök hücrenin konumu */
export function kokKonumu(b, x, y, z) { const [dx, dz] = dondurXZ(b.lx, b.lz, b.yon); return [x - dx, y - b.ly, z - dz]; }
/* Rüzgâr türbini: pervane göbeği (yerel) ve yarıçapı; pervanenin süpürdüğü hücreler */
export const PERVANE = { x: 1, y: 7.52, z: -0.12, r: 3.35 };
export function pervaneHucreleri(yon, ax, ay, az) {
  const l = [], P = PERVANE;
  for (let ly = Math.floor(P.y - P.r); ly <= Math.floor(P.y + P.r); ly++) for (let lx = Math.floor(P.x - P.r) - 1; lx <= Math.ceil(P.x + P.r); lx++) {
    /* hücrenin göbeğe en yakın noktası */
    const nx = Math.max(lx, Math.min(lx + 1, P.x)), ny = Math.max(ly, Math.min(ly + 1, P.y));
    if (Math.hypot(nx - P.x, ny - P.y) > P.r) continue;
    const [dx, dz] = dondurXZ(lx, -1, yon);
    l.push([ax + dx, ay + ly, az + dz]);
  }
  return l;
}

/* Hücrenin çarpışma kutuları (hücre içi 0..1, yön 0'a göre); sekiller.js döndürür */
export function cihazHucreKutulari(C, i) {
  const [lx, ly, lz] = hucreYerel(C, i), out = [];
  for (const k of C.carp) {
    const a = [Math.max(k[0], lx), Math.max(k[1], ly), Math.max(k[2], lz)], b = [Math.min(k[3], lx + 1), Math.min(k[4], ly + 1), Math.min(k[5], lz + 1)];
    if (a[0] >= b[0] - 1e-4 || a[1] >= b[1] - 1e-4 || a[2] >= b[2] - 1e-4) continue;
    out.push([a[0] - lx, a[1] - ly, a[2] - lz, b[0] - lx, b[1] - ly, b[2] - lz]);
  }
  return out;
}
