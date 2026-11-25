/* HungerMan - prosedürel dokular: tüm blok dokuları, eşya simgeleri ve kırılma çatlakları kodla çizilir (dış görsel dosyası yoktur) */
import { DOKULAR, T, BLOKLAR, ESYALAR, CIZIM, C_KUP, YUZ_DOKU, YUN_RENKLERI, ATLAS_N } from '../bloklar.js';
import { uretec } from '../rastgele.js';
import { COKLU } from '../coklu.js';

const D = 16;

/* ---------- Renk yardımcıları ---------- */
/* 0.23.0: üç haneli renk kodları (#888) da çözülür; önceden kırmızımsı yanlış renk veriyordu (üretim masasındaki kırmızı lekeler) */
function hex(h) { h = h.replace('#', ''); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function karis(c, k) { return [c[0] * k, c[1] * k, c[2] * k]; }
function rgba(c, a = 1) { return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`; }

class Piksel {
  constructor(tohum) { this.d = new Uint8ClampedArray(D * D * 4); this.r = uretec(tohum); }
  set(x, y, c, a = 255) { if (x < 0 || y < 0 || x >= D || y >= D) return; const i = (y * D + x) * 4; this.d[i] = c[0]; this.d[i + 1] = c[1]; this.d[i + 2] = c[2]; this.d[i + 3] = a; }
  al(x, y) { const i = (y * D + x) * 4; return [this.d[i], this.d[i + 1], this.d[i + 2], this.d[i + 3]]; }
  /* Taban renk + gürültü */
  doldur(renk, sap = 0.12, a = 255) {
    const c = hex(renk);
    for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) this.set(x, y, karis(c, 1 + (this.r() * 2 - 1) * sap), a);
  }
  lekeler(renk, adet, boy = 1, sap = 0.1) {
    const c = hex(renk);
    for (let n = 0; n < adet; n++) {
      const x = Math.floor(this.r() * D), y = Math.floor(this.r() * D);
      for (let k = 0; k < boy; k++) this.set(x + Math.floor(this.r() * 3) - 1, y + Math.floor(this.r() * 3) - 1, karis(c, 1 + (this.r() * 2 - 1) * sap));
    }
  }
  tuval() { const cv = document.createElement('canvas'); cv.width = cv.height = D; cv.getContext('2d').putImageData(new ImageData(this.d, D, D), 0, 0); cv.veri = this.d; return cv; }   // veri: piksel dizisi (geri okuma gerekmez)
}

/* ---------- Döşeme ressamları ---------- */
function cerceve(p) { const a = hex('#c89a48'), k = hex('#7a5424'); for (let i = 0; i < D; i++) { p.set(i, 0, a); p.set(0, i, a); p.set(i, 15, k); p.set(15, i, k); } }
function kumDuz(p) { p.doldur('#dac98c', 0.03); const a = hex('#e8d9a2'), k = hex('#bfae74'); for (let i = 0; i < D; i++) { p.set(i, 0, a); p.set(0, i, a); p.set(i, 15, k); p.set(15, i, k); } }
function tasTaban(p) { p.doldur('#7f7f7f', 0.08); p.lekeler('#6a6a6a', 26, 2, 0.05); p.lekeler('#939393', 14, 1, 0.04); }
function cevher(p, renk, adet = 5) {
  tasTaban(p);
  const c = hex(renk);
  for (let n = 0; n < adet; n++) {
    const x = 1 + Math.floor(p.r() * 13), y = 1 + Math.floor(p.r() * 13);
    const s = [[0, 0], [1, 0], [0, 1], [1, 1], [-1, 0], [0, -1]].slice(0, 3 + Math.floor(p.r() * 3));
    for (const [dx, dy] of s) p.set(x + dx, y + dy, karis(c, 0.85 + p.r() * 0.3));
    p.set(x, y, karis(c, 1.25));
  }
}
function kalas(p, renk) {
  p.doldur(renk, 0.06);
  const c = hex(renk);
  for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) {
    if (y % 4 === 3) p.set(x, y, karis(c, 0.62));
    else if ((x + (Math.floor(y / 4) % 2) * 7) % 16 === 0) p.set(x, y, karis(c, 0.7));
    else if (p.r() < 0.12) p.set(x, y, karis(c, 0.88));
  }
}
function kabuk(p, renk, koyu) {
  p.doldur(renk, 0.08);
  const c = hex(koyu);
  for (let x = 0; x < D; x += 1) if (p.r() < 0.45) for (let y = 0; y < D; y++) if (p.r() < 0.7) p.set(x, y, karis(c, 0.9 + p.r() * 0.2));
}
function halka(p, dis, ic, koyu) {
  p.doldur(dis, 0.06);
  const a = hex(ic), k = hex(koyu);
  for (let y = 1; y < 15; y++) for (let x = 1; x < 15; x++) {
    const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5));
    p.set(x, y, Math.floor(d) % 2 === 0 ? karis(k, 1 + p.r() * 0.08) : karis(a, 1 + p.r() * 0.08));
  }
}
function yaprak(p, renk, bosluk = 0.18) {
  const c = hex(renk);
  for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) {
    if (p.r() < bosluk) p.set(x, y, [0, 0, 0], 0);
    else p.set(x, y, karis(c, 0.75 + p.r() * 0.45));
  }
}
function bitki(p, ciz) { for (let i = 0; i < D * D * 4; i++) p.d[i] = 0; ciz(p); }
function cizgi(p, x0, y0, x1, y1, c) {
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let e = dx + dy;
  for (;;) { p.set(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
}
function parke(p, renk = '#848484') {
  p.doldur(renk, 0.06);
  const c = hex(renk);
  /* Taş öbekleri: rastgele merkezlere en yakın bölgeler, sınırlar koyu */
  const m = []; for (let i = 0; i < 9; i++) m.push([p.r() * 16, p.r() * 16, 0.85 + p.r() * 0.3]);
  const bolge = (x, y) => { let en = 1e9, s = 0, en2 = 1e9; for (let i = 0; i < m.length; i++) { for (const ox of [-16, 0, 16]) for (const oy of [-16, 0, 16]) { const d = (x - m[i][0] - ox) ** 2 + (y - m[i][1] - oy) ** 2; if (d < en) { en2 = en; en = d; s = i; } else if (d < en2) en2 = d; } } return [s, Math.sqrt(en2) - Math.sqrt(en)]; };
  for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) {
    const [s, f] = bolge(x + 0.5, y + 0.5);
    p.set(x, y, f < 1.1 ? karis(c, 0.55) : karis(c, m[s][2] * (0.94 + p.r() * 0.1)));
  }
}
function tugla(p, renk, harc) {
  const c = hex(renk), h = hex(harc);
  for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) {
    const sira = Math.floor(y / 4), ofs = sira % 2 ? 4 : 0;
    const harcMi = y % 4 === 3 || (x + ofs) % 8 === 7;
    p.set(x, y, harcMi ? karis(h, 0.95 + p.r() * 0.1) : karis(c, 0.88 + p.r() * 0.2));
  }
}

/* 0.24.0: elektrik dokularının yardımcıları */
function pervane(p, aci) {   // üç kanatlı pervane (saydam zemin)
  bitki(p, p => {
    const k = hex('#f2f3f4'), g = hex('#c4c8ce');
    for (let i = 0; i < 3; i++) {
      const a = aci + i * Math.PI * 2 / 3;
      for (let r = 1.5; r < 7.6; r += 0.35) {
        const w = r < 2.5 ? 0.6 : 1.1 - r * 0.07, cx = 7.5 + Math.cos(a) * r, cy = 7.5 + Math.sin(a) * r;
        for (let q = -w; q <= w; q += 0.5) p.set(Math.round(cx - Math.sin(a) * q), Math.round(cy + Math.cos(a) * q), q > 0 ? g : k);
      }
    }
    for (const [x, y] of [[7, 7], [8, 7], [7, 8], [8, 8]]) p.set(x, y, hex('#8a9098'));
  });
}
function suCarki(p, aci) {   // ahşap çark ve kepçeler
  kalas(p, '#6e5232');
  const c = hex('#a07a48'), k = hex('#4a3620');
  for (let a = 0; a < 40; a++) { const t = a / 40 * Math.PI * 2; p.set(Math.round(7.5 + Math.cos(t) * 6.5), Math.round(7.5 + Math.sin(t) * 6.5), k); }
  for (let i = 0; i < 6; i++) { const t = aci + i * Math.PI / 3; cizgi(p, 8, 8, Math.round(7.5 + Math.cos(t) * 6.5), Math.round(7.5 + Math.sin(t) * 6.5), c); const x = Math.round(7.5 + Math.cos(t) * 6.6), y = Math.round(7.5 + Math.sin(t) * 6.6); p.set(x, y, hex('#3a6ad8')); }
  for (const [x, y] of [[7, 7], [8, 7], [7, 8], [8, 8]]) p.set(x, y, hex('#5a5e66'));
}
function salter(p, acik) {
  p.doldur('#5a6068', 0.05); const k = hex('#3a3f46'), s = hex('#f2c230');
  for (let i = 0; i < D; i++) { p.set(i, 0, k); p.set(0, i, k); p.set(i, 15, k); p.set(15, i, k); }
  for (let x = 1; x < 15; x += 3) { p.set(x, 1, s); p.set(x + 1, 1, k); }
  for (let y = 4; y < 13; y++) for (let x = 5; x < 11; x++) p.set(x, y, karis(hex('#2a2e34'), 1));
  const l = hex(acik ? '#4ad86a' : '#d84a3a');
  for (let y = acik ? 4 : 9; y < (acik ? 8 : 13); y++) for (let x = 6; x < 10; x++) p.set(x, y, karis(l, y % 2 ? 0.9 : 1.05));
  p.set(12, 3, l); p.set(12, 4, l);
}
function ocakUst(p, acik) {
  p.doldur('#2a2d32', 0.05); const k = hex('#8a8e94');
  for (let i = 0; i < D; i++) { p.set(i, 0, k); p.set(0, i, k); p.set(i, 15, k); p.set(15, i, k); }
  const c = hex(acik ? '#ff5a24' : '#4a4e56'), c2 = hex(acik ? '#ffb040' : '#5c6068');
  for (const [cx, cy] of [[4.5, 4.5], [10.5, 10.5], [10.5, 4.5], [4.5, 10.5]]) for (let a = 0; a < 20; a++) { const t = a / 20 * Math.PI * 2; for (const r of [1.4, 2.6]) p.set(Math.round(cx + Math.cos(t) * r), Math.round(cy + Math.sin(t) * r), r > 2 ? c : c2); }
}
/* 0.29.0: ısıtıcı gövdesi: krem renkli, dikey dilimli panel radyatör */
function isitici(p) {
  p.doldur('#e8e4dc', 0.025); const k = hex('#c8c2b6');
  for (let x = 1; x < D; x += 3) for (let y = 0; y < D; y++) p.set(x, y, karis(k, 0.97 + p.r() * 0.05));
}
function bataryaYan(p, s) {
  p.doldur('#3c4249', 0.05); const k = hex('#2a2f35');
  for (let x = 0; x < D; x++) { p.set(x, 0, karis(k, 1.3)); p.set(x, 15, k); }
  for (let y = 5; y < 16; y++) { p.set(4, y, k); p.set(11, y, k); }
  for (let i = 0; i < 4; i++) { const y = 14 - i * 2, on = i < s; for (let x = 5; x < 11; x++) p.set(x, y, on ? karis(hex(s <= 1 ? '#e8b030' : '#5ae07a'), x === 5 ? 1.15 : 1) : hex('#1e2226')); }
  p.set(7, 2, hex('#e8c040')); p.set(8, 3, hex('#e8c040')); p.set(7, 4, hex('#e8c040'));
}
const RESSAM = {
  cimen_ust: p => { p.doldur('#5d9b39', 0.14); p.lekeler('#4c8a2e', 20, 1); p.lekeler('#71b247', 12, 1); },
  cimen_yan: p => { RESSAM.toprak(p); const g = hex('#5d9b39'); for (let x = 0; x < D; x++) { const h = 3 + Math.floor(p.r() * 2.2); for (let y = 0; y < h; y++) p.set(x, y, karis(g, 0.82 + p.r() * 0.35)); } },
  toprak: p => { p.doldur('#7a5536', 0.1); p.lekeler('#5e4029', 18, 1); p.lekeler('#8f6847', 10, 1); },
  tas: tasTaban,
  anakaya: p => { p.doldur('#4d4d4d', 0.2); p.lekeler('#222', 24, 2); p.lekeler('#777', 10, 1); },
  kum: p => { p.doldur('#dccf9b', 0.06); p.lekeler('#c9b984', 18, 1); p.lekeler('#ebe0b2', 10, 1); },
  cakil: p => { p.doldur('#837d79', 0.1); for (let i = 0; i < 14; i++) { const x = Math.floor(p.r() * 15), y = Math.floor(p.r() * 15), k = 0.65 + p.r() * 0.6, c = karis(hex('#8a8580'), k); p.set(x, y, c); p.set(x + 1, y, c); p.set(x, y + 1, c); p.set(x + 1, y + 1, karis(c, 0.8)); } },
  su: p => { p.doldur('#2e63c6', 0.05); const c = hex('#5b8ee0'); for (let y = 1; y < D; y += 4) for (let x = 0; x < D; x++) if (Math.sin(x * 0.8 + y) > 0.55) p.set(x, (y + Math.round(Math.sin(x * 0.5))) & 15, c); },
  mese_yan: p => kabuk(p, '#6b502c', '#4e3a1f'),
  mese_ust: p => halka(p, '#5b4325', '#b08b55', '#94713f'),
  mese_yaprak: p => yaprak(p, '#3f7f2a'),
  ladin_yan: p => kabuk(p, '#4a3521', '#33241a'),
  ladin_ust: p => halka(p, '#3d2c1c', '#8e6b44', '#735433'),
  ladin_yaprak: p => yaprak(p, '#2f5b3b', 0.14),
  hus_yan: p => { p.doldur('#dedbd2', 0.05); const k = hex('#2b2b2b'); for (let i = 0; i < 9; i++) { const x = Math.floor(p.r() * 14), y = Math.floor(p.r() * 16), w = 1 + Math.floor(p.r() * 3); for (let j = 0; j < w; j++) p.set(x + j, y, k); } },
  hus_ust: p => halka(p, '#cfcac0', '#c9a970', '#a98a54'),
  hus_yaprak: p => yaprak(p, '#6b9b3d'),
  kalas: p => kalas(p, '#b48a52'),
  kalas_koyu: p => kalas(p, '#7a5a37'),
  kalas_acik: p => kalas(p, '#d4c08a'),
  parke: p => parke(p),
  komur_cev: p => cevher(p, '#1d1d1d', 6),
  demir_cev: p => cevher(p, '#d8ae8f'),
  bakir_cev: p => { cevher(p, '#e07c3c', 4); cevher2(p, '#4fa38a', 2); },
  altin_cev: p => cevher(p, '#f6d43e'),
  elmas_cev: p => cevher(p, '#5fefe3', 4),
  kar: p => { p.doldur('#f2f6fb', 0.03); p.lekeler('#dfe8f2', 10, 1, 0.02); },
  kar_yan: p => { RESSAM.toprak(p); const g = hex('#f2f6fb'); for (let x = 0; x < D; x++) { const h = 3 + Math.floor(p.r() * 2.5); for (let y = 0; y < h; y++) p.set(x, y, karis(g, 0.94 + p.r() * 0.06)); } },
  buz: p => { p.doldur('#9cc6f2', 0.05, 215); const c = hex('#d6ecff'); cizgi(p, 2, 13, 9, 3, c); cizgi(p, 8, 14, 14, 6, c); },
  kil: p => { p.doldur('#a0a6b3', 0.05); p.lekeler('#8f95a3', 10, 2, 0.03); },
  kumtasi_yan: p => { p.doldur('#d8c98f', 0.05); const c = hex('#c7b67a'); for (let x = 0; x < D; x++) { p.set(x, 4, c); p.set(x, 11, c); } for (let x = 0; x < D; x++) p.set(x, 0, karis(c, 1.05)); },
  kumtasi_ust: p => { p.doldur('#e0d29a', 0.04); },
  uzun_ot: p => bitki(p, p => { const c = hex('#5a9a37'); for (let i = 0; i < 9; i++) { let x = 2 + Math.floor(p.r() * 12); const h = 6 + Math.floor(p.r() * 9); for (let y = 15; y > 15 - h; y--) { p.set(x, y, karis(c, 0.75 + p.r() * 0.45)); if (p.r() < 0.25) x += p.r() < 0.5 ? -1 : 1; } } }),
  egrelti: p => bitki(p, p => { const c = hex('#3f7f35'); for (let i = 0; i < 4; i++) { const sx = 3 + i * 3; for (let y = 15; y > 3; y--) { const x = sx + Math.round((15 - y) * (i < 2 ? -0.25 : 0.25)); p.set(x, y, karis(c, 0.85 + p.r() * 0.3)); if (y % 2 === 0) { p.set(x - 1, y, karis(c, 1.1)); p.set(x + 1, y, karis(c, 0.9)); } } } }),
  gelincik: p => bitki(p, p => { const g = hex('#3f8a2d'); cizgi(p, 8, 15, 8, 7, g); p.set(7, 11, g); p.set(9, 10, g); const r = hex('#d8251f'); for (const [x, y] of [[7, 4], [8, 4], [9, 4], [6, 5], [7, 5], [8, 5], [9, 5], [10, 5], [7, 6], [8, 6], [9, 6], [8, 3]]) p.set(x, y, karis(r, 0.85 + p.r() * 0.3)); p.set(8, 5, [30, 20, 20]); }),
  karahindiba: p => bitki(p, p => { const g = hex('#3f8a2d'); cizgi(p, 8, 15, 8, 8, g); p.set(9, 12, g); const r = hex('#f2d22a'); for (const [x, y] of [[7, 5], [8, 5], [9, 5], [7, 6], [8, 6], [9, 6], [7, 7], [8, 7], [9, 7], [8, 4], [6, 6], [10, 6]]) p.set(x, y, karis(r, 0.85 + p.r() * 0.3)); }),
  mavi_cicek: p => bitki(p, p => { const g = hex('#3f8a2d'); cizgi(p, 8, 15, 8, 8, g); p.set(7, 12, g); const r = hex('#3d6fe0'); for (const [x, y] of [[8, 4], [7, 5], [9, 5], [6, 6], [8, 6], [10, 6], [7, 7], [9, 7], [8, 8]]) p.set(x, y, karis(r, 0.85 + p.r() * 0.3)); p.set(8, 6, [240, 240, 255]); }),
  cali_dolu: p => { RESSAM.cali_bos(p); const b = hex('#3a1640'); for (let i = 0; i < 9; i++) { const x = 3 + Math.floor(p.r() * 10), y = 4 + Math.floor(p.r() * 9); p.set(x, y, b); p.set(x + 1, y, karis(b, 1.4)); } },
  cali_bos: p => bitki(p, p => { const c = hex('#3e7a2c'); for (let y = 3; y < 16; y++) for (let x = 1; x < 15; x++) { const d = ((x - 7.5) / 7) ** 2 + ((y - 9.5) / 6.5) ** 2; if (d < 1 && p.r() < 0.78) p.set(x, y, karis(c, 0.7 + p.r() * 0.5)); } cizgi(p, 7, 15, 7, 12, hex('#5a4024')); }),
  kuru_cali: p => bitki(p, p => { const c = hex('#8a6a3d'); cizgi(p, 8, 15, 8, 9, c); cizgi(p, 8, 11, 4, 6, c); cizgi(p, 8, 10, 12, 5, c); cizgi(p, 6, 8, 7, 4, c); cizgi(p, 10, 7, 13, 8, c); }),
  yosun: p => bitki(p, p => { const c = hex('#3f8f4a'); for (let i = 0; i < 3; i++) { let x = 4 + i * 4; for (let y = 15; y >= 0; y--) { p.set(x, y, karis(c, 0.75 + p.r() * 0.45)); if (y % 3 === 0) p.set(x + (i % 2 ? 1 : -1), y, karis(c, 1.1)); if (p.r() < 0.3) x += p.r() < 0.5 ? -1 : 1; x = Math.max(1, Math.min(14, x)); } } }),
  /* 0.23.0: üretim masası: üstte 3×3 üretim ızgarası, yanlarda asılı çekiç, testere, kerpeten ve gönye */
  masa_ust: p => { kalas(p, '#b48a52'); const k = hex('#5a3d1f'), a = hex('#d2aa6e'); for (let i = 0; i < 16; i++) { p.set(i, 0, k); p.set(i, 15, k); p.set(0, i, k); p.set(15, i, k); }
    for (let y = 3; y < 13; y++) for (let x = 3; x < 13; x++) p.set(x, y, karis(a, 0.92 + p.r() * 0.1)); for (const t of [3, 6, 9, 12]) { cizgi(p, 3, t, 12, t, k); cizgi(p, t, 3, t, 12, k); } p.set(4, 4, hex('#9a9a9a')); p.set(5, 4, hex('#9a9a9a')); p.set(10, 10, hex('#7a5a32')); p.set(11, 11, hex('#7a5a32')); },
  masa_yan: p => { kalas(p, '#a07a46'); const k = hex('#5a3d1f'), m = hex('#a8acb4'), md = hex('#6e727a'), s = hex('#6b4a28');
    for (let i = 0; i < 16; i++) { p.set(i, 0, k); p.set(i, 1, karis(k, 1.2)); }
    for (let y = 6; y < 14; y++) p.set(4, y, s); for (let x = 2; x < 7; x++) { p.set(x, 4, m); p.set(x, 5, md); } p.set(2, 6, md);   // çekiç
    for (let y = 4; y < 11; y++) for (let x = 9; x < 13; x++) p.set(x, y, (x + y) % 5 ? m : md); for (let y = 5; y < 11; y += 2) p.set(8, y, md); for (let y = 4; y < 8; y++) { p.set(13, y, s); p.set(14, y, s); } },   // testere
  masa_on: p => { kalas(p, '#a07a46'); const k = hex('#5a3d1f'), m = hex('#a8acb4'), md = hex('#6e727a'), s = hex('#6b4a28');
    for (let i = 0; i < 16; i++) { p.set(i, 0, k); p.set(i, 1, karis(k, 1.2)); }
    cizgi(p, 3, 4, 3, 12, m); cizgi(p, 3, 12, 8, 12, m); cizgi(p, 4, 4, 4, 11, md);   // gönye
    cizgi(p, 10, 4, 12, 9, md); cizgi(p, 13, 4, 11, 9, m); cizgi(p, 11, 9, 10, 13, s); cizgi(p, 12, 9, 13, 13, s); },   // kerpeten
  firin_yan: p => parke(p, '#7c7c7c'),
  firin_ust: p => { p.doldur('#8f8f8f', 0.04); const k = hex('#6c6c6c'); for (let i = 0; i < 16; i++) { p.set(i, 0, k); p.set(i, 15, k); p.set(0, i, k); p.set(15, i, k); } },
  firin_on: p => { parke(p, '#7c7c7c'); const k = hex('#1c1c1c'); for (let y = 8; y < 14; y++) for (let x = 4; x < 12; x++) p.set(x, y, k); const a = hex('#c45a1c'); for (let x = 5; x < 11; x++) p.set(x, 13, karis(a, 0.8 + p.r() * 0.4)); for (let x = 3; x < 13; x++) p.set(x, 7, hex('#5a5a5a')); },
  cam: p => { for (let i = 0; i < D * D * 4; i++) p.d[i] = 0; const c = hex('#d9eef5'); for (let i = 0; i < 16; i++) { p.set(i, 0, c); p.set(i, 15, c); p.set(0, i, c); p.set(15, i, c); } cizgi(p, 3, 6, 6, 3, c); cizgi(p, 3, 8, 8, 3, c); cizgi(p, 10, 13, 13, 10, c); },
  tas_tugla: p => tugla(p, '#868686', '#5b5b5b'),
  kesme_tas: p => { p.doldur('#9a9a9a', 0.03); const k = hex('#787878'); for (let i = 0; i < 16; i++) { p.set(i, 0, k); p.set(i, 15, k); p.set(0, i, k); p.set(15, i, k); p.set(i, 7, karis(k, 1.1)); } },
  mantar: p => bitki(p, p => { const s = hex('#e8dcc4'); cizgi(p, 7, 15, 7, 10, s); cizgi(p, 8, 15, 8, 10, karis(s, 0.9)); const c = hex('#9a6a44'); for (let y = 6; y < 10; y++) for (let x = 3; x < 13; x++) { const d = ((x - 7.5) / 5) ** 2 + ((y - 9.5) / 3.6) ** 2; if (d < 1) p.set(x, y, karis(c, 0.85 + p.r() * 0.3)); } }),
  fidan_mese: p => fidan(p, '#3f7f2a', '#6b502c'),
  fidan_ladin: p => fidan(p, '#2f5b3b', '#4a3521'),
  fidan_hus: p => fidan(p, '#6b9b3d', '#d8d6cf'),
  yatak_ust: p => { p.doldur('#b8322c', 0.06); const b = hex('#efeae2'); for (let y = 0; y < 5; y++) for (let x = 1; x < 15; x++) p.set(x, y, karis(b, 0.95 + p.r() * 0.05)); const k = hex('#8a221e'); for (let x = 0; x < 16; x++) { p.set(x, 5, k); p.set(x, 10, karis(k, 1.1)); } },
  yatak_yan: p => { kalas(p, '#a07a46'); const r = hex('#b8322c'); for (let y = 0; y < 9; y++) for (let x = 0; x < 16; x++) p.set(x, y, karis(r, 0.9 + p.r() * 0.15)); const b = hex('#efeae2'); for (let x = 0; x < 16; x++) p.set(x, 3, b); },
  yun: p => { p.doldur('#e9e6df', 0.03); const k = hex('#d4d0c6'); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if ((x + y * 3) % 5 === 0 || (x * 2 + y) % 7 === 0) p.set(x, y, karis(k, 0.97 + p.r() * 0.06)); },
  kamp_atesi: p => bitki(p, p => { const o = hex('#6b4a28'), k = hex('#3a2a18'); for (let x = 1; x < 15; x++) { p.set(x, 14, karis(o, 1.05)); p.set(x, 15, k); } cizgi(p, 2, 12, 13, 15, o); cizgi(p, 2, 15, 13, 12, karis(o, 0.85)); const ates = ['#fff1a8', '#ffd24a', '#ff9a1f', '#e8541a']; for (let y = 3; y < 13; y++) { const w = Math.round((y - 2) * 0.45); for (let x = 8 - w; x <= 7 + w; x++) { const d = Math.abs(x - 7.5) / (w + 0.5) + (12 - y) / 12; if (p.r() < 0.85) p.set(x, y, hex(ates[Math.min(3, Math.floor(d * 2.2))])); } } }),
  /* Sandık (0.13.0): kutu 1..14 piksel aralığındadır; kapak çizgisi 6. satırda, köşelerde demir sac */
  sandik_yan: p => {
    p.doldur('#9c6a35', 0.05);
    const c = hex('#9c6a35'), k = hex('#3c2812'), m = hex('#8a8d94'), mk = hex('#5c5f66');
    for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { if ((y === 3 || y === 9 || y === 12) && x > 1 && x < 14) p.set(x, y, karis(c, 0.72)); else if (p.r() < 0.1) p.set(x, y, karis(c, 0.86)); }
    for (let i = 1; i < 15; i++) { p.set(1, i, k); p.set(14, i, k); p.set(i, 1, k); p.set(i, 14, k); p.set(i, 6, k); p.set(i, 5, karis(c, 0.6)); p.set(i, 7, karis(c, 1.15)); }
    for (const [x0, y0] of [[1, 1], [12, 1], [1, 12], [12, 12], [1, 6], [12, 6]]) for (let y = y0; y < y0 + 3 && y < 15; y++) for (let x = x0; x < x0 + 3; x++) if (y !== 6 || x0 === x) p.set(x, y, (x + y) % 3 ? m : mk);
  },
  sandik_on: p => { RESSAM.sandik_yan(p); },
  sandik_ust: p => {
    p.doldur('#a8763d', 0.05);
    const c = hex('#a8763d'), k = hex('#3c2812'), m = hex('#8a8d94');
    for (let y = 2; y < 14; y++) for (let x = 2; x < 14; x++) if (x % 4 === 1) p.set(x, y, karis(c, 0.75)); else if (p.r() < 0.1) p.set(x, y, karis(c, 0.88));
    for (let i = 1; i < 15; i++) { p.set(1, i, k); p.set(14, i, k); p.set(i, 1, k); p.set(i, 14, k); }
    for (const [x, y] of [[2, 2], [13, 2], [2, 13], [13, 13]]) { p.set(x, y, m); }
  },
  kiremit: p => { const c = hex('#a8442e'), k = hex('#6e2a1c'); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const sira = Math.floor(y / 4), ofs = sira % 2 ? 2 : 0; const kenar = y % 4 === 3 || (x + ofs) % 4 === 3; p.set(x, y, kenar ? karis(k, 0.9 + p.r() * 0.2) : karis(c, 0.85 + p.r() * 0.3 - (y % 4) * 0.05)); } },
  saman_yan: p => { p.doldur('#c9a640', 0.1); const k = hex('#9a7a28'); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (p.r() < 0.3) p.set(x, y, karis(k, 0.9 + p.r() * 0.3)); const b = hex('#6b4a22'); for (let x = 0; x < 16; x++) { p.set(x, 3, b); p.set(x, 12, b); } },
  saman_ust: p => { p.doldur('#d1ae48', 0.08); const k = hex('#a3832e'); for (let i = 0; i < 40; i++) { const x = Math.floor(p.r() * 14), y = Math.floor(p.r() * 16); p.set(x, y, k); p.set(x + 1, y, karis(k, 1.1)); } },
  bugday0: p => bitki(p, p => { const c = hex('#4f9a35'); for (let i = 0; i < 6; i++) { const x = 2 + i * 2 + Math.floor(p.r() * 2); for (let y = 15; y > 12 - Math.floor(p.r() * 2); y--) p.set(x, y, c); } }),
  bugday1: p => bitki(p, p => { const c = hex('#5aa83b'); for (let i = 0; i < 6; i++) { const x = 2 + i * 2; for (let y = 15; y > 9 - Math.floor(p.r() * 2); y--) p.set(x, y, karis(c, 0.85 + p.r() * 0.3)); } }),
  bugday2: p => bitki(p, p => { const c = hex('#8fae3e'); for (let i = 0; i < 6; i++) { const x = 2 + i * 2; for (let y = 15; y > 5 - Math.floor(p.r() * 2); y--) p.set(x, y, karis(c, 0.85 + p.r() * 0.3)); } }),
  bugday3: p => bitki(p, p => { const c = hex('#a8903a'), b = hex('#e0c25a'); for (let i = 0; i < 6; i++) { const x = 2 + i * 2; for (let y = 15; y > 6; y--) p.set(x, y, karis(c, 0.85 + p.r() * 0.3)); for (let y = 1; y < 7; y++) { p.set(x, y, karis(b, 0.85 + p.r() * 0.3)); if (y % 2) p.set(x + 1, y, karis(b, 0.8)); } } }),
  yol_ust: p => { p.doldur('#8a6a45', 0.08); p.lekeler('#6e5236', 22, 1); p.lekeler('#9a8a70', 14, 1); },
  yol_yan: p => { RESSAM.toprak(p); const g = hex('#8a6a45'); for (let x = 0; x < 16; x++) for (let y = 0; y < 2; y++) p.set(x, y, karis(g, 0.9 + p.r() * 0.2)); },
  yuva: p => { for (let i = 0; i < D * D * 4; i++) p.d[i] = 0; const c = hex('#3a3f46'), k = hex('#22262b'); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const kenar = x === 0 || y === 0 || x === 15 || y === 15; if (kenar || x % 4 === 0 || y % 5 === 0) p.set(x, y, kenar ? k : karis(c, 0.85 + p.r() * 0.3)); } const ates = hex('#c0401a'); p.set(7, 7, ates); p.set(8, 8, karis(ates, 1.2)); },
  lav: p => { p.doldur('#d4541a', 0.08); const a = hex('#ffb02e'), k = hex('#9a2a0e'); for (let i = 0; i < 26; i++) { const x = Math.floor(p.r() * 15), y = Math.floor(p.r() * 15); p.set(x, y, a); if (p.r() < 0.6) p.set(x + 1, y, karis(a, 0.9)); } for (let i = 0; i < 14; i++) { const x = Math.floor(p.r() * 16), y = Math.floor(p.r() * 16); p.set(x, y, k); } },
  yosunlu_parke: p => { parke(p, '#7e7e7e'); const g = hex('#4f7a38'); for (let i = 0; i < 30; i++) { const x = Math.floor(p.r() * 16), y = Math.floor(p.r() * 16); p.set(x, y, karis(g, 0.8 + p.r() * 0.4)); if (p.r() < 0.5) p.set(x, (y + 1) & 15, karis(g, 0.7)); } },
  kristal: p => bitki(p, p => { const renk = [hex('#7fe8ff'), hex('#b48cff'), hex('#9ff5e0')]; for (const [cx, h, w, ri] of [[4, 9, 2, 0], [8, 13, 3, 1], [12, 8, 2, 2], [6, 6, 1, 1], [10, 7, 1, 0]]) { const c = renk[ri]; for (let y = 15; y > 15 - h; y--) { const t = (15 - y) / h, ww = Math.max(0, Math.round(w * (1 - t * 0.8))); for (let x = cx - ww; x <= cx + ww; x++) p.set(x, y, karis(c, 0.8 + (x === cx - ww ? 0.35 : 0) + p.r() * 0.15)); } p.set(cx, 15 - h, [255, 255, 255]); } }),
  mercan_k: p => mercanBlok(p, '#d2453c', '#ff8a7a'),
  mercan_m: p => mercanBlok(p, '#8a3ab8', '#d08aff'),
  mercan_s: p => mercanBlok(p, '#d8b02a', '#ffe680'),
  mercan_dal_k: p => mercanDal(p, '#e0503e'),
  mercan_dal_m: p => mercanDal(p, '#9a48c8'),
  mercan_dal_s: p => mercanDal(p, '#e6c23a'),
  deniz_cayiri: p => bitki(p, p => { const c = hex('#3f9a52'); for (let i = 0; i < 7; i++) { let x = 1 + i * 2 + Math.floor(p.r() * 2); const h = 6 + Math.floor(p.r() * 8); for (let y = 15; y > 15 - h; y--) { p.set(x, y, karis(c, 0.75 + p.r() * 0.45)); if (p.r() < 0.18) x += p.r() < 0.5 ? -1 : 1; } } }),
  istiridye: p => { p.doldur('#7d7468', 0.12); const k = hex('#5a5248'), a = hex('#b8ae9e'); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const d = Math.hypot(x - 7.5, y - 9); if (Math.floor(d) % 3 === 0) p.set(x, y, karis(k, 0.9 + p.r() * 0.2)); if (d < 2.2) p.set(x, y, karis(a, 0.95 + p.r() * 0.1)); } },
  /* 0.11.0: kapılar, tırmanma merdiveni, renkli yünler, ekinler, tarla, örs, simya */
  kapi_alt: p => { kalas(p, '#a8783f'); const k = hex('#5a3d1f'); for (let i = 0; i < 16; i++) { p.set(0, i, k); p.set(15, i, k); p.set(i, 15, k); } for (let y = 3; y < 13; y++) { p.set(3, y, karis(k, 1.15)); p.set(12, y, karis(k, 1.15)); } for (let x = 3; x < 13; x++) { p.set(x, 3, karis(k, 1.15)); p.set(x, 12, karis(k, 1.15)); } const m = hex('#c9c2b0'); p.set(12, 1, m); p.set(13, 1, m); p.set(12, 2, karis(m, 0.7)); },
  kapi_ust: p => { kalas(p, '#a8783f'); const k = hex('#5a3d1f'); for (let i = 0; i < 16; i++) { p.set(0, i, k); p.set(15, i, k); p.set(i, 0, k); } for (let y = 3; y < 13; y++) for (let x = 3; x < 13; x++) { if (x === 7 || x === 8 || y === 7 || y === 8) p.set(x, y, karis(k, 1.2)); else p.set(x, y, [0, 0, 0], 0); } for (let x = 2; x < 14; x++) { p.set(x, 2, k); p.set(x, 13, k); } for (let y = 2; y < 14; y++) { p.set(2, y, k); p.set(13, y, k); } },
  tuzak_kapi: p => { kalas(p, '#9a6e3a'); const k = hex('#5a3d1f'); for (let i = 0; i < 16; i++) { p.set(0, i, k); p.set(15, i, k); p.set(i, 0, k); p.set(i, 15, k); } for (const [x0, y0] of [[3, 3], [9, 3], [3, 9], [9, 9]]) for (let y = y0; y < y0 + 4; y++) for (let x = x0; x < x0 + 4; x++) p.set(x, y, [0, 0, 0], 0); },
  tirmanma: p => bitki(p, p => { const c = hex('#8a6034'); for (let y = 0; y < 16; y++) { p.set(2, y, karis(c, 1.05)); p.set(3, y, karis(c, 0.85)); p.set(12, y, karis(c, 1.05)); p.set(13, y, karis(c, 0.85)); } for (let y = 1; y < 16; y += 4) for (let x = 2; x < 14; x++) { p.set(x, y, karis(c, 1.12 + p.r() * 0.1)); p.set(x, y + 1, karis(c, 0.75)); } }),
  havuc0: p => ekinCiz(p, 4, '#4f9a35', null),
  havuc1: p => ekinCiz(p, 7, '#4f9a35', null),
  havuc2: p => ekinCiz(p, 10, '#4a9a32', null),
  havuc3: p => ekinCiz(p, 11, '#3f8f2c', '#e8812a'),
  patates0: p => ekinCiz(p, 4, '#5aa83b', null),
  patates1: p => ekinCiz(p, 6, '#5aa83b', null),
  patates2: p => ekinCiz(p, 9, '#4f9a35', null, '#f0f0e0'),
  patates3: p => ekinCiz(p, 10, '#4a8f30', '#c8a25a', '#f0f0e0'),
  tarla: p => { p.doldur('#6e4b2e', 0.08); const k = hex('#4e321c'); for (let y = 1; y < 16; y += 4) for (let x = 0; x < 16; x++) { p.set(x, y, karis(k, 0.9 + p.r() * 0.2)); p.set(x, y + 1, karis(hex('#7d5636'), 0.95 + p.r() * 0.1)); } },
  tarla_islak: p => { p.doldur('#4a3220', 0.08); const k = hex('#2e1e12'); for (let y = 1; y < 16; y += 4) for (let x = 0; x < 16; x++) { p.set(x, y, karis(k, 0.9 + p.r() * 0.2)); p.set(x, y + 1, karis(hex('#56402c'), 0.95 + p.r() * 0.1)); } },
  ors: p => { p.doldur('#45474d', 0.06); const a = hex('#5d6068'), k = hex('#2e3034'); for (let i = 0; i < 16; i++) { p.set(i, 0, a); p.set(0, i, a); p.set(i, 15, k); p.set(15, i, k); } p.lekeler('#3a3c41', 10, 2, 0.05); },
  simya_ust: p => { parke(p, '#7c7c7c'); const c = hex('#3a3a3a'); for (let a = 0; a < 40; a++) { const t = a / 40 * Math.PI * 2; p.set(Math.round(7.5 + Math.cos(t) * 4), Math.round(7.5 + Math.sin(t) * 4), c); } },
  simya_sise: p => { p.doldur('#9a5ad8', 0.08, 235); const c = hex('#d8b8ff'); for (let y = 0; y < 16; y++) { p.set(2, y, c); p.set(3, y, karis(c, 0.9)); } for (let x = 0; x < 16; x++) p.set(x, 0, hex('#e8e0f0')); },
  demir_cubuk: p => { p.doldur('#8a8d94', 0.06); const c = hex('#b8bcc4'); for (let y = 0; y < 16; y++) { p.set(6, y, c); p.set(7, y, c); } },
  /* 0.13.0: yeni biyomlar ve mağaralar */
  kuru_cimen_ust: p => { p.doldur('#a7a94a', 0.12); p.lekeler('#8f9240', 20, 1); p.lekeler('#c0b65a', 14, 1); },
  kuru_cimen_yan: p => { RESSAM.toprak(p); const g = hex('#a7a94a'); for (let x = 0; x < D; x++) { const h = 3 + Math.floor(p.r() * 2.2); for (let y = 0; y < h; y++) p.set(x, y, karis(g, 0.82 + p.r() * 0.3)); } },
  bataklik_ust: p => { p.doldur('#4c6a33', 0.14); p.lekeler('#3e5a2a', 22, 1); p.lekeler('#5f7c3c', 10, 1); },
  bataklik_yan: p => { RESSAM.toprak(p); const g = hex('#4c6a33'); for (let x = 0; x < D; x++) { const h = 3 + Math.floor(p.r() * 2.2); for (let y = 0; y < h; y++) p.set(x, y, karis(g, 0.82 + p.r() * 0.3)); } },
  akasya_yan: p => kabuk(p, '#6d655d', '#4f4842'),
  akasya_ust: p => halka(p, '#5f5751', '#c06a35', '#a2552a'),
  akasya_yaprak: p => yaprak(p, '#6f8a2c', 0.2),
  fidan_akasya: p => bitki(p, p => { const k = hex('#6d655d'), y = hex('#6f8a2c'); cizgi(p, 8, 15, 8, 8, k); cizgi(p, 8, 10, 5, 7, k); for (let x = 3; x < 13; x++) for (let yy = 4; yy < 8; yy++) if (p.r() < 0.7 && Math.abs(x - 8) + Math.abs(yy - 5.5) < 6) p.set(x, yy, karis(y, 0.8 + p.r() * 0.4)); }),
  /* 0.14.0: büyü masası: üstte kırmızı örtü ve açık kitap, yanlarda koyu taş üzerinde parlayan mor işaretler */
  buyu_ust: p => {
    p.doldur('#8a1f2a', 0.08);
    const k = hex('#5a1018'), a = hex('#b8323e'), elmas = hex('#5ee8e0');
    for (let i = 0; i < 16; i++) { p.set(i, 0, k); p.set(0, i, k); p.set(i, 15, k); p.set(15, i, k); }
    for (const [x, y] of [[1, 1], [14, 1], [1, 14], [14, 14]]) { p.set(x, y, elmas); }
    for (let i = 2; i < 14; i++) { p.set(i, 1, a); p.set(1, i, a); }
    /* Açık kitap */
    const s = hex('#efe6cc'), sk = hex('#c9bc98'), cl = hex('#5a3a22');
    for (let y = 5; y < 12; y++) for (let x = 3; x < 13; x++) p.set(x, y, x === 7 || x === 8 ? sk : s);
    for (let x = 3; x < 13; x++) { p.set(x, 4, cl); p.set(x, 12, cl); }
    for (let y = 6; y < 11; y += 2) for (let x = 4; x < 7; x++) if (p.r() < 0.8) p.set(x, y, hex('#6a5a8a'));
    for (let y = 6; y < 11; y += 2) for (let x = 9; x < 12; x++) if (p.r() < 0.8) p.set(x, y, hex('#6a5a8a'));
  },
  buyu_yan: p => {
    p.doldur('#24202c', 0.1); p.lekeler('#2f2938', 18, 2, 0.06);
    /* Üstte sarkan örtü kenarı */
    const r = hex('#8a1f2a'), rk = hex('#5a1018');
    for (let x = 0; x < 16; x++) { p.set(x, 0, r); p.set(x, 1, r); p.set(x, 2, x % 3 === 1 ? r : rk); }
    /* Parlayan işaretler */
    const m = hex('#b48cff'), ma = hex('#e2d0ff');
    const isaret = [[3, 6], [4, 6], [3, 7], [3, 8], [4, 8], [7, 5], [8, 6], [7, 7], [8, 8], [7, 9], [11, 6], [12, 6], [12, 7], [11, 8], [12, 9], [5, 11], [6, 12], [7, 11], [10, 12], [11, 11], [12, 12]];
    for (const [x, y] of isaret) p.set(x, y, p.r() < 0.3 ? ma : m);
    for (let x = 0; x < 16; x++) p.set(x, 15, hex('#16131c'));
  },
  okatici_on: p => { tasTaban(p); p.lekeler('#6a7a5a', 8, 2, 0.05); const k = hex('#1a1a1a'), c = hex('#4a4a4a'); for (let y = 5; y < 11; y++) for (let x = 5; x < 11; x++) p.set(x, y, (x === 5 || x === 10 || y === 5 || y === 10) ? c : k); for (let x = 3; x < 13; x++) { p.set(x, 2, hex('#5a5a5a')); p.set(x, 13, hex('#5a5a5a')); } },
  fener_kafes: p => { p.doldur('#2a2622', 0.05); const s = hex('#ffd36a'), a = hex('#fff2c0'); for (let y = 2; y < 14; y++) for (let x = 2; x < 14; x++) if (x % 5 !== 1 && y % 6 !== 1) p.set(x, y, (x > 4 && x < 11 && y > 4 && y < 11) ? a : s); },
  /* 0.15.2: çöl tapınağı */
  kumtasi_duz: p => { kumDuz(p); },
  kumtasi_oyma: p => {
    kumDuz(p);
    const k = hex('#9c8650'), a = hex('#ecdeab');
    for (let i = 2; i < 14; i++) { p.set(i, 2, k); p.set(2, i, k); p.set(i, 13, a); p.set(13, i, a); }
    /* Oyma ankh: halka, kol ve gövde (koyu oyuk, sağ-altta ışık) */
    const ank = (x, y) => { p.set(x, y, k); p.set(x + 1, y + 1, a); };
    for (const [x, y] of [[7, 4], [8, 4], [6, 5], [9, 5], [6, 6], [9, 6], [7, 7], [8, 7]]) ank(x, y);
    for (let x = 5; x <= 10; x++) ank(x, 8);
    for (let y = 9; y <= 11; y++) { ank(7, y); p.set(8, y, k); }
  },
  hiyeroglif: p => {
    kumDuz(p);
    /* İki sütun hiyeroglif: oyma (koyu) işaretler, bir kısmı soluk mavi ya da kırmızı boyalı */
    const k = hex('#8a7243'), mavi = hex('#4c6cae'), kir = hex('#a65a3e'), cz = hex('#c8b67e');
    for (let y = 0; y < D; y++) p.set(8, y, cz);
    const G = [
      ['01100', '11110', '01110', '01010'],   // baykuş
      ['01110', '10001', '01110', '00000'],   // güneş
      ['10101', '01010', '00000', '10101'],   // su
      ['00100', '00110', '00100', '00100'],   // saz
      ['01110', '01010', '00100', '01110'],   // ankh
      ['11000', '10110', '00011', '00000'],   // yılan
      ['01010', '11111', '01010', '00000'],   // göz
      ['11111', '00000', '01110', '00000']    // ekmek ve kap
    ];
    let n = Math.floor(p.r() * 8);
    for (let c = 0; c < 2; c++) for (let r = 0; r < 3; r++) {
      const g = G[n % 8], q = p.r(), renk = q < 0.18 ? mavi : q < 0.3 ? kir : k; n += 3;
      for (let y = 0; y < 4; y++) for (let x = 0; x < 5; x++) if (g[y][x] === '1') p.set(c * 8 + 2 + x, r * 5 + 1 + y, renk);
    }
  },
  pismis_turuncu: p => {
    p.doldur('#c46a2e', 0.05);
    const k = hex('#8f4219'), a = hex('#e8a25a'), m = hex('#2f58b8');
    for (let i = 0; i < D; i++) { p.set(i, 0, k); p.set(i, 15, k); p.set(0, i, k); p.set(15, i, k); }
    for (let y = 2; y < 14; y++) for (let x = 2; x < 14; x++) { const d = Math.abs(x - 7.5) + Math.abs(y - 7.5); if (d > 4.5 && d < 5.6) p.set(x, y, a); if (d < 1.6) p.set(x, y, m); }
  },
  cini_mavi: p => {
    p.doldur('#2b4ea6', 0.06);
    const k = hex('#1d3a82'), a = hex('#3f66c4'), g = hex('#e6bd45');
    for (let i = 0; i < D; i++) { p.set(i, 15, k); p.set(15, i, k); p.set(i, 0, a); p.set(0, i, a); }
    for (let n = 0; n < 4; n++) p.set(2 + Math.floor(p.r() * 12), 2 + Math.floor(p.r() * 12), g);
  },
  altin_blok: p => {
    p.doldur('#e6b532', 0.05);
    const a = hex('#fbe489'), k = hex('#b0821c');
    for (let i = 0; i < D; i++) { p.set(i, 0, a); p.set(0, i, a); p.set(i, 15, k); p.set(15, i, k); }
    for (let i = 3; i < 8; i++) p.set(i, 10 - i, a);
    for (let i = 9; i < 12; i++) p.set(i, 16 - i, a);
  },
  sutun_yan: p => {
    kumDuz(p);
    const k = hex('#b9a66e'), a = hex('#ead9a4');
    for (let y = 0; y < D; y++) for (const x of [1, 5, 9, 13]) { p.set(x, y, k); p.set(x + 1, y, a); }
    for (let x = 0; x < D; x++) { p.set(x, 0, k); p.set(x, 15, k); }
  },
  nemes_yan: p => { const m = hex('#2a4ea6'), g = hex('#e2b53a'); for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) p.set(x, y, karis((y >> 1) % 2 ? m : g, 1 + (p.r() * 2 - 1) * 0.05)); },
  nemes_ust: p => { const m = hex('#2a4ea6'), g = hex('#e2b53a'); for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) p.set(x, y, karis((x >> 1) % 2 ? m : g, 1 + (p.r() * 2 - 1) * 0.05)); },
  /* 0.17.0: mekanik bloklar */
  bakir_tel_k: p => { p.doldur('#8a4a2a', 0.08); for (let i = 0; i < 6; i++) p.set(Math.floor(p.r() * 16), Math.floor(p.r() * 16), hex('#b0683a')); },
  bakir_tel_a: p => { p.doldur('#f0783a', 0.06); for (let i = 0; i < 8; i++) p.set(Math.floor(p.r() * 16), Math.floor(p.r() * 16), hex('#ffd08a')); },
  bakir_lamba: p => { p.doldur('#b8683a', 0.06); const k = hex('#7a3e1e'), c = hex('#3a3430'); for (let i = 0; i < D; i++) { p.set(i, 0, k); p.set(0, i, k); p.set(i, 15, k); p.set(15, i, k); } for (let y = 3; y < 13; y++) for (let x = 3; x < 13; x++) p.set(x, y, karis(c, 0.9 + p.r() * 0.2)); for (let i = 3; i < 13; i++) { p.set(i, 7, hex('#7a3e1e')); p.set(7, i, hex('#7a3e1e')); } },
  bakir_lamba_a: p => { p.doldur('#d07a40', 0.05); const k = hex('#8a4a22'); for (let i = 0; i < D; i++) { p.set(i, 0, k); p.set(0, i, k); p.set(i, 15, k); p.set(15, i, k); } for (let y = 3; y < 13; y++) for (let x = 3; x < 13; x++) p.set(x, y, karis(hex('#ffe08a'), 0.92 + p.r() * 0.12)); for (let i = 3; i < 13; i++) { p.set(i, 7, hex('#e8a050')); p.set(7, i, hex('#e8a050')); } },
  ters_ust: p => { p.doldur('#8e8e8e', 0.04); const k = hex('#6a6a6a'); for (let i = 0; i < D; i++) { p.set(i, 0, k); p.set(0, i, k); p.set(i, 15, k); p.set(15, i, k); } for (let i = 3; i < 13; i++) p.set(7, i, hex('#7a3e1e')); },
  /* 0.20.0: Geciktirici: ok biçimli bakır iz */
  gecik_ust: p => { p.doldur('#8e8e8e', 0.04); const k = hex('#6a6a6a'), c = hex('#7a3e1e'); for (let i = 0; i < D; i++) { p.set(i, 0, k); p.set(0, i, k); p.set(i, 15, k); p.set(15, i, k); } for (let i = 2; i < 14; i++) p.set(7, i, c); for (let i = 0; i < 3; i++) { p.set(7 - i, 3 + i, c); p.set(7 + i, 3 + i, c); } },
  gecik_ust_a: p => { p.doldur('#8e8e8e', 0.04); const k = hex('#6a6a6a'), c = hex('#f0783a'); for (let i = 0; i < D; i++) { p.set(i, 0, k); p.set(0, i, k); p.set(i, 15, k); p.set(15, i, k); } for (let i = 2; i < 14; i++) p.set(7, i, c); for (let i = 0; i < 3; i++) { p.set(7 - i, 3 + i, c); p.set(7 + i, 3 + i, c); } },
  ters_ust_a: p => { p.doldur('#8e8e8e', 0.04); const k = hex('#6a6a6a'); for (let i = 0; i < D; i++) { p.set(i, 0, k); p.set(0, i, k); p.set(i, 15, k); p.set(15, i, k); } for (let i = 3; i < 13; i++) p.set(7, i, hex('#f0783a')); },
  muzik_kutu: p => { kalas(p, '#8a5a32'); const k = hex('#3a2414'); for (let y = 4; y < 12; y++) for (let x = 4; x < 12; x++) if ((x + y) % 2 === 0) p.set(x, y, k); for (let i = 0; i < D; i++) { p.set(i, 0, k); p.set(i, 15, k); } },
  muzik_ust: p => { kalas(p, '#9a6a3a'); const k = hex('#2a1a10'); for (let y = 4; y < 12; y++) p.set(9, y, k); p.set(10, 4, k); p.set(11, 5, k); for (const [x, y] of [[7, 10], [8, 10], [7, 11], [8, 11], [8, 9]]) p.set(x, y, k); },
  algi_ust: p => { p.doldur('#3a3a48', 0.04); for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) for (let j = 1; j < 4; j++) for (let i = 1; i < 4; i++) p.set(x * 5 + i + 1, y * 5 + j + 1, hex('#4a5a8a')); },
  algi_ust_a: p => { p.doldur('#5a5040', 0.04); for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) for (let j = 1; j < 4; j++) for (let i = 1; i < 4; i++) p.set(x * 5 + i + 1, y * 5 + j + 1, hex('#f0d060')); },
  algi_yan: p => { kalas(p, '#9a6e3a'); const k = hex('#5a3d1f'); for (let x = 0; x < D; x++) { p.set(x, 9, k); p.set(x, 10, k); } },
  kol_bas: p => p.doldur('#8a2a22', 0.08),
  kol_bas_a: p => p.doldur('#4ab04a', 0.08),
  /* 0.18.0: Yeraltı Diyarı */
  kor_tasi: p => { p.doldur('#6e2a26', 0.12); p.lekeler('#8a3a30', 22, 2, 0.08); p.lekeler('#4e1c1a', 18, 2, 0.06); p.lekeler('#a24a3a', 6, 1, 0.05); },
  kul_kumu: p => { p.doldur('#5a4a40', 0.1); p.lekeler('#3e322c', 16, 2, 0.06); p.lekeler('#7a6a5a', 10, 1, 0.05);
    const k = hex('#2e2420'); for (const [x, y] of [[4, 5], [10, 4], [7, 11]]) { p.set(x, y, k); p.set(x + 2, y, k); p.set(x + 1, y + 2, karis(k, 1.2)); p.set(x, y + 2, karis(k, 1.1)); p.set(x + 2, y + 2, karis(k, 1.1)); } },
  isiltas: p => { p.doldur('#c89a3a', 0.1); const a = hex('#ffe9a0'), k = hex('#8a5a1e');
    for (let i = 0; i < 9; i++) { const x = Math.floor(p.r() * 14), y = Math.floor(p.r() * 14); p.set(x, y, a); p.set(x + 1, y, karis(a, 0.95)); p.set(x, y + 1, karis(a, 0.9)); }
    for (let i = 0; i < 26; i++) p.set(Math.floor(p.r() * 16), Math.floor(p.r() * 16), karis(k, 0.9 + p.r() * 0.2)); },
  obsidyen: p => { p.doldur('#16101e', 0.12); p.lekeler('#2c1f3e', 18, 2, 0.08); p.lekeler('#3e2a5a', 8, 1, 0.05); p.lekeler('#0a0810', 10, 1, 0.05); },
  gecit: p => { for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { const v = Math.sin(x * 0.9 + y * 0.35) + Math.sin(y * 0.8 - x * 0.3) * 0.8 + p.r() * 0.5;
    p.set(x, y, karis(v > 0.6 ? [214, 120, 255] : v > -0.2 ? [150, 60, 220] : v > -0.9 ? [96, 30, 160] : [62, 16, 112], 0.9 + p.r() * 0.2)); } },   // 0.20.0: boşluksuz
  kul_tugla: p => tugla(p, '#3a2224', '#1e1214'),
  kul_tugla_oyma: p => { tugla(p, '#3a2224', '#1e1214'); const k = hex('#1e1214'), a = hex('#5a3436'); for (let y = 3; y < 13; y++) for (let x = 3; x < 13; x++) p.set(x, y, (x === 3 || y === 3 || x === 12 || y === 12) ? k : (Math.abs(x - 7.5) + Math.abs(y - 7.5) < 3.2 ? karis(hex('#ff7a2a'), 0.85 + p.r() * 0.2) : karis(a, 0.9 + p.r() * 0.2))); },
  kor_cev: p => { RESSAM.kor_tasi(p); const c = hex('#ff8a2a'); for (let n = 0; n < 5; n++) { const x = 1 + Math.floor(p.r() * 13), y = 1 + Math.floor(p.r() * 13); for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) p.set(x + dx, y + dy, karis(c, 0.85 + p.r() * 0.3)); p.set(x, y, [255, 230, 150]); } },
  magma: p => { p.doldur('#5a1a10', 0.1); const a = hex('#ff7a1e'); for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { const v = Math.sin(x * 0.8 + p.r() * 0.6) + Math.cos(y * 0.9 + x * 0.2); if (v > 1.1) p.set(x, y, karis(a, 0.8 + p.r() * 0.35)); } p.lekeler('#2e0e08', 10, 1, 0.05); },
  kizil_mantar: p => bitki(p, p => { const s = hex('#e8c8b0'); cizgi(p, 7, 15, 7, 9, s); cizgi(p, 8, 15, 8, 9, karis(s, 0.9)); const c = hex('#c02a2a'); for (let y = 3; y < 10; y++) for (let x = 2; x < 14; x++) { const d = ((x - 7.5) / 6) ** 2 + ((y - 9.5) / 6) ** 2; if (d < 1 && y < 10) p.set(x, y, karis(c, 0.8 + p.r() * 0.3)); } for (const [x, y] of [[5, 5], [9, 4], [11, 7], [6, 8]]) p.set(x, y, [255, 210, 120]); }),
  /* 0.16.0: mobilya ve mutfak */
  saksi: p => { p.doldur('#b4603a', 0.06); const k = hex('#8a4428'), a = hex('#d07a50'); for (let x = 0; x < D; x++) { p.set(x, 0, a); p.set(x, 1, a); p.set(x, 2, k); p.set(x, 15, k); } },
  lamba: p => { p.doldur('#f2dca0', 0.04); const k = hex('#c8a060'), a = hex('#fff4d0'); for (let x = 0; x < D; x++) { p.set(x, 0, k); p.set(x, 15, k); } for (let y = 3; y < 13; y++) for (let x = 4; x < 12; x++) p.set(x, y, a); },
  tablo_manzara: p => {
    const gok = hex('#8ec4ee'), da = hex('#6a7a8c'), kar = hex('#f0f4f8'), cim = hex('#5c9a3c'), cim2 = hex('#4a8030'), gun = hex('#f6d860');
    for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) p.set(x, y, y < 9 ? karis(gok, 1 - y * 0.02) : (x + y) % 3 ? cim : cim2);
    for (let x = 0; x < D; x++) { const h = 9 - Math.max(0, 5 - Math.abs(x - 6)) - Math.max(0, 3 - Math.abs(x - 12)); for (let y = h; y < 9; y++) p.set(x, y, y < h + 2 && h < 7 ? kar : da); }
    for (const [x, y] of [[12, 2], [13, 2], [12, 3], [13, 3]]) p.set(x, y, gun);
    for (const [x, y] of [[3, 11], [3, 12], [9, 12], [9, 13]]) p.set(x, y, hex('#3a2a1a'));
    for (const [x, y] of [[2, 10], [3, 10], [4, 10], [8, 11], [9, 11], [10, 11]]) p.set(x, y, hex('#2e6a2a'));
    cerceve(p);
  },
  tablo_deniz: p => {
    const gok = hex('#f0b080'), gun = hex('#f8e0a0'), su = hex('#2e6aa8'), su2 = hex('#4a8ac4');
    for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) p.set(x, y, y < 8 ? karis(gok, 0.85 + y * 0.03) : (x + y * 2) % 5 ? su : su2);
    for (let y = 4; y < 8; y++) for (let x = 6; x < 11; x++) if (Math.hypot(x - 8, y - 8) < 3.2) p.set(x, y, gun);
    for (let x = 5; x < 12; x++) p.set(x, 9, gun);
    for (const [x, y] of [[3, 10], [4, 10], [5, 10], [4, 9], [4, 8], [4, 7]]) p.set(x, y, hex(y > 9 ? '#5a3a20' : '#f0ece0'));
    cerceve(p);
  },
  tablo_cicek: p => {
    p.doldur('#e8dcc0', 0.03);
    const vazo = hex('#3c64a8'), sap = hex('#3a7a2c');
    for (let y = 10; y < 15; y++) for (let x = 6; x < 10; x++) p.set(x, y, vazo);
    for (const [x0, y0] of [[8, 9], [5, 6], [10, 5], [8, 4]]) cizgi(p, 8, 10, x0, y0, sap);
    for (const [x, y, c] of [[5, 5, '#d83a3a'], [10, 4, '#f0c830'], [8, 3, '#d83a8a'], [4, 7, '#f08a30'], [11, 6, '#d83a3a']]) for (const [a, b] of [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]]) p.set(x + a, y + b, hex(c));
    cerceve(p);
  },
  tencere: p => { p.doldur('#3c3e44', 0.06); const a = hex('#5c5f66'), k = hex('#26282c'); for (let x = 0; x < D; x++) { p.set(x, 0, a); p.set(x, 1, a); p.set(x, 14, k); p.set(x, 15, k); } },
  tencere_ust: p => { p.doldur('#3c3e44', 0.05); for (let y = 2; y < 14; y++) for (let x = 2; x < 14; x++) p.set(x, y, karis(hex('#c8783a'), 0.9 + p.r() * 0.2)); for (const [x, y] of [[5, 5], [9, 7], [6, 10], [10, 11]]) p.set(x, y, hex('#e8a860')); },
  minder_k: p => { p.doldur('#b02c2c', 0.06); const a = hex('#d04a40'), k = hex('#801c1c'); for (let i = 0; i < D; i++) { p.set(i, 0, a); p.set(0, i, a); p.set(i, 15, k); p.set(15, i, k); } p.set(7, 7, k); p.set(8, 8, k); },
  /* 0.15.4: buzul kulesi */
  buz_tugla: p => {
    p.doldur('#8cc0f2', 0.05);
    const h = hex('#5d93cc'), a = hex('#cfe9fe');
    for (let x = 0; x < D; x++) { p.set(x, 7, h); p.set(x, 15, h); p.set(x, 0, a); p.set(x, 8, a); }
    for (let y = 0; y < 7; y++) { p.set(7, y, h); p.set(8, y, a); }
    for (let y = 8; y < 15; y++) { p.set(15, y, h); p.set(0, y, a); }
    for (let n = 0; n < 5; n++) { const x = Math.floor(p.r() * 14) + 1, y = Math.floor(p.r() * 14) + 1; p.set(x, y, a); }
  },
  mavi_buz: p => {
    p.doldur('#5a96e4', 0.05);
    const a = hex('#9cc8f4'), k = hex('#3f74ba');
    for (let i = 0; i < 6; i++) { const x = Math.floor(p.r() * 12), y = Math.floor(p.r() * 12); cizgi(p, x, y, x + 3, y + 3, a); }
    for (let i = 0; i < 4; i++) { const x = Math.floor(p.r() * 14), y = Math.floor(p.r() * 14); cizgi(p, x, y + 2, x + 2, y, k); }
  },
  kitaplik: p => {
    kalas(p, '#9a6e3a');
    const k = hex('#5a3d1f'), renk = ['#7a2a24', '#2e4f8a', '#3c6a2c', '#7a5a1c', '#5a2a6a', '#8a8070'].map(hex);
    for (const y0 of [1, 9]) {
      for (let x = 0; x < D; x++) { p.set(x, y0 - 1, k); p.set(x, y0 + 6, k); }
      let x = 1;
      while (x < 15) { const w = 1 + Math.floor(p.r() * 2), h = 4 + Math.floor(p.r() * 3), c = renk[Math.floor(p.r() * renk.length)]; for (let i = 0; i < w && x < 15; i++, x++) for (let y = y0 + 6 - h; y < y0 + 6; y++) p.set(x, y, karis(c, i ? 0.85 : 1)); if (p.r() < 0.25) x++; }
    }
  },
  vitray_mavi: p => {
    const k = hex('#2a3540'), renk = ['#3e6fd0', '#5a9ae8', '#2c4fa8', '#8cc4f4', '#e8c84a'].map(hex);
    for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) p.set(x, y, karis(renk[(Math.floor(x / 4) + Math.floor(y / 5) * 2 + (x > 7 ? 1 : 0)) % 4], 1 + (p.r() - 0.5) * 0.1));
    for (let y = 5; y < 11; y++) for (let x = 5; x < 11; x++) if (Math.hypot(x - 7.5, y - 7.5) < 2.6) p.set(x, y, renk[4]);
    for (let i = 0; i < D; i++) { p.set(i, 0, k); p.set(i, 15, k); p.set(0, i, k); p.set(15, i, k); p.set(7, i, k); }
    for (const y of [5, 10]) for (let x = 0; x < D; x++) p.set(x, y, k);
  },
  buz_fener: p => { p.doldur('#3a4a5e', 0.05); const s = hex('#8fd8ff'), a = hex('#e6f8ff'); for (let y = 2; y < 14; y++) for (let x = 2; x < 14; x++) if (x % 5 !== 1 && y % 6 !== 1) p.set(x, y, (x > 4 && x < 11 && y > 4 && y < 11) ? a : s); },
  buz_kristal: p => bitki(p, p => { const renk = [hex('#bfeaff'), hex('#7fd0ff'), hex('#e8f8ff')]; for (const [cx, h, w, ri] of [[4, 9, 2, 0], [8, 14, 3, 1], [12, 8, 2, 2], [6, 6, 1, 2], [10, 7, 1, 0]]) { const c = renk[ri]; for (let y = 15; y > 15 - h; y--) { const t = (15 - y) / h, ww = Math.max(0, Math.round(w * (1 - t * 0.8))); for (let x = cx - ww; x <= cx + ww; x++) p.set(x, y, karis(c, 0.85 + (x < cx ? 0.2 : 0) + p.r() * 0.08)); } } }),
  buz_sarkit: p => bitki(p, p => { const c = hex('#cdeaff'); for (let y = 0; y < 16; y++) { const w = Math.max(0, Math.round((15 - y) * 0.3)); for (let x = 8 - w; x <= 7 + w; x++) p.set(x, y, karis(c, 0.82 + p.r() * 0.2 + (x < 8 ? 0.12 : 0))); } }),
  buz_oyma: p => {
    p.doldur('#8cc0f2', 0.04);
    const h = hex('#4f86c0'), a = hex('#d8eefe');
    for (let i = 1; i < 15; i++) { p.set(i, 1, h); p.set(1, i, h); p.set(i, 14, a); p.set(14, i, a); }
    /* Kar tanesi */
    for (let i = -4; i <= 4; i++) { p.set(8 + i, 8, h); p.set(8, 8 + i, h); if (Math.abs(i) <= 3) { p.set(8 + i, 8 + i, h); p.set(8 + i, 8 - i, h); } }
    for (const [x, y] of [[6, 4], [10, 4], [6, 12], [10, 12], [4, 6], [4, 10], [12, 6], [12, 10]]) p.set(x, y, h);
    p.set(8, 8, a);
  },
  /* 0.15.3: haydut kampı */
  cadir_bezi: p => {
    p.doldur('#d4c49c', 0.05);
    const k = hex('#ad9a6c'), a = hex('#e4d6b2');
    for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) if ((x + y) % 4 === 0) p.set(x, y, karis(hex('#d4c49c'), 0.95));
    for (let x = 0; x < D; x++) { p.set(x, 7, k); p.set(x, 8, a); }
    for (let x = 0; x < D; x += 3) p.set(x, 7, karis(k, 0.8));   // dikiş
    const px = 2 + Math.floor(p.r() * 8), py = 10 + Math.floor(p.r() * 3);
    for (let y = py; y < py + 3; y++) for (let x = px; x < px + 4; x++) p.set(x, y, karis(hex('#9c8458'), 1 + (p.r() - 0.5) * 0.1));   // yama
  },
  cadir_cizgili: p => {
    const kir = hex('#a8302a'), kr = hex('#e2d4b0');
    for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) p.set(x, y, karis(Math.floor(x / 4) % 2 ? kr : kir, 1 + (p.r() * 2 - 1) * 0.05));
    for (let x = 0; x < D; x++) { p.set(x, 0, karis(kir, 0.7)); p.set(x, 15, karis(kir, 0.7)); }
  },
  fici_yan: p => {
    p.doldur('#8e5c2c', 0.06);
    const k = hex('#5e3a18'), d = hex('#4b4d54'), a = hex('#9a9ca4');
    for (let y = 0; y < D; y++) for (const x of [0, 4, 8, 12]) p.set(x, y, k);
    for (const y0 of [2, 12]) for (let x = 0; x < D; x++) { p.set(x, y0, d); p.set(x, y0 + 1, karis(d, 0.8)); if (x % 5 === 2) p.set(x, y0, a); }
  },
  fici_ust: p => {
    p.doldur('#9a6634', 0.06);
    const k = hex('#5e3a18'), d = hex('#4b4d54');
    for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) {
      const r = Math.hypot(x - 7.5, y - 7.5);
      if (r > 7.2) p.set(x, y, karis(hex('#6e4520'), 0.9)); else if (r > 6) p.set(x, y, d); else if (y % 4 === 0) p.set(x, y, k);
    }
  },
  demir_parmaklik: p => {
    for (let i = 0; i < D * D * 4; i++) p.d[i] = 0;
    const c = hex('#5c5f66'), a = hex('#8e929a'), k = hex('#3c3e44');
    for (const x of [1, 6, 11]) for (let y = 0; y < D; y++) { p.set(x, y, a); p.set(x + 1, y, c); p.set(x + 2, y, k); }
    for (const y of [1, 14]) for (let x = 0; x < D; x++) { p.set(x, y, c); p.set(x, y + 1, k); }
  },
  hedef_on: p => {
    p.doldur('#c8a646', 0.08);
    const s = hex('#9c7e2c');
    for (let y = 1; y < D; y += 3) for (let x = 0; x < D; x++) if (p.r() < 0.6) p.set(x, y, s);
    for (let y = 1; y < 15; y++) for (let x = 1; x < 15; x++) {
      const r = Math.hypot(x - 7.5, y - 7.5);
      if (r < 6.6) p.set(x, y, r < 1.6 ? hex('#c22a22') : r < 3.1 ? hex('#efe8d8') : r < 4.6 ? hex('#c22a22') : r < 5.7 ? hex('#efe8d8') : hex('#c22a22'));
    }
  },
  firavun_yuz: p => {
    const m = hex('#2a4ea6'), g = hex('#e2b53a'), ten = '#c48a52';
    p.doldur(ten, 0.04);
    /* Başlık bandı ve yan örtüler (nemes) */
    for (let x = 0; x < D; x++) for (let y = 0; y < 3; y++) p.set(x, y, y === 1 ? m : g);
    for (let y = 3; y < D; y++) for (const x of [0, 1, 2, 13, 14, 15]) p.set(x, y, (y >> 1) % 2 ? m : g);
    p.set(7, 1, g); p.set(8, 1, g); p.set(7, 0, hex('#d8402c')); p.set(8, 0, hex('#d8402c'));   // alındaki kobra
    const s = hex('#1c120a'), b = hex('#f2ead8'), go = hex('#a8703e'), du = hex('#7e2c22'), du2 = hex('#b4584a');
    for (const x of [4, 5, 6, 9, 10, 11]) p.set(x, 5, s);                   // kaşlar
    for (const x of [3, 4, 5, 6]) p.set(x, 6, s); for (const x of [9, 10, 11, 12]) p.set(x, 6, s);   // sürme
    for (const x of [4, 6]) p.set(x, 7, b); for (const x of [9, 11]) p.set(x, 7, b);
    p.set(5, 7, s); p.set(10, 7, s);                                          // gözbebekleri
    p.set(3, 7, s); p.set(12, 7, s);
    for (let y = 8; y <= 10; y++) p.set(7, y, go); p.set(8, 10, go);        // burun
    for (const x of [6, 7, 8, 9]) { p.set(x, 12, du); p.set(x, 13, du2); }  // dudaklar
    for (let y = 14; y < D; y++) for (const x of [6, 7, 8, 9]) p.set(x, y, y === 14 ? g : m);   // takma sakal
  },
  tuzak_teli: p => { p.doldur('#000000', 0, 0); const c = hex('#d8d4c8'); for (let i = 0; i < 16; i++) { p.set(i, 7, c); p.set(i, 8, karis(c, 0.8)); } },
  buyu_alt: p => { p.doldur('#1e1a24', 0.1); p.lekeler('#2a2532', 20, 2, 0.06); },
  nilufer: p => bitki(p, p => { const c = hex('#3f8a2c'); for (let y = 1; y < 15; y++) for (let x = 1; x < 15; x++) { const d = Math.hypot(x - 7.5, y - 7.5); if (d < 6.6 && !(x > 7 && Math.abs(y - 7.5) < (x - 6) * 0.35)) p.set(x, y, karis(c, 0.8 + p.r() * 0.35)); } const f = hex('#f2b6d0'); p.set(5, 6, f); p.set(6, 5, f); p.set(5, 5, [255, 230, 120]); }),
  sarmasik: p => bitki(p, p => { const c = hex('#3e7a2a'); for (let i = 0; i < 4; i++) { let x = 2 + i * 4; for (let y = 0; y < 16; y++) { if (p.r() < 0.85) p.set(x, y, karis(c, 0.75 + p.r() * 0.45)); if (y % 3 === i % 3) { p.set(x + 1, y, karis(c, 1.1)); p.set(x - 1, y + 1, karis(c, 0.9)); } if (p.r() < 0.25) x += p.r() < 0.5 ? -1 : 1; x = Math.max(1, Math.min(14, x)); } } }),
  orumcek_agi: p => bitki(p, p => { const c = [235, 235, 240]; cizgi(p, 0, 0, 15, 15, c); cizgi(p, 15, 0, 0, 15, c); cizgi(p, 8, 0, 8, 15, c); cizgi(p, 0, 8, 15, 8, c); for (const r of [3, 6]) for (let a = 0; a < 32; a++) { const t = a / 32 * Math.PI * 2; p.set(Math.round(7.5 + Math.cos(t) * r), Math.round(7.5 + Math.sin(t) * r), c, 200); } }),
  yosun_blok: p => { p.doldur('#4f7d2f', 0.14); p.lekeler('#3f6a24', 24, 2); p.lekeler('#68973c', 14, 1); },
  sarkit: p => bitki(p, p => { const c = hex('#8a7a6a'); for (let y = 0; y < 16; y++) { const w = Math.max(0, Math.round((15 - y) * 0.32)); for (let x = 8 - w; x <= 7 + w; x++) p.set(x, y, karis(c, 0.8 + p.r() * 0.35 + (x < 8 ? 0.1 : 0))); } }),
  dikit: p => bitki(p, p => { const c = hex('#8a7a6a'); for (let y = 0; y < 16; y++) { const w = Math.max(0, Math.round(y * 0.32)); for (let x = 8 - w; x <= 7 + w; x++) p.set(x, y, karis(c, 0.8 + p.r() * 0.35 + (x < 8 ? 0.1 : 0))); } }),
  damlatasi: p => { p.doldur('#86766a', 0.07); const c = hex('#6f6157'); for (let x = 0; x < D; x++) for (let y = 0; y < D; y++) if ((x * 3 + Math.floor(y / 4)) % 5 === 0) p.set(x, y, karis(c, 0.9 + p.r() * 0.2)); },
  isikli_mantar: p => bitki(p, p => { const s = hex('#d8e8e0'); cizgi(p, 7, 15, 7, 9, s); cizgi(p, 8, 15, 8, 9, karis(s, 0.9)); const c = hex('#4fe0d0'); for (let y = 4; y < 9; y++) for (let x = 2; x < 14; x++) { const d = ((x - 7.5) / 6) ** 2 + ((y - 8.5) / 4.4) ** 2; if (d < 1) p.set(x, y, karis(c, 0.85 + p.r() * 0.35)); } p.set(5, 6, [210, 255, 250]); p.set(10, 6, [210, 255, 250]); cizgi(p, 3, 15, 3, 13, s); p.set(2, 12, c); p.set(3, 12, c); p.set(4, 12, c); }),
  kar_katman: p => { p.doldur('#f4f8fc', 0.03); p.lekeler('#e0e9f3', 8, 1, 0.02); },
  mesale: p => bitki(p, p => { const c = hex('#7b5a32'); for (let y = 6; y < 16; y++) { p.set(7, y, karis(c, 1.05)); p.set(8, y, karis(c, 0.8)); } const a = [[7, 5, '#ffd257'], [8, 5, '#ffb52e'], [7, 4, '#ffe680'], [8, 4, '#ffcf4a'], [7, 3, '#fff2b0'], [8, 3, '#ff9a1f'], [7, 2, '#ffe680']]; for (const [x, y, r] of a) p.set(x, y, hex(r)); }),
  /* 0.21.0: Tarım ve hayvancılık */
  kabak_sap0: p => ekinCiz(p, 3, '#5aa83b', null),
  kabak_sap1: p => ekinCiz(p, 6, '#5aa83b', null),
  kabak_sap2: p => ekinCiz(p, 9, '#4f9a35', null, '#f2c230'),
  kabak_sap3: p => bitki(p, p => { const c = hex('#4a8f30'); cizgi(p, 8, 15, 8, 6, c); cizgi(p, 8, 9, 3, 13, karis(c, 0.85)); cizgi(p, 8, 8, 14, 12, karis(c, 0.9)); for (const [x, y] of [[3, 12], [4, 12], [13, 11], [14, 11], [7, 5], [9, 5], [8, 4]]) p.set(x, y, karis(hex('#3f8a2d'), 0.9 + p.r() * 0.3)); p.set(2, 13, hex('#e88a1a')); p.set(14, 12, hex('#e88a1a')); }),
  balkabagi_yan: p => { p.doldur('#e0821c', 0.06); const k = hex('#b85e10'); for (let y = 0; y < 16; y++) for (const x of [0, 4, 8, 12]) { p.set(x, y, karis(k, 0.92 + p.r() * 0.12)); if (p.r() < 0.4) p.set(x + 1, y, karis(k, 1.15)); } },
  balkabagi_ust: p => { p.doldur('#d87a18', 0.06); const k = hex('#b05a10'); for (let a = 0; a < 48; a++) { const t = a / 48 * Math.PI * 2; for (let r = 3; r < 9; r += 1) if (a % 6 === 0) p.set(Math.round(7.5 + Math.cos(t) * r), Math.round(7.5 + Math.sin(t) * r), k); } const s = hex('#5a7a2a'); for (const [x, y] of [[7, 7], [8, 7], [7, 8], [8, 8], [8, 6]]) p.set(x, y, s); },
  balkabagi_yuz: p => { RESSAM.balkabagi_yan(p); const k = hex('#3a1e08'); for (const [x0, y0] of [[3, 4], [10, 4]]) for (let y = y0; y < y0 + 3; y++) for (let x = x0; x < x0 + 3; x++) if (y - y0 >= Math.abs(x - x0 - 1) - 0) p.set(x, y, k); for (let x = 3; x < 13; x++) { p.set(x, 10, k); if (x % 3) p.set(x, 11, k); } p.set(3, 9, k); p.set(12, 9, k); p.set(7, 9, k); },
  balkabagi_fener: p => { RESSAM.balkabagi_yan(p); const a = hex('#ffd84a'), b = hex('#ff9a1a'); for (const [x0, y0] of [[3, 4], [10, 4]]) for (let y = y0; y < y0 + 3; y++) for (let x = x0; x < x0 + 3; x++) if (y - y0 >= Math.abs(x - x0 - 1)) p.set(x, y, karis(a, 0.9 + p.r() * 0.15)); for (let x = 3; x < 13; x++) { p.set(x, 10, karis(b, 1.05)); if (x % 3) p.set(x, 11, a); } p.set(3, 9, a); p.set(12, 9, a); p.set(7, 9, a); },
  seker_kamisi: p => bitki(p, p => { const c = hex('#8ac85a'), k = hex('#5a9a32'); for (const x0 of [3, 8, 12]) for (let y = 0; y < 16; y++) { const d = (y + x0) % 6 === 0; p.set(x0, y, d ? k : karis(c, 0.85 + p.r() * 0.25)); p.set(x0 + 1, y, d ? karis(k, 0.85) : karis(c, 0.75 + p.r() * 0.2)); } for (const [x, y] of [[5, 4], [6, 3], [10, 9], [11, 8], [2, 11], [1, 10]]) p.set(x, y, karis(hex('#6aae3a'), 0.9 + p.r() * 0.2)); }),
  kovan_yan: p => { p.doldur('#d8a83a', 0.06); const k = hex('#a8782a'); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (y % 4 === 3) p.set(x, y, karis(k, 0.9 + p.r() * 0.2)); else if ((x + (Math.floor(y / 4) % 2) * 2) % 5 === 0 && p.r() < 0.5) p.set(x, y, karis(k, 1.15)); },
  kovan_ust: p => { p.doldur('#c89a34', 0.07); const k = hex('#9a6e24'); for (let i = 0; i < 16; i++) { p.set(i, 0, k); p.set(i, 15, k); p.set(0, i, k); p.set(15, i, k); } for (let y = 3; y < 13; y += 3) for (let x = 2; x < 14; x++) if ((x + y) % 4) p.set(x, y, karis(k, 1.1)); },
  kovan_on: p => { RESSAM.kovan_yan(p); const k = hex('#2a1a08'); for (let y = 6; y < 10; y++) for (let x = 6; x < 10; x++) p.set(x, y, k); },
  /* 0.22.0: mezar taşı (yosunlu gri taş, oyma haç), gök taşı (kömür karası, parlayan damarlar), yıldız feneri */
  mezar: p => { p.doldur('#8e9196', 0.07); p.lekeler('#7a7d82', 14, 1); const k = hex('#5c5f64'); cizgi(p, 7, 3, 7, 11, k); cizgi(p, 8, 3, 8, 11, k); cizgi(p, 5, 5, 10, 5, k); cizgi(p, 5, 6, 10, 6, k); const y = hex('#5f7a3c'); for (let i = 0; i < 10; i++) p.set(Math.floor(p.r() * 16), 12 + Math.floor(p.r() * 4), karis(y, 0.8 + p.r() * 0.4)); },
  gok_tasi: p => { p.doldur('#2a2630', 0.12); p.lekeler('#3a3442', 18, 2); const a = hex('#ff9a3a'), b = hex('#ffe08a'), m = hex('#8ad8ff'); let x = 2, y = 1; for (let i = 0; i < 22; i++) { p.set(x, y, karis(a, 0.85 + p.r() * 0.3)); x += p.r() < 0.5 ? 1 : 0; y += 1; if (y > 15) { y = 0; x = 9 + Math.floor(p.r() * 5); } } for (let i = 0; i < 7; i++) p.set(Math.floor(p.r() * 16), Math.floor(p.r() * 16), b); for (let i = 0; i < 4; i++) p.set(Math.floor(p.r() * 16), Math.floor(p.r() * 16), m); },
  yildiz_feneri: p => { p.doldur('#1c2a4a', 0.08); const k = hex('#c8a040'); for (let i = 0; i < 16; i++) { p.set(i, 0, k); p.set(i, 15, k); p.set(0, i, k); p.set(15, i, k); } const y = hex('#fff2b0'), m = hex('#9ad8ff'); for (const [x, yy] of [[7, 3], [8, 3], [7, 4], [8, 4], [6, 5], [9, 5], [3, 7], [4, 7], [11, 7], [12, 7], [5, 8], [10, 8], [7, 8], [8, 8], [6, 10], [9, 10], [5, 12], [10, 12]]) p.set(x, yy, y); for (const [x, yy] of [[3, 3], [12, 12], [12, 3], [3, 12], [7, 13]]) p.set(x, yy, m); for (let yy = 5; yy < 11; yy++) for (let x = 6; x < 10; x++) p.set(x, yy, karis(y, 0.95)); },
  /* 0.24.0: elektrik blokları */
  gunes_panel: p => { p.doldur('#1d3a6e', 0.05); const k = hex('#c8ccd4'), h = hex('#2c5494'), a = hex('#6fa0e0'); for (let i = 0; i < D; i++) { p.set(i, 0, k); p.set(i, 15, k); p.set(0, i, k); p.set(15, i, k); } for (let i = 1; i < 15; i++) { p.set(i, 5, karis(k, 0.7)); p.set(i, 10, karis(k, 0.7)); p.set(5, i, karis(k, 0.7)); p.set(10, i, karis(k, 0.7)); } for (let y = 1; y < 15; y++) for (let x = 1; x < 15; x++) if (x % 5 && y % 5 && (x + y) % 4 === 0) p.set(x, y, h); for (const [x, y] of [[2, 2], [3, 2], [7, 7], [8, 7], [12, 12], [12, 2]]) p.set(x, y, a); },
  panel_yan: p => { p.doldur('#9aa0a8', 0.05); const k = hex('#6c727a'); for (let i = 0; i < D; i++) { p.set(i, 0, karis(k, 1.2)); p.set(i, 15, k); } for (let x = 2; x < 14; x += 4) for (let y = 4; y < 12; y++) p.set(x, y, karis(k, 0.95)); },
  turbin_govde: p => { p.doldur('#e8eaec', 0.025); const k = hex('#cfd3d8'); for (let i = 0; i < D; i++) p.set(i, 15, k); for (let i = 0; i < 6; i++) p.set(Math.floor(p.r() * 16), Math.floor(p.r() * 15), hex('#dde0e4')); },
  turbin_pervane: p => pervane(p, 0),
  su_carki: p => suCarki(p, 0),
  turbin_ust: p => { kalas(p, '#8a6a42'); const k = hex('#5a5e66'); for (let i = 0; i < D; i++) { p.set(i, 0, k); p.set(0, i, k); p.set(i, 15, k); p.set(15, i, k); } for (let y = 6; y < 10; y++) for (let x = 6; x < 10; x++) p.set(x, y, karis(k, 1.2)); },
  batarya_ust: p => { p.doldur('#3a3f46', 0.05); const k = hex('#23272c'); for (let i = 0; i < D; i++) { p.set(i, 0, k); p.set(0, i, k); p.set(i, 15, k); p.set(15, i, k); } for (let x = 3; x < 13; x++) { p.set(x, 3, karis(k, 1.4)); p.set(x, 12, karis(k, 1.4)); } p.set(4, 7, hex('#e04a3a')); p.set(4, 8, hex('#e04a3a')); p.set(3, 8, hex('#e04a3a')); p.set(5, 8, hex('#e04a3a')); p.set(11, 8, hex('#5aa0e0')); p.set(10, 8, hex('#5aa0e0')); p.set(12, 8, hex('#5aa0e0')); },
  ekablo: p => { p.doldur('#22262a', 0.06); const s = hex('#e8c040'); for (let i = 0; i < D; i += 4) { p.set(i, 7, s); p.set(i + 1, 8, s); } },
  salter_k: p => salter(p, false),
  salter_a: p => salter(p, true),
  elamba: p => { p.doldur('#c9cfd4', 0.03); for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { const d = Math.hypot(x - 5, y - 5); if (d < 3) p.set(x, y, karis(hex('#e8eef2'), 1 - d * 0.05)); } for (let x = 0; x < D; x++) p.set(x, 15, hex('#aeb5bb')); },
  elamba_a: p => { p.doldur('#fff3c8', 0.025); for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { const d = Math.hypot(x - 7.5, y - 7.5); p.set(x, y, karis(hex('#fffbe8'), 1.02 - d * 0.012)); } for (let x = 0; x < D; x++) p.set(x, 15, hex('#f2dc98')); },
  eocak_ust: p => ocakUst(p, false),
  eocak_ust_a: p => ocakUst(p, true),
  eocak_yan: p => { p.doldur('#e2e4e6', 0.025); for (let x = 0; x < D; x++) { p.set(x, 15, hex('#c4c8cc')); p.set(x, 0, hex('#f2f3f4')); } },   // 0.29.0: düz emaye
  ocak_cam: p => { p.doldur('#1a1e24', 0.03); for (let i = 0; i < D; i++) for (let k = 0; k < 2; k++) { const x = i + k, y = 15 - i; if (x < D && y >= 0) p.set(x, y, hex('#3a4452')); } },
  ocak_cam_a: p => { for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { const d = Math.hypot(x - 7.5, y - 8) / 9; p.set(x, y, karis(hex(d < 0.45 ? '#ffc060' : d < 0.8 ? '#ff8a30' : '#b04a18'), 0.92 + p.r() * 0.12)); } for (let x = 0; x < D; x++) p.set(x, 9, hex('#5a2a12')); },
  isitici_izgara: p => { p.doldur('#2c2a28', 0.04); for (let y = 0; y < D; y += 2) for (let x = 0; x < D; x++) p.set(x, y, karis(hex('#8c8884'), x % 4 ? 1 : 0.9)); },
  isitici_izgara_a: p => { for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) p.set(x, y, y % 2 ? karis(hex(Math.abs(x - 7.5) < 5 ? '#ffb347' : '#ff7a2a'), 0.9 + p.r() * 0.15) : karis(hex('#8c8884'), x % 4 ? 1 : 0.9)); },
  isitici: p => isitici(p),
  isitici_a: p => isitici(p),
  /* 0.28.0 */
  jen_govde: p => { p.doldur('#c8442e', 0.05); const k = hex('#8a2a1c'), a = hex('#e0644a'); for (let i = 0; i < D; i++) { p.set(i, 0, a); p.set(i, 15, k); } for (let y = 3; y < 13; y += 2) for (let x = 2; x < 14; x++) p.set(x, y, karis(k, 1.1)); },
  jen_on: p => { p.doldur('#2a2e34', 0.03); const a = hex('#f2c230'); for (let x = 1; x < 15; x++) { p.set(x, 1, a); p.set(x, 14, a); } for (const [x, y] of [[4, 6], [8, 6], [12, 6]]) { p.set(x, y, hex('#d8dce0')); p.set(x, y + 1, hex('#9aa0a8')); } for (let x = 3; x < 13; x++) p.set(x, 10, hex('#5a6068')); p.set(11, 10, hex('#4ad86a')); },
  sensor: p => { p.doldur('#e8eaec', 0.02); for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { const d = Math.hypot(x - 7.5, y - 7.5); if (d < 5) p.set(x, y, karis(hex('#5a6470'), 0.85 + (x + y) % 3 * 0.06)); if (d < 2) p.set(x, y, hex('#2a3038')); } },
  sensor_a: p => { p.doldur('#e8eaec', 0.02); for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { const d = Math.hypot(x - 7.5, y - 7.5); if (d < 5) p.set(x, y, karis(hex('#ff6a4a'), 0.85 + (x + y) % 3 * 0.08)); if (d < 2) p.set(x, y, hex('#ffd0b0')); } },
  /* 0.26.0 */
  salter_govde: p => { p.doldur('#8c939b', 0.035); const a = hex('#a6adb5'), k = hex('#6a7078'); for (let i = 0; i < D; i++) { p.set(i, 0, a); p.set(0, i, a); p.set(i, 15, k); p.set(15, i, k); } for (const [x, y] of [[2, 2], [13, 2], [2, 13], [13, 13]]) { p.set(x, y, hex('#5a6068')); } },
  salter_on: p => { p.doldur('#7c838b', 0.03); const k = hex('#5a6068'); for (let i = 1; i < 15; i++) { p.set(i, 1, k); p.set(1, i, k); p.set(i, 14, hex('#9aa1a9')); p.set(14, i, hex('#9aa1a9')); } for (let y = 3; y < 7; y++) for (let x = 3; x < 13; x++) p.set(x, y, hex('#f2c230')); cizgi(p, 7, 3, 6, 5, hex('#2a2a2a')); cizgi(p, 6, 5, 9, 5, hex('#2a2a2a')); cizgi(p, 9, 5, 8, 6, hex('#2a2a2a')); for (let x = 4; x < 12; x++) { p.set(x, 9, hex('#d8dce0')); } for (let x = 4; x < 9; x++) p.set(x, 11, hex('#d8dce0')); p.set(11, 11, hex('#4ad86a')); p.set(11, 12, hex('#d84a3a')); },
  led_yesil: p => { p.doldur('#5ef08a', 0.04); for (let i = 0; i < 4; i++) p.set(5 + i, 5, hex('#d8ffe4')); },
  led_kirmizi: p => { p.doldur('#f05a4e', 0.04); for (let i = 0; i < 4; i++) p.set(5 + i, 5, hex('#ffd8d4')); },
  lamba_kap: p => { p.doldur('#2f4a3c', 0.05); const a = hex('#4a6a58'); for (let x = 0; x < D; x++) { p.set(x, 0, a); p.set(x, 1, karis(a, 0.9)); p.set(x, 15, hex('#c8a040')); } },
  batarya_kasa: p => { p.doldur('#2e333a', 0.04); const a = hex('#3c424a'), k = hex('#22262b'); for (let i = 0; i < D; i++) { p.set(i, 0, a); p.set(0, i, a); p.set(i, 15, k); p.set(15, i, k); } p.lekeler('#363b42', 10, 1, 0.03); },
  batarya_etiket: p => { p.doldur('#1c1f24', 0.02); const s = hex('#f2c230'); for (let x = 0; x < D; x++) { p.set(x, 1, s); p.set(x, 14, s); } cizgi(p, 9, 3, 6, 8, s); cizgi(p, 6, 8, 10, 8, s); cizgi(p, 10, 8, 7, 12, s); cizgi(p, 10, 3, 7, 8, s); p.set(3, 6, hex('#e04a3a')); p.set(2, 6, hex('#e04a3a')); p.set(3, 5, hex('#e04a3a')); p.set(3, 7, hex('#e04a3a')); p.set(4, 6, hex('#e04a3a')); for (let x = 11; x < 14; x++) p.set(x, 6, hex('#5aa0e0')); },
  havalandirma: p => { p.doldur('#2a2f35', 0.03); const k = hex('#14171b'), a = hex('#3e444c'); for (let y = 1; y < 15; y += 2) for (let x = 1; x < 15; x++) { p.set(x, y, k); p.set(x, y + 1, a); } },
  uyari: p => { for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) p.set(x, y, ((x + y) >> 2) % 2 ? hex('#1c1c1c') : hex('#f2c230')); },
  kablo_kilif: p => { p.doldur('#1d2024', 0.06); for (let x = 0; x < D; x += 3) p.set(x, 8, hex('#2c3036')); },
  kovan_on_bal: p => { RESSAM.kovan_on(p); const b = hex('#f2a818'); for (const [x, y] of [[5, 10], [6, 10], [6, 11], [10, 9], [10, 10], [9, 10], [9, 11], [9, 12], [6, 5], [7, 5], [3, 4], [12, 13]]) p.set(x, y, karis(b, 0.9 + p.r() * 0.2)); },
};
for (let s = 0; s < 5; s++) RESSAM['batarya_yan' + s] = p => bataryaYan(p, s);
/* Renkli yün: yün dokusu renge boyanır */
for (const r of YUN_RENKLERI) RESSAM[r.dok] = p => { RESSAM.yun(p); const c = hex(r.renk); for (let i = 0; i < D * D; i++) { const k = (p.d[i * 4] + p.d[i * 4 + 1] + p.d[i * 4 + 2]) / (3 * 233); p.d[i * 4] = Math.min(255, c[0] * k); p.d[i * 4 + 1] = Math.min(255, c[1] * k); p.d[i * 4 + 2] = Math.min(255, c[2] * k); } };
/* Ekin: boy yüksekliğinde yapraklar, olgunlukta toprak üstünde ürün */
function ekinCiz(p, boy, yaprak, urun, cicek) {
  bitki(p, p => {
    const c = hex(yaprak);
    for (let i = 0; i < 4; i++) {
      const x0 = 2 + i * 4;
      for (let y = 15; y > 15 - boy; y--) { const s = (15 - y) % 3 === 1 ? (i % 2 ? 1 : -1) : 0; p.set(x0 + s, y, karis(c, 0.8 + p.r() * 0.35)); if (y < 15 - boy / 2) p.set(x0 + s + (i % 2 ? -1 : 1), y, karis(c, 0.7 + p.r() * 0.3)); }
      if (cicek) p.set(x0, 15 - boy, hex(cicek));
      if (urun) { const u = hex(urun); p.set(x0, 14, u); p.set(x0 + 1, 14, karis(u, 0.85)); p.set(x0, 15, karis(u, 0.8)); p.set(x0 + 1, 15, karis(u, 0.7)); }
    }
  });
}
function mercanBlok(p, renk, acik) {
  p.doldur(renk, 0.1);
  const a = hex(acik), k = karis(hex(renk), 0.6);
  for (let i = 0; i < 22; i++) { const x = Math.floor(p.r() * 16), y = Math.floor(p.r() * 16); p.set(x, y, a); p.set((x + 1) & 15, y, karis(a, 0.85)); }
  for (let i = 0; i < 14; i++) p.set(Math.floor(p.r() * 16), Math.floor(p.r() * 16), k);
}
function mercanDal(p, renk) {
  bitki(p, p => {
    const c = hex(renk);
    const dal = (x, y, a, uz, d) => { for (let k = 0; k < uz; k++) { x += Math.cos(a); y -= Math.sin(a); p.set(Math.round(x), Math.round(y), karis(c, 0.8 + p.r() * 0.4)); p.set(Math.round(x) + 1, Math.round(y), karis(c, 0.7)); } if (d > 0) { dal(x, y, a + 0.6, uz * 0.6, d - 1); dal(x, y, a - 0.6, uz * 0.6, d - 1); } else p.set(Math.round(x), Math.round(y), karis(c, 1.35)); };
    dal(7.5, 15, Math.PI / 2, 5, 2);
  });
}
function cevher2(p, renk, adet) {
  const c = hex(renk);
  for (let n = 0; n < adet; n++) { const x = 1 + Math.floor(p.r() * 13), y = 1 + Math.floor(p.r() * 13); p.set(x, y, c); p.set(x + 1, y, karis(c, 0.8)); }
}
function fidan(p, yaprakRenk, govde) {
  bitki(p, p => {
    cizgi(p, 8, 15, 8, 8, hex(govde));
    const c = hex(yaprakRenk);
    for (let y = 2; y < 11; y++) for (let x = 3; x < 14; x++) { const d = ((x - 8) / 5) ** 2 + ((y - 6) / 4.5) ** 2; if (d < 1 && p.r() < 0.75) p.set(x, y, karis(c, 0.75 + p.r() * 0.5)); }
  });
}

/* ---------- 0.31.0: yapı ve dekorasyon dokuları ---------- */
const karisRenk = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
/* Renkli cam: çerçeve ve parıltı çizgileri; iç kısım seyrek renk noktalarıyla renk verir (kesik çizim) */
const renkliCam = renk => p => {
  for (let i = 0; i < D * D * 4; i++) p.d[i] = 0;
  const c = hex(renk), k = karis(c, 0.75), a = karisRenk(c, [255, 255, 255], 0.45);
  for (let i = 0; i < 16; i++) { p.set(i, 0, k); p.set(i, 15, k); p.set(0, i, k); p.set(15, i, k); }
  /* 0.35.0: camın içi de renkli görünsün diye dama desenli yarı dolgu (kesik çizimde renkli cam etkisi) */
  for (let y = 1; y < 15; y++) for (let x = 1; x < 15; x++) if ((x + y) % 2 === 0) p.set(x, y, karis(c, 0.92 + p.r() * 0.16));
  cizgi(p, 3, 6, 6, 3, a); cizgi(p, 3, 8, 8, 3, a); cizgi(p, 10, 13, 13, 10, a);
};
/* Pişmiş kil: mat, hafif lekeli; renkler toprak tonuna yaklaştırılır */
const pismisKil = renk => p => {
  const c = karisRenk(hex(renk), [154, 106, 82], 0.38);
  for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) p.set(x, y, karis(c, 0.94 + p.r() * 0.1));
  for (let i = 0; i < 14; i++) p.set(Math.floor(p.r() * D), Math.floor(p.r() * D), karis(c, 0.86));
};
/* Beton: düz ve pürüzsüz, çok ince benekli */
const beton = renk => p => {
  const c = hex(renk);
  for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) p.set(x, y, karis(c, 0.97 + p.r() * 0.05));
  for (let i = 0; i < 8; i++) p.set(Math.floor(p.r() * D), Math.floor(p.r() * D), karis(c, 0.9));
};
Object.assign(RESSAM, {
  akasya_kalas: p => kalas(p, '#b8643a'),
  cilali_tas: p => {
    p.doldur('#a4a4a4', 0.025); const k = hex('#7a7a7a'), a = hex('#bcbcbc');
    for (let i = 0; i < D; i++) { p.set(i, 0, a); p.set(0, i, a); p.set(i, 15, k); p.set(15, i, k); }
    for (let i = 2; i < 14; i++) { p.set(i, 2, karis(a, 0.97)); p.set(2, i, karis(a, 0.97)); p.set(i, 13, karis(k, 1.12)); p.set(13, i, karis(k, 1.12)); }
  },
  /* Parke zemin: 4 x 4 hücrelerde dönüşümlü yatay / dikey tahtalar (hasır örgü) */
  parke_zemin: p => {
    const a = hex('#a87a46'), b = hex('#8c6236'), k = hex('#5e3e1e');
    for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) {
      const h = ((x >> 2) + (y >> 2)) & 1, s = h ? x & 3 : y & 3, renk = ((h ? x >> 1 : y >> 1) & 1) ? a : b;
      p.set(x, y, s === 3 ? karis(k, 0.95 + p.r() * 0.1) : karis(renk, 0.92 + p.r() * 0.14));
    }
  },
  kareli_zemin: p => {
    const a = hex('#e6e2d8'), b = hex('#2c2c32');
    for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { const c = ((x >> 2) + (y >> 2)) & 1 ? b : a; p.set(x, y, karis(c, 0.95 + p.r() * 0.08)); }
    for (let i = 0; i < D; i++) { p.set(i, 15, karis(b, 0.8)); p.set(15, i, karis(b, 0.8)); }
  },
  dolap_on: p => {
    kalas(p, '#7a5a37'); const a = hex('#a07a4a'), k = hex('#4a321c'), g = hex('#e8c040');
    for (let i = 0; i < D; i++) { p.set(i, 0, k); p.set(i, 15, k); p.set(0, i, k); p.set(15, i, k); p.set(7, i, k); p.set(8, i, karis(a, 0.9)); }
    for (let y = 2; y < 14; y++) { p.set(2, y, a); p.set(10, y, a); p.set(5, y, karis(k, 1.3)); p.set(13, y, karis(k, 1.3)); }
    for (let x = 2; x < 6; x++) { p.set(x, 2, a); p.set(x, 13, karis(k, 1.3)); p.set(x + 8, 2, a); p.set(x + 8, 13, karis(k, 1.3)); }
    p.set(6, 7, g); p.set(6, 8, karis(g, 0.8)); p.set(9, 7, g); p.set(9, 8, karis(g, 0.8));
  },
  dolap_yan: p => { kalas(p, '#7a5a37'); const k = hex('#4a321c'); for (let i = 0; i < D; i++) { p.set(i, 0, k); p.set(i, 15, k); p.set(0, i, k); p.set(15, i, k); } },
  dolap_ust: p => { p.doldur('#6e5032', 0.05); const k = hex('#4a321c'); for (let i = 0; i < D; i++) { p.set(i, 0, k); p.set(i, 15, k); p.set(0, i, k); p.set(15, i, k); } },
  somine_ic: p => { p.doldur('#2a2220', 0.12); p.lekeler('#1a1412', 18, 2, 0.05); for (let i = 0; i < 5; i++) p.set(Math.floor(p.r() * D), 12 + Math.floor(p.r() * 4), hex('#c8541e')); },
  mum_govde: p => { p.doldur('#efe6c8', 0.03); for (let y = 0; y < D; y++) { p.set(0, y, hex('#d8ccaa')); p.set(15, y, hex('#d8ccaa')); } for (let x = 3; x < 8; x++) p.set(x, 1 + (x & 1), hex('#fffbe8')); },
  mum_alev: p => { p.doldur('#ffb83a', 0.06); for (let y = 4; y < 12; y++) for (let x = 5; x < 11; x++) p.set(x, y, hex('#fff1a8')); },
  kitap_sirt: p => {
    const R = ['#8a2a24', '#2a4a8a', '#2a6a3a', '#7a5a22', '#5a2a6a', '#8a6a2a', '#2a5a5a', '#6a2a2a'], g = hex('#e8c040');
    for (let x = 0; x < D; x++) { const c = hex(R[(x >> 1) % R.length]); for (let y = 0; y < D; y++) p.set(x, y, (x & 1) && p.r() < 0.3 ? karis(c, 0.8) : karis(c, 0.92 + p.r() * 0.12)); if (!(x & 1)) { p.set(x, 3, g); p.set(x, 12, g); } }
  },
  vazo: p => {
    p.doldur('#eef2f6', 0.03); const m = hex('#2f5bc0');
    for (let x = 0; x < D; x++) { p.set(x, 2, m); p.set(x, 13, m); if (x % 4 === 1) for (let y = 5; y < 11; y++) if (Math.abs(y - 8) <= 2 - ((x >> 2) & 1)) p.set(x, y, karis(m, 1.1)); }
    for (let x = 0; x < D; x += 4) { p.set(x + 3, 7, m); p.set(x + 3, 9, m); p.set(x + 2, 8, m); p.set(x + 4, 8, m); }
  }
});
YUN_RENKLERI.forEach(r => { const ek = r.dok.slice(3); RESSAM['cam' + ek] = renkliCam(r.renk); RESSAM['kil' + ek] = pismisKil(r.renk); RESSAM['beton' + ek] = beton(r.renk); });
RESSAM.kil_0 = pismisKil('#e8d8c8'); RESSAM.beton_0 = beton('#8e9092');

/* ---------- 0.34.0: tarım dokuları ---------- */
/* Çalımsı ekin: evreye göre boy; olgunlukta (e = 3) meyveler; e = 2'de çiçek */
function caliEkin(p, e, yap, meyve, cicek, kucukMeyve) {
  bitki(p, p => {
    const c = hex(yap), boy = [4, 7, 10, 11][e];
    cizgi(p, 8, 15, 8, 15 - boy, karis(c, 0.75));
    for (let y = 15 - boy; y < 15; y++) for (let x = 2; x < 14; x++) { const d = ((x - 8) / (2 + boy / 2.4)) ** 2 + ((y - (15 - boy / 2)) / (boy / 2 + 0.5)) ** 2; if (d < 1 && p.r() < 0.6) p.set(x, y, karis(c, 0.7 + p.r() * 0.45)); }
    if (e === 2 && cicek) for (let i = 0; i < 4; i++) p.set(4 + Math.floor(p.r() * 8), 15 - boy + Math.floor(p.r() * boy * 0.7), hex(cicek));
    if (e === 3) { const m = hex(meyve); for (let i = 0; i < (kucukMeyve ? 9 : 5); i++) { const x = 3 + Math.floor(p.r() * 10), y = 15 - boy + 2 + Math.floor(p.r() * (boy - 3)); p.set(x, y, m); if (!kucukMeyve) { p.set(x + 1, y, karis(m, 0.85)); p.set(x, y + 1, karis(m, 0.8)); p.set(x + 1, y + 1, karis(m, 0.7)); } } }
  });
}
function misirCiz(p, e) {
  bitki(p, p => {
    const c = hex(e === 3 ? '#8aa23a' : '#4f9a35'), boy = [5, 9, 13, 15][e];
    for (const x of [4, 11]) {
      cizgi(p, x, 15, x, 16 - boy, karis(c, 0.8));
      for (let y = 15; y > 16 - boy; y -= 3) { cizgi(p, x, y, x + (y % 2 ? 3 : -3), y - 2, karis(c, 0.9 + p.r() * 0.2)); }
      if (e >= 2) { const t = hex('#d8c060'); p.set(x, 15 - boy + 1, t); p.set(x, 15 - boy + 2, t); }
      if (e === 3) { const k = hex('#f2c43c'); for (let y = 7; y < 11; y++) { p.set(x + 1, y, karis(k, 0.9 + p.r() * 0.2)); p.set(x + 2, y, karis(k, 0.8)); } p.set(x + 1, 6, hex('#a0b860')); }
    }
  });
}
function soganCiz(p, e) {
  bitki(p, p => {
    const c = hex('#5aa83b'), boy = [4, 7, 9, 10][e];
    for (const x of [3, 6, 9, 12]) for (let y = 15; y > 15 - boy; y--) p.set(x + ((15 - y) > boy / 2 ? (x % 2 ? 1 : 0) : 0), y, karis(c, 0.8 + p.r() * 0.3));
    if (e === 3) { const k = hex('#c88a4a'); for (const x of [3, 9]) { p.set(x, 14, k); p.set(x + 1, 14, k); p.set(x, 15, karis(k, 0.8)); p.set(x + 1, 15, karis(k, 0.8)); p.set(x - 1, 15, karis(k, 0.7)); } }
  });
}
function lahanaCiz(p, e) {
  bitki(p, p => {
    const c = hex(e === 3 ? '#8ac05a' : '#6aa84a'), r = [2.5, 4, 5.5, 6.5][e];
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const d = Math.hypot(x - 7.5, (y - (15 - r)) * 1.2); if (d < r) p.set(x, y, karis(c, 0.75 + (1 - d / r) * 0.35 + p.r() * 0.1)); }
    if (e >= 2) { const k = karis(c, 0.7); for (let i = -2; i <= 2; i++) p.set(7 + i, Math.round(15 - r - Math.abs(i) * 0.5), k); }
  });
}
function pamukCiz(p, e) {
  bitki(p, p => {
    const c = hex(e === 3 ? '#6a7a3a' : '#4f9a35'), boy = [4, 8, 11, 12][e];
    for (const x of [4, 11]) { cizgi(p, x, 15, x, 15 - boy, karis(c, 0.75)); cizgi(p, x, 15 - boy / 2, x + 3, 15 - boy / 2 - 2, c); cizgi(p, x, 15 - boy / 3, x - 3, 15 - boy / 3 - 2, c); }
    if (e === 2) for (const [x, y] of [[4, 3], [11, 3], [7, 6]]) p.set(x, y + 1, hex('#f0e0a0'));
    if (e === 3) { const w = hex('#f6f4ee'); for (const [x, y] of [[4, 3], [11, 3], [7, 7], [14, 7], [1, 9]]) for (const [a, b] of [[0, 0], [1, 0], [0, 1], [1, 1], [-1, 0]]) p.set(x + a, y + b, karis(w, 0.9 + p.r() * 0.1)); }
  });
}
function meyveYaprak(p, renk, meyve) {
  yaprak(p, renk);
  if (meyve) { const m = hex(meyve); for (let i = 0; i < 6; i++) { const x = 1 + Math.floor(p.r() * 13), y = 1 + Math.floor(p.r() * 13); p.set(x, y, m); p.set(x + 1, y, karis(m, 0.85)); p.set(x, y + 1, karis(m, 0.75)); p.set(x + 1, y + 1, karis(m, 0.65)); } }
}
Object.assign(RESSAM, {
  ...Object.fromEntries([0, 1, 2, 3].flatMap(e => [
    ['domates' + e, p => caliEkin(p, e, '#3f8f2c', '#d8342a', '#f2d23a')],
    ['biber' + e, p => caliEkin(p, e, '#4a9a32', '#3aa83a', '#f0f0f0')],
    ['cilek' + e, p => caliEkin(p, Math.min(e, 2) === e ? e : 3, '#3a8a3a', '#e0283a', '#ffffff', true)],
    ['misir' + e, p => misirCiz(p, e)], ['sogan' + e, p => soganCiz(p, e)], ['lahana' + e, p => lahanaCiz(p, e)], ['pamuk' + e, p => pamukCiz(p, e)],
    ['karpuz_sap' + e, e < 3 ? (p => ekinCiz(p, [3, 6, 9][e], '#5aa83b', null, e === 2 ? '#f2e030' : null)) : (p => bitki(p, p => { const c = hex('#4a8f30'); cizgi(p, 8, 15, 8, 7, c); cizgi(p, 8, 10, 2, 14, karis(c, 0.85)); cizgi(p, 8, 9, 14, 13, karis(c, 0.9)); for (const [x, y] of [[2, 13], [14, 12], [7, 6], [9, 6]]) p.set(x, y, karis(c, 1.2)); }))]
  ])),
  karpuz_yan: p => { p.doldur('#3a8a2a', 0.05); const k = hex('#1f5a1a'); for (let x = 0; x < 16; x += 3) for (let y = 0; y < 16; y++) if (((x + Math.floor(y / 2)) % 3) === 0) p.set(x + (y % 2), y, karis(k, 0.9 + p.r() * 0.2)); },
  karpuz_ust: p => { p.doldur('#3a8a2a', 0.05); const k = hex('#1f5a1a'); for (let a = 0; a < 8; a++) { const t = a / 8 * Math.PI * 2; for (let r = 1; r < 8; r++) p.set(Math.round(7.5 + Math.cos(t) * r), Math.round(7.5 + Math.sin(t) * r), k); } p.set(7, 7, hex('#6a5a2a')); p.set(8, 7, hex('#6a5a2a')); },
  fidan_elma: p => fidan(p, '#4f9a35', '#6b502c'), fidan_kiraz: p => fidan(p, '#3a8a32', '#5a3a2a'), fidan_portakal: p => fidan(p, '#2f7a2a', '#7a5a3a'), fidan_zeytin: p => fidan(p, '#7a9a6a', '#8a7a5a'),
  yaprak_elma: p => meyveYaprak(p, '#4a8a2e'), yaprak_elma_m: p => meyveYaprak(p, '#4a8a2e', '#d8342a'),
  yaprak_kiraz: p => meyveYaprak(p, '#3a7a2e'), yaprak_kiraz_m: p => meyveYaprak(p, '#3a7a2e', '#a8102a'),
  yaprak_portakal: p => meyveYaprak(p, '#2e6e2a'), yaprak_portakal_m: p => meyveYaprak(p, '#2e6e2a', '#f08a1a'),
  yaprak_zeytin: p => meyveYaprak(p, '#6a8a5a'), yaprak_zeytin_m: p => meyveYaprak(p, '#6a8a5a', '#3a4a1a'),
  kompost_yan: p => { kalas(p, '#7a5a37'); const k = hex('#4a321c'); for (let i = 0; i < 16; i++) { p.set(i, 0, k); p.set(i, 15, k); p.set(i, 5, k); p.set(i, 10, k); p.set(0, i, k); p.set(15, i, k); } },
  kompost_ic: p => { p.doldur('#4a3a22', 0.12); p.lekeler('#6a8a3a', 10, 1, 0.1); p.lekeler('#2e2216', 14, 1, 0.05); },
  kompost_hazir: p => { p.doldur('#3a2a1a', 0.1); p.lekeler('#2a1e12', 18, 1, 0.05); for (let i = 0; i < 6; i++) p.set(Math.floor(p.r() * 16), Math.floor(p.r() * 16), hex('#8a7a4a')); }
});

/* 0.35.0: yanan fırının ön yüzü */
RESSAM.firin_on_a = p => { RESSAM.firin_on(p); for (let y = 8; y < 14; y++) for (let x = 4; x < 12; x++) { const k = (13 - y) / 5 + p.r() * 0.3; p.set(x, y, k < 0.35 ? [255, 214, 90] : k < 0.75 ? [240, 130, 30] : [150, 50, 20]); } };
/* 0.37.0: mobilya, dekor ve yapı dokuları (satır 0 dokunun üstüdür) */
{
  const K = (p, c) => { const k = hex(c); for (let i = 0; i < D; i++) { p.set(i, 0, k); p.set(i, 15, k); p.set(0, i, k); p.set(15, i, k); } };
  const nk = (p, n, c, x0 = 0, y0 = 0, w = 16, h = 16, s = 0.4) => { const k = hex(c); for (let i = 0; i < n; i++) p.set(x0 + Math.floor(p.r() * w), y0 + Math.floor(p.r() * h), karis(k, 1 - s / 2 + p.r() * s)); };
  const dikd = (p, x0, y0, x1, y1, c, s = 0.06) => { const k = hex(c); for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) p.set(x, y, karis(k, 1 - s + p.r() * s * 2)); };
  const damar = (p, c, n = 3) => { const k = hex(c); for (let j = 0; j < n; j++) { let x = p.r() * 16, y = 0; while (y < 16) { p.set(Math.floor(x), Math.floor(y), karis(k, 0.9 + p.r() * 0.2)); x += (p.r() - 0.5) * 2.2; y += 0.7; if (x < 0 || x > 15) break; } } };
  const kadife = (p, c) => { p.doldur(c, 0.05); const k = hex(c); for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) if ((x * 3 + y * 5) % 11 === 0) p.set(x, y, karis(k, 0.82)); else if ((x + y * 2) % 13 === 0) p.set(x, y, karis(k, 1.12)); };
  const metal = (p, c, s = 0.04) => { p.doldur(c, s); const k = hex(c); for (let y = 0; y < D; y++) { const t = 0.92 + 0.12 * Math.sin(y * 0.7); for (let x = 0; x < D; x++) if (p.r() < 0.35) p.set(x, y, karis(k, t)); } };
  const cini = (p, zemin, cizgi1, cizgi2) => { p.doldur(zemin, 0.03); const a = hex(cizgi1), b = hex(cizgi2);
    for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { const dx = Math.abs(x - 7.5), dy = Math.abs(y - 7.5); if (Math.abs(dx + dy - 6) < 0.8) p.set(x, y, a); else if (dx + dy < 2.2) p.set(x, y, b); else if ((dx < 0.8 || dy < 0.8) && dx + dy > 2.2 && dx + dy < 5) p.set(x, y, karis(a, 1.2)); }
    for (const [x, y] of [[0, 0], [15, 0], [0, 15], [15, 15]]) p.set(x, y, b); };
  Object.assign(RESSAM, {
    ahsap_cilali: p => { kalas(p, '#7a3a1e'); const k = hex('#a85a30'); for (let y = 1; y < D; y += 4) for (let x = 0; x < D; x++) if (p.r() < 0.3) p.set(x, y, karis(k, 0.95 + p.r() * 0.1)); },
    doseme_yesil: p => kadife(p, '#2f6a3a'), doseme_kahve: p => { kadife(p, '#6a3e22'); nk(p, 10, '#8a5a36'); }, doseme_kirmizi: p => kadife(p, '#9a2228'),
    demir_siyah: p => { p.doldur('#2c2c30', 0.06); nk(p, 18, '#48484e'); },
    cekmece_on: p => { kalas(p, '#7a3a1e'); const k = hex('#4a2010'); for (const y of [0, 5, 10, 15]) for (let x = 0; x < D; x++) p.set(x, y, k); for (let y = 0; y < D; y++) { p.set(0, y, k); p.set(15, y, k); } for (const y of [2, 7, 12]) { p.set(7, y, [220, 190, 110]); p.set(8, y, [200, 170, 90]); } },
    kagit: p => { p.doldur('#f4f0e2', 0.02); const k = hex('#b8c0d0'); for (let y = 3; y < D; y += 3) for (let x = 2; x < 14; x++) if (p.r() < 0.8) p.set(x, y, k); },
    murekkep: p => { p.doldur('#1a1a3a', 0.08); dikd(p, 0, 0, 15, 3, '#2a2a2a'); p.set(5, 8, [90, 90, 140]); },
    gardirop_alt: p => { kalas(p, '#7a3a1e'); const k = hex('#4a2010'); for (let y = 0; y < D; y++) { p.set(0, y, k); p.set(7, y, k); p.set(8, y, karis(k, 1.2)); p.set(15, y, k); } for (let x = 0; x < D; x++) p.set(x, 15, k); for (const x of [2, 10]) for (let y = 2; y < 13; y++) { p.set(x, y, karis(k, 1.3)); p.set(x + 3, y, karis(k, 1.3)); } p.set(6, 1, [230, 200, 120]); p.set(9, 1, [230, 200, 120]); },
    gardirop_ust: p => { kalas(p, '#7a3a1e'); const k = hex('#4a2010'); for (let y = 0; y < D; y++) { p.set(0, y, k); p.set(7, y, k); p.set(8, y, karis(k, 1.2)); p.set(15, y, k); } for (let x = 0; x < D; x++) p.set(x, 0, k); for (const x of [2, 10]) for (let y = 3; y < 15; y++) { p.set(x, y, karis(k, 1.3)); p.set(x + 3, y, karis(k, 1.3)); } p.set(6, 14, [230, 200, 120]); p.set(9, 14, [230, 200, 120]); },
    sarkac: p => { kalas(p, '#7a3a1e'); dikd(p, 4, 0, 11, 15, '#2a1c14', 0.04); for (let y = 0; y < 12; y++) p.set(8, y, [200, 160, 70]); for (let y = 2; y < 6; y++) for (let x = 6; x < 11; x++) if (Math.hypot(x - 8, y - 3.5) < 2.2) p.set(x, y, [236, 196, 90]); },
    saat_yuz: p => { kalas(p, '#7a3a1e'); for (let y = 0; y < 11; y++) for (let x = 0; x < D; x++) { const d = Math.hypot(x - 7.5, y - 5); if (d < 4.8) p.set(x, y, [240, 232, 210]); else if (d < 5.8) p.set(x, y, [210, 170, 80]); }
      for (let a = 0; a < 12; a++) { const t = a / 12 * Math.PI * 2; p.set(Math.round(7.5 + Math.sin(t) * 4), Math.round(5 - Math.cos(t) * 4), [40, 30, 20]); } cizgi(p, 8, 5, 8, 2, [30, 20, 10]); cizgi(p, 8, 5, 10, 6, [30, 20, 10]); },
    duvar_saat: p => { p.doldur('#7a3a1e', 0.05); for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { const d = Math.hypot(x - 7.5, y - 7.5); if (d < 4.6) p.set(x, y, [244, 238, 220]); else if (d < 5.3) p.set(x, y, [200, 160, 70]); }
      for (let a = 0; a < 12; a++) { const t = a / 12 * Math.PI * 2; p.set(Math.round(7.5 + Math.sin(t) * 3.8), Math.round(7.5 - Math.cos(t) * 3.8), [40, 30, 20]); } cizgi(p, 8, 8, 8, 4, [20, 20, 20]); cizgi(p, 8, 8, 10, 9, [20, 20, 20]); p.set(8, 8, [160, 30, 30]); },
    piyano_govde: p => { p.doldur('#141418', 0.06); for (let y = 0; y < D; y++) if (y % 5 === 1) for (let x = 0; x < D; x++) if (p.r() < 0.4) p.set(x, y, [48, 48, 56]); },
    piyano_tus: p => { p.doldur('#f2efe6', 0.02); for (let x = 0; x < D; x += 2) for (let y = 0; y < D; y++) p.set(x, y, [180, 176, 166]); for (const x of [1, 3, 7, 9, 11, 15]) for (let y = 0; y < 9; y++) p.set(x, y, [24, 24, 28]); },
    pirinc: p => { metal(p, '#c8a040', 0.06); nk(p, 8, '#f0d070'); },
    beyaz_emaye: p => { p.doldur('#f2f2ee', 0.02); nk(p, 6, '#ffffff'); },
    buzdolabi_alt: p => { p.doldur('#f2f2ee', 0.02); const k = hex('#c8c8c4'); for (let x = 0; x < D; x++) p.set(x, 0, k); for (let y = 0; y < D; y++) { p.set(0, y, k); p.set(15, y, k); } p.set(3, 3, [80, 160, 220]); },
    buzdolabi_ust: p => { p.doldur('#f2f2ee', 0.02); const k = hex('#c8c8c4'); for (let x = 0; x < D; x++) { p.set(x, 15, k); p.set(x, 0, k); } for (let y = 0; y < D; y++) { p.set(0, y, k); p.set(15, y, k); } },
    krom: p => { metal(p, '#c4c8cc', 0.04); for (let y = 0; y < D; y++) p.set((y * 3) % 16, y, [240, 244, 248]); },
    yorgan_mavi: p => { p.doldur('#2a4a8a', 0.05); const k = hex('#1c3266'), a = hex('#3e62a8'); for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { const u = (x + y) % 8, v = (x - y + 16) % 8; if (!u || !v) p.set(x, y, k); else if (u === 1 || v === 1) p.set(x, y, a); } },
    tulum: p => { p.doldur('#3a6a2a', 0.05); for (let y = 0; y < D; y += 4) for (let x = 0; x < D; x++) p.set(x, y, [46, 84, 34]); },
    tulum_ic: p => { p.doldur('#d86a2a', 0.05); nk(p, 12, '#e88a4a'); },
    hamak_bez: p => { const R = ['#e8dcc0', '#c8402a', '#e8dcc0', '#2a5aa8']; for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) p.set(x, y, karis(hex(R[Math.floor(x / 4) % 4]), 0.92 + p.r() * 0.1)); },
    halat: p => { p.doldur('#b8945a', 0.05); for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) if ((x + y) % 4 === 0) p.set(x, y, [130, 100, 56]); },
    lambri: p => { const R = ['#9a6a3a', '#8a5c30', '#a8784a', '#946434']; for (let x = 0; x < D; x++) { const c = hex(R[Math.floor(x / 4)]); for (let y = 0; y < D; y++) p.set(x, y, karis(c, 0.92 + p.r() * 0.12)); } for (let y = 0; y < D; y++) for (const x of [0, 4, 8, 12]) p.set(x, y, [74, 48, 26]); },
    bilardo_cuha: p => { p.doldur('#1e7a3a', 0.04); nk(p, 20, '#2a8a48', 0, 0, 16, 16, 0.1); },
    abajur: p => { p.doldur('#f4e2b0', 0.03); for (let x = 0; x < D; x += 3) for (let y = 0; y < D; y++) p.set(x, y, [232, 206, 150]); for (let x = 0; x < D; x++) { p.set(x, 0, [200, 160, 80]); p.set(x, 15, [200, 160, 80]); } },
    sokak_cam: p => { p.doldur('#fff2b8', 0.03); const k = hex('#2c2c30'); for (let i = 0; i < D; i++) { p.set(i, 0, k); p.set(i, 15, k); p.set(0, i, k); p.set(15, i, k); p.set(7, i, k); p.set(8, i, k); } },
    bayrak_sol: p => { p.doldur('#d81e24', 0.03); const b = [250, 250, 250]; for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { if (Math.hypot(x - 7, y - 9) < 4.2 && Math.hypot(x - 8.2, y - 9) >= 3.4) p.set(x, y, b); }
      for (const [x, y] of [[11, 9], [12, 9], [13, 9], [12, 8], [12, 10], [11, 8], [13, 10]]) p.set(x, y, b); },
    bayrak_sag: p => p.doldur('#d81e24', 0.03),
    kuyu_tas: p => { p.doldur('#6a6a66', 0.05); for (let y = 0; y < D; y += 4) for (let x = 0; x < D; x++) { const o = (y / 4) % 2 ? 3 : 0; if ((x + o) % 6 === 0) for (let k = 0; k < 4; k++) p.set(x, y + k, [70, 66, 60]); p.set(x, y, [74, 70, 64]); } nk(p, 30, '#8a8a84'); },
    kasa_elma: p => { p.doldur('#8a5a30', 0.05); for (let y = 1; y < D; y += 3) for (let x = (y % 2) + 1; x < D; x += 3) { p.set(x, y, [200, 30, 30]); p.set(x + 1, y, [220, 50, 40]); p.set(x, y + 1, [170, 20, 20]); p.set(x + 1, y + 1, [190, 30, 30]); } },
    kasa_portakal: p => { p.doldur('#8a5a30', 0.05); for (let y = 1; y < D; y += 3) for (let x = (y % 2) + 1; x < D; x += 3) { p.set(x, y, [240, 150, 30]); p.set(x + 1, y, [250, 170, 50]); p.set(x, y + 1, [220, 130, 20]); p.set(x + 1, y + 1, [236, 146, 30]); } },
    kasa_ekmek: p => { p.doldur('#8a5a30', 0.05); for (let y = 2; y < D; y += 5) for (let x = 0; x < D; x++) { const c = [200 - (x % 4) * 6, 140, 60]; p.set(x, y, c); p.set(x, y + 1, karis(c, 0.85)); p.set(x, y + 2, karis(c, 0.7)); if (x % 4 === 1) p.set(x, y, [240, 210, 150]); } },
    tente: p => { for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) p.set(x, y, karis(Math.floor(x / 4) % 2 ? [236, 232, 220] : [200, 36, 40], 0.94 + p.r() * 0.08)); },
    heykel: p => { p.doldur('#a8a8a0', 0.05); nk(p, 18, '#8a8a84'); nk(p, 8, '#c4c4bc'); },
    mermer: p => { p.doldur('#ece8e2', 0.025); damar(p, '#b8b4ae', 3); damar(p, '#d2cec8', 2); },
    mermer_cilali: p => { p.doldur('#f2efea', 0.015); damar(p, '#c8c4be', 2); K(p, '#d8d4ce'); },
    mermer_tugla: p => { tugla(p, '#ece8e2', '#c4c0ba'); damar(p, '#d0ccc6', 1); },
    mermer_sutun_yan: p => { p.doldur('#ece8e2', 0.02); for (let y = 0; y < D; y++) for (const x of [1, 4, 7, 10, 13]) { p.set(x, y, [196, 192, 186]); p.set(x + 1, y, [214, 210, 204]); } for (let x = 0; x < D; x++) { p.set(x, 0, [210, 206, 200]); p.set(x, 15, [210, 206, 200]); } },
    mermer_sutun_ust: p => { p.doldur('#ece8e2', 0.02); for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { const d = Math.hypot(x - 7.5, y - 7.5); if (Math.abs(d - 6) < 0.6 || Math.abs(d - 3) < 0.5) p.set(x, y, [200, 196, 190]); } },
    granit: p => { p.doldur('#9a8a84', 0.06); nk(p, 50, '#5a4a48', 0, 0, 16, 16, 0.2); nk(p, 30, '#d8c8c0', 0, 0, 16, 16, 0.1); nk(p, 16, '#c87a6a'); },
    granit_cilali: p => { p.doldur('#a8968e', 0.03); nk(p, 40, '#6a5a56', 0, 0, 16, 16, 0.1); nk(p, 24, '#e0d0c8', 0, 0, 16, 16, 0.05); K(p, '#8a7a74'); },
    bazalt_yan: p => { p.doldur('#3a3a40', 0.06); for (let x = 0; x < D; x += 5) for (let y = 0; y < D; y++) p.set(x, y, [30, 30, 34]); nk(p, 18, '#4e4e56'); },
    bazalt_ust: p => { p.doldur('#3a3a40', 0.06); for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { const d = Math.hypot(x - 7.5, y - 7.5); if (Math.abs(d - 5.5) < 0.6) p.set(x, y, [28, 28, 32]); } },
    bazalt_cilali: p => { p.doldur('#43434a', 0.03); K(p, '#2e2e34'); nk(p, 10, '#56565e', 1, 1, 14, 14, 0.1); },
    kayrak: p => { p.doldur('#4e5662', 0.06); for (let y = 0; y < D; y += 3) for (let x = 0; x < D; x++) if (p.r() < 0.7) p.set(x, y, [62, 68, 78]); nk(p, 12, '#68707c'); },
    kayrak_kiremit: p => { p.doldur('#4a525e', 0.05); for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { const s = Math.floor(y / 4), o = s % 2 ? 4 : 0; if (y % 4 === 3) p.set(x, y, [36, 40, 48]); else if ((x + o) % 8 === 0) p.set(x, y, [40, 44, 52]); else if (y % 4 === 0) p.set(x, y, [92, 100, 112]); } },
    kirectasi: p => { p.doldur('#d8ccb0', 0.05); nk(p, 30, '#c4b898'); nk(p, 6, '#ece4d0'); },
    kerpic: p => { tugla(p, '#b8865a', '#8a6038'); for (let i = 0; i < 18; i++) p.set(Math.floor(p.r() * 16), Math.floor(p.r() * 16), [220, 200, 120]); },
    eski_tugla: p => { tugla(p, '#9a4a36', '#8a8478'); nk(p, 20, '#7a3426'); nk(p, 10, '#b8654a'); },
    catlak_tugla: p => { RESSAM.tas_tugla(p); const k = hex('#3e3e3e'); let x = 3, y = 0; while (y < 16) { p.set(x, y, k); x += p.r() < 0.5 ? 1 : -1; y++; } x = 11; y = 6; while (y < 16 && x < 16) { p.set(x, y, k); x += p.r() < 0.6 ? 1 : 0; y++; } },
    yosunlu_tugla: p => { RESSAM.tas_tugla(p); nk(p, 40, '#4a7a2a', 0, 0, 16, 16, 0.3); for (let x = 0; x < D; x++) if (p.r() < 0.6) p.set(x, 15, [60, 100, 40]); },
    fayans: p => { p.doldur('#f4f4f2', 0.015); for (let i = 0; i < D; i++) { p.set(i, 7, [200, 204, 208]); p.set(7, i, [200, 204, 208]); p.set(i, 15, [200, 204, 208]); p.set(15, i, [200, 204, 208]); } p.set(3, 3, [255, 255, 255]); p.set(11, 11, [255, 255, 255]); },
    mozaik: p => { const R = ['#c83a2a', '#e8b030', '#2a6ab8', '#ece8e0', '#3a8a4a']; for (let y = 0; y < D; y += 2) for (let x = 0; x < D; x += 2) { const c = hex(R[Math.floor(p.r() * R.length)]); for (const [a, b] of [[0, 0], [1, 0], [0, 1]]) p.set(x + a, y + b, karis(c, 0.9 + p.r() * 0.15)); p.set(x + 1, y + 1, [90, 84, 76]); } },
    iznik: p => { cini(p, '#f2f0ea', '#1e5aa8', '#c8302a'); for (const [x, y] of [[7, 3], [8, 3], [3, 7], [3, 8], [12, 7], [12, 8], [7, 12], [8, 12]]) p.set(x, y, [40, 140, 120]); },
    kamis_yan: p => { p.doldur('#b8a860', 0.05); for (let x = 0; x < D; x += 2) for (let y = 0; y < D; y++) p.set(x, y, [150, 136, 72]); for (const y of [3, 12]) for (let x = 0; x < D; x++) p.set(x, y, [120, 90, 50]); },
    kamis_ust: p => { p.doldur('#9a8a48', 0.05); for (let y = 1; y < D; y += 3) for (let x = 1; x < D; x += 3) { p.set(x, y, [70, 60, 30]); p.set(x + 1, y, [200, 186, 110]); } },
    hasir: p => { for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { const k = (Math.floor(x / 4) + Math.floor(y / 4)) % 2, ic = k ? y % 4 : x % 4; p.set(x, y, karis([200, 166, 96], ic === 0 ? 0.72 : 0.92 + p.r() * 0.12)); } },
    saman_cati: p => { p.doldur('#c8a850', 0.06); for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) if ((x * 7 + y) % 5 === 0) p.set(x, y, [150, 120, 50]); for (const y of [4, 9, 14]) for (let x = 0; x < D; x++) if (p.r() < 0.7) p.set(x, y, [130, 104, 44]); },
    demir_levha: p => { metal(p, '#a8acb0', 0.04); K(p, '#80848a'); for (const [x, y] of [[2, 2], [13, 2], [2, 13], [13, 13]]) { p.set(x, y, [70, 72, 76]); p.set(x + 1, y + 1, [210, 214, 218]); } },
    bakir_levha: p => { metal(p, '#c8783e', 0.05); K(p, '#9a5428'); for (const [x, y] of [[2, 2], [13, 2], [2, 13], [13, 13]]) { p.set(x, y, [120, 60, 30]); p.set(x + 1, y + 1, [240, 170, 110]); } },
    pasli_bakir: p => { metal(p, '#5aa88a', 0.06); nk(p, 30, '#3a8a6a', 0, 0, 16, 16, 0.2); nk(p, 14, '#b8703a'); K(p, '#3e7a64'); },
    cam_tugla: p => { for (let i = 0; i < D * D * 4; i++) p.d[i] = 0; for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { const k = x % 8 === 0 || y % 8 === 0 || x % 8 === 7 || y % 8 === 7; p.set(x, y, k ? [200, 222, 232] : [176, 214, 230], k ? 255 : 110); } for (const [x, y] of [[2, 2], [10, 2], [2, 10], [10, 10]]) p.set(x, y, [255, 255, 255], 220); },
    altin_suslu: p => { RESSAM.cilali_tas(p); const g = hex('#e8b830'); for (let i = 1; i < 15; i++) { p.set(i, 1, g); p.set(i, 14, g); p.set(1, i, g); p.set(14, i, g); } for (const [x, y] of [[7, 4], [8, 4], [4, 7], [4, 8], [11, 7], [11, 8], [7, 11], [8, 11], [7, 7], [8, 8], [7, 8], [8, 7]]) p.set(x, y, g); },
    kasa_yan: p => { kalas(p, '#b08850'); const k = hex('#6a4a26'); for (let i = 0; i < D; i++) { p.set(i, 0, k); p.set(i, 15, k); p.set(0, i, k); p.set(15, i, k); p.set(i, i, karis(k, 1.2)); } for (const [x, y] of [[1, 1], [14, 1], [1, 14], [14, 14]]) p.set(x, y, [60, 60, 66]); },
    kasa_ust: p => { kalas(p, '#b08850'); K(p, '#6a4a26'); for (let x = 0; x < D; x++) p.set(x, 7, [106, 74, 38]); },
    ayna: p => { for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { const t = (x + y) / 30; p.set(x, y, [176 + t * 50, 196 + t * 40, 214 + t * 30]); } for (let i = 0; i < 6; i++) { p.set(3 + i, 2 + i, [250, 252, 255]); p.set(4 + i, 2 + i, [236, 242, 250]); p.set(9 + i, 7 + i, [236, 242, 250]); } },
    teleskop_govde: p => { metal(p, '#1e3a6a', 0.05); for (let x = 0; x < D; x++) { p.set(x, 0, [200, 160, 64]); p.set(x, 15, [200, 160, 64]); } },
    kitap_sayfa: p => { p.doldur('#efe8d4', 0.02); for (let y = 1; y < D; y += 2) for (let x = 0; x < D; x++) p.set(x, y, [214, 206, 186]); },
    daktilo_tus: p => { p.doldur('#1c1c20', 0.04); for (let y = 1; y < D; y += 4) for (let x = 1 + (y % 8 === 1 ? 0 : 1); x < D; x += 3) { p.set(x, y, [230, 226, 214]); p.set(x + 1, y, [210, 206, 194]); p.set(x, y + 1, [190, 186, 176]); } },
    kure: p => { p.doldur('#2a6ab8', 0.05); const L = [[2, 3, 5, 3], [3, 6, 4, 4], [9, 2, 4, 3], [10, 6, 5, 5], [5, 11, 4, 3], [12, 12, 3, 2]]; for (const [x0, y0, w, h] of L) for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (p.r() < 0.85) p.set(x, y, karis([70, 150, 60], 0.9 + p.r() * 0.2)); },
    kaktus: p => { p.doldur('#3a8a3a', 0.06); for (let x = 1; x < D; x += 4) for (let y = 0; y < D; y++) p.set(x, y, [44, 110, 44]); for (let y = 1; y < D; y += 3) for (let x = 3; x < D; x += 4) p.set(x, y, [236, 232, 200]); },
    monstera: p => { p.doldur('#2a7a32', 0.06); for (let y = 0; y < D; y++) p.set(8, y, [70, 140, 70]); for (let i = 0; i < 5; i++) { const y = 2 + i * 3; for (let x = 2; x < 6; x++) p.set(x, y, [20, 50, 24]); for (let x = 11; x < 15; x++) p.set(x, y + 1, [20, 50, 24]); } },
    paspas: p => { p.doldur('#8a6a3a', 0.08); for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) if ((x + y) % 3 === 0) p.set(x, y, [110, 84, 46]); K(p, '#4a3a22'); },
    varil_yan: p => { metal(p, '#2a5aa8', 0.05); for (let x = 0; x < D; x++) for (const y of [0, 15]) p.set(x, y, [20, 50, 100]); nk(p, 6, '#8a5a3a'); },
    varil_ust: p => { metal(p, '#2a5aa8', 0.04); for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) if (Math.abs(Math.hypot(x - 7.5, y - 7.5) - 6.5) < 0.6) p.set(x, y, [24, 60, 120]); p.set(4, 4, [180, 180, 190]); p.set(5, 4, [140, 140, 150]); },
    posta_kirmizi: p => { metal(p, '#c82a2a', 0.04); },
    posta_on: p => { metal(p, '#c82a2a', 0.04); dikd(p, 4, 6, 11, 7, '#2a1010'); for (let x = 5; x < 11; x++) p.set(x, 10, [240, 210, 120]); },
    ten: p => { p.doldur('#f0c8a0', 0.03); },
    kor_yatak: p => { for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { const k = p.r(); p.set(x, y, k < 0.4 ? [255, 140, 40] : k < 0.7 ? [200, 60, 20] : k < 0.9 ? [80, 30, 20] : [255, 220, 120]); } },
    izgara: p => { for (let i = 0; i < D * D * 4; i++) p.d[i] = 0; for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) if (x % 3 === 0 || y === 0 || y === 15) p.set(x, y, [60, 60, 66]); },
    kebap_sis: p => { p.doldur('#8a3a1c', 0.1); for (let x = 0; x < D; x += 4) for (let y = 0; y < D; y++) p.set(x, y, [200, 150, 60]); nk(p, 10, '#4a8a2a'); },
    tabela_on: p => { kalas(p, '#b48a52'); const k = hex('#4a2c14'); for (let x = 3; x < 12; x++) { p.set(x, 7, k); p.set(x, 8, k); } for (let i = 0; i < 4; i++) { p.set(11 + i, 7 - i, k); p.set(11 + i, 8 + i, k); } },
    tas_kesme_yan: p => { RESSAM.kesme_tas(p); for (let x = 0; x < D; x++) p.set(x, 2, [60, 60, 64]); },
    tas_kesme_ust: p => { RESSAM.cilali_tas(p); for (let y = 2; y < 14; y++) p.set(8, y, [40, 40, 44]); K(p, '#5a5a5e'); }
  });
}
/* 0.36.1: iki bloklu yatak dokuları */
Object.assign(RESSAM, {
  yatak_ahsap: p => { kalas(p, '#6e4626'); const k = hex('#4a2c16'); for (let x = 0; x < D; x++) { p.set(x, 0, karis(k, 1.1)); p.set(x, 15, k); } for (let i = 0; i < 6; i++) p.set(Math.floor(p.r() * 16), 2 + Math.floor(p.r() * 12), karis(k, 0.9)); },
  yatak_yorgan: p => { p.doldur('#b02a26', 0.05); const k = hex('#841c1a'), a = hex('#cc4038');
    for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { const u = (x + y) % 8, v = (x - y + 16) % 8; if (u === 0 || v === 0) p.set(x, y, karis(k, 0.95 + p.r() * 0.1)); else if (u === 1 || v === 1) p.set(x, y, karis(a, 0.95 + p.r() * 0.08)); }
    for (let y = 0; y < D; y += 8) for (let x = 0; x < D; x += 8) p.set(x + 4, y + 4, [236, 204, 120]); },
  yatak_carsaf: p => { p.doldur('#efece4', 0.025); const k = hex('#d6d2c6'); for (let y = 2; y < D; y += 5) for (let x = 0; x < D; x++) if (p.r() < 0.55) p.set(x, y + (x % 6 < 3 ? 0 : 1), karis(k, 0.97 + p.r() * 0.05)); },
  yatak_yastik: p => { p.doldur('#f6f3ec', 0.02); const k = hex('#d8d2c2'); for (let i = 0; i < D; i++) { p.set(i, 0, k); p.set(i, 15, k); p.set(0, i, k); p.set(15, i, k); }
    for (let y = 2; y < 14; y++) for (let x = 2; x < 14; x++) { const d = Math.hypot((x - 7.5) / 6, (y - 7.5) / 6); if (d > 0.75) p.set(x, y, karis(hex('#e8e3d6'), 1 - (d - 0.75) * 0.3)); } },
  yatak_dosek: p => { p.doldur('#f0eee6', 0.03); const m = hex('#6a86b8'); for (let x = 1; x < D; x += 4) for (let y = 0; y < D; y++) p.set(x, y, karis(m, 0.92 + p.r() * 0.1)); const k = hex('#c8c4b8'); for (let x = 0; x < D; x++) { p.set(x, 0, k); p.set(x, 15, k); } }
});
/* 0.36.0: mutfak dokuları */
{
  const C = (p, c) => { const k = hex(c); for (let i = 0; i < D; i++) { p.set(i, 0, k); p.set(i, 15, k); p.set(0, i, k); p.set(15, i, k); } };
  const nokta = (p, n, c, x0 = 0, y0 = 0, w = 16, h = 16) => { const k = hex(c); for (let i = 0; i < n; i++) p.set(x0 + Math.floor(p.r() * w), y0 + Math.floor(p.r() * h), karis(k, 0.8 + p.r() * 0.4)); };
  Object.assign(RESSAM, {
    degirmen_ust: p => { RESSAM.tas(p); for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { const d = Math.hypot(x - 7.5, y - 7.5); if (d < 2) p.set(x, y, [70, 60, 50]); else if (Math.abs(Math.atan2(y - 7.5, x - 7.5) * 3 % 1) < 0.08) p.set(x, y, [95, 95, 95]); } },
    degirmen_yan: p => { RESSAM.tas(p); const k = hex('#6a6a6a'); for (let x = 0; x < D; x++) { p.set(x, 7, k); p.set(x, 8, karis(k, 0.8)); } },
    tezgah_ust: p => { p.doldur('#d8d4c8', 0.04); nokta(p, 18, '#a8a49a'); C(p, '#8a867c'); },
    tezgah_on: p => { RESSAM.dolap_yan(p); const k = hex('#4a321c'); for (let x = 1; x < 15; x++) p.set(x, 5, k); cizgi(p, 3, 9, 6, 9, [210, 190, 120]); cizgi(p, 10, 9, 13, 9, [210, 190, 120]); for (let y = 6; y < 15; y++) p.set(8, y, k); },
    kiler_on: p => { RESSAM.dolap_yan(p); const k = hex('#4a321c'); for (let y = 1; y < 15; y++) p.set(8, y, k); for (let y = 3; y < 13; y += 3) for (let x = 2; x < 14; x++) if (x !== 8) p.set(x, y, karis(hex('#5a3e22'), 1)); p.set(6, 8, [210, 190, 120]); p.set(10, 8, [210, 190, 120]); },
    fici_yan: p => { kalas(p, '#8a5a2e'); const k = hex('#5a5a60'); for (let x = 0; x < D; x++) { p.set(x, 2, k); p.set(x, 3, karis(k, 0.8)); p.set(x, 12, k); p.set(x, 13, karis(k, 0.8)); } },
    fici_ust: p => { p.doldur('#9a6a3a', 0.06); for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { const d = Math.hypot(x - 7.5, y - 7.5); if (d > 6.2) p.set(x, y, [90, 90, 96]); } for (let y = 2; y < 14; y += 4) cizgi(p, 2, y, 13, y, [120, 80, 40]); },
    pasta_ust: p => { p.doldur('#f6ecec', 0.04); for (const [x, y] of [[3, 3], [11, 4], [7, 8], [4, 12], [12, 11]]) { p.set(x, y, [210, 40, 50]); p.set(x + 1, y, [230, 60, 70]); p.set(x, y + 1, [180, 30, 40]); } },
    pasta_yan: p => { p.doldur('#e8c890', 0.05); for (let x = 0; x < D; x++) { for (let y = 0; y < 4; y++) p.set(x, y, karis([246, 236, 236], 0.95 + p.r() * 0.05)); p.set(x, 8, [240, 230, 225]); p.set(x, 9, [220, 70, 80]); } },
    pasta_ic: p => { p.doldur('#e8c890', 0.05); for (let x = 0; x < D; x++) { p.set(x, 8, [240, 230, 225]); p.set(x, 9, [220, 70, 80]); } },
    cuval_un: p => { p.doldur('#e0d0a8', 0.06); for (let y = 1; y < D; y += 3) for (let x = 0; x < D; x++) if ((x + y) % 4 === 0) p.set(x, y, [190, 170, 130]); for (let y = 0; y < 4; y++) for (let x = 0; x < D; x++) p.set(x, y, karis([246, 242, 232], 0.95 + p.r() * 0.05)); },
    cuval_tuz: p => { p.doldur('#e0d0a8', 0.06); for (let y = 1; y < D; y += 3) for (let x = 0; x < D; x++) if ((x + y) % 4 === 0) p.set(x, y, [190, 170, 130]); for (let y = 0; y < 4; y++) for (let x = 0; x < D; x++) p.set(x, y, karis([232, 240, 246], 0.92 + p.r() * 0.08)); },
    semaver: p => { p.doldur('#c8883a', 0.1); for (let x = 0; x < D; x++) { p.set(x, 4, [150, 90, 30]); p.set(x, 11, [150, 90, 30]); } for (let y = 0; y < D; y++) p.set(3, y, [240, 190, 110]); },
    sepet: p => { p.doldur('#b88a4a', 0.05); for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) if (((x >> 1) + (y >> 1)) % 2 === 0) p.set(x, y, karis(hex('#8a6030'), 0.95 + p.r() * 0.1)); },
    tandir: p => { p.doldur('#b8683a', 0.08); for (let y = 2; y < D; y += 4) for (let x = 0; x < D; x++) p.set(x, y, [150, 80, 50]); nokta(p, 12, '#d88a5a'); },
    tabak: p => { p.doldur('#f0eee8', 0.02); for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { const d = Math.hypot(x - 7.5, y - 7.5); if (d > 5.5 && d < 6.5) p.set(x, y, [60, 90, 170]); } },
    feslegen: p => { for (let i = 0; i < 14; i++) { const x = 2 + Math.floor(p.r() * 11), y = 1 + Math.floor(p.r() * 12); p.set(x, y, karis(hex('#3f9a35'), 0.85 + p.r() * 0.3)); p.set(x + 1, y, karis(hex('#5ab84a'), 0.9 + p.r() * 0.2)); p.set(x, y + 1, karis(hex('#2f7a28'), 1)); } },
    sarimsak: p => { for (let i = 0; i < 4; i++) { const cx = 4 + (i % 2) * 7, cy = 3 + (i >> 1) * 7; for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) if (x * x + y * y <= 5) p.set(cx + x, cy + y, karis([238, 232, 218], 0.85 + p.r() * 0.2)); p.set(cx, cy - 3, [170, 150, 110]); } },
    kavanoz: p => { p.doldur('#cfe6f0', 0.03, 200); for (let y = 5; y < D; y++) for (let x = 0; x < D; x++) p.set(x, y, karis(hex(x < 8 ? '#c8301e' : '#7a9a3a'), 0.9 + p.r() * 0.15)); for (let x = 0; x < D; x++) { p.set(x, 0, [168, 116, 46]); p.set(x, 1, [150, 100, 40]); } },
    kavanoz_bal: p => { p.doldur('#cfe6f0', 0.03, 200); for (let y = 4; y < D; y++) for (let x = 0; x < D; x++) p.set(x, y, karis(hex('#e8a020'), 0.85 + p.r() * 0.2)); for (let x = 0; x < D; x++) { p.set(x, 0, [200, 60, 50]); p.set(x, 1, [230, 230, 220]); } },
    baharat: p => { const R = ['#c8301e', '#e8b020', '#5a8a2a', '#8a4a2a']; for (let i = 0; i < 4; i++) for (let y = 3; y < 14; y++) for (let x = i * 4; x < i * 4 + 3; x++) p.set(x, y, karis(hex(y < 5 ? '#a8742e' : R[i]), 0.9 + p.r() * 0.15)); }
  });
}

/* ---------- 0.41.0: yeni dünya üreticisinin doğa dokuları ---------- */
function caliDoku(p, taban, koyu, acik, dal) {
  const t = hex(taban), k = hex(koyu), a = hex(acik), d = hex(dal);
  /* Koyu iç gölge üstüne yuvarlak yaprak kümeleri; kümelerin sol üstü ışık alır; kenarlarda küçük boşluklar */
  for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) p.set(x, y, karis(k, 0.8 + p.r() * 0.3));
  for (let i = 0; i < 16; i++) {
    const cx = p.r() * 16, cy = p.r() * 16, r = 1.6 + p.r() * 1.6;
    for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) {
      const dx = x - cx, dy = y - cy, q = (dx * dx + dy * dy) / (r * r);
      if (q > 1) continue;
      p.set((x + 16) % 16, (y + 16) % 16, karis(dx + dy < -r * 0.5 ? a : t, 0.88 + p.r() * 0.24));
    }
  }
  for (let i = 0; i < 2; i++) { let x = 3 + Math.floor(p.r() * 10), y = 15; for (let n = 0; n < 4; n++) { p.set(x, y, karis(d, 0.9 + p.r() * 0.2)); y--; if (p.r() < 0.4) x += p.r() < 0.5 ? -1 : 1; } }
  for (let i = 0; i < 18; i++) p.set(Math.floor(p.r() * 16), Math.floor(p.r() * 16), [0, 0, 0], 0);
}
function benekliCicek(p, sap, renk, orta, noktalar) {
  bitki(p, p => { const g = hex(sap); cizgi(p, 8, 15, 8, 8, g); p.set(7, 12, g); p.set(9, 11, g); p.set(6, 13, g);
    const c = hex(renk); for (const [x, y] of noktalar) p.set(x, y, karis(c, 0.85 + p.r() * 0.3)); if (orta) p.set(8, 6, hex(orta)); });
}
Object.assign(RESSAM, {
  kizil_kum: p => { p.doldur('#b9643a', 0.07); p.lekeler('#a05230', 18, 1); p.lekeler('#cf7a4a', 12, 1); },
  miselyum_ust: p => { p.doldur('#7d6a78', 0.12); p.lekeler('#665562', 22, 1); p.lekeler('#9a8a96', 14, 1); p.lekeler('#b8aab4', 6, 1); },
  miselyum_yan: p => { RESSAM.toprak(p); const g = hex('#7d6a78'); for (let x = 0; x < D; x++) { const h = 2 + Math.floor(p.r() * 2.5); for (let y = 0; y < h; y++) p.set(x, y, karis(g, 0.82 + p.r() * 0.3)); } },
  yaprak_kizil: p => { yaprak(p, '#a8321e'); serpis(p, ['#c84a24', '#7e2414', '#d86a2a'], 30); },
  yaprak_turuncu: p => { yaprak(p, '#d0742a'); serpis(p, ['#e8963a', '#a8521c', '#c8b040'], 30); },
  yaprak_sari: p => { yaprak(p, '#d8b434'); serpis(p, ['#ecd056', '#b08a22', '#c8a030'], 30); },
  mangrov_yan: p => kabuk(p, '#6a3e2c', '#4c2a1e'),
  mangrov_ust: p => halka(p, '#5a3426', '#a8603e', '#8a4a30'),
  mangrov_yaprak: p => { yaprak(p, '#4f7a2a', 0.2); serpis(p, ['#3e6620', '#6a9038'], 24); },
  mangrov_kok: p => { for (let i = 0; i < D * D * 4; i++) p.d[i] = 0; const c = hex('#6a3e2c'), k = hex('#4c2a1e');
    for (const x0 of [1, 6, 11]) { let x = x0; for (let y = 0; y < D; y++) { p.set(x, y, karis(c, 0.85 + p.r() * 0.25)); p.set(x + 1, y, karis(k, 0.9 + p.r() * 0.2)); if (p.r() < 0.3) x = Math.max(0, Math.min(13, x + (p.r() < 0.5 ? -1 : 1))); } }
    for (const y0 of [3, 9, 14]) for (let x = 0; x < D; x++) if (p.r() < 0.75) p.set(x, y0 + (p.r() < 0.3 ? 1 : 0), karis(c, 0.8 + p.r() * 0.2)); },
  mantar_kirmizi_blok: p => { p.doldur('#b8261e', 0.1); for (let i = 0; i < 6; i++) { const x = Math.floor(p.r() * 14), y = Math.floor(p.r() * 14), w = 1 + Math.floor(p.r() * 2); for (let a = 0; a <= w; a++) for (let b = 0; b <= w; b++) p.set(x + a, y + b, karis(hex('#efe6d8'), 0.92 + p.r() * 0.1)); } },
  mantar_kahve_blok: p => { p.doldur('#8a6446', 0.08); p.lekeler('#74523a', 20, 1); p.lekeler('#9e7656', 12, 1); },
  mantar_sap: p => { p.doldur('#e4dccb', 0.05); const c = hex('#cfc6b2'); for (let x = 0; x < D; x++) if (p.r() < 0.35) for (let y = 0; y < D; y++) if (p.r() < 0.6) p.set(x, y, karis(c, 0.95 + p.r() * 0.1)); },
  mantar_ic: p => { p.doldur('#d8cdb6', 0.05); p.lekeler('#c4b89e', 14, 1); },
  kirmizi_mantar: p => bitki(p, p => { const s = hex('#ece2cc'); cizgi(p, 7, 15, 7, 10, s); cizgi(p, 8, 15, 8, 10, karis(s, 0.9)); const c = hex('#c8261e');
    for (let y = 5; y < 10; y++) for (let x = 3; x < 13; x++) { const d = ((x - 7.5) / 5) ** 2 + ((y - 9.5) / 4.4) ** 2; if (d < 1) p.set(x, y, karis(c, 0.85 + p.r() * 0.3)); }
    for (const [x, y] of [[5, 7], [8, 6], [10, 8], [7, 8]]) p.set(x, y, [240, 236, 226]); }),
  papatya: p => benekliCicek(p, '#3f8a2d', '#f4f2ec', '#e8c22a', [[8, 4], [7, 5], [9, 5], [6, 6], [10, 6], [7, 7], [9, 7], [8, 8], [6, 5], [10, 5], [6, 7], [10, 7]]),
  lale: p => benekliCicek(p, '#3f8a2d', '#d8302a', null, [[7, 4], [9, 4], [7, 5], [8, 5], [9, 5], [7, 6], [8, 6], [9, 6], [8, 7], [6, 3], [10, 3], [8, 4]]),
  lavanta: p => bitki(p, p => { const g = hex('#5a8a46'), c = hex('#9a72d0'); for (const x0 of [4, 8, 11]) { const ust = 2 + Math.floor(p.r() * 4); cizgi(p, x0, 15, x0, ust + 4, g); for (let y = ust; y < ust + 5; y++) { p.set(x0, y, karis(c, 0.8 + p.r() * 0.35)); if (p.r() < 0.5) p.set(x0 + (p.r() < 0.5 ? -1 : 1), y, karis(c, 0.75 + p.r() * 0.3)); } } }),
  /* 0.41.6: çalı dokuları: sık yaprak, gölgeli iç, yer yer dal ve küçük boşluklar */
  cali_yesil: p => caliDoku(p, '#3f7a2a', '#2c5a1c', '#5c9a3c', '#5a3a20'),
  cali_ladin: p => caliDoku(p, '#2f5a36', '#1f4226', '#46784c', '#4a3220'),
  cali_savan: p => caliDoku(p, '#7a8a32', '#5a6824', '#9aa84a', '#6a4a2a'),
  cali_sonbahar: p => caliDoku(p, '#b8621e', '#8a3e14', '#d8902e', '#5a3a20'),
  saz: p => bitki(p, p => { const g = hex('#6a9a3e'), k = hex('#5a3a22'); for (const x0 of [3, 7, 12]) { const ust = Math.floor(p.r() * 3); cizgi(p, x0, 15, x0 + (x0 > 8 ? 1 : 0), ust, g); }
    for (const [x0, y0] of [[7, 3], [3, 5]]) for (let y = y0; y < y0 + 4; y++) { p.set(x0, y, karis(k, 0.9 + p.r() * 0.2)); p.set(x0 + 1, y, karis(k, 0.8)); }
    for (const [x, y] of [[5, 9], [6, 8], [10, 7], [11, 6], [2, 10], [13, 9]]) p.set(x, y, karis(g, 1.1)); })
});

/* ---------- Atlas ---------- */
let ATLAS = null;
const DOSEME = [];
export function atlas() {
  if (ATLAS) return ATLAS;
  const cv = document.createElement('canvas');
  cv.width = cv.height = ATLAS_N * 16;
  const ctx = cv.getContext('2d');
  DOKULAR.forEach((ad, i) => {
    const p = new Piksel(1000 + i * 31);
    (RESSAM[ad] || (q => q.doldur('#ff00ff')))(p);
    const t = p.tuval();
    DOSEME[i] = t;
    ctx.drawImage(t, (i % ATLAS_N) * 16, ((i / ATLAS_N) | 0) * 16);
  });
  ATLAS = cv;
  return cv;
}
export const doseme = i => (atlas(), DOSEME[i]);

/* 0.23.0: hareketli dokular: kamp ateşi ve meşale alevi saniyede 8 kare titrer, lav ve magma yavaşça akar.
   Kareler atlasın ilgili döşemesine yeniden çizilir; çizildiyse true döner (doku yeniden yüklenmeli). */
const h1 = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
const ALEV = ['#fff1a8', '#ffd24a', '#ff9a1f', '#e8541a'];
const CANLI = {
  kamp_atesi: (p, k) => bitki(p, p => {
    const o = hex('#6b4a28'), kk = hex('#3a2a18');
    for (let x = 2; x < 14; x++) {
      const m = 1 - Math.abs(x - 7.5) / 6.5, h = Math.round(1.5 + m * 9 + Math.sin(k * 1.9 + x * 1.3) * 1.4 + (h1(x, k) - 0.5) * 2.2);
      for (let y = 12; y > 12 - h && y >= 1; y--) {
        const rel = (12 - y) / Math.max(1, h);
        if (rel > 0.7 && h1(x * 7 + y, k) < 0.35) continue;
        p.set(x, y, hex(ALEV[Math.min(3, Math.floor((rel * 0.85 + (1 - m) * 0.7) * 2.4))]));
      }
    }
    for (let i = 0; i < 2; i++) if (h1(i * 13, k) < 0.7) p.set(4 + Math.floor(h1(i * 29, k) * 8), Math.floor(h1(i * 31, k + 1) * 5), hex('#ffd24a'));
    for (let x = 1; x < 15; x++) { p.set(x, 14, karis(o, 1.05)); p.set(x, 15, kk); }
    cizgi(p, 2, 12, 13, 15, o); cizgi(p, 2, 15, 13, 12, karis(o, 0.85));
  }),
  mesale: (p, k) => bitki(p, p => {
    const c = hex('#7b5a32');
    for (let y = 6; y < 16; y++) { p.set(7, y, karis(c, 1.05)); p.set(8, y, karis(c, 0.8)); }
    const h = 3 + Math.floor(h1(3, k) * 2.6);
    for (let i = 0; i < h; i++) { const y = 5 - i, rel = i / h; for (const x of [7, 8]) if (!(rel > 0.6 && h1(x + i, k) < 0.4)) p.set(x, y, hex(ALEV[Math.min(3, Math.floor((1 - rel) * 1.2 + (x === 8 ? 0.8 : 0) + h1(x * 5 + i, k) * 0.8))].replace('#e8541a', '#ffe680'))); }
    if (h1(9, k) < 0.5) p.set(h1(11, k) < 0.5 ? 6 : 9, 4 - Math.floor(h1(5, k) * 2), hex('#ffcf4a'));
  }),
  lav: (p, k) => { RESSAM.lav(p); kaydir(p, Math.floor(k / 4) % 16, Math.floor(k / 8) % 16); },
  /* 0.39.0: magma bloğu artık titreşmez (sabit doku) */
};
function kaydir(p, dx, dy) { const e = p.d.slice(); for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { const a = (y * D + x) * 4, b = (((y + dy) % D) * D + (x + dx) % D) * 4; p.d[b] = e[a]; p.d[b + 1] = e[a + 1]; p.d[b + 2] = e[a + 2]; p.d[b + 3] = e[a + 3]; } }
let sonKare = -1;
export function canliDokular(t) {
  const kare = Math.floor(t * 8);
  if (kare === sonKare) return false;
  sonKare = kare;
  const ctx = atlas().getContext('2d');
  for (const [ad, f] of Object.entries(CANLI)) {
    const i = DOKULAR.indexOf(ad); if (i < 0) continue;
    const p = new Piksel(1000 + i * 31); f(p, kare);
    ctx.clearRect((i % ATLAS_N) * 16, ((i / ATLAS_N) | 0) * 16, 16, 16);
    ctx.drawImage(p.tuval(), (i % ATLAS_N) * 16, ((i / ATLAS_N) | 0) * 16);
  }
  return true;
}

/* ---------- 0.18.0: Mevsim dokuları ----------
   Çimen, yaprak ve otların renkleri mevsime göre yeniden boyanır (0 ilkbahar, 1 yaz: özgün dokular, 2 sonbahar, 3 kış).
   İlkbaharda meşe ve huş yapraklarında çiçekler, sonbaharda kızıl ve sarı yapraklar, kışın seyrek ve solgun yapraklar görülür. */
const serpis = (p, renkler, adet) => { for (let i = 0; i < adet; i++) { const x = Math.floor(p.r() * D), y = Math.floor(p.r() * D); if (p.al(x, y)[3] > 0) p.set(x, y, karis(hex(renkler[i % renkler.length]), 0.9 + p.r() * 0.2)); } };
const cimUst = (taban, koyu, acik) => p => { p.doldur(taban, 0.14); p.lekeler(koyu, 20, 1); p.lekeler(acik, 12, 1); };
const cimYan = renk => p => { RESSAM.toprak(p); const g = hex(renk); for (let x = 0; x < D; x++) { const h = 3 + Math.floor(p.r() * 2.2); for (let y = 0; y < h; y++) p.set(x, y, karis(g, 0.82 + p.r() * 0.35)); } };
const ot = renk => p => bitki(p, p => { const c = hex(renk); for (let i = 0; i < 9; i++) { let x = 2 + Math.floor(p.r() * 12); const h = 6 + Math.floor(p.r() * 9); for (let y = 15; y > 15 - h; y--) { p.set(x, y, karis(c, 0.75 + p.r() * 0.45)); if (p.r() < 0.25) x += p.r() < 0.5 ? -1 : 1; } } });
const MEVSIM_RESSAM = {
  cimen_ust: [cimUst('#66b040', '#55a034', '#7cc252'), null, cimUst('#8c9a40', '#7a8834', '#a8a84c'), cimUst('#7e8e6c', '#6c7c5c', '#929e80')],
  cimen_yan: [cimYan('#66b040'), null, cimYan('#8c9a40'), cimYan('#7e8e6c')],
  mese_yaprak: [p => { yaprak(p, '#4a9a32'); serpis(p, ['#f4b8d0', '#ffffff', '#f09ab8'], 14); }, null, p => { yaprak(p, '#c0702a'); serpis(p, ['#a8401e', '#d8a030', '#8a3016'], 40); }, p => yaprak(p, '#6a5e40', 0.42)],
  hus_yaprak: [p => { yaprak(p, '#7fb446'); serpis(p, ['#ffffff', '#f6f0d0'], 12); }, null, p => { yaprak(p, '#d8b03a'); serpis(p, ['#e8c84a', '#b88a26'], 30); }, p => yaprak(p, '#8a8456', 0.45)],
  uzun_ot: [ot('#62ae3c'), null, ot('#a89a4a'), ot('#9a9274')]
};
let SON_MEVSIM = 1;
export function mevsimDokulari(m) {
  if (m === SON_MEVSIM) return false;
  SON_MEVSIM = m;
  const cv = atlas(), ctx = cv.getContext('2d');
  for (const [ad, l] of Object.entries(MEVSIM_RESSAM)) {
    const i = T[ad];
    if (i == null) continue;
    const p = new Piksel(1000 + i * 31);
    (l[m] || RESSAM[ad])(p);
    const t = p.tuval();
    DOSEME[i] = t;
    ctx.clearRect((i % ATLAS_N) * 16, ((i / ATLAS_N) | 0) * 16, 16, 16);
    ctx.drawImage(t, (i % ATLAS_N) * 16, ((i / ATLAS_N) | 0) * 16);
  }
  return true;
}

/* Blok parçacıkları için ortalama renk */
const ORT = {};
export function blokRengi(id) {
  if (ORT[id]) return ORT[id];
  const t = doseme(YUZ_DOKU[id * 6]);
  const d = t.veri;
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 128) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
  return (ORT[id] = n ? [r / n / 255, g / n / 255, b / n / 255] : [0.5, 0.5, 0.5]);
}

/* ---------- Kırılma çatlakları (8 aşama) ---------- */
export function catlaklar() {
  const out = [];
  const r = uretec(4242);
  const yollar = [];
  for (let i = 0; i < 10; i++) {
    let x = 8, y = 8; const yol = [];
    const a = r() * Math.PI * 2;
    for (let k = 0; k < 10; k++) { x += Math.cos(a + (r() - 0.5) * 1.6) * 1.1; y += Math.sin(a + (r() - 0.5) * 1.6) * 1.1; yol.push([Math.round(x), Math.round(y)]); }
    yollar.push(yol);
  }
  for (let s = 0; s < 8; s++) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 16;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = 'rgba(20,20,20,0.85)';
    const uz = 2 + s * 1.2, adet = 3 + s;
    for (let i = 0; i < adet && i < yollar.length; i++) for (let k = 0; k < uz && k < yollar[i].length; k++) { const [x, y] = yollar[i][k]; if (x >= 0 && x < 16 && y >= 0 && y < 16) ctx.fillRect(x, y, 1, 1); }
    out.push(cv);
  }
  return out;
}

/* ---------- Eşya simgeleri (32 x 32) ---------- */
const SIMGE = {};
const S = 32;
function izometrik(id) {
  const cv = document.createElement('canvas'); cv.width = cv.height = S;
  const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
  const f = (t, k) => { const c = document.createElement('canvas'); c.width = c.height = 16; const x = c.getContext('2d'); x.drawImage(doseme(t), 0, 0); if (k < 1) { x.globalCompositeOperation = 'source-atop'; x.fillStyle = `rgba(0,0,0,${1 - k})`; x.fillRect(0, 0, 16, 16); } return c; };
  const ust = YUZ_DOKU[id * 6 + 2], sol = YUZ_DOKU[id * 6 + 4], sag = YUZ_DOKU[id * 6 + 0];
  const a = 14 / 16, b = 7 / 16;
  ctx.setTransform(a, -b, a, b, 2, 9); ctx.drawImage(f(ust, 1), 0, 0);
  ctx.setTransform(a, b, 0, a, 2, 9); ctx.drawImage(f(sol, 0.82), 0, 0);
  ctx.setTransform(a, -b, 0, a, 16, 16); ctx.drawImage(f(sag, 0.64), 0, 0);
  return cv;
}
function duz(t) {
  const cv = document.createElement('canvas'); cv.width = cv.height = S;
  const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false; ctx.drawImage(doseme(t), 0, 0, S, S);
  return cv;
}

/* 16 x 16 piksel çizim: doldurulan noktaların çevresine otomatik koyu kenar */
function pikselSimge(ciz) {
  const p = new Piksel(7); for (let i = 0; i < p.d.length; i++) p.d[i] = 0;
  ciz(p);
  const kenar = [];
  for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) {
    if (p.al(x, y)[3]) continue;
    const dolu = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const X = x + dx, Y = y + dy; return X >= 0 && Y >= 0 && X < D && Y < D && p.al(X, Y)[3] > 200; });
    if (dolu) kenar.push([x, y]);
  }
  for (const [x, y] of kenar) p.set(x, y, [25, 20, 18], 230);
  const cv = document.createElement('canvas'); cv.width = cv.height = S;
  const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false; ctx.drawImage(p.tuval(), 0, 0, S, S);
  return cv;
}
function cokgen(p, noktalar, renk, golge = 0.12) {
  const c = hex(renk);
  for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) {
    let ic = false; const px = x + 0.5, py = y + 0.5;
    for (let i = 0, j = noktalar.length - 1; i < noktalar.length; j = i++) {
      const [xi, yi] = noktalar[i], [xj, yj] = noktalar[j];
      if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) ic = !ic;
    }
    if (ic) p.set(x, y, karis(c, 1 + (p.r() * 2 - 1) * golge));
  }
}
function kalinCizgi(p, pts, renk, isik) {
  const c = hex(renk);
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    cizgi(p, x0, y0, x1, y1, c); cizgi(p, x0 + 1, y0, x1 + 1, y1, karis(c, 0.8));
    if (isik) cizgi(p, x0, y0 - 1, x1, y1 - 1, karis(c, 1.2));
  }
}
const SAP = '#7b5a32';
const ALET_CIZ = {
  tirpan: (p, r) => { kalinCizgi(p, [[4, 15], [10, 3]], SAP); kalinCizgi(p, [[10, 3], [6, 2], [2, 3], [1, 5]], r, true); cizgi(p, 7, 9, 5, 8, [110, 80, 50]); },   // 0.34.0
  kazma: (p, r) => { kalinCizgi(p, [[2, 14], [10, 6]], SAP); kalinCizgi(p, [[5, 3], [8, 2], [11, 3], [13, 5], [14, 8], [13, 11]], r, true); },
  balta: (p, r) => { kalinCizgi(p, [[2, 14], [11, 5]], SAP); cokgen(p, [[7, 6], [5, 3], [6, 1], [9, 0], [11, 2], [12, 4], [10, 6], [9, 7]], r); },
  kurek: (p, r) => { kalinCizgi(p, [[2, 14], [9, 7]], SAP); cokgen(p, [[8, 6], [9, 3], [12, 1], [14, 2], [14, 5], [12, 8], [10, 8]], r); },
  capa: (p, r) => { kalinCizgi(p, [[2, 14], [11, 5]], SAP); cokgen(p, [[8, 4], [10, 2], [14, 3], [13, 6], [11, 5]], r); },
  makas: p => MAL_CIZ.makas()(p),   // 0.21.0
  tilsim: p => MAL_CIZ.tilsim()(p),   // 0.22.0
  kilic: (p, r) => { kalinCizgi(p, [[4, 11], [13, 2]], r, true); kalinCizgi(p, [[1, 14], [4, 11]], SAP); kalinCizgi(p, [[3, 8], [7, 12]], '#5a4a3a'); },
  /* 0.37.0: yeni silahlar */
  hancer: (p, r) => { kalinCizgi(p, [[7, 9], [13, 3]], r, true); kalinCizgi(p, [[3, 13], [6, 10]], SAP); kalinCizgi(p, [[4, 8], [8, 12]], '#c8a040'); p.set(2, 14, [200, 160, 64]); },
  mizrak: (p, r) => { kalinCizgi(p, [[1, 15], [11, 5]], SAP); cokgen(p, [[10, 4], [13, 1], [15, 0], [14, 3], [12, 6]], r); kalinCizgi(p, [[9, 5], [11, 7]], '#c8a040'); },
  cekic: (p, r) => { kalinCizgi(p, [[2, 14], [9, 7]], SAP); cokgen(p, [[6, 5], [10, 1], [15, 6], [11, 10]], r); cizgi(p, 7, 5, 11, 9, karis(hex(r), 0.7)); cizgi(p, 10, 2, 14, 6, karis(hex(r), 1.2)); }
};
const MAL_CIZ = {
  cubuk: () => p => kalinCizgi(p, [[3, 13], [12, 4]], SAP, true),
  komur: () => p => { cokgen(p, [[4, 5], [8, 3], [12, 5], [13, 10], [9, 13], [4, 12], [3, 8]], '#2a2a2a', 0.25); p.set(7, 6, [110, 110, 110]); p.set(10, 8, [90, 90, 90]); },
  ham: e => p => { cokgen(p, [[4, 6], [7, 3], [11, 4], [13, 8], [11, 12], [6, 13], [3, 10]], e.renk, 0.2); for (let i = 0; i < 5; i++) p.set(5 + Math.floor(p.r() * 7), 5 + Math.floor(p.r() * 7), karis(hex(e.renk), 0.65)); },
  kulce: e => p => { cokgen(p, [[2, 9], [9, 5], [14, 8], [7, 12]], e.renk, 0.05); cokgen(p, [[2, 9], [7, 12], [7, 14], [2, 11]], '#000', 0); const c = hex(e.renk); cizgi(p, 2, 10, 7, 13, karis(c, 0.7)); cizgi(p, 2, 11, 7, 14, karis(c, 0.6)); cizgi(p, 8, 13, 14, 10, karis(c, 0.55)); cizgi(p, 8, 12, 14, 9, karis(c, 0.62)); cizgi(p, 5, 8, 9, 6, karis(c, 1.25)); },
  elmas: () => p => { cokgen(p, [[8, 2], [13, 6], [8, 14], [3, 6]], '#4fe3d6', 0.1); cizgi(p, 3, 6, 13, 6, [180, 250, 245]); p.set(6, 4, [240, 255, 255]); p.set(7, 4, [240, 255, 255]); },
  bogurtlen: () => p => { const c = hex('#3b1747'); for (const [x, y] of [[6, 7], [9, 7], [5, 10], [8, 10], [11, 10], [7, 13], [10, 13]]) { p.set(x, y, c); p.set(x + 1, y, karis(c, 1.3)); p.set(x, y + 1, karis(c, 0.8)); p.set(x + 1, y + 1, c); } cizgi(p, 8, 6, 9, 3, hex('#3f8a2d')); p.set(10, 3, hex('#4f9a3d')); },
  elma: () => p => { cokgen(p, [[4, 6], [7, 5], [8, 6], [9, 5], [12, 6], [13, 10], [11, 14], [8, 13], [5, 14], [3, 10]], '#d42a24', 0.08); cizgi(p, 8, 5, 8, 3, hex('#5a3d1f')); p.set(9, 3, hex('#3f8a2d')); p.set(10, 2, hex('#3f8a2d')); p.set(5, 8, [250, 150, 140]); },
  lif: () => p => { const c = hex('#6aa84a'); for (let i = 0; i < 4; i++) cizgi(p, 3 + i * 2, 14, 7 + i * 2, 2, karis(c, 0.85 + i * 0.1)); },
  bandaj: () => p => { cokgen(p, [[3, 5], [13, 5], [13, 11], [3, 11]], '#efeae0', 0.04); cizgi(p, 6, 5, 6, 10, hex('#cfc8b8')); cizgi(p, 10, 5, 10, 10, hex('#cfc8b8')); },
  kase: () => p => { cokgen(p, [[2, 7], [14, 7], [12, 12], [4, 12]], '#8a6038', 0.06); cizgi(p, 2, 7, 14, 7, hex('#5a3d1f')); },
  et: e => p => { const c = hex(e.renk); cokgen(p, [[3, 6], [7, 3], [12, 4], [14, 8], [12, 12], [7, 13], [3, 11]], e.renk, 0.1); if (!e.pismis) { cizgi(p, 4, 6, 8, 4, [245, 235, 225]); cizgi(p, 12, 11, 13, 8, [245, 235, 225]); } else { cizgi(p, 6, 6, 10, 10, karis(c, 0.7)); cizgi(p, 9, 5, 12, 8, karis(c, 0.75)); } },
  but: e => p => { cokgen(p, [[2, 4], [6, 2], [10, 5], [10, 9], [7, 11], [3, 9]], e.renk, 0.1); kalinCizgi(p, [[9, 9], [13, 13]], '#efe8da'); p.set(14, 13, [240, 235, 225]); p.set(13, 14, [240, 235, 225]); },
  deri: () => p => cokgen(p, [[3, 3], [7, 4], [12, 2], [13, 7], [12, 13], [8, 12], [3, 13], [4, 8]], '#8a5a32', 0.15),
  tuy: () => p => { cokgen(p, [[11, 2], [13, 4], [8, 11], [5, 12], [4, 10]], '#f2f2ee', 0.06); cizgi(p, 3, 13, 12, 3, hex('#b8b4a8')); },
  ip: () => p => { const c = hex('#e8e0c8'); for (let a = 0; a < 40; a++) { const t = a / 40 * Math.PI * 4, r = 2 + a / 10; p.set(Math.round(8 + Math.cos(t) * r), Math.round(8 + Math.sin(t) * r * 0.8), karis(c, 0.85 + (a % 3) * 0.08)); } },
  cakmak: () => p => { cokgen(p, [[4, 4], [11, 3], [13, 9], [8, 13], [3, 10]], '#3c3c40', 0.15); p.set(8, 6, [130, 130, 140]); p.set(9, 7, [110, 110, 120]); },
  yay: () => p => { const w = hex('#8a6034'); for (let k = 0; k <= 20; k++) { const t = k / 20, x = Math.round(3 + t * 10 + Math.sin(t * Math.PI) * 3.2), y = Math.round(13 - t * 10 + Math.sin(t * Math.PI) * 3.2); p.set(x, y, w); p.set(x + 1, y, karis(w, 0.8)); } cizgi(p, 3, 13, 13, 3, [235, 235, 225]); },
  buzyay: () => p => { const w = hex('#7fc8e8'); for (let k = 0; k <= 20; k++) { const t = k / 20, x = Math.round(3 + t * 10 + Math.sin(t * Math.PI) * 3.2), y = Math.round(13 - t * 10 + Math.sin(t * Math.PI) * 3.2); p.set(x, y, w); p.set(x + 1, y, karis(w, 0.75)); } cizgi(p, 3, 13, 13, 3, [235, 250, 255]); p.set(8, 4, [255, 255, 255]); p.set(12, 9, [255, 255, 255]); },
  ok: e => p => { kalinCizgi(p, [[3, 13], [11, 5]], '#8a6034'); cokgen(p, [[10, 3], [14, 2], [13, 6]], (e && e.renk) || '#4a4a50', 0); cizgi(p, 2, 11, 4, 13, [240, 240, 235]); cizgi(p, 3, 10, 5, 12, [220, 220, 215]); },
  zirh0: e => p => { cokgen(p, [[3, 9], [3, 5], [6, 2], [10, 2], [13, 5], [13, 9], [11, 9], [11, 7], [5, 7], [5, 9]], e.renk, 0.08); },
  zirh1: e => p => { cokgen(p, [[2, 3], [6, 3], [8, 5], [10, 3], [14, 3], [14, 7], [12, 7], [12, 14], [4, 14], [4, 7], [2, 7]], e.renk, 0.08); },
  zirh2: e => p => { cokgen(p, [[4, 2], [12, 2], [12, 14], [9, 14], [8, 6], [7, 14], [4, 14]], e.renk, 0.08); },
  zirh3: e => p => { cokgen(p, [[2, 7], [5, 7], [5, 11], [7, 11], [7, 14], [2, 14]], e.renk, 0.08); cokgen(p, [[9, 7], [12, 7], [12, 11], [14, 11], [14, 14], [9, 14]], e.renk, 0.08); },
  /* 0.33.0: kıyafet simgeleri (biçime göre) */
  kiyafet0: e => p => {
    const k = e.kiyafet.sekil, c = hex(e.renk), d = karis(c, 0.7);
    if (k === 'hasir') { cokgen(p, [[1, 10], [15, 10], [14, 12], [2, 12]], e.renk, 0.05); cokgen(p, [[5, 5], [11, 5], [11, 10], [5, 10]], e.renk, 0.06); cizgi(p, 5, 9, 10, 9, [138, 58, 42]); }
    else if (k === 'kurk') { cokgen(p, [[3, 5], [13, 5], [13, 13], [11, 13], [11, 9], [5, 9], [5, 13], [3, 13]], e.renk, 0.06); cokgen(p, [[3, 4], [13, 4], [13, 6], [3, 6]], '#efe8dc', 0.04); }
    else { cokgen(p, [[3, 12], [3, 8], [5, 5], [11, 5], [13, 8], [13, 12]], e.renk, 0.06); cizgi(p, 3, 11, 12, 11, d); cizgi(p, 3, 12, 12, 12, d); cokgen(p, [[7, 2], [9, 2], [9, 4], [7, 4]], '#f2f2f2', 0.02); }
  },
  kiyafet1: e => p => {
    const k = e.kiyafet.sekil, d = karis(hex(e.renk), 0.7);
    const uzun = k === 'cuppe', kol = k === 'gomlek' ? 6 : 10;
    cokgen(p, [[1, 3], [5, 2], [8, 4], [11, 2], [15, 3], [15, kol], [12, kol], [12, uzun ? 15 : 14], [4, uzun ? 15 : 14], [4, kol], [1, kol]], e.renk, 0.07);
    if (k === 'mont') { cokgen(p, [[4, 2], [12, 2], [11, 4], [5, 4]], '#efe8dc', 0.03); cizgi(p, 8, 5, 8, 13, d); }
    else if (k === 'cuppe') cizgi(p, 4, 9, 11, 9, [184, 68, 42]);
    else if (k === 'kazak') { cizgi(p, 4, 7, 11, 7, karis(hex(e.renk), 1.25)); cizgi(p, 4, 13, 11, 13, d); }
    else cizgi(p, 8, 4, 8, 13, d);
  },
  kiyafet2: e => p => {
    const k = e.kiyafet.sekil, alt = k === 'sort' ? 9 : 15, d = karis(hex(e.renk), 0.7);
    cokgen(p, [[4, 2], [12, 2], [12, alt], [9, alt], [8, 6], [7, alt], [4, alt]], e.renk, 0.07); cizgi(p, 4, 3, 11, 3, d);
    if (k === 'kurkPantolon') { cizgi(p, 4, 14, 6, 14, [239, 232, 220]); cizgi(p, 9, 14, 11, 14, [239, 232, 220]); }
  },
  kiyafet3: e => p => {
    const k = e.kiyafet.sekil, ust = k === 'cizme' ? 4 : k === 'sandalet' ? 11 : 8;
    for (const ox of [0, 7]) {
      cokgen(p, [[2 + ox, ust], [5 + ox, ust], [5 + ox, 11], [8 + ox, 11], [8 + ox, 14], [2 + ox, 14]], e.renk, 0.08);
      if (k === 'cizme') cokgen(p, [[2 + ox, 3], [5 + ox, 3], [5 + ox, 5], [2 + ox, 5]], '#efe8dc', 0.03);
      if (k === 'sandalet') cizgi(p, 2 + ox, 12, 7 + ox, 12, [90, 60, 30]);
    }
  },
  sikke: () => p => { for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const d = Math.hypot(x - 7.5, y - 7.5); if (d < 6) p.set(x, y, d > 4.8 ? [190, 140, 30] : karis([245, 200, 60], 0.95 + p.r() * 0.1)); } cizgi(p, 6, 5, 6, 10, [190, 140, 30]); cizgi(p, 9, 5, 9, 10, [190, 140, 30]); p.set(5, 5, [255, 240, 170]); },
  iksir: e => p => { cokgen(p, [[6, 2], [10, 2], [10, 5], [13, 8], [13, 13], [3, 13], [3, 8], [6, 5]], '#cfe6f0', 0.02); cokgen(p, [[4, 8], [12, 8], [12, 12], [4, 12]], e.renk || '#d8263a', 0.08); cizgi(p, 6, 2, 9, 2, [150, 100, 60]); p.set(5, 9, [255, 180, 190]); },
  altin_elma: () => p => { cokgen(p, [[4, 6], [7, 5], [8, 6], [9, 5], [12, 6], [13, 10], [11, 14], [8, 13], [5, 14], [3, 10]], '#f4c63a', 0.08); cizgi(p, 8, 5, 8, 3, hex('#5a3d1f')); p.set(9, 3, hex('#3f8a2d')); p.set(5, 8, [255, 250, 200]); },
  bugday: () => p => { const c = hex('#d8b24a'); for (let i = 0; i < 4; i++) { cizgi(p, 3 + i * 2, 14, 6 + i * 2, 4, karis(c, 0.85 + i * 0.07)); p.set(6 + i * 2, 3, [240, 210, 110]); } cizgi(p, 3, 11, 11, 11, hex('#a6702e')); },
  tohum: e => p => { const c = hex(e.renk || '#7aa83a'); for (const [x, y] of [[5, 6], [9, 5], [7, 9], [11, 9], [4, 11], [9, 12]]) { p.set(x, y, c); p.set(x + 1, y, karis(c, 0.8)); p.set(x, y + 1, karis(c, 0.9)); } },
  ekmek: () => p => { cokgen(p, [[2, 9], [4, 6], [9, 4], [13, 5], [14, 8], [12, 11], [6, 12], [3, 12]], '#c98a3e', 0.08); cizgi(p, 6, 7, 7, 9, [150, 95, 40]); cizgi(p, 9, 6, 10, 8, [150, 95, 40]); },
  mektup: () => p => { cokgen(p, [[2, 4], [14, 4], [14, 12], [2, 12]], '#efe6cf', 0.03); cizgi(p, 2, 4, 8, 9, [170, 150, 110]); cizgi(p, 14, 4, 8, 9, [170, 150, 110]); p.set(8, 10, [180, 40, 40]); p.set(7, 10, [180, 40, 40]); },
  /* 0.31.0: Yapı Planı: mavi kâğıt üzerinde beyaz çizgili kat planı */
  plan: () => p => { cokgen(p, [[2, 3], [14, 3], [14, 13], [2, 13]], '#2f5bc0', 0.04); const b = [225, 235, 250]; cizgi(p, 4, 5, 12, 5, b); cizgi(p, 4, 5, 4, 11, b); cizgi(p, 4, 11, 12, 11, b); cizgi(p, 12, 5, 12, 11, b); cizgi(p, 8, 5, 8, 8, b); cizgi(p, 8, 8, 12, 8, b); p.set(6, 11, [47, 91, 192]); for (let y = 3; y < 13; y++) p.set(14, y, [30, 60, 140]); },
  /* 0.32.0: Köy Kolisi: iple bağlı karton kutu */
  koli: () => p => { cokgen(p, [[2, 5], [14, 5], [14, 14], [2, 14]], '#b8864a', 0.06); cokgen(p, [[2, 3], [14, 3], [14, 5], [2, 5]], '#d8a868', 0.05); const k = [110, 70, 36], ip = [232, 220, 190]; cizgi(p, 2, 5, 14, 5, k); cizgi(p, 8, 3, 8, 14, ip); cizgi(p, 2, 9, 14, 9, ip); p.set(7, 2, ip); p.set(9, 2, ip); p.set(8, 9, [200, 60, 50]); },
  /* 0.34.0: tarım ürünleri */
  domates: () => p => { cokgen(p, [[4, 6], [12, 6], [13, 10], [11, 14], [5, 14], [3, 10]], '#d8342a', 0.1); cokgen(p, [[6, 4], [10, 4], [9, 6], [7, 6]], '#3a8a2a', 0.05); p.set(6, 8, [255, 140, 120]); },
  biber: () => p => { kalinCizgi(p, [[5, 4], [7, 9], [10, 13], [12, 14]], '#3aa83a'); kalinCizgi(p, [[6, 5], [8, 10], [11, 13]], '#4ac04a'); cizgi(p, 5, 4, 4, 2, [90, 70, 30]); },
  misir: e => p => { cokgen(p, [[6, 3], [10, 3], [11, 8], [10, 13], [6, 13], [5, 8]], e.renk || '#f2c43c', 0.1); for (let y = 4; y < 13; y += 2) cizgi(p, 6, y, 10, y, karis(hex(e.renk || '#f2c43c'), 0.8)); cokgen(p, [[4, 10], [7, 14], [4, 15]], '#8aa23a', 0.05); cokgen(p, [[12, 10], [9, 14], [12, 15]], '#8aa23a', 0.05); },
  sogan: () => p => { cokgen(p, [[8, 4], [12, 8], [12, 12], [8, 14], [4, 12], [4, 8]], '#c88a4a', 0.12); cizgi(p, 8, 4, 8, 1, [90, 160, 60]); cizgi(p, 6, 8, 6, 12, [168, 110, 60]); },
  lahana: () => p => { for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const d = Math.hypot(x - 7.5, y - 8); if (d < 6) p.set(x, y, karis([138, 192, 90], 0.75 + (1 - d / 6) * 0.4)); } cizgi(p, 8, 3, 8, 13, [100, 150, 70]); },
  pamuk: () => p => { for (const [x, y] of [[6, 6], [10, 6], [8, 9], [5, 10], [11, 10]]) for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) if (a * a + b * b < 5) p.set(x + a, y + b, karis([246, 244, 238], 0.85 + p.r() * 0.15)); cokgen(p, [[7, 12], [9, 12], [9, 15], [7, 15]], '#6a5a3a', 0); },
  cilek: () => p => { cokgen(p, [[4, 6], [12, 6], [11, 10], [8, 14], [5, 10]], '#e0283a', 0.1); cokgen(p, [[5, 4], [11, 4], [10, 6], [6, 6]], '#3a8a2a', 0.05); for (const [x, y] of [[6, 8], [9, 8], [8, 11], [7, 10]]) p.set(x, y, [250, 230, 120]); },
  karpuz: () => p => { cokgen(p, [[2, 6], [14, 6], [8, 14]], '#e8404a', 0.06); cizgi(p, 2, 6, 14, 6, [60, 140, 50]); cizgi(p, 2, 5, 14, 5, [40, 110, 40]); for (const [x, y] of [[6, 8], [10, 8], [8, 10]]) p.set(x, y, [30, 20, 20]); },
  kiraz: () => p => { cizgi(p, 8, 2, 5, 9, [90, 120, 40]); cizgi(p, 8, 2, 11, 9, [90, 120, 40]); cokgen(p, [[3, 9], [7, 9], [7, 13], [3, 13]], '#a8102a', 0.15); cokgen(p, [[9, 9], [13, 9], [13, 13], [9, 13]], '#a8102a', 0.15); },
  portakal: () => p => { for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const d = Math.hypot(x - 7.5, y - 8.5); if (d < 5.8) p.set(x, y, karis([240, 138, 26], 0.8 + (1 - d / 6) * 0.35)); } cokgen(p, [[8, 2], [11, 2], [9, 4]], '#3a8a2a', 0); },
  zeytin: () => p => { cizgi(p, 3, 4, 13, 6, [110, 110, 70]); for (const [x, y] of [[5, 8], [9, 9], [12, 8]]) cokgen(p, [[x - 1, y - 1], [x + 1, y - 1], [x + 2, y + 2], [x - 1, y + 2]], '#3a4a1a', 0.1); cokgen(p, [[6, 3], [9, 2], [8, 4]], '#7a9a6a', 0); },
  patlamis: () => p => { cokgen(p, [[4, 7], [12, 7], [11, 15], [5, 15]], '#d84040', 0.05); for (let x = 5; x < 12; x += 2) cizgi(p, x, 7, x, 15, [245, 240, 230]); for (const [x, y] of [[5, 5], [8, 4], [11, 5], [7, 6], [10, 6], [6, 3], [9, 3]]) { p.set(x, y, [250, 245, 220]); p.set(x + 1, y, [240, 225, 170]); } },
  tirpan: e => p => { kalinCizgi(p, [[4, 15], [10, 3]], '#8a6034'); kalinCizgi(p, [[10, 3], [6, 2], [2, 3], [1, 5]], e.renk || '#dcdcdc'); cizgi(p, 7, 9, 5, 8, [110, 80, 50]); },
  fide: e => p => { cizgi(p, 8, 15, 8, 8, [70, 120, 50]); cokgen(p, [[8, 9], [3, 6], [6, 4]], e.renk || '#3a8a3a', 0.05); cokgen(p, [[8, 8], [13, 5], [11, 3]], e.renk || '#3a8a3a', 0.05); cokgen(p, [[6, 13], [10, 13], [10, 15], [6, 15]], '#6e4b2e', 0); },
  kumas: () => p => { cokgen(p, [[2, 4], [13, 3], [14, 12], [3, 13]], '#e8e2d0', 0.05); for (let y = 5; y < 13; y += 2) cizgi(p, 3, y, 13, y - 1, [200, 192, 172]); for (let x = 4; x < 13; x += 3) cizgi(p, x, 4, x + 1, 12, [214, 206, 186]); },   // 0.35.0
  kemik: () => p => { kalinCizgi(p, [[4, 12], [11, 5]], '#e8e4d6'); for (const [x, y] of [[3, 11], [4, 13], [2, 12], [11, 3], [12, 5], [13, 4]]) p.set(x, y, [232, 228, 214]); },
  /* 0.18.0 */
  toz: e => p => { const c = hex(e.renk || '#f2c84a'); for (let i = 0; i < 46; i++) { const a = p.r() * Math.PI * 2, r = p.r() * 5; p.set(Math.round(8 + Math.cos(a) * r), Math.round(9 + Math.sin(a) * r * 0.7), karis(c, 0.75 + p.r() * 0.4)); } },
  kor_kristal: () => p => { cokgen(p, [[8, 1], [12, 5], [11, 12], [8, 15], [5, 12], [4, 5]], '#e8501e', 0.12); cizgi(p, 8, 2, 8, 13, [255, 170, 80]); p.set(7, 4, [255, 240, 180]); p.set(6, 6, [255, 210, 140]); },
  cakmak2: () => p => { cokgen(p, [[3, 7], [9, 7], [9, 14], [3, 14]], '#b8b8c0', 0.1); cokgen(p, [[9, 4], [14, 2], [14, 7], [9, 9]], '#3c3c40', 0.12); cizgi(p, 4, 9, 8, 9, [120, 120, 130]); p.set(13, 1, [255, 200, 80]); p.set(12, 0, [255, 140, 40]); },
  kemik_tozu: e => p => { const c = e.renk ? hex(e.renk) : [240, 238, 230]; for (let i = 0; i < 40; i++) { const a = p.r() * Math.PI * 2, r = p.r() * 5; p.set(Math.round(8 + Math.cos(a) * r), Math.round(9 + Math.sin(a) * r * 0.7), karis(c, 0.85 + p.r() * 0.15)); } },
  balik: e => p => { cokgen(p, [[2, 8], [5, 5], [10, 5], [12, 7], [15, 4], [15, 12], [12, 9], [10, 11], [5, 11]], e.renk, 0.08); p.set(4, 7, [20, 20, 20]); cizgi(p, 6, 9, 10, 9, karis(hex(e.renk), 0.75)); },
  inci: () => p => { for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const d = Math.hypot(x - 7.5, y - 8); if (d < 4.6) p.set(x, y, karis([238, 234, 240], 0.85 + (4.6 - d) * 0.03)); } p.set(6, 6, [255, 255, 255]); p.set(7, 6, [255, 255, 255]); },
  dis: () => p => cokgen(p, [[4, 4], [12, 4], [11, 7], [8, 14], [5, 7]], '#efeae0', 0.04),
  ahtapot: e => p => { cokgen(p, [[4, 3], [12, 3], [13, 8], [3, 8]], e.renk, 0.08); for (let i = 0; i < 5; i++) cizgi(p, 4 + i * 2, 8, 3 + i * 2 + (i % 2), 14, karis(hex(e.renk), 0.85)); p.set(6, 5, [20, 20, 20]); p.set(10, 5, [20, 20, 20]); },
  olta: () => p => { kalinCizgi(p, [[2, 14], [12, 3]], '#7b5a32'); cizgi(p, 13, 3, 13, 12, [220, 220, 220]); p.set(13, 13, [200, 40, 40]); p.set(12, 13, [240, 240, 240]); },
  sandal: () => p => { cokgen(p, [[1, 8], [15, 8], [13, 12], [3, 12]], '#9a6a3a', 0.08); cizgi(p, 1, 8, 15, 8, hex('#6b4a28')); cizgi(p, 5, 7, 9, 3, hex('#7b5a32')); },
  yelkenli: () => p => { cokgen(p, [[1, 11], [15, 11], [13, 14], [3, 14]], '#9a6a3a', 0.08); cizgi(p, 8, 2, 8, 11, hex('#5a3d1f')); cokgen(p, [[9, 2], [14, 9], [9, 9]], '#f0ece2', 0.03); cokgen(p, [[7, 4], [7, 9], [3, 9]], '#e6e0d4', 0.03); },
  maske: () => p => { cokgen(p, [[2, 6], [14, 6], [14, 11], [2, 11]], '#2a2a30', 0.05); cokgen(p, [[3, 7], [7, 7], [7, 10], [3, 10]], '#7fd0f0', 0.05); cokgen(p, [[9, 7], [13, 7], [13, 10], [9, 10]], '#7fd0f0', 0.05); cizgi(p, 0, 8, 2, 8, [60, 60, 70]); cizgi(p, 14, 8, 15, 8, [60, 60, 70]); },
  palet: () => p => { cokgen(p, [[2, 3], [6, 3], [7, 14], [1, 14]], '#2f7fd0', 0.06); cokgen(p, [[9, 3], [13, 3], [15, 14], [9, 14]], '#2f7fd0', 0.06); cizgi(p, 2, 5, 6, 5, [30, 30, 40]); cizgi(p, 9, 5, 13, 5, [30, 30, 40]); },
  boya: e => p => { cokgen(p, [[5, 3], [11, 3], [13, 8], [11, 13], [5, 13], [3, 8]], e.renk, 0.12); p.set(6, 5, [255, 255, 255]); p.set(7, 5, karis(hex(e.renk), 1.5)); },
  havuc: () => p => { cokgen(p, [[3, 13], [4, 11], [10, 5], [12, 6], [6, 13]], '#e8812a', 0.08); for (const [x, y] of [[5, 11], [7, 9], [9, 7]]) p.set(x, y, [170, 80, 20]); kalinCizgi(p, [[11, 5], [13, 2]], '#3f8f2c'); p.set(10, 2, hex('#4f9a35')); p.set(14, 4, hex('#4f9a35')); },
  patates: e => p => { cokgen(p, [[3, 8], [5, 5], [10, 4], [13, 7], [12, 11], [8, 13], [4, 12]], e.renk, 0.1); for (const [x, y] of [[6, 7], [10, 8], [7, 11]]) p.set(x, y, karis(hex(e.renk), 0.6)); },
  sise: () => p => { cokgen(p, [[6, 2], [10, 2], [10, 5], [13, 8], [13, 13], [3, 13], [3, 8], [6, 5]], '#cfe6f0', 0.02); cizgi(p, 6, 2, 9, 2, [150, 100, 60]); p.set(5, 9, [255, 255, 255]); },
  /* 0.37.0: yeni eşyalar */
  kagit: () => p => { cokgen(p, [[3, 2], [12, 2], [13, 14], [4, 14]], '#f4f0e2', 0.02); for (let y = 5; y < 13; y += 2) cizgi(p, 5, y, 11, y, [180, 190, 210]); },
  kitap: e => p => { cokgen(p, [[3, 2], [12, 2], [12, 14], [3, 14]], e.renk, 0.06); cokgen(p, [[12, 3], [14, 3], [14, 14], [12, 14]], '#efe8d4', 0.02); cizgi(p, 4, 2, 4, 14, karis(hex(e.renk), 0.6)); cizgi(p, 6, 5, 10, 5, [230, 200, 120]); cizgi(p, 6, 7, 10, 7, [230, 200, 120]); },
  murekkep: () => p => { cokgen(p, [[4, 6], [12, 6], [13, 14], [3, 14]], '#1a1a3a', 0.06); cokgen(p, [[6, 3], [10, 3], [10, 6], [6, 6]], '#2a2a2a', 0.04); kalinCizgi(p, [[9, 1], [14, 0]], '#e8e2d0'); p.set(5, 8, [90, 90, 160]); },
  civi: () => p => { for (const [x, y] of [[3, 3], [8, 5], [5, 9]]) { kalinCizgi(p, [[x, y], [x + 6, y + 6]], '#a8acb0'); p.set(x - 1, y, [80, 84, 90]); p.set(x, y - 1, [80, 84, 90]); p.set(x - 1, y - 1, [120, 124, 130]); } },
  halat: () => p => { for (let r = 3; r <= 6; r += 1.5) for (let a = 0; a < 40; a++) { const t = a / 40 * Math.PI * 2; p.set(Math.round(8 + Math.cos(t) * r), Math.round(8 + Math.sin(t) * r * 0.8), karis([184, 148, 90], 0.8 + (a % 3) * 0.12)); } },
  tugla: () => p => { cokgen(p, [[2, 6], [13, 6], [14, 11], [3, 11]], '#a84a32', 0.08); cizgi(p, 2, 6, 13, 6, [196, 100, 72]); cizgi(p, 3, 11, 14, 11, [110, 40, 26]); },
  elFeneri: () => p => { kalinCizgi(p, [[3, 13], [9, 7]], '#c86a34'); kalinCizgi(p, [[4, 13], [10, 7]], '#a8562a'); cokgen(p, [[8, 4], [12, 3], [13, 4], [12, 8], [8, 8]], '#d8d8dc', 0.08); cokgen(p, [[11, 2], [14, 1], [15, 2], [14, 5]], '#fff2a8', 0.02); p.set(5, 11, [240, 200, 120]); p.set(14, 2, [255, 255, 230]); },
  durbun: () => p => { cokgen(p, [[1, 5], [7, 5], [7, 11], [1, 11]], '#2c2c30', 0.05); cokgen(p, [[9, 5], [15, 5], [15, 11], [9, 11]], '#2c2c30', 0.05); cokgen(p, [[6, 7], [10, 7], [10, 9], [6, 9]], '#c8a040', 0.05); cizgi(p, 1, 6, 1, 10, [120, 180, 220]); cizgi(p, 15, 6, 15, 10, [120, 180, 220]); },
  cepSaati: () => p => { for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const d = Math.hypot(x - 8, y - 9); if (d < 5.2) p.set(x, y, d < 4.2 ? [244, 238, 220] : [220, 176, 60]); } cizgi(p, 8, 9, 8, 6, [30, 20, 10]); cizgi(p, 8, 9, 10, 10, [30, 20, 10]); cokgen(p, [[7, 2], [9, 2], [9, 4], [7, 4]], '#e8b830'); },
  anahtar: () => p => { for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const d = Math.hypot(x - 4.5, y - 4.5); if (d < 3.6 && d > 1.6) p.set(x, y, d < 2.4 ? [200, 120, 255] : [150, 70, 220]); }
    kalinCizgi(p, [[7, 7], [14, 14]], '#9a5ae0'); for (const [x, y] of [[11, 13], [12, 12], [13, 15], [14, 13]]) p.set(x, y, [120, 50, 190]); p.set(4, 4, [255, 230, 120]); p.set(5, 4, [255, 210, 90]); p.set(3, 3, [240, 200, 255]); },
  fisek: () => p => { cokgen(p, [[6, 5], [10, 5], [10, 13], [6, 13]], '#c82a2a', 0.05); cokgen(p, [[6, 3], [8, 0], [10, 3], [10, 5], [6, 5]], '#e8b030', 0.05); for (let x = 6; x < 10; x++) p.set(x, 9, [240, 240, 240]); kalinCizgi(p, [[8, 13], [8, 15]], '#7b5a32'); },
  /* 0.36.0: mutfak eşyaları */
  cuval: e => p => { cokgen(p, [[4, 4], [12, 4], [14, 10], [12, 14], [4, 14], [2, 10]], '#c8a870', 0.08); cizgi(p, 5, 4, 11, 4, [120, 90, 50]); cokgen(p, [[5, 2], [11, 2], [10, 5], [6, 5]], e.renk, 0.06); cizgi(p, 6, 9, 10, 9, [150, 120, 70]); },
  tereyag: e => p => { cokgen(p, [[2, 9], [9, 6], [14, 8], [14, 11], [7, 14], [2, 12]], e.renk, 0.06); cizgi(p, 2, 9, 9, 6, karis(hex(e.renk), 1.15)); cizgi(p, 7, 11, 14, 8, karis(hex(e.renk), 0.8)); },
  kavanoz: e => p => { cokgen(p, [[4, 4], [12, 4], [13, 6], [13, 14], [3, 14], [3, 6]], '#cfe6f0', 0.02); cokgen(p, [[4, 7], [12, 7], [12, 13], [4, 13]], e.renk, 0.1); cokgen(p, [[4, 2], [12, 2], [12, 4], [4, 4]], '#a8742e', 0.05); p.set(5, 8, [255, 255, 255]); },
  hamur: e => p => { for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const d = Math.hypot((x - 7.5) / 1.2, y - 9); if (d < 5) p.set(x, y, karis(hex(e.renk), 0.85 + (5 - d) * 0.04)); } p.set(6, 7, [255, 250, 235]); },
  baharat: e => p => { cokgen(p, [[2, 9], [14, 9], [12, 13], [4, 13]], '#8a6038', 0.06); for (let i = 0; i < 30; i++) p.set(4 + Math.floor(p.r() * 8), 6 + Math.floor(p.r() * 3), karis(hex(e.renk), 0.7 + p.r() * 0.5)); },
  kiyma: e => p => { cokgen(p, [[2, 10], [14, 10], [13, 13], [3, 13]], '#d8d8d0', 0.03); for (let i = 0; i < 40; i++) { const a = p.r() * Math.PI, r = p.r() * 5; p.set(Math.round(8 + Math.cos(a) * r), Math.round(9 - Math.sin(a) * r * 0.8), karis(hex(e.renk), 0.7 + p.r() * 0.5)); } },
  pide: e => p => { cokgen(p, [[1, 8], [4, 5], [12, 5], [15, 8], [12, 11], [4, 11]], '#d8a050', 0.08); cokgen(p, [[4, 7], [12, 7], [12, 9], [4, 9]], e.renk, 0.15); },
  simit: e => p => { for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const d = Math.hypot(x - 7.5, y - 8); if (d < 6.2 && d > 2.6) p.set(x, y, karis(hex(e.renk), 0.85 + p.r() * 0.3)); } for (let i = 0; i < 10; i++) { const a = p.r() * Math.PI * 2; p.set(Math.round(7.5 + Math.cos(a) * 4.4), Math.round(8 + Math.sin(a) * 4.4), [240, 225, 180]); } },
  tabak: e => p => { cokgen(p, [[1, 9], [3, 7], [13, 7], [15, 9], [13, 12], [3, 12]], '#eceae4', 0.03); cokgen(p, [[4, 6], [12, 6], [12, 10], [4, 10]], e.renk, 0.15); p.set(6, 7, karis(hex(e.renk), 1.25)); },
  tatli: e => p => { for (const [ox, oy] of [[4, 9], [10, 9], [7, 5]]) cokgen(p, [[ox - 2, oy - 2], [ox + 2, oy - 2], [ox + 2, oy + 2], [ox - 2, oy + 2]], e.renk, 0.12); p.set(6, 4, [255, 255, 255]); },
  icecek: e => p => { cokgen(p, [[4, 4], [12, 4], [11, 14], [5, 14]], '#e8eef2', 0.02); cokgen(p, [[5, 6], [11, 6], [11, 13], [5, 13]], e.renk, 0.08); cizgi(p, 12, 6, 14, 8, [220, 220, 220]); cizgi(p, 14, 8, 12, 11, [220, 220, 220]); },
  defter: e => p => { cokgen(p, [[3, 2], [13, 2], [13, 14], [3, 14]], e.renk, 0.06); cizgi(p, 4, 2, 4, 14, karis(hex(e.renk), 0.6)); cokgen(p, [[6, 4], [11, 4], [11, 7], [6, 7]], '#f0e8d0', 0.02); cizgi(p, 13, 3, 13, 13, [240, 232, 210]); },
  corba2: e => p => { cokgen(p, [[2, 7], [14, 7], [12, 12], [4, 12]], '#8a6038', 0.06); const c = hex(e.renk); cizgi(p, 3, 7, 13, 7, c); cizgi(p, 4, 6, 12, 6, karis(c, 0.85)); p.set(6, 5, karis(c, 1.15)); p.set(10, 5, karis(c, 1.15)); },
  kebap: () => p => { kalinCizgi(p, [[2, 14], [14, 2]], '#b8a888'); for (const [x, y, c] of [[5, 11, '#7a3a1c'], [7, 9, '#c8a030'], [9, 7, '#7a3a1c'], [11, 5, '#c84a2a']]) for (const [a, b] of [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, -1]]) p.set(x + a, y + b, karis(hex(c), 0.9 + p.r() * 0.2)); },
  kofte: () => p => { cokgen(p, [[2, 8], [4, 5], [12, 5], [14, 8], [12, 12], [4, 12]], '#d8a050', 0.08); for (let x = 4; x < 13; x++) { p.set(x, 8, hex('#6a3418')); p.set(x, 9, hex('#7a3e1e')); } for (const x of [5, 8, 11]) p.set(x, 7, hex('#4f8a2c')); },
  recel: () => p => { cokgen(p, [[2, 9], [4, 6], [9, 4], [13, 5], [14, 8], [12, 11], [6, 12], [3, 12]], '#c98a3e', 0.08); cokgen(p, [[4, 8], [8, 6], [12, 7], [11, 10], [6, 10]], '#7a2a6a', 0.1); },
  eyer: () => p => { cokgen(p, [[2, 7], [5, 4], [11, 4], [14, 7], [13, 10], [3, 10]], '#7a4a22', 0.1); cokgen(p, [[4, 6], [12, 6], [11, 8], [5, 8]], '#9a6234', 0.05); for (let y = 10; y < 14; y++) p.set(5, y, hex('#3a2a1a')); p.set(5, 14, hex('#a8a8b0')); p.set(6, 14, hex('#a8a8b0')); },
  corba: () => p => { cokgen(p, [[2, 7], [14, 7], [12, 12], [4, 12]], '#8a6038', 0.06); cizgi(p, 3, 7, 13, 7, hex('#b07a4a')); cizgi(p, 4, 6, 12, 6, hex('#9a6a44')); },
  /* 0.21.0 */
  cekirdek: e => p => { const c = hex(e.renk || '#ece0b0'); for (const [x, y] of [[4, 5], [9, 4], [6, 9], [11, 8], [4, 12], [9, 12]]) { p.set(x, y, c); p.set(x + 1, y, karis(c, 0.85)); p.set(x, y + 1, karis(c, 0.9)); p.set(x + 1, y + 1, karis(c, 0.75)); } },
  kova: e => p => { cokgen(p, [[3, 5], [13, 5], [11, 14], [5, 14]], '#a8acb4', 0.06); cizgi(p, 3, 5, 13, 5, [70, 72, 80]); for (let a = 0; a <= 12; a++) { const t = a / 12 * Math.PI; p.set(Math.round(8 - Math.cos(t) * 5), Math.round(5 - Math.sin(t) * 3.5), [90, 92, 100]); } if (e.ic) { cizgi(p, 4, 6, 12, 6, hex(e.ic)); cizgi(p, 5, 7, 11, 7, karis(hex(e.ic), 0.85)); } },
  yumurta: e => p => { for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const d = ((x - 7.5) / 4.2) ** 2 + ((y - 8.5) / (y < 8.5 ? 5.8 : 4.8)) ** 2; if (d < 1) p.set(x, y, karis(hex(e.renk || '#efe2c8'), 1.05 - d * 0.25)); } p.set(6, 5, [255, 255, 250]); p.set(10, 10, [220, 200, 170]); },
  makas: () => p => { kalinCizgi(p, [[4, 12], [12, 3]], '#c8ccd4'); kalinCizgi(p, [[12, 12], [4, 3]], '#b0b4bc'); for (const [cx, cy] of [[3, 13], [13, 13]]) for (let a = 0; a < 16; a++) { const t = a / 16 * Math.PI * 2; p.set(Math.round(cx + Math.cos(t) * 2), Math.round(cy + Math.sin(t) * 1.6), [180, 40, 40]); } },
  petek: () => p => { const c = hex('#f2b028'), k = hex('#c07a10'); for (let y = 2; y < 14; y++) for (let x = 2; x < 14; x++) { const sira = Math.floor((y - 2) / 3), xx = x + (sira % 2) * 2; p.set(x, y, (y - 2) % 3 === 0 || xx % 4 === 0 ? k : karis(c, 0.9 + p.r() * 0.15)); } },
  peynir: () => p => { cokgen(p, [[2, 7], [12, 3], [14, 6], [14, 12], [2, 12]], '#f2d870', 0.05); cizgi(p, 2, 7, 14, 6, [250, 235, 150]); for (const [x, y] of [[5, 9], [9, 10], [12, 8]]) { p.set(x, y, [200, 160, 60]); p.set(x + 1, y, [210, 175, 70]); } },
  kek: () => p => { cokgen(p, [[2, 8], [14, 8], [14, 13], [2, 13]], '#c8884a', 0.06); cokgen(p, [[2, 6], [14, 6], [14, 9], [2, 9]], '#f6f2ea', 0.03); for (const x of [4, 8, 12]) { p.set(x, 5, [210, 40, 40]); p.set(x, 10, [250, 248, 240]); } },
  turta: () => p => { cokgen(p, [[2, 8], [5, 5], [11, 5], [14, 8], [12, 12], [4, 12]], '#d8a050', 0.06); cokgen(p, [[4, 8], [6, 6], [10, 6], [12, 8], [10, 10], [6, 10]], '#d8781c', 0.08); cizgi(p, 5, 8, 11, 8, [240, 190, 110]); },
  omlet: () => p => { cokgen(p, [[2, 8], [5, 5], [11, 5], [14, 8], [11, 11], [5, 11]], '#f6d84a', 0.08); for (const [x, y] of [[6, 7], [10, 8], [8, 9]]) p.set(x, y, [80, 150, 50]); p.set(9, 6, [255, 240, 160]); },
  /* 0.22.0 */
  /* 0.25.0: çok bloklu cihazların simgeleri */
  cihazGunes: () => p => { cokgen(p, [[1, 7], [11, 3], [15, 5], [5, 10]], '#1d3a6e', 0.04); const k = [200, 204, 212]; cizgi(p, 1, 7, 11, 3, k); cizgi(p, 5, 10, 15, 5, k); cizgi(p, 1, 7, 5, 10, k); cizgi(p, 11, 3, 15, 5, k); cizgi(p, 6, 5, 10, 8, [80, 120, 190]); cizgi(p, 3, 8, 13, 4, [80, 120, 190]); cizgi(p, 4, 10, 4, 14, [150, 154, 160]); cizgi(p, 12, 7, 12, 14, [150, 154, 160]); cizgi(p, 2, 14, 14, 14, [120, 124, 130]); },
  cihazRuzgar: () => p => { const g = [236, 238, 240], k = [180, 186, 194]; cizgi(p, 8, 6, 7, 15, g); cizgi(p, 9, 6, 9, 15, k); cizgi(p, 6, 15, 10, 15, [130, 130, 130]); for (const [x, y] of [[8, 0], [14, 9], [2, 9]]) { cizgi(p, 8, 5, x, y, g); } cokgen(p, [[7, 4], [10, 4], [10, 7], [7, 7]], '#d8dce2', 0.02); p.set(8, 5, [120, 126, 134]); },
  cihazSu: () => p => { dokuBoya(p, T.su_carki, [[1, 1, 15, 15]]); for (let x = 0; x < 16; x++) { p.set(x, 14, karis(hex('#3a6ad8'), 0.9 + (x % 3) * 0.08)); p.set(x, 15, karis(hex('#2a52b0'), 1)); } },
  cihazBatarya: e => p => BLOK_SIMGE.batarya(p, null, e.boyut),
  cihazTaret: () => p => { cokgen(p, [[3, 13], [13, 13], [12, 15], [4, 15]], '#3a3f46', 0.05); for (let y = 9; y < 13; y++) { p.set(7, y, [150, 154, 160]); p.set(8, y, [120, 124, 130]); } cokgen(p, [[3, 5], [12, 5], [12, 9], [3, 9]], '#2e333a', 0.05); cizgi(p, 0, 6, 4, 6, [180, 184, 190]); cizgi(p, 0, 8, 4, 8, [180, 184, 190]); p.set(5, 6, [240, 90, 78]); p.set(12, 4, [242, 194, 48]); },
  kablo: () => p => { const k = [36, 40, 46], a = [70, 76, 86]; for (let r = 6; r >= 2; r -= 1.3) for (let i = 0; i < 40; i++) { const t = i / 40 * Math.PI * 2; p.set(Math.round(8 + Math.cos(t) * r), Math.round(8 + Math.sin(t) * r * 0.9), r > 4 ? a : k); } cizgi(p, 13, 8, 15, 13, a); p.set(15, 14, [210, 120, 70]); p.set(7, 8, [20, 20, 22]); p.set(8, 8, [20, 20, 22]); },
  devre: () => p => { cokgen(p, [[2, 3], [14, 3], [14, 13], [2, 13]], '#2f7a3e', 0.05); const y = [232, 192, 64]; cizgi(p, 3, 6, 8, 6, y); cizgi(p, 8, 6, 8, 11, y); cizgi(p, 8, 11, 13, 11, y); cizgi(p, 3, 10, 5, 10, y); for (let y2 = 5; y2 < 9; y2++) for (let x = 10; x < 13; x++) p.set(x, y2, [30, 32, 36]); p.set(4, 4, [210, 210, 220]); p.set(13, 5, [210, 210, 220]); },
  bobin: () => p => { for (let y = 3; y < 14; y++) for (let x = 4; x < 12; x++) p.set(x, y, karis(hex('#d27b40'), (y % 2 ? 0.8 : 1.1) * (x < 6 ? 1.15 : x > 9 ? 0.8 : 1))); for (let x = 3; x < 13; x++) { p.set(x, 2, [90, 90, 96]); p.set(x, 14, [70, 70, 76]); } cizgi(p, 7, 14, 7, 15, [210, 120, 70]); },
  yildiz: () => p => { for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; kalinCizgi(p, [[8, 8], [Math.round(8 + Math.cos(a) * 6), Math.round(8 + Math.sin(a) * 6)]], i % 2 ? '#ffd84a' : '#fff0a0'); } for (const [x, y] of [[7, 7], [8, 7], [7, 8], [8, 8]]) p.set(x, y, [255, 255, 240]); p.set(13, 3, [160, 220, 255]); p.set(2, 12, [160, 220, 255]); },
  tilsim: () => p => { const z = hex('#c8a040'); for (let a = 0; a < 28; a++) { const t = a / 28 * Math.PI * 2; p.set(Math.round(8 + Math.cos(t) * 5), Math.round(9 + Math.sin(t) * 5), karis(z, 0.85 + (a % 2) * 0.2)); } cizgi(p, 8, 1, 8, 4, [200, 190, 170]); cokgen(p, [[8, 6], [10, 9], [8, 12], [6, 9]], '#7ad8ff', 0.05); p.set(8, 8, [240, 255, 255]); p.set(7, 9, [200, 245, 255]); },
  atel: () => p => { kalinCizgi(p, [[3, 3], [12, 12]], '#a87a44'); kalinCizgi(p, [[5, 2], [14, 11]], '#8a6034'); for (const t of [4, 8, 11]) { cizgi(p, t - 1, t + 2, t + 3, t - 2, [236, 230, 214]); } },
  baklava: () => p => { for (let y = 3; y < 14; y++) for (let x = 2; x < 14; x++) { const d = Math.abs(x - 7.5) / 6 + Math.abs(y - 8) / 5.5; if (d < 1) p.set(x, y, d > 0.82 ? [150, 90, 30] : karis(hex('#e0a848'), 0.85 + ((x + y) % 3) * 0.08)); } for (const [x, y] of [[7, 7], [8, 8], [6, 9]]) p.set(x, y, [90, 150, 50]); }
};

/* Biçimli blokların simgeleri: blok dokusundan alınan piksellerle yan görünüş */
function dokuBoya(p, t, kutular) {
  const d = doseme(t).veri;
  for (const [x0, y0, x1, y1, k = 1] of kutular) for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = (y * 16 + x) * 4;
    if (d[i + 3] > 100) p.set(x, y, karis([d[i], d[i + 1], d[i + 2]], k));
  }
}
const BLOK_SIMGE = {
  mezar: (p, id) => dokuBoya(p, YUZ_DOKU[id * 6], [[4, 2, 12, 12], [5, 1, 11, 2], [2, 12, 14, 15, 0.8]]),   // 0.22.0
  merdiven: (p, id) => dokuBoya(p, YUZ_DOKU[id * 6], [[2, 8, 14, 14], [8, 2, 14, 8, 0.85]]),
  yarim: (p, id) => dokuBoya(p, YUZ_DOKU[id * 6], [[1, 8, 15, 14]]),
  cit: (p, id) => dokuBoya(p, YUZ_DOKU[id * 6], [[2, 2, 5, 15], [11, 2, 14, 15], [5, 5, 11, 7, 0.85], [5, 10, 11, 12, 0.85]]),
  citKapi: (p, id) => dokuBoya(p, YUZ_DOKU[id * 6], [[1, 4, 3, 14], [13, 4, 15, 14], [3, 5, 13, 7, 0.85], [3, 10, 13, 12, 0.85], [7, 7, 9, 10, 0.85]]),
  bolme: (p, id) => { dokuBoya(p, YUZ_DOKU[id * 6], [[2, 1, 14, 15]]); if (id === 109) for (let y = 1; y < 15; y++) { p.set(2, y, [210, 235, 245]); p.set(13, y, [210, 235, 245]); } },
  tuzak: (p, id) => dokuBoya(p, YUZ_DOKU[id * 6], [[1, 1, 15, 15]]),
  kol: (p, id) => { dokuBoya(p, T.parke, [[3, 12, 13, 15]]); dokuBoya(p, T.kalas, [[7, 4, 9, 12]]); dokuBoya(p, T.kol_bas, [[6, 2, 10, 5]]); },
  dugme: (p, id) => dokuBoya(p, T.tas, [[4, 6, 12, 11], [4, 10, 12, 12, 0.75]]),
  plaka: (p, id) => dokuBoya(p, T.kalas, [[1, 10, 15, 13], [1, 12, 15, 14, 0.75]]),
  kablo: (p, id) => { dokuBoya(p, T.bakir_tel_a, [[2, 7, 14, 9]]); dokuBoya(p, T.bakir_tel_k, [[5, 5, 11, 11, 0.9]]); },
  gecik: (p, id) => { dokuBoya(p, T.gecik_ust, [[1, 10, 15, 14]]); dokuBoya(p, T.kalas, [[4, 6, 6, 10], [10, 6, 12, 10]]); dokuBoya(p, T.kol_bas, [[3, 4, 7, 6], [9, 4, 13, 6]]); },
  ters: (p, id) => { dokuBoya(p, T.ters_ust, [[1, 10, 15, 14]]); dokuBoya(p, T.kalas, [[7, 5, 9, 10]]); dokuBoya(p, T.bakir_lamba_a, [[6, 3, 10, 6]]); },
  algi: (p, id) => { dokuBoya(p, T.algi_ust_a, [[1, 6, 15, 10]]); dokuBoya(p, T.algi_yan, [[1, 10, 15, 13, 0.85]]); },
  sandalye: (p, id) => dokuBoya(p, YUZ_DOKU[id * 6], [[3, 2, 6, 15], [3, 8, 13, 10], [3, 2, 13, 4, 0.85], [11, 9, 13, 15]]),
  masa: (p, id) => dokuBoya(p, YUZ_DOKU[id * 6], [[1, 4, 15, 7], [2, 7, 4, 15, 0.8], [12, 7, 14, 15, 0.8]]),
  koltuk: (p, id) => { dokuBoya(p, YUZ_DOKU[id * 6], [[1, 8, 15, 13, 0.9], [1, 13, 3, 15], [13, 13, 15, 15]]); dokuBoya(p, T.minder_k, [[3, 3, 13, 8], [3, 7, 13, 10, 0.85]]); },
  hali: (p, id) => dokuBoya(p, YUZ_DOKU[id * 6], [[1, 9, 15, 13], [2, 13, 14, 14, 0.75]]),
  saksi: (p, id) => { dokuBoya(p, T.saksi, [[4, 10, 12, 15]]); dokuBoya(p, T.yun_y, [[7, 5, 9, 10], [5, 7, 7, 8]]); dokuBoya(p, T[BLOKLAR[id].cicek], [[5, 2, 11, 5]]); },
  lamba: (p, id) => { dokuBoya(p, T.lamba, [[4, 2, 12, 8]]); dokuBoya(p, T.demir_cubuk, [[7, 8, 9, 14], [5, 14, 11, 15]]); },
  tablo: (p, id) => dokuBoya(p, YUZ_DOKU[id * 6 + 4], [[1, 1, 15, 15]]),
  tencere: (p, id) => { dokuBoya(p, T.tencere, [[3, 6, 13, 14], [1, 7, 3, 9], [13, 7, 15, 9]]); dokuBoya(p, T.tencere_ust, [[3, 4, 13, 6]]); },
  kazik: (p, id) => dokuBoya(p, YUZ_DOKU[id * 6], [[3, 6, 13, 15], [4, 3, 12, 6], [6, 1, 10, 3]]),
  korkuluk: (p, id) => dokuBoya(p, YUZ_DOKU[id * 6], [[1, 3, 5, 15], [11, 3, 15, 15], [5, 6, 11, 14, 0.85]]),
  tirmanma: (p, id) => dokuBoya(p, YUZ_DOKU[id * 6], [[0, 0, 16, 16]]),
  ors: (p, id) => dokuBoya(p, YUZ_DOKU[id * 6], [[1, 3, 15, 7], [6, 7, 10, 10, 0.85], [4, 10, 12, 11, 0.8], [3, 11, 13, 14, 0.9]]),
  gunes: p => { dokuBoya(p, T.gunes_panel, [[1, 4, 15, 8]]); dokuBoya(p, T.panel_yan, [[1, 8, 15, 9, 0.8]]); dokuBoya(p, T.demir_cubuk, [[7, 9, 9, 14]]); dokuBoya(p, T.panel_yan, [[4, 14, 12, 15]]); },
  ruzgar: p => { dokuBoya(p, T.demir_cubuk, [[7, 9, 9, 15]]); dokuBoya(p, T.turbin_govde, [[5, 6, 12, 9]]); dokuBoya(p, T.turbin_pervane, [[0, 0, 16, 16]]); },
  batarya: (p, id, boyut) => { const k = [[3, 9], [2, 13], [1, 15]][boyut ?? BLOKLAR[id].boyut], a = k[0], h = k[1]; dokuBoya(p, T.batarya_yan4, [[a, 16 - h, 16 - a, 16]]); dokuBoya(p, T.demir_cubuk, [[a + 2, 15 - h, a + 4, 16 - h]]); dokuBoya(p, T.salter_a, [[12 - a, 15 - h, 14 - a, 16 - h]]); },
  ekablo: p => { dokuBoya(p, T.ekablo, [[1, 6, 15, 10]]); for (let x = 1; x < 15; x += 4) p.set(x, 6, [232, 192, 64]); },
  salter: (p, id) => { dokuBoya(p, T.salter_govde, [[3, 2, 12, 14]]); dokuBoya(p, T.salter_on, [[4, 3, 11, 13]]); dokuBoya(p, T.demir_cubuk, [[12, 5, 14, 9]]); dokuBoya(p, T.led_kirmizi, [[12, 3, 15, 5]]); dokuBoya(p, T.led_yesil, [[5, 4, 7, 5]]); },
  jenerator: p => { dokuBoya(p, T.jen_govde, [[2, 5, 14, 13]]); dokuBoya(p, T.batarya_ust, [[3, 3, 13, 5]]); dokuBoya(p, T.demir_cubuk, [[12, 0, 14, 3], [1, 13, 15, 15]]); dokuBoya(p, T.jen_on, [[4, 7, 10, 11]]); },
  eocak: p => { dokuBoya(p, T.eocak_yan, [[1, 3, 15, 15]]); dokuBoya(p, T.eocak_ust, [[1, 2, 15, 3]]); dokuBoya(p, T.batarya_ust, [[2, 4, 14, 5]]); dokuBoya(p, T.ocak_cam_a, [[4, 7, 12, 12]]); dokuBoya(p, T.demir_cubuk, [[3, 6, 13, 7], [2, 15, 14, 16]]); for (const x of [3, 6, 9]) p.set(x, 4, [200, 204, 210]); },
  eisitici: p => { dokuBoya(p, T.isitici, [[2, 2, 14, 14]]); dokuBoya(p, T.isitici_izgara_a, [[3, 4, 13, 12]]); dokuBoya(p, T.demir_cubuk, [[2, 14, 5, 16], [11, 14, 14, 16], [2, 1, 14, 2]]); },
  algilayici: p => { dokuBoya(p, T.sensor_a, [[4, 2, 12, 9]]); dokuBoya(p, T.salter_govde, [[4, 9, 12, 10]]); dokuBoya(p, T.demir_cubuk, [[7, 10, 9, 14], [5, 14, 11, 15]]); },
  fiskiye: p => { dokuBoya(p, T.demir_cubuk, [[2, 5, 14, 6], [7, 6, 9, 14], [5, 14, 11, 15]]); dokuBoya(p, T.batarya_ust, [[6, 3, 10, 6]]); for (const [x, y] of [[2, 2], [4, 1], [12, 1], [14, 3], [8, 0]]) p.set(x, y, [90, 160, 255]); },
  dagitici: (p, id) => { dokuBoya(p, T.salter_govde, [[1, 9, 15, 15]]); dokuBoya(p, T.salter_on, [[2, 8, 14, 9]]); const g = [63, 156, 255], c = [255, 157, 46]; if (BLOKLAR[id].birlestir) { p.set(4, 11, g); p.set(11, 11, g); p.set(8, 13, c); p.set(4, 12, g); p.set(11, 12, g); } else { p.set(8, 11, g); p.set(8, 12, g); p.set(3, 13, c); p.set(8, 14, c); p.set(13, 13, c); } },
  elamba: (p, id) => { dokuBoya(p, T.elamba_a, [[5, 2, 11, 8]]); dokuBoya(p, T.lamba_kap, [[6, 1, 10, 2]]); dokuBoya(p, T.demir_cubuk, [[7, 8, 9, 14], [5, 14, 11, 15]]); },
  simya: p => { dokuBoya(p, T.parke, [[2, 13, 14, 15]]); dokuBoya(p, T.demir_cubuk, [[7, 2, 9, 13]]); dokuBoya(p, T.simya_sise, [[2, 8, 6, 13], [10, 8, 14, 13]]); },
  /* 0.34.0: kompost kutusu */
  kompost: (p, id) => { dokuBoya(p, T.kompost_yan, [[1, 3, 15, 15]]); dokuBoya(p, YUZ_DOKU[id * 6 + 2], [[3, 4, 13, 7]]); dokuBoya(p, T.kalas, [[1, 2, 15, 3, 1.15]]); },
  /* 0.31.0: yapı ve dekorasyon */
  duvar: (p, id) => dokuBoya(p, YUZ_DOKU[id * 6], [[1, 4, 5, 15], [11, 4, 15, 15], [5, 6, 11, 15, 0.85], [1, 3, 5, 4, 1.15], [11, 3, 15, 4, 1.15]]),
  raf: p => { dokuBoya(p, T.kalas, [[1, 9, 15, 11]]); dokuBoya(p, T.demir_cubuk, [[2, 11, 3, 14], [13, 11, 14, 14]]); dokuBoya(p, T.kitap_sirt, [[2, 3, 8, 9], [9, 5, 13, 9]]); },
  perde: (p, id) => { dokuBoya(p, T.demir_cubuk, [[1, 1, 15, 2]]); for (let x = 2; x < 14; x++) dokuBoya(p, YUZ_DOKU[id * 6], [[x, 2, x + 1, 15, x % 2 ? 0.82 : 1]]); },
  avize: p => { dokuBoya(p, T.demir_cubuk, [[7, 0, 9, 6], [2, 9, 14, 10]]); dokuBoya(p, T.altin_blok, [[6, 6, 10, 11]]); dokuBoya(p, T.mum_govde, [[2, 6, 4, 9], [12, 6, 14, 9]]); dokuBoya(p, T.mum_alev, [[2, 4, 4, 6], [12, 4, 14, 6]]); },
  somine: (p, id) => { dokuBoya(p, T.tas_tugla, [[1, 3, 15, 15]]); dokuBoya(p, T.kesme_tas, [[0, 2, 16, 4]]); dokuBoya(p, T.somine_ic, [[4, 6, 12, 14]]); dokuBoya(p, T.kamp_atesi, [[4, 7, 12, 14]]); },
  sehpa: (p, id) => dokuBoya(p, YUZ_DOKU[id * 6], [[1, 7, 15, 9], [2, 9, 4, 14, 0.8], [12, 9, 14, 14, 0.8], [4, 11, 12, 12, 0.75]]),
  vazo: p => { dokuBoya(p, T.vazo, [[4, 8, 12, 15], [5, 6, 11, 8]]); dokuBoya(p, T.yun_y, [[7, 2, 9, 6]]); dokuBoya(p, T.yun_k, [[5, 1, 8, 4]]); dokuBoya(p, T.yun_s, [[9, 2, 12, 4]]); },
  mum: p => { dokuBoya(p, T.demir_cubuk, [[4, 14, 12, 15]]); dokuBoya(p, T.mum_govde, [[6, 5, 10, 14]]); dokuBoya(p, T.mum_alev, [[7, 2, 9, 5]]); },
  sancak: (p, id) => { dokuBoya(p, T.kalas, [[1, 0, 15, 2]]); dokuBoya(p, YUZ_DOKU[id * 6], [[3, 2, 13, 13], [4, 13, 12, 14], [5, 14, 11, 15]]); dokuBoya(p, T.altin_blok, [[7, 5, 9, 9], [6, 6, 10, 8]]); },
  /* 0.36.1: yatak (yandan görünüş: başlık, döşek, yastık, yorgan, ayaklık) */
  yatakTek: p => { dokuBoya(p, T.yatak_ahsap, [[0, 3, 2, 15], [14, 7, 16, 15], [2, 11, 14, 13], [2, 13, 3, 15, 0.8], [13, 13, 14, 15, 0.8]]);
    dokuBoya(p, T.yatak_dosek, [[2, 9, 14, 11]]); dokuBoya(p, T.yatak_yastik, [[2, 6, 6, 9]]); dokuBoya(p, T.yatak_yorgan, [[5, 7, 14, 10], [13, 7, 14, 11, 0.85]]); },
  yatak2: p => BLOK_SIMGE.yatakTek(p),
  /* 0.36.0: mutfak */
  degirmen: p => { dokuBoya(p, T.degirmen_yan, [[1, 9, 15, 15], [2, 6, 14, 9, 0.9]]); dokuBoya(p, T.degirmen_ust, [[3, 4, 13, 6]]); dokuBoya(p, T.kalas, [[11, 1, 12, 5]]); },
  pasta: p => { dokuBoya(p, T.pasta_yan, [[2, 7, 14, 14]]); dokuBoya(p, T.pasta_ust, [[2, 4, 14, 7]]); },
  semaver: p => { dokuBoya(p, T.semaver, [[4, 5, 12, 15], [6, 2, 10, 5, 1.1], [12, 10, 14, 11]]); dokuBoya(p, T.tabak, [[6, 1, 10, 2]]); },
  sepet: p => { dokuBoya(p, T.sepet, [[2, 9, 14, 15]]); dokuBoya(p, T.pasta_ic, [[3, 6, 9, 9], [8, 7, 13, 9, 1.1]]); },
  piknik: p => { dokuBoya(p, T.sepet, [[2, 6, 14, 15]]); dokuBoya(p, T.kalas, [[1, 5, 15, 6], [4, 2, 5, 5], [11, 2, 12, 5], [4, 1, 12, 2]]); },
  tandir: p => { dokuBoya(p, T.tandir, [[2, 5, 14, 15], [4, 2, 12, 5, 1.1]]); dokuBoya(p, T.kamp_atesi, [[6, 10, 10, 15]]); },
  tabak: p => { dokuBoya(p, T.tabak, [[1, 10, 15, 13]]); dokuBoya(p, T.pasta_ic, [[4, 7, 12, 10]]); },
  feslegen: p => { dokuBoya(p, T.tandir, [[5, 10, 11, 15]]); dokuBoya(p, T.feslegen, [[3, 2, 13, 10]]); },
  sarimsak: p => { dokuBoya(p, T.kalas, [[7, 0, 9, 3]]); dokuBoya(p, T.sarimsak, [[5, 3, 11, 15]]); },
  baharat: p => { dokuBoya(p, T.kalas, [[1, 10, 15, 12]]); dokuBoya(p, T.baharat, [[1, 3, 15, 10]]); },
  kavanoz: p => { dokuBoya(p, T.kavanoz, [[2, 5, 8, 15], [9, 8, 14, 15]]); },
  balKavanoz: p => { dokuBoya(p, T.kavanoz_bal, [[4, 4, 12, 15]]); },
  cuval: (p, id) => dokuBoya(p, YUZ_DOKU[id * 6 + 2], [[3, 5, 13, 15], [5, 3, 11, 5], [6, 1, 10, 3, 0.85]])
};
/* Kapı: üst ve alt dokular yarı ölçekte üst üste */
BLOK_SIMGE.kapi = p => { const t = doseme(T.kapi_ust).veri, a = doseme(T.kapi_alt).veri;
  for (let y = 0; y < 16; y++) for (let x = 0; x < 8; x++) { const kaynak = y < 8 ? t : a, sy = (y % 8) * 2, sx = x * 2, i = (sy * 16 + sx) * 4; if (kaynak[i + 3] > 100) p.set(4 + x, y, [kaynak[i], kaynak[i + 1], kaynak[i + 2]]); } };
/* 0.37.0: çok bloklu ve tek bloklu nesnelerin simgesi: kutuların eğik izdüşümü (ön yüz dokudan, üst ve yan yüz gölgeli) */
function ikon3b(p, id) {
  const D0 = COKLU[BLOKLAR[id].ck]; if (!D0) return;
  const W = D0.w * 16, H = D0.h * 16, DZ = D0.d * 16, eW = W + DZ * 0.5, eH = H + DZ * 0.5, s = 15.6 / Math.max(eW, eH), ox = (16 - eW * s) / 2, oy = (16 - eH * s) / 2;
  const doku = (t, f) => { const n = Array.isArray(t) ? t[f] : t; return doseme(T[n] ?? T.kalas).veri; };
  const ornek = (v, x, y, k) => { const i = ((((Math.floor(y) % 16) + 16) % 16) * 16 + (((Math.floor(x) % 16) + 16) % 16)) * 4; return v[i + 3] < 60 ? null : [v[i] * k, v[i + 1] * k, v[i + 2] * k]; };
  const kutular = D0.kutular.slice().sort((a, b) => ((a[2] + a[5]) / 2 - 0.4 * (a[0] + a[3]) / 2 - 0.4 * (a[1] + a[4]) / 2) - ((b[2] + b[5]) / 2 - 0.4 * (b[0] + b[3]) / 2 - 0.4 * (b[1] + b[4]) / 2));
  for (const k of kutular) {
    const [x0, y0, z0, x1, y1, z1, t] = k, on = doku(t, 4), ust = doku(t, 2), yan = doku(t, 0);
    for (let py = 0; py < 16; py++) for (let px = 0; px < 16; px++) {
      const u = (px + 0.5 - ox) / s, v = (16 - (py + 0.5) - oy) / s;
      let c = null;
      /* ön yüz (z = z1) */
      { const q = (DZ - z1) * 0.5, x = u - q, y = v - q; if (x >= x0 && x <= x1 && y >= y0 && y <= y1) c = ornek(on, x, 15 - y, 1); }
      /* üst yüz (y = y1) */
      if (!c) { const q = v - y1, z = DZ - 2 * q, x = u - q; if (z >= z0 && z <= z1 && x >= x0 && x <= x1) c = ornek(ust, x, z, 1.12); }
      /* sağ yan yüz (x = x1) */
      if (!c) { const q = u - x1, z = DZ - 2 * q, y = v - q; if (z >= z0 && z <= z1 && y >= y0 && y <= y1) c = ornek(yan, z, 15 - y, 0.74); }
      if (c) p.set(px, py, c);
    }
  }
}
export function simge(id) {
  if (SIMGE[id]) return SIMGE[id];
  const e = ESYALAR[id];
  let cv;
  if (!e) cv = pikselSimge(p => cokgen(p, [[3, 3], [13, 3], [13, 13], [3, 13]], '#ff00ff'));
  else if (e.tur === 'blok' && BLOKLAR[id].sekil === 'sandik') cv = izometrik(id);
  else if (e.tur === 'blok' && BLOKLAR[id].ikon3b) cv = pikselSimge(p => ikon3b(p, id));   // 0.37.0
  else if (e.tur === 'blok') cv = BLOK_SIMGE[BLOKLAR[id].sekil] ? pikselSimge(p => BLOK_SIMGE[BLOKLAR[id].sekil](p, id)) : CIZIM[id] === C_KUP ? izometrik(id) : duz(YUZ_DOKU[id * 6 + 2]);
  else if (e.tur === 'alet') cv = pikselSimge(p => ALET_CIZ[e.simge && ALET_CIZ[e.simge] ? e.simge : e.alet.tur](p, e.renk));
  else cv = pikselSimge((MAL_CIZ[e.simge] || MAL_CIZ.komur)(e));
  SIMGE[id] = { cv, url: cv.toDataURL() };
  return SIMGE[id];
}
