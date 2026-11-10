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
    const anahtar = h.can + '|' + h.aclik + '|' + h.oksijen + '|' + suda + '|' + zp + '|' + zehir;
    if (anahtar === this.son.durum) return;
    if (this.son.can != null && h.can < this.son.can) { const c = $('#canlar'); c.classList.remove('titre'); void c.offsetWidth; c.classList.add('titre'); }
    this.son.durum = anahtar; this.son.can = h.can;
    const sira = (deger, dolu, yarim, bos) => { let s = ''; for (let i = 0; i < 10; i++) { const v = deger - i * 2; s += `<img src="${v >= 2 ? dolu : v === 1 ? yarim : bos}" alt="">`; } return s; };
    $('#canlar').innerHTML = sira(h.can, IMG.kalp, IMG.kalpYarim, IMG.kalpBos);
    $('#canlar').classList.toggle('az', h.can <= 4);
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
    for (let tur = -1; tur <= 1; tur++) for (let a = 0; a < 360; a += 15) {
      const x = (tur * 360 + a) * 3;
      const y = yonler[a];
      h += y ? `<span class="${y.length === 1 ? 'ana' : ''}" style="left:${x}px">${y}</span>` : `<span class="ara" style="left:${x}px">|</span>`;
    }
    s.innerHTML = h;
  }
  /* yaw: 0 = kuzey (-z) */
  pusula(yaw) {
    let a = (-yaw * 180 / Math.PI) % 360; if (a < 0) a += 360;
    $('#pusulaSerit').style.transform = `translateX(${180 - a * 3}px)`;
  }
  saat(z, gun) {
    const dk = Math.floor(((z * 24 + 6) % 24) * 60);
    const t = String(Math.floor(dk / 60)).padStart(2, '0') + ':' + String(dk % 60).padStart(2, '0');
    if (t !== this.son.saat) { this.son.saat = t; $('#saatDeger').textContent = t; }
    if (gun !== this.son.gun) { this.son.gun = gun; $('#gunDeger').textContent = gun + '. gün'; }
  }
  /* Bakılan veya son vurulan canlının adı ve canı */
  hedef(v) {
    const k = $('#hedefBilgi');
    if (!v) { if (!k.hidden) k.hidden = true; return; }
    k.hidden = false;
    const a = v.tur.ad + (v.ofkeli ? ' (öfkeli)' : '');
    if ($('#hedefAd').textContent !== a) $('#hedefAd').textContent = a;
    $('#hedefCan').style.width = Math.max(0, v.can / v.tur.can * 100).toFixed(0) + '%';
    k.classList.toggle('dusman', !!(v.tur.dusman || v.ofkeli));
  }
  hasarParla() { const e = $('#hasarParla'); e.classList.add('acik'); setTimeout(() => e.classList.remove('acik'), 120); }
  suAlti(acik) { $('#suAlti').classList.toggle('acik', acik); }
}
