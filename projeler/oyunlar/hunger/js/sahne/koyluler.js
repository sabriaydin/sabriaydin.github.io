/* Hunger 3D - sahne: köylü modelleri ve canlandırması (güncelleme 52: baştan yapıldı).
   Eklemli iskelet (bel, boyun, omuz-dirsek-bilek, kalça-diz-ayak bileği), yüz ayrıntıları (göz, kaş, burun,
   kulak, ağız, göz kırpma), saç ve sakal çeşitleri, mesleğe göre giysi, başlık ve elde taşınan araç.
   Malzemeler birinci kişi kollarıyla aynı üç yönlü dokuları kullanır (sc.vmMat: ten, kumaş, deri, saç).
   Hareketler: yürüme (diz bükülmeli), nefes alma, oyuncuya bakma, el sallama, mesleğe özgü iş döngüleri,
   ticaret sırasında konuşma hareketleri ve uyku duruşu.
   Dış bağlantılar korunur: sc.npcLook (meslek renkleri), sc.npcExtra (gezgin tüccar eklentisi), sc.npcMake. */
(()=>{
'use strict';
const S=HG.Scene,sc=HG.sc;
const {part,merge,cyl,cone,box,rbox,blob}=sc.g;
const PI=Math.PI,PI2=PI/2;
const objs=new Map(),GEO={};
let M=null;

const SKIN=[0xe0b48a,0xc99468,0xf0c8a0,0xa8744e];
const HAIR=[0x3a2a1c,0x6a4a2a,0x1c1612,0xb08a4a,0x8a8a8a,0x4a3020];
const LOOK={
 farmer:{tun:0x8a6a3a,leg:0x4a3a2a,hat:0xd9c070},
 hunter:{tun:0x3f5a35,leg:0x3a3226,hat:0x2f4a2a},
 fisher:{tun:0x3f6a8a,leg:0x33404a,hat:0xd9b030},
 smith:{tun:0x55555d,leg:0x2a2a30,hat:0x2a2a2a},
 healer:{tun:0xe8e4da,leg:0xb8b2a2,hat:0xe8e4da},
 woodcut:{tun:0xa83a2e,leg:0x3a3226,hat:0x6b4a29},
 miner:{tun:0x6a6a72,leg:0x3a3a42,hat:0xd9b030}
};
sc.npcLook=LOOK;
const mats=()=>M||(M=sc.vmMat?{
 skin:sc.vmMat({t:'pSkin',s:7,a:.0005,c:.2,r:.62,sss:1}),
 cloth:sc.vmMat({t:'pCloth',s:6,a:.0018,c:.5,r:.96,sss:.1}),
 leather:sc.vmMat({t:'pCloth',s:9,a:.003,c:.35,r:.8}),
 hair:sc.vmMat({r:.9}),face:sc.vmMat({r:.45})
}:{skin:sc.mat({roughness:.7}),cloth:sc.mat({roughness:.95}),leather:sc.mat({roughness:.8}),hair:sc.mat({roughness:.9}),face:sc.mat({roughness:.45})});

const dk=(c,f)=>{const k=new THREE.Color(c);return k.multiplyScalar(f).getHex()};
let sd=700;
const P=(g,c,x,y,z,sx,sy,sz,rx,ry,rz,j)=>part(g,c,x,y,z,sx,sy,sz,rx,ry,rz,j);
const B=(r,c,x,y,z,sx,sy,sz,o)=>{o=o||{};return part(blob(r,o.d===undefined?2:o.d,o.amp===undefined?.012:o.amp,++sd,sx||1,sy||1,sz||1),c,x,y,z,1,1,1,o.rx,o.ry,o.rz,o.jit)};

/* ---------- parçalar: ayak tabanı y=0 kabul edilerek yazılır, sonra eklem yerine kaydırılır ---------- */
function limbs(prof,v,f){
 const L=LOOK[prof]||LOOK.farmer;
 const skin=SKIN[v%SKIN.length],hair=HAIR[(v*7+prof.length)%HAIR.length];
 const G={},mg=(l,o)=>merge(l,o||{jit:.03});
 const o=-.92;                                  /* bel ekleminin yüksekliği */
 const plaid=(x,y,z,nx,ny,nz,c)=>{if(Math.floor(x*18)%2===0||Math.floor(y*18)%2===0)c.multiplyScalar(.8)};
 const cf=prof==='woodcut'?plaid:null;

 /* gövde: leğen, karın, göğüs, omuz başları, yaka, kemer */
 const tp=[
  P(rbox(.35,.2,.215,.4,3),L.leg,0,.96+o,0),
  P(rbox(.37,.16,.215,.4,3),L.tun,0,1.09+o,0),
  P(rbox(.41,.2,.23,.35,3),L.tun,0,1.22+o,0),
  P(rbox(.455,.2,.245,.35,3),L.tun,0,1.37+o,0),
  B(.08,L.tun,.228,1.4+o,0,1,1,1),B(.08,L.tun,-.228,1.4+o,0,1,1,1),
  P(rbox(.19,.05,.185,.4,2),dk(L.tun,.72),0,1.485+o,.02),            /* yaka */
  P(rbox(.05,.3,.02,.3,2),dk(L.tun,.8),0,1.25+o,.122),               /* ön dikiş */
  P(rbox(.38,.05,.24,.4,2),0x3a2a1c,0,1.02+o,0),                     /* kemer */
  P(box(.07,.06,.02),0xc9a23a,0,1.02+o,.126)                         /* toka */
 ];
 if(cf)for(let i=1;i<4;i++)tp[i].cf=cf;
 if(f)tp.push(P(cyl(.21,.33,.5,12),L.tun,0,.72+o,0));                /* etek */
 /* mesleğe özgü üst giysi */
 if(prof==='smith')tp.push(P(rbox(.38,.52,.05,.3,2),0x3a2a22,0,1.1+o,.125),P(box(.03,.3,.02),0x2a1e18,.12,1.4+o,.12,1,1,1,0,0,.35),P(box(.03,.3,.02),0x2a1e18,-.12,1.4+o,.12,1,1,1,0,0,-.35));
 else if(prof==='healer')tp.push(P(box(.11,.025,.02),0xd9463c,0,1.3+o,.125),P(box(.025,.11,.02),0xd9463c,0,1.3+o,.125),P(rbox(.15,.13,.07,.4,2),0x7a5a30,.26,1.0+o,0));
 else if(prof==='hunter')tp.push(P(rbox(.07,.5,.05,.4,2),0x4a3420,.1,1.22+o,.02,1,1,1,0,0,.3),P(rbox(.16,.18,.1,.4,2),0x4a3420,-.2,1.05+o,-.05));
 else if(prof==='fisher')tp.push(P(rbox(.42,.14,.25,.4,2),dk(L.tun,.75),0,1.44+o,0),P(rbox(.13,.16,.08,.4,2),0x6a5a3a,.24,1.0+o,-.02));
 else if(prof==='farmer')tp.push(P(rbox(.3,.42,.04,.3,2),0x9a8a5a,0,1.18+o,.124),P(box(.035,.26,.02),0x7a6a3a,.1,1.42+o,.12,1,1,1,0,0,.3),P(box(.035,.26,.02),0x7a6a3a,-.1,1.42+o,.12,1,1,1,0,0,-.3));
 else if(prof==='miner')tp.push(P(rbox(.43,.1,.26,.4,2),0xd9b030,0,1.3+o,0),P(rbox(.14,.14,.08,.4,2),0x4a4a52,-.24,1.0+o,0));
 else if(prof==='woodcut')tp.push(P(rbox(.2,.1,.24,.4,2),0x3a2a1c,0,1.46+o,0));
 /* gezgin tüccar gibi ek görünümler (ayak tabanına göre yazılır) */
 if(sc.npcExtra){const ex=[];sc.npcExtra(prof,ex,{part,cyl,cone,box,rbox,blob,Bp:B,PI2,L,skin,hair});for(const p of ex){p.y=(p.y||0)+o;tp.push(p)}}
 G.torso=mg(tp,{ao:.84,jit:.04});

 /* baş: boyun ekleminden (ayak y=1.5) itibaren */
 G.neck=mg([P(cyl(.048,.056,.12,8),skin,0,.04,0)],{jit:.02});
 G.head=mg([
  B(.116,skin,0,.15,0,.93,1.1,1.02),                                  /* kafatası */
  B(.088,dk(skin,1.02),0,.085,.025,1,.8,1.05),                        /* çene */
  B(.022,dk(skin,.94),0,.125,.116,.8,1,1.1,{d:1}),                    /* burun */
  B(.026,dk(skin,.95),.113,.15,0,.55,1,.9,{d:1}),B(.026,dk(skin,.95),-.113,.15,0,.55,1,.9,{d:1}),
  P(box(.05,.012,.01),0xb86a5c,0,.072,.106)                           /* ağız */
 ],{jit:.02});
 G.eyes=mg([
  B(.019,0xf2eee6,.041,.167,.097,1.2,.85,.6,{d:1,amp:0}),B(.019,0xf2eee6,-.041,.167,.097,1.2,.85,.6,{d:1,amp:0}),
  B(.0105,0x2a1a10,.041,.167,.107,1,1,.6,{d:1,amp:0}),B(.0105,0x2a1a10,-.041,.167,.107,1,1,.6,{d:1,amp:0}),
  P(box(.05,.011,.012),dk(hair,.8),.042,.199,.102,1,1,1,0,0,-.12),P(box(.05,.011,.012),dk(hair,.8),-.042,.199,.102,1,1,1,0,0,.12)
 ],{jit:0});
 /* saç ve sakal: kadınlarda uzun saç, erkeklerin bir kısmında sakal */
 const hp=[B(.124,hair,0,.2,-.008,.96,.86,1.05,{amp:.02}),B(.113,hair,0,.15,-.045,.95,.9,.9,{amp:.02})];
 if(f)hp.push(B(.1,hair,0,.04,-.08,1.1,1.6,.85,{amp:.02}),B(.045,hair,.105,.06,-.02,1,2.1,1,{d:1,amp:.01}),B(.045,hair,-.105,.06,-.02,1,2.1,1,{d:1,amp:.01}));
 else if((v+prof.length)%3===0)hp.push(B(.085,hair,0,.075,.075,1.25,.95,.75,{amp:.02}));
 G.hair=mg(hp,{jit:.05});
 /* başlıklar */
 const ht=[];
 if(prof==='farmer')ht.push(P(cyl(.27,.27,.018,14),L.hat,0,.245,0),P(cyl(.115,.125,.1,12),L.hat,0,.295,0),P(cyl(.128,.128,.025,12),0x8a6a2a,0,.265,0));
 else if(prof==='fisher')ht.push(P(cyl(.2,.215,.025,14),L.hat,0,.25,.01),B(.125,L.hat,0,.255,0,1,.62,1));
 else if(prof==='miner')ht.push(B(.152,L.hat,0,.225,0,1.05,.78,1.1,{amp:.008}),P(cyl(.19,.19,.018,12),L.hat,0,.195,.02),P(cyl(.032,.032,.05,8),0xfff0b0,0,.235,.14,1,1,1,PI2));
 else if(prof==='hunter')ht.push(B(.14,L.hat,0,.2,-.02,1.06,.95,1.08,{amp:.02}),P(cone(.11,.2,7),L.hat,0,.13,-.16,1,1,1,-.9));
 else if(prof==='woodcut')ht.push(B(.128,dk(L.hat,1.1),0,.21,0,1,.62,1,{amp:.015}),P(cyl(.118,.118,.03,12),dk(L.hat,.85),0,.17,0));
 else if(prof==='healer'||f)ht.push(B(.13,prof==='healer'?L.hat:dk(L.tun,1.08),0,.2,-.01,1.02,.8,1.04,{amp:.015}),P(rbox(.1,.16,.05,.4,2),prof==='healer'?L.hat:dk(L.tun,1.08),0,.09,-.085));
 else if(prof==='smith')ht.push(P(rbox(.24,.06,.2,.4,2),0x2a2226,0,.235,0));
 G.hat=ht.length?mg(ht,{jit:.03}):null;

 /* kollar */
 const up=[P(cyl(.055,.046,.3,9),L.tun,0,-.14,0),B(.057,L.tun,0,-.01,0,1,1,1),P(cyl(.049,.049,.025,9),dk(L.tun,.8),0,-.28,0)];
 if(cf){up[0].cf=cf;up[1].cf=cf}
 G.upper=mg(up,{ao:.9,jit:.03});
 G.fore=mg([P(cyl(.046,.035,.25,9),skin,0,-.135,0),B(.042,skin,0,-.055,.004,1,1.2,1)],{jit:.02});
 G.hand=mg([
  P(rbox(.078,.082,.035,.4,2),skin,0,-.04,0),
  P(box(.072,.044,.031),skin,0,-.098,.006,1,1,1,-.25),
  B(.018,skin,.048,-.054,.012,1,1.7,1,{d:1,rx:-.2,rz:-.5})
 ],{jit:.01});
 /* bacaklar */
 G.thigh=mg([P(cyl(.09,.07,.45,9),L.leg,0,-.22,0),B(.088,L.leg,0,-.01,0,1,.8,1)],{ao:.9,jit:.03});
 G.shin=mg([P(cyl(.068,.052,.39,9),L.leg,0,-.195,0),B(.068,L.leg,0,-.005,.01,1,.8,1)],{ao:.9,jit:.03});
 G.boot=mg([
  P(cyl(.062,.068,.14,9),0x3a2a1c,0,-.325,0),P(cyl(.07,.07,.03,9),0x2a1e14,0,-.26,0),
  P(rbox(.1,.095,.24,.4,3),0x3a2a1c,0,-.385,.05),P(box(.103,.03,.25),0x1c1510,0,-.425,.05)
 ],{jit:.03});

 /* sağ elde taşınan araç (el ekleminin altına asılır) */
 const tl=[];
 if(prof==='smith')tl.push(P(cyl(.019,.019,.32,7),0x6b4423,0,-.14,0),P(box(.075,.075,.15),0x55555d,0,-.3,0),P(box(.08,.025,.155),0x9aa0a8,0,-.265,0));
 else if(prof==='woodcut')tl.push(P(cyl(.019,.024,.62,7),0x8a5a30,0,-.28,0),P(box(.035,.17,.2),0x7d838c,0,-.56,.04),P(box(.028,.17,.05),0xa6acb4,0,-.56,.15));
 else if(prof==='miner')tl.push(P(cyl(.019,.024,.6,7),0x8a5a30,0,-.27,0),P(box(.045,.045,.44),0x8d8d92,0,-.54,0),P(cone(.03,.1,5),0x9aa0a8,0,-.54,.24,1,1,1,PI2));
 else if(prof==='fisher')tl.push(P(cyl(.013,.02,1.1,6),0x8a5a30,0,-.5,.06,1,1,1,-.35),P(cyl(.03,.03,.05,7),0x4a3a22,0,-.12,.02));
 else if(prof==='farmer')tl.push(P(cyl(.019,.019,1.05,7),0x8a5a30,0,-.48,0),P(box(.19,.025,.025),0x8d8d92,0,-.98,0),
  P(cone(.012,.15,4),0x8d8d92,-.075,-1.05,0,1,1,1,PI),P(cone(.012,.15,4),0x8d8d92,0,-1.05,0,1,1,1,PI),P(cone(.012,.15,4),0x8d8d92,.075,-1.05,0,1,1,1,PI));
 else if(prof==='hunter')tl.push(P(cyl(.014,.014,.52,6),0xa87440,0,-.18,0,1,1,1,PI2),P(cone(.022,.06,4),0xc3c9d0,0,-.18,.28,1,1,1,PI2));
 else if(prof==='healer')tl.push(P(cyl(.07,.06,.1,10),0xa8824a,0,-.12,.02),P(cyl(.072,.072,.012,10),0x7a5a30,0,-.07,.02),B(.03,0x7fc46a,0,-.06,.02,1,.5,1,{d:1}));
 G.tool=tl.length?mg(tl,{jit:.02}):null;
 return G;
}

/* ---------- iskelet ---------- */
function make(n){
 const prof=n.prof,v=(n.id|0),f=!!n.f,key=prof+'|'+(v%4)+'|'+(f?'f':'m');
 const G=GEO[key]||(GEO[key]=limbs(prof,v,f)),m=mats();
 const g=new THREE.Group(),o={g,prof};
 const me=(geo,mat,par,y)=>{const k=new THREE.Mesh(geo,mat);if(y)k.position.y=y;k.castShadow=true;k.receiveShadow=true;par.add(k);return k};
 const gr=(par,x,y,z)=>{const k=new THREE.Group();k.position.set(x,y,z);par.add(k);return k};
 o.body=gr(g,0,0,0);
 o.hip=gr(o.body,0,.92,0);
 o.torso=gr(o.hip,0,0,0);
 me(G.torso,m.cloth,o.torso);
 o.neck=gr(o.torso,0,.58,0);me(G.neck,m.skin,o.neck);
 o.head=gr(o.neck,0,0,0);
 me(G.head,m.skin,o.head);o.eyes=me(G.eyes,m.face,o.head);me(G.hair,m.hair,o.head);
 if(G.hat)me(G.hat,prof==='miner'||prof==='smith'?m.leather:m.cloth,o.head);
 const arm=sx=>{
  const sh=gr(o.torso,sx*.25,.5,0);me(G.upper,m.cloth,sh);
  const el=gr(sh,0,-.29,0);me(G.fore,m.skin,el);
  const hd=gr(el,0,-.25,0);me(G.hand,m.skin,hd);
  return {sh,el,hd};
 };
 const A=arm(-1),R=arm(1);
 o.shL=A.sh;o.elL=A.el;o.shR=R.sh;o.elR=R.el;o.hdR=R.hd;
 if(G.tool)me(G.tool,m.leather,R.hd,-.06);
 const leg=sx=>{
  const hp=gr(o.hip,sx*.1,0,0);me(G.thigh,m.cloth,hp);
  const kn=gr(hp,0,-.45,0);me(G.shin,m.cloth,kn);me(G.boot,m.leather,kn);
  return {hp,kn};
 };
 const LL=leg(-1),LR=leg(1);
 o.hipL=LL.hp;o.knL=LL.kn;o.hipR=LR.hp;o.knR=LR.kn;
 o.blink=2+Math.random()*4;
 sc.scene.add(g);return o;
}
sc.npcMake=make;

/* ---------- canlandırma ---------- */
const lerp=(a,b,k)=>a+(b-a)*k;
S.onFrame((G,t,dt,info)=>{
 const L=G.npcs||[];
 const alive=new Set(L);
 for(const [n,o] of objs)if(!alive.has(n)){sc.scene.remove(o.g);objs.delete(n)}
 if(info.mode!=='play'){for(const o of objs.values())o.g.visible=false;return}
 const cam=sc.cam.position;
 for(const n of L){
  const d2=(n.x-cam.x)**2+(n.z-cam.z)**2;let o=objs.get(n);
  if(d2>110*110){if(o)o.g.visible=false;continue}
  if(!o){o=make(n);objs.set(n,o)}
  o.g.visible=true;
  const gy=S.groundY(n.x,n.z),ph=n.walk*2.2,sp=Math.min(1,(n.spd||0)/.8),amp=sp*.62;
  o.g.position.set(n.x,gy,n.z);o.g.rotation.order='YXZ';o.g.rotation.y=n.yaw;
  /* göz kırpma */
  o.blink-=dt;
  if(o.blink<0){o.eyes.scale.y=.12;if(o.blink<-.1){o.blink=2.5+Math.random()*4.5;o.eyes.scale.y=1}}
  if(n.sleep){
   /* uyuyan köylü: yatağın üstünde sırtüstü, yavaş nefes alır */
   const hr=n.house&&n.house.ry!==undefined?n.house.ry:n.yaw,gh=n.house?S.groundY(n.house.x,n.house.z):gy;
   o.g.rotation.y=hr;o.g.rotation.x=-PI2;
   o.g.position.set(n.x+Math.sin(hr)*.85,gh+.72+Math.sin(t*1.1+n.id)*.008,n.z+Math.cos(hr)*.85);
   o.hip.rotation.set(0,0,0);o.torso.rotation.set(0,0,0);o.neck.rotation.set(0,0,0);
   o.hipL.rotation.set(-.12,0,.06);o.hipR.rotation.set(-.1,0,-.06);o.knL.rotation.x=.3;o.knR.rotation.x=.26;
   o.shL.rotation.set(.1,0,.22);o.shR.rotation.set(.12,0,-.2);o.elL.rotation.x=-.5;o.elR.rotation.x=-.45;
   o.torso.scale.y=1+Math.sin(t*1.1+n.id)*.014;
   continue;
  }
  o.g.rotation.x=0;o.torso.scale.y=1+Math.sin(t*1.8+n.id)*.008;
  /* yürüme: uyluk salınır, diz yalnızca geri savrulurken bükülür */
  const s1=Math.sin(ph),s2=Math.sin(ph+PI);
  o.hipL.rotation.x=s1*amp;o.hipR.rotation.x=s2*amp;
  o.knL.rotation.x=Math.max(0,-s1)*amp*1.5;o.knR.rotation.x=Math.max(0,-s2)*amp*1.5;
  o.hip.position.y=.92+Math.abs(Math.sin(ph))*amp*.045;     /* bel ekleminin taban yüksekliği (.92) korunur; eskiden sıfırlanıyor ve gövde bacaklarla birlikte zemine gömülüyordu */
  o.hip.rotation.z=Math.sin(ph)*amp*.04;
  const talk=G.trading===n,idle=(n.spd||0)<.15;
  /* kollar: yürürken ters salınım, dururken hafif nefes */
  let aL=-s1*amp*.85+Math.sin(t*1.3+n.id)*.02,aR=-s2*amp*.85+Math.sin(t*1.1+n.id)*.02;
  let eL=-.25-Math.max(0,s1)*amp*.5,eR=-.25-Math.max(0,s2)*amp*.5;
  let zL=.07,zR=-.07,tx=0,ty=0;
  /* oyuncuya bakma */
  const dxp=G.px-n.x,dzp=G.py-n.z,dp=Math.hypot(dxp,dzp);
  let rel=0;
  if((idle||talk)&&dp<14){rel=Math.atan2(dxp,dzp)-n.yaw;while(rel>PI)rel-=6.283;while(rel<-PI)rel+=6.283;rel=Math.max(-1.1,Math.min(1.1,rel))*Math.min(1,(14-dp)/5)}
  o.tw=lerp(o.tw||0,rel,Math.min(1,5*dt));
  ty=o.tw*.45;o.neck.rotation.y=o.tw*.55;o.neck.rotation.x=dp<6&&(idle||talk)?-.08:0;
  if(talk){
   /* konuşma: eller hareket eder */
   const w=t*2.6+n.id;
   aR=-.75+Math.sin(w)*.3;eR=-.8-Math.max(0,Math.sin(w))*.5;zR=-.35;
   aL=-.35+Math.sin(w+1.3)*.18;eL=-.6;zL=.28;
  }else if(idle){
   if(dp<9&&dp>2.5&&!o.waved){o.waved=true;o.wv=2.2}
   if(dp>16)o.waved=false;
   if(o.wv>0){
    o.wv-=dt;const u=Math.min(1,o.wv/.3,(2.2-o.wv)/.3);
    aL=-2.2*u;zL=.3+Math.sin(t*10)*.4*u;eL=-.3;
   }else if(dp>5){
    /* mesleğe özgü iş döngüleri */
    const w=t*(n.prof==='smith'?3.2:2.2)+n.id*1.7,sw=Math.max(0,Math.sin(w));
    if(n.prof==='smith'){aR=-1.25-sw*.95;eR=-.5-sw*.35;aL=-.75;eL=-1.1;tx=sw*.07}
    else if(n.prof==='woodcut'||n.prof==='miner'){aR=-.35-sw*2.1;aL=-.3-sw*1.3;eR=-.35;eL=-.5;tx=sw*.12}
    else if(n.prof==='farmer'){const b=(Math.sin(w*.7)+1)*.5;tx=b*.4;aR=-.5-b*.5;aL=-.45-b*.45;eR=-.4;eL=-.4}
    else if(n.prof==='fisher'){aR=-.95+Math.sin(w*.4)*.12;eR=-.55;aL=-.55;eL=-.9;zR=-.18}
    else if(n.prof==='healer'){aR=-.95+Math.sin(w*.8)*.18;zR=-.32;eR=-1.0;aL=-.6;eL=-.8}
    else if(n.prof==='hunter'){aR=-.3+Math.sin(w*.3)*.1;ty+=Math.sin(w*.25)*.22;eR=-.3}
    else if(n.prof==='trader'){aR=-.5+Math.sin(w*.6)*.15;aL=-.45+Math.sin(w*.6+1)*.15;eR=-.7;eL=-.7}
   }
  }
  o.shL.rotation.x=aL;o.shR.rotation.x=aR;o.shL.rotation.z=zL;o.shR.rotation.z=zR;
  o.elL.rotation.x=eL;o.elR.rotation.x=eR;
  o.torso.rotation.x=lerp(o.torso.rotation.x,tx,Math.min(1,6*dt));
  o.torso.rotation.y=ty;
 }
});
})();
