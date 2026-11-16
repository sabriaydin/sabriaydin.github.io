/* HungerMan - harita hesabı: bir parçanın üstten görünümü (sütun başına en üst blok ve yükseklik)
   Tarayıcı nesnesi kullanmaz; ana iş parçacığında ve keşif işçisinde ortak kullanılır. */
import { PB, PY, dizin } from '../sabitler.js';
import { KATI, SIVI, LAV, BLOKLAR } from '../bloklar.js';

/* Bir sütunun haritadaki karşılığı: [blok, yükseklik]; su için blok = taban bloğu, yükseklik = 128 + derinlik */
export function sutun(al) {
  for (let y = PY - 1; y > 0; y--) {
    const b = al(y);
    if (!b) continue;
    if (LAV[b]) return [b, y];
    if (SIVI[b]) {
      let d = 0, yy = y;
      while (yy > 0 && SIVI[al(yy)] && !LAV[al(yy)]) { d++; yy--; }
      return [al(yy) || 7, 128 + Math.min(127, d)];
    }
    if (!KATI[b] && !(BLOKLAR[b] && BLOKLAR[b].ekin != null)) continue;   // ot, çiçek, meşale görünmez; ekinler görünür
    return [b, y];
  }
  return [0, 0];
}
export function parcaHesapla(v) {
  const t = new Uint8Array(PB * PB * 2);
  for (let z = 0; z < PB; z++) for (let x = 0; x < PB; x++) {
    const [id, h] = sutun(y => v[dizin(x, y, z)]);
    t[z * PB + x] = id < 256 ? id : (BLOKLAR[id] && BLOKLAR[id].harita) || 2; t[PB * PB + z * PB + x] = h;   // 0.18.0: yeni bloklar haritada benzer renkli eski bir blokla gösterilir
  }
  return t;
}
