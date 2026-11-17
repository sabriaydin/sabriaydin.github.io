/* HungerMan - envanterde canlı karakter önizlemesi (0.30.0)
   Oyuncu modeli kendi küçük çiziciyle çizilir; giyilen zırhlar (malzeme rengiyle, büyülüyse parıltılı) ve eldeki eşya üzerinde görünür.
   Minecraft'taki gibi kafa ve gövde fare imlecini izler; önizleme sürüklenerek döndürülür, çift tıkla öne döner. Pencere kapalıyken çizim durur. */
import { THREE } from '../grafik/sahne.js';
import { gurultu } from '../varlik/modeller.js';
import { insanModeli, giydir } from '../varlik/giysiler.js';
import { simge } from '../grafik/doku.js';
import { ESYALAR } from '../bloklar.js';

/* 0.33.0: model, kıyafet ve zırh kutuları varlik/giysiler.js içinde (çok oyunculudaki oyuncularla ortak) */
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
    /* Oyuncu modeli (0.33.0: çıplak model, yalnızca don; kıyafetler ve zırhlar üstüne giyilir) */
    const M = this.model = insanModeli(this.renk || '#2e86c1', new THREE.MeshBasicMaterial({ vertexColors: true, map: gurultu() }));
    this.malzeme = M.malzeme;
    const kok = this.kok = M.kok;
    this.govde = M.govde; this.kafa = M.kafa; this.kollar = M.kollar; this.bacaklar = M.bacaklar; this.eklem = M.eklem;
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
    if (this.hazir) { this.sahne.remove(this.kok); this.kok.traverse(n => n.geometry && n.geometry.dispose()); this.hazir = false; this.elImz = -1; }
  }
  /* Giyilen kıyafetler, zırhlar ve eldeki eşya değiştiyse modeli günceller (0.33.0: kiyafet eklendi) */
  giydir(zirh, elde, kiyafet) {
    if (!this.hazir) return;
    giydir(this.model, [...(kiyafet || []), ...zirh]);
    const imz = elde ? elde.id : 0;
    if (imz === this.elImz) return;
    this.elImz = imz;
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
    for (const m of this.model.giysiMesh) if (m.material.userData.parilti) m.material.color.setRGB(1 + p * 0.35, 0.9 + p * 0.1, 1 + p * 0.6);
    this.cizici.render(this.sahne, this.kamera);
  }
}
