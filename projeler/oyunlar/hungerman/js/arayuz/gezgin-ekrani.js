/* HungerMan - 0.51.0: Gezgin Tüccar penceresi: tüccarın bu gelişteki takasları (verilenler → alınan, kalan stok) */
import { simge } from '../grafik/doku.js';
import { ESYALAR } from '../bloklar.js';
import { GEZGIN_SOZ } from '../koy/gezgin.js';
const $ = s => document.querySelector(s);
const esyaHtml = (id, n) => `<span class="kEsya" title="${ESYALAR[id].ad}"><img src="${simge(id).url}" alt=""><b>${n}</b></span>`;

export class GezginEkrani {
  constructor(o) {
    Object.assign(this, o);   // ses, kapatIste, tuccar (GezginTuccar), envanter(), birak(id, n), hud()
    this.acik = false; this.kok = $('#gezginEkrani');
    $('#gzKapat').addEventListener('click', () => this.kapatIste());
    this.kok.addEventListener('mousedown', e => { if (e.target === this.kok) this.kapatIste(); });
    $('#gzListe').addEventListener('click', e => { const b = e.target.closest('button[data-gz]'); if (b) this.takas(+b.dataset.gz, e.shiftKey); });
  }
  ac() { this.acik = true; this.kok.hidden = false; $('#gzSoz').textContent = '“' + GEZGIN_SOZ[Math.floor(Math.random() * GEZGIN_SOZ.length)] + '”'; this.ciz(); this.ses.ac && this.ses.ac(); }
  kapat() { this.acik = false; this.kok.hidden = true; }
  yapilir(t) { const E = this.envanter(); return t.kalan > 0 && t.ver.every(([i, n]) => E.say(i) >= n); }
  ciz() {
    const E = this.envanter(), T = this.tuccar.teklifler;
    $('#gzSikke').textContent = `${E.say(288)} sikke`;
    $('#gzListe').innerHTML = T.length ? T.map((t, i) => `<div class="gzTeklif${t.kalan > 0 ? '' : ' bitti'}">
      <div class="gzVer">${t.ver.map(([id, n]) => esyaHtml(id, n)).join('')}</div><i class="gzOk">→</i><div class="gzAl">${esyaHtml(t.al[0], t.al[1])}<span>${ESYALAR[t.al[0]].ad}</span></div>
      <small>${t.kalan > 0 ? `Stok ${t.kalan}` : 'Tükendi'}</small><button type="button" class="dugme kucuk${this.yapilir(t) ? ' ana' : ''}" data-gz="${i}" ${this.yapilir(t) ? '' : 'disabled'}>Takas</button></div>`).join('')
      : '<p class="aciklama">Tüccarın heybesi boş.</p>';
  }
  /* toplu: Shift ile stok ve malzeme yettiğince */
  takas(i, toplu) {
    const t = this.tuccar.teklifler[i], E = this.envanter(); if (!t) return;
    let n = 0;
    do {
      if (!this.yapilir(t)) break;
      for (const [id, k] of t.ver) E.harca(id, k);
      const kalan = E.ekle(t.al[0], t.al[1]);
      if (kalan > 0) this.birak(t.al[0], kalan);
      t.kalan--; n++;
    } while (toplu);
    if (n) { this.ses.takas ? this.ses.takas() : this.ses.tik(); E.bildir(); this.ciz(); }
  }
}
