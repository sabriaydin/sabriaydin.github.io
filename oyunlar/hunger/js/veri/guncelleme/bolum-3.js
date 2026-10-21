/* Hunger 3D - güncelleme notları: üçüncü bölüm güncellemeleri (Ana menü › Güncelleme Notları).
   Her kayıt: {n: güncelleme numarası, t: başlık, l: [değişiklik maddeleri]}. */
HG.UPD=(HG.UPD||[]).concat([
{n:27,d:"23.09.2026",t:"Oyun dengesi ve arayüz",l:[
 "El Taşı tarifi kaldırıldı. Aleti olmayan oyuncu, kayadan E tuşuyla günde bir kez taş toplayabiliyor.",
 "Ölüm ekranına Yeniden Doğ düğmesi eklendi.",
 "Kıyıda doğma noktaları eklendi.",
 "Kısayollar sayfası kaldırıldı; sabit kontroller Ayarlar › Kontrol sayfasında gösteriliyor.",
 "Bakır damarındaki kristal ve ağaç gövdesindeki ayrı kök kolları kaldırıldı."
]},
{n:28,d:"28.09.2026",t:"Etkileşim iyileştirmesi",l:[
 "E tuşuyla etkileşim hedefi seçimi daha isabetli hale getirildi (köylü, sandık, mağara).",
 "Aynı anda iki etkileşim ipucunun görünmesi sorunu giderildi."
]},
{n:29,d:"02.10.2026",t:"Arayüz düzeltmeleri",l:[
 "Envanterde eşyaya tıklayınca panelin büyümesi sorunu giderildi.",
 "Kazma ve kesme ipucundan verim çarpanı kaldırıldı."
]},
{n:30,d:"03.10.2026",t:"Köylü ve köy düzeltmeleri",l:[
 "Köylülerin akşam kapı kasasına takılması sorunu giderildi.",
 "Ev duvarının içine giren köy tezgâhı, ev dışına taşındı."
]},
{n:31,d:"04.10.2026",t:"Üretim süresi",l:[
 "Üretim süresi eklendi: malzeme hemen harcanıyor, eşya sıraya giriyor ve süre dolunca çantaya ekleniyor.",
 "Süre, malzeme miktarına ve değerine göre 1,5 ile 11 saniye arasında değişiyor; pişirme ve ergitme kısa sürüyor.",
 "Sıradaki üretimler iptal edilip malzemeler geri alınabiliyor.",
 "Üretim sırası ekranda gösterildi.",
 "Eşya açıklamasının envanter panelini genişletmesi sorunu giderildi."
]},
{n:32,d:"05.10.2026",t:"Kamp sandıkları ve köylü yatakları",l:[
 "Terk edilmiş kamp, enkaz ve mağara sandıkları artık Depo Sandığı penceresi gibi açılıyor; istenen eşyalar çantaya tek tek alınabiliyor.",
 "Boşaltılıp kapatılan sandık tükenmiş sayılıyor.",
 "Köylüler geceleri evdeki yatağa yatıyor.",
 "Yatak modeli yenilendi (ayaklar, baş ve ayak tahtası, şilte, battaniye, yastık eklendi)."
]},
{n:33,d:"06.10.2026",t:"İnşa sistemi genişlemesi",l:[
 "Pencereli Duvar, Geçit, Çit Kapısı ile Taş ve Metal çit seçenekleri eklendi.",
 "Kurulum geliştirildi: seviye ve parça seçimi, elle yön verme, basılı tutup sürükleyerek sürekli kurma, kurulamama nedeninin gösterilmesi, malzeme göstergesi, pipet ve kılavuz ızgarası eklendi.",
 "Çekiç menüsü ile toplu yükseltme, yıkma ve döndürme eklendi.",
 "Kurulumdan sonraki 30 saniye içinde yıkılan parçaların malzemesi tam iade ediliyor.",
 "Geri al özelliği eklendi (son 30 işlem).",
 "İnşa bilgi paneli, parça sayısına bağlı deneyim ödülleri ve barınak oluştu/bozuldu bildirimleri eklendi."
]},
{n:34,d:"07.10.2026",t:"Köy düzeltmesi",l:[
 "Köylerde fener direğinin yanındaki geçilemeyen görünmez engel kaldırıldı."
]},
{n:35,d:"09.10.2026",t:"İnşa sistemi baştan yazıldı",l:[
 "İnşa sistemi baştan yazıldı; parçalar 3 metrelik ızgarada birbirine yapışıyor.",
 "Temel, Zemin, Duvar, Kapı Çerçevesi, Pencereli Duvar, Yarım Duvar, Alçak Duvar ve Merdiven parçaları eklendi.",
 "Parçalar Çıta olarak kuruluyor; Çekiçle Odun, Taş, Metal ve Zırhlı seviyeye yükseltiliyor.",
 "Denge sistemi eklendi: desteği yıkılan parçaların üstündekiler çöküyor.",
 "Kapılar ayrı eşya haline getirildi (Tahta, Metal, Zırhlı). Kapı çerçevesine takılıyor ve E tuşuyla animasyonlu şekilde açılıp kapanıyor.",
 "Katlı yapılar için gerçek çarpışma, merdiven tırmanışı ve barınak hesabı eklendi.",
 "Yıkılan parçanın malzemesi 10 dakika içinde tam, sonrasında %25 oranında iade ediliyor.",
 "Eski kare parçalar korundu; çekiçle sökülebiliyor.",
 "R tuşu döndürme, T tuşu pipet olarak atandı; eski inşa kısayolları kaldırıldı."
]},
{n:36,d:"10.10.2026",t:"Palmiyeler ve gün uzunluğu",l:[
 "Palmiyeler baltayla (veya El Taşı ile) kesilebiliyor ve odun veriyor; kesilen palmiye 8 dakika sonra yeniden büyüyor.",
 "Meyveli palmiyeden E tuşuyla hindistan cevizi toplama korundu.",
 "Gün süresi 27 dakikaya uzatıldı: 20 dakika gündüz, 7 dakika gece."
]},
{n:37,d:"11.10.2026",t:"İnşa dokuları ve düzeltmeler",l:[
 "İnşa parçalarına özgün dokular eklendi (çıta, odun, taş, metal, zırhlı); kapılar da seviyesine göre dokulanıyor.",
 "Balta elindeyken kayaya, kazma elindeyken ağaca bakınca gösterilen yanlış \"Çıplak el\" uyarısı, doğru alet uyarısıyla değiştirildi.",
 "Temellerin üzerinde kendiliğinden kaya, ağaç, çalı ve mantar çıkması sorunu giderildi; mevcut kayıtlardaki bu nesneler de temizleniyor."
]},
{n:38,d:"13.10.2026",t:"İki oyunculu Co-op",l:[
 "İki oyunculu Co-op modu eklendi. Duraklat menüsündeki Co-op oyun aç ile kod üretiliyor; ikinci oyuncu ana menüden kodu girerek katılıyor.",
 "Dünya, köylüler, hayvanlar, gün saati ve yapılar iki oyuncu arasında ortak işliyor.",
 "Sohbet (Enter) eklendi.",
 "Diğer oyuncunun modeli eklendi (ad etiketi, yürüme, yüzme, uyku ve saldırı hareketleri).",
 "Hayvanlar ve düşmanlar en yakın oyuncuyu hedef alıyor; hasar ve bildirimler ilgili oyuncuya yansıyor.",
 "Uyumak için iki oyuncunun da yatması gerekiyor; mağaralar Co-op'ta kapalı.",
 "Katılan oyuncunun oyunu tarayıcıya kaydedilmiyor."
]},
{n:39,d:"14.10.2026",t:"Denge, zorluk ve Co-op geliştirmeleri",l:[
 "Ağaç, palmiye, kaya, kömür, bakır, çalı ve mantar sayısı azaltıldı; başlangıç noktasının çevresi korundu.",
 "Kaynak verimi azaltıldı, yeniden büyüme süreleri uzatıldı.",
 "Hayvan sayısı ve ganimetleri azaltıldı, yeniden doğma yavaşlatıldı; süt ve yün bekleme süresi uzatıldı.",
 "Tarif maliyetleri artırıldı; açlık ve susuzluk daha hızlı azalıyor.",
 "Alet dayanıklılığı eklendi: aletler vuruşla aşınıyor ve kırılıyor; Çalışma Tezgâhında malzeme karşılığı onarılıyor. El Taşı aşınmıyor.",
 "Aletlerin dayanıklılık çubuğu eklendi.",
 "Dünya Oluştur penceresine Kaynak yoğunluğu (Az / Normal / Bol) seçeneği eklendi.",
 "Ana menü düğmeleri tek sütunda alt alta sıralandı; yön tuşlarıyla gezilebiliyor.",
 "Çanta paneline kaynak özeti şeridi eklendi.",
 "Yeni başarımlar (Tamirci, Sert Kullanım, Ortak Çaba), yeni ipuçları ve güncellenmiş Rehber metinleri eklendi.",
 "Co-op: davet bağlantısı ve kopyalama düğmesi eklendi.",
 "Co-op: ev sahibine oyuncuyu çıkarma yetkisi eklendi.",
 "Co-op: sohbet komutları (/yardim, /ping, /konum) eklendi.",
 "Co-op: arkadaşın mesafesi ve yönü ekranda, arkadaşın konumu ve ortak hedef işareti haritada gösteriliyor.",
 "Co-op: oyuncunun düşme ve ayağa kalkma bildirimleri eklendi.",
 "Co-op: katılan oyuncunun çantası ve gelişimi dünya başına saklanıyor."
]},
{n:40,d:"15.10.2026",t:"Yükleme ekranı",l:[
 "Yükleme ekranının sol altındaki \"Bir Sabri Aydın oyunu.\" yazısı kaldırıldı."
]},
{n:41,d:"16.10.2026",t:"Barış modu ve Dünya Oluştur",l:[
 "Barış modu düzeltildi: Gölge, kurt, ayı, köpek balığı ve denizanası artık hiç bulunmuyor (mağaradaki Gölgeler dahil). Eskiden yalnızca bu canlıların hasarı engelleniyordu.",
 "Barış modunda yaban domuzu ve diğer hayvanlar kovalamıyor, karşılık vermiyor. Arı sokması geçerli.",
 "Barış modunda Hedefler listesinden Gölge ve ayı adımları, köy görevlerinden tehlikeli yaratık avı kaldırıldı.",
 "Dünya kuralları (zorluk, ölünce, mevsimler, barış) kayıtla birlikte saklanıyor ve kayıt yüklenince uygulanıyor.",
 "Dünya Oluştur penceresinde her seçenek için açıklama, seçimlerin özet satırı ve Varsayılan düğmesi eklendi.",
 "Dünya kodu için anlık denetim eklendi; 6 karakterden kısa kod artık kabul edilmiyor.",
 "Pencerenin hizalaması düzeltildi, alt düğme satırı her zaman görünür hale getirildi.",
 "Ayarlar'daki Barış modu açıklaması gerçek davranışa göre güncellendi."
]}
]);
