/* HungerMan - geliştirici modu penceresi (F9): komut yazmadan kullanılan test penceresi
   Geliştirici kodu konsolda girildikten sonra açılır. Sol taraftaki sekmeler konulara göre ayrılmıştır; her sekme
   başlıklı bölümlerden oluşur. İşlemler konsol komutları üzerinden yürür (aynı izin kuralları geçerlidir ve konsol
   kaydına yazılır); anahtarlar ve kaydırıcılar değerleri hemen uygular ve pencere her açılışta gerçek durumu gösterir. */
import { ESYALAR, BLOKLAR, ETKILER } from '../bloklar.js';
import { TURLER } from '../varlik/turler.js';
import { BIYOMLAR } from '../dunya/uretici.js';
import { koylerAlan } from '../dunya/koy-uretici.js';
import { simge } from '../grafik/doku.js';
import { THREE } from '../grafik/sahne.js';
import { YER_RENKLERI } from './harita-ekrani.js';
import { PB, PY, SURUM } from '../sabitler.js';

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const kucuk = s => String(s).toLocaleLowerCase('tr');
const sure = sn => { const s = Math.ceil(sn); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
/* 0.23.0: sekmeler yeniden düzenlendi; tekrar eden bölümler kaldırıldı. Sık kullanılan işlemler sağ tıkla sabitlenir,
   üstteki arama kutusu tüm sekmelerdeki işlemleri bulur. */
const SEKMELER = [
  ['sik', '★ Sık kullanılan', 'Sağ tıkla sabitlenen işlemler'],
  ['oyuncu', 'Oyuncu', 'Yetenekler, can ve açlık, deneyim, iksir etkileri'],
  ['hayatta', 'Hayatta Kalma', 'Hasar ve durumlar, vücut ısısı, gök olayları, başarımlar'],
  ['esya', 'Eşyalar', 'Eşya verme, hazır setler, envanter işlemleri'],
  ['dunya', 'Dünya', 'Zaman, hava, arazi, bakılan blok, tekneler'],
  ['harita', 'Harita', 'Keşif, tüm haritayı açma, işaretler'],
  ['canli', 'Canlılar', 'Doğurma, kaldırma, davranış, hayvancılık'],
  ['isinla', 'Işınlanma', 'Yerler, biyomlar, koordinat, köyler, oyuncular'],
  ['koy', 'Köy ve Görev', 'İtibar, takaslar, köylüler, görevler'],
  ['gorsel', 'Görüntü', 'Görünüm seçenekleri, göstergeler, ekran görüntüsü'],
  ['bilgi', 'Bilgi', 'Performans grafiği ve teknik bilgiler']
];
const SAKLA = 'hungerman_gelistirici_sekme', SIK = 'hungerman_gelistirici_sik';

/* Eşya kategorileri */
const KATEGORI = [['hepsi', 'Hepsi'], ['blok', 'Bloklar'], ['alet', 'Aletler'], ['zirh', 'Zırh'], ['yiyecek', 'Yiyecek ve iksir'], ['diger', 'Diğer']];
function kategori(e) { if (e.zirh) return 'zirh'; if (e.tur === 'blok') return 'blok'; if (e.tur === 'alet' || e.tur === 'yay' || e.tur === 'olta') return 'alet'; if (e.tur === 'yiyecek' || e.tur === 'iyilestir' || e.tur === 'iksir' || e.yenir) return 'yiyecek'; return 'diger'; }

/* Hazır setler: [eşya numarası, adet] */
const SETLER = {
  baslangic: { ad: 'Başlangıç', esya: [[304, 1], [305, 1], [306, 1], [307, 1], [293, 16], [46, 32], [32, 1], [33, 1], [47, 1]] },
  elmas: { ad: 'Elmas donanım', esya: [[316, 1], [317, 1], [318, 1], [319, 1], [286, 1], [287, 64], [412, 1], [413, 1], [414, 1], [415, 1], [290, 8]] },
  insaat: { ad: 'İnşaat', esya: [[14, 64], [38, 64], [35, 64], [37, 64], [34, 64], [51, 64], [46, 64], [50, 4]] },
  yapi: { ad: 'Yapı blokları', esya: [[70, 32], [82, 32], [78, 32], [86, 32], [88, 4], [121, 4], [104, 32], [105, 2], [109, 32], [110, 16]] },
  maden: { ad: 'Madenci', esya: [[312, 1], [313, 1], [314, 1], [46, 64], [276, 16], [408, 1], [409, 1], [410, 1], [411, 1]] },
  denizci: { ad: 'Denizci', esya: [[454, 1], [455, 1], [453, 1], [456, 1], [457, 1], [298, 16]] },
  ciftci: { ad: 'Çiftçi', esya: [[343, 1], [292, 32], [328, 16], [329, 16], [291, 32], [104, 32], [105, 2], [296, 16]] },
  efsane: { ad: 'Boss ganimetleri', esya: [[458, 1], [459, 1], [460, 1], [461, 1], [287, 64]] },
  buyu: { ad: 'Büyü', esya: [[156, 1], [61, 32], [139, 1], [316, 1], [319, 1], [286, 1], [453, 1], [412, 1], [415, 1]] },
  simya: { ad: 'Simya ve örs', esya: [[140, 1], [139, 1], [331, 16], [61, 8], [283, 8], [265, 16], [297, 8], [299, 4], [263, 4], [450, 4], [296, 8], [328, 8], [257, 8]] },
  tuccar: { ad: 'Tüccar', esya: [[288, 64], [291, 40], [271, 12], [257, 24], [8, 24], [282, 12], [297, 12]] }
};

export class GelistiriciPenceresi {
  constructor(o) {
    Object.assign(this, o); // ses, konsol, sahne, oyun(), kapatIste, arayuz: { fovAyarla(v), fpsAc(v), hataAc(v), miniAc(v), haritaAc(), konsolAc() }
    this.acik = false; this.arama = ''; this.kat = 'hepsi'; this.adet = 1; this.sayac = 0;
    this.dogurAdet = 1; this.yavru = false; this.kesifR = 256; this.etkiSure = 180; this.alanR = 8; this.bicimler = {};
    try { this.sekme = localStorage.getItem(SAKLA) || 'oyuncu'; } catch (e) { this.sekme = 'oyuncu'; }
    if (!SEKMELER.some(s => s[0] === this.sekme)) this.sekme = 'oyuncu';
    this.kareler = new Float32Array(180); this.kareSira = 0;
    this.sinir = null;   // parça sınırı çizgileri
    this.kok = $('#gelistirici');
    try { this.sik = JSON.parse(localStorage.getItem(SIK) || '[]'); } catch (e) { this.sik = []; }
    if (!Array.isArray(this.sik)) this.sik = [];
    this.genelArama = '';
    const ga = $('#gelGenelAra');
    ga.addEventListener('input', () => { this.genelArama = ga.value; this.ciz(); });
    ga.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') { if (ga.value) { ga.value = ''; this.genelArama = ''; this.ciz(); } else this.kapatIste(); } });
    this.kok.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') { e.preventDefault(); ga.focus(); ga.select(); } });
    /* Sağ tık: işlemi sık kullanılanlara ekle / çıkar */
    $('#gelIcerik').addEventListener('contextmenu', e => {
      const b = e.target.closest('button[data-k], button[data-onay], button[data-etki], button[data-dogur], button[data-set], label.gelAnahtar');
      if (!b) return;
      e.preventDefault();
      const html = b.outerHTML.replace(/ checked=""/g, '').replace(/ class="on"/g, ''), anahtar = b.dataset.k || b.dataset.onay || b.dataset.etki || b.dataset.dogur || b.dataset.set || (b.querySelector('[data-a]') || {}).dataset?.a;
      const i = this.sik.findIndex(s => s.a === anahtar);
      if (i >= 0) { this.sik.splice(i, 1); this.mesaj('Sık kullanılanlardan çıkarıldı.', 'soluk'); }
      else { if (this.sik.length >= 40) { this.mesaj('En çok 40 işlem sabitlenebilir.', 'hata'); return; } this.sik.push({ a: anahtar, h: html }); this.mesaj('Sık kullanılanlara eklendi (★ sekmesi).', 'tamam'); }
      try { localStorage.setItem(SIK, JSON.stringify(this.sik)); } catch (x) { /* depolama kapalı */ }
      this.ses.tik(); if (this.sekme === 'sik') this.ciz();
    });
    $('#gelSekme').innerHTML = SEKMELER.map(([k, a]) => `<button type="button" data-s="${k}">${a}</button>`).join('');
    $('#gelSekme').addEventListener('click', e => { const b = e.target.closest('button[data-s]'); if (!b) return; this.sekme = b.dataset.s; try { localStorage.setItem(SAKLA, this.sekme); } catch (x) { /* depolama kapalı */ } this.ses.tik(); this.ciz(); $('#gelIcerik').scrollTop = 0; });
    $('#gelKapat').addEventListener('click', () => this.kapatIste());
    this.kok.addEventListener('mousedown', e => { if (e.target === this.kok) this.kapatIste(); });
    const ic = $('#gelIcerik');
    ic.addEventListener('click', e => this.tikla(e));
    ic.addEventListener('input', e => this.girdi(e));
    ic.addEventListener('change', e => this.degisti(e));
    ic.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') this.kapatIste(); if (e.key === 'Enter' && e.target.closest('.gelKoord')) this.git(); });
    ic.addEventListener('mouseover', e => { const b = e.target.closest('[data-ver]'); if (b) $('#gelNotEsya') && ($('#gelNotEsya').textContent = `${ESYALAR[+b.dataset.ver].ad} (${b.dataset.ver}) · tık: ${this.adet} adet · Shift + tık: 64 adet`); });
    this.konsol.mesajDinle = (m, sinif) => { const el = $('#gelMesaj'); el.textContent = m; el.className = 'gelMesaj ' + sinif; };
    this.anahtarlar = this.anahtarlariKur();
  }
  ac() { this.acik = true; this.kok.hidden = false; this.mesaj('Değişiklikler hemen uygulanır ve konsol kaydına da yazılır (F8).', 'soluk'); this.ciz(); }
  kapat() { this.acik = false; this.kok.hidden = true; }
  k(s) { this.konsol.calistir(s); this.ses.tik(); }
  izin(o) { if (!o.komutlar) { this.mesaj('Bu dünyada komutlar kapalı.', 'hata'); return false; } return true; }
  mesaj(m, sinif = '') { const el = $('#gelMesaj'); el.textContent = m; el.className = 'gelMesaj ' + sinif; }

  /* ---------- Anahtarlar: al = şu anki durum; komut = konsol komutu (aç / kapat); koy = doğrudan ayar ---------- */
  anahtarlariKur() {
    const S = this.sahne, govde = document.body;
    return {
      olumsuz: { ad: 'Ölümsüzlük', alt: 'Hiç hasar alınmaz', al: o => !!o.hayatta.olumsuz, komut: 'olumsuz' },
      ucus: { ad: 'Uçma', alt: 'Boşluk yükselir, C alçalır', al: o => !!o.oyuncu.ucus, komut: 'ucus' },
      hayalet: { ad: 'Duvardan geçme', alt: 'Uçarken bloklardan geçilir', al: o => !!o.oyuncu.hayalet, hile: true, koy: (o, v) => { o.oyuncu.hayalet = v; if (v) o.oyuncu.ucus = true; } },
      aninda: { ad: 'Anında kırma', alt: 'Her blok tek vuruşta kırılır', al: o => !!o.etkilesim.aninda, hile: true, koy: (o, v) => { o.etkilesim.aninda = v; } },
      sinirsiz: { ad: 'Sınırsız eşya', alt: 'Koyma, üretim ve ticarette azalmaz; aletler yıpranmaz', al: o => !!o.envanter.sinirsiz, hile: true, koy: (o, v) => { o.envanter.sinirsiz = v; } },
      tok: { ad: 'Açlık azalmasın', alt: 'Hareket ve zaman açlığı etkilemez', al: o => !!o.hayatta.tok, komut: 'tok' },
      baris: { ad: 'Barış', alt: 'Canavarlar ve öfkeli hayvanlar saldırmaz', al: o => !!o.varliklar.barisci, komut: 'baris' },
      dogurma: { ad: 'Canlı doğmasını durdur', alt: 'Yeni hayvan ve canavar çıkmaz', al: o => !!o.varliklar.dogurmaKapali, hile: true, sunucu: true, koy: (o, v) => { o.varliklar.dogurmaKapali = v; } },
      donmus: { ad: 'Canlıları dondur', alt: 'Yapay zekâ ve hareket durur', al: o => !!o.varliklar.donmus, hile: true, sunucu: true, koy: (o, v) => { o.varliklar.donmus = v; } },
      yavru: { ad: 'Yavru olarak doğur', alt: 'Yalnızca beslenebilen hayvanlar', al: () => this.yavru, koy: (o, v) => { this.yavru = v; } },
      havaKilit: { ad: 'Hava değişmesin', alt: 'Seçilen hava kendiliğinden değişmez', al: o => !!o.hava.kilit, komut: 'hava kilit' },
      zamanDur: { ad: 'Zamanı durdur', alt: 'Gün döngüsü ilerlemez', al: o => o.zamanHizi === 0, komutFn: v => `zaman hiz ${v ? 0 : 1}` },
      tel: { ad: 'Tel kafes görünümü', alt: 'Dünya geometrisi çizgilerle çizilir', al: () => !!S.opakMalzeme.wireframe, koy: (o, v) => { S.opakMalzeme.wireframe = v; S.suMalzeme.wireframe = v; } },
      aydinlik: { ad: 'Tam aydınlık', alt: 'Mağaralar ve gece aydınlık görünür', al: () => !!S.tamAydinlik, koy: (o, v) => { S.tamAydinlik = v; } },
      sis: { ad: 'Sisi kapat', alt: 'Uzaklık sisi çizilmez', al: () => !!S.sisKapali, koy: (o, v) => { S.sisKapali = v; } },
      sinir: { ad: 'Parça sınırları', alt: 'Bulunulan parçanın (16 × 16) kenarları', al: () => !!this.sinir, koy: (o, v) => this.sinirAyarla(v) },
      el: { ad: 'Eli gizle', alt: 'Elde tutulan eşya çizilmez', al: () => !S.el.visible, koy: (o, v) => { S.el.visible = !v; } },
      hud: { ad: 'Göstergeyi gizle', alt: 'Pusula, çubuk ve harita gizlenir', al: () => govde.classList.contains('gostergesiz'), koy: (o, v) => govde.classList.toggle('gostergesiz', v) },
      fps: { ad: 'Kare hızı göstergesi', alt: 'Sol altta FPS', al: () => !$('#fps').hidden, koy: (o, v) => this.arayuz.fpsAc(v) },
      f3: { ad: 'Teknik bilgi paneli', alt: 'F3 paneli', al: () => !$('#hata').hidden, koy: (o, v) => this.arayuz.hataAc(v) },
      mini: { ad: 'Mini harita', alt: 'Sağ altta', al: () => !$('#miniHarita').hidden, koy: (o, v) => this.arayuz.miniAc(v) }
    };
  }
  anahtar(ad, o) { const A = this.anahtarlar[ad]; return `<label class="gelAnahtar"><input type="checkbox" data-a="${ad}" ${A.al(o) ? 'checked' : ''}><i></i><span><b>${A.ad}</b><small>${A.alt}</small></span></label>`; }
  anahtarGrubu(o, ...adlar) { return `<div class="gelIzgara">${adlar.map(a => this.anahtar(a, o)).join('')}</div>`; }
  kaydirici(ad, baslik, min, max, adim, deger, bicim) {
    this.bicimler[ad] = bicim;
    return `<label class="gelKaydir"><span>${baslik} <b data-d="${ad}">${bicim(+deger)}</b></span><input type="range" data-r="${ad}" min="${min}" max="${max}" step="${adim}" value="${deger}"></label>`;
  }
  bolum(baslik, icerik, not = '') { return `<section class="gelBolum"><h4>${baslik}</h4>${not ? `<p class="gelNot">${not}</p>` : ''}${icerik}</section>`; }
  dugme(komut, ad, sinif = '') { return `<button type="button" data-k="${esc(komut)}"${sinif ? ` class="${sinif}"` : ''}>${ad}</button>`; }
  onay(komut, ad) { return `<button type="button" data-onay="${esc(komut)}" class="tehlike">${ad}</button>`; }
  dugmeler(...l) { return `<div class="gelDugmeler">${l.join('')}</div>`; }

  /* ---------- Çizim ---------- */
  ciz() {
    if (!this.acik) return;
    const o = this.oyun();
    if (!o) return;
    [...$('#gelSekme').children].forEach(b => b.classList.toggle('on', b.dataset.s === this.sekme));
    $('#gelDurum').textContent = `${o.ad} · ${o.istemci ? 'çok oyunculu istemci (yalnız kişisel işlemler)' : o.ag ? 'çok oyunculu sunucu' : 'tek oyunculu'}`;
    const S = SEKMELER.find(s => s[0] === this.sekme);
    this.son = {};
    if (this.genelArama.trim()) { $('#gelIcerik').innerHTML = this.aramaSonucu(o, this.genelArama); this.canliYaz(o); return; }
    const f = { sik: this.sikSekmesi, hayatta: this.hayattaSekmesi, oyuncu: this.oyuncuSekmesi, esya: this.esyaSekmesi, dunya: this.dunyaSekmesi, harita: this.haritaSekmesi, canli: this.canliSekmesi, isinla: this.isinlaSekmesi, koy: this.koySekmesi, gorsel: this.gorselSekmesi, bilgi: this.bilgiSekmesi }[this.sekme];
    this.son = {};
    $('#gelIcerik').innerHTML = `<div class="gelBaslik"><h3>${S[1]}</h3><span>${S[2]}</span></div>` + f.call(this, o);
    this.canliYaz(o);
    if (this.sekme === 'esya') { const g = $('#gelAra'); if (g && this.aramaOdak) { g.focus(); g.setSelectionRange(g.value.length, g.value.length); } }
  }

  oyuncuSekmesi(o) {
    const h = o.hayatta, P = o.oyuncu, d = o.dogum;
    return this.bolum('Yetenekler', this.anahtarGrubu(o, 'olumsuz', 'ucus', 'hayalet', 'aninda', 'sinirsiz', 'tok')) +
      this.bolum('Can ve hareket',
        this.kaydirici('can', 'Can', 1, 20, 1, h.can, v => v / 2 + ' kalp') +
        this.kaydirici('aclik', 'Açlık', 0, 20, 1, h.aclik, v => v / 2 + ' / 10') +
        this.kaydirici('hiz', 'Hareket hızı', 0.2, 5, 0.1, P.hizCarpani, v => v.toFixed(1) + '×') +
        this.kaydirici('erisim', 'Blok erişim mesafesi', 5, 40, 1, o.etkilesim.erisim || 5, v => v + ' blok') +
        this.dugmeler(this.dugme('iyiles', 'Tamamen iyileş'), this.dugme('doy', 'Doyur'))) +
      this.bolum('Deneyim', `<p class="gelDeger" id="gelXp"></p>` +
        this.dugmeler(this.dugme('xp seviye 1', '+1 seviye'), this.dugme('xp seviye 5', '+5 seviye'), this.dugme('xp seviye 10', '+10 seviye'), this.dugme('xp sifirla', 'Sıfırla'))) +
      this.bolum('İksir etkileri',
        this.kaydirici('etkiSure', 'Verilecek etkinin süresi', 30, 900, 30, this.etkiSure, v => sure(v)) +
        `<div class="gelDugmeler" id="gelEtkiler">${Object.entries(ETKILER).map(([k, e]) => `<button type="button" data-etki="${k}"><i style="background:${e.renk}"></i>${e.ad}<em></em></button>`).join('')}${this.dugme('etki temizle', 'Etkileri kaldır')}</div>`) +
      this.bolum('Doğma noktası', `<p class="gelDeger">X ${Math.round(d.x)} · Y ${Math.round(d.y)} · Z ${Math.round(d.z)}</p>` +
        this.dugmeler(this.dugme('dogum', 'Bulunulan yere ayarla')), 'Doğma noktasına gitmek için Işınlanma sekmesi kullanılır.');
  }
  /* 0.23.0: hayatta kalma sınamaları */
  hayattaSekmesi(o) {
    const h = o.hayatta;
    return this.bolum('Hasar ve durumlar',
        this.dugmeler(this.dugme('hasar 4', '2 kalp hasar ver'), this.dugme('durum zehir', 'Mide bulantısı'), this.dugme('durum agu', 'Örümcek zehri'), this.dugme('durum yanma', 'Yanma'), this.dugme('durum kanama', 'Kanama'), this.dugme('durum kirik', 'Kırık bacak'), this.dugme('durum temizle', 'Durumları kaldır'), this.onay('hasar 99', 'Oyuncuyu öldür')),
        'Hasar düğmeleri ölümsüzlük açıkken de etki eder.') +
      this.bolum('Vücut ısısı', `<p class="gelDeger" id="gelIsi"></p>` +
        this.kaydirici('vucut', 'Vücut ısısı', 30, 42, 0.5, Math.round(h.vucut * 2) / 2, v => v.toFixed(1).replace('.', ',') + ' °C') +
        this.dugmeler(this.dugme('isi 33.5', 'Dondur'), this.dugme('isi 40', 'Sıcak çarpması'), this.dugme('isi 37', 'Normale döndür')),
        h.isiAcik ? 'Ayarlardan kapatılabilir.' : 'Vücut ısısı ayarlardan kapatılmış; değerler etkisizdir.') +
      this.bolum('Gök olayları', this.dugmeler(this.dugme('kanliay', 'Kanlı Ay başlat'), this.dugme('meteor', 'Meteor düşür'), this.dugme('zaman gece', 'Geceye geç'))) +
      this.bolum('Başarımlar', this.dugmeler(this.dugme('basarim liste', 'Durumu göster'), this.dugme('basarim hepsi', 'Tümünü ver'), this.onay('basarim sifirla', 'Sıfırla')));
  }
  /* 0.23.0: sık kullanılanlar */
  sikSekmesi(o) {
    if (!this.sik.length) return '<p class="gelNot">Henüz sabitlenen işlem yok. Herhangi bir sekmedeki düğmeye ya da anahtara <b>sağ tıklanarak</b> buraya eklenir; tekrar sağ tıklanınca çıkarılır.</p>';
    const anahtarlar = this.sik.filter(s => s.h.startsWith('<label')), dugmeler = this.sik.filter(s => !s.h.startsWith('<label'));
    const tazele = s => { const a = /data-a="([^"]+)"/.exec(s.h); return a && this.anahtarlar[a[1]] ? this.anahtar(a[1], o) : s.h; };
    return (anahtarlar.length ? this.bolum('Anahtarlar', `<div class="gelIzgara">${anahtarlar.map(tazele).join('')}</div>`) : '') +
      (dugmeler.length ? this.bolum('İşlemler', `<div class="gelDugmeler">${dugmeler.map(s => s.h).join('')}</div>`, 'Sağ tık: listeden çıkar.') : '');
  }
  /* 0.23.0: tüm sekmelerde arama: eşleşen düğme ve anahtarlar bulundukları sekmeyle listelenir */
  aramaSonucu(o, a) {
    const q = kucuk(a.trim()), kap = document.createElement('div'), sonuc = [];
    for (const [k, ad] of SEKMELER) {
      if (k === 'sik' || k === 'bilgi') continue;
      const f = this[k + 'Sekmesi'] || { esya: this.esyaSekmesi, dunya: this.dunyaSekmesi, harita: this.haritaSekmesi, canli: this.canliSekmesi, isinla: this.isinlaSekmesi, koy: this.koySekmesi, gorsel: this.gorselSekmesi }[k];
      if (!f) continue;
      const kayit = this.arama; this.arama = '';
      kap.innerHTML = f.call(this, o); this.arama = kayit;
      const l = [...kap.querySelectorAll('button[data-k], button[data-onay], button[data-etki], button[data-dogur], button[data-set], label.gelAnahtar')]
        .filter(b => kucuk(b.textContent).includes(q) || kucuk(b.title || '').includes(q) || kucuk(b.closest('section')?.querySelector('h4')?.textContent || '').includes(q));
      if (l.length) sonuc.push(this.bolum(`${ad}`, `<div class="gelDugmeler gelAramaSonuc">${l.map(b => b.outerHTML).join('')}</div>`));
    }
    return `<div class="gelBaslik"><h3>Arama: “${esc(a.trim())}”</h3><span>Sağ tık: sık kullanılanlara ekle</span></div>` + (sonuc.join('') || '<p class="gelNot">Eşleşen işlem yok.</p>');
  }

  esyaSekmesi(o) {
    const a = kucuk(this.arama);
    const l = Object.entries(ESYALAR).filter(([, e]) => e && e.ad && !e.gizli && (this.kat === 'hepsi' || kategori(e) === this.kat) && (!a || kucuk(e.ad).includes(a) || String(e.id) === a));
    return this.bolum('Hazır setler', `<div class="gelDugmeler">${Object.entries(SETLER).map(([k, s]) => `<button type="button" data-set="${k}" title="${esc(s.esya.map(([i, n]) => `${ESYALAR[i] ? ESYALAR[i].ad : i} × ${n}`).join(', '))}">${s.ad}</button>`).join('')}</div>`) +
      this.bolum('Envanter işlemleri', this.dugmeler(this.dugme('onar', 'Tüm eşyaları onar'), this.dugme('eldeki doldur', 'Eldeki yığını doldur'), this.dugme('eldeki sil', 'Eldekini sil'), this.onay('envanter temizle', 'Envanteri boşalt'))) +
      this.bolum('Büyü', this.dugmeler(this.dugme('buyu hepsi', 'Eldekini en yüksek büyülerle büyüle'), this.dugme('buyu temizle', 'Eldekinin büyülerini kaldır'), this.dugme('buyu liste', 'Büyüleri listele')),
        'Tek büyü için konsolda: buyu <büyü> [seviye]') +
      this.bolum('Eşya ver', `
        <div class="gelSatir"><input type="search" id="gelAra" placeholder="Eşya adı ya da numarası" value="${esc(this.arama)}" autocomplete="off">
          <span class="gelAdet" title="Tıklamada verilecek adet">${[1, 8, 16, 64].map(n => `<button type="button" data-adet="${n}" class="${this.adet === n ? 'on' : ''}">${n}</button>`).join('')}</span></div>
        <div class="gelCipler">${KATEGORI.map(([k, ad]) => `<button type="button" data-kat="${k}" class="${this.kat === k ? 'on' : ''}">${ad}</button>`).join('')}</div>
        <p class="gelNot" id="gelNotEsya">${l.length} eşya · Üzerine gelinen eşyanın adı burada görünür.</p>
        <div class="gelEsyalar">${l.map(([i, e]) => `<button type="button" data-ver="${i}" title="${esc(e.ad)} (${i})"><img src="${simge(+i).url}" alt=""></button>`).join('')}</div>`);
  }

  dunyaSekmesi(o) {
    const saat = ((o.zaman * 24 + 6) % 24);
    const bloklar = BLOKLAR.filter(b => b && b.ad && b.id > 0 && !b.gizli);
    return this.bolum('Zaman',
        this.kaydirici('saat', 'Saat', 0, 23.75, 0.25, Math.round(saat * 4) / 4, v => `${String(Math.floor(v)).padStart(2, '0')}:${String(Math.round((v % 1) * 60)).padStart(2, '0')}`) +
        this.dugmeler(...[['safak', 'Şafak'], ['sabah', 'Sabah'], ['ogle', 'Öğle'], ['aksam', 'Akşam'], ['gece', 'Gece'], ['gece_yarisi', 'Gece yarısı']].map(([k, a]) => this.dugme('zaman ' + k, a))) +
        this.kaydirici('zhiz', 'Zaman hızı', 0, 100, 1, o.zamanHizi ?? 1, v => v === 0 ? 'durdu' : v + '×') +
        this.anahtarGrubu(o, 'zamanDur') +
        `<div class="gelSatir"><label>Gün <input type="number" id="gelGun" min="1" max="9999" value="${o.gun}"></label><button type="button" data-gun="1">Uygula</button><span class="gelNot">Canavar sayısı gün sayısıyla artar.</span></div>`) +
      this.bolum('Hava durumu', `<div class="gelDugmeler" id="gelHava">${[['acik', 'Açık'], ['yagmur', 'Yağmur'], ['firtina', 'Fırtına']].map(([k, a]) => `<button type="button" data-k="hava ${k}" data-hava="${k}">${a}</button>`).join('')}${this.dugme('hava simsek', 'Şimşek çaktır')}</div>` +
        this.anahtarGrubu(o, 'havaKilit')) +
      this.bolum('Arazi ve bitkiler',
        this.kaydirici('alan', 'Düzlenecek alanın yarıçapı', 2, 16, 1, this.alanR, v => `${v * 2 + 1} × ${v * 2 + 1} blok`) +
        this.dugmeler(`<button type="button" data-duzle="1" class="tehlike">Çevreyi düzle</button>`, this.dugme('buyut', 'Ekinleri ve fidanları büyüt')),
        'Düzleme, ayak hizasının üstünü boşaltır ve zemini çimenle kaplar; geri alınamaz.') +
      this.bolum('Bakılan blok', `<p class="gelDeger" id="gelBakilan"></p>
        <div class="gelSatir"><button type="button" data-blokver="1">Eşyasını ver</button><button type="button" data-k="blok 0">Kaldır</button>
          <select id="gelBlokSec">${bloklar.map(b => `<option value="${b.id}">${esc(b.ad)} (${b.id})</option>`).join('')}</select><button type="button" data-blokdegis="1">Bununla değiştir</button></div>`) +
      this.bolum('Tekneler', this.dugmeler(this.dugme('tekne sandal', 'Sandal koy'), this.dugme('tekne yelkenli', 'Yelkenli koy'), this.onay('tekne temizle', 'Boş tekneleri kaldır')), 'Tekne, bakılan su yüzeyine konur.') +
      this.bolum('Bakım', this.dugmeler(this.dugme('esya temizle', 'Yerdeki eşyaları temizle'), this.dugme('yenile', 'Parçaları yeniden çiz'), this.dugme('kaydet', 'Hemen kaydet')));
  }

  haritaSekmesi(o) {
    return this.bolum('Keşif durumu', '<p class="gelDeger" id="gelHaritaDurum"></p><div id="gelKesif"></div>') +
      this.bolum('Haritayı aç',
        this.kaydirici('kesif', 'Keşfedilecek yarıçap', 64, 2048, 64, this.kesifR, v => v + ' blok') +
        this.dugmeler(`<button type="button" data-kesfet="1">Çevreyi keşfet</button>`, this.onay('kesfet tumu', 'Tüm haritayı görünür yap')),
        'Keşif arka planda yapılır; oyun sürerken harita dolar. Tüm harita, dünya sınırına (haritadaki kesik çizgili kare) kadar açılır; birkaç dakika sürer ve belleği yoğun kullanır.') +
      this.bolum('Harita ekranı', this.dugmeler(`<button type="button" data-harita="1">Büyük haritayı aç</button>`, this.onay('harita temizle', 'Haritayı sıfırla')),
        'Büyük haritada Ctrl + tık ile tıklanan yere ışınlanılır.') +
      this.bolum('İşaretler', `<div class="gelListe">${(o.yerler || []).map((y, i) => `<div><i style="background:${esc(y.renk)}"></i><b>${esc(y.ad)}</b><span>X ${y.x} · Z ${y.z}</span><button type="button" data-yer="${i}">Git</button><button type="button" data-yersil="${i}" aria-label="Sil">✕</button></div>`).join('') || '<p class="gelNot">İşaret eklenmemiş.</p>'}</div>` +
        this.dugmeler(`<button type="button" data-yerekle="1">Bulunulan yere işaret ekle</button>`, (o.yerler || []).length ? `<button type="button" data-yertemizle="1" class="tehlike">Tüm işaretleri sil</button>` : ''));
  }

  canliSekmesi(o) {
    const turler = Object.keys(TURLER).filter(t => !TURLER[t].koylu);
    const grup = (f, sinif = '') => turler.filter(f).map(t => `<button type="button" data-dogur="${t}"${sinif ? ` class="${sinif}"` : ''}>${esc(TURLER[t].ad)}</button>`).join('');
    return this.bolum('Davranış', this.anahtarGrubu(o, 'baris', 'dogurma', 'donmus')) +
      this.bolum('Doğur',
        this.kaydirici('dadet', 'Adet', 1, 20, 1, this.dogurAdet, v => v) + this.anahtarGrubu(o, 'yavru') +
        `<h5>Hayvanlar</h5><div class="gelDugmeler">${grup(t => !TURLER[t].dusman && !TURLER[t].su)}</div>
         <h5>Deniz canlıları</h5><div class="gelDugmeler">${grup(t => TURLER[t].su && !TURLER[t].dusman)}</div>
         <h5>Düşmanlar</h5><div class="gelDugmeler">${grup(t => TURLER[t].dusman, 'dusman')}</div>`,
        'Canlı, bakılan yönde yaklaşık 4 blok ileride doğar (deniz canlıları için suya bakılmalıdır).') +
      this.bolum('Hayvancılık', this.dugmeler(this.dugme('hayvan besle', 'Çevredeki hayvanları besle'), this.dugme('hayvan buyut', 'Yavruları büyüt')), 'Beslenen aynı türden iki hayvan yavru yapar.') +
      this.bolum('Kaldır', this.dugmeler(this.dugme('oldur dusman', 'Düşmanlar'), this.dugme('oldur hayvan', 'Hayvanlar'), this.dugme('oldur deniz', 'Deniz canlıları'), this.onay('oldur hepsi', 'Hepsi (köylüler hariç)'))) +
      this.bolum('Çevredeki canlılar', '<div id="gelSayim" class="gelSayim"></div>');
  }

  isinlaSekmesi(o) {
    const P = o.oyuncu.konum;
    const koyler = koylerAlan(o.dunya.uretici, P.x - 1500, P.z - 1500, P.x + 1500, P.z + 1500).map(k => ({ k, d: Math.hypot(k.x - P.x, k.z - P.z) })).sort((a, b) => a.d - b.d).slice(0, 10);
    const oyuncular = o.ag && o.ag.uzak ? [...o.ag.uzak.harita.values()].filter(u => !u.ilk) : [];
    return this.bolum('Yerler', this.dugmeler(this.dugme('isinla koy', 'En yakın köy'), this.dugme('isinla liman', 'En yakın liman'), this.dugme('isinla zindan', 'En yakın zindan'), this.dugme('isinla maden', 'En yakın maden'), this.dugme('isinla tapinak', 'Çöl tapınağı'), this.dugme('isinla ormantapinak', 'Orman tapınağı'), this.dugme('isinla kule', 'Buzul kulesi'), this.dugme('isinla kamp', 'Haydut kampı'), this.dugme('boss liste', 'Boss yerleri'), this.dugme('isinla batik', 'En yakın batık'),
        this.dugme('isinla dogum', 'Doğma noktası'), o.olumNoktasi ? this.dugme('isinla olum', 'Son ölüm noktası') : '', this.dugme('isinla ~ ~', 'Yüzeye çık'), this.dugme('isinla geri', 'Önceki konuma dön'))) +
      this.bolum('Biyomlar', this.dugmeler(...BIYOMLAR.map(b => this.dugme('isinla biyom ' + b.replace(/ /g, '_'), b))), 'Seçilen biyomun en yakın noktasına ışınlar.') +
      this.bolum('Koordinat', `<div class="gelSatir gelKoord"><label>X <input type="number" id="gelX" value="${Math.round(P.x)}"></label><label>Y <input type="number" id="gelY" placeholder="zemin"></label><label>Z <input type="number" id="gelZ" value="${Math.round(P.z)}"></label><button type="button" data-git="1">Git</button></div>` +
        this.dugmeler(...[['Kuzey', '~ ~-100'], ['Güney', '~ ~100'], ['Doğu', '~100 ~'], ['Batı', '~-100 ~']].map(([a, k]) => this.dugme('isinla ' + k, a + ' 100 blok')), this.dugme('isinla ~ ~40 ~', '40 blok yukarı'), `<button type="button" data-harita="1">Haritadan seç (Ctrl + tık)</button>`)) +
      this.bolum('Yakındaki köyler', koyler.length ? this.dugmeler(...koyler.map(({ k, d }) => this.dugme(`isinla ${k.x + 7} ${k.z}`, `${esc(k.ad)}${k.liman ? ' ⚓' : ''} <em>${Math.round(d)} blok</em>`))) : '<p class="gelNot">1500 blok içinde köy yok.</p>') +
      (oyuncular.length ? this.bolum('Oyuncular', this.dugmeler(...oyuncular.map(u => this.dugme('isinla oyuncu ' + u.ad, esc(u.ad) + ` <em>${Math.round(Math.hypot(u.p.x - P.x, u.p.z - P.z))} blok</em>`)))) : '');
  }

  koySekmesi(o) {
    const k = this.konsol.yakinKoy(o), G = o.gorevler, P = o.oyuncu.konum;
    const koy = k ? (() => {
      const d = o.koyler.durum(k.id);
      return `<p class="gelDeger">${esc(k.ad)} · ${o.koyler.icindeki === k ? 'içinde' : Math.round(Math.hypot(k.x - P.x, k.z - P.z)) + ' blok uzakta'} · ${k.koylular.length} köylü${d.olu.length ? ` (${d.olu.length} ölü)` : ''}${k.liman ? ' · limanlı' : ''}</p>
        <p class="gelDeger">İtibar: <b>${d.itibar}</b> (${o.koyler.itibarDerecesi(k.id)})</p>` +
        this.dugmeler(this.dugme('itibar -20', '−20'), this.dugme('itibar -5', '−5'), this.dugme('itibar 0', 'Sıfırla'), this.dugme('itibar +5', '+5'), this.dugme('itibar +20', '+20')) +
        this.dugmeler(this.dugme('koy takas', 'Takasları yenile'), this.dugme('koy dirilt', 'Ölen köylüleri geri getir'), this.dugme(`isinla ${k.x + 7} ${k.z}`, 'Köye ışınlan'));
    })() : '<p class="gelNot">800 blok içinde köy yok.</p>' + this.dugmeler(this.dugme('isinla koy', 'En yakın köye ışınlan'));
    const gorevler = G.aktif.length ? `<div class="gelListe">${G.aktif.map(q => `<div><b>${esc(q.kisa)}</b><span>${q.tur === 'mektup' ? 'mektup teslimi' : G.ilerleme(q, o.envanter) + ' / ' + q.adet} · ${esc(q.koyluAd || '')}</span></div>`).join('')}</div>` : '<p class="gelNot">Etkin görev yok.</p>';
    return this.bolum('En yakın köy', koy, 'İtibar ve takas işlemleri en yakın köye uygulanır.') +
      this.bolum('Görevler', `<p class="gelDeger">Tamamlanan görev: <b>${G.tamamlanan}</b></p>` + gorevler +
        this.dugmeler(this.dugme('gorev tamamla', 'Görevleri teslime hazır yap'), this.onay('gorev birak', 'Görevleri bırak'), this.dugme('ver 288 64', 'Sikke × 64')), 'Teslime hazır yapılan görevlerin ödülü, görevi veren köylüden alınır. Mektup görevleri hedef köye götürülmelidir.');
  }

  gorselSekmesi(o) {
    return this.bolum('Görünüm', this.anahtarGrubu(o, 'aydinlik', 'sis', 'tel', 'sinir', 'el', 'hud')) +
      this.bolum('Göstergeler', this.anahtarGrubu(o, 'fps', 'f3', 'mini')) +
      this.bolum('Kamera ve mesafe',
        this.kaydirici('fov', 'Görüş açısı', 40, 110, 1, Math.round(this.sahne.kamera.fov), v => v + '°') +
        this.kaydirici('gorus', 'Görüş mesafesi', 4, 16, 1, o.dunya.gorus, v => v + ' parça')) +
      this.bolum('Ekran görüntüsü', this.dugmeler(this.dugme('goruntu', 'Ekran görüntüsünü indir')), 'Görüntü, göstergeler olmadan PNG olarak kaydedilir. Eli gizlemek için yukarıdaki anahtar kullanılır.');
  }

  bilgiSekmesi(o) {
    return `<canvas id="gelGrafik" class="gelGrafik" width="680" height="90"></canvas>
      <table class="gelTablo" id="gelTablo"></table>` +
      this.dugmeler(`<button type="button" data-kopya="tohum">Tohumu kopyala (${o.tohum})</button>`, `<button type="button" data-kopya="bilgi">Bilgileri kopyala</button>`, `<button type="button" data-konsol="1">Konsolu aç</button>`);
  }

  /* ---------- Olaylar ---------- */
  git() { const x = $('#gelX').value, y = $('#gelY').value, z = $('#gelZ').value; this.k(y === '' ? `isinla ${x} ${z}` : `isinla ${x} ${y} ${z}`); }
  tikla(e) {
    const o = this.oyun(); if (!o) return;
    const b = e.target.closest('button'); if (!b) return;
    const d = b.dataset;
    if (d.onay || d.duzle || d.yertemizle) {
      if (!d.bekle) { d.bekle = '1'; d.eski = b.textContent; b.textContent = 'Onaylamak için tekrar tıklayınız'; setTimeout(() => { if (b.isConnected && d.bekle) { delete d.bekle; b.textContent = d.eski; } }, 2500); return; }
      delete d.bekle; b.textContent = d.eski;
      if (d.onay) this.k(d.onay);
      else if (d.duzle) this.k(`duzle ${this.alanR}`);
      else { o.yerler.length = 0; this.ses.tik(); this.mesaj('Tüm işaretler silindi.', 'tamam'); }
    }
    else if (d.k) this.k(d.k);
    else if (d.etki) this.k(`etki ${d.etki} ${this.etkiSure}`);
    else if (d.ver) this.k(`ver ${d.ver} ${e.shiftKey ? 64 : this.adet}`);
    else if (d.adet) { this.adet = +d.adet; this.ses.tik(); }
    else if (d.kat) { this.kat = d.kat; this.ses.tik(); }
    else if (d.set) {
      if (!this.izin(o)) return;
      const s = SETLER[d.set]; let sigmayan = 0;
      for (const [i, n] of s.esya) if (ESYALAR[i]) sigmayan += o.envanter.ekle(i, n);
      this.ses.tik(); this.mesaj(`${s.ad} seti verildi.${sigmayan ? ` ${sigmayan} eşya sığmadı.` : ''}`, 'tamam');
    }
    else if (d.dogur) this.k(`dogur ${d.dogur} ${this.dogurAdet}${this.yavru ? ' yavru' : ''}`);
    else if (d.gun) this.k(`gun ${$('#gelGun').value}`);
    else if (d.kesfet) this.k(`kesfet ${this.kesifR}`);
    else if (d.harita) this.arayuz.haritaAc();
    else if (d.konsol) this.arayuz.konsolAc();
    else if (d.git) this.git();
    else if (d.yer) { const y = o.yerler[+d.yer]; if (y) this.k(`isinla ${y.x} ${y.z}`); }
    else if (d.yersil) { o.yerler.splice(+d.yersil, 1); this.ses.tik(); this.mesaj('İşaret silindi.', 'tamam'); }
    else if (d.yerekle) {
      const P = o.oyuncu.konum, n = o.yerler.length;
      if (n >= 40) { this.mesaj('En çok 40 işaret eklenebilir.', 'hata'); return; }
      o.yerler.push({ x: Math.floor(P.x), z: Math.floor(P.z), ad: `İşaret ${n + 1}`, renk: YER_RENKLERI[n % YER_RENKLERI.length] });
      this.ses.tik(); this.mesaj('Bulunulan yere işaret eklendi. Adı büyük haritada değiştirilebilir.', 'tamam');
    }
    else if (d.blokver) { const h = this.bakilan(o); if (!h) { this.mesaj('Bakılan bir blok yok.', 'hata'); return; } const t = BLOKLAR[h.id]; this.k(`ver ${t.gizli && t.taban ? t.taban : h.id} ${this.adet}`); }
    else if (d.blokdegis) this.k(`blok ${$('#gelBlokSec').value}`);
    else if (d.kopya) {
      const metin = d.kopya === 'tohum' ? String(o.tohum) : this.satirlar(o).map(([a, v]) => `${a}: ${v}`).join('\n');
      if (navigator.clipboard) navigator.clipboard.writeText(metin).catch(() => {});
      this.ses.tik(); this.mesaj(d.kopya === 'tohum' ? 'Tohum panoya kopyalandı.' : 'Teknik bilgiler panoya kopyalandı.', 'tamam');
    }
    else return;
    this.ciz();
  }
  girdi(e) {
    const t = e.target, o = this.oyun(); if (!o) return;
    if (t.id === 'gelAra') { this.arama = t.value; this.aramaOdak = true; this.ciz(); this.aramaOdak = false; return; }
    const r = t.dataset.r; if (!r) return;
    const v = +t.value, el = this.kok.querySelector(`[data-d="${r}"]`);
    if (el && this.bicimler[r]) el.textContent = this.bicimler[r](v);
    if (r === 'hiz' && this.izin(o)) o.oyuncu.hizCarpani = v;
    else if (r === 'can' && this.izin(o)) o.hayatta.can = v;
    else if (r === 'aclik' && this.izin(o)) o.hayatta.aclik = v;
    else if (r === 'dadet') this.dogurAdet = v;
    else if (r === 'kesif') this.kesifR = v;
    else if (r === 'etkiSure') this.etkiSure = v;
    else if (r === 'alan') this.alanR = v;
    else if (r === 'fov') this.arayuz.fovAyarla(v);
  }
  degisti(e) {
    const t = e.target, o = this.oyun(); if (!o) return;
    const r = t.dataset.r, a = t.dataset.a, v = +t.value;
    if (r === 'saat') this.k(`zaman ${v}`);
    else if (r === 'zhiz') { this.k(`zaman hiz ${v}`); this.esitle(o); }
    else if (r === 'gorus') this.k(`gorus ${v}`);
    else if (r === 'erisim') this.k(`erisim ${v}`);
    else if (r === 'vucut') this.k(`isi ${v}`);
    if (!a) return;
    const A = this.anahtarlar[a], acik = t.checked;
    if (A.komut || A.komutFn) { if (A.al(o) !== acik) this.k(A.komutFn ? A.komutFn(acik) : A.komut); }
    else if (A.hile && !this.izin(o)) { /* komutlar kapalı */ }
    else if (A.sunucu && o.istemci) this.mesaj('Çok oyunculu istemcide canlıları sunucu yönetir.', 'hata');
    else { A.koy(o, acik); this.ses.tik(); this.mesaj(`${A.ad}: ${acik ? 'açık' : 'kapalı'}.`, 'tamam'); }
    this.esitle(o);
  }
  /* Anahtarları ve bağlı kaydırıcıları gerçek durumla eşitle */
  esitle(o) {
    for (const el of $('#gelIcerik').querySelectorAll('input[data-a]')) { const A = this.anahtarlar[el.dataset.a]; if (A) el.checked = !!A.al(o); }
    const z = $('#gelIcerik').querySelector('input[data-r="zhiz"]');
    if (z) { z.value = o.zamanHizi ?? 1; const el = this.kok.querySelector('[data-d="zhiz"]'); if (el) el.textContent = this.bicimler.zhiz(+z.value); }
  }
  bakilan(o) { return o.etkilesim.isin(o.oyuncu.gozKonumu(), o.oyuncu.bakisYonu()); }

  /* ---------- Parça sınırı çizgileri ---------- */
  sinirAyarla(acik) {
    if (!acik) { if (this.sinir) { this.sahne.sahne.remove(this.sinir); this.sinir.geometry.dispose(); this.sinir.material.dispose(); this.sinir = null; } return; }
    if (this.sinir) return;
    const p = [];
    for (let i = 0; i <= PB; i += 4) for (const [x, z] of [[i, 0], [i, PB], [0, i], [PB, i]]) p.push(x, 0, z, x, PY, z);
    for (let y = 0; y <= PY; y += 8) p.push(0, y, 0, PB, y, 0, PB, y, 0, PB, y, PB, PB, y, PB, 0, y, PB, 0, y, PB, 0, y, 0);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    this.sinir = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xffd34e, transparent: true, opacity: 0.55, depthWrite: false }));
    this.sinir.frustumCulled = false;
    this.sahne.sahne.add(this.sinir);
  }
  /* Dünyadan çıkılınca görünüm seçenekleri sıfırlanır */
  oyunBitti() {
    this.sinirAyarla(false);
    const S = this.sahne;
    S.tamAydinlik = false; S.sisKapali = false; S.opakMalzeme.wireframe = false; S.suMalzeme.wireframe = false; S.el.visible = true;
    document.body.classList.remove('gostergesiz');
  }

  /* ---------- Canlı bilgiler ---------- */
  guncelle(dt) {
    /* Gerçek kare süresi (oyun döngüsündeki dt üst sınırlıdır) */
    const simdi = performance.now();
    if (this.sonKare) this.kareler[this.kareSira++ % this.kareler.length] = Math.min(250, simdi - this.sonKare);
    this.sonKare = simdi;
    const o = this.oyun();
    if (this.sinir && o) { const P = o.oyuncu.konum; this.sinir.position.set(Math.floor(P.x / PB) * PB, 0, Math.floor(P.z / PB) * PB); }
    if (!this.acik || !o) return;
    this.sayac -= dt;
    if (this.sayac > 0) return;
    this.sayac = 0.3;
    this.canliYaz(o);
  }
  /* Açık sekmedeki sürekli değişen alanlar */
  canliYaz(o) {
    const S = this.sekme, son = this.son || (this.son = {});
    const yaz = (id, m, html) => { if (son[id] === m) return; const el = $(id); if (!el) return; son[id] = m; if (html) el.innerHTML = m; else el.textContent = m; };
    /* 0.23.0: üst şerit: konum, biyom, saat, kare hızı, can ve vücut ısısı */
    const P = o.oyuncu.konum, kb = o.biyom != null ? BIYOMLAR[o.biyom] : '';
    yaz('#gelCanliSerit', `<span>X ${Math.round(P.x)} · Y ${Math.round(P.y)} · Z ${Math.round(P.z)}</span><span>${esc(kb || '')}</span><span>${o.gun}. gün · ${$('#saatDeger').textContent}</span><span>${$('#fps').textContent || '—'}</span><span>Can ${o.hayatta.can / 2} · Açlık ${o.hayatta.aclik / 2}</span><span>${o.hayatta.vucut.toFixed(1).replace('.', ',')} °C</span>`, true);
    if (S === 'hayatta') yaz('#gelIsi', `Vücut ${o.hayatta.vucut.toFixed(1).replace('.', ',')} °C · hissedilen ${o.hayatta.hissedilen.toFixed(1).replace('.', ',')} °C · Kanlı Ay ${o.gok && o.gok.kanliAyMi(o) ? 'sürüyor' : 'yok'}`);
    if (S === 'bilgi') { this.tabloYaz(o); this.grafikCiz(); }
    else if (S === 'canli') this.sayimYaz(o);
    else if (S === 'oyuncu') {
      const h = o.hayatta;
      yaz('#gelXp', `${h.seviye}. seviye · ${Math.floor(h.xp)} puan · sonraki seviyeye %${Math.round(h.ilerleme * 100)}`);
      for (const b of $('#gelIcerik').querySelectorAll('[data-etki]')) { const k = h.etkiler[b.dataset.etki] || 0; b.classList.toggle('on', k > 0); b.querySelector('em').textContent = k > 0 ? sure(k) : ''; }
    }
    else if (S === 'dunya') {
      const b = this.bakilan(o);
      yaz('#gelBakilan', b ? `${BLOKLAR[b.id].ad} (${b.id}) · X ${b.x} · Y ${b.y} · Z ${b.z}` : 'Bakılan bir blok yok (5 blok içinde).');
      for (const el of $('#gelIcerik').querySelectorAll('[data-hava]')) el.classList.toggle('on', o.hava.durum === el.dataset.hava);
    }
    else if (S === 'harita') {
      const H = o.harita, K = this.konsol.kesifDurumu();
      yaz('#gelHaritaDurum', `Keşfedilen alan: ${(H.alan / 1e6).toFixed(2).replace('.', ',')} km² · ${H.parcalar.size.toLocaleString('tr')} parça · ${(o.yerler || []).length} işaret`);
      yaz('#gelKesif', K ? `<div class="gelIlerleme"><i style="width:${(K.oran * 100).toFixed(1)}%"></i><span>Keşif sürüyor: %${Math.floor(K.oran * 100)} · ${K.biten.toLocaleString('tr')} / ${K.toplam.toLocaleString('tr')} parça</span></div><div class="gelDugmeler"><button type="button" data-k="kesfet dur">Keşfi durdur</button></div>` : '', true);
    }
  }
  sayimYaz(o) {
    const el = $('#gelSayim'); if (!el) return;
    const say = {};
    for (const v of o.varliklar.liste) { const a = v.tur.ad + (v.yavru > 0 ? ' yavrusu' : ''); say[a] = (say[a] || 0) + 1; }
    const m = Object.entries(say).map(([a, n]) => `<span>${esc(a)} <i>${n}</i></span>`).join('') || 'Canlı yok.';
    if (this.son.sayim !== m) { this.son.sayim = m; el.innerHTML = m; }
  }
  /* Son karelerin süresi (ms): yeşil 16,7 ms (60 FPS), sarı 33 ms (30 FPS) çizgileri */
  grafikCiz() {
    const cv = $('#gelGrafik'); if (!cv) return;
    const ctx = cv.getContext('2d'), W = cv.width, H = cv.height, n = this.kareler.length, ust = 50;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 0, W, H);
    for (const [ms, r] of [[16.7, 'rgba(155,227,139,.45)'], [33.3, 'rgba(255,211,78,.45)']]) { const y = H - ms / ust * H; ctx.fillStyle = r; ctx.fillRect(0, y, W, 1); }
    const w = W / n;
    for (let i = 0; i < n; i++) {
      const ms = this.kareler[(this.kareSira + i) % n], h = Math.min(H, ms / ust * H);
      ctx.fillStyle = ms > 33.3 ? '#ff8a7a' : ms > 17.5 ? '#ffd34e' : '#9be38b';
      ctx.fillRect(i * w, H - h, Math.max(1, w - 1), h);
    }
    ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = '11px Rubik, Arial, sans-serif'; ctx.fillText('Kare süresi (ms) · çizgiler: 60 ve 30 FPS', 8, 14);
  }
  satirlar(o) {
    const P = o.oyuncu.konum, k = o.dunya.uretici.kolon(Math.floor(P.x), Math.floor(P.z), {}), V = o.varliklar.liste, m = performance.memory, inf = this.sahne.cizici.info;
    const l = [...this.kareler].filter(x => x > 0), ort = l.reduce((a, x) => a + x, 0) / Math.max(1, l.length), enK = Math.max(...l, 0);
    const h = this.bakilan(o), K = this.konsol.kesifDurumu(), A = this.anahtarlar;
    const modlar = ['olumsuz', 'ucus', 'hayalet', 'aninda', 'sinirsiz', 'tok', 'baris', 'dogurma', 'donmus', 'havaKilit', 'aydinlik', 'sis', 'tel', 'sinir'].filter(a => A[a].al(o)).map(a => kucuk(A[a].ad));
    if (o.oyuncu.hizCarpani !== 1) modlar.push(`hız ${o.oyuncu.hizCarpani}×`);
    if (o.etkilesim.erisim) modlar.push(`erişim ${o.etkilesim.erisim}`);
    return [
      ['Sürüm / dünya', `HungerMan ${SURUM} · ${o.ad} · tohum ${o.tohum}${o.komutlar ? ' · komutlar açık' : ''}`],
      ['Kare hızı', `${$('#fps').textContent || '-'} · ortalama ${ort.toFixed(1)} ms · en kötü ${enK.toFixed(1)} ms`],
      ['Çizim', `${inf.render.calls} çağrı · ${Math.round(inf.render.triangles / 1000)} bin üçgen · ${inf.memory.geometries} geometri · ${inf.memory.textures} doku`],
      ['Konum', `X ${P.x.toFixed(1)} · Y ${P.y.toFixed(1)} · Z ${P.z.toFixed(1)} · parça ${Math.floor(P.x / PB)}, ${Math.floor(P.z / PB)}`],
      ['Biyom / zemin', `${BIYOMLAR[k.b]} · ${k.h}`],
      ['Bakılan blok', h ? `${BLOKLAR[h.id].ad} (${h.id}) · ${h.x}, ${h.y}, ${h.z}` : '-'],
      ['Zaman', `${o.gun}. gün · ${$('#saatDeger').textContent} · hız ${o.zamanHizi ?? 1}×`],
      ['Hava', `${o.hava.durum} · yoğunluk %${Math.round(o.hava.yogunluk * 100)}${o.hava.kilit ? ' · kilitli' : ` · ${Math.round(o.hava.sure)} sn sonra değişir`}`],
      ['Oyuncu', `can ${o.hayatta.can} · açlık ${o.hayatta.aclik} · ${o.hayatta.seviye}. seviye (${Math.floor(o.hayatta.xp)} puan)${Object.keys(o.hayatta.etkiler).length ? ' · etkiler: ' + Object.keys(o.hayatta.etkiler).join(', ') : ''}`],
      ['Canlılar', `${V.length} (düşman ${V.filter(v => v.tur.dusman).length}, hayvan ${V.filter(v => !v.tur.dusman && !v.tur.su && !v.tur.koylu).length}, evcil ${V.filter(v => v.evcil).length}, deniz ${V.filter(v => v.tur.su).length}, köylü ${V.filter(v => v.tur.koylu).length})`],
      ['Ok / yerde eşya / tekne', `${o.varliklar.oklar.length} / ${o.dusenler.liste.length} / ${o.tekneler.liste.length}`],
      ['Yüklü parça', `${o.dunya.parcalar.size} (görüş ${o.dunya.gorus}) · ışık kaynağı ${o.dunya.mesaleler.size} · büyüyen ekin ${o.dunya.ekinler.size}`],
      ['Harita', `${o.harita.parcalar.size.toLocaleString('tr')} parça · ${(o.harita.alan / 1e6).toFixed(2).replace('.', ',')} km² · ${(o.yerler || []).length} işaret${K ? ` · keşif %${Math.floor(K.oran * 100)}` : ''}`],
      ['Blok değişikliği', String([...o.dunya.degisiklikler.values()].reduce((a, d) => a + d.size, 0))],
      ['Bellek', m ? `${Math.round(m.usedJSHeapSize / 1048576)} / ${Math.round(m.jsHeapSizeLimit / 1048576)} MB` : 'tarayıcı bildirmiyor'],
      ['Ağ', o.ag ? `${o.istemci ? 'istemci' : 'sunucu'} · ${o.ag.oyuncuListesi().length} oyuncu${o.ag.kod ? ' · kod ' + o.ag.kod : ''}` : 'tek oyunculu'],
      ['Açık modlar', modlar.join(' · ') || '-']
    ];
  }
  tabloYaz(o) {
    const el = $('#gelTablo'); if (!el) return;
    el.innerHTML = this.satirlar(o).map(([a, b]) => `<tr><th>${a}</th><td>${esc(b)}</td></tr>`).join('');
  }
}
