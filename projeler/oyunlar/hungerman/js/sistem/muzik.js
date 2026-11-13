/* HungerMan - müzik (0.19.0)
   Parçalar: Tanner Helland, CC BY 4.0 (ses/LISANS.md). Ana menüde menü parçası döner.
   Oyunda müzik sürekli çalmaz: bir parça bitince 1-3 dakika sessizlik olur, ardından duruma uyan bir parça başlar
   (gündüz, gece, mağara, çöl). Boss savaşında ve Yeraltı Diyarı'nda kendi parçası hemen başlar; durum bitince yavaşça susar.
   Parçalar akış hâlinde (HTMLAudio) çalınır, belleğe tümüyle yüklenmez. Sekme gizlenince müzik duraklar. */
export const PARCALAR = { menu: ['menu'], gunduz: ['gunduz1', 'gunduz2'], gece: ['gece1', 'gece2'], magara: ['magara'], col: ['col'], diyar: ['diyar'], boss: ['boss'] };
const ACIL = { menu: 1, diyar: 1, boss: 1 };   // bu durumlarda parça beklemeden başlar ve döner

export class Muzik {
  constructor() {
    this.duzey = 0.5; this.izin = false;
    this.el = null; this.parca = null; this.durum = null; this.bekleme = 4;
    this.solanlar = [];   // susturulan parçalar: [audio, hız]
    this.hedef = 0;
    document.addEventListener('visibilitychange', () => {
      for (const a of [this.el, ...this.solanlar.map(s => s[0])]) if (a) { if (document.hidden) a.pause(); else if (a === this.el) a.play().catch(() => {}); }
    });
  }
  duzeyAyarla(v) { this.duzey = v; if (this.el) this.el.volume = Math.min(this.el.volume, v); if (v <= 0) this.sustur(0.5); }
  /* İlk kullanıcı etkileşiminden sonra çağrılır (tarayıcı otomatik oynatma kuralı) */
  izinVer() { this.izin = true; }

  /* Her karede: dt ve geçerli durum (menu, gunduz, gece, magara, col, diyar, boss) */
  guncelle(dt, durum) {
    /* Susturulan parçalar yavaşça kısılır */
    for (let i = this.solanlar.length - 1; i >= 0; i--) {
      const [a, h] = this.solanlar[i];
      a.volume = Math.max(0, a.volume - h * dt);
      if (a.volume <= 0.005) { a.pause(); a.src = ''; this.solanlar.splice(i, 1); }
    }
    if (!this.izin || this.duzey <= 0 || document.hidden) return;
    if (durum !== this.durum) {
      const once = this.durum;
      this.durum = durum;
      /* Acil durumlara girince ya da onlardan çıkınca çalan parça susar; olağan geçişlerde (gündüzden geceye) parça biter */
      if (ACIL[durum] || ACIL[once]) {
        if (this.el && !(PARCALAR[durum] || []).includes(this.parca)) this.sustur(ACIL[durum] ? 0.7 : 0.25);
        this.bekleme = ACIL[durum] ? 0.5 : 20 + Math.random() * 30;
      }
    }
    if (this.el) {
      /* Açılış: yavaşça yükselir */
      if (this.el.volume < this.duzey) this.el.volume = Math.min(this.duzey, this.el.volume + dt * this.duzey / 3);
      if (this.el.ended) { this.el = null; this.parca = null; this.bekleme = ACIL[durum] ? 1 : 60 + Math.random() * 120; }
      return;
    }
    this.bekleme -= dt;
    if (this.bekleme <= 0) this.cal(durum);
  }
  cal(durum) {
    const l = PARCALAR[durum];
    if (!l) return;
    const secenek = l.length > 1 ? l.filter(p => p !== this.sonParca) : l;
    const p = secenek[Math.floor(Math.random() * secenek.length)];
    const a = new Audio(`ses/muzik/${p}.mp3`);
    a.preload = 'auto'; a.loop = !!ACIL[durum]; a.volume = 0;
    a.play().catch(() => { this.el = null; this.parca = null; this.bekleme = 5; });
    this.el = a; this.parca = p; this.sonParca = p;
  }
  /* Çalan parçayı hız (saniyede düzey) ile kısarak susturur */
  sustur(hiz = 0.3) {
    if (!this.el) return;
    this.solanlar.push([this.el, Math.max(0.05, hiz)]);
    this.el = null; this.parca = null;
  }
}
