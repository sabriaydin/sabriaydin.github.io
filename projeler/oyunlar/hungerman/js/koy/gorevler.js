/* HungerMan - görev sistemi: köylüler getirme, avlanma ve mektup görevleri verir
   Görevler tohum + köy + köylü + görev sırasından üretilir; aynı köylü aynı sırada hep aynı görevi verir.
   0.32.0: yeni görev türleri: teslimat (süreli koli), keşif (yapı bulma), koruma (köyde canavar avı), inşa (köye blok koyma)
   ve birbirine bağlı, hikâyeli zincir görevler. Görevlerin zorluk yıldızı (1-3), deneyim ve nadir eşya ödülü ve
   isteğe bağlı ek hedefi (kabul edildiği gün içinde tamamlama: +%50 sikke, +2 itibar) vardır. */
import { ESYALAR } from '../bloklar.js';
import { karistir, uretec } from '../rastgele.js';
import { MESLEKLER, DEGER } from './meslekler.js';
import { koylerAlan, MESLEK_ADI } from '../dunya/koy-uretici.js';
import { TURLER } from '../varlik/turler.js';
import { tekYapilar, YAPI_ADI } from '../dunya/yapi-uretici.js';
import { batiklarAlan } from '../dunya/batik-uretici.js';
import { lanetliAda, ADA_AD } from '../dunya/ada-uretici.js';

export const MAKS_AKTIF = 3;
export const KOLI = 347;   // 0.32.0: teslimat görevlerinde taşınan koli
const YONLER = ['kuzey', 'kuzeydoğu', 'doğu', 'güneydoğu', 'güney', 'güneybatı', 'batı', 'kuzeybatı'];
export function yonAdi(dx, dz) { let a = Math.atan2(dx, -dz) * 180 / Math.PI; if (a < 0) a += 360; return YONLER[Math.round(a / 45) % 8]; }
export function yonAci(dx, dz) { let a = Math.atan2(dx, -dz) * 180 / Math.PI; if (a < 0) a += 360; return a; }
const GIRIS = {
  getir: ['Bir ricam olacak.', 'Yardımınıza ihtiyacım var.', 'Köyümüz için önemli bir iş var.'],
  oldur: ['Geceleri huzurumuz kalmadı.', 'Köyün çevresi tehlikeli hâle geldi.'],
  mektup: ['Uzak bir köye haber ulaştırmamız gerekiyor.'],
  teslimat: ['Acil bir gönderimiz var.', 'Komşu köye söz verdiğimiz bir koli var.'],
  kesif: ['Yaşlılar eski bir yerden söz ediyor.', 'Gezginler tuhaf bir yer gördüklerini anlatıyor.'],
  koruma: ['Geceleri canavarlar köyün içine kadar giriyor.', 'Çocuklar karanlık çökünce dışarı çıkamıyor.'],
  insa: ['Köyümüzü güzelleştirmek istiyoruz.', 'Köyün bazı yerleri bakımsız kaldı.']
};
export const TUR_ADI = { getir: 'Getirme', oldur: 'Avlanma', mektup: 'Mektup', teslimat: 'Teslimat', kesif: 'Keşif', koruma: 'Koruma', insa: 'İnşaat' };
/* Zorluk yıldızına göre nadir eşya ödülleri */
const NADIR = [[[290, 1], [289, 1], [61, 2]], [[264, 1], [290, 2], [61, 4], [336, 1]], [[264, 2], [493, 1], [290, 3], [412, 1]]];
/* 0.32.0: zincir görevler: adımlar sırayla aynı köylüden alınır; son adım büyük ödül verir */
export const ZINCIRLER = [
  { ad: 'Kayıp Kervan', odul: [[264, 2], 20], adimlar: [
    { tur: 'kesif', yapi: 'kamp', metin: 'Köyümüze gelen kervan yolda kayboldu. Son görüldüğü yer haydutların kamp kurduğu bölge. Orayı bulabilir misiniz?' },
    { tur: 'oldur', hedef: 'haydut', adet: 4, metin: 'Kervanı haydutlar basmış! Kervancılar kurtulmuş ama haydutlar hâlâ yolları tutuyor. Onları etkisiz hâle getiriniz.' },
    { tur: 'teslimat', metin: 'Kurtarılan malların bir kısmı komşu köye aitti. Bu koliyi zamanında onlara ulaştırınız.' }] },
  { ad: 'Köyün Feneri', odul: [[595, 2], 16], adimlar: [
    { tur: 'getir', esya: 35, adet: 24, metin: 'Köye bir gözcü kulesi kurmak istiyoruz. Önce sağlam taş tuğla gerekiyor.' },
    { tur: 'insa', esya: 46, adet: 8, metin: 'Kule yükseliyor! Şimdi köyün yollarını meşalelerle aydınlatmak gerekiyor.' },
    { tur: 'koruma', adet: 5, metin: 'Işıklar canavarların dikkatini çekti. Köyü koruyunuz.' }] },
  { ad: 'Hasat Bayramı', odul: [[290, 2], 14], adimlar: [
    { tur: 'getir', esya: 291, adet: 32, metin: 'Hasat bayramı yaklaşıyor! Bayram ekmekleri için bolca buğday gerekiyor.' },
    { tur: 'getir', esya: 266, adet: 10, metin: 'Bayram sofrasına tatlı elmalar da yakışır.' },
    { tur: 'teslimat', metin: 'Komşu köyü de bayrama davet etmek istiyoruz. Davetiye kolisini götürünüz.' }] },
  { ad: 'Eski Tapınağın Sırrı', odul: [[493, 1], 18], adimlar: [
    { tur: 'kesif', yapi: 'tapinak', metin: 'Eski bir kitapta gömülü bir tapınaktan söz ediliyor. Gerçekten var mı?' },
    { tur: 'getir', esya: 61, adet: 4, metin: 'Tapınağın duvarlarındaki yazılar parıltı kristallerinden bahsediyor. Birkaç kristal getiriniz.' },
    { tur: 'oldur', hedef: 'iskelet', adet: 6, metin: 'Kristaller iskeletleri uyandırdı! Köye gelmeden onları durdurunuz.' }] }
];
const DUSMAN = t => !!(TURLER[t] && TURLER[t].dusman);

export class Gorevler {
  constructor(o) {
    Object.assign(this, o); // uretici, koyler
    this.aktif = [];
    this.tamamlanan = 0;
    this.degisti = null;
    this.gun = () => 1;   // 0.32.0: geçerli gün (ana.js ayarlar)
    this.sayac = 0;
  }
  bildir() { this.degisti && this.degisti(); }

  /* Köylünün şu anki görevi: aktif olanı ya da yeni teklif */
  koyluGorevi(koy, k) {
    const a = this.aktif.find(g => g.koyId === koy.id && g.idx === k.idx);
    if (a) return a;
    return this.teklifUret(koy, k, this.koyler.durum(koy.id).gorevNo[k.idx] || 0);
  }

  /* Hedef köy (mektup ve teslimat): 250 bloktan uzak, 1400 bloktan yakın bir köy */
  hedefKoySec(koy, r) {
    const aday = koylerAlan(this.uretici, koy.x - 1400, koy.z - 1400, koy.x + 1400, koy.z + 1400).filter(o => o.id !== koy.id && Math.hypot(o.x - koy.x, o.z - koy.z) > 250);
    if (!aday.length) return null;
    const h = aday[Math.floor(r() * aday.length)];
    return { id: h.id, ad: h.ad, x: h.x, z: h.z, m: Math.round(Math.hypot(h.x - koy.x, h.z - koy.z)) };
  }
  /* Keşif hedefi: köyden 2500 blok içindeki özel yapılar, batıklar ve Lanetli Ada */
  kesifSec(koy, r, tur) {
    const u = this.uretici, l = [];
    const ekle = (k, ad, x, z) => { const m = Math.hypot(x - koy.x, z - koy.z); if (m > 80 && m < 2500) l.push({ k, ad, x, z, m: Math.round(m) }); };
    for (const [t, Y] of Object.entries(tekYapilar(u))) ekle(t, YAPI_ADI[t], Y.x, Y.z);
    if (!tur) {
      for (const b of batiklarAlan(u, koy.x - 700, koy.z - 700, koy.x + 700, koy.z + 700)) ekle('batik', 'Batık Gemi', b.x, b.z);
      try { const A = lanetliAda(u); ekle('ada', ADA_AD, A.x, A.z); } catch (e) { /* yok sayılır */ }
    }
    const uygun = tur ? l.filter(o => o.k === tur || (tur === 'tapinak' && o.k === 'ormanTapinak')) : l;
    if (!uygun.length) return null;
    uygun.sort((a, b) => a.m - b.m);
    return tur ? uygun[0] : uygun[Math.floor(r() * Math.min(4, uygun.length))];
  }

  teklifUret(koy, k, no) {
    const M = MESLEKLER[k.meslek], d = this.koyler.durum(koy.id);
    const r = uretec(karistir(this.uretici.tohum ^ Math.imul(koy.rx + 7, 92821) ^ Math.imul(koy.rz + 13, 68917) ^ Math.imul(k.idx + 1, 31337) ^ Math.imul(no + 1, 7919)));
    let tip = M.gorev[Math.floor(r() * M.gorev.length)];
    const q = { id: `${koy.id}#${k.idx}#${no}`, koyId: koy.id, koyAd: koy.ad, koyX: koy.x, koyZ: koy.z, idx: k.idx, koyluAd: `${MESLEK_ADI[k.meslek]} ${k.ad}`, no, tur: tip[0], sayac: 0 };
    /* Zincir görev: Tanıdık itibarında, köylünün sürmekte olan ya da yeni başlayan zinciri */
    let z = d.zincir[k.idx];
    if (!z && this.koyler.kademe(koy.id) >= 2 && r() < 0.22) z = { z: Math.floor(r() * ZINCIRLER.length), adim: 0 };
    if (z) {
      const Z = ZINCIRLER[z.z], A = Z.adimlar[z.adim];
      q.zincir = { z: z.z, ad: Z.ad, adim: z.adim, toplam: Z.adimlar.length };
      tip = A.tur === 'getir' || A.tur === 'insa' ? [A.tur, A.esya, A.adet] : A.tur === 'oldur' ? ['oldur', A.hedef, A.adet] : A.tur === 'koruma' ? ['koruma', A.adet] : [A.tur];
      q.tur = A.tur; q.zincirMetin = A.metin; q.yapiTur = A.yapi;
    }
    const giris = GIRIS[q.tur][Math.floor(r() * GIRIS[q.tur].length)];
    let tamam = false;
    if (q.tur === 'mektup' || q.tur === 'teslimat') {
      const h = this.hedefKoySec(koy, r);
      if (h) {
        q.hedefKoy = { id: h.id, ad: h.ad, x: h.x, z: h.z };
        const yon = `${yonAdi(h.x - koy.x, h.z - koy.z)} yönünde, yaklaşık ${h.m} blok uzaklıktadır`;
        q.yildiz = h.m > 900 ? 3 : h.m > 500 ? 2 : 1;
        if (q.tur === 'mektup') {
          q.odul = { sikke: Math.min(14, 2 + Math.round(h.m / 180)), itibar: 8 };
          q.metin = `${giris} Bu mektubun ${h.ad} köyüne ulaştırılması gerekiyor. Köy buradan ${yon}. Mektubu oradaki herhangi bir köylüye teslim etmeniz yeterlidir.`;
          q.kisa = `${h.ad} köyüne mektup götür`;
        } else {
          q.sure = 2 + Math.ceil(h.m / 700);   // gün
          q.odul = { sikke: Math.min(24, 4 + Math.round(h.m / 110)), itibar: 9 };
          q.metin = `${giris} Bu koli ${q.sure} gün içinde ${h.ad} köyüne ulaştırılmalıdır. Köy buradan ${yon}. Koliyi oradaki herhangi bir köylüye teslim etmeniz yeterlidir; süre dolarsa gönderim iptal edilir.`;
          q.kisa = `${h.ad} köyüne koli götür`;
        }
        tamam = true;
      } else { tip = ['getir', 291, 16]; q.tur = 'getir'; }
    }
    if (!tamam && q.tur === 'kesif') {
      const h = this.kesifSec(koy, r, q.yapiTur);
      if (h) {
        q.hedef = { x: h.x, z: h.z, ad: h.ad };
        q.yildiz = h.m > 1500 ? 3 : h.m > 700 ? 2 : 1;
        q.odul = { sikke: 3 + Math.round(h.m / 120), itibar: 8 };
        q.metin = `${giris} ${h.ad} buradan ${yonAdi(h.x - koy.x, h.z - koy.z)} yönünde, yaklaşık ${h.m} blok uzakta olmalı. Yerini doğrulayıp geri dönerseniz ödüllendirileceksiniz.`;
        q.kisa = `${h.ad} keşfet`;
        tamam = true;
      } else { tip = ['oldur', 'zombi', 4]; q.tur = 'oldur'; }
    }
    if (!tamam && q.tur === 'koruma') {
      q.adet = tip[1] || 4;
      q.yildiz = q.adet >= 6 ? 3 : q.adet >= 5 ? 2 : 1;
      q.odul = { sikke: q.adet * 2 + 2, itibar: 10 };
      q.metin = `${giris} Köyün sınırları içinde ${q.adet} canavar etkisiz hâle getirilirse köy rahat bir nefes alacaktır.`;
      q.kisa = `${koy.ad} köyünü koru`;
      tamam = true;
    }
    if (!tamam && q.tur === 'insa') {
      q.esya = tip[1]; q.adet = tip[2];
      q.yildiz = q.adet >= 12 ? 2 : 1;
      q.odul = { sikke: Math.max(2, Math.round((DEGER[q.esya] || 0.2) * q.adet * 2 + 2)), itibar: 9 };
      q.metin = `${giris} Köyün içine ${q.adet} adet ${ESYALAR[q.esya].ad} konursa köy çok daha güzel ve güvenli olacaktır.`;
      q.kisa = `Köye ${ESYALAR[q.esya].ad} koy`;
      tamam = true;
    }
    if (!tamam && q.tur === 'getir') {
      q.esya = tip[1]; q.adet = tip[2];
      const sikke = Math.max(1, Math.round((DEGER[q.esya] || 0.1) * q.adet * 1.6 + 1));
      q.yildiz = sikke >= 8 ? 3 : sikke >= 4 ? 2 : 1;
      q.odul = { sikke, itibar: 5 };
      if (r() < 0.2) q.odul.esya = [290, 1];
      q.metin = `${giris} ${q.adet} adet ${ESYALAR[q.esya].ad} getirebilir misiniz? Karşılığında ${sikke} sikke${q.odul.esya ? ' ve bir Altın Elma' : ''} verilecektir.`;
      q.kisa = `${ESYALAR[q.esya].ad} getir`;
    } else if (!tamam && q.tur === 'oldur') {
      q.hedefTur = tip[1]; q.adet = tip[2];
      const ad = TURLER[q.hedefTur].ad;
      const deniz = TURLER[q.hedefTur].su;
      q.yildiz = deniz || q.adet >= 6 ? 3 : q.adet >= 4 ? 2 : 1;
      q.odul = { sikke: q.adet * (deniz ? 5 : 1) + 2, itibar: 7 };
      if (r() < 0.25) q.odul.esya = [287, 16];
      const giris2 = deniz ? 'Açık denizdeki köpekbalıkları balıkçılarımızı tehdit ediyor.' : giris;
      q.metin = `${giris2} ${q.adet} ${ad.toLocaleLowerCase('tr')} etkisiz hâle getirilirse köy rahat bir nefes alacaktır. Karşılığında ${q.odul.sikke} sikke${q.odul.esya ? ' ve 16 ok' : ''} verilecektir.`;
      q.kisa = `${ad} avla`;
    }
    /* Ödüller: deneyim ve yıldıza göre nadir eşya (3 yıldızda her zaman, 2 yıldızda yarı yarıya) */
    q.yildiz = q.yildiz || 1;
    q.odul.xp = 4 + q.yildiz * 4;
    if (!q.odul.esya && (q.yildiz === 3 || (q.yildiz === 2 && r() < 0.5))) { const l = NADIR[q.yildiz - 1]; q.odul.esya = l[Math.floor(r() * l.length)]; }
    /* Zincir: metin hikâyeden, ödül artırılmış; son adımda büyük ödül */
    if (q.zincir) {
      const Z = ZINCIRLER[q.zincir.z], son = q.zincir.adim === q.zincir.toplam - 1;
      q.metin = q.zincirMetin + (q.tur === 'teslimat' && q.hedefKoy ? ` Hedef: ${q.hedefKoy.ad} köyü (${q.sure} gün).` : q.tur === 'kesif' && q.hedef ? ` Hedef: ${q.hedef.ad}.` : '');
      q.odul.sikke = Math.round(q.odul.sikke * 1.4) + (son ? Z.odul[1] : 0);
      q.odul.itibar += 3;
      if (son) { q.odul.esya = Z.odul[0]; q.yildiz = 3; q.odul.xp += 15; }
      q.kisa = `${Z.ad} (${q.zincir.adim + 1}/${q.zincir.toplam}): ${q.kisa}`;
      delete q.zincirMetin;
    }
    q.ekHedef = q.tur === 'teslimat' ? null : 'Kabul edildiği gün içinde tamamlanırsa: +%50 sikke, +2 itibar';
    return q;
  }

  kabul(q, envanter) {
    if (this.aktif.length >= MAKS_AKTIF) return 'En fazla üç görev aynı anda alınabilir.';
    if (this.aktif.some(g => g.id === q.id)) return null;
    q.basGun = this.gun();
    if (q.sure) q.sonGun = q.basGun + q.sure;
    this.aktif.push(q);
    if (q.tur === 'mektup') { const k = envanter.ekle(294, 1); if (k) this.koyler.birak(294, k); }
    if (q.tur === 'teslimat') { const k = envanter.ekle(KOLI, 1); if (k) this.koyler.birak(KOLI, k); }
    /* Zincirin ilk adımı kabul edilince zincir başlar */
    if (q.zincir) { const d = this.koyler.durum(q.koyId); if (!d.zincir[q.idx]) d.zincir[q.idx] = { z: q.zincir.z, adim: q.zincir.adim }; }
    this.bildir();
    return null;
  }
  birak(q) {
    this.aktif = this.aktif.filter(g => g !== q);
    /* Bırakılan zincir sona erer */
    if (q && q.zincir) { const d = this.koyler.durum(q.koyId); delete d.zincir[q.idx]; d.gorevNo[q.idx] = (d.gorevNo[q.idx] || 0) + 1; }
    this.bildir();
  }

  ilerleme(q, envanter) {
    if (q.tur === 'getir') return Math.min(q.adet, envanter.say(q.esya));
    if (q.tur === 'oldur' || q.tur === 'koruma' || q.tur === 'insa') return Math.min(q.adet, q.sayac);
    if (q.tur === 'kesif') return q.bulundu ? 1 : 0;
    return envanter.say(q.tur === 'teslimat' ? KOLI : 294) > 0 ? 1 : 0;
  }
  hedefAdet(q) { return q.adet || 1; }
  tamamlanabilir(q, envanter) { return q.tur === 'mektup' || q.tur === 'teslimat' ? false : this.ilerleme(q, envanter) >= this.hedefAdet(q); }
  /* Pusula ve harita hedefi */
  hedef(q, envanter) {
    if (q.tur === 'mektup' || q.tur === 'teslimat') return q.hedefKoy;
    if (q.tur === 'kesif' && !q.bulundu) return q.hedef;
    return this.tamamlanabilir(q, envanter) ? { x: q.koyX, z: q.koyZ } : null;
  }
  /* Kısa durum metni (gösterge, günlük, konsol) */
  durumMetni(q, envanter, p) {
    if (q.tur === 'mektup' || q.tur === 'teslimat') {
      const dx = q.hedefKoy.x - p.x, dz = q.hedefKoy.z - p.z;
      return `${yonAdi(dx, dz)} · ${Math.round(Math.hypot(dx, dz))} blok${q.sonGun != null ? ` · ${Math.max(0, q.sonGun - this.gun())} gün kaldı` : ''}`;
    }
    if (q.tur === 'kesif' && !q.bulundu) { const dx = q.hedef.x - p.x, dz = q.hedef.z - p.z; return `${yonAdi(dx, dz)} · ${Math.round(Math.hypot(dx, dz))} blok`; }
    const n = this.ilerleme(q, envanter), a = this.hedefAdet(q);
    return n >= a ? `Tamamlandı · ${q.koyluAd}` : `${n} / ${a}`;
  }
  /* Geliştirici: görevi teslime hazır yapar */
  hazirla(q, envanter) {
    if (q.tur === 'getir') { const eksik = q.adet - envanter.say(q.esya); if (eksik > 0) envanter.ekle(q.esya, eksik); return true; }
    if (q.tur === 'oldur' || q.tur === 'koruma' || q.tur === 'insa') { q.sayac = q.adet; return true; }
    if (q.tur === 'kesif') { q.bulundu = true; return true; }
    return false;
  }

  /* Görevi veren köylüye teslim */
  teslim(q, envanter) {
    if (!this.tamamlanabilir(q, envanter)) return false;
    if (q.tur === 'getir') envanter.harca(q.esya, q.adet);
    this.odullendir(q, envanter);
    return true;
  }
  /* Mektup ve koli: hedef köydeki herhangi bir köylü */
  mektupTeslim(koyId, envanter) {
    const q = this.aktif.find(g => (g.tur === 'mektup' || g.tur === 'teslimat') && g.hedefKoy.id === koyId && envanter.say(g.tur === 'teslimat' ? KOLI : 294) > 0);
    if (!q) return null;
    envanter.harca(q.tur === 'teslimat' ? KOLI : 294, 1);
    this.odullendir(q, envanter);
    this.koyler.itibarDegistir(koyId, 4);
    return q;
  }
  odullendir(q, envanter) {
    /* Ek hedef: kabul edildiği gün içinde */
    q.ekBasari = !!(q.ekHedef && q.basGun != null && this.gun() === q.basGun);
    const sikke = q.ekBasari ? Math.round(q.odul.sikke * 1.5) : q.odul.sikke;
    q.kazanilan = sikke;
    const k = envanter.ekle(288, sikke); if (k) this.koyler.birak(288, k);
    if (q.odul.esya) { const k2 = envanter.ekle(q.odul.esya[0], q.odul.esya[1]); if (k2) this.koyler.birak(q.odul.esya[0], k2); }
    this.koyler.itibarDegistir(q.koyId, q.odul.itibar + (q.ekBasari ? 2 : 0));
    if (q.odul.xp && this.xpVer) this.xpVer(q.odul.xp);
    const d = this.koyler.durum(q.koyId);
    d.gorevNo[q.idx] = (d.gorevNo[q.idx] || 0) + 1;
    /* Görev veren köylü de deneyim kazanır */
    const koy = this.koyler.koy(q.koyId), kl = koy && koy.koylular[q.idx];
    if (kl) this.koyler.xpEkle(koy, kl, 3 + (q.yildiz || 1));
    /* Zincir: sonraki adım ya da bitiş */
    if (q.zincir) {
      if (q.zincir.adim + 1 < q.zincir.toplam) d.zincir[q.idx] = { z: q.zincir.z, adim: q.zincir.adim + 1 };
      else { delete d.zincir[q.idx]; if (this.zincirBitti) this.zincirBitti(q); }
    }
    this.aktif = this.aktif.filter(g => g !== q);
    this.tamamlanan++;
    if (this.tamamlandi) this.tamamlandi(q);
    this.bildir();
  }

  /* Oyuncunun öldürdüğü canlıları say (koruma: köyün içindeki her canavar) */
  oldurme(turAd) {
    let d = false;
    /* Biyoma özgü türler (mumya, boğulmuş zombi, buz iskeleti) ana türün görevine sayılır */
    const aile = TURLER[turAd] && TURLER[turAd].aile, koy = this.koyler.icindeki;
    for (const q of this.aktif) {
      if (q.tur === 'oldur' && (q.hedefTur === turAd || q.hedefTur === aile) && q.sayac < q.adet) { q.sayac++; d = true; }
      else if (q.tur === 'koruma' && koy && koy.id === q.koyId && DUSMAN(turAd) && q.sayac < q.adet) { q.sayac++; d = true; if (q.sayac >= q.adet && this.bildirim) this.bildirim(`${q.koyAd} köyü korundu. Ödül için ${q.koyluAd} kişisine gidiniz.`); }
    }
    if (d) this.bildir();
  }
  /* İnşa görevi: köyün içine konan bloklar */
  blokKondu(id) {
    const koy = this.koyler.icindeki;
    if (!koy) return;
    let d = false;
    for (const q of this.aktif) if (q.tur === 'insa' && q.koyId === koy.id && q.esya === id && q.sayac < q.adet) { q.sayac++; d = true; if (q.sayac >= q.adet && this.bildirim) this.bildirim(`İnşaat tamamlandı. Ödül için ${q.koyluAd} kişisine gidiniz.`); }
    if (d) this.bildir();
  }
  /* Saniyede bir: keşif hedefine yaklaşma, teslimat süresi */
  guncelle(dt, p) {
    this.sayac -= dt;
    if (this.sayac > 0 || !this.aktif.length) return;
    this.sayac = 1;
    const g = this.gun();
    for (const q of [...this.aktif]) {
      if (q.tur === 'kesif' && !q.bulundu && q.hedef && Math.hypot(q.hedef.x - p.x, q.hedef.z - p.z) < 32) {
        q.bulundu = true; this.bildir();
        if (this.bildirim) this.bildirim(`${q.hedef.ad} bulundu! Ödül için ${q.koyluAd} kişisine dönünüz.`);
      }
      if (q.sonGun != null && g > q.sonGun) {
        this.aktif = this.aktif.filter(x => x !== q);
        this.koyler.itibarDegistir(q.koyId, -3);
        const d = this.koyler.durum(q.koyId);
        if (q.zincir) delete d.zincir[q.idx];
        d.gorevNo[q.idx] = (d.gorevNo[q.idx] || 0) + 1;
        if (this.bildirim) this.bildirim(`Teslimat süresi doldu: ${q.kisa}. Görev iptal edildi.`);
        this.bildir();
      }
    }
  }

  /* Gösterge satırları */
  ozet(envanter, oyuncu) {
    return this.aktif.map(q => ({ metin: q.kisa, durum: this.durumMetni(q, envanter, oyuncu), bitti: this.tamamlanabilir(q, envanter) }));
  }

  disaAktar() { return { aktif: this.aktif, tamamlanan: this.tamamlanan }; }
  iceAktar(o) { this.aktif = (o && o.aktif) || []; this.tamamlanan = (o && o.tamamlanan) || 0; }
}
