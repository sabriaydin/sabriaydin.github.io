/* Hunger 3D - yere atılan eşyalar: atma, düşme fiziği, yakına gelince toplama */
(()=>{
'use strict';
const {W,H,T,SOLID,IT,G,Scene,add,flag}=HG;
const MAX=300,PICK_R=2.2;

function spawnDrop(id,n,pos){
 if(!G.drops)G.drops=[];
 const nd=G.drops.length;
 const fx=G.fx||0,fy=G.fy||-1;
 if(pos)G.drops.push({id,n,x:pos.x,z:pos.z,y:pos.y,vx:pos.vx||0,vz:pos.vz||0,vy:2.5,age:0,rest:false});
 else G.drops.push({id,n,x:G.px+fx*.6,z:G.py+fy*.6,y:(G.pz!==undefined?G.pz:0)+1.3,vx:fx*3.2,vz:fy*3.2,vy:2.5,age:0,rest:false});
 if(G.drops.length>MAX)G.drops.shift();
 return G.drops[G.drops.length-1];
}
/* Envanterdeki bir kutunun tamamını yere at */
function dropSlot(i){
 const s=G.inv[i];if(!s)return;
 spawnDrop(s.id,s.n);G.inv[i]=null;HG.ui.dirty=true;
 HG.feed('Atıldı: '+s.n+' '+IT[s.id].n);
}
/* Seçili hızlı erişim kutusundan 1 adet at */
function dropOne(){
 const s=G.inv[G.sel];if(!s||HG.ui.state!=='play')return;
 spawnDrop(s.id,1);s.n--;if(s.n<=0)G.inv[G.sel]=null;
 HG.ui.dirty=true;HG.snd('ui');HG.feed('Atıldı: 1 '+IT[s.id].n);
}
function updateDrops(dt){
 const L=G.drops;G.nearDrop=null;if(!L||!L.length)return;
 let best=PICK_R,near=null;
 for(let k=L.length-1;k>=0;k--){
  const d=L[k];d.age+=dt;
  if(!d.rest){
   d.vy-=18*dt;d.x+=d.vx*dt;d.z+=d.vz*dt;d.y+=d.vy*dt;
   const tx=Math.floor(d.x),tz=Math.floor(d.z);
   if(tx<0||tz<0||tx>=W||tz>=H){L.splice(k,1);continue}
   const i=tz*W+tx;
   if(SOLID(G.obj[i])){d.x-=d.vx*dt;d.z-=d.vz*dt;d.vx*=-.3;d.vz*=-.3}
   const t=G.tile[i],wet=(t<=T.SHAL||t===T.POND),gy=wet?HG.sc.WY:Scene.groundY(d.x,d.z);
   if(d.y<=gy+.12&&d.vy<=0){
    d.y=gy+.12;
    if(wet){                                   /* suya düşen eşya yüzer ve akıntıyla sürüklenir */
     if(-d.vy>2.5&&HG.sc.fx)HG.sc.fx.ring(d.x,d.z);
     d.fl=true;d.vy=0;d.vx*=.3;d.vz*=.3;
    }else if(-d.vy>1.6){                       /* sekme: enerji kaybıyla */
     d.vy=-d.vy*.35;d.vx*=.7;d.vz*=.7;d.bn=(d.bn||0)+1;
    }else{d.vy=0;d.rest=!(Math.hypot(d.vx,d.vz)>.15)}
   }
   if(d.fl){
    d.y=HG.sc.WY+.1+Math.sin(d.age*2.4+d.x)*.025;
    const w=HG.sc.wind||{x:0,z:0,s:0};
    d.vx+=(w.x*.12*w.s-d.vx)*Math.min(1,dt*1.2);d.vz+=(w.z*.12*w.s-d.vz)*Math.min(1,dt*1.2);
    if(t===T.DEEP&&d.age>25){L.splice(k,1);continue}   /* derin suda bir süre yüzdükten sonra batar */
    if(!wet){d.fl=false;d.rest=false}
   }else if(!d.rest){
    /* eğimde kayma ve yuvarlanma */
    const g0=Scene.groundY(d.x,d.z),gx=Scene.groundY(d.x+.4,d.z)-Scene.groundY(d.x-.4,d.z),gz=Scene.groundY(d.x,d.z+.4)-Scene.groundY(d.x,d.z-.4);
    d.vx-=gx*2.2*dt;d.vz-=gz*2.2*dt;
    const fr=1-Math.min(1,(d.y<=g0+.2?3:.4)*dt);d.vx*=fr;d.vz*=fr;
    if(d.y<=g0+.13&&Math.hypot(d.vx,d.vz)<.12&&Math.abs(d.vy)<.5){d.rest=true;d.vx=d.vz=d.vy=0}
   }
  }else{
   /* durgun eşya zemin değişirse (ör. kazı) yeniden düşer */
   const t=G.tile[Math.floor(d.z)*W+Math.floor(d.x)];
   if(t<=T.SHAL||t===T.POND){d.rest=false;d.fl=true}
  }
  /* E ile alınabilecek en yakın eşya */
  if(d.age>.3){const dd=Math.hypot(d.x-G.px,d.z-G.py);if(dd<best){best=dd;near=d}}
 }
 G.nearDrop=near;
}
/* E tuşu: yakındaki yerdeki eşyayı al (yer yoksa kısmen) */
function pickupNearest(){
 const d=G.nearDrop;if(!d||!G.drops.includes(d))return false;
 const left=add(d.id,d.n);
 if(left>=d.n){HG.toast('Envanter dolu.');return true}
 flag('got_'+d.id);HG.feed('+'+(d.n-left)+' '+IT[d.id].n);HG.snd('get');HG.extGot&&HG.extGot(d.id,d.n-left);
 if(left<=0)G.drops.splice(G.drops.indexOf(d),1);else d.n=left;
 G.nearDrop=null;return true;
}
Object.assign(HG,{spawnDrop,dropSlot,dropOne,updateDrops,pickupNearest});
})();
