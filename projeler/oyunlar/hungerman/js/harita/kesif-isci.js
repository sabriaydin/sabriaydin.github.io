/* HungerMan - keşif işçisi: geliştirici modundaki toplu harita keşfi için parçaları arka planda üretir
   ve yalnızca üstten görünümlerini (parça başına 512 bayt) ana iş parçacığına gönderir. */
import { Uretici } from '../dunya/uretici.js';
import { parcaHesapla } from './harita-hesap.js';

let uretici = null;
self.onmessage = e => {
  const m = e.data;
  if (m.tur === 'baslat') { uretici = new Uretici(m.tohum); return; }
  if (m.tur === 'is') {
    const n = m.l.length / 2, v = new Uint8Array(n * 512);
    for (let i = 0; i < n; i++) v.set(parcaHesapla(uretici.parcaUret(m.l[i * 2], m.l[i * 2 + 1])), i * 512);
    self.postMessage({ tur: 'is', l: m.l, v }, [v.buffer]);
  }
};
