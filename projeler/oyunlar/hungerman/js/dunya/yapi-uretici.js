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
const YARICAP = { tapinak: 10, ormanTapinak: 7, kule: 6, kamp: 11 };
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
      if (o.h + (tur === 'kule' ? 26 : 15) >= PY - 1 || (tur === 'tapinak' && o.h < 24)) continue;
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
    Y.sandiklar.push(n(-8, 1, -8), n(8, 1, -8), n(-9, -17, -4), n(9, -17, -4), n(-9, -17, 4), n(9, -17, 4), n(-3, -17, -8), n(3, -17, -8));
    Y.boss = { tur: 'firavun', p: n(0, -17, -5), yakin: 13, alt: b - 19, ust: b - 9 };
    Y.altY = b - 19; Y.ustY = b + 15;
  } else if (Y.tur === 'ormanTapinak') {
    Y.sandiklar.push(n(-3, -5, 3), n(3, -5, 3), n(0, -5, 3), n(-5, 1, -4));
    Y.altY = b - 7; Y.ustY = b + 11;
  } else if (Y.tur === 'kule') {
    Y.sandiklar.push(n(3, 1, 3), n(-3, 8, 3), n(3, 15, 3), n(-2, 22, 5), n(2, 22, 5));
    Y.boss = { tur: 'buzbuyucu', p: n(0, 22, 0), yakin: 10, alt: b + 19, ust: b + 30 };
    Y.altY = b - 1; Y.ustY = b + 25;
  } else if (Y.tur === 'kamp') {
    Y.sandiklar.push(n(0, 1, -8), n(-6, 1, 5), n(-9, 7, -9));
    Y.boss = { tur: 'reis', p: n(0, 1, -3), yakin: 18, alt: b - 4, ust: b + 8 };
    Y.haydutlar = [n(3, 1, 3), n(-3, 1, 3), n(4, 1, -2), n(-4, 1, -2)];
    Y.altY = b - 2; Y.ustY = b + 9;
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
    if (Y.tur === 'tapinak') tapinakYaz(L, temel, r, merdiven, Y);
    else if (Y.tur === 'ormanTapinak') ormanYaz(L, A, temel, r, merdiven);
    else if (Y.tur === 'kule') kuleYaz(L, temel, r, merdiven, A);
    else if (Y.tur === 'kamp') kampYaz(L, temel, r, merdiven);
    for (const [x, y, z] of Y.sandiklar) if (ic(x, z)) v[dizin(x - x0, y, z - z0)] = 50;
  }
}

/* Çöl tapınağı (0.15.1): ön köşelerde iki kule, sütunlu ve fenerlerle aydınlatılmış salon, girişte ok tuzağı.
   Ortadaki kuyuda orta direğin çevresinde sarmal basamaklar 18 blok aşağıdaki geniş arenaya iner.
   Arena (19 x 19, 7 yükseklik): duvarlarda kristaller, tavanda fenerler, sütunlar, kuzeyde lahit (Firavun), duvar diplerinde sandıklar. */
function tapinakYaz(L, temel, r, merdiven, Y) {
  const K = 24, S = 37, T = 115, M = 118, KR = 61, F = 159;
  const kule = (dx, dz) => Math.abs(dx) >= 8 && dz >= 8;
  for (let dz = -10; dz <= 10; dz++) for (let dx = -10; dx <= 10; dx++) {
    temel(dx, dz, K);
    const kenar = Math.abs(dx) === 10 || Math.abs(dz) === 10;
    for (let dy = 1; dy <= 15; dy++) L(dx, dy, dz, 0);
    L(dx, 0, dz, (Math.abs(dx) + Math.abs(dz)) % 6 === 0 ? S : (dx * dz) % 7 === 3 ? M : K);
    if (kule(dx, dz)) {
      /* Ön köşe kuleleri: turuncu ve mavi bantlar, tepede kristal */
      for (let dy = 1; dy <= 12; dy++) L(dx, dy, dz, dy === 4 || dy === 10 ? T : dy === 7 ? M : K);
      if (Math.abs(dx) === 9 && dz === 9) { L(dx, 13, dz, S); L(dx, 14, dz, KR); }
      continue;
    }
    if (kenar) for (let dy = 1; dy <= 7; dy++) L(dx, dy, dz, dy === 4 ? T : dy === 5 && (dx + dz) % 2 === 0 ? M : K);
    /* Basamaklı çatı */
    const m = Math.max(Math.abs(dx), Math.abs(dz));
    if (m <= 10) L(dx, 8, dz, K);
    if (m <= 8) L(dx, 9, dz, m === 8 ? T : K);
    if (m <= 6) L(dx, 10, dz, K);
    if (m <= 4) L(dx, 11, dz, S);
    if (m <= 2) L(dx, 12, dz, K);
    if (m === 0) L(dx, 13, dz, T);
  }
  /* İç duvar süsü: duvar boyunca mavi-turuncu desen ve kristal ışıklar */
  for (let k = -9; k <= 9; k++) for (const [a, c] of [[k, -10], [-10, k], [10, k]]) { if (kule(a, c)) continue; if (k % 4 === 0) L(a, 3, c, KR); else if (k % 2 === 0) L(a, 3, c, M); }
  /* Giriş ve kapı çerçevesi */
  for (let dx = -1; dx <= 1; dx++) for (let dy = 1; dy <= 3; dy++) L(dx, dy, 10, 0);
  for (const dx of [-2, 2]) for (let dy = 1; dy <= 6; dy++) L(dx, dy, 10, dy === 5 ? M : S);
  for (let dx = -2; dx <= 2; dx++) { L(dx, 4, 10, T); L(dx, 7, 10, S); }
  /* Salon sütunları (fenerli) */
  for (const [a, c] of [[-5, -6], [5, -6], [-5, -1], [5, -1], [-5, 4], [5, 4]]) { for (let dy = 1; dy <= 7; dy++) L(a, dy, c, dy === 3 || dy === 6 ? T : K); L(a + (a > 0 ? -1 : 1), 1, c, F); }
  /* Giriş koridoru ve ok tuzağı */
  for (const dx of [-2, 2]) for (let dz = 7; dz <= 9; dz++) for (let dy = 1; dy <= 3; dy++) L(dx, dy, dz, K);
  for (const dx of [-2, 2]) L(dx, 2, 8, 157);
  for (let dx = -1; dx <= 1; dx++) L(dx, 1, 8, 158);
  for (const [a, c] of [[-8, -8], [8, -8], [-8, 2], [8, 2]]) if (!(a === -8 && c === -8) && !(a === 8 && c === -8)) L(a, 1, c, F);
  L(-7, 1, -8, F); L(7, 1, -8, F);
  /* Arena */
  const AY0 = -18, AY1 = -10;
  for (let dz = -10; dz <= 10; dz++) for (let dx = -10; dx <= 10; dx++) {
    const kenar = Math.abs(dx) === 10 || Math.abs(dz) === 10;
    for (let dy = AY0; dy <= AY1; dy++) {
      let id = 0;
      if (dy === AY0) id = Math.abs(dx) + Math.abs(dz) <= 3 ? T : (Math.abs(dx) % 4 === 0 && Math.abs(dz) % 4 === 0) ? M : (dx + dz) % 2 ? S : K;
      else if (dy === AY1) id = (Math.abs(dx) % 5 === 3 && Math.abs(dz) % 5 === 3) ? KR : K;
      else if (kenar) id = dy === -14 && (dx + dz) % 4 === 0 ? KR : dy === -13 ? T : dy === -16 ? M : K;
      L(dx, dy, dz, id);
    }
  }
  /* Arena sütunları ve tavandan sarkan fenerler */
  for (const [a, c] of [[-6, -6], [6, -6], [-6, 6], [6, 6], [-6, 0], [6, 0]]) { for (let dy = AY0 + 1; dy < AY1; dy++) L(a, dy, c, dy === -14 ? T : K); L(a, AY1 - 1, c + (c > 0 ? -1 : 1), F); }
  for (const [a, c] of [[-3, 4], [3, 4], [0, 8], [-8, -1], [8, -1]]) L(a, AY1 - 1, c, F);
  /* Lahit */
  for (let dx = -1; dx <= 1; dx++) for (const dz of [-9, -8]) { L(dx, AY0 + 1, dz, K); L(dx, AY0 + 2, dz, dx === 0 ? T : S); }
  /* Kuyu ve sarmal merdiven: 3 x 3 boşluk, ortada direk; basamaklar güneydeki giriş hücresinden başlar */
  for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) {
    const kenar = Math.abs(dx) === 2 || Math.abs(dz) === 2;
    for (let dy = AY0 + 1; dy <= 0; dy++) L(dx, dy, dz, kenar ? (dy < -10 || dy === 0 ? K : K) : 0);
    if (kenar && !(dx === 2 && Math.abs(dz) <= 1)) L(dx, 1, dz, 104);   // korkuluk (doğuda geçiş)
  }
  for (let dy = AY0 + 1; dy <= 0; dy++) L(0, dy, 0, dy % 4 === 0 ? T : S);
  L(0, 1, 0, F);
  /* Arenadaki kuyu girişi (güney) */
  for (let dy = AY0 + 1; dy <= AY0 + 3; dy++) L(0, dy, 2, 0);
  const yol = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];
  const YV = [[0, -1, 0], [1, 0, 1], [0, 1, 2], [-1, 0, 3]];
  for (let i = 1; i <= 18; i++) {
    const [a, c] = yol[i % 8], [na, nc] = yol[(i + 1) % 8];
    const yon = YV.find(q => q[0] === na - a && q[1] === nc - c)[2];
    L(a, AY0 + i, c, 78 + ((yon + Y.f) % 4));
  }
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
  /* Aydınlatma (0.15.1): salon ve bodrumda fenerler */
  for (const [a, c] of [[-5, -2], [5, -2], [-3, -4], [3, -4]]) L(a, 1, c, 159);
  for (const [a, c] of [[-4, 3], [4, 3], [0, -2]]) L(a, -5, c, 159);
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

/* Buzul kulesi (0.15.1): 13 blok genişliğinde sekizgen kule; buz bantları ve pencereler, her katta fenerler ve mavi sancaklar.
   Katlar arası tırmanma merdiveni; tepede mazgallı, açık hava savaş alanı (Buz Büyücüsü) ve köşelerde buz sivrileri. */
function kuleYaz(L, temel, r, merdiven, A) {
  const icMi = (dx, dz) => Math.abs(dx) <= 6 && Math.abs(dz) <= 6 && Math.abs(dx) + Math.abs(dz) <= 9;
  const kenarMi = (dx, dz) => icMi(dx, dz) && (!icMi(dx + 1, dz) || !icMi(dx - 1, dz) || !icMi(dx, dz + 1) || !icMi(dx, dz - 1));
  const KATLAR = [0, 7, 14, 21];
  for (let dz = -8; dz <= 8; dz++) for (let dx = -8; dx <= 8; dx++) {
    if (!icMi(dx, dz)) { if (Math.abs(dx) + Math.abs(dz) <= 11) for (let dy = 1; dy <= 3; dy++) L(dx, dy, dz, 0); continue; }
    temel(dx, dz, 35, 14);
    const k = kenarMi(dx, dz);
    for (let dy = 0; dy <= 24; dy++) {
      let id = 0;
      if (KATLAR.includes(dy)) id = dy === 21 ? ((dx + dz) % 2 ? 37 : 35) : 35;
      if (k && dy <= 22) id = dy % 7 === 6 ? 22 : 35;
      if (k && dy % 7 === 3 && dy < 21 && (dx === 0 || dz === 0)) id = 22;           // pencereler
      if (k && dy % 7 === 2 && dy < 21 && ((Math.abs(dx) === 6 && Math.abs(dz) === 2) || (Math.abs(dz) === 6 && Math.abs(dx) === 2))) id = 118;   // mavi sancak
      if (k && dy === 23) id = (dx + dz) % 2 === 0 ? 35 : 0;                          // mazgallar
      if (k && dy === 24 && (dx + dz) % 2 === 0) id = 141;
      if (!k && dy === 22) id = r(dx, 22, dz) < 0.3 ? 141 : 0;                         // tepede ince kar
      L(dx, dy, dz, id);
    }
  }
  /* Giriş, merdiven boşlukları ve merdiven */
  for (let dy = 1; dy <= 3; dy++) for (const dx of [-1, 0, 1]) L(dx, dy, 6, 0);
  for (const dy of [7, 14, 21]) L(0, dy, -5, 0);
  merdiven(0, -5, 0, 1, 21);
  /* Katlarda fenerler (zeminde) */
  for (const y0 of [1, 8, 15]) for (const [a, c] of [[-4, -2], [4, -2], [-4, 2], [4, 2]]) L(a, y0, c, 159);
  /* Tepe: köşelerde buz sivrileri ve fenerler */
  for (const [a, c] of [[-4, -4], [4, -4], [-4, 4], [4, 4]]) { for (let dy = 22; dy <= 24; dy++) L(a, dy, c, 22); L(a, 25, c, 61); }
  for (const [a, c] of [[-5, 0], [5, 0], [0, 5]]) L(a, 22, c, 159);
}

/* Haydut kampı (0.15.1): kütük çit (kapılı), gözetleme kulesi, çadırlar, kamp ateşi, masa ve fenerler, saman hedefler, sandık yığınları.
   Haydut Reisi kuzeydeki büyük kırmızı çadırın önünde bekler. */
function kampYaz(L, temel, r, merdiven) {
  const R = 11;
  for (let dz = -R; dz <= R; dz++) for (let dx = -R; dx <= R; dx++) {
    temel(dx, dz, 3, 6);
    for (let dy = 1; dy <= 9; dy++) L(dx, dy, dz, 0);
    const d = Math.hypot(dx, dz);
    L(dx, 0, dz, d < 4.5 ? 57 : (Math.abs(dx) <= 1 && dz > 0) ? 57 : r(dx, 0, dz) < 0.25 ? 3 : 4);
    /* Kütük çit: güneyde ve doğuda kapı */
    const kenar = Math.abs(dx) === R || Math.abs(dz) === R;
    const kapi = (dz === R && Math.abs(dx) <= 1) || (dx === R && Math.abs(dz) <= 1);
    if (kenar && !kapi) { const h = 2 + (r(dx, 5, dz) < 0.5 ? 1 : 0); for (let dy = 1; dy <= h; dy++) L(dx, dy, dz, 8); }
  }
  for (const [a, c] of [[2, R], [-2, R], [R, 2], [R, -2]]) { L(a, 3, c, 8); L(a, 4, c, 46); }
  /* Kamp ateşi, kütük oturaklar */
  L(0, 1, 0, 48);
  for (const [a, c] of [[2, 0], [-2, 0], [0, 2], [2, 2], [-2, -2]]) L(a, 1, c, a && c ? 52 : 8);
  /* Çadır: x boyunca A biçimli yün çatı, arka yüz kapalı */
  const cadir = (cx, cz, renk, gen = 2, derin = 2) => {
    for (let tz = -derin; tz <= derin - 1; tz++) for (let x = -gen; x <= gen; x++) {
      const h = gen + 1 - Math.abs(x);
      L(cx + x, h, cz + tz, renk);
      if (tz === -derin) for (let y = 1; y < h; y++) L(cx + x, y, cz + tz, renk);
    }
  };
  cadir(0, -7, 114, 3, 3);
  cadir(-6, 6, 120); cadir(6, 6, 115); cadir(7, -4, 117);
  /* Reis çadırının önünde sancak direkleri */
  for (const a of [-4, 4]) { for (let dy = 1; dy <= 4; dy++) L(a, dy, -4, 104); L(a, 4, -3, 114); L(a, 3, -3, 114); L(a, 5, -4, 46); }
  /* Gözetleme kulesi (kuzeybatı köşe): dört ayak, platform, korkuluk, merdiven */
  for (const [a, c] of [[-10, -10], [-8, -10], [-10, -8], [-8, -8], [-9, -8]]) for (let dy = 1; dy <= 5; dy++) L(a, dy, c, 8);
  for (let a = -10; a <= -8; a++) for (let c = -10; c <= -8; c++) L(a, 6, c, 14);
  for (let a = -10; a <= -8; a++) for (let c = -10; c <= -8; c++) if (a !== -9 || c !== -9) { if (!(a === -9 && c === -8)) L(a, 7, c, 104); }
  merdiven(-9, -7, 0, 1, 6);
  L(-10, 7, -10, 159);
  /* Masa, fenerler, sandık yığınları ve saman hedefler */
  L(4, 1, 2, 14); L(5, 1, 2, 14); L(4, 2, 2, 159); L(-4, 1, 6, 159); L(6, 1, -1, 159); L(-3, 1, -8, 159);
  for (const [a, c] of [[8, 8], [9, 8], [8, 9]]) L(a, 1, c, 14);
  L(9, 2, 8, 14);
  for (const [a, c] of [[-8, 2], [-8, 4]]) { L(a, 1, c, 52); L(a, 2, c, 52); }
}
