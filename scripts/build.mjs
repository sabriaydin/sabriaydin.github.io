#!/usr/bin/env node
// Yazı dosyalarından site bilgilerini üretir. Bağımlılık gerektirmez (yalnızca Node.js).
//
//   node scripts/build.mjs
//       posts/index.js (yazı listesi) dosyasını yazı dosyalarından yeniden üretir.
//
//   node scripts/build.mjs --deploy _site --base https://kullanici.github.io/depo
//       Yayına hazır klasörü üretir: yazı listesi, sitemap.xml, feed.xml, robots.txt ve
//       paylaşım etiketleri dahil. GitHub Actions bunu her güncellemede kendisi çalıştırır.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const Frame = require(path.join(ROOT, 'assets/js/frame.js'));

const args = process.argv.slice(2);
const arg = n => { const i = args.indexOf(n); return i > -1 ? args[i + 1] : ''; };
const deployDir = arg('--deploy');
const BASE = (arg('--base') || '').replace(/\/+$/, '');

const warn = m => console.log(`::warning::${m}`);
const read = p => fs.readFileSync(p, 'utf8');
const decode = s => s.replace(/&quot;/g, '"').replace(/&#0?39;|&#x27;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const xml = Frame.esc;

// Site ayarları (assets/js/site.js)
const sandbox = { window: {} };
vm.runInNewContext(read(path.join(ROOT, 'assets/js/site.js')), sandbox);
const SITE = sandbox.window.SITE || {};
const C = SITE.categories || {};

// Yazıları oku: her yazının bilgisi kendi .html dosyasının üst kısmında durur
const POSTS_DIR = path.join(ROOT, 'posts');
const metaTag = (html, name) => {
  const m = html.match(new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"`, 'i'));
  return m ? decode(m[1]).trim() : '';
};

const posts = [];
const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.html') && !f.startsWith('_')).sort();
for (const f of files) {
  const id = f.slice(0, -5);
  const html = read(path.join(POSTS_DIR, f));
  const t = html.match(/<title>([\s\S]*?)<\/title>/);
  let title = t ? decode(t[1]).trim() : '';
  if (SITE.name) title = title.replace(new RegExp(`\\s*\\|\\s*${escapeRe(SITE.name)}\\s*$`), '').trim();
  const desc = metaTag(html, 'description');
  const cat = metaTag(html, 'kategori');
  // tarih: YIL-AY-GÜN, istenirse yanına saat: 2026-10-13 14:30 (aynı gün birden fazla yazıda sıralama için)
  const tarih = metaTag(html, 'tarih').match(/^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}))?$/);
  const date = tarih ? tarih[1] : '', time = tarih && tarih[2] || '';

  const problems = [];
  if (!/^[a-z0-9-]+$/.test(id)) problems.push('dosya adı yalnızca küçük harf, rakam ve tire içermeli');
  if (!title || title === 'Yazının başlığı') problems.push('başlık (title) yazılmamış');
  if (!desc) problems.push('özet (description) yazılmamış');
  if (!C[cat]) problems.push(`kategori "${cat}" assets/js/site.js içinde tanımlı değil`);
  if (!date || isNaN(new Date(date + 'T12:00:00'))) problems.push('tarih YIL-AY-GÜN biçiminde olmalı (örn. 2026-10-13 veya 2026-10-13 14:30)');
  if (problems.length) { warn(`posts/${f} listeye eklenmedi: ${problems.join('; ')}`); continue; }

  const b = html.match(/<div class="body">([\s\S]*?)<\/div>\s*<\/article>/);
  const text = b ? decode(b[1].replace(/<!--px-->[\s\S]*?<!--\/px-->/g, ' ').replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')) : '';
  posts.push({ id, title, cat, date, time, pin: ['kategori', 'ana', 'hepsi'].includes(metaTag(html, 'sabit')) ? metaTag(html, 'sabit') : '', excerpt: desc });
}
// En yeni yazı üstte: önce tarih ve saat, aynı anda yazılanlarda dosya adı (büyük numara önce)
const key = p => p.date + ' ' + (p.time || '23:59');
posts.sort((a, b) => key(b).localeCompare(key(a)) || b.id.localeCompare(a.id));

const q = s => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
const manifest = `// YAZI LİSTESİ: bu dosya otomatik üretilir, elle düzenleme.
// Yazı eklemek veya silmek için posts klasöründeki .html dosyalarını değiştirmen yeterli.
window.POSTS = [
${posts.map(p => `  { id: ${q(p.id)}, title: ${q(p.title)}, cat: ${q(p.cat)}, date: ${q(p.date)},${p.time ? ` time: ${q(p.time)},` : ''}${p.pin ? ` pin: ${q(p.pin)},` : ''} excerpt: ${q(p.excerpt)} }`).join(',\n')}
];
`;

if (!deployDir) {
  fs.writeFileSync(path.join(POSTS_DIR, 'index.js'), manifest);
  console.log(`${posts.length} yazı bulundu, posts/index.js yazıldı.`);
  process.exit(0);
}

// ---- Yayın klasörü ----
const OUT = path.resolve(deployDir);
const outTop = path.relative(ROOT, OUT).split(path.sep)[0];
fs.rmSync(OUT, { recursive: true, force: true });
// Yayın klasörü kök klasörün içinde olabilir (_site); fs.cpSync bunu "kendi alt klasörüne kopyalama" diye reddeder, bu yüzden elle kopyalanır
const keep = src => {
  const rel = path.relative(ROOT, src);
  if (!rel) return true;
  const top = rel.split(path.sep)[0];
  if (['.git', '.github', 'scripts', 'node_modules'].includes(top) || top === outTop) return false;
  if (rel === 'README.md') return false;
  // Adı _ ile başlayan yazılar taslak sayılır, yayınlanmaz
  if (path.dirname(rel) === 'posts' && path.basename(rel).startsWith('_')) return false;
  return true;
};
const copyTree = (from, to) => {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (!keep(a)) continue;
    if (e.isDirectory()) copyTree(a, b); else fs.copyFileSync(a, b);
  }
};
copyTree(ROOT, OUT);
fs.writeFileSync(path.join(OUT, 'posts', 'index.js'), manifest);
if (!BASE) warn('--base verilmedi: sitemap.xml, feed.xml, canonical bağlantılar ve paylaşım görseli üretilmedi.');

// Her yazıya arama motoru ve paylaşım etiketleri ile üst bölümü ekle
for (const p of posts) {
  const file = path.join(OUT, 'posts', p.id + '.html');
  let html = read(file);
  const url = BASE ? `${BASE}/posts/${p.id}.html` : '';
  html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${xml(p.title)} | ${xml(SITE.name)}</title>`);
  if (!/property="og:title"/.test(html)) {
    const ld = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.excerpt, datePublished: p.date, articleSection: C[p.cat], inLanguage: 'tr', author: { '@type': 'Person', name: SITE.name } };
    const tags = [
      '<meta property="og:type" content="article">',
      `<meta property="og:site_name" content="${xml(SITE.name)}">`,
      '<meta property="og:locale" content="tr_TR">',
      `<meta property="og:title" content="${xml(p.title)}">`,
      `<meta property="og:description" content="${xml(p.excerpt)}">`,
      `<meta property="article:published_time" content="${p.date}">`,
      `<meta property="article:section" content="${xml(C[p.cat])}">`
    ];
    if (BASE) {
      tags.push(`<link rel="canonical" href="${url}">`, `<meta property="og:url" content="${url}">`, `<meta property="og:image" content="${BASE}/assets/img/og.png">`, '<meta name="twitter:card" content="summary_large_image">');
      Object.assign(ld, { url, image: `${BASE}/assets/img/og.png`, mainEntityOfPage: url });
    } else tags.push('<meta name="twitter:card" content="summary">');
    tags.push(`<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`);
    html = html.replace('</head>', () => tags.join('\n') + '\n</head>');
  }
  // Yazıda zaten h1 yoksa (script içindeki metinler sayılmaz) üst bölümü ekle
  if (!/<h1[\s>]/.test(html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ''))) html = html.replace('<article class="post">', () => '<article class="post">\n' + Frame.frame(p, C, '../'));
  fs.writeFileSync(file, html);
}

if (BASE) {
  // Ana sayfa: canonical, paylaşım görseli, RSS bağlantısı
  const file = path.join(OUT, 'index.html');
  let html = read(file);
  html = html.replace('<meta name="twitter:card" content="summary">', () => '<meta name="twitter:card" content="summary_large_image">');
  html = html.replace('</head>', () => [
    `<link rel="canonical" href="${BASE}/">`,
    `<meta property="og:url" content="${BASE}/">`,
    `<meta property="og:image" content="${BASE}/assets/img/og.png">`,
    `<link rel="alternate" type="application/rss+xml" title="${xml(SITE.name)}" href="${BASE}/feed.xml">`
  ].join('\n') + '\n</head>');
  fs.writeFileSync(file, html);

  // Bağımsız sayfalar (araç, oyun, hakkında): canonical ve paylaşım görseli ekle, site haritasına kat
  const EXTRA = ['hakkinda.html', 'araclar/html-editor/', 'projeler/oyunlar/hunger/', 'projeler/programlar/parola-defteri/'];
  for (const e of EXTRA) {
    const f = path.join(OUT, e.endsWith('/') ? e + 'index.html' : e);
    if (!fs.existsSync(f)) continue;
    let h = read(f);
    if (!/rel="canonical"/.test(h)) h = h.replace('</head>', () => [`<link rel="canonical" href="${BASE}/${e}">`, `<meta property="og:url" content="${BASE}/${e}">`, `<meta property="og:image" content="${BASE}/assets/img/og.png">`, '<meta name="twitter:card" content="summary_large_image">'].join('\n') + '\n</head>');
    fs.writeFileSync(f, h);
  }
  const urls = [{ loc: `${BASE}/`, lastmod: posts[0] && posts[0].date }, ...EXTRA.filter(e => fs.existsSync(path.join(OUT, e.endsWith('/') ? e + 'index.html' : e))).map(e => ({ loc: `${BASE}/${e}` })), ...posts.map(p => ({ loc: `${BASE}/posts/${p.id}.html`, lastmod: p.date }))];
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${xml(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`);

  const rfc = d => new Date(d + 'T12:00:00Z').toUTCString();
  fs.writeFileSync(path.join(OUT, 'feed.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${xml(SITE.name)}</title>
  <link>${BASE}/</link>
  <description>${xml(SITE.description || '')}</description>
  <language>tr</language>
  <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml"/>
${posts.slice(0, 20).map(p => `  <item>
    <title>${xml(p.title)}</title>
    <link>${BASE}/posts/${p.id}.html</link>
    <guid isPermaLink="true">${BASE}/posts/${p.id}.html</guid>
    <pubDate>${rfc(p.date)}</pubDate>
    <category>${xml(C[p.cat])}</category>
    <description>${xml(p.excerpt)}</description>
  </item>`).join('\n')}
</channel>
</rss>
`);

  fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`);
}

console.log(`${posts.length} yazı yayın klasörüne işlendi: ${path.relative(process.cwd(), OUT) || OUT}`);
