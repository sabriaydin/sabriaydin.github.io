/* Yazı sayfası şablonu.
   Tüm kategoriler sitenin ortak temasını kullanır: koyu sayfa, açık içerik kartı, sağda "Bu yazıda" içindekiler.
   Kategoriler yalnızca vurgu rengiyle (assets/js/app.js içindeki PAL ya da yazının kendi --a/--b değerleri) ayrışır.
   Yazı dosyalarının içeriği (başlıklar, paragraflar, tablolar, kod blokları, araçlar) taşınır, değiştirilmez.
   Görünüm assets/css/sablon.css içindedir. */
(function (g) {
  'use strict';
  const D = document;
  const el = (t, c, h) => { const e = D.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const tx = n => (n ? n.textContent.replace(/\s+/g, ' ').trim() : '');
  const ext = a => /^https?:/i.test(a.getAttribute('href') || '');

  /* Kategorilerin varsayılan vurgu renkleri: [koyu ton, açık ton]; yazının kendi --a/--b değeri varsa o kullanılır */
  const PAL = {
    windows: ['#0067c0', '#00a4ef'], windowsos: ['#1f4e8c', '#3d8bd9'], html: ['#e44d26', '#f0a04b'], htmlaraclari: ['#c0392b', '#ff7e5f'],
    linux: ['#e95420', '#f39c12'], linuxos: ['#e95420', '#f39c12'], linuxgelismis: ['#8e3a12', '#d9822b'], batch: ['#1e8449', '#58d68d'],
    batchornek: ['#0e6655', '#1abc9c'], sistemaraclari: ['#5b3fa0', '#9b6bd9'], medya: ['#c2185b', '#ff6f91'], ofis: ['#1565c0', '#42a5f5'],
    guvenlik: ['#b71c1c', '#ef5350'], gelistirici: ['#283593', '#7986cb'], eklentiler: ['#00838f', '#4dd0e1'], araclar: ['#c2410c', '#fb923c']
  };
  const SURF_DARK = '#2a2a2e', SURF_LIGHT = '#e7e4df';

  /* ---- Renk yardımcıları: vurgu rengini zemine göre okunaklı tona getirir (WCAG 4.5:1) ---- */
  const rgb = h => { h = String(h || '').trim(); const m = h.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i); if (!m) return null; let x = m[1]; if (x.length === 3) x = x.replace(/./g, c => c + c); return [0, 2, 4].map(i => parseInt(x.slice(i, i + 2), 16)); };
  const hex = c => '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  function tone(col, bg, min, toward) {
    const c = rgb(col), b = rgb(bg);
    if (!c || !b) return col;
    const t = toward === 'white' ? 255 : 0;
    let k = 0, cur = c;
    while (ratio(cur, b) < min && k < 20) { k++; cur = c.map(v => v + (t - v) * k * .05); }
    return k ? hex(cur) : col;
  }

  /* Yazı gövdesini giriş + bölümler (h2) olarak ayırır */
  function split(body) {
    const intro = [], secs = [];
    let cur = null;
    [...body.childNodes].forEach(n => {
      if (n.nodeType === 1 && n.tagName === 'H2') { cur = { h: n, id: n.id, title: tx(n), nodes: [] }; secs.push(cur); }
      else if (cur) cur.nodes.push(n);
      else intro.push(n);
    });
    return { intro, secs };
  }

  /* Bir bölümdeki harici bağlantılar: [{ad, href}] (tablo satırında sol hücre ad olarak alınır) */
  function links(sec) {
    const out = [], seen = new Set();
    sec.el.querySelectorAll('a[href]').forEach(a => {
      if (!ext(a) || seen.has(a.href)) return;
      seen.add(a.href);
      const td = a.closest('td'), row = td && td.parentElement;
      const first = row && row.children[0] !== td ? tx(row.children[0]) : '';
      out.push({ ad: first || tx(a), href: a.getAttribute('href'), txt: tx(a) });
    });
    return out;
  }
  const find = (x, re) => x.secs.find(s => re.test(s.title));
  const dl = x => { const d = find(x, /[iİ]ndir|mağaza|bağlantı/i); return d ? links(d) : []; };

  const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M10 12h5M10 16h5"/></svg>';

  /* ============ Ortak şablon ============ */
  function ortak(x) {
    const h = el('header', 't-head');
    const crumb = el('div', 'th-crumb');
    if (x.head.back) crumb.append(x.head.back);
    crumb.append(el('span', 'th-cat', esc(x.catName)));
    h.append(crumb);
    const row = el('div', 'th-row');
    let ic = x.icon;
    if (ic) ic.classList.add('th-ic'); else ic = el('div', 'th-ic th-glyph', ICON);
    const txt = el('div', 'th-txt');
    txt.append(x.head.h1);
    if (x.desc) txt.append(el('p', 'th-d', esc(x.desc)));
    if (x.chips && x.chips.length) txt.append(el('div', 'th-chips', x.chips.map(c => `<span>${esc(c)}</span>`).join('')));
    const ls = dl(x).slice(0, 2);
    if (ls.length) {
      const cta = el('div', 'th-cta');
      ls.forEach((l, i) => { const a = el('a', 'th-btn' + (i ? ' alt' : ''), esc(ls.length > 1 ? l.ad : (/[iİ]ndir|mağaza|bağlantı/i.test(l.ad) ? l.ad : 'Resmi indirme sayfası'))); a.href = l.href; a.rel = 'noopener'; cta.append(a); });
      txt.append(cta);
    }
    if (x.head.meta) txt.append(x.head.meta);
    row.append(ic, txt);
    h.append(row);

    let aside = null;
    if (x.secs.length > 1) {
      aside = el('div', 't-aside');
      const d = el('details', 'th-toc');
      d.open = !(g.matchMedia && g.matchMedia('(max-width: 900px)').matches);
      d.append(el('summary', '', 'Bu yazıda'));
      const nav = el('nav', 'th-nav');
      nav.setAttribute('aria-label', 'İçindekiler');
      nav.innerHTML = '<ol>' + x.secs.map(s => `<li><a href="#${s.id}">${esc(s.title)}</a></li>`).join('') + '</ol>';
      d.append(nav);
      aside.append(d);
    }
    return { head: h, aside };
  }

  const T = {};
  Object.keys(PAL).forEach(k => { T[k] = ortak; });

  /* Okurken hangi bölümde olunduğunu içindekiler bağlantısında işaretler */
  function spy(art) {
    if (!('IntersectionObserver' in g)) return;
    const secs = [...art.querySelectorAll('.t-sec[id]')];
    if (secs.length < 2) return;
    const links = {};
    secs.forEach(s => { links[s.id] = [...art.querySelectorAll('.t-aside a[href="#' + s.id + '"]')]; });
    let cur = '';
    const set = id => { if (id === cur) return; cur = id; Object.keys(links).forEach(k => links[k].forEach(a => { a.classList.toggle('on', k === id); if (k === id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); })); };
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) set(e.target.id); });
    }, { rootMargin: '-90px 0px -60% 0px', threshold: 0 });
    secs.forEach(s => io.observe(s));
  }

  /* ============ Uygulama ============ */
  function apply(art, cat, o) {
    const tpl = T[cat];
    const body = art.querySelector('.body');
    if (!tpl || !body) return false;
    o = o || {};
    let chips = null;
    const wxh = body.querySelector('.wx-hero');
    if (wxh) { chips = [...wxh.querySelectorAll('.wx-chips span')].map(tx); wxh.remove(); }
    let cA = body.style.getPropertyValue('--a'), cB = body.style.getPropertyValue('--b');
    const wrap = [...body.children].find(e => e.tagName === 'DIV' && /--a/.test(e.getAttribute('style') || ''));
    if (wrap) { cA = cA || wrap.style.getPropertyValue('--a'); cB = cB || wrap.style.getPropertyValue('--b'); wrap.replaceWith(...wrap.childNodes); }
    let icon = null;
    body.querySelectorAll('.px-hero,.px-toc,.lx-hero').forEach(e => {
      if (e.classList.contains('px-hero')) { const ic = e.querySelector('.prog-icon'); if (ic) icon = ic; }
      e.remove();
    });
    const head = { back: art.querySelector('.back'), tag: art.querySelector('.tag'), h1: art.querySelector('h1'), meta: art.querySelector('.meta') };
    art.querySelectorAll(':scope>br').forEach(e => e.remove());
    const { intro, secs } = split(body);
    secs.forEach((s, i) => { if (!s.id) s.id = 'b' + (i + 1); });
    const introEl = el('div', 't-intro');
    intro.forEach(n => { if (n.nodeType === 1 || tx(n)) introEl.append(n); });
    const wrapped = secs.map(s => {
      const sec = el('section', 't-sec');
      sec.id = s.id;
      s.h.removeAttribute('id');
      sec.append(s.h, ...s.nodes);
      s.el = sec;
      return sec;
    });
    body.replaceChildren();
    if (introEl.childNodes.length) body.append(introEl);
    body.append(...wrapped);
    const x = { art, body, head, secs, intro: introEl, desc: o.desc || '', catName: o.catName || cat, icon, chips };
    const r = tpl(x);
    const ilgili = art.querySelector(':scope > .ilgili');
    art.replaceChildren();
    art.className = 'post t t-' + cat;
    art.dataset.tpl = cat;
    /* Vurgu renkleri: --a/--b ham renk, --ac koyu zemin için açık ton, --ad açık kart için koyu ton */
    const pal = PAL[cat] || ['#b72a25', '#ec6a63'];
    cA = (cA || '').trim() || pal[0]; cB = (cB || '').trim() || pal[1];
    art.style.setProperty('--a', cA);
    art.style.setProperty('--b', cB);
    art.style.setProperty('--ac', tone(cB, SURF_DARK, 4.7, 'white') === cB ? cB : tone(cB, SURF_DARK, 4.7, 'white'));
    art.style.setProperty('--ac2', tone(cA, SURF_DARK, 4.7, 'white'));
    art.style.setProperty('--ad', tone(cA, SURF_LIGHT, 5, 'black'));
    art.append(r.head);
    const grid = el('div', 't-grid' + (r.aside ? '' : ' solo'));
    if (r.aside) grid.append(r.aside);
    grid.append(body);
    art.append(grid);
    if (ilgili) art.append(ilgili);
    spy(art);
    return true;
  }

  g.Sablon = { apply, has: c => !!T[c] };
})(typeof self !== 'undefined' ? self : this);
