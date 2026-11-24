/* HungerMan - 0.41.4: düşen bloklar (kum, çakıl, kızıl kum)
   Altı boşalan (ya da altı boş yere konan) kum ve çakıl Minecraft'taki gibi aşağı düşer: blok yerinden kalkar, yer çekimiyle düşen bir küp
   olarak çizilir ve ilk katı zeminin üstüne yerleşir. Yolundaki ot, çiçek ve su gibi geçilebilir blokların yerini alır; üstündeki
   kum ve çakıl da sırayla düşer. Yalnızca tek oyunculuda ve sunucuda çalışır; değişiklikler blokKoy ile kaydedilir ve istemcilere yayılır. */
import { THREE } from '../grafik/sahne.js';
import { BLOKLAR, KATI, SIVI, LAV, BITKI, YUZ_DOKU, ATLAS_N } from '../bloklar.js';
import { PY } from '../sabitler.js';

export const DUSER = new Set([5, 6, 3000]);   // kum, çakıl, kızıl kum
const YERCEKIMI = 28, AZAMI_HIZ = 36, BUTCE = 64;

/* Düşen bloğun geçebileceği hücre: boşluk, su ve lav, ot ve çiçek gibi bitkiler */
const gecilir = id => id === 0 || (!KATI[id] && (SIVI[id] || LAV[id] || BITKI[id] || !!(BLOKLAR[id] && BLOKLAR[id].degistirilebilir)));

const GEO = new Map();
function geometri(id) {
  if (GEO.has(id)) return GEO.get(id);
  const g = new THREE.BoxGeometry(1, 1, 1), uv = g.attributes.uv;
  for (let f = 0; f < 6; f++) {
    const t = YUZ_DOKU[id * 6 + f], tx = t % ATLAS_N, ty = (t / ATLAS_N) | 0;
    for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, (tx + uv.getX(i)) / ATLAS_N, 1 - (ty + 1 - uv.getY(i)) / ATLAS_N); }
  }
  GEO.set(id, g);
  return g;
}

export class KumDusmesi {
  constructor(dunya, sahne) {
    this.d = dunya; this.s = sahne;
    this.sira = new Set();
    this.dusenler = [];
    this.grup = new THREE.Group(); sahne.sahne.add(this.grup);
    const at = sahne.atlasDoku.clone(); at.colorSpace = THREE.SRGBColorSpace; at.needsUpdate = true;
    this.malz = new THREE.MeshBasicMaterial({ map: at });
    this.dinle = (x, y, z) => { this.ekle(x, y, z); this.ekle(x, y + 1, z); };
    dunya.dinleyiciler.push(this.dinle);
  }
  kapat() {
    const i = this.d.dinleyiciler.indexOf(this.dinle); if (i >= 0) this.d.dinleyiciler.splice(i, 1);
    for (const b of this.dusenler) this.grup.remove(b.m);
    this.s.sahne.remove(this.grup);
    this.dusenler = []; this.sira.clear();
  }
  ekle(x, y, z) { if (y > 0 && y < PY) this.sira.add(x + ',' + y + ',' + z); }
  /* Düşecek blok: kendisi düşen türdense ve altı geçilebilirse yerinden kalkar ve düşmeye başlar */
  denetle(x, y, z) {
    const d = this.d;
    if (!d.yuklu(x, z)) return;
    const id = d.blok(x, y, z);
    if (!DUSER.has(id) || y <= 1 || !gecilir(d.blok(x, y - 1, z))) return;
    d.blokKoy(x, y, z, 0, 'dusme');
    const m = new THREE.Mesh(geometri(id), this.malz);
    m.position.set(x + 0.5, y + 0.5, z + 0.5);
    this.grup.add(m);
    this.dusenler.push({ x, z, y, vy: 0, id, m });
  }
  guncelle(dt, gunIsigi = 1) {
    /* Sıradaki denetimler (adım başına sınırlı) */
    if (this.sira.size) {
      const l = [];
      for (const k of this.sira) { l.push(k); if (l.length >= BUTCE) break; }
      for (const k of l) this.sira.delete(k);
      for (const k of l) { const [x, y, z] = k.split(',').map(Number); this.denetle(x, y, z); }
    }
    if (!this.dusenler.length) return;
    const p = Math.max(0.35, Math.min(1, gunIsigi));
    this.malz.color.setRGB(p, p, p);
    const d = this.d;
    /* Alttakiler önce işlenir: üst üste düşen bloklar sıralarını korur */
    this.dusenler.sort((p, q) => p.y - q.y);
    const kalan = [];
    for (const b of this.dusenler) {
      b.vy = Math.max(-AZAMI_HIZ, b.vy - YERCEKIMI * dt);
      let ny = b.y + b.vy * dt;
      /* İnilecek hücre: geçilemeyen ilk bloğun üstü */
      let yer = null;
      for (let y = Math.floor(b.y); y >= Math.floor(ny) - 1 && y >= 0; y--) {
        if (y <= 0 || !gecilir(d.blok(b.x, y - 1, b.z))) { yer = Math.max(y, 1); break; }
      }
      if (yer != null && ny <= yer) {
        this.grup.remove(b.m);
        /* Hücre bu arada dolduysa bir üstüne konur */
        let y = yer;
        while (y < PY - 1 && !gecilir(d.blok(b.x, y, b.z))) y++;
        d.blokKoy(b.x, y, b.z, b.id, 'dusme');
        continue;
      }
      b.y = ny;
      b.m.position.y = b.y + 0.5;
      kalan.push(b);
    }
    this.dusenler = kalan;
  }
}
