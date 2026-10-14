/* Hunger 3D - sahne: kesilen ağacın devrilmesi (bir süre yerde kalır, sonra kaybolur) ve kaya/maden parçalanma kırıntıları */
(()=>{
'use strict';
const {W,O,hash}=HG;
const S=HG.Scene,sc=HG.sc;
const falls=[],AX=new THREE.Vector3(),UP=new THREE.Vector3(0,1,0);
const FALL_T=1.15,REST_T=7,FADE_T=2.6;

/* Ağaç devrilir: (tx,tz) karesindeki ağaç, (fromX,fromZ) konumundan uzağa doğru yıkılır */
S.fell=(tx,tz,o,fromX,fromZ)=>{
 const G=HG.G,hh=hash(tx,tz,21),h2=hash(tx,tz,22),h3=hash(tx,tz,23);
 let key=o===O.TREE?(hh<.5?'treeA':'treeB'):o===O.PALM?'palm':'palm0';
 const geo=sc.MODEL[key];if(!geo)return;
 const t=sc.tintFor(key,hh,h2,h3);
 const mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,color:new THREE.Color(t.r,t.g,t.b),side:(key==='palm'||key==='palm0')?THREE.DoubleSide:THREE.FrontSide});
 sc.mats.push(mat);
 const mesh=new THREE.Mesh(geo,mat);mesh.castShadow=true;mesh.receiveShadow=true;
 const sc2=(o===O.TREE?.8+h2*.4:.9+h2*.3),x=tx+.5+(hh-.5)*.2,z=tz+.5+(h2-.5)*.2,gy=S.groundY(x,z)-.04;
 mesh.position.set(x,gy,z);mesh.scale.set(sc2,sc2,sc2);
 let dx=x-fromX,dz=z-fromZ;const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
 sc.scene.add(mesh);
 falls.push({mesh,mat,x,z,gy,yaw:hh*6.28,dx,dz,t:0,hit:false,sc:sc2,key,tilt:(h3-.5)*.12});
};

/* Kırıntılar: kaya/maden tamamen parçalandığında saçılan taş parçaları */
const chunkGeo=new THREE.IcosahedronGeometry(.5,1),pool=[];
function chunkMesh(){
 const m=new THREE.Mesh(chunkGeo,new THREE.MeshStandardMaterial({roughness:.9,flatShading:false}));
 m.visible=false;m.castShadow=true;sc.mats.push(m.material);sc.scene.add(m);return {m,l:0,vx:0,vy:0,vz:0,sx:0,sy:0,s:1};
}
S.crumble=(x,z,o)=>{
 const gy=S.groundY(x,z);
 const accent=o===O.COAL?0x1a1a1f:o===O.COPPER?0xc8743a:o===O.IRON?0xc2a287:0x8d8b88;
 let n=0;
 for(let k=0;k<pool.length+14&&n<14;k++){
  let p=pool[k];
  if(!p){if(pool.length>=60)break;p=chunkMesh();pool.push(p)}
  if(p.l>0)continue;
  const a=Math.random()*6.28,sp=1.2+Math.random()*2.6;
  p.l=3.4;p.s=.1+Math.random()*.16;p.m.scale.set(p.s*(.8+Math.random()*.6),p.s*(.7+Math.random()*.5),p.s*(.8+Math.random()*.6));
  p.m.material.color.setHex(n%3===0&&o!==O.ROCK?accent:[0x8d8b88,0x77757a,0x6a6a70][n%3]);
  p.m.position.set(x+(Math.random()-.5)*.4,gy+.3+Math.random()*.4,z+(Math.random()-.5)*.4);
  p.vx=Math.cos(a)*sp;p.vz=Math.sin(a)*sp;p.vy=2+Math.random()*3;p.sx=(Math.random()-.5)*8;p.sy=(Math.random()-.5)*8;p.m.visible=true;n++;
 }
 S.burst(x,gy+.5,z,0x9a9a9a,6);
};

S.onFrame((G,t,dt)=>{
 /* devrilen ağaçlar */
 for(let k=falls.length-1;k>=0;k--){
  const f=falls[k];f.t+=dt;
  let th;
  if(f.t<FALL_T){const u=f.t/FALL_T;th=Math.PI/2*Math.pow(u,2.1)}
  else{
   const u=f.t-FALL_T;th=Math.PI/2*(1-.05*Math.abs(Math.sin(u*13))*Math.exp(-u*5.5));
   if(!f.hit){f.hit=true;HG.snd('thud',{x:f.x+f.dx*3,z:f.z+f.dz*3});
    const reach=(f.key==='treeA'?7:f.key==='treeB'?6:5)*f.sc;S.burst(f.x+f.dx*reach*.8,f.gy+.6,f.z+f.dz*reach*.8,0x4a9440,10)}
  }
  AX.set(f.dz,0,-f.dx);
  const q=new THREE.Quaternion().setFromAxisAngle(AX,th+f.tilt*Math.min(1,f.t/FALL_T)).multiply(new THREE.Quaternion().setFromAxisAngle(UP,f.yaw));
  f.mesh.quaternion.copy(q);
  f.mesh.position.y=f.gy+Math.min(1,f.t/FALL_T)*.35*f.sc;
  if(f.t>FALL_T+REST_T){
   const u=Math.min(1,(f.t-FALL_T-REST_T)/FADE_T),s=f.sc*(1-u*u);
   f.mesh.scale.set(s,s,s);f.mesh.position.y=f.gy+.35*f.sc-u*.4;
   if(u>=1){sc.scene.remove(f.mesh);f.mat.dispose();falls.splice(k,1)}
  }
 }
 /* kırıntılar */
 for(const p of pool){
  if(p.l<=0)continue;p.l-=dt;
  if(p.l<=0){p.m.visible=false;continue}
  p.vy-=11*dt;p.m.position.x+=p.vx*dt;p.m.position.y+=p.vy*dt;p.m.position.z+=p.vz*dt;
  const gy=S.groundY(p.m.position.x,p.m.position.z)+p.s*.4;
  if(p.m.position.y<gy){p.m.position.y=gy;p.vy=Math.abs(p.vy)*.35;p.vx*=.6;p.vz*=.6;if(p.vy<.6)p.vy=0;p.sx*=.5;p.sy*=.5}
  p.m.rotation.x+=p.sx*dt;p.m.rotation.y+=p.sy*dt;
  if(p.l<.7){const k=p.l/.7;p.m.scale.multiplyScalar(Math.max(.2,k)>0?1-(.9*dt/.7):1)}
 }
});
})();
