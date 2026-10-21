/* Hunger 3D - giriş: klavye, fare bakışı (pointer lock), dokunmatik, menü düğmeleri */
(()=>{
'use strict';
const {HOT,G,ui,inp,look,Scene,$}=HG;
const cvs=$('#c');

/* ---- Fare kilidi (FPS bakışı) ---- */
const overlayOpen=()=>!$('#panel').hidden||!$('#trade').hidden||!$('#bigmap').hidden||!$('#jr').hidden||!$('#gd').hidden||!!(HG.extOverlay&&HG.extOverlay());
/* Oyun üstünde açılabilen tüm pencereler: bunlardan biri Esc ile kapanırken duraklatma menüsü açılmamalıdır */
const WINS=['#panel','#trade','#bigmap','#jr','#gd','#set','#nt','#sv','#sd','#wd','#kns','#dlg','#cd'];
function anyWindow(){
 if(HG.extOverlay&&HG.extOverlay())return true;
 for(const s of WINS){const e=$(s);if(e&&!e.hidden&&getComputedStyle(e).display!=='none')return true}
 return false;
}
HG.anyWindow=anyWindow;
/* Tarayıcı kısayolları oyunun arasına girmesin: Ctrl+W sekmeyi kapatır, Ctrl+R sayfayı yeniler,
   Ctrl+1..9 sekme değiştirir. Tam ekranda Klavye Kilidi bu tuşları oyuna yönlendirir; Esc kilitlenmez,
   böylece tam ekrandan çıkış her zaman çalışır. Ayarlar › Kontrol › "Tam ekranda oyna" ile kapatılabilir. */
const KBKEYS=['KeyW','KeyT','KeyN','KeyR','KeyQ','KeyP','KeyS','KeyD','KeyF','KeyJ','KeyL','KeyO','KeyU','KeyH','Tab','Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9'];
let kbT=0;
function kbGuard(){
 if(!HG.cfg||HG.cfg.kbLock===false||ui.touch)return;
 const kb=navigator.keyboard;if(!kb||!kb.lock)return;
 const go=()=>{try{const p=kb.lock(KBKEYS);if(p&&p.catch)p.catch(()=>{})}catch(e){}};
 if(document.fullscreenElement){go();return}
 const el=$('#game');if(!el||!el.requestFullscreen)return;
 const now=performance.now();if(now-kbT<1500)return;kbT=now;        /* reddedilen istek üst üste denenmez */
 try{const p=el.requestFullscreen();if(p&&p.then)p.then(go,()=>{});else go()}catch(e){}
}
HG.kbGuard=kbGuard;
function lock(){
 if(ui.touch||ui.state!=='play'||overlayOpen())return;
 /* Esc basılıyken kilit istenirse tarayıcının Esc işlemi kilidi hemen bozar ve oyun duraklar: tuş bırakılınca alınır */
 if(inp.keys.Escape){ui.relock=true;return}
 kbGuard();
 try{const p=cvs.requestPointerLock&&cvs.requestPointerLock();if(p&&p.catch)p.catch(()=>{})}catch(e){}
}
function unlock(forPanel){ui.panelUnlock=!!forPanel;if(document.exitPointerLock&&document.pointerLockElement)document.exitPointerLock()}
function pause(){
 if(ui.state!=='play')return;
 ui.state='pause';$('#pause').hidden=false;
 for(const k in inp.keys)inp.keys[k]=false;inp.mouseDown=false;inp.touchAct=false;
}
function resume(viaKey){
 ui.state='play';$('#pause').hidden=true;ui.noPauseUntil=performance.now()+600;
 /* Esc ile devam: kilidi tuş bırakılınca al; yoksa tarayıcının kendi Esc işlemi kilidi hemen kaldırır */
 if(viaKey)ui.relock=true;else lock();
}
function closeOverlay(){
 if(HG.extClose&&HG.extClose())return true;
 if(!$('#gd').hidden){HG.toggleGuide(false);return true}
 if(!$('#trade').hidden){HG.closeTrade();return true}
 if(!$('#jr').hidden){HG.toggleJournal(false);return true}
 if(!$('#bigmap').hidden){HG.toggleMap(false);return true}
 if(!$('#panel').hidden){HG.togglePanel(false);return true}
 return false;
}

const clampMv=v=>v>180?180:v<-180?-180:v;
function setupInput(){
 ui.touch=matchMedia('(pointer:coarse)').matches;
 /* klavye */
 addEventListener('keydown',e=>{
  HG.initAudio();
  if(e.code==='Tab'||e.code==='Space'||e.code.startsWith('Arrow')||HG.keyIs('qsave',e.code))e.preventDefault();
  if(e.repeat)return;
  inp.keys[e.code]=true;
  if(ui.state==='menu')return;
  if(e.code==='Escape'){
   if(ui.state==='dead')return;
   if(ui.state==='play'&&overlayOpen()){closeOverlay();ui.relock=true;return}
   /* Bu Esc bir pencereyi kapatıyorsa duraklatma menüsü açılmaz (karar bir kare sonra verilir) */
   const wasOpen=anyWindow();
   setTimeout(()=>{
    if(wasOpen||anyWindow())return;
    if(ui.state==='play')pause();else if(ui.state==='pause')resume(true);
   },0);
   return;
  }
  if(ui.state!=='play')return;
  const K=HG.keyIs;
  if(HG.cfg.sprintT&&K('sprint',e.code))G.sprintOn=!G.sprintOn;
  if(K('inv',e.code))HG.togglePanel(undefined,'inv');                 /* Envanter ve Üretim ayrı ekranlardır; açıkken diğer tuş ekranı değiştirir */
  else if(K('craft',e.code))HG.togglePanel(undefined,'craft');
  else if(K('use',e.code))HG.useHeld('key');
  else if(K('place',e.code))HG.placeHeld();
  else if(K('map',e.code))HG.toggleMap();
  else if(K('jr',e.code))HG.toggleJournal();
  else if(K('guide',e.code))HG.toggleGuide();
  else if(K('qsave',e.code))HG.manualSave(true);
  else if(K('drop',e.code))HG.dropOne();
  else if(HG.insaKey&&HG.insaKey(e.code)){}                          /* İnşa Planı / Çekiç kısayolları (R: döndür, T: pipet) */
  else if(K('sort',e.code))HG.sortInv();
  else if(K('mute',e.code)){ui.mute=!ui.mute;HG.toast(ui.mute?'Ses kapalı.':'Ses açık.')}
  else if(/^Digit[1-8]$/.test(e.code)){G.sel=+e.code.slice(5)-1;ui.dirty=true;HG.snd('ui')}
 });
 addEventListener('keyup',e=>{inp.keys[e.code]=false;if(e.code==='Escape'&&ui.relock){ui.relock=false;if(ui.state==='play')lock()}});
 addEventListener('blur',()=>{for(const k in inp.keys)inp.keys[k]=false;inp.mouseDown=false;inp.touchAct=false});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&ui.state==='play')HG.save()});
 addEventListener('beforeunload',()=>HG.save());
 addEventListener('resize',()=>Scene.resize());

 /* fare kilidi durumu: kilit kalkarsa (Esc) oyun duraklar */
 document.addEventListener('pointerlockchange',()=>{
  ui.locked=document.pointerLockElement===cvs;
  if(!ui.locked){
   if(ui.state==='play'&&!overlayOpen()&&!ui.panelUnlock&&performance.now()>(ui.noPauseUntil||0))pause();
   ui.panelUnlock=false;
  }
 });
 /* bazı tarayıcılarda imleç kilidi anında dev sıçrama değerleri üretir: tek hareket sınırlandırılır */
 document.addEventListener('mousemove',e=>{if(!ui.locked)return;if(HG.radialOn&&HG.radialOn()){HG.radialMove(e.movementX,e.movementY);return}Scene.look(clampMv(e.movementX)*.0022,clampMv(e.movementY)*.0022)});

 /* fare tuşları (tuval) */
 cvs.addEventListener('pointerdown',e=>{
  HG.initAudio();if(ui.state!=='play')return;
  if(e.pointerType==='touch'){startLook(e);return}
  if(!ui.locked){lock();return}
  if(e.button===2){if(HG.radialOpen&&HG.radialOpen())return;HG.useHeld('mouse');return}
  if(e.button===0){inp.mouseDown=true;HG.onActPress()}
 });
 const up=e=>{if(e.button===0||e.type==='pointercancel')inp.mouseDown=false;if((e.button===2||e.type==='pointercancel')&&HG.radialClose)HG.radialClose(e.type!=='pointercancel');endLook(e)};
 cvs.addEventListener('pointerup',up);cvs.addEventListener('pointercancel',up);
 cvs.addEventListener('contextmenu',e=>e.preventDefault());
 cvs.addEventListener('wheel',e=>{if(ui.state!=='play')return;e.preventDefault();if((e.ctrlKey||e.shiftKey)&&HG.insaWheel&&HG.insaWheel((e.deltaY||e.deltaX)>0?1:-1,e.shiftKey&&!e.ctrlKey))return;G.sel=(G.sel+(e.deltaY>0?1:HOT-1))%HOT;ui.dirty=true;HG.snd('ui')},{passive:false});

 /* dokunmatik bakış: ekranın boş yerinde sürükleme */
 let lid=null,lx=0,ly=0;
 function startLook(e){if(lid!==null)return;lid=e.pointerId;lx=e.clientX;ly=e.clientY;try{cvs.setPointerCapture(lid)}catch(x){}}
 function endLook(e){if(e.pointerId===lid)lid=null}
 cvs.addEventListener('pointermove',e=>{if(e.pointerId===lid){Scene.look((e.clientX-lx)*.006,(e.clientY-ly)*.006);lx=e.clientX;ly=e.clientY}});

 /* envanter ve hızlı erişim tıklamaları */
 let swallow=false;
 const moveSlot=(from,to)=>{
  if(from===to)return;
  const a=G.inv[from],b=G.inv[to];
  if(a&&b&&a.id===b.id&&HG.IT[a.id].s>1){const k=Math.min(HG.IT[a.id].s-b.n,a.n);b.n+=k;a.n-=k;if(a.n<=0)G.inv[from]=null}
  else{G.inv[from]=b;G.inv[to]=a}
 };
 const clickSlot=i=>{
  if(swallow)return;
  if(!$('#panel').hidden){
   if(ui.picked===null){if(G.inv[i])ui.picked=i}
   else{
    moveSlot(ui.picked,i);
    ui.picked=null;
   }
   if(i<HOT&&G.inv[i])G.sel=i;
  }else if(i<HOT)G.sel=i;
  ui.dirty=true;
 };
 for(const sel of ['#grid','#hot']){
  const el=$(sel);
  el.addEventListener('click',e=>{const s=e.target.closest('.slot');if(s)clickSlot(+s.dataset.i)});
  el.addEventListener('contextmenu',e=>{
   e.preventDefault();const s=e.target.closest('.slot');if(!s)return;
   const i=+s.dataset.i;
   if(i<HOT){G.sel=i;HG.useHeld('mouse')}
   else if(G.inv[i]&&HG.IT[G.inv[i].id].food){const o=G.sel;G.sel=i;HG.useHeld('mouse');G.sel=o}
   ui.dirty=true;
  });
  el.addEventListener('mouseover',e=>{const s=e.target.closest('.slot');if(!s||sel!=='#grid')return;const v=G.inv[+s.dataset.i];$('#info').innerHTML=v?`<b>${HG.IT[v.id].n}</b>${HG.IT[v.id].d?'<br>'+HG.IT[v.id].d:''}`:''});
 }

 /* sürükle-bırak: kutular arası taşıma, panelin dışına bırakınca yere atma */
 let drag=null,ghostEl=null;
 const slotIdx=(x,y)=>{const e=document.elementFromPoint(x,y),s=e&&e.closest('.slot');return s&&(s.closest('#grid')||s.closest('#hot'))?+s.dataset.i:-1};
 const endDrag=()=>{if(ghostEl){ghostEl.remove();ghostEl=null}if(drag&&drag.moved){ui.dragFrom=null;ui.dirty=true}drag=null};
 for(const sel of ['#grid','#hot']){
  $(sel).addEventListener('pointerdown',e=>{
   if($('#panel').hidden||(e.pointerType==='mouse'&&e.button!==0))return;
   const s=e.target.closest('.slot');if(!s)return;
   const i=+s.dataset.i;if(!G.inv[i])return;
   drag={i,x:e.clientX,y:e.clientY,moved:false};
  });
 }
 document.addEventListener('pointermove',e=>{
  if(!drag)return;
  if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>6&&G.inv[drag.i]){
   drag.moved=true;ui.picked=null;ui.dragFrom=drag.i;ui.dirty=true;
   ghostEl=document.createElement('div');ghostEl.id='dragghost';
   ghostEl.innerHTML='<img src="'+HG.ICON[G.inv[drag.i].id]+'" alt="">'+(G.inv[drag.i].n>1?'<span>'+G.inv[drag.i].n+'</span>':'');
   document.body.appendChild(ghostEl);
  }
  if(ghostEl){ghostEl.style.left=e.clientX+'px';ghostEl.style.top=e.clientY+'px'}
 });
 document.addEventListener('pointerup',e=>{
  if(!drag)return;
  const d=drag;
  if(!d.moved){drag=null;return}
  const t=slotIdx(e.clientX,e.clientY),over=document.elementFromPoint(e.clientX,e.clientY);
  swallow=true;setTimeout(()=>{swallow=false},0);
  if(t>=0)moveSlot(d.i,t);
  else if(!(over&&over.closest('#pbox')))HG.dropSlot(d.i);
  endDrag();ui.dirty=true;
 });
 document.addEventListener('pointercancel',endDrag);
 $('#recipes').addEventListener('click',e=>{const b=e.target.closest('button[data-r]');if(b){HG.craft(+b.dataset.r);HG.renderRecipes()}});
 $('#close').onclick=()=>HG.togglePanel(false);
 $('#sortInv').onclick=()=>HG.sortInv();
 $('#panel').addEventListener('pointerdown',e=>{if(e.target===$('#panel'))HG.togglePanel(false)});

 /* menü düğmeleri */
 $('#bNew').onclick=()=>{HG.initAudio();if(HG.worldDialog)HG.worldDialog.open();else HG.startGame(false)};     /* Yeni Oyun: önce Dünya Oluştur penceresi (js/oyun/menu.js) */
 $('#bCont').onclick=()=>{HG.initAudio();HG.startGame(true)};
 {const bd=$('#bDeadMenu');if(bd)bd.onclick=()=>location.reload()}                  /* ölüm ekranı: Ana menüye dön */
 $('#bRes').onclick=()=>resume(false);
 $('#bMenu').onclick=()=>{HG.save();location.reload()};

 /* dokunmatik düğmeler */
 const joyEl=$('#joy'),knob=joyEl.querySelector('i');let jid=null;
 const jset=e=>{
  const r=joyEl.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  let dx=(e.clientX-cx)/(r.width/2),dy=(e.clientY-cy)/(r.height/2);const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m}
  inp.joy.x=Math.abs(dx)<.15?0:dx;inp.joy.y=Math.abs(dy)<.15?0:dy;knob.style.transform=`translate(${dx*34}px,${dy*34}px)`;
 };
 joyEl.addEventListener('pointerdown',e=>{jid=e.pointerId;joyEl.setPointerCapture(jid);jset(e)});
 joyEl.addEventListener('pointermove',e=>{if(e.pointerId===jid)jset(e)});
 const jend=e=>{if(e.pointerId===jid){jid=null;inp.joy.x=inp.joy.y=0;knob.style.transform=''}};
 joyEl.addEventListener('pointerup',jend);joyEl.addEventListener('pointercancel',jend);
 const tA=$('#tA');
 tA.addEventListener('pointerdown',e=>{HG.initAudio();inp.touchAct=true;HG.onActPress();tA.setPointerCapture(e.pointerId)});
 tA.addEventListener('pointerup',()=>inp.touchAct=false);tA.addEventListener('pointercancel',()=>inp.touchAct=false);
 $('#tB').addEventListener('pointerdown',()=>HG.placeHeld());
 $('#tJ').addEventListener('pointerdown',e=>{inp.touchJump=true;e.target.setPointerCapture(e.pointerId)});
 $('#tJ').addEventListener('pointerup',()=>inp.touchJump=false);$('#tJ').addEventListener('pointercancel',()=>inp.touchJump=false);
 $('#tE').addEventListener('pointerdown',()=>HG.useHeld('touch'));
 $('#tI').addEventListener('pointerdown',()=>HG.togglePanel());
}
Object.assign(HG,{lock,unlock,pause,resume,setupInput,overlayOpen});
})();
