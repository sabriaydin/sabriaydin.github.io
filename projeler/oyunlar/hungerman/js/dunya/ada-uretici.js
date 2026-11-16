/* HungerMan - Lanetli Ada (0.30.6)
   Yeraltı Diyarı'nın dünyadaki tek girişi: Issız Deniz'in (açık okyanusun derin bir yerinin) ortasında, kül ve obsidyenden küçük, karanlık bir ada.
   Adanın ortasında yanan kadim Diyar Geçidi, çevresinde obsidyen sivri kayalar, kurumuş ağaçlar, örümcek ağları ve bir iskelet yuvası bulunur.
   Konum tohumdan belirlenir (her dünyada bir tane); dünya üretiminde (işçide) ve oyunda aynı işlevle bulunur. */
import { PB, PY, DENIZ, dizin } from '../sabitler.js';
import { karistir, uretec, karma3 } from '../rastgele.js';

const R = 10;   // adanın en geniş yarıçapı
export const ADA_AD = 'Lanetli Ada';
const OBS = 515, KUL = 513, KOR = 512, TUGLA = 518, GECIT = 516, KUTUK = 10, AG = 148, YUVA = 58, SANDIK = 50;

/* Adanın konumu: başlangıçtan 900-2600 blok uzakta, çevresi en az 50 blok açık deniz olan derin bir nokta */
export function lanetliAda(u) {
  if (u.lanetliAdaB !== undefined) return u.lanetliAdaB;
  const r = uretec(karistir(u.tohum ^ 0x61646131));
  const a0 = r() * Math.PI * 2;
  const derin = (x, z, s) => { const o = u.kolon(x, z, {}); return o.h < DENIZ - s; };
  let A = null;
  for (let d = 900; d <= 2600 && !A; d += 70) {
    for (let k = 0; k < 24 && !A; k++) {
      const a = a0 + k * Math.PI * 2 / 24, x = Math.round(Math.cos(a) * d), z = Math.round(Math.sin(a) * d);
      if (!derin(x, z, 10)) continue;
      let acik = true;
      for (let t = 0; t < 12 && acik; t++) { const b = t * Math.PI / 6; if (!derin(Math.round(x + Math.cos(b) * 50), Math.round(z + Math.sin(b) * 50), 4)) acik = false; }
      if (acik) A = { x, z };
    }
  }
  if (!A) { const x = Math.round(Math.cos(a0) * 1400), z = Math.round(Math.sin(a0) * 1400); A = { x, z }; }
  const T = DENIZ + 3;   // ada tepesi
  A.ust = T;
  A.gecit = { x: A.x - 1, y: T + 1, z: A.z };   // geçidin sol alt iç hücresi (x-y düzlemi)
  return (u.lanetliAdaB = A);
}
export const adaYakin = (u, x, z, r = 24) => { const A = lanetliAda(u); return Math.hypot(x - A.x, z - A.z) <= r; };

/* Adanın biçimi: merkezden uzaklığa ve gürültüye göre tepe yüksekliği (yoksa null) */
function adaYukseklik(u, A, x, z) {
  const dx = x - A.x, dz = z - A.z, d = Math.hypot(dx, dz);
  const kenar = R - 2.5 + 2.5 * karma3(u.tohum ^ 0x616461, Math.round(Math.atan2(dz, dx) * 3), 0, 0);
  if (d > kenar) return null;
  return Math.max(DENIZ, A.ust - Math.floor(d / 3.2) - (d > kenar - 1.5 ? 1 : 0));
}

export function adaYaz(u, v, x0, z0) {
  const A = lanetliAda(u);
  if (A.x + R + 2 < x0 || A.x - R - 2 > x0 + PB - 1 || A.z + R + 2 < z0 || A.z - R - 2 > z0 + PB - 1) return;
  const set = (x, y, z, id) => { if (x < x0 || x >= x0 + PB || z < z0 || z >= z0 + PB || y < 1 || y >= PY) return; v[dizin(x - x0, y, z - z0)] = id; };
  const al = (x, y, z) => (x < x0 || x >= x0 + PB || z < z0 || z >= z0 + PB ? -1 : v[dizin(x - x0, y, z - z0)]);
  const rk = (x, y, z, s = 0) => karma3(u.tohum ^ 0x6c616e ^ s, x, y, z);
  /* Gövde: deniz tabanından tepeye; içi obsidyen ve kül tuğlası, üstü kül kumu ve kor taşı */
  for (let z = A.z - R - 1; z <= A.z + R + 1; z++) for (let x = A.x - R - 1; x <= A.x + R + 1; x++) {
    if (x < x0 || x >= x0 + PB || z < z0 || z >= z0 + PB) continue;
    const h = adaYukseklik(u, A, x, z);
    if (h == null) continue;
    let taban = DENIZ; while (taban > 2 && (al(x, taban, z) === 7 || al(x, taban, z) === 0 || al(x, taban, z) === 31 || al(x, taban, z) === 68)) taban--;
    for (let y = taban; y <= h; y++) {
      const ust = y === h;
      set(x, y, z, ust ? (rk(x, y, z) < 0.72 ? KUL : KOR) : rk(x, y, z, 1) < 0.6 ? OBS : TUGLA);
    }
    for (let y = h + 1; y <= DENIZ; y++) set(x, y, z, KUL);
  }
  /* Obsidyen sivri kayalar: kıyıda halka */
  for (let k = 0; k < 7; k++) {
    const a = k * Math.PI * 2 / 7 + rk(k, 0, 0, 2) * 0.6, d = R - 3.5 + rk(k, 1, 0, 2) * 1.5;
    const x = Math.round(A.x + Math.cos(a) * d), z = Math.round(A.z + Math.sin(a) * d), h = adaYukseklik(u, A, x, z);
    if (h == null) continue;
    const boy = 2 + Math.floor(rk(k, 2, 0, 2) * 4);
    for (let y = h + 1; y <= h + boy; y++) set(x, y, z, OBS);
    if (boy > 3) set(x + (rk(k, 3, 0, 2) < 0.5 ? 1 : -1), h + 1, z, OBS);
  }
  /* Kurumuş ağaçlar: yapraksız gövde ve tek dal */
  for (const [ox, oz, boy] of [[-5, 3, 4], [4, -4, 5], [5, 4, 3]]) {
    const x = A.x + ox, z = A.z + oz, h = adaYukseklik(u, A, x, z);
    if (h == null) continue;
    for (let y = h + 1; y <= h + boy; y++) set(x, y, z, KUTUK);
    set(x + Math.sign(ox), h + boy - 1, z, KUTUK);
    set(x + Math.sign(ox), h + boy, z, AG);
  }
  /* Kadim geçit: adanın ortasında, yanar hâlde */
  const G = A.gecit, T = A.ust;
  for (let y = T; y <= T + 4; y++) for (let x = G.x - 1; x <= G.x + 2; x++) {
    const kenar = x === G.x - 1 || x === G.x + 2 || y === T || y === T + 4;
    set(x, y, G.z, kenar ? OBS : GECIT);
  }
  /* Geçidin önünde ve arkasında basamak; çevresi kül */
  for (const dz of [-1, 1]) for (let x = G.x - 1; x <= G.x + 2; x++) set(x, T, G.z + dz, OBS);
  /* İskelet yuvası, örümcek ağları ve küçük bir sandık */
  const yz = A.z + 4, yx = A.x - 3, yh = adaYukseklik(u, A, yx, yz);
  if (yh != null) {
    set(yx, yh + 1, yz, YUVA);
    for (const [a, c] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) set(yx + a, yh + 1, yz + c, AG);
  }
  const sx = A.x + 3, sz = A.z + 3, sh = adaYukseklik(u, A, sx, sz);
  if (sh != null) set(sx, sh + 1, sz, SANDIK);
  for (let k = 0; k < 6; k++) {
    const x = A.x + Math.round((rk(k, 5, 0, 3) - 0.5) * 12), z = A.z + Math.round((rk(k, 6, 0, 3) - 0.5) * 12), h = adaYukseklik(u, A, x, z);
    if (h != null && al(x, h + 1, z) === 0) set(x, h + 1, z, AG);
  }
}
