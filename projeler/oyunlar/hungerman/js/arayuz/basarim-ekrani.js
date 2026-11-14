/* HungerMan - başarımlar penceresi (L) ve kazanma kutusu (0.14.0) */
import { simge } from '../grafik/doku.js';
import { BASARIMLAR, GRUP_SIRASI, ISTATISTIKLER } from '../oyun/basarimlar.js';

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export class BasarimEkrani {
  constructor(o) {
    Object.assign(this, o); // ses, kapatIste
    this.acik = false;
    this.basarimlar = null;
    this.kok = $('#basarimEkrani');
    $('#bKapat').addEventListener('click', () => this.kapatIste());
    this.kok.addEventListener('mousedown', e => { if (e.target === this.kok) this.kapatIste(); });
    this.kuyruk = []; this.kutuZaman = null;
  }
  ac() { this.acik = true; this.kok.hidden = false; this.ciz(); }
  kapat() { this.acik = false; this.kok.hidden = true; this.menudenAcildi = false; }
  ciz() {
    const B = this.basarimlar; if (!B) return;
    $('#basarimSayi').textContent = `${B.kazanilan} / ${BASARIMLAR.length}`;
    /* 0.22.0: hayatta kalma istatistikleri */
    const I = B.istat, ondalik = (n, b = 1) => n.toFixed(b).replace('.', ',');
    const bicim = (k, tur) => {
      const n = k === 'hayat' ? (this.hayatFn ? this.hayatFn() : 0) : I[k] || 0;
      if (tur === 'sure') { const dk = Math.floor(n / 60); return dk >= 60 ? `${Math.floor(dk / 60)} sa ${dk % 60} dk` : `${dk} dk`; }
      if (tur === 'gun') return n < 1 ? `${Math.round(n * 24)} saat` : `${ondalik(n)} gün`;
      if (tur === 'm') return n >= 1000 ? `${ondalik(n / 1000, 2)} km` : `${Math.round(n)} m`;
      if (tur === 'kalp') return `${Math.round(n)} kalp`;
      return String(Math.round(n));
    };
    const ist = `<div class="bGrup"><h3>İstatistikler</h3><div class="istIzgara">${ISTATISTIKLER.map(([k, ad, tur]) => `<div class="istKart"><small>${esc(ad)}</small><b>${bicim(k, tur)}</b></div>`).join('')}</div></div>`;
    $('#basarimListe').innerHTML = ist + GRUP_SIRASI.map(g => {
      const l = BASARIMLAR.filter(b => b.grup === g);
      return `<div class="bGrup"><h3>${g}</h3><div class="bIzgara">${l.map(b => {
        const a = B.var(b.k), il = B.ilerleme(b.k);
        const cub = !a && il ? `<span class="bIler"><i style="width:${(il[0] / il[1] * 100).toFixed(0)}%"></i></span><small>${il[0]} / ${il[1]}</small>` : '';
        return `<div class="bKart ${a ? 'acik' : 'kilitli'}"><img src="${simge(b.ikon).url}" alt=""><div><b>${esc(b.ad)}</b><small>${esc(b.aciklama)}</small>${cub}</div></div>`;
      }).join('')}</div></div>`;
    }).join('');
  }
  /* Kazanılan başarım sağ üstte birkaç saniye gösterilir; art arda gelenler sıraya girer */
  goster(b) {
    this.kuyruk.push(b);
    if (!this.kutuZaman) this.sonraki();
    if (this.acik) this.ciz();
  }
  sonraki() {
    const k = $('#basarimKutu'), b = this.kuyruk.shift();
    if (!b) { k.hidden = true; this.kutuZaman = null; return; }
    k.querySelector('img').src = simge(b.ikon).url;
    k.querySelector('b').textContent = b.ad; k.querySelector('span').textContent = b.aciklama;
    k.hidden = false; k.style.animation = 'none'; void k.offsetWidth; k.style.animation = '';
    if (this.ses && this.ses.basarim) this.ses.basarim();
    this.kutuZaman = setTimeout(() => this.sonraki(), 4200);
  }
  temizle() { clearTimeout(this.kutuZaman); this.kutuZaman = null; this.kuyruk = []; $('#basarimKutu').hidden = true; }
}
