/* HungerMan - 0.49.0: bağlamsal ipuçları
   Oyuncu bir şeyle ilk kez karşılaştığında (su, lav, köylü, mağara, gece, canavar, açlık, soğuk, düşük can) kısa bir bilgi kartı gösterilir.
   Her ipucu bir kez gösterilir; görülenler tarayıcıda saklanır (bütün dünyalar için ortak). Ayarlar > Oynanış'tan kapatılabilir ve sıfırlanabilir. */
import { T, tusAdi } from '../sistem/tuslar.js';
import { LAV } from '../bloklar.js';
import { DENIZ } from '../sabitler.js';
const $ = s => document.querySelector(s);
const ANAHTAR = 'hungerman_ipuclari';
const k = t => tusAdi(T[t]);
const lavYakin = o => { const P = o.oyuncu.konum, d = o.dunya, x0 = Math.floor(P.x), y0 = Math.floor(P.y), z0 = Math.floor(P.z);
  for (let x = -5; x <= 5; x++) for (let y = -3; y <= 2; y++) for (let z = -5; z <= 5; z++) if (LAV[d.blok(x0 + x, y0 + y, z0 + z)]) return true; return false; };
/* kosul(o): ipucu bu an gösterilmeli mi; metin(o, dokunmatik) */
export const IPUCLARI = [
  { a: 'su', baslik: 'Su', kosul: o => o.oyuncu.suda && !o.oyuncu.lavda,
    metin: (o, d) => `Suda ${d ? 'Zıpla düğmesini basılı tutarak' : k('zipla') + ' basılı tutularak'} yüzeye çıkılır. Başınız su altındayken oksijen azalır; oksijen bitince can kaybedersiniz.` },
  { a: 'lav', baslik: 'Lav', kosul: o => !o.diyar && lavYakin(o),
    metin: () => 'Lav, değen her şeyi yakar; içine düşen eşyalar yok olur. Lavın üzerine dökülen su onu taşa ya da obsidyene çevirir.' },
  { a: 'koylu', baslik: 'Köylüler', kosul: o => o.varliklar.liste.some(v => v.tur.koylu && !v.olu && v.konum.distanceToSquared(o.oyuncu.konum) < 49),
    metin: (o, d) => `Köylüyle ${d ? 'E düğmesiyle' : k('etkiles') + ' ile'} konuşulur: sikkeyle ticaret yapılır, görev alınır, söylenti dinlenir. Köy, gece canavarlara karşı da güvenli bir yerdir.` },
  { a: 'magara', baslik: 'Mağara', kosul: o => !o.diyar && o.oyuncu.konum.y < DENIZ - 6 && o.dunya.ustKati(Math.floor(o.oyuncu.konum.x), Math.floor(o.oyuncu.konum.z)) > o.oyuncu.konum.y + 8,
    metin: () => 'Karanlıkta canavar doğar. Geçtiğiniz yerlere meşale koyunuz: yol hem aydınlanır hem de dönüşte iz olur. Cevherler mağara duvarlarında görünür.' },
  { a: 'gece', baslik: 'Gece', kosul: o => !o.diyar && (o.gunIsigi ?? 1) < 0.35,
    metin: () => 'Gece canavarlar çıkar. Sığınağınıza çekiliniz ya da yatakta uyuyunuz. Aydınlık yerlerde canavar doğmaz.' },
  { a: 'canavar', baslik: 'Tehlike', kosul: o => o.varliklar.liste.some(v => v.tur.dusman && !v.olu && v.farkinda > 0 && v.konum.distanceToSquared(o.oyuncu.konum) < 144),
    metin: (o, d) => d ? 'Bir canavar sizi fark etti. Kır düğmesiyle saldırılır. Canavar kollarını kaldırınca geri çekiliniz; elinizde silah varken Kullan düğmesi savunur.'
      : `Bir canavar sizi fark etti. Sol tıkla saldırılır; elinizde silah varken sağ tık basılı tutulursa savunulur. Canavar kollarını kaldırınca geri çekiliniz ya da ${k('geri')} tuşuna iki kez basarak atılınız.` },
  { a: 'aclik', baslik: 'Açlık', kosul: o => o.hayatta.aclik <= 12 && !o.hayatta.olumsuz,
    metin: (o, d) => `Açlık göstergesi (sağ alttaki butlar) azalıyor. Yiyecek ${d ? 'Kullan düğmesiyle' : 'sağ tıkla'} yenir. Açlık bitince can azalmaya başlar; pişmiş yiyecek çok daha doyurur.` },
  { a: 'isi', baslik: 'Vücut ısısı', kosul: o => (o.hayatta.isiDurum || 0) !== 0 && o.hayatta.isiAcik !== false,
    metin: () => 'Çok soğuk ya da çok sıcak bir yerdesiniz (sağ üstteki termometre). Ateşin yanında ısınılır, kıyafetler soğuktan korur; sıcakta gölgede ve suda serinlenir.' },
  { a: 'can', baslik: 'Can', kosul: o => o.hayatta.can <= 10 && !o.hayatta.olu && !o.hayatta.olumsuz,
    metin: () => 'Canınız azaldı. Açlık göstergesi doluyken can kendiliğinden yenilenir. Bandaj ve şifa iksiri hızlı iyileştirir; tehlikeden uzaklaşınız.' }
];
export class Ipuclari {
  constructor(ses) {
    this.ses = ses; this.el = $('#ipucuKart'); this.sayac = 0; this.sure = 0; this.dokunmatik = () => false;
    this.gorulen = new Set();
    try { const l = JSON.parse(localStorage.getItem(ANAHTAR) || '[]'); if (Array.isArray(l)) for (const a of l) this.gorulen.add(a); } catch (e) { /* depo kapalı */ }
    if (this.el) this.el.addEventListener('click', () => this.kapat());
  }
  kaydet() { try { localStorage.setItem(ANAHTAR, JSON.stringify([...this.gorulen])); } catch (e) { /* depo kapalı */ } }
  sifirla() { this.gorulen.clear(); this.kaydet(); }
  kapat() { this.sure = 0; if (this.el) this.el.hidden = true; }
  goster(I, o) {
    this.gorulen.add(I.a); this.kaydet();
    if (!this.el) return;
    this.el.querySelector('b').textContent = I.baslik;
    this.el.querySelector('p').textContent = I.metin(o, !!this.dokunmatik());
    this.el.hidden = false; this.el.classList.remove('yeni'); void this.el.offsetWidth; this.el.classList.add('yeni');
    this.sure = 11;
    if (this.ses && this.ses.tik) this.ses.tik();
  }
  /* acik: ayar açık ve pencere yokken */
  guncelle(o, dt, acik) {
    if (this.sure > 0) { this.sure -= dt; if (this.sure <= 0) this.kapat(); }
    if (!acik || !o || !o.hazir || o.izleyici || o.hayatta.olu) { if (!acik && this.el && !this.el.hidden) this.kapat(); return; }
    this.sayac -= dt;
    if (this.sayac > 0 || this.sure > 2) return;   // yeni ipucu, öncekinin son iki saniyesinden önce gelmez
    this.sayac = 1;
    for (const I of IPUCLARI) {
      if (this.gorulen.has(I.a)) continue;
      let ok = false; try { ok = I.kosul(o); } catch (e) { ok = false; }
      if (ok) { this.goster(I, o); return; }
    }
  }
}
