/* HungerMan - başarımlar (0.14.0): oyun içi hedefler; kazanılınca bildirim ve ses, L tuşuyla açılan listede izlenir
   Kazanma iki yolla olur: olaylar (canavar yenme, uyuma, ticaret, büyüleme...) ve düzenli denetim (envanter, seviye, gün, konum).
   Durum dünya kaydında (çok oyunculuda oyuncu kaydında) saklanır. */
import { CANAVARLAR, BOSSLAR } from '../varlik/turler.js';

/* hedef: sayaçlı başarımlarda gereken sayı; ikon: listede gösterilen eşya simgesi */
export const BASARIMLAR = [
  { k: 'odun', ad: 'Ağaç Kesici', aciklama: 'İlk kütüğü topla.', ikon: 8, grup: 'Başlangıç' },
  { k: 'masa', ad: 'Zanaatkâr', aciklama: 'Bir üretim masası yap.', ikon: 32, grup: 'Başlangıç' },
  { k: 'kazma', ad: 'Kazmaya Başla', aciklama: 'İlk kazmanı üret.', ikon: 300, grup: 'Başlangıç' },
  { k: 'tasKazma', ad: 'Taş Devri', aciklama: 'Taş kazma üret.', ikon: 304, grup: 'Başlangıç' },
  { k: 'pisir', ad: 'Sıcak Yemek', aciklama: 'Pişmiş bir yiyecek ye.', ikon: 272, grup: 'Başlangıç' },
  { k: 'uyku', ad: 'Tatlı Rüyalar', aciklama: 'Yatakta uyu.', ikon: 47, grup: 'Başlangıç' },
  { k: 'gun10', ad: 'Hayatta Kalan', aciklama: '10. güne ulaş.', ikon: 266, grup: 'Başlangıç' },
  { k: 'demir', ad: 'Demir Çağı', aciklama: 'Demir külçe elde et.', ikon: 261, grup: 'Madencilik' },
  { k: 'elmas', ad: 'Elmaslar!', aciklama: 'Elmas elde et.', ikon: 264, grup: 'Madencilik' },
  { k: 'derin', ad: 'Derinlere', aciklama: '12. seviyenin (Y) altına in.', ikon: 20, grup: 'Madencilik' },
  { k: 'maden', ad: 'Terk Edilmiş', aciklama: 'Terk edilmiş bir maden keşfet.', ikon: 104, grup: 'Madencilik' },
  { k: 'zirh', ad: 'Zırhlı', aciklama: 'Tam takım demir zırh giy.', ikon: 409, grup: 'Madencilik' },
  { k: 'elmasZirh', ad: 'Pırıl Pırıl', aciklama: 'Bir elmas zırh parçası giy.', ikon: 413, grup: 'Madencilik' },
  { k: 'canavar', ad: 'Canavar Avcısı', aciklama: 'Bir canavar yen.', ikon: 303, grup: 'Mücadele' },
  { k: 'canavar50', ad: 'Gece Bekçisi', aciklama: '50 canavar yen.', ikon: 311, hedef: 50, grup: 'Mücadele' },
  { k: 'canavar250', ad: 'Efsane Avcı', aciklama: '250 canavar yen.', ikon: 319, hedef: 250, grup: 'Mücadele' },
  { k: 'mumya', ad: 'Kumların Laneti', aciklama: 'Bir mumya yen.', ikon: 5, grup: 'Mücadele' },
  { k: 'bogulmus', ad: 'Derinlerden Gelen', aciklama: 'Bir boğulmuş zombi yen.', ikon: 299, grup: 'Mücadele' },
  { k: 'buziskelet', ad: 'Soğuk Nişancı', aciklama: 'Bir buz iskeleti yen.', ikon: 22, grup: 'Mücadele' },
  { k: 'yarasa', ad: 'Kanat Avcısı', aciklama: 'Bir yarasa yen.', ikon: 282, grup: 'Mücadele' },
  { k: 'kopekbaligi', ad: 'Deniz Kurdu', aciklama: 'Bir köpekbalığı yen.', ikon: 450, grup: 'Mücadele' },
  { k: 'okcu', ad: 'Keskin Nişancı', aciklama: 'Ok ile bir canavar yen.', ikon: 286, grup: 'Mücadele' },
  { k: 'firavun', ad: 'Firavunun Düşüşü', aciklama: 'Çöl tapınağındaki Firavunu yen.', ikon: 458, grup: 'Bosslar' },
  { k: 'buzbuyucu', ad: 'Buzları Eriten', aciklama: 'Buzul kulesindeki Buz Büyücüsünü yen.', ikon: 459, grup: 'Bosslar' },
  { k: 'reis', ad: 'Kanun Adamı', aciklama: 'Haydut Reisini yen.', ikon: 460, grup: 'Bosslar' },
  { k: 'muhafiz', ad: 'Taşları Kıran', aciklama: 'Derin bir zindandaki Taş Muhafızı yen.', ikon: 461, grup: 'Bosslar' },
  { k: 'bossHepsi', ad: 'Efsane', aciklama: 'Dört farklı bossu yen.', ikon: 290, hedef: 4, grup: 'Bosslar' },
  { k: 'haydut', ad: 'Yol Kesicilere Karşı', aciklama: 'Bir haydut yen.', ikon: 315, grup: 'Bosslar' },
  { k: 'tuzak', ad: 'Dikkat!', aciklama: 'Bir ok tuzağına yakalan.', ikon: 157, grup: 'Bosslar' },
  { k: 'buyu', ad: 'Büyücü', aciklama: 'Büyü masasında bir eşyayı büyüle.', ikon: 156, grup: 'Zanaat' },
  { k: 'ors', ad: 'Demirci', aciklama: 'Örste bir eşyayı onar ya da birleştir.', ikon: 139, grup: 'Zanaat' },
  { k: 'iksir', ad: 'Simyacı', aciklama: 'Bir iksir iç.', ikon: 332, grup: 'Zanaat' },
  { k: 'hasat', ad: 'Hasat Zamanı', aciklama: 'Olgun bir ekin hasat et.', ikon: 291, grup: 'Zanaat' },
  { k: 'yavru', ad: 'Çiftçi', aciklama: 'İki hayvanı besleyerek yavru elde et.', ikon: 291, grup: 'Zanaat' },
  { k: 'seviye10', ad: 'Tecrübeli', aciklama: '10. deneyim seviyesine ulaş.', ikon: 290, grup: 'Zanaat' },
  { k: 'seviye30', ad: 'Usta', aciklama: '30. deneyim seviyesine ulaş.', ikon: 290, grup: 'Zanaat' },
  { k: 'koy', ad: 'Yolcu', aciklama: 'Bir köye ulaş.', ikon: 51, grup: 'Keşif' },
  { k: 'koy5', ad: 'Gezgin', aciklama: '5 farklı köy ziyaret et.', ikon: 51, hedef: 5, grup: 'Keşif' },
  { k: 'biyom', ad: 'Dünya Turu', aciklama: '10 farklı biyom gör.', ikon: 4, hedef: 10, grup: 'Keşif' },
  { k: 'zirve', ad: 'Zirvede', aciklama: '110. seviyenin (Y) üstüne çık.', ikon: 21, grup: 'Keşif' },
  { k: 'zindan', ad: 'Zindan Kaşifi', aciklama: 'Bir zindan sandığını aç.', ikon: 60, grup: 'Keşif' },
  { k: 'batik', ad: 'Hazine Avcısı', aciklama: 'Batık bir geminin sandığını aç.', ikon: 50, grup: 'Keşif' },
  { k: 'tapinak', ad: 'Kumların Sırrı', aciklama: 'Bir çöl tapınağı sandığını aç.', ikon: 24, grup: 'Keşif' },
  { k: 'ormanTapinak', ad: 'Yosunlu Hazine', aciklama: 'Bir orman tapınağı sandığını aç.', ikon: 60, grup: 'Keşif' },
  { k: 'kule', ad: 'Kule Fatihi', aciklama: 'Bir buzul kulesi sandığını aç.', ikon: 22, grup: 'Keşif' },
  { k: 'kamp', ad: 'Ganimet', aciklama: 'Bir haydut kampı sandığını aç.', ikon: 114, grup: 'Keşif' },
  { k: 'tekne', ad: 'Denizci', aciklama: 'Bir tekneye bin.', ikon: 454, grup: 'Keşif' },
  { k: 'balik', ad: 'Balıkçı', aciklama: 'Oltayla bir şey yakala.', ikon: 453, grup: 'Keşif' },
  { k: 'kopek', ad: 'Sadık Dost', aciklama: 'Bir kurdu kemikle evcilleştir.', ikon: 295, grup: 'Yuva ve Dostlar' },
  { k: 'kedi', ad: 'Mırnav', aciklama: 'Bir kediyi balıkla evcilleştir.', ikon: 297, grup: 'Yuva ve Dostlar' },
  { k: 'at', ad: 'Seyis', aciklama: 'Bir atı ehlileştir.', ikon: 291, grup: 'Yuva ve Dostlar' },
  { k: 'binici', ad: 'Atlı', aciklama: 'Eyerli bir ata bin.', ikon: 462, grup: 'Yuva ve Dostlar' },
  { k: 'asci', ad: 'Aşçı', aciklama: 'Tencerede bir yemek pişir.', ikon: 232, grup: 'Yuva ve Dostlar' },
  { k: 'gurme', ad: 'Gurme', aciklama: 'Etkisi olan bir yemek ye.', ikon: 464, grup: 'Yuva ve Dostlar' },
  { k: 'ev', ad: 'Ev Sahibi', aciklama: 'Bir sandalyeye ya da koltuğa otur.', ikon: 199, grup: 'Yuva ve Dostlar' },
  /* 0.18.0: Yeraltı Diyarı ve mevsimler */
  { k: 'gecit', ad: 'Geçit Bekçisi', aciklama: 'Bir Diyar Geçidi aç.', ikon: 473, grup: 'Diyar ve Mevsimler' },
  { k: 'diyar', ad: 'Ateşin Eşiği', aciklama: 'Yeraltı Diyarı’na gir.', ikon: 515, grup: 'Diyar ve Mevsimler' },
  { k: 'kale', ad: 'Kül Kalesi', aciklama: 'Bir Kül Kalesi’ne ulaş.', ikon: 518, grup: 'Diyar ve Mevsimler' },
  { k: 'korruhu', ad: 'Ruh Avcısı', aciklama: 'Bir Kor Ruhu yen.', ikon: 472, grup: 'Diyar ve Mevsimler' },
  { k: 'isiltas', ad: 'Işık Toplayıcı', aciklama: 'Işıltaş tozu topla.', ikon: 514, grup: 'Diyar ve Mevsimler' },
  { k: 'korKilic', ad: 'Ateşle Oynamak', aciklama: 'Bir Kor Kılıcı yap.', ikon: 474, grup: 'Diyar ve Mevsimler' },
  { k: 'yil', ad: 'Dört Mevsim', aciklama: 'Bir yılı (28 gün) geride bırak.', ikon: 45, grup: 'Diyar ve Mevsimler' },
  { k: 'kova', ad: 'Su Taşıyıcı', aciklama: 'Kovayla su taşıyıp bir yere dök.', ikon: 478, grup: 'Çiftlik' },
  { k: 'sut', ad: 'Taze Süt', aciklama: 'Kovayla bir inek sağ.', ikon: 479, grup: 'Çiftlik' },
  { k: 'kirkim', ad: 'Kırkım Zamanı', aciklama: 'Makasla bir koyun kırk.', ikon: 481, grup: 'Çiftlik' },
  { k: 'fener', ad: 'Gece Feneri', aciklama: 'Bir balkabağı feneri yap.', ikon: 564, grup: 'Çiftlik' },
  { k: 'aricilik', ad: 'Tatlı Kazanç', aciklama: 'Dolu bir arı kovanından bal ya da petek al.', ikon: 482, grup: 'Çiftlik' },
  { k: 'ciftci', ad: 'Çiftlik Mutfağı', aciklama: 'Çiftlik ürünleriyle yapılan bir yemek ye.', ikon: 487, grup: 'Çiftlik' },
  { k: 'kanliAy', ad: 'Kızıl Gece', aciklama: 'Kanlı Ay gecesini sabaha kadar atlat.', ikon: 472, grup: 'Hayatta Kalma' },
  { k: 'kanliAy3', ad: 'Ay Avcısı', aciklama: '3 Kanlı Ay gecesini atlat.', ikon: 474, hedef: 3, grup: 'Hayatta Kalma' },
  { k: 'yildiz', ad: 'Gökten Gelen', aciklama: 'Bir yıldız parçası bul.', ikon: 492, grup: 'Hayatta Kalma' },
  { k: 'tilsim', ad: 'Eve Dönüş', aciklama: 'Eve Dönüş Tılsımı ile doğma noktasına dön.', ikon: 493, grup: 'Hayatta Kalma' },
  { k: 'aurora', ad: 'Kutup Işıkları', aciklama: 'Kuzey ışıklarını seyret.', ikon: 595, grup: 'Hayatta Kalma' },
  { k: 'isinma', ad: 'Ateş Başında', aciklama: 'Üşürken bir ateşin başında ısın.', ikon: 48, grup: 'Hayatta Kalma' },
  { k: 'ilkYardim', ad: 'İlk Yardım', aciklama: 'Kanamayı bandajla durdur.', ikon: 268, grup: 'Hayatta Kalma' },
  { k: 'atel', ad: 'Sağlam Adım', aciklama: 'Kırık bacağa atel sar.', ikon: 494, grup: 'Hayatta Kalma' },
  { k: 'mezar', ad: 'Geri Dönüş', aciklama: 'Kendi mezar taşından eşyalarını geri al.', ikon: 593, grup: 'Hayatta Kalma' },
  { k: 'hayat10', ad: 'Ölümsüz Gibi', aciklama: 'Ölmeden 10 gün hayatta kal.', ikon: 289, grup: 'Hayatta Kalma' },
  { k: 'ticaret', ad: 'Pazarlıkçı', aciklama: 'Bir köylüyle ticaret yap.', ikon: 288, grup: 'Köyler' },
  { k: 'gorev', ad: 'Yardımsever', aciklama: 'Bir köy görevini tamamla.', ikon: 294, grup: 'Köyler' },
  { k: 'gorev10', ad: 'Köyün Kahramanı', aciklama: '10 köy görevi tamamla.', ikon: 294, hedef: 10, grup: 'Köyler' }
];
export const BASARIM = Object.fromEntries(BASARIMLAR.map(b => [b.k, b]));
export const GRUP_SIRASI = ['Başlangıç', 'Madencilik', 'Mücadele', 'Bosslar', 'Zanaat', 'Keşif', 'Köyler', 'Yuva ve Dostlar', 'Diyar ve Mevsimler', 'Çiftlik', 'Hayatta Kalma'];
/* 0.22.0: hayatta kalma istatistikleri (başarımlar penceresinde gösterilir) */
export const ISTATISTIKLER = [
  ['sure', 'Oynama süresi', 'sure'], ['hayat', 'Bu hayat', 'gun'], ['enUzun', 'En uzun hayat', 'gun'], ['olum', 'Ölüm', 'sayi'],
  ['canavar', 'Yenilen canavar', 'sayi'], ['mesafe', 'Yürünen yol', 'm'], ['kirilan', 'Kırılan blok', 'sayi'], ['konulan', 'Konulan blok', 'sayi'],
  ['yemek', 'Yenen yemek', 'sayi'], ['kanliAy', 'Atlatılan Kanlı Ay', 'sayi'], ['meteor', 'Görülen meteor', 'sayi'], ['hasar', 'Alınan hasar', 'kalp']
];

/* Envanterde bulunması yeten başarımlar: eşya kimlikleri */
const ESYA_BASARIM = [['yildiz', [492]], ['fener', [564, 565, 566, 567]], ['odun', [8, 10, 12, 144]], ['masa', [32]], ['kazma', [300, 304, 308, 312, 316]], ['tasKazma', [304]], ['demir', [261]], ['elmas', [264]], ['asci', [463, 464, 465, 466, 470]], ['isiltas', [471, 514]], ['korKilic', [474]]];

export class Basarimlar {
  constructor() {
    this.acik = {};     // anahtar -> kazanma zamanı
    this.sayac = {};    // sayaçlı başarımlar
    this.kume = {};     // farklı köyler / biyomlar
    this.istat = {};    // 0.22.0: istatistikler
    this.kazanildi = null;   // (b) => bildirim ve ses
    this.degisti = null;
  }
  var(k) { return !!this.acik[k]; }
  ver(k) {
    if (!BASARIM[k] || this.acik[k]) return false;
    this.acik[k] = Date.now();
    if (this.kazanildi) this.kazanildi(BASARIM[k]);
    if (this.degisti) this.degisti();
    return true;
  }
  /* Sayaçlı başarım: hedefe ulaşınca kazanılır */
  artir(k, n = 1) {
    const b = BASARIM[k]; if (!b) return;
    this.sayac[k] = (this.sayac[k] || 0) + n;
    if (b.hedef && this.sayac[k] >= b.hedef) this.ver(k);
    else if (this.degisti) this.degisti();
  }
  /* Farklı değerler kümesi (köy kimliği, biyom) */
  kumeEkle(k, deger) {
    const l = this.kume[k] || (this.kume[k] = []);
    if (l.includes(deger)) return;
    l.push(deger);
    const b = BASARIM[k];
    if (b && b.hedef && l.length >= b.hedef) this.ver(k);
    else if (this.degisti) this.degisti();
  }
  ilerleme(k) {
    const b = BASARIM[k];
    if (!b || !b.hedef) return null;
    const n = this.kume[k] ? this.kume[k].length : this.sayac[k] || 0;
    return [Math.min(n, b.hedef), b.hedef];
  }
  get kazanilan() { return BASARIMLAR.filter(b => this.acik[b.k]).length; }

  /* ---------- Olaylar ---------- */
  /* Yerel oyuncunun yendiği canlı; ok: ok ile mi */
  oldurme(turAd, ok = false) {
    if (!CANAVARLAR.includes(turAd)) return;
    this.ver('canavar'); this.artir('canavar50'); this.artir('canavar250'); this.istatEkle('canavar');
    if (BASARIM[turAd]) this.ver(turAd);
    if (BOSSLAR.includes(turAd)) this.kumeEkle('bossHepsi', turAd);
    if (ok) this.ver('okcu');
  }
  gorevTamam() { this.ver('gorev'); this.artir('gorev10'); }
  istatEkle(k, n = 1) { if (Number.isFinite(n)) this.istat[k] = (this.istat[k] || 0) + n; }
  istatEnBuyuk(k, n) { if (Number.isFinite(n) && n > (this.istat[k] || 0)) this.istat[k] = n; }

  /* ---------- Düzenli denetim (saniyede bir) ---------- */
  denetle(o) {
    const env = o.envanter;
    for (const [k, idler] of ESYA_BASARIM) if (!this.acik[k] && idler.some(id => env.say(id) > 0)) this.ver(k);
    const z = env.zirh;
    if (!this.acik.zirh && z.every((s, i) => s && s.id === 408 + i)) this.ver('zirh');
    if (!this.acik.elmasZirh && z.some(s => s && s.id >= 412 && s.id <= 415)) this.ver('elmasZirh');
    const L = o.hayatta.seviye;
    if (L >= 10) this.ver('seviye10');
    if (L >= 30) this.ver('seviye30');
    if (o.gun >= 10) this.ver('gun10');
    if (o.gun >= 29) this.ver('yil');
    const p = o.oyuncu.konum;
    if (p.y < 12) this.ver('derin');
    if (p.y > 110) this.ver('zirve');
    if (o.koyler.icindeki) { this.ver('koy'); this.kumeEkle('koy5', o.koyler.icindeki.id); }
    if (o.biyom != null) this.kumeEkle('biyom', o.biyom);
  }

  disaAktar() { return { a: { ...this.acik }, s: { ...this.sayac }, k: Object.fromEntries(Object.entries(this.kume).map(([k, l]) => [k, [...l]])), i: Object.fromEntries(Object.entries(this.istat).map(([k, n]) => [k, Math.round(n * 100) / 100])) }; }
  iceAktar(v) {
    this.acik = {}; this.sayac = {}; this.kume = {}; this.istat = {};
    if (!v || typeof v !== 'object') return;
    for (const [k, n] of Object.entries(v.i || {})) if (Number.isFinite(+n)) this.istat[k] = +n;
    for (const [k, t] of Object.entries(v.a || {})) if (BASARIM[k]) this.acik[k] = +t || 1;
    for (const [k, n] of Object.entries(v.s || {})) if (BASARIM[k]) this.sayac[k] = +n || 0;
    for (const [k, l] of Object.entries(v.k || {})) if (BASARIM[k] && Array.isArray(l)) this.kume[k] = l.slice(0, 200);
  }
}
