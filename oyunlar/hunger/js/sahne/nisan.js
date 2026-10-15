/* Hunger 3D - sahne: nişan: ekran ortasından ışın atma, hedef çerçevesi, yerleştirme gölgesi */
(()=>{
'use strict';
const {W,H,REACH,OBJTOP}=HG;
const S=HG.Scene,sc=HG.sc;
let ghost;
const o=new THREE.Vector3(),d=new THREE.Vector3();

/* Kameradan bakılan yönde ışın yürütür; ilk dolu kareyi döner.
   x,y: vurulan kare · px,py: ışının vurmadan önce geçtiği kare (yoksa -1) · hx,hy,hz: vuruş noktası */
/* Hayvan: ışının geçtiği en yakın hayvan (küre testi) */
function animalHit(G){
 let best=null,bt=1e9;
 if(!G.animals)return null;
 for(const a of G.animals){
  if(a.dying)continue;
  const def=HG.ANIMAL[a.t];
  if((a.x-G.px)**2+(a.z-G.py)**2>(REACH+def.r+.6)**2)continue;
  const cy=(a.by!==undefined?a.by:S.groundY(a.x,a.z))+def.h*.55,vx=a.x-o.x,vy=cy-o.y,vz=a.z-o.z,t=vx*d.x+vy*d.y+vz*d.z;
  if(t<0)continue;
  const d2=vx*vx+vy*vy+vz*vz-t*t,r=def.r*1.05;
  if(d2>r*r)continue;
  const tt=Math.max(.1,t-Math.sqrt(r*r-d2));
  if(tt<bt){bt=tt;best=a}
 }
 return best?{a:best,t:bt}:null;
}
const hitAn=(ah)=>({x:Math.floor(ah.a.x),y:Math.floor(ah.a.z),ob:0,px:-1,py:-1,hx:o.x+d.x*ah.t,hy:o.y+d.y*ah.t,hz:o.z+d.z*ah.t,dist:ah.t,an:ah.a});
/* Son bakış ışını (zayıf nokta isabeti için) */
S.aimRay=()=>({o,d});
S.aim=G=>{
 const cam=sc.cam;cam.getWorldPosition(o);cam.getWorldDirection(d);
 const ah=animalHit(G);
 const R2=REACH*REACH,step=.07,maxD=REACH+2.2,WY=sc.WY;
 let prev=-1,lastTile=-1;
 for(let s=.15;s<=maxD;s+=step){
  const x=o.x+d.x*s,y=o.y+d.y*s,z=o.z+d.z*s;
  if((x-G.px)**2+(z-G.py)**2>R2)break;
  const tx=Math.floor(x),tz=Math.floor(z);
  if(tx<0||tz<0||tx>=W||tz>=H)break;
  const i=tz*W+tx;
  if(i!==lastTile){if(lastTile>=0)prev=lastTile;lastTile=i}
  const ob=G.obj[i],t=G.tile[i],gy=S.groundY(x,z);
  let hit=false;
  if(ob){const top=gy+(OBJTOP[ob]||1);if(y<top&&y>gy-.3)hit=true}
  if(!hit&&y<=((t<=1||t===5)&&!G.head?WY:gy)+.02)hit=true;
  if(hit&&ah&&ah.t<=s)return hitAn(ah);
  if(hit)return {x:tx,y:tz,ob,px:prev>=0?prev%W:-1,py:prev>=0?(prev/W)|0:-1,hx:x,hy:y,hz:z,dist:s};
 }
 if(ah)return hitAn(ah);
 return null;
};

/* Zayıf nokta işareti: ağaçta kırmızı X, kaya ve madende sarı yıldız */
let hotSpr=null,texX=null,texStar=null;
function mkTex(draw){
 const c=document.createElement('canvas');c.width=c.height=64;draw(c.getContext('2d'));
 const t=new THREE.CanvasTexture(c);if(THREE.sRGBEncoding)t.encoding=THREE.sRGBEncoding;return t;
}
S.onInit(()=>{
 ghost=new THREE.Mesh(new THREE.BoxGeometry(.96,1.2,.96),new THREE.MeshBasicMaterial({color:0x7be07b,transparent:true,opacity:.35,depthWrite:false}));ghost.visible=false;sc.scene.add(ghost);
 texX=mkTex(g=>{g.lineCap='round';for(const [w,c] of [[15,'#2a0805'],[9,'#ff3a2c'],[3,'#ffd9c9']]){g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.moveTo(14,14);g.lineTo(50,50);g.moveTo(50,14);g.lineTo(14,50);g.stroke()}});
 texStar=mkTex(g=>{
  const star=r=>{g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*.45:r;g.lineTo(32+Math.cos(a)*q,32+Math.sin(a)*q)}g.closePath()};
  g.lineJoin='round';star(29);g.fillStyle='#3a2a05';g.fill();g.lineWidth=5;g.strokeStyle='#3a2a05';g.stroke();star(25);g.fillStyle='#ffd23f';g.fill();star(14);g.fillStyle='#fff4b0';g.fill();
 });
 hotSpr=new THREE.Sprite(new THREE.SpriteMaterial({map:texX,transparent:true,depthWrite:false,toneMapped:false}));hotSpr.visible=false;hotSpr.renderOrder=6;sc.scene.add(hotSpr);
});
const cp=new THREE.Vector3();
S.onFrame((G,t,dt,info)=>{
 const tg=info.target,pl=info.place;
 if(info.mode==='play'&&pl){
  const gy=S.groundY(pl.x+.5,pl.y+.5),h=pl.h||1.2;
  ghost.visible=true;ghost.scale.y=h/1.2;ghost.position.set(pl.x+.5,gy+h/2,pl.y+.5);ghost.material.color.setHex(pl.ok?(pl.hammer?0x7bb8e0:0x7be07b):pl.warn?0xe0c050:0xe07b73);
 }else ghost.visible=false;
 /* zayıf nokta işareti: yüzeyde, kameraya doğru az önde; nabız gibi atar */
 const hs=HG.hot;
 if(info.mode==='play'&&hs&&hs.show){
  sc.cam.getWorldPosition(cp);
  const dx=cp.x-hs.x,dy=cp.y-hs.y,dz=cp.z-hs.z,l=Math.hypot(dx,dy,dz)||1,k=hs.k==='star'?texStar:texX;
  if(hotSpr.material.map!==k){hotSpr.material.map=k;hotSpr.material.needsUpdate=true}
  hotSpr.visible=true;hotSpr.position.set(hs.x+dx/l*.12,hs.y+dy/l*.12,hs.z+dz/l*.12);
  const sz=.34*(1+.14*Math.sin(t*9));hotSpr.scale.set(sz,sz,1);
 }else if(hotSpr)hotSpr.visible=false;
});
})();
