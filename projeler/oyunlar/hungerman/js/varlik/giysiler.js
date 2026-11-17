/* HungerMan - insan modeli, kıyafet ve zırh görünümleri (0.33.0)
   Çıplak oyuncu modelinin üzerinde yalnızca don vardır; kıyafetler (başlık, üst, alt, ayakkabı) tenin, zırhlar kıyafetin üstüne giyilir.
   Envanterdeki karakter önizlemesi ve çok oyunculudaki diğer oyuncular aynı modeli ve aynı giysi kutularını kullanır.
   Kutu: [en, boy, derinlik, renk, x, y, z]; eklemler: kafa (pivot 1.5), govde (1.12), kol0 / kol1 (1.45), bacak0 / bacak1 (0.75). Modelin önü -z yönüdür. */
import { THREE } from '../grafik/sahne.js';
import { parca, kutuGeo, birlestir, gurultu } from './modeller.js';
import { ESYALAR } from '../bloklar.js';

export const TEN = '#d9a982', SAC = '#3b2a1d';
const KURK = '#efe8dc';
export const koyu = (r, k) => '#' + new THREE.Color(r).multiplyScalar(k).getHexString();

/* Çıplak insan modeli: ten, saç, yüz ve oyuncu rengindeki don */
export function insanModeli(don, malzeme) {
  malzeme = malzeme || new THREE.MeshBasicMaterial({ vertexColors: true, map: gurultu() });
  const kok = new THREE.Group(), ayak = koyu(TEN, 0.86);
  const govde = parca(kok, malzeme, [0, 1.12, 0], [[0.5, 0.75, 0.26, TEN], [0.505, 0.16, 0.265, don, 0, -0.3, 0], [0.12, 0.02, 0.02, koyu(TEN, 0.85), 0, -0.02, -0.132]]);
  const kafa = parca(kok, malzeme, [0, 1.5, 0], [[0.48, 0.48, 0.48, TEN, 0, 0.24, 0], [0.5, 0.12, 0.5, SAC, 0, 0.45, 0], [0.5, 0.3, 0.1, SAC, 0, 0.3, 0.21],
    [0.08, 0.07, 0.02, '#1e1e24', -0.11, 0.27, -0.245], [0.08, 0.07, 0.02, '#1e1e24', 0.11, 0.27, -0.245], [0.16, 0.03, 0.02, '#8a4a3a', 0, 0.11, -0.245]]);
  const kollar = [-1, 1].map(s => parca(kok, malzeme, [s * 0.37, 1.45, 0], [[0.2, 0.3, 0.22, TEN, 0, -0.1, 0], [0.2, 0.46, 0.22, TEN, 0, -0.48, 0]]));
  const bacaklar = [-1, 1].map(s => parca(kok, malzeme, [s * 0.125, 0.75, 0], [[0.24, 0.75, 0.24, TEN, 0, -0.375, 0], [0.245, 0.15, 0.245, don, 0, -0.07, 0], [0.25, 0.12, 0.27, ayak, 0, -0.69, -0.01]]));
  const eklem = { kafa, govde, kol0: kollar[0], kol1: kollar[1], bacak0: bacaklar[0], bacak1: bacaklar[1] };
  return { kok, malzeme, govde, kafa, kollar, bacaklar, eklem, giysiMesh: [], giysiImz: '' };
}

const ikiKol = f => [0, 1].map(s => ['kol' + s, f(s)]);
const ikiBacak = f => [0, 1].map(s => ['bacak' + s, f(s)]);

/* ---------- Kıyafetler ---------- */
export function kiyafetKutulari(id) {
  const E = ESYALAR[id], c = E.renk || '#888', k = koyu(c, 0.7), a = koyu(c, 1.18), K = E.kiyafet;
  switch (K.sekil) {
    case 'bere': return [['kafa', [[0.51, 0.14, 0.51, c, 0, 0.47, 0], [0.52, 0.06, 0.52, k, 0, 0.41, 0], [0.1, 0.08, 0.1, '#f2f2f2', 0, 0.57, 0]]]];
    case 'hasir': return [['kafa', [[0.82, 0.03, 0.82, c, 0, 0.44, 0], [0.5, 0.13, 0.5, c, 0, 0.52, 0], [0.51, 0.04, 0.51, '#8a3a2a', 0, 0.475, 0]]]];
    case 'kurk': return [['kafa', [[0.54, 0.16, 0.54, c, 0, 0.5, 0], [0.56, 0.08, 0.06, KURK, 0, 0.45, -0.26], [0.06, 0.26, 0.32, c, -0.27, 0.32, 0.04], [0.06, 0.26, 0.32, c, 0.27, 0.32, 0.04], [0.56, 0.06, 0.56, KURK, 0, 0.59, 0]]]];
    case 'gomlek': return [['govde', [[0.515, 0.62, 0.275, c, 0, 0.065, 0], [0.22, 0.05, 0.02, k, 0, 0.35, -0.14], [0.03, 0.5, 0.02, k, 0, 0.06, -0.14], [0.04, 0.04, 0.02, a, 0, 0.18, -0.145], [0.04, 0.04, 0.02, a, 0, 0.02, -0.145]]],
      ...ikiKol(() => [[0.22, 0.3, 0.24, c, 0, -0.1, 0], [0.225, 0.04, 0.245, k, 0, -0.23, 0]])];
    case 'kazak': return [['govde', [[0.52, 0.7, 0.28, c, 0, 0.03, 0], [0.525, 0.06, 0.285, k, 0, -0.29, 0], [0.525, 0.06, 0.285, a, 0, 0.13, 0], [0.525, 0.04, 0.285, a, 0, 0.02, 0], [0.24, 0.06, 0.02, k, 0, 0.35, -0.145]]],
      ...ikiKol(() => [[0.22, 0.3, 0.24, c, 0, -0.1, 0], [0.215, 0.44, 0.235, c, 0, -0.47, 0], [0.225, 0.05, 0.245, k, 0, -0.67, 0], [0.225, 0.05, 0.245, a, 0, -0.1, 0]])];
    case 'ceket': return [['govde', [[0.525, 0.72, 0.285, c, 0, 0.02, 0], [0.09, 0.3, 0.02, k, -0.09, 0.2, -0.145], [0.09, 0.3, 0.02, k, 0.09, 0.2, -0.145], [0.02, 0.45, 0.02, '#c8c8c8', 0, -0.07, -0.146], [0.12, 0.08, 0.02, k, 0.15, -0.18, -0.146]]],
      ...ikiKol(() => [[0.225, 0.3, 0.245, c, 0, -0.1, 0], [0.215, 0.44, 0.235, c, 0, -0.47, 0], [0.225, 0.04, 0.245, k, 0, -0.67, 0]])];
    case 'mont': return [['govde', [[0.56, 0.74, 0.32, c, 0, 0.0, 0], [0.58, 0.12, 0.34, KURK, 0, 0.33, 0], [0.58, 0.08, 0.34, KURK, 0, -0.34, 0], [0.03, 0.55, 0.02, k, 0, -0.03, -0.165], [0.06, 0.05, 0.02, '#e8c040', 0.08, 0.1, -0.166], [0.06, 0.05, 0.02, '#e8c040', 0.08, -0.08, -0.166]]],
      ...ikiKol(() => [[0.26, 0.31, 0.28, c, 0, -0.1, 0], [0.24, 0.42, 0.26, c, 0, -0.46, 0], [0.26, 0.07, 0.28, KURK, 0, -0.66, 0]])];
    case 'cuppe': return [['govde', [[0.54, 0.75, 0.3, c, 0, 0.0, 0], [0.55, 0.07, 0.31, '#b8442a', 0, -0.2, 0], [0.3, 0.2, 0.02, k, 0, 0.24, -0.155], [0.56, 0.1, 0.3, c, 0, 0.36, 0.02]]],
      ...ikiKol(() => [[0.26, 0.3, 0.28, c, 0, -0.1, 0], [0.25, 0.4, 0.27, c, 0, -0.44, 0], [0.26, 0.05, 0.28, k, 0, -0.62, 0]]),
      ...ikiBacak(s => [[0.27, 0.58, 0.27, c, 0, -0.27, 0], [0.275, 0.04, 0.275, k, 0, -0.55, 0]])];
    case 'pantolon': return [['govde', [[0.515, 0.1, 0.275, k, 0, -0.33, 0], [0.08, 0.06, 0.02, '#c8a040', 0, -0.33, -0.14]]],
      ...ikiBacak(() => [[0.255, 0.6, 0.255, c, 0, -0.3, 0], [0.26, 0.04, 0.26, k, 0, -0.6, 0]])];
    case 'kurkPantolon': return [['govde', [[0.53, 0.12, 0.29, k, 0, -0.33, 0]]],
      ...ikiBacak(() => [[0.28, 0.6, 0.28, c, 0, -0.3, 0], [0.29, 0.06, 0.29, KURK, 0, -0.6, 0], [0.285, 0.04, 0.285, a, 0, -0.25, 0]])];
    case 'sort': return [['govde', [[0.515, 0.1, 0.275, k, 0, -0.33, 0]]], ...ikiBacak(() => [[0.255, 0.3, 0.255, c, 0, -0.14, 0], [0.26, 0.03, 0.26, a, 0, -0.28, 0]])];
    case 'sandalet': return ikiBacak(() => [[0.26, 0.03, 0.29, c, 0, -0.74, -0.01], [0.26, 0.025, 0.2, k, 0, -0.68, -0.04], [0.26, 0.025, 0.08, k, 0, -0.71, 0.08]]);
    case 'ayakkabi': return ikiBacak(() => [[0.26, 0.13, 0.285, c, 0, -0.69, -0.01], [0.27, 0.03, 0.3, k, 0, -0.745, -0.01], [0.1, 0.02, 0.02, '#e8e0d0', 0, -0.65, -0.155]]);
    case 'cizme': return ikiBacak(() => [[0.27, 0.3, 0.29, c, 0, -0.61, -0.01], [0.28, 0.06, 0.3, KURK, 0, -0.45, -0.01], [0.28, 0.03, 0.31, k, 0, -0.745, -0.01]]);
  }
  return [];
}

/* ---------- Zırhlar ---------- */
export function zirhKutulari(id) {
  const E = ESYALAR[id], r = E.renk || '#9aa0a6', k = koyu(r, 0.72), p = E.zirh.parca, gor = E.zirh.gorunum;
  if (id === 456) return [['kafa', [[0.44, 0.17, 0.05, '#9fdcff', 0, 0.29, -0.265], [0.5, 0.05, 0.06, '#2a3a44', 0, 0.39, -0.26], [0.5, 0.05, 0.06, '#2a3a44', 0, 0.19, -0.26],
    [0.52, 0.06, 0.52, '#2a3a44', 0, 0.32, 0], [0.12, 0.1, 0.06, '#e8a33d', 0, 0.12, -0.29]]]];   // dalış maskesi
  if (id === 457) return [0, 1].map(s => ['bacak' + s, [[0.28, 0.2, 0.3, '#1f6f7a', 0, -0.65, -0.01], [0.3, 0.035, 0.42, '#2a9aaa', 0, -0.735, -0.24]]]);   // palet
  /* 0.33.0: farklı görünümlü zırhlar */
  if (gor === 'zincir') {
    const h = koyu(r, 0.8), l = a => [0.57, 0.025, 0.33, h, 0, a, 0];
    if (p === 0) return [['kafa', [[0.53, 0.44, 0.06, r, 0, 0.26, 0.255], [0.05, 0.44, 0.53, r, -0.26, 0.26, 0], [0.05, 0.44, 0.53, r, 0.26, 0.26, 0], [0.53, 0.06, 0.53, r, 0, 0.5, 0], [0.53, 0.07, 0.06, r, 0, 0.03, -0.25],
      [0.54, 0.025, 0.54, h, 0, 0.38, 0], [0.54, 0.025, 0.54, h, 0, 0.18, 0]]]];
    if (p === 1) return [['govde', [[0.56, 0.86, 0.32, r, 0, -0.04, 0], l(0.25), l(0.1), l(-0.05), l(-0.2), l(-0.35)]], ...ikiKol(() => [[0.27, 0.3, 0.29, r, 0, -0.1, 0], [0.25, 0.28, 0.27, r, 0, -0.38, 0], [0.28, 0.025, 0.3, h, 0, -0.2, 0]])];
    if (p === 2) return ikiBacak(() => [[0.28, 0.56, 0.28, r, 0, -0.32, 0], [0.29, 0.025, 0.29, h, 0, -0.2, 0], [0.29, 0.025, 0.29, h, 0, -0.4, 0]]);
    return ikiBacak(() => [[0.29, 0.22, 0.31, r, 0, -0.64, -0.015], [0.3, 0.025, 0.32, h, 0, -0.58, -0.015]]);
  }
  if (gor === 'altin') {
    const m = '#d0303a', g = '#fff1a8';
    if (p === 0) return [['kafa', [[0.56, 0.12, 0.56, r, 0, 0.46, 0], [0.08, 0.1, 0.04, r, -0.18, 0.57, -0.26], [0.08, 0.14, 0.04, r, 0, 0.59, -0.26], [0.08, 0.1, 0.04, r, 0.18, 0.57, -0.26],
      [0.08, 0.08, 0.03, m, 0, 0.46, -0.29], [0.05, 0.3, 0.56, r, -0.265, 0.3, 0], [0.05, 0.3, 0.56, r, 0.265, 0.3, 0], [0.56, 0.36, 0.05, r, 0, 0.3, 0.265]]]];
    if (p === 1) return [['govde', [[0.56, 0.62, 0.32, r, 0, 0.06, 0], [0.18, 0.18, 0.02, g, 0, 0.12, -0.17], [0.08, 0.08, 0.025, m, 0, 0.12, -0.18], [0.56, 0.05, 0.33, k, 0, -0.22, 0]]],
      ...ikiKol(() => [[0.32, 0.12, 0.32, r, 0, 0.02, 0], [0.27, 0.22, 0.29, r, 0, -0.12, 0], [0.28, 0.04, 0.3, g, 0, -0.04, 0]])];
    if (p === 2) return [['govde', [[0.55, 0.1, 0.31, k, 0, -0.32, 0], [0.08, 0.08, 0.02, m, 0, -0.32, -0.16]]], ...ikiBacak(() => [[0.29, 0.45, 0.29, r, 0, -0.24, 0], [0.3, 0.04, 0.3, g, 0, -0.42, 0]])];
    return ikiBacak(() => [[0.29, 0.22, 0.32, r, 0, -0.64, -0.015], [0.3, 0.05, 0.33, k, 0, -0.53, -0.015], [0.06, 0.06, 0.02, m, 0, -0.6, -0.18]]);
  }
  if (gor === 'kurk') {
    const d = '#6a4a32';
    if (p === 0) return [['kafa', [[0.6, 0.2, 0.6, r, 0, 0.52, 0], [0.07, 0.3, 0.36, r, -0.29, 0.3, 0.06], [0.07, 0.3, 0.36, r, 0.29, 0.3, 0.06], [0.6, 0.32, 0.07, r, 0, 0.32, 0.28], [0.62, 0.05, 0.08, d, 0, 0.43, -0.28]]]];
    if (p === 1) return [['govde', [[0.6, 0.68, 0.36, r, 0, 0.04, 0], [0.06, 0.68, 0.37, d, -0.13, 0.04, 0], [0.06, 0.68, 0.37, d, 0.13, 0.04, 0], [0.62, 0.14, 0.38, koyu(r, 1.05), 0, 0.34, 0]]],
      ...ikiKol(() => [[0.33, 0.32, 0.35, r, 0, -0.08, 0], [0.27, 0.26, 0.29, r, 0, -0.34, 0]])];
    if (p === 2) return [['govde', [[0.58, 0.12, 0.34, d, 0, -0.32, 0]]], ...ikiBacak(() => [[0.31, 0.5, 0.31, r, 0, -0.26, 0], [0.32, 0.05, 0.32, d, 0, -0.1, 0]])];
    return ikiBacak(() => [[0.32, 0.28, 0.34, r, 0, -0.62, -0.015], [0.33, 0.04, 0.35, d, 0, -0.74, -0.015]]);
  }
  if (gor === 'obsidyen') {
    const v = '#b05aff';
    if (p === 0) return [['kafa', [[0.56, 0.08, 0.56, r, 0, 0.52, 0], [0.56, 0.12, 0.05, r, 0, 0.42, -0.265], [0.56, 0.1, 0.05, r, 0, 0.2, -0.265], [0.4, 0.035, 0.02, v, 0, 0.31, -0.285],
      [0.05, 0.38, 0.56, r, -0.265, 0.32, 0], [0.05, 0.38, 0.56, r, 0.265, 0.32, 0], [0.56, 0.42, 0.05, r, 0, 0.3, 0.265], [0.06, 0.18, 0.06, k, -0.22, 0.64, -0.08], [0.06, 0.18, 0.06, k, 0.22, 0.64, -0.08]]]];
    if (p === 1) return [['govde', [[0.57, 0.64, 0.33, r, 0, 0.05, 0], [0.025, 0.46, 0.02, v, -0.1, 0.05, -0.17], [0.025, 0.46, 0.02, v, 0.1, 0.05, -0.17], [0.3, 0.025, 0.02, v, 0, 0.27, -0.17], [0.58, 0.06, 0.34, k, 0, -0.24, 0]]],
      ...ikiKol(() => [[0.3, 0.27, 0.31, r, 0, -0.07, 0], [0.06, 0.16, 0.06, k, 0, 0.12, 0], [0.29, 0.03, 0.31, v, 0, -0.18, 0]])];
    if (p === 2) return [['govde', [[0.56, 0.12, 0.32, k, 0, -0.32, 0]]], ...ikiBacak(() => [[0.3, 0.5, 0.3, r, 0, -0.24, 0], [0.31, 0.025, 0.31, v, 0, -0.3, 0], [0.31, 0.06, 0.31, k, 0, -0.04, 0]])];
    return ikiBacak(() => [[0.3, 0.24, 0.33, r, 0, -0.63, -0.015], [0.31, 0.05, 0.34, k, 0, -0.52, -0.015], [0.31, 0.025, 0.34, v, 0, -0.6, -0.02]]);
  }
  if (p === 0) return [['kafa', [[0.56, 0.08, 0.56, r, 0, 0.52, 0], [0.56, 0.1, 0.05, k, 0, 0.43, -0.265], [0.05, 0.32, 0.56, r, -0.265, 0.34, 0], [0.05, 0.32, 0.56, r, 0.265, 0.34, 0],
    [0.56, 0.4, 0.05, r, 0, 0.3, 0.265], [0.06, 0.12, 0.05, k, 0, 0.32, -0.27]]]];
  if (p === 1) return [['govde', [[0.56, 0.62, 0.32, r, 0, 0.06, 0], [0.4, 0.06, 0.02, k, 0, 0.2, -0.17], [0.16, 0.36, 0.02, k, 0, -0.04, -0.17]]],
    ...ikiKol(() => [[0.28, 0.26, 0.3, r, 0, -0.07, 0], [0.29, 0.05, 0.31, k, 0, -0.2, 0]])];
  if (p === 2) return [['govde', [[0.55, 0.12, 0.31, k, 0, -0.32, 0]]], ...ikiBacak(() => [[0.29, 0.5, 0.29, r, 0, -0.24, 0], [0.3, 0.06, 0.3, k, 0, -0.04, 0]])];
  return ikiBacak(() => [[0.29, 0.22, 0.32, r, 0, -0.64, -0.015], [0.3, 0.05, 0.33, k, 0, -0.53, -0.015]]);
}

/* Modele giysileri giydirir: liste = [{ id, buyu }] (önce kıyafetler, sonra zırhlar). İmza değişmediyse bir şey yapmaz. */
export function giydir(m, liste) {
  const imz = liste.map(s => (s ? s.id + (s.buyu ? 'b' : '') : '-')).join(',');
  if (imz === m.giysiImz) return false;
  m.giysiImz = imz;
  for (const g of m.giysiMesh) { g.parent.remove(g); g.geometry.dispose(); if (g.material !== m.malzeme) g.material.dispose(); }
  m.giysiMesh = [];
  /* 0.34.1: kask giyiliyken başlık kıyafeti gizlenir; zırhlar kıyafetin içine girmesin diye eklemine göre biraz büyütülür */
  const cuppe = liste.some(s => s && ESYALAR[s.id] && ESYALAR[s.id].kiyafet && ESYALAR[s.id].kiyafet.sekil === 'cuppe');
  const kask = liste.some(s => s && ESYALAR[s.id] && ESYALAR[s.id].zirh && ESYALAR[s.id].zirh.parca === 0);
  for (const s of liste) {
    const E = s && ESYALAR[s.id];
    if (!E || !(E.zirh || E.kiyafet)) continue;
    if (E.kiyafet && E.kiyafet.parca === 0 && kask) continue;
    if (E.kiyafet && E.kiyafet.parca === 2 && cuppe) continue;   // 0.35.0: çöl cüppesi bacakları örter; alttaki pantolon çizilmez
    let mal = m.malzeme;
    if (s.buyu) { mal = new THREE.MeshBasicMaterial({ vertexColors: true, map: gurultu() }); mal.userData.parilti = true; mal.color.copy(m.malzeme.color); }
    for (const [ek, kutular] of (E.kiyafet ? kiyafetKutulari(s.id) : zirhKutulari(s.id))) {
      if (!kutular.length) continue;
      const g = new THREE.Mesh(birlestir(kutular.map(k => kutuGeo(...k))), mal);
      if (E.zirh) g.scale.set(1.09, 1.025, 1.09);
      m.eklem[ek].add(g); m.giysiMesh.push(g);
    }
  }
  return true;
}
