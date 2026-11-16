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
const YARICAP = { tapinak: 25, ormanTapinak: 7, kule: 14, kamp: 18 };
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
      if (o.h + (tur === 'kule' ? 46 : tur === 'tapinak' ? 30 : 15) >= PY - 1 || (tur === 'tapinak' && o.h < 24)) continue;
      /* Düzlük ve su denetimi */
      let mn = o.h, mx = o.h, su = false;
      for (const [a, b] of [[-R, -R], [R, -R], [-R, R], [R, R], [0, -R], [0, R], [-R, 0], [R, 0], [-R / 2, -R / 2], [R / 2, R / 2], [-R / 2, R / 2], [R / 2, -R / 2]]) {
        const q = u.kolon(x + a, z + b, {});
        mn = Math.min(mn, q.h); mx = Math.max(mx, q.h);
        if (q.h < DENIZ) su = true;
      }
      if (su || mx - mn > (tur === 'kule' ? 9 : tur === 'tapinak' ? 10 : tur === 'kamp' ? 5 : 6)) continue;
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
    Y.sandiklar.push(n(-8, 16, 12), n(10, 1, 12), n(-8, 1, -24), n(8, 1, -24), n(-16, -19, 0), n(-16, -19, 4), n(16, -19, 0), n(16, -19, 4), n(-3, -17, 12), n(3, -17, 12));
    Y.boss = { tur: 'firavun', p: n(0, -19, 6), yakin: 15, alt: b - 21, ust: b - 9 };
    Y.altY = b - 21; Y.ustY = b + 25;
  } else if (Y.tur === 'ormanTapinak') {
    Y.sandiklar.push(n(-3, -5, 3), n(3, -5, 3), n(0, -5, 3), n(-5, 1, -4));
    Y.altY = b - 7; Y.ustY = b + 11;
  } else if (Y.tur === 'kule') {
    Y.sandiklar.push(n(4, 1, -3), n(-3, 9, 3), n(3, 17, 3), n(-4, 25, -1), n(4, 25, 1));
    Y.boss = { tur: 'buzbuyucu', p: n(0, 33, 0), yakin: 10, alt: b + 31, ust: b + 42 };
    Y.altY = b - 1; Y.ustY = b + 45;
  } else if (Y.tur === 'kamp') {
    Y.sandiklar.push(n(-4, 2, -11), n(4, 2, -11), n(8, 1, -4), n(-8, 1, 9), n(9, 1, 2), n(-10, 1, 5), n(11, 9, -10));
    Y.boss = { tur: 'reis', p: n(0, 1, -2), yakin: 18, alt: b - 4, ust: b + 10 };
    Y.haydutlar = [n(3, 1, 4), n(-2, 1, 6), n(-11, 9, -10), n(9, 9, -10), n(0, 7, 14), n(9, 1, -3)];
    Y.altY = b - 2; Y.ustY = b + 16;
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
    for (let dz = -Y.R - 3; dz <= Y.R + 3; dz++) for (let dx = -Y.R - 3; dx <= Y.R + 3; dx++) for (let dy = 1; dy <= 30; dy++) if (AGAC.has(A(dx, dy, dz))) L(dx, dy, dz, 0);
    if (Y.tur === 'tapinak') tapinakYaz(L, temel, r, merdiven, Y);
    else if (Y.tur === 'ormanTapinak') ormanYaz(L, A, temel, r, merdiven);
    else if (Y.tur === 'kule') kuleYaz(L, temel, r, merdiven, A, Y);
    else if (Y.tur === 'kamp') kampYaz(L, temel, r, merdiven, Y);
    for (const [x, y, z] of Y.sandiklar) if (ic(x, z)) v[dizin(x - x0, y, z - z0)] = 50;
  }
}

/* Çöl tapınağı (0.15.2): Mısır tapınağı düzeninde, güneyden kuzeye ilerleyen bir yapı topluluğu.
   - Ön avlu: sfenks çifti, dikilitaşlar, kum taşı yol.
   - Pilon (anıtsal giriş kapısı): eğimli iki kule, kanatlı güneş kursu, sancak direkleri, girişte ok tuzağı.
     Batı kulesinde terasa çıkan merdiven, doğu kulesinde nöbetçi odası.
   - Açık avlu: revaklı yanlar, iki havuz ve nilüferler, hurma ağaçları, ateş kapları.
   - Sütunlu salon: yüksek orta nef ve yan nefler, ışık pencereleri, yıldızlı mavi tavan, bekçi heykelleri.
   - Kutsal oda: piramit çatı ve altın tepelik, oturan dev firavun heykeli, ortada ateşli sunak ve sarmal merdivenli kuyu.
   - Mezar salonu (18 blok aşağıda): 21 x 21, 10 yüksekliğinde; sütunlar, güneş mozaiği, duvar ocakları, lahitli kürsü (Firavun).
     İki yanında hazine odaları (doğudakinde ok tuzağı). */
function tapinakYaz(L, temel, r, merdiven, Y) {
  const K = 24, O = 160, D = 161, H = 162, P = 163, C = 164, A = 165, SU = 176, KO = 177, NS = 178;
  const KR = 61, F = 159, AT = 48, CAM = 109, YB = 170;
  const MR = yon => 166 + ((yon + Y.f) % 4);              // kum taşı merdiven; yon: yerel yükselme yönü
  const YUZ = yon => 172 + ((((yon + Y.f) % 4) + 2) % 4); // heykel başı; yon: yerel bakış yönü
  const YV = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  const kutu = (x0, x1, y0, y1, z0, z1, id) => {
    if (x0 > x1) [x0, x1] = [x1, x0];
    if (z0 > z1) [z0, z1] = [z1, z0];
    for (let dz = z0; dz <= z1; dz++) for (let dx = x0; dx <= x1; dx++) for (let dy = y0; dy <= y1; dy++)
      L(dx, dy, dz, typeof id === 'function' ? id(dx, dy, dz) : id);
  };
  const atesKabi = (dx, dy, dz) => { L(dx, dy, dz, D); L(dx, dy + 1, dz, AT); };
  /* Duvar süsü (yüksekliğe göre): kaide, hiyeroglif kuşağı, mavi ve turuncu bantlar, oymalı friz */
  const duvar = (dy, ust) => (dy === 1 ? P : dy <= 5 ? H : dy === 6 ? C : dy === 7 ? O : dy === ust ? D : dy % 4 === 0 ? P : K);

  /* Ayakta bekçi heykeli (3 geniş, 7 yüksek); yon: yerel bakış yönü */
  const heykel = (cx, cz, yon, y0 = 0) => {
    const [fx, fz] = YV[yon], rx = -fz, rz = fx;
    const H2 = (u, v, dy, id) => L(cx + u * rx + v * fx, y0 + dy, cz + u * rz + v * fz, id);
    for (let u = -1; u <= 1; u++) for (let v = 0; v <= 1; v++) H2(u, v, 1, O);
    H2(0, 0, 2, K); H2(0, 1, 2, YB);                              // bacak ve öne atılmış ayak
    for (let u = -1; u <= 1; u++) H2(u, 0, 3, u ? D : A);          // eteklik ve altın kemer
    for (let u = -1; u <= 1; u++) H2(u, 0, 4, K);                  // gövde ve kollar
    for (let u = -1; u <= 1; u++) H2(u, 0, 5, u ? C : A);          // geniş gerdanlık
    H2(0, 0, 6, YUZ(yon)); H2(-1, 0, 6, NS); H2(1, 0, 6, NS);      // yüz ve başlık örtüleri
    H2(0, 0, 7, NS);
  };
  /* Sfenks (güneye bakar): kaide, aslan gövdesi, ön pençeler, firavun başı */
  const sfenks = (cx, cz) => {
    kutu(cx - 2, cx + 2, 1, 1, cz - 4, cz + 4, (x, y, z) => (Math.abs(x - cx) === 2 || Math.abs(z - cz) === 4 ? O : D));
    kutu(cx - 1, cx + 1, 2, 3, cz - 3, cz + 1, K);
    for (const u of [-1, 1]) { kutu(cx + u, cx + u, 2, 2, cz + 2, cz + 3, K); L(cx + u, 2, cz + 4, YB); }
    kutu(cx - 1, cx + 1, 3, 4, cz + 2, cz + 2, K); L(cx, 2, cz + 2, K);
    L(cx, 5, cz + 2, YUZ(2)); L(cx - 1, 5, cz + 2, NS); L(cx + 1, 5, cz + 2, NS); L(cx - 1, 4, cz + 2, NS); L(cx + 1, 4, cz + 2, NS);
    L(cx, 6, cz + 2, NS); L(cx, 5, cz + 1, NS); L(cx, 4, cz + 1, K);
    L(cx + 1, 2, cz - 4, YB);
  };
  /* Dikilitaş: oymalı kaide, hiyeroglifli gövde, altın tepe */
  const dikilitas = (cx, cz) => {
    kutu(cx - 1, cx + 1, 1, 1, cz - 1, cz + 1, O);
    for (let a = -1; a <= 1; a++) for (let c = -1; c <= 1; c++) if (a || c) L(cx + a, 2, cz + c, YB);
    kutu(cx, cx, 2, 11, cz, cz, H); L(cx, 12, cz, A);
  };
  /* Hurma ağacı: çimenli çukur, akasya gövdesi, sarkık yapraklar */
  const hurma = (cx, cz) => {
    L(cx, 0, cz, 4);
    kutu(cx, cx, 1, 6, cz, cz, 144);
    L(cx, 7, cz, 145);
    for (let a = -1; a <= 1; a++) for (let c = -1; c <= 1; c++) if (a || c) { L(cx + a, 7, cz + c, 145); L(cx + a * 2, 6, cz + c * 2, 145); }
    for (const [a, c] of [[3, 0], [-3, 0], [0, 3], [0, -3]]) L(cx + a, 5, cz + c, 145);
  };

  /* ---------- 1. Alan: tesviye, kum zemin, temel ---------- */
  for (let dz = -25; dz <= 24; dz++) for (let dx = -14; dx <= 14; dx++) {
    temel(dx, dz, K);
    for (let dy = 1; dy <= 26; dy++) L(dx, dy, dz, 0);
    L(dx, 0, dz, 5);
  }

  /* ---------- 2. Mezar salonu (yeraltı) ---------- */
  const AY0 = -20, AY1 = -9, MZ = 1;   // taban, tavan, salon merkezinin z'si
  for (let dz = -11; dz <= 14; dz++) for (let dx = -12; dx <= 12; dx++) for (let dy = AY0; dy <= AY1; dy++) {
    const ic = Math.abs(dx) <= 10 && dz >= -10 && dz <= 12, g = dy - AY0;
    let id = 0;
    if (dy === AY0) {
      if (!ic) id = K;
      else {
        const x = dx, z = dz - MZ, d = Math.hypot(x, z);
        id = d < 1.6 ? A : d < 2.6 ? P : (d < 5.2 && (x === 0 || z === 0 || Math.abs(x) === Math.abs(z))) ? A : d < 5.6 ? C
          : (Math.abs(x) % 4 === 0 || Math.abs(z) % 4 === 0) ? P : D;
      }
    } else if (dy === AY1) id = ic ? (r(dx, 99, dz) < 0.13 ? A : C) : K;
    else if (!ic) id = g === 1 ? P : g <= 6 ? H : g === 7 ? C : g === 8 ? O : K;
    L(dx, dy, dz, id);
  }
  /* Duvar ocakları ve kristaller */
  for (const s of [-1, 1]) for (const z of [-7, -2, 4, 9]) { L(s * 11, AY0 + 1, z, D); L(s * 11, AY0 + 2, z, AT); L(s * 11, AY0 + 3, z, 0); L(s * 11, AY0 + 4, z, A); }
  /* Sütunlar (2 x 2) ve sarkan fenerler */
  for (const sx of [-7, 6]) for (const sz of [-6, 0, 6]) {
    kutu(sx, sx + 1, AY0 + 1, AY1 - 1, sz + MZ - 1, sz + MZ, (x, y) => { const g = y - AY0; return g === 1 ? O : g === 4 ? C : g === 5 ? A : g === 8 ? P : g === 9 ? O : g === 10 ? D : SU; });
  }
  for (const x of [-4, 4]) for (const z of [-5, 1, 7]) L(x, AY1 - 1, z, F);
  /* Sütunların iç yüzünde fenerler, köşelerde ve kürsü önünde ateş kapları */
  for (const s of [-1, 1]) for (const sz of [-6, 0, 6]) L(s * 5, AY0 + 4, sz + MZ - 1, F);
  for (const s of [-1, 1]) { atesKabi(s * 10, AY0 + 1, -10, D); atesKabi(s * 10, AY0 + 1, 12); atesKabi(s * 5, AY0 + 1, 8); atesKabi(s * 3, AY0 + 1, -9); }
  /* Lahitli kürsü (güney) */
  for (let dx = -4; dx <= 4; dx++) {
    L(dx, AY0 + 1, 9, MR(2)); kutu(dx, dx, AY0 + 1, AY0 + 1, 10, 12, D);
    L(dx, AY0 + 2, 10, MR(2)); kutu(dx, dx, AY0 + 2, AY0 + 2, 11, 12, D);
  }
  for (const z of [11, 12]) { L(-1, AY0 + 3, z, O); L(1, AY0 + 3, z, O); }
  L(0, AY0 + 3, 11, A); L(0, AY0 + 3, 12, C);
  /* Güney duvarında altın çerçeveli kabartma */
  kutu(-4, 4, AY0 + 3, AY0 + 9, 13, 13, (x, y) => (Math.abs(x) === 4 || y === AY0 + 3 || y === AY0 + 9 ? A : x === 0 ? (y === AY0 + 7 ? YUZ(0) : y === AY0 + 8 ? NS : A) : Math.abs(x) === 1 && y >= AY0 + 6 && y <= AY0 + 7 ? NS : C));
  heykel(-6, 11, 0, AY0); heykel(6, 11, 0, AY0);
  /* Hazine odaları */
  for (const s of [-1, 1]) {
    for (let dz = -1; dz <= 5; dz++) for (let a = 13; a <= 17; a++) for (let dy = AY0; dy <= AY0 + 5; dy++) {
      const ic = a <= 16 && dz >= 0 && dz <= 4 && dy > AY0 && dy < AY0 + 5;
      L(s * a, dy, dz, ic ? 0 : dy === AY0 ? D : dy === AY0 + 5 ? (r(a, dy, dz) < 0.2 ? A : C) : (dy === AY0 + 1 ? P : H));
    }
    kutu(s * 11, s * 12, AY0 + 1, AY0 + 2, 2, 2, 0);
    L(s * 11, AY0 + 3, 2, A); L(s * 12, AY0 + 3, 2, A);
    L(s * 14, AY0 + 4, 2, F);
    L(s * 16, AY0 + 1, 2, A); L(s * 16, AY0 + 2, 2, A); L(s * 15, AY0 + 1, 1, A); L(s * 15, AY0 + 1, 3, A); L(s * 16, AY0 + 1, 1, A); L(s * 16, AY0 + 1, 3, A);
    L(s * 17, AY0 + 3, 2, KR);
  }
  /* Doğu hazine odasında ok tuzağı: kapıdaki tel, kuzey ve güney duvarlarındaki atıcılar */
  L(13, AY0 + 1, 2, 158); L(13, AY0 + 2, -1, 157); L(13, AY0 + 2, 5, 157);

  /* ---------- 3. Ön avlu, sfenksler, dikilitaşlar ---------- */
  for (let dz = 14; dz <= 24; dz++) for (let dx = -12; dx <= 12; dx++) {
    if (dz <= 16) L(dx, 0, dz, Math.abs(dx) % 4 === 0 || dz === 16 ? P : D);
    else if (Math.abs(dx) <= 2) L(dx, 0, dz, Math.abs(dx) === 2 ? P : dx === 0 && dz % 3 === 0 ? C : D);
  }
  sfenks(-8, 20); sfenks(8, 20);
  dikilitas(-4, 15); dikilitas(4, 15);

  /* ---------- 4. Pilon ---------- */
  const lim = dy => (dy <= 5 ? 14 : dy <= 10 ? 13 : 12);
  for (let dz = 10; dz <= 13; dz++) for (let dx = -14; dx <= 14; dx++) {
    const ax = Math.abs(dx);
    L(dx, 0, dz, D);
    for (let dy = 1; dy <= 15; dy++) {
      let id;
      if (ax <= 2) {
        if (dy <= 7) id = 0;
        else if (dy === 8) id = dx === 0 && (dz === 11 || dz === 12) ? A : C;
        else id = dy === 13 ? C : dy === 14 ? P : dy === 15 ? D : K;
      } else {
        if (ax > lim(dy)) continue;
        const yuzey = ax === lim(dy) || dz === 10 || dz === 13 || ax === 3;
        if (!yuzey) id = K;
        else if (dy === 1) id = O;
        else if (dy === 13) id = C;
        else if (dy === 14) id = P;
        else if (dy === 15) id = D;
        else if (ax === lim(dy)) id = D;
        else if (ax === 3) id = dy <= 7 && dz > 10 && dz < 13 ? H : dy === 8 ? C : K;
        else if (dz === 13) id = dy >= 3 && dy <= 11 && ax >= 4 && ax <= 11 ? H : K;
        else id = dy >= 3 && dy <= 9 && ax >= 6 && ax <= 10 ? H : dy === 11 ? C : K;
        /* Eğimli yan kenarlar: kademelerde merdiven */
        if ((dy === 5 || dy === 10) && ax === lim(dy)) id = MR(dx < 0 ? 1 : 3);
      }
      L(dx, dy, dz, id);
    }
  }
  /* Kanatlı güneş kursu (ön ve arka yüz) */
  for (const dz of [13, 10]) {
    for (let dx = -7; dx <= 7; dx++) { const ax = Math.abs(dx); if (ax >= 2) L(dx, 9, dz, ax % 2 ? P : C); if (ax >= 2 && ax <= 5) L(dx, 10, dz, C); }
    for (const [x, y] of [[0, 8], [-1, 9], [0, 9], [1, 9], [0, 10]]) L(x, y, dz, A);
    L(-2, 8, dz, P); L(2, 8, dz, P);
  }
  /* Sancak direkleri ve flamalar */
  const flama = [114, 118, 118, 114];
  [-11, -8, 8, 11].forEach((x, i) => {
    kutu(x, x, 1, 19, 13, 13, 144); L(x, 20, 13, A);
    kutu(x, x, 12, 18, 14, 14, flama[i]);
  });
  /* Batı kulesi: içi boş, terasa çıkan iki kollu merdiven */
  kutu(-11, -4, 1, 14, 11, 12, 0);
  kutu(-5, -5, 1, 2, 10, 10, 0);
  for (let k = 0; k < 7; k++) L(-5 - k, 1 + k, 12, MR(3));
  L(-11, 8, 11, MR(0));
  for (let k = 0; k < 7; k++) L(-10 + k, 9 + k, 11, MR(1));
  L(-5, 15, 11, 0); L(-6, 15, 11, 0);
  L(-8, 14, 12, F); L(-3, 5, 11, KR);
  /* Doğu kulesi: nöbetçi odası */
  kutu(4, 11, 1, 4, 11, 12, 0);
  kutu(5, 5, 1, 2, 10, 10, 0);
  L(7, 4, 12, F); L(3, 5, 11, KR);
  /* Giriş geçidindeki ok tuzağı */
  for (let dx = -2; dx <= 2; dx++) L(dx, 1, 12, 158);
  L(-3, 2, 12, 157); L(3, 2, 12, 157);
  /* Teras: korkuluk, ateş kapları */
  for (let dz = 10; dz <= 13; dz++) for (let dx = -12; dx <= 12; dx++) if ((dz === 10 || dz === 13 || Math.abs(dx) === 12) && ![-11, -8, 8, 11].includes(dx)) L(dx, 16, dz, YB);
  for (const x of [-10, -2, 2, 10]) L(x, 16, 11, AT);

  /* ---------- 5. Açık avlu ---------- */
  for (let dz = 3; dz <= 9; dz++) for (let dx = -10; dx <= 10; dx++) {
    const ax = Math.abs(dx);
    L(dx, 0, dz, ax <= 1 ? (dx === 0 ? P : D) : ax >= 8 ? P : (dx + dz) % 2 ? D : K);
  }
  for (const s of [-1, 1]) {
    kutu(s * 2, s * 4, -1, -1, 4, 8, C); kutu(s * 2, s * 4, 0, 0, 4, 8, 7);
    for (const [a, c] of [[3, 5], [4, 7], [2, 8]]) L(s * a, 1, c, 146);
    hurma(s * 6, 4); hurma(s * 6, 8);
    atesKabi(s * 6, 1, 6);
    atesKabi(s * 3, 1, 9);
  }
  for (const s of [-1, 1]) {
    kutu(s * 11, s * 11, 1, 8, 3, 9, (x, y) => duvar(y, 8));
    for (const z of [4, 6, 8]) kutu(s * 8, s * 8, 1, 6, z, z, (x, y) => (y === 1 ? O : y === 4 ? C : y === 6 ? O : SU));
    kutu(s * 8, s * 10, 7, 7, 3, 9, C); kutu(s * 8, s * 10, 8, 8, 3, 9, D);
    kutu(s * 9, s * 10, 1, 6, 3, 9, 0);   // revak içi (hurma yaprakları taşmasın)
    L(s * 9, 6, 5, F); L(s * 9, 6, 7, F);
  }

  /* ---------- 6. Sütunlu salon ---------- */
  for (let dz = -9; dz <= 2; dz++) for (let dx = -11; dx <= 11; dx++) {
    const ax = Math.abs(dx), kenar = ax === 11 || dz === -9 || dz === 2;
    L(dx, 0, dz, ax <= 2 ? (dz % 2 ? D : P) : (dx + dz) % 4 === 0 ? C : D);
    const ust = ax <= 5 ? 12 : 9;
    for (let dy = 1; dy <= 12; dy++) {
      let id = 0;
      if (kenar) id = dy <= ust ? duvar(dy, ust) : 0;
      else if (ax >= 5 && dy === 8) id = r(dx, 8, dz) < 0.12 ? A : C;
      else if (ax >= 5 && dy === 9) id = D;
      else if (ax === 5 && dy === 10) id = CAM;
      else if (ax <= 5 && dy === 11) id = r(dx, 11, dz) < 0.14 ? A : C;
      else if (ax <= 5 && dy === 12) id = D;
      if (id || !kenar) L(dx, dy, dz, id);
    }
  }
  /* Nef sütunları (2 x 2, papirüs başlıklı) ve yan sütunlar */
  for (const sx of [-4, 3]) for (const sz of [-6, -3, 0]) kutu(sx, sx + 1, 1, 10, sz, sz + 1, (x, y) => (y === 1 ? O : y === 4 ? C : y === 5 ? A : y === 8 ? P : y === 9 ? O : y === 10 ? D : SU));
  for (const s of [-1, 1]) for (const z of [-6, -3, 0]) kutu(s * 8, s * 8, 1, 7, z, z, (x, y) => (y === 1 ? O : y === 4 ? C : y === 7 ? O : SU));
  /* Ön kapı (avluya) ve kutsal oda kapısı */
  kutu(-2, 2, 1, 6, 2, 2, 0);
  for (const x of [-3, 3]) kutu(x, x, 1, 7, 2, 2, O);
  for (let x = -2; x <= 2; x++) L(x, 7, 2, x ? C : A);
  for (let x = -4; x <= 4; x++) L(x, 8, 2, x === 0 ? A : Math.abs(x) % 2 ? C : P);
  kutu(-1, 1, 1, 4, -9, -9, 0);
  for (const x of [-2, 2]) kutu(x, x, 1, 5, -9, -9, O);
  for (let x = -1; x <= 1; x++) L(x, 5, -9, A);
  for (let x = -3; x <= 3; x++) L(x, 7, -9, x === 0 ? A : Math.abs(x) % 2 ? C : P);
  heykel(-4, -8, 2); heykel(4, -8, 2);
  /* Işık: nefte sarkan fenerler, yan neflerde fenerler ve köşelerde ateş kapları */
  for (const z of [-7, -4, -1]) L(0, 10, z, F);
  for (const s of [-1, 1]) {
    for (const z of [-5, -2, 1]) L(s * 6, 7, z, F);
    atesKabi(s * 10, 1, -8); atesKabi(s * 10, 1, 1);
  }
  atesKabi(-3, 1, 3); atesKabi(3, 1, 3);

  /* ---------- 7. Kutsal oda ---------- */
  const SZ = -14;
  for (let dz = -25; dz <= -10; dz++) for (let dx = -9; dx <= 9; dx++) {
    const ax = Math.abs(dx), kenar = ax === 9 || dz === -25;
    L(dx, 0, dz, ax === 8 || dz === -24 ? P : (Math.abs(dx) + Math.abs(dz - SZ)) % 4 === 0 ? C : D);
    for (let dy = 1; dy <= 14; dy++) {
      let id = 0;
      if (kenar) id = dy === 14 ? D : dy === 13 ? O : dy >= 9 ? (dy === 10 && (dx + dz) % 4 === 0 ? KR : dy === 11 ? C : K) : duvar(dy, 14);
      else if (dy === 14) id = r(dx, 14, dz) < 0.14 ? A : C;
      L(dx, dy, dz, id);
    }
  }
  /* Salonla kutsal oda arasındaki duvar, kutsal odanın tavanına kadar yükselir */
  for (let dx = -9; dx <= 9; dx++) for (let dy = (Math.abs(dx) <= 5 ? 13 : 10); dy <= 14; dy++) L(dx, dy, -9, dy === 14 ? D : dy === 13 ? O : dy === 11 ? C : K);
  /* Piramit çatı: kenarları merdiven, tepesi altın */
  for (let i = 0; ; i++) {
    const w = 9 - i, z0 = -25 + i, z1 = -9 - i;
    if (w < 0 || z0 > z1) break;
    for (let dz = z0; dz <= z1; dz++) for (let dx = -w; dx <= w; dx++) {
      let id = K;
      if (i >= 7) id = A;
      else if (dz === z0) id = MR(2);
      else if (dz === z1) id = MR(0);
      else if (dx === -w) id = MR(1);
      else if (dx === w) id = MR(3);
      L(dx, 15 + i, dz, id);
    }
  }
  /* Oturan dev firavun heykeli (kuzey duvarında, güneye bakar) */
  for (let dx = -4; dx <= 4; dx++) {
    L(dx, 1, -18, MR(0)); kutu(dx, dx, 1, 1, -24, -19, D);
    L(dx, 2, -19, MR(0)); kutu(dx, dx, 2, 2, -24, -20, D);
  }
  kutu(-3, 3, 3, 4, -24, -22, (x) => (Math.abs(x) === 3 ? H : K));            // taht
  kutu(-3, 3, 5, 9, -24, -24, (x, y) => (Math.abs(x) === 3 || y === 9 ? O : C)); // taht arkalığı
  for (const x of [-2, -1, 1, 2]) { kutu(x, x, 3, 4, -21, -21, K); L(x, 3, -20, YB); }   // baldırlar ve ayaklar
  kutu(-2, 2, 5, 5, -23, -21, D);                                             // eteklik (kucak)
  for (const s of [-1, 1]) { L(s * 2, 6, -21, K); L(s * 2, 6, -22, K); kutu(s * 2, s * 2, 7, 8, -23, -23, K); }   // kollar, eller
  kutu(-1, 1, 6, 8, -23, -22, K);                                             // gövde
  L(-1, 7, -22, C); L(0, 7, -22, A); L(1, 7, -22, C); L(-2, 7, -22, A); L(2, 7, -22, A);   // gerdanlık
  L(-1, 8, -22, NS); L(0, 8, -22, NS); L(1, 8, -22, NS);                        // başlık örtüleri ve sakal
  L(0, 9, -22, YUZ(2)); L(-1, 9, -22, NS); L(1, 9, -22, NS);
  kutu(-1, 1, 9, 9, -23, -23, NS); kutu(-1, 1, 10, 10, -23, -22, NS); L(0, 10, -22, A); L(0, 11, -22, A);
  /* Ateş kapları, fenerler, sandık köşeleri */
  for (const s of [-1, 1]) { atesKabi(s * 4, 3, -20); L(s * 2, 12, -20, F); atesKabi(s * 6, 1, -19); atesKabi(s * 7, 1, -11); L(s * 5, 13, -12, F); L(s * 5, 13, -21, F); L(s * 8, 13, -16, F); }
  /* Kuyu: 7 x 7 kuyu, 3 x 3 orta direk, çevresinde 16 basamaklı halkada 20 basamak */
  for (let dz = SZ - 3; dz <= SZ + 3; dz++) for (let dx = -3; dx <= 3; dx++) {
    const kenar = Math.abs(dx) === 3 || Math.abs(dz - SZ) === 3, cekirdek = Math.abs(dx) <= 1 && Math.abs(dz - SZ) <= 1;
    for (let dy = AY0; dy <= 0; dy++) {
      let id = 0;
      if (dy === AY0) id = D;
      else if (kenar) id = dy === 0 ? D : (dy - AY0) % 5 === 0 ? C : H;
      else if (cekirdek) id = dy % 6 === 0 ? A : dy % 3 === 0 ? C : H;
      L(dx, dy, dz, id);
    }
  }
  for (let dy = -16; dy <= -2; dy += 4) { L(-3, dy, SZ, KR); L(3, dy + 2, SZ, KR); L(0, dy, SZ - 3, KR); }
  const halka = [[0, 2], [-1, 2], [-2, 2], [-2, 1], [-2, 0], [-2, -1], [-2, -2], [-1, -2], [0, -2], [1, -2], [2, -2], [2, -1], [2, 0], [2, 1], [2, 2], [1, 2]];
  for (let k = 0; k <= 19; k++) {
    const [a, c] = halka[k % 16], [pa, pc] = halka[(k + 15) % 16];
    const yon = YV.findIndex(([x, z]) => x === pa - a && z === pc - c);
    L(a, -k, SZ + c, MR(yon));
  }
  /* Kuyunun dibinden mezar salonuna geçit */
  kutu(-1, 1, AY0 + 1, AY0 + 3, -11, -11, 0);
  for (const x of [-1, 0, 1]) L(x, AY0 + 4, -11, A);
  /* Sunak: orta direğin tepesinde ateş */
  kutu(-1, 1, 1, 1, SZ - 1, SZ + 1, O);
  kutu(-1, 1, 2, 2, SZ - 1, SZ + 1, (x, y, z) => (x && z !== SZ ? A : x || z !== SZ ? C : D));
  L(0, 3, SZ, AT);
  /* Korkuluk (güneyde giriş), köşe fenerleri */
  for (let dz = SZ - 3; dz <= SZ + 3; dz++) for (let dx = -3; dx <= 3; dx++) {
    if (!(Math.abs(dx) === 3 || Math.abs(dz - SZ) === 3) || (dx === 0 && dz === SZ + 3)) continue;
    if (Math.abs(dx) === 3 && Math.abs(dz - SZ) === 3) { L(dx, 1, dz, O); L(dx, 2, dz, F); } else L(dx, 1, dz, KO);
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

/* Buzul kulesi (0.15.4): Buz Büyücüsü'nün yuvarlak kulesi.
   - Taş teras: buz fenerli alçak duvar, buz kemerli kapı, kristal uçlu buz kümeleri, yer yer kar.
   - Gövde: 15 blok çapında, buz tuğladan; her katta sıkışmış buz ve oymalı buz bantları, mavi vitray pencereler,
     dışta sekiz kademeli payanda ve uçlarında buz fenerleri.
   - İçeride duvar boyunca dolanan tek parça sarmal buz tuğla merdiven; dört kat:
     giriş salonu (donmuş çeşme, kristal kandiller), kütüphane (kitaplıklar, büyü masası), simya odası ve yatak, gözlem ve hazine odası.
   - Tepe: kademeli taşma (altında sarkıtlar) üzerinde 23 blok çapında açık savaş alanı; büyü çemberi, mazgallı korkuluk,
     sekiz buz sivrisi, buz fenerleri ve üzerinde süzülen Buz Kalbi kristali. */
function kuleYaz(L, temel, r, merdiven, A, Y) {
  const BT = 185, MB = 186, KT = 187, VT = 188, BF = 189, BYB = 194, BO = 196, BUZ = 22, KAR = 21, KK = 141, TT = 35, KS = 37, KR = 197, SRK = 198, PAR = 182, PK = 61;
  const BM = yon => 190 + ((yon + Y.f) % 4);
  const derece = (dx, dz) => ((Math.atan2(dz, dx) * 180 / Math.PI) + 360) % 360;
  const fark = (a, b) => { const x = Math.abs(a - b) % 360; return Math.min(x, 360 - x); };
  const hucre = [];
  for (let dz = -14; dz <= 14; dz++) for (let dx = -14; dx <= 14; dx++) hucre.push([dx, dz, Math.hypot(dx, dz), derece(dx, dz)]);
  const KATLAR = [0, 8, 16, 24], UST = 32;

  /* ---------- 1. Arazi ve teras ---------- */
  for (const [dx, dz, d] of hucre) {
    if (d > 13.5) continue;
    temel(dx, dz, 2, 14);
    for (let dy = 1; dy <= 24; dy++) L(dx, dy, dz, 0);
    const yol = Math.abs(dx) <= 1 && dz > 6;
    let z = d >= 12.5 ? KAR : d >= 11.5 ? KS : yol ? (dx === 0 ? BO : KS) : r(dx, 0, dz) < 0.22 ? KAR : TT;
    L(dx, 0, dz, z);
    if (!yol && d >= 8 && d < 11.4 && r(dx, 1, dz) < 0.14) L(dx, 1, dz, KK);
    if (d >= 12.5) L(dx, 1, dz, r(dx, 2, dz) < 0.6 ? KK : 0);
  }
  /* Alçak teras duvarı, direklerde buz fenerleri */
  for (const [dx, dz, d, a] of hucre) {
    if (d < 11.6 || d >= 12.5 || (Math.abs(dx) <= 1 && dz > 0)) continue;
    const direk = Math.round(a) % 30 < 4;
    L(dx, 1, dz, direk ? BT : BYB);
    if (direk) { L(dx, 2, dz, BT); L(dx, 3, dz, BF); }
  }
  /* Kapı kemeri */
  for (const s of [-1, 1]) { for (let dy = 1; dy <= 4; dy++) L(s * 2, dy, 12, dy === 1 ? KS : BT); L(s * 2, 5, 12, BO); L(s * 2, 6, 12, BYB); }
  for (let dx = -1; dx <= 1; dx++) L(dx, 5, 12, BO);
  L(0, 6, 12, MB); L(0, 7, 12, KR); L(0, 4, 12, BF);
  /* Kristal uçlu buz kümeleri */
  for (const [cx, cz] of [[7, 7], [-7, 7], [-7, -7], [7, -7]]) {
    const h = 4 + Math.floor(r(cx, 3, cz) * 2);
    for (let dy = 1; dy <= h; dy++) L(cx, dy, cz, BUZ);
    L(cx, h + 1, cz, KR);
    const sx = Math.sign(cx), sz = Math.sign(cz);
    for (let dy = 1; dy <= h - 2; dy++) L(cx + sx, dy, cz, MB);
    for (let dy = 1; dy <= h - 1; dy++) L(cx, dy, cz + sz, BUZ);
    L(cx - sx, 1, cz, MB); L(cx - sx, 2, cz, BUZ); L(cx + sx, 1, cz + sz, BUZ); L(cx, 1, cz - sz, MB);
  }

  /* ---------- 2. Gövde: duvar, katlar, iç boşluk ---------- */
  for (const [dx, dz, d, a] of hucre) {
    if (d >= 7.5) continue;
    const duvar = d >= 6.5;
    for (let dy = 1; dy < UST; dy++) {
      let id;
      if (duvar) {
        if (dy <= 2) id = KS;
        else if (KATLAR.includes(dy)) id = MB;
        else if (KATLAR.includes(dy + 1)) id = BO;
        else id = r(dx, dy, dz) < 0.1 ? MB : BT;
      } else if (KATLAR.includes(dy)) {
        const k = KATLAR.indexOf(dy);
        if (k === 1) id = d < 2.5 ? 118 : d >= 5.5 ? BT : 14;                                   // kütüphane: ahşap ve halı
        else if (k === 2) id = d >= 5.5 ? BT : (Math.abs(dx) + Math.abs(dz)) % 2 ? KS : MB;     // simya odası
        else id = d < 1.5 ? BO : (dx === 0 || dz === 0 || Math.abs(dx) === Math.abs(dz)) ? MB : BT;   // gözlem odası
      } else id = 0;
      L(dx, dy, dz, id);
    }
    /* Giriş katı zemini: kar tanesi deseni */
    if (!duvar) L(dx, 0, dz, d < 1.5 ? MB : d >= 5.5 ? BT : (dx === 0 || dz === 0 || Math.abs(dx) === Math.abs(dz)) ? MB : KS);
    /* Pencereler */
    if (duvar) for (const F of KATLAR) for (const w of [0, 45, 90, 135, 180, 225, 270, 315]) {
      if ((F === 0 && w === 90) || fark(a, w) > 6.5) continue;
      for (let dy = F + 3; dy <= F + 5; dy++) L(dx, dy, dz, VT);
      L(dx, F + 6, dz, BO);
    }
  }
  /* Kapı */
  for (let dz = 5; dz <= 8; dz++) for (let dx = -1; dx <= 1; dx++) { if (Math.hypot(dx, dz) < 6.5) continue; for (let dy = 1; dy <= 3; dy++) L(dx, dy, dz, 0); L(dx, 4, dz, BO); }
  L(0, 5, 7, MB); L(0, 5, 8, BF);
  /* Payandalar (sekiz, kademeli) ve uçlarında buz fenerleri */
  for (let k = 0; k < 8; k++) {
    const a = (22.5 + 45 * k) * Math.PI / 180;
    [[8, 18], [9, 12], [10, 6]].forEach(([rr, h], n) => {
      const x = Math.round(rr * Math.cos(a)), z = Math.round(rr * Math.sin(a));
      for (let dy = 1; dy <= h; dy++) L(x, dy, z, dy <= 2 ? KS : BT);
      L(x, h + 1, z, n === 2 ? BF : BYB);
    });
  }

  /* ---------- 3. Sarmal merdiven: duvar boyunca 4 yönlü bitişik tek sıra basamak, katlar arasında kesintisiz ---------- */
  const yolH = [];
  {
    let son = null;
    const e = q => Math.abs(Math.hypot(q[0], q[1]) - 6);
    for (let s = 0; s < 3600; s++) {
      const a = (135 + s * 0.1) * Math.PI / 180, c = [Math.round(6 * Math.cos(a)), Math.round(6 * Math.sin(a))];
      if (son && c[0] === son[0] && c[1] === son[1]) continue;
      if (son && Math.abs(c[0] - son[0]) + Math.abs(c[1] - son[1]) === 2) { const a1 = [c[0], son[1]], a2 = [son[0], c[1]]; yolH.push(e(a1) <= e(a2) ? a1 : a2); }
      if (yolH.length > 2 && c[0] === yolH[0][0] && c[1] === yolH[0][1]) break;
      yolH.push(c); son = c;
    }
  }
  const yonBul = (a, b) => (b[0] > a[0] ? 1 : b[0] < a[0] ? 3 : b[1] > a[1] ? 2 : 0);
  const basamak = new Map();   // "dx,dz" -> [kol, k]
  for (let i = 0; i < 4; i++) {
    const F = KATLAR[i];
    for (let k = 0; k < 8; k++) {
      const j = 8 * i + k, c = yolH[j], yon = j ? yonBul(yolH[j - 1], c) : yonBul(c, yolH[1]);
      basamak.set(c[0] + ',' + c[1], [i, k]);
      for (let y = F + 1; y < F + 1 + k; y++) L(c[0], y, c[1], BT);
      L(c[0], F + 1 + k, c[1], BM(yon));
      if (k >= 4 && k <= 6) L(c[0], F + 8, c[1], 0);   // üst katta baş boşluğu
    }
  }
  const bas = (dx, dz) => basamak.get(dx + ',' + dz);
  const komsuBas = (dx, dz, kol) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, c]) => { const q = bas(dx + a, dz + c); return q && q[0] === kol; });

  /* ---------- 4. Taşma ve tepe savaş alanı ---------- */
  for (const [dx, dz, d] of hucre) {
    if (d < 7.5 || d >= 11.5) continue;
    if (d < 8.5) L(dx, 29, dz, BT);
    if (d < 9.5) L(dx, 30, dz, d >= 8.5 ? MB : BT);
    if (d < 10.5) L(dx, 31, dz, BT);
    /* Kademelerin altında sarkıtlar */
    const alt = d < 8.5 ? 28 : d < 9.5 ? 29 : d < 10.5 ? 30 : 31;
    if (r(dx, 28, dz) < 0.35) L(dx, alt, dz, SRK);
  }
  for (const [dx, dz, d, a] of hucre) {
    if (d >= 11.5) continue;
    const q = bas(dx, dz);
    if (q && q[0] === 3 && q[1] >= 4) continue;   // merdiven boşluğu ve son basamak
    let id = d < 1.5 ? MB : d >= 3.5 && d < 4.5 ? BO : d >= 7.5 && d < 8.5 ? MB : d >= 10.5 ? KS
      : (d >= 4.5 && d < 7.5 && (dx === 0 || dz === 0 || Math.abs(dx) === Math.abs(dz))) ? MB : BT;
    L(dx, UST, dz, id);
    if (d >= 10.5) {
      const dis = Math.floor(a / 10) % 2 === 0;
      L(dx, UST + 1, dz, dis ? BT : BYB);
      if (dis) L(dx, UST + 2, dz, BYB);
    } else if (d >= 2 && d < 10 && r(dx, UST + 1, dz) < 0.08) L(dx, UST + 1, dz, KK);
    /* Merdiven boşluğunun çevresinde demir parmaklık */
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a2, c2]) => { const w = bas(dx + a2, dz + c2); return w && w[0] === 3 && w[1] >= 4 && w[1] <= 6; })
      && ![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a2, c2]) => { const w = bas(dx + a2, dz + c2); return w && w[0] === 3 && w[1] === 7; })) L(dx, UST + 1, dz, PAR);
  }
  /* Buz sivrileri ve fener direkleri */
  for (let k = 0; k < 8; k++) {
    const a = 45 * k * Math.PI / 180, x = Math.round(9.6 * Math.cos(a)), z = Math.round(9.6 * Math.sin(a)), h = 5 + (k % 2) * 2;
    for (let dy = 1; dy <= h; dy++) L(x, UST + dy, z, dy <= 1 ? MB : BUZ);
    L(x, UST + h + 1, z, KR);
    for (const [a2, c2] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (Math.hypot(x + a2, z + c2) < 10.5) { L(x + a2, UST + 1, z + c2, BUZ); }
    const b = (22.5 + 45 * k) * Math.PI / 180, px = Math.round(8.6 * Math.cos(b)), pz = Math.round(8.6 * Math.sin(b));
    L(px, UST + 1, pz, BT); L(px, UST + 2, pz, BF);
  }
  /* Süzülen Buz Kalbi ve yörüngedeki parçalar */
  for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) for (let c = -3; c <= 3; c++) {
    const m = Math.abs(a) + Math.abs(b) + Math.abs(c);
    if (m <= 3) L(a, 41 + b, c, m === 3 ? BUZ : m === 2 ? MB : KR);
  }
  for (const [a, c] of [[6, 0], [-6, 0], [0, 6], [0, -6]]) { L(a, 38, c, BUZ); L(a, 39, c, MB); L(a, 37, c, KR); }

  /* ---------- 5. Kat döşemeleri ---------- */
  /* Giriş salonu: donmuş çeşme, kristal kandiller, buz fenerleri */
  for (let a = -1; a <= 1; a++) for (let c = -1; c <= 1; c++) L(a, 1, c, a || c ? BUZ : MB);
  for (const [dx, dz, d] of hucre) if (d >= 1.5 && d < 2.5) L(dx, 1, dz, BYB);
  L(0, 2, 0, MB); L(0, 3, 0, MB); L(0, 4, 0, BO); L(0, 5, 0, KR);
  for (const [a, c] of [[0, 0], [2, 0], [-2, 0], [0, 2], [0, -2]]) L(a, 7, c, BF);
  for (const s of [-1, 1]) { L(s * 3, 1, 5, KS); L(s * 3, 2, 5, MB); L(s * 3, 3, 5, BO); L(s * 3, 4, 5, KR); }
  for (const [a, c] of [[5, 0], [4, -3], [0, -5], [-3, -4]]) L(a, 5, c, BF);
  /* Kütüphane: duvar boyunca kitaplıklar, ortada büyü masası, okuma kürsüleri */
  for (const [dx, dz, d, a] of hucre) {
    if (d < 5.5 || d >= 6.5 || komsuBas(dx, dz, 1) || komsuBas(dx, dz, 0)) continue;
    if ([0, 45, 90, 135, 180, 225, 270, 315].some(w => fark(a, w) <= 8)) continue;
    for (let dy = 9; dy <= 11; dy++) L(dx, dy, dz, KT);
    L(dx, 12, dz, BYB);
  }
  L(0, 9, 0, 156);
  for (const [a, c] of [[3, -3], [-3, -2]]) { L(a, 9, c, 104); L(a, 10, c, 82); }
  for (const [a, c] of [[0, 0], [3, 3], [-3, 3], [3, -3], [-3, -3]]) L(a, 15, c, BF);
  /* Simya odası ve yatak */
  L(2, 17, -3, 140); L(-2, 17, -3, 140); L(0, 17, -3, 181); L(0, 18, -3, PK);
  L(-3, 17, 2, 47); L(-3, 17, 3, 47); L(-4, 17, 2, KT); L(-4, 18, 2, KT);
  L(0, 17, 0, KS); L(0, 18, 0, KR);
  L(3, 17, -1, 181); L(3, 18, -1, 181); L(4, 17, 0, 181);
  for (const [a, c] of [[0, 0], [3, 2], [-3, -2], [-2, 3]]) L(a, 23, c, BF);
  /* Gözlem ve hazine odası: ortada kristal küre, yıldızlı tavan altında fenerler */
  L(0, 25, 0, BO); L(0, 26, 0, KR);
  for (const [a, c] of [[2, 0], [-2, 0], [0, 2], [0, -2]]) L(a, 25, c, BYB);
  for (const [a, c] of [[0, 0], [3, 3], [-3, 3], [3, -3], [-3, -3]]) L(a, 31, c, BF);
}

/* Haydut kampı (0.15.3): Kızıl Pençe haydutlarının tahkimli yuvası.
   - Dış savunma: sivri kazıklı hendek, köprü; uçları sivriltilmiş kütüklerden halka biçimli çit, çit üstünde meşaleler.
   - Kapı kulesi: iki kule, kapının üstünden geçen mazgallı yürüyüş yolu, sancaklar, fenerler.
   - Arka köşelerde iki gözetleme kulesi: dikmeler, çapraz parmaklık, tırmanma merdiveni, çatılı nöbet yeri ve flama.
   - Reis otağı: ahşap kürsü üzerinde kırmızı-krem çizgili büyük çadır, saçak, taht, halı, ganimet sandıkları.
   - Meydan: taş halkalı büyük kamp ateşi ve şiş, oturaklar, fener direkleri.
   - Yatakhane çadırları, demirci tezgâhı, ganimet ambarı, demir parmaklıklı hazine kafesi, okçuluk alanı, odun yığını.
   Haydut Reisi meydanda bekler; nöbetçiler kulelerde ve kapı yolunda durur. */
function kampYaz(L, temel, r, merdiven, Y) {
  const R = 18, KUT = 8, KAL = 14, CIT = 104, KZ = 184, BEZ = 179, CBEZ = 180, FIC = 181, PAR = 182, HED = 183, SAM = 52, F = 159, MS = 46, YB = 82;
  const AH = yon => 70 + ((yon + Y.f) % 4);              // meşe merdiven; yon: yerel yükselme yönü
  const YV = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  const kutu = (x0, x1, y0, y1, z0, z1, id) => {
    if (x0 > x1) [x0, x1] = [x1, x0];
    if (z0 > z1) [z0, z1] = [z1, z0];
    for (let dz = z0; dz <= z1; dz++) for (let dx = x0; dx <= x1; dx++) for (let dy = y0; dy <= y1; dy++)
      L(dx, dy, dz, typeof id === 'function' ? id(dx, dy, dz) : id);
  };
  const fenerDirek = (x, z, h = 2) => { kutu(x, x, 1, h, z, z, CIT); L(x, h + 1, z, F); };
  /* Küçük piramit çatı (merdivenlerle); n: yarı genişlik */
  const cati = (cx, cz, y, n) => {
    for (let i = 0; i <= n; i++) {
      const w = n - i;
      for (let a = -w; a <= w; a++) for (let c = -w; c <= w; c++) {
        let id = KAL;
        if (w > 0) { if (c === -w) id = AH(2); else if (c === w) id = AH(0); else if (a === -w) id = AH(1); else if (a === w) id = AH(3); }
        else id = YB;
        L(cx + a, y + i, cz + c, id);
      }
    }
  };

  /* ---------- 1. Arazi: tesviye, çimen, hendek ---------- */
  for (let dz = -R; dz <= R; dz++) for (let dx = -R; dx <= R; dx++) {
    const d = Math.hypot(dx, dz);
    if (d > R + 0.5) continue;
    temel(dx, dz, 3, 8);
    for (let dy = 1; dy <= 14; dy++) L(dx, dy, dz, 0);
    if (d >= 14.5 && d < 16.5 && !(Math.abs(dx) <= 1 && dz > 0)) {
      /* Hendek: bir blok derin, dibinde sivri kazıklar */
      L(dx, 0, dz, r(dx, 1, dz) < 0.2 ? KZ : 0);
      L(dx, -1, dz, r(dx, 2, dz) < 0.4 ? 6 : 3);
    } else {
      const q = r(dx, 0, dz);
      L(dx, 0, dz, d < 13.5 ? (q < 0.18 ? 3 : q < 0.24 ? 6 : 4) : 4);
    }
  }
  /* Yollar: kapıdan meydana, meydandan otağa ve iki yana */
  const yol = (dx, dz) => L(dx, 0, dz, r(dx, 3, dz) < 0.15 ? 6 : 57);
  for (let dz = -4; dz <= 13; dz++) for (let dx = -1; dx <= 1; dx++) yol(dx, dz);
  for (let dx = -8; dx <= 8; dx++) if (Math.abs(dx) >= 4) yol(dx, 1);
  for (let dz = -5; dz <= 7; dz++) for (let dx = -14; dx <= 14; dx++) if (Math.hypot(dx, dz - 1) <= 4.5) yol(dx, dz);

  /* ---------- 2. Kazıklı çit ve meşaleler ---------- */
  for (let dz = -R; dz <= R; dz++) for (let dx = -R; dx <= R; dx++) {
    const d = Math.hypot(dx, dz);
    if (d < 13.5 || d >= 14.5 || (Math.abs(dx) <= 1 && dz > 0)) continue;
    const h = 3 + (r(dx, 5, dz) < 0.35 ? 1 : 0), aci = Math.atan2(dz, dx), mesale = Math.abs(((aci * 180 / Math.PI) + 360) % 30) < 2.2;
    kutu(dx, dx, 1, h, dz, dz, KUT);
    L(dx, h + 1, dz, mesale ? MS : KZ);
  }

  /* ---------- 3. Kapı kulesi ve köprü ---------- */
  for (let dx = -1; dx <= 1; dx++) for (let dz = 14; dz <= 17; dz++) { L(dx, 0, dz, KAL); L(dx, -1, dz, KUT); }
  for (const s of [-1, 1]) {
    const cx = s * 3, cz = 14;
    kutu(cx - 1, cx + 1, -1, 0, cz - 1, cz + 1, KUT);
    for (let a = -1; a <= 1; a++) for (let c = -1; c <= 1; c++) {
      const kose = a && c;
      for (let dy = 1; dy <= 5; dy++) L(cx + a, dy, cz + c, kose ? KUT : (a === 0 && c === 0) ? 0 : (dy === 3 && (a === 0 || c === 0) && c !== -1 && !(a === 0 && c === 1)) ? CIT : KAL);
    }
    kutu(cx, cx, 1, 2, cz - 1, cz - 1, 0);                 // içeriden giriş
    merdiven(cx, cz, 2, 1, 6);                            // tırmanma merdiveni (güney duvarına)
    kutu(cx, cx, 2, 4, cz + 2, cz + 2, (x, y) => (y === 3 ? 114 : 120));   // kara-kızıl sancak
  }
  for (let dx = -1; dx <= 1; dx++) L(dx, 5, 14, KUT);      // kapı lentosu
  /* Yürüyüş yolu ve mazgallar */
  for (let dx = -5; dx <= 5; dx++) for (let dz = 12; dz <= 16; dz++) {
    if (!(Math.abs(dx) === 3 && dz === 14)) L(dx, 6, dz, KAL);
    const kenar = Math.abs(dx) === 5 || dz === 12 || dz === 16;
    if (!kenar) continue;
    if (dz === 16 && dx % 2 === 0) { L(dx, 7, dz, KUT); L(dx, 8, dz, Math.abs(dx) === 4 ? F : KZ); }
    else if (Math.abs(dx) === 5 && (dz === 12 || dz === 16)) { L(dx, 7, dz, KUT); L(dx, 8, dz, KZ); }
    else L(dx, 7, dz, CIT);
  }
  L(0, 5, 16, F); L(0, 5, 12, F);

  /* ---------- 4. Gözetleme kuleleri (kuzeybatı, kuzeydoğu) ---------- */
  const gozetleme = (cx, cz, renk) => {
    for (let a = -1; a <= 1; a++) for (let c = -1; c <= 1; c++) {
      if (a && c) kutu(cx + a, cx + a, 1, 8, cz + c, cz + c, KUT);
      else if (!a && !c) kutu(cx, cx, 1, 7, cz, cz, KUT);
      else if (!(a === 0 && c === 1)) { L(cx + a, 4, cz + c, CIT); L(cx + a, 7, cz + c, CIT); }
    }
    for (let a = -2; a <= 2; a++) for (let c = -2; c <= 2; c++) {
      L(cx + a, 8, cz + c, KAL);
      if (Math.abs(a) === 2 || Math.abs(c) === 2) {
        if (Math.abs(a) === 2 && Math.abs(c) === 2) kutu(cx + a, cx + a, 9, 10, cz + c, cz + c, KUT);
        else L(cx + a, 9, cz + c, CIT);
      }
    }
    merdiven(cx, cz + 1, 0, 1, 8);
    cati(cx, cz, 11, 2);
    kutu(cx, cx, 13, 15, cz, cz, CIT); L(cx + 1, 15, cz, renk); L(cx + 1, 14, cz, 120);
    L(cx, 10, cz, F);
  };
  gozetleme(-10, -9, 114); gozetleme(10, -9, 114);

  /* ---------- 5. Reis otağı ---------- */
  for (let dx = -5; dx <= 5; dx++) for (let dz = -12; dz <= -5; dz++) L(dx, 1, dz, KAL);
  for (let dx = -2; dx <= 2; dx++) L(dx, 1, -4, AH(0));
  const cH = x => 8 - Math.abs(x);
  for (let dz = -12; dz <= -6; dz++) for (let dx = -5; dx <= 5; dx++) {
    const h = cH(dx);
    L(dx, h, dz, dx === 0 ? KUT : CBEZ);
    for (let dy = 2; dy < h; dy++) {
      if (dz === -12 || Math.abs(dx) === 5) L(dx, dy, dz, CBEZ);
      else if (dz === -6) L(dx, dy, dz, Math.abs(dx) <= 2 && dy <= 4 ? 0 : CBEZ);
      else L(dx, dy, dz, 0);
    }
  }
  L(0, 8, -13, KUT); L(0, 8, -5, KUT);                       // mertek uçları
  /* Saçak ve direkleri */
  for (let dx = -3; dx <= 3; dx++) for (let dz = -5; dz <= -4; dz++) L(dx, 5, dz, CBEZ);
  for (const a of [-3, 3]) kutu(a, a, 1, 4, -4, -4, CIT);
  /* Sancak direkleri */
  for (const a of [-7, 7]) { kutu(a, a, 1, 7, -5, -5, CIT); kutu(a + Math.sign(a), a + Math.sign(a), 4, 6, -5, -5, (x, y) => (y === 5 ? 114 : 120)); L(a, 8, -5, MS); }
  /* İç: halı, taht, sandıklar, masa, fıçı, fenerler */
  for (let dx = -2; dx <= 2; dx++) for (let dz = -11; dz <= -7; dz++) L(dx, 1, dz, Math.abs(dx) === 2 || dz === -11 || dz === -7 ? 120 : 114);
  L(0, 2, -10, AH(0)); L(0, 2, -11, KAL); L(0, 3, -11, 114); L(-1, 2, -10, YB); L(1, 2, -10, YB);
  L(-1, 2, -11, 165); L(1, 2, -11, FIC);
  L(-3, 2, -8, CIT); L(-3, 3, -8, YB); L(-3, 2, -7, 32);
  L(4, 2, -7, FIC); L(4, 2, -8, FIC); L(4, 3, -8, FIC); L(3, 2, -7, SAM);
  for (const z of [-8, -11]) L(0, 7, z, F);
  L(-4, 3, -9, F); L(4, 3, -10, F);

  /* ---------- 6. Meydan: büyük kamp ateşi, şiş, oturaklar ---------- */
  const MX = 0, MZ = 1;
  L(MX, 1, MZ, 48);
  for (let a = -1; a <= 1; a++) for (let c = -1; c <= 1; c++) if (a || c) L(MX + a, 1, MZ + c, 84);
  for (const a of [-2, 2]) kutu(MX + a, MX + a, 1, 3, MZ, MZ, CIT);
  for (const a of [-1, 0, 1]) L(MX + a, 3, MZ, CIT);
  for (let c = -1; c <= 1; c++) { L(MX - 4, 1, MZ + c, AH(3)); L(MX + 4, 1, MZ + c, AH(1)); }
  for (const [a, c] of [[-3, -2], [3, -2], [-3, 4], [3, 4]]) L(MX + a, 1, MZ + c, KUT);
  for (const [a, c] of [[-5, -3], [5, -3], [-5, 5], [5, 5]]) fenerDirek(MX + a, MZ + c);

  /* ---------- 7. Yatakhane çadırları (batı) ---------- */
  const cadir = (cx, cz, yon, sandik) => {
    const [fx, fz] = YV[yon], rx = -fz, rz = fx;
    const C2 = (u, v, dy, id) => L(cx + u * rx + v * fx, dy, cz + u * rz + v * fz, id);
    for (let u = -2; u <= 2; u++) for (let v = -2; v <= 1; v++) {
      const h = 3 - Math.abs(u);
      C2(u, v, h, u === 0 ? KUT : BEZ);
      for (let dy = 1; dy < h; dy++) C2(u, v, dy, v === -2 || (v === 1 && u !== 0) ? BEZ : 0);
    }
    C2(-1, -1, 1, 47); C2(1, -1, 1, sandik ? 0 : 47); C2(-1, 0, 1, 47); C2(1, 0, 1, sandik ? FIC : 47);
    C2(0, -2, 4, CIT); C2(0, 1, 4, CIT);
    C2(2, 2, 1, CIT); C2(2, 2, 2, CIT); C2(2, 2, 3, F);
    C2(-2, 2, 1, SAM);
  };
  cadir(-9, -3, 1, false); cadir(-9, 4, 1, true);
  /* Odun yığını ve kütük */
  for (const [a, c, h] of [[-12, -7, 2], [-12, -6, 1], [-11, -7, 1]]) kutu(a, a, 1, h, c, c, KUT);

  /* ---------- 8. Demirci tezgâhı (güneybatı) ---------- */
  for (const [a, c] of [[-9, 8], [-5, 8], [-9, 10], [-5, 10]]) kutu(a, a, 1, 3, c, c, KUT);
  kutu(-8, -6, 1, 3, 10, 10, KAL);
  kutu(-9, -5, 4, 4, 8, 10, YB);
  L(-8, 1, 10, 33); L(-6, 1, 10, 32); L(-7, 1, 9, 139); L(-6, 1, 8, FIC); L(-7, 3, 9, F);
  L(-9, 1, 9, 0);

  /* ---------- 9. Ganimet ambarı (doğu) ---------- */
  for (const [a, c] of [[7, -5], [11, -5], [7, -2], [11, -2]]) kutu(a, a, 1, 3, c, c, KUT);
  kutu(11, 11, 1, 3, -4, -3, KAL); kutu(8, 10, 1, 3, -5, -5, KAL);
  kutu(7, 11, 4, 4, -5, -2, YB);
  L(10, 1, -4, FIC); L(10, 2, -4, FIC); L(10, 1, -3, FIC); L(9, 1, -4, SAM); L(9, 2, -4, SAM); L(10, 2, -3, YB);
  L(9, 3, -3, F);

  /* ---------- 10. Hazine kafesi (doğu) ---------- */
  for (let a = 8; a <= 10; a++) for (let c = 1; c <= 3; c++) {
    const ic = a === 9 && c === 2;
    for (let dy = 1; dy <= 3; dy++) L(a, dy, c, ic ? 0 : (a !== 9 && c !== 2) ? KUT : PAR);
    L(a, 4, c, YB);
  }
  L(9, 2, 2, 165);
  fenerDirek(7, 4);

  /* ---------- 11. Okçuluk alanı (güneydoğu) ---------- */
  for (const c of [6, 9]) { L(10, 1, c, HED); L(10, 2, c, HED); }
  L(9, 1, 7, SAM); L(9, 1, 8, SAM);
  for (let c = 5; c <= 10; c++) if (c !== 7) L(4, 1, c, CIT);
  L(5, 1, 10, FIC); L(5, 2, 10, CIT); L(5, 3, 10, F);

  /* ---------- 12. Dağınık ayrıntılar ---------- */
  for (const [a, c] of [[-6, -6], [6, -7], [-2, 9], [3, 11]]) L(a, 1, c, SAM);
  for (const [a, c] of [[2, 11], [-6, -4]]) L(a, 1, c, FIC);
  fenerDirek(-2, 12); fenerDirek(2, 12);
}
