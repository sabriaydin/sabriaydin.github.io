/* HungerMan - öğretici (0.23.0): yeni dünyada ilk adımları sırayla gösterir. Her adım, koşulu sağlanınca kendiliğinden geçer.
   Ayarlardan kapatılabilir ya da paneldeki "Öğreticiyi kapat" ile o dünya için bırakılabilir.
   0.49.0: ilk günün adımları yeniden düzenlendi (kütük, masa, kazma, meşale, sığınak, yatak); metinler atanmış tuşları ve dokunmatik
   kontrolleri gösterir; adım atlanabilir; ilerleme çubuğu eklendi. */
import { T, tusAdi } from '../sistem/tuslar.js';
import { YATAK, KATI, BLOKLAR } from '../bloklar.js';
const $ = s => document.querySelector(s);
const KAZMALAR = [300, 304, 308, 312, 316], KUTUKLER = [8, 10, 12, 144, 3005];
const yakinda = (o, id, r = 6) => { const P = o.oyuncu.konum, d = o.dunya; for (let x = -r; x <= r; x++) for (let y = -2; y <= 3; y++) for (let z = -r; z <= r; z++) if (d.blok(Math.floor(P.x) + x, Math.floor(P.y) + y, Math.floor(P.z) + z) === id) return true; return false; };
const yatakYakin = (o, r = 6) => { const P = o.oyuncu.konum, d = o.dunya; for (let x = -r; x <= r; x++) for (let y = -2; y <= 3; y++) for (let z = -r; z <= r; z++) { const id = d.blok(Math.floor(P.x) + x, Math.floor(P.y) + y, Math.floor(P.z) + z); if ((id >= YATAK && id < YATAK + 8) || (BLOKLAR[id] && BLOKLAR[id].yatak)) return true; } return false; };
/* Sığınak: başın üstünde (yaprak olmayan) bir çatı ve dört yönün en az üçünde yakın bir duvar */
export function siginakta(o) {
  const P = o.oyuncu.konum, d = o.dunya, x = Math.floor(P.x), y = Math.floor(P.y), z = Math.floor(P.z);
  let cati = false;
  for (let h = 2; h <= 5 && !cati; h++) { const id = d.blok(x, y + h, z); if (KATI[id] && !/Yaprağı/.test((BLOKLAR[id] || {}).ad || '')) cati = true; }
  if (!cati) return false;
  let duvar = 0;
  const engel = id => KATI[id] || (BLOKLAR[id] && BLOKLAR[id].sekil === 'kapi');
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) for (let r = 1; r <= 6; r++) if (engel(d.blok(x + dx * r, y, z + dz * r)) || engel(d.blok(x + dx * r, y + 1, z + dz * r))) { duvar++; break; }
  return duvar >= 3;
}
const k = t => tusAdi(T[t]);
/* metin(o, dokunmatik) */
export const ADIMLAR = [
  { baslik: 'Hareket', metin: (o, d) => d ? 'Sol alttaki kolla yürünür; ekranın geri kalanında parmağınızı kaydırarak bakılır. Zıpla düğmesi zıplatır, kolu sonuna kadar ileri itmek koşturur.'
      : `${k('ileri')} ${k('sol')} ${k('geri')} ${k('sag')} ile yürünür, fareyle bakılır. ${k('zipla')} zıplatır, ${k('kos')} koşturur.`, tamam: o => (o.ogrMesafe || 0) > 12 },
  { baslik: 'Odun', metin: (o, d) => d ? 'Bir ağaca bakıp ekrana basılı tutunuz (ya da Kır düğmesini) ve iki kütük toplayınız.' : 'Bir ağaca bakıp sol tıkı basılı tutunuz ve iki kütük toplayınız.',
    tamam: o => KUTUKLER.some(id => o.envanter.say(id) >= 2) },
  { baslik: 'Üretim Masası', metin: (o, d) => `${d ? 'Çanta düğmesiyle' : k('envanter') + ' ile'} envanteri açınız: sağdaki Üretim bölümünde kütükten kalas, dört kalastan Üretim Masası yapılır. Masayı seçip yere koyunuz.`,
    tamam: o => yakinda(o, 32) },
  { baslik: 'İlk alet', metin: () => 'Masanın yanındayken envanterde daha çok tarif açılır. Önce çubuk, sonra 3 kalas ve 2 çubukla bir kazma üretiniz.',
    tamam: o => KAZMALAR.some(id => o.envanter.say(id) > 0) },
  { baslik: 'Işık', metin: () => 'Taş kazarken kömür cevheri arayınız. Kömür ve çubuktan meşale yapılır; meşaleler karanlıkta yolu gösterir ve yanlarında canavar doğmaz.',
    tamam: o => o.envanter.say(46) > 0 || yakinda(o, 46, 8) },
  { baslik: 'Sığınak', metin: () => 'Gece canavarlar çıkar. Toprak ya da taştan dört duvarı ve çatısı olan küçük bir sığınak yapınız ve içine giriniz. Bir yamaca kazılan oyuk da olur.',
    tamam: o => siginakta(o) },
  { baslik: 'Yatak', metin: () => 'Koyunlardan 3 yün toplayınız: 3 yün ve 3 kalastan yatak yapılır. Yatakta uyuyunca gece geçer ve orası doğma noktanız olur.',
    tamam: o => yatakYakin(o) || !!o.basarimlar.acik.uyku },
  { baslik: 'Yemek', metin: (o, d) => `Açlık azalınca yemek yiyiniz: et kamp ateşinde pişirilir, yiyecek ${d ? 'Kullan düğmesiyle' : 'sağ tıkla'} yenir.`, tamam: o => (o.basarimlar.istat.yemek || 0) > 0 },
  { baslik: 'İlk gece', metin: () => 'Geceyi sığınakta ya da yatakta geçiriniz. Soğuk bölgelerde ateşin yanında kalınız. İyi şanslar!', tamam: o => o.gun > 1 && o.zaman > 0.05 && o.zaman < 0.4 },
  /* 0.35.0: sonraki adımlar */
  { baslik: 'Fırın', metin: () => 'Sekiz parke taştan Fırın yapınız ve yere koyunuz. Fırına sağ tıklanınca penceresi açılır: üste malzeme, alta yakıt konur; fırın kendiliğinden çalışır.', tamam: o => yakinda(o, 33) || yakinda(o, 1278) },
  { baslik: 'Kıyafet', metin: () => 'Yün ya da ipten bir kıyafet üretiniz (Üretim > Giyim) ve giyiniz. Kıyafetler soğuktan korur; çölde ince giysiler serinletir.', tamam: o => o.envanter.kiyafet.some(Boolean) },
  { baslik: 'Tarla', metin: () => 'Çapa ile toprağı işleyip tohum ekiniz. Suya yakın tarlada ekinler daha hızlı büyür; olgun ekin hasat edilir.', tamam: o => !!o.basarimlar.acik.hasat },
  { baslik: 'Köyler', metin: (o, d) => `Bir köy bulup köylüyle ${d ? 'E düğmesiyle' : k('etkiles') + ' ile'} konuşunuz ve ticaret yapınız. Her köyün bir uzmanlığı vardır.`, tamam: o => !!o.basarimlar.acik.ticaret }
];
/* 0.49.0: eski kayıtlardaki adım numarası (0.48 ve öncesi: 11 adım, Sığınak ve Yatak yoktu) yeni sıraya çevrilir */
export const ogrSurumCevir = (i, surum) => (surum >= 2 || !Number.isFinite(i) || i < 5 ? i : i + 2);
export class Ogretici {
  constructor(ses) {
    this.ses = ses; this.el = $('#ogretici'); this.sayac = 0; this.son = '';
    this.dokunmatik = () => false;
    this.el.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || !this.oyun) return;
      const o = this.oyun; this.ses.tik();
      if (b.dataset.ogr === 'atla') { o.ogretici = (o.ogretici | 0) + 1; this.son = ''; if (o.ogretici >= ADIMLAR.length) { o.ogretici = -1; this.el.hidden = true; } }
      else { o.ogretici = -1; this.el.hidden = true; if (o.hud) o.hud.bildirim('Öğretici kapatıldı. Ayarlar > Oynanış bölümünden yeni dünyalar için açık tutulabilir.'); }
    });
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
    const A = ADIMLAR[o.ogretici], d = !!this.dokunmatik(), m = o.ogretici + '|' + d + '|' + Object.values(T).join();
    if (m !== this.son) {
      this.son = m;
      this.el.querySelector('b').textContent = `${o.ogretici + 1}/${ADIMLAR.length} · ${A.baslik}`;
      this.el.querySelector('p').textContent = A.metin(o, d);
      const c = this.el.querySelector('.ogrIlerleme s'); if (c) c.style.width = (o.ogretici / ADIMLAR.length * 100).toFixed(1) + '%';
    }
    if (this.el.hidden) this.el.hidden = false;
  }
}
