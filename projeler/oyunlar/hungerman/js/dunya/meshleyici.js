/* HungerMan - parça meshleyici
   Girdi: komşu blokları da içeren 18 x 18 x 128 dolgulu hacim.
   Çıktı: katı bloklar ve su için ayrı geometri dizileri (konum, doku koordinatı, ışık).
   Görünmeyen yüzler çizilmez; köşe gölgelemesi (AO) ve gökyüzü ışığı köşe başına yumuşatılır. */
import { PB, PY, DB, ddizin } from '../sabitler.js';
import { OPAK, CIZIM, AYNI_GIZLE, SIVI, KESIK, YUZ_DOKU, C_KUP, C_CAPRAZ, C_SIVI, C_LAV, LAV } from '../bloklar.js';

const DX = 1, DZ = DB, DY = DB * DB;
const EPS = 0.5 / 256;

/* Yüzler: +x, -x, +y, -y, +z, -z (dışarıdan bakınca saat yönünün tersine) */
const YUZLER = [
  { n: [1, 0, 0], k: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]], uv: [[1, 0], [1, 1], [0, 1], [0, 0]], g: 0.72 },
  { n: [-1, 0, 0], k: [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]], uv: [[1, 0], [1, 1], [0, 1], [0, 0]], g: 0.72 },
  { n: [0, 1, 0], k: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], uv: [[0, 0], [1, 0], [1, 1], [0, 1]], g: 1.0 },
  { n: [0, -1, 0], k: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], uv: [[0, 0], [1, 0], [1, 1], [0, 1]], g: 0.5 },
  { n: [0, 0, 1], k: [[1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1]], uv: [[1, 0], [1, 1], [0, 1], [0, 0]], g: 0.86 },
  { n: [0, 0, -1], k: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]], uv: [[1, 0], [1, 1], [0, 1], [0, 0]], g: 0.86 }
];
/* Her köşe için AO örnekleme ofsetleri (komşu katmanda) */
for (const f of YUZLER) {
  const eks = f.n[0] ? 0 : f.n[1] ? 1 : 2;
  const t = [0, 1, 2].filter(a => a !== eks);
  const ofs = v => v[0] * DX + v[1] * DY + v[2] * DZ;
  f.komsu = ofs(f.n);
  f.ao = f.k.map(c => {
    const s1 = [0, 0, 0], s2 = [0, 0, 0];
    s1[t[0]] = c[t[0]] ? 1 : -1; s2[t[1]] = c[t[1]] ? 1 : -1;
    return [ofs(s1), ofs(s2), ofs(s1) + ofs(s2)];
  });
}
const AO_D = [0.42, 0.62, 0.82, 1];

class Tampon {
  constructor() { this.p = []; this.u = []; this.l = []; this.i = []; this.n = 0; }
  bitir() {
    return { p: new Float32Array(this.p), u: new Float32Array(this.u), l: new Float32Array(this.l), i: new Uint32Array(this.i) };
  }
}

function dokuUV(t, lu, lv, out) {
  const tx = t & 15, ty = t >> 4;
  const u0 = tx / 16 + EPS, u1 = (tx + 1) / 16 - EPS;
  const vb = 1 - (ty + 1) / 16 + EPS, vt = 1 - ty / 16 - EPS;
  out.push(u0 + lu * (u1 - u0), vb + lv * (vt - vb));
}

export function meshle(P) {
  /* Gökyüzü ışığı: her sütunda yukarıdan aşağı */
  const gok = new Float32Array(DB * DB * PY);
  for (let z = -1; z <= PB; z++) for (let x = -1; x <= PB; x++) {
    let s = 1;
    for (let y = PY - 1; y >= 0; y--) {
      const i = ddizin(x, y, z), id = P[i];
      if (id) {
        if (OPAK[id]) s = 0;
        else if (s > 0) {
          if (LAV[id]) s = 0;
          else if (SIVI[id]) s = Math.max(0.3, s * 0.9);
          else if (KESIK[id] && !AYNI_GIZLE[id]) s = Math.max(0.5, s * 0.86);
        }
      }
      gok[i] = s;
    }
  }
  const op = new Tampon(), su = new Tampon();
  let ustY = 0;
  for (let y = PY - 1; y >= 0 && !ustY; y--) for (let z = 0; z < PB && !ustY; z++) for (let x = 0; x < PB; x++) if (P[ddizin(x, y, z)]) { ustY = y; break; }

  for (let y = 0; y <= ustY; y++) for (let z = 0; z < PB; z++) for (let x = 0; x < PB; x++) {
    const i = ddizin(x, y, z), id = P[i];
    if (!id) continue;
    const ciz = CIZIM[id];
    if (ciz === C_KUP) kup(P, gok, i, id, x, y, z, op);
    else if (ciz === C_CAPRAZ) {
      capraz(gok, i, id, x, y, z, op);
      if (SIVI[id]) sivi(P, gok, i, x, y, z, su);
    } else if (ciz === C_SIVI) sivi(P, gok, i, x, y, z, su);
    else if (ciz === C_LAV) sivi(P, gok, i, x, y, z, op, true);
  }
  return { opak: op.bitir(), su: su.bitir() };
}

function kup(P, gok, i, id, x, y, z, T) {
  for (let f = 0; f < 6; f++) {
    const Y = YUZLER[f];
    let ni = i + Y.komsu, n;
    if (f === 2 && y === PY - 1) n = 0;
    else if (f === 3 && y === 0) continue;
    else n = P[ni];
    if (OPAK[n]) continue;
    if (AYNI_GIZLE[id] && n === id) continue;
    const doku = YUZ_DOKU[id * 6 + f];
    const tabanN = T.n;
    const ao = [0, 0, 0, 0];
    for (let c = 0; c < 4; c++) {
      const k = Y.k[c];
      T.p.push(x + k[0], y + k[1], z + k[2]);
      dokuUV(doku, Y.uv[c][0], Y.uv[c][1], T.u);
      let a = 3, g = 0, gs = 0;
      if (n === 0 && f === 2 && y === PY - 1) { g = 1; gs = 1; }
      else {
        const o = Y.ao[c];
        const s1 = OPAK[P[ni + o[0]]], s2 = OPAK[P[ni + o[1]]], kk = OPAK[P[ni + o[2]]];
        a = s1 && s2 ? 0 : 3 - s1 - s2 - kk;
        g = gok[ni]; gs = 1;
        if (!s1) { g += gok[ni + o[0]]; gs++; }
        if (!s2) { g += gok[ni + o[1]]; gs++; }
        if (!kk && !(s1 && s2)) { g += gok[ni + o[2]]; gs++; }
      }
      ao[c] = a;
      T.l.push(AO_D[a] * Y.g, g / gs);
    }
    T.n += 4;
    if (ao[0] + ao[2] < ao[1] + ao[3]) T.i.push(tabanN + 1, tabanN + 2, tabanN + 3, tabanN + 1, tabanN + 3, tabanN);
    else T.i.push(tabanN, tabanN + 1, tabanN + 2, tabanN, tabanN + 2, tabanN + 3);
  }
}

const CAPRAZ = [
  [[0.15, 0, 0.15], [0.15, 1, 0.15], [0.85, 1, 0.85], [0.85, 0, 0.85]],
  [[0.15, 0, 0.85], [0.15, 1, 0.85], [0.85, 1, 0.15], [0.85, 0, 0.15]]
];
const CAPRAZ_UV = [[0, 0], [0, 1], [1, 1], [1, 0]];
function capraz(gok, i, id, x, y, z, T) {
  const doku = YUZ_DOKU[id * 6 + 2];
  const g = gok[i];
  for (const q of CAPRAZ) {
    for (let yon = 0; yon < 2; yon++) {
      const b = T.n;
      for (let c = 0; c < 4; c++) {
        const k = q[c];
        T.p.push(x + k[0], y + k[1], z + k[2]);
        dokuUV(doku, CAPRAZ_UV[c][0], CAPRAZ_UV[c][1], T.u);
        T.l.push(0.92, g);
      }
      T.n += 4;
      if (yon === 0) T.i.push(b, b + 1, b + 2, b, b + 2, b + 3);
      else T.i.push(b, b + 2, b + 1, b, b + 3, b + 2);
    }
  }
}

/* Su ve lav yüzeyleri; lav kendi ışığıyla parlar (ışık değeri 2 = gölgesiz) */
function sivi(P, gok, i, x, y, z, T, lav = false) {
  const ayni = n => (lav ? LAV[n] === 1 : SIVI[n] === 1 && !LAV[n]);
  const ustSivi = y < PY - 1 && ayni(P[i + DY]);
  const h = ustSivi ? 1 : 0.875;
  for (let f = 0; f < 6; f++) {
    const Y = YUZLER[f];
    const ni = i + Y.komsu;
    if (f === 3 && y === 0) continue;
    const n = (f === 2 && y === PY - 1) ? 0 : P[ni];
    if (ayni(n) || OPAK[n]) continue;
    if (f !== 2 && CIZIM[n] === C_KUP && !SIVI[n] && KESIK[n] === 0) continue;
    const doku = YUZ_DOKU[(lav ? 59 : 7) * 6 + f];
    const b = T.n;
    const g = f === 2 ? 1 : (gok[ni] || gok[i]);
    for (let c = 0; c < 4; c++) {
      const k = Y.k[c];
      T.p.push(x + k[0], y + k[1] * h, z + k[2]);
      dokuUV(doku, Y.uv[c][0], Y.uv[c][1], T.u);
      if (lav) T.l.push(1.6 + 0.4 * Y.g, 1); else T.l.push(Y.g, g);
    }
    T.n += 4;
    T.i.push(b, b + 1, b + 2, b, b + 2, b + 3);
    /* Su yüzeyi alttan da görünsün */
    if (f === 2 && !lav) {
      const b2 = T.n;
      for (let c = 3; c >= 0; c--) {
        const k = Y.k[c];
        T.p.push(x + k[0], y + k[1] * h, z + k[2]);
        dokuUV(doku, Y.uv[c][0], Y.uv[c][1], T.u);
        T.l.push(0.8, g);
      }
      T.n += 4;
      T.i.push(b2, b2 + 1, b2 + 2, b2, b2 + 2, b2 + 3);
    }
  }
}
