/* Hunger 3D - oyun durumu: yeni oyun, kaydetme, yükleme, başlatma */
(()=>{
'use strict';
const {W,SLOTS,O,SAVE,G,ui,A,look,genWorld,Scene}=HG;
const $=HG.$;

/* G nesnesi hiç değişmez; yeni oyunda içi sıfırlanıp yeniden doldurulur */
function newState(seed){
 const w=genWorld(seed);
 for(const k in G)delete G[k];
 Object.assign(G,{seed,tile:w.tile,obj:w.obj,hgt:w.hgt,drops:[],animals:HG.makeAnimals(w.animals),pz:undefined,vz:0,air:false,shore:w.shore,px:w.sx,py:w.sy,fx:0,fy:-1,objDirty:true,tg:null,
  hp:100,hun:92,thr:92,warm:100,stam:100,san:100,bleed:0,torchFuel:360,torchLit:false,tired:false,arrows:[],clock:0,inv:Array(SLOTS).fill(null),sel:0,flags:{},timers:[],
  villages:w.villages,camps:w.camps||[],npcs:HG.makeNpcs(w.villages),sheltered:false,shelterCheck:0,shelterT:0,moving:false,walk:0,nearFire:false,cause:'',saveT:0,sprint:false});
 HG.progInit();
 return G;
}
function saveExists(){try{const s=JSON.parse(localStorage.getItem(SAVE));return !!(s&&s.v===7)}catch(e){return false}}
function save(){
 if(!G.obj||ui.state==='dead'||ui.state==='menu')return;
 try{
  let s='';const o=G.obj;for(let i=0;i<o.length;i++)s+=String.fromCharCode(o[i]);
  localStorage.setItem(SAVE,JSON.stringify({v:7,prog:HG.progSave(),camps:(G.camps||[]).map(c=>c.open?1:0),timers:G.timers,npcs:HG.npcSave(),seed:G.seed,px:G.px,py:G.py,yaw:look.yaw,hp:G.hp,hun:G.hun,thr:G.thr,warm:G.warm,stam:+G.stam.toFixed(1),san:+G.san.toFixed(1),bleed:+(G.bleed||0).toFixed(1),torchFuel:+G.torchFuel.toFixed(1),clock:G.clock,inv:G.inv,sel:G.sel,flags:G.flags,drops:G.drops,animals:G.animals.filter(a=>!a.gone&&!HG.ANIMAL[a.t].foe).map(a=>({t:a.t,x:+a.x.toFixed(2),z:+a.z.toFixed(2),hp:a.hp,yaw:+a.yaw.toFixed(2),sheared:a.sheared?1:0,dead:a.dying&&!a.gone?1:0})),obj:btoa(s)}));
 }catch(e){}
}
/* ---- yüklenme ekranı ---- */
const TIPS=['Ateş yakmak için odun ve kıvılcım gerekir; geceleri ateş en güvenli dostundur.','Kurtlar gece sürü hâlinde dolaşır. Işıktan ve ateşten çekinirler.','Köylülerle ticaret yaparak altın kazanabilir, görev tamamlayarak ödül alabilirsin.','Kamplardaki sandıklarda hem değerli eşya hem de adanın geçmişini anlatan notlar bulunur.','Her 5. gece Kan Ayı doğar: düşmanlar çoğalır ve gökyüzü kızıllaşır.','Uyku tulumu veya yatakla geceyi atlatabilirsin; yalnızca güvenli bir barınakta uyu.','Yüksekten düşmek can götürür; uçurumlardan atlamadan önce yüksekliği ölç.','Suya düşen eşyalar bir süre yüzer, sonra derin suda batar.','Gelişim ekranında (K) kazandığın puanları yeteneklere harcayabilirsin.','Rüzgâr yönü ve yağmur oka da etki eder; uzak hedeflerde hafifçe yukarı nişan al.'];
let tipI=0,tipT=0;
function ldOpen(title){
 const e=$('#load');if(!e)return;e.hidden=false;e.classList.remove('out');
 $('#loadT').textContent=title||'Yükleniyor';$('#loadGo').hidden=true;$('#loadBar').parentNode.hidden=false;
 tipI=(Math.random()*TIPS.length)|0;$('#loadTip').textContent=TIPS[tipI];
 clearInterval(tipT);tipT=setInterval(()=>{tipI=(tipI+1)%TIPS.length;$('#loadTip').textContent=TIPS[tipI]},4200);
 ldSet(0,'');
}
function ldSet(p,txt){const b=$('#loadBar');if(!b)return;b.style.width=Math.round(p*100)+'%';$('#loadPct').textContent=Math.round(p*100)+'%';if(txt!==undefined)$('#loadSub').textContent=txt}
function ldClose(){
 const e=$('#load');if(!e)return;clearInterval(tipT);e.classList.add('out');setTimeout(()=>{e.hidden=true},500);
}
const nap=()=>new Promise(r=>setTimeout(r,20));
async function startGame(load){
 if(HG.busy)return;
 HG.busy=true;
 for(const id of ['#menu','#dead','#pause'])$(id).hidden=true;
 ldOpen(load?'Kayıt yükleniyor':'Yeni oyun hazırlanıyor');
 await nap();
 let s=null;
 if(load){try{s=JSON.parse(localStorage.getItem(SAVE))}catch(e){}}
 if(s&&s.v===7){
  ldSet(.1,'Dünya yeniden kuruluyor');await nap();
  newState(s.seed);
  ldSet(.25,'Kayıt işleniyor');await nap();
  try{
   const b=atob(s.obj);
   if(b.length===HG.W*HG.H){for(let i=0;i<b.length;i++){let o=b.charCodeAt(i);if(o===O.BUSH0)o=O.BUSH;if(o===O.PALM0)o=O.PALM;G.obj[i]=o}}
  }catch(e){}
  Object.assign(G,{px:s.px,py:s.py,hp:s.hp,hun:s.hun,thr:s.thr,warm:s.warm,clock:s.clock,inv:s.inv,sel:s.sel||0,flags:s.flags||{},
   stam:s.stam===undefined?100:s.stam,san:s.san===undefined?100:s.san,bleed:s.bleed||0,torchFuel:s.torchFuel===undefined?360:s.torchFuel});
  G.drops=(Array.isArray(s.drops)?s.drops:[]).filter(d=>d&&HG.IT[d.id]&&d.n>0).map(d=>({id:d.id,n:d.n,x:d.x,y:d.y,z:d.z,vx:0,vz:0,vy:0,age:5,rest:false}));
  if(Array.isArray(s.animals))G.animals=HG.makeAnimals(s.animals);
  if(Array.isArray(s.timers))G.timers=s.timers.filter(t=>t&&t.i>=0&&t.i<HG.W*HG.H);
  HG.npcLoad(s.npcs);HG.progLoad(s.prog);
  if(Array.isArray(s.camps))s.camps.forEach((o,i)=>{if(G.camps[i])G.camps[i].open=!!o});
  look.yaw=s.yaw||0;look.pitch=0;
  if(!Array.isArray(G.inv)||G.inv.length!==SLOTS)G.inv=Array(SLOTS).fill(null);
 }else{
  ldSet(.1,'Ada üretiliyor');await nap();
  newState((Math.random()*2147483647)|0);
  look.yaw=0;look.pitch=-.1;
 }
 ldSet(.35,'Harita çiziliyor');await nap();
 HG.buildMini();
 await Scene.buildAsync(G,p=>ldSet(.4+p*.45,'Sahne kuruluyor'));
 ldSet(.9,'Gölgelendiriciler derleniyor');await nap();
 Scene.warmup();
 ldSet(1,'Hazır');
 /* oyuna giriş bir kullanıcı tıklamasıyla yapılır: imleç kilidi ve ses için gerekli */
 const go=$('#loadGo');$('#loadBar').parentNode.hidden=true;go.hidden=false;go.focus();
 await new Promise(r=>{go.onclick=r});
 go.hidden=true;
 Scene.setMode('play');
 ui.state='play';ui.picked=null;ui.dirty=true;A.key='';A.p=0;A.mem={};A.memKey=null;
 for(const id of ['#menu','#dead','#pause'])$(id).hidden=true;
 for(const id of ['#hud','#clock','#goal','#mini','#hot','#cross'])$(id).hidden=false;
 if(ui.touch)$('#touch').hidden=false;
 if(!load)HG.toast('Adaya vardın. Bir ağaca bak, sol tuşu basılı tutarak odun topla.');
 HG.busy=false;ldClose();
 HG.lock();
 save();
}
Object.assign(HG,{newState,saveExists,save,startGame,ldOpen,ldSet,ldClose});
})();
