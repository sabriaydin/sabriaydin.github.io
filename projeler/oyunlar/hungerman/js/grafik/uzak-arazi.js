/* HungerMan - 0.41.0: uzak arazi (LOD): yüklü parçaların ötesindeki arazi, seyrek ızgaralı ve tek renkli yüzeylerle çizilir.
   Karolar 128 x 128 bloktur; oyuncuya yakın halkada 4, uzakta 8 blokluk ızgara kullanılır. Yüklü parçaların bulunduğu daire içinde
   çizilmez (gölgelendiricide atılır); sis ve ışık blok malzemesiyle aynı değerleri kullanır. Ormanlar yaprak rengiyle ve biraz yüksek görünür. */
import * as THREE from '../../lib/three.module.min.js';
import { blokRengi } from './doku.js';
import { diyarMi } from '../sabitler.js';

const KARO = 128;
const VS = `attribute vec3 color; varying vec3 vRenk; varying float vUzak; varying vec2 vYatay;
void main(){ vRenk = color; vec4 d = modelMatrix * vec4(position, 1.0); vYatay = d.xz - cameraPosition.xz; vec4 mv = viewMatrix * d; vUzak = length(mv.xyz); gl_Position = projectionMatrix * mv; }`;
const FS = `uniform vec3 gokRenk; uniform float gun; uniform float magara; uniform vec3 sisRenk; uniform float sisBas; uniform float sisSon; uniform float icYaricap;
varying vec3 vRenk; varying float vUzak; varying vec2 vYatay;
void main(){ if (length(vYatay) < icYaricap) discard;
  vec3 r = vRenk * gokRenk * max(gun, magara);
  float s = clamp((vUzak - sisBas) / (sisSon - sisBas), 0.0, 1.0);
  gl_FragColor = vec4(mix(r, sisRenk, s), 1.0); }`;

export class UzakArazi {
  constructor(sahne) {
    this.s = sahne;
    const U = sahne.opakMalzeme.uniforms;
    this.m = new THREE.ShaderMaterial({ uniforms: { gokRenk: U.gokRenk, gun: U.gun, magara: U.magara, sisRenk: U.sisRenk, sisBas: U.sisBas, sisSon: U.sisSon, icYaricap: { value: 100 } }, vertexShader: VS, fragmentShader: FS });
    this.grup = new THREE.Group(); this.grup.renderOrder = -1;
    sahne.sahne.add(this.grup);
    this.karolar = new Map(); this.bekleyen = new Set(); this.isci = null; this.anahtar = '';
    this.renkler = new Map();
  }
  baslat(tohum, surum) {
    this.temizle();
    if (this.isci) this.isci.terminate();
    this.isci = new Worker(new URL('../dunya/uzak-isci.js', import.meta.url), { type: 'module' });
    this.isci.onmessage = e => this.geldi(e.data);
    this.isci.postMessage({ tur: 'baslat', tohum, surum });
    this.anahtar = tohum + ':' + surum;
  }
  temizle() {
    for (const k of this.karolar.values()) { this.grup.remove(k); k.geometry.dispose(); }
    this.karolar.clear(); this.bekleyen.clear();
  }
  renk(id) {
    let c = this.renkler.get(id);
    if (!c) { const r = blokRengi(id); c = id === 7 ? [0.22, 0.38, 0.72] : [r[0], r[1], r[2]]; this.renkler.set(id, c); }
    return c;
  }
  /* P: oyuncu; mesafe: çizim yarıçapı (blok, 0 kapalı); ic: yüklü parçaların yarıçapı (blok) */
  guncelle(P, mesafe, ic, gorunur) {
    this.grup.visible = gorunur && mesafe > 0 && !diyarMi(P.x);
    if (!this.grup.visible || !this.isci) return;
    this.m.uniforms.icYaricap.value = Math.max(0, ic - 6);
    const kx = Math.floor(P.x / KARO), kz = Math.floor(P.z / KARO), R = Math.ceil(mesafe / KARO) + 1;
    /* Uzaklaşan karolar silinir */
    for (const [k, mesh] of this.karolar) {
      const [x, z, a] = mesh.userData.k;
      const d = Math.hypot((x + 0.5) * KARO - P.x, (z + 0.5) * KARO - P.z);
      if (d > mesafe + KARO * 1.5 || a !== this.adim(d)) { this.grup.remove(mesh); mesh.geometry.dispose(); this.karolar.delete(k); }
    }
    /* Eksik karolar (yakından uzağa) istenir; aynı anda en fazla 6 istek */
    if (this.bekleyen.size >= 6) return;
    const aday = [];
    for (let dz = -R; dz <= R; dz++) for (let dx = -R; dx <= R; dx++) {
      const x = kx + dx, z = kz + dz, d = Math.hypot((x + 0.5) * KARO - P.x, (z + 0.5) * KARO - P.z);
      if (d > mesafe + KARO * 0.75 || d + KARO * 0.75 < ic) continue;
      const a = this.adim(d), k = x + ',' + z + ',' + a;
      if (this.karolar.has(k) || this.bekleyen.has(k)) continue;
      aday.push([d, x, z, a, k]);
    }
    aday.sort((p, q) => p[0] - q[0]);
    for (const [, x, z, a, k] of aday.slice(0, 6 - this.bekleyen.size)) {
      this.bekleyen.add(k);
      this.isci.postMessage({ tur: 'karo', k, x0: x * KARO, z0: z * KARO, boy: KARO, adim: a });
    }
  }
  adim(d) { return d < 700 ? 4 : 8; }
  geldi(m) {
    if (m.tur !== 'karo' || !this.bekleyen.has(m.k)) return;
    this.bekleyen.delete(m.k);
    const [x, z, a] = m.k.split(',').map(Number), n = m.n;
    const p = new Float32Array(n * n * 3), c = new Float32Array(n * n * 3), idx = [];
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const k = j * n + i, h = m.h[k];
      p[k * 3] = i * a; p[k * 3 + 1] = h; p[k * 3 + 2] = j * a;
      /* Yamaç gölgesi: komşu yüksekliklerden eğim */
      const hx = m.h[j * n + Math.min(n - 1, i + 1)] - m.h[j * n + Math.max(0, i - 1)], hz = m.h[Math.min(n - 1, j + 1) * n + i] - m.h[Math.max(0, j - 1) * n + i];
      const nx = -hx / (2 * a), nz = -hz / (2 * a), l = 1 / Math.sqrt(nx * nx + 1 + nz * nz);
      const isik = m.t[k] === 1 ? 1 : Math.max(0.45, Math.min(1.05, 0.62 + 0.42 * (nx * 0.45 + 0.8 + nz * 0.35) * l));
      const r = this.renk(m.id[k]), kar = m.t[k] === 2 ? 0.78 : 1;
      c[k * 3] = r[0] * isik * kar; c[k * 3 + 1] = r[1] * isik * kar; c[k * 3 + 2] = r[2] * isik * kar;
    }
    for (let j = 0; j < n - 1; j++) for (let i = 0; i < n - 1; i++) { const q = j * n + i; idx.push(q, q + n, q + 1, q + 1, q + n, q + n + 1); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    g.setIndex(idx); g.computeBoundingSphere();
    const mesh = new THREE.Mesh(g, this.m);
    mesh.position.set(x * KARO, 0, z * KARO); mesh.matrixAutoUpdate = false; mesh.updateMatrix();
    mesh.userData.k = [x, z, a];
    this.grup.add(mesh); this.karolar.set(m.k, mesh);
  }
}
