# Sabri Aydın

Teknoloji, kodlama ve video oyunları üzerine kişisel blog. GitHub Pages üzerinde çalışır; yazı eklemek için tek yapman gereken `posts` klasörüne bir `.html` dosyası yüklemektir. Liste, arama, sitemap ve RSS otomatik güncellenir.

## Yayınlama (bir kez yapılır)
1. GitHub'da yeni depo aç ve bu klasörün **tüm içeriğini** yükle. Gizli klasör `.github` ve `.nojekyll` dosyası da dahil olmalı (web arayüzünde "Upload files" ile klasörü sürükle; `.github` görünmüyorsa Dosya Gezgini'nde gizli dosyaları göster).
2. **Settings > Pages > Build and deployment > Source** bölümünden **GitHub Actions** seç.
3. **Actions** sekmesinde "Siteyi yayınla" çalışmasının yeşil olmasını bekle. Site adresi Settings > Pages'te görünür.

Bundan sonra `main` dalına her dosya yüklediğinde site kendini yeniler (yaklaşık 1 dakika).

## Yeni yazı ekleme
1. `posts/_sablon.html` dosyasını kopyala, adını yazıya uygun yap (küçük harf, rakam ve tire: `yeni-yazi.html`).
2. Dosyanın üstündeki **DÜZENLE** bölümünü doldur:
   - `<title>`: yazının başlığı
   - `description`: ana sayfada ve aramada görünen kısa özet
   - `kategori`: `assets/js/site.js` içindeki kısa ad (şu an `windows`, `html`, `htmlaraclari`, `linuxos`, `batch`, `batchornek`, `sistemaraclari`, `medya`, `ofis`, `guvenlik`, `gelistirici` veya `eklentiler`)
   - `tarih`: `YIL-AY-GÜN` (örn. `2026-10-13`); aynı gün birden fazla yazı varsa sıralama için saat de eklenebilir (örn. `2026-10-13 14:30`)
   - `okuma`: dakika; boş bırakırsan otomatik hesaplanır
3. "İçerik buraya gelecek" satırını sil, yazını `<div class="body">` içine yaz.
4. Dosyayı `posts` klasörüne yükle. **Başka hiçbir yere bir şey eklemen gerekmez.**

Yazı hazır olana kadar dosya adını `_` ile başlat (`_taslak.html`); bu dosyalar listeye girmez ve yayınlanmaz. Yazıyı silmek için dosyayı sil. Eksik veya hatalı bilgi varsa ilgili yazı listeye eklenmez ve Actions sayfasında uyarı olarak nedeni görünür.

Yazılar en yeniden eskiye doğru sıralanır: önce tarihe ve varsa saate, aynı anda yazılanlarda dosya adına göre (büyük numara önce). Saat yazılmamış yazılar o günün en üstünde görünür. Ana sayfada yazılar 5'erli sayfalara bölünür (Önceki/Sonraki düğmeleri ve sayfa numaraları); ayrıca **Kategoriler** menüsü ve arama ile de ulaşılır. Sayfa başına yazı sayısı `assets/js/app.js` içindeki `PER` değerindedir.

## Araç (etkileşimli) yazısı ekleme
Hesaplayıcı, oluşturucu gibi çalışan araçlar da yazı olarak eklenir. Örnekler `posts/html-arac-*.html` dosyalarındadır:
1. Yazıyı normal şekilde hazırla (şablonu kopyala, bilgileri doldur).
2. Gövdeye `<div class="arac"> ... </div>` içinde araç arayüzünü, hemen ardına kendi `<script>` kodunu yaz. Hazır stiller (`satir`, `kod`, `dugmeler`, `palet`, `onizle`) `style.css` içinde bulunur.
3. Kopyalama ve indirme için yazının sonuna `<script src="../assets/js/arac.js"></script>` ekle; `data-kopyala="kutuId"` özellikli düğmeler o kutunun içeriğini kopyalar, `Arac.indir(metin, 'ad.html')` dosya indirir.
4. Okuma süresini otomatik hesaplatmak yerine `okuma` satırına dakika yazabilirsin.

## Yazı içinde kullanabileceklerin
```html
<p>Paragraf, <b>kalın</b>, <i>italik</i>, <code>satır içi kod</code> ve <a href="https://ornek.com">bağlantı</a>.</p>
<h2>Ara başlık</h2>
<h3>Alt başlık</h3>
<ul><li>Madde</li></ul>
<ol><li>Sıralı madde</li></ol>
<blockquote>Alıntı veya not</blockquote>
<pre>Çok satırlı kod bloğu</pre>
<figure><img src="../assets/img/gorsel.jpg" alt="Görselin açıklaması"><figcaption>Görsel altı yazısı</figcaption></figure>
<div class="video"><iframe src="https://www.youtube.com/embed/VIDEO_KODU" title="Video başlığı" allowfullscreen></iframe></div>
<table><thead><tr><th>Başlık</th></tr></thead><tbody><tr><td>Hücre</td></tr></tbody></table>
```
Kod bloğu içinde `<` ve `>` karakterlerini `&lt;` ve `&gt;` olarak yaz. Görselleri `assets/img/` klasörüne yükle.

## Site ayarları
`assets/js/site.js` dosyasından değiştirilir:
- `name`, `description`, `about`: site adı, özet ve footer metni
- `categories`: kategoriler (`kısa-ad: 'Görünen Ad'`). Menü, footer, filtre ve arama bundan beslenir. Yeni kategori eklemek için buraya bir satır ekle, yazılarda `kategori` olarak kısa adı kullan.
- `groups`: menüdeki alt kategori grupları (Kategoriler > Grup > Kategori). Her grup `{ key: 'linux', name: 'Linux', items: ['linuxos'] }` biçimindedir; `items` içine `categories` kısa adları yazılır. Grup adına tıklayınca gruptaki tüm yazılar listelenir (`?grup=linux`). Hiçbir gruba girmeyen kategori menüde tek başına görünür. Yeni alt kategori için önce `categories`'e satır ekle, sonra ilgili grubun `items` listesine ekle.
- `menus`: ana menüde Kategoriler'in yanında görünen ek menüler. `{ name: 'Araçlar', link: 'araclar' }` biçimi açılır liste olmadan doğrudan o kategoriye giden tek bir bağlantı yapar. Açılır menü örneği: örn. `{ name: 'Programlar', items: ['eklentiler'] }`. Bu menüdeki kategoriler Kategoriler içinde tekrar gösterilmez. Öğe `{ name: 'Proje', url: 'https://...' }` biçiminde yazılırsa kategori değil, doğrudan o adrese giden bir bağlantı olur. Öğe `{ name: 'Oyunlar', items: [{ name, url }] }` biçiminde yazılırsa o başlık altında sağa açılan bir bağlantı listesi olur (Projeler menüsü böyledir). Öğe `{ key: 'ucretsiz', name: 'Ücretsiz Programlar', items: [...] }` biçiminde yazılırsa kendi alt kategorileri olan sağa açılan bir grup olur.
- `links`: footer bağlantıları (şu an GitHub ve e-posta **örnek adrestir**, kendi bilgilerinle değiştir)

## Klasör yapısı
- `index.html`: ana sayfa
- `posts/`: her yazı kendi `.html` dosyasında; `posts/index.js` otomatik üretilir, elle düzenlenmez
- `posts/_sablon.html`: yeni yazı şablonu (yayınlanmaz)
- `404.html`: bulunamadı sayfası
- `assets/`: stil (`css`), kod (`js`; `arac.js` araç yazılarının ortak yardımcılarıdır), simge ve görseller (`img`)
- `scripts/build.mjs`: yazıları tarar, liste/sitemap/RSS/paylaşım etiketlerini üretir
- `.github/workflows/yayinla.yml`: her yüklemede build'i çalıştırıp siteyi yayınlar

## Bilgisayarında önizleme
`index.html` dosyasını tarayıcıda açabilirsin. Yeni yazıyı listede görmek için bir kez `node scripts/build.mjs` çalıştırman gerekir (Node.js kuruluysa); yazı sayfasının kendisi build'siz de açılır. Online sitede bu işi GitHub otomatik yapar.

## Neler hazır
- Yeni yazı algılama: tek dosya yükle, liste, sitemap, RSS ve arama güncellensin
- Ana sayfada sayfalama: 5'erli sayfalar, Önceki/Sonraki düğmeleri, sayfa numaraları; kategori ve arama sonuçlarında da çalışır
- Arama motoru ve sosyal medya paylaşımı için canonical, Open Graph, Twitter ve `BlogPosting` verisi; `sitemap.xml`, `feed.xml`, `robots.txt`
- Sitede arama: başlık, özet ve yazı metni; Türkçe karakterlerden bağımsız (zeka = zekâ), ok tuşlarıyla gezinme
- Klavye ve ekran okuyucu desteği (içeriğe geç bağlantısı, açılır menü, odak göstergesi)
- Yazı sayfalarında okuma çubuğu, önceki/sonraki yazı, benzer yazılar, bağlantıyı kopyalama, yazdırma düzeni
- Telefon, tablet ve masaüstü uyumlu görünüm
