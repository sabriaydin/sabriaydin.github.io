# Oyunlar

Her oyun kendi klasöründe durur: `projeler/oyunlar/<oyun-adi>/`. Sitenin ana dizininde ayrıca bir `oyunlar` klasörü bulunmaz.
Menü bağlantısı `assets/js/site.js` → Projeler → Oyunlar → `items` içinden eklenir (Projeler menüsü Oyunlar, Programlar ve Diğer alt menülerinden oluşur).

## HungerMan (`projeler/oyunlar/hungerman/`)

Sıfırdan geliştirilen, her seferinde rastgele oluşan voksel tabanlı açık dünya hayatta kalma oyunu (Three.js r169, `lib/` içinde). Three.js kendi kopyası (`lib/`) ES modülü olarak yüklenir.
Çok oyunculu bölüm (`js/ag/`) eşler arası bağlantı için kendi `lib/peerjs.min.js` kopyasını kullanır; bu dosya yalnızca çok oyunculu açılınca yüklenir.
Ayrıntılı dosya düzeni ve aşama notları `projeler/oyunlar/hungerman/README.md` içindedir. Menü bağlantısı: Projeler → Oyunlar → HungerMan.
