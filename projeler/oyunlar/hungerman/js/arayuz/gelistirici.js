/* HungerMan - geliştirici modu penceresi (F9): komut yazmadan kullanılan test penceresi
   Geliştirici kodu konsolda girildikten sonra açılır. İşlemler konsol komutları üzerinden yürür (aynı kurallar geçerlidir);
   anahtarlar ve kaydırıcılar değerleri doğrudan değiştirir. */
import { ESYALAR } from '../bloklar.js';
import { TURLER } from '../varlik/turler.js';
import { BIYOMLAR } from '../dunya/uretici.js';
import { simge } from '../grafik/doku.js';
import { PB } from '../sabitler.js';

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const SEKMELER = [['oyuncu', 'Oyuncu'], ['esya', 'Eşyalar'], ['dunya', 'Dünya'], ['canli', 'Canlılar'], ['isinla', 'Işınlanma'], ['bilgi', 'Bilgi']];
const kucuk = s => String(s).toLocaleLowerCase('tr');

export class GelistiriciPenceresi {
  constructor(o) {
    Object.assign(this, o); // ses, konsol, oyun(), kapatIste, arayuz: { fpsAc(v), hataAc(v), miniAc(v), ayar }
    this.acik = false; this.sekme = 'oyuncu'; this.arama = ''; this.adet = 1; this.sayac = 0; this.dogurAdet = 1; this.kesifR = 192;
    this.kok = $('#gelistirici');
    $('#gelSekme').innerHTML = SEKMELER.map(([k, a]) => `<button type="button" data-s="${k}">${a}</button>`).join('');
    $('#gelSekme').addEventListener('click', e => { const b = e.target.closest('button[data-s]'); if (!b) return; this.sekme = b.dataset.s; this.ses.tik(); this.ciz(); });
    $('#gelKapat').addEventListener('click', () => this.kapatIste());
    this.kok.addEventListener('mousedown', e => { if (e.target === this.kok) this.kapatIste(); });
    const ic = $('#gelIcerik');
    ic.addEventListener('click', e => this.tikla(e));
    ic.addEventListener('input', e => this.girdi(e));
    ic.addEventListener('change', e => this.degisti(e));
    ic.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') this.kapatIste(); });
    this.konsol.mesajDinle = (m, sinif) => { const el = $('#gelMesaj'); el.textContent = m; el.className = 'gelMesaj ' + sinif; };
  }
  ac() { this.acik = true; this.kok.hidden = false; $('#gelMesaj').textContent = 'Değişiklikler hemen uygulanır. İşlemler konsol kaydına da yazılır (F8).'; $('#gelMesaj').className = 'gelMesaj soluk'; this.ciz(); }
  kapat() { this.acik = false; this.kok.hidden = true; }
  k(s) { this.konsol.calistir(s); this.ses.tik(); }

  /* ---------- Çizim ---------- */
  ciz() {
    if (!this.acik) return;
    const o = this.oyun();
    if (!o) return;
    [...$('#gelSekme').children].forEach(b => b.classList.toggle('on', b.dataset.s === this.sekme));
    $('#gelDurum').textContent = `${o.ad} · ${o.istemci ? 'çok oyunculu istemci (yalnız kişisel işlemler)' : o.ag ? 'çok oyunculu sunucu' : 'tek oyunculu'}`;
    const ic = $('#gelIcerik');
    const S = this.sekme;
    if (S === 'oyuncu') {
      const h = o.hayatta, P = o.oyuncu;
      ic.innerHTML = `
        <div class="gelIzgara">
          ${this.anahtar('olumsuz', 'Ölümsüzlük', 'Hiç hasar alınmaz', h.olumsuz)}
          ${this.anahtar('ucus', 'Uçma', 'Boşluk yükselir, C alçalır', P.ucus)}
        </div>
        ${this.kaydirici('hiz', 'Hareket hızı', 0.2, 5, 0.1, P.hizCarpani, v => v.toFixed(1) + '×')}
        ${this.kaydirici('can', 'Can', 1, 20, 1, h.can, v => v + ' / 20')}
        ${this.kaydirici('aclik', 'Açlık', 0, 20, 1, h.aclik, v => v + ' / 20')}
        <div class="gelDugmeler">
          <button type="button" data-k="iyiles">Tamamen iyileş</button><button type="button" data-k="doy">Doyur</button>
          <button type="button" data-k="isinla dogum">Doğma noktasına git</button><button type="button" data-onay="envanter temizle" class="tehlike">Envanteri boşalt</button>
        </div>`;
    } else if (S === 'esya') {
      const a = kucuk(this.arama);
      const l = Object.entries(ESYALAR).filter(([, e]) => e && e.ad && (!a || kucuk(e.ad).includes(a)));
      ic.innerHTML = `
        <div class="gelSatir"><input type="search" id="gelAra" placeholder="Eşya ara" value="${esc(this.arama)}" autocomplete="off">
          <span class="gelAdet">${[1, 16, 64].map(n => `<button type="button" data-adet="${n}" class="${this.adet === n ? 'on' : ''}">${n}</button>`).join('')}</span></div>
        <p class="gelNot">Tıklanan eşyadan ${this.adet} adet verilir (${l.length} eşya).</p>
        <div class="gelEsyalar">${l.map(([i, e]) => `<button type="button" data-ver="${i}" title="${esc(e.ad)} (${i})"><img src="${simge(+i).url}" alt=""></button>`).join('')}</div>`;
      const g = $('#gelAra'); if (g && this.aramaOdak) { g.focus(); g.setSelectionRange(g.value.length, g.value.length); }
    } else if (S === 'dunya') {
      const saat = ((o.zaman * 24 + 6) % 24);
      ic.innerHTML = `
        ${this.kaydirici('saat', 'Saat', 0, 23.75, 0.25, Math.round(saat * 4) / 4, v => `${String(Math.floor(v)).padStart(2, '0')}:${String(Math.round((v % 1) * 60)).padStart(2, '0')}`)}
        <div class="gelDugmeler">${[['safak', 'Şafak'], ['sabah', 'Sabah'], ['ogle', 'Öğle'], ['aksam', 'Akşam'], ['gece', 'Gece']].map(([k, a]) => `<button type="button" data-k="zaman ${k}">${a}</button>`).join('')}</div>
        ${this.kaydirici('zhiz', 'Zaman hızı (0 = durdur)', 0, 100, 1, o.zamanHizi ?? 1, v => v === 0 ? 'durdu' : v + '×')}
        <div class="gelSatir"><label>Gün <input type="number" id="gelGun" min="1" max="9999" value="${o.gun}"></label><button type="button" data-gun="1">Uygula</button></div>
        ${this.kaydirici('gorus', 'Görüş mesafesi', 4, 16, 1, o.dunya.gorus, v => v + ' parça')}
        <div class="gelIzgara">${this.anahtar('dogurma', 'Canlı doğmasını durdur', 'Yeni hayvan ve canavar çıkmaz', !!o.varliklar.dogurmaKapali)}</div>
        ${this.kaydirici('kesif', 'Haritada keşfedilecek yarıçap', 64, 512, 32, this.kesifR, v => v + ' blok')}
        <div class="gelDugmeler"><button type="button" data-kesfet="1">Çevreyi keşfet</button><button type="button" data-k="harita">Haritayı aç</button>
          <button type="button" data-k="esya temizle">Yerdeki eşyaları temizle</button><button type="button" data-k="kaydet">Hemen kaydet</button></div>`;
    } else if (S === 'canli') {
      const turler = Object.keys(TURLER).filter(t => !TURLER[t].koylu);
      ic.innerHTML = `
        ${this.kaydirici('dadet', 'Doğurulacak adet', 1, 20, 1, this.dogurAdet, v => v)}
        <p class="gelNot">Canlı, bakılan yönde yaklaşık 4 blok ileride doğar (deniz canlıları suya bakılırken).</p>
        <div class="gelDugmeler">${turler.map(t => `<button type="button" data-dogur="${t}" class="${TURLER[t].dusman ? 'dusman' : ''}">${esc(TURLER[t].ad)}</button>`).join('')}</div>
        <h4>Kaldır</h4>
        <div class="gelDugmeler"><button type="button" data-k="oldur dusman">Düşmanlar</button><button type="button" data-k="oldur hayvan">Hayvanlar</button><button type="button" data-k="oldur deniz">Deniz canlıları</button><button type="button" data-onay="oldur hepsi" class="tehlike">Hepsi (köylüler hariç)</button></div>
        <div id="gelSayim" class="gelNot"></div>`;
      this.sayimYaz(o);
    } else if (S === 'isinla') {
      const P = o.oyuncu.konum;
      ic.innerHTML = `
        <div class="gelDugmeler"><button type="button" data-k="isinla koy">En yakın köy</button><button type="button" data-k="isinla liman">En yakın liman</button><button type="button" data-k="isinla zindan">En yakın zindan</button><button type="button" data-k="isinla batik">En yakın batık</button><button type="button" data-k="isinla dogum">Doğma noktası</button></div>
        <div class="gelSatir gelKoord"><label>X <input type="number" id="gelX" value="${Math.round(P.x)}"></label><label>Y <input type="number" id="gelY" placeholder="zemin"></label><label>Z <input type="number" id="gelZ" value="${Math.round(P.z)}"></label><button type="button" data-git="1">Git</button></div>
        <div class="gelDugmeler">${[['Kuzey', '~ ~-100'], ['Güney', '~ ~100'], ['Doğu', '~100 ~'], ['Batı', '~-100 ~']].map(([a, k]) => `<button type="button" data-k="isinla ${k}">${a} 100 blok</button>`).join('')}<button type="button" data-k="isinla ~ ~40 ~">40 blok yukarı</button></div>
        <h4>Haritadaki işaretler</h4>
        <div class="gelDugmeler">${(o.yerler || []).length ? o.yerler.map((y, i) => `<button type="button" data-yer="${i}"><i style="background:${esc(y.renk)}"></i>${esc(y.ad)}</button>`).join('') : '<span class="gelNot">Büyük haritada (M) işaret eklenmemiş.</span>'}</div>`;
    } else {
      ic.innerHTML = `
        <div class="gelIzgara">
          ${this.anahtar('fps', 'Kare hızı göstergesi', 'Sol altta FPS', !$('#fps').hidden)}
          ${this.anahtar('f3', 'Teknik bilgi paneli', 'F3 paneli', !$('#hata').hidden)}
          ${this.anahtar('mini', 'Mini harita', 'Sağ altta', !$('#miniHarita').hidden)}
        </div>
        <table class="gelTablo" id="gelTablo"></table>
        <div class="gelDugmeler"><button type="button" data-kopya="1">Tohumu kopyala (${o.tohum})</button></div>`;
      this.tabloYaz(o);
    }
  }
  anahtar(ad, baslik, alt, acik) { return `<label class="gelAnahtar"><input type="checkbox" data-a="${ad}" ${acik ? 'checked' : ''}><i></i><span><b>${baslik}</b><small>${alt}</small></span></label>`; }
  kaydirici(ad, baslik, min, max, adim, deger, bicim) {
    this.bicimler = this.bicimler || {}; this.bicimler[ad] = bicim;
    return `<label class="gelKaydir"><span>${baslik} <b data-d="${ad}">${bicim(+deger)}</b></span><input type="range" data-r="${ad}" min="${min}" max="${max}" step="${adim}" value="${deger}"></label>`;
  }

  /* ---------- Olaylar ---------- */
  tikla(e) {
    const o = this.oyun(); if (!o) return;
    const b = e.target.closest('button'); if (!b) return;
    const d = b.dataset;
    if (d.k) this.k(d.k);
    else if (d.onay) {
      if (b.dataset.bekle) { delete b.dataset.bekle; this.k(d.onay); b.textContent = b.dataset.eski; }
      else { b.dataset.bekle = '1'; b.dataset.eski = b.textContent; b.textContent = 'Onaylamak için tekrar tıklayınız'; setTimeout(() => { if (b.isConnected && b.dataset.bekle) { delete b.dataset.bekle; b.textContent = b.dataset.eski; } }, 2500); }
    }
    else if (d.ver) this.k(`ver ${d.ver} ${e.shiftKey ? 64 : this.adet}`);
    else if (d.adet) { this.adet = +d.adet; this.ses.tik(); this.ciz(); }
    else if (d.dogur) this.k(`dogur ${d.dogur} ${this.dogurAdet}`);
    else if (d.gun) this.k(`gun ${$('#gelGun').value}`);
    else if (d.kesfet) this.k(`kesfet ${this.kesifR}`);
    else if (d.git) { const x = $('#gelX').value, y = $('#gelY').value, z = $('#gelZ').value; this.k(y === '' ? `isinla ${x} ${z}` : `isinla ${x} ${y} ${z}`); }
    else if (d.yer) { const y = o.yerler[+d.yer]; if (y) this.k(`isinla ${y.x} ${y.z}`); }
    else if (d.kopya) { if (navigator.clipboard) navigator.clipboard.writeText(String(o.tohum)).catch(() => {}); this.ses.tik(); $('#gelMesaj').textContent = 'Tohum panoya kopyalandı.'; }
  }
  girdi(e) {
    const t = e.target, o = this.oyun(); if (!o) return;
    if (t.id === 'gelAra') { this.arama = t.value; this.aramaOdak = true; this.ciz(); this.aramaOdak = false; return; }
    const r = t.dataset.r; if (!r) return;
    const v = +t.value, el = this.kok.querySelector(`[data-d="${r}"]`);
    if (el && this.bicimler[r]) el.textContent = this.bicimler[r](v);
    const izin = () => { if (!o.komutlar) { $('#gelMesaj').textContent = 'Bu dünyada komutlar kapalı.'; return false; } return true; };
    if (r === 'hiz' && izin()) o.oyuncu.hizCarpani = v;
    else if (r === 'can' && izin()) o.hayatta.can = v;
    else if (r === 'aclik' && izin()) o.hayatta.aclik = v;
    else if (r === 'dadet') this.dogurAdet = v;
    else if (r === 'kesif') this.kesifR = v;
  }
  degisti(e) {
    const t = e.target, o = this.oyun(); if (!o) return;
    const r = t.dataset.r, a = t.dataset.a, v = +t.value;
    if (r === 'saat') this.k(`zaman ${v}`);
    else if (r === 'zhiz') this.k(`zaman hiz ${v}`);
    else if (r === 'gorus') this.k(`gorus ${v}`);
    if (!a) return;
    const acik = t.checked;
    const ayarla = (alan, nesne, komut) => { if (!!nesne[alan] !== acik) this.k(komut); if (!!nesne[alan] !== acik) t.checked = !!nesne[alan]; };
    if (a === 'olumsuz') ayarla('olumsuz', o.hayatta, 'olumsuz');
    else if (a === 'ucus') ayarla('ucus', o.oyuncu, 'ucus');
    else if (a === 'dogurma') {
      if (o.istemci) { t.checked = false; $('#gelMesaj').textContent = 'Çok oyunculu istemcide canlıları sunucu yönetir.'; return; }
      if (!o.komutlar) { t.checked = !acik; $('#gelMesaj').textContent = 'Bu dünyada komutlar kapalı.'; return; }
      o.varliklar.dogurmaKapali = acik; this.ses.tik(); $('#gelMesaj').textContent = `Canlı doğması ${acik ? 'durduruldu' : 'açıldı'}.`;
    }
    else if (a === 'fps') this.arayuz.fpsAc(acik);
    else if (a === 'f3') this.arayuz.hataAc(acik);
    else if (a === 'mini') this.arayuz.miniAc(acik);
  }

  /* ---------- Canlı bilgiler ---------- */
  guncelle(dt) {
    if (!this.acik) return;
    this.sayac -= dt;
    if (this.sayac > 0) return;
    this.sayac = 0.3;
    const o = this.oyun(); if (!o) return;
    if (this.sekme === 'bilgi') this.tabloYaz(o);
    else if (this.sekme === 'canli') this.sayimYaz(o);
  }
  sayimYaz(o) {
    const el = $('#gelSayim'); if (!el) return;
    const say = {};
    for (const v of o.varliklar.liste) say[v.tur.ad] = (say[v.tur.ad] || 0) + 1;
    el.textContent = 'Çevrede: ' + (Object.entries(say).map(([a, n]) => `${a} ${n}`).join(' · ') || 'canlı yok');
  }
  tabloYaz(o) {
    const el = $('#gelTablo'); if (!el) return;
    const P = o.oyuncu.konum, k = o.dunya.uretici.kolon(Math.floor(P.x), Math.floor(P.z), {}), V = o.varliklar.liste, m = performance.memory;
    const satir = [
      ['Kare hızı', $('#fps').textContent || '-'],
      ['Konum', `X ${P.x.toFixed(1)} · Y ${P.y.toFixed(1)} · Z ${P.z.toFixed(1)}`],
      ['Parça', `${Math.floor(P.x / PB)}, ${Math.floor(P.z / PB)}`],
      ['Biyom / zemin', `${BIYOMLAR[k.b]} · ${k.h}`],
      ['Zaman', `${o.gun}. gün · ${o.hud ? $('#saatDeger').textContent : ''} · hız ${o.zamanHizi ?? 1}×`],
      ['Canlılar', `${V.length} (düşman ${V.filter(v => v.tur.dusman).length}, hayvan ${V.filter(v => !v.tur.dusman && !v.tur.su && !v.tur.koylu).length}, deniz ${V.filter(v => v.tur.su).length}, köylü ${V.filter(v => v.tur.koylu).length})`],
      ['Ok / yerde eşya / tekne', `${o.varliklar.oklar.length} / ${o.dusenler.liste.length} / ${o.tekneler.liste.length}`],
      ['Yüklü parça', `${o.dunya.parcalar.size} (görüş ${o.dunya.gorus})`],
      ['Harita', `${o.harita.parcalar.size} parça · ${(o.harita.alan / 1e6).toFixed(2).replace('.', ',')} km² · ${(o.yerler || []).length} işaret`],
      ['Blok değişikliği', String([...o.dunya.degisiklikler.values()].reduce((a, d) => a + d.size, 0))],
      ['Bellek', m ? `${Math.round(m.usedJSHeapSize / 1048576)} MB` : 'tarayıcı bildirmiyor'],
      ['Ağ', o.ag ? `${o.istemci ? 'istemci' : 'sunucu'} · ${o.ag.oyuncuListesi().length} oyuncu${o.ag.kod ? ' · kod ' + o.ag.kod : ''}` : 'tek oyunculu'],
      ['Modlar', [o.hayatta.olumsuz && 'ölümsüz', o.oyuncu.ucus && 'uçuyor', o.oyuncu.hizCarpani !== 1 && `hız ${o.oyuncu.hizCarpani}×`, o.varliklar.dogurmaKapali && 'doğma kapalı', o.komutlar && 'komutlar açık'].filter(Boolean).join(' · ') || '-']
    ];
    el.innerHTML = satir.map(([a, b]) => `<tr><th>${a}</th><td>${esc(b)}</td></tr>`).join('');
  }
}
