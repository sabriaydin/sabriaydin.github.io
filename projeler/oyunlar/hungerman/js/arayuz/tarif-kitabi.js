/* HungerMan - Tarif Kitabı (B) ve takip edilen tarif (0.17.0)
   Bütün eşyalar aranır ve türlerine göre süzülür. Seçilen eşyanın nasıl yapıldığı (istasyonuyla), hangi tariflerde kullanıldığı,
   nereden bulunduğu (blok, canlı, köylü takası, olta) ve yiyecek / alet / zırh bilgileri gösterilir.
   Bir tarif takibe alınınca ekranın solunda malzemelerin envanterdeki durumu görünür. */
import { simge } from '../grafik/doku.js';
import { BLOKLAR, ESYALAR, ETKILER } from '../bloklar.js';
import { TARIFLER, KATEGORILER, GRUPLAR, istasyonMetni, girdiAdi, girdiSay, kacKez } from '../oyun/uretim.js';
import { TURLER } from '../varlik/turler.js';
import { MESLEKLER } from '../koy/meslekler.js';
import { OLTA_BALIK, OLTA_CER, OLTA_HAZINE } from '../oyun/olta.js';

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const kucuk = s => String(s).toLocaleLowerCase('tr');
const SAYI = n => String(n).replace('.', ',');

/* Kitaptaki sekmeler: tarif kategorileri ve tarifi olmayan doğal eşyalar */
const SEKMELER = [...KATEGORILER, ['dogal', 'Doğada']];

/* Eşyaların kaynakları bir kez, ilk açılışta hesaplanır */
let KAYNAK = null;
function kaynaklariHesapla() {
  KAYNAK = new Map();
  const ekle = (id, metin) => { if (!ESYALAR[id]) return; const l = KAYNAK.get(id) || []; if (!l.includes(metin)) l.push(metin); KAYNAK.set(id, l); };
  /* Bloklar: kırılınca düşenler (rastgele düşüşler birkaç kez denenir) */
  for (const b of BLOKLAR) {
    if (!b || !b.id || !b.dusur) continue;
    const goren = new Set();
    for (let i = 0; i < 40; i++) { let l = []; try { l = b.dusur(Math.random) || []; } catch (e) { break; } for (const [e, n] of l) if (n > 0 && e !== b.id && e !== b.taban) goren.add(e); }
    const ad = BLOKLAR[b.taban || b.id] && BLOKLAR[b.taban || b.id].ad || b.ad;
    for (const e of goren) ekle(e, `${ad} kırılınca`);
  }
  /* Canlılar */
  for (const [k, t] of Object.entries(TURLER)) {
    if (!t.dusur || !t.ad) continue;
    const goren = new Set();
    for (let i = 0; i < 80; i++) { let l = []; try { l = t.dusur(Math.random) || []; } catch (e) { break; } for (const [e, n] of l) if (n > 0) goren.add(e); }
    for (const e of goren) ekle(e, `${t.ad} öldürülünce`);
  }
  /* Köylü takasları */
  for (const m of Object.values(MESLEKLER)) for (const tk of [...(m.sabit || []), ...(m.havuz || [])]) if (tk.al[0] !== 288) ekle(tk.al[0], `${m.ad} köylüsünden takasla`);
  for (const m of Object.values(MESLEKLER)) for (const tk of [...(m.sabit || []), ...(m.havuz || [])]) if (tk.al[0] === 288) for (const [e] of tk.ver) ekle(288, `${ESYALAR[e] ? ESYALAR[e].ad : 'Eşya'} satarak`);
  /* Olta */
  for (const [e] of OLTA_BALIK) ekle(e, 'Balık tutarak');
  for (const [e] of OLTA_CER) ekle(e, 'Oltayla (çer çöp)');
  for (const [e] of OLTA_HAZINE) ekle(e, 'Oltayla (hazine)');
  /* Sikke satışları çok uzun olabilir; en çok altısı gösterilir */
  const s = KAYNAK.get(288); if (s && s.length > 6) KAYNAK.set(288, [...s.slice(0, 6), `ve ${s.length - 6} takas daha`]);
}

/* Eşyanın kitaptaki sekmesi: ilk tarifinin kategorisi; tarifi yoksa doğal */
const KATEGORI = new Map();
for (const t of TARIFLER) if (!KATEGORI.has(t.cikti)) KATEGORI.set(t.cikti, t.kategori);
const KULLANIM = new Map();
for (const t of TARIFLER) for (const [g] of t.girdi) {
  const idler = GRUPLAR[g] ? GRUPLAR[g].idler : [g];
  for (const id of idler) { const l = KULLANIM.get(id) || []; if (!l.includes(t)) l.push(t); KULLANIM.set(id, l); }
}
const LISTE = Object.values(ESYALAR).filter(e => e && e.ad && !e.gizli).sort((a, b) => a.id - b.id);

export class TarifKitabi {
  constructor(o) {
    Object.assign(this, o);   // ses, kapatIste, takipDegisti(i)
    this.acik = false;
    this.env = null;          // oyuncunun envanteri
    this.mevcut = new Set();  // yakındaki istasyonlar
    this.sekme = 'hepsi'; this.arama = ''; this.secili = null; this.gecmis = [];
    this.takip = -1;          // takip edilen tarifin sırası (TARIFLER içinde)
    this.kok = $('#tarifKitabi');
    $('#tkKapat').addEventListener('click', () => this.kapatIste());
    this.kok.addEventListener('mousedown', e => { if (e.target === this.kok) this.kapatIste(); });
    $('#tkAra').addEventListener('input', e => { this.arama = e.target.value; this.izgaraCiz(); });
    $('#tkSekme').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; this.sekme = b.dataset.k; this.ses.tik(); this.izgaraCiz(); });
    $('#tkIzgara').addEventListener('click', e => { const b = e.target.closest('button[data-id]'); if (b) this.sec(+b.dataset.id); });
    $('#tkAyrinti').addEventListener('click', e => {
      const g = e.target.closest('[data-git]'), tk = e.target.closest('[data-takip]'), geri = e.target.closest('[data-geri]');
      if (g) { this.gecmis.push(this.secili); this.sec(+g.dataset.git, true); }
      else if (geri && this.gecmis.length) this.sec(this.gecmis.pop(), true);
      else if (tk) { const i = +tk.dataset.takip; this.takipEt(this.takip === i ? -1 : i); this.ses.tik(); this.ayrintiCiz(); }
    });
    $('#tkIzgara').addEventListener('mouseover', e => { const b = e.target.closest('button[data-id]'); $('#tkIpucu').textContent = b ? ESYALAR[+b.dataset.id].ad : ''; });
  }
  ac(env, mevcut, id) {
    if (!KAYNAK) kaynaklariHesapla();
    this.env = env; this.mevcut = mevcut || new Set();
    this.acik = true; this.kok.hidden = false;
    $('#tkSekme').innerHTML = SEKMELER.map(([k, ad]) => `<button type="button" data-k="${k}">${ad}</button>`).join('');
    $('#tkAra').value = this.arama;
    if (id) this.secili = id;
    if (this.secili == null) this.secili = LISTE[0].id;
    this.gecmis = [];
    this.izgaraCiz(); this.ayrintiCiz();
  }
  kapat() { this.acik = false; this.kok.hidden = true; }

  yapilabilir(id) { return TARIFLER.some(t => t.cikti === id && kacKez(this.env, t) > 0); }
  izgaraCiz() {
    [...$('#tkSekme').children].forEach(b => b.classList.toggle('on', b.dataset.k === this.sekme));
    const a = kucuk(this.arama.trim());
    const l = LISTE.filter(e => (this.sekme === 'hepsi' || (this.sekme === 'dogal' ? !KATEGORI.has(e.id) : KATEGORI.get(e.id) === this.sekme)) && (!a || kucuk(e.ad).includes(a)));
    $('#tkSayi').textContent = `${l.length} eşya`;
    $('#tkIzgara').innerHTML = l.length ? l.map(e => `<button type="button" data-id="${e.id}" class="${e.id === this.secili ? 'secili' : ''}${this.env && this.yapilabilir(e.id) ? ' yapilir' : ''}"><img src="${simge(e.id).url}" alt=""></button>`).join('')
      : '<p class="tkBos">Aramaya uyan eşya bulunamadı.</p>';
  }
  sec(id, gecmisKorunsun) {
    if (!ESYALAR[id]) return;
    if (!gecmisKorunsun) this.gecmis = [];
    this.secili = id; this.ses.sayfa();
    [...$('#tkIzgara').children].forEach(b => b.classList && b.classList.toggle('secili', +b.dataset.id === id));
    this.ayrintiCiz();
  }

  /* Girdi kutusu: simge, adet ve envanterdeki durum */
  girdi(g, a, carpan = 1) {
    const id = GRUPLAR[g] ? GRUPLAR[g].idler[0] : g, var_ = this.env ? girdiSay(this.env, g) : 0, gerek = a * carpan;
    return `<span class="tkGirdi ${var_ >= gerek ? 'tamam' : 'eksik'}" ${GRUPLAR[g] ? '' : `data-git="${id}"`} title="${esc(girdiAdi(g))}"><img src="${simge(id).url}" alt=""><b>${gerek}</b><small>${esc(girdiAdi(g))}</small></span>`;
  }
  tarifSatiri(t) {
    const i = TARIFLER.indexOf(t), kez = this.env ? kacKez(this.env, t) : 0;
    const ist = t.istasyon ? istasyonMetni(t) : 'Her yerde';
    const istVar = !t.istasyon || [].concat(t.istasyon).some(k => this.mevcut.has(k));
    return `<div class="tkTarif">
      <div class="tkGirdiler">${t.girdi.map(([g, a]) => this.girdi(g, a)).join('<i class="arti">+</i>')}<i class="ok">→</i>
        <span class="tkGirdi cikti" data-git="${t.cikti}" title="${esc(ESYALAR[t.cikti].ad)}"><img src="${simge(t.cikti).url}" alt=""><b>${t.adet}</b><small>${esc(ESYALAR[t.cikti].ad)}</small></span></div>
      <div class="tkTarifAlt"><span class="tkIst ${istVar ? '' : 'uzak'}">${esc(ist)}</span>${kez > 0 ? `<span class="tkKez">Malzeme ${kez} kez yetiyor</span>` : '<span class="tkKez eksik">Malzeme eksik</span>'}
        <button type="button" class="dugme kucuk ${this.takip === i ? 'ana' : ''}" data-takip="${i}">${this.takip === i ? 'Takibi bırak' : 'Takip et'}</button></div>
    </div>`;
  }
  bilgi(e) {
    const l = [];
    if (e.tur === 'blok') { const b = BLOKLAR[e.id]; l.push('Blok'); if (b.isik || b.mesale) l.push('Işık verir'); if (b.mekanik) l.push('Mekanik'); if (b.oturak) l.push('Oturulabilir'); }
    if (e.yemek) l.push(`+${e.yemek} tokluk`);
    if (e.iyilestirme) l.push(`+${e.iyilestirme} can`);
    if (e.iyilestir) l.push(`+${e.iyilestir} can`);
    if (e.zehir) l.push('Mide bulandırabilir');
    if (e.kase) l.push('Kâsesi geri kalır');
    if (e.etki && ETKILER[e.etki.tur]) l.push(`${ETKILER[e.etki.tur].ad} (${e.etki.sure} sn)`);
    if (e.alet && e.alet.dayanim) l.push(`Dayanıklılık ${e.alet.dayanim}`);
    if (e.alet && e.alet.hasar > 1) l.push(`Hasar ${SAYI(e.alet.hasar)}`);
    if (e.zirh) l.push(`Zırh ${e.zirh.puan}`, `Dayanıklılık ${e.zirh.dayanim}`);
    if (e.ozellik && !(e.etki && ETKILER[e.etki.tur])) l.push(e.ozellik);
    l.push(`Yığın ${e.yigin}`);
    return l.map(s => `<span>${esc(s)}</span>`).join('');
  }
  ayrintiCiz() {
    const e = ESYALAR[this.secili];
    if (!e) { $('#tkAyrinti').innerHTML = ''; return; }
    const yap = TARIFLER.filter(t => t.cikti === e.id);
    const kul = (KULLANIM.get(e.id) || []).filter(t => t.cikti !== e.id);
    const kay = (KAYNAK && KAYNAK.get(e.id)) || [];
    const var_ = this.env ? this.env.say(e.id) : 0;
    $('#tkAyrinti').innerHTML = `
      <div class="tkBas">${this.gecmis.length ? '<button type="button" class="tkGeri" data-geri="1" aria-label="Geri">‹</button>' : ''}<img src="${simge(e.id).url}" alt="">
        <div><h3>${esc(e.ad)}</h3><div class="tkEtiket">${this.bilgi(e)}</div>${var_ ? `<small class="tkVar">Envanterde ${var_} adet</small>` : ''}</div></div>
      <h4>Nasıl yapılır</h4>
      ${yap.length ? yap.map(t => this.tarifSatiri(t)).join('') : '<p class="tkNot">Bu eşyanın tarifi yoktur; doğada bulunur ya da elde edilir.</p>'}
      ${kay.length ? `<h4>Nereden bulunur</h4><ul class="tkKaynak">${kay.map(k => `<li>${esc(k)}</li>`).join('')}</ul>` : ''}
      ${kul.length ? `<h4>Kullanıldığı tarifler <small>${kul.length}</small></h4><div class="tkKullanim">${kul.map(t => `<button type="button" data-git="${t.cikti}" title="${esc(ESYALAR[t.cikti].ad)}"><img src="${simge(t.cikti).url}" alt=""><span>${esc(ESYALAR[t.cikti].ad)}</span></button>`).join('')}</div>` : ''}`;
  }

  /* ---------- Takip ---------- */
  takipEt(i) {
    this.takip = TARIFLER[i] ? i : -1;
    if (this.takipDegisti) this.takipDegisti(this.takip);
    this.takipCiz(true);
  }
  /* HUD kutusu: her yarım saniyede bir yenilenir */
  takipCiz(zorla) {
    const k = $('#tarifTakip'), t = TARIFLER[this.takip];
    if (!t || !this.env) { if (!k.hidden) { k.hidden = true; this.sonTakip = ''; } return; }
    const satir = t.girdi.map(([g, a]) => { const n = girdiSay(this.env, g), id = GRUPLAR[g] ? GRUPLAR[g].idler[0] : g; return [id, girdiAdi(g), Math.min(n, a), a]; });
    const hazir = satir.every(s => s[2] >= s[3]);
    const h = `<header><img src="${simge(t.cikti).url}" alt=""><b>${esc(ESYALAR[t.cikti].ad)}${t.adet > 1 ? ` ×${t.adet}` : ''}</b></header>` +
      satir.map(([id, ad, n, a]) => `<div class="${n >= a ? 'tamam' : ''}"><img src="${simge(id).url}" alt=""><span>${esc(ad)}</span><b>${n}/${a}</b></div>`).join('') +
      `<small class="${hazir ? 'hazir' : ''}">${hazir ? (t.istasyon ? `Hazır · ${esc(istasyonMetni(t))}` : 'Hazır · Q ile üretiniz') : (t.istasyon ? esc(istasyonMetni(t)) : 'Her yerde üretilir')}</small>`;
    if (zorla || h !== this.sonTakip) { this.sonTakip = h; k.innerHTML = h; }
    k.hidden = false;
  }
}
