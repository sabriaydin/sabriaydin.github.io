/* HungerMan - pusula ve haritalarda kullanılan vektör simgeler (yazı tipine bağlı değildir, her boyutta nettir) */

export const IKON_RENK = { koy: '#9be38b', liman: '#6fd3ff', tekne: '#e8d6a8', gorev: '#ffd34e', dogum: '#8fd0ff', olum: '#ff6a5c', oyuncu: '#ffffff', yer: '#ffb84d' };

/* tur: koy, liman, tekne, gorev, dogum, olum, oyuncu, yer; s: simge yarıçapı (piksel) */
export function ikon(ctx, tur, x, y, s, renk = IKON_RENK[tur] || '#fff', alfa = 1) {
  ctx.save();
  ctx.globalAlpha = alfa;
  ctx.translate(x, y);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const yol = () => {
    ctx.beginPath();
    if (tur === 'koy') {
      ctx.moveTo(-s * 0.8, -s * 0.05); ctx.lineTo(0, -s * 0.9); ctx.lineTo(s * 0.8, -s * 0.05);
      ctx.lineTo(s * 0.6, -s * 0.05); ctx.lineTo(s * 0.6, s * 0.8); ctx.lineTo(-s * 0.6, s * 0.8); ctx.lineTo(-s * 0.6, -s * 0.05); ctx.closePath();
    } else if (tur === 'tekne') {
      ctx.moveTo(-s * 0.95, s * 0.25); ctx.lineTo(s * 0.95, s * 0.25); ctx.lineTo(s * 0.55, s * 0.8); ctx.lineTo(-s * 0.55, s * 0.8); ctx.closePath();
      ctx.moveTo(-s * 0.05, s * 0.1); ctx.lineTo(-s * 0.05, -s * 0.9); ctx.lineTo(s * 0.7, s * 0.1); ctx.closePath();
    } else if (tur === 'gorev') {
      ctx.moveTo(0, -s); ctx.lineTo(s * 0.8, 0); ctx.lineTo(0, s); ctx.lineTo(-s * 0.8, 0); ctx.closePath();
    } else if (tur === 'dogum') {
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? s * 0.45 : s; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      ctx.closePath();
    } else if (tur === 'oyuncu') {
      ctx.arc(0, 0, s * 0.62, 0, Math.PI * 2);
    } else if (tur === 'yer') {
      ctx.moveTo(0, s); ctx.bezierCurveTo(-s * 0.15, s * 0.45, -s * 0.75, s * 0.1, -s * 0.75, -s * 0.3);
      ctx.arc(0, -s * 0.3, s * 0.75, Math.PI, 0); ctx.bezierCurveTo(s * 0.75, s * 0.1, s * 0.15, s * 0.45, 0, s); ctx.closePath();
    } else {
      ctx.arc(0, 0, s * 0.6, 0, Math.PI * 2);
    }
  };
  if (tur === 'olum') {
    ctx.beginPath(); ctx.moveTo(-s * 0.6, -s * 0.6); ctx.lineTo(s * 0.6, s * 0.6); ctx.moveTo(s * 0.6, -s * 0.6); ctx.lineTo(-s * 0.6, s * 0.6);
    ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = s * 0.62; ctx.stroke();
    ctx.strokeStyle = renk; ctx.lineWidth = s * 0.32; ctx.stroke();
  } else if (tur === 'liman') {
    const cizA = () => {
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.55); ctx.lineTo(0, s * 0.8);
      ctx.moveTo(-s * 0.45, -s * 0.2); ctx.lineTo(s * 0.45, -s * 0.2);
      ctx.moveTo(-s * 0.75, s * 0.2); ctx.quadraticCurveTo(-s * 0.6, s * 0.85, 0, s * 0.85); ctx.quadraticCurveTo(s * 0.6, s * 0.85, s * 0.75, s * 0.2);
      ctx.moveTo(s * 0.24, -s * 0.78); ctx.arc(0, -s * 0.78, s * 0.24, 0, Math.PI * 2);
    };
    cizA(); ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = s * 0.5; ctx.stroke();
    cizA(); ctx.strokeStyle = renk; ctx.lineWidth = s * 0.24; ctx.stroke();
  } else {
    yol();
    ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = Math.max(1.5, s * 0.36); ctx.stroke();
    ctx.fillStyle = renk; ctx.fill();
    if (tur === 'oyuncu') { ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = Math.max(1, s * 0.16); ctx.stroke(); }
    if (tur === 'yer') { ctx.beginPath(); ctx.arc(0, -s * 0.3, s * 0.28, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill(); }
  }
  ctx.restore();
}

/* Oyuncunun baktığı yönü gösteren ok (yaw: 0 = kuzey) */
export function okIkon(ctx, x, y, s, yaw, renk = '#ffffff') {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-yaw);
  ctx.beginPath();
  ctx.moveTo(0, -s); ctx.lineTo(s * 0.72, s * 0.8); ctx.lineTo(0, s * 0.38); ctx.lineTo(-s * 0.72, s * 0.8); ctx.closePath();
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.lineWidth = Math.max(2, s * 0.4); ctx.stroke();
  ctx.fillStyle = renk; ctx.fill();
  ctx.restore();
}

/* Okunaklı yazı: koyu kenarlı */
export function yazi(ctx, metin, x, y, font, renk = '#fff', hiza = 'center') {
  ctx.font = font; ctx.textAlign = hiza; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = 3;
  ctx.strokeText(metin, x, y);
  ctx.fillStyle = renk; ctx.fillText(metin, x, y);
}
