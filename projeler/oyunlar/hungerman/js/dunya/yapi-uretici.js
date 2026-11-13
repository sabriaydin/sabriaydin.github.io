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
const YARICAP = { tapinak: 25, ormanTapinak: 7, kule: 6, kamp: 11 };
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
      if (o.h + (tur === 'kule' ? 26 : tur === 'tapinak' ? 30 : 15) >= PY - 1 || (tur === 'tapinak' && o.h < 24)) continue;
      /* Düzlük ve su denetimi */
      let mn = o.h, mx = o.h, su = false;
      for (const [a, b] of [[-R, -R], [R, -R], [-R, R], [R, R], [0, -R], [0, R], [-R, 0], [R, 0], [-R / 2, -R / 2], [R / 2, R / 2], [-R / 2, R / 2], [R / 2, -R / 2]]) {
        const q = u.kolon(x + a, z + b, {});
        mn = Math.min(mn, q.h); mx = Math.max(mx, q.h);
        if (q.h < DENIZ) su = true;
      }
      if (su || mx - mn > (tur === 'kule' ? 9 : tur === 'tapinak' ? 10 : tur === 'kamp' ? 3 : 6)) continue;
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
