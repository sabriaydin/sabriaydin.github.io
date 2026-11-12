/* Hunger 3D - sahne: mağara girişleri (yüzeyde kaya geçit) ve mağara içi (tavan, sarkıt-dikit, ışıldayan kristaller, kemikler, çıkış ışığı, karanlık atmosfer) */
(()=>{
'use strict';
const {W,H,clamp,hash,fbm}=HG;
const S=HG.Scene,sc=HG.sc;
const {blob,merge,part,cyl,cone,box}=sc.g;
const PI=Math.PI;
const ROOF=3.55;                                   /* tavan taban yüksekliği */
let mat=null,glowMat=null,roofMat=null,haloTex=null,seed=4100;
const groups=[],glows=[],lights=[];
let shaft=null,exitLight=null,exitPos=null,roof=null;
const BONE=0xdad3bd,ROCKC=[0x908c82,0x7f7b72,0x9c978b],CAVEC=[0x4a4843,0x403e3b,0x55524c];

const rockCf=(x,y,z,nx,ny,nz,c)=>{const a=Math.floor(x*2.4)+Math.floor(y*3.1)*3+Math.floor(z*2.4)*5;c.multiplyScalar(.7+((a*37)&7)/20)};
const Bp=(r,c,x,y,z,sx,sy,sz,o)=>{o=o||{};const p=part(blob(r,o.d===undefined?2:o.d,o.amp===undefined?.12:o.amp,++seed,sx||1,sy||1,sz||1),c,x,y,z,1,1,1,o.rx,o.ry,o.rz,o.j===undefined?.1:o.j);p.cf=rockCf;return p};

/* ---- yüzeydeki giriş: iki kaya sütun, lento, arkada kütle, karanlık ağız, kafatası dikmeleri ---- */
function entranceParts(c,P){
 const ry=(c.q|0)*PI/2,cs=Math.round(Math.cos(ry)),sn=Math.round(Math.sin(ry)),ox=c.x+.5,oz=c.y+.5;
 const W2=(a,b)=>[ox+a*cs+b*sn,oz-a*sn+b*cs];
 const add=(geo,col,a,ly,b,sx,sy,sz,rx,ryy,rz,cf)=>{const [x,z]=W2(a,b);const q=part(geo,col,x,S.groundY(x,z)+ly,z,sx||1,sy||1,sz||1,rx||0,(ryy||0)+ry,rz||0);if(cf)q.cf=cf;P.push(q);return q};
 const bp=(r,col,a,ly,b,sx,sy,sz,o)=>{const [x,z]=W2(a,b);const q=Bp(r,col,x,S.groundY(x,z)+ly,z,sx,sy,sz,Object.assign({ry},o||{}));P.push(q);return q};
 const id=c.id;
 for(const s of [-1,1]){
  bp(1.55,ROCKC[(id+(s>0?1:0))%3],s*2.55,1.3,-.2,1,1.55,1.05,{amp:.15});
  bp(1.05,ROCKC[(id+2)%3],s*2.35,2.7,-.35,1,.9,1,{amp:.16});
  bp(.7,ROCKC[(id+1)%3],s*3.4,.35,.4,1.3,.7,1.1,{amp:.14});
 }
 bp(1.45,ROCKC[id%3],0,3.0,-.3,2.1,.52,1.1,{amp:.12});
 bp(3.0,ROCKC[(id+1)%3],0,1.8,-4.3,1.3,.95,1,{amp:.14});
 bp(2.2,ROCKC[(id+2)%3],-3.1,1.2,-2.6,1,1.1,1,{amp:.14});
 bp(2.2,ROCKC[id%3],3.1,1.2,-2.6,1,1.1,1,{amp:.14});
 /* karanlık ağız */
 add(box(2.3,2.4,1.6),0x010102,0,1.2,-1.3);
 add(box(2.7,.3,.9),0x0a0a0c,0,.1,.1);
 /* uyarı dikmeleri: kafatası ve kemikler */
 for(const s of [-1,1]){
  add(cyl(.045,.055,1.7,6),0x4a3322,s*1.9,.78,1.5,1,1,1,0,0,s*.08);
  bp(.17,BONE,s*1.9+s*.03,1.72,1.5,1,1.05,1.1,{d:1,amp:.05,j:.04});
  bp(.1,BONE,s*1.9+s*.03,1.58,1.64,1,.8,1,{d:1,amp:.04,j:.03});
  for(let i=0;i<4;i++)bp(.09+((id+i)%3)*.03,ROCKC[i%3],s*(1.5+i*.22),.1,1.7+((i*37+id)%7)*.1,1,.7,1,{d:1,amp:.1});
 }
 /* yerde saçılmış kemikler */
 for(let i=0;i<6;i++){
  const a=(hash(id,i,3)-.5)*3.4,b=.9+hash(id,i,5)*1.4;
  add(cyl(.018,.018,.34+hash(id,i,9)*.2,5),BONE,a,.04,b,1,1,1,PI/2,hash(id,i,11)*PI,0);
 }
 /* kırık kasa tahtaları */
 add(box(1.1,.06,.22),0x5a3d22,-1.2,.05,2.3,1,1,1,0,.5,.05);
 add(box(.9,.06,.2),0x4a3322,-.7,.1,2.6,1,1,1,0,-.4,-.06);
}
function clearAll(){
 for(const g of groups){sc.scene.remove(g);g.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
 groups.length=0;
 for(const g of glows){sc.scene.remove(g.sp)}
 glows.length=0;
 for(const l of lights)sc.scene.remove(l);
 lights.length=0;
 if(shaft){sc.scene.remove(shaft.g);shaft.g.traverse(o=>{if(o.geometry)o.geometry.dispose()});shaft=null}
 if(exitLight){sc.scene.remove(exitLight);exitLight=null}
 if(roof){sc.scene.remove(roof);roof.geometry.dispose();roof=null}
 exitPos=null;
}

/* ---- mağara içi ---- */
const rh=(x,y,sd)=>ROOF-.95*(fbm(x/2.6,y/2.6,sd+3)-.3)*1.5+(hash(x,y,sd)-.5)*.35;
function roofGeo(lv,sd){
 const pos=[],col=[],c=new THREE.Color();
 const open=lv.open;
 const tri=(a,b,c2)=>{for(const v of [a,b,c2]){pos.push(v[0],v[1],v[2]);const n=fbm(v[0]/1.8,v[2]/1.8,sd+7);c.setHex(0x2a2826).multiplyScalar(.55+n*.8);col.push(c.r,c.g,c.b)}};
 for(let y=lv.Y0;y<lv.Y1;y++)for(let x=lv.X0;x<lv.X1;x++){
  let near=false;
  for(let j=-1;j<=1&&!near;j++)for(let i=-1;i<=1;i++)if(open[(y+j)*W+x+i]){near=true;break}
  if(!near)continue;
  const a=[x,rh(x,y,sd),y],b=[x+1,rh(x+1,y,sd),y],d=[x,rh(x,y+1,sd),y+1],e=[x+1,rh(x+1,y+1,sd),y+1];
  tri(a,d,b);tri(b,d,e);
 }
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 g.computeVertexNormals();return g;
}
function haloTexture(){
 if(haloTex)return haloTex;
 const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);
 gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(.35,'rgba(255,255,255,.28)');gr.addColorStop(1,'rgba(255,255,255,0)');
 g.fillStyle=gr;g.fillRect(0,0,64,64);haloTex=new THREE.CanvasTexture(c);return haloTex;
}
function buildCave(G){
 const lv=G.cave.lv,sd=lv.exit.x*7+lv.exit.y;
 if(!mat)mat=sc.mat({roughness:.95,pbr:true});
 if(!glowMat)glowMat=new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false});
 if(!roofMat)roofMat=sc.mat({roughness:1,side:THREE.DoubleSide,pbr:true});
 /* tavan */
 roof=new THREE.Mesh(roofGeo(lv,sd),roofMat);roof.receiveShadow=false;sc.scene.add(roof);
 /* sarkıtlar ve dikitler */
 const P=[],open=lv.open,FL=HG.CAVE.FLOOR;
 const wn=(x,y)=>{let c=0;for(let j=-1;j<=1;j++)for(let k=-1;k<=1;k++)if(!open[(y+j)*W+x+k])c++;return c};
 let n=0;
 for(let y=lv.Y0;y<lv.Y1;y++)for(let x=lv.X0;x<lv.X1;x++){
  const i=y*W+x;if(!open[i])continue;
  const h1=hash(x,y,sd+1);
  if(h1<.2){
   const r=.1+hash(x,y,sd+2)*.22,hh=.4+hash(x,y,sd+3)*1.3,px=x+hash(x,y,sd+4),pz=y+hash(x,y,sd+5);
   const q=part(cone(r,hh,5,1),CAVEC[(x+y)%3],px,rh(px,pz,sd)-hh/2+.06,pz,1,1,1,PI,hash(x,y,sd+6)*6,0,.05);q.cf=rockCf;P.push(q);n++;
  }
  if(wn(x,y)>=3&&hash(x,y,sd+14)<.4){
   let dx=0,dz=0;for(let j=-1;j<=1;j++)for(let k=-1;k<=1;k++)if(!open[(y+j)*W+x+k]){dx+=k;dz+=j}
   const m=Math.hypot(dx,dz)||1,r=.3+hash(x,y,sd+15)*.45,px=x+.5+dx/m*.5,pz=y+.5+dz/m*.5;
   const q=Bp(r,CAVEC[(x+y*2)%3],px,FL+lv.hgt[i]+r*.25,pz,1,.8+hash(x,y,sd+16)*.5,1,{d:1,ry:hash(x,y,sd+17)*6});P.push(q);n++;
  }
  if(wn(x,y)>=3&&hash(x,y,sd+8)<.28){
   const r=.12+hash(x,y,sd+9)*.22,hh=.35+hash(x,y,sd+10)*1.1,px=x+hash(x,y,sd+11),pz=y+hash(x,y,sd+12);
   const q=part(cone(r,hh,5,1),CAVEC[(x*3+y)%3],px,FL+lv.hgt[i]+hh/2-.05,pz,1,1,1,0,hash(x,y,sd+13)*6,0,.05);q.cf=rockCf;P.push(q);n++;
  }
 }
 /* kemik yığınları: çıkmaz uçlarda ve sandık odasında */
 const bones=[];
 for(const nk of lv.nooks)bones.push({x:nk.x,y:nk.y});
 bones.push({x:lv.chest.x,y:lv.chest.y});
 for(let k=0;k<6;k++){const r=lv.rooms[1+((hash(k,sd,3)*(lv.rooms.length-1))|0)];if(r)bones.push({x:r.x+(hash(k,sd,4)-.5)*r.r,y:r.y+(hash(k,sd,5)-.5)*r.r})}
 bones.forEach((b,bi)=>{
  const x0=Math.floor(b.x),y0=Math.floor(b.y);
  if(!open[y0*W+x0]||lv.tile[y0*W+x0]===HG.T.POND)return;
  const gy=FL+lv.hgt[y0*W+x0];
  for(let i=0;i<5;i++){
   const bx=b.x+(hash(bi,i,sd)-.5)*1.4,bz=b.y+(hash(bi,i,sd+1)-.5)*1.4;
   P.push(part(cyl(.02,.02,.3+hash(bi,i,sd+2)*.25,5),BONE,bx,gy+.04,bz,1,1,1,PI/2,hash(bi,i,sd+3)*PI,0));
  }
  const sk=part(blob(.15,1,.05,++seed,1,.95,1.1),BONE,b.x,gy+.14,b.y,1,1,1,0,hash(bi,sd,9)*6,0,.04);P.push(sk);
  P.push(part(blob(.09,1,.04,++seed),BONE,b.x+.04,gy+.07,b.y+.13,1,.75,1,0,0,0,.03));
 });
 if(P.length){const m=new THREE.Mesh(merge(P,{ao:.8,jit:.08}),mat);m.castShadow=false;m.receiveShadow=true;sc.scene.add(m);groups.push(m)}
 /* ışıldayan kristaller */
 const CP=[],cols=[0x3ee0c8,0x8a6bff,0x4ab0ff],spots=[];
 lv.nooks.forEach((nk,i)=>spots.push({x:nk.x,y:nk.y,col:cols[i%3]}));
 spots.push({x:lv.chest.x+.5,y:lv.chest.y+.5,col:0xff3a4a,vault:true});
 for(let k=0;k<5;k++){
  const r=lv.rooms[1+((hash(k,sd,21)*(lv.rooms.length-1))|0)];if(!r)continue;
  const ang=hash(k,sd,22)*6.28,x=r.x+Math.cos(ang)*r.r*.8,y=r.y+Math.sin(ang)*r.r*.8;
  if(open[Math.floor(y)*W+Math.floor(x)])spots.push({x,y,col:cols[k%3]});
 }
 spots.forEach((s,si)=>{
  const x0=Math.floor(s.x),y0=Math.floor(s.y);if(!open[y0*W+x0])return;
  const gy=FL+lv.hgt[y0*W+x0];
  const cnt=s.vault?5:3+((si+sd)%3);
  for(let i=0;i<cnt;i++){
   const a=hash(si,i,sd+30)*6.28,d=(s.vault?1.4:.15)+hash(si,i,sd+31)*(s.vault?.6:.35),hh=.35+hash(si,i,sd+32)*.75;
   CP.push(part(cone(.07+hash(si,i,sd+33)*.07,hh,5,1),s.col,s.x+Math.cos(a)*d,gy+hh/2-.03,s.y+Math.sin(a)*d,1,1,1,(hash(si,i,sd+34)-.5)*.5,a,(hash(si,i,sd+35)-.5)*.5));
  }
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:haloTexture(),color:s.col,transparent:true,opacity:s.vault?.55:.42,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
  sp.position.set(s.x,gy+.55,s.y);sp.scale.setScalar(s.vault?5.2:3.6);sc.scene.add(sp);
  glows.push({sp,x:s.x,y:gy+.6,z:s.y,col:s.col,ph:si*1.7});
 });
 if(CP.length){const m=new THREE.Mesh(merge(CP,{ao:1,jit:.04}),glowMat);m.castShadow=false;sc.scene.add(m);groups.push(m)}
 for(let i=0;i<2;i++){const l=new THREE.PointLight(0x3ee0c8,0,10,1.8);sc.scene.add(l);lights.push(l)}
 /* çıkış: soluk ışık sütunu ve ışık */
 const e=lv.exit,gy=FL+lv.hgt[e.y*W+e.x];exitPos={x:e.x+.5,y:gy,z:e.y+.5};
 const sg=new THREE.Group();
 const sm=new THREE.MeshBasicMaterial({color:0xbfd8ff,transparent:true,opacity:.14,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
 const cy=new THREE.Mesh(new THREE.CylinderGeometry(.9,1.5,ROOF-.2,20,1,true),sm);cy.position.set(0,(ROOF-.2)/2,0);sg.add(cy);
 const ring=new THREE.Mesh(new THREE.RingGeometry(.2,1.55,28),new THREE.MeshBasicMaterial({color:0xdce9ff,transparent:true,opacity:.26,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
 ring.rotation.x=-PI/2;ring.position.y=.04;sg.add(ring);
 sg.position.set(exitPos.x,exitPos.y,exitPos.z);sc.scene.add(sg);shaft={g:sg,m:sm};
 exitLight=new THREE.PointLight(0xbcd2ff,2.4,17,1.5);exitLight.position.set(exitPos.x,exitPos.y+1.6,exitPos.z);sc.scene.add(exitLight);
}

/* ---- yüzey girişleri ---- */
function buildSurface(G){
 if(!G.caves||!G.caves.length)return;
 if(!mat)mat=sc.mat({roughness:.95,pbr:true});
 for(const c of G.caves){
  const P=[];entranceParts(c,P);
  const m=new THREE.Mesh(merge(P,{ao:.8,jit:.09}),mat);m.castShadow=true;m.receiveShadow=true;sc.scene.add(m);groups.push(m);
 }
}
S.onBuild(G=>{
 clearAll();
 if(G.cave)buildCave(G);else buildSurface(G);
});

/* ---- karanlık atmosfer: yalnızca mağarada, ışık kodlarından sonra çalışır ---- */
const cDark=new THREE.Color(0x040508),cHemi=new THREE.Color(0x4a5878),cGnd=new THREE.Color(0x1a1a22);
S.onFrame((G,t,dt,info)=>{
 if(!G.cave||info.mode!=='play')return;
 const scene=sc.scene;
 scene.background.copy(cDark);
 scene.fog.color.copy(cDark);scene.fog.density=.044*(HG.cfg.fog||100)/100;
 if(sc.sun){sc.sun.intensity=0}
 if(sc.moon)sc.moon.intensity=0;
 if(sc.hemi){sc.hemi.color.copy(cHemi);sc.hemi.groundColor.copy(cGnd);sc.hemi.intensity=.34}
 if(sc.lantern){sc.lantern.intensity=.62;sc.lantern.distance=9}
 if(sc.dome)sc.dome.visible=false;
 if(sc.terrainMat){sc.terrainMat.bumpScale=.3;sc.terrainMat.color.setHex(0x7d838f)}
 /* kristal ışıkları: en yakın ikisi gerçek ışık verir */
 const px=G.px,pz=G.py;
 const sorted=glows.map(g=>({g,d:(g.x-px)**2+(g.z-pz)**2})).sort((a,b)=>a.d-b.d);
 for(let i=0;i<lights.length;i++){
  const l=lights[i],s=sorted[i];
  if(s&&s.d<420){l.position.set(s.g.x,s.g.y,s.g.z);l.color.setHex(s.g.col);l.intensity=(s.g.col===0xff3a4a?1.5:1.1)*(.85+.15*Math.sin(t*2.3+s.g.ph));}else l.intensity=0;
 }
 for(const g of glows)g.sp.material.opacity=(g.col===0xff3a4a?.55:.42)*(.8+.2*Math.sin(t*1.7+g.ph));
 if(shaft)shaft.m.opacity=.12+.04*Math.sin(t*1.1);
 if(exitLight)exitLight.intensity=2.2+.3*Math.sin(t*1.3);
});
S.onFrame((G,t,dt,info)=>{
 /* mağaradan çıkınca gökyüzü kubbesi geri gelir */
 if(!G.cave&&sc.dome&&!sc.dome.visible)sc.dome.visible=true;
 if(!G.cave&&sc.terrainMat&&sc.terrainMat.bumpScale!==1.4){sc.terrainMat.bumpScale=1.4;sc.terrainMat.color.setHex(0xffffff)}
});
})();
