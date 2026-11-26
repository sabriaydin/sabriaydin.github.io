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
import { BLOKLAR, ESYALAR, SIVI, LAV, KATI, EKIN_SONRAKI, SU_SEVIYE, BLOK53 } from '../bloklar.js';
import { DENIZ, diyarMi } from '../sabitler.js';
import { CIHAZ, cihazHucreleri, kokKonumu, pervaneHucreleri, dondurXZ, hucreYerel, PERVANE } from '../cihazlar.js';
import { portlar } from './kablolar.js';

const ADIM = 0.5;
const C = k => k.split(',').map(Number);
/* Bataryaların şarj ve çıkış hızı (E/sn) */
export const BATARYA_HIZ = { bataryaK: 10, bataryaO: 25, bataryaB: 60, konteyner: 250 };   // 0.53.0: konteyner
/* 0.28.0: jeneratör yakıtları: eşya -> yanma süresi (sn); 0.29.0: hazne kuralları oyun/kaplar.js'te */
import { YAKIT, PISIRME, PISIRME_SURE, OK_ESYALARI, DONUSUM, GIRDI_YUVA } from './kaplar.js';
export { YAKIT };
/* 0.53.0: mantık parçaları, paratoner ve matkabın çıkardığı cevherler */
const MANTIK53 = new Set(['zamanlayici', 'fotosel', 'mantik', 'role', 'engelleyici', 'edugme']);
export const PARATONER = { menzil: 48, yildirim: 5000, cikis: 150, statik: 2 };
const CEVHER = new Set(); for (const b of BLOKLAR) if (b && /Cevheri$/.test(b.ad || '') && !b.gizli) CEVHER.add(b.id);
const DUGME_SURE = 5, DUGME_ELEKTRIK = 3;
export const kokAnahtari = (b, x, y, z) => (b && b.cihaz && b.parca ? kokKonumu(b, x, y, z).join(',') : x + ',' + y + ',' + z);

/* Kök hücresi (x, y, z) olan üreticinin bu anki üretimi (E/sn) ve durmasının nedeni; çizici de dönüş hızı için kullanır.
   O: { gunIsigi, yogunluk, firtina, mevsim, sure } */
export function cihazUretim(d, b, x, y, z, O) {
  if (!b || !b.uretim || (diyarMi(x) && b.elektrik !== 'jeotermal')) return { u: 0, neden: '' };   // 0.53.0: jeotermal Diyar'da da çalışır
  const Cd = CIHAZ[b.cihaz];
  /* 0.53.0: Jeotermal Jeneratör: tabanın altına (3 blok) ve yanına değen lav blokları */
  if (b.elektrik === 'jeotermal') {
    const ic = new Set(), lav = new Set();
    for (const [hx, hy, hz] of cihazHucreleri(Cd, b.yon, x, y, z)) ic.add(hx + ',' + hy + ',' + hz);
    for (const [hx, hy, hz, i] of cihazHucreleri(Cd, b.yon, x, y, z)) {
      if (Math.floor(i / (Cd.w * Cd.d)) !== 0) continue;
      for (const [a, bb, c] of [[0, -1, 0], [0, -2, 0], [0, -3, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [1, -1, 0], [-1, -1, 0], [0, -1, 1], [0, -1, -1]]) {
        const k = (hx + a) + ',' + (hy + bb) + ',' + (hz + c);
        if (!ic.has(k) && LAV[d.blok(hx + a, hy + bb, hz + c)]) lav.add(k);
      }
    }
    if (!lav.size) return { u: 0, neden: 'lava değmiyor' };
    return { u: Math.min(b.uretim, lav.size * 15), neden: lav.size < 3 ? `${lav.size} lav bloğu` : '' };
  }
  /* 0.53.0: Güneş Takip Sistemi: üst sıranın üstü açık olmalıdır; panel güneşe döndüğü için gün boyu verimlidir */
  if (b.elektrik === 'takip') {
    let acik = 0, n = 0;
    for (const [hx, hy, hz, i] of cihazHucreleri(Cd, b.yon, x, y, z)) { if (hucreYerel(Cd, i)[1] !== Cd.h - 1) continue; n++; if (d.ustKati(hx, hz) <= hy) acik++; }
    if (!acik) return { u: 0, neden: 'üstü kapalı' };
    if (O.hava && O.hava.gok && O.zaman != null) return takipUretim(d, b, x, y, z, O, acik / n);   // 0.53.3: güneş yüksekliği, bulut, yağış, kar, rüzgâr koruması
    const gun = Math.min(1, Math.max(0, ((O.gunIsigi ?? 1) - 0.14) / 0.86));
    if (gun <= 0) return { u: 0, neden: 'gece' };
    return { u: b.uretim * (acik / n) * Math.pow(gun, 0.6) * (1 - 0.65 * Math.min(1, O.yogunluk || 0)), neden: acik < n ? 'kısmen gölgede' : '' };
  }
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
    if (O.hava && O.hava.ruzgar) return ruzgarUretim(d, b, x, y, z, O);   // 0.53.3: rüzgâr hızı, yükseklik, arazi ve hava durumu
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

/* ---------- 0.53.3: Rüzgâr Türbini ----------
   Rüzgâr hızı (m/sn) hava durumundan gelir (yerde 2-9; yağışta +3, fırtınada +12; esintili). Göbek yüksekliğindeki hız, zeminden yüksekliğe göre
   rüzgâr kesme yasasıyla artar (v = v10 · (h / 10)^α; α: su üstü 0,11, açık arazi 0,18, orman 0,28); yüksek tepelerde rüzgâr biraz daha güçlüdür.
   Çevredeki yüksek engeller (ağaç, bina) türbülans yaratır ve verimi düşürür. Güç eğrisi: 3 m/sn'de başlar, 12 m/sn'de tam güçtür (küp yasası);
   ortalama rüzgâr 25 m/sn'yi aşarsa türbin kendini korumak için durur (fırtına freni). */
export const TURBIN = { baslangic: 3, anma: 12, durma: 25 };
function ruzgarUretim(d, b, x, y, z, O) {
  const H = O.hava, [ox, oz] = dondurXZ(0.5, 0.5, b.yon), cx = x + 0.5 + ox, cz = z + 0.5 + oz, gob = y + PERVANE.y;
  /* çevre zemini ve arazi pürüzü (8 nokta, 7 blok uzakta) */
  let zemin = 0, su = 0, orman = 0;
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4, px = Math.floor(cx + Math.cos(a) * 7), pz = Math.floor(cz + Math.sin(a) * 7), u = d.ustKati(px, pz), q = BLOKLAR[d.blok(px, u, pz)];
    zemin += u; if (SIVI[d.blok(px, u + 1, pz)] || SIVI[d.blok(px, u, pz)]) su++; else if (q && /Yaprağı|Yaprak/.test(q.ad || '')) orman++;
  }
  zemin /= 8;
  const alfa = su >= 4 ? 0.11 : orman >= 3 ? 0.28 : 0.18, h = Math.max(2, gob - zemin);
  const kat = Math.pow(h / 10, alfa) * (1 + Math.min(0.35, Math.max(0, (gob - DENIZ - 15) / 150)));
  /* türbülans: göbek yüksekliğinde 4-9 blok çevredeki katı engeller */
  let engel = 0;
  for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; for (const r of [4, 6.5, 9]) if (KATI[d.blok(Math.floor(cx + Math.cos(a) * r), Math.floor(gob), Math.floor(cz + Math.sin(a) * r))]) { engel++; break; } }
  const verim = 1 - Math.min(0.6, engel * 0.05);
  const R = H.ruzgar(cx, cz), v = R.hiz * kat * verim, ort = R.ort * kat * verim, g = H.gok(cx, cz).ad, T = TURBIN;
  const ek = { ruzgar: v, gok: g, yukseklik: Math.round(h) };
  if (ort > T.durma) return { u: 0, neden: 'fırtına freni', ...ek };
  if (v < T.baslangic) return { u: 0, neden: 'rüzgâr zayıf', ...ek };
  const p = Math.min(1, (v ** 3 - T.baslangic ** 3) / (T.anma ** 3 - T.baslangic ** 3));
  return { u: b.uretim * p, neden: engel >= 4 ? 'çevredeki engeller rüzgârı kesiyor' : '', ...ek };
}
/* ---------- 0.53.3: Güneş Takip Sistemi ----------
   Doğrudan güneş ışınımı güneşin yüksekliğine bağlıdır (atmosferden geçiş: hava kütlesi); panel güneşe döndüğü için açı kaybı yoktur.
   Bulutlar ışığı azaltır (az bulutlu %90, parçalı %65, çok bulutlu %35 dolayı; geçen bulut gölgeleri anlık düşüş yapar), yağmurda %20, fırtınada %8'e iner;
   bulutlu havada saçılan (yaygın) ışık biraz destek olur. Kar yağarken panel karla örtülür. Rüzgâr 16 m/sn'yi aşınca panel kendini korumak için
   yatay konuma geçer (yalnız tepeden gelen ışığı alır). Kışın güneş daha zayıftır. */
export const TAKIP = { firtinaRuzgari: 16, mevsim: [1, 1.04, 0.9, 0.78] };
function takipUretim(d, b, x, y, z, O, acikOran) {
  const H = O.hava, cx = x + 1, cz = z + 1, a = O.zaman * Math.PI * 2, L = Math.hypot(Math.cos(a), Math.sin(a), 0.25), sinE = Math.sin(a) / L;
  const gk = H.gok(cx, cz), R = H.ruzgar(cx, cz), ek = { gok: gk.ad, ruzgar: R.ort, isinim: 0 };
  if (sinE <= 0.02) return { u: 0, neden: 'gece', ...ek };
  const am = Math.min(38, 1 / sinE), dni = 1353 * Math.pow(0.7, Math.pow(am, 0.678));
  let gecir = (1 - 0.72 * Math.pow(gk.bulut, 1.6)) * (1 - 0.6 * gk.golge);
  if (gk.yagis > 0.5) gecir = Math.min(gecir, 0.2);
  if (gk.firtina > 0.5) gecir = Math.min(gecir, 0.08);
  const kar = gk.yagis > 0.5 && H.turAl && H.turAl(cx, cz) === 2, yatay = R.ort > TAKIP.firtinaRuzgari;
  const yaygin = (40 + 110 * gk.bulut) * Math.sqrt(sinE) * (gk.firtina > 0.5 ? 0.5 : 1);
  const isinim = kar ? 15 : dni * gecir * (yatay ? sinE : 1) + yaygin;
  ek.isinim = Math.round(isinim); ek.yatay = yatay;
  const u = b.uretim * acikOran * Math.min(1, isinim / 1000) * TAKIP.mevsim[O.mevsim || 0];
  return { u, neden: kar ? 'panel karla örtülü' : yatay ? 'rüzgâr koruması: panel yatay' : acikOran < 1 ? 'kısmen gölgede' : '', ...ek };
}

export class Elektrik {
  constructor(o) {
    Object.assign(this, o);   // dunya, ortam(): { gunIsigi, yogunluk, firtina, mevsim, sure }, kablolar, kabloKoptu(w, nokta), canlilar(): [[x, y, z, 'o' | 'c' | 'h'], ...]
    this.sulamaSayac = 0;
    this.sayac = 0;
    this.dugumler = new Map();   // kök anahtarı -> son hesabın özeti
    this.oranlar = new Map();    // batarya kök anahtarı -> doluluk (0..1)
    /* 0.53.0: düğme ve sigorta sayaçları, makine süreleri, elektrikli çit hücreleri */
    this.sayaclar = new Map(); this.citler = new Set(); this.sesler = [];
    /* Kırılan bataryanın enerjisi silinir */
    this.dinle = (x, y, z, id, eski) => {
      const a = BLOKLAR[eski];
      if (a && a.elektrik === 'batarya' && !a.parca && id !== eski) { const k = x + ',' + y + ',' + z; this.dunya.enerji.delete(k); this.oranlar.delete(k); }
      /* 0.53.0: kaldırılan yeni cihazın kayıtları (paratoner deposu, kazan basıncı, matkap derinliği) silinir; durum değişimi (aynı cihaz) silmez */
      if (a && a.cihaz && !a.parca && CIHAZ[a.cihaz] && CIHAZ[a.cihaz].taban >= 3100 && !(BLOKLAR[id] && BLOKLAR[id].cihaz === a.cihaz && !BLOKLAR[id].parca)) {
        const k = x + ',' + y + ',' + z; for (const o of ['', 'y:', 'b:', 'm:', 'p:']) this.dunya.enerji.delete(o + k); this.oranlar.delete(k);
      }
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
      D.set(k, { k, x, y, z, b, P, cik: [], gir: [], gelen: 0, giden: 0, talep: 0, uretim: 0, pg: [] });
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
      const b = n.b, alt = () => n.cik.reduce((t, c) => t + talep(c.n) / c.f, 0);   // 0.53.0: kablo kaybı talebe eklenir (uzun zincirlerin sonu da beslenir)
      let t = 0;
      if (b.elektrik === 'algilayici') t = b.tuketim + (b.acik ? alt() : 0);   // 0.28.0: yalnızca algılarken geçirir
      else if (MANTIK53.has(b.elektrik)) { t = b.tuketim + (b.acik ? alt() : 0); if (b.elektrik === 'role' || b.elektrik === 'engelleyici') n.tp = [t, b.tuketim]; }   // 0.53.0: sinyal girişi yalnızca kendi ihtiyacını ister
      else if (b.elektrik === 'sigorta') t = b.atik ? 0 : alt();
      else if (b.elektrik === 'direk' || b.elektrik === 'olcer') t = alt();
      else if (b.tuketim) t = b.tuketim + alt();
      else if (b.elektrik === 'salter') t = b.acik ? alt() : 0;
      else if (b.elektrik === 'kol' || b.elektrik === 'dugme') t = this.gecir(n) ? alt() : 0;   // 0.53.1
      else if (b.elektrik === 'dagitici' || b.elektrik === 'birlestirici') t = alt();
      else if (b.elektrik === 'batarya') { const e = d.enerji.get(n.k) || 0; t = e < b.kapasite - 0.5 ? BATARYA_HIZ[b.cihaz] : 0; }
      for (const c of n.cik) { const t2 = talep(c.n); c.talep = (c.n.tp && c.n.tp[c.w.bp] != null ? c.n.tp[c.w.bp] : t2) / c.f; }
      yolda.delete(n.k); tamam.add(n.k); n.talep = t;
      return t;
    };
    for (const n of D.values()) talep(n);
    /* 2. Güç akışı: bir düğüm, girişlerine bağlı bütün düğümler işlendikten sonra işlenir (üreticiler ve bataryalar önce) */
    const kalan = new Map();
    for (const n of D.values()) kalan.set(n.k, n.gir.filter(w => D.has(w.a)).length);
    const kuyruk = [...D.values()].filter(n => n.b.uretim || n.b.elektrik === 'batarya' || n.b.elektrik === 'paratoner' || !kalan.get(n.k)), islendi = new Set();
    const gonder = (n, c, P) => {
      c.guc = P; n.giden += P;
      c.n.gelen += P * c.f; c.n.pg[c.w.bp] = (c.n.pg[c.w.bp] || 0) + P * c.f;   // 0.53.0: girişlere göre
      if (c.n.b.elektrik !== 'batarya' && !c.n.b.uretim) { const r = kalan.get(c.n.k) - 1; kalan.set(c.n.k, r); if (r <= 0 && !islendi.has(c.n.k)) kuyruk.push(c.n); }
    };
    const isle = n => {
      if (islendi.has(n.k)) return;
      islendi.add(n.k);
      const b = n.b;
      let P = 0;
      if (b.elektrik === 'jenerator') P = this.jenerator(n, dt);
      else if (b.elektrik === 'buhar') P = this.buhar(n, dt);   // 0.53.0
      else if (b.elektrik === 'paratoner') { const e = d.enerji.get(n.k) || 0, cik = n.cik.reduce((t, c) => t + c.talep, 0); P = Math.min(PARATONER.cikis, cik, e / dt); }
      else if (b.uretim) { const r = cihazUretim(d, b, n.x, n.y, n.z, O); n.uretim = r.u; n.neden = r.neden; n.ek = r; P = r.u; }
      else if (b.elektrik === 'batarya') { const e = d.enerji.get(n.k) || 0, cik = n.cik.reduce((t, c) => t + c.talep, 0); P = Math.min(BATARYA_HIZ[b.cihaz], cik, e / dt); }
      else if (b.elektrik === 'algilayici') { n.calisiyor = n.gelen >= b.tuketim * 0.95; P = n.calisiyor && b.acik ? Math.max(0, n.gelen - b.tuketim) : 0; }
      else if (MANTIK53.has(b.elektrik)) {   // 0.53.0: mantık parçaları (önceki adımdaki duruma göre geçirir)
        n.calisiyor = n.gelen >= b.tuketim * 0.95;
        const tek = b.elektrik === 'role' || b.elektrik === 'engelleyici';
        P = n.calisiyor && b.acik ? Math.max(0, (tek ? n.pg[0] || 0 : n.gelen) - b.tuketim) : 0;
      }
      else if (b.elektrik === 'sigorta') { P = b.atik ? 0 : n.gelen; n.asiri = !b.atik && n.gelen > b.sinir + 0.05; }
      else if (b.tuketim) { n.calisiyor = n.gelen >= b.tuketim * 0.95; P = n.calisiyor ? Math.max(0, n.gelen - b.tuketim) : 0; }   // kablo kaybı için %5 pay
      else if (b.elektrik === 'salter') P = b.acik ? n.gelen : 0;
      else if (b.elektrik === 'kol' || b.elektrik === 'dugme') P = this.gecir(n) ? n.gelen : 0;   // 0.53.1
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
      } else if (b.elektrik === 'algilayici') this.algila(n);
      else if (b.elektrik === 'paratoner') {   // 0.53.0: yıldırım deposu (fırtınada az da olsa kendiliğinden dolar)
        const e0 = d.enerji.get(n.k) || 0, e = Math.max(0, Math.min(b.kapasite, e0 - n.giden * dt + (O.firtina ? PARATONER.statik * dt : 0)));
        d.enerji.set(n.k, e); n.depo = e; this.oranlar.set(n.k, Math.round(e / b.kapasite * 100) / 100);
      }
      else if (MANTIK53.has(b.elektrik)) this.mantik(n, O, dt);
      else if (b.elektrik === 'sigorta') this.sigorta(n);
      else if (b.elektrik === 'olcer') this.oranlar.set(n.k, r1(n.gelen));
      else if (b.elektrik === 'dugme') { const k = 'dg:' + n.k; if (b.acik) this.sayaclar.set(k, DUGME_ELEKTRIK); else if (this.sayaclar.has(k)) { const t = this.sayaclar.get(k) - dt; if (t <= 0) this.sayaclar.delete(k); else this.sayaclar.set(k, t); } }
      else if (b.cihaz && b.tuketim) {
        this.oranlar.set(n.k, n.calisiyor ? 1 : 0);   // 0.28.0: çok bloklu tüketici (taret): durum 'bo' ile dağıtılır
        /* 0.53.0: durumlu cihazlar (kepenk, alarm, ark ocağı, sokak lambası) hücreleriyle açılır / kapanır; makineler işini yapar */
        if (b.cihaz === 'kepenk') this.kepenk(n);   // 0.53.1: güç varken elle açılıp kapanır
        else if (CIHAZ[b.cihaz].durum && !!b.acik !== !!n.calisiyor) this.durumDegis(n, n.calisiyor ? 1 : 0);
        if (DONUSUM[b.cihaz]) this.donustur(n, dt, DONUSUM[b.cihaz]);
        else if (b.cihaz === 'matkap') this.kaz(n, dt);
        else if (b.cihaz === 'pompa') this.pompala(n);
      }
      else if (b.tuketim) {
        const c = !!n.calisiyor;
        if (!!b.acik !== c) d.blokKoy(n.x, n.y, n.z, b.taban + (c ? 1 : 0), 'elektrik');
        if (b.elektrik === 'ocak') this.pisir(n, dt);   // 0.29.0
      } else if (b.elektrik === 'jenerator') {
        const c = n.uretim > 0;
        if (!!b.acik !== c) d.blokKoy(n.x, n.y, n.z, b.taban + (c ? 1 : 0), 'elektrik');
      }
    }
    for (const k of this.oranlar.keys()) if (!D.has(k)) this.oranlar.delete(k);
    for (const k of this.sayaclar.keys()) if (!D.has(k.slice(k.indexOf(':') + 1))) this.sayaclar.delete(k);
    this.dugumler = D;
    this.citleriBul(D);   // 0.53.0
    /* 0.28.0: çalışan fıskiyeler 2 saniyede bir sular */
    this.sulamaSayac -= dt;
    if (this.sulamaSayac <= 0) { this.sulamaSayac = 2; for (const n of D.values()) if (n.b.elektrik === 'fiskiye' && n.calisiyor) this.sula(n); }
  }

  /* ---------- 0.28.0: Yakıtlı Jeneratör ----------
     Çıkışına talep varken yakıt yakar: kömür 40, kütük 15, kalas 4, çubuk 1 saniye. Kalan yanma süresi 'y:' anahtarıyla saklanır. */
  jenerator(n, dt) {
    const d = this.dunya, b = n.b, talep = n.cik.reduce((t, c) => t + c.talep, 0), yk = 'y:' + n.k;
    let kalan = d.enerji.get(yk) || 0;
    n.yakit = kalan + this.yakitSuresi(d.sandiklar.get(n.k));
    if (talep <= 0) { n.uretim = 0; n.neden = n.yakit > 0 ? 'talep yok' : 'yakıt yok'; return 0; }
    if (kalan <= 0) {
      const l = d.sandiklar.get(n.k);
      if (l) for (let i = 0; i < l.length; i++) {
        const s = l[i], t = s && YAKIT[s.id];
        if (!t) continue;
        s.adet--; if (s.adet <= 0) l[i] = null;
        kalan = t; break;
      }
    }
    if (kalan <= 0) { d.enerji.delete(yk); n.uretim = 0; n.neden = 'yakıt yok'; return 0; }
    kalan -= dt; d.enerji.set(yk, Math.max(0, kalan));
    n.uretim = Math.min(b.uretim, talep); n.neden = '';
    return n.uretim;
  }
  /* ---------- 0.29.0: Elektrikli Ocak: çalışırken haznedeki ilk pişirilebilir malzemeyi 5 saniyede bir parti pişirir ----------
     İlerleme 'p:' anahtarıyla saklanır. Çok oyunculuda hazne bir oyuncuda açıkken beklenir (içerik kapanınca sunucuya döner). */
  pisir(n, dt) {
    const d = this.dunya, l = d.sandiklar.get(n.k), pk = 'p:' + n.k;
    n.pisen = null;
    if (!n.calisiyor || !l || (this.sandikKilitli && this.sandikKilitli(n.k))) { if (!n.calisiyor) d.enerji.delete(pk); return; }
    let i = -1, P = null;
    for (let j = 0; j < l.length; j++) {
      const s = l[j], q = s && PISIRME[s.id];
      if (!q || s.adet < q.n || s.buyu) continue;
      /* çıktının sığacağı yer: aynı eşyanın yığını, boş yuva ya da tükenecek girdi yuvası */
      if (!l.some((t, m) => !t || (t.id === q.cikti && t.dayanim == null && t.adet + q.adet <= 64) || (m === j && s.adet === q.n))) continue;
      i = j; P = q; break;
    }
    if (i < 0) { d.enerji.delete(pk); return; }
    n.pisen = l[i].id;
    let t = (d.enerji.get(pk) || 0) + dt;
    if (t >= PISIRME_SURE) {
      t = 0;
      const s = l[i]; s.adet -= P.n; if (s.adet <= 0) l[i] = null;
      let kalan = P.adet;
      for (const u of l) if (kalan && u && u.id === P.cikti && u.dayanim == null && !u.buyu && u.adet < 64) { const k = Math.min(kalan, 64 - u.adet); u.adet += k; kalan -= k; }
      for (let m = 0; m < l.length && kalan; m++) if (!l[m]) { l[m] = { id: P.cikti, adet: kalan }; kalan = 0; }
      if (this.sandikDegisti) this.sandikDegisti(n.k);
    }
    n.ilerleme = t / PISIRME_SURE;
    d.enerji.set(pk, t);
  }
  yakitSuresi(l) { let t = 0; if (l) for (const s of l) if (s && YAKIT[s.id]) t += YAKIT[s.id] * s.adet; return t; }

  /* ---------- 0.28.0: Hareket Algılayıcı: çalışırken 7 blok içindeki canlıları algılar (kip: herkes, oyuncular, canavarlar) ---------- */
  algila(n) {
    const b = n.b, d = this.dunya;
    let var_ = false;
    if (n.calisiyor && this.canlilar) {
      const cx = n.x + 0.5, cy = n.y + 0.5, cz = n.z + 0.5;
      for (const [x, y, z, t] of this.canlilar()) {
        if ((b.kip === 1 && t !== 'o') || (b.kip === 2 && t !== 'c')) continue;
        if ((x - cx) ** 2 + (y - cy) ** 2 + (z - cz) ** 2 < 49) { var_ = true; break; }
      }
    }
    n.algiliyor = var_;
    if (!!b.acik !== var_) d.blokKoy(n.x, n.y, n.z, b.taban + (var_ ? 1 : 0), 'elektrik');
  }

  /* ---------- 0.28.0: Sulama Fıskiyesi: 9 × 9 alandaki tarlalar ıslanır, ekinler daha hızlı büyür ---------- */
  sula(n) {
    const d = this.dunya;
    for (let dx = -4; dx <= 4; dx++) for (let dz = -4; dz <= 4; dz++) for (let dy = -2; dy <= 1; dy++) {
      const x = n.x + dx, y = n.y + dy, z = n.z + dz, id = d.blok(x, y, z);
      if (id === 137) d.blokKoy(x, y, z, 138, 'elektrik');   // kuru tarla -> ıslak tarla
      else if (EKIN_SONRAKI[id] && BLOKLAR[id] && BLOKLAR[id].ekin != null && Math.random() < 0.12) d.blokKoy(x, y, z, EKIN_SONRAKI[id], 'elektrik');
    }
  }

  /* ---------- 0.53.0: Buhar Jeneratörü ----------
     Talep varken ve kazanın yanında su varken yakıt yakar (jeneratörden %25 hızlı yakar ama üç kat güç verir). Basınç yanarken 10 saniyede dolar,
     yakıt bitince 20 saniyede düşer; üretim basınçla orantılıdır. Kalan yanma 'y:', basınç 'b:' anahtarıyla saklanır. */
  buhar(n, dt) {
    const d = this.dunya, b = n.b, talep = n.cik.reduce((t, c) => t + c.talep, 0), yk = 'y:' + n.k, bk = 'b:' + n.k;
    let kalan = d.enerji.get(yk) || 0, bas = d.enerji.get(bk) || 0;
    const su = this.kazanSuyu(n), l = d.sandiklar.get(n.k);
    n.yakit = kalan + this.yakitSuresi(l) * 0.75;
    let yanar = false;
    if (talep > 0 && su) {
      if (kalan <= 0 && l && !(this.sandikKilitli && this.sandikKilitli(n.k))) for (let i = 0; i < l.length; i++) {
        const q = l[i], t = q && YAKIT[q.id];
        if (!t) continue;
        q.adet--; if (q.adet <= 0) l[i] = null;
        kalan = t * 0.75; if (this.sandikDegisti) this.sandikDegisti(n.k); break;
      }
      if (kalan > 0) { kalan -= dt; yanar = true; }
    }
    bas = Math.max(0, Math.min(1, bas + (yanar ? dt / 10 : -dt / 20)));
    if (kalan > 0) d.enerji.set(yk, kalan); else d.enerji.delete(yk);
    if (bas > 0) d.enerji.set(bk, bas); else d.enerji.delete(bk);
    n.basinc = bas; n.yaniyor = yanar;
    n.uretim = talep > 0 ? Math.min(b.uretim * bas, talep) : 0;
    n.neden = !su ? 'kazanın yanında su yok' : talep <= 0 ? (n.yakit > 0 ? 'talep yok' : 'yakıt yok') : !yanar ? (bas > 0 ? 'yakıt bitti, basınç düşüyor' : 'yakıt yok') : bas < 1 ? 'basınç yükseliyor' : '';
    this.oranlar.set(n.k, Math.round(bas * 100) / 100 + (yanar ? 2 : 0));   // 0-1 basınç, +2: ateş yanıyor
    return n.uretim;
  }
  /* Kazanın (alt sıra) dışına bitişik su */
  kazanSuyu(n) {
    const d = this.dunya, C = CIHAZ[n.b.cihaz], H = cihazHucreleri(C, n.b.yon, n.x, n.y, n.z), ic = new Set(H.map(h => h[0] + ',' + h[1] + ',' + h[2]));
    for (const [hx, hy, hz, i] of H) {
      if (Math.floor(i / (C.w * C.d)) !== 0) continue;
      for (const [a, bb, c] of [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [0, -1, 0]]) {
        if (ic.has((hx + a) + ',' + (hy + bb) + ',' + (hz + c))) continue;
        const q = d.blok(hx + a, hy + bb, hz + c); if (SIVI[q] && !LAV[q]) return true;
      }
    }
    return false;
  }
  /* ---------- 0.53.0: mantık parçaları: önceki adımın girişlerine göre açık / kapalı (blok kimliği: taban + açık) ---------- */
  mantik(n, O, dt) {
    const b = n.b, d = this.dunya, A = (n.pg[0] || 0) > 0.05, B = (n.pg[1] || 0) > 0.05;
    let ac = false;
    if (!n.calisiyor) ac = false;
    else if (b.elektrik === 'zamanlayici') ac = Math.floor((O.sure || 0) / b.sure) % 2 === 0;
    else if (b.elektrik === 'fotosel') { const gece = (O.gunIsigi ?? 1) < 0.35; ac = b.kip ? !gece : gece; }
    else if (b.elektrik === 'mantik') ac = b.mantik === 've' ? A && B : b.mantik === 'veya' ? A || B : A !== B;
    else if (b.elektrik === 'role') ac = B;
    else if (b.elektrik === 'engelleyici') ac = !B;
    if (b.elektrik === 'edugme') {   // basılı düğme (açık hâl) 5 saniye sonra kalkar; güç beklemez
      if (!b.acik) { this.sayaclar.delete('d:' + n.k); return; }
      const t = (this.sayaclar.get('d:' + n.k) ?? DUGME_SURE) - dt;
      if (t <= 0) { this.sayaclar.delete('d:' + n.k); d.blokKoy(n.x, n.y, n.z, b.taban, 'elektrik'); } else this.sayaclar.set('d:' + n.k, t);
      return;
    }
    if (!!b.acik !== ac) d.blokKoy(n.x, n.y, n.z, b.taban + (ac ? 1 : 0), 'elektrik');
  }
  /* 0.53.1: Kol açıkken, Düğme basılıyken ve bırakıldıktan sonra 3 saniye gücü geçirir */
  gecir(n) { return n.b.elektrik === 'kol' ? !!n.b.acik : !!n.b.acik || (this.sayaclar.get('dg:' + n.k) || 0) > 0; }
  /* ---------- 0.53.0: Sigorta: sınırı 1 saniye aşan güç sigortayı attırır ---------- */
  sigorta(n) {
    const b = n.b, k = 's:' + n.k;
    if (b.atik || !n.asiri) { this.sayaclar.delete(k); return; }
    const t = (this.sayaclar.get(k) || 0) + 1;
    if (t < 2) { this.sayaclar.set(k, t); return; }
    this.sayaclar.delete(k);
    this.dunya.blokKoy(n.x, n.y, n.z, b.taban + 1, 'elektrik');
    this.sesler.push(['sigorta', n.x + 0.5, n.y + 0.5, n.z + 0.5]);
  }
  /* ---------- 0.53.0: durumlu cihazın bütün hücreleri açık / kapalı hâle geçer ----------
     Kepenk, içinde ya da altında bir oyuncu ya da canlı varken inmez. */
  durumDegis(n, a) {
    const d = this.dunya, b = n.b, C = CIHAZ[b.cihaz], H = cihazHucreleri(C, b.yon, n.x, n.y, n.z);
    if (!a && b.cihaz === 'kepenk' && this.canlilar) {
      for (const [x, y, z] of this.canlilar()) for (const [hx, hy, hz] of H) if (Math.abs(x - hx - 0.5) < 0.85 && Math.abs(z - hz - 0.5) < 0.85 && y > hy - 1 && y < hy + 1.6) return;
    }
    for (const [x, y, z, i] of H) { const q = BLOKLAR[d.blok(x, y, z)]; if (q && q.cihaz === b.cihaz) d.blokKoy(x, y, z, C.taban + ((a ? 4 : 0) + b.yon) * C.n + i, 'elektrik'); }
    if (b.cihaz === 'kepenk') this.sesler.push(['kepenk', n.x + 0.5, n.y + 1, n.z + 0.5, a]);
  }
  /* 0.53.1: Güvenlik Kepengi: güç geldiği anda açılır, güç kesilince iner; güç varken sağ tıkla kapı gibi açılıp kapanır (durum blokta saklanır) */
  kepenk(n) {
    const k = 'kp:' + n.k, c = n.calisiyor ? 1 : 0, once = this.sayaclar.get(k);
    this.sayaclar.set(k, c);
    if (!c && n.b.acik) this.durumDegis(n, 0);
    else if (c && once === 0 && !n.b.acik) this.durumDegis(n, 1);
  }
  /* ---------- 0.53.0: dönüştürücü makineler (çamaşır, ark ocağı, kereste, kırıcı) ----------
     Çalışırken ilk 9 yuvadaki girdilerden partiler işlenir; çıktılar sonraki yuvalara konur. İlerleme 'p:' anahtarıyla saklanır. */
  donustur(n, dt, D) {
    const d = this.dunya, pk = 'p:' + n.k;
    let l = d.sandiklar.get(n.k);
    n.pisen = null;
    if (!n.calisiyor || (this.sandikKilitli && this.sandikKilitli(n.k))) { if (!n.calisiyor) d.enerji.delete(pk); return; }
    if (!l) { l = new Array(27).fill(null); d.sandiklar.set(n.k, l); }
    const sigar = (L, id, adet) => { let k = adet; for (let m = GIRDI_YUVA; m < L.length && k > 0; m++) { const u = L[m]; if (!u) k -= 64; else if (u.id === id && u.dayanim == null && !u.buyu) k -= 64 - u.adet; } return k <= 0; };
    const sec = [];
    for (let j = 0; j < Math.min(GIRDI_YUVA, l.length) && sec.length < D.paralel; j++) {
      const s = l[j], q = s && D.tablo[s.id];
      if (!q || s.buyu) continue;
      let parti = Math.min(D.paralel - sec.length, Math.floor(s.adet / q.n));
      while (parti > 0) { sec.push([j, q]); parti--; }
    }
    const uygun = sec.filter(([, q]) => sigar(l, q.cikti, q.adet));
    if (!uygun.length) { d.enerji.delete(pk); n.neden = sec.length ? 'çıktı yuvaları dolu' : ''; return; }
    n.pisen = l[uygun[0][0]].id;
    let t = (d.enerji.get(pk) || 0) + dt;
    if (t >= D.sure) {
      t = 0;
      for (const [j, q] of uygun) {
        const s = l[j]; if (!s || s.adet < q.n || !sigar(l, q.cikti, q.adet)) continue;
        s.adet -= q.n; if (s.adet <= 0) l[j] = null;
        let kalan = q.adet;
        for (let m = GIRDI_YUVA; m < l.length && kalan; m++) { const u = l[m]; if (u && u.id === q.cikti && u.dayanim == null && !u.buyu && u.adet < 64) { const k = Math.min(kalan, 64 - u.adet); u.adet += k; kalan -= k; } }
        for (let m = GIRDI_YUVA; m < l.length && kalan; m++) if (!l[m]) { l[m] = { id: q.cikti, adet: Math.min(64, kalan) }; kalan -= Math.min(64, kalan); }
      }
      if (this.sandikDegisti) this.sandikDegisti(n.k);
    }
    n.ilerleme = t / D.sure;
    d.enerji.set(pk, t);
  }
  /* ---------- 0.53.0: Maden Matkabı ----------
     Saniyede bir, ortadaki kuyunun bir sonraki bloğunu kazar ve aynı kattaki 2 blok çevresindeki cevherleri çıkarır. Derinlik 'm:' anahtarında saklanır.
     Durum 'bo' ile dağıtılır: derinlik * 2 + çalışıyor. */
  kaz(n, dt) {
    const d = this.dunya, b = n.b, mk = 'm:' + n.k, [ox, oz] = dondurXZ(1, 1, b.yon), cx = n.x + ox, cz = n.z + oz;
    let der = d.enerji.get(mk) || 0;
    const bildir = on => { n.derin = der; this.oranlar.set(n.k, der * 2 + (on ? 1 : 0)); };
    if (!n.calisiyor) { bildir(false); return; }
    let l = d.sandiklar.get(n.k);
    if (!l) { l = new Array(27).fill(null); d.sandiklar.set(n.k, l); }
    if (this.sandikKilitli && this.sandikKilitli(n.k)) { bildir(false); return; }
    const y = n.y - 1 - der;
    if (y < 1) { n.neden = 'ana kayaya ulaşıldı'; bildir(false); return; }
    if (!d.yuklu(cx, cz)) { bildir(false); return; }
    const id = d.blok(cx, y, cz), q = BLOKLAR[id];
    if (SIVI[id]) { n.neden = LAV[id] ? 'lava ulaşıldı (pompa ile boşaltılabilir)' : 'suya ulaşıldı (pompa ile boşaltılabilir)'; bildir(false); return; }
    if (id && (!q || q.sertlik < 0 || q.cihaz || q.sandik || q.hazne || q.firinKap || q.elektrik)) { n.neden = id === 1 || (q && q.sertlik < 0) ? 'ana kayaya ulaşıldı' : `${q ? q.ad : 'blok'} kazılamaz`; bildir(false); return; }
    const t = (this.sayaclar.get('k:' + n.k) || 0) + dt;
    if (t < 1) { this.sayaclar.set('k:' + n.k, t); n.neden = ''; bildir(true); return; }
    this.sayaclar.set('k:' + n.k, 0);
    /* kazılacaklar ve düşenleri */
    const hedef = id ? [[cx, y, cz, id]] : [];
    for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) { if (!dx && !dz) continue; const w = d.blok(cx + dx, y, cz + dz); if (CEVHER.has(w)) hedef.push([cx + dx, y, cz + dz, w]); }
    const dus = [];
    for (const [, , , w] of hedef) { const B = BLOKLAR[w]; for (const [e, a] of (B.dusur ? B.dusur(Math.random) : [[w, 1]])) if (e && a > 0) dus.push([e, a]); }
    /* hepsi sığmazsa kazılmaz */
    const kopya = l.map(s => (s ? { ...s } : null));
    for (const [e, a] of dus) {
      let k = a;
      for (const u of kopya) if (k && u && u.id === e && u.dayanim == null && !u.buyu && u.adet < 64) { const m = Math.min(k, 64 - u.adet); u.adet += m; k -= m; }
      for (let i = 0; i < kopya.length && k; i++) if (!kopya[i]) { kopya[i] = { id: e, adet: Math.min(64, k) }; k -= Math.min(64, k); }
      if (k) { n.neden = 'hazne dolu'; bildir(false); return; }
    }
    for (let i = 0; i < l.length; i++) l[i] = kopya[i];
    for (const [x, yy, z] of hedef) d.blokKoy(x, yy, z, 0, 'elektrik');
    der++; d.enerji.set(mk, der); n.neden = '';
    if (dus.length && this.sandikDegisti) this.sandikDegisti(n.k);
    this.sesler.push(['matkap', cx + 0.5, y + 0.5, cz + 0.5]);
    bildir(true);
  }
  /* ---------- 0.53.0: Sıvı Pompası: en yakın kaynak sıvı bloğunu (yoksa akan sıvıyı) boşaltır ---------- */
  pompala(n) {
    const d = this.dunya, C = CIHAZ.pompa, ic = new Set(cihazHucreleri(C, n.b.yon, n.x, n.y, n.z).map(h => h[0] + ',' + h[1] + ',' + h[2]));
    let en = null, enD = Infinity, akan = null, akanD = Infinity;
    for (let dy = 0; dy <= 8; dy++) for (let dx = -4; dx <= 4; dx++) for (let dz = -4; dz <= 4; dz++) {
      const x = n.x + dx, y = n.y - dy, z = n.z + dz;
      if (y < 1 || dx * dx + dz * dz > 18 || ic.has(x + ',' + y + ',' + z)) continue;
      const q = d.blok(x, y, z); if (!SIVI[q]) continue;
      const u = dx * dx + dz * dz + dy * dy * 0.5;
      if (LAV[q] || SU_SEVIYE[q] === 8) { if (u < enD) { enD = u; en = [x, y, z]; } } else if (u < akanD) { akanD = u; akan = [x, y, z]; }
    }
    const h = en || akan;
    n.neden = h ? '' : 'çevrede sıvı yok';
    if (!h) return;
    d.blokKoy(h[0], h[1], h[2], 0, 'elektrik');
    n.bosaltilan = (n.bosaltilan || 0) + 1;
    this.sayaclar.set('b:' + n.k, (this.sayaclar.get('b:' + n.k) || 0) + 1);
  }
  /* ---------- 0.53.0: Elektrikli çit hatları: çalışan ünitelere bitişik çit blokları (her ünite için en çok 128) ---------- */
  citleriBul(D) {
    const d = this.dunya, S = new Set();
    for (const n of D.values()) {
      if (n.b.elektrik !== 'citunite' || !n.calisiyor) continue;
      const kuyruk = [[n.x, n.y, n.z]]; let say = 0;
      while (kuyruk.length && say < 128) {
        const [x, y, z] = kuyruk.shift();
        for (const [a, bb, c] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) {
          const k = (x + a) + ',' + (y + bb) + ',' + (z + c);
          if (S.has(k) || d.blok(x + a, y + bb, z + c) !== BLOK53.ecit) continue;
          S.add(k); say++; kuyruk.push([x + a, y + bb, z + c]);
        }
      }
    }
    this.citler = S;
  }
  /* ---------- 0.53.0: Paratoner: fırtınada düşen yıldırım 48 blok içindeki en yakın paratonerin ucuna yönelir ve deposuna enerji ekler ----------
     Dönen: yıldırımın yeni konumu ya da null */
  paratonerCek(x, y, z) {
    const d = this.dunya;
    let en = null, enD = PARATONER.menzil * PARATONER.menzil;
    for (const [k, [ax, ay, az]] of d.elektrikler) {
      const b = BLOKLAR[d.blok(ax, ay, az)];
      if (!b || b.cihaz !== 'paratoner' || b.parca) continue;
      const u = (ax + 0.5 - x) ** 2 + (az + 0.5 - z) ** 2;
      if (u < enD) { enD = u; en = [k, ax, ay, az, b]; }
    }
    if (!en) return null;
    const [k, ax, ay, az, b] = en;
    d.enerji.set(k, Math.min(b.kapasite, (d.enerji.get(k) || 0) + PARATONER.yildirim));
    this.oranlar.set(k, Math.round((d.enerji.get(k) / b.kapasite) * 100) / 100);
    return [ax + 0.5, ay + CIHAZ.paratoner.h + 0.1, az + 0.5];
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
    if (n.b.elektrik === 'jenerator') v.yk = Math.round(n.yakit || 0);
    if (n.b.elektrik === 'algilayici') v.al = n.algiliyor ? 1 : 0;
    if (n.b.elektrik === 'ocak') { if (n.pisen) { v.ps = n.pisen; v.pi = Math.round((n.ilerleme || 0) * 100); } }   // 0.29.0
    /* 0.53.0 */
    if (n.b.elektrik === 'buhar') { v.yk = Math.round(n.yakit || 0); v.bs = Math.round((n.basinc || 0) * 100); }
    if (n.b.elektrik === 'paratoner') v.d = Math.round(n.depo || 0);
    if (n.ek && n.ek.ruzgar != null) { v.rz = r1(n.ek.ruzgar); v.gk = n.ek.gok; if (n.ek.yukseklik != null) v.yk2 = n.ek.yukseklik; if (n.ek.isinim != null) v.is = n.ek.isinim; }   // 0.53.3
    if (MANTIK53.has(n.b.elektrik) || n.b.elektrik === 'sigorta') { v.a = r1(n.pg[0] || 0); v.b = r1(n.pg[1] || 0); }
    if (DONUSUM[n.b.cihaz] && n.pisen) { v.ps = n.pisen; v.pi = Math.round((n.ilerleme || 0) * 100); }
    if (n.b.cihaz === 'matkap') v.dr = n.derin || 0;
    if (n.b.cihaz === 'pompa') v.bo = this.sayaclar.get('b:' + n.k) || 0;
    if (n.b.cihaz === 'taret') { let ok = 0; for (const s of this.dunya.sandiklar.get(n.k) || []) if (s && OK_ESYALARI.has(s.id)) ok += s.adet; v.ok = ok; }
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
  if (b.elektrik === 'jenerator') {
    l.push(`Üretim <b>${s(v.u)}</b> / ${b.uretim} E/sn` + (v.ne ? ` (${v.ne})` : ''));
    l.push(`Yakıt: ${v.yk > 0 ? `yaklaşık <b>${v.yk >= 90 ? Math.round(v.yk / 60) + ' dk' : v.yk + ' sn'}</b>` : '<b>yok</b> (sağ tık: yakıt deposu)'}`);
    if (!v.cb) l.push('Çıkışa kablo bağlı değil.');
    durum = !v.cb ? 'bagsiz' : v.u > 0 ? 'calisiyor' : v.yk > 0 ? 'beklemede' : 'eksik';
  } else if (b.elektrik === 'buhar') {   // 0.53.0
    l.push(`Üretim <b>${s(v.u)}</b> / ${b.uretim} E/sn` + (v.ne ? ` (${v.ne})` : ''));
    l.push(`Basınç <b>%${v.bs || 0}</b> · Yakıt: ${v.yk > 0 ? `yaklaşık <b>${v.yk >= 90 ? Math.round(v.yk / 60) + ' dk' : v.yk + ' sn'}</b>` : '<b>yok</b> (sağ tık: yakıt deposu)'}`);
    if (!v.cb) l.push('Çıkışa kablo bağlı değil.');
    durum = !v.cb ? 'bagsiz' : v.u > 0 ? 'calisiyor' : v.yk > 0 ? 'beklemede' : 'eksik';
  } else if (b.elektrik === 'paratoner') {
    l.push(`Depo <b>${bin(v.d || 0)}</b> / ${bin(b.kapasite)} E · Çıkış <b>${s(v.c)}</b> E/sn (en çok 150)`);
    l.push('Fırtınada 48 blok içindeki yıldırımları çeker (her biri 5.000 E).');
    oran = (v.d || 0) / b.kapasite;
    durum = !v.cb ? 'bagsiz' : v.c > 0.05 ? 'bosaliyor' : v.d > 0 ? 'beklemede' : 'bos';
  } else if (MANTIK53.has(b.elektrik)) {
    const ek = b.elektrik === 'zamanlayici' ? ` · süre <b>${b.sure} sn</b>` : b.elektrik === 'fotosel' ? ` · kip <b>${b.kip ? 'gündüz' : 'gece'}</b>` : '';
    l.push(`<b>${b.acik ? 'Açık' : 'Kapalı'}</b>${ek} · Giriş <b>${s(v.g)}</b> · Çıkış <b>${s(v.c)}</b> E/sn`);
    if (P.filter(p => p[0] === 'giris').length > 1) l.push(`${b.elektrik === 'mantik' ? 'A' : 'Güç'} <b>${s(v.a || 0)}</b> · ${b.elektrik === 'mantik' ? 'B' : 'Sinyal'} <b>${s(v.b || 0)}</b> E/sn`);
    durum = !v.gb ? 'bagsiz' : !v.on ? 'eksik' : b.acik ? 'calisiyor' : 'beklemede';
  } else if (b.elektrik === 'sigorta') {
    l.push(`Sınır <b>${b.sinir}</b> E/sn · Geçen <b>${s(v.c)}</b> E/sn`);
    l.push(b.atik ? '<b>Sigorta attı</b>: sağ tıkla yeniden kurunuz (önce yükü azaltınız).' : 'Sağ tık: sınırı değiştir.');
    durum = b.atik ? 'kapali' : v.g > 0 ? 'calisiyor' : 'bagsiz';
  } else if (b.elektrik === 'algilayici') {
    l.push(`Kip: <b>${['herkes', 'oyuncular', 'canavarlar'][b.kip]}</b> · ${v.al ? '<b>canlı algılandı</b>' : 'algılanan yok'}`);
    l.push(`Giriş <b>${s(v.g)}</b> · Çıkış <b>${s(v.c)}</b> E/sn (kendi ihtiyacı 0,5)`);
    durum = !v.gb ? 'bagsiz' : !v.on ? 'eksik' : v.al ? 'calisiyor' : 'beklemede';
  } else if (b.uretim) {
    l.push(`Üretim <b>${s(v.u)}</b> / ${b.uretim} E/sn` + (v.ne ? ` (${v.ne})` : ''));
    /* 0.53.3: rüzgâr ve güneş verileri */
    if (b.elektrik === 'ruzgar' && v.rz != null) l.push(`Rüzgâr <b>${s(v.rz)}</b> m/sn (göbek, zeminden ${v.yk2} m) · ${v.gk}`);
    if (b.elektrik === 'takip' && v.is != null) l.push(`Güneş ışınımı <b>${v.is}</b> W/m² · ${v.gk} · rüzgâr ${s(v.rz)} m/sn`);
    l.push(v.cb ? `Çıkıştan verilen <b>${s(v.c)}</b> E/sn (talep ${s(v.t || 0)})` : 'Çıkışa kablo bağlı değil.');
    durum = !v.cb ? 'bagsiz' : v.u <= 0 ? 'kapali' : v.c + 0.05 < v.u ? 'fazla' : 'calisiyor';
  } else if (b.elektrik === 'batarya') {
    l.push(`Depo <b>${bin(v.d || 0)}</b> / ${bin(b.kapasite)} E`);
    l.push(`Şarj <b>+${s(v.sj || 0)}</b> · Çıkış <b>${s(v.c)}</b> E/sn (en çok ${BATARYA_HIZ[b.cihaz]})`);
    oran = (v.d || 0) / b.kapasite;
    durum = v.sj > v.c + 0.05 ? 'sarj' : v.c > v.sj + 0.05 ? 'bosaliyor' : oran >= 0.995 ? 'dolu' : v.d <= 0 ? 'bos' : 'beklemede';
  } else if (b.tuketim) {
    l.push(`İhtiyaç <b>${s(b.tuketim)}</b> E/sn · Giriş <b>${s(v.g)}</b> E/sn`);
    if (b.elektrik === 'ocak') l.push(v.ps ? `Pişiyor: <b>${ESYALAR[v.ps] ? ESYALAR[v.ps].ad : '?'}</b> %${v.pi || 0}` : 'Haznede pişecek malzeme yok (sağ tık: hazne)');   // 0.29.0
    if (b.cihaz === 'taret') l.push(`Ok: <b>${v.ok || 0}</b>${v.ok ? '' : ' (sağ tık: ok haznesi)'}`);
    if (DONUSUM[b.cihaz]) l.push(v.ps ? `İşleniyor: <b>${ESYALAR[v.ps] ? ESYALAR[v.ps].ad : '?'}</b> %${v.pi || 0}` : (v.ne ? `<b>${v.ne}</b>` : 'Girdi yok (sağ tık: hazne)'));   // 0.53.0
    if (b.cihaz === 'matkap') l.push(`Derinlik <b>${v.dr || 0}</b> blok${v.ne ? ` · <b>${v.ne}</b>` : ''}`);
    if (b.cihaz === 'pompa') l.push(`Boşaltılan <b>${v.bo || 0}</b> blok${v.ne ? ` · ${v.ne}` : ''}`);
    if (v.cb) l.push(`Geçiş çıkışı <b>${s(v.c)}</b> E/sn`);
    durum = !v.gb ? 'bagsiz' : v.on ? 'calisiyor' : 'eksik';
  } else if (b.elektrik === 'salter' || b.elektrik === 'kol' || b.elektrik === 'dugme') {   // 0.53.1: kol ve düğme
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
