/* Hunger 3D - eylemler: nişan alınan şeyi kesme, kazma (Rust mantığı: vuruş başına kaynak), E ile toplama, su içme, balık, yerleştirme, yeme */
(()=>{
'use strict';
const {W,T,O,PLACE_ITEM,NODE,POWER,NAMES,G,ui,A,inp,Scene,clamp,count,add,take,gain,canAdd,held,setObj,flag}=HG;

/* ---- Nişan alınan hedefin ne olduğu ve ne kadar süreceği ---- */
function toolTier(kind){const h=held();return h&&h.it.tool===kind?h.it.tier:0}
/* Toplama düzeyi: -1 elde uygun alet yok (çıplak el), 0 El Taşı, 1-3 taş/bakır/demir alet */
function gatherLv(tool){
 const h=held();if(!h)return -1;
 if(h.it.tool===tool)return h.it.tier;
 if(h.it.tool==='rock')return 0;
 return -1;
}
/* Alet düzeyine göre verim çarpanı (El Taşı, Taş, Bakır, Demir): bir düğümden çıkan toplam kaynak bu çarpanla ölçeklenir.
   Her vuruşta verilen miktar, o vuruşun düğümden götürdüğü can oranına bağlıdır; kesirli kısım düğümde birikir ve sonraki vuruşa eklenir. */
const YIELD=[.6,1,1.6,2.4];
/* Döner: {kind,need,hint,name} veya {block:'mesaj',name} veya null */
function foodBlock(f){
 const needH=f.h>0&&G.hun<=100-f.h*.5,needT=f.t>=8&&G.thr<=100-f.t*.5;
 if(needH||needT)return null;
 if(f.h>0&&f.t>=8)return 'Aç ve susuz değilsin.';
 return f.h>0?'Aç değilsin.':'Susuzluk yok.';
}
function actionFor(tg){
 const h=held();
 /* su altı: deniz dibine bakıp midye, yosun ve inci E ile toplanır */
 if(diveAim())return {hint:'[E] Deniz dibini karıştır',name:'Deniz dibi'};
 /* İnşa Planı / Çekiç: kurma ve yükseltme ipuçları insa.js içindedir */
 if(h&&(h.it.tool==='plan'||h.it.tool==='hammer'||h.it.tool==='rsdoor')&&HG.insaAction)return HG.insaAction(tg);
 {const rd=HG.rsAimDoor&&HG.rsAimDoor();if(rd)return rd}                                  /* kapı çerçevesine bakarken E: aç/kapat */
 if(G.head&&h&&(h.it.food||h.it.heal))return {block:'Su altında kullanılamaz.',name:h.it.n};
 /* elde yiyecek/içecek varsa sol tık basılı tutulunca yenir */
 if(h&&h.it.food){
  {const xh=tg&&HG.extHeldHint&&HG.extHeldHint(tg,h);if(xh)return xh}
  const b=foodBlock(h.it.food);
  return b?{block:b,name:h.it.n}:{kind:'eat',need:1.1,hint:'Basılı tut: '+(h.it.food.h===0?'iç':'ye'),name:h.it.n};
 }
 /* yay: basılı tut-bırak mantığı silah.js içindedir */
 if(h&&h.it.tool==='bow')return {kind:'bow',need:0,hint:count('arrow')?'Basılı tut: ger · bırak: ateşle':'Ok yok',name:'Yay · '+count('arrow')+' ok'};
 /* bandaj */
 if(h&&h.it.heal)return (G.bleed>0||G.hp<95)?{kind:'heal',need:1.6,hint:'Basılı tut: yarayı sar',name:h.it.n}:{block:'Yaralı değilsin.',name:h.it.n};
 if(!tg)return h&&h.it.tool==='spyglass'?{hint:'[E] veya sağ tık: yakınlaştır',name:h.it.n}:null;
 if(G.head&&!tg.an)return null;                 /* su altında yalnızca canlılara ve dibe eylem yapılır */
 /* hayvan */
 if(tg.an){
  const an=tg.an,def=HG.ANIMAL[an.t];
  if(an.dying)return null;
  const name=def.n+' · %'+Math.ceil(an.hp);
  if(an.pet&&HG.extAnimalAct){const r=HG.extAnimalAct(an,h);if(r)return r}                  /* evcil köpek: vurulmaz, E ile beslenir/yönetilir */
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
   if(nd.collect)return {hint:'[E] '+(o===O.PALM?'Hindistan cevizi topla':o===O.SHROOM?'Mantar topla':'Meyve topla'),name};
   const lv=nd.tool?gatherLv(nd.tool):0;
   if(lv<0){const xb=HG.extBare&&HG.extBare(o,i);if(xb)return xb}
   if(lv<0)return {block:nd.tool==='axe'?'Çıplak elle ağaç kesilemez. El Taşı veya balta gerekir.':nd.req>0?(nd.msg||'Bunun için kazma gerekir.'):'Çıplak elle kazılamaz. El Taşı veya kazma gerekir.',name};
   if(lv<nd.req)return {block:nd.msg||'Daha iyi bir alet gerekir.',name};
   return {kind:'node',hint:'Sol tık: '+(nd.tool==='axe'?'kes':'kaz'),name:name+' · %'+Math.max(1,Math.round(100*(1-((G.dmg&&G.dmg[i])||0))))};
  }
  {const xh=HG.extHint&&HG.extHint(tg,o,h,i);if(xh)return xh}
  if(pickupOk(o))return {hint:'[E] basılı tut: geri al',name};
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
 if(tl===T.SAND)return {hint:'[E] Kum kaz',name:'Kum'};
 if(h&&h.it.tool==='spyglass')return {hint:'[E] veya sağ tık: yakınlaştır',name:h.it.n};
 return null;
}

/* ---- Sürekli eylem (sol tık basılı) ---- */
let lastMsg=0;
function msgOnce(m){const n=performance.now();if(n-lastMsg>1800){HG.toast(m);lastMsg=n}}
/* Yarıda bırakılan toplama ilerlemesi hatırlanır: aynı nesneye dönülünce kaldığı yerden sürer */
const MEMKINDS={};      /* Rust mantığında düğüm hasarı düğümün kendisinde (G.dmg) saklanır */
function saveProgress(){
 if(A.key&&A.p>0&&A.memKind&&A.memKey)A.mem[A.memKey]=A.p;
}
function stopAction(){saveProgress();A.key='';A.p=0;A.memKey=null;A.eatLock=false}
function stepAction(dt){
 const tg=G.tg,act=actionFor(tg);
 if(!act){stopAction();return}
 if(act.block){msgOnce(act.block);stopAction();return}
 if(!act.kind){stopAction();return}      /* yalnızca ipucu veren (E ile yapılan) eylemler */
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
  if(A.tick<=0&&(!HG.atkGate||HG.atkGate(.55*(G.tired?1.6:1)))){A.tick=.55*(G.tired?1.6:1);const sw=HG.swing();HG.snd('pick');HG.armSwing(.4);const z=HG.hitAnimal(tg.an,HG.weaponDamage()*sw,tg.hx!==undefined?{x:tg.hx,y:tg.hy,z:tg.hz}:null);HG.hitMarker(tg.an.hp<=0,z)}
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
 if(kind==='node'){nodeSwing(tg);return}
 const i=tg.y*W+tg.x,tl=G.tile[i];
 const key=kind+','+tg.x+','+tg.y;
 if(key!==A.key){
  saveProgress();
  A.key=key;A.tick=0;A.memKind=false;A.memKey=null;A.p=0;
  A.need=kind==='fish'?HG.fishNeed():act.need;
 }
 A.p+=dt;A.tick-=dt;
 if(A.p<A.need)return;
 A.p=0;
 if(kind==='drink'){
  G.thr=clamp(G.thr+12,0,100);flag('drank');HG.snd('drink');
  if(G.thr>=100){HG.toast('Susuzluk giderildi.');A.key=''}
 }else if(kind==='fill'){
  if(count('bottle')){take('bottle',1);add('wbottle',1);flag('drank');HG.snd('drink');HG.feed('Şişe dolduruldu')}
  A.key='';
 }else if(kind==='fish'){
  HG.catchFish(tl,tg.x,tg.y);
  A.need=HG.fishNeed();
 }
}

/* ---- Rust mantığı: vuruş başına kaynak ---- */
const SWING=.5;                            /* vuruş aralığı (sn) */
/* Düğümün modeldeki merkezi ve ölçeği (nesneler.js ile aynı yerleşim) */
function nodeCenter(x,y,o){
 const hh=HG.hash(x,y,21),h2=HG.hash(x,y,22);
 return {x:x+.5+(hh-.5)*.2,z:y+.5+(h2-.5)*.2,s:o===O.TREE?.8+h2*.4:.9+h2*.3};
}
/* Kaynak ver: çanta doluysa eşya yere düşer */
function giveRes(id,n){
 if(n<=0)return;
 if(canAdd(id,n)){gain(id,n,true);return}
 msgOnce('Envanter dolu: kaynak yere düşüyor.');
 HG.spawnDrop(id,n);
}
function nodeSwing(tg){
 const i=tg.y*W+tg.x,o=G.obj[i],nd=NODE[o];
 if(HG.macroBlocked&&HG.macroBlocked())return;                 /* makro algılandıysa kesme/kazma da kısa süre durur */
 HG.noiseT=performance.now()+1500;                          /* kesme ve kazma sesi hayvanları tetikte tutar */
 const key='node,'+i+','+o;
 if(key!==A.key){saveProgress();A.key=key;A.memKey=null;A.memKind=false;A.need=1}
 A.p=(G.dmg&&G.dmg[i])||0;                              /* ilerleme çubuğu: düğümün hasar oranı */
 if(G.clock<(A.nextSwing||0))return;                    /* tıklama hızlandırması yoktur: vuruş aralığı sabittir */
 const lv=gatherLv(nd.tool);
 A.nextSwing=G.clock+SWING*(G.tired?1.6:1);
 A.hitI=i;A.hitT=.18;HG.armSwing(.36);
 const big=o!==O.TREE;
 HG.snd(o===O.TREE?'hit':o===O.ROCK?'rock':'ore',null,o);
 const hx=tg.hx!==undefined?tg.hx:tg.x+.5,hy=tg.hy!==undefined?tg.hy:1,hz=tg.hz!==undefined?tg.hz:tg.y+.5;
 Scene.burst(hx,hy,hz,o===O.TREE?0x4a9440:o===O.COAL?0x222226:o===O.COPPER?0xc8743a:o===O.IRON?0xc2a287:0x9a9a9a,big?7:4);
 /* verim: düğümün tamamından çıkacak kaynak (tot × alet çarpanı), bu vuruşun götürdüğü can oranı kadarı verilir */
 const dfr=Math.min(1-(G.dmg&&G.dmg[i]||0),HIT_OF(lv)/nd.hp),ym=YIELD[Math.max(0,Math.min(3,lv))];
 if(!G.yac)G.yac={};
 const ac=G.yac[i]||(G.yac[i]={m:0,s:0});
 ac.m+=nd.tot*ym*dfr;let n=Math.floor(ac.m);ac.m-=n;
 if(HG.perk('gath')&&Math.random()<.12*HG.perk('gath'))n+=1;
 giveRes(nd.id,n);
 if(nd.sec){ac.s+=nd.sec[1]*ym*dfr;const k=Math.floor(ac.s);ac.s-=k;giveRes(nd.sec[0],k)}
 if(!G.dmg)G.dmg={};
 const fr=Math.min(1,(G.dmg[i]||0)+HIT_OF(lv)/nd.hp),st0=(G.dmg[i]||0)<.34?0:(G.dmg[i]||0)<.67?1:2,st=fr<.34?0:fr<.67?1:2;
 G.dmg[i]=fr;A.p=fr;
 if(big&&fr<1){Scene.setDamage(i,fr);if(st>st0)HG.snd('crack',{x:tg.x+.5,z:tg.y+.5})}
 if(fr<1)return;
 /* düğüm bitti: son vuruş ödülü, devrilme/parçalanma, yeniden büyüme */
 giveRes(nd.id,Math.max(1,Math.round(ac.m+nd.bonus*ym)));
 if(nd.sec&&ac.s>=.5)giveRes(nd.sec[0],1);
 delete G.yac[i];
 HG.xpGain&&HG.xpGain(1.5);
 delete G.dmg[i];
 if(o===O.TREE){Scene.fell(tg.x,tg.y,o,G.px,G.py);HG.snd('creak',{x:tg.x+.5,z:tg.y+.5,y:3})}
 else{Scene.crumble(tg.x+.5,tg.y+.5,o);HG.snd('crumble',{x:tg.x+.5,z:tg.y+.5})}
 setObj(i,nd.rm);G.shelterCheck=0;
 if(nd.regrow)G.timers.push({i,at:G.clock+nd.regrow[1]*(.8+Math.random()*.4),to:nd.regrow[0],from:nd.rm});
 A.key='';A.memKey=null;A.p=0;
}
const HIT_OF=lv=>HG.HIT[Math.max(0,Math.min(3,lv))];

/* ---- E ile toplama: meyve, hindistan cevizi, kum, deniz dibi; basılı tutarak geri alma ---- */
const pickupOk=o=>!!PLACE_ITEM[o]&&o!==O.WALLW&&o!==O.WALLS;      /* duvarlar yalnızca Çekiç ile yıkılır */
function diveAim(){return !!(G.head&&!G.cave&&HG.look.pitch<-.2&&G.pz-Scene.groundY(G.px,G.py)<1.9)}
function collectNow(){
 const tg=G.tg;if(!tg||tg.an||G.head)return false;
 const i=tg.y*W+tg.x,o=G.obj[i],nd=NODE[o];
 if(!nd||!nd.collect)return false;
 const [id,n0]=nd.give(),n=n0+(HG.perk('gath')&&Math.random()<.2*HG.perk('gath')?1:0);
 if(!gain(id,n))return true;
 HG.extGot&&HG.extGot(id,n);
 HG.armSwing(.3);HG.snd('hit');
 Scene.burst(tg.hx!==undefined?tg.hx:tg.x+.5,tg.hy!==undefined?tg.hy:1,tg.hz!==undefined?tg.hz:tg.y+.5,o===O.PALM?0x3f8a3a:0x4a9440,4);
 setObj(i,nd.rm);G.shelterCheck=0;
 if(nd.regrow)G.timers.push({i,at:G.clock+nd.regrow[1]*(.8+Math.random()*.4),to:nd.regrow[0],from:nd.rm});
 return true;
}
function digNow(){
 const tg=G.tg;if(!tg||tg.an||G.head)return false;
 const i=tg.y*W+tg.x;if(G.obj[i]||G.tile[i]!==T.SAND)return false;
 if(G.clock<(A.nextDig||0))return true;
 A.nextDig=G.clock+.4;HG.armSwing(.3);HG.snd('step_sand');
 Scene.burst(tg.hx!==undefined?tg.hx:tg.x+.5,tg.hy!==undefined?tg.hy:.2,tg.hz!==undefined?tg.hz:tg.y+.5,0xd9c58b,4);
 gain('sand',1);HG.extSand&&HG.extSand();return true;
}
function diveNow(){
 if(!diveAim())return false;
 if(G.clock<(A.nextDive||0))return true;
 A.nextDive=G.clock+.9;
 /* deniz dibi: sık midye ve yosun, nadiren inci */
 HG.useStam(3);
 if(HG.nearReef()&&Math.random()<.4){if(gain('coral',1)){HG.toast('Mercan toplandı.');HG.xpGain(3);if(G.stats)G.stats.coral=(G.stats.coral||0)+1}return true}
 const r=Math.random();
 if(r<.03){if(gain('pearl',1)){HG.toast('İnci buldun!');HG.xpGain(4)}}
 else if(r<.47){if(gain('shell',1)&&G.stats)G.stats.shells=(G.stats.shells||0)+1}
 else if(r<.70)gain('kelp',1);
 else if(r<.88)gain('sand',1);
 else HG.toast('Dipte işe yarar bir şey çıkmadı.');
 return true;
}
/* Yerleştirilmiş eşyayı geri alma: E basılı tutulur */
let UP=null;
function doPickup(i){
 const o=G.obj[i],id=PLACE_ITEM[o];
 if(!pickupOk(o)||(HG.extPickupBlock&&HG.extPickupBlock(i,o))||!gain(id,1))return;
 setObj(i,O.NONE);G.shelterCheck=0;HG.snd('craft');
}
function pickupAim(){
 const tg=G.tg;if(!tg||tg.an||G.head)return -1;
 const i=tg.y*W+tg.x;return pickupOk(G.obj[i])?i:-1;
}
function stepUse(dt){
 if(!UP){HG.useProg=null;return}
 if(ui.state!=='play'||!HG.keyDown('use')||pickupAim()!==UP.i){UP=null;HG.useProg=null;return}
 UP.p+=dt;HG.useProg={p:UP.p,need:.8};
 if(UP.p>=.8){const i=UP.i;UP=null;HG.useProg=null;doPickup(i)}
}

/* ---- Yerleştirme ---- */
function validPlace(x,y,itemKey){
 if(x<0||y<0||x>=HG.W||y>=HG.H)return false;
 const i=y*W+x,t=G.tile[i];
 if(G.obj[i]||t<T.SAND||t===T.POND)return false;
 if(Math.floor(G.px)===x&&Math.floor(G.py)===y&&HG.IT[itemKey].place!==O.DOOR)return false;
 if(HG.extPlaceOk&&!HG.extPlaceOk(x,y,itemKey))return false;
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
 const h=held();
 if(h&&h.it.tool==='plan'&&HG.insaPlace)return HG.insaPlace();            /* yerleştir tuşu/dokunmatik düğme: inşa planı ve çekiç */
 if(h&&h.it.tool==='hammer'&&HG.insaHammer)return HG.insaHammer();
 if(h&&h.it.tool==='rsdoor'&&HG.rsDoorPlace)return HG.rsDoorPlace();
 if(!h||!h.it.place)return false;
 if(!G.tg){HG.toast('Yerleştirmek için yere bakın.');return false}
 const p=placeTarget(h.k);
 if(!p){HG.toast((HG.extPlaceMsg&&HG.extPlaceMsg(h.k))||'Buraya yerleştirilemez.');return false}
 setObj(p.y*W+p.x,h.it.place);take(h.k,1);flag('placed_'+h.k);HG.snd('craft');ui.dirty=true;G.shelterCheck=0;
 return true;
}
/* Sol tık / boşluk tuşuna ilk basış */
function onActPress(){
 if(ui.state!=='play')return;
 const h=held(),tg=G.tg;
 if(h&&h.it.place&&tg&&!tg.an&&!G.obj[tg.y*W+tg.x])placeHeld();
 else if(h&&h.it.tool==='plan'&&HG.insaPlace)HG.insaPlace();
 else if(h&&h.it.tool==='hammer'&&HG.insaHammer)HG.insaHammer();
 else if(h&&h.it.tool==='rsdoor'&&HG.rsDoorPlace)HG.rsDoorPlace();
}

/* ---- Eşya kullanma (yeme-içme) ---- */
function eatHeld(){
 const h=held();if(!h||!h.it.food)return;
 {
  const f=h.it.food;
  G.hun=clamp(G.hun+f.h*(HG.cookK?HG.cookK(h.k):1),0,100);G.thr=clamp(G.thr+f.t,0,100);
  if(f.hp){G.hp=clamp(G.hp+f.hp,0,100);G.cause='Bozuk yiyecek yedin.';HG.snd('hurt');HG.toast('Çiğ yiyecek midene dokundu.')}
  take(h.k,1);if(f.ret)add(f.ret,1);
  if(HG.extAte)HG.extAte(h.k,f);
  HG.snd('eat');
  HG.addSan(f.h>=30?5:f.h>=10?1.5:.5);
 }
}
/* E ile etkileşime girilebilecek hedefler: yalnızca bakılan yöndekiler, en çok bakılan önce */
function faceCos(x,z){const dx=x-G.px,dz=z-G.py,d=Math.hypot(dx,dz);return d<.9?1:(dx*G.fx+dz*G.fy)/d}
function useCands(){
 const c=[],dr=G.nearDrop,cp=G.nearCamp,cv=G.nearCave,np=G.nearNpc;
 if(dr&&G.drops&&G.drops.includes(dr)){const f=faceCos(dr.x,dr.z);if(f>.55||Math.hypot(dr.x-G.px,dr.z-G.py)<1.3)c.push([Math.max(f,.9),'drop',HG.pickupNearest])}
 if(cp&&!cp.open){const f=faceCos(cp.x+.5,cp.y+.5);if(f>.85)c.push([f,'chest',HG.openChest])}
 if(cv){const q=cv.exit&&G.cave?G.cave.lv.exit:cv,f=faceCos(q.x+.5,q.y+.5);if(f>.85)c.push([f,'cave',HG.useCave])}
 if(np){const f=faceCos(np.x,np.z);if(f>.9)c.push([f,'npc',HG.talkNpc])}
 c.sort((a,b)=>b[0]-a[0]);
 /* tek odak: nişanın değdiği nesne etkileşim adayından yakınsa odak o nesnedir, aday listelenmez */
 if(c.length&&G.tg){
  const tg=G.tg,hx=tg.hx!==undefined?tg.hx:tg.x+.5,hz=tg.hz!==undefined?tg.hz:tg.y+.5,hd=Math.hypot(hx-G.px,hz-G.py),k=c[0][1];
  const o=k==='drop'?G.nearDrop:k==='chest'?G.nearCamp:k==='npc'?G.nearNpc:null;
  const ox=!o?null:k==='npc'||k==='drop'?[o.x,o.z]:[o.x+.5,o.y+.5];
  if(ox&&Math.hypot(ox[0]-G.px,ox[1]-G.py)>hd+.5&&k!=='drop')return [];
 }
 return c;
}
/* E (src='key'), sağ tık (src='mouse') veya dokunmatik düğme (src='touch'). Sıra: sal, yakındaki etkileşimler, meyve toplama,
   elde tutulan eşyanın kullanımı, İnşa Planı/Çekiç, kum kazma, deniz dibi, yerleştirilmiş eşyayı geri alma. */
function useHeld(src){
 UP=null;
 if(HG.raftUse(held()))return;                 /* sal: biner veya iner */
 { const hh=held(); if(!(hh&&(hh.it.tool==='plan'||hh.it.tool==='hammer'))&&HG.rsUse&&HG.rsUse(src))return }      /* inşa kapısı: aç/kapat */
 for(const c of useCands())if(c[2]())return;
 if(collectNow())return;
 if(HG.useExtra&&HG.useExtra(src))return;
 const h=held();
 if(h){
  if(h.it.food){const b=foodBlock(h.it.food);if(b)HG.toast(b);else eatHeld();return}
  if(h.it.sleep){HG.sleep();return}
  if(h.it.heal){if(G.bleed>0||G.hp<95)HG.useMedical();else HG.toast('Yaralı değilsin.');return}
  if(h.it.place){placeHeld();return}
  if((h.it.tool==='plan'||h.it.tool==='hammer')&&HG.insaCycle){HG.insaCycle();return}
 }
 if(diveNow())return;
 const pi=pickupAim();
 if(pi>=0){
  if(src==='touch'){doPickup(pi);return}
  if(src==='key'){UP={i:pi,p:0};return}
 }
 if(digNow())return;
}
Object.assign(HG,{YIELD,useCands,actionFor,stepAction,stopAction,stepUse,nodeCenter,validPlace,placeTarget,placeHeld,onActPress,useHeld,eatHeld});
})();
