/* Hunger 3D - fizik ve hareket hissi (güncelleme 70).
   Çömelme (sessiz yürüyüş, alçak kamera), zeminden ayrıldıktan sonra kısa zıplama hakkı (coyote), havada basılan
   zıplama tuşunun tamponlanması, dik yamaçta kayma, darbe geri tepmesi ve suya giriş momentumu.
   Özgün dosyalara yalnızca küçük kancalar eklendi: hayatta-kalma.js (zıplama koşulu, çömelme hızı),
   sahne/cekirdek.js (göz yüksekliği HG.eyeH), ag.js (FL.CR bayrağı). */
(()=>{
'use strict';
const {G,ui,inp,clamp}=HG;
const S=HG.Scene,sc=HG.sc;
const EYE=HG.EYE,CROUCH_EYE=EYE-.58;
const COYOTE=.13,BUFFER=.16;
const SLIDE_T=.92;                       /* bu eğimin üstünde (yaklaşık 43°) ayak tutmaz */

HG.eyeH=EYE;
let jPrev=false,eye=EYE,slideS=0,sndT=0;

/* ---- Çömelme ---- */
function setCrouch(v){
 v=!!v;
 if(v===!!G.crouch)return;
 if(v&&(G.swim||G.onRaft||G.air||ui.state!=='play'))return;
 G.crouch=v;
 if(HG.log)HG.log('fizik',v?'Çömeldi':'Doğruldu');
}
HG.setCrouch=setCrouch;

function crouchInput(){
 if(ui.state!=='play'||ui.sleeping){if(G.crouch)setCrouch(false);return}
 const down=HG.keyDown('crouch')||!!inp.touchCrouch;
 if(HG.cfg.crouchT){                    /* aç/kapat kipi: bir kez basmak çömeltir */
  if(down&&!crouchInput.prev)setCrouch(!G.crouch);
 }else setCrouch(down);
 crouchInput.prev=down;
 /* yüzerken, salda ve havada çömelme bozulur */
 if(G.crouch&&(G.swim||G.onRaft))setCrouch(false);
}

/* ---- Zıplama hakkı ve tamponu ---- */
function jumpAid(dt){
 if(!G.air&&!G.swim&&!G.onRaft)G.coyote=COYOTE;else G.coyote=Math.max(0,(G.coyote||0)-dt);
 const j=HG.keyDown('jump')||!!inp.touchJump;
 if(j&&!jPrev&&(G.air||G.swim===false))G.jumpBuf=BUFFER;
 jPrev=j;
 G.jumpBuf=Math.max(0,(G.jumpBuf||0)-dt);
}

/* ---- Dik yamaçta kayma ---- */
function slope(x,z){
 const d=.45,h=S.terrainY(x,z);
 return {gx:(S.terrainY(x+d,z)-S.terrainY(x-d,z))/(2*d),gz:(S.terrainY(x,z+d)-S.terrainY(x,z-d))/(2*d),h};
}
function slideStep(dt){
 if(ui.state!=='play'||G.air||G.swim||G.onRaft||G.cave||ui.sleeping){slideS=Math.max(0,slideS-dt*3);return}
 if(G.pz===undefined)return;
 const g=slope(G.px,G.py),mag=Math.hypot(g.gx,g.gz);
 /* yapı üstünde (temel, zemin) durulurken kayma olmaz */
 if(G.pz>g.h+.3){slideS=Math.max(0,slideS-dt*3);return}
 if(mag<SLIDE_T){slideS=Math.max(0,slideS-dt*2.5);return}
 const over=Math.min(1.6,mag-SLIDE_T);
 slideS=Math.min(1,slideS+dt*2.2);
 const sp=(2.1+over*3.4)*slideS;
 const nx=G.px-g.gx/mag*sp*dt,nz=G.py-g.gz/mag*sp*dt;
 const okAt=(x,y)=>HG.canStandAt(x,y,G.pz)&&!(HG.rsBlock&&HG.rsBlock(x,y,G.pz));
 let moved=false;
 if(okAt(nx,nz)){G.px=nx;G.py=nz;moved=true}
 else if(okAt(nx,G.py)){G.px=nx;moved=true}
 else if(okAt(G.px,nz)){G.py=nz;moved=true}
 if(!moved){slideS=0;return}
 /* kayarken dayanıklılık azalır ve ayak altından taş sesi gelir */
 G.stam=Math.max(0,G.stam-dt*4);
 sndT-=dt;
 if(sndT<=0&&slideS>.35){sndT=.22;try{HG.snd('step_rock')}catch(e){}}
 if(slideS>.5)sc.shake=Math.max(sc.shake,.1*slideS);
 if(G.crouch)setCrouch(false);
}

/* ---- Darbe geri tepmesi: vuran canlının yönünden itilir ---- */
{
 const h0=HG.hurt;
 HG.hurt=function(dmg,cause,src,bleedP){
  const hp0=G.hp;
  const r=h0.apply(this,arguments);
  try{
   /* hasar gerçekten uygulandıysa itilir: barış kipinde engellenen saldırı geri tepme de yapmaz */
   if(G.hp<hp0-.001&&src&&isFinite(src.x)&&isFinite(src.z)&&ui.state==='play'&&!G.onRaft){
    const dx=G.px-src.x,dz=G.py-src.z,d=Math.hypot(dx,dz)||1;
    const k=clamp(dmg*.085,.25,2.6)*(G.crouch?1.25:1)*(G.swim?.5:1);
    G.pvx=(G.pvx||0)+dx/d*k;G.pvy=(G.pvy||0)+dz/d*k;
    if(dmg>=14&&!G.air&&!G.swim){G.vz=Math.max(G.vz||0,1.9);G.air=true}      /* ağır darbe hafifçe havalandırır */
   }
  }catch(e){}
  return r;
 };
}

/* ---- Suya giriş: yüksekten atlayınca derine batılır ---- */
let airV=0;
function waterEntry(){
 if(!G.swim){airV=G.air?(G.vz||0):0;waterEntry.was=false;return}
 if(waterEntry.was)return;
 waterEntry.was=true;
 if(airV<-6){
  G.pz=Math.max(S.groundY(G.px,G.py),G.pz-Math.min(1.5,(-airV-6)*.22));
  G.vz=Math.min(G.vz,-1.2);
  try{HG.snd('splash')}catch(e){}
 }
}

/* ---- Kare ---- */
const u0=HG.update;
HG.update=function(dt){
 crouchInput();
 jumpAid(dt);
 const r=u0.apply(this,arguments);
 slideStep(dt);
 waterEntry();
 /* göz yüksekliği: çömelme ve doğrulma yumuşak geçer */
 const want=G.crouch?CROUCH_EYE:EYE;
 eye+=(want-eye)*(1-Math.exp(-11*dt));
 HG.eyeH=G.swim||G.onRaft?EYE:eye;
 /* görüş açısı: çömelince hafif daralır, serbest düşüşte açılır */
 const fall=G.air&&(G.vz||0)<-7?Math.min(9,(-(G.vz||0)-7)*.9):0,fw=(G.crouch?-4:0)+fall;
 HG.fovAdd=(HG.fovAdd||0)+(fw-(HG.fovAdd||0))*(1-Math.exp(-6*dt));
 G.sneak=!!G.crouch;
 return r;
};

/* Çömelirken yay daha az sallanır, nişan daha isabetli (silah.js yayılma çarpanını okur) */
HG.aimSteady=()=>G.crouch&&!G.moving?.45:G.crouch?.7:1;
HG.physics={get slide(){return slideS},get eye(){return eye}};
})();
