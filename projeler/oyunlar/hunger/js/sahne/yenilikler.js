/* Hunger 3D - güncelleme 49 görselleri: ekin aşamaları, rafta asılı yiyecekler, varil suyu, tuzakta av, kayan yıldızlar, gökkuşağı, kuş sürüleri,
   dürbün kullanırken elin gizlenmesi. Oyun durumunu (G.ext) yalnızca okur. */
(()=>{
'use strict';
const S=HG.Scene,sc=HG.sc,{O,W}=HG;
const PI=Math.PI,rnd=Math.random,R=(a,b)=>a+rnd()*(b-a);
const GROW=300,CAP=8;
let grp=null,waterMat=null;
const vis=new Map();                         /* kare -> {sig,obj}: yapıların üstüne eklenen dinamik görseller */
let tAcc=0;

S.onInit(()=>{
 grp=new THREE.Group();grp.name='yenilikler';sc.scene.add(grp);
 waterMat=new THREE.MeshStandardMaterial({color:0x3f90d6,roughness:.12,metalness:.1,transparent:true,opacity:.86});
 initSky();
});

/* ---------- Yapıların üstündeki dinamik görseller ---------- */
const mesh=geo=>{const m=new THREE.Mesh(geo,sc.MODEL.matPlain);m.castShadow=true;m.receiveShadow=true;return m};
function build(e,i,x,z){
 const M=sc.MODEL,hh=HG.hash(x,z,21);
 if(e.o===O.PLOT){
  const s=e.g<0?0:e.g<100?1:e.g<GROW?2:3;
  return {sig:'p'+s,make:()=>s&&M.crop?mesh(M.crop[s]):null};
 }
 if(e.o===O.BARREL){
  const q=Math.floor(e.w*2);
  return {sig:'b'+q,make:()=>{
   if(q<1||!M.barrelWater)return null;
   const w=new THREE.Mesh(M.barrelWater,waterMat);w.position.y=.12+(Math.min(CAP,e.w)/CAP)*.78;return w;
  }};
 }
 if(e.o===O.RACK){
  const sig='r'+e.it.map(q=>(q.t>0?(q.r==='meat'?'a':'f'):'d')).join('');
  return {sig,make:()=>{
   if(!e.it.length)return null;
   const g=new THREE.Group();g.rotation.y=hh<.5?0:PI/2;
   e.it.forEach((q,k)=>{
    const geo=q.t>0?(q.r==='meat'?M.rackRaw:M.rackFish):M.rackDry;
    if(!geo)return;
    const m=mesh(geo);m.position.set(-.33+k*.22,1.4,0);g.add(m);
   });
   return g;
  }};
 }
 if(e.o===O.SNARE){
  return {sig:e.c?'s1':'s0',make:()=>{
   if(!e.c||!M.snareCatch)return null;
   const m=mesh(M.snareCatch);m.rotation.y=hh*6.28;m.position.y=0;return m;
  }};
 }
 return null;
}
function syncVis(G){
 const st=G.ext&&G.ext.s?G.ext.s:{},seen=new Set();
 for(const k in st){
  const e=st[k],i=+k;
  if(G.obj[i]!==e.o)continue;
  const x=i%W,z=(i/W)|0,b=build(e,i,x,z);
  if(!b)continue;
  seen.add(i);
  const cur=vis.get(i);
  if(cur&&cur.sig===b.sig)continue;
  if(cur&&cur.obj)grp.remove(cur.obj);
  const obj=b.make();
  if(obj){
   const holder=new THREE.Group();holder.position.set(x+.5,S.groundY(x+.5,z+.5),z+.5);holder.add(obj);grp.add(holder);
   vis.set(i,{sig:b.sig,obj:holder});
  }else vis.set(i,{sig:b.sig,obj:null});
 }
 for(const [i,c] of vis)if(!seen.has(i)){if(c.obj)grp.remove(c.obj);vis.delete(i)}
}

/* ---------- Gökyüzü: kayan yıldız, gökkuşağı, kuş sürüsü ---------- */
let met=null,metGeo=null,metMat=null,metT=8,metLife=0,metP0=new THREE.Vector3(),metV=new THREE.Vector3();
let rb=null,rbMat=null,rbT=0,prevRain=0;
let flocks=[],birdT=40,birdMat=null,birdGeo=null;
const _v=new THREE.Vector3(),_w=new THREE.Vector3(),_c=new THREE.Vector3();

function initSky(){
 /* kayan yıldız: kamerayı gören ince şerit, uca doğru sönen renk */
 metGeo=new THREE.BufferGeometry();
 metGeo.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(12),3));
 metGeo.setAttribute('color',new THREE.Float32BufferAttribute([1,1,1,1,1,1,0,0,0,0,0,0],3));
 metGeo.setIndex([0,1,2,2,1,3]);
 metMat=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide,toneMapped:false});
 met=new THREE.Mesh(metGeo,metMat);met.frustumCulled=false;met.renderOrder=-8;met.visible=false;sc.scene.add(met);
 /* gökkuşağı: yarım halka, yedi renk bandı */
 const TS=64,PS=7,rg=new THREE.RingGeometry(200,236,TS,PS,0,PI),cols=[0x7a3fd0,0x4b52d8,0x3f90d6,0x4fc26a,0xe8d84a,0xf0953a,0xe0463c],col=new Float32Array(rg.attributes.position.count*3),tmp=new THREE.Color();
 for(let v=0;v<rg.attributes.position.count;v++){tmp.setHex(cols[Math.min(PS-1,Math.floor(v/(TS+1)))]);col[v*3]=tmp.r;col[v*3+1]=tmp.g;col[v*3+2]=tmp.b}
 rg.setAttribute('color',new THREE.BufferAttribute(col,3));
 rbMat=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:0,depthWrite:false,fog:false,side:THREE.DoubleSide,toneMapped:false});
 rb=new THREE.Mesh(rg,rbMat);rb.frustumCulled=false;rb.renderOrder=-8;rb.visible=false;sc.scene.add(rb);
 /* kuşlar: koyu siluet, iki kanat */
 birdGeo=new THREE.PlaneGeometry(1.5,.6);birdGeo.rotateX(-PI/2);birdGeo.translate(.75,0,0);
 birdMat=new THREE.MeshBasicMaterial({color:0x1d2227,side:THREE.DoubleSide,fog:false});
}
function meteorStep(G,t,dt,L,play){
 if(!play||L>.22||(sc.rain||0)>.3){met.visible=false;metLife=0;return}
 if(metLife<=0){
  metT-=dt;
  if(metT<=0){
   metT=R(14,42);metLife=R(.7,1.1);
   const a=rnd()*PI*2,e=R(.35,1.05),r=Math.cos(e);
   metP0.set(Math.sin(a)*r,Math.sin(e),Math.cos(a)*r).multiplyScalar(150);
   /* hareket yönü: yarıçapa dik, aşağı eğimli */
   _v.set(Math.cos(a),0,-Math.sin(a)).multiplyScalar(rnd()<.5?1:-1);_v.y=-R(.25,.6);metV.copy(_v).normalize().multiplyScalar(R(95,150));
   met.userData.age=0;
  }
  met.visible=false;return;
 }
 const age=met.userData.age+=dt,k=age/metLife;
 if(k>=1){metLife=0;met.visible=false;return}
 met.visible=true;
 _c.copy(sc.cam.position);
 const head=_v.copy(metP0).addScaledVector(metV,age).add(_c);
 const dir=_w.copy(metV).normalize(),tail=new THREE.Vector3().copy(head).addScaledVector(dir,-22);
 const view=new THREE.Vector3().copy(head).sub(_c).normalize(),side=new THREE.Vector3().crossVectors(dir,view).normalize().multiplyScalar(.55);
 const p=metGeo.attributes.position;
 p.setXYZ(0,head.x+side.x,head.y+side.y,head.z+side.z);p.setXYZ(1,head.x-side.x,head.y-side.y,head.z-side.z);
 p.setXYZ(2,tail.x+side.x*.2,tail.y+side.y*.2,tail.z+side.z*.2);p.setXYZ(3,tail.x-side.x*.2,tail.y-side.y*.2,tail.z-side.z*.2);
 p.needsUpdate=true;
 metMat.opacity=Math.sin(Math.min(1,k)*PI)*.95;
}
function rainbowStep(G,dt,L,play){
 const rain=sc.rain||0;
 if(play&&prevRain>.3&&rain<=.3&&L>.45&&rbT<=0)rbT=110;           /* yağmur dinince gökkuşağı belirir */
 prevRain=rain;
 const on=play&&rbT>0&&rain<.4&&L>.35;
 if(on){
  rbT-=dt;
  const fade=Math.max(0,Math.min(1,(110-rbT)/8,rbT/20)),target=fade*.34*Math.min(1,L*1.2);
  rbMat.opacity+=(target-rbMat.opacity)*Math.min(1,dt*3);
 }else{
  if(!play||rain>.4)rbT=0;
  rbMat.opacity=Math.max(0,rbMat.opacity-dt*.5);
 }
 rb.visible=rbMat.opacity>.01;
 if(!rb.visible)return;
 const sd=sc.sunDirV;let ax=sd?-sd.x:1,az=sd?-sd.z:0;const l=Math.hypot(ax,az)||1;ax/=l;az/=l;      /* güneşin karşısında */
 rb.position.set(sc.cam.position.x+ax*258,sc.cam.position.y-34,sc.cam.position.z+az*258);
 rb.lookAt(sc.cam.position.x,rb.position.y,sc.cam.position.z);
}
function makeBird(){
 const g=new THREE.Group(),a=new THREE.Mesh(birdGeo,birdMat),b=new THREE.Mesh(birdGeo,birdMat);
 b.scale.x=-1;g.add(a,b);g.userData={a,b,ph:rnd()*6.28};return g;
}
function spawnFlock(){
 const n=7+((rnd()*6)|0),az=rnd()*PI*2,dist=R(95,140),alt=R(38,70),sp=R(8,12);
 const c=sc.cam.position,cx=c.x+Math.sin(az)*dist,cz=c.z+Math.cos(az)*dist;
 const sg=rnd()<.5?1:-1,dx=sg*Math.cos(az),dz=-sg*Math.sin(az);       /* yarıçapa dik yön: sürü gökyüzünü yandan geçer */
 const f={x:cx,z:cz,y:c.y+alt,dx,dz,sp,age:0,life:26,birds:[]};
 for(let k=0;k<n;k++){
  const b=makeBird(),row=Math.ceil(k/2),side=k%2?1:-1;
  b.userData.off=[-f.dx*row*3.4+(-f.dz)*side*row*2.6+R(-.6,.6),R(-.8,.8)+row*.15,-f.dz*row*3.4+f.dx*side*row*2.6+R(-.6,.6)];
  b.rotation.y=Math.atan2(f.dx,f.dz);
  sc.scene.add(b);f.birds.push(b);
 }
 flocks.push(f);
 try{HG.snd('gull',{x:cx,y:f.y,z:cz})}catch(e){}
}
function birdStep(G,t,dt,L,play){
 birdT-=dt;
 if(play&&birdT<=0){birdT=R(70,170);if(L>.55&&(sc.rain||0)<.2&&flocks.length<2)spawnFlock()}
 for(let i=flocks.length-1;i>=0;i--){
  const f=flocks[i];
  f.age+=dt;f.x+=f.dx*f.sp*dt;f.z+=f.dz*f.sp*dt;
  const out=f.age>f.life||!play;
  for(const b of f.birds){
   const o=b.userData.off,w=Math.sin(t*9+b.userData.ph)*.7;
   b.position.set(f.x+o[0],f.y+o[1]+Math.sin(t*1.7+b.userData.ph)*.5,f.z+o[2]);
   b.userData.a.rotation.z=w;b.userData.b.rotation.z=-w;
  }
  if(out){for(const b of f.birds)sc.scene.remove(b);flocks.splice(i,1)}
 }
}

S.onFrame((G,t,dt,info)=>{
 const play=info.mode==='play';
 if(grp)grp.visible=play;
 if(play){
  tAcc-=dt;
  if(tAcc<=0){tAcc=.3;syncVis(G)}
  /* dürbünle bakarken el modeli gizlenir */
  if((sc.zoomK||0)>.35&&sc.viewmodel)sc.viewmodel.visible=false;
 }else if(vis.size){for(const c of vis.values())if(c.obj)grp.remove(c.obj);vis.clear()}
 if(!met)return;
 const L=info.L;
 meteorStep(G,t,dt,L,play);rainbowStep(G,dt,L,play);birdStep(G,t,dt,L,play);
});
})();
