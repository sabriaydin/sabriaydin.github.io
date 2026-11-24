/* HungerMan - giriş noktası: menüler, oyun döngüsü, girdi, kayıt */
import { SURUM, GUN_SURESI, PB, DENIZ, diyarMi, MEVSIMLER, MEVSIM_GUN, mevsimAl, zamanHizi, dunyaSurumAyarla } from './sabitler.js';
import { Sahne, THREE } from './grafik/sahne.js';
import { Dunya } from './dunya/dunya.js';
import { BIYOMLAR, BY } from './dunya/uretici.js';
import { BLOKLAR, ESYALAR, KATI, OPAK, buyuluMu, ESYA37, dusmeHasari } from './bloklar.js';
import { metinTohum } from './rastgele.js';
import { Oyuncu } from './oyun/oyuncu.js';
import { Envanter } from './oyun/envanter.js';
import { Hayatta, OLUM_SEBEBI } from './oyun/hayatta.js';
import { Dusenler } from './oyun/dusenler.js';
import { KumDusmesi } from './oyun/kum-dusmesi.js';
import { Etkilesim } from './oyun/etkilesim.js';
import { Olta } from './oyun/olta.js';
import { Tekneler } from './oyun/tekneler.js';
import { FenerIsiklari } from './grafik/fener.js';
import { Varliklar } from './varlik/varliklar.js';
import { TURLER } from './varlik/turler.js';
import { Koyler } from './koy/koyler.js';
import { Gorevler, yonAci } from './koy/gorevler.js';
import { koylerAlan, UZMANLIK } from './dunya/koy-uretici.js';
import { KoyluEkrani, GorevEkrani } from './arayuz/koylu-ekrani.js';
import { ISTASYON_BLOK, ISTASYON_ADI, ELOCAK } from './oyun/uretim.js';
import { Binek } from './oyun/binek.js';
import { Mekanik } from './oyun/mekanik.js';
import { Elektrik, enerjiMetni } from './oyun/elektrik.js';
import { CihazCizici } from './grafik/cihaz-cizici.js';
import { Taretler } from './oyun/taret.js';
import { kapFiltresiId, kapBoyu } from './oyun/kaplar.js';
import { Firinlar } from './oyun/firinlar.js';
import { T, EYLEMLER, VARSAYILAN_TUS, tuslariKur, tusKaydi, tusAta, basili, tusAdi, SABIT } from './sistem/tuslar.js';
import { SuAkisi } from './dunya/su-akisi.js';
import { Kablolar, kabloMaliyeti, KABLO } from './oyun/kablolar.js';
import { Gecit } from './oyun/gecit.js';
import { kaleAt } from './dunya/diyar-uretici.js';
import { lanetliAda, ADA_AD } from './dunya/ada-uretici.js';
import { GokOlaylari, kanliAyGunu } from './oyun/gok.js';
import { hissedilenSicaklik } from './oyun/sicaklik.js';
import { Ortam } from './oyun/ortam.js';
import { mezarKoy, mezarBosalt } from './oyun/mezar.js';
import { Ogretici } from './arayuz/ogretici.js';
import { Baskinlar } from './koy/baskin.js';
import { ZORLUKLAR, dengeDuzelt, DENGE_SECENEK, VARSAYILAN_DENGE, zorlukUygula } from './oyun/zorluk.js';
import { Hud } from './arayuz/hud.js';
import { EnvanterEkrani } from './arayuz/envanter-ekrani.js';
import { Ses } from './sistem/ses.js';
import { Muzik } from './sistem/muzik.js';
import { Kayit, ayarlariYukle, ayarlariKaydet, VARSAYILAN_AYAR, yedekDosyasi, yedekOku } from './sistem/kayit.js';
import { SunucuOyun } from './ag/sunucu.js';
import { IstemciOyun } from './ag/istemci.js';
import { katil, kodDuzelt } from './ag/baglanti.js';
import { RENKLER } from './ag/uzak-oyuncular.js';
import { Harita } from './harita/harita.js';
import { HaritaKayit } from './sistem/harita-kayit.js';
/* Dünya üretiminin sürümü: arazi üretimi değişince artar (eski harita kayıtları geçersiz olur) */
const URETIM_SURUMU = 10;
import { HaritaEkrani, MiniHarita } from './arayuz/harita-ekrani.js';
import { Basarimlar } from './oyun/basarimlar.js';
import { YapiOlaylari } from './oyun/yapilar.js';
import { AdaBekcisi } from './oyun/ada-bekcisi.js';
import { yapiAt } from './dunya/yapi-uretici.js';
import { BasarimEkrani } from './arayuz/basarim-ekrani.js';
import { TarifKitabi } from './arayuz/tarif-kitabi.js';
import { Dokunmatik, dokunmatikCihaz } from './arayuz/dokunmatik.js';
import { zindanAt } from './dunya/zindan-uretici.js';
import { batikAt } from './dunya/batik-uretici.js';
import { madenAt } from './dunya/maden-uretici.js';
import { Konsol } from './arayuz/konsol.js';
import { GelistiriciPenceresi } from './arayuz/gelistirici.js';
import { Hava, HAVA_ADI } from './grafik/hava.js';
import { mevsimDokulari, canliDokular, blokRengi } from './grafik/doku.js';

const $ = s => document.querySelector(s);
const tuval = $('#oyun');

/* Hata kutusu: beklenmeyen hatalar ekranda görünür */
function hataGoster(m) { const k = $('#hataKutusu'); k.textContent = 'Hata: ' + m; k.hidden = false; setTimeout(() => (k.hidden = true), 12000); }
addEventListener('error', e => hataGoster(e.message));
addEventListener('unhandledrejection', e => hataGoster(String(e.reason && e.reason.message || e.reason)));

$('#surum').textContent = 'Sürüm ' + SURUM;
const ayar = ayarlariYukle();
tuslariKur(ayar.tuslar);   // 0.30.7
if (!ayar.ad) { ayar.ad = 'Oyuncu' + (100 + Math.floor(Math.random() * 900)); ayarlariKaydet(ayar); }
if (ayar.miniHarita === undefined) ayar.miniHarita = true;
const ses = new Ses(); ses.duzeyAyarla(ayar.ses);
let ortamAtmosfer = null;   // 0.41.0: biyom atmosferi (sesler, sis, ateş böcekleri, sıcak dalgası)
/* 0.19.0: müzik; tarayıcılar sesi ilk dokunuş ya da tıklamadan sonra açar */
const muzik = new Muzik(); muzik.duzeyAyarla(ayar.muzik ?? 0.5);
addEventListener('pointerdown', () => { ses.baslat(); muzik.izinVer(); }, true);
addEventListener('keydown', () => { ses.baslat(); muzik.izinVer(); }, true);
let sahne;
try { sahne = new Sahne(tuval); } catch (e) { hataGoster('WebGL başlatılamadı. Tarayıcınız veya ekran kartı sürücünüz WebGL desteklemiyor olabilir.'); throw e; }
sahne.kamera.fov = ayar.fov; sahne.kamera.updateProjectionMatrix();

/* ---------- Ekran yönetimi ---------- */
const EKRANLAR = { ana: '#anaMenu', dunyalar: '#dunyalarEkrani', yeni: '#yeniEkrani', ayarlar: '#ayarlarEkrani', duraklat: '#duraklatEkrani', olum: '#olumEkrani', yukleme: '#yuklemeEkrani', cok: '#cokEkrani', bilgi: '#bilgiEkrani' };
let aktifEkran = 'ana', oncekiEkran = 'ana';
function ekran(ad) {
  if (ad === 'ayarlar') oncekiEkran = aktifEkran;
  for (const [k, s] of Object.entries(EKRANLAR)) $(s).hidden = k !== ad;
  if (ad === 'ayarlar') { const el = $(EKRANLAR[ad]); el.classList.toggle('menuArka', !oyun); el.classList.toggle('yari', !!oyun); }
  aktifEkran = ad;
  if (ad === 'ana') sunucuIstek = false;
  if (ad === 'dunyalar') { $('#dunyaAra').value = ''; dunyaListesi(); $('#dunyalarBaslik').textContent = sunucuIstek ? 'Açılacak Dünyayı Seçiniz' : 'Dünyalar'; }
  if (ad === 'cok') { $('#cokAd').value = ayar.ad; $('#cokDurum').hidden = true; setTimeout(() => $('#cokKod').focus(), 30); }
  if (ad === 'duraklat') agPanelCiz();
  if (ad === 'ayarlar') ayarFormu();
  if (ad === 'yeni') { $('#yeniTohum').value = ''; $('#yeniKomut').checked = false; $('#yeniKomut').disabled = true; $('#yeniKonsol').checked = false; $('#yeniVucut').checked = true; zorlukFormu('#yeniZorluk', 'normal', false); dengeFormu('yeni', VARSAYILAN_DENGE); setTimeout(() => $('#yeniAd').select(), 30); }
  /* 0.30.4: dünya ayarları oluşturulduktan sonra değiştirilemez; Dünya Ayarları ve Nasıl Oynanır ekranları kaldırıldı */
  tiklaGuncelle();
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-git]');
  if (!b || !EKRANLAR[b.dataset.git]) return;   // 0.30.3: yalnızca tanımlı ekranlar (bilinmeyen değer bütün ekranları gizliyordu)
  ses.baslat(); ses.tik();
  ekran(b.dataset.git);
});
$('#ayarTamam').onclick = () => { ses.tik(); ekran(oncekiEkran); };
/* 0.30.4: data-balon taşıyan öğelerin üzerine gelince bilgi baloncuğu (öğenin üstünde, ekran dışına taşmadan) */
{
  const B = $('#balon'); let hedef = null;
  const goster = el => {
    hedef = el; B.innerHTML = el.dataset.balon; B.hidden = false;
    const r = el.getBoundingClientRect(), w = B.offsetWidth, h = B.offsetHeight;
    let x = r.left + r.width / 2 - w / 2, y = r.top - h - 10, alt = false;
    if (y < 6) { y = r.bottom + 10; alt = true; }
    x = Math.max(6, Math.min(innerWidth - w - 6, x));
    B.style.left = x + 'px'; B.style.top = y + 'px'; B.classList.toggle('alt', alt);
    B.style.setProperty('--ok', (r.left + r.width / 2 - x) + 'px');
  };
  document.addEventListener('mouseover', e => { const el = e.target.closest && e.target.closest('[data-balon]'); if (el && el !== hedef) goster(el); else if (!el && hedef) { hedef = null; B.hidden = true; } });
  document.addEventListener('mousedown', () => { hedef = null; B.hidden = true; }, true);
  new MutationObserver(() => { if (hedef && !hedef.isConnected) { hedef = null; B.hidden = true; } }).observe(document.body, { childList: true, subtree: true });
}
/* 0.29.0: ayar kategorileri ve varsayılanlara dönüş */
$('#ayarSekmeler').addEventListener('click', e => {
  const b = e.target.closest('button[data-as]'); if (!b) return;
  ses.tik(); ayarSekme = b.dataset.as;
  for (const x of document.querySelectorAll('#ayarSekmeler button')) x.classList.toggle('on', x === b);
  for (const s of document.querySelectorAll('.ayarBolum')) s.hidden = s.dataset.as !== ayarSekme;
});
let ayarSekme = 'goruntu';
$('#ayarSifirla').onclick = e => {
  const b = e.currentTarget;
  if (!b.dataset.onay) { b.dataset.onay = '1'; b.textContent = 'Emin misiniz? Tekrar tıklayınız'; setTimeout(() => { if (b.isConnected) { delete b.dataset.onay; b.textContent = 'Varsayılanlara dön'; } }, 3000); return; }
  delete b.dataset.onay; b.textContent = 'Varsayılanlara dön';
  const korunan = { ad: ayar.ad, mobilVarsayilan: ayar.mobilVarsayilan };
  for (const k of Object.keys(ayar)) delete ayar[k];
  Object.assign(ayar, VARSAYILAN_AYAR, { dokunmatik: dokunmatikCihaz() }, korunan);
  tuslariKur(ayar.tuslar);
  if (dokunmatikCihaz()) ayar.gorus = Math.min(ayar.gorus, 5);   // mobil cihazlarda düşük görüş varsayılanı
  ses.tik(); ayarUygula(); ayarFormu();
};
/* 0.23.0: zorluk ve denge formları (yeni dünya) */
function zorlukFormu(kap, secili, mevcut) {
  const el = $(kap);
  const kart = el.classList.contains('zorlukKart');   // 0.29.2: yeni dünya ekranında açıklamalı kartlar
  el.innerHTML = Object.entries(ZORLUKLAR).map(([k, z]) => `<button type="button" data-z="${k}" class="${k === secili ? 'on' : ''}"${mevcut && k !== secili && (k === 'hardcore' || secili === 'hardcore') ? ' disabled' : ''}>${kart ? `<b>${z.ad}</b><small>${z.aciklama}</small>` : z.ad}</button>`).join('') + (kart ? '' : `<p>${ZORLUKLAR[secili].aciklama}</p>`);
  el.dataset.secili = secili;
}
function dengeFormu(onek, d) { for (const sel of document.querySelectorAll(`select[id^="${onek}"][data-denge]`)) { const k = sel.dataset.denge; sel.innerHTML = DENGE_SECENEK[k].map(([v, a]) => `<option value="${v}">${a}</option>`).join(''); sel.value = String(d[k]); } }
function dengeOku(onek) { const d = {}; for (const sel of document.querySelectorAll(`select[id^="${onek}"][data-denge]`)) d[sel.dataset.denge] = +sel.value; return dengeDuzelt(d); }
document.addEventListener('click', e => {
  const b = e.target.closest('.zorlukSec button[data-z]'); if (!b || b.disabled) return;
  const kap = b.parentNode; ses.tik();
  zorlukFormu('#' + kap.id, b.dataset.z, false);
});
$('#yeniKonsol').onchange = () => { const k = $('#yeniKonsol').checked; $('#yeniKomut').disabled = !k; if (!k) $('#yeniKomut').checked = false; };   // komutlar konsoldan girilir
/* Hardcore: izleyici kipi (uçarak, duvarlardan geçerek dolaşılır; hiçbir şeye dokunulamaz) */
function izleyiciYap(o) {
  o.izleyici = true; o.oyuncu.ucus = true; o.oyuncu.hayalet = true; o.hayatta.olumsuz = true; o.hayatta.tok = true; o.etkilesim.izleyici = true;
  document.body.classList.add('izleyici');
}

/* ---------- Ayarlar ---------- */
/* 0.23.0: grafik ön ayarları: görüş mesafesi, çizim çözünürlüğü ve kafa sallanması birlikte ayarlanır */
const GRAFIK_ON = { dusuk: { gorus: 4, cozunurluk: 1 }, orta: { gorus: 6, cozunurluk: 3 }, yuksek: { gorus: 8, cozunurluk: 0 }, ultra: { gorus: 12, cozunurluk: 4 } };
document.addEventListener('click', e => {
  const b = e.target.closest('#grafikOnAyar button[data-on]'); if (!b) return;
  Object.assign(ayar, GRAFIK_ON[b.dataset.on]); ses.tik(); ayarUygula(); ayarFormu();
  for (const x of document.querySelectorAll('#grafikOnAyar button')) x.classList.toggle('on', x === b);
});
function ayarFormu() {
  const bag = (id, anahtar, bicim, tur = 'range') => {
    const el = $(id), d = $(id + 'D');
    if (tur === 'range') { el.value = ayar[anahtar]; if (d) d.textContent = bicim(ayar[anahtar]); el.oninput = () => { ayar[anahtar] = +el.value; if (d) d.textContent = bicim(+el.value); ayarUygula(); onAyarIsaretle(); }; }
    else { el.checked = !!ayar[anahtar]; el.onchange = () => { ayar[anahtar] = el.checked; ayarUygula(); }; }
  };
  bag('#aGorus', 'gorus', v => v + ' parça');
  bag('#aFov', 'fov', v => v + '°');
  bag('#aHas', 'hassasiyet', v => v.toFixed(2).replace('.', ',') + '×');
  /* 0.29.1: geçerli değerlere uyan grafik ön ayarı işaretlenir */
  onAyarIsaretle();
  tusListesiCiz();
  bag('#aSes', 'ses', v => Math.round(v * 100) + '%');
  bag('#aMuzik', 'muzik', v => Math.round(v * 100) + '%');
  bag('#aCoz', 'cozunurluk', v => COZUNURLUK[v][0]);
  bag('#aParlak', 'parlaklik', v => Math.round(v * 100) + '%');
  bag('#aOlcek', 'arayuzOlcek', v => Math.round(v * 100) + '%');
  bag('#aArkaSessiz', 'arkaSessiz', null, 'cb'); bag('#aEnerji', 'enerjiPanel', null, 'cb');
  bag('#aTers', 'tersY', null, 'cb'); bag('#aSal', 'sallanma', null, 'cb'); bag('#aFps', 'fps', null, 'cb'); bag('#aMini', 'miniHarita', null, 'cb'); bag('#aDokun', 'dokunmatik', null, 'cb'); bag('#aBakilan', 'bakilanAd', null, 'cb'); bag('#aOgretici', 'ogretici', null, 'cb'); bag('#aOnizleme', 'onizleme', null, 'cb');
}
/* 0.30.7: tuş atamaları listesi; tıklanan eylem bir sonraki tuşu bekler */
let tusBekleyen = null;
function tusListesiCiz() {
  $('#tusListe').innerHTML = EYLEMLER.map(([, baslik, l]) => `<div class="tusGrup"><h5>${baslik}</h5>${l.map(([k, ad]) =>
    `<div class="tusSatir${T[k] !== VARSAYILAN_TUS[k] ? ' degisti' : ''}"><span>${ad}</span><button type="button" data-tus="${k}" class="${tusBekleyen === k ? 'bekliyor' : ''}" title="Değiştirmek için tıklayınız · sağ tık: varsayılan (${tusAdi(VARSAYILAN_TUS[k])})">${tusBekleyen === k ? 'Bir tuşa basınız…' : tusAdi(T[k])}</button></div>`).join('')}</div>`).join('');
}
function tusKaydet() { ayar.tuslar = tusKaydi(); ayarlariKaydet(ayar); }
$('#tusListe').addEventListener('click', e => { const b = e.target.closest('[data-tus]'); if (!b) return; ses.tik(); tusBekleyen = tusBekleyen === b.dataset.tus ? null : b.dataset.tus; tusListesiCiz(); });
$('#tusListe').addEventListener('contextmenu', e => {
  const b = e.target.closest('[data-tus]'); if (!b) return; e.preventDefault();
  tusAta(b.dataset.tus, VARSAYILAN_TUS[b.dataset.tus]); tusBekleyen = null; tusKaydet(); ses.tik(); tusListesiCiz();
});
$('#tusSifirla').onclick = () => { tuslariKur({}); tusBekleyen = null; tusKaydet(); ses.tik(); tusListesiCiz(); };
addEventListener('keydown', e => {
  if (!tusBekleyen) return;
  e.preventDefault(); e.stopImmediatePropagation();
  const k = tusBekleyen; tusBekleyen = null;
  if (e.code === 'Escape') { tusListesiCiz(); return; }
  if (SABIT.has(e.code)) { tusListesiCiz(); const el = $('#tusListe').querySelector(`[data-tus="${k}"]`); if (el) { el.classList.add('hata'); el.textContent = 'Bu tuş atanamaz'; setTimeout(tusListesiCiz, 1200); } return; }
  const diger = tusAta(k, e.code); tusKaydet(); ses.tik(); tusListesiCiz();
  if (diger) { const el = $('#tusListe').querySelector(`[data-tus="${diger}"]`); if (el) el.classList.add('yerDegisti'); }
}, true);
addEventListener('mousedown', e => { if (tusBekleyen && !e.target.closest('[data-tus]')) { tusBekleyen = null; tusListesiCiz(); } }, true);
function onAyarIsaretle() { for (const x of document.querySelectorAll('#grafikOnAyar button')) { const g = GRAFIK_ON[x.dataset.on]; x.classList.toggle('on', g.gorus === ayar.gorus && g.cozunurluk === (ayar.cozunurluk | 0)); } }
/* 0.19.0: çözünürlük: otomatik ya da sabit ölçek */
const COZUNURLUK = [['Otomatik', 0], ['%50', 0.5], ['%67', 0.67], ['%85', 0.85], ['%100', 1]];
function ayarUygula() {
  ayarlariKaydet(ayar);
  sahne.kamera.fov = ayar.fov; sahne.kamera.updateProjectionMatrix();
  ses.duzeyAyarla(ayar.ses); muzik.duzeyAyarla(ayar.muzik ?? 0.5);
  { const c = COZUNURLUK[ayar.cozunurluk | 0] || COZUNURLUK[0]; if (c[1]) sahne.olcekAyarla(c[1]); }
  if (oyun && oyun.dunya.gorus !== ayar.gorus) oyun.dunya.gorusAyarla(ayar.gorus);
  $('#fps').hidden = !ayar.fps;
  $('#miniHarita').hidden = !ayar.miniHarita;
  dokun.ayarla(ayar.dokunmatik);
  gorunumAyarla(); arkaSesAyarla();
}
/* 0.29.0: parlaklık ve arayüz boyutu */
function gorunumAyarla() {
  $('#oyun').style.filter = (ayar.parlaklik ?? 1) !== 1 ? `brightness(${ayar.parlaklik})` : '';
  document.documentElement.style.fontSize = (ayar.arayuzOlcek ?? 1) !== 1 ? (15 * ayar.arayuzOlcek).toFixed(2) + 'px' : '';
}
function arkaSesAyarla() {
  const sessiz = !!ayar.arkaSessiz && document.hidden;
  ses.duzeyAyarla(sessiz ? 0 : ayar.ses);
  if (muzik.el) muzik.el.muted = sessiz;
}
document.addEventListener('visibilitychange', arkaSesAyarla);

/* ---------- Dünya listesi ---------- */
const tarih = t => new Date(t).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
/* 0.29.2: dünya kartları: arama, sıralama, rozetler */
let dunyaVeri = [];
const DUNYA_RENK = ['#4f8f4a', '#3f7fa8', '#a8743f', '#8a5aa8', '#a84f5a', '#3f9a8f', '#9a8a3f', '#5a6aa8'];
async function dunyaListesi() {
  const kap = $('#dunyaListe');
  try { dunyaVeri = await Kayit.listele(); } catch (e) { dunyaVeri = []; $('#dunyaSayi').textContent = ''; kap.innerHTML = '<div class="bos">Tarayıcı depolaması kullanılamıyor; dünyalar kaydedilemez.</div>'; return; }
  dunyaCiz();
}
function dunyaCiz() {
  const kap = $('#dunyaListe'), ara = ($('#dunyaAra').value || '').trim().toLocaleLowerCase('tr'), sira = $('#dunyaSira').value;
  $('#dunyaSayi').textContent = dunyaVeri.length ? `${dunyaVeri.length} dünya` : '';
  if (!dunyaVeri.length) { kap.innerHTML = '<div class="bos"><b>Henüz kayıtlı dünya mevcut değil.</b><span>"Yeni Dünya" ile ilk dünyanızı oluşturunuz ya da bir yedek yükleyiniz.</span></div>'; return; }
  let l = dunyaVeri.filter(d => !ara || String(d.ad).toLocaleLowerCase('tr').includes(ara) || String(d.tohum).includes(ara));
  l = l.sort(sira === 'ad' ? (a, b) => String(a.ad).localeCompare(String(b.ad), 'tr') : sira === 'gun' ? (a, b) => b.gun - a.gun : sira === 'yeni' ? (a, b) => (b.olusturma || 0) - (a.olusturma || 0) : (a, b) => b.son - a.son);
  if (!l.length) { kap.innerHTML = '<div class="bos">Aramaya uyan dünya mevcut değil.</div>'; return; }
  kap.innerHTML = l.map(d => {
    const z = ZORLUKLAR[d.zorluk] || ZORLUKLAR.normal, renk = DUNYA_RENK[(d.tohum >>> 0) % DUNYA_RENK.length], harf = esc((String(d.ad).trim()[0] || '?').toLocaleUpperCase('tr'));
    const rozet = [`<span class="rozet z-${esc(d.zorluk)}">${z.ad}${d.zorluk === 'hardcore' && d.bitti ? ' · sona erdi' : ''}</span>`,
      d.komutlar ? '<span class="rozet">Komutlar</span>' : '', d.konsol ? '<span class="rozet">Konsol</span>' : '', d.vucutIsisi === false ? '<span class="rozet soluk">Vücut ısısı kapalı</span>' : ''].join('');
    return `<article class="dunya${d.bitti ? ' bitti' : ''}">
      <div class="dunyaRozet" style="--r:${renk}">${harf}</div>
      <div class="dunyaBilgi"><b title="${esc(d.ad)}">${esc(d.ad)}</b><div class="rozetler">${rozet}</div>
        <dl><dt>Gün</dt><dd>${d.gun}</dd><dt>Son oynama</dt><dd>${tarih(d.son)}</dd><dt>Tohum</dt><dd><button type="button" class="tohumKopya" data-tohum="${esc(d.tohum)}" title="Tohumu kopyala">${esc(d.tohum)}</button></dd></dl></div>
      <div class="islem"><button class="dugme ana" data-oyna="${d.id}">${d.bitti ? 'İzle' : 'Oyna'}</button><button class="dugme kucuk" data-indir="${d.id}" title="Dünyayı dosya olarak indir">Yedekle</button><button class="dugme kucuk tehlike" data-sil="${d.id}">Sil</button></div>
    </article>`;
  }).join('');
}
$('#dunyaAra').addEventListener('input', dunyaCiz);
$('#dunyaAra').addEventListener('keydown', e => e.stopPropagation());
$('#dunyaSira').addEventListener('change', () => { ses.tik(); dunyaCiz(); });
$('#tohumZar').onclick = () => { ses.tik(); $('#yeniTohum').value = String((Math.random() * 4294967296) >>> 0); };
$('#yedekYukle').onclick = () => { ses.tik(); $('#yedekDosya').value = ''; $('#yedekDosya').click(); };
$('#yedekDosya').onchange = async () => {
  const f = $('#yedekDosya').files[0]; if (!f) return;
  try {
    const v = await yedekOku(f);
    v.id = 'd' + Date.now().toString(36); v.son = Date.now(); delete v.surum;
    await Kayit.kaydet(v); ses.tik(); dunyaListesi();
  } catch (e) { $('#dunyaListe').insertAdjacentHTML('afterbegin', `<div class="bos">Yedek yüklenemedi: ${esc(e.message || 'dosya okunamadı')}</div>`); }
};
$('#dunyaListe').addEventListener('click', async e => {
  const tk = e.target.closest('[data-tohum]');
  if (tk) { try { await navigator.clipboard.writeText(tk.dataset.tohum); tk.classList.add('kopyalandi'); setTimeout(() => tk.classList.remove('kopyalandi'), 1200); } catch (x) { /* pano kapalı */ } return; }
  const o = e.target.closest('[data-oyna]'), s = e.target.closest('[data-sil]');
  ses.baslat();
  if (o) { ses.tik(); dunyaAc(o.dataset.oyna); }
  /* 0.23.0: yedek indirme ve önceki oturuma dönme */
  const ind = e.target.closest('[data-indir]');
  if (ind) {
    ses.tik(); const v = await Kayit.yukle(ind.dataset.indir); if (!v) return;
    const b = await yedekDosyasi({ ...v, surum: SURUM }), a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = `${String(v.ad).replace(/[^\p{L}\p{N}_-]+/gu, '_')}.hmdunya`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  if (s) {
    if (s.dataset.onay) { await Kayit.sil(s.dataset.sil); HaritaKayit.sil(s.dataset.sil).catch(() => {}); ses.tik(); dunyaListesi(); }
    else { s.dataset.onay = '1'; s.textContent = 'Onayla'; setTimeout(() => { if (s.isConnected) { delete s.dataset.onay; s.textContent = 'Sil'; } }, 3000); }
  }
});
/* 0.42.0: dünya açma. Kayıt okunamaz ya da dünya kurulurken hata çıkarsa son başarılı açılıştaki kopyası (~yedek) denenir.
   Yedek kopya artık açılıştan önce değil, dünya hatasız yüklendikten sonra yazılır (bozuk kayıt yedeğin üzerine yazılmaz). */
function oyunuGuvenliBitir() { try { oyunBitir(); } catch (e) { oyun = null; $('#hud').hidden = true; } }
async function dunyaAc(id) {
  const ac = v => { const s = sunucuIstek; oyunBaslat(v); if (oyun) { oyun.sunucuIstek = s; oyun.acilisKaydi = v; } };
  let v = null, hata = null;
  try { v = await Kayit.yukle(id); if (!v || v.tohum == null) throw new Error('kayıt okunamadı'); ac(v); return; }
  catch (e) { hata = e; oyunuGuvenliBitir(); }
  let y = null;
  try { y = await Kayit.yukle(id + '~yedek'); } catch (e) { y = null; }
  if (y && y.tohum != null) {
    try {
      ac({ ...y, id });
      if (oyun) oyun.yedektenAcildi = true;
      return;
    } catch (e) { oyunuGuvenliBitir(); }
  }
  ekran('dunyalar'); dunyaListesi();
  hataGoster(`Dünya açılamadı (${hata && hata.message || 'bilinmeyen hata'}). Kullanılabilir bir yedek kopyası da mevcut değil.`);
}
$('#yeniOlustur').onclick = () => {
  ses.baslat(); ses.tik();
  const ad = $('#yeniAd').value.trim() || 'Yeni Dünya';
  const t = $('#yeniTohum').value.trim();
  const tohum = t ? metinTohum(t) : (Math.random() * 4294967296) >>> 0;
  const s = sunucuIstek;
  oyunBaslat({ id: 'd' + Date.now().toString(36), ad, tohum, olusturma: Date.now(), yeni: true, uretici: 2, komutlar: $('#yeniKonsol').checked && $('#yeniKomut').checked, konsol: $('#yeniKonsol').checked, vucutIsisi: $('#yeniVucut').checked, zorluk: $('#yeniZorluk').dataset.secili || 'normal', denge: dengeOku('yeni') });
  if (oyun) oyun.sunucuIstek = s;
};
$('#yeniAd').addEventListener('keydown', e => { if (e.key === 'Enter') $('#yeniOlustur').click(); });
$('#yeniTohum').addEventListener('keydown', e => { if (e.key === 'Enter') $('#yeniOlustur').click(); });

/* ---------- Girdi ---------- */
const tus = {};
const fare = { sol: false, sag: false };
let kilitli = false, bilerekBirak = false, sonW = 0, kosKilit = false;
addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (oyun && aktifEkran === 'oyun') {
    /* 0.23.0: fotoğraf modu: F1 göstergeleri ve eli gizler, F2 ekran görüntüsü kaydeder */
    if (e.code === T.foto && !e.repeat) { e.preventDefault(); oyun.fotoModu = !oyun.fotoModu; document.body.classList.toggle('gostergesiz', oyun.fotoModu); hud.bildirim(oyun.fotoModu ? 'Fotoğraf modu: göstergeler gizlendi (F1 ile geri gelir, F2 ile kaydedilir).' : 'Göstergeler açıldı.'); return; }
    if (e.code === T.ekran && !e.repeat) { e.preventDefault(); ekranGoruntusu(); ses.tik(); $('#gokParla') && sahne.parlama(0.35); if (!oyun.fotoModu) hud.bildirim('Ekran görüntüsü kaydedildi.'); return; }
    if ([T.zipla, T.liste, T.hata, T.envanter, T.at, 'Tab', 'Space'].includes(e.code) || (e.ctrlKey && ['KeyS', 'KeyD', 'KeyF'].includes(e.code))) e.preventDefault();
    if (e.code === T.liste && oyun.ag) oyuncuListesiGoster(true);
    /* Geliştirici konsolu: F8 (veya 1 tuşunun solundaki tuş) */
    if (e.code === T.gelistirici && !e.repeat && oyun.gelistirici) { e.preventDefault(); if (gelPencere.acik) panelKapat(true); else if (!panelAcik()) panelAc(gelPencere); return; }
    if ((e.code === T.konsol || (e.code === 'Backquote' && !Object.values(T).includes('Backquote'))) && !e.repeat && oyun.konsol) { e.preventDefault(); if (konsol.acik) panelKapat(true); else if (!panelAcik() && !oyun.hayatta.olu) panelAc(konsol); return; }
    if (e.repeat) { tus[e.code] = true; return; }
    tus[e.code] = true;
    if (e.code === T.zipla) ziplaBasildi = true;   // 0.43.0: iki kare arasında basılıp bırakılan zıplama kaybolmaz
    if (e.code === T.ileri) { const t = performance.now(); if (t - sonW < 280) kosKilit = true; sonW = t; }
    /* 0.15.1: Q envanter ve üretim, E nesnelerle etkileşim, G eşya atma */
    if (e.code === T.etkiles && !e.repeat && (envEkrani.acik || koyluEkrani.acik)) { if (envEkrani.acik) envanterAcKapa(); else panelKapat(true); return; }
    if (e.code === T.envanter) { if (koyluEkrani.acik || gorevEkrani.acik || haritaEkrani.acik) panelKapat(true); else envanterAcKapa(); return; }
    if (e.code === T.gorev) { if (gorevEkrani.acik) panelKapat(true); else if (!panelAcik()) panelAc(gorevEkrani); return; }
    if (e.code === T.harita) { if (haritaEkrani.acik) panelKapat(true); else if (!panelAcik()) panelAc(haritaEkrani, oyun); return; }
    if (e.code === T.basarim) { if (basarimEkrani.acik) panelKapat(true); else if (!panelAcik()) panelAc(basarimEkrani); return; }
    if (e.code === T.tarif) { if (tarifKitabi.acik) panelKapat(true); else if (!panelAcik()) panelAc(tarifKitabi, oyun.envanter, yakinIstasyonlar(), eldekiTarif()); return; }
    if (e.code === 'Escape' && haritaEkrani.acik && haritaEkrani.formAcik) { haritaEkrani.formKapat(); return; }
    if (haritaEkrani.acik && (e.code === 'Equal' || e.code === 'NumpadAdd' || e.code === 'Minus' || e.code === 'NumpadSubtract')) { haritaEkrani.yakinlas(e.code === 'Equal' || e.code === 'NumpadAdd' ? 1 : -1); return; }
    if (e.code === 'Escape' && panelAcik()) { if (envEkrani.acik) envanterKapat(false); else panelKapat(false); return; }
    if (!kilitli) return;
    if (e.code.startsWith('Digit')) { const n = +e.code.slice(5); if (n >= 1 && n <= 9) seciliAyarla(n - 1); }
    if (e.code === T.at) oyun.etkilesim.at(e.shiftKey);
    /* 0.25.0: R: elde tutulan cihazın ya da yönlü bloğun konulacağı yönü çevirir */
    if (e.code === T.dondur && !e.repeat && oyun.etkilesim.kablo) { oyun.etkilesim.kabloIptal(); ses.tik(); }
    else if (e.code === T.dondur && !e.repeat && oyun.etkilesim.dondurulebilir(oyun.envanter.seciliId())) { const n = oyun.etkilesim.dondur(); ses.tik(); oyun.hud.bildirim(`Yerleştirme yönü çevrildi (${n * 90}°)`); }
    if (e.code === T.etkiles && !e.repeat) oyun.etkilesim.etkiles();
    if ((e.code === T.sohbet || e.code === 'Enter') && oyun.ag) { e.preventDefault(); sohbetAc(); }
    if (e.code === T.hata) $('#hata').hidden = !$('#hata').hidden;
  }
});
addEventListener('keyup', e => { tus[e.code] = false; if (e.code === T.ileri) kosKilit = false; if (e.code === T.liste) oyuncuListesiGoster(false); });
addEventListener('blur', () => { for (const k in tus) tus[k] = false; fare.sol = fare.sag = false; });
tuval.addEventListener('mousedown', e => {
  ses.baslat();
  if (!oyun || aktifEkran !== 'oyun') return;
  if (sohbetAcik) sohbetKapat(false);
  if (!kilitli) { kilitle(); return; }
  if (e.button === 0) fare.sol = true;
  if (e.button === 2) fare.sag = true;
});
addEventListener('mouseup', e => { if (e.button === 0) fare.sol = false; if (e.button === 2) fare.sag = false; });
tuval.addEventListener('contextmenu', e => e.preventDefault());
addEventListener('wheel', e => {
  if (!oyun || !kilitli) return;
  /* 0.27.0: Shift + tekerlek: çekilen kablonun sarkması (yukarı: gergin, aşağı: sarkık) */
  if ((tus.ShiftLeft || tus.ShiftRight || e.shiftKey) && oyun.etkilesim.kablo) { oyun.etkilesim.kabloSarkma((e.deltaY || e.deltaX) > 0 ? 1 : -1); return; }
  const n = (oyun.envanter.secili + (e.deltaY > 0 ? 1 : -1) + 9) % 9;
  seciliAyarla(n);
}, { passive: true });
document.addEventListener('mousemove', e => {
  if (!kilitli || !oyun || oyun.hayatta.olu) return;
  if (Math.abs(e.movementX) > 400 || Math.abs(e.movementY) > 400) return; /* kilit alınırken gelen ani sıçramalar */
  const o = oyun.oyuncu, k = 0.0022 * ayar.hassasiyet;
  o.yaw -= e.movementX * k;
  o.pitch -= e.movementY * k * (ayar.tersY ? -1 : 1);
  o.pitch = Math.max(-1.56, Math.min(1.56, o.pitch));
});
/* 0.19.0: dokunmatik kontroller: fare kilidi yerine oyun kendi kilit durumunu tutar */
const dokun = new Dokunmatik({ tus, fare, kilitle: () => kilitle(), kosKilit: v => { kosKilit = v; },
  oyunda: () => !!(oyun && aktifEkran === 'oyun' && kilitli && !panelAcik() && !oyun.hayatta.olu),
  bak: (dx, dy) => { const o = oyun.oyuncu, k = 0.0048 * ayar.hassasiyet; o.yaw -= dx * k; o.pitch = Math.max(-1.56, Math.min(1.56, o.pitch - dy * k * (ayar.tersY ? -1 : 1))); },
  eylem: (ad, n) => {
    if (!oyun) return;
    if (ad === 'yuva') { if (n >= 0 && n < 9) seciliAyarla(n); return; }
    if (ad === 'menu') { if (panelAcik()) panelKapat(true); else { bilerekBirak = true; kilitBirak(); duraklat(); } return; }
    if (ad === 'envanter') envanterAcKapa();
    else if (ad === 'etkiles') oyun.etkilesim.etkiles();
    else if (ad === 'at') oyun.etkilesim.at(false);
    else if (ad === 'harita') panelAc(haritaEkrani, oyun);
    else if (ad === 'kitap') panelAc(tarifKitabi, oyun.envanter, yakinIstasyonlar(), eldekiTarif());
  } });
if (ayar.dokunmatik === undefined) ayar.dokunmatik = dokunmatikCihaz();
/* Telefon ve tabletlerde ilk açılışta görüş mesafesi düşük başlar */
if (ayar.mobilVarsayilan === undefined) { ayar.mobilVarsayilan = true; if (dokunmatikCihaz()) ayar.gorus = Math.min(ayar.gorus, 5); ayarlariKaydet(ayar); }
dokun.ayarla(ayar.dokunmatik);
function kilitBirak() {
  if (dokun.aktif) { kilitli = false; fare.sol = fare.sag = false; dokun.sifirla(); if (oyun && aktifEkran === 'oyun' && !bilerekBirak && !panelAcik() && !oyun.hayatta.olu) duraklat(); bilerekBirak = false; tiklaGuncelle(); return; }
  document.exitPointerLock();
}
function kilitle() {
  if (oyun && oyun.olumAnim > 0) return;   // 0.23.0: ölüm animasyonu sırasında oyuna dönülmez
  if (dokun.aktif) {
    kilitli = true; tiklaGuncelle();
    /* Telefonlarda tam ekran ve yatay yön denenir (desteklenmezse sessizce geçilir) */
    try { if (!document.fullscreenElement && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {})).catch(() => {}); } catch (e) { /* desteklenmiyor */ }
    return;
  }
  try { const p = tuval.requestPointerLock(); if (p && p.catch) p.catch(() => tiklaGuncelle()); } catch (e) { /* tarayıcı reddetti */ }
}
document.addEventListener('pointerlockchange', () => {
  kilitli = document.pointerLockElement === tuval;
  if (!kilitli) {
    fare.sol = fare.sag = false;
    if (oyun && aktifEkran === 'oyun' && !bilerekBirak && !panelAcik() && !oyun.hayatta.olu) duraklat();
  }
  bilerekBirak = false;
  tiklaGuncelle();
});
function tiklaGuncelle() { $('#tikla').hidden = !(oyun && aktifEkran === 'oyun' && !kilitli && !panelAcik() && !sohbetAcik && !(oyun.olumAnim > 0)); }
function panelAcik() { return envEkrani.acik || koyluEkrani.acik || gorevEkrani.acik || haritaEkrani.acik || konsol.acik || gelPencere.acik || basarimEkrani.acik || tarifKitabi.acik; }
function seciliAyarla(n) { oyun.envanter.secili = n; oyun.hud.cubukCiz(); oyun.hud.esyaAdiGoster(); ses.tik(); }

/* ---------- Envanter ekranı ---------- */
const envEkrani = new EnvanterEkrani({
  ses,
  istasyonlar: () => yakinIstasyonlar(),
  birak: (id, adet, dayanim, buyu) => { if (!oyun) return; const o = oyun.oyuncu, y = o.bakisYonu(), g = o.gozKonumu(); oyun.dusenler.birak(id, adet, g.x + y.x * 0.6, g.y - 0.3, g.z + y.z * 0.6, y.x * 4, 2, y.z * 4, dayanim, 1.5, buyu); }
});
envEkrani.kapatIste = () => envanterKapat(true);
/* 0.30.1: üretim panelinden tarif takibi */
envEkrani.takip = { get: () => tarifKitabi.takip, set: i => tarifKitabi.takipEt(i) };
/* 0.30.0: karakter önizlemesinin gömlek rengi: çok oyunculuda oyuncunun rengi */
envEkrani.renk = () => { const ag = oyun && oyun.ag; if (ag && ag.oyuncuListesi) { const b = ag.oyuncuListesi().find(o => o[0] === ag.benimId); if (b) return RENKLER[b[2] % RENKLER.length]; } return RENKLER[1]; };
/* Çok oyunculu: sandık kapanınca içerik sunucuya gider (sunucuda kilit kalkar) */
envEkrani.kapandi = s => {
  if (!oyun || !s.k) return;
  if (oyun.ag) { if (oyun.istemci) oyun.ag.sandikKapat(s.k, s.yuvalar); else oyun.ag.sandikBirak(s.k); }
  /* 0.22.0: boşaltılan mezar taşı kaybolur */
  const [x, y, z] = String(s.k).split(',').map(Number), b = BLOKLAR[oyun.dunya.blok(x, y, z)];
  if (b && b.mezar && s.yuvalar.every(e => !e)) { oyun.basarimlar.ver('mezar'); oyun.hud.bildirim('Mezar taşı boşaltıldı.'); if (!oyun.istemci) mezarBosalt(oyun.dunya, s.k); }
};
function envanterAcKapa(istasyon, sandik) {
  if (!oyun || oyun.hayatta.olu) return;
  if (envEkrani.acik) envanterKapat(true);
  else { if (kilitli) { bilerekBirak = true; kilitBirak(); } envEkrani.ac(istasyon, sandik); if (sandik) ses.sandik(); else if (istasyon === 'tencere') ses.tencere(); else ses.ac(); tiklaGuncelle(); }
}
/* Köylü ve görev pencereleri */
envEkrani.firinDurum = k => (oyun && oyun.firinlar ? oyun.firinlar.durum.get(k) : null);   // 0.33.0
const koyluEkrani = new KoyluEkrani({ ses, kapatIste: () => panelKapat(true) });
const gorevEkrani = new GorevEkrani({ ses, kapatIste: () => panelKapat(true) });
/* Başarımlar: L tuşu ya da duraklatma menüsü */
const basarimEkrani = new BasarimEkrani({ ses, kapatIste: () => { if (basarimEkrani.menudenAcildi) { basarimEkrani.menudenAcildi = false; basarimEkrani.kapat(); ses.kapa(); ekran('duraklat'); } else panelKapat(true); } });
/* 0.17.0: Tarif Kitabı (B); takip edilen tarif ayarlarda saklanır */
const tarifKitabi = new TarifKitabi({ ses, kapatIste: () => panelKapat(true), takipDegisti: i => { ayar.tarifTakip = i; ayarlariKaydet(ayar); } });
/* Kitap açılınca eldeki eşya seçili gelir */
function eldekiTarif() { const id = oyun && oyun.envanter.seciliId(); return id && ESYALAR[id] && !ESYALAR[id].gizli ? id : null; }
/* Büyüleme ve örs: başarım olayları */
envEkrani.olay = k => { if (oyun && oyun.basarimlar) oyun.basarimlar.ver(k); };
/* Harita: M ile açılan büyük harita ve sağ üstteki mini harita */
const haritaEkrani = new HaritaEkrani({ ses, kapatIste: () => panelKapat(true) });
const miniHarita = new MiniHarita();
$('#miniHarita').hidden = !ayar.miniHarita;
gorunumAyarla();   // 0.29.0
const konsol = new Konsol({ ses, oyun: () => oyun, kapatIste: () => panelKapat(true), arayuz: {
  fps: () => { ayar.fps = !ayar.fps; ayarlariKaydet(ayar); $('#fps').hidden = !ayar.fps; return ayar.fps; },
  fpsMetni: () => $('#fps').textContent || '-',
  hataPaneli: () => { $('#hata').hidden = !$('#hata').hidden; },
  kaydet: () => oyunKaydet(),
  gorusAyarla: n => { ayar.gorus = n; ayarlariKaydet(ayar); if (oyun) oyun.dunya.gorusAyarla(n); },
  haritaAc: () => { panelKapat(false); if (oyun) panelAc(haritaEkrani, oyun); },
  gecitGec: h => { panelKapat(false); gecitGec(h); },
  gelistiriciAc: () => { panelKapat(false); if (oyun) panelAc(gelPencere); },
  sahne: () => sahne,
  /* Keşfedilen harita bellekten ve tarayıcı deposundan silinir */
  haritaSifirla: () => { if (!oyun) return; oyun.harita.sifirla(); HaritaKayit.sil(oyun.haritaKimlik).catch(() => {}); },
  ekranGoruntusu: () => ekranGoruntusu()
} });
/* Oyun görüntüsünü (göstergeler olmadan) PNG olarak indir */
function ekranGoruntusu() {
  if (!oyun) return;
  const elGor = sahne.el.visible; if (oyun.fotoModu) sahne.el.visible = false;
  sahne.ciz(); sahne.el.visible = elGor;
  const t = new Date(), iki = n => String(n).padStart(2, '0');
  const ad = `hungerman-${t.getFullYear()}${iki(t.getMonth() + 1)}${iki(t.getDate())}-${iki(t.getHours())}${iki(t.getMinutes())}${iki(t.getSeconds())}.png`;
  const a = document.createElement('a');
  a.href = sahne.cizici.domElement.toDataURL('image/png'); a.download = ad;
  document.body.appendChild(a); a.click(); a.remove();
}
/* Geliştirici modu penceresi (F9): konsolda geliştirici kodu girildikten sonra kullanılır */
const gelPencere = new GelistiriciPenceresi({ ses, konsol, sahne, oyun: () => oyun, kapatIste: () => panelKapat(true), arayuz: {
  haritaAc: () => { panelKapat(false); if (oyun) panelAc(haritaEkrani, oyun); },
  gecitGec: h => { panelKapat(false); gecitGec(h); },
  konsolAc: () => { panelKapat(false); if (oyun) panelAc(konsol); },
  fovAyarla: v => { ayar.fov = v; ayarlariKaydet(ayar); },
  fpsAc: v => { ayar.fps = v; ayarlariKaydet(ayar); $('#fps').hidden = !v; },
  hataAc: v => { $('#hata').hidden = !v; },
  miniAc: v => { ayar.miniHarita = v; ayarlariKaydet(ayar); $('#miniHarita').hidden = !v; }
} });
/* Büyük haritada Ctrl + tık: komutlar açıksa tıklanan yere ışınlanma */
haritaEkrani.isinla = (x, z) => { panelKapat(true); konsol.calistir(`isinla ${x} ${z}`); };
function panelAc(panel, ...a) {
  if (!oyun || oyun.hayatta.olu || panelAcik()) return;
  if (kilitli) { bilerekBirak = true; kilitBirak(); }
  fare.sol = fare.sag = false;
  panel.ac(...a); tiklaGuncelle();   // 0.30.5: konsol sessiz açılır
}
function panelKapat(kilitlensin) {
  if (koyluEkrani.acik) koyluEkrani.kapat();
  if (gorevEkrani.acik) gorevEkrani.kapat();
  if (haritaEkrani.acik) haritaEkrani.kapat();
  const sessiz = konsol.acik;   // 0.30.5: konsol sessiz kapanır
  if (konsol.acik) konsol.kapat();
  if (gelPencere.acik) gelPencere.kapat();
  if (basarimEkrani.acik) basarimEkrani.kapat();
  if (tarifKitabi.acik) tarifKitabi.kapat();
  if (!sessiz) ses.kapa();
  if (kilitlensin) kilitle();
  tiklaGuncelle();
}
function envanterKapat(kilitlensin) {
  envEkrani.kapat(); ses.kapa();
  if (kilitlensin) kilitle();
  tiklaGuncelle();
}
function yakinIstasyonlar() {
  const s = new Set();
  if (!oyun) return s;
  const p = oyun.oyuncu.konum;
  const x0 = Math.floor(p.x), y0 = Math.floor(p.y), z0 = Math.floor(p.z);
  for (let y = -3; y <= 3; y++) for (let z = -6; z <= 6; z++) for (let x = -6; x <= 6; x++) {   // 0.35.0: istasyon menzili 4'ten 6 bloğa
    const b = oyun.dunya.blok(x0 + x, y0 + y, z0 + z);
    for (const [k, id] of Object.entries(ISTASYON_BLOK)) if (b === id) s.add(k);
    if (BLOKLAR[b] && BLOKLAR[b].firinKap === 'firin') s.add('firin');   // 0.35.0: yanan fırın da fırındır
    if (BLOKLAR[b] && BLOKLAR[b].istasyon && ISTASYON_ADI[BLOKLAR[b].istasyon]) s.add(BLOKLAR[b].istasyon);   // 0.36.0: mutfak tezgâhı masa, tandır fırın, değirmen taşı değirmen sayılır
    if (BLOKLAR[b] && BLOKLAR[b].elektrik === 'ocak' && BLOKLAR[b].acik) { s.add('elocak'); s.add('firin'); s.add('ates'); }   // 0.24.0: çalışan elektrikli ocak, fırın ve ateş yerine geçer
  }
  ELOCAK.aktif = s.has('elocak');
  return s;
}

/* ---------- Duraklatma ---------- */
function duraklat() { if (!oyun) return; ekran('duraklat'); oyunKaydet(); }
$('#agAc').onclick = () => { ses.tik(); agAc(); };
$('#agKopyala').onclick = () => {
  ses.tik();
  const k = oyun && oyun.ag && oyun.ag.kod;
  if (!k) return;
  const ok = () => { $('#agKopyala').textContent = 'Kopyalandı'; setTimeout(() => ($('#agKopyala').textContent = 'Kopyala'), 1500); };
  if (navigator.clipboard) navigator.clipboard.writeText(k).then(ok, () => {}); 
};
$('#devamEt').onclick = () => { ses.tik(); ekran('oyun'); kilitle(); };
$('#basarimAc').onclick = () => { if (!oyun) return; ses.tik(); ekran('oyun'); basarimEkrani.menudenAcildi = true; basarimEkrani.ac(); ses.ac(); tiklaGuncelle(); };
$('#kaydetCik').onclick = async () => { ses.tik(); await oyunKaydet(); oyunBitir(); ekran('ana'); };

/* ---------- Oyun ---------- */
let oyun = null;

function oyunBaslat(v) {
  if (oyun) oyunBitir();
  ekran('yukleme');
  $('#yukleBaslik').textContent = v.istemci ? 'Dünyaya katılınıyor' : v.yeni ? 'Dünya oluşturuluyor' : 'Dünya yükleniyor';
  $('#yukleCubuk').style.width = '0%';
  const ipuclari = ['İlk gece gelmeden bir sığınak yapmak akıllıca olur.', 'Üretim masası birçok tarifin kilidini açar.', 'Elmas, derin mağaralarda bulunur.', 'Böğürtlen çalıları zamanla yeniden meyve verir.', 'Fırın yanında kütük yakarak kömür elde edilir.', 'Meşaleler karanlık mağaraları aydınlatır.', 'Zombiler meşale ve kamp ateşi çevresinde doğmaz.', 'Yatakta uyumak geceyi atlatır; son kullanılan yatak doğma noktası olur.', 'Çiğ et kamp ateşinde pişirilince çok daha doyurucu olur.', 'Düşerken yapılan vuruş kritik hasar verir.', 'Köylülerle sikke karşılığında ticaret yapılabilir.', 'Pusuladaki ev simgesi yakındaki köyleri gösterir.', 'Görev günlüğü J tuşuyla açılır.', 'Derin mağaralarda lav bulunur; lava düşen eşyalar yanar.', 'Zindanlardaki sandıklar değerli ganimet saklar.', 'Örümcek zehri canınızı 1 kalbin altına düşürmez.', 'Kemik tozu ekinleri hızla büyütür.', 'Arı kovanının altına kamp ateşi yakılırsa bal toplarken arılar kızmaz.', 'Süt kovası içilince zehir ve olumsuz etkiler geçer.', 'Kırkılan koyunun yünü zamanla yeniden uzar.', 'Şeker kamışı yalnızca suya komşu zemine dikilir.', 'Kanlı Ay her mevsimin son gecesinde doğar; o gece uyunamaz.', 'Ölünce eşyalarınız mezar taşında saklanır.', 'Karlı bölgelerde deri zırh ve sıcak çorba hayat kurtarır.', 'Bandaj kanamayı durdurur; atel kırık bacağı hızla iyileştirir.', 'Düşen meteorların kraterinde Yıldız Parçası veren Gök Taşı bulunur.', 'Eve Dönüş Tılsımı son kullanılan yatağa ışınlar.', 'Yüksekten düşmek ölümcüldür; yün, saman balyası, yaprak ve kar düşüşü yumuşatır, suya düşmek zarar vermez.', 'Doğma noktası son kullanılan yataktır; yatak yoksa ölünce rastgele bir yerde doğulur.', 'Ada Bekçisi Kül Devi yenilince iki Büyülü Anahtar bırakır; anahtar kadim geçidi 30 dakika açar.', 'F1 göstergeleri gizler, F2 ekran görüntüsü kaydeder.', 'Dünyalar listesindeki Yedekle düğmesi dünyayı dosya olarak indirir.', 'Envanterdeki Sırala düğmesi çantayı düzenler.', 'Hardcore dünyada tek can vardır.',
    'Olta ile balık tutulur; şamandıra suya daldığında sağ tıklayınız.', 'Dalış maskesi su altında daha uzun kalmayı sağlar.', 'Palet ile su altında çok daha hızlı yüzülür.', 'Batık gemilerin sandıkları inci ve sikke saklar.', 'Köpekbalıkları derin açık denizlerde dolaşır.', 'Kıyı köylerinin limanlarında tekneler ve bir balıkçı bulunur.', 'Deniz fenerleri geceleri kıyının yerini gösterir.', 'Tekneden inmek için C tuşuna basılır.', 'F8 ile açılan geliştirici konsolunda “yardim” komutu tüm komutları listeler.',
    'Duraklatma menüsündeki “Dünyayı Arkadaşlara Aç” ile arkadaşlarınız aynı dünyaya katılabilir.', 'Çok oyunculuda sohbet için T, oyuncu listesi için Tab tuşu kullanılır.', 'Çok oyunculuda gece, tüm oyuncular yatağa yattığında atlanır.',
    'Büyük harita M tuşuyla açılır; haritaya tıklanarak işaret eklenir.', 'Haritaya eklenen işaretler pusulada da görünür.',
    'Fırtınalı havalarda canavarlar gündüz de ortaya çıkar.', 'Yağmur, açıktaki zombilerin güneşte yanmasını önler.', 'Fırtınada yatakta uyunarak hava açtırılabilir.',
    'Çapa ile işlenen tarla toprağında ekinler daha hızlı büyür; suya yakın tarla daha da hızlıdır.', 'Hayvanlar sevdikleri yemi tutan oyuncuyu izler; iki beslenen hayvan yavru yapar.', 'Kurt kemikle evcilleşip sadık bir köpeğe dönüşür; kedi balıkla evcilleşir. Sağ tık ile oturtulur ya da kaldırılır.', 'Vahşi at boş elle sağ tıklanarak ehlileştirilir; elma, buğday ya da havuç güvenini artırır. Eyer takılan ata binilir, C ile inilir.', 'Tencerede pişen yemekler açlığı doyurmanın yanında yenilenme, tokluk ve nefes gibi etkiler verir.', 'Sandalye ve koltuğa sağ tık ile oturulur; hareket edince kalkılır.', 'Tarif Kitabı B tuşuyla açılır; bir tarifi takibe alınca malzemeleri ekranın solunda izlenir.', 'Kol ve bakır telle kapılar uzaktan açılır; basınç plakası üstüne basılınca güç verir.', 'Ters çevirici, arkasından güç gelmediğinde önüne güç verir; kendine bağlanınca saat devresi olur.', 'Müzik kutusu altındaki bloğa göre farklı çalgı sesi çıkarır.', 'Yeraltı Diyarı’nın tek girişi, Issız Deniz’in ortasındaki Lanetli Ada’daki kadim geçittir; ada çevresinde deniz kararır.', 'Yeraltı Diyarı’nda 1 blok yürümek dünyada 8 bloğa denk gelir; uzak yolculuklar için kestirmedir.', 'Kor Ruhlarının ateş topları tutuşturur; Ateşe Dayanıklılık İksiri korur.', 'Kışın göller donar ve ekinler çok yavaş büyür; ilkbaharda tarlalar en verimli hâlindedir.', 'Kül kumu yavaşlatır; magma bloğunun üstünde eğilerek yürünürse yakmaz.',
    'İnekler ve koyunlar buğday, domuzlar havuç ya da patates, tavuklar tohum, tavşanlar havuç sever.', 'Beslenen hayvanlar ve yavruları kaybolmaz.',
    'Örs ile aletler ve zırhlar deneyim seviyesi karşılığında onarılır.', 'Simya masası yakınında hız, gece görüşü, su altında nefes, ateşe dayanıklılık ve güç iksirleri yapılır.',
    'Canavar avlamak, cevher kazmak, balık tutmak ve ticaret deneyim kazandırır.', 'Büyü masasında aletler ve zırhlar deneyim seviyesi ve parıltı kristali karşılığında büyülenir.', 'Başarımlar L tuşuyla açılır.', 'Çöl tapınaklarının hazine odasında Firavun uyur.', 'Tapınaklarda tuzak tellerine dikkat ediniz; tel kırılınca tuzak etkisizleşir.', 'Yenilen bosslar efsanevi eşyalar düşürür.', 'Mumyaların vuruşu açlığı hızlandırır; buz iskeletlerinin okları yavaşlatır.', 'Kapılar, sandıklar ve istasyonlar E tuşu ya da sağ tıkla açılır; eğilerek yanlarına blok konur.', 'Tırmanma merdiveninde W ile bakılan yöne gidilir: yukarı bakılırken çıkılır, aşağı bakılırken inilir; C ile tutunulur.', 'Envanter ve üretim Q tuşuyla açılır; G tuşu eldekini atar.', 'Merdiven bir bloğun alt yüzüne konunca ters döner; tavan kenarları ve kemerler için kullanılır.', 'Eldeki boyayla yün, cam, pişmiş kil, beton, perde ve sancağa sağ tıklanınca blok o renge boyanır.', 'Yapı Planı ile bir yapının iki köşesi seçilip kopyalanır; R ile döndürülüp başka bir yere kurulur.', 'Şömine sağ tıkla yakılır; yanan şömine odayı aydınlatır ve ısıtır.', 'Köylüler takas yaptıkça Kalfa, Usta ve Üstat olur; her seviyede yeni takaslar açılır.', 'Çok alınan eşyalar pahalanır; köylülerin günün fırsatlarını kaçırmayınız.', 'Tanıdık itibarındaki köylerde hikâyeli zincir görevler verilir.', 'Görev kabul edildiği gün tamamlanırsa ödül %50 artar.', 'Dost olunan köylerde köylüyle konuşarak köyde konaklanabilir.', 'Fırına sağ tıklanınca kendi penceresi açılır; yakıt ve malzeme konunca kendiliğinden çalışır.', 'Kıyafetler zırhın altına giyilir; kalın giysiler soğuktan korur, çölde ise ince giysiler serinletir.', 'Hava bölgeseldir: ufukta yağmur perdesi görünen yere gidilirse yağmura girilir.', 'Olgun domates, biber ve çilek sağ tıkla toplanır; bitki yeniden ürün verir.', 'Tırpan olgun ekinleri geniş alanda biçer ve tohum varsa yeniden eker.', 'Meyve ağaçlarının meyveli yaprakları sağ tıkla toplanır.', 'Kompost kutusuna bitkisel atık konunca dolar ve gübre verir.', 'Değirmen Taşı buğdayı una, biberi pul bibere öğütür.', 'Yemek pişirdikçe aşçılık seviyesi yükselir; yemek etkileri uzar.', 'Lahmacun kazma hızını, Börek ve Kumpir alınan hasarı azaltan direnci verir.', 'Çilekli pasta yere konur; her sağ tıkta bir dilim yenir.', 'Mutfak Tezgâhı üretim masası, Tandır fırın yerine geçer.', 'Tarif Defteri sağ tıkla aşçılık seviyesini gösterir.', 'Kanepe, gardırop, piyano gibi büyük eşyalar kurulmadan önce yerleşim önizlemesi gösterilir; R tuşu döndürür.', 'Taş Kesme Tezgâhı mermer, granit, bazalt ve kayrak üretir.', 'Dürbün sağ tıkla uzağı yakınlaştırır.', 'Mangal kamp ateşi gibi pişirme istasyonudur.', 'Piyano ve gramofon sağ tıkla çalar.'];
  $('#yukleIpucu').textContent = ipuclari[Math.floor(Math.random() * ipuclari.length)];

  /* 0.41.0: dünyanın üretici sürümü (kaydı olmayan eski dünyalar 1: eski arazi, 128 yükseklik, 2600 yarıçap) */
  const ureticiSurum = v.uretici >= 2 ? 2 : 1;
  dunyaSurumAyarla(ureticiSurum);
  const dunya = new Dunya(v.tohum, sahne);
  dunya.gorusAyarla(ayar.gorus);
  dunya.degisiklikleriYukle(v.degisiklikler);
  const oyuncu = new Oyuncu(dunya);
  const envanter = new Envanter();
  const hayatta = new Hayatta();
  const dusenler = new Dusenler(sahne, dunya);
  const hud = new Hud(envanter, hayatta);
  envEkrani.envanter = envanter; envEkrani.hud = hud; envEkrani.hayatta = hayatta;
  const dogum = v.dogum || dunya.uretici.dogumNoktasi();
  /* Keşif haritası: kayıtlı bölgeler arka planda yüklenir */
  const harita = new Harita(dunya), haritaKimlik = v.haritaKimlik || v.id;
  /* Dünya üretimi değiştiyse (0.13.0: iklim ve biyomlar) eski harita kaydı geçersizdir; silinir ve yeniden keşfedilir */
  if (!v.istemci && (v.uretimSurumu || 1) < URETIM_SURUMU && v.oyuncu) HaritaKayit.sil(haritaKimlik).catch(() => {});
  else HaritaKayit.yukle(haritaKimlik).then(l => { if (oyun && oyun.harita === harita) harita.iceAktar(l); }).catch(() => {});
  if (v.oyuncu) { oyuncu.konum.set(v.oyuncu.x, v.oyuncu.y, v.oyuncu.z); oyuncu.yaw = v.oyuncu.yaw || 0; oyuncu.pitch = v.oyuncu.pitch || 0; }
  else oyuncu.konum.set(dogum.x, dogum.y, dogum.z);
  envanter.iceAktar(v.envanter);
  hayatta.iceAktar(v.hayatta);
  oyun = { id: v.id, ad: v.ad, tohum: v.tohum, uretici: ureticiSurum, olusturma: v.olusturma || Date.now(), dunya, oyuncu, envanter, hayatta, dusenler, hud,
    zaman: v.zaman ?? 0.02, gun: v.gun || 1, dogum, olumNoktasi: v.olumNoktasi || null, ortamSayac: 4, sure: 0, kayitSayac: 0, tikSayac: 0, isikSayac: 0, isik: 1, hazir: false, yeniDogum: !v.oyuncu,
    istemci: !!v.istemci, ag: null, oyuncuKayitlari: v.oyuncuKayitlari || {}, yatakta: false, yatakNoktasi: v.yatakNoktasi && Array.isArray(v.yatakNoktasi.hucreler) ? v.yatakNoktasi : null,
    harita, haritaKimlik, yerler: Array.isArray(v.yerler) ? v.yerler : [], komutlar: !!v.komutlar, gelistirici: !!v.gelistirici,
    /* 0.29.1: dünya ayarları; eski dünyalarda önceki genel ayar geçerlidir */
    konsol: typeof v.konsol === 'boolean' ? v.konsol : ayar.konsol !== false, vucutIsisi: typeof v.vucutIsisi === 'boolean' ? v.vucutIsisi : ayar.vucutIsisi !== false,
    hayatBasi: Number.isFinite(v.hayatBasi) ? v.hayatBasi : (v.gun || 1) + (v.zaman ?? 0.02), isiSayac: 0, tilsim: 0, sarsinti: 0,
    zorluk: v.zorluk || 'normal', denge: dengeDuzelt(v.denge), hardcoreBitti: !!v.hardcoreBitti, ogretici: v.yeni ? 0 : Number.isFinite(v.ogretici) ? v.ogretici : -1 };
  const varliklar = new Varliklar({ sahne, dunya, dusenler, ses, uretici: dunya.uretici });
  varliklar.hataBildir = (m, e) => { console.error('Canlı hatası', e); konsol.kayit('canli', 'Canlı hatası; canlı kaldırıldı', { seviye: 'kritik', alan: { hata: m } }); };
  oyun.varliklar = varliklar; oyun.gunIsigi = 1; oyun.uyku = 0; oyun.isaretSayac = 0;
  const yereBirak = (id, adet) => { const p = oyuncu.konum; dusenler.birak(id, adet, p.x, p.y + 1, p.z, 0.001, 2, 0.001, undefined, 1); };
  const tekneler = new Tekneler({ sahne, dunya, dusenler, ses, varliklar });
  oyun.tekneler = tekneler;
  /* 0.16.0: at binme ve oturma; evcil hayvanların sahibi oyuncu adıyla tanınır */
  varliklar.yerelAd = ayar.ad;
  oyun.binek = new Binek({ varliklar, oyuncu, dunya, ses, dusenler, bildirim: m => hud.bildirim(m), olay: k => oyun.basarimlar && oyun.basarimlar.ver(k) });
  oyun.fenerler = new FenerIsiklari(sahne, dunya); oyun.yakinKoyler = [];
  const olta = new Olta({ sahne, dunya, oyuncu, envanter, dusenler, ses, arayuz: { bildirim: m => hud.bildirim(m) },
    olaylar: { yakala: (id, n, hazine) => { if (hazine) hud.bildirim(`Oltaya ${ESYALAR[id].ad} takıldı.`); hayatta.xpEkle(1 + Math.floor(Math.random() * 3)); if (oyun.basarimlar) oyun.basarimlar.ver('balik'); } } });
  oyun.olta = olta;
  const koyler = new Koyler({ uretici: dunya.uretici, varliklar, dunya, tekneler, bildirim: m => hud.bildirim(m), birak: yereBirak });
  koyler.iceAktar(v.koyler);
  olayKaydiKur(oyun, koyler);   // 0.40.5: dünya olay kaydı (geliştirici konsolu)
  /* Hava durumu ve evcil hayvanlar */
  oyun.hava = new Hava(sahne, dunya);
  oyun.hava.iceAktar(v.hava);
  oyun.hava.olaylar.simsek = (x, y, z) => simsekOlayi(x, y, z);
  if (!v.istemci) varliklar.evcilIce(v.evciller);
  varliklar.olaylar.yavru = (y, besleyen) => { if (besleyen) { if (oyun.ag && oyun.ag.xpVer) oyun.ag.xpVer(besleyen, 2); } else { hayatta.xpEkle(2); oyun.basarimlar.ver('yavru'); } };
  /* Başarımlar (0.14.0) */
  const basarimlar = new Basarimlar();
  basarimlar.iceAktar(v.basarimlar);
  basarimlar.kazanildi = b => basarimEkrani.goster(b);
  basarimlar.degisti = () => { if (basarimEkrani.acik) basarimEkrani.ciz(); };
  oyun.basarimlar = basarimlar; basarimEkrani.basarimlar = basarimlar; basarimEkrani.hayatFn = () => (oyun && !oyun.hayatta.olu ? Math.max(0, oyun.gun + oyun.zaman - oyun.hayatBasi) : 0); basarimEkrani.temizle(); oyun.basarimSayac = 2;
  /* 0.22.0: gök olayları (Kanlı Ay, kayan yıldızlar, meteor, kuzey ışıkları) */
  oyun.gok = new GokOlaylari({ oyun: () => oyun, sahne, ses, bildirim: m => hud.bildirim(m), olay: k => basarimlar.ver(k), istat: k => basarimlar.istatEkle(k),
    koyYakin: (x, z) => koylerAlan(dunya.uretici, x - 80, z - 80, x + 80, z + 80).some(k => Math.hypot(k.x - x, k.z - z) < (k.yaricap || 40) + 24),
    yayinla: m => { if (oyun && oyun.ag && !oyun.istemci && oyun.ag.yay) oyun.ag.yay(m); } });
  zorlukUygula(oyun);
  document.body.classList.remove('izleyici');
  if (oyun.hardcoreBitti) { izleyiciYap(oyun); setTimeout(() => hud.bildirim('Bu Hardcore dünyası sona erdi; izleyici olarak dolaşılıyor.'), 1500); }
  tarifKitabi.env = envanter; tarifKitabi.takip = Number.isInteger(ayar.tarifTakip) ? ayar.tarifTakip : -1; tarifKitabi.takipCiz(true);
  /* Yapılar: boss uyanması, haydutlar ve tuzaklar (tek oyunculu ve sunucu) */
  const yapiOlaylari = new YapiOlaylari({ uretici: dunya.uretici, varliklar, dunya, ses, olay: (ad, w) => {
    const m = ad === 'bossUyandi' ? `${w.tur.ad} uyandı!` : ad === 'bossOldu' ? `${w.tur.ad} yenildi.` : ad === 'kamp' ? 'Haydut kampına yaklaşıldı.' : null;
    if (!m) return;
    hud.bildirim(m);
    if (ad !== 'kamp' && oyun && oyun.ag && oyun.ag.yay) oyun.ag.yay({ t: 'sh', s: m });
  } });
  yapiOlaylari.iceAktar(v.bosslar);
  oyun.yapiOlaylari = yapiOlaylari;
  /* 0.38.0: Lanetli Ada'nın bekçisi */
  /* 0.39.0: ağır canlıların (Kül Devi) sarsıntısı: uzaklığa göre azalır */
  const sarsinti = (g, p) => { const o = oyun; if (!o) return; const u = Math.hypot(o.oyuncu.konum.x - p.x, o.oyuncu.konum.z - p.z); o.sarsinti = Math.max(o.sarsinti || 0, g * Math.max(0, 1 - u / 22)); };
  varliklar.sarsinti = sarsinti;
  oyun.adaBekcisi = new AdaBekcisi({ uretici: dunya.uretici, varliklar, dunya, ses, sarsinti, bildirim: m => hud.bildirim(m) });
  oyun.adaBekcisi.iceAktar(v.adaBekci);
  /* 0.18.0: Diyar Geçidi; çerçevesi bozulan geçidi tek oyunculuda ve sunucuda söndürür */
  oyun.gecit = new Gecit({ dunya, oyuncu, ses, bildirim: m => hud.bildirim(m), gec: h => gecitGec(h), olay: k => oyun.basarimlar && oyun.basarimlar.ver(k) });
  oyun.gecit.iceAktar(v.gecit);   // 0.39.0: geçidin açık kalma süresi ve dönüş kapısı
  if (!v.istemci) dunya.dinleyiciler.push((x, y, z, id, eski) => { if (!oyun.gecit.sonduruyor) { oyun.gecit.sonduruyor = true; oyun.gecit.degisti(x, y, z, id, eski); oyun.gecit.sonduruyor = false; } });
  /* 0.17.0: mekanik devreler tek oyunculuda ve sunucuda hesaplanır */
  if (!v.istemci) oyun.mekanik = new Mekanik({ dunya, varliklar, ses, gunIsigi: () => oyun.gunIsigi, yerel: () => oyun.oyuncu.konum,
    konumlar: () => { const l = oyun.hayatta.olu ? [] : [oyun.oyuncu.konum]; if (oyun.ag && oyun.ag.konumlar) l.push(...oyun.ag.konumlar()); return l; } });
  /* 0.24.0: elektrik ağları tek oyunculuda ve sunucuda hesaplanır */
  dunya.enerjiYukle(v.enerji);
  oyun.cihazCizici = new CihazCizici(sahne, dunya);   // 0.25.0: çok bloklu cihazların modelleri ve önizleme
  oyun.bataryaOran = new Map();   // 0.25.0: istemcide sunucudan gelen batarya doluluğu
  oyun.kablolar = new Kablolar(dunya); oyun.kablolar.iceAktar(v.kablolar);   // 0.26.0: Rust tarzı kablolar
  oyun.cihazCizici.kablolar = oyun.kablolar;
  oyun.taretler = new Taretler({ dunya, varliklar, ses, yerel: () => oyun.oyuncu.konum, atesEder: !v.istemci,   // 0.28.0
    kilitli: k => { const s = oyun.ag && oyun.ag.kilit && oyun.ag.kilit.get(k); return s != null && s !== 'yerel'; },
    degisti: k => { if (envEkrani.acik && envEkrani.sandik && envEkrani.sandik.k === k) envEkrani.ciz(); } });
  oyun.cihazCizici.taretAci = k => oyun.taretler.aci(k);
  /* 0.30.5: akan su (tek oyunculu ve sunucu) */
  if (v.yapiPlani && Array.isArray(v.yapiPlani.b)) oyun.etkilesim.plan.plan = v.yapiPlani;   // 0.35.0
  oyun.suAkisi = v.istemci ? null : new SuAkisi(dunya);
  oyun.kumDusmesi = v.istemci ? null : new KumDusmesi(dunya, sahne);   // 0.41.4: kum ve çakıl düşer
  if (!v.istemci) oyun.elektrik = new Elektrik({ dunya, kablolar: oyun.kablolar,
    canlilar: () => { const l = []; if (!oyun.hayatta.olu) l.push([oyun.oyuncu.konum.x, oyun.oyuncu.konum.y + 1, oyun.oyuncu.konum.z, 'o']); if (oyun.ag && oyun.ag.konumlar) for (const q of oyun.ag.konumlar()) l.push([q.x, q.y + 1, q.z, 'o']);
      for (const w of varliklar.liste) if (!w.olu) l.push([w.konum.x, w.konum.y + 0.8, w.konum.z, w.tur.dusman || w.ofkeli ? 'c' : 'h']); return l; }, kabloKoptu: (w, p) => dusenler.birak(KABLO.esya, kabloMaliyeti(w.uz), p[0], p[1], p[2]), ortam: () => ({ gunIsigi: oyun.gunIsigi, yogunluk: oyun.hava ? oyun.hava.yogunluk : 0, firtina: !!(oyun.hava && oyun.hava.firtina), mevsim: oyun.mevsim || 0, sure: oyun.sure }),
    /* 0.29.0: ocak haznesi: başka oyuncuda açıkken pişirme bekler; açık hazne ekranı yenilenir */
    sandikKilitli: k => { const s = oyun.ag && oyun.ag.kilit && oyun.ag.kilit.get(k); return s != null && s !== 'yerel'; },
    sandikDegisti: k => { if (envEkrani.acik && envEkrani.sandik && envEkrani.sandik.k === k) envEkrani.ciz(); } });
  /* 0.33.0: fırın ve kamp ateşi (tek oyunculu ve sunucu) */
  /* 0.35.0: köy baskınları */
  oyun.baskinlar = v.istemci ? null : new Baskinlar({ koyler, varliklar, dunya, ses, bildirim: m => hud.bildirim(m), birak: (id, n, x, y, z) => dusenler.birak(id, n, x, y, z), basarim: k => basarimlar.ver(k) });
  oyun.firinlar = v.istemci ? null : new Firinlar({ dunya, sandikKilitli: k => { const s = oyun.ag && oyun.ag.kilit && oyun.ag.kilit.get(k); return s != null && s !== 'yerel'; },
    sandikDegisti: k => { if (envEkrani.acik && envEkrani.sandik && envEkrani.sandik.k === k) envEkrani.ciz(); } });
  varliklar.olaylar.bossOldu = w => yapiOlaylari.bossOldu(w);
  const gorevler = new Gorevler({ uretici: dunya.uretici, koyler });
  gorevler.iceAktar(v.gorevler);
  gorevler.degisti = () => { if (gorevEkrani.acik) gorevEkrani.ciz(); };
  gorevler.tamamlandi = () => basarimlar.gorevTamam();
  /* 0.32.0: gün, deneyim ödülü ve görev bildirimleri */
  koyler.gun = gorevler.gun = () => (oyun && oyun.gun) || 1;
  gorevler.xpVer = n => hayatta.xpEkle(n);
  koyler.seviyeAtladi = (k, kl, sv) => { if (sv >= 2) basarimlar.ver('usta'); if (sv >= 3) basarimlar.ver('ustat'); };   // 0.35.0
  gorevler.zincirBitti = () => basarimlar.ver('zincir');
  gorevler.bildirim = m => { hud.bildirim(m); ses.gorev(); };
  dunya.sandiklariYukle(v.sandiklar);
  oyun.koyler = koyler; oyun.gorevler = gorevler;
  Object.assign(koyluEkrani, { koyler, gorevler, envanter, hud, oyuncu, xp: n => { hayatta.xpEkle(n); basarimlar.ver('ticaret'); },
    /* 0.32.0: konuşmalar için ortam ve Dost itibarında köyde konaklama (doğma noktası köylünün kapısı, gece ise uyunur) */
    ortam: () => { const z = oyun.zaman, H = oyun.hava; return { gece: z > 0.55 && z < 0.95, sabah: z < 0.12, yagis: H && H.yagiyor ? (H.yagisTuru ? H.yagisTuru(oyuncu.konum) : 1) : 0 }; },
    konakla: w => { const k = w.koylu.kapi; uyu({ x: k.x, y: k.y - 1, z: k.z }, true); } });
  Object.assign(gorevEkrani, { gorevler, envanter, oyuncu });
  /* vuran: çok oyunculuda canlıya vuran uzak oyuncu (görev ve itibar onun oyununda işlenir) */
  varliklar.olaylar.vurus = (w, vuran) => { if (vuran) { if (oyun.ag && oyun.ag.vurusOlayi) oyun.ag.vurusOlayi(w, vuran); return; } if (w.tur.koylu) koyler.koyluVuruldu(w); };
  varliklar.olaylar.olum = (w, vuran, op) => { if (vuran) { if (oyun.ag && oyun.ag.olumOlayi) oyun.ag.olumOlayi(w, vuran, op); return; } gorevler.oldurme(w.turAd); oyun.basarimlar.oldurme(w.turAd, !!(op && op.ok)); if (w.tur.koylu) koyler.koyluOldu(w); if (w.tur.xp) hayatta.xpEkle(w.tur.xp * (w.kanli ? 2 : 1)); };
  oyun.etkilesim = new Etkilesim({ dunya, oyuncu, envanter, hayatta, dusenler, ses, sahne, varliklar, olta, tekneler, binek: oyun.binek, gecit: oyun.gecit, oyuncuAdi: ayar.ad, arayuz: {
    bildirim: (m, id) => hud.bildirim(m, id), envanterAc: ist => envanterAcKapa(ist), uyu: h => uyu(h), yatakKirildi: (x, y, z) => yatakKirildi(x, y, z),
    olay: k => basarimlar.ver(k),
    istat: (k, n) => basarimlar.istatEkle(k, n),
    blokKondu: id => oyun.gorevler && oyun.gorevler.blokKondu(id),   // 0.32.0: inşa görevleri
    tilsim: () => tilsimBaslat(),
    zaman: () => ({ zaman: oyun.zaman, gun: oyun.gun, mevsim: `${MEVSIMLER[oyun.mevsim]} ${((oyun.gun - 1) % MEVSIM_GUN) + 1}/${MEVSIM_GUN}` }),   // 0.37.0: cep saati
    koyluAc: w => panelAc(koyluEkrani, w),
    sandikAc: (x, y, z) => {
      const k = x + ',' + y + ',' + z;
      /* Çok oyunculu: istemcide içerik sunucudan istenir, sunucuda sandık aynı anda tek oyuncuya açılır */
      if (oyun.istemci) { oyun.ag.sandikIste(x, y, z); return; }
      if (oyun.ag && !oyun.ag.sandikKilitle(k)) { hud.bildirim('Bu sandığı başka bir oyuncu kullanıyor.'); return; }
      let d = dunya.sandiklar.get(k); if (!d) { const B0 = BLOKLAR[dunya.blok(x, y, z)]; d = B0.firinKap ? new Array(kapBoyu(B0)).fill(null) : B0.mezar || B0.elektrik || B0.dolap ? new Array(27).fill(null) : koyler.sandikGanimeti(x, y, z); dunya.sandiklar.set(k, d); } envanterAcKapa(null, { yuvalar: d, k, kural: kapFiltresiId(dunya.blok(x, y, z)), blok: dunya.blok(x, y, z) });
      sandikBasarim(x, y, z);
    },
    /* 0.26.0: kablolar: çok oyunculu istemcide istek sunucuya gider; sökülen kablo envantere geri döner */
    kabloEkle: (a, ap, b, bp, n, sr, uz) => { if (oyun.istemci) oyun.ag.gonder({ t: 'ke', a, ap, b, bp, n, s: sr, uz }); else oyun.kablolar.ekle(a, ap, b, bp, n, sr, undefined, uz); },
    kabloSil: (i, iade) => {
      const w = oyun.kablolar.liste.get(i); if (!w) return;
      if (iade) { const k = envanter.ekle(KABLO.esya, kabloMaliyeti(w.uz)); if (k) dusenler.birak(KABLO.esya, k, oyuncu.konum.x, oyuncu.konum.y + 1, oyuncu.konum.z); }
      if (oyun.istemci) { oyun.ag.gonder({ t: 'ks', i }); oyun.kablolar.sil(i); } else oyun.kablolar.sil(i);
    },
    kabloIsin: (goz, yon, maks) => oyun.cihazCizici ? oyun.cihazCizici.kabloIsin(goz, yon, maks) : null,
    sandikYerlesti: (x, y, z) => { if (!oyun.istemci) dunya.sandiklar.set(x + ',' + y + ',' + z, new Array(27).fill(null)); },
    sandikKirildi: (x, y, z, ganimet = true) => {
      const k = x + ',' + y + ',' + z;
      if (oyun.istemci) { oyun.ag.sandikKir(x, y, z, ganimet); return []; }
      if (oyun.ag) oyun.ag.sandikKirildi(k);
      const d = dunya.sandiklar.get(k) || (ganimet ? koyler.sandikGanimeti(x, y, z) : []); dunya.sandiklar.delete(k); return d.filter(Boolean);
    }
  } });
  oyun.etkilesim.kablolar = oyun.kablolar;
  hayatta.zirhFn = () => envanter.zirhPuani();
  hayatta.buyuFn = k => envanter.zirhBuyu(k);
  hayatta.zirhYipran = () => { if (envanter.zirhYipran(1)) { ses.aletKirildi(); hud.bildirim('Bir zırh parçanız kırıldı.'); } };
  dusenler.iceAktar(v.dusenler);
  const binili = tekneler.iceAktar(v.tekneler);
  if (binili >= 0 && tekneler.liste[binili]) tekneler.bin(tekneler.liste[binili], oyuncu);
  envanter.degisti = () => { hud.cubukCiz(); if (envEkrani.acik) envEkrani.ciz(); };
  hud.cubukCiz(); hud.durumCiz(false);
  /* Tüy Düşüşü büyüsü (botlarda) düşme hasarını seviye başına %12 azaltır */
  oyuncu.olaylar.dustu = d => {
    if (oyuncu.suda) return;
    /* 0.40.4: gerçekçi düşme hasarı; inilen zemin yumuşaksa azalır, tüy düşüşü büyüsü %12'şer azaltır */
    const P = oyuncu.konum, x = Math.floor(P.x), z = Math.floor(P.z), ayak = dunya.blok(x, Math.floor(P.y + 0.05), z);
    const alt = BLOKLAR[ayak] && BLOKLAR[ayak].ses === 'kar' ? ayak : dunya.blok(x, Math.floor(P.y - 0.05), z);
    const n = Math.round(dusmeHasari(d, alt) * (1 - 0.12 * Math.min(4, envanter.zirhBuyu('tuy'))));
    if (n <= 0) return;
    hayatta.hasar(n, 'dusme');
    /* 0.22.0: sert düşüş bacağı kırabilir (0.40.4: 7 bloktan yüksekte yarı olasılıkla, 9 bloktan yüksekte kesin) */
    if (n >= 6 && !hayatta.olu && !hayatta.olumsuz && !hayatta.etki('kirik') && (d >= 9 || (d >= 7 && Math.random() < 0.5))) {
      hayatta.etkiEkle('kirik', 180); hayatta.atel = false; ses.kemik();
      hud.bildirim('Bacağınız kırıldı! Atel (3 çubuk, 1 ip) sarılınca daha hızlı iyileşir.');
    }
  };
  oyuncu.olaylar.adim = id => ses.adim(BLOKLAR[id] ? BLOKLAR[id].ses : 'tas');
  oyuncu.olaylar.ziplad = () => { hayatta.yor(oyuncu.kosuyor ? 0.2 : 0.05); };
  /* 0.43.0: yüksekten inişte zemine göre iniş sesi */
  oyuncu.olaylar.indi = (h, id) => { const t = BLOKLAR[id] ? BLOKLAR[id].ses : 'tas'; ses.adim(t); if (h > 11) setTimeout(() => ses.adim(t), 70); };
  oyuncu.olaylar.suyaGirdi = h => ses.sicrama(Math.min(1.5, h / 8));
  hayatta.olaylar.hasar = (n, sebep) => { ses.hasar(); hud.hasarParla(); basarimlar.istatEkle('hasar', n / 2); konsol.kayit('oyuncu', 'Oyuncu hasar aldı', { seviye: 'uyari', alan: { miktar: n, sebep: sebepAdi(sebep), can: `${Math.max(0, Math.ceil(hayatta.can))}/20` } }); };
  hayatta.olaylar.olum = sebep => olum(sebep);
  /* Deneyim sesleri (sık gelen küçük kazançlar seyreltilir) */
  let xpSesZaman = 0;
  hayatta.olaylar.xp = () => { const t = performance.now(); if (t - xpSesZaman > 90) { xpSesZaman = t; ses.xp(); } };
  hayatta.olaylar.seviye = L => { ses.seviye(); hud.bildirim(`Deneyim seviyesi ${L}`); };
  $('#hata').hidden = true;
  $('#fps').hidden = !ayar.fps;
  $('#uyku').classList.remove('acik');
  hud.hedef(null);
}

/* Yüklenen alan hazır olunca oyuna geç */
function yuklemeKontrol() {
  const o = oyun, p = o.oyuncu.konum;
  o.dunya.guncelle(p.x, p.z);
  const oran = o.dunya.hazirlikOrani(p.x, p.z, 2);
  $('#yukleCubuk').style.width = Math.round(oran * 100) + '%';
  if (oran >= 1) {
    /* 0.18.0: geçitle varış: çevredeki geçide çıkılır ya da yeni geçit kurulur */
    if (o.gecitHedef) {
      const h = o.gecitHedef; o.gecitHedef = null;
      o.gecit.yerlestir(h);
      o.hud.bildirim(h.diyara ? 'Yeraltı Diyarı · Lav denizine ve Kor Ruhlarına dikkat ediniz.' : `Dünyaya dönüldü · ${ADA_AD}`);
      if (h.diyara) o.basarimlar.ver('diyar');
    }
    /* Doğum noktasını boş bir yere ayarla */
    let g = 0;
    while (o.oyuncu.carpisiyor(p.x, p.y, p.z) && g++ < 200) p.y += 1;
    if (o.yeniDogum) { o.dogum = { x: p.x, y: p.y, z: p.z }; o.yeniDogum = false; }
    o.hazir = true;
    $('#hud').hidden = false;
    ekran('oyun');
    if (o.hayatta.olu) olum('');
    else { kilitle(); }
    if (!o.ilkBildirim) { o.ilkBildirim = true; o.hud.bildirim(`${o.ad} · ${(q => BIYOMLAR[q.ab ?? q.b])(o.dunya.uretici.kolon(Math.floor(p.x), Math.floor(p.z), {}))}`); }
    /* 0.42.0: dünya hatasız açıldı; açılıştaki kaydı yedek kopya olarak saklanır */
    if (o.acilisKaydi) { const k = o.acilisKaydi; o.acilisKaydi = null; if (!o.yedektenAcildi) Kayit.kaydet({ ...k, id: k.id + '~yedek' }).catch(() => {}); }
    if (o.yedektenAcildi) { o.yedektenAcildi = false; o.hud.bildirim('Son kayıt okunamadığı için dünya bir önceki açılıştaki hâliyle açıldı.'); }
    if (o.sunucuIstek) { o.sunucuIstek = false; agAc(); }
  }
}

/* 0.18.0: geçitten geçiş: varış parçaları yüklenirken yükleme ekranı gösterilir */
function gecitGec(h) {
  const o = oyun;
  Gecit.sinirla(h);
  if (o.tekneler.binilen) o.tekneler.in(o.oyuncu);
  if (o.binek.biniyor) o.binek.in();
  if (o.binek.oturak) o.binek.kalk();
  o.gecitHedef = h;
  o.oyuncu.konum.set(h.x + 0.5, 70, h.z + 0.5); o.oyuncu.hiz.set(0, 0, 0); o.oyuncu.dusus = 0; o.oyuncu.ucus = false;
  o.hazir = false;
  if (kilitli) { bilerekBirak = true; kilitBirak(); }
  ekran('yukleme'); $('#yukleBaslik').textContent = h.diyara ? 'Yeraltı Diyarı’na geçiliyor' : 'Dünyaya dönülüyor';
  $('#yukleIpucu').textContent = h.diyara ? 'Diyardaki 1 blok, dünyadaki 8 bloğa karşılık gelir.' : '';
  $('#gecitEfekt').style.opacity = 0;
  ses.gecis();
}

/* ---------- 0.40.5: dünya olay kaydı: dünyada olan her şey geliştirici konsoluna (F8) yazılır ---------- */
const SEBEP_AD = { dusme: 'düşme', aclik: 'açlık', bogulma: 'boğulma', lav: 'lav', yanma: 'yanma', donma: 'donma', sicak: 'sıcak çarpması', kanama: 'kanama', zehir: 'zehir', agu: 'örümcek zehri', bosluk: 'boşluk', yildirim: 'yıldırım', meteor: 'meteor', patlama: 'patlama', kaktus: 'kaktüs', ok: 'ok', tuzak: 'tuzak' };
function sebepAdi(s) { return !s ? 'bilinmiyor' : SEBEP_AD[s] || (TURLER[s] && TURLER[s].ad) || s; }
function olayKaydiKur(o, koyler) {
  const K = (t, m, e) => konsol.kayit(t, m, e), acik = t => !konsol.kayitKapali.has(t), ad = id => (BLOKLAR[id] && BLOKLAR[id].ad) || '#' + id;
  /* Blok değişimleri: oyuncunun ve oyuncuların yaptıkları "Blok", sıvı akışı, büyüme, mevsim ve elektrik "Doğal" türündedir */
  o.dunya.kayit = (eski, yeni, x, y, z, kaynak) => {
    const tur = kaynak === 'yerel' || kaynak === 'ag' || kaynak === 'gecit' ? 'blok' : 'dogal';
    if (!acik(tur)) return;
    const bos = id => !id || (BLOKLAR[id] && BLOKLAR[id].sivi);
    const kim = kaynak === 'ag' ? 'diğer oyuncu' : kaynak === 'gecit' ? 'geçit' : kaynak === 'yerel' ? undefined : kaynak;
    const konum = `${x} ${y} ${z}`, sev = tur === 'dogal' ? 'ayrinti' : 'bilgi';
    if (bos(yeni) && !bos(eski)) K(tur, 'Blok kırıldı', { seviye: sev, alan: { blok: ad(eski), konum, kaynak: kim } });
    else if (bos(eski)) K(tur, 'Blok kondu', { seviye: sev, alan: { blok: ad(yeni), konum, kaynak: kim } });
    else K(tur, 'Blok değişti', { seviye: sev, alan: { önce: ad(eski), sonra: ad(yeni), konum, kaynak: kim } });
  };
  o.varliklar.kayit = K;
  /* Ekranda çıkan bütün bildirimler */
  const hb = o.hud.bildirim.bind(o.hud); o.hud.bildirim = (m, id) => { K('bildirim', m); return hb(m, id); };
  /* Köy itibarı */
  const kd = koyler.itibarDegistir.bind(koyler);
  koyler.itibarDegistir = (id, n) => { const once = koyler.itibar(id); kd(id, n); const son = koyler.itibar(id); const k = koyler.icindeki; if (son !== once) K('koy', 'Köy itibarı değişti', { seviye: son < once ? 'uyari' : 'bilgi', alan: { köy: k && k.id === id ? k.ad : '#' + id, değişim: (n > 0 ? '+' : '') + n, itibar: son } }); };
  o.kayitDurum = { sayac: 0 };
  K('dunya', 'Dünya yüklendi', { alan: { dünya: o.ad, tohum: o.tohum, sürüm: SURUM, mod: o.istemci ? 'istemci' : o.ag ? 'sunucu' : 'tek oyunculu' } });
}
/* Dünya durumundaki değişimler (gün, zaman dilimi, hava, bulunulan yer, diyar, geçit, Kanlı Ay, bekçi) */
function olayKaydiDenetle(o, dt) {
  const D = o.kayitDurum; if (!D) return;
  D.sayac -= dt; if (D.sayac > 0) return; D.sayac = 0.5;
  const K = (t, m, e) => konsol.kayit(t, m, e), saat = (o.zaman * 24 + 6) % 24, P = o.oyuncu.konum, konum = `${Math.round(P.x)} ${Math.round(P.y)} ${Math.round(P.z)}`;
  const saatM = `${String(Math.floor(saat)).padStart(2, '0')}:${String(Math.floor((saat % 1) * 60)).padStart(2, '0')}`;
  const yeni = {
    gun: o.gun, dilim: saat < 5 ? 'gece' : saat < 7 ? 'şafak' : saat < 11 ? 'sabah' : saat < 15 ? 'öğle' : saat < 18 ? 'ikindi' : saat < 21 ? 'akşam' : 'gece',
    hava: o.hava.durum, yer: (o.konumMetni || '').split(' · ')[0], diyar: diyarMi(P.x), gecit: !!(o.gecit && o.gecit.acik()),
    kanli: !!(o.gok && o.gok.kanliAyMi && o.gok.kanliAyMi(o)), bekci: !!(o.adaBekcisi && o.adaBekcisi.canli())
  };
  if (D.son) {
    const S = D.son;
    if (yeni.gun !== S.gun) K('dunya', 'Yeni gün başladı', { alan: { gün: yeni.gun, mevsim: MEVSIMLER[o.mevsim] } });
    if (yeni.dilim !== S.dilim) K('dunya', 'Zaman dilimi değişti', { alan: { dilim: yeni.dilim, saat: saatM } });
    if (yeni.hava !== S.hava) K('dunya', 'Hava değişti', { seviye: yeni.hava === 'firtina' ? 'uyari' : 'bilgi', alan: { önce: HAVA_ADI[S.hava] || S.hava, sonra: HAVA_ADI[yeni.hava] || yeni.hava } });
    if (yeni.yer && yeni.yer !== S.yer) K('oyuncu', 'Bölge değişti', { alan: { bölge: yeni.yer, konum } });
    if (yeni.diyar !== S.diyar) K('dunya', yeni.diyar ? 'Yeraltı Diyarı’na geçildi' : 'Dünyaya dönüldü', { alan: { konum } });
    if (yeni.gecit !== S.gecit) K('dunya', yeni.gecit ? 'Kadim geçit açıldı' : 'Kadim geçit kapandı', { alan: yeni.gecit ? { süre: o.gecit.sureMetni() } : {} });
    if (yeni.kanli !== S.kanli) K('dunya', yeni.kanli ? 'Kanlı Ay başladı' : 'Kanlı Ay sona erdi', { seviye: yeni.kanli ? 'kritik' : 'bilgi', alan: { gün: o.gun } });
    if (yeni.bekci !== S.bekci) K('canli', yeni.bekci ? 'Ada Bekçisi uyandı' : 'Ada Bekçisi dünyadan ayrıldı', { seviye: yeni.bekci ? 'kritik' : 'bilgi', alan: { tür: 'Kül Devi' } });
  }
  D.son = yeni;
}
function olum(sebep) {
  const o = oyun;
  konsol.kayit('oyuncu', 'Oyuncu öldü', { seviye: 'kritik', alan: { sebep: sebepAdi(sebep), konum: `${Math.round(o.oyuncu.konum.x)} ${Math.round(o.oyuncu.konum.y)} ${Math.round(o.oyuncu.konum.z)}`, gün: o.gun } });
  ses.olum();
  if (kilitli) { bilerekBirak = true; kilitBirak(); }
  if (envEkrani.acik) envEkrani.kapat();
  if (koyluEkrani.acik) koyluEkrani.kapat();
  if (gorevEkrani.acik) gorevEkrani.kapat();
  if (haritaEkrani.acik) haritaEkrani.kapat();
  if (o.tekneler.binilen) o.tekneler.in(o.oyuncu);
  o.olta.kaldir();
  const p = o.oyuncu.konum;
  o.olumNoktasi = { x: Math.round(p.x), y: Math.round(p.y), z: Math.round(p.z) };
  /* 0.22.0: eşyalar mezar taşında saklanır (çok oyunculu istemcide mezarı sunucu koyar) */
  const esyalar = o.envanter.tumEsyalar(), sac = l => { for (const s of l) o.dusenler.birak(s.id, s.adet, p.x, p.y + 1, p.z, (Math.random() - 0.5) * 4, 3 + Math.random() * 2, (Math.random() - 0.5) * 4, s.dayanim, 2, s.buyu); };
  let mezarMetni = esyalar.length ? 'Eşyalarınız öldüğünüz yere düştü.' : 'Üzerinizde eşya yoktu.';
  if (esyalar.length && o.istemci && o.ag.mezarIste) { o.ag.mezarIste(p.x, p.y, p.z, esyalar); mezarMetni = 'Eşyalarınız ölüm yerindeki mezar taşında saklanıyor (pusulada ✖).'; }
  else if (esyalar.length) {
    const r = mezarKoy(o.dunya, p.x, p.y, p.z, esyalar);
    sac(r.kalan);
    if (r.konum.length) { const [mx, my, mz] = r.konum[0]; o.olumNoktasi = { x: mx, y: my, z: mz }; mezarMetni = `Eşyalarınız mezar taşında saklanıyor (${mx}, ${my}, ${mz}; pusulada ✖). Mezara sağ tıklanarak geri alınır.`; }
  }
  o.envanter.temizle();
  /* 0.22.0: istatistikler */
  const B = o.basarimlar, hayat = Math.max(0, o.gun + o.zaman - o.hayatBasi);
  B.istatEkle('olum'); B.istatEnBuyuk('enUzun', hayat);
  o.kanliIzlendi = null; o.tilsim = 0; $('#tilsimHalka').hidden = true;
  $('#olumMezar').textContent = mezarMetni;
  $('#olumIstat').textContent = `Bu hayat ${hayat < 1 ? Math.round(hayat * 24) + ' saat' : hayat.toFixed(1).replace('.', ',') + ' gün'} sürdü · En uzun: ${(B.istat.enUzun || 0).toFixed(1).replace('.', ',')} gün · Yenilen canavar: ${B.istat.canavar || 0}`;
  /* Ölümde iksir etkileri biter, deneyimin yarısı kaybedilir */
  o.hayatta.etkiler = {}; o.hayatta.xp = Math.floor(o.hayatta.xp / 2);
  $('#olumSebep').textContent = OLUM_SEBEBI[sebep] || 'Hayatınızı kaybettiniz.';
  /* 0.23.0: gerçek ölüm: karakter yere yığılır, görüntü kızarıp kararır; ölüm ekranı ardından açılır */
  const tekCan = !!(o.Z && o.Z.tekCan) && !o.istemci;
  $('#yenidenDog').hidden = tekCan; $('#izleyiciOl').hidden = !tekCan; $('#sonKayitDog').hidden = tekCan;
  /* 0.39.0: son kayıt noktası (yatak) yoksa ya da yatak artık yerinde değilse düğme görünür ama pasiftir */
  yatakDenetle(o); $('#sonKayitDog').disabled = !o.yatakNoktasi;
  if (tekCan) { o.hardcoreBitti = true; $('#olumMezar').textContent = 'Hardcore: tek can tükendi ve bu dünya sona erdi. Dünya izleyici olarak dolaşılabilir.'; }
  o.olumAnim = 0.001; o.olumBas = performance.now(); $('#olumPerde').classList.add('acik'); tiklaGuncelle();
  oyunKaydet();
}
/* 0.39.0: yeniden doğma: 'yatak' son kullanılan yatak (doğma noktası); 0.40.3: 'dunya' rastgele güvenli bir konum */
function yenidenDog(nereye) {
  const o = oyun; ses.tik();
  if (nereye === 'yatak') { yatakDenetle(o); if (!o.yatakNoktasi) { $('#sonKayitDog').disabled = true; return; } }
  const d = nereye === 'yatak' ? o.yatakNoktasi : o.dunya.uretici.rastgeleDogum();
  konsol.kayit('oyuncu', 'Oyuncu yeniden doğdu', { alan: { yer: nereye === 'yatak' ? 'yatak' : 'rastgele konum', konum: `${Math.round(d.x)} ${Math.round(d.y)} ${Math.round(d.z)}` } });
  o.olumAnim = 0; $('#olumPerde').classList.remove('acik');
  o.hayatta.sifirla(); o.hayatBasi = o.gun + o.zaman;
  o.oyuncu.konum.set(d.x, d.y, d.z); o.oyuncu.hiz.set(0, 0, 0); o.oyuncu.dusus = 0;
  /* 0.30.5: doğma noktasının 24 blok çevresindeki canavarlar kaldırılır; 5 saniye hasar alınmaz */
  o.hayatta.koruma = 5;
  if (o.istemci) { if (o.ag) o.ag.gonder({ t: 'dg', p: [d.x, d.y, d.z] }); }
  else o.varliklar.dogumTemizle(d.x, d.y, d.z);
  o.hazir = false;
  ekran('yukleme'); $('#yukleBaslik').textContent = nereye === 'yatak' ? 'Yatakta uyanılıyor' : 'Yeniden doğuluyor';
}
$('#yenidenDog').onclick = () => yenidenDog('dunya');
$('#sonKayitDog').onclick = () => yenidenDog('yatak');
/* Yatak kayıt noktası: yatağın bulunduğu parça yüklüyse yatak hâlâ yerinde mi */
function yatakDenetle(o) {
  const Y = o.yatakNoktasi; if (!Y) return;
  if (!Y.hucreler || !Y.hucreler.length) return;   // köyde konaklama: kapı önü
  const [x, y, z] = Y.hucreler[0];
  if (o.dunya.yuklu(x, z) && !(BLOKLAR[o.dunya.blok(x, y, z)] && BLOKLAR[o.dunya.blok(x, y, z)].yatak)) { o.yatakNoktasi = null; }
}
/* Kayıtlı yatağın herhangi bir parçası kırılınca kayıt noktası iptal edilir */
function yatakKirildi(x, y, z) {
  const o = oyun, Y = o && o.yatakNoktasi;
  if (!Y || !Y.hucreler.some(([a, b, c]) => a === x && b === y && c === z)) return;
  o.yatakNoktasi = null;
  o.hud.bildirim('Yatak kırıldı: doğma noktası iptal edildi.');
}
$('#izleyiciOl').onclick = () => {
  const o = oyun; ses.tik(); o.olumAnim = 0; $('#olumPerde').classList.remove('acik');
  o.hayatta.sifirla(); izleyiciYap(o); o.oyuncu.konum.y += 2; o.oyuncu.hiz.set(0, 0, 0);
  ekran('oyun'); kilitle();
};
$('#olumCik').onclick = async () => { ses.tik(); oyun.olumAnim = 0; $('#olumPerde').classList.remove('acik'); oyun.hayatta.sifirla(); yatakDenetle(oyun); { const d = oyun.yatakNoktasi || oyun.dunya.uretici.rastgeleDogum(); oyun.oyuncu.konum.set(d.x, d.y, d.z); } await oyunKaydet(); oyunBitir(); ekran('ana'); };

/* 0.42.0: kayıtlar sıraya girer (aynı anda iki kayıt yazılmaz); kayıt verisi hazırlanırken çıkan hata bildirilir */
let kayitZinciri = Promise.resolve(), kayitSirada = null, kayitHataBildirildi = false;
/* 0.42.0: envanter penceresi açıkken imleçte taşınan eşya da kayda girer (sekme kapanırsa kaybolmaz) */
function envanterKaydi(o) {
  const e = o.envanter.disaAktar(), T = envEkrani.acik && envEkrani.envanter === o.envanter && envEkrani.tasinan;
  if (T && T.adet > 0) e.tasinan = T.buyu ? [T.id, T.adet, T.dayanim ?? null, T.buyu] : [T.id, T.adet, T.dayanim ?? null];
  return e;
}
function oyunKaydet() {
  if (kayitSirada) return kayitSirada;   // sırada bekleyen kayıt zaten en güncel durumu yazacak
  const k = kayitZinciri.then(() => { kayitSirada = null; return oyunKaydetIc(); }).catch(e => hataGoster('Kayıt: ' + (e && e.message || e)));
  kayitSirada = kayitZinciri = k;
  return k;
}
async function oyunKaydetIc() {
  const o = oyun;
  if (!o || !o.hazir && !o.hayatta.olu) return;
  /* Keşif haritası (istemcide de yerel olarak saklanır) */
  HaritaKayit.kaydet(o.haritaKimlik, o.harita.kirliBolgeler()).catch(() => {});
  /* Çok oyunculu istemci: dünya sunucuda; oyuncu bilgileri sunucuya kaydedilir */
  if (o.istemci) { if (o.ag) o.ag.kayitGonder(); return; }
  const p = o.oyuncu.konum;
  let veri;
  try { veri = {
    id: o.id, ad: o.ad, tohum: o.tohum, uretici: o.uretici, olusturma: o.olusturma, son: Date.now(), surum: SURUM,
    oyuncu: { x: +p.x.toFixed(3), y: +p.y.toFixed(3), z: +p.z.toFixed(3), yaw: o.oyuncu.yaw, pitch: o.oyuncu.pitch },
    hayatta: o.hayatta.disaAktar(), envanter: envanterKaydi(o), zaman: o.zaman, gun: o.gun, dogum: o.dogum, yatakNoktasi: o.yatakNoktasi, olumNoktasi: o.olumNoktasi, hayatBasi: o.hayatBasi,
    degisiklikler: o.dunya.degisiklikleriAl(), dusenler: o.dusenler.disaAktar(),
    koyler: o.koyler.disaAktar(), gorevler: o.gorevler.disaAktar(), sandiklar: o.dunya.sandiklariAl(), enerji: o.dunya.enerjiAl(), kablolar: o.kablolar.disaAktar(), tekneler: o.tekneler.disaAktar(),
    yapiPlani: o.etkilesim && o.etkilesim.plan ? o.etkilesim.plan.plan : null,   // 0.35.0: Yapı Planı dünyayla da kaydedilir
    oyuncuKayitlari: o.oyuncuKayitlari, yerler: o.yerler, komutlar: !!o.komutlar, konsol: !!o.konsol, vucutIsisi: o.vucutIsisi !== false, zorluk: o.zorluk, denge: o.denge, hardcoreBitti: !!o.hardcoreBitti, ogretici: o.ogretici, gelistirici: !!o.gelistirici, uretimSurumu: URETIM_SURUMU,
    hava: o.hava.disaAktar(), evciller: o.varliklar.evcilDisa(), basarimlar: o.basarimlar.disaAktar(), bosslar: o.yapiOlaylari.disaAktar(), gecit: o.gecit.disaAktar(), adaBekci: o.adaBekcisi ? o.adaBekcisi.disaAktar() : null
  }; } catch (e) {
    konsol.kayit('dunya', 'Kayıt verisi hazırlanamadı', { seviye: 'kritik', alan: { hata: e.message } });
    if (!kayitHataBildirildi) { kayitHataBildirildi = true; hataGoster('Kayıt hazırlanamadı: ' + e.message); }
    return;
  }
  try { await Kayit.kaydet(veri); kayitHataBildirildi = false; }
  catch (e) {
    const dolu = e && (e.name === 'QuotaExceededError' || /quota/i.test(e.message || ''));
    o.hud.bildirim(dolu ? 'Kayıt yapılamadı: tarayıcı depolama alanı dolu. Eski dünyaları silmek ya da yedekleyip kaldırmak yer açar.' : 'Kayıt yapılamadı: tarayıcı depolaması kapalı olabilir.');
  }
}
addEventListener('beforeunload', () => { if (oyun && oyun.hazir) oyunKaydet(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && oyun && oyun.hazir) oyunKaydet(); });

function oyunBitir() {
  if (!oyun) return;
  document.body.classList.remove('izleyici');
  if (oyun.ag) { oyun.ag.kapat(); oyun.ag = null; }
  if (sohbetAcik) sohbetKapat(false);
  $('#sohbetListe').innerHTML = ''; oyuncuListesiGoster(false);
  arkaPlanAyarla();
  if (envEkrani.acik) envEkrani.kapat();
  if (koyluEkrani.acik) koyluEkrani.kapat();
  if (gorevEkrani.acik) gorevEkrani.kapat();
  if (haritaEkrani.acik) haritaEkrani.kapat();
  if (basarimEkrani.acik) basarimEkrani.kapat();
  if (tarifKitabi.acik) tarifKitabi.kapat();
  basarimEkrani.temizle();
  oyun.harita.temizle();
  oyun.dusenler.temizle();
  if (oyun.cihazCizici) { oyun.cihazCizici.temizle(); sahne.sahne.remove(oyun.cihazCizici.grup); }
  oyun.varliklar.temizle();
  oyun.tekneler.temizle(); oyun.fenerler.temizle(); oyun.olta.kaldir();
  oyun.hava.temizle(); ses.yagmurAyarla(0);
  konsol.kesifBitir(); gelPencere.oyunBitti();
  if (oyun.kumDusmesi) oyun.kumDusmesi.kapat();
  sahne.sahne.remove(oyun.dusenler.grup); sahne.sahne.remove(oyun.dusenler.noktalar); sahne.sahne.remove(oyun.tekneler.grup, oyun.olta.mesh, oyun.olta.cizgi);
  oyun.dunya.yoket();
  sahne.secimGoster(null);
  oyun = null;
  $('#hud').hidden = true;
  if (document.pointerLockElement || (dokun.aktif && kilitli)) { bilerekBirak = true; kilitBirak(); }
}

/* ---------- Döngü ---------- */
let onceki = performance.now(), fpsSayac = 0, fpsZaman = 0;
/* 0.19.0: otomatik çözünürlük: oyun sırasında kare hızı 2 saniye boyunca 45'in altında kalırsa çizim çözünürlüğü düşer, 57'nin üstüne çıkınca yükselir */
const oto = { t0: 0, kare: 0 };
function otoCozunurluk(t) {
  if ((ayar.cozunurluk | 0) !== 0 || !oyun || !oyun.hazir || aktifEkran !== 'oyun' || document.hidden) { oto.t0 = t; oto.kare = 0; return; }
  oto.kare++;
  const s = (t - oto.t0) / 1000;
  if (s < 2) return;
  const fps = oto.kare / s;
  if (fps < 45) sahne.olcekAyarla(sahne.olcek - 0.1);
  else if (fps > 57) sahne.olcekAyarla(sahne.olcek + 0.05);
  oto.t0 = t; oto.kare = 0;
}
const gecici = new THREE.Vector3();
let ziplaBasildi = false;
/* 0.42.0: karede çıkan hata konsola ayrıntısıyla yazılır; aynı hata her karede tekrar bildirilmez */
const kareHatalari = new Map();
function dongu(t) {
  requestAnimationFrame(dongu);
  try { adim(t); }
  catch (e) {
    const m = (e && e.message) || String(e), n = (kareHatalari.get(m) || 0) + 1;
    kareHatalari.set(m, n);
    if (n === 1) { console.error(e); hataGoster(m); try { konsol.kayit('dunya', 'Oyun döngüsünde hata', { seviye: 'kritik', alan: { hata: m, yer: String(e && e.stack || '').split('\n')[1]?.trim() || '' } }); } catch (x) { /* konsol hazır değil */ } }
  }
}
function adim(t) {
  let dt = (t - onceki) / 1000; onceki = t;
  if (dt < 0) return;
  fpsSayac++; fpsZaman += Math.min(dt, 1);   // 0.22.0: kare hızı gerçek süreyle ölçülür (yavaş cihazda 20'nin altı da gösterilir)
  if (dt > 0.05) dt = 0.05;
  dokun.guncelle();
  otoCozunurluk(t);
  if (fpsZaman >= 0.5) { $('#fps').textContent = Math.round(fpsSayac / fpsZaman) + ' FPS'; fpsSayac = 0; fpsZaman = 0; }
  const o = oyun;
  if (!o) { menuKamera(dt); muzik.guncelle(dt, 'menu'); return; }
  if (!o.hazir) { yuklemeKontrol(); if (o.ag) o.ag.guncelle(dt); if (oyun) sahne.ciz(); return; }
  /* Çok oyunculuda dünya duraklatılmaz (menüdeyken de oyun sürer) */
  const calisiyor = aktifEkran === 'oyun' || (!!o.ag && aktifEkran !== 'yukleme');
  const p = o.oyuncu.konum;
  const diyar = diyarMi(p.x);
  /* 0.18.0: mevsim günden hesaplanır; değişince çimen ve yaprak dokuları yeniden boyanır */
  const mev = mevsimAl(o.gun);
  if (o.mevsim !== mev) {
    const ilk = o.mevsim == null;
    o.mevsim = mev; o.dunya.mevsim = mev; o.hava.kis = mev === 3;
    if (mevsimDokulari(mev)) { sahne.atlasDoku.needsUpdate = true; sahne.elBlokMalzeme.map.needsUpdate = true; o.dusenler.blokMalz.map.needsUpdate = true; if (o.cihazCizici) o.cihazCizici.map.needsUpdate = true; }
    if (!ilk) o.hud.bildirim(`${MEVSIMLER[mev]} başladı.${mev === 3 ? ' Ekinler yavaş büyür, sular donar.' : mev === 0 ? ' Ekinler hızlı büyür, çiçekler açar.' : ''}`);
  }
  o.dunya.guncelle(p.x, p.z);
  o.harita.guncelle(dt);
  if (calisiyor) {
    o.sure += dt;
    const oncekiZaman = o.zaman;
    /* İstemcide gün değişimi sunucudan gelir */
    if (o.istemci) o.zaman = Math.min(0.99999, o.zaman + dt * zamanHizi(o.zaman, o.mevsim) / GUN_SURESI);
    else {
      o.zaman += dt * (o.zamanHizi ?? 1) * zamanHizi(o.zaman, o.mevsim) / GUN_SURESI;
      if (o.zaman >= 1) { o.zaman -= 1; o.gun++; o.koyler.sabah(); o.hud.bildirim(`${o.gun}. gün başladı`); }
    }
    if (oncekiZaman < 0.46 && o.zaman >= 0.46 && !kanliAyGunu(o.gun, o.denge.kanliAy)) o.hud.bildirim('Akşam oluyor. Gece zombiler ortaya çıkar.');
    /* 0.22.0: Kanlı Ay sabaha kadar atlatıldı mı */
    if (o.kanliIzlendi && o.kanliIzlendi === o.gun - 1 && o.zaman < 0.3 && !o.hayatta.olu) {
      o.kanliIzlendi = null; o.basarimlar.ver('kanliAy'); o.basarimlar.artir('kanliAy3'); o.basarimlar.istatEkle('kanliAy'); o.hayatta.xpEkle(25);
      o.hud.bildirim('Kanlı Ay geride kaldı. Hayatta kaldınız!'); ses.gorev();
    }
    /* Uyku: ekran kararır, sabah olur */
    if (o.uyku > 0) {
      o.uyku -= dt;
      if (!o.uyandi && o.uyku < 1.3) {
        o.uyandi = true; $('#uyku').classList.remove('acik'); o.basarimlar.ver('uyku');
        if (o.istemci) o.hud.bildirim('Doğma noktası yatağa ayarlandı.');
        else { o.zaman = 0.0; o.gun++; o.koyler.sabah(); o.hud.bildirim(`${o.gun}. gün başladı. Doğma noktası yatağa ayarlandı.`); o.hava.t += 300; }   // 0.35.0: uyurken hava tüm dünyada açılmaz; yağış alanları gece boyunca ilerler
      }
    }
    /* Çok oyunculu: yatakta beklerken hareket edilince kalkılır; gündüz olunca da kalkılır */
    if (o.yatakta && (!kilitli ? false : (basili(tus, 'ileri') || basili(tus, 'sol') || basili(tus, 'geri') || basili(tus, 'sag') || basili(tus, 'zipla') || basili(tus, 'egil'))) || (o.yatakta && (((o.zaman < 0.52 || o.zaman > 0.97) && !o.hava.firtina) || o.hayatta.olu))) yataktanKalk();
    const g = kilitli && o.uyku <= 0 && !o.yatakta ? {
      ileri: basili(tus, 'ileri'), geri: basili(tus, 'geri'), sol: basili(tus, 'sol'), sag: basili(tus, 'sag'), zipla: basili(tus, 'zipla') || ziplaBasildi,   // 0.30.7: değiştirilebilir tuşlar
      kos: basili(tus, 'kos') || kosKilit, egil: basili(tus, 'egil'), kosabilir: o.hayatta.aclik > 6 && !o.hayatta.etki('kirik')
    } : { kosabilir: false };
    ziplaBasildi = false;
    const zirh = o.envanter.zirh;
    g.palet = !!(zirh[3] && zirh[3].id === 457);
    /* Tekne: binilirken oyuncu fiziği yerine tekne sürülür; C ile inilir */
    /* Tekneden inme: C */
    if (o.tekneler.binilen && (g.egil || o.hayatta.olu)) { o.tekneler.in(o.oyuncu); o.inisBekle = 0.4; }
    /* At: C ile inilir; oturak: hareket edince kalkılır */
    const BN = o.binek;
    if (BN.biniyor && (g.egil || o.hayatta.olu)) { BN.in(); o.inisBekle = 0.4; }
    if (BN.oturak && (g.ileri || g.geri || g.sol || g.sag || g.zipla || g.egil || o.hayatta.olu)) { BN.kalk(); o.inisBekle = 0.3; }
    BN.guncelle(dt, g);
    $('#tekneIpucu').hidden = !o.tekneler.binilen;
    o.inisBekle = (o.inisBekle || 0) - dt;
    o.tekneler.guncelle(dt, { oyuncu: o.oyuncu, girdi: g, gunIsigi: o.gunIsigi });
    let mesafe = 0;
    if (o.tekneler.binilen || BN.biniyor || BN.oturak) { const P = o.oyuncu; P.hiz.set(0, 0, 0); P.dusus = 0; P.suda = P.basSuda = P.lavda = P.basLavda = false; P.yerde = true; P.kosuyor = false; P.egiliyor = false; }
    else { const zem = BLOKLAR[o.dunya.blok(Math.floor(p.x), Math.floor(p.y - 0.05), Math.floor(p.z))];   // 0.18.0: kül kumu yavaşlatır
      if (o.hayatta.atel && !o.hayatta.etki('kirik')) o.hayatta.atel = false;
      o.oyuncu.etkiHiz = (o.hayatta.etki('hiz') ? 1.3 : 1) * (o.hayatta.etki('yavas') ? 0.6 : 1) * (zem && zem.yavaslatir && o.oyuncu.yerde ? 0.55 : 1)
        * (o.hayatta.etki('kirik') ? (o.hayatta.atel ? 0.8 : 0.55) : 1) * (o.hayatta.isiDurum === -2 ? 0.85 : 1);   // 0.22.0: kırık bacak ve donma yavaşlatır
      mesafe = o.oyuncu.guncelle(dt, o.inisBekle > 0 ? { ...g, egil: false } : g) || 0; }
    o.hayatta.yor(mesafe * (o.oyuncu.kosuyor ? 0.1 : 0.01));
    /* 0.23.0: koşarken ayak tozu */
    if (o.oyuncu.kosuyor && o.oyuncu.yerde && !o.oyuncu.suda && mesafe > 0 && Math.random() < dt * 9) {
      const zid = o.dunya.blok(Math.floor(p.x), Math.floor(p.y - 0.2), Math.floor(p.z));
      if (zid && KATI[zid]) o.dusenler.renkliParcacik(blokRengi(zid), p.x - Math.sin(o.oyuncu.yaw) * -0.3, p.y + 0.05, p.z - Math.cos(o.oyuncu.yaw) * -0.3, 2);
    }
    o.hayatta.guncelle(dt, o.oyuncu.basSuda, { lavda: o.oyuncu.lavda, suda: o.oyuncu.suda && !o.oyuncu.lavda, maske: !!(zirh[0] && zirh[0].id === 456), solunum: o.envanter.zirhBuyu('solunum'), atesYakin: o.atesYakin });
    /* 0.22.0: vücut ısısı (hissedilen sıcaklık yarım saniyede bir hesaplanır), tılsım, istatistikler */
    o.isiSayac -= dt;
    if (o.isiSayac <= 0 && o.hazir) {
      o.isiSayac = 0.5;
      const s = hissedilenSicaklik(o);
      o.hayatta.hissedilen = s.t; o.ortamIsi = s.ortam; o.atesYakin = s.ates;
      if (s.ates && o.hayatta.vucut < 36) o.basarimlar.ver('isinma');
    }
    o.hayatta.isiGuncelle(dt, { kosuyor: o.oyuncu.kosuyor });
    if (o.hayatta.isiDurum < 0 && !o.hayatta.olu) { o.titremeSayac = (o.titremeSayac || 0) - dt; if (o.titremeSayac <= 0) { o.titremeSayac = 4 + Math.random() * 3; ses.titreme(); } }
    if (o.hayatta.etki('kanama') && !o.hayatta.olu) { o.kalpSayac = (o.kalpSayac || 0) - dt; if (o.kalpSayac <= 0) { o.kalpSayac = 1.1; ses.kalpAtisi(0.6); if (Math.random() < 0.7) o.dusenler.renkliParcacik([0.6, 0.05, 0.05], p.x, p.y + 0.6, p.z, 3); } }
    tilsimGuncelle(o, dt);
    if (!o.hayatta.olu) { o.basarimlar.istatEkle('sure', dt); if (mesafe > 0) { o.basarimlar.istatEkle('mesafe', mesafe); o.ogrMesafe = (o.ogrMesafe || 0) + mesafe; } }
    ogretici.guncelle(o, dt, ayar.ogretici !== false && !panelAcik());
    $('#yanmaEfekt').classList.toggle('acik', o.hayatta.yanma > 0 && !o.hayatta.olu);
    /* 0.18.0: magma bloğu üstünde (eğilmeden) durmak yakar; geçidin içinde durmak geçirir */
    const zemId = o.dunya.blok(Math.floor(p.x), Math.floor(p.y - 0.05), Math.floor(p.z));
    o.magmaSayac = (o.magmaSayac || 0) - dt;
    if (BLOKLAR[zemId] && BLOKLAR[zemId].magma && o.oyuncu.yerde && !o.oyuncu.egiliyor && !o.hayatta.olu && o.magmaSayac <= 0) { o.magmaSayac = 0.8; if (!o.hayatta.etki('ates')) o.hayatta.hasar(1, 'magma', true); }
    const ge = !o.hayatta.olu && !BN.biniyor && !o.tekneler.binilen ? o.gecit.guncelle(dt) : 0;
    $('#gecitEfekt').style.opacity = ge.toFixed(2);
    if (!o.hazir) return;
    /* 0.41.0: biyom atmosferi */
    if (!ortamAtmosfer) ortamAtmosfer = new Ortam(sahne);
    /* 0.41.10: ses dinleyicisi (baş konumu ve bakış yönü; aradaki opak bloklar sesi boğar), su altında boğukluk, mağarada yankı */
    { const gz = o.oyuncu.gozKonumu(), D = o.dunya; ses.dinleyiciAyarla(gz.x, gz.y, gz.z, o.oyuncu.yaw, (x, y, z) => OPAK[D.blok(x, y, z)] === 1);
      ses.ortamAyarla({ suAlti: !!o.oyuncu.basSuda, yanki: diyar ? 0.18 : ortamAtmosfer.yeralti ? 0.3 : 0 }); }
    ortamAtmosfer.guncelle(o, dt, ses, { gun: o.gunIsigi ?? 1, diyar, yagis: o.hava ? o.hava.yogunluk : 0, zamanSn: o.sure || 0 });
    /* Mağara ortam sesleri */
    o.ortamSayac -= dt;
    if (o.ortamSayac <= 0) {
      o.ortamSayac = 3 + Math.random() * 6;
      const g = o.oyuncu.gozKonumu();
      if (diyar) { ses.diyarUgultu(); if (Math.random() < 0.6) ses.lav(0.6 + Math.random() * 0.4); }
      else if (o.dunya.ustKati(Math.floor(g.x), Math.floor(g.z)) > g.y + 2 && g.y < DENIZ + 6) {
        ses.damla(0.4 + Math.random() * 0.6);
        for (const m of o.dunya.mesaleler.values()) if (m[3] === 11 && Math.hypot(m[0] - g.x, m[1] - g.y, m[2] - g.z) < 14) { ses.konumlu(m[0], m[1], m[2], () => ses.lav(1), 16); break; }   // 0.41.10: konumlu
      }
    }
    if (kilitli && !o.hayatta.olu && o.uyku <= 0) o.etkilesim.guncelle(dt, { sol: fare.sol, sag: fare.sag, egil: basili(tus, 'egil') });
    else { o.etkilesim.ilerleme = 0; sahne.secimGoster(o.etkilesim.isin(o.oyuncu.gozKonumu(), o.oyuncu.bakisYonu())); }
    const eldeki = o.envanter.seciliId();
    o.olta.guncelle(dt, !!ESYALAR[eldeki] && ESYALAR[eldeki].tur === 'olta' && !o.hayatta.olu, o.isik);
    varlikGuncelle(o, dt, {
      oyuncu: o.oyuncu, ad: ayar.ad, oyuncuOlu: o.hayatta.olu || !!o.izleyici, oyuncuSuda: o.oyuncu.suda, gunIsigi: o.gunIsigi, gunSayisi: o.gun, isik: o.isik,
      firtina: o.hava.firtina && o.hava.yogunluk > 0.5, yagmur: o.hava.yogunluk > 0.3, eldeki: o.envanter.seciliId(), kanliAy: o.gok.kanliAyMi(o), zorlukCanavar: o.Z ? o.Z.canavar : 1,
      oyuncuyaVur: (n, v, kaynak) => { const k = kaynak || v.konum; yerelHasar(n + (v.kanli ? 1 : 0), v.turAd, v.tur.agu, k.x, k.z); },
      okTopla: () => { const k = o.envanter.ekle(287, 1); if (!k) ses.topla(); return !k; }
    }, o.ag && !o.istemci);
    const ekKonumlar = o.ag && !o.istemci ? o.ag.konumlar() : null;
    /* Hava durumu: tek oyunculuda ve sunucuda değişir */
    if (!o.istemci) o.hava.zamanla(dt, [o.oyuncu.konum, ...(ekKonumlar || [])].filter(q => !diyarMi(q.x)));
    o.dunya.yagiyor = o.hava.yagiyor && o.hava.yogunluk > 0.5;
    o.koyler.guncelle(dt, o.oyuncu, ekKonumlar);
    if (!o.istemci) o.yapiOlaylari.guncelle(dt, (ekKonumlar ? [o.oyuncu.konum, ...ekKonumlar] : [o.oyuncu.konum]).filter(q => !diyarMi(q.x)));
    if (!o.istemci) o.gecit.zamanGuncelle(dt);   // 0.39.0
    if (!o.istemci && o.adaBekcisi) o.adaBekcisi.guncelle(dt, (ekKonumlar ? [o.oyuncu.konum, ...ekKonumlar] : [o.oyuncu.konum]).filter(q => !diyarMi(q.x)));   // 0.38.0
    if (o.mekanik) o.mekanik.guncelle(dt);
    if (o.elektrik) o.elektrik.guncelle(dt);
    if (o.firinlar) o.firinlar.guncelle(dt);   // 0.33.0: fırın ve kamp ateşi
    if (o.baskinlar) o.baskinlar.guncelle(dt, o);   // 0.35.0: köy baskınları
    if (o.suAkisi) o.suAkisi.guncelle(dt);   // 0.30.5
    if (o.kumDusmesi) o.kumDusmesi.guncelle(dt, o.gunIsigi ?? 1);
    o.tikSayac += dt;
    /* Rastgele tikler ve ekinler sunucuda işlenir; istemciye blok değişikliği olarak gelir */
    if (o.tikSayac > 0.5 && !o.istemci) { o.tikSayac = 0; o.dunya.rastgeleTik(p.x, p.z); o.dunya.mevsimTik(p.x, p.z); if (ekKonumlar) for (const q of ekKonumlar) { o.dunya.rastgeleTik(q.x, q.z); o.dunya.mevsimTik(q.x, q.z); } o.dunya.ekinTik(); }
    o.kayitSayac += dt;
    if (o.kayitSayac > 60) { o.kayitSayac = 0; oyunKaydet(); }
  }
  if (o.ag) o.ag.guncelle(dt);
  /* Kamera, gökyüzü, ışık */
  o.oyuncu.kameraAyarla(sahne.kamera, ayar.sallanma);
  /* 0.23.0: ölüm animasyonu: göz yere iner, kamera yana devrilir; 1,8 saniye sonra ölüm ekranı */
  if (o.olumAnim > 0) {
    o.olumAnim = Math.max(0.001, (performance.now() - (o.olumBas || performance.now())) / 1000);   // gerçek süreyle (yavaş cihazda da 1,8 sn)
    const k = Math.min(1, o.olumAnim / 0.9), e = 1 - (1 - k) * (1 - k) * (1 - k);
    sahne.kamera.position.y -= e * 1.3; sahne.kamera.rotation.z = e * 1.2; sahne.kamera.rotation.x = o.oyuncu.pitch * (1 - e) - e * 0.25;
    if (o.olumAnim > 1.8 && aktifEkran === 'oyun') ekran('olum');
  }
  /* 0.22.0: meteor çarpması sarsıntısı */
  if (o.sarsinti > 0) { const s = o.sarsinti * (ayar.sallanma ? 0.35 : 0.12); sahne.kamera.position.x += (Math.random() - 0.5) * s; sahne.kamera.position.y += (Math.random() - 0.5) * s; sahne.kamera.position.z += (Math.random() - 0.5) * s; o.sarsinti = Math.max(0, o.sarsinti - dt * 0.8); }
  const kosFov = o.oyuncu.kosuyor ? 8 : 0;
  /* 0.37.0: dürbün elde ve açıkken görüş daralır */
  if (o.etkilesim.durbun && o.envanter.seciliId() !== ESYA37.durbun) o.etkilesim.durbun = false;
  const hedefFov = o.etkilesim.durbun ? ayar.fov * 0.28 : ayar.fov + kosFov - o.etkilesim.germe * 12;
  if (Math.abs(sahne.kamera.fov - hedefFov) > 0.05) { sahne.kamera.fov += (hedefFov - sahne.kamera.fov) * Math.min(1, dt * 10); sahne.kamera.updateProjectionMatrix(); }
  const gozSuda = o.oyuncu.basSuda;
  const maskeli = !!(o.envanter.zirh[0] && o.envanter.zirh[0].id === 456);
  /* 0.33.0: birinci kişide kolun rengi: göğüs zırhı ya da uzun kollu üst kıyafet */
  { const gz = o.envanter.zirh[1], ku = o.envanter.kiyafet[1], ke = ku && ESYALAR[ku.id];
    sahne.kolRengi = gz && ESYALAR[gz.id] ? ESYALAR[gz.id].renk : ke && ke.kiyafet.sekil !== 'gomlek' ? ke.renk : null; }
  const H = o.hava, yagisTur = diyar ? 0 : H.yagisTuru(sahne.kamera.position);
  o.gok.guncelle(calisiyor ? dt : 0);
  H.guncelle(calisiyor ? dt : 0, sahne.kamera, gozSuda || diyar);
  const gun = sahne.gokGuncelle(o.zaman, sahne.kamera.position, o.oyuncu.basLavda ? 'lav' : gozSuda ? (maskeli ? 'maske' : true) : false, o.dunya.gorus, o.sure,
    diyar ? { diyar: true, gece: o.hayatta.etki('gece') } : { y: H.yogunluk * (yagisTur === 0 ? 0.45 : 1), f: H.firtinaK, simsek: H.simsekParla, gece: o.hayatta.etki('gece') });
  o.gunIsigi = gun;
  o.fenerler.guncelle(dt, o.yakinKoyler, gun);
  /* 0.19.0: duruma göre müzik */
  muzik.guncelle(dt, o.bossVar || (o.gok.kanli > 0.5 && !diyar) ? 'boss' : diyar ? 'diyar' : p.y < DENIZ - 6 && o.dunya.ustKati(Math.floor(p.x), Math.floor(p.z)) > p.y + 6 ? 'magara'
    : gun < 0.35 ? 'gece' : (o.biyom === BY.COL || o.biyom === BY.SAVAN) ? 'col' : 'gunduz');
  /* Meşale ışıkları */
  const seciliId = o.envanter.seciliId();
  const goz = o.oyuncu.gozKonumu(gecici);
  const liste = [];
  const titre = 13.5 + Math.sin(o.sure * 9) * 0.35 + Math.sin(o.sure * 23) * 0.2;
  if (seciliId === 46) liste.push([goz.x, goz.y - 0.3, goz.z, 11]);
  for (const m of o.dunya.yakinMesaleler(goz.x, goz.y, goz.z, 31)) liste.push([m[0], m[1], m[2], (m[3] || 14) * (m[5] ? 1 : titre / 13.5) * (m[4] ? -1 : 1)]);   // 0.39.0: magma ve ışıltaş titremez   // eksi: soğuk (buz) ışık
  sahne.isiklariAyarla(liste);
  /* El ve düşen eşyaların ışığı */
  o.isikSayac -= dt;
  if (o.isikSayac <= 0) {
    o.isikSayac = 0.25;
    const acik = o.dunya.ustKati(Math.floor(goz.x), Math.floor(goz.z)) < goz.y;
    let l = acik && !diyar ? gun : diyar ? 0.42 : 0.12;
    for (const L of liste) { const d = Math.hypot(L[0] - goz.x, L[1] - goz.y, L[2] - goz.z); l = Math.max(l, Math.min(1, (1 - d / (L[3] * 0.9)) * 1.1)); }
    o.isikHedef = Math.max(sahne.tamAydinlik ? 1 : o.hayatta.etki('gece') ? 0.75 : 0.1, l);
    /* Yağmur sesi: çatı altında boğuk, karda ve çölde yok */
    o.havaAcik = H.acikta(goz);
    ses.yagmurAyarla(calisiyor && !gozSuda && !diyar && yagisTur === 1 ? H.yogunluk * (o.havaAcik ? 1 : 0.45) : 0, !o.havaAcik);
  }
  o.isik += ((o.isikHedef || 1) - o.isik) * Math.min(1, dt * 4);
  /* 0.23.0: hareketli ateş, meşale ve lav dokuları; yakındaki ateşlerden kıvılcım ve duman */
  if (canliDokular(o.sure)) { sahne.atlasDoku.needsUpdate = true; sahne.elBlokMalzeme.map.needsUpdate = true; o.dusenler.blokMalz.map.needsUpdate = true; if (o.cihazCizici) o.cihazCizici.map.needsUpdate = true; }
  o.atesSayac = (o.atesSayac || 0) - dt;
  if (o.atesSayac <= 0 && calisiyor) {
    o.atesSayac = 0.12;
    const gp = o.oyuncu.konum;
    for (const m of o.dunya.yakinMesaleler(gp.x, gp.y + 1, gp.z, 12)) {
      const u = Math.hypot(m[0] - gp.x, m[1] - gp.y, m[2] - gp.z); if (u > 18) continue;
      const id = o.dunya.blok(Math.floor(m[0]), Math.floor(m[1] - 0.6), Math.floor(m[2]));
      if (id === 48) { if (Math.random() < 0.55) o.dusenler.atesParcacik(Math.floor(m[0]) + 0.5, Math.floor(m[1] - 0.6) + 0.55, Math.floor(m[2]) + 0.5, false); if (Math.random() < 0.35) o.dusenler.atesParcacik(Math.floor(m[0]) + 0.5, Math.floor(m[1] - 0.6) + 0.9, Math.floor(m[2]) + 0.5, true); }
      else if (BLOKLAR[id] && BLOKLAR[id].sekil === 'somine' && BLOKLAR[id].acik) { const [ox, oz] = [[0, -0.1], [0.1, 0], [0, 0.1], [-0.1, 0]][BLOKLAR[id].yon]; if (Math.random() < 0.4) o.dusenler.atesParcacik(Math.floor(m[0]) + 0.5 + ox, Math.floor(m[1] - 0.6) + 0.3, Math.floor(m[2]) + 0.5 + oz, Math.random() < 0.3); }   // 0.31.0: şömine
      else if (id === 46 && Math.random() < 0.12) o.dusenler.atesParcacik(Math.floor(m[0]) + 0.5, Math.floor(m[1] - 0.6) + 0.72, Math.floor(m[2]) + 0.5, Math.random() < 0.4);
    }
  }
  o.dusenler.guncelle(dt, o.oyuncu.konum, (id, adet, dayanim, buyu) => {
    const k = o.envanter.ekle(id, adet, dayanim, buyu);
    if (k < adet) { ses.topla(); konsol.kayit('esya', 'Eşya toplandı', { alan: { eşya: ESYALAR[id] ? ESYALAR[id].ad : '#' + id, adet: adet - k } }); }
    return k;
  }, o.isik, o.hayatta.olu || !o.hazir);
  sahne.el.visible = !o.hayatta.olu && !o.fotoModu;
  sahne.elAyarla(seciliId, buyuluMu(o.envanter.seciliYuva()));
  if (o.etkilesim.yemeAnim > 0) o.etkilesim.yemeAnim = Math.max(0, o.etkilesim.yemeAnim - dt * 1.6);
  sahne.elGuncelle(dt, o.etkilesim.vurus, o.oyuncu.adimFaz, o.isik, o.etkilesim.germe, { yeme: Math.min(1, (o.etkilesim.yemeAnim || 0) * 3), kos: o.oyuncu.kosuyor });
  const V = o.varliklar;
  /* Bosslar üstteki boss çubuğunda gösterilir */
  const hc = o.etkilesim.hedefCanli || (V.sonVurulanZaman > 0 && V.sonVurulan && !V.sonVurulan.olu ? V.sonVurulan : null);
  o.hud.hedef(hc && hc.tur.boss ? null : hc);
  /* 0.23.0: bakılan nesnenin adı */
  if (ayar.bakilanAd === false || hc || !kilitli && !dokun.aktif) o.hud.bakilan(null);
  else if (o.etkilesim.hedefTekne) o.hud.bakilan('Tekne');
  else if (o.etkilesim.hedef) o.hud.bakilan((BLOKLAR[o.etkilesim.hedef.id] || {}).ad || null);
  else o.hud.bakilan(null);
  /* 0.25.0: cihaz modelleri ve yerleştirme önizlemesi */
  if (o.cihazCizici) {
    o.cihazCizici.guncelle(dt, o.isik, { gunIsigi: o.gunIsigi, yogunluk: o.hava ? o.hava.yogunluk : 0, firtina: !!(o.hava && o.hava.firtina), mevsim: o.mevsim || 0, sure: o.sure },
      k => (o.elektrik ? o.elektrik.oranlar.get(k) : o.bataryaOran.get(k)));
    const etkin = kilitli && !gelPencere.acik && !o.hayatta.olu && !o.fotoModu && !o.izleyici;
    /* 0.28.0: taretler; çalışan jeneratörlerden duman, fıskiyelerden su */
    o.taretler.guncelle(dt, k => (o.elektrik ? o.elektrik.oranlar.get(k) : o.bataryaOran.get(k)) === 1);
    o.cihazParcacik = (o.cihazParcacik || 0) - dt;
    if (o.cihazParcacik <= 0) {
      o.cihazParcacik = 0.15;
      const P = o.oyuncu.konum;
      for (const [, [x, y, z]] of o.dunya.elektrikler) {
        if (Math.abs(x - P.x) > 28 || Math.abs(z - P.z) > 28) continue;
        const b = BLOKLAR[o.dunya.blok(x, y, z)];
        if (!b || !b.acik) continue;
        if (b.elektrik === 'jenerator' && Math.random() < 0.7) { const [ex, ez] = [[12.75, 10.75], [5.25, 12.75], [3.25, 5.25], [10.75, 3.25]][b.yon].map(v => v / 16); o.dusenler.atesParcacik(x + ex, y + 1, z + ez, true); }
        else if (b.elektrik === 'fiskiye') for (let i = 0; i < 3; i++) { const a = Math.random() * Math.PI * 2, r = 1 + Math.random() * 3; o.dusenler.renkliParcacik([0.55, 0.75, 1], x + 0.5 + Math.cos(a) * r, y + 0.2, z + 0.5 + Math.sin(a) * r, 1); }
      }
    }
    o.cihazCizici.onizleme(ayar.onizleme !== false && etkin && !o.etkilesim.kablo ? o.etkilesim.onizlemeBilgisi() : null);
    /* 0.26.0: kablolar, çekilen kablonun önizlemesi ve elde kablo varken bakılan kablonun vurgusu */
    const E = o.etkilesim, kabloElde = o.envanter.seciliId() === KABLO.esya, planElde = o.envanter.seciliId() === 345;
    E.shift = !!(tus.ShiftLeft || tus.ShiftRight);
    if (E.kablo && !kabloElde) E.kabloIptal();
    o.cihazCizici.kablolariCiz(o.kablolar, o.isik);
    const kon = E.kablo && etkin ? E.kabloOnizleme() : null, port = kabloElde && etkin ? (kon ? kon.port : E.bakilanPort()) : null;
    o.cihazCizici.kabloOnizleme(kon);
    o.cihazCizici.portVurgula(port, kon ? kon.gecerli : port && !port.dolu);
    o.cihazCizici.portlariGoster(kabloElde);
    o.cihazCizici.kabloVurgula(kabloElde && !E.kablo && !port && etkin ? o.cihazCizici.kabloIsin(o.oyuncu.gozKonumu(), o.oyuncu.bakisYonu(), E.hedef ? E.hedef.t + 0.05 : 5) : null);
    const pAd = p => `${p.ad} · <b>${p.tur === 'cikis' ? 'Çıkış' : 'Giriş'}</b>${p.dolu ? ' (dolu)' : ''}`, sr = v => v.toFixed(1).replace('.', ',');
    o.hud.kabloIpucu(kon ? `Kablo <b>${sr(kon.uz)}</b> / ${KABLO.toplam} blok · <b>${kon.maliyet}</b> kablo · sarkma <b>${kon.sark ? sr(kon.sark) + ' blok' : 'gergin'}</b>${E.shift ? ' · düz hizalı' : ''}${kon.port ? ' → ' + pAd(kon.port) : ''}${kon.gecerli ? '' : ` · <em>${kon.neden}</em>`}<span>Sol tık: karşı noktaya bağla / yüzeye ara nokta · Sağ tık: son noktayı geri al · Shift basılı: düz çek · Shift + tekerlek: sarkma · R: iptal</span>` :
      port ? `${pAd(port)}<span>${port.dolu ? 'Sağ tık: takılı kabloyu sök' : 'Sol tık: kablo çekmeye başla'}</span>` :
      kabloElde && etkin ? 'Elektrik Kablosu<span>Bir cihazın mavi (giriş) ya da turuncu (çıkış) noktasına sol tıklayınız · Kabloya sağ tık: sök · C + sağ tık cihaza: kablolarını sök</span>' :
      planElde && etkin ? E.plan.ipucu() : null);
    E.plan.guncelle(etkin);   // 0.31.0: Yapı Planı çerçevesi
  }
  /* 0.24.0: bakılan elektrik bloğunun ağ bilgisi */
  const eh = o.etkilesim.hedef, ebl = eh && !hc && !o.fotoModu && (kilitli || dokun.aktif) ? BLOKLAR[eh.id] : null;
  if (ebl && ebl.elektrik && ayar.enerjiPanel !== false) {
    const ek = eh.x + ',' + eh.y + ',' + eh.z;
    o.hud.enerji(enerjiMetni(ebl, o.elektrik ? o.elektrik.bilgi(ek) : o.ag && o.ag.enerjiIste ? o.ag.enerjiIste(ek) : null));
  } else o.hud.enerji(null);
  /* Gösterge */
  o.hud.durumCiz(o.oyuncu.basSuda);
  bossCubugu(o);
  o.isaretSayac -= dt;
  if (o.isaretSayac <= 0) {
    o.isaretSayac = 0.25;
    const isaret = [];
    o.yakinKoyler = [];
    for (const k of koylerAlan(o.dunya.uretici, p.x - 600, p.z - 600, p.x + 600, p.z + 600)) {
      const d = Math.hypot(k.x - p.x, k.z - p.z);
      if (d < 420) o.yakinKoyler.push(k);
      if (k.liman) {
        const L = k.liman, dl = Math.hypot(L.iskeleX - p.x, L.iskeleZ - p.z);
        if (dl < 600 && dl > 14) isaret.push({ aci: yonAci(L.iskeleX - p.x, L.iskeleZ - p.z), sinif: 'liman', metin: '⚓', baslik: `${k.ad} limanı · ${Math.round(dl)} blok`, mesafe: dl });
      }
      if (d > 600 || d < k.yaricap) continue;
      isaret.push({ aci: yonAci(k.x - p.x, k.z - p.z), sinif: 'koy', metin: '⌂', baslik: `${k.ad} · ${Math.round(d)} blok`, mesafe: d });
    }
    /* Binilmeyen en yakın tekne */
    if (!o.tekneler.binilen) {
      let en = null, enD = 120;
      for (const t of o.tekneler.liste) { const d = Math.hypot(t.p.x - p.x, t.p.z - p.z); if (d < enD && d > 6) { enD = d; en = t; } }
      if (en) isaret.push({ aci: yonAci(en.p.x - p.x, en.p.z - p.z), sinif: 'tekne', metin: '⛵', baslik: `${en.T.ad} · ${Math.round(enD)} blok`, mesafe: enD });
    }
    /* Haritada eklenen işaretler */
    for (const y of o.yerler) {
      const d = Math.hypot(y.x + 0.5 - p.x, y.z + 0.5 - p.z);
      if (d > 4) isaret.push({ aci: yonAci(y.x + 0.5 - p.x, y.z + 0.5 - p.z), sinif: 'yer', metin: '◆', baslik: esc2(y.ad), mesafe: d, renk: y.renk, kenar: true });
    }
    /* Diğer oyuncular */
    if (o.ag && o.ag.uzak) for (const u of o.ag.uzak.harita.values()) {
      if (u.ilk || (u.bayrak & 4)) continue;
      const d = Math.hypot(u.p.x - p.x, u.p.z - p.z);
      if (d > 4) isaret.push({ aci: yonAci(u.p.x - p.x, u.p.z - p.z), sinif: 'oyuncu', metin: '●', baslik: `${esc2(u.ad)} · ${Math.round(d)} blok`, mesafe: d, renk: u.renk, kenar: true });
    }
    for (const q of o.gorevler.aktif) {
      const hedef = o.gorevler.hedef(q, o.envanter);
      const hd = hedef && Math.hypot(hedef.x - p.x, hedef.z - p.z);
      if (hedef && hd > 12) isaret.push({ aci: yonAci(hedef.x - p.x, hedef.z - p.z), sinif: 'gorev', metin: '◆', baslik: q.kisa, mesafe: hd, kenar: true });
    }
    const nokta = (n, sinif, metin, baslik) => { if (!n) return; const d = Math.hypot(n.x - p.x, n.z - p.z); if (d > 8) isaret.push({ aci: yonAci(n.x - p.x, n.z - p.z), sinif, metin, baslik, mesafe: d, kenar: sinif === 'olum' }); };
    nokta(o.yatakNoktasi, 'dogum', '★', 'Doğma noktası (yatak)');   // 0.40.3: doğma noktası son kullanılan yataktır
    nokta(o.olumNoktasi, 'olum', '✖', 'Son ölüm noktası');
    /* 0.22.0: düşen meteorun yeri pusulada 15 dakika gösterilir */
    const mn = o.meteorNoktasi;
    if (mn) { const md = Math.hypot(mn.x + 0.5 - p.x, mn.z + 0.5 - p.z); if (md < 5 || o.sure > mn.son) o.meteorNoktasi = null; else isaret.push({ aci: yonAci(mn.x + 0.5 - p.x, mn.z + 0.5 - p.z), sinif: 'yer', metin: '✦', baslik: `Meteor düşüş yeri · ${Math.round(md)} blok`, mesafe: md, renk: '#ff9a3a', kenar: true }); }
    o.hud.isiCiz(o.hayatta, o.ortamIsi, o.vucutIsisi !== false);
    const hayat = o.gun + o.zaman - o.hayatBasi;
    if (hayat >= 10 && !o.hayatta.olu) o.basarimlar.ver('hayat10');
    /* Konum satırı: yeraltı derinliği, köy ya da biyom */
    const g = o.oyuncu.gozKonumu();
    const kol = o.dunya.uretici.kolon(Math.floor(p.x), Math.floor(p.z), {});
    /* Başarımlar: saniyede bir denetim */
    o.basarimSayac -= 0.25;
    tarifKitabi.takipCiz();
    if (o.basarimSayac <= 0 && !o.hayatta.olu) {
      o.basarimSayac = 1; o.biyom = diyar ? null : kol.b;
      o.basarimlar.denetle(o);
      if (diyar && kaleAt(o.dunya.uretici, Math.floor(p.x), Math.floor(p.y), Math.floor(p.z))) o.basarimlar.ver('kale');
      if (!diyar && !o.basarimlar.var('maden') && p.y < kol.h - 4 && madenAt(o.dunya.uretici, Math.floor(p.x), Math.floor(p.y), Math.floor(p.z))) o.basarimlar.ver('maden');
    }
    /* 0.30.6: Lanetli Ada: yaklaştıkça ekran kararır, uğultu duyulur */
    const ada = lanetliAda(o.dunya.uretici), adaD = diyar ? 1e9 : Math.hypot(p.x - ada.x, p.z - ada.z);
    const kar = Math.max(0, Math.min(1, (90 - adaD) / 70));
    /* 0.39.0: adaya yaklaşınca ekran artık kararmaz; yalnızca uğultu duyulur */
    if (kar > 0.3 && Math.random() < 0.02) ses.diyarUgultu();
    if (!diyar && adaD < 24) { o.konumMetni = `${ADA_AD} · Issız Deniz`; if (adaD < 12) o.basarimlar.ver('gecit'); }
    else if (diyar) o.konumMetni = `${kaleAt(o.dunya.uretici, Math.floor(p.x), Math.floor(p.y), Math.floor(p.z)) ? 'Kül Kalesi' : 'Yeraltı Diyarı'} · Y ${Math.floor(p.y)}`;
    else if (o.tekneler.binilen) { const t = o.tekneler.binilen; o.konumMetni = `${t.T.ad} · ${Math.abs(t.hiz).toFixed(1)} blok/sn · ${BIYOMLAR[kol.ab ?? kol.b]}`; }
    else if (o.oyuncu.basSuda) o.konumMetni = `Su altı · Derinlik ${Math.max(0, DENIZ + 1 - Math.floor(g.y))} · ${BIYOMLAR[kol.ab ?? kol.b]}`;
    else if (o.dunya.ustKati(Math.floor(g.x), Math.floor(g.z)) > g.y + 2 && g.y < kol.h - 2) o.konumMetni = `Yeraltı · Derinlik ${Math.max(0, kol.h - Math.floor(p.y))} · Y ${Math.floor(p.y)}`;
    else if (o.koyler.icindeki) { const U = UZMANLIK[o.koyler.icindeki.uzmanlik]; o.konumMetni = `${o.koyler.icindeki.ad} köyü${U ? ` (${U.kisa})` : ''} · ${BIYOMLAR[kol.ab ?? kol.b]}`; }
    else o.konumMetni = BIYOMLAR[kol.ab ?? kol.b];
    /* Pusulada yalnızca oyuncunun haritada eklediği işaretler gösterilir (diğerleri mini haritada ve büyük haritada) */
    o.isaretler = isaret.filter(m => m.sinif === 'yer');
    o.gorevler.guncelle(dt, p);   // 0.32.0: keşif ve teslimat süresi
    o.hud.gorevIzle(o.gorevler.ozet(o.envanter, p));
    o.hud.etkilerCiz(o.hayatta.etkiler);
    o.hud.hava(diyar ? 'acik' : H.durum, yagisTur);
    o.hud.zamanHizi(o.istemci ? 1 : (o.zamanHizi ?? 1));
  }
  o.hud.xpCiz(o.hayatta);
  if (o.olumNoktasi && Math.hypot(o.olumNoktasi.x - p.x, o.olumNoktasi.z - p.z) < 3 && !o.hayatta.olu) o.olumNoktasi = null;
  o.hud.pusula(o.oyuncu.yaw, o.isaretler);
  /* 0.18.0: Yeraltı Diyarı'nda mini harita gizlenir */
  if (o.diyarda !== diyar) { o.diyarda = diyar; $('#miniHarita').hidden = !ayar.miniHarita || diyar; }
  miniHarita.ciz(o, dt);
  konsol.guncelle(dt);
  gelPencere.guncelle(dt);
  if (oyun && oyun.hazir) olayKaydiDenetle(oyun, dt);   // 0.40.5
  if (haritaEkrani.acik) { haritaEkrani.guncelle(dt); haritaAlanYaz(o); }
  o.hud.saat(o.zaman, o.gun, o.konumMetni, H.firtina && H.yogunluk > 0.5 && !diyar, diyar ? null : `${MEVSIMLER[o.mevsim]} ${((o.gun - 1) % MEVSIM_GUN) + 1}/${MEVSIM_GUN}`, !diyar && kanliAyGunu(o.gun, o.denge.kanliAy));
  /* 0.22.0: soğuk ve sıcak kenar efektleri */
  const vucut = o.hayatta.vucut, ayaz = Math.max(0, Math.min(1, (36.2 - vucut) / 2.2)), sicak = Math.max(0, Math.min(1, (vucut - 38) / 2));
  if (Math.abs(ayaz - (o.sonAyaz || 0)) > 0.02) { o.sonAyaz = ayaz; $('#ayazEfekt').style.opacity = ayaz.toFixed(2); }
  if (Math.abs(sicak - (o.sonSicak || 0)) > 0.02) { o.sonSicak = sicak; $('#sicakEfekt').style.opacity = sicak.toFixed(2); }
  o.hud.suAlti(gozSuda);
  if (!$('#hata').hidden) hataPaneli(o);
  /* 0.30.3: açık envanter yarım saniyede bir yenilenir (yakın istasyonlar); değişmeyen öğeler yeniden kurulmaz */
  if (envEkrani.acik) { o.envYenile = (o.envYenile || 0) - dt; if (o.envYenile <= 0) { o.envYenile = 0.5; envEkrani.ciz(); } }
  if (gorevEkrani.acik && Math.random() < 0.03) gorevEkrani.ciz();
  if (!document.hidden) sahne.ciz();
}
function haritaAlanYaz(o) {
  const a = o.harita.alan / 1e6, t = `Keşfedilen alan ${a < 10 ? a.toFixed(2).replace('.', ',') : Math.round(a)} km² · ${o.yerler.length} işaret`;
  if ($('#haritaAlan').textContent !== t) $('#haritaAlan').textContent = t;
}
/* Çok oyunculu sunucuda her oyuncu için ayrı bağlam kurulur */
function varlikGuncelle(o, dt, ctx, sunucu) { o.varliklar.guncelle(dt, sunucu ? o.ag.ctxler(ctx) : ctx); }
const ogretici = new Ogretici(ses);
const KANATAN = new Set(['zombi', 'kurt', 'orumcek', 'haydut', 'kopekbaligi', 'bogulmus', 'mumya', 'kulzombi', 'reis', 'muhafiz', 'firavun']);
/* 0.22.0: Eve Dönüş Tılsımı: sağ tık 3 saniye basılı tutulur, kımıldanmaz; doğma noktasına (son kullanılan yatak) ışınlar */
function tilsimBaslat() {
  const o = oyun;
  if (!o || o.tilsim > 0 || o.hayatta.olu) return;
  if (diyarMi(o.oyuncu.konum.x)) { o.hud.bildirim('Tılsım Yeraltı Diyarı’nda çalışmaz.'); return; }
  yatakDenetle(o); if (!o.yatakNoktasi) { o.hud.bildirim('Doğma noktası yok: tılsım yalnızca son kullanılan yatağa ışınlar.'); return; }
  o.tilsim = 3; o.tilsimYer = o.oyuncu.konum.clone(); $('#tilsimHalka').hidden = false;
  o.hud.bildirim('Tılsım ısınıyor… Kımıldamadan sağ tıkı basılı tutunuz.');
}
function tilsimGuncelle(o, dt) {
  if (!(o.tilsim > 0)) return;
  const halka = $('#tilsimHalka');
  if (!fare.sag || o.hayatta.olu || o.oyuncu.konum.distanceTo(o.tilsimYer) > 0.8 || o.envanter.seciliId() !== 493) { o.tilsim = 0; halka.hidden = true; return; }
  o.tilsim -= dt;
  halka.style.setProperty('--o', String(1 - Math.max(0, o.tilsim) / 3));
  if (Math.random() < dt * 12) o.dusenler.renkliParcacik([0.55, 0.85, 1], o.oyuncu.konum.x + (Math.random() - 0.5), o.oyuncu.konum.y + Math.random() * 1.8, o.oyuncu.konum.z + (Math.random() - 0.5), 2);
  if (o.tilsim > 0) return;
  o.tilsim = 0; halka.hidden = true;
  if (o.envanter.aletYipran(1)) { ses.aletKirildi(); o.hud.bildirim('Tılsımın gücü tükendi.'); }
  ses.tilsim(); o.basarimlar.ver('tilsim');
  if (o.tekneler.binilen) o.tekneler.in(o.oyuncu);
  if (o.binek.biniyor) o.binek.in();
  if (o.binek.oturak) o.binek.kalk();
  yatakDenetle(o); const ev = o.yatakNoktasi;   // 0.40.3: yalnızca son kullanılan yatak
  if (!ev) { o.hud.bildirim('Doğma noktası (yatak) bulunamadı.'); return; }
  o.oyuncu.konum.set(ev.x, ev.y, ev.z); o.oyuncu.hiz.set(0, 0, 0); o.oyuncu.dusus = 0;
  o.hazir = false;
  if (kilitli) { bilerekBirak = true; kilitBirak(); }
  ekran('yukleme'); $('#yukleBaslik').textContent = 'Eve dönülüyor'; $('#yukleIpucu').textContent = '';
}
/* Canlı veya ok hasarı (çok oyunculu istemcide sunucudan gelir) */
function yerelHasar(n, turAd, agu, kx, kz) {
  const o = oyun;
  if (!o) return;
  if (n > 0 && o.Z) n = Math.max(1, Math.round(n * o.Z.hasar));   // 0.23.0: zorluk
  o.hayatta.hasar(n, turAd, true);
  if (agu) o.hayatta.agu = 6;
  /* 0.14.0: mumya açlık, buz iskeleti yavaşlık etkisi verir */
  const T = TURLER[turAd];
  if (T && T.etki && !o.hayatta.olu && !o.hayatta.olumsuz) o.hayatta.etkiEkle(T.etki[0], T.etki[1]);
  if (T && T.yakar && !o.hayatta.olu && !o.hayatta.etki('ates')) o.hayatta.yanma = Math.max(o.hayatta.yanma, T.yakar);   // 0.18.0: diyar canavarları tutuşturur
  if (turAd === 'tuzak' && o.basarimlar) o.basarimlar.ver('tuzak');
  /* 0.22.0: pençe, diş ve bıçak yaraları kanatabilir (zırh olasılığı azaltır) */
  const H = o.hayatta;
  if (KANATAN.has(turAd) && n >= 2 && !H.olu && !H.olumsuz && Math.random() < 0.22 * (o.Z ? o.Z.kanama : 1) * (1 - Math.min(0.8, o.envanter.zirhPuani() / 25))) {
    if (!H.etki('kanama')) o.hud.bildirim('Kanamanız var! Bandaj ya da şifa iksiri durdurur.');
    H.etkiEkle('kanama', 40);
  }
  if (n > 0 && Number.isFinite(kx)) o.hud.hasarYonu(kx - o.oyuncu.konum.x, kz - o.oyuncu.konum.z, o.oyuncu.yaw);
  /* 0.43.0: geri itme vuruşun gücüne ve saldıranın iriliğine göre; zırh savrulmayı biraz azaltır */
  if (Number.isFinite(kx) && !o.oyuncu.ucus) {
    const iri = T && (T.boss || T.boy > 2.2) ? 1.35 : 1, guc = Math.min(1.6, (0.7 + 0.08 * n) * iri) * (1 - Math.min(0.3, o.envanter.zirhPuani() / 60));
    o.oyuncu.geriIt(kx, kz, guc);
  }
}
function hataPaneli(o) {
  const p = o.oyuncu.konum, k = o.dunya.uretici.kolon(Math.floor(p.x), Math.floor(p.z), {});
  let yon = (-o.oyuncu.yaw * 180 / Math.PI) % 360; if (yon < 0) yon += 360;
  const h = o.etkilesim.hedef;
  $('#hata').textContent =
`HungerMan ${SURUM}   ${$('#fps').textContent || ''}
XYZ: ${p.x.toFixed(2)} / ${p.y.toFixed(2)} / ${p.z.toFixed(2)}
Parça: ${Math.floor(p.x / PB)}, ${Math.floor(p.z / PB)}   Yüklü parça: ${o.dunya.parcalar.size}
Biyom: ${BIYOMLAR[k.ab ?? k.b]}   Zemin: ${k.h}
Yön: ${yon.toFixed(0)}°   Görüş: ${o.dunya.gorus}
Tohum: ${o.tohum}   Hava: ${HAVA_ADI[o.hava.durum]} (${Math.round(o.hava.yogunluk * 100)}%, ${Math.round(o.hava.sure)} sn)   Deneyim: ${o.hayatta.seviye}. seviye
Bakılan: ${h ? `${BLOKLAR[h.id].ad} (${h.x}, ${h.y}, ${h.z})` : '-'}
Köy: ${o.koyler.icindeki ? o.koyler.icindeki.ad + ' (itibar ' + o.koyler.itibar(o.koyler.icindeki.id) + ')' : '-'}
Düşen eşya: ${o.dusenler.liste.length}   Canlı: ${o.varliklar.liste.length} (düşman ${o.varliklar.liste.filter(v => v.tur.dusman).length}, deniz ${o.varliklar.liste.filter(v => v.tur.su).length})   Tekne: ${o.tekneler.liste.length}`;
}

/* Yatakta uyuma */
function uyu(h, konak = false) {
  const o = oyun;
  if (diyarMi(h.x)) { o.hud.bildirim('Yeraltı Diyarı’nda uyunamaz.'); return; }
  /* 0.39.0: son kullanılan yatak doğma noktası (son kayıt noktası) olur; köyde konaklamada köylünün kapısı */
  o.yatakNoktasi = { x: h.x + 0.5, y: h.y + 1, z: h.z + 0.5, hucreler: konak ? [] : o.etkilesim.yatakHucreleri(h) };
  konsol.kayit('oyuncu', 'Doğma noktası ayarlandı', { alan: { yer: konak ? 'köyde konak' : 'yatak', konum: `${h.x} ${h.y} ${h.z}` } });
  const gece = (o.zaman > 0.52 && o.zaman < 0.97) || o.hava.firtina;
  if (!gece) { o.hud.bildirim('Yalnızca geceleri ve fırtınada uyunabilir. Doğma noktası bu yatak oldu.'); return; }
  if (o.varliklar.yakinDusman(o.oyuncu.konum, 10)) { o.hud.bildirim('Yakında canavarlar varken uyunamaz.'); return; }
  if (o.gok && o.gok.kanliAyMi(o)) { o.hud.bildirim('Kanlı Ay gecesinde gözünüze uyku girmiyor. Sabaha kadar dayanınız!'); return; }
  if (o.uyku > 0) return;
  /* Çok oyunculu: gece, tüm oyuncular yattığında atlanır */
  if (o.ag) {
    if (o.yatakta) return;
    o.yatakta = true; $('#uyku').classList.add('bekle');
    o.hud.bildirim('Yatağa yatıldı. Gece, tüm oyuncular yattığında atlanır. Kalkmak için hareket ediniz.');
    return;
  }
  o.uyku = 2.6; o.uyandi = false;
  $('#uyku').classList.add('acik');
}

/* Yıldırım (tek oyunculu ve sunucu): görüntü, yakındaki canlılara ve oyunculara hasar */
function simsekOlayi(x, y, z) {
  const o = oyun;
  if (!o) return;
  o.hava.simsekGoster(x, y, z, o.oyuncu.konum, ses);
  o.varliklar.yildirim(x, y, z);
  const p = o.oyuncu.konum;
  if (!o.hayatta.olu && (p.x - x) ** 2 + (p.y - y) ** 2 + (p.z - z) ** 2 < 3.5 * 3.5) { o.hayatta.hasar(6, 'yildirim', true); o.hayatta.yanma = Math.max(o.hayatta.yanma, 3); }
  if (o.ag && !o.istemci && o.ag.simsek) o.ag.simsek(x, y, z);
}

/* Boss çubuğu: 40 blok içindeki en yakın canlı boss */
function bossCubugu(o) {
  const p = o.oyuncu.konum;
  let en = null, ed = 40 * 40;
  for (const v of o.varliklar.liste) { if ((!v.tur.boss && !v.bekci) || v.olu) continue; const d = v.konum.distanceToSquared(p); if (d < ed) { ed = d; en = v; } }
  const k = $('#bossCubuk');
  o.bossVar = !!en;
  if (!en) { if (!k.hidden) k.hidden = true; return; }
  if (k.hidden) k.hidden = false;
  if ($('#bossAd').textContent !== en.tur.ad) $('#bossAd').textContent = en.tur.ad;
  const o2 = Math.max(0, en.can / en.tur.can);
  $('#bossCan').style.width = (o2 * 100).toFixed(1) + '%';
  k.classList.toggle('faz2', o2 < 0.5);
}

/* Zindan ve batık gemi sandıkları başarım kazandırır */
function sandikBasarim(x, y, z) {
  const o = oyun; if (!o) return;
  const u = o.dunya.uretici;
  const Y = yapiAt(u, x, y, z);
  if (Y) o.basarimlar.ver(Y.tur);
  else if (zindanAt(u, x, y, z)) o.basarimlar.ver('zindan');
  else if (batikAt(u, x, y, z)) o.basarimlar.ver('batik');
}

/* Menüde arka plan sahnesi çizilmez; yalnız CSS katmanı görünür */
function menuKamera() { /* boş */ }

/* ---------- Çok oyunculu ---------- */
let sunucuIstek = false, sohbetAcik = false, arkaIsci = null;
const esc2 = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* Ağ modüllerinin arayüze erişimi */
function agArayuz() {
  return {
    bildirim: m => { if (oyun) oyun.hud.bildirim(m); },
    sohbet: (ad, m, renk) => sohbetEkle(ad, m, renk),
    liste: () => { if (aktifEkran === 'duraklat') agPanelCiz(); if (!$('#oyuncuListesi').hidden) oyuncuListesiGoster(true); },
    hasar: (n, sebep, kx, kz, agu) => yerelHasar(n, sebep, agu, kx, kz),
    koptu: (sebep, kesin) => agKoptu(sebep, kesin),
    uykuBaslat: () => { const o = oyun; if (!o) return; o.yatakta = false; $('#uyku').classList.remove('bekle'); o.uyku = 2.6; o.uyandi = false; $('#uyku').classList.add('acik'); },
    sandikAc: (k, yuvalar) => {
      const o = oyun;
      if (!o || o.hayatta.olu || panelAcik() || envEkrani.acik) { if (o && o.ag) o.ag.sandikKapat(k, yuvalar); return; }
      const [x, y, z] = String(k).split(',').map(Number);
      envanterAcKapa(null, { yuvalar, k, kural: kapFiltresiId(o.dunya.blok(x, y, z)), blok: o.dunya.blok(x, y, z) });
      sandikBasarim(x, y, z);
    },
    sandikKapat: k => { if (envEkrani.acik && envEkrani.sandik && (k == null || envEkrani.sandik.k === k)) { envanterKapat(aktifEkran === 'oyun'); if (oyun) oyun.hud.bildirim('Sandık kırıldı.'); } }
  };
}

/* Açık dünyayı diğer oyunculara aç (sunucu ol) */
async function agAc() {
  const o = oyun;
  if (!o || o.ag || o.agAciliyor) return;
  o.agAciliyor = true;
  $('#agAc').disabled = true; $('#agAc').textContent = 'Katılım kodu alınıyor…';
  o.hud.bildirim('Dünya ağa açılıyor…');
  const s = new SunucuOyun({ oyun: o, sahne, ses, ad: ayar.ad, arayuz: agArayuz() });
  try {
    const kod = await s.baslat();
    if (oyun !== o) { s.kapat(); return; }
    o.ag = s;
    /* Boss efektleri istemcilere de iletilir */
    o.varliklar.efektYay = e => { if (o.ag === s) s.yay({ t: 'ef', e }); };
    o.hud.bildirim(`Dünya diğer oyunculara açıldı. Katılım kodu: ${kod}`);
    sohbetEkle(null, `Katılım kodu: ${kod} · Kod duraklatma menüsünde ve Tab tuşuyla görülür.`);
    arkaPlanAyarla();
  } catch (e) {
    s.kapat();
    if (oyun === o) o.hud.bildirim(e.message || 'Dünya ağa açılamadı.');
  } finally {
    o.agAciliyor = false;
    $('#agAc').disabled = false; $('#agAc').textContent = 'Dünyayı Arkadaşlara Aç';
    if (aktifEkran === 'duraklat') agPanelCiz();
  }
}

function oyuncuSatirlari(ag) {
  return ag.oyuncuListesi().map(([id, ad, renk, sunucu]) => `<span class="agOy"><i style="background:${RENKLER[renk % RENKLER.length]}"></i>${esc2(ad)}${sunucu ? ' <small>sunucu</small>' : ''}${id === ag.benimId ? ' <small>siz</small>' : ''}</span>`).join('');
}
function agPanelCiz() {
  const o = oyun, ag = o && o.ag;
  $('#agAc').hidden = !o || !!ag || o.istemci;
  $('#agPanel').hidden = !ag;
  $('#kaydetCik').textContent = !ag ? 'Kaydet ve Ana Menüye Dön' : o.istemci ? 'Bağlantıyı Kes ve Ana Menüye Dön' : 'Sunucuyu Kapat ve Ana Menüye Dön';
  if (!ag) return;
  $('#agKod').textContent = ag.kod || '';
  $('#agKodSatir').hidden = !ag.kod;
  $('#agOyuncular').innerHTML = oyuncuSatirlari(ag) + (o.istemci ? '' : ag.oyuncuListesi().filter(a => !a[3]).map(a => `<button type="button" class="dugme kucuk tehlike" data-at="${esc2(a[1])}">${esc2(a[1])} adlı oyuncuyu çıkar</button>`).join(''));
}
function oyuncuListesiGoster(goster) {
  const el = $('#oyuncuListesi');
  const ag = oyun && oyun.ag;
  if (!goster || !ag) { el.hidden = true; return; }
  const l = ag.oyuncuListesi();
  el.innerHTML = `<header><b>Oyuncular · ${l.length}</b>${ag.kod ? `<span>Kod: <b>${esc2(ag.kod)}</b></span>` : ''}</header><div>${oyuncuSatirlari(ag)}</div>`;
  el.hidden = false;
}

/* Sohbet: T veya Enter ile açılır */
function sohbetAc() {
  if (!oyun || !oyun.ag || sohbetAcik || panelAcik()) return;
  sohbetAcik = true;
  for (const k in tus) tus[k] = false;
  fare.sol = fare.sag = false;
  if (kilitli) { bilerekBirak = true; kilitBirak(); }
  const g = $('#sohbetGiris');
  g.hidden = false; g.value = '';
  $('#sohbet').classList.add('acik');
  setTimeout(() => g.focus(), 0);
  tiklaGuncelle();
}
function sohbetKapat(kilitlensin) {
  sohbetAcik = false;
  const g = $('#sohbetGiris');
  g.hidden = true; g.blur();
  $('#sohbet').classList.remove('acik');
  if (kilitlensin) kilitle();
  tiklaGuncelle();
}
$('#sohbetGiris').addEventListener('keydown', e => {
  e.stopPropagation();
  if (e.key === 'Enter') {
    const m = e.target.value.trim().slice(0, 200);
    if (m && oyun && oyun.ag) { if (m.startsWith('/')) sohbetKomutu(m); else oyun.ag.sohbetGonder(m); }
    sohbetKapat(true);
  } else if (e.key === 'Escape') { e.preventDefault(); sohbetKapat(true); }
});
/* 0.23.0: sohbet komutları */
function sohbetKomutu(m) {
  const ag = oyun.ag, [k, ...p] = m.slice(1).split(/\s+/), kk = (k || '').toLocaleLowerCase('tr'), P = oyun.oyuncu.konum;
  if (kk === 'yardim' || kk === 'yardım' || kk === '?') sohbetEkle(null, 'Komutlar: /f <ad> <mesaj> (özel mesaj) · /oyuncular · /konum (konumunu paylaş) · /ben <eylem> · /zar' + (oyun.istemci ? '' : ' · /at <ad> (oyuncuyu çıkar)'));
  else if (kk === 'f' || kk === 'fisilda' || kk === 'fısılda') { if (p.length < 2) sohbetEkle(null, 'Kullanım: /f <ad> <mesaj>'); else ag.fisilda(p[0], p.slice(1).join(' ')); }
  else if (kk === 'oyuncular') sohbetEkle(null, 'Oyuncular: ' + ag.oyuncuListesi().map(a => a[1] + (a[3] ? ' (sunucu)' : '')).join(', '));
  else if (kk === 'konum') ag.sohbetGonder(`Konumum: X ${Math.round(P.x)} · Y ${Math.round(P.y)} · Z ${Math.round(P.z)}`);
  else if (kk === 'ben') { if (p.length) ag.sohbetGonder('* ' + p.join(' ')); }
  else if (kk === 'zar') ag.sohbetGonder(`zar attı: ${1 + Math.floor(Math.random() * 100)} (1-100)`);
  else if (kk === 'at') { if (oyun.istemci) sohbetEkle(null, 'Oyuncuları yalnızca sunucu çıkarabilir.'); else if (!p[0]) sohbetEkle(null, 'Kullanım: /at <ad>'); else sohbetEkle(null, ag.at(p.join(' ')) ? `${p.join(' ')} oyundan çıkarıldı.` : 'Oyuncu bulunamadı.'); }
  else sohbetEkle(null, 'Bilinmeyen komut. /yardim yazınız.');
}
function sohbetEkle(ad, m, renk) {
  konsol.kayit('ag', ad ? 'Sohbet mesajı' : m, { alan: ad ? { oyuncu: ad, mesaj: m } : {} });   // 0.40.5
  const l = $('#sohbetListe');
  const d = document.createElement('div');
  d.className = ad ? 'sMesaj' : 'sMesaj sistem';
  d.innerHTML = ad ? `<b style="color:${RENKLER[(renk || 0) % RENKLER.length]}">${esc2(ad)}</b> ${esc2(m)}` : esc2(m);
  l.appendChild(d);
  while (l.children.length > 40) l.firstChild.remove();
  setTimeout(() => d.classList.add('eski'), 10000);
  if (ad) ses.tik();
}

function yataktanKalk() { if (!oyun) return; oyun.yatakta = false; $('#uyku').classList.remove('bekle'); }

/* Bağlantı koptu: oyuncu bilgilendirilip ana menüye dönülür */
/* 0.23.0: bağlantı beklenmedik biçimde koparsa 5 saniye sonra kendiliğinden yeniden bağlanılır (en çok 3 deneme) */
let sonKod = '', baglanDeneme = 0, baglanZaman = 0;
function agKoptu(sebep, kesin = false) {
  if (!oyun) return;
  const istemci = !!oyun.istemci;
  oyunBitir();
  $('#bilgiBaslik').textContent = 'Bağlantı Kesildi';
  $('#bilgiMetin').textContent = sebep;
  const tekrar = istemci && !kesin && sonKod && baglanDeneme < 3;
  $('#yenidenBaglan').hidden = !(istemci && sonKod && !kesin);
  ekran('bilgi');
  clearTimeout(baglanZaman);
  if (tekrar) { $('#bilgiMetin').textContent = `${sebep} 5 saniye içinde yeniden bağlanılacak (deneme ${baglanDeneme + 1}/3).`; baglanZaman = setTimeout(() => { if (aktifEkran === 'bilgi') $('#yenidenBaglan').click(); }, 5000); }
}
document.addEventListener('click', e => { const b = e.target.closest('[data-at]'); if (!b || !oyun || !oyun.ag || oyun.istemci) return; ses.tik(); oyun.ag.at(b.dataset.at); setTimeout(agPanelCiz, 600); });
$('#yenidenBaglan').onclick = () => { clearTimeout(baglanZaman); baglanDeneme++; ekran('cok'); $('#cokKod').value = sonKod; $('#cokKatil').click(); };

/* Sekme arka plandayken tarayıcı çizim döngüsünü durdurur; çok oyunculuda dünya bir işçi saatiyle sürdürülür */
function arkaPlanAyarla() {
  const gerek = document.hidden && oyun && oyun.ag;
  if (gerek && !arkaIsci) {
    try {
      arkaIsci = new Worker(URL.createObjectURL(new Blob(['setInterval(() => postMessage(0), 50);'], { type: 'text/javascript' })));
      arkaIsci.onmessage = () => { if (document.hidden && oyun && oyun.ag) adim(performance.now()); };
    } catch (e) { arkaIsci = null; }
  } else if (!gerek && arkaIsci) { arkaIsci.terminate(); arkaIsci = null; onceki = performance.now(); }
}
document.addEventListener('visibilitychange', arkaPlanAyarla);

/* Çok Oyunculu ekranı */
function cokDurum(m) { const el = $('#cokDurum'); el.textContent = m; el.hidden = !m; }
function adAl() {
  const ad = $('#cokAd').value.replace(/\s+/g, ' ').trim().slice(0, 16);
  if (ad) { ayar.ad = ad; ayarlariKaydet(ayar); }
  return ad;
}
$('#cokSunucu').onclick = () => {
  ses.baslat(); ses.tik();
  if (!adAl()) { cokDurum('Oyuncu adı giriniz.'); return; }
  sunucuIstek = true;
  ekran('dunyalar');
};
$('#cokKod').addEventListener('keydown', e => { if (e.key === 'Enter') $('#cokKatil').click(); });
$('#cokKod').addEventListener('input', e => { const v = kodDuzelt(e.target.value).slice(0, 6); if (v !== e.target.value) e.target.value = v; });
$('#cokKatil').onclick = async () => {
  ses.baslat(); ses.tik();
  const ad = adAl();
  if (!ad) { cokDurum('Oyuncu adı giriniz.'); return; }
  const kod = kodDuzelt($('#cokKod').value);
  if (kod.length !== 6) { cokDurum('Katılım kodu 6 karakterden oluşur.'); return; }
  if (oyun) oyunBitir();
  ekran('yukleme');
  $('#yukleBaslik').textContent = 'Sunucuya bağlanılıyor';
  $('#yukleCubuk').style.width = '0%';
  $('#yukleIpucu').textContent = `Katılım kodu: ${kod}`;
  let k;
  try { k = await katil(kod); } catch (e) { ekran('cok'); cokDurum(e.message); return; }
  if (aktifEkran !== 'yukleme' || oyun) { k.kapat(); return; }
  $('#yukleBaslik').textContent = 'Dünya bilgileri alınıyor';
  const zaman = setTimeout(() => { k.kapandi = null; k.kapat(); if (!oyun) { ekran('cok'); cokDurum('Sunucu yanıt vermedi.'); } }, 30000);
  k.mesaj = m => {
    if (m.t === 'ret') { clearTimeout(zaman); k.kapandi = null; k.kapat(); ekran('cok'); cokDurum(m.s); }
    else if (m.t === 'hg') { clearTimeout(zaman); istemciBaslat(k, m, kod); }
  };
  k.kapandi = () => { clearTimeout(zaman); if (!oyun) { ekran('cok'); cokDurum('Bağlantı kesildi.'); } };
  k.gonder({ t: 'merhaba', ad, surum: SURUM });
};
function istemciBaslat(k, m, kod) {
  sonKod = kod; baglanDeneme = 0;
  const r = m.kayit || {};
  oyunBaslat({ id: 'ag', ad: m.ad, tohum: m.tohum, uretici: m.uretici || 1, zaman: m.zaman, gun: m.gun, degisiklikler: m.degisiklikler, kablolar: m.kablolar, dogum: r.dogum || m.dogum, yatakNoktasi: r.yatakNoktasi || null,
    oyuncu: r.oyuncu || null, envanter: r.envanter, hayatta: r.hayatta, gorevler: r.gorevler, koyler: r.koyler, basarimlar: r.basarimlar, olumNoktasi: r.olumNoktasi, hayatBasi: r.hayatBasi, istemci: true,
    yerler: r.yerler, komutlar: !!m.komutlar, konsol: m.konsol !== 0, vucutIsisi: m.vucutIsisi !== 0, zorluk: m.zorluk, denge: m.denge, haritaKimlik: `ag:${m.tohum}:${ayar.ad.toLocaleLowerCase('tr')}` });
  if (!r.oyuncu) oyun.oyuncu.konum.set(m.dogum.x, m.dogum.y, m.dogum.z);
  const ist = new IstemciOyun({ kanal: k, id: m.id, kod, oyun, sahne, ses, ad: ayar.ad, arayuz: agArayuz() });
  /* 0.42.0: açık sandık ve imleçteki eşya kayda girer */
  ist.acikSandik = () => (envEkrani.acik && oyun && envEkrani.envanter === oyun.envanter ? envEkrani.sandik : null);
  ist.envanterDisa = () => envanterKaydi(oyun);
  oyun.ag = ist;
  ist.ilkVeri(m);
  sohbetEkle(null, `${m.ad} dünyasına katılındı. Sohbet için T, oyuncu listesi için Tab tuşu kullanılır.`);
  arkaPlanAyarla();
}
$('#bilgiTamam').onclick = () => { ses.tik(); clearTimeout(baglanZaman); ekran('ana'); };

requestAnimationFrame(dongu);
ekran('ana');
/* Konsoldan inceleme için (oyun mantığını değiştirmez) */
window.HungerMan = { get oyun() { return oyun; }, get ekran() { return aktifEkran; }, get kilitli() { return kilitli; }, sahne, ayar, tus, fare, kilitAyarla: v => { kilitli = v; tiklaGuncelle(); }, agAc, sohbetEkle, envEkrani, duraklat, haritaEkrani, miniHarita, konsol, gelPencere, basarimEkrani, tarifKitabi, ses, muzik, dokun };
export { ESYALAR };
