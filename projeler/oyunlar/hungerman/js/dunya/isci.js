/* HungerMan - arka plan işçisi: parça üretimi ve meshleme ana iş parçacığını yormadan burada yapılır */
import { ureticiOlustur } from './uretici.js';
import { dunyaSurumAyarla, PB, DB, diyarMi } from '../sabitler.js';
import { meshle } from './meshleyici.js';

let uretici = null;

/* 0.41.0: biyom tonu tablosu: parçanın ve bir blokluk kenarının her sütunu için [çimen rgb, yaprak rgb, su rgb] (yalnız sürüm 2 dünyalarında) */
function tonTablosu(cx, cz) {
  if (!uretici || !uretici.ton || diyarMi(cx * PB)) return null;
  const t = new Float32Array(DB * DB * 9), o = {};
  for (let z = -1; z <= PB; z++) for (let x = -1; x <= PB; x++) t.set(uretici.ton(uretici.kolon(cx * PB + x, cz * PB + z, o)), ((z + 1) * DB + x + 1) * 9);
  return t;
}

self.onmessage = e => {
  const m = e.data;
  try {
    if (m.tur === 'baslat') { dunyaSurumAyarla(m.surum || 1); uretici = ureticiOlustur(m.tohum, m.surum || 1); self.postMessage({ tur: 'hazir', no: m.no }); return; }
    if (m.tur === 'uret') {
      const v = uretici.parcaUret(m.cx, m.cz);
      self.postMessage({ tur: 'uret', no: m.no, cx: m.cx, cz: m.cz, v }, [v.buffer]);
      return;
    }
    if (m.tur === 'meshle') {
      const r = meshle(m.P, m.H, tonTablosu(m.cx, m.cz));
      const tr = [];
      for (const k of ['opak', 'su', 'alt']) for (const a of ['p', 'u', 'l', 'i', 't']) tr.push(r[k][a].buffer);
      self.postMessage({ tur: 'meshle', no: m.no, cx: m.cx, cz: m.cz, surum: m.surum, r }, tr);
    }
  } catch (err) {
    self.postMessage({ tur: 'hata', no: m.no, mesaj: String(err && err.stack || err) });
  }
};
