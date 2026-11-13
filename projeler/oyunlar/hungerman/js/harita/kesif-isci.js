/* HungerMan - keşif işçisi: geliştirici modundaki toplu harita keşfi için parçaları arka planda üretir
   ve yalnızca üstten görünümlerini (parça başına 512 bayt) ana iş parçacığına gönderir.
   Kıtadan uzak açık deniz parçaları için tam parça üretilmez: sütunların yüksekliği ve deniz tabanı bloğu doğrudan
   arazi işlevinden hesaplanır (aynı sonucu çok daha hızlı verir). Batık bulunan parçalar her zaman tam üretilir. */
import { Uretici } from '../dunya/uretici.js';
import { batiklarAlan } from '../dunya/batik-uretici.js';
import { parcaHesapla } from './harita-hesap.js';
import { PB, DENIZ, KITA_YARICAP } from '../sabitler.js';

let uretici = null;
const o = {};
function acikDeniz(cx, cz) {
  const mx = (cx + 0.5) * PB, mz = (cz + 0.5) * PB;
  if (Math.hypot(mx, mz) < KITA_YARICAP * 1.08) return null;
  if (batiklarAlan(uretici, cx * PB - 8, cz * PB - 8, cx * PB + PB + 8, cz * PB + PB + 8).length) return null;
  const t = new Uint8Array(PB * PB * 2);
  for (let z = 0; z < PB; z++) for (let x = 0; x < PB; x++) {
    const X = cx * PB + x, Z = cz * PB + z;
    uretici.kolon(X, Z, o);
    if (o.h >= DENIZ - 4 || o.c > -0.3) return null;   // kıyıya ya da adaya yakın: tam üretim
    t[z * PB + x] = uretici.ustBlok(o, X, Z);
    t[PB * PB + z * PB + x] = 128 + Math.min(127, DENIZ - o.h);
  }
  return t;
}
self.onmessage = e => {
  const m = e.data;
  if (m.tur === 'baslat') { uretici = new Uretici(m.tohum); return; }
  if (m.tur === 'is') {
    const n = m.l.length / 2, v = new Uint8Array(n * 512);
    for (let i = 0; i < n; i++) {
      const cx = m.l[i * 2], cz = m.l[i * 2 + 1];
      v.set(acikDeniz(cx, cz) || parcaHesapla(uretici.parcaUret(cx, cz)), i * 512);
    }
    self.postMessage({ tur: 'is', l: m.l, v }, [v.buffer]);
  }
};
