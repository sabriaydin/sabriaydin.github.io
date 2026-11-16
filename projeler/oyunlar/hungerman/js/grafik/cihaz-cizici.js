/* HungerMan - çok bloklu cihazların çizimi ve yerleştirme önizlemesi (0.25.0)
   Cihaz hücreleri dünya meshinde görünmezdir; her cihaz, kök hücresinde kurulan bir model olarak çizilir:
   - Güneş Paneli: ayaklar üstünde öne eğik iki parçalı panel.
   - Rüzgâr Türbini: beton taban, daralan kule, gövde (nasel) ve üç kanatlı dönen pervane (hız üretime bağlıdır).
   - Su Çarkı: iki ayak, mil, jeneratör ve kepçeli dönen ahşap çark.
   - Bataryalar: gövde ve önde doluluğu gösteren ışıklı gösterge.
   Modeller yerel düzende tanımlanır (cihazlar.js): kök hücrenin köşesi başlangıçtır, ön -z tarafıdır.
   Önizleme: elde cihaz ya da yönlü blok tutulurken konulacağı yerde yarı saydam hayalet model; uygunsa yeşil, değilse kırmızı. */
import { THREE } from './sahne.js';
import { T, YUZ_DOKU, BLOKLAR } from '../bloklar.js';
import { CIHAZ, PERVANE } from '../cihazlar.js';
import { sekilKutulari } from '../sekiller.js';
import { cihazUretim } from '../oyun/elektrik.js';

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
      const doku = Array.isArray(t) ? t[f] : t, tx = doku & 15, ty = doku >> 4;
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
            uv.push((tx + EPS + Math.min(1, lu) * (1 - 2 * EPS)) / 16, 1 - (ty + 1 - EPS - Math.min(1, lv) * (1 - 2 * EPS)) / 16);
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
    return { dis, donen, gostergeler };
  }
  yerlestir(dis, yon, x, y, z) { dis.position.set(x + 0.5, y, z + 0.5); dis.rotation.y = -yon * Math.PI / 2; }

  /* dt: kare süresi; isik: ortam ışığı; O: hava ve zaman (üretim hesabı için); oran(k): bataryanın doluluğu */
  guncelle(dt, isik, O, oran) {
    this.malz.color.setScalar(isik); this.isik = isik;
    this.sayac -= dt;
    if (this.sayac <= 0) { this.sayac = 0.5; this.tara(O, oran); }
    for (const o of this.liste.values()) {
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
      if (o && o.id !== id) { this.grup.remove(o.dis); this.liste.delete(k); o = null; }
      if (!o) {
        o = { id, tur: b.cihaz, ...this.ornekKur(b.cihaz, this.malz), hiz: 0, hedefHiz: 0, aci: Math.random() * 6 };
        this.yerlestir(o.dis, b.yon, x, y, z); this.grup.add(o.dis); this.liste.set(k, o);
      }
      if (o.donen) { const r = cihazUretim(d, b, x, y, z, O), n = r.u / b.uretim; o.hedefHiz = r.u > 0 ? (b.cihaz === 'ruzgar' ? 0.5 + 2.4 * n : 0.7 + 1.2 * n) : 0; }
      if (o.gostergeler.length) {
        const r = Math.max(0, Math.min(1, oran(k) ?? 0)), malz = r < 0.2 ? this.gostergeMalz.kirmizi : r < 0.5 ? this.gostergeMalz.sari : this.gostergeMalz.yesil;
        for (const g of o.gostergeler) { const n = g.ledler.length, yanan = r <= 0.01 ? 0 : Math.max(1, Math.round(r * n)); g.ledler.forEach((l, i) => { l.material = i < yanan ? malz : this.gostergeMalz.sonuk; }); }
      }
    }
    for (const [k, o] of this.liste) if (!gorulen.has(k)) { this.grup.remove(o.dis); this.liste.delete(k); }
  }
  temizle() { for (const o of this.liste.values()) this.grup.remove(o.dis); this.liste.clear(); this.onizleme(null); }

  /* ---------- 0.26.0: kablolar ----------
     Kablo noktaları arasında sarkan bir eğri boyunca ince bir boru olarak çizilir. Bakılan kablo (elde kablo varken) vurgulanır. */
  static sarkik(noktalar) {
    const yol = [];
    for (let i = 1; i < noktalar.length; i++) {
      const a = noktalar[i - 1], b = noktalar[i], L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), sark = Math.min(1.4, L * 0.06), n = Math.max(2, Math.ceil(L * 2.5));
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
      const yol = CihazCizici.sarkik(n), g = this.boru(yol);
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
  /* Çekilmekte olan kablonun önizlemesi: b = etkilesim.kabloOnizleme() */
  kabloOnizleme(b) {
    if (!this.kOnMalz) this.kOnMalz = new THREE.MeshBasicMaterial({ color: 0x7fe08a, transparent: true, opacity: 0.85 });
    if (!b) { if (this.kOn) this.kOn.visible = false; this.kOnAnahtar = ''; return; }
    const anahtar = b.noktalar.map(p => p.map(v => v.toFixed(2)).join(',')).join(';') + b.gecerli;
    if (anahtar === this.kOnAnahtar && this.kOn) { this.kOn.visible = true; return; }
    this.kOnAnahtar = anahtar;
    const g = this.boru(CihazCizici.sarkik(b.noktalar), 0.028);
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
    const anahtar = b.cihaz ? 'c:' + b.cihaz : 'b:' + b.id;
    let h = this.hayaletler.get(anahtar);
    if (!h) {
      if (b.cihaz) h = this.ornekKur(b.cihaz, this.hayaletMalz).dis;
      else {
        const kutular = sekilKutulari(b.id, () => 0).map(k => ({ k: k.slice(0, 6), t: k.length > 6 ? k[6] : [0, 1, 2, 3, 4, 5].map(f => YUZ_DOKU[b.id * 6 + f]) }));
        h = new THREE.Group(); const m = new THREE.Mesh(kutuGeo(kutular), this.hayaletMalz); m.position.set(-0.5, 0, -0.5); h.add(m);
      }
      h.renderOrder = 5;
      this.hayaletler.set(anahtar, h); this.grup.add(h);
    }
    if (this.hayalet && this.hayalet !== h) this.hayalet.visible = false;
    this.hayalet = h; h.visible = true;
    if (b.cihaz) this.yerlestir(h, b.yon, b.x, b.y, b.z); else { h.position.set(b.x + 0.5, b.y, b.z + 0.5); h.rotation.y = 0; }
    /* uygun: hafif yeşil; uygun değil: kırmızı */
    const c = b.gecerli ? [0.75, 1.15, 0.8] : [1.35, 0.45, 0.4], i = Math.max(0.65, this.isik ?? 1);
    this.hayaletMalz.color.setRGB(c[0] * i, c[1] * i, c[2] * i);
    this.hayaletMalz.opacity = b.gecerli ? 0.55 : 0.45;
  }
}
