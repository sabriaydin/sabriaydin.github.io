// Araç yazılarında ortak kullanılan küçük yardımcılar (kopyalama, indirme)
window.Arac = (() => {
  // Metni panoya kopyalar; düğmenin yazısını kısa süre "Kopyalandı ✓" yapar
  const kopyala = async (metin, dugme) => {
    let ok = false;
    try { await navigator.clipboard.writeText(metin); ok = true; }
    catch (e) {
      const t = document.createElement('textarea');
      t.value = metin; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(t); t.select();
      try { ok = document.execCommand('copy'); } catch (e2) {}
      t.remove();
    }
    if (dugme) {
      const eski = dugme.dataset.t || (dugme.dataset.t = dugme.textContent);
      dugme.textContent = ok ? 'Kopyalandı ✓' : 'Kopyalanamadı';
      clearTimeout(dugme._t);
      dugme._t = setTimeout(() => { dugme.textContent = eski; }, 1600);
    }
    return ok;
  };

  // Metni dosya olarak indirir
  const indir = (metin, ad, tur) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([metin], { type: tur || 'text/plain' }));
    a.download = ad;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  // data-kopyala="elemanId" olan düğmeler o elemanın metnini kopyalar
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-kopyala]');
    if (!b) return;
    const el = document.getElementById(b.dataset.kopyala);
    if (el) kopyala('value' in el ? el.value : el.textContent, b);
  });

  return { kopyala, indir };
})();
