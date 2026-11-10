/* HungerMan - yere düşen eşyalar ve kırılma parçacıkları */
import { THREE } from '../grafik/sahne.js';
import { simge, blokRengi } from '../grafik/doku.js';
import { KATI } from '../bloklar.js';

const DOKU = new Map();
function doku(id) {
  if (!DOKU.has(id)) { const t = new THREE.CanvasTexture(simge(id).cv); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; DOKU.set(id, t); }
  return DOKU.get(id);
}

export class Dusenler {
  constructor(sahne, dunya) {
    this.sahne = sahne; this.dunya = dunya;
    this.liste = [];
    this.grup = new THREE.Group(); sahne.sahne.add(this.grup);
    /* Parçacıklar */
    this.PMAX = 400;
    this.pk = [];
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.PMAX * 3), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(this.PMAX * 3), 3));
    g.setDrawRange(0, 0);
    this.noktalar = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.09, vertexColors: true, sizeAttenuation: true }));
    this.noktalar.frustumCulled = false;
    sahne.sahne.add(this.noktalar);
  }

  birak(id, adet, x, y, z, vx = 0, vy = 0, vz = 0, dayanim, gecikme = 0.5) {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: doku(id), alphaTest: 0.3 }));
    m.scale.setScalar(0.32);
    const d = { id, adet, dayanim, p: new THREE.Vector3(x, y, z), v: new THREE.Vector3(vx || (Math.random() - 0.5) * 2, vy || 3.2, vz || (Math.random() - 0.5) * 2), yas: 0, gecikme, m, faz: Math.random() * 6 };
    m.position.copy(d.p);
    this.grup.add(m);
    this.liste.push(d);
    return d;
  }
  sil(d) { this.grup.remove(d.m); d.m.material.dispose(); }
  temizle() { for (const d of this.liste) this.sil(d); this.liste = []; this.pk = []; }

  parcacik(id, x, y, z, adet = 14) {
    const c = blokRengi(id);
    for (let i = 0; i < adet && this.pk.length < this.PMAX; i++) {
      const k = 0.75 + Math.random() * 0.45;
      this.pk.push({ p: [x + Math.random() * 0.8 + 0.1, y + Math.random() * 0.8 + 0.1, z + Math.random() * 0.8 + 0.1], v: [(Math.random() - 0.5) * 4, Math.random() * 4, (Math.random() - 0.5) * 4], c: [c[0] * k, c[1] * k, c[2] * k], o: 0.6 + Math.random() * 0.5 });
    }
  }

  /* al: (id, adet, dayanim) => kalan adet */
  guncelle(dt, oyuncuKonum, al, isik) {
    const op = oyuncuKonum;
    for (let i = this.liste.length - 1; i >= 0; i--) {
      const d = this.liste[i];
      d.yas += dt;
      if (d.yas > 300) { this.sil(d); this.liste.splice(i, 1); continue; }
      const dx = op.x - d.p.x, dy = op.y + 0.8 - d.p.y, dz = op.z - d.p.z;
      const mes = Math.hypot(dx, dy, dz);
      if (d.yas > d.gecikme && mes < 2.6) {
        if (mes < 0.9) {
          const kalan = al(d.id, d.adet, d.dayanim);
          if (kalan <= 0) { this.sil(d); this.liste.splice(i, 1); continue; }
          d.adet = kalan;
        } else { d.v.x = dx / mes * 7; d.v.y = dy / mes * 7; d.v.z = dz / mes * 7; d.p.addScaledVector(d.v, dt); d.m.position.copy(d.p); continue; }
      }
      d.v.y -= 20 * dt;
      const nx = d.p.x + d.v.x * dt, ny = d.p.y + d.v.y * dt, nz = d.p.z + d.v.z * dt;
      if (KATI[this.dunya.blok(Math.floor(nx), Math.floor(d.p.y), Math.floor(d.p.z))]) d.v.x *= -0.3; else d.p.x = nx;
      if (KATI[this.dunya.blok(Math.floor(d.p.x), Math.floor(d.p.y), Math.floor(nz))]) d.v.z *= -0.3; else d.p.z = nz;
      if (KATI[this.dunya.blok(Math.floor(d.p.x), Math.floor(ny - 0.12), Math.floor(d.p.z))]) { d.p.y = Math.floor(ny - 0.12) + 1.12; d.v.y = 0; d.v.x *= 0.82; d.v.z *= 0.82; }
      else d.p.y = ny;
      d.m.position.set(d.p.x, d.p.y + Math.sin(d.yas * 2.5 + d.faz) * 0.05 + 0.05, d.p.z);
      d.m.material.color.setScalar(isik);
    }
    /* Aynı türden yakın eşyaları birleştir */
    if (this.liste.length > 1 && Math.random() < 0.1) {
      for (let i = 0; i < this.liste.length; i++) for (let j = i + 1; j < this.liste.length; j++) {
        const a = this.liste[i], b = this.liste[j];
        if (a.id === b.id && a.dayanim == null && b.dayanim == null && a.p.distanceToSquared(b.p) < 0.8 && a.adet + b.adet <= 64) { a.adet += b.adet; this.sil(b); this.liste.splice(j, 1); j--; }
      }
    }
    /* Parçacıklar */
    const pos = this.noktalar.geometry.attributes.position, col = this.noktalar.geometry.attributes.color;
    let n = 0;
    for (let i = this.pk.length - 1; i >= 0; i--) {
      const q = this.pk[i];
      q.o -= dt;
      if (q.o <= 0) { this.pk.splice(i, 1); continue; }
      q.v[1] -= 18 * dt;
      q.p[0] += q.v[0] * dt; q.p[1] += q.v[1] * dt; q.p[2] += q.v[2] * dt;
      if (KATI[this.dunya.blok(Math.floor(q.p[0]), Math.floor(q.p[1]), Math.floor(q.p[2]))]) { q.p[1] = Math.floor(q.p[1]) + 1.01; q.v[0] *= 0.5; q.v[1] = 0; q.v[2] *= 0.5; }
    }
    for (const q of this.pk) { pos.setXYZ(n, q.p[0], q.p[1], q.p[2]); col.setXYZ(n, q.c[0] * isik, q.c[1] * isik, q.c[2] * isik); n++; }
    pos.needsUpdate = true; col.needsUpdate = true;
    this.noktalar.geometry.setDrawRange(0, n);
  }
  disaAktar() { return this.liste.map(d => [d.id, d.adet, d.dayanim ?? null, +d.p.x.toFixed(2), +d.p.y.toFixed(2), +d.p.z.toFixed(2)]); }
  iceAktar(l) { this.temizle(); for (const a of l || []) this.birak(a[0], a[1], a[3], a[4], a[5], 0.001, 0.001, 0.001, a[2] ?? undefined, 0.5); }
}
