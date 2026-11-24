# Oyunlar

Her oyun kendi klasöründe durur: `projeler/oyunlar/<oyun-adi>/`. Sitenin ana dizininde ayrıca bir `oyunlar` klasörü bulunmaz.
Menü bağlantısı `assets/js/site.js` → Projeler → Oyunlar → `items` içinden eklenir (Projeler menüsü Oyunlar, Programlar ve Diğer alt menülerinden oluşur).

## HungerMan (`projeler/oyunlar/hungerman/`)

Sıfırdan geliştirilen, her seferinde rastgele oluşan voksel tabanlı açık dünya hayatta kalma oyunu (Three.js r169, `lib/` içinde). Three.js kendi kopyası (`lib/`) ES modülü olarak yüklenir.
Çok oyunculu bölüm (`js/ag/`) eşler arası bağlantı için kendi `lib/peerjs.min.js` kopyasını kullanır; bu dosya yalnızca çok oyunculu açılınca yüklenir.
Menüdeki bağlantı (Projeler → Oyunlar → HungerMan) önce oyunun tanıtım sitesini açar; oyunun kendisi `oyna.html` sayfasındadır.

Tanıtım sitesi (ana blogdan bağımsız tema ve tasarım):
- `index.html`: ana sayfa (tanıtım, ekran görüntüleri, son güncellemeler, sık sorulanlar)
- `rehber.html`: oyun rehberi
- `guncellemeler.html`: güncelleme geçmişi (aranabilir)
- `404.html`: bulunamadı sayfası
- `site/`: sitenin stil, betik ve ekran görüntüleri. Güncelleme geçmişi `site/gecmis.js` içindedir; yeni sürüm bu dosyanın başına eklenir. Sürüm numarası oyunun `js/sabitler.js` dosyasından okunur.

Ayrıntılı dosya düzeni ve aşama notları `projeler/oyunlar/hungerman/README.md` içindedir.
