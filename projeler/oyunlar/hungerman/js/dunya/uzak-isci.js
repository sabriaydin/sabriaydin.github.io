/* HungerMan - 0.41.0: uzak arazi işçisi: görüş mesafesinin ötesindeki arazinin seyrek ızgaralı yükseklik ve yüzey bilgisini üretir
   (parça üretilmez; arazi işlevinden doğrudan hesaplanır). Çıktı: köşe başına yüzey yüksekliği, yüzey bloğu ve tür (0 kara, 1 su, 2 orman) */
import { ureticiOlustur, BY } from './uretici.js';
import { dunyaSurumAyarla, DENIZ } from '../sabitler.js';

let uretici = null;
const ORMAN_YAPRAK = { [BY.ORMAN]: 9, [BY.SIK]: 9, [BY.HUS]: 13, [BY.TAYGA]: 11, [BY.BATAKLIK]: 9, [BY.MANGROV]: 3006, [BY.SONBAHAR]: 3003, [BY.MANTAR]: 3008 };
self.onmessage = e => {
  const m = e.data;
  if (m.tur === 'baslat') { dunyaSurumAyarla(m.surum || 1); uretici = ureticiOlustur(m.tohum, m.surum || 1); return; }
  if (m.tur === 'karo' && uretici) {
    const n = m.boy / m.adim + 1, h = new Float32Array(n * n), id = new Uint16Array(n * n), tur = new Uint8Array(n * n), o = {};
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const X = m.x0 + i * m.adim, Z = m.z0 + j * m.adim, k = j * n + i;
      uretici.kolon(X, Z, o);
      const su = o.su ?? DENIZ;
      if (o.h < su) { h[k] = su + 0.88; id[k] = 7; tur[k] = 1; continue; }
      h[k] = o.h + 1;
      const y = ORMAN_YAPRAK[o.ab ?? o.b] ?? ORMAN_YAPRAK[o.b];
      if (y && !(o.b === BY.DAG && o.h > DENIZ + 85)) { id[k] = y; tur[k] = 2; h[k] += 4; }
      else id[k] = uretici.ustBlok(o, X, Z);
    }
    self.postMessage({ tur: 'karo', k: m.k, n, h, id, t: tur }, [h.buffer, id.buffer, tur.buffer]);
  }
};
