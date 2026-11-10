/* HungerMan - envanter ve üretim ekranı: sürükle-bırak yerine tıkla-al / tıkla-bırak, tarif arama ve kategori */
import { simge } from '../grafik/doku.js';
import { ESYALAR } from '../bloklar.js';
import { TARIFLER, KATEGORILER, ISTASYON_ADI, girdiAdi, girdiSay, kacKez, uret, GRUPLAR } from '../oyun/uretim.js';

const $ = s => document.querySelector(s);

export class EnvanterEkrani {
  constructor(o) {
    Object.assign(this, o); // envanter, hud, ses, istasyonlar(), birak(id, adet, dayanim), hayatta
    this.acik = false;
    this.tasinan = null;
    this.kategori = 'hepsi';
    this.arama = '';
    this.istasyon = null;
    this.kok = $('#envanterEkrani');
    $('#envIzgara').innerHTML = Array.from({ length: 27 }, (_, k) => `<div class="yuva" data-i="${k + 9}"></div>`).join('');
    $('#envCubuk').innerHTML = Array.from({ length: 9 }, (_, i) => `<div class="yuva" data-i="${i}"></div>`).join('');
    $('#tarifSekme').innerHTML = KATEGORILER.map(([k, a]) => `<button type="button" data-k="${k}">${a}</button>`).join('');
    $('#tarifSekme').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; this.kategori = b.dataset.k; this.ses.tik(); this.tarifCiz(); });
    $('#tarifAra').addEventListener('input', e => { this.arama = e.target.value.trim().toLocaleLowerCase('tr'); this.tarifCiz(); });
    $('#tarifAra').addEventListener('keydown', e => e.stopPropagation());
    $('#envKapat').addEventListener('click', () => this.kapatIste && this.kapatIste());
    this.kok.addEventListener('contextmenu', e => e.preventDefault());
    this.kok.addEventListener('mousedown', e => this.fare(e));
    this.kok.addEventListener('mousemove', e => this.hareket(e));
    this.kok.addEventListener('mouseleave', () => { $('#ipucu').hidden = true; });
    $('#tarifListe').addEventListener('click', e => {
      const b = e.target.closest('button[data-t]'); if (!b) return;
      const t = TARIFLER[+b.dataset.t];
      const kez = b.dataset.kez === 'hepsi' ? 64 : 1;
      const n = uret(this.envanter, t, kez);
      if (n) { this.ses.uretim(); this.hud.bildirim(`${ESYALAR[t.cikti].ad} × ${n * t.adet} üretildi`, t.cikti); }
      else this.hud.bildirim('Envanterde yer yok.');
      this.ciz();
    });
  }

  ac(istasyon) {
    this.acik = true; this.istasyon = istasyon || null;
    if (istasyon) this.kategori = 'hepsi';
    this.kok.hidden = false;
    this.ciz();
  }
  kapat() {
    this.acik = false; this.kok.hidden = true;
    $('#ipucu').hidden = true;
    if (this.tasinan) {
      const k = this.envanter.ekle(this.tasinan.id, this.tasinan.adet, this.tasinan.dayanim);
      if (k > 0) this.birak(this.tasinan.id, k, this.tasinan.dayanim);
      this.tasinan = null;
    }
    this.tasimaCiz();
  }

  ciz() {
    if (!this.acik) return;
    const env = this.envanter;
    this.kok.querySelectorAll('.izgara .yuva').forEach(el => {
      const i = +el.dataset.i;
      el.innerHTML = this.hud.yuvaIc(env.yuvalar[i]);
      el.classList.toggle('secili', i === env.secili);
    });
    const h = this.hayatta;
    $('#envDurum').innerHTML = `<span>Can <b>${h.can / 2}</b> / 10</span><span>Açlık <b>${h.aclik / 2}</b> / 10</span>`;
    const ist = this.istasyonlar();
    $('#istasyonDurum').innerHTML = Object.entries(ISTASYON_ADI).map(([k, a]) => `<span class="rozet ${ist.has(k) ? 'var' : 'yok'}">${a}${ist.has(k) ? ' yakında' : ''}</span>`).join('');
    [...$('#tarifSekme').children].forEach(b => b.classList.toggle('on', b.dataset.k === this.kategori));
    this.tarifCiz();
    this.tasimaCiz();
  }

  tarifCiz() {
    const env = this.envanter, ist = this.istasyonlar();
    const liste = TARIFLER.map((t, i) => ({ t, i, n: kacKez(env, t), istOk: !t.istasyon || ist.has(t.istasyon) }))
      .filter(o => this.kategori === 'hepsi' || o.t.kategori === this.kategori)
      .filter(o => !this.arama || ESYALAR[o.t.cikti].ad.toLocaleLowerCase('tr').includes(this.arama))
      .sort((a, b) => ((b.n > 0 && b.istOk) - (a.n > 0 && a.istOk)) || (a.istOk === b.istOk ? 0 : a.istOk ? -1 : 1));
    if (!liste.length) { $('#tarifListe').innerHTML = '<div class="bos">Eşleşen tarif mevcut değil.</div>'; return; }
    $('#tarifListe').innerHTML = liste.map(({ t, i, n, istOk }) => {
      const e = ESYALAR[t.cikti];
      const gir = t.girdi.map(([g, a]) => {
        const var_ = girdiSay(env, g), id = GRUPLAR[g] ? GRUPLAR[g].idler[0] : g;
        return `<span class="${var_ >= a ? 'ok' : 'eksik'}"><img src="${simge(id).url}" alt="">${girdiAdi(g)} ${Math.min(var_, a)}/${a}</span>`;
      }).join('');
      const yapilir = n > 0 && istOk;
      return `<div class="tarif${yapilir ? '' : ' olmaz'}">
        <div class="tSimge"><img src="${simge(t.cikti).url}" alt="">${t.adet > 1 ? `<span>${t.adet}</span>` : ''}</div>
        <div><b>${e.ad}</b><div class="gir">${gir}</div>${t.istasyon ? `<div class="ist ${istOk ? '' : 'eksik'}">${ISTASYON_ADI[t.istasyon]} gerekli${istOk ? '' : ' (yakında değil)'}</div>` : ''}</div>
        <div class="uretBtn"><button type="button" data-t="${i}" ${yapilir ? '' : 'disabled'}>Üret</button>${yapilir && n > 1 && e.yigin > 1 ? `<button type="button" class="cok" data-t="${i}" data-kez="hepsi">Tümü (${Math.min(n, Math.floor(64 / t.adet) || 1)})</button>` : ''}</div>
      </div>`;
    }).join('');
  }

  /* ---------- Yuva tıklamaları ---------- */
  fare(e) {
    if (e.target.closest('#tarifListe, #tarifSekme, #tarifAra, .kapat')) return;
    const el = e.target.closest('.izgara .yuva');
    const env = this.envanter;
    if (!el) {
      /* Pencere dışına tıklanırsa taşınan eşya bırakılır */
      if (this.tasinan && !e.target.closest('.pencere')) {
        const n = e.button === 2 ? 1 : this.tasinan.adet;
        this.birak(this.tasinan.id, n, this.tasinan.dayanim);
        this.tasinan.adet -= n; if (this.tasinan.adet <= 0) this.tasinan = null;
        this.tasimaCiz();
      }
      return;
    }
    e.preventDefault();
    const i = +el.dataset.i;
    const s = env.yuvalar[i];
    const max = s ? env.yigin(s.id) : 64;
    if (e.shiftKey && s && !this.tasinan) {
      /* Çubuk ile ana envanter arasında taşı */
      const hedef = i < 9 ? [...Array(27).keys()].map(k => k + 9) : [...Array(9).keys()];
      let kalan = s.adet;
      for (const j of hedef) { const t = env.yuvalar[j]; if (t && t.id === s.id && t.adet < max) { const k = Math.min(kalan, max - t.adet); t.adet += k; kalan -= k; } if (!kalan) break; }
      for (const j of hedef) { if (!kalan) break; if (!env.yuvalar[j]) { env.yuvalar[j] = { ...s, adet: kalan }; kalan = 0; } }
      if (kalan) s.adet = kalan; else env.yuvalar[i] = null;
      this.ses.tik(); env.bildir(); this.ciz(); return;
    }
    const T = this.tasinan;
    if (e.button === 2) {
      if (!T && s) { const yarim = Math.ceil(s.adet / 2); this.tasinan = { ...s, adet: yarim }; s.adet -= yarim; if (!s.adet) env.yuvalar[i] = null; }
      else if (T && !s) { env.yuvalar[i] = { ...T, adet: 1 }; T.adet--; if (!T.adet) this.tasinan = null; }
      else if (T && s && s.id === T.id && s.adet < max && s.dayanim == null) { s.adet++; T.adet--; if (!T.adet) this.tasinan = null; }
    } else {
      if (!T && s) { this.tasinan = s; env.yuvalar[i] = null; }
      else if (T && !s) { env.yuvalar[i] = T; this.tasinan = null; }
      else if (T && s) {
        if (s.id === T.id && s.dayanim == null && T.dayanim == null) { const k = Math.min(T.adet, max - s.adet); s.adet += k; T.adet -= k; if (!T.adet) this.tasinan = null; }
        else { env.yuvalar[i] = T; this.tasinan = s; }
      }
    }
    this.ses.tik();
    env.bildir();
    this.ciz();
    this.hareket(e);
  }

  hareket(e) {
    const t = $('#tasima');
    t.style.left = e.clientX + 'px'; t.style.top = e.clientY + 'px';
    const ip = $('#ipucu');
    const el = e.target.closest && e.target.closest('.izgara .yuva');
    const s = el && this.envanter.yuvalar[+el.dataset.i];
    if (!s || this.tasinan) { ip.hidden = true; return; }
    const es = ESYALAR[s.id];
    let alt = '';
    if (es.alet) alt += `<span>${es.alet.tur === 'kilic' ? 'Hasar' : 'Hız'}: ${es.alet.tur === 'kilic' ? es.alet.hasar : es.alet.hiz} · Seviye ${es.alet.seviye}</span><span>Dayanım: ${s.dayanim} / ${es.alet.dayanim}</span>`;
    if (es.yemek) alt += `<span>Açlığı ${es.yemek / 2} birim giderir</span>`;
    if (es.iyilestir) alt += `<span>${es.iyilestir / 2} kalp iyileştirir</span>`;
    if (es.tur === 'blok') alt += '<span>Yerleştirilebilir blok</span>';
    ip.innerHTML = `<b>${es.ad}</b>${alt}`;
    ip.hidden = false;
    ip.style.left = Math.min(innerWidth - 270, e.clientX + 16) + 'px'; ip.style.top = (e.clientY + 16) + 'px';
  }

  tasimaCiz() {
    const t = $('#tasima');
    t.innerHTML = this.tasinan ? `<img src="${simge(this.tasinan.id).url}" alt="">${this.tasinan.adet > 1 ? `<span class="adet">${this.tasinan.adet}</span>` : ''}` : '';
  }
}
