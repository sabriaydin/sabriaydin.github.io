/* Hunger 3D - sahne: birinci kişi kolları (kıvrımlı kollu gömlek, eklemli parmaklı eller) ve elde tutulan eşya (kameraya bağlı) */
(()=>{
'use strict';
const {IT}=HG;
const S=HG.Scene,sc=HG.sc;
const {cyl,cone,ico,box,merge,part,blob,rbox,weld,stone,fb3:fb}=sc.g;
const PI=Math.PI;
let root,rArm,lArm,hand,lhand,slot,heldId='__',rigR,rigL,foreR,foreL,twoH,twoOn=false;
const pm=c=>{const m=new THREE.MeshStandardMaterial({color:c,flatShading:false,roughness:.7,metalness:(c===0x8d8d92||c===0xc8743a||c===0xc3c9d0)?.5:0});sc.mats.push(m);return m};

/* ---- Kol malzemeleri: köşe renkleri + nesne uzayında üç yönlü doku (kameraya bağlı olduğundan doku kaymaz), isteğe bağlı ten altı ışık saçılımı ---- */
const fx=v=>(+v).toFixed(4),VMT={};
function vmMat(o){
 const key=JSON.stringify(o);if(VMT[key])return VMT[key];
 const m=new THREE.MeshStandardMaterial({vertexColors:true,color:0xffffff,roughness:o.r===undefined?.7:o.r,metalness:o.m||0,side:o.ds?THREE.DoubleSide:THREE.FrontSide});
 sc.mats.push(m);VMT[key]=m;
 if(!o.t)return m;
 m.customProgramCacheKey=()=>'vm'+key;
 m.onBeforeCompile=sh=>{
  sh.uniforms.tVM={value:sc.tex[o.t]};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vOP;varying vec3 vON;').replace('#include <begin_vertex>','#include <begin_vertex>\nvOP=position;vON=normal;');
  sh.fragmentShader=`#define VM_S ${fx(o.s)}\n#define VM_A ${fx(o.a)}\n#define VM_C ${fx(o.c)}\n#define VM_SSS ${fx(o.sss||0)}\n`+sh.fragmentShader
  .replace('#include <common>',`#include <common>
  uniform sampler2D tVM;varying vec3 vOP;varying vec3 vON;vec3 vmN;float vmH0;
  vec3 vmW(vec3 n){vec3 w=pow(abs(n),vec3(4.));return w/(w.x+w.y+w.z+1e-4);}
  vec4 vmTri(vec3 p,vec3 w){return texture2D(tVM,p.zy*VM_S)*w.x+texture2D(tVM,p.xz*VM_S)*w.y+texture2D(tVM,p.xy*VM_S)*w.z;}
  float vmHt(vec3 p,vec3 w){return texture2D(tVM,p.zy*VM_S).a*w.x+texture2D(tVM,p.xz*VM_S).a*w.y+texture2D(tVM,p.xy*VM_S).a*w.z;}`)
  .replace('#include <color_fragment>',`#include <color_fragment>
  vmN=normalize(vON);vec3 vmw=vmW(vmN);
  {vec4 vt=vmTri(vOP,vmw);diffuseColor.rgb*=mix(vec3(1.),vt.rgb*2.,VM_C);vmH0=vt.a;}`)
  .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
  if(VM_A>.00001){vec3 dpx=dFdx(vOP),dpy=dFdy(vOP);vec2 dh=vec2(vmHt(vOP+dpx,vmw)-vmH0,vmHt(vOP+dpy,vmw)-vmH0)*VM_A;
   vec3 sX=dFdx(-vViewPosition),sY=dFdy(-vViewPosition),R1=cross(sY,normal),R2=cross(normal,sX);float fDet=dot(sX,R1);
   normal=normalize(abs(fDet)*normal-sign(fDet)*(dh.x*R1+dh.y*R2));}`)
  .replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
  totalEmissiveRadiance+=vec3(.9,.3,.2)*pow(1.-clamp(dot(normalize(vViewPosition),normal),0.,1.),2.2)*.13*VM_SSS;`);
 };
 return m;
}
sc.vmMat=vmMat;   /* uzak oyuncu modeli de aynı deri/kumaş malzemelerini kullanır (güncelleme 68) */
const MSKIN=()=>vmMat({t:'pSkin',s:7,a:.0005,c:.2,r:.6,sss:1}),MNAIL=()=>{const k='nail';if(VMT[k])return VMT[k];const m=new THREE.MeshLambertMaterial({vertexColors:true});sc.mats.push(m);return VMT[k]=m},MCLOTH=()=>vmMat({t:'pCloth',s:6,a:.0018,c:.5,r:.96,sss:.1});
const MROCK=()=>vmMat({t:'pRock',s:3.4,a:.006,c:.7,r:.93}),MWOOD=()=>vmMat({t:'pBark',s:4.5,a:.003,c:.5,r:.8}),MMETAL=()=>vmMat({r:.38,m:.75});

/* ---- geometri yardımcıları ---- */
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
/* Merkez çizgisi boyunca eliptik kesitli, çapı değişen boru (kol, kollu gömlek) */
function sweepGeo(pts,prof,seg,warpFn){
 const n=pts.length,pos=[],idx=[];
 for(let i=0;i<n;i++){
  const t=i/(n-1),a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];
  const T=b.clone().sub(a).normalize(),side=new THREE.Vector3().crossVectors(T,V3(0,1,0)).normalize(),up=new THREE.Vector3().crossVectors(side,T),r=prof(t);
  for(let j=0;j<=seg;j++){
   const ph=j/seg*PI*2,c=Math.cos(ph),s=Math.sin(ph),k=warpFn?warpFn(t,ph):1;
   pos.push(pts[i].x+(side.x*c*r[0]+up.x*s*r[1])*k,pts[i].y+(side.y*c*r[0]+up.y*s*r[1])*k,pts[i].z+(side.z*c*r[0]+up.z*s*r[1])*k);
  }
 }
 for(let i=0;i<n-1;i++)for(let j=0;j<seg;j++){const a=i*(seg+1)+j,b=a+1,c=a+seg+1,d=c+1;idx.push(a,c,b,b,c,d)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);
 return weld(g);
}
const sm=(a,b,v)=>{v=Math.max(0,Math.min(1,(v-a)/(b-a)));return v*v*(3-2*v)};
const lerpC=(c,r,g,b,k)=>{r=Math.pow(r,2.2);g=Math.pow(g,2.2);b=Math.pow(b,2.2);c.r+=(r-c.r)*k;c.g+=(g-c.g)*k;c.b+=(b-c.b)*k};      /* hedef renkler sRGB gösterimde verilir, vertex renkleri doğrusal uzaydadır */

/* ---- el: avuç içi (kesitlerden yüzeylenir), dört parmak (3 eklem), başparmak (3 eklem), tırnaklar; parmaklar -Z yönünde, avuç içi -X yönüne bakar, başparmak +Y tarafında ---- */
const SKIN=0xa97256,PALMC=0xc08970,KNUC=0x9a5f4a,NAILC=0xe2bdb1;
const FL=[[.043,.025,.021],[.048,.029,.022],[.044,.027,.021],[.036,.021,.019]],FR=[.0094,.01,.0094,.0083],FY=[.0315,.0105,-.0105,-.0315],FZ=[-.046,-.048,-.045,-.040];
const TL=[.045,.032,.026],TRd=[.0135,.0112,.0098,.0084];
const FRK=[1,.9,.82,.7];                        /* parmak yarıçapının eklemlere göre oranı (uca doğru incelir) */
const segGeo={};
/* sivrilen kapsül: A ekleminden (yarıçap r0) B eklemine (r1), -Z yönünde L; uçlar küre */
function tcap(L,r0,r1){
 const pts=[],n=6;
 for(let i=0;i<=n;i++){const a=i/n*PI/2;pts.push(new THREE.Vector2(r0*Math.sin(a),-r0*Math.cos(a)))}
 for(let i=0;i<=n;i++){const a=i/n*PI/2;pts.push(new THREE.Vector2(r1*Math.cos(a),L+r1*Math.sin(a)))}
 const g=new THREE.LatheGeometry(pts,14);g.rotateX(-PI/2);g.scale(.88,1.03,1);return g;
}
function phal(L,r0,r1,kind){
 const key=[L,r0,r1,kind].join('|');if(segGeo[key])return segGeo[key];
 const cf=(x,y,z,nx,ny,nz,c)=>{
  const u=-z/L,pal=nx<0?Math.min(1,-nx*1.5):0;
  lerpC(c,.66,.44,.36,pal*.45);                                                      /* avuç içi tarafı biraz daha açık ve pembe */
  const cr=Math.exp(-Math.pow((u-1)/.1,2))+Math.exp(-Math.pow(u/.1,2))*.5;          /* eklem kıvrım çizgileri */
  c.multiplyScalar(1-(nx<0?.22:.13)*cr);
  c.multiplyScalar(1-.1*sm(.2,-.9,nx)*0+(nx>.3?.03*Math.cos(u*PI*2):0));
  if(kind>=2){const tip=sm(.45,1.1,u);if(nx<0)lerpC(c,.8,.5,.46,tip*.45);else lerpC(c,.74,.52,.45,tip*.14)}   /* parmak ucu pedi kanlı */
  if(kind===0&&nx>0)lerpC(c,.69,.45,.37,Math.exp(-Math.pow(u/.14,2))*.5);          /* parmak kökü eklemi: pembe */
  if(kind===3)c.multiplyScalar(1-.04*sm(.4,.9,Math.abs(ny)));
 };
 return segGeo[key]=merge([part(tcap(L,r0,r1),SKIN,0,0,0)],{jit:.03,cf});
}
let nailGeo=null;
const getNail=()=>nailGeo||(nailGeo=merge([part(new THREE.SphereGeometry(1,10,8),NAILC,0,0,0)],{jit:.02,cf:(x,y,z,nx,ny,nz,c)=>{if(z<-.55)lerpC(c,.9,.78,.74,.45);else lerpC(c,.9,.58,.52,.4*sm(-.3,.8,z))}}));
/* kesitlerden yüzey: her kesit {z, ht (yarı kalınlık, X), hw (yarı genişlik, Y), cx (X kayması), n (süper elips üssü)} */
function loftGeo(secs,seg){
 const pos=[],idx=[],R=seg+1;
 secs.forEach(s=>{for(let j=0;j<=seg;j++){const ph=j/seg*PI*2,c=Math.cos(ph),sn=Math.sin(ph),e=2/(s.n||2.6);pos.push(s.cx+Math.sign(c)*Math.pow(Math.abs(c),e)*s.ht,Math.sign(sn)*Math.pow(Math.abs(sn),e)*s.hw,s.z)}});
 for(let i=0;i<secs.length-1;i++)for(let j=0;j<seg;j++){const a=i*R+j,b=a+1,c=a+R,d=c+1;idx.push(a,b,c,b,d,c)}
 const k=pos.length/3,s0=secs[0],s1=secs[secs.length-1];pos.push(s0.cx,0,s0.z,s1.cx,0,s1.z);for(let j=0;j<seg;j++){idx.push(k,j+1,j);idx.push(k+1,(secs.length-1)*R+j,(secs.length-1)*R+j+1)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);return weld(g);
}
let palmG=null;
function palmGeo(){
 if(palmG)return palmG;
 const lg=loftGeo([{z:-.05,ht:.0105,hw:.039,cx:.002,n:2.1},{z:-.04,ht:.0128,hw:.0425,cx:.002,n:2.2},{z:-.02,ht:.0142,hw:.0425,cx:.001,n:2.2},{z:0,ht:.0145,hw:.04,cx:0,n:2.2},{z:.025,ht:.0142,hw:.0345,cx:-.001,n:2.15},{z:.045,ht:.013,hw:.0275,cx:0,n:2.1},{z:.06,ht:.012,hw:.0245,cx:0,n:2.0}],20);
 {const p=lg.attributes.position;                                   /* avuç içi yüzeyi: başparmak tabanı ve serçe tarafı kabarır, ortası çukurlaşır, parmak diplerinde pedler */
  for(let i=0;i<p.count;i++){
   let x=p.getX(i);const y=p.getY(i),z=p.getZ(i),w=sm(-.002,-.011,x);
   if(w>0){
    const g2=(a,b,c,d)=>Math.exp(-(((y-a)/b)*((y-a)/b)+((z-c)/d)*((z-c)/d)));
    let d=.0085*g2(.021,.017,.02,.03)+.0055*g2(-.026,.013,.022,.026)-.0035*g2(-.002,.02,-.012,.022);
    for(let k=0;k<4;k++)d+=.003*g2(FY[k],.008,-.041,.009);
    x-=w*d;
   }
   p.setX(i,x);
  }
  lg.computeVertexNormals();}
 const ps=[part(lg,SKIN,0,0,0)];
 const ln=v=>Math.exp(-Math.pow(v/.0022,2));
 const cf=(x,y,z,nx,ny,nz,c)=>{
  if(nx<-.15){lerpC(c,.66,.44,.36,Math.min(1,-nx*1.3)*.7);const l=Math.max(ln(z+.02-.006*y/.04),ln(z-.004+.01*y/.04),ln(Math.hypot(x+.01,y-.02,z-.026)-.025)*(x<0?1:0));c.multiplyScalar(1-.22*l)}
  else if(nx>.3){let t=0;for(let i=0;i<4;i++)t=Math.max(t,Math.exp(-Math.pow((y-FY[i])/.0034,2)));c.multiplyScalar(1+.05*t-.025*(1-t));lerpC(c,.69,.45,.37,Math.exp(-Math.pow((z+.045)/.012,2))*.3)}   /* sırtta ince tendon çizgileri, parmak köklerinde pembelik */
 };
 return palmG=merge(ps,{jit:.03,cf});
}
function mkHand(){
 const rig={root:new THREE.Group(),f:[],th:null},g=rig.root,mk=(geo,mat)=>new THREE.Mesh(geo,mat);
 g.add(mk(palmGeo(),MSKIN()));
 for(let i=0;i<4;i++){
  const mcp=new THREE.Group();mcp.position.set(.001,FY[i],FZ[i]);g.add(mcp);
  const js=[mcp];let par=mcp;
  const kn=mk(sphereKn(FR[i]),MSKIN());kn.position.x=.004;par.add(kn);                          /* parmak kökü eklemi çıkıntısı */
  for(let s=0;s<3;s++){
   const L=FL[i][s],r0=FR[i]*FRK[s],r1=FR[i]*FRK[s+1];par.add(mk(phal(L,r0,r1,s),MSKIN()));
   if(s<2){const j=new THREE.Group();j.position.z=-L;par.add(j);par=j;js.push(j)}
   else{const n=mk(getNail(),MNAIL());n.scale.set(.0016,r1*.9,(L+r1)*.3);n.position.set(r1*.88*.94,0,-L*.64);par.add(n)}
  }
  rig.f.push({j:js});
 }
 const cmc=new THREE.Group();cmc.position.set(-.004,.037,.034);g.add(cmc);
 const mp=new THREE.Group(),ip=new THREE.Group();
 cmc.add(mk(phal(TL[0],TRd[0],TRd[1],3),MSKIN()));mp.position.z=-TL[0];cmc.add(mp);
 mp.add(mk(phal(TL[1],TRd[1],TRd[2],1),MSKIN()));ip.position.z=-TL[1];mp.add(ip);
 ip.add(mk(phal(TL[2],TRd[2],TRd[3],2),MSKIN()));
 const n=mk(getNail(),MNAIL());n.scale.set(.0017,TRd[3]*.9,(TL[2]+TRd[3])*.3);n.position.set(TRd[3]*.88*.94,0,-TL[2]*.64);ip.add(n);
 rig.th={cmc,mp,ip};
 return rig;
}
const _kn={};
function sphereKn(r){return _kn[r]||(_kn[r]=merge([part(new THREE.SphereGeometry(r*1.02,12,9),SKIN,0,0,0)],{jit:.03,cf:(x,y,z,nx,ny,nz,c)=>{lerpC(c,.69,.45,.37,.45*Math.max(0,nx))}}))}
/* Parmak duruşları: [kök, orta, uç] bükülme (rad), açılma, başparmak [açılma, kök dönüş, bükülme 1, bükülme 2] */
const POSE={
 relax:{c:[[.42,.6,.34],[.5,.72,.38],[.6,.82,.4],[.7,.9,.42]],sp:[.06,.02,-.03,-.08],th:[.45,.12,.3,.22]},
 grip:{c:[[.92,1.3,.72],[1.0,1.4,.76],[1.08,1.46,.78],[1.15,1.5,.8]],sp:[0,0,0,0],th:[.18,.25,.55,.55]},
 fist:{c:[[1.3,1.7,1.0],[1.35,1.76,1.05],[1.4,1.8,1.05],[1.42,1.8,1.05]],sp:[0,0,0,0],th:[.15,.3,.8,.7]},
 hold:{c:[[.8,1.0,.6],[.86,1.06,.62],[.9,1.1,.64],[.94,1.12,.66]],sp:[.1,.03,-.04,-.1],th:[.4,.15,.4,.3]}
};
function applyPose(rig,P,k){
 for(let i=0;i<4;i++){
  const j=rig.f[i].j;
  for(let s=0;s<3;s++)j[s].rotation.y+=(P.c[i][s]-j[s].rotation.y)*k;
  j[0].rotation.x+=(P.sp[i]-j[0].rotation.x)*k;
 }
 const t=rig.th,T=P.th;
 t.cmc.rotation.x+=(T[0]-t.cmc.rotation.x)*k;t.cmc.rotation.y+=(T[1]-t.cmc.rotation.y)*k;
 t.mp.rotation.y+=(T[2]-t.mp.rotation.y)*k;t.ip.rotation.y+=(T[3]-t.ip.rotation.y)*k;
}
/* ---- kol: kollu gömlek (kıvrımlı, kumaş dokulu, kıvrık manşet) ve ön kol ---- */
const SHIRT=0xa8332a,CUFF=0x8a2620;
const GRIP=[-.03,0,-.048],KS=1.42/.8,AP=[0,-.03,-.52];            /* parmakların oluşturduğu tutma boşluğunun merkezi (el uzayı) ve el ölçeği (tutucu .8 ölçekli) */
function mkArm(x,left,rig){
 const g=new THREE.Group();g.position.set(x,left?-.37:-.31,-.115);root.add(g);if(left)g.scale.x=-1;
 /* kollu gömlek */
 const zc=-.3,zs=.5;
 const pts=[];for(let i=0;i<=22;i++){const t=i/22;pts.push(V3(0,-.07*(1-t),zs+(zc-zs)*t))}
 const R=t=>.098-.026*Math.pow(t,.8);
 const fold=(t,ph)=>1+(fb(Math.cos(ph)*1.7+3,Math.sin(ph)*1.7,t*3.4,5)-.5)*.17+.03*Math.sin(t*38+ph*1.8)*sm(.5,1,t)-.035*sm(.82,1,t)*(.5+.5*Math.cos(ph*2+1));
 const sg=sweepGeo(pts,t=>[R(t),R(t)*.94],30,fold);
 const scf=(x,y,z,nx,ny,nz,c)=>{
  const t=(zs-z)/(zs-zc),ph=Math.atan2(y+.07*(1-t),x),f=fold(t,ph);
  c.multiplyScalar(.7+(f-.9)*2.6);                                                     /* kıvrım içi koyu, sırt açık */
  c.multiplyScalar(.94+.12*Math.max(0,ny));
  if(t>.93)lerpC(c,.55,.16,.13,sm(.93,1,t)*.7);
 };
 const hem=new THREE.TorusGeometry(R(1)*1.005,.0085,8,36);hem.scale(1,.94,1);
 const lin=new THREE.RingGeometry(.05,R(1)*.99,28,1);lin.rotateY(PI);
 const sl=merge([Object.assign(part(sg,SHIRT,0,0,0),{cf:scf}),part(hem,CUFF,0,0,zc),part(lin,0x3a1210,0,0,zc+.002)],{jit:.04});
 const sleeve=new THREE.Mesh(sl,MCLOTH());g.add(sleeve);
 /* ön kol: gömleğin içinden başlar, bileğe doğru sivrilir; her karede ucu el bileğine çevrilir (tek parça tüp) */
 const fore=new THREE.Group();fore.position.set(0,-.025,-.02);g.add(fore);
 const fp=[];for(let i=0;i<=12;i++)fp.push(V3(0,0,i/12));
 const fgeo=sweepGeo(fp,t=>[.056-.0375*Math.pow(t,.8),.054-.018*Math.pow(t,.8)],18,(t,ph)=>1+.02*Math.sin(ph*3+t*5));
 const fcf=(x,y,z,nx,ny,nz,c)=>{lerpC(c,.66,.44,.36,nx<-.3?.28:0);const m=fb(x*20,y*20,z*3,9);c.multiplyScalar(.95+.1*m);lerpC(c,.69,.45,.37,.2*sm(.55,1,z))};
 fore.add(new THREE.Mesh(merge([Object.assign(part(fgeo,SKIN,0,0,0),{cf:fcf})],{jit:.02}),MSKIN()));
 /* tutucu (elin bağlandığı nokta) ve el */
 const anc=new THREE.Group();anc.position.set(AP[0],AP[1],AP[2]);anc.scale.setScalar(.8);g.add(anc);
 rig.root.scale.setScalar(KS);rig.root.position.set(-GRIP[0]*KS,-GRIP[1]*KS,-GRIP[2]*KS);anc.add(rig.root);
 return {g,anc,fore};
}
const cache={};
/* El Taşı: iki elle tutulan, kırık yüzlü, sivri uçlu taş (sivri uç ileride) */
function rockModel(small){
 const g=new THREE.Group(),k=small?.55:1,s=stone(.15*k,.078*k,.088*k,small?77:41,{taper:.55,cuts:6,flat:.8,detail:5});
 const m=new THREE.Mesh(merge([part(s.geo,0x4c4842,0,0,0)],{jit:.05,cf:s.cf}),MROCK());m.rotation.y=PI/2;g.add(m);
 return g;
}
/* Alet: ahşap sap (köşe renginde lif deseni), taş/bakır/demir baş ve bağlama ipi; üç ayrı malzeme */
function toolModel(g,kind,tier){
 const tp=sc.g.toolParts(kind,tier),grp=new THREE.Group(),mk=(list,mat)=>{if(list.length){const m=new THREE.Mesh(merge(list,{jit:.03}),mat);grp.add(m)}};
 mk(tp.wood,vmMat({r:.62}));mk(tp.head,kind==='rod'?vmMat({r:.6}):tier===1?MROCK():vmMat({r:.42,m:.55}));mk(tp.cord,vmMat({r:.92}));
 g.add(grp);return grp;
}
/* Eşyanın elde görünen modeli: sap +Y ekseninde, uç yukarıda */
function heldModel(id){
 if(cache[id]!==undefined)return cache[id];
 const it=IT[id],g=new THREE.Group();
 const add=(geo,c,x,y,z,rx,ry,rz)=>{const m=new THREE.Mesh(geo,pm(c));m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,rz||0);g.add(m)};
 const tc=[0,0x8d8d92,0xc8743a,0xc3c9d0];
 if(sc.heldX&&sc.heldX[id])sc.heldX[id](g,add);
 else if(it.tool==='rock'){const r=rockModel(false);g.add(r)}
 else if(id==='stone'){const r=rockModel(true);r.position.y=.07;g.add(r)}
 else if(it.tool==='axe'||it.tool==='pick'){toolModel(g,it.tool,it.tier||1)}
 else if(it.tool==='rod'){const r=toolModel(g,'rod',1);r.rotation.x=.5;r.position.set(0,.08,.04);add(cyl(.0035,.0035,.7,3),0xdddddd,0,.55,.6,.2)}
 else if(it.tool==='bow'){bowModel(g,add)}
 else if(it.tool==='torch'){torchModel(g,add)}
 else if(it.tool==='raft'){for(let i=0;i<4;i++)add(cyl(.045,.045,.5,7),i%2?0x8a5a30:0x6b4423,0,.18,(i-1.5)*.09,0,0,Math.PI/2);add(box(.04,.03,.4),0x4a3220,.12,.235,0);add(box(.04,.03,.4),0x4a3220,-.12,.235,0)}
 else if(it.tool==='plan'){
  add(box(.31,.42,.022),0x3b2714,0,.24,0);add(box(.27,.38,.026),0x2f5f8f,0,.24,0);add(box(.27,.05,.03),0x4a7fb5,0,.415,0);
  add(box(.2,.012,.03),0xe8f2ff,0,.15,0);add(box(.012,.1,.03),0xe8f2ff,-.1,.2,0);add(box(.012,.1,.03),0xe8f2ff,.1,.2,0);
  add(box(.13,.012,.03),0xe8f2ff,-.05,.285,0,0,0,.62);add(box(.13,.012,.03),0xe8f2ff,.05,.285,0,0,0,-.62);
  add(box(.045,.07,.03),0xe8f2ff,0,.19,0);
 }
 else if(it.tool==='hammer'){
  add(cyl(.022,.028,.66,7),0x74502e,0,.26,0);add(cyl(.03,.03,.05,7),0x5e3b1d,0,-.06,0);
  add(box(.105,.1,.17),0x6d737a,0,.62,0);add(box(.11,.03,.175),0x9aa0a8,0,.665,0);add(box(.11,.1,.04),0x8d939a,0,.62,.105);add(box(.11,.1,.04),0x8d939a,0,.62,-.105);add(box(.115,.12,.06),0x3a3d42,0,.62,0);
 }
 else if(it.heal){add(cyl(.07,.07,.16,10),0xe8e4da,0,.1,0,Math.PI/2);add(box(.17,.04,.075),0xd9463c,0,.1,0)}
 else if(id==='arrow'){add(cyl(.01,.01,.6,5),0xa87440,0,.3,0);add(cone(.025,.08,4),0xc3c9d0,0,.64,0);add(box(.002,.06,.1),0xd9463c,0,.04,0)}
 else if(it.place){const c={fire:0x8a5a30,bench:0xa47544,furn:0x77777f,wallw:0xa67848,walls:0x8c8c94,door:0x6b4a29}[id];add(box(.26,.26,.26),c,0,.16,0)}
 else{const c={sardine:0x6f8ea8,bass:0x5e7a62,tuna:0x243e66,crab:0xc24a2a,ccrab:0xb8381a,coral:0xe86a8a,mask:0x7fd0e8,wood:0x7a4f29,coal:0x1a1a1f,sand:0xdac68c,copper_ore:0xc8743a,iron_ore:0xb99a80,copper_ingot:0xd9854a,coin:0xd9985a,bag:0x4a6a8a,iron_ingot:0xbcc2c8,berries:0xc42d3a,coconut:0x5b3a1c,fish:0x6fa0c0,cfish:0xb07a35,bottle:0xbfe6f0,wbottle:0x5fb0e0}[id]||0xcccccc;add(ico(.12),c,0,.12,0)}
 return cache[id]=g;
}
sc.itemModel=heldModel;
const REF=new WeakMap();   /* animasyon bağlantıları: userData'ya konmaz (klonlama JSON'a çevirir) */
/* ---- yay: kollar, sicim ve ok; ger animasyonu onFrame içinde ---- */
const _y=new THREE.Vector3(0,1,0),_d=new THREE.Vector3(),_q=new THREE.Quaternion();
function seg(m,a,b){
 _d.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);const l=_d.length()||1e-4;
 m.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);m.quaternion.copy(_q.setFromUnitVectors(_y,_d.normalize()));m.scale.set(1,l,1);
}
function bowModel(g,add){
 const wood=0x8a5a30,N=6,H=.52;
 const pts=[];for(let i=-N;i<=N;i++){const y=i/N*H;pts.push([0,y,-.17*(1-(y/H)*(y/H))])}
 const unit=new THREE.CylinderGeometry(.016,.02,1,5);
 for(let i=0;i<pts.length-1;i++){const m=new THREE.Mesh(unit,pm(wood));seg(m,pts[i],pts[i+1]);g.add(m)}
 add(box(.045,.2,.06),0x3a2a1a,0,0,-.17);
 const s1=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,1,3),pm(0xe8e4da)),s2=s1.clone();
 g.add(s1,s2);
 const ar=new THREE.Group();
 const am=(geo,c,x,y,z,rx)=>{const k=new THREE.Mesh(geo,pm(c));k.position.set(x,y,z);k.rotation.x=rx||0;ar.add(k)};
 am(cyl(.01,.01,.72,5),0xa87440,0,0,-.36,Math.PI/2);am(cone(.026,.1,4),0xc3c9d0,0,0,-.76,-Math.PI/2);am(box(.002,.06,.14),0xd9463c,0,0,-.04);
 g.add(ar);
 REF.set(g,{bow:{s1,s2,ar,top:pts[pts.length-1],bot:pts[0]}});
}
function torchModel(g,add){
 add(cyl(.025,.032,.78,6),0x6b4423,0,.3,0);
 add(cyl(.05,.04,.16,7),0x2b2018,0,.7,0);
 const fm=(c)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.95,depthWrite:false,toneMapped:false});
 const f1=new THREE.Mesh(cone(.07,.3,7),fm(new THREE.Color(3,1.1,.18))),f2=new THREE.Mesh(cone(.045,.22,6),fm(new THREE.Color(3.4,2.2,.6))),f3=new THREE.Mesh(cone(.022,.14,5),fm(new THREE.Color(3.6,3.2,2)));
 f1.position.set(0,.92,0);f2.position.set(0,.88,0);f3.position.set(0,.85,0);
 const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:sc.tex.glow,color:0xffa040,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,toneMapped:false,opacity:.7}));
 gl.scale.set(.9,.9,1);gl.position.set(0,.9,0);
 g.add(f1,f2,f3,gl);REF.set(g,{torch:{f1,f2,f3,gl}});
}
S.onInit(()=>{
 root=new THREE.Group();sc.cam.add(root);
 rigR=mkHand();rigL=mkHand();
 const a=mkArm(.4,false,rigR),b=mkArm(-.4,true,rigL);
 rArm=a.g;lArm=b.g;hand=a.anc;lhand=b.anc;foreR=a.fore;foreL=b.fore;
 slot=new THREE.Group();hand.add(slot);                                   /* eşya modeli burada durur (el ile birlikte hareket eder) */
 twoH=new THREE.Group();twoH.visible=false;root.add(twoH);                /* iki elle tutulan eşya */
 sc.viewmodel=root;
 sc.torchLight=new THREE.PointLight(0xff9a40,0,18,1.5);sc.torchLight.position.set(.25,-.1,-.8);sc.cam.add(sc.torchLight);
});
function animateHeld(G,t,dt,id){
 const it=id?IT[id]:null,tl=sc.torchLight;
 /* meşale: titreyen alev ve ışık */
 const m=it&&it.tool==='torch'?heldModel(id):null;
 const mr=m&&REF.get(m);
 if(mr&&mr.torch){
  const T=mr.torch,lit=G.torchLit,fl=1+Math.sin(t*23)*.08+Math.sin(t*37+1)*.06;
  for(const k of [T.f1,T.f2,T.f3]){k.visible=!!lit;k.scale.set(fl,fl*(1+Math.sin(t*31)*.12),fl)}
  T.gl.visible=!!lit;T.gl.scale.setScalar(.8*fl);
  const wind=(sc.rain||0)*.25;
  tl.intensity=lit?(2.6+Math.sin(t*19)*.35+Math.sin(t*7.3)*.25)*(1-wind)*(1-(sc.fear||0)*.35*(Math.sin(t*41)>.7?1:0)):0;
  hand.rotation.z=Math.sin(t*1.7)*.03;
 }else{tl.intensity=0;hand.rotation.z=0}
 /* yay */
 const bm=it&&it.tool==='bow'?heldModel(id):null;
 const br=bm&&REF.get(bm);
 if(br&&br.bow){
  const b=br.bow,dr=HG.bow.draw,zn=dr*.34-HG.bow.kick*.0,nock=[0,0,zn];
  seg(b.s1,b.top,nock);seg(b.s2,nock,b.bot);
  b.ar.visible=HG.count('arrow')>0;b.ar.position.z=zn;
  hand.position.set(-.1+dr*.0,AP[1],-.55+HG.bow.kick*.06);
  hand.rotation.x=0;hand.rotation.y=.35;hand.rotation.z=0;
  if(dr>.85){root.position.x+=Math.sin(t*40)*.002;root.position.y+=Math.cos(t*37)*.002}
 }else{hand.position.set(AP[0],AP[1],AP[2]);hand.rotation.y=0}
}
/* Vurma animasyonu: kol geriye kalkar (hazırlık), hızla öne iner (vuruş), toparlanır. Elde eşya yoksa yumruk atılır. */
sc.swingT=-1;sc.swingDur=.36;
HG.armSwing=d=>{sc.swingT=0;sc.swingDur=d||.36};
const GATHER=/^(node|hit|dig)/;
const ease=x=>x*x*(3-2*x);
function swingPose(dt,hasItem){
 if(sc.swingT<0)return null;
 sc.swingT+=dt;
 const u=sc.swingT/sc.swingDur;
 if(u>=1){sc.swingT=-1;return null}
 let a,h,z,y;
 if(u<.34){const k=ease(u/.34);a=.62*k;h=.6*k;z=.05*k;y=.12*k}                                  /* hazırlık: kol yukarı-geri */
 else if(u<.54){const k=(u-.34)/.2,e=k*k;a=.62-.98*e;h=.6-2.0*e;z=.05-.12*e;y=.12-.2*e}         /* vuruş: hızlı iniş */
 else{const k=ease((u-.54)/.46);a=-.36*(1-k);h=-1.4*(1-k);z=-.07*(1-k);y=-.08*(1-k)}           /* toparlanma */
 if(!hasItem){const st=u<.34?-.18*ease(u/.34):u<.54?-.18+.5*((u-.34)/.2):.32*(1-ease((u-.54)/.46));return {a:a*.45,h:0,z:st*-1.2,y:y*.5}}   /* yumruk: kol öne uzanır */
 return {a,h,z,y};
}
/* İki elle tutulan taş: hazırlıkta yukarı-geri kalkar, vuruşta öne-aşağı iner, toparlanır */
function rockSwing(dt){
 if(sc.swingT<0)return null;
 sc.swingT+=dt;
 const u=sc.swingT/sc.swingDur;
 if(u>=1){sc.swingT=-1;return null}
 if(u<.36){const k=ease(u/.36);return {y:.2*k,z:.12*k,rx:.8*k}}
 if(u<.56){const k=(u-.36)/.2,e=k*k;return {y:.2-.38*e,z:.12-.36*e,rx:.8-1.7*e}}
 const k=ease((u-.56)/.44);return {y:-.18*(1-k),z:-.24*(1-k),rx:-.9*(1-k)}
}
/* Ön kolun ucu avucun arkasındaki bilek noktasına çevrilir */
const _w=new THREE.Vector3(),_z=new THREE.Vector3(0,0,1);
function placeFore(fore,anc){
 anc.updateMatrix();
 _w.set(-GRIP[0]*KS,-GRIP[1]*KS,-GRIP[2]*KS+.054*KS).applyMatrix4(anc.matrix).sub(fore.position);
 const L=_w.length()||1;fore.quaternion.setFromUnitVectors(_z,_w.divideScalar(L));fore.scale.z=L;
}
/* Kolu, tutucu noktası hedefe gelecek biçimde yerleştirir (omuz sabit bir noktadır) */
const _a0=new THREE.Vector3();
function ikArm(arm,tx,ty,tz,sx,roll){
 const dx=tx-sx,dy=ty+.8,dz=tz-.45;
 arm.rotation.order='YXZ';arm.rotation.set(Math.atan2(dy,Math.hypot(dx,dz)),Math.atan2(-dx,-dz),roll);
 _a0.set(AP[0],AP[1],AP[2]).applyEuler(arm.rotation);
 arm.position.set(tx-_a0.x,ty-_a0.y,tz-_a0.z);
}
const _p=new THREE.Vector3();
const RK={dx:.105,dy:-.012,dz:.02,roll:.3};          /* taşın yan yüzeylerinde, avuç içleri içe bakan eller */
function setTwo(on){
 twoOn=on;twoH.visible=on;
 if(on){rArm.rotation.order=lArm.rotation.order='YXZ'}
 else{rArm.rotation.order=lArm.rotation.order='XYZ';rArm.rotation.set(0,0,0);lArm.rotation.set(0,0,0);rArm.position.set(.4,-.31,-.115);lArm.position.set(-.4,-.37,-.115);hand.rotation.set(0,0,0);lhand.rotation.set(0,0,0)}
}
/* ---- Yakın engel: eller ve elde tutulan eşya duvara, ağaca, kayaya, araziye ve canlılara girmez ---- */
const _rt=new THREE.Vector3(),_up=new THREE.Vector3(),_bk=new THREE.Vector3(),_o=new THREE.Vector3();
const CLR_RAYS=[[0,0],[.3,-.25],[-.3,-.25],[0,-.4],[.14,.12],[-.14,.12]];     /* kamera uzayında yanal ve dikey kayma (el, kol, eşya ucu) */
let pullK=0;
function blockedAt(G,x,y,z,near){
 const W=HG.W,H=HG.H,tx=Math.floor(x),tz=Math.floor(z);
 if(tx<0||tz<0||tx>=W||tz>=H)return true;
 const i=tz*W+tx,o=G.obj[i],gy=S.groundY(x,z);
 if(y<gy+.03)return true;                                           /* arazi */
 if(o&&HG.SOLID(o)&&y<gy+(HG.OBJTOP[o]||1)&&y>gy-.3)return true;    /* ağaç, kaya, maden, duvar, yapı */
 if(G.cave&&G.tile[i]===HG.T.ROCK)return true;                      /* mağara duvarı */
 for(const q of near){
  const dx=x-q.x,dz=z-q.z;
  if(dx*dx+dz*dz<q.r*q.r&&y>q.y0&&y<q.y0+q.h)return true;           /* hayvan, köylü */
 }
 return false;
}
function clearance(G,cam,front){
 cam.matrixWorld.extractBasis(_rt,_up,_bk);_o.setFromMatrixPosition(cam.matrixWorld);
 const near=[];
 for(const a of G.animals||[]){
  if(a.dying)continue;const dx=a.x-_o.x,dz=a.z-_o.z;if(dx*dx+dz*dz>9)continue;
  const def=HG.ANIMAL[a.t];if(!def)continue;
  near.push({x:a.x,z:a.z,r:def.r*.9+.05,h:def.h,y0:a.by!==undefined?a.by:S.groundY(a.x,a.z)});
 }
 for(const n of G.npcs||[]){
  if(n.inside)continue;const dx=n.x-_o.x,dz=n.z-_o.z;if(dx*dx+dz*dz>9)continue;
  near.push({x:n.x,z:n.z,r:.33,h:1.75,y0:S.groundY(n.x,n.z)});
 }
 let dmin=front;
 for(const [lx,ly] of CLR_RAYS){
  const bx=_o.x+_rt.x*lx+_up.x*ly,by=_o.y+_rt.y*lx+_up.y*ly,bz=_o.z+_rt.z*lx+_up.z*ly;
  for(let d=.06;d<dmin;d+=.06){
   if(blockedAt(G,bx-_bk.x*d,by-_bk.y*d,bz-_bk.z*d,near)){dmin=d;break}
  }
 }
 return dmin;
}
S.onFrame((G,t,dt,info)=>{
 const play=info.mode==='play';
 if(!play&&sc.torchLight)sc.torchLight.intensity=0;
 root.visible=play&&(!!info.held||sc.swingT>=0);if(!play)return;
 const id=info.held,it=id?IT[id]:null,two=!!(it&&it.tool==='rock');
 if(id!==heldId){
  heldId=id;while(slot.children.length)slot.remove(slot.children[0]);while(twoH.children.length)twoH.remove(twoH.children[0]);
  if(id){if(two)twoH.add(heldModel(id));else slot.add(heldModel(id))}
 }
 if(two!==twoOn)setTwo(two);
 const mv=G.moving,ph=mv?Math.sin(G.walk*10):0;
 /* atalet: bakış değişimine geç tepki, koşuda aşağı eğim, inişte çökme, zıplamada yükselme */
 const lk=HG.look,ws=sc.ws||(sc.ws={y:lk.yaw,p:lk.pitch,sx:0,sy:0,dip:0,dv:0,n:0});
 let dyw=lk.yaw-ws.y,dpt=lk.pitch-ws.p;ws.y=lk.yaw;ws.p=lk.pitch;
 dyw=Math.max(-.2,Math.min(.2,dyw));dpt=Math.max(-.2,Math.min(.2,dpt));
 const kf=1-Math.exp(-9*dt);ws.sx+=(-dyw*.5-ws.sx)*kf;ws.sy+=(dpt*.5-ws.sy)*kf;
 if((G.landN||0)!==ws.n){ws.n=G.landN||0;ws.dv=-(G.landImp||0)*1.4}
 ws.dv+=(-ws.dip*70-ws.dv*9)*dt;ws.dip+=ws.dv*dt;
 const spk=Math.min(1.4,(G.spdNow||0)/3.4),spr=G.sprint?1:0,air=G.air?(G.vz>0?.02:-.015):0;
 root.position.set((mv?Math.cos(G.walk*5)*.012*spk:0)+ws.sx*.15,(mv?Math.abs(ph)*.015*spk:0)+ws.sy*.15+ws.dip*.05+air-spr*.02,spr*.03);
 root.rotation.set(spr*.22+ws.sy*.6,ws.sx*.7,ws.sx*.5+(mv?Math.cos(G.walk*5)*.01*spk:0));
 /* engele yaklaşınca eller geri çekilir (en öndeki nokta engelin önünde kalır) */
 {
  const front=(two?.85:id?(it&&it.tool==='bow'?1.0:.95):.62)+(sc.swingT>=0?.12:0);
  const want=Math.max(0,front-clearance(G,sc.cam,front));
  pullK+=(want-pullK)*(1-Math.exp(-(want>pullK?24:9)*dt));
  if(pullK<.002)pullK=0;
  if(pullK>0){root.position.z+=pullK;root.position.y-=pullK*.1;root.rotation.x+=pullK*.2}
 }
 const pk=1-Math.exp(-14*dt);
 if(two){
  const sp=rockSwing(dt),br=Math.sin(t*1.5)*.004;
  twoH.position.set(0,-.3+(sp?sp.y:0)+br,-.58+(sp?sp.z:0));twoH.rotation.set(sp?sp.rx:.08,0,0);twoH.updateMatrix();
  for(const sd of [1,-1]){
   const arm=sd>0?rArm:lArm;_p.set(sd*RK.dx,RK.dy,RK.dz).applyMatrix4(twoH.matrix);
   ikArm(arm,_p.x-sd*.0426,_p.y,_p.z-.068,sd*.36,-sd*RK.roll);
  }
  hand.rotation.set(0,0,0);lhand.rotation.set(0,0,0);
  applyPose(rigR,POSE.hold,pk);applyPose(rigL,POSE.hold,pk);
  placeFore(foreR,hand);placeFore(foreL,lhand);
  tlOff(G,t,dt);
  return;
 }
 const spose=swingPose(dt,!!id);
 if(spose){rArm.rotation.x=spose.a;rArm.rotation.y=-.05+spose.y}
 else if(info.act&&!GATHER.test(HG.A.key||'')){rArm.rotation.x=.13+Math.sin(t*15)*.6;rArm.rotation.y=-.1+Math.sin(t*15)*.12}
 else{rArm.rotation.x+=((id?0:-.3)-rArm.rotation.x)*(1-Math.exp(-12*dt));rArm.rotation.y*=.85}
 hand.rotation.x=id?-.33:0;
 animateHeld(G,t,dt,id);
 if(spose){hand.rotation.x+=spose.h;rArm.position.z=-.115+spose.z}else rArm.position.z=-.115;
 lArm.rotation.x=-.18+(mv?-ph*.06:0);
 lhand.rotation.set(-.3,.12,0);
 /* parmak duruşu: eşya varsa kavrama, boş elle vururken yumruk, aksi halde gevşek */
 applyPose(rigR,id?POSE.grip:(spose?POSE.fist:POSE.relax),pk);applyPose(rigL,POSE.relax,pk);
 placeFore(foreR,hand);placeFore(foreL,lhand);
});
/* iki elle tutma modunda meşale ışığı kapalı */
function tlOff(){if(sc.torchLight)sc.torchLight.intensity=0}
})();
