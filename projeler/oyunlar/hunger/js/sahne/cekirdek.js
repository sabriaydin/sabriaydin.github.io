/* Hunger 3D - sahne: çekirdek: three.js oluşturucu, kamera, kayıt sistemi, her kare çizim */
(()=>{
'use strict';
const {W,H,EYE,look,clamp}=HG;
const S=HG.Scene,sc=HG.sc;
THREE.ColorManagement.legacyMode=false;
sc.mode='menu';sc.quality=3;sc.fpsAcc=0;sc.fpsN=0;sc.fov=75;
sc.mats=[];
sc.mat=extra=>{
 const o=Object.assign({},extra||{}),pbr=o.pbr,leaf=o.leaf,ore=o.ore,nocut=o.nocut;delete o.pbr;delete o.leaf;delete o.ore;delete o.nocut;                 /* pbr: yüzey ayrıntı dokuları (gerceklik.js) uygulanır */
 const m=new THREE.MeshStandardMaterial(Object.assign({vertexColors:true,flatShading:false,roughness:.92,metalness:0},o));
 if(pbr||leaf)m.userData.pbr=1;
 if(ore){m.userData.pbr=1;m.userData.ore=1}                 /* maden: kaya dokusu ve parlak cevher yüzleri */
 if(nocut)m.userData.nocut=1;                                  /* kesiksiz yaprak: ince yaprakçıklar (palmiye) delinmez, renk/ayrıntı korunur */
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
 /* Ekran kartı çizim bağlamını düşürürse three.js kendi kendine toparlar; oyuncu ne olduğunu bilsin */
 canvas.addEventListener('webglcontextlost',()=>{try{HG.log&&HG.log('hata','Ekran kartı çizim bağlantısı koptu; geri gelmesi bekleniyor.','hata')}catch(e){}try{HG.toast&&HG.toast('Görüntü sürücüsü kesildi; geri gelmesi bekleniyor.')}catch(e){}},false);
 canvas.addEventListener('webglcontextrestored',()=>{try{S.resize();HG.toast&&HG.toast('Görüntü geri geldi.')}catch(e){}},false);
 sc.cam=new THREE.PerspectiveCamera(75,1,.05,400);sc.cam.rotation.order='YXZ';
 sc.scene.add(sc.cam);                       /* kol modeli kameraya bağlı olduğundan sahnede olmalı */
 initFns.forEach(f=>f());
 sc.qMode=(HG.cfg&&String(HG.cfg.q))||'auto';
 R.toneMappingExposure=C().bright/100;
 S.setQuality(S.tierOf());
 S.resize();
};
/* Kalite kademeleri: 3 Yüksek, 2 Orta, 1 Düşük, 0 En düşük */
const C=()=>HG.cfg||{res:100,shadow:true,grass:100,fov:75,sens:100,shake:100,invY:false,bright:100};
const QS={3:{pr:2,sh:2048,grass:1},2:{pr:1.5,sh:1024,grass:.5},1:{pr:1,sh:0,grass:.25},0:{pr:.75,sh:0,grass:0}};
/* Kalite kipinden gerçek kademe: 'auto' en yüksekten başlar, 'ozel' kullanıcının son kademesini (cfg.qt) kullanır */
S.tierOf=()=>{const m=String(sc.qMode);if(m==='auto')return 3;if(m==='ozel')return clamp((HG.cfg&&+HG.cfg.qt)||3,0,3);return clamp(+m||0,0,3)};
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
const QN={auto:'Otomatik',3:'Yüksek',2:'Orta',1:'Düşük',0:'En düşük',ozel:'Özel'};
S.qualityLabel=()=>QN[sc.qMode];
S.applyCfg=key=>{
 const o=QS[sc.quality];
 if(key==='res'){sc.R.setPixelRatio(Math.min(window.devicePixelRatio||1,o.pr)*C().res/100);S.resize()}
 else if(key==='grass'){sc.grassFrac=o.grass*C().grass/100;qualityFns.forEach(f=>f(sc.quality,o))}
};
S.cycleQuality=()=>{
 const order=['auto','3','2','1'];sc.qMode=order[(order.indexOf(String(sc.qMode))+1)%order.length];
 try{localStorage.setItem('hunger-kalite',sc.qMode)}catch(e){}
 S.setQuality(S.tierOf());sc.fpsAcc=0;sc.fpsN=0;if(HG.cfg){HG.cfg.q=String(sc.qMode);const e=document.getElementById('s_q');if(e)e.value=HG.cfg.q}return S.qualityLabel();
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
/* Pencere boyutu sıfır okunursa çizim yüzeyi de sıfırlanıyor ve ekran boş kalıyordu: en az 1 piksel */
S.resize=()=>{const w=Math.max(1,innerWidth||1),h=Math.max(1,innerHeight||1);sc.R.setSize(w,h,false);sc.cam.aspect=w/h;sc.cam.updateProjectionMatrix()};
/* Fare/dokunma ile bakış: dx sağa (yaw azalır), dy aşağı (pitch azalır) */
S.look=(dx,dy)=>{const c=C(),k=c.sens/100*(1-(sc.zoomK||0)*.65);look.yaw-=dx*k;look.pitch=clamp(look.pitch-dy*k*(c.invY?-1:1),-1.5,1.5)};

const tgt=new THREE.Vector3(),orbit=new THREE.Vector3();
/* ---- Ekranın boş (mavi) kalmasına yol açan iki durum buradan engellenir ----
   1) Oyuncunun konumu ya da bakış açısı geçersiz bir sayıya dönüşürse kamera da geçersiz olur ve
      sahnede hiçbir şey çizilemez; son geçerli konum saklanır ve bozulma anında geri yüklenir.
   2) Bir sahne parçası kare içinde hata verirse çizim hiç yapılmadan dönülüyordu; her parça ayrı
      korunur, hata bir kez bildirilir ve çizim sürer. */
const fin=v=>typeof v==='number'&&isFinite(v);
function sanePos(G){
 if(!fin(look.yaw))look.yaw=0;
 if(!fin(look.pitch))look.pitch=0;
 const p=sc.okPos||(sc.okPos={x:W/2,y:H/2,z:undefined});
 if(fin(G.px)&&fin(G.py)&&(G.pz===undefined||fin(G.pz))){p.x=G.px;p.y=G.py;p.z=G.pz;return}
 G.px=p.x;G.py=p.y;G.pz=p.z;G.vz=0;G.pvx=0;G.pvy=0;G.air=false;
 if(sc.posWarn)return;
 sc.posWarn=1;
 try{HG.log&&HG.log('hata','Oyuncu konumu geçersiz bir sayıya dönüştü; son geçerli yere alındı.','hata')}catch(e){}
 try{HG.toast&&HG.toast('Konumun bozuldu; son geçerli yere alındın.')}catch(e){}
}
const fErr=[];
function frameErr(i,e){
 if(fErr[i])return;fErr[i]=1;
 try{HG.log&&HG.log('hata','Sahnenin bir parçası durdu ('+i+'): '+(e&&e.message||e),'hata');console.error(e)}catch(x){}
 try{HG.toast&&HG.toast('Görüntünün bir parçası durdu; oyun sürüyor. Ayrıntı: F1.')}catch(x){}
}
S.render=(G,now,dt,info)=>{
 const t=now*.001,play=info.mode==='play',cam=sc.cam;
 if(play){
  sanePos(G);
  const el=sc.R.domElement;
  if(!el.width||!el.height)S.resize();                /* çizim yüzeyi sıfıra düşmüşse geri kurulur */
 }
 /* kamera */
 /* ölüm kamerası yalnızca ölüm ekranında geçerlidir: oyun yeniden başlatıldığında kalırsa
    görüntü eski ölüm yerine çakılı kalır */
 if(HG.deathCam&&HG.ui&&HG.ui.state!=='dead')HG.deathCam=null;
 const dc=HG.deathCam;
 if(play&&dc){
  /* ölüm kamerası: oyuncu yeniden doğmuş olsa da görüntü ölüm yerinde kalır; kamera yavaşça
     yere iner ve yana devrilir. */
  dc.t=Math.min(1,dc.t+dt*1.1);
  const e=1-Math.pow(1-dc.t,3),gy=S.groundY(dc.px,dc.pz);
  cam.position.set(dc.px,dc.py+(gy+.34-dc.py)*e,dc.pz);
  cam.rotation.set(dc.rx+(-.24-dc.rx)*e,dc.ry,1.02*e);
  if(Math.abs(cam.fov-62)>.05){cam.fov=62;sc.fov=62;cam.updateProjectionMatrix()}
 }else if(play){
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
  cam.position.set(G.px+Math.cos(look.yaw)*sway,gy+(HG.eyeH===undefined?EYE:HG.eyeH)+bob+cd.dip*.14+br,G.py-Math.sin(look.yaw)*sway);
  cam.rotation.set(look.pitch+cd.pch-(gnd?Math.abs(Math.sin(G.walk*10))*.004*spk:0)-cd.dip*.1,look.yaw,cd.roll+(gnd?Math.sin(G.walk*5)*.0035*spk:0));
  if(sc.shake>.002){const s=sc.shake*C().shake/100;cam.rotation.x+=(Math.random()-.5)*s*.05;cam.rotation.y+=(Math.random()-.5)*s*.05;cam.rotation.z+=(Math.random()-.5)*s*.04;sc.shake*=Math.exp(-dt*6)}
  const tf=(C().fov+(G.sprint?8:0)+(HG.fovAdd||0)-(HG.bow?HG.bow.draw*24:0))*(1-(sc.zoomK||0)*.72);   /* HG.fovAdd: çömelme ve serbest düşüş (js/oyun/fizik.js) */sc.fov+=(tf-sc.fov)*(1-Math.exp(-6*dt));
  if(Math.abs(cam.fov-sc.fov)>.05){cam.fov=sc.fov;cam.updateProjectionMatrix()}
 }else{
  /* ana menü: sinematik uçuş. Yarıçap, yükseklik ve bakış noktası yavaşça değişir; hafif el kamerası sallanması ve görüş alanı nefesi eklenir */
  const mc=info.clock,ay=mc*.045,r=56+16*Math.sin(mc*.071)+6*Math.sin(mc*.17),hh=27+10*Math.sin(mc*.053+1.2)+4*Math.sin(mc*.131);
  orbit.set(W/2+Math.sin(ay)*r,hh,H/2+Math.cos(ay)*r);
  cam.position.lerp(orbit,sc.camInit?1-Math.exp(-3*dt):1);sc.camInit=true;
  tgt.set(W/2+Math.sin(mc*.037)*16,1.5+Math.sin(mc*.061)*2,H/2+Math.cos(mc*.029)*16);cam.lookAt(tgt);
  cam.rotation.z+=Math.sin(mc*.45)*.012+Math.sin(mc*1.3)*.003;cam.rotation.x+=Math.sin(mc*.9+2)*.0035;
  const mf=60+5*Math.sin(mc*.11);
  if(Math.abs(cam.fov-mf)>.02){cam.fov=mf;cam.updateProjectionMatrix()}
 }
 cam.updateMatrixWorld();
 for(let i=0;i<frameFns.length;i++){try{frameFns[i](G,t,dt,info)}catch(e){frameErr(i,e)}}
 if(sc.postRender)sc.postRender(sc.scene,cam,t,dt,info);else sc.R.render(sc.scene,cam);
 /* düşük başarımda otomatik kalite düşürme (yalnızca 'Otomatik' modda) */
 if(play&&dt>0&&sc.qMode==='auto'){
  sc.fpsAcc+=dt;sc.fpsN++;
  if(sc.fpsAcc>=3){
   const avg=sc.fpsAcc/sc.fpsN;sc.fpsAcc=0;sc.fpsN=0;
   if(avg>.036&&sc.quality>0){
    S.setQuality(sc.quality-1);
    /* kademe inince ayarlardaki grafik seçenekleri de o kademenin ön ayarına çekilir */
    if(HG.settings&&HG.settings.autoTier)HG.settings.autoTier(sc.quality);
   }
  }
 }
};
})();
