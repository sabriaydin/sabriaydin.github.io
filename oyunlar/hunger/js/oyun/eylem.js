/* Hunger 3D - eylemler: nişan alınan şeyi kesme, kazma, su içme, balık, yerleştirme, yeme */
(()=>{
'use strict';
const {W,T,O,PLACE_ITEM,NODE,POWER,NAMES,G,ui,A,inp,Scene,clamp,count,add,take,gain,held,setObj,flag}=HG;

/* ---- Nişan alınan hedefin ne olduğu ve ne kadar süreceği ---- */
function toolTier(kind){const h=held();return h&&h.it.tool===kind?h.it.tier:0}
/* Döner: {kind,need,hint,name} veya {block:'mesaj',name} veya null */
function foodBlock(f){
 const needH=f.h>0&&G.hun<=100-f.h*.5,needT=f.t>=8&&G.thr<=100-f.t*.5;
 if(needH||needT)return null;
 if(f.h>0&&f.t>=8)return 'Aç ve susuz değilsin.';
 return f.h>0?'Aç değilsin.':'Susuzluk yok.';
}
function actionFor(tg){
 const h=held();
 /* su altı: deniz dibine bakıp midye, yosun ve inci toplanır */
 if(G.head&&!G.cave&&HG.look.pitch<-.2&&G.pz-Scene.groundY(G.px,G.py)<1.9)return {kind:'dive',need:1.7,hint:'Basılı tut: deniz dibini karıştır',name:'Deniz dibi'};
 if(G.head&&h&&(h.it.food||h.it.heal))return {block:'Su altında kullanılamaz.',name:h.it.n};
 /* elde yiyecek/içecek varsa sol tık basılı tutulunca yenir */
 if(h&&h.it.food){
  const b=foodBlock(h.it.food);
  return b?{block:b,name:h.it.n}:{kind:'eat',need:1.1,hint:'Basılı tut: '+(h.it.food.h===0?'iç':'ye'),name:h.it.n};
 }
 /* yay: basılı tut-bırak mantığı silah.js içindedir */
 if(h&&h.it.tool==='bow')return {kind:'bow',need:0,hint:count('arrow')?'Basılı tut: ger · bırak: ateşle':'Ok yok',name:'Yay · '+count('arrow')+' ok'};
 /* bandaj */
 if(h&&h.it.heal)return (G.bleed>0||G.hp<95)?{kind:'heal',need:1.6,hint:'Basılı tut: yarayı sar',name:h.it.n}:{block:'Yaralı değilsin.',name:h.it.n};
 if(!tg)return null;
 /* hayvan */
 if(tg.an){
  const an=tg.an,def=HG.ANIMAL[an.t];
  if(an.dying)return null;
  const name=def.n+' · %'+Math.ceil(an.hp);
  if(h&&h.k==='bottle'&&def.milk){
   return G.clock<an.milkAt?{block:'Süt vermiyor, biraz bekleyin.',name:def.n}:{kind:'milk',need:2,hint:'Basılı tut: süt sağ',name};
  }
  if(h&&h.k==='shears'&&def.shear){
   return an.sheared?{block:'Yünü yeni kırkıldı.',name:def.n}:{kind:'shear',need:1.6,hint:'Basılı tut: yün kırk',name};
  }
  return {kind:'hit',need:1,hint:'Basılı tut: vur',name};
 }
 const i=tg.y*W+tg.x,o=G.obj[i],tl=G.tile[i];
 if(o){
  const name=NAMES[o]||'Nesne',nd=NODE[o];
  if(nd){
   const tier=nd.tool?toolTier(nd.tool):0;
   if(tier<nd.req)return {block:nd.msg||'Daha iyi bir alet gerekir.',name};
   return {kind:'node',need:nd.hp/(nd.tool?POWER[tier]:1),hint:'Basılı tut: topla',name};
  }
  if(PLACE_ITEM[o])return {kind:'pickup',need:1,hint:'Basılı tut: geri al',name};
  return null;
 }
 if(tl===T.POND){
  if(h&&h.k==='rod')return {kind:'fish',need:3,hint:'Basılı tut: balık tut',name:'Tatlı su'};
  if(h&&h.k==='bottle')return {kind:'fill',need:.8,hint:'Basılı tut: şişeyi doldur',name:'Tatlı su'};
  if(G.thr>=99.5)return {block:'Susuzluk yok.',name:'Tatlı su'};
  return {kind:'drink',need:1.1,hint:'Basılı tut: su iç',name:'Tatlı su'};
 }
 if(tl<=T.SHAL){
  if(h&&h.k==='rod')return {kind:'fish',need:3,hint:'Basılı tut: balık tut',name:'Deniz'};
  return {block:'Deniz suyu tuzludur, içilemez.',name:'Deniz (tuzlu su)'};
 }
 if(tl===T.SAND)return {kind:'dig',need:.9,hint:'Basılı tut: kum kaz',name:'Kum'};
 return null;
}

/* ---- Sürekli eylem (sol tık basılı) ---- */
let lastMsg=0;
function msgOnce(m){const n=performance.now();if(n-lastMsg>1800){HG.toast(m);lastMsg=n}}
/* Yarıda bırakılan toplama ilerlemesi hatırlanır: aynı nesneye dönülünce kaldığı yerden sürer */
const MEMKINDS={node:1,pickup:1};
function saveProgress(){
 if(A.key&&A.p>0&&A.memKind&&A.memKey)A.mem[A.memKey]=A.p;
}
function stopAction(){saveProgress();A.key='';A.p=0;A.memKey=null;A.eatLock=false}
function stepAction(dt){
 const tg=G.tg,act=actionFor(tg);
 if(!act){stopAction();return}
 if(act.block){msgOnce(act.block);stopAction();return}
 if(act.kind==='eat'){
  if(A.eatLock)return;
  if(A.key!=='eat'){saveProgress();A.key='eat';A.p=0;A.need=act.need;A.memKey=null}
  A.p+=dt;
  if(A.p>=A.need){eatHeld();A.p=0;A.key='';A.eatLock=true}
  return;
 }
 const kind=act.kind;
 if(kind==='bow')return;
 if(kind==='heal'){
  if(A.key!=='heal'){saveProgress();A.key='heal';A.p=0;A.need=act.need;A.memKey=null}
  A.p+=dt;
  if(A.p>=A.need){HG.useMedical();A.p=0;A.key=''}
  return;
 }
 if(kind==='hit'){
  const key='hit,'+tg.an.id;
  if(key!==A.key){saveProgress();A.key=key;A.p=0;A.tick=0;A.memKey=null}
  A.tick-=dt;
  if(A.tick<=0){A.tick=.55*(G.tired?1.6:1);const sw=HG.swing();HG.snd('pick');const z=HG.hitAnimal(tg.an,HG.weaponDamage()*sw,tg.hx!==undefined?{x:tg.hx,y:tg.hy,z:tg.hz}:null);HG.hitMarker(tg.an.hp<=0,z)}
  return;
 }
 if(kind==='milk'||kind==='shear'){
  const key=kind+','+tg.an.id;
  if(key!==A.key){saveProgress();A.key=key;A.p=0;A.need=act.need;A.memKey=null;A.memKind=false}
  A.p+=dt;
  if(A.p<A.need)return;
  A.p=0;
  if(kind==='milk'){
   if(count('bottle')){take('bottle',1);add('milk',1);HG.snd('drink');HG.feed('+1 '+HG.IT.milk.n);HG.snd('milk');tg.an.milkAt=G.clock+150;flag('milked')}
  }else{
   if(gain('wool',2+(Math.random()*2|0))){HG.snd('shear');tg.an.sheared=true;tg.an.shearAt=G.clock+240}
  }
  A.key='';
  return;
 }
 const i=tg.y*W+tg.x,o=G.obj[i],tl=G.tile[i];
 const key=kind+','+tg.x+','+tg.y+','+o;
 if(key!==A.key){
  saveProgress();
  A.key=key;A.tick=0;
  A.memKind=!!MEMKINDS[kind];A.memKey=A.memKind?key:null;
  A.p=A.memKind&&A.mem[key]?A.mem[key]:0;
  A.need=kind==='fish'?3+Math.random()*4:act.need;
 }
 A.p+=dt;A.tick-=dt;
 /* kademeli parçalanma: kaya ve madenlerde ilerlemeye göre görünüm değişir */
 if(kind==='node'&&(o===O.ROCK||o===O.COAL||o===O.COPPER||o===O.IRON)){
  const fr=Math.min(1,A.p/A.need),st=fr<.34?0:fr<.67?1:2;
  if(A.stI!==i){A.stI=i;A.st=st}
  else if(st>A.st&&fr<1){A.st=st;HG.snd('crack',{x:tg.x+.5,z:tg.y+.5})}
  Scene.setDamage(i,fr);
 }
 if(A.tick<=0&&kind!=='drink'&&kind!=='fish'&&kind!=='fill'&&kind!=='dive'){
  A.tick=.38;A.hitI=i;A.hitT=.18;HG.snd(o===O.TREE||o===O.PALM||o===O.BUSH?'hit':o===O.ROCK?'rock':(o===O.COAL||o===O.COPPER||o===O.IRON)?'ore':tl===T.SAND?'step_sand':'pick');
  const hy=tg.hy!==undefined?tg.hy:1;
  const big=o===O.ROCK||o===O.COAL||o===O.COPPER||o===O.IRON;
  Scene.burst(tg.hx!==undefined?tg.hx:tg.x+.5,hy,tg.hz!==undefined?tg.hz:tg.y+.5,o===O.TREE||o===O.BUSH?0x4a9440:o===O.PALM?0x3f8a3a:tl===T.SAND?0xd9c58b:o===O.COAL?0x222226:o===O.COPPER?0xc8743a:o===O.IRON?0xc2a287:0x9a9a9a,big?7:4);
 }
 if(A.p<A.need)return;
 A.p=0;
 if(kind==='node'){
  const nd=NODE[o],[id,n]=nd.give();
  if(!gain(id,n))return;
  if(HG.perk('gath')&&Math.random()<.2*HG.perk('gath'))gain(id,1);
  delete A.mem[key];if(G.dmg)delete G.dmg[i];
  if(o===O.TREE){Scene.fell(tg.x,tg.y,o,G.px,G.py);HG.snd('creak',{x:tg.x+.5,z:tg.y+.5,y:3})}
  else if(o===O.ROCK||o===O.COAL||o===O.COPPER||o===O.IRON){Scene.crumble(tg.x+.5,tg.y+.5,o);HG.snd('crumble',{x:tg.x+.5,z:tg.y+.5})}
  setObj(i,nd.rm);G.shelterCheck=0;
  if(nd.regrow)G.timers.push({i,at:G.clock+nd.regrow[1]*(.8+Math.random()*.4),to:nd.regrow[0],from:nd.rm});
  A.key='';A.memKey=null;
 }else if(kind==='pickup'){
  const id=PLACE_ITEM[o];if(!gain(id,1))return;setObj(i,O.NONE);G.shelterCheck=0;delete A.mem[key];A.key='';A.memKey=null;
 }else if(kind==='drink'){
  G.thr=clamp(G.thr+12,0,100);flag('drank');HG.snd('drink');
  if(G.thr>=100){HG.toast('Susuzluk giderildi.');A.key=''}
 }else if(kind==='fill'){
  if(count('bottle')){take('bottle',1);add('wbottle',1);flag('drank');HG.snd('drink');HG.feed('Şişe dolduruldu')}
  A.key='';
 }else if(kind==='fish'){
  if(Math.random()<.78)gain('fish',1);else HG.toast('Balık kaçtı.');
  A.need=3+Math.random()*4;
 }else if(kind==='dig'){
  gain('sand',1);
 }else if(kind==='dive'){
  /* deniz dibi: sık midye ve yosun, nadiren inci */
  HG.useStam(3);
  const r=Math.random();
  if(r<.03){if(gain('pearl',1)){HG.toast('İnci buldun!');HG.xpGain(4)}}
  else if(r<.47){if(gain('shell',1)&&G.stats)G.stats.shells=(G.stats.shells||0)+1}
  else if(r<.70)gain('kelp',1);
  else if(r<.88)gain('sand',1);
  else HG.toast('Dipte işe yarar bir şey çıkmadı.');
 }
}

/* ---- Yerleştirme ---- */
function validPlace(x,y,itemKey){
 if(x<0||y<0||x>=HG.W||y>=HG.H)return false;
 const i=y*W+x,t=G.tile[i];
 if(G.obj[i]||t<T.SAND||t===T.POND)return false;
 if(Math.floor(G.px)===x&&Math.floor(G.py)===y&&HG.IT[itemKey].place!==O.DOOR)return false;
 return true;
}
/* Yerleştirme karesi: nişanın değdiği boş kare, değilse bir önceki boş kare */
function placeTarget(itemKey){
 const tg=G.tg;if(!tg)return null;
 if(!G.obj[tg.y*W+tg.x]&&validPlace(tg.x,tg.y,itemKey))return {x:tg.x,y:tg.y};
 if(tg.px>=0&&validPlace(tg.px,tg.py,itemKey))return {x:tg.px,y:tg.py};
 return null;
}
function placeHeld(){
 const h=held();if(!h||!h.it.place)return false;
 if(!G.tg){HG.toast('Yerleştirmek için yere bakın.');return false}
 const p=placeTarget(h.k);
 if(!p){HG.toast('Buraya yerleştirilemez.');return false}
 setObj(p.y*W+p.x,h.it.place);take(h.k,1);flag('placed_'+h.k);HG.snd('craft');ui.dirty=true;G.shelterCheck=0;
 return true;
}
/* Sol tık / boşluk tuşuna ilk basış */
function onActPress(){
 if(ui.state!=='play')return;
 const h=held(),tg=G.tg;
 if(h&&h.it.place&&tg&&!tg.an&&!G.obj[tg.y*W+tg.x])placeHeld();
}

/* ---- Eşya kullanma (yeme-içme) ---- */
function eatHeld(){
 const h=held();if(!h||!h.it.food)return;
 {
  const f=h.it.food;
  G.hun=clamp(G.hun+f.h,0,100);G.thr=clamp(G.thr+f.t,0,100);
  if(f.hp){G.hp=clamp(G.hp+f.hp,0,100);G.cause='Bozuk yiyecek yedin.';HG.snd('hurt');HG.toast('Çiğ yiyecek midene dokundu.')}
  take(h.k,1);if(f.ret)add(f.ret,1);
  HG.snd('eat');
  HG.addSan(f.h>=30?5:f.h>=10?1.5:.5);
 }
}
/* E ile etkileşime girilebilecek hedefler: yalnızca bakılan yöndekiler, en çok bakılan önce */
function faceCos(x,z){const dx=x-G.px,dz=z-G.py,d=Math.hypot(dx,dz);return d<.9?1:(dx*G.fx+dz*G.fy)/d}
function useCands(){
 const c=[],dr=G.nearDrop,cp=G.nearCamp,cv=G.nearCave,np=G.nearNpc;
 if(dr&&G.drops&&G.drops.includes(dr)){const f=faceCos(dr.x,dr.z);if(f>.55||Math.hypot(dr.x-G.px,dr.z-G.py)<1.3)c.push([Math.max(f,.9),'drop',HG.pickupNearest])}
 if(cp&&!cp.open){const f=faceCos(cp.x+.5,cp.y+.5);if(f>.6)c.push([f,'chest',HG.openChest])}
 if(cv){const q=cv.exit&&G.cave?G.cave.lv.exit:cv,f=faceCos(q.x+.5,q.y+.5);if(f>.6)c.push([f,'cave',HG.useCave])}
 if(np){const f=faceCos(np.x,np.z);if(f>.75)c.push([f,'npc',HG.talkNpc])}
 c.sort((a,b)=>b[0]-a[0]);
 return c;
}
function useHeld(){
 for(const c of useCands())if(c[2]())return;
 const h=held();if(!h)return;
 if(h.it.food){const b=foodBlock(h.it.food);if(b)HG.toast(b);else eatHeld();return}
 if(h.it.sleep){HG.sleep();return}
 if(h.it.heal){if(G.bleed>0||G.hp<95)HG.useMedical();else HG.toast('Yaralı değilsin.');return}
 if(h.it.place)placeHeld();
}
Object.assign(HG,{useCands,actionFor,stepAction,stopAction,validPlace,placeTarget,placeHeld,onActPress,useHeld,eatHeld});
})();
