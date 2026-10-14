/* Hunger 3D - sahne: yüksek ayrıntılı model tanımları (ağaç, kaya, maden, yapılar) — pürüzsüz gölgeleme, gürültü ile bozulmuş formlar */
(()=>{
'use strict';
const {O,hash}=HG;
const sc=HG.sc,S=HG.Scene;
/* --- gürültü: 3B değer gürültüsü --- */
const h3=(x,y,z,s)=>hash(x*73+z*179+s*31,y*131+s,s*7+x*3);
function vn3(x,y,z,s){
 const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),xf=x-xi,yf=y-yi,zf=z-zi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),w=zf*zf*(3-2*zf);
 const L=(a,b,t)=>a+(b-a)*t;
 return L(L(L(h3(xi,yi,zi,s),h3(xi+1,yi,zi,s),u),L(h3(xi,yi+1,zi,s),h3(xi+1,yi+1,zi,s),u),v),L(L(h3(xi,yi,zi+1,s),h3(xi+1,yi,zi+1,s),u),L(h3(xi,yi+1,zi+1,s),h3(xi+1,yi+1,zi+1,s),u),v),w);
}
const fb3=(x,y,z,s)=>vn3(x,y,z,s)*.6+vn3(x*2.1,y*2.1,z*2.1,s+5)*.28+vn3(x*4.3,y*4.3,z*4.3,s+9)*.12;

/* --- geometri yardımcıları --- */
const M4=(x,y,z,sx,sy,sz,rx,ry,rz)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0)),new THREE.Vector3(sx||1,sy||1,sz||1));
const part=(geo,c,x,y,z,sx,sy,sz,rx,ry,rz,jit)=>({geo,c,m:M4(x,y,z,sx,sy,sz,rx,ry,rz),jit});
const alongPart=(geo,c,from,dir,len,sx,sz)=>{
 const d=dir.clone().normalize(),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d),p=from.clone().addScaledVector(d,len/2);
 return {geo,c,m:new THREE.Matrix4().compose(p,q,new THREE.Vector3(sx||1,1,sz||1))};
};
/* Aynı konumdaki köşeleri birleştirir ve yumuşak normaller hesaplar */
function weld(g){
 const p=g.attributes.position,map=new Map(),pos=[],idx=[];
 const src=g.index;
 const n=src?src.count:p.count;
 for(let t=0;t<n;t++){
  const i=src?src.getX(t):t,x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=Math.round(x*5e3)+','+Math.round(y*5e3)+','+Math.round(z*5e3);
  let j=map.get(k);if(j===undefined){j=pos.length/3;map.set(k,j);pos.push(x,y,z)}idx.push(j);
 }
 const o=new THREE.BufferGeometry();o.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));o.setIndex(idx);o.computeVertexNormals();return o;
}
/* Gürültü ile şişirilmiş küre (yaprak öbeği, kaya, çalı) */
function blob(r,detail,amp,seed,sx,sy,sz){
 const g=new THREE.IcosahedronGeometry(1,detail),p=g.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),d=1+(fb3(x*1.7+seed,y*1.7,z*1.7,seed|0)-.5)*2*amp;
  p.setXYZ(i,x*d*r*(sx||1),y*d*r*(sy||1),z*d*r*(sz||1));
 }
 return weld(g);
}
/* Yuvarlatılmış kutu: dilimli kutuyu küreye doğru yumuşatır */
function rbox(w,h,d,k,seg){
 const g=new THREE.BoxGeometry(w,h,d,seg||3,seg||3,seg||3),p=g.attributes.position,v=new THREE.Vector3();
 const r=Math.min(w,h,d)*(k||.18);
 for(let i=0;i<p.count;i++){
  v.set(p.getX(i),p.getY(i),p.getZ(i));
  const ix=Math.max(-1,Math.min(1,v.x/(w/2-r))),iy=Math.max(-1,Math.min(1,v.y/(h/2-r))),iz=Math.max(-1,Math.min(1,v.z/(d/2-r)));
  const cx=ix*(w/2-r),cy=iy*(h/2-r),cz=iz*(d/2-r),dx=v.x-cx,dy=v.y-cy,dz=v.z-cz,l=Math.hypot(dx,dy,dz)||1;
  p.setXYZ(i,cx+dx/l*r,cy+dy/l*r,cz+dz/l*r);
 }
 return weld(g);
}
/* Dilimli, hafif bozulmuş koni/silindir */
function warp(g,amp,seed,radial){
 const p=g.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),n=(fb3(x*3+seed,y*3,z*3,seed|0)-.5)*2*amp;
  if(radial){const l=Math.hypot(x,z)||1;p.setXYZ(i,x+x/l*n,y+n*.3,z+z/l*n)}else p.setXYZ(i,x+n,y,z+n);
 }
 return weld(g);
}
/* Birleştirme: indeksli/indekssiz geometri, köşe başına renk değişimi, sahte ortam kararması */
function merge(parts,opt){
 opt=opt||{};
 const pos=[],nor=[],cl=[],idx=[];let off=0;
 const jd=opt.jit===undefined?.12:opt.jit;
 for(const p of parts){
  const g=p.geo.clone();g.applyMatrix4(p.m);
  if(!g.attributes.normal)g.computeVertexNormals();
  const pa=g.attributes.position,na=g.attributes.normal,c=sc.col(p.c),j=p.jit===undefined?jd:p.jit,cf=p.cf||opt.cf;
  const tmp=new THREE.Color();
  for(let i=0;i<pa.count;i++){
   const x=pa.getX(i),y=pa.getY(i),z=pa.getZ(i),nx=na.getX(i),ny=na.getY(i),nz=na.getZ(i);
   pos.push(x,y,z);nor.push(nx,ny,nz);
   const v=1+(fb3(x*5,y*5,z*5,3)-.5)*2*j;
   tmp.copy(c);if(cf)cf(x,y,z,nx,ny,nz,tmp);
   cl.push(tmp.r*v,tmp.g*v,tmp.b*v);
  }
  if(g.index){for(let i=0;i<g.index.count;i++)idx.push(g.index.getX(i)+off)}
  else for(let i=0;i<pa.count;i++)idx.push(i+off);
  off+=pa.count;g.dispose();
 }
 /* yükseklik tabanlı sahte AO: alt kısımlar koyulaşır */
 if(opt.ao){
  let mn=1e9,mx=-1e9;for(let i=1;i<pos.length;i+=3){mn=Math.min(mn,pos[i]);mx=Math.max(mx,pos[i])}
  for(let i=0;i<cl.length/3;i++){const t=(pos[i*3+1]-mn)/Math.max(.01,mx-mn),f=opt.ao+(1-opt.ao)*Math.pow(t,.8);cl[i*3]*=f;cl[i*3+1]*=f;cl[i*3+2]*=f}
 }
 const o=new THREE.BufferGeometry();
 o.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));o.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));o.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));
 o.setIndex(idx);
 return o;
}
const cyl=(a,b,h,n,hs)=>new THREE.CylinderGeometry(a,b,h,n||8,hs||1),cone=(r,h,n,hs)=>new THREE.ConeGeometry(r,h,n||8,hs||1),ico=(r,d)=>new THREE.IcosahedronGeometry(r,d===undefined?1:d),box=(w,h,d)=>new THREE.BoxGeometry(w,h,d);

/* palmiye yaprağı: ortası kıvrık, uca doğru incelen, aşağı sarkan şerit */
function frond(len,wid,droop,seg){
 const pos=[],idx=[];seg=seg||8;
 for(let i=0;i<=seg;i++){
  const t=i/seg,x=t*len,y=Math.sin(t*1.7)*len*.30-droop*t*t*len,w=wid*Math.pow(1-t,.55)*(.35+.65*Math.sin(Math.min(1,t*1.6+.1)*Math.PI*.5));
  pos.push(x,y+.04,0, x,y-.02,-w, x,y-.02,w);
 }
 for(let i=0;i<seg;i++){const a=i*3,b=a+3;idx.push(a,a+1,b, b,a+1,b+1, a,b,a+2, b,b+2,a+2)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;
}

const MODEL=sc.MODEL={};
sc.g={cyl,cone,ico,box,merge,part,alongPart,blob,rbox,weld,warp,fb3};
S.onInit(()=>{
 /* ---- ağaçlar: oyuncunun (~1.8 m) birkaç katı boyunda; alt dallar göz hizasının üstünde başlar ---- */
 const bark=(x,y,z,nx,ny,nz,c)=>{const a=Math.atan2(x,z),v=.68+.64*vn3(a*5.5,y*.35,.7,8);c.r*=v;c.g*=v;c.b*=v};
 const mkPine=(lo)=>{
  const ps=[part(lo?cyl(.12,.4,6,6,1):warp(cyl(.12,.42,6,11,6),.02,1,true),0x5a3a20,0,3,0,1,1,1,0,0,0,.1)];
  ps[0].cf=bark;
  const n=lo?5:7;
  for(let i=0;i<n;i++){
   const t=i/(n-1),r=2.25*(1-t*.82)*(lo?1.05:1),hh=lo?2.4:1.95,y=2.4+t*5.6+hh*.42;
   const g=lo?cone(r,hh,8,1):warp(cone(r,hh,13,3),.09+t*.03,10+i*3,true);
   const c=new THREE.Color(0x1f5a28).lerp(new THREE.Color(0x428f42),t);
   ps.push(part(g,c.getHex(),0,y,0,1,1,1,0,i*.7,0,.16));
  }
  ps.push(part(lo?cone(.2,.9,6,1):warp(cone(.22,1.1,8,2),0,2,false),0x4e9c4a,0,8.9,0,1,1,1));
  return merge(ps,{ao:.62,jit:.14});
 };
 MODEL.treeA=mkPine(false);MODEL.treeA_lo=mkPine(true);
 const mkOak=(lo)=>{
  const trunk=part(lo?cyl(.2,.55,4.4,7,1):warp(cyl(.2,.55,4.4,12,6),.014,3,true),0x6a4626,0,2.2,0,1,1,1,0,0,0,.1);trunk.cf=bark;
  const flare=part(cone(.7,1.1,lo?7:11,1),0x6a4626,0,.55,0,1,1,1,0,0,0,.1);flare.cf=bark;
  const br=[
   alongPart(cyl(.07,.16,2.3,lo?5:8),0x6a4626,new THREE.Vector3(0,3.6,0),new THREE.Vector3(.8,1,.1),2.3),
   alongPart(cyl(.06,.15,2.1,lo?5:8),0x6a4626,new THREE.Vector3(0,3.9,0),new THREE.Vector3(-.7,1,-.4),2.1),
   alongPart(cyl(.06,.13,1.9,lo?5:8),0x6a4626,new THREE.Vector3(0,3.4,0),new THREE.Vector3(.1,1,.9),1.9),
   alongPart(cyl(.05,.12,1.7,lo?5:8),0x6a4626,new THREE.Vector3(0,4.0,0),new THREE.Vector3(-.2,1,-.9),1.7)
  ];
  br.forEach(p=>{p.cf=bark});
  const cs=[[0,6.4,0,1.95,0x3f8736],[1.55,5.6,.3,1.5,0x4b9a41],[-1.45,5.5,-.4,1.55,0x356f2f],[.3,5.55,1.5,1.45,0x44903b],[-.4,5.9,-1.45,1.5,0x5aa84c],[.6,7.3,.2,1.3,0x62b052],[-.9,6.9,.9,1.2,0x4a9a3e]];
  const use=lo?cs.slice(0,4):cs;
  const bl=use.map(([x,y,z,r,c],i)=>part(blob(r,lo?1:2,.2,20+i*7,1,.85,1),c,x,y,z,1,1,1,0,i,0,.2));
  return merge([trunk,flare,...br,...bl],{ao:.55,jit:.14});
 };
 MODEL.treeB=mkOak(false);MODEL.treeB_lo=mkOak(true);
 const mkPalm=(nuts,lo)=>{
  const top=new THREE.Vector3(1.05,7.0,0);
  const ps=[];
  for(let i=0;i<10;i++){const t0=i/10;ps.push(part(cyl(.2-i*.006,.23-i*.006,.76,lo?6:9,1),i%2?0x9a7a48:0x7f6038,t0*1.05,.36+i*.67,0,1,1,1,0,0,-.15*(1-t0*.4),.25))}
  ps[0].cf=bark;
  ps.push(part(blob(.32,lo?1:1,.15,5),0x4a7a33,top.x,top.y,top.z));
  const fr=frond(3.4,.62,.6,lo?5:10),nf=lo?6:10;
  for(let i=0;i<nf;i++){
   const a=i/nf*Math.PI*2+i*.17,sc3=.85+((i*37)%10)/40;
   ps.push({geo:fr,c:i%2?0x3d8a38:0x4ea044,m:new THREE.Matrix4().compose(top.clone().add(new THREE.Vector3(0,.04,0)),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,a,0)),new THREE.Vector3(sc3,sc3,sc3)),jit:.14});
  }
  if(nuts)for(const [dx,dy,dz] of [[.22,-.28,.14],[-.2,-.3,.18],[.04,-.36,-.26],[.18,-.4,.2]])ps.push(part(blob(.17,1,.08,9),0x5b3a1c,top.x+dx,top.y+dy,top.z+dz));
  return merge(ps,{ao:.7});
 };
 MODEL.palm=mkPalm(true,false);MODEL.palm0=mkPalm(false,false);MODEL.palm_lo=mkPalm(true,true);MODEL.palm0_lo=mkPalm(false,true);
 /* ---- kaya ve madenler ---- */
 const moss=(x,y,z,nx,ny,nz,c)=>{if(ny>.55){const k=Math.min(1,(ny-.55)*2.2)*(.4+.6*fb3(x*3,y*3,z*3,15));c.r=c.r*(1-k)+.22*k;c.g=c.g*(1-k)+.4*k;c.b=c.b*(1-k)+.16*k}};
 const strata=(x,y,z,nx,ny,nz,c)=>{const b=Math.sin(y*14+fb3(x*2,y,z*2,4)*5)*.5+.5;const v=.88+b*.2;c.r*=v;c.g*=v;c.b*=v};
 const rockP=(c1,c2,cf)=>[
  part(blob(.52,2,.28,31,1,.74,.92),c1,0,.3,0,1,1,1,0,.5,0,.16,),
  part(blob(.3,2,.3,37,1,.85,1),c2,.3,.17,.17,1,1,1,0,0,0,.16),
  part(blob(.22,2,.3,41),c2,-.33,.13,-.1,1,1,1,0,0,0,.16)
 ].map(p=>{p.cf=cf;return p});
 const rcf=(x,y,z,nx,ny,nz,c)=>{strata(x,y,z,nx,ny,nz,c);moss(x,y,z,nx,ny,nz,c)};
 MODEL.rock=merge(rockP(0x8d8b88,0x77757a,rcf),{ao:.7});
 const crystal=(c,x,y,z,r,l,rz,rx)=>part(blob(1,1,.12,Math.round(x*50+y*30),r,l,r),c,x,y,z,1,1,1,rx||0,0,rz||0,.08);
 const ore=(c,cEm)=>merge(rockP(0x5e5e68,0x4c4c56,strata).concat([
  crystal(c,.22,.52,.2,.11,.24,-.3,.2),crystal(c,-.16,.47,.3,.1,.2,.4,-.2),crystal(c,.04,.64,-.14,.12,.26,.1,.1),crystal(c,.38,.3,-.2,.09,.19,-.7),crystal(c,-.38,.26,.18,.09,.17,.6)
 ]),{ao:.74});
 MODEL.coal=ore(0x15151a);MODEL.copper=ore(0xd0793a);MODEL.iron=ore(0xcaa98c);
 /* kademeli parçalanma: kaya/maden ilerledikçe küçülen parçalar */
 const stageModel=(st,c1,c2,cf,cry)=>{
  const ps=st===1
   ?[part(blob(.46,2,.28,31,1,.68,.9),c1,0,.23,0,1,1,1,0,.5,0,.16),part(blob(.2,2,.3,41),c2,-.3,.1,-.12,1,1,1,0,0,0,.16)]
   :[part(blob(.28,2,.28,31,1,.7,.9),c1,.02,.13,0,1,1,1,0,.5,0,.16),part(blob(.1,1,.3,45),c2,.28,.05,.2,1,1,1,0,0,0,.16)];
  ps.forEach(q=>{q.cf=cf});
  if(cry)(st===1?cry.slice(0,3):cry.slice(0,1)).forEach(q=>ps.push(q));
  return merge(ps,{ao:.74});
 };
 for(const [k,c,cry] of [['rock',0,null],['coal',0x15151a,1],['copper',0xd0793a,1],['iron',0xcaa98c,1]]){
  const c1=k==='rock'?0x8d8b88:0x5e5e68,c2=k==='rock'?0x77757a:0x4c4c56,cf=k==='rock'?rcf:strata;
  const cr=cry?[crystal(c,.22,.5,.2,.1,.22,-.3,.2),crystal(c,-.16,.45,.28,.09,.18,.4,-.2),crystal(c,.04,.6,-.14,.1,.22,.1,.1)]:null;
  MODEL[k+'_s1']=stageModel(1,c1,c2,cf,cr);MODEL[k+'_s2']=stageModel(2,c1,c2,cf,cr?[crystal(c,.04,.34,.02,.09,.16,.1,.1)]:null);
 }
 /* ---- çalılar ---- */
 const bush=(b)=>{
  const ps=[part(blob(.44,2,.2,51,1,.78,1),0x2f7a30,0,.33,0,1,1,1,0,0,0,.2),part(blob(.33,2,.22,53),0x3f9140,.24,.4,.1,1,1,1,0,0,0,.2),part(blob(.3,2,.22,57),0x2a6a2b,-.26,.3,-.1,1,1,1,0,0,0,.2),part(blob(.26,2,.2,59),0x4aa046,.02,.5,-.2,1,1,1,0,0,0,.2)];
  if(b)for(const [x,y,z] of [[.3,.42,.3],[-.2,.5,.34],[.1,.66,-.08],[.44,.3,-.12],[-.4,.3,.14],[0,.35,.5],[.2,.52,.2]])ps.push(part(blob(.06,1,.1,Math.round(x*40)),0xc9283a,x,y,z,1,1,1,0,0,0,.1));
  return merge(ps,{ao:.62});
 };
 MODEL.bush=bush(true);MODEL.bush0=bush(false);
 /* ---- yerleştirilen yapılar ---- */
 const stones=Array.from({length:9},(_,i)=>{const a=i/9*Math.PI*2;return part(blob(.13,2,.3,60+i,1,.8,1),i%2?0x8a8a90:0x6c6c72,Math.cos(a)*.4,.09,Math.sin(a)*.4,1,1,1,0,a,0,.18)});
 MODEL.fireBase=merge([
  part(cyl(.07,.07,.85,8,1),0x5e3a1c,0,.12,0,1,1,1,0,.6,Math.PI/2,.25),part(cyl(.07,.07,.85,8,1),0x4f321a,0,.19,0,1,1,1,0,-.6,Math.PI/2,.25),part(cyl(.065,.065,.7,8,1),0x6a4423,0,.26,0,1,1,1,0,1.5,Math.PI/2,.25),
  ...stones,part(cyl(.3,.34,.05,14),0x15100a,0,.02,0,1,1,1,0,0,0,.3)
 ],{ao:.75});
 const planks=(w,d,y,c)=>part(rbox(w,.07,d,.3,3),c,0,y,0,1,1,1,0,0,0,.14);
 MODEL.bench=merge([
  planks(.98,.62,.82,0xb08050),part(rbox(.98,.06,.64,.3,3),0xc49058,0,.87,0,1,1,1,0,0,0,.12),
  ...[[-.4,-.24],[.4,-.24],[-.4,.24],[.4,.24]].map(p=>part(rbox(.1,.78,.1,.3,2),0x5a3a1e,p[0],.39,p[1])),
  part(rbox(.92,.06,.06,.3,2),0x4a2f18,0,.25,.24),part(rbox(.92,.06,.06,.3,2),0x4a2f18,0,.25,-.24),
  part(rbox(.3,.05,.09,.3,2),0xcfd3d8,.2,.93,.05),part(rbox(.06,.2,.06,.3,2),0x6b4423,.28,.96,.05),part(rbox(.16,.11,.11,.3,2),0x77777f,-.25,.94,-.05)
 ],{ao:.8});
 MODEL.furn=merge([
  part(rbox(.94,1,.94,.12,4),0x6e6e76,0,.5,0,1,1,1,0,0,0,.14),part(rbox(1,.1,1,.3,3),0x8d8d95,0,1.03,0,1,1,1,0,0,0,.12),
  part(rbox(.32,.6,.32,.2,3),0x66666e,.22,1.35,-.2),part(rbox(.38,.07,.38,.3,2),0x8d8d95,.22,1.68,-.2),
  part(box(.5,.45,.1),0x120d0b,0,.4,.46),
  ...[.25,.5,.75].map(y=>part(box(.955,.03,.955),0x50505a,0,y,0))
 ],{ao:.8});
 const log=(y,alongX,c)=>part(cyl(.17,.17,1.06,12,1),c,0,y,0,1,1,1,alongX?0:0,0,alongX?Math.PI/2:0,.2);
 const logZ=(y,c)=>part(cyl(.17,.17,1.06,12,1),c,0,y,0,1,1,1,Math.PI/2,0,0,.2);
 MODEL.wallw=merge([
  log(.17,true,0xa67848),logZ(.49,0x98693c),log(.81,true,0xae7e4c),logZ(1.13,0x9c6d40),
  part(rbox(1.04,.07,1.04,.3,2),0x7a5432,0,1.29,0,1,1,1,0,0,0,.15)
 ],{ao:.78});
 const blk=(x,y,w,c)=>part(rbox(w,.42,1,.2,3),c,x,y,0,1,1,1,0,0,0,.2);
 MODEL.walls=merge([
  blk(-.25,.21,.5,0x8a8a92),blk(.26,.21,.48,0x7d7d86),blk(-.5+.2,.64,.42,0x94949c),blk(.18,.64,.6,0x84848c),
  blk(-.28,1.07,.46,0x8e8e96),blk(.25,1.07,.52,0x7a7a83),part(rbox(1.04,.08,1.04,.3,2),0xa0a0a8,0,1.31,0,1,1,1,0,0,0,.14)
 ],{ao:.76,jit:.14});
 MODEL.door=merge([
  part(rbox(.13,1.32,.17,.3,2),0x4a2f18,-.46,.66,0),part(rbox(.13,1.32,.17,.3,2),0x4a2f18,.46,.66,0),part(rbox(1.05,.13,.17,.3,2),0x4a2f18,0,1.3,0),
  ...[-.3,-.15,0,.15,.3].map((x,i)=>part(rbox(.15,1.16,.09,.3,2),i%2?0x7a5430:0x84603a,x,.6,0)),
  part(box(.78,.07,.1),0x2c2c32,0,.34,0),part(box(.78,.07,.1),0x2c2c32,0,.9,0),part(blob(.05,1,.05,3),0xd2b24a,.3,.65,.09)
 ],{ao:.82});
 MODEL.matPlain=sc.mat();
 MODEL.matDS=sc.mat({side:THREE.DoubleSide});
});
})();
