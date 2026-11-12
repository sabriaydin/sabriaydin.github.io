/* HungerMan - görev sistemi: köylüler getirme, avlanma ve mektup görevleri verir
   Görevler tohum + köy + köylü + görev sırasından üretilir; aynı köylü aynı sırada hep aynı görevi verir. */
import { ESYALAR } from '../bloklar.js';
import { karistir, uretec } from '../rastgele.js';
import { MESLEKLER, DEGER } from './meslekler.js';
import { koylerAlan, MESLEK_ADI } from '../dunya/koy-uretici.js';
import { TURLER } from '../varlik/turler.js';

export const MAKS_AKTIF = 3;
const YONLER = ['kuzey', 'kuzeydoğu', 'doğu', 'güneydoğu', 'güney', 'güneybatı', 'batı', 'kuzeybatı'];
export function yonAdi(dx, dz) { let a = Math.atan2(dx, -dz) * 180 / Math.PI; if (a < 0) a += 360; return YONLER[Math.round(a / 45) % 8]; }
export function yonAci(dx, dz) { let a = Math.atan2(dx, -dz) * 180 / Math.PI; if (a < 0) a += 360; return a; }
const GIRIS = {
  getir: ['Bir ricam olacak.', 'Yardımınıza ihtiyacım var.', 'Köyümüz için önemli bir iş var.'],
  oldur: ['Geceleri huzurumuz kalmadı.', 'Köyün çevresi tehlikeli hâle geldi.'],
  mektup: ['Uzak bir köye haber ulaştırmamız gerekiyor.']
};

export class Gorevler {
  constructor(o) {
    Object.assign(this, o); // uretici, koyler
    this.aktif = [];
    this.tamamlanan = 0;
    this.degisti = null;
  }
  bildir() { this.degisti && this.degisti(); }

  /* Köylünün şu anki görevi: aktif olanı ya da yeni teklif */
  koyluGorevi(koy, k) {
    const a = this.aktif.find(g => g.koyId === koy.id && g.idx === k.idx);
    if (a) return a;
    return this.teklifUret(koy, k, this.koyler.durum(koy.id).gorevNo[k.idx] || 0);
  }

  teklifUret(koy, k, no) {
    const M = MESLEKLER[k.meslek];
    const r = uretec(karistir(this.uretici.tohum ^ Math.imul(koy.rx + 7, 92821) ^ Math.imul(koy.rz + 13, 68917) ^ Math.imul(k.idx + 1, 31337) ^ Math.imul(no + 1, 7919)));
    let tip = M.gorev[Math.floor(r() * M.gorev.length)];
    const q = { id: `${koy.id}#${k.idx}#${no}`, koyId: koy.id, koyAd: koy.ad, koyX: koy.x, koyZ: koy.z, idx: k.idx, koyluAd: `${MESLEK_ADI[k.meslek]} ${k.ad}`, no, tur: tip[0], sayac: 0 };
    const giris = GIRIS[q.tur][Math.floor(r() * GIRIS[q.tur].length)];
    if (q.tur === 'mektup') {
      const aday = koylerAlan(this.uretici, koy.x - 1400, koy.z - 1400, koy.x + 1400, koy.z + 1400).filter(o => o.id !== koy.id && Math.hypot(o.x - koy.x, o.z - koy.z) > 250);
      if (!aday.length) { tip = ['getir', 291, 16]; q.tur = 'getir'; }
      else {
        const h = aday[Math.floor(r() * aday.length)];
        const m = Math.round(Math.hypot(h.x - koy.x, h.z - koy.z));
        q.hedefKoy = { id: h.id, ad: h.ad, x: h.x, z: h.z };
        q.odul = { sikke: Math.min(14, 2 + Math.round(m / 180)), itibar: 8 };
        q.metin = `${giris} Bu mektubun ${h.ad} köyüne ulaştırılması gerekiyor. Köy buradan ${yonAdi(h.x - koy.x, h.z - koy.z)} yönünde, yaklaşık ${m} blok uzaklıktadır. Mektubu oradaki herhangi bir köylüye teslim etmeniz yeterlidir.`;
        q.kisa = `${h.ad} köyüne mektup götür`;
        return q;
      }
    }
    if (q.tur === 'getir') {
      q.esya = tip[1]; q.adet = tip[2];
      const sikke = Math.max(1, Math.round((DEGER[q.esya] || 0.1) * q.adet * 1.6 + 1));
      q.odul = { sikke, itibar: 5 };
      if (r() < 0.2) q.odul.esya = [290, 1];
      q.metin = `${giris} ${q.adet} adet ${ESYALAR[q.esya].ad} getirebilir misiniz? Karşılığında ${sikke} sikke${q.odul.esya ? ' ve bir Altın Elma' : ''} verilecektir.`;
      q.kisa = `${ESYALAR[q.esya].ad} getir`;
    } else if (q.tur === 'oldur') {
      q.hedefTur = tip[1]; q.adet = tip[2];
      const ad = TURLER[q.hedefTur].ad;
      const deniz = TURLER[q.hedefTur].su;
      q.odul = { sikke: q.adet * (deniz ? 5 : 1) + 2, itibar: 7 };
      if (r() < 0.25) q.odul.esya = [287, 16];
      const giris2 = deniz ? 'Açık denizdeki köpekbalıkları balıkçılarımızı tehdit ediyor.' : giris;
      q.metin = `${giris2} ${q.adet} ${ad.toLocaleLowerCase('tr')} etkisiz hâle getirilirse köy rahat bir nefes alacaktır. Karşılığında ${q.odul.sikke} sikke${q.odul.esya ? ' ve 16 ok' : ''} verilecektir.`;
      q.kisa = `${ad} avla`;
    }
    return q;
  }

  kabul(q, envanter) {
    if (this.aktif.length >= MAKS_AKTIF) return 'En fazla üç görev aynı anda alınabilir.';
    if (this.aktif.some(g => g.id === q.id)) return null;
    this.aktif.push(q);
    if (q.tur === 'mektup') { const k = envanter.ekle(294, 1); if (k) this.koyler.birak(294, k); }
    this.bildir();
    return null;
  }
  birak(q) { this.aktif = this.aktif.filter(g => g !== q); this.bildir(); }

  ilerleme(q, envanter) {
    if (q.tur === 'getir') return Math.min(q.adet, envanter.say(q.esya));
    if (q.tur === 'oldur') return Math.min(q.adet, q.sayac);
    return envanter.say(294) > 0 ? 1 : 0;
  }
  tamamlanabilir(q, envanter) { return q.tur === 'mektup' ? false : this.ilerleme(q, envanter) >= q.adet; }

  /* Görevi veren köylüye teslim */
  teslim(q, envanter) {
    if (!this.tamamlanabilir(q, envanter)) return false;
    if (q.tur === 'getir') envanter.harca(q.esya, q.adet);
    this.odullendir(q, envanter);
    return true;
  }
  /* Mektup görevi: hedef köydeki herhangi bir köylü */
  mektupTeslim(koyId, envanter) {
    const q = this.aktif.find(g => g.tur === 'mektup' && g.hedefKoy.id === koyId);
    if (!q || envanter.say(294) < 1) return null;
    envanter.harca(294, 1);
    this.odullendir(q, envanter);
    this.koyler.itibarDegistir(koyId, 4);
    return q;
  }
  odullendir(q, envanter) {
    const k = envanter.ekle(288, q.odul.sikke); if (k) this.koyler.birak(288, k);
    if (q.odul.esya) { const k2 = envanter.ekle(q.odul.esya[0], q.odul.esya[1]); if (k2) this.koyler.birak(q.odul.esya[0], k2); }
    this.koyler.itibarDegistir(q.koyId, q.odul.itibar);
    const d = this.koyler.durum(q.koyId);
    d.gorevNo[q.idx] = (d.gorevNo[q.idx] || 0) + 1;
    this.aktif = this.aktif.filter(g => g !== q);
    this.tamamlanan++;
    this.bildir();
  }

  /* Oyuncunun öldürdüğü canlıları say */
  oldurme(turAd) {
    let d = false;
    for (const q of this.aktif) if (q.tur === 'oldur' && q.hedefTur === turAd && q.sayac < q.adet) { q.sayac++; d = true; }
    if (d) this.bildir();
  }

  /* Gösterge satırları */
  ozet(envanter, oyuncu) {
    return this.aktif.map(q => {
      if (q.tur === 'mektup') {
        const dx = q.hedefKoy.x - oyuncu.x, dz = q.hedefKoy.z - oyuncu.z;
        return { metin: q.kisa, durum: `${yonAdi(dx, dz)} · ${Math.round(Math.hypot(dx, dz))} blok`, bitti: false };
      }
      const n = this.ilerleme(q, envanter);
      return { metin: q.kisa, durum: n >= q.adet ? `Tamamlandı · ${q.koyluAd}` : `${n} / ${q.adet}`, bitti: n >= q.adet };
    });
  }

  disaAktar() { return { aktif: this.aktif, tamamlanan: this.tamamlanan }; }
  iceAktar(o) { this.aktif = (o && o.aktif) || []; this.tamamlanan = (o && o.tamamlanan) || 0; }
}
