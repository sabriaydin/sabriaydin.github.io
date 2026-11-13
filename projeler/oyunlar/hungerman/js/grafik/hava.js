/* HungerMan - hava durumu: açık, yağmurlu, fırtınalı
   Yağmur ve kar parçacıkları kameranın çevresinde, her sütunun en üst bloğuna kadar düşer (çatı altına yağmaz).
   Soğuk yerlerde (karlı biyomlar, soğuk iklimdeki yüksek dağlar) kar, diğer her yerde yağmur yağar. Fırtınada şimşek çakar ve gök gürler.
   Durum tek oyunculuda ve sunucuda yürütülür; çok oyunculu istemciye anlık durum ile gelir. */
import { THREE } from './sahne.js';
import { BY, KARLI, karliZirve } from '../dunya/uretici.js';
import { KATI, SIVI } from '../bloklar.js';
import { PY } from '../sabitler.js';

export const HAVA = ['acik', 'yagmur', 'firtina'];
export const HAVA_ADI = { acik: 'Açık', yagmur: 'Yağmurlu', firtina: 'Fırtınalı' };
/* Sütunun yağış türü: 2 kar, 1 yağmur */
const karMi = k => KARLI.has(k.b) || k.te < -0.27 || (k.b === BY.DAG && karliZirve(k));
const YAGMUR_N = 2800, KAR_N = 1500, R = 30;
/* Durum süreleri (saniye) */
const SURE = { acik: [420, 1100], yagmur: [150, 420], firtina: [110, 280] };
const rastSure = d => SURE[d][0] + Math.random() * (SURE[d][1] - SURE[d][0]);

export class Hava {
  constructor(sahne, dunya) {
    this.sahne = sahne; this.dunya = dunya;
    this.durum = 'acik'; this.sure = rastSure('acik') * 0.6;
    this.yogunluk = 0; this.firtinaK = 0; this.simsekParla = 0; this.simsekSayac = 8;
    this.kolonlar = new Map(); this.kolonZaman = 0;
    this.grup = new THREE.Group(); this.grup.frustumCulled = false;
    sahne.sahne.add(this.grup);
    /* Yağmur çizgileri */
    this.yP = new Float32Array(YAGMUR_N * 6);
    this.yD = Array.from({ length: YAGMUR_N }, () => ({ x: 0, y: -999, z: 0, v: 0, alt: 0 }));
    const yg = new THREE.BufferGeometry(); yg.setAttribute('position', new THREE.BufferAttribute(this.yP, 3));
    this.yagmurMalzeme = new THREE.LineBasicMaterial({ color: 0xaab8cc, transparent: true, opacity: 0.5, depthWrite: false });
    this.yagmurCizgi = new THREE.LineSegments(yg, this.yagmurMalzeme); this.yagmurCizgi.frustumCulled = false;
    /* Kar taneleri */
    this.kP = new Float32Array(KAR_N * 3);
    this.kD = Array.from({ length: KAR_N }, () => ({ x: 0, y: -999, z: 0, v: 0, alt: 0, f: Math.random() * 6 }));
    const kg = new THREE.BufferGeometry(); kg.setAttribute('position', new THREE.BufferAttribute(this.kP, 3));
    this.karMalzeme = new THREE.PointsMaterial({ color: 0xffffff, size: 0.09, transparent: true, opacity: 0.9, depthWrite: false });
    this.karNokta = new THREE.Points(kg, this.karMalzeme); this.karNokta.frustumCulled = false;
    /* Yıldırım çizgisi */
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(48 * 6), 3));
    this.simsekMalzeme = new THREE.LineBasicMaterial({ color: 0xf2f6ff, transparent: true, opacity: 0, depthWrite: false });
    this.simsekCizgi = new THREE.LineSegments(sg, this.simsekMalzeme); this.simsekCizgi.frustumCulled = false; this.simsekCizgi.visible = false;
    this.grup.add(this.yagmurCizgi, this.karNokta, this.simsekCizgi);
    this.simsekOmur = 0;
    this.olaylar = { simsek: null };   // sunucu: yıldırım düştüğünde (x, y, z)
  }
  get yagiyor() { return this.durum !== 'acik'; }
  get firtina() { return this.durum === 'firtina'; }

  /* Durum değiştir (konsol, uyku, ağ) */
  ayarla(durum, sure) {
    if (!HAVA.includes(durum)) return false;
    this.durum = durum; this.sure = sure > 0 ? sure : rastSure(durum);
    if (durum === 'firtina') this.simsekSayac = 3 + Math.random() * 6;
    return true;
  }
  disaAktar() { return { d: this.durum, s: Math.round(this.sure) }; }
  iceAktar(v) { if (v && HAVA.includes(v.d)) { this.durum = v.d; this.sure = v.s > 0 ? v.s : rastSure(v.d); this.yogunluk = this.durum === 'acik' ? 0 : 1; this.firtinaK = this.firtina ? 1 : 0; } }

  /* Tek oyunculu ve sunucu: süre dolunca hava değişir; fırtınada yıldırım düşer */
  zamanla(dt, merkezler) {
    if (!this.kilit) this.sure -= dt;   // kilit: geliştirici modunda hava kendiliğinden değişmez
    if (this.sure <= 0) {
      if (this.durum === 'acik') this.ayarla(Math.random() < 0.72 ? 'yagmur' : 'firtina');
      else if (this.durum === 'yagmur' && Math.random() < 0.18) this.ayarla('firtina');
      else this.ayarla('acik');
    }
    if (this.firtina && this.yogunluk > 0.6) {
      this.simsekSayac -= dt;
      if (this.simsekSayac <= 0) {
        this.simsekSayac = 7 + Math.random() * 16;
        const m = merkezler[Math.floor(Math.random() * merkezler.length)];
        if (m) {
          const a = Math.random() * Math.PI * 2, r = 12 + Math.random() * 70;
          const x = Math.floor(m.x + Math.cos(a) * r), z = Math.floor(m.z + Math.sin(a) * r);
          if (this.dunya.yuklu(x, z)) {
            const y = this.ustBlok(x, z) + 1;
            if (this.olaylar.simsek) this.olaylar.simsek(x + 0.5, y, z + 0.5);
          }
        }
      }
    }
  }

  /* Sütunun en üst katı ya da sıvı bloğu (önbellekli) */
  ustBlok(x, z) {
    for (let y = PY - 1; y > 0; y--) { const b = this.dunya.blok(x, y, z); if (KATI[b] || SIVI[b]) return y; }
    return 0;
  }
  kolon(x, z) {
    const k = x + ',' + z;
    let c = this.kolonlar.get(k);
    if (!c) {
      const yuklu = this.dunya.yuklu(x, z);
      const k = yuklu ? this.dunya.uretici.kolon(x, z, {}) : null;
      /* 0.18.0: kışın çöl ve savan dışında her yere kar yağar */
      c = { u: yuklu ? this.ustBlok(x, z) : PY, tur: yuklu ? (karMi(k) || (this.kis && k.b !== BY.COL && k.b !== BY.SAVAN) ? 2 : 1) : 0 };
      this.kolonlar.set(k, c);
    }
    return c;
  }

  /* Yıldırım görüntüsü: zikzak çizgi, gök parlaması ve uzaklığa göre gecikmeli gök gürültüsü */
  simsekGoster(x, y, z, dinleyici, ses) {
    const a = this.simsekCizgi.geometry.attributes.position.array;
    let px = x, py = Math.max(y + 60, PY + 20), pz = z, n = 0;
    const adim = (py - y) / 24;
    for (let i = 0; i < 24 && n < 48; i++) {
      const nx = i === 23 ? x : x + (Math.random() - 0.5) * 3.2, ny = py - adim, nz = i === 23 ? z : z + (Math.random() - 0.5) * 3.2;
      a.set([px, py, pz, nx, ny, nz], n * 6); n++;
      if (Math.random() < 0.22 && n < 48) { a.set([nx, ny, nz, nx + (Math.random() - 0.5) * 6, ny - adim * 1.5, nz + (Math.random() - 0.5) * 6], n * 6); n++; }
      px = nx; py = ny; pz = nz;
    }
    this.simsekCizgi.geometry.setDrawRange(0, n * 2);
    this.simsekCizgi.geometry.attributes.position.needsUpdate = true;
    this.simsekOmur = 0.32; this.simsekCizgi.visible = true;
    const d = dinleyici ? Math.hypot(dinleyici.x - x, dinleyici.z - z) : 50;
    this.simsekParla = Math.max(this.simsekParla, d < 160 ? 1 - d / 220 : 0.2);
    if (ses) setTimeout(() => ses.gokGurultusu(Math.max(0.15, 1 - d / 200), d < 30), Math.min(4000, d * 9));
  }

  /* Her karede: yoğunluk geçişi, parçacıklar, parlama */
  guncelle(dt, kamera, suda) {
    const hedef = this.durum === 'acik' ? 0 : 1;
    this.yogunluk += Math.sign(hedef - this.yogunluk) * Math.min(Math.abs(hedef - this.yogunluk), dt / 12);
    const fh = this.firtina ? 1 : 0;
    this.firtinaK += Math.sign(fh - this.firtinaK) * Math.min(Math.abs(fh - this.firtinaK), dt / 10);
    this.simsekParla = Math.max(0, this.simsekParla - dt * 3.2);
    if (this.simsekOmur > 0) {
      this.simsekOmur -= dt;
      this.simsekMalzeme.opacity = this.simsekOmur > 0 ? (Math.sin(this.simsekOmur * 60) > -0.3 ? 1 : 0.3) : 0;
      if (this.simsekOmur <= 0) this.simsekCizgi.visible = false;
    }
    this.kolonZaman -= dt;
    if (this.kolonZaman <= 0 || this.kolonlar.size > 6000) { this.kolonZaman = 2.5; this.kolonlar.clear(); }
    const Y = this.yogunluk;
    const gor = Y > 0.02 && !suda;
    this.yagmurCizgi.visible = gor; this.karNokta.visible = gor;
    if (!gor) return;
    const c = kamera.position;
    const yN = Math.floor(YAGMUR_N * Y), kN = Math.floor(KAR_N * Y);
    const ruzgar = 1.5 + this.firtinaK * 4;
    /* Yağmur */
    const yp = this.yP;
    for (let i = 0; i < YAGMUR_N; i++) {
      const d = this.yD[i];
      if (i >= yN) { if (d.y > -900) { d.y = -999; yp.fill(-999, i * 6, i * 6 + 6); } continue; }
      d.y -= d.v * dt; d.x += ruzgar * 0.25 * dt;
      if (d.y < d.alt || Math.abs(d.x - c.x) > R + 2 || Math.abs(d.z - c.z) > R + 2) this.dogur(d, c, 1, 18 + this.firtinaK * 6);
      const L = 0.55 + this.firtinaK * 0.3;
      yp[i * 6] = d.x; yp[i * 6 + 1] = d.y; yp[i * 6 + 2] = d.z;
      yp[i * 6 + 3] = d.x - ruzgar * 0.02; yp[i * 6 + 4] = d.y + L; yp[i * 6 + 5] = d.z;
    }
    this.yagmurCizgi.geometry.attributes.position.needsUpdate = true;
    /* Kar */
    const kp = this.kP, t = performance.now() / 1000;
    for (let i = 0; i < KAR_N; i++) {
      const d = this.kD[i];
      if (i >= kN) { if (d.y > -900) { d.y = -999; kp[i * 3 + 1] = -999; } continue; }
      d.y -= d.v * dt; d.x += (Math.sin(t * 0.8 + d.f) * 0.5 + ruzgar * 0.15) * dt; d.z += Math.cos(t * 0.6 + d.f) * 0.4 * dt;
      if (d.y < d.alt || Math.abs(d.x - c.x) > R + 2 || Math.abs(d.z - c.z) > R + 2) this.dogur(d, c, 2, 1.6 + Math.random() * 0.8);
      kp[i * 3] = d.x; kp[i * 3 + 1] = d.y; kp[i * 3 + 2] = d.z;
    }
    this.karNokta.geometry.attributes.position.needsUpdate = true;
    this.yagmurMalzeme.opacity = 0.32 + 0.25 * Y;
  }
  /* Parçacığı kameranın çevresinde, kendi türüne (yağmur / kar) uygun bir sütunda yeniden başlat */
  dogur(d, c, tur, hiz) {
    for (let k = 0; k < 4; k++) {
      const x = c.x + (Math.random() * 2 - 1) * R, z = c.z + (Math.random() * 2 - 1) * R;
      const kol = this.kolon(Math.floor(x), Math.floor(z));
      if (kol.tur !== tur) continue;
      const alt = kol.u + 1;
      const tepe = Math.max(c.y + 10 + Math.random() * 8, alt + 0.5);
      if (alt > c.y + 18) continue;
      d.x = x; d.z = z; d.alt = alt; d.v = hiz;
      d.y = d.y < -900 ? alt + Math.random() * (tepe - alt) : tepe;
      return;
    }
    d.y = -999; d.alt = -998;
  }
  /* Kamera açıkta mı (yağmur sesi boğuk mu) */
  acikta(p) { return this.ustBlok(Math.floor(p.x), Math.floor(p.z)) < p.y; }
  /* Kameranın bulunduğu sütunda yağış türü: 0 yok (çöl), 1 yağmur, 2 kar */
  yagisTuru(p) { return this.kolon(Math.floor(p.x), Math.floor(p.z)).tur; }

  temizle() {
    this.sahne.sahne.remove(this.grup);
    for (const m of [this.yagmurCizgi, this.karNokta, this.simsekCizgi]) { m.geometry.dispose(); m.material.dispose(); }
  }
}

