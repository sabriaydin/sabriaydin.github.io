/* HungerMan - oyuncu: birinci şahıs hareket, çarpışma, yüzme, eğilme, düşme */
import { THREE } from '../grafik/sahne.js';
import { SIVI, KATI, LAV } from '../bloklar.js';
import { DUNYA_SINIRI } from '../sabitler.js';

const YARIM = 0.3;
const YER_CEKIMI = 28;

export class Oyuncu {
  constructor(dunya) {
    this.dunya = dunya;
    this.konum = new THREE.Vector3();
    this.hiz = new THREE.Vector3();
    this.yaw = 0; this.pitch = 0;
    this.yerde = false; this.suda = false; this.basSuda = false;
    this.egiliyor = false; this.kosuyor = false;
    this.dusus = 0; this.adimFaz = 0; this.adimSayac = 0;
    this.yuruyenMesafe = 0;
    this.ucus = false; this.hizCarpani = 1;   // geliştirici konsolu: uçma ve hız çarpanı
    this.olaylar = { dustu: null, adim: null, ziplad: null, suyaGirdi: null };
  }
  get boy() { return this.egiliyor ? 1.5 : 1.8; }
  get goz() { return this.egiliyor ? 1.32 : 1.62; }
  gozKonumu(out = new THREE.Vector3()) { return out.set(this.konum.x, this.konum.y + this.goz, this.konum.z); }
  bakisYonu(out = new THREE.Vector3()) {
    const cp = Math.cos(this.pitch);
    return out.set(-Math.sin(this.yaw) * cp, Math.sin(this.pitch), -Math.cos(this.yaw) * cp);
  }

  carpisiyor(x, y, z, boy = this.boy) {
    const x0 = Math.floor(x - YARIM), x1 = Math.floor(x + YARIM - 1e-6);
    const y0 = Math.floor(y), y1 = Math.floor(y + boy - 1e-6);
    const z0 = Math.floor(z - YARIM), z1 = Math.floor(z + YARIM - 1e-6);
    for (let by = y0; by <= y1; by++) for (let bz = z0; bz <= z1; bz++) for (let bx = x0; bx <= x1; bx++) if (this.dunya.kati(bx, by, bz)) return true;
    return false;
  }
  /* Ayak altında destek var mı (eğilirken kenardan düşmemek için) */
  destekVar(x, y, z) {
    const x0 = Math.floor(x - YARIM), x1 = Math.floor(x + YARIM - 1e-6);
    const z0 = Math.floor(z - YARIM), z1 = Math.floor(z + YARIM - 1e-6);
    const by = Math.floor(y - 0.05);
    for (let bz = z0; bz <= z1; bz++) for (let bx = x0; bx <= x1; bx++) if (this.dunya.kati(bx, by, bz)) return true;
    return false;
  }
  /* Oyuncunun kapladığı bir hücrede blok var mı (blok koyarken) */
  hucreyiKapliyor(bx, by, bz) {
    const p = this.konum;
    return bx + 1 > p.x - YARIM && bx < p.x + YARIM && bz + 1 > p.z - YARIM && bz < p.z + YARIM && by + 1 > p.y && by < p.y + this.boy;
  }

  guncelle(dt, g) {
    const d = this.dunya, p = this.konum, v = this.hiz;
    if (!d.yuklu(p.x, p.z)) return;
    const vucut = d.blok(Math.floor(p.x), Math.floor(p.y + 0.4), Math.floor(p.z));
    const bas = d.blok(Math.floor(p.x), Math.floor(p.y + this.goz), Math.floor(p.z));
    const oncekiSu = this.suda;
    this.suda = SIVI[vucut] === 1 || SIVI[d.blok(Math.floor(p.x), Math.floor(p.y + 1.2), Math.floor(p.z))] === 1;
    this.basSuda = SIVI[bas] === 1 && !LAV[bas];
    const ayak = d.blok(Math.floor(p.x), Math.floor(p.y + 0.05), Math.floor(p.z));
    this.lavda = LAV[vucut] === 1 || LAV[ayak] === 1;
    this.basLavda = LAV[bas] === 1;
    if (this.suda && !oncekiSu && v.y < -4 && this.olaylar.suyaGirdi) this.olaylar.suyaGirdi(-v.y);

    /* Eğilme: tavan varsa kalkılmaz */
    const egilIstek = g.egil && !this.ucus;
    if (this.egiliyor && !egilIstek) { if (!this.carpisiyor(p.x, p.y, p.z, 1.8)) this.egiliyor = false; }
    else this.egiliyor = egilIstek;

    const ileri = (g.ileri ? 1 : 0) - (g.geri ? 1 : 0), yan = (g.sag ? 1 : 0) - (g.sol ? 1 : 0);
    this.kosuyor = g.kos && ileri > 0 && !this.egiliyor && g.kosabilir;
    let hizMax = this.egiliyor ? 1.35 : this.kosuyor ? 5.7 : 4.3;
    /* Palet: suda hızlandırır, karada biraz yavaşlatır */
    if (this.suda) hizMax = (this.kosuyor ? 3.2 : 2.3) * (g.palet ? 1.65 : 1);
    else if (g.palet) hizMax *= 0.85;
    if (this.lavda) hizMax = 1.1;
    if (this.ucus) hizMax = (this.kosuyor || g.kos ? 16 : 9);
    hizMax *= this.hizCarpani;
    const sy = Math.sin(this.yaw), cy = Math.cos(this.yaw);
    let ix = -sy * ileri + cy * yan, iz = -cy * ileri - sy * yan;
    const l = Math.hypot(ix, iz); if (l > 0) { ix /= l; iz /= l; }
    const ivme = this.ucus ? 10 : this.yerde ? 14 : this.suda ? (g.palet ? 7 : 5) : 3.2;
    const k = Math.min(1, ivme * dt);
    v.x += (ix * hizMax - v.x) * k;
    v.z += (iz * hizMax - v.z) * k;

    if (this.ucus) {
      /* Uçma: Boşluk yükselir, C alçalır; yer çekimi ve düşme hasarı yoktur */
      const hedefY = ((g.zipla ? 1 : 0) - (g.egil ? 1 : 0)) * 9 * this.hizCarpani;
      v.y += (hedefY - v.y) * Math.min(1, 10 * dt);
      this.dusus = 0;
    } else if (this.suda) {
      v.y -= (this.lavda ? 14 : 9) * dt;
      if (g.zipla) v.y += (g.palet ? 26 : 22) * dt;
      else if (g.palet && g.egil) v.y -= 10 * dt;
      v.y = Math.max(g.palet ? -4.5 : -3.5, Math.min(v.y, g.palet ? 4 : 3.2));
      /* Su yüzeyinde kıyıya tırmanmak için hafif itiş */
      if (g.zipla && (Math.abs(v.x) > 0.5 || Math.abs(v.z) > 0.5) && this.carpisiyor(p.x + ix * 0.4, p.y + 0.3, p.z + iz * 0.4)) v.y = Math.max(v.y, 4.5);
      this.dusus = 0;
    } else {
      v.y -= YER_CEKIMI * dt;
      if (v.y < -60) v.y = -60;
      if (g.zipla && this.yerde) { v.y = 8.6; this.yerde = false; this.olaylar.ziplad && this.olaylar.ziplad(); }
    }

    /* Eksen eksen hareket ve çarpışma (alt adımlar ile) */
    const adim = Math.max(1, Math.ceil(Math.max(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z)) * dt / 0.35));
    const h = dt / adim;
    let yerde = false;
    const oncekiY = p.y;
    for (let s = 0; s < adim; s++) {
      /* Y */
      let ny = p.y + v.y * h;
      if (this.carpisiyor(p.x, ny, p.z)) {
        if (v.y < 0) { ny = Math.floor(ny) + 1; yerde = true; }
        else ny = Math.floor(ny + this.boy) - this.boy - 1e-4;
        if (this.carpisiyor(p.x, ny, p.z)) ny = p.y;
        v.y = 0;
      }
      p.y = ny;
      /* X */
      let nx = p.x + v.x * h;
      if (this.carpisiyor(nx, p.y, p.z) || (this.egiliyor && this.yerde && !this.destekVar(nx, p.y, p.z))) { nx = p.x; v.x = 0; }
      p.x = nx;
      /* Z */
      let nz = p.z + v.z * h;
      if (this.carpisiyor(p.x, p.y, nz) || (this.egiliyor && this.yerde && !this.destekVar(p.x, p.y, nz))) { nz = p.z; v.z = 0; }
      p.z = nz;
    }
    if (!yerde && v.y === 0 && this.carpisiyor(p.x, p.y - 0.02, p.z)) yerde = true;
    /* Düşme hasarı */
    if (!yerde && !this.suda && p.y < oncekiY) this.dusus += oncekiY - p.y;
    if (yerde && !this.yerde) {
      if (this.dusus > 3.4 && this.olaylar.dustu) this.olaylar.dustu(this.dusus);
      this.dusus = 0;
    }
    if (yerde || this.suda) this.dusus = yerde ? 0 : this.dusus;
    this.yerde = yerde;

    /* Dünya sınırı */
    const S = DUNYA_SINIRI - 1;
    p.x = Math.max(-S, Math.min(S, p.x)); p.z = Math.max(-S, Math.min(S, p.z));
    if (p.y < -20) { p.y = 200; v.set(0, 0, 0); }

    /* Adım sesi ve yürüme fazı */
    const yatay = Math.hypot(v.x, v.z) * dt;
    if (this.yerde && yatay > 0) {
      this.adimFaz += yatay * 2.4;
      this.adimSayac += yatay;
      this.yuruyenMesafe += yatay;
      if (this.adimSayac > (this.kosuyor ? 2.2 : 1.8)) { this.adimSayac = 0; this.olaylar.adim && this.olaylar.adim(d.blok(Math.floor(p.x), Math.floor(p.y - 0.1), Math.floor(p.z))); }
    }
    return yatay;
  }

  kameraAyarla(kamera, sallanma) {
    this.gozKonumu(kamera.position);
    if (sallanma && this.yerde) kamera.position.y += Math.abs(Math.sin(this.adimFaz)) * 0.045;
    kamera.rotation.set(this.pitch, this.yaw, 0);
  }
}

export { KATI };
