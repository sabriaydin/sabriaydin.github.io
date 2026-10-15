/* Hunger 3D - sahne: birinci kişi kolları ve elde tutulan eşya (kameraya bağlı) */
(()=>{
'use strict';
const {IT}=HG;
const S=HG.Scene,sc=HG.sc;
const {cyl,cone,ico,box}=sc.g;
let root,rArm,lArm,hand,heldId='__';
const pm=c=>{const m=new THREE.MeshStandardMaterial({color:c,flatShading:false,roughness:.7,metalness:(c===0x8d8d92||c===0xc8743a||c===0xc3c9d0)?.5:0});sc.mats.push(m);return m};
function bx(w,h,d,c,x,y,z,p){const m=new THREE.Mesh(box(w,h,d),pm(c));m.position.set(x,y,z);p.add(m);return m}
function mkArm(x){
 const g=new THREE.Group();g.position.set(x,-.42,-.12);root.add(g);
 bx(.15,.15,.46,0xa82e27,0,0,-.22,g);bx(.16,.16,.1,0x7d201b,0,0,-.04,g);bx(.12,.12,.14,0xe0b48a,0,0,-.5,g);
 return g;
}
const cache={};
/* Eşyanın elde görünen modeli: sap +Y ekseninde, uç yukarıda */
function heldModel(id){
 if(cache[id]!==undefined)return cache[id];
 const it=IT[id],g=new THREE.Group();
 const add=(geo,c,x,y,z,rx,ry,rz)=>{const m=new THREE.Mesh(geo,pm(c));m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,rz||0);g.add(m)};
 const tc=[0,0x8d8d92,0xc8743a,0xc3c9d0];
 if(it.tool==='axe'){add(cyl(.03,.035,.8,5),0x8a5a30,0,.25,0);add(box(.07,.2,.3),tc[it.tier],0,.6,.12)}
 else if(it.tool==='pick'){add(cyl(.03,.035,.8,5),0x8a5a30,0,.25,0);add(box(.07,.09,.62),tc[it.tier],0,.62,0);add(cone(.05,.14,4),tc[it.tier],0,.62,.36,Math.PI/2);add(cone(.05,.14,4),tc[it.tier],0,.62,-.36,-Math.PI/2)}
 else if(it.tool==='rod'){add(cyl(.015,.025,1.1,5),0x8a5a30,0,.4,.1,.5);add(cyl(.004,.004,.7,3),0xdddddd,0,.55,.6,.2)}
 else if(it.tool==='bow'){bowModel(g,add)}
 else if(it.tool==='torch'){torchModel(g,add)}
 else if(it.tool==='raft'){for(let i=0;i<4;i++)add(cyl(.045,.045,.5,7),i%2?0x8a5a30:0x6b4423,0,.18,(i-1.5)*.09,0,0,Math.PI/2);add(box(.04,.03,.4),0x4a3220,.12,.235,0);add(box(.04,.03,.4),0x4a3220,-.12,.235,0)}
 else if(it.heal){add(cyl(.07,.07,.16,10),0xe8e4da,0,.1,0,Math.PI/2);add(box(.17,.04,.075),0xd9463c,0,.1,0)}
 else if(id==='arrow'){add(cyl(.01,.01,.6,5),0xa87440,0,.3,0);add(cone(.025,.08,4),0xc3c9d0,0,.64,0);add(box(.002,.06,.1),0xd9463c,0,.04,0)}
 else if(it.place){const c={fire:0x8a5a30,bench:0xa47544,furn:0x77777f,wallw:0xa67848,walls:0x8c8c94,door:0x6b4a29}[id];add(box(.26,.26,.26),c,0,.16,0)}
 else{const c={rock:0x86848b,sardine:0x6f8ea8,bass:0x5e7a62,tuna:0x243e66,crab:0xc24a2a,ccrab:0xb8381a,coral:0xe86a8a,mask:0x7fd0e8,wood:0x7a4f29,stone:0x8d8d92,coal:0x1a1a1f,sand:0xdac68c,copper_ore:0xc8743a,iron_ore:0xb99a80,copper_ingot:0xd9854a,coin:0xd9985a,bag:0x4a6a8a,iron_ingot:0xbcc2c8,berries:0xc42d3a,coconut:0x5b3a1c,fish:0x6fa0c0,cfish:0xb07a35,bottle:0xbfe6f0,wbottle:0x5fb0e0}[id]||0xcccccc;add(ico(.12),c,0,.12,0)}
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
 rArm=mkArm(.4);lArm=mkArm(-.4);
 hand=new THREE.Group();hand.position.set(0,.02,-.52);hand.scale.setScalar(.8);rArm.add(hand);
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
  hand.position.set(-.1+dr*.0,.02,-.55+HG.bow.kick*.06);
  hand.rotation.x=0;hand.rotation.y=.35;hand.rotation.z=0;
  if(dr>.85){root.position.x+=Math.sin(t*40)*.002;root.position.y+=Math.cos(t*37)*.002}
 }else{hand.position.set(0,.02,-.52);hand.rotation.y=0}
}
/* Vurma animasyonu: kol geriye kalkar (hazırlık), hızla öne iner (vuruş), toparlanır. Elde eşya yoksa yumruk atılır. */
sc.swingT=-1;sc.swingDur=.36;
HG.armSwing=d=>{sc.swingT=0;sc.swingDur=d||.36};
const GATHER=/^(node|hit|dig)/;
function swingPose(dt,hasItem){
 if(sc.swingT<0)return null;
 sc.swingT+=dt;
 const u=sc.swingT/sc.swingDur;
 if(u>=1){sc.swingT=-1;return null}
 const ease=x=>x*x*(3-2*x);
 let a,h,z,y;
 if(u<.34){const k=ease(u/.34);a=.62*k;h=.6*k;z=.05*k;y=.12*k}                                  /* hazırlık: kol yukarı-geri */
 else if(u<.54){const k=(u-.34)/.2,e=k*k;a=.62-.98*e;h=.6-2.0*e;z=.05-.12*e;y=.12-.2*e}         /* vuruş: hızlı iniş */
 else{const k=ease((u-.54)/.46);a=-.36*(1-k);h=-1.4*(1-k);z=-.07*(1-k);y=-.08*(1-k)}           /* toparlanma */
 if(!hasItem){const st=u<.34?-.18*ease(u/.34):u<.54?-.18+.5*((u-.34)/.2):.32*(1-ease((u-.54)/.46));return {a:a*.45,h:0,z:st*-1.2,y:y*.5}}   /* yumruk: kol öne uzanır */
 return {a,h,z,y};
}
S.onFrame((G,t,dt,info)=>{
 const play=info.mode==='play';
 if(!play&&sc.torchLight)sc.torchLight.intensity=0;
 root.visible=play&&(!!info.held||sc.swingT>=0);if(!play)return;
 const id=info.held;
 if(id!==heldId){heldId=id;while(hand.children.length)hand.remove(hand.children[0]);if(id)hand.add(heldModel(id))}
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
 const spose=swingPose(dt,!!id);
 if(spose){rArm.rotation.x=.12+spose.a;rArm.rotation.y=-.05+spose.y}
 else if(info.act&&!GATHER.test(HG.A.key||'')){rArm.rotation.x=.25+Math.sin(t*15)*.6;rArm.rotation.y=-.1+Math.sin(t*15)*.12}
 else{rArm.rotation.x+=((id?.12:-.18)-rArm.rotation.x)*(1-Math.exp(-12*dt));rArm.rotation.y*=.85}
 hand.rotation.x=id?-.45:0;
 animateHeld(G,t,dt,id);
 if(spose){hand.rotation.x+=spose.h;rArm.position.z=-.12+spose.z}else rArm.position.z=-.12;
 lArm.rotation.x=-.18+(mv?-ph*.06:0);
});
})();
