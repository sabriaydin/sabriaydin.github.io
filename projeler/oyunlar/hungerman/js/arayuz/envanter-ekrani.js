/* HungerMan - envanter ve üretim ekranı: sürükle-bırak yerine tıkla-al / tıkla-bırak, tarif arama ve kategori */
import { simge } from '../grafik/doku.js';
import { ESYALAR, ZIRH_PARCALARI, maksDayanim, onarimMalzemesi, ETKILER, BUYULER, buyuMetinleri, buyuluMu, uygunBuyuler, romaRakam } from '../bloklar.js';
import { uretec } from '../rastgele.js';

/* Büyü masası: seçeneklerin seviye bedeli ve parıltı kristali gereksinimi */
const BUYU_BEDEL = [2, 5, 9];
const KRISTAL = 61;
import { TARIFLER, KATEGORILER, ISTASYON_ADI, girdiAdi, girdiSay, kacKez, uret, GRUPLAR, istasyonVar, istasyonMetni, istasyonlar } from '../oyun/uretim.js';

const $ = s => document.querySelector(s);

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
    $('#envZirh').innerHTML = ZIRH_PARCALARI.map((a, z) => `<div class="yuva zirhYuva" data-z="${z}" title="${a}"></div>`).join('');
    $('#tarifSekme').innerHTML = KATEGORILER.map(([k, a]) => `<button type="button" data-k="${k}">${a}</button>`).join('');
    $('#tarifSekme').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; this.kategori = b.dataset.k; this.ses.tik(); [...$('#tarifSekme').children].forEach(x => x.classList.toggle('on', x === b)); this.tarifCiz(); });
    $('#tarifAra').addEventListener('input', e => { this.arama = e.target.value.trim().toLocaleLowerCase('tr'); this.tarifCiz(); });
    $('#tarifAra').addEventListener('keydown', e => e.stopPropagation());
    $('#envKapat').addEventListener('click', () => this.kapatIste && this.kapatIste());
    this.kok.addEventListener('contextmenu', e => e.preventDefault());
    this.kok.addEventListener('mousedown', e => this.fare(e));
    this.kok.addEventListener('mousemove', e => this.hareket(e));
    this.kok.addEventListener('mouseleave', () => { $('#ipucu').hidden = true; });
    $('#tarifListe').addEventListener('click', e => {
      const b = e.target.closest('button[data-t]'); if (!b) return;
      const t = TARIFLER[+b.dataset.t];
      const kez = b.dataset.kez === 'hepsi' ? 64 : 1;
      const n = uret(this.envanter, t, kez);
      if (n) {
        this.ses.uretim(); this.hud.bildirim(`${ESYALAR[t.cikti].ad} × ${n * t.adet} üretildi`, t.cikti);
        /* Eritme, pişirme ve iksir yapımı deneyim kazandırır */
        const ist = istasyonlar(t);
        if (this.hayatta && (ist.includes('firin') || ist.includes('simya'))) this.hayatta.xpEkle(n * (ist.includes('simya') ? 2 : 0.35));
      }
      else this.hud.bildirim('Envanterde yer yok.');
      this.ciz();
    });
  }

  /* sandik: { yuvalar: 27 elemanlı dizi, ad } verilirse sağ tarafta üretim yerine sandık gösterilir */
  ac(istasyon, sandik) {
    this.acik = true; this.istasyon = istasyon || null; this.sandik = sandik || null;
    if (istasyon) this.kategori = 'hepsi';
    /* Örs: sağ tarafta onarım bölümü */
    const ors = istasyon === 'ors' && !this.sandik, buyu = istasyon === 'buyu' && !this.sandik;
    $('.envSag').hidden = !!this.sandik || ors || buyu; $('.envSandik').hidden = !this.sandik; $('.envOrs').hidden = !ors; $('.envBuyu').hidden = !buyu;
    this.kok.hidden = false;
    this.ciz();
  }
  kapat() {
    this.acik = false; this.kok.hidden = true;
    $('#ipucu').hidden = true;
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

  ciz() {
    if (!this.acik) return;
    const env = this.envanter;
    this.kok.querySelectorAll('.izgara .yuva[data-i]').forEach(el => {
      const i = +el.dataset.i;
      el.innerHTML = this.hud.yuvaIc(env.yuvalar[i]);
      el.classList.toggle('secili', i === env.secili);
    });
    this.kok.querySelectorAll('.zirhYuva').forEach(el => {
      const z = +el.dataset.z, s = env.zirh[z];
      el.classList.toggle('bosZirh', !s);
      el.innerHTML = s ? this.hud.yuvaIc(s) : `<img src="${simge(400 + z).url}" alt="">`;
    });
    if (this.sandik) this.kok.querySelectorAll('.yuva[data-s]').forEach(el => { el.innerHTML = this.hud.yuvaIc(this.sandik.yuvalar[+el.dataset.s]); });
    if (this.istasyon === 'ors') this.orsCiz();
    if (this.istasyon === 'buyu') this.buyuCiz();
    const zp = env.zirhPuani();
    $('#zirhPuan').innerHTML = `Zırh <b>${zp}</b> / 20<br>Hasar azaltma <b>%${zp * 4}</b>`;
    const h = this.hayatta;
    $('#envDurum').innerHTML = `<span>Can <b>${h.can / 2}</b> / 10</span><span>Açlık <b>${h.aclik / 2}</b> / 10</span>`;
    const ist = this.istasyonlar();
    $('#istasyonDurum').innerHTML = Object.entries(ISTASYON_ADI).map(([k, a]) => `<span class="rozet ${ist.has(k) ? 'var' : 'yok'}">${a}${ist.has(k) ? ' yakında' : ''}</span>`).join('');
    [...$('#tarifSekme').children].forEach(b => b.classList.toggle('on', b.dataset.k === this.kategori));
    this.tarifCiz();
    this.tasimaCiz();
  }

  tarifCiz() {
    const env = this.envanter, ist = this.istasyonlar();
    const liste = TARIFLER.map((t, i) => ({ t, i, n: kacKez(env, t), istOk: istasyonVar(t, ist) }))
      .filter(o => this.kategori === 'hepsi' || o.t.kategori === this.kategori)
      .filter(o => !this.arama || ESYALAR[o.t.cikti].ad.toLocaleLowerCase('tr').includes(this.arama))
      .sort((a, b) => ((b.n > 0 && b.istOk) - (a.n > 0 && a.istOk)) || (a.istOk === b.istOk ? 0 : a.istOk ? -1 : 1));
    if (!liste.length) { $('#tarifListe').innerHTML = '<div class="bos">Eşleşen tarif mevcut değil.</div>'; return; }
    $('#tarifListe').innerHTML = liste.map(({ t, i, n, istOk }) => {
      const e = ESYALAR[t.cikti];
      const gir = t.girdi.map(([g, a]) => {
        const var_ = girdiSay(env, g), id = GRUPLAR[g] ? GRUPLAR[g].idler[0] : g;
        return `<span class="${var_ >= a ? 'ok' : 'eksik'}"><img src="${simge(id).url}" alt="">${girdiAdi(g)} ${Math.min(var_, a)}/${a}</span>`;
      }).join('');
      const yapilir = n > 0 && istOk;
      return `<div class="tarif${yapilir ? '' : ' olmaz'}">
        <div class="tSimge"><img src="${simge(t.cikti).url}" alt="">${t.adet > 1 ? `<span>${t.adet}</span>` : ''}</div>
        <div><b>${e.ad}</b><div class="gir">${gir}</div>${t.istasyon ? `<div class="ist ${istOk ? '' : 'eksik'}">${istasyonMetni(t)} gerekli${istOk ? '' : ' (yakında değil)'}</div>` : ''}</div>
        <div class="uretBtn"><button type="button" data-t="${i}" ${yapilir ? '' : 'disabled'}>Üret</button>${yapilir && n > 1 && e.yigin > 1 ? `<button type="button" class="cok" data-t="${i}" data-kez="hepsi">Tümü (${Math.min(n, Math.floor(64 / t.adet) || 1)})</button>` : ''}</div>
      </div>`;
    }).join('');
  }

  /* ---------- Yuva tıklamaları ---------- */
  fare(e) {
    if (e.target.closest('#tarifListe, #tarifSekme, #tarifAra, .kapat')) return;
    const el = e.target.closest('.izgara .yuva');
    const env = this.envanter;
    if (el && el.dataset.o != null) { e.preventDefault(); this.orsTikla(+el.dataset.o, e); return; }
    if (el && el.dataset.b != null) { e.preventDefault(); this.buyuTikla(+el.dataset.b, e); return; }
    if (!el) {
      /* Pencere dışına tıklanırsa taşınan eşya bırakılır */
      if (this.tasinan && !e.target.closest('.pencere')) {
        const n = e.button === 2 ? 1 : this.tasinan.adet;
        this.birak(this.tasinan.id, n, this.tasinan.dayanim, this.tasinan.buyu);
        this.tasinan.adet -= n; if (this.tasinan.adet <= 0) this.tasinan = null;
        this.tasimaCiz();
      }
      return;
    }
    e.preventDefault();
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
        const S = this.sandik.yuvalar; let kalan = s.adet;
        if (s.dayanim == null) for (let j = 0; j < 27 && kalan; j++) { const t = S[j]; if (t && t.id === s.id && t.adet < max) { const k = Math.min(kalan, max - t.adet); t.adet += k; kalan -= k; } }
        for (let j = 0; j < 27 && kalan; j++) if (!S[j]) { S[j] = { ...s, adet: kalan }; kalan = 0; }
        if (kalan) s.adet = kalan; else D[i] = null;
      }
      this.ses.tik(); env.bildir(); this.ciz(); return;
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
    this.kok.querySelectorAll('.yuva[data-o]').forEach(el => { const i = +el.dataset.o; el.innerHTML = this.hud.yuvaIc(i < 2 ? this.ors[i] : H.sonuc || null); el.classList.toggle('olmaz', i === 2 && !!H.sonuc && this.hayatta.seviye < H.maliyet && !this.sinirsiz()); });
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
    const s = el && (el.dataset.o != null ? (+el.dataset.o < 2 ? this.ors[+el.dataset.o] : this.orsHesap().sonuc) : el.dataset.b != null ? this.buyuYuva[+el.dataset.b] : el.dataset.z != null ? this.envanter.zirh[+el.dataset.z] : el.dataset.s != null ? this.sandik && this.sandik.yuvalar[+el.dataset.s] : this.envanter.yuvalar[+el.dataset.i]);
    if (!s || this.tasinan) { ip.hidden = true; return; }
    const es = ESYALAR[s.id];
    let alt = '';
    if (es.alet && es.alet.tur === 'yay') alt += `<span>Sağ tık basılı tutularak gerilir</span><span>Dayanım: ${s.dayanim} / ${es.alet.dayanim}</span>`;
    else if (es.alet && es.alet.tur === 'olta') alt += `<span>Sağ tıkla atılır; şamandıra dalınca sağ tıkla çekilir</span><span>Dayanım: ${s.dayanim} / ${es.alet.dayanim}</span>`;
    else if (es.alet) alt += `<span>Hız: ${es.alet.hiz} · Saldırı hasarı: ${es.alet.hasar / 2} kalp · Seviye ${es.alet.seviye}</span><span>Dayanım: ${s.dayanim} / ${es.alet.dayanim}</span>`;
    if (es.zirh) alt += `<span>Zırh +${es.zirh.puan} · ${ZIRH_PARCALARI[es.zirh.parca]}</span><span>Dayanım: ${s.dayanim} / ${es.zirh.dayanim}</span>`;
    if (es.ozellik) alt += `<span>${es.ozellik}</span>`;
    if (es.tekne) alt += '<span>Su yüzeyine sağ tıkla konur; binmek için sağ, inmek için C</span>';
    if (s.id === 299) alt += '<span>Balıkçılar iyi fiyat verir</span>';
        if (es.zehir) alt += '<span>Mide bulantısı yapabilir</span>';
    if (es.yemek) alt += `<span>Açlığı ${es.yemek / 2} birim giderir</span>`;
    if (es.iyilestir) alt += `<span>${es.iyilestir / 2} kalp iyileştirir</span>`;
    if (es.iyilestirme) alt += `<span>Ayrıca ${es.iyilestirme / 2} kalp iyileştirir</span>`;
    if (es.ekin) alt += '<span>Toprak, çimen veya tarla toprağına ekilir; tarlada daha hızlı büyür</span>';
    if (es.alet && es.alet.tur === 'capa') alt = `<span>Toprağa sağ tıklanınca tarla toprağı açar</span><span>Dayanım: ${s.dayanim} / ${es.alet.dayanim}</span>`;
    if (es.tur === 'iksir') alt += '<span>Sağ tıkla içilir</span>';
    if (s.id === 139) alt += '<span>Sağ tıkla açılır: eşya onarımı ve birleştirme</span>';
    if (s.id === 156) alt += '<span>Sağ tıkla açılır: alet, silah ve zırh büyüleme</span>';
    if (s.id === 61) alt += '<span>Büyü masasında büyüleme malzemesi</span>';
    if (s.id === 140) alt += '<span>Yakınında iksir üretilir</span>';
    if (s.id === 88 || s.id === 105 || s.id === 121) alt += '<span>Sağ tıkla açılıp kapanır</span>';
    if (s.id === 288) alt += '<span>Köylülerle ticarette kullanılır</span>';
    if (es.tur === 'blok') alt += '<span>Yerleştirilebilir blok</span>';
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
    this.kok.querySelectorAll('.yuva[data-b]').forEach(el => { el.innerHTML = this.hud.yuvaIc(this.buyuYuva[+el.dataset.b]); });
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
