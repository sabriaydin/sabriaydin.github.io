/* Hunger 3D - büyük güncelleme (51) arayüzü: Depo Sandığı penceresi, Tabela düzenleyici, tarif arama ve süzgeci, çoklu üretim,
   F1 ile Ayarlar › Kontrol, ses altyazıları, hasar sayıları, harita işaretleri ve oyun kolu desteği.
   Özgün dosyalara yalnızca kancalar (extOverlay, extClose, extMapMarks, extMapClick, extTabHtml) üzerinden bağlanır. */
(()=>{
'use strict';
const {W,H,O,IT,RC,ICON,G,ui,inp,Scene,SLOTS,HOT,add}=HG;
const $=HG.$,sc=HG.sc;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clearKeys=()=>{for(const k in inp.keys)inp.keys[k]=false;inp.mouseDown=false;inp.touchAct=false};
const CN=24;                                                  /* sandık kutu sayısı (genisleme.js ile aynı) */
const regain=()=>{ui.relock=true;HG.lock()};
const J=(k,d)=>{try{HG.journal&&HG.journal.push('x2',Object.assign({k},d))}catch(e){}};

/* ============================================================ Depo Sandığı ============================================================ */
let cur=null,box=null,cg=null;                                /* cur: {i, cave} açık sandık */
const ent=()=>cur?HG.x2ent(cur.i,O.CHEST):null;
function fit(id){const mx=IT[id].s;let r=0;for(const s of G.inv){if(!s)r+=mx;else if(s.id===id)r+=mx-s.n}return r}
function ensureBox(){
 if(box)return box;
 const pb=$('#pbox');if(!pb)return null;
 box=document.createElement('div');box.id='cbox';box.hidden=true;
 box.innerHTML='<h2 id="cT">Depo Sandığı</h2><div id="cgrid"></div><div id="cinfo"></div>'+
  '<div id="cbtn"><button id="cTake" type="button">Hepsini al</button><button id="cPut" class="ghost" type="button">Çantayı boşalt</button><button id="cSame" class="ghost" type="button">Aynılarını koy</button><button id="cPick" class="ghost" type="button">Sandığı geri al</button></div>'+
  '<p class="hp">Kutuya tıklayarak eşyayı çantaya alın. Çantadan eşya seçip kutuya tıklayarak koyun; Shift + tık: hızlı koy. Kısayol çubuğu (ilk 8 kutu) "Çantayı boşalt" ve "Aynılarını koy" işleminden hariçtir.</p>';
 pb.appendChild(box);
 cg=box.querySelector('#cgrid');
 cg.addEventListener('click',onChestClick);
 cg.addEventListener('mouseover',e=>{
  const s=e.target.closest('.slot');if(!s||!cur)return;
  const q=ent().it[+s.dataset.c];
  box.querySelector('#cinfo').innerHTML=q?`<b>${esc(IT[q.id].n)}</b>${IT[q.id].d?'<br>'+esc(IT[q.id].d):''}`:'';
 });
 box.querySelector('#cTake').onclick=takeAll;
 box.querySelector('#cPut').onclick=()=>putMany(false);
 box.querySelector('#cSame').onclick=()=>putMany(true);
 box.querySelector('#cPick').onclick=()=>{
  if(!cur)return;
  if(HG.x2pick(cur.i))HG.togglePanel(false);
 };
 /* çantadan sürükleyip sandık üzerine bırakma */
 box.addEventListener('pointerup',e=>{
  if(!cur||ui.dragFrom===null||ui.dragFrom===undefined)return;
  const el=document.elementFromPoint(e.clientX,e.clientY),s=el&&el.closest&&el.closest('#cgrid .slot');
  const from=ui.dragFrom;
  if(s)moveToSlot(from,+s.dataset.c);else if(el&&el.closest('#cbox'))putInv(from);
 });
 /* Shift + tık: çantadaki eşyayı hemen sandığa koy */
 for(const sel of ['#grid','#hot']){
  const el=$(sel);if(!el)continue;
  el.addEventListener('click',e=>{
   if(!cur||!e.shiftKey)return;
   const s=e.target.closest('.slot');if(!s)return;
   e.stopImmediatePropagation();e.preventDefault();
   putInv(+s.dataset.i);
  },true);
 }
 return box;
}
function changed(){
 ui.dirty=true;HG.snd('ui');
 if(cur){
  J('chest',{i:cur.i});
  if(G.obj[cur.i]===O.CHEST&&ent().gr)HG.x2graveCheck(cur.i);
  if(G.obj[cur.i]!==O.CHEST){HG.togglePanel(false);return}
 }
 renderChest();
}
function renderChest(){
 if(!cur||!box)return;
 const e=ent(),n=HG.x2chestCount(e);
 box.querySelector('#cT').textContent=(e.gr?'Cenaze Çantası':'Depo Sandığı')+' · '+n+'/'+CN;
 let h='';
 for(let k=0;k<CN;k++){
  const s=e.it[k],it=s?IT[s.id]:null;
  h+=`<div class="slot" data-c="${k}"${it?` title="${esc(it.n)}"`:''}>${it?`<img src="${ICON[s.id]}" alt="${esc(it.n)}">${s.n>1?`<span class="n">${s.n}</span>`:''}`:''}</div>`;
 }
 cg.innerHTML=h;
 box.querySelector('#cTake').disabled=!n;
 box.querySelector('#cPick').hidden=!!e.gr;
 box.querySelector('#cinfo').innerHTML=e.gr?'Eşyalarının tamamı burada. Boşaltınca çanta kaybolur.':'';
}
function takeSlot(k){
 const e=ent(),s=e&&e.it[k];if(!s)return 0;
 const m=Math.min(s.n,fit(s.id));
 if(m<=0){HG.toast('Envanter dolu.');return 0}
 add(s.id,m);s.n-=m;if(s.n<=0)e.it[k]=null;
 return m;
}
function takeAll(){
 if(!cur)return;
 const e=ent();let any=false,left=false;
 for(let k=0;k<CN;k++){if(!e.it[k])continue;const m=takeSlot(k);if(m)any=true;if(e.it[k])left=true}
 if(left&&any)HG.toast('Envanter doldu: bazı eşyalar sandıkta kaldı.');
 if(any)changed();
}
function putStack(e,id,n){
 const mx=IT[id].s;
 for(let k=0;k<CN&&n>0;k++){const s=e.it[k];if(s&&s.id===id&&s.n<mx){const m=Math.min(mx-s.n,n);s.n+=m;n-=m}}
 for(let k=0;k<CN&&n>0;k++){if(!e.it[k]){const m=Math.min(mx,n);e.it[k]={id,n:m};n-=m}}
 return n;
}
function putInv(i,quiet){
 const s=G.inv[i];if(!s||!cur)return 0;
 const e=ent(),rem=putStack(e,s.id,s.n),m=s.n-rem;
 if(m<=0){if(!quiet)HG.toast('Sandık dolu.');return 0}
 s.n=rem;if(s.n<=0)G.inv[i]=null;
 if(!quiet)changed();
 return m;
}
function putMany(sameOnly){
 if(!cur)return;
 const e=ent();let any=false;
 const has=new Set(e.it.filter(Boolean).map(q=>q.id));
 for(let i=HOT;i<SLOTS;i++){
  const s=G.inv[i];if(!s)continue;
  if(sameOnly&&!has.has(s.id))continue;
  if(putInv(i,true))any=true;
 }
 if(any){ui.picked=null;changed()}else HG.toast(sameOnly?'Sandıktakilerle aynı eşya yok.':'Sandığa konacak eşya yok.');
}
function moveToSlot(i,k){
 const s=G.inv[i];if(!s||!cur)return;
 const e=ent(),t=e.it[k];
 if(!t){e.it[k]=s;G.inv[i]=null}
 else if(t.id===s.id){const m=Math.min(IT[t.id].s-t.n,s.n);t.n+=m;s.n-=m;if(s.n<=0)G.inv[i]=null}
 else{e.it[k]=s;G.inv[i]=t}
 ui.picked=null;changed();
}
function onChestClick(ev){
 const sl=ev.target.closest('.slot');if(!sl||!cur)return;
 const k=+sl.dataset.c;
 if(ui.picked!==null&&G.inv[ui.picked]){moveToSlot(ui.picked,k);return}
 if(takeSlot(k))changed();
}
function closeChestUi(){
 cur=null;
 const pb=$('#pbox');if(pb)pb.classList.remove('cst');
 if(box)box.hidden=true;
}
HG.openStore=function(i){
 if(ui.state!=='play')return;
 if(!ensureBox())return;
 const p=$('#panel');
 if(p.hidden)HG.togglePanel(true);
 if(p.hidden)return;
 cur={i,cave:!!G.cave};
 HG.x2ent(i,O.CHEST);
 $('#pbox').classList.add('cst');box.hidden=false;
 renderChest();ui.dirty=true;
};
{
 const t0=HG.togglePanel;
 HG.togglePanel=function(){
  const r=t0.apply(this,arguments);
  if($('#panel').hidden&&cur)closeChestUi();
  return r;
 };
}

/* ============================================================ Tabela ============================================================ */
let sg=null,sgI=-1;
function ensureSign(){
 if(sg)return sg;
 sg=document.createElement('div');sg.id='sgn';sg.hidden=true;
 sg.innerHTML='<div class="card"><h1 style="font-size:24px;letter-spacing:.1em">TABELA</h1><p>Tabelaya yazılacak metin (en çok 48 karakter). Tabela yakından okunur.</p>'+
  '<input id="sgIn" type="text" maxlength="48" autocomplete="off" spellcheck="false" aria-label="Tabela yazısı">'+
  '<div class="btns"><button id="sgOk" type="button">Kaydet</button><button id="sgClr" class="ghost" type="button">Yazıyı sil</button><button id="sgPick" class="ghost" type="button">Tabelayı geri al</button><button id="sgX" class="ghost" type="button">Vazgeç (Esc)</button></div></div>';
 ($('#game')||document.body).appendChild(sg);
 const f=sg.querySelector('#sgIn');
 f.addEventListener('keydown',e=>{
  if(e.code==='Escape')return;
  e.stopPropagation();
  if(e.code==='Enter'||e.code==='NumpadEnter'){e.preventDefault();saveSign()}
 });
 f.addEventListener('keyup',e=>{if(e.code!=='Escape')e.stopPropagation()});
 sg.querySelector('#sgOk').onclick=saveSign;
 sg.querySelector('#sgClr').onclick=()=>{f.value='';f.focus()};
 sg.querySelector('#sgPick').onclick=()=>{
  const i=sgI;if(i<0)return;
  if(HG.x2pick(i)){hideSign();regain()}
 };
 sg.querySelector('#sgX').onclick=()=>{hideSign();regain()};
 sg.addEventListener('pointerdown',e=>{if(e.target===sg){hideSign();regain()}});
 return sg;
}
function hideSign(){
 if(!sg||sg.hidden)return false;
 sg.hidden=true;sgI=-1;
 const a=document.activeElement;if(a&&a.blur)a.blur();
 return true;
}
function saveSign(){
 if(sgI<0)return;
 const i=sgI,e=HG.x2ent(i,O.SIGN),t=sg.querySelector('#sgIn').value.replace(/\s+/g,' ').trim().slice(0,48);
 e.tx=t;J('sign',{i,tx:t});
 hideSign();HG.snd('craft');
 HG.toast(t?'Tabela yazıldı.':'Tabela temizlendi.');
 regain();
}
HG.openSign=function(i){
 if(ui.state!=='play'||!ensureSign())return;
 const e=HG.x2ent(i,O.SIGN);
 clearKeys();sgI=i;
 sg.querySelector('#sgIn').value=e.tx||'';
 sg.hidden=false;HG.unlock(true);
 setTimeout(()=>{const f=sg.querySelector('#sgIn');if(!sg.hidden)f.focus()},30);
};

/* ============================================================ F1: Ayarlar › Kontrol (tuşlar ve sabit kontroller tek sayfada) ============================================================ */
addEventListener('keydown',e=>{
 if(e.code!=='F1')return;
 if(ui.state==='menu'||ui.state==='dead')return;
 e.preventDefault();e.stopImmediatePropagation();
 if(e.repeat||!HG.settings)return;
 if(HG.settings.isOpen)return;
 if(ui.state==='play'){
  if(HG.extOverlay()||!$('#panel').hidden||!$('#bigmap').hidden||!$('#jr').hidden||!$('#gd').hidden||!$('#trade').hidden)return;
  clearKeys();HG.unlock(true);
 }
 HG.settings.open(null,'Kontrol');
},true);

/* ============================================================ Ortak: kapatma ve üst katman ============================================================ */
HG.extOverlay=()=>!!(sg&&!sg.hidden);
HG.extClose=silent=>{
 let any=false;
 if(hideSign())any=true;
 if(silent&&cur){closeChestUi();any=true}
 if(silent){const a=document.activeElement;if(a&&a.blur&&a!==document.body)a.blur()}
 return any;
};

/* ============================================================ Tarif arama, süzgeç ve çoklu üretim ============================================================ */
const TR={'ı':'i','ş':'s','ğ':'g','ü':'u','ö':'o','ç':'c','İ':'i','â':'a','î':'i','û':'u'};
const norm=s=>String(s).toLocaleLowerCase('tr').replace(/[ışğüöçİâîû]/g,c=>TR[c]||c);
const CATS=[['all','Tümü'],['can','Yapılabilir'],['food','Yiyecek'],['tool','Alet'],['build','Yapı'],['other','Diğer']];
let cat='all',qEl=null,txt=[],txtN=-1;
const catOf=id=>{const it=IT[id];return it.food?'food':it.tool?'tool':it.place!==undefined?'build':'other'};
function buildTxt(){
 if(txtN===RC.length)return;
 txt=RC.map(r=>norm(IT[r[0]].n+' '+Object.keys(r[2]).map(k=>IT[k].n).join(' ')));txtN=RC.length;
}
function applyFilter(){
 const rec=$('#recipes');if(!rec||!qEl)return;
 buildTxt();
 const q=norm(qEl.value.trim());let shown=0;
 for(const row of rec.children){
  const b=row.querySelector&&row.querySelector('button[data-r]');if(!b)continue;
  const idx=+b.dataset.r,r=RC[idx];if(!r)continue;
  let ok=true;
  if(q&&!txt[idx].includes(q))ok=false;
  if(ok&&cat==='can'&&HG.canCraft(r)!==1)ok=false;
  else if(ok&&cat!=='all'&&cat!=='can'&&catOf(r[0])!==cat)ok=false;
  if(row.hidden===ok)row.hidden=!ok;
  if(ok)shown++;
 }
 const n=$('#rcn');if(n)n.hidden=shown>0||!rec.children.length;
}
function setupRecipes(){
 const rec=$('#recipes');if(!rec||$('#rcf'))return;
 const bar=document.createElement('div');bar.id='rcf';
 bar.innerHTML='<input id="rcq" type="search" placeholder="Tarif veya malzeme ara…" autocomplete="off" spellcheck="false" aria-label="Tarif ara"><div id="rcc"></div><p id="rcn" class="hp" hidden>Eşleşen tarif yok.</p>';
 rec.parentNode.insertBefore(bar,rec);
 qEl=bar.querySelector('#rcq');
 const cc=bar.querySelector('#rcc');
 cc.innerHTML=CATS.map(([k,n])=>`<button type="button" class="ghost${k===cat?' on':''}" data-k="${k}">${n}</button>`).join('');
 cc.addEventListener('click',e=>{
  const b=e.target.closest('button[data-k]');if(!b)return;
  cat=b.dataset.k;for(const x of cc.children)x.classList.toggle('on',x===b);
  applyFilter();
 });
 qEl.addEventListener('input',applyFilter);
 qEl.addEventListener('keydown',e=>{if(e.code!=='Escape'&&e.code!=='Tab')e.stopPropagation()});
 qEl.addEventListener('keyup',e=>{if(e.code!=='Escape'&&e.code!=='Tab')e.stopPropagation()});
 new MutationObserver(applyFilter).observe(rec,{childList:true});
 /* Shift: 5 kez, Ctrl: elinden geldiğince */
 rec.addEventListener('click',e=>{
  const b=e.target.closest('button[data-r]');if(!b||(!e.shiftKey&&!e.ctrlKey))return;
  e.stopImmediatePropagation();
  const idx=+b.dataset.r,r=RC[idx];if(!r)return;
  const lim=e.ctrlKey?60:5;
  for(let n=0;n<lim&&HG.canCraft(r)===1;n++){
   const before=G.stats?G.stats.crafted:0;
   HG.craft(idx);
   if(G.stats&&G.stats.crafted===before)break;
  }
  HG.renderRecipes();
 },true);
}

/* ============================================================ Ses altyazıları ============================================================ */
const AN={sheep:'Koyun',cow:'İnek',boar:'Yaban domuzu',rabbit:'Tavşan',wolf:'Kurt',shade:'Gölge',chicken:'Tavuk',deer:'Geyik',shark:'Köpek balığı',jelly:'Denizanası',crab:'Yengeç',bear:'Ayı',dog:'Köpek'};
const SOUND={thunder:'Gök gürültüsü',bloodmoon:'Kızıl ay doğuyor',stinger:'Tehlike yaklaşıyor',shark_warn:'Köpek balığı yakında',hit:'Darbe',hurt:'Acı',bark:'Köpek havlaması',clang:'Kalkan sesi',buzz:'Arı vızıltısı',whale:'Balina sesi',dolphin:'Yunus sesi',gull:'Martı',bell:'Çan',creak:'Gıcırtı',crumble:'Kaya yıkılması',chest:'Sandık',hiss:'Tıslama',whisper:'Fısıltı'};
const NOPOS=new Set(['thunder','bloodmoon','stinger','hurt','clang']);
let capEl=null;const capLast={};
function caption(k,pos){
 if(!HG.cfg.cap||ui.state!=='play')return;
 let t=SOUND[k];
 if(!t){
  const m=/^(call|cry|die)_(\w+)$/.exec(k);
  if(m&&AN[m[2]])t=AN[m[2]]+(m[1]==='call'?' sesi':m[1]==='cry'?' acı sesi':' ölüm sesi');
 }
 if(!t)return;
 const now=performance.now();
 if(capLast[t]&&now-capLast[t]<1400)return;
 capLast[t]=now;
 if(!capEl){capEl=document.createElement('div');capEl.id='cap';($('#game')||document.body).appendChild(capEl)}
 let dir='',dist='';
 if(pos&&!NOPOS.has(k)&&isFinite(pos.x)&&isFinite(pos.z)){
  const dx=pos.x-G.px,dz=pos.z-G.py,yaw=HG.look?HG.look.yaw:0;
  const fwd=dx*-Math.sin(yaw)+dz*-Math.cos(yaw),side=dx*Math.cos(yaw)-dz*Math.sin(yaw);
  const a=Math.abs(Math.atan2(side,fwd))*180/Math.PI;
  dir=a<35?'▲':a>145?'▼':side>0?'▶':'◀';
  dist=' · '+Math.round(Math.hypot(dx,dz))+' m';
 }
 const d=document.createElement('div');d.textContent=(dir?dir+' ':'')+'['+t+']'+dist;
 capEl.appendChild(d);setTimeout(()=>d.remove(),2600);
 while(capEl.children.length>4)capEl.firstChild.remove();
}
{
 const s0=HG.snd;
 HG.snd=function(k,pos){try{caption(k,pos)}catch(e){}return s0.apply(this,arguments)};
}

/* ============================================================ Hasar sayıları ============================================================ */
let dl=null;
function dmgNum(a,d,crit){
 if(!sc.cam||typeof THREE==='undefined')return;
 const def=HG.ANIMAL&&HG.ANIMAL[a.t],y=(Scene.groundY?Scene.groundY(a.x,a.z):0)+((def&&def.h)||1)+.35;
 const v=new THREE.Vector3(a.x+(Math.random()-.5)*.4,y,a.z+(Math.random()-.5)*.4).project(sc.cam);
 if(v.z>1||Math.abs(v.x)>1.1||Math.abs(v.y)>1.1)return;
 if(!dl){dl=document.createElement('div');dl.id='dmgl';($('#game')||document.body).appendChild(dl)}
 const e=document.createElement('span');
 e.textContent=String(Math.max(1,Math.round(d)));
 if(crit)e.className='crit';
 e.style.left=((v.x*.5+.5)*100).toFixed(1)+'%';e.style.top=((-v.y*.5+.5)*100).toFixed(1)+'%';
 dl.appendChild(e);setTimeout(()=>e.remove(),950);
 while(dl.children.length>14)dl.firstChild.remove();
}
{
 const h0=HG.hitAnimal;
 HG.hitAnimal=function(a){
  const hp=a?a.hp:0,r=h0.apply(this,arguments);
  try{if(a&&HG.cfg.dmgnum!==false&&hp-a.hp>.4)dmgNum(a,hp-a.hp,!!r)}catch(e){}
  return r;
 };
}

/* ============================================================ Harita işaretleri ============================================================ */
const LF=sz=>'600 '+Math.max(10,Math.min(12,sz*1.25))+'px system-ui,sans-serif';
function label(g,sz,t,x,y,col){
 g.fillStyle=col||'#fff';g.strokeStyle='#000';g.lineWidth=3;g.font=LF(sz);g.textAlign='center';
 g.strokeText(t,x,y);g.fillText(t,x,y);
}
HG.extMapMarks=function(g,tx,ty,k,sz,seen){
 if(G.cave)return;
 const x=G.x2;if(!x)return;
 const big=sz>5;
 /* cenaze çantaları */
 for(const key in x.s){
  const e=x.s[key];if(!e||!e.gr||e.o!==O.CHEST)continue;
  const i=+key,cx=tx(i%W+.5),cy=ty(((i/W)|0)+.5),s=Math.max(4,sz*1.05);
  g.strokeStyle='#000';g.lineWidth=4;g.beginPath();g.moveTo(cx,cy-s);g.lineTo(cx,cy+s);g.moveTo(cx-s*.7,cy-s*.35);g.lineTo(cx+s*.7,cy-s*.35);g.stroke();
  g.strokeStyle='#ff5a4a';g.lineWidth=2;g.beginPath();g.moveTo(cx,cy-s);g.lineTo(cx,cy+s);g.moveTo(cx-s*.7,cy-s*.35);g.lineTo(cx+s*.7,cy-s*.35);g.stroke();
  if(big)label(g,sz,'Cenaze',cx,cy-s-4,'#ffb0a8');
 }
 /* doğma noktası (yatak) */
 if(x.spawn&&G.obj[x.spawn.i]===O.BED){
  const i=x.spawn.i,cx=tx(i%W+.5),cy=ty(((i/W)|0)+.5),s=Math.max(3,sz*.8);
  g.fillStyle='#6aa8ff';g.strokeStyle='#000';g.lineWidth=2;g.beginPath();g.rect(cx-s,cy-s*.6,s*2,s*1.2);g.stroke();g.fill();
  if(big)label(g,sz,'Yatak',cx,cy-s-4,'#cfe2ff');
 }
 /* gezgin tüccar */
 if(x.trader){
  const cx=tx(x.trader.x),cy=ty(x.trader.z),s=Math.max(4,sz);
  g.fillStyle='#ff9a2a';g.strokeStyle='#000';g.lineWidth=2;g.beginPath();g.moveTo(cx,cy-s);g.lineTo(cx+s,cy);g.lineTo(cx,cy+s);g.lineTo(cx-s,cy);g.closePath();g.stroke();g.fill();
  if(big)label(g,sz,'Tüccar',cx,cy-s-4,'#ffd49a');
 }
 /* hazine bölgeleri ve bayraklar */
 let fn=0;
 for(const m of x.marks||[]){
  const cx=tx(m.x),cy=ty(m.z);
  if(m.k==='t'){
   const r=Math.max(6,m.r*k);
   g.strokeStyle='#000';g.lineWidth=3;g.setLineDash([5,4]);g.beginPath();g.arc(cx,cy,r,0,7);g.stroke();
   g.strokeStyle='#ffd24a';g.lineWidth=1.6;g.beginPath();g.arc(cx,cy,r,0,7);g.stroke();g.setLineDash([]);
   if(big)label(g,sz,'Hazine?',cx,cy-r-4,'#ffe9a0');
  }else{
   fn++;
   const s=Math.max(5,sz*1.1);
   g.strokeStyle='#000';g.lineWidth=3;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx,cy-s*2);g.stroke();
   g.strokeStyle='#fff';g.lineWidth=1.4;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx,cy-s*2);g.stroke();
   g.fillStyle='#7ad07a';g.strokeStyle='#000';g.lineWidth=1.5;g.beginPath();g.moveTo(cx,cy-s*2);g.lineTo(cx+s*1.2,cy-s*1.5);g.lineTo(cx,cy-s);g.closePath();g.fill();g.stroke();
   if(big)label(g,sz,String(fn),cx+s*1.8,cy-s*1.3,'#d6f5d6');
  }
 }
};
HG.extMapClick=function(wx,wy,e,tol){
 if(!e.shiftKey||G.cave)return false;
 const x=G.x2;if(!x)return false;
 const j=x.marks.findIndex(m=>m.k==='m'&&Math.hypot(m.x-wx,m.z-wy)<(tol||8));
 if(j>=0){HG.removeMark(j);HG.toast('Bayrak kaldırıldı.')}
 else{HG.addMark(wx,wy,'m');HG.toast('Bayrak eklendi ('+Math.round(Math.hypot(wx-G.px,wy-G.py))+' m).')}
 if(HG.mapBig&&!$('#bigmap').hidden)try{HG.mapBig()}catch(er){}
 return true;
};

/* ============================================================ Oyun kolu ============================================================ */
let padOn=false,padPrev=[],padKeys={};
function setKey(act,on){
 const b=HG.bind&&HG.bind[act];if(!b||!b[0])return;
 const c=b[0];
 if(on){inp.keys[c]=true;padKeys[c]=1}
 else if(padKeys[c]){inp.keys[c]=false;delete padKeys[c]}
}
function padRelease(){
 for(const c in padKeys)inp.keys[c]=false;
 padKeys={};if(padPrev[7])inp.mouseDown=false;padPrev=[];
}
function padStep(dt){
 if(HG.cfg.pad===false||!navigator.getGamepads){if(padOn){padRelease();padOn=false}return}
 let gp=null;
 try{for(const p of navigator.getGamepads()){if(p&&p.connected){gp=p;break}}}catch(e){}
 if(!gp){if(padOn){padRelease();padOn=false}return}
 padOn=true;
 const dz=v=>Math.abs(v)<.18?0:v;
 const ax=dz(gp.axes[0]||0),ay=dz(gp.axes[1]||0),rx=dz(gp.axes[2]||0),ry=dz(gp.axes[3]||0);
 const btn=n=>!!(gp.buttons[n]&&(gp.buttons[n].pressed||gp.buttons[n].value>.5));
 const panel=!$('#panel').hidden,ext=HG.extOverlay();
 const open=panel||ext||!$('#bigmap').hidden||!$('#jr').hidden||!$('#gd').hidden||!$('#trade').hidden;
 if(!open){
  setKey('fwd',ay<-.3);setKey('back',ay>.3);setKey('left',ax<-.3);setKey('right',ax>.3);
  setKey('jump',btn(0));setKey('sprint',btn(10));
  if(rx||ry)Scene.look(rx*dt*3.4*Math.abs(rx),ry*dt*2.4*Math.abs(ry));
  const rt=btn(7);
  if(rt!==!!padPrev[7]){inp.mouseDown=rt;if(rt)HG.onActPress()}
 }else{
  for(const a of ['fwd','back','left','right','jump','sprint'])setKey(a,false);
  if(padPrev[7]){inp.mouseDown=false}
 }
 const edge=n=>btn(n)&&!padPrev[n];
 if(edge(1)){
  if(ext){HG.extClose();regain()}
  else if(panel)HG.togglePanel(false);
  else if(!open)HG.togglePanel(true);
 }
 if(!open){
  if(edge(2))HG.useHeld('key');
  if(edge(3))HG.toggleMap();
  if(edge(4)){G.sel=(G.sel+HOT-1)%HOT;ui.dirty=true;HG.snd('ui')}
  if(edge(5)){G.sel=(G.sel+1)%HOT;ui.dirty=true;HG.snd('ui')}
  if(edge(8))HG.toggleJournal();
  if(edge(9)&&HG.placeHeld)HG.placeHeld();
 }else if(edge(3)&&!$('#bigmap').hidden)HG.toggleMap(false);
 for(let n=0;n<16;n++)padPrev[n]=btn(n);
}

/* ============================================================ Kare güncellemesi ============================================================ */
{
 const u0=HG.update;
 let err=false;
 HG.update=function(dt){
  if(ui.state==='play')try{padStep(dt)}catch(e){if(!err){err=true;console.error('genisleme-arayuz',e)}}
  u0.call(this,dt);
  if(ui.state!=='play')return;
  try{
   if(cur){
    const i=cur.i,d=Math.hypot(G.px-(i%W+.5),G.py-(((i/W)|0)+.5));
    if(cur.cave!==!!G.cave||G.obj[i]!==O.CHEST||d>7)HG.togglePanel(false);
   }
   if(sgI>=0){
    const i=sgI,d=Math.hypot(G.px-(i%W+.5),G.py-(((i/W)|0)+.5));
    if(G.obj[i]!==O.SIGN||d>8){hideSign();regain()}
   }
  }catch(e){if(!err){err=true;console.error('genisleme-arayuz',e)}}
 };
}

setupRecipes();
})();
