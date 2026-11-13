/* HungerMan - dünya yöneticisi
   Parçaları oyuncunun çevresinde yükler / boşaltır, işçilere üretim ve meshleme işi dağıtır,
   blok okuma-yazma ve oyuncu değişikliklerini (kayıt ve ileride ağ eşitlemesi için) tutar. */
import { THREE } from '../grafik/sahne.js';
import { PB, PY, PHACIM, DB, DENIZ, dizin, ddizin, parcaAnahtar, DUNYA_SINIRI, DIYAR_X, DIYAR_SINIR, diyarMi } from '../sabitler.js';
import { Uretici, agacKur, KARLI, karliZirve, BY } from './uretici.js';
import { BLOKLAR, KATI, OPAK, SIVI, BITKI, EKIN_SONRAKI, BLOK_UST } from '../bloklar.js';

/* 0.18.0: mevsime göre ekin ve fidan büyüme hızı (ilkbahar, yaz, sonbahar, kış) */
const MEVSIM_BUYUME = [1.4, 1.15, 0.85, 0.25];
const YAPRAK = new Set([9, 11, 13, 145]);
import { uretec } from '../rastgele.js';

/* Işık kaynağı sayılan bloklar (meşale niteliği taşıyanlar, örümcek yuvası ve lav) */
const KAYNAK = new Uint8Array(BLOK_UST);
for (const b of BLOKLAR) if (b && (b.mesale || b.mekanik || b.id === 58 || b.id === 59)) KAYNAK[b.id] = 1;

const SINIR_ICIN = DUNYA_SINIRI;

export class Dunya {
  constructor(tohum, sahne) {
    this.tohum = tohum >>> 0;
    this.sahne = sahne;
    this.uretici = new Uretici(this.tohum);
    this.parcalar = new Map();
    this.degisiklikler = new Map();   // anahtar -> Map(dizin -> blok)
    this.mesaleler = new Map();       // "x,y,z" -> [x, y, z, güç]
    this.ekinler = new Set();         // büyümekte olan ekinlerin "x,y,z" anahtarları
    this.sandiklar = new Map();       // "x,y,z" -> 27 yuvalık dizi
    this.mekanikler = new Map();      // 0.17.0: mekanik bloklar "x,y,z" -> [x, y, z]
    this.yuvalar = new Map();         // canavar yuvaları "x,y,z" -> { x, y, z, sayac }
    this.gorus = 8;
    this.dinleyiciler = [];
    this.isciler = [];
    this.ofsetler = [];
    this.merkez = [0, 0];
    this.kapat = false;
    /* Çok oyunculu sunucu: diğer oyuncuların çevresindeki parçalar da (çizilmeden) üretilir; canlılar orada da yaşar */
    this.ekMerkezler = [];
    this.EK_R = 5;
    this.ekOfsetler = [];
    for (let z = -this.EK_R; z <= this.EK_R; z++) for (let x = -this.EK_R; x <= this.EK_R; x++) { const d = x * x + z * z; if (d <= (this.EK_R + 0.5) ** 2) this.ekOfsetler.push([x, z, d]); }
    this.ekOfsetler.sort((a, b) => a[2] - b[2]);
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
  /* 0.18.0: Yeraltı Diyarı'nın kendi sınırı vardır */
  sinirDisi(x, z) { return diyarMi(x) ? Math.abs(x - DIYAR_X) > DIYAR_SINIR || Math.abs(z) > DIYAR_SINIR : Math.abs(x) > SINIR_ICIN || Math.abs(z) > SINIR_ICIN; }
  kati(x, y, z) {
    if (this.sinirDisi(x, z)) return true;
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
    /* 0.18.0: mevsimlik kar ve buz kayda geçmez (parça yeniden yüklenince kendiliğinden kalkar) */
    if (kaynak !== 'mevsim') {
      let d = this.degisiklikler.get(k);
      if (!d) { d = new Map(); this.degisiklikler.set(k, d); }
      d.set(i, id);
    }
    const mk = x + ',' + y + ',' + z;
    if (BLOKLAR[id] && BLOKLAR[id].mesale) this.mesaleler.set(mk, [x + 0.5, y + 0.6, z + 0.5, BLOKLAR[id].isik || 14, BLOKLAR[id].soguk ? 1 : 0]);
    else this.mesaleler.delete(mk);
    if (EKIN_SONRAKI[id]) this.ekinler.add(mk); else this.ekinler.delete(mk);
    if (id === 58) this.yuvalar.set(mk, { x, y, z, sayac: 5 }); else this.yuvalar.delete(mk);
    if (BLOKLAR[id] && BLOKLAR[id].mekanik) this.mekanikler.set(mk, [x, y, z]); else this.mekanikler.delete(mk);
    if (eski === 59 || id === 59) this.lavIsikGuncelle(x, y, z);
    this.kirlet(p, true);
    if (lx === 0) this.kirletK(cx - 1, cz); if (lx === PB - 1) this.kirletK(cx + 1, cz);
    if (lz === 0) this.kirletK(cx, cz - 1); if (lz === PB - 1) this.kirletK(cx, cz + 1);
    if (lx === 0 && lz === 0) this.kirletK(cx - 1, cz - 1); if (lx === PB - 1 && lz === 0) this.kirletK(cx + 1, cz - 1);
    if (lx === 0 && lz === PB - 1) this.kirletK(cx - 1, cz + 1); if (lx === PB - 1 && lz === PB - 1) this.kirletK(cx + 1, cz + 1);
    for (const f of this.dinleyiciler) f(x, y, z, id, eski, kaynak);
    return true;
  }
  /* Ağdan gelen blok değişikliği: parça yüklü değilse yalnızca değişiklik listesine işlenir */
  agBlok(x, y, z, id) {
    if (y < 0 || y >= PY) return false;
    const cx = Math.floor(x / PB), cz = Math.floor(z / PB);
    const p = this.parca(cx, cz);
    if (p && p.v) return this.blokKoy(x, y, z, id, 'ag');
    const k = parcaAnahtar(cx, cz);
    let d = this.degisiklikler.get(k);
    if (!d) { d = new Map(); this.degisiklikler.set(k, d); }
    d.set(dizin(x - cx * PB, y, z - cz * PB), id);
    return false;
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
      if (dx * dx + dz * dz > (R + 3) * (R + 3)) {
        /* Başka bir oyuncunun yakınındaysa veri kalır, yalnızca çizim kaldırılır */
        if (this.ekMerkezler.length && this.ekYakin(p.cx, p.cz, this.EK_R + 2)) { if (p.mesh || p.suMesh) { this.meshSil(p); p.kirli = true; } continue; }
        this.meshSil(p); this.parcalar.delete(p.k);
        if (p.kaynaklar) for (const k of p.kaynaklar) { this.mesaleler.delete(k); this.ekinler.delete(k); this.yuvalar.delete(k); this.mekanikler.delete(k); }
      }
    }
    this.isDagit();
  }

  ekYakin(cx, cz, r) {
    for (const [x, z] of this.ekMerkezler) if ((cx - x) ** 2 + (cz - z) ** 2 <= r * r) return true;
    return false;
  }

  isDagit() {
    let bos = this.isciler.filter(i => !i.mesgul);
    if (!bos.length) return;
    const [pcx, pcz] = this.merkez;
    const R = this.gorus;
    /* Önce oyuncunun değiştirdiği (acil) parçalar */
    for (const p of this.parcalar.values()) {
      if (!bos.length) return;
      if (p.acil && p.v && !p.meshleniyor && (p.cx - pcx) ** 2 + (p.cz - pcz) ** 2 <= (R + 3) * (R + 3) && this.komsularHazir(p)) { this.meshIste(bos.pop(), p); }
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
    /* Diğer oyuncuların çevresi: yalnızca blok verisi */
    for (const [mx, mz] of this.ekMerkezler) for (const [ox, oz] of this.ekOfsetler) {
      if (!bos.length) return;
      const cx = mx + ox, cz = mz + oz, k = parcaAnahtar(cx, cz);
      let p = this.parcalar.get(k);
      if (!p) { p = { k, cx, cz, v: null, uretiliyor: false, kirli: true, acil: false, surum: 0, meshleniyor: false, mesh: null, suMesh: null }; this.parcalar.set(k, p); }
      if (!p.v && !p.uretiliyor) { p.uretiliyor = true; const i = bos.pop(); i.mesgul = true; i.w.postMessage({ tur: 'uret', cx, cz }); }
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
    const P = new Uint16Array(DB * DB * PY);
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
        this.kaynakTara(p);
      }
    } else if (m.tur === 'meshle') {
      const p = this.parca(m.cx, m.cz);
      if (p) { p.meshleniyor = false; this.meshKur(p, m.r); }
    }
    this.isDagit();
  }

  /* Parçadaki ışık kaynaklarını ve büyüyen ekinleri kaydet */
  kaynakTara(p) {
    p.kaynaklar = [];
    const v = p.v;
    for (let i = 0; i < v.length; i++) {
      const id = v[i];
      if (!KAYNAK[id] && !EKIN_SONRAKI[id]) continue;
      const lx = i % PB, lz = Math.floor(i / PB) % PB, y = Math.floor(i / (PB * PB));
      /* Lav gölleri: her 4 x 4 alanda yüzeydeki bir blok ışık kaynağı sayılır */
      if (id === 59 && (lx % 4 !== 1 || lz % 4 !== 1 || (y < 127 && v[i + PB * PB] === 59))) continue;
      const x = p.cx * PB + lx, z = p.cz * PB + lz;
      const k = x + ',' + y + ',' + z;
      if (BLOKLAR[id].mekanik) this.mekanikler.set(k, [x, y, z]);
      if (id === 58) this.yuvalar.set(k, { x, y, z, sayac: 5 });
      else if (EKIN_SONRAKI[id]) this.ekinler.add(k);
      else if (BLOKLAR[id].mesale || id === 59) this.mesaleler.set(k, [x + 0.5, y + 0.6, z + 0.5, id === 59 ? 11 : (BLOKLAR[id].isik || 14), BLOKLAR[id].soguk ? 1 : 0]);
      p.kaynaklar.push(k);
    }
  }
  lavIsikGuncelle(x, y, z) {
    const k = x + ',' + y + ',' + z;
    if (this.blok(x, y, z) === 59 && ((x % 4) + 4) % 4 === 1 && ((z % 4) + 4) % 4 === 1) this.mesaleler.set(k, [x + 0.5, y + 0.6, z + 0.5, 11]);
  }

  /* Ekinlerin büyümesi: tarla toprağında 1,5 kat, ıslak tarlada 3 kat hızlı.
     Tarla, 4 blok çevresinde su varsa ya da üstüne yağmur yağıyorsa ıslanır (yagiyor: hava durumu). */
  ekinTik() {
    for (const k of this.ekinler) {
      const r = Math.random();
      if (r > 0.036) continue;
      const [x, y, z] = k.split(',').map(Number);
      const id = this.blok(x, y, z);
      if (!EKIN_SONRAKI[id]) { this.ekinler.delete(k); continue; }
      let alt = this.blok(x, y - 1, z);
      if (alt === 137 && (this.suYakin(x, y - 1, z) || (this.yagiyor && this.ustKati(x, z) <= y))) { this.blokKoy(x, y - 1, z, 138, 'tik'); alt = 138; }
      const k2 = (alt === 138 ? 3 : alt === 137 ? 1.5 : 1) * MEVSIM_BUYUME[this.mevsim || 0];   // 0.18.0: mevsime göre büyüme
      if (r > 0.012 * k2) continue;
      this.blokKoy(x, y, z, EKIN_SONRAKI[id], 'tik');
    }
  }
  suYakin(x, y, z) {
    for (let dy = 0; dy <= 1; dy++) for (let dz = -4; dz <= 4; dz++) for (let dx = -4; dx <= 4; dx++) { const b = this.blok(x + dx, y + dy, z + dz); if (b === 7 || b === 31) return true; }
    return false;
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
        else if (BLOKLAR[id] && BLOKLAR[id].fidan && r() < 0.04 * MEVSIM_BUYUME[this.mevsim || 0]) this.fidanBuyut(p.cx * PB + lx, y, p.cz * PB + lz, BLOKLAR[id].fidan);
      }
    }
  }
  /* 0.18.0: Mevsim tiki (tek oyunculu ve sunucu): kışın açıktaki zemine kar yağar, su yüzeyi donar;
     diğer mevsimlerde karlı olmayan bölgelerde kar erir, buz çözülür; ilkbaharda çimenlerde çiçek açar */
  mevsimTik(px, pz) {
    const m = this.mevsim;
    if (m == null || diyarMi(px)) return;
    const pcx = Math.floor(px / PB), pcz = Math.floor(pz / PB), r = Math.random;
    for (let dz = -4; dz <= 4; dz++) for (let dx = -4; dx <= 4; dx++) {
      const p = this.parca(pcx + dx, pcz + dz);
      if (!p || !p.v) continue;
      for (let n = 0; n < 3; n++) {
        const lx = (r() * PB) | 0, lz = (r() * PB) | 0, x = p.cx * PB + lx, z = p.cz * PB + lz;
        let y = PY - 2;
        while (y > 1 && p.v[dizin(lx, y, lz)] === 0) y--;
        const top = p.v[dizin(lx, y, lz)];
        const kol = this.uretici.kolon(x, z, {});
        const karli = KARLI.has(kol.b) || karliZirve(kol), sicak = kol.b === BY.COL || kol.b === BY.SAVAN;
        if (m === 3) {
          if (sicak || top === 141) continue;
          if (top === 7 && kol.b !== BY.OKYANUS && kol.b !== BY.DERIN && r() < 0.5) this.blokKoy(x, y, z, 22, 'mevsim');
          else if (BITKI[top] && BLOKLAR[top].degistirilebilir && !SIVI[top] && r() < 0.3) this.blokKoy(x, y, z, 141, 'mevsim');
          else if (KATI[top] && (OPAK[top] || YAPRAK.has(top)) && y < PY - 2 && r() < (this.yagiyor ? 0.6 : 0.15)) this.blokKoy(x, y + 1, z, 141, 'mevsim');
        } else if (!karli) {
          if (top === 141 && r() < (m === 0 ? 0.6 : 0.95)) this.blokKoy(x, y, z, 0, 'mevsim');
          else if (top === 22 && p.v[dizin(lx, y - 1, lz)] === 7 && r() < 0.5) this.blokKoy(x, y, z, 7, 'mevsim');
          else if (m === 0 && top === 4 && y < PY - 2 && r() < 0.015) this.blokKoy(x, y + 1, z, r() < 0.5 ? 26 : 27, 'tik');
        }
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
  sandiklariAl() { return [...this.sandiklar].map(([k, y]) => [k, y.map(s => (s ? (s.buyu ? [s.id, s.adet, s.dayanim ?? null, s.buyu] : [s.id, s.adet, s.dayanim ?? null]) : null))]); }
  sandiklariYukle(l) { this.sandiklar.clear(); for (const [k, y] of l || []) this.sandiklar.set(k, y.map(s => (s ? { id: s[0], adet: s[1], ...(s[2] != null ? { dayanim: s[2] } : {}), ...(s[3] && typeof s[3] === 'object' ? { buyu: { ...s[3] } } : {}) } : null))); }

  degisiklikleriAl() {
    const o = [];
    for (const [k, d] of this.degisiklikler) { const a = []; for (const [i, id] of d) a.push(i, id); o.push([k, a]); }
    return o;
  }
  degisiklikleriYukle(liste) {
    this.degisiklikler.clear(); this.mesaleler.clear(); this.ekinler.clear(); this.mekanikler.clear();
    for (const [k, a] of liste || []) {
      const d = new Map();
      const [cx, cz] = k.split(',').map(Number);
      for (let j = 0; j < a.length; j += 2) {
        d.set(a[j], a[j + 1]);

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
