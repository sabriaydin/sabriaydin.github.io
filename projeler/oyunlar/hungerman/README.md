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

## 2. aşama (bu sürüm, 0.2.0)

- Hayvanlar: inek, koyun, domuz, tavuk, tavşan ve kurt; biyomlarına göre gruplar hâlinde doğar, gezinir, vurulunca kaçar
- Kurtlar saldırıya uğrayana kadar zararsızdır; saldırılırsa sürü hâlinde karşılık verir
- Zombiler: geceleri yüzeyde, her zaman karanlık mağaralarda doğar; gün doğunca güneş altında yanar; meşale ve kamp ateşi çevresinde doğmaz
- Savaş: yakın dövüş (kılıç en güçlü silah), düşerken kritik vuruş, geri itme, yay ve ok (gerilerek atılır, saplanan ok geri toplanır)
- Zırh: deri, bakır, demir ve elmas; kask, göğüslük, pantolon, bot; hasarı en fazla %80 azaltır
- Yeni eşyalar: çiğ ve pişmiş etler, çürük et (mide bulantısı yapabilir), deri, tüy, yün, ip, çakmaktaşı
- Kamp ateşi (ışık verir, et pişirir), yatak (geceyi atlatır, doğma noktası belirler)
- Gösterge: zırh çubuğu, bakılan canlının adı ve canı

## Sonraki aşamalar

1. Köyler, köylü NPC'ler, ticaret ve görev sistemi
2. Tehlikeli ve ödüllü gelişmiş mağara sistemi (lav, zindanlar, sandıklar)
3. Su altı ekosistemi, liman ve tekneler
4. Çok oyunculu (bir oyuncu sunucu olur, diğerleri kodla katılır)
5. Harita ve büyük harita ekranı

## Klasör yapısı

```
index.html            Menüler ve oyun ekranı
css/oyun.css          Arayüz stilleri
lib/                  Three.js (r169, MIT lisansı)
js/ana.js             Giriş noktası: menüler, girdi, oyun döngüsü, kayıt
js/sabitler.js        Ortak sabitler (parça boyutu, deniz seviyesi, gün süresi)
js/rastgele.js        Tohumlu rastgele sayı ve gürültü fonksiyonları
js/bloklar.js         Blok, eşya ve alet tanımları
js/dunya/uretici.js   Dünya üretimi (kıta, biyom, ağaç, cevher, mağara)
js/dunya/meshleyici.js Blokları çizilebilir geometriye çevirir
js/dunya/isci.js      Arka plan işçisi (üretim ve meshleme)
js/dunya/dunya.js     Parça yükleme / boşaltma, blok okuma-yazma
js/grafik/sahne.js    Çizici, gökyüzü, ışıklar, seçim kutusu, eldeki eşya
js/grafik/doku.js     Kodla çizilen dokular ve eşya simgeleri
js/oyun/*             Oyuncu, etkileşim, envanter, üretim, hayatta kalma, düşen eşyalar
js/varlik/*           Hayvanlar ve zombiler: türler, modeller, yapay zekâ, oklar
js/arayuz/*           Gösterge ve envanter ekranı
js/sistem/*           Ses ve kayıt
```

Tüm görseller ve sesler kodla üretilir; dışarıdan görsel veya ses dosyası kullanılmaz.
