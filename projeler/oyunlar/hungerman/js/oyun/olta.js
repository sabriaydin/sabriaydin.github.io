/* HungerMan - olta ile balıkçılık
   Sağ tık oltayı atar; şamandıra suya düşünce bir süre sonra balık vurur. Şamandıra suya daldığında
   tekrar sağ tıklanırsa av çekilir. Erken ya da geç çekilen oltadan bir şey çıkmaz. */
import { THREE } from '../grafik/sahne.js';
import { SIVI, LAV, KATI, ESYALAR, maksDayanim, buyuSeviye } from '../bloklar.js';
import { DENIZ } from '../sabitler.js';

const MENZIL = 30;
const NOKTA = 14;

/* Av tablosu: [id, en az, en çok, ağırlık]; derin denizde balık, batık ve resif yakınında hazine şansı artar */
const BALIK = [[297, 1, 1, 60], [451, 1, 1, 6]];
const CER = [[295, 1, 2, 5], [256, 1, 3, 4], [31, 1, 2, 4], [284, 1, 2, 3], [267, 1, 3, 3]];
const HAZINE = [[299, 1, 1, 4], [288, 2, 5, 4], [286, 1, 1, 1], [453, 1, 1, 1], [456, 1, 1, 1], [457, 1, 1, 1], [290, 1, 1, 0.5]];

function sec(tablo, r) {
  let t = 0; for (const a of tablo) t += a[3];
  let x = r() * t;
  for (const a of tablo) { x -= a[3]; if (x <= 0) return a; }
  return tablo[0];
}

export class Olta {
  constructor(o) {
    Object.assign(this, o); // sahne, dunya, oyuncu, envanter, dusenler, ses, arayuz, olaylar
    this.sam = null;
    this.bekleme = 0;
    /* Şamandıra: kırmızı üst, beyaz alt */
    const g = new THREE.Group();
    const m1 = new THREE.MeshBasicMaterial({ color: 0xd8382c }), m2 = new THREE.MeshBasicMaterial({ color: 0xf2efe8 });
    const ust = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.16), m1); ust.position.y = 0.05;
    const alt = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.16), m2); alt.position.y = -0.05;
    const cubuk = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1, 0.03), m1); cubuk.position.y = 0.15;
    g.add(ust, alt, cubuk); g.visible = false;
    this.malzemeler = [m1, m2];
    this.mesh = g;
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NOKTA * 3), 3));
    this.cizgi = new THREE.Line(lg, new THREE.LineBasicMaterial({ color: 0x2a2a2a }));
    this.cizgi.frustumCulled = false; this.cizgi.visible = false;
    this.sahne.sahne.add(g, this.cizgi);
    this.uc = new THREE.Vector3();
  }
  get aktif() { return !!this.sam; }

  kullan() {
    if (this.bekleme > 0) return false;
    this.bekleme = 0.35;
    if (this.sam) this.cek(); else this.at();
    return true;
  }
  at() {
    const goz = this.oyuncu.gozKonumu(), yon = this.oyuncu.bakisYonu();
    this.sam = { p: goz.clone().addScaledVector(yon, 0.6), v: yon.clone().multiplyScalar(12).add(new THREE.Vector3(0, 2.5, 0)), durum: 'ucus', bekle: 0, isirma: 0, sure: 0, dalma: 0 };
    this.mesh.visible = true; this.cizgi.visible = true;
    this.ses.olta('at');
  }
  kaldir() { this.sam = null; this.mesh.visible = false; this.cizgi.visible = false; }

  /* Bulunulan yere göre balık vurma süresi (sn) */
  bekleSuresi(p) {
    let s = 6 + Math.random() * 16;
    let derin = 0;
    for (let y = Math.floor(p.y); y > 0 && SIVI[this.dunya.blok(Math.floor(p.x), y, Math.floor(p.z))]; y--) derin++;
    if (derin < 2) s *= 1.8;
    if (this.dunya.ustKati(Math.floor(p.x), Math.floor(p.z)) > p.y + 1) s *= 1.5;  // üstü kapalı su
    /* Cazibe büyüsü: bekleme seviye başına %18 kısalır */
    s *= 1 - 0.18 * Math.min(3, buyuSeviye(this.envanter.seciliYuva(), 'cazibe'));
    return s;
  }

  cek() {
    const s = this.sam;
    let yip = 0;
    if (s.durum === 'isirma') {
      const r = Math.random;
      let derin = 0;
      for (let y = Math.floor(s.p.y); y > 0 && SIVI[this.dunya.blok(Math.floor(s.p.x), y, Math.floor(s.p.z))]; y--) derin++;
      const hazine = derin >= 6 ? 0.1 : 0.05, cer = derin >= 6 ? 0.08 : 0.14;
      const q = r();
      const [id, a, b] = sec(q < hazine ? HAZINE : q < hazine + cer ? CER : BALIK, r);
      const n = a + Math.floor(r() * (b - a + 1));
      const op = this.oyuncu.konum, t = 0.7;
      const dx = op.x - s.p.x, dy = op.y + 1.2 - s.p.y, dz = op.z - s.p.z;
      const e = ESYALAR[id];
      const day = e && (e.alet || e.zirh) ? Math.max(1, Math.round(maksDayanim(e) * (0.2 + r() * 0.6))) : undefined;
      this.dusenler.birak(id, n, s.p.x, s.p.y + 0.3, s.p.z, dx / t, dy / t + 10 * t, dz / t, day, 0);
      this.dusenler.renkliParcacik([0.75, 0.88, 1], s.p.x, s.p.y, s.p.z, 14);
      this.ses.olta('yakala');
      this.olaylar && this.olaylar.yakala && this.olaylar.yakala(id, n, q < hazine);
      yip = 1;
    } else {
      this.ses.olta('cek');
      if (s.durum === 'su') yip = 1;
      else if (s.durum === 'yerde') yip = 2;
    }
    this.kaldir();
    if (yip && this.envanter.aletYipran(yip)) { this.ses.aletKirildi(); this.arayuz.bildirim('Oltanız kırıldı.'); }
  }

  guncelle(dt, eldeOlta, isik) {
    this.bekleme -= dt;
    const s = this.sam;
    if (!s) return;
    const d = this.dunya, p = s.p, op = this.oyuncu.konum;
    if (!eldeOlta || p.distanceTo(op) > MENZIL || this.oyuncu.olu) { this.kaldir(); return; }
    s.sure += dt;
    const blok = (x, y, z) => d.blok(Math.floor(x), Math.floor(y), Math.floor(z));
    const su = (x, y, z) => { const b = blok(x, y, z); return SIVI[b] === 1 && !LAV[b]; };
    if (s.durum === 'ucus') {
      s.v.y -= 22 * dt;
      const n = p.clone().addScaledVector(s.v, dt);
      const b = blok(n.x, n.y, n.z);
      if (LAV[b]) { this.dusenler.renkliParcacik([0.3, 0.3, 0.3], n.x, n.y, n.z, 6); this.kaldir(); this.arayuz.bildirim('Olta ipi yandı.'); return; }
      if (KATI[b]) { s.durum = 'yerde'; s.v.set(0, 0, 0); }
      else {
        p.copy(n);
        if (su(p.x, p.y, p.z)) {
          s.durum = 'su'; s.v.set(0, 0, 0); s.bekle = this.bekleSuresi(p);
          this.ses.olta('dusme'); this.dusenler.renkliParcacik([0.7, 0.85, 1], p.x, p.y, p.z, 8);
        }
      }
      if (s.sure > 6) { this.kaldir(); return; }
    } else if (s.durum === 'su' || s.durum === 'isirma') {
      /* Su yüzeyini bul ve yüz */
      let y = Math.floor(p.y);
      while (y < 127 && su(p.x, y + 1, p.z)) y++;
      while (y > 0 && !su(p.x, y, p.z)) y--;
      const yuzey = y + 0.875;
      const t = performance.now() / 1000;
      let hedef = yuzey + 0.02 + Math.sin(t * 2.2) * 0.025;
      if (s.durum === 'isirma') {
        s.isirma -= dt; s.dalma = Math.min(1, s.dalma + dt * 8);
        hedef -= 0.28 * s.dalma;
        if (s.isirma <= 0) { s.durum = 'su'; s.dalma = 0; s.bekle = this.bekleSuresi(p) * 0.7; }
      } else {
        s.bekle -= dt;
        /* Balık yaklaşırken küçük kabarcıklar */
        if (s.bekle < 1.6 && Math.random() < dt * 6) this.dusenler.renkliParcacik([0.8, 0.9, 1], p.x + (Math.random() - 0.5) * 1.2, yuzey, p.z + (Math.random() - 0.5) * 1.2, 1);
        if (s.bekle <= 0) {
          s.durum = 'isirma'; s.isirma = 0.85 + Math.random() * 0.4; s.dalma = 0;
          this.ses.olta('isirma'); this.dusenler.renkliParcacik([0.85, 0.93, 1], p.x, yuzey, p.z, 12);
        }
      }
      p.y += (hedef - p.y) * Math.min(1, dt * 10);
      p.x += s.v.x * dt; p.z += s.v.z * dt; s.v.multiplyScalar(0.9);
    }
    this.mesh.position.copy(p);
    for (const m of this.malzemeler) m.color.setScalar(1);
    this.malzemeler[0].color.setHex(0xd8382c).multiplyScalar(isik);
    this.malzemeler[1].color.setHex(0xf2efe8).multiplyScalar(isik);
    /* Misina: olta ucundan şamandıraya hafif sarkık çizgi */
    const k = this.sahne.kamera;
    this.uc.set(0.34, -0.18, -0.6).applyQuaternion(k.quaternion).add(k.position);
    const pos = this.cizgi.geometry.attributes.position;
    const L = this.uc.distanceTo(p), sark = s.durum === 'ucus' ? 0 : Math.min(1.2, L * 0.06);
    for (let i = 0; i < NOKTA; i++) {
      const f = i / (NOKTA - 1);
      pos.setXYZ(i, this.uc.x + (p.x - this.uc.x) * f, this.uc.y + (p.y + 0.12 - this.uc.y) * f - Math.sin(f * Math.PI) * sark, this.uc.z + (p.z - this.uc.z) * f);
    }
    pos.needsUpdate = true;
    this.cizgi.material.color.setScalar(0.18 * isik);
  }
}

export { DENIZ };
export { BALIK as OLTA_BALIK, CER as OLTA_CER, HAZINE as OLTA_HAZINE };
