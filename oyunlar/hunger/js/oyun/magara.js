/* Hunger 3D - mağaralar: giriş/çıkış (yüzey ile mağara katı arasında dünya değişimi), keşif, ipuçları, kayıt uyumu.
   Mağara, girişin tohumundan her seferinde aynı düzenle yeniden üretilir; yalnızca sandığın açık olması kalıcıdır. */
(()=>{
'use strict';
const {W,H,G,ui,look,Scene,sc}=HG;
/* yüzeyden saklanıp mağarada boşaltılan alanlar */
const SURF=['tile','obj','hgt','shore','animals','drops','timers','villages','camps','npcs','arrows','caves','dmg','explore','nearCamp','nearNpc','nearDrop'];
const nap=()=>new Promise(r=>setTimeout(r,30));
const CELL=4,CW=Math.ceil(W/CELL),CH=Math.ceil(H/CELL);

/* girişin önündeki güvenli dönüş noktası ve bakış yönü */
function frontOf(c){
 const q=c.q|0,cq=Math.round(Math.cos(q*Math.PI/2)),sq=Math.round(Math.sin(q*Math.PI/2));
 return {x:c.x+.5+sq*2.6,y:c.y+.5+cq*2.6,yaw:Math.atan2(-sq,-cq)};
}
function nearCave(){
 G.nearCave=null;
 if(G.cave){
  const e=G.cave.lv.exit;
  if(Math.hypot(G.px-(e.x+.5),G.py-(e.y+.5))<3.4)G.nearCave={exit:true};
  return;
 }
 let best=3.6;
 for(const c of G.caves||[]){
  const d=Math.hypot(G.px-(c.x+.5),G.py-(c.y+.5));
  if(d<best){best=d;G.nearCave=c}
 }
}
function updateCaves(dt){
 nearCave();
 if(G.cave){
  G.cave.t=(G.cave.t||0)+dt;
  if(G.cave.t>25&&!G.flags['cvsurv']){G.flags['cvsurv']=1;HG.flag('cavedeep')}
  return;
 }
 for(const c of G.caves||[]){
  if(Math.hypot(G.px-(c.x+.5),G.py-(c.y+.5))<16&&!G.flags['cave'+c.id]){
   G.flags['cave'+c.id]=1;HG.toast('Bir mağara girişi keşfedildi.');HG.xpGain(8);
  }
 }
}
async function swap(title,fn,spawn){
 if(HG.busy||ui.state!=='play')return false;
 HG.busy=true;
 for(const k in HG.inp.keys)HG.inp.keys[k]=false;HG.inp.mouseDown=false;
 HG.ldOpen(title);await nap();
 HG.ldSet(.2,'Dünya değişiyor');await nap();
 fn();
 G.pz=undefined;G.vz=0;G.air=false;G.pvx=0;G.pvy=0;G.tg=null;G.shelterCheck=0;G.objDirty=false;if(G.oc)G.oc.length=0;
 HG.ldSet(.3,'Sahne kuruluyor');
 await Scene.buildAsync(G,p=>HG.ldSet(.3+p*.55,'Sahne kuruluyor'));
 HG.buildMini();
 HG.ldSet(.92,'Gölgelendiriciler derleniyor');await nap();
 Scene.warmup();
 HG.ldSet(1,'Hazır');await nap();
 HG.busy=false;HG.ldClose();
 try{HG.lock()}catch(e){}
 return true;
}
function enter(c){
 if(G.cave||!c||c.exit)return false;
 return swap('Mağaraya giriliyor',()=>{
  const lv=HG.genCave(c.seed,c.tier),sv={};
  for(const k of SURF)sv[k]=G[k];
  sv.px=G.px;sv.py=G.py;sv.yaw=look.yaw;sv.pitch=look.pitch;
  const fr=frontOf(c);
  if(HG.canStandAt&&HG.canStandAt(fr.x,fr.y)){sv.px=fr.x;sv.py=fr.y;sv.yaw=fr.yaw}
  for(const f of lv.foes)f.hp=undefined;
  const camps=lv.camps.map(k=>Object.assign({},k,{id:1000+c.id,open:!!c.vault}));
  Object.assign(G,{tile:lv.tile,obj:lv.obj,hgt:lv.hgt,shore:lv.shore,animals:HG.makeAnimals(lv.foes),
   drops:lv.drops.map(d=>Object.assign({},d)),timers:[],villages:[],camps,npcs:[],arrows:[],caves:[],dmg:{},explore:new Uint8Array(CW*CH),
   nearCamp:null,nearNpc:null,nearDrop:null,cave:{id:c.id,tier:c.tier,lv,surf:sv,t:0},px:lv.sx,py:lv.sy,sheltered:true});
  c.entered=(c.entered||0)+1;G.stats.caves=(G.stats.caves||0)+1;
  look.yaw=0;look.pitch=-.05;
  HG.flag('cave');
 });
}
function leave(){
 if(!G.cave)return false;
 return swap('Dışarı çıkılıyor',()=>{
  const cv=G.cave,sv=cv.surf,c=sv.caves[cv.id];
  if(c&&G.camps[0]&&G.camps[0].open)c.vault=true;
  for(const k of SURF)G[k]=sv[k];
  G.cave=null;
  G.px=sv.px;G.py=sv.py;look.yaw=sv.yaw;look.pitch=sv.pitch||0;
  G.sheltered=false;
 });
}
function useCave(){
 const n=G.nearCave;if(!n||ui.state!=='play'||HG.busy)return false;
 if(n.exit)leave();else enter(n);
 return true;
}
/* kayıt: mağaradayken yüzey görünümüyle (girişin önünde) kaydedilir */
function withSurface(fn){
 if(!G.cave)return fn();
 const cv=G.cave,sv=cv.surf,keep={};
 const c=sv.caves[cv.id];if(c&&G.camps[0]&&G.camps[0].open)c.vault=true;
 for(const k of SURF)keep[k]=G[k];
 const bk={px:G.px,py:G.py,sh:G.sheltered};
 for(const k of SURF)G[k]=sv[k];
 G.px=sv.px;G.py=sv.py;
 try{return fn()}finally{for(const k of SURF)G[k]=keep[k];G.px=bk.px;G.py=bk.py;G.sheltered=bk.sh}
}
function resetCaveState(){G.cave=null}
Object.assign(HG,{enterCave:enter,leaveCave:leave,useCave,updateCaves,withSurface,frontOf,CAVE_CELL:CELL,CAVE_CW:CW,CAVE_CH:CH});
})();
