/* HungerMan - dünya yöneticisi
   Parçaları oyuncunun çevresinde yükler / boşaltır, işçilere üretim ve meshleme işi dağıtır,
   blok okuma-yazma ve oyuncu değişikliklerini (kayıt ve ileride ağ eşitlemesi için) tutar. */
import { THREE } from '../grafik/sahne.js';
import { PB, PY, PHACIM, DB, DENIZ, dizin, ddizin, parcaAnahtar, DUNYA_SINIRI } from '../sabitler.js';
import { Uretici, agacKur } from './uretici.js';
import { BLOKLAR, KATI, SIVI, BITKI } from '../bloklar.js';
import { uretec } from '../rastgele.js';

const SINIR_ICIN = DUNYA_SINIRI;

export class Dunya {
  constructor(tohum, sahne) {
    this.tohum = tohum >>> 0;
    this.sahne = sahne;
    this.uretici = new Uretici(this.tohum);
    this.parcalar = new Map();
    this.degisiklikler = new Map();   // anahtar -> Map(dizin -> blok)
    this.mesaleler = new Map();       // "x,y,z" -> [x, y, z]
    this.gorus = 8;
    this.dinleyiciler = [];
    this.isciler = [];
    this.ofsetler = [];
    this.merkez = [0, 0];
    this.kapat = false;
    const n = Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 4) - 1));
    for (let i = 0; i < n; i++) {
      const w = new Worker(new URL('./isci.js', import.meta.url), { type: 'module' });
      const isci = { w, mesgul: false, is: null };
      w.onmessage = e => this.isciMesaj(isci, e.data);
      w.onerror = e => console.error('İşçi hatası', e.message || e);
      w.postMessage({ tur: 'baslat', tohum: this.tohum });
      this.isciler.push(isci);
    }
    this.gorusAyarla(this.gorus);
  }

  yoket() {
    this.kapat = true;
    for (const i of this.isciler) i.w.terminate();
    for (const p of this.parcalar.values()) this.meshSil(p);
    this.parcalar.clear();
  }

  gorusAyarla(r) {
    this.gorus = r;
    const o = [];
    const R = r + 1;
    for (let z = -R; z <= R; z++) for (let x = -R; x <= R; x++) { const d = x * x + z * z; if (d <= (R + 0.5) * (R + 0.5)) o.push([x, z, d]); }
    o.sort((a, b) => a[2] - b[2]);
    this.ofsetler = o;
  }

  /* ---------- Blok erişimi ---------- */
  parca(cx, cz) { return this.parcalar.get(parcaAnahtar(cx, cz)); }
  blok(x, y, z) {
    if (y < 0) return 1;
    if (y >= PY) return 0;
    const cx = Math.floor(x / PB), cz = Math.floor(z / PB);
    const p = this.parcalar.get(parcaAnahtar(cx, cz));
    if (!p || !p.v) return 0;
    return p.v[dizin(x - cx * PB, y, z - cz * PB)];
  }
  yuklu(x, z) { const p = this.parca(Math.floor(x / PB), Math.floor(z / PB)); return !!(p && p.v); }
  kati(x, y, z) {
    if (Math.abs(x) > SINIR_ICIN || Math.abs(z) > SINIR_ICIN) return true;
    return KATI[this.blok(x, y, z)] === 1;
  }

  /* Blok değiştir: tüm oyun içi değişiklikler buradan geçer */
  blokKoy(x, y, z, id, kaynak = 'yerel') {
    if (y < 0 || y >= PY) return false;
    const cx = Math.floor(x / PB), cz = Math.floor(z / PB);
    const p = this.parca(cx, cz);
    if (!p || !p.v) return false;
    const lx = x - cx * PB, lz = z - cz * PB, i = dizin(lx, y, lz);
    const eski = p.v[i];
    if (eski === id) return false;
    p.v[i] = id;
    const k = parcaAnahtar(cx, cz);
    let d = this.degisiklikler.get(k);
    if (!d) { d = new Map(); this.degisiklikler.set(k, d); }
    d.set(i, id);
    const mk = x + ',' + y + ',' + z;
    if (BLOKLAR[id] && BLOKLAR[id].mesale) this.mesaleler.set(mk, [x + 0.5, y + 0.6, z + 0.5]);
    else this.mesaleler.delete(mk);
    this.kirlet(p, true);
    if (lx === 0) this.kirletK(cx - 1, cz); if (lx === PB - 1) this.kirletK(cx + 1, cz);
    if (lz === 0) this.kirletK(cx, cz - 1); if (lz === PB - 1) this.kirletK(cx, cz + 1);
    if (lx === 0 && lz === 0) this.kirletK(cx - 1, cz - 1); if (lx === PB - 1 && lz === 0) this.kirletK(cx + 1, cz - 1);
    if (lx === 0 && lz === PB - 1) this.kirletK(cx - 1, cz + 1); if (lx === PB - 1 && lz === PB - 1) this.kirletK(cx + 1, cz + 1);
    for (const f of this.dinleyiciler) f(x, y, z, id, eski, kaynak);
    return true;
  }
  kirletK(cx, cz) { const p = this.parca(cx, cz); if (p) this.kirlet(p, true); }
  kirlet(p, acil) { p.kirli = true; p.surum++; if (acil) p.acil = true; }

  /* Sütunun en üst katı bloğu (gökyüzü görünürlüğü için) */
  ustKati(x, z) {
    for (let y = PY - 1; y > 0; y--) { const b = this.blok(x, y, z); if (KATI[b]) return y; }
    return 0;
  }

  /* ---------- Planlama ---------- */
  guncelle(px, pz) {
    if (this.kapat) return;
    const pcx = Math.floor(px / PB), pcz = Math.floor(pz / PB);
    this.merkez = [pcx, pcz];
    const R = this.gorus;
    /* Uzaklaşan parçaları boşalt */
    for (const p of this.parcalar.values()) {
      const dx = p.cx - pcx, dz = p.cz - pcz;
      if (dx * dx + dz * dz > (R + 3) * (R + 3)) { this.meshSil(p); this.parcalar.delete(p.k); }
    }
    this.isDagit();
  }

  isDagit() {
    let bos = this.isciler.filter(i => !i.mesgul);
    if (!bos.length) return;
    const [pcx, pcz] = this.merkez;
    const R = this.gorus;
    /* Önce oyuncunun değiştirdiği (acil) parçalar */
    for (const p of this.parcalar.values()) {
      if (!bos.length) return;
      if (p.acil && p.v && !p.meshleniyor && this.komsularHazir(p)) { this.meshIste(bos.pop(), p); }
    }
    for (const [ox, oz, d] of this.ofsetler) {
      if (!bos.length) return;
      const cx = pcx + ox, cz = pcz + oz;
      const k = parcaAnahtar(cx, cz);
      let p = this.parcalar.get(k);
      if (!p) {
        p = { k, cx, cz, v: null, uretiliyor: false, kirli: true, acil: false, surum: 0, meshleniyor: false, mesh: null, suMesh: null };
        this.parcalar.set(k, p);
      }
      if (!p.v) {
        if (!p.uretiliyor) { p.uretiliyor = true; const i = bos.pop(); i.mesgul = true; i.w.postMessage({ tur: 'uret', cx, cz }); }
        continue;
      }
      if (d <= (R + 0.5) * (R + 0.5) && p.kirli && !p.meshleniyor && this.komsularHazir(p)) this.meshIste(bos.pop(), p);
    }
  }

  komsularHazir(p) {
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
      const q = this.parca(p.cx + dx, p.cz + dz);
      if (!q || !q.v) return false;
    }
    return true;
  }

  meshIste(isci, p) {
    const P = new Uint8Array(DB * DB * PY);
    const g = [];
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) g.push(this.parca(p.cx + dx, p.cz + dz).v);
    for (let y = 0; y < PY; y++) for (let z = -1; z <= PB; z++) {
      const kz = z < 0 ? 0 : z >= PB ? 2 : 1, lz = (z + PB) % PB;
      for (let x = -1; x <= PB; x++) {
        const kx = x < 0 ? 0 : x >= PB ? 2 : 1, lx = (x + PB) % PB;
        P[ddizin(x, y, z)] = g[kz * 3 + kx][dizin(lx, y, lz)];
      }
    }
    p.meshleniyor = true; p.kirli = false; p.acil = false;
    isci.mesgul = true;
    isci.w.postMessage({ tur: 'meshle', cx: p.cx, cz: p.cz, surum: p.surum, P }, [P.buffer]);
  }

  isciMesaj(isci, m) {
    isci.mesgul = false;
    if (this.kapat) return;
    if (m.tur === 'hata') { console.error('İşçi:', m.mesaj); }
    else if (m.tur === 'uret') {
      const p = this.parca(m.cx, m.cz);
      if (p && !p.v) {
        const d = this.degisiklikler.get(p.k);
        if (d) for (const [i, id] of d) m.v[i] = id;
        p.v = m.v; p.uretiliyor = false; p.kirli = true;
      }
    } else if (m.tur === 'meshle') {
      const p = this.parca(m.cx, m.cz);
      if (p) { p.meshleniyor = false; this.meshKur(p, m.r); }
    }
    this.isDagit();
  }

  meshKur(p, r) {
    this.meshSil(p);
    const yap = (veri, malzeme, sira) => {
      if (!veri.i.length) return null;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(veri.p, 3));
      g.setAttribute('uv', new THREE.BufferAttribute(veri.u, 2));
      g.setAttribute('isik', new THREE.BufferAttribute(veri.l, 2));
      g.setIndex(new THREE.BufferAttribute(veri.i, 1));
      g.computeBoundingSphere();
      const m = new THREE.Mesh(g, malzeme);
      m.position.set(p.cx * PB, 0, p.cz * PB);
      m.matrixAutoUpdate = false; m.updateMatrix();
      m.renderOrder = sira;
      this.sahne.dunyaGrubu.add(m);
      return m;
    };
    p.mesh = yap(r.opak, this.sahne.opakMalzeme, 0);
    p.suMesh = yap(r.su, this.sahne.suMalzeme, 1);
  }
  meshSil(p) {
    for (const k of ['mesh', 'suMesh']) if (p[k]) { this.sahne.dunyaGrubu.remove(p[k]); p[k].geometry.dispose(); p[k] = null; }
  }

  /* Oyuncunun çevresindeki parçalar hazır mı (yükleme ekranı için 0..1) */
  hazirlikOrani(px, pz, yaricap = 3) {
    const pcx = Math.floor(px / PB), pcz = Math.floor(pz / PB);
    let t = 0, h = 0;
    for (let dz = -yaricap; dz <= yaricap; dz++) for (let dx = -yaricap; dx <= yaricap; dx++) {
      t++;
      const p = this.parca(pcx + dx, pcz + dz);
      if (p && p.v && (p.mesh || p.suMesh || (!p.kirli && !p.meshleniyor))) h++;
    }
    return h / t;
  }

  /* ---------- Rastgele tikler: çalı yeniden dolar, fidanlar büyür ---------- */
  rastgeleTik(px, pz) {
    const pcx = Math.floor(px / PB), pcz = Math.floor(pz / PB);
    const r = Math.random;
    for (let dz = -4; dz <= 4; dz++) for (let dx = -4; dx <= 4; dx++) {
      const p = this.parca(pcx + dx, pcz + dz);
      if (!p || !p.v) continue;
      for (let n = 0; n < 24; n++) {
        const lx = (r() * PB) | 0, lz = (r() * PB) | 0, y = 1 + ((r() * (PY - 2)) | 0);
        const id = p.v[dizin(lx, y, lz)];
        if (id === 29 && r() < 0.06) this.blokKoy(p.cx * PB + lx, y, p.cz * PB + lz, 28, 'tik');
        else if (BLOKLAR[id] && BLOKLAR[id].fidan && r() < 0.04) this.fidanBuyut(p.cx * PB + lx, y, p.cz * PB + lz, BLOKLAR[id].fidan);
      }
    }
  }
  fidanBuyut(x, y, z, tur) {
    for (let k = 1; k < 6; k++) if (this.blok(x, y + k, z) !== 0) return false;
    this.blokKoy(x, y, z, 0, 'tik');
    const set = (X, Y, Z, id, sadeceBos) => { const b = this.blok(X, Y, Z); if (sadeceBos ? b !== 0 && !BITKI[b] : (KATI[b] && !BLOKLAR[b].kesik)) return; this.blokKoy(X, Y, Z, id, 'tik'); };
    agacKur(set, x, y, z, tur, uretec((Math.random() * 1e9) | 0));
    return true;
  }

  /* ---------- Kayıt ---------- */
  degisiklikleriAl() {
    const o = [];
    for (const [k, d] of this.degisiklikler) { const a = []; for (const [i, id] of d) a.push(i, id); o.push([k, a]); }
    return o;
  }
  degisiklikleriYukle(liste) {
    this.degisiklikler.clear(); this.mesaleler.clear();
    for (const [k, a] of liste || []) {
      const d = new Map();
      const [cx, cz] = k.split(',').map(Number);
      for (let j = 0; j < a.length; j += 2) {
        d.set(a[j], a[j + 1]);
        if (BLOKLAR[a[j + 1]] && BLOKLAR[a[j + 1]].mesale) {
          const i = a[j], x = i % PB, z = Math.floor(i / PB) % PB, y = Math.floor(i / (PB * PB));
          const wx = cx * PB + x, wz = cz * PB + z;
          this.mesaleler.set(wx + ',' + y + ',' + wz, [wx + 0.5, y + 0.6, wz + 0.5]);
        }
      }
      this.degisiklikler.set(k, d);
    }
  }

  /* Yakındaki meşaleler (ışık için) */
  yakinMesaleler(x, y, z, adet) {
    const l = [];
    for (const m of this.mesaleler.values()) { const d = (m[0] - x) ** 2 + (m[1] - y) ** 2 + (m[2] - z) ** 2; if (d < 48 * 48) l.push([m, d]); }
    l.sort((a, b) => a[1] - b[1]);
    return l.slice(0, adet).map(a => a[0]);
  }
}

export { DENIZ, SIVI };
