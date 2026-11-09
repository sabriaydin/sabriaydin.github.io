(()=>{
const S=window.SITE||{name:'Sabri Aydın',about:'',links:[],categories:{}};
const C=S.categories||{};
const {esc,fmt}=window.PostFrame;
// En yeni yazı üstte: önce tarih ve saat, aynı anda yazılanlarda dosya adı (büyük numara önce)
const key=p=>p.date+' '+(p.time||'23:59');
const P=(window.POSTS||[]).slice().sort((a,b)=>key(b).localeCompare(key(a))||b.id.localeCompare(a.id));
const $=(s,e=document)=>e.querySelector(s),q=new URLSearchParams(location.search);
const page=document.body.dataset.page,root=document.body.dataset.root||'';
const home=root+'index.html',url=p=>`${root}posts/${p.id}.html`;
// Arama için: küçük harfe çevir, Türkçe karakterleri ve vurguları yok say (zeka = zekâ, ogrenmek = öğrenmek)
const fold=s=>String(s).toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ı/g,'i');
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;

/* Yazı metinleri (yalnızca http/https üzerinde, arama ilk kullanıldığında yüklenir) */
const full={};let fullState=0;
const loadFull=()=>{if(fullState||!/^https?:/.test(location.protocol))return;fullState=1;
Promise.all(P.map(p=>fetch(url(p)).then(r=>r.ok?r.text():'').then(t=>{const b=new DOMParser().parseFromString(t,'text/html').querySelector('.post .body');if(b)b.querySelectorAll('script,style,.px-hero,.px-toc').forEach(e=>e.remove());full[p.id]=fold(b?b.textContent:'')}).catch(()=>{}))).then(()=>{fullState=2;if(s.value.trim())s.oninput()})};
const find=t=>{t=fold(t.trim());return t?P.filter(p=>(fold(p.title+' '+p.excerpt+' '+(C[p.cat]||''))+' '+(full[p.id]||'')).includes(t)):P};

/* Sabit yazı (yazıdaki <meta name="sabit">): kategori = kategori/grup sayfasında, ana = ana sayfada, hepsi = ikisinde en üstte */
let pinCtx=0;const pinOn=p=>pinCtx&&p.pin&&(p.pin==='hepsi'||p.pin===(pinCtx===2?'kategori':'ana'));
const card=(p,h='h2')=>`<a class="card tilt${p.pin?' pinned':''}" href="${url(p)}"><div class="side"><span class="tag">${esc(C[p.cat]||p.cat)}</span><small><time datetime="${p.date}">${fmt(p.date)}</time></small>${pinOn(p)?'<span class="pin">📌 Sabitlenmiş</span>':''}</div><div class="main"><${h} class="ct">${esc(p.title)}</${h}><p>${esc(p.excerpt)}</p></div></a>`;
const tilt=()=>{if(reduced)return;document.querySelectorAll('.tilt').forEach(el=>{if(el._t)return;el._t=1;const t=el,k=6;t.addEventListener('mousemove',e=>{const r=t.getBoundingClientRect();el.style.setProperty('--ry',((e.clientX-r.left)/r.width-.5)*k+'deg');el.style.setProperty('--rx',-((e.clientY-r.top)/r.height-.5)*k+'deg')});t.addEventListener('mouseleave',()=>{el.style.removeProperty('--rx');el.style.removeProperty('--ry')})})};

/* Header ve footer */
/* Öğe çözümleme: dizge kategori kısa adı, {url,name} bağlantı, {key,...} iç içe grup ya da {name,items:[{name,url}]} bağlantı alt menüsü olabilir */
function pit(it){return typeof it==='string'?(C[it]?it:null):(it&&it.url&&it.name?it:(it&&it.key?fg(it):(it&&it.name&&Array.isArray(it.items)?{name:it.name,links:it.items.filter(l=>l&&l.url&&l.name)}:null)))}
const okIt=it=>it&&(typeof it==='string'||it.url||(it.links?it.links.length:it.items.length));
/* Kategori grupları (site.js > groups): grup başlığı + alt kategoriler/iç içe gruplar; gruba girmeyenler tek başına */
function fg(g){return {...g,items:(g.items||[]).map(pit).filter(okIt)}}
const G=(S.groups||[]).map(fg).filter(g=>g.key&&g.items.length);
/* Ek açılır menüler (site.js > menus): öğe ya bir kategori kısa adı ya da kendi alt kategorileri olan bir grup nesnesidir */
const M=(S.menus||[]).map(m=>m.link?(C[m.link]?{name:m.name,link:m.link,items:[]}:null):({name:m.name,items:(m.items||[]).map(pit).filter(okIt)})).filter(m=>m&&m.name&&(m.link||m.items.length));
/* iç içe gruplar dahil tüm grupları, URL'deki ?grup= parametresi için derinlemesine toplar */
function collectGroups(items){let out=[];(items||[]).forEach(it=>{if(it&&typeof it==='object'&&it.key){out.push(it);out=out.concat(collectGroups(it.items))}});return out}
const AG=G.concat(collectGroups(G.flatMap(g=>g.items))).concat(collectGroups(M.flatMap(m=>m.items)));
/* bir grubun (iç içe gruplar dahil) kapsadığı tüm kategori kısa adlarını düzleştirir */
function leafCats(items){let out=[];(items||[]).forEach(it=>{if(typeof it==='string')out.push(it);else if(it&&it.items)out=out.concat(leafCats(it.items))});return out}
/* bağlantı alt menüsü (site.js > menus > items: { name, items: [{ name, url }] }) */
const lk=it=>`<a href="${/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(it.url)?'':root}${esc(it.url)}"${/^https?:/.test(it.url)?' target="_blank" rel="noopener"':''}>${esc(it.name)}</a>`;
const su=g=>`<div class="sg"><span class="mg" tabindex="0" aria-haspopup="true">${esc(g.name)}<span class="ar" aria-hidden="true">▸</span></span><div class="sm"><div>${g.links.map(l=>lk(l).replace('<a ','<a class="sub" ')).join('')}</div></div></div>`;
const inG=new Set(leafCats(G.flatMap(g=>g.items)).concat(leafCats(M.flatMap(m=>m.items))).concat(M.filter(m=>m.link).map(m=>m.link)));
const ca=k=>`<a href="${home}?cat=${k}">${esc(C[k])}</a>`;
/* grup içindeki bir öğeyi türüne göre çizer: kategori, iç içe grup, doğrudan bağlantı ya da bağlantı alt menüsü */
const ri=it=>typeof it==='string'?ca(it).replace('<a ','<a class="sub" '):it.key?sg(it):it.url?lk(it).replace('<a ','<a class="sub" '):su(it);
function sg(g){return `<div class="sg"><a class="mg" href="${home}?grup=${g.key}" aria-haspopup="true">${esc(g.name)}<span class="ar" aria-hidden="true">▸</span></a><div class="sm"><div>${g.items.map(ri).join('')}</div></div></div>`}
const catHtml=G.map(sg).concat(Object.keys(C).filter(k=>!inG.has(k)).map(ca));
$('#hdr').innerHTML=`<header class="top"><div class="wrap bar"><a class="logo" href="${home}">Sabri <b>Aydın</b></a><nav id="nav" aria-label="Ana menü"><a href="${home}"${page==='home'?' aria-current="page"':''}>Ana Sayfa</a><div class="dd"><button type="button" id="ddb" aria-haspopup="true" aria-expanded="false">Kategoriler ▾</button><div class="menu">${catHtml.join('')}</div></div>${M.map(m=>m.link?`<a href="${home}?cat=${m.link}">${esc(m.name)}</a>`:`<div class="dd"><button type="button" aria-haspopup="true" aria-expanded="false">${esc(m.name)} ▾</button><div class="menu">${m.items.map(it=>typeof it==='string'?ca(it):it.url?`<a href="${/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(it.url)?'':root}${esc(it.url)}"${/^https?:/.test(it.url)?' target="_blank" rel="noopener"':''}>${esc(it.name)}</a>`:it.links?su(it):sg(it)).join('')}</div></div>`).join('')}</nav><div class="search" role="search"><input id="s" type="search" placeholder="Sitede ara" aria-label="Sitede ara" autocomplete="off"><div id="res" hidden></div></div><button type="button" class="ib burger" id="bg" aria-label="Menüyü aç" aria-expanded="false" aria-controls="nav">☰</button></div></header>`;
const links=(S.links||[]).map(l=>`<li><a href="${/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(l.url)?'':root}${l.url}"${/^https?:/.test(l.url)?' target="_blank" rel="noopener"':''}>${l.text}</a></li>`).join('');
$('#ftr').innerHTML=`<footer class="foot"><div class="wrap"><div class="cols"><div><h2>${S.name}</h2><p>${S.about}</p></div><div><h2>Son Yazılar</h2><ul>${P.slice(0,4).map(p=>`<li><a href="${url(p)}">${esc(p.title)}</a></li>`).join('')}</ul></div><div><h2>Bağlantılar</h2><ul>${links}</ul></div></div><p class="copy">© ${new Date().getFullYear()} ${S.name}. Tüm hakları saklıdır.</p></div></footer>`;

/* Menü */
const s=$('#s'),res=$('#res'),app=$('#app'),bg=$('#bg'),nav=$('#nav'),dds=[...document.querySelectorAll('.dd')];
const setDd=(o,d)=>dds.forEach(x=>{const v=!!o&&x===d;x.classList.toggle('open',v);x.querySelector('button').setAttribute('aria-expanded',v)});
dds.forEach(d=>{d.querySelector('button').onclick=()=>setDd(!d.classList.contains('open'),d);d.onmouseleave=()=>d.classList.contains('open')&&setDd(false)});
bg.onclick=()=>{const o=nav.classList.toggle('open');bg.setAttribute('aria-expanded',o);bg.setAttribute('aria-label',o?'Menüyü kapat':'Menüyü aç')};
document.addEventListener('click',e=>{if(!e.target.closest('.dd'))setDd(false);if(!e.target.closest('.search'))res.hidden=true});

/* Arama kutusu: anlık sonuçlar, ok tuşlarıyla gezinme */
let sel=-1;const items=()=>[...res.querySelectorAll('a')];
const mark=()=>items().forEach((a,i)=>a.classList.toggle('sel',i===sel));
s.value=q.get('q')||'';
s.oninput=()=>{loadFull();const v=s.value.trim(),all=v?find(v):[],r=all.slice(0,5);sel=-1;res.innerHTML=r.length?`<div class="rh">${all.length>5?`${all.length} sonuçtan ilk 5'i`:`${all.length} sonuç`}</div>`+r.map(p=>`<a href="${url(p)}"><span class="rt">${esc(p.title)}</span><span class="rc">${esc(C[p.cat]||p.cat)}</span></a>`).join(''):v?'<em>Sonuç bulunamadı</em>':'';res.hidden=!res.innerHTML;window.onSearch&&window.onSearch()};
s.onfocus=loadFull;
s.onkeydown=e=>{const it=items();
if(e.key==='ArrowDown'&&it.length){e.preventDefault();sel=(sel+1)%it.length;mark()}
else if(e.key==='ArrowUp'&&it.length){e.preventDefault();sel=(sel-1+it.length)%it.length;mark()}
else if(e.key==='Enter'){if(sel>=0&&it[sel])location.href=it[sel].href;else if(page!=='home')location.href=home+'?q='+encodeURIComponent(s.value)}};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){res.hidden=true;sel=-1;setDd(false)}});

/* Ana sayfa */
if(page==='home'){
app.innerHTML=`<div class="wrap pg"><h1 class="sr">${S.name}: ${esc(S.description||'')}</h1><p class="status" id="cnt" hidden><span id="cntt"></span><a href="${home}">Tüm yazılara dön</a></p><div class="grid list" id="list"></div><nav class="pager" id="pager" aria-label="Sayfalama" hidden></nav><p class="sr" id="pgs" aria-live="polite"></p></div>`;
const PER=7; // sayfa başına yazı sayısı
const gk=v=>AG.some(g=>g.key===v)?v:'';
let tot=1,cat=C[q.get('cat')]?q.get('cat'):'',grp=cat?'':gk(q.get('grup')),pg=Math.max(1,parseInt(q.get('sayfa'),10)||1),last=s.value.trim();
const qs=n=>{const u=new URLSearchParams(),t=s.value.trim();if(cat)u.set('cat',cat);else if(grp)u.set('grup',grp);if(t)u.set('q',t);if(n>1)u.set('sayfa',n);return u.toString()};
const href=n=>home+(qs(n)?'?'+qs(n):'');
// Sayfa numaraları: az sayfada hepsi, çoksa 1 … önceki bu sonraki … son
const nums=(n,c)=>{let a=[];if(n<=9)for(let i=1;i<=n;i++)a.push(i);else if(c<=4)a=[1,2,3,4,5,n];else if(c>=n-3)a=[1,n-4,n-3,n-2,n-1,n];else a=[1,c-1,c,c+1,n];const o=[];a.forEach((v,i)=>{if(i&&v-a[i-1]>1)o.push(0);o.push(v)});return o};
const pb=(n,t,rel,off)=>off?`<span class="pgb off" aria-hidden="true">${t}</span>`:`<a class="pgb" rel="${rel}" href="${href(n)}" data-p="${n}">${t}</a>`;
const pager=(n,c)=>`${pb(c-1,'‹ Önceki','prev',c<=1)}<ul>${nums(n,c).map(v=>v?`<li><a class="pgn" href="${href(v)}" data-p="${v}" aria-label="Sayfa ${v}"${v===c?' aria-current="page"':''}>${v}</a></li>`:'<li><button type="button" class="gap" data-gap aria-label="Sayfa numarası yaz ve git">…</button></li>').join('')}</ul>${pb(c+1,'Sonraki ›','next',c>=n)}`;
const draw=()=>{window.lxMount&&lxMount(cat,grp);const term=s.value.trim(),gi=grp?AG.find(g=>g.key===grp):null,f=!!(term||cat||gi);let r=find(term).filter(p=>cat?p.cat===cat:gi?leafCats(gi.items).includes(p.cat):true).filter(p=>!window.LXF||LXF.pass(p));pinCtx=term?0:(cat||gi?2:1);if(pinCtx)r=r.filter(pinOn).concat(r.filter(p=>!pinOn(p)));
if(term!==last){pg=1;last=term}
const n=Math.max(1,Math.ceil(r.length/PER));pg=Math.min(pg,n);tot=n;
$('#cnt').hidden=!f;$('#cntt').textContent=[cat&&C[cat]+' kategorisi',gi&&gi.name+' kategorisi',term&&'“'+term+'” araması'].filter(Boolean).join(' ve ')+': '+r.length+' yazı';
$('#list').innerHTML=r.length?r.slice((pg-1)*PER,pg*PER).map(p=>card(p)).join(''):`<p class="mu">${term?'Eşleşen yazı yok. Başka bir kelime dene.':(window.LXF&&LXF.active?'Seçtiğin ölçütlere uyan dağıtım yok. Ölçütleri gevşetmeyi dene.':'Bu kategoride henüz yazı yok.')}</p>`;
const pn=$('#pager');pn.hidden=n<2;pn.innerHTML=n>1?pager(n,pg):'';$('#pgs').textContent=n>1?`Sayfa ${pg} / ${n}`:'';
/* Adres çubuğunu güncel tut (yenileyince ve geri düğmesinde aynı sayfa gelsin); dosya olarak açıldığında tarayıcı izin vermez, sorun değil */
try{const w=qs(pg);if(w!==location.search.slice(1))history.replaceState(null,'',location.pathname+(w?'?'+w:''))}catch(e){}
tilt()};
const go=p=>{pg=p;
try{const w=qs(pg);history.pushState(null,'',location.pathname+(w?'?'+w:''))}catch(x){location.href=href(pg);return}
draw();$('#list').scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'})};
$('#pager').addEventListener('click',e=>{
/* ... düğmesi: yerine sayfa numarası kutusu açılır, Enter ile o sayfaya gidilir */
const g=e.target.closest('button[data-gap]');
if(g){const li=g.parentNode;li.innerHTML=`<input class="pgi" type="number" inputmode="numeric" min="1" max="${tot}" placeholder="1-${tot}" aria-label="Gidilecek sayfa (1-${tot})">`;const i=li.firstChild;i.focus();
i.onkeydown=ev=>{if(ev.key==='Enter'){ev.preventDefault();const v=parseInt(i.value,10);go(v>=1?Math.min(v,tot):pg)}else if(ev.key==='Escape'){ev.stopPropagation();$('#pager').innerHTML=pager(tot,pg)}};
i.onblur=()=>setTimeout(()=>{if(i.isConnected)$('#pager').innerHTML=pager(tot,pg)},0);return}
const a=e.target.closest('a[data-p]');if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button)return;e.preventDefault();go(+a.dataset.p)});
addEventListener('popstate',()=>{const u=new URLSearchParams(location.search);cat=C[u.get('cat')]?u.get('cat'):'';grp=cat?'':gk(u.get('grup'));s.value=u.get('q')||'';last=s.value.trim();pg=Math.max(1,parseInt(u.get('sayfa'),10)||1);draw()});
window.onSearch=draw;window.lxRedraw=()=>{pg=1;draw()};draw()}

/* Yazı sayfası: yazı metni HTML içinde hazır gelir; burada üst bölüm (yayınlanmış sitede zaten hazırdır) ve ek bölümler eklenir */
if(page==='post'){
const art=$('article.post');
/* Üst bölüm yoksa (ör. dosya bilgisayarda açıldıysa) sayfanın üstündeki bilgilerden oluştur */
if(!$('h1',art)){
const mt=n=>{const e=document.querySelector(`meta[name="${n}"]`);return e?e.content.trim():''};
const suf=' | '+S.name;let title=document.title;if(title.endsWith(suf))title=title.slice(0,-suf.length);
const body=$('.body',art),m={title,cat:mt('kategori'),date:mt('tarih').slice(0,10)};
if(m.title&&m.cat&&/^\d{4}-\d{2}-\d{2}$/.test(m.date)){art.insertAdjacentHTML('afterbegin',PostFrame.frame(m,C,root));document.title=m.title+suf}}
const id=decodeURIComponent(location.pathname.split('/').filter(Boolean).pop()||'').replace(/\.html$/,'');
const i=P.findIndex(x=>x.id===id);
const meta=$('.meta',art);
if(meta){const cp=document.createElement('button');cp.type='button';cp.className='copy-link';cp.textContent='Bağlantıyı kopyala';
cp.onclick=async()=>{const u=location.href.split('#')[0];let ok=false;
try{await navigator.clipboard.writeText(u);ok=true}catch(e){const t=document.createElement('textarea');t.value=u;t.style.cssText='position:fixed;opacity:0';document.body.appendChild(t);t.select();try{ok=document.execCommand('copy')}catch(e2){}t.remove()}
cp.textContent=ok?'Kopyalandı ✓':'Kopyalanamadı';setTimeout(()=>cp.textContent='Bağlantıyı kopyala',1800)};
meta.appendChild(cp)}
/* Kategoriye özel şablon */
{const ct=(document.querySelector('meta[name="kategori"]')||{}).content||'';if(window.Sablon&&Sablon.has(ct))Sablon.apply(art,ct,{desc:(document.querySelector('meta[name="description"]')||{}).content||'',catName:C[ct]||ct})}
/* Şık yazı görünümü: dosyasına işlenmemiş (yeni) yazılarda aynı görünümü çalışırken ekler */
{const bd=$('.body',art);if(bd&&!art.dataset.tpl&&!$('.px-hero,.wx-hero,.px-toc',bd)){
if(!document.querySelector('link[href$="yazi.css"]')){const l=document.createElement('link');l.rel='stylesheet';l.href=root+'assets/css/yazi.css';document.head.appendChild(l)}
const PAL={windows:['#0067c0','#00a4ef'],windowsos:['#1f4e8c','#3d8bd9'],html:['#e44d26','#f0a04b'],htmlaraclari:['#c0392b','#ff7e5f'],linuxos:['#e95420','#f39c12'],linuxgelismis:['#8e3a12','#d9822b'],batch:['#1e8449','#58d68d'],batchornek:['#0e6655','#1abc9c'],sistemaraclari:['#5b3fa0','#9b6bd9'],medya:['#c2185b','#ff6f91'],ofis:['#1565c0','#42a5f5'],guvenlik:['#b71c1c','#ef5350'],gelistirici:['#283593','#7986cb'],eklentiler:['#00838f','#4dd0e1'],araclar:['#6d4c41','#bcaaa4']};
const cat=(document.querySelector('meta[name="kategori"]')||{}).content||'',pc=PAL[cat]||['#b72a25','#ec6a63'];
bd.style.setProperty('--a',pc[0]);bd.style.setProperty('--b',pc[1]);
const hs=[...bd.querySelectorAll('h2')];hs.forEach((h,k)=>{if(!h.id)h.id='b'+(k+1);if(/indir/i.test(h.textContent)){const n=h.nextElementSibling;if(n&&n.tagName==='P'&&n.querySelector('a[href^="http"]'))n.classList.add('px-dl')}});
const ds=(document.querySelector('meta[name="description"]')||{}).content||'',mt0=$('.meta',art);
const toc=hs.length>2?`<nav class="px-toc" aria-label="İçindekiler"><b>İçindekiler</b><ol>${hs.map(h=>`<li><a href="#${h.id}">${esc(h.textContent)}</a></li>`).join('')}</ol></nav>`:'';
bd.insertAdjacentHTML('afterbegin',`<div class="px-hero"><small>${esc(C[cat]||cat)}</small><p>${esc(ds)}</p></div>${toc}`)}}
if(i>-1){
/* Önceki / sonraki: ana sayfadaki liste sırasına göre */
const prev=P[i-1],next=P[i+1];
const pn=(p,l,c)=>p?`<a class="pn-item ${c}" href="${url(p)}"><small>${l}</small><b>${esc(p.title)}</b></a>`:'<span></span>';
let h='';
if(prev||next)h+=`<nav class="wrap pn" aria-label="Yazılar arası gezinme"><div class="pn-grid">${pn(prev,'‹ Önceki yazı','l')}${pn(next,'Sonraki yazı ›','r')}</div></nav>`;
/* İlgili yazılar: aynı kategoride, listede yakın olanlar */
const rel=P.map((x,j)=>({x,d:Math.abs(j-i)})).filter(o=>o.x.cat===P[i].cat&&o.x.id!==id&&o.x!==prev&&o.x!==next).sort((a,b)=>a.d-b.d).slice(0,2).map(o=>o.x);
if(rel.length)h+=`<section class="wrap rel"><h2>Bunlar da ilgini çekebilir</h2><div class="grid">${rel.map(p=>card(p,'h3')).join('')}</div></section>`;
app.insertAdjacentHTML('beforeend',h)}
/* Yana kaydırılabilen kod blokları klavyeyle de kaydırılabilsin */
const prePin=()=>art.querySelectorAll('pre,table').forEach(e=>{e.scrollWidth>e.clientWidth?e.tabIndex=0:e.removeAttribute('tabindex')});prePin();addEventListener('resize',prePin);
/* Her kod bloğuna (<pre>) şık bir "Kopyala" düğmesi ekle */
art.querySelectorAll('.body>pre,.body>section>pre').forEach(pre=>{
  if(pre.querySelector('.code-copy'))return;
  const btn=document.createElement('button');btn.type='button';btn.className='code-copy';btn.setAttribute('aria-label','Kodu kopyala');
  const icoCopy='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>';
  const icoOk='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6"/></svg>';
  btn.innerHTML=icoCopy+'<span>Kopyala</span>';
  btn.onclick=async()=>{
    const txt=pre.textContent;let ok=false;
    try{await navigator.clipboard.writeText(txt);ok=true}catch(e){const t=document.createElement('textarea');t.value=txt;t.style.cssText='position:fixed;opacity:0';document.body.appendChild(t);t.select();try{ok=document.execCommand('copy')}catch(e2){}t.remove()}
    btn.classList.toggle('ok',ok);btn.innerHTML=(ok?icoOk:icoCopy)+`<span>${ok?'Kopyalandı':'Kopyalanamadı'}</span>`;
    setTimeout(()=>{btn.classList.remove('ok');btn.innerHTML=icoCopy+'<span>Kopyala</span>'},1800)
  };
  pre.appendChild(btn)
});
/* Okuma ilerleme çubuğu */
const pr=document.createElement('div');pr.className='progress';pr.setAttribute('aria-hidden','true');document.body.prepend(pr);
window.updateProgress=()=>{const r=art.getBoundingClientRect(),t=r.height-innerHeight*.5;pr.style.transform=`scaleX(${Math.max(0,Math.min(1,-r.top/(t>0?t:1)))})`};
updateProgress()}

/* Yukarı çık düğmesi + kaydırma */
const tt=document.createElement('button');tt.type='button';tt.className='totop';tt.setAttribute('aria-label','Yukarı çık');tt.textContent='↑';
tt.onclick=()=>scrollTo({top:0,behavior:reduced?'auto':'smooth'});document.body.appendChild(tt);
let tick=false;addEventListener('scroll',()=>{if(tick)return;tick=true;requestAnimationFrame(()=>{tick=false;tt.classList.toggle('on',scrollY>=400);window.updateProgress&&updateProgress()})},{passive:true});

/* Harici bağlantılar: önce yönlendirme sayfasına git (uyarı + adres + 10 sn geri sayım) */
document.addEventListener('click',e=>{
  if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  const a=e.target.closest&&e.target.closest('a[href]');if(!a||a.hasAttribute('download')||a.hasAttribute('data-direct'))return;
  let u;try{u=new URL(a.href)}catch(x){return}
  if(!/^https?:$/.test(u.protocol)||u.origin===location.origin||page==='redirect')return;
  e.preventDefault();
  const dest=root+'yonlendir.html?u='+encodeURIComponent(u.href);
  if(a.target==='_blank')window.open(dest,'_blank','noopener');else location.href=dest;
});

tilt();
})();
