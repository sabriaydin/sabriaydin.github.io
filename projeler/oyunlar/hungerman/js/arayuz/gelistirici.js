/* HungerMan - geliştirici modu penceresi (F9): komut yazmadan kullanılan test penceresi
   Geliştirici kodu konsolda girildikten sonra açılır. İşlemler konsol komutları üzerinden yürür (aynı izin kuralları geçerlidir);
   anahtarlar ve kaydırıcılar değerleri doğrudan değiştirir. Üstteki hızlı işlemler çubuğu her sekmede görünür. */
import { ESYALAR, BLOKLAR } from '../bloklar.js';
import { TURLER } from '../varlik/turler.js';
import { BIYOMLAR } from '../dunya/uretici.js';
import { simge } from '../grafik/doku.js';
import { PB } from '../sabitler.js';

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const kucuk = s => String(s).toLocaleLowerCase('tr');
const SEKMELER = [['oyuncu', 'Oyuncu'], ['esya', 'Eşyalar'], ['dunya', 'Dünya'], ['canli', 'Canlılar'], ['isinla', 'Işınlanma'], ['gorsel', 'Görüntü'], ['bilgi', 'Performans']];
const SAKLA = 'hungerman_gelistirici_sekme';

/* Eşya kategorileri */
const KATEGORI = [['hepsi', 'Hepsi'], ['blok', 'Bloklar'], ['alet', 'Aletler'], ['zirh', 'Zırh'], ['yiyecek', 'Yiyecek'], ['diger', 'Diğer']];
function kategori(e) { if (e.zirh) return 'zirh'; if (e.tur === 'blok') return 'blok'; if (e.tur === 'alet' || e.tur === 'yay' || e.tur === 'olta') return 'alet'; if (e.tur === 'yiyecek' || e.tur === 'iyilestir') return 'yiyecek'; return 'diger'; }

/* Hazır setler: [eşya numarası, adet] */
const SETLER = {
  baslangic: { ad: 'Başlangıç', esya: [[304, 1], [305, 1], [306, 1], [307, 1], [293, 16], [46, 32], [32, 1], [33, 1], [47, 1]] },
  elmas: { ad: 'Elmas donanım', esya: [[316, 1], [317, 1], [318, 1], [319, 1], [286, 1], [287, 64], [412, 1], [413, 1], [414, 1], [415, 1], [290, 8]] },
  insaat: { ad: 'İnşaat', esya: [[14, 64], [38, 64], [35, 64], [37, 64], [34, 64], [51, 64], [46, 64], [50, 4]] },
  denizci: { ad: 'Denizci', esya: [[454, 1], [455, 1], [453, 1], [456, 1], [457, 1], [298, 16]] },
  maden: { ad: 'Madenci', esya: [[312, 1], [313, 1], [314, 1], [46, 64], [276, 16], [408, 1], [409, 1], [410, 1], [411, 1]] }
};

export class GelistiriciPenceresi {
  constructor(o) {
    Object.assign(this, o); // ses, konsol, sahne, oyun(), kapatIste, arayuz: { fpsAc(v), hataAc(v), miniAc(v), haritaAc() }
    this.acik = false; this.arama = ''; this.kat = 'hepsi'; this.adet = 1; this.sayac = 0; this.dogurAdet = 1; this.kesifR = 192;
    try { this.sekme = localStorage.getItem(SAKLA) || 'oyuncu'; } catch (e) { this.sekme = 'oyuncu'; }
    if (!SEKMELER.some(s => s[0] === this.sekme)) this.sekme = 'oyuncu';
    this.kareler = new Float32Array(180); this.kareSira = 0;
    this.kok = $('#gelistirici');
    $('#gelSekme').innerHTML = SEKMELER.map(([k, a]) => `<button type="button" data-s="${k}">${a}</button>`).join('');
    $('#gelSekme').addEventListener('click', e => { const b = e.target.closest('button[data-s]'); if (!b) return; this.sekme = b.dataset.s; try { localStorage.setItem(SAKLA, this.sekme); } catch (x) { /* depolama kapalı */ } this.ses.tik(); this.ciz(); });
    $('#gelKapat').addEventListener('click', () => this.kapatIste());
    this.kok.addEventListener('mousedown', e => { if (e.target === this.kok) this.kapatIste(); });
    for (const el of [$('#gelIcerik'), $('#gelHizli')]) {
      el.addEventListener('click', e => this.tikla(e));
      el.addEventListener('input', e => this.girdi(e));
      el.addEventListener('change', e => this.degisti(e));
    }
    $('#gelIcerik').addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') this.kapatIste(); });
    $('#gelIcerik').addEventListener('mouseover', e => { const b = e.target.closest('[data-ver]'); if (b) $('#gelNotEsya') && ($('#gelNotEsya').textContent = `${ESYALAR[+b.dataset.ver].ad} (${b.dataset.ver}) · tık: ${this.adet} adet · Shift + tık: 64 adet`); });
    this.konsol.mesajDinle = (m, sinif) => { const el = $('#gelMesaj'); el.textContent = m; el.className = 'gelMesaj ' + sinif; };
  }
  ac() { this.acik = true; this.kok.hidden = false; $('#gelMesaj').textContent = 'Değişiklikler hemen uygulanır; işlemler konsol kaydına da yazılır (F8). Büyük haritada Ctrl + tık ile ışınlanılır.'; $('#gelMesaj').className = 'gelMesaj soluk'; this.ciz(); }
  kapat() { this.acik = false; this.kok.hidden = true; }
  k(s) { this.konsol.calistir(s); this.ses.tik(); }
  izin(o) { if (!o.komutlar) { this.mesaj('Bu dünyada komutlar kapalı.', 'hata'); return false; } return true; }
  mesaj(m, sinif = '') { const el = $('#gelMesaj'); el.textContent = m; el.className = 'gelMesaj ' + sinif; }

  /* ---------- Çizim ---------- */
  ciz() {
    if (!this.acik) return;
    const o = this.oyun();
    if (!o) return;
    [...$('#gelSekme').children].forEach(b => b.classList.toggle('on', b.dataset.s === this.sekme));
    $('#gelDurum').textContent = `${o.ad} · ${o.istemci ? 'çok oyunculu istemci (yalnız kişisel işlemler)' : o.ag ? 'çok oyunculu sunucu' : 'tek oyunculu'}`;
    this.hizliCiz(o);
    const ic = $('#gelIcerik'), S = this.sekme;
    if (S === 'oyuncu') {
      const h = o.hayatta, P = o.oyuncu;
      ic.innerHTML = `
        <div class="gelIzgara">
          ${this.anahtar('olumsuz', 'Ölümsüzlük', 'Hiç hasar alınmaz', h.olumsuz)}
          ${this.anahtar('ucus', 'Uçma', 'Boşluk yükselir, C alçalır', P.ucus)}
          ${this.anahtar('hayalet', 'Duvardan geçme', 'Uçarken bloklardan geçilir', P.hayalet)}
          ${this.anahtar('aninda', 'Anında kırma', 'Her blok tek vuruşta kırılır', !!o.etkilesim.aninda)}
          ${this.anahtar('sinirsiz', 'Sınırsız eşya', 'Koyma, üretim ve ticarette azalmaz; aletler yıpranmaz', !!o.envanter.sinirsiz)}
        </div>
        ${this.kaydirici('hiz', 'Hareket hızı', 0.2, 5, 0.1, P.hizCarpani, v => v.toFixed(1) + '×')}
        ${this.kaydirici('can', 'Can', 1, 20, 1, h.can, v => v + ' / 20')}
        ${this.kaydirici('aclik', 'Açlık', 0, 20, 1, h.aclik, v => v + ' / 20')}
        <div class="gelDugmeler">
          <button type="button" data-k="iyiles">Tamamen iyileş</button><button type="button" data-k="doy">Doyur</button>
          <button type="button" data-k="isinla dogum">Doğma noktasına git</button><button type="button" data-onay="envanter temizle" class="tehlike">Envanteri boşalt</button>
        </div>
        <h4>Hazır setler</h4>
        <div class="gelDugmeler">${Object.entries(SETLER).map(([k, s]) => `<button type="button" data-set="${k}" title="${esc(s.esya.map(([i, n]) => `${ESYALAR[i] ? ESYALAR[i].ad : i} × ${n}`).join(', '))}">${s.ad}</button>`).join('')}</div>`;
    } else if (S === 'esya') {
      const a = kucuk(this.arama);
      const l = Object.entries(ESYALAR).filter(([, e]) => e && e.ad && (this.kat === 'hepsi' || kategori(e) === this.kat) && (!a || kucuk(e.ad).includes(a) || String(e.id) === a));
      ic.innerHTML = `
        <div class="gelSatir"><input type="search" id="gelAra" placeholder="Eşya adı ya da numarası" value="${esc(this.arama)}" autocomplete="off">
          <span class="gelAdet">${[1, 8, 16, 64].map(n => `<button type="button" data-adet="${n}" class="${this.adet === n ? 'on' : ''}">${n}</button>`).join('')}</span></div>
        <div class="gelCipler">${KATEGORI.map(([k, ad]) => `<button type="button" data-kat="${k}" class="${this.kat === k ? 'on' : ''}">${ad}</button>`).join('')}</div>
        <p class="gelNot" id="gelNotEsya">${l.length} eşya · Üzerine gelinen eşyanın adı burada görünür.</p>
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
        ${this.kaydirici('kesif', 'Haritada keşfedilecek yarıçap', 64, 512, 32, this.kesifR, v => v + ' blok')}
        <div class="gelDugmeler"><button type="button" data-kesfet="1">Çevreyi keşfet</button><button type="button" data-harita="1">Haritayı aç</button>
          <button type="button" data-k="esya temizle">Yerdeki eşyaları temizle</button><button type="button" data-k="kaydet">Hemen kaydet</button></div>`;
    } else if (S === 'canli') {
      const turler = Object.keys(TURLER).filter(t => !TURLER[t].koylu);
      ic.innerHTML = `
        <div class="gelIzgara">
          ${this.anahtar('dogurma', 'Canlı doğmasını durdur', 'Yeni hayvan ve canavar çıkmaz', !!o.varliklar.dogurmaKapali)}
          ${this.anahtar('donmus', 'Canlıları dondur', 'Yapay zekâ ve hareket durur', !!o.varliklar.donmus)}
        </div>
        ${this.kaydirici('dadet', 'Doğurulacak adet', 1, 20, 1, this.dogurAdet, v => v)}
        <p class="gelNot">Canlı, bakılan yönde yaklaşık 4 blok ileride doğar (deniz canlıları suya bakılırken).</p>
        <h4>Hayvanlar ve deniz canlıları</h4>
        <div class="gelDugmeler">${turler.filter(t => !TURLER[t].dusman).map(t => `<button type="button" data-dogur="${t}">${esc(TURLER[t].ad)}</button>`).join('')}</div>
        <h4>Düşmanlar</h4>
        <div class="gelDugmeler">${turler.filter(t => TURLER[t].dusman).map(t => `<button type="button" data-dogur="${t}" class="dusman">${esc(TURLER[t].ad)}</button>`).join('')}</div>
        <h4>Kaldır</h4>
        <div class="gelDugmeler"><button type="button" data-k="oldur dusman">Düşmanlar</button><button type="button" data-k="oldur hayvan">Hayvanlar</button><button type="button" data-k="oldur deniz">Deniz canlıları</button><button type="button" data-onay="oldur hepsi" class="tehlike">Hepsi (köylüler hariç)</button></div>
        <div id="gelSayim" class="gelSayim"></div>`;
      this.sayimYaz(o);
    } else if (S === 'isinla') {
      const P = o.oyuncu.konum;
      ic.innerHTML = `
        <div class="gelDugmeler"><button type="button" data-k="isinla koy">En yakın köy</button><button type="button" data-k="isinla liman">En yakın liman</button><button type="button" data-k="isinla zindan">En yakın zindan</button><button type="button" data-k="isinla batik">En yakın batık</button><button type="button" data-k="isinla dogum">Doğma noktası</button>${o.olumNoktasi ? `<button type="button" data-k="isinla ${o.olumNoktasi.x} ${o.olumNoktasi.y + 1} ${o.olumNoktasi.z}">Son ölüm noktası</button>` : ''}</div>
        <div class="gelSatir gelKoord"><label>X <input type="number" id="gelX" value="${Math.round(P.x)}"></label><label>Y <input type="number" id="gelY" placeholder="zemin"></label><label>Z <input type="number" id="gelZ" value="${Math.round(P.z)}"></label><button type="button" data-git="1">Git</button></div>
        <div class="gelDugmeler">${[['Kuzey', '~ ~-100'], ['Güney', '~ ~100'], ['Doğu', '~100 ~'], ['Batı', '~-100 ~']].map(([a, k]) => `<button type="button" data-k="isinla ${k}">${a} 100 blok</button>`).join('')}<button type="button" data-k="isinla ~ ~40 ~">40 blok yukarı</button><button type="button" data-harita="1">Haritadan seç (Ctrl + tık)</button></div>
        <h4>Haritadaki işaretler</h4>
        <div class="gelDugmeler">${(o.yerler || []).length ? o.yerler.map((y, i) => `<button type="button" data-yer="${i}"><i style="background:${esc(y.renk)}"></i>${esc(y.ad)}</button>`).join('') : '<span class="gelNot">Büyük haritada (M) işaret eklenmemiş.</span>'}</div>`;
    } else if (S === 'gorsel') {
      const M = this.sahne.opakMalzeme;
      ic.innerHTML = `
        <div class="gelIzgara">
          ${this.anahtar('tel', 'Tel kafes görünümü', 'Dünya geometrisi çizgilerle çizilir', !!M.wireframe)}
          ${this.anahtar('el', 'Eli gizle', 'Ekran görüntüsü almak için', !this.sahne.el.visible)}
          ${this.anahtar('hud', 'Göstergeyi gizle', 'Pusula, çubuk ve harita gizlenir', !!document.body.classList.contains('gostergesiz'))}
          ${this.anahtar('fps', 'Kare hızı göstergesi', 'Sol altta FPS', !$('#fps').hidden)}
          ${this.anahtar('f3', 'Teknik bilgi paneli', 'F3 paneli', !$('#hata').hidden)}
          ${this.anahtar('mini', 'Mini harita', 'Sağ altta', !$('#miniHarita').hidden)}
        </div>
        ${this.kaydirici('fov', 'Görüş açısı', 40, 110, 1, Math.round(this.sahne.kamera.fov), v => v + '°')}`;
    } else {
      ic.innerHTML = `
        <canvas id="gelGrafik" class="gelGrafik" width="680" height="90"></canvas>
        <table class="gelTablo" id="gelTablo"></table>
        <div class="gelDugmeler"><button type="button" data-kopya="1">Tohumu kopyala (${o.tohum})</button><button type="button" data-konsol="1">Konsolu aç</button></div>`;
      this.tabloYaz(o);
    }
  }
  hizliCiz(o) {
    const h = $('#gelHizli');
    const c = (ad, baslik, acik) => `<label class="gelCip"><input type="checkbox" data-a="${ad}" ${acik ? 'checked' : ''}><span>${baslik}</span></label>`;
    h.innerHTML = c('olumsuz', 'Ölümsüz', o.hayatta.olumsuz) + c('ucus', 'Uçma', o.oyuncu.ucus) + c('hayalet', 'Duvardan geçme', o.oyuncu.hayalet) + c('aninda', 'Anında kırma', !!o.etkilesim.aninda) + c('sinirsiz', 'Sınırsız', !!o.envanter.sinirsiz) +
      '<span class="gelAyrac"></span><button type="button" data-k="zaman ogle">Gündüz</button><button type="button" data-k="zaman gece">Gece</button><button type="button" data-k="oldur dusman">Düşmanları kaldır</button><button type="button" data-k="kaydet">Kaydet</button>';
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
      if (b.dataset.bekle) { delete b.dataset.bekle; b.textContent = b.dataset.eski; this.k(d.onay); }
      else { b.dataset.bekle = '1'; b.dataset.eski = b.textContent; b.textContent = 'Onaylamak için tekrar tıklayınız'; setTimeout(() => { if (b.isConnected && b.dataset.bekle) { delete b.dataset.bekle; b.textContent = b.dataset.eski; } }, 2500); }
    }
    else if (d.ver) this.k(`ver ${d.ver} ${e.shiftKey ? 64 : this.adet}`);
    else if (d.adet) { this.adet = +d.adet; this.ses.tik(); this.ciz(); }
    else if (d.kat) { this.kat = d.kat; this.ses.tik(); this.ciz(); }
    else if (d.set) {
      if (!this.izin(o)) return;
      const s = SETLER[d.set]; let sigmayan = 0;
      for (const [i, n] of s.esya) if (ESYALAR[i]) sigmayan += o.envanter.ekle(i, n);
      this.ses.tik(); this.mesaj(`${s.ad} seti verildi.${sigmayan ? ` ${sigmayan} eşya sığmadı.` : ''}`, 'tamam');
    }
    else if (d.dogur) this.k(`dogur ${d.dogur} ${this.dogurAdet}`);
    else if (d.gun) this.k(`gun ${$('#gelGun').value}`);
    else if (d.kesfet) this.k(`kesfet ${this.kesifR}`);
    else if (d.harita) this.arayuz.haritaAc();
    else if (d.konsol) this.arayuz.konsolAc();
    else if (d.git) { const x = $('#gelX').value, y = $('#gelY').value, z = $('#gelZ').value; this.k(y === '' ? `isinla ${x} ${z}` : `isinla ${x} ${y} ${z}`); }
    else if (d.yer) { const y = o.yerler[+d.yer]; if (y) this.k(`isinla ${y.x} ${y.z}`); }
    else if (d.kopya) { if (navigator.clipboard) navigator.clipboard.writeText(String(o.tohum)).catch(() => {}); this.ses.tik(); this.mesaj('Tohum panoya kopyalandı.', 'tamam'); }
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
    else if (r === 'fov') this.arayuz.fovAyarla(v);
  }
  degisti(e) {
    const t = e.target, o = this.oyun(); if (!o) return;
    const r = t.dataset.r, a = t.dataset.a, v = +t.value;
    if (r === 'saat') this.k(`zaman ${v}`);
    else if (r === 'zhiz') this.k(`zaman hiz ${v}`);
    else if (r === 'gorus') this.k(`gorus ${v}`);
    if (!a) return;
    const acik = t.checked;
    const geri = m => { t.checked = !acik; this.mesaj(m, 'hata'); };
    const dogrudan = (nesne, alan, ad) => { if (!this.izin(o)) { t.checked = !acik; return; } nesne[alan] = acik; this.ses.tik(); this.mesaj(`${ad} ${acik ? 'açık' : 'kapalı'}.`, 'tamam'); };
    if (a === 'olumsuz' || a === 'ucus') { const n = a === 'olumsuz' ? o.hayatta : o.oyuncu; if (!!n[a] !== acik) this.k(a); if (!!n[a] !== acik) t.checked = !!n[a]; }
    else if (a === 'hayalet') { dogrudan(o.oyuncu, 'hayalet', 'Duvardan geçme'); if (o.oyuncu.hayalet && !o.oyuncu.ucus) o.oyuncu.ucus = true; }
    else if (a === 'aninda') dogrudan(o.etkilesim, 'aninda', 'Anında kırma');
    else if (a === 'sinirsiz') dogrudan(o.envanter, 'sinirsiz', 'Sınırsız eşya');
    else if (a === 'dogurma' || a === 'donmus') {
      if (o.istemci) { geri('Çok oyunculu istemcide canlıları sunucu yönetir.'); return; }
      dogrudan(o.varliklar, a === 'dogurma' ? 'dogurmaKapali' : 'donmus', a === 'dogurma' ? 'Canlı doğmasını durdurma' : 'Canlıları dondurma');
    }
    else if (a === 'tel') { this.sahne.opakMalzeme.wireframe = acik; this.sahne.suMalzeme.wireframe = acik; this.ses.tik(); }
    else if (a === 'el') { this.sahne.el.visible = !acik; }
    else if (a === 'hud') { document.body.classList.toggle('gostergesiz', acik); }
    else if (a === 'fps') this.arayuz.fpsAc(acik);
    else if (a === 'f3') this.arayuz.hataAc(acik);
    else if (a === 'mini') this.arayuz.miniAc(acik);
    this.hizliCiz(o);
    if (this.sekme === 'oyuncu') for (const el of $('#gelIcerik').querySelectorAll('input[data-a]')) { const k = el.dataset.a; el.checked = k === 'olumsuz' ? !!o.hayatta.olumsuz : k === 'ucus' ? !!o.oyuncu.ucus : k === 'hayalet' ? !!o.oyuncu.hayalet : k === 'aninda' ? !!o.etkilesim.aninda : k === 'sinirsiz' ? !!o.envanter.sinirsiz : el.checked; }
  }

  /* ---------- Canlı bilgiler ---------- */
  guncelle(dt) {
    /* Gerçek kare süresi (oyun döngüsündeki dt üst sınırlıdır) */
    const simdi = performance.now();
    if (this.sonKare) this.kareler[this.kareSira++ % this.kareler.length] = Math.min(250, simdi - this.sonKare);
    this.sonKare = simdi;
    if (!this.acik) return;
    this.sayac -= dt;
    if (this.sayac > 0) return;
    this.sayac = 0.3;
    const o = this.oyun(); if (!o) return;
    if (this.sekme === 'bilgi') { this.tabloYaz(o); this.grafikCiz(); }
    else if (this.sekme === 'canli') this.sayimYaz(o);
  }
  sayimYaz(o) {
    const el = $('#gelSayim'); if (!el) return;
    const say = {};
    for (const v of o.varliklar.liste) say[v.tur.ad] = (say[v.tur.ad] || 0) + 1;
    el.innerHTML = '<b>Çevrede:</b> ' + (Object.entries(say).map(([a, n]) => `<span>${esc(a)} <i>${n}</i></span>`).join('') || 'canlı yok');
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
  tabloYaz(o) {
    const el = $('#gelTablo'); if (!el) return;
    const P = o.oyuncu.konum, k = o.dunya.uretici.kolon(Math.floor(P.x), Math.floor(P.z), {}), V = o.varliklar.liste, m = performance.memory, inf = this.sahne.cizici.info;
    const l = [...this.kareler].filter(x => x > 0), ort = l.reduce((a, x) => a + x, 0) / Math.max(1, l.length), enK = Math.max(...l, 0);
    const h = o.etkilesim.isin(o.oyuncu.gozKonumu(), o.oyuncu.bakisYonu());
    const satir = [
      ['Kare hızı', `${$('#fps').textContent || '-'} · ortalama ${ort.toFixed(1)} ms · en kötü ${enK.toFixed(1)} ms`],
      ['Çizim', `${inf.render.calls} çağrı · ${Math.round(inf.render.triangles / 1000)} bin üçgen · ${inf.memory.geometries} geometri · ${inf.memory.textures} doku`],
      ['Konum', `X ${P.x.toFixed(1)} · Y ${P.y.toFixed(1)} · Z ${P.z.toFixed(1)} · parça ${Math.floor(P.x / PB)}, ${Math.floor(P.z / PB)}`],
      ['Biyom / zemin', `${BIYOMLAR[k.b]} · ${k.h}`],
      ['Bakılan blok', h ? `${BLOKLAR[h.id].ad} (${h.id}) · ${h.x}, ${h.y}, ${h.z}` : '-'],
      ['Zaman', `${o.gun}. gün · ${$('#saatDeger').textContent} · hız ${o.zamanHizi ?? 1}×`],
      ['Canlılar', `${V.length} (düşman ${V.filter(v => v.tur.dusman).length}, hayvan ${V.filter(v => !v.tur.dusman && !v.tur.su && !v.tur.koylu).length}, deniz ${V.filter(v => v.tur.su).length}, köylü ${V.filter(v => v.tur.koylu).length})`],
      ['Ok / yerde eşya / tekne', `${o.varliklar.oklar.length} / ${o.dusenler.liste.length} / ${o.tekneler.liste.length}`],
      ['Yüklü parça', `${o.dunya.parcalar.size} (görüş ${o.dunya.gorus}) · ışık kaynağı ${o.dunya.mesaleler.size}`],
      ['Harita', `${o.harita.parcalar.size} parça · ${(o.harita.alan / 1e6).toFixed(2).replace('.', ',')} km² · ${(o.yerler || []).length} işaret`],
      ['Blok değişikliği', String([...o.dunya.degisiklikler.values()].reduce((a, d) => a + d.size, 0))],
      ['Bellek', m ? `${Math.round(m.usedJSHeapSize / 1048576)} / ${Math.round(m.jsHeapSizeLimit / 1048576)} MB` : 'tarayıcı bildirmiyor'],
      ['Ağ', o.ag ? `${o.istemci ? 'istemci' : 'sunucu'} · ${o.ag.oyuncuListesi().length} oyuncu${o.ag.kod ? ' · kod ' + o.ag.kod : ''}` : 'tek oyunculu'],
      ['Modlar', [o.hayatta.olumsuz && 'ölümsüz', o.oyuncu.ucus && 'uçuyor', o.oyuncu.hayalet && 'duvardan geçme', o.etkilesim.aninda && 'anında kırma', o.envanter.sinirsiz && 'sınırsız eşya', o.oyuncu.hizCarpani !== 1 && `hız ${o.oyuncu.hizCarpani}×`, o.varliklar.dogurmaKapali && 'doğma kapalı', o.varliklar.donmus && 'canlılar donuk', o.komutlar && 'komutlar açık'].filter(Boolean).join(' · ') || '-']
    ];
    el.innerHTML = satir.map(([a, b]) => `<tr><th>${a}</th><td>${esc(b)}</td></tr>`).join('');
  }
}
