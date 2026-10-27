/* Kategoriye özel yazı şablonları.
   Her kategorinin yazı sayfası kendi üst bölümü, yerleşimi ve bölüm görünümüyle kurulur.
   Yazı dosyalarının içeriği (başlıklar, paragraflar, tablolar, kod blokları, araçlar) taşınır, değiştirilmez.
   Şablonun görünümü assets/css/sablon.css içindedir. */
(function (g) {
  'use strict';
  const D = document;
  const el = (t, c, h) => { const e = D.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const tx = n => (n ? n.textContent.replace(/\s+/g, ' ').trim() : '');
  const ext = a => /^https?:/i.test(a.getAttribute('href') || '');

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

  const toc = (x, cls, fmt) => {
    const n = el('nav', cls);
    n.setAttribute('aria-label', 'İçindekiler');
    n.innerHTML = '<ol>' + x.secs.map((s, i) => `<li><a href="#${s.id}">${fmt ? fmt(s.title, i) : esc(s.title)}</a></li>`).join('') + '</ol>';
    return n;
  };
  const find = (x, re) => x.secs.find(s => re.test(s.title));
  const dateTxt = x => tx(x.head.meta && x.head.meta.querySelector('time'));

  const T = {};

  /* ============ Linux Rehber: kılavuz (man) sayfası ============ */
  T.linux = x => {
    const h = el('header', 't-head');
    h.append(el('div', 'man-bar', `<span>REHBER(1)</span><span>${esc(x.catName)} Kılavuzu</span><span>REHBER(1)</span>`));
    h.append(el('div', 'man-k', 'AD'));
    const nm = el('div', 'man-nm');
    nm.append(x.head.h1, el('span', 'man-d', ' — ' + esc(x.desc)));
    h.append(nm);
    const mt = el('div', 'man-meta');
    if (x.head.back) mt.append(x.head.back);
    if (x.head.meta) mt.append(x.head.meta);
    h.append(mt);
    const aside = el('div', 't-aside');
    const sn = toc(x, 'man-see', (t, i) => `<span>${esc(t)}</span><i>(${i + 1})</i>`);
    aside.append(el('div', 'man-k', 'BÖLÜMLER'), sn);
    const foot = el('footer', 'man-foot', `<span>Sabri Aydın</span><span>${esc(dateTxt(x))}</span><span>REHBER(1)</span>`);
    return { head: h, aside, foot };
  };

  /* ============ Tarayıcı Eklentileri: tarayıcı penceresi + manifest düzeni ============ */
  T.eklentiler = x => {
    const h = el('header', 't-head');
    const ttl = tx(x.head.h1), short = ttl.split(':')[0];
    const slug = short.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'eklenti';
    h.append(el('div', 'ex-chrome', `<i></i><i></i><i></i><span class="ex-tab">${esc(short)}</span><span class="ex-url"><b>eklenti://</b>${esc(slug)}</span><span class="ex-pz"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3h4v3a2 2 0 1 0 4 0V3h3v6h-3a2 2 0 1 0 0 4h3v6h-6v-3a2 2 0 1 0-4 0v3H3v-6h3a2 2 0 1 0 0-4H3V3z"/></svg></span>`));
    const hero = el('div', 'ex-hero');
    const ic = x.icon ? x.icon : el('div', 'ex-ic', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3h4v3a2 2 0 1 0 4 0V3h3v6h-3a2 2 0 1 0 0 4h3v6h-6v-3a2 2 0 1 0-4 0v3H3v-6h3a2 2 0 1 0 0-4H3V3z"/></svg>');
    ic.className = 'ex-ic';
    const halo = el('div', 'ex-halo'); halo.append(ic);
    const main = el('div', 'ex-main');
    if (x.head.back) main.append(x.head.back);
    main.append(el('div', 'ex-kind', 'Tarayıcı eklentisi'), x.head.h1, el('p', 'ex-desc', esc(x.desc)));
    const ls = dl(x).slice(0, 4);
    if (ls.length) {
      const cta = el('div', 'ex-cta');
      ls.forEach((l, i) => { const a = el('a', 'ex-btn' + (i ? ' alt' : ''), esc(l.ad)); a.href = l.href; a.rel = 'noopener'; cta.append(a); });
      main.append(cta);
    }
    const f = el('dl', 'ex-facts', `<div><dt>Kategori</dt><dd>${esc(x.catName)}</dd></div><div><dt>Yayın</dt><dd>${esc(dateTxt(x))}</dd></div><div><dt>Bölüm</dt><dd>${x.secs.length}</dd></div>` + (ls.length ? `<div><dt>Bağlantı</dt><dd>${ls.length}</dd></div>` : ''));
    main.append(f);
    if (x.head.meta) main.append(x.head.meta);
    hero.append(halo, main);
    h.append(hero);
    return { head: h };
  };

  /* ============ HTML Rehberi: kod düzenleyici ============ */
  T.html = x => {
    const h = el('header', 't-head');
    h.append(el('div', 'ed-bar', '<i></i><i></i><i></i><span class="ed-tab on">index.html</span><span class="ed-tab">style.css</span><span class="ed-tab">script.js</span>'));
    const code = el('div', 'ed-lines');
    code.append(el('div', 'ed-l c', `&lt;!-- ${esc(x.catName)} · ${esc(dateTxt(x))} --&gt;`));
    const l2 = el('div', 'ed-l'); l2.append(x.head.h1); code.append(l2);
    code.append(el('div', 'ed-l', `<span class="tg">&lt;p</span> <span class="at">class</span>=<span class="sv">"giris"</span><span class="tg">&gt;</span>${esc(x.desc)}<span class="tg">&lt;/p&gt;</span>`));
    h.append(code);
    const mt = el('div', 'ed-meta');
    if (x.head.back) mt.append(x.head.back);
    if (x.head.meta) mt.append(x.head.meta);
    h.append(mt);
    const aside = el('div', 't-aside');
    aside.append(el('div', 'ed-k', 'GEZGİN'), el('div', 'ed-k2', 'html-rehberi'));
    aside.append(toc(x, 'ed-tree', (t, i) => `<span>bolum-${i + 1}.html</span><em>${esc(t)}</em>`));
    return { head: h, aside };
  };


  /* ---- ortak yardımcılar (yeni şablonlar) ---- */
  const back = x => x.head.back || '';
  const dl = x => { const d = find(x, /indir|mağaza|bağlantı/i); return d ? links(d) : []; };
  const iconOr = (x, cls) => { const ic = x.icon ? x.icon : el('div', cls, '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12h8M12 8v8"/></svg>'); ic.className = cls; return ic; };
  const metaRow = (x, cls) => { const m = el('div', cls); if (x.head.back) m.append(x.head.back); if (x.head.meta) m.append(x.head.meta); return m; };
  const num = i => String(i + 1).padStart(2, '0');

  /* ============ Windows: Ayarlar uygulaması ============ */
  T.windows = x => {
    const h = el('header', 't-head');
    const top = el('div', 'ay-top'); top.append(back(x)); h.append(top);
    const row = el('div', 'ay-row');
    const ic = iconOr(x, 'ay-ic');
    const tt = el('div', 'ay-tt'); tt.append(x.head.h1, el('p', 'ay-d', esc(x.desc)));
    row.append(ic, tt); h.append(row);
    if (x.head.meta) h.append(x.head.meta);
    const aside = el('div', 't-aside');
    aside.append(el('div', 'ay-k', 'Ayarlar'), toc(x, 'ay-nav', (t, i) => `<i>${i + 1}</i><span>${esc(t)}</span>`));
    return { head: h, aside };
  };

  /* ============ Windows Sürümleri: kilit ekranı + görev çubuğu ============ */
  T.windowsos = x => {
    const w = x.art._wx || {};
    const h = el('header', 't-head');
    const hero = el('div', 'wl-hero');
    const n = tx(x.head.h1).length;
    hero.classList.add(n <= 14 ? 'xl' : n <= 30 ? 'lg' : 'md');
    hero.append(el('div', 'wl-pane'), el('div', 'wl-pane p2'));
    const top = el('div', 'wl-top');
    if (x.head.back) top.append(x.head.back);
    top.append(el('span', 'wl-st', '<i></i><i></i><i></i>'));
    const ctr = el('div', 'wl-ctr');
    ctr.append(el('div', 'wl-date', esc(dateTxt(x) || x.catName)), x.head.h1, el('p', 'wl-d', esc(w.p || x.desc)));
    if (w.chips && w.chips.length) ctr.append(el('div', 'wl-chips', w.chips.map(c => `<span>${esc(c)}</span>`).join('')));
    hero.append(top, ctr);
    h.append(hero);
    const ls = dl(x);
    const bar = el('nav', 'wl-bar');
    bar.setAttribute('aria-label', 'Bölümler');
    bar.innerHTML = '<span class="wl-start"></span>' + x.secs.map(s => `<a href="#${s.id}">${esc(s.title)}</a>`).join('');
    if (ls[0]) { const a2 = el('a', 'wl-dl', 'İndir'); a2.href = ls[0].href; a2.rel = 'noopener'; bar.append(a2); }
    if (x.head.meta) { x.head.meta.classList.add('wl-meta'); bar.append(x.head.meta); }
    const asd = el('div', 't-aside'); asd.append(bar);
    return { head: h, aside: asd };
  };

  /* ============ HTML Araçları: çalışma tezgâhı ============ */
  T.htmlaraclari = x => {
    const h = el('header', 't-head');
    h.append(el('div', 'wb-bar', '<span class="wb-dot"></span><b>araç tezgâhı</b><span class="wb-tabs"><i class="on">Araç</i><i>Açıklama</i><i>Kod</i></span>'));
    const t = el('div', 'wb-title'); t.append(x.head.h1, el('p', '', esc(x.desc))); h.append(t);
    h.append(metaRow(x, 'wb-meta'));
    const aside = el('div', 't-aside');
    aside.append(el('div', 'wb-k', 'Bölümler'), toc(x, 'wb-nav', (t2, i) => `<b>${num(i)}</b> ${esc(t2)}`));
    return { head: h, aside };
  };

  /* ============ Linux Dağıtımları: neofetch özeti ============ */
  T.linuxos = x => {
    const h = el('header', 't-head');
    h.append(el('div', 'nf-bar', '<i></i><i></i><i></i><span>kullanici@dagitim: ~</span>'));
    const g = el('div', 'nf-grid');
    const logo = el('div', 'nf-logo'); logo.append(iconOr(x, 'nf-ic'));
    logo.append(el('div', 'nf-pal', '<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>'));
    const info = el('div', 'nf-info');
    info.append(el('div', 'nf-cmd', '<b>$</b> neofetch'));
    const t = el('div', 'nf-t'); t.append(x.head.h1); info.append(t);
    info.append(el('div', 'nf-sep', '─'.repeat(26)));
    info.append(el('div', 'nf-l', `<b>Açıklama</b>: ${esc(x.desc)}`));
    info.append(el('div', 'nf-l', `<b>Kategori</b>: ${esc(x.catName)}`));
    info.append(el('div', 'nf-l', `<b>Tarih</b>: ${esc(dateTxt(x))}`));
    info.append(el('div', 'nf-l', `<b>Bölüm</b>: ${x.secs.length}`));
    g.append(logo, info); h.append(g);
    h.append(metaRow(x, 'nf-meta'));
    const aside = el('div', 't-aside');
    aside.append(el('div', 'nf-k', '$ ls bolumler/'), toc(x, 'nf-ls', (t2, i) => `<span>${num(i)}-</span>${esc(t2)}`));
    return { head: h, aside };
  };

  /* ============ Linux İleri Düzey: işlem konsolu ============ */
  T.linuxgelismis = x => {
    const h = el('header', 't-head');
    h.append(el('div', 'op-haz', '<span>İLERİ DÜZEY</span><span>DİKKAT: KOMUTLARI ÇALIŞTIRMADAN ÖNCE YEDEK ALIN</span><span>İLERİ DÜZEY</span>'));
    const b = el('div', 'op-main');
    b.append(back(x), el('div', 'op-k', 'OPERASYON · ' + esc(x.catName.toUpperCase())), x.head.h1, el('p', 'op-d', esc(x.desc)));
    h.append(b);
    const ck = el('div', 'op-chk', '<b>KONTROL LİSTESİ</b>'); ck.append(toc(x, 'op-steps', (t, i) => `<em>${num(i)}</em>${esc(t)}`)); h.append(ck);
    if (x.head.meta) h.append(x.head.meta);
    return { head: h };
  };

  /* ============ Batch Eğitimi: MS-DOS ekranı ============ */
  T.batch = x => {
    const h = el('header', 't-head');
    h.append(el('div', 'dos-bar', '<span>C:\\EGITIM&gt;</span><span>BATCH.EXE</span><span>[ 80x25 ]</span>'));
    const b = el('div', 'dos-main');
    b.append(el('p', 'dos-c', 'C:\\EGITIM&gt;<b>type</b> ders.txt'), x.head.h1, el('p', 'dos-d', 'REM ' + esc(x.desc)));
    b.append(metaRow(x, 'dos-meta'));
    h.append(b);
    const aside = el('div', 't-aside');
    aside.append(el('p', 'dos-c', 'C:\\EGITIM&gt;<b>dir</b> /b'), toc(x, 'dos-dir', (t, i) => `<span>BOLUM${num(i)}.TXT</span> ${esc(t)}`));
    return { head: h, aside, foot: el('footer', 'dos-foot', 'C:\\EGITIM&gt;<span class="cur"></span>') };
  };

  /* ============ Batch Örnekleri: Windows 95 pencereleri ============ */
  T.batchornek = x => {
    const h = el('header', 't-head');
    const win = el('div', 'w95');
    win.append(el('div', 'w95-t', `<span>${esc(tx(x.head.h1)).slice(0, 40)}.bat</span><span class="w95-b"><i>_</i><i>□</i><i>×</i></span>`));
    const bd = el('div', 'w95-body');
    bd.append(el('div', 'w95-menu', '<u>D</u>osya &nbsp; <u>D</u>üzen &nbsp; <u>G</u>örünüm &nbsp; Y<u>a</u>rdım'));
    const c = el('div', 'w95-in'); c.append(x.head.h1, el('p', '', esc(x.desc))); bd.append(c);
    bd.append(metaRow(x, 'w95-st'));
    win.append(bd); h.append(win);
    const aside = el('div', 't-aside');
    const wa = el('div', 'w95');
    wa.append(el('div', 'w95-t', '<span>Bölümler</span><span class="w95-b"><i>×</i></span>'));
    const ab = el('div', 'w95-body'); ab.append(toc(x, 'w95-list', (t2, i) => `<span>${esc(t2)}</span>`)); wa.append(ab);
    aside.append(wa);
    return { head: h, aside };
  };

  /* ============ Sistem ve Bakım Araçları: denetim masası ============ */
  T.sistemaraclari = x => {
    const h = el('header', 't-head');
    h.append(el('div', 'cp-crumb', `Denetim Masası › ${esc(x.catName)} › <b>${esc(tx(x.head.h1))}</b>`));
    const row = el('div', 'cp-row');
    const tt = el('div', 'cp-tt'); tt.append(x.head.h1, el('p', '', esc(x.desc)));
    row.append(iconOr(x, 'cp-ic'), tt); h.append(row);
    const aside = el('div', 't-aside');
    const ls = dl(x);
    const card = el('div', 'cp-card');
    card.innerHTML = `<b>Bu araç hakkında</b><dl><dt>Kategori</dt><dd>${esc(x.catName)}</dd><dt>Tarih</dt><dd>${esc(dateTxt(x))}</dd><dt>Bağlantı</dt><dd>${ls.length}</dd></dl>`;
    if (ls[0]) { const a = el('a', 'cp-btn', 'İndirme sayfası'); a.href = ls[0].href; a.rel = 'noopener'; card.append(a); }
    card.append(back(x), x.head.meta || '');
    aside.append(card, toc(x, 'cp-nav', (t, i) => esc(t)));
    return { head: h, aside };
  };

  /* ============ Medya: stüdyo / kurgu zaman çizelgesi ============ */
  T.medya = x => {
    const h = el('header', 't-head');
    h.append(el('div', 'md-film'));
    const b = el('div', 'md-main');
    const row = el('div', 'md-row'); row.append(iconOr(x, 'md-ic'));
    const tt = el('div', 'md-tt'); tt.append(el('div', 'md-k', '● REC · ' + esc(x.catName.toUpperCase())), x.head.h1, el('p', '', esc(x.desc)));
    row.append(tt); b.append(row, metaRow(x, 'md-meta')); h.append(b);
    const tl = el('nav', 'md-tl'); tl.setAttribute('aria-label', 'Sahneler');
    tl.innerHTML = x.secs.map((s, i) => `<a href="#${s.id}"><b>00:${num(i)}</b>${esc(s.title)}</a>`).join('');
    h.append(tl, el('div', 'md-film'));
    return { head: h };
  };

  /* ============ Ofis: belge sayfası ============ */
  T.ofis = x => {
    const h = el('header', 't-head');
    h.append(el('div', 'of-title', `<span>${esc(tx(x.head.h1)).slice(0, 48)} - Belge</span><span class="of-win"><i>–</i><i>□</i><i>×</i></span>`));
    h.append(el('div', 'of-rib', '<span class="on">Giriş</span><span>Ekle</span><span>Tasarım</span><span>Düzen</span><span>Başvurular</span><span>Gözden Geçir</span><span>Görünüm</span>'));
    const bar = el('div', 'of-tools'); bar.append(metaRow(x, 'of-meta')); h.append(bar);
    const aside = el('div', 't-aside');
    aside.append(el('div', 'of-k', 'Gezinti'), toc(x, 'of-nav', (t, i) => `${esc(t)}`));
    const page = x.body;
    const ph = el('div', 'of-ph'); ph.append(x.head.h1, el('p', 'of-d', esc(x.desc)));
    page.prepend(ph);
    return { head: h, aside };
  };

  /* ============ Güvenlik: dosya / tutanak ============ */
  T.guvenlik = x => {
    const h = el('header', 't-head');
    h.append(el('div', 'sg-ban', '<span>GİZLİ</span><span>GÜVENLİK DOSYASI</span><span>GİZLİ</span>'));
    const main = el('div', 'sg-main');
    const l = el('div', 'sg-l'); l.append(back(x), el('div', 'sg-k', 'KONU'), x.head.h1, el('p', 'sg-d', esc(x.desc)));
    const r = el('div', 'sg-r');
    r.innerHTML = `<div class="sg-stamp">İNCELENDİ</div><dl><dt>DOSYA NO</dt><dd>GV-${esc(dateTxt(x).replace(/\D/g, '').slice(-6) || '000')}</dd><dt>TARİH</dt><dd>${esc(dateTxt(x))}</dd><dt>SINIF</dt><dd>${esc(x.catName)}</dd><dt>EK</dt><dd>${x.secs.length} bölüm</dd></dl>`;
    main.append(l, r); h.append(main);
    if (x.head.meta) h.append(x.head.meta);
    const aside = el('div', 't-aside');
    aside.append(el('div', 'sg-k', 'İÇİNDEKİLER'), toc(x, 'sg-ek', (t, i) => `<b>EK-${i + 1}</b> ${esc(t)}`));
    return { head: h, aside };
  };

  /* ============ Geliştirici: README sayfası ============ */
  T.gelistirici = x => {
    const h = el('header', 't-head');
    h.append(el('div', 'gh-repo', `<span class="gh-ic"></span><a href="../index.html">sabri-aydin</a> / <b>${esc(tx(x.head.h1).toLowerCase().replace(/[^a-z0-9ğüşıöç]+/g, '-').replace(/^-|-$/g, '').slice(0, 40))}</b><span class="gh-pub">Public</span>`));
    h.append(el('div', 'gh-tabs', '<span class="on">Code</span><span>Issues</span><span>Pull requests</span><span>Actions</span>'));
    const aside = el('div', 't-aside');
    const ab = el('div', 'gh-about');
    ab.innerHTML = `<b>About</b><p>${esc(x.desc)}</p><div class="gh-tg"><span>${esc(x.catName)}</span><span>${x.secs.length} bölüm</span></div><div class="gh-st">★ ${esc(dateTxt(x))}</div>`;
    ab.append(back(x), x.head.meta || '');
    aside.append(ab, toc(x, 'gh-toc', t => esc(t)));
    const ph = el('div', 'gh-fh', '<span>README.md</span>');
    const hd = el('div', 'gh-hd'); hd.append(x.head.h1); x.body.prepend(ph, hd);
    return { head: h, aside };
  };

  /* ============ Araçlar: tezgâh (alet etiketi + sert gölgeli kartlar) ============ */
  T.araclar = x => {
    const h = el('header', 't-head');
    const m = (g.location.pathname.match(/arac-(\d+)/) || [])[1];
    const top = el('div', 'tz-top');
    top.append(back(x), el('span', 'tz-no', 'ARAÇ <b>Nº ' + esc(m || String(x.secs.length)) + '</b>'));
    const main = el('div', 'tz-main');
    const txt = el('div', 'tz-txt');
    txt.append(x.head.h1, el('p', 'tz-d', esc(x.desc)));
    if (x.head.meta) { const mm = el('div', 'tz-meta'); mm.append(x.head.meta); txt.append(mm); }
    const gear = el('div', 'tz-gear', '<svg viewBox="0 0 160 136" aria-hidden="true"><g class="g1"><path d="M136.5 50.2 L146.8 51.8 L146.8 60.2 L136.5 61.8 L134.5 69.3 L142.6 75.8 L138.5 83.0 L128.8 79.3 L123.3 84.8 L127.0 94.5 L119.8 98.6 L113.3 90.5 L105.8 92.5 L104.2 102.8 L95.8 102.8 L94.2 92.5 L86.7 90.5 L80.2 98.6 L73.0 94.5 L76.7 84.8 L71.2 79.3 L61.5 83.0 L57.4 75.8 L65.5 69.3 L63.5 61.8 L53.2 60.2 L53.2 51.8 L63.5 50.2 L65.5 42.7 L57.4 36.2 L61.5 29.0 L71.2 32.7 L76.7 27.2 L73.0 17.5 L80.2 13.4 L86.7 21.5 L94.2 19.5 L95.8 9.2 L104.2 9.2 L105.8 19.5 L113.3 21.5 L119.8 13.4 L127.0 17.5 L123.3 27.2 L128.8 32.7 L138.5 29.0 L142.6 36.2 L134.5 42.7Z" fill="#ff6a1a"/><circle cx="100" cy="56" r="13" fill="#f6f0e4"/></g><g class="g2"><path d="M72.8 98.0 L81.1 98.9 L81.1 106.4 L72.8 107.3 L70.4 113.1 L75.6 119.7 L70.3 124.9 L63.8 119.7 L58.0 122.1 L57.1 130.4 L49.6 130.4 L48.7 122.1 L42.9 119.7 L36.3 124.9 L31.1 119.7 L36.3 113.1 L33.9 107.3 L25.6 106.4 L25.6 98.9 L33.9 98.0 L36.3 92.2 L31.1 85.7 L36.3 80.4 L42.9 85.6 L48.7 83.2 L49.6 74.9 L57.1 74.9 L58.0 83.2 L63.8 85.6 L70.3 80.4 L75.6 85.7 L70.4 92.2Z" fill="#ffc83d"/><circle cx="53.3" cy="102.7" r="7" fill="#f6f0e4"/></g></svg>');
    main.append(txt, gear);
    h.append(top, main);
    const aside = el('div', 't-aside');
    aside.append(toc(x, 'tz-rail', (t, i) => `<b>${num(i)}</b>${esc(t)}`));
    return { head: h, aside };
  };

  /* Okurken hangi bölümde olunduğunu içindekiler bağlantısında işaretler */
  function spy(art) {
    if (!('IntersectionObserver' in g)) return;
    const secs = [...art.querySelectorAll('.t-sec[id]')];
    if (secs.length < 2) return;
    const links = {};
    secs.forEach(s => { links[s.id] = [...art.querySelectorAll('.t-head a[href="#' + s.id + '"],.t-aside a[href="#' + s.id + '"]')]; });
    let cur = '';
    const set = id => { if (id === cur) return; cur = id; Object.keys(links).forEach(k => links[k].forEach(a => a.classList.toggle('on', k === id))); };
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
    const wxh = body.querySelector('.wx-hero');
    if (wxh) { art._wx = { small: tx(wxh.querySelector('small')), p: tx(wxh.querySelector('p')), chips: [...wxh.querySelectorAll('.wx-chips span')].map(tx) }; wxh.remove(); }
    let cA = body.style.getPropertyValue('--a'), cB = body.style.getPropertyValue('--b');
    const wrap = [...body.children].find(e => e.tagName === 'DIV' && /--a/.test(e.getAttribute('style') || ''));
    if (wrap) { cA = cA || wrap.style.getPropertyValue('--a'); cB = cB || wrap.style.getPropertyValue('--b'); wrap.replaceWith(...wrap.childNodes); }
    body.querySelectorAll('.px-hero,.px-toc,.lx-hero').forEach(e => {
      if (e.classList.contains('px-hero')) { const ic = e.querySelector('.prog-icon'); if (ic) art._icon = ic; }
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
    const x = { art, body, head, secs, intro: introEl, desc: o.desc || '', catName: o.catName || cat, icon: art._icon || null };
    const r = tpl(x);
    art.replaceChildren();
    art.className = 'post t t-' + cat;
    art.dataset.tpl = cat;
    if (cA) art.style.setProperty('--a', cA);
    if (cB) art.style.setProperty('--b', cB);
    art.append(r.head);
    const grid = el('div', 't-grid');
    if (r.aside) grid.append(r.aside);
    grid.append(body);
    art.append(grid);
    if (r.foot) art.append(r.foot);
    spy(art);
    return true;
  }

  g.Sablon = { apply, has: c => !!T[c] };
})(typeof self !== 'undefined' ? self : this);
