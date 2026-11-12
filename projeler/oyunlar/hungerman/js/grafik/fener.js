/* HungerMan - deniz fenerlerinin dönen ışık huzmesi: geceleri kıyıdan uzaklara görünür */
import { THREE } from './sahne.js';
import { PB, dizin, parcaAnahtar } from '../sabitler.js';

const LAMBA = 61;   // ışık odasının ortasındaki parıltı kristali

export class FenerIsiklari {
  /* dunya: lamba bloğunun yerinde olup olmadığını denetlemek için (fener kırılınca ışık söner) */
  constructor(sahne, dunya) {
    this.sahne = sahne; this.dunya = dunya; this.denetim = 0;
    /* Lamba kırılır ya da yeniden konursa ışık hemen güncellenir */
    this.dinle = (x, y, z, id) => { for (const g of this.liste.values()) { const l = g.userData.lamba; if (l[0] === x && l[1] === y && l[2] === z) g.userData.yanik = id === LAMBA; } };
    if (dunya) dunya.dinleyiciler.push(this.dinle);
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
      grup.userData.lamba = [f.x, f.y + 13, f.z]; grup.userData.yanik = this.lambaVar(f.x, f.y + 13, f.z);
      const a = new THREE.Mesh(this.geo, this.malzeme), b = new THREE.Mesh(this.geo, this.malzeme);
      b.rotation.y = Math.PI;
      const c = new THREE.Mesh(this.cekirdekGeo, this.cekirdekMalzeme);
      grup.add(a, b, c);
      grup.rotation.y = (f.x * 0.37 + f.z * 0.11) % (Math.PI * 2);
      a.frustumCulled = b.frustumCulled = false;
      this.sahne.sahne.add(grup);
      this.liste.set(k.id, grup);
    }
    this.denetim -= dt;
    const denetle = this.denetim <= 0;
    if (denetle) this.denetim = 0.4;
    const kam = this.sahne.kamera.position;
    for (const [id, grup] of this.liste) {
      if (!gerekli.has(id)) { this.sahne.sahne.remove(grup); this.liste.delete(id); continue; }
      if (denetle) grup.userData.yanik = this.lambaVar(...grup.userData.lamba);
      grup.visible = grup.userData.yanik;
      if (!grup.visible) continue;
      grup.rotation.y += dt * 0.55;
      /* Işık odasının içinde huzme ve çekirdek göz kamaştırmasın */
      const yakin = kam.distanceTo(grup.position);
      grup.children[0].visible = grup.children[1].visible = gece > 0.02 && yakin > 2.6;
      grup.children[2].visible = yakin > 1.6;
    }
  }
  /* Lamba bloğu yerinde mi: parça yüklüyse bloğa, değilse kayıtlı değişikliklere bakılır (değişmemişse üretildiği gibidir) */
  lambaVar(x, y, z) {
    const d = this.dunya;
    if (!d) return true;
    if (d.yuklu(x, z)) return d.blok(x, y, z) === LAMBA;
    const cx = Math.floor(x / PB), cz = Math.floor(z / PB), m = d.degisiklikler.get(parcaAnahtar(cx, cz));
    if (!m) return true;
    const v = m.get(dizin(x - cx * PB, y, z - cz * PB));
    return v === undefined || v === LAMBA;
  }
  temizle() {
    for (const g of this.liste.values()) this.sahne.sahne.remove(g);
    this.liste.clear();
    if (this.dunya) { const i = this.dunya.dinleyiciler.indexOf(this.dinle); if (i >= 0) this.dunya.dinleyiciler.splice(i, 1); }
  }
}
