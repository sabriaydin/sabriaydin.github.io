/* Hunger 3D - güncelleme notları: son güncellemeler (Ana menü › Güncelleme Notları).
   Yeni güncelleme eklemek için dizinin içine {n: numara, d: "gg.aa.yyyy", t: "başlık", l: ["madde", ...]} kaydı eklenir; sıralama otomatiktir (en yeni başta).
   Madde yazım kuralı: oyuncunun görebileceği değişiklik, "…eklendi / …giderildi / …değiştirildi / …kaldırıldı" biçiminde, tam cümle ve noktayla yazılır. */
HG.UPD=(HG.UPD||[]).concat([
{n:49,d:"21.10.2026",t:"Ana menü arka planı",l:[
 "Ana menüdeki 3B dünya uçuşu kaldırıldı; yerine oyunu anımsatan hafif bir manzara çizildi: gün batımında ada silüeti, deniz, çam ve palmiye gölgeleri, kıyıda yanan kamp ateşi ve ağaçların arasında ara sıra beliren Gölge gözleri.",
 "Menü artık 3B sahneyi çizmiyor; menüde kare hızı yükü neredeyse tamamen kalktı, zayıf cihazlarda ve dizüstünde ısınma ile pil tüketimi azaldı.",
 "Menüdeki kıvılcım ve ateş böcekleri manzaraya göre seyreltildi.",
 "Ayarlar › Grafik › Menü arka plan efekti kapatılınca manzara hareketsiz tek kare olarak duruyor.",
 "Oyundan menüye dönüldüğünde menü efektlerinin durması sorunu giderildi."
]},
{n:48,d:"20.10.2026",t:"Oyun içi arayüz yenilendi",l:[
 "Gizlilik göstergesi ekranın ortasından alınıp mini haritanın altına taşındı; artık nişanın önünü kapatmıyor.",
 "Gizlilik göstergesi yalnızca çömelirken veya yakındaki bir hayvan tetikteyken görünüyor; yanından geçilen sakin hayvanlarda kendiliğinden açılıp kapanma sorunu giderildi.",
 "Yalnızca üretim ve ticaret malzemesi olan eşyalar (odun, taş, kömür, cevher, külçe, deri, yün, sikke ve benzerleri) artık elde tutulmuyor; seçilince eller boş kalıyor ve çıplak elle vuruluyor.",
 "Malzeme eşyaların kutusuna küçük bir işaret eklendi; üzerine gelince \"üretim malzemesi\" yazıyor.",
 "Seçilen eşyanın adı hızlı erişim çubuğunun üstünde kısa süre gösteriliyor.",
 "Durum çubuklarına sayısal değer eklendi (örneğin %72).",
 "Dolu olan durum çubukları soluklaşıyor, azalanlar kırmızıya dönüyor ve kritik seviyede yanıp sönüyor.",
 "Nişan noktası sadeleştirildi; bakılan şeyle bir işlem yapılabiliyorsa çevresinde halka beliriyor.",
 "Eylem ipucundaki tuş adı (E gibi) tuş kutusu olarak gösteriliyor.",
 "Hızlı erişim çubuğu, durum paneli, saat, mini harita, hedef bildirimi, bildirimler ve üretim sırası ortak bir görünüme getirildi; seçili kutu belirginleştirildi.",
 "Çanta ve üretim penceresi ile kaydırma çubukları yenilendi; tarif satırları üzerine gelince vurgulanıyor.",
 "Eşya seçilmeden boş duran açıklama kutusu gizleniyor."
]},
{n:47,d:"19.10.2026",t:"Ayarlar menüsü yenilendi",l:[
 "Kalite düzeyi artık çözünürlük ölçeği, gölgeler, parlama, çim, yer sisi, parçacık ve çizim mesafesi ayarlarını birlikte değiştiriyor; seçim yapınca bu ayarlar ekranda da güncelleniyor.",
 "Kalite düzeyinin altına o düzeyde neyin açık, neyin kapalı olduğunu anlatan açıklama eklendi.",
 "Kalite düzeyinin altına anlık kare hızı, çizim ölçeği ve piksel oranı eklendi.",
 "Grafik ayarlarından biri elle değiştirilince kalite düzeyi \"Özel\" oluyor; düzey artık yanlış bilgi göstermiyor.",
 "Otomatik kalite kendiliğinden düştüğünde grafik ayarları da o düzeye çekiliyor.",
 "O anda etkisi olmayan ayarlar soluk ve kapalı gösteriliyor; nedeni satırın altında yazıyor (örneğin düşük kalitede gölge ve parlama, ana ses kapalıyken diğer ses ayarları).",
 "Ayar arama kutusu eklendi: yazılan kelime tüm sekmelerde aranıyor.",
 "\"Görünümü göster\" düğmesi eklendi: basılı tutarken ayar penceresi gizleniyor ve yapılan değişiklik sahnede görülüyor.",
 "Varsayılana dönüş ikiye ayrıldı: yalnızca açık sekme veya tüm ayarlar.",
 "Çözünürlük ölçeğinin en etkili başarım ayarı olduğu belirtildi.",
 "Oyun sekmesine, dünya kurallarının Dünya Oluştur penceresinden seçildiğini belirten açıklama eklendi."
]},
{n:46,d:"18.10.2026",t:"Günlük düzeltmesi",l:[
 "Kamp sandıklarında bulunan Sefer Defteri kayıtlarının Günlük penceresinde yanlış metinlerle görünmesi sorunu giderildi."
]},
{n:45,d:"16.10.2026",t:"Devasa güncelleme: fizik, yapay zekâ, modeller ve hile koruması",l:[
 "Çömelme eklendi (Ctrl veya Z). Çömelince ayak sesi kesiliyor, hayvanlar oyuncuyu çok daha geç fark ediyor ve yay daha az sallanıyor.",
 "Ekranın ortasına gizlilik göstergesi eklendi: Gizli, Tetikte, Fark edildin.",
 "Zıplama hissi iyileştirildi: kenardan ayrıldıktan sonra kısa süre zıplanabiliyor, havadayken basılan zıplama tuşu yere inince çalışıyor.",
 "Çok dik yamaçlarda kayma eklendi; kayarken dayanıklılık azalıyor.",
 "Darbe alınca vuran yönün tersine itilme eklendi; ağır darbe oyuncuyu hafifçe havaya kaldırıyor.",
 "Yüksekten suya atlayınca derine batma eklendi; serbest düşüşte görüş açısı genişliyor, çömelince daralıyor.",
 "Kurt sürüsü artık tek sıradan gelmiyor; oyuncunun çevresine yayılarak kuşatıyor.",
 "Gece yırtıcıları kamp ateşinin aydınlattığı alana girmiyor.",
 "Uzun kovalamacada yırtıcılar yorulup vazgeçiyor.",
 "Yaralanan hayvan kaçarken kan izi bırakıyor; iz sürülebiliyor.",
 "Yağmur ve rüzgâr oyuncunun sesini örtüyor; geceleri sürü hayvanları dolaşmak yerine dinleniyor.",
 "Elde tutulan 26 eşya için gerçek model eklendi: odun, kömür, kum, cevherler, külçeler, sikke, çanta, dört balık türü, yengeç, mercan, dalış maskesi, şişeler ve yerleştirilecek yapıların küçük önizlemeleri.",
 "Uyarlanabilir çözünürlük eklendi: kare hızı düşünce çizim çözünürlüğü kendiliğinden biraz azalıyor, rahatlayınca geri çıkıyor (Ayarlar › Grafik).",
 "Gölge haritası her karede değil, gerektiğinde yenileniyor.",
 "Q tuşuyla önceki eşyaya dönme eklendi.",
 "Rehber'e \"Gizli avlanma\" ipucu eklendi.",
 "Hile koruması eklendi: can, dayanıklılık, yığın sınırı, hız ve zeminle bağlantı sürekli denetleniyor, bozukluklar düzeltiliyor.",
 "Kayıtlara imza eklendi: dışarıdan düzenlenen kayıt yüklenince dünya işaretleniyor ve yeni başarım açılmıyor.",
 "Hasar tavanı eklendi: hiçbir vuruş silah tablosundaki değerin üstüne çıkamıyor.",
 "Co-op: ev sahibi, katılan oyuncunun konum, hasar ve eşya alma paketlerini doğruluyor; ışınlanma geri alınıyor, ısrar eden oyuncu oyundan çıkarılıyor.",
 "Co-op: diğer oyuncunun çömelmesi karşı tarafta da görünüyor."
]},
{n:44,d:"27.08.2026",t:"Dünya kuralları ve menüler",l:[
 "Alet aşınması Ayarlar'dan kaldırıldı ve Dünya Oluştur penceresine taşındı. Her dünyanın kuralı olarak saklanıyor; Co-op'ta ev sahibinin kuralı geçerli oluyor.",
 "Seçili eşyadan 1 adet atma tuşu Q yerine G olarak değiştirildi (Ayarlar › Kontrol'den değiştirilebilir).",
 "Ana menü, duraklatma menüsüyle aynı tasarıma geçirildi.",
 "Menü arka planları yazılar daha rahat okunsun diye koyulaştırıldı."
]},
{n:43,d:"16.08.2026",t:"Yeni oyuncu modeli (Co-op)",l:[
 "Co-op'taki diğer oyuncunun modeli baştan yapıldı: eklemli gövde, yüz (göz, kaş, burun, kulak, ağız), dört farklı saç modeli, deri ve kumaş dokuları eklendi.",
 "Sırt çantası, uyku tulumu, kemer ve kese eklendi.",
 "Yürüme ve koşma, zıplama, düşme, nefes alma, göz kırpma, yüzme, yay germe, alet vuruşu, uyku ve ölüm hareketleri eklendi.",
 "Diğer oyuncunun elinde tuttuğu eşyanın (alet, meşale, yay, malzeme) görünmemesi sorunu giderildi.",
 "Diğer oyuncunun adım sesleri eklendi; ad etiketinde can çubuğu gösteriliyor.",
 "Oyuncunun başının üzerindeki beyaz disk kaldırıldı."
]},
{n:42,d:"01.08.2026",t:"Menüler ve Güncelleme Notları",l:[
 "Ana menüdeki \"Co-op'a Katıl\" düğmesinin adı \"Oyuna Katıl\" olarak değiştirildi ve Yeni Oyun'un altına taşındı.",
 "Duraklatma menüsü gerçek oyunlardaki gibi yeniden tasarlandı: sol sütun, büyük başlık ve düz satır düğmeleri eklendi; Co-op bölümü ayrıldı, Ana Menüye Dön en alta alındı.",
 "Duraklatma menüsünde ok tuşlarıyla gezinme ve Esc ile devam etme eklendi.",
 "Ana menüye Güncelleme Notları düğmesi eklendi."
]}
]);
