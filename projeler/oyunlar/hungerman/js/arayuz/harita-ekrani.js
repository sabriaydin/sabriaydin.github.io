/* HungerMan - büyük harita ekranı (M) ve mini harita
   Keşfedilen bölgeler ölçeklenerek çizilir; köyler, limanlar, doğma / ölüm noktaları, görev hedefleri,
   oyuncunun eklediği işaretler ve (çok oyunculuda) diğer oyuncular simgelerle gösterilir. */
import { koylerAlan } from '../dunya/koy-uretici.js';
import { BIYOMLAR } from '../dunya/uretici.js';
import { BOLGE_BLOK } from '../harita/harita.js';
import { ikon, okIkon, yazi, IKON_RENK } from './ikonlar.js';
import { RENKLER } from '../ag/uzak-oyuncular.js';
import { DUNYA_SINIRI, PB } from '../sabitler.js';

const $ = s => document.querySelector(s);
const OLCEKLER = [0.125, 0.25, 0.5, 1, 2, 3, 4, 6, 8];
export const YER_RENKLERI = ['#ffb84d', '#ff6a5c', '#9be38b', '#6fd3ff', '#c792ff', '#f2f2f2'];
export const YER_SINIRI = 30;
const YAZI = "600 12px Rubik, system-ui, sans-serif";
const YAZI_K = "600 11px Rubik, system-ui, sans-serif";

/* Bir alandaki harita işaretleri: [{ tur, x, z, ad, renk, yer }] */
export function haritaIsaretleri(o, x0, z0, x1, z1) {
  const l = [], H = o.harita, s = H.sinir;
  if (s) {
    const ax0 = Math.max(x0, s[0]), az0 = Math.max(z0, s[1]), ax1 = Math.min(x1, s[2]), az1 = Math.min(z1, s[3]);
    if (ax0 <= ax1 && az0 <= az1) for (const k of koylerAlan(o.dunya.uretici, ax0, az0, ax1, az1)) {
      if (H.kesfedildi(k.x, k.z)) l.push({ tur: 'koy', x: k.x, z: k.z, ad: k.ad });
      const L = k.liman;
      if (L && H.kesfedildi(L.iskeleX, L.iskeleZ)) l.push({ tur: 'liman', x: L.iskeleX, z: L.iskeleZ, ad: `${k.ad} limanı` });
    }
  }
  if (o.dogum) l.push({ tur: 'dogum', x: o.dogum.x, z: o.dogum.z, ad: 'Doğma noktası' });
  if (o.olumNoktasi) l.push({ tur: 'olum', x: o.olumNoktasi.x, z: o.olumNoktasi.z, ad: 'Son ölüm noktası' });
  for (const q of o.gorevler.aktif) {
    const h = q.tur === 'mektup' ? q.hedefKoy : o.gorevler.tamamlanabilir(q, o.envanter) ? { x: q.koyX, z: q.koyZ } : null;
    if (h) l.push({ tur: 'gorev', x: h.x, z: h.z, ad: q.kisa });
  }
  for (const y of o.yerler || []) l.push({ tur: 'yer', x: y.x, z: y.z, ad: y.ad, renk: y.renk, yer: y });
  if (o.ag && o.ag.uzak) for (const u of o.ag.uzak.harita.values()) if (!u.ilk && !(u.bayrak & 4)) l.push({ tur: 'oyuncu', x: u.p.x, z: u.p.z, ad: u.ad, renk: u.renk });
  return l;
}

/* Bölgeleri cihaz pikseline yuvarlanmış konumlarla çizer (dikiş oluşmaz) */
function bolgeleriCiz(ctx, H, mx, mz, olcekD, W, Hh) {
  ctx.imageSmoothingEnabled = olcekD < 1;
  const x0 = mx - W / 2 / olcekD, x1 = mx + W / 2 / olcekD, z0 = mz - Hh / 2 / olcekD, z1 = mz + Hh / 2 / olcekD;
  for (let rz = Math.floor(z0 / BOLGE_BLOK); rz <= Math.floor(z1 / BOLGE_BLOK); rz++) for (let rx = Math.floor(x0 / BOLGE_BLOK); rx <= Math.floor(x1 / BOLGE_BLOK); rx++) {
    const cv = H.tuval(rx, rz);
    if (!cv) continue;
    const X = Math.round((rx * BOLGE_BLOK - mx) * olcekD + W / 2), X2 = Math.round(((rx + 1) * BOLGE_BLOK - mx) * olcekD + W / 2);
    const Z = Math.round((rz * BOLGE_BLOK - mz) * olcekD + Hh / 2), Z2 = Math.round(((rz + 1) * BOLGE_BLOK - mz) * olcekD + Hh / 2);
    ctx.drawImage(cv, X, Z, X2 - X, Z2 - Z);
  }
}

export class HaritaEkrani {
  constructor(o) {
    Object.assign(this, o); // ses, kapatIste
    this.acik = false;
    this.kok = $('#haritaEkrani');
    this.tuval = $('#haritaTuval');
    this.ctx = this.tuval.getContext('2d');
    this.olcekNo = 4; this.mx = 0; this.mz = 0;
    this.surukle = null; this.fare = null; this.sayac = 0; this.duzenlenen = null; this.yerRenk = YER_RENKLERI[0];
    this.tuval.addEventListener('mousedown', e => this.bas(e));
    addEventListener('mousemove', e => this.hareket(e));
    addEventListener('mouseup', e => this.birak(e));
    this.tuval.addEventListener('wheel', e => { if (!this.acik) return; e.preventDefault(); this.yakinlas(e.deltaY < 0 ? 1 : -1, e.clientX, e.clientY); }, { passive: false });
    this.tuval.addEventListener('contextmenu', e => { e.preventDefault(); this.sagTik(e); });
    this.tuval.addEventListener('mouseleave', () => { this.fare = null; this.bilgi(); });
    this.kok.querySelector('.haritaDugmeler').addEventListener('click', e => {
      const b = e.target.closest('button[data-h]'); if (!b) return;
      this.ses.tik();
      const h = b.dataset.h;
      if (h === 'yakin') this.yakinlas(1); else if (h === 'uzak') this.yakinlas(-1);
      else if (h === 'ortala') { const p = this.o.oyuncu.konum; this.mx = p.x; this.mz = p.z; this.ciz(); }
      else if (h === 'kapat') this.kapatIste();
    });
    /* İşaret formu */
    $('#yerRenkler').innerHTML = YER_RENKLERI.map(r => `<button type="button" data-r="${r}" style="background:${r}" aria-label="Renk"></button>`).join('');
    $('#yerRenkler').addEventListener('click', e => { const b = e.target.closest('button[data-r]'); if (!b) return; this.yerRenk = b.dataset.r; this.renkIsaretle(); });
    $('#yerAd').addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') this.yerKaydet(); else if (e.key === 'Escape') this.formKapat(); });
    $('#yerKaydet').addEventListener('click', () => this.yerKaydet());
    $('#yerSil').addEventListener('click', () => this.yerSil(this.duzenlenen));
    $('#yerVazgec').addEventListener('click', () => this.formKapat());
    addEventListener('resize', () => { if (this.acik) { this.boyutla(); this.ciz(); } });
    this.lejantKur();
  }

  get olcek() { return OLCEKLER[this.olcekNo]; }
  ac(o) {
    this.o = o; this.acik = true; this.kok.hidden = false;
    const p = o.oyuncu.konum; this.mx = p.x; this.mz = p.z;
    this.formKapat(); this.boyutla(); this.ciz(); this.bilgi();
  }
  kapat() { this.acik = false; this.kok.hidden = true; this.formKapat(); this.surukle = null; }
  boyutla() {
    const r = Math.min(2, devicePixelRatio || 1), w = this.tuval.clientWidth || innerWidth, h = this.tuval.clientHeight || innerHeight;
    this.dpr = r; this.W = w; this.H = h;
    if (this.tuval.width !== Math.round(w * r) || this.tuval.height !== Math.round(h * r)) { this.tuval.width = Math.round(w * r); this.tuval.height = Math.round(h * r); }
  }
  ekranda(x, z) { return [(x - this.mx) * this.olcek + this.W / 2, (z - this.mz) * this.olcek + this.H / 2]; }
  dunyada(sx, sy) { return [(sx - this.W / 2) / this.olcek + this.mx, (sy - this.H / 2) / this.olcek + this.mz]; }
  yerel(e) { const r = this.tuval.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }

  yakinlas(d, cx, cy) {
    const yeni = Math.max(0, Math.min(OLCEKLER.length - 1, this.olcekNo + d));
    if (yeni === this.olcekNo) return;
    let sx = this.W / 2, sy = this.H / 2;
    if (cx != null) { const r = this.tuval.getBoundingClientRect(); sx = cx - r.left; sy = cy - r.top; }
    const [x, z] = this.dunyada(sx, sy);
    this.olcekNo = yeni;
    this.mx = x - (sx - this.W / 2) / this.olcek; this.mz = z - (sy - this.H / 2) / this.olcek;
    this.formKapat(); this.ciz(); this.bilgi();
  }

  /* ---------- Fare ---------- */
  bas(e) {
    if (!this.acik || e.button !== 0) return;
    this.surukle = { x: e.clientX, y: e.clientY, mx: this.mx, mz: this.mz, oynadi: false };
  }
  hareket(e) {
    if (!this.acik) return;
    if (e.target === this.tuval || this.surukle) this.fare = this.yerel(e);
    const s = this.surukle;
    if (s) {
      const dx = e.clientX - s.x, dy = e.clientY - s.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) s.oynadi = true;
      if (s.oynadi) { this.mx = s.mx - dx / this.olcek; this.mz = s.mz - dy / this.olcek; this.formKapat(); this.ciz(); }
    }
    this.bilgi();
  }
  birak(e) {
    const s = this.surukle;
    this.surukle = null;
    if (!this.acik || !s || s.oynadi || e.button !== 0 || e.target !== this.tuval) return;
    const [sx, sy] = this.yerel(e);
    /* Geliştirici: Ctrl + tık ile tıklanan yere ışınlanma (komutlar açıksa) */
    if (e.ctrlKey && this.isinla && this.o.komutlar) { const [x, z] = this.dunyada(sx, sy); this.isinla(Math.floor(x) + 0.5, Math.floor(z) + 0.5); return; }
    const y = this.yerBul(sx, sy);
    if (y) this.formAc(sx, sy, y);
    else {
      const [x, z] = this.dunyada(sx, sy);
      if ((this.o.yerler || []).length >= YER_SINIRI) { this.bilgi(`En çok ${YER_SINIRI} işaret eklenebilir. Sağ tıkla işaret silinir.`); return; }
      this.formAc(sx, sy, null, Math.round(x), Math.round(z));
    }
  }
  sagTik(e) {
    const [sx, sy] = this.yerel(e);
    const y = this.yerBul(sx, sy);
    if (y) this.yerSil(y);
  }
  yerBul(sx, sy) {
    let en = null, enD = 14;
    for (const y of this.o.yerler || []) { const [x, z] = this.ekranda(y.x, y.z); const d = Math.hypot(x - sx, z - 6 - sy); if (d < enD) { enD = d; en = y; } }
    return en;
  }

  /* ---------- İşaret formu ---------- */
  formAc(sx, sy, yer, x, z) {
    this.duzenlenen = yer;
    this.yeniYer = yer ? null : { x, z };
    const f = $('#yerForm');
    f.hidden = false;
    $('#yerBaslik').textContent = yer ? 'İşareti düzenle' : 'Yeni işaret';
    $('#yerKonum').textContent = yer ? `X ${yer.x} · Z ${yer.z}` : `X ${x} · Z ${z}`;
    $('#yerAd').value = yer ? yer.ad : `İşaret ${(this.o.yerler || []).length + 1}`;
    this.yerRenk = yer ? yer.renk : YER_RENKLERI[(this.o.yerler || []).length % YER_RENKLERI.length];
    $('#yerSil').hidden = !yer;
    this.renkIsaretle();
    const w = 240, h = 150;
    f.style.left = Math.max(8, Math.min(this.W - w - 8, sx + 14)) + 'px';
    f.style.top = Math.max(60, Math.min(this.H - h - 8, sy - 20)) + 'px';
    setTimeout(() => { $('#yerAd').focus(); $('#yerAd').select(); }, 0);
  }
  formKapat() { $('#yerForm').hidden = true; this.duzenlenen = null; this.yeniYer = null; }
  get formAcik() { return !$('#yerForm').hidden; }
  renkIsaretle() { for (const b of $('#yerRenkler').children) b.classList.toggle('on', b.dataset.r === this.yerRenk); }
  yerKaydet() {
    const ad = $('#yerAd').value.replace(/\s+/g, ' ').trim().slice(0, 24) || 'İşaret';
    const o = this.o;
    if (!o.yerler) o.yerler = [];
    if (this.duzenlenen) { this.duzenlenen.ad = ad; this.duzenlenen.renk = this.yerRenk; }
    else if (this.yeniYer && o.yerler.length < YER_SINIRI) o.yerler.push({ x: this.yeniYer.x, z: this.yeniYer.z, ad, renk: this.yerRenk });
    this.ses.tik();
    this.formKapat(); this.ciz();
  }
  yerSil(y) {
    const o = this.o;
    if (!y || !o.yerler) return;
    o.yerler = o.yerler.filter(v => v !== y);
    this.ses.tik();
    this.formKapat(); this.ciz(); this.bilgi(`“${y.ad}” işareti silindi.`);
  }

  /* ---------- Bilgi satırı ---------- */
  bilgi(mesaj) {
    const el = $('#haritaBilgi');
    if (mesaj) { el.textContent = mesaj; this.mesajZaman = performance.now(); return; }
    if (this.mesajZaman && performance.now() - this.mesajZaman < 2500) return;
    if (!this.fare || !this.o) { el.textContent = 'Sol tık: işaret ekle veya düzenle · Sağ tık: işareti sil · Tekerlek: yakınlaştır · Sürükle: kaydır'; return; }
    const [x, z] = this.dunyada(this.fare[0], this.fare[1]);
    const X = Math.floor(x), Z = Math.floor(z), p = this.o.oyuncu.konum;
    const k = this.o.harita.kolon(X, Z);
    const d = Math.round(Math.hypot(X + 0.5 - p.x, Z + 0.5 - p.z));
    let yer = k ? (k.su ? `${BIYOMLAR[this.o.dunya.uretici.kolon(X, Z, {}).b]} · Su (derinlik ${k.derinlik})` : `${BIYOMLAR[this.o.dunya.uretici.kolon(X, Z, {}).b]} · Y ${k.h}`) : 'Keşfedilmemiş bölge';
    const m = this.isaretBul(this.fare[0], this.fare[1]);
    if (m) yer = `${m.ad} · ${yer}`;
    el.textContent = `X ${X} · Z ${Z} · ${yer} · ${d} blok uzakta`;
  }
  isaretBul(sx, sy) {
    let en = null, enD = 12;
    for (const m of this.sonIsaretler || []) { const [x, z] = this.ekranda(m.x, m.z); const d = Math.hypot(x - sx, z - sy); if (d < enD) { enD = d; en = m; } }
    return en;
  }

  lejantKur() {
    const l = [['koy', 'Köy'], ['liman', 'Liman'], ['gorev', 'Görev hedefi'], ['dogum', 'Doğma noktası'], ['olum', 'Son ölüm'], ['yer', 'İşaret'], ['oyuncu', 'Oyuncu']];
    const kap = $('#haritaLejant');
    kap.innerHTML = '';
    for (const [t, a] of l) {
      const s = document.createElement('span');
      const c = document.createElement('canvas'); c.width = c.height = 32; c.style.width = c.style.height = '16px';
      ikon(c.getContext('2d'), t, 16, 16, 11, t === 'oyuncu' ? RENKLER[1] : IKON_RENK[t]);
      s.append(c, document.createTextNode(a));
      kap.appendChild(s);
    }
  }

  guncelle(dt) {
    if (!this.acik) return;
    this.sayac -= dt;
    if (this.sayac <= 0) { this.sayac = 0.2; this.ciz(); }
  }

  ciz() {
    if (!this.acik || !this.o) return;
    const o = this.o, ctx = this.ctx, r = this.dpr, W = this.W, H = this.H, s = this.olcek;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#14110d'; ctx.fillRect(0, 0, this.tuval.width, this.tuval.height);
    bolgeleriCiz(ctx, o.harita, this.mx, this.mz, s * r, W * r, H * r);
    ctx.setTransform(r, 0, 0, r, 0, 0);
    /* Parça ızgarası (yakında) ve dünya sınırı */
    if (s >= 4) {
      ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 1; ctx.beginPath();
      const [x0, z0] = this.dunyada(0, 0), [x1, z1] = this.dunyada(W, H);
      for (let x = Math.ceil(x0 / PB) * PB; x <= x1; x += PB) { const [sx] = this.ekranda(x, 0); ctx.moveTo(Math.round(sx) + 0.5, 0); ctx.lineTo(Math.round(sx) + 0.5, H); }
      for (let z = Math.ceil(z0 / PB) * PB; z <= z1; z += PB) { const [, sz] = this.ekranda(0, z); ctx.moveTo(0, Math.round(sz) + 0.5); ctx.lineTo(W, Math.round(sz) + 0.5); }
      ctx.stroke();
    }
    const S = DUNYA_SINIRI, [ax, az] = this.ekranda(-S, -S), [bx, bz] = this.ekranda(S, S);
    ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(255,90,70,.5)'; ctx.lineWidth = 1.5; ctx.strokeRect(ax, az, bx - ax, bz - az); ctx.setLineDash([]);
    /* İşaretler */
    const [x0, z0] = this.dunyada(-40, -40), [x1, z1] = this.dunyada(W + 40, H + 40);
    const l = haritaIsaretleri(o, x0, z0, x1, z1);
    this.sonIsaretler = l;
    const ad = s >= 0.5;
    const sira = { koy: 0, liman: 1, dogum: 2, olum: 3, gorev: 4, yer: 5, oyuncu: 6 };
    l.sort((a, b) => sira[a.tur] - sira[b.tur]);
    for (const m of l) {
      const [sx, sy] = this.ekranda(m.x, m.z);
      if (sx < -40 || sy < -40 || sx > W + 40 || sy > H + 40) continue;
      const renk = m.renk || IKON_RENK[m.tur];
      const boy = m.tur === 'koy' ? 8 : m.tur === 'yer' ? 8 : 7;
      ikon(ctx, m.tur, sx, m.tur === 'yer' ? sy - 7 : sy, boy, renk);
      if (ad && (m.tur === 'koy' || m.tur === 'yer' || m.tur === 'oyuncu' || (m.tur === 'liman' && s >= 2))) yazi(ctx, m.ad, sx, sy + (m.tur === 'yer' ? 9 : 15), m.tur === 'koy' ? YAZI : YAZI_K, m.tur === 'koy' ? '#f4ecd8' : renk);
    }
    /* Oyuncu */
    const p = o.oyuncu.konum, [px, py] = this.ekranda(p.x, p.z);
    okIkon(ctx, Math.max(10, Math.min(W - 10, px)), Math.max(10, Math.min(H - 10, py)), 9, o.oyuncu.yaw, '#ffffff');
    /* Kuzey ve ölçek çubuğu */
    ctx.beginPath(); ctx.arc(W - 30, 84, 15, 0, Math.PI * 2); ctx.fillStyle = 'rgba(12,12,14,.7)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.moveTo(W - 30, 72); ctx.lineTo(W - 26, 78); ctx.lineTo(W - 34, 78); ctx.closePath(); ctx.fill();
    yazi(ctx, 'K', W - 30, 87, "700 13px 'Pixelify Sans', Rubik, sans-serif", '#ff6a5c');
    const uzunluk = [5, 10, 20, 50, 100, 200, 500, 1000, 2000].find(u => u * s >= 70) || 2000, bw = uzunluk * s;
    const bx0 = 22, by0 = 80;
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(bx0 - 6, by0 - 16, bw + 12, 26);
    ctx.fillStyle = '#f4ecd8'; ctx.fillRect(bx0, by0, bw, 3); ctx.fillRect(bx0, by0 - 5, 2, 8); ctx.fillRect(bx0 + bw - 2, by0 - 5, 2, 8);
    yazi(ctx, `${uzunluk} blok`, bx0 + bw / 2, by0 - 8, YAZI_K, '#f4ecd8');
  }
}

/* ---------- Mini harita: sağ üstte, kuzey yukarıda ---------- */
export class MiniHarita {
  constructor() {
    this.kap = $('#miniHarita');
    this.tuval = $('#miniTuval');
    this.ctx = this.tuval.getContext('2d');
    this.sayac = 0; this.isaretSayac = 0; this.liste = [];
    this.olcek = 1.6;
  }
  ciz(o, dt) {
    if (this.kap.hidden || !o) return;
    this.sayac -= dt;
    if (this.sayac > 0) return;
    this.sayac = 1 / 30;
    const r = Math.min(2, devicePixelRatio || 1), w = this.kap.clientWidth || 150;
    if (this.tuval.width !== Math.round(w * r)) { this.tuval.width = this.tuval.height = Math.round(w * r); }
    const ctx = this.ctx, D = this.tuval.width, R = D / 2, s = this.olcek * r, p = o.oyuncu.konum;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, D, D);
    ctx.save();
    ctx.beginPath(); ctx.arc(R, R, R - r, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#14110d'; ctx.fillRect(0, 0, D, D);
    bolgeleriCiz(ctx, o.harita, p.x, p.z, s, D, D);
    /* Gece hafifçe kararır (göze batmasın) */
    const gece = Math.max(0, Math.min(1, (0.62 - (o.gunIsigi ?? 1)) / 0.4));
    if (gece > 0) { ctx.fillStyle = `rgba(6,10,24,${(gece * 0.38).toFixed(3)})`; ctx.fillRect(0, 0, D, D); }
    /* İşaretler (yarım saniyede bir toplanır) */
    this.isaretSayac -= dt;
    const yari = w / 2 / this.olcek;
    if (this.isaretSayac <= 0) { this.isaretSayac = 0.5; this.liste = haritaIsaretleri(o, p.x - yari - 8, p.z - yari - 8, p.x + yari + 8, p.z + yari + 8); }
    ctx.setTransform(r, 0, 0, r, 0, 0);
    const m0 = w / 2;
    for (const m of this.liste) {
      const sx = m0 + (m.x - p.x) * this.olcek, sy = m0 + (m.z - p.z) * this.olcek;
      if (Math.hypot(sx - m0, sy - m0) > m0 - 6) continue;
      const renk = m.renk || IKON_RENK[m.tur];
      ikon(ctx, m.tur, sx, m.tur === 'yer' ? sy - 4 : sy, m.tur === 'koy' ? 5.5 : 5, renk);
    }
    okIkon(ctx, m0, m0, 6.5, o.oyuncu.yaw, '#ffffff');
    ctx.restore();
    /* Çerçeve ve kuzey */
    ctx.setTransform(r, 0, 0, r, 0, 0);
    ctx.beginPath(); ctx.arc(m0, m0, m0 - 1.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.arc(m0, 9, 7.5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(12,12,14,.8)'; ctx.fill();
    ctx.font = "700 10px 'Pixelify Sans', Rubik, sans-serif"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ff6a5c'; ctx.fillText('K', m0, 9.5);
  }
}
