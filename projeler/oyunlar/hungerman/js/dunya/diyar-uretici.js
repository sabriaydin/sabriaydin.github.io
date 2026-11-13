/* HungerMan - Yeraltı Diyarı üreticisi (0.18.0)
   Diyar, dünyadan çok uzakta (x = DIYAR_X çevresinde) üretilen, tabanı ve tavanı ana kayayla kapalı bir mağara diyarıdır.
   Kor taşından oyulmuş dev mağaralar, 31. katmana kadar lav denizi, tavandan sarkan ışıltaş kümeleri, kül kumu düzlükleri,
   magma kıyıları, kızıl mantarlar ve kor cevherleri bulunur. Yer yer lav denizinin üstünde köprüleriyle bir Kül Kalesi yükselir.
   Yoğunluk, iri bir ızgarada hesaplanıp ara değerlenir (hızlı ve yumuşak mağaralar). */
import { PB, PY, DIYAR_X, DIYAR_SINIR, DIYAR_LAV, dizin } from '../sabitler.js';
import { Gurultu, karistir, karma2, karma3, uretec } from '../rastgele.js';

const KOR = 512, KUL = 513, ISIL = 514, KULT = 518, OYMA = 519, KORC = 520, MAGMA = 521, MANTAR = 522, LAV = 59, ANA = 1;
const IX = 4, IY = 8;   // yoğunluk ızgarası adımları

function gurultular(u) {
  if (!u._diyar) {
    const g = k => new Gurultu(karistir(u.tohum + 0x51ab + k * 7919));
    u._diyar = { a: g(1), b: g(2), c: g(3), kul: g(4), isil: g(5), mag: g(6) };
  }
  return u._diyar;
}

/* Bir noktanın kaya yoğunluğu (> 0: kaya) */
function yogunluk(G, x, y, z) {
  let n = G.a.g3(x / 58, y / 34, z / 58) + 0.55 * G.b.g3(x / 24, y / 17, z / 24) + 0.22 * G.c.g3(x / 10, y / 9, z / 10);
  if (y < 18) n += (18 - y) / 18 * 1.4;           // taban
  if (y > 98) n += (y - 98) / 28 * 1.9;           // tavan
  n -= 0.12 + (y > 36 && y < 90 ? 0.08 : 0);       // orta yükseklikte daha geniş mağaralar
  return n;
}

export function diyarUret(u, cx, cz) {
  const v = new Uint16Array(PB * PB * PY);
  const G = gurultular(u);
  const x0 = cx * PB, z0 = cz * PB;
  /* İri ızgara: 5 x 5 x 17 */
  const NX = PB / IX + 1, NY = PY / IY + 1;
  const iz = new Float32Array(NX * NX * NY);
  for (let a = 0; a < NX; a++) for (let c = 0; c < NX; c++) for (let b = 0; b < NY; b++) iz[(a * NX + c) * NY + b] = yogunluk(G, x0 + a * IX, b * IY, z0 + c * IX);
  for (let lz = 0; lz < PB; lz++) for (let lx = 0; lx < PB; lx++) {
    const x = x0 + lx, z = z0 + lz, r = karma2(u.tohum ^ 0x5d1a, x, z);
    const a = Math.floor(lx / IX), c = Math.floor(lz / IX), fx = (lx % IX) / IX, fz = (lz % IX) / IX;
    for (let y = 0; y < PY; y++) {
      const i = dizin(lx, y, lz);
      if (y === 0 || y === PY - 1 || (y === 1 && r < 0.6) || (y === PY - 2 && r < 0.6) || (y === PY - 3 && r < 0.22)) { v[i] = ANA; continue; }
      const b = Math.floor(y / IY), fy = (y % IY) / IY;
      const I = (aa, cc, bb) => iz[(aa * NX + cc) * NY + bb];
      const d00 = I(a, c, b) + (I(a + 1, c, b) - I(a, c, b)) * fx, d10 = I(a, c + 1, b) + (I(a + 1, c + 1, b) - I(a, c + 1, b)) * fx;
      const d01 = I(a, c, b + 1) + (I(a + 1, c, b + 1) - I(a, c, b + 1)) * fx, d11 = I(a, c + 1, b + 1) + (I(a + 1, c + 1, b + 1) - I(a, c + 1, b + 1)) * fx;
      const d = (d00 + (d10 - d00) * fz) * (1 - fy) + (d01 + (d11 - d01) * fz) * fy;
      v[i] = d > 0 ? KOR : y <= DIYAR_LAV ? LAV : 0;
    }
  }
  susle(u, G, v, x0, z0);
  kaleYaz(u, v, x0, z0);
  /* Diyarın sınırı: ana kaya duvarı */
  for (let lz = 0; lz < PB; lz++) for (let lx = 0; lx < PB; lx++) {
    const x = x0 + lx, z = z0 + lz;
    if (Math.abs(x - DIYAR_X) >= DIYAR_SINIR || Math.abs(z) >= DIYAR_SINIR) for (let y = 0; y < PY; y++) v[dizin(lx, y, lz)] = ANA;
  }
  return v;
}

/* Yüzey süslemeleri: kül kumu, magma kıyıları, mantarlar, ışıltaş kümeleri, cevherler */
function susle(u, G, v, x0, z0) {
  for (let lz = 0; lz < PB; lz++) for (let lx = 0; lx < PB; lx++) {
    const x = x0 + lx, z = z0 + lz;
    const kulBolge = G.kul.g2(x / 22, z / 22) > 0.3, isilBolge = G.isil.g2(x / 9, z / 9) > 0.45;
    for (let y = PY - 4; y > 2; y--) {
      const i = dizin(lx, y, lz), b = v[i];
      if (b !== KOR) continue;
      const ust = v[dizin(lx, y + 1, lz)], alt = v[dizin(lx, y - 1, lz)];
      const s = karma3(u.tohum ^ 0x7c3f, x, y, z);
      /* Zemin */
      if (ust === 0 && y > DIYAR_LAV) {
        if (y <= DIYAR_LAV + 2 && s < 0.45) v[i] = MAGMA;
        else if (kulBolge) { v[i] = KUL; if (v[dizin(lx, y - 1, lz)] === KOR) v[dizin(lx, y - 1, lz)] = KUL; }
        if (s > 0.975 && v[i] !== MAGMA && y + 1 < PY - 3) v[dizin(lx, y + 1, lz)] = MANTAR;
      }
      /* Lav kıyısı */
      else if (ust === LAV && s < 0.3) v[i] = MAGMA;
      /* Tavan: ışıltaş kümeleri sarkar */
      if (alt === 0 && isilBolge && s < 0.7) {
        const boy = 1 + Math.floor(karma3(u.tohum ^ 0x11, x, y, z) * 3.5);
        for (let k = 1; k <= boy && y - k > DIYAR_LAV; k++) { const j = dizin(lx, y - k, lz); if (v[j] !== 0) break; v[j] = ISIL; }
        v[i] = ISIL;
      }
      /* Kor cevheri */
      if (v[i] === KOR && s > 0.3 && s < 0.3045) v[i] = KORC;
    }
  }
}

/* ---------- Kül Kalesi ---------- */
export const KALE_HUCRE = 150;
export function kaleBul(u, gx, gz) {
  const k = gx + ',' + gz;
  if (!u.kaleOnbellek) u.kaleOnbellek = new Map();
  if (u.kaleOnbellek.has(k)) return u.kaleOnbellek.get(k);
  let o = null;
  const r = uretec(karistir(u.tohum ^ Math.imul(gx, 0x2f6b1d4b) ^ Math.imul(gz, 0x1b873593) ^ 0x6b616c));
  if (r() < 0.6) {
    const x = gx * KALE_HUCRE + 50 + Math.floor(r() * (KALE_HUCRE - 100)), z = gz * KALE_HUCRE + 50 + Math.floor(r() * (KALE_HUCRE - 100));
    if (Math.abs(x - DIYAR_X) < DIYAR_SINIR - 60 && Math.abs(z) < DIYAR_SINIR - 60) {
      const kollar = [0, 1, 2, 3].filter(() => r() < 0.8);
      if (kollar.length < 2) kollar.push(0, 2);
      o = { x, y: 58 + Math.floor(r() * 12), z, kollar: [...new Set(kollar)], sandikKule: [r() < 0.5, r() < 0.5, r() < 0.5, r() < 0.5] };
    }
  }
  u.kaleOnbellek.set(k, o);
  return o;
}
export function kalelerAlan(u, x0, z0, x1, z1) {
  const l = [];
  for (let gz = Math.floor(z0 / KALE_HUCRE); gz <= Math.floor(z1 / KALE_HUCRE); gz++) for (let gx = Math.floor(x0 / KALE_HUCRE); gx <= Math.floor(x1 / KALE_HUCRE); gx++) { const k = kaleBul(u, gx, gz); if (k) l.push(k); }
  return l;
}
/* Bu nokta bir kalenin içinde mi (sandık ganimeti için) */
export function kaleAt(u, x, y, z) {
  for (const k of kalelerAlan(u, x - 60, z - 60, x + 60, z + 60)) if (Math.abs(x - k.x) <= 52 && Math.abs(z - k.z) <= 52 && Math.abs(y - k.y) <= 14) return k;
  return null;
}

const KOL_UZ = 36, KULE_M = 48;   // köprü uzunluğu, kule merkezinin kale merkezine uzaklığı
const YON = [[0, -1], [1, 0], [0, 1], [-1, 0]];

function kaleYaz(u, v, x0, z0) {
  for (const k of kalelerAlan(u, x0 - 64, z0 - 64, x0 + PB + 64, z0 + PB + 64)) {
    if (x0 + PB < k.x - 56 || x0 > k.x + 56 || z0 + PB < k.z - 56 || z0 > k.z + 56) continue;
    tekKale(u, v, x0, z0, k);
  }
}

function tekKale(u, v, x0, z0, K) {
  const L = (x, y, z, id) => { const lx = K.x + x - x0, lz = K.z + z - z0; if (lx < 0 || lz < 0 || lx >= PB || lz >= PB || y < 1 || y >= PY - 3) return; v[dizin(lx, y, lz)] = id; };
  const B = (x, y, z) => { const lx = K.x + x - x0, lz = K.z + z - z0; if (lx < 0 || lz < 0 || lx >= PB || lz >= PB) return -1; return v[dizin(lx, y, lz)]; };
  const Y = K.y;
  /* Yerinde yere ya da lava kadar inen sütun */
  const sutun = (x, z, ust) => { for (let y = ust; y > 2 && y > Y - 46; y--) { const b = B(x, y, z); if (b === -1) return; if (b !== 0 && b !== LAV && b !== MANTAR && b !== ISIL && y < ust) return; L(x, y, z, KULT); } };
  /* Kutu: dolu ya da boş */
  const kutu = (ax, ay, az, bx, by, bz, id) => { for (let y = ay; y <= by; y++) for (let z = az; z <= bz; z++) for (let x = ax; x <= bx; x++) L(x, y, z, id); };

  /* ---- Merkez burç (17 x 17) ---- */
  const H = 8;
  kutu(-H - 1, Y, -H - 1, H + 1, Y + 9, H + 1, 0);
  kutu(-H, Y - 1, -H, H, Y - 1, H, KULT);
  for (let z = -H; z <= H; z++) for (let x = -H; x <= H; x++) {
    const kenar = Math.abs(x) === H || Math.abs(z) === H;
    if (kenar && (x % 4 === 0 || z % 4 === 0 || (Math.abs(x) === H && Math.abs(z) === H))) sutun(x, z, Y - 2);
    if (!kenar) continue;
    for (let y = Y; y <= Y + 7; y++) {
      const t = Math.abs(x) === H ? z : x, kose = Math.abs(x) === H && Math.abs(z) === H;
      if (!kose && Math.abs(t) <= 1 && y <= Y + 3) continue;                       // kapılar
      if (!kose && Math.abs(t) % 4 === 2 && (y === Y + 2 || y === Y + 3)) { L(x, y, z, 182); continue; }   // parmaklıklı pencereler
      L(x, y, z, y === Y + 4 && !kose ? OYMA : KULT);
    }
    if ((x + z) % 2 === 0) L(x, Y + 9, z, KULT);   // mazgallar
  }
  kutu(-H, Y + 8, -H, H, Y + 8, H, KULT);           // dam
  /* Köşe kuleleri */
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const cx = sx * H, cz = sz * H;
    kutu(cx - 1, Y + 8, cz - 1, cx + 1, Y + 11, cz + 1, KULT);
    L(cx, Y + 12, cz, ISIL);
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) L(cx + a, Y + 12, cz + b, KULT);
  }
  /* İç düzen: oymalı zemin, sütunlar, tavan ışıkları, yuva ve sandıklar */
  for (let z = -2; z <= 2; z++) for (let x = -2; x <= 2; x++) L(x, Y - 1, z, (x + z) % 2 ? OYMA : KULT);
  for (const [a, b] of [[-4, -4], [4, -4], [-4, 4], [4, 4]]) for (let y = Y; y <= Y + 7; y++) L(a, y, b, y === Y + 3 ? OYMA : KULT);
  for (const [a, b] of [[-6, -6], [6, -6], [-6, 6], [6, 6], [0, -6], [0, 6], [-6, 0], [6, 0]]) L(a, Y + 7, b, ISIL);
  L(0, Y, 0, 58);
  for (const [a, b] of [[-7, -3], [7, 3], [-3, 7], [3, -7]]) L(a, Y, b, 50);

  /* ---- Köprüler ve uç kuleleri ---- */
  for (const kol of K.kollar) {
    const [dx, dz] = YON[kol], px = -dz, pz = dx;   // p: köprüye dik
    const P = (s, t) => [dx * s + px * t, dz * s + pz * t];
    for (let s = H + 1; s <= KULE_M - 4; s++) {
      for (let t = -2; t <= 2; t++) {
        const [x, z] = P(s, t);
        for (let y = Y; y <= Y + 4; y++) L(x, y, z, 0);
        L(x, Y - 1, z, Math.abs(t) <= 1 && s % 6 === 0 ? OYMA : KULT);
        if (Math.abs(t) === 2) { L(x, Y, z, KULT); if (s % 6 === 3) { L(x, Y + 1, z, KULT); L(x, Y + 2, z, ISIL); } }
        if (s % 8 === 4 && Math.abs(t) <= 1) sutun(x, z, Y - 2);
      }
    }
    /* Uç kulesi (7 x 7) */
    const [cx, cz] = P(KULE_M, 0), h = 3;
    kutu(cx - h, Y, cz - h, cx + h, Y + 7, cz + h, 0);
    for (let z = -h; z <= h; z++) for (let x = -h; x <= h; x++) {
      L(cx + x, Y - 1, cz + z, KULT);
      const kenar = Math.abs(x) === h || Math.abs(z) === h;
      if (kenar && (Math.abs(x) === h && Math.abs(z) === h)) sutun(cx + x, cz + z, Y - 2);
      if (kenar) for (let y = Y; y <= Y + 6; y++) {
        /* Köprüye bakan yüzde kapı */
        const ic = x * -dx + z * -dz === h && Math.abs(x * px + z * pz) <= 1 && y <= Y + 3;
        if (!ic) L(cx + x, y, cz + z, y === Y + 3 && (x + z) % 2 ? 182 : KULT);
      }
      L(cx + x, Y + 7, cz + z, KULT);
      if (kenar && (x + z) % 2 === 0) L(cx + x, Y + 8, cz + z, KULT);
    }
    L(cx, Y + 6, cz, ISIL);
    if (K.sandikKule[kol]) L(cx + dx * 2, Y, cz + dz * 2, 50);
  }
}
