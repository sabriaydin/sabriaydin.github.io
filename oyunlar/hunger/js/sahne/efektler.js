/* Hunger 3D - sahne: parçacıklar (kırıntı, toz) */
(()=>{
'use strict';
const S=HG.Scene,sc=HG.sc;
const pool=[];
S.onInit(()=>{
 const gm=new THREE.BoxGeometry(.09,.09,.09);
 for(let i=0;i<40;i++){const m=new THREE.Mesh(gm,new THREE.MeshBasicMaterial({color:0xffffff}));m.visible=false;sc.scene.add(m);pool.push({m,l:0,vx:0,vy:0,vz:0})}
});
/* (x,y,z) noktasında n adet renkli kırıntı saçar */
S.burst=(x,y,z,c,n)=>{
 let k=0;
 for(const p of pool){if(p.l>0)continue;p.l=.6;p.m.visible=true;p.m.material.color.setHex(c);p.m.position.set(x+(Math.random()-.5)*.4,y+(Math.random()-.5)*.3,z+(Math.random()-.5)*.4);p.vx=(Math.random()-.5)*2.4;p.vy=1.6+Math.random()*2;p.vz=(Math.random()-.5)*2.4;if(++k>=n)break}
};
S.onFrame((G,t,dt)=>{
 for(const p of pool){if(p.l<=0)continue;p.l-=dt;if(p.l<=0){p.m.visible=false;continue}p.vy-=9*dt;p.m.position.x+=p.vx*dt;p.m.position.y+=p.vy*dt;p.m.position.z+=p.vz*dt}
});
})();
