/* HungerMan - sesler
   0.19.0: adım, kazma, kırma, koyma, vuruş, kapı, sandık, para, kumaş, kitap, arayüz ve ödül sesleri gerçek kayıtlardır
   (Kenney ses paketleri, CC0; ses/efekt). Kayıt yüklenemezse ya da henüz yüklenmediyse aynı ses Web Audio ile üretilir.
   Hayvan, canavar, hava, su, lav, büyü ve mekanik sesler Web Audio ile anlık sentezlenir. */
/* Kayıt grupları ve her grubun değişke sayısı (ses/efekt/<grup>_<n>.mp3) */
const ORNEK = { adim_cim: 5, adim_tas: 5, adim_odun: 5, adim_kar: 5, adim_kum: 5, kaz_tas: 5, kaz_odun: 4, kaz_toprak: 4, kaz_cam: 3, kaz_metal: 3, kir_odun: 3, kir_toprak: 3,
  kir_cam: 3, kir_metal: 2, koy_odun: 3, koy_tas: 3, koy_metal: 3, vurus: 3, hasar: 3, kapi_ac: 2, kapi_kapa: 4, sandik: 3, para: 2, kumas: 4, kitap_ac: 1, kitap_kapa: 1,
  sayfa: 3, tencere: 3, balta: 1, kol: 2, kilic: 3, deri: 2, tik: 3, sec: 2, pencere_ac: 2, pencere_kapa: 2, onay: 2, hata: 1, basarim: 1, gorev: 1, seviye: 1, buyu: 1, olum: 1 };
/* Blok ses türlerinin kayıt grupları */
const ADIM = { cimen: 'adim_cim', toprak: 'adim_cim', bitki: 'adim_cim', tas: 'adim_tas', cam: 'adim_tas', odun: 'adim_odun', kar: 'adim_kar', kum: 'adim_kum', yun: 'adim_kum' };
const KAZ = { tas: 'kaz_tas', odun: 'kaz_odun', toprak: 'kaz_toprak', cimen: 'kaz_toprak', kum: 'kaz_toprak', kar: 'kaz_toprak', yun: 'kaz_toprak', cam: 'kaz_cam' };
const KIR = { tas: 'kaz_tas', odun: 'kir_odun', toprak: 'kir_toprak', cimen: 'kir_toprak', kum: 'kir_toprak', kar: 'kir_toprak', yun: 'kir_toprak', cam: 'kir_cam' };
const KOY = { tas: 'koy_tas', odun: 'koy_odun', toprak: 'kaz_toprak', cimen: 'kaz_toprak', kum: 'kaz_toprak', kar: 'kaz_toprak', yun: 'kaz_toprak', bitki: 'kaz_toprak', cam: 'koy_tas' };
export class Ses {
  constructor() { this.ctx = null; this.ana = null; this.duzey = 0.8; this.gurultu = null; this.ornekler = {}; }
  baslat() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.ana = this.ctx.createGain(); this.ana.gain.value = this.duzey; this.ana.connect(this.ctx.destination);
      const n = this.ctx.sampleRate;
      this.gurultu = this.ctx.createBuffer(1, n, n);
      const d = this.gurultu.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      this.ornekleriYukle();
    } catch (e) { this.ctx = null; }
  }
  /* Kayıtlar arka planda yüklenir; yüklenene kadar sentez sesler çalar */
  ornekleriYukle() {
    for (const [g, n] of Object.entries(ORNEK)) for (let i = 0; i < n; i++) {
      fetch(`ses/efekt/${g}_${i}.mp3`).then(r => (r.ok ? r.arrayBuffer() : null))
        .then(b => b && new Promise((tamam, hata) => this.ctx.decodeAudioData(b, tamam, hata)))
        .then(buf => { if (buf) (this.ornekler[g] = this.ornekler[g] || []).push(buf); }).catch(() => {});
    }
  }
  /* Kayıttan çalar (rastgele değişke, hafif perde oynaması); kayıt yoksa false */
  cal(g, ses = 1, hiz = 1) {
    const c = this.ctx, l = g && this.ornekler[g];
    if (!c || !l || !l.length) return false;
    const k = c.createBufferSource(); k.buffer = l[Math.floor(Math.random() * l.length)];
    k.playbackRate.value = hiz * (0.93 + Math.random() * 0.14);
    const s = c.createGain(); s.gain.value = ses;
    k.connect(s); s.connect(this.ana); k.start();
    return true;
  }
  duzeyAyarla(v) { this.duzey = v; if (this.ana) this.ana.gain.value = v; }

  /* Filtrelenmiş gürültü patlaması */
  patlama(frekans, sure, ses = 0.5, tur = 'bandpass', q = 1.2, kayma = 1) {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime;
    const k = c.createBufferSource(); k.buffer = this.gurultu; k.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = c.createBiquadFilter(); f.type = tur; f.frequency.setValueAtTime(frekans, t); f.frequency.exponentialRampToValueAtTime(Math.max(40, frekans * kayma), t + sure); f.Q.value = q;
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(ses, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
    k.connect(f); f.connect(g); g.connect(this.ana);
    k.start(t, Math.random() * 0.5); k.stop(t + sure + 0.05);
  }
  ton(frekans, sure, ses = 0.2, tur = 'sine', bitis = frekans) {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator(); o.type = tur; o.frequency.setValueAtTime(frekans, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, bitis), t + sure);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(ses, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
    o.connect(g); g.connect(this.ana); o.start(t); o.stop(t + sure + 0.05);
  }
  malzeme(tur) {
    switch (tur) {
      case 'tas': return [1400, 0.09, 1.6];
      case 'odun': return [520, 0.1, 2.5];
      case 'toprak': case 'cimen': return [420, 0.09, 0.8];
      case 'kum': return [2600, 0.1, 0.6];
      case 'kar': return [3000, 0.09, 0.5];
      case 'bitki': return [3600, 0.06, 0.7];
      case 'cam': return [4200, 0.12, 4];
      case 'yun': return [1600, 0.08, 0.5];
      default: return [900, 0.09, 1];
    }
  }
  kaz(tur) { if (this.cal(KAZ[tur], 0.5)) return; const [f, s, q] = this.malzeme(tur); this.patlama(f, s, 0.32, 'bandpass', q); if (tur === 'odun') this.ton(180, 0.06, 0.12, 'triangle', 120); }
  kir(tur) {
    if (this.cal(KIR[tur], 0.85, tur === 'tas' ? 0.8 : 1)) { if (tur === 'tas') this.patlama(300, 0.12, 0.22, 'lowpass', 1); return; }
    const [f, s, q] = this.malzeme(tur);
    this.patlama(f, s * 2.4, 0.55, 'bandpass', q, 0.6);
    if (tur === 'cam') { this.ton(2400, 0.15, 0.08, 'triangle', 3200); this.ton(3100, 0.2, 0.06, 'triangle', 1800); }
    if (tur === 'tas') this.patlama(300, 0.12, 0.3, 'lowpass', 1);
  }
  koy(tur) { if (this.cal(KOY[tur], 0.6)) return; const [f, s, q] = this.malzeme(tur); this.patlama(f * 0.8, s * 1.4, 0.45, 'bandpass', q, 0.7); }
  adim(tur) { if (this.cal(ADIM[tur], 0.3)) return; const [f, , q] = this.malzeme(tur); this.patlama(f * 0.7, 0.07, 0.14, 'bandpass', q); }
  topla() { this.ton(780 + Math.random() * 120, 0.08, 0.1, 'sine', 1300); }
  ye() { for (let i = 0; i < 3; i++) setTimeout(() => this.patlama(1800, 0.06, 0.25, 'bandpass', 1.4), i * 110); }
  hasar() { if (this.cal('hasar', 0.7)) { this.ton(200, 0.12, 0.1, 'sawtooth', 120); return; } this.ton(220, 0.18, 0.25, 'sawtooth', 110); this.patlama(500, 0.12, 0.3, 'lowpass', 1); }
  zipla() { this.patlama(600, 0.05, 0.08, 'lowpass', 1); }
  sicrama(g = 1) { this.patlama(1200, 0.4 * g, 0.4, 'lowpass', 0.7, 0.4); }
  aletKirildi() { this.cal('kir_metal', 0.5); this.ton(900, 0.12, 0.2, 'square', 300); this.patlama(2500, 0.2, 0.3, 'highpass', 1); }
  uretim() { this.ton(520, 0.06, 0.1, 'triangle', 700); setTimeout(() => this.ton(780, 0.08, 0.1, 'triangle', 1040), 60); }
  /* Canlı sesleri: tip 'normal' | 'acima' | 'olum'; hacim 0..1 (uzaklığa göre) */
  canli(tur, tip = 'normal', hacim = 1) {
    if (!this.ctx || hacim <= 0.02) return;
    const h = Math.min(1, hacim), y = tip === 'acima' ? 1.35 : tip === 'olum' ? 0.8 : 1;
    switch (tur) {
      case 'inek': this.ton(150 * y, 0.7, 0.16 * h, 'sawtooth', 105 * y); this.patlama(300, 0.5, 0.05 * h, 'lowpass', 1); break;
      case 'koyun': for (let i = 0; i < 4; i++) setTimeout(() => this.ton(330 * y, 0.12, 0.08 * h, 'square', 300 * y), i * 90); break;
      case 'domuz': this.ton(230 * y, 0.12, 0.12 * h, 'sawtooth', 180 * y); setTimeout(() => this.ton(250 * y, 0.1, 0.1 * h, 'sawtooth', 190 * y), 140); this.patlama(500, 0.1, 0.06 * h, 'bandpass', 2); break;
      case 'tavuk': this.ton(950 * y, 0.07, 0.08 * h, 'triangle', 720 * y); setTimeout(() => this.ton(1050 * y, 0.06, 0.07 * h, 'triangle', 800 * y), 110); break;
      case 'tavsan': this.ton(1300 * y, 0.08, 0.05 * h, 'triangle', 1000); break;
      case 'kurt': if (tip === 'normal') { this.patlama(220, 0.6, 0.12 * h, 'lowpass', 2); this.ton(95, 0.6, 0.1 * h, 'sawtooth', 80); } else this.ton(700 * y, 0.25, 0.12 * h, 'triangle', 450); break;
      /* 0.18.0: kor ruhu çatırdar ve uğuldar */
      case 'ari': this.ton(220 * y + Math.random() * 20, 0.5, 0.05 * h, 'sawtooth', 240 * y); this.ton(440 * y, 0.5, 0.02 * h, 'square', 470 * y); break;
      case 'korruhu': this.patlama(900, 0.4, 0.12 * h, 'bandpass', 0.8, 1.6); this.ton(70 * y, 0.6, 0.1 * h, 'sawtooth', 55 * y); break;
      /* 0.16.0: köpek havlar, kedi miyavlar, at kişner */
      case 'kopek': if (tip === 'normal') { this.ton(420 * y, 0.08, 0.12 * h, 'sawtooth', 300 * y); this.patlama(700, 0.08, 0.08 * h, 'bandpass', 2); setTimeout(() => { this.ton(440 * y, 0.09, 0.12 * h, 'sawtooth', 310 * y); this.patlama(700, 0.08, 0.08 * h, 'bandpass', 2); }, 170); } else this.ton(900 * y, 0.22, 0.1 * h, 'triangle', 600); break;
      case 'kedi': this.ton(560 * y, 0.12, 0.06 * h, 'triangle', 820 * y); setTimeout(() => this.ton(820 * y, 0.28, 0.06 * h, 'triangle', 480 * y), 110); break;
      case 'at': { const n = tip === 'normal' ? 6 : 4; for (let i = 0; i < n; i++) setTimeout(() => this.ton((620 - i * 55) * y, 0.09, 0.08 * h, 'sawtooth', (560 - i * 55) * y), i * 70); setTimeout(() => this.patlama(380, 0.3, 0.07 * h, 'lowpass', 1.5, 0.6), n * 70); break; }
      case 'koylu': this.ton(210 * y, 0.16, 0.07 * h, 'triangle', 170 * y); setTimeout(() => this.ton(190 * y, 0.2, 0.06 * h, 'triangle', 230 * y), 170); break;
      case 'iskelet': for (let i = 0; i < 3; i++) setTimeout(() => this.patlama(2400 * y, 0.04, 0.12 * h, 'bandpass', 6), i * 70); break;
      case 'orumcek': this.patlama(5200 * y, tip === 'normal' ? 0.5 : 0.25, 0.08 * h, 'highpass', 1, 0.7); break;
      case 'zombi': this.ton(105 * y, 0.9, 0.14 * h, 'sawtooth', 75 * y); this.patlama(380, 0.8, 0.08 * h, 'lowpass', 3, 0.6); break;
      case 'balik': this.patlama(1400 * y, 0.08, 0.14 * h, 'bandpass', 2); if (tip !== 'normal') this.patlama(700, 0.15, 0.1 * h, 'lowpass', 1); break;
      case 'kopekbaligi': if (tip === 'normal') this.patlama(160, 0.6, 0.08 * h, 'lowpass', 1.5, 0.7); else { this.patlama(500, 0.2, 0.2 * h, 'lowpass', 1); this.ton(120 * y, 0.25, 0.1 * h, 'sawtooth', 80); } break;
      case 'ahtapot': this.patlama(800 * y, 0.18, 0.1 * h, 'lowpass', 2, 0.6); break;
      case 'mumya': this.ton(90 * y, 1.0, 0.12 * h, 'sawtooth', 65 * y); this.patlama(2600, 0.7, 0.06 * h, 'highpass', 0.8, 0.7); break;
      case 'bogulmus': this.ton(115 * y, 0.8, 0.12 * h, 'sawtooth', 80 * y); for (let i = 0; i < 4; i++) setTimeout(() => this.patlama(500 + Math.random() * 400, 0.12, 0.08 * h, 'lowpass', 3, 0.6), i * 120); break;
      case 'buziskelet': for (let i = 0; i < 3; i++) setTimeout(() => this.patlama(3200 * y, 0.05, 0.11 * h, 'bandpass', 6), i * 70); this.ton(1900 * y, 0.25, 0.03 * h, 'sine', 2400); break;
      case 'haydut': this.ton(170 * y, 0.18, 0.08 * h, 'sawtooth', 130 * y); setTimeout(() => this.ton(150 * y, 0.2, 0.06 * h, 'sawtooth', 120 * y), 160); break;
      case 'muhafiz': this.patlama(140 * y, 0.9, 0.22 * h, 'lowpass', 1.2, 0.6); this.ton(55 * y, 0.8, 0.12 * h, 'sawtooth', 40); break;
      case 'yarasa': for (let i = 0; i < (tip === 'normal' ? 2 : 3); i++) setTimeout(() => this.ton((3400 + Math.random() * 900) * y, 0.05, 0.05 * h, 'square', 2800), i * 85); break;
    }
  }
  yayGer() { this.patlama(900, 0.25, 0.08, 'bandpass', 3, 1.4); }
  yayAt() { this.ton(180, 0.18, 0.18, 'triangle', 90); this.patlama(2000, 0.12, 0.15, 'highpass', 1); }
  okIsabet() { this.patlama(700, 0.12, 0.3, 'bandpass', 1.5); }
  okSaplandi() { this.patlama(450, 0.1, 0.22, 'bandpass', 2); this.ton(160, 0.08, 0.1, 'triangle', 120); }
  vurus() { if (this.cal('vurus', 0.6)) return; this.patlama(800, 0.08, 0.25, 'bandpass', 1); }
  zirhGiy() { if (this.cal('kumas', 0.6)) return; this.patlama(1800, 0.15, 0.2, 'bandpass', 2); }
  takas() { if (this.cal('para', 0.6)) return; this.ton(1320, 0.08, 0.08, 'triangle', 1760); setTimeout(() => this.ton(1760, 0.1, 0.07, 'triangle', 2100), 70); }
  gorev() { if (this.cal('gorev', 0.5)) return; [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.ton(f, 0.16, 0.07, 'triangle', f), i * 90)); }
  /* Mağara ortam sesleri */
  damla(h = 1) { this.ton(1500 + Math.random() * 900, 0.18, 0.05 * h, 'sine', 900); }
  lav(h = 1) { this.patlama(180 + Math.random() * 120, 0.25, 0.12 * h, 'lowpass', 2, 0.5); }
  atesTopu() { this.patlama(600, 0.45, 0.2, 'bandpass', 0.7, 0.5); this.ton(160, 0.35, 0.08, 'sawtooth', 70); }
  yanma() { this.patlama(900, 0.3, 0.12, 'bandpass', 0.8, 1.5); }
  /* Deniz: olta, tekne, dalış */
  olta(tip) {
    if (tip === 'at') { this.patlama(2600, 0.22, 0.1, 'highpass', 1, 0.5); this.ton(500, 0.2, 0.04, 'triangle', 250); }
    else if (tip === 'dusme') this.patlama(900, 0.18, 0.18, 'lowpass', 1.2, 0.5);
    else if (tip === 'isirma') { this.patlama(1300, 0.3, 0.3, 'lowpass', 0.8, 0.4); this.patlama(2600, 0.15, 0.12, 'bandpass', 1); }
    else if (tip === 'cek') for (let i = 0; i < 4; i++) setTimeout(() => this.ton(1800, 0.025, 0.05, 'square', 1500), i * 45);
    else if (tip === 'yakala') { this.patlama(1100, 0.35, 0.3, 'lowpass', 0.8, 0.4); setTimeout(() => this.ton(880, 0.1, 0.08, 'triangle', 1320), 120); }
  }
  kurek(h = 1) { this.patlama(700 + Math.random() * 200, 0.32, 0.16 * h, 'lowpass', 0.9, 0.45); }
  dalga(h = 1) { this.patlama(420 + Math.random() * 120, 1.2, 0.07 * h, 'lowpass', 0.6, 0.6); }
  /* 0.11.0: kapı, deneyim, iksir, örs, hava */
  kapi(acik) { if (this.cal(acik ? 'kapi_ac' : 'kapi_kapa', 0.55)) return; this.patlama(acik ? 700 : 520, 0.14, 0.3, 'bandpass', 2.2, acik ? 1.3 : 0.7); this.ton(acik ? 200 : 150, 0.08, 0.12, 'triangle', acik ? 260 : 110); }
  xp() { this.ton(1600 + Math.random() * 500, 0.09, 0.05, 'sine', 2300); }
  seviye() { if (this.cal('seviye', 0.45)) return; [660, 880, 1320].forEach((f, i) => setTimeout(() => this.ton(f, 0.22, 0.07, 'triangle', f * 1.01), i * 80)); }
  ic() { for (let i = 0; i < 3; i++) setTimeout(() => this.patlama(900, 0.08, 0.18, 'lowpass', 2, 0.6), i * 130); }
  ors() { this.ton(1250, 0.5, 0.12, 'triangle', 1180); this.ton(1890, 0.4, 0.05, 'sine', 1850); this.patlama(3000, 0.1, 0.25, 'highpass', 1); }
  /* 0.14.0: büyüleme ve başarım */
  buyu() { if (this.cal('buyu', 0.4)) { this.patlama(4000, 0.6, 0.05, 'highpass', 0.6, 1.4); return; } [784, 1175, 1568, 2093].forEach((f, i) => setTimeout(() => this.ton(f, 0.5, 0.05, 'sine', f * 1.02), i * 70)); this.patlama(4000, 0.6, 0.06, 'highpass', 0.6, 1.4); }
  basarim() { if (this.cal('basarim', 0.5)) return; [523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => this.ton(f, 0.28, 0.07, 'triangle', f), i * 85)); }
  /* 0.15.1: boss efektleri */
  ruzgar(h = 1) { this.patlama(900, 1.4, 0.12 * h, 'bandpass', 0.7, 0.9); this.patlama(2400, 1.0, 0.05 * h, 'highpass', 0.6, 0.8); }
  cam(h = 1) { for (let i = 0; i < 4; i++) setTimeout(() => this.ton(2600 + Math.random() * 1400, 0.18, 0.05 * h, 'triangle', 3400), i * 45); this.patlama(5000, 0.25, 0.07 * h, 'highpass', 1.2); }
  savur(h = 1) { this.patlama(600, 0.35, 0.14 * h, 'bandpass', 1.4, 0.4); this.patlama(1400, 0.25, 0.08 * h, 'bandpass', 1.4, 0.4); }
  /* 0.17.0: mekanik sesler ve müzik kutusu ezgileri (tur: 0 piyano, 1 bas, 2 zil, 3 flüt, 4 davul) */
  kol(acik) { if (this.cal('kol', 0.5, acik ? 1.1 : 0.9)) return; this.ton(acik ? 900 : 700, 0.04, 0.08, 'square', acik ? 1100 : 500); this.patlama(2200, 0.03, 0.08, 'highpass', 1); }
  /* 0.18.0: Diyar Geçidi */
  gecitAcil() { this.ton(140, 1.4, 0.16, 'sawtooth', 420); this.ton(210, 1.2, 0.08, 'sine', 630); this.patlama(500, 1.0, 0.18, 'bandpass', 1.4, 2); }
  gecitSon() { this.ton(420, 0.8, 0.12, 'sawtooth', 120); this.patlama(700, 0.5, 0.12, 'bandpass', 1.2, 0.5); }
  gecitUgultu() { this.ton(95 + Math.random() * 10, 1.2, 0.07, 'sine', 120); this.ton(190, 1.2, 0.03, 'triangle', 240); }
  gecis() { this.patlama(400, 1.2, 0.3, 'bandpass', 1.0, 3); this.ton(660, 0.9, 0.1, 'sine', 110); }
  diyarUgultu() { this.ton(48 + Math.random() * 8, 3.5, 0.05, 'sine', 40); this.patlama(160, 2.5, 0.05, 'lowpass', 0.8, 0.6); }
  dugme() { this.ton(1000, 0.03, 0.07, 'square', 800); }
  melodi(tur = 0, h = 1) {
    if (!this.ctx) return;
    const notalar = [[523, 659, 784, 1047], [131, 165, 196, 262], [1047, 1319, 1568, 2093], [587, 740, 880, 1175], [0, 0, 0, 0]][tur] || [523, 659, 784, 1047];
    const dalga = ['triangle', 'sawtooth', 'sine', 'sine', 'square'][tur] || 'triangle';
    notalar.forEach((n, i) => setTimeout(() => { if (tur === 4) this.patlama(i % 2 ? 1800 : 160, 0.12, 0.3 * h, i % 2 ? 'highpass' : 'lowpass', 1); else this.ton(n, tur === 2 ? 0.5 : 0.22, (tur === 1 ? 0.16 : 0.1) * h, dalga, n); }, i * 150));
  }
  /* Nal sesi: iki vuruş; h hıza göre */
  nal(h = 1) { this.patlama(900, 0.05, 0.12 * h + 0.04, 'bandpass', 3); setTimeout(() => this.patlama(760, 0.05, 0.1 * h + 0.03, 'bandpass', 3), 110); }
  kalp() { this.ton(880, 0.12, 0.05, 'sine', 1100); }
  /* Yağmur: sürekli çalan süzülmüş gürültü; hacim 0..1, boguk: çatı altında */
  yagmurAyarla(hacim, boguk) {
    const c = this.ctx; if (!c) return;
    if (!this.yagmur) {
      if (hacim <= 0.01) return;
      const k = c.createBufferSource(); k.buffer = this.gurultu; k.loop = true;
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2400; f.Q.value = 0.4;
      const b = c.createBiquadFilter(); b.type = 'highpass'; b.frequency.value = 300;
      const g = c.createGain(); g.gain.value = 0;
      k.connect(b); b.connect(f); f.connect(g); g.connect(this.ana); k.start();
      this.yagmur = { k, f, g };
    }
    const Y = this.yagmur, t = c.currentTime;
    Y.g.gain.setTargetAtTime(Math.max(0, hacim) * 0.16, t, 0.4);
    Y.f.frequency.setTargetAtTime(boguk ? 700 : 2400, t, 0.3);
    if (hacim <= 0.01 && Y.g.gain.value < 0.002) { try { Y.k.stop(); } catch (e) { /* durmuş */ } this.yagmur = null; }
  }
  gokGurultusu(h = 1, yakin = false) {
    if (!this.ctx || h <= 0.02) return;
    if (yakin) { this.patlama(3800, 0.25, 0.45 * h, 'highpass', 0.7, 0.5); this.patlama(900, 0.5, 0.4 * h, 'lowpass', 0.8, 0.4); }
    this.patlama(160, 2.8, 0.55 * h, 'lowpass', 1.4, 0.5);
    setTimeout(() => this.patlama(110, 2.2, 0.35 * h, 'lowpass', 1.2, 0.6), 350);
  }
  tik() { if (this.cal('tik', 0.35)) return; this.ton(1200, 0.03, 0.06, 'square', 900); }
  ac() { if (this.cal('pencere_ac', 0.35)) return; this.ton(440, 0.06, 0.06, 'triangle', 660); }
  kapa() { if (this.cal('pencere_kapa', 0.35)) return; this.ton(660, 0.06, 0.06, 'triangle', 440); }
  /* 0.19.0: yalnızca kayıtla çalan sesler (kayıt yoksa en yakın sentez ses) */
  sandik() { if (!this.cal('sandik', 0.55)) this.ac(); }
  kitap(acik = true) { if (!this.cal(acik ? 'kitap_ac' : 'kitap_kapa', 0.5)) (acik ? this.ac() : this.kapa()); }
  sayfa() { if (!this.cal('sayfa', 0.45)) this.tik(); }
  tencere() { this.cal('tencere', 0.45); }
  olum() { this.cal('olum', 0.5); }
  hataSes() { if (!this.cal('hata', 0.4)) this.ton(220, 0.12, 0.06, 'square', 180); }
}
