/* HungerMan - öğretici (0.23.0): yeni dünyada ilk adımları sırayla gösterir. Her adım, koşulu sağlanınca kendiliğinden geçer.
   Ayarlardan kapatılabilir ya da paneldeki "Gizle" ile o dünya için bırakılabilir. */
const $ = s => document.querySelector(s);
const KAZMALAR = [300, 304, 308, 312, 316], KUTUKLER = [8, 10, 12, 144];
const yakinda = (o, id, r = 6) => { const P = o.oyuncu.konum, d = o.dunya; for (let x = -r; x <= r; x++) for (let y = -2; y <= 3; y++) for (let z = -r; z <= r; z++) if (d.blok(Math.floor(P.x) + x, Math.floor(P.y) + y, Math.floor(P.z) + z) === id) return true; return false; };
export const ADIMLAR = [
  { baslik: 'Hareket', metin: 'W A S D ile yürünür, fareyle bakılır. Boşluk zıplatır, Shift koşturur.', tamam: o => (o.ogrMesafe || 0) > 12 },
  { baslik: 'Odun', metin: 'Bir ağaca bakıp sol tıkı basılı tutunuz ve birkaç kütük toplayınız.', tamam: o => KUTUKLER.some(id => o.envanter.say(id) >= 2) },
  { baslik: 'Üretim Masası', metin: 'E ile envanteri açınız: kütükten kalas, dört kalastan Üretim Masası yapılır. Masayı yere koyunuz.', tamam: o => yakinda(o, 32) },
  { baslik: 'İlk alet', metin: 'Masaya sağ tıklayınız ve bir kazma üretiniz. Taş kazmayla maden kazılır.', tamam: o => KAZMALAR.some(id => o.envanter.say(id) > 0) },
  { baslik: 'Işık', metin: 'Kömür ve çubuktan meşale yapınız; meşaleler geceleri canavarları uzak tutar.', tamam: o => o.envanter.say(46) > 0 || yakinda(o, 46, 8) },
  { baslik: 'Yemek', metin: 'Açlık azalınca yemek yiyiniz: et kamp ateşinde pişirilir, yiyecek sağ tıkla yenir.', tamam: o => (o.basarimlar.istat.yemek || 0) > 0 },
  { baslik: 'İlk gece', metin: 'Geceyi bir barınakta ya da yatakta geçiriniz. Soğuk bölgelerde ateşin yanında kalınız. İyi şanslar!', tamam: o => o.gun > 1 && o.zaman > 0.05 && o.zaman < 0.4 }
];
export class Ogretici {
  constructor(ses) {
    this.ses = ses; this.el = $('#ogretici'); this.sayac = 0; this.son = '';
    this.el.querySelector('button').addEventListener('click', () => { if (this.oyun) { this.oyun.ogretici = -1; this.el.hidden = true; this.ses.tik(); } });
  }
  guncelle(o, dt, acik) {
    this.oyun = o;
    const i = o ? o.ogretici : -1;
    if (!acik || !o || i == null || i < 0 || i >= ADIMLAR.length || o.izleyici) { if (!this.el.hidden) this.el.hidden = true; return; }
    this.sayac -= dt;
    if (this.sayac <= 0) {
      this.sayac = 0.5;
      if (ADIMLAR[i].tamam(o)) {
        o.ogretici = i + 1; this.ses.gorev();
        this.el.classList.remove('tamam'); void this.el.offsetWidth; this.el.classList.add('tamam');
        if (o.ogretici >= ADIMLAR.length) { this.el.hidden = true; o.hud.bildirim('Öğretici tamamlandı. Hayatta kalmaya devam!'); return; }
      }
    }
    const A = ADIMLAR[o.ogretici], m = o.ogretici + '';
    if (m !== this.son) { this.son = m; this.el.querySelector('b').textContent = `${o.ogretici + 1}/${ADIMLAR.length} · ${A.baslik}`; this.el.querySelector('p').textContent = A.metin; }
    if (this.el.hidden) this.el.hidden = false;
  }
}
