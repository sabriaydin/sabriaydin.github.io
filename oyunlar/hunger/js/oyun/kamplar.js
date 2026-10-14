/* Hunger 3D - terk edilmiş kamplar: keşif, sandık açma, ganimet ve bulunan kayıtlar */
(()=>{
'use strict';
const {G,ui,count,add,canAdd,IT}=HG;
const rnd=Math.random,R=(a,b)=>a+((rnd()*(b-a+1))|0);
/* ganimet: [eşya, en az, en çok, ağırlık]; seviye arttıkça güçlenir */
const LOOT=[
 [['bandage',1,3,5],['arrow',5,12,5],['cmeat',1,3,5],['wbottle',1,2,4],['torch',1,2,4],['coin',2,6,6],['leather',2,4,3],['bone',2,4,3],['berries',3,6,3]],
 [['bandage',2,4,4],['arrow',8,16,4],['cmeat',2,4,4],['torch',2,3,3],['coin',5,10,6],['iron_ingot',1,1,3],['copper_ingot',1,2,4],['coat',1,1,1],['wool',2,4,2],['bag',1,1,1]],
 [['bandage',3,5,4],['arrow',12,20,4],['coin',10,18,6],['iron_ingot',1,3,5],['pick2',1,1,2],['axe2',1,1,2],['bow',1,1,2],['spear',1,1,2],['coat',1,1,3],['bag',1,1,2],['cmeat',3,5,3]]
];
function roll(tier){
 const T=LOOT[tier],out=[];let k=R(3,4)+tier;
 while(k-->0){
  const tw=T.reduce((s,x)=>s+x[3],0);let r=rnd()*tw,e=T[0];
  for(const x of T){r-=x[3];if(r<=0){e=x;break}}
  const n=R(e[1],e[2]),f=out.find(o=>o[0]===e[0]);
  if(f&&IT[e[0]].s>1)f[1]+=n;else if(!f)out.push([e[0],n]);
 }
 return out;
}
function updateCamps(dt){
 const L=G.camps;G.nearCamp=null;if(!L)return;
 let best=2.6;
 for(const c of L){
  const d=Math.hypot(G.px-(c.x+.5),G.py-(c.y+.5));
  if(d<14&&!G.flags['c'+c.id]){G.flags['c'+c.id]=1;HG.toast('Terk edilmiş bir kamp keşfedildi.');HG.xpGain(6)}
  if(!c.open&&d<best){best=d;G.nearCamp=c}
 }
}
function openChest(){
 const c=G.nearCamp;if(!c||c.open||ui.state!=='play')return false;
 c.open=true;G.nearCamp=null;
 const loot=roll(c.tier),msg=[];
 for(const [id,n] of loot){
  const left=add(id,n);if(left>0)HG.spawnDrop(id,left);
  msg.push(n+' '+IT[id].n);
 }
 HG.snd('chest');HG.feed('Sandık: '+msg.join(', '));
 G.stats.chests++;HG.flag('chest');HG.xpGain(14+c.tier*8);
 /* kayıt */
 const N=HG.NOTES||[];
 if(N.length&&!G.notes.includes(c.note)){
  G.notes.push(c.note);HG.xpGain(8);
  setTimeout(()=>{if(ui.state==='play')HG.toggleJournal(true,'not',c.note)},900);
 }
 return true;
}
Object.assign(HG,{updateCamps,openChest});
})();
