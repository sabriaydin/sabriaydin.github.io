/* HungerMan - geliştirici konsolu (F8): test için komutlar, canlı bilgi satırı, komut geçmişi ve Tab ile tamamlama
   Hile niteliğindeki komutlar yalnızca "Komutlara izin ver" seçeneğiyle oluşturulan dünyalarda (ya da geliştirici kodu
   girildikten sonra) çalışır. Çok oyunculu istemcide yalnızca oyuncunun kendisini etkileyen komutlar çalışır. */
import { ESYALAR, BLOKLAR } from '../bloklar.js';
import { TURLER } from '../varlik/turler.js';
import { BIYOMLAR } from '../dunya/uretici.js';
import { koylerAlan } from '../dunya/koy-uretici.js';
import { zindanlarAlan } from '../dunya/zindan-uretici.js';
import { batiklarAlan } from '../dunya/batik-uretici.js';
import { parcaHesapla } from '../harita/harita.js';
import { PB, DENIZ, DUNYA_SINIRI } from '../sabitler.js';

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const kucuk = s => String(s).toLocaleLowerCase('tr').replace(/[ıİ]/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').trim();
const SAKLA = 'hungerman_konsol_gecmis';
/* Geliştirici kodu (açık metin olarak saklanmaz) */
const KOD_OZET = 'e9ec9ca3';
function ozet(s) { let h = 0x811c9dc5; for (const c of String(s).toUpperCase().trim()) { h ^= c.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16); }

export class Konsol {
  constructor(o) {
    Object.assign(this, o); // ses, oyun(), kapatIste, arayuz: { fps(), hataPaneli(), kaydet(), gorusAyarla(n), haritaAc(), gelistiriciAc() }
    this.mesajDinle = null;   // geliştirici penceresi son mesajı gösterir
    this.acik = false;
    this.kok = $('#konsol');
    this.girdi = $('#konsolGirdi');
    this.cikti = $('#konsolCikti');
    this.gecmis = [];
    try { this.gecmis = JSON.parse(localStorage.getItem(SAKLA) || '[]').slice(-50); } catch (e) { /* depolama kapalı */ }
    this.gSira = this.gecmis.length;
    this.kesif = null; this.bilgiSayac = 0;
    this.komutlar = this.komutlariKur();
    this.girdi.addEventListener('keydown', e => this.tus(e));
    this.kok.addEventListener('mousedown', e => { if (e.target === this.kok) e.preventDefault(); });
    this.yaz('HungerMan geliştirici konsolu. Komut listesi için <b>yardim</b> yazınız. Kapatmak için F8 veya Esc.', 'bilgi', true);
  }

  ac() { this.acik = true; this.kok.hidden = false; setTimeout(() => this.girdi.focus(), 0); this.bilgiGuncelle(); }
  kapat() { this.acik = false; this.kok.hidden = true; this.girdi.blur(); }

  yaz(m, sinif = '', html = false) {
    const d = document.createElement('div');
    d.className = 'kSatir ' + sinif;
    if (html) d.innerHTML = m; else d.textContent = m;
    this.cikti.appendChild(d);
    if (this.mesajDinle && sinif !== 'girdi') this.mesajDinle(d.textContent, sinif);
    while (this.cikti.children.length > 300) this.cikti.firstChild.remove();
    this.cikti.scrollTop = this.cikti.scrollHeight;
  }
  hata(m) { this.yaz(m, 'hata'); }
  tamam(m) { this.yaz(m, 'tamam'); }

  tus(e) {
    e.stopPropagation();
    if (e.key === 'Enter') { const s = this.girdi.value.trim(); this.girdi.value = ''; if (s) this.calistir(s); }
    else if (e.key === 'Escape' || e.code === 'F8' || (e.code === 'Backquote' && !this.girdi.value)) { e.preventDefault(); this.kapatIste(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (this.gSira > 0) this.girdi.value = this.gecmis[--this.gSira] || ''; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); this.gSira = Math.min(this.gecmis.length, this.gSira + 1); this.girdi.value = this.gecmis[this.gSira] || ''; }
    else if (e.key === 'Tab') { e.preventDefault(); this.tamamla(); }
  }
  tamamla() {
    const v = this.girdi.value, p = v.split(/\s+/);
    if (p.length === 1) {
      const l = Object.keys(this.komutlar).filter(k => k.startsWith(kucuk(p[0])));
      if (l.length === 1) this.girdi.value = l[0] + ' ';
      else if (l.length) this.yaz(l.join('  '), 'soluk');
    } else {
      const k = this.komutlar[kucuk(p[0])];
      const adaylar = k && k.tamamla ? k.tamamla() : [];
      const son = kucuk(p[p.length - 1]);
      const l = adaylar.filter(a => kucuk(a).startsWith(son));
      if (l.length === 1) { p[p.length - 1] = l[0]; this.girdi.value = p.join(' ') + ' '; }
      else if (l.length) this.yaz(l.slice(0, 40).join('  ') + (l.length > 40 ? ' …' : ''), 'soluk');
    }
  }

  calistir(s) {
    this.yaz('> ' + s, 'girdi');
    if (this.gecmis[this.gecmis.length - 1] !== s) this.gecmis.push(s);
    this.gecmis = this.gecmis.slice(-50); this.gSira = this.gecmis.length;
    try { localStorage.setItem(SAKLA, JSON.stringify(this.gecmis)); } catch (e) { /* depolama kapalı */ }
    const p = s.split(/\s+/), ad = kucuk(p.shift());
    /* Geliştirici kodu tek başına da yazılabilir */
    if (!this.komutlar[ad] && ozet(ad) === KOD_OZET) { this.komutlar.gelistirici.f(this.oyun(), [ad]); return; }
    const k = this.komutlar[ad];
    if (!k) { this.hata(`Bilinmeyen komut: ${ad}. Komut listesi için “yardim” yazınız.`); return; }
    const o = this.oyun();
    if (!o) { this.hata('Önce bir dünyaya girilmelidir.'); return; }
    if (k.hile && !o.komutlar) { this.hata('Bu dünyada komutlar kapalı. Komutlar, dünya oluşturulurken “Komutlara izin ver” seçeneğiyle açılır; mevcut bir dünyada geliştirici kodu ile açılabilir (gelistirici <kod>).'); return; }
    if (k.dunya && o.istemci) { this.hata('Bu komut dünyayı değiştirir; çok oyunculu istemcide kullanılamaz (sunucu olan oyuncu kullanabilir).'); return; }
    try { k.f(o, p); } catch (e) { this.hata('Komut çalıştırılamadı: ' + (e.message || e)); }
  }

  /* ---------- Yardımcılar ---------- */
  sayi(v, varsayilan) { const n = Number(String(v).replace(',', '.')); return Number.isFinite(n) ? n : varsayilan; }
  /* "~" göreli koordinat: ~ veya ~5 */
  koord(v, taban) { if (v == null) return null; if (v.startsWith('~')) return taban + (v.length > 1 ? this.sayi(v.slice(1), 0) : 0); const n = this.sayi(v, NaN); return Number.isFinite(n) ? n : null; }
  esyaBul(ad) {
    const n = Number(ad);
    if (Number.isInteger(n) && ESYALAR[n]) return [n];
    const a = kucuk(ad).replace(/_/g, ' ');
    const l = Object.entries(ESYALAR).filter(([, e]) => e && e.ad);
    const tam = l.filter(([, e]) => kucuk(e.ad) === a);
    if (tam.length) return tam.map(([i]) => +i);
    return l.filter(([, e]) => kucuk(e.ad).includes(a)).map(([i]) => +i);
  }
  isinla(o, x, y, z) {
    x = Math.max(-DUNYA_SINIRI + 2, Math.min(DUNYA_SINIRI - 2, x)); z = Math.max(-DUNYA_SINIRI + 2, Math.min(DUNYA_SINIRI - 2, z));
    if (y == null) y = Math.max(DENIZ + 1, o.dunya.uretici.kolon(Math.floor(x), Math.floor(z), {}).h + 1);
    if (o.tekneler.binilen) o.tekneler.in(o.oyuncu);
    o.oyuncu.konum.set(x, y, z); o.oyuncu.hiz.set(0, 0, 0); o.oyuncu.dusus = 0;
    o.hazir = false;
    this.tamam(`Işınlanıldı: X ${Math.round(x)} · Y ${Math.round(y)} · Z ${Math.round(z)}`);
  }
  enYakin(l, p) { let en = null, d = Infinity; for (const a of l) { const q = Math.hypot(a.x - p.x, a.z - p.z); if (q < d) { d = q; en = a; } } return en; }

  /* ---------- Komutlar ---------- */
  komutlariKur() {
    const K = {};
    const ekle = (ad, aciklama, kullanim, f, ek = {}) => { K[ad] = { aciklama, kullanim, f, ...ek }; };
    ekle('yardim', 'Komutları listeler', 'yardim [komut]', (o, p) => {
      if (p[0] && K[kucuk(p[0])]) { const k = K[kucuk(p[0])]; this.yaz(`${k.kullanim} — ${k.aciklama}`, 'bilgi'); return; }
      this.yaz(Object.entries(K).map(([a, k]) => `<b>${esc(k.kullanim)}</b> <span>${esc(k.aciklama)}</span>`).join('<br>'), 'liste', true);
      this.yaz('Koordinatlarda ~ geçerli konumu ifade eder (örnek: isinla ~ ~20 ~). Tab tuşu komutu ve adları tamamlar; ↑/↓ geçmişte gezinir.', 'soluk');
    });
    ekle('temizle', 'Konsol çıktısını siler', 'temizle', () => { this.cikti.innerHTML = ''; });
    ekle('gelistirici', 'Geliştirici kodu ile geliştirici modunu açar; açıksa geliştirici penceresini (F9) açar', 'gelistirici [kod]', (o, p) => {
      if (o.gelistirici) { this.arayuz.gelistiriciAc(); return; }
      if (!p[0]) { this.hata('Geliştirici modu kapalı. Kullanım: gelistirici <kod>'); return; }
      if (ozet(p[0]) !== KOD_OZET) { this.hata('Geliştirici kodu geçersiz.'); return; }
      o.gelistirici = true; o.komutlar = true;
      this.tamam('Geliştirici modu etkin. Bu dünyada komutlar açıldı. Geliştirici penceresi F9 ile açılır.');
      this.arayuz.kaydet();
      this.arayuz.gelistiriciAc();
    });
    ekle('ver', 'Envantere eşya ekler (ad veya numara)', 'ver <eşya> [adet]', (o, p) => {
      if (!p.length) { this.hata('Kullanım: ver <eşya> [adet]'); return; }
      let adet = 1;
      if (p.length > 1 && Number.isFinite(Number(p[p.length - 1]))) adet = Math.max(1, Math.min(64 * 36, Math.floor(Number(p.pop()))));
      const l = this.esyaBul(p.join(' '));
      if (!l.length) { this.hata(`Eşya bulunamadı: ${p.join(' ')}`); return; }
      if (l.length > 1) { this.yaz('Birden çok eşya eşleşti: ' + l.slice(0, 20).map(i => `${ESYALAR[i].ad} (${i})`).join(', '), 'soluk'); return; }
      const k = o.envanter.ekle(l[0], adet);
      this.tamam(`${ESYALAR[l[0]].ad} × ${adet - k} verildi.` + (k ? ` ${k} tanesi sığmadı.` : ''));
    }, { hile: true, tamamla: () => Object.values(ESYALAR).filter(e => e && e.ad).map(e => e.ad.replace(/ /g, '_')) });
    ekle('esyalar', 'Eşyaları numaralarıyla listeler', 'esyalar [arama]', (o, p) => {
      const a = kucuk(p.join(' '));
      const l = Object.entries(ESYALAR).filter(([, e]) => e && e.ad && (!a || kucuk(e.ad).includes(a)));
      this.yaz(l.map(([i, e]) => `${i} ${e.ad}`).join(' · ') || 'Eşleşen eşya yok.', 'soluk');
    });
    ekle('envanter', 'Envanteri boşaltır', 'envanter temizle', (o, p) => {
      if (kucuk(p[0] || '') !== 'temizle') { this.hata('Kullanım: envanter temizle'); return; }
      o.envanter.temizle(); this.tamam('Envanter boşaltıldı.');
    }, { hile: true });
    ekle('isinla', 'Koordinata veya yere ışınlar (koy, liman, zindan, batik, dogum, isaret <ad>)', 'isinla <x> [y] <z> | koy | liman | zindan | batik | dogum | isaret <ad>', (o, p) => {
      const P = o.oyuncu.konum, a = kucuk(p[0] || ''), u = o.dunya.uretici, R = 1600;
      if (a === 'koy' || a === 'liman') {
        let l = koylerAlan(u, P.x - R, P.z - R, P.x + R, P.z + R);
        if (a === 'liman') l = l.filter(k => k.liman).map(k => ({ x: k.liman.iskeleX - k.liman.ax * 6, z: k.liman.iskeleZ - k.liman.az * 6, ad: k.ad + ' limanı' }));
        else l = l.filter(k => Math.hypot(k.x - P.x, k.z - P.z) > 20).map(k => ({ x: k.x + 7, z: k.z, ad: k.ad + ' köyü' }));
        const en = this.enYakin(l, P);
        if (!en) { this.hata('Yakında bulunamadı.'); return; }
        this.isinla(o, en.x + 0.5, null, en.z + 0.5); this.yaz(en.ad, 'soluk'); return;
      }
      if (a === 'zindan') {
        const en = this.enYakin(zindanlarAlan(u, P.x - 400, P.z - 400, P.x + 400, P.z + 400).filter(z => Math.hypot(z.x - P.x, z.z - P.z) > 8), P);
        if (!en) { this.hata('Yakında zindan bulunamadı.'); return; }
        this.isinla(o, en.x + 0.5, en.y + 1, en.z + 0.5); return;
      }
      if (a === 'batik') {
        const en = this.enYakin(batiklarAlan(u, P.x - 900, P.z - 900, P.x + 900, P.z + 900).filter(b => Math.hypot(b.x - P.x, b.z - P.z) > 8), P);
        if (!en) { this.hata('Yakında batık gemi bulunamadı.'); return; }
        this.isinla(o, en.x + 0.5, en.y + 3, en.z + 0.5); return;
      }
      if (a === 'dogum') { const d = o.dogum; this.isinla(o, d.x, d.y + 0.5, d.z); return; }
      if (a === 'isaret') {
        const ad = kucuk(p.slice(1).join(' '));
        const y = (o.yerler || []).find(v => kucuk(v.ad) === ad) || (o.yerler || []).find(v => kucuk(v.ad).includes(ad));
        if (!y) { this.hata('İşaret bulunamadı.'); return; }
        this.isinla(o, y.x + 0.5, null, y.z + 0.5); return;
      }
      let x, y, z;
      if (p.length >= 3) { x = this.koord(p[0], P.x); y = this.koord(p[1], P.y); z = this.koord(p[2], P.z); }
      else if (p.length === 2) { x = this.koord(p[0], P.x); y = null; z = this.koord(p[1], P.z); }
      if (x == null || z == null || (p.length >= 3 && y == null)) { this.hata('Kullanım: isinla <x> [y] <z> | koy | liman | zindan | batik | dogum | isaret <ad>'); return; }
      this.isinla(o, x, y, z);
    }, { hile: true, tamamla: () => ['koy', 'liman', 'zindan', 'batik', 'dogum', 'isaret'] });
    ekle('zaman', 'Günün saatini ayarlar ya da zamanı hızlandırır', 'zaman <saat 0-24 | sabah | ogle | aksam | gece> | zaman hiz <çarpan>', (o, p) => {
      const a = kucuk(p[0] || '');
      if (a === 'hiz') { const h = Math.max(0, Math.min(200, this.sayi(p[1], 1))); o.zamanHizi = h; this.tamam(`Zaman hızı ${h}×.`); return; }
      const ad = { safak: 5.5, sabah: 7, ogle: 12, ikindi: 15, aksam: 18, gece: 22, gece_yarisi: 0 };
      const s = ad[a] ?? this.sayi(a, NaN);
      if (!Number.isFinite(s)) { this.hata('Kullanım: zaman <saat 0-24 | sabah | ogle | aksam | gece> | zaman hiz <çarpan>'); return; }
      o.zaman = ((((s - 6) / 24) % 1) + 1) % 1;
      this.tamam(`Saat ${String(Math.floor(s)).padStart(2, '0')}:${String(Math.round((s % 1) * 60)).padStart(2, '0')} olarak ayarlandı.`);
    }, { hile: true, dunya: true, tamamla: () => ['safak', 'sabah', 'ogle', 'ikindi', 'aksam', 'gece', 'hiz'] });
    ekle('gun', 'Gün sayısını ayarlar (canavar sayısı buna bağlıdır)', 'gun <sayı>', (o, p) => {
      const n = Math.max(1, Math.floor(this.sayi(p[0], NaN))); if (!Number.isFinite(n)) { this.hata('Kullanım: gun <sayı>'); return; }
      o.gun = n; this.tamam(`${n}. gün.`);
    }, { hile: true, dunya: true });
    ekle('can', 'Canı ayarlar (0-20)', 'can <0-20>', (o, p) => { const n = Math.max(1, Math.min(20, Math.round(this.sayi(p[0], 20)))); o.hayatta.can = n; this.tamam(`Can ${n}.`); }, { hile: true });
    ekle('doy', 'Açlığı ve oksijeni doldurur', 'doy', o => { const h = o.hayatta; h.aclik = 20; h.oksijen = 10; h.yorgunluk = 0; h.zehir = 0; this.tamam('Açlık dolduruldu.'); }, { hile: true });
    ekle('iyiles', 'Canı, açlığı doldurur; zehir ve yanmayı kaldırır', 'iyiles', o => { const h = o.hayatta; h.can = 20; h.aclik = 20; h.oksijen = 10; h.zehir = 0; h.agu = 0; h.yanma = 0; this.tamam('Tamamen iyileşildi.'); }, { hile: true });
    ekle('olumsuz', 'Ölümsüzlüğü açar / kapatır (hiç hasar alınmaz)', 'olumsuz', o => { o.hayatta.olumsuz = !o.hayatta.olumsuz; this.tamam(`Ölümsüzlük ${o.hayatta.olumsuz ? 'açık' : 'kapalı'}.`); }, { hile: true });
    ekle('ucus', 'Uçmayı açar / kapatır (Boşluk: yüksel, C: alçal)', 'ucus', o => { o.oyuncu.ucus = !o.oyuncu.ucus; this.tamam(`Uçma ${o.oyuncu.ucus ? 'açık' : 'kapalı'}.`); }, { hile: true });
    ekle('hiz', 'Hareket hızı çarpanı (0,2 - 5)', 'hiz <çarpan>', (o, p) => { const h = Math.max(0.2, Math.min(5, this.sayi(p[0], 1))); o.oyuncu.hizCarpani = h; this.tamam(`Hız ${h}×.`); }, { hile: true });
    ekle('dogur', 'Bakılan yöne canlı doğurur', 'dogur <tür> [adet]', (o, p) => {
      const tur = kucuk(p[0] || '');
      if (!TURLER[tur] || TURLER[tur].koylu) { this.hata('Türler: ' + Object.keys(TURLER).filter(t => !TURLER[t].koylu).join(', ')); return; }
      const n = Math.max(1, Math.min(30, Math.floor(this.sayi(p[1], 1))));
      const g = o.oyuncu.gozKonumu(), y = o.oyuncu.bakisYonu();
      let x = Math.floor(g.x + y.x * 4), z = Math.floor(g.z + y.z * 4);
      const T = TURLER[tur];
      let yy;
      if (T.su) { yy = Math.min(DENIZ - 1, g.y); } else { const zm = o.varliklar.zeminBul(x, z); yy = zm ? zm.y : Math.floor(o.oyuncu.konum.y); }
      for (let i = 0; i < n; i++) o.varliklar.ekle(tur, x + 0.5 + (Math.random() - 0.5) * 2, yy, z + 0.5 + (Math.random() - 0.5) * 2);
      this.tamam(`${T.ad} × ${n} doğuruldu.`);
    }, { hile: true, dunya: true, tamamla: () => Object.keys(TURLER).filter(t => !TURLER[t].koylu) });
    ekle('oldur', 'Canlıları kaldırır', 'oldur <dusman | hayvan | deniz | hepsi | tür>', (o, p) => {
      const a = kucuk(p[0] || 'dusman');
      const sec = v => !v.tur.koylu && (a === 'hepsi' || (a === 'dusman' && v.tur.dusman) || (a === 'hayvan' && !v.tur.dusman && !v.tur.su) || (a === 'deniz' && v.tur.su) || v.turAd === a);
      const l = o.varliklar.liste.filter(sec);
      for (const v of l) o.varliklar.kaldir(v);
      this.tamam(`${l.length} canlı kaldırıldı.`);
    }, { hile: true, dunya: true, tamamla: () => ['dusman', 'hayvan', 'deniz', 'hepsi', ...Object.keys(TURLER)] });
    ekle('esya', 'Yerdeki eşyaları siler', 'esya temizle', (o, p) => {
      if (kucuk(p[0] || '') !== 'temizle') { this.hata('Kullanım: esya temizle'); return; }
      const n = o.dusenler.liste.length;
      for (const d of [...o.dusenler.liste]) { o.dusenler.sil(d); if (o.dusenler.ag && o.dusenler.ag.silindi && d.ni) o.dusenler.ag.silindi(d); }
      o.dusenler.liste = [];
      this.tamam(`${n} eşya silindi.`);
    }, { hile: true, dunya: true });
    ekle('tekne', 'Bakılan su yüzeyine tekne koyar', 'tekne <sandal | yelkenli>', (o, p) => {
      const tur = kucuk(p[0] || 'sandal');
      if (tur !== 'sandal' && tur !== 'yelkenli') { this.hata('Kullanım: tekne <sandal | yelkenli>'); return; }
      const t = o.tekneler.koy(o.oyuncu.gozKonumu(), o.oyuncu.bakisYonu(), tur, o.oyuncu.yaw);
      if (t) this.tamam(`${t.T.ad} konuldu.`); else this.hata('Bakılan yerde açık su yüzeyi yok.');
    }, { hile: true, tamamla: () => ['sandal', 'yelkenli'] });
    ekle('blok', 'Bakılan bloğun bilgisini verir ya da onu değiştirir', 'blok [bilgi | <blok numarası>]', (o, p) => {
      const h = o.etkilesim.isin(o.oyuncu.gozKonumu(), o.oyuncu.bakisYonu());
      if (!h) { this.hata('Bakılan bir blok yok.'); return; }
      if (p[0] && kucuk(p[0]) !== 'bilgi') {
        if (!o.komutlar) { this.hata('Blok değiştirmek için komutlar açık olmalıdır.'); return; }
        const id = Math.floor(this.sayi(p[0], -1));
        if (!BLOKLAR[id] || !BLOKLAR[id].ad) { this.hata('Geçersiz blok numarası.'); return; }
        o.dunya.blokKoy(h.x, h.y, h.z, id); this.tamam(`(${h.x}, ${h.y}, ${h.z}) → ${BLOKLAR[id].ad}`); return;
      }
      this.yaz(`${BLOKLAR[h.id].ad} (${h.id}) · X ${h.x} Y ${h.y} Z ${h.z} · uzaklık ${h.t.toFixed(1)}`, 'bilgi');
    });
    ekle('bloklar', 'Blokları numaralarıyla listeler', 'bloklar [arama]', (o, p) => {
      const a = kucuk(p.join(' '));
      this.yaz(BLOKLAR.map((b, i) => b && b.ad && (!a || kucuk(b.ad).includes(a)) ? `${i} ${b.ad}` : null).filter(Boolean).join(' · '), 'soluk');
    });
    ekle('konum', 'Konum, parça, biyom ve yükseklik bilgisi', 'konum', o => {
      const P = o.oyuncu.konum, k = o.dunya.uretici.kolon(Math.floor(P.x), Math.floor(P.z), {});
      this.yaz(`X ${P.x.toFixed(2)} · Y ${P.y.toFixed(2)} · Z ${P.z.toFixed(2)} · parça ${Math.floor(P.x / PB)},${Math.floor(P.z / PB)} · ${BIYOMLAR[k.b]} · zemin ${k.h} · yön ${Math.round(((-o.oyuncu.yaw * 180 / Math.PI) % 360 + 360) % 360)}°`, 'bilgi');
    });
    ekle('tohum', 'Dünya tohumunu yazar', 'tohum', o => this.yaz(`Tohum: ${o.tohum}`, 'bilgi'));
    ekle('gorus', 'Görüş mesafesini ayarlar (4-16 parça)', 'gorus <4-16>', (o, p) => { const n = Math.max(4, Math.min(16, Math.round(this.sayi(p[0], 8)))); this.arayuz.gorusAyarla(n); this.tamam(`Görüş ${n} parça.`); });
    ekle('kesfet', 'Haritada çevreyi keşfedilmiş yapar', 'kesfet [yarıçap blok, en çok 512]', (o, p) => {
      const r = Math.max(32, Math.min(512, Math.round(this.sayi(p[0], 160))));
      const P = o.oyuncu.konum, c0x = Math.floor((P.x - r) / PB), c1x = Math.floor((P.x + r) / PB), c0z = Math.floor((P.z - r) / PB), c1z = Math.floor((P.z + r) / PB);
      const l = [];
      for (let cz = c0z; cz <= c1z; cz++) for (let cx = c0x; cx <= c1x; cx++) if (!o.harita.parcalar.has(cx + ',' + cz) && Math.hypot((cx + 0.5) * PB - P.x, (cz + 0.5) * PB - P.z) <= r) l.push([cx, cz]);
      l.sort((a, b) => Math.hypot(a[0] * PB - P.x, a[1] * PB - P.z) - Math.hypot(b[0] * PB - P.x, b[1] * PB - P.z));
      this.kesif = { o, l, n: 0, top: l.length };
      this.tamam(`${l.length} parça haritaya işlenecek (arka planda).`);
    }, { hile: true });
    ekle('harita', 'Büyük haritayı açar', 'harita', () => { this.arayuz.haritaAc(); });
    ekle('kaydet', 'Oyunu hemen kaydeder', 'kaydet', () => { this.arayuz.kaydet(); this.tamam('Kaydedildi.'); });
    ekle('fps', 'Kare hızı göstergesini açar / kapatır', 'fps', () => { this.tamam(`FPS göstergesi ${this.arayuz.fps() ? 'açık' : 'kapalı'}.`); });
    ekle('hata', 'Teknik bilgi panelini (F3) açar / kapatır', 'hata', () => { this.arayuz.hataPaneli(); });
    ekle('ag', 'Çok oyunculu durumunu gösterir', 'ag', o => {
      if (!o.ag) { this.yaz('Tek oyunculu. Dünya, duraklatma menüsünden arkadaşlara açılabilir.', 'bilgi'); return; }
      const l = o.ag.oyuncuListesi().map(a => a[1] + (a[3] ? ' (sunucu)' : '')).join(', ');
      this.yaz(`${o.istemci ? 'İstemci' : 'Sunucu'} · ${o.ag.kod ? 'kod ' + o.ag.kod + ' · ' : ''}oyuncular: ${l}`, 'bilgi');
    });
    ekle('sayac', 'Canlı, eşya, parça ve bellek sayaçları', 'sayac', o => {
      const V = o.varliklar.liste, m = performance.memory;
      this.yaz(`Canlı ${V.length} (düşman ${V.filter(v => v.tur.dusman).length}, hayvan ${V.filter(v => !v.tur.dusman && !v.tur.su && !v.tur.koylu).length}, deniz ${V.filter(v => v.tur.su).length}, köylü ${V.filter(v => v.tur.koylu).length}) · ok ${o.varliklar.oklar.length} · yerde eşya ${o.dusenler.liste.length} · tekne ${o.tekneler.liste.length} · yüklü parça ${o.dunya.parcalar.size} · harita parçası ${o.harita.parcalar.size} · değişiklik ${[...o.dunya.degisiklikler.values()].reduce((a, d) => a + d.size, 0)}${m ? ` · bellek ${Math.round(m.usedJSHeapSize / 1048576)} MB` : ''}`, 'bilgi');
    });
    return K;
  }

  /* Her karede: arka plan keşfi ve bilgi satırı */
  guncelle(dt) {
    const k = this.kesif;
    if (k) {
      const o = this.oyun();
      if (!o || o !== k.o) this.kesif = null;
      else {
        for (let i = 0; i < 3 && k.n < k.l.length; i++, k.n++) {
          const [cx, cz] = k.l[k.n];
          if (!o.harita.parcalar.has(cx + ',' + cz)) o.harita.ekle(cx, cz, parcaHesapla(o.dunya.uretici.parcaUret(cx, cz)));
        }
        if (k.n >= k.l.length) { this.kesif = null; this.tamam(`Keşif tamamlandı: ${k.top} parça.`); }
      }
    }
    if (!this.acik) return;
    this.bilgiSayac -= dt;
    if (this.bilgiSayac <= 0) { this.bilgiSayac = 0.25; this.bilgiGuncelle(); }
  }
  bilgiGuncelle() {
    const o = this.oyun();
    if (!o) return;
    const P = o.oyuncu.konum, k = o.dunya.uretici.kolon(Math.floor(P.x), Math.floor(P.z), {});
    const bayrak = [o.hayatta.olumsuz ? 'ölümsüz' : '', o.oyuncu.ucus ? 'uçuyor' : '', o.oyuncu.hizCarpani !== 1 ? `hız ${o.oyuncu.hizCarpani}×` : '', (o.zamanHizi || 1) !== 1 ? `zaman ${o.zamanHizi}×` : '', this.kesif ? `keşif ${Math.round(this.kesif.n / Math.max(1, this.kesif.top) * 100)}%` : ''].filter(Boolean).join(' · ');
    $('#konsolBilgi').textContent = `${this.arayuz.fpsMetni()} · X ${P.x.toFixed(1)} Y ${P.y.toFixed(1)} Z ${P.z.toFixed(1)} · ${BIYOMLAR[k.b]} · canlı ${o.varliklar.liste.length} · parça ${o.dunya.parcalar.size}${o.ag ? (o.istemci ? ' · istemci' : ' · sunucu') : ''}${bayrak ? ' · ' + bayrak : ''}`;
  }
}
