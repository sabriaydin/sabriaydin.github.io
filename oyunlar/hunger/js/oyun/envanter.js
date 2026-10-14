/* Hunger 3D - envanter: ekleme, çıkarma, sayma, bayraklar */
(()=>{
'use strict';
const {SLOTS,IT,G,ui}=HG;
const count=id=>{let n=0;for(const s of G.inv)if(s&&s.id===id)n+=s.n;return n};
function canAdd(id,n){
 const mx=IT[id].s;let room=0;
 for(const s of G.inv){if(!s)room+=mx;else if(s.id===id)room+=mx-s.n;if(room>=n)return true}
 return room>=n;
}
function add(id,n){
 const mx=IT[id].s;
 for(const s of G.inv){if(n<=0)break;if(s&&s.id===id&&s.n<mx){const k=Math.min(mx-s.n,n);s.n+=k;n-=k}}
 for(let i=0;i<SLOTS&&n>0;i++){if(!G.inv[i]){const k=Math.min(mx,n);G.inv[i]={id,n:k};n-=k}}
 ui.dirty=true;return n;
}
function take(id,n){
 for(let i=SLOTS-1;i>=0&&n>0;i--){const s=G.inv[i];if(s&&s.id===id){const k=Math.min(s.n,n);s.n-=k;n-=k;if(s.n<=0)G.inv[i]=null}}
 ui.dirty=true;
}
/* Kaynak topla: yer varsa ekler, bildirim ve ses verir */
function gain(id,n){
 if(!canAdd(id,n)){HG.toast('Envanter dolu.');return false}
 add(id,n);flag('got_'+id);HG.feed('+'+n+' '+IT[id].n);HG.snd('get');if(HG.xpGain)HG.xpGain(.5);return true;
}
const held=()=>{const s=G.inv[G.sel];return s?{k:s.id,it:IT[s.id],s}:null};
const setObj=(i,v)=>{G.obj[i]=v;G.objDirty=true};
const flag=f=>{if(!G.flags[f])G.flags[f]=1};
Object.assign(HG,{count,canAdd,add,take,gain,held,setObj,flag});
})();
