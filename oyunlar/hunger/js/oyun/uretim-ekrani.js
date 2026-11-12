/* Hunger 3D - Envanter ve Üretim ekranları ayrıdır; Üretim ekranı gelişmiş tarif listesi sunar.
   Envanter: I / Tab, Üretim: C (Ayarlar › Kontrol'den değiştirilebilir). Panel açıkken diğer tuşa basmak ekranı değiştirir, aynı tuş kapatır.
   Üretim ekranı: yakındaki istasyon göstergesi, çantadaki malzemeler, kategori sayaçları, arama, sıralama (yapılabilirler önce),
   sık kullanılan tarifler (yıldız), malzeme sayıları (var/gerekli, eksik miktar), istasyon durumu, "×5" ve "Maks" üretim düğmeleri.
   Özgün dosyalara yalnızca küçük kancalar eklenmiştir (arayuz.js togglePanel, giris.js tuşlar, index.html). */
(()=>{
'use strict';
const {O,RC,IT,ICON,G,ui,count}=HG;
const $=HG.$;
const KEY='hunger-uretim';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let mode='inv',pref={fav:[],sort:'can'};
try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&typeof s==='object'){if(Array.isArray(s.fav))pref.fav=s.fav.filter(x=>typeof x==='string').slice(0,200);if(s.sort==='list'||s.sort==='can')pref.sort=s.sort}}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(pref))}catch(e){}};
const rkey=r=>r[0]+'|'+Object.keys(r[2]).sort().map(k=>k+r[2][k]).join(',')+'|'+(r[3]||'');
const isFav=r=>pref.fav.includes(rkey(r));
const STC={fire:O.FIRE,bench:O.BENCH,furn:O.FURN};
const nearSt=k=>HG.nearObj(STC[k],3.6);
const catOf=id=>{const it=IT[id];return it.food?'food':it.tool?'tool':it.place!==undefined?'build':'other'};
const maxMake=r=>{let n=Infinity;for(const k in r[2])n=Math.min(n,Math.floor(count(k)/r[2][k]));return n===Infinity?99:n};

/* ---------------- Ekran kipi ---------------- */
function setMode(m){
 mode=m==='craft'?'craft':'inv';ui.pmode=mode;
 const pb=$('#pbox');if(!pb)return;
 pb.classList.toggle('m-inv',mode==='inv');pb.classList.toggle('m-craft',mode==='craft');
 for(const b of document.querySelectorAll('#ptabs button')){const on=b.dataset.m===mode;b.classList.toggle('on',on);b.setAttribute('aria-selected',on?'true':'false')}
 ui.picked=null;ui.dirty=true;
 if(mode==='craft'){cache='';render()}
 labelTabs();
}
function labelTabs(){
 for(const [id,act,txt] of [['#tInv','inv','Envanter'],['#tCrf','craft','Üretim']]){
  const b=$(id);if(!b)continue;
  const k=HG.bind&&HG.bind[act]&&HG.bind[act][0];
  const lab=k&&HG.keyLabel?HG.keyLabel(k):'';
  const h=txt+(lab&&lab!=='—'?' <kbd>'+esc(lab)+'</kbd>':'');
  if(b.dataset.h!==h){b.dataset.h=h;b.innerHTML=h}
 }
}
{
 const t0=HG.togglePanel;
 HG.togglePanel=function(force,m){
  const p=$('#panel');
  if(!p)return t0.apply(this,arguments);
  if(ui.state!=='play'&&force!==false)return t0.apply(this,arguments);
  /* tuşla çağrı: panel açıkken başka ekrana geç, aynı ekransa kapat */
  if(force===undefined&&m&&!p.hidden&&ui.pmode!==m){HG.snd('ui');setMode(m);return}
  const wasOpen=!p.hidden;
  const r=t0.call(this,force);
  if(!p.hidden&&!wasOpen)setMode(m||'inv');
  return r;
 };
 HG.panelMode=setMode;
}

/* ---------------- Üretim ekranı ---------------- */
let cache='',filterCat='all';
function chipCounts(){
 const c={all:RC.length,can:0,food:0,tool:0,build:0,other:0};
 RC.forEach(r=>{if(HG.canCraft(r)===1)c.can++;c[catOf(r[0])]++});
 return c;
}
function header(){
 const el=$('#crfSt');if(!el)return '';
 let h='<div class="cs-row"><span class="cs-t">İstasyonlar</span>';
 for(const k of Object.keys(HG.STN)){const n=nearSt(k);h+=`<span class="cs ${n?'ok':'no'}" title="${n?'Yakınında':'Yakınında değil: 3-4 m içine girin'}">${n?'✓':'✗'} ${esc(HG.STN[k])}</span>`}
 h+='</div>';
 const mats=new Map();
 for(const r of RC)for(const k in r[2])if(!mats.has(k)){const n=count(k);if(n>0)mats.set(k,n)}
 h+='<div class="cs-row"><span class="cs-t">Malzemeler</span>';
 if(mats.size){for(const [k,n] of mats)h+=`<span class="cm" title="${esc(IT[k].n)}"><img src="${ICON[k]}" alt="">${n}</span>`}
 else h+='<span class="cs-no">Çantada tarif malzemesi yok.</span>';
 h+='</div>';
 return h;
}
function card(r,i){
 const st=HG.canCraft(r),it=IT[r[0]],fav=isFav(r),mk=st===1?maxMake(r):0;
 let ing='';
 for(const k in r[2]){
  const have=count(k),need=r[2][k],ok=have>=need;
  ing+=`<span class="ig ${ok?'ok':'no'}" title="${esc(IT[k].n)}"><img src="${ICON[k]}" alt="">${esc(IT[k].n)} ${have}/${need}${ok?'':' <em>−'+(need-have)+'</em>'}</span>`;
 }
 if(!ing)ing='<span class="ig ok">Malzeme gerekmez</span>';
 const stn=r[3]?`<span class="stn ${st===-1?'no':'ok'}">${st===-1?'✗':'✓'} ${esc(HG.STN[r[3]])} ${st===-1?'yakınında değil':'yakınında'}</span>`:'';
 const own=count(r[0]);
 const btn=`<button type="button" data-r="${i}"${st===1?'':' disabled'}>Üret</button>`+
  (mk>=5?`<button type="button" class="ghost" data-rq="${i}:5" title="5 kez üret (Shift + Üret ile de)">×5</button>`:'')+
  (mk>=2?`<button type="button" class="ghost" data-rq="${i}:max" title="Elinizdeki malzemeyle yapılabilecek en çok sayıda üret (Ctrl + Üret ile de)">Maks ${mk}</button>`:'');
 return `<div class="rc${st===-1?' lock':''}${st===1?' can':''}${fav?' fav':''}"><img src="${ICON[r[0]]}" alt=""><div class="rb"><b>${esc(it.n)}${r[1]>1?' ×'+r[1]:''}${own?` <small>Çantada: ${own}</small>`:''}</b><div class="ing">${ing}</div>${stn?`<div>${stn}</div>`:''}${it.d?`<span class="rd">${esc(it.d)}</span>`:''}</div><div class="ra">${btn}<button type="button" class="star${fav?' on':''}" data-rf="${i}" aria-label="Sık kullanılanlara ekle/çıkar" title="${fav?'Sık kullanılanlardan çıkar':'Sık kullanılanlara ekle: listenin başında görünür'}">${fav?'★':'☆'}</button></div></div>`;
}
function render(){
 const rec=$('#recipes');if(!rec||$('#panel').hidden||mode!=='craft')return;
 const hd=header(),sv=$('#crfSt');
 const cc=chipCounts();
 const ord=RC.map((r,i)=>i);
 const rank=i=>{const r=RC[i],st=HG.canCraft(r);return (isFav(r)?0:3)+(pref.sort==='can'?(st===1?0:st===0?1:2):0)};
 ord.sort((a,b)=>rank(a)-rank(b)||a-b);
 let h='';for(const i of ord)h+=card(RC[i],i);
 const sortTxt=pref.sort==='can'?'Sıra: yapılabilirler önce':'Sıra: tarif sırası';
 const key=hd+'|'+h+'|'+sortTxt+'|'+JSON.stringify(cc);
 if(key===cache)return;
 cache=key;
 if(sv&&sv.dataset.h!==hd){sv.dataset.h=hd;sv.innerHTML=hd}
 rec.innerHTML=h;
 for(const b of document.querySelectorAll('#rcc button[data-k]')){
  const k=b.dataset.k,base=b.dataset.t||(b.dataset.t=b.textContent.replace(/\s*\(\d+\)$/,''));
  b.textContent=base+' ('+(cc[k]!==undefined?cc[k]:0)+')';
 }
 const sb=$('#rcs');if(sb)sb.textContent=sortTxt;
}
HG.renderRecipes=render;

/* Seri üretim: aynı tarifi en çok n kez dener (malzeme, istasyon ve yer elverdiği kadar) */
function craftMany(idx,n){
 const r=RC[idx];if(!r)return 0;
 let made=0;
 for(let k=0;k<n&&HG.canCraft(r)===1;k++){
  const before=G.stats?G.stats.crafted:0;
  HG.craft(idx);
  if(G.stats&&G.stats.crafted===before)break;
  made++;
 }
 return made;
}

/* ---------------- Kurulum ---------------- */
let wired=false;
function wire(){
 const rec=$('#recipes');if(wired||!rec||!$('#pbox'))return;
 wired=true;
 /* sekmeler */
 const tabs=$('#ptabs');
 if(tabs)tabs.addEventListener('click',e=>{
  const b=e.target.closest('button[data-m]');if(!b)return;
  HG.snd('ui');setMode(b.dataset.m);
 });
 /* düğmeler: ×N, Maks, yıldız (Üret düğmesi giris.js ve genisleme-arayuz.js ile çalışmaya devam eder) */
 rec.addEventListener('click',e=>{
  const q=e.target.closest('button[data-rq]');
  if(q){
   e.stopImmediatePropagation();
   const [i,n]=q.dataset.rq.split(':'),idx=+i,r=RC[idx];if(!r)return;
   const lim=n==='max'?99:Math.max(1,+n||1),made=craftMany(idx,lim);
   if(made>1)HG.toast('Üretildi: '+IT[r[0]].n+' ×'+(made*r[1]));
   cache='';render();return;
  }
  const f=e.target.closest('button[data-rf]');
  if(f){
   e.stopImmediatePropagation();
   const r=RC[+f.dataset.rf];if(!r)return;
   const k=rkey(r),at=pref.fav.indexOf(k);
   if(at>=0)pref.fav.splice(at,1);else pref.fav.push(k);
   save();HG.snd('ui');cache='';render();
  }
 },true);
 /* Üret düğmesinden sonra liste yenilenir (giris.js zaten HG.renderRecipes çağırır; önbellek temizlenir) */
 rec.addEventListener('click',e=>{if(e.target.closest('button[data-r]'))cache=''},true);
 const x=$('#crfX');if(x)x.onclick=()=>HG.togglePanel(false);
 labelTabs();
}
/* sıralama düğmesi ve Enter kısayolu: arama çubuğu (genisleme-arayuz.js) hazır olunca eklenir */
function addSort(){
 const bar=$('#rcf'),rec=$('#recipes');
 if(!bar||!rec||$('#rcs'))return !!$('#rcs');
 const row=document.createElement('div');row.id='rcr';
 const sb=document.createElement('button');sb.type='button';sb.id='rcs';sb.className='ghost';sb.textContent='Sıra: yapılabilirler önce';
 sb.title='Tarif sıralaması: yapılabilirler önce veya özgün sıra';
 sb.onclick=()=>{pref.sort=pref.sort==='can'?'list':'can';save();cache='';render()};
 row.appendChild(sb);
 const q=bar.querySelector('#rcq');
 if(q){
  q.parentNode.insertBefore(row,q.nextSibling);
  q.addEventListener('keydown',e=>{
   if(e.code!=='Enter')return;
   /* Enter: görünen ilk yapılabilir tarifi üretir */
   const b=[...rec.querySelectorAll('.rc:not([hidden]) button[data-r]:not([disabled])')][0];
   if(b){e.preventDefault();HG.craft(+b.dataset.r);cache='';render()}
  });
 }else bar.appendChild(row);
 return true;
}
function setup(){wire();return addSort()}
let tries=0;
const iv=setInterval(()=>{if((setup()&&wired)||++tries>60)clearInterval(iv)},250);
})();
