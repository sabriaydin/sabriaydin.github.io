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
  if(t<T.SAND||t===T.POND||SOLID(o)||o===O.DOOR||o===O.DOORM||o===O.VDOOR||HG.INSA_PASS(o))return false;
 }
 if(HG.rsFoeBlock(x,z))return false;                /* inşa: duvar ve temel kenarı */
 return true;
}

/* ---- Gölge yön bulma ----
   Doğrudan yol açıksa düz gider; engel (ağaç, kaya, göl, duvar) varsa kare ızgarasında A* ile dolaşır.
   Arama sınırlıdır (pencere ve düğüm sayısı) ve gölge başına en fazla ~1 sn'de bir yapılır. */
const NAVR=34,NAVMAX=700;
function clearLine(ax,az,bx,bz){
 const n=Math.ceil(Math.hypot(bx-ax,bz-az)/.45);
 for(let i=1;i<=n;i++){const t=i/n;if(!walkableFoe(ax+(bx-ax)*t,az+(bz-az)*t))return false}
 return true;
}
function findPath(ax,az,bx,bz){
 const sx=Math.floor(ax),sz=Math.floor(az),gx=Math.floor(bx),gz=Math.floor(bz);
 const x0=sx-NAVR,z0=sz-NAVR,S=NAVR*2+1,cache=new Map();
 const wk=(x,z)=>{const k=z*4096+x;let v=cache.get(k);if(v===undefined){v=walkableFoe(x+.5,z+.5);cache.set(k,v)}return v};
 const hf=(x,z)=>{const dx=Math.abs(x-gx),dz=Math.abs(z-gz);return Math.max(dx,dz)+.414*Math.min(dx,dz)};
 const open=[],g=new Map(),from=new Map(),closed=new Set();
 const push=(x,z,f)=>{open.push([f,x,z]);let i=open.length-1;while(i>0){const p=(i-1)>>1;if(open[p][0]<=open[i][0])break;[open[p],open[i]]=[open[i],open[p]];i=p}};
 const pop=()=>{const t=open[0],l=open.pop();if(open.length){open[0]=l;let i=0;for(;;){let a=i*2+1,b=a+1,m=i;if(a<open.length&&open[a][0]<open[m][0])m=a;if(b<open.length&&open[b][0]<open[m][0])m=b;if(m===i)break;[open[m],open[i]]=[open[i],open[m]];i=m}}return t};
 const K=(x,z)=>z*4096+x;
 g.set(K(sx,sz),0);push(sx,sz,hf(sx,sz));
 let best=[sx,sz],bh=hf(sx,sz),n=0,goal=null;
 while(open.length&&n<NAVMAX){
  const [,cx,cz]=pop(),ck=K(cx,cz);
  if(closed.has(ck))continue;closed.add(ck);n++;
  const h=hf(cx,cz);if(h<bh){bh=h;best=[cx,cz]}
  if(Math.max(Math.abs(cx-gx),Math.abs(cz-gz))<=1){goal=[cx,cz];break}
  const gc=g.get(ck);
  for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){
   if(!dx&&!dz)continue;
   const nx=cx+dx,nz=cz+dz;
   if(nx<x0||nz<z0||nx>=x0+S||nz>=z0+S||!wk(nx,nz))continue;
   if(dx&&dz&&!(wk(cx+dx,cz)&&wk(cx,cz+dz)))continue;                 /* köşeden kesme yok */
   const nk=K(nx,nz),ng=gc+(dx&&dz?1.414:1);
   if(g.has(nk)&&g.get(nk)<=ng)continue;
   g.set(nk,ng);from.set(nk,ck);push(nx,nz,ng+hf(nx,nz));
  }
 }
 const end=goal||best,path=[];let k=K(end[0],end[1]);
 while(k!==undefined&&k!==K(sx,sz)){path.push({x:k%4096+.5,z:Math.floor(k/4096)+.5});k=from.get(k)}
 path.reverse();return {path,ok:!!goal};
}
let pathBudget=0;
/* Gölgenin hedefe doğru gideceği yön: açık yolda düz, engelde A* yol noktaları */
function navHead(a,tx,tz,dt){
 const dx=tx-a.x,dz=tz-a.z;
 a.dirT=(a.dirT||0)-dt;a.pathT=(a.pathT||0)-dt;
 if(a.dirT<=0){a.dirT=.28+rnd()*.12;a.dirOk=clearLine(a.x,a.z,tx,tz)}
 if(a.dirOk){a.path=null;return {head:Math.atan2(dx,dz),wait:false}}
 if((!a.path||a.pathT<=0)&&pathBudget>0){
  pathBudget--;a.pathT=.9+rnd()*.5;
  const r=findPath(a.x,a.z,tx,tz);a.path=r.path;a.pi=0;a.pathOk=r.ok;
 }
 const p=a.path;
 if(p&&p.length){
  while(a.pi<p.length-1&&Math.hypot(p[a.pi].x-a.x,p[a.pi].z-a.z)<.8)a.pi++;
  const w=p[Math.min(a.pi,p.length-1)];
  if(a.pi>=p.length-1&&Math.hypot(w.x-a.x,w.z-a.z)<.8)return {head:Math.atan2(dx,dz),wait:!a.pathOk};      /* ulaşılabilecek en yakın noktaya varıldı */
  return {head:Math.atan2(w.x-a.x,w.z-a.z),wait:false};
 }
 return {head:Math.atan2(dx,dz),wait:false};
}
/* Çevredeki en yakın ışık kaynağı: kamp ateşi, fener veya oyuncunun yanan meşalesi */
function nearLight(x,z){
 let b=null,bd=13;
 if(G.torchLit){const d=Math.hypot(x-G.px,z-G.py);if(d<bd){bd=d;b={x:G.px,z:G.py}}}
 for(const f of sc.fires||[]){const d=Math.hypot(x-f.x,z-f.z);if(d<bd){bd=d;b={x:f.x,z:f.z}}}
 for(const l of sc.lamps||[]){const d=Math.hypot(x-l.x,z-l.z);if(d<bd){bd=d;b={x:l.x,z:l.z}}}
 return b;
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
 /* ışık: kaçar, yakından yanar (ışık kaynağından uzaklaşır; kaçarken engel varsa dolanır) */
 if(ll>.12||a.flinch>0){
  if(a.flinch>0)a.flinch-=dt;
  if(ll>.55){
   a.hp-=dt*40;a.hissT=(a.hissT||0)-dt;
   if(a.hissT<=0){a.hissT=.9;HG.snd('hiss',{x:a.x,z:a.z})}
   if(rnd()<dt*14)HG.Scene.burst(a.x,HG.Scene.groundY(a.x,a.z)+1.2,a.z,0x2a2a38,2);
   if(a.hp<=0){HG.killAnimal(a);return {head:a.yaw,spd:0}}
  }
  const ls=nearLight(a.x,a.z);
  a.wind=0;
  return {head:ls&&ls.x!==a.x?Math.atan2(a.x-ls.x,a.z-ls.z):Math.atan2(-dx,-dz),spd:def.run};
 }
 /* saldırı: kısa hazırlık süresi vardır; oyuncu bu sürede geri çekilirse vuruş ıskalar */
 if(a.retreat>0){                                    /* vurup geri çekilir, sonra yeniden yaklaşır */
  a.retreat-=dt;
  if(dp<9){a.wind=0;return {head:Math.atan2(-dx,-dz)+Math.sin(a.id*1.7)*.5,spd:3.1}}
 }
 if(a.wind>0){
  a.wind-=dt;
  if(a.wind<=0){
   if(dp<2.3&&ui.state==='play'&&(!G.sheltered||G.cave)){HG.hurt(def.dmg,'Bir Gölge seni parçaladı.',{x:a.x,z:a.z},def.bleed);HG.snd('cry_shade',{x:a.x,z:a.z})}
   a.cd=1.5;a.retreat=1.1+rnd()*.9;
  }
  return {head:Math.atan2(dx,dz),spd:0};
 }
 /* bakılan gölge donar (ama saldırıya açıktır) */
 if(inV&&dp>2.3){a.seenT=(a.seenT||0)+dt;return {head:Math.atan2(dx,dz),spd:0}}
 a.seenT=0;
 if(dp<1.8){
  if(a.cd<=0&&ui.state==='play'&&(!G.sheltered||G.cave)){a.wind=.32;a.atkT=.5;HG.snd('call_shade',{x:a.x,z:a.z})}
  return {head:Math.atan2(dx,dz),spd:0};
 }
 /* yaklaşma: uzaktan hızlı, yakında yavaş ve sinsi; görülmeden yakına gelince atılır */
 let sp=dp>12?def.run:dp>4.5?3.4:2.3;
 a.lungeCd=(a.lungeCd||0)-dt;
 if(a.lunge>0){a.lunge-=dt;sp=Math.max(sp,4.5)}
 else if(dp<6.5&&dp>2.4&&!inV&&a.lungeCd<=0&&!G.sheltered){a.lunge=.6;a.lungeCd=5+rnd()*4}
 const wob=dp<10?Math.sin(performance.now()*.004+a.id)*.5:0;
 /* duvar önünde bekleyip tırmalar */
 if(G.sheltered&&dp<5){
  a.scratchT=(a.scratchT||0)-dt;
  if(a.scratchT<=0){a.scratchT=1.8+rnd()*1.5;HG.snd('scratch',{x:a.x,z:a.z})}
 }
 /* yol: engel varsa dolanır; ulaşılamıyorsa en yakın noktada bekler (barınak) */
 const nv=navHead(a,G.px,G.py,dt);
 if(nv.wait)return {head:Math.atan2(dx,dz),spd:0};
 let head=nv.head;
 /* kuşatma: birden çok gölge oyuncuya farklı yönlerden yaklaşır */
 if(!a.path){if(a.slot===undefined)a.slot=((a.id%5)-2)*.42;head+=a.slot*clamp((dp-4)/14,0,1)}
 /* ışığın kenarında dolaşır: aydınlık alana girmeden çevresinde döner */
 const ax=Math.sin(head),az=Math.cos(head);
 if(HG.lightLevel(a.x+ax*2.4,a.z+az*2.4,!!G.cave)>.1){
  const ls=nearLight(a.x+ax*2.4,a.z+az*2.4);
  if(ls){
   if(a.circ===undefined)a.circ=a.id%2?1:-1;
   const base=Math.atan2(a.x-ls.x,a.z-ls.z);                       /* ışıktan dışarı doğru */
   a.hissT=(a.hissT||0)-dt;if(a.hissT<=0&&dp<18){a.hissT=2.4+rnd()*2;HG.snd('hiss',{x:a.x,z:a.z})}
   return {head:base+a.circ*1.45,spd:2.4};
  }
 }
 return {head:head+(a.path?0:wob),spd:sp};
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
 pathBudget=2;                                  /* kare başına en fazla iki yol araması */
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
