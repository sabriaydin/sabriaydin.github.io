/* Hunger 3D - mağara üretimi: rastgele odalar, dolambaçlı tüneller, çıkmaz sokaklar, yeraltı havuzları, sandık odası ve yaratık yerleşimi */
(()=>{
'use strict';
const {W,H,T,O,mulberry32,fbm}=HG;
const REG=104,WALLH=6.4;            /* üretim bölgesi (kare) ve duvar yüksekliği */
const FLOOR=.32;                    /* ROCK karesinin taban yüksekliği (arazi.js TH[4]) */

/* Mağara türleri: her mağaranın yapısı, zorluğu ve ödülü farklıdır.
   dar   : uzun ve dar geçitler, az oda, çok çıkmaz; az yaratık, orta ödül
   genis : birkaç büyük salon, geniş tüneller; orta zorluk
   sulu  : yeraltı gölleriyle dolu; dolaşması yavaş, ödülü iyi
   maden : terk edilmiş maden; bol cevher, orta zorluk
   derin : en tehlikelisi; çok yaratık ve en değerli ganimet */
const KIND={
 dar:  {room:[5,1,1],rr:[3.2,2.4],tun:1.0,pool:.12,ore:.8,foe:.85,loot:1,nook:2},
 genis:{room:[6,1,1],rr:[6.0,5.5],tun:1.7,pool:.3, ore:1.0,foe:1.0,loot:1,nook:1},
 sulu: {room:[7,2,2],rr:[4.6,4.2],tun:1.35,pool:.9,ore:.9,foe:1.0,loot:1.4,nook:1},
 maden:{room:[8,2,2],rr:[4.2,3.6],tun:1.2,pool:.2, ore:2.4,foe:1.15,loot:1.2,nook:2},
 derin:{room:[8,2,2],rr:[5.0,4.6],tun:1.3,pool:.35,ore:1.3,foe:1.8,loot:2,nook:2}
};
function genCave(seed,tier,kind){
 const rnd=mulberry32((seed^0x6d2b79f5)>>>0),R=(a,b)=>a+((rnd()*(b-a+1))|0);
 const K=KIND[kind]||KIND.genis;
 const N=W*H,tile=new Uint8Array(N).fill(T.ROCK),obj=new Uint8Array(N),hgt=new Float32Array(N);
 const open=new Uint8Array(N),room=new Uint8Array(N);
 const X0=(W-REG)>>1,Y0=(H-REG)>>1,X1=X0+REG,Y1=Y0+REG;
 const inReg=(x,y)=>x>X0+2&&y>Y0+2&&x<X1-3&&y<Y1-3;
 const nz=(x,y,s)=>fbm(x/3.1,y/3.1,seed+s);
 /* yuvarlak ama düzensiz oda */
 const carveBlob=(cx,cy,r,mark)=>{
  const m=Math.ceil(r*1.5)+1;
  for(let y=Math.floor(cy)-m;y<=cy+m;y++)for(let x=Math.floor(cx)-m;x<=cx+m;x++){
   if(!inReg(x,y))continue;
   const d=Math.hypot(x+.5-cx,y+.5-cy),lim=r*(.82+(nz(x,y,11)-.5)*.95);
   if(d<lim){open[y*W+x]=1;if(mark)room[y*W+x]=mark}
  }
 };
 const carveDisc=(cx,cy,r)=>{
  for(let y=Math.floor(cy-r)-1;y<=cy+r+1;y++)for(let x=Math.floor(cx-r)-1;x<=cx+r+1;x++){
   if(!inReg(x,y))continue;
   if(Math.hypot(x+.5-cx,y+.5-cy)<=r)open[y*W+x]=1;
  }
 };
 /* iki nokta arasında kıvrılan tünel */
 const tunnel=(ax,ay,bx,by,w,wob)=>{
  const dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy)||1,px=-dy/len,py=dx/len,mid=(rnd()-.5)*wob*len*.5,mid2=(rnd()-.5)*wob*len*.4;
  const steps=Math.ceil(len*2);
  for(let i=0;i<=steps;i++){
   const t=i/steps,s=Math.sin(t*Math.PI),o=mid*s+mid2*Math.sin(t*Math.PI*2),j=(nz(ax+dx*t,ay+dy*t,23)-.5)*2.2;
   carveDisc(ax+dx*t+px*(o+j),ay+dy*t+py*(o+j),w+(nz(i*.7,len,29)-.5)*.5);
  }
 };
 /* odalar */
 const rooms=[],nRoom=K.room[0]+tier*K.room[1]+R(0,K.room[2]);
 const ex=X0+REG*.5+(rnd()-.5)*REG*.5,ey=Y1-14-R(0,6);
 rooms.push({x:ex,y:ey,r:5,kind:'start'});
 for(let tries=0;rooms.length<nRoom&&tries<900;tries++){
  const r=K.rr[0]*.6+rnd()*K.rr[1],x=X0+10+rnd()*(REG-20),y=Y0+10+rnd()*(REG-20);
  if(rooms.some(o=>Math.hypot(o.x-x,o.y-y)<o.r+r+9))continue;
  rooms.push({x,y,r,kind:'room'});
 }
 rooms.forEach((o,i)=>{o.id=i+1;carveBlob(o.x,o.y,o.r,i+1)});
 /* en kısa kapsayan ağaç + birkaç döngü */
 const link=new Set(),conn=[0],rest=rooms.map((_,i)=>i).slice(1);
 while(rest.length){
  let bi=-1,bj=-1,bd=1e9;
  for(const i of conn)for(const j of rest){const d=Math.hypot(rooms[i].x-rooms[j].x,rooms[i].y-rooms[j].y);if(d<bd){bd=d;bi=i;bj=j}}
  tunnel(rooms[bi].x,rooms[bi].y,rooms[bj].x,rooms[bj].y,K.tun,.9);link.add(bi+'-'+bj);
  conn.push(bj);rest.splice(rest.indexOf(bj),1);
 }
 for(let k=0;k<2+tier;k++){
  const i=R(0,rooms.length-1),j=R(0,rooms.length-1);
  if(i===j||link.has(i+'-'+j)||link.has(j+'-'+i))continue;
  if(Math.hypot(rooms[i].x-rooms[j].x,rooms[i].y-rooms[j].y)>58)continue;
  tunnel(rooms[i].x,rooms[i].y,rooms[j].x,rooms[j].y,K.tun*.9,1.2);link.add(i+'-'+j);
 }
 /* çıkmaz tüneller: ucunda küçük odacık (hazine köşesi) */
 const nooks=[],nNook=K.nook+tier+R(0,1);
 for(let tries=0;nooks.length<nNook&&tries<80;tries++){
  const o=rooms[R(1,rooms.length-1)],a=rnd()*6.283;
  let x=o.x+Math.cos(a)*(o.r*.7),y=o.y+Math.sin(a)*(o.r*.7),h=a;
  const len=R(10,22);let ok=true;
  const px=x,py=y;
  for(let s=0;s<len;s++){
   h+=(rnd()-.5)*.55;x+=Math.cos(h)*1.1;y+=Math.sin(h)*1.1;
   if(!inReg(x,y)){ok=false;break}
   carveDisc(x,y,1.15);
  }
  if(!ok||Math.hypot(x-px,y-py)<6){continue}
  carveBlob(x,y,2.4,0);nooks.push({x,y});
 }
 /* kenarları pürüzlendir: bir kez hücresel yumuşatma */
 {
  const nw=open.slice();
  for(let y=Y0+1;y<Y1-1;y++)for(let x=X0+1;x<X1-1;x++){
   let c=0;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)if((i||j)&&open[(y+j)*W+x+i])c++;
   const k=y*W+x;if(c>=5)nw[k]=1;else if(c<=1)nw[k]=0;
  }
  open.set(nw);
 }
 /* başlangıçtan ulaşılabilir alan; ulaşılamayanlar kapatılır */
 const sx=Math.floor(ex),sy=Math.floor(ey);
 const dbuf=new Int32Array(N);
 const bfs=(from,blocked)=>{
  const d=dbuf;d.fill(-1);const q=[from];d[from]=0;
  for(let h=0;h<q.length;h++){
   const c=q[h],x=c%W,y=(c/W)|0;
   for(let k=0;k<4;k++){
    const nx=x+(k===0?1:k===1?-1:0),ny=y+(k===2?1:k===3?-1:0),ni=ny*W+nx;
    if(nx<0||ny<0||nx>=W||ny>=H||!open[ni]||d[ni]>=0||(blocked&&blocked[ni]))continue;
    d[ni]=d[c]+1;q.push(ni);
   }
  }
  return d;
 };
 open[sy*W+sx]=1;
 let dist=bfs(sy*W+sx).slice();
 for(let i=0;i<N;i++)if(open[i]&&dist[i]<0)open[i]=0;
 /* sandık odası: başlangıca en uzak oda */
 let vr=rooms[1]||rooms[0],bd=-1;
 for(const o of rooms){if(o.kind==='start')continue;const d=dist[Math.floor(o.y)*W+Math.floor(o.x)];if(d>bd){bd=d;vr=o}}
 vr.kind='vault';
 /* yeraltı havuzları: yürüyüş yolunu kesmiyorsa */
 const pools=[];
 for(const o of rooms){
  if(o.kind!=='room'||o.r<(K.pool>.6?3.4:5.4)||rnd()>K.pool)continue;
  const px=Math.floor(o.x+(rnd()-.5)*o.r*.6),py=Math.floor(o.y+(rnd()-.5)*o.r*.6),pr=R(1,2)+(o.r>7?1:0);
  const mark=[];
  for(let y=py-pr;y<=py+pr;y++)for(let x=px-pr;x<=px+pr;x++){if(Math.hypot(x-px,y-py)<=pr+.2&&open[y*W+x]){mark.push(y*W+x);tile[y*W+x]=T.POND}}
  const blk=new Uint8Array(N);for(const i of mark)blk[i]=1;
  const d2=bfs(sy*W+sx,blk);
  let okp=true;
  for(const t of rooms.concat(nooks)){const i=Math.floor(t.y)*W+Math.floor(t.x);if(open[i]&&!blk[i]&&d2[i]<0){okp=false;break}}
  if(!okp){for(const i of mark)tile[i]=T.ROCK}else pools.push({x:px,y:py,r:pr});
 }
 const pond=i=>tile[i]===T.POND;
 const blk0=new Uint8Array(N);for(let i=0;i<N;i++)if(pond(i))blk0[i]=1;
 dist=bfs(sy*W+sx,blk0).slice();
 /* yükseklikler ve duvar halkası */
 hgt.fill(WALLH);                                   /* bölge dışı: düz kaya kütlesi */
 for(let y=Y0;y<Y1;y++)for(let x=X0;x<X1;x++){
  const i=y*W+x;
  if(open[i]){hgt[i]=.04+(fbm(x/4.5,y/4.5,seed+5)-.5)*.34}
  else hgt[i]=WALLH+(fbm(x/3,y/3,seed+9)-.5)*1.6;
 }
 for(let y=Y0;y<Y1;y++)for(let x=X0;x<X1;x++){
  const i=y*W+x;if(open[i])continue;
  let nb=false;for(let j=-1;j<=1&&!nb;j++)for(let k=-1;k<=1;k++)if(open[(y+j)*W+x+k]){nb=true;break}
  if(nb)obj[i]=O.VWALL;
 }
 /* yaşanır noktalar */
 const freeTile=(x,y)=>{const i=Math.floor(y)*W+Math.floor(x);return open[i]&&!pond(i)&&!obj[i]};
 const wallN=(x,y)=>{let c=0;for(let j=-1;j<=1;j++)for(let k=-1;k<=1;k++){const i=(y+j)*W+x+k;if(!open[i]||pond(i))c++}return c};
 const dsx=x=>dist[Math.floor(x.y)*W+Math.floor(x.x)];
 /* çıkış: başlangıç odasının güney ucu; yakında sönmeyen bir ateş */
 const spawn={x:sx+.5,y:sy+.5};
 let fire=null;
 for(let a=0;a<14&&!fire;a++){
  const fx=sx+R(-3,3),fy=sy+R(-3,3);
  if(Math.hypot(fx-sx,fy-sy)>=2&&freeTile(fx,fy)&&wallN(fx,fy)<=1){fire={x:fx,y:fy};obj[fy*W+fx]=O.FIRE}
 }
 /* sandık */
 const vx=Math.floor(vr.x),vy=Math.floor(vr.y);
 let chest={x:vx,y:vy};
 if(!freeTile(chest.x,chest.y)){for(let r=1;r<5;r++){let f=false;for(let j=-r;j<=r&&!f;j++)for(let i=-r;i<=r;i++)if(freeTile(vx+i,vy+j)){chest={x:vx+i,y:vy+j};f=true;break}if(f)break}}
 /* sandık çevresini boşalt */
 const camps=[{id:'v',x:chest.x,y:chest.y,kind:'vault',q:R(0,3),tier:3,note:R(0,13),open:false,vault:true}];
 /* cevher: yalnızca oda kenarlarında, az sayıda */
 const ores=[];
 const oreAt=(k,n,pool)=>{
  let tries=0,c=0;
  while(c<n&&tries++<400){
   const p=pool[R(0,pool.length-1)],x=Math.floor(p.x+(rnd()-.5)*p.r*1.7),y=Math.floor(p.y+(rnd()-.5)*p.r*1.7),i=y*W+x;
   if(!freeTile(x,y)||wallN(x,y)<3||(Math.hypot(x-sx,y-sy)<7)||Math.hypot(x-chest.x,y-chest.y)<2.5||obj[i])continue;
   if(wallN(x,y)>5)continue;
   obj[i]=k;ores.push({k,x,y});c++;
  }
 };
 const orePool=rooms.concat(nooks.map(n=>({x:n.x,y:n.y,r:3})));
 const oq=v=>Math.max(1,Math.round(v*K.ore));
 oreAt(O.COAL,oq(5+tier),orePool);oreAt(O.COPPER,oq(2+tier),orePool);oreAt(O.IRON,oq(1+tier),orePool);oreAt(O.ROCK,oq(6),orePool);
 /* değerli eşyalar: çıkmaz tünel uçlarında, çok az */
 const drops=[];
 nooks.forEach((nk,i)=>{
  if(i>=Math.round((2+(tier>0?1:0))*K.loot))return;
  let p=null;
  for(let a=0;a<12&&!p;a++){const x=Math.floor(nk.x)+R(-1,1),y=Math.floor(nk.y)+R(-1,1);if(freeTile(x,y))p={x:x+.5,z:y+.5}}
  if(!p)return;
  const gem=rnd()<.45+tier*.1+(K.loot>1.5?.2:0),it=gem?'gem':'gold',n=gem?1:R(1,2)+(K.loot>1.5?1:0);
  drops.push({id:it,n,x:p.x,z:p.z,y:FLOOR+hgt[Math.floor(p.z)*W+Math.floor(p.x)]+.12,vx:0,vz:0,vy:0,age:5,rest:true});
 });
 /* küçük yardım: bir çıkmazda meşale ve bandaj */
 if(nooks.length>2){
  const nk=nooks[nooks.length-1];
  for(const it of [['torch',2],['bandage',1]]){
   for(let a=0;a<12;a++){
    const x=Math.floor(nk.x)+R(-1,1),y=Math.floor(nk.y)+R(-1,1);
    if(freeTile(x,y)){drops.push({id:it[0],n:it[1],x:x+.5,z:y+.5,y:FLOOR+hgt[y*W+x]+.12,vx:0,vz:0,vy:0,age:5,rest:true});break}
   }
  }
 }
 /* yaratıklar: başlangıçtan uzakta, odalarda ve sandığın yanında */
 const foes=[],want=Math.max(1,Math.round((3+tier*2+R(0,2))*K.foe));
 const far=(x,y)=>dist[Math.floor(y)*W+Math.floor(x)]>=16;
 for(let tries=0;foes.length<want&&tries<700;tries++){
  const o=rooms[R(1,rooms.length-1)],x=o.x+(rnd()-.5)*o.r*1.6,y=o.y+(rnd()-.5)*o.r*1.6;
  if(!freeTile(x,y)||!far(x,y)||foes.some(f=>Math.hypot(f.x-x,f.z-y)<5))continue;
  foes.push({t:'shade',x,z:y,yaw:rnd()*6.28});
 }
 for(let k=0;k<2;k++){
  for(let a=0;a<30;a++){
   const x=chest.x+.5+(rnd()-.5)*7,y=chest.y+.5+(rnd()-.5)*7;
   if(freeTile(x,y)&&Math.hypot(x-chest.x-.5,y-chest.y-.5)>2.2){foes.push({t:'shade',x,z:y,yaw:rnd()*6.28});break}
  }
 }
 /* kıyı maskesi (havuzlar) */
 const shore=new Uint8Array(N);
 for(let y=Y0;y<Y1;y++)for(let x=X0;x<X1;x++){
  const i=y*W+x;if(!pond(i))continue;
  let m=0;if(!pond(i-W))m|=1;if(!pond(i+1))m|=2;if(!pond(i+W))m|=4;if(!pond(i-1))m|=8;shore[i]=m;
 }
 /* yüzeyde olmayan her kare okyanus değil; kenar karelerini taşla kapat */
 let cnt=0;for(let i=0;i<N;i++)if(open[i])cnt++;
 return {tile,obj,hgt,shore,open,room,rooms,pools,nooks,ores,drops,foes,camps,sx:spawn.x,sy:spawn.y+1.2,exit:{x:sx,y:sy},fire,chest,area:cnt,tier,kind:kind||'genis',X0,Y0,X1,Y1};
}
HG.genCave=genCave;
HG.CAVE={REG,WALLH,FLOOR};
})();
