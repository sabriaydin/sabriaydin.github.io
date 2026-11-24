/* HungerMan - 0.41.0: ateş böcekleri: gece bataklık, mangrov, orman ve çayırlarda oyuncunun çevresinde süzülen, yanıp sönen ışık noktaları */
import * as THREE from '../../lib/three.module.min.js';

const ADET = 64, YARICAP = 16;
const VS = `attribute float faz; uniform float zaman; uniform float boy; varying float vP;
void main(){ vP = 0.25 + 0.75 * pow(max(0.0, sin(zaman * 1.7 + faz * 6.283)), 3.0);
  vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = boy * (0.6 + vP) / max(1.0, -mv.z); gl_Position = projectionMatrix * mv; }`;
const FS = `uniform float alfa; varying float vP;
void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); if (d > 0.5) discard;
  float k = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(vec3(0.85, 1.0, 0.35) * (0.6 + 0.6 * vP), k * k * alfa * vP); }`;

export class AtesBocekleri {
  constructor(sahne) {
    this.s = sahne;
    const g = new THREE.BufferGeometry();
    this.p = new Float32Array(ADET * 3);
    const faz = new Float32Array(ADET);
    for (let i = 0; i < ADET; i++) faz[i] = Math.random();
    g.setAttribute('position', new THREE.BufferAttribute(this.p, 3));
    g.setAttribute('faz', new THREE.BufferAttribute(faz, 1));
    this.m = new THREE.ShaderMaterial({ uniforms: { zaman: { value: 0 }, boy: { value: 110 }, alfa: { value: 0 } }, vertexShader: VS, fragmentShader: FS,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    this.n = new THREE.Points(g, this.m);
    this.n.frustumCulled = false; this.n.visible = false;
    sahne.sahne.add(this.n);
    this.v = Array.from({ length: ADET }, () => ({ x: 0, y: -999, z: 0, vx: 0, vy: 0, vz: 0, t: 0 }));
    this.hedef = 0; this.alfa = 0;
  }
  /* yogun: 0..1 (gece ve uygun biyomda); zeminY(x, z): yüzey yüksekliği */
  guncelle(dt, P, yogun, zeminY, zamanSn) {
    this.alfa += (yogun - this.alfa) * Math.min(1, dt * 0.5);
    this.n.visible = this.alfa > 0.02;
    if (!this.n.visible) return;
    this.m.uniforms.alfa.value = this.alfa; this.m.uniforms.zaman.value = zamanSn;
    const etkin = Math.round(ADET * Math.min(1, yogun + 0.2));
    for (let i = 0; i < ADET; i++) {
      const b = this.v[i];
      if (i >= etkin) { b.y = -999; this.p[i * 3 + 1] = -999; continue; }
      if (b.y < -100 || Math.hypot(b.x - P.x, b.z - P.z) > YARICAP + 2) {
        const a = Math.random() * Math.PI * 2, r = 3 + Math.random() * YARICAP;
        b.x = P.x + Math.cos(a) * r; b.z = P.z + Math.sin(a) * r;
        b.y = zeminY(Math.floor(b.x), Math.floor(b.z)) + 1.3 + Math.random() * 2.6;
        b.t = 0;
      }
      b.t -= dt;
      if (b.t <= 0) { b.t = 1 + Math.random() * 2; b.vx = (Math.random() - 0.5) * 0.8; b.vz = (Math.random() - 0.5) * 0.8; b.vy = (Math.random() - 0.5) * 0.3; }
      b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
      this.p[i * 3] = b.x; this.p[i * 3 + 1] = b.y; this.p[i * 3 + 2] = b.z;
    }
    this.n.geometry.attributes.position.needsUpdate = true;
  }
}
