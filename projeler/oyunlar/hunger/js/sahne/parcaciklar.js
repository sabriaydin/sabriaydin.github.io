/* Hunger 3D - sahne: gerçekçi parçacıklar
   dökülen yapraklar (rüzgârla savrulur), ateş kıvılcımı ve dumanı, ayak tozu ve su sıçraması,
   su halkaları, yağmur damlası sıçramaları, soğukta nefes buharı */
(()=>{
'use strict';
const S=HG.Scene,sc=HG.sc,{T,O,clamp}=HG;
const rnd=Math.random;
const NLEAF=80,NPUFF=150,NRING=24,NEMB=140;
let leafMesh=null,embers=null;
const leafs=[],puffs=[],rings=[],emb=[];
const dum=new THREE.Object3D(),col=new THREE.Color(),fw=new THREE.Vector3();
const fx=()=>clamp(((HG.cfg&&HG.cfg.fx!==undefined)?HG.cfg.fx:100)/100,0,1);

S.onInit(()=>{
 /* yapraklar */
 const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.8,side:THREE.DoubleSide});sc.mats.push(m);
 leafMesh=new THREE.InstancedMesh(new THREE.PlaneGeometry(.15,.09),m,NLEAF);leafMesh.frustumCulled=false;
 const LC=[0x5f8f3a,0x7aa040,0xb8a030,0xa8702a,0x6a8a30];
 for(let i=0;i<NLEAF;i++){
  leafMesh.setColorAt(i,col.setHex(LC[i%5]));
  leafs.push({on:false,x:0,y:0,z:0,vx:0,vy:0,vz:0,rx:0,ry:0,rz:0,sx:0,sy:0,sz:0,l:0,ph:rnd()*6.28,ground:false});
  dum.position.set(0,-999,0);dum.scale.setScalar(0);dum.updateMatrix();leafMesh.setMatrixAt(i,dum.matrix);
 }
 leafMesh.instanceColor.needsUpdate=true;sc.scene.add(leafMesh);
 /* duman, toz, damla ve nefes sprite havuzu */
 for(let i=0;i<NPUFF;i++){
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:sc.tex.glow,color:0xffffff,transparent:true,depthWrite:false,opacity:0,fog:true}));
  sp.visible=false;sc.scene.add(sp);
  puffs.push({sp,l:0,L:1,vx:0,vy:0,vz:0,s0:.2,s1:1,a:.3,wind:1,g:0});
 }
 /* su halkaları */
 const rg=new THREE.RingGeometry(.09,.13,24);rg.rotateX(-Math.PI/2);
 for(let i=0;i<NRING;i++){
  const r=new THREE.Mesh(rg,new THREE.MeshBasicMaterial({color:0xe8f6ff,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,fog:true}));
  r.visible=false;r.renderOrder=3;sc.scene.add(r);rings.push({m:r,l:0,L:1,s:1});
 }
 /* kıvılcımlar */
 const eg=new THREE.BufferGeometry();
 eg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(NEMB*3),3));eg.setAttribute('color',new THREE.BufferAttribute(new Float32Array(NEMB*3),3));
 embers=new THREE.Points(eg,new THREE.PointsMaterial({size:.07,map:sc.tex.glow,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true,toneMapped:false,fog:false}));
 embers.frustumCulled=false;embers.renderOrder=16;sc.scene.add(embers);
 for(let i=0;i<NEMB;i++)emb.push({l:0,L:1,x:0,y:0,z:0,vx:0,vy:0,vz:0});
});

function puff(o){
 for(const p of puffs){
  if(p.l>0)continue;
  p.l=p.L=o.life;p.vx=o.vx||0;p.vy=o.vy||0;p.vz=o.vz||0;p.s0=o.s0;p.s1=o.s1;p.a=o.a;p.wind=o.wind===undefined?1:o.wind;p.g=o.g||0;
  p.sp.position.set(o.x,o.y,o.z);p.sp.material.color.setHex(o.col===undefined?0xffffff:o.col);p.sp.scale.set(o.s0,o.s0,1);p.sp.visible=true;
  return p;
 }
 return null;
}
function ring(x,y,z,size,life){
 for(const r of rings){
  if(r.l>0)continue;
  r.l=r.L=life;r.s=size;r.m.position.set(x,y,z);r.m.visible=true;r.m.scale.setScalar(size*.5);return;
 }
}
function ember(x,y,z){
 for(const e of emb){
  if(e.l>0)continue;
  e.l=e.L=.8+rnd()*1.1;e.x=x+(rnd()-.5)*.25;e.y=y;e.z=z+(rnd()-.5)*.25;
  e.vx=(rnd()-.5)*.7;e.vy=1+rnd()*1.5;e.vz=(rnd()-.5)*.7;return;
 }
}
const TILEC={[T.SAND]:[0xd9c58b,.38,.55],[T.GRASS]:[0x9aae78,.16,.3],[T.ROCK]:[0xa8a8a8,.22,.35]};
function step(G,sprint,big){
 const tl=G.tile[Math.floor(G.py)*HG.W+Math.floor(G.px)],gy=G.pz!==undefined?G.pz:S.groundY(G.px,G.py),k=fx();
 if(k<=0)return;
 if(tl<=T.SHAL||tl===T.POND){
  ring(G.px,sc.WY+.02,G.py,big?1.6:.9,big?1.3:1.0);
  const n=Math.round((big?7:3)*k*(sprint?1.5:1));
  for(let i=0;i<n;i++){const a=rnd()*6.28,s=.5+rnd()*1.1;puff({x:G.px,y:sc.WY+.05,z:G.py,vx:Math.cos(a)*s,vy:1.4+rnd()*1.4,vz:Math.sin(a)*s,s0:.05,s1:.08,a:.7,life:.55,wind:.1,g:9,col:0xdff0ff})}
  return;
 }
 const c=TILEC[tl];if(!c)return;
 const n=Math.round((big?7:2)*k*(sprint?1.6:1));
 for(let i=0;i<n;i++){const a=rnd()*6.28,s=.3+rnd()*(big?1.1:.6);puff({x:G.px+Math.cos(a)*.15,y:gy+.05,z:G.py+Math.sin(a)*.15,vx:Math.cos(a)*s,vy:.25+rnd()*.35,vz:Math.sin(a)*s,s0:.07,s1:big?.55:.34,a:c[1]*(big?1.4:1),life:.5+rnd()*.4,wind:.6,col:c[0]})}
}
let lastPh=-1,lastLand=0,leafT=0,breathT=2,rainAcc=0,fireAcc=new Map();
S.onFrame((G,t,dt,info)=>{
 if(!leafMesh)return;
 const play=info.mode==='play',w=sc.wind,L=info.L,k=fx();
 leafMesh.visible=play&&k>0;embers.visible=play;
 if(!play)return;
 const cam=sc.cam.position;
 /* ---- yapraklar ---- */
 leafT-=dt;
 if(leafT<=0&&k>0){
  leafT=(1.4/(.35+w.s*1.3))/Math.max(.15,k);
  for(let tr=0;tr<8;tr++){
   const a=rnd()*6.28,r=3+rnd()*20,tx=Math.floor(G.px+Math.cos(a)*r),tz=Math.floor(G.py+Math.sin(a)*r);
   if(tx<1||tz<1||tx>=HG.W-1||tz>=HG.H-1||G.obj[tz*HG.W+tx]!==O.TREE)continue;
   const lf=leafs.find(l=>!l.on);if(!lf)break;
   lf.on=true;lf.ground=false;lf.l=22;lf.x=tx+.5+(rnd()-.5)*1.4;lf.z=tz+.5+(rnd()-.5)*1.4;lf.y=S.groundY(lf.x,lf.z)+3.5+rnd()*3;
   lf.vx=lf.vy=lf.vz=0;lf.rx=rnd()*6;lf.ry=rnd()*6;lf.rz=rnd()*6;lf.sx=(rnd()-.5)*5;lf.sy=(rnd()-.5)*5;lf.sz=(rnd()-.5)*5;lf.ph=rnd()*6.28;
   break;
  }
 }
 let dirty=false;
 for(let i=0;i<NLEAF;i++){
  const lf=leafs[i];if(!lf.on)continue;
  lf.l-=dt;
  if(lf.l<=0||(lf.x-cam.x)**2+(lf.z-cam.z)**2>70*70){lf.on=false;dum.position.set(0,-999,0);dum.scale.setScalar(0);dum.updateMatrix();leafMesh.setMatrixAt(i,dum.matrix);dirty=true;continue}
  let sc2=Math.min(1,lf.l/1.6);
  if(!lf.ground){
   lf.vx+=(w.x*w.s*2.4-lf.vx)*(1-Math.exp(-dt*1.4))+Math.sin(t*2.3+lf.ph)*.5*dt;
   lf.vz+=(w.z*w.s*2.4-lf.vz)*(1-Math.exp(-dt*1.4))+Math.cos(t*1.9+lf.ph)*.5*dt;
   lf.vy+=((-.75+Math.sin(t*3.1+lf.ph)*.3)-lf.vy)*(1-Math.exp(-dt*2.5));
   lf.x+=lf.vx*dt;lf.y+=lf.vy*dt;lf.z+=lf.vz*dt;
   lf.rx+=lf.sx*dt;lf.ry+=lf.sy*dt;lf.rz+=lf.sz*dt;
   const gy=S.groundY(lf.x,lf.z);
   if(lf.y<=gy+.03){lf.y=gy+.03;lf.ground=true;lf.l=Math.min(lf.l,9);lf.rx=-Math.PI/2;lf.rz=0}
  }
  dum.position.set(lf.x,lf.y,lf.z);dum.rotation.set(lf.rx,lf.ry,lf.rz);dum.scale.setScalar(sc2);dum.updateMatrix();leafMesh.setMatrixAt(i,dum.matrix);dirty=true;
 }
 if(dirty)leafMesh.instanceMatrix.needsUpdate=true;
 /* ---- ateşler: duman ve kıvılcım ---- */
 const dayK=.35+.65*L;
 for(const f of sc.fires||[]){
  const d2=(f.x-cam.x)**2+(f.z-cam.z)**2;if(d2>45*45)continue;
  const fk=f.x*1000+f.z;                                  /* anahtar konumdan türetilir: tam senkronda biriken eski kayıtlar olmaz */
  let a=fireAcc.get(fk);if(!a){a={s:0,e:0};fireAcc.set(fk,a)}
  const wet=1-clamp((sc.rain||0)*1.1,0,.85);
  a.s+=dt*(4.5*k)*wet;a.e+=dt*(8*k)*wet;
  while(a.s>=1){a.s--;puff({x:f.x+(rnd()-.5)*.25,y:f.y+.95,z:f.z+(rnd()-.5)*.25,vx:(rnd()-.5)*.25,vy:.8+rnd()*.6,vz:(rnd()-.5)*.25,s0:.22,s1:1.5+rnd()*.5,a:.3*dayK,life:2.6+rnd()*1.2,wind:1.1,col:0x9a9a9a})}
  while(a.e>=1){a.e--;ember(f.x,f.y+.7,f.z)}
 }
 /* kıvılcımlar */
 {
  const pa=embers.geometry.attributes.position,ca=embers.geometry.attributes.color;
  for(let i=0;i<NEMB;i++){
   const e=emb[i];
   if(e.l>0){
    e.l-=dt;
    if(e.l>0){
     e.vx+=(w.x*w.s*1.6-e.vx)*(1-Math.exp(-dt*1.1))+(rnd()-.5)*2.2*dt;e.vz+=(w.z*w.s*1.6-e.vz)*(1-Math.exp(-dt*1.1))+(rnd()-.5)*2.2*dt;e.vy*=Math.exp(-dt*.45);
     e.x+=e.vx*dt;e.y+=e.vy*dt;e.z+=e.vz*dt;
     const u=e.l/e.L;pa.setXYZ(i,e.x,e.y,e.z);ca.setXYZ(i,3*u,1.6*u*u,.3*u*u*u);continue;
    }
   }
   pa.setXYZ(i,0,-999,0);ca.setXYZ(i,0,0,0);
  }
  pa.needsUpdate=true;ca.needsUpdate=true;
 }
 /* ---- ayak izleri ve iniş ---- */
 {
  const ph=Math.floor(G.walk*1.6);
  if(G.moving&&!G.air&&ph!==lastPh&&lastPh>=0)step(G,G.sprint,false);
  lastPh=ph;
  if(G.landN&&G.landN!==lastLand){lastLand=G.landN;step(G,false,true)}
 }
 /* ---- yağmur sıçramaları ---- */
 const rain=sc.rain||0;
 if(rain>.12&&!G.sheltered&&k>0){
  rainAcc+=dt*rain*60*k;
  while(rainAcc>=1){
   rainAcc--;
   const a=rnd()*6.28,r=Math.sqrt(rnd())*9,x=cam.x+Math.cos(a)*r,z=cam.z+Math.sin(a)*r,tx=Math.floor(x),tz=Math.floor(z);
   if(tx<0||tz<0||tx>=HG.W||tz>=HG.H)continue;
   const tl=G.tile[tz*HG.W+tx];
   if(tl<=T.SHAL||tl===T.POND)ring(x,sc.WY+.02,z,.34+rnd()*.2,.55);
   else puff({x,y:S.groundY(x,z)+.04,z,vx:0,vy:.3,vz:0,s0:.04,s1:.2,a:.45,life:.22,wind:0,col:0xe8f0ff});
  }
 }
 /* ---- nefes buharı ---- */
 const cold=G.warm<62||(L<.35&&G.warm<88);
 breathT-=dt;
 if(breathT<=0){
  breathT=G.sprint?1.5:3.1;
  if(cold&&!(G.sheltered&&G.nearFire)&&k>0){
   sc.cam.getWorldDirection(fw);
   puff({x:cam.x+fw.x*.38,y:cam.y-.12,z:cam.z+fw.z*.38,vx:fw.x*.45,vy:.15,vz:fw.z*.45,s0:.06,s1:.55,a:.1+.2*(1-G.warm/62),life:1.7,wind:.5,col:0xeaf2ff});
  }
 }
 /* ---- sprite ve halka güncelleme ---- */
 for(const p of puffs){
  if(p.l<=0)continue;
  p.l-=dt;
  if(p.l<=0){p.sp.visible=false;p.sp.material.opacity=0;continue}
  const u=1-p.l/p.L,tvx=w.x*w.s*1.5*p.wind,tvz=w.z*w.s*1.5*p.wind;
  p.vx+=(tvx-p.vx)*(1-Math.exp(-dt*1.1));p.vz+=(tvz-p.vz)*(1-Math.exp(-dt*1.1));p.vy-=p.g*dt;
  const q=p.sp.position;q.x+=p.vx*dt;q.y+=p.vy*dt;q.z+=p.vz*dt;
  const s=p.s0+(p.s1-p.s0)*Math.sqrt(u);p.sp.scale.set(s,s,1);
  p.sp.material.opacity=p.a*Math.pow(1-u,1.3)*Math.min(1,u*8);
 }
 for(const r of rings){
  if(r.l<=0)continue;
  r.l-=dt;
  if(r.l<=0){r.m.visible=false;continue}
  const u=1-r.l/r.L;r.m.scale.setScalar(r.s*(.5+u*4.5));r.m.material.opacity=(1-u)*(1-u)*.6;
 }
});
sc.fx={puff,ring,step:(G,s,b)=>step(G,s,b)};
})();
