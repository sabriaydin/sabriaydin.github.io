/* HungerMan - envanter: 36 yuva (ilk 9 yuva hızlı erişim çubuğu), yığınlama, alet dayanımı */
import { ESYALAR, maksDayanim } from '../bloklar.js';

export const YUVA = 36;

export class Envanter {
  constructor() {
    this.yuvalar = new Array(YUVA).fill(null);
    this.zirh = [null, null, null, null];
    this.secili = 0;
    this.degisti = null;
  }
  bildir() { this.degisti && this.degisti(); }
  yigin(id) { return (ESYALAR[id] && ESYALAR[id].yigin) || 64; }
  yeni(id, adet, dayanim) {
    const e = ESYALAR[id];
    const s = { id, adet };
    const m = maksDayanim(e);
    if (m != null) s.dayanim = dayanim != null ? dayanim : m;
    return s;
  }
  /* Eşya ekler; sığmayan miktarı döndürür */
  ekle(id, adet = 1, dayanim) {
    const max = this.yigin(id);
    const sira = [...Array(YUVA).keys()];
    if (max > 1) for (const i of sira) {
      const s = this.yuvalar[i];
      if (s && s.id === id && s.adet < max) { const k = Math.min(adet, max - s.adet); s.adet += k; adet -= k; if (!adet) break; }
    }
    for (const i of sira) {
      if (!adet) break;
      if (!this.yuvalar[i]) { const k = Math.min(adet, max); this.yuvalar[i] = this.yeni(id, k, dayanim); adet -= k; }
    }
    this.bildir();
    return adet;
  }
  say(id) { let n = 0; for (const s of this.yuvalar) if (s && s.id === id) n += s.adet; return n; }
  harca(id, adet) {
    for (let i = YUVA - 1; i >= 0 && adet > 0; i--) {
      const s = this.yuvalar[i];
      if (s && s.id === id) { const k = Math.min(adet, s.adet); s.adet -= k; adet -= k; if (!s.adet) this.yuvalar[i] = null; }
    }
    this.bildir();
    return adet === 0;
  }
  bosYerVar(id, adet) {
    const max = this.yigin(id);
    let yer = 0;
    for (const s of this.yuvalar) { if (!s) yer += max; else if (s.id === id) yer += max - s.adet; if (yer >= adet) return true; }
    return false;
  }
  seciliYuva() { return this.yuvalar[this.secili]; }
  seciliId() { const s = this.yuvalar[this.secili]; return s ? s.id : 0; }
  seciliAzalt(n = 1) {
    const s = this.yuvalar[this.secili]; if (!s) return;
    s.adet -= n; if (s.adet <= 0) this.yuvalar[this.secili] = null;
    this.bildir();
  }
  /* Elde tutulan aletin dayanımını azaltır; kırılırsa true döner */
  aletYipran(n = 1) {
    const s = this.yuvalar[this.secili];
    if (!s || s.dayanim == null) return false;
    s.dayanim -= n;
    if (s.dayanim <= 0) { this.yuvalar[this.secili] = null; this.bildir(); return true; }
    this.bildir();
    return false;
  }
  /* Toplam zırh puanı (0..20) */
  zirhPuani() { let n = 0; for (const z of this.zirh) if (z) n += ESYALAR[z.id].zirh.puan; return n; }
  /* Hasar alınınca giyilen zırhlar yıpranır */
  zirhYipran(n = 1) {
    let kirildi = false;
    for (let i = 0; i < 4; i++) { const z = this.zirh[i]; if (!z) continue; z.dayanim -= n; if (z.dayanim <= 0) { this.zirh[i] = null; kirildi = true; } }
    this.bildir();
    return kirildi;
  }
  /* Elde tutulan zırhı giy (sağ tık) */
  zirhGiy() {
    const s = this.yuvalar[this.secili], e = s && ESYALAR[s.id];
    if (!e || !e.zirh) return false;
    const p = e.zirh.parca, eski = this.zirh[p];
    this.zirh[p] = s; this.yuvalar[this.secili] = eski;
    this.bildir();
    return true;
  }
  temizle() { this.yuvalar.fill(null); this.zirh = [null, null, null, null]; this.bildir(); }
  tumEsyalar() { return [...this.yuvalar, ...this.zirh].filter(Boolean); }
  disaAktar() { const f = s => (s ? [s.id, s.adet, s.dayanim ?? null] : null); return { yuvalar: this.yuvalar.map(f), zirh: this.zirh.map(f), secili: this.secili }; }
  iceAktar(o) {
    this.yuvalar = new Array(YUVA).fill(null);
    this.zirh = [null, null, null, null];
    if (o && o.yuvalar) o.yuvalar.forEach((s, i) => { if (s && ESYALAR[s[0]] && i < YUVA) this.yuvalar[i] = this.yeni(s[0], s[1], s[2] ?? undefined); });
    if (o && o.zirh) o.zirh.forEach((s, i) => { if (s && ESYALAR[s[0]] && i < 4) this.zirh[i] = this.yeni(s[0], s[1], s[2] ?? undefined); });
    this.secili = (o && o.secili) || 0;
    this.bildir();
  }
}
