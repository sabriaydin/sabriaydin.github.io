/* Hunger 3D - sahne: uçan ve saplanmış oklar */
(()=>{
'use strict';
const S=HG.Scene,sc=HG.sc;
const {cyl,cone,box}=sc.g;
const pool=[];
const tgt=new THREE.Vector3();
function mkArrow(){
 const g=new THREE.Group();
 const m=(geo,c,x,y,z,rx)=>{const k=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:c,roughness:.7,metalness:c===0xc3c9d0?.6:0}));k.position.set(x,y,z);k.rotation.x=rx||0;g.add(k);return k};
 m(cyl(.011,.011,.72,5),0xa87440,0,0,0,Math.PI/2);
 m(cone(.03,.1,4),0xc3c9d0,0,0,.4,Math.PI/2);
 for(const a of [0,Math.PI/2]){const f=m(box(.002,.07,.16),a?0xd9463c:0xe8e4da,0,0,-.3);f.rotation.z=a}
 g.visible=false;sc.scene.add(g);return g;
}
S.onInit(()=>{for(let i=0;i<40;i++)pool.push(mkArrow())});
S.onFrame((G,t,dt,info)=>{
 const L=G.arrows||[];
 for(let i=0;i<pool.length;i++){
  const g=pool[i],a=L[i];
  if(!a||info.mode!=='play'){g.visible=false;continue}
  g.visible=true;g.position.set(a.x,a.y,a.z);
  if(!a.stuck){a.dx=a.vx;a.dy=a.vy;a.dz=a.vz}
  const l=Math.hypot(a.dx||0,a.dy||0,a.dz||1)||1;
  tgt.set(a.x+(a.dx||0)/l,a.y+(a.dy||0)/l,a.z+(a.dz||1)/l);g.lookAt(tgt);
  if(a.stuck){const w=Math.exp(-(a.sT||0)*5)*.16*Math.sin((a.sT||0)*38);g.rotateX(w);g.rotateY(w*.6)}   /* saplanınca sönümlü titreşim */
 }
});
})();
