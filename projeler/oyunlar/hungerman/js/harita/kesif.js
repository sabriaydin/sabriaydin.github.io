/* HungerMan - toplu harita keşfi (geliştirici modu): verilen parçalar işçilerde üretilir ve haritaya işlenir.
   İşçilerden gelen sonuçlar kare başına kısa bir zaman bütçesiyle haritaya yazılır; oyun akıcı kalır. */
const PAKET = 16, BUTCE_MS = 5, KUYRUK_SINIRI = 8;

export class HaritaKesif {
  /* liste: [[cx, cz], ...] (işlenecek sırada) */
  constructor(harita, tohum, liste) {
    this.harita = harita; this.liste = liste; this.sira = 0; this.biten = 0; this.eklenen = 0;
    this.kuyruk = []; this.kuyrukSira = 0; this.bosta = []; this.durdu = false; this.hata = null;
    const n = Math.max(1, Math.min(2, (navigator.hardwareConcurrency || 4) - 2));
    this.isciler = [];
    for (let i = 0; i < n; i++) {
      const w = new Worker(new URL('./kesif-isci.js', import.meta.url), { type: 'module' });
      w.onmessage = e => { this.kuyruk.push(e.data); this.ver(w); };
      w.onerror = e => { this.hata = e.message || 'Keşif işçisi çalışmadı.'; };
      w.postMessage({ tur: 'baslat', tohum });
      this.isciler.push(w);
      this.ver(w);
    }
  }
  get toplam() { return this.liste.length; }
  get oran() { return this.liste.length ? this.biten / this.liste.length : 1; }
  get bitti() { return this.biten >= this.liste.length; }
  /* İşçiye sıradaki paketi ver; kuyruk doluysa işçi bekletilir */
  ver(w) {
    if (this.durdu || this.sira >= this.liste.length) return;
    if (this.kuyruk.length >= KUYRUK_SINIRI) { this.bosta.push(w); return; }
    const son = Math.min(this.liste.length, this.sira + PAKET), l = new Int32Array((son - this.sira) * 2);
    for (let i = this.sira; i < son; i++) { l[(i - this.sira) * 2] = this.liste[i][0]; l[(i - this.sira) * 2 + 1] = this.liste[i][1]; }
    this.sira = son;
    w.postMessage({ tur: 'is', l }, [l.buffer]);
  }
  /* Her karede: gelen parçalar haritaya işlenir */
  guncelle() {
    const t0 = performance.now(), H = this.harita;
    while (this.kuyruk.length && performance.now() - t0 < BUTCE_MS) {
      const m = this.kuyruk[0], n = m.l.length / 2;
      while (this.kuyrukSira < n && performance.now() - t0 < BUTCE_MS) {
        const i = this.kuyrukSira++, cx = m.l[i * 2], cz = m.l[i * 2 + 1];
        if (!H.parcalar.has(cx + ',' + cz)) { H.ekle(cx, cz, m.v.slice(i * 512, i * 512 + 512)); this.eklenen++; }
        this.biten++;
      }
      if (this.kuyrukSira >= n) { this.kuyruk.shift(); this.kuyrukSira = 0; }
    }
    while (this.bosta.length && this.kuyruk.length < KUYRUK_SINIRI) this.ver(this.bosta.pop());
  }
  dur() { this.durdu = true; for (const w of this.isciler) w.terminate(); this.isciler = []; this.kuyruk = []; }
}
