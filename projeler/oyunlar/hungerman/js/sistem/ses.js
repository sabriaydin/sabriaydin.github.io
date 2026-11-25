/* HungerMan - sesler
   0.19.0: adım, kazma, kırma, koyma, vuruş, kapı, sandık, para, kumaş, kitap, arayüz ve ödül sesleri gerçek kayıtlardır
   (Kenney ses paketleri, CC0; ses/efekt). Kayıt yüklenemezse ya da henüz yüklenmediyse aynı ses Web Audio ile üretilir.
   0.40.0: hayvan, canavar, köylü ve boss sesleri; yağmur, gök gürültüsü, rüzgâr, su, lav, ateş, damla, olta, yay, geçit, iksir,
   patlama, tılsım ve müzik kutusu notaları da gerçek kayıtlardır (VoxeLibre, Minetest Game ve AmbientSounds kaynaklı; CC0, CC BY 3.0
   ve MIT lisanslı; ayrıntı: ses/LISANS.md). Sentez yalnızca kaydı olmayan birkaç ince ses (arı vızıltısı, kalp atışı, titreme,
   kayan yıldız, geçit uğultusu) ve kayıt yüklenemediğinde yedek olarak kullanılır. */
/* Kayıt grupları ve her grubun değişke sayısı (ses/efekt/<grup>_<n>.mp3) */
const ORNEK = { adim_cim: 5, adim_tas: 5, adim_odun: 5, adim_kar: 5, adim_kum: 5, kaz_tas: 5, kaz_odun: 4, kaz_toprak: 4, kaz_cam: 3, kaz_metal: 3, kir_odun: 3, kir_toprak: 3,
  kir_cam: 3, kir_metal: 2, koy_odun: 3, koy_tas: 3, koy_metal: 3, vurus: 3, hasar: 3, kapi_ac: 2, kapi_kapa: 4, sandik: 3, para: 2, kumas: 4, kitap_ac: 1, kitap_kapa: 1,
  sayfa: 3, tencere: 3, balta: 1, kol: 2, kilic: 3, deri: 2, tik: 3, sec: 2, pencere_ac: 2, pencere_kapa: 2, onay: 2, hata: 1, basarim: 1, gorev: 1, seviye: 1, buyu: 1, olum: 1,
  /* 0.40.0 */
  sut: 1, kirp: 1, ahtapot_acima: 2, ahtapot_olum: 1, alet_kir: 3, at: 2, at_acima: 1, at_olum: 1, ates: 3, ates_topu: 1, balik: 4, buyucu: 2, buyucu_acima: 2, buyucu_olum: 1, buyucu_saldiri: 3, cakmak: 1, damla: 3, domuz: 1, domuz_acima: 1, dugme: 1, firavun: 1, firlat: 1, gecis: 1, gecit_ac: 1, gok: 4, haydut: 2, haydut_acima: 2, hayvan_ye: 1, ic: 1, inek: 1, inek_acima: 1, isinlanma: 2, iskelet: 2, iskelet_acima: 1, iskelet_olum: 1, kanli_ay: 1, kedi: 2, kedi_acima: 1, kedi_olum: 1, kopek: 3, kopekbaligi: 1, kopekbaligi_acima: 2, kopekbaligi_olum: 1, korruhu: 1, korruhu_acima: 1, korruhu_olum: 1, koylu: 7, koylu_acima: 2, koylu_evet: 2, koyun: 3, koyun_acima: 1, kuldev: 3, kuldev_acima: 1, kuldev_olum: 1, kuldev_saldiri: 2, kurt: 1, kurt_acima: 3, kurt_olum: 1, lav: 3, lav_ortam: 2, magara: 2, muhafiz: 2, muhafiz_acima: 3, muhafiz_olum: 1, mumya: 2, mumya_acima: 3, mumya_olum: 2, nota_bas: 1, nota_davul: 1, nota_flut: 1, nota_piyano: 1, nota_zil: 1, ok_isabet: 1, olta_cek: 1, olta_dus: 1, orumcek: 2, orumcek_acima: 3, orumcek_olum: 1, orumcek_saldiri: 2, patlama: 1, roket: 1, ruzgar: 2, sicrama: 1, su: 4, su_adim: 3, tavsan: 4, tavsan_acima: 3, tavsan_olum: 3, tavuk: 3, tavuk_acima: 1, tavuk_yumurta: 1, tilsim: 1, topla: 1, yagmur: 1, yarasa: 1, yarasa_acima: 3, yarasa_olum: 1, yay_at: 1, zombi: 1, zombi_acima: 1, zombi_olum: 1 };
/* 0.41.0: biyom ortam sesleri (AmbientSounds ve Ambience Redo kaynaklı; ses/LISANS.md) */
Object.assign(ORNEK, { kus: 3, karga: 1, baykus: 1, cekirge: 1, kurt_uluma: 1, cakal: 1, col_ruzgar: 1, marti: 1, dag_ruzgar: 2, dere: 2 });
/* Blok ses türlerinin kayıt grupları */
/* 0.47.0: metal, buz ve bitki (yaprak) türleri eklendi; her kayıt grubu için perde [grup, perde] */
const ADIM = { cimen: 'adim_cim', toprak: 'adim_cim', bitki: ['adim_cim', 1.15], tas: 'adim_tas', cam: ['adim_tas', 1.15], metal: ['adim_tas', 1.3], buz: ['adim_kar', 1.25], odun: 'adim_odun', kar: 'adim_kar', kum: 'adim_kum', yun: ['kumas', 1] };
const KAZ = { tas: 'kaz_tas', odun: 'kaz_odun', toprak: 'kaz_toprak', cimen: 'kaz_toprak', kum: 'kaz_toprak', kar: 'kaz_toprak', yun: ['kumas', 1], cam: 'kaz_cam', metal: 'kaz_metal', buz: ['kaz_cam', 0.85], bitki: ['kumas', 1.25] };
const KIR = { tas: 'kaz_tas', odun: 'kir_odun', toprak: 'kir_toprak', cimen: 'kir_toprak', kum: 'kir_toprak', kar: 'kir_toprak', yun: ['kumas', 0.9], cam: 'kir_cam', metal: 'kir_metal', buz: ['kir_cam', 0.85], bitki: ['kumas', 1.1] };
const KOY = { tas: 'koy_tas', odun: 'koy_odun', toprak: 'kaz_toprak', cimen: 'kaz_toprak', kum: 'kaz_toprak', kar: 'kaz_toprak', yun: ['kumas', 0.95], bitki: ['kumas', 1.2], cam: 'koy_tas', metal: 'koy_metal', buz: ['koy_tas', 1.2] };
/* grup adı ya da [grup, perde] */
const G_ = g => (Array.isArray(g) ? g : [g, 1]);
/* 0.40.0: canlı sesleri. Her tür için [grup, hız, düzey]; 'acima' (canı yanınca), 'olum' ve 'saldiri' yoksa en yakın grup kullanılır */
const CANLI = {
  inek: { normal: ['inek'], acima: ['inek_acima'], olum: ['inek_acima', 0.85] },
  koyun: { normal: ['koyun'], acima: ['koyun_acima'], olum: ['koyun_acima', 0.85] },
  domuz: { normal: ['domuz'], acima: ['domuz_acima'], olum: ['domuz_acima', 0.82] },
  tavuk: { normal: ['tavuk'], acima: ['tavuk_acima'], olum: ['tavuk_acima', 0.85] },
  tavsan: { normal: ['tavsan'], acima: ['tavsan_acima'], olum: ['tavsan_olum'] },
  kurt: { normal: ['kurt'], acima: ['kurt_acima'], olum: ['kurt_olum'], saldiri: ['kopek', 0.85] },
  kopek: { normal: ['kopek'], acima: ['kurt_acima', 1.12], olum: ['kurt_olum', 1.1] },
  kedi: { normal: ['kedi'], acima: ['kedi_acima'], olum: ['kedi_olum'] },
  at: { normal: ['at'], acima: ['at_acima'], olum: ['at_olum'] },
  koylu: { normal: ['koylu'], acima: ['koylu_acima'], olum: ['koylu_acima', 0.8] },
  zombi: { normal: ['zombi'], acima: ['zombi_acima'], olum: ['zombi_olum'], saldiri: ['zombi', 1.1] },
  bogulmus: { normal: ['zombi', 0.8], acima: ['zombi_acima', 0.82], olum: ['zombi_olum', 0.8], saldiri: ['zombi', 0.9] },
  kulzombi: { normal: ['zombi', 0.72], acima: ['zombi_acima', 0.75], olum: ['zombi_olum', 0.72], saldiri: ['zombi', 0.8] },
  mumya: { normal: ['mumya'], acima: ['mumya_acima'], olum: ['mumya_olum'] },
  firavun: { normal: ['firavun'], acima: ['mumya_acima', 0.75], olum: ['mumya_olum', 0.7], saldiri: ['mumya', 0.75] },
  iskelet: { normal: ['iskelet'], acima: ['iskelet_acima'], olum: ['iskelet_olum'] },
  buziskelet: { normal: ['iskelet', 1.18], acima: ['iskelet_acima', 1.18], olum: ['iskelet_olum', 1.15] },
  orumcek: { normal: ['orumcek'], acima: ['orumcek_acima'], olum: ['orumcek_olum'], saldiri: ['orumcek_saldiri'] },
  yarasa: { normal: ['yarasa'], acima: ['yarasa_acima'], olum: ['yarasa_olum'] },
  haydut: { normal: ['haydut'], acima: ['haydut_acima'], olum: ['haydut_acima', 0.8] },
  reis: { normal: ['haydut', 0.82], acima: ['haydut_acima', 0.82], olum: ['haydut_acima', 0.7] },
  buyucu: { normal: ['buyucu'], acima: ['buyucu_acima'], olum: ['buyucu_olum'], saldiri: ['buyucu_saldiri'] },
  muhafiz: { normal: ['muhafiz'], acima: ['muhafiz_acima'], olum: ['muhafiz_olum'] },
  kuldev: { normal: ['kuldev', 0.72], acima: ['kuldev_acima', 0.7], olum: ['kuldev_olum', 0.65], saldiri: ['kuldev_saldiri', 0.7] },
  korruhu: { normal: ['korruhu'], acima: ['korruhu_acima'], olum: ['korruhu_olum'] },
  balik: { normal: ['balik', 1.2, 0.6], acima: ['balik', 1.1, 0.7], olum: ['balik', 0.9, 0.8] },
  ahtapot: { normal: ['balik', 0.8, 0.8], acima: ['ahtapot_acima'], olum: ['ahtapot_olum'] },
  kopekbaligi: { normal: ['kopekbaligi', 0.7, 0.8], acima: ['kopekbaligi_acima', 0.75], olum: ['kopekbaligi_olum', 0.7] }
};
/* Müzik kutusu çalgıları (0 piyano, 1 bas, 2 zil, 3 flüt, 4 davul) */
const CALGI = ['nota_piyano', 'nota_bas', 'nota_zil', 'nota_flut', 'nota_davul'];
export class Ses {
  constructor() {
    this.ctx = null; this.ana = null; this.duzey = 0.8; this.gurultu = null; this.ornekler = {}; this.dinleyici = null; this.engel = null; this._k = null;
    /* 0.47.0: ses kanalları (Ayarlar > Ses): her sesin bir türü vardır; türün düzeyi ayrı ayarlanır */
    this.kanal = null; this.kanalDuzey = { efekt: 1, canli: 1, ortam: 1, arayuz: 1 }; this._kat = null; this.mono = false;
    const sar = (tur, adlar) => { for (const ad of adlar) { const f = this[ad]; if (typeof f !== 'function') continue; this[ad] = (...a) => { const o = this._kat; this._kat = tur; try { return f.apply(this, a); } finally { this._kat = o; } }; } };
    sar('canli', ['canli', 'agirAdim']);
    /* 0.47.0: altyazı: konumlu çalan canlı sesleri, gök gürültüsü ve patlamalar yazıyla da bildirilir */
    this.altyazi = null;   // (metin, yön -1..1) => void
    const canli = this.canli;
    this.canli = (tur, tip = 'normal', hacim = 1) => { if (this.altyazi && hacim > 0.02 && (!this._k || this._k.kat > 0.05)) this.altyazi({ tur, tip }, this._k ? this._k.pan : 0); return canli.call(this, tur, tip, hacim); };
    const gok = this.gokGurultusu;
    this.gokGurultusu = (h = 1, yakin = false) => { if (this.altyazi && h > 0.05) this.altyazi({ ozel: 'Gök gürlüyor' }, 0); return gok.call(this, h, yakin); };
    sar('ortam', ['ortam', 'damla', 'lav', 'dalga', 'ruzgar', 'gecitUgultu', 'diyarUgultu', 'gokGurultusu', 'meteorUguldu', 'kayanYildiz']);
    sar('arayuz', ['tik', 'ac', 'kapa', 'kitap', 'sayfa', 'basarim', 'gorev', 'seviye', 'xp', 'hataSes', 'takas', 'kalp']);
  }
  /* 0.47.0: gerilim katmanı: canavarlar oyuncuyu fark edince alttan gelen alçak bir uğultu ve yoğunluk arttıkça hızlanan davul.
     g 0..1 (müzik düzeyiyle çarpılmış olarak verilir); her karede çağrılır */
  gerilimAyarla(g, dt) {
    const c = this.ctx; if (!c) return;
    if (!this.gerilim) {
      if (g <= 0.01) return;
      const cik = c.createGain(); cik.gain.value = 0; cik.connect(this.ana);
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260; f.Q.value = 2; f.connect(cik);
      const o1 = c.createOscillator(), o2 = c.createOscillator(); o1.type = o2.type = 'sawtooth'; o1.frequency.value = 55; o2.frequency.value = 55.7;
      const og = c.createGain(); og.gain.value = 0.05; o1.connect(og); o2.connect(og); og.connect(f); o1.start(); o2.start();
      this.gerilim = { cik, f, o1, o2, t: 0 };
    }
    const G = this.gerilim, t = c.currentTime;
    G.cik.gain.setTargetAtTime(Math.min(1, g) * 0.9, t, 0.6);
    G.f.frequency.setTargetAtTime(220 + 260 * g, t, 0.5);
    /* Davul: yoğunluk 0,4'ün üstündeyken; aralık 0,85 → 0,5 saniye */
    G.t -= dt;
    if (g > 0.4 && G.t <= 0) {
      G.t = 0.85 - 0.35 * Math.min(1, (g - 0.4) / 0.6);
      const o = c.createOscillator(), gg = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.18);
      gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(0.35 * g, t + 0.01); gg.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      o.connect(gg); gg.connect(G.cik); o.start(t); o.stop(t + 0.3);
    }
    if (g <= 0.005 && G.cik.gain.value < 0.003) { G.o1.stop(); G.o2.stop(); G.cik.disconnect(); this.gerilim = null; }
  }
  /* 0.47.0: uyarı tonu (açlık, soğuk/sıcak, yanma başlangıcı): kısa, yumuşak iki nota */
  uyari(tur = 'aclik') {
    const o = this._kat; this._kat = 'arayuz';
    try {
      const [a, b] = tur === 'isi' ? [520, 390] : tur === 'ates' ? [700, 520] : [440, 330];
      this.ton(a, 0.16, 0.06, 'triangle', a); setTimeout(() => { const k = this._kat; this._kat = 'arayuz'; this.ton(b, 0.22, 0.06, 'triangle', b); this._kat = k; }, 150);
    } finally { this._kat = o; }
  }
  /* Kanal düzeyi: tur 'efekt' | 'canli' | 'ortam' | 'arayuz' (0..1) */
  kanalAyarla(tur, v) { this.kanalDuzey[tur] = Math.max(0, Math.min(1, v)); if (this.kanal && this.kanal[tur]) this.kanal[tur].gain.value = this.kanalDuzey[tur]; }
  /* Tek kanallı (mono) çıkış: stereo yönlendirme kapanır */
  monoAyarla(v) { this.mono = !!v; if (this.ctx) { this.ctx.destination.channelCount = v ? 1 : 2; } }
  hedef() { return this.kanal ? this.kanal[this._kat || 'efekt'] : this.ana; }
  baslat() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.ana = this.ctx.createGain(); this.ana.gain.value = this.duzey;
      /* 0.40.2: çok ses üst üste binince kırpılmayı önleyen sıkıştırıcı */
      const k = this.ctx.createDynamicsCompressor(); k.threshold.value = -10; k.knee.value = 8; k.ratio.value = 6; k.attack.value = 0.003; k.release.value = 0.2;
      /* 0.41.10: genel süzgeç (su altında sesler boğuklaşır) ve yankı (mağarada) */
      this.suzgec = this.ctx.createBiquadFilter(); this.suzgec.type = 'lowpass'; this.suzgec.frequency.value = 20000; this.suzgec.Q.value = 0.5;
      this.ana.connect(this.suzgec); this.suzgec.connect(k); k.connect(this.ctx.destination);
      this.yankiGir = this.ctx.createGain(); this.yankiGir.gain.value = 0;
      const yanki = this.ctx.createConvolver(); yanki.buffer = this.yankiTepkisi(2.2);
      this.ana.connect(this.yankiGir); this.yankiGir.connect(yanki); yanki.connect(this.suzgec);
      const n = this.ctx.sampleRate;
      this.gurultu = this.ctx.createBuffer(1, n, n);
      const d = this.gurultu.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      this.kanal = {};
      for (const t of Object.keys(this.kanalDuzey)) { const g = this.ctx.createGain(); g.gain.value = this.kanalDuzey[t]; g.connect(this.ana); this.kanal[t] = g; }
      if (this.mono) this.monoAyarla(true);
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
  /* ---------- 0.41.10: konumlu ses ----------
     Dinleyici (oyuncunun başı) her karede ayarlanır. konumlu(x, y, z, fn, menzil) içinde çalınan bütün sesler:
     - uzaklıkla azalır (menzilin ötesinde hiç çalmaz) ve uzaktaysa havada sönümlenerek tizlerini yitirir,
     - aradaki katı bloklar sayılarak boğuklaşır ve kısılır (her blok sesi yaklaşık yarıya indirir; 10 blok toprağın altındaki canlı duyulmaz),
     - kaynağın yönüne göre sağ ve sol kulağa dağıtılır (stereo). */
  dinleyiciAyarla(x, y, z, yaw, engel) { this.dinleyici = { x, y, z, yaw }; if (engel) this.engel = engel; }
  /* Dinleyici ile kaynak arasındaki katı blok sayısı (yarım bloklık adımlarla; aynı blok bir kez sayılır) */
  engelSay(x, y, z) {
    const L = this.dinleyici, E = this.engel;
    if (!L || !E) return 0;
    const dx = x - L.x, dy = y - L.y, dz = z - L.z, d = Math.hypot(dx, dy, dz);
    if (d < 1) return 0;
    const n = Math.min(80, Math.ceil(d / 0.5));
    let say = 0, son = '';
    for (let i = 1; i < n; i++) {
      const t = i / n, bx = Math.floor(L.x + dx * t), by = Math.floor(L.y + dy * t), bz = Math.floor(L.z + dz * t), k = bx + ',' + by + ',' + bz;
      if (k === son) continue;
      son = k;
      if (E(bx, by, bz)) { say++; if (say >= 12) break; }
    }
    return say;
  }
  konumlu(x, y, z, fn, menzil = 32) {
    const L = this.dinleyici;
    if (!this.ctx || !L) { fn(); return; }
    const dx = x - L.x, dy = y - L.y, dz = z - L.z, d = Math.hypot(dx, dy, dz);
    if (d >= menzil) return;
    const n = this.engelSay(x, y, z);
    const kat = Math.pow(1 - d / menzil, 1.4) * Math.pow(0.5, n);
    if (kat < 0.012) return;
    const sag = Math.cos(L.yaw) * dx - Math.sin(L.yaw) * dz;
    this._k = { kat, pan: d < 0.8 ? 0 : Math.max(-0.85, Math.min(0.85, sag / Math.max(1, Math.hypot(dx, dz)))), kesim: Math.max(280, 18000 / (1 + d / 14) * Math.pow(0.28, n)) };
    try { fn(); } finally { this._k = null; }
  }
  /* Sesin bağlanacağı yer: konumlu çalarken süzgeç ve stereo yönlendirici, değilse ana çıkış */
  cikis() {
    const K = this._k, H = this.hedef();
    if (!K) return H;
    const c = this.ctx, f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = K.kesim; f.Q.value = 0.5;
    if (c.createStereoPanner && !this.mono) { const p = c.createStereoPanner(); p.pan.value = K.pan; f.connect(p); p.connect(H); } else f.connect(H);
    return f;
  }
  /* Ortam: su altında genel boğukluk, mağarada yankı (yumuşak geçişli) */
  ortamAyarla({ suAlti = false, yanki = 0 } = {}) {
    if (!this.ctx || !this.suzgec) return;
    const t = this.ctx.currentTime;
    this.suzgec.frequency.setTargetAtTime(suAlti ? 650 : 20000, t, 0.15);
    this.yankiGir.gain.setTargetAtTime(Math.max(0, Math.min(0.6, yanki)), t, 0.5);
  }
  /* Yapay yankı tepkisi: iki kanallı, üstel sönen gürültü (mağara yankısı) */
  yankiTepkisi(sure) {
    const c = this.ctx, n = Math.floor(c.sampleRate * sure), b = c.createBuffer(2, n, c.sampleRate);
    for (let k = 0; k < 2; k++) { const d = b.getChannelData(k); for (let i = 0; i < n; i++) { const t = i / n; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 3.2) * (i < c.sampleRate * 0.012 ? 0 : 1); } }
    return b;
  }
  /* Kayıttan çalar (rastgele değişke, hafif perde oynaması); kayıt yoksa false */
  /* 0.40.2: kayıtların düzeyi türüne göre dosyada dengelenmiştir (ses/LISANS.md); ses yalnızca uzaklık ve küçük ayar çarpanıdır */
  cal(g, ses = 1, hiz = 1) {
    const c = this.ctx, l = g && this.ornekler[g];
    if (!c || !l || !l.length) return false;
    if (this._k) ses *= this._k.kat;
    if (ses <= 0.005) return true;
    const k = c.createBufferSource(); k.buffer = l[Math.floor(Math.random() * l.length)];
    k.playbackRate.value = hiz * (0.94 + Math.random() * 0.12);
    const s = c.createGain(); s.gain.value = Math.min(1.5, ses);
    k.connect(s); s.connect(this.cikis()); k.start();
    return k;
  }
  /* Uzun ortam kayıtları (dalga, lav, mağara, rüzgâr): önceki bitmeden aynısı yeniden başlamaz, üst üste binmez */
  calTek(g, ses = 1, hiz = 1) {
    const c = this.ctx; if (!c) return false;
    this.tekil = this.tekil || {};
    if ((this.tekil[g] || 0) > c.currentTime) return !!(this.ornekler[g] && this.ornekler[g].length);
    const k = this.cal(g, ses, hiz);
    if (k && k.buffer) this.tekil[g] = c.currentTime + k.buffer.duration / k.playbackRate.value * 0.85;
    return !!k;
  }
  calTam(g, ses = 1, hiz = 1) {
    const c = this.ctx, l = g && this.ornekler[g];
    if (!c || !l || !l.length) return false;
    const k = c.createBufferSource(); k.buffer = l[0]; k.playbackRate.value = hiz;
    const s = c.createGain(); s.gain.value = ses; k.connect(s); s.connect(this.hedef()); k.start();
    return true;
  }
  /* Ağır adım (Kül Devi): kaya darbesi alçak perdede */
  sut() { if (!this.cal('sut', 1)) this.sicrama(0.4); }
  kirp() { if (!this.cal('kirp', 1)) this.zirhGiy(); }
  agirAdim(h = 1) { if (this.cal('koy_tas', h, 0.5)) return; this.patlama(90, 0.18, 0.12 * h, 'lowpass', 1); }
  /* Havai fişek: fırlatma ve patlama */
  fisekAt() { if (this.cal('roket', 0.9)) return; this.patlama(900, 0.4, 0.12, 'highpass', 1); }
  fisekPatla() { if (this.cal('patlama', 0.45, 1.4)) return; this.patlama(220, 0.7, 0.3, 'lowpass', 1); }
  duzeyAyarla(v) { this.duzey = v; if (this.ana) this.ana.gain.value = v; }

  /* Filtrelenmiş gürültü patlaması */
  patlama(frekans, sure, ses = 0.5, tur = 'bandpass', q = 1.2, kayma = 1) {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime;
    const k = c.createBufferSource(); k.buffer = this.gurultu; k.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = c.createBiquadFilter(); f.type = tur; f.frequency.setValueAtTime(frekans, t); f.frequency.exponentialRampToValueAtTime(Math.max(40, frekans * kayma), t + sure); f.Q.value = q;
    if (this._k) ses = Math.max(0.0002, ses * this._k.kat);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(ses, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
    k.connect(f); f.connect(g); g.connect(this.cikis());
    k.start(t, Math.random() * 0.5); k.stop(t + sure + 0.05);
  }
  ton(frekans, sure, ses = 0.2, tur = 'sine', bitis = frekans) {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator(); o.type = tur; o.frequency.setValueAtTime(frekans, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, bitis), t + sure);
    if (this._k) ses = Math.max(0.0002, ses * this._k.kat);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(ses, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
    o.connect(g); g.connect(this.cikis()); o.start(t); o.stop(t + sure + 0.05);
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
      case 'buz': return [3600, 0.1, 3];
      case 'metal': return [2400, 0.12, 6];
      case 'yun': return [1600, 0.08, 0.5];
      default: return [900, 0.09, 1];
    }
  }
  kaz(tur) { const [g0, h0] = G_(KAZ[tur]); if (this.cal(g0, 0.8, h0)) return; const [f, s, q] = this.malzeme(tur); this.patlama(f, s, 0.32, 'bandpass', q); if (tur === 'odun') this.ton(180, 0.06, 0.12, 'triangle', 120); }
  kir(tur) {
    { const [g0, h0] = G_(KIR[tur]); if (this.cal(g0, 1, tur === 'tas' ? 0.8 : h0)) return; }
    const [f, s, q] = this.malzeme(tur);
    this.patlama(f, s * 2.4, 0.55, 'bandpass', q, 0.6);
    if (tur === 'cam') { this.ton(2400, 0.15, 0.08, 'triangle', 3200); this.ton(3100, 0.2, 0.06, 'triangle', 1800); }
    if (tur === 'tas') this.patlama(300, 0.12, 0.3, 'lowpass', 1);
  }
  koy(tur) { const [g0, h0] = G_(KOY[tur]); if (this.cal(g0, 0.9, h0)) return; const [f, s, q] = this.malzeme(tur); this.patlama(f * 0.8, s * 1.4, 0.45, 'bandpass', q, 0.7); }
  adim(tur) { const [g0, h0] = G_(ADIM[tur]); if (this.cal(g0, 1, h0)) return; const [f, , q] = this.malzeme(tur); this.patlama(f * 0.7, 0.07, 0.14, 'bandpass', q); }
  topla() { if (this.cal('topla', 1, 1.1)) return; this.ton(780 + Math.random() * 120, 0.08, 0.1, 'sine', 1300); }
  ye() { if (this.cal('hayvan_ye', 1, 1.15)) return; for (let i = 0; i < 3; i++) setTimeout(() => this.patlama(1800, 0.06, 0.25, 'bandpass', 1.4), i * 110); }
  hasar() { if (this.cal('hasar', 1)) return; this.ton(220, 0.18, 0.25, 'sawtooth', 110); this.patlama(500, 0.12, 0.3, 'lowpass', 1); }
  zipla() { if (this.cal('adim_cim', 0.7, 0.85)) return; this.patlama(600, 0.05, 0.08, 'lowpass', 1); }
  sicrama(g = 1) { if (this.cal('sicrama', Math.min(1, g))) return; this.patlama(1200, 0.4 * g, 0.4, 'lowpass', 0.7, 0.4); }
  aletKirildi() { if (this.cal('alet_kir', 1)) return; this.cal('kir_metal', 0.7); this.ton(900, 0.12, 0.2, 'square', 300); this.patlama(2500, 0.2, 0.3, 'highpass', 1); }
  uretim() { if (this.cal('koy_odun', 0.6, 1.25)) return; this.ton(520, 0.06, 0.1, 'triangle', 700); setTimeout(() => this.ton(780, 0.08, 0.1, 'triangle', 1040), 60); }
  /* Canlı sesleri: tip 'normal' | 'acima' | 'olum'; hacim 0..1 (uzaklığa göre) */
  canli(tur, tip = 'normal', hacim = 1) {
    if (!this.ctx || hacim <= 0.02) return;
    const C = CANLI[tur];
    if (C) {
      const k = C[tip] || (tip === 'saldiri' ? C.normal : C.acima) || C.normal;
      if (this.cal(k[0], Math.min(1, hacim) * (k[2] ?? 1), k[1] ?? 1)) return;
    }
    if (tip === 'saldiri') tip = 'acima';
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
  yayGer() { if (this.cal('deri', 0.8, 0.8)) return; this.patlama(900, 0.25, 0.08, 'bandpass', 3, 1.4); }
  yayAt() { if (this.cal('yay_at', 1)) return; this.ton(180, 0.18, 0.18, 'triangle', 90); this.patlama(2000, 0.12, 0.15, 'highpass', 1); }
  okIsabet() { if (this.cal('ok_isabet', 1)) return; this.patlama(700, 0.12, 0.3, 'bandpass', 1.5); }
  okSaplandi() { if (this.cal('ok_isabet', 0.8, 0.8)) return; this.patlama(450, 0.1, 0.22, 'bandpass', 2); this.ton(160, 0.08, 0.1, 'triangle', 120); }
  /* 0.45.0: savunmada darbe karşılama (metal) ve savuşturma */
  savunma(tam) { if (this.cal('kaz_metal', tam ? 1 : 0.7, tam ? 1.25 : 0.9)) return; this.patlama(tam ? 2200 : 1400, 0.12, 0.2, 'bandpass', 3); }
  vurus() { if (this.cal('vurus', 1)) return; this.patlama(800, 0.08, 0.25, 'bandpass', 1); }
  zirhGiy() { if (this.cal('kumas', 1)) return; this.patlama(1800, 0.15, 0.2, 'bandpass', 2); }
  takas() { this.cal('koylu_evet', 0.8); if (this.cal('para', 1)) return; this.ton(1320, 0.08, 0.08, 'triangle', 1760); setTimeout(() => this.ton(1760, 0.1, 0.07, 'triangle', 2100), 70); }
  gorev() { if (this.cal('gorev', 1)) return; [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.ton(f, 0.16, 0.07, 'triangle', f), i * 90)); }
  /* 0.41.0: biyom ortam sesleri. Uzun kayıtlar (rüzgâr, dere, şelale, çekirge) üst üste binmez; kısa çağrılar (kuş, baykuş) perde ve düzeyce değişir */
  ortam(g, h = 1, uzun = false) {
    if (uzun) return this.calTek(g, h);
    return this.cal(g, h, 0.92 + Math.random() * 0.16);
  }
  /* Mağara ortam sesleri */
  damla(h = 1) { if (this.cal('damla', h)) return; this.ton(1500 + Math.random() * 900, 0.18, 0.05 * h, 'sine', 900); }
  lav(h = 1) { if ((Math.random() < 0.5 ? this.calTek('lav_ortam', h) : this.cal('lav', h))) return; this.patlama(180 + Math.random() * 120, 0.25, 0.12 * h, 'lowpass', 2, 0.5); }
  atesTopu() { if (this.cal('ates_topu', 1)) return; this.patlama(600, 0.45, 0.2, 'bandpass', 0.7, 0.5); this.ton(160, 0.35, 0.08, 'sawtooth', 70); }
  yanma() { if (this.cal('ates', 1)) return; this.patlama(900, 0.3, 0.12, 'bandpass', 0.8, 1.5); }
  /* Deniz: olta, tekne, dalış */
  olta(tip) {
    if (tip === 'at' && this.cal('firlat', 1)) return;
    if ((tip === 'dusme' || tip === 'isirma') && this.cal('olta_dus', tip === 'isirma' ? 1 : 0.7, tip === 'isirma' ? 0.8 : 1)) return;
    if (tip === 'cek' && this.cal('olta_cek', 1)) return;
    if (tip === 'yakala' && this.cal('sicrama', 0.9, 1.1)) return;
    if (tip === 'at') { this.patlama(2600, 0.22, 0.1, 'highpass', 1, 0.5); this.ton(500, 0.2, 0.04, 'triangle', 250); }
    else if (tip === 'dusme') this.patlama(900, 0.18, 0.18, 'lowpass', 1.2, 0.5);
    else if (tip === 'isirma') { this.patlama(1300, 0.3, 0.3, 'lowpass', 0.8, 0.4); this.patlama(2600, 0.15, 0.12, 'bandpass', 1); }
    else if (tip === 'cek') for (let i = 0; i < 4; i++) setTimeout(() => this.ton(1800, 0.025, 0.05, 'square', 1500), i * 45);
    else if (tip === 'yakala') { this.patlama(1100, 0.35, 0.3, 'lowpass', 0.8, 0.4); setTimeout(() => this.ton(880, 0.1, 0.08, 'triangle', 1320), 120); }
  }
  kurek(h = 1) { if (this.cal('su_adim', h)) return; this.patlama(700 + Math.random() * 200, 0.32, 0.16 * h, 'lowpass', 0.9, 0.45); }
  /* 0.41.9: su sesi kısıldı (duyulacak kadar) */
  dalga(h = 1) { h *= 0.45; if (this.calTek('su', h)) return; this.patlama(420 + Math.random() * 120, 1.2, 0.07 * h, 'lowpass', 0.6, 0.6); }
  /* 0.11.0: kapı, deneyim, iksir, örs, hava */
  kapi(acik) { if (this.cal(acik ? 'kapi_ac' : 'kapi_kapa', 1)) return; this.patlama(acik ? 700 : 520, 0.14, 0.3, 'bandpass', 2.2, acik ? 1.3 : 0.7); this.ton(acik ? 200 : 150, 0.08, 0.12, 'triangle', acik ? 260 : 110); }
  xp() { if (this.cal('nota_zil', 0.35, 1.6 + Math.random() * 0.5)) return; this.ton(1600 + Math.random() * 500, 0.09, 0.05, 'sine', 2300); }
  seviye() { if (this.cal('seviye', 1)) return; [660, 880, 1320].forEach((f, i) => setTimeout(() => this.ton(f, 0.22, 0.07, 'triangle', f * 1.01), i * 80)); }
  ic() { if (this.cal('ic', 1)) return; for (let i = 0; i < 3; i++) setTimeout(() => this.patlama(900, 0.08, 0.18, 'lowpass', 2, 0.6), i * 130); }
  ors() { if (this.cal('koy_metal', 1, 0.75)) { this.cal('nota_zil', 0.4, 0.9); return; } this.ton(1250, 0.5, 0.12, 'triangle', 1180); this.ton(1890, 0.4, 0.05, 'sine', 1850); this.patlama(3000, 0.1, 0.25, 'highpass', 1); }
  /* 0.14.0: büyüleme ve başarım */
  buyu() { if (this.cal('buyu', 1)) return; [784, 1175, 1568, 2093].forEach((f, i) => setTimeout(() => this.ton(f, 0.5, 0.05, 'sine', f * 1.02), i * 70)); this.patlama(4000, 0.6, 0.06, 'highpass', 0.6, 1.4); }
  basarim() { if (this.cal('basarim', 1)) return; [523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => this.ton(f, 0.28, 0.07, 'triangle', f), i * 85)); }
  /* 0.15.1: boss efektleri */
  ruzgar(h = 1) { if (this.calTek('ruzgar', h)) return; this.patlama(900, 1.4, 0.12 * h, 'bandpass', 0.7, 0.9); this.patlama(2400, 1.0, 0.05 * h, 'highpass', 0.6, 0.8); }
  cam(h = 1) { if (this.cal('kir_cam', h)) return; for (let i = 0; i < 4; i++) setTimeout(() => this.ton(2600 + Math.random() * 1400, 0.18, 0.05 * h, 'triangle', 3400), i * 45); this.patlama(5000, 0.25, 0.07 * h, 'highpass', 1.2); }
  savur(h = 1) { if (this.cal('kilic', h, 0.85)) return; this.patlama(600, 0.35, 0.14 * h, 'bandpass', 1.4, 0.4); this.patlama(1400, 0.25, 0.08 * h, 'bandpass', 1.4, 0.4); }
  /* 0.17.0: mekanik sesler ve müzik kutusu ezgileri (tur: 0 piyano, 1 bas, 2 zil, 3 flüt, 4 davul) */
  kol(acik) { if (this.cal('kol', 1, acik ? 1.1 : 0.9)) return; this.ton(acik ? 900 : 700, 0.04, 0.08, 'square', acik ? 1100 : 500); this.patlama(2200, 0.03, 0.08, 'highpass', 1); }
  /* 0.18.0: Diyar Geçidi */
  gecitAcil() { if (this.cal('gecit_ac', 1)) return; this.ton(140, 1.4, 0.16, 'sawtooth', 420); this.ton(210, 1.2, 0.08, 'sine', 630); this.patlama(500, 1.0, 0.18, 'bandpass', 1.4, 2); }
  gecitSon() { if (this.cal('isinlanma', 1, 0.7)) return; this.ton(420, 0.8, 0.12, 'sawtooth', 120); this.patlama(700, 0.5, 0.12, 'bandpass', 1.2, 0.5); }
  gecitUgultu() { this.ton(95 + Math.random() * 10, 1.2, 0.07, 'sine', 120); this.ton(190, 1.2, 0.03, 'triangle', 240); }
  gecis() { if (this.cal('gecis', 1)) return; this.patlama(400, 1.2, 0.3, 'bandpass', 1.0, 3); this.ton(660, 0.9, 0.1, 'sine', 110); }
  diyarUgultu() { const s = this.ctx ? this.ctx.currentTime : 0; if (s > (this.magaraSon || 0) + 14 && Math.random() < 0.3 && this.calTek('magara', 1, 0.85)) { this.magaraSon = s; return; } this.ton(48 + Math.random() * 8, 3.5, 0.05, 'sine', 40); this.patlama(160, 2.5, 0.05, 'lowpass', 0.8, 0.6); }
  /* 0.38.1: çakmak çakma sesi: iki kısa kıvılcım */
  cakmak() { if (!this.ctx) return; if (this.cal('cakmak', 1)) return; this.patlama(3200, 0.04, 0.16, 'highpass', 2); setTimeout(() => this.patlama(2600, 0.06, 0.12, 'highpass', 2), 70); }
  dugme() { if (this.cal('dugme', 1)) return; this.ton(1000, 0.03, 0.07, 'square', 800); }
  melodi(tur = 0, h = 1) {
    if (!this.ctx) return;
    const notalar = [[523, 659, 784, 1047], [131, 165, 196, 262], [1047, 1319, 1568, 2093], [587, 740, 880, 1175], [0, 0, 0, 0]][tur] || [523, 659, 784, 1047];
    /* 0.40.0: çalgı kaydı notaya göre perdelenir (ilk nota kaydın kendi perdesidir) */
    const cg = CALGI[tur] || CALGI[0];
    if (this.ornekler[cg] && this.ornekler[cg].length) {
      notalar.forEach((n, i) => setTimeout(() => this.calTam(cg, 0.9 * h, tur === 4 ? (i % 2 ? 1.6 : 1) : n / notalar[0]), i * 150));
      return;
    }
    const dalga = ['triangle', 'sawtooth', 'sine', 'sine', 'square'][tur] || 'triangle';
    notalar.forEach((n, i) => setTimeout(() => { if (tur === 4) this.patlama(i % 2 ? 1800 : 160, 0.12, 0.3 * h, i % 2 ? 'highpass' : 'lowpass', 1); else this.ton(n, tur === 2 ? 0.5 : 0.22, (tur === 1 ? 0.16 : 0.1) * h, dalga, n); }, i * 150));
  }
  /* Nal sesi: iki vuruş; h hıza göre */
  nal(h = 1) { if (this.cal('adim_tas', 0.6 * h + 0.4, 1.35)) { setTimeout(() => this.cal('adim_tas', 0.5 * h + 0.35, 1.25), 110); return; } this.patlama(900, 0.05, 0.12 * h + 0.04, 'bandpass', 3); setTimeout(() => this.patlama(760, 0.05, 0.1 * h + 0.03, 'bandpass', 3), 110); }
  kalp() { if (this.cal('nota_zil', 0.5, 1.4)) return; this.ton(880, 0.12, 0.05, 'sine', 1100); }
  /* Yağmur: sürekli çalan süzülmüş gürültü; hacim 0..1, boguk: çatı altında */
  yagmurAyarla(hacim, boguk) {
    const c = this.ctx; if (!c) return;
    if (!this.yagmur) {
      if (hacim <= 0.01) return;
      const kayit = this.ornekler.yagmur && this.ornekler.yagmur[0];
      const k = c.createBufferSource(); k.buffer = kayit || this.gurultu; k.loop = true;
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = kayit ? 16000 : 2400; f.Q.value = 0.4;
      const b = c.createBiquadFilter(); b.type = 'highpass'; b.frequency.value = kayit ? 40 : 300;
      const g = c.createGain(); g.gain.value = 0;
      k.connect(b); b.connect(f); f.connect(g); g.connect(this.kanal ? this.kanal.ortam : this.ana); k.start();
      this.yagmur = { k, f, g };
    }
    const Y = this.yagmur, t = c.currentTime;
    const kayitli = Y.k.buffer !== this.gurultu;
    Y.g.gain.setTargetAtTime(Math.max(0, hacim) * (kayitli ? 0.9 : 0.16), t, 0.4);
    /* 0.47.0: çatı altında boğukluk çatının malzemesine göre: metal ve cam çınlar, ahşap ve yaprak orta, taş en boğuk */
    const cati = { metal: 2600, cam: 2200, buz: 2000, odun: 1100, bitki: 1400, yun: 600, tas: 650 }[boguk] || 700;
    Y.f.frequency.setTargetAtTime(boguk ? cati : kayitli ? 16000 : 2400, t, 0.3);
    if (hacim <= 0.01 && Y.g.gain.value < 0.002) { try { Y.k.stop(); } catch (e) { /* durmuş */ } this.yagmur = null; }
  }
  gokGurultusu(h = 1, yakin = false) {
    if (!this.ctx || h <= 0.02) return;
    /* Kayıt: uzaktaysa alçak geçiren süzgeçle boğuklaşır */
    if (this.ornekler.gok && this.ornekler.gok.length) {
      const c = this.ctx, k = c.createBufferSource(), l = this.ornekler.gok;
      k.buffer = l[Math.floor(Math.random() * l.length)]; k.playbackRate.value = 0.9 + Math.random() * 0.2;
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = yakin ? 18000 : 700 + h * 2500;
      const g = c.createGain(); g.gain.value = Math.min(1, h);
      k.connect(f); f.connect(g); g.connect(this.hedef()); k.start();
      return;
    }
    if (yakin) { this.patlama(3800, 0.25, 0.45 * h, 'highpass', 0.7, 0.5); this.patlama(900, 0.5, 0.4 * h, 'lowpass', 0.8, 0.4); }
    this.patlama(160, 2.8, 0.55 * h, 'lowpass', 1.4, 0.5);
    setTimeout(() => this.patlama(110, 2.2, 0.35 * h, 'lowpass', 1.2, 0.6), 350);
  }
  tik() { if (this.cal('tik', 1)) return; this.ton(1200, 0.03, 0.06, 'square', 900); }
  /* 0.40.1: pencere açılma sesi kaldırıldı */
  ac() { }
  kapa() { if (this.cal('pencere_kapa', 1)) return; this.ton(660, 0.06, 0.06, 'triangle', 440); }
  /* 0.19.0: yalnızca kayıtla çalan sesler (kayıt yoksa en yakın sentez ses) */
  sandik() { if (!this.cal('sandik', 1)) this.ac(); }
  kitap(acik = true) { if (!this.cal(acik ? 'kitap_ac' : 'kitap_kapa', 1)) (acik ? this.ac() : this.kapa()); }
  sayfa() { if (!this.cal('sayfa', 1)) this.tik(); }
  tencere() { this.cal('tencere', 1); }
  olum() { this.cal('olum', 1); }
  /* 0.22.0: gök olayları ve hayatta kalma */
  meteorUguldu(h = 1) { if (this.calTek('roket', h, 0.45)) { this.cal('ruzgar', 0.8 * h, 0.6); return; } this.patlama(300, 3.0, 0.22 * h, 'lowpass', 0.7, 0.35); this.ton(220, 3.0, 0.05 * h, 'sawtooth', 60); this.patlama(1800, 2.6, 0.06 * h, 'bandpass', 0.6, 0.5); }
  meteorCarpma(h = 1) { if (this.cal('patlama', h, 0.8)) { if (h > 0.3) this.gokGurultusu(h * 0.6, true); return; } this.patlama(140, 2.4, 0.9 * h, 'lowpass', 0.8, 0.3); this.patlama(900, 0.8, 0.5 * h, 'bandpass', 0.6, 0.4); this.ton(55, 1.8, 0.3 * h, 'sine', 30); if (h > 0.3) this.gokGurultusu(h, true); }
  kayanYildiz() { this.ton(2400 + Math.random() * 600, 0.5, 0.012, 'sine', 1400); }
  kanliAy() { if (this.cal('kanli_ay', 1, 0.85)) return; [110, 104, 98, 82].forEach((f, i) => setTimeout(() => { this.ton(f, 1.6, 0.14, 'sawtooth', f * 0.97); this.ton(f * 1.5, 1.4, 0.05, 'triangle', f * 1.45); }, i * 900)); this.patlama(200, 4, 0.12, 'lowpass', 0.6, 0.5); }
  kalpAtisi(h = 1) { this.ton(60, 0.12, 0.25 * h, 'sine', 40); setTimeout(() => this.ton(55, 0.14, 0.2 * h, 'sine', 38), 180); }
  titreme() { this.patlama(2600, 0.25, 0.03, 'bandpass', 4, 1.1); }
  kemik() { if (this.cal('iskelet_acima', 0.9, 0.9)) return; this.patlama(2200, 0.06, 0.5, 'highpass', 1); this.patlama(600, 0.1, 0.4, 'bandpass', 2); }
  tilsim() { if (this.cal('tilsim', 1)) return; [392, 523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => this.ton(f, 0.5, 0.06, 'sine', f * 1.02), i * 120)); this.patlama(3000, 1.2, 0.05, 'highpass', 0.6, 1.6); }
  hataSes() { if (!this.cal('hata', 1)) this.ton(220, 0.12, 0.06, 'square', 180); }
}
