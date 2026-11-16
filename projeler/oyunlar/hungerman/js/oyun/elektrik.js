/* HungerMan - elektrik sistemi (0.24.0; 0.25.0: çok bloklu cihazlar; 0.27.0: Rust tarzı yönlü güç akışı)
   Her cihazın giriş ve çıkış bağlantı noktaları vardır (oyun/kablolar.js). Güç yalnızca kablolarla, çıkıştan girişe akar; yan yana duran
   cihazlar birbirine bağlı sayılmaz. Her 0,5 saniyede:
   1. Talep (çıkışlardan geriye doğru): tüketici kendi ihtiyacı + geçiş çıkışının talebi; açık şalter ve dağıtıcı çıkışlarının toplamı;
      kapalı şalter 0; batarya dolu değilse şarj hızı (bataryanın arkasındaki talep, bataryanın kendi deposundan karşılanır).
   2. Güç (kaynaklardan ileriye doğru, sıra gözetilerek): üretici üretimini çıkışına verir; batarya çıkışına talep kadar (en çok çıkış hızı
      ve deposu kadar) verir; tüketici girişine gelen güç ihtiyacını karşılıyorsa çalışır ve artanı çıkışına geçirir, karşılamıyorsa söner
      ve çıkışına bir şey vermez; şalter açıkken gelen gücü geçirir; dağıtıcı gelen gücü çıkışlarına talepleri oranında böler;
      birleştirici girişlerini toplar. Kablonun her bloğu taşıdığı gücü %0,1 azaltır.
   3. Batarya girişine gelen güç (en çok şarj hızı) depoya eklenir, çıkışa verilen düşülür.
   Hesap tek oyunculuda ve sunucuda yapılır; tüketici durumları blok değişikliği, batarya doluluğu 'bo' iletisiyle dağıtılır. */
import { BLOKLAR, SIVI, LAV, KATI } from '../bloklar.js';
import { DENIZ, diyarMi } from '../sabitler.js';
import { CIHAZ, cihazHucreleri, kokKonumu, pervaneHucreleri, dondurXZ } from '../cihazlar.js';
import { portlar } from './kablolar.js';

const ADIM = 0.5;
const C = k => k.split(',').map(Number);
/* Bataryaların şarj ve çıkış hızı (E/sn) */
export const BATARYA_HIZ = { bataryaK: 10, bataryaO: 25, bataryaB: 60 };
export const kokAnahtari = (b, x, y, z) => (b && b.cihaz && b.parca ? kokKonumu(b, x, y, z).join(',') : x + ',' + y + ',' + z);

/* Kök hücresi (x, y, z) olan üreticinin bu anki üretimi (E/sn) ve durmasının nedeni; çizici de dönüş hızı için kullanır.
   O: { gunIsigi, yogunluk, firtina, mevsim, sure } */
export function cihazUretim(d, b, x, y, z, O) {
  if (!b || !b.uretim || diyarMi(x)) return { u: 0, neden: '' };
  const Cd = CIHAZ[b.cihaz];
  if (b.elektrik === 'gunes') {
    let acik = 0;
    for (const [hx, hy, hz] of cihazHucreleri(Cd, b.yon, x, y, z)) if (d.ustKati(hx, hz) <= hy) acik++;
    if (!acik) return { u: 0, neden: 'üstü kapalı' };
    const gun = Math.min(1, Math.max(0, ((O.gunIsigi ?? 1) - 0.14) / 0.86));
    if (gun <= 0) return { u: 0, neden: 'gece' };
    return { u: b.uretim * (acik / Cd.n) * gun * (1 - 0.7 * Math.min(1, O.yogunluk || 0)), neden: acik < Cd.n ? 'kısmen gölgede' : '' };
  }
  if (b.elektrik === 'ruzgar') {
    for (const [hx, hy, hz] of pervaneHucreleri(b.yon, x, y, z)) { const q = d.blok(hx, hy, hz); if (KATI[q] && !(BLOKLAR[q] && BLOKLAR[q].cihaz)) return { u: 0, neden: 'pervane engelli' }; }
    const tepe = y + Cd.h - 1;
    if (d.ustKati(x, z) > tepe) return { u: 0, neden: 'üstü kapalı' };
    const yuk = Math.min(1, Math.max(0.25, (tepe - DENIZ) / 40));
    const esinti = 0.75 + 0.25 * Math.sin(O.sure * 0.13 + x * 0.7 + z * 0.3);
    return { u: Math.min(b.uretim, b.uretim * 0.7 * yuk * esinti * (1 + 0.6 * Math.min(1, O.yogunluk || 0)) * (O.firtina ? 1.4 : 1)), neden: '' };
  }
  if (b.elektrik === 'su') {
    let n = 0;
    const ic = new Set(cihazHucreleri(Cd, b.yon, x, y, z).map(h => h[0] + ',' + h[1] + ',' + h[2]));
    for (const [hx, hy, hz, i] of cihazHucreleri(Cd, b.yon, x, y, z)) {
      if (Cd && Math.floor(i / (Cd.w * Cd.d)) !== 0) continue;   // alt sıra
      const [fx, fz] = dondurXZ(0, 1, b.yon);
      for (const [a, bb, c] of [[0, -1, 0], [fx, 0, fz], [-fx, 0, -fz]]) {
        const k = (hx + a) + ',' + (hy + bb) + ',' + (hz + c);
        if (ic.has(k)) continue;
        const q = d.blok(hx + a, hy + bb, hz + c); if (SIVI[q] && !LAV[q]) n++;
      }
    }
    if (!n) return { u: 0, neden: 'suya değmiyor' };
    return { u: Math.min(b.uretim, n * 1.5) * (O.mevsim === 3 ? 0.5 : 1), neden: O.mevsim === 3 ? 'kış: yarı güç' : '' };
  }
  return { u: 0, neden: '' };
}

export class Elektrik {
  constructor(o) {
    Object.assign(this, o);   // dunya, ortam(): { gunIsigi, yogunluk, firtina, mevsim, sure }, kablolar, kabloKoptu(w, nokta)
    this.sayac = 0;
    this.dugumler = new Map();   // kök anahtarı -> son hesabın özeti
    this.oranlar = new Map();    // batarya kök anahtarı -> doluluk (0..1)
    /* Kırılan bataryanın enerjisi silinir */
    this.dinle = (x, y, z, id, eski) => {
      const a = BLOKLAR[eski];
      if (a && a.elektrik === 'batarya' && !a.parca && id !== eski) { const k = x + ',' + y + ',' + z; this.dunya.enerji.delete(k); this.oranlar.delete(k); }
    };
    this.dunya.dinleyiciler.push(this.dinle);
  }
  kapat() { const i = this.dunya.dinleyiciler.indexOf(this.dinle); if (i >= 0) this.dunya.dinleyiciler.splice(i, 1); }

  guncelle(dt) {
    if (!this.dunya.elektrikler.size) { if (this.dugumler.size) this.dugumler.clear(); return; }
    this.sayac -= dt;
    if (this.sayac > 0) return;
    this.sayac = ADIM;
    this.hesapla(ADIM);
  }

  hesapla(dt) {
    const d = this.dunya, E = d.elektrikler, O = this.ortam(), K = this.kablolar;
    /* Kökü kalmamış cihaz hücreleri (patlama, eksik kayıt) kaldırılır */
    for (const [, [x, y, z]] of E) {
      const b = BLOKLAR[d.blok(x, y, z)];
      if (!b || !b.cihaz || !b.parca) continue;
      const [ax, ay, az] = kokKonumu(b, x, y, z);
      if (d.yuklu(ax, az) && d.blok(ax, ay, az) !== b.kok) d.blokKoy(x, y, z, 0, 'elektrik');
    }
    /* Düğümler: bağlantı noktası olan cihazlar */
    const D = new Map();
    for (const [k, [x, y, z]] of E) {
      const b = BLOKLAR[d.blok(x, y, z)];
      if (!b || !b.elektrik) { E.delete(k); continue; }
      const P = portlar(b);
      if (!P.length) continue;
      D.set(k, { k, x, y, z, b, P, cik: [], gir: [], gelen: 0, giden: 0, talep: 0, uretim: 0 });
    }
    /* Ucundaki cihaz kalkan ya da bağlantı noktası değişen kablolar kopar (kablo eşyası düşer) */
    if (K) {
      K.eskileriAta();
      for (const w of [...K.liste.values()]) {
        if (w.eski) continue;
        let kop = null;
        for (const [u, pi, tur] of [[w.a, w.ap, 'cikis'], [w.b, w.bp, 'giris']]) {
          const [x, y, z] = C(u);
          if (!d.yuklu(x, z)) continue;
          const n = D.get(u);
          if (!n || !n.P[pi] || n.P[pi][0] !== tur) { kop = [x + 0.5, y + 0.5, z + 0.5]; break; }
        }
        if (kop) { K.sil(w.i); if (this.kabloKoptu) this.kabloKoptu(w, kop); continue; }
        const A = D.get(w.a), B = D.get(w.b);
        if (!A || !B) continue;
        const kayip = Math.min(0.25, K.uzunluk(w) * 0.001);
        A.cik.push({ w, n: B, f: 1 - kayip }); B.gir.push(w);
      }
    }
    /* 1. Talep */
    const tamam = new Set(), yolda = new Set();
    const talep = n => {
      if (tamam.has(n.k)) return n.talep;
      if (yolda.has(n.k)) return 0;
      yolda.add(n.k);
      const b = n.b, alt = () => n.cik.reduce((t, c) => t + talep(c.n), 0);
      let t = 0;
      if (b.tuketim) t = b.tuketim + alt();
      else if (b.elektrik === 'salter') t = b.acik ? alt() : 0;
      else if (b.elektrik === 'dagitici' || b.elektrik === 'birlestirici') t = alt();
      else if (b.elektrik === 'batarya') { const e = d.enerji.get(n.k) || 0; t = e < b.kapasite - 0.5 ? BATARYA_HIZ[b.cihaz] : 0; }
      for (const c of n.cik) c.talep = talep(c.n);
      yolda.delete(n.k); tamam.add(n.k); n.talep = t;
      return t;
    };
    for (const n of D.values()) talep(n);
    /* 2. Güç akışı: bir düğüm, girişlerine bağlı bütün düğümler işlendikten sonra işlenir (üreticiler ve bataryalar önce) */
    const kalan = new Map();
    for (const n of D.values()) kalan.set(n.k, n.gir.filter(w => D.has(w.a)).length);
    const kuyruk = [...D.values()].filter(n => n.b.uretim || n.b.elektrik === 'batarya' || !kalan.get(n.k)), islendi = new Set();
    const gonder = (n, c, P) => {
      c.guc = P; n.giden += P;
      c.n.gelen += P * c.f;
      if (c.n.b.elektrik !== 'batarya' && !c.n.b.uretim) { const r = kalan.get(c.n.k) - 1; kalan.set(c.n.k, r); if (r <= 0 && !islendi.has(c.n.k)) kuyruk.push(c.n); }
    };
    const isle = n => {
      if (islendi.has(n.k)) return;
      islendi.add(n.k);
      const b = n.b;
      let P = 0;
      if (b.uretim) { const r = cihazUretim(d, b, n.x, n.y, n.z, O); n.uretim = r.u; n.neden = r.neden; P = r.u; }
      else if (b.elektrik === 'batarya') { const e = d.enerji.get(n.k) || 0, cik = n.cik.reduce((t, c) => t + c.talep, 0); P = Math.min(BATARYA_HIZ[b.cihaz], cik, e / dt); }
      else if (b.tuketim) { n.calisiyor = n.gelen >= b.tuketim * 0.95; P = n.calisiyor ? Math.max(0, n.gelen - b.tuketim) : 0; }   // kablo kaybı için %5 pay
      else if (b.elektrik === 'salter') P = b.acik ? n.gelen : 0;
      else P = n.gelen;   // dağıtıcı, birleştirici
      if (!n.cik.length) return;
      if (n.cik.length === 1) { gonder(n, n.cik[0], P); return; }
      /* Birden çok çıkış: talepleri oranında (talep yoksa eşit) bölünür */
      const top = n.cik.reduce((t, c) => t + c.talep, 0);
      for (const c of n.cik) gonder(n, c, top > 0 ? Math.min(c.talep, P * c.talep / top) : P / n.cik.length);
    };
    while (kuyruk.length) isle(kuyruk.shift());
    for (const n of D.values()) if (!islendi.has(n.k)) isle(n);   // döngüdeki düğümler
    /* 3. Bataryalar ve tüketici durumları */
    for (const n of D.values()) {
      const b = n.b;
      if (b.elektrik === 'batarya') {
        const e0 = d.enerji.get(n.k) || 0, sarj = Math.min(n.gelen, BATARYA_HIZ[b.cihaz]);
        const e = Math.max(0, Math.min(b.kapasite, e0 + (sarj - n.giden) * dt));
        d.enerji.set(n.k, e); n.depo = e; n.sarj = sarj;
        this.oranlar.set(n.k, Math.round(e / b.kapasite * 100) / 100);
      } else if (b.tuketim) {
        const c = !!n.calisiyor;
        if (!!b.acik !== c) d.blokKoy(n.x, n.y, n.z, b.taban + (c ? 1 : 0), 'elektrik');
      }
    }
    for (const k of this.oranlar.keys()) if (!D.has(k)) this.oranlar.delete(k);
    this.dugumler = D;
  }

  /* Yüklü cihazların toplamı (geliştirici penceresi için) */
  ozet() {
    let u = 0, t = 0, dp = 0, kap = 0, eksik = 0, n = 0;
    for (const x of this.dugumler.values()) {
      n++; u += x.uretim || 0;
      if (x.b.tuketim) { if (x.calisiyor) t += x.b.tuketim; else eksik++; }
      if (x.b.elektrik === 'batarya') { dp += x.depo || 0; kap += x.b.kapasite; }
    }
    return { cihaz: n, uretim: u, tuketim: t, depo: dp, kap, eksik };
  }
  /* Bakılan bloğun bilgisi (arayüz ve ağ isteği için); hesaplanmamışsa null */
  bilgi(k) {
    const [x, y, z] = C(k), b = BLOKLAR[this.dunya.blok(x, y, z)], n = this.dugumler.get(kokAnahtari(b, x, y, z));
    if (!n) return null;
    const v = { g: r1(n.gelen), c: r1(n.giden), t: r1(n.talep), u: r1(n.uretim || 0), on: n.calisiyor ? 1 : 0, gb: n.gir.length, cb: n.cik.length };
    if (n.neden) v.ne = n.neden;
    if (n.b.elektrik === 'batarya') { v.d = Math.round(n.depo || 0); v.sj = r1(n.sarj || 0); }
    return v;
  }
}
const r1 = n => Math.round(n * 10) / 10;

/* Bilgi panelinin metni: b blok tanımı, v bilgi() sonucu */
export function enerjiMetni(b, v) {
  const s = n => String(n).replace('.', ','), bin = n => Math.round(n).toLocaleString('tr-TR');
  if (!v) return { satirlar: ['Bilgi alınıyor…'], durum: '', oran: null };
  const l = [], P = portlar(b), gs = P.filter(p => p[0] === 'giris').length, cs = P.length - gs;
  const baglanti = `Bağlı: ${gs ? `giriş ${v.gb}/${gs}` : ''}${gs && cs ? ' · ' : ''}${cs ? `çıkış ${v.cb}/${cs}` : ''}`;
  let durum = '', oran = null;
  if (b.uretim) {
    l.push(`Üretim <b>${s(v.u)}</b> / ${b.uretim} E/sn` + (v.ne ? ` (${v.ne})` : ''));
    l.push(v.cb ? `Çıkıştan verilen <b>${s(v.c)}</b> E/sn (talep ${s(v.t || 0)})` : 'Çıkışa kablo bağlı değil.');
    durum = !v.cb ? 'bagsiz' : v.u <= 0 ? 'kapali' : v.c + 0.05 < v.u ? 'fazla' : 'calisiyor';
  } else if (b.elektrik === 'batarya') {
    l.push(`Depo <b>${bin(v.d || 0)}</b> / ${bin(b.kapasite)} E`);
    l.push(`Şarj <b>+${s(v.sj || 0)}</b> · Çıkış <b>${s(v.c)}</b> E/sn (en çok ${BATARYA_HIZ[b.cihaz]})`);
    oran = (v.d || 0) / b.kapasite;
    durum = v.sj > v.c + 0.05 ? 'sarj' : v.c > v.sj + 0.05 ? 'bosaliyor' : oran >= 0.995 ? 'dolu' : v.d <= 0 ? 'bos' : 'beklemede';
  } else if (b.tuketim) {
    l.push(`İhtiyaç <b>${s(b.tuketim)}</b> E/sn · Giriş <b>${s(v.g)}</b> E/sn`);
    if (v.cb) l.push(`Geçiş çıkışı <b>${s(v.c)}</b> E/sn`);
    durum = !v.gb ? 'bagsiz' : v.on ? 'calisiyor' : 'eksik';
  } else if (b.elektrik === 'salter') {
    l.push(`${b.acik ? 'Açık' : 'Kapalı'} · Giriş <b>${s(v.g)}</b> · Çıkış <b>${s(v.c)}</b> E/sn`);
    durum = b.acik ? (v.g > 0 ? 'calisiyor' : 'bagsiz') : 'kapali';
  } else {
    l.push(`Giriş <b>${s(v.g)}</b> · Çıkış <b>${s(v.c)}</b> E/sn · Talep ${s(v.t)}`);
    durum = v.g > 0 ? 'calisiyor' : 'bagsiz';
  }
  l.push(baglanti);
  return { satirlar: l, durum, oran };
}
export const DURUM_AD = { eksik: 'Enerji yetersiz', sarj: 'Şarj ediliyor', bosaliyor: 'Boşalıyor', dolu: 'Dolu', bos: 'Boş', beklemede: 'Beklemede', fazla: 'Fazla üretim',
  calisiyor: 'Çalışıyor', kapali: 'Kapalı', bagsiz: 'Bağlı değil' };
