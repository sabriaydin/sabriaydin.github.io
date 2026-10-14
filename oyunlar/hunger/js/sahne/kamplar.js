/* Hunger 3D - sahne: terk edilmiş kamplar (çadır, harabe, taş yığını), sönmüş ateş yeri ve açılabilir sandık */
(()=>{
'use strict';
const S=HG.Scene,sc=HG.sc;
const {blob,merge,part,cyl,cone,box}=sc.g;
const PI=Math.PI;
let seed=1700,mat=null,chestGeo=null,lidGeo=null;
const list=[];
const TIMB=0x4a3322,WOOD=0x8a5a30,WOODL=0xb8864f,STONE=0x8d8d92,STONED=0x6a6a70,IRON=0x2a2a30;
const Bp=(r,c,x,y,z,sx,sy,sz,o)=>{o=o||{};return part(blob(r,o.d===undefined?1:o.d,o.amp===undefined?.05:o.amp,++seed,sx||1,sy||1,sz||1),c,x,y,z,1,1,1,o.rx,o.ry,o.rz,o.j)};
const stoneCf=(x,y,z,nx,ny,nz,c)=>{const a=Math.floor(x*2.6)+Math.floor(y*3.4)*3+Math.floor(z*2.6)*5;c.multiplyScalar(.78+((a*37)&7)/18)};
const logCf=(x,y,z,nx,ny,nz,c)=>{if(Math.floor(y*3.2)%2===0)c.multiplyScalar(.84)};
const plankCf=(x,y,z,nx,ny,nz,c)=>{if(Math.floor((x+z)*3.4)%2===0)c.multiplyScalar(.86)};
const hsh=(a,b)=>{const x=Math.sin(a*12.9898+b*78.233)*43758.5453;return x-Math.floor(x)};

/* sandık gövdesi ve kapağı (yerel: ön yüz +z, menteşe arkada) */
function chestParts(){
 const B=[part(box(1.0,.5,.66),WOOD,0,.25,0),part(box(1.04,.06,.7),IRON,0,.06,0),part(box(.08,.5,.7),IRON,-.4,.25,0),part(box(.08,.5,.7),IRON,.4,.25,0),part(box(.14,.16,.04),0xd9b030,0,.42,.34)];
 B[0].cf=plankCf;
 const L=[part(box(1.0,.16,.66),WOOD,0,.08,.33),part(box(.96,.1,.5),WOOD,0,.19,.33),part(box(.08,.2,.7),IRON,-.4,.1,.33),part(box(.08,.2,.7),IRON,.4,.1,.33)];
 L[0].cf=plankCf;
 return [merge(B,{ao:.85,jit:.08}),merge(L,{jit:.08})];
}
function campParts(c,P){
 const ry=c.q*PI/2,cs=Math.round(Math.cos(ry)),sn=Math.round(Math.sin(ry)),ox=c.x+.5,oz=c.y+.5;
 const W2=(a,b)=>[ox+a*cs+b*sn,oz-a*sn+b*cs];
 const p=(geo,col,a,ly,b,sx,sy,sz,rx,ryy,rz,cf)=>{const [x,z]=W2(a,b);const q=part(geo,col,x,S.groundY(x,z)+ly,z,sx,sy,sz,rx||0,(ryy||0)+ry,rz||0);if(cf)q.cf=cf;P.push(q);return q};
 const bp=(r,col,a,ly,b,sx,sy,sz,o)=>{const [x,z]=W2(a,b);const q=Bp(r,col,x,S.groundY(x,z)+ly,z,sx,sy,sz,o);q.m=new THREE.Matrix4().compose(new THREE.Vector3(x,S.groundY(x,z)+ly,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,ry+((o&&o.ry)||0),0)),new THREE.Vector3(1,1,1));P.push(q)};
 const id=c.id;
 /* sönmüş ateş yeri */
 const fire=(a,b)=>{
  for(let i=0;i<9;i++){const t=i/9*6.283;bp(.17+hsh(id,i)*.07,[0x7a7a82,0x6a6a72,0x8d8d92][i%3],a+Math.cos(t)*.55,.12,b+Math.sin(t)*.55,1.1,.8,1,{d:1,amp:.08})}
  p(cyl(.42,.46,.04,12),0x1c1a1c,a,.02,b);
  p(cyl(.07,.07,.8,6),0x2a1c14,a-.1,.1,b,1,1,1,0,.4,PI/2,logCf);p(cyl(.06,.06,.7,6),0x2a1c14,a+.12,.08,b+.1,1,1,1,0,-.6,PI/2,logCf);
 };
 /* sandık yanında eşyalar */
 const stuff=()=>{
  p(box(.6,.5,.5),WOODL,1.6,.25,.3,1,1,1,0,.3,0,plankCf);p(box(.64,.06,.54),TIMB,1.6,.5,.3,1,1,1,0,.3,0);
  bp(.22,0x6a5a3a,-.8,.22,.7,1,1.1,.8,{d:1,amp:.04,ry:.4});
 };
 if(c.kind==='tent'){
  const col=[0x8a7a4a,0x5a6a4a,0xa89a7a,0x7a5a4a][id%4];
  p(cone(1.9,1.8,4),col,-2,.9,0,1,1,1,0,PI/4,0,(x,y,z,nx,ny,nz,cc)=>{if(Math.floor(y*5)%2===0)cc.multiplyScalar(.9)});
  p(cyl(.03,.03,.5,5),TIMB,-2,2.0,0);
  bp(.25,0x4a4036,-.9,.12,0,1.8,.35,1.6,{d:1,amp:.03});
  p(cyl(.025,.025,.5,5),TIMB,-1.2,.2,1.5,1,1,1,0,0,.4);p(cyl(.025,.025,.5,5),TIMB,-1.2,.2,-1.5,1,1,1,0,0,.4);
  fire(-.8,3.6);
  p(cyl(.03,.03,.9,5),WOOD,-.8,.45,2.9);p(cyl(.03,.03,.9,5),WOOD,-.8,.45,4.3);p(cyl(.02,.02,1.4,5),WOOD,-.8,.9,3.6,1,1,1,PI/2,0,0);
  p(cyl(.14,.12,.18,8),IRON,-.8,.7,3.6);
  p(cyl(.18,.18,1.2,8),0x6a4a2a,1.6,.18,3.6,1,1,1,0,.2,PI/2,logCf);p(cyl(.18,.18,1.2,8),0x6a4a2a,-2.6,.18,3.4,1,1,1,0,-.3,PI/2,logCf);
  stuff();
 }else if(c.kind==='ruin'){
  const hs=[1.3,2.5,.8,2.1,1.5];
  for(let a=-2;a<=2;a++){
   const h=hs[(a+2+id)%5];
   p(box(1.0,h,.62),STONE,a,h/2,-1,1,1,1,0,0,0,stoneCf);
   bp(.35,STONED,a+(hsh(id,a)-.5)*.3,h+.05,-1,1.3,.6,.9,{d:1,amp:.1});
  }
  p(cyl(.3,.34,2.4,9),0x9a9aa0,-2.2,.32,2.4,1,1,1,0,.5,PI/2,stoneCf);p(cyl(.3,.34,1.6,9),0x9a9aa0,2.4,.32,1.9,1,1,1,0,-.4,PI/2,stoneCf);
  for(let i=0;i<7;i++)bp(.18+hsh(id,i+9)*.14,[0x7a7a82,0x6a6a72,0x8d8d92][i%3],(hsh(id,i)-.5)*5,.12,.7+hsh(id,i+3)*2.6,1,.7,1,{d:1,amp:.1});
  p(cyl(.28,.2,.3,10),IRON,2.1,.55,.8);p(cyl(.05,.05,.55,6),IRON,2.1,.2,.8);bp(.14,0x1c1a1c,2.1,.74,.8,1.3,.4,1.3,{d:1,amp:.06});
  fire(-1.2,3.4);
  stuff();
 }else if(c.kind==='vault'){
  /* mühürlü hazine odası: taş kürsü, dört sütun, kafatasları */
  p(cyl(2.3,2.5,.22,14),0x4a494f,0,.11,0,1,1,1,0,0,0,stoneCf);
  p(cyl(1.7,1.85,.18,14),0x66656c,0,.31,0,1,1,1,0,0,0,stoneCf);
  for(let i=0;i<4;i++){
   const t=i*PI/2+PI/4,h=1.9-.35*(i%2),ax=Math.cos(t)*2.0,bz=Math.sin(t)*2.0;
   p(cyl(.22,.27,h,8),0x77757c,ax,h/2+.2,bz,1,1,1,0,0,0,stoneCf);
   bp(.3,0x5c5a60,ax,h+.25,bz,1,.7,1,{d:1,amp:.08});
   bp(.13,0xe8e4d6,Math.cos(t)*1.35,.52,Math.sin(t)*1.35,1,1,1.1,{d:1,amp:.04});
  }
  for(let i=0;i<5;i++){const t=hsh(id,i)*6.28,rr=2.4+hsh(id,i+5)*.9;p(cyl(.02,.02,.34,5),0xe8e4d6,Math.cos(t)*rr,.04,Math.sin(t)*rr,1,1,1,PI/2,t,0)}
 }else{
  for(let a=-1;a<=1;a++){const r=.95+hsh(id,a+4)*.35;bp(r,[0x7a7a82,0x6a6a72,0x8d8d92][(a+1+id)%3],a,r*.7,-1,1.1,.95,1,{d:2,amp:.12})}
  for(let i=0;i<9;i++){const t=hsh(id,i)*6.28,rr=1.2+hsh(id,i+5)*1.5;bp(.2+hsh(id,i+8)*.18,[0x7a7a82,0x8d8d92,0x6a6a72][i%3],Math.cos(t)*rr,.14,Math.sin(t)*rr+.3,1,.7,1,{d:1,amp:.1})}
  p(cyl(.025,.03,1.3,5),0x8a5a30,1.7,.6,1.1,1,1,1,0,0,.12);p(box(.06,.5,.02),0xc3c9d0,1.76,1.35,1.1,1,1,1,0,0,.12);
  bp(.13,0xe8e4d6,-1.5,.12,1.4,1,.9,1.1,{d:1,amp:.02});
  for(let i=0;i<3;i++)p(cyl(.025,.025,.3,5),0xe8e4d6,-1.3+i*.25,.05,1.7+i*.15,1,1,1,0,i,PI/2);
  stuff();
 }
}
function clearAll(){
 for(const k of list){sc.scene.remove(k.g);k.g.traverse(o=>{if(o.geometry&&o.geometry!==chestGeo&&o.geometry!==lidGeo)o.geometry.dispose()})}
 list.length=0;
}
function build(G){
 clearAll();
 if(!mat)mat=sc.mat({roughness:.9,pbr:true});
 if(!chestGeo){const [a,b]=chestParts();chestGeo=a;lidGeo=b}
 for(const c of G.camps||[]){
  const g=new THREE.Group(),P=[];
  campParts(c,P);
  const m=new THREE.Mesh(merge(P,{ao:.85,jit:.09}),mat);m.castShadow=true;m.receiveShadow=true;g.add(m);
  /* sandık */
  const cx=c.x+.5,cz=c.y+.5,cg=new THREE.Group();
  cg.position.set(cx,S.groundY(cx,cz),cz);cg.rotation.y=c.q*PI/2;
  const base=new THREE.Mesh(chestGeo,mat);base.castShadow=true;base.receiveShadow=true;cg.add(base);
  const piv=new THREE.Group();piv.position.set(0,.5,-.33);piv.rotation.x=c.open?-1.3:0;
  const lid=new THREE.Mesh(lidGeo,mat);lid.castShadow=true;piv.add(lid);cg.add(piv);
  g.add(cg);
  sc.scene.add(g);list.push({g,c,piv,cx,cz,ang:c.open?-1.3:0});
 }
}
S.onSync(build);
S.onFrame((G,t,dt,info)=>{
 if(!list.length)return;
 const cam=sc.cam.position,play=info.mode==='play';
 for(const k of list){
  const d2=(k.cx-cam.x)**2+(k.cz-cam.z)**2,vis=play&&d2<140*140;
  k.g.visible=vis;if(!vis)continue;
  const tg=k.c.open?-1.3:0;
  if(Math.abs(k.ang-tg)>.002){k.ang+=(tg-k.ang)*(1-Math.exp(-dt*7));k.piv.rotation.x=k.ang}
 }
});
sc.camps=list;
})();
