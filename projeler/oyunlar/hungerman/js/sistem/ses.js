/* HungerMan - sesler: tümü Web Audio ile anlık sentezlenir (ses dosyası yoktur) */
export class Ses {
  constructor() { this.ctx = null; this.ana = null; this.duzey = 0.8; this.gurultu = null; }
  baslat() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.ana = this.ctx.createGain(); this.ana.gain.value = this.duzey; this.ana.connect(this.ctx.destination);
      const n = this.ctx.sampleRate;
      this.gurultu = this.ctx.createBuffer(1, n, n);
      const d = this.gurultu.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { this.ctx = null; }
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
  kaz(tur) { const [f, s, q] = this.malzeme(tur); this.patlama(f, s, 0.32, 'bandpass', q); if (tur === 'odun') this.ton(180, 0.06, 0.12, 'triangle', 120); }
  kir(tur) {
    const [f, s, q] = this.malzeme(tur);
    this.patlama(f, s * 2.4, 0.55, 'bandpass', q, 0.6);
    if (tur === 'cam') { this.ton(2400, 0.15, 0.08, 'triangle', 3200); this.ton(3100, 0.2, 0.06, 'triangle', 1800); }
    if (tur === 'tas') this.patlama(300, 0.12, 0.3, 'lowpass', 1);
  }
  koy(tur) { const [f, s, q] = this.malzeme(tur); this.patlama(f * 0.8, s * 1.4, 0.45, 'bandpass', q, 0.7); }
  adim(tur) { const [f, , q] = this.malzeme(tur); this.patlama(f * 0.7, 0.07, 0.14, 'bandpass', q); }
  topla() { this.ton(780 + Math.random() * 120, 0.08, 0.1, 'sine', 1300); }
  ye() { for (let i = 0; i < 3; i++) setTimeout(() => this.patlama(1800, 0.06, 0.25, 'bandpass', 1.4), i * 110); }
  hasar() { this.ton(220, 0.18, 0.25, 'sawtooth', 110); this.patlama(500, 0.12, 0.3, 'lowpass', 1); }
  zipla() { this.patlama(600, 0.05, 0.08, 'lowpass', 1); }
  sicrama(g = 1) { this.patlama(1200, 0.4 * g, 0.4, 'lowpass', 0.7, 0.4); }
  aletKirildi() { this.ton(900, 0.12, 0.2, 'square', 300); this.patlama(2500, 0.2, 0.3, 'highpass', 1); }
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
      case 'yarasa': for (let i = 0; i < (tip === 'normal' ? 2 : 3); i++) setTimeout(() => this.ton((3400 + Math.random() * 900) * y, 0.05, 0.05 * h, 'square', 2800), i * 85); break;
    }
  }
  yayGer() { this.patlama(900, 0.25, 0.08, 'bandpass', 3, 1.4); }
  yayAt() { this.ton(180, 0.18, 0.18, 'triangle', 90); this.patlama(2000, 0.12, 0.15, 'highpass', 1); }
  okIsabet() { this.patlama(700, 0.12, 0.3, 'bandpass', 1.5); }
  okSaplandi() { this.patlama(450, 0.1, 0.22, 'bandpass', 2); this.ton(160, 0.08, 0.1, 'triangle', 120); }
  vurus() { this.patlama(800, 0.08, 0.25, 'bandpass', 1); }
  zirhGiy() { this.patlama(1800, 0.15, 0.2, 'bandpass', 2); }
  takas() { this.ton(1320, 0.08, 0.08, 'triangle', 1760); setTimeout(() => this.ton(1760, 0.1, 0.07, 'triangle', 2100), 70); }
  gorev() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.ton(f, 0.16, 0.07, 'triangle', f), i * 90)); }
  /* Mağara ortam sesleri */
  damla(h = 1) { this.ton(1500 + Math.random() * 900, 0.18, 0.05 * h, 'sine', 900); }
  lav(h = 1) { this.patlama(180 + Math.random() * 120, 0.25, 0.12 * h, 'lowpass', 2, 0.5); }
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
  kapi(acik) { this.patlama(acik ? 700 : 520, 0.14, 0.3, 'bandpass', 2.2, acik ? 1.3 : 0.7); this.ton(acik ? 200 : 150, 0.08, 0.12, 'triangle', acik ? 260 : 110); }
  xp() { this.ton(1600 + Math.random() * 500, 0.09, 0.05, 'sine', 2300); }
  seviye() { [660, 880, 1320].forEach((f, i) => setTimeout(() => this.ton(f, 0.22, 0.07, 'triangle', f * 1.01), i * 80)); }
  ic() { for (let i = 0; i < 3; i++) setTimeout(() => this.patlama(900, 0.08, 0.18, 'lowpass', 2, 0.6), i * 130); }
  ors() { this.ton(1250, 0.5, 0.12, 'triangle', 1180); this.ton(1890, 0.4, 0.05, 'sine', 1850); this.patlama(3000, 0.1, 0.25, 'highpass', 1); }
  /* 0.14.0: büyüleme ve başarım */
  buyu() { [784, 1175, 1568, 2093].forEach((f, i) => setTimeout(() => this.ton(f, 0.5, 0.05, 'sine', f * 1.02), i * 70)); this.patlama(4000, 0.6, 0.06, 'highpass', 0.6, 1.4); }
  basarim() { [523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => this.ton(f, 0.28, 0.07, 'triangle', f), i * 85)); }
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
  tik() { this.ton(1200, 0.03, 0.06, 'square', 900); }
  ac() { this.ton(440, 0.06, 0.06, 'triangle', 660); }
  kapa() { this.ton(660, 0.06, 0.06, 'triangle', 440); }
}
