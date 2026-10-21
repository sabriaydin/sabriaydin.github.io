/* Hunger 3D - güncelleme notları: ilk bölüm güncellemeleri (Ana menü › Güncelleme Notları).
   Her kayıt: {n: güncelleme numarası, t: başlık, l: [değişiklik maddeleri]}. Maddeler "…eklendi / …giderildi / …değiştirildi" biçiminde yazılır.
   Yalnızca oyun içinde görülen değişiklikler yazılır; site ve dosya düzeniyle ilgili değişiklikler yazılmaz. */
HG.UPD=(HG.UPD||[]).concat([
{n:1,t:"İlk sürüm",l:[
 "Hunger'ın ilk oynanabilir sürümü yayımlandı.",
 "Issız bir adada ağaç kesme, maden çıkarma ve balık tutma eklendi.",
 "Gündüz-gece döngüsü ile açlık, susuzluk ve sıcaklık göstergeleri eklendi.",
 "Kamp ateşi, Çalışma Tezgâhı, ocak, duvar ve kapı yapımı eklendi.",
 "Taş, bakır ve demir seviyesinde balta ve kazma üretimi eklendi.",
 "Mini harita, hızlı erişim çubuğu, kayıt sistemi ve dokunmatik kontroller eklendi."
]},
{n:2,t:"Dağlık bölgeler ve zıplama",l:[
 "Haritaya dağlık bölgeler eklendi; yükseklik kıyıya yaklaştıkça azalıyor, başlangıç noktasının çevresi düz bırakıldı.",
 "Zıplama ve uçurumdan düşme eklendi; çok dik yokuşlara yürüyerek çıkılamıyor, zıplamak gerekiyor.",
 "Harita yapısı değiştiği için önceki sürümlere ait kayıtlar geçersiz hale geldi."
]},
{n:3,t:"Eşya taşıma ve atma",l:[
 "Yere atılan eşyalar eklendi: envanterden sürüklenen eşya panelin dışına bırakılınca yere düşüyor.",
 "Envanter kutuları arasında sürükle-bırak ile eşya taşıma eklendi.",
 "Elde yiyecek veya içecek varken sol tuşa basılı tutarak yeme-içme eklendi.",
 "Bildirim yazılarının görünümü yenilendi."
]},
{n:4,t:"Grafik güncellemesi",l:[
 "Arazi yumuşak yüzeyli hale getirildi; renkler yüksekliğe ve eğime göre değişiyor (kaya, kar).",
 "Çimen tutamları ve çiçekler eklendi; rüzgârda sallanıyorlar.",
 "Gökyüzü kubbesi, güneş, ay ve bulutlar eklendi.",
 "Ağaç, kaya ve maden modelleri çok daha ayrıntılı hale getirildi.",
 "Dört kademeli grafik kalitesi eklendi; kare hızı düşünce kalite kendiliğinden azalıyor (Otomatik mod).",
 "Yerdeki eşyaların E tuşuyla alınması eklendi."
]},
{n:5,t:"Hayvanlar ve toplama",l:[
 "Koyun, inek, geyik, yaban domuzu ve tavşan eklendi; modelleri ve hareket animasyonları hazırlandı.",
 "Hayvanlardan çiğ et, deri, yün, kemik ve süt elde edilmesi eklendi; Pişmiş Et, Süt Şişesi, Makas, Mızrak ve Deri Mont üretimi eklendi.",
 "Deri Mont çantadayken soğuğun etkisini yarıya indiriyor; çiğ yiyecek yemenin sağlığa zarar vermesi eklendi.",
 "Ağaçlar devrilme animasyonuyla kesiliyor; kaya ve madenler ilerledikçe küçülerek parçalanıyor.",
 "Yarıda bırakılan toplama işleminin ilerlemesi hatırlanıyor.",
 "Uzaktaki arazi sadeleştirilerek çizildi, böylece performans artırıldı.",
 "Mini harita oyuncuyu ortalayan, yakınlaştırılmış bir görünüme geçirildi."
]},
{n:6,t:"Denge düzeltmesi",l:[
 "Adadaki kaya, maden ve çalı sayısı azaltıldı."
]},
{n:7,t:"Ses, hava durumu ve görüntü efektleri",l:[
 "Ses motoru baştan yazıldı: konuma duyarlı 3B ses, yankı, ortam sesleri, hava, hayvan ve ayak sesleri ile müzik eklendi.",
 "Hava durumu eklendi: bulut, yağmur ve şimşek. Kapalı ve yağmurlu havada gökyüzü grileşiyor.",
 "Ateş böcekleri, polen ve toz parçacıkları eklendi.",
 "Parlama (bloom), güneş ışınları, renk derecelendirme ve vinyet efektleri eklendi."
]},
{n:8,t:"Savaş ve korku",l:[
 "Kurt ve Gölge yaratıkları eklendi.",
 "Yay ve ok eklendi; ok uçuşu ve isabet hesabı hazırlandı, atılan oklar geri toplanabiliyor.",
 "Meşale ve bandaj eklendi.",
 "Dayanıklılık, akıl sağlığı ve kanama sistemleri eklendi.",
 "Hasar alınca ekran geri bildirimi ve korku atmosferi (gerilim sesleri, fısıltılar) eklendi.",
 "Birinci şahıs kollara yay ve meşale animasyonları eklendi."
]},
{n:9,t:"Ayarlar menüsü ve ayrıntılı modeller",l:[
 "Ayarlar menüsü eklendi (grafik, ses, kontrol ve oyun seçenekleri).",
 "Hayvan modelleri baştan yapıldı: tüy dokusu, gözler, eklemli bacaklar, boynuz ve yeleler eklendi.",
 "Yere atılan eşyalar ayrıntılı modellerle gösteriliyor; yığınlar birkaç kopya olarak görünüyor, havadayken dönerek düşüyorlar."
]},
{n:10,t:"Köyler ve tam ekran harita",l:[
 "Köyler ve köylüler eklendi; evler, ateşler ve köylüler düz çimenlik alanlara yerleştiriliyor.",
 "Köylülerle takas dükkânı eklendi.",
 "Tam ekran harita (M) eklendi.",
 "Her dünya kodu için farklı bir ada biçimi üretilmesi sağlandı.",
 "Hayvan hareketleri yenilendi: yürüyüş, tırıs, dört nala, tavşan sıçraması, otlama ve tetikte baş kaldırma eklendi.",
 "Saldıran hayvanların oyuncunun içine girmesi sorunu giderildi."
]},
{n:11,t:"Köy yaşamı ve ticaret",l:[
 "Köylere avlular, kuyu, fener direkleri ve mesleğe özgü avlu eşyaları eklendi.",
 "Köylüler geceleri evlerine çekilip sabah çıkıyor; geceleri dükkân kapalı kalıyor.",
 "Sikke ekonomisi ve eşya satışı eklendi.",
 "Uyku Tulumu eklendi; geceyi güvenli bir yerde geçirmek için kullanılıyor.",
 "Köy bulunduğunda bildirim gösterilmesi eklendi.",
 "Köylü görünümleri çeşitlendirildi (yaka, kemer, bot, etek, uzun saç, sakal)."
]},
{n:12,t:"Görevler, gelişim ve terk edilmiş kamplar",l:[
 "Deneyim, seviye ve yetenek sistemi ile Günlük penceresi (K) eklendi.",
 "Köylü görevleri eklendi: eşya getirme, avlanma, Gölge avı ve köy bulma.",
 "Terk edilmiş kamplar ve sandıkları eklendi; kamplarda adanın hikâyesini anlatan Sefer Defteri kayıtları bulunuyor.",
 "Kan Ayı gecesi eklendi: gökyüzü kızıla dönüyor, Gölgeler çoğalıyor ve o gece uyunamıyor."
]}
]);
