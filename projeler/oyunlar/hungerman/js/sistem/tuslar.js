/* HungerMan - değiştirilebilir tuş atamaları (0.30.7)
   Her eylemin bir tuşu vardır (KeyboardEvent.code). Ayarlar > Kontroller'den değiştirilir; ayar.tuslar içinde yalnızca varsayılandan farklı olanlar saklanır.
   Esc, 1-9 (hızlı erişim) ve fare düğmeleri sabittir. Bir tuş başka bir eyleme atanınca iki eylemin tuşları yer değiştirir. */
export const EYLEMLER = [
  ['hareket', 'Hareket', [['ileri', 'İleri', 'KeyW'], ['geri', 'Geri', 'KeyS'], ['sol', 'Sola', 'KeyA'], ['sag', 'Sağa', 'KeyD'], ['zipla', 'Zıpla / yüz', 'Space'], ['kos', 'Koş', 'ShiftLeft'], ['egil', 'Eğil / in', 'KeyC']]],
  ['eylem', 'Eylemler', [['etkiles', 'Etkileşim', 'KeyE'], ['at', 'Eşya at', 'KeyG'], ['dondur', 'Yerleştirmeyi döndür', 'KeyR']]],
  ['pencere', 'Pencereler', [['envanter', 'Envanter ve üretim', 'KeyQ'], ['tarif', 'Tarif Kitabı', 'KeyB'], ['harita', 'Harita', 'KeyM'], ['basarim', 'Başarımlar', 'KeyL'], ['gorev', 'Görevler', 'KeyJ'], ['sohbet', 'Sohbet (çok oyunculu)', 'KeyT'], ['liste', 'Oyuncu listesi', 'Tab']]],
  ['diger', 'Diğer', [['foto', 'Fotoğraf modu', 'F1'], ['ekran', 'Ekran görüntüsü', 'F2'], ['hata', 'Hata ayıklama bilgisi', 'F3'], ['konsol', 'Geliştirici konsolu', 'F8'], ['gelistirici', 'Geliştirici penceresi', 'F9']]]
];
export const VARSAYILAN_TUS = {};
for (const [, , l] of EYLEMLER) for (const [k, , t] of l) VARSAYILAN_TUS[k] = t;
/* Geçerli atamalar (eylem -> tuş kodu) */
export const T = { ...VARSAYILAN_TUS };
export const SABIT = new Set(['Escape', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'MetaLeft', 'MetaRight', 'ContextMenu']);

/* ayar.tuslar'dan atamaları kurar (bozuk ya da çakışan kayıtlar yok sayılır) */
export function tuslariKur(kayit) {
  Object.assign(T, VARSAYILAN_TUS);
  if (!kayit || typeof kayit !== 'object') return;
  for (const [k, t] of Object.entries(kayit)) if (k in VARSAYILAN_TUS && typeof t === 'string' && t && !SABIT.has(t)) {
    const diger = Object.keys(T).find(e => e !== k && T[e] === t);
    if (diger) T[diger] = T[k];
    T[k] = t;
  }
}
/* Ayara yazılacak biçim: yalnızca değişenler */
export function tusKaydi() { const o = {}; for (const k in T) if (T[k] !== VARSAYILAN_TUS[k]) o[k] = T[k]; return o; }
/* Eyleme tuş atar; tuş başka eylemdeyse yer değiştirir. Dönen: yer değiştiren eylem (yoksa null) */
export function tusAta(k, t) {
  if (SABIT.has(t)) return false;
  const diger = Object.keys(T).find(e => e !== k && T[e] === t);
  if (diger) T[diger] = T[k];
  T[k] = t;
  return diger || null;
}
/* Eylemin tuşu basılı mı (koşma ve eğilmede sol / sağ değişkenleri birlikte sayılır) */
export function basili(tus, k) {
  const t = T[k];
  if (tus[t]) return true;
  const es = { ShiftLeft: 'ShiftRight', ShiftRight: 'ShiftLeft', ControlLeft: 'ControlRight', ControlRight: 'ControlLeft', AltLeft: 'AltRight', AltRight: 'AltLeft' }[t];
  return !!(es && tus[es]);
}
/* Tuş kodunun okunur adı */
const AD = { Space: 'Boşluk', ShiftLeft: 'Sol Shift', ShiftRight: 'Sağ Shift', ControlLeft: 'Sol Ctrl', ControlRight: 'Sağ Ctrl', AltLeft: 'Sol Alt', AltRight: 'Alt Gr', Tab: 'Tab', CapsLock: 'Caps Lock', Enter: 'Enter',
  Backspace: 'Geri al', Backquote: '"', Minus: '*', Equal: '-', BracketLeft: 'Ğ', BracketRight: 'Ü', Semicolon: 'Ş', Quote: 'İ', Backslash: ',', Comma: 'Ö', Period: 'Ç', Slash: '.', IntlBackslash: '<',
  ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Insert: 'Insert', Delete: 'Delete', Home: 'Home', End: 'End', PageUp: 'Page Up', PageDown: 'Page Down' };
export function tusAdi(t) {
  if (!t) return '—';
  if (AD[t]) return AD[t];
  if (t.startsWith('Key')) { const h = t.slice(3); return h === 'I' ? 'I' : h; }
  if (t.startsWith('Digit')) return t.slice(5);
  if (t.startsWith('Numpad')) return 'Num ' + t.slice(6).replace('Add', '+').replace('Subtract', '−').replace('Multiply', '×').replace('Divide', '÷').replace('Decimal', ',').replace('Enter', 'Enter');
  return t;
}
