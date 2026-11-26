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
  /* 0.28.0: Otomatik Taret: çalışırken 16 blok içindeki canavarlara ok atar
     0.29.0: arbalet başlı taret; ok haznesi (sağ tık) elle doldurulur, her atış 1 ok harcar. Önüne bakan 180° görüş alanında arar, arkadan yalnızca 2 bloğa kadar sezer */
  taret: { ad: 'Otomatik Taret', esya: 504, taban: 868, w: 1, d: 1, h: 1, elektrik: 'taret', tuketim: 8, sertlik: 3, alet: 'kazma', ses: 'tas', sandik: true,
    carp: [[0.12, 0, 0.12, 0.88, 0.9, 0.88]], aciklama: 'Çalışırken önündeki 180° alanda, 16 blok içindeki canavarlara ok atar (ok haznesi sağ tıkla doldurulur); 8 E/sn harcar' }
};
/* ---------- 0.53.0: Şebeke güncellemesi: yeni çok bloklu cihazlar ----------
   Hücre kimlikleri 3100'den başlayarak sırayla ayrılır (yalnızca sona eklenir). durum: 2 olan cihazların çalışan (açık) hâli ayrı hücre kimlikleriyle
   tutulur: taban + (açık * 4 + yön) * hücreSayısı + hücre. carpAcik: açık hâlin çarpışma kutuları; isikHucre: açıkken ışık veren hücre.
   hazne: cihazın her hücresinden kök hücredeki hazne (sandık) açılır. */
let T53 = 3100;
const yeni53 = (k, C) => { C.taban = T53; T53 += C.w * C.d * C.h * 4 * (C.durum ? 2 : 1); CIHAZ[k] = C; };
const M53 = { sertlik: 3, alet: 'kazma', ses: 'tas' };
yeni53('buhar', { ...M53, ad: 'Buhar Jeneratörü', esya: 3028, w: 3, d: 2, h: 3, elektrik: 'buhar', uretim: 60, sertlik: 3.5, sandik: true, hazne: true,
  carp: [[0, 0, 0, 3, 0.18, 2], [0.12, 0.18, 0.3, 1.92, 1.62, 1.7], [2.02, 0.18, 0.35, 2.92, 1.3, 1.65], [0.2, 1.62, 1.12, 0.72, 2.95, 1.64]],
  aciklama: 'Kömür ya da odun yakıp kazandaki suyu buhara çevirerek en çok 60 E/sn üretir; kazanın yanında su bulunmalıdır. Basınç 10 saniyede dolar. Sağ tık: yakıt deposu' });
yeni53('jeotermal', { ...M53, ad: 'Jeotermal Jeneratör', esya: 3029, w: 2, d: 2, h: 3, elektrik: 'jeotermal', uretim: 45,
  carp: [[0, 0, 0, 2, 0.22, 2], [0.2, 0.22, 0.5, 1.8, 1.95, 1.8], [0.4, 0.22, 0.08, 1.6, 0.9, 0.5], [0.82, 1.95, 1.0, 1.18, 2.95, 1.36]],
  aciklama: 'Lavın ısısıyla yakıtsız ve kesintisiz enerji üretir: tabanın altına ya da yanına (3 blok içinde) değen her lav bloğu için 15 E/sn, en çok 45. Yeraltı Diyarı\'nda da çalışır' });
yeni53('takip', { ...M53, ad: 'Güneş Takip Sistemi', esya: 3030, w: 2, d: 2, h: 3, elektrik: 'takip', uretim: 28, sertlik: 2, ses: 'cam',
  carp: [[0.35, 0, 0.35, 1.65, 0.22, 1.65], [0.86, 0.22, 0.86, 1.14, 2.3, 1.14]],
  aciklama: 'Paneli gün boyunca güneşe döner; gündüz en çok 28 E/sn üretir. Paneli gölgede kalmamalıdır' });
yeni53('paratoner', { ...M53, ad: 'Paratoner', esya: 3031, w: 1, d: 1, h: 6, elektrik: 'paratoner', kapasite: 8000, sertlik: 3,
  carp: [[0.1, 0, 0.12, 0.9, 0.72, 0.88], [0.36, 0.72, 0.36, 0.64, 5.95, 0.64]],
  aciklama: 'Fırtınada 48 blok içindeki yıldırımları kendine çeker; her yıldırım 5.000 E depolar (en çok 8.000 E), en çok 150 E/sn verir' });
yeni53('konteyner', { ...M53, ad: 'Enerji Depolama Konteyneri', esya: 3032, w: 4, d: 2, h: 3, elektrik: 'batarya', kapasite: 150000, sertlik: 4,
  carp: [[0.05, 0, 0.12, 3.95, 2.72, 1.9]], aciklama: '150.000 E depolar; 250 E/sn şarj olur ve verir' });
yeni53('direk', { ...M53, ad: 'Elektrik Direği', esya: 3033, w: 1, d: 1, h: 7, elektrik: 'direk', sertlik: 2, alet: 'balta', ses: 'odun',
  carp: [[0.38, 0, 0.38, 0.62, 6.95, 0.62]], aciklama: 'Bir girişi ve iki çıkışı vardır; gücü taleplere göre böler. İki direk arasındaki kablo parçası 32, kablonun tamamı 64 blok olabilir' });
yeni53('olcer', { ...M53, ad: 'Güç Ölçer', esya: 3034, w: 1, d: 1, h: 1, elektrik: 'olcer', sertlik: 1,
  carp: [[0.18, 0, 0.3, 0.82, 0.56, 0.72]], aciklama: 'Girişinden çıkışına geçen gücü ekranında gösterir; kendisi enerji harcamaz' });
yeni53('tv', { ...M53, ad: 'Televizyon', esya: 3035, w: 2, d: 1, h: 2, elektrik: 'tv', tuketim: 1.2, sertlik: 1.5,
  carp: [[0.05, 0, 0.22, 1.95, 0.5, 0.9], [0.1, 0.6, 0.44, 1.9, 1.74, 0.54]], aciklama: '1,2 E/sn harcar · Sağ tık: kanal değiştir (belgesel, haber, maç, hava durumu)' });
yeni53('camasir', { ...M53, ad: 'Çamaşır Makinesi', esya: 3036, w: 1, d: 1, h: 1, elektrik: 'camasir', tuketim: 2.5, sertlik: 2, sandik: true, hazne: true,
  carp: [[0.06, 0, 0.08, 0.94, 0.92, 0.92]], aciklama: '2,5 E/sn harcar · Haznesindeki renkli yünleri yıkayıp beyaza döndürür (parti başına 4 sn)' });
yeni53('kepenk', { ...M53, ad: 'Güvenlik Kepengi', esya: 3037, w: 2, d: 1, h: 3, elektrik: 'kepenk', tuketim: 1, sertlik: 5, durum: 2,
  carp: [[0, 0, 0.3, 0.14, 3, 0.7], [1.86, 0, 0.3, 2, 3, 0.7], [0, 2.55, 0.25, 2, 3, 0.75], [0.14, 0, 0.42, 1.86, 2.55, 0.58]],
  carpAcik: [[0, 0, 0.3, 0.14, 3, 0.7], [1.86, 0, 0.3, 2, 3, 0.7], [0, 2.55, 0.25, 2, 3, 0.75]],
  aciklama: 'Güç geldiğinde açılır, kesilince iner (1 E/sn). Düğme, algılayıcı ya da şalterle otomatik kapı olur' });
yeni53('kamera', { ...M53, ad: 'Güvenlik Kamerası', esya: 3038, w: 1, d: 1, h: 1, elektrik: 'kamera', tuketim: 0.5, sertlik: 1.5,
  carp: [[0.3, 0, 0.3, 0.7, 0.95, 0.7]], aciklama: '0,5 E/sn harcar · Çalışırken çevreyi tarar; görüntüsü 64 blok içindeki monitörlerde izlenir' });
yeni53('monitor', { ...M53, ad: 'Güvenlik Monitörü', esya: 3039, w: 1, d: 1, h: 1, elektrik: 'monitor', tuketim: 0.5, sertlik: 1.5,
  carp: [[0.08, 0, 0.3, 0.92, 0.78, 0.72]], aciklama: '0,5 E/sn harcar · 64 blok içindeki çalışan güvenlik kameralarının canlı görüntüsünü gösterir · Sağ tık: sonraki kamera' });
yeni53('alarm', { ...M53, ad: 'Alarm Sireni', esya: 3040, w: 1, d: 1, h: 1, elektrik: 'alarm', tuketim: 0.5, sertlik: 1.5, durum: 2, isikHucre: 0, isik: 9,
  carp: [[0.2, 0, 0.22, 0.8, 0.85, 0.8]], aciklama: 'Güç geldiğinde siren çalar ve döner ışık yanar (0,5 E/sn). Hareket algılayıcıyla hırsız alarmı olur' });
yeni53('ark', { ...M53, ad: 'Ark Ergitme Ocağı', esya: 3041, w: 2, d: 2, h: 3, elektrik: 'ark', tuketim: 15, sertlik: 4, sandik: true, hazne: true, durum: 2, isikHucre: 0, isik: 12,
  carp: [[0.05, 0, 0.05, 1.95, 1.45, 1.95], [0.3, 1.45, 0.3, 1.7, 2.95, 1.7]],
  aciklama: '15 E/sn harcar · Haznesindeki cevherleri, tozları ve fırın malzemelerini aynı anda iki parti hâlinde 1,5 saniyede eritir; yakıt gerekmez' });
yeni53('kereste', { ...M53, ad: 'Elektrikli Kereste Tezgâhı', esya: 3042, w: 2, d: 1, h: 1, elektrik: 'kereste', tuketim: 3, sertlik: 2, alet: 'balta', ses: 'odun', sandik: true, hazne: true,
  carp: [[0.05, 0, 0.1, 1.95, 0.86, 0.9]], aciklama: '3 E/sn harcar · Kütükten 6 kalas (elle 4), kalastan 3 çubuk biçer (parti başına 2 sn)' });
yeni53('kirici', { ...M53, ad: 'Taş Kırıcı', esya: 3043, w: 1, d: 1, h: 2, elektrik: 'kirici', tuketim: 4, sertlik: 3, sandik: true, hazne: true,
  carp: [[0.08, 0, 0.08, 0.92, 1.95, 0.92]], aciklama: '4 E/sn harcar · Ham cevherleri ikişer toz hâline getirir (tozlar eritilince külçe olur); taşı parke taşa, parke taşı çakıla, çakılı kuma, kemiği kemik tozuna öğütür' });
yeni53('matkap', { ...M53, ad: 'Maden Matkabı', esya: 3044, w: 3, d: 3, h: 4, elektrik: 'matkap', tuketim: 20, sertlik: 4, sandik: true, hazne: true,
  carp: [[0, 0, 0, 3, 0.2, 1], [0, 0, 2, 3, 0.2, 3], [0, 0, 1, 1, 0.2, 2], [2, 0, 1, 3, 0.2, 2],
    [0.05, 0.2, 0.05, 0.32, 3.6, 0.32], [2.68, 0.2, 0.05, 2.95, 3.6, 0.32], [0.05, 0.2, 2.68, 0.32, 3.6, 2.95], [2.68, 0.2, 2.68, 2.95, 3.6, 2.95],
    [0.6, 3.6, 0.6, 2.4, 3.95, 2.4], [2.05, 0.2, 2.05, 2.95, 1.15, 2.95]],
  aciklama: '20 E/sn harcar · Ortasından aşağıya bir kuyu kazar; geçtiği her katta 2 blok çevresindeki cevherleri de çıkarır. Kazılanlar haznede toplanır; sıvıya ya da ana kayaya gelince durur' });
yeni53('pompa', { ...M53, ad: 'Sıvı Pompası', esya: 3045, w: 1, d: 1, h: 2, elektrik: 'pompa', tuketim: 3, sertlik: 2.5,
  carp: [[0.12, 0, 0.12, 0.88, 1.35, 0.88]], aciklama: '3 E/sn harcar · Altındaki ve çevresindeki (4 blok yarıçap, 8 blok derinlik) su ve lavı yarım saniyede bir blok boşaltır' });
yeni53('sokak', { ...M53, ad: 'LED Sokak Lambası', esya: 3046, w: 1, d: 1, h: 5, elektrik: 'sokak', tuketim: 0.6, sertlik: 2, durum: 2, isikHucre: 4, isik: 15,
  carp: [[0.28, 0, 0.28, 0.72, 0.3, 0.72], [0.42, 0.3, 0.42, 0.58, 4.95, 0.58]], aciklama: '0,6 E/sn harcar · Güçlü beyaz ışık verir. Gün ışığı algılayıcısıyla geceleri kendiliğinden yanar' });

for (const [k, C] of Object.entries(CIHAZ)) { C.tur = k; C.n = C.w * C.d * C.h; }
export const CIHAZ53_SON = T53;   // 0.53.0: ilk boş kimlik
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
export function cihazHucreKutulari(C, i, acik = 0) {
  const [lx, ly, lz] = hucreYerel(C, i), out = [];
  for (const k of (acik && C.carpAcik) || C.carp) {   // 0.53.0: açık hâlin kutuları
    const a = [Math.max(k[0], lx), Math.max(k[1], ly), Math.max(k[2], lz)], b = [Math.min(k[3], lx + 1), Math.min(k[4], ly + 1), Math.min(k[5], lz + 1)];
    if (a[0] >= b[0] - 1e-4 || a[1] >= b[1] - 1e-4 || a[2] >= b[2] - 1e-4) continue;
    out.push([a[0] - lx, a[1] - ly, a[2] - lz, b[0] - lx, b[1] - ly, b[2] - lz]);
  }
  return out;
}
