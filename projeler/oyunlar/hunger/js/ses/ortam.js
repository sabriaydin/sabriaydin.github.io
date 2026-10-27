/* Hunger 3D - ortam sesleri yönetimi.
   Rüzgâr, deniz, yağmur, orman, kuşlar, mağara, su altı, ateş ve korku katmanlarının tek sahibidir.
   Her katman (bed) iki kaynaklıdır: gerçek kayıt ve üretilen ses. Kayıt yüklendiği anda üretilen ses
   yumuşakça kısılır, kayıt açılır; kayıt hiç gelmezse üretilen ses çalmayı sürdürür. Böylece iki
   sistem birbiriyle çekişmez, ses seviyeleri tek yerden belirlenir.
   Ayrıca zamanlayıcıyla çalan tek seslik ortam olaylarını (kuş, cırcır böceği, baykuş, damla, martı)
   ve oyuncunun kendi seslerini (kalp atışı, nefes, mide) yönetir. */
(()=>{
'use strict';
const S=HG.Ses,{G,T,O,W,H,ui}=HG,sc=HG.sc;
const R=S.R,clamp=S.clamp,tc=S.tc;
let AC=null,amb=null,tens=null;
const bed={};
let fire=null,pad=null,kuruldu=false;

/* ---------------------------------------------------------- katman kurulumu ---------------------------------------------------------- */
function dongu(buf,rate){
 const s=AC.createBufferSource();
 s.buffer=buf;s.loop=true;
 if(rate)s.playbackRate.value=rate;
 s.start(0,Math.random()*Math.max(.1,buf.duration-.5));
 return s;
}
/* katman: üretilen kaynak + kayıt kaynağı, ortak çıkış ve süzgeç */
function mk(ad,o){
 const g=AC.createGain();g.gain.value=0;
 const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=20000;
 g.connect(lp);
 const pan=AC.createStereoPanner?AC.createStereoPanner():null;
 if(pan){lp.connect(pan);pan.connect(o.tens?tens:amb)}else lp.connect(o.tens?tens:amb);
 const b={ad,g,lp,pan,kayit:o.kayit||null,rec:null,recG:null,synG:null,synF:null,gecis:0,salinim:o.salinim||0};
 if(o.synth){
  const sg=AC.createGain();sg.gain.value=1;sg.connect(g);
  let n=dongu(S.gurultu(o.synth.pink));
  const fs=[];
  for(const [t,f,q] of o.synth.f){const bq=AC.createBiquadFilter();bq.type=t;bq.frequency.value=f;bq.Q.value=q||.7;n.connect(bq);n=bq;fs.push(bq)}
  n.connect(sg);
  b.synG=sg;b.synF=fs;
 }
 bed[ad]=b;return b;
}
/* kayıt hazır olduğunda katmanı kayda geçirir */
function kayitAc(b){
 if(b.rec||!b.kayit||!S.kayit)return;
 const buf=S.kayit.dongu(b.kayit);if(!buf)return;
 const rg=AC.createGain();rg.gain.value=b.synG?0:1;rg.connect(b.g);
 b.rec=dongu(buf);b.rec.connect(rg);b.recG=rg;
 if(b.synG){tc(b.synG.gain,0,1.2);tc(rg.gain,1,1.2)}
}
const ayar=(ad,v,tau)=>{const b=bed[ad];if(b)tc(b.g.gain,clamp(v,0,1),tau||.8)};

function kur(){
 AC=S.ac();if(!AC||kuruldu)return;
 kuruldu=true;
 amb=S.kanal('amb');tens=S.kanal('tens');
 mk('wind',   {kayit:'ruzgar', synth:{pink:true,f:[['bandpass',380,.5]]},salinim:.25});
 mk('fırtına',{kayit:'firtina',synth:{pink:true,f:[['bandpass',620,.4]]},salinim:.3});
 mk('sea',    {kayit:'dalga',  synth:{pink:true,f:[['lowpass',700,.6]]}});
 mk('foam',   {kayit:'kiyi',   synth:{f:[['highpass',2600,.5],['lowpass',7500,.5]]}});
 mk('kayalık',{kayit:'kayalik'});
 mk('leaf',   {kayit:'yaprak', synth:{pink:true,f:[['bandpass',3600,.45]]},salinim:.4});
 mk('rain',   {kayit:'yagmur', synth:{f:[['highpass',1100,.5],['lowpass',9500,.5]]}});
 mk('sağanak',{kayit:'yagmur2',synth:{f:[['highpass',1600,.5],['lowpass',11000,.5]]}});
 mk('drum',   {synth:{pink:true,f:[['lowpass',480,.6]]}});
 mk('kuş',    {kayit:'kus'});
 mk('kuş2',   {kayit:'kus2'});
 mk('kuş3',   {kayit:'kus3'});
 mk('derinlik',{synth:{pink:true,f:[['lowpass',210,.7]]}});
 mk('whisper',{tens:true,synth:{pink:true,f:[['bandpass',1100,9],['bandpass',2300,7]]}});
 /* gerilim uğultusu: birbirine çok yakın iki alçak ton, yavaşça vurur */
 {
  const g=AC.createGain();g.gain.value=0;
  const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=180;
  lp.connect(g);g.connect(tens);
  for(const f of [48,49.1]){const o=AC.createOscillator();o.type='sine';o.frequency.value=f;const vg=AC.createGain();vg.gain.value=.5;o.connect(vg);vg.connect(lp);o.start()}
  bed.drone={ad:'drone',g,lp};
 }
 /* ateş: oyuncuya en yakın ateşin konumunda çalar */
 {
  const pn=S.yerlesim(0,1,0);pn.connect(S.kanal('sfx'));
  const mkF=(pink,f)=>{
   const g=AC.createGain();g.gain.value=0;
   let n=dongu(S.gurultu(pink));
   for(const [t,fr,q] of f){const b=AC.createBiquadFilter();b.type=t;b.frequency.value=fr;b.Q.value=q||.7;n.connect(b);n=b}
   n.connect(g);g.connect(pn);return g;
  };
  fire={pn,catirdi:mkF(false,[['highpass',2400,.6],['lowpass',8000,.5]]),ugultu:mkF(true,[['lowpass',260,.7]]),kayit:null,kg:null};
 }
 /* müzik yerine geçen yumuşak akor yastığı (muzik.js kayıt çalamazsa kullanır) */
 {
  const g=AC.createGain();g.gain.value=0;
  const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1100;lp.Q.value=.4;
  lp.connect(g);g.connect(S.kanal('mus'));
  const sesler=[];
  for(let i=0;i<4;i++)for(const dt of [-7,7]){
   const o=AC.createOscillator();o.type=i%2?'triangle':'sine';o.frequency.value=110;o.detune.value=dt;
   const vg=AC.createGain();vg.gain.value=.25;o.connect(vg);vg.connect(lp);o.start();sesler.push({o,i});
  }
  pad={g,lp,sesler,ci:0,t:6};
  S.pad=pad;
 }
}
/* ateşin kayıt katmanı: üç ayrı kayıt hafif perde farkıyla üst üste çalar, tekrar duyulmaz */
function ateşKayit(){
 if(fire.kayit||!S.kayit)return;
 const a=S.kayit.dongu('ates1'),b=S.kayit.dongu('ates2'),c=S.kayit.dongu('ates3');
 if(!a||!b||!c)return;
 const g=AC.createGain();g.gain.value=0;g.connect(fire.pn);
 [[a,1],[b,.97],[c,1.03]].forEach(([buf,r])=>{dongu(buf,r).connect(g)});
 fire.kayit=true;fire.kg=g;
 tc(fire.catirdi.gain,0,.6);tc(fire.ugultu.gain,0,.6);
}

/* ---------------------------------------------------------- çevre taraması ---------------------------------------------------------- */
let tara=0,orman=0,deniz=0;
function cevre(){
 const px=Math.floor(G.px),py=Math.floor(G.py);
 let agac=0;
 for(let dy=-7;dy<=7;dy++)for(let dx=-7;dx<=7;dx++){
  const x=px+dx,y=py+dy;if(x<0||y<0||x>=W||y>=H)continue;
  const o=G.obj[y*W+x];
  if(o===O.TREE||o===O.BUSH||o===O.PALM)agac++;
 }
 orman=clamp(agac/38,0,1);
 let uz=40;
 for(let a=0;a<16;a++){
  const ca=Math.cos(a*.3927),sa=Math.sin(a*.3927);
  for(let r=2;r<=34;r+=2){
   const x=Math.floor(G.px+ca*r),y=Math.floor(G.py+sa*r);
   if(x<0||y<0||x>=W||y>=H){uz=Math.min(uz,r);break}
   if(G.tile[y*W+x]<=T.SHAL){uz=Math.min(uz,r);break}
  }
 }
 deniz=Math.pow(clamp(1-uz/36,0,1),1.2);
}

/* ---------------------------------------------------------- kare ---------------------------------------------------------- */
let sKus=4,sCirCir=2,sBaykus=30,sDamla=3,sGicirti=20,sMarti=25;
let vuru=0,mide=20,nefes=0,patlama=0,ateşSayi=-1;
const PROG_GUN=[0,5,7,2],PROG_GECE=[0,3,8,5],AKOR_GUN=[0,7,12,16],AKOR_GECE=[0,7,12,15];
const hz=st=>110*Math.pow(2,st/12);

function kare(e){
 if(!kuruldu)kur();
 if(!kuruldu)return;
 if(S.kayit)S.kayit.basla();
 for(const k in bed)kayitAc(bed[k]);
 ateşKayit();
 const {dt,t,play,cave,sh}=e;
 const C=HG.cfg;
 const L=HG.daylight?HG.daylight():1,yagmur=sc.rain||0,bulut=sc.over||0;
 const kar=play&&sc.snow?sc.snow:0;
 const barinak=sh?1:0;
 tara-=dt;if(tara<=0){tara=.45;cevre()}
 const yukseklik=play&&G.pz!==undefined?G.pz:0;
 /* rüzgâr: yavaş esen dalgalar; yükseklik, açıklık ve havayla artar */
 const esinti=.5+.5*Math.sin(t*.31)*Math.sin(t*.173+1.1);
 const ruzgar=clamp(.2+.4*esinti+.28*bulut+.4*yagmur+clamp(yukseklik/14,0,.35),0,1);
 const aciklik=1-orman*.5;
 S.orman=orman;S.deniz=deniz;S.ruzgar=ruzgar;
 const ic=cave?0:1;                                /* mağarada dış ortam duyulmaz */
 const dis=ic*(e.head?.35:1);                      /* su altında dış sesler iyice uzaklaşır */
 ayar('wind',(bed.wind.rec?.85:.08)*ruzgar*aciklik*(barinak?.45:1)*dis+(cave?0:.01),.5);
 if(bed.wind.synF)tc(bed.wind.synF[0].frequency,260+520*ruzgar+140*esinti,.4);
 ayar('fırtına',(bed['fırtına'].rec?.8:.06)*clamp((ruzgar-.5)*2.2,0,1)*(barinak?.4:1)*dis,.9);
 /* deniz: uzun salınımlı kabarma */
 const kabarma=.55+.45*Math.sin(t*.42)*Math.sin(t*.13+.6);
 ayar('sea',(bed.sea.rec?.9:.2)*deniz*(.65+.35*kabarma)*dis,.6);
 if(bed.sea.synF)tc(bed.sea.synF[0].frequency,420+520*kabarma,.5);
 ayar('foam',(bed.foam.rec?.8:.06)*deniz*deniz*(.4+.6*kabarma)*dis,.5);
 ayar('kayalık',.5*deniz*(.5+.5*Math.sin(t*.043))*dis,1);
 /* orman hışırtısı */
 ayar('leaf',(bed.leaf.rec?.7:.05)*orman*(.35+ruzgar)*(barinak?.45:1)*dis,.7);
 /* yağmur: barınakta boğuk, üstüne çatı davulu */
 const yv=yagmur*(play?1:.6)*dis;
 ayar('rain',(bed.rain.rec?.9:.17)*yv*(barinak?.7:1),.9);
 tc(bed.rain.lp.frequency,barinak?1000:16000,.5);
 ayar('sağanak',(bed['sağanak'].rec?.9:.1)*clamp((yagmur-.5)*2,0,1)*(barinak?.7:1)*dis,.9);
 tc(bed['sağanak'].lp.frequency,barinak?1000:16000,.5);
 ayar('drum',.17*yv*(barinak?1.4:.35),.8);
 /* kuşlar: gündüz, kuru hava, ormanlık, korkusuz ve açık alanda */
 const kusluk=clamp(L*1.3-.3,0,1)*clamp(1-yagmur*1.6,0,1)*(.35+.65*orman)*(1-.85*deniz)*(barinak?.3:1)*clamp(1-(sc.fear||0)*2,0,1)*dis*(1-kar*.8);
 ayar('kuş',.9*kusluk*(.5+.5*Math.sin(t*.021)),2.5);
 ayar('kuş2',.9*kusluk*(.5+.5*Math.sin(t*.017+2)),2.5);
 ayar('kuş3',.65*kusluk,2.5);
 /* su altı: alçak uğultu */
 ayar('derinlik',e.head?.5:0,.4);
 /* korku katmanları */
 const korku=sc.fear||0,delilik=sc.insane||0,ger=C.tens/100;
 tc(bed.drone.g.gain,.12*ger*Math.max(korku-.15,0,delilik*.5-.1),1.2);
 ayar('whisper',.07*ger*delilik*(.4+.6*Math.abs(Math.sin(t*1.9))),.3);
 if(bed.whisper.synF){
  tc(bed.whisper.synF[0].frequency,700+800*Math.abs(Math.sin(t*.63)),.2);
  tc(bed.whisper.synF[1].frequency,1700+900*Math.abs(Math.sin(t*.41+1)),.2);
 }
 /* katmanların yavaş sağa sola kayması: ses alanı canlı durur */
 for(const k in bed){
  const b=bed[k];
  if(b.pan&&b.salinim)tc(b.pan.pan,Math.sin(t*(.07+b.salinim*.1)+k.length)*b.salinim,1.5);
 }
 /* ateş */
 let yakin=null,en=1e9;
 for(const f of sc.fires||[]){const d=(f.x-G.px)**2+(f.z-G.py)**2;if(d<en){en=d;yakin=f}}
 const fu=Math.sqrt(en);
 const sayi=(sc.fires||[]).length;
 if(play&&ateşSayi>=0&&sayi>ateşSayi&&yakin&&fu<22)HG.snd('ignite',{x:yakin.x,y:(yakin.y||0)+.5,z:yakin.z});
 ateşSayi=play?sayi:-1;
 if(yakin&&fu<28){
  S.setPos(fire.pn,yakin.x,(yakin.y||0)+.6,yakin.z);
  if(fire.kg)tc(fire.kg.gain,.8*(.85+.15*Math.sin(t*3.1)),.3);
  else{
   const alev=.35+.65*Math.pow(Math.random(),2.5);
   tc(fire.catirdi.gain,.16*alev,.05);tc(fire.ugultu.gain,.34*(.8+.2*Math.sin(t*3.1)),.3);
  }
  patlama-=dt;
  if(patlama<=0){patlama=R(.14,.8);if(!ui.mute&&!fire.kayit)try{S.K.pop(fire.pn)}catch(er){}}
 }else{
  if(fire.kg)tc(fire.kg.gain,0,.5);
  tc(fire.catirdi.gain,0,.3);tc(fire.ugultu.gain,0,.3);
 }
 /* zamanlayıcılı tek seslik ortam olayları */
 const gz=play&&G.pz!==undefined?G.pz:0;
 const nokta=(r0,r1,y0,y1)=>{const a=Math.random()*Math.PI*2,r=R(r0,r1);return{x:G.px+Math.cos(a)*r,z:G.py+Math.sin(a)*r,y:gz+R(y0,y1)}};
 const sessiz=ui.mute;
 sKus-=dt;
 if(sKus<=0){
  sKus=R(3.5,11)/(.35+orman*1.2);
  if(kusluk>.25&&!sessiz&&!bed['kuş'].rec)HG.snd('bird',nokta(7,30,3,9));
 }
 sCirCir-=dt;
 if(sCirCir<=0){
  sCirCir=R(.25,.9);
  if(L<.3&&!cave&&yagmur<.2&&deniz<.7&&!kar&&!sessiz&&Math.random()<(barinak?.45:1)*clamp(1-korku*2,0,1))HG.snd('cricket',nokta(4,18,0,.4));
 }
 sBaykus-=dt;
 if(sBaykus<=0){sBaykus=R(28,70);if(L<.2&&yagmur<.4&&orman>.15&&!cave&&!sessiz)HG.snd('owl',nokta(14,38,4,9))}
 sMarti-=dt;
 if(sMarti<=0){sMarti=R(22,60);if(L>.35&&deniz>.45&&yagmur<.4&&!cave&&!sessiz)HG.snd('gull',nokta(10,40,6,14))}
 if(play&&cave){
  sDamla-=dt;if(sDamla<=0){sDamla=R(1.6,6);if(!sessiz)HG.snd('drip',nokta(3,20,0,1))}
  sGicirti-=dt;if(sGicirti<=0){sGicirti=R(18,45);if(!sessiz)HG.snd('cave_creak',nokta(10,30,0,3))}
 }
 /* oyuncunun kendi sesleri */
 if(play){
  if(ger>0&&((G.hp<25&&G.hp>0)||korku>.5||delilik>.7)){
   const dusuk=G.hp<25?(25-G.hp)*1.2:0,bpm=clamp(64+dusuk+korku*26,64,96);
   vuru-=dt;
   if(vuru<=0){
    vuru=60/bpm;
    S.kalpSiddet(ger*(.45+.55*clamp(Math.max(korku,(25-G.hp)/25,delilik),0,1)));
    HG.snd('heart');
   }
  }else vuru=0;
  mide-=dt;if(mide<=0){mide=R(24,46);if(G.hun<14)HG.snd('stomach')}
  if(G.sprint&&G.moving){nefes-=dt;if(nefes<=0){nefes=.62;HG.snd('breath')}}else nefes=0;
 }
 /* akor yastığı: müzik kaydı çalmıyorsa duyulur */
 if(pad){
  const gece=L<.35,zayif=play&&G.hp<32;
  const muzikVar=S.muzik&&S.muzik.calisiyor();
  tc(pad.g.gain,(zayif||C.mus<=0||muzikVar||sessiz?0:.02)*(1-.45*yagmur)*(barinak?.8:1)*(e.mode==='menu'?1.35:1),2.5);
  pad.t-=dt;
  if(pad.t<=0){
   pad.t=R(13,19);pad.ci=(pad.ci+1)%4;
   const kok=(gece?PROG_GECE:PROG_GUN)[pad.ci],akor=gece?AKOR_GECE:AKOR_GUN;
   for(const v of pad.sesler)tc(v.o.frequency,hz(kok+akor[v.i]-(v.i===0?12:0)+12),2.8);
   tc(pad.lp.frequency,gece?750:1250,2);
  }
 }
}
S.kare(kare);
HG.audioBeds=()=>{const o={};for(const k in bed)o[k]=bed[k].g.gain.value;return o};
})();
