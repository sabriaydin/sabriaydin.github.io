/* HungerMan - arka plan işçisi: parça üretimi ve meshleme ana iş parçacığını yormadan burada yapılır */
import { ureticiOlustur } from './uretici.js';
import { dunyaSurumAyarla, PB, DB, diyarMi } from '../sabitler.js';
import { meshle } from './meshleyici.js';
import { BLOKLAR, BLOK_UST, EKIN_SONRAKI, SU_SEVIYE } from '../bloklar.js';
import { PY, DENIZ } from '../sabitler.js';

/* 0.51.2: ana iş parçacığının parça yüklenince taradığı bloklar (ışık kaynakları, ekinler, yüzeye yakın su) burada bulunur;
   ana iş parçacığı 65 536 bloğun hepsine değil yalnızca bu dizinlere bakar. En yüksek dolu katman da burada hesaplanır. */
const OZEL = new Uint8Array(BLOK_UST), SU = new Uint8Array(BLOK_UST);
for (const b of BLOKLAR) if (b && (b.mesale || b.mekanik || b.elektrik || b.kovan || b.id === 58 || b.id === 59)) OZEL[b.id] = 1;
for (let i = 0; i < BLOK_UST; i++) { if (EKIN_SONRAKI[i]) OZEL[i] = 1; if (SU_SEVIYE[i]) SU[i] = 1; }
const SU_ALT = (DENIZ - 10) * PB * PB;
function tara(v) {
  const l = []; let ust = 0;
  for (let i = 0; i < v.length; i++) { const id = v[i]; if (!id) continue; ust = i; if (OZEL[id] || (SU[id] && i >= SU_ALT)) l.push(i); }
  return { ozel: Uint32Array.from(l), ust: Math.floor(ust / (PB * PB)) };
}

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
      const v = uretici.parcaUret(m.cx, m.cz), t = tara(v);
      self.postMessage({ tur: 'uret', no: m.no, cx: m.cx, cz: m.cz, v, ozel: t.ozel, ust: t.ust }, [v.buffer, t.ozel.buffer]);
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
