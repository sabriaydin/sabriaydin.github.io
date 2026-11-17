/* HungerMan - envanter ve üretim ekranı: sürükle-bırak yerine tıkla-al / tıkla-bırak, tarif arama ve kategori */
import { simge } from '../grafik/doku.js';
import { BLOKLAR, ESYALAR, ZIRH_PARCALARI, KIYAFET_PARCALARI, maksDayanim, onarimMalzemesi, ETKILER, BUYULER, buyuMetinleri, buyuluMu, uygunBuyuler, romaRakam } from '../bloklar.js';
import { uretec } from '../rastgele.js';
import { KarakterOnizleme } from './karakter-onizleme.js';

/* Büyü masası: seçeneklerin seviye bedeli ve parıltı kristali gereksinimi */
const BUYU_BEDEL = [2, 5, 9];
const KRISTAL = 61;
import { TARIFLER, KATEGORILER, ISTASYON_ADI, ISTASYON_BLOK, girdiAdi, girdiSay, kacKez, uret, GRUPLAR, istasyonVar, istasyonMetni, istasyonlar, girdiListesi } from '../oyun/uretim.js';

/* 0.33.0: kıyafet ve zırh ısı değerleri metni */
export const isiMetni = i => [i.y ? `Soğuktan koruma +${String(i.y).replace('.', ',')}°` : '', i.s ? `Serinlik −${i.s}°` : '', i.g ? `Sıcakta +${String(i.g).replace('.', ',')}°` : ''].filter(Boolean).join(' · ');
const $ = s => document.querySelector(s);
/* 0.30.3: içerik değişmediyse öğeleri yeniden kurmaz (tıklama sırasında öğenin yerinden sökülmesini ve titremeyi önler) */
const yaz = (el, html) => { if (el && el._html !== html) { el._html = html; el.innerHTML = html; } };

export class EnvanterEkrani {
  constructor(o) {
    Object.assign(this, o); // envanter, hud, ses, istasyonlar(), birak(id, adet, dayanim, buyu), hayatta
    this.acik = false;
    this.tasinan = null;
    this.kategori = 'hepsi';
    this.arama = '';
    this.istasyon = null;
    this.kok = $('#envanterEkrani');
    $('#envIzgara').innerHTML = Array.from({ length: 27 }, (_, k) => `<div class="yuva" data-i="${k + 9}"></div>`).join('');
    $('#envCubuk').innerHTML = Array.from({ length: 9 }, (_, i) => `<div class="yuva" data-i="${i}"></div>`).join('');
    $('#sandikIzgara').innerHTML = Array.from({ length: 27 }, (_, i) => `<div class="yuva" data-s="${i}"></div>`).join('');
    this.ors = [null, null];
    $('#orsIzgara').innerHTML = '<div class="yuva" data-o="0" title="Onarılacak eşya"></div><span class="orsArti">+</span><div class="yuva" data-o="1" title="Malzeme ya da aynı eşya"></div><span class="orsOk">➜</span><div class="yuva orsSonuc" data-o="2" title="Sonuç"></div>';
    this.buyuYuva = [null, null];
    $('#buyuIzgara').innerHTML = '<div class="yuva" data-b="0" title="Büyülenecek eşya"></div><span class="orsArti">+</span><div class="yuva" data-b="1" title="Parıltı kristali"></div>';
    $('#buyuSecenek').addEventListener('click', e => { const b = e.target.closest('button[data-sec]'); if (b) this.buyule(+b.dataset.sec); });
    /* 0.30.0: canlı karakter önizlemesi, eşya arama ve yuva kısayolları */
    this.onizleme = new KarakterOnizleme($('#karakterOnizleme'));
    this.aranan = '';
    $('#envAra').addEventListener('input', e => { this.aranan = e.target.value.trim().toLocaleLowerCase('tr'); this.aramaCiz(); });
    $('#envAra').addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') { e.target.value = ''; this.aranan = ''; this.aramaCiz(); e.target.blur(); } });
    addEventListener('keydown', e => this.tus(e), true);
    $('#envZirh').innerHTML = ZIRH_PARCALARI.map((a, z) => `<div class="yuva zirhYuva" data-z="${z}" title="Zırh: ${a} (kıyafetin üstüne giyilir)"></div>`).join('');
    /* 0.33.0: kıyafet yuvaları (zırhın altına giyilir) */
    this.KIYAFET_BOS = [348, 351, 356, 361];
    $('#envKiyafet').innerHTML = KIYAFET_PARCALARI.map((a, k) => `<div class="yuva zirhYuva kiyafetYuva" data-k="${k}" title="Kıyafet: ${a} (zırhın altına giyilir)"></div>`).join('');
    /* 0.30.1: üretim: favoriler, sıralama, yapılabilir süzgeci, seçili tarif ayrıntısı ve miktar seçimi */
    this.sekmeler = [['hepsi', 'Tümü'], ['favori', '★ Favoriler'], ...KATEGORILER.filter(([k]) => k !== 'hepsi')];
    try { this.favoriler = new Set(JSON.parse(localStorage.getItem('hungerman_tarif_favori') || '[]')); } catch (e) { this.favoriler = new Set(); }
    this.secTarif = -1; this.miktar = 1; this.sira = 'oneri'; this.yalnizYapilir = false;
    $('#istasyonDurum').addEventListener('click', e => { const b = e.target.closest('[data-ist]'); if (!b) return; this.istFiltre = this.istFiltre === b.dataset.ist ? null : b.dataset.ist; this.ses.tik(); this.ciz(); });   // 0.35.0
    $('#tarifSekme').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; this.kategori = b.dataset.k; this.ses.tik(); this.tarifCiz(); });
    $('#tarifAra').addEventListener('input', e => { this.arama = e.target.value.trim().toLocaleLowerCase('tr'); this.tarifCiz(); });
    $('#tarifSira').addEventListener('click', e => { const b = e.target.closest('[data-sira]'); if (!b) return; this.sira = b.dataset.sira; [...$('#tarifSira').children].forEach(x => x.classList.toggle('on', x === b)); this.ses.tik(); this.tarifCiz(); });
    $('#tarifYapilir').addEventListener('change', e => { this.yalnizYapilir = e.target.checked; this.ses.tik(); this.tarifCiz(); });
    $('#tarifAyrinti').addEventListener('click', e => this.ayrintiTikla(e));
    $('#tarifAyrinti').addEventListener('input', e => { if (e.target.id === 'tarifMiktar') { this.miktar = Math.max(1, Math.min(this.miktarUst(), Math.floor(+e.target.value) || 1)); this.ayrintiCiz(true); } });
    $('#tarifAyrinti').addEventListener('change', e => { if (e.target.id === 'tarifMiktar') e.target.value = this.miktar; });
    $('#tarifAyrinti').addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter' && e.target.id === 'tarifMiktar') this.uretSec(this.secTarif, this.miktar); });
    $('#tarifAra').addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape' || e.key === 'Enter') e.target.blur(); });
    $('#envKapat').addEventListener('click', () => this.kapatIste && this.kapatIste());
    this.kok.addEventListener('contextmenu', e => e.preventDefault());
    this.kok.addEventListener('mousedown', e => this.fare(e));
    this.kok.addEventListener('mousemove', e => this.hareket(e));
    /* 0.20.0: dokunmatik: yuvaya kısa dokunuş sol tıklama, basılı tutma (0,4 sn) sağ tıklamadır (yığın bölme, tek tek bırakma) */
    const sahte = (el, t, button) => ({ target: el, button, shiftKey: false, clientX: t.clientX, clientY: t.clientY, preventDefault() {} });
    this.kok.addEventListener('touchstart', e => {
      const el = e.target.closest('.izgara .yuva');
      if (!el) return;
      e.preventDefault();
      const t = e.changedTouches[0];
      this.hareket(sahte(el, t, 0));
      if (this.dokunus) clearTimeout(this.dokunus.zaman);
      const d = this.dokunus = { el, uzun: false };
      d.zaman = setTimeout(() => { d.uzun = true; this.fare(sahte(el, t, 2)); if (navigator.vibrate) navigator.vibrate(15); }, 400);
    }, { passive: false });
    const bitir = e => {
      const d = this.dokunus;
      if (!d) return;
      clearTimeout(d.zaman); this.dokunus = null;
      const t = e.changedTouches[0];
      if (!d.uzun && e.type === 'touchend') this.fare(sahte(d.el, t, 0));
      this.hareket(sahte(d.el, t, 0));
    };
    this.kok.addEventListener('touchend', bitir); this.kok.addEventListener('touchcancel', bitir);
    this.kok.addEventListener('mouseleave', () => { $('#ipucu').hidden = true; });
    /* 0.23.0: sıralama ve sandık toplu aktarımı */
    $('#envSirala').addEventListener('click', () => { this.sirala(this.envanter.yuvalar, 9, 36); this.ses.tik(); this.envanter.bildir(); this.ciz(); });
    $('#sandikOzet').addEventListener('click', e => { const b = e.target.closest('[data-ozet]'); if (b && this.sandik) this.ozetAl(+b.dataset.ozet); });
    this.kok.querySelector('.sandikIslem').addEventListener('click', e => { const b = e.target.closest('button[data-sandik]'); if (b) this.sandikIslem(b.dataset.sandik); });
    $('#tarifListe').addEventListener('click', e => {
      const fv = e.target.closest('[data-fav]'); if (fv) { this.favori(+fv.dataset.fav); return; }
      const b = e.target.closest('button[data-t]');
      if (b) { this.uretSec(+b.dataset.t, e.shiftKey ? 64 : 1); return; }
      const r = e.target.closest('.tarif[data-sec]'); if (r) { this.sec(+r.dataset.sec); this.ses.tik(); }
    });
  }

  /* sandik: { yuvalar: 27 elemanlı dizi, ad } verilirse sağ tarafta üretim yerine sandık gösterilir */
  ac(istasyon, sandik) {
    this.acik = true; this.istasyon = istasyon || null; this.sandik = sandik || null;
    if (istasyon) this.kategori = 'hepsi';
    /* 0.35.0: istasyona sağ tıklanınca yalnızca o istasyonun tarifleri listelenir (istasyon simgesine tıklanınca filtre kalkar ya da değişir) */
    this.istFiltre = istasyon && ISTASYON_ADI[istasyon] && !sandik ? istasyon : null;
    /* Örs: sağ tarafta onarım bölümü */
    const ors = istasyon === 'ors' && !this.sandik, buyu = istasyon === 'buyu' && !this.sandik;
    $('.envSag').hidden = !!this.sandik || ors || buyu; $('.envSandik').hidden = !this.sandik;
    /* 0.29.0: cihaz haznesi başlığı ve kuralı */
    if (this.sandik) {
      const K = this.sandik.kural, B = BLOKLAR[this.sandik.blok];
      $('.envSandik h2').textContent = K ? K.ad : B && B.ad ? B.ad : 'Sandık';
      $('#sandikSimge').innerHTML = this.sandik.blok && ESYALAR[this.sandik.blok] ? `<img src="${simge(this.sandik.blok).url}" alt="">` : '';
      $('#sandikKural').hidden = !K; $('#sandikKural').textContent = K ? K.not : '';
      /* 0.33.0: fırın ve kamp ateşi: girdi, yakıt ve çıktı yuvaları, ilerleme ve alev göstergesi */
      const F = K && K.firin, kutu = this.kok.querySelector('.envSandik');
      kutu.classList.toggle('firinMod', !!F);
      if (F === 'firin') $('#sandikIzgara').innerHTML = `<div class="firinDuzen"><div class="fSol"><label>Girdi<div class="yuva" data-s="0"></div></label><div class="fAlev" data-balon="<b>Yakıt</b><em>Kalan yanma</em>"><i id="fAlev"></i></div><label>Yakıt<div class="yuva" data-s="1"></div></label></div><div class="fOk"><i id="fOk"></i></div><label class="fCikti">Çıktı<div class="yuva" data-s="2"></div></label></div><p class="fDurum" id="fDurum"></p>`;
      else if (F === 'ates') $('#sandikIzgara').innerHTML = `<div class="firinDuzen ates"><div class="fSol"><label>Çiğ yiyecek<div class="yuva" data-s="0"></div></label><div class="fAlev yanar"><i style="height:100%"></i></div></div><div class="fOk"><i id="fOk"></i></div><label class="fCikti">Pişmiş<div class="yuva" data-s="1"></div></label></div><p class="fDurum" id="fDurum"></p>`;
      else if (!$('#sandikIzgara .yuva[data-s="26"]')) $('#sandikIzgara').innerHTML = Array.from({ length: 27 }, (_, i) => `<div class="yuva" data-s="${i}"></div>`).join('');
    } $('.envOrs').hidden = !ors; $('.envBuyu').hidden = !buyu;
    this.kok.hidden = false;
    if (this.renk) this.onizleme.renkAyarla(this.renk());
    this.onizleme.baslat();
    clearInterval(this.durumSayac); this.durumSayac = setInterval(() => { this.durumCiz(); if (this.sandik) this.firinCiz(); }, 250);
    this.ciz();
  }
  kapat() {
    this.acik = false; this.kok.hidden = true;
    $('#ipucu').hidden = true;
    this.onizleme.durdur(); clearInterval(this.durumSayac); this.uzerinde = null; $('#balon').hidden = true;
    if (this.tasinan) {
      const k = this.envanter.ekle(this.tasinan.id, this.tasinan.adet, this.tasinan.dayanim, this.tasinan.buyu);
      if (k > 0) this.birak(this.tasinan.id, k, this.tasinan.dayanim, this.tasinan.buyu);
      this.tasinan = null;
    }
    /* Örsteki eşyalar envantere döner */
    for (const Y of [this.ors, this.buyuYuva]) for (let i = 0; i < 2; i++) { const o = Y[i]; if (!o) continue; const k = this.envanter.ekle(o.id, o.adet, o.dayanim, o.buyu); if (k > 0) this.birak(o.id, k, o.dayanim, o.buyu); Y[i] = null; }
    this.tasimaCiz();
    /* Çok oyunculu: kapanan sandığın içeriği sunucuya bildirilir */
    if (this.sandik && this.kapandi) this.kapandi(this.sandik);
  }

  /* 0.23.0: l[bas..son) aralığındaki yığınları birleştirir ve türe, sonra numaraya göre sıralar */
  sirala(l, bas, son) {
    const esyalar = l.slice(bas, son).filter(Boolean), birlesik = [];
    for (const s of esyalar) {
      const y = this.envanter.yigin(s.id);
      if (s.dayanim == null && !s.buyu) { let kalan = s.adet; for (const b of birlesik) { if (b.id === s.id && b.dayanim == null && !b.buyu && b.adet < y) { const n = Math.min(kalan, y - b.adet); b.adet += n; kalan -= n; if (!kalan) break; } } if (kalan) birlesik.push({ ...s, adet: kalan }); }
      else birlesik.push({ ...s });
    }
    const sira = e => { const E = ESYALAR[e.id]; return E.alet || E.tur === 'yay' || E.tur === 'olta' ? 0 : E.zirh ? 1 : E.yemek || E.tur === 'iksir' || E.iyilestir ? 2 : E.tur === 'blok' ? 4 : 3; };
    birlesik.sort((a, b) => sira(a) - sira(b) || a.id - b.id || b.adet - a.adet);
    for (let i = bas; i < son; i++) l[i] = birlesik[i - bas] || null;
  }
  /* 0.29.0: eşya açık hazneye konabilir mi; konamazsa uyarır */
  uyar(id, i) {
    if (this.sandik && ESYALAR[id] && ESYALAR[id].gorevEsyasi) { this.hud.bildirim('Görev eşyası sandığa konamaz.'); return false; }   // 0.35.0
    const K = this.sandik && this.sandik.kural;
    if (!K || (K.yuva && i != null ? K.yuva(i, id) : K.izin(id))) return true;
    this.ses.hataSes();
    this.hud.bildirim(`${K.ad}: ${K.not}`);
    return false;
  }
  sandikIslem(tur) {
    const S = this.sandik; if (!S) return;
    const env = this.envanter, Y = S.yuvalar;
    if (tur === 'al') { for (let i = 0; i < Y.length; i++) { const s = Y[i]; if (!s) continue; const k = env.ekle(s.id, s.adet, s.dayanim, s.buyu); Y[i] = k > 0 ? { ...s, adet: k } : null; } }
    else if (tur === 'koy' || tur === 'benzer') {
      const varolan = new Set(Y.filter(Boolean).map(s => s.id));
      for (let i = 9; i < 36; i++) {
        const s = env.yuvalar[i]; if (!s || (tur === 'benzer' && !varolan.has(s.id)) || (S.kural && !S.kural.izin(s.id))) continue;
        const uy = j => !S.kural || !S.kural.yuva || S.kural.yuva(j, s.id);
        let kalan = s.adet;
        if (s.dayanim == null && !s.buyu) for (let j = 0; j < Y.length; j++) { const b = Y[j]; if (b && b.id === s.id && b.dayanim == null && !b.buyu && b.adet < env.yigin(s.id) && uy(j)) { const n = Math.min(kalan, env.yigin(s.id) - b.adet); b.adet += n; kalan -= n; if (!kalan) break; } }
        if (kalan) { const j = Y.findIndex((b, m) => !b && uy(m)); if (j >= 0) { Y[j] = { ...s, adet: kalan }; kalan = 0; } }
        env.yuvalar[i] = kalan ? { ...s, adet: kalan } : null;
      }
    }
    else if (tur === 'sirala') this.sirala(Y, 0, Y.length);
    this.ses.tik(); env.bildir(); this.ciz();
  }

  ciz() {
    if (!this.acik) return;
    const env = this.envanter;
    this.kok.querySelectorAll('.izgara .yuva[data-i]').forEach(el => {
      const i = +el.dataset.i;
      yaz(el, this.hud.yuvaIc(env.yuvalar[i]));
      el.classList.toggle('secili', i === env.secili);
    });
    this.kok.querySelectorAll('.kiyafetYuva').forEach(el => {
      const k = +el.dataset.k, s = env.kiyafet[k];
      el.classList.toggle('bosZirh', !s);
      yaz(el, s ? this.hud.yuvaIc(s) : `<img src="${simge(this.KIYAFET_BOS[k]).url}" alt="">`);
    });
    this.kok.querySelectorAll('.zirhYuva:not(.kiyafetYuva)').forEach(el => {
      const z = +el.dataset.z, s = env.zirh[z];
      el.classList.toggle('bosZirh', !s);
      yaz(el, s ? this.hud.yuvaIc(s) : `<img src="${simge(400 + z).url}" alt="">`);
    });
    if (this.sandik) { this.kok.querySelectorAll('.yuva[data-s]').forEach(el => { yaz(el, this.hud.yuvaIc(this.sandik.yuvalar[+el.dataset.s])); }); this.sandikOzetCiz(); this.firinCiz(); }
    if (this.istasyon === 'ors') this.orsCiz();
    if (this.istasyon === 'buyu') this.buyuCiz();
    this.durumCiz();
    const dolu = env.yuvalar.slice(9, 36).filter(Boolean).length;
    $('#cantaDoluluk').textContent = `${dolu} / 27 dolu`;
    this.aramaCiz();
    const ist = this.istasyonlar();
    /* 0.30.2: istasyonlar simgeyle: yakındakiler yeşil işaretli */
    yaz($('#istasyonDurum'), Object.entries(ISTASYON_ADI).map(([k, a]) => `<span data-ist="${k}" class="istSimge ${ist.has(k) ? 'var' : 'yok'}${this.istFiltre === k ? ' filtre' : ''}" data-balon="<b>${a}</b>${ist.has(k) ? '<em class=ok>Yakında · tarifleri yapılabilir</em>' : '<em>Yakında değil · tarifleri için yanına gidilmelidir</em>'}<em>Tık: yalnızca bu istasyonun tarifleri</em>"><img src="${simge(ISTASYON_BLOK[k]).url}" alt="${a}"></span>`).join('')
      + (ist.has('elocak') ? `<span class="istSimge var ocak" data-balon="<b>Elektrikli Ocak</b><em class=ok>Çalışıyor · fırın ve kamp ateşi tariflerinde kömür gerekmez</em>"><img src="${simge(622).url}" alt="Elektrikli Ocak"></span>` : ''));
    this.tarifCiz();
    this.tasimaCiz();
  }

  /* 0.30.0: karakter durumu: can, açlık, deneyim, vücut ısısı, oksijen, zırh ve etkin iksirler; önizleme giydirilir */
  durumCiz() {
    if (!this.acik || !this.hayatta) return;
    const env = this.envanter, h = this.hayatta, zp = env.zirhPuani();
    this.onizleme.giydir(env.zirh, env.yuvalar[env.secili], env.kiyafet);
    const cubuk = (ad, deger, oran, sinif, ek = '') => `<div class="kbSatir ${sinif}"><span>${ad}</span><b>${deger}</b><i><em style="width:${Math.max(0, Math.min(100, oran * 100)).toFixed(1)}%"></em></i>${ek}</div>`;
    const v = h.vucut ?? 37, isiAd = ['Donuyor', 'Üşüyor', 'Normal', 'Bunalıyor', 'Sıcak çarpması'][(h.isiDurum ?? 0) + 2];
    let html = cubuk('Can', `${h.can / 2} / 10`, h.can / 20, 'kbCan') + cubuk('Açlık', `${h.aclik / 2} / 10`, h.aclik / 20, 'kbAclik')
      + cubuk('Seviye', h.seviye, h.ilerleme, 'kbXp') + cubuk('Zırh', `${zp} / 20`, zp / 20, 'kbZirh', `<small>Hasar azaltma %${zp * 4}</small>`);
    if (h.isiAcik !== false) html += cubuk('Vücut ısısı', `${v.toFixed(1).replace('.', ',')}°C`, (v - 32) / 10, 'kbIsi isi' + (h.isiDurum ?? 0), `<small>${isiAd}</small>`);
    /* 0.33.0: giysilerin ısı etkisi */
    const G = env.giysiIsi();
    html += `<div class="kbGiysi"><span>Giysi</span><div class="kbGiysiDeger"><b data-balon="<b>Soğuktan koruma</b><em>Soğukta hissedilen sıcaklığı artırır</em>">❄ +${String(Math.round(G.y * 10) / 10).replace('.', ',')}°</b><b data-balon="<b>Serinlik</b><em>Sıcakta (ör. çölde) serinletir</em>">☀ −${String(Math.round(G.s * 10) / 10).replace('.', ',')}°</b></div>${!G.ust || !G.alt ? `<em data-balon="<b>Çıplak</b><em>Üst ve alt kıyafet giyilmezse soğukta daha çok üşünür</em>">${!G.ust && !G.alt ? 'Çıplak' : !G.ust ? 'Üst yok' : 'Alt yok'}</em>` : ''}</div>`;
    if (h.oksijen < 10) html += cubuk('Oksijen', `${Math.ceil(h.oksijen)} / 10`, h.oksijen / 10, 'kbOks');
    const et = Object.entries(h.etkiler || {}).filter(([k, t]) => t > 0 && ETKILER[k]);
    if (et.length) html += `<div class="kbEtkiler">${et.map(([k, t]) => `<span style="--r:${ETKILER[k].renk}" title="${ETKILER[k].aciklama}">${ETKILER[k].ad} <b>${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}</b></span>`).join('')}</div>`;
    const el = $('#karakterBilgi');
    if (el.innerHTML !== html) el.innerHTML = html;
  }
  /* 0.30.4: sandık doluluğu ve içindekiler özeti (eşya başına toplam) */
  sandikOzetCiz() {
    const Y = this.sandik.yuvalar, dolu = Y.filter(Boolean).length, top = new Map();
    for (const s of Y) if (s) top.set(s.id, (top.get(s.id) || 0) + s.adet);
    $('#sandikDolulukCubuk').style.width = (dolu / Y.length * 100).toFixed(1) + '%';
    $('#sandikDolulukCubuk').classList.toggle('dolu', dolu === Y.length);
    $('#sandikDolulukMetin').textContent = `${dolu} / ${Y.length} yuva dolu`;
    $('#sandikAlt').textContent = top.size ? `${top.size} çeşit · ${[...top.values()].reduce((a, b) => a + b, 0)} eşya` : 'Boş';
    yaz($('#sandikOzet'), top.size ? [...top].sort((a, b) => b[1] - a[1]).map(([id, n]) => `<button type="button" data-ozet="${id}" data-balon="<b>${ESYALAR[id].ad}</b><em>Toplam ${n} · tıklanınca çantaya alınır</em>"><img src="${simge(id).url}" alt=""><span>${ESYALAR[id].ad}</span><b>${n}</b></button>`).join('') : '<p class="bos">Sandık boş. Eşya koymak için çantadaki eşyaya Shift + tık yapınız.</p>');
  }
  /* 0.33.0: fırın / kamp ateşi göstergeleri (ilerleme oku, alev, durum metni) */
  firinCiz() {
    const S = this.sandik, K = S && S.kural;
    if (!K || !K.firin) return;
    const D = (this.firinDurum && this.firinDurum(S.k)) || null, Y = S.yuvalar;
    const ok = $('#fOk'), alev = $('#fAlev'), m = $('#fDurum');
    if (ok) ok.style.width = Math.round((D ? D.ilerleme : 0) * 100) + '%';
    if (alev) alev.style.height = Math.round((D && D.yaniyor ? D.yakit : 0) * 100) + '%';
    const g = Y[0], c = Y[Y.length - 1];
    let t;
    if (!g) t = K.firin === 'firin' ? 'Girdi yuvasına eritilecek ya da pişirilecek bir malzeme konmalıdır.' : 'Çiğ yiyecek konunca pişmeye başlar.';
    else if (D && D.pisen) t = `${ESYALAR[D.pisen].ad} işleniyor…`;
    else if (K.firin === 'firin' && !(D && D.yaniyor) && !Y[1]) t = 'Yakıt yuvası boş: kömür, kütük ya da kalas konmalıdır.';
    else if (c && c.adet >= ESYALAR[c.id].yigin) t = 'Çıktı yuvası dolu.';
    else t = 'Bekliyor';
    if (m && m.textContent !== t) m.textContent = t;
  }
  /* Özetten bir eşya türünün tamamını çantaya alır */
  ozetAl(id) {
    const Y = this.sandik.yuvalar, env = this.envanter;
    for (let i = 0; i < Y.length; i++) { const s = Y[i]; if (!s || s.id !== id) continue; const k = env.ekle(s.id, s.adet, s.dayanim, s.buyu); Y[i] = k > 0 ? { ...s, adet: k } : null; if (k > 0) { this.hud.bildirim('Çantada yer kalmadı.'); break; } }
    this.ses.tik(); env.bildir(); this.ciz();
  }
  /* 0.30.0: aramaya uymayan yuvalar soluklaşır */
  aramaCiz() {
    const a = this.aranan;
    this.kok.querySelectorAll('.izgara .yuva[data-i], .izgara .yuva[data-s]').forEach(el => {
      const s = el.dataset.s != null ? this.sandik && this.sandik.yuvalar[+el.dataset.s] : this.envanter.yuvalar[+el.dataset.i];
      const uyar = !!(a && s && ESYALAR[s.id] && ESYALAR[s.id].ad.toLocaleLowerCase('tr').includes(a));
      el.classList.toggle('aramaSoluk', !!a && !uyar); el.classList.toggle('aramaUyar', uyar);
    });
  }
  /* 0.30.0: imlecin altındaki yuvaya kısayollar: 1-9 çubuktaki yuvayla değiştirir, X bir tane, Shift + X yığını atar */
  tus(e) {
    if (!this.acik || this.tasinan || !this.uzerinde || e.target.closest && e.target.closest('input, textarea, select')) return;
    const el = this.uzerinde; if (!el.isConnected) return;
    const env = this.envanter, sandikta = el.dataset.s != null;
    if (el.dataset.i == null && !sandikta) return;
    const D = sandikta ? this.sandik.yuvalar : env.yuvalar, i = sandikta ? +el.dataset.s : +el.dataset.i;
    const n = /^Digit([1-9])$/.exec(e.code);
    if (n) {
      const j = +n[1] - 1;
      if (!sandikta && i === j) return;
      if (sandikta && env.yuvalar[j] && !this.uyar(env.yuvalar[j].id)) { e.preventDefault(); e.stopImmediatePropagation(); return; }
      [D[i], env.yuvalar[j]] = [env.yuvalar[j], D[i]];
    } else if (e.code === 'KeyX') {   // Q envanteri kapattığı için atma tuşu X
      const s = D[i]; if (!s) return;
      if (ESYALAR[s.id].gorevEsyasi) { this.hud.bildirim('Görev eşyası atılamaz.'); return; }   // 0.35.0
      const k = e.shiftKey ? s.adet : 1;
      this.birak(s.id, k, s.dayanim, s.buyu); s.adet -= k; if (s.adet <= 0) D[i] = null;
    } else return;
    e.preventDefault(); e.stopImmediatePropagation();
    this.ses.tik(); env.bildir(); this.ciz();
  }
  /* ---------- 0.30.1: üretim paneli ---------- */
  /* Tarifin durumu: kaç kez yapılabilir, istasyon hazır mı */
  tarifDurum(i) { const t = TARIFLER[i], n = kacKez(this.envanter, t), istOk = istasyonVar(t, this.ist || this.istasyonlar()); return { t, i, n, istOk, yapilir: n > 0 && istOk }; }
  tarifCiz() {
    const env = this.envanter; this.ist = this.istasyonlar();
    const a = this.arama, hepsi = TARIFLER.map((t, i) => this.tarifDurum(i));
    const uyar = o => !a || ESYALAR[o.t.cikti].ad.toLocaleLowerCase('tr').includes(a) || girdiListesi(o.t).some(([g]) => girdiAdi(g).toLocaleLowerCase('tr').includes(a));
    const kat = (o, k) => (!this.istFiltre || o.t.istasyon === this.istFiltre) && (k === 'hepsi' || (k === 'favori' ? this.favoriler.has(o.i) : o.t.kategori === k));
    /* Sekmeler: her kategoride yapılabilir tarif sayısı */
    /* 0.30.2: kategori şeridi: simge, kısa ad ve yapılabilir sayısı */
    const KISA = { hepsi: 'Tümü', favori: 'Favori', alet: 'Alet', savas: 'Savaş', blok: 'Blok', malzeme: 'Malzeme', yiyecek: 'Yiyecek', yapi: 'Yapı', mobilya: 'Mobilya', giyim: 'Giyim', mekanik: 'Mekanik', elektrik: 'Elektrik' };
    const SIMGE = { hepsi: 32, alet: 300, yapi: 70, giyim: 352 };
    yaz($('#tarifSekme'), this.sekmeler.map(([k, ad]) => {
      const l = hepsi.filter(o => kat(o, k) && uyar(o)), y = l.filter(o => o.yapilir).length;
      const id = SIMGE[k] && ESYALAR[SIMGE[k]] ? SIMGE[k] : (TARIFLER.find(t => t.kategori === k) || {}).cikti;
      const ic = k === 'favori' ? '<b class="katYildiz">★</b>' : id ? `<img src="${simge(id).url}" alt="">` : '';
      return `<button type="button" data-k="${k}" data-balon="<b>${ad.replace('★ ', '')}</b><em>${l.length} tarif${y ? ` · <i class=ok>${y} yapılabilir</i>` : ''}</em>" class="${k === this.kategori ? 'on' : ''}${!l.length ? ' bosSekme' : ''}">${ic}<span>${KISA[k] || ad}</span>${y ? `<em>${y}</em>` : ''}</button>`;
    }).join(''));
    $('#uretimOzet').textContent = `${hepsi.filter(o => o.yapilir).length} / ${TARIFLER.length} tarif yapılabilir`;
    let liste = hepsi.filter(o => kat(o, this.kategori) && uyar(o) && (!this.yalnizYapilir || o.yapilir));
    const ad = o => ESYALAR[o.t.cikti].ad;
    if (this.sira === 'ad') liste.sort((x, y) => ad(x).localeCompare(ad(y), 'tr'));
    else if (this.sira === 'adet') liste.sort((x, y) => (y.yapilir ? y.n : -1) - (x.yapilir ? x.n : -1));
    else liste.sort((x, y) => (y.yapilir - x.yapilir) || (y.istOk - x.istOk) || (this.favoriler.has(y.i) - this.favoriler.has(x.i)));
    this.gorunen = liste.map(o => o.i);
    if (!liste.length) {
      yaz($('#tarifListe'), `<div class="bos">${this.kategori === 'favori' && !this.favoriler.size ? 'Favori tarif mevcut değil. Tarif ayrıntısındaki ☆ düğmesiyle eklenir.' : 'Eşleşen tarif mevcut değil.'}</div>`);
    } else {
      yaz($('#tarifListe'), liste.map(({ t, i, n, istOk, yapilir }) => {
        const e = ESYALAR[t.cikti];
        const gir = girdiListesi(t).map(([g, k]) => { const v = girdiSay(env, g), id = GRUPLAR[g] ? GRUPLAR[g].idler[0] : g; return `<span class="${v >= k ? 'ok' : 'eksik'}" title="${girdiAdi(g)}: ${v} / ${k}"><img src="${simge(id).url}" alt="">${k}</span>`; }).join('');
        return `<div class="tarif${yapilir ? '' : ' olmaz'}${i === this.secTarif ? ' secili' : ''}" data-sec="${i}">
          <div class="tSimge"><img src="${simge(t.cikti).url}" alt="">${t.adet > 1 ? `<span>${t.adet}</span>` : ''}</div>
          <div class="tOrta"><b>${this.favoriler.has(i) ? '<i class="yildiz">★</i>' : ''}${e.ad}</b><div class="gir">${gir}${t.istasyon && !istOk ? `<span class="istEksik" title="${istasyonMetni(t)} gerekli">${istasyonMetni(t)}</span>` : ''}</div></div>
          <div class="uretBtn">${yapilir ? `<small>×${n > 99 ? '99+' : n}</small>` : ''}<button type="button" data-t="${i}" ${yapilir ? '' : 'disabled'} title="Shift + tık: olabildiğince çok üret">Üret</button></div>
        </div>`;
      }).join(''));
    }
    if (!TARIFLER[this.secTarif] && liste.length) { this.secTarif = liste[0].i; this.miktar = 1; }   // seçim, süzgeç dışında kalsa da korunur
    this.ayrintiCiz();
  }
  /* Seçilebilecek en büyük miktar (kaç kez) */
  miktarUst() { const t = TARIFLER[this.secTarif]; if (!t) return 1; const n = kacKez(this.envanter, t); return Math.max(1, Math.min(n, Math.ceil(64 / t.adet) * 9)); }
  sec(i, kaydir) {
    if (!TARIFLER[i]) return;
    this.secTarif = i; this.miktar = 1;
    if (!this.gorunen || !this.gorunen.includes(i)) { this.kategori = 'hepsi'; this.arama = ''; $('#tarifAra').value = ''; this.yalnizYapilir = false; $('#tarifYapilir').checked = false; this.tarifCiz(); }
    else { this.kok.querySelectorAll('.tarif[data-sec]').forEach(el => el.classList.toggle('secili', +el.dataset.sec === i)); this.ayrintiCiz(); }
    if (kaydir !== false) { const el = this.kok.querySelector(`.tarif[data-sec="${i}"]`); if (el) el.scrollIntoView({ block: 'nearest' }); }
  }
  favori(i) {
    if (this.favoriler.has(i)) this.favoriler.delete(i); else this.favoriler.add(i);
    try { localStorage.setItem('hungerman_tarif_favori', JSON.stringify([...this.favoriler])); } catch (e) { /* depolama kapalı */ }
    this.ses.tik(); this.tarifCiz();
  }
  uretSec(i, kez) {
    const t = TARIFLER[i]; if (!t) return;
    const d = this.tarifDurum(i);
    if (!d.istOk) { this.ses.hataSes(); this.hud.bildirim(`${istasyonMetni(t)} yakınında üretilir.`); return; }
    const n = uret(this.envanter, t, kez);
    if (n) {
      this.ses.uretim(); this.hud.bildirim(`${ESYALAR[t.cikti].ad} × ${n * t.adet} üretildi`, t.cikti);
      /* Eritme, pişirme ve iksir yapımı deneyim kazandırır */
      const ist = istasyonlar(t);
      if (this.hayatta && (ist.includes('firin') || ist.includes('simya'))) this.hayatta.xpEkle(n * (ist.includes('simya') ? 2 : 0.35));
      this.son = [i, ...(this.son || []).filter(x => x !== i)].slice(0, 6);
    } else if (kacKez(this.envanter, t) > 0) this.hud.bildirim('Envanterde yer yok.');
    else { this.ses.hataSes(); this.hud.bildirim('Malzeme yetersiz.'); }
    this.miktar = Math.max(1, Math.min(this.miktar, this.miktarUst()));
    this.ciz();
  }
  /* Eşyanın kısa özellik satırları */
  ozellikler(id) {
    const e = ESYALAR[id], l = [];
    if (!e) return l;
    if (e.alet && e.alet.hasar != null && e.alet.tur !== 'yay' && e.alet.tur !== 'olta') l.push(`Saldırı ${e.alet.hasar / 2} kalp · Hız ${e.alet.hiz}`);
    if (e.alet && e.alet.dayanim) l.push(`Dayanım ${e.alet.dayanim}${e.alet.seviye != null ? ` · Kazma seviyesi ${e.alet.seviye}` : ''}`);
    if (e.zirh) l.push(`Zırh +${e.zirh.puan} (${ZIRH_PARCALARI[e.zirh.parca]}) · Dayanım ${e.zirh.dayanim}`);
    if (e.kiyafet) l.push(`Kıyafet · ${KIYAFET_PARCALARI[e.kiyafet.parca]}`);
    if (e.isi) l.push(isiMetni(e.isi));
    if (e.yemek) l.push(`Açlığı ${e.yemek / 2} birim giderir`);
    if (e.iyilestir) l.push(`${e.iyilestir / 2} kalp iyileştirir`);
    if (e.ozellik) l.push(e.ozellik);
    if (e.yigin && e.yigin > 1) l.push(`Yığın: ${e.yigin}`); else l.push('Yığılmaz');
    return l;
  }
  ayrintiCiz(sadeceMiktar) {
    const kap = $('#tarifAyrinti'), i = this.secTarif, t = TARIFLER[i];
    if (!sadeceMiktar && document.activeElement && document.activeElement.id === 'tarifMiktar' && kap.contains(document.activeElement) && kap.dataset.t == i) sadeceMiktar = true;   // yazılırken giriş kutusu yeniden kurulmaz
    if (!t) { yaz(kap, '<div class="bos">Ayrıntı için listeden bir tarif seçiniz.</div>'); return; }
    const env = this.envanter, d = this.tarifDurum(i), e = ESYALAR[t.cikti], ust = this.miktarUst();
    this.miktar = Math.max(1, Math.min(this.miktar, ust));
    const m = this.miktar, ok = d.yapilir && m <= d.n;
    const girdiler = girdiListesi(t).map(([g, k]) => {
      const v = girdiSay(env, g), gerek = k * m, id = GRUPLAR[g] ? GRUPLAR[g].idler[0] : g;
      const kaynak = !GRUPLAR[g] && v < gerek ? TARIFLER.findIndex(x => x.cikti === g) : -1;
      return `<li class="${v >= gerek ? 'ok' : 'eksik'}"><img src="${simge(id).url}" alt=""><span>${girdiAdi(g)}</span><b>${v} / ${gerek}</b>${kaynak >= 0 ? `<button type="button" class="tLink" data-tgit="${kaynak}" title="Bu malzemenin tarifine git">tarif ›</button>` : ''}</li>`;
    }).join('');
    if (sadeceMiktar && kap.querySelector('#tarifMiktar')) {
      kap.querySelector('.tGirdi').innerHTML = girdiler;
      const b = kap.querySelector('[data-uret]'); b.disabled = !ok; b.textContent = `Üret × ${m * t.adet}`;
      return;
    }
    kap.dataset.t = i;
    const kullanim = [...new Set(TARIFLER.map((x, j) => [x, j]).filter(([x]) => x.girdi.some(([g]) => g === t.cikti || (GRUPLAR[g] && GRUPLAR[g].idler.includes(t.cikti)))).map(([x, j]) => j))].slice(0, 12);
    const takip = this.takip && this.takip.get() === i;
    const elde = env.say(t.cikti);
    yaz(kap, `
      <div class="tBas"><div class="tBuyuk"><img src="${simge(t.cikti).url}" alt="">${t.adet > 1 ? `<span>${t.adet}</span>` : ''}</div>
        <div><b>${e.ad}</b><small>${(KATEGORILER.find(([k]) => k === t.kategori) || [0, ''])[1]}${elde ? ` · Çantada ${elde}` : ''}</small></div>
        <button type="button" class="tYildiz${this.favoriler.has(i) ? ' on' : ''}" data-favori="${i}" title="${this.favoriler.has(i) ? 'Favorilerden çıkar' : 'Favorilere ekle'}">${this.favoriler.has(i) ? '★' : '☆'}</button></div>
      <div class="tIst ${d.istOk ? 'ok' : 'eksik'}">${t.istasyon ? `${istasyonMetni(t)} ${d.istOk ? 'yakında ✓' : 'gerekli (yakında değil)'}` : 'İstasyon gerekmez'}</div>
      <ul class="tOzellik">${this.ozellikler(t.cikti).map(x => `<li>${x}</li>`).join('')}</ul>
      <h4>Malzemeler</h4><ul class="tGirdi">${girdiler}</ul>
      <div class="tMiktar"><button type="button" data-m="-1" title="Azalt">−</button><input id="tarifMiktar" type="number" min="1" max="${ust}" value="${m}"><button type="button" data-m="1" title="Artır">+</button><button type="button" data-m="max" class="tMaks" title="Malzemenin yettiği kadar">En çok (${d.n > 0 ? ust : 0})</button></div>
      <div class="tIslem"><button type="button" class="tUret" data-uret ${ok ? '' : 'disabled'}>Üret × ${m * t.adet}</button><button type="button" class="tTakip${takip ? ' on' : ''}" data-takip title="Gereken malzemeler ekranın solunda gösterilir">${takip ? 'Takibi bırak' : 'Takip et'}</button></div>
      ${kullanim.length ? `<h4>Bununla yapılanlar</h4><div class="tKullanim">${kullanim.map(j => `<button type="button" data-tgit="${j}" title="${ESYALAR[TARIFLER[j].cikti].ad}"><img src="${simge(TARIFLER[j].cikti).url}" alt=""></button>`).join('')}</div>` : ''}
      ${this.son && this.son.length ? `<h4>Son üretilenler</h4><div class="tKullanim">${this.son.map(j => `<button type="button" data-tgit="${j}" title="${ESYALAR[TARIFLER[j].cikti].ad}"><img src="${simge(TARIFLER[j].cikti).url}" alt=""></button>`).join('')}</div>` : ''}`);
  }
  ayrintiTikla(e) {
    const b = e.target.closest('button'); if (!b) return;
    const i = this.secTarif;
    if (b.dataset.tgit != null) { this.sec(+b.dataset.tgit); this.ses.tik(); }
    else if (b.dataset.favori != null) this.favori(i);
    else if (b.dataset.m != null) { this.miktar = b.dataset.m === 'max' ? this.miktarUst() : this.miktar + +b.dataset.m; this.ses.tik(); this.ayrintiCiz(true); const g = $('#tarifMiktar'); if (g) g.value = this.miktar; }
    else if (b.dataset.uret != null) this.uretSec(i, this.miktar);
    else if (b.dataset.takip != null && this.takip) { this.takip.set(this.takip.get() === i ? -1 : i); this.ses.tik(); this.ayrintiCiz(); }
  }

  /* ---------- Yuva tıklamaları ---------- */
  fare(e) {
    /* 0.30.3: arama / miktar kutusu dışına tıklanınca odak bırakılır (Q, 1-9, X kısayolları yeniden çalışır) */
    const odak = document.activeElement;
    if (odak && odak !== document.body && this.kok.contains(odak) && odak.matches('input, select, textarea') && !e.target.closest('input, select, textarea, label')) odak.blur();
    if (e.target.closest('#tarifListe, #tarifSekme, #tarifAra, #tarifAyrinti, .uretimUst, .kapat, #sandikOzet, .sandikIslem')) return;
    const el = e.target.closest('.izgara .yuva');
    const env = this.envanter;
    if (el && el.dataset.o != null) { e.preventDefault(); this.orsTikla(+el.dataset.o, e); return; }
    if (el && el.dataset.b != null) { e.preventDefault(); this.buyuTikla(+el.dataset.b, e); return; }
    if (!el) {
      /* Pencere dışına tıklanırsa taşınan eşya bırakılır */
      if (this.tasinan && !e.target.closest('.pencere')) {
        if (ESYALAR[this.tasinan.id].gorevEsyasi) { this.hud.bildirim('Görev eşyası atılamaz.'); return; }   // 0.35.0
        const n = e.button === 2 ? 1 : this.tasinan.adet;
        this.birak(this.tasinan.id, n, this.tasinan.dayanim, this.tasinan.buyu);
        this.tasinan.adet -= n; if (this.tasinan.adet <= 0) this.tasinan = null;
        this.tasimaCiz();
      }
      return;
    }
    e.preventDefault();
    if (el.dataset.k != null) { this.kiyafetTikla(+el.dataset.k, e); return; }
    if (el.dataset.z != null) { this.zirhTikla(+el.dataset.z, e); return; }
    const sandikta = el.dataset.s != null;
    const D = sandikta ? this.sandik.yuvalar : env.yuvalar;
    const i = sandikta ? +el.dataset.s : +el.dataset.i;
    const s = D[i];
    const max = s ? env.yigin(s.id) : 64;
    if (e.shiftKey && s && !this.tasinan && this.sandik) {
      /* Sandık ile envanter arasında taşı */
      if (sandikta) { const k = env.ekle(s.id, s.adet, s.dayanim, s.buyu); if (k) s.adet = k; else D[i] = null; }
      else {
        if (!this.uyar(s.id)) return;
        const S = this.sandik.yuvalar, Kr = this.sandik.kural, uy = j => !Kr || !Kr.yuva || Kr.yuva(j, s.id); let kalan = s.adet;
        if (s.dayanim == null) for (let j = 0; j < S.length && kalan; j++) { const t = S[j]; if (t && t.id === s.id && t.adet < max && uy(j)) { const k = Math.min(kalan, max - t.adet); t.adet += k; kalan -= k; } }
        for (let j = 0; j < S.length && kalan; j++) if (!S[j] && uy(j)) { S[j] = { ...s, adet: kalan }; kalan = 0; }
        if (kalan) s.adet = kalan; else D[i] = null;
      }
      this.ses.tik(); env.bildir(); this.ciz(); return;
    }
    if (e.shiftKey && s && !this.tasinan && ESYALAR[s.id].kiyafet) {
      const k = ESYALAR[s.id].kiyafet.parca;
      D[i] = env.kiyafet[k]; env.kiyafet[k] = s;
      this.ses.zirhGiy(); env.bildir(); this.ciz(); return;
    }
    if (e.shiftKey && s && !this.tasinan && ESYALAR[s.id].zirh) {
      const z = ESYALAR[s.id].zirh.parca;
      D[i] = env.zirh[z]; env.zirh[z] = s;
      this.ses.zirhGiy(); env.bildir(); this.ciz(); return;
    }
    if (e.shiftKey && s && !this.tasinan) {
      /* Çubuk ile ana envanter arasında taşı */
      const hedef = i < 9 ? [...Array(27).keys()].map(k => k + 9) : [...Array(9).keys()];
      let kalan = s.adet;
      for (const j of hedef) { const t = env.yuvalar[j]; if (t && t.id === s.id && t.adet < max) { const k = Math.min(kalan, max - t.adet); t.adet += k; kalan -= k; } if (!kalan) break; }
      for (const j of hedef) { if (!kalan) break; if (!env.yuvalar[j]) { env.yuvalar[j] = { ...s, adet: kalan }; kalan = 0; } }
      if (kalan) s.adet = kalan; else env.yuvalar[i] = null;
      this.ses.tik(); env.bildir(); this.ciz(); return;
    }
    const T = this.tasinan;
    /* 0.30.0: çift tık: aynı eşyaları imleçteki yığında toplar */
    const simdi = performance.now(), cift = e.button === 0 && !e.shiftKey && T && !s && this.sonTik && this.sonTik.el === el && simdi - this.sonTik.t < 320;
    this.sonTik = e.button === 0 ? { el, t: simdi } : null;
    if (cift && T.dayanim == null && !T.buyu) {
      const kaynak = [[env.yuvalar, 0, 36], ...(this.sandik ? [[this.sandik.yuvalar, 0, this.sandik.yuvalar.length]] : [])];
      for (const [L, a, b] of kaynak) for (let j = a; j < b && T.adet < max; j++) { const u = L[j]; if (u && u.id === T.id && u.dayanim == null && !u.buyu) { const k = Math.min(u.adet, max - T.adet); T.adet += k; u.adet -= k; if (!u.adet) L[j] = null; } }
      this.sonTik = null; this.ses.tik(); env.bildir(); this.ciz(); this.hareket(e); return;
    }
    if (sandikta && T && !this.uyar(T.id, i)) return;   // 0.29.0: hazneye uymayan eşya konamaz (0.33.0: yuvaya göre)
    if (e.button === 2) {
      if (!T && s) { const yarim = Math.ceil(s.adet / 2); this.tasinan = { ...s, adet: yarim }; s.adet -= yarim; if (!s.adet) D[i] = null; }
      else if (T && !s) { D[i] = { ...T, adet: 1 }; T.adet--; if (!T.adet) this.tasinan = null; }
      else if (T && s && s.id === T.id && s.adet < max && s.dayanim == null) { s.adet++; T.adet--; if (!T.adet) this.tasinan = null; }
    } else {
      if (!T && s) { this.tasinan = s; D[i] = null; }
      else if (T && !s) { D[i] = T; this.tasinan = null; }
      else if (T && s) {
        if (s.id === T.id && s.dayanim == null && T.dayanim == null) { const k = Math.min(T.adet, max - s.adet); s.adet += k; T.adet -= k; if (!T.adet) this.tasinan = null; }
        else { D[i] = T; this.tasinan = s; }
      }
    }
    this.ses.tik();
    env.bildir();
    this.ciz();
    this.hareket(e);
  }

  /* ---------- Örs: onarım ve birleştirme ---------- */
  /* Sonuç: { sonuc, maliyet (seviye), harca (malzeme adedi), hata } */
  orsHesap() {
    const [A, B] = this.ors;
    if (!A) return { hata: 'Onarılacak eşyayı sol yuvaya koyunuz.' };
    const md = maksDayanim(ESYALAR[A.id]);
    if (!md || A.dayanim == null) return { hata: 'Bu eşya onarılamaz.' };
    const ab = A.buyu ? { buyu: { ...A.buyu } } : {};
    if (!B) return { hata: A.dayanim >= md ? 'Eşyanın dayanımı tam.' : 'Sağ yuvaya onarım malzemesi ya da aynı eşyadan koyunuz.' };
    /* Aynı türden iki eşya: dayanım toplanır, büyüler birleşir (eşit seviyeler bir üst seviyeye çıkar) */
    if (B.id === A.id) {
      const bb = buyuluMu(B);
      if (A.dayanim >= md && !bb) return { hata: 'Eşyanın dayanımı tam.' };
      const d = Math.min(md, A.dayanim + (B.dayanim ?? md) + Math.floor(md * 0.12));
      const buyu = { ...(A.buyu || {}) };
      let ek = 0;
      if (bb) for (const [k, n] of Object.entries(B.buyu)) { if (!BUYULER[k]) continue; const a = buyu[k] || 0, y = a === n ? Math.min(BUYULER[k].maks, n + 1) : Math.max(a, n); if (y > a) ek += y - a; buyu[k] = y; }
      return { sonuc: { id: A.id, adet: 1, dayanim: d, ...(Object.keys(buyu).length ? { buyu } : {}) }, maliyet: 2 + ek, harca: 1 };
    }
    if (A.dayanim >= md) return { hata: 'Eşyanın dayanımı tam.' };
    const mal = onarimMalzemesi(A.id);
    if (!mal || !mal.includes(B.id)) return { hata: `${ESYALAR[B.id].ad} bu eşyayı onarmaz.` };
    const parca = Math.ceil(md / 4), n = Math.min(B.adet, Math.ceil((md - A.dayanim) / parca));
    return { sonuc: { id: A.id, adet: 1, dayanim: Math.min(md, A.dayanim + n * parca), ...ab }, maliyet: n, harca: n };
  }
  orsCiz() {
    const H = this.orsHesap();
    this.kok.querySelectorAll('.yuva[data-o]').forEach(el => { const i = +el.dataset.o; yaz(el, this.hud.yuvaIc(i < 2 ? this.ors[i] : H.sonuc || null)); el.classList.toggle('olmaz', i === 2 && !!H.sonuc && this.hayatta.seviye < H.maliyet && !this.sinirsiz()); });
    const sv = this.hayatta.seviye;
    $('#orsBilgi').innerHTML = H.hata ? `<span class="soluk">${H.hata}</span>`
      : `Bedel: <b>${H.maliyet}</b> deneyim seviyesi · Seviyeniz: <b class="${sv >= H.maliyet || this.sinirsiz() ? 'ok' : 'eksik'}">${sv}</b><br><span class="soluk">Sonuca tıklanarak eşya alınır.</span>`;
  }
  sinirsiz() { return !!this.envanter.sinirsiz; }
  orsTikla(i, e) {
    const T = this.tasinan;
    if (i === 2) {
      const H = this.orsHesap();
      if (!H.sonuc || T) return;
      if (this.hayatta.seviye < H.maliyet && !this.sinirsiz()) { this.hud.bildirim('Deneyim seviyeniz yetersiz.'); return; }
      if (!this.sinirsiz()) this.hayatta.seviyeHarca(H.maliyet);
      this.ors[0] = null;
      const B = this.ors[1]; B.adet -= H.harca; if (B.adet <= 0) this.ors[1] = null;
      this.tasinan = H.sonuc;
      if (this.olay) this.olay('ors');
      this.ses.ors(); this.envanter.bildir(); this.ciz(); this.hareket(e);
      return;
    }
    const s = this.ors[i];
    if (e.shiftKey && s && !T) { const k = this.envanter.ekle(s.id, s.adet, s.dayanim, s.buyu); if (k) s.adet = k; else this.ors[i] = null; }
    else if (T && !s) {
      if (i === 0 || e.button === 2) { this.ors[i] = { ...T, adet: i === 0 || e.button === 2 ? 1 : T.adet }; T.adet -= this.ors[i].adet; if (!T.adet) this.tasinan = null; }
      else { this.ors[i] = T; this.tasinan = null; }
    } else if (!T && s) { this.tasinan = s; this.ors[i] = null; }
    else if (T && s) {
      if (i === 1 && s.id === T.id && s.dayanim == null && T.dayanim == null) { const k = Math.min(T.adet, this.envanter.yigin(s.id) - s.adet); s.adet += k; T.adet -= k; if (!T.adet) this.tasinan = null; }
      else if (i === 1 || T.adet === 1) { this.ors[i] = T; this.tasinan = s; }
    }
    this.ses.tik(); this.envanter.bildir(); this.ciz(); this.hareket(e);
  }

  /* 0.33.0: kıyafet yuvası */
  kiyafetTikla(k, e) {
    const env = this.envanter, T = this.tasinan, s = env.kiyafet[k];
    if (e.shiftKey && s && !T) { const n = env.ekle(s.id, 1, s.dayanim, s.buyu); if (!n) env.kiyafet[k] = null; }
    else if (T) {
      const ke = ESYALAR[T.id].kiyafet;
      if (!ke || ke.parca !== k) { this.hud.bildirim(`Bu yuvaya yalnızca ${KIYAFET_PARCALARI[k].toLocaleLowerCase('tr')} kıyafeti giyilebilir.`); return; }
      env.kiyafet[k] = T; this.tasinan = s || null; this.ses.zirhGiy();
    } else if (s) { this.tasinan = s; env.kiyafet[k] = null; }
    this.ses.tik(); env.bildir(); this.ciz(); this.hareket(e);
  }
  zirhTikla(z, e) {
    const env = this.envanter, T = this.tasinan, s = env.zirh[z];
    if (e.shiftKey && s && !T) { const k = env.ekle(s.id, 1, s.dayanim, s.buyu); if (!k) env.zirh[z] = null; }
    else if (T) {
      const ze = ESYALAR[T.id].zirh;
      if (!ze || ze.parca !== z) { this.hud.bildirim(`Bu yuvaya yalnızca ${ZIRH_PARCALARI[z].toLocaleLowerCase('tr')} takılabilir.`); return; }
      env.zirh[z] = T; this.tasinan = s || null; this.ses.zirhGiy();
    } else if (s) { this.tasinan = s; env.zirh[z] = null; }
    this.ses.tik(); env.bildir(); this.ciz(); this.hareket(e);
  }

  hareket(e) {
    const t = $('#tasima');
    t.style.left = e.clientX + 'px'; t.style.top = e.clientY + 'px';
    const ip = $('#ipucu');
    const el = e.target.closest && e.target.closest('.izgara .yuva');
    this.uzerinde = el || null;
    const s = el && (el.dataset.o != null ? (+el.dataset.o < 2 ? this.ors[+el.dataset.o] : this.orsHesap().sonuc) : el.dataset.b != null ? this.buyuYuva[+el.dataset.b] : el.dataset.k != null ? this.envanter.kiyafet[+el.dataset.k] : el.dataset.z != null ? this.envanter.zirh[+el.dataset.z] : el.dataset.s != null ? this.sandik && this.sandik.yuvalar[+el.dataset.s] : this.envanter.yuvalar[+el.dataset.i]);
    if (!s || this.tasinan) { ip.hidden = true; return; }
    const es = ESYALAR[s.id];
    let alt = '';
    if (es.alet && es.alet.tur === 'yay') alt += `<span>Sağ tık basılı tutularak gerilir</span><span>Dayanım: ${s.dayanim} / ${es.alet.dayanim}</span>`;
    else if (es.alet && es.alet.tur === 'olta') alt += `<span>Sağ tıkla atılır; şamandıra dalınca sağ tıkla çekilir</span><span>Dayanım: ${s.dayanim} / ${es.alet.dayanim}</span>`;
    else if (es.alet) alt += `<span>Hız: ${es.alet.hiz} · Saldırı hasarı: ${es.alet.hasar / 2} kalp · Seviye ${es.alet.seviye}</span><span>Dayanım: ${s.dayanim} / ${es.alet.dayanim}</span>`;
    if (es.zirh) alt += `<span>Zırh +${es.zirh.puan} · ${ZIRH_PARCALARI[es.zirh.parca]}</span><span>Dayanım: ${s.dayanim} / ${es.zirh.dayanim}</span>`;
    if (es.kiyafet) alt += `<span>Kıyafet · ${KIYAFET_PARCALARI[es.kiyafet.parca]} (zırhın altına giyilir)</span>`;
    if (es.isi) alt += `<span>${isiMetni(es.isi)}</span>`;
    if (es.ozellik) alt += `<span>${es.ozellik}</span>`;
    if (es.tekne) alt += '<span>Su yüzeyine sağ tıkla konur; binmek için sağ, inmek için C</span>';
    if (s.id === 299) alt += '<span>Balıkçılar iyi fiyat verir</span>';
        if (es.zehir) alt += '<span>Mide bulantısı yapabilir</span>';
    if (es.yemek) alt += `<span>Açlığı ${es.yemek / 2} birim giderir</span>`;
    if (es.iyilestir) alt += `<span>${es.iyilestir / 2} kalp iyileştirir</span>`;
    if (es.iyilestirme) alt += `<span>Ayrıca ${es.iyilestirme / 2} kalp iyileştirir</span>`;
    if (es.ekin) {
      alt += '<span>Toprak, çimen veya tarla toprağına ekilir; tarlada daha hızlı büyür · Shift ile 3 × 3 tarlaya ekilir</span>';
      /* 0.34.0: ekine özgü mevsim */
      const eb = BLOKLAR[es.ekin], MV = ['İlkbahar', 'Yaz', 'Sonbahar', 'Kış'];
      if (eb && eb.mevsim) alt += `<span>En iyi: ${MV.filter((m, i) => eb.mevsim[i] >= 1).join(', ') || '—'} · ${eb.mevsim[3] ? 'kışın yavaş büyür' : 'kışın büyümez'}</span>`;
      if (eb && (eb.tekrar != null || (BLOKLAR[es.ekin + 3] && BLOKLAR[es.ekin + 3].tekrar != null))) alt += '<span>Olgunlaşınca sağ tıkla toplanır; bitki yeniden ürün verir</span>';
    }
    if (es.blok && BLOKLAR[es.blok] && BLOKLAR[es.blok].fidan) alt += '<span>Toprağa ya da çimene dikilir; zamanla ağaç olur</span>';
    if (es.blok && BLOKLAR[es.blok] && BLOKLAR[es.blok].kompost != null) alt += '<span>Bitkisel atıklar (tohum, sebze, meyve, yaprak) sağ tıkla konur; dolunca gübre verir</span>';
    if (es.alet && es.alet.tur === 'capa') alt = `<span>Toprağa sağ tıklanınca tarla toprağı açar</span><span>Dayanım: ${s.dayanim} / ${es.alet.dayanim}</span>`;
    if (es.tur === 'iksir') alt += '<span>Sağ tıkla içilir</span>';
    if (s.id === 139) alt += '<span>Sağ tıkla açılır: eşya onarımı ve birleştirme</span>';
    if (s.id === 156) alt += '<span>Sağ tıkla açılır: alet, silah ve zırh büyüleme</span>';
    if (s.id === 61) alt += '<span>Büyü masasında büyüleme malzemesi</span>';
    if (s.id === 140) alt += '<span>Yakınında iksir üretilir</span>';
    if (s.id === 88 || s.id === 105 || s.id === 121) alt += '<span>Sağ tıkla açılıp kapanır</span>';
    if (s.id === 288) alt += '<span>Köylülerle ticarette kullanılır</span>';
    if (es.tur === 'blok') alt += '<span>Yerleştirilebilir blok</span>';
    /* 0.23.0: ayrıntılı ipuçları: etki, ışık, yığın, malzeme seviyesi, dayanım çubuğu */
    if (es.etki && ETKILER[es.etki.tur]) alt += `<span class="etkiSatir">Etki: ${ETKILER[es.etki.tur].ad} · ${Math.round(es.etki.sure / 60) || 1} dk</span>`;
    if (es.isik) alt += `<span>Işık düzeyi ${es.isik}</span>`;
    if (es.alet && es.alet.seviye) alt += `<span>Kazabildiği: ${['', 'taş', 'bakır ve demir madeni', 'demir madeni', 'elmas ve gök taşı', 'her şey'][es.alet.seviye] || ''}</span>`;
    const md = es.alet ? es.alet.dayanim : es.zirh ? es.zirh.dayanim : 0;
    if (md && s.dayanim != null) { const o = Math.max(0, Math.min(1, s.dayanim / md)); alt += `<span class="dayanimCubuk"><i style="width:${(o * 100).toFixed(0)}%;background:hsl(${Math.round(o * 120)},70%,50%)"></i></span>`; }
    if (this.envanter.yigin(s.id) > 1) alt += `<span class="soluk">Yığın: ${s.adet} / ${this.envanter.yigin(s.id)} · No ${s.id}</span>`;
    const bm = buyuMetinleri(s);
    if (bm.length) alt = bm.map(m => `<span class="buyuSatir">${m}</span>`).join('') + alt;
    ip.innerHTML = `<b${es.efsane ? ' class="efsane"' : bm.length ? ' class="buyulu"' : ''}>${es.ad}</b>${es.efsane ? '<span class="efsaneSatir">Efsanevi eşya</span>' : ''}${alt}`;
    ip.hidden = false;
    ip.style.left = Math.min(innerWidth - 270, e.clientX + 16) + 'px'; ip.style.top = (e.clientY + 16) + 'px';
  }

  /* ---------- Büyü masası (0.14.0) ---------- */
  /* Seçenekler: eşya türü, oyuncunun büyü tohumu ve seçenek sırasına göre belirlenir; tohum her büyülemeden sonra değişir */
  buyuSecenekleri() {
    const A = this.buyuYuva[0];
    if (!A) return { hata: 'Büyülenecek eşyayı sol yuvaya koyunuz.' };
    const uygun = uygunBuyuler(A.id);
    if (!uygun.length) return { hata: 'Bu eşya büyülenemez.' };
    if (buyuluMu(A)) return { hata: 'Bu eşya zaten büyülü. Büyüler örste birleştirilebilir.' };
    const h = this.hayatta, tohum = ((h.buyuTohum || 1) * 2654435761 + A.id * 97) >>> 0;
    const l = BUYU_BEDEL.map((bedel, i) => {
      const r = uretec(tohum + i * 7919);
      const k1 = uygun[Math.floor(r() * uygun.length)], B = BUYULER[k1];
      const sev = n => Math.max(1, Math.min(n, Math.round(n * (i + 1) / 3 * (0.7 + r() * 0.55))));
      const buyu = { [k1]: sev(B.maks) };
      if (i === 2 && uygun.length > 1 && r() < 0.6) { const kal = uygun.filter(k => k !== k1); const k2 = kal[Math.floor(r() * kal.length)]; buyu[k2] = Math.max(1, sev(BUYULER[k2].maks) - 1); }
      return { bedel, kristal: i + 1, buyu };
    });
    return { secenekler: l };
  }
  buyuCiz() {
    this.kok.querySelectorAll('.yuva[data-b]').forEach(el => { yaz(el, this.hud.yuvaIc(this.buyuYuva[+el.dataset.b])); });
    const H = this.buyuSecenekleri(), sv = this.hayatta.seviye, kr = this.buyuYuva[1] ? this.buyuYuva[1].adet : 0, sinir = this.sinirsiz();
    if (H.hata) { $('#buyuSecenek').innerHTML = `<p class="soluk">${H.hata}</p>`; return; }
    $('#buyuSecenek').innerHTML = H.secenekler.map((o, i) => {
      const ok = sinir || (sv >= o.bedel && kr >= o.kristal);
      const ad = Object.entries(o.buyu).map(([k, n]) => `${BUYULER[k].ad} ${romaRakam(n)}`).join(' · ');
      return `<button type="button" class="buyuSecim${ok ? '' : ' olmaz'}" data-sec="${i}"><b>${ad}</b><span><em class="${sinir || sv >= o.bedel ? 'ok' : 'eksik'}">${o.bedel} seviye</em> · <em class="${sinir || kr >= o.kristal ? 'ok' : 'eksik'}">${o.kristal} parıltı kristali</em></span></button>`;
    }).join('') + `<p class="soluk">Seviyeniz: ${sv}</p>`;
  }
  buyule(i) {
    const H = this.buyuSecenekleri(); if (H.hata || this.tasinan) return;
    const o = H.secenekler[i], A = this.buyuYuva[0], K = this.buyuYuva[1], sinir = this.sinirsiz();
    if (!sinir && this.hayatta.seviye < o.bedel) { this.hud.bildirim('Deneyim seviyeniz yetersiz.'); return; }
    if (!sinir && (!K || K.adet < o.kristal)) { this.hud.bildirim(`${o.kristal} parıltı kristali gerekli.`); return; }
    if (!sinir) { this.hayatta.seviyeHarca(o.bedel); K.adet -= o.kristal; if (K.adet <= 0) this.buyuYuva[1] = null; }
    A.buyu = { ...o.buyu };
    this.hayatta.buyuTohum = ((this.hayatta.buyuTohum || 1) * 1103515245 + 12345 + i) >>> 0 || 1;
    if (this.ses.buyu) this.ses.buyu(); else this.ses.ors();
    this.hud.bildirim(`${ESYALAR[A.id].ad} büyülendi: ${buyuMetinleri(A).join(', ')}`, A.id);
    if (this.olay) this.olay('buyu', A);
    this.envanter.bildir(); this.ciz();
  }
  buyuTikla(i, e) {
    const T = this.tasinan, s = this.buyuYuva[i];
    if (T && !s) {
      if (i === 1 && T.id !== KRISTAL) { this.hud.bildirim('Bu yuvaya yalnızca parıltı kristali konur.'); return; }
      if (i === 0 && !uygunBuyuler(T.id).length) { this.hud.bildirim('Bu eşya büyülenemez.'); return; }
      if (i === 0 || e.button === 2) { this.buyuYuva[i] = { ...T, adet: 1 }; T.adet--; if (!T.adet) this.tasinan = null; }
      else { this.buyuYuva[i] = T; this.tasinan = null; }
    } else if (!T && s) {
      if (e.shiftKey) { const k = this.envanter.ekle(s.id, s.adet, s.dayanim, s.buyu); if (k) s.adet = k; else this.buyuYuva[i] = null; }
      else { this.tasinan = s; this.buyuYuva[i] = null; }
    } else if (T && s) {
      if (i === 1 && T.id === KRISTAL) { const k = Math.min(T.adet, this.envanter.yigin(KRISTAL) - s.adet); s.adet += k; T.adet -= k; if (!T.adet) this.tasinan = null; }
      else if (i === 0 && T.adet === 1 && uygunBuyuler(T.id).length) { this.buyuYuva[0] = T; this.tasinan = s; }
    }
    this.ses.tik(); this.envanter.bildir(); this.ciz(); this.hareket(e);
  }

  tasimaCiz() {
    const t = $('#tasima');
    t.innerHTML = this.tasinan ? `<img src="${simge(this.tasinan.id).url}" alt="">${this.tasinan.adet > 1 ? `<span class="adet">${this.tasinan.adet}</span>` : ''}` : '';
  }
}
