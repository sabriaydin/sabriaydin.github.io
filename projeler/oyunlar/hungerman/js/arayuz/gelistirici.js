/* HungerMan - Geliştirici Modu penceresi (F9) · 0.39.0'da baştan yazıldı
   Geliştirici kodu konsolda girildikten sonra açılır. Oyunun pencere temasındadır; düğme yığınları yerine ayarlar ekranındaki gibi
   satırlardan oluşur: her satırda başlık, kısa açıklama ve sağda tek bir denetim (anahtar, kaydırıcı, seçim kutusu ya da tek işlem düğmesi).
   İşlemler konsol komutlarıyla yürür (aynı izin kuralları geçerlidir, konsol kaydına yazılır); anahtar ve kaydırıcılar hemen uygulanır.
   Sekmeler: Oyuncu, Eşyalar, Dünya, Canlılar, Işınlanma, Köy ve Görev, Görünüm, Bilgi. */
import { ESYALAR, BLOKLAR, ETKILER, YAPI_ID, TARIM, MUTFAK, COKLU_ID, YAPI37, ESYA37, ESYA39 } from '../bloklar.js';
import { TURLER, HAYVANLAR, DENIZ_CANLILARI, CANAVARLAR } from '../varlik/turler.js';
import { BIYOMLAR } from '../dunya/uretici.js';
import { simge } from '../grafik/doku.js';
import { THREE } from '../grafik/sahne.js';
import { PB, PY, SURUM } from '../sabitler.js';
import { HAVA_ADI } from '../grafik/hava.js';
import { CIHAZ } from '../cihazlar.js';

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const kucuk = s => String(s).toLocaleLowerCase('tr');
const sureMetni = sn => { const s = Math.ceil(sn); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const SAKLA = 'hungerman_gelistirici_sekme';

const SEKMELER = [
  ['oyuncu', 'Oyuncu'], ['esya', 'Eşyalar'], ['dunya', 'Dünya'], ['canli', 'Canlılar'],
  ['isinla', 'Işınlanma'], ['koy', 'Köy ve Görev'], ['gorunum', 'Görünüm'], ['bilgi', 'Bilgi']
];

/* Eşya kategorileri (Eşya ver listesinin süzgeci) */
const KATEGORI = [['hepsi', 'Tümü'], ['blok', 'Bloklar'], ['mobilya', 'Mobilya ve dekor'], ['alet', 'Alet ve silah'], ['zirh', 'Zırh ve giysi'], ['yiyecek', 'Yiyecek ve iksir'], ['mekanik', 'Mekanik ve elektrik'], ['diger', 'Malzeme ve diğer']];
function kategori(e) {
  if (e.zirh || e.kiyafet) return 'zirh';
  const b = e.tur === 'blok' && BLOKLAR[e.blok];
  if (e.tur === 'cihaz' || (b && (b.elektrik || b.mekanik))) return 'mekanik';
  if (b && (b.ck || b.sekil === 'raf' || b.oturak || b.sandik || b.yatak)) return 'mobilya';
  if (e.tur === 'blok') return 'blok';
  if (e.tur === 'alet' || e.tur === 'yay' || e.tur === 'olta' || e.tur === 'cakmak') return 'alet';
  if (e.tur === 'yiyecek' || e.tur === 'iyilestir' || e.tur === 'iksir' || e.yenir) return 'yiyecek';
  return 'diger';
}

/* Hazır setler: her biri tek bir amaca yöneliktir ve envantere sığar (en çok 15 yığın) */
const C = COKLU_ID, Y7 = YAPI37, E7 = ESYA37;
const SETLER = [
  { ad: 'Başlangıç', not: 'Taş aletler, yiyecek, meşale, üretim masası, fırın, sandık ve yatak', esya: [[304, 1], [305, 1], [306, 1], [307, 1], [341, 1], [293, 16], [46, 32], [32, 1], [33, 1], [47, 1], [50, 1]] },
  { ad: 'Madenci', not: 'Demir aletler ve zırh, bol meşale, yiyecek ve sandık', esya: [[312, 1], [313, 1], [314, 1], [315, 1], [408, 1], [409, 1], [410, 1], [411, 1], [46, 64], [276, 16], [50, 2]] },
  { ad: 'Elmas donanım', not: 'Elmas aletler ve zırh, yay ve oklar, altın elma', esya: [[316, 1], [317, 1], [318, 1], [319, 1], [412, 1], [413, 1], [414, 1], [415, 1], [286, 1], [287, 64], [290, 8]] },
  { ad: 'Obsidyen donanım', not: 'En güçlü alet seti ve obsidyen zırh', esya: [[E7.obsidyen_kazma, 1], [E7.obsidyen_balta, 1], [E7.obsidyen_kurek, 1], [E7.obsidyen_kilic, 1], [E7.obsidyen_capa, 1], [428, 1], [429, 1], [430, 1], [431, 1]] },
  { ad: 'Diyar yolculuğu', not: 'Büyülü anahtarlar, ateşe dayanıklılık iksiri, kor kılıcı, bandaj ve yiyecek', esya: [[ESYA39.anahtar, 2], [335, 3], [474, 1], [413, 1], [272, 16], [268, 4], [46, 32]] },
  { ad: 'İnşaatçı', not: 'Temel yapı blokları, cam, kapı, merdiven ve basamaklar', esya: [[14, 64], [35, 64], [37, 64], [Y7.mermerTugla, 64], [Y7.yosunluTugla, 64], [34, 64], [51, 64], [70, 32], [82, 32], [88, 4], [109, 32], [123, 16], [46, 32]] },
  { ad: 'Ev döşeme', not: 'Yatak, kanepe, masa, gardırop, mutfak ve aydınlatma', esya: [[47, 2], [C.kanepe, 1], [C.yemekMasasi, 1], [199, 4], [C.gardirop, 1], [C.buzdolabi, 1], [MUTFAK.tezgah, 2], [C.lavabo, 1], [C.ayakliLamba, 2], [YAPI_ID.avize, 1], [YAPI_ID.somine, 1], [208, 8], [C.kitapYigini, 2], [C.dedeSaati, 1]] },
  { ad: 'Çiftçi', not: 'Çapa, tırpan, tohumlar, gübre, kova ve kompost kutusu', esya: [[343, 1], [388, 1], [292, 32], [364, 16], [366, 16], [368, 16], [371, 16], [375, 16], [328, 16], [329, 16], [390, 32], [477, 2], [TARIM.kompost, 1]] },
  { ad: 'Aşçı', not: 'Mutfak istasyonları, tarif defteri ve temel malzemeler', esya: [[320, 1], [MUTFAK.degirmen, 1], [MUTFAK.tezgah, 1], [MUTFAK.tandir, 1], [232, 1], [C.mangal, 1], [291, 32], [396, 16], [397, 8], [480, 16], [476, 16], [484, 8], [479, 2], [270, 16], [331, 8]] },
  { ad: 'Denizci ve kâşif', not: 'Sandal, yelkenli, olta, dalış takımı, dürbün ve cep saati', esya: [[454, 1], [455, 1], [453, 1], [456, 1], [457, 1], [E7.durbun, 1], [E7.cepSaati, 1], [298, 16], [46, 16]] },
  { ad: 'Büyü ve simya', not: 'Büyü masası, simya masası, örs, şişeler, kristaller ve iksir malzemeleri', esya: [[156, 1], [140, 1], [139, 1], [331, 16], [61, 32], [283, 8], [265, 16], [297, 8], [296, 8], [263, 8]] },
  { ad: 'Elektrik', not: 'Üreticiler, bataryalar, kablo, şalter, lamba, algılayıcı ve taret', esya: [[497, 4], [498, 1], [499, 1], [500, 2], [502, 1], [503, 64], [826, 2], [852, 2], [860, 1], [257, 32], [504, 1], [287, 64], [872, 2], [620, 8]] }
];

/* Işınlanma yerleri (konsoldaki isinla anahtar sözcükleri) */
const YERLER = [['dogum', 'Doğma noktası'], ['olum', 'Son ölüm yeri'], ['geri', 'Bir önceki konum'], ['koy', 'En yakın köy'], ['liman', 'En yakın liman'], ['zindan', 'En yakın zindan'], ['maden', 'En yakın terk edilmiş maden'],
  ['batik', 'En yakın batık gemi'], ['tapinak', 'En yakın çöl tapınağı'], ['ormantapinak', 'En yakın orman tapınağı'], ['kule', 'En yakın buzul kulesi'], ['kamp', 'En yakın haydut kampı'], ['ada', 'Lanetli Ada (kadim geçit)'], ['kale', 'En yakın kül kalesi (diyar)']];

export class GelistiriciPenceresi {
  constructor(o) {
    Object.assign(this, o);   // ses, konsol, sahne, oyun(), kapatIste, arayuz: { fovAyarla, fpsAc, hataAc, miniAc, haritaAc, konsolAc }
    this.acik = false; this.sayac = 0; this.son = {}; this.bicim = {};
    this.arama = ''; this.kat = 'hepsi'; this.adet = 16; this.yavru = false;
    this.kareler = new Float32Array(150); this.kareSira = 0;
    this.sinir = null;
    try { this.sekme = localStorage.getItem(SAKLA) || 'oyuncu'; } catch (e) { this.sekme = 'oyuncu'; }
    if (!SEKMELER.some(s => s[0] === this.sekme)) this.sekme = 'oyuncu';
    this.kok = $('#gelistirici');
    $('#dvSekmeler').innerHTML = SEKMELER.map(([k, a]) => `<button type="button" data-s="${k}">${a}</button>`).join('');
    $('#dvSekmeler').addEventListener('click', e => { const b = e.target.closest('button[data-s]'); if (b) this.sekmeSec(b.dataset.s); });
    $('#dvKapat').addEventListener('click', () => this.kapatIste());
    this.kok.addEventListener('mousedown', e => { if (e.target === this.kok) this.kapatIste(); });
    const ic = $('#dvIcerik');
    ic.addEventListener('click', e => this.tikla(e));
    ic.addEventListener('input', e => this.girdi(e));
    ic.addEventListener('change', e => this.degisti(e));
    ic.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') this.kapatIste(); });
    ic.addEventListener('mouseover', e => { const b = e.target.closest('[data-ver]'), el = $('#dvEsyaAd'); if (b && el) el.textContent = `${ESYALAR[+b.dataset.ver].ad} · ${b.dataset.ver}`; });
    this.konsol.mesajDinle = (m, sinif) => this.mesaj(m, sinif);
    this.anahtarlar = this.anahtarlariKur();
    this.islemler = this.islemleriKur();
  }
  ac() { this.acik = true; this.kok.hidden = false; this.mesaj('Değişiklikler hemen uygulanır ve konsol kaydına da yazılır (F8).', 'soluk'); this.ciz(); }
  kapat() { if (this.kok.contains(document.activeElement)) document.activeElement.blur(); this.acik = false; this.kok.hidden = true; }
  k(s) { this.konsol.calistir(s); this.ses.tik(); }
  mesaj(m, sinif = '') { const el = $('#dvMesaj'); if (el) { el.textContent = m; el.className = 'dvMesaj ' + (sinif || ''); } }
  izin(o) { if (!o.komutlar) { this.mesaj('Bu dünyada komutlar kapalı.', 'hata'); return false; } return true; }
  sekmeSec(k) { this.sekme = k; try { localStorage.setItem(SAKLA, k); } catch (x) { /* depolama kapalı */ } this.ses.tik(); this.ciz(); $('#dvIcerik').scrollTop = 0; }
  deger(id) { const el = $('#' + id); return el ? el.value : ''; }

  /* ---------- Yapı taşları ---------- */
  bolum(baslik, satirlar, not = '') { return `<section class="dvBolum"><h4>${baslik}</h4>${not ? `<p class="dvNot">${not}</p>` : ''}${satirlar}</section>`; }
  satir(baslik, aciklama, denetim, id = '') { return `<div class="dvSatir"${id ? ` id="${id}"` : ''}><div class="dvMetin"><b>${baslik}</b>${aciklama ? `<small>${aciklama}</small>` : ''}</div><div class="dvDenetim">${denetim}</div></div>`; }
  islem(ad, metin = 'Uygula', sinif = '') { return `<button type="button" class="dvIslem${sinif ? ' ' + sinif : ''}" data-is="${ad}">${metin}</button>`; }
  secim(id, l, deger) { return `<select id="${id}" class="dvSecim">${l.map(([v, a]) => `<option value="${esc(v)}"${String(v) === String(deger) ? ' selected' : ''}>${esc(a)}</option>`).join('')}</select>`; }
  anahtar(ad, o) { const A = this.anahtarlar[ad]; return this.satir(A.ad, A.alt, `<label class="dvAnahtar"><input type="checkbox" data-a="${ad}"${A.al(o) ? ' checked' : ''}><i></i></label>`); }
  kaydirici(ad, baslik, aciklama, min, max, adim, deger, bicim) {
    this.bicim[ad] = bicim;
    const p = ((Math.min(max, Math.max(min, +deger)) - min) / (max - min) * 100).toFixed(1);
    return this.satir(baslik, aciklama, `<span class="dvKaydir"><input type="range" data-r="${ad}" min="${min}" max="${max}" step="${adim}" value="${deger}" style="--p:${p}%"><b data-d="${ad}">${bicim(+deger)}</b></span>`);
  }

  /* ---------- Anahtarlar: al = durum; komut = konsol komutu; koy = doğrudan ayar (hile: komut izni gerekir) ---------- */
  anahtarlariKur() {
    const S = this.sahne, govde = document.body;
    return {
      olumsuz: { ad: 'Ölümsüzlük', alt: 'Hiç hasar alınmaz', al: o => !!o.hayatta.olumsuz, komut: 'olumsuz' },
      ucus: { ad: 'Uçma', alt: 'Boşluk yükselir, C alçalır', al: o => !!o.oyuncu.ucus, komut: 'ucus' },
      hayalet: { ad: 'Duvardan geçme', alt: 'Uçarken bloklardan geçilir', al: o => !!o.oyuncu.hayalet, hile: true, koy: (o, v) => { o.oyuncu.hayalet = v; if (v) o.oyuncu.ucus = true; } },
      aninda: { ad: 'Anında kırma', alt: 'Her blok tek vuruşta kırılır', al: o => !!o.etkilesim.aninda, hile: true, koy: (o, v) => { o.etkilesim.aninda = v; } },
      sinirsiz: { ad: 'Sınırsız eşya', alt: 'Koyma, üretim ve ticarette eşya azalmaz; aletler yıpranmaz', al: o => !!o.envanter.sinirsiz, hile: true, koy: (o, v) => { o.envanter.sinirsiz = v; } },
      tok: { ad: 'Açlık azalmasın', alt: 'Hareket ve zaman açlığı etkilemez', al: o => !!o.hayatta.tok, komut: 'tok' },
      baris: { ad: 'Barış', alt: 'Canavarlar ve öfkeli hayvanlar saldırmaz', al: o => !!o.varliklar.barisci, komut: 'baris' },
      dogurma: { ad: 'Canlı doğmasını durdur', alt: 'Yeni hayvan ve canavar çıkmaz', al: o => !!o.varliklar.dogurmaKapali, hile: true, sunucu: true, koy: (o, v) => { o.varliklar.dogurmaKapali = v; } },
      donmus: { ad: 'Canlıları dondur', alt: 'Yapay zekâ ve hareket durur', al: o => !!o.varliklar.donmus, hile: true, sunucu: true, koy: (o, v) => { o.varliklar.donmus = v; } },
      havaKilit: { ad: 'Hava değişmesin', alt: 'Bulunulan yerdeki hava kendiliğinden değişmez', al: o => !!o.hava.kilit, komut: 'hava kilit' },
      zamanDur: { ad: 'Zamanı durdur', alt: 'Gün döngüsü ilerlemez', al: o => o.zamanHizi === 0, komutFn: v => `zaman hiz ${v ? 0 : 1}` },
      aydinlik: { ad: 'Tam aydınlık', alt: 'Mağaralar ve gece aydınlık görünür', al: () => !!S.tamAydinlik, koy: (o, v) => { S.tamAydinlik = v; } },
      sis: { ad: 'Sisi kapat', alt: 'Uzaklık sisi çizilmez', al: () => !!S.sisKapali, koy: (o, v) => { S.sisKapali = v; } },
      tel: { ad: 'Tel kafes görünümü', alt: 'Dünya geometrisi çizgilerle çizilir', al: () => !!S.opakMalzeme.wireframe, koy: (o, v) => { S.opakMalzeme.wireframe = v; S.suMalzeme.wireframe = v; } },
      sinir: { ad: 'Parça sınırları', alt: 'Bulunulan 16 × 16 parçanın kenarları çizilir', al: () => !!this.sinir, koy: (o, v) => this.sinirAyarla(v) },
      el: { ad: 'Eli gizle', alt: 'Elde tutulan eşya çizilmez', al: () => !S.el.visible, koy: (o, v) => { S.el.visible = !v; } },
      hud: { ad: 'Göstergeleri gizle', alt: 'Pusula, çubuk ve harita gizlenir', al: () => govde.classList.contains('gostergesiz'), koy: (o, v) => govde.classList.toggle('gostergesiz', v) },
      fps: { ad: 'Kare hızı göstergesi', alt: 'Sol altta FPS', al: () => !$('#fps').hidden, koy: (o, v) => this.arayuz.fpsAc(v) },
      f3: { ad: 'Teknik bilgi paneli', alt: 'F3 paneli', al: () => !$('#hata').hidden, koy: (o, v) => this.arayuz.hataAc(v) },
      mini: { ad: 'Mini harita', alt: 'Sağ altta', al: () => !$('#miniHarita').hidden, koy: (o, v) => this.arayuz.miniAc(v) },
      yavru: { ad: 'Yavru olarak doğur', alt: 'Yalnızca beslenebilen hayvanlarda geçerli', al: () => !!this.yavru, koy: (o, v) => { this.yavru = v; } }
    };
  }

  /* ---------- İşlemler (satırlardaki tek düğmeler) ---------- */
  islemleriKur() {
    const k = s => this.k(s), d = id => this.deger(id);
    return {
      iyiles: () => k('iyiles'),
      xpEkle: () => k(`xp seviye ${d('dvXpSec')}`), xpSifir: () => k('xp sifirla'),
      etkiVer: () => k(`etki ${d('dvEtkiSec')} ${d('dvEtkiSure')}`), etkiSil: () => k('etki temizle'),
      durumVer: () => k(`durum ${d('dvDurumSec')}`), durumSil: () => k('durum temizle'),
      hasar: () => k(`hasar ${d('dvHasarSec')}`),
      dogumAyarla: () => k('dogum'),
      setVer: (o, b) => this.setVer(o, +b.dataset.set),
      onar: () => k('onar'), doldur: () => k('eldeki doldur'), eldekiSil: () => k('eldeki sil'),
      buyuHepsi: () => k('buyu hepsi'), buyuSil: () => k('buyu temizle'), envanterBosalt: () => k('envanter temizle'),
      saatUygula: () => k(`zaman ${d('dvSaatSec')}`), zamanHiz: () => k(`zaman hiz ${d('dvZhizSec')}`), gunUygula: () => k(`gun ${d('dvGun')}`),
      havaUygula: () => k(`hava ${d('dvHavaSec')} ${d('dvHavaSure')}`), simsek: () => k('hava simsek'),
      kanliAy: () => k('kanliay'), meteor: () => k('meteor'),
      duzle: () => k(`duzle ${d('dvDuzleSec')}`), buyut: () => k('buyut'), esyaSil: () => k('esya temizle'), yenile: () => k('yenile'),
      gecitAc: () => k('gecit ac'), gecitKapat: () => k('gecit kapat'), bekciSifir: () => k('bekci sifirla'), bossSifir: () => k('boss sifirla'),
      batarya: o => this.batarya(o, d('dvBataryaSec')), kaydet: () => k('kaydet'),
      dogur: () => k(`dogur ${d('dvTurSec')} ${d('dvDogurAdet')}${this.yavru ? ' yavru' : ''}`), canliSil: () => k(`oldur ${d('dvSilSec')}`),
      hayvanBuyut: () => k('hayvan buyut'), hayvanBesle: () => k('hayvan besle'),
      yerGit: () => k(`isinla ${d('dvYerSec')}`), koordGit: () => this.koordGit(), yonGit: o => this.yonGit(o), biyomGit: () => k(`isinla biyom ${d('dvBiyomSec')}`),
      isaretGit: (o, b) => { const y = o.yerler[+b.dataset.y]; if (y) k(`isinla ${y.x} ${y.z}`); },
      diyar: () => k('diyar'), kesfet: () => k(`kesfet ${d('dvKesifSec')}`), kesifDur: () => k('kesfet dur'), haritaAc: () => this.arayuz.haritaAc(),
      itibar: () => k(`itibar ${d('dvItibar')}`), takas: () => k('koy takas'), dirilt: () => k('koy dirilt'),
      gorevTamam: () => k('gorev tamamla'), gorevBirak: () => k('gorev birak'),
      basarimGoster: () => { k('basarim liste'); this.arayuz.konsolAc(); }, basarimHepsi: () => k('basarim hepsi'), basarimSifir: () => k('basarim sifirla'),
      gorus: () => k(`gorus ${d('dvGorusSec')}`), goruntu: () => k('goruntu'), konsol: () => this.arayuz.konsolAc(),
      hedefVer: o => { const h = this.bakilan(o); if (h) k(`ver ${this.blokEsyasi(h.id)} 1`); },
      hedefKir: o => { const h = this.bakilan(o); if (h && this.izin(o)) { o.etkilesim.kir({ ...h }); this.mesaj(`${BLOKLAR[h.id].ad} kırıldı.`, 'tamam'); } },
      canliIyiles: o => this.canliIslem(o, 'iyiles'), canliOldur: o => this.canliIslem(o, 'oldur'), canliKaldir: o => this.canliIslem(o, 'kaldir'),
      kopyala: o => { if (navigator.clipboard) navigator.clipboard.writeText(this.satirlar(o).map(([a, v]) => `${a}: ${v}`).join('\n')).catch(() => {}); this.mesaj('Teknik bilgiler panoya kopyalandı.', 'tamam'); },
      tohum: o => { if (navigator.clipboard) navigator.clipboard.writeText(String(o.tohum)).catch(() => {}); this.mesaj(`Tohum panoya kopyalandı: ${o.tohum}`, 'tamam'); }
    };
  }

  /* ---------- Çizim ---------- */
  ciz() {
    if (!this.acik) return;
    const o = this.oyun(); if (!o) return;
    for (const b of $('#dvSekmeler').children) b.classList.toggle('on', b.dataset.s === this.sekme);
    $('#dvDunya').textContent = `${o.ad} · ${o.istemci ? 'istemci' : o.ag ? 'sunucu' : 'tek oyunculu'} · ${o.komutlar ? 'komutlar açık' : 'komutlar kapalı'} · ${SURUM}`;
    this.son = {};
    $('#dvIcerik').innerHTML = this[this.sekme + 'Sekmesi'](o);
    this.canliYaz(o);
    if (this.sekme === 'esya' && this.aramaOdak) { const g = $('#dvAra'); if (g) { g.focus(); g.setSelectionRange(g.value.length, g.value.length); } }
  }

  oyuncuSekmesi(o) {
    const h = o.hayatta, P = o.oyuncu, dg = o.dogum;
    const etkiler = Object.entries(ETKILER).map(([k, e]) => [k, e.ad]);
    return this.bolum('Yetenekler', ['olumsuz', 'ucus', 'hayalet', 'aninda', 'sinirsiz', 'tok'].map(a => this.anahtar(a, o)).join('')) +
      this.bolum('Değerler',
        this.kaydirici('can', 'Can', '', 1, 20, 1, h.can, v => v / 2 + ' kalp') +
        this.kaydirici('aclik', 'Açlık', '', 0, 20, 1, h.aclik, v => v / 2 + ' / 10') +
        this.kaydirici('vucut', 'Vücut ısısı', '34,5 °C altı donma, 39,5 °C üstü sıcak çarpması', 30, 42, 0.5, Math.round(h.vucut * 2) / 2, v => v.toFixed(1).replace('.', ',') + ' °C') +
        this.kaydirici('hiz', 'Hareket hızı', '', 0.2, 5, 0.1, P.hizCarpani, v => v.toFixed(1) + '×') +
        this.kaydirici('erisim', 'Erişim mesafesi', 'Blok kırma ve koyma uzaklığı', 5, 40, 1, o.etkilesim.erisim || 5, v => v + ' blok') +
        this.satir('Tamamen iyileş', 'Can ve açlık dolar; zehir ve yanma geçer', this.islem('iyiles', 'İyileş'))) +
      this.bolum('Deneyim',
        this.satir('Seviye ekle', '<span id="dvXp"></span>', this.secim('dvXpSec', [[1, '+1 seviye'], [5, '+5 seviye'], [10, '+10 seviye'], [30, '+30 seviye']], 5) + this.islem('xpEkle', 'Ekle')) +
        this.satir('Deneyimi sıfırla', '', this.islem('xpSifir', 'Sıfırla'))) +
      this.bolum('Etkiler',
        this.satir('İksir ya da yemek etkisi', '<span id="dvEtkiler"></span>', this.secim('dvEtkiSec', etkiler, 'hiz') + this.secim('dvEtkiSure', [[60, '1 dk'], [180, '3 dk'], [600, '10 dk']], 180) + this.islem('etkiVer', 'Ver')) +
        this.satir('Tüm etkileri kaldır', '', this.islem('etkiSil', 'Kaldır')) +
        this.satir('Durum ver', 'Ölümsüzlük açıkken de etki eder', this.secim('dvDurumSec', [['zehir', 'Mide bulantısı'], ['agu', 'Örümcek zehri'], ['yanma', 'Yanma'], ['kanama', 'Kanama'], ['kirik', 'Kırık bacak']], 'zehir') + this.islem('durumVer', 'Ver')) +
        this.satir('Durumları kaldır', '', this.islem('durumSil', 'Kaldır')) +
        this.satir('Hasar ver', '', this.secim('dvHasarSec', [[2, '1 kalp'], [4, '2 kalp'], [10, '5 kalp'], [99, 'Öldür']], 4) + this.islem('hasar', 'Ver'))) +
      this.bolum('Doğma noktası',
        this.satir('Dünyanın doğma noktası', `X ${Math.round(dg.x)} · Y ${Math.round(dg.y)} · Z ${Math.round(dg.z)}${o.yatakNoktasi ? ` · son kayıt noktası (yatak): ${Math.round(o.yatakNoktasi.x)}, ${Math.round(o.yatakNoktasi.z)}` : ' · son kayıt noktası yok'}`, this.islem('dogumAyarla', 'Buraya ayarla')));
  }

  esyaSekmesi(o) {
    const a = kucuk(this.arama.trim());
    const l = Object.entries(ESYALAR).filter(([, e]) => e && e.ad && !e.gizli && (this.kat === 'hepsi' || kategori(e) === this.kat) && (!a || kucuk(e.ad).includes(a) || String(e.id) === a));
    const setler = SETLER.map((s, i) => `<div class="dvSatir dvSet"><div class="dvMetin"><b>${s.ad}</b><small>${s.not} · ${s.esya.length} yığın</small><span class="dvSetSimge">${s.esya.filter(([id]) => ESYALAR[id]).map(([id, n]) => `<img src="${simge(id).url}" alt="" title="${esc(ESYALAR[id].ad)} × ${n}">`).join('')}</span></div><div class="dvDenetim"><button type="button" class="dvIslem" data-is="setVer" data-set="${i}">Ver</button></div></div>`).join('');
    return this.bolum('Hazır setler', setler, 'Her set envantere sığar; yer kalmazsa verilemeyen eşya sayısı bildirilir.') +
      this.bolum('Envanter',
        this.satir('Tüm eşyaları onar', 'Envanterdeki ve giyilen eşyalar', this.islem('onar', 'Onar')) +
        this.satir('Eldeki yığını doldur', '', this.islem('doldur', 'Doldur')) +
        this.satir('Eldekini en yüksek büyülerle büyüle', '', this.islem('buyuHepsi', 'Büyüle')) +
        this.satir('Eldekinin büyülerini kaldır', '', this.islem('buyuSil', 'Kaldır')) +
        this.satir('Eldekini sil', '', this.islem('eldekiSil', 'Sil')) +
        this.satir('Envanteri boşalt', 'Geri alınamaz', this.islem('envanterBosalt', 'Boşalt', 'tehlike'))) +
      this.bolum('Eşya ver', `<div class="dvEsyaUst"><input type="search" id="dvAra" class="dvGirdi" placeholder="Eşya adı ya da numarası" value="${esc(this.arama)}" autocomplete="off">${this.secim('dvKatSec', KATEGORI, this.kat)}${this.secim('dvAdetSec', [[1, '1 adet'], [8, '8 adet'], [16, '16 adet'], [32, '32 adet'], [64, '64 adet']], this.adet)}</div>
        <p class="dvNot" id="dvEsyaAd">${l.length} eşya · üzerine gelinen eşyanın adı burada görünür · Shift + tık: 64 adet</p>
        <div class="dvEsyalar">${l.map(([i, e]) => `<button type="button" data-ver="${i}" title="${esc(e.ad)}"><img src="${simge(+i).url}" alt=""></button>`).join('')}</div>`);
  }

  dunyaSekmesi(o) {
    const saat = (o.zaman * 24 + 6) % 24;
    return this.bolum('Zaman',
        this.satir('Günün saati', `Şu an ${String(Math.floor(saat)).padStart(2, '0')}:${String(Math.floor((saat % 1) * 60)).padStart(2, '0')}`, this.secim('dvSaatSec', [['safak', 'Şafak'], ['sabah', 'Sabah'], ['ogle', 'Öğle'], ['ikindi', 'İkindi'], ['aksam', 'Akşam'], ['gece', 'Gece'], ['gece_yarisi', 'Gece yarısı']], 'sabah') + this.islem('saatUygula')) +
        this.satir('Zaman hızı', `Şu an ${o.zamanHizi ?? 1}×`, this.secim('dvZhizSec', [[1, '1× (normal)'], [2, '2×'], [5, '5×'], [10, '10×'], [30, '30×'], [60, '60×']], o.zamanHizi || 1) + this.islem('zamanHiz')) +
        this.anahtar('zamanDur', o) +
        this.satir('Gün sayısı', 'Canavar sayısı gün sayısıyla artar', `<input type="number" id="dvGun" class="dvGirdi dvSayi" min="1" max="9999" value="${o.gun}">` + this.islem('gunUygula'))) +
      this.bolum('Hava ve gök',
        this.satir('Hava durumu', `Bulunulan yer: ${HAVA_ADI[o.hava.durum] || o.hava.durum}`, this.secim('dvHavaSec', [['acik', 'Açık'], ['yagmur', 'Yağmur / kar'], ['firtina', 'Fırtına']], o.hava.durum) + this.secim('dvHavaSure', [[120, '2 dk'], [600, '10 dk'], [1800, '30 dk']], 600) + this.islem('havaUygula')) +
        this.anahtar('havaKilit', o) +
        this.satir('Şimşek çaktır', '', this.islem('simsek', 'Çaktır')) +
        this.satir('Kanlı Ay', 'Gün, Kanlı Ay gününe ve gün batımına ayarlanır', this.islem('kanliAy', 'Başlat')) +
        this.satir('Meteor', 'Yakına bir meteor düşer', this.islem('meteor', 'Düşür'))) +
      this.bolum('Arazi',
        this.satir('Çevreyi düzle', 'Ayak hizasının üstü boşaltılır, zemin çimenle kaplanır', this.secim('dvDuzleSec', [[4, '4 blok'], [8, '8 blok'], [16, '16 blok']], 8) + this.islem('duzle', 'Düzle', 'tehlike')) +
        this.satir('Ekinleri ve fidanları büyüt', 'Çevredeki ekinler olgunlaşır, fidanlar ağaç olur', this.islem('buyut', 'Büyüt')) +
        this.satir('Yerdeki eşyaları sil', '', this.islem('esyaSil', 'Sil')) +
        this.satir('Parçaları yeniden çiz', 'Görüntü bozulmalarında', this.islem('yenile', 'Yenile'))) +
      this.bolum('Lanetli Ada ve bosslar',
        this.satir('Kadim geçit', '<span id="dvGecit"></span>', this.islem('gecitAc', 'Aç (30 dk)') + this.islem('gecitKapat', 'Kapat')) +
        this.satir('Ada Bekçisi (Kül Devi)', '<span id="dvBekci"></span>', this.islem('bekciSifir', 'Süreyi sıfırla')) +
        this.satir('Yenilen bossları sıfırla', 'Yapılardaki bosslar yeniden çıkar', this.islem('bossSifir', 'Sıfırla', 'tehlike'))) +
      this.bolum('Elektrik ve kayıt',
        this.satir('Bataryalar', 'Yüklü bölgedeki bütün bataryalar', this.secim('dvBataryaSec', [['doldur', 'Doldur'], ['bosalt', 'Boşalt']], 'doldur') + this.islem('batarya')) +
        this.satir('Oyunu kaydet', '', this.islem('kaydet', 'Kaydet')));
  }

  canliSekmesi(o) {
    const tur = l => l.filter(k => TURLER[k]).map(k => [k, TURLER[k].ad]);
    const bosslar = Object.keys(TURLER).filter(k => TURLER[k].boss);
    const canavar = CANAVARLAR.filter(k => TURLER[k] && !TURLER[k].boss && !DENIZ_CANLILARI.includes(k));
    const secenek = [...tur(HAYVANLAR).map(([k, a]) => [k, 'Hayvan · ' + a]), ...tur(DENIZ_CANLILARI).map(([k, a]) => [k, 'Deniz · ' + a]), ...tur(canavar).map(([k, a]) => [k, 'Canavar · ' + a]), ...tur(bosslar).map(([k, a]) => [k, 'Boss · ' + a])];
    return this.bolum('Davranış', ['baris', 'dogurma', 'donmus'].map(a => this.anahtar(a, o)).join('')) +
      this.bolum('Doğurma',
        this.satir('Canlı doğur', 'Bakılan yöne doğar', this.secim('dvTurSec', secenek, this.dogurTur || 'inek') + this.secim('dvDogurAdet', [[1, '1'], [3, '3'], [5, '5'], [10, '10']], 1) + this.islem('dogur', 'Doğur')) +
        this.anahtar('yavru', o)) +
      this.bolum('Kaldırma ve hayvancılık',
        this.satir('Canlıları kaldır', 'Yüklü bölgedeki seçilen grup', this.secim('dvSilSec', [['dusman', 'Düşmanlar'], ['hayvan', 'Hayvanlar'], ['deniz', 'Deniz canlıları'], ['hepsi', 'Hepsi']], 'dusman') + this.islem('canliSil', 'Kaldır', 'tehlike')) +
        this.satir('Yavruları büyüt', 'Çevredeki yavru hayvanlar yetişkin olur', this.islem('hayvanBuyut', 'Büyüt')) +
        this.satir('Yetişkinleri besle', 'Beslenen çiftler yavrular', this.islem('hayvanBesle', 'Besle'))) +
      this.bolum('Çevredeki canlılar', '<div id="dvSayim" class="dvSayim"></div>');
  }

  isinlaSekmesi(o) {
    const P = o.oyuncu.konum;
    const isaret = (o.yerler || []).map((y, i) => this.satir(esc(y.ad), `${y.x}, ${y.z} · ${Math.round(Math.hypot(y.x - P.x, y.z - P.z))} blok`, `<button type="button" class="dvIslem" data-is="isaretGit" data-y="${i}">Git</button>`)).join('');
    return this.bolum('Yerler',
        this.satir('Yere git', '', this.secim('dvYerSec', YERLER, 'koy') + this.islem('yerGit', 'Git')) +
        this.satir('Biyoma git', 'En yakın örneği aranır', this.secim('dvBiyomSec', BIYOMLAR.map(b => [b, b]), BIYOMLAR[0]) + this.islem('biyomGit', 'Git')) +
        this.satir('Dünya ile diyar arasında geç', 'Karşı taraftaki 8:1 oranlı konuma', this.islem('diyar', 'Geç'))) +
      this.bolum('Koordinat',
        this.satir('Koordinata git', 'Y boş bırakılırsa yüzeye', `<input type="number" id="dvX" class="dvGirdi dvSayi" placeholder="X" value="${Math.round(P.x)}"><input type="number" id="dvY" class="dvGirdi dvSayi" placeholder="Y"><input type="number" id="dvZ" class="dvGirdi dvSayi" placeholder="Z" value="${Math.round(P.z)}">` + this.islem('koordGit', 'Git')) +
        this.satir('Bir yöne git', '', this.secim('dvYonSec', [['0', 'Kuzey'], ['1', 'Doğu'], ['2', 'Güney'], ['3', 'Batı']], '0') + this.secim('dvYonMesafe', [[50, '50 blok'], [100, '100 blok'], [500, '500 blok'], [1000, '1000 blok']], 100) + this.islem('yonGit', 'Git'))) +
      (isaret ? this.bolum('Harita işaretleri', isaret) : '') +
      this.bolum('Harita',
        this.satir('Keşif', '<span id="dvKesif"></span>', this.secim('dvKesifSec', [[256, '256 blok'], [512, '512 blok'], [1024, '1024 blok'], ['tumu', 'Tüm dünya']], 512) + this.islem('kesfet', 'Keşfet') + this.islem('kesifDur', 'Durdur')) +
        this.satir('Büyük harita', '', this.islem('haritaAc', 'Aç')));
  }

  koySekmesi(o) {
    return this.bolum('En yakın köy',
        this.satir('Köy', '<span id="dvKoy"></span>', '') +
        this.satir('İtibar', 'Kesin değer (-100 ile 100 arası)', `<input type="number" id="dvItibar" class="dvGirdi dvSayi" min="-100" max="100" value="40">` + this.islem('itibar')) +
        this.satir('Takasları yenile', '', this.islem('takas', 'Yenile')) +
        this.satir('Ölen köylüleri geri getir', '', this.islem('dirilt', 'Getir'))) +
      this.bolum('Görevler',
        this.satir('Etkin görevleri tamamla', 'Gereken eşya ve sayılar tamamlanır', this.islem('gorevTamam', 'Tamamla')) +
        this.satir('Görevleri bırak', '', this.islem('gorevBirak', 'Bırak'))) +
      this.bolum('Başarımlar',
        this.satir('Başarım durumu', 'Konsolda listelenir', this.islem('basarimGoster', 'Göster')) +
        this.satir('Tüm başarımları ver', '', this.islem('basarimHepsi', 'Ver')) +
        this.satir('Başarımları sıfırla', 'Geri alınamaz', this.islem('basarimSifir', 'Sıfırla', 'tehlike')));
  }

  gorunumSekmesi(o) {
    return this.bolum('Görüntü', ['aydinlik', 'sis', 'tel', 'sinir', 'el'].map(a => this.anahtar(a, o)).join('') +
        this.satir('Görüş mesafesi', `Şu an ${o.dunya.gorus} parça`, this.secim('dvGorusSec', [4, 6, 8, 10, 12, 16].map(n => [n, n + ' parça']), o.dunya.gorus) + this.islem('gorus')) +
        this.kaydirici('fov', 'Görüş açısı', '', 50, 110, 1, this.sahne.kamera ? Math.round(this.sahne.kamera.fov) : 75, v => v + '°')) +
      this.bolum('Arayüz', ['hud', 'fps', 'f3', 'mini'].map(a => this.anahtar(a, o)).join('') +
        this.satir('Ekran görüntüsü', 'Göstergeler olmadan PNG olarak indirilir', this.islem('goruntu', 'Al')) +
        this.satir('Konsol', 'Tüm komutlar (F8)', this.islem('konsol', 'Aç')));
  }

  bilgiSekmesi() {
    return this.bolum('Bakılan hedef', '<div id="dvHedef"></div>') +
      this.bolum('Performans', '<canvas id="dvGrafik" width="640" height="110"></canvas>') +
      this.bolum('Teknik bilgiler', `<table class="dvTablo" id="dvTablo"></table>` +
        this.satir('Kopyala', '', this.islem('kopyala', 'Bilgileri kopyala') + this.islem('tohum', 'Tohumu kopyala')));
  }

  /* ---------- Olaylar ---------- */
  tikla(e) {
    const o = this.oyun(); if (!o) return;
    const v = e.target.closest('[data-ver]');
    if (v) { this.k(`ver ${v.dataset.ver} ${e.shiftKey ? 64 : this.adet}`); return; }
    const b = e.target.closest('button[data-is]'); if (!b) return;
    const ad = b.dataset.is, f = this.islemler[ad];
    if (!f) return;
    /* Tehlikeli işlemler iki tıkla onaylanır */
    if (b.classList.contains('tehlike') && !b.dataset.bekle) {
      b.dataset.bekle = '1'; b.dataset.eski = b.textContent; b.textContent = 'Emin misiniz?'; b.classList.add('onay');
      setTimeout(() => { if (b.isConnected && b.dataset.bekle) { delete b.dataset.bekle; b.textContent = b.dataset.eski; b.classList.remove('onay'); } }, 2500);
      return;
    }
    if (b.dataset.bekle) { delete b.dataset.bekle; b.textContent = b.dataset.eski; b.classList.remove('onay'); }
    f(o, b);
    if (['dogumAyarla', 'saatUygula', 'zamanHiz', 'havaUygula', 'gorus', 'gunUygula'].includes(ad)) setTimeout(() => this.ciz(), 60);
  }
  girdi(e) {
    const t = e.target, o = this.oyun(); if (!o) return;
    if (t.id === 'dvAra') { this.arama = t.value; this.aramaOdak = true; this.ciz(); this.aramaOdak = false; return; }
    const r = t.dataset.r; if (!r) return;
    const v = +t.value, el = this.kok.querySelector(`[data-d="${r}"]`);
    t.style.setProperty('--p', ((v - +t.min) / (+t.max - +t.min) * 100).toFixed(1) + '%');
    if (el && this.bicim[r]) el.textContent = this.bicim[r](v);
    if (r === 'hiz' && this.izin(o)) o.oyuncu.hizCarpani = v;
    else if (r === 'can' && this.izin(o)) o.hayatta.can = v;
    else if (r === 'aclik' && this.izin(o)) o.hayatta.aclik = v;
    else if (r === 'fov') this.arayuz.fovAyarla(v);
  }
  degisti(e) {
    const t = e.target, o = this.oyun(); if (!o) return;
    if (t.type === 'range') t.blur();
    if (t.id === 'dvKatSec') { this.kat = t.value; this.ciz(); return; }
    if (t.id === 'dvAdetSec') { this.adet = +t.value; return; }
    if (t.id === 'dvTurSec') { this.dogurTur = t.value; return; }
    const r = t.dataset.r;
    if (r === 'erisim') this.k(`erisim ${t.value}`);
    else if (r === 'vucut') this.k(`isi ${t.value}`);
    const a = t.dataset.a; if (!a) return;
    const A = this.anahtarlar[a], acik = t.checked;
    if (A.komut || A.komutFn) { if (!!A.al(o) !== acik) this.k(A.komutFn ? A.komutFn(acik) : A.komut); }
    else if (A.hile && !this.izin(o)) { /* komutlar kapalı */ }
    else if (A.sunucu && o.istemci) this.mesaj('Çok oyunculu istemcide canlıları sunucu yönetir.', 'hata');
    else { A.koy(o, acik); this.ses.tik(); this.mesaj(`${A.ad}: ${acik ? 'açık' : 'kapalı'}.`, 'tamam'); }
    for (const el of $('#dvIcerik').querySelectorAll('input[data-a]')) { const B = this.anahtarlar[el.dataset.a]; if (B) el.checked = !!B.al(o); }
  }

  /* ---------- Yardımcı işlemler ---------- */
  setVer(o, i) {
    if (!this.izin(o)) return;
    const s = SETLER[i]; let sigmayan = 0;
    for (const [id, n] of s.esya) if (ESYALAR[id]) sigmayan += o.envanter.ekle(id, n) || 0;
    this.ses.tik(); this.mesaj(`${s.ad} seti verildi.${sigmayan ? ` Envanterde yer olmadığı için ${sigmayan} eşya verilemedi.` : ''}`, sigmayan ? 'hata' : 'tamam');
  }
  koordGit() {
    const x = this.deger('dvX'), y = this.deger('dvY'), z = this.deger('dvZ');
    if (x === '' || z === '') { this.mesaj('X ve Z girilmelidir.', 'hata'); return; }
    this.k(y === '' ? `isinla ${x} ${z}` : `isinla ${x} ${y} ${z}`);
  }
  yonGit(o) {
    const f = +this.deger('dvYonSec'), m = +this.deger('dvYonMesafe'), [dx, dz] = [[0, -1], [1, 0], [0, 1], [-1, 0]][f], P = o.oyuncu.konum;
    this.k(`isinla ${Math.round(P.x + dx * m)} ${Math.round(P.z + dz * m)}`);
  }
  batarya(o, a) {
    if (!this.izin(o)) return;
    if (!o.elektrik) { this.mesaj('Çok oyunculu istemcide batarya işlemleri kullanılamaz.', 'hata'); return; }
    let n = 0;
    for (const [k, [x, y, z]] of o.dunya.elektrikler) { const t = BLOKLAR[o.dunya.blok(x, y, z)]; if (t && t.elektrik === 'batarya') { o.dunya.enerji.set(k, a === 'doldur' ? t.kapasite : 0); n++; } }
    o.elektrik.hesapla(0.001); this.ses.tik();
    this.mesaj(n ? `${n} batarya ${a === 'doldur' ? 'dolduruldu' : 'boşaltıldı'}.` : 'Yüklü bölgede batarya yok.', n ? 'tamam' : 'hata');
  }
  canliIslem(o, a) {
    const v = o.etkilesim.hedefCanli;
    if (!v || v.olu || !this.izin(o)) return;
    if (o.istemci) { this.mesaj('Çok oyunculu istemcide canlıları sunucu yönetir.', 'hata'); return; }
    if (a === 'iyiles') v.can = v.tur.can; else if (a === 'oldur') o.varliklar.hasarVer(v, 9999, null, { sessiz: true }); else { o.varliklar.kaldir(v); o.etkilesim.hedefCanli = null; }
    this.ses.tik(); this.mesaj({ iyiles: 'Canlı iyileştirildi.', oldur: 'Canlı öldürüldü.', kaldir: 'Canlı kaldırıldı.' }[a], 'tamam');
    this.son.hedef = null;
  }
  bakilan(o) { return o.etkilesim.isin(o.oyuncu.gozKonumu(), o.oyuncu.bakisYonu()); }
  blokEsyasi(id) { const t = BLOKLAR[id]; return t.cihaz ? CIHAZ[t.cihaz].esya : t.gizli && t.taban ? t.taban : id; }

  /* Parça sınırı çizgileri */
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
  canliYaz(o) {
    const yaz = (id, m, html) => { if (this.son[id] === m) return; const el = $(id); if (!el) return; this.son[id] = m; if (html) el.innerHTML = m; else el.textContent = m; };
    const S = this.sekme, h = o.hayatta;
    if (S === 'oyuncu') {
      yaz('#dvXp', `${h.seviye}. seviye · ${Math.floor(h.xp)} puan · sonraki seviyeye %${Math.round((h.ilerleme || 0) * 100)}`);
      const et = Object.entries(h.etkiler || {}).filter(([k, t]) => t > 0 && ETKILER[k]).map(([k, t]) => `${ETKILER[k].ad} ${sureMetni(t)}`);
      yaz('#dvEtkiler', et.length ? 'Etkin: ' + et.join(', ') : 'Etkin etki yok');
    } else if (S === 'dunya') {
      const G = o.gecit, B = o.adaBekcisi;
      yaz('#dvGecit', G ? (G.acik() ? `Açık · ${G.sureMetni()} kaldı` : 'Kapalı · Büyülü Anahtar ile açılır') : '');
      yaz('#dvBekci', !B || o.istemci ? 'Sunucuda yönetilir' : B.canli() ? `Hayatta · ${Math.ceil(B.v.can)} / ${B.v.tur.can} can` : B.kalan > 0 ? `Yenildi · yeni bekçiye ${sureMetni(B.kalan)}` : 'Adaya yaklaşılınca doğar');
    } else if (S === 'canli') {
      const say = {};
      for (const v of o.varliklar.liste) if (!v.olu) { const a = v.tur.ad + (v.yavru > 0 ? ' (yavru)' : ''); say[a] = (say[a] || 0) + 1; }
      yaz('#dvSayim', Object.entries(say).sort((a, b) => b[1] - a[1]).map(([a, n]) => `<span>${esc(a)} <b>${n}</b></span>`).join('') || '<span>Yüklü bölgede canlı yok</span>', true);
    } else if (S === 'isinla') {
      const K = this.konsol.kesifDurumu();
      yaz('#dvKesif', K ? `Sürüyor · %${Math.floor(K.oran * 100)} (${K.biten.toLocaleString('tr')} / ${K.toplam.toLocaleString('tr')} parça)` : `Keşfedilen alan ${(o.harita.alan / 1e6).toFixed(2).replace('.', ',')} km²`);
    } else if (S === 'koy') {
      const k = this.konsol.yakinKoy(o), P = o.oyuncu.konum;
      yaz('#dvKoy', k ? `${k.ad} · ${o.koyler.icindeki === k ? 'içinde' : Math.round(Math.hypot(k.x - P.x, k.z - P.z)) + ' blok uzakta'} · ${k.koylular.length} köylü · itibar ${o.koyler.itibar(k.id)}` : 'Yakında köy yok');
    } else if (S === 'bilgi') { this.hedefYaz(o); this.grafikCiz(); const t = $('#dvTablo'); if (t) t.innerHTML = this.satirlar(o).map(([a, b]) => `<tr><th>${a}</th><td>${esc(b)}</td></tr>`).join(''); }
  }
  hedefYaz(o) {
    const el = $('#dvHedef'); if (!el) return;
    const v = o.etkilesim.hedefCanli && !o.etkilesim.hedefCanli.olu ? o.etkilesim.hedefCanli : null, h = v ? null : this.bakilan(o);
    let m;
    if (v) m = this.satir(esc(v.tur.ad), `Can ${Math.ceil(v.can)} / ${v.tur.can} · ${v.tur.dusman ? 'düşman' : v.evcil ? 'evcil' : 'barışçıl'} · ${o.oyuncu.konum.distanceTo(v.konum).toFixed(1)} blok`,
      this.islem('canliIyiles', 'İyileştir') + this.islem('canliOldur', 'Öldür', 'tehlike') + this.islem('canliKaldir', 'Kaldır'));
    else if (h) { const b = BLOKLAR[h.id]; m = this.satir(esc(b.ad), `#${h.id} · ${h.x}, ${h.y}, ${h.z} · sertlik ${b.sertlik < 0 ? 'kırılmaz' : String(b.sertlik).replace('.', ',')}`, this.islem('hedefVer', 'Eşyasını ver') + this.islem('hedefKir', 'Kır', 'tehlike')); }
    else m = '<p class="dvNot">Bakılan blok ya da canlı burada gösterilir.</p>';
    if (this.son.hedef !== m) { this.son.hedef = m; el.innerHTML = m; }
  }
  grafikCiz() {
    const cv = $('#dvGrafik'); if (!cv) return;
    const ctx = cv.getContext('2d'), W = cv.width, H = cv.height, n = this.kareler.length, ust = 50;
    ctx.fillStyle = '#100e0b'; ctx.fillRect(0, 0, W, H);
    for (const [ms, r] of [[16.7, 'rgba(105,195,90,.45)'], [33.3, 'rgba(232,163,61,.45)']]) { const y = H - ms / ust * H; ctx.fillStyle = r; ctx.fillRect(0, y, W, 1); }
    const w = W / n;
    for (let i = 0; i < n; i++) { const ms = this.kareler[(this.kareSira + i) % n], hh = Math.min(H, ms / ust * H); ctx.fillStyle = ms > 33.3 ? '#e0453c' : ms > 17.5 ? '#e8a33d' : '#69c35a'; ctx.fillRect(i * w, H - hh, Math.max(1, w - 1), hh); }
    ctx.fillStyle = 'rgba(241,233,220,.7)'; ctx.font = '11px Rubik, Arial, sans-serif'; ctx.fillText('Kare süresi (ms) · çizgiler 60 ve 30 FPS', 8, 14);
  }
  satirlar(o) {
    const P = o.oyuncu.konum, k = o.dunya.uretici.kolon(Math.floor(P.x), Math.floor(P.z), {}), V = o.varliklar.liste, m = performance.memory, inf = this.sahne.cizici.info;
    const l = [...this.kareler].filter(x => x > 0), ort = l.reduce((a, x) => a + x, 0) / Math.max(1, l.length);
    return [
      ['Sürüm / dünya', `HungerMan ${SURUM} · ${o.ad} · tohum ${o.tohum}`],
      ['Kare hızı', `${$('#fps').textContent || '-'} · ortalama ${ort.toFixed(1)} ms`],
      ['Çizim', `${inf.render.calls} çağrı · ${Math.round(inf.render.triangles / 1000)} bin üçgen · ${inf.memory.geometries} geometri`],
      ['Konum', `X ${P.x.toFixed(1)} · Y ${P.y.toFixed(1)} · Z ${P.z.toFixed(1)} · parça ${Math.floor(P.x / PB)}, ${Math.floor(P.z / PB)}`],
      ['Biyom / zemin', `${BIYOMLAR[k.b]} · ${k.h}`],
      ['Zaman', `${o.gun}. gün · ${$('#saatDeger').textContent} · hız ${o.zamanHizi ?? 1}×`],
      ['Hava', `${HAVA_ADI[o.hava.durum] || o.hava.durum} · yoğunluk %${Math.round(o.hava.yogunluk * 100)}`],
      ['Canlılar', `${V.length} (düşman ${V.filter(v => v.tur.dusman).length}, evcil ${V.filter(v => v.evcil).length}, köylü ${V.filter(v => v.tur.koylu).length})`],
      ['Yüklü parça', `${o.dunya.parcalar.size} (görüş ${o.dunya.gorus}) · ışık kaynağı ${o.dunya.mesaleler.size}`],
      ['Bellek', m ? `${Math.round(m.usedJSHeapSize / 1048576)} / ${Math.round(m.jsHeapSizeLimit / 1048576)} MB` : 'tarayıcı bildirmiyor'],
      ['Ağ', o.ag ? `${o.istemci ? 'istemci' : 'sunucu'} · ${o.ag.oyuncuListesi().length} oyuncu` : 'tek oyunculu']
    ];
  }
}
