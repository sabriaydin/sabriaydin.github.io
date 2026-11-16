/* HungerMan - envanterde canlı karakter önizlemesi (0.30.0)
   Oyuncu modeli kendi küçük çiziciyle çizilir; giyilen zırhlar (malzeme rengiyle, büyülüyse parıltılı) ve eldeki eşya üzerinde görünür.
   Minecraft'taki gibi kafa ve gövde fare imlecini izler; önizleme sürüklenerek döndürülür, çift tıkla öne döner. Pencere kapalıyken çizim durur. */
import { THREE } from '../grafik/sahne.js';
import { parca, gurultu, kutuGeo, birlestir } from '../varlik/modeller.js';
import { simge } from '../grafik/doku.js';
import { ESYALAR } from '../bloklar.js';

const TEN = '#d9a982', SAC = '#3b2a1d', PANTOLON = '#34495e', AYAKKABI = '#2a2420';
const koyu = (r, k) => '#' + new THREE.Color(r).multiplyScalar(k).getHexString();

/* Zırh kutuları: parça -> [eklem ('kafa' | 'govde' | 'kol0' | 'kol1' | 'bacak0' | 'bacak1'), kutular] */
function zirhKutulari(id) {
  const E = ESYALAR[id], r = E.renk || '#9aa0a6', k = koyu(r, 0.72), p = E.zirh.parca;
  if (id === 456) return [['kafa', [[0.44, 0.17, 0.05, '#9fdcff', 0, 0.29, -0.265], [0.5, 0.05, 0.06, '#2a3a44', 0, 0.39, -0.26], [0.5, 0.05, 0.06, '#2a3a44', 0, 0.19, -0.26],
    [0.52, 0.06, 0.52, '#2a3a44', 0, 0.32, 0], [0.12, 0.1, 0.06, '#e8a33d', 0, 0.12, -0.29]]]];   // dalış maskesi
  if (id === 457) return [0, 1].map(s => ['bacak' + s, [[0.28, 0.2, 0.3, '#1f6f7a', 0, -0.65, -0.01], [0.3, 0.035, 0.42, '#2a9aaa', 0, -0.735, -0.24]]]);   // palet
  if (p === 0) return [['kafa', [[0.56, 0.08, 0.56, r, 0, 0.52, 0], [0.56, 0.1, 0.05, k, 0, 0.43, -0.265], [0.05, 0.32, 0.56, r, -0.265, 0.34, 0], [0.05, 0.32, 0.56, r, 0.265, 0.34, 0],
    [0.56, 0.4, 0.05, r, 0, 0.3, 0.265], [0.06, 0.12, 0.05, k, 0, 0.32, -0.27]]]];
  if (p === 1) return [['govde', [[0.56, 0.62, 0.32, r, 0, 0.06, 0], [0.4, 0.06, 0.02, k, 0, 0.2, -0.17], [0.16, 0.36, 0.02, k, 0, -0.04, -0.17]]],
    ...[0, 1].map(s => ['kol' + s, [[0.28, 0.26, 0.3, r, 0, -0.07, 0], [0.29, 0.05, 0.31, k, 0, -0.2, 0]]])];
  if (p === 2) return [['govde', [[0.55, 0.12, 0.31, k, 0, -0.32, 0]]], ...[0, 1].map(s => ['bacak' + s, [[0.29, 0.5, 0.29, r, 0, -0.24, 0], [0.3, 0.06, 0.3, k, 0, -0.04, 0]]])];
  return [0, 1].map(s => ['bacak' + s, [[0.29, 0.22, 0.32, r, 0, -0.64, -0.015], [0.3, 0.05, 0.33, k, 0, -0.53, -0.015]]]);
}

export class KarakterOnizleme {
  constructor(kap) {
    this.kap = kap;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'karakterTuval';
    kap.appendChild(this.canvas);
    this.hazir = false; this.calisiyor = false; this.imz = '';
    this.fare = [0, 0]; this.donus = 0; this.donusHedef = 0; this.surukle = null; this.zaman = 0;
    kap.addEventListener('pointerdown', e => { if (e.button !== 0) return; this.surukle = { x: e.clientX, d: this.donusHedef }; kap.setPointerCapture(e.pointerId); kap.classList.add('surukleniyor'); });
    kap.addEventListener('pointermove', e => { if (this.surukle) this.donusHedef = this.surukle.d + (e.clientX - this.surukle.x) * 0.018; });
    const birak = () => { this.surukle = null; kap.classList.remove('surukleniyor'); };
    kap.addEventListener('pointerup', birak); kap.addEventListener('pointercancel', birak);
    kap.addEventListener('dblclick', () => { this.donusHedef = 0; });
    this.fareDinle = e => { this.fare = [e.clientX, e.clientY]; };
  }
  kur() {
    if (this.hazir) return true;
    try {
      this.cizici = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch (e) { this.kap.classList.add('desteksiz'); return false; }
    this.cizici.setClearColor(0x000000, 0);
    this.sahne = new THREE.Scene();
    this.kamera = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
    this.kamera.position.set(0, 1.3, -5.6); this.kamera.lookAt(0, 1.0, 0);
    /* Zemin gölgesi */
    const gc = document.createElement('canvas'); gc.width = gc.height = 64;
    const gx = gc.getContext('2d'), gr = gx.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); gx.fillStyle = gr; gx.fillRect(0, 0, 64, 64);
    const golge = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.8), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, depthWrite: false }));
    golge.rotation.x = -Math.PI / 2; golge.position.y = 0.002; this.sahne.add(golge);
    /* Oyuncu modeli (uzak oyuncularla aynı ölçüler) */
    const malzeme = this.malzeme = new THREE.MeshBasicMaterial({ vertexColors: true, map: gurultu() });
    const kok = this.kok = new THREE.Group();
    const renk = this.renk || '#2e86c1';
    this.govde = parca(kok, malzeme, [0, 1.12, 0], [[0.5, 0.75, 0.26, renk], [0.52, 0.08, 0.28, '#2c2c2c', 0, -0.33, 0], [0.16, 0.12, 0.02, '#f2f2f2', 0, 0.22, -0.135]]);
    this.kafa = parca(kok, malzeme, [0, 1.5, 0], [[0.48, 0.48, 0.48, TEN, 0, 0.24, 0], [0.5, 0.12, 0.5, SAC, 0, 0.45, 0], [0.5, 0.3, 0.1, SAC, 0, 0.3, 0.21],
      [0.08, 0.07, 0.02, '#1e1e24', -0.11, 0.27, -0.245], [0.08, 0.07, 0.02, '#1e1e24', 0.11, 0.27, -0.245], [0.16, 0.03, 0.02, '#8a4a3a', 0, 0.11, -0.245]]);
    this.kollar = [-1, 1].map(s => parca(kok, malzeme, [s * 0.37, 1.45, 0], [[0.22, 0.3, 0.24, renk, 0, -0.1, 0], [0.2, 0.46, 0.22, TEN, 0, -0.48, 0]]));
    this.bacaklar = [-1, 1].map(s => parca(kok, malzeme, [s * 0.125, 0.75, 0], [[0.24, 0.75, 0.24, PANTOLON, 0, -0.375, 0], [0.25, 0.12, 0.27, AYAKKABI, 0, -0.69, -0.01]]));
    this.govdeRenk = renk;
    this.eklem = { kafa: this.kafa, govde: this.govde, kol0: this.kollar[0], kol1: this.kollar[1], bacak0: this.bacaklar[0], bacak1: this.bacaklar[1] };
    this.zirhMesh = [];
    /* Eldeki eşya: sağ elde (model önü -z, sağ el +x tarafında görünür) */
    this.el = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.46), new THREE.MeshBasicMaterial({ transparent: true, alphaTest: 0.3, side: THREE.DoubleSide }));
    this.el.position.set(0, -0.74, -0.2); this.el.rotation.set(0, Math.PI / 2, Math.PI / 4); this.el.visible = false;
    this.kollar[1].add(this.el);
    this.sahne.add(kok);
    this.hazir = true;
    return true;
  }
  /* Oyuncunun gömlek rengi (çok oyunculudaki rengi) */
  renkAyarla(r) {
    if (!r || r === this.renk) return;
    this.renk = r;
    if (this.hazir) { this.sahne.remove(this.kok); this.kok.traverse(n => n.geometry && n.geometry.dispose()); this.hazir = false; this.imz = ''; }
  }
  /* Giyilen zırhlar ve eldeki eşya değiştiyse modeli günceller */
  giydir(zirh, elde) {
    if (!this.hazir) return;
    const imz = zirh.map(z => (z ? z.id + (z.buyu ? 'b' : '') : '-')).join(',') + '|' + (elde ? elde.id : 0);
    if (imz === this.imz) return;
    this.imz = imz;
    for (const m of this.zirhMesh) { m.parent.remove(m); m.geometry.dispose(); if (m.material !== this.malzeme) m.material.dispose(); }
    this.zirhMesh = [];
    for (const z of zirh) {
      if (!z || !ESYALAR[z.id] || !ESYALAR[z.id].zirh) continue;
      const mal = z.buyu ? new THREE.MeshBasicMaterial({ vertexColors: true, map: gurultu() }) : this.malzeme;
      if (z.buyu) mal.userData.parilti = true;
      for (const [ek, kutular] of zirhKutulari(z.id)) {
        const g = kutular.map(k => kutuGeo(...k)), m = new THREE.Mesh(birlestir(g), mal);
        this.eklem[ek].add(m); this.zirhMesh.push(m);
      }
    }
    if (elde && ESYALAR[elde.id]) {
      const t = new THREE.CanvasTexture(simge(elde.id).cv); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace;
      if (this.el.material.map) this.el.material.map.dispose();
      this.el.material.map = t; this.el.material.needsUpdate = true; this.el.visible = true;
    } else this.el.visible = false;
  }
  baslat() {
    if (!this.kur()) return;
    if (this.calisiyor) return;
    this.calisiyor = true;
    addEventListener('mousemove', this.fareDinle);
    let once = performance.now();
    const adim = t => {
      if (!this.calisiyor) return;
      const dt = Math.min(0.05, (t - once) / 1000); once = t;
      this.ciz(dt);
      this.istek = requestAnimationFrame(adim);
    };
    this.istek = requestAnimationFrame(adim);
  }
  durdur() {
    this.calisiyor = false;
    cancelAnimationFrame(this.istek);
    removeEventListener('mousemove', this.fareDinle);
  }
  ciz(dt) {
    const w = this.kap.clientWidth, h = this.kap.clientHeight;
    if (!w || !h) return;
    const pr = Math.min(2, devicePixelRatio || 1);
    if (this.boy !== w + 'x' + h + 'x' + pr) { this.boy = w + 'x' + h + 'x' + pr; this.cizici.setPixelRatio(pr); this.cizici.setSize(w, h, false); this.kamera.aspect = w / h; this.kamera.updateProjectionMatrix(); }
    this.zaman += dt;
    /* İmleci izleme: önizlemenin kafa hizasına göre yatay / dikey sapma */
    const r = this.kap.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * 0.24;
    const hx = Math.atan((this.fare[0] - cx) / 120), hy = Math.atan((this.fare[1] - cy) / 120);
    this.donus += (this.donusHedef - this.donus) * Math.min(1, dt * 10);
    const yum = k => Math.min(1, dt * k);
    this.kok.rotation.y += (this.donus + hx * 0.32 - this.kok.rotation.y) * yum(8);
    this.kafa.rotation.y += (hx * 0.62 - this.kafa.rotation.y) * yum(10);
    this.kafa.rotation.x += (-hy * 0.5 - this.kafa.rotation.x) * yum(10);
    /* Boşta nefes alma ve kol salınımı */
    const n = Math.sin(this.zaman * 1.6);
    this.kollar[0].rotation.z = -0.06 - n * 0.025; this.kollar[1].rotation.z = 0.06 + n * 0.025;
    this.kollar[1].rotation.x = this.el.visible ? 0.32 : 0;
    this.govde.scale.set(1 + n * 0.008, 1, 1 + n * 0.012);
    /* Büyülü zırh parıltısı */
    const p = 0.5 + 0.5 * Math.sin(this.zaman * 3);
    for (const m of this.zirhMesh) if (m.material.userData.parilti) m.material.color.setRGB(1 + p * 0.35, 0.9 + p * 0.1, 1 + p * 0.6);
    this.cizici.render(this.sahne, this.kamera);
  }
}
