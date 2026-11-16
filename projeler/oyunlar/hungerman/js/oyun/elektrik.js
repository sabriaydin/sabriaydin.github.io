/* HungerMan - elektrik sistemi (0.24.0)
   Elektrik blokları (bloklar.js'te elektrik niteliği taşıyanlar) birbirine bitişik olunca aynı ağı oluşturur; uzak cihazlar Elektrik Kablosuyla bağlanır.
   Kapalı Şalter ağı keser. Her 0,5 saniyede bir ağlar bulunur ve hesaplanır:
   - Üreticiler: Güneş Paneli (gündüz, üstü açıkken; bulut ve yağış azaltır), Rüzgâr Türbini (yükseklik, rüzgâr ve fırtınayla artar),
     Su Türbini (yanındaki her su bloğu için; kışın yarı yarıya).
   - Kablo kaybı: ağdaki her kablo üretimi %0,2 azaltır (en çok %25).
   - Tüketiciler (lamba, ocak, ısıtıcı) üretim yeterliyse ya da bataryalarda yetecek enerji varsa çalışır; yoksa hepsi söner.
   - Artan enerji bataryalara, doluluk oranları eşit olacak biçimde dağıtılır. Bataryanın yan yüzündeki gösterge doluluğu gösterir.
   Hesap tek oyunculuda ve sunucuda yapılır; blok durumları ağla dağıtılır. Çok oyunculu istemci ağ bilgisini sunucudan ister. */
import { BLOKLAR, SIVI, LAV } from '../bloklar.js';
import { DENIZ, diyarMi } from '../sabitler.js';

const YAN6 = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const ADIM = 0.5;
const C = k => k.split(',').map(Number);
const ILET = b => !!(b && b.elektrik && !(b.elektrik === 'salter' && !b.acik));   // kapalı şalter iletmez

export class Elektrik {
  constructor(o) {
    Object.assign(this, o);   // dunya, ortam(): { gunIsigi, yogunluk, firtina, mevsim, sure }
    this.sayac = 0;
    this.agBilgi = new Map();   // blok anahtarı -> ağ özeti
    this.cihaz = new Map();     // blok anahtarı -> cihazın anlık üretimi / tüketimi
    /* Kırılan bataryanın enerjisi silinir */
    this.dinle = (x, y, z, id, eski) => {
      const a = BLOKLAR[eski], b = BLOKLAR[id];
      if (a && a.elektrik === 'batarya' && !(b && b.elektrik === 'batarya' && b.kapasite === a.kapasite)) this.dunya.enerji.delete(x + ',' + y + ',' + z);
    };
    this.dunya.dinleyiciler.push(this.dinle);
  }
  kapat() { const i = this.dunya.dinleyiciler.indexOf(this.dinle); if (i >= 0) this.dunya.dinleyiciler.splice(i, 1); }

  guncelle(dt) {
    if (!this.dunya.elektrikler.size) { if (this.agBilgi.size) { this.agBilgi.clear(); this.cihaz.clear(); } return; }
    this.sayac -= dt;
    if (this.sayac > 0) return;
    this.sayac = ADIM;
    this.hesapla(ADIM);
  }

  /* Üreticinin bu anki üretimi (E/sn) */
  uretim(b, x, y, z, O) {
    const d = this.dunya;
    if (diyarMi(x)) return 0;
    if (b.elektrik === 'gunes') {
      if (d.ustKati(x, z) > y) return 0;
      const gun = Math.min(1, Math.max(0, ((O.gunIsigi ?? 1) - 0.14) / 0.86));
      return b.uretim * gun * (1 - 0.7 * Math.min(1, O.yogunluk || 0));
    }
    if (b.elektrik === 'ruzgar') {
      if (d.ustKati(x, z) > y) return 0;
      const yuk = Math.min(9, Math.max(1.5, 1.5 + (y - DENIZ) * 0.15));
      const esinti = 0.8 + 0.2 * Math.sin(O.sure * 0.13 + x * 0.7 + z * 0.3);
      return Math.min(b.uretim, yuk * esinti * (1 + 0.6 * Math.min(1, O.yogunluk || 0)) * (O.firtina ? 1.4 : 1));
    }
    if (b.elektrik === 'su') {
      let n = 0;
      for (const [a, bb, c] of [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [0, -1, 0]]) { const q = d.blok(x + a, y + bb, z + c); if (SIVI[q] && !LAV[q]) n++; }
      return Math.min(b.uretim, n * 2) * (O.mevsim === 3 ? 0.5 : 1);
    }
    return 0;
  }

  hesapla(dt) {
    const d = this.dunya, E = d.elektrikler, O = this.ortam();
    const gorulen = new Set();
    this.agBilgi.clear(); this.cihaz.clear();
    for (const [k0, p0] of E) {
      if (gorulen.has(k0)) continue;
      const b0 = BLOKLAR[d.blok(p0[0], p0[1], p0[2])];
      if (!b0 || !b0.elektrik) { E.delete(k0); continue; }
      gorulen.add(k0);
      /* Kapalı şalter tek başına kalır */
      if (!ILET(b0)) { this.agBilgi.set(k0, { uretim: 0, tuketim: 0, istek: 0, depo: 0, kap: 0, calisiyor: false, cihaz: 1, kapali: true }); continue; }
      /* Ağı bul */
      const ag = [k0], kuyruk = [p0];
      while (kuyruk.length) {
        const [x, y, z] = kuyruk.pop();
        for (const [a, bb, c] of YAN6) {
          const k = (x + a) + ',' + (y + bb) + ',' + (z + c);
          if (gorulen.has(k) || !E.has(k)) continue;
          const nb = BLOKLAR[d.blok(x + a, y + bb, z + c)];
          if (!ILET(nb)) continue;
          gorulen.add(k); ag.push(k); kuyruk.push([x + a, y + bb, z + c]);
        }
      }
      /* Üretim, istek ve depo */
      let uretim = 0, istek = 0, kablo = 0, depo = 0, kap = 0, cihazSayisi = 0;
      const tuketiciler = [], bataryalar = [];
      for (const k of ag) {
        const [x, y, z] = C(k), b = BLOKLAR[d.blok(x, y, z)];
        if (b.elektrik === 'kablo') { kablo++; continue; }
        cihazSayisi++;
        if (b.uretim) { const u = this.uretim(b, x, y, z, O); uretim += u; this.cihaz.set(k, u); }
        else if (b.tuketim) { istek += b.tuketim; tuketiciler.push([k, x, y, z, b]); }
        else if (b.elektrik === 'batarya') {
          const e = Math.min(b.kapasite, d.enerji.get(k) || 0);
          depo += e; kap += b.kapasite; bataryalar.push([k, x, y, z, b]);
        }
      }
      const kayip = Math.min(0.25, kablo * 0.002);
      uretim *= 1 - kayip;
      const net = uretim - istek;
      const calisiyor = istek > 0 && (net >= 0 || depo + net * dt >= 0);
      const tuketim = calisiyor ? istek : 0;
      depo = Math.max(0, Math.min(kap, depo + (uretim - tuketim) * dt));
      /* Enerji bataryalara doluluk oranı eşit olacak biçimde dağıtılır */
      const oran = kap > 0 ? depo / kap : 0;
      for (const [k, x, y, z, b] of bataryalar) {
        d.enerji.set(k, b.kapasite * oran);
        const s = oran <= 0.02 ? 0 : Math.min(4, Math.ceil(oran * 4 - 0.001));
        if (b.seviye !== s) d.blokKoy(x, y, z, b.taban + s, 'elektrik');
      }
      for (const [k, x, y, z, b] of tuketiciler) {
        this.cihaz.set(k, calisiyor ? b.tuketim : 0);
        if (!!b.acik !== calisiyor) d.blokKoy(x, y, z, b.taban + (calisiyor ? 1 : 0), 'elektrik');
      }
      const ozet = { uretim, tuketim, istek, depo, kap, calisiyor, cihaz: cihazSayisi, kayip, eksik: istek > 0 && !calisiyor };
      for (const k of ag) this.agBilgi.set(k, ozet);
    }
  }

  /* Bakılan bloğun bilgisi (arayüz ve ağ isteği için); hesaplanmamışsa null */
  bilgi(k) {
    const a = this.agBilgi.get(k);
    if (!a) return null;
    const v = { u: r1(a.uretim), t: r1(a.tuketim), i: r1(a.istek), d: Math.round(a.depo), k: a.kap, c: a.calisiyor ? 1 : 0, n: a.cihaz, s: a.kapali ? 1 : 0, ky: Math.round(a.kayip * 100) };
    if (this.cihaz.has(k)) v.x = r1(this.cihaz.get(k));
    const [x, y, z] = C(k), b = BLOKLAR[this.dunya.blok(x, y, z)];
    if (b && b.elektrik === 'batarya') v.bd = Math.round(Math.min(b.kapasite, this.dunya.enerji.get(k) || 0));
    return v;
  }
}
const r1 = n => Math.round(n * 10) / 10;

/* Bilgi panelinin metni: b blok tanımı, v bilgi() sonucu */
export function enerjiMetni(b, v) {
  const s = n => String(n).replace('.', ','), bin = n => Math.round(n).toLocaleString('tr-TR');
  if (!v) return { satirlar: ['Bilgi alınıyor…'], durum: '', oran: null };
  if (v.s) return { satirlar: ['Şalter kapalı: ağ kesik.'], durum: 'kapali', oran: null };
  const l = [];
  const e = b.elektrik;
  if (b.uretim) l.push(`Bu cihaz <b>${s(v.x ?? 0)}</b> E/sn üretiyor` + (v.x === 0 ? (e === 'gunes' ? ' (güneş yok)' : e === 'su' ? ' (yanında su yok)' : ' (rüzgâr yok)') : ''));
  else if (b.tuketim) l.push(`Bu cihaz <b>${s(b.tuketim)}</b> E/sn harcar · ${v.c ? 'çalışıyor' : 'kapalı'}`);
  else if (e === 'batarya') l.push(`Batarya <b>${bin(v.bd || 0)}</b> / ${bin(b.kapasite)} E`);
  l.push(`Ağ: üretim <b>${s(v.u)}</b> · tüketim <b>${s(v.t)}</b> E/sn` + (v.ky ? ` · kayıp %${v.ky}` : ''));
  if (v.k) l.push(`Ağ deposu <b>${bin(v.d)}</b> / ${bin(v.k)} E`);
  const durum = v.i > 0 && !v.c ? 'eksik' : v.u > v.t + 0.05 ? (v.k && v.d < v.k ? 'sarj' : 'fazla') : v.i > 0 ? 'calisiyor' : v.n ? 'bos' : '';
  return { satirlar: l, durum, oran: v.k ? v.d / v.k : null };
}
export const DURUM_AD = { eksik: 'Enerji yetersiz', sarj: 'Şarj ediliyor', fazla: 'Fazla üretim', calisiyor: 'Çalışıyor', bos: 'Tüketici yok', kapali: 'Kesik' };
