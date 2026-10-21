/* Hunger 3D - ana döngü ve başlatma (en son yüklenen dosya) */
(()=>{
'use strict';
const {W,T,G,ui,inp,A,Scene,$,tod,daylight,held}=HG;
let last=performance.now(),recT=0,skip=false,menuBg=null;
/* Nesne değişimleri: önce artımlı senkron denenir, olmazsa tam senkron yapılır */
function flushObjects(){
 if(G.objDirty){Scene.sync(G);G.objDirty=false;if(G.oc)G.oc.length=0}
 else if(G.oc&&G.oc.length){
  const c=G.oc;
  if(Scene.syncCells(G,c))Scene.markGrass&&Scene.markGrass();else Scene.sync(G);
  c.length=0;
 }
}

/* FPS göstergesi (ayardan açılır) */
const fpsEl=document.createElement('div');fpsEl.id='fps';fpsEl.hidden=true;$('#game').appendChild(fpsEl);
let fa=0,fn=0;
function frame(now){
 const raw=(now-last)/1000,dt=Math.min(.05,raw);last=now;
 if(HG.cfg.fps){fa+=raw;fn++;if(fa>=.5){fpsEl.textContent=Math.round(fn/fa)+' FPS';fa=0;fn=0}if(fpsEl.hidden)fpsEl.hidden=false}else if(!fpsEl.hidden)fpsEl.hidden=true;
 if(HG.busy){requestAnimationFrame(frame);return}   /* yükleme sürerken sahne çizilmez */
 if(ui.state==='pause'&&!(HG.coopActive&&HG.coopActive())){skip=!skip;if(skip){requestAnimationFrame(frame);return}}   /* duraklatmada çizim hızı yarıya iner */
 if(ui.state==='play'){
  flushObjects();
  G.tg=Scene.aim(G);
  if($('#bigmap').hidden&&!ui.sleeping)HG.update(dt);
  else if(HG.coopIdle)HG.coopIdle(dt);
  if(ui.dirty)HG.renderInv();
  if(!$('#panel').hidden){recT-=dt;if(recT<=0){recT=.5;HG.renderRecipes()}}
  HG.hud();
 }else if(HG.coopActive&&HG.coopActive()&&(ui.state==='pause'||ui.state==='dead')){HG.coopIdle(dt);flushObjects()}   /* co-op: duraklatmada ve ölümde dünya akmaya devam eder */
 else if(ui.state==='menu'){ui.menuClock+=dt;G.clock+=dt*5;flushObjects()}
 const play=ui.state!=='menu',h=play?held():null;
 let place=null;
 if(ui.state==='play'&&h&&h.it.place&&G.tg){const p=HG.placeTarget(h.k);if(p)place={x:p.x,y:p.y,ok:true};else{const t=G.tg;place={x:t.x,y:t.y,ok:false}}}
 else if(ui.state==='play'&&h&&(h.it.tool==='plan'||h.it.tool==='hammer')&&HG.insaGhost)place=HG.insaGhost(h.k);
 HG.audioFrame(G,dt,ui.state);
 /* Ana menüde 3B dünya çizilmez: yerine hafif 2B manzara gösterilir (js/oyun/menu-arka.js) */
 if(menuBg!==!play){menuBg=!play;$('#game').classList.toggle('menu2d',menuBg)}
 if(play)Scene.render(G,now,dt,{mode:'play',L:daylight(),tod:tod(),act:!!((inp.mouseDown||inp.touchAct)&&A.key),held:h?h.k:null,target:ui.state==='play'?G.tg:null,place,hitI:A.hitI,hitT:A.hitT,clock:ui.menuClock});
 requestAnimationFrame(frame);
}
const nap=()=>new Promise(r=>setTimeout(r,20));
async function init(){
 HG.busy=true;HG.ldOpen('Ada hazırlanıyor');
 window.__H=HG;                         /* test ve hata ayıklama için */
 HG.ldSet(.04,'Grafik motoru başlatılıyor');await nap();
 Scene.init($('#c'));
 HG.ldSet(.15,'Arazi ve dünya üretiliyor');await nap();
 HG.newState((Math.random()*2147483647)|0);
 await Scene.buildAsync(G,p=>HG.ldSet(.2+p*.6,'Sahne kuruluyor'));
 Scene.setMode('menu');
 HG.ldSet(.86,'Kontroller hazırlanıyor');await nap();
 HG.setupInput();
 if(HG.saveExists())$('#bCont').hidden=false;
 HG.ldSet(.93,'Gölgelendiriciler derleniyor');await nap();
 Scene.warmup();
 HG.ldSet(1,'Hazır');await nap();
 HG.busy=false;HG.ldClose();
 requestAnimationFrame(frame);
}
init();
})();
