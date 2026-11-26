/* HungerMan - çok bloklu cihazların çizimi ve yerleştirme önizlemesi (0.25.0)
   Cihaz hücreleri dünya meshinde görünmezdir; her cihaz, kök hücresinde kurulan bir model olarak çizilir:
   - Güneş Paneli: ayaklar üstünde öne eğik iki parçalı panel.
   - Rüzgâr Türbini: beton taban, daralan kule, gövde (nasel) ve üç kanatlı dönen pervane (hız üretime bağlıdır).
   - Su Çarkı: iki ayak, mil, jeneratör ve kepçeli dönen ahşap çark.
   - Bataryalar: gövde ve önde doluluğu gösteren ışıklı gösterge.
   Modeller yerel düzende tanımlanır (cihazlar.js): kök hücrenin köşesi başlangıçtır, ön -z tarafıdır.
   Önizleme: elde cihaz ya da yönlü blok tutulurken konulacağı yerde yarı saydam hayalet model; uygunsa yeşil, değilse kırmızı. */
import { THREE } from './sahne.js';
import { T, YUZ_DOKU, BLOKLAR, ATLAS_N } from '../bloklar.js';
import { CIHAZ, PERVANE } from '../cihazlar.js';
import { sekilKutulari } from '../sekiller.js';
import { cihazUretim } from '../oyun/elektrik.js';
import { portlar, portBilgi } from '../oyun/kablolar.js';

const EPS = 0.0008;
const GOLGE = [0.8, 0.8, 1, 0.55, 0.88, 0.88];   // +x, -x, +y, -y, +z, -z yüz aydınlığı

/* Kutular -> geometri. k: [x0, y0, z0, x1, y1, z1]; t: döşeme (tek sayı ya da 6 yüz dizisi); m: dönüşüm (isteğe bağlı).
   Yüzler 1 birimlik parçalara bölünür; her parça dokunun ilgili bölümünü alır (bloklarla aynı doku ölçeği). */
function kutuGeo(liste) {
  const p = [], uv = [], c = [], ix = [];
  const v3 = new THREE.Vector3();
  for (const { k, t, m } of liste) {
    const [x0, y0, z0, x1, y1, z1] = k;
    for (let f = 0; f < 6; f++) {
      const doku = Array.isArray(t) ? t[f] : t, tx = doku % ATLAS_N, ty = (doku / ATLAS_N) | 0;
      const eks = f >> 1, poz = !(f & 1);
      /* yüzün iki ekseni: u ve v */
      const ua = eks === 0 ? 2 : 0, va = eks === 1 ? 2 : 1;
      const lo = [x0, y0, z0], hi = [x1, y1, z1], sabit = poz ? hi[eks] : lo[eks];
      for (let u = lo[ua]; u < hi[ua] - 1e-6; u = Math.min(hi[ua], Math.floor(u + 1 + 1e-6))) {
        const u2 = Math.min(hi[ua], Math.floor(u + 1 + 1e-6));
        for (let v = lo[va]; v < hi[va] - 1e-6; v = Math.min(hi[va], Math.floor(v + 1 + 1e-6))) {
          const v2 = Math.min(hi[va], Math.floor(v + 1 + 1e-6));
          const taban = p.length / 3;
          for (const [a, b] of [[u, v], [u2, v], [u2, v2], [u, v2]]) {
            const q = [0, 0, 0]; q[eks] = sabit; q[ua] = a; q[va] = b;
            v3.set(q[0], q[1], q[2]); if (m) v3.applyMatrix4(m);
            p.push(v3.x, v3.y, v3.z);
            const lu = a - Math.floor(u + 1e-6), lv = b - Math.floor(v + 1e-6);
            uv.push((tx + EPS + Math.min(1, lu) * (1 - 2 * EPS)) / ATLAS_N, 1 - (ty + 1 - EPS - Math.min(1, lv) * (1 - 2 * EPS)) / ATLAS_N);
            c.push(GOLGE[f], GOLGE[f], GOLGE[f]);
          }
          ix.push(taban, taban + 1, taban + 2, taban, taban + 2, taban + 3);
        }
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
  g.setIndex(ix);
  g.computeBoundingSphere();
  return g;
}
const yuzler = (ust, yan, alt = ust, on = yan) => [yan, yan, ust, alt, yan, on];   // +x, -x, +y, -y, +z, -z (ön)
const donZ = a => new THREE.Matrix4().makeRotationZ(a);

/* ---------- Modeller ---------- */
/* Her model: statik kutular, dönen parça (merkez, kutular, eksen 'z'), göstergeler (batarya), eğik parçalar */
function modeller() {
  const D = T.demir_cubuk, P = T.panel_yan, G = T.turbin_govde, K = T.kalas, KK = T.kalas_koyu, BY = T.batarya_yan0, BU = T.batarya_ust;
  const M = {};
  /* Güneş Paneli (2 × 1) */
  M.gunes = {
    statik: [
      ...[0.24, 1.76].flatMap(x => [{ k: [x - 0.07, 0, 0.12, x + 0.07, 0.44, 0.26], t: D }, { k: [x - 0.07, 0, 0.74, x + 0.07, 0.88, 0.88], t: D }, { k: [x - 0.12, 0, 0.06, x + 0.12, 0.05, 0.94], t: P }]),
      { k: [0.17, 0.36, 0.13, 1.83, 0.42, 0.25], t: D }, { k: [0.17, 0.8, 0.75, 1.83, 0.86, 0.87], t: D }
    ],
    egik: [{ merkez: [1, 0.66, 0.5], rx: -0.46, kutular: [{ k: [-0.98, -0.035, -0.52, 0.98, 0.035, 0.52], t: yuzler(T.gunes_panel, P, P) }, { k: [-0.98, -0.06, -0.52, 0.98, -0.035, -0.47], t: D }] }]
  };
  /* Rüzgâr Türbini (2 × 2 × 8) */
  const kanat = [];
  for (let i = 0; i < 3; i++) { const m = donZ(i * Math.PI * 2 / 3); kanat.push({ k: [-0.15, 0.2, -0.05, 0.15, 1.3, 0.03], t: G, m }, { k: [-0.1, 1.3, -0.04, 0.1, 2.6, 0.02], t: G, m }, { k: [-0.06, 2.6, -0.03, 0.06, PERVANE.r, 0.015], t: G, m }); }
  M.ruzgar = {
    statik: [
      { k: [0.15, 0, 0.15, 1.85, 0.3, 1.85], t: T.kesme_tas },
      { k: [0.62, 0.3, 0.62, 1.38, 2.6, 1.38], t: G }, { k: [0.66, 2.6, 0.66, 1.34, 5, 1.34], t: G }, { k: [0.7, 5, 0.7, 1.3, 7.25, 1.3], t: G },
      { k: [0.86, 0.3, 0.6, 1.14, 0.95, 0.62], t: BU },   // bakım kapısı
      { k: [0.6, 7.2, 0.25, 1.4, 7.85, 1.95], t: G }, { k: [0.64, 7.85, 0.6, 1.36, 7.9, 1.7], t: P }
    ],
    donen: { merkez: [PERVANE.x, PERVANE.y, PERVANE.z], kutular: [{ k: [-0.2, -0.2, -0.32, 0.2, 0.2, 0.37], t: G }, { k: [-0.12, -0.12, -0.42, 0.12, 0.12, -0.32], t: G }, ...kanat] }
  };
  /* Su Çarkı (3 × 1 × 3): çark yerel z ekseninde döner */
  const cark = [{ k: [-0.2, -0.2, -0.26, 0.2, 0.2, 0.26], t: D }];
  for (let i = 0; i < 8; i++) { const m = donZ(i * Math.PI / 4); cark.push({ k: [-0.035, 0.18, -0.21, 0.035, 1.36, -0.15], t: KK, m }, { k: [-0.035, 0.18, 0.15, 0.035, 1.36, 0.21], t: KK, m }); }
  for (let i = 0; i < 16; i++) { const m = donZ(i * Math.PI / 8); cark.push({ k: [-0.29, 1.3, -0.23, 0.29, 1.4, -0.14], t: K, m }, { k: [-0.29, 1.3, 0.14, 0.29, 1.4, 0.23], t: K, m }); }
  for (let i = 0; i < 12; i++) cark.push({ k: [-0.045, 1.02, -0.23, 0.045, 1.47, 0.23], t: K, m: donZ(i * Math.PI / 6 + 0.13) });
  M.su = {
    statik: [
      ...[[0.02, 0.2], [0.8, 0.98]].flatMap(([a, b]) => [{ k: [1.4, 0, a, 1.6, 1.62, b], t: KK }, { k: [0.95, 0, a, 2.05, 0.12, b], t: KK }, { k: [1.05, 0.12, a + 0.04, 1.15, 0.9, b - 0.04], t: KK }, { k: [1.85, 0.12, a + 0.04, 1.95, 0.9, b - 0.04], t: KK }]),
      { k: [1.44, 1.44, 0, 1.56, 1.56, 1], t: D },
      { k: [1.22, 1.62, 0.74, 1.78, 1.98, 1], t: yuzler(BU, T.eocak_yan) }
    ],
    donen: { merkez: [1.5, 1.5, 0.5], kutular: cark }
  };
  /* Bataryalar (0.26.0): kasa, etiket, havalandırma, kutup başları ve LED göstergesi.
     gosterge: [x0, x1, y0, y1, ön z, LED sayısı, yatay mı] */
  const KS = T.batarya_kasa, ET = T.batarya_etiket, HV = T.havalandirma, UY = T.uyari, KR = T.led_kirmizi;
  M.bataryaK = {   // akü: kapaklı kasa, kırmızı (+) ve gri (−) kutup, taşıma kulpu
    statik: [{ k: [0.14, 0, 0.22, 0.86, 0.6, 0.78], t: yuzler(BU, KS, KS, ET) }, { k: [0.12, 0.6, 0.2, 0.88, 0.68, 0.8], t: BU },
      { k: [0.2, 0.68, 0.36, 0.34, 0.72, 0.6], t: BU }, { k: [0.66, 0.68, 0.36, 0.8, 0.72, 0.6], t: BU },
      { k: [0.24, 0.72, 0.42, 0.32, 0.8, 0.54], t: KR }, { k: [0.68, 0.72, 0.42, 0.76, 0.8, 0.54], t: D },
      { k: [0.42, 0.68, 0.47, 0.45, 0.82, 0.53], t: KK }, { k: [0.55, 0.68, 0.47, 0.58, 0.82, 0.53], t: KK }, { k: [0.42, 0.82, 0.47, 0.58, 0.85, 0.53], t: KK },
      { k: [0.14, 0, 0.215, 0.86, 0.05, 0.22], t: UY }],
    gosterge: [[0.3, 0.7, 0.085, 0.15, 0.22, 5, true]]
  };
  M.bataryaO = {   // ev tipi batarya: yüksek kasa, etiket, alt havalandırma, dikey LED çubuğu, üst bağlantı kutusu
    statik: [{ k: [0.1, 0.04, 0.16, 0.9, 1.66, 0.84], t: yuzler(BU, KS) }, { k: [0.12, 1.66, 0.18, 0.88, 1.72, 0.82], t: BU },
      { k: [0.12, 0, 0.18, 0.2, 0.04, 0.82], t: D }, { k: [0.8, 0, 0.18, 0.88, 0.04, 0.82], t: D },
      { k: [0.22, 1.08, 0.15, 0.78, 1.5, 0.16], t: ET }, { k: [0.2, 0.14, 0.15, 0.8, 0.46, 0.16], t: HV },
      { k: [0.38, 1.72, 0.38, 0.62, 1.79, 0.62], t: D },
      ...[0.35, 0.65, 0.95, 1.25].flatMap(y => [{ k: [0.07, y, 0.3, 0.1, y + 0.16, 0.7], t: HV }, { k: [0.9, y, 0.3, 0.93, y + 0.16, 0.7], t: HV }])],
    gosterge: [[0.44, 0.56, 0.56, 1.0, 0.15, 5, false]]
  };
  M.bataryaB = {   // endüstriyel batarya dolabı: iki kapak, havalandırma, etiketler, kulplar, tehlike şeridi, üst fan
    statik: [{ k: [0.04, 0.06, 0.1, 1.96, 1.84, 0.9], t: yuzler(BU, KS) }, { k: [0.08, 1.84, 0.14, 1.92, 1.9, 0.86], t: BU },
      { k: [0.04, 0, 0.09, 1.96, 0.06, 0.91], t: UY }, { k: [0.985, 0.08, 0.085, 1.015, 1.82, 0.1], t: D },
      ...[0, 1].flatMap(i => [{ k: [0.16 + i, 0.16, 0.085, 0.84 + i, 0.56, 0.1], t: HV }, { k: [0.2 + i, 1.28, 0.085, 0.62 + i, 1.68, 0.1], t: ET }, { k: [0.86 + i, 0.8, 0.06, 0.9 + i, 1.1, 0.1], t: D }]),
      { k: [0.55, 1.9, 0.3, 1.45, 1.98, 0.7], t: HV }, { k: [0.9, 1.98, 0.42, 1.1, 2.0, 0.58], t: D }],
    gosterge: [[0.68, 0.8, 0.64, 1.2, 0.1, 6, false], [1.68, 1.8, 0.64, 1.2, 0.1, 6, false]]
  };
  /* 0.28.0: Otomatik Taret; 0.29.0: arbalet taret: taban, ok sandığı, döner tabla, çatal (yaw) ve üstünde eğilen arbalet (pitch): ahşap kundak,
     yaylar, gergin kiriş, yüklü ok ve ok şarjörü. Çatalın arkasında ışık saçmayan durum lambası: tehlikede kırmızı, aksi hâlde yeşil, güçsüzken sönük */
  const kiris = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0); return { k: [-L / 2, 0, -0.004, L / 2, 0.008, 0.004], t: D, m: new THREE.Matrix4().makeRotationY(-Math.atan2(z1 - z0, x1 - x0)).setPosition((x0 + x1) / 2, 0.012, (z0 + z1) / 2) }; };
  M.taret = {
    statik: [{ k: [0.12, 0, 0.12, 0.88, 0.08, 0.88], t: yuzler(BU, KS) }, { k: [0.18, 0.08, 0.18, 0.82, 0.1, 0.82], t: UY },
      { k: [0.28, 0.08, 0.64, 0.72, 0.32, 0.86], t: KK }, { k: [0.26, 0.32, 0.62, 0.74, 0.35, 0.88], t: D },   // ok sandığı
      { k: [0.41, 0.08, 0.41, 0.59, 0.46, 0.59], t: D }, { k: [0.3, 0.46, 0.3, 0.7, 0.52, 0.7], t: BU }],
    kafa: { merkez: [0.5, 0.6, 0.5], kutular: [{ k: [-0.2, -0.08, -0.08, 0.2, -0.04, 0.08], t: D }, { k: [-0.2, -0.04, -0.05, -0.16, 0.12, 0.05], t: D }, { k: [0.16, -0.04, -0.05, 0.2, 0.12, 0.05], t: D },
      { k: [-0.03, -0.04, 0.08, 0.03, 0.12, 0.12], t: D }],
      isik: [-0.045, 0.12, 0.072, 0.045, 0.18, 0.128],
      namlu: { merkez: [0, 0.06, 0], kutular: [
        { k: [-0.05, -0.04, -0.34, 0.05, 0.035, 0.3], t: KK }, { k: [-0.07, -0.08, 0.12, 0.07, 0.035, 0.3], t: BU }, { k: [-0.016, -0.12, 0.16, 0.016, -0.08, 0.2], t: D },
        { k: [-0.08, -0.025, -0.31, 0.08, 0.035, -0.26], t: D },
        { k: [-0.25, -0.015, -0.29, -0.08, 0.025, -0.25], t: KK }, { k: [-0.39, -0.015, -0.25, -0.25, 0.025, -0.21], t: KK }, { k: [-0.43, -0.02, -0.21, -0.38, 0.03, -0.17], t: D },
        { k: [0.08, -0.015, -0.29, 0.25, 0.025, -0.25], t: KK }, { k: [0.25, -0.015, -0.25, 0.39, 0.025, -0.21], t: KK }, { k: [0.38, -0.02, -0.21, 0.43, 0.03, -0.17], t: D },
        kiris(-0.405, -0.19, 0, 0.07), kiris(0, 0.07, 0.405, -0.19),
        { k: [-0.008, 0.035, -0.4, 0.008, 0.05, 0.07], t: K }, { k: [-0.016, 0.03, -0.45, 0.016, 0.055, -0.4], t: D },
        { k: [-0.065, 0.035, -0.04, 0.065, 0.13, 0.12], t: KK }, { k: [-0.07, 0.13, -0.05, 0.07, 0.145, 0.13], t: D }] } }
  };
  /* ---------- 0.53.0: Şebeke güncellemesi modelleri ----------
     Ek parçalar: donenler (eksen x / y / z, hiz: çalışırken açısal hız), isikli (ışık saçmayan parlak parçalar, kosul: acik / kapali / yaniyor; don: dönen),
     kosullu (dokulu, koşula göre görünen), ekran (dinamik görüntü), perde (kepenk), sonda (matkap tiji), ibre (gösterge iğnesi) */
  const KZ = T.kazan, BR = T.boru53, KN = T.konteyner, JK = T.jeo_kaplama, KF = T.kafes, IZ = T.izolator, EK = T.ekran_kasa, KPK = T.kepenk_kutu, KG = T.kamera_govde,
    RF = T.refrakter, EL = T.elektrot, SM = T.sari_metal, PG = T.pompa_govde, BG = T.beyaz_govde, BT = T.beton53, SB = T.siyah_tugla;
  const ryY = (a, x, y, z) => new THREE.Matrix4().makeRotationY(a).setPosition(x, y, z), rxX = (a, x, y, z) => new THREE.Matrix4().makeRotationX(a).setPosition(x, y, z),
    rzZ = (a, x, y, z) => new THREE.Matrix4().makeRotationZ(a).setPosition(x, y, z);
  /* Sekizgen silindir (iki kare prizmanın birleşimi): eksen boyunca h0..h1, merkez c (eksen dışı iki bileşen) */
  const sil = (eksen, c, r, h0, h1, t) => {
    const b = r * 0.924;   // kare yarı kenarı (sekizgenin iç teğet yarıçapı)
    return [0, Math.PI / 4].map(q => eksen === 'y' ? { k: [-b, h0, -b, b, h1, b], t, m: ryY(q, c[0], 0, c[2]) }
      : eksen === 'x' ? { k: [h0, -b, -b, h1, b, b], t, m: rxX(q, 0, c[1], c[2]) } : { k: [-b, -b, h0, b, b, h1], t, m: rzZ(q, c[0], c[1], 0) });
  };
  /* Çark: eksen etrafında jant, kollar ve göbek (yerel merkezde) */
  const carkK = (eksen, r, kal, t, kol = 4) => {
    const l = [], don = eksen === 'x' ? q => new THREE.Matrix4().makeRotationX(q) : eksen === 'y' ? q => new THREE.Matrix4().makeRotationY(q) : q => new THREE.Matrix4().makeRotationZ(q);
    const n = 12, ten = r * Math.tan(Math.PI / n) * 1.05;
    for (let i = 0; i < n; i++) l.push({ k: eksen === 'x' ? [-kal, r - 0.07, -ten, kal, r, ten] : eksen === 'y' ? [-ten, -kal, r - 0.07, ten, kal, r] : [-ten, r - 0.07, -kal, ten, r, kal], t, m: don(i * Math.PI * 2 / n) });
    for (let i = 0; i < kol; i++) l.push({ k: eksen === 'x' ? [-kal * 0.6, -r, -0.025, kal * 0.6, r, 0.025] : eksen === 'y' ? [-0.025, -kal * 0.6, -r, 0.025, kal * 0.6, r] : [-0.025, -r, -kal * 0.6, 0.025, r, kal * 0.6], t, m: don(i * Math.PI / kol) });
    l.push({ k: [-0.06, -0.06, -0.06, 0.06, 0.06, 0.06], t: D });
    return l;
  };
  const kanatlar = (eksen, r, n, t) => { const l = []; for (let i = 0; i < n; i++) { const q = i * Math.PI * 2 / n; l.push(eksen === 'y' ? { k: [-0.03, -0.008, 0, 0.03, 0.008, r], t, m: new THREE.Matrix4().makeRotationY(q) } : eksen === 'x' ? { k: [-0.008, 0, -0.03, 0.008, r, 0.03], t, m: new THREE.Matrix4().makeRotationX(q) } : { k: [-0.03, 0, -0.008, 0.03, r, 0.008], t, m: donZ(q) }); } l.push({ k: [-0.04, -0.04, -0.04, 0.04, 0.04, 0.04], t: D }); return l; };
  const kirisXZ = (x0, y, z0, x1, z1, w, t) => { const L = Math.hypot(x1 - x0, z1 - z0); return { k: [-L / 2, -w, -w, L / 2, w, w], t, m: new THREE.Matrix4().makeRotationY(-Math.atan2(z1 - z0, x1 - x0)).setPosition((x0 + x1) / 2, y, (z0 + z1) / 2) }; };

  /* Buhar Jeneratörü (3 × 2 × 3): kızak, perçinli kazan, ocak kapağı, tuğla baca, buhar kubbesi ve borular, volan, jeneratör, manometre */
  M.buhar = {
    statik: [{ k: [0, 0, 0, 3, 0.18, 2], t: yuzler(BU, D) }, ...sil('x', [0, 0.92, 1], 0.72, 0.15, 1.9, KZ),
      { k: [0.35, 0.18, 0.32, 0.55, 0.42, 1.68], t: D }, { k: [1.5, 0.18, 0.32, 1.7, 0.42, 1.68], t: D },
      { k: [0.12, 0.22, 0.4, 0.15, 1.62, 1.6], t: D }, { k: [1.9, 0.22, 0.4, 1.93, 1.62, 1.6], t: D },
      { k: [0.4, 0.42, 0.24, 0.98, 0.98, 0.32], t: yuzler(D, D, D, T.kazan_kapak) }, { k: [0.86, 0.6, 0.2, 0.94, 0.66, 0.24], t: D },
      { k: [0.22, 1.5, 1.14, 0.7, 2.88, 1.62], t: SB }, { k: [0.18, 2.86, 1.1, 0.74, 2.96, 1.66], t: D },
      ...sil('y', [1.1, 0, 1], 0.2, 1.55, 1.86, KZ), { k: [1.06, 1.86, 0.96, 1.14, 1.96, 1.04], t: D },
      ...sil('x', [0, 1.76, 1], 0.07, 1.25, 2.47, BR), ...sil('y', [2.42, 0, 1], 0.07, 1.28, 1.83, BR), ...sil('y', [2.42, 0, 1], 0.1, 1.28, 1.34, D),
      { k: [1.38, 1.6, 0.6, 1.42, 1.74, 0.64], t: D }, { k: [1.25, 1.72, 0.56, 1.55, 2.02, 0.62], t: yuzler(D, D, D, T.manometre) },
      ...sil('y', [0.95, 0, 1.78], 0.06, 0.18, 0.75, BR),
      { k: [2.02, 0.18, 0.35, 2.92, 1.28, 1.65], t: yuzler(BU, KS) }, { k: [2.1, 0.3, 0.34, 2.84, 0.8, 0.35], t: HV }, { k: [2.12, 0.88, 0.34, 2.82, 1.18, 0.35], t: ET },
      { k: [2.3, 1.28, 0.45, 2.7, 1.38, 0.8], t: BU }, { k: [1.93, 0.7, 0.95, 2.02, 0.8, 1.05], t: D }],
    kosullu: [{ kosul: 'yaniyor', kutular: [{ k: [0.4, 0.42, 0.235, 0.98, 0.98, 0.24], t: yuzler(D, D, D, T.kazan_kapak_a) }] }],
    donenler: [{ merkez: [1.975, 0.75, 1], eksen: 'x', hiz: 5, kutular: carkK('x', 0.5, 0.035, D, 3) }],
    ibre: { merkez: [1.4, 1.87, 0.553], kutular: [{ k: [-0.008, -0.01, -0.004, 0.008, 0.11, 0.004], t: KR }], min: 2.3, maks: -2.3 }
  };
  /* Jeotermal Jeneratör (2 × 2 × 3): beton taban, kuyu başları ve vanalar, yalıtımlı ısı değiştirici, türbin kutusu, soğutma fanı, buhar bacası */
  M.jeotermal = {
    statik: [{ k: [0, 0, 0, 2, 0.22, 2], t: BT }, ...sil('y', [1, 0, 1.15], 0.62, 0.22, 1.95, JK), ...sil('y', [1, 0, 1.15], 0.46, 1.95, 2.05, JK),
      ...[0.7, 1.35].flatMap(y => sil('y', [1, 0, 1.15], 0.64, y, y + 0.05, D)),
      ...[0.28, 1.72].flatMap(x => [...sil('y', [x, 0, 1.72], 0.08, 0.22, 1.25, BR), { k: [x - 0.12, 0.85, 1.6, x + 0.12, 0.89, 1.84], t: KR }, ...sil('x', [0, 1.18, 1.72], 0.06, Math.min(x, 0.6), Math.max(x, 1.4), BR)]),
      { k: [0.4, 0.22, 0.08, 1.6, 0.9, 0.5], t: yuzler(BU, KS, KS, T.jeo_isaret) }, { k: [0.45, 0.9, 0.15, 0.75, 0.96, 0.45], t: D },
      ...sil('y', [1, 0, 1.18], 0.17, 2.0, 2.92, BR), { k: [0.78, 2.9, 0.96, 1.22, 2.95, 1.4], t: D }, { k: [1.6, 0.36, 0.2, 1.64, 0.76, 0.4], t: HV }],
    donenler: [{ merkez: [1.65, 0.56, 0.3], eksen: 'x', hiz: 9, kutular: kanatlar('x', 0.17, 5, G) }]
  };
  /* Güneş Takip Sistemi (2 × 2 × 3): beton temel, direk, bağlantı kutusu; döner tabla (yaw) ve eğilen panel (pitch) */
  M.takip = {
    statik: [{ k: [0.35, 0, 0.35, 1.65, 0.22, 1.65], t: BT }, ...sil('y', [1, 0, 1], 0.13, 0.22, 2.25, D), { k: [0.86, 0.45, 0.78, 1.14, 0.75, 0.87], t: BU }],
    kafa: { merkez: [1, 2.27, 1], kutular: [{ k: [-0.2, -0.04, -0.2, 0.2, 0.08, 0.2], t: BU }, { k: [-0.16, 0.08, -0.05, -0.1, 0.22, 0.05], t: D }, { k: [0.1, 0.08, -0.05, 0.16, 0.22, 0.05], t: D }],
      namlu: { merkez: [0, 0.2, 0], kutular: [{ k: [-1.25, -0.025, -0.85, 1.25, 0.025, 0.85], t: yuzler(T.takip_panel, P, P) }, { k: [-1.2, -0.07, -0.04, 1.2, -0.025, 0.04], t: D }, { k: [-0.04, -0.07, -0.8, 0.04, -0.025, 0.8], t: D }] } }
  };
  /* Paratoner (1 × 1 × 6): kondansatör dolabı (LED göstergeli), kafes direk, izolatör ve bakır uç */
  const kafesDirek = (x0, x1, y0, y1) => [[x0, x0], [x1 - 0.04, x0], [x0, x1 - 0.04], [x1 - 0.04, x1 - 0.04]].map(([a, b]) => ({ k: [a, y0, b, a + 0.04, y1, b + 0.04], t: D }))
    .concat([{ k: [x0, y0, x0 + 0.015, x1, y1, x0 + 0.025], t: KF }, { k: [x0, y0, x1 - 0.025, x1, y1, x1 - 0.015], t: KF }, { k: [x0 + 0.015, y0, x0, x0 + 0.025, y1, x1], t: KF }, { k: [x1 - 0.025, y0, x0, x1 - 0.015, y1, x1], t: KF }]);
  M.paratoner = {
    statik: [{ k: [0.1, 0.04, 0.12, 0.9, 0.72, 0.88], t: yuzler(BU, KS, KS, KS) }, { k: [0.1, 0, 0.115, 0.9, 0.06, 0.12], t: UY }, { k: [0.2, 0.4, 0.115, 0.5, 0.62, 0.12], t: ET },
      ...kafesDirek(0.34, 0.66, 0.72, 5.6), { k: [0.3, 5.58, 0.3, 0.7, 5.62, 0.7], t: D }, ...sil('y', [0.5, 0, 0.5], 0.08, 5.62, 5.78, IZ), ...sil('y', [0.5, 0, 0.5], 0.03, 5.78, 6.0, T.bakir_blok),
      { k: [0.42, 5.88, 0.48, 0.58, 5.9, 0.52], t: T.bakir_blok }, { k: [0.48, 5.88, 0.42, 0.52, 5.9, 0.58], t: T.bakir_blok }],
    gosterge: [[0.6, 0.8, 0.18, 0.62, 0.12, 5, false]]
  };
  /* Enerji Depolama Konteyneri (4 × 2 × 3): oluklu gövde, köşe dikmeleri ve rayları, kapı kilit çubukları, ön denetim panosu ve LED göstergeleri, çatı fanları */
  const KNY = [T.konteyner_kapi, KN, T.konteyner_ust, T.konteyner_ust, KN, KN];
  M.konteyner = {
    statik: [{ k: [0.05, 0, 0.12, 3.95, 2.72, 1.9], t: KNY },
      ...[[0, 0.1], [3.88, 0.1], [0, 1.8], [3.88, 1.8]].map(([x, z]) => ({ k: [x, 0, z, x + 0.12, 2.76, z + 0.12], t: D })),
      ...[0.1, 1.82].flatMap(z => [{ k: [0, 2.68, z, 4, 2.76, z + 0.1], t: D }, { k: [0, 0, z, 4, 0.1, z + 0.1], t: D }]),
      ...[0.45, 0.85, 1.15, 1.55].map(z => ({ k: [3.95, 0.12, z, 3.99, 2.62, z + 0.04], t: D })), ...[0.6, 1.35].map(z => ({ k: [3.94, 1.15, z, 4.02, 1.25, z + 0.12], t: KR })),
      { k: [0.28, 0.85, 0.08, 1.35, 2.05, 0.12], t: yuzler(BU, KS) }, { k: [1.6, 1.3, 0.11, 2.7, 2.2, 0.12], t: ET }, { k: [0.05, 0.12, 0.11, 3.95, 0.22, 0.12], t: UY },
      { k: [2.9, 0.4, 0.11, 3.7, 1.0, 0.12], t: HV },
      ...[1.2, 2.8].flatMap(x => [{ k: [x - 0.42, 2.72, 0.6, x + 0.42, 2.82, 1.4], t: BU }, { k: [x - 0.36, 2.82, 0.66, x + 0.36, 2.84, 1.34], t: HV }])],
    gosterge: [[0.95, 1.06, 1.0, 1.92, 0.08, 6, false], [1.13, 1.24, 1.0, 1.92, 0.08, 6, false]],
    donenler: [1.2, 2.8].map(x => ({ merkez: [x, 2.88, 1], eksen: 'y', hiz: 3, kutular: kanatlar('y', 0.34, 5, D) }))
  };
  /* Elektrik Direği (1 × 1 × 7): ahşap direk, travers ve payandalar, üç izolatör, basamak cıvataları, uyarı levhası */
  M.direk = {
    statik: [...sil('y', [0.5, 0, 0.5], 0.13, 0, 6.95, T.ladin_yan), { k: [-0.7, 6.35, 0.42, 1.7, 6.5, 0.58], t: KK },
      { k: [-0.03, -0.38, -0.03, 0.03, 0.38, 0.03], t: KK, m: rzZ(0.8, 0.2, 6.1, 0.5) }, { k: [-0.03, -0.38, -0.03, 0.03, 0.38, 0.03], t: KK, m: rzZ(-0.8, 0.8, 6.1, 0.5) },
      ...[-0.45, 0.5, 1.45].flatMap(x => [{ k: [x - 0.02, 6.5, 0.48, x + 0.02, 6.58, 0.52], t: D }, ...sil('y', [x, 0, 0.5], 0.075, 6.58, 6.62, IZ), ...sil('y', [x, 0, 0.5], 0.06, 6.62, 6.66, IZ), ...sil('y', [x, 0, 0.5], 0.075, 6.66, 6.7, IZ), ...sil('y', [x, 0, 0.5], 0.04, 6.7, 6.73, IZ)]),
      ...[1.6, 2.2, 2.8, 3.4, 4.0, 4.6, 5.2].map((y, i) => ({ k: i % 2 ? [0.62, y, 0.47, 0.76, y + 0.04, 0.53] : [0.24, y, 0.47, 0.38, y + 0.04, 0.53], t: D })),
      { k: [0.36, 2.0, 0.355, 0.64, 2.32, 0.37], t: UY }]
  };
  /* Güç Ölçer (1 × 1 × 1): kutu, ön ekran (dinamik), ayaklar */
  M.olcer = {
    statik: [{ k: [0.18, 0.04, 0.3, 0.82, 0.56, 0.72], t: yuzler(BU, KS, KS, EK) }, { k: [0.2, 0, 0.32, 0.28, 0.04, 0.7], t: D }, { k: [0.72, 0, 0.32, 0.8, 0.04, 0.7], t: D }],
    ekran: { merkez: [0.5, 0.31, 0.295], w: 0.54, h: 0.32, tur: 'olcer' }
  };
  /* Televizyon (2 × 1 × 2): ceviz dolap ve çekmeceler, ayak, ince çerçeveli geniş ekran (dinamik) */
  M.tv = {
    statik: [{ k: [0.05, 0, 0.22, 1.95, 0.5, 0.9], t: T.tv_dolap }, { k: [0.12, 0.06, 0.215, 0.96, 0.44, 0.22], t: T.tv_dolap }, { k: [1.04, 0.06, 0.215, 1.88, 0.44, 0.22], t: T.tv_dolap },
      { k: [0.48, 0.24, 0.2, 0.6, 0.27, 0.215], t: D }, { k: [1.4, 0.24, 0.2, 1.52, 0.27, 0.215], t: D },
      { k: [0.7, 0.5, 0.38, 1.3, 0.53, 0.76], t: EK }, { k: [0.94, 0.53, 0.5, 1.06, 0.7, 0.56], t: EK }, { k: [0.1, 0.6, 0.44, 1.9, 1.74, 0.54], t: EK }],
    ekran: { merkez: [1, 1.17, 0.435], w: 1.74, h: 1.08, tur: 'tv' },
    isikli: [{ kosul: 'acik', renk: 'yesil', kutular: [{ k: [1.8, 0.62, 0.435, 1.84, 0.64, 0.44], t: 0 }] }, { kosul: 'kapali', renk: 'kirmizi', kutular: [{ k: [1.8, 0.62, 0.435, 1.84, 0.64, 0.44], t: 0 }] }]
  };
  /* Çamaşır Makinesi (1 × 1 × 1): emaye gövde, kapak halkası, çamaşır dolu dönen kazan (camın ardında), denetim şeridi ve düğme */
  const tamb = []; for (let i = 0; i < 9; i++) { const q = i * 0.7, r = 0.05 + (i % 3) * 0.05; tamb.push({ k: [-0.05, -0.04, -0.002, 0.05, 0.04, 0.002], t: [T.yun_m, T.yun_k, T.yun, T.yun_s][i % 4], m: new THREE.Matrix4().makeRotationZ(q).setPosition(Math.cos(q) * r, Math.sin(q) * r, 0) }); }
  const halka = []; for (let i = 0; i < 12; i++) halka.push({ k: [-0.05, 0.25, 0, 0.05, 0.3, 0.025], t: T.demir_blok, m: donZ(i * Math.PI / 6) });
  M.camasir = {
    statik: [{ k: [0.06, 0.03, 0.08, 0.94, 0.92, 0.92], t: yuzler(BG, BG, BG, T.camasir_on) }, ...[[0.1, 0.12], [0.84, 0.12], [0.1, 0.82], [0.84, 0.82]].map(([x, z]) => ({ k: [x, 0, z, x + 0.06, 0.03, z + 0.06], t: D })),
      ...halka.map(h => ({ ...h, m: new THREE.Matrix4().makeTranslation(0.5, 0.38, 0.055).multiply(h.m) })), { k: [0.7, 0.84, 0.065, 0.78, 0.9, 0.08], t: D }],
    donenler: [{ merkez: [0.5, 0.38, 0.075], eksen: 'z', hiz: 6, kutular: tamb }]
  };
  /* Güvenlik Kepengi (2 × 1 × 3): dikmeler ve kılavuz raylar, üst sarma kutusu, kayar perde ve alt çıta, durum ışıkları */
  M.kepenk = {
    statik: [{ k: [0, 0, 0.3, 0.14, 3, 0.7], t: KPK }, { k: [1.86, 0, 0.3, 2, 3, 0.7], t: KPK }, { k: [0.12, 0, 0.4, 0.16, 2.55, 0.6], t: D }, { k: [1.84, 0, 0.4, 1.88, 2.55, 0.6], t: D },
      { k: [0, 2.55, 0.25, 2, 3, 0.75], t: KPK }, { k: [0.02, 0, 0.295, 0.12, 0.3, 0.3], t: UY }, { k: [1.88, 0, 0.295, 1.98, 0.3, 0.3], t: UY },
      { k: [1.88, 1.1, 0.24, 2, 1.5, 0.3], t: BU }],
    perde: { y: 2.55, kutular: [{ k: [0.15, -2.55, 0.45, 1.85, 0, 0.55], t: T.kepenk }, { k: [0.15, -2.55, 0.43, 1.85, -2.47, 0.57], t: D }] },
    isikli: [{ kosul: 'acik', renk: 'yesil', kutular: [{ k: [1.91, 1.38, 0.235, 1.97, 1.44, 0.24], t: 0 }] }, { kosul: 'kapali', renk: 'kirmizi', kutular: [{ k: [1.91, 1.38, 0.235, 1.97, 1.44, 0.24], t: 0 }] }]
  };
  /* Güvenlik Kamerası (1 × 1 × 1): taban, direk; tarayan gövde, güneşlik, mercek ve kayıt ışığı */
  M.kamera = {
    statik: [{ k: [0.32, 0, 0.32, 0.68, 0.04, 0.68], t: D }, ...sil('y', [0.5, 0, 0.5], 0.04, 0.04, 0.62, D)],
    kafa: { merkez: [0.5, 0.66, 0.5], kutular: [{ k: [-0.05, -0.04, -0.05, 0.05, 0.04, 0.05], t: BU }], isik: [0.05, 0.06, -0.2, 0.07, 0.08, -0.18],
      namlu: { merkez: [0, 0.06, 0], kutular: [{ k: [-0.08, -0.06, -0.26, 0.08, 0.06, 0.12], t: KG }, { k: [-0.1, 0.06, -0.3, 0.1, 0.075, 0.14], t: KG }, { k: [-0.045, -0.045, -0.3, 0.045, 0.045, -0.26], t: EK }] } }
  };
  /* Güvenlik Monitörü (1 × 1 × 1): ayak, boyun, çerçeve, ekran (kamera görüntüsü) */
  M.monitor = {
    statik: [{ k: [0.3, 0, 0.42, 0.7, 0.03, 0.68], t: EK }, { k: [0.46, 0.03, 0.54, 0.54, 0.22, 0.58], t: EK }, { k: [0.08, 0.2, 0.46, 0.92, 0.78, 0.54], t: EK }],
    ekran: { merkez: [0.5, 0.49, 0.455], w: 0.8, h: 0.52, tur: 'monitor' },
    isikli: [{ kosul: 'acik', renk: 'yesil', kutular: [{ k: [0.84, 0.22, 0.455, 0.87, 0.235, 0.46], t: 0 }] }]
  };
  /* Alarm Sireni (1 × 1 × 1): siren gövdesi (ızgaralı), tepe tablası, kubbe; çalışırken dönen kırmızı ışık */
  M.alarm = {
    statik: [{ k: [0.2, 0, 0.22, 0.8, 0.5, 0.8], t: yuzler(BU, T.alarm_govde) }, { k: [0.3, 0.5, 0.32, 0.7, 0.56, 0.7], t: BU }, ...sil('y', [0.5, 0, 0.51], 0.16, 0.56, 0.8, T.alarm_kubbe), { k: [0.42, 0.8, 0.43, 0.58, 0.83, 0.59], t: BU }],
    isikli: [{ kosul: 'acik', renk: 'kirmizi', don: { merkez: [0.5, 0.68, 0.51], hiz: 9 }, kutular: [{ k: [-0.172, -0.115, -0.04, 0.172, 0.115, 0.04], t: 0 }, { k: [-0.04, -0.115, -0.172, 0.04, 0.115, 0.172], t: 0 }] },
      { kosul: 'acik', renk: 'turuncu', kutular: [...sil('y', [0.5, 0, 0.51], 0.12, 0.565, 0.795, 0)] }]
  };
  /* Ark Ergitme Ocağı (2 × 2 × 3): taban, ateş tuğlası kazan ve çelik çemberler, kapak, üç grafit elektrot ve kolları, döküm oluğu, trafo */
  const elk = [90, 210, 330].map(a => [1 + Math.cos(a * Math.PI / 180) * 0.32, 1 + Math.sin(a * Math.PI / 180) * 0.32]);
  M.ark = {
    statik: [{ k: [0.05, 0, 0.05, 1.95, 0.25, 1.95], t: yuzler(BU, D) }, ...sil('y', [1, 0, 1], 0.86, 0.25, 1.3, RF), ...[0.45, 1.05].flatMap(y => sil('y', [1, 0, 1], 0.88, y, y + 0.06, D)),
      ...sil('y', [1, 0, 1], 0.8, 1.3, 1.45, KS), ...elk.flatMap(([x, z]) => sil('y', [x, 0, z], 0.07, 1.25, 2.9, EL)),
      { k: [1.76, 0.25, 1.76, 1.92, 2.85, 1.92], t: D }, ...elk.map(([x, z], i) => kirisXZ(1.84, 2.35 + i * 0.18, 1.84, x, z, 0.035, D)),
      { k: [0.85, 0.92, -0.06, 1.15, 1.02, 0.25], t: RF }, { k: [0.9, 1.02, -0.06, 1.1, 1.04, 0.2], t: D },
      { k: [0.08, 0.25, 1.4, 0.55, 1.0, 1.92], t: yuzler(BU, KS) }, { k: [0.07, 0.35, 1.5, 0.08, 0.85, 1.85], t: HV }, { k: [0.6, 0.3, 1.9, 1.4, 0.8, 1.96], t: BU }],
    isikli: [{ kosul: 'acik', renk: 'turuncu', kutular: [{ k: [0.9, 1.02, -0.055, 1.1, 1.035, 0.18], t: 0 }, ...sil('y', [1, 0, 1], 0.82, 1.28, 1.31, 0)] }]
  };
  /* Elektrikli Kereste Tezgâhı (2 × 1 × 1): ayaklar, çelik tabla, motor, dönen testere, koruyucu, kılavuz cetveli */
  M.kereste = {
    statik: [...[[0.1, 0.15], [1.82, 0.15], [0.1, 0.77], [1.82, 0.77]].map(([x, z]) => ({ k: [x, 0, z, x + 0.08, 0.72, z + 0.08], t: D })), { k: [0.1, 0.25, 0.15, 1.9, 0.29, 0.85], t: D },
      { k: [0.05, 0.72, 0.1, 0.9, 0.8, 0.9], t: yuzler(T.demir_blok, D) }, { k: [1.1, 0.72, 0.1, 1.95, 0.8, 0.9], t: yuzler(T.demir_blok, D) }, { k: [0.9, 0.72, 0.1, 1.1, 0.8, 0.44], t: yuzler(T.demir_blok, D) }, { k: [0.9, 0.72, 0.56, 1.1, 0.8, 0.9], t: yuzler(T.demir_blok, D) },
      { k: [0.75, 0.32, 0.3, 1.25, 0.7, 0.7], t: PG }, { k: [0.82, 1.0, 0.46, 1.18, 1.04, 0.54], t: KR }, { k: [0.98, 0.8, 0.49, 1.02, 1.0, 0.51], t: D },
      { k: [0.1, 0.8, 0.78, 1.9, 0.88, 0.82], t: D }, { k: [1.7, 0.6, 0.06, 1.82, 0.7, 0.1], t: KR }],
    donenler: [{ merkez: [1, 0.74, 0.5], eksen: 'z', hiz: 22, kutular: [{ k: [-0.27, -0.27, -0.006, 0.27, 0.27, 0.006], t: T.testere }] }]
  };
  /* Taş Kırıcı (1 × 1 × 2): çerçeve ayakları, sarı gövde, besleme hunisi, çıkış oluğu, yan motor ve önde dönen kasnak */
  M.kirici = {
    statik: [...[[0.08, 0.08], [0.8, 0.08], [0.08, 0.8], [0.8, 0.8]].map(([x, z]) => ({ k: [x, 0, z, x + 0.12, 0.62, z + 0.12], t: D })),
      { k: [0.12, 0.6, 0.12, 0.88, 1.35, 0.88], t: SM }, { k: [0.14, 1.35, 0.14, 0.86, 1.5, 0.86], t: SM }, { k: [0.08, 1.5, 0.08, 0.92, 1.7, 0.92], t: SM }, { k: [0.03, 1.7, 0.03, 0.97, 1.95, 0.97], t: yuzler(EK, SM) },
      { k: [-0.2, -0.03, -0.2, 0.2, 0.03, 0.2], t: D, m: rxX(0.55, 0.5, 0.45, 0.02) }, { k: [0.12, 0.6, 0.115, 0.88, 0.68, 0.12], t: UY },
      { k: [0.88, 0.72, 0.28, 0.99, 1.12, 0.72], t: PG }, { k: [0.47, 0.97, 0.09, 0.53, 1.03, 0.12], t: D }],
    donenler: [{ merkez: [0.5, 1.0, 0.1], eksen: 'z', hiz: 7, kutular: carkK('z', 0.2, 0.02, D, 3) }]
  };
  /* Maden Matkabı (3 × 3 × 4): ortası açık güverte ve uyarı şeridi, köşe dikmeleri ve kafes paneller, taç bloğu, üst tahrik motoru,
     dönerek inen tij ve matkap ucu, motor / hazne kutusu, merdiven basamakları */
  M.matkap = {
    statik: [{ k: [0, 0, 0, 3, 0.2, 1], t: yuzler(BU, D) }, { k: [0, 0, 2, 3, 0.2, 3], t: yuzler(BU, D) }, { k: [0, 0, 1, 1, 0.2, 2], t: yuzler(BU, D) }, { k: [2, 0, 1, 3, 0.2, 2], t: yuzler(BU, D) },
      { k: [0.92, 0.2, 0.92, 2.08, 0.21, 1.0], t: UY }, { k: [0.92, 0.2, 2.0, 2.08, 0.21, 2.08], t: UY }, { k: [0.92, 0.2, 1.0, 1.0, 0.21, 2.0], t: UY }, { k: [2.0, 0.2, 1.0, 2.08, 0.21, 2.0], t: UY },
      ...[[0.05, 0.05], [2.68, 0.05], [0.05, 2.68], [2.68, 2.68]].map(([x, z]) => ({ k: [x, 0.2, z, x + 0.27, 3.6, z + 0.27], t: SM })),
      { k: [0.32, 1.6, 0.17, 2.68, 3.6, 0.19], t: KF }, { k: [0.32, 1.6, 2.81, 2.68, 3.6, 2.83], t: KF }, { k: [0.17, 1.6, 0.32, 0.19, 3.6, 2.68], t: KF }, { k: [2.81, 1.6, 0.32, 2.83, 3.6, 2.68], t: KF },
      ...[1.6, 3.55].flatMap(y => [{ k: [0.32, y, 0.12, 2.68, y + 0.08, 0.24], t: SM }, { k: [0.32, y, 2.76, 2.68, y + 0.08, 2.88], t: SM }, { k: [0.12, y, 0.32, 0.24, y + 0.08, 2.68], t: SM }, { k: [2.76, y, 0.32, 2.88, y + 0.08, 2.68], t: SM }]),
      { k: [0.6, 3.6, 0.6, 2.4, 3.95, 2.4], t: yuzler(BU, SM) }, { k: [1.2, 2.95, 1.2, 1.8, 3.6, 1.8], t: PG }, { k: [1.25, 3.0, 1.18, 1.75, 3.5, 1.2], t: HV },
      { k: [2.05, 0.2, 2.05, 2.95, 1.15, 2.95], t: yuzler(BU, PG) }, { k: [2.1, 0.4, 2.04, 2.9, 0.9, 2.05], t: HV }, { k: [2.04, 0.3, 2.1, 2.05, 1.05, 2.9], t: ET },
      ...[0.5, 0.9, 1.3, 1.7, 2.1, 2.5, 2.9, 3.3].map(y => ({ k: [0.32, y, 0.1, 0.5, y + 0.03, 0.14], t: D }))],
    sonda: { merkez: [1.5, 2.95, 1.5], ust: 2.95, cubuk: [{ k: [-0.05, -1, -0.05, 0.05, 0, 0.05], t: D }],
      uc: [{ k: [-0.13, 0, -0.13, 0.13, 0.32, 0.13], t: SM }, { k: [-0.08, -0.18, -0.08, 0.08, 0, 0.08], t: D }, { k: [-0.17, 0.1, -0.02, 0.17, 0.22, 0.02], t: D }], hiz: 5 }
  };
  /* Sıvı Pompası (1 × 1 × 2): taban, salyangoz gövde, dikey motor ve soğutma kanatçıkları, fan kapağı ve dönen fan, çıkış borusu, bağlantı kutusu */
  M.pompa = {
    statik: [{ k: [0.12, 0, 0.12, 0.88, 0.12, 0.88], t: yuzler(BU, D) }, ...sil('y', [0.5, 0, 0.5], 0.32, 0.12, 0.6, PG), ...sil('y', [0.5, 0, 0.5], 0.23, 0.6, 1.25, PG),
      ...[0, 1, 2, 3].map(i => ({ k: [-0.012, 0.66, 0.2, 0.012, 1.2, 0.27], t: D, m: ryY(i * Math.PI / 2 + Math.PI / 4, 0.5, 0, 0.5) })), ...sil('y', [0.5, 0, 0.5], 0.2, 1.25, 1.33, HV),
      ...sil('x', [0, 0.34, 0.5], 0.065, 0.78, 1.02, BR), ...sil('x', [0, 0.34, 0.5], 0.09, 0.96, 1.0, D), { k: [0.32, 0.8, 0.72, 0.68, 1.0, 0.88], t: BU }, { k: [0.2, 0.48, 0.12, 0.3, 0.58, 0.16], t: T.manometre }],
    donenler: [{ merkez: [0.5, 1.345, 0.5], eksen: 'y', hiz: 14, kutular: kanatlar('y', 0.16, 4, D) }]
  };
  /* LED Sokak Lambası (1 × 1 × 5): beton temel, flanş, konik direk, kol ve payanda, LED başlık (çalışırken parlar), denetim kutusu */
  M.sokak = {
    statik: [{ k: [0.28, 0, 0.28, 0.72, 0.3, 0.72], t: BT }, { k: [0.36, 0.3, 0.36, 0.64, 0.36, 0.64], t: D }, ...sil('y', [0.5, 0, 0.5], 0.08, 0.36, 2.6, D), ...sil('y', [0.5, 0, 0.5], 0.065, 2.6, 4.66, D),
      { k: [0.46, 4.56, -0.55, 0.54, 4.63, 0.5], t: D }, { k: [-0.02, -0.3, -0.02, 0.02, 0.3, 0.02], t: D, m: rxX(-0.75, 0.5, 4.32, 0.25) },
      { k: [0.3, 4.5, -0.98, 0.7, 4.64, -0.38], t: yuzler(KPK, KS, T.sokak_led) }, { k: [0.4, 0.5, 0.56, 0.6, 1.0, 0.6], t: BU }],
    isikli: [{ kosul: 'acik', renk: 'beyaz', kutular: [{ k: [0.32, 4.495, -0.96, 0.68, 4.5, -0.4], t: 0 }] }]
  };
  return M;
}

export class CihazCizici {
  constructor(sahne, dunya) {
    this.sahne = sahne; this.dunya = dunya;
    this.grup = new THREE.Group(); sahne.sahne.add(this.grup);
    const at = sahne.atlasDoku.clone(); at.colorSpace = THREE.SRGBColorSpace; at.needsUpdate = true;
    this.malz = new THREE.MeshBasicMaterial({ map: at, vertexColors: true, alphaTest: 0.5, side: THREE.DoubleSide });
    this.hayaletMalz = new THREE.MeshBasicMaterial({ map: at, vertexColors: true, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide });
    this.gostergeMalz = { bos: new THREE.MeshBasicMaterial({ color: 0x0c0e11, side: THREE.DoubleSide }), sonuk: new THREE.MeshBasicMaterial({ color: 0x1f2a22, side: THREE.DoubleSide }), yesil: new THREE.MeshBasicMaterial({ color: 0x52e07c, side: THREE.DoubleSide }),
      sari: new THREE.MeshBasicMaterial({ color: 0xf2b23a, side: THREE.DoubleSide }), kirmizi: new THREE.MeshBasicMaterial({ color: 0xf0584e, side: THREE.DoubleSide }) };
    this.duz = new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0);
    /* 0.53.0: ışık saçmayan parlak parçalar ve ekranlar */
    this.isikMalz = { kirmizi: this.gostergeMalz.kirmizi, yesil: this.gostergeMalz.yesil, turuncu: new THREE.MeshBasicMaterial({ color: 0xffa040, side: THREE.DoubleSide }),
      beyaz: new THREE.MeshBasicMaterial({ color: 0xfff8ea, side: THREE.DoubleSide }) };
    this.ekranGeo = new THREE.PlaneGeometry(1, 1);
    this.rtSayac = 0; this.kamSayac = 0;
    this.M = modeller();
    this.geo = {};
    this.liste = new Map();   // kök anahtarı -> örnek
    this.sayac = 0;
    this.hayaletler = new Map();
    this.hayalet = null;
  }
  get map() { return this.malz.map; }
  /* Modelin geometrileri (bir kez kurulur) */
  geometri(tur) {
    if (this.geo[tur]) return this.geo[tur];
    const m = this.M[tur], g = { statik: kutuGeo(m.statik) };
    if (m.donen) g.donen = kutuGeo(m.donen.kutular);
    if (m.egik) g.egik = m.egik.map(e => kutuGeo(e.kutular));
    if (m.kafa) { g.kafa = kutuGeo(m.kafa.kutular); g.namlu = kutuGeo(m.kafa.namlu.kutular); }
    /* 0.53.0 */
    if (m.donenler) g.donenler = m.donenler.map(q => kutuGeo(q.kutular));
    if (m.isikli) g.isikli = m.isikli.map(q => kutuGeo(q.kutular));
    if (m.kosullu) g.kosullu = m.kosullu.map(q => kutuGeo(q.kutular));
    if (m.perde) g.perde = kutuGeo(m.perde.kutular);
    if (m.sonda) { g.cubuk = kutuGeo(m.sonda.cubuk); g.uc = kutuGeo(m.sonda.uc); }
    if (m.ibre) g.ibre = kutuGeo(m.ibre.kutular);
    return (this.geo[tur] = g);
  }
  /* Modelin örneği: grup (kök hücre köşesinde, yöne göre döndürülmüş) */
  ornekKur(tur, malz) {
    const m = this.M[tur], g = this.geometri(tur), dis = new THREE.Group(), ic = new THREE.Group();
    dis.add(ic); ic.position.set(-0.5, 0, -0.5);
    ic.add(new THREE.Mesh(g.statik, malz));
    let donen = null;
    if (m.donen) { donen = new THREE.Mesh(g.donen, malz); donen.position.set(...m.donen.merkez); ic.add(donen); }
    if (m.egik) m.egik.forEach((e, i) => { const x = new THREE.Mesh(g.egik[i], malz); x.position.set(...e.merkez); x.rotation.x = e.rx; ic.add(x); });
    let kafa = null, namlu = null;
    if (m.kafa) {
      kafa = new THREE.Group(); kafa.position.set(...m.kafa.merkez); kafa.add(new THREE.Mesh(g.kafa, malz)); ic.add(kafa);
      namlu = new THREE.Group(); namlu.position.set(...m.kafa.namlu.merkez); namlu.add(new THREE.Mesh(g.namlu, malz)); kafa.add(namlu);
    }
    /* 0.29.0: taretin durum lambası (ışık saçmaz; rengi guncelle'de değişir) */
    let durumIsik = null;
    if (m.kafa && m.kafa.isik && malz === this.malz) { durumIsik = new THREE.Mesh(this.isikGeo || (this.isikGeo = kutuGeo([{ k: m.kafa.isik, t: 0 }])), this.gostergeMalz.bos); kafa.add(durumIsik); }
    const gostergeler = [];
    /* 0.26.0: LED göstergesi: koyu çerçeve ve ayrı ayrı yanan bölmeler */
    if (m.gosterge && malz === this.malz) for (const [x0, x1, y0, y1, z, n, yatay] of m.gosterge) {
      const zemin = new THREE.Mesh(this.duz, this.gostergeMalz.bos); zemin.position.set((x0 + x1) / 2, y0, z - 0.003); zemin.scale.set(x1 - x0, y1 - y0, 1); ic.add(zemin);
      const ledler = [], ara = 0.012, W = x1 - x0 - 0.03, H = y1 - y0 - 0.03;
      for (let i = 0; i < n; i++) {
        const l = new THREE.Mesh(this.duz, this.gostergeMalz.sonuk);
        if (yatay) { const w = (W - ara * (n - 1)) / n; l.position.set(x0 + 0.015 + w / 2 + i * (w + ara), y0 + 0.015, z - 0.006); l.scale.set(w, H, 1); }
        else { const h = (H - ara * (n - 1)) / n; l.position.set((x0 + x1) / 2, y0 + 0.015 + i * (h + ara), z - 0.006); l.scale.set(W, h, 1); }
        ic.add(l); ledler.push(l);
      }
      gostergeler.push({ ledler });
    }
    /* 0.53.0: ek parçalar */
    const ek = { donenler: [], isikli: [], kosullu: [], perde: null, sonda: null, ibre: null, ekran: null };
    if (m.donenler) m.donenler.forEach((q, i) => { const p = new THREE.Group(); p.position.set(...q.merkez); p.add(new THREE.Mesh(g.donenler[i], malz)); ic.add(p); ek.donenler.push({ g: p, eksen: q.eksen || 'z', hiz: q.hiz || 3, aci: Math.random() * 6, v: 0 }); });
    if (m.kosullu) m.kosullu.forEach((q, i) => { const x = new THREE.Mesh(g.kosullu[i], malz); x.visible = false; ic.add(x); ek.kosullu.push({ mesh: x, kosul: q.kosul }); });
    if (m.isikli && malz === this.malz) m.isikli.forEach((q, i) => {
      const x = new THREE.Mesh(g.isikli[i], this.isikMalz[q.renk] || this.isikMalz.beyaz); let tut = x, don = null;
      if (q.don) { don = new THREE.Group(); don.position.set(...q.don.merkez); don.add(x); tut = don; }
      tut.visible = false; ic.add(tut); ek.isikli.push({ g: tut, kosul: q.kosul, don, hiz: q.don ? q.don.hiz : 0, aci: 0 });
    });
    if (m.perde) { const p = new THREE.Group(); p.position.y = m.perde.y; p.add(new THREE.Mesh(g.perde, malz)); ic.add(p); ek.perde = { g: p, acilma: 0 }; }
    if (m.sonda) {
      const p = new THREE.Group(); p.position.set(...m.sonda.merkez); const c = new THREE.Mesh(g.cubuk, malz), u = new THREE.Mesh(g.uc, malz); p.add(c); p.add(u); ic.add(p);
      ek.sonda = { g: p, cubuk: c, uc: u, derin: 0, hedef: 0, aci: 0, hiz: m.sonda.hiz, ust: m.sonda.ust };
      c.scale.y = m.sonda.ust - 0.5; u.position.y = -(m.sonda.ust - 0.5);
    }
    if (m.ibre) { const p = new THREE.Group(); p.position.set(...m.ibre.merkez); p.add(new THREE.Mesh(g.ibre, malz)); ic.add(p); p.rotation.z = m.ibre.min; ek.ibre = { g: p, min: m.ibre.min, maks: m.ibre.maks, v: 0 }; }
    if (m.ekran && malz === this.malz) {
      const E = m.ekran, x = new THREE.Mesh(this.ekranGeo, this.gostergeMalz.bos); x.position.set(...E.merkez); x.scale.set(E.w, E.h, 1); x.rotation.y = Math.PI; ic.add(x);
      ek.ekran = { mesh: x, tur: E.tur, kanal: 0, sayac: 0, yazi: 0 };
    }
    return { dis, donen, gostergeler, kafa, namlu, durumIsik, ...ek };
  }
  yerlestir(dis, yon, x, y, z) { dis.position.set(x + 0.5, y, z + 0.5); dis.rotation.y = -yon * Math.PI / 2; }

  /* dt: kare süresi; isik: ortam ışığı; O: hava ve zaman (üretim hesabı için); oran(k): bataryanın doluluğu */
  guncelle(dt, isik, O, oran) {
    this.malz.color.setScalar(isik); this.isik = isik; this.O = O;
    this.sayac -= dt;
    if (this.sayac <= 0) { this.sayac = 0.5; this.tara(O, oran); }
    this.guncelle53(dt);   // 0.53.0
    for (const o of this.liste.values()) {
      if (o.kafa && o.tur !== 'taret') continue;   // 0.53.0: takip sistemi ve kamera guncelle53'te
      if (o.kafa && this.taretAci) {
        const a = this.taretAci(o.k);
        if (a) { o.kafa.rotation.y = a.yaw + o.yon * Math.PI / 2; o.namlu.rotation.x = a.pitch; }
        if (o.durumIsik) o.durumIsik.material = !a || !a.aktif ? this.gostergeMalz.bos : a.hedef ? this.gostergeMalz.kirmizi : this.gostergeMalz.yesil;
      }
      if (!o.donen) continue;
      o.hiz += (o.hedefHiz - o.hiz) * Math.min(1, dt * 0.6);
      o.aci = (o.aci + o.hiz * dt) % (Math.PI * 2);
      o.donen.rotation.z = o.aci;
    }
  }
  /* Yüklü cihazları bulur; yeni olanları kurar, kalkanları siler, dönüş hızlarını ve göstergeleri günceller */
  tara(O, oran) {
    const d = this.dunya, gorulen = new Set();
    for (const [k, [x, y, z]] of d.elektrikler) {
      const id = d.blok(x, y, z), b = BLOKLAR[id];
      if (!b || !b.cihaz || b.parca) continue;
      gorulen.add(k);
      let o = this.liste.get(k);
      if (o && o.id !== id) { if (o.tur === b.cihaz && o.yon === b.yon && CIHAZ[b.cihaz].durum) o.id = id; else { this.ekranBirak(o); this.grup.remove(o.dis); this.liste.delete(k); o = null; } }   // 0.53.0: durumlu cihazın açılıp kapanması modeli yenilemez
      if (!o) {
        o = { id, k, yon: b.yon, tur: b.cihaz, ...this.ornekKur(b.cihaz, this.malz), hiz: 0, hedefHiz: 0, aci: Math.random() * 6 };
        this.yerlestir(o.dis, b.yon, x, y, z); this.grup.add(o.dis); this.liste.set(k, o);
      }
      if (o.donen) { const r = cihazUretim(d, b, x, y, z, O), n = r.u / b.uretim; o.hedefHiz = r.u > 0 ? (b.cihaz === 'ruzgar' ? 0.5 + 2.4 * n : 0.7 + 1.2 * n) : 0; }
      this.durum53(o, b, x, y, z, O, oran(k));   // 0.53.0
      if (o.gostergeler.length) {
        const r = Math.max(0, Math.min(1, oran(k) ?? 0)), malz = r < 0.2 ? this.gostergeMalz.kirmizi : r < 0.5 ? this.gostergeMalz.sari : this.gostergeMalz.yesil;
        for (const g of o.gostergeler) { const n = g.ledler.length, yanan = r <= 0.01 ? 0 : Math.max(1, Math.round(r * n)); g.ledler.forEach((l, i) => { l.material = i < yanan ? malz : this.gostergeMalz.sonuk; }); }
      }
    }
    for (const [k, o] of this.liste) if (!gorulen.has(k)) { this.ekranBirak(o); this.grup.remove(o.dis); this.liste.delete(k); }
    this.portlariKur(this.kablolar);
  }
  temizle() { for (const o of this.liste.values()) { this.ekranBirak(o); this.grup.remove(o.dis); } this.liste.clear(); this.onizleme(null); }

  /* ---------- 0.53.0: Şebeke cihazlarının durumu (0,5 saniyede bir) ----------
     v: 'bo' değeri (tüketicide 1 çalışıyor; buharda basınç + 2 ateş; matkapta derinlik * 2 + çalışıyor; ölçerde geçen güç; depolarda doluluk) */
  durum53(o, b, x, y, z, O, v) {
    const C = CIHAZ[b.cihaz];
    if (!C || C.taban < 3100) return;
    let on = false, yaniyor = false, aktif = 0;
    if (b.cihaz === 'buhar') { const r = v || 0; yaniyor = r >= 2; o.basinc = Math.min(1, r >= 2 ? r - 2 : r); aktif = o.basinc; on = aktif > 0.01; }
    else if (b.cihaz === 'jeotermal' || b.cihaz === 'takip') { const r = cihazUretim(this.dunya, b, x, y, z, O); aktif = r.u / b.uretim; on = r.u > 0; }
    else if (b.cihaz === 'konteyner' || b.cihaz === 'paratoner') { aktif = (v || 0) > 0.005 ? 0.4 : 0; on = aktif > 0; }
    else if (b.cihaz === 'matkap') { const r = Math.round(v || 0); o.derin = Math.floor(r / 2); on = r % 2 === 1; aktif = on ? 1 : 0; }
    else if (b.cihaz === 'olcer') { o.deger = v || 0; on = true; }
    else { on = C.durum ? !!b.acik : v === 1; aktif = on ? 1 : 0; }
    o.on = on; o.yaniyor = yaniyor; o.aktif = aktif;
    const kosul = k => (k === 'acik' ? on : k === 'kapali' ? !on : k === 'yaniyor' ? yaniyor : false);
    for (const q of o.kosullu) q.mesh.visible = kosul(q.kosul);
    for (const q of o.isikli) q.g.visible = kosul(q.kosul);
  }
  /* Her karede: dönen parçalar, kepenk perdesi, matkap tiji, manometre, takip paneli, kamera, ekranlar */
  guncelle53(dt) {
    const t = performance.now() / 1000, P = this.O && this.O.oyuncu, gy = this.sahne.opakMalzeme && this.sahne.opakMalzeme.uniforms.gunesYon ? this.sahne.opakMalzeme.uniforms.gunesYon.value : null;
    const uzak = o => (P ? Math.hypot(o.dis.position.x - P.x, o.dis.position.z - P.z) : 0);
    for (const o of this.liste.values()) {
      if (!o.donenler) continue;
      for (const r of o.donenler) { const h = (o.aktif || 0) * r.hiz; r.v += (h - r.v) * Math.min(1, dt * 1.5); r.aci = (r.aci + r.v * dt) % (Math.PI * 2); r.g.rotation[r.eksen] = r.aci; }
      for (const q of o.isikli) if (q.don && q.g.visible) { q.aci = (q.aci + q.hiz * dt) % (Math.PI * 2); q.g.rotation.y = q.aci; }
      if (o.perde) { const h = o.on ? 1 : 0, f = h - o.perde.acilma; o.perde.acilma += Math.sign(f) * Math.min(Math.abs(f), dt * 0.7); o.perde.g.scale.y = 1 - 0.94 * o.perde.acilma; }
      if (o.sonda) {
        const S = o.sonda; S.derin += ((o.derin || 0) - S.derin) * Math.min(1, dt * 1.2);
        const L = S.ust - 0.43 + S.derin; S.cubuk.scale.y = L; S.uc.position.y = -L;
        if (o.on) { S.aci = (S.aci + S.hiz * dt) % (Math.PI * 2); S.g.rotation.y = S.aci; }
      }
      if (o.ibre) { o.ibre.v += ((o.basinc || 0) - o.ibre.v) * Math.min(1, dt * 2); o.ibre.g.rotation.z = o.ibre.min + (o.ibre.maks - o.ibre.min) * o.ibre.v; }
      /* Güneş takip: panel normali güneşe döner; gece yatay konuma iner */
      if (o.tur === 'takip' && o.kafa) {
        let yaw = o.takYaw ?? 0, pit = 0;
        if (gy && gy.y > 0.03) { yaw = Math.atan2(gy.x, gy.z) + o.yon * Math.PI / 2; pit = Math.min(1.2, Math.atan2(Math.hypot(gy.x, gy.z), gy.y)); }
        let fy = ((yaw - (o.takYaw ?? yaw)) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
        o.takYaw = (o.takYaw ?? yaw) + fy * Math.min(1, dt * 0.8); o.takPit = (o.takPit ?? 0) + (pit - (o.takPit ?? 0)) * Math.min(1, dt * 0.8);
        o.kafa.rotation.y = o.takYaw; o.namlu.rotation.x = o.takPit;
      }
      /* Kamera: çalışırken sağa sola tarar; kayıt ışığı */
      if (o.tur === 'kamera' && o.kafa) {
        const fz = o.faz ?? (o.faz = Math.random() * 6);
        const hy = o.on ? Math.sin(t * 0.35 + fz) * 0.95 : (o.kafa.rotation.y || 0), hp = o.on ? -0.3 : -0.7;
        o.kafa.rotation.y += (hy - o.kafa.rotation.y) * Math.min(1, dt * 3); o.namlu.rotation.x += (hp - o.namlu.rotation.x) * Math.min(1, dt * 2);
        if (o.durumIsik) o.durumIsik.material = o.on && Math.floor(t * 1.5) % 2 ? this.gostergeMalz.kirmizi : this.gostergeMalz.bos;
      }
      if (o.ekran) this.ekranGuncelle(o, dt, t, uzak(o));
    }
    /* Monitörler: kamera görüntüsü sırayla (0,2 saniyede bir monitör) işlenir */
    this.rtSayac -= dt;
    if (this.rtSayac <= 0) {
      this.rtSayac = 0.2;
      const mon = []; for (const o of this.liste.values()) if (o.tur === 'monitor' && o.on && o.ekran && uzak(o) < 24) mon.push(o);
      if (mon.length) this.monitorCiz(mon[this.kamSayac++ % mon.length]);
    }
  }
  /* Ekranlı cihazlar: televizyon (kanallar), güç ölçer (değer), monitör (kamera görüntüsü; monitorCiz) */
  ekranGuncelle(o, dt, t, u) {
    const E = o.ekran;
    if (!o.on || u > 40) { if (E.mesh.material !== this.gostergeMalz.bos && (!o.on || E.tur !== 'olcer')) E.mesh.material = this.gostergeMalz.bos; if (E.ust) E.ust.visible = false; return; }
    if (E.tur === 'monitor') return;
    if (!E.cv) {
      E.cv = document.createElement('canvas'); [E.cv.width, E.cv.height] = E.tur === 'tv' ? [224, 136] : [96, 56];
      E.ctx = E.cv.getContext('2d'); E.tex = new THREE.CanvasTexture(E.cv); E.tex.colorSpace = THREE.SRGBColorSpace; E.tex.magFilter = THREE.NearestFilter;
      E.malz = new THREE.MeshBasicMaterial({ map: E.tex, side: THREE.DoubleSide });
    }
    E.mesh.material = E.malz;
    E.sayac -= dt; E.yazi = Math.max(0, E.yazi - dt);
    if (E.tur === 'olcer') { if (E.son === o.deger && E.sayac > 0) return; E.son = o.deger; E.sayac = 1; olcerCiz(E.ctx, E.cv.width, E.cv.height, o.deger || 0); E.tex.needsUpdate = true; return; }
    if (E.sayac > 0 || u > 28) return;
    E.sayac = 0.1;
    tvCiz(E.ctx, E.cv.width, E.cv.height, E.kanal, t, this.O || {}, E.yazi > 0);
    E.tex.needsUpdate = true;
  }
  monitorCiz(o) {
    const E = o.ekran, r = this.sahne.cizici;
    if (!r) return;
    const kam = this.kameralar(o);
    if (!E.rt) { E.rt = new THREE.WebGLRenderTarget(192, 120); E.rt.texture.colorSpace = THREE.SRGBColorSpace; E.rtMalz = new THREE.MeshBasicMaterial({ map: E.rt.texture, side: THREE.DoubleSide }); }
    if (!kam.length) {
      if (!E.cv) { E.cv = document.createElement('canvas'); E.cv.width = 96; E.cv.height = 60; E.ctx = E.cv.getContext('2d'); E.tex = new THREE.CanvasTexture(E.cv); E.tex.colorSpace = THREE.SRGBColorSpace; E.malz = new THREE.MeshBasicMaterial({ map: E.tex, side: THREE.DoubleSide }); }
      sinyalYok(E.ctx, E.cv.width, E.cv.height); E.tex.needsUpdate = true; E.mesh.material = E.malz; return;
    }
    const c = kam[(E.kanal % kam.length + kam.length) % kam.length];
    if (!this.rtKamera) this.rtKamera = new THREE.PerspectiveCamera(68, 1.6, 0.08, 90);
    const p = new THREE.Vector3(), yon = new THREE.Vector3();
    c.namlu.getWorldPosition(p); c.namlu.getWorldDirection(yon); yon.negate();
    p.addScaledVector(yon, 0.34);
    this.rtKamera.position.copy(p); this.rtKamera.lookAt(p.clone().add(yon));
    /* kendi ekranlarını görmemek için (geri besleme) ekranlar ve hayalet gizlenir */
    const gizli = []; for (const q of this.liste.values()) if (q.ekran && q.ekran.mesh.visible) { q.ekran.mesh.visible = false; gizli.push(q.ekran.mesh); }
    const hv = this.hayalet && this.hayalet.visible; if (hv) this.hayalet.visible = false;
    const eski = r.getRenderTarget();
    r.setRenderTarget(E.rt); r.render(this.sahne.sahne, this.rtKamera); r.setRenderTarget(eski);
    for (const m of gizli) m.visible = true; if (hv) this.hayalet.visible = true;
    E.mesh.material = E.rtMalz;
  }
  /* Monitörün 64 blok çevresindeki çalışan kameralar (sabit sırayla) */
  kameralar(o) {
    const l = [];
    for (const q of this.liste.values()) if (q.tur === 'kamera' && q.on && Math.hypot(q.dis.position.x - o.dis.position.x, q.dis.position.z - o.dis.position.z) < 64) l.push(q);
    return l.sort((a, b) => (a.k < b.k ? -1 : 1));
  }
  /* Sağ tık: televizyonda kanal, monitörde kamera değişir (yerel görüntü) */
  ekranDegistir(k, tur) {
    const o = this.liste.get(k);
    if (!o || !o.ekran) return null;
    if (tur === 'tv') { o.ekran.kanal = (o.ekran.kanal + 1) % TV_KANAL.length; o.ekran.yazi = 2.5; o.ekran.sayac = 0; return o.on ? `Kanal ${o.ekran.kanal + 1}: ${TV_KANAL[o.ekran.kanal]}` : 'Televizyon çalışmıyor (enerji gerekir).'; }
    const kam = this.kameralar(o);
    if (!kam.length) return 'Monitörün 64 blok çevresinde çalışan güvenlik kamerası yok.';
    o.ekran.kanal = (o.ekran.kanal + 1) % kam.length; this.rtSayac = 0;
    return `Kamera ${o.ekran.kanal + 1} / ${kam.length}`;
  }
  ekranBirak(o) {
    const E = o && o.ekran; if (!E) return;
    if (E.rt) { E.rt.dispose(); E.rtMalz.dispose(); E.rt = null; }
    if (E.tex) { E.tex.dispose(); E.malz.dispose(); E.tex = null; E.cv = null; }
  }

  /* ---------- 0.26.0: kablolar ----------
     Kablo noktaları arasında sarkan bir eğri boyunca ince bir boru olarak çizilir. Bakılan kablo (elde kablo varken) vurgulanır. */
  /* sarkmalar: her parçanın ortasındaki sarkma (blok; 0: gergin, düz). Verilmezse uzunluğa göre hafif sarkar */
  static sarkik(noktalar, sarkmalar) {
    const yol = [];
    for (let i = 1; i < noktalar.length; i++) {
      const a = noktalar[i - 1], b = noktalar[i], L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), n = Math.max(2, Math.ceil(L * 2.5));
      const sark = Math.min(L * 0.6, sarkmalar ? (+sarkmalar[i - 1] || 0) : Math.min(1.4, L * 0.06));
      for (let j = i === 1 ? 0 : 1; j <= n; j++) { const t = j / n; yol.push(new THREE.Vector3(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - 4 * sark * t * (1 - t), a[2] + (b[2] - a[2]) * t)); }
    }
    return yol;
  }
  boru(yol, r = 0.032) {
    if (yol.length < 2) return null;
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(yol, false, 'centripetal'), Math.min(400, yol.length * 2), r, 5, false);
  }
  kablolariCiz(K, isik) {
    if (!this.kabloGrup) {
      this.kabloGrup = new THREE.Group(); this.grup.add(this.kabloGrup);
      this.kabloMalz = new THREE.MeshBasicMaterial({ color: 0x24282e }); this.kabloVurguMalz = new THREE.MeshBasicMaterial({ color: 0xe8a33d });
      this.kabloYol = new Map(); this.kSurum = -1; this.kEksik = false;
    }
    const c = 0.16 * Math.max(0.35, isik); this.kabloMalz.color.setRGB(c * 0.95, c, c * 1.1);
    if (K.surum === this.kSurum && !this.kEksik) return;
    if (this.kEksik && K.surum === this.kSurum && (this.kSayac = (this.kSayac || 0) + 1) % 30) return;   // yüklenmemiş uçlar ara sıra yeniden denenir
    for (const m of this.kabloGrup.children) m.geometry.dispose();
    this.kabloGrup.clear(); this.kabloYol.clear();
    this.kSurum = K.surum; this.kEksik = false;
    for (const w of K.liste.values()) {
      const n = K.noktalar(w);
      if (!n) { this.kEksik = true; continue; }
      const yol = CihazCizici.sarkik(n, w.s), g = this.boru(yol);
      if (!g) continue;
      const m = new THREE.Mesh(g, this.kabloMalz); m.userData.i = w.i; this.kabloGrup.add(m); this.kabloYol.set(w.i, yol);
    }
    this.vurgu = null;
  }
  /* Işının en yakın kabloyla kesişmesi: kablo numarası ya da null (maks: ışın uzunluğu) */
  kabloIsin(goz, yon, maks) {
    if (!this.kabloYol) return null;
    let en = null, enT = maks;
    const v = new THREE.Vector3();
    for (const [i, yol] of this.kabloYol) for (const p of yol) {
      v.subVectors(p, goz); const t = v.dot(yon);
      if (t < 0 || t > enT) continue;
      const d2 = v.lengthSq() - t * t;
      if (d2 < 0.16 * 0.16) { en = i; enT = t; }
    }
    return en;
  }
  kabloVurgula(i) {
    if (!this.kabloGrup || this.vurgu === i) return;
    this.vurgu = i;
    for (const m of this.kabloGrup.children) m.material = m.userData.i === i ? this.kabloVurguMalz : this.kabloMalz;
  }
  /* ---------- 0.27.0: bağlantı noktaları ----------
     Her elektrikli cihazın giriş (mavi) ve çıkış (turuncu) noktaları küçük soketler olarak çizilir; dolu soketin ortası koyudur.
     Elde kablo yokken soketler sönük görünür; bakılan nokta beyaz bir çerçeveyle (uygun değilse kırmızı) vurgulanır. */
  portlariKur(K) {
    if (!this.portGrup) {
      this.portGrup = new THREE.Group(); this.grup.add(this.portGrup);
      this.portGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1); this.portIcGeo = new THREE.BoxGeometry(0.05, 0.05, 0.05);
      this.portMalz = { giris: new THREE.MeshBasicMaterial({ color: 0x3f9cff }), cikis: new THREE.MeshBasicMaterial({ color: 0xff9d2e }), ic: new THREE.MeshBasicMaterial({ color: 0x15181c }) };
      this.portIz = '';
    }
    const d = this.dunya, parca = [];
    for (const [k, [x, y, z]] of d.elektrikler) { const n = portlar(BLOKLAR[d.blok(x, y, z)]).length; if (n) parca.push(k + ':' + d.blok(x, y, z)); }
    const iz = parca.join('|') + '#' + (K ? K.surum : 0);
    if (iz === this.portIz) return;
    this.portIz = iz;
    this.portGrup.clear();
    for (const p of parca) {
      const k = p.split(':')[0], [x, y, z] = k.split(',').map(Number), l = portlar(BLOKLAR[d.blok(x, y, z)]);
      for (let i = 0; i < l.length; i++) {
        const q = portBilgi(d, k, i); if (!q) continue;
        const m = new THREE.Mesh(this.portGeo, this.portMalz[q.tur]); m.position.set(q.p[0], q.p[1], q.p[2]); this.portGrup.add(m);
        if (K && K.portKablosu(k, i)) { const c = new THREE.Mesh(this.portIcGeo, this.portMalz.ic); c.scale.set(1.05, 1.05, 1.05); c.position.copy(m.position); this.portGrup.add(c); }
      }
    }
  }
  /* 0.29.0: elde kablo yokken bağlantı noktaları renksiz, parlamayan koyu gri metal soket olarak görünür (ortam ışığıyla kararır) */
  portlariGoster(elde) {
    if (!this.portMalz) return;
    if (elde) { this.portMalz.giris.color.setRGB(0.25, 0.61, 1); this.portMalz.cikis.color.setRGB(1, 0.62, 0.18); return; }
    const g = 0.2 * Math.max(0.3, this.isik ?? 1);
    this.portMalz.giris.color.setRGB(g, g, g * 1.05); this.portMalz.cikis.color.setRGB(g, g, g * 1.05);
  }
  portVurgula(p, gecerli) {
    if (!this.portCerceve) {
      this.portCerceve = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.16, 0.16, 0.16)), new THREE.LineBasicMaterial({ color: 0xffffff, depthTest: false }));
      this.portCerceve.renderOrder = 10; this.grup.add(this.portCerceve);
    }
    this.portCerceve.visible = !!p;
    if (!p) return;
    this.portCerceve.position.set(p.p[0], p.p[1], p.p[2]);
    this.portCerceve.material.color.set(gecerli ? 0xffffff : 0xff5a4e);
  }

  /* Çekilmekte olan kablonun önizlemesi: b = etkilesim.kabloOnizleme() */
  kabloOnizleme(b) {
    if (!this.kOnMalz) this.kOnMalz = new THREE.MeshBasicMaterial({ color: 0x7fe08a, transparent: true, opacity: 0.85 });
    if (!b) { if (this.kOn) this.kOn.visible = false; this.kOnAnahtar = ''; return; }
    const anahtar = b.noktalar.map(p => p.map(v => v.toFixed(2)).join(',')).join(';') + b.gecerli + b.sarkmalar.join(',');
    if (anahtar === this.kOnAnahtar && this.kOn) { this.kOn.visible = true; return; }
    this.kOnAnahtar = anahtar;
    const g = this.boru(CihazCizici.sarkik(b.noktalar, b.sarkmalar), 0.028);
    if (!g) return;
    if (!this.kOn) { this.kOn = new THREE.Mesh(g, this.kOnMalz); this.grup.add(this.kOn); }
    else { this.kOn.geometry.dispose(); this.kOn.geometry = g; }
    this.kOn.visible = true;
    this.kOnMalz.color.set(b.gecerli ? 0x7fe08a : 0xf0584e);
  }

  /* ---------- Önizleme ----------
     b: null (gizle), { cihaz, yon, x, y, z, gecerli } ya da { id, x, y, z, gecerli } */
  onizleme(b) {
    if (!b) { if (this.hayalet) this.hayalet.visible = false; return; }
    const anahtar = b.cihaz ? 'c:' + b.cihaz : b.parcalar ? 'p:' + b.parcalar.map(q => q[0]).join(',') : 'b:' + b.id;
    let h = this.hayaletler.get(anahtar);
    if (!h) {
      if (b.cihaz) h = this.ornekKur(b.cihaz, this.hayaletMalz).dis;
      else if (b.parcalar) {   // 0.36.1: çok parçalı blok (yatak): parçalar ilk parçaya göre yerleşir
        h = new THREE.Group();
        const [, x0, y0, z0] = b.parcalar[0];
        for (const [id, x, y, z] of b.parcalar) {
          const kutular = sekilKutulari(id, () => 0).map(k => ({ k: k.slice(0, 6), t: k.length > 6 ? k[6] : [0, 1, 2, 3, 4, 5].map(f => YUZ_DOKU[id * 6 + f]) }));
          const m = new THREE.Mesh(kutuGeo(kutular), this.hayaletMalz); m.position.set(x - x0, y - y0, z - z0); h.add(m);
        }
      }
      else {
        const kutular = sekilKutulari(b.id, () => 0).map(k => ({ k: k.slice(0, 6), t: k.length > 6 ? k[6] : [0, 1, 2, 3, 4, 5].map(f => YUZ_DOKU[b.id * 6 + f]) }));
        h = new THREE.Group(); const m = new THREE.Mesh(kutuGeo(kutular), this.hayaletMalz); m.position.set(-0.5, 0, -0.5); h.add(m);
      }
      h.renderOrder = 5;
      this.hayaletler.set(anahtar, h); this.grup.add(h);
    }
    if (this.hayalet && this.hayalet !== h) this.hayalet.visible = false;
    this.hayalet = h; h.visible = true;
    if (b.cihaz) this.yerlestir(h, b.yon, b.x, b.y, b.z); else if (b.parcalar) { h.position.set(b.parcalar[0][1], b.parcalar[0][2], b.parcalar[0][3]); h.rotation.y = 0; } else { h.position.set(b.x + 0.5, b.y, b.z + 0.5); h.rotation.y = 0; }
    /* uygun: hafif yeşil; uygun değil: kırmızı */
    const c = b.gecerli ? [0.75, 1.15, 0.8] : [1.35, 0.45, 0.4], i = Math.max(0.65, this.isik ?? 1);
    this.hayaletMalz.color.setRGB(c[0] * i, c[1] * i, c[2] * i);
    this.hayaletMalz.opacity = b.gecerli ? 0.55 : 0.45;
  }
}

/* ---------- 0.53.0: ekran çizimleri ---------- */
const TV_KANAL = ['Doğa Belgeseli', 'Haber', 'Maç', 'Hava Durumu'];
const HABER = ['Köylerde hasat bayramı coşkusu', 'Elektrik şebekesi büyüyor: yeni direkler dikildi', 'Gezgin tüccar nadir parçalarla geldi', 'Kanlı Ay uyarısı: geceleri dışarı çıkmayınız',
  'Madenlerde yeni cevher damarları bulundu', 'Rüzgâr türbinleri rekor üretti', 'Fırtına uyarısı: paratonerler hazır', 'Balıkçılar bol av bildirdi'];
function olcerCiz(c, W, H, v) {
  c.fillStyle = '#0d1a12'; c.fillRect(0, 0, W, H);
  c.fillStyle = '#16301f'; c.fillRect(3, 3, W - 6, H - 6);
  const s = (Math.round(v * 10) / 10).toFixed(1).replace('.', ',');
  c.fillStyle = '#1c3a26'; c.font = 'bold 30px monospace'; c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillText('888,8', W - 8, H / 2 - 4);
  c.fillStyle = v > 0.05 ? '#62ff8e' : '#3a7a50'; c.fillText(s.length > 5 ? Math.round(v) + '' : s, W - 8, H / 2 - 4);
  c.font = 'bold 10px sans-serif'; c.fillStyle = '#62ff8e'; c.textAlign = 'right'; c.fillText('E/sn', W - 8, H - 9);
  c.textAlign = 'left'; c.fillStyle = v > 0.05 ? '#62ff8e' : '#2a5a3a'; c.fillRect(8, H - 13, 6, 6);
}
function sinyalYok(c, W, H) {
  const d = c.createImageData(W, H);
  for (let i = 0; i < W * H; i++) { const g = Math.random() * 200; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = g; d.data[i * 4 + 3] = 255; }
  c.putImageData(d, 0, 0);
  c.fillStyle = 'rgba(0,0,0,0.65)'; c.fillRect(0, H / 2 - 9, W, 18);
  c.fillStyle = '#f0f0f0'; c.font = 'bold 11px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SİNYAL YOK', W / 2, H / 2);
}
function tvCiz(c, W, H, kanal, t, O, adGoster) {
  c.save(); c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  if (kanal === 0) {   // Doğa belgeseli: gün batımı, dağlar, tepeler, yürüyen geyik ve kuşlar
    const g = c.createLinearGradient(0, 0, 0, H * 0.7); g.addColorStop(0, '#2a4a8a'); g.addColorStop(0.6, '#e88a4a'); g.addColorStop(1, '#f6c26a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = '#ffe9a0'; c.beginPath(); c.arc(W * 0.7, H * 0.52 - Math.sin(t * 0.05) * 6, 14, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#5a4a6a'; c.beginPath(); c.moveTo(0, H * 0.62); for (let x = 0; x <= W; x += 16) c.lineTo(x, H * 0.62 - 18 - Math.abs(Math.sin(x * 0.045)) * 26); c.lineTo(W, H); c.lineTo(0, H); c.fill();
    c.fillStyle = '#3a5a32'; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 8) c.lineTo(x, H * 0.74 + Math.sin(x * 0.03 + 1) * 6); c.lineTo(W, H); c.fill();
    for (let i = 0; i < 9; i++) { const x = (i * 29) % W; c.fillStyle = '#24401f'; c.beginPath(); c.moveTo(x, H * 0.76); c.lineTo(x + 6, H * 0.62); c.lineTo(x + 12, H * 0.76); c.fill(); }
    const gx = ((t * 14) % (W + 60)) - 30, gyy = H * 0.8, ad = Math.sin(t * 6) * 2;
    c.fillStyle = '#2a1a10'; c.fillRect(gx, gyy - 12, 22, 8); c.fillRect(gx + 18, gyy - 20, 5, 10); c.fillRect(gx + 20, gyy - 24, 7, 5);
    for (const [ox, f] of [[2, 1], [6, -1], [15, 1], [19, -1]]) c.fillRect(gx + ox + ad * f * 0.5, gyy - 4, 2, 8);
    c.strokeStyle = '#2a1a10'; c.lineWidth = 1; c.beginPath(); c.moveTo(gx + 22, gyy - 24); c.lineTo(gx + 20, gyy - 30); c.moveTo(gx + 25, gyy - 24); c.lineTo(gx + 28, gyy - 30); c.stroke();
    c.strokeStyle = '#1a1a24'; for (let i = 0; i < 4; i++) { const x = (t * 20 + i * 47) % (W + 20) - 10, y = 22 + i * 7 + Math.sin(t * 2 + i) * 3, k = Math.sin(t * 8 + i) * 2; c.beginPath(); c.moveTo(x - 4, y - k); c.lineTo(x, y); c.lineTo(x + 4, y - k); c.stroke(); }
    c.fillStyle = 'rgba(0,0,0,0.55)'; c.fillRect(8, H - 26, 118, 16); c.fillStyle = '#ffffff'; c.font = 'bold 10px sans-serif'; c.fillText('DOĞA BELGESELİ', 13, H - 14);
  } else if (kanal === 1) {   // Haber: stüdyo, spiker, manşet ve kayan yazı
    const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#0c1c3a'); g.addColorStop(1, '#1e3a6a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 6; i++) { c.fillStyle = `rgba(80,140,220,${0.08 + i * 0.02})`; c.fillRect(120 + i * 16, 10, 10, 80); }
    c.fillStyle = '#d8c0a0'; c.beginPath(); c.arc(70, 50, 15, 0, Math.PI * 2); c.fill(); c.fillStyle = '#2a2a30'; c.beginPath(); c.arc(70, 44, 15, Math.PI, 0); c.fill();
    c.fillStyle = '#1a2a4a'; c.fillRect(48, 66, 44, 34); c.fillStyle = '#c83030'; c.fillRect(68, 68, 4, 14); c.fillStyle = '#2a3a5a'; c.fillRect(20, 92, 120, 12);
    const h = HABER[Math.floor(t / 6) % HABER.length];
    c.fillStyle = '#c8302a'; c.fillRect(0, H - 40, 46, 18); c.fillStyle = '#fff'; c.font = 'bold 10px sans-serif'; c.fillText('HM HABER', 3, H - 27);
    c.fillStyle = 'rgba(255,255,255,0.92)'; c.fillRect(46, H - 40, W - 46, 18); c.fillStyle = '#10203a'; c.font = 'bold 10px sans-serif'; c.fillText(h.length > 34 ? h.slice(0, 33) + '…' : h, 50, H - 27);
    const z = O.zaman ?? 0, dk = Math.floor(((z * 24 + 6) % 24) * 60), saat = `${String(Math.floor(dk / 60)).padStart(2, '0')}:${String(dk % 60).padStart(2, '0')}`;
    const kay = `${O.gun || 1}. gün · Saat ${saat} · ${O.firtina ? 'Fırtına uyarısı sürüyor' : 'Hava sakin'} · Mevsim: ${['İlkbahar', 'Yaz', 'Sonbahar', 'Kış'][O.mevsim || 0]} · `;
    c.fillStyle = '#0a1426'; c.fillRect(0, H - 20, W, 20); c.fillStyle = '#f2c84a'; c.font = '10px sans-serif';
    const gw = c.measureText(kay).width, ofs = (t * 30) % gw; c.fillText(kay + kay + kay, 4 - ofs, H - 6);
  } else if (kanal === 2) {   // Maç: çizgili saha, iki takım, top ve skor tabelası
    for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#3a8a3a' : '#469a46'; c.fillRect(i * W / 8, 0, W / 8 + 1, H); }
    c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 1.5; c.strokeRect(8, 18, W - 16, H - 26); c.beginPath(); c.moveTo(W / 2, 18); c.lineTo(W / 2, H - 8); c.stroke();
    c.beginPath(); c.arc(W / 2, (H + 10) / 2, 16, 0, Math.PI * 2); c.stroke(); c.strokeRect(8, H / 2 - 14, 18, 36); c.strokeRect(W - 26, H / 2 - 14, 18, 36);
    const top = [W / 2 + Math.sin(t * 0.7) * 70, H / 2 + 6 + Math.sin(t * 1.3) * 32];
    for (let i = 0; i < 12; i++) { const k = i < 6, bx = (k ? 0.3 : 0.7) * W + Math.sin(i * 2.3) * 40, by = 30 + (i % 6) * 17, x = bx + (top[0] - bx) * 0.25 + Math.sin(t * 1.5 + i) * 6, y = by + (top[1] - by) * 0.2;
      c.fillStyle = k ? '#d83a30' : '#2f5bc0'; c.fillRect(x - 3, y - 4, 6, 8); c.fillStyle = '#f0d0b0'; c.fillRect(x - 2, y - 7, 4, 3); }
    c.fillStyle = '#fff'; c.fillRect(top[0] - 2, top[1] - 2, 4, 4);
    const dk = Math.floor(t / 2) % 90 + 1, gol = Math.floor(t / 37);
    c.fillStyle = 'rgba(0,0,0,0.7)'; c.fillRect(6, 2, 128, 14); c.fillStyle = '#fff'; c.font = 'bold 10px sans-serif'; c.fillText(`KIRMIZI ${gol % 4} - ${(gol * 3 + 1) % 5} MAVİ   ${dk}'`, 10, 13);
  } else {   // Hava durumu: harita, şehir simgeleri ve sıcaklıklar
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a5aa8'); g.addColorStop(1, '#0c2e64'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = '#5aa04a'; c.beginPath(); c.moveTo(20, 50); c.lineTo(90, 34); c.lineTo(170, 40); c.lineTo(210, 70); c.lineTo(180, 110); c.lineTo(90, 116); c.lineTo(30, 96); c.closePath(); c.fill();
    c.fillStyle = '#4a8a3c'; c.beginPath(); c.moveTo(60, 70); c.lineTo(120, 60); c.lineTo(150, 90); c.lineTo(80, 100); c.closePath(); c.fill();
    const gun = O.gun || 1, S = [['Köy', 52, 62], ['Liman', 160, 58], ['Dağ', 110, 82], ['Çöl', 170, 98], ['Orman', 60, 98]];
    S.forEach(([ad, x, y], i) => {
      const h = (gun * 7 + i * 13) % 5, sic = [24, 18, 12, 31, 6][i] + ((gun + i) % 7) - 3 - (O.mevsim === 3 ? 12 : O.mevsim === 1 ? -5 : 0);
      if (h < 2) { c.fillStyle = '#ffd84a'; c.beginPath(); c.arc(x, y, 6, 0, Math.PI * 2); c.fill(); } else { c.fillStyle = '#eef2f6'; c.beginPath(); c.arc(x - 3, y, 5, 0, Math.PI * 2); c.arc(x + 3, y - 2, 6, 0, Math.PI * 2); c.fill(); if (h > 3) { c.fillStyle = '#6ab0ff'; for (let j = 0; j < 3; j++) c.fillRect(x - 4 + j * 4, y + 6 + ((t * 20 + j * 3) % 6), 1, 3); } }
      c.fillStyle = '#fff'; c.font = 'bold 9px sans-serif'; c.fillText(`${ad} ${sic}°`, x - 14, y + 18);
    });
    c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(0, 0, W, 16); c.fillStyle = '#fff'; c.font = 'bold 10px sans-serif'; c.fillText(`HAVA DURUMU · ${gun}. gün`, 6, 12);
  }
  /* tarama çizgileri ve kanal adı */
  c.fillStyle = 'rgba(0,0,0,0.08)'; for (let y = 0; y < H; y += 3) c.fillRect(0, y, W, 1);
  if (adGoster) { c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(W - 92, 4, 88, 16); c.fillStyle = '#8affa0'; c.font = 'bold 10px monospace'; c.textAlign = 'right'; c.fillText(`${kanal + 1} ${TV_KANAL[kanal].slice(0, 12)}`, W - 7, 16); }
  c.restore();
}
