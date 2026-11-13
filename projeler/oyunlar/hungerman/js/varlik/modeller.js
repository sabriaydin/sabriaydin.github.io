/* HungerMan - hayvan ve zombi modelleri: kodla kurulan bloksu modeller (dış model dosyası yoktur)
   Modeller -z yönüne bakar; kök noktası ayak tabanının ortasıdır. */
import { THREE } from '../grafik/sahne.js';
import { uretec } from '../rastgele.js';
import { MESLEKLER } from '../koy/meslekler.js';

/* Piksel dokusu hissi veren küçük gürültü dokusu */
let GURULTU = null;
export function gurultu() {
  if (GURULTU) return GURULTU;
  const cv = document.createElement('canvas'); cv.width = cv.height = 16;
  const ctx = cv.getContext('2d'); const r = uretec(31337);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const v = Math.round(215 + r() * 40); ctx.fillStyle = `rgb(${v},${v},${v})`; ctx.fillRect(x, y, 1, 1); }
  const t = new THREE.CanvasTexture(cv); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return (GURULTU = t);
}

/* Renkli kutu geometrisi: yüz gölgelemesi köşe renklerine işlenir, doku kutu boyutuna göre tekrarlanır */
const GOLGE = [0.8, 0.8, 1, 0.55, 0.9, 0.7];
export function kutuGeo(w, h, d, renk, ox = 0, oy = 0, oz = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(ox, oy, oz);
  const c = new THREE.Color(renk);
  const n = g.attributes.position.count;
  const col = new Float32Array(n * 3);
  const uv = g.attributes.uv;
  const boy = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let i = 0; i < n; i++) {
    const f = Math.floor(i / 4), k = GOLGE[f];
    col[i * 3] = c.r * k; col[i * 3 + 1] = c.g * k; col[i * 3 + 2] = c.b * k;
    uv.setXY(i, uv.getX(i) * boy[f][0] * 1.5, uv.getY(i) * boy[f][1] * 1.5);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

/* Bir parçayı (eklem noktasında döndürülebilen grup) birden çok kutudan kurar */
export function parca(kok, malzeme, pivot, kutular) {
  const geo = kutular.map(k => kutuGeo(...k));
  const birlesik = birlestir(geo);
  const m = new THREE.Mesh(birlesik, malzeme);
  const grup = new THREE.Group();
  grup.position.set(...pivot);
  grup.add(m);
  kok.add(grup);
  return grup;
}
export function birlestir(geolar) {
  if (geolar.length === 1) return geolar[0];
  let toplam = 0, itoplam = 0;
  for (const g of geolar) { toplam += g.attributes.position.count; itoplam += g.index.count; }
  const p = new Float32Array(toplam * 3), c = new Float32Array(toplam * 3), u = new Float32Array(toplam * 2), idx = new Uint16Array(itoplam);
  let o = 0, io = 0;
  for (const g of geolar) {
    p.set(g.attributes.position.array, o * 3); c.set(g.attributes.color.array, o * 3); u.set(g.attributes.uv.array, o * 2);
    const ia = g.index.array; for (let i = 0; i < ia.length; i++) idx[io + i] = ia[i] + o;
    o += g.attributes.position.count; io += ia.length; g.dispose();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.setAttribute('uv', new THREE.BufferAttribute(u, 2));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  return g;
}

/* Dört ayaklı hayvan kalıbı */
function dortAyak(o) {
  const malzeme = new THREE.MeshBasicMaterial({ vertexColors: true, map: gurultu() });
  const kok = new THREE.Group();
  const [gw, gh, gd] = o.govde, gy = o.govdeY;
  const govde = parca(kok, malzeme, [0, gy, 0], [[gw, gh, gd, o.renk], ...(o.govdeEk || [])]);
  const [kw, kh, kd] = o.kafa;
  const kafa = parca(kok, malzeme, [0, o.kafaY, -gd / 2 - o.kafaIleri], [[kw, kh, kd, o.kafaRenk || o.renk, 0, 0, -kd / 2], ...(o.kafaEk || [])]);
  const [bw, bh] = o.bacak;
  const bx = gw / 2 - bw / 2 - (o.bacakIc || 0), bz = gd / 2 - bw / 2 - (o.bacakUcIc || 0);
  const bacaklar = [[-bx, -bz], [bx, -bz], [-bx, bz], [bx, bz]].map(([x, z]) => parca(kok, malzeme, [x, bh, z], [[bw, bh, bw, o.bacakRenk || o.renk, 0, -bh / 2, 0], ...(o.toynak ? [[bw + 0.01, 0.08, bw + 0.01, o.toynak, 0, -bh + 0.04, 0]] : [])]));
  let kuyruk = null;
  if (o.kuyruk) kuyruk = parca(kok, malzeme, [0, gy + gh * 0.25, gd / 2], [[...o.kuyruk, o.kuyrukRenk || o.renk, 0, -o.kuyruk[1] / 2 + 0.05, o.kuyruk[2] / 2]]);
  return { kok, malzeme, govde, kafa, bacaklar, kuyruk, kollar: [], kanatlar: [] };
}

/* Balık kalıbı: s ölçek, renk sırt, karin alt renk */
function balik(s, renk, karin, ek = []) {
  const malzeme = new THREE.MeshBasicMaterial({ vertexColors: true, map: gurultu() });
  const kok = new THREE.Group();
  const govde = parca(kok, malzeme, [0, 0.22 * s, 0], [[0.22 * s, 0.34 * s, 0.7 * s, renk], [0.2 * s, 0.12 * s, 0.6 * s, karin, 0, -0.12 * s, 0],
    [0.04 * s, 0.14 * s, 0.3 * s, renk, 0, 0.22 * s, 0.05 * s], [0.05 * s, 0.05 * s, 0.02, '#111', -0.11 * s, 0.05 * s, -0.27 * s], [0.05 * s, 0.05 * s, 0.02, '#111', 0.11 * s, 0.05 * s, -0.27 * s], ...ek]);
  const kuyruk = parca(kok, malzeme, [0, 0.22 * s, 0.35 * s], [[0.04 * s, 0.34 * s, 0.24 * s, renk, 0, 0, 0.12 * s]]);
  const yuzgec = [-1, 1].map(k => parca(kok, malzeme, [k * 0.11 * s, 0.16 * s, -0.08 * s], [[0.12 * s, 0.03 * s, 0.12 * s, renk, k * 0.06 * s, 0, 0]]));
  return { kok, malzeme, govde, kafa: null, bacaklar: [], kollar: [], kanatlar: yuzgec, kuyruk, balik: true };
}

/* İskelet kalıbı: kemik ve göz renkleri; pelerin: buz iskeleti için yırtık giysi */
function iskeletKalibi(kemik, koyu, pelerin = false) {
  const malzeme = new THREE.MeshBasicMaterial({ vertexColors: true, map: gurultu() });
  const kok = new THREE.Group();
  const P = '#4a5e6a', P2 = '#3a4c58';
  const govde = parca(kok, malzeme, [0, 1.12, 0], [[0.12, 0.72, 0.12, kemik], [0.46, 0.08, 0.2, kemik, 0, 0.3, 0], [0.42, 0.06, 0.18, kemik, 0, 0.14, 0], [0.38, 0.06, 0.16, kemik, 0, -0.02, 0], [0.3, 0.06, 0.14, kemik, 0, -0.18, 0], [0.4, 0.1, 0.18, kemik, 0, -0.34, 0],
    ...(pelerin ? [[0.5, 0.42, 0.24, P, 0, 0.14, 0.02], [0.14, 0.24, 0.24, P2, -0.18, -0.2, 0.02], [0.12, 0.16, 0.24, P2, 0.18, -0.16, 0.02], [0.5, 0.06, 0.26, '#cfe6f2', 0, 0.36, 0.02]] : [])]);
  const kafa = parca(kok, malzeme, [0, 1.5, 0], [[0.46, 0.46, 0.46, kemik, 0, 0.23, 0], [0.12, 0.1, 0.02, koyu, -0.11, 0.26, -0.235], [0.12, 0.1, 0.02, koyu, 0.11, 0.26, -0.235], [0.06, 0.06, 0.02, koyu, 0, 0.16, -0.235], [0.3, 0.04, 0.02, koyu, 0, 0.06, -0.235],
    ...(pelerin ? [[0.5, 0.16, 0.5, P, 0, 0.42, 0.02], [0.5, 0.3, 0.06, P2, 0, 0.3, 0.24], [0.06, 0.06, 0.02, '#9fe8ff', -0.11, 0.26, -0.24], [0.06, 0.06, 0.02, '#9fe8ff', 0.11, 0.26, -0.24]] : [])]);
  /* Yay sağ elde, kola dik (kol ileri uzatıldığında dikey durur); kiriş ve ok ayrı parçalardır, germe sırasında hareket eder */
  const yay = '#7a5532';
  const kollar = [-1, 1].map(s => parca(kok, malzeme, [s * 0.3, 1.45, 0], [[0.1, 0.72, 0.1, kemik, 0, -0.32, 0],
    ...(s > 0 ? [[0.07, 0.08, 0.14, yay, 0, -0.72, 0], [0.05, 0.06, 0.2, yay, 0, -0.68, 0.16], [0.05, 0.06, 0.2, yay, 0, -0.68, -0.16], [0.04, 0.06, 0.1, yay, 0, -0.61, 0.31], [0.04, 0.06, 0.1, yay, 0, -0.61, -0.31]] : [])]));
  const sag = kollar[1];
  const kirisMalzeme = new THREE.MeshBasicMaterial({ color: 0xe8e8e0 });
  const kiris = [1, -1].map(() => { const k = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.015, 1), kirisMalzeme); sag.add(k); return k; });
  const ok = new THREE.Mesh(birlestir([kutuGeo(0.025, 0.62, 0.025, '#8a6a42', 0, -0.31, 0), kutuGeo(0.05, 0.08, 0.05, '#9a9da4', 0, -0.64, 0), kutuGeo(0.06, 0.1, 0.012, '#e8e8e0', 0, -0.03, 0)]), malzeme);
  ok.visible = false; sag.add(ok);
  const bacaklar = [-1, 1].map(s => parca(kok, malzeme, [s * 0.12, 0.75, 0], [[0.1, 0.75, 0.1, kemik, 0, -0.375, 0], ...(pelerin ? [[0.16, 0.3, 0.16, P2, 0, -0.18, 0]] : [])]));
  return { kok, malzeme, govde, kafa, bacaklar, kollar, kanatlar: [], kuyruk: null, yay: { kiris, ok } };
}

/* İnsansı canavar kalıbı (zombi, mumya, boğulmuş zombi): R renkler, R.ek parça başına ek kutular */
function zombiKalibi(R) {
  const malzeme = new THREE.MeshBasicMaterial({ vertexColors: true, map: gurultu() });
  const kok = new THREE.Group();
  const E = R.ek || {};
  const govde = parca(kok, malzeme, [0, 1.12, 0], [[0.5, 0.75, 0.26, R.gomlek], [0.52, 0.12, 0.28, R.gomlekKoyu, 0, -0.32, 0], ...(E.govde || [])]);
  const kafa = parca(kok, malzeme, [0, 1.5, 0], [[0.5, 0.5, 0.5, R.ten, 0, 0.25, 0], [0.1, 0.06, 0.02, R.goz, -0.12, 0.3, -0.255], [0.1, 0.06, 0.02, R.goz, 0.12, 0.3, -0.255], [0.18, 0.05, 0.02, R.agiz, 0, 0.12, -0.255],
    ...(R.sac ? [[0.52, 0.14, 0.52, R.sac, 0, 0.48, 0]] : []), ...(E.kafa || [])]);
  const kollar = [-1, 1].map(s => parca(kok, malzeme, [s * 0.375, 1.45, 0], [[0.24, 0.72, 0.24, R.ten, 0, -0.3, 0], [0.26, 0.3, 0.26, R.gomlek, 0, -0.05, 0], ...(E.kol || [])]));
  const bacaklar = [-1, 1].map(s => parca(kok, malzeme, [s * 0.125, 0.75, 0], [[0.24, 0.75, 0.24, R.pantolon, 0, -0.375, 0], [0.25, 0.12, 0.26, R.ayakkabi, 0, -0.69, -0.01], ...(E.bacak || [])]));
  return { kok, malzeme, govde, kafa, bacaklar, kollar, kanatlar: [], kuyruk: null };
}

export const MODELLER = {
  hamsi: () => balik(0.55, '#5a7f9a', '#d8e4ea'),
  cipura: () => balik(1, '#9aa8b0', '#e8ecee', [[0.23, 0.04, 0.3, '#d8b04a', 0, 0.08, -0.1]]),
  kopekbaligi: () => {
    const malzeme = new THREE.MeshBasicMaterial({ vertexColors: true, map: gurultu() });
    const kok = new THREE.Group();
    const gri = '#6f7a84', ak = '#e6e8ea';
    const govde = parca(kok, malzeme, [0, 0.4, 0], [[0.7, 0.6, 1.9, gri], [0.62, 0.18, 1.7, ak, 0, -0.24, 0], [0.5, 0.45, 0.5, gri, 0, -0.02, -1.15], [0.36, 0.06, 0.3, '#2a2224', 0, -0.2, -1.2], [0.08, 0.08, 0.02, '#111', -0.22, 0.08, -1.36], [0.08, 0.08, 0.02, '#111', 0.22, 0.08, -1.36], [0.08, 0.55, 0.45, gri, 0, 0.5, -0.1]]);
    const kuyruk = parca(kok, malzeme, [0, 0.45, 0.95], [[0.08, 0.8, 0.4, gri, 0, 0.1, 0.25]]);
    const yuzgec = [-1, 1].map(k => parca(kok, malzeme, [k * 0.35, 0.25, -0.4], [[0.55, 0.06, 0.32, gri, k * 0.28, 0, 0]]));
    return { kok, malzeme, govde, kafa: null, bacaklar: [], kollar: [], kanatlar: yuzgec, kuyruk, balik: true };
  },
  ahtapot: () => {
    const malzeme = new THREE.MeshBasicMaterial({ vertexColors: true, map: gurultu() });
    const kok = new THREE.Group();
    const renk = '#b8506a';
    const govde = parca(kok, malzeme, [0, 0.6, 0], [[0.62, 0.66, 0.62, renk, 0, 0.18, 0], [0.12, 0.12, 0.02, '#f0e0d0', -0.16, 0.05, -0.315], [0.12, 0.12, 0.02, '#f0e0d0', 0.16, 0.05, -0.315], [0.06, 0.06, 0.02, '#111', -0.16, 0.05, -0.325], [0.06, 0.06, 0.02, '#111', 0.16, 0.05, -0.325]]);
    const bacaklar = [];
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2, b = parca(kok, malzeme, [Math.cos(a) * 0.22, 0.42, Math.sin(a) * 0.22], [[0.1, 0.62, 0.1, '#a84660', 0, -0.31, 0]]);
      b.userData.aci = a; bacaklar.push(b);
    }
    return { kok, malzeme, govde, kafa: null, bacaklar, kollar: [], kanatlar: [], kuyruk: null, ahtapot: true };
  },
  inek: () => dortAyak({
    govde: [0.86, 0.72, 1.3], govdeY: 1.0, renk: '#4a3123', bacak: [0.26, 0.64], bacakRenk: '#4a3123', toynak: '#2a1d14',
    govdeEk: [[0.4, 0.3, 0.02, '#ece8e0', 0.2, 0.1, -0.66], [0.02, 0.36, 0.5, '#ece8e0', 0.44, 0.05, 0.1], [0.02, 0.3, 0.4, '#ece8e0', -0.44, -0.05, -0.2], [0.5, 0.02, 0.4, '#ece8e0', -0.1, 0.37, 0.2], [0.3, 0.2, 0.25, '#e8a3a3', 0, -0.42, 0.3]],
    kafa: [0.6, 0.56, 0.5], kafaY: 1.3, kafaIleri: 0.02, kafaRenk: '#4a3123',
    kafaEk: [[0.4, 0.22, 0.04, '#d8b4a0', 0, -0.14, -0.52], [0.08, 0.08, 0.02, '#111', -0.18, 0.08, -0.51], [0.08, 0.08, 0.02, '#111', 0.18, 0.08, -0.51], [0.1, 0.16, 0.08, '#e6e0cc', -0.32, 0.3, -0.25], [0.1, 0.16, 0.08, '#e6e0cc', 0.32, 0.3, -0.25], [0.6, 0.02, 0.3, '#ece8e0', 0, 0.29, -0.15]],
    kuyruk: [0.08, 0.6, 0.08]
  }),
  koyun: () => dortAyak({
    govde: [0.86, 0.76, 1.15], govdeY: 0.98, renk: '#ebe8e0', bacak: [0.22, 0.6], bacakRenk: '#d9c8b0', bacakIc: 0.08,
    govdeEk: [[0.92, 0.12, 1.2, '#f4f2ec', 0, 0.36, 0]],
    kafa: [0.44, 0.46, 0.5], kafaY: 1.22, kafaIleri: -0.05, kafaRenk: '#d9c8b0',
    kafaEk: [[0.5, 0.18, 0.3, '#ebe8e0', 0, 0.2, -0.18], [0.07, 0.07, 0.02, '#111', -0.13, 0.04, -0.51], [0.07, 0.07, 0.02, '#111', 0.13, 0.04, -0.51], [0.14, 0.08, 0.12, '#cdb89c', -0.28, 0.08, -0.2], [0.14, 0.08, 0.12, '#cdb89c', 0.28, 0.08, -0.2]]
  }),
  domuz: () => dortAyak({
    govde: [0.76, 0.6, 1.05], govdeY: 0.62, renk: '#eba4a0', bacak: [0.24, 0.34],
    kafa: [0.56, 0.52, 0.48], kafaY: 0.74, kafaIleri: 0.0,
    kafaEk: [[0.28, 0.2, 0.06, '#e48c8a', 0, -0.08, -0.5], [0.05, 0.05, 0.02, '#7a3a3a', -0.06, -0.08, -0.535], [0.05, 0.05, 0.02, '#7a3a3a', 0.06, -0.08, -0.535], [0.07, 0.07, 0.02, '#111', -0.17, 0.1, -0.49], [0.07, 0.07, 0.02, '#111', 0.17, 0.1, -0.49]],
    kuyruk: [0.06, 0.12, 0.06]
  }),
  kurt: () => dortAyak({
    govde: [0.46, 0.46, 0.92], govdeY: 0.68, renk: '#a3a19c', bacak: [0.16, 0.48], bacakRenk: '#9a9893',
    govdeEk: [[0.56, 0.5, 0.4, '#b8b5ae', 0, 0.04, -0.3]],
    kafa: [0.42, 0.4, 0.34], kafaY: 0.82, kafaIleri: 0.0,
    kafaEk: [[0.22, 0.16, 0.2, '#8f8d88', 0, -0.08, -0.42], [0.06, 0.06, 0.02, '#1a1a1a', 0, -0.03, -0.53], [0.08, 0.16, 0.06, '#8f8d88', -0.13, 0.27, -0.1], [0.08, 0.16, 0.06, '#8f8d88', 0.13, 0.27, -0.1], [0.06, 0.06, 0.02, '#111', -0.11, 0.06, -0.345], [0.06, 0.06, 0.02, '#111', 0.11, 0.06, -0.345]],
    kuyruk: [0.12, 0.12, 0.5], kuyrukRenk: '#b8b5ae'
  }),
  tavsan: () => dortAyak({
    govde: [0.3, 0.3, 0.44], govdeY: 0.3, renk: '#9a7b5a', bacak: [0.1, 0.15],
    kafa: [0.24, 0.24, 0.24], kafaY: 0.42, kafaIleri: -0.04,
    kafaEk: [[0.06, 0.22, 0.04, '#9a7b5a', -0.06, 0.22, -0.08], [0.06, 0.22, 0.04, '#9a7b5a', 0.06, 0.22, -0.08], [0.05, 0.05, 0.02, '#111', -0.08, 0.03, -0.245], [0.05, 0.05, 0.02, '#111', 0.08, 0.03, -0.245], [0.06, 0.04, 0.02, '#e8a0a0', 0, -0.04, -0.245]],
    kuyruk: [0.1, 0.1, 0.08], kuyrukRenk: '#ece8e0'
  }),
  tavuk: () => {
    const malzeme = new THREE.MeshBasicMaterial({ vertexColors: true, map: gurultu() });
    const kok = new THREE.Group();
    const govde = parca(kok, malzeme, [0, 0.42, 0], [[0.34, 0.32, 0.44, '#f2f0ea']]);
    const kafa = parca(kok, malzeme, [0, 0.62, -0.2], [[0.22, 0.3, 0.18, '#f2f0ea', 0, 0.06, -0.04], [0.12, 0.06, 0.1, '#e8a33d', 0, 0.08, -0.17], [0.08, 0.1, 0.04, '#d03030', 0, -0.03, -0.15], [0.04, 0.04, 0.02, '#111', -0.08, 0.14, -0.135], [0.04, 0.04, 0.02, '#111', 0.08, 0.14, -0.135]]);
    const bacaklar = [-0.08, 0.08].map(x => parca(kok, malzeme, [x, 0.26, 0.02], [[0.05, 0.26, 0.05, '#e8a33d', 0, -0.13, 0], [0.14, 0.02, 0.14, '#e8a33d', 0, -0.25, -0.03]]));
    const kanatlar = [-1, 1].map(s => parca(kok, malzeme, [s * 0.18, 0.54, 0], [[0.04, 0.24, 0.32, '#e6e3db', s * 0.02, -0.11, 0]]));
    return { kok, malzeme, govde, kafa, bacaklar, kanatlar, kollar: [], kuyruk: null };
  },
  koylu: (meslek = 'ciftci') => {
    const M = MESLEKLER[meslek] || MESLEKLER.ciftci;
    const malzeme = new THREE.MeshBasicMaterial({ vertexColors: true, map: gurultu() });
    const kok = new THREE.Group();
    const ten = '#d6a47c', sac = ['#3a2a1e', '#5a3a22', '#2a2420', '#7a5a3a'][meslek.length % 4];
    const govdeKutular = [[0.5, 0.75, 0.26, M.gomlek], [0.52, 0.08, 0.28, '#3a2a1e', 0, -0.33, 0]];
    if (M.onluk) govdeKutular.push([0.42, 0.62, 0.02, M.onluk, 0, -0.06, -0.14]);
    if (M.uzun) govdeKutular.push([0.54, 0.5, 0.3, M.gomlek, 0, -0.55, 0]);
    const govde = parca(kok, malzeme, [0, 1.12, 0], govdeKutular);
    const kafaK = [[0.48, 0.48, 0.48, ten, 0, 0.24, 0], [0.5, 0.14, 0.5, sac, 0, 0.44, 0.0], [0.5, 0.3, 0.08, sac, 0, 0.28, 0.22],
      [0.08, 0.06, 0.02, '#1e1e24', -0.11, 0.28, -0.245], [0.08, 0.06, 0.02, '#1e1e24', 0.11, 0.28, -0.245], [0.08, 0.1, 0.06, '#c48e66', 0, 0.2, -0.26], [0.16, 0.03, 0.02, '#8a4a3a', 0, 0.1, -0.245]];
    if (M.sapka) kafaK.push([0.7, 0.05, 0.7, M.sapka, 0, 0.5, 0], [0.46, 0.14, 0.46, M.sapka, 0, 0.58, 0]);
    const kafa = parca(kok, malzeme, [0, 1.5, 0], kafaK);
    const kollar = [-1, 1].map(s => parca(kok, malzeme, [s * 0.37, 1.45, 0], [[0.22, 0.42, 0.24, M.gomlek, 0, -0.18, 0], [0.2, 0.32, 0.22, ten, 0, -0.54, 0]]));
    const bacaklar = [-1, 1].map(s => parca(kok, malzeme, [s * 0.125, 0.75, 0], [[0.24, 0.75, 0.24, M.pantolon, 0, -0.375, 0], [0.25, 0.12, 0.27, '#3a2a1e', 0, -0.69, -0.01]]));
    return { kok, malzeme, govde, kafa, bacaklar, kollar, kanatlar: [], kuyruk: null, insan: true };
  },
  iskelet: () => iskeletKalibi('#dcd8cc', '#4a4640'),
  /* Buz İskeleti: buzlu mavi kemik, yırtık pelerin ve parlayan gözler */
  buziskelet: () => iskeletKalibi('#c6dbe6', '#2a5a7a', true),
  orumcek: () => {
    const malzeme = new THREE.MeshBasicMaterial({ vertexColors: true, map: gurultu() });
    const kok = new THREE.Group();
    const govde = parca(kok, malzeme, [0, 0.45, 0.25], [[0.75, 0.55, 0.8, '#2e2620'], [0.5, 0.08, 0.5, '#4a2a22', 0, 0.28, 0.05]]);
    const kafa = parca(kok, malzeme, [0, 0.42, -0.15], [[0.5, 0.42, 0.42, '#3a302a', 0, 0, -0.2], [0.08, 0.08, 0.02, '#e02020', -0.12, 0.08, -0.415], [0.08, 0.08, 0.02, '#e02020', 0.12, 0.08, -0.415], [0.05, 0.05, 0.02, '#ff4040', -0.05, 0.14, -0.415], [0.05, 0.05, 0.02, '#ff4040', 0.05, 0.14, -0.415], [0.06, 0.12, 0.06, '#1a1410', -0.08, -0.16, -0.42], [0.06, 0.12, 0.06, '#1a1410', 0.08, -0.16, -0.42]]);
    const bacaklar = [];
    for (let i = 0; i < 4; i++) for (const s of [-1, 1]) {
      const b = parca(kok, malzeme, [s * 0.22, 0.45, -0.25 + i * 0.17], [[0.9, 0.08, 0.08, '#2a221c', s * 0.45, 0, 0]]);
      b.rotation.z = s * -0.55; b.rotation.y = s * (0.5 - i * 0.33);
      b.userData.tabanY = b.rotation.y;
      bacaklar.push(b);
    }
    return { kok, malzeme, govde, kafa, bacaklar, kollar: [], kanatlar: [], kuyruk: null, orumcek: true };
  },
  zombi: () => zombiKalibi({ ten: '#5f9450', gomlek: '#2f6f9a', gomlekKoyu: '#285e82', pantolon: '#3a3a86', ayakkabi: '#2a2420', sac: '#3e5a30', goz: '#141414', agiz: '#2d4a26' }),
  /* Mumya: sargı bezleri, koyu göz boşlukları */
  mumya: () => zombiKalibi({ ten: '#cdbf98', gomlek: '#d9cca6', gomlekKoyu: '#b5a67e', pantolon: '#cbbd94', ayakkabi: '#a89a72', sac: null, goz: '#2a1c10', agiz: '#6a5a40',
    ek: { govde: [[0.52, 0.04, 0.28, '#a8996f', 0, 0.12, 0], [0.52, 0.04, 0.28, '#a8996f', 0, -0.1, 0]], kafa: [[0.52, 0.04, 0.52, '#a8996f', 0, 0.38, 0], [0.52, 0.04, 0.52, '#a8996f', 0, 0.06, 0], [0.06, 0.06, 0.02, '#e8c860', -0.12, 0.3, -0.262], [0.06, 0.06, 0.02, '#e8c860', 0.12, 0.3, -0.262]],
      kol: [[0.26, 0.04, 0.26, '#a8996f', 0, -0.25, 0], [0.26, 0.04, 0.26, '#a8996f', 0, -0.48, 0]], bacak: [[0.26, 0.04, 0.26, '#a8996f', 0, -0.3, 0]] } }),
  /* Boğulmuş zombi: yeşilimsi mavi ten, yırtık giysi, yosun parçaları */
  bogulmus: () => zombiKalibi({ ten: '#5a9a92', gomlek: '#3f7a72', gomlekKoyu: '#2e5e58', pantolon: '#5a4e8a', ayakkabi: '#2a3a36', sac: '#2e5a3a', goz: '#7fe8ff', agiz: '#24443e',
    ek: { govde: [[0.08, 0.3, 0.02, '#3a8a3a', 0.12, -0.1, -0.14], [0.06, 0.2, 0.02, '#3a8a3a', -0.16, 0.05, -0.14]], kafa: [[0.08, 0.2, 0.06, '#3a8a3a', -0.2, 0.34, -0.22]], kol: [], bacak: [[0.26, 0.2, 0.26, '#3f7a72', 0, -0.62, 0]] } }),
  /* Yarasa: küçük gövde, büyük kulaklar, zarlı kanatlar (kanatlar.rotation.z ile çırpılır) */
  yarasa: () => {
    const malzeme = new THREE.MeshBasicMaterial({ vertexColors: true, map: gurultu() });
    const kok = new THREE.Group();
    const r = '#3d302a', k = '#2a201c';
    const govde = parca(kok, malzeme, [0, 0.26, 0], [[0.22, 0.26, 0.2, r], [0.16, 0.08, 0.16, k, 0, -0.16, 0]]);
    const kafa = parca(kok, malzeme, [0, 0.42, -0.02], [[0.22, 0.2, 0.2, r, 0, 0.05, -0.04], [0.06, 0.12, 0.04, k, -0.07, 0.2, -0.04], [0.06, 0.12, 0.04, k, 0.07, 0.2, -0.04],
      [0.04, 0.04, 0.02, '#ffcf4a', -0.05, 0.08, -0.145], [0.04, 0.04, 0.02, '#ffcf4a', 0.05, 0.08, -0.145]]);
    const kanatlar = [-1, 1].map(s => parca(kok, malzeme, [s * 0.1, 0.32, 0], [[0.36, 0.02, 0.26, k, s * 0.18, 0, 0.02], [0.2, 0.02, 0.14, r, s * 0.42, -0.01, 0.06], [0.04, 0.04, 0.3, '#1e1714', s * 0.02, 0.01, 0]]));
    return { kok, malzeme, govde, kafa, bacaklar: [], kollar: [], kanatlar, kuyruk: null, yarasa: true };
  }
};

/* Ok modeli */
export function okModeli() {
  const malzeme = new THREE.MeshBasicMaterial({ vertexColors: true, map: gurultu() });
  const g = birlestir([kutuGeo(0.04, 0.04, 0.6, '#8a6034'), kutuGeo(0.07, 0.07, 0.1, '#55555c', 0, 0, -0.33), kutuGeo(0.01, 0.1, 0.14, '#f0f0ea', 0, 0, 0.24), kutuGeo(0.1, 0.01, 0.14, '#f0f0ea', 0, 0, 0.24)]);
  return new THREE.Mesh(g, malzeme);
}
