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
const slotHtml=(i,hot)=>{
 const s=G.inv[i],it=s?IT[s.id]:null;
 return `<div class="slot${ui.dragFrom===i?' dim':''}${i===G.sel&&i<HOT?' sel':''}${ui.picked===i?' pick':''}" data-i="${i}"${it?` title="${it.n}"`:''}>${hot?`<span class="k">${i+1}</span>`:''}${it?`<img src="${ICON[s.id]}" alt="${it.n}">${s.n>1?`<span class="n">${s.n}</span>`:''}`:''}</div>`;
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
  const need=Object.keys(r[2]).map(k=>{const have=count(k),ok=have>=r[2][k];return `<span class="${ok?'ok':'no'}">${IT[k].n} ${have}/${r[2][k]}</span>`}).join(' · ');
  h+=`<div class="rc${st===-1?' lock':''}"><img src="${ICON[r[0]]}" alt=""><div><b>${it.n}${r[1]>1?' ×'+r[1]:''}</b>${need}${r[3]?`<br><span class="${st===-1?'no':'ok'}">Gerekli: ${STN[r[3]]} yakını</span>`:''}${it.d?`<br><span>${it.d}</span>`:''}</div><button type="button" data-r="${i}"${st===1?'':' disabled'}>Üret</button></div>`;
 });
 $('#recipes').innerHTML=h;
}
function togglePanel(force){
 if(ui.state!=='play')return;
 if(!$('#jr').hidden&&force!==false)return;
 const p=$('#panel'),open=force!==undefined?force:p.hidden;
 p.hidden=!open;ui.picked=null;HG.snd(open?'ui_open':'ui_close');
 if(open){renderInv();renderRecipes();ui.recT=0;HG.unlock(true)}else{ui.dirty=true;HG.lock()}
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
function setBar(id,v){const k=Math.round(v);if(hc[id]===k)return;hc[id]=k;const e=$(id);e.querySelector('b').style.width=k+'%';e.classList.toggle('low',v<25)}
function hud(){
 setBar('#bHp',G.hp);setBar('#bHun',G.hun);setBar('#bThr',G.thr);setBar('#bWar',G.warm);
 const hh=Math.floor(tod()*24),mm=Math.floor((tod()*24-hh)*60),L=daylight();
 const ck=`${G.cave?'⛏ Mağara ·':G.blood?'🌑':L>.45?'☀':'☾'} Gün ${dayNo()} · ${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')} · Sv ${G.lvl||1}${G.pts?' ★'+G.pts:''}${G.blood?' · KAN AYI':''}`;
 if(hc.ck!==ck){hc.ck=ck;$('#clock').textContent=ck}
 const sh=G.sheltered?'Barınakta: soğuk azalır':G.nearFire?'Ateşin yanında: ısınıyorsun':'';
 if(hc.sh!==sh){hc.sh=sh;$('#shel').textContent=sh}
 const gt=goalText();if(hc.gt!==gt){hc.gt=gt;$('#goal').innerHTML=gt}
 HG.bodyHud();
 $('#vr').style.opacity=clamp((35-G.hp)/35,0,.85);
 $('#vc').style.opacity=clamp((30-G.warm)/30,0,.8);
 /* mini harita: oyuncuyu ortalayan, keşfedildikçe açılan harita */
 HG.mapMini($('#mini').getContext('2d'),160);
 if(!$('#bigmap').hidden)drawBig();
 /* nişan ipucu */
 const a=HG.actionFor(G.tg);
 let tip=(!G.tg&&!(a&&(a.kind==='eat'||a.block)))?'':(a?(a.name+(a.hint?' · '+a.hint:a.block?' · '+a.block:'')):(G.obj[G.tg.y*W+G.tg.x]?HG.NAMES[G.obj[G.tg.y*W+G.tg.x]]||'':''));
 const nn=G.nearNpc;if(nn&&!G.nearDrop)tip=(tip?tip+' · ':'')+'[E] '+nn.name+' ('+HG.PROF[nn.prof].n+') ile konuş';
 if(G.nearCamp&&!G.nearDrop)tip=(tip?tip+' · ':'')+'[E] Sandığı aç';
 if(G.nearCave&&!G.nearDrop&&!G.nearCamp)tip=(tip?tip+' · ':'')+(G.nearCave.exit?'[E] Mağaradan çık':'[E] Mağaraya gir (karanlık, tehlikeli)');
 const nd=G.nearDrop;if(nd)tip=(tip?tip+' · ':'')+'[E] '+IT[nd.id].n+(nd.n>1?' ×'+nd.n:'')+' al';
 if(hc.tip!==tip){hc.tip=tip;const t=$('#tip');t.textContent=tip;t.hidden=!tip}
 const cr=!!(a&&a.kind&&G.tg);if(hc.cr!==cr){hc.cr=cr;$('#cross').classList.toggle('on',cr)}
 /* hedef sağlık çubuğu ve vurulan bölge yazısı */
 {
  const ah=G.tg&&G.tg.an&&!G.tg.an.dying?G.tg.an:(G.lastHit&&performance.now()-G.lastHit.t<2500&&!G.lastHit.a.gone?G.lastHit.a:null);
  const tg=$('#tgt');
  if(ah&&G.lastHit&&G.lastHit.a===ah&&ah.dying){/* ölünce kısa süre %0 göster */}
  if(ah){
   const def=HG.ANIMAL[ah.t],p=Math.max(0,Math.ceil(ah.hp));
   const k=def.n+'|'+p;
   if(hc.tg!==k){hc.tg=k;tg.querySelector('b').textContent=def.n;tg.querySelector('u').style.width=p+'%';tg.querySelector('u').style.background=p>60?'#6fbf5a':p>30?'#d0a02f':'#d9463c';tg.querySelector('span').textContent='%'+p}
   tg.hidden=false;
  }else if(!tg.hidden){tg.hidden=true;hc.tg=null}
  const z=$('#zn'),zn=G.zn;
  if(zn&&performance.now()-zn.t<1100){z.textContent=zn.txt;z.className=zn.zone;z.style.opacity=1-(performance.now()-zn.t)/1100}else if(z.style.opacity!=='0')z.style.opacity=0;
 }
 const pr=$('#prog');
 if(HG.A.key&&HG.A.p>0){pr.hidden=false;pr.firstElementChild.style.width=clamp(HG.A.p/HG.A.need,0,1)*100+'%'}else pr.hidden=true;
}
Object.assign(HG,{toast,feed,renderInv,renderRecipes,togglePanel,toggleMap,buildMini,hud});
})();
