/* HungerMan - Rust tarzı elektrik kabloları ve bağlantı noktaları (0.26.0; 0.27.0: giriş / çıkış noktaları, sarkma ayarı)
   Her elektrikli cihazın ayrı GİRİŞ ve ÇIKIŞ noktaları vardır (PORT tablosu). Kablo, bir çıkıştan bir girişe çekilir; güç çıkıştan girişe akar.
   Her bağlantı noktasına tek kablo takılır. Kablo, isteğe bağlı ara noktalardan geçer; her parçanın sarkması ayrı ayarlanır (0: gergin, düz).
   Sınırlar: bir parça en çok 16, bütün kablo en çok 40 blok. Her 3 blok için 1 Elektrik Kablosu harcanır.
   Kayıt: [no, a, a noktası, b, b noktası, ara noktalar, sarkmalar, uzunluk]; a çıkış, b giriş tarafıdır.
   Çok oyunculuda sunucu tutar ve istemcilere dağıtır. */
import { BLOKLAR } from '../bloklar.js';
import { CIHAZ, kokKonumu, dondurXZ } from '../cihazlar.js';

export const KABLO = { parca: 16, toplam: 40, esya: 503, bloktaBir: 3, sarkmaUst: 3, direkParca: 32, direkToplam: 64 };   // 0.53.0: iki elektrik direği arasında daha uzun
const C = k => String(k).split(',').map(Number);

/* Bağlantı noktaları: [tür, yerel konum] (yön 0; çok bloklu cihazlarda kök hücreye, diğerlerinde hücreye göre) */
const G = (x, y, z) => ['giris', [x, y, z]], K = (x, y, z) => ['cikis', [x, y, z]];
export const PORT = {
  gunes: [K(1.76, 0.3, 0.9)],
  ruzgar: [K(1, 0.5, 1.4)],
  su: [K(1.5, 1.8, 1.02)],
  bataryaK: [G(0.28, 0.85, 0.48), K(0.72, 0.85, 0.48)],
  bataryaO: [G(0.38, 1.8, 0.5), K(0.62, 1.8, 0.5)],
  bataryaB: [G(0.3, 1.74, 0.07), K(1.7, 1.74, 0.07)],
  salter0: [G(0.3, 0.1, 0.78), K(0.7, 0.1, 0.78)],
  salter1: [G(0.3, 0.23, 0.6), K(0.7, 0.23, 0.6)],
  salterEski: [G(0.3, 1.02, 0.5), K(0.7, 1.02, 0.5)],
  lamba0: [G(0.36, 0.09, 0.5), K(0.64, 0.09, 0.5)],
  lamba1: [G(0.4, 0.93, 0.5), K(0.6, 0.93, 0.5)],
  lamba2: [G(0.42, 0.29, 0.96), K(0.58, 0.29, 0.96)],
  ocak: [G(0.3, 0.2, 0.97), K(0.7, 0.2, 0.97)],         // 0.29.0: arka altta
  isitici: [G(0.36, 0.22, 0.66), K(0.64, 0.22, 0.66)],
  dagitici: [G(0.5, 0.2, 0.86), K(0.24, 0.2, 0.14), K(0.5, 0.2, 0.14), K(0.76, 0.2, 0.14)],
  birlestirici: [G(0.3, 0.2, 0.86), G(0.7, 0.2, 0.86), K(0.5, 0.2, 0.14)],
  jenerator: [K(0.84, 0.42, 0.16)],
  taret: [G(0.3, 0.06, 0.87), K(0.7, 0.06, 0.87)],
  algilayici0: [G(0.42, 0.3, 0.97), K(0.58, 0.3, 0.97)],
  algilayici1: [G(0.36, 0.07, 0.5), K(0.64, 0.07, 0.5)],
  fiskiye: [G(0.36, 0.07, 0.5), K(0.64, 0.07, 0.5)],
  /* 0.52.0: LED panel (güney yüzü), projektör ve mutfak cihazları (arka), vantilatör (üst) */
  ledpanel: [G(0.3, 0.5, 1.01), K(0.7, 0.5, 1.01)],
  projektor: [G(0.3, 0.3, -0.01), K(0.7, 0.3, -0.01)],
  vantilator: [G(0.3, 1.01, 0.5), K(0.7, 1.01, 0.5)],
  mutfak52: [G(0.36, 0.1, 0.16), K(0.64, 0.1, 0.16)],
  /* 0.53.0: Şebeke güncellemesi. Çok bloklu cihazlarda konumlar kök hücrenin köşesine göredir (ön -z) */
  buhar: [K(2.47, 1.33, 0.62)],
  jeotermal: [K(1, 0.93, 0.3)],
  takip: [K(1, 0.6, 0.79)],
  paratoner: [K(0.5, 0.5, 0.1)],
  konteyner: [G(0.42, 1.62, 0.1), K(0.72, 1.62, 0.1)],
  direk: [G(-0.45, 6.78, 0.5), K(0.5, 6.78, 0.5), K(1.45, 6.78, 0.5)],
  olcer: [G(0.32, 0.58, 0.62), K(0.68, 0.58, 0.62)],
  tv: [G(0.42, 0.26, 0.92), K(0.62, 0.26, 0.92)],
  camasir: [G(0.36, 0.16, 0.94), K(0.64, 0.16, 0.94)],
  kepenk: [G(1.93, 0.5, 0.28), K(1.93, 0.8, 0.28)],
  kamera: [G(0.42, 0.1, 0.33), K(0.58, 0.1, 0.33)],
  monitor: [G(0.42, 0.22, 0.6), K(0.58, 0.22, 0.6)],
  alarm: [G(0.36, 0.16, 0.82), K(0.64, 0.16, 0.82)],
  ark: [G(0.7, 0.55, 1.97), K(1.3, 0.55, 1.97)],
  kereste: [G(0.3, 0.3, 0.92), K(0.55, 0.3, 0.92)],
  kirici: [G(0.4, 0.3, 0.94), K(0.6, 0.3, 0.94)],
  matkap: [G(2.35, 1.17, 2.5), K(2.65, 1.17, 2.5)],
  pompa: [G(0.4, 0.95, 0.89), K(0.6, 0.95, 0.89)],
  sokak: [G(0.44, 0.6, 0.6), K(0.56, 0.9, 0.6)],
  /* Tek bloklu parçalar: mantık kutusunun üstünde girişler batıda, çıkış doğuda */
  zamanlayici: [G(0.22, 0.29, 0.5), K(0.78, 0.29, 0.5)],
  fotosel: [G(0.22, 0.29, 0.5), K(0.78, 0.29, 0.5)],
  edugme: [G(0.22, 0.29, 0.5), K(0.78, 0.29, 0.5)],
  mantik: [G(0.22, 0.29, 0.3), G(0.22, 0.29, 0.7), K(0.78, 0.29, 0.5)],
  role: [G(0.22, 0.29, 0.3), G(0.22, 0.29, 0.7), K(0.78, 0.29, 0.5)],
  engelleyici: [G(0.22, 0.29, 0.3), G(0.22, 0.29, 0.7), K(0.78, 0.29, 0.5)],
  sigorta: [G(0.28, 0.78, 0.5), K(0.72, 0.78, 0.5)],
  klima: [G(0.36, 0.5, 0.97), K(0.64, 0.5, 0.97)],
  citunite: [G(0.3, 1.01, 0.5), K(0.7, 1.01, 0.5)],
  /* 0.53.1: Kol (taban arkası) ve Düğme (taban yanları) */
  kol: [G(0.36, 0.13, 0.7), K(0.64, 0.13, 0.7)],
  dugme: [G(0.26, 0.07, 0.5), K(0.74, 0.07, 0.5)]
};
/* 0.53.0: bağlantı noktası adları (mantık parçalarının girişleri) */
export const PORT_ETIKET = { role: ['Güç girişi', 'Sinyal girişi'], engelleyici: ['Güç girişi', 'Sinyal girişi'], mantik: ['Giriş A', 'Giriş B'] };
export const PORT_AD = { giris: 'Giriş', cikis: 'Çıkış' };
/* Bloğun bağlantı noktası listesi (yoksa boş) */
export function portlar(b) {
  if (!b || !b.elektrik || (b.cihaz && b.parca)) return [];
  const k = b.cihaz || (b.elektrik === 'salter' ? (b.sekil === 'salter' ? 'salter' + b.cesit : 'salterEski') : b.elektrik === 'lamba' ? 'lamba' + (b.cesit || 0) : b.elektrik === 'algilayici' ? 'algilayici' + b.cesit : b.elektrik);
  return PORT[k] || [];
}
/* Anahtardaki cihazın i. bağlantı noktasının dünya konumu ve türü: { p, tur } ya da null */
export function portBilgi(dunya, k, i) {
  const [x, y, z] = C(k), b = BLOKLAR[dunya.blok(x, y, z)], l = portlar(b), P = l[i];
  if (!P) return null;
  const [dx, dz] = dondurXZ(P[1][0] - 0.5, P[1][2] - 0.5, b.yon || 0);
  return { p: [x + 0.5 + dx, y + P[1][1], z + 0.5 + dz], tur: P[0] };
}
/* Bir bloğun kablo ucu anahtarı (çok bloklu cihazda kök hücre); bağlantı noktası yoksa null */
export function kabloUcu(dunya, x, y, z) {
  const b = BLOKLAR[dunya.blok(x, y, z)];
  if (!b || !b.elektrik || b.elektrik === 'kablo') return null;
  return b.cihaz && b.parca ? kokKonumu(b, x, y, z).join(',') : x + ',' + y + ',' + z;
}
export const mesafe = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export function yolUzunlugu(l) { let n = 0; for (let i = 1; i < l.length; i++) n += mesafe(l[i - 1], l[i]); return n; }
export const kabloMaliyeti = uz => Math.max(1, Math.ceil(uz / KABLO.bloktaBir));
const r2 = v => Math.round(v * 100) / 100;

export class Kablolar {
  constructor(dunya) {
    this.dunya = dunya;
    this.liste = new Map();   // no -> { i, a, ap, b, bp, n: ara noktalar, s: parça sarkmaları, uz }
    this.sira = 0; this.surum = 0;
    this.ag = null;           // sunucu: eklendi(w), silindi(i)
  }
  ekle(a, ap, b, bp, n = [], s = [], i, uz) {
    if (i == null) i = ++this.sira; else this.sira = Math.max(this.sira, i);
    const w = { i, a, ap, b, bp, n: n.map(p => p.map(r2)), s: Array.from({ length: n.length + 1 }, (_, j) => Math.max(0, Math.min(KABLO.sarkmaUst, +s[j] || 0))), uz: Math.round((uz ?? 3) * 10) / 10 };
    this.liste.set(i, w); this.surum++;
    if (this.ag && this.ag.eklendi) this.ag.eklendi(w);
    return w;
  }
  sil(i) {
    const w = this.liste.get(i);
    if (!w) return null;
    this.liste.delete(i); this.surum++;
    if (this.ag && this.ag.silindi) this.ag.silindi(i);
    return w;
  }
  dizi(w) { return [w.i, w.a, w.ap, w.b, w.bp, w.n, w.s, w.uz]; }
  cihazKablolari(k) { const l = []; for (const w of this.liste.values()) if (w.a === k || w.b === k) l.push(w); return l; }
  /* Bağlantı noktasına takılı kablo (yoksa null) */
  portKablosu(k, i) { for (const w of this.liste.values()) if ((w.a === k && w.ap === i) || (w.b === k && w.bp === i)) return w; return null; }
  /* Kablonun bütün noktaları (uçlar dahil); uç cihaz yüklü değilse null */
  noktalar(w) {
    const a = portBilgi(this.dunya, w.a, w.ap), b = portBilgi(this.dunya, w.b, w.bp);
    return a && b ? [a.p, ...w.n, b.p] : null;
  }
  uzunluk(w) { const l = this.noktalar(w); return l ? yolUzunlugu(l) : 0; }
  disaAktar() { return [...this.liste.values()].map(w => this.dizi(w)); }
  iceAktar(l) {
    this.liste.clear(); this.sira = 0;
    for (const v of Array.isArray(l) ? l : []) {
      if (!Array.isArray(v)) continue;
      const nok = p => (Array.isArray(p) ? p.filter(q => Array.isArray(q) && q.length === 3 && q.every(Number.isFinite)).slice(0, 10) : []);
      let w;
      if (typeof v[1] === 'string' && typeof v[3] === 'string') w = { i: +v[0], a: v[1], ap: +v[2] || 0, b: v[3], bp: +v[4] || 0, n: nok(v[5]), s: Array.isArray(v[6]) ? v[6].map(Number) : [], uz: +v[7] || 3 };
      else if (typeof v[1] === 'string' && typeof v[2] === 'string') w = { i: +v[0], a: v[1], ap: -1, b: v[2], bp: -1, n: nok(v[3]), s: [], uz: +v[4] || 3, eski: true };   // 0.26.0 kaydı: noktalar sonra atanır
      else continue;
      if (!w.s.length) w.s = Array.from({ length: w.n.length + 1 }, () => 0.4);
      this.liste.set(w.i, w); this.sira = Math.max(this.sira, w.i);
    }
    this.surum++;
  }
  /* 0.26.0 kablolarına bağlantı noktası atar (uçlar yüklendiğinde): a'nın boş çıkışı, b'nin boş girişi; uymazsa yön çevrilir */
  eskileriAta() {
    for (const w of [...this.liste.values()]) {
      if (!w.eski) continue;
      const [ax, ay, az] = C(w.a), [bx, by, bz] = C(w.b);
      if (!this.dunya.yuklu(ax, az) || !this.dunya.yuklu(bx, bz)) continue;
      const bos = (k, tur) => portlar(BLOKLAR[this.dunya.blok(...C(k))]).findIndex((P, i) => P[0] === tur && !this.portKablosu(k, i));
      let ap = bos(w.a, 'cikis'), bp = bos(w.b, 'giris');
      if (ap < 0 || bp < 0) { const a2 = bos(w.b, 'cikis'), b2 = bos(w.a, 'giris'); if (a2 >= 0 && b2 >= 0) { [w.a, w.b] = [w.b, w.a]; w.n.reverse(); ap = a2; bp = b2; } }
      if (ap < 0 || bp < 0) { this.sil(w.i); continue; }
      w.ap = ap; w.bp = bp; delete w.eski; this.surum++;
    }
  }
}
