/* HungerMan tanıtım sitesi: menü, sürüm, galeri, içindekiler, güncelleme listesi */
(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const mk = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const G = window.GECMIS || [];

  /* Dar ekran menüsü */
  const nav = $('nav'), ac = $('#menuAc');
  if (ac) ac.addEventListener('click', () => { nav.classList.toggle('acik'); ac.setAttribute('aria-expanded', nav.classList.contains('acik')); });
  $$('nav .baglar a').forEach(a => a.addEventListener('click', () => nav.classList.remove('acik')));

  /* Sürüm: oyunun kendi sabitlerinden okunur, olmazsa geçmişteki son sürüm yazılır */
  const yaz = s => $$('[data-surum]').forEach(e => { e.textContent = s; });
  if (G[0]) yaz(G[0].y[0].s);
  import('../js/sabitler.js').then(m => m.SURUM && yaz(m.SURUM)).catch(() => {});
  $$('[data-yil]').forEach(e => { e.textContent = new Date().getFullYear(); });

  /* Galeri: tıklanınca büyük görünüm */
  const b = $('#buyuk');
  if (b) {
    $$('.galeri figure, .sahne figure, .rFoto').forEach(f => f.addEventListener('click', () => {
      b.querySelector('img').src = f.querySelector('img').src;
      b.querySelector('p').textContent = f.querySelector('figcaption')?.textContent || f.querySelector('img').alt || '';
      b.classList.add('acik');
    }));
    b.addEventListener('click', () => b.classList.remove('acik'));
    addEventListener('keydown', e => { if (e.key === 'Escape') b.classList.remove('acik'); });
  }

  /* Rehber: okunan bölüm içindekilerde işaretlenir */
  const ic = $$('.icindekiler a');
  if (ic.length && 'IntersectionObserver' in window) {
    const hedef = new Map(ic.map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(ler => ler.forEach(l => {
      if (!l.isIntersecting) return;
      ic.forEach(a => a.classList.remove('etkin'));
      hedef.get(l.target.id)?.classList.add('etkin');
    }), { rootMargin: '-80px 0px -70% 0px' });
    hedef.forEach((a, id) => { const h = document.getElementById(id); if (h) io.observe(h); });
  }

  /* Yama kartı */
  const yama = (y, kutu) => {
    const d = mk('div', kutu ? 'kart surum' : 'yama'), h = mk(kutu ? 'header' : 'h4');
    h.append(mk('span', kutu ? 'no' : '', y.s), mk(kutu ? 'h3' : 'b', '', y.b));
    d.append(h);
    if (y.m.length === 1) d.append(mk('p', '', y.m[0]));
    else { const ul = mk('ul'); y.m.forEach(t => ul.append(mk('li', '', t))); d.append(ul); }
    return d;
  };

  /* Ana sayfa: son güncellemeler */
  const son = $('[data-son]');
  if (son) G.flatMap(g => g.y).slice(0, +son.dataset.son || 3).forEach(y => son.append(yama(y, true)));

  /* Güncellemeler sayfası */
  const liste = $('[data-gecmis]');
  if (liste) {
    const ara = $('#ara');
    const ciz = () => {
      const q = (ara?.value || '').trim().toLocaleLowerCase('tr');
      liste.textContent = '';
      let n = 0;
      G.forEach((g, i) => {
        const y = q ? g.y.filter(y => (y.s + ' ' + y.b + ' ' + y.m.join(' ')).toLocaleLowerCase('tr').includes(q)) : g.y;
        if (!y.length) return;
        n += y.length;
        const d = mk('details', 'kart grup'), s = mk('summary');
        s.append(mk('span', 'no', g.g), mk('h3', '', g.b), mk('small', '', y.length === 1 ? '1 sürüm' : y.length + ' sürüm'));
        d.append(s);
        const ic = mk('div', 'ic');
        y.forEach(x => ic.append(yama(x)));
        d.append(ic);
        if (i < 2 || q) d.open = true;
        liste.append(d);
      });
      if (!n) liste.append(mk('p', 'bos', 'Aradığınız şeyle eşleşen bir güncelleme bulunamadı.'));
    };
    ara?.addEventListener('input', ciz);
    ciz();
    $$('[data-sayi]').forEach(e => { e.textContent = G.reduce((t, g) => t + g.y.length, 0); });
  }
})();
