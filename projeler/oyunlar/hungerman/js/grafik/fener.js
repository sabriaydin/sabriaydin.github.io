/* HungerMan - deniz fenerlerinin dönen ışık huzmesi: geceleri kıyıdan uzaklara görünür */
import { THREE } from './sahne.js';

export class FenerIsiklari {
  constructor(sahne) {
    this.sahne = sahne;
    this.liste = new Map();   // köy id -> grup
    this.malzeme = new THREE.MeshBasicMaterial({ color: 0xfff0b8, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    /* Ucu fenerde olan, birbirini dik kesen iki ince yelpaze; uzaklaştıkça genişler ve sönükleşir
       (toplamalı karışımda koyu renk saydam görünür) */
    const L = 46, W = 2.6, N = 14;
    const konum = [], renk = [], indeks = [];
    for (const dik of [false, true]) {
      const o = konum.length / 3;
      for (let i = 0; i <= N; i++) {
        const f = i / N, x = f * L, w = W * (0.08 + 0.92 * f), k = Math.pow(1 - f, 1.7);
        for (const s of [-1, 1]) { konum.push(x, dik ? 0 : s * w, dik ? s * w : 0); renk.push(k, k, k); }
      }
      for (let i = 0; i < N; i++) { const a = o + i * 2; indeks.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(konum, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(renk, 3));
    g.setIndex(indeks);
    this.geo = g;
    this.cekirdekMalzeme = new THREE.MeshBasicMaterial({ color: 0xfff6d0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    this.cekirdekGeo = new THREE.SphereGeometry(0.7, 10, 8);
  }
  /* koylar: yakındaki köyler; gun: gün ışığı (0..1) */
  guncelle(dt, koylar, gun) {
    const gece = Math.max(0, Math.min(1, (0.6 - gun) / 0.3));
    this.malzeme.opacity = 0.5 * gece;
    this.cekirdekMalzeme.opacity = 0.35 + 0.65 * gece;
    const gerekli = new Set();
    for (const k of koylar) {
      const f = k.liman && k.liman.fener;
      if (!f) continue;
      gerekli.add(k.id);
      if (this.liste.has(k.id)) continue;
      const grup = new THREE.Group();
      grup.position.set(f.x + 0.5, f.y + 13.6, f.z + 0.5);
      const a = new THREE.Mesh(this.geo, this.malzeme), b = new THREE.Mesh(this.geo, this.malzeme);
      b.rotation.y = Math.PI;
      const c = new THREE.Mesh(this.cekirdekGeo, this.cekirdekMalzeme);
      grup.add(a, b, c);
      grup.rotation.y = (f.x * 0.37 + f.z * 0.11) % (Math.PI * 2);
      a.frustumCulled = b.frustumCulled = false;
      this.sahne.sahne.add(grup);
      this.liste.set(k.id, grup);
    }
    for (const [id, grup] of this.liste) {
      if (!gerekli.has(id)) { this.sahne.sahne.remove(grup); this.liste.delete(id); continue; }
      grup.rotation.y += dt * 0.55;
      grup.children[0].visible = grup.children[1].visible = gece > 0.02;
    }
  }
  temizle() { for (const g of this.liste.values()) this.sahne.sahne.remove(g); this.liste.clear(); }
}
