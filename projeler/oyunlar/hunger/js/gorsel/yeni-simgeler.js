/* Hunger 3D - güncelleme 49 eşyalarının envanter simgeleri (2B tuval, 32×32). Özgün simgeler gorsel/simgeler.js içindedir. */
(()=>{
'use strict';
const {IT,ICON}=HG;
const cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const R=(g,c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
const C=(g,c,x,y,r)=>{g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,7);g.fill()};
const E=(g,c,x,y,rx,ry,a)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,a||0,0,7);g.fill()};
const P=(g,c,pts)=>{g.fillStyle=c;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill()};
const shadow=(g,x,y,rx,ry)=>E(g,'rgba(0,0,0,.22)',x,y,rx,ry);
const bottle=g=>{R(g,'rgba(190,230,240,.55)',11,12,10,16);R(g,'rgba(190,230,240,.55)',13,5,6,8);R(g,'#8b5a2b',13,3,6,3);R(g,'#e8fbff',12,14,2,10);R(g,'#7fb4c4',11,12,10,1);R(g,'#7fb4c4',11,27,10,1)};
const bowl=g=>{
 shadow(g,16,27,11,2.6);
 P(g,'#5a3a1c',[[4,15],[28,15],[25,24],[20,27],[12,27],[7,24]]);P(g,'#8f5f30',[[6,16],[26,16],[23,23],[19,25],[13,25],[9,23]]);
 R(g,'rgba(255,255,255,.14)',8,17,3,6);E(g,'#3a2412',16,15,12,3.6);E(g,'#6b4423',16,15.3,10.2,2.6);
};
const IC={
 seed:g=>{for(const [x,y,a] of [[11,20,.5],[20,17,-.45],[15,25,.1]]){g.save();g.translate(x,y);g.rotate(a);E(g,'#5a3b18',0,0,3.4,6);E(g,'#a6783a',-.8,-.8,1.5,3.6);R(g,'#3a2410',-.4,-6,.8,2);g.restore()}},
 wheat:g=>{for(const [x,a] of [[10,-.28],[16,0],[22,.28]]){g.save();g.translate(x,29);g.rotate(a);R(g,'#b8923c',-.8,-19,1.6,19);for(let i=0;i<5;i++){const c=i%2?'#e8c764':'#d9b24a';E(g,c,-2.6,-19+i*2.9,1.5,2.7,.55);E(g,c,2.6,-19+i*2.9,1.5,2.7,-.55)}E(g,'#f0d278',0,-23,1.5,3);g.restore()}},
 bread:g=>{shadow(g,16,26,13,2.8);P(g,'#7a4a1e',[[3,22],[5,14],[11,9],[21,9],[27,14],[29,22],[25,26],[7,26]]);P(g,'#c4833c',[[5,21],[7,14],[12,11],[20,11],[25,14],[27,21],[24,24],[8,24]]);P(g,'#e0a85a',[[9,15],[13,12],[18,12],[14,15]]);g.strokeStyle='#8a5424';g.lineWidth=1.3;for(const x of [11,15.5,20,24]){g.beginPath();g.moveTo(x-2,14);g.lineTo(x+1,21);g.stroke()}},
 bowl:bowl,
 stew:g=>{bowl(g);E(g,'#a6481f',16,14.6,10.2,2.8);E(g,'#c96a2c',15,14.2,6.5,1.7);C(g,'#e8d29a',12,14.6,1.5);C(g,'#7a3a18',19,14.8,1.7);C(g,'#5aa04a',15,15.4,1.1);g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=1.2;for(const x of [11,16,21]){g.beginPath();g.moveTo(x,10);g.bezierCurveTo(x-2,7,x+2,5,x,2);g.stroke()}},
 juice:g=>{bottle(g);R(g,'#a3203f',12,17,8,10);R(g,'#d9486a',12,17,8,2);R(g,'#7a1230',12,26,8,1);C(g,'#d4384a',25,25,3);R(g,'#3b8239',25,20,1.4,3)},
 jerky:g=>{for(const [y,a] of [[9,-.12],[16,.08],[23,-.06]]){g.save();g.translate(16,y);g.rotate(a);P(g,'#3a1a10',[[-13,-3.2],[12,-4],[14,3.2],[-12,4.2]]);P(g,'#70361f',[[-12,-2],[11,-3],[13,2.2],[-11,3.2]]);R(g,'#94502c',-10,-1.6,17,1.2);R(g,'#4a2012',-8,1,14,.9);g.restore()}},
 dfish:g=>{P(g,'#7a5a2e',[[2,16],[8,9],[22,9],[27,16],[22,23],[8,23]]);P(g,'#c9a468',[[5,16],[9,11.5],[21,11.5],[24,16],[20,20.5],[9,20.5]]);P(g,'#7a5a2e',[[26,16],[31,9],[31,23]]);C(g,'#3a2a14',8,15,1.2);for(const x of [12,15,18])R(g,'#a7814a',x,12,1,9);R(g,'#e0c690',10,13,12,1)},
 mushroom:g=>{shadow(g,16,28,8,2);R(g,'#e8dcc0',13,16,6,11);R(g,'#c9bb98',17,16,2,11);g.fillStyle='#6e4020';g.beginPath();g.ellipse(16,16,11,9,0,Math.PI,0);g.closePath();g.fill();g.fillStyle='#9a6030';g.beginPath();g.ellipse(14.5,14.5,8,5.8,0,Math.PI,0);g.closePath();g.fill();E(g,'rgba(255,255,255,.28)',11,10.5,3,1.5,-.5);R(g,'#4a2a12',5,16,22,1.4)},
 cmush:g=>{shadow(g,16,28,8,2);R(g,'#cdbb8c',13,16,6,11);R(g,'#a79468',17,16,2,11);g.fillStyle='#4a2a12';g.beginPath();g.ellipse(16,16,11,9,0,Math.PI,0);g.closePath();g.fill();g.fillStyle='#7a4a22';g.beginPath();g.ellipse(14.5,14.5,8,5.8,0,Math.PI,0);g.closePath();g.fill();g.strokeStyle='#2a160a';g.lineWidth=1.1;for(const x of [11,15,19]){g.beginPath();g.moveTo(x,9);g.lineTo(x+3,15);g.stroke()}R(g,'#2a160a',5,16,22,1.4)},
 egg:g=>{shadow(g,16,27,8,2.4);g.fillStyle='#d9cdb4';g.beginPath();g.ellipse(16,16,8.5,11,0,0,7);g.fill();g.fillStyle='#f4ecd8';g.beginPath();g.ellipse(15.2,15,7.6,10,0,0,7);g.fill();E(g,'rgba(255,255,255,.7)',12,10,2.2,3.4,-.4);E(g,'rgba(160,130,90,.22)',19,21,3,2.4)},
 cegg:g=>{shadow(g,16,27,12,2.4);E(g,'#d8d2c2',16,16,12,10);E(g,'#fbf7ec',16,15.5,11,9);E(g,'#e8a82a',16,16,5.6,5);E(g,'#ffd45a',15,14.8,3.8,3.2);E(g,'rgba(255,255,255,.7)',13.5,13.6,1.3,1)},
 feather:g=>{g.save();g.translate(16,16);g.rotate(-.75);E(g,'#cfc7b4',1,1,5.6,14);E(g,'#ece6d6',-.4,0,5,13);E(g,'#fff',-1.8,-3,1.5,6);g.strokeStyle='#bdb49c';g.lineWidth=.9;for(let y=-10;y<10;y+=3){g.beginPath();g.moveTo(0,y);g.lineTo(-5,y-3);g.moveTo(0,y);g.lineTo(5,y-3);g.stroke()}R(g,'#8f836a',-.6,-14,1.2,31);g.restore()},
 salve:g=>{shadow(g,16,28,10,2.2);P(g,'#4a5a3a',[[7,13],[25,13],[26,26],[22,28],[10,28],[6,26]]);P(g,'#8fae6a',[[9,14],[23,14],[24,25],[21,27],[11,27],[8,25]]);R(g,'rgba(255,255,255,.22)',10,15,3,10);R(g,'#7a5230',6,8,20,6);R(g,'#a87440',6,8,20,2);R(g,'#5a3a1c',6,13,20,1.2);R(g,'#f1eee6',12,17,8,6);R(g,'#d9463c',15,18,2,4);R(g,'#d9463c',13,19,6,2)},
 msg:g=>{g.save();g.translate(16,16);g.rotate(-.6);R(g,'rgba(190,230,240,.6)',-13,-6,22,12);R(g,'rgba(190,230,240,.6)',8,-3.5,6,7);R(g,'#8b5a2b',13,-3,4,6);R(g,'#e8fbff',-12,-5,18,2);R(g,'#f1e6c4',-10,-3,16,6);R(g,'#d9c892',-10,-3,16,1.2);R(g,'#8a7440',-8,-.5,11,.8);R(g,'#8a7440',-8,1.4,8,.8);C(g,'#c4403a',4,2,1.7);g.restore()},
 vest:g=>{P(g,'#5a3a1c',[[10,4],[14,3],[18,3],[22,4],[26,9],[23,14],[23,28],[9,28],[9,14],[6,9]]);P(g,'#8f5d31',[[11,5],[15,4],[17,4],[21,5],[24,9],[21,13],[21,26],[11,26],[11,13],[8,9]]);R(g,'#4a2f18',15,4,2,23);for(const y of [9,14,19,24])R(g,'#d9c08a',14,y,4,1.4);R(g,'rgba(255,255,255,.14)',12,8,3,14)},
 iarmor:g=>{P(g,'#3d4249',[[10,4],[14,3],[18,3],[22,4],[27,9],[24,15],[23,28],[9,28],[8,15],[5,9]]);P(g,'#8d939a',[[11,5],[15,4],[17,4],[21,5],[25,9],[22,14],[21,26],[11,26],[10,14],[7,9]]);P(g,'#c3c9d0',[[12,6],[16,5],[16,14],[11,13],[9,9]]);R(g,'#5b6168',15.2,4,1.6,23);R(g,'#4a4f55',10,16,12,2);for(const [x,y] of [[11,8],[21,8],[12,20],[20,20]])C(g,'#d6dbe0',x,y,1)},
 spear2:g=>{g.save();g.translate(16,16);g.rotate(Math.PI/4);R(g,'#8a5a30',-1.5,-8,3,26);R(g,'#a87440',-1.5,-8,1.2,26);P(g,'#858b93',[[0,-18],[-4.6,-8],[4.6,-8]]);P(g,'#c3c9d0',[[0,-16.4],[-2,-8.6],[1.2,-8.6]]);P(g,'#f1f4f8',[[0,-15],[-.8,-10],[.6,-10]]);R(g,'#3a3d42',-3,-8,6,2.4);R(g,'#5a3519',-2,3,4,1.4);g.restore()},
 spyglass:g=>{g.save();g.translate(16,16);g.rotate(-Math.PI/4);R(g,'#4a2f18',-14,-3,11,6);R(g,'#8a5a30',-14,-3,11,2);R(g,'#b08d3a',-4,-3.8,5,7.6);R(g,'#e0c060',-4,-3.8,5,2);R(g,'#6b5a2a',1,-4.6,9,9.2);R(g,'#c2a247',1,-4.6,9,2.6);R(g,'#8f7a2e',9,-5.4,4,10.8);C(g,'#7ec8e8',14,0,3.8);C(g,'#e8fbff',13,-1.2,1.5);g.restore()},
 bed:g=>{shadow(g,16,29,13,2);R(g,'#4a2f18',4,22,3,7);R(g,'#4a2f18',25,22,3,7);R(g,'#7a5230',3,19,26,4);R(g,'#a87440',3,19,26,1.4);P(g,'#a8843e',[[4,14],[28,14],[29,20],[3,20]]);P(g,'#d9b866',[[5,14],[27,14],[27,17],[5,17]]);for(let x=7;x<28;x+=4)R(g,'#8f6f2e',x,14,1,6);E(g,'#f1ede2',9,12,6.5,3.6);E(g,'#fff',8,11,4.4,1.6)},
 rack:g=>{shadow(g,16,29,13,2);R(g,'#4a2f18',4,5,3,24);R(g,'#4a2f18',25,5,3,24);R(g,'#7a5230',3,5,26,3);R(g,'#a87440',3,5,26,1.2);R(g,'#7a5230',4,24,24,2);for(const x of [9,15,21]){R(g,'#d9c08a',x+1.2,8,.8,3);P(g,'#3a1a10',[[x,11],[x+3.4,11],[x+3,22],[x+.4,22]]);P(g,'#70361f',[[x+.6,11.4],[x+2.8,11.4],[x+2.4,21.4],[x+1,21.4]])}},
 barrel:g=>{shadow(g,16,29,10,2);P(g,'#4a2f18',[[6,6],[26,6],[28,17],[26,28],[6,28],[4,17]]);P(g,'#8f5f30',[[8,7],[24,7],[26,17],[24,27],[8,27],[6,17]]);R(g,'rgba(255,255,255,.14)',9,8,3,18);for(const x of [13,19])R(g,'#5a3a1c',x,7,1,20);R(g,'#3a3d42',5,10,22,2);R(g,'#3a3d42',4,21,24,2);R(g,'#6b727a',5,10,22,.8);R(g,'#6b727a',4,21,24,.8);E(g,'#3a2412',16,6,10,2.8);E(g,'#3f90d6',16,6,8.6,2.1);E(g,'#7fc0f0',14,5.6,4,.9)},
 tpost:g=>{shadow(g,16,29,8,2);R(g,'#5a3a1c',14,13,4,16);R(g,'#8f5d31',14,13,1.5,16);R(g,'#3a2a1a',10.5,11,11,4);R(g,'#5a4430',10.5,11,11,1.4);P(g,'#ff7a12',[[16,0],[10,11],[22,11]]);P(g,'#ffc233',[[16,4],[12.6,11],[19.4,11]]);P(g,'#fff2b0',[[16,7],[14.4,11],[17.6,11]]);R(g,'#4a3320',10,27,12,2.4);R(g,'#6a4a2c',10,27,12,1)},
 snare:g=>{shadow(g,16,28,12,2.4);g.strokeStyle='#6b4423';g.lineWidth=3;g.beginPath();g.moveTo(5,27);g.lineTo(12,7);g.moveTo(27,27);g.lineTo(20,7);g.stroke();g.strokeStyle='#a87440';g.lineWidth=1;g.beginPath();g.moveTo(5.8,26);g.lineTo(12.4,8);g.moveTo(26.2,26);g.lineTo(19.6,8);g.stroke();g.strokeStyle='#d9c08a';g.lineWidth=1.6;g.beginPath();g.moveTo(12,8);g.quadraticCurveTo(16,3,20,8);g.stroke();g.beginPath();g.ellipse(16,19,6.5,5,0,0,7);g.stroke();g.strokeStyle='#8a6a3a';g.lineWidth=.8;g.beginPath();g.ellipse(16,19,6.5,5,0,0,7);g.stroke();C(g,'#c42d3a',16,19,1.6)},
 plot:g=>{P(g,'#3a2412',[[2,17],[16,8],[30,17],[16,28]]);P(g,'#5a3a1c',[[4,17],[16,10],[28,17],[16,26]]);P(g,'#6b4423',[[7,17],[16,12],[25,17],[16,23]]);g.strokeStyle='#3a2412';g.lineWidth=1;g.beginPath();g.moveTo(10,14);g.lineTo(22,21);g.moveTo(13,12.5);g.lineTo(25,19.5);g.moveTo(7,16);g.lineTo(18,23);g.stroke();for(const [x,y] of [[11,17],[16,14],[21,17],[16,20]]){R(g,'#3f8a3a',x-.6,y-6,1.4,6);P(g,'#6cc45a',[[x+.8,y-6],[x+5,y-8.6],[x+3.4,y-3.4]]);P(g,'#4aa044',[[x-.6,y-5],[x-4.6,y-7.4],[x-3,y-2.6]])}}
};
for(const k in IC){
 if(!IT[k])continue;
 const c=cv(32,32),g=c.getContext('2d');
 IC[k](g);
 ICON[k]=c.toDataURL();IT[k].cv=c;
}
HG.ICON2=IC;
})();
