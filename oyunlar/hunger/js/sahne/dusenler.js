/* Hunger 3D - sahne: yere atılmış eşyaların görünümü (ayrıntılı modeller, yığın için birkaç kopya, yakında hafif vurgu) */
(()=>{
'use strict';
const S=HG.Scene,sc=HG.sc;
let root,ringTex;
const objs=new Map();
/* yığın düzeni: ilk kopya merkezde, diğerleri çevresinde */
const SPOT=[[0,0,0],[.2,.05,.9],[-.16,-.1,-.7]];
S.onInit(()=>{root=new THREE.Group();sc.scene.add(root)});
S.onFrame((G,t,dt,info)=>{
 const L=G.drops||[];
 root.visible=info.mode==='play';
 const alive=new Set(L);
 for(const [d,o] of objs)if(!alive.has(d)){root.remove(o);objs.delete(d)}
 for(const d of L){
  let o=objs.get(d);
  if(!o){
   o=new THREE.Group();
   const cnt=d.n>=6?3:d.n>=2?2:1,mk=sc.dropModel||sc.itemModel;
   for(let i=0;i<cnt;i++){
    const m=mk(d.id);m.position.set(SPOT[i][0],0,SPOT[i][2]);m.rotation.y=SPOT[i][1]*6+(d.x*7.3+d.z*3.1)+i;o.add(m);
   }
   /* yalnızca yakınken görünen, yere yatık ince halka */
   const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:sc.tex.glow,color:0xfff0c0,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,toneMapped:false,opacity:0}));
   gl.scale.set(.7,.7,1);gl.position.y=.18;o.add(gl);o.userData.glow=gl;
   o.userData.base=Math.random()*6.28;
   root.add(o);objs.set(d,o);
  }
  const near=G.nearDrop===d;
  if(d.fl){
   o.position.set(d.x,d.y-.12,d.z);
   o.rotation.set(Math.sin(t*1.7+d.x)*.12,o.userData.base+t*.25,Math.cos(t*1.3+d.z)*.12);
  }else if(d.rest){
   o.position.set(d.x,d.y-.12,d.z);
   o.rotation.set(0,o.userData.base,0);
  }else{
   /* havadayken dönerek düşer */
   o.position.set(d.x,d.y-.12,d.z);
   o.rotation.set(t*5+d.x,o.userData.base+t*4,t*3);
  }
  const gl=o.userData.glow;
  if(gl){gl.material.opacity+=((near?.38+Math.sin(t*4)*.08:0)-gl.material.opacity)*Math.min(1,10*dt)}
 }
});
})();
