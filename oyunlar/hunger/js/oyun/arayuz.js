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
let miniBase=null;
function buildMini(){
 const c=document.createElement('canvas');c.width=W;c.height=H;
 const g=c.getContext('2d'),im=g.createImageData(W,H);
 const col={0:[16,48,80],1:[40,110,150],2:[214,196,140],3:[62,122,58],4:[108,104,98],5:[52,150,184]};
 for(let i=0;i<W*H;i++){const c2=col[G.tile[i]];im.data[i*4]=c2[0];im.data[i*4+1]=c2[1];im.data[i*4+2]=c2[2];im.data[i*4+3]=255}
 g.putImageData(im,0,0);miniBase=c;
}

/* ---- Tam ekran harita (M) ---- */
function toggleMap(force){
 if(ui.state!=='play')return;
 const b=$('#bigmap'),open=force!==undefined?force:b.hidden;
 if(open===!b.hidden)return;
 if(open&&(!$('#panel').hidden||!$('#trade').hidden||!$('#jr').hidden))return;
 b.hidden=!open;HG.snd(open?'ui_open':'ui_close');
 if(open){for(const k in HG.inp.keys)HG.inp.keys[k]=false;HG.inp.mouseDown=false;HG.unlock(true);drawBig()}else{ui.relock=true;HG.lock()}
}
function drawBig(){
 const c=$('#bm'),S=Math.floor(Math.min(innerWidth*.94,innerHeight*.84));
 if(c.width!==S){c.width=S;c.height=S}
 const g=c.getContext('2d'),k=S/W;
 g.imageSmoothingEnabled=false;g.fillStyle='#06121f';g.fillRect(0,0,S,S);g.drawImage(miniBase,0,0,S,S);
 g.strokeStyle='rgba(255,255,255,.08)';g.lineWidth=1;
 for(let i=1;i<8;i++){g.beginPath();g.moveTo(i*S/8,0);g.lineTo(i*S/8,S);g.moveTo(0,i*S/8);g.lineTo(S,i*S/8);g.stroke()}
 g.font='600 '+Math.max(11,S/46)+'px system-ui,sans-serif';g.textAlign='center';
 (G.villages||[]).forEach((v,i)=>{
  if(!G.flags['v'+i])return;
  const x=v.cx*k,y=v.cy*k,s=Math.max(5,S/70);
  g.fillStyle='#f0b040';g.strokeStyle='#000';g.lineWidth=2;g.beginPath();g.rect(x-s,y-s,s*2,s*2);g.stroke();g.fill();
  g.fillStyle='#fff';g.strokeText(v.name,x,y-s-4);g.fillText(v.name,x,y-s-4);
 });
 for(const c of G.camps||[]){if(!G.flags['c'+c.id])continue;const x=(c.x+.5)*k,y=(c.y+.5)*k,s=Math.max(4,S/90);g.fillStyle=c.open?'#8a8a8a':'#e8e4da';g.strokeStyle='#000';g.lineWidth=2;g.beginPath();g.moveTo(x,y-s);g.lineTo(x+s,y);g.lineTo(x,y+s);g.lineTo(x-s,y);g.closePath();g.stroke();g.fill()}
 const px=G.px*k,py=G.py*k,a=Math.atan2(G.fy,G.fx),r=Math.max(6,S/60);
 g.save();g.translate(px,py);g.rotate(a);g.fillStyle='#d9463c';g.strokeStyle='#fff';g.lineWidth=2;
 g.beginPath();g.moveTo(r*1.4,0);g.lineTo(-r,r*.9);g.lineTo(-r*.4,0);g.lineTo(-r,-r*.9);g.closePath();g.stroke();g.fill();g.restore();
 $('#bmcap').textContent='Harita · '+W+'×'+H+' · ◆ kamp · bulunan köy: '+(G.villages||[]).filter((v,i)=>G.flags['v'+i]).length+'/'+(G.villages||[]).length+' · M veya Esc: kapat';
}

/* ---- HUD ---- */
const hc={};
function setBar(id,v){const k=Math.round(v);if(hc[id]===k)return;hc[id]=k;const e=$(id);e.querySelector('b').style.width=k+'%';e.classList.toggle('low',v<25)}
function hud(){
 setBar('#bHp',G.hp);setBar('#bHun',G.hun);setBar('#bThr',G.thr);setBar('#bWar',G.warm);
 const hh=Math.floor(tod()*24),mm=Math.floor((tod()*24-hh)*60),L=daylight();
 const ck=`${G.blood?'🌑':L>.45?'☀':'☾'} Gün ${dayNo()} · ${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')} · Sv ${G.lvl||1}${G.pts?' ★'+G.pts:''}${G.blood?' · KAN AYI':''}`;
 if(hc.ck!==ck){hc.ck=ck;$('#clock').textContent=ck}
 const sh=G.sheltered?'Barınakta: soğuk azalır':G.nearFire?'Ateşin yanında: ısınıyorsun':'';
 if(hc.sh!==sh){hc.sh=sh;$('#shel').textContent=sh}
 const gt=goalText();if(hc.gt!==gt){hc.gt=gt;$('#goal').innerHTML=gt}
 HG.bodyHud();
 $('#vr').style.opacity=clamp((35-G.hp)/35,0,.85);
 $('#vc').style.opacity=clamp((30-G.warm)/30,0,.8);
 /* mini harita: oyuncu ve bakış yönü */
 const m=$('#mini').getContext('2d');m.imageSmoothingEnabled=false;
 /* oyuncuyu ortalayan yakınlaştırılmış harita (80x80 kare görünür) */
 const MS=80,mw=160,k=mw/MS;
 m.fillStyle='#06121f';m.fillRect(0,0,mw,mw);
 {const sx=G.px-MS/2,sy=G.py-MS/2,x0=Math.max(0,sx),y0=Math.max(0,sy),x1=Math.min(W,sx+MS),y1=Math.min(H,sy+MS);
  if(x1>x0&&y1>y0)m.drawImage(miniBase,x0,y0,x1-x0,y1-y0,(x0-sx)*k,(y0-sy)*k,(x1-x0)*k,(y1-y0)*k)}
 m.strokeStyle='#fff';m.lineWidth=1.5;m.beginPath();m.moveTo(mw/2,mw/2);m.lineTo(mw/2+G.fx*7*k,mw/2+G.fy*7*k);m.stroke();
 m.fillStyle='#d9463c';m.beginPath();m.arc(mw/2,mw/2,3,0,7);m.fill();
 (G.villages||[]).forEach((v,i)=>{if(!G.flags['v'+i])return;const x=(v.cx-(G.px-MS/2))*k,y=(v.cy-(G.py-MS/2))*k;if(x>2&&y>2&&x<mw-2&&y<mw-2){m.fillStyle='#f0b040';m.fillRect(x-3,y-3,6,6);m.strokeStyle='#000';m.strokeRect(x-3,y-3,6,6)}});
 for(const c of G.camps||[]){if(!G.flags['c'+c.id])continue;const x=(c.x+.5-(G.px-MS/2))*k,y=(c.y+.5-(G.py-MS/2))*k;if(x>2&&y>2&&x<mw-2&&y<mw-2){m.fillStyle=c.open?'#8a8a8a':'#e8e4da';m.beginPath();m.moveTo(x,y-3.5);m.lineTo(x+3.5,y);m.lineTo(x,y+3.5);m.lineTo(x-3.5,y);m.fill()}}
 if(!$('#bigmap').hidden)drawBig();
 /* nişan ipucu */
 const a=HG.actionFor(G.tg);
 let tip=(!G.tg&&!(a&&(a.kind==='eat'||a.block)))?'':(a?(a.name+(a.hint?' · '+a.hint:a.block?' · '+a.block:'')):(G.obj[G.tg.y*W+G.tg.x]?HG.NAMES[G.obj[G.tg.y*W+G.tg.x]]||'':''));
 const nn=G.nearNpc;if(nn&&!G.nearDrop)tip=(tip?tip+' · ':'')+'[E] '+nn.name+' ('+HG.PROF[nn.prof].n+') ile konuş';
 if(G.nearCamp&&!G.nearDrop)tip=(tip?tip+' · ':'')+'[E] Sandığı aç';
 const nd=G.nearDrop;if(nd)tip=(tip?tip+' · ':'')+'[E] '+IT[nd.id].n+(nd.n>1?' ×'+nd.n:'')+' al';
 if(hc.tip!==tip){hc.tip=tip;const t=$('#tip');t.textContent=tip;t.hidden=!tip}
 const cr=!!(a&&a.kind&&G.tg);if(hc.cr!==cr){hc.cr=cr;$('#cross').classList.toggle('on',cr)}
 const pr=$('#prog');
 if(HG.A.key&&HG.A.p>0){pr.hidden=false;pr.firstElementChild.style.width=clamp(HG.A.p/HG.A.need,0,1)*100+'%'}else pr.hidden=true;
}
Object.assign(HG,{toast,feed,renderInv,renderRecipes,togglePanel,toggleMap,buildMini,hud});
})();
