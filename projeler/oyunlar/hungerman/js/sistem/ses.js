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
      case 'zombi': this.ton(105 * y, 0.9, 0.14 * h, 'sawtooth', 75 * y); this.patlama(380, 0.8, 0.08 * h, 'lowpass', 3, 0.6); break;
    }
  }
  yayGer() { this.patlama(900, 0.25, 0.08, 'bandpass', 3, 1.4); }
  yayAt() { this.ton(180, 0.18, 0.18, 'triangle', 90); this.patlama(2000, 0.12, 0.15, 'highpass', 1); }
  okIsabet() { this.patlama(700, 0.12, 0.3, 'bandpass', 1.5); }
  okSaplandi() { this.patlama(450, 0.1, 0.22, 'bandpass', 2); this.ton(160, 0.08, 0.1, 'triangle', 120); }
  vurus() { this.patlama(800, 0.08, 0.25, 'bandpass', 1); }
  zirhGiy() { this.patlama(1800, 0.15, 0.2, 'bandpass', 2); }
  tik() { this.ton(1200, 0.03, 0.06, 'square', 900); }
  ac() { this.ton(440, 0.06, 0.06, 'triangle', 660); }
  kapa() { this.ton(660, 0.06, 0.06, 'triangle', 440); }
}
