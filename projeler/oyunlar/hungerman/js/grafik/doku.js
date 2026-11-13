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
    if (v < -0.9) p.set(x, y, [0, 0, 0], 0); else p.set(x, y, karis(v > 0.6 ? [214, 120, 255] : v > -0.2 ? [150, 60, 220] : [96, 30, 160], 0.9 + p.r() * 0.2)); } },
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

/* ---------- 0.18.0: Mevsim dokuları ----------
   Çimen, yaprak ve otların renkleri mevsime göre yeniden boyanır (0 ilkbahar, 1 yaz: özgün dokular, 2 sonbahar, 3 kış).
   İlkbaharda meşe ve huş yapraklarında çiçekler, sonbaharda kızıl ve sarı yapraklar, kışın seyrek ve solgun yapraklar görülür. */
const serpis = (p, renkler, adet) => { for (let i = 0; i < adet; i++) { const x = Math.floor(p.r() * D), y = Math.floor(p.r() * D); if (p.al(x, y)[3] > 0) p.set(x, y, karis(hex(renkler[i % renkler.length]), 0.9 + p.r() * 0.2)); } };
const cimUst = (taban, koyu, acik) => p => { p.doldur(taban, 0.14); p.lekeler(koyu, 20, 1); p.lekeler(acik, 12, 1); };
const cimYan = renk => p => { RESSAM.toprak(p); const g = hex(renk); for (let x = 0; x < D; x++) { const h = 3 + Math.floor(p.r() * 2.2); for (let y = 0; y < h; y++) p.set(x, y, karis(g, 0.82 + p.r() * 0.35)); } };
const ot = renk => p => bitki(p, p => { const c = hex(renk); for (let i = 0; i < 9; i++) { let x = 2 + Math.floor(p.r() * 12); const h = 6 + Math.floor(p.r() * 9); for (let y = 15; y > 15 - h; y--) { p.set(x, y, karis(c, 0.75 + p.r() * 0.45)); if (p.r() < 0.25) x += p.r() < 0.5 ? -1 : 1; } } });
const MEVSIM_RESSAM = {
  cimen_ust: [p => { cimUst('#66b040', '#55a034', '#7cc252')(p); serpis(p, ['#f2e65a', '#f0f0f0', '#e86a8a'], 5); }, null, cimUst('#8c9a40', '#7a8834', '#a8a84c'), cimUst('#7e8e6c', '#6c7c5c', '#929e80')],
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
    ctx.clearRect((i & 15) * 16, (i >> 4) * 16, 16, 16);
    ctx.drawImage(t, (i & 15) * 16, (i >> 4) * 16);
  }
  return true;
}

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
  buzyay: () => p => { const w = hex('#7fc8e8'); for (let k = 0; k <= 20; k++) { const t = k / 20, x = Math.round(3 + t * 10 + Math.sin(t * Math.PI) * 3.2), y = Math.round(13 - t * 10 + Math.sin(t * Math.PI) * 3.2); p.set(x, y, w); p.set(x + 1, y, karis(w, 0.75)); } cizgi(p, 3, 13, 13, 3, [235, 250, 255]); p.set(8, 4, [255, 255, 255]); p.set(12, 9, [255, 255, 255]); },
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
  /* 0.18.0 */
  toz: e => p => { const c = hex(e.renk || '#f2c84a'); for (let i = 0; i < 46; i++) { const a = p.r() * Math.PI * 2, r = p.r() * 5; p.set(Math.round(8 + Math.cos(a) * r), Math.round(9 + Math.sin(a) * r * 0.7), karis(c, 0.75 + p.r() * 0.4)); } },
  kor_kristal: () => p => { cokgen(p, [[8, 1], [12, 5], [11, 12], [8, 15], [5, 12], [4, 5]], '#e8501e', 0.12); cizgi(p, 8, 2, 8, 13, [255, 170, 80]); p.set(7, 4, [255, 240, 180]); p.set(6, 6, [255, 210, 140]); },
  cakmak2: () => p => { cokgen(p, [[3, 7], [9, 7], [9, 14], [3, 14]], '#b8b8c0', 0.1); cokgen(p, [[9, 4], [14, 2], [14, 7], [9, 9]], '#3c3c40', 0.12); cizgi(p, 4, 9, 8, 9, [120, 120, 130]); p.set(13, 1, [255, 200, 80]); p.set(12, 0, [255, 140, 40]); },
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
  corba2: e => p => { cokgen(p, [[2, 7], [14, 7], [12, 12], [4, 12]], '#8a6038', 0.06); const c = hex(e.renk); cizgi(p, 3, 7, 13, 7, c); cizgi(p, 4, 6, 12, 6, karis(c, 0.85)); p.set(6, 5, karis(c, 1.15)); p.set(10, 5, karis(c, 1.15)); },
  kebap: () => p => { kalinCizgi(p, [[2, 14], [14, 2]], '#b8a888'); for (const [x, y, c] of [[5, 11, '#7a3a1c'], [7, 9, '#c8a030'], [9, 7, '#7a3a1c'], [11, 5, '#c84a2a']]) for (const [a, b] of [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, -1]]) p.set(x + a, y + b, karis(hex(c), 0.9 + p.r() * 0.2)); },
  kofte: () => p => { cokgen(p, [[2, 8], [4, 5], [12, 5], [14, 8], [12, 12], [4, 12]], '#d8a050', 0.08); for (let x = 4; x < 13; x++) { p.set(x, 8, hex('#6a3418')); p.set(x, 9, hex('#7a3e1e')); } for (const x of [5, 8, 11]) p.set(x, 7, hex('#4f8a2c')); },
  recel: () => p => { cokgen(p, [[2, 9], [4, 6], [9, 4], [13, 5], [14, 8], [12, 11], [6, 12], [3, 12]], '#c98a3e', 0.08); cokgen(p, [[4, 8], [8, 6], [12, 7], [11, 10], [6, 10]], '#7a2a6a', 0.1); },
  eyer: () => p => { cokgen(p, [[2, 7], [5, 4], [11, 4], [14, 7], [13, 10], [3, 10]], '#7a4a22', 0.1); cokgen(p, [[4, 6], [12, 6], [11, 8], [5, 8]], '#9a6234', 0.05); for (let y = 10; y < 14; y++) p.set(5, y, hex('#3a2a1a')); p.set(5, 14, hex('#a8a8b0')); p.set(6, 14, hex('#a8a8b0')); },
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
  bolme: (p, id) => { dokuBoya(p, YUZ_DOKU[id * 6], [[2, 1, 14, 15]]); if (id === 109) for (let y = 1; y < 15; y++) { p.set(2, y, [210, 235, 245]); p.set(13, y, [210, 235, 245]); } },
  tuzak: (p, id) => dokuBoya(p, YUZ_DOKU[id * 6], [[1, 1, 15, 15]]),
  kol: (p, id) => { dokuBoya(p, T.parke, [[3, 12, 13, 15]]); dokuBoya(p, T.kalas, [[7, 4, 9, 12]]); dokuBoya(p, T.kol_bas, [[6, 2, 10, 5]]); },
  dugme: (p, id) => dokuBoya(p, T.tas, [[4, 6, 12, 11], [4, 10, 12, 12, 0.75]]),
  plaka: (p, id) => dokuBoya(p, T.kalas, [[1, 10, 15, 13], [1, 12, 15, 14, 0.75]]),
  kablo: (p, id) => { dokuBoya(p, T.bakir_tel_a, [[2, 7, 14, 9]]); dokuBoya(p, T.bakir_tel_k, [[5, 5, 11, 11, 0.9]]); },
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
