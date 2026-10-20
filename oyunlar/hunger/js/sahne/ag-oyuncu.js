/* Hunger 3D - sahne: co-op'taki diğer oyuncunun 3B görünümü (köylü modeli iskeleti, ad etiketi, yürüme-yüzme-uyku-saldırı hareketleri) */
(()=>{
'use strict';
const S=HG.Scene,sc=HG.sc;
if(!sc.npcMake||!sc.npcLook)return;
/* Oyuncu renkleri: dört ayrı görünüm; kimlikten seçilir */
const COL=[
 {tun:0x2f6fb0,leg:0x2a3140,hat:0xe8e4da,css:'#7fb4ee'},
 {tun:0xb0452f,leg:0x40302a,hat:0xe8e4da,css:'#f08a74'},
 {tun:0x3f8f4a,leg:0x2a3a2a,hat:0xe8e4da,css:'#8fd89a'},
 {tun:0x8f4fb0,leg:0x35283f,hat:0xe8e4da,css:'#c79af0'}
];
COL.forEach((c,i)=>{sc.npcLook['cp'+i]={tun:c.tun,leg:c.leg,hat:c.hat}});
{
 const x0=sc.npcExtra;
 sc.npcExtra=(prof,torso,u)=>{
  if(/^cp\d$/.test(prof)){
   const {part,cyl,rbox,box,L}=u;
   /* sırt çantası ve omuz bandı: oyuncuyu köylülerden ayırır */
   torso.push(part(rbox(.36,.44,.16,.3,2),0x6b4a29,0,1.2,-.22),part(box(.04,.5,.02),0x3a2a1c,.13,1.2,.0),part(box(.04,.5,.02),0x3a2a1c,-.13,1.2,.0),part(cyl(.17,.18,.05,10),L.hat,0,1.8,0));
   return;
  }
  return x0&&x0(prof,torso,u);
 };
}
const hash=s=>{let h=7;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)};
const objs=new Map();
function tag(name,css){
 const c=document.createElement('canvas');c.width=256;c.height=64;
 const g=c.getContext('2d');
 g.font='600 30px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';
 g.lineWidth=7;g.strokeStyle='rgba(0,0,0,.8)';g.strokeText(name,128,34);
 g.fillStyle=css;g.fillText(name,128,34);
 const tex=new THREE.CanvasTexture(c);
 const m=new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false});
 const sp=new THREE.Sprite(m);sp.scale.set(1.5,.375,1);sp.renderOrder=999;
 return sp;
}
function mk(rec){
 const v=hash(rec.peerId||rec.id)%COL.length;
 const o=sc.npcMake({prof:'cp'+v,id:v,f:false});
 o.css=COL[v].css;o.name=rec.name;o.tag=tag(rec.name,o.css);o.g.add(o.tag);o.tag.position.set(0,2.25,0);
 o.ph=0;o.sp=0;o.ry=0;
 return o;
}
S.onFrame((G,t,dt,info)=>{
 const alive=new Set(HG.remote);
 for(const [r,o] of objs)if(!alive.has(r)){sc.scene.remove(o.g);objs.delete(r)}
 if(info.mode!=='play'){for(const o of objs.values())o.g.visible=false;return}
 const FL=HG.net&&HG.net.FL;if(!FL)return;
 const cam=sc.cam.position,k=1-Math.exp(-dt*12);
 for(const r of HG.remote){
  if(!r.init){continue}
  let o=objs.get(r);
  if(!o){o=mk(r);objs.set(r,o)}
  if(o.name!==r.name){sc.scene.remove(o.tag);o.g.remove(o.tag);o.tag.material.map.dispose();o.tag.material.dispose();o.name=r.name;o.tag=tag(r.name,o.css);o.g.add(o.tag);o.tag.position.set(0,2.25,0)}
  /* konum yumuşatma */
  if(r.rx===undefined){r.rx=r.x;r.rz=r.z}
  const dx=r.x-r.rx,dz=r.z-r.rz;
  if(dx*dx+dz*dz>64){r.rx=r.x;r.rz=r.z}else{r.rx+=dx*k;r.rz+=dz*k}
  let dy=r.yaw-(r.ryw===undefined?r.yaw:r.ryw);while(dy>Math.PI)dy-=6.2832;while(dy<-Math.PI)dy+=6.2832;
  r.ryw=(r.ryw===undefined?r.yaw:r.ryw)+dy*k;
  const d2=(r.rx-cam.x)**2+(r.rz-cam.z)**2;
  if(d2>140*140){o.g.visible=false;continue}
  const fl=r.fl|0,sleeping=!!(fl&FL.SL),dead=!!(fl&FL.DD),swim=!!(fl&FL.SW),raft=!!(fl&FL.RF);
  const gy=S.groundY(r.rx,r.rz);
  let y=r.y==null||swim?gy:r.y;
  if(swim)y=Math.max(gy,sc.WY-.9);
  o.g.visible=true;
  o.g.position.set(r.rx,y,r.rz);
  o.g.rotation.order='YXZ';o.g.rotation.y=r.ryw+Math.PI;o.g.rotation.x=0;
  /* yürüme evresi: hız yumuşatılır, adım ölçüsü hızla artar */
  o.sp+=((r.mv?(r.spd||0):0)-o.sp)*Math.min(1,8*dt);
  o.ph+=o.sp*dt*1.6;
  const amp=Math.min(1,o.sp/3.2)*.75;
  if(dead||sleeping){
   o.g.rotation.x=-Math.PI/2;o.g.position.y=y+.28+(sleeping?Math.sin(t*1.1)*.01:0);
   o.legL.rotation.set(0,0,0);o.legR.rotation.set(0,0,0);o.armL.rotation.set(0,0,.05);o.armR.rotation.set(0,0,-.05);o.torso.rotation.set(0,0,0);
  }else if(swim){
   o.g.rotation.x=1.2;
   o.legL.rotation.x=Math.sin(t*5)*.4;o.legR.rotation.x=-Math.sin(t*5)*.4;
   o.armL.rotation.set(Math.sin(t*3.2)*1.2-2.6,0,.2);o.armR.rotation.set(-Math.sin(t*3.2)*1.2-2.6,0,-.2);
   o.torso.rotation.set(0,0,0);
  }else{
   o.legL.rotation.x=Math.sin(o.ph)*amp;o.legR.rotation.x=-Math.sin(o.ph)*amp;
   o.armL.rotation.x=-Math.sin(o.ph)*amp*.9;o.armR.rotation.x=Math.sin(o.ph)*amp*.9;
   o.armL.rotation.z=.04;o.armR.rotation.z=-.04;
   o.torso.rotation.set(0,0,0);
   if(fl&FL.BW){o.armL.rotation.x=-1.5;o.armR.rotation.x=-1.4;o.armR.rotation.z=-.25}
   else if(fl&FL.AT){const u=Math.sin(t*14);o.armR.rotation.x=-1.2-u*.9;o.torso.rotation.x=.08}
   o.torso.position.y=Math.abs(Math.sin(o.ph))*amp*.03;
   if(raft)o.legL.rotation.x=o.legR.rotation.x=0;
  }
  /* ad etiketi: yakında net, uzakta silik */
  const dd=Math.sqrt(d2);
  o.tag.material.opacity=dd<8?1:Math.max(.25,1-(dd-8)/70);
  o.tag.visible=dd<110;
 }
});
})();
