/* HungerMan - diğer oyuncuların görünümü: insan modeli, isim etiketi, eldeki eşya, yürüme / vurma / eğilme canlandırması */
import { THREE } from '../grafik/sahne.js';
import { parca, gurultu } from '../varlik/modeller.js';
import { simge } from '../grafik/doku.js';
import { ESYALAR } from '../bloklar.js';

export const RENKLER = ['#c0392b', '#2e86c1', '#27ae60', '#d68910', '#8e44ad', '#16a085', '#d35400', '#c2185b', '#5d6d7e'];

/* Durum bayrakları (oyuncu durum dizisinin 7. öğesi) */
export const B = { EGIL: 1, KOS: 2, OLU: 4, YATAK: 8, VURUS: 16, SUDA: 32, BAS_SUDA: 64, GERME: 128, OTUR: 256, ATLI: 512 };

const DOKU = new Map();
function esyaDoku(id) {
  if (!DOKU.has(id)) { const t = new THREE.CanvasTexture(simge(id).cv); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; DOKU.set(id, t); }
  return DOKU.get(id);
}

function model(renk) {
  const malzeme = new THREE.MeshBasicMaterial({ vertexColors: true, map: gurultu() });
  const kok = new THREE.Group();
  const ten = '#d9a982', sac = '#3b2a1d', pantolon = '#34495e', ayakkabi = '#2a2420';
  const govde = parca(kok, malzeme, [0, 1.12, 0], [[0.5, 0.75, 0.26, renk], [0.52, 0.08, 0.28, '#2c2c2c', 0, -0.33, 0], [0.16, 0.12, 0.02, '#f2f2f2', 0, 0.22, -0.135]]);
  const kafa = parca(kok, malzeme, [0, 1.5, 0], [[0.48, 0.48, 0.48, ten, 0, 0.24, 0], [0.5, 0.12, 0.5, sac, 0, 0.45, 0], [0.5, 0.3, 0.1, sac, 0, 0.3, 0.21],
    [0.08, 0.07, 0.02, '#1e1e24', -0.11, 0.27, -0.245], [0.08, 0.07, 0.02, '#1e1e24', 0.11, 0.27, -0.245], [0.16, 0.03, 0.02, '#8a4a3a', 0, 0.11, -0.245]]);
  const kollar = [-1, 1].map(s => parca(kok, malzeme, [s * 0.37, 1.45, 0], [[0.22, 0.3, 0.24, renk, 0, -0.1, 0], [0.2, 0.46, 0.22, ten, 0, -0.48, 0]]));
  const bacaklar = [-1, 1].map(s => parca(kok, malzeme, [s * 0.125, 0.75, 0], [[0.24, 0.75, 0.24, pantolon, 0, -0.375, 0], [0.25, 0.12, 0.27, ayakkabi, 0, -0.69, -0.01]]));
  return { kok, malzeme, govde, kafa, kollar, bacaklar };
}

function etiket(ad, renk) {
  const cv = document.createElement('canvas');
  const ctx = cv.getContext('2d');
  const font = '600 30px Rubik, Arial, sans-serif';
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(ad).width) + 30;
  cv.width = w; cv.height = 44;
  ctx.font = font;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(0, 0, w, 44, 8) : ctx.rect(0, 0, w, 44); ctx.fill();
  ctx.fillStyle = renk; ctx.fillRect(8, 15, 6, 14);
  ctx.fillStyle = '#ffffff'; ctx.textBaseline = 'middle'; ctx.fillText(ad, 20, 23);
  const t = new THREE.CanvasTexture(cv); t.minFilter = THREE.LinearFilter;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
  s.scale.set(0.3 * w / 44, 0.3, 1);
  s.position.y = 2.3; s.renderOrder = 20;
  return s;
}

export class UzakOyuncular {
  constructor(sahne, dunya) {
    this.sahne = sahne; this.dunya = dunya;
    this.harita = new Map();
    this.grup = new THREE.Group();
    sahne.sahne.add(this.grup);
  }
  ekle(id, ad, renkNo) {
    if (this.harita.has(id)) return this.harita.get(id);
    const renk = RENKLER[renkNo % RENKLER.length];
    const m = model(renk);
    const et = etiket(ad, renk);
    m.kok.add(et);
    const el = new THREE.Sprite(new THREE.SpriteMaterial({ alphaTest: 0.3 }));
    el.scale.setScalar(0.42); el.position.set(0, -0.78, -0.18); el.visible = false;
    m.kollar[1].add(el);
    m.kok.visible = false;
    this.grup.add(m.kok);
    const o = { id, ad, renk, renkNo, m, et, el, elId: 0, p: new THREE.Vector3(), hedef: new THREE.Vector3(), yaw: 0, hedefYaw: 0, pitch: 0, bayrak: 0, tk: -1, ilk: true,
      faz: 0, hiz: 0, vurus: 0, isik: 1, isikHedef: 1, isikSayac: 0, yeni: 0 };
    this.harita.set(id, o);
    return o;
  }
  sil(id) {
    const o = this.harita.get(id);
    if (!o) return;
    this.grup.remove(o.m.kok);
    o.m.kok.traverse(n => { if (n.geometry) n.geometry.dispose(); });
    o.m.malzeme.dispose(); o.et.material.map.dispose(); o.et.material.dispose(); o.el.material.dispose();
    this.harita.delete(id);
  }
  temizle() { for (const id of [...this.harita.keys()]) this.sil(id); this.sahne.sahne.remove(this.grup); }

  /* a: [x, y, z, yaw, pitch, eldeki, bayrak, tekne, at] */
  durum(id, a) {
    const o = this.harita.get(id);
    if (!o) return;
    o.hedef.set(a[0], a[1], a[2]); o.hedefYaw = a[3]; o.pitch = a[4];
    if (o.ilk) { o.p.copy(o.hedef); o.yaw = o.hedefYaw; o.ilk = false; }
    if (a[5] !== o.elId) {
      o.elId = a[5];
      if (o.elId && ESYALAR[o.elId]) { o.el.material.map = esyaDoku(o.elId); o.el.material.needsUpdate = true; o.el.visible = true; }
      else o.el.visible = false;
    }
    if ((a[6] & B.VURUS) && !(o.bayrak & B.VURUS)) o.vurus = 0.01;
    o.bayrak = a[6]; o.tk = a[7] ?? -1;
    o.yeni = 0;
  }

  guncelle(dt, gunIsigi) {
    for (const o of this.harita.values()) {
      const m = o.m, b = o.bayrak;
      o.yeni += dt;
      m.kok.visible = !o.ilk && !(b & B.OLU);
      if (!m.kok.visible) continue;
      const ox = o.p.x, oz = o.p.z;
      if (o.p.distanceToSquared(o.hedef) > 64) o.p.copy(o.hedef); else o.p.lerp(o.hedef, Math.min(1, dt * 12));
      let f = o.hedefYaw - o.yaw; f = Math.atan2(Math.sin(f), Math.cos(f)); o.yaw += f * Math.min(1, dt * 12);
      const yh = Math.hypot(o.p.x - ox, o.p.z - oz) / Math.max(dt, 1e-3);
      o.hiz += (yh - o.hiz) * Math.min(1, dt * 8);
      const atli = !!(b & B.ATLI), binik = o.tk >= 0 || atli || !!(b & B.OTUR), egil = !!(b & B.EGIL);
      /* Yürüme */
      if (!binik) o.faz += o.hiz * dt * 2.6;
      const sal = binik ? 0 : Math.sin(o.faz) * Math.min(0.9, o.hiz * 0.22);
      m.bacaklar[0].rotation.x = binik ? -1.45 : sal; m.bacaklar[1].rotation.x = binik ? -1.45 : -sal;
      m.bacaklar[0].rotation.z = atli ? 0.55 : binik ? 0.12 : 0; m.bacaklar[1].rotation.z = atli ? -0.55 : binik ? -0.12 : 0;
      /* Kollar: vuruş salınımı, yay germe */
      if (o.vurus > 0) { o.vurus += dt * 4; if (o.vurus >= 1) o.vurus = 0; }
      const vur = o.vurus > 0 ? Math.sin(o.vurus * Math.PI) : 0;
      const ger = b & B.GERME;
      m.kollar[0].rotation.x = ger ? 1.45 : -sal * 0.8;
      m.kollar[1].rotation.x = ger ? 1.5 : sal * 0.8 + vur * 1.6 + (o.elId ? 0.25 : 0);
      m.kollar[1].rotation.z = vur * -0.3;
      /* Eğilme */
      m.govde.rotation.x = egil ? 0.45 : 0;
      m.kafa.position.set(0, egil ? 1.38 : 1.5, egil ? -0.18 : 0);
      for (const k of m.kollar) { k.position.y = egil ? 1.34 : 1.45; k.position.z = egil ? -0.16 : 0; }
      m.kafa.rotation.x = Math.max(-1.2, Math.min(1.2, o.pitch));
      m.kok.position.set(o.p.x, o.p.y - (egil ? 0.12 : 0) + (binik ? -0.05 : 0), o.p.z);
      m.kok.rotation.set(0, o.yaw, 0);
      o.et.material.opacity = egil ? 0.45 : 1;
      /* Işık: gökyüzü ve yakındaki meşaleler */
      o.isikSayac -= dt;
      if (o.isikSayac <= 0) {
        o.isikSayac = 0.3;
        const d = this.dunya, x = o.p.x, y = o.p.y + 1.6, z = o.p.z;
        let l = d.ustKati(Math.floor(x), Math.floor(z)) < y ? gunIsigi : 0.1;
        const t = d.yakinMesaleler(x, y, z, 1)[0];
        if (t) { const u = Math.hypot(t[0] - x, t[1] - y, t[2] - z); l = Math.max(l, Math.min(1, 1.1 * (1 - u / ((t[3] || 14) * 0.9)))); }
        o.isikHedef = Math.max(0.1, l);
      }
      o.isik += (o.isikHedef - o.isik) * Math.min(1, dt * 4);
      m.malzeme.color.setScalar(o.isik);
      o.el.material.color.setScalar(o.isik);
    }
  }
}
