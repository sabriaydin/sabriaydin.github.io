/* HungerMan - yere düşen eşyalar ve kırılma parçacıkları */
import { THREE, simgeHacmi } from '../grafik/sahne.js';
import { simge, blokRengi } from '../grafik/doku.js';
import { KATI, LAV, ESYALAR, CIZIM, C_KUP, YUZ_DOKU } from '../bloklar.js';

/* 0.23.0: yere düşen eşyalar düz resim (sprite) yerine üç boyutlu çizilir: küp bloklar küçük küp, diğerleri simgesinden kalınlaştırılmış model.
   Eski sürümde doku sRGB işaretlenmediği için renkler soluk görünüyordu; köşe renkleri doğrusal uzaya çevrilerek giderildi. */
const GEO = new Map();
function geometri(id) {
  if (GEO.has(id)) return GEO.get(id);
  let g;
  const e = ESYALAR[id];
  if (e && e.tur === 'blok' && CIZIM[id] === C_KUP) {
    g = new THREE.BoxGeometry(0.24, 0.24, 0.24);
    const uv = g.attributes.uv;
    for (let f = 0; f < 6; f++) {
      const t = YUZ_DOKU[id * 6 + f], tx = t & 15, ty = t >> 4;
      for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, (tx + uv.getX(i)) / 16, 1 - (ty + 1 - uv.getY(i)) / 16); }
    }
    g.userData.blok = true;
  } else g = simgeHacmi(simge(id).cv, 0.34);
  GEO.set(id, g);
  return g;
}

export class Dusenler {
  constructor(sahne, dunya) {
    this.sahne = sahne; this.dunya = dunya;
    this.liste = [];
    this.ag = null;   // çok oyunculu kancaları: sunucuda eklendi/silindi/adet, istemcide birakIste/alIste
    this.sira = 0;
    this.grup = new THREE.Group(); sahne.sahne.add(this.grup);
    const at = sahne.atlasDoku.clone(); at.colorSpace = THREE.SRGBColorSpace; at.needsUpdate = true;
    this.blokMalz = new THREE.MeshBasicMaterial({ map: at, alphaTest: 0.5 });
    this.esyaMalz = new THREE.MeshBasicMaterial({ vertexColors: true });
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

  /* buyu: alet ve zırhların büyüleri (0.14.0) */
  birak(id, adet, x, y, z, vx = 0, vy = 0, vz = 0, dayanim, gecikme = 0.5, buyu) {
    /* Çok oyunculu istemcide eşyayı sunucu bırakır ve herkese bildirir */
    if (this.ag && this.ag.birakIste) { this.ag.birakIste(id, adet, dayanim, x, y, z, vx || (Math.random() - 0.5) * 2, vy || 3.2, vz || (Math.random() - 0.5) * 2, gecikme, buyu); return null; }
    const d = this.olustur(id, adet, x, y, z, vx, vy, vz, dayanim, gecikme, buyu);
    if (this.ag && this.ag.eklendi) { d.ni = ++this.sira; this.ag.eklendi(d); }
    return d;
  }
  olustur(id, adet, x, y, z, vx = 0, vy = 0, vz = 0, dayanim, gecikme = 0.5, buyu) {
    const g = geometri(id), m = new THREE.Mesh(g, g.userData.blok ? this.blokMalz : this.esyaMalz);
    m.rotation.y = Math.random() * Math.PI * 2;
    const d = { id, adet, dayanim, buyu: buyu && Object.keys(buyu).length ? { ...buyu } : undefined, p: new THREE.Vector3(x, y, z), v: new THREE.Vector3(vx || (Math.random() - 0.5) * 2, vy || 3.2, vz || (Math.random() - 0.5) * 2), yas: 0, gecikme, m, faz: Math.random() * 6 };
    m.position.copy(d.p);
    this.grup.add(m);
    this.liste.push(d);
    return d;
  }
  sil(d) { this.grup.remove(d.m); }
  agSil(d) { if (this.ag && this.ag.silindi && d.ni) this.ag.silindi(d); }
  agAdet(d) { if (this.ag && this.ag.adet && d.ni) this.ag.adet(d); }
  /* İstemci: sunucudan gelen eşya; a: [ni, id, adet, dayanım, x, y, z, vx, vy, vz, gecikme, büyü] */
  aynaEkle(a) { const d = this.olustur(a[1], a[2], a[4], a[5], a[6], a[7], a[8], a[9], a[3] ?? undefined, a[10], a[11] || undefined); d.ni = a[0]; return d; }
  aynaSil(ni) { const i = this.liste.findIndex(d => d.ni === ni); if (i >= 0) { this.sil(this.liste[i]); this.liste.splice(i, 1); } }
  aynaAdet(ni, adet) { const d = this.liste.find(d => d.ni === ni); if (d) { d.adet = adet; d.istek = 0; d.m.visible = true; } }
  temizle() { for (const d of this.liste) this.sil(d); this.liste = []; this.pk = []; }

  /* 0.23.0: ateş kıvılcımı ve duman (yükselen, ışıktan bağımsız parlak kıvılcım) */
  atesParcacik(x, y, z, duman) {
    if (this.pk.length >= this.PMAX) return;
    const r = Math.random;
    if (duman) this.pk.push({ p: [x + (r() - 0.5) * 0.3, y, z + (r() - 0.5) * 0.3], v: [(r() - 0.5) * 0.25, 0.8 + r() * 0.5, (r() - 0.5) * 0.25], c: [0.32, 0.31, 0.3], o: 1.6 + r() * 1.2, yukselen: true });
    else this.pk.push({ p: [x + (r() - 0.5) * 0.25, y, z + (r() - 0.5) * 0.25], v: [(r() - 0.5) * 0.6, 1.4 + r() * 1.6, (r() - 0.5) * 0.6], c: [1, 0.55 + r() * 0.35, 0.12], o: 0.5 + r() * 0.6, yukselen: true, parlak: true });
  }
  parcacik(id, x, y, z, adet = 14) { this.renkliParcacik(blokRengi(id), x, y, z, adet, true); }
  renkliParcacik(c, x, y, z, adet = 10, blokIci = false) {
    for (let i = 0; i < adet && this.pk.length < this.PMAX; i++) {
      const k = 0.75 + Math.random() * 0.45;
      const o = blokIci ? [Math.random() * 0.8 + 0.1, Math.random() * 0.8 + 0.1, Math.random() * 0.8 + 0.1] : [0, 0, 0];
      this.pk.push({ p: [x + o[0], y + o[1], z + o[2]], v: blokIci ? [(Math.random() - 0.5) * 4, Math.random() * 4, (Math.random() - 0.5) * 4] : [(Math.random() - 0.5) * 1.5, 1 + Math.random() * 2, (Math.random() - 0.5) * 1.5], c: [c[0] * k, c[1] * k, c[2] * k], o: 0.6 + Math.random() * 0.5, yukselen: !blokIci });
    }
  }

  /* al: (id, adet, dayanim, buyu) => kalan adet */
  guncelle(dt, oyuncuKonum, al, isik, toplamaYok = false) {
    const op = oyuncuKonum;
    this.blokMalz.color.setScalar(isik); this.esyaMalz.color.setScalar(isik);
    /* İstemcide (ayna) eşyaların kaybolmasına ve birleşmesine sunucu karar verir; alma isteği sunucuya gider */
    const ayna = !!(this.ag && this.ag.birakIste), simdi = performance.now();
    for (let i = this.liste.length - 1; i >= 0; i--) {
      const d = this.liste[i];
      d.yas += dt;
      if (!ayna && d.yas > 300) { this.sil(d); this.liste.splice(i, 1); this.agSil(d); continue; }
      if (LAV[this.dunya.blok(Math.floor(d.p.x), Math.floor(d.p.y), Math.floor(d.p.z))]) { this.renkliParcacik([0.3, 0.3, 0.3], d.p.x, d.p.y, d.p.z, 6); if (ayna) { d.m.visible = false; continue; } this.sil(d); this.liste.splice(i, 1); this.agSil(d); continue; }
      const dx = op.x - d.p.x, dy = op.y + 0.8 - d.p.y, dz = op.z - d.p.z;
      const mes = Math.hypot(dx, dy, dz);
      if (d.yas > d.gecikme && mes < 2.6 && !toplamaYok) {   // 0.23.0: ölü oyuncu eşya çekmez
        if (mes < 0.9) {
          if (ayna) {
            if (!(d.istek > simdi - 1500) && this.ag.alIste(d)) d.istek = simdi;
            d.m.visible = !(d.istek > simdi - 1500);
            continue;
          }
          const kalan = al(d.id, d.adet, d.dayanim, d.buyu);
          if (kalan <= 0) { this.sil(d); this.liste.splice(i, 1); this.agSil(d); continue; }
          if (kalan !== d.adet) { d.adet = kalan; this.agAdet(d); }
        } else { d.v.x = dx / mes * 7; d.v.y = dy / mes * 7; d.v.z = dz / mes * 7; d.p.addScaledVector(d.v, dt); d.m.position.copy(d.p); continue; }
      }
      d.v.y -= 20 * dt;
      const nx = d.p.x + d.v.x * dt, ny = d.p.y + d.v.y * dt, nz = d.p.z + d.v.z * dt;
      if (KATI[this.dunya.blok(Math.floor(nx), Math.floor(d.p.y), Math.floor(d.p.z))]) d.v.x *= -0.3; else d.p.x = nx;
      if (KATI[this.dunya.blok(Math.floor(d.p.x), Math.floor(d.p.y), Math.floor(nz))]) d.v.z *= -0.3; else d.p.z = nz;
      if (KATI[this.dunya.blok(Math.floor(d.p.x), Math.floor(ny - 0.12), Math.floor(d.p.z))]) { d.p.y = Math.floor(ny - 0.12) + 1.12; d.v.y = 0; d.v.x *= 0.82; d.v.z *= 0.82; }
      else d.p.y = ny;
      d.m.position.set(d.p.x, d.p.y + Math.sin(d.yas * 2.5 + d.faz) * 0.05 + 0.08, d.p.z);
      d.m.rotation.y += dt * 1.4;
    }
    /* Aynı türden yakın eşyaları birleştir */
    if (!ayna && this.liste.length > 1 && Math.random() < 0.1) {
      for (let i = 0; i < this.liste.length; i++) for (let j = i + 1; j < this.liste.length; j++) {
        const a = this.liste[i], b = this.liste[j];
        if (a.id === b.id && a.dayanim == null && b.dayanim == null && a.p.distanceToSquared(b.p) < 0.8 && a.adet + b.adet <= 64) { a.adet += b.adet; this.sil(b); this.liste.splice(j, 1); j--; this.agAdet(a); this.agSil(b); }
      }
    }
    /* Parçacıklar */
    const pos = this.noktalar.geometry.attributes.position, col = this.noktalar.geometry.attributes.color;
    let n = 0;
    for (let i = this.pk.length - 1; i >= 0; i--) {
      const q = this.pk[i];
      q.o -= dt;
      if (q.o <= 0) { this.pk.splice(i, 1); continue; }
      q.v[1] -= (q.yukselen ? 2 : 18) * dt;
      q.p[0] += q.v[0] * dt; q.p[1] += q.v[1] * dt; q.p[2] += q.v[2] * dt;
      if (KATI[this.dunya.blok(Math.floor(q.p[0]), Math.floor(q.p[1]), Math.floor(q.p[2]))]) { q.p[1] = Math.floor(q.p[1]) + 1.01; q.v[0] *= 0.5; q.v[1] = 0; q.v[2] *= 0.5; }
    }
    for (const q of this.pk) { const l = q.parlak ? 1 : isik; pos.setXYZ(n, q.p[0], q.p[1], q.p[2]); col.setXYZ(n, q.c[0] * l, q.c[1] * l, q.c[2] * l); n++; }
    pos.needsUpdate = true; col.needsUpdate = true;
    this.noktalar.geometry.setDrawRange(0, n);
  }
  disaAktar() { return this.liste.map(d => { const a = [d.id, d.adet, d.dayanim ?? null, +d.p.x.toFixed(2), +d.p.y.toFixed(2), +d.p.z.toFixed(2)]; if (d.buyu) a.push(d.buyu); return a; }); }
  iceAktar(l) { this.temizle(); for (const a of l || []) this.birak(a[0], a[1], a[3], a[4], a[5], 0.001, 0.001, 0.001, a[2] ?? undefined, 0.5, a[6]); }
}
