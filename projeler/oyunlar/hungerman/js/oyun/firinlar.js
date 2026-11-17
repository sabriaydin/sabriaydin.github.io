/* HungerMan - işleyen istasyonlar (0.33.0): Fırın ve Kamp Ateşi
   Fırın: [girdi, yakıt, çıktı]. Yakıt yandıkça girdideki malzeme partiler hâlinde pişer / erir ve çıktı yuvasında birikir
   (parti başına 5 sn; kömür 40, kütük 15, kalas 4, çubuk 1 sn yanar). Yanan yakıt, girdi kalmasa da sönene kadar yanar.
   Kamp Ateşi: [girdi, çıktı]. Yakıt gerekmez; yalnızca yiyecekleri pişirir (parti başına 8 sn).
   İçerik dünyadaki hazne olarak (dunya.sandiklar) saklanır; ilerleme ve kalan yanma süresi dunya.enerji içinde 'f:' ve 'y:' anahtarlarıyla tutulur.
   Oyuncu yanında beklemek zorunda değildir: parça yüklü kaldığı sürece işlem sürer. Tek oyunculuda ve sunucuda çalışır. */
import { BLOKLAR, ESYALAR } from '../bloklar.js';
import { YAKIT, PISIRME, PISIRME_SURE } from './kaplar.js';

export const ATES_SURE = 8;
/* Kamp ateşinde pişebilenler: çıktısı yiyecek olanlar */
export const ATESTE = id => { const q = PISIRME[id]; if (!q) return false; const e = ESYALAR[q.cikti]; return !!(e && (e.yemek || e.tur === 'yiyecek')); };
export const firinTuru = id => (BLOKLAR[id] && BLOKLAR[id].firinKap) || null;

export class Firinlar {
  constructor(o) {
    Object.assign(this, o); // dunya, sandikKilitli(k), sandikDegisti(k)
    this.sayac = 0;
    this.durum = new Map();   // k -> { yaniyor, ilerleme (0-1), yakit (0-1), pisen }
  }
  guncelle(dt) {
    this.sayac += dt;
    if (this.sayac < 0.25) return;
    const t = this.sayac; this.sayac = 0;
    const d = this.dunya;
    for (const [k, l] of d.sandiklar) {
      if (!l || l.length > 3) continue;
      const [x, y, z] = k.split(',').map(Number);
      if (!d.yuklu(x, z)) continue;
      const tur = firinTuru(d.blok(x, y, z));
      if (!tur) { this.durum.delete(k); continue; }
      if (this.sandikKilitli && this.sandikKilitli(k)) continue;
      if (tur === 'firin') this.firin(k, l, t); else this.ates(k, l, t);
    }
  }
  /* Girdi yuvasındaki malzeme çıktı yuvasına sığıyor mu */
  uygun(l, gi, ci, izin) {
    const s = l[gi], q = s && PISIRME[s.id];
    if (!q || s.adet < q.n || s.buyu || !izin(s.id)) return null;
    const c = l[ci];
    if (c && (c.id !== q.cikti || c.dayanim != null || c.adet + q.adet > ESYALAR[q.cikti].yigin)) return null;
    return q;
  }
  bitir(l, gi, ci, q, k) {
    const s = l[gi]; s.adet -= q.n; if (s.adet <= 0) l[gi] = null;
    if (l[ci]) l[ci].adet += q.adet; else l[ci] = { id: q.cikti, adet: q.adet };
    if (this.sandikDegisti) this.sandikDegisti(k);
  }
  firin(k, l, dt) {
    const d = this.dunya, yk = 'y:' + k, pk = 'f:' + k;
    let yanma = d.enerji.get(yk) || 0, ilerleme = d.enerji.get(pk) || 0, toplam = d.enerji.get('t:' + k) || 1;
    const q = this.uygun(l, 0, 2, () => true);
    /* Yakıt: yalnızca pişecek bir şey varken yeni yakıt tutuşturulur */
    if (yanma <= 0 && q && l[1] && YAKIT[l[1].id]) {
      toplam = yanma = YAKIT[l[1].id];
      l[1].adet--; if (l[1].adet <= 0) l[1] = null;
      d.enerji.set('t:' + k, toplam);
      if (this.sandikDegisti) this.sandikDegisti(k);
    }
    const yaniyor = yanma > 0;
    if (yaniyor) yanma = Math.max(0, yanma - dt);
    if (yaniyor && q) {
      ilerleme += dt;
      if (ilerleme >= PISIRME_SURE) { ilerleme = 0; this.bitir(l, 0, 2, q, k); }
    } else ilerleme = Math.max(0, ilerleme - dt * 2);
    if (yanma > 0) d.enerji.set(yk, yanma); else d.enerji.delete(yk);
    if (ilerleme > 0) d.enerji.set(pk, ilerleme); else d.enerji.delete(pk);
    this.durum.set(k, { yaniyor, ilerleme: ilerleme / PISIRME_SURE, yakit: yanma / toplam, pisen: q && l[0] ? l[0].id : 0 });
  }
  ates(k, l, dt) {
    const d = this.dunya, pk = 'f:' + k;
    let ilerleme = d.enerji.get(pk) || 0;
    const q = this.uygun(l, 0, 1, ATESTE);
    if (q) {
      ilerleme += dt;
      if (ilerleme >= ATES_SURE) { ilerleme = 0; this.bitir(l, 0, 1, q, k); }
    } else ilerleme = 0;
    if (ilerleme > 0) d.enerji.set(pk, ilerleme); else d.enerji.delete(pk);
    this.durum.set(k, { yaniyor: true, ilerleme: ilerleme / ATES_SURE, yakit: 1, pisen: q && l[0] ? l[0].id : 0 });
  }
}
