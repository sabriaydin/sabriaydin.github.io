/* HungerMan - oyun içi gösterge: hızlı erişim çubuğu, can / açlık / oksijen, pusula, saat, bildirimler */
import { simge } from '../grafik/doku.js';
import { ESYALAR, maksDayanim } from '../bloklar.js';

const $ = s => document.querySelector(s);

/* 9 x 9 piksel küçük simgeler */
function minik(desen, renkler) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 9;
  const ctx = cv.getContext('2d');
  desen.forEach((satir, y) => [...satir].forEach((ch, x) => { if (renkler[ch]) { ctx.fillStyle = renkler[ch]; ctx.fillRect(x, y, 1, 1); } }));
  return cv.toDataURL();
}
const KALP = ['.kk...kk.', 'kaak.kaak', 'kabaakaak', 'kaaaaaaak', 'kaaaaaaak', '.kaaaaak.', '..kaaak..', '...kak...', '....k....'];
const KALP_YARIM = ['.kk...kk.', 'kaak.kddk', 'kabaakddk', 'kaaaadddk', 'kaaaadddk', '.kaaaddk.', '..kaadk..', '...kak...', '....k....'];
const BUT = ['......kk.', '.....kbbk', '....kbbk.', '..kkaak..', '.kaaaak..', 'kaaaaak..', 'kaaaak...', 'kaaak....', '.kkk.....'];
const BUT_YARIM = ['......kk.', '.....kbbk', '....kbbk.', '..kkddk..', '.kaaddk..', 'kaaaddk..', 'kaaadk...', 'kaaak....', '.kkk.....'];
const KABARCIK = ['..kkkk...', '.kbbaak..', 'kbbaaaak.', 'kbaaaaak.', 'kaaaaaak.', 'kaaaaaak.', '.kaaaak..', '..kkkk...', '.........'];
const ZIRH = ['kk.....kk', 'kak...kak', 'kaakkkaak', 'kabaaaaak', '.kaaaaak.', '.kaaaaak.', '.kaaaaak.', '.kaaaaak.', '.kkkkkkk.'];
const ZIRH_YARIM = ['kk.....kk', 'kak...kdk', 'kaakkkddk', 'kabaaddk.', '.kaaaddk.', '.kaaaddk.', '.kaaaddk.', '.kaaaddk.', '.kkkkkkk.'];
const IMG = {
  zirh: minik(ZIRH, { k: '#151515', a: '#c9ced6', b: '#ffffff' }),
  zirhYarim: minik(ZIRH_YARIM, { k: '#151515', a: '#c9ced6', b: '#ffffff', d: '#3a3d42' }),
  zirhBos: minik(ZIRH, { k: '#151515', a: '#3a3d42', b: '#4a4d52' }),
  kalp: minik(KALP, { k: '#1a0606', a: '#e3352e', b: '#ffb3ad' }),
  kalpYarim: minik(KALP_YARIM, { k: '#1a0606', a: '#e3352e', b: '#ffb3ad', d: '#3b1513' }),
  kalpBos: minik(KALP, { k: '#1a0606', a: '#3b1513', b: '#4a1d1a' }),
  but: minik(BUT, { k: '#1c0f05', a: '#c47a35', b: '#efe3cf' }),
  butYarim: minik(BUT_YARIM, { k: '#1c0f05', a: '#c47a35', b: '#efe3cf', d: '#3d2612' }),
  butBos: minik(BUT, { k: '#1c0f05', a: '#3d2612', b: '#5a4a39' }),
  kabarcik: minik(KABARCIK, { k: '#0b2a4a', a: '#4aa3ff', b: '#d8eeff' })
};

export class Hud {
  constructor(envanter, hayatta) {
    this.env = envanter; this.hay = hayatta;
    this.son = {};
    this.cubuk = $('#cubuk');
    this.cubuk.innerHTML = Array.from({ length: 9 }, (_, i) => `<div class="yuva" data-i="${i}"><span class="no">${i + 1}</span></div>`).join('');
    this.esyaZaman = null;
    this.pusulaKur();
  }

  yuvaIc(s) {
    if (!s) return '';
    const e = ESYALAR[s.id];
    let h = `<img src="${simge(s.id).url}" alt="">`;
    if (s.adet > 1) h += `<span class="adet">${s.adet}</span>`;
    const md = maksDayanim(e);
    if (s.dayanim != null && md && s.dayanim < md) {
      const o = s.dayanim / md;
      h += `<span class="day"><i style="width:${(o * 100).toFixed(0)}%;background:hsl(${Math.round(o * 120)},80%,48%)"></i></span>`;
    }
    return h;
  }
  cubukCiz() {
    [...this.cubuk.children].forEach((el, i) => {
      el.classList.toggle('secili', i === this.env.secili);
      const s = this.env.yuvalar[i];
      el.innerHTML = `<span class="no">${i + 1}</span>` + this.yuvaIc(s);
    });
  }
  esyaAdiGoster() {
    const s = this.env.seciliYuva(), el = $('#esyaAdi');
    el.textContent = s ? ESYALAR[s.id].ad : '';
    el.classList.add('acik');
    clearTimeout(this.esyaZaman);
    this.esyaZaman = setTimeout(() => el.classList.remove('acik'), 1600);
  }

  durumCiz(suda) {
    const h = this.hay;
    const zp = this.env.zirhPuani ? this.env.zirhPuani() : 0, zehir = h.zehir > 0;
    const anahtar = h.can + '|' + h.aclik + '|' + h.oksijen + '|' + suda + '|' + zp + '|' + zehir + '|' + (h.agu > 0);
    if (anahtar === this.son.durum) return;
    if (this.son.can != null && h.can < this.son.can) { const c = $('#canlar'); c.classList.remove('titre'); void c.offsetWidth; c.classList.add('titre'); }
    this.son.durum = anahtar; this.son.can = h.can;
    const sira = (deger, dolu, yarim, bos) => { let s = ''; for (let i = 0; i < 10; i++) { const v = deger - i * 2; s += `<img src="${v >= 2 ? dolu : v === 1 ? yarim : bos}" alt="">`; } return s; };
    $('#canlar').innerHTML = sira(h.can, IMG.kalp, IMG.kalpYarim, IMG.kalpBos);
    $('#canlar').classList.toggle('az', h.can <= 4);
    $('#canlar').classList.toggle('zehirli', h.agu > 0);
    $('#aclik').innerHTML = sira(h.aclik, IMG.but, IMG.butYarim, IMG.butBos);
    $('#aclik').classList.toggle('zehirli', zehir);
    $('#zirhSira').innerHTML = zp > 0 ? sira(zp, IMG.zirh, IMG.zirhYarim, IMG.zirhBos) : '';
    const o = $('#oksijen');
    if (suda || h.oksijen < 10) { let s = ''; for (let i = 0; i < h.oksijen; i++) s += `<img src="${IMG.kabarcik}" alt="">`; o.innerHTML = s; o.hidden = false; }
    else o.hidden = true;
  }

  bildirim(metin, id) {
    const b = document.createElement('div');
    b.className = 'bildirim' + (id ? ' esya' : '');
    b.innerHTML = (id ? `<img src="${simge(id).url}" alt="">` : '') + `<span></span>`;
    b.querySelector('span').textContent = metin;
    const kap = $('#bildirimler');
    kap.appendChild(b);
    while (kap.children.length > 4) kap.firstChild.remove();
    setTimeout(() => b.remove(), 3300);
  }

  pusulaKur() {
    const s = $('#pusulaSerit');
    const yonler = { 0: 'K', 45: 'KD', 90: 'D', 135: 'GD', 180: 'G', 225: 'GB', 270: 'B', 315: 'KB' };
    let h = '';
    /* Şerit -360°..720° aralığını kapsar; 1° = 3 piksel */
    for (let a = -360; a < 720; a += 15) {
      const x = (a + 360) * 3, n = ((a % 360) + 360) % 360, y = yonler[n];
      if (y) h += `<span class="ana${n === 0 ? ' kuzey' : ''}" style="left:${x}px">${y}</span>`;
      else h += `<span class="ara" style="left:${x}px">${n}</span>`;
    }
    s.innerHTML = h;
  }
  /* yaw: 0 = kuzey (-z); isaretler: [{ aci (0 = kuzey, derece), sinif, metin, baslik, mesafe, kenar }] */
  pusula(yaw, isaretler) {
    let a = (-yaw * 180 / Math.PI) % 360; if (a < 0) a += 360;
    const yari = $('#pusula').clientWidth / 2 || 210;
    $('#pusulaSerit').style.transform = `translateX(${yari - (a + 360) * 3}px)`;
    const ad = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'][Math.round(a / 45) % 8];
    const derece = `${ad} · ${Math.round(a) % 360}°`;
    if (derece !== this.son.derece) { this.son.derece = derece; $('#pusulaDerece').textContent = derece; }
    if (!isaretler) return;
    const sinir = yari / 3 - 6;
    let h = '';
    for (const m of isaretler) {
      let f = ((m.aci - a + 540) % 360) - 180;
      let kenar = false;
      if (Math.abs(f) > sinir) { if (!m.kenar) continue; f = Math.sign(f) * sinir; kenar = true; }
      const mes = m.mesafe != null ? `<small>${m.mesafe < 1000 ? Math.round(m.mesafe) : (m.mesafe / 1000).toFixed(1) + 'b'}</small>` : '';
      h += `<span class="${m.sinif}${kenar ? ' kenar' : ''}" style="left:${yari + f * 3}px${m.renk ? ';color:' + m.renk : ''}" title="${m.baslik || ''}"><i>${m.metin}</i>${mes}</span>`;
    }
    if (h !== this.son.isaret) { this.son.isaret = h; $('#pusulaIsaret').innerHTML = h; }
  }
  gorevIzle(satirlar) {
    const h = satirlar.map(q => `<div class="${q.bitti ? 'bitti' : ''}"><b>${q.metin}</b><span>${q.durum}</span></div>`).join('');
    if (h !== this.son.gorev) { this.son.gorev = h; $('#gorevIzleyici').innerHTML = h; }
  }
  /* z: gün zamanı (0 = 06:00), konum: alt satır metni */
  saat(z, gun, konum) {
    const saatOndalik = (z * 24 + 6) % 24;
    const dk = Math.floor(saatOndalik * 60);
    const t = String(Math.floor(dk / 60)).padStart(2, '0') + ':' + String(dk % 60).padStart(2, '0');
    if (t !== this.son.saat) { this.son.saat = t; $('#saatDeger').textContent = t; }
    const h = saatOndalik;
    const evre = h >= 5 && h < 7 ? 'Şafak' : h < 11 && h >= 7 ? 'Sabah' : h >= 11 && h < 14 ? 'Öğle' : h >= 14 && h < 17 ? 'İkindi' : h >= 17 && h < 19.5 ? 'Akşam' : 'Gece';
    const gt = `${gun}. gün · ${evre}`;
    if (gt !== this.son.gun) { this.son.gun = gt; $('#gunDeger').textContent = gt; }
    const sinif = evre === 'Gece' ? 'gece' : evre === 'Şafak' ? 'safak' : evre === 'Akşam' ? 'aksam' : 'gunduz';
    if (sinif !== this.son.evre) { this.son.evre = sinif; $('#saat').className = sinif; }
    /* Gök yayında güneş (gündüz) veya ay (gece) */
    const gunduz = z < 0.5, aci = (gunduz ? z : z - 0.5) * Math.PI * 2;
    const x = 38 - Math.cos(aci) * 32, y = 36 - Math.sin(aci) * 32;
    $('#gokCisim').setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    /* Gece uyarısı */
    let uyari = '', yakin = false;
    if (z >= 0.43 && z < 0.5) { const kalan = Math.ceil((0.5 - z) * 24 * 60); uyari = `Gece yaklaşıyor · ${kalan} dk`; yakin = true; }
    else if (z >= 0.5 && z < 0.98) uyari = 'Gece · Canavarlar ortalıkta';
    if (uyari !== this.son.uyari) { this.son.uyari = uyari; const u = $('#geceUyari'); u.hidden = !uyari; u.textContent = uyari; u.classList.toggle('yakin', yakin); }
    if (konum != null && konum !== this.son.konum) { this.son.konum = konum; $('#konumDeger').textContent = konum; }
  }

  /* Bakılan veya son vurulan canlının adı ve canı */
  hedef(v) {
    const k = $('#hedefBilgi');
    if (!v) { if (!k.hidden) k.hidden = true; return; }
    k.hidden = false;
    const a = (v.ad || v.tur.ad) + (v.ofkeli ? ' (öfkeli)' : '');
    if ($('#hedefAd').textContent !== a) $('#hedefAd').textContent = a;
    $('#hedefCan').style.width = Math.max(0, v.can / v.tur.can * 100).toFixed(0) + '%';
    k.classList.toggle('dusman', !!(v.tur.dusman || v.ofkeli));
  }
  hasarParla() { const e = $('#hasarParla'); e.classList.add('acik'); setTimeout(() => e.classList.remove('acik'), 120); }
  suAlti(acik) { $('#suAlti').classList.toggle('acik', acik); }
}
