/* Hunger 3D - gelişim: deneyim, seviye, yetenekler, istatistikler ve günlük penceresi (K) */
(()=>{
'use strict';
const {G,ui,inp,IT,$,clamp,dayNo}=HG;
const MAXL=30,need=l=>Math.round(40+l*28+l*l*1.6);
/* [anahtar, ad, açıklama, en çok seviye] */
const PERKS=[
 ['eco','Az Yiyen','Açlık ve susuzluk %12 daha yavaş azalır.'],
 ['cold','Soğuk Kanlı','Soğukta ısı kaybı %15 azalır.'],
 ['hunt','Avcı','Silah hasarı %15 artar.'],
 ['gath','Toplayıcı','Toplarken %20 ihtimalle fazladan eşya çıkar.'],
 ['trade','Pazarlıkçı','Satış fiyatı %8 artar, sikkeli alışverişte %7 indirim olur.'],
 ['mind','Soğukkanlılık','Akıl kaybı %15 azalır.'],
 ['dive','Dalgıç','Nefes %20 daha uzun yeter, yüzerken dayanıklılık daha yavaş azalır.'],
 ['agile','Çevik','Dayanıklılık %15 daha hızlı yenilenir.'],
 ['medic','Şifa Eli','Bandaj her seviyede 5 ek sağlık verir.'],
 ['sail','Denizci','Sal %12 daha hızlı gider, balık daha çabuk tutulur ve köpek balığı ısırığı %15 azalır.']
].map(p=>p.concat(3));
const perk=k=>(G.perks&&G.perks[k])||0;
function progInit(){
 G.xp=0;G.lvl=1;G.pts=0;G.perks={};G.notes=[];G.quests={};G.lastDay=1;G.blood=false;G.bloodDay=0;
 G.stats={kills:0,shades:0,hunted:0,chests:0,quests:0,traded:0,blood:0,crafted:0,caves:0,walked:0,swum:0,shells:0,islets:0,reefs:0,sailed:0,sharks:0,coral:0,crabs:0};
}
function progSave(){return {xp:G.xp,lvl:G.lvl,pts:G.pts,perks:G.perks,notes:G.notes,quests:G.quests,stats:G.stats,lastDay:G.lastDay,blood:!!G.blood,bloodDay:G.bloodDay}}
function progLoad(s){
 if(!s||typeof s!=='object')return;
 G.xp=+s.xp||0;G.lvl=clamp(+s.lvl||1,1,MAXL);G.pts=+s.pts||0;
 G.perks=s.perks&&typeof s.perks==='object'?s.perks:{};
 G.notes=Array.isArray(s.notes)?s.notes:[];
 G.quests=s.quests&&typeof s.quests==='object'?s.quests:{};
 G.stats=Object.assign(G.stats,s.stats||{});
 G.lastDay=+s.lastDay||dayNo();G.blood=!!s.blood;G.bloodDay=+s.bloodDay||0;
}
function xpGain(n){
 if(!G.stats||ui.state==='dead')return;
 G.xp+=n;
 while(G.lvl<MAXL&&G.xp>=need(G.lvl)){
  G.xp-=need(G.lvl);G.lvl++;G.pts++;
  HG.toast('Seviye '+G.lvl+'! Yetenek puanı kazandın (K).');HG.snd('levelup');HG.feed('Seviye '+G.lvl);
 }
 if(G.lvl>=MAXL)G.xp=Math.min(G.xp,need(MAXL));
}
function buyPerk(k){
 const p=PERKS.find(x=>x[0]===k);if(!p)return;
 if(perk(k)>=p[3]||G.pts<1)return;
 G.pts--;G.perks[k]=perk(k)+1;HG.snd('craft');render();
}
/* ---- günlük penceresi ---- */
let tab='gel',hl=-1;
const TABS=[['gel','Gelişim'],['gor','Görevler'],['not','Kayıtlar'],['ist','İstatistik']];
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
function render(){
 const t=$('#jrT'),b=$('#jrB');if(!t||!b)return;
 t.innerHTML=TABS.map(x=>`<button type="button" class="ghost${x[0]===tab?' on':''}" data-t="${x[0]}">${x[1]}</button>`).join('');
 let h='';
 if(tab==='gel'){
  const nx=need(G.lvl),pc=G.lvl>=MAXL?100:Math.round(G.xp/nx*100);
  h+=`<div class="jl"><b>Seviye ${G.lvl}</b><span>${G.lvl>=MAXL?'En üst seviye':Math.floor(G.xp)+' / '+nx+' deneyim'} · Yetenek puanı: <b>${G.pts}</b></span><i><b style="width:${pc}%"></b></i></div>`;
  for(const p of PERKS){
   const lv=perk(p[0]),can=G.pts>0&&lv<p[3];
   h+=`<div class="pk"><div><b>${p[1]} <small>${lv}/${p[3]}</small></b><span>${p[2]}</span></div><button type="button" data-p="${p[0]}"${can?'':' disabled'}>${lv>=p[3]?'Tam':'Yükselt'}</button></div>`;
  }
 }else if(tab==='gor'){
  const L=HG.questList?HG.questList():[];
  h=L.length?L.map(({n,q})=>`<div class="pk"><div><b>${esc(HG.questTitle(q))}</b><span>${esc(n.name)} (${HG.PROF[n.prof].n}, ${esc(G.villages[n.vi].name)}) · ${esc(HG.questProg(q))}</span></div><span class="ok">${q.rw.coin} sikke</span></div>`).join(''):'<p class="mut">Aktif görev yok. Köylülerle konuşarak görev alınabilir.</p>';
 }else if(tab==='not'){
  const all=HG.NOTES||[];
  h=`<p class="mut">Bulunan kayıt: ${G.notes.length}/${all.length}. Terk edilmiş kampların sandıklarında bulunur.</p>`;
  for(const i of G.notes)h+=`<div class="nt${i===hl?' hl':''}"><b>${esc(all[i].t)}</b><span>${esc(all[i].x)}</span></div>`;
 }else{
  const s=G.stats,rows=[['Hayatta kalınan gün',dayNo()],['Seviye',G.lvl],['Avlanan hayvan',s.hunted],['Yok edilen Gölge',s.shades],['Açılan sandık',s.chests],['Tamamlanan görev',s.quests],['Ticaret işlemi',s.traded],['Atlatılan Kan Ayı',s.blood],['Üretilen eşya',s.crafted],['Bulunan kamp',(G.camps||[]).filter(c=>G.flags['c'+c.id]).length+'/'+(G.camps||[]).length],['Bulunan köy',(G.villages||[]).filter((v,i)=>G.flags['v'+i]).length+'/'+(G.villages||[]).length],['Yürünen mesafe',Math.round(s.walked||0)+' m'],['Yüzülen mesafe',Math.round(s.swum||0)+' m'],['Toplanan midye',s.shells||0],['Salla alınan yol',Math.round(s.sailed||0)+' m'],['Keşfedilen ada',(s.islets||0)+'/'+(G.islets||[]).length],['Keşfedilen resif',(s.reefs||0)+'/'+(G.reefs||[]).length],['Toplanan mercan',s.coral||0],['Öldürülen köpek balığı',s.sharks||0]];
  h=rows.map(r=>`<div class="st"><span>${r[0]}</span><b>${r[1]}</b></div>`).join('');
 }
 b.innerHTML=h;
}
function toggleJournal(force,t,hlIdx){
 if(ui.state!=='play')return;
 const j=$('#jr'),open=force!==undefined?force:j.hidden;
 if(open===!j.hidden)return;
 if(open&&(!$('#panel').hidden||!$('#trade').hidden||!$('#bigmap').hidden))return;
 if(open){tab=t||tab;hl=hlIdx===undefined?-1:hlIdx;for(const k in inp.keys)inp.keys[k]=false;inp.mouseDown=false;render();j.hidden=false;HG.snd('ui_open');HG.unlock(true)}
 else{j.hidden=true;HG.snd('ui_close');ui.relock=true;HG.lock()}
}
function init(){
 const j=$('#jr');if(!j)return;
 $('#jrT').addEventListener('click',e=>{const b=e.target.closest('button[data-t]');if(b){tab=b.dataset.t;hl=-1;render()}});
 $('#jrB').addEventListener('click',e=>{const b=e.target.closest('button[data-p]');if(b)buyPerk(b.dataset.p)});
 $('#jrX').onclick=()=>toggleJournal(false);
 const tk=$('#tK');if(tk)tk.addEventListener('pointerdown',()=>toggleJournal());
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
Object.assign(HG,{perk,PERKS,progInit,progSave,progLoad,xpGain,toggleJournal,need});
})();
