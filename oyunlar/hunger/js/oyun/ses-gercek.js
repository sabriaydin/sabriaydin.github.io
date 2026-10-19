/* Hunger 3D - gerçek ses kayıtları katmanı.
   ses/ klasöründeki kayıtları (adım, alet, dövüş, hayvan, gök gürültüsü, döngüsel ortam sesleri, müzik) ses.js motoruna bağlar.
   Motorun uzamsal (3B) çıkışı, yankısı ve ses ayarları aynen kullanılır; kayıtlar yüklenemez veya çözülemezse
   ilgili ses ses.js içindeki programla üretilen sürümüyle çalmaya devam eder (oyun sessiz kalmaz, hata vermez).
   Kayıt sahipleri ve lisanslar: ses/KREDI.txt */
(()=>{
'use strict';
const {G,T,O,W,H,ui,look}=HG;
const R=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const BASE='ses/';
let X=null,man=null,state='bekle',nLoaded=0,nFailed=0;
const POOL={},LOOP={},last={};

/* ---------- yükleme ---------- */
function decode(ab){
 return new Promise((res,rej)=>{
  try{const p=X.ac().decodeAudioData(ab,res,rej);if(p&&p.catch)p.catch(rej)}catch(e){rej(e)}
 });
}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function loadAll(){
 try{
  const r=await fetch(BASE+'dizin.json');if(!r.ok)throw new Error('dizin');
  man=await r.json();
 }catch(e){state='yok';return}
 state='yukleniyor';
 /* önce sık kullanılan gruplar; her kayıt ayrı çözülür, ana iş parçacığı arada serbest kalır */
 for(const g of ['adim','arac','dovus','hayvan','dogal']){
  const info=man.grp[g];if(!info)continue;
  let bin=null;
  try{const r=await fetch(BASE+info.f);if(!r.ok)throw new Error(g);bin=await r.arrayBuffer()}catch(e){nFailed++;continue}
  for(const name in man.pool){
   for(const [gg,off,len] of man.pool[name]){
    if(gg!==g)continue;
    try{const b=await decode(bin.slice(off,off+len));(POOL[name]||(POOL[name]=[])).push(b);nLoaded++}catch(e){nFailed++}
   }
  }
  await wait(30);
 }
 for(const name in man.loop){
  try{
   const r=await fetch(BASE+man.loop[name].f);if(!r.ok)throw new Error(name);
   LOOP[name]=await decode(await r.arrayBuffer());nLoaded++;
  }catch(e){nFailed++}
  await wait(30);
 }
 state='hazir';
}
function init(x){
 if(X)return;
 X=x;
 if(!X||!X.ac())return;
 loadAll().catch(()=>{state='yok'});
}

/* ---------- çalma yardımcıları ---------- */
function pick(name){
 const a=POOL[name];if(!a||!a.length)return null;
 let i=0;
 if(a.length>1){i=(Math.random()*a.length)|0;if(i===last[name])i=(i+1+((Math.random()*(a.length-1))|0))%a.length}
 last[name]=i;return a[i];
}
/* tek kayıt: hız (perde) ve ses seviyesi hafifçe değişir, böylece tekrar fark edilmez */
function shot(dest,buf,o){
 const ac=X.ac(),s=ac.createBufferSource(),g=ac.createGain();
 s.buffer=buf;
 s.playbackRate.value=(o.rate||1)*(1+R(-1,1)*(o.r===undefined?.06:o.r));
 g.gain.value=(o.g===undefined?1:o.g)*(1+R(-1,1)*.08);
 s.connect(g);
 let n=g;
 if(o.lp){const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;g.connect(f);n=f}
 n.connect(dest);
 s.onended=()=>{try{s.disconnect();g.disconnect();if(n!==g)n.disconnect()}catch(e){}};
 s.start(ac.currentTime+(o.t||0));
}
/* programla üretilen sesi kısık bir katman olarak ekler */
function layer(dest,k,gain){
 const fn=X.K[k];if(!fn)return;
 const g=X.ac().createGain();g.gain.value=gain;g.connect(dest);fn(g);
}

/* ---------- zemin ve adımlar ---------- */
function surface(k){
 if(k==='step_water')return 'step_water';
 if(k==='step_rock')return 'step_rock';
 if(k==='step_sand')return 'step_sand';
 if(k==='step_raft')return 'step_wood';
 if(G.cave)return 'step_rock';
 if(G.sheltered)return 'step_wood';
 const h=((Math.floor(G.px)*73856093)^(Math.floor(G.py)*19349663))>>>0;
 return h%5===0?'step_dirt':'step_grass';
}

/* ---------- ses tablosu ---------- */
const VOICE={           /* tür: [havuz öneki, seviye, perde] */
 sheep:['sheep',.62,1],cow:['cow',.62,1],boar:['boar',.6,1],chicken:['chicken',.55,1],rabbit:['rabbit',.5,1],
 wolf:['wolf',.6,1],bear:['bear',.66,1],deer:['deer',.58,1],shade:['shade',.6,1]
};
const BIG={cow:1,bear:1,boar:1,deer:1};
function play(k,pos,x){
 if(!X||!X.ac())return false;
 /* adımlar */
 if(k==='step'||k==='step_rock'||k==='step_sand'||k==='step_water'||k==='step_raft'){
  const nm=surface(k),b=pick(nm);if(!b)return false;
  const run=G.sprint&&G.moving;
  shot(X.route(pos),b,{g:(nm==='step_water'?.8:nm==='step_wood'?.7:.5)*(run?1.3:1),r:.08});
  return true;
 }
 /* kaynak toplama ve inşa */
 if(k==='hit'){
  const b=pick(x===O.TREE?'chop':'hammer');if(!b)return false;
  shot(X.route(pos),b,{g:x===O.TREE?.95:.85,r:.05});return true;
 }
 if(k==='rock'||k==='ore'){
  const b=pick(k==='ore'&&x!==O.COAL?'mine_metal':'mine_stone');if(!b)return false;
  shot(X.route(pos),b,{g:.9,r:.05});return true;
 }
 if(k==='creak'){                                                   /* ağaç devrilirken çatırdar */
  const b=pick('treecrack');if(!b)return false;
  shot(X.route(pos),b,{g:.95,r:.04});return true;
 }
 if(k==='thud'){                                                    /* ağaç yere çarpar */
  const b=pick('treecrash');if(!b)return false;
  const d=X.route(pos),lf=pick('leaves');shot(d,b,{g:.95,r:.04});layer(d,'thud',.55);if(lf)shot(d,lf,{g:.5,r:.06,t:.04});return true;
 }
 if(k==='crumble'){                                                 /* kaya parçalanır */
  const b=pick('rockbreak');if(!b)return false;
  const d=X.route(pos);shot(d,b,{g:.95,r:.05});shot(d,b,{g:.7,r:.08,t:.09,rate:.8});layer(d,'crumble',.5);return true;
 }
 if(k==='pick'){                                                    /* hayvana vuruş */
  const b=pick('flesh');if(!b)return false;
  shot(X.route(pos),b,{g:.95,r:.07});return true;
 }
 if(k==='craft'){
  const b=pick('hammer'),c=pick('saw');if(!b)return false;
  const d=X.route(pos);shot(d,b,{g:.8,r:.05});shot(d,b,{g:.7,r:.05,t:.16});if(c)shot(d,c,{g:.5,t:.34});
  layer(d,'craftChime',.8);return true;
 }
 if(k==='arrowhit'){
  const b=pick(Math.random()<.7?'arrowwood':'arrowdirt');if(!b)return false;
  shot(X.route(pos),b,{g:.9,r:.06});return true;
 }
 if(k==='arrowflesh'){
  const b=pick('flesh');if(!b)return false;
  shot(X.route(pos),b,{g:1,r:.06,rate:.9});return true;
 }
 if(k==='bowfire'){
  const b=pick('arrowfly');if(!b)return false;
  const d=X.route(pos);shot(d,b,{g:.75,r:.05,t:.02});layer(d,'bowfire',.85);return true;
 }
 if(k==='clang'){
  const b=pick('shield');if(!b)return false;
  const d=X.route(pos);shot(d,b,{g:.95,r:.05});layer(d,'clang',.4);return true;
 }
 if(k==='hurt'){
  const b=pick('hurt');if(!b)return false;
  const d=X.route(pos);shot(d,b,{g:.95,r:.07});layer(d,'hurt',.45);return true;
 }
 if(k==='splash'){
  const b=pick('splash');if(!b)return false;
  const d=X.route(pos);shot(d,b,{g:.85,r:.08});layer(d,'splash',.4);return true;
 }
 if(k==='eat'||k==='drink'||k==='drip'){
  const b=pick(k);if(!b)return false;
  shot(X.route(pos),b,{g:k==='drip'?.8:.9,r:.06});return true;
 }
 if(k==='thunder'){
  const b=pick('thunder');if(!b)return false;
  shot(X.route(pos),b,{g:.95,r:.04});return true;
 }
 if(k==='bark'||k==='call_dog'){
  const b=pick('dog_bark');if(!b)return false;
  shot(X.route(pos),b,{g:.7,r:.06,rate:1.12});return true;
 }
 if(k==='cry_dog'||k==='die_dog'){
  const b=pick(k==='cry_dog'?'wolf_cry':'wolf_die');if(!b)return false;
  shot(X.route(pos),b,{g:.6,r:.05,rate:1.3});return true;
 }
 if(k==='hiss'){
  const b=pick('shade_hiss');if(!b)return false;
  const d=X.route(pos);shot(d,b,{g:.8,r:.06});layer(d,'hiss',.4);return true;
 }
 /* hayvan sesleri: call_ (çağrı), cry_ (acı), die_ (ölüm), atk_ (saldırı) */
 const m=/^(call|cry|die|atk)_(\w+)$/.exec(k);
 if(m){
  const v=VOICE[m[2]];if(!v)return false;
  let nm,rate=v[2];
  if(m[1]==='atk'){
   nm=m[2]==='wolf'?'wolf_call':v[0]+'_cry';
   if(m[2]==='wolf'){const b=pick('wolf_call');if(!b)return false;shot(X.route(pos),b,{g:v[1],r:.05,rate:.95});return true}
  }else if(m[2]==='wolf'&&m[1]==='call')return false;          /* ulumanın gerçek kaydı yok: programla üretilen ulama çalar */
  else nm=v[0]+'_'+m[1];
  const b=pick(nm);if(!b)return false;
  const d=X.route(pos);
  shot(d,b,{g:v[1],r:.07,rate});
  if(m[1]==='die'&&BIG[m[2]])layer(d,'thud',.45);
  if(m[2]==='shade'&&m[1]==='call')layer(d,'whisper',.35);
  return true;
 }
 return false;
}

/* ---------- döngüsel ortam sesleri ---------- */
const beds={};
function bed(name,detune){
 if(beds[name])return beds[name];
 const buf=LOOP[name];if(!buf)return null;
 const ac=X.ac(),s=ac.createBufferSource(),g=ac.createGain(),f=ac.createBiquadFilter();
 s.buffer=buf;s.loop=true;
 s.playbackRate.value=1+(detune||0);
 f.type='lowpass';f.frequency.value=20000;g.gain.value=0;
 s.connect(f);f.connect(g);g.connect(X.amb());
 s.start(0,Math.random()*buf.duration);
 return beds[name]={s,g,f};
}
let fireB=null;
function fireBeds(){
 if(fireB)return fireB;
 if(!LOOP.ates1||!LOOP.ates2||!LOOP.ates3||!X.fire())return null;
 const ac=X.ac(),g=ac.createGain();g.gain.value=0;g.connect(X.fire().pn);
 const src=[];
 [['ates1',1],['ates2',.97],['ates3',1.03]].forEach(([n,r])=>{
  const s=ac.createBufferSource();s.buffer=LOOP[n];s.loop=true;s.playbackRate.value=r;s.connect(g);s.start(0,Math.random()*LOOP[n].duration);src.push(s);
 });
 return fireB={g,src};
}
const setG=(b,v,tau)=>{if(b)X.tc(b.g.gain,v,tau||.8)};

/* ---------- müzik ---------- */
const TRACKS={gun:['muzik-gun1.mp3','muzik-gun2.mp3','muzik-gun3.mp3'],gece:['muzik-gece1.mp3','muzik-gece2.mp3']};
const mu={el:null,node:null,g:null,ok:false,dead:false,playing:false,wait:2,last:'',fading:false};
function musicInit(){
 if(mu.el||mu.dead)return;
 try{
  const ac=X.ac(),el=new Audio();
  el.preload='none';el.loop=false;
  el.addEventListener('ended',()=>{mu.playing=false;mu.wait=R(50,140)});
  el.addEventListener('playing',()=>{mu.ok=true});
  el.addEventListener('error',()=>{if(mu.playing||mu.el){mu.playing=false;mu.dead=!mu.ok;mu.wait=R(60,120)}});
  mu.node=ac.createMediaElementSource(el);
  mu.g=ac.createGain();mu.g.gain.value=0;mu.node.connect(mu.g);mu.g.connect(X.mus());
  mu.el=el;
  document.addEventListener('visibilitychange',()=>{
   if(!mu.el||!mu.playing)return;
   try{if(document.hidden)mu.el.pause();else mu.el.play()}catch(e){}
  });
 }catch(e){mu.dead=true}
}
function musicFrame(e){
 if(mu.dead)return;
 const want=HG.cfg.mus>0&&!ui.mute&&(e.mode==='menu'||e.mode==='play');
 const tense=e.play&&(e.low||e.fear>.28||e.ins>.55);
 if(!mu.el){if(want)musicInit();return}
 if(mu.playing){
  const stop=!want||tense||(e.play&&e.rain>.85);
  if(stop&&!mu.fading){mu.fading=true;X.tc(mu.g.gain,0,.8);setTimeout(()=>{if(mu.fading){try{mu.el.pause()}catch(er){}mu.playing=false;mu.fading=false;mu.wait=R(40,90)}},2600)}
  else if(!stop&&mu.fading){mu.fading=false;X.tc(mu.g.gain,.9,.8)}
  return;
 }
 mu.wait-=e.dt;
 if(mu.wait>0||!want||tense)return;
 const night=e.L<.4&&e.mode==='play';
 const list=TRACKS[night?'gece':'gun'].filter(f=>f!==mu.last);
 const f=e.mode==='menu'?TRACKS.gun[1]:list[(Math.random()*list.length)|0];
 mu.last=f;
 try{
  mu.el.src=BASE+f;mu.el.currentTime=0;
  const p=mu.el.play();
  if(p&&p.then)p.then(()=>{mu.playing=true;mu.fading=false;X.tc(mu.g.gain,.9,.5)},()=>{mu.wait=15});
  else{mu.playing=true;X.tc(mu.g.gain,.9,.5)}
 }catch(er){mu.wait=20}
}

/* ---------- kare güncellemesi (ses.js her karede çağırır) ---------- */
function frame(e){
 if(!X||state==='yok')return;
 /* müzik, ortam sesleri çözülmeden de başlayabilir */
 try{musicFrame(e)}catch(er){}
 if(mu.ok&&HG.cfg.mus>0){const p=X.pad();if(p)X.tc(p.g.gain,0,1.2)}
 const t=e.t,sh=e.sh?1:0;
 /* rüzgâr */
 const wd=clamp(.25+e.wind*1.1,0,1);
 let b=bed('ruzgar');
 if(b){
  setG(b,.9*wd*e.open*(sh?.4:1),.7);
  X.tc(X.bed.wind.g.gain,0,.3);
 }
 b=bed('firtina');
 if(b)setG(b,1.0*clamp((e.wind-.5)*2.2,0,1)*(sh?.4:1),.9);
 b=bed('yaprak');
 if(b){setG(b,.95*e.forest*(.35+e.wind)*(sh?.4:1),.8);X.tc(X.bed.leaf.g.gain,0,.3)}
 /* deniz */
 const sw=e.swell;
 b=bed('dalga');
 if(b){setG(b,.95*e.sea*(.65+.35*sw),.6);X.tc(X.bed.sea.g.gain,0,.3)}
 b=bed('kiyi');
 if(b){setG(b,.85*e.sea*e.sea*(.4+.6*sw),.5);X.tc(X.bed.foam.g.gain,0,.3)}
 b=bed('kayalik');
 if(b)setG(b,.55*e.sea*(.5+.5*Math.sin(t*.043)),1);
 /* yağmur: barınakta çatıya düşen boğuk ses */
 const rv=e.rain*(e.play?1:.6);
 b=bed('yagmur');
 if(b){
  setG(b,.95*rv*(sh?.7:1),.9);
  X.tc(b.f.frequency,sh?1000:16000,.5);
  X.tc(X.bed.rain.g.gain,0,.3);
 }
 b=bed('yagmur2');
 if(b){setG(b,.95*clamp((e.rain-.5)*2,0,1)*(sh?.7:1),.9);X.tc(b.f.frequency,sh?1000:16000,.5)}
 /* gündüz kuşları */
 const bf=clamp(e.L*1.3-.3,0,1)*clamp(1-e.rain*1.6,0,1)*(.35+.65*e.forest)*(1-.85*e.sea)*(sh?.25:1)*clamp(1-e.fear*2,0,1)*(e.cave?0:1);
 b=bed('kus');if(b)setG(b,.9*bf*(.5+.5*Math.sin(t*.021)),2.5);
 b=bed('kus2');if(b)setG(b,.9*bf*(.5+.5*Math.sin(t*.017+2)),2.5);
 b=bed('kus3');if(b)setG(b,.65*bf,2.5);
 /* ateş */
 const fb=fireBeds();
 if(fb){
  const on=e.fd<26;
  X.tc(fb.g.gain,on?.8*(.85+.15*Math.sin(t*3.1)):0,on?.3:.5);
  X.tc(X.fire().crackle.gain,0,.2);X.tc(X.fire().roar.gain,0,.2);
 }
}

HG.sesGercek={
 init,play,frame,
 has:n=>!!LOOP[n]||!!POOL[n],
 muzikOk:()=>mu.ok&&HG.cfg.mus>0,
 durum:()=>({state,nLoaded,nFailed,havuz:Object.keys(POOL).length,dongu:Object.keys(LOOP).length,muzik:{ok:mu.ok,dead:mu.dead,playing:mu.playing,last:mu.last}})
};
})();
