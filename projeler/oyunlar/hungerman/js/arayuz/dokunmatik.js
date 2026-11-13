/* HungerMan - dokunmatik kontroller (0.19.0)
   Sol altta sanal kol (yürüme; sonuna kadar itince koşu), ekranın geri kalanında parmakla sürükleyerek bakış.
   Ekrana kısa dokunma: kullan / koy (sağ tık); parmağı basılı tutma: kır / saldır (sol tık).
   Sağ altta Zıpla, Eğil, Kır, Kullan; üstte Çanta, Etkileşim, At, Harita, Kitap ve Duraklat düğmeleri. Alt çubuktaki yuvalara dokunarak eşya seçilir.
   Dokunuşlar, klavye ve fare durumlarına (tus, fare) çevrilir; oyunun geri kalanı aynı kodla çalışır. */
const $ = s => document.querySelector(s);
const ESIK = 0.32;             // kolun yön sayılması için en az itme oranı
const BASILI_TUT = 0.33;       // saniye: bu süreden uzun basılı tutma kırma sayılır
const KAYMA = 12;              // piksel: bundan fazla kayan dokunuş bakış sayılır

export const dokunmatikCihaz = () => !!(window.matchMedia && matchMedia('(pointer: coarse)').matches && (navigator.maxTouchPoints || 0) > 0);

export class Dokunmatik {
  constructor(o) {
    Object.assign(this, o);   // tus, fare, bak(dx, dy), eylem(ad), oyunda(): oyun ekranında ve kilitli mi, kilitle(), kosKilit(v)
    this.aktif = false;
    this.kol = null;          // { id, x, y }
    this.bakis = new Map();   // dokunuş kimliği -> { x, y, t, kaydi }
    this.kok = $('#dokun');
    this.topuz = $('#dkTopuz');
    this.kolAlan = $('#dkKol');
    this.kurulu = false;
  }
  ayarla(acik) {
    this.aktif = !!acik;
    document.body.classList.toggle('dokunmatik', this.aktif);
    this.kok.hidden = !this.aktif;
    $('#tikla b').textContent = this.aktif ? 'Devam etmek için dokununuz' : 'Devam etmek için tıklayın';
    if (this.aktif && !this.kurulu) this.kur();
    if (!this.aktif) this.sifirla();
  }
  sifirla() {
    const t = this.tus;
    t.KeyW = t.KeyS = t.KeyA = t.KeyD = t.Space = t.KeyC = false;
    this.fare.sol = this.fare.sag = false;
    this.kol = null; this.bakis.clear(); this.kosKilit(false);
    this.topuz.style.transform = '';
    for (const b of this.kok.querySelectorAll('.basili')) b.classList.remove('basili');
  }

  kur() {
    this.kurulu = true;
    const ops = { passive: false };
    /* Sanal kol */
    this.kolAlan.addEventListener('touchstart', e => {
      e.preventDefault();
      if (!this.oyunda()) { this.kilitle(); return; }
      const d = e.changedTouches[0], r = this.kolAlan.getBoundingClientRect();
      this.kol = { id: d.identifier, x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2 };
      this.kolGuncelle(d);
    }, ops);
    /* Bakış ve dokunarak kullanma / basılı tutarak kırma: tuvalin üstünde */
    const tuval = $('#oyun');
    tuval.addEventListener('touchstart', e => {
      if (!this.aktif) return;
      e.preventDefault();
      if (!this.oyunda()) { this.kilitle(); return; }
      for (const d of e.changedTouches) this.bakis.set(d.identifier, { x: d.clientX, y: d.clientY, ox: d.clientX, oy: d.clientY, t: performance.now(), kaydi: false, kiriyor: false });
    }, ops);
    addEventListener('touchmove', e => {
      if (!this.aktif) return;
      for (const d of e.changedTouches) {
        if (this.kol && d.identifier === this.kol.id) { e.preventDefault(); this.kolGuncelle(d); continue; }
        const b = this.bakis.get(d.identifier);
        if (!b) continue;
        e.preventDefault();
        const dx = d.clientX - b.x, dy = d.clientY - b.y;
        b.x = d.clientX; b.y = d.clientY;
        if (!b.kaydi && Math.hypot(d.clientX - b.ox, d.clientY - b.oy) > KAYMA) b.kaydi = true;
        if (b.kaydi && this.oyunda()) this.bak(dx, dy);
      }
    }, ops);
    const bitir = e => {
      if (!this.aktif) return;
      for (const d of e.changedTouches) {
        if (this.kol && d.identifier === this.kol.id) { this.kol = null; this.topuz.style.transform = ''; const t = this.tus; t.KeyW = t.KeyS = t.KeyA = t.KeyD = false; this.kosKilit(false); continue; }
        const b = this.bakis.get(d.identifier);
        if (!b) continue;
        this.bakis.delete(d.identifier);
        if (b.kiriyor) { this.fare.sol = false; continue; }
        /* Kısa dokunma: kullan / koy */
        if (!b.kaydi && performance.now() - b.t < BASILI_TUT * 1000 && this.oyunda()) this.tikla('sag');
      }
    };
    addEventListener('touchend', bitir); addEventListener('touchcancel', bitir);
    /* Düğmeler: basılı tutulanlar (zıpla, eğil, kır, kullan) ve tek dokunuşluklar */
    for (const b of this.kok.querySelectorAll('[data-dk]')) {
      const ad = b.dataset.dk, tut = { zipla: 'Space', egil: 'KeyC' }[ad];
      b.addEventListener('touchstart', e => {
        e.preventDefault(); e.stopPropagation();
        if (!this.oyunda() && ad !== 'menu') { this.kilitle(); return; }
        b.classList.add('basili');
        if (tut) this.tus[tut] = true;
        else if (ad === 'kir') this.fare.sol = true;
        else if (ad === 'kullan') this.fare.sag = true;
        else this.eylem(ad);
      }, ops);
      const birak = e => {
        e.preventDefault();
        b.classList.remove('basili');
        if (tut) this.tus[tut] = false;
        else if (ad === 'kir') this.fare.sol = false;
        else if (ad === 'kullan') this.fare.sag = false;
      };
      b.addEventListener('touchend', birak, ops); b.addEventListener('touchcancel', birak, ops);
    }
    /* Alt çubuk: yuvaya dokunarak seçim */
    $('#cubuk').addEventListener('touchstart', e => {
      const y = e.target.closest('.yuva');
      if (!y) return;
      e.preventDefault();
      this.eylem('yuva', [...y.parentNode.children].indexOf(y));
    }, ops);
  }
  /* Sanal kolun yönü klavye tuşlarına çevrilir; sonuna kadar ileri itilirse koşulur */
  kolGuncelle(d) {
    const k = this.kol;
    let dx = (d.clientX - k.x) / k.r, dy = (d.clientY - k.y) / k.r;
    const m = Math.hypot(dx, dy);
    if (m > 1) { dx /= m; dy /= m; }
    this.topuz.style.transform = `translate(${(dx * k.r * 0.6).toFixed(1)}px, ${(dy * k.r * 0.6).toFixed(1)}px)`;
    const t = this.tus;
    t.KeyW = dy < -ESIK; t.KeyS = dy > ESIK; t.KeyA = dx < -ESIK; t.KeyD = dx > ESIK;
    this.kosKilit(dy < -0.9 && Math.abs(dx) < 0.45);
  }
  /* Basılı tutma süresi dolan dokunuş kırmaya başlar */
  guncelle() {
    if (!this.aktif) return;
    const n = performance.now();
    for (const b of this.bakis.values()) if (!b.kaydi && !b.kiriyor && n - b.t > BASILI_TUT * 1000) { b.kiriyor = true; this.fare.sol = true; }
  }
  /* Kısa sağ / sol tıklama */
  tikla(tus) { this.fare[tus] = true; setTimeout(() => { this.fare[tus] = false; }, 90); }
}
