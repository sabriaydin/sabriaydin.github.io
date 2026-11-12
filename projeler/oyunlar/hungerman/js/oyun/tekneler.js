/* HungerMan - tekneler: sandal ve yelkenli
   Tekne elde tutulup suya sağ tıklanarak konur; sağ tık ile binilir, C ile inilir, sol tık ile kırılır.
   Sürerken W/S hız, A/D dümen. Tekneler suda yüzer, karaya oturunca güçlükle ilerler. */
import { THREE } from '../grafik/sahne.js';
import { SIVI, LAV, KATI } from '../bloklar.js';
import { parca, gurultu } from '../varlik/modeller.js';

/* gen/boy: yarım genişlik ve yarım uzunluk; oturma: oyuncu ayak yüksekliğinin su çizgisine göre konumu */
export const TEKNE = {
  sandal: { esya: 454, ad: 'Sandal', hiz: 5.4, geri: 2, ivme: 1.7, donus: 1.9, gen: 0.62, boy: 1.25, oturma: -0.55, can: 4 },
  yelkenli: { esya: 455, ad: 'Yelkenli', hiz: 9, geri: 1.6, ivme: 0.8, donus: 1.15, gen: 0.92, boy: 1.9, oturma: -0.45, can: 6 }
};

function sandalModeli() {
  const malzeme = new THREE.MeshBasicMaterial({ vertexColors: true, map: gurultu() });
  const kok = new THREE.Group();
  const a = '#8a6240', k = '#6a4a2e', c = '#5a3c24';
  parca(kok, malzeme, [0, 0, 0], [
    [1.1, 0.1, 2.3, k, 0, -0.18, 0],
    [0.1, 0.5, 2.3, a, -0.58, 0.05, 0], [0.1, 0.5, 2.3, a, 0.58, 0.05, 0],
    [1.26, 0.08, 0.1, c, 0, 0.32, 1.12], [1.06, 0.5, 0.1, a, 0, 0.05, 1.18],
    [0.86, 0.48, 0.1, a, 0, 0.07, -1.18], [0.56, 0.44, 0.1, a, 0, 0.1, -1.28], [0.24, 0.4, 0.1, c, 0, 0.12, -1.36],
    [0.1, 0.04, 2.3, c, -0.58, 0.32, 0], [0.1, 0.04, 2.3, c, 0.58, 0.32, 0],
    [1.06, 0.08, 0.32, c, 0, 0.12, 0.25], [1.06, 0.08, 0.26, c, 0, 0.12, 0.95]
  ]);
  const kurekler = [-1, 1].map(s => {
    const g = parca(kok, malzeme, [s * 0.6, 0.3, 0.1], [[1.5, 0.05, 0.05, '#7a5a3a', s * 0.62, 0, 0], [0.32, 0.03, 0.2, '#6a4a2e', s * 1.28, -0.02, 0]]);
    g.rotation.z = -s * 0.35;
    return g;
  });
  return { kok, malzeme, kurekler, yelken: null };
}

function yelkenliModeli() {
  const malzeme = new THREE.MeshBasicMaterial({ vertexColors: true, map: gurultu() });
  const kok = new THREE.Group();
  const a = '#9a7048', k = '#6e4c30', c = '#4e3420', b = '#ece4d0';
  parca(kok, malzeme, [0, 0, 0], [
    [1.7, 0.12, 3.5, k, 0, -0.2, 0],
    [0.12, 0.62, 3.5, a, -0.88, 0.08, 0], [0.12, 0.62, 3.5, a, 0.88, 0.08, 0],
    [1.88, 0.06, 0.14, c, 0, 0.42, 1.76], [1.64, 0.62, 0.12, a, 0, 0.08, 1.8],
    [1.4, 0.6, 0.12, a, 0, 0.1, -1.8], [1.0, 0.56, 0.12, a, 0, 0.12, -1.94], [0.6, 0.52, 0.12, a, 0, 0.15, -2.06], [0.24, 0.5, 0.12, c, 0, 0.18, -2.16],
    [0.12, 0.05, 3.5, c, -0.88, 0.42, 0], [0.12, 0.05, 3.5, c, 0.88, 0.42, 0],
    [1.64, 0.08, 1.1, c, 0, 0.16, 1.2], [1.64, 0.1, 0.34, c, 0, 0.14, -0.2],
    [0.16, 4.4, 0.16, '#5a3c24', 0, 2.3, -0.5], [0.2, 0.12, 0.3, '#b8382c', 0.12, 4.42, -0.5]
  ]);
  const yelken = parca(kok, malzeme, [0, 0, -0.5], [[0.06, 0.08, 2.0, '#5a3c24', 0, 0.9, 1.0], [0.04, 3.1, 1.9, b, 0, 2.5, 1.0], [0.05, 0.08, 1.95, '#c8beac', 0, 4.05, 0.98]]);
  return { kok, malzeme, kurekler: [], yelken };
}

export class Tekneler {
  constructor(o) {
    Object.assign(this, o); // sahne, dunya, dusenler, ses, varliklar
    this.liste = [];
    this.binilen = null;
    this.grup = new THREE.Group(); this.sahne.sahne.add(this.grup);
    this.zaman = 0; this.sesSayac = 0;
  }

  ekle(tur, x, y, z, yaw = 0) {
    const T = TEKNE[tur];
    const m = tur === 'yelkenli' ? yelkenliModeli() : sandalModeli();
    const t = { tur, T, m, p: new THREE.Vector3(x, y, z), yaw, hiz: 0, vy: 0, can: T.can, sarsinti: 0, faz: Math.random() * 6, kurekFaz: 0, isik: 1, suda: true, yalpa: 0 };
    m.kok.position.copy(t.p); m.kok.rotation.y = yaw;
    this.grup.add(m.kok);
    this.liste.push(t);
    return t;
  }
  sil(t) {
    if (this.binilen === t) this.binilen = null;
    this.grup.remove(t.m.kok);
    t.m.kok.traverse(n => { if (n.geometry) n.geometry.dispose(); });
    t.m.malzeme.dispose();
    this.liste.splice(this.liste.indexOf(t), 1);
  }
  temizle() { while (this.liste.length) this.sil(this.liste[0]); }

  suMu(x, y, z) { const b = this.dunya.blok(Math.floor(x), Math.floor(y), Math.floor(z)); return SIVI[b] === 1 && !LAV[b]; }
  /* Tekne konumunun altındaki/üstündeki su yüzeyi (yoksa null) */
  yuzey(x, y, z) {
    const bx = Math.floor(x), bz = Math.floor(z);
    for (let by = Math.floor(y) + 3; by >= Math.floor(y) - 2; by--) {
      if (this.suMu(bx, by, bz) && !this.suMu(bx, by + 1, bz)) return by + 0.875;
    }
    return null;
  }
  /* Döndürülmüş gövde kenarındaki noktalardan biri katı bloğa giriyor mu */
  carpar(t, x, y, z, yaw = t.yaw) {
    const { gen, boy } = t.T, s = Math.sin(yaw), c = Math.cos(yaw);
    for (const [a, b] of [[-gen, -boy], [gen, -boy], [-gen, boy], [gen, boy], [0, -boy], [0, boy], [-gen, 0], [gen, 0], [-gen, -boy * 0.5], [gen, -boy * 0.5], [-gen, boy * 0.5], [gen, boy * 0.5]]) {
      const wx = x + a * c + b * s, wz = z - a * s + b * c;
      for (const h of [0.08, 0.45]) if (KATI[this.dunya.blok(Math.floor(wx), Math.floor(y + h), Math.floor(wz))]) return true;
    }
    return false;
  }

  /* Elde tekne varken bakılan su yüzeyine tekne koy */
  koy(goz, yon, tur, yaw) {
    for (let d = 0.6; d <= 6; d += 0.1) {
      const x = goz.x + yon.x * d, y = goz.y + yon.y * d, z = goz.z + yon.z * d;
      const b = this.dunya.blok(Math.floor(x), Math.floor(y), Math.floor(z));
      if (KATI[b] || LAV[b]) return null;
      if (this.suMu(x, y, z)) {
        const yz = this.yuzey(x, y, z);
        if (yz === null) return null;
        const t = { T: TEKNE[tur], yaw };
        if (this.carpar(t, x, yz - 0.12, z, yaw)) return null;
        if (this.liste.some(o => Math.hypot(o.p.x - x, o.p.z - z) < 1.6)) return null;
        return this.ekle(tur, x, yz - 0.12, z, yaw);
      }
    }
    return null;
  }

  /* Işın ile bakılan tekne (yerel kutu testi) */
  isin(o, d, maks) {
    let en = null, enT = maks;
    for (const t of this.liste) {
      if (t === this.binilen) continue;
      const s = Math.sin(-t.yaw), c = Math.cos(-t.yaw);
      const ox = o.x - t.p.x, oz = o.z - t.p.z;
      const lo = [ox * c + oz * s, o.y - t.p.y, -ox * s + oz * c];
      const ld = [d.x * c + d.z * s, d.y, -d.x * s + d.z * c];
      const a = [-t.T.gen - 0.05, -0.3, -t.T.boy - 0.1], b = [t.T.gen + 0.05, 0.5, t.T.boy + 0.1];
      let t0 = 0, t1 = enT, ok = true;
      for (let i = 0; i < 3 && ok; i++) {
        if (Math.abs(ld[i]) < 1e-9) { if (lo[i] < a[i] || lo[i] > b[i]) ok = false; continue; }
        let ta = (a[i] - lo[i]) / ld[i], tb = (b[i] - lo[i]) / ld[i];
        if (ta > tb) [ta, tb] = [tb, ta];
        t0 = Math.max(t0, ta); t1 = Math.min(t1, tb);
        if (t0 > t1) ok = false;
      }
      if (ok && t0 < enT) { enT = t0; en = t; }
    }
    return en ? { tekne: en, t: enT } : null;
  }

  vur(t) {
    if (t.sarsinti > 0.15) return;
    t.can--; t.sarsinti = 0.4;
    this.ses.kaz('odun');
    this.dusenler.renkliParcacik([0.5, 0.36, 0.22], t.p.x, t.p.y + 0.3, t.p.z, 6);
    if (t.can <= 0) {
      this.ses.kir('odun');
      this.dusenler.renkliParcacik([0.5, 0.36, 0.22], t.p.x, t.p.y + 0.3, t.p.z, 18);
      this.dusenler.birak(t.T.esya, 1, t.p.x, t.p.y + 0.6, t.p.z, 0, 3, 0);
      this.sil(t);
    }
  }

  bin(t, oyuncu) {
    this.binilen = t;
    oyuncu.hiz.set(0, 0, 0);
    oyuncu.suda = false; oyuncu.basSuda = false; oyuncu.lavda = false; oyuncu.egiliyor = false; oyuncu.dusus = 0;
    this.koltuk(t, oyuncu);
  }
  koltuk(t, oyuncu) {
    const ofs = t.tur === 'yelkenli' ? 1.25 : 0.55;   // kıç tarafında oturulur
    oyuncu.konum.set(t.p.x + Math.sin(t.yaw) * ofs, t.p.y + t.T.oturma, t.p.z + Math.cos(t.yaw) * ofs);
  }
  /* İnince oyuncu yakındaki kara ya da boş bir noktaya bırakılır */
  in(oyuncu) {
    const t = this.binilen;
    if (!t) return;
    this.binilen = null;
    const s = Math.sin(t.yaw), c = Math.cos(t.yaw);
    const yanlar = [[t.T.gen + 0.7, 0], [-t.T.gen - 0.7, 0], [0, -t.T.boy - 0.7], [0, t.T.boy + 0.7], [t.T.gen + 1.6, 0], [-t.T.gen - 1.6, 0]];
    let su = null;
    for (const [a, b] of yanlar) {
      const x = t.p.x + a * c + b * s, z = t.p.z - a * s + b * c;
      for (let y = Math.floor(t.p.y) - 1; y <= Math.floor(t.p.y) + 2; y++) {
        if (KATI[this.dunya.blok(Math.floor(x), y - 1, Math.floor(z))] && !oyuncu.carpisiyor(x, y, z, 1.8)) { oyuncu.konum.set(x, y, z); oyuncu.hiz.set(0, 0, 0); return; }
      }
      if (!su && !oyuncu.carpisiyor(x, t.p.y, z, 1.8)) su = [x, t.p.y, z];
    }
    if (su) oyuncu.konum.set(su[0], su[1], su[2]);
    else oyuncu.konum.set(t.p.x, t.p.y + 0.9, t.p.z);
    oyuncu.hiz.set(0, 0, 0);
  }

  fizik(t, dt, ileri, donus) {
    const p = t.p, T = t.T;
    const yz = this.yuzey(p.x, p.y, p.z);
    t.suda = yz !== null;
    if (t.suda) {
      const hedef = yz - 0.12 + Math.sin(this.zaman * 1.5 + t.faz) * 0.035;
      t.vy += (hedef - p.y) * 30 * dt;
      t.vy *= Math.pow(0.03, dt);
    } else t.vy -= 22 * dt;
    /* Dümen ve hız */
    const etki = t.suda ? 1 : 0.35;
    if (donus) t.yaw += donus * T.donus * dt * etki * (0.45 + Math.min(1, Math.abs(t.hiz) / 2) * 0.55);
    const maks = (ileri > 0 ? T.hiz : T.geri) * (t.suda ? 1 : 0.18);
    if (ileri) t.hiz += (ileri * maks - t.hiz) * Math.min(1, T.ivme * dt);
    else t.hiz *= Math.pow(t.suda ? 0.5 : 0.02, dt);
    t.yalpa += ((donus || 0) * Math.min(1, Math.abs(t.hiz) / T.hiz) * 0.12 - t.yalpa) * Math.min(1, dt * 3);
    const vx = -Math.sin(t.yaw) * t.hiz, vz = -Math.cos(t.yaw) * t.hiz;
    const adim = Math.max(1, Math.ceil(Math.abs(t.hiz) * dt / 0.3));
    for (let i = 0; i < adim; i++) {
      const h = dt / adim;
      const nx = p.x + vx * h;
      if (this.carpar(t, nx, p.y, p.z)) { t.hiz *= 0.5; } else p.x = nx;
      const nz = p.z + vz * h;
      if (this.carpar(t, p.x, p.y, nz)) { t.hiz *= 0.5; } else p.z = nz;
    }
    let ny = p.y + t.vy * dt;
    if (KATI[this.dunya.blok(Math.floor(p.x), Math.floor(ny - 0.22), Math.floor(p.z))] && t.vy < 0) { ny = Math.floor(ny - 0.22) + 1.22; t.vy = 0; }
    p.y = ny;
    if (p.y < -10) p.y = -10;
  }

  guncelle(dt, ctx) {
    this.zaman += dt;
    const op = ctx.oyuncu.konum;
    for (const t of [...this.liste]) {
      const d2 = (t.p.x - op.x) ** 2 + (t.p.z - op.z) ** 2;
      if (d2 > 160 * 160 || !this.dunya.yuklu(t.p.x, t.p.z)) { t.m.kok.visible = false; continue; }
      t.m.kok.visible = true;
      const binili = t === this.binilen;
      const g = ctx.girdi;
      const ileri = binili ? (g.ileri ? 1 : 0) - (g.geri ? 1 : 0) : 0;
      const donus = binili ? (g.sol ? 1 : 0) - (g.sag ? 1 : 0) : 0;
      const eskiYaw = t.yaw;
      this.fizik(t, dt, ileri, donus);
      if (binili) {
        ctx.oyuncu.yaw += t.yaw - eskiYaw;
        this.koltuk(t, ctx.oyuncu);
        /* Kürek ve dalga sesleri */
        this.sesSayac -= dt;
        if (Math.abs(t.hiz) > 0.6 && this.sesSayac <= 0) {
          if (t.tur === 'sandal') { this.ses.kurek(0.7); this.sesSayac = 0.85; }
          else { this.ses.dalga(Math.min(1, Math.abs(t.hiz) / t.T.hiz)); this.sesSayac = 1.1; }
        }
        if (t.suda && Math.abs(t.hiz) > 3 && Math.random() < dt * 8) {
          const s = Math.sin(t.yaw), c = Math.cos(t.yaw), a = (Math.random() < 0.5 ? -1 : 1) * t.T.gen;
          this.dusenler.renkliParcacik([0.8, 0.9, 1], t.p.x + a * c - t.T.boy * s, t.p.y + 0.05, t.p.z - a * s - t.T.boy * c, 2);
        }
      }
      /* Canlandırma */
      t.sarsinti = Math.max(0, t.sarsinti - dt);
      const m = t.m;
      m.kok.position.copy(t.p);
      m.kok.rotation.set(Math.sin(this.zaman * 1.1 + t.faz) * 0.025 + Math.sin(t.sarsinti * 30) * t.sarsinti * 0.15, t.yaw, Math.sin(this.zaman * 0.9 + t.faz * 2) * 0.03 + t.yalpa, 'YXZ');
      if (m.kurekler.length) {
        const hareket = binili && (ileri || donus);
        if (hareket) t.kurekFaz += dt * 6 * (ileri < 0 ? -1 : 1);
        m.kurekler.forEach((k, i) => {
          const s = i ? 1 : -1;
          const f = t.kurekFaz + (donus && !ileri ? (i ? 0 : Math.PI) : 0);
          k.rotation.y = hareket ? Math.sin(f) * 0.55 * -s : -s * 0.15;
          k.rotation.z = -s * (hareket ? 0.3 + Math.cos(f) * 0.18 : 0.35);
        });
      }
      /* Yelken bumbası bir yana açıktır; kıçta oturanın görüşünü kapatmaz */
      if (m.yelken) m.yelken.rotation.y = 0.55 + Math.sin(this.zaman * 0.7 + t.faz) * 0.06 + t.yalpa * 2.5;
      /* Işık */
      t.isikSayac = (t.isikSayac || 0) - dt;
      if (t.isikSayac <= 0) {
        t.isikSayac = 0.3;
        let l = this.dunya.ustKati(Math.floor(t.p.x), Math.floor(t.p.z)) < t.p.y + 0.5 ? ctx.gunIsigi : 0.12;
        if (this.varliklar && this.varliklar.mesaleYakin(t.p.x, t.p.y, t.p.z, 10)) l = Math.max(l, 0.62);
        t.isikHedef = Math.max(0.1, l);
      }
      t.isik += ((t.isikHedef ?? 1) - t.isik) * Math.min(1, dt * 4);
      m.malzeme.color.setScalar(t.isik);
    }
  }

  disaAktar() {
    return { liste: this.liste.map(t => [t.tur, +t.p.x.toFixed(2), +t.p.y.toFixed(2), +t.p.z.toFixed(2), +t.yaw.toFixed(3), t.can]), binili: this.binilen ? this.liste.indexOf(this.binilen) : -1 };
  }
  iceAktar(o) {
    this.temizle();
    if (!o) return -1;
    for (const a of o.liste || []) { const t = this.ekle(a[0], a[1], a[2], a[3], a[4]); if (a[5]) t.can = a[5]; }
    return o.binili ?? -1;
  }
}
