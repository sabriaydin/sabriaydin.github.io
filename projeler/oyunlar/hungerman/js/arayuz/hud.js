/* HungerMan - oyun içi gösterge: hızlı erişim çubuğu, can / açlık / oksijen, pusula, saat, bildirimler */
import { simge } from '../grafik/doku.js';
import { ESYALAR, maksDayanim, ETKILER } from '../bloklar.js';
import { ikon, IKON_RENK } from './ikonlar.js';

/* Pusula yazı tipleri: okunaklı, düz bir yazı tipi (piksel yazı tipi küçük boyutta zor okunur) */
const PY = "'Segoe UI', Rubik, Roboto, 'Helvetica Neue', Arial, sans-serif";
const PF = { ana: `700 13px ${PY}`, ara: `600 11px ${PY}`, sayi: `500 10px ${PY}`, mesafe: `600 10px ${PY}` };

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

  /* Pusula tuvalde çizilir: üst şeritte yönler ve dereceler, alt şeritte işaretler, en altta çentikler */
  pusulaKur() {
    this.pTuval = $('#pusulaTuval');
    this.pCtx = this.pTuval.getContext('2d');
    this.pListe = [];
  }
  /* yaw: 0 = kuzey (-z); isaretler: [{ aci (0 = kuzey, derece), sinif, baslik, mesafe, kenar, renk }] */
  pusula(yaw, isaretler) {
    let a = (-yaw * 180 / Math.PI) % 360; if (a < 0) a += 360;
    const ad = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'][Math.round(a / 45) % 8];
    const derece = `${ad} · ${Math.round(a) % 360}°`;
    if (derece !== this.son.derece) { this.son.derece = derece; $('#pusulaDerece').textContent = derece; }
    if (isaretler) this.pListe = isaretler;
    const cv = this.pTuval, r = Math.min(2, devicePixelRatio || 1);
    const W = cv.clientWidth || 440, H = cv.clientHeight || 30;
    if (cv.width !== Math.round(W * r) || cv.height !== Math.round(H * r)) { cv.width = Math.round(W * r); cv.height = Math.round(H * r); }
    const ctx = this.pCtx, PX = 3, M = W / 2;
    ctx.setTransform(r, 0, 0, r, 0, 0);
    ctx.clearRect(0, 0, W, H);
    /* Zemin */
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(0.5, 0.5, W - 1, H - 1, 7) : ctx.rect(0.5, 0.5, W - 1, H - 1);
    ctx.fillStyle = 'rgba(12,14,18,.58)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 1; ctx.stroke();
    /* Çentikler ve yazılar */
    const bas = Math.ceil((a - M / PX) / 5) * 5, son = a + M / PX;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let d = bas; d <= son; d += 5) {
      const x = Math.round(M + (d - a) * PX) + 0.5, n = ((d % 360) + 360) % 360;
      const ana = n % 90 === 0, ara = n % 45 === 0, orta = n % 15 === 0;
      const h = ana ? 6 : ara ? 5 : orta ? 3.5 : 2;
      ctx.strokeStyle = ana ? 'rgba(255,255,255,.85)' : ara ? 'rgba(255,255,255,.6)' : orta ? 'rgba(255,255,255,.38)' : 'rgba(255,255,255,.2)';
      ctx.lineWidth = ana ? 1.5 : 1;
      ctx.beginPath(); ctx.moveTo(x, H - 1.5); ctx.lineTo(x, H - 1.5 - h); ctx.stroke();
      if (ana) {
        ctx.font = PF.ana;
        ctx.fillStyle = n === 0 ? '#ff6a5c' : '#ffffff';
        ctx.fillText(['K', 'D', 'G', 'B'][n / 90], x, 10.5);
      } else if (ara) {
        ctx.font = PF.ara;
        ctx.fillStyle = 'rgba(255,255,255,.8)';
        ctx.fillText(['KD', 'GD', 'GB', 'KB'][(n - 45) / 90], x, 10.5);
      } else if (n % 30 === 0) {
        ctx.font = PF.sayi;
        ctx.fillStyle = 'rgba(255,255,255,.5)';
        ctx.fillText(String(n), x, 10.5);
      }
    }
    /* Orta gösterge */
    ctx.fillStyle = '#ff6a5c';
    ctx.beginPath(); ctx.moveTo(M - 4, 0); ctx.lineTo(M + 4, 0); ctx.lineTo(M, 5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,106,92,.35)'; ctx.fillRect(M - 0.5, 5, 1, H - 6);
    /* İşaretler: alt şeritte simge ve uzaklık */
    const sinir = M - 14, y = H - 8;
    const l = [];
    for (const m of this.pListe) {
      let f = (((m.aci - a + 540) % 360) - 180) * PX, kenar = false;
      if (Math.abs(f) > sinir) { if (!m.kenar) continue; f = Math.sign(f) * sinir; kenar = true; }
      l.push([f, kenar, m]);
    }
    /* Yakın işaretler önceliklidir: uzaklık yazısı başka bir işaretle çakışırsa gösterilmez */
    l.sort((p, q) => (p[2].mesafe || 0) - (q[2].mesafe || 0));
    ctx.font = PF.mesafe; ctx.textBaseline = 'middle';
    const dolu = [], cizilecek = [];
    for (const [f, kenar, m] of l) {
      const x = M + f;
      let t = null;
      if (!kenar && m.mesafe != null) {
        const yaz = m.mesafe < 1000 ? String(Math.round(m.mesafe)) : (m.mesafe / 1000).toFixed(1) + 'b';
        const a0 = x + 8, a1 = a0 + ctx.measureText(yaz).width;
        if (!dolu.some(([p, q]) => a0 < q + 2 && a1 > p - 2)) { t = yaz; dolu.push([a0, a1]); }
      }
      dolu.push([x - 7, x + 7]);
      cizilecek.push([x, f, kenar, m, t]);
    }
    for (let i = cizilecek.length - 1; i >= 0; i--) {
      const [x, f, kenar, m, t] = cizilecek[i];
      ikon(ctx, m.sinif, x, y, 5, m.renk || IKON_RENK[m.sinif] || '#fff', kenar ? 0.6 : 1);
      if (kenar) {
        ctx.fillStyle = 'rgba(255,255,255,.7)'; const s = Math.sign(f);
        ctx.beginPath(); ctx.moveTo(x + s * 9, y); ctx.lineTo(x + s * 5.5, y - 3); ctx.lineTo(x + s * 5.5, y + 3); ctx.closePath(); ctx.fill();
      } else if (t) {
        ctx.textAlign = 'left'; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.lineWidth = 2.5;
        ctx.strokeText(t, x + 8, y + 0.5); ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.fillText(t, x + 8, y + 0.5);
        ctx.textAlign = 'center';
      }
    }
  }
  gorevIzle(satirlar) {
    const h = satirlar.map(q => `<div class="${q.bitti ? 'bitti' : ''}"><b>${q.metin}</b><span>${q.durum}</span></div>`).join('');
    if (h !== this.son.gorev) { this.son.gorev = h; $('#gorevIzleyici').innerHTML = h; }
  }
  /* z: gün zamanı (0 = 06:00), konum: alt satır metni */
  saat(z, gun, konum, firtina) {
    const saatOndalik = (z * 24 + 6) % 24;
    const dk = Math.floor(saatOndalik * 60);
    const t = String(Math.floor(dk / 60)).padStart(2, '0') + ':' + String(dk % 60).padStart(2, '0');
    if (t !== this.son.saat) { this.son.saat = t; $('#saatDeger').textContent = t; }
    const h = saatOndalik;
    const evre = h >= 5 && h < 7 ? 'Şafak' : h < 11 && h >= 7 ? 'Sabah' : h >= 11 && h < 14 ? 'Öğle' : h >= 14 && h < 17 ? 'İkindi' : h >= 17 && h < 19.5 ? 'Akşam' : 'Gece';
    const gt = `${gun}. gün`;
    if (gt !== this.son.gun) { this.son.gun = gt; $('#gunDeger').textContent = gt; }
    if (evre !== this.son.evreAd) { this.son.evreAd = evre; $('#evreDeger').textContent = evre; }
    const sinif = evre === 'Gece' ? 'gece' : evre === 'Şafak' ? 'safak' : evre === 'Akşam' ? 'aksam' : 'gunduz';
    if (sinif !== this.son.evre) { this.son.evre = sinif; $('#saat').className = sinif; }
    /* Halka: gündüz ya da gecenin ne kadarının geçtiği */
    const gunduz = z < 0.5, oran = gunduz ? z / 0.5 : (z - 0.5) / 0.5;
    const yay = (50.27 * (1 - oran)).toFixed(2);
    if (yay !== this.son.yay) { this.son.yay = yay; $('#gunYay').setAttribute('stroke-dashoffset', yay); }
    /* Gece uyarısı */
    let uyari = '', yakin = false;
    if (z >= 0.43 && z < 0.5) { const kalan = Math.ceil((0.5 - z) * 24 * 60); uyari = `Gece yaklaşıyor · ${kalan} dk`; yakin = true; }
    else if (z >= 0.5 && z < 0.98) uyari = 'Canavarlar ortalıkta';
    else if (firtina) uyari = 'Fırtına · Canavarlar gündüz de çıkar';
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
  /* Deneyim çubuğu: seviye ve bir sonraki seviyeye ilerleme */
  xpCiz(h) {
    const L = h.seviye, o = h.ilerleme, a = L + '|' + o.toFixed(3);
    if (a === this.son.xp) return;
    this.son.xp = a;
    $('#xpDolu').style.width = (o * 100).toFixed(1) + '%';
    $('#xpSeviye').textContent = L > 0 ? String(L) : '';
  }
  /* İksir etkileri: kalan süreleriyle sol üstte */
  etkilerCiz(etkiler) {
    const h = Object.entries(etkiler).filter(([k, v]) => ETKILER[k] && v > 0).map(([k, v]) => {
      const s = Math.ceil(v), t = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      return `<div class="etki${s <= 15 ? ' az' : ''}" style="--r:${ETKILER[k].renk}"><i></i><span>${ETKILER[k].ad}</span><b>${t}</b></div>`;
    }).join('');
    if (h !== this.son.etki) { this.son.etki = h; $('#etkiler').innerHTML = h; }
  }
  /* Hava durumu simgesi (saat göstergesinde): tur 0 yağış yok, 1 yağmur, 2 kar */
  hava(durum, tur) {
    const a = durum + '|' + tur;
    if (a === this.son.hava) return;
    this.son.hava = a;
    const el = $('#havaDeger');
    if (durum === 'acik') { el.hidden = true; return; }
    const bulut = '<path d="M5 11.5h8.2a2.8 2.8 0 0 0 .3-5.6A4 4 0 0 0 5.9 5.4 3 3 0 0 0 5 11.5z" fill="currentColor"/>';
    const alt = durum === 'firtina' ? '<path d="M9.6 11.6 7.6 14.6h2l-1 2.6 3-3.6H9.7l1.2-2z" fill="#ffd257"/>'
      : tur === 2 ? '<circle cx="6" cy="14" r="1" fill="#fff"/><circle cx="9.5" cy="15.5" r="1" fill="#fff"/><circle cx="13" cy="14" r="1" fill="#fff"/>'
      : '<path d="M6 13.4l-.8 2M9.6 13.4l-.8 2M13.2 13.4l-.8 2" stroke="#8fc0ff" stroke-width="1.3" stroke-linecap="round"/>';
    el.innerHTML = `<svg viewBox="0 0 18 18" aria-hidden="true">${bulut}${alt}</svg>${durum === 'firtina' ? 'Fırtına' : tur === 2 ? 'Kar' : tur === 0 ? 'Bulutlu' : 'Yağmur'}`;
    el.hidden = false;
  }
  hasarParla() { const e = $('#hasarParla'); e.classList.add('acik'); setTimeout(() => e.classList.remove('acik'), 120); }
  suAlti(acik) { $('#suAlti').classList.toggle('acik', acik); }
}
