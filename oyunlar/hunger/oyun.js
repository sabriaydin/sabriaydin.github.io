/* Hunger 3D - oyun mantığı, arayüz ve giriş */
(()=>{
'use strict';
const $=s=>document.querySelector(s);
const {TS,W,H,DAY,REACH,SLOTS,HOT,T,O,SAVE,clamp,smooth,IT,PLACE_ITEM,STN,RC,POWER,NODE,SOLID,genWorld,ICON}=HG;
const Scene=HG.Scene;
const cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
/* ---------- Durum ---------- */
let G=null,state='menu',menuClock=0,mute=false,picked=null,dirty=true,recT=0;
let rotJoy=0;
const keys={},mouse={sx:0,sy:0,wx:0,wy:0,active:false,t:0,down:false},joy={x:0,y:0},touch={act:false};
const A={key:'',p:0,need:1,tick:0,hitI:-1,hitT:0};
const cvs=$('#c');
let miniBase=null;

function newState(seed){
 const w=genWorld(seed);
 return {seed,tile:w.tile,obj:w.obj,shore:w.shore,px:w.sx,py:w.sy,ang:0,fx:0,fy:1,objDirty:true,
  hp:100,hun:92,thr:92,warm:100,clock:0,inv:Array(SLOTS).fill(null),sel:0,flags:{},timers:[],
  sheltered:false,shelterCheck:0,shelterT:0,moving:false,walk:0,nearFire:false,cause:'',lastGoal:0,saveT:0,sprint:false};
}
function buildMini(){
 const c=cv(W,H),g=c.getContext('2d'),im=g.createImageData(W,H);
 const col={0:[16,48,80],1:[40,110,150],2:[214,196,140],3:[62,122,58],4:[108,104,98],5:[52,150,184]};
 for(let i=0;i<W*H;i++){const c2=col[G.tile[i]];im.data[i*4]=c2[0];im.data[i*4+1]=c2[1];im.data[i*4+2]=c2[2];im.data[i*4+3]=255}
 g.putImageData(im,0,0);miniBase=c;
}
function startGame(load){
 let s=null;
 if(load){try{s=JSON.parse(localStorage.getItem(SAVE))}catch(e){}}
 if(s&&s.v===1){
  G=newState(s.seed);
  try{
   const b=atob(s.obj);if(b.length===W*H){for(let i=0;i<b.length;i++){let o=b.charCodeAt(i);if(o===O.BUSH0)o=O.BUSH;if(o===O.PALM0)o=O.PALM;G.obj[i]=o}}
  }catch(e){}
  Object.assign(G,{px:s.px,py:s.py,hp:s.hp,hun:s.hun,thr:s.thr,warm:s.warm,clock:s.clock,inv:s.inv,sel:s.sel||0,flags:s.flags||{}});
  if(!Array.isArray(G.inv)||G.inv.length!==SLOTS)G.inv=Array(SLOTS).fill(null);
 }else{
  G=newState((Math.random()*2147483647)|0);
 }
 buildMini();
 Scene.build(G);Scene.setMode('play');
 state='play';picked=null;dirty=true;A.key='';A.p=0;
 for(const id of ['#menu','#dead','#pause'])$(id).hidden=true;
 for(const id of ['#hud','#clock','#goal','#mini','#hot'])$(id).hidden=false;
 if(matchMedia('(pointer:coarse)').matches)$('#touch').hidden=false;
 if(!load)toast('Adaya vardın. Ağaca yaklaş, sol tuşu basılı tutarak odun topla.');
 save();
}
function saveExists(){try{const s=JSON.parse(localStorage.getItem(SAVE));return !!(s&&s.v===1)}catch(e){return false}}
function save(){
 if(!G||state==='dead')return;
 try{
  let s='';const o=G.obj;for(let i=0;i<o.length;i++)s+=String.fromCharCode(o[i]);
  localStorage.setItem(SAVE,JSON.stringify({v:1,seed:G.seed,px:G.px,py:G.py,hp:G.hp,hun:G.hun,thr:G.thr,warm:G.warm,clock:G.clock,inv:G.inv,sel:G.sel,flags:G.flags,obj:btoa(s)}));
 }catch(e){}
}

/* ---------- Zaman ---------- */
function tod(){return (G.clock/DAY+.30)%1}
function daylight(){const s=Math.sin((tod()-.25)*Math.PI*2);return smooth(-.45,.35,s)}
function dayNo(){return Math.floor(G.clock/DAY+.30)+1}

/* ---------- Envanter ---------- */
function count(id){let n=0;for(const s of G.inv)if(s&&s.id===id)n+=s.n;return n}
function canAdd(id,n){
 const mx=IT[id].s;let room=0;
 for(const s of G.inv){if(!s)room+=mx;else if(s.id===id)room+=mx-s.n;if(room>=n)return true}
 return room>=n;
}
function add(id,n){
 const mx=IT[id].s;
 for(const s of G.inv){if(n<=0)break;if(s&&s.id===id&&s.n<mx){const k=Math.min(mx-s.n,n);s.n+=k;n-=k}}
 for(let i=0;i<SLOTS&&n>0;i++){if(!G.inv[i]){const k=Math.min(mx,n);G.inv[i]={id,n:k};n-=k}}
 dirty=true;return n;
}
function take(id,n){
 for(let i=SLOTS-1;i>=0&&n>0;i--){const s=G.inv[i];if(s&&s.id===id){const k=Math.min(s.n,n);s.n-=k;n-=k;if(s.n<=0)G.inv[i]=null}}
 dirty=true;
}
function gain(id,n){
 if(!canAdd(id,n)){toast('Envanter dolu.');return false}
 add(id,n);flag('got_'+id);feed('+'+n+' '+IT[id].n);snd('get');return true;
}
function held(){const s=G.inv[G.sel];return s?{k:s.id,it:IT[s.id],s}:null}
function setObj(i,v){G.obj[i]=v;G.objDirty=true}
function flag(f){if(!G.flags[f]){G.flags[f]=1}}

/* ---------- Üretim ---------- */
function nearObj(code,r){
 const x0=Math.floor(G.px),y0=Math.floor(G.py);
 for(let y=y0-4;y<=y0+4;y++)for(let x=x0-4;x<=x0+4;x++){
  if(x<0||y<0||x>=W||y>=H)continue;
  if(G.obj[y*W+x]===code&&Math.hypot(x+.5-G.px,y+.5-G.py)<=r)return true;
 }
 return false;
}
const STC={fire:O.FIRE,bench:O.BENCH,furn:O.FURN};
function canCraft(r){
 for(const k in r[2])if(count(k)<r[2][k])return 0;
 if(r[3]&&!nearObj(STC[r[3]],3.6))return -1;
 return 1;
}
function craft(i){
 const r=RC[i];if(!r||canCraft(r)!==1)return;
 const snap=JSON.stringify(G.inv);
 for(const k in r[2])take(k,r[2][k]);
 if(!canAdd(r[0],r[1])){G.inv=JSON.parse(snap);toast('Envanter dolu.');return}
 add(r[0],r[1]);flag('made_'+r[0]);feed('Üretildi: '+IT[r[0]].n+(r[1]>1?' ×'+r[1]:''));snd('craft');dirty=true;
}

/* ---------- Kullanma / yerleştirme ---------- */
function useHeld(){
 const h=held();if(!h)return;
 if(h.it.food){
  const f=h.it.food;
  if(f.h>0&&G.hun>=99&&!(f.t>0&&G.thr<99)){toast('Zaten tok.');return}
  if(f.t>0&&f.h===0&&G.thr>=99){toast('Susuzluk yok.');return}
  G.hun=clamp(G.hun+f.h,0,100);G.thr=clamp(G.thr+f.t,0,100);
  if(f.hp){G.hp=clamp(G.hp+f.hp,0,100);G.cause='Bozuk balık yedin.';snd('hurt');toast('Çiğ balık midene dokundu.')}
  take(h.k,1);if(f.ret)add(f.ret,1);
  snd('eat');return;
 }
 if(h.it.place){placeHeld();return}
}
function placeHeld(){
 const h=held();if(!h||!h.it.place)return false;
 const tg=target();if(!tg){return false}
 if(!tg.ok){toast('Çok uzak.');return false}
 const i=tg.y*W+tg.x,t=G.tile[i];
 if(G.obj[i]||t<T.SAND||t===T.POND){toast('Buraya yerleştirilemez.');return false}
 if(Math.floor(G.px)===tg.x&&Math.floor(G.py)===tg.y&&h.it.place!==O.DOOR){toast('Önce kenara çekilin.');return false}
 setObj(i,h.it.place);take(h.k,1);flag('placed_'+h.k);snd('craft');dirty=true;G.shelterCheck=0;
 return true;
}
function onActPress(){
 if(state!=='play')return;
 const h=held();
 if(h&&h.it.place){const tg=target();if(tg&&tg.ok){const i=tg.y*W+tg.x;if(!G.obj[i]){placeHeld();return}}}
}

/* ---------- Hedef ve eylem ---------- */
function target(){
 let x,y;
 if(mouse.active&&performance.now()-mouse.t<4000){x=Math.floor(mouse.wx);y=Math.floor(mouse.wy)}
 else{x=Math.floor(G.px+G.fx*1.05);y=Math.floor(G.py+G.fy*1.05)}
 if(x<0||y<0||x>=W||y>=H)return null;
 return {x,y,ok:Math.hypot(x+.5-G.px,y+.5-G.py)<=REACH};
}
let lastMsg=0;
function msgOnce(m){const n=performance.now();if(n-lastMsg>1800){toast(m);lastMsg=n}}
function toolTier(kind){const h=held();return h&&h.it.tool===kind?h.it.tier:0}
function stepAction(dt){
 const tg=target();
 if(!tg||!tg.ok){A.key='';A.p=0;return}
 const i=tg.y*W+tg.x,o=G.obj[i],tl=G.tile[i],h=held();
 let kind=null,need=1,pow=1;
 if(o){
  const nd=NODE[o];
  if(nd){
   const tier=nd.tool?toolTier(nd.tool):0;
   if(tier<nd.req){msgOnce(nd.msg||'Daha iyi bir alet gerekir.');A.key='';return}
   kind='node';need=nd.hp/(nd.tool?POWER[tier]:1);
  }else if(PLACE_ITEM[o]){kind='pickup';need=1}
 }else{
  const water=tl<=T.SHAL||tl===T.POND;
  if(tl===T.POND){
   if(h&&h.k==='rod')kind='fish';
   else if(h&&h.k==='bottle'){kind='fill';need=.8}
   else{kind='drink';need=.65}
  }else if(water){
   if(h&&h.k==='rod')kind='fish';else{msgOnce('Deniz suyu tuzludur, içilemez.');A.key='';return}
  }else if(tl===T.SAND){kind='dig';need=.9}
 }
 if(!kind){A.key='';A.p=0;return}
 const key=kind+','+tg.x+','+tg.y;
 if(key!==A.key){A.key=key;A.p=0;A.need=kind==='fish'?3+Math.random()*4:need;A.tick=0}
 A.p+=dt;A.tick-=dt;
 if(A.tick<=0&&kind!=='drink'&&kind!=='fish'&&kind!=='fill'){
  A.tick=.38;A.hitI=i;A.hitT=.18;snd(o&&(o===O.TREE||o===O.PALM||o===O.BUSH)?'hit':'pick');
  Scene.burst(tg.x+.5,1.0,tg.y+.5,o===O.TREE||o===O.BUSH?0x4a9440:o===O.PALM?0x3f8a3a:tl===T.SAND?0xd9c58b:0x9a9a9a,4);
 }
 if(A.p<A.need)return;
 A.p=0;
 if(kind==='node'){
  const nd=NODE[o],[id,n]=nd.give();
  if(!gain(id,n))return;
  setObj(i,nd.rm);G.shelterCheck=0;
  if(nd.regrow)G.timers.push({i,at:G.clock+nd.regrow[1]*(.8+Math.random()*.4),to:nd.regrow[0],from:nd.rm});
  A.key='';
 }else if(kind==='pickup'){
  const id=PLACE_ITEM[o];if(!gain(id,1))return;setObj(i,O.NONE);G.shelterCheck=0;A.key='';
 }else if(kind==='drink'){
  G.thr=clamp(G.thr+14,0,100);flag('drank');snd('drink');
  if(G.thr>=100){toast('Susuzluk giderildi.');A.key=''}
 }else if(kind==='fill'){
  if(count('bottle')){take('bottle',1);add('wbottle',1);flag('drank');snd('drink');feed('Şişe dolduruldu')}
  A.key='';
 }else if(kind==='fish'){
  if(Math.random()<.78)gain('fish',1);else{toast('Balık kaçtı.')}
  A.need=3+Math.random()*4;
 }else if(kind==='dig'){
  gain('sand',1);
 }
}

/* ---------- Barınak ---------- */
function calcShelter(){
 const sx=Math.floor(G.px),sy=Math.floor(G.py),start=sy*W+sx,seen=new Set([start]),q=[start];
 while(q.length){
  const c=q.pop(),x=c%W,y=(c/W)|0;
  for(let d=0;d<4;d++){
   const nx=x+(d===0?1:d===1?-1:0),ny=y+(d===2?1:d===3?-1:0);
   if(nx<0||ny<0||nx>=W||ny>=H)return false;
   const ni=ny*W+nx;if(seen.has(ni)||G.obj[ni])continue;
   seen.add(ni);if(seen.size>40)return false;q.push(ni);
  }
 }
 return true;
}

/* ---------- Güncelleme ---------- */
function solidAt(x,y){
 if(x<0||y<0||x>=W||y>=H)return true;
 const i=y*W+x,t=G.tile[i];
 return t===T.DEEP||t===T.POND||SOLID(G.obj[i]);
}
function canStand(x,y){const r=.27;return !(solidAt(Math.floor(x-r),Math.floor(y-r))||solidAt(Math.floor(x+r),Math.floor(y-r))||solidAt(Math.floor(x-r),Math.floor(y+r))||solidAt(Math.floor(x+r),Math.floor(y+r)))}
function update(dt){
 G.clock+=dt;
 /* hareket */
 let ix=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+joy.x;
 let iz=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0)+joy.y;
 const rotk=(keys.KeyE?1:0)-(keys.KeyQ?1:0)+rotJoy;if(rotk)Scene.rot(rotk*dt*1.8);
 const m=Math.hypot(ix,iz);
 G.moving=m>.15;G.sprint=false;
 if(G.moving){
  ix/=Math.max(m,1);iz/=Math.max(m,1);
  const yw=Scene.yaw(),sy=Math.sin(yw),cy=Math.cos(yw);
  const vx=ix*cy+iz*sy,vy=-ix*sy+iz*cy;
  const l=Math.hypot(vx,vy)||1;G.fx=vx/l;G.fy=vy/l;
  const tl=G.tile[Math.floor(G.py)*W+Math.floor(G.px)];
  G.sprint=!!(keys.ShiftLeft||keys.ShiftRight)&&G.hun>5;
  let sp=(G.sprint?5.2:3.4)*(tl===T.SHAL?.55:1)*Math.min(1,m);
  const nx=G.px+vx*sp*dt;if(canStand(nx,G.py))G.px=nx;
  const ny=G.py+vy*sp*dt;if(canStand(G.px,ny))G.py=ny;
  G.walk+=dt*(G.sprint?1.5:1);
 }
 /* eylem */
 if(mouse.down||keys.Space||touch.act)stepAction(dt);else{A.key='';A.p=0}
 if(A.hitT>0)A.hitT-=dt;
 /* barınak */
 G.shelterCheck-=dt;
 if(G.shelterCheck<=0){G.shelterCheck=.4;G.sheltered=calcShelter()}
 /* istatistikler */
 const L=daylight(),cold=1-L;
 G.hun=clamp(G.hun-dt*.17*(G.sprint?1.8:1),0,100);
 G.thr=clamp(G.thr-dt*.25*(G.sprint?1.8:1),0,100);
 let fd=99;
 {const x0=Math.floor(G.px),y0=Math.floor(G.py);
  for(let y=y0-5;y<=y0+5;y++)for(let x=x0-5;x<=x0+5;x++){
   if(x<0||y<0||x>=W||y>=H)continue;
   const o=G.obj[y*W+x];if(o===O.FIRE){const d=Math.hypot(x+.5-G.px,y+.5-G.py);if(d<fd)fd=d}
  }}
 G.nearFire=fd<=4;
 let wr=-(cold*.62+.04);
 if(G.tile[Math.floor(G.py)*W+Math.floor(G.px)]===T.SHAL)wr-=.45;
 if(G.sheltered)wr*=.25;
 if(G.nearFire)wr+=3.4*(1-fd/4.6);
 if(L>.55&&!G.sheltered)wr+=.55*L;
 if(G.sheltered&&L>.4)wr+=.3;
 G.warm=clamp(G.warm+wr*dt,0,100);
 if(G.sheltered&&L<.3){G.shelterT+=dt;if(G.shelterT>8)flag('shelter')}
 let dmg=0;
 if(G.hun<=0){dmg+=1.2;G.cause='Açlıktan öldün.'}
 if(G.thr<=0){dmg+=1.8;G.cause='Susuzluktan öldün.'}
 if(G.warm<=0){dmg+=1.5;G.cause='Soğuktan donarak öldün.'}
 if(dmg>0)G.hp-=dmg*dt;
 else if(G.hun>35&&G.thr>35&&G.warm>35)G.hp=clamp(G.hp+.8*dt,0,100);
 if(G.hp<=0){die();return}
 /* yeniden büyüme */
 for(let k=G.timers.length-1;k>=0;k--){const t=G.timers[k];if(G.clock>=t.at){if(G.obj[t.i]===t.from)setObj(t.i,t.to);G.timers.splice(k,1)}}
 if(dayNo()>=7)flag('day7');
 /* kaydet */
 G.saveT+=dt;if(G.saveT>20){G.saveT=0;save()}
}
function die(){
 state='dead';
 try{localStorage.removeItem(SAVE)}catch(e){}
 $('#why').textContent=G.cause||'Hayatta kalamadın.';
 $('#stat').textContent=dayNo()+'. güne kadar dayandın.';
 $('#dead').hidden=false;$('#panel').hidden=true;
 for(const k in keys)keys[k]=false;mouse.down=false;touch.act=false;
}

/* ---------- Hedefler ---------- */
const GOALS=[
 ['got_wood','Bir ağaca yaklaş ve sol tuşu basılı tutarak odun topla.'],
 ['got_stone','Yerdeki gri kayalardan taş topla.'],
 ['made_axe1','C tuşuyla üretim panelini aç ve Taş Balta üret.'],
 ['made_pick1','Taş Kazma üret. Kömür ve bakır ancak bununla çıkarılır.'],
 ['placed_fire','Kamp Ateşi üret ve yerleştir (F veya sağ tık). Gece ısıtır.'],
 ['drank','Mavi tatlı su gölüne bakıp sol tuşla su iç. Deniz suyu içilmez.'],
 ['made_bench','Çalışma Tezgâhı üret ve yerleştir.'],
 ['shelter','Duvar ve kapıyla tamamen kapalı bir barınak yap, geceyi içinde geçir.'],
 ['made_copper_ingot','Ocak yap; bakır cevherini kömürle eriterek külçe üret.'],
 ['made_pick2','Bakır Kazma üret. Demir damarları ancak bununla çıkarılır.'],
 ['made_pick3','Demir cevherini eritip Demir Kazma üret.'],
 ['day7','7. güne kadar hayatta kal.']
];
function goalText(){
 let done=0;for(const g of GOALS)if(G.flags[g[0]])done++;
 const g=GOALS.find(x=>!G.flags[x[0]]);
 return g?`<b>Hedef ${done+1}/${GOALS.length}:</b> ${g[1]}`:'Tüm hedefler tamamlandı. Hayatta kalmaya devam et.';
}

/* ---------- Ses ---------- */
let AC=null;
function tone(f,d,type,v,f2){
 if(mute||!AC)return;
 try{
  const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;
  o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g).connect(AC.destination);o.start(t);o.stop(t+d);
 }catch(e){}
}
function noise(d,v,fc){
 if(mute||!AC)return;
 try{
  const n=Math.floor(AC.sampleRate*d),b=AC.createBuffer(1,n,AC.sampleRate),a=b.getChannelData(0);
  for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*Math.pow(1-i/n,2);
  const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();
  s.buffer=b;f.type='lowpass';f.frequency.value=fc;g.gain.value=v;s.connect(f).connect(g).connect(AC.destination);s.start();
 }catch(e){}
}
function snd(k){
 if(k==='hit')noise(.09,.35,700);else if(k==='pick'){tone(520,.07,'square',.06,260);noise(.05,.15,2500)}
 else if(k==='get')tone(660,.12,'sine',.12,1100);else if(k==='drink')tone(300,.16,'sine',.12,520);
 else if(k==='eat')noise(.12,.3,1200);else if(k==='craft'){tone(440,.08,'triangle',.14);setTimeout(()=>tone(660,.12,'triangle',.14),70)}
 else if(k==='hurt')tone(180,.2,'sawtooth',.1,90);
}
function initAudio(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume()}

/* ---------- Arayüz ---------- */
let toastT=0;
function toast(m){const e=$('#toast');e.textContent=m;e.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove('on'),2400)}
function feed(m){const f=$('#feed'),d=document.createElement('div');d.textContent=m;f.appendChild(d);setTimeout(()=>d.remove(),2800);while(f.children.length>5)f.firstChild.remove()}
const slotHtml=(i,hot)=>{
 const s=G.inv[i],it=s?IT[s.id]:null;
 return `<div class="slot${i===G.sel&&i<HOT?' sel':''}${picked===i?' pick':''}" data-i="${i}"${it?` title="${it.n}"`:''}>${hot?`<span class="k">${i+1}</span>`:''}${it?`<img src="${ICON[s.id]}" alt="${it.n}">${s.n>1?`<span class="n">${s.n}</span>`:''}`:''}</div>`;
};
function renderInv(){
 let h='';for(let i=0;i<HOT;i++)h+=slotHtml(i,true);
 $('#hot').innerHTML=h;
 if(!$('#panel').hidden){
  let gh='';for(let i=0;i<SLOTS;i++)gh+=slotHtml(i,i<HOT);
  $('#grid').innerHTML=gh;
 }
 dirty=false;
}
function renderRecipes(){
 let h='';
 RC.forEach((r,i)=>{
  const st=canCraft(r),it=IT[r[0]];
  const need=Object.keys(r[2]).map(k=>{const have=count(k),ok=have>=r[2][k];return `<span class="${ok?'ok':'no'}">${IT[k].n} ${have}/${r[2][k]}</span>`}).join(' · ');
  h+=`<div class="rc${st===-1?' lock':''}"><img src="${ICON[r[0]]}" alt=""><div><b>${it.n}${r[1]>1?' ×'+r[1]:''}</b>${need}${r[3]?`<br><span class="${st===-1?'no':'ok'}">Gerekli: ${STN[r[3]]} yakını</span>`:''}${it.d?`<br><span>${it.d}</span>`:''}</div><button type="button" data-r="${i}"${st===1?'':' disabled'}>Üret</button></div>`;
 });
 $('#recipes').innerHTML=h;
}
function togglePanel(force){
 if(state!=='play')return;
 const p=$('#panel'),open=force!==undefined?force:p.hidden;
 p.hidden=!open;picked=null;
 if(open){renderInv();renderRecipes();recT=0}else dirty=true;
}
const hudCache={};
function setBar(id,v){const k=Math.round(v);if(hudCache[id]===k)return;hudCache[id]=k;const e=$(id);e.querySelector('b').style.width=k+'%';e.classList.toggle('low',v<25)}
function hud(){
 setBar('#bHp',G.hp);setBar('#bHun',G.hun);setBar('#bThr',G.thr);setBar('#bWar',G.warm);
 const hh=Math.floor(tod()*24),mm=Math.floor((tod()*24-hh)*60),L=daylight();
 const ck=`${L>.45?'☀':'☾'} Gün ${dayNo()} · ${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
 if(hudCache.ck!==ck){hudCache.ck=ck;$('#clock').textContent=ck}
 const sh=G.sheltered?'Barınakta: soğuk azalır':G.nearFire?'Ateşin yanında: ısınıyorsun':'';
 if(hudCache.sh!==sh){hudCache.sh=sh;$('#shel').textContent=sh}
 const gt=goalText();if(hudCache.gt!==gt){hudCache.gt=gt;$('#goal').innerHTML=gt}
 $('#vr').style.opacity=clamp((35-G.hp)/35,0,.85);
 $('#vc').style.opacity=clamp((30-G.warm)/30,0,.8);
 /* mini harita */
 const m=$('#mini').getContext('2d');m.imageSmoothingEnabled=false;
 m.drawImage(miniBase,0,0);m.fillStyle='#d9463c';m.fillRect(G.px-2,G.py-2,4,4);m.strokeStyle='#fff';m.lineWidth=1;m.strokeRect(G.px-2.5,G.py-2.5,5,5);
}

/* ---------- Giriş ---------- */
function setupInput(){
 addEventListener('keydown',e=>{
  initAudio();
  if(e.code==='Tab'||e.code==='Space'||e.code.startsWith('Arrow'))e.preventDefault();
  if(e.repeat)return;
  keys[e.code]=true;
  if(state==='menu')return;
  if(e.code==='Escape'){
   if(state==='dead')return;
   if(!$('#panel').hidden){togglePanel(false);return}
   if(state==='play'){state='pause';$('#pause').hidden=false}else if(state==='pause'){state='play';$('#pause').hidden=true}
   return;
  }
  if(state!=='play')return;
  if(e.code==='KeyI'||e.code==='KeyC'||e.code==='Tab')togglePanel();
  else if(e.code==='KeyE')useHeld();
  else if(e.code==='KeyF')placeHeld();
  else if(e.code==='Space')onActPress();
  else if(e.code==='KeyM'){mute=!mute;toast(mute?'Ses kapalı.':'Ses açık.')}
  else if(/^Digit[1-8]$/.test(e.code)){G.sel=+e.code.slice(5)-1;dirty=true}
 });
 addEventListener('keyup',e=>{keys[e.code]=false});
 addEventListener('blur',()=>{for(const k in keys)keys[k]=false;mouse.down=false;touch.act=false});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='play'){save()}});
 addEventListener('beforeunload',save);
 const mpos=e=>{const r=cvs.getBoundingClientRect();mouse.sx=e.clientX-r.left;mouse.sy=e.clientY-r.top;mouse.active=true;mouse.t=performance.now();updMouse()};
 let rotDrag=false,lastX=0;
 cvs.addEventListener('pointermove',e=>{
  if(rotDrag){Scene.rot((e.clientX-lastX)*.006);lastX=e.clientX;return}
  if(e.pointerType==='mouse'||mouse.down)mpos(e);
 });
 cvs.addEventListener('pointerdown',e=>{
  initAudio();if(state!=='play')return;
  if(e.button===1){e.preventDefault();rotDrag=true;lastX=e.clientX;cvs.setPointerCapture&&cvs.setPointerCapture(e.pointerId);return}
  mpos(e);
  if(e.button===2){useHeld();return}
  mouse.down=true;onActPress();cvs.setPointerCapture&&cvs.setPointerCapture(e.pointerId);
 });
 const up=()=>{mouse.down=false;rotDrag=false};
 cvs.addEventListener('pointerup',up);cvs.addEventListener('pointercancel',up);
 cvs.addEventListener('contextmenu',e=>e.preventDefault());
 cvs.addEventListener('wheel',e=>{e.preventDefault();Scene.zoom(e.deltaY>0?1:-1)},{passive:false});
 /* envanter tıklamaları */
 const clickSlot=i=>{
  if(!$('#panel').hidden){
   if(picked===null){if(G.inv[i])picked=i}
   else{
    const a=G.inv[picked],b=G.inv[i];
    if(picked!==i){
     if(a&&b&&a.id===b.id&&IT[a.id].s>1){const k=Math.min(IT[a.id].s-b.n,a.n);b.n+=k;a.n-=k;if(a.n<=0)G.inv[picked]=null}
     else{G.inv[picked]=b;G.inv[i]=a}
    }
    picked=null;
   }
   if(i<HOT&&G.inv[i])G.sel=i;
  }else if(i<HOT)G.sel=i;
  dirty=true;
 };
 for(const sel of ['#grid','#hot']){
  const el=$(sel);
  el.addEventListener('click',e=>{const s=e.target.closest('.slot');if(s)clickSlot(+s.dataset.i)});
  el.addEventListener('contextmenu',e=>{e.preventDefault();const s=e.target.closest('.slot');if(s){const i=+s.dataset.i;if(i<HOT){G.sel=i;useHeld()}else if(G.inv[i]&&G.inv[i].id&&IT[G.inv[i].id].food){const o=G.sel;G.sel=i;const sv=G.inv[i];useHeld();G.sel=o}dirty=true}});
  el.addEventListener('mouseover',e=>{const s=e.target.closest('.slot');if(!s)return;const v=G.inv[+s.dataset.i];if(sel==='#grid')$('#info').innerHTML=v?`<b>${IT[v.id].n}</b>${IT[v.id].d?'<br>'+IT[v.id].d:''}`:''});
 }
 $('#recipes').addEventListener('click',e=>{const b=e.target.closest('button[data-r]');if(b){craft(+b.dataset.r);renderRecipes()}});
 $('#close').onclick=()=>togglePanel(false);
 $('#panel').addEventListener('pointerdown',e=>{if(e.target===$('#panel'))togglePanel(false)});
 /* menüler */
 $('#bNew').onclick=()=>{initAudio();startGame(false)};
 $('#bCont').onclick=()=>{initAudio();startGame(true)};
 $('#bAgain').onclick=()=>startGame(false);
 $('#bRes').onclick=()=>{state='play';$('#pause').hidden=true};
 $('#bMenu').onclick=()=>{save();location.reload()};
 /* dokunmatik */
 const joyEl=$('#joy'),knob=joyEl.querySelector('i');let jid=null;
 const jset=e=>{
  const r=joyEl.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  let dx=(e.clientX-cx)/(r.width/2),dy=(e.clientY-cy)/(r.height/2);const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m}
  joy.x=Math.abs(dx)<.15?0:dx;joy.y=Math.abs(dy)<.15?0:dy;knob.style.transform=`translate(${dx*34}px,${dy*34}px)`;
 };
 joyEl.addEventListener('pointerdown',e=>{jid=e.pointerId;joyEl.setPointerCapture(jid);jset(e)});
 joyEl.addEventListener('pointermove',e=>{if(e.pointerId===jid)jset(e)});
 const jend=e=>{if(e.pointerId===jid){jid=null;joy.x=joy.y=0;knob.style.transform=''}};
 joyEl.addEventListener('pointerup',jend);joyEl.addEventListener('pointercancel',jend);
 const tA=$('#tA');
 tA.addEventListener('pointerdown',e=>{initAudio();mouse.active=false;touch.act=true;onActPress();tA.setPointerCapture(e.pointerId)});
 tA.addEventListener('pointerup',()=>touch.act=false);tA.addEventListener('pointercancel',()=>touch.act=false);
 $('#tB').addEventListener('pointerdown',()=>{mouse.active=false;placeHeld()});
 $('#tE').addEventListener('pointerdown',()=>useHeld());
 $('#tI').addEventListener('pointerdown',()=>togglePanel());
 for(const [id,v] of [['#tL',-1],['#tR',1]]){const b=$(id);b.addEventListener('pointerdown',e=>{rotJoy=v;b.setPointerCapture(e.pointerId)});const u=()=>{rotJoy=0};b.addEventListener('pointerup',u);b.addEventListener('pointercancel',u)}
 addEventListener('resize',()=>Scene.resize());
}
function updMouse(){
 const p=Scene.pick(mouse.sx,mouse.sy);if(p){mouse.wx=p.x;mouse.wy=p.z}
}

/* ---------- Ana döngü ---------- */
let last=performance.now();
function frame(now){
 const dt=Math.min(.05,(now-last)/1000);last=now;
 if(state==='play'){
  update(dt);updMouse();
  if(dirty)renderInv();
  if(!$('#panel').hidden){recT-=dt;if(recT<=0){recT=.5;renderRecipes()}}
  hud();
 }else if(state==='menu'){menuClock+=dt;G.clock+=dt*5}
 if(G.objDirty){Scene.sync(G);G.objDirty=false}
 const play=state!=='menu',tg=state==='play'?target():null,h=play?held():null;
 let place=null;
 if(tg&&h&&h.it.place&&!G.obj[tg.y*W+tg.x]){const ti=G.tile[tg.y*W+tg.x];place={ok:tg.ok&&ti>=T.SAND&&ti!==T.POND}}
 Scene.render(G,now,dt,{mode:play?'play':'menu',L:daylight(),tod:tod(),act:!!((mouse.down||keys.Space||touch.act)&&A.key),held:h?h.k:null,target:tg,place,hitI:A.hitI,hitT:A.hitT,clock:menuClock});
 const pb=$('#prog');
 if(tg&&tg.ok&&A.key&&A.p>0){
  const p=Scene.project(tg.x+.5,1.7,tg.y+.5);
  if(p){pb.hidden=false;pb.style.left=p.x+'px';pb.style.top=p.y+'px';pb.firstElementChild.style.width=clamp(A.p/A.need,0,1)*100+'%'}else pb.hidden=true;
 }else pb.hidden=true;
 requestAnimationFrame(frame);
}
function init(){
 Scene.init(cvs);
 G=newState((Math.random()*2147483647)|0);
 Scene.build(G);Scene.setMode('menu');
 setupInput();
 if(saveExists())$('#bCont').hidden=false;
 requestAnimationFrame(frame);
 window.__H={get G(){return G},get state(){return state},add,take,count,craft,RC,IT,startGame,T,O,W,H,keys,mouse,A,calcShelter,daylight,save,target,update,canCraft,Scene};
}
init();
})();
