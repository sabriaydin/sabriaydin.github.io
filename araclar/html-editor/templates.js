/* Hazır şablonlar: [ad, HTML, CSS, JS, grup] */
window.HED_TPL=[
['Merhaba (başlangıç)',`<div class="kart">
  <h1>Merhaba Dünya 👋</h1>
  <p>Kodu değiştir, sonucu anında gör.</p>
  <button id="btn">Tıkla</button>
  <p id="sayi">0 tıklama</p>
</div>`,`body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  background: linear-gradient(135deg, #1f4e8c, #6c63ff);
}
.kart {
  padding: 32px 40px;
  border-radius: 18px;
  background: #fff;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, .3);
}
button {
  padding: 10px 22px;
  border: 0;
  border-radius: 10px;
  background: #6c63ff;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
}
button:hover { filter: brightness(1.1); }`,`var n = 0;
document.getElementById("btn").addEventListener("click", function () {
  n++;
  document.getElementById("sayi").textContent = n + " tıklama";
  console.log("Tıklama sayısı:", n);
});`,'Başlangıç'],
['Boş sayfa','','','','Başlangıç'],
['Tam HTML belgesi',`<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Belgem</title>
  <style>
    body { font-family: Georgia, serif; max-width: 640px; margin: 40px auto; padding: 0 16px; line-height: 1.7; }
    h1 { color: #b72a25; }
  </style>
</head>
<body>
  <h1>Tam belge modu</h1>
  <p>HTML bölümüne tam bir belge yazarsan CSS ve JS bölümleri bu belgeye otomatik eklenir.</p>
</body>
</html>`,`/* Buradaki kurallar belgenin <head> bölümüne eklenir */
p { color: #333; }`,`console.log("Tam belge çalıştı");`,'Başlangıç'],

['Açılış sayfası (Landing)',`<header class="ust">
  <a class="logo" href="#">Bulutix</a>
  <nav><a href="#ozellikler">Özellikler</a><a href="#yorumlar">Yorumlar</a><a class="btn kucuk" href="#basla">Ücretsiz dene</a></nav>
</header>
<section class="hero">
  <span class="rozet">Yeni · Sürüm 2.0</span>
  <h1>Ekibinin işini <em>tek yerde</em> topla</h1>
  <p>Görevleri, dosyaları ve sohbetleri bir araya getiren sade ve hızlı çalışma alanı.</p>
  <div class="dugmeler"><a class="btn" id="basla" href="#">Hemen başla</a><a class="btn bos" href="#">Demoyu izle</a></div>
</section>
<section class="ozellikler" id="ozellikler">
  <div class="oz"><i>⚡</i><h3>Çok hızlı</h3><p>Milisaniyeler içinde yüklenen arayüz.</p></div>
  <div class="oz"><i>🔒</i><h3>Güvenli</h3><p>Uçtan uca şifreleme ve düzenli yedekleme.</p></div>
  <div class="oz"><i>🤝</i><h3>Birlikte çalış</h3><p>Gerçek zamanlı ortak düzenleme.</p></div>
</section>
<section class="yorum" id="yorumlar">
  <blockquote>“Ekibimizin verimliliği iki katına çıktı.”<cite>— Elif K., Ürün Müdürü</cite></blockquote>
</section>
<footer>© 2026 Bulutix. Tüm hakları saklıdır.</footer>`,`* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; color: #1c2230; background: #fff; }
.ust { display: flex; justify-content: space-between; align-items: center; padding: 18px 6vw; }
.logo { font-weight: 800; font-size: 1.3rem; color: #4f46e5; text-decoration: none; }
nav { display: flex; gap: 22px; align-items: center; }
nav a { color: #475069; text-decoration: none; font-weight: 500; }
.btn { display: inline-block; padding: 14px 28px; border-radius: 12px; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-weight: 700; text-decoration: none; box-shadow: 0 10px 24px rgba(79, 70, 229, .35); transition: transform .2s; }
.btn:hover { transform: translateY(-2px); }
.btn.kucuk { padding: 9px 18px; box-shadow: none; color: #fff; }
.btn.bos { background: #fff; color: #4f46e5; border: 2px solid #c7c3ff; box-shadow: none; }
.hero { text-align: center; padding: 70px 6vw 60px; background: radial-gradient(circle at 50% 0, #ece9ff, #fff 70%); }
.rozet { display: inline-block; padding: 6px 14px; border-radius: 99px; background: #e8e6ff; color: #4f46e5; font-size: .85rem; font-weight: 700; }
h1 { margin: 18px auto; max-width: 14em; font-size: clamp(2rem, 6vw, 3.6rem); line-height: 1.1; letter-spacing: -.02em; }
h1 em { font-style: normal; background: linear-gradient(135deg, #4f46e5, #ec4899); -webkit-background-clip: text; background-clip: text; color: transparent; }
.hero p { max-width: 34em; margin: 0 auto 28px; color: #5a6480; font-size: 1.15rem; }
.dugmeler { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
.ozellikler { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; padding: 40px 6vw; }
.oz { padding: 26px; border: 1px solid #e6e8f0; border-radius: 18px; background: #fff; }
.oz i { font-style: normal; font-size: 1.8rem; }
.oz h3 { margin: 10px 0 6px; }
.oz p { margin: 0; color: #5a6480; }
.yorum { padding: 40px 6vw; background: #f6f6fb; text-align: center; }
blockquote { margin: 0 auto; max-width: 30em; font-size: 1.4rem; font-weight: 600; }
cite { display: block; margin-top: 12px; font-size: .95rem; font-weight: 400; color: #5a6480; }
footer { padding: 24px; text-align: center; color: #8a92a8; font-size: .9rem; }`,`document.querySelectorAll('a[href="#"]').forEach(function (a) {
  a.addEventListener("click", function (e) { e.preventDefault(); console.log("Tıklandı:", a.textContent.trim()); });
});`,'Web sayfaları'],

['Kişisel portföy',`<nav class="menu"><b>ayse.dev</b><a href="#hakkimda">Hakkımda</a><a href="#projeler">Projeler</a><a href="#iletisim">İletişim</a></nav>
<main>
  <section class="giris">
    <p class="selam">Merhaba, ben</p>
    <h1>Ayşe Yılmaz</h1>
    <p class="alt">Arayüz tasarlayan ve kodlayan yazılımcı.</p>
    <div class="etiket"><span>HTML</span><span>CSS</span><span>JavaScript</span><span>Figma</span></div>
  </section>
  <section id="hakkimda"><h2>Hakkımda</h2><p>Kullanıcı deneyimine önem veren, sade ve erişilebilir web siteleri üzerine çalışıyorum. Boş zamanlarımda fotoğraf çekerim.</p></section>
  <section id="projeler"><h2>Projeler</h2>
    <div class="izgara">
      <article class="proje" style="--h:250"><h3>Hava Paneli</h3><p>Canlı hava durumu uygulaması.</p></article>
      <article class="proje" style="--h:170"><h3>Lezzet Defteri</h3><p>Tarif yönetimi ve alışveriş listesi.</p></article>
      <article class="proje" style="--h:310"><h3>Kodlama Oyunu</h3><p>Çocuklar için eğitici oyun.</p></article>
    </div>
  </section>
  <section id="iletisim"><h2>İletişim</h2><a class="mail" href="#">merhaba@ayse.dev</a></section>
</main>`,`* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; background: #0f1220; color: #e6e9f5; font-family: system-ui, sans-serif; line-height: 1.6; }
.menu { position: sticky; top: 0; display: flex; gap: 22px; align-items: center; padding: 16px 6vw; background: rgba(15, 18, 32, .85); backdrop-filter: blur(8px); }
.menu b { margin-right: auto; }
.menu a { color: #aab1d1; text-decoration: none; }
.menu a:hover { color: #fff; }
main { padding: 0 6vw 60px; max-width: 980px; margin: auto; }
.giris { padding: 90px 0 50px; }
.selam { margin: 0; color: #8f98c4; }
h1 { margin: 4px 0; font-size: clamp(2.4rem, 8vw, 4.6rem); line-height: 1; letter-spacing: -.03em; background: linear-gradient(90deg, #7c8cff, #ff7ab8); -webkit-background-clip: text; background-clip: text; color: transparent; }
.alt { font-size: 1.3rem; color: #c7cdee; }
.etiket span { display: inline-block; margin: 4px 6px 0 0; padding: 5px 14px; border: 1px solid #343a60; border-radius: 99px; font-size: .85rem; color: #aab1d1; }
h2 { margin: 56px 0 14px; font-size: 1.5rem; }
.izgara { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px; }
.proje { padding: 24px; border-radius: 16px; background: linear-gradient(160deg, hsl(var(--h) 55% 28%), #171a30); border: 1px solid #2a2f52; transition: transform .2s; }
.proje:hover { transform: translateY(-4px); }
.proje h3 { margin: 0 0 6px; }
.proje p { margin: 0; color: #c0c6e6; }
.mail { color: #7c8cff; font-size: 1.2rem; }`,`document.querySelector(".mail").addEventListener("click", function (e) {
  e.preventDefault();
  console.log("E-posta bağlantısı tıklandı");
});`,'Web sayfaları'],

['Blog makalesi',`<article class="yazi">
  <p class="kategori">Teknoloji</p>
  <h1>Yapay zekâ ile günlük işleri hızlandırmanın 5 yolu</h1>
  <div class="bilgi"><span>Ayşe Yılmaz</span><span>12 Ekim 2026</span><span>5 dk okuma</span></div>
  <p class="giris">Her gün tekrarladığımız küçük işler, toplamda saatlerimizi alır. Doğru araçlarla bu süreyi ciddi biçimde azaltmak mümkün.</p>
  <h2>1. E-postaları özetle</h2>
  <p>Uzun yazışmaları birkaç cümleye indirerek önemli noktalara hızla ulaşabilirsin.</p>
  <blockquote>Zamanı yönetmek, enerjiyi yönetmektir.</blockquote>
  <h2>2. Toplantı notlarını çıkar</h2>
  <p>Toplantıdan sonra eylem maddelerini otomatik listelemek takip işini kolaylaştırır.</p>
  <pre><code>const ozet = notlar.filter(n =&gt; n.onemli);</code></pre>
  <h2>3. Araştırmayı kısalt</h2>
  <p>Kaynakları tarayıp karşılaştırma tablosu çıkarmak, saatler süren bir işi dakikalara indirir.</p>
</article>`,`body { margin: 0; background: #f5f2ec; color: #222; font-family: Georgia, "Times New Roman", serif; }
.yazi { max-width: 680px; margin: 0 auto; padding: 56px 20px 80px; font-size: 1.15rem; line-height: 1.8; }
.kategori { margin: 0; color: #b72a25; font: 700 .8rem system-ui, sans-serif; letter-spacing: .14em; text-transform: uppercase; }
h1 { margin: 10px 0 14px; font: 800 clamp(2rem, 5vw, 2.9rem) / 1.15 system-ui, sans-serif; letter-spacing: -.02em; }
.bilgi { display: flex; flex-wrap: wrap; gap: 6px 18px; padding-bottom: 20px; border-bottom: 1px solid #d9d4c8; color: #777; font: .9rem system-ui, sans-serif; }
.giris { font-size: 1.3rem; color: #444; }
.giris::first-letter { float: left; margin: 6px 10px 0 0; font-size: 3.6rem; line-height: .8; font-weight: 700; color: #b72a25; }
h2 { margin: 1.8em 0 .4em; font: 700 1.5rem system-ui, sans-serif; }
blockquote { margin: 1.6em 0; padding: 4px 0 4px 20px; border-left: 4px solid #b72a25; font-size: 1.35rem; font-style: italic; color: #444; }
pre { padding: 14px 16px; border-radius: 10px; background: #23252b; color: #e8e8e8; overflow-x: auto; font-size: .9rem; }`,'','Web sayfaları'],

['Fiyatlandırma tablosu',`<section class="sayfa">
  <h1>Size uygun planı seçin</h1>
  <p class="alt">İstediğiniz zaman plan değiştirebilirsiniz.</p>
  <div class="anahtar"><span id="aylik" class="on">Aylık</span><button id="sw" aria-label="Dönem değiştir"></button><span id="yillik">Yıllık <b>-%20</b></span></div>
  <div class="planlar">
    <article class="plan"><h2>Başlangıç</h2><p class="fiyat"><b data-a="0" data-y="0">0</b> ₺<small>/ay</small></p><ul><li>1 proje</li><li>1 GB depolama</li><li>Topluluk desteği</li></ul><a href="#">Ücretsiz başla</a></article>
    <article class="plan one"><span class="etiket">En popüler</span><h2>Profesyonel</h2><p class="fiyat"><b data-a="249" data-y="199">249</b> ₺<small>/ay</small></p><ul><li>Sınırsız proje</li><li>100 GB depolama</li><li>Öncelikli destek</li><li>Gelişmiş raporlar</li></ul><a href="#">Planı seç</a></article>
    <article class="plan"><h2>Kurumsal</h2><p class="fiyat"><b data-a="799" data-y="639">799</b> ₺<small>/ay</small></p><ul><li>Sınırsız her şey</li><li>1 TB depolama</li><li>7/24 destek</li><li>Özel entegrasyon</li></ul><a href="#">İletişime geç</a></article>
  </div>
</section>`,`* { box-sizing: border-box; }
body { margin: 0; background: #f3f4fa; color: #1c2230; font-family: system-ui, sans-serif; }
.sayfa { max-width: 980px; margin: auto; padding: 56px 20px; text-align: center; }
h1 { margin: 0; font-size: clamp(1.8rem, 5vw, 2.6rem); }
.alt { color: #66708a; }
.anahtar { display: inline-flex; align-items: center; gap: 12px; margin: 14px 0 30px; font-weight: 600; color: #8a92a8; }
.anahtar .on { color: #1c2230; }
.anahtar b { color: #16a34a; font-size: .8rem; }
#sw { position: relative; width: 48px; height: 26px; border: 0; border-radius: 99px; background: #4f46e5; cursor: pointer; }
#sw::after { content: ""; position: absolute; left: 3px; top: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: transform .2s; }
#sw.y::after { transform: translateX(22px); }
.planlar { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; align-items: stretch; }
.plan { position: relative; padding: 30px 26px; border-radius: 20px; background: #fff; border: 1px solid #e3e6f0; text-align: left; }
.plan.one { border: 2px solid #4f46e5; box-shadow: 0 20px 44px rgba(79, 70, 229, .22); transform: translateY(-8px); }
.etiket { position: absolute; top: -13px; left: 26px; padding: 4px 12px; border-radius: 99px; background: #4f46e5; color: #fff; font-size: .75rem; font-weight: 700; }
.plan h2 { margin: 0; font-size: 1.1rem; color: #66708a; }
.fiyat { margin: 10px 0 16px; font-size: 1.1rem; }
.fiyat b { font-size: 2.8rem; letter-spacing: -.03em; }
.fiyat small { color: #8a92a8; }
ul { padding: 0; margin: 0 0 22px; list-style: none; }
li { padding: 7px 0; border-bottom: 1px solid #eef0f6; }
li::before { content: "✓ "; color: #16a34a; font-weight: 700; }
.plan a { display: block; padding: 12px; border-radius: 12px; background: #eef0ff; color: #4f46e5; text-align: center; font-weight: 700; text-decoration: none; }
.one a { background: #4f46e5; color: #fff; }`,`var yillik = false;
var sw = document.getElementById("sw");
function guncelle() {
  document.querySelectorAll(".fiyat b").forEach(function (b) {
    b.textContent = yillik ? b.dataset.y : b.dataset.a;
  });
  sw.classList.toggle("y", yillik);
  document.getElementById("aylik").className = yillik ? "" : "on";
  document.getElementById("yillik").className = yillik ? "on" : "";
}
sw.addEventListener("click", function () { yillik = !yillik; guncelle(); });`,'Web sayfaları'],

['Giriş ve kayıt formu',`<div class="kutu">
  <div class="sekme"><button class="on" data-t="giris">Giriş yap</button><button data-t="kayit">Kayıt ol</button></div>
  <form id="f" novalidate>
    <label class="ad" hidden>Ad Soyad<input name="ad" autocomplete="name"></label>
    <label>E-posta<input name="mail" type="email" autocomplete="email" placeholder="ornek@mail.com"></label>
    <label>Parola<div class="par"><input name="par" type="password" autocomplete="current-password"><button type="button" id="goz" aria-label="Parolayı göster">👁</button></div></label>
    <div class="guc" hidden><i></i><i></i><i></i><i></i><span></span></div>
    <p class="hata" id="hata" role="alert"></p>
    <button class="gonder" id="gonder">Giriş yap</button>
  </form>
</div>`,`* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: linear-gradient(135deg, #0f172a, #312e81); font-family: system-ui, sans-serif; }
.kutu { width: min(400px, 92vw); padding: 28px; border-radius: 20px; background: #fff; box-shadow: 0 30px 60px rgba(0, 0, 0, .4); }
.sekme { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 4px; margin-bottom: 20px; border-radius: 12px; background: #eef0f6; }
.sekme button { padding: 10px; border: 0; border-radius: 9px; background: transparent; font-weight: 700; color: #66708a; cursor: pointer; }
.sekme .on { background: #fff; color: #1c2230; box-shadow: 0 2px 8px rgba(0, 0, 0, .1); }
label { display: block; margin-bottom: 14px; font-size: .9rem; font-weight: 600; color: #475069; }
input { display: block; width: 100%; margin-top: 6px; padding: 12px 14px; border: 1.5px solid #d6dae6; border-radius: 10px; font-size: 1rem; outline: 0; }
input:focus { border-color: #4f46e5; box-shadow: 0 0 0 4px rgba(79, 70, 229, .15); }
.par { position: relative; }
#goz { position: absolute; right: 8px; top: 12px; border: 0; background: none; cursor: pointer; font-size: 1.1rem; }
.guc { display: flex; gap: 5px; align-items: center; margin: -4px 0 12px; }
.guc i { flex: 1; height: 5px; border-radius: 3px; background: #e3e6f0; }
.guc span { min-width: 56px; font-size: .8rem; color: #66708a; }
.hata { min-height: 1.2em; margin: 0 0 8px; color: #dc2626; font-size: .9rem; }
.gonder { width: 100%; padding: 13px; border: 0; border-radius: 12px; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-size: 1rem; font-weight: 700; cursor: pointer; }`,`var mod = "giris";
var f = document.getElementById("f");
var hata = document.getElementById("hata");
document.querySelectorAll(".sekme button").forEach(function (b) {
  b.addEventListener("click", function () {
    mod = b.dataset.t;
    document.querySelectorAll(".sekme button").forEach(function (x) { x.classList.toggle("on", x === b); });
    f.querySelector(".ad").hidden = mod !== "kayit";
    f.querySelector(".guc").hidden = mod !== "kayit";
    document.getElementById("gonder").textContent = mod === "kayit" ? "Hesap oluştur" : "Giriş yap";
    hata.textContent = "";
  });
});
document.getElementById("goz").addEventListener("click", function () {
  var p = f.par; p.type = p.type === "password" ? "text" : "password";
});
f.par.addEventListener("input", function () {
  var v = f.par.value, s = 0;
  if (v.length >= 8) s++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
  if (/[0-9]/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  var renk = ["#e3e6f0", "#ef4444", "#f59e0b", "#84cc16", "#16a34a"];
  f.querySelectorAll(".guc i").forEach(function (i, k) { i.style.background = k < s ? renk[s] : "#e3e6f0"; });
  f.querySelector(".guc span").textContent = ["", "Zayıf", "Orta", "İyi", "Güçlü"][s];
});
f.addEventListener("submit", function (e) {
  e.preventDefault();
  if (mod === "kayit" && !f.ad.value.trim()) { hata.textContent = "Ad soyad gerekli."; return; }
  if (!/^[^@ ]+@[^@ ]+[.][^@ ]+$/.test(f.mail.value)) { hata.textContent = "Geçerli bir e-posta yazın."; return; }
  if (f.par.value.length < 6) { hata.textContent = "Parola en az 6 karakter olmalı."; return; }
  hata.style.color = "#16a34a"; hata.textContent = "Başarılı! (örnek form)";
});`,'Web sayfaları'],

['Yönetim paneli (Dashboard)',`<div class="duzen">
  <aside class="yan"><b>Panel</b><a class="on" href="#">📊 Genel bakış</a><a href="#">👥 Müşteriler</a><a href="#">🛒 Siparişler</a><a href="#">⚙️ Ayarlar</a></aside>
  <main>
    <header><h1>Genel bakış</h1><select id="donem"><option value="0">Son 7 gün</option><option value="1">Son 30 gün</option></select></header>
    <section class="kartlar" id="kartlar"></section>
    <section class="kutu"><h2>Haftalık satışlar</h2><div class="grafik" id="grafik"></div></section>
    <section class="kutu"><h2>Son siparişler</h2>
      <table><thead><tr><th>No</th><th>Müşteri</th><th>Tutar</th><th>Durum</th></tr></thead>
      <tbody><tr><td>#1042</td><td>Ali Demir</td><td>1.240 ₺</td><td><span class="r y">Tamamlandı</span></td></tr>
      <tr><td>#1041</td><td>Zeynep Kaya</td><td>860 ₺</td><td><span class="r b">Bekliyor</span></td></tr>
      <tr><td>#1040</td><td>Mert Yıldız</td><td>2.130 ₺</td><td><span class="r y">Tamamlandı</span></td></tr></tbody></table>
    </section>
  </main>
</div>`,`* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; background: #f1f3f9; color: #1c2230; }
.duzen { display: grid; grid-template-columns: 220px 1fr; min-height: 100vh; }
.yan { display: flex; flex-direction: column; gap: 4px; padding: 20px 14px; background: #111827; color: #cbd5e1; }
.yan b { padding: 6px 12px 18px; font-size: 1.2rem; color: #fff; }
.yan a { padding: 10px 12px; border-radius: 10px; color: inherit; text-decoration: none; }
.yan a.on, .yan a:hover { background: #1f2937; color: #fff; }
main { padding: 24px; min-width: 0; }
header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
h1 { margin: 0; font-size: 1.5rem; }
select { padding: 8px 12px; border: 1px solid #d6dae6; border-radius: 10px; background: #fff; }
.kartlar { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 14px; }
.k { padding: 18px; border-radius: 16px; background: #fff; box-shadow: 0 1px 3px rgba(0, 0, 0, .06); }
.k small { color: #66708a; }
.k b { display: block; margin: 4px 0; font-size: 1.7rem; }
.k .art { color: #16a34a; font-size: .85rem; font-weight: 600; }
.k .azal { color: #dc2626; font-size: .85rem; font-weight: 600; }
.kutu { margin-bottom: 14px; padding: 18px; border-radius: 16px; background: #fff; overflow-x: auto; }
.kutu h2 { margin: 0 0 14px; font-size: 1.05rem; }
.grafik { display: flex; align-items: flex-end; gap: 12px; height: 180px; }
.cubuk { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; gap: 6px; font-size: .8rem; color: #66708a; }
.cubuk div { width: 100%; border-radius: 8px 8px 0 0; background: linear-gradient(#818cf8, #4f46e5); transition: height .5s; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 10px 8px; border-bottom: 1px solid #eef0f6; text-align: left; }
th { color: #66708a; font-size: .85rem; }
.r { padding: 3px 10px; border-radius: 99px; font-size: .8rem; font-weight: 600; }
.r.y { background: #dcfce7; color: #166534; }
.r.b { background: #fef3c7; color: #92400e; }
@media (max-width: 640px) { .duzen { grid-template-columns: 1fr; } .yan { flex-direction: row; overflow-x: auto; } .yan b { display: none; } }`,`var veri = [
  { kartlar: [["Gelir", "48.250 ₺", "+12%", 1], ["Sipariş", "312", "+5%", 1], ["Müşteri", "1.284", "+2%", 1], ["İade", "14", "-3%", 0]], g: [40, 65, 52, 80, 70, 95, 60] },
  { kartlar: [["Gelir", "192.400 ₺", "+18%", 1], ["Sipariş", "1.240", "+9%", 1], ["Müşteri", "4.870", "+7%", 1], ["İade", "52", "+4%", 0]], g: [55, 48, 72, 66, 90, 78, 85] }
];
var gunler = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
function ciz(i) {
  var d = veri[i];
  document.getElementById("kartlar").innerHTML = d.kartlar.map(function (k) {
    return '<div class="k"><small>' + k[0] + '</small><b>' + k[1] + '</b><span class="' + (k[3] ? "art" : "azal") + '">' + k[2] + '</span></div>';
  }).join("");
  document.getElementById("grafik").innerHTML = d.g.map(function (v, n) {
    return '<div class="cubuk"><div style="height:' + v + '%"></div>' + gunler[n] + '</div>';
  }).join("");
}
document.getElementById("donem").addEventListener("change", function (e) { ciz(+e.target.value); });
ciz(0);`,'Web sayfaları'],

['Duyarlı gezinme çubuğu',`<header class="ust">
  <a class="logo" href="#">◆ Marka</a>
  <button class="burger" id="burger" aria-label="Menü" aria-expanded="false"><span></span><span></span><span></span></button>
  <nav id="nav">
    <a class="on" href="#">Ana sayfa</a>
    <div class="alt"><a href="#">Ürünler ▾</a><div class="acilir"><a href="#">Yazılım</a><a href="#">Donanım</a><a href="#">Hizmetler</a></div></div>
    <a href="#">Blog</a><a href="#">İletişim</a>
  </nav>
</header>
<main><h1>Sayfa içeriği</h1><p>Pencereyi daralt: menü hamburger düğmesine dönüşür.</p></main>`,`* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; background: #f6f7fb; color: #1c2230; }
.ust { position: relative; display: flex; align-items: center; justify-content: space-between; padding: 0 5vw; height: 64px; background: #fff; box-shadow: 0 2px 12px rgba(0, 0, 0, .08); }
.logo { font-weight: 800; color: #4f46e5; text-decoration: none; font-size: 1.2rem; }
nav { display: flex; align-items: center; gap: 6px; }
nav a { display: block; padding: 8px 14px; border-radius: 8px; color: #475069; text-decoration: none; font-weight: 500; }
nav a:hover, nav a.on { background: #eef0ff; color: #4f46e5; }
.alt { position: relative; }
.acilir { position: absolute; top: 100%; left: 0; min-width: 160px; padding: 6px; border-radius: 12px; background: #fff; box-shadow: 0 12px 30px rgba(0, 0, 0, .15); opacity: 0; visibility: hidden; transform: translateY(6px); transition: .18s; }
.alt:hover .acilir, .alt:focus-within .acilir { opacity: 1; visibility: visible; transform: none; }
.burger { display: none; width: 42px; height: 42px; border: 0; border-radius: 10px; background: #eef0ff; cursor: pointer; }
.burger span { display: block; width: 20px; height: 2px; margin: 4px auto; background: #4f46e5; transition: .2s; }
.burger[aria-expanded="true"] span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.burger[aria-expanded="true"] span:nth-child(2) { opacity: 0; }
.burger[aria-expanded="true"] span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
main { padding: 40px 5vw; }
@media (max-width: 640px) {
  .burger { display: block; }
  nav { position: absolute; top: 64px; left: 0; right: 0; flex-direction: column; align-items: stretch; padding: 10px 5vw 16px; background: #fff; box-shadow: 0 12px 20px rgba(0, 0, 0, .1); display: none; }
  nav.acik { display: flex; }
  .acilir { position: static; opacity: 1; visibility: visible; transform: none; box-shadow: none; padding-left: 14px; }
}`,`var b = document.getElementById("burger"), nav = document.getElementById("nav");
b.addEventListener("click", function () {
  var acik = nav.classList.toggle("acik");
  b.setAttribute("aria-expanded", acik);
});
nav.querySelectorAll("a").forEach(function (a) {
  a.addEventListener("click", function (e) { e.preventDefault(); });
});`,'Bileşenler'],

['Modal pencere ve bildirim',`<main>
  <h1>Modal ve bildirim</h1>
  <button class="btn" id="ac">Pencereyi aç</button>
  <button class="btn ikinci" id="bildir">Bildirim göster</button>
</main>
<div class="perde" id="perde" hidden>
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="bs">
    <h2 id="bs">Silmek istediğine emin misin?</h2>
    <p>Bu işlem geri alınamaz.</p>
    <div class="alt"><button class="btn ikinci" id="vazgec">Vazgeç</button><button class="btn kirmizi" id="sil">Evet, sil</button></div>
  </div>
</div>
<div class="toasts" id="toasts" aria-live="polite"></div>`,`* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #eef0f7; font-family: system-ui, sans-serif; }
main { text-align: center; }
.btn { padding: 12px 22px; border: 0; border-radius: 10px; background: #4f46e5; color: #fff; font-weight: 700; font-size: 1rem; cursor: pointer; }
.btn.ikinci { background: #e3e6f3; color: #1c2230; }
.btn.kirmizi { background: #dc2626; }
.perde { position: fixed; inset: 0; display: grid; place-items: center; background: rgba(15, 20, 40, .55); backdrop-filter: blur(3px); animation: gir .2s; }
.perde[hidden] { display: none; }
.modal { width: min(380px, 90vw); padding: 26px; border-radius: 18px; background: #fff; box-shadow: 0 30px 60px rgba(0, 0, 0, .35); animation: yuk .25s; }
.modal h2 { margin: 0 0 8px; font-size: 1.2rem; }
.modal p { margin: 0 0 20px; color: #66708a; }
.alt { display: flex; justify-content: flex-end; gap: 10px; }
.toasts { position: fixed; right: 16px; bottom: 16px; display: flex; flex-direction: column; gap: 10px; }
.toast { padding: 12px 18px; border-radius: 12px; background: #111827; color: #fff; box-shadow: 0 10px 24px rgba(0, 0, 0, .3); animation: yuk .25s; }
.toast.cik { opacity: 0; transition: opacity .3s; }
@keyframes gir { from { opacity: 0; } }
@keyframes yuk { from { opacity: 0; transform: translateY(14px) scale(.97); } }`,`var perde = document.getElementById("perde");
function bildir(metin) {
  var t = document.createElement("div");
  t.className = "toast"; t.textContent = metin;
  document.getElementById("toasts").appendChild(t);
  setTimeout(function () { t.classList.add("cik"); setTimeout(function () { t.remove(); }, 300); }, 2500);
}
function kapat() { perde.hidden = true; }
document.getElementById("ac").onclick = function () { perde.hidden = false; };
document.getElementById("vazgec").onclick = kapat;
document.getElementById("sil").onclick = function () { kapat(); bildir("Öğe silindi ✓"); };
document.getElementById("bildir").onclick = function () { bildir("Merhaba! Bu bir bildirim."); };
perde.addEventListener("click", function (e) { if (e.target === perde) kapat(); });
document.addEventListener("keydown", function (e) { if (e.key === "Escape") kapat(); });`,'Bileşenler'],

['SSS akordeon',`<section class="sss">
  <h1>Sık sorulan sorular</h1>
  <details open><summary>Ücretsiz deneme var mı?</summary><p>Evet, 14 gün boyunca tüm özellikleri ücretsiz deneyebilirsiniz.</p></details>
  <details><summary>Planımı değiştirebilir miyim?</summary><p>İstediğiniz zaman yükseltebilir veya düşürebilirsiniz.</p></details>
  <details><summary>Verilerim güvende mi?</summary><p>Tüm veriler şifrelenir ve günlük olarak yedeklenir.</p></details>
  <details><summary>Destek nasıl alırım?</summary><p>Canlı sohbet veya e-posta ile hafta içi her gün ulaşabilirsiniz.</p></details>
</section>`,`body { margin: 0; background: #f4f5fa; font-family: system-ui, sans-serif; color: #1c2230; }
.sss { max-width: 640px; margin: 0 auto; padding: 50px 20px; }
h1 { margin: 0 0 22px; text-align: center; }
details { margin-bottom: 12px; border-radius: 14px; background: #fff; border: 1px solid #e3e6f0; overflow: hidden; }
summary { position: relative; padding: 18px 50px 18px 20px; font-weight: 700; cursor: pointer; list-style: none; }
summary::-webkit-details-marker { display: none; }
summary::after { content: "+"; position: absolute; right: 20px; top: 50%; transform: translateY(-50%); width: 26px; height: 26px; border-radius: 50%; background: #eef0ff; color: #4f46e5; text-align: center; line-height: 26px; transition: transform .2s; }
details[open] summary::after { content: "–"; transform: translateY(-50%) rotate(180deg); }
details[open] summary { color: #4f46e5; }
details p { margin: 0; padding: 0 20px 18px; color: #5a6480; line-height: 1.6; animation: ac .25s; }
@keyframes ac { from { opacity: 0; transform: translateY(-6px); } }`,`/* Aynı anda yalnızca bir madde açık kalsın */
document.querySelectorAll("details").forEach(function (d) {
  d.addEventListener("toggle", function () {
    if (d.open) document.querySelectorAll("details").forEach(function (o) { if (o !== d) o.open = false; });
  });
});`,'Bileşenler'],

['Sekmeli içerik',`<div class="sekmeler">
  <div class="bas" role="tablist">
    <button role="tab" aria-selected="true" data-i="0">Genel</button>
    <button role="tab" aria-selected="false" data-i="1">Özellikler</button>
    <button role="tab" aria-selected="false" data-i="2">Yorumlar</button>
    <span class="cizgi"></span>
  </div>
  <div class="panel" role="tabpanel"><h2>Genel bakış</h2><p>Ürünün kısa tanıtımı burada yer alır.</p></div>
  <div class="panel" role="tabpanel" hidden><h2>Özellikler</h2><p>Hafif, hızlı ve kolay kullanımlı.</p></div>
  <div class="panel" role="tabpanel" hidden><h2>Yorumlar</h2><p>“Harika bir ürün!” — Elif</p></div>
</div>`,`body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #eef0f7; font-family: system-ui, sans-serif; color: #1c2230; }
.sekmeler { width: min(520px, 92vw); border-radius: 18px; background: #fff; box-shadow: 0 16px 40px rgba(20, 30, 70, .14); overflow: hidden; }
.bas { position: relative; display: flex; border-bottom: 1px solid #e6e9f2; }
.bas button { flex: 1; padding: 16px; border: 0; background: none; font-size: 1rem; font-weight: 600; color: #7a839c; cursor: pointer; }
.bas button[aria-selected="true"] { color: #4f46e5; }
.cizgi { position: absolute; bottom: -1px; left: 0; height: 3px; width: 33.33%; background: #4f46e5; transition: transform .25s; }
.panel { padding: 24px; animation: gir .3s; }
.panel[hidden] { display: none; }
.panel h2 { margin: 0 0 8px; }
.panel p { margin: 0; color: #5a6480; }
@keyframes gir { from { opacity: 0; transform: translateX(10px); } }`,`var tabs = document.querySelectorAll('[role="tab"]');
var panels = document.querySelectorAll('[role="tabpanel"]');
tabs.forEach(function (t) {
  t.addEventListener("click", function () {
    var i = +t.dataset.i;
    tabs.forEach(function (x, k) { x.setAttribute("aria-selected", k === i); });
    panels.forEach(function (p, k) { p.hidden = k !== i; });
    document.querySelector(".cizgi").style.transform = "translateX(" + (i * 100) + "%)";
  });
});`,'Bileşenler'],

['Cam efektli hava kartı',`<div class="sahne">
  <div class="kart">
    <div class="ust"><div><h2>İstanbul</h2><small>Salı, 14:30</small></div><span class="ikon">⛅</span></div>
    <p class="derece">21°</p>
    <p class="durum">Parçalı bulutlu</p>
    <div class="alt">
      <div><b>%62</b><small>Nem</small></div>
      <div><b>14 km/s</b><small>Rüzgâr</small></div>
      <div><b>1012</b><small>Basınç</small></div>
    </div>
    <div class="gunler"><div>Çar<br>⛅<br>22°</div><div>Per<br>🌧<br>18°</div><div>Cum<br>☀️<br>25°</div><div>Cmt<br>☀️<br>26°</div></div>
  </div>
</div>`,`body { margin: 0; font-family: system-ui, sans-serif; }
.sahne { min-height: 100vh; display: grid; place-items: center; background: radial-gradient(circle at 20% 20%, #ffb36b, transparent 45%), radial-gradient(circle at 80% 70%, #6b8bff, transparent 45%), linear-gradient(135deg, #2b3a67, #1a1f3a); }
.kart { width: min(340px, 90vw); padding: 24px; border-radius: 28px; color: #fff; background: rgba(255, 255, 255, .14); border: 1px solid rgba(255, 255, 255, .35); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); box-shadow: 0 24px 60px rgba(0, 0, 0, .35); }
.ust { display: flex; justify-content: space-between; align-items: center; }
.ust h2 { margin: 0; }
.ust small { opacity: .8; }
.ikon { font-size: 2.6rem; }
.derece { margin: 6px 0 0; font-size: 5rem; font-weight: 200; line-height: 1; }
.durum { margin: 0 0 18px; opacity: .9; }
.alt { display: flex; justify-content: space-between; padding: 14px 0; border-block: 1px solid rgba(255, 255, 255, .25); text-align: center; }
.alt b { display: block; }
.alt small { opacity: .75; }
.gunler { display: flex; justify-content: space-between; margin-top: 16px; text-align: center; font-size: .9rem; line-height: 1.7; }`,'','Bileşenler'],

['Hesap makinesi',`<div class="hm">
  <div class="ekran"><small id="gecmis"></small><output id="sonuc">0</output></div>
  <div class="tus">
    <button data-t="C" class="op">C</button><button data-t="sil" class="op">⌫</button><button data-t="%" class="op">%</button><button data-t="/" class="op">÷</button>
    <button>7</button><button>8</button><button>9</button><button data-t="*" class="op">×</button>
    <button>4</button><button>5</button><button>6</button><button data-t="-" class="op">−</button>
    <button>1</button><button>2</button><button>3</button><button data-t="+" class="op">+</button>
    <button class="sifir">0</button><button>.</button><button data-t="=" class="esit">=</button>
  </div>
</div>`,`body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #1b1d2a; font-family: system-ui, sans-serif; }
.hm { width: min(320px, 92vw); padding: 18px; border-radius: 26px; background: #262a3d; box-shadow: 0 24px 60px rgba(0, 0, 0, .5); }
.ekran { min-height: 100px; padding: 10px 8px 14px; text-align: right; color: #fff; }
.ekran small { display: block; min-height: 1.4em; color: #8f98c4; }
output { display: block; font-size: 2.8rem; font-weight: 300; overflow: hidden; text-overflow: ellipsis; }
.tus { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
button { height: 62px; border: 0; border-radius: 18px; background: #323752; color: #fff; font-size: 1.3rem; cursor: pointer; transition: transform .1s, filter .15s; }
button:hover { filter: brightness(1.2); }
button:active { transform: scale(.94); }
.op { background: #3f4670; color: #9fb0ff; }
.esit { background: linear-gradient(135deg, #6c63ff, #8b5cf6); }
.sifir { grid-column: span 2; }`,`var ifade = "", sonuc = document.getElementById("sonuc"), gecmis = document.getElementById("gecmis");
function goster() { sonuc.textContent = ifade.replace(/[*]/g, "×").replace(/[/]/g, "÷") || "0"; }
function hesapla() {
  if (!ifade) return;
  if (!/^[0-9+*/.%() -]+$/.test(ifade)) return;
  try {
    var s = ifade.replace(/([0-9.]+)%/g, "($1/100)");
    var r = Function('"use strict"; return (' + s + ")")();
    if (!isFinite(r)) throw new Error("sonsuz");
    gecmis.textContent = ifade.replace(/[*]/g, "×").replace(/[/]/g, "÷") + " =";
    ifade = String(Math.round(r * 1e10) / 1e10);
  } catch (e) { gecmis.textContent = "Hata"; ifade = ""; }
  goster();
}
document.querySelector(".tus").addEventListener("click", function (e) {
  var b = e.target.closest("button"); if (!b) return;
  var t = b.dataset.t || b.textContent;
  if (t === "C") { ifade = ""; gecmis.textContent = ""; }
  else if (t === "sil") ifade = ifade.slice(0, -1);
  else if (t === "=") { hesapla(); return; }
  else ifade += t;
  goster();
});
document.addEventListener("keydown", function (e) {
  if (/^[0-9+*/.%-]$/.test(e.key)) { ifade += e.key; goster(); }
  else if (e.key === "Enter") hesapla();
  else if (e.key === "Backspace") { ifade = ifade.slice(0, -1); goster(); }
});`,'Uygulamalar'],

['Dijital saat ve geri sayım',`<div class="saat">
  <p class="tarih" id="tarih"></p>
  <p class="zaman" id="zaman">00:00:00</p>
  <div class="geri">
    <h2>Yılbaşına kalan süre</h2>
    <div class="kutular"><div><b id="g">0</b><small>gün</small></div><div><b id="s">0</b><small>saat</small></div><div><b id="d">0</b><small>dakika</small></div><div><b id="sn">0</b><small>saniye</small></div></div>
  </div>
</div>`,`body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0b1020; color: #e8ecff; font-family: system-ui, sans-serif; }
.saat { text-align: center; padding: 20px; }
.tarih { margin: 0; color: #8f98c4; letter-spacing: .1em; text-transform: uppercase; }
.zaman { margin: 6px 0 40px; font: 200 clamp(3rem, 14vw, 7rem) ui-monospace, Consolas, monospace; text-shadow: 0 0 30px rgba(124, 140, 255, .6); }
h2 { margin: 0 0 14px; font-size: 1rem; color: #aab1d1; font-weight: 500; }
.kutular { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.kutular div { min-width: 84px; padding: 16px 10px; border-radius: 16px; background: #151b34; border: 1px solid #262d52; }
.kutular b { display: block; font-size: 2rem; }
.kutular small { color: #8f98c4; }`,`var gunAd = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
var ayAd = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
function iki(n) { return (n < 10 ? "0" : "") + n; }
function tik() {
  var n = new Date();
  document.getElementById("zaman").textContent = iki(n.getHours()) + ":" + iki(n.getMinutes()) + ":" + iki(n.getSeconds());
  document.getElementById("tarih").textContent = n.getDate() + " " + ayAd[n.getMonth()] + " " + n.getFullYear() + ", " + gunAd[n.getDay()];
  var hedef = new Date(n.getFullYear() + 1, 0, 1), fark = Math.max(0, hedef - n);
  document.getElementById("g").textContent = Math.floor(fark / 864e5);
  document.getElementById("s").textContent = Math.floor(fark / 36e5) % 24;
  document.getElementById("d").textContent = Math.floor(fark / 6e4) % 60;
  document.getElementById("sn").textContent = Math.floor(fark / 1e3) % 60;
}
tik(); setInterval(tik, 1000);`,'Uygulamalar'],

['Not defteri (kayıtlı)',`<div class="uyg">
  <aside><button id="yeni">+ Yeni not</button><ul id="liste"></ul></aside>
  <section><input id="baslik" placeholder="Başlık"><textarea id="icerik" placeholder="Notunu yaz…"></textarea><div class="alt"><span id="durum">Hazır</span><button id="sil">Sil</button></div></section>
</div>`,`* { box-sizing: border-box; }
body { margin: 0; height: 100vh; font-family: system-ui, sans-serif; background: #f4f1ea; }
.uyg { display: grid; grid-template-columns: 240px 1fr; height: 100%; }
aside { display: flex; flex-direction: column; border-right: 1px solid #ddd6c6; background: #ece7db; min-height: 0; }
#yeni { margin: 12px; padding: 10px; border: 0; border-radius: 10px; background: #b72a25; color: #fff; font-weight: 700; cursor: pointer; }
ul { flex: 1; margin: 0; padding: 0 8px 8px; list-style: none; overflow-y: auto; }
li { padding: 10px 12px; margin-bottom: 4px; border-radius: 8px; cursor: pointer; }
li b { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
li small { color: #8a8472; }
li.on, li:hover { background: #fff; }
section { display: flex; flex-direction: column; padding: 18px 24px; min-width: 0; }
#baslik { border: 0; background: none; font: 700 1.6rem system-ui; outline: 0; }
#icerik { flex: 1; margin-top: 10px; border: 0; background: none; font: 1.05rem/1.7 Georgia, serif; resize: none; outline: 0; }
.alt { display: flex; justify-content: space-between; align-items: center; color: #8a8472; font-size: .85rem; }
#sil { border: 0; background: none; color: #b72a25; cursor: pointer; }
@media (max-width: 560px) { .uyg { grid-template-columns: 1fr; grid-template-rows: 150px 1fr; } aside { border-right: 0; border-bottom: 1px solid #ddd6c6; } }`,`var notlar = [], aktif = null;
try { notlar = JSON.parse(localStorage.getItem("notlar") || "[]"); } catch (e) {}
var liste = document.getElementById("liste"), baslik = document.getElementById("baslik"), icerik = document.getElementById("icerik"), durum = document.getElementById("durum");
function kaydet() { try { localStorage.setItem("notlar", JSON.stringify(notlar)); durum.textContent = "Kaydedildi ✓"; } catch (e) { durum.textContent = "Kaydedilemedi"; } }
function ciz() {
  liste.innerHTML = "";
  notlar.forEach(function (n, i) {
    var li = document.createElement("li"); li.className = i === aktif ? "on" : "";
    var b = document.createElement("b"); b.textContent = n.b || "Başlıksız";
    var s = document.createElement("small"); s.textContent = (n.i || "Boş not").slice(0, 30);
    li.appendChild(b); li.appendChild(s);
    li.onclick = function () { ac(i); };
    liste.appendChild(li);
  });
}
function ac(i) { aktif = i; baslik.value = notlar[i].b; icerik.value = notlar[i].i; ciz(); }
document.getElementById("yeni").onclick = function () { notlar.unshift({ b: "", i: "" }); kaydet(); ac(0); baslik.focus(); };
document.getElementById("sil").onclick = function () { if (aktif === null) return; notlar.splice(aktif, 1); aktif = null; baslik.value = icerik.value = ""; kaydet(); ciz(); };
function degis() { if (aktif === null) return; notlar[aktif].b = baslik.value; notlar[aktif].i = icerik.value; kaydet(); ciz(); }
baslik.oninput = icerik.oninput = degis;
if (!notlar.length) { notlar.push({ b: "Hoş geldin", i: "Notların tarayıcında saklanır." }); }
ac(0);`,'Uygulamalar'],

['Test (Quiz) uygulaması',`<div class="quiz">
  <div class="ust"><span id="no">Soru 1/4</span><span id="puan">Puan: 0</span></div>
  <div class="bar"><i id="bar"></i></div>
  <h2 id="soru"></h2>
  <div id="sec"></div>
  <button id="ileri" hidden>Sonraki →</button>
</div>`,`body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: linear-gradient(135deg, #1e3a8a, #7c3aed); font-family: system-ui, sans-serif; }
.quiz { width: min(480px, 92vw); padding: 26px; border-radius: 22px; background: #fff; box-shadow: 0 30px 60px rgba(0, 0, 0, .35); }
.ust { display: flex; justify-content: space-between; color: #66708a; font-weight: 600; font-size: .9rem; }
.bar { height: 6px; margin: 10px 0 20px; border-radius: 3px; background: #e6e9f2; overflow: hidden; }
.bar i { display: block; height: 100%; width: 0; background: linear-gradient(90deg, #4f46e5, #ec4899); transition: width .3s; }
h2 { margin: 0 0 16px; font-size: 1.25rem; line-height: 1.35; }
#sec button { display: block; width: 100%; margin-bottom: 10px; padding: 14px 16px; border: 2px solid #e1e5f0; border-radius: 12px; background: #fff; text-align: left; font-size: 1rem; cursor: pointer; transition: .15s; }
#sec button:hover:not(:disabled) { border-color: #4f46e5; background: #f5f4ff; }
#sec .dogru { border-color: #16a34a; background: #dcfce7; }
#sec .yanlis { border-color: #dc2626; background: #fee2e2; }
#ileri { width: 100%; padding: 13px; border: 0; border-radius: 12px; background: #4f46e5; color: #fff; font-weight: 700; font-size: 1rem; cursor: pointer; }
.son { text-align: center; }
.son b { display: block; margin: 10px 0; font-size: 3rem; color: #4f46e5; }`,`var sorular = [
  { s: "HTML'in açılımı nedir?", c: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language"], d: 0 },
  { s: "Hangisi bir CSS özelliğidir?", c: ["margin", "href", "alt"], d: 0 },
  { s: "JavaScript'te sabit değişken nasıl tanımlanır?", c: ["var", "const", "set"], d: 1 },
  { s: "Sayfa başlığı hangi etikette yazılır?", c: ["<head>", "<title>", "<h6>"], d: 1 }
];
var i = 0, puan = 0, kilit = false;
var sec = document.getElementById("sec"), ileri = document.getElementById("ileri");
function goster() {
  var q = sorular[i]; kilit = false; ileri.hidden = true;
  document.getElementById("no").textContent = "Soru " + (i + 1) + "/" + sorular.length;
  document.getElementById("puan").textContent = "Puan: " + puan;
  document.getElementById("bar").style.width = (i / sorular.length * 100) + "%";
  document.getElementById("soru").textContent = q.s;
  sec.innerHTML = "";
  q.c.forEach(function (m, k) {
    var b = document.createElement("button"); b.textContent = m;
    b.onclick = function () {
      if (kilit) return; kilit = true;
      if (k === q.d) { puan++; b.className = "dogru"; } else { b.className = "yanlis"; sec.children[q.d].className = "dogru"; }
      document.getElementById("puan").textContent = "Puan: " + puan;
      ileri.hidden = false; ileri.textContent = i === sorular.length - 1 ? "Sonucu gör" : "Sonraki →";
    };
    sec.appendChild(b);
  });
}
ileri.onclick = function () {
  i++;
  if (i < sorular.length) { goster(); return; }
  document.querySelector(".quiz").innerHTML = '<div class="son"><h2>Test bitti 🎉</h2><b>' + puan + "/" + sorular.length + '</b><button id="tekrar" style="padding:12px 24px;border:0;border-radius:12px;background:#4f46e5;color:#fff;font-weight:700;cursor:pointer">Tekrar dene</button></div>';
  document.getElementById("tekrar").onclick = function () { location.reload(); };
};
goster();`,'Uygulamalar'],

['Renk paleti üretici',`<div class="uyg">
  <h1>Renk paleti</h1>
  <p class="ip">Boşluk tuşuna bas veya düğmeye tıkla. Rengi kopyalamak için üzerine tıkla.</p>
  <div class="palet" id="palet"></div>
  <button id="yenile">Yeni palet üret</button>
</div>`,`* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f5f5f8; font-family: system-ui, sans-serif; color: #1c2230; }
.uyg { width: min(760px, 94vw); text-align: center; padding: 30px 0; }
h1 { margin: 0; }
.ip { color: #66708a; }
.palet { display: flex; height: 260px; margin: 22px 0; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 40px rgba(0, 0, 0, .15); }
.renk { flex: 1; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 18px; font: 700 .95rem ui-monospace, Consolas, monospace; cursor: pointer; transition: flex .3s; }
.renk:hover { flex: 1.4; }
button { padding: 13px 28px; border: 0; border-radius: 12px; background: #1c2230; color: #fff; font-weight: 700; font-size: 1rem; cursor: pointer; }
@media (max-width: 560px) { .palet { flex-direction: column; height: 380px; } .renk { align-items: center; padding: 0; } }`,`function hsl(h, s, l) {
  s /= 100; l /= 100;
  var a = s * Math.min(l, 1 - l);
  function f(n) { var k = (n + h / 30) % 12, c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return Math.round(255 * c).toString(16).padStart(2, "0"); }
  return "#" + f(0) + f(8) + f(4);
}
function uret() {
  var h = Math.floor(Math.random() * 360), p = document.getElementById("palet");
  p.innerHTML = "";
  [[0, 70, 45], [25, 65, 55], [180, 55, 50], [200, 60, 35], [330, 25, 92]].forEach(function (x, k) {
    var kod = hsl((h + x[0]) % 360, x[1], x[2]), d = document.createElement("div");
    d.className = "renk"; d.style.background = kod; d.textContent = kod.toUpperCase();
    d.style.color = x[2] > 70 ? "#222" : "#fff";
    d.onclick = function () {
      if (navigator.clipboard) navigator.clipboard.writeText(kod).catch(function () {});
      d.textContent = "Kopyalandı ✓"; setTimeout(function () { d.textContent = kod.toUpperCase(); }, 900);
      console.log("Renk:", kod);
    };
    p.appendChild(d);
  });
}
document.getElementById("yenile").onclick = uret;
document.addEventListener("keydown", function (e) { if (e.code === "Space") { e.preventDefault(); uret(); } });
uret();`,'Uygulamalar'],

['CSS yükleyiciler (loader)',`<div class="izgara">
  <div class="k"><div class="l1"></div><small>Dönen halka</small></div>
  <div class="k"><div class="l2"><i></i><i></i><i></i></div><small>Zıplayan noktalar</small></div>
  <div class="k"><div class="l3"><i></i><i></i><i></i><i></i></div><small>Ses çubukları</small></div>
  <div class="k"><div class="l4"></div><small>Nabız</small></div>
  <div class="k"><div class="l5"><i></i></div><small>İlerleme çubuğu</small></div>
  <div class="k"><div class="l6"></div><small>Kare dönüşü</small></div>
</div>`,`body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0f1220; font-family: system-ui, sans-serif; }
.izgara { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; width: min(640px, 92vw); }
.k { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 22px; height: 170px; border-radius: 18px; background: #171b30; border: 1px solid #262d52; }
small { color: #8f98c4; }
.l1 { width: 48px; height: 48px; border: 5px solid #262d52; border-top-color: #7c8cff; border-radius: 50%; animation: don 1s linear infinite; }
.l2 { display: flex; gap: 8px; }
.l2 i { width: 14px; height: 14px; border-radius: 50%; background: #ff7ab8; animation: zipla .6s ease-in-out infinite alternate; }
.l2 i:nth-child(2) { animation-delay: .15s; }
.l2 i:nth-child(3) { animation-delay: .3s; }
.l3 { display: flex; align-items: center; gap: 5px; height: 48px; }
.l3 i { width: 7px; height: 100%; border-radius: 4px; background: #5eead4; animation: ses 1s ease-in-out infinite; }
.l3 i:nth-child(2) { animation-delay: .1s; }
.l3 i:nth-child(3) { animation-delay: .2s; }
.l3 i:nth-child(4) { animation-delay: .3s; }
.l4 { width: 40px; height: 40px; border-radius: 50%; background: #fbbf24; animation: nabiz 1.2s ease-out infinite; }
.l5 { width: 110px; height: 8px; border-radius: 4px; background: #262d52; overflow: hidden; }
.l5 i { display: block; width: 40%; height: 100%; border-radius: 4px; background: linear-gradient(90deg, #7c8cff, #ff7ab8); animation: kay 1.2s ease-in-out infinite; }
.l6 { width: 38px; height: 38px; border-radius: 8px; background: #fb7185; animation: kare 1.4s ease-in-out infinite; }
@keyframes don { to { transform: rotate(360deg); } }
@keyframes zipla { to { transform: translateY(-18px); opacity: .5; } }
@keyframes ses { 0%, 100% { transform: scaleY(.25); } 50% { transform: scaleY(1); } }
@keyframes nabiz { 0% { box-shadow: 0 0 0 0 rgba(251, 191, 36, .6); } 100% { box-shadow: 0 0 0 34px rgba(251, 191, 36, 0); } }
@keyframes kay { 0% { transform: translateX(-100%); } 100% { transform: translateX(260%); } }
@keyframes kare { 0% { transform: rotate(0); border-radius: 8px; } 50% { transform: rotate(180deg); border-radius: 50%; } 100% { transform: rotate(360deg); border-radius: 8px; } }`,'','Animasyon'],

['Animasyonlu gradyan başlık',`<main>
  <p class="ust">Yeni nesil tasarım</p>
  <h1>Hayal et. <span>Tasarla.</span> Yayınla.</h1>
  <a href="#">Keşfetmeye başla →</a>
</main>
<i class="b b1"></i><i class="b b2"></i><i class="b b3"></i>`,`body { margin: 0; min-height: 100vh; display: grid; place-items: center; overflow: hidden; background: #070914; font-family: system-ui, sans-serif; color: #fff; }
main { position: relative; z-index: 1; padding: 20px; text-align: center; }
.ust { margin: 0 0 8px; letter-spacing: .3em; text-transform: uppercase; font-size: .8rem; color: #9aa3d8; }
h1 { margin: 0 0 28px; font-size: clamp(2.4rem, 9vw, 5.5rem); line-height: 1.05; letter-spacing: -.03em; }
h1 span { background: linear-gradient(90deg, #7c8cff, #ff7ab8, #fbbf24, #7c8cff); background-size: 300% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: kay 6s linear infinite; }
a { display: inline-block; padding: 14px 30px; border-radius: 99px; background: rgba(255, 255, 255, .1); border: 1px solid rgba(255, 255, 255, .25); color: #fff; text-decoration: none; font-weight: 600; backdrop-filter: blur(8px); transition: .2s; }
a:hover { background: #fff; color: #070914; transform: translateY(-3px); }
.b { position: absolute; border-radius: 50%; filter: blur(70px); opacity: .55; animation: yuz 14s ease-in-out infinite alternate; }
.b1 { width: 420px; height: 420px; left: -80px; top: -80px; background: #4f46e5; }
.b2 { width: 360px; height: 360px; right: -60px; bottom: -60px; background: #ec4899; animation-delay: -5s; }
.b3 { width: 280px; height: 280px; left: 45%; top: 55%; background: #0ea5e9; animation-delay: -9s; }
@keyframes kay { to { background-position: 300% 0; } }
@keyframes yuz { to { transform: translate(90px, 60px) scale(1.2); } }`,'','Animasyon']
];
