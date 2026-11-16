/* HungerMan - mekanik bloklar (0.17.0)
   Kaynaklar: Kol (açık), Düğme (basılınca 1 saniye), Basınç Plakası (üstünde oyuncu ya da canlı varken), Işık Algılayıcı (gündüz),
   Ters Çevirici (arkasından güç gelmezse önüne güç verir; arka arkaya ikisi geciktirici, kendine bağlanınca saat olur).
   Bakır Tel gücü 15 bloğa kadar taşır; yanlara, bir blok yukarı ve aşağı basamaklanır.
   Güç alan bloklar: kaynağın ve telin altındaki katı blok; ters çeviricinin önündeki blok.
   Tüketiciler (bir güç verene bitişik olunca): Bakır Lamba yanar, kapı / çit kapısı / tuzak kapı açılır, Ok Atıcı ok atar,
   Müzik Kutusu ezgi çalar (altındaki bloğa göre). Kapılar yalnızca güç durumu değişince açılır / kapanır; elle de kullanılabilir.
   Hesap tek oyunculuda ve sunucuda 0,1 saniyelik adımlarla yapılır; blok değişiklikleri ağla dağıtılır. */
import { THREE } from '../grafik/sahne.js';
import { BLOKLAR, KATI, OPAK } from '../bloklar.js';

const YAN6 = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const YATAY = [[0, -1], [1, 0], [0, 1], [-1, 0]];   // yön: 0 kuzey, 1 doğu, 2 güney, 3 batı
const A = (x, y, z) => x + ',' + y + ',' + z;
const C = k => k.split(',').map(Number);
const KAYNAK_TUR = { kol: 1, dugme: 1, plaka: 1, algi: 1 };
const ADIM = 0.1;
const GECIK = 523;   // 0.20.0: Geciktirici: 523 + yön * 8 + gecikme * 2 + açık

/* Müzik kutusunun çaldığı ezgi, altındaki bloğa göre: 0 piyano, 1 bas, 2 zil, 3 flüt, 4 davul */
export function ezgiTuru(id) {
  const b = BLOKLAR[id];
  if (!b) return 0;
  if ([34, 22, 109, 185, 186, 188, 196].includes(id)) return 2;
  if (b.ses === 'yun' || (id >= 114 && id <= 120) || id === 49) return 3;
  if ([5, 6, 23, 3].includes(id)) return 4;
  if (b.ses === 'tas') return 1;
  return 0;
}

export class Mekanik {
  constructor(o) {
    Object.assign(this, o);   // dunya, varliklar, ses, konumlar(): oyuncu ayak konumları, gunIsigi(), yerel(): yerel oyuncu konumu
    this.kirli = true; this.saat = false; this.sayac = 0; this.algiSayac = 0; this.sonBoyut = -1;
    this.dugmeler = new Map();     // basılı düğme -> kalan süre
    this.gecikmeler = new Map();   // 0.20.0: geciktirici -> { hedef, kalan }
    this.tuketici = new Map();     // güç alan tüketiciler -> true
    this.dinle = (x, y, z, id, eski, kaynak) => { if (kaynak !== 'mekanik' && (this.ilgili(id) || this.ilgili(eski) || this.yakinda(x, y, z))) this.kirli = true; };
    this.dunya.dinleyiciler.push(this.dinle);
  }
  kapat() { const i = this.dunya.dinleyiciler.indexOf(this.dinle); if (i >= 0) this.dunya.dinleyiciler.splice(i, 1); }
  ilgili(id) { const b = BLOKLAR[id]; return !!(b && (b.mekanik || b.sekil === 'kapi' || b.sekil === 'citKapi' || b.sekil === 'tuzak' || id === 157)); }
  yakinda(x, y, z) { for (const [a, b, c] of YAN6) { const n = BLOKLAR[this.dunya.blok(x + a, y + b, z + c)]; if (n && n.mekanik) return true; } return false; }
  koy(x, y, z, id) { this.dunya.blokKoy(x, y, z, id, 'mekanik'); }
  katiOpak(x, y, z) { const id = this.dunya.blok(x, y, z); return !!(KATI[id] && OPAK[id]); }
  sesYakin(x, y, z, r = 16) { const p = this.yerel && this.yerel(); return p && (p.x - x - 0.5) ** 2 + (p.y - y) ** 2 + (p.z - z - 0.5) ** 2 < r * r; }

  guncelle(dt) {
    const M = this.dunya.mekanikler;
    if (!M.size && !this.tuketici.size) return;
    this.sayac -= dt;
    if (this.sayac > 0) return;
    this.sayac = ADIM;
    if (M.size !== this.sonBoyut) { this.sonBoyut = M.size; this.kirli = true; }   // yeni parça yüklendi ya da blok eklendi
    this.girdiler();
    if (!this.kirli && !this.saat) return;
    this.kirli = false; this.saat = false;
    this.hesapla();
  }

  /* Düğme süresi, basınç plakaları ve ışık algılayıcıları */
  girdiler() {
    const d = this.dunya, M = d.mekanikler;
    this.algiSayac -= ADIM;
    const algi = this.algiSayac <= 0;
    if (algi) this.algiSayac = 1;
    let ayaklar = null;
    for (const [k, [x, y, z]] of M) {
      const id = d.blok(x, y, z), b = BLOKLAR[id];
      if (!b || !b.mekanik) continue;
      if (b.mekanik === 'dugme') {
        if (!b.acik) { this.dugmeler.delete(k); continue; }
        const t = (this.dugmeler.has(k) ? this.dugmeler.get(k) : 1) - ADIM;
        if (t <= 0) { this.dugmeler.delete(k); this.koy(x, y, z, 235); this.kirli = true; if (this.sesYakin(x, y, z)) this.ses.dugme(); }
        else this.dugmeler.set(k, t);
      } else if (b.mekanik === 'plaka') {
        if (!ayaklar) {
          ayaklar = [...this.konumlar()];
          for (const v of this.varliklar.liste) if (!v.olu && !v.tur.ucar && !v.tur.su) ayaklar.push(v.konum);
        }
        const bas = ayaklar.some(p => p.x >= x - 0.1 && p.x <= x + 1.1 && p.z >= z - 0.1 && p.z <= z + 1.1 && p.y >= y - 0.2 && p.y < y + 0.6);
        if (bas !== !!b.acik) { this.koy(x, y, z, bas ? 238 : 237); this.kirli = true; if (this.sesYakin(x, y, z)) this.ses.kol(bas); }
      } else if (b.mekanik === 'algi' && algi) {
        const gun = this.gunIsigi() > 0.45 && d.ustKati(x, z) <= y;
        if (gun !== !!b.acik) { this.koy(x, y, z, gun ? 253 : 252); this.kirli = true; }
      }
    }
  }

  hesapla() {
    const d = this.dunya, M = d.mekanikler;
    const kaynak = new Set(), teller = new Set(), ters = [], lambalar = [];
    for (const [k, [x, y, z]] of M) {
      const b = BLOKLAR[d.blok(x, y, z)];
      if (!b || !b.mekanik) { M.delete(k); continue; }
      if (b.mekanik === 'tel') teller.add(k);
      else if (b.mekanik === 'ters' || b.mekanik === 'gecik') ters.push([x, y, z, b.yon, b.acik, b.mekanik === 'gecik' ? b.gecikme : -1, k]);
      else if (b.mekanik === 'lamba') lambalar.push([k, x, y, z, b.acik]);
      else if (KAYNAK_TUR[b.mekanik] && b.acik) kaynak.add(k);
    }
    /* Güç alan katı bloklar: kaynakların altı; ters çeviricilerin önü */
    const guclu = new Set(), cikis = new Map();
    for (const k of kaynak) { const [x, y, z] = C(k); if (this.katiOpak(x, y - 1, z)) guclu.add(A(x, y - 1, z)); }
    for (const [x, y, z, yon, acik] of ters) if (acik) { const [a, c] = YATAY[yon]; cikis.set(A(x + a, y, z + c), [a, 0, c]); if (this.katiOpak(x + a, y, z + c)) guclu.add(A(x + a, y, z + c)); }
    /* Bakır tel: en çok 15 blok */
    const guc = new Map(), kuyruk = [];
    const tohum = (k, n) => { if (teller.has(k) && !((guc.get(k) || 0) >= n)) { guc.set(k, n); kuyruk.push(k); } };
    for (const k of kaynak) { const [x, y, z] = C(k); for (const [a, b, c] of YAN6) tohum(A(x + a, y + b, z + c), 15); }
    for (const k of cikis.keys()) tohum(k, 15);
    for (const k of guclu) { const [x, y, z] = C(k); for (const [a, b, c] of YAN6) tohum(A(x + a, y + b, z + c), 15); }
    while (kuyruk.length) {
      const k = kuyruk.shift(), n = guc.get(k);
      if (n <= 1) continue;
      const [x, y, z] = C(k), ustAcik = !this.katiOpak(x, y + 1, z);
      for (const [a, c] of YATAY) {
        tohum(A(x + a, y, z + c), n - 1);
        if (ustAcik) tohum(A(x + a, y + 1, z + c), n - 1);
        if (!this.katiOpak(x + a, y, z + c)) tohum(A(x + a, y - 1, z + c), n - 1);
      }
    }
    /* Telin altındaki katı blok da güç alır (zayıf: başka tele geçirmez) */
    const zayif = new Set();
    for (const k of guc.keys()) { const [x, y, z] = C(k); if (this.katiOpak(x, y - 1, z)) zayif.add(A(x, y - 1, z)); }
    const gucVar = k => kaynak.has(k) || guc.has(k) || guclu.has(k) || zayif.has(k);

    /* Tüketiciler: güç verenlere bitişik olanlar; değer: güç veren yönden tüketiciye doğru birim yön */
    const adaylar = new Map();
    const ekle = (x, y, z, yon) => {
      const id = d.blok(x, y, z), b = BLOKLAR[id];
      if (!b || !(b.sekil === 'kapi' || b.sekil === 'citKapi' || b.sekil === 'tuzak' || b.mekanik === 'lamba' || b.mekanik === 'muzik' || id === 157)) return;
      const yy = b.sekil === 'kapi' && b.ust ? y - 1 : y;
      const k = A(x, yy, z);
      if (!adaylar.has(k)) adaylar.set(k, [x, yy, z, yon]);
    };
    for (const k of [...kaynak, ...guc.keys(), ...guclu, ...zayif]) { const [x, y, z] = C(k); for (const [a, b, c] of YAN6) ekle(x + a, y + b, z + c, [a, b, c]); }
    for (const [k, yon] of cikis) { const [x, y, z] = C(k); ekle(x, y, z, yon); }

    /* Telleri güncelle */
    for (const k of teller) { const [x, y, z] = C(k), ist = guc.has(k) ? 240 : 239; if (d.blok(x, y, z) !== ist) this.koy(x, y, z, ist); }
    /* Tüketiciler: yalnızca güç durumu değişince işlem yapılır */
    for (const [k, [x, y, z, yon]] of adaylar) if (!this.tuketici.has(k)) { this.tuketici.set(k, true); this.tuket(x, y, z, true, yon); }
    for (const k of [...this.tuketici.keys()]) {
      if (adaylar.has(k)) continue;
      const [x, y, z] = C(k);
      if (!d.yuklu(x, z)) { this.tuketici.delete(k); continue; }
      this.tuketici.delete(k); this.tuket(x, y, z, false);
    }
    /* Lambalar her hesapta güç durumuna eşitlenir (yüklenen parçalardaki yanık kalmış lambalar dahil) */
    for (const [k, x, y, z, acik] of lambalar) if (adaylar.has(k) !== !!acik) this.koy(x, y, z, acik ? 241 : 242);
    /* Ters çeviriciler bir adım gecikmeyle durum değiştirir (saat devreleri böyle çalışır) */
    for (const [x, y, z, yon, acik, g, k] of ters) {
      const [a, c] = YATAY[yon], bx = x - a, bz = z - c, bk = A(bx, y, bz);
      const arka = BLOKLAR[d.blok(bx, y, bz)];
      const arkaTers = arka && (arka.mekanik === 'ters' || arka.mekanik === 'gecik') && arka.acik && arka.yon === yon;
      const girdi = gucVar(bk) || arkaTers;
      if (g < 0) {
        const yeni = !girdi;
        if (yeni !== !!acik) { this.koy(x, y, z, 243 + yon * 2 + (yeni ? 1 : 0)); this.saat = true; }
        continue;
      }
      /* 0.20.0: Geciktirici: girdi, (gecikme + 1) adım (0,1-0,4 saniye) sonra çıkışa geçer; tersine çevirmez */
      let s = this.gecikmeler.get(k);
      if (girdi === !!acik) { if (s) this.gecikmeler.delete(k); continue; }
      if (!s || s.hedef !== girdi) { s = { hedef: girdi, kalan: g + 1 }; this.gecikmeler.set(k, s); }
      if (--s.kalan <= 0) { this.gecikmeler.delete(k); this.koy(x, y, z, GECIK + yon * 8 + g * 2 + (girdi ? 1 : 0)); }
      this.saat = true;
    }
  }

  /* Tüketici güç aldı (acik = true) ya da kaybetti */
  tuket(x, y, z, acik, yon) {
    const d = this.dunya, id = d.blok(x, y, z), b = BLOKLAR[id];
    if (!b) return;
    if (b.sekil === 'kapi') {
      if (!!b.acik === acik) return;
      const a = acik ? 1 : 0;
      this.koy(x, y, z, 88 + b.yon * 4 + a * 2 + b.ust);
      const u = BLOKLAR[d.blok(x, y + 1, z)];
      if (u && u.sekil === 'kapi') this.koy(x, y + 1, z, 88 + u.yon * 4 + a * 2 + u.ust);
      if (this.sesYakin(x, y, z)) this.ses.kapi(acik);
    } else if (b.sekil === 'citKapi') {
      if (!!b.acik !== acik) { this.koy(x, y, z, 105 + b.eksen * 2 + (acik ? 1 : 0)); if (this.sesYakin(x, y, z)) this.ses.kapi(acik); }
    } else if (b.sekil === 'tuzak') {
      if (!!b.acik !== acik) { this.koy(x, y, z, 121 + b.yon * 2 + (acik ? 1 : 0)); if (this.sesYakin(x, y, z)) this.ses.kapi(acik); }
    } else if (id === 157 && acik && yon) {
      /* Ok atıcı: güç geldiği yönün tersine ok atar */
      const [a, bb, c] = yon;
      const p = new THREE.Vector3(x + 0.5 + a * 0.65, y + 0.5 + bb * 0.65, z + 0.5 + c * 0.65);
      const h = new THREE.Vector3(a + (Math.random() - 0.5) * 0.04, bb + 0.03, c + (Math.random() - 0.5) * 0.04).normalize().multiplyScalar(22);
      this.varliklar.okAt(p, h, 3, { turAd: 'tuzak', tur: { agu: false }, konum: p });
      if (this.sesYakin(x, y, z)) this.ses.yayAt();
    } else if (b.mekanik === 'muzik' && acik) {
      this.varliklar.efekt({ t: 'patlama', x: x + 0.5, y: y + 1.2, z: z + 0.5, c: [0.95, 0.5, 0.75], n: 6, ses: 'nota', m: ezgiTuru(d.blok(x, y - 1, z)) });
    }
  }
}
