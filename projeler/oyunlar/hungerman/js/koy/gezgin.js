/* HungerMan - 0.51.0: Gezgin Tüccar
   Tek oyunculu dünyalarda, 2. günden sonra bazı sabahlar (%35) oyuncunun 14-22 blok yakınında bir gezgin tüccar belirir ve bir gün kalır.
   Köylerde bulunmayan ya da pahalı olan eşyaları satar (fidanlar, tohumlar, tılsım, eyer, ışıltaş...) ve nadir buluntuları
   köylülerden daha iyi fiyata alır (elmas, inci, yıldız parçası, altın): keşfe ek bir sikke kaynağıdır.
   Her gelişte havuzdan 7 takas seçilir; her takasın sınırlı stoğu vardır. Tüccara saldırılırsa küser ve gider. */
import { ESYALAR, MEYVE_YAPRAK, ESYA52 } from '../bloklar.js';
import { GUN_SURESI } from '../sabitler.js';

const S = 288;
const idAd = ad => { for (const e of Object.values(ESYALAR)) if (e && e.ad === ad) return e.id; return null; };
/* [verilenler, alınan, stok] — verilen: oyuncunun verdiği, alınan: oyuncunun aldığı */
function havuz() {
  const F = MEYVE_YAPRAK, l = [];
  const ekle = (ver, al, stok) => { if (ver.every(([i]) => ESYALAR[i]) && ESYALAR[al[0]]) l.push({ ver, al, stok }); };
  for (const k of Object.keys(F)) if (F[k] && F[k].fidan) ekle([[S, 3]], [F[k].fidan, 1], 2);
  for (const ad of ['Domates Tohumu', 'Lahana Tohumu', 'Balkabağı Çekirdeği', 'Havuç', 'Patates']) { const i = idAd(ad); if (i) ekle([[S, 1]], [i, 4], 3); }
  ekle([[S, 7]], [493, 1], 1);        // Eve Dönüş Tılsımı
  ekle([[S, 3]], [462, 1], 1);        // Eyer
  ekle([[S, 6]], [456, 1], 1);        // Dalış Maskesi
  ekle([[S, 2]], [514, 1], 3);        // Işıltaş
  ekle([[S, 1]], [61, 2], 3);         // Parıltı Kristali
  ekle([[S, 4]], [290, 1], 1);        // Altın Elma
  /* 0.52.0: yeni ekinlerin tohumları ve av ürünleri */
  for (const k of ['pirinc', 'patlicanTohumu', 'aycicegi', 'cayFidesi', 'kahve', 'kakao']) ekle([[S, 1]], [ESYA52[k], 3], 3);
  ekle([[ESYA52.ayiPostu, 1]], [S, 3], 2); ekle([[ESYA52.tilkiKurku, 1]], [S, 2], 3); ekle([[ESYA52.boynuz, 1]], [S, 2], 3);
  /* nadir buluntuları alır */
  ekle([[264, 1]], [S, 6], 3);        // Elmas (demirci 5)
  ekle([[299, 1]], [S, 4], 3);        // İnci (balıkçı 3)
  ekle([[492, 1]], [S, 5], 3);        // Yıldız Parçası (şifacı 4)
  ekle([[263, 2]], [S, 2], 4);        // Altın Külçe (şifacı 1 sikkeye 2)
  return l;
}
export const GEZGIN_SOZ = ['Yollar uzun, heybem dolu. Bir göz atın derim.', 'Uzak diyarlardan geldim; bu topraklarda bulamayacağınız şeyler var.',
  'Yarın sabah yola çıkarım. Fırsat bu fırsat.', 'Elmas, inci, yıldız parçası… Böyle şeyleri iyi fiyata alırım.', 'Geceleri buralar tekin değil; işimizi gündüz bitirelim.'];

export class GezginTuccar {
  constructor(o) { Object.assign(this, o); this.v = null; this.sonGun = 0; this.teklifler = []; }   // varliklar, dunya, hud, ses
  /* Her kare: sabah doğma denemesi, süre dolunca ya da tüccar ölünce temizlik */
  guncelle(dt, o) {
    if (this.v && (this.v.olu || this.v.kuskun)) { this.hud.bildirim('Gezgin tüccar gücendi ve yoluna devam etti.'); if (this.varliklar.liste.includes(this.v)) this.varliklar.kaldir(this.v); this.v = null; return; }
    if (this.v && !this.varliklar.liste.includes(this.v)) this.v = null;   // uzaklaşınca kaldırıldı
    if (this.v) {
      this.v.gezginSure -= dt;
      if (this.v.gezginSure <= 0) { this.varliklar.kaldir(this.v); this.v = null; }
      return;
    }
    if (o.ag || o.istemci || o.gun < 2 || o.gun === this.sonGun || o.diyar) return;
    if (o.zaman < 0.03 || o.zaman > 0.12) return;
    this.sonGun = o.gun;
    if (Math.random() > 0.35) return;
    const P = o.oyuncu.konum;
    for (let d = 0; d < 12; d++) {
      const a = Math.random() * Math.PI * 2, r = 14 + Math.random() * 8, x = Math.floor(P.x + Math.cos(a) * r), z = Math.floor(P.z + Math.sin(a) * r);
      if (!this.dunya.yuklu(x, z)) continue;
      const y = this.dunya.ustKati(x, z) + 1;
      if (Math.abs(y - P.y) > 12 || !this.dunya.kati(x, y - 1, z) || this.dunya.kati(x, y, z) || this.dunya.kati(x, y + 1, z)) continue;
      this.dogur(x + 0.5, y, z + 0.5);
      this.hud.bildirim('Yakınlarda bir gezgin tüccar konakladı. Yarın sabah yola çıkacak.');
      return;
    }
  }
  /* 0.51.1: geliştirici araçları için: tüccarı zaman ve şans koşulu olmadan, gerçek hâliyle (takas listesi, süre, küsme) getirir */
  getir(o) {
    if (this.v) return this.v;
    const P = o.oyuncu.konum;
    for (let d = 0; d < 40; d++) {
      const a = Math.random() * Math.PI * 2, r = (d < 20 ? 4 : 2) + Math.random() * 4, x = Math.floor(P.x + Math.cos(a) * r), z = Math.floor(P.z + Math.sin(a) * r);
      if (!this.dunya.yuklu(x, z)) continue;
      const y = this.dunya.ustKati(x, z) + 1;
      if (Math.abs(y - P.y) > 6 || !this.dunya.kati(x, y - 1, z) || this.dunya.kati(x, y, z) || this.dunya.kati(x, y + 1, z)) continue;
      this.sonGun = o.gun;
      return this.dogur(x + 0.5, y, z + 0.5);
    }
    return null;
  }
  /* 0.51.1: takas listesini ve stokları yeniden seçer */
  yenile() { if (!this.v) return false; const l = havuz(), sec = [];
    while (sec.length < 7 && l.length) sec.push(l.splice(Math.floor(Math.random() * l.length), 1)[0]);
    this.teklifler = sec.sort((a, b) => (a.ver[0][0] === S) - (b.ver[0][0] === S)).map(t => ({ ...t, kalan: t.stok })); return true; }
  /* 0.51.1: tüccarı hemen gönderir */
  gonder() { if (!this.v) return false; if (this.varliklar.liste.includes(this.v)) this.varliklar.kaldir(this.v); this.v = null; return true; }
  dogur(x, y, z) {
    const v = this.varliklar.ekle('gezgin', x, y, z);
    v.gezginSure = GUN_SURESI; v.evcil = false;
    const l = havuz(), sec = [];
    while (sec.length < 7 && l.length) sec.push(l.splice(Math.floor(Math.random() * l.length), 1)[0]);
    this.teklifler = sec.sort((a, b) => (a.ver[0][0] === S) - (b.ver[0][0] === S)).map(t => ({ ...t, kalan: t.stok }));
    this.v = v;
    return v;
  }
}
