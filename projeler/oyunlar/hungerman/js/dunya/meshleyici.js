/* HungerMan - parça meshleyici
   Girdi: komşu blokları da içeren 18 x 18 x 128 dolgulu hacim.
   Çıktı: katı bloklar ve su için ayrı geometri dizileri (konum, doku koordinatı, ışık).
   Görünmeyen yüzler çizilmez; köşe gölgelemesi (AO) ve gökyüzü ışığı köşe başına yumuşatılır. */
import { PB, PY, DB, ddizin } from '../sabitler.js';
/* 0.41.0: dolgulu hacmin yüksekliği (meshle çağrısında verilir; üstü boş havadır) */
let PH = PY;
import { ATLAS_N, OPAK, CIZIM, AYNI_GIZLE, SIVI, KESIK, YUZ_DOKU, C_KUP, C_CAPRAZ, C_SIVI, C_LAV, C_SEKIL, LAV, BLOKLAR, BLOK_UST, SU_SEVIYE, DOGA41 } from '../bloklar.js';
import { sekilKutulari } from '../sekiller.js';

const DX = 1, DZ = DB, DY = DB * DB;
/* Altına gölge düşüren biçimli bloklar (merdiven, yarım blok, tarla) */
const GOLGE = new Uint8Array(BLOK_UST);
for (const b of BLOKLAR) if (b && (b.sekil === 'merdiven' || b.sekil === 'yarim' || b.sekil === 'tarla')) GOLGE[b.id] = 1;
/* 0.18.0: kendi ışığıyla parlayan bloklar (geçit, ışıltaş, magma): gölgelenmez, lav gibi çizilir */
const PARLAK = new Uint8Array(BLOK_UST);
for (const b of BLOKLAR) if (b && b.parlak) PARLAK[b.id] = 1;
const EPS = 0.5 / (ATLAS_N * 16);

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
  constructor() { this.p = []; this.u = []; this.l = []; this.i = []; this.t = []; this.n = 0; }
  bitir() {
    return { p: new Float32Array(this.p), u: new Float32Array(this.u), l: new Float32Array(this.l), i: new Uint32Array(this.i), t: new Int8Array(this.t) };
  }
}

/* 0.41.0: biyom tonu (köşe rengi). TON: işçinin verdiği sütun tablosu (DB x DB x 9: çimen, yaprak, su rgb) ya da null.
   Köşenin tonu, köşeyi paylaşan dört sütunun ortalamasıdır (biyom sınırlarında yumuşak geçiş). Bayt: (ton - 1) * 254 */
let TON = null;
const TON_CIM = new Uint8Array(BLOK_UST), TON_YAPRAK = new Uint8Array(BLOK_UST);
for (const id of [4, 143, 25, 43]) TON_CIM[id] = 1;
for (const id of [9, 11, 13, 145, DOGA41.mangrovYaprak]) TON_YAPRAK[id] = 1;
function tonEkle(T, tur, x, z, kx, kz) {
  if (!TON || !tur) { T.t.push(0, 0, 0); return; }
  const o = (tur - 1) * 3, cx = x + kx, cz = z + kz;
  let r = 0, g = 0, b = 0;
  for (let dz = -1; dz <= 0; dz++) for (let dx = -1; dx <= 0; dx++) { const j = ((cz + dz + 1) * DB + cx + dx + 1) * 9 + o; r += TON[j]; g += TON[j + 1]; b += TON[j + 2]; }
  const q = v => Math.max(-127, Math.min(127, Math.round((v / 4 - 1) * 254)));
  T.t.push(q(r), q(g), q(b));
}

function dokuUV(t, lu, lv, out) {
  const tx = t % ATLAS_N, ty = (t / ATLAS_N) | 0;
  const u0 = tx / ATLAS_N + EPS, u1 = (tx + 1) / ATLAS_N - EPS;
  const vb = 1 - (ty + 1) / ATLAS_N + EPS, vt = 1 - ty / ATLAS_N - EPS;
  out.push(u0 + lu * (u1 - u0), vb + lv * (vt - vb));
}

/* 0.41.3: gökyüzü ışığı (Minecraft benzeri ışık düzeyleri, 0-15)
   - Gökyüzünü gören hücreler 15'tir; su ve yapraklar ışığı azaltarak geçirir.
   - Işık her yöne (yanlara, aşağı, yukarı) taşkın dolgusuyla yayılır ve her blokta bir düzey azalır: mağara ağızları, oyuklar,
     çıkıntı ve ağaç altları içeri doğru kademeli olarak kararır.
   - Hesap, parçanın her yönde 8 blok ötesini de kapsayan hacimde yapılır: komşu parçadaki açıklıktan gelen ışık da sayılır,
     parça sınırlarında aydınlık farkı oluşmaz.
   Q: (16 + 2 * ISIK_PAY)^2 x H blok hacmi (y, z, x sırası). Düzeyin parlaklığa çevrimi ISIK_EGRI ile yapılır. */
export const ISIK_PAY = 8;
const IW = PB + 2 * ISIK_PAY, IWY = IW * IW;
const ISIK_EGRI = new Float32Array(16);
for (let l = 0; l < 16; l++) ISIK_EGRI[l] = l >= 15 ? 1 : l <= 0 ? 0 : Math.pow(0.8, 15 - l);
let KUYRUK = new Int32Array(1 << 16);
export function isikHesapla(Q, H) {
  const L = new Uint8Array(IWY * H);
  let yAlt = H, yUst = 0;
  /* Sütunlar: yukarıdan aşağı */
  for (let z = 0; z < IW; z++) for (let x = 0; x < IW; x++) {
    let s = 15;
    for (let y = H - 1; y >= 0; y--) {
      const i = (y * IW + z) * IW + x, id = Q[i];
      if (id) {
        if (OPAK[id] || LAV[id]) { if (y + 1 < yAlt) yAlt = y + 1; if (y > yUst) yUst = y; break; }
        /* 0.41.8: su ve yaprak altı eski aydınlıkta kalır (deniz tabanı ve sık orman zemini fazla kararmaz) */
        if (SIVI[id]) s = Math.max(10, s - 1);
        else if (KESIK[id] && !AYNI_GIZLE[id]) s = Math.max(12, s - 1);
      }
      L[i] = s;
      if (GOLGE[id]) { if (y < yAlt) yAlt = y; if (y > yUst) yUst = y; break; }
    }
  }
  /* Taşkın dolgusu: komşusundan en az iki düzey aydınlık olan hücreler tohumdur */
  const y0 = Math.max(0, yAlt - 16);
  let bas = 0, son = 0;
  /* Tohum taraması yalnızca en alçak ve en yüksek yüzey arasında (üstü tümüyle açık hava, düzeyi 15) */
  const y1 = Math.min(H, yUst + 2);
  for (let y = y0; y < y1; y++) for (let z = 0; z < IW; z++) for (let x = 0; x < IW; x++) {
    const i = (y * IW + z) * IW + x, l = L[i];
    if (l < 2) continue;
    if ((x > 0 && L[i - 1] < l - 1 && !OPAK[Q[i - 1]]) || (x < IW - 1 && L[i + 1] < l - 1 && !OPAK[Q[i + 1]]) ||
      (z > 0 && L[i - IW] < l - 1 && !OPAK[Q[i - IW]]) || (z < IW - 1 && L[i + IW] < l - 1 && !OPAK[Q[i + IW]]) ||
      (y > y0 && L[i - IWY] < l - 1 && !OPAK[Q[i - IWY]]) || (y < H - 1 && L[i + IWY] < l - 1 && !OPAK[Q[i + IWY]])) {
      if (son >= KUYRUK.length) { const k = new Int32Array(KUYRUK.length * 2); k.set(KUYRUK); KUYRUK = k; }
      KUYRUK[son++] = i;
    }
  }
  const yay = (n, l) => {
    const id = Q[n];
    if (OPAK[id] || LAV[id]) return;
    const nl = SIVI[id] ? l - 2 : l - 1;
    if (nl > L[n]) {
      L[n] = nl;
      if (nl > 1) { if (son >= KUYRUK.length) { const k = new Int32Array(KUYRUK.length * 2); k.set(KUYRUK.subarray(0, son)); KUYRUK = k; } KUYRUK[son++] = n; }
    }
  };
  while (bas < son) {
    const i = KUYRUK[bas++], l = L[i];
    if (l < 2) continue;
    const x = i % IW, z = ((i / IW) | 0) % IW, y = (i / IWY) | 0;
    if (x > 0) yay(i - 1, l); if (x < IW - 1) yay(i + 1, l);
    if (z > 0) yay(i - IW, l); if (z < IW - 1) yay(i + IW, l);
    if (y > 0) yay(i - IWY, l); if (y < H - 1) yay(i + IWY, l);
  }
  return L;
}

export function meshle(Q, H = PY, ton = null) {
  PH = H; TON = ton;
  /* Meshleme hacmi (1 blok kenarlı) ve gökyüzü ışığı */
  const P = new Uint16Array(DB * DB * PH), gok = new Float32Array(DB * DB * PH);
  const L = isikHesapla(Q, H), o = ISIK_PAY - 1;
  for (let y = 0; y < PH; y++) for (let z = 0; z < DB; z++) {
    const q = (y * IW + z + o) * IW + o, d = (y * DB + z) * DB;
    for (let x = 0; x < DB; x++) { P[d + x] = Q[q + x]; gok[d + x] = ISIK_EGRI[L[q + x]]; }
  }
  const op = new Tampon(), su = new Tampon();
  let ustY = 0;
  for (let y = PH - 1; y >= 0 && !ustY; y--) for (let z = 0; z < PB && !ustY; z++) for (let x = 0; x < PB; x++) if (P[ddizin(x, y, z)]) { ustY = y; break; }

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
    else if (ciz === C_SEKIL) { if (!GORUNMEZ[id]) sekil(P, gok, i, id, x, y, z, op); }   // 0.25.0: cihaz hücreleri ayrıca çizilir
  }
  return { opak: op.bitir(), su: su.bitir() };
}

function kup(P, gok, i, id, x, y, z, T) {
  for (let f = 0; f < 6; f++) {
    const Y = YUZLER[f];
    let ni = i + Y.komsu, n;
    if (f === 2 && y === PH - 1) n = 0;
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
      if (n === 0 && f === 2 && y === PH - 1) { g = 1; gs = 1; }
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
      T.l.push(PARLAK[id] ? 1.6 + 0.35 * Y.g : YAPRAK[id] ? -AO_D[a] * Y.g : AO_D[a] * Y.g, g / gs);
      tonEkle(T, f === 2 && TON_CIM[id] ? 1 : TON_YAPRAK[id] ? 2 : 0, x, z, k[0], k[2]);
    }
    T.n += 4;
    if (ao[0] + ao[2] < ao[1] + ao[3]) T.i.push(tabanN + 1, tabanN + 2, tabanN + 3, tabanN + 1, tabanN + 3, tabanN);
    else T.i.push(tabanN, tabanN + 1, tabanN + 2, tabanN, tabanN + 2, tabanN + 3);
  }
}

/* Biçimli bloklar: her kutunun yüzleri; hücre sınırındaki yüzler opak komşu varsa çizilmez.
   Doku koordinatı kutunun hücredeki konumundan alınır (yarım blokta dokunun yarısı görünür). */
/* Komşular: 0-3 yanlar, 4-7 yanların bir üstü, 8-11 yanların bir altı, 12 üst, 13 alt (0.20.0: basamaklanan tel için) */
const KOMSU_OFS = [-DZ, DX, DZ, -DX, -DZ + DY, DX + DY, DZ + DY, -DX + DY, -DZ - DY, DX - DY, DZ - DY, -DX - DY, DY, -DY];
const UVF = [
  (x, y, z) => [1 - z, y], (x, y, z) => [z, y], (x, y, z) => [x, 1 - z],
  (x, y, z) => [x, z], (x, y, z) => [x, y], (x, y, z) => [1 - x, y]
];
function sekil(P, gok, i, id, x, y, z, T) {
  const kutular = sekilKutulari(id, f => P[i + KOMSU_OFS[f]]);
  for (const k of kutular) {
    for (let f = 0; f < 6; f++) {
      const Y = YUZLER[f];
      const eks = Y.n[0] ? 0 : Y.n[1] ? 1 : 2, pozitif = Y.n[eks] > 0;
      const sinirda = pozitif ? k[eks + 3] >= 1 : k[eks] <= 0;
      let g = gok[i];
      if (sinirda) {
        if (f === 3 && y === 0) continue;
        const n = f === 2 && y === PH - 1 ? 0 : P[i + Y.komsu];
        if (OPAK[n]) continue;
        if (n === id && AYNI_GIZLE[id]) continue;
        g = Math.max(g, gok[i + Y.komsu] || 0);
      }
      const doku = k.length > 6 ? (typeof k[6] === 'number' ? k[6] : k[6][f]) : YUZ_DOKU[id * 6 + f];   // 0.37.0: yüz başına doku
      const b = T.n;
      for (let c = 0; c < 4; c++) {
        const kc = Y.k[c];
        const px = kc[0] ? k[3] : k[0], py = kc[1] ? k[4] : k[1], pz = kc[2] ? k[5] : k[2];
        T.p.push(x + px, y + py, z + pz);
        const uv = UVF[f](px, py, pz);
        dokuUV(doku, uv[0], uv[1], T.u);
        T.l.push(PARLAK[id] ? 1.6 + 0.35 * Y.g : Y.g * (sinirda ? 1 : 0.92), g);
        T.t.push(0, 0, 0);
      }
      T.n += 4;
      T.i.push(b, b + 1, b + 2, b, b + 2, b + 3);
    }
  }
}

/* 0.23.0: rüzgârda salınan bloklar: yapraklar ve çapraz çizilen bitkiler (meşale ve ateş hariç) */
const YAPRAK = new Uint8Array(BLOK_UST), SALLANIR = new Uint8Array(BLOK_UST);
const GORUNMEZ = new Uint8Array(BLOK_UST);
for (const b of BLOKLAR) if (b && b.gorunmez) GORUNMEZ[b.id] = 1;
for (const b of BLOKLAR) if (b) {
  const d = Array.isArray(b.dok) ? b.dok.join(' ') : typeof b.dok === 'object' && b.dok ? Object.values(b.dok).join(' ') : String(b.dok || '');
  if (/yaprak/.test(d) && b.cizim === C_KUP) YAPRAK[b.id] = 1;
  if (b.cizim === C_CAPRAZ && !b.mesale && !b.sivi) SALLANIR[b.id] = 1;
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
        T.l.push(k[1] && SALLANIR[id] ? -1.92 : 0.92, g);
        tonEkle(T, TON_CIM[id] ? 1 : 0, x, z, k[0] > 0.5 ? 1 : 0, k[2] > 0.5 ? 1 : 0);
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
  const ustSivi = y < PH - 1 && ayni(P[i + DY]);
  const h = ustSivi ? 1 : 0.875;
  /* 0.30.5: su yüzeyi köşe yükseklikleri: köşeyi paylaşan dört hücrenin su seviyesinin ortalaması (akan su eğimli görünür) */
  const kose = [];
  if (!lav && !ustSivi) for (let kz = 0; kz <= 1; kz++) for (let kx = 0; kx <= 1; kx++) {
    let top = 0, n = 0, dolu = false;
    for (let dz = kz - 1; dz <= kz; dz++) for (let dx = kx - 1; dx <= kx; dx++) {
      const j = i + dx * DX + dz * DZ, id = P[j], L = SU_SEVIYE[id];
      if (L) { if (y < PH - 1 && SU_SEVIYE[P[j + DY]]) dolu = true; top += L >= 8 ? 0.875 : L / 8 * 0.875; n++; }
      else if (!OPAK[id] && CIZIM[id] !== C_KUP && !LAV[id]) n++;
    }
    kose[kz * 2 + kx] = dolu ? 1 : n ? Math.max(0.06, top / n) : h;
  }
  const yuk = (kx, kz) => (kose.length ? kose[kz * 2 + kx] : h);
  for (let f = 0; f < 6; f++) {
    const Y = YUZLER[f];
    const ni = i + Y.komsu;
    if (f === 3 && y === 0) continue;
    const n = (f === 2 && y === PH - 1) ? 0 : P[ni];
    if (ayni(n) || OPAK[n]) continue;
    if (f !== 2 && CIZIM[n] === C_KUP && !SIVI[n] && KESIK[n] === 0) continue;
    const doku = YUZ_DOKU[(lav ? 59 : 7) * 6 + f];
    const b = T.n;
    const g = f === 2 ? 1 : (gok[ni] || gok[i]);
    for (let c = 0; c < 4; c++) {
      const k = Y.k[c];
      T.p.push(x + k[0], y + k[1] * yuk(k[0], k[2]), z + k[2]);
      dokuUV(doku, Y.uv[c][0], Y.uv[c][1], T.u);
      if (lav) T.l.push(1.6 + 0.4 * Y.g, 1); else T.l.push(Y.g, g);
      tonEkle(T, lav ? 0 : 3, x, z, k[0], k[2]);
    }
    T.n += 4;
    T.i.push(b, b + 1, b + 2, b, b + 2, b + 3);
    /* Su yüzeyi alttan da görünsün */
    if (f === 2 && !lav) {
      const b2 = T.n;
      for (let c = 3; c >= 0; c--) {
        const k = Y.k[c];
        T.p.push(x + k[0], y + k[1] * yuk(k[0], k[2]), z + k[2]);
        dokuUV(doku, Y.uv[c][0], Y.uv[c][1], T.u);
        T.l.push(0.8, g);
        tonEkle(T, 3, x, z, k[0], k[2]);
      }
      T.n += 4;
      T.i.push(b2, b2 + 1, b2 + 2, b2, b2 + 2, b2 + 3);
    }
  }
}
