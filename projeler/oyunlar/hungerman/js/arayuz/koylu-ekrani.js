/* HungerMan - köylü penceresi (ticaret ve görev) ile görev günlüğü
   0.32.0: köylü seviyesi ve deneyim çubuğu, itibar kademesi, takas kartları (stok, fiyat değişimi, günün fırsatı, köyün ihtiyacı,
   kilitli takaslar), Shift ile toplu takas, çantadan satılabilecekler, zorluk yıldızlı görev kartı, zincir görevler, konaklama ve hediyeler. */
import { simge } from '../grafik/doku.js';
import { ESYALAR } from '../bloklar.js';
import { MESLEKLER, SEVIYELER, MESLEK_SIMGE, SOZ } from '../koy/meslekler.js';
import { MAKS_AKTIF, yonAdi, TUR_ADI } from '../koy/gorevler.js';
import { UZMANLIK } from '../dunya/koy-uretici.js';
import { BOLUMLER } from '../oyun/yolculuk.js';

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const esyaHtml = (id, n) => `<span class="kEsya" title="${esc(ESYALAR[id].ad)}"><img src="${simge(id).url}" alt=""><b>${n}</b></span>`;
const yildiz = n => `<span class="gYildiz" title="Zorluk ${n} / 3">${'★'.repeat(n)}<i>${'★'.repeat(3 - n)}</i></span>`;
const sec = l => l[Math.floor(Math.random() * l.length)];

export class KoyluEkrani {
  constructor(o) {
    Object.assign(this, o); // koyler, gorevler, envanter, ses, hud, oyuncu, kapatIste, xp(n), ortam() -> { gece, sabah, yagis }, konakla(v)
    this.acik = false; this.v = null; this.sekme = 'takas';
    this.kok = $('#koyluEkrani');
    $('#kSekme').addEventListener('click', e => { const b = e.target.closest('button[data-s]'); if (!b) return; this.sekme = b.dataset.s; this.ses.tik(); this.ciz(); });
    $('#kKapat').addEventListener('click', () => this.kapatIste());
    $('#kIcerik').addEventListener('click', e => this.tikla(e));
    $('#kKonakla').addEventListener('click', () => { const v = this.v; if (v && this.konakla) { this.kapatIste(); this.konakla(v); } });
    this.kok.addEventListener('mousedown', e => { if (e.target === this.kok) this.kapatIste(); });
  }
  /* Bağlama göre söz: söylenti, itibar kademesi, yağış, gün saati ya da mesleğe özgü */
  sozSec(v) {
    const M = MESLEKLER[v.koylu.meslek], K = this.koyler, kd = K.kademe(v.koy.id), o = this.ortam ? this.ortam() : {};
    const r = Math.random();
    if (r < 0.42) {
      const s = K.soylenti(v.koy, v.koylu.idx);
      /* 0.46.0: söylenti haritaya yaklaşık bir işaret olarak işlenir (tam yer değil, 50 blokluk ızgaraya yuvarlanır) */
      if (s) { if (this.soylentiIsaretle) this.soylentiIsaretle(s); return `Gezginlerin anlattığına göre ${s.ad}, buradan ${yonAdi(s.x - v.koy.x, s.z - v.koy.z)} yönünde, yaklaşık ${Math.max(50, Math.round(s.m / 50) * 50)} blok uzakta. Haritanıza bir işaret koydum.`; }
    }
    if (r < 0.5) {
      if (kd >= 4) return sec(SOZ.kahraman);
      if (kd === 3) return sec(SOZ.dost);
      if (kd < 0) return sec(SOZ.mesafeli);
    }
    if (r < 0.7) {
      if (o.yagis === 2) return sec(SOZ.kar);
      if (o.yagis === 1) return sec(SOZ.yagmur);
      if (o.gece) return sec(SOZ.gece);
      if (o.sabah) return sec(SOZ.sabah);
    }
    return sec(M.soz);
  }
  ac(v) {
    this.v = v; this.acik = true; this.kok.hidden = false;
    this.soz = this.sozSec(v);
    /* Mektup ya da koli getirildiyse önce onu teslim et */
    const q = this.gorevler.mektupTeslim(v.koy.id, this.envanter);
    if (q) { this.ses.gorev(); this.hud.bildirim(`${q.tur === 'teslimat' ? 'Koli' : 'Mektup'} teslim edildi: ${q.kazanilan} sikke kazanıldı.`, 288); this.soz = q.tur === 'teslimat' ? 'Koli tam zamanında geldi. Çok teşekkür ederiz!' : 'Mektubu getirdiğiniz için teşekkür ederiz. Haberler iyi görünüyor.'; }
    /* Kahraman itibarında günlük hediye */
    const h = this.koyler.hediye(v.koy, v.koylu, this.envanter);
    if (h) { this.ses.topla(); this.hud.bildirim(`${v.ad} bir hediye verdi: ${h[1]} ${ESYALAR[h[0]].ad}.`, h[0]); this.soz = 'Köyümüzün kahramanına küçük bir hediye. Lütfen kabul ediniz.'; }
    this.ciz();
  }
  kapat() { this.acik = false; this.kok.hidden = true; this.v = null; }

  ciz() {
    if (!this.acik) return;
    const v = this.v, k = v.koy, kl = v.koylu, K = this.koyler;
    const sv = K.koyluSeviye(k.id, kl.idx), xp = K.koyluXp(k.id, kl.idx), sonraki = SEVIYELER[sv + 1];
    $('#kAvatar').innerHTML = `<img src="${simge(MESLEK_SIMGE[kl.meslek] || 288).url}" alt="">`;
    $('#kAd').textContent = v.ad;
    $('#kAlt').textContent = `${SEVIYELER[sv].ad} ${MESLEKLER[kl.meslek].ad.toLocaleLowerCase('tr')} · ${k.ad} köyü${UZMANLIK[k.uzmanlik] ? ` · ${UZMANLIK[k.uzmanlik].ad}` : ''}`;
    const oran = sonraki ? (xp - SEVIYELER[sv].xp) / (sonraki.xp - SEVIYELER[sv].xp) : 1;
    $('#kSeviye').innerHTML = `<div class="kCubuk"><i style="width:${Math.round(oran * 100)}%"></i></div><small>${sonraki ? `${xp} / ${sonraki.xp} deneyim · sonraki: ${sonraki.ad}` : 'En yüksek seviye'}</small>`;
    const it = K.itibar(k.id), kd = K.kademe(k.id), sk = K.sonrakiKademe(k.id);
    $('#kItibar').textContent = `${K.itibarDerecesi(k.id)} (${it > 0 ? '+' : ''}${it})`;
    $('#kItibar').className = 'rozet ' + (kd >= 3 ? 'dost' : kd >= 2 ? 'var' : kd < 0 ? 'kotu' : 'yok');
    const ayricalik = { 4: 'Ek indirim · günlük hediye', 3: 'Özel takas · konaklama', 2: 'Zincir görevler', 1: 'Görevlerle itibar kazanılır', '-1': 'Fiyatlar yüksek', '-2': 'Ticaret kapalı' }[kd];
    $('#kKademe').innerHTML = `<small>${ayricalik}</small>${sk ? `<small class="soluk">${sk.ad}: ${sk.esik - it} itibar daha</small>` : ''}`;
    $('#kKonakla').hidden = kd < 3;
    $('#kSoz').textContent = `“${this.soz}”`;
    [...$('#kSekme').children].forEach(b => b.classList.toggle('on', b.dataset.s === this.sekme));
    $('#kSikke').innerHTML = `${esyaHtml(288, this.envanter.say(288))} sikke mevcut${this.sekme === 'takas' ? '<span class="kIpucu">Shift + Takas: olabildiğince çok takas</span>' : ''}`;
    const ic = $('#kIcerik');
    if (this.sekme === 'takas') this.takasCiz(ic, it);
    else this.gorevCiz(ic);
  }
  takasCiz(ic, it) {
    const v = this.v, k = v.koy, kl = v.koylu, K = this.koyler, env = this.envanter;
    if (it <= -40) { ic.innerHTML = '<div class="bos">Köylüler sizinle ticaret yapmak istemiyor. Görevleri tamamlayarak itibarınızı yükseltebilirsiniz.</div>'; return; }
    const l = K.takasListesi(k, kl);
    const kart = (t, i) => {
      const yeter = t.ver.every(([id, n]) => env.say(id) >= n);
      const rozet = [t.gezgin ? '<span class="tRozet gezgin">Gezgin tüccar</span>' : '', t.uzman ? '<span class="tRozet uzman">Köye özgü</span>' : '', t.firsat ? '<span class="tRozet firsat">Günün fırsatı</span>' : '', t.ihtiyac ? '<span class="tRozet ihtiyac">Köyün ihtiyacı</span>' : '',
        !t.firsat && !t.ihtiyac && t.fark ? `<span class="tRozet ${t.fark > 0 ? 'zam' : 'ucuz'}" title="Arz ve talebe göre fiyat değişimi">${t.fark > 0 ? '▲' : '▼'} %${Math.abs(t.fark)}</span>` : ''].join('');
      const kilitMetni = t.kilit === 'dost' ? 'Dost itibarında açılır' : `${SEVIYELER[t.kilit] ? SEVIYELER[t.kilit].ad : ''} seviyesinde açılır`;
      const stok = Math.max(0, t.kalan) / t.sinir;
      return `<div class="takas kart${t.kalan <= 0 ? ' tukendi' : ''}${t.acik ? '' : ' kilitli'}${t.firsat ? ' firsat' : ''}${t.ihtiyac ? ' ihtiyac' : ''}">
        <div class="tAkis"><div class="kVer">${t.ver.map(([id, n]) => esyaHtml(id, n)).join('')}</div><span class="ok">→</span><div class="kAl">${esyaHtml(t.al[0], t.al[1])}</div></div>
        <div class="tAd"><b>${t.al[0] === 288 && !t.sikkeyle ? `${esc(ESYALAR[t.ver[0][0]].ad)} satışı` : esc(ESYALAR[t.al[0]].ad)}</b>${rozet}</div>
        ${t.acik ? `<div class="tAlt"><span class="tStok" title="Bugün kalan takas"><i style="width:${Math.round(stok * 100)}%"></i></span><small>${t.kalan > 0 ? `${t.kalan} / ${t.sinir}` : 'Tükendi'}</small>
          <button type="button" data-takas="${i}" ${yeter && t.kalan > 0 ? '' : 'disabled'}>Takas</button></div>`
          : `<div class="tAlt kilit"><span>🔒 ${kilitMetni}</span></div>`}
      </div>`;
    };
    /* Çantadan bu köylüye satılabilecekler */
    const satis = [];
    l.forEach(t => { if (t.acik && !t.sikkeyle && t.al[0] === 288) for (const [id] of t.ver) { const n = env.say(id); if (n > 0 && !satis.some(s => s[0] === id)) satis.push([id, n]); } });
    /* 0.35.0: köyün uzmanlığı ve demirci köyünde onarım */
    const U = UZMANLIK[k.uzmanlik], uz = K.uzman(k, kl), el = env.seciliYuva(), ucret = K.onarimUcreti(k, kl, el);
    const ust = (U ? `<div class="kUzman"><img src="${simge(U.simge).url}" alt=""><div><b>${U.ad}</b><small>${U.ozet}${uz === 2 ? ' · bu köylü köyün önde gelen ustası' : uz ? ' · köyün uzmanlık mesleği' : ''}</small></div></div>` : '') +
      (k.uzmanlik === 'demirci' && kl.meslek === 'demirci' ? `<div class="kOnarim"><span>Onarım: elinizdeki ${el && ucret != null ? `<b>${esc(ESYALAR[el.id].ad)}</b> tamamen onarılır` : 'eşya yıpranmış bir alet, zırh ya da kıyafet olmalıdır'}</span>${ucret != null ? `<button type="button" data-onar="1" ${env.say(288) >= ucret ? '' : 'disabled'}>${ucret} sikke · Onar</button>` : ''}</div>` : '');
    ic.innerHTML = ust + `<div class="takasIzgara">${l.map(kart).join('')}</div>` +
      (satis.length ? `<div class="kSatis"><span>Çantadan satılabilecekler:</span>${satis.map(([id, n]) => esyaHtml(id, n)).join('')}</div>` : '') +
      '<p class="aciklama">Takas hakları her sabah yenilenir. Çok alınan eşyalar pahalanır; fiyatlar günler içinde eski hâline döner. Köylü takas yaptıkça seviye atlar ve yeni takaslar açar; itibar yükseldikçe fiyatlar düşer.</p>';
  }
  gorevCiz(ic) {
    const v = this.v, k = v.koy, kl = v.koylu, G = this.gorevler, env = this.envanter;
    const q = G.koyluGorevi(k, kl);
    if (!q) { ic.innerHTML = '<div class="bos">Şu anda verilecek bir görev mevcut değil.</div>'; return; }
    const aktif = G.aktif.includes(q);
    const odul = `${esyaHtml(288, q.odul.sikke)}${q.odul.esya ? esyaHtml(q.odul.esya[0], q.odul.esya[1]) : ''}<span class="oRozet xp">+${q.odul.xp || 0} deneyim</span><span class="oRozet it">+${q.odul.itibar} itibar</span>`;
    const p = this.oyuncu.konum;
    let hedef;
    if (q.tur === 'mektup' || q.tur === 'teslimat') { const dx = q.hedefKoy.x - p.x, dz = q.hedefKoy.z - p.z; hedef = `${q.tur === 'teslimat' ? 'Koliyi' : 'Mektubu'} ${esc(q.hedefKoy.ad)} köyüne götürünüz: ${yonAdi(dx, dz)} yönünde, ${Math.round(Math.hypot(dx, dz))} blok${q.sonGun != null ? ` · ${Math.max(0, q.sonGun - G.gun())} gün kaldı` : q.sure ? ` · süre ${q.sure} gün` : ''}`; }
    else if (q.tur === 'kesif') hedef = q.bulundu ? `${esc(q.hedef.ad)} bulundu · ${esc(q.koyluAd)} kişisine dönülecek` : `${esc(q.hedef.ad)} bulunacak · ${yonAdi(q.hedef.x - p.x, q.hedef.z - p.z)}, ${Math.round(Math.hypot(q.hedef.x - p.x, q.hedef.z - p.z))} blok`;
    else if (q.tur === 'getir') hedef = `${ESYALAR[q.esya].ad}: ${G.ilerleme(q, env)} / ${q.adet}`;
    else if (q.tur === 'insa') hedef = `Köye konan ${ESYALAR[q.esya].ad}: ${aktif ? G.ilerleme(q, env) : 0} / ${q.adet}`;
    else if (q.tur === 'koruma') hedef = `Köyün içinde etkisiz hâle getirilen canavar: ${aktif ? G.ilerleme(q, env) : 0} / ${q.adet}`;
    else hedef = `İlerleme: ${aktif ? G.ilerleme(q, env) : 0} / ${q.adet}`;
    const tamam = aktif && G.tamamlanabilir(q, env), gecti = aktif && q.basGun != null && G.gun() > q.basGun;
    const ek = q.ekHedef ? `<li class="${gecti ? 'kacti' : ''}"><i>◇</i>${esc(q.ekHedef)}${gecti ? ' (süre geçti)' : ''}</li>` : '';
    let dugmeler = '', not = '';
    if (aktif) {
      if (q.tur !== 'mektup' && q.tur !== 'teslimat') dugmeler += `<button type="button" class="ana" data-teslim="1" ${tamam ? '' : 'disabled'}>Teslim Et</button>`;
      dugmeler += '<button type="button" data-birak="1">Görevi Bırak</button>';
    } else if (G.aktif.length >= MAKS_AKTIF) not = 'Aynı anda en fazla üç görev alınabilir. Önce mevcut görevlerden birini tamamlayınız.';
    else dugmeler = '<button type="button" class="ana" data-kabul="1">Görevi Kabul Et</button>';
    const zincir = q.zincir ? `<div class="gZincir"><b>Zincir görev: ${esc(q.zincir.ad)}</b><span>${Array.from({ length: q.zincir.toplam }, (_, i) => `<i class="${i < q.zincir.adim ? 'bitti' : i === q.zincir.adim ? 'simdi' : ''}"></i>`).join('')}</span><small>Adım ${q.zincir.adim + 1} / ${q.zincir.toplam}${q.zincir.adim + 1 === q.zincir.toplam ? ' · son adım: büyük ödül' : ''}</small></div>` : '';
    ic.innerHTML = `<div class="gorevKart yeni">
      <div class="gBas"><span class="gTur">${TUR_ADI[q.tur] || ''}</span>${yildiz(q.yildiz || 1)}${aktif ? '<span class="gAktif">Etkin</span>' : ''}</div>
      ${zincir}<p>${esc(q.metin)}</p>
      <ul class="gHedef"><li class="${tamam ? 'tamam' : ''}"><i>${tamam ? '✔' : '◆'}</i>${hedef}</li>${ek}</ul>
      <div class="odul"><span>Ödül:</span>${odul}</div>
      ${not ? `<p class="gDurum">${not}</p>` : ''}<div class="gDugme">${dugmeler}</div></div>`;
  }

  tikla(e) {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    const v = this.v, k = v.koy, kl = v.koylu;
    if (b.dataset.onar) { const h = this.koyler.onar(k, kl, this.envanter.seciliYuva(), this.envanter); if (h) this.hud.bildirim(h); else { this.ses.takas(); this.hud.bildirim('Eşya onarıldı.'); } this.ciz(); return; }
    if (b.dataset.takas != null) {
      const i = +b.dataset.takas;
      let n = 0, hata = null;
      do { hata = this.koyler.takas(k, kl, i, this.envanter); if (!hata) n++; } while (!hata && e.shiftKey && n < 64);
      if (n) { this.ses.takas(); if (this.xp) this.xp(n); if (n > 1) this.hud.bildirim(`${n} kez takas yapıldı.`); }
      else if (hata) this.hud.bildirim(hata);
    } else if (b.dataset.kabul) {
      const q = this.gorevler.koyluGorevi(k, kl);
      const hata = this.gorevler.kabul(q, this.envanter);
      if (hata) this.hud.bildirim(hata); else { this.ses.gorev(); this.hud.bildirim(`Yeni görev: ${q.kisa}`); }
    } else if (b.dataset.teslim) {
      const q = this.gorevler.koyluGorevi(k, kl);
      if (this.gorevler.teslim(q, this.envanter)) {
        this.ses.gorev();
        this.hud.bildirim(`Görev tamamlandı: ${q.kazanilan} sikke${q.ekBasari ? ' (ek hedef başarıldı)' : ''} kazanıldı.`, 288);
        this.soz = q.zincir && q.zincir.adim + 1 === q.zincir.toplam ? `${q.zincir.ad} sona erdi. Köyümüz bu iyiliği asla unutmayacak!` : 'Çok teşekkür ederiz. Köyümüz size minnettardır.';
      }
    } else if (b.dataset.birak) {
      const q = this.gorevler.koyluGorevi(k, kl);
      this.gorevler.birak(q); this.ses.tik();
    }
    this.ciz();
  }
}

/* Görev günlüğü (J tuşu) */
export class GorevEkrani {
  constructor(o) {
    Object.assign(this, o); // gorevler, envanter, oyuncu, ses, kapatIste
    this.acik = false;
    this.kok = $('#gorevEkrani'); this.sekme = 'yol';
    $('#gKapat').addEventListener('click', () => this.kapatIste());
    $('#gSekme').addEventListener('click', e => { const b = e.target.closest('button[data-s]'); if (!b) return; this.sekme = b.dataset.s; this.ses.tik(); this.ciz(); });
    this.kok.addEventListener('mousedown', e => { if (e.target === this.kok) this.kapatIste(); });
    $('#gorevListe').addEventListener('click', e => {
      const t = e.target.closest('button[data-takip]');
      if (t) { const q = this.gorevler.aktif[+t.dataset.takip]; q.gizli = !q.gizli; this.gorevler.bildir(); this.ses.tik(); this.ciz(); return; }   // 0.35.0
      const b = e.target.closest('button[data-birak]'); if (!b) return;
      this.gorevler.birak(this.gorevler.aktif[+b.dataset.birak]); this.ses.tik(); this.ciz();
    });
  }
  ac() { this.acik = true; this.kok.hidden = false; this.ciz(); }
  kapat() { this.acik = false; this.kok.hidden = true; }
  /* 0.46.0: Yolculuk sekmesi: biten bölümler, şu anki bölümün adımları (ipucuyla), sıradaki bölümler kapalı */
  yolCiz() {
    const Y = this.yolculuk;
    if (!Y) { $('#gorevListe').innerHTML = '<div class="bos">Yolculuk bu dünyada mevcut değil.</div>'; return; }
    $('#gorevListe').innerHTML = BOLUMLER.map((B, i) => {
      const bitti = i < Y.bolum, simdi = i === Y.bolum;
      if (!bitti && !simdi) return `<div class="yolKart kapali"><span class="yolNo">${i + 1}</span><b>${esc(B.ad)}</b><small>Önceki bölüm tamamlanınca açılır.</small></div>`;
      const ilk = B.adimlar.findIndex(a => !Y.adimBitti(a));
      const adim = B.adimlar.map((a, j) => { const ok = Y.adimBitti(a); return `<li class="${ok ? 'ok' : j === ilk ? 'sira' : ''}"><span>${ok ? '✓' : '○'}</span><div>${esc(a[0])}${!ok && j === ilk ? `<em>${esc(a[2])}</em>` : ''}</div></li>`; }).join('');
      const odul = `<div class="odul"><span>Ödül:</span>${B.odul.esya.map(([id, n]) => esyaHtml(id, n)).join('')}<span>${B.odul.xp} deneyim</span></div>`;
      return `<div class="yolKart${bitti ? ' bitti' : ' simdi'}"><span class="yolNo">${bitti ? '✓' : i + 1}</span><b>${esc(B.ad)}</b><small>${esc(B.aciklama)}</small>${simdi ? `<ul class="yolAdim">${adim}</ul>${odul}` : ''}</div>`;
    }).join('') + (Y.bitti ? '<p class="aciklama">Yolculuğun bütün bölümleri tamamlandı. Dünya hâlâ keşfedilmeyi bekliyor.</p>' : '<p class="aciklama">Adımlar başarımlarla tamamlanır; sıradaki adım ekranın sağındaki görev izleyicide de görünür.</p>');
  }
  ciz() {
    [...$('#gSekme').children].forEach(b => b.classList.toggle('on', b.dataset.s === this.sekme));
    if (this.sekme === 'yol') { this.yolCiz(); return; }
    const G = this.gorevler, p = this.oyuncu.konum;
    if (!G.aktif.length) { $('#gorevListe').innerHTML = `<div class="bos">Aktif görev mevcut değil. Köylerdeki köylülerle konuşarak görev alabilirsiniz.<br>Tamamlanan görev: ${G.tamamlanan}</div>`; return; }
    $('#gorevListe').innerHTML = G.aktif.map((q, i) => {
      const durum = `${q.tur === 'kesif' && !q.bulundu ? `Hedef: ${esc(q.hedef.ad)} · ` : q.hedefKoy ? `Hedef: ${esc(q.hedefKoy.ad)} köyü · ` : 'İlerleme: '}${esc(G.durumMetni(q, this.envanter, p))}`;
      const dx = q.koyX - p.x, dz = q.koyZ - p.z;
      return `<div class="gorevKart"><div class="gBas"><span class="gTur">${TUR_ADI[q.tur] || ''}</span>${yildiz(q.yildiz || 1)}${q.zincir ? `<span class="gAktif">Zincir ${q.zincir.adim + 1}/${q.zincir.toplam}</span>` : ''}</div><b>${esc(q.kisa)}</b><small>${esc(q.koyluAd)} · ${esc(q.koyAd)} köyü (${yonAdi(dx, dz)}, ${Math.round(Math.hypot(dx, dz))} blok)</small><p>${esc(q.metin)}</p><p class="gDurum">${durum}</p><div class="gDugme"><button type="button" data-takip="${i}">${q.gizli ? 'Takip Et' : 'Takibi Kapat'}</button><button type="button" data-birak="${i}">Görevi Bırak</button></div></div>`;
    }).join('') + `<p class="aciklama">Tamamlanan görev: ${G.tamamlanan} · Aynı anda en fazla ${MAKS_AKTIF} görev alınabilir.</p>`;
  }
}
