/* Hunger 3D - düşmanlar: geceleri ortaya çıkan Gölge yaratıklar (korku), sahte gözlemciler, gerilim ölçümü.
   Gölge: bakılırken donar, bakılmadığında hızla yaklaşır; ışıktan kaçar, gün ışığında erir. */
(()=>{
'use strict';
const {W,H,T,O,OBJTOP,SOLID,G,ui,ANIMAL,look,clamp,daylight,dayNo}=HG;
const sc=HG.sc;
const rnd=Math.random;

/* Engel testi: ağaç ve duvar gibi yüksek nesneler görüşü keser */
function los(ax,az,bx,bz){
 const n=Math.ceil(Math.hypot(bx-ax,bz-az)/.7);
 for(let i=1;i<n;i++){
  const x=ax+(bx-ax)*i/n,z=az+(bz-az)*i/n,tx=Math.floor(x),tz=Math.floor(z);
  if(tx<0||tz<0||tx>=W||tz>=H)return false;
  const o=G.obj[tz*W+tx];
  if(o&&(OBJTOP[o]||1)>=2.2)return false;
 }
 return true;
}
/* nokta, oyuncunun görüş konisinde mi? (cos: eşik) */
function inView(x,z,cos){
 const dx=x-G.px,dz=z-G.py,d=Math.hypot(dx,dz)||1;
 return (dx*-Math.sin(look.yaw)+dz*-Math.cos(look.yaw))/d>cos;
}
/* Gölgeler kapıdan ve duvardan geçemez: barınak güvenlidir */
function walkableFoe(x,z){
 const r=.35,pts=[[0,0],[r,0],[-r,0],[0,r],[0,-r]];
 for(const [dx,dz] of pts){
  const tx=Math.floor(x+dx),tz=Math.floor(z+dz);
  if(tx<1||tz<1||tx>=W-1||tz>=H-1)return false;
  const i=tz*W+tx,t=G.tile[i],o=G.obj[i];
  if(t<T.SAND||t===T.POND||SOLID(o)||o===O.DOOR||o===O.DOORM||o===O.VDOOR)return false;
 }
 return true;
}

/* Tek bir gölgenin davranışı: {head,spd} döner */
function foeAI(a,def,dt){
 const dx=G.px-a.x,dz=G.py-a.z,dp=Math.hypot(dx,dz),L=daylight();
 a.born=Math.min(1,(a.born||0)+dt/1.5);
 const inV=dp<48&&inView(a.x,a.z,.66)&&los(G.px,G.py,a.x,a.z);
 a.seen=inV;
 if(inV&&!a.spotted){a.spotted=true;if(!a.fake&&dp<40)HG.snd('stinger')}
 if(!inV)a.spotted=a.spotted&&dp<60;
 /* sahte gözlemci: yerinde durur, bakılınca veya yaklaşılınca erir */
 if(a.fake){
  if(inV)a.watchT=(a.watchT||0)+dt;else a.watchT=Math.max(0,(a.watchT||0)-dt*.4);
  if((a.watchT>1.2||dp<8)&&!a.dying){a.dying=.001;a.gone=true;HG.Scene.burst(a.x,HG.Scene.groundY(a.x,a.z)+1,a.z,0x15151c,8)}
  return {head:Math.atan2(dx,dz),spd:0};
 }
 /* gün ışığında erir */
 if(L>.55&&!G.cave){
  a.hp-=dt*27;if(rnd()<dt*8)HG.Scene.burst(a.x+(rnd()-.5)*.4,HG.Scene.groundY(a.x,a.z)+1+rnd(),a.z+(rnd()-.5)*.4,0x20202a,2);
  if(a.hp<=0){HG.killAnimal(a);return {head:a.yaw,spd:0}}
 }
 const ll=HG.lightLevel(a.x,a.z,!!G.cave);        /* mağarada yaratıklar meşaleden çekinmez */
 /* ışık: kaçar, yakından yanar */
 if(ll>.12||a.flinch>0){
  if(a.flinch>0)a.flinch-=dt;
  if(ll>.55){
   a.hp-=dt*40;a.hissT=(a.hissT||0)-dt;
   if(a.hissT<=0){a.hissT=.9;HG.snd('hiss',{x:a.x,z:a.z})}
   if(rnd()<dt*14)HG.Scene.burst(a.x,HG.Scene.groundY(a.x,a.z)+1.2,a.z,0x2a2a38,2);
   if(a.hp<=0){HG.killAnimal(a);return {head:a.yaw,spd:0}}
  }
  return {head:Math.atan2(-dx,-dz),spd:def.run};
 }
 /* bakılan gölge donar (ama saldırıya açıktır) */
 if(inV&&dp>2.3){a.seenT=(a.seenT||0)+dt;return {head:Math.atan2(dx,dz),spd:0}}
 a.seenT=0;
 /* saldırı */
 a.cd-=0;
 if(dp<1.8){
  if(a.cd<=0&&ui.state==='play'&&(!G.sheltered||G.cave)){a.cd=1.5;a.atkT=.5;HG.hurt(def.dmg,'Bir Gölge seni parçaladı.',{x:a.x,z:a.z},def.bleed);HG.snd('cry_shade',{x:a.x,z:a.z})}
  return {head:Math.atan2(dx,dz),spd:0};
 }
 /* yaklaşma: uzaktan hızlı, yakında yavaş ve sinsi */
 const sp=dp>12?def.run:dp>4.5?3.4:2.3;
 const wob=dp<10?Math.sin(performance.now()*.004+a.id)*.5:0;
 /* duvar önünde bekleyip tırmalar */
 if(G.sheltered&&dp<5){
  a.scratchT=(a.scratchT||0)-dt;
  if(a.scratchT<=0){a.scratchT=1.8+rnd()*1.5;HG.snd('scratch',{x:a.x,z:a.z})}
 }
 return {head:Math.atan2(dx,dz)+wob,spd:sp};
}

function spawnShade(fake){
 for(let g=0;g<40;g++){
  const ang=rnd()*6.283,r=fake?20+rnd()*14:30+rnd()*14;
  const x=G.px+Math.cos(ang)*r,z=G.py+Math.sin(ang)*r;
  if(!walkableFoe(x,z)||HG.lightLevel(x,z)>.02)continue;
  if(!fake){if(inView(x,z,.55)&&los(G.px,G.py,x,z))continue}
  else{if(!inView(x,z,.25)||inView(x,z,.8))continue}
  let nearFire=false;for(const f of sc.fires||[])if(Math.hypot(f.x-x,f.z-z)<14){nearFire=true;break}
  if(nearFire)continue;
  const a=HG.makeAnimals([{t:'shade',x,z,yaw:Math.atan2(G.px-x,G.py-z)}])[0];
  a.fake=fake;a.born=0;G.animals.push(a);
  if(!fake)HG.snd('call_shade',{x,z});
  return a;
 }
 return null;
}

/* Yönetmen: kaç gölge çıkacağını gece sayısına, akıl sağlığına ve hava durumuna göre belirler */
function updateFoes(dt){
 if(ui.state!=='play'||!G.animals)return;
 const L=daylight(),dark=Math.max(1-L,(sc.rain||0)*.5);
 let real=0,fakes=0,near=99,seenNear=false;
 for(const a of G.animals){
  const def=ANIMAL[a.t];if(!def.foe||a.dying)continue;
  if(a.fake){fakes++;continue}
  real++;
  const d=Math.hypot(a.x-G.px,a.z-G.py);
  if(d<near){near=d;seenNear=!!a.seen}
  if(d>80&&!G.cave)a.gone=true,a.dying=.001;
 }
 /* gerilim: yakındaki gölge, korku seviyesini yükseltir */
 const tf=near<32?clamp(1-near/32,0,1)*(seenNear?1:.75):0;
 sc.fear+=(tf-sc.fear)*(1-Math.exp(-dt*(tf>sc.fear?1.6:.35)));
 G.foeT=(G.foeT===undefined?50:G.foeT)-dt;
 if(dark>.55&&G.clock>80&&!G.cave){
  const want=Math.min(G.blood?11:6,1+Math.floor((dayNo()-1)*.9)+(G.san<35?1:0)+(G.blood?4:0));
  if(real<want&&G.foeT<=0){
   if(spawnShade(false))G.foeT=clamp(28-dayNo()*2.2,10,28)*(.7+rnd()*.6)*(G.blood?.45:1);else G.foeT=4;
  }
 }
 /* akıl sağlığı düşükken kenarda duran sahte gözlemciler */
 G.watchSp=(G.watchSp===undefined?30:G.watchSp)-dt;
 if(G.san<48&&L<.7&&G.watchSp<=0&&!G.cave){
  G.watchSp=18+rnd()*28;
  if(fakes<2)spawnShade(true);
 }
}
Object.assign(HG,{los,inView,walkableFoe,foeAI,updateFoes});
})();
