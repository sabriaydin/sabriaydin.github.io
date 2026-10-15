/* Hunger 3D - sahne: çekirdek: three.js oluşturucu, kamera, kayıt sistemi, her kare çizim */
(()=>{
'use strict';
const {W,H,EYE,look,clamp}=HG;
const S=HG.Scene,sc=HG.sc;
THREE.ColorManagement.legacyMode=false;
sc.mode='menu';sc.quality=3;sc.fpsAcc=0;sc.fpsN=0;sc.fov=75;
sc.mats=[];
sc.mat=extra=>{
 const o=Object.assign({},extra||{}),pbr=o.pbr,leaf=o.leaf,ore=o.ore;delete o.pbr;delete o.leaf;delete o.ore;                 /* pbr: yüzey ayrıntı dokuları (gerceklik.js) uygulanır */
 const m=new THREE.MeshStandardMaterial(Object.assign({vertexColors:true,flatShading:false,roughness:.92,metalness:0},o));
 if(pbr||leaf)m.userData.pbr=1;
 if(ore){m.userData.pbr=1;m.userData.ore=1}                 /* maden: kaya dokusu ve parlak cevher yüzleri */
 if(leaf)m.userData.leaf=1;                                   /* yaprak: kenarlar parçalanır */
 sc.mats.push(m);return m;
};
sc.col=c=>new THREE.Color(c);

/* Diğer sahne dosyaları buraya kayıt olur: onInit, onBuild, onSync, onFrame */
const reg=n=>{const a=[];S['on'+n]=f=>a.push(f);return a};
const initFns=reg('Init'),buildFns=reg('Build'),syncFns=reg('Sync'),frameFns=reg('Frame'),qualityFns=reg('Quality');

S.init=canvas=>{
 const R=sc.R=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
 R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.0;
 R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
 sc.scene=new THREE.Scene();sc.scene.background=sc.col(0x8ec9ee);sc.scene.fog=new THREE.FogExp2(0x8ec9ee,.0105);
 sc.cam=new THREE.PerspectiveCamera(75,1,.05,400);sc.cam.rotation.order='YXZ';
 sc.scene.add(sc.cam);                       /* kol modeli kameraya bağlı olduğundan sahnede olmalı */
 initFns.forEach(f=>f());
 sc.qMode=(HG.cfg&&String(HG.cfg.q))||'auto';
 R.toneMappingExposure=C().bright/100;
 S.setQuality(sc.qMode==='auto'?3:+sc.qMode);
 S.resize();
};
/* Kalite kademeleri: 3 Yüksek, 2 Orta, 1 Düşük, 0 En düşük */
const C=()=>HG.cfg||{res:100,shadow:true,grass:100,fov:75,sens:100,shake:100,invY:false,bright:100};
const QS={3:{pr:2,sh:2048,grass:1},2:{pr:1.5,sh:1024,grass:.5},1:{pr:1,sh:0,grass:.25},0:{pr:.75,sh:0,grass:0}};
S.setQuality=q=>{
 q=clamp(q,0,3);sc.quality=q;const o=QS[q],R=sc.R;
 R.setPixelRatio(Math.min(window.devicePixelRatio||1,o.pr)*C().res/100);
 const sun=sc.sun;
 if(sun){
  sun.castShadow=o.sh>0&&C().shadow;
  if(o.sh>0&&sun.shadow.mapSize.x!==o.sh){sun.shadow.mapSize.set(o.sh,o.sh);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}}
 }
 sc.grassFrac=o.grass*C().grass/100;
 qualityFns.forEach(f=>f(q,o));
 if(sc.cam)S.resize();
 sc.scene.traverse(m=>{if(m.material){const ms=Array.isArray(m.material)?m.material:[m.material];ms.forEach(x=>x.needsUpdate=true)}});
};
const QN={auto:'Otomatik',3:'Yüksek',2:'Orta',1:'Düşük',0:'En düşük'};
S.qualityLabel=()=>QN[sc.qMode];
S.applyCfg=key=>{
 const o=QS[sc.quality];
 if(key==='res'){sc.R.setPixelRatio(Math.min(window.devicePixelRatio||1,o.pr)*C().res/100);S.resize()}
 else if(key==='grass'){sc.grassFrac=o.grass*C().grass/100;qualityFns.forEach(f=>f(sc.quality,o))}
};
S.cycleQuality=()=>{
 const order=['auto','3','2','1'];sc.qMode=order[(order.indexOf(String(sc.qMode))+1)%order.length];
 try{localStorage.setItem('hunger-kalite',sc.qMode)}catch(e){}
 S.setQuality(sc.qMode==='auto'?3:+sc.qMode);sc.fpsAcc=0;sc.fpsN=0;if(HG.cfg){HG.cfg.q=String(sc.qMode);const e=document.getElementById('s_q');if(e)e.value=HG.cfg.q}return S.qualityLabel();
};
S.build=G=>{buildFns.forEach(f=>f(G));S.sync(G);sc.camInit=false};
/* Aşamalı kurulum: her adımdan sonra arayüze nefes aldırır, ilerlemeyi bildirir */
S.buildAsync=async(G,cb)=>{
 const n=buildFns.length;
 for(let i=0;i<n;i++){buildFns[i](G);if(cb)cb((i+1)/(n+1));await new Promise(r=>setTimeout(r,0))}
 S.sync(G);sc.camInit=false;if(cb)cb(1);
};
/* Gölgelendiricileri önceden derle: ilk karedeki takılmayı azaltır */
S.warmup=()=>{try{sc.R.compile(sc.scene,sc.cam)}catch(e){}};
S.sync=G=>syncFns.forEach(f=>f(G));
S.setMode=m=>{sc.mode=m;sc.camInit=false};
S.resize=()=>{const w=innerWidth,h=innerHeight;sc.R.setSize(w,h,false);sc.cam.aspect=w/h;sc.cam.updateProjectionMatrix()};
/* Fare/dokunma ile bakış: dx sağa (yaw azalır), dy aşağı (pitch azalır) */
S.look=(dx,dy)=>{const c=C(),k=c.sens/100;look.yaw-=dx*k;look.pitch=clamp(look.pitch-dy*k*(c.invY?-1:1),-1.5,1.5)};

const tgt=new THREE.Vector3(),orbit=new THREE.Vector3();
S.render=(G,now,dt,info)=>{
 const t=now*.001,play=info.mode==='play',cam=sc.cam;
 /* kamera */
 if(play){
  /* kamera dinamiği: hıza bağlı adım sallanması, iniş çökmesi, yan hareket eğimi, nefes alma */
  const cd=sc.cd||(sc.cd={dip:0,dv:0,roll:0,lastN:0,pch:0}),sp=G.spdNow||0,spk=Math.min(1.4,sp/3.4);
  if((G.landN||0)!==cd.lastN){cd.lastN=G.landN||0;cd.dv=-(G.landImp||0)*2.6}
  cd.dv+=(-cd.dip*90-cd.dv*11)*dt;cd.dip+=cd.dv*dt;                    /* sönümlü yay */
  const strafe=((G.pvx||0)*Math.cos(look.yaw)-(G.pvy||0)*Math.sin(look.yaw));
  cd.roll+=(-strafe*.0065-cd.roll)*(1-Math.exp(-7*dt));
  const rough=(G.stam!==undefined&&G.stam<25)||G.tired?1:0,br=Math.sin(t*(rough?4.6:1.4))*(rough?.012:.0035);
  const gnd=G.moving&&!G.air;
  const bob=gnd?Math.sin(G.walk*10)*.04*spk*(G.sprint?1.25:1):0,sway=gnd?Math.cos(G.walk*5)*.018*spk:0;
  const tp=(G.air?(G.vz>0?.012:-.02):0);cd.pch+=(tp-cd.pch)*(1-Math.exp(-6*dt));
  const gy=G.pz!==undefined?G.pz:S.groundY(G.px,G.py);
  cam.position.set(G.px+Math.cos(look.yaw)*sway,gy+EYE+bob+cd.dip*.14+br,G.py-Math.sin(look.yaw)*sway);
  cam.rotation.set(look.pitch+cd.pch-(gnd?Math.abs(Math.sin(G.walk*10))*.004*spk:0)-cd.dip*.1,look.yaw,cd.roll+(gnd?Math.sin(G.walk*5)*.0035*spk:0));
  if(sc.shake>.002){const s=sc.shake*C().shake/100;cam.rotation.x+=(Math.random()-.5)*s*.05;cam.rotation.y+=(Math.random()-.5)*s*.05;cam.rotation.z+=(Math.random()-.5)*s*.04;sc.shake*=Math.exp(-dt*6)}
  const tf=C().fov+(G.sprint?8:0)-(HG.bow?HG.bow.draw*24:0);sc.fov+=(tf-sc.fov)*(1-Math.exp(-6*dt));
  if(Math.abs(cam.fov-sc.fov)>.05){cam.fov=sc.fov;cam.updateProjectionMatrix()}
 }else{
  const ay=info.clock*.05,r=62;orbit.set(W/2+Math.sin(ay)*r,34,H/2+Math.cos(ay)*r);
  cam.position.lerp(orbit,sc.camInit?1-Math.exp(-3*dt):1);sc.camInit=true;
  tgt.set(W/2,0,H/2);cam.lookAt(tgt);
  if(cam.fov!==60){cam.fov=60;cam.updateProjectionMatrix()}
 }
 cam.updateMatrixWorld();
 for(const f of frameFns)f(G,t,dt,info);
 if(sc.postRender)sc.postRender(sc.scene,cam,t,dt,info);else sc.R.render(sc.scene,cam);
 /* düşük başarımda otomatik kalite düşürme (yalnızca 'Otomatik' modda) */
 if(play&&dt>0&&sc.qMode==='auto'){
  sc.fpsAcc+=dt;sc.fpsN++;
  if(sc.fpsAcc>=3){
   const avg=sc.fpsAcc/sc.fpsN;sc.fpsAcc=0;sc.fpsN=0;
   if(avg>.036&&sc.quality>0)S.setQuality(sc.quality-1);
  }
 }
};
})();
