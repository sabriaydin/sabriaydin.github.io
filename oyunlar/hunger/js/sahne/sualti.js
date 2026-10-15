/* Hunger 3D - sahne: su altı (sis, yüzey, kabarcıklar) ve su altı ekosistemi: balık sürüleri, su bitkileri, mercan.
   Balıklar sürüler hâlinde kendi bölgelerinde döner; oyuncu yaklaşınca dağılıp hızlanır. */
(()=>{
'use strict';
const {W,H,T,mulberry32}=HG;
const S=HG.Scene,sc=HG.sc;
const {blob,cone,merge,part}=sc.g;
const PI=Math.PI;
const uSW={value:0};
let fish=null,weed=null,coral=null,roof=null,bub=null,fishLim=480,weedLim=1500;
let schools=[],fishCol=[];
const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),p=new THREE.Vector3(),s3=new THREE.Vector3(),cl=new THREE.Color();
const FCAP=480,WCAP=1500,CCAP=260;

function fishGeo(){
 return merge([
  part(blob(.1,1,.03,5,2.5,.95,.5),0xffffff,0,0,0),
  part(cone(.075,.15,4,1),0xdddddd,0,0,-.27,.22,1,1,PI/2,0,0),
  part(cone(.04,.09,3,1),0xbbbbbb,0,.1,-.02,.2,1,1.4,0,0,0),
  part(cone(.03,.07,3,1),0xcccccc,0,-.07,.06,.2,1,1,PI,0,0)
 ],{ao:0,jit:.02});
}
function weedGeo(){
 const pos=[],col=[],idx=[];let n=0;
 const blades=[[0,.0,0,.9],[2.1,.07,.03,1.15],[4.2,-.06,.05,.7],[5.3,.03,-.07,.95]];
 for(const [rot,ox,oz,h] of blades){
  const c=Math.cos(rot),s=Math.sin(rot),w=.05;
  for(let k=0;k<=3;k++){
   const t=k/3,y=t*h,ww=w*(1-t*.82),bend=t*t*.08;
   for(const sx of [-1,1]){pos.push(ox+sx*ww*c+bend*s,y,oz-sx*ww*s+bend*c);const g=.45+.5*t;col.push(.22+.22*t,.45+.4*g*.6,.2+.05*t)}
  }
  for(let k=0;k<3;k++){const a=n+k*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}
  n+=8;
 }
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const nr=g.attributes.normal;for(let i=0;i<nr.count;i++)nr.setXYZ(i,0,1,0);
 return g;
}
function coralGeo(){
 const ps=[];
 for(let i=0;i<6;i++){
  const a=i/6*PI*2+i*.7,r=.06+(i%3)*.05,h=.22+((i*37)%10)/40;
  ps.push(part(cone(.045,h,5,1),0xffffff,Math.cos(a)*r,h*.5,Math.sin(a)*r,1,1,1,Math.sin(a)*.35,0,-Math.cos(a)*.35));
  ps.push(part(blob(.035,1,.2,i+3,1,1,1),0xffffff,Math.cos(a)*r*1.9,h*.95,Math.sin(a)*r*1.9));
 }
 ps.push(part(blob(.12,1,.15,9,1.4,.6,1.2),0x9a8a7a,0,.05,0));
 return merge(ps,{ao:.6,jit:.05});
}
function swayMat(amp,col){
 const m=sc.mat({side:THREE.DoubleSide,roughness:.8});
 m.onBeforeCompile=sh=>{
  sh.uniforms.uSW=uSW;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uSW;').replace('#include <begin_vertex>',`vec3 transformed=vec3(position);
  #ifdef USE_INSTANCING
  float ph=instanceMatrix[3].x*.9+instanceMatrix[3].z*.7;
  float sw=sin(uSW*1.5+ph)*.7+sin(uSW*2.6+ph*1.7)*.3;
  transformed.x+=sw*position.y*position.y*${amp.toFixed(2)};
  transformed.z+=cos(uSW*1.2+ph*1.3)*position.y*position.y*${(amp*.7).toFixed(2)};
  #endif`);
 };
 return m;
}

S.onInit(()=>{
 const fm=sc.mat({roughness:.35,metalness:.3});
 fish=new THREE.InstancedMesh(fishGeo(),fm,FCAP);fish.frustumCulled=false;fish.count=0;fish.setColorAt(0,new THREE.Color(1,1,1));fish.castShadow=false;sc.scene.add(fish);
 weed=new THREE.InstancedMesh(weedGeo(),swayMat(.5),WCAP);weed.frustumCulled=false;weed.count=0;weed.setColorAt(0,new THREE.Color(1,1,1));sc.scene.add(weed);
 coral=new THREE.InstancedMesh(coralGeo(),sc.mat({roughness:.7}),CCAP);coral.frustumCulled=false;coral.count=0;coral.setColorAt(0,new THREE.Color(1,1,1));sc.scene.add(coral);
 roof=new THREE.Mesh(new THREE.PlaneGeometry(500,500),new THREE.MeshBasicMaterial({color:0x2a8ca6,transparent:true,opacity:.6,side:THREE.BackSide,depthWrite:false,fog:false}));
 roof.rotation.x=-PI/2;roof.visible=false;roof.renderOrder=3;sc.scene.add(roof);
 const bp=new Float32Array(40*3);
 const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.BufferAttribute(bp,3));
 bub=new THREE.Points(bg,new THREE.PointsMaterial({size:.07,map:sc.tex.glow,color:0xcdefff,transparent:true,opacity:.8,depthWrite:false,sizeAttenuation:true}));
 bub.frustumCulled=false;bub.visible=false;bub.userData.t=new Float32Array(40).fill(9);sc.scene.add(bub);
});
S.onQuality(qv=>{fishLim=[0,120,260,480][qv];weedLim=[0,450,900,1500][qv]});

/* Kurulum: su alanlarından balık sürüsü, bitki ve mercan yerleri seçilir */
const wdAt=(x,z)=>sc.WY-S.groundY(x,z);
function plan(G){
 schools=[];fishCol=[];
 if(!fish)return;
 const rnd=mulberry32((G.seed|0)^0xf15f);
 const SCL=W*H/147456,isW=i=>G.tile[i]<=T.SHAL||G.tile[i]===T.POND;
 const PAL={
  pond:[0xd8a040,0xc87a30,0xe8c060],shal:[0xc8d4dc,0xe8963a,0x7ab8d8,0xe8d070],deep:[0x3a78c8,0x9ab4c8,0x2a5a9a,0x5ac8c0],big:[0x1e3c66,0x3a4a5a]
 };
 let total=0;const cap=FCAP;
 /* fideler, balıkları sığ ve derin sulara dağıtır */
 const goals=[['pond',999,.28],['shal',Math.round(34*SCL),.5],['deep',Math.round(52*SCL),1.5],['big',Math.round(14*SCL),2.2]];
 for(const [kind,want,minD] of goals){
  let c=0;
  for(let tr=0;tr<9000&&c<want&&total<cap-4;tr++){
   const x=2+((rnd()*(W-4))|0),y=2+((rnd()*(H-4))|0),i=y*W+x,t=G.tile[i];
   if(kind==='pond'?t!==T.POND:kind==='shal'?t!==T.SHAL:t!==T.DEEP)continue;
   const cx=x+.5,cz=y+.5,wd=wdAt(cx,cz);if(wd<minD)continue;
   if(kind!=='pond'&&schools.some(s=>Math.hypot(s.cx-cx,s.cz-cz)<(kind==='big'?30:9)))continue;
   /* yarıçap: halkadaki tüm noktalar su olmalı */
   let r=0;
   for(let rr=.9;rr<=(kind==='pond'?1.6:kind==='shal'?3.2:5);rr+=.5){
    let ok=true;for(let a=0;a<8;a++){const ix=Math.floor(cx+Math.cos(a*.785)*rr),iz=Math.floor(cz+Math.sin(a*.785)*rr);if(ix<0||iz<0||ix>=W||iz>=H||!isW(iz*W+ix)){ok=false;break}}
    if(!ok)break;r=rr;
   }
   if(r<.85)continue;
   const n=kind==='pond'?2+((rnd()*3)|0):kind==='big'?2+((rnd()*2)|0):5+((rnd()*5)|0);
   if(total+n>cap)break;
   const pal=PAL[kind],col=pal[(rnd()*pal.length)|0];
   const sz=kind==='pond'?1.25:kind==='big'?2.1:kind==='deep'?1.05+rnd()*.3:.75+rnd()*.3;
   const depthFrac=kind==='deep'?.25+rnd()*.5:.45;
   schools.push({cx,cz,r:r*.9,n,k0:total,sz,sp:(.28+rnd()*.25)*(kind==='big'?.6:1)*(rnd()<.5?-1:1),ph:rnd()*6.28,wd,df:depthFrac,kind});
   for(let k=0;k<n;k++){cl.setHex(col);const v=.85+rnd()*.3;fishCol.push([cl.r*v,cl.g*v,cl.b*v,rnd(),rnd(),rnd()])}
   total+=n;c++;
  }
 }
 /* su bitkileri ve mercan */
 const wp=[],cp=[];
 for(let tr=0;tr<30000&&(wp.length<WCAP||cp.length<CCAP);tr++){
  const x=2+((rnd()*(W-4))|0),y=2+((rnd()*(H-4))|0),i=y*W+x,t=G.tile[i];
  if(!isW(i))continue;
  const px=x+rnd(),pz=y+rnd(),wd=wdAt(px,pz);
  if(wd<.3||wd>3.3)continue;
  const ground=S.groundY(px,pz);
  if(rnd()<(t===T.POND?.5:t===T.SHAL?.3:.12)&&wp.length<WCAP)wp.push([px,ground,pz,.7+rnd()*.9,rnd()*6.28]);
  else if(t!==T.POND&&wd>.5&&rnd()<.05&&cp.length<CCAP)cp.push([px,ground,pz,.7+rnd()*.8,rnd()*6.28,rnd()]);
 }
 const put=(mesh,arr,color)=>{
  arr.forEach((a,k)=>{
   p.set(a[0],a[1]-.02,a[2]);e.set(0,a[4],0);q.setFromEuler(e);s3.set(a[3]*.9,a[3],a[3]*.9);m4.compose(p,q,s3);mesh.setMatrixAt(k,m4);
   mesh.setColorAt(k,color(a));
  });
  mesh.userData.n=arr.length;mesh.count=arr.length;mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
 };
 put(weed,wp,a=>cl.setRGB(.8+a[4]*.03,.9+a[3]*.08,.7+(a[4]%1)*.3));
 const CC=[0xe86a8a,0xf0904a,0xb06ae8,0xe8c84a,0xd8506a];
 put(coral,cp,a=>cl.setHex(CC[(a[5]*CC.length)|0]));
 weed.userData.pos=wp;coral.userData.pos=cp;
}
S.onBuild(plan);

const ang2=new THREE.Euler();
S.onFrame((G,t,dt,info)=>{
 if(!fish)return;
 const play=info.mode==='play',cam=sc.cam.position,WY=sc.WY;
 const under=play&&cam.y<WY-.02;
 uSW.value=t;
 /* su altı sisi, yüzey ve kabarcıklar */
 roof.visible=under;
 if(under){
  roof.position.set(cam.x,WY+.003,cam.z);
  const f=sc.scene.fog;f.color.setRGB(.05,.27,.36).multiplyScalar(.3+.7*info.L);f.density=.085*(HG.cfg.fog||100)/100+.02;
 }
 bub.visible=under;
 if(under){
  const a=bub.geometry.attributes.position.array,tt=bub.userData.t;
  for(let i=0;i<40;i++){
   tt[i]+=dt;
   if(tt[i]>5||a[i*3+1]>WY){tt[i]=Math.random()*1.5;a[i*3]=cam.x+(Math.random()-.5)*4;a[i*3+1]=cam.y-.2-Math.random()*1.2;a[i*3+2]=cam.z+(Math.random()-.5)*4}
   a[i*3+1]+=dt*(.6+(i%5)*.12);a[i*3]+=Math.sin(t*2+i)*.002;
  }
  bub.geometry.attributes.position.needsUpdate=true;
 }
 /* görünürlük: oyun dışında ve çok uzaktayken çizilmez */
 weed.visible=coral.visible=play;
 weed.count=Math.min(weed.userData.n||0,weedLim);coral.count=Math.min(coral.userData.n||0,Math.min(CCAP,weedLim));
 fish.visible=play&&fishLim>0;
 if(!fish.visible)return;
 let n=0;const lim=fishLim,RR=75;
 for(const s of schools){
  if(n+s.n>lim)break;
  const dx=s.cx-cam.x,dz=s.cz-cam.z;if(dx*dx+dz*dz>RR*RR)continue;
  const dp=Math.hypot(s.cx-G.px,s.cz-G.py),fl=Math.max(0,1-dp/10);
  s.ph+=dt*s.sp*(1+fl*3)*(s.sp>0?1:1);
  const gy=S.groundY(s.cx,s.cz),top=WY-.22,low=Math.min(top,gy+.3);
  const y0=low+(top-low)*s.df;
  for(let k=0;k<s.n;k++){
   const fc=fishCol[s.k0+k];if(!fc)continue;
   const a=s.ph+k*(6.283/s.n)+fc[3]*.9,rr=s.r*(.55+.45*fc[4])*(1+fl*.35);
   const x=s.cx+Math.cos(a)*rr,z=s.cz+Math.sin(a)*rr,dir=s.sp>0?1:-1;
   const vx=-Math.sin(a)*dir,vz=Math.cos(a)*dir;
   const yaw=Math.atan2(vx,vz)+Math.sin(t*8+k*2)*.12;
   const y=Math.max(S.groundY(x,z)+.15,Math.min(top,y0+Math.sin(t*.7+k+fc[5]*6)*.18*(1+fl)));
   p.set(x,y,z);e.set(Math.sin(t*5+k)*.04,yaw,0);q.setFromEuler(e);
   const sz=s.sz*(.85+fc[5]*.3);s3.set(sz,sz,sz);m4.compose(p,q,s3);
   fish.setMatrixAt(n,m4);cl.setRGB(fc[0],fc[1],fc[2]);fish.setColorAt(n,cl);n++;
  }
 }
 fish.count=n;fish.instanceMatrix.needsUpdate=true;if(fish.instanceColor)fish.instanceColor.needsUpdate=true;
});
})();
