/* HungerMan - prosedürel dokular: tüm blok dokuları, eşya simgeleri ve kırılma çatlakları kodla çizilir (dış görsel dosyası yoktur) */
import { DOKULAR, T, BLOKLAR, ESYALAR, CIZIM, C_KUP, YUZ_DOKU, YUN_RENKLERI } from '../bloklar.js';
import { uretec } from '../rastgele.js';

const D = 16;

/* ---------- Renk yardımcıları ---------- */
function hex(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
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
  tuval() { const cv = document.createElement('canvas'); cv.width = cv.height = D; cv.getContext('2d').putImageData(new ImageData(this.d, D, D), 0, 0); return cv; }
}

/* ---------- Döşeme ressamları ---------- */
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
  masa_ust: p => { kalas(p, '#b48a52'); const k = hex('#5a3d1f'); for (let i = 0; i < 16; i++) { p.set(i, 0, k); p.set(i, 15, k); p.set(0, i, k); p.set(15, i, k); } cizgi(p, 3, 3, 12, 3, k); cizgi(p, 3, 7, 12, 7, k); },
  masa_yan: p => { kalas(p, '#a07a46'); const k = hex('#5a3d1f'); for (let i = 0; i < 16; i++) p.set(i, 0, k); const m = hex('#888'); cizgi(p, 3, 5, 6, 5, m); cizgi(p, 4, 5, 4, 10, hex('#6b4a28')); cizgi(p, 10, 4, 12, 6, m); cizgi(p, 11, 6, 11, 11, hex('#6b4a28')); },
  masa_on: p => { RESSAM.masa_yan(p); const m = hex('#9a9a9a'); for (let y = 4; y < 8; y++) cizgi(p, 8, y, 13, y, m); cizgi(p, 7, 5, 7, 11, hex('#6b4a28')); },
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
  mesale: p => bitki(p, p => { const c = hex('#7b5a32'); for (let y = 6; y < 16; y++) { p.set(7, y, karis(c, 1.05)); p.set(8, y, karis(c, 0.8)); } const a = [[7, 5, '#ffd257'], [8, 5, '#ffb52e'], [7, 4, '#ffe680'], [8, 4, '#ffcf4a'], [7, 3, '#fff2b0'], [8, 3, '#ff9a1f'], [7, 2, '#ffe680']]; for (const [x, y, r] of a) p.set(x, y, hex(r)); })
};
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

/* ---------- Atlas ---------- */
let ATLAS = null;
const DOSEME = [];
export function atlas() {
  if (ATLAS) return ATLAS;
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const ctx = cv.getContext('2d');
  DOKULAR.forEach((ad, i) => {
    const p = new Piksel(1000 + i * 31);
    (RESSAM[ad] || (q => q.doldur('#ff00ff')))(p);
    const t = p.tuval();
    DOSEME[i] = t;
    ctx.drawImage(t, (i & 15) * 16, (i >> 4) * 16);
  });
  ATLAS = cv;
  return cv;
}
export const doseme = i => (atlas(), DOSEME[i]);

/* Blok parçacıkları için ortalama renk */
const ORT = {};
export function blokRengi(id) {
  if (ORT[id]) return ORT[id];
  const t = doseme(YUZ_DOKU[id * 6]);
  const d = t.getContext('2d').getImageData(0, 0, 16, 16).data;
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
  kazma: (p, r) => { kalinCizgi(p, [[2, 14], [10, 6]], SAP); kalinCizgi(p, [[5, 3], [8, 2], [11, 3], [13, 5], [14, 8], [13, 11]], r, true); },
  balta: (p, r) => { kalinCizgi(p, [[2, 14], [11, 5]], SAP); cokgen(p, [[7, 6], [5, 3], [6, 1], [9, 0], [11, 2], [12, 4], [10, 6], [9, 7]], r); },
  kurek: (p, r) => { kalinCizgi(p, [[2, 14], [9, 7]], SAP); cokgen(p, [[8, 6], [9, 3], [12, 1], [14, 2], [14, 5], [12, 8], [10, 8]], r); },
  capa: (p, r) => { kalinCizgi(p, [[2, 14], [11, 5]], SAP); cokgen(p, [[8, 4], [10, 2], [14, 3], [13, 6], [11, 5]], r); },
  kilic: (p, r) => { kalinCizgi(p, [[4, 11], [13, 2]], r, true); kalinCizgi(p, [[1, 14], [4, 11]], SAP); kalinCizgi(p, [[3, 8], [7, 12]], '#5a4a3a'); }
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
  ok: () => p => { kalinCizgi(p, [[3, 13], [11, 5]], '#8a6034'); cokgen(p, [[10, 3], [14, 2], [13, 6]], '#4a4a50', 0); cizgi(p, 2, 11, 4, 13, [240, 240, 235]); cizgi(p, 3, 10, 5, 12, [220, 220, 215]); },
  zirh0: e => p => { cokgen(p, [[3, 9], [3, 5], [6, 2], [10, 2], [13, 5], [13, 9], [11, 9], [11, 7], [5, 7], [5, 9]], e.renk, 0.08); },
  zirh1: e => p => { cokgen(p, [[2, 3], [6, 3], [8, 5], [10, 3], [14, 3], [14, 7], [12, 7], [12, 14], [4, 14], [4, 7], [2, 7]], e.renk, 0.08); },
  zirh2: e => p => { cokgen(p, [[4, 2], [12, 2], [12, 14], [9, 14], [8, 6], [7, 14], [4, 14]], e.renk, 0.08); },
  zirh3: e => p => { cokgen(p, [[2, 7], [5, 7], [5, 11], [7, 11], [7, 14], [2, 14]], e.renk, 0.08); cokgen(p, [[9, 7], [12, 7], [12, 11], [14, 11], [14, 14], [9, 14]], e.renk, 0.08); },
  sikke: () => p => { for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const d = Math.hypot(x - 7.5, y - 7.5); if (d < 6) p.set(x, y, d > 4.8 ? [190, 140, 30] : karis([245, 200, 60], 0.95 + p.r() * 0.1)); } cizgi(p, 6, 5, 6, 10, [190, 140, 30]); cizgi(p, 9, 5, 9, 10, [190, 140, 30]); p.set(5, 5, [255, 240, 170]); },
  iksir: e => p => { cokgen(p, [[6, 2], [10, 2], [10, 5], [13, 8], [13, 13], [3, 13], [3, 8], [6, 5]], '#cfe6f0', 0.02); cokgen(p, [[4, 8], [12, 8], [12, 12], [4, 12]], e.renk || '#d8263a', 0.08); cizgi(p, 6, 2, 9, 2, [150, 100, 60]); p.set(5, 9, [255, 180, 190]); },
  altin_elma: () => p => { cokgen(p, [[4, 6], [7, 5], [8, 6], [9, 5], [12, 6], [13, 10], [11, 14], [8, 13], [5, 14], [3, 10]], '#f4c63a', 0.08); cizgi(p, 8, 5, 8, 3, hex('#5a3d1f')); p.set(9, 3, hex('#3f8a2d')); p.set(5, 8, [255, 250, 200]); },
  bugday: () => p => { const c = hex('#d8b24a'); for (let i = 0; i < 4; i++) { cizgi(p, 3 + i * 2, 14, 6 + i * 2, 4, karis(c, 0.85 + i * 0.07)); p.set(6 + i * 2, 3, [240, 210, 110]); } cizgi(p, 3, 11, 11, 11, hex('#a6702e')); },
  tohum: () => p => { const c = hex('#7aa83a'); for (const [x, y] of [[5, 6], [9, 5], [7, 9], [11, 9], [4, 11], [9, 12]]) { p.set(x, y, c); p.set(x + 1, y, karis(c, 0.8)); p.set(x, y + 1, karis(c, 0.9)); } },
  ekmek: () => p => { cokgen(p, [[2, 9], [4, 6], [9, 4], [13, 5], [14, 8], [12, 11], [6, 12], [3, 12]], '#c98a3e', 0.08); cizgi(p, 6, 7, 7, 9, [150, 95, 40]); cizgi(p, 9, 6, 10, 8, [150, 95, 40]); },
  mektup: () => p => { cokgen(p, [[2, 4], [14, 4], [14, 12], [2, 12]], '#efe6cf', 0.03); cizgi(p, 2, 4, 8, 9, [170, 150, 110]); cizgi(p, 14, 4, 8, 9, [170, 150, 110]); p.set(8, 10, [180, 40, 40]); p.set(7, 10, [180, 40, 40]); },
  kemik: () => p => { kalinCizgi(p, [[4, 12], [11, 5]], '#e8e4d6'); for (const [x, y] of [[3, 11], [4, 13], [2, 12], [11, 3], [12, 5], [13, 4]]) p.set(x, y, [232, 228, 214]); },
  kemik_tozu: () => p => { for (let i = 0; i < 40; i++) { const a = p.r() * Math.PI * 2, r = p.r() * 5; p.set(Math.round(8 + Math.cos(a) * r), Math.round(9 + Math.sin(a) * r * 0.7), karis([240, 238, 230], 0.85 + p.r() * 0.15)); } },
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
  corba: () => p => { cokgen(p, [[2, 7], [14, 7], [12, 12], [4, 12]], '#8a6038', 0.06); cizgi(p, 3, 7, 13, 7, hex('#b07a4a')); cizgi(p, 4, 6, 12, 6, hex('#9a6a44')); }
};

/* Biçimli blokların simgeleri: blok dokusundan alınan piksellerle yan görünüş */
function dokuBoya(p, t, kutular) {
  const d = doseme(t).getContext('2d').getImageData(0, 0, 16, 16).data;
  for (const [x0, y0, x1, y1, k = 1] of kutular) for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = (y * 16 + x) * 4;
    if (d[i + 3] > 100) p.set(x, y, karis([d[i], d[i + 1], d[i + 2]], k));
  }
}
const BLOK_SIMGE = {
  merdiven: (p, id) => dokuBoya(p, YUZ_DOKU[id * 6], [[2, 8, 14, 14], [8, 2, 14, 8, 0.85]]),
  yarim: (p, id) => dokuBoya(p, YUZ_DOKU[id * 6], [[1, 8, 15, 14]]),
  cit: (p, id) => dokuBoya(p, YUZ_DOKU[id * 6], [[2, 2, 5, 15], [11, 2, 14, 15], [5, 5, 11, 7, 0.85], [5, 10, 11, 12, 0.85]]),
  citKapi: (p, id) => dokuBoya(p, YUZ_DOKU[id * 6], [[1, 4, 3, 14], [13, 4, 15, 14], [3, 5, 13, 7, 0.85], [3, 10, 13, 12, 0.85], [7, 7, 9, 10, 0.85]]),
  bolme: (p, id) => { dokuBoya(p, YUZ_DOKU[id * 6], [[2, 1, 14, 15]]); for (let y = 1; y < 15; y++) { p.set(2, y, [210, 235, 245]); p.set(13, y, [210, 235, 245]); } },
  tuzak: (p, id) => dokuBoya(p, YUZ_DOKU[id * 6], [[1, 1, 15, 15]]),
  tirmanma: (p, id) => dokuBoya(p, YUZ_DOKU[id * 6], [[0, 0, 16, 16]]),
  ors: (p, id) => dokuBoya(p, YUZ_DOKU[id * 6], [[1, 3, 15, 7], [6, 7, 10, 10, 0.85], [4, 10, 12, 11, 0.8], [3, 11, 13, 14, 0.9]]),
  simya: p => { dokuBoya(p, T.parke, [[2, 13, 14, 15]]); dokuBoya(p, T.demir_cubuk, [[7, 2, 9, 13]]); dokuBoya(p, T.simya_sise, [[2, 8, 6, 13], [10, 8, 14, 13]]); }
};
/* Kapı: üst ve alt dokular yarı ölçekte üst üste */
BLOK_SIMGE.kapi = p => { const t = doseme(T.kapi_ust).getContext('2d').getImageData(0, 0, 16, 16).data, a = doseme(T.kapi_alt).getContext('2d').getImageData(0, 0, 16, 16).data;
  for (let y = 0; y < 16; y++) for (let x = 0; x < 8; x++) { const kaynak = y < 8 ? t : a, sy = (y % 8) * 2, sx = x * 2, i = (sy * 16 + sx) * 4; if (kaynak[i + 3] > 100) p.set(4 + x, y, [kaynak[i], kaynak[i + 1], kaynak[i + 2]]); } };
export function simge(id) {
  if (SIMGE[id]) return SIMGE[id];
  const e = ESYALAR[id];
  let cv;
  if (!e) cv = pikselSimge(p => cokgen(p, [[3, 3], [13, 3], [13, 13], [3, 13]], '#ff00ff'));
  else if (e.tur === 'blok' && BLOKLAR[id].sekil === 'sandik') cv = izometrik(id);
  else if (e.tur === 'blok') cv = BLOK_SIMGE[BLOKLAR[id].sekil] ? pikselSimge(p => BLOK_SIMGE[BLOKLAR[id].sekil](p, id)) : CIZIM[id] === C_KUP ? izometrik(id) : duz(YUZ_DOKU[id * 6 + 2]);
  else if (e.tur === 'alet') cv = pikselSimge(p => ALET_CIZ[e.alet.tur](p, e.renk));
  else cv = pikselSimge((MAL_CIZ[e.simge] || MAL_CIZ.komur)(e));
  SIMGE[id] = { cv, url: cv.toDataURL() };
  return SIMGE[id];
}
