/* HungerMan - özel yapılar (0.15.0): çöl tapınağı, orman tapınağı, buzul kulesi, haydut kampı
   Dünya YAPI_HUCRE x YAPI_HUCRE bloklu hücrelere ayrılır; her hücrede tohuma göre en fazla bir yapı bulunur.
   Yapı türü bulunduğu biyoma göre seçilir. Yapılar yerel koordinatlarla (merkez, taban yüksekliği, dört yönden birine dönük) çizilir.
   Bosslar ve haydutlar yapının bilgisindeki noktalarda oyun sırasında ortaya çıkar (oyun/yapilar.js). */
import { PB, PY, DENIZ, dizin } from '../sabitler.js';
import { karistir, uretec, karma3 } from '../rastgele.js';
import { BY, KARLI } from './uretici.js';
import { koyIcinde } from './koy-uretici.js';

export const YAPI_HUCRE = 288;
const YAYILMA = 14;
export const YAPI_ADI = { tapinak: 'Çöl Tapınağı', ormanTapinak: 'Orman Tapınağı', kule: 'Buzul Kulesi', kamp: 'Haydut Kampı' };
/* Yapı türüne göre yarıçap (yerleşim ve düzlük denetimi için) */
const YARICAP = { tapinak: 10, ormanTapinak: 7, kule: 4, kamp: 10 };
const YONLER = [[0, -1], [1, 0], [0, 1], [-1, 0]];

function turSec(o) {
  if (o.b === BY.COL) return 'tapinak';
  if (o.b === BY.ORMAN || o.b === BY.BATAKLIK) return 'ormanTapinak';
  if (KARLI.has(o.b) || (o.b === BY.DAG && o.te < -0.08)) return 'kule';
  if (o.b === BY.CAYIR || o.b === BY.SAVAN || o.b === BY.HUS) return 'kamp';
  return null;
}

export function yapiBul(u, gx, gz) {
  const k = gx + ',' + gz;
  if (!u.yapiOnbellek) u.yapiOnbellek = new Map();
  if (u.yapiOnbellek.has(k)) return u.yapiOnbellek.get(k);
  let Y = null;
  const r = uretec(karistir(u.tohum ^ Math.imul(gx, 0x5bd1e995) ^ Math.imul(gz, 0x27d4eb2f) ^ 0x796170));
  if (r() < 0.6) {
    for (let deneme = 0; deneme < 4 && !Y; deneme++) {
      const x = gx * YAPI_HUCRE + 40 + Math.floor(r() * (YAPI_HUCRE - 80));
      const z = gz * YAPI_HUCRE + 40 + Math.floor(r() * (YAPI_HUCRE - 80));
      const f = Math.floor(r() * 4);
      const o = u.kolon(x, z, {});
      const tur = turSec(o);
      if (!tur || o.h < DENIZ + 1 || o.c < 0.05) continue;
      const R = YARICAP[tur];
      if (o.h + (tur === 'kule' ? 27 : 13) >= PY - 1) continue;
      /* Düzlük ve su denetimi */
      let mn = o.h, mx = o.h, su = false;
      for (const [a, b] of [[-R, -R], [R, -R], [-R, R], [R, R], [0, -R], [0, R], [-R, 0], [R, 0], [-R / 2, -R / 2], [R / 2, R / 2], [-R / 2, R / 2], [R / 2, -R / 2]]) {
        const q = u.kolon(x + a, z + b, {});
        mn = Math.min(mn, q.h); mx = Math.max(mx, q.h);
        if (q.h < DENIZ) su = true;
      }
      if (su || mx - mn > (tur === 'kule' ? 9 : tur === 'tapinak' ? 9 : tur === 'kamp' ? 3 : 6)) continue;
      if (koyIcinde(u, x, z, R + 24)) continue;
      Y = { tur, x, z, y: o.h, f, R, anahtar: 'y' + gx + ',' + gz, tohum: (r() * 1e9) | 0 };
      yapiAyrinti(Y);
    }
  }
  u.yapiOnbellek.set(k, Y);
  return Y;
}

/* Yerel (merkeze göre, yöne döndürülmemiş) noktayı dünya koordinatına çevirir */
function don(Y, dx, dz) {
  switch (Y.f) {
    case 1: return [Y.x - dz, Y.z + dx];
    case 2: return [Y.x - dx, Y.z - dz];
    case 3: return [Y.x + dz, Y.z - dx];
    default: return [Y.x + dx, Y.z + dz];
  }
}
const yonDon = (Y, y) => (y + Y.f) % 4;

/* Sandıklar, boss ve haydut noktaları (dünya koordinatında) */
function yapiAyrinti(Y) {
  const b = Y.y, n = (dx, dy, dz) => { const [x, z] = don(Y, dx, dz); return [x, b + dy, z]; };
  Y.sandiklar = []; Y.boss = null; Y.haydutlar = [];
  if (Y.tur === 'tapinak') {
    Y.sandiklar.push(n(-8, 1, -8), n(8, 1, -8), n(-4, -15, 0), n(4, -15, 0), n(0, -15, 4), n(-3, -15, -4));
    Y.boss = { tur: 'firavun', p: n(0, -15, 3), yakin: 9, alt: b - 17, ust: b - 9 };
    Y.altY = b - 17; Y.ustY = b + 12;
  } else if (Y.tur === 'ormanTapinak') {
    Y.sandiklar.push(n(-3, -5, 3), n(3, -5, 3), n(0, -5, 3), n(-5, 1, -4));
    Y.altY = b - 7; Y.ustY = b + 11;
  } else if (Y.tur === 'kule') {
    Y.sandiklar.push(n(2, 1, 2), n(-2, 7, 2), n(2, 13, 2), n(-2, 19, 2), n(2, 19, 2));
    Y.boss = { tur: 'buzbuyucu', p: n(0, 19, 1), yakin: 8, alt: b + 16, ust: b + 26 };
    Y.altY = b - 1; Y.ustY = b + 26;
  } else if (Y.tur === 'kamp') {
    Y.sandiklar.push(n(0, 1, -7), n(-7, 1, 4));
    Y.boss = { tur: 'reis', p: n(0, 1, -4), yakin: 18, alt: b - 4, ust: b + 8 };
    Y.haydutlar = [n(3, 1, 3), n(-3, 1, 3), n(3, 1, -2), n(-3, 1, -2)];
    Y.altY = b - 2; Y.ustY = b + 8;
  }
}

export function yapilarAlan(u, x0, z0, x1, z1) {
  const out = [];
  for (let gz = Math.floor((z0 - YAYILMA) / YAPI_HUCRE); gz <= Math.floor((z1 + YAYILMA) / YAPI_HUCRE); gz++)
    for (let gx = Math.floor((x0 - YAYILMA) / YAPI_HUCRE); gx <= Math.floor((x1 + YAYILMA) / YAPI_HUCRE); gx++) {
      const Y = yapiBul(u, gx, gz);
      if (Y && Y.x + Y.R + 2 >= x0 && Y.x - Y.R - 2 <= x1 && Y.z + Y.R + 2 >= z0 && Y.z - Y.R - 2 <= z1) out.push(Y);
    }
  return out;
}

/* Bu konum bir yapının içinde mi (sandık ganimeti ve başarım için) */
export function yapiAt(u, x, y, z) {
  for (const Y of yapilarAlan(u, x, z, x, z)) if (Math.abs(x - Y.x) <= Y.R + 1 && Math.abs(z - Y.z) <= Y.R + 1 && y >= Y.altY && y <= Y.ustY) return Y;
  return null;
}

/* ---------- Çizim ---------- */
const BOS = new Set([0, 7, 9, 11, 13, 25, 26, 27, 30, 36, 43, 44, 141, 145, 146, 147, 148, 153]);
/* Yapının çevresinden kaldırılan ağaç parçaları (giriş ve duvarlar kapanmasın) */
const AGAC = new Set([8, 9, 10, 11, 12, 13, 144, 145, 147, 141]);

export function yapiYaz(u, v, x0, z0) {
  for (const Y of yapilarAlan(u, x0, z0, x0 + PB - 1, z0 + PB - 1)) {
    const ic = (x, z) => x >= x0 && x < x0 + PB && z >= z0 && z < z0 + PB;
    const b = Y.y;
    /* L: yerel koordinatla blok yazar; dy tabana göre */
    const L = (dx, dy, dz, id) => { const [x, z] = don(Y, dx, dz), y = b + dy; if (ic(x, z) && y > 0 && y < PY) v[dizin(x - x0, y, z - z0)] = id; };
    const A = (dx, dy, dz) => { const [x, z] = don(Y, dx, dz), y = b + dy; return ic(x, z) && y > 0 && y < PY ? v[dizin(x - x0, y, z - z0)] : -1; };
    /* Temel: zemin altındaki boşluklar doldurulur */
    const temel = (dx, dz, id, derin = 12) => { for (let dy = 0; dy >= -derin; dy--) { const a = A(dx, dy, dz); if (a === -1) return; if (dy < 0 && !BOS.has(a)) return; L(dx, dy, dz, id); } };
    const r = (dx, dy, dz) => karma3(Y.tohum, dx, dy, dz);
    const merdiven = (dx, dz, yon, y0, y1) => { for (let dy = y0; dy <= y1; dy++) L(dx, dy, dz, 110 + yonDon(Y, yon)); };
    for (let dz = -Y.R - 3; dz <= Y.R + 3; dz++) for (let dx = -Y.R - 3; dx <= Y.R + 3; dx++) for (let dy = 1; dy <= 16; dy++) if (AGAC.has(A(dx, dy, dz))) L(dx, dy, dz, 0);
    if (Y.tur === 'tapinak') tapinakYaz(L, temel, r, merdiven);
    else if (Y.tur === 'ormanTapinak') ormanYaz(L, A, temel, r, merdiven);
    else if (Y.tur === 'kule') kuleYaz(L, temel, r, merdiven);
    else if (Y.tur === 'kamp') kampYaz(L, temel, r);
    for (const [x, y, z] of Y.sandiklar) if (ic(x, z)) v[dizin(x - x0, y, z - z0)] = 50;
  }
}

/* Çöl tapınağı: basamaklı çatılı kum taşı salon, girişte ok tuzağı, ortadaki kuyudan inilen hazine odası (Firavun) */
function tapinakYaz(L, temel, r, merdiven) {
  const K = 24, S = 37, T = 115, M = 118;
  for (let dz = -10; dz <= 10; dz++) for (let dx = -10; dx <= 10; dx++) {
    temel(dx, dz, K);
    const kenar = Math.abs(dx) === 10 || Math.abs(dz) === 10;
    for (let dy = 1; dy <= 13; dy++) L(dx, dy, dz, 0);
    L(dx, 0, dz, (Math.abs(dx) + Math.abs(dz)) % 6 === 0 ? S : K);
    if (kenar) for (let dy = 1; dy <= 6; dy++) L(dx, dy, dz, dy === 4 ? T : dy === 5 && (dx + dz) % 2 === 0 ? M : K);
    /* Basamaklı çatı */
    const m = Math.max(Math.abs(dx), Math.abs(dz));
    if (m <= 10) L(dx, 7, dz, K);
    if (m <= 8) L(dx, 8, dz, K);
    if (m <= 6) L(dx, 9, dz, m === 6 ? T : K);
    if (m <= 4) L(dx, 10, dz, S);
    if (m <= 2) L(dx, 11, dz, K);
    if (m === 0) L(dx, 12, dz, T);
  }
  /* Giriş (güney) ve süslü kapı çerçevesi */
  for (let dx = -1; dx <= 1; dx++) for (let dy = 1; dy <= 3; dy++) L(dx, dy, 10, 0);
  for (const dx of [-2, 2]) for (let dy = 1; dy <= 5; dy++) L(dx, dy, 10, S);
  for (let dx = -2; dx <= 2; dx++) L(dx, 4, 10, T);
  /* Sütunlar */
  for (const [a, c] of [[-5, -5], [5, -5], [-5, 3], [5, 3]]) for (let dy = 1; dy <= 6; dy++) L(a, dy, c, dy === 3 ? T : K);
  /* Giriş koridoru ve ok tuzağı: tel basılınca yan duvarlardaki ok atıcılar ateş eder */
  for (const dx of [-2, 2]) for (let dz = 7; dz <= 9; dz++) for (let dy = 1; dy <= 3; dy++) L(dx, dy, dz, K);
  for (const dx of [-2, 2]) L(dx, 2, 8, 157);
  for (let dx = -1; dx <= 1; dx++) L(dx, 1, 8, 158);
  /* Meşaleler */
  for (const [a, c] of [[-8, 8], [8, 8], [-8, -2], [8, -2]]) L(a, 1, c, 46);
  /* Kuyu: 3 x 3 boşluk, kenarında siyah-mavi süs; kuzey duvarında tırmanma merdiveni */
  for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) {
    const kenar = Math.abs(dx) === 2 || Math.abs(dz) === 2;
    for (let dy = -10; dy <= 0; dy++) L(dx, dy, dz, kenar ? K : 0);
    if (kenar) L(dx, 0, dz, (dx + dz) % 2 ? 120 : M);
  }
  /* Hazine odası */
  for (let dz = -6; dz <= 6; dz++) for (let dx = -6; dx <= 6; dx++) {
    const kenar = Math.abs(dx) === 6 || Math.abs(dz) === 6;
    for (let dy = -16; dy <= -11; dy++) {
      let id = 0;
      if (dy === -16) id = Math.abs(dx) + Math.abs(dz) <= 2 ? T : (dx + dz) % 2 ? S : K;
      else if (dy === -11) id = Math.abs(dx) <= 1 && Math.abs(dz) <= 1 ? 0 : K;
      else if (kenar) id = dy === -13 ? T : K;
      L(dx, dy, dz, id);
    }
  }
  /* Merdivenin dayandığı direk ve merdiven */
  for (let dy = -15; dy <= -11; dy++) L(0, dy, -2, K);
  merdiven(0, -1, 0, -15, 0);
}

/* Orman tapınağı: yosunlu taş, sarmaşıklar; koridorda ve bodrumda ok tuzakları */
function ormanYaz(L, A, temel, r, merdiven) {
  const tas = (dx, dy, dz) => (r(dx, dy, dz) < 0.45 ? 60 : 15);
  for (let dz = -6; dz <= 6; dz++) for (let dx = -7; dx <= 7; dx++) {
    temel(dx, dz, 15);
    const kenar = Math.abs(dx) === 7 || Math.abs(dz) === 6;
    for (let dy = 1; dy <= 10; dy++) L(dx, dy, dz, 0);
    L(dx, 0, dz, tas(dx, 0, dz));
    if (kenar) for (let dy = 1; dy <= 5; dy++) L(dx, dy, dz, tas(dx, dy, dz));
    L(dx, 6, dz, tas(dx, 6, dz));
    /* Üst kat (kapalı, süs) */
    if (Math.abs(dx) <= 4 && Math.abs(dz) <= 3) {
      const k2 = Math.abs(dx) === 4 || Math.abs(dz) === 3;
      for (let dy = 7; dy <= 9; dy++) L(dx, dy, dz, k2 ? (dy === 8 && (dx === 0 || dz === 0) ? 0 : tas(dx, dy, dz)) : 0);
      L(dx, 10, dz, tas(dx, 10, dz));
    }
    /* Dış duvarlarda sarkan sarmaşıklar */
    if (kenar && r(dx, 99, dz) < 0.35) { const n = 1 + Math.floor(r(dx, 98, dz) * 4); const [ox, oz] = Math.abs(dx) === 7 ? [Math.sign(dx), 0] : [0, Math.sign(dz)]; for (let k = 0; k < n; k++) if (A(dx + ox, 5 - k, dz + oz) === 0) L(dx + ox, 5 - k, dz + oz, 147); }
  }
  /* Giriş */
  for (let dx = -1; dx <= 1; dx++) for (let dy = 1; dy <= 3; dy++) L(dx, dy, 6, 0);
  /* Koridor ve tuzak */
  for (const dx of [-2, 2]) for (let dz = -1; dz <= 5; dz++) for (let dy = 1; dy <= 3; dy++) L(dx, dy, dz, tas(dx, dy, dz));
  for (const dx of [-2, 2]) L(dx, 2, 2, 157);
  for (let dx = -1; dx <= 1; dx++) L(dx, 1, 2, 158);
  L(-5, 1, 4, 46); L(5, 1, 4, 46);
  /* Bodrum: arka taraftaki kuyudan merdivenle inilir */
  for (let dz = -5; dz <= 5; dz++) for (let dx = -5; dx <= 5; dx++) {
    const kenar = Math.abs(dx) === 5 || Math.abs(dz) === 5;
    for (let dy = -6; dy <= -1; dy++) L(dx, dy, dz, dy === -6 || dy === -1 || kenar ? tas(dx, dy, dz) : 0);
  }
  L(0, -1, -4, 0); L(0, 0, -4, 0);
  merdiven(0, -4, 0, -5, 0);
  /* Bodrumda sandık önünde ikinci tuzak */
  for (let dx = -4; dx <= 4; dx++) L(dx, -5, -1, 158);
  for (const dx of [-5, 5]) L(dx, -4, -1, 157);
  L(-4, -5, -4, 46); L(4, -5, -4, 46);
}

/* Buzul kulesi: sekizgen taş tuğla kule, buz bantları ve pencereler; katlar arası merdiven; tepede Buz Büyücüsü */
function kuleYaz(L, temel, r, merdiven) {
  const icMi = (dx, dz) => Math.abs(dx) <= 4 && Math.abs(dz) <= 4 && Math.abs(dx) + Math.abs(dz) <= 6;
  const kenarMi = (dx, dz) => icMi(dx, dz) && (!icMi(dx + 1, dz) || !icMi(dx - 1, dz) || !icMi(dx, dz + 1) || !icMi(dx, dz - 1));
  for (let dz = -5; dz <= 5; dz++) for (let dx = -5; dx <= 5; dx++) {
    if (!icMi(dx, dz)) { if (Math.abs(dx) <= 5 && Math.abs(dz) <= 5 && Math.abs(dx) + Math.abs(dz) <= 7) for (let dy = 1; dy <= 3; dy++) L(dx, dy, dz, 0); continue; }
    temel(dx, dz, 35, 14);
    const k = kenarMi(dx, dz);
    for (let dy = 0; dy <= 25; dy++) {
      let id = 0;
      if (dy === 0 || dy === 6 || dy === 12 || dy === 18 || dy === 24) id = 35;
      if (k && dy <= 24) id = dy % 6 === 5 ? 22 : 35;
      if (k && dy % 6 === 3 && (dx === 0 || dz === 0)) id = 22;   // pencereler
      if (dy === 25) id = k ? 21 : 141;
      L(dx, dy, dz, id);
    }
  }
  /* Mazgallar */
  for (let dz = -4; dz <= 4; dz++) for (let dx = -4; dx <= 4; dx++) if (kenarMi(dx, dz) && (dx + dz) % 2 === 0) { L(dx, 25, dz, 35); L(dx, 26, dz, 141); }
  /* Giriş ve merdiven boşlukları */
  for (let dy = 1; dy <= 2; dy++) L(0, dy, 4, 0);
  for (const dy of [6, 12, 18]) L(0, dy, -3, 0);
  merdiven(0, -3, 0, 1, 18);
  /* Meşaleler (alt katlar) */
  L(-2, 1, -2, 46); L(2, 7, -2, 46); L(-2, 13, -2, 46);
}

/* Haydut kampı: çitle çevrili düzlük, ortada kamp ateşi, çadırlar; Haydut Reisi kuzeydeki büyük çadırda */
function kampYaz(L, temel, r) {
  for (let dz = -10; dz <= 10; dz++) for (let dx = -10; dx <= 10; dx++) {
    temel(dx, dz, 3, 6);
    for (let dy = 1; dy <= 8; dy++) L(dx, dy, dz, 0);
    const d = Math.hypot(dx, dz);
    L(dx, 0, dz, d < 4.5 ? 57 : r(dx, 0, dz) < 0.25 ? 3 : 4);
    if ((Math.abs(dx) === 10 || Math.abs(dz) === 10) && !(Math.abs(dx) <= 1 && Math.abs(dz) === 10) && !(Math.abs(dz) <= 1 && Math.abs(dx) === 10)) L(dx, 1, dz, 104);
  }
  /* Kamp ateşi ve kütük oturaklar */
  L(0, 1, 0, 48);
  for (const [a, c] of [[2, 0], [-2, 0], [0, 2]]) L(a, 1, c, 8);
  /* Çadır: x boyunca A biçimli yün çatı, arka yüz kapalı */
  const cadir = (cx, cz, renk, gen = 2, derin = 2) => {
    for (let tz = -derin; tz <= derin - 1; tz++) for (let x = -gen; x <= gen; x++) {
      const h = gen + 1 - Math.abs(x);
      L(cx + x, h, cz + tz, renk);
      if (tz === -derin) for (let y = 1; y < h; y++) L(cx + x, y, cz + tz, renk);
    }
  };
  cadir(0, -6, 114, 3, 3);
  cadir(-6, 5, 120); cadir(6, 5, 115);
  /* Saman ve odun yığınları */
  L(7, 1, -6, 52); L(7, 2, -6, 52); L(-7, 1, -6, 8); L(-7, 2, -6, 8); L(-8, 1, -6, 8);
  L(4, 1, 7, 46); L(-4, 1, -2, 46);
}
