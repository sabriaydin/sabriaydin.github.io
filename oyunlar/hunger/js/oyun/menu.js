/* Hunger 3D - ana menü: Dünya Oluştur penceresi, sürüm yazısı ve menü arka planı parçacık efekti (kıvılcım, ateş böceği, sis).
   Yeni Oyun düğmesi (giris.js) önce HG.worldDialog.open() çağırır; seçenekler HG.applyNewWorld ile yeni dünyaya uygulanır (durum.js). */
(()=>{
'use strict';
const {G,ui,$}=HG;
HG.VERSION='1.91';                               /* her güncellemede artırılır; ana menünün sağ altında görünür */
const PREF='hunger-dunya';

/* ============================================================ Dünya Oluştur ============================================================ */
const START=[0,.296,.593];                          /* oyun saati başlangıcı (gün oranı): sabah, öğle, akşam */
const KIT=[['axe1',1],['pick1',1],['bandage',2],['cfish',2],['wbottle',1]];
let wd=null,F={};
function pref(){try{const p=JSON.parse(localStorage.getItem(PREF)||'null');return p&&typeof p==='object'?p:{}}catch(e){return {}}}
function fill(){
 const c=HG.cfg,p=pref();
 F.name.value='';F.code.value='';F.code.classList.remove('bad');
 F.diff.value=String(c.diff);F.death.value=String(c.death);F.season.checked=!!c.season;F.wear.checked=c.wear!==false;F.cmd.checked=!!c.cmd;F.peace.checked=!!c.peace;
 F.time.value=String(p.time!==undefined?p.time:0);F.anim.value=String(p.anim!==undefined?p.anim:1);F.res.value=String(p.res!==undefined?p.res:1);F.kit.value=String(p.kit!==undefined?p.kit:0);
 if(!F.time.value)F.time.value='0';if(!F.anim.value)F.anim.value='1';if(!F.res.value)F.res.value='1';if(!F.kit.value)F.kit.value='0';        /* kayıtlı tercih listede yoksa varsayılan */
 refresh();codeMsg();
}

/* ---- Seçenek açıklamaları, özet satırı ve dünya kodu denetimi ---- */
const HINT={
 diff:{'0':'Açlık, susuzluk ve alınan hasar %25 daha yavaş.','1':'Standart denge.','2':'Açlık, susuzluk ve alınan hasar %30 daha hızlı.'},
 death:{bed:'Ölünce doğma noktasında uyanırsınız; eşyalar cenaze çantasında kalır.',free:'Ölünce doğma noktasında uyanırsınız; eşyalarınız yanınızda kalır.',perm:'Ölünce kayıt silinir ve oyun biter; geri alınamaz (co-op konuğunda uygulanmaz).'},
 time:{'0':'Gün doğumundan kısa süre sonra başlar; gün batımına yaklaşık 18 dakika vardır.','1':'Öğle başlar; gün batımına yaklaşık 10 dakika vardır.','2':'Akşam başlar; gün batımına yaklaşık 2 dakika vardır, ilk gece hemen gelir.'},
 anim:{'1':'Haritadaki hayvan sayısı standarttır.','0':'Hayvanların yaklaşık yarısı kaldırılır; et, deri ve yün bulmak zorlaşır.'},
 res:{'1.45':'Ağaç, kaya ve maden normalden belirgin az; üretim zorlaşır.','1':'Ağaç, kaya ve maden sayısı standarttır.','0.4':'Ağaç, kaya ve maden çok daha bol; oyun kolaylaşır.'}
};
const kitText=()=>KIT.map(([id,n])=>(n>1?n+' ':'')+(HG.IT[id]?HG.IT[id].n:id)).join(', ');
const opt=el=>el&&el.options[el.selectedIndex];
const short=el=>{const o=opt(el);return o?o.textContent.split(' (')[0]:''};
function refresh(){
 if(!wd||!F.diff)return;
 const set=(id,t)=>{const e=$('#'+id);if(e)e.textContent=t};
 set('wdDiffH',HINT.diff[F.diff.value]||'');
 set('wdDeathH',HINT.death[F.death.value]||'');
 set('wdTimeH',HINT.time[F.time.value]||'');
 set('wdAnimH',HINT.anim[F.anim.value]||'');
 set('wdResH',HINT.res[F.res.value]||'');
 set('wdKitH',F.kit.value==='1'?'Verilenler: '+kitText()+'. El Taşı her zaman yanınızdadır.':'Yalnızca El Taşı verilir; odun ve taş toplayıp aletleri kendiniz üretirsiniz.');
 const d=$('#wdDeathH');if(d)d.classList.toggle('err',F.death.value==='perm');
 if(F.sum)F.sum.textContent='Özet: '+[short(F.diff)+' zorluk',short(F.death),short(F.time)+' başlangıç','Hayvan: '+short(F.anim),'Kaynak: '+short(F.res),short(F.kit),'Mevsimler '+(F.season.checked?'açık':'kapalı'),'Alet aşınması '+(F.wear.checked?'açık':'kapalı'),'Barış modu '+(F.peace.checked?'açık':'kapalı')].join(' · ');
}
const CODE_DEF='Aynı kod aynı adayı (kıyı, göl, köy) kurar; kaynak ve hayvan sayısı aşağıdaki seçeneklere göre değişir.';
const CODE_MAX=(2147483647).toString(36).toUpperCase();         /* ZIK0ZJ: dünya tohumunun üst sınırı */
function codeState(){
 const raw=F.code.value.toUpperCase().replace(/[^0-9A-Z]/g,'');
 if(!raw)return {ok:true,soft:false,msg:''};
 if(raw.length<6)return {ok:false,soft:true,msg:'Kod 6 karakterden oluşur ('+raw.length+'/6). Örnek: ABC-123.'};
 if(HG.parseWorldCode(raw)===null)return {ok:false,soft:false,msg:'Bu kod geçerli aralığın dışında (en büyük kod '+CODE_MAX.slice(0,3)+'-'+CODE_MAX.slice(3)+'). Rastgele düğmesini kullanabilirsiniz.'};
 return {ok:true,soft:false,msg:'Geçerli kod: bu ada kurulacak.'};
}
function codeMsg(force){
 const s=codeState(),m=$('#wdCodeMsg');
 const bad=!s.ok&&(!s.soft||force);
 F.code.classList.toggle('bad',bad);
 if(m){m.classList.toggle('err',bad);m.textContent=s.msg||CODE_DEF}
 return s;
}
function open(){
 if(!wd)return;
 fill();wd.hidden=false;try{HG.snd('ui_open')}catch(e){}
 setTimeout(()=>{if(!wd.hidden)F.name.focus()},30);
}
function close(){if(!wd||wd.hidden)return;wd.hidden=true;try{HG.snd('ui_close')}catch(e){}}
function create(){
 let seed=null;const t=F.code.value.trim();
 if(t){
  const cs=codeMsg(true);
  seed=cs.ok?HG.parseWorldCode(t):null;
  if(seed===null){HG.toast(cs.msg||'Dünya kodu geçersiz.');F.code.focus();return}
 }
 const c=HG.cfg;
 c.diff=F.diff.value;c.death=F.death.value;c.season=F.season.checked;c.wear=F.wear.checked;c.cmd=F.cmd.checked;c.peace=F.peace.checked;
 if(HG.settings){for(const k of ['diff','death','season','wear','cmd','peace'])HG.settings.apply(k);HG.settings.persist()}
 const w={name:F.name.value.replace(/\s+/g,' ').trim().slice(0,30),time:+F.time.value,anim:+F.anim.value,kit:+F.kit.value,res:+F.res.value||1};
 try{localStorage.setItem(PREF,JSON.stringify({time:w.time,anim:w.anim,kit:w.kit,res:w.res}))}catch(e){}
 HG.pendingSeed=seed;HG.pendingWorld=w;
 wd.hidden=true;
 HG.initAudio();HG.startGame(false);
}
/* yeni dünya kurulduktan hemen sonra çağrılır (durum.js › startGame) */
HG.applyNewWorld=()=>{
 const w=HG.pendingWorld;HG.pendingWorld=null;
 if(!w)return;
 if(w.name)G.worldName=w.name;
 G.clock=HG.DAY*(START[w.time]||0);
 if(w.anim===0&&Array.isArray(G.animals))G.animals=G.animals.filter((a,i)=>(HG.ANIMAL[a.t]&&HG.ANIMAL[a.t].foe)||i%2===0);
 if(w.kit)for(const [id,n] of KIT)if(HG.IT[id])HG.add(id,n);
};
HG.worldDialog={open,close};

function setupWorld(){
 wd=$('#wd');if(!wd)return;
 const ids={name:'wdName',code:'wdCode',diff:'wdDiff',death:'wdDeath',time:'wdTime',anim:'wdAnim',res:'wdRes',kit:'wdKit',season:'wdSeason',wear:'wdWear',cmd:'wdCmd',peace:'wdPeace',sum:'wdSum'};
 for(const k in ids)F[k]=$('#'+ids[k]);
 F.code.addEventListener('input',()=>{const v=F.code.value.toUpperCase().replace(/[^0-9A-Z]/g,'').slice(0,6);F.code.value=v.length>3?v.slice(0,3)+'-'+v.slice(3):v;codeMsg()});
 $('#wdRnd').onclick=()=>{F.code.value=HG.worldCode((Math.random()*2147483647)|0);codeMsg()};
 for(const k of ['diff','death','time','anim','res','kit','season','wear','cmd','peace']){F[k].addEventListener('change',refresh);F[k].addEventListener('input',refresh)}
 /* Varsayılan: ad ve kod korunur, diğer seçenekler başlangıç değerlerine döner */
 $('#wdDef').onclick=()=>{
  const D=(HG.settings&&HG.settings.DEF)||{};
  F.diff.value=String(D.diff!==undefined?D.diff:'1');F.death.value=String(D.death||'bed');F.season.checked=D.season!==false;F.wear.checked=D.wear!==false;F.cmd.checked=!!D.cmd;F.peace.checked=!!D.peace;
  F.time.value='0';F.anim.value='1';F.res.value='1';F.kit.value='0';
  refresh();try{HG.snd('ui')}catch(e){}
 };
 $('#wdGo').onclick=create;$('#wdX').onclick=close;
 wd.addEventListener('pointerdown',e=>{if(e.target===wd)close()});
 wd.addEventListener('keydown',e=>{if(e.code!=='Escape')e.stopPropagation();if((e.code==='Enter'||e.code==='NumpadEnter')&&e.target.tagName==='INPUT'&&e.target.type==='text'){e.preventDefault();create()}});
 wd.addEventListener('keyup',e=>{if(e.code!=='Escape')e.stopPropagation()});
 addEventListener('keydown',e=>{if(e.code==='Escape'&&!wd.hidden){e.stopImmediatePropagation();e.preventDefault();close()}},true);
}

/* ============================================================ Sürüm yazısı ============================================================ */
function setupVer(){const v=$('#menuVer');if(v)v.textContent='Sürüm '+HG.VERSION}

/* ============================================================ Arka plan efekti ============================================================ */
function sprite(sz,stops){
 const c=document.createElement('canvas');c.width=c.height=sz;const g=c.getContext('2d');
 const r=g.createRadialGradient(sz/2,sz/2,0,sz/2,sz/2,sz/2);for(const [o,col] of stops)r.addColorStop(o,col);
 g.fillStyle=r;g.fillRect(0,0,sz,sz);return c;
}
function setupFx(){
 const cv=$('#mfx'),menu=$('#menu');if(!cv||!menu||!cv.getContext)return;
 const g=cv.getContext('2d');
 const spE=sprite(32,[[0,'rgba(255,235,170,1)'],[.25,'rgba(255,150,60,.85)'],[1,'rgba(255,60,20,0)']]);
 const spF=sprite(32,[[0,'rgba(225,255,150,1)'],[.3,'rgba(170,230,90,.6)'],[1,'rgba(120,200,60,0)']]);
 const spM=sprite(128,[[0,'rgba(190,200,215,.20)'],[1,'rgba(190,200,215,0)']]);
 let w=0,h=0,P=[],M=[],last=performance.now();
 const rnd=(a,b)=>a+Math.random()*(b-a);
 function size(){
  w=cv.clientWidth|0;h=cv.clientHeight|0;if(!w||!h)return;
  const k=.5;cv.width=Math.round(w*k);cv.height=Math.round(h*k);
  const n=Math.max(26,Math.min(64,Math.round(w*h/24000)));      /* arka plan manzarası eklendiğinden parçacıklar seyreltildi (güncelleme 49) */
  while(P.length<n)P.push(spawn(true));P.length=n;
  while(M.length<7)M.push({x:rnd(-.2,1.2),y:rnd(.45,1),s:rnd(.35,.8),v:rnd(.004,.012)*(Math.random()<.5?-1:1),a:rnd(.5,1)});
 }
 function spawn(any){
  const ember=Math.random()<.68;
  return {e:ember,x:Math.random(),y:any?Math.random():1.05+Math.random()*.1,r:ember?rnd(.8,2.6):rnd(1.4,3.2),vy:ember?-rnd(.025,.09):-rnd(.004,.02),sw:rnd(.01,.04),ph:rnd(0,6.28),f:rnd(.8,3),life:rnd(0,1)};
 }
 function frame(now){
  if(menu.hidden||getComputedStyle(menu).display==='none')return;
  if(HG.cfg.mfx===false){g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);last=now;requestAnimationFrame(frame);return}      /* ayar: menü efekti kapalı */
  const dt=Math.min(.06,(now-last)/1000);last=now;
  if(!w||cv.clientWidth!==w||cv.clientHeight!==h)size();
  if(w){
   const W=cv.width,H=cv.height,t=now*.001;
   g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);g.globalCompositeOperation='lighter';
   for(const m of M){
    m.x+=m.v*dt;if(m.x>1.3)m.x=-.3;else if(m.x<-.3)m.x=1.3;
    const s=m.s*W;g.globalAlpha=m.a*(.7+.3*Math.sin(t*.3+m.y*9));g.drawImage(spM,m.x*W-s/2,m.y*H-s*.3,s,s*.6);
   }
   for(const p of P){
    p.y+=p.vy*dt;p.ph+=p.f*dt;p.x+=Math.sin(p.ph)*p.sw*dt+(p.e?.004:0)*dt;
    if(p.y<-.05||p.x>1.05||p.x<-.05){Object.assign(p,spawn(false));continue}
    const fl=p.e?.55+.45*Math.sin(p.ph*3.1+p.life*9):.35+.65*Math.max(0,Math.sin(p.ph*1.7));
    const fade=Math.min(1,Math.max(0,p.y*3)) ,sz=p.r*(p.e?2.6:3.2)*(W/900+.6);
    g.globalAlpha=Math.max(0,fl*fade)*(p.e?.72:.55);
    g.drawImage(p.e?spE:spF,p.x*W-sz/2,p.y*H-sz/2,sz,sz);
   }
   g.globalAlpha=1;g.globalCompositeOperation='source-over';
  }
  requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);
}

function setup(){setupWorld();setupVer();setupFx()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
