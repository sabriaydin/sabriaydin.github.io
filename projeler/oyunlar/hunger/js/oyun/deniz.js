/* Hunger 3D - deniz: sal, dalış maskesi, köpek balığı / denizanası / yengeç, balık çeşitleri, ada-resif keşfi */
(()=>{
'use strict';
const {W,H,T,SOLID,G,ui,look,Scene,clamp,ANIMAL}=HG;
const rnd=Math.random;
const WYv=()=>HG.sc.WY;
const PTS=[[0,0],[.45,0],[-.45,0],[0,.45],[0,-.45]];
const tileIdx=(x,z)=>{const tx=Math.floor(x),tz=Math.floor(z);return tx<1||tz<1||tx>=W-1||tz>=H-1?-1:tz*W+tx};
const depthAt=(x,z)=>HG.sc.WY-Scene.groundY(x,z);

/* ---- yüzme alanı: derin su (köpek balığı) veya derin ve sığ su (denizanası); nesne bulunan kare geçilmez ---- */
function wet(x,z,deepOnly,pts){
 for(const [dx,dz] of pts||PTS){
  const i=tileIdx(x+dx,z+dz);if(i<0)return false;
  const t=G.tile[i];
  if(deepOnly?t!==T.DEEP:(t!==T.DEEP&&t!==T.SHAL))return false;
  if(G.obj[i]&&SOLID(G.obj[i]))return false;
 }
 return true;
}
HG.swimmable={fish:(x,z)=>wet(x,z,true),jelly:(x,z)=>wet(x,z,false)};

/* ---- Dalış Maskesi: çantada bulunması yeterlidir ---- */
HG.hasMask=()=>!!G.mask;

/* ---- Sal ---- */
const RAFTPTS=[[0,0],[.75,0],[-.75,0],[0,.75],[0,-.75],[.55,.55],[-.55,-.55],[.55,-.55],[-.55,.55]];
HG.raftWater=(x,z)=>wet(x,z,false,RAFTPTS)&&depthAt(x,z)>.25;
function raftSpeed(sprint,m){
 const wd=HG.sc.wind;let wb=1;
 if(wd&&G.moving){
  const mx=G.pvx,mz=G.pvy,l=Math.hypot(mx,mz)||1;
  const dot=(mx*wd.x+mz*wd.z)/l;                       /* rüzgârı arkadan alınca hızlanır, karşıdan alınca yavaşlar */
  wb=1+clamp(dot*wd.s*.3,-.12,.3);
 }
 return (sprint?4.5:3.0)*(1+.12*HG.perk('sail'))*wb*Math.min(1,m);
}
function mountRaft(x,z){
 G.onRaft=true;G.raftHp=G.raftHp>0?G.raftHp:100;
 if(x!==undefined){G.px=x;G.py=z}
 G.swim=false;G.head=false;G.air=false;G.vz=0;G.pvx*=.3;G.pvy*=.3;G.raftYaw=look.yaw;G.divT=0;
 HG.snd('splash');Scene.burst(G.px,WYv(),G.py,0x9fd0f0,8);
 HG.flag('sailed');
 HG.toast('Sala binildi. Karaya yaklaşıp E ile inebilirsiniz.');
}
function dismountRaft(msg){
 if(!G.onRaft)return;
 G.onRaft=false;
 /* önde kara varsa karaya çıkılır */
 for(const r of [1.4,2.0,2.6]){
  const x=G.px+G.fx*r,z=G.py+G.fy*r,i=tileIdx(x,z);
  if(i>=0&&G.tile[i]>=T.SAND&&G.tile[i]!==T.POND&&!SOLID(G.obj[i])){G.px=Math.floor(x)+.5;G.py=Math.floor(z)+.5;G.pz=undefined;G.pvx=G.pvy=0;HG.toast(msg||'Salden inildi.');return}
 }
 G.pz=undefined;HG.toast(msg||'Salden inildi.');
}
/* sağ tık / E: salı elinde tutup suya bakınca biner, salda ise iner */
function raftUse(h){
 if(G.onRaft){dismountRaft();return true}
 if(!h||h.it.tool!=='raft')return false;
 if(G.cave){HG.toast('Sal yalnızca açık denizde kullanılır.');return true}
 const tg=G.tg;let x,z;
 const here=tileIdx(G.px,G.py);
 if(here>=0&&G.tile[here]<=T.SHAL&&depthAt(G.px,G.py)>.45&&HG.raftWater(G.px,G.py)){x=G.px;z=G.py}
 else if(tg&&!tg.an&&tg.hx!==undefined){
  const i=tileIdx(tg.hx,tg.hz);
  if(i>=0&&G.tile[i]<=T.SHAL&&Math.hypot(tg.hx-G.px,tg.hz-G.py)<5&&HG.raftWater(tg.hx,tg.hz)){x=tg.hx;z=tg.hz}
 }
 if(x===undefined){HG.toast('Sal yalnızca yeterince derin suya yerleştirilebilir. Su kıyısına bakın.');return true}
 mountRaft(x,z);return true;
}
function raftHit(d){
 G.raftHp=(G.raftHp===undefined?100:G.raftHp)-d;
 HG.snd('crack');
 if(G.raftHp<=0){
  HG.take('raft',1);HG.toast('Sal parçalandı!');Scene.burst(G.px,WYv(),G.py,0x8a5a30,14);
  G.raftHp=100;dismountRaft('Sal parçalandı; suya düşüldü.');
 }else if(G.raftHp<40&&!G.raftWarn){G.raftWarn=true;HG.toast('Sal hasar gördü: dayanıklılığı azaldı.')}
 if(G.raftHp>=60)G.raftWarn=false;
}
HG.raftUse=raftUse;HG.raftHit=raftHit;HG.raftSpeed=raftSpeed;HG.dismountRaft=dismountRaft;

/* ---- Köpek balığı ve denizanası zekâsı ---- */
/* Köpek balıkları kıyıdan uzak, derin denizde yaşar (karadan en az SHARK_MIN kare). Çok nadiren tek bir köpek balığı
   (a.coastal) kıyıya yakın suyun yüzeyinde dolaşır; saldırgan değildir ve bir süre sonra açığa döner. */
const SHARK_MIN=26,SHARK_COAST=7,COASTAL_P=.035;
const sdAt=(x,z)=>{const i=tileIdx(x,z);return i<0||!G.sdist?0:G.sdist[i]};
function waterDepthAtPlayer(){return G.pz===undefined?0:Math.max(0,depthAt(G.px,G.py))}
function stingPlayer(a){
 HG.hurt(ANIMAL.jelly.dmg,'Denizanası zehrinden öldün.',{x:a.x,z:a.z},0);
 HG.useStam(14);HG.toast('Denizanası soktu!');a.atkT=.4;
}
function seaAI(a,def,dt,dp,dx,dz,play){
 const wy=HG.sc.WY,gy=Scene.groundY(a.x,a.z);
 let head=a.yaw,spd=0;
 if(a.by===undefined)a.by=wy-.6;
 if(def.sea==='jelly'){
  a.tm-=dt;if(a.tm<=0||a.hd===undefined){a.tm=3+rnd()*6;a.hd=rnd()*6.283}
  if(a.panic>0||a.charge>0){a.panic=Math.max(0,a.panic-dt);if(a.charge>0)a.charge=0;head=Math.atan2(-dx,-dz);spd=def.run}
  else{head=a.hd;spd=def.walk*(.5+.5*Math.sin(G.clock*2+a.id))}
  if(play&&!G.onRaft&&a.cd<=0&&dp<def.r+.6&&waterDepthAtPlayer()>.4){
   const py=G.pz;
   if(py<a.by+def.h+.3&&py+1.7>a.by-.3){a.cd=def.cd+1;stingPlayer(a)}
  }
  const want=Math.max(gy+.25,wy-.45-(a.id%4)*.28);
  a.by+=(want-a.by)*Math.min(1,1.5*dt);
  return {head,spd};
 }
 /* köpek balığı: gezinme -> halka çizerek yaklaşma -> saldırı -> geri çekilme */
 const inw=play&&(G.swim||G.onRaft||waterDepthAtPlayer()>.5);
 const minSd=a.coastal?SHARK_COAST:SHARK_MIN;
 if(a.coastal&&(a.life=(a.life===undefined?110+rnd()*80:a.life)-dt)<=0){a.coastal=false;a.ss=0}      /* süre dolunca açığa yönelir */
 /* oyuncu, köpek balığının bölgesinden çok uzaktaysa (kıyıya yakın yüzücü) saldırı olmaz */
 const tgt=!a.coastal&&inw&&dp<def.aggr+(a.ss>0?10:0)&&sdAt(G.px,G.py)>=minSd-5;
 const ang=Math.atan2(dx,dz);
 if(a.ss===undefined)a.ss=0;
 if(a.charge>0){a.charge=0;if(a.hp<35){a.ss=3;a.rt=7}else{a.ss=2;a.ch=7}}
 if(a.ss===0){
  a.tm-=dt;if(a.tm<=0||a.hd===undefined){a.tm=4+rnd()*6;a.hd=a.yaw+(rnd()-.5)*2.2}
  head=a.hd;spd=def.walk;
  if(tgt&&a.hp>=35&&(a.bites||0)<4){
   a.ss=1;a.st=3+rnd()*3;a.cw=rnd()<.5?-1:1;
   if(!a.warned){a.warned=true;HG.toast('Yakında bir köpek balığı var!');HG.snd('shark_warn',{x:a.x,z:a.z})}
  }
  if(!tgt){a.calm=(a.calm||0)+dt;if(a.calm>25){a.bites=0;a.calm=0;a.warned=false}}
 }else if(a.ss===1){
  if(!tgt){a.ss=0;a.tm=1}
  else{
   a.st-=dt;
   head=ang+a.cw*(dp<9?1.35:.5);spd=def.walk*(dp<9?2.4:3.4);
   if(a.st<=0){a.ss=2;a.ch=5}
  }
 }else if(a.ss===2){
  if(!tgt&&dp>def.aggr){a.ss=0}
  a.ch-=dt;head=ang;spd=def.run;
  if(dp<def.r+1.15&&a.cd<=0&&play&&inw){
   a.cd=def.cd;a.bites=(a.bites||0)+1;a.atkT=.45;
   HG.hurt(Math.max(1,Math.round(def.dmg*(G.onRaft?.6:1)*(1-.15*HG.perk('sail')))),'Köpek balığı saldırısında öldün.',{x:a.x,z:a.z},def.bleed);
   HG.toast('Köpek balığı ısırdı!');
   if(G.onRaft)raftHit(14);
   a.ss=3;a.rt=a.bites>=3?10:3+rnd()*2;
  }
  else if(a.ch<=0){a.ss=1;a.st=2+rnd()*2}
 }else{
  a.rt-=dt;head=ang+Math.PI;spd=def.run*.8;
  if(a.rt<=0){a.ss=(tgt&&a.hp>=35&&(a.bites||0)<4)?1:0;a.st=2+rnd()*2;a.tm=2}
 }
 /* bölge sınırı: kıyıya doğru ilerliyorsa daha derin yöne döner */
 if(spd>0){
  const here=sdAt(a.x,a.z),ahead=sdAt(a.x+Math.sin(head)*5,a.z+Math.cos(head)*5);
  if(ahead<minSd&&ahead<=here+1){
   let bd=head,bv=-1;
   for(let k=0;k<8;k++){const th=k*.785,v=sdAt(a.x+Math.sin(th)*6,a.z+Math.cos(th)*6);if(v>bv){bv=v;bd=th}}
   head=bd;if(a.ss===2){a.ss=1;a.st=2}
  }else if(a.coastal&&ahead>SHARK_MIN-6&&ahead>=here){
   /* kıyıya yakın gezen köpek balığı derin açığa kaçmaz: kıyı şeridine (~14 kare) geri döner */
   let bd=head,bv=1e9;
   for(let k=0;k<8;k++){const th=k*.785,v=Math.abs(sdAt(a.x+Math.sin(th)*6,a.z+Math.cos(th)*6)-14);if(v<bv){bv=v;bd=th}}
   head=bd;
  }
 }
 let want=a.coastal?wy-.4:wy-.62;
 if(!a.coastal&&a.ss>=1&&play&&G.head&&G.pz!==undefined)want=clamp(G.pz-.25,gy+.2,wy-.5);
 if(a.ss===3)want=Math.min(want,wy-1.1);
 want=Math.max(want,gy+.2);
 const nb=a.by+(want-a.by)*Math.min(1,2.2*dt);a.vy=(nb-a.by)/Math.max(dt,.001);a.by=nb;
 return {head,spd};
}
HG.seaAI=seaAI;

/* ---- Canlıların oluşması ve uzaklaşınca silinmesi ---- */
function spawn(t,x,z){
 const a=HG.makeAnimals([{t,x,z,yaw:rnd()*6.283}])[0];
 a.dyn=1;
 if(ANIMAL[t].sea){a.by=HG.sc.WY-.6;a.ss=0;a.tm=1+rnd()*3;a.cd=2}
 G.animals.push(a);return a;
}
function near(t,x,z,R){let c=0;for(const a of G.animals)if(a.t===t&&!a.dying&&(R===undefined||Math.hypot(a.x-x,a.z-z)<R))c++;return c}
function hasWaterNeighbour(i){return G.tile[i-1]<=T.SHAL||G.tile[i+1]<=T.SHAL||G.tile[i-W]<=T.SHAL||G.tile[i+W]<=T.SHAL}
function updateSea(dt){
 G.seaT=(G.seaT||0)-dt;if(G.seaT>0)return;
 G.seaT=1.6;
 G.mask=HG.count('mask')>0;
 if(!G.animals||G.cave)return;
 const L=G.animals,px=G.px,pz=G.py;
 /* uzak bir balina çağrısı: yalnızca açık denizde */
 G.whaleT=(G.whaleT===undefined?60+rnd()*90:G.whaleT)-1.6;
 if(G.whaleT<=0){
  G.whaleT=100+rnd()*120;
  const wi=tileIdx(px,pz);
  if(wi>=0&&G.sdist&&G.sdist[wi]>20&&(G.swim||G.onRaft))HG.snd('whale');
 }
 /* uzaktaki canlılar silinir */
 for(let k=L.length-1;k>=0;k--){
  const a=L[k];if(!a.dyn||a.dying)continue;
  if((a.x-px)**2+(a.z-pz)**2>115*115&&!(HG.coopOther&&HG.coopOther(a,115)))L.splice(k,1);
 }
 let nd=0;for(const a of L)if(a.dyn&&!a.dying)nd++;
 if(nd>=22)return;
 const ang=rnd()*6.283;
 /* köpek balığı: açık denizde */
 G.sharkCd=(G.sharkCd||0)-1.6;
 if(G.sharkCd<=0&&near('shark')<3&&!HG.cfg.peace){                         /* Barış modu: köpek balığı ve denizanası çıkmaz */
  const d=32+rnd()*30,x=px+Math.cos(ang)*d,z=pz+Math.sin(ang)*d,i=tileIdx(x,z);
  const coast=rnd()<COASTAL_P&&!L.some(q=>q.coastal&&!q.dying);              /* çok nadir: kıyıya yakın yüzeyde gezinen tek köpek balığı */
  const lo=coast?SHARK_COAST:SHARK_MIN,hi=coast?SHARK_MIN-6:999;
  if(i>=0&&G.tile[i]===T.DEEP&&G.sdist&&G.sdist[i]>=lo&&G.sdist[i]<=hi&&HG.swimmable.fish(x,z)&&near('shark',x,z,45)<1){
   const a=spawn('shark',x,z);if(coast){a.coastal=true;a.life=110+rnd()*80;a.by=HG.sc.WY-.4}
   G.sharkCd=30+rnd()*40;
  }
 }
 /* denizanası: kıyıya yakın sularda */
 if(!HG.cfg.peace&&near('jelly',px,pz,70)<5&&rnd()<.6){
  const d=24+rnd()*34,x=px+Math.cos(ang+2)*d,z=pz+Math.sin(ang+2)*d,i=tileIdx(x,z);
  if(i>=0&&(G.tile[i]===T.DEEP||G.tile[i]===T.SHAL)&&G.sdist&&G.sdist[i]>=2&&G.sdist[i]<=45&&HG.swimmable.jelly(x,z)&&near('jelly',x,z,12)<1)spawn('jelly',x,z);
 }
 /* yengeç: kumsalda */
 if(near('crab',px,pz,60)<5&&rnd()<.6){
  /* kumsal şeridi dar olduğundan tek tick içinde birkaç nokta denenir */
  for(let q=0;q<10;q++){
   const aa=rnd()*6.283,d=10+rnd()*34,x=px+Math.cos(aa)*d,z=pz+Math.sin(aa)*d,i=tileIdx(x,z);
   if(i>=0&&G.tile[i]===T.SAND&&!G.obj[i]&&hasWaterNeighbour(i)&&near('crab',x,z,10)<1&&!(G.villages||[]).some(v=>Math.hypot(v.cx-x,v.cy-z)<14)){
    const a=spawn('crab',Math.floor(x)+.5,Math.floor(z)+.5);a.tm=rnd()*2;break;
   }
  }
 }
}
HG.updateSea=updateSea;

/* ---- Balık tutma: bölgeye göre balık çeşidi ---- */
function fishNeed(){return (3+Math.random()*4)*(1-.15*HG.perk('sail'))}
function catchFish(tl,x,y){
 if(rnd()>=.78+.04*HG.perk('sail')){HG.toast('Balık kaçtı.');return}
 let id='fish';
 if(tl!==T.POND){
  const sd=G.sdist?G.sdist[y*W+x]:0,r=rnd();
  if(tl===T.SHAL)id=r<.5?'sardine':r<.85?'fish':'bass';
  else if(sd<16)id=r<.4?'bass':r<.6?'sardine':r<.9?'fish':'tuna';
  else id=r<.45?'tuna':r<.75?'bass':r<.85?'sardine':'fish';
 }
 HG.gain(id,1);
}
HG.catchFish=catchFish;HG.fishNeed=fishNeed;

/* ---- Resif ve ada keşfi ---- */
HG.nearReef=()=>{
 for(const r of G.reefs||[])if(Math.hypot(G.px-(r.x+.5),G.py-(r.y+.5))<r.r*1.05)return r;
 return null;
};
function discover(dt){
 G.discT=(G.discT||0)-dt;if(G.discT>0)return;
 G.discT=.6;
 if(G.cave||!G.stats)return;
 for(const q of G.islets||[]){
  const k='isl'+q.id;if(G.flags[k])continue;
  if(Math.hypot(G.px-q.x,G.py-q.y)<q.r+36){
   G.flags[k]=1;G.stats.islets=(G.stats.islets||0)+1;HG.flag('isl_found');
   HG.toast('Yeni bir ada keşfedildi.');HG.xpGain(10);
  }
 }
 for(const q of G.reefs||[]){
  const k='reef'+q.id;if(G.flags[k])continue;
  if(Math.hypot(G.px-(q.x+.5),G.py-(q.y+.5))<q.r+9){
   G.flags[k]=1;G.stats.reefs=(G.stats.reefs||0)+1;
   HG.toast('Bir mercan resifi keşfedildi.');HG.xpGain(8);
  }
 }
}
HG.updateDiscover=discover;
/* kayıt tarafından çağrılır: ada ve resif işaretleri harita için */
HG.seaFlag=k=>!!(G.flags&&G.flags[k]);
})();
