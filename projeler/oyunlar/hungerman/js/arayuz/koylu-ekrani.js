/* HungerMan - köylü penceresi (ticaret ve görev) ile görev günlüğü */
import { simge } from '../grafik/doku.js';
import { ESYALAR } from '../bloklar.js';
import { MESLEKLER } from '../koy/meslekler.js';
import { MAKS_AKTIF, yonAdi } from '../koy/gorevler.js';

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const esyaHtml = (id, n) => `<span class="kEsya" title="${esc(ESYALAR[id].ad)}"><img src="${simge(id).url}" alt=""><b>${n}</b></span>`;

export class KoyluEkrani {
  constructor(o) {
    Object.assign(this, o); // koyler, gorevler, envanter, ses, hud, oyuncu, kapatIste
    this.acik = false; this.v = null; this.sekme = 'takas';
    this.kok = $('#koyluEkrani');
    $('#kSekme').addEventListener('click', e => { const b = e.target.closest('button[data-s]'); if (!b) return; this.sekme = b.dataset.s; this.ses.tik(); this.ciz(); });
    $('#kKapat').addEventListener('click', () => this.kapatIste());
    $('#kIcerik').addEventListener('click', e => this.tikla(e));
    this.kok.addEventListener('mousedown', e => { if (e.target === this.kok) this.kapatIste(); });
  }
  ac(v) {
    this.v = v; this.acik = true; this.kok.hidden = false;
    const M = MESLEKLER[v.koylu.meslek];
    this.soz = M.soz[Math.floor(Math.random() * M.soz.length)];
    /* Mektup getirildiyse önce onu teslim et */
    const q = this.gorevler.mektupTeslim(v.koy.id, this.envanter);
    if (q) { this.ses.gorev(); this.hud.bildirim(`Mektup teslim edildi: ${q.odul.sikke} sikke kazanıldı.`, 288); this.soz = 'Mektubu getirdiğiniz için teşekkür ederiz. Haberler iyi görünüyor.'; }
    this.ciz();
  }
  kapat() { this.acik = false; this.kok.hidden = true; this.v = null; }

  ciz() {
    if (!this.acik) return;
    const v = this.v, k = v.koy, kl = v.koylu, K = this.koyler;
    $('#kAd').textContent = v.ad;
    $('#kAlt').textContent = `${k.ad} köyü`;
    const it = K.itibar(k.id);
    $('#kItibar').textContent = `İtibar: ${K.itibarDerecesi(k.id)} (${it > 0 ? '+' : ''}${it})`;
    $('#kItibar').className = 'rozet ' + (it >= 10 ? 'var' : it < 0 ? 'kotu' : 'yok');
    $('#kSoz').textContent = `“${this.soz}”`;
    [...$('#kSekme').children].forEach(b => b.classList.toggle('on', b.dataset.s === this.sekme));
    $('#kSikke').innerHTML = `${esyaHtml(288, this.envanter.say(288))} sikke mevcut`;
    const ic = $('#kIcerik');
    if (this.sekme === 'takas') {
      if (it <= -40) { ic.innerHTML = '<div class="bos">Köylüler sizinle ticaret yapmak istemiyor. Görevleri tamamlayarak itibarınızı yükseltebilirsiniz.</div>'; return; }
      const l = K.takasListesi(k, kl);
      ic.innerHTML = l.map((t, i) => {
        const yeter = t.ver.every(([id, n]) => this.envanter.say(id) >= n);
        return `<div class="takas${t.kalan <= 0 ? ' tukendi' : ''}">
          <div class="kVer">${t.ver.map(([id, n]) => esyaHtml(id, n)).join('')}</div><span class="ok">→</span>
          <div class="kAl">${esyaHtml(t.al[0], t.al[1])}<small>${esc(ESYALAR[t.al[0]].ad)}</small></div>
          <small class="kalan">${t.kalan > 0 ? `Kalan ${t.kalan}` : 'Tükendi'}</small>
          <button type="button" data-takas="${i}" ${yeter && t.kalan > 0 ? '' : 'disabled'}>Takas Et</button></div>`;
      }).join('') + '<p class="aciklama">Takas hakları her sabah yenilenir. İtibar yükseldikçe fiyatlar düşer.</p>';
    } else {
      const q = this.gorevler.koyluGorevi(k, kl);
      const aktif = this.gorevler.aktif.includes(q);
      if (!q) { ic.innerHTML = '<div class="bos">Şu anda verilecek bir görev mevcut değil.</div>'; return; }
      const odul = `${esyaHtml(288, q.odul.sikke)}${q.odul.esya ? esyaHtml(q.odul.esya[0], q.odul.esya[1]) : ''}<small>İtibar +${q.odul.itibar}</small>`;
      let durum = '', dugmeler = '';
      if (aktif) {
        if (q.tur === 'mektup') {
          const dx = q.hedefKoy.x - this.oyuncu.konum.x, dz = q.hedefKoy.z - this.oyuncu.konum.z;
          durum = `Mektubu ${esc(q.hedefKoy.ad)} köyüne götürün: ${yonAdi(dx, dz)} yönünde, ${Math.round(Math.hypot(dx, dz))} blok.`;
        } else {
          const n = this.gorevler.ilerleme(q, this.envanter);
          durum = `İlerleme: ${n} / ${q.adet}`;
          dugmeler += `<button type="button" class="ana" data-teslim="1" ${this.gorevler.tamamlanabilir(q, this.envanter) ? '' : 'disabled'}>Teslim Et</button>`;
        }
        dugmeler += '<button type="button" data-birak="1">Görevi Bırak</button>';
      } else if (this.gorevler.aktif.length >= MAKS_AKTIF) {
        durum = 'Aynı anda en fazla üç görev alınabilir. Önce mevcut görevlerden birini tamamlayınız.';
      } else dugmeler = '<button type="button" class="ana" data-kabul="1">Görevi Kabul Et</button>';
      ic.innerHTML = `<div class="gorevKart"><p>${esc(q.metin)}</p><div class="odul"><span>Ödül:</span>${odul}</div>${durum ? `<p class="gDurum">${durum}</p>` : ''}<div class="gDugme">${dugmeler}</div></div>`;
    }
  }

  tikla(e) {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    const v = this.v, k = v.koy, kl = v.koylu;
    if (b.dataset.takas != null) {
      const hata = this.koyler.takas(k, kl, +b.dataset.takas, this.envanter);
      if (hata) this.hud.bildirim(hata); else { this.ses.takas(); if (this.xp) this.xp(1); }
    } else if (b.dataset.kabul) {
      const q = this.gorevler.koyluGorevi(k, kl);
      const hata = this.gorevler.kabul(q, this.envanter);
      if (hata) this.hud.bildirim(hata); else { this.ses.gorev(); this.hud.bildirim(`Yeni görev: ${q.kisa}`); }
    } else if (b.dataset.teslim) {
      const q = this.gorevler.koyluGorevi(k, kl);
      if (this.gorevler.teslim(q, this.envanter)) { this.ses.gorev(); this.hud.bildirim(`Görev tamamlandı: ${q.odul.sikke} sikke kazanıldı.`, 288); this.soz = 'Çok teşekkür ederiz. Köyümüz size minnettardır.'; }
    } else if (b.dataset.birak) {
      const q = this.gorevler.koyluGorevi(k, kl);
      this.gorevler.birak(q); this.ses.tik();
    }
    this.ciz();
  }
}

/* Görev günlüğü (J tuşu) */
export class GorevEkrani {
  constructor(o) {
    Object.assign(this, o); // gorevler, envanter, oyuncu, ses, kapatIste
    this.acik = false;
    this.kok = $('#gorevEkrani');
    $('#gKapat').addEventListener('click', () => this.kapatIste());
    this.kok.addEventListener('mousedown', e => { if (e.target === this.kok) this.kapatIste(); });
    $('#gorevListe').addEventListener('click', e => {
      const b = e.target.closest('button[data-birak]'); if (!b) return;
      this.gorevler.birak(this.gorevler.aktif[+b.dataset.birak]); this.ses.tik(); this.ciz();
    });
  }
  ac() { this.acik = true; this.kok.hidden = false; this.ciz(); }
  kapat() { this.acik = false; this.kok.hidden = true; }
  ciz() {
    const G = this.gorevler, p = this.oyuncu.konum;
    if (!G.aktif.length) { $('#gorevListe').innerHTML = `<div class="bos">Aktif görev mevcut değil. Köylerdeki köylülerle konuşarak görev alabilirsiniz.<br>Tamamlanan görev: ${G.tamamlanan}</div>`; return; }
    $('#gorevListe').innerHTML = G.aktif.map((q, i) => {
      let durum;
      if (q.tur === 'mektup') { const dx = q.hedefKoy.x - p.x, dz = q.hedefKoy.z - p.z; durum = `Hedef: ${esc(q.hedefKoy.ad)} köyü · ${yonAdi(dx, dz)} · ${Math.round(Math.hypot(dx, dz))} blok`; }
      else { const n = G.ilerleme(q, this.envanter); durum = `İlerleme: ${n} / ${q.adet}${n >= q.adet ? ` · ${esc(q.koyluAd)} kişisine teslim edilecek` : ''}`; }
      const dx = q.koyX - p.x, dz = q.koyZ - p.z;
      return `<div class="gorevKart"><b>${esc(q.kisa)}</b><small>${esc(q.koyluAd)} · ${esc(q.koyAd)} köyü (${yonAdi(dx, dz)}, ${Math.round(Math.hypot(dx, dz))} blok)</small><p>${esc(q.metin)}</p><p class="gDurum">${durum}</p><div class="gDugme"><button type="button" data-birak="${i}">Görevi Bırak</button></div></div>`;
    }).join('') + `<p class="aciklama">Tamamlanan görev: ${G.tamamlanan} · Aynı anda en fazla ${MAKS_AKTIF} görev alınabilir.</p>`;
  }
}
