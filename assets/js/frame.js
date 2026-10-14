// Yazı sayfalarının üst bölümünü (geri bağlantısı, kategori, başlık, tarih) üreten ortak kod.
// Hem tarayıcıda (assets/js/app.js) hem de yayın sırasında (scripts/build.mjs) aynı kod kullanılır.
(function (g, f) {
  if (typeof module === 'object' && module.exports) module.exports = f();
  else g.PostFrame = f();
})(typeof self !== 'undefined' ? self : this, function () {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = d => new Date(d + 'T12:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  // Okuma süresi: dakikada yaklaşık 200 kelime
  const minutes = t => Math.max(1, Math.round(String(t).trim().split(/\s+/).filter(Boolean).length / 200));
  const frame = (m, C, root) =>
    `<a class="back" href="${root}index.html">‹ Tüm yazılar</a><br>` +
    `<a class="tag" href="${root}index.html?cat=${encodeURIComponent(m.cat)}">${esc(C[m.cat] || m.cat)}</a>` +
    `<h1>${esc(m.title)}</h1>` +
    `<div class="meta"><time datetime="${m.date}">${fmt(m.date)}</time><span>${m.read} dk okuma</span></div>`;
  return { esc, fmt, minutes, frame };
});
