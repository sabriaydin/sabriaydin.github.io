#!/usr/bin/env node
// Tek seferlik: posts/*.html dosyalarındaki ortak üst/alt bölümleri kalip/ klasöründeki parçalarla değiştirilecek
// işaretlere (<!--kalip:head-->, <!--kalip:ust-->, <!--kalip:alt-->) çevirir. Yayın sırasında build.mjs bunları geri açar.
//   node scripts/sadelestir.mjs          -> dosyaları değiştirir
//   node scripts/sadelestir.mjs --dene   -> yalnızca raporlar
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dene = process.argv.includes('--dene');
const part = n => fs.readFileSync(path.join(ROOT, 'kalip', n), 'utf8').replace(/\{\{kok\}\}/g, '../');
const UST = part('yazi-ust.html'), GUST = part('yazi-govde-ust.html'), ALT = part('yazi-alt.html');
const dir = path.join(ROOT, 'posts');
let n = 0, atla = 0;
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.html'))) {
  const p = path.join(dir, f);
  let s = fs.readFileSync(p, 'utf8');
  if (s.includes('<!--kalip:head-->')) { atla++; continue; }
  // 1) head: ortak satırlar çıkarılır, yazıya özel satırlar (title, description, kategori, tarih, sabit, ek stiller) kalır
  const hs = s.indexOf('<head>') + 6, he = s.indexOf('</head>');
  const common = new Set(UST.split('\n').filter(Boolean));
  const kept = s.slice(hs, he).split('\n').filter(l => l.trim() && !common.has(l));
  s = s.slice(0, hs) + '\n<!--kalip:head-->\n' + kept.join('\n') + '\n' + s.slice(he);
  // 2) gövde başı ve sonu
  if (!s.includes(GUST)) { console.log('ATLANDI (gövde başı farklı):', f); continue; }
  s = s.replace(GUST, '<!--kalip:ust-->\n');
  if (!s.includes(ALT)) { console.log('ATLANDI (gövde sonu farklı):', f); continue; }
  s = s.replace(ALT, '<!--kalip:alt-->\n');
  if (!dene) fs.writeFileSync(p, s);
  n++;
}
console.log(`${n} dosya sadeleştirildi, ${atla} dosya zaten sadeydi.`);
