/* HungerMan - Rust tarzı elektrik kabloları (0.26.0)
   Kablolar blok değildir: kablo aracıyla bir cihazın bağlantı noktasından başka bir cihazınkine, istenirse aradaki yüzeylere
   tutturulan noktalardan geçerek çekilir ve iki nokta arasında hafifçe sarkarak çizilir (grafik/cihaz-cizici.js).
   Bir kablo iki cihazı aynı elektrik ağına bağlar (oyun/elektrik.js). Çok bloklu cihazlarda uç, cihazın kök hücresidir.
   Sınırlar: bir parça en çok 16, bütün kablo en çok 40 blok; bir cihaza en çok 6 kablo bağlanır. Her 3 blok için 1 Elektrik Kablosu harcanır.
   Kayıt: dünya kaydında [no, a, b, ara noktalar]; çok oyunculuda sunucu tutar ve istemcilere dağıtır. */
import { BLOKLAR } from '../bloklar.js';
import { CIHAZ, kokKonumu, dondurXZ } from '../cihazlar.js';

export const KABLO = { parca: 16, toplam: 40, cihaz: 6, esya: 503, bloktaBir: 3 };
const C = k => String(k).split(',').map(Number);

/* Anahtardaki cihazın kablo bağlantı noktası (dünya koordinatı); cihaz yoksa null */
export function portNoktasi(dunya, k) {
  const [x, y, z] = C(k), b = BLOKLAR[dunya.blok(x, y, z)];
  if (!b || !b.elektrik) return null;
  let p = b.port || [0.5, 0.5, 0.5], yon = b.yon || 0;
  if (b.cihaz) { const D = CIHAZ[b.cihaz]; p = D.port; const [dx, dz] = dondurXZ(p[0] - 0.5, p[2] - 0.5, yon); return [x + 0.5 + dx, y + p[1], z + 0.5 + dz]; }
  const [dx, dz] = dondurXZ(p[0] - 0.5, p[2] - 0.5, yon);
  return [x + 0.5 + dx, y + p[1], z + 0.5 + dz];
}
/* Bir bloğun kablo ucu olarak anahtarı (çok bloklu cihazda kök hücre); elektrikli değilse null */
export function kabloUcu(dunya, x, y, z) {
  const b = BLOKLAR[dunya.blok(x, y, z)];
  if (!b || !b.elektrik || b.elektrik === 'kablo') return null;
  return b.cihaz && b.parca ? kokKonumu(b, x, y, z).join(',') : x + ',' + y + ',' + z;
}
export const mesafe = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
/* Noktalar boyunca uzunluk */
export function yolUzunlugu(l) { let n = 0; for (let i = 1; i < l.length; i++) n += mesafe(l[i - 1], l[i]); return n; }
export const kabloMaliyeti = uz => Math.max(1, Math.ceil(uz / KABLO.bloktaBir));

export class Kablolar {
  constructor(dunya) {
    this.dunya = dunya;
    this.liste = new Map();   // no -> { i, a, b, n: [[x, y, z], ...] }
    this.sira = 0; this.surum = 0;
    this.ag = null;           // sunucu: eklendi(w), silindi(i)
  }
  /* uz: kablonun uzunluğu (koptuğunda geri verilecek kablo sayısı için) */
  ekle(a, b, n = [], i, uz) {
    if (i == null) i = ++this.sira; else this.sira = Math.max(this.sira, i);
    const w = { i, a, b, n: n.map(p => p.map(v => Math.round(v * 100) / 100)), uz: Math.round((uz ?? 3) * 10) / 10 };
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
  cihazKablolari(k) { const l = []; for (const w of this.liste.values()) if (w.a === k || w.b === k) l.push(w); return l; }
  /* Ağ hesabı için komşuluk: uç -> [diğer uçlar] */
  komsular() {
    const m = new Map(), ekle = (a, b) => { let l = m.get(a); if (!l) m.set(a, l = []); l.push(b); };
    for (const w of this.liste.values()) { ekle(w.a, w.b); ekle(w.b, w.a); }
    return m;
  }
  /* Kablonun bütün noktaları (uçlar dahil); uç cihaz yüklü değilse null */
  noktalar(w) {
    const a = portNoktasi(this.dunya, w.a), b = portNoktasi(this.dunya, w.b);
    return a && b ? [a, ...w.n, b] : null;
  }
  uzunluk(w) { const l = this.noktalar(w); return l ? yolUzunlugu(l) : 0; }
  disaAktar() { return [...this.liste.values()].map(w => [w.i, w.a, w.b, w.n, w.uz]); }
  iceAktar(l) {
    this.liste.clear(); this.sira = 0;
    for (const v of Array.isArray(l) ? l : []) if (Array.isArray(v) && typeof v[1] === 'string' && typeof v[2] === 'string') {
      const n = Array.isArray(v[3]) ? v[3].filter(p => Array.isArray(p) && p.length === 3 && p.every(Number.isFinite)).slice(0, 12) : [];
      this.liste.set(+v[0], { i: +v[0], a: v[1], b: v[2], n, uz: +v[4] || 3 }); this.sira = Math.max(this.sira, +v[0]);
    }
    this.surum++;
  }
}
