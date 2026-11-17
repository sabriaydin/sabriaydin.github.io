/* HungerMan - Lanetli Ada (0.30.6; 0.38.0: yeni konum ve tasarım)
   Yeraltı Diyarı'nın dünyadaki tek girişi. 0.38.0: ana karadan ve harita merkezinden çok uzakta, kıtanın dışındaki ıssız açık okyanusta
   (merkeze 2950-3300 blok, çevresinde en az 250 blok kara olmayan derin deniz) tek bir ada.
   Tasarım: dik obsidyen ve kül tuğlası yarlar, kül kumu kıyı şeridi, yüzeyde ışıldayan magma çatlakları, ortada dört köşesi
   kor mangallı direklerle çevrili kül tuğlası tapınak avlusu ve kadim geçit; güneyde obsidyen iskele ve fener, kurumuş ağaçlar,
   yıkık duvarlar, kızıl mantarlar, örümcek ağları, iskelet yuvası ve geçidin arkasında bir hazine sandığı.
   Konum tohumdan belirlenir (her dünyada bir tane); dünya üretiminde (işçide) ve oyunda aynı işlevle bulunur. */
import { PB, PY, DENIZ, dizin } from '../sabitler.js';
import { karistir, uretec, karma3 } from '../rastgele.js';

const R = 16;   // adanın en geniş yarıçapı
export const ADA_AD = 'Lanetli Ada';
const OBS = 515, KUL = 513, KOR = 512, TUGLA = 518, OYMA = 519, GECIT = 516, KUTUK = 10, AG = 148, YUVA = 58, SANDIK = 50, MAGMA = 521, ISIL = 514, MANTAR = 522, FENER = 159;

/* Adanın konumu: kıtanın dışında, merkezden 2950-3300 blok uzakta; çevresi 250 blok boyunca kara içermeyen derin deniz */
export function lanetliAda(u) {
  if (u.lanetliAdaB !== undefined) return u.lanetliAdaB;
  const r = uretec(karistir(u.tohum ^ 0x61646132));
  const a0 = r() * Math.PI * 2, SINIR = 3300;
  const derin = (x, z, s) => { if (Math.abs(x) > 3560 || Math.abs(z) > 3560) return true; const o = u.kolon(x, z, {}); return o.h < DENIZ - s; };
  let A = null;
  for (let d = 2950; d <= 3300 && !A; d += 50) {
    for (let k = 0; k < 36 && !A; k++) {
      const a = a0 + k * Math.PI * 2 / 36, x = Math.round(Math.cos(a) * d), z = Math.round(Math.sin(a) * d);
      if (Math.abs(x) > SINIR || Math.abs(z) > SINIR || !derin(x, z, 12)) continue;
      let acik = true;
      for (const rr of [40, 90, 160, 250]) for (let t = 0; t < 16 && acik; t++) { const b = t * Math.PI / 8; if (!derin(Math.round(x + Math.cos(b) * rr), Math.round(z + Math.sin(b) * rr), rr < 60 ? 6 : 2)) acik = false; }
      if (acik) A = { x, z };
    }
  }
  if (!A) { const x = Math.round(Math.cos(a0) * 3100), z = Math.round(Math.sin(a0) * 3100); A = { x: Math.max(-SINIR, Math.min(SINIR, x)), z: Math.max(-SINIR, Math.min(SINIR, z)) }; }
  const T = DENIZ + 6;   // avlu (ada tepesi) yüksekliği
  A.ust = T; A.r = R;
  A.gecit = { x: A.x - 1, y: T + 1, z: A.z - 2 };   // geçidin sol alt iç hücresi (x-y düzlemi)
  A.bekci = { x: A.x + 0.5, y: T + 1, z: A.z + 2.5 };   // ada bekçisinin doğduğu yer (geçidin önü)
  return (u.lanetliAdaB = A);
}
export const adaYakin = (u, x, z, r = 30) => { const A = lanetliAda(u); return Math.hypot(x - A.x, z - A.z) <= r; };

/* Kıyı çizgisi (açıya göre gürültülü yarıçap) */
function kenarR(u, A, x, z) {
  const a = Math.atan2(z - A.z, x - A.x), t = u.tohum ^ 0x616461;
  return R - 3.5 + 2.2 * karma3(t, Math.round(a * 4), 0, 0) + 1.3 * karma3(t, Math.round(a * 9), 1, 0);
}
/* Adanın üst yüzeyi: ortada düz avlu, dışa doğru basamaklı yamaç, kenarda dik yar ve kül kumu kıyı (yoksa null) */
function adaYukseklik(u, A, x, z) {
  const d = Math.hypot(x - A.x, z - A.z), k = kenarR(u, A, x, z);
  if (d > k) return null;
  if (d <= 7) return A.ust;
  if (d > k - 1.6) return DENIZ + 1;   // kıyı şeridi
  const t = (d - 7) / Math.max(1, k - 8.6), oynama = karma3(u.tohum ^ 0x7961, x, 0, z) < 0.25 ? 1 : 0;
  return Math.max(DENIZ + 2, Math.round(A.ust - t * t * (A.ust - DENIZ - 2) + oynama));
}

export function adaYaz(u, v, x0, z0) {
  const A = lanetliAda(u);
  if (A.x + R + 3 < x0 || A.x - R - 3 > x0 + PB - 1 || A.z + R + 3 < z0 || A.z - R - 3 > z0 + PB - 1) return;
  const set = (x, y, z, id) => { if (x < x0 || x >= x0 + PB || z < z0 || z >= z0 + PB || y < 1 || y >= PY) return; v[dizin(x - x0, y, z - z0)] = id; };
  const al = (x, y, z) => (x < x0 || x >= x0 + PB || z < z0 || z >= z0 + PB ? -1 : v[dizin(x - x0, y, z - z0)]);
  const rk = (x, y, z, s = 0) => karma3(u.tohum ^ 0x6c616e ^ s, x, y, z);
  const H = (x, z) => adaYukseklik(u, A, x, z), T = A.ust;
  /* Gövde: deniz tabanından yüzeye; yarlarda obsidyen ve kül tuğlası katmanları, yüzeyde kül kumu ve kor taşı, aralarda magma çatlakları */
  for (let z = A.z - R - 1; z <= A.z + R + 1; z++) for (let x = A.x - R - 1; x <= A.x + R + 1; x++) {
    if (x < x0 || x >= x0 + PB || z < z0 || z >= z0 + PB) continue;
    const h = H(x, z);
    if (h == null) continue;
    let taban = DENIZ; while (taban > 2 && (al(x, taban, z) === 7 || al(x, taban, z) === 0 || al(x, taban, z) === 31 || al(x, taban, z) === 68)) taban--;
    const d = Math.hypot(x - A.x, z - A.z), aci = Math.atan2(z - A.z, x - A.x);
    const catlak = d > 7.5 && h > DENIZ + 1 && Math.abs(((aci * 5 / Math.PI + 10) % 2) - 1) < 0.09 + rk(x, 0, z, 9) * 0.05;
    for (let y = taban; y <= h; y++) {
      const ust = y === h;
      let id = (y % 3 === 0 && rk(x, y, z, 1) < 0.7) ? TUGLA : rk(x, y, z, 1) < 0.55 ? OBS : KOR;
      if (ust) id = catlak ? MAGMA : h === DENIZ + 1 ? KUL : rk(x, y, z) < 0.68 ? KUL : KOR;
      set(x, y, z, id);
    }
    for (let y = h + 1; y <= DENIZ; y++) set(x, y, z, KUL);
  }
  /* Tapınak avlusu: 11 × 11 kül tuğlası zemin, oymalı tuğla kenar */
  for (let dz = -5; dz <= 5; dz++) for (let dx = -5; dx <= 5; dx++) {
    const kenar = Math.abs(dx) === 5 || Math.abs(dz) === 5;
    set(A.x + dx, T, A.z + dz, kenar ? OYMA : (dx + dz) % 2 ? TUGLA : OBS);
    for (let y = T + 1; y <= T + 7; y++) if (al(A.x + dx, y, A.z + dz) !== -1) set(A.x + dx, y, A.z + dz, 0);
  }
  /* Dört köşe direği: kül tuğlası gövde, oymalı başlık, üstünde kor mangalı (magma ve ışıltaş) */
  for (const [dx, dz] of [[-4, -4], [4, -4], [-4, 4], [4, 4]]) {
    for (let y = T + 1; y <= T + 4; y++) set(A.x + dx, y, A.z + dz, y === T + 4 ? OYMA : TUGLA);
    set(A.x + dx, T + 5, A.z + dz, MAGMA);
    set(A.x + dx, T + 6, A.z + dz, ISIL);
  }
  /* Yıkık arka duvar ve yan duvar parçaları */
  for (let dx = -3; dx <= 3; dx++) { const boy = 1 + Math.floor(rk(dx, 0, 1, 4) * 3); for (let y = T + 1; y <= T + boy; y++) set(A.x + dx, y, A.z - 5, rk(dx, y, 2, 4) < 0.3 ? OBS : TUGLA); }
  for (const sx of [-5, 5]) for (let dz = -3; dz <= 1; dz += 2) { const boy = Math.floor(rk(sx, dz, 3, 4) * 3); for (let y = T + 1; y <= T + boy; y++) set(A.x + sx, y, A.z + dz, TUGLA); }
  /* Kadim geçit: avlunun kuzeyinde (obsidyen çerçeve 4 × 5, iç 2 × 3; sönük) ve iki yanında kor taşı kaide */
  const G = A.gecit;
  for (let y = T; y <= T + 4; y++) for (let x = G.x - 1; x <= G.x + 2; x++) {
    const kenar = x === G.x - 1 || x === G.x + 2 || y === T || y === T + 4;
    set(x, y, G.z, kenar ? OBS : 0);   // 0.39.0: geçit sönük doğar; Büyülü Anahtar ile açılır
  }
  for (const x of [G.x - 2, G.x + 3]) { set(x, T + 1, G.z, OYMA); set(x, T + 2, G.z, MAGMA); }
  set(G.x, T + 5, G.z, OBS); set(G.x + 1, T + 5, G.z, OBS);
  /* Geçidin arkasında hazine sandığı */
  set(A.x, T + 1, G.z - 2, SANDIK);
  /* Avludan güneye inen yol ve obsidyen iskele, ucunda fener */
  for (let dz = 6; dz <= R + 8; dz++) {
    const z = A.z + dz, h = H(A.x, z);
    for (const dx of [-1, 0, 1]) {
      const hx = H(A.x + dx, z);
      if (hx != null) { set(A.x + dx, hx, z, TUGLA); for (let y = hx + 1; y <= hx + 3; y++) if (al(A.x + dx, y, z) !== -1) set(A.x + dx, y, z, 0); }
      else if (h == null || dz > 0) { set(A.x + dx, DENIZ, z, OBS); for (let y = DENIZ - 1; y >= DENIZ - 4 && dx !== 0; y--) if ((dz % 3) === 0) set(A.x + dx, y, z, OBS); }
    }
    if (h == null && H(A.x, z + 1) == null && H(A.x, z + 2) == null && H(A.x, z + 3) == null) {
      for (const dx of [-1, 1]) { set(A.x + dx, DENIZ + 1, z, OBS); set(A.x + dx, DENIZ + 2, z, FENER); }
      break;
    }
  }
  /* Kıyıda obsidyen sivri kayalar */
  for (let k = 0; k < 11; k++) {
    const a = k * Math.PI * 2 / 11 + rk(k, 0, 0, 2) * 0.4;
    if (Math.abs(((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) - Math.PI / 2) < 0.25) continue;   // iskele yolu açık kalır
    const x0k = A.x + Math.cos(a) * (R - 4.5 + rk(k, 1, 0, 2) * 2), z0k = A.z + Math.sin(a) * (R - 4.5 + rk(k, 1, 0, 2) * 2);
    const x = Math.round(x0k), z = Math.round(z0k), h = H(x, z);
    if (h == null) continue;
    const boy = 3 + Math.floor(rk(k, 2, 0, 2) * 6), egim = rk(k, 4, 0, 2) < 0.5 ? 1 : -1;
    for (let y = h + 1; y <= h + boy; y++) {
      const kay = Math.floor((y - h) / 3) * egim;
      set(x + kay, y, z, OBS);
      if (y - h < 2) { set(x + 1, y, z, OBS); set(x, y, z + 1, OBS); }
    }
  }
  /* Kurumuş ağaçlar: yapraksız gövde, çatallı dallar, dalda örümcek ağı */
  for (const [ox, oz, boy] of [[-9, 2, 5], [8, -6, 6], [9, 5, 4], [-7, -8, 5]]) {
    const x = A.x + ox, z = A.z + oz, h = H(x, z);
    if (h == null) continue;
    const sx = Math.sign(ox), sz = Math.sign(oz);
    for (let y = h + 1; y <= h + boy; y++) set(x, y, z, KUTUK);
    set(x + sx, h + boy - 1, z, KUTUK); set(x + 2 * sx, h + boy, z, KUTUK);
    set(x, h + boy - 2, z + sz, KUTUK); set(x, h + boy - 1, z + 2 * sz, KUTUK);
    set(x + 2 * sx, h + boy + 1, z, AG);
  }
  /* İskelet yuvası (yıkık duvarın dibinde), kızıl mantarlar ve örümcek ağları */
  const yx = A.x - 9, yz = A.z - 3, yh = H(yx, yz);
  if (yh != null) { set(yx, yh + 1, yz, YUVA); for (const [a, c] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) set(yx + a, yh + 1, yz + c, AG); }
  for (let k = 0; k < 14; k++) {
    const x = A.x + Math.round((rk(k, 5, 0, 3) - 0.5) * 24), z = A.z + Math.round((rk(k, 6, 0, 3) - 0.5) * 24), h = H(x, z);
    if (h == null || Math.max(Math.abs(x - A.x), Math.abs(z - A.z)) <= 5 || Math.abs(x - A.x) <= 1 && z > A.z) continue;
    if (al(x, h + 1, z) === 0 && al(x, h, z) !== MAGMA) set(x, h + 1, z, k % 3 === 0 ? AG : MANTAR);
  }
}
