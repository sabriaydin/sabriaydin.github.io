/* HungerMan - 0.49.0: oyun kumandası (Gamepad API, standart düzen: Xbox / PlayStation / genel)
   Oyunda: sol çubuk yürüme (sonuna kadar ileri ya da sol çubuğa basma: koşu), sağ çubuk bakış, A zıpla, B eğil, X etkileşim, Y envanter,
   LB / RB hızlı erişim yuvası, LT kullan / koy, RT kır / saldır, Geri (Select) harita, Başlat (Start) duraklat,
   yön tuşları: yukarı görevler, aşağı eşya at, sol Tarif Kitabı, sağ yerleştirme yönü.
   Menülerde ve pencerelerde: ekranda bir imleç belirir; sol çubuk imleci sürer, A sol tık, X sağ tık, B geri / kapat, sağ çubuk kaydırır.
   Kumanda girdileri oyunun klavye ve fare durumlarına (tus, fare) ve klavye olaylarına çevrilir; oyunun geri kalanı aynı kodla çalışır. */
import { T } from './tuslar.js';
const $ = s => document.querySelector(s);
const OLU = 0.2, YON = 0.38;
const D = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, GERI: 8, BASLAT: 9, L3: 10, R3: 11, YUKARI: 12, ASAGI: 13, SOL: 14, SAG: 15 };
const egri = v => { const a = Math.abs(v); if (a < OLU) return 0; const k = (a - OLU) / (1 - OLU); return Math.sign(v) * k * k * (0.4 + 0.6 * k) * 1.25; };

export class Kumanda {
  constructor(o) {
    Object.assign(this, o);   // tus, fare, bak(dx, dy), oyunda(), oyunEkrani(), kilitle(), menu(), devam(), kosKilit(v), yuva(d), hassasiyet()
    this.aktif = false; this.onceki = []; this.tutulan = new Map(); this.yonler = {}; this.imlec = { x: innerWidth / 2, y: innerHeight / 2 };
    this.el = $('#kumandaImlec');
    addEventListener('gamepadconnected', e => { if (this.bagli) this.bagli(e.gamepad.id); });
    addEventListener('gamepaddisconnected', () => { this.birak(); if (this.koptu) this.koptu(); });
  }
  gamepad() { const l = navigator.getGamepads ? navigator.getGamepads() : []; for (const g of l) if (g && g.connected) return g; return null; }
  /* Fare ya da klavye yeniden kullanılınca kumanda kipi kapanır */
  birak() {
    for (const [, kod] of this.tutulan) this.olay('keyup', kod);
    this.tutulan.clear();
    for (const k of Object.keys(this.yonler)) if (this.yonler[k]) { this.tus[T[k]] = false; this.yonler[k] = false; }
    if (this.fareTutuldu) { this.fare.sol = this.fare.sag = false; this.fareTutuldu = false; }
    this.kosKilit(false);
    this.aktif = false; document.body.classList.remove('kumanda'); if (this.el) this.el.hidden = true; if (this.degisti) this.degisti();
  }
  olay(tur, code) { dispatchEvent(new KeyboardEvent(tur, { code, key: code === 'Escape' ? 'Escape' : '', bubbles: true })); }
  bas(code) { this.olay('keydown', code); this.olay('keyup', code); }
  /* İmlecin altındaki öğeye fare olayları */
  tikla(dugme) {
    const { x, y } = this.imlec, el = document.elementFromPoint(x, y); if (!el) return;
    const o = { bubbles: true, cancelable: true, clientX: x, clientY: y, button: dugme, buttons: dugme === 2 ? 2 : 1, view: window };
    el.dispatchEvent(new MouseEvent('mousedown', o)); el.dispatchEvent(new MouseEvent('mouseup', o));
    if (dugme === 0) { if (el.matches('input[type=range], input[type=checkbox], select, button, label, a, summary') || el.closest('button, label, a, summary')) el.click(); else el.dispatchEvent(new MouseEvent('click', o)); }
    else el.dispatchEvent(new MouseEvent('contextmenu', o));
    if (el.matches('input[type=text], input[type=search], input:not([type]), input[type=number]')) el.focus();
  }
  imlecHareket(dx, dy) {
    const I = this.imlec;
    I.x = Math.max(0, Math.min(innerWidth - 1, I.x + dx)); I.y = Math.max(0, Math.min(innerHeight - 1, I.y + dy));
    if (this.el) { this.el.style.transform = `translate(${I.x}px, ${I.y}px)`; }
    const el = document.elementFromPoint(I.x, I.y);
    if (el) el.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: I.x, clientY: I.y, view: window }));
  }
  guncelle(dt) {
    const g = this.gamepad();
    if (!g) { if (this.aktif) this.birak(); return; }
    const B = g.buttons.map(b => (b ? b.value > 0.5 || b.pressed : false)), A = g.axes;
    const ilk = i => B[i] && !this.onceki[i];
    const hareketli = B.some(Boolean) || A.some(v => Math.abs(v) > 0.45);
    if (!this.aktif) {
      if (!hareketli) { this.onceki = B; return; }
      this.aktif = true; document.body.classList.add('kumanda'); if (this.degisti) this.degisti();
      this.onceki = B; return;   // ilk dokunuş yalnızca kipi açar
    }
    const lx = A[0] || 0, ly = A[1] || 0, rx = A[2] || 0, ry = A[3] || 0;
    const oyunda = this.oyunda();
    /* Basılı tutulan tuşlar (zıpla, eğil) oyunda değilken bırakılır */
    const tut = (dugme, eylem) => {
      const v = oyunda && B[dugme], var_ = this.tutulan.has(dugme);
      if (v && !var_) { this.tutulan.set(dugme, T[eylem]); this.olay('keydown', T[eylem]); }
      else if (!v && var_) { this.olay('keyup', this.tutulan.get(dugme)); this.tutulan.delete(dugme); }
    };
    tut(D.A, 'zipla'); tut(D.B, 'egil');
    if (oyunda) {
      if (this.el && !this.el.hidden) this.el.hidden = true;
      /* Yürüme: yön tuşları kumandanın kendi ayarladığı değerlerle değişir (klavyeyle çakışmaz) */
      const y = { ileri: ly < -YON, geri: ly > YON, sol: lx < -YON, sag: lx > YON };
      for (const k in y) if (y[k] !== !!this.yonler[k]) { this.tus[T[k]] = y[k]; this.yonler[k] = y[k]; }
      if (ilk(D.L3)) this.kosAcik = !this.kosAcik;
      if (!y.ileri) this.kosAcik = false;
      this.kosKilit(y.ileri && (this.kosAcik || (ly < -0.95 && Math.abs(lx) < 0.4)));
      /* Bakış */
      const h = 640 * (this.hassasiyet ? this.hassasiyet() : 1) * dt;
      const bx = egri(rx), by = egri(ry);
      if (bx || by) this.bak(bx * h, by * h);
      /* Tetikler */
      const sag = B[D.LT] || (g.buttons[D.LT] && g.buttons[D.LT].value > 0.4), sol = B[D.RT] || (g.buttons[D.RT] && g.buttons[D.RT].value > 0.4);
      if (sag !== this.fare.sag || sol !== this.fare.sol || this.fareTutuldu) { this.fare.sag = !!sag; this.fare.sol = !!sol; this.fareTutuldu = !!(sag || sol); }
      if (ilk(D.X)) this.bas(T.etkiles);
      if (ilk(D.Y)) this.bas(T.envanter);
      if (ilk(D.LB)) this.yuva(-1);
      if (ilk(D.RB)) this.yuva(1);
      if (ilk(D.GERI)) this.bas(T.harita);
      if (ilk(D.BASLAT)) this.menu();
      if (ilk(D.YUKARI)) this.bas(T.gorev);
      if (ilk(D.ASAGI)) this.bas(T.at);
      if (ilk(D.SOL)) this.bas(T.tarif);
      if (ilk(D.SAG)) this.bas(T.dondur);
    } else {
      /* Menü ve pencere kipi: imleç */
      for (const k of Object.keys(this.yonler)) if (this.yonler[k]) { this.tus[T[k]] = false; this.yonler[k] = false; }
      if (this.fareTutuldu) { this.fare.sol = this.fare.sag = false; this.fareTutuldu = false; }
      this.kosKilit(false);
      if (this.el && this.el.hidden) { this.el.hidden = false; this.imlecHareket(0, 0); }
      const hz = 900 * dt, mx = egri(lx) + (B[D.SAG] ? 0.5 : 0) - (B[D.SOL] ? 0.5 : 0), my = egri(ly) + (B[D.ASAGI] ? 0.5 : 0) - (B[D.YUKARI] ? 0.5 : 0);
      if (mx || my) this.imlecHareket(mx * hz, my * hz);
      if (Math.abs(ry) > 0.3) { const el = document.elementFromPoint(this.imlec.x, this.imlec.y); let s = el; while (s && s !== document.body && !(s.scrollHeight > s.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(s).overflowY))) s = s.parentElement; if (s && s !== document.body) s.scrollTop += egri(ry) * 900 * dt; }
      if (ilk(D.A)) { if (this.oyunEkrani() && this.kilitIste()) this.kilitle(); else this.tikla(0); }
      if (ilk(D.X)) this.tikla(2);
      if (ilk(D.B)) { if (this.panelAcik && this.panelAcik()) this.panelKapat(); else this.bas('Escape'); }
      if (ilk(D.Y)) this.bas(T.envanter);
      if (ilk(D.BASLAT)) this.devam();
    }
    this.onceki = B;
  }
}
