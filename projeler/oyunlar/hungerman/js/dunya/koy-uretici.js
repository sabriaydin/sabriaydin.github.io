/* HungerMan - köy üretimi
   Dünya 384 x 384 bloklu bölgelere ayrılır; her bölgede tohuma göre en fazla bir köy kurulur.
   Köyün yerleşimi (kuyu, yollar, binalar, köylüler) yalnızca tohumdan hesaplanır; bu yüzden işçide
   parça parça yazılan yapılar ile ana iş parçacığında bilinen köy bilgisi her zaman aynıdır.
   Kıyıya yakın köylerde iskele, deniz feneri, balıkçı kulübesi ve tekneleriyle bir liman bulunur. */
import { PB, PY, DENIZ, dizin } from '../sabitler.js';
import { karistir, uretec } from '../rastgele.js';

export const KOY_BOLGE = 384;
const KENAR = 80;
const UYGUN = new Set([10, 8, 9, 7, 6]); // çayır, orman, huş, çöl, tayga (BY değerleri)

const ON_EK = ['Kara', 'Ak', 'Yeşil', 'Taş', 'Çam', 'Kum', 'Güneş', 'Ilık', 'Değirmen', 'Göl', 'Kızıl', 'Bayır', 'Elma', 'Söğüt', 'Çınar', 'Pınar', 'Sarı', 'Yel', 'Ova', 'Kaya'];
const SON_EK = ['köy', 'ova', 'dere', 'tepe', 'pınar', 'yayla', 'bük', 'kaya', 'yurt', 'bağ', 'alan', 'kent'];
const ERKEK = ['Ahmet', 'Mehmet', 'Hasan', 'Ali', 'Mustafa', 'Hüseyin', 'İbrahim', 'Osman', 'Yusuf', 'Murat', 'Kemal', 'Halil', 'Ramazan', 'Selim', 'Kadir', 'Recep', 'Emin', 'Cemal', 'Rıza', 'Şükrü'];
const KADIN = ['Ayşe', 'Fatma', 'Emine', 'Hatice', 'Zeynep', 'Elif', 'Meryem', 'Şerife', 'Zehra', 'Hacer', 'Esra', 'Selin', 'Derya', 'Gülsüm', 'Nuriye', 'Saadet', 'Havva', 'Sevim', 'Nazlı', 'Dilek'];
export const MESLEK_ADI = { ciftci: 'Çiftçi', kasap: 'Kasap', demirci: 'Demirci', oduncu: 'Oduncu', sifaci: 'Şifacı', avci: 'Avcı', balikci: 'Balıkçı' };
const MARJ = 128;   // köy ve limanın bölge dışına taşabileceği en büyük mesafe

const BOYUT = { ev_kucuk: [5, 5], ev_buyuk: [7, 7], demirci: [7, 5], ciftlik: [9, 7], tezgah: [3, 3], kulube: [5, 5], fener: [5, 5] };
const YON = [[1, 0], [0, 1], [-1, 0], [0, -1]];

/* Yerel bina koordinatından dünya koordinatına (f: kapının baktığı yön 0 -z, 1 +x, 2 +z, 3 -x) */
function donustur(b, lx, lz) {
  const ux = lx - (b.w - 1) / 2, uz = lz - (b.d - 1) / 2;
  switch (b.f) {
    case 0: return [b.x + ux, b.z + uz];
    case 1: return [b.x - uz, b.z + ux];
    case 2: return [b.x - ux, b.z - uz];
    default: return [b.x + uz, b.z - ux];
  }
}
const yonF = (px, pz) => (pz < 0 ? 0 : px > 0 ? 1 : pz > 0 ? 2 : 3);

export function koyBul(u, rx, rz) {
  const k = rx + ',' + rz;
  if (!u.koyOnbellek) u.koyOnbellek = new Map();
  if (u.koyOnbellek.has(k)) return u.koyOnbellek.get(k);
  const sonuc = koyKur(u, rx, rz);
  u.koyOnbellek.set(k, sonuc);
  return sonuc;
}

function koyKur(u, rx, rz) {
  const k = koyKur0(u, rx, rz, null);
  if (k) return k;
  /* Köy kurulmayan kıyı bölgelerinde limanlı bir balıkçı köyü aranır */
  const r = uretec(karistir(u.tohum ^ Math.imul(rx, 0x7feb352d) ^ Math.imul(rz, 0x846ca68b) ^ 0x6b6979));
  if (r() > 0.8) return null;
  for (let i = 0; i < 14; i++) {
    const x = rx * KOY_BOLGE + KENAR + Math.floor(r() * (KOY_BOLGE - 2 * KENAR));
    const z = rz * KOY_BOLGE + KENAR + Math.floor(r() * (KOY_BOLGE - 2 * KENAR));
    const o = u.kolon(x, z, {});
    if (o.h < DENIZ + 2 || o.h > DENIZ + 14 || o.c < 0.07 || o.c > 0.2 || !UYGUN.has(o.b)) continue;
    const q = koyKur0(u, rx, rz, { x, z });
    if (q && q.liman) return q;
  }
  return null;
}

function koyKur0(u, rx, rz, yer) {
  const r = uretec(karistir(u.tohum ^ Math.imul(rx, 0x51ed27) ^ Math.imul(rz, 0x2c1b3c6d) ^ 0x6b6f79));
  if (r() > 0.6 && !yer) return null;
  let x = rx * KOY_BOLGE + KENAR + Math.floor(r() * (KOY_BOLGE - 2 * KENAR));
  let z = rz * KOY_BOLGE + KENAR + Math.floor(r() * (KOY_BOLGE - 2 * KENAR));
  if (yer) { x = yer.x; z = yer.z; }
  const o = u.kolon(x, z, {});
  if (!UYGUN.has(o.b) || o.h < DENIZ + 2 || o.h > DENIZ + 30 || o.c < 0.07) return null;
  for (const [dx, dz] of [[24, 0], [-24, 0], [0, 24], [0, -24]]) { const q = u.kolon(x + dx, z + dz, {}); if (q.h < DENIZ || Math.abs(q.h - o.h) > 14) return null; }
  const stil = o.b === 7 ? 'col' : o.b === 6 ? 'tayga' : 'mese';
  const on = ON_EK[Math.floor(r() * ON_EK.length)];
  let son = SON_EK[Math.floor(r() * SON_EK.length)];
  if (on.toLocaleLowerCase('tr') === son) son = 'köy';
  const ad = on + son;
  const koy = { id: rx + ',' + rz, rx, rz, x, z, y: o.h, ad, stil, binalar: [], yollar: [], lambalar: [], koylular: [], yaricap: 0 };
  /* Kuyu ve meydan */
  koy.binalar.push({ tur: 'kuyu', x, z, w: 5, d: 5, f: 0, y: o.h });
  for (let dz = -4; dz <= 4; dz++) for (let dx = -4; dx <= 4; dx++) if (Math.abs(dx) > 2 || Math.abs(dz) > 2) koy.yollar.push([x + dx, z + dz]);
  /* Dört yönde yol ve yol boyunca binalar */
  const turler = [], uzun = [];
  let enUzun = 0;
  for (let yi = 0; yi < 4; yi++) {
    const [ax, az] = YON[yi];
    const L = 20 + Math.floor(r() * 18);
    enUzun = Math.max(enUzun, L); uzun[yi] = L;
    for (let t = 5; t <= L; t++) for (let p = -1; p <= 1; p++) koy.yollar.push([x + ax * t - az * p, z + az * t + ax * p]);
    for (const t of [9, 20, 31]) {
      if (t + 3 > L) break;
      for (const s of [-1, 1]) {
        if (r() > 0.78) continue;
        let tur;
        const q = r();
        if (!turler.includes('demirci') && q < 0.25) tur = 'demirci';
        else if (q < 0.5) tur = 'ev_kucuk';
        else if (q < 0.7) tur = 'ev_buyuk';
        else if (q < 0.87) tur = 'ciftlik';
        else tur = 'tezgah';
        const [w, d] = BOYUT[tur];
        const px = -az * s, pz = ax * s;              // yol eksenine dik yön
        const uz = 3 + (d - 1) / 2;
        const bx = x + ax * t + px * uz, bz = z + az * t + pz * uz;
        const bo = u.kolon(bx, bz, {});
        if (bo.h < DENIZ + 1) continue;
        let egim = 0;
        for (const [cx, cz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) egim = Math.max(egim, Math.abs(u.kolon(bx + cx * (w >> 1), bz + cz * (d >> 1), {}).h - bo.h));
        if (egim > 5) continue;
        const b = { tur, x: bx, z: bz, w, d, f: yonF(-px, -pz), y: bo.h };
        const [kx, kz] = donustur(b, (w - 1) / 2, -1);
        b.kapi = { x: kx, y: bo.h + 1, z: kz };
        koy.binalar.push(b); turler.push(tur);
      }
    }
    /* Fener direkleri */
    for (const t of [14, 26]) if (t < L) { const s = (yi + t) % 2 ? 1 : -1; koy.lambalar.push([x + ax * t - az * 2 * s, z + az * t + ax * 2 * s]); }
  }
  koy.yaricap = enUzun + 10;
  limanKur(u, koy, uzun);
  /* Köylüler */
  const isim = () => (r() < 0.5 ? ERKEK : KADIN)[Math.floor(r() * 20)];
  const genel = ['ciftci', 'oduncu', 'avci', 'sifaci', 'kasap'];
  koy.binalar.forEach((b, bi) => {
    let meslekler = [];
    if (b.tur === 'ev_kucuk') meslekler = [genel[Math.floor(r() * genel.length)]];
    else if (b.tur === 'ev_buyuk') meslekler = [genel[Math.floor(r() * genel.length)], genel[Math.floor(r() * genel.length)]];
    else if (b.tur === 'demirci') meslekler = ['demirci'];
    else if (b.tur === 'ciftlik') meslekler = ['ciftci'];
    else if (b.tur === 'tezgah') meslekler = [r() < 0.5 ? 'kasap' : 'sifaci'];
    else if (b.tur === 'kulube') meslekler = ['balikci'];
    for (const m of meslekler) if (koy.koylular.length < 12 || m === 'demirci' || m === 'balikci') koy.koylular.push({ idx: koy.koylular.length, meslek: m, ad: isim(), bina: bi, kapi: b.kapi });
  });
  if (koy.koylular.length < 3) return null;
  koy.bbox = [x - koy.yaricap, z - koy.yaricap, x + koy.yaricap, z + koy.yaricap];
  if (koy.liman) { const L = koy.liman.kutu; koy.bbox = [Math.min(koy.bbox[0], L[0]), Math.min(koy.bbox[1], L[1]), Math.max(koy.bbox[2], L[2]), Math.max(koy.bbox[3], L[3])]; }
  return koy;
}

function yolDuzle(kol, nokta, t0, ts) {
  const y = [];
  for (let t = t0; t <= ts; t++) y.push(kol(...nokta(t, 0)).h);
  y[y.length - 1] = Math.max(DENIZ, Math.min(y[y.length - 1], DENIZ + 1));
  for (let i = 1; i < y.length; i++) y[i] = Math.min(y[i], y[i - 1] + 1);
  for (let i = y.length - 2; i >= 0; i--) y[i] = Math.min(y[i], y[i + 1] + 1);
  return y;
}

/* Liman: köyün yollarından biri kıyıya yakınsa yol kıyıya uzatılır, denize iskele kurulur.
   Ayrı bir rastgele dizisi kullanır; böylece köyün geri kalanı limandan etkilenmez. */
function limanKur(u, koy, uzun) {
  const r = uretec(karistir(u.tohum ^ Math.imul(koy.rx, 0x2545f491) ^ Math.imul(koy.rz, 0x1b873593) ^ 0x6c696d));
  const kol = (x, z) => u.kolon(x, z, {});
  let en = null;
  for (let yi = 0; yi < 4; yi++) {
    const [ax, az] = YON[yi];
    const nokta = (t, p) => [koy.x + ax * t - az * p, koy.z + az * t + ax * p];
    let ts = -1;
    for (let t = uzun[yi] + 1; t <= 104; t++) if (kol(...nokta(t, 0)).h < DENIZ) { ts = t - 1; break; }
    if (ts < uzun[yi] + 3 || kol(...nokta(ts, 0)).h > DENIZ + 8) continue;
    /* Yol en fazla altı blok derinliğe kadar kazılabilir */
    const yy = yolDuzle(kol, nokta, uzun[yi], ts);
    let derin = 0;
    for (let t = uzun[yi]; t <= ts; t++) derin = Math.max(derin, kol(...nokta(t, 0)).h - yy[t - uzun[yi]]);
    if (derin > 6) continue;
    const P = 11 + Math.floor(r() * 6);
    let tamam = true;
    for (let t = ts + 1; t <= ts + P + 5 && tamam; t++) {
      if (kol(...nokta(t, 0)).h >= DENIZ) tamam = false;
      if (t >= ts + 3) for (const p of [-3, 3]) if (kol(...nokta(t, p)).h >= DENIZ) tamam = false;
    }
    if (!tamam || kol(...nokta(ts + P, 0)).h > DENIZ - 3) continue;
    if (!en || ts < en.ts) en = { yi, ts, P };
  }
  if (!en) return;
  const { yi, ts, P } = en, [ax, az] = YON[yi], px = -az, pz = ax;
  const nokta = (t, p) => [koy.x + ax * t + px * p, koy.z + az * t + pz * p];
  /* Yol kıyıya kadar uzar. Yükseklikler iki geçişte düzlenir: art arda iki sütun arasında en fazla bir blok fark kalır
     (yol yalnızca kazılır, doldurulmaz); kıyıdaki son sütun iskele seviyesindedir. */
  const t0 = uzun[yi], yolY = yolDuzle(kol, nokta, t0, ts);
  const liman = { yi, ts, P, ax, az, x: koy.x, z: koy.z, t0, yolY, tekneler: [] };
  /* Deniz feneri ve balıkçı kulübesi yolun iki yanında */
  const s = r() < 0.5 ? 1 : -1;
  const yerlestir = (tur, adaylar) => {
    for (const [t, p] of adaylar) {
      const [bx, bz] = nokta(t, p), [w, d] = BOYUT[tur];
      const bo = kol(bx, bz);
      if (bo.h < DENIZ) continue;
      let egim = 0, su = false;
      for (const [cx, cz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const h = kol(bx + cx * 2, bz + cz * 2).h; egim = Math.max(egim, Math.abs(h - bo.h)); if (h < DENIZ - 2) su = true; }
      if (egim > 3 || su) continue;
      if (koy.binalar.some(b => Math.abs(b.x - bx) < (Math.max(b.w, b.d) + w) / 2 + 1 && Math.abs(b.z - bz) < (Math.max(b.w, b.d) + d) / 2 + 1)) continue;
      const sp = Math.sign(p);
      const b = { tur, x: bx, z: bz, w, d, f: yonF(-px * sp, -pz * sp), y: Math.max(bo.h, DENIZ) };
      const [kx, kz] = donustur(b, (w - 1) / 2, -1);
      b.kapi = { x: kx, y: b.y + 1, z: kz };
      koy.binalar.push(b);
      return b;
    }
    return null;
  };
  liman.fener = yerlestir('fener', [[ts - 3, 5 * s], [ts - 3, -5 * s], [ts - 8, 5 * s], [ts - 8, -5 * s]]);
  liman.kulube = yerlestir('kulube', [[ts - 4, -5 * s], [ts - 10, -5 * s], [ts - 10, 5 * s], [ts - 15, -5 * s], [ts - 15, 5 * s]]);
  /* Tekneler iskelenin yanında demirli */
  const yaw = Math.atan2(-ax, -az);
  const suMu = (t, p) => [[0, 0], [-2, 0], [2, 0], [0, -1], [0, 1]].every(([dt, dp]) => kol(...nokta(t + dt, p + dp)).h < DENIZ - 1);
  const tekneKoy = (tur, adaylar, adet) => {
    for (const [t, p] of adaylar) {
      if (!adet) break;
      if (!suMu(t, p) || liman.tekneler.some(o => Math.hypot(o.t - t, o.p - p) < 3.5)) continue;
      const [bx, bz] = nokta(t, p);
      liman.tekneler.push({ tur, x: bx + 0.5, z: bz + 0.5, yaw, t, p });
      adet--;
    }
  };
  tekneKoy('sandal', [[ts + 4, 5 * s], [ts + 4, -5 * s], [ts + 7, -5 * s], [ts + 7, 5 * s], [ts + P + 3, -3], [ts + P + 3, 3]], 2);
  tekneKoy('yelkenli', [[ts + P - 1, -7 * s], [ts + P - 1, 7 * s], [ts + P + 5, 0], [ts + P + 4, -6 * s]], 1);
  const uclar = [nokta(uzun[yi], -8), nokta(uzun[yi], 8), nokta(ts + P + 6, -8), nokta(ts + P + 6, 8)];
  liman.kutu = [Math.min(...uclar.map(a => a[0])), Math.min(...uclar.map(a => a[1])), Math.max(...uclar.map(a => a[0])), Math.max(...uclar.map(a => a[1]))];
  /* İskelenin başlangıcı (pusula işareti için) */
  [liman.iskeleX, liman.iskeleZ] = nokta(ts + 1, 0);
  koy.liman = liman;
}

/* Verilen alanla kesişen köyler */
export function koylerAlan(u, x0, z0, x1, z1) {
  const out = [];
  for (let rz = Math.floor((z0 - MARJ) / KOY_BOLGE); rz <= Math.floor((z1 + MARJ) / KOY_BOLGE); rz++)
    for (let rx = Math.floor((x0 - MARJ) / KOY_BOLGE); rx <= Math.floor((x1 + MARJ) / KOY_BOLGE); rx++) {
      const k = koyBul(u, rx, rz);
      if (k && k.bbox[2] >= x0 && k.bbox[0] <= x1 && k.bbox[3] >= z0 && k.bbox[1] <= z1) out.push(k);
    }
  return out;
}
export function koyIcinde(u, x, z, pay = 4) {
  const k = koyBul(u, Math.floor(x / KOY_BOLGE), Math.floor(z / KOY_BOLGE));
  if (k && Math.max(Math.abs(x - k.x), Math.abs(z - k.z)) < k.yaricap + pay) return true;
  /* Liman şeridi (yol, fener, kulübe) komşu bölgeye taşabilir */
  for (const o of koylerAlan(u, x, z, x, z)) {
    const L = o.liman && o.liman.kutu;
    if (L && x >= L[0] - pay && x <= L[2] + pay && z >= L[1] - pay && z <= L[3] + pay) return true;
  }
  return false;
}

/* ---------- Parçaya yazma ---------- */
const MALZEME = {
  mese: { kalas: 14, kutuk: 8, cati: 51, taban: 14, temel: 15 },
  tayga: { kalas: 38, kutuk: 10, cati: 38, taban: 38, temel: 15 },
  col: { kalas: 24, kutuk: 24, cati: 37, taban: 24, temel: 24 }
};
const BOS = new Set([0, 7, 9, 11, 13, 25, 26, 27, 28, 29, 30, 36, 40, 41, 42, 43, 44]);
const SU_ICI = new Set([7, 31, 65, 66, 67, 68]);

export function koyYaz(u, v, x0, z0) {
  const koylar = koylerAlan(u, x0 - 8, z0 - 8, x0 + PB + 8, z0 + PB + 8);
  if (!koylar.length) return;
  const ic = (x, z) => x >= x0 && x < x0 + PB && z >= z0 && z < z0 + PB;
  const set = (x, y, z, id) => { if (ic(x, z) && y > 0 && y < PY) v[dizin(x - x0, y, z - z0)] = id; };
  const al = (x, y, z) => (ic(x, z) && y >= 0 && y < PY ? v[dizin(x - x0, y, z - z0)] : -1);
  for (const k of koylar) {
    const M = MALZEME[k.stil];
    /* Yollar ve meydan */
    for (const [x, z] of k.yollar) {
      if (!ic(x, z)) continue;
      const g = u.kolon(x, z, {}).h;
      if (g < DENIZ) { set(x, DENIZ, z, M.kalas); for (let y = DENIZ + 1; y <= DENIZ + 3; y++) set(x, y, z, 0); continue; }
      set(x, g, z, k.stil === 'col' ? 5 : 57);
      for (let y = g + 1; y <= g + 4; y++) set(x, y, z, 0);
      for (let y = g - 1; y > g - 6 && BOS.has(al(x, y, z)); y--) set(x, y, z, 3);
    }
    if (k.liman) limanYaz(u, k, M, set, al, ic);
    /* Fener direkleri */
    for (const [x, z] of k.lambalar) {
      if (!ic(x, z)) continue;
      const g = u.kolon(x, z, {}).h;
      if (g < DENIZ) continue;
      for (let y = 1; y <= 3; y++) set(x, g + y, z, M.kutuk);
      set(x, g + 4, z, 46);
    }
    /* Binalar */
    for (const b of k.binalar) {
      const r = Math.max(b.w, b.d) / 2 + 2;
      if (b.x + r < x0 || b.x - r >= x0 + PB || b.z + r < z0 || b.z - r >= z0 + PB) continue;
      binaYaz(b, M, set, al, k);
      /* Kapı önü */
      if (b.kapi && ic(b.kapi.x, b.kapi.z)) { set(b.kapi.x, b.y, b.kapi.z, k.stil === 'col' ? 5 : 57); for (let y = 1; y <= 3; y++) set(b.kapi.x, b.y + y, b.kapi.z, 0); }
    }
  }
}

function binaYaz(b, M, set, al, k) {
  const y0 = b.y;
  const L = (lx, ly, lz, id) => { const [x, z] = donustur(b, lx, lz); set(x, y0 + ly, z, id); };
  const LA = (lx, ly, lz) => { const [x, z] = donustur(b, lx, lz); return al(x, y0 + ly, z); };
  const tasma = b.tur === 'kuyu' || b.tur === 'ciftlik' || b.tur === 'tezgah' || b.tur === 'fener' ? 0 : 1;
  /* Alanı temizle ve temel at */
  for (let lz = -tasma; lz < b.d + tasma; lz++) for (let lx = -tasma; lx < b.w + tasma; lx++) {
    for (let ly = 1; ly <= 9; ly++) L(lx, ly, lz, 0);
    if (lx >= 0 && lx < b.w && lz >= 0 && lz < b.d) {
      L(lx, 0, lz, M.taban);
      for (let ly = -1; ly > -12; ly--) { const q = LA(lx, ly, lz); if (q === -1 || !BOS.has(q)) break; L(lx, ly, lz, M.temel); }
    }
  }
  const w = b.w, d = b.d, ox = (w - 1) / 2;
  if (b.tur === 'kuyu') {
    for (let lz = 0; lz < 5; lz++) for (let lx = 0; lx < 5; lx++) {
      const kenar = lx === 0 || lz === 0 || lx === 4 || lz === 4;
      if (kenar) { L(lx, 0, lz, 15); L(lx, 1, lz, (lx === 0 || lx === 4) && (lz === 0 || lz === 4) ? M.kutuk : 15); }
      else { for (let ly = -3; ly <= 0; ly++) L(lx, ly, lz, 7); L(lx, -4, lz, 15); }
    }
    for (const [lx, lz] of [[0, 0], [4, 0], [0, 4], [4, 4]]) for (let ly = 2; ly <= 3; ly++) L(lx, ly, lz, M.kutuk);
    for (let lz = 0; lz < 5; lz++) for (let lx = 0; lx < 5; lx++) L(lx, 4, lz, M.cati);
    for (let lz = 1; lz < 4; lz++) for (let lx = 1; lx < 4; lx++) L(lx, 5, lz, M.cati);
    return;
  }
  if (b.tur === 'ciftlik') {
    for (let lz = 0; lz < d; lz++) for (let lx = 0; lx < w; lx++) {
      const kenar = lx === 0 || lz === 0 || lx === w - 1 || lz === d - 1;
      if (kenar) { if (!(lz === 0 && lx === ox)) L(lx, 0, lz, M.kutuk); else L(lx, 0, lz, 57); }
      else if (lz === (d - 1) / 2) L(lx, 0, lz, 7);
      else { L(lx, 0, lz, 138); L(lx, 1, lz, lz < (d - 1) / 2 ? 56 : (lx % 3 === 0 ? 136 : 132)); }   // ıslak tarla: buğday, havuç ve patates
    }
    L(w - 1, 1, d - 1, 52); L(w - 1, 2, d - 1, 52); L(w - 2, 1, d - 1, 52);
    return;
  }
  if (b.tur === 'tezgah') {
    for (const [lx, lz] of [[0, 0], [2, 0], [0, 2], [2, 2]]) for (let ly = 1; ly <= 2; ly++) L(lx, ly, lz, M.kutuk);
    for (let lz = 0; lz < 3; lz++) for (let lx = 0; lx < 3; lx++) L(lx, 3, lz, 49);
    L(1, 1, 2, 32); L(2, 1, 1, 52);
    return;
  }
  if (b.tur === 'fener') { fenerYaz(L, M); return; }
  /* Ev, balıkçı kulübesi ve demirci: duvarlar */
  const duvar = b.tur === 'demirci' ? 35 : M.kalas;
  const kose = b.tur === 'demirci' ? 15 : M.kutuk;
  for (let lz = 0; lz < d; lz++) for (let lx = 0; lx < w; lx++) {
    const kenar = lx === 0 || lz === 0 || lx === w - 1 || lz === d - 1;
    if (!kenar) continue;
    const koseMi = (lx === 0 || lx === w - 1) && (lz === 0 || lz === d - 1);
    for (let ly = 1; ly <= 3; ly++) {
      if (b.tur === 'demirci' && lz === 0 && !koseMi) continue; // demircinin önü açık
      let id = koseMi ? kose : duvar;
      if (ly === 2 && !koseMi && ((lx === 0 || lx === w - 1) && lz === (d - 1) / 2 || lz === d - 1 && lx === ox) && b.tur !== 'demirci') id = 34;
      if (lz === 0 && lx === ox && ly <= 2) id = 0;
      L(lx, ly, lz, id);
    }
  }
  /* Çatı: kademeli piramit */
  if (b.tur === 'demirci') { for (let lz = 0; lz < d; lz++) for (let lx = 0; lx < w; lx++) L(lx, 4, lz, 37); }
  else for (let kat = 0; ; kat++) {
    const a = -1 + kat, bx = w - kat, bz = d - kat;
    if (a >= bx || a >= bz) break;
    for (let lz = a; lz < bz; lz++) for (let lx = a; lx < bx; lx++) L(lx, 4 + kat, lz, M.cati);
  }
  /* İç düzen */
  if (b.tur === 'ev_kucuk') { L(1, 1, d - 2, 47); L(w - 2, 1, d - 2, 50); L(w - 2, 1, 1, 46); }
  else if (b.tur === 'ev_buyuk') { L(1, 1, d - 2, 47); L(2, 1, d - 2, 47); L(w - 2, 1, d - 2, 50); L(w - 2, 1, 1, 32); L(1, 1, 1, 46); L(w - 2, 1, (d - 1) / 2, 33); }
  else if (b.tur === 'demirci') { L(1, 1, d - 2, 33); L(2, 1, d - 2, 33); L(w - 2, 1, d - 2, 50); L(w - 2, 1, 1, 32); L(ox, 1, d - 2, 46); }
  else if (b.tur === 'kulube') { L(1, 1, d - 2, 47); L(w - 2, 1, d - 2, 50); L(w - 2, 1, 1, 46); L(1, 1, 1, 52); L(1, 2, 1, 52); }
}

/* Deniz feneri: beyaz-kırmızı bantlı kule, içinde döner merdiven, tepede camlı ışık odası */
function fenerYaz(L, M) {
  for (let lz = 0; lz < 5; lz++) for (let lx = 0; lx < 5; lx++) for (let ly = 10; ly <= 17; ly++) L(lx, ly, lz, 0);
  const kenarMi = (lx, lz) => lx === 0 || lz === 0 || lx === 4 || lz === 4;
  const koseMi = (lx, lz) => (lx === 0 || lx === 4) && (lz === 0 || lz === 4);
  for (let ly = 1; ly <= 11; ly++) for (let lz = 0; lz < 5; lz++) for (let lx = 0; lx < 5; lx++) {
    if (!kenarMi(lx, lz)) continue;
    let id = koseMi(lx, lz) ? 37 : (Math.floor((ly - 1) / 3) % 2 ? 51 : 49);
    if (!koseMi(lx, lz) && (ly === 5 || ly === 9) && (lx === 2 || lz === 2)) id = 34;
    if (lz === 0 && lx === 2 && ly <= 2) id = 0;
    L(lx, ly, lz, id);
  }
  const hucre = [[3, 1], [3, 2], [3, 3], [2, 3], [1, 3], [1, 2], [1, 1], [2, 1]];
  for (let i = 0; i <= 10; i++) { const [lx, lz] = hucre[i % 8]; L(lx, 1 + i, lz, M.kalas); }
  for (let ly = 1; ly <= 12; ly++) L(2, ly, 2, 37);
  for (let lz = 0; lz < 5; lz++) for (let lx = 0; lx < 5; lx++) if (!(lx === 3 && lz === 3)) L(lx, 12, lz, 37);
  for (let ly = 13; ly <= 14; ly++) for (let lz = 0; lz < 5; lz++) for (let lx = 0; lx < 5; lx++) if (kenarMi(lx, lz)) L(lx, ly, lz, koseMi(lx, lz) ? M.kutuk : 34);
  for (let lz = 0; lz < 5; lz++) for (let lx = 0; lx < 5; lx++) L(lx, 15, lz, 51);
  for (let lz = 1; lz < 4; lz++) for (let lx = 1; lx < 4; lx++) L(lx, 16, lz, 51);
  L(2, 13, 2, 61);
}

/* Liman: kıyıya inen yol, iskele, direkler ve fenerler */
function limanYaz(u, k, M, set, al, ic) {
  const { ts, P, ax, az, t0, yolY } = k.liman, px = -az, pz = ax;
  const nokta = (t, p) => [k.x + ax * t + px * p, k.z + az * t + pz * p];
  const yol = k.stil === 'col' ? 5 : 57;
  for (let t = t0 + 1; t <= ts; t++) {
    const y = yolY[t - t0];
    for (let p = -1; p <= 1; p++) {
      const [x, z] = nokta(t, p);
      if (!ic(x, z)) continue;
      const h = u.kolon(x, z, {}).h;
      set(x, y, z, yol);
      for (let yy = y + 1; yy <= Math.max(h, y) + 4; yy++) set(x, yy, z, 0);
      for (let yy = y - 1; yy > y - 6 && BOS.has(al(x, yy, z)); yy--) set(x, yy, z, 3);
    }
  }
  for (let t = ts + 1; t <= ts + P; t++) {
    const uc = t >= ts + P - 2, gen = uc ? 3 : 1;
    for (let p = -gen; p <= gen; p++) {
      const [x, z] = nokta(t, p);
      if (!ic(x, z)) continue;
      set(x, DENIZ + 1, z, M.kalas);
      for (let y = DENIZ + 2; y <= DENIZ + 6; y++) set(x, y, z, 0);
      const direk = Math.abs(p) === gen && ((t - ts - 1) % 4 === 0 || t === ts + P || t === ts + P - 2);
      if (direk) for (let y = DENIZ; y > 0 && (SU_ICI.has(al(x, y, z)) || BOS.has(al(x, y, z))); y--) set(x, y, z, M.kutuk);
    }
  }
  for (const [t, p] of [[ts + 1, 1], [ts + P, -3], [ts + P, 3]]) {
    const [x, z] = nokta(t, p);
    if (!ic(x, z)) continue;
    set(x, DENIZ + 2, z, M.kutuk); set(x, DENIZ + 3, z, M.kutuk); set(x, DENIZ + 4, z, 46);
  }
}

/* Oyuncunun doğacağı köy: verilen noktaya en yakın köy */
export function enYakinKoy(u, x, z, bolgeYaricap = 3) {
  const rx0 = Math.floor(x / KOY_BOLGE), rz0 = Math.floor(z / KOY_BOLGE);
  let en = null, enD = Infinity;
  for (let rz = rz0 - bolgeYaricap; rz <= rz0 + bolgeYaricap; rz++) for (let rx = rx0 - bolgeYaricap; rx <= rx0 + bolgeYaricap; rx++) {
    const k = koyBul(u, rx, rz);
    if (!k) continue;
    const d = Math.hypot(k.x - x, k.z - z);
    if (d < enD) { enD = d; en = k; }
  }
  return en ? { koy: en, mesafe: enD } : null;
}
