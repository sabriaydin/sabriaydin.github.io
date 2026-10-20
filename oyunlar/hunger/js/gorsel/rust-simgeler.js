/* Hunger 3D - Rust tarzı inşa simgeleri (60. güncelleme): radyal menü parçaları, seviyeler ve kapı eşyaları */
(()=>{
'use strict';
const SP=HG.SP,IT=HG.IT,ICON=HG.ICON;if(!SP)return;
const mk=fn=>{const c=document.createElement('canvas');c.width=c.height=32;fn(c.getContext('2d'));return c};
const R=(g,c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
const P=(g,c,pts)=>{g.fillStyle=c;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();g.fill()};
const C=(g,c,x,y,r)=>{g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,7);g.fill()};
/* Seviye dokuları */
const tex=(g,tr,x,y,w,h)=>{
 if(tr===0){R(g,'#5b4326',x,y,w,h);for(let k=0;k<w;k+=3){R(g,['#a88a5c','#947646','#b39766'][(k/3|0)%3],x+k,y,2,h)}R(g,'#8a6c40',x,y+h*.3,w,1.5);R(g,'#8a6c40',x,y+h*.7,w,1.5)}
 else if(tr===1){R(g,'#6f4a28',x,y,w,h);for(let k=0;k<w;k+=5){R(g,['#9a6b3c','#8e6035','#a87a4c'][(k/5|0)%3],x+k,y,4,h)}R(g,'#77512d',x,y+h*.25,w,1.5);R(g,'#77512d',x,y+h*.75,w,1.5)}
 else if(tr===2){R(g,'#70707a',x,y,w,h);for(let r=0,yy=y;yy<y+h;yy+=4,r++){R(g,'#8f8f98',x,yy,w,3);for(let xx=x-(r&1)*3;xx<x+w;xx+=7)R(g,'#5a5a62',xx,yy,1,3)}}
 else if(tr===3){R(g,'#5d646b',x,y,w,h);for(let k=0;k<w;k+=2){R(g,k%4?'#7e858c':'#9aa1a9',x+k,y,1.5,h)}R(g,'#7a3f1d',x+w*.2,y+h*.6,w*.2,h*.25)}
 else{R(g,'#2b2f34',x,y,w,h);R(g,'#3e444b',x+1,y+1,w-2,h-2);R(g,'#2b2f34',x+w/2-.5,y,1,h);R(g,'#2b2f34',x,y+h/2-.5,w,1);for(const [px,py] of [[x+3,y+3],[x+w-3,y+3],[x+3,y+h-3],[x+w-3,y+h-3]])C(g,'#aab1b8',px,py,1.2)}
};
const T=[0,1,2,3,4];
T.slice(1).forEach(tr=>{SP['rs_t'+tr]=mk(g=>{R(g,'#1c1814',2,2,28,28);tex(g,tr,4,4,24,24);R(g,'rgba(255,255,255,.18)',4,4,24,2)})});
const tr0=2;       /* menü simgeleri taş dokulu görünür; parça biçimi önemlidir */
const slab=(g,top,side,y,th)=>{P(g,top,[[16,y],[30,y+7],[16,y+14],[2,y+7]]);P(g,side,[[2,y+7],[16,y+14],[16,y+14+th],[2,y+7+th]]);P(g,'#4a3a2a',[[30,y+7],[16,y+14],[16,y+14+th],[30,y+7+th]])};
SP.rs_found=mk(g=>{slab(g,'#9a8a74','#6d6254',7,9);P(g,'#cdb995',[[16,7],[30,14],[16,21],[2,14]]);P(g,'#9a8a74',[[16,9],[27,14],[16,19],[5,14]])});
SP.rs_floor=mk(g=>{slab(g,'#a87a4c','#6f4a28',13,5);g.strokeStyle='#6f4a28';g.lineWidth=1;g.beginPath();g.moveTo(9,17);g.lineTo(23,10);g.moveTo(16,21);g.lineTo(30,14);g.moveTo(2,14);g.lineTo(16,7);g.stroke()});
const wallBody=(g,y0,h,tr)=>{R(g,'#1c1814',3,y0-1,26,h+2);tex(g,tr,4,y0,24,h);R(g,'rgba(255,255,255,.2)',4,y0,24,1.5)};
SP.rs_wall=mk(g=>{wallBody(g,3,27,1)});
SP.rs_door=mk(g=>{R(g,'#1c1814',3,2,26,29);tex(g,1,4,3,6,27);tex(g,1,22,3,6,27);tex(g,1,4,3,24,6);R(g,'#2a1c10',10,9,12,21);R(g,'#3a2a1a',10,9,12,2)});
SP.rs_win=mk(g=>{wallBody(g,3,27,1);R(g,'#1c1814',9,10,14,10);R(g,'#8fb7d8',10,11,12,8);R(g,'#bcd8ec',10,11,12,2);R(g,'#5a3a1e',15.5,11,1.5,8)});
SP.rs_half=mk(g=>{wallBody(g,15,15,1);R(g,'#1c1814',3,13,26,2);R(g,'#2a2420',3,13,26,1)});
SP.rs_low=mk(g=>{wallBody(g,21,9,2)});
SP.rs_stairs=mk(g=>{for(let k=0;k<5;k++){const x=3+k*5,y=27-k*5;R(g,'#1c1814',x,y-1,6,k*5+6);R(g,'#8e6035',x+.5,y,5,k*5+5);R(g,'#c8935a',x+.5,y,5,2)}});
/* Kapı eşyaları (envanter simgeleri) */
const doorIcon=(tr)=>g=>{R(g,'#1c1814',5,2,22,29);tex(g,tr===0?1:tr,6,3,20,27);R(g,'rgba(255,255,255,.2)',6,3,20,2);C(g,tr===1?'#aab1b8':tr===2?'#e6c24a':'#d2b24a',22,18,1.8)};
const D={door:doorIcon(0),mdoor:doorIcon(3),adoor:doorIcon(4)};
for(const k in D){
 if(!IT||!IT[k])continue;
 const c=document.createElement('canvas');c.width=c.height=32;D[k](c.getContext('2d'));
 if(ICON)ICON[k]=c.toDataURL();IT[k].cv=c;
}
void tr0;
})();
