# HungerMan

Tarayıcıda çalışan, her seferinde rastgele oluşan açık dünya hayatta kalma oyunu. Kurulum gerektirmez; dosyalar bir web sunucusundan (GitHub Pages dahil) yayınlandığında çalışır.

> Not: Oyun `file://` ile (dosyaya çift tıklayarak) açılırsa tarayıcı arka plan işçilerini engeller. Sitede yayınlandığında veya yerel bir sunucuyla açıldığında sorunsuz çalışır.

## 1. aşama (0.1.0)

- Tohumdan üretilen devasa dünya: kıyıları denizle çevrili büyük bir kıta (yaklaşık 3 500 x 3 500 blok; dünya sınırı 7 200 x 7 200 blok), nehirler, dağlar, adacıklar
- Biyomlar: okyanus, derin okyanus, nehir, kumsal, çayır, orman, huş ormanı, tayga, çöl, dağlar
- Meşe, huş ve ladin ağaçları; otlar, çiçekler, böğürtlen çalıları, mantarlar, deniz yosunu
- Kömür, bakır, demir, altın ve elmas cevherleri; kıvrımlı mağara tünelleri ve derinde geniş oyuklar
- Kazma, odunculuk, toplayıcılık; alet seviyeleri ve dayanımı (tahta, taş, bakır, demir, elmas)
- Üretim sistemi: el, Üretim Masası ve Fırın tarifleri (aramalı ve kategorili)
- Envanter (36 yuva), yere düşen eşyalar, eşya atma
- Can, açlık, oksijen; düşme hasarı, boğulma, açlıktan ölme; ölünce eşyalar yere düşer
- Gece-gündüz döngüsü (20 dakika), güneş, ay, yıldızlar, bulutlar; meşale ışığı
- Pusula, saat, F3 bilgi paneli, ayarlar (görüş mesafesi, görüş açısı, hassasiyet, ses)
- Otomatik kayıt (tarayıcının IndexedDB deposu), birden fazla dünya

## 2. aşama (0.2.0)

- Hayvanlar: inek, koyun, domuz, tavuk, tavşan ve kurt; biyomlarına göre gruplar hâlinde doğar, gezinir, vurulunca kaçar
- Kurtlar saldırıya uğrayana kadar zararsızdır; saldırılırsa sürü hâlinde karşılık verir
- Zombiler: geceleri yüzeyde, her zaman karanlık mağaralarda doğar; gün doğunca güneş altında yanar; meşale ve kamp ateşi çevresinde doğmaz
- Savaş: yakın dövüş (kılıç en güçlü silah), düşerken kritik vuruş, geri itme, yay ve ok (gerilerek atılır, saplanan ok geri toplanır)
- Zırh: deri, bakır, demir ve elmas; kask, göğüslük, pantolon, bot; hasarı en fazla %80 azaltır
- Yeni eşyalar: çiğ ve pişmiş etler, çürük et (mide bulantısı yapabilir), deri, tüy, yün, ip, çakmaktaşı
- Kamp ateşi (ışık verir, et pişirir), yatak (geceyi atlatır, doğma noktası belirler)
- Gösterge: zırh çubuğu, bakılan canlının adı ve canı

## 3. aşama (0.3.0)

- Köyler: dünya 384 x 384 bloklu bölgelere ayrılır, uygun bölgelerde tohuma göre köy kurulur (yaklaşık 25-30 köy). Kuyu, meydan, dört yönde yollar, küçük ve büyük evler, demirci, buğday tarlaları, pazar tezgâhları ve fener direkleri bulunur. Çöl ve tayga köyleri kendi malzemeleriyle yapılır. Yeni dünyalarda oyuncu bir köyün yanında doğar.
- Köylüler: çiftçi, kasap, demirci, oduncu, şifacı ve avcı; adları ve meslekleri köye göre sabittir. Gündüz köyde dolaşır, yanlarına gelindiğinde oyuncuya döner, zombilerden kaçar, geceleri evlerine çekilir.
- Ticaret: sikke ile alım-satım; her köylünün 5 takası vardır, takas hakları her sabah yenilenir.
- Görevler: getirme, avlanma (zombi, kurt) ve başka bir köye mektup götürme; aynı anda en fazla 3 görev; görev günlüğü (J) ve ekranda görev izleyici.
- İtibar: ticaret ve görevlerle yükselir, köylülere zarar vermekle düşer; fiyatları etkiler, çok düşükse köylüler ticaret yapmaz.
- Tarım: buğday tohumu (uzun ottan da düşer) toprak veya çimen üstüne ekilir ve olgunlaşır; buğdaydan ekmek ve saman balyası yapılır.
- Sandık: 27 yuvalı depolama; köy sandıklarında ganimet bulunur.
- Yeni eşyalar: sikke, ekmek, buğday, tohum, şifa iksiri, altın elma, mektup, kiremit, saman balyası, toprak yol.
- Pusula: yakındaki köyler (ev simgesi) ve görev hedefleri (sarı işaret) gösterilir.

## 4. aşama (0.4.0)

- Mağaralar: Y 10 ve altındaki boşluklar lav gölüdür; lav kendi ışığıyla parlar, yakar (4 hasar / 0,5 sn), içine düşen eşyaları yok eder. Lavdan çıkınca yanma birkaç saniye sürer; su yanmayı söndürür. Lav yanındaki blok kırılınca boşluğa lav dolar.
- Yarıklar: yer yer yüzeye kadar açılan, derinliklere inen kanyonlar.
- Parıltı kristalleri: derin mağaraların tavan ve tabanında, ışık saçan ve toplanabilen kristaller.
- Zindanlar: 56 x 56 bloklu hücrelerde yer yer bulunan, yosunlu taştan odalar; canavar yuvası ve değerli ganimet sandıkları (demir, altın, elmas, altın elma, yay, zırh, elmas kılıç vb.).
- Canavar yuvası: oyuncu yakındayken ve karanlıkta canavar çıkarır; çevresine meşale konunca durur; kırılınca sikke düşürür.
- Yeni düşmanlar: okçu iskelet (mesafeyi korur, görüş hattı varsa ok atar, güneşte yanar) ve mağara örümceği (duvara tırmanır, atılır, zehirler; aydınlıkta saldırmaz).
- Zehir: örümcek zehri canı 1 kalbin altına düşürmez; zehirliyken kalpler yeşile döner.
- Kemik ve kemik tozu: kemik tozu ekinleri hızla büyütür, fidanları ağaca dönüştürebilir, çimende çiçek açtırır.
- Mağara ortam sesleri (damla, lav fokurtusu), lav içinde turuncu görüş, yanma efekti.
- Yeni görevler: iskelet ve örümcek avı, kemik ve kristal getirme.
- Pusula yenilendi: derece göstergesi, çentikler, işaretlerin altında uzaklık, doğma noktası (★) ve son ölüm noktası (✖) işaretleri; görev ve ölüm işaretleri ekran dışındayken kenarda gösterilir.
- Saat/gün göstergesi yenilendi: gök yayında güneş veya ay, gün evresi (Şafak, Sabah, Öğle, İkindi, Akşam, Gece), gece uyarısı ve kalan süre, konum satırı (köy, biyom veya yeraltı derinliği).

## 5. aşama (0.5.0)

- Su altı ekosistemi: sığ okyanuslarda renkli mercan resifleri (blok ve dal mercanlar), deniz çayırı, deniz yosunu ve inci verebilen istiridyeler.
- Batık gemiler: 112 x 112 bloklu hücrelerde, derin okyanus tabanında kırık direkli ahşap gövdeler; kamarasında ve güvertesinde hazine sandıkları (sikke, inci, elmas, külçe, altın elma, dalış maskesi, palet, olta).
- Deniz canlıları: hamsi sürüleri, çipura, ahtapot ve derin açık denizde köpekbalığı. Balıklar üç boyutlu yüzer, oyuncudan kaçar, sudan çıkınca çırpınır; köpekbalığı sudaki oyuncuya saldırır.
- Balıkçılık: olta sağ tıkla atılır, şamandıra suda yüzer; balık vurunca şamandıra dalar ve o anda çekilirse av gelir (balık, ahtapot, çer çöp ya da hazine). Derin suda hazine olasılığı artar.
- Yeni yiyecekler: çiğ/pişmiş balık, çiğ/pişmiş ahtapot (kamp ateşi veya fırın).
- Dalış donanımı: dalış maskesi (oksijen üç kat yavaş azalır, su altında görüş uzar) ve palet (yüzme hızı artar, karada biraz yavaşlatır; C ile dalınır).
- Tekneler: sandal (çevik) ve yelkenli (hızlı). Suya konur, binilir (W/S hız, A/D dümen, C ile inilir), dalgada yalpalar, karaya oturur, vurularak kırılır; kürek ve yelken canlandırması, dalga sesleri. Tekneler kaydedilir.
- Limanlar: kıyıya yakın köylerin yolu kıyıya uzatılır; ahşap iskele, uç platformu ve fenerler, beyaz-kırmızı bantlı deniz feneri (döner merdiven, camlı ışık odası, geceleri dönen ışık huzmesi), balıkçı kulübesi ve demirli tekneler. Kıyı bölgelerinde limanlı balıkçı köyleri de kurulur.
- Balıkçı köylü: balık alır; olta, pişmiş balık, sandal, yelkenli, maske ve palet satar; balık, ahtapot, inci, köpekbalığı dişi ve köpekbalığı avı görevleri verir.
- Pusula: ⚓ liman ve ⛵ en yakın tekne işaretleri. Konum satırı tekne hızını ve su altı derinliğini gösterir.

## 6. aşama (0.6.0): Çok oyunculu

- Sunucu olma: oyun içinde duraklatma menüsündeki "Dünyayı Arkadaşlara Aç" düğmesi ya da ana menüde Çok Oyunculu > "Dünya Seç ve Aç". Dünyayı açan oyuncuya 6 karakterlik bir katılım kodu verilir (duraklatma menüsünde kopyalanabilir, Tab tuşuyla da görülür).
- Katılma: ana menüde Çok Oyunculu ekranından oyuncu adı ve katılım kodu girilir. En çok 8 oyuncu.
- Bağlantı doğrudan oyuncular arasında (WebRTC) kurulur; ayrı bir oyun sunucusu yoktur. İlk tanışma için PeerJS'in ücretsiz eşleştirme hizmeti kullanılır. Dünya, sunucu olan oyuncunun tarayıcısında kayıtlıdır.
- Ortak olanlar: blok değişiklikleri, canlılar (yapay zekâ sunucuda çalışır, her canlı en yakın oyuncuya göre davranır), yere düşen eşyalar, oklar, sandıklar (aynı anda tek oyuncu açabilir), tekneler (aynı anda tek oyuncu sürer), gece-gündüz ve köylüler.
- Kişisel olanlar: envanter, can ve açlık, görevler, köy itibarı, doğma noktası. Bunlar sunucuda oyuncu adıyla saklanır; aynı adla yeniden katılınca kalınan yerden devam edilir.
- Sunucu, diğer oyuncuların çevresindeki parçaları da (çizmeden) üretir; böylece uzaktaki oyuncunun çevresinde de hayvanlar, canavarlar ve köylüler yaşar.
- Diğer oyuncular insan modeliyle, isim etiketiyle ve ellerindeki eşyayla görünür; yürüme, koşma, eğilme, vurma ve tekne sürme canlandırılır. Pusulada renkli noktayla gösterilirler.
- Sohbet: T veya Enter. Oyuncu listesi ve katılım kodu: Tab (basılı tutulur). Katılma ve ayrılma bildirimleri sohbette görünür.
- Uyku: gece, tüm (canlı) oyuncular yatağa yattığında atlanır; yatakta beklerken hareket edilince kalkılır.
- Çok oyunculuda duraklatma menüsü dünyayı durdurmaz. Sekme arka plandayken de dünya işlemeye devam eder.
- Sunucu dünyayı kapatırsa ya da bağlantı koparsa diğer oyuncular bilgilendirilip ana menüye döner. Farklı sürümler, aynı ad ve dolu sunucu için açıklayıcı uyarılar verilir.
- Kendi eşleştirme sunucusunu kullanmak isteyenler için adres çubuğuna `?sinyal=adres:port` eklenebilir (örnek: `?sinyal=localhost:9000`).

## 7. aşama (0.7.0): Harita

- Keşif haritası: görüş mesafesine giren her yer üstten görünüm olarak kendiliğinden haritaya işlenir (en üstteki blok rengi, yükseklik gölgelemesi, su derinliği, sığ sularda taban ve kıyı çizgisi). Kırılan veya konan bloklar haritaya anında yansır.
- Harita, dünya kaydından ayrı olarak tarayıcı deposunda bölge bölge saklanır; dünya silinince haritası da silinir. Çok oyunculuda her oyuncunun haritası kendi tarayıcısında tutulur.
- Mini harita: sağ üstte yuvarlak, kuzey yukarıda; çevredeki köyler, limanlar, işaretler, görev hedefleri ve diğer oyuncular simgelerle görünür. Geceleri hafifçe kararır. Ayarlardan kapatılabilir.
- Büyük harita (M): sürükleyerek kaydırma, tekerlek veya +/− ile yakınlaştırma (1 blok = 1/8 pikselden 8 piksele kadar), "Konumum" düğmesi, ölçek çubuğu, kuzey göstergesi, yakında parça ızgarası ve dünya sınırı. İmlecin altındaki konum, biyom, yükseklik veya su derinliği ve uzaklık alt satırda gösterilir. Keşfedilen alan ve işaret sayısı başlıkta yazar.
- İşaretler: büyük haritada sol tıkla ad ve renk seçilerek işaret eklenir (en çok 30), işarete sol tıklanınca düzenlenir, sağ tıkla silinir. İşaretler pusulada ve mini haritada da görünür; kayıtla saklanır (çok oyunculuda sunucuda oyuncu adına).
- Pusula yenilendi: tuvalde çizilen, net çentikler; üst şeritte yönler (kuzey kırmızı) ve 30° aralıklı dereceler, alt şeritte vektör simgeli işaretler ve uzaklıklar. Çakışan uzaklık yazıları gizlenir, yakın işaretler önceliklidir; ekran dışındaki işaretler kenarda okla gösterilir.
- Saat ve gün göstergesi sadeleştirildi: tek satırlık yarı saydam şerit (gün ya da gecenin ilerleyişini gösteren küçük halka, güneş / hilal, saat, gün ve gün evresi), altında konum satırı ve yalnızca gerektiğinde görünen küçük gece uyarısı.

## 8. aşama (bu sürüm, 0.8.0): Düzenlemeler ve geliştirici konsolu

- Mini harita ile saat / gün şeridi ekranın sağ altına taşındı; hızlı erişim çubuğuyla aynı alt hizada, ortalanmış bir sütun olarak durur (üstten alta: gece uyarısı, konum, saat, mini harita). Görev izleyici sağ üste geçti.
- Pusulada yalnızca oyuncunun büyük haritada eklediği işaretler gösterilir; köy, liman, görev ve diğer işaretler mini haritada ve büyük haritada kalır.
- Yarıklar yeniden tasarlandı: tek blokluk düz çatlak yerine 8-18 blok genişliğinde, kıvrılarak ilerleyen, kenarlara doğru sığlaşan doğal kanyonlar. Tabanı lav seviyesinin üstündedir; su kenarında, köylerde ve ağaçların altında oluşmaz. (Dünya tohumdan üretildiği için mevcut dünyalardaki yarıklar da yeni biçimde görünür; oyuncunun yaptığı değişiklikler korunur.)
- Tekneler artık suyun üstünde yüzer; taban tahtası su yüzeyinin üstünde kalır, teknenin içi su dolu görünmez.
- Tekneden inme: C ya da Shift. Teknedeyken ekranda kısa bir hatırlatma görünür.
- Geliştirici konsolu (F8 veya 1 tuşunun solundaki tuş; Ayarlar'dan kapatılabilir): canlı bilgi satırı (FPS, konum, biyom, canlı ve parça sayısı, açık modlar), komut geçmişi (↑/↓), Tab ile komut ve ad tamamlama. Komutlar: yardim, ver, esyalar, envanter temizle, isinla (koordinat, ~ göreli, koy, liman, zindan, batik, dogum, isaret), zaman (saat, sabah/ogle/aksam/gece, hiz), gun, can, doy, iyiles, olumsuz, ucus, hiz, dogur, oldur, esya temizle, tekne, blok, bloklar, konum, tohum, gorus, kesfet, harita, kaydet, fps, hata, ag, sayac, temizle. Çok oyunculu istemcide dünyayı değiştiren komutlar kapalıdır.

## Sonraki aşamalar

Yeni aşamalar istek üzerine belirlenir.

## Klasör yapısı

```
index.html            Menüler ve oyun ekranı
css/oyun.css          Arayüz stilleri
lib/                  Three.js (r169, MIT lisansı), PeerJS (1.5.4, MIT lisansı; yalnız çok oyunculuda yüklenir)
js/ana.js             Giriş noktası: menüler, girdi, oyun döngüsü, kayıt
js/sabitler.js        Ortak sabitler (parça boyutu, deniz seviyesi, gün süresi)
js/rastgele.js        Tohumlu rastgele sayı ve gürültü fonksiyonları
js/bloklar.js         Blok, eşya ve alet tanımları
js/dunya/uretici.js   Dünya üretimi (kıta, biyom, ağaç, cevher, mağara)
js/dunya/koy-uretici.js Köy yerleşimi ve yapıları
js/dunya/zindan-uretici.js Zindan odaları
js/dunya/batik-uretici.js Batık gemiler
js/dunya/meshleyici.js Blokları çizilebilir geometriye çevirir
js/dunya/isci.js      Arka plan işçisi (üretim ve meshleme)
js/dunya/dunya.js     Parça yükleme / boşaltma, blok okuma-yazma
js/grafik/sahne.js    Çizici, gökyüzü, ışıklar, seçim kutusu, eldeki eşya
js/grafik/doku.js     Kodla çizilen dokular ve eşya simgeleri
js/grafik/fener.js    Deniz fenerlerinin dönen ışık huzmesi
js/oyun/*             Oyuncu, etkileşim, envanter, üretim, hayatta kalma, düşen eşyalar, olta, tekneler
js/varlik/*           Hayvanlar, deniz canlıları, düşmanlar ve köylüler: türler, modeller, yapay zekâ, oklar
js/koy/*              Köy yönetimi, meslekler ve takaslar, görevler
js/ag/*               Çok oyunculu: bağlantı (baglanti), sunucu, istemci, diğer oyuncuların görünümü, ortak yardımcılar
js/harita/harita.js   Keşif haritası: parçaların üstten görünümü, bölge tuvalleri
js/arayuz/*           Gösterge, envanter, köylü, büyük harita ve mini harita ekranları, vektör simgeler
js/sistem/harita-kayit.js Haritanın tarayıcı deposundaki kaydı
js/sistem/*           Ses ve kayıt
```

Tüm görseller ve sesler kodla üretilir; dışarıdan görsel veya ses dosyası kullanılmaz.
