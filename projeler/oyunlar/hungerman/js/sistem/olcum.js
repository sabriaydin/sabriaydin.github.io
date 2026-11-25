/* HungerMan - 0.50.0: performans ölçümü
   Açıkken (konsolda "olcum ac" ya da F3 panelinde) oyunun başlıca işleri sarılır ve her birinin kare başına ortalama süresi tutulur.
   Kapalıyken hiçbir yük getirmez (sarmalar kaldırılır). Rapor: en pahalı işler, kare süresi, çizim çağrısı, üçgen, bellek. */
export class Olcum {
  constructor() { this.acik = false; this.sarilar = []; this.veri = new Map(); this.kare = 0; this.kareSure = 0; this.kareEn = 0; this.ornek = []; }
  /* nesne.ad işlevini sarar; etiket raporda görünen addır */
  sar(nesne, ad, etiket) {
    if (!nesne || typeof nesne[ad] !== 'function' || nesne[ad].__olcum) return;
    const asil = nesne[ad], V = this.veri, self = this;
    const s = function (...a) {
      if (!self.acik) return asil.apply(this, a);
      const t = performance.now();
      try { return asil.apply(this, a); }
      finally { const d = performance.now() - t, q = V.get(etiket) || { top: 0, n: 0, en: 0 }; q.top += d; q.n++; if (d > q.en) q.en = d; V.set(etiket, q); }
    };
    s.__olcum = true; nesne[ad] = s; this.sarilar.push([nesne, ad, asil]);
  }
  /* liste: [[nesne, işlev adı, etiket], ...] */
  ac(liste) { this.kapat(); this.acik = true; this.sifirla(); for (const [n, a, e] of liste) this.sar(n, a, e); }
  kapat() { for (const [n, a, asil] of this.sarilar) n[a] = asil; this.sarilar = []; this.acik = false; }
  sifirla() { this.veri.clear(); this.kare = 0; this.kareSure = 0; this.kareEn = 0; this.ornek = []; }
  /* Her kare sonunda: d kare içi işlerin toplam süresi (ms) */
  kareBitti(d) { if (!this.acik) return; this.kare++; this.kareSure += d; if (d > this.kareEn) this.kareEn = d; this.ornek.push(d); if (this.ornek.length > 600) this.ornek.shift(); }
  rapor(cizici) {
    const n = Math.max(1, this.kare), l = [...this.veri.entries()].map(([ad, q]) => ({ ad, ms: q.top / n, en: q.en, cagri: q.n / n })).sort((a, b) => b.ms - a.ms);
    const s = [...this.ornek].sort((a, b) => a - b), p95 = s.length ? s[Math.floor(s.length * 0.95)] : 0;
    const bellek = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null;
    const ci = cizici && cizici.info ? { cagri: cizici.info.render.calls, ucgen: cizici.info.render.triangles, geo: cizici.info.memory.geometries, doku: cizici.info.memory.textures } : null;
    return { kare: this.kare, ortalama: this.kareSure / n, p95, en: this.kareEn, isler: l, bellek, cizim: ci };
  }
  metin(cizici) {
    const r = this.rapor(cizici), f = v => v.toFixed(2).replace('.', ',');
    const satir = [`Ölçülen kare: ${r.kare} · kare içi iş ortalama ${f(r.ortalama)} ms · %95: ${f(r.p95)} ms · en uzun ${f(r.en)} ms`];
    if (r.cizim) satir.push(`Çizim çağrısı ${r.cizim.cagri} · üçgen ${Math.round(r.cizim.ucgen / 1000)} bin · geometri ${r.cizim.geo} · doku ${r.cizim.doku}`);
    if (r.bellek != null) satir.push(`Bellek (JS yığını) ${r.bellek} MB`);
    satir.push('En pahalı işler (kare başına ortalama):');
    r.isler.slice(0, 10).forEach((q, i) => satir.push(`${i + 1}. ${q.ad}: ${f(q.ms)} ms (en çok ${f(q.en)} ms)`));
    return satir.join('\n');
  }
}
export const olcum = new Olcum();
