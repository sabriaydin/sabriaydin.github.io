/* HungerMan - giriş noktası: menüler, oyun döngüsü, girdi, kayıt */
import { SURUM, GUN_SURESI, PB } from './sabitler.js';
import { Sahne, THREE } from './grafik/sahne.js';
import { Dunya } from './dunya/dunya.js';
import { BIYOMLAR } from './dunya/uretici.js';
import { BLOKLAR, ESYALAR } from './bloklar.js';
import { metinTohum } from './rastgele.js';
import { Oyuncu } from './oyun/oyuncu.js';
import { Envanter } from './oyun/envanter.js';
import { Hayatta, OLUM_SEBEBI } from './oyun/hayatta.js';
import { Dusenler } from './oyun/dusenler.js';
import { Etkilesim } from './oyun/etkilesim.js';
import { Varliklar } from './varlik/varliklar.js';
import { ISTASYON_BLOK } from './oyun/uretim.js';
import { Hud } from './arayuz/hud.js';
import { EnvanterEkrani } from './arayuz/envanter-ekrani.js';
import { Ses } from './sistem/ses.js';
import { Kayit, ayarlariYukle, ayarlariKaydet } from './sistem/kayit.js';

const $ = s => document.querySelector(s);
const tuval = $('#oyun');

/* Hata kutusu: beklenmeyen hatalar ekranda görünür */
function hataGoster(m) { const k = $('#hataKutusu'); k.textContent = 'Hata: ' + m; k.hidden = false; setTimeout(() => (k.hidden = true), 12000); }
addEventListener('error', e => hataGoster(e.message));
addEventListener('unhandledrejection', e => hataGoster(String(e.reason && e.reason.message || e.reason)));

$('#surum').textContent = 'Sürüm ' + SURUM;
const ayar = ayarlariYukle();
const ses = new Ses(); ses.duzeyAyarla(ayar.ses);
let sahne;
try { sahne = new Sahne(tuval); } catch (e) { hataGoster('WebGL başlatılamadı. Tarayıcınız veya ekran kartı sürücünüz WebGL desteklemiyor olabilir.'); throw e; }
sahne.kamera.fov = ayar.fov; sahne.kamera.updateProjectionMatrix();

/* ---------- Ekran yönetimi ---------- */
const EKRANLAR = { ana: '#anaMenu', dunyalar: '#dunyalarEkrani', yeni: '#yeniEkrani', ayarlar: '#ayarlarEkrani', yardim: '#yardimEkrani', duraklat: '#duraklatEkrani', olum: '#olumEkrani', yukleme: '#yuklemeEkrani' };
let aktifEkran = 'ana', oncekiEkran = 'ana';
function ekran(ad) {
  if (ad === 'ayarlar' || ad === 'yardim') oncekiEkran = aktifEkran;
  for (const [k, s] of Object.entries(EKRANLAR)) $(s).hidden = k !== ad;
  if (ad === 'ayarlar' || ad === 'yardim') { const el = $(EKRANLAR[ad]); el.classList.toggle('menuArka', !oyun); el.classList.toggle('yari', !!oyun); }
  aktifEkran = ad;
  if (ad === 'dunyalar') dunyaListesi();
  if (ad === 'ayarlar') ayarFormu();
  if (ad === 'yeni') { $('#yeniTohum').value = ''; setTimeout(() => $('#yeniAd').select(), 30); }
  tiklaGuncelle();
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-git]');
  if (!b) return;
  ses.baslat(); ses.tik();
  ekran(b.dataset.git);
});
$('#ayarTamam').onclick = () => { ses.tik(); ekran(oncekiEkran); };
$('#yardimTamam').onclick = () => { ses.tik(); ekran(oncekiEkran); };

/* ---------- Ayarlar ---------- */
function ayarFormu() {
  const bag = (id, anahtar, bicim, tur = 'range') => {
    const el = $(id), d = $(id + 'D');
    if (tur === 'range') { el.value = ayar[anahtar]; if (d) d.textContent = bicim(ayar[anahtar]); el.oninput = () => { ayar[anahtar] = +el.value; if (d) d.textContent = bicim(+el.value); ayarUygula(); }; }
    else { el.checked = !!ayar[anahtar]; el.onchange = () => { ayar[anahtar] = el.checked; ayarUygula(); }; }
  };
  bag('#aGorus', 'gorus', v => v + ' parça');
  bag('#aFov', 'fov', v => v + '°');
  bag('#aHas', 'hassasiyet', v => v.toFixed(2) + '×');
  bag('#aSes', 'ses', v => Math.round(v * 100) + '%');
  bag('#aTers', 'tersY', null, 'cb'); bag('#aSal', 'sallanma', null, 'cb'); bag('#aFps', 'fps', null, 'cb');
}
function ayarUygula() {
  ayarlariKaydet(ayar);
  sahne.kamera.fov = ayar.fov; sahne.kamera.updateProjectionMatrix();
  ses.duzeyAyarla(ayar.ses);
  if (oyun && oyun.dunya.gorus !== ayar.gorus) oyun.dunya.gorusAyarla(ayar.gorus);
  $('#fps').hidden = !ayar.fps;
}

/* ---------- Dünya listesi ---------- */
const tarih = t => new Date(t).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
async function dunyaListesi() {
  const kap = $('#dunyaListe');
  let l = [];
  try { l = await Kayit.listele(); } catch (e) { kap.innerHTML = '<div class="bos">Tarayıcı depolaması kullanılamıyor; dünyalar kaydedilemez.</div>'; return; }
  if (!l.length) { kap.innerHTML = '<div class="bos">Henüz kayıtlı dünya mevcut değil. Yeni bir dünya oluşturun.</div>'; return; }
  kap.innerHTML = l.map(d => `<div class="dunya"><b>${esc(d.ad)}</b><small>${d.gun}. gün · Son oynama ${tarih(d.son)} · Tohum ${d.tohum}</small>
    <div class="islem"><button class="dugme kucuk ana" data-oyna="${d.id}">Oyna</button><button class="dugme kucuk tehlike" data-sil="${d.id}">Sil</button></div></div>`).join('');
}
$('#dunyaListe').addEventListener('click', async e => {
  const o = e.target.closest('[data-oyna]'), s = e.target.closest('[data-sil]');
  ses.baslat();
  if (o) { ses.tik(); const v = await Kayit.yukle(o.dataset.oyna); if (v) oyunBaslat(v); }
  if (s) {
    if (s.dataset.onay) { await Kayit.sil(s.dataset.sil); ses.tik(); dunyaListesi(); }
    else { s.dataset.onay = '1'; s.textContent = 'Onayla'; setTimeout(() => { if (s.isConnected) { delete s.dataset.onay; s.textContent = 'Sil'; } }, 3000); }
  }
});
$('#yeniOlustur').onclick = () => {
  ses.baslat(); ses.tik();
  const ad = $('#yeniAd').value.trim() || 'Yeni Dünya';
  const t = $('#yeniTohum').value.trim();
  const tohum = t ? metinTohum(t) : (Math.random() * 4294967296) >>> 0;
  oyunBaslat({ id: 'd' + Date.now().toString(36), ad, tohum, olusturma: Date.now(), yeni: true });
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
    if (['Space', 'Tab', 'F3', 'KeyQ'].includes(e.code) || (e.ctrlKey && ['KeyS', 'KeyD', 'KeyF'].includes(e.code))) e.preventDefault();
    if (e.repeat) { tus[e.code] = true; return; }
    tus[e.code] = true;
    if (e.code === 'KeyW') { const t = performance.now(); if (t - sonW < 280) kosKilit = true; sonW = t; }
    if (e.code === 'KeyE') { envanterAcKapa(); return; }
    if (e.code === 'Escape' && envEkrani.acik) { envanterKapat(false); return; }
    if (!kilitli) return;
    if (e.code.startsWith('Digit')) { const n = +e.code.slice(5); if (n >= 1 && n <= 9) seciliAyarla(n - 1); }
    if (e.code === 'KeyQ') oyun.etkilesim.at(e.shiftKey);
    if (e.code === 'F3') $('#hata').hidden = !$('#hata').hidden;
  }
});
addEventListener('keyup', e => { tus[e.code] = false; if (e.code === 'KeyW') kosKilit = false; });
addEventListener('blur', () => { for (const k in tus) tus[k] = false; fare.sol = fare.sag = false; });
tuval.addEventListener('mousedown', e => {
  ses.baslat();
  if (!oyun || aktifEkran !== 'oyun') return;
  if (!kilitli) { kilitle(); return; }
  if (e.button === 0) fare.sol = true;
  if (e.button === 2) fare.sag = true;
});
addEventListener('mouseup', e => { if (e.button === 0) fare.sol = false; if (e.button === 2) fare.sag = false; });
tuval.addEventListener('contextmenu', e => e.preventDefault());
addEventListener('wheel', e => {
  if (!oyun || !kilitli) return;
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
function kilitle() {
  try { const p = tuval.requestPointerLock(); if (p && p.catch) p.catch(() => tiklaGuncelle()); } catch (e) { /* tarayıcı reddetti */ }
}
document.addEventListener('pointerlockchange', () => {
  kilitli = document.pointerLockElement === tuval;
  if (!kilitli) {
    fare.sol = fare.sag = false;
    if (oyun && aktifEkran === 'oyun' && !bilerekBirak && !envEkrani.acik && !oyun.hayatta.olu) duraklat();
  }
  bilerekBirak = false;
  tiklaGuncelle();
});
function tiklaGuncelle() { $('#tikla').hidden = !(oyun && aktifEkran === 'oyun' && !kilitli && !envEkrani.acik); }
function seciliAyarla(n) { oyun.envanter.secili = n; oyun.hud.cubukCiz(); oyun.hud.esyaAdiGoster(); ses.tik(); }

/* ---------- Envanter ekranı ---------- */
const envEkrani = new EnvanterEkrani({
  ses,
  istasyonlar: () => yakinIstasyonlar(),
  birak: (id, adet, dayanim) => { if (!oyun) return; const o = oyun.oyuncu, y = o.bakisYonu(), g = o.gozKonumu(); oyun.dusenler.birak(id, adet, g.x + y.x * 0.6, g.y - 0.3, g.z + y.z * 0.6, y.x * 4, 2, y.z * 4, dayanim, 1.5); }
});
envEkrani.kapatIste = () => envanterKapat(true);
function envanterAcKapa(istasyon) {
  if (!oyun || oyun.hayatta.olu) return;
  if (envEkrani.acik) envanterKapat(true);
  else { if (kilitli) { bilerekBirak = true; document.exitPointerLock(); } envEkrani.ac(istasyon); ses.ac(); tiklaGuncelle(); }
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
  for (let y = -2; y <= 3; y++) for (let z = -4; z <= 4; z++) for (let x = -4; x <= 4; x++) {
    const b = oyun.dunya.blok(x0 + x, y0 + y, z0 + z);
    for (const [k, id] of Object.entries(ISTASYON_BLOK)) if (b === id) s.add(k);
  }
  return s;
}

/* ---------- Duraklatma ---------- */
function duraklat() { if (!oyun) return; ekran('duraklat'); oyunKaydet(); }
$('#devamEt').onclick = () => { ses.tik(); ekran('oyun'); kilitle(); };
$('#kaydetCik').onclick = async () => { ses.tik(); await oyunKaydet(); oyunBitir(); ekran('ana'); };

/* ---------- Oyun ---------- */
let oyun = null;

function oyunBaslat(v) {
  if (oyun) oyunBitir();
  ekran('yukleme');
  $('#yukleBaslik').textContent = v.yeni ? 'Dünya oluşturuluyor' : 'Dünya yükleniyor';
  $('#yukleCubuk').style.width = '0%';
  const ipuclari = ['İlk gece gelmeden bir sığınak yapmak akıllıca olur.', 'Üretim masası birçok tarifin kilidini açar.', 'Elmas, derin mağaralarda bulunur.', 'Böğürtlen çalıları zamanla yeniden meyve verir.', 'Fırın yanında kütük yakarak kömür elde edilir.', 'Meşaleler karanlık mağaraları aydınlatır.', 'Zombiler meşale ve kamp ateşi çevresinde doğmaz.', 'Yatakta uyumak geceyi atlatır ve doğma noktasını belirler.', 'Çiğ et kamp ateşinde pişirilince çok daha doyurucu olur.', 'Düşerken yapılan vuruş kritik hasar verir.'];
  $('#yukleIpucu').textContent = ipuclari[Math.floor(Math.random() * ipuclari.length)];

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
  if (v.oyuncu) { oyuncu.konum.set(v.oyuncu.x, v.oyuncu.y, v.oyuncu.z); oyuncu.yaw = v.oyuncu.yaw || 0; oyuncu.pitch = v.oyuncu.pitch || 0; }
  else oyuncu.konum.set(dogum.x, dogum.y, dogum.z);
  envanter.iceAktar(v.envanter);
  hayatta.iceAktar(v.hayatta);
  oyun = { id: v.id, ad: v.ad, tohum: v.tohum, olusturma: v.olusturma || Date.now(), dunya, oyuncu, envanter, hayatta, dusenler, hud,
    zaman: v.zaman ?? 0.02, gun: v.gun || 1, dogum, sure: 0, kayitSayac: 0, tikSayac: 0, isikSayac: 0, isik: 1, hazir: false, yeniDogum: !v.oyuncu };
  const varliklar = new Varliklar({ sahne, dunya, dusenler, ses, uretici: dunya.uretici });
  oyun.varliklar = varliklar; oyun.gunIsigi = 1; oyun.uyku = 0;
  oyun.etkilesim = new Etkilesim({ dunya, oyuncu, envanter, hayatta, dusenler, ses, sahne, varliklar, arayuz: { bildirim: (m, id) => hud.bildirim(m, id), envanterAc: ist => envanterAcKapa(ist), uyu: h => uyu(h) } });
  hayatta.zirhFn = () => envanter.zirhPuani();
  hayatta.zirhYipran = () => { if (envanter.zirhYipran(1)) { ses.aletKirildi(); hud.bildirim('Bir zırh parçanız kırıldı.'); } };
  dusenler.iceAktar(v.dusenler);
  envanter.degisti = () => { hud.cubukCiz(); if (envEkrani.acik) envEkrani.ciz(); };
  hud.cubukCiz(); hud.durumCiz(false);
  oyuncu.olaylar.dustu = d => { if (!oyuncu.suda) hayatta.hasar(Math.floor(d - 3), 'dusme'); };
  oyuncu.olaylar.adim = id => ses.adim(BLOKLAR[id] ? BLOKLAR[id].ses : 'tas');
  oyuncu.olaylar.ziplad = () => { hayatta.yor(oyuncu.kosuyor ? 0.2 : 0.05); };
  oyuncu.olaylar.suyaGirdi = h => ses.sicrama(Math.min(1.5, h / 8));
  hayatta.olaylar.hasar = () => { ses.hasar(); hud.hasarParla(); };
  hayatta.olaylar.olum = sebep => olum(sebep);
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
    /* Doğum noktasını boş bir yere ayarla */
    let g = 0;
    while (o.oyuncu.carpisiyor(p.x, p.y, p.z) && g++ < 200) p.y += 1;
    if (o.yeniDogum) { o.dogum = { x: p.x, y: p.y, z: p.z }; o.yeniDogum = false; }
    o.hazir = true;
    $('#hud').hidden = false;
    ekran('oyun');
    if (o.hayatta.olu) olum('');
    else { kilitle(); }
    if (!o.ilkBildirim) { o.ilkBildirim = true; o.hud.bildirim(`${o.ad} · ${BIYOMLAR[o.dunya.uretici.kolon(Math.floor(p.x), Math.floor(p.z)).b]}`); }
  }
}

function olum(sebep) {
  const o = oyun;
  if (kilitli) { bilerekBirak = true; document.exitPointerLock(); }
  if (envEkrani.acik) envEkrani.kapat();
  const p = o.oyuncu.konum;
  for (const s of o.envanter.tumEsyalar()) o.dusenler.birak(s.id, s.adet, p.x, p.y + 1, p.z, (Math.random() - 0.5) * 4, 3 + Math.random() * 2, (Math.random() - 0.5) * 4, s.dayanim, 2);
  o.envanter.temizle();
  $('#olumSebep').textContent = OLUM_SEBEBI[sebep] || 'Hayatınızı kaybettiniz.';
  ekran('olum');
  oyunKaydet();
}
$('#yenidenDog').onclick = () => {
  const o = oyun; ses.tik();
  o.hayatta.sifirla();
  o.oyuncu.konum.set(o.dogum.x, o.dogum.y, o.dogum.z); o.oyuncu.hiz.set(0, 0, 0); o.oyuncu.dusus = 0;
  o.hazir = false;
  ekran('yukleme'); $('#yukleBaslik').textContent = 'Yeniden doğuluyor';
};
$('#olumCik').onclick = async () => { ses.tik(); oyun.hayatta.sifirla(); oyun.oyuncu.konum.set(oyun.dogum.x, oyun.dogum.y, oyun.dogum.z); await oyunKaydet(); oyunBitir(); ekran('ana'); };

async function oyunKaydet() {
  const o = oyun;
  if (!o || !o.hazir && !o.hayatta.olu) return;
  const p = o.oyuncu.konum;
  const veri = {
    id: o.id, ad: o.ad, tohum: o.tohum, olusturma: o.olusturma, son: Date.now(), surum: SURUM,
    oyuncu: { x: +p.x.toFixed(3), y: +p.y.toFixed(3), z: +p.z.toFixed(3), yaw: o.oyuncu.yaw, pitch: o.oyuncu.pitch },
    hayatta: o.hayatta.disaAktar(), envanter: o.envanter.disaAktar(), zaman: o.zaman, gun: o.gun, dogum: o.dogum,
    degisiklikler: o.dunya.degisiklikleriAl(), dusenler: o.dusenler.disaAktar()
  };
  try { await Kayit.kaydet(veri); } catch (e) { o.hud.bildirim('Kayıt yapılamadı: tarayıcı depolaması kapalı olabilir.'); }
}
addEventListener('beforeunload', () => { if (oyun && oyun.hazir) oyunKaydet(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && oyun && oyun.hazir) oyunKaydet(); });

function oyunBitir() {
  if (!oyun) return;
  if (envEkrani.acik) envEkrani.kapat();
  oyun.dusenler.temizle();
  oyun.varliklar.temizle();
  sahne.sahne.remove(oyun.dusenler.grup); sahne.sahne.remove(oyun.dusenler.noktalar);
  oyun.dunya.yoket();
  sahne.secimGoster(null);
  oyun = null;
  $('#hud').hidden = true;
  if (document.pointerLockElement) { bilerekBirak = true; document.exitPointerLock(); }
}

/* ---------- Döngü ---------- */
let onceki = performance.now(), fpsSayac = 0, fpsZaman = 0;
const gecici = new THREE.Vector3();
function dongu(t) {
  requestAnimationFrame(dongu);
  let dt = (t - onceki) / 1000; onceki = t;
  if (dt > 0.05) dt = 0.05;
  fpsSayac++; fpsZaman += dt;
  if (fpsZaman >= 0.5) { $('#fps').textContent = Math.round(fpsSayac / fpsZaman) + ' FPS'; fpsSayac = 0; fpsZaman = 0; }
  const o = oyun;
  if (!o) { menuKamera(dt); return; }
  if (!o.hazir) { yuklemeKontrol(); sahne.ciz(); return; }
  const calisiyor = aktifEkran === 'oyun';
  const p = o.oyuncu.konum;
  o.dunya.guncelle(p.x, p.z);
  if (calisiyor) {
    o.sure += dt;
    const oncekiZaman = o.zaman;
    o.zaman += dt / GUN_SURESI;
    if (o.zaman >= 1) { o.zaman -= 1; o.gun++; o.hud.bildirim(`${o.gun}. gün başladı`); }
    if (oncekiZaman < 0.46 && o.zaman >= 0.46) o.hud.bildirim('Akşam oluyor. Gece zombiler ortaya çıkar.');
    /* Uyku: ekran kararır, sabah olur */
    if (o.uyku > 0) {
      o.uyku -= dt;
      if (!o.uyandi && o.uyku < 1.3) { o.uyandi = true; o.zaman = 0.0; o.gun++; $('#uyku').classList.remove('acik'); o.hud.bildirim(`${o.gun}. gün başladı. Doğma noktası yatağa ayarlandı.`); }
    }
    const g = kilitli && o.uyku <= 0 ? {
      ileri: tus.KeyW, geri: tus.KeyS, sol: tus.KeyA, sag: tus.KeyD, zipla: tus.Space,
      kos: tus.ShiftLeft || tus.ShiftRight || kosKilit, egil: tus.KeyC, kosabilir: o.hayatta.aclik > 6
    } : { kosabilir: false };
    const mesafe = o.oyuncu.guncelle(dt, g) || 0;
    o.hayatta.yor(mesafe * (o.oyuncu.kosuyor ? 0.1 : 0.01));
    o.hayatta.guncelle(dt, o.oyuncu.basSuda);
    if (kilitli && !o.hayatta.olu && o.uyku <= 0) o.etkilesim.guncelle(dt, { sol: fare.sol, sag: fare.sag, egil: tus.KeyC });
    else { o.etkilesim.ilerleme = 0; sahne.secimGoster(o.etkilesim.isin(o.oyuncu.gozKonumu(), o.oyuncu.bakisYonu())); }
    o.varliklar.guncelle(dt, {
      oyuncu: o.oyuncu, oyuncuOlu: o.hayatta.olu, gunIsigi: o.gunIsigi, gunSayisi: o.gun, isik: o.isik,
      oyuncuyaVur: (n, v) => {
        o.hayatta.hasar(n, v.turAd, true);
        const dx = o.oyuncu.konum.x - v.konum.x, dz = o.oyuncu.konum.z - v.konum.z, l = Math.hypot(dx, dz) || 1;
        o.oyuncu.hiz.x += dx / l * 7; o.oyuncu.hiz.z += dz / l * 7; o.oyuncu.hiz.y = Math.max(o.oyuncu.hiz.y, 4.5);
      },
      okTopla: () => { const k = o.envanter.ekle(287, 1); if (!k) ses.topla(); return !k; }
    });
    o.tikSayac += dt;
    if (o.tikSayac > 0.5) { o.tikSayac = 0; o.dunya.rastgeleTik(p.x, p.z); }
    o.kayitSayac += dt;
    if (o.kayitSayac > 60) { o.kayitSayac = 0; oyunKaydet(); }
  }
  /* Kamera, gökyüzü, ışık */
  o.oyuncu.kameraAyarla(sahne.kamera, ayar.sallanma);
  const kosFov = o.oyuncu.kosuyor ? 8 : 0;
  const hedefFov = ayar.fov + kosFov - o.etkilesim.germe * 12;
  if (Math.abs(sahne.kamera.fov - hedefFov) > 0.05) { sahne.kamera.fov += (hedefFov - sahne.kamera.fov) * Math.min(1, dt * 10); sahne.kamera.updateProjectionMatrix(); }
  const gozSuda = o.oyuncu.basSuda;
  const gun = sahne.gokGuncelle(o.zaman, sahne.kamera.position, gozSuda, o.dunya.gorus, o.sure);
  o.gunIsigi = gun;
  /* Meşale ışıkları */
  const seciliId = o.envanter.seciliId();
  const goz = o.oyuncu.gozKonumu(gecici);
  const liste = [];
  const titre = 13.5 + Math.sin(o.sure * 9) * 0.35 + Math.sin(o.sure * 23) * 0.2;
  if (seciliId === 46) liste.push([goz.x, goz.y - 0.3, goz.z, 11]);
  for (const m of o.dunya.yakinMesaleler(goz.x, goz.y, goz.z, 15)) liste.push([m[0], m[1], m[2], (m[3] || 14) * titre / 13.5]);
  sahne.isiklariAyarla(liste);
  /* El ve düşen eşyaların ışığı */
  o.isikSayac -= dt;
  if (o.isikSayac <= 0) {
    o.isikSayac = 0.25;
    const acik = o.dunya.ustKati(Math.floor(goz.x), Math.floor(goz.z)) < goz.y;
    let l = acik ? gun : 0.12;
    for (const L of liste) { const d = Math.hypot(L[0] - goz.x, L[1] - goz.y, L[2] - goz.z); l = Math.max(l, Math.min(1, (1 - d / (L[3] * 0.9)) * 1.1)); }
    o.isikHedef = Math.max(0.1, l);
  }
  o.isik += ((o.isikHedef || 1) - o.isik) * Math.min(1, dt * 4);
  o.dusenler.guncelle(dt, o.oyuncu.konum, (id, adet, dayanim) => {
    const k = o.envanter.ekle(id, adet, dayanim);
    if (k < adet) ses.topla();
    return k;
  }, o.isik);
  sahne.elAyarla(seciliId);
  sahne.elGuncelle(dt, o.etkilesim.vurus, o.oyuncu.adimFaz, o.isik, o.etkilesim.germe);
  const V = o.varliklar;
  o.hud.hedef(o.etkilesim.hedefCanli || (V.sonVurulanZaman > 0 && V.sonVurulan && !V.sonVurulan.olu ? V.sonVurulan : null));
  /* Gösterge */
  o.hud.durumCiz(o.oyuncu.basSuda);
  o.hud.pusula(o.oyuncu.yaw);
  o.hud.saat(o.zaman, o.gun);
  o.hud.suAlti(gozSuda);
  if (!$('#hata').hidden) hataPaneli(o);
  if (envEkrani.acik && Math.random() < 0.05) envEkrani.ciz();
  sahne.ciz();
}
function hataPaneli(o) {
  const p = o.oyuncu.konum, k = o.dunya.uretici.kolon(Math.floor(p.x), Math.floor(p.z), {});
  let yon = (-o.oyuncu.yaw * 180 / Math.PI) % 360; if (yon < 0) yon += 360;
  const h = o.etkilesim.hedef;
  $('#hata').textContent =
`HungerMan ${SURUM}   ${$('#fps').textContent || ''}
XYZ: ${p.x.toFixed(2)} / ${p.y.toFixed(2)} / ${p.z.toFixed(2)}
Parça: ${Math.floor(p.x / PB)}, ${Math.floor(p.z / PB)}   Yüklü parça: ${o.dunya.parcalar.size}
Biyom: ${BIYOMLAR[k.b]}   Zemin: ${k.h}
Yön: ${yon.toFixed(0)}°   Görüş: ${o.dunya.gorus}
Tohum: ${o.tohum}
Bakılan: ${h ? `${BLOKLAR[h.id].ad} (${h.x}, ${h.y}, ${h.z})` : '-'}
Düşen eşya: ${o.dusenler.liste.length}   Canlı: ${o.varliklar.liste.length} (zombi ${o.varliklar.liste.filter(v => v.tur.dusman).length})`;
}

/* Yatakta uyuma */
function uyu(h) {
  const o = oyun;
  o.dogum = { x: h.x + 0.5, y: h.y + 1, z: h.z + 0.5 };
  const gece = o.zaman > 0.52 && o.zaman < 0.97;
  if (!gece) { o.hud.bildirim('Yalnızca geceleri uyunabilir. Doğma noktası bu yatağa ayarlandı.'); return; }
  if (o.varliklar.yakinDusman(o.oyuncu.konum, 10)) { o.hud.bildirim('Yakında canavarlar varken uyunamaz.'); return; }
  if (o.uyku > 0) return;
  o.uyku = 2.6; o.uyandi = false;
  $('#uyku').classList.add('acik');
}

/* Menüde arka plan sahnesi çizilmez; yalnız CSS katmanı görünür */
function menuKamera() { /* boş */ }

requestAnimationFrame(dongu);
ekran('ana');
/* Konsoldan inceleme için (oyun mantığını değiştirmez) */
window.HungerMan = { get oyun() { return oyun; }, get ekran() { return aktifEkran; }, get kilitli() { return kilitli; }, sahne, ayar, tus, fare, kilitAyarla: v => { kilitli = v; tiklaGuncelle(); } };
export { ESYALAR };
