/* HungerMan - arka plan işçisi: parça üretimi ve meshleme ana iş parçacığını yormadan burada yapılır */
import { Uretici } from './uretici.js';
import { meshle } from './meshleyici.js';

let uretici = null;

self.onmessage = e => {
  const m = e.data;
  try {
    if (m.tur === 'baslat') { uretici = new Uretici(m.tohum); self.postMessage({ tur: 'hazir', no: m.no }); return; }
    if (m.tur === 'uret') {
      const v = uretici.parcaUret(m.cx, m.cz);
      self.postMessage({ tur: 'uret', no: m.no, cx: m.cx, cz: m.cz, v }, [v.buffer]);
      return;
    }
    if (m.tur === 'meshle') {
      const r = meshle(m.P);
      const tr = [];
      for (const k of ['opak', 'su']) for (const a of ['p', 'u', 'l', 'i']) tr.push(r[k][a].buffer);
      self.postMessage({ tur: 'meshle', no: m.no, cx: m.cx, cz: m.cz, surum: m.surum, r }, tr);
    }
  } catch (err) {
    self.postMessage({ tur: 'hata', no: m.no, mesaj: String(err && err.stack || err) });
  }
};
