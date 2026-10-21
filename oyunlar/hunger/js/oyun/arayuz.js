/* Hunger 3D - arayüz: HUD, hızlı erişim çubuğu, envanter ve üretim paneli, mini harita, ipucu */
(()=>{
'use strict';
const {W,H,SLOTS,HOT,IT,RC,STN,ICON,G,ui,clamp,count,canCraft,tod,daylight,dayNo,goalText}=HG;
const $=HG.$;

/* ---- Bildirimler ---- */
let toastT=0;
function toast(m){const e=$('#toast');e.textContent=m;e.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove('on'),2400)}
function feed(m){const f=$('#feed'),d=document.createElement('div');d.textContent=m;f.appendChild(d);setTimeout(()=>d.remove(),2800);while(f.children.length>5)f.firstChild.remove()}

/* ---- Envanter kutuları ---- */
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const slotHtml=(i,hot)=>{
 const s=G.inv[i],it=s?IT[s.id]:null;
 const dp=it&&HG.durPct&&HG.cfg.wear!==false?HG.durPct(s):-1;       /* alet dayanıklılığı yüzdesi (-1: dayanıklılığı olmayan eşya) */
 const mat=!!(it&&HG.matOnly&&HG.matOnly(s.id));                    /* yalnızca üretim malzemesi: elde tutulmaz */
 return `<div class="slot${ui.dragFrom===i?' dim':''}${i===G.sel&&i<HOT?' sel':''}${ui.picked===i?' pick':''}${mat?' mat':''}" data-i="${i}"${it?` title="${it.n}${mat?' · üretim malzemesi (elde tutulmaz)':''}${dp>=0?' · dayanıklılık %'+dp:''}"`:''}>${hot?`<span class="k">${i+1}</span>`:''}${it?`<img src="${ICON[s.id]}" alt="${it.n}">${s.n>1?`<span class="n">${s.n}</span>`:''}`:''}${dp>=0&&dp<100&&HG.cfg.durbar!==false?`<i class="dur${dp<=20?' lo':dp<=50?' md':''}" style="width:${Math.max(6,dp*.84)}%"></i>`:''}</div>`;
};
function renderInv(){
 let h='';for(let i=0;i<HOT;i++)h+=slotHtml(i,true);
 $('#hot').innerHTML=h;
 if(!$('#panel').hidden){
  let gh='';for(let i=0;i<SLOTS;i++)gh+=slotHtml(i,i<HOT);
  $('#grid').innerHTML=gh;
 }
 ui.dirty=false;
}
function renderRecipes(){
 let h='';
 RC.forEach((r,i)=>{
  const st=canCraft(r),it=IT[r[0]];
  const need=Object.keys(r[2]).map(k=>{const have=count(k),ok=have>=r[2][k];return `<span class="${ok?'ok':'no'}">${IT[k].n} ${have}/${r[2][k]}</span>`}).join(' · ')||'<span class="ok">Malzeme gerekmez</span>';
  h+=`<div class="rc${st===-1?' lock':''}"><img src="${ICON[r[0]]}" alt=""><div><b>${it.n}${r[1]>1?' ×'+r[1]:''}</b>${need}${r[3]?`<br><span class="${st===-1?'no':'ok'}">Gerekli: ${STN[r[3]]} yakını</span>`:''}${it.d?`<br><span>${it.d}</span>`:''}</div><button type="button" data-r="${i}"${st===1?'':' disabled'}>Üret</button></div>`;
 });
 if(hc.rc!==h){hc.rc=h;$('#recipes').innerHTML=h}      /* içerik değişmediyse DOM yeniden yazılmaz */
}
function togglePanel(force){
 if(ui.state!=='play')return;
 if(!$('#jr').hidden&&force!==false)return;
 const p=$('#panel'),open=force!==undefined?force:p.hidden;
 p.hidden=!open;ui.picked=null;HG.snd(open?'ui_open':'ui_close');
 if(open){renderInv();HG.renderRecipes();ui.recT=0;HG.unlock(true)}else{ui.dirty=true;HG.lock()}
}

/* ---- Mini harita ---- */
function buildMini(){HG.mapBuild()}

/* ---- Tam ekran harita (M) ---- */
function toggleMap(force){
 if(ui.state!=='play')return;
 const b=$('#bigmap'),open=force!==undefined?force:b.hidden;
 if(open===!b.hidden)return;
 if(open&&(!$('#panel').hidden||!$('#trade').hidden||!$('#jr').hidden))return;
 b.hidden=!open;HG.snd(open?'ui_open':'ui_close');
 if(open){for(const k in HG.inp.keys)HG.inp.keys[k]=false;HG.inp.mouseDown=false;HG.unlock(true);HG.mapOpen();drawBig()}else{ui.relock=true;HG.lock()}
}
function drawBig(){HG.mapBig()}

/* ---- HUD ---- */
const hc={};
const DIRS=['K','KD','D','GD','G','GB','B','KB'];       /* kuzey, kuzeydoğu, doğu ... */
function setBar(id,v){
 const k=Math.round(clamp(v,0,100));if(hc[id]===k)return;hc[id]=k;
 const e=$(id);e.querySelector('b').style.width=k+'%';
 const u=e.querySelector('u');if(u)u.textContent='%'+k;             /* sayısal değer: çubuğun sağında */
 e.classList.toggle('low',k<25);e.classList.toggle('crit',k<12);e.classList.toggle('full',k>=100);
}
/* Eylem ipucu: "[E] ..." biçimindeki tuş adı küçük bir tuş kutusu olarak çizilir */
function setTip(t){
 const e=$('#tip');
 if(!t){if(!e.hidden){e.hidden=true;e.textContent=''}return}
 const m=/^\[([^\]]+)\]\s*([\s\S]*)$/.exec(t);
 e.innerHTML=m?'<kbd>'+esc(m[1])+'</kbd>'+esc(m[2]):esc(t);
 e.hidden=false;
}
/* Seçilen eşyanın adı: hızlı erişim çubuğunun üstünde kısa süre görünür */
let hotT=0;
function showHotName(){
 const e=$('#hotn');if(!e)return;
 const s=G.inv[G.sel],it=s?IT[s.id]:null;
 if(!it||ui.state!=='play'){e.classList.remove('on');return}
 const mat=!!(HG.matOnly&&HG.matOnly(s.id));
 e.innerHTML=esc(it.n)+(s.n>1?' <small>×'+s.n+'</small>':'')+(mat?' <small>üretim malzemesi</small>':'');
 e.classList.add('on');clearTimeout(hotT);hotT=setTimeout(()=>e.classList.remove('on'),1700);
}
/* Pusula çubuğu (ekranın üst ortası): bakılan yöne göre kayar; işaret konulduysa yönü gösterir */
let cmpKey='';
function drawCompass(){
 const el=$('#comp');if(!el||el.hidden||!HG.cfg.compass)return;
 const hd=((Math.atan2(G.fx||0,-(G.fy||-1))*180/Math.PI)+360)%360,wp=G.wp;
 let wb=null,wd=0;if(wp){wb=((Math.atan2(wp.x-G.px,-(wp.y-G.py))*180/Math.PI)+360)%360;wd=Math.hypot(wp.x-G.px,wp.y-G.py)}
 const key=Math.round(hd*3)+'|'+(wb===null?'':Math.round(wb*3)+'|'+Math.round(wd/3));
 if(key===cmpKey)return;cmpKey=key;
 const cv=el.firstElementChild,g=cv.getContext('2d'),CW=cv.width,CH=cv.height,SPAN=110,ppd=CW/SPAN;
 g.clearRect(0,0,CW,CH);
 g.textAlign='center';g.textBaseline='alphabetic';
 const gr=g.createLinearGradient(0,0,CW,0);gr.addColorStop(0,'rgba(231,228,223,0)');gr.addColorStop(.18,'rgba(231,228,223,.55)');gr.addColorStop(.82,'rgba(231,228,223,.55)');gr.addColorStop(1,'rgba(231,228,223,0)');
 g.fillStyle=gr;g.fillRect(0,CH-14,CW,2);
 const d0=Math.floor((hd-SPAN/2)/5)*5;
 for(let d=d0;d<=hd+SPAN/2+5;d+=5){
  const a=Math.max(0,1-Math.pow(Math.abs(d-hd)/(SPAN/2),2));if(a<=.03)continue;
  const x=CW/2+(d-hd)*ppd,dn=((d%360)+360)%360;
  g.globalAlpha=a;g.shadowColor='rgba(0,0,0,.9)';g.shadowBlur=4;
  if(dn%45===0){
   const card=dn%90===0;
   g.font=(card?'700 26px':'600 19px')+' system-ui,Segoe UI,sans-serif';
   g.fillStyle=dn===0?'#ff5a4e':'#f2efe9';g.fillText(DIRS[dn/45],x,CH-26);
   g.fillStyle='#e7e4df';g.fillRect(x-1.5,CH-24,3,10);
  }else if(dn%15===0){
   g.font='500 15px system-ui,Segoe UI,sans-serif';g.fillStyle='#cfcac2';g.fillText(String(dn),x,CH-26);
   g.fillStyle='#cfcac2';g.fillRect(x-1,CH-22,2,8);
  }else{g.fillStyle='#a8a39b';g.fillRect(x-.8,CH-19,1.6,5)}
 }
 g.globalAlpha=1;g.shadowBlur=0;
 /* merkez imleci */
 g.fillStyle='#d9463c';g.beginPath();g.moveTo(CW/2,CH-12);g.lineTo(CW/2-7,CH-1);g.lineTo(CW/2+7,CH-1);g.closePath();g.fill();
 g.font='700 15px system-ui,Segoe UI,sans-serif';g.fillStyle='rgba(231,228,223,.85)';g.shadowColor='rgba(0,0,0,.9)';g.shadowBlur=4;g.fillText(Math.round(hd)+'°',CW/2,16);
 /* işaret noktası */
 if(wb!==null){
  const df=((wb-hd+540)%360)-180,inside=Math.abs(df)<=SPAN/2-4,x=inside?CW/2+df*ppd:(df<0?18:CW-18);
  g.shadowBlur=0;g.fillStyle='#ffd23f';g.strokeStyle='#1a1a1c';g.lineWidth=2;
  g.beginPath();
  if(inside){g.moveTo(x,CH-48);g.lineTo(x+8,CH-38);g.lineTo(x,CH-28);g.lineTo(x-8,CH-38)}
  else{const s=df<0?-1:1;g.moveTo(x+s*8,CH-48);g.lineTo(x-s*6,CH-38);g.lineTo(x+s*8,CH-28)}
  g.closePath();g.fill();g.stroke();
  g.font='600 14px system-ui,Segoe UI,sans-serif';g.fillStyle='#ffd23f';g.shadowColor='rgba(0,0,0,.9)';g.shadowBlur=3;g.fillText(wd>=1000?(wd/1000).toFixed(1)+' km':Math.round(wd)+' m',Math.max(34,Math.min(CW-34,x)),CH-52);
 }
}
function hud(){
 setBar('#bHp',G.hp);setBar('#bHun',G.hun);setBar('#bThr',G.thr);setBar('#bWar',G.warm);
 const hh=Math.floor(tod()*24),mm=Math.floor((tod()*24-hh)*60),L=daylight();
 const ck=`${G.cave?'⛏ Mağara ·':G.blood?'🌑':L>.45?'☀':'☾'} Gün ${dayNo()} · ${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')} · Sv ${G.lvl||1}${G.pts?' ★'+G.pts:''}${G.blood?' · KAN AYI':''}`;
 if(hc.ck!==ck){hc.ck=ck;$('#clock').textContent=ck}
 drawCompass();
 const sh=G.swim?'Su derinliği: '+Math.max(0,HG.sc.WY-HG.Scene.groundY(G.px,G.py)).toFixed(1)+' m':G.onRaft?'Sal dayanıklılığı: %'+Math.max(0,Math.round(G.raftHp))+' · Su derinliği: '+Math.max(0,HG.sc.WY-HG.Scene.groundY(G.px,G.py)).toFixed(1)+' m':G.sheltered?'Barınakta: soğuk azalır':G.nearFire?'Ateşin yanında: ısınıyorsun':'';
 if(hc.sh!==sh){hc.sh=sh;$('#shel').textContent=sh}
 const gt=goalText();if(hc.gt!==gt){hc.gt=gt;$('#goal').innerHTML=gt}
 HG.bodyHud();
 $('#vr').style.opacity=clamp((35-G.hp)/35,0,.85);
 $('#vc').style.opacity=clamp((30-G.warm)/30,0,.8);
 /* mini harita: oyuncuyu ortalayan, keşfedildikçe açılan harita */
 {const nm=performance.now();if(nm-(hc.mm||0)>48){hc.mm=nm;HG.mapMini($('#mini').getContext('2d'),160)}}   /* mini harita saniyede ~20 kez çizilir */
 if(!$('#bigmap').hidden)drawBig();
 /* nişan ipucu */
 const a=HG.actionFor(G.tg);
 let tip=(!G.tg&&!(a&&(a.kind==='eat'||a.block||a.always)))?'':(a?(a.name+(a.hint?' · '+a.hint:a.block?' · '+a.block:'')):(G.obj[G.tg.y*W+G.tg.x]?HG.NAMES[G.obj[G.tg.y*W+G.tg.x]]||'':''));
 {
  const uc=HG.useCands()[0];
  if(uc){
   const k=uc[1],nn=G.nearNpc,nd=G.nearDrop;
   const t=k==='npc'?'[E] '+nn.name+' ('+HG.PROF[nn.prof].n+') ile konuş':k==='chest'?'[E] Sandığı aç':k==='cave'?(G.nearCave.exit?'[E] Mağaradan çık':'[E] Mağaraya gir (karanlık, tehlikeli)'):'[E] '+IT[nd.id].n+(nd.n>1?' ×'+nd.n:'')+' al';
   tip=t;                     /* tek odak: yakındaki etkileşim öncelikliyse yalnızca o gösterilir */
  }
 }
 /* fare kilidi yoksa (oyun doğrudan başladığında tarayıcı kilide izin vermeyebilir) ekrana tıklama ipucu gösterilir */
 if(!tip&&!ui.locked&&!ui.touch&&$('#panel').hidden&&$('#trade').hidden&&$('#bigmap').hidden&&$('#jr').hidden&&$('#gd').hidden)tip='Fareyle bakmak için ekrana tıklayın';
 if(hc.tip!==tip){hc.tip=tip;setTip(tip)}
 /* hızlı erişim kutusu değişince eşya adı gösterilir */
 {const sid=G.inv[G.sel]?G.inv[G.sel].id:'';
  if(hc.sel!==G.sel||hc.sid!==sid){const first=hc.sel===undefined;hc.sel=G.sel;hc.sid=sid;if(!first)showHotName()}}
 const cr=!!(a&&a.kind&&G.tg);if(hc.cr!==cr){hc.cr=cr;$('#cross').classList.toggle('on',cr)}
 /* hedef sağlık çubuğu ve vurulan bölge yazısı */
 {
  const ah=G.tg&&G.tg.an&&!G.tg.an.dying?G.tg.an:null;
  const tg=$('#tgt');
  if(ah&&G.lastHit&&G.lastHit.a===ah&&ah.dying){/* ölünce kısa süre %0 göster */}
  if(ah){
   const def=HG.ANIMAL[ah.t],p=Math.max(0,Math.ceil(ah.hp));
   const k=def.n+'|'+p;
   if(hc.tg!==k){hc.tg=k;tg.querySelector('b').textContent=def.n;tg.querySelector('u').style.width=p+'%';tg.querySelector('u').style.background=p>60?'#6fbf5a':p>30?'#d0a02f':'#d9463c';tg.querySelector('span').textContent='%'+p}
   tg.hidden=false;
  }else if(!tg.hidden){tg.hidden=true;hc.tg=null}
 }
 const pr=$('#prog');
 if(HG.A.key&&HG.A.p>0){pr.hidden=false;pr.firstElementChild.style.width=clamp(HG.A.p/HG.A.need,0,1)*100+'%'}
 else if(HG.useProg&&HG.useProg.p>0){pr.hidden=false;pr.firstElementChild.style.width=clamp(HG.useProg.p/HG.useProg.need,0,1)*100+'%'}
 else pr.hidden=true;
}
Object.assign(HG,{toast,feed,renderInv,renderRecipes,togglePanel,toggleMap,buildMini,hud});
})();
