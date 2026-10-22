/* Hunger 3D - inşa sistemi (58. güncelleme) simgeleri: radyal menü ve ipuçları için parça sprite'ları */
(()=>{
'use strict';
const SP=HG.SP;if(!SP)return;
const mk=(fn)=>{const c=document.createElement('canvas');c.width=c.height=32;fn(c.getContext('2d'));return c};
const R=(g,c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
const C=(g,c,x,y,r)=>{g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,7);g.fill()};
const wallBase=(g,a,b,hi)=>{R(g,'#241a10',0,0,32,32);R(g,a,0,0,32,10);R(g,b,0,22,32,10);R(g,hi,0,0,32,2);R(g,hi,0,22,32,2)};
/* pencereli duvar */
SP.winw=mk(g=>{wallBase(g,'#8a6038','#7a5030','#b08050');R(g,'#2a1c10',0,10,32,12);R(g,'#8fb7d8',7,11,18,10);R(g,'#bcd8ec',7,11,18,2);R(g,'#5a3a1e',15,10,2,12);R(g,'#5a3a1e',6,15,20,2);R(g,'#8a6038',0,10,6,12);R(g,'#8a6038',26,10,6,12)});
SP.wins=mk(g=>{wallBase(g,'#7d7d86','#6c6c75','#a4a4ac');R(g,'#1c1c22',0,10,32,12);R(g,'#8fb7d8',7,11,18,10);R(g,'#bcd8ec',7,11,18,2);R(g,'#4a4a52',15,10,2,12);R(g,'#7d7d86',0,10,6,12);R(g,'#7d7d86',26,10,6,12);R(g,'#555',0,16,6,1);R(g,'#555',26,16,6,1)});
SP.winm=mk(g=>{wallBase(g,'#8e959c','#7e858c','#b4bbc2');R(g,'#1c1f23',0,10,32,12);for(const x of [9,14,19,24])R(g,'#aab1b8',x,10,2,12);R(g,'#5b6168',0,10,6,12);R(g,'#5b6168',26,10,6,12);for(const [x,y] of [[3,13],[3,19],[29,13],[29,19]])C(g,'#d6dbe0',x,y,1.2)});
/* geçit */
SP.archw=mk(g=>{R(g,'#241a10',0,0,32,32);R(g,'#2c1f12',6,6,20,26);R(g,'#7a5430',2,4,5,28);R(g,'#7a5430',25,4,5,28);R(g,'#a47544',2,4,2,28);R(g,'#a47544',25,4,2,28);R(g,'#6a4527',0,2,32,6);R(g,'#a47544',0,2,32,1.5);R(g,'#6a4527',6,8,5,5);R(g,'#6a4527',21,8,5,5)});
SP.archs=mk(g=>{R(g,'#1c1c22',0,0,32,32);for(const x of [2,25]){R(g,'#7d7d86',x,8,5,24);R(g,'#a4a4ac',x,8,2,24);for(let y=14;y<32;y+=7)R(g,'#555',x,y,5,1)}g.strokeStyle='#8a8a92';g.lineWidth=5;g.beginPath();g.arc(16,16,11,Math.PI,0);g.stroke();g.strokeStyle='#a4a4ac';g.lineWidth=1.5;g.beginPath();g.arc(16,16,13,Math.PI,0);g.stroke();R(g,'#a0a0a8',13,1,6,6)});
/* çit kapısı */
SP.gate=mk(g=>{R(g,'#241a10',0,0,32,32);R(g,'#4a3118',2,6,5,26);R(g,'#8a6038',2,6,5,26);R(g,'#a47544',2,6,2,26);R(g,'#8a6038',25,6,5,26);R(g,'#a47544',25,6,2,26);R(g,'#6b4a29',7,10,18,4);R(g,'#6b4a29',7,22,18,4);g.strokeStyle='#5a3a1e';g.lineWidth=2.5;g.beginPath();g.moveTo(8,25);g.lineTo(24,11);g.stroke();R(g,'#a47544',7,10,18,1);R(g,'#a47544',7,22,18,1);C(g,'#6a6a74',9,12,1.5);C(g,'#6a6a74',9,24,1.5)});
SP.gatem=mk(g=>{R(g,'#202327',0,0,32,32);R(g,'#3d4248',2,6,5,26);R(g,'#3d4248',25,6,5,26);R(g,'#6b727a',2,6,2,26);for(const x of [9,13,17,21])R(g,'#aab1b8',x,9,2,19);R(g,'#4a4f56',7,8,18,3);R(g,'#4a4f56',7,26,18,3);C(g,'#e6c24a',23,18,1.6)});
/* alçak taş duvar, tel örgü çit */
SP.fences=mk(g=>{R(g,'#1c1c22',0,0,32,32);const rows=[[8,9],[17,9],[26,7]];let o=0;for(let y=10;y<30;y+=7){for(let x=-(o%2)*5;x<32;x+=10){R(g,'#6c6c75',x+1,y,9,6);R(g,'#8a8a92',x+1,y,9,2);R(g,'#4a4a52',x+1,y+5,9,1)}o++}R(g,'#a4a4ac',0,7,32,3)});
SP.fencem=mk(g=>{R(g,'#202327',0,0,32,32);for(const x of [3,26])R(g,'#474c53',x,6,4,26);R(g,'#6b727a',3,6,1.5,26);g.strokeStyle='#aab1b8';g.lineWidth=1;for(let i=-24;i<32;i+=6){g.beginPath();g.moveTo(7+i,10);g.lineTo(7+i+22,32);g.stroke();g.beginPath();g.moveTo(29+i,10);g.lineTo(29+i-22,32);g.stroke()}R(g,'#474c53',3,5,28,3)});
/* çekiç menüsü yeni öğeleri */
SP.hrot=mk(g=>{g.strokeStyle='#241a10';g.lineWidth=6;g.beginPath();g.arc(16,16,9,.4,5.2);g.stroke();g.strokeStyle='#8fd0ff';g.lineWidth=3;g.beginPath();g.arc(16,16,9,.4,5.2);g.stroke();g.fillStyle='#8fd0ff';g.beginPath();g.moveTo(22,3);g.lineTo(29,12);g.lineTo(18,12);g.closePath();g.fill()});
SP.hnext=mk(g=>{R(g,'#8a6038',3,20,10,8);R(g,'#7d7d86',12,12,10,16);R(g,'#8e959c',21,4,9,24);g.fillStyle='#ffe08a';g.beginPath();g.moveTo(3,10);g.lineTo(12,4);g.lineTo(12,16);g.closePath();g.fill();R(g,'#ffe08a',0,8,6,3)});
SP.hbulk=mk(g=>{for(const [x,y] of [[2,2],[12,2],[22,2],[2,12],[12,12],[22,12]]){R(g,'#7d7d86',x,y,8,8);R(g,'#a4a4ac',x,y,8,2)}g.fillStyle='#ffe08a';g.beginPath();g.moveTo(16,18);g.lineTo(26,28);g.lineTo(6,28);g.closePath();g.fill()});
SP.hpick=mk(g=>{g.strokeStyle='#241a10';g.lineWidth=6;g.beginPath();g.moveTo(6,26);g.lineTo(18,14);g.stroke();g.strokeStyle='#8fd0ff';g.lineWidth=3;g.beginPath();g.moveTo(6,26);g.lineTo(18,14);g.stroke();C(g,'#241a10',21,11,7);C(g,'#d9f0ff',21,11,5)});
})();
