/* Hunger 3D - sahne: co-op'taki diğer oyuncunun 3B görünümü (güncelleme 68: yeniden modellendi).
   Eklemli gövde (omuz-dirsek-bilek, kalça-diz-ayak bileği, bel, boyun), yüzlü baş ve saç, deri/kumaş/deri-kayış dokulu malzemeler,
   elde tutulan eşya, yürüme-koşma-zıplama-yüzme-yay germe-saldırı-uyku hareketleri, adım sesleri, ad etiketi ve can çubuğu. */
(()=>{
'use strict';
const S=HG.Scene,sc=HG.sc;
if(!sc.vmMat||!sc.g)return;
const {part,merge,cyl,cone,box,rbox,blob}=sc.g;
const PI=Math.PI;
/* Oyuncu görünümleri: kimlikten seçilir (gömlek, pantolon, sırt çantası, ten, saç) */
const COL=[
 {tun:0x2f6fb0,leg:0x2a3140,pack:0x6b4a29,skin:0xe0b48a,hair:0x3a2a1c,css:'#7fb4ee',st:0},
 {tun:0xb0452f,leg:0x40302a,pack:0x4a5a3a,skin:0xc99468,hair:0x1c1612,css:'#f08a74',st:1},
 {tun:0x3f8f4a,leg:0x2a3a2a,pack:0x7a5a30,skin:0xf0c8a0,hair:0xb08a4a,css:'#8fd89a',st:2},
 {tun:0x8f4fb0,leg:0x35283f,pack:0x3a4a6a,skin:0xa8744e,hair:0x2a1a12,css:'#c79af0',st:3}
];
let M=null;
const mats=()=>M||(M={
 skin:sc.vmMat({t:'pSkin',s:7,a:.0005,c:.2,r:.6,sss:1}),
 cloth:sc.vmMat({t:'pCloth',s:6,a:.0018,c:.5,r:.96,sss:.1}),
 leather:sc.vmMat({t:'pCloth',s:9,a:.003,c:.35,r:.8}),
 hair:sc.vmMat({r:.9}),face:sc.vmMat({r:.45})
});
const GEO={};
function limbs(v){
 const C=COL[v],P=(g,c,x,y,z,sx,sy,sz,rx,ry,rz,j)=>part(g,c,x,y,z,sx,sy,sz,rx,ry,rz,j);
 const G={},mg=(l,o)=>merge(l,o||{jit:.03});
 const dk=(c,f)=>{const k=new THREE.Color(c);return k.multiplyScalar(f).getHex()};
 /* gövde: pelvis, karın, göğüs, omuz başları, yaka, kemer, sırt çantası (hepsi bel eklemine göre, y=0 kalça) */
 const o=-.92;
 G.torso=mg([
  P(rbox(.36,.2,.22,.4,3),C.leg,0,.96+o,0),
  P(rbox(.38,.16,.22,.4,3),C.tun,0,1.09+o,0),
  P(rbox(.42,.2,.235,.35,3),C.tun,0,1.22+o,0),
  P(rbox(.47,.2,.25,.35,3),C.tun,0,1.37+o,0),
  P(blob(.082,2,.01,11,1,1,1),C.tun,.235,1.4+o,0),P(blob(.082,2,.01,12,1,1,1),C.tun,-.235,1.4+o,0),
  P(rbox(.2,.05,.19,.4,2),dk(C.tun,.7),0,1.485+o,.02),
  P(rbox(.05,.3,.02,.3,2),dk(C.tun,.78),0,1.25+o,.125),
 ],{ao:.82,jit:.04});
 G.gear=mg([
  P(rbox(.39,.05,.245,.4,2),0x3a2a1c,0,1.02+o,0),P(box(.07,.06,.02),0xc9a23a,0,1.02+o,.128),
  P(rbox(.1,.11,.065,.4,2),0x5a3f22,.2,.97+o,.07),P(box(.105,.03,.07),0x3a2a1c,.2,1.02+o,.07),
  P(rbox(.34,.42,.15,.3,2),C.pack,0,1.28+o,-.2),P(rbox(.3,.13,.17,.3,2),dk(C.pack,.8),0,1.45+o,-.205),
  P(rbox(.12,.14,.04,.3,2),dk(C.pack,.7),0,1.25+o,-.285),
  P(cyl(.06,.06,.4,8),0xcbbd96,0,1.55+o,-.2,1,1,1,0,0,PI/2),
  P(box(.045,.36,.02),0x3a2a1c,.13,1.3+o,.126),P(box(.045,.36,.02),0x3a2a1c,-.13,1.3+o,.126),
  P(box(.045,.2,.05),0x3a2a1c,.13,1.4+o,-.08,1,1,1,-.5),P(box(.045,.2,.05),0x3a2a1c,-.13,1.4+o,-.08,1,1,1,-.5)
 ],{ao:.85,jit:.05});
 /* baş (boyun eklemine göre): ten, yüz ayrıntıları, saç */
 G.neck=mg([P(cyl(.05,.058,.12,8),C.skin,0,.04,0)],{jit:.02});
 G.head=mg([
  P(blob(.118,2,.012,21,.93,1.1,1.02),C.skin,0,.15,0),
  P(blob(.09,2,.01,22,1,.8,1.05),dk(C.skin,1.02),0,.085,.025),
  P(blob(.022,1,0,23,.8,1,1.1),dk(C.skin,.93),0,.125,.118),
  P(blob(.026,1,0,24,.55,1,.9),dk(C.skin,.95),.115,.15,0),P(blob(.026,1,0,25,.55,1,.9),dk(C.skin,.95),-.115,.15,0),
  P(box(.052,.012,.01),0xb86a5c,0,.072,.108)
 ],{jit:.02});
 G.eyes=mg([
  P(blob(.019,1,0,31,1.2,.85,.6),0xf2eee6,.042,.168,.098,1,1,1),P(blob(.019,1,0,32,1.2,.85,.6),0xf2eee6,-.042,.168,.098),
  P(blob(.0105,1,0,33,1,1,.6),0x2a1a10,.042,.168,.108),P(blob(.0105,1,0,34,1,1,.6),0x2a1a10,-.042,.168,.108),
  P(box(.05,.011,.012),dk(C.hair,.8),.043,.2,.103,1,1,1,0,0,-.12),P(box(.05,.011,.012),dk(C.hair,.8),-.043,.2,.103,1,1,1,0,0,.12)
 ],{jit:0});
 const hp=[P(blob(.126,2,.02,41,.96,.86,1.05),C.hair,0,.2,-.008),P(blob(.115,2,.02,42,.95,.9,.9),C.hair,0,.15,-.045)];
 if(C.st===0)hp.push(P(box(.2,.05,.05),C.hair,0,.255,.09,1,1,1,-.25));
 if(C.st===1)hp.push(P(blob(.1,2,.02,43,.9,1.5,.8),C.hair,0,.04,-.085),P(cyl(.02,.03,.1,6),0x3a2a1c,0,.1,-.15,1,1,1,.7),P(blob(.04,1,.01,44,.8,1.9,.8),C.hair,0,.03,-.19));
 if(C.st===2)hp.push(P(box(.23,.06,.06),C.hair,.02,.25,.085,1,1,1,-.3,0,-.18),P(blob(.04,1,.01,45,1,1.4,.8),C.hair,.115,.14,.0),P(blob(.04,1,.01,46,1,1.4,.8),C.hair,-.115,.14,.0));
 if(C.st===3)hp.push(P(blob(.06,2,.01,47,1,1,1),C.hair,0,.3,-.06),P(box(.2,.045,.05),C.hair,0,.255,.09,1,1,1,-.2));
 G.hair=mg(hp,{jit:.05});
 /* kollar: omuz eklemine göre üst kol (kumaş), dirsek eklemine göre ön kol (ten + kıvrık kol ağzı) ve el */
 G.upper=mg([P(cyl(.056,.047,.31,9),C.tun,0,-.145,0),P(blob(.058,2,.01,51,1,1,1),C.tun,0,-.01,0),P(cyl(.05,.05,.025,9),dk(C.tun,.8),0,-.29,0)],{ao:.9,jit:.03});
 G.fore=mg([P(cyl(.047,.036,.26,9),C.skin,0,-.14,0),P(blob(.043,2,.005,52,1,1.2,1),C.skin,0,-.06,.004)],{jit:.02});
 G.cuff=mg([P(cyl(.052,.05,.06,9),dk(C.tun,.8),0,-.03,0)],{jit:.02});
 G.hand=mg([
  P(rbox(.08,.085,.036,.4,2),C.skin,0,-.04,0),
  P(box(.075,.045,.032),C.skin,0,-.1,.006,1,1,1,-.25),
  P(blob(.019,1,0,53,1,1.7,1),C.skin,.05,-.055,.012,1,1,1,-.2,0,-.5)
 ],{jit:.01});
 /* bacaklar: kalça eklemine göre uyluk, diz eklemine göre baldır ve bot */
 G.thigh=mg([P(cyl(.092,.072,.46,9),C.leg,0,-.225,0),P(blob(.09,2,.01,61,1,.8,1),C.leg,0,-.01,0)],{ao:.9,jit:.03});
 G.shin=mg([P(cyl(.07,.053,.4,9),C.leg,0,-.2,0),P(blob(.07,2,.01,62,1,.8,1),C.leg,0,-.005,.01)],{ao:.9,jit:.03});
 G.boot=mg([
  P(cyl(.064,.07,.15,9),0x3a2a1c,0,-.335,0),P(cyl(.072,.072,.03,9),0x2a1e14,0,-.265,0),
  P(rbox(.105,.1,.25,.4,3),0x3a2a1c,0,-.395,.05),P(box(.108,.03,.26),0x1c1510,0,-.435,.05)
 ],{jit:.03});
 return G;
}
const hash=s=>{let h=7;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)};
const objs=new Map();
function tag(name,css,hp){
 const c=document.createElement('canvas');c.width=256;c.height=64;
 const g=c.getContext('2d');
 g.font='600 30px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';
 const ny=hp<100?24:34;
 g.lineWidth=7;g.strokeStyle='rgba(0,0,0,.8)';g.strokeText(name,128,ny);
 g.fillStyle=css;g.fillText(name,128,ny);
 if(hp<100){
  const w=150,x=53,y=48,p=Math.max(0,Math.min(1,hp/100));
  g.fillStyle='rgba(0,0,0,.75)';g.fillRect(x-2,y-2,w+4,12);
  g.fillStyle=p>.5?'#6ec26e':p>.25?'#e0b03c':'#d9463c';g.fillRect(x,y,w*p,8);
 }
 const tex=new THREE.CanvasTexture(c);
 const m=new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false});
 const sp=new THREE.Sprite(m);sp.scale.set(1.5,.375,1);sp.renderOrder=999;
 return sp;
}
function setTag(o,name,hp){
 if(o.tag){sc.scene.remove(o.tag);o.g.remove(o.tag);o.tag.material.map.dispose();o.tag.material.dispose()}
 o.tag=tag(name,o.css,hp);o.g.add(o.tag);o.tag.position.set(0,2.08,0);o.name=name;o.thp=hp;
}
function mk(rec){
 const v=hash(rec.peerId||rec.id)%COL.length,m=mats();
 const G=GEO[v]||(GEO[v]=limbs(v));
 const g=new THREE.Group(),o={g,v,css:COL[v].css};
 const me=(geo,mat,par,x,y,z)=>{const k=new THREE.Mesh(geo,mat);k.position.set(x||0,y||0,z||0);k.castShadow=true;k.receiveShadow=true;par.add(k);return k};
 const gr=(par,x,y,z)=>{const k=new THREE.Group();k.position.set(x,y,z);par.add(k);return k};
 o.body=gr(g,0,0,0);
 o.hip=gr(o.body,0,.92,0);                       /* bel eklemi: gövde öne/yana eğilir */
 o.torso=gr(o.hip,0,0,0);
 me(G.torso,m.cloth,o.torso);me(G.gear,m.leather,o.torso);
 o.neck=gr(o.torso,0,.58,0);me(G.neck,m.skin,o.neck);
 o.head=gr(o.neck,0,.0,0);me(G.head,m.skin,o.head);o.eyes=me(G.eyes,m.face,o.head);me(G.hair,m.hair,o.head);
 const arm=(sx)=>{
  const sh=gr(o.torso,sx*.255,.5,0),up=me(G.upper,m.cloth,sh),el=gr(sh,0,-.3,0);
  me(G.fore,m.skin,el);me(G.cuff,m.cloth,el);
  const hd=gr(el,0,-.26,0);me(G.hand,m.skin,hd);
  const grip=gr(hd,0,-.075,.025);
  return {sh,el,hd,grip};
 };
 const A=arm(-1),B=arm(1);
 o.shL=A.sh;o.elL=A.el;o.hdL=A.hd;o.gripL=A.grip;o.shR=B.sh;o.elR=B.el;o.hdR=B.hd;o.gripR=B.grip;
 const leg=(sx)=>{
  const th=gr(o.body,sx*.1,.92,0);me(G.thigh,m.cloth,th);
  const kn=gr(th,0,-.46,0);me(G.shin,m.cloth,kn);me(G.boot,m.leather,kn);
  return {th,kn};
 };
 const LL=leg(-1),LR=leg(1);
 o.thL=LL.th;o.knL=LL.kn;o.thR=LR.th;o.knR=LR.kn;
 sc.scene.add(g);
 o.ph=0;o.sp=0;o.ry=0;o.held=null;o.heldId=null;o.air=0;o.blink=2+Math.random()*3;o.seed=Math.random()*10;
 o.look=0;o.step=0;
 setTag(o,rec.name,100);
 return o;
}
/* elde tutulan eşya: eşya modeli klonlanır ve sağ ele (yay sol ele) bağlanır */
function setHeld(o,id){
 if(o.held){o.held.parent&&o.held.parent.remove(o.held);o.held=null}
 o.heldId=id;o.pop=0;
 if(!id)return;
 let src=null;try{src=HG.IT&&HG.IT[id]&&sc.itemModel?sc.itemModel(id):null}catch(e){src=null}
 if(!src)return;
 const m=src.clone(true),bow=HG.IT[id].tool==='bow';
 const box3=new THREE.Box3().setFromObject(m),len=Math.max(.05,box3.max.y-box3.min.y);
 const k=len>.95?.95/len:1;                                    /* çok uzun modeller (olta, kürek) kısaltılır */
 m.scale.setScalar(k);m.userData.k=k;
 (bow?o.gripL:o.gripR).add(m);
 m.rotation.set(bow?0:1.1,bow?PI/2:0,0);
 o.held=m;o.hbow=bow;
}
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
S.onFrame((G,t,dt,info)=>{
 const alive=new Set(HG.remote);
 for(const [r,o] of objs)if(!alive.has(r)){sc.scene.remove(o.g);o.tag&&o.tag.material.map.dispose();objs.delete(r)}
 if(info.mode!=='play'){for(const o of objs.values())o.g.visible=false;return}
 const FL=HG.net&&HG.net.FL;if(!FL)return;
 const cam=sc.cam.position,k=1-Math.exp(-dt*12);
 for(const r of HG.remote){
  if(!r.init){continue}
  let o=objs.get(r);
  if(!o){o=mk(r);objs.set(r,o)}
  const hpq=Math.max(0,Math.min(100,Math.round((r.hp==null?100:r.hp)/5)*5));
  if(o.name!==r.name||o.thp!==hpq)setTag(o,r.name,hpq);
  /* konum yumuşatma */
  if(r.rx===undefined){r.rx=r.x;r.rz=r.z}
  const dx=r.x-r.rx,dz=r.z-r.rz;
  if(dx*dx+dz*dz>64){r.rx=r.x;r.rz=r.z}else{r.rx+=dx*k;r.rz+=dz*k}
  let dy=r.yaw-(r.ryw===undefined?r.yaw:r.ryw);while(dy>Math.PI)dy-=6.2832;while(dy<-Math.PI)dy+=6.2832;
  r.ryw=(r.ryw===undefined?r.yaw:r.ryw)+dy*k;
  r.rpt=(r.rpt===undefined?r.pitch:r.rpt)+((r.pitch||0)-(r.rpt===undefined?r.pitch:r.rpt))*k;
  const d2=(r.rx-cam.x)**2+(r.rz-cam.z)**2;
  if(d2>140*140){o.g.visible=false;continue}
  const fl=r.fl|0,sleeping=!!(fl&FL.SL),dead=!!(fl&FL.DD),swim=!!(fl&FL.SW),raft=!!(fl&FL.RF),sprint=!!(fl&FL.SP),crouch=!!(fl&(FL.CR||2048));
  const gy=S.groundY(r.rx,r.rz);
  let y=r.y==null||swim?gy:r.y;
  if(swim)y=Math.max(gy,sc.WY-.9);
  const air=!swim&&!raft&&!sleeping&&!dead&&(y-gy)>.45;
  o.air+=((air?1:0)-o.air)*Math.min(1,10*dt);
  if(o.heldId!==(r.h||'')){setHeld(o,r.h||'')}
  if(o.held&&o.pop<1){o.pop=Math.min(1,o.pop+dt*6);const s=o.pop*(2-o.pop);o.held.scale.setScalar(Math.max(.01,s)*(o.held.userData.k||1))}
  o.g.visible=true;
  o.g.position.set(r.rx,y,r.rz);
  o.g.rotation.order='YXZ';o.g.rotation.y=r.ryw+Math.PI;o.g.rotation.x=0;
  /* yürüme evresi: hız yumuşatılır, adım uzunluğu hızla orantılıdır */
  const mv=r.mv?(r.spd||0):0;
  o.sp+=(mv-o.sp)*Math.min(1,8*dt);
  o.ph+=o.sp*dt*3.4;
  const run=clamp(o.sp/4.2,0,1.3);
  const amp=clamp(o.sp/1.4,0,1)*(.42+.38*Math.min(1,o.sp/4));
  const s1=Math.sin(o.ph),c1=Math.cos(o.ph);
  const idle=amp<.05;
  const br=Math.sin(t*1.7+o.seed);
  /* göz kırpma */
  o.blink-=dt;if(o.blink<-.12)o.blink=2.5+Math.random()*4;
  o.eyes.scale.y=o.blink<0?.12:1;
  /* sıfırlama */
  o.body.position.set(0,0,0);o.hip.rotation.set(0,0,0);o.torso.rotation.set(0,0,0);o.torso.scale.set(1,1,1);
  const pit=clamp(r.rpt||0,-1.3,1.3);
  o.neck.rotation.set(0,0,0);o.head.rotation.set(clamp(-pit*.7,-.8,.7),0,0);
  o.shL.rotation.set(0,0,0);o.shR.rotation.set(0,0,0);o.elL.rotation.set(0,0,0);o.elR.rotation.set(0,0,0);
  o.hdL.rotation.set(0,0,0);o.hdR.rotation.set(0,0,0);
  o.thL.rotation.set(0,0,0);o.thR.rotation.set(0,0,0);o.knL.rotation.set(0,0,0);o.knR.rotation.set(0,0,0);
  if(dead||sleeping){
   o.g.rotation.x=-Math.PI/2;o.g.position.y=y+.3+(sleeping?br*.008:0);
   if(sleeping){
    o.shL.rotation.set(-.15,0,.18);o.shR.rotation.set(-.35,0,-.1);o.elL.rotation.x=-.5;o.elR.rotation.x=-1.5;
    o.thL.rotation.set(0,0,.05);o.thR.rotation.set(0,0,-.05);o.head.rotation.set(0,.25,0);
    o.torso.scale.y=1+br*.015;o.eyes.scale.y=.1;
   }else{
    o.shL.rotation.set(0,0,.5);o.shR.rotation.set(0,0,-.5);o.thL.rotation.set(0,0,.14);o.thR.rotation.set(0,0,-.14);o.head.rotation.set(0,.3,.1);o.eyes.scale.y=.1;
   }
  }else if(swim){
   o.g.rotation.x=1.25;
   const sw=t*3.2;
   o.hip.rotation.x=-.12;o.torso.rotation.z=Math.sin(sw)*.12;
   o.shL.rotation.set(Math.sin(sw)*1.3-2.5,0,.15);o.shR.rotation.set(-Math.sin(sw)*1.3-2.5,0,-.15);
   o.elL.rotation.x=-.3-Math.max(0,-Math.cos(sw))*.7;o.elR.rotation.x=-.3-Math.max(0,Math.cos(sw))*.7;
   o.thL.rotation.x=Math.sin(t*7)*.35;o.thR.rotation.x=-Math.sin(t*7)*.35;o.knL.rotation.x=.25+Math.max(0,Math.sin(t*7))*.3;o.knR.rotation.x=.25+Math.max(0,-Math.sin(t*7))*.3;
   o.head.rotation.x=-.95+Math.sin(sw*.5)*.06;
  }else{
   /* gövde duruşu: hızda öne eğilme, boşta nefes ve ağırlık aktarımı */
   const lean=amp*(sprint?.34:.14)+o.air*.1;
   o.hip.rotation.x=lean;o.torso.rotation.x=lean*.45;
   o.torso.rotation.y=s1*amp*.2;o.hip.rotation.y=-s1*amp*.1;
   o.body.position.y=-Math.abs(c1)*amp*.045+(raft?0:0)-o.air*.05;
   if(idle){
    o.torso.scale.y=1+br*.012;o.torso.scale.x=1-br*.006;
    o.hip.rotation.z=Math.sin(t*.6+o.seed)*.02;
    o.head.rotation.y=Math.sin(t*.45+o.seed)*.18*(1-Math.abs(pit));
    o.shL.rotation.z=.05+br*.01;o.shR.rotation.z=-.05-br*.01;
    o.elL.rotation.x=-.12;o.elR.rotation.x=-.12;
   }else{
    o.head.rotation.y=-s1*amp*.08;
    /* bacaklar: uyluk sallanır, diz yalnız ileri savrulurken bükülür; kollar bacakların tersine, dirsek hafif bükülü */
    o.thL.rotation.x=s1*amp;o.thR.rotation.x=-s1*amp;
    o.knL.rotation.x=Math.max(0,c1)*amp*1.5+.05;o.knR.rotation.x=Math.max(0,-c1)*amp*1.5+.05;
    o.shL.rotation.x=-s1*amp*.95;o.shR.rotation.x=s1*amp*.95;
    o.shL.rotation.z=.06;o.shR.rotation.z=-.06;
    o.elL.rotation.x=-.18-Math.max(0,s1)*amp*.9-(sprint?.5:0);o.elR.rotation.x=-.18-Math.max(0,-s1)*amp*.9-(sprint?.5:0);
   }
   if(o.air>.05){
    const a=o.air;
    o.thL.rotation.x=lerp(o.thL.rotation.x,-.55,a);o.thR.rotation.x=lerp(o.thR.rotation.x,.25,a);
    o.knL.rotation.x=lerp(o.knL.rotation.x,.95,a);o.knR.rotation.x=lerp(o.knR.rotation.x,.35,a);
    o.shL.rotation.x=lerp(o.shL.rotation.x,-.5,a);o.shR.rotation.x=lerp(o.shR.rotation.x,-.5,a);
    o.shL.rotation.z=lerp(o.shL.rotation.z,.7,a);o.shR.rotation.z=lerp(o.shR.rotation.z,-.7,a);
   }
   if(crouch){
    /* çömelme: kalça ve dizler bükülür, gövde alçalır ve hafifçe öne eğilir */
    const c=o.crk=(o.crk===undefined?0:o.crk)+((1)-(o.crk===undefined?0:o.crk))*Math.min(1,10*dt);
    o.body.position.y-=.42*c;
    o.hip.rotation.x=lerp(o.hip.rotation.x,.42,c);o.torso.rotation.x=lerp(o.torso.rotation.x,.2,c);
    o.thL.rotation.x=lerp(o.thL.rotation.x,-.95+Math.sin(o.ph)*amp*.5,c);o.thR.rotation.x=lerp(o.thR.rotation.x,-.95-Math.sin(o.ph)*amp*.5,c);
    o.knL.rotation.x=lerp(o.knL.rotation.x,1.5,c);o.knR.rotation.x=lerp(o.knR.rotation.x,1.5,c);
    o.shL.rotation.z=lerp(o.shL.rotation.z,.16,c);o.shR.rotation.z=lerp(o.shR.rotation.z,-.16,c);
   }else if(o.crk)o.crk=Math.max(0,o.crk-dt*10);
   if(raft){o.thL.rotation.x=.05;o.thR.rotation.x=-.05;o.knL.rotation.x=o.knR.rotation.x=.05;o.body.position.y=Math.sin(t*1.4+o.seed)*.02}
   /* elde tutulan eşya ve eylemler */
   if(fl&FL.BW){
    /* yay: sol kol uzanır, sağ kol sicimi çeker; bakılan yüksekliğe göre yukarı/aşağı nişan */
    o.torso.rotation.y=.45;o.head.rotation.y=-.4;
    o.shL.rotation.set(-1.52-pit,0,.1);o.elL.rotation.x=-.05;
    o.shR.rotation.set(-1.45-pit,.55,-.1);o.elR.rotation.x=-2.0;
   }else if(fl&FL.AT){
    const u=Math.sin(t*13),w=Math.max(0,u);
    o.shR.rotation.set(-1.0-w*1.5,0,-.15);o.elR.rotation.x=-.5-w*.4;
    o.torso.rotation.x+=.1+w*.12;o.torso.rotation.y=-w*.28;o.hip.rotation.y=w*.1;
   }else if(o.held&&!o.hbow&&!air){
    /* eşya elde dururken sağ kol hafifçe öne alınır */
    o.shR.rotation.x=lerp(o.shR.rotation.x,-.42-pit*.2,.75);o.elR.rotation.x=Math.min(o.elR.rotation.x,-.55);
   }
  }
  /* adım sesi: ayak yere her yarım evrede basar */
  const st=Math.floor(o.ph/PI);
  if(st!==o.step){
   o.step=st;
   if(o.sp>1&&!swim&&!air&&!sleeping&&!dead&&d2<30*30)try{HG.snd(raft?'step_raft':'step',{x:r.rx,z:r.rz,y})}catch(e){}
  }
  /* ad etiketi: yakında net, uzakta silik */
  const dd=Math.sqrt(d2);
  o.tag.material.opacity=dd<8?1:Math.max(.25,1-(dd-8)/70);
  o.tag.visible=dd<110;
 }
});
function lerp(a,b,t){return a+(b-a)*t}
})();
