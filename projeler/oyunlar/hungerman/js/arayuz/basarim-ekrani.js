/* HungerMan - başarımlar penceresi (L) ve kazanma kutusu (0.14.0) */
import { simge } from '../grafik/doku.js';
import { BASARIMLAR, GRUP_SIRASI } from '../oyun/basarimlar.js';

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
    $('#basarimListe').innerHTML = GRUP_SIRASI.map(g => {
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
