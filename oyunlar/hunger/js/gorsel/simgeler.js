/* Hunger 3D - envanter simgeleri (2B tuval ile çizilir) */
(()=>{
'use strict';
const {TS,IT,O,mulberry32}=HG;
/* ---------- Spritelar ---------- */
const SP={};
const cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const mk=(w,h,fn)=>{const c=cv(w,h),g=c.getContext('2d');fn(g);return c};
const R=(g,c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
const C=(g,c,x,y,r)=>{g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,7);g.fill()};
const P=(g,c,pts)=>{g.fillStyle=c;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill()};
function groundTex(base,cols,n,seed,blade){
 const out=[];
 for(let v=0;v<4;v++){
  const rnd=mulberry32(seed*31+v);
  out.push(mk(TS,TS,g=>{
   R(g,base,0,0,TS,TS);
   for(let k=0;k<n;k++){
    const c=cols[(rnd()*cols.length)|0],x=(rnd()*TS)|0,y=(rnd()*TS)|0;
    if(blade){R(g,c,x,y,1,3);R(g,c,x+1,y+1,1,2)}else R(g,c,x,y,1+((rnd()*2)|0),1+((rnd()*2)|0));
   }
  }));
 }
 return out;
}
function buildSprites(){
 SP.grass=groundTex('#3f7d3a',['#356c32','#4b8c44','#2f6030','#57a04c'],46,1,true);
 SP.sand=groundTex('#d9c58b',['#c9b377','#e6d6a2','#bfa86c'],34,2,false);
 SP.rock=groundTex('#6f6a63',['#5e5a54','#807b73','#54504b','#8d887f'],40,3,false);
 for(let v=0;v<2;v++)SP['tree'+v]=mk(32,48,g=>{
  g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(16,44,11,4,0,0,7);g.fill();
  R(g,'#5a3a1e',13,28,6,17);R(g,'#7a5230',13,28,3,17);
  const a=v?'#2a6428':'#2f6b2c',b=v?'#37772f':'#3b7f35',c=v?'#47903c':'#4a9440';
  C(g,a,16,20,13);C(g,a,8,25,8);C(g,a,24,25,8);C(g,b,13,16,10);C(g,b,21,20,8);C(g,c,18,12,7);C(g,c,10,19,5);
  R(g,'#1d4a1d',7,28,3,1);R(g,'#1d4a1d',21,30,4,1);
 });
 const palm=(nuts)=>mk(32,48,g=>{
  g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(16,44,10,3.5,0,0,7);g.fill();
  g.strokeStyle='#8a6a3c';g.lineWidth=4;g.beginPath();g.moveTo(15,45);g.quadraticCurveTo(21,30,17,15);g.stroke();
  g.strokeStyle='#6c4f28';g.lineWidth=1;for(let y=40;y>18;y-=5){g.beginPath();g.moveTo(14,y);g.lineTo(20,y-1);g.stroke()}
  g.strokeStyle='#3f8a3a';g.lineWidth=3;
  for(const [dx,dy] of [[-12,6],[-9,-2],[0,-6],[11,-1],[13,7],[-5,9],[7,10]]){g.beginPath();g.moveTo(17,15);g.quadraticCurveTo(17+dx*.6,15+dy-6,17+dx,15+dy+2);g.stroke()}
  g.strokeStyle='#58a84c';g.lineWidth=1;g.beginPath();g.moveTo(17,15);g.lineTo(5,18);g.moveTo(17,15);g.lineTo(29,17);g.stroke();
  if(nuts){C(g,'#5b3a1c',15,18,2.5);C(g,'#6e4723',20,19,2.5);C(g,'#4c2f16',17,21,2.3)}
 });
 SP.palm=palm(true);SP.palm0=palm(false);
 const stoneBase=(g,c1,c2,c3)=>{
  g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(16,27,12,4,0,0,7);g.fill();
  P(g,c2,[[4,25],[6,13],[13,6],[22,7],[28,15],[27,25]]);
  P(g,c1,[[6,24],[8,14],[14,8],[21,9],[25,16],[25,24]]);
  P(g,c3,[[10,12],[14,8],[19,9],[16,13]]);
 };
 SP.rockobj=mk(32,32,g=>stoneBase(g,'#8d8d8d','#686868','#b3b3b3'));
 const ore=(fn)=>mk(32,32,g=>{stoneBase(g,'#6c6c74','#4c4c53','#8b8b93');fn(g)});
 SP.coal=ore(g=>{C(g,'#15151a',12,16,3.5);C(g,'#1d1d23',19,13,3);C(g,'#101014',20,20,3.5);C(g,'#2a2a31',11,21,2.5);R(g,'#555',11,14,2,1);R(g,'#555',19,11,2,1)});
 SP.copper=ore(g=>{C(g,'#c8743a',12,16,3.5);C(g,'#d9854a',19,13,3);C(g,'#b4602b',20,20,3.5);C(g,'#6fb79a',11,21,2);C(g,'#6fb79a',24,17,1.6)});
 SP.iron=ore(g=>{C(g,'#b99a80',12,16,3.5);C(g,'#a07a5f',19,13,3);C(g,'#8b5a3c',20,20,3.5);C(g,'#d1b79c',11,21,2.2);R(g,'#e6d3bd',11,14,2,1)});
 const bush=(berries)=>mk(32,32,g=>{
  g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(16,26,11,3.5,0,0,7);g.fill();
  C(g,'#2c6a2d',16,19,10);C(g,'#2c6a2d',9,21,6);C(g,'#2c6a2d',23,21,6);C(g,'#3b8239',14,15,8);C(g,'#4a9a45',20,17,5);
  if(berries){for(const [x,y] of [[11,17],[17,13],[21,19],[14,22],[24,22],[9,23]]){C(g,'#c42d3a',x,y,2.2);R(g,'#ff8a8a',x-1,y-1,1,1)}}
 });
 SP.bush=bush(true);SP.bush0=bush(false);
 SP.fire=mk(32,32,g=>{
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(16,26,12,4,0,0,7);g.fill();
  for(let a=0;a<8;a++){C(g,a%2?'#8d8d8d':'#6b6b6b',16+Math.cos(a/8*6.283)*11,23+Math.sin(a/8*6.283)*4.5,3)}
  g.save();g.translate(16,22);g.rotate(.5);R(g,'#6b4423',-10,-2,20,4);R(g,'#8a5a30',-10,-2,20,1.5);g.restore();
  g.save();g.translate(16,22);g.rotate(-.5);R(g,'#5a3a1e',-10,-2,20,4);R(g,'#7a4f29',-10,-2,20,1.5);g.restore();
  R(g,'#1b1008',12,21,8,3);
 });
 SP.bench=mk(32,32,g=>{
  g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(16,28,14,3.5,0,0,7);g.fill();
  R(g,'#5a3a1e',5,16,3,12);R(g,'#5a3a1e',24,16,3,12);R(g,'#4a2f18',5,26,3,2);R(g,'#4a2f18',24,26,3,2);
  R(g,'#a47544',2,9,28,9);R(g,'#c49058',2,9,28,3);R(g,'#7e5a33',2,16,28,2);
  R(g,'#6b4a29',9,9,1,9);R(g,'#6b4a29',17,9,1,9);R(g,'#6b4a29',24,9,1,9);
  R(g,'#8d8d8d',20,5,7,3);R(g,'#6b4423',23,3,2,6);R(g,'#bbb',20,5,3,1);
  R(g,'#5a3a1e',6,6,6,3);R(g,'#c0c0c0',5,4,8,2);
 });
 SP.furn=mk(32,32,g=>{
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(16,29,14,3.5,0,0,7);g.fill();
  R(g,'#55555c',4,10,24,19);R(g,'#7a7a82',4,10,24,5);R(g,'#42424a',4,26,24,3);
  for(const y of [15,20,25])R(g,'#3c3c42',4,y,24,1);for(const [x,y] of [[10,16],[18,21],[24,16],[8,22]])R(g,'#3c3c42',x,y,1,5);
  R(g,'#1a1210',10,17,12,10);R(g,'#2b1a10',11,19,10,8);
  R(g,'#55555c',12,2,8,9);R(g,'#7a7a82',12,2,8,2);R(g,'#2b2b30',14,3,4,2);
 });
 SP.wallw=mk(32,32,g=>{
  R(g,'#8a6038',0,0,32,32);R(g,'#b07f4a',0,0,32,7);R(g,'#5f3f22',0,7,32,1);
  for(let x=0;x<32;x+=8){R(g,'#6b4727',x,8,1,24);R(g,'#9b6d3f',x+1,8,2,24)}
  R(g,'#4a2f18',0,15,32,2);R(g,'#4a2f18',0,26,32,2);R(g,'#2b1b0d',0,31,32,1);
  for(const [x,y] of [[3,16],[28,16],[3,27],[28,27]])R(g,'#bbb',x,y,1,1);
 });
 SP.walls=mk(32,32,g=>{
  R(g,'#76767e',0,0,32,32);R(g,'#a3a3ab',0,0,32,7);R(g,'#55555c',0,7,32,1);
  for(let r=0;r<3;r++){const y=8+r*8;R(g,'#55555c',0,y+7,32,1);for(let x=(r%2)*8;x<32;x+=16)R(g,'#55555c',x,y,1,8)}
  R(g,'#34343a',0,31,32,1);
 });
 SP.door=mk(32,32,g=>{
  R(g,'#3b2714',3,2,26,30);R(g,'#6b4a29',6,4,20,28);R(g,'#8a6038',6,4,20,4);
  R(g,'#573a1f',9,10,14,9);R(g,'#573a1f',9,21,14,9);R(g,'#a47544',10,11,12,1);R(g,'#a47544',10,22,12,1);
  C(g,'#d2b24a',22,20,1.8);
 });
}

/* ---------- Eşya simgeleri ---------- */
const ICON={};
const IC={
 wood:g=>{g.save();g.translate(16,17);g.rotate(-.5);R(g,'#6b4423',-12,-4,24,8);R(g,'#8a5a30',-12,-4,24,3);C(g,'#c49058',12,0,4);C(g,'#8a5a30',12,0,2);g.restore();g.save();g.translate(14,21);g.rotate(.35);R(g,'#5a3a1e',-11,-3,22,7);R(g,'#7a4f29',-11,-3,22,2);g.restore()},
 stone:g=>{P(g,'#6e6e6e',[[5,24],[7,12],[15,7],[25,11],[28,22],[20,27]]);P(g,'#9a9a9a',[[8,22],[9,13],[15,9],[22,12],[24,20]]);P(g,'#c0c0c0',[[11,13],[15,10],[19,12],[14,15]])},
 coal:g=>{P(g,'#15151a',[[5,24],[8,11],[16,7],[25,10],[28,21],[19,27]]);P(g,'#2b2b33',[[9,21],[10,13],[16,10],[22,13]]);R(g,'#777',13,11,3,1);R(g,'#666',20,15,2,1)},
 sand:g=>{P(g,'#c9b377',[[3,26],[9,15],[16,9],[23,15],[29,26]]);P(g,'#e6d6a2',[[7,24],[11,17],[16,12],[21,17],[25,24]]);R(g,'#bfa86c',14,20,2,1);R(g,'#bfa86c',19,22,2,1)},
 copper_ore:g=>{IC.stone(g);C(g,'#c8743a',12,17,3);C(g,'#d9854a',20,15,3);C(g,'#b4602b',17,22,2.5)},
 iron_ore:g=>{IC.stone(g);C(g,'#b99a80',12,17,3);C(g,'#8b5a3c',20,15,3);C(g,'#d1b79c',17,22,2.5)},
 copper_ingot:g=>{P(g,'#8a4a22',[[4,22],[9,12],[27,12],[28,22]]);P(g,'#d9854a',[[7,20],[11,14],[25,14],[25,20]]);R(g,'#f0b080',11,14,12,2);R(g,'#8a4a22',4,22,24,3)},
 iron_ingot:g=>{P(g,'#6c7076',[[4,22],[9,12],[27,12],[28,22]]);P(g,'#bcc2c8',[[7,20],[11,14],[25,14],[25,20]]);R(g,'#eef2f6',11,14,12,2);R(g,'#6c7076',4,22,24,3)},
 berries:g=>{for(const [x,y] of [[11,19],[19,17],[15,24],[22,24],[9,25]]){C(g,'#a5222f',x,y,4.5);C(g,'#d4384a',x-1,y-1,3);R(g,'#ffb0b0',x-2,y-2,1,1)}R(g,'#3b8239',14,6,3,8);P(g,'#4aa044',[[17,8],[26,6],[22,13]])},
 coconut:g=>{C(g,'#4c2f16',16,17,11);C(g,'#6b4423',15,16,10);C(g,'#8a5a30',12,12,4);C(g,'#2a180a',12,15,1.6);C(g,'#2a180a',18,15,1.6);C(g,'#2a180a',15,20,1.6)},
 fish:g=>{P(g,'#4f7fa0',[[3,16],[10,8],[22,10],[26,16],[22,22],[10,24]]);P(g,'#7eaed0',[[8,15],[12,10],[20,11],[22,15]]);P(g,'#3d6785',[[24,16],[30,9],[30,23]]);C(g,'#111',9,14,1.5);R(g,'#cfe7f5',10,17,10,2)},
 cfish:g=>{P(g,'#9a6a2e',[[3,16],[10,8],[22,10],[26,16],[22,22],[10,24]]);P(g,'#c48c47',[[8,15],[12,10],[20,11],[22,15]]);P(g,'#7a521f',[[24,16],[30,9],[30,23]]);C(g,'#111',9,14,1.5);R(g,'#7a521f',11,13,1,6);R(g,'#7a521f',15,13,1,6);R(g,'#7a521f',19,13,1,6)},
 bottle:g=>{R(g,'rgba(190,230,240,.55)',11,12,10,16);R(g,'rgba(190,230,240,.55)',13,5,6,8);R(g,'#8b5a2b',13,3,6,3);R(g,'#e8fbff',12,14,2,10);R(g,'#7fb4c4',11,12,10,1);R(g,'#7fb4c4',11,27,10,1)},
 wbottle:g=>{IC.bottle(g);R(g,'#3f90d6',12,18,8,9);R(g,'#7fc0f0',12,18,8,2)},
 rod:g=>{g.strokeStyle='#8a5a30';g.lineWidth=3;g.beginPath();g.moveTo(5,28);g.lineTo(24,5);g.stroke();g.strokeStyle='#ddd';g.lineWidth=1;g.beginPath();g.moveTo(24,5);g.quadraticCurveTo(30,14,26,24);g.stroke();C(g,'#d9463c',26,25,2)}
};
Object.assign(IC,{
 meat:g=>{P(g,'#8a2a2a',[[4,18],[8,9],[19,6],[28,12],[27,23],[15,27],[6,25]]);P(g,'#c24848',[[8,17],[11,11],[19,9],[25,13],[24,21],[15,24]]);P(g,'#f0c0b8',[[12,13],[18,11],[21,15],[15,16]]);C(g,'#efe6d8',24,22,3.4);C(g,'#d9cdb8',24,22,1.6)},
 cmeat:g=>{P(g,'#5a3016',[[4,18],[8,9],[19,6],[28,12],[27,23],[15,27],[6,25]]);P(g,'#8f5428',[[8,17],[11,11],[19,9],[25,13],[24,21],[15,24]]);P(g,'#c88a4a',[[12,13],[18,11],[21,15],[15,16]]);R(g,'#3a1e0c',11,18,10,1);R(g,'#3a1e0c',13,21,8,1);C(g,'#efe6d8',24,22,3.4);C(g,'#d9cdb8',24,22,1.6)},
 milk:g=>{IC.bottle(g);R(g,'#f4f1ea',12,16,8,11);R(g,'#ffffff',12,16,8,2);R(g,'#d9d4c8',12,26,8,1)},
 leather:g=>{P(g,'#6b4423',[[5,10],[12,6],[20,8],[27,6],[28,16],[25,24],[18,27],[9,26],[4,19]]);P(g,'#8f5d31',[[8,11],[13,8],[20,10],[25,10],[25,16],[22,22],[16,24],[10,22],[7,17]]);R(g,'#b27b45',11,12,8,2);R(g,'#5a3519',12,18,2,1);R(g,'#5a3519',17,15,3,1)},
 wool:g=>{for(const [x,y,r] of [[11,19,6],[19,18,7],[15,12,6],[22,24,5],[10,25,5],[16,23,6]]){C(g,'#d9d6cf',x,y,r)}for(const [x,y,r] of [[11,18,4],[19,17,5],[15,11,4],[16,22,4]]){C(g,'#f6f4ee',x,y,r)}},
 coin:g=>{C(g,'#7a4a22',16,17,11);C(g,'#d9985a',16,16,11);C(g,'#efc07c',16,15,8.5);C(g,'#c27a3c',16,16,6);R(g,'#efc07c',15,12,2,8);R(g,'#efc07c',12,15,8,2)},
 gold:g=>{P(g,'#8a6414',[[4,22],[9,12],[24,12],[29,22],[27,26],[6,26]]);P(g,'#d9a82a',[[7,22],[11,14],[22,14],[26,22],[25,24],[8,24]]);P(g,'#f6d878',[[11,15],[16,14],[17,18],[10,21]]);R(g,'#fff1b8',13,16,3,1.5)},
 gem:g=>{P(g,'#5a0a14',[[16,3],[27,12],[16,29],[5,12]]);P(g,'#b01c2e',[[16,5],[25,12],[16,26],[7,12]]);P(g,'#e8485c',[[16,5],[7,12],[16,13]]);P(g,'#ff9aa6',[[16,5],[12,10],[16,12],[20,10]]);P(g,'#7a0f20',[[16,13],[25,12],[16,26]])},
 bag:g=>{R(g,'#4a6a8a',5,10,22,13);R(g,'#6a8aaa',5,10,22,4);C(g,'#3a5a7a',5,16,6.5);C(g,'#5a7a9a',27,16,6.5);C(g,'#7a9aba',27,16,3.5);R(g,'#d9c07a',13,10,3,13);R(g,'#d9c07a',19,10,3,13)},
 bone:g=>{g.save();g.translate(16,16);g.rotate(-.6);R(g,'#cbbf9f',-11,-3,22,6);R(g,'#efe6cc',-11,-3,22,2.5);for(const s of [-1,1]){C(g,'#cbbf9f',s*12,-4,4);C(g,'#cbbf9f',s*12,4,4);C(g,'#efe6cc',s*12,-5,2.2)}g.restore()},
 spear:g=>{g.save();g.translate(16,16);g.rotate(Math.PI/4);R(g,'#8a5a30',-1.5,-8,3,26);R(g,'#a87440',-1.5,-8,1.2,26);P(g,'#d8d0b8',[[0,-17],[-4,-8],[4,-8]]);P(g,'#efe6cc',[[0,-15],[-1.6,-9],[1,-9]]);R(g,'#5a3519',-2.5,-8,5,2);g.restore()},
 shears:g=>{g.save();g.translate(16,16);g.rotate(-Math.PI/4);P(g,'#b9bfc6',[[-2,-14],[2,-14],[3,2],[-3,2]]);P(g,'#8e949b',[[-3,-14],[-1,-14],[0,2],[-3,2]]);C(g,'#8a4a22',-5,9,4.5);C(g,'#8a4a22',5,9,4.5);C(g,'#2a2a2e',-5,9,2.2);C(g,'#2a2a2e',5,9,2.2);g.restore()},
 coat:g=>{P(g,'#6b4423',[[9,6],[14,4],[18,4],[23,6],[29,12],[25,17],[22,15],[22,28],[10,28],[10,15],[7,17],[3,12]]);P(g,'#8f5d31',[[11,7],[15,5],[17,5],[21,7],[21,26],[11,26]]);R(g,'#e8e4da',14,4,4,24);R(g,'#f7f5ee',14,4,4,3);for(const y of [10,15,20])C(g,'#2a1a0a',16,y,1)},

 bow:g=>{g.strokeStyle='#8a5a30';g.lineWidth=3;g.beginPath();g.arc(7,16,14,-1.15,1.15);g.stroke();g.strokeStyle='#a87440';g.lineWidth=1.2;g.beginPath();g.arc(7,16,14,-1.15,1.15);g.stroke();g.strokeStyle='#e8e4da';g.lineWidth=1;g.beginPath();g.moveTo(7+14*Math.cos(-1.15),16+14*Math.sin(-1.15));g.lineTo(11,16);g.lineTo(7+14*Math.cos(1.15),16+14*Math.sin(1.15));g.stroke();R(g,'#5a3519',19,14,3,4);R(g,'#c3c9d0',11,15.4,14,1.2);P(g,'#c3c9d0',[[27,16],[23,13.5],[23,18.5]])},
 arrow:g=>{g.save();g.translate(16,16);g.rotate(-Math.PI/4);R(g,'#a87440',-14,-1,26,2);R(g,'#c9945a',-14,-1,26,.8);P(g,'#c3c9d0',[[15,0],[8,-3.5],[8,3.5]]);P(g,'#d9463c',[[-14,-1],[-9,-4.5],[-6,-4.5],[-9,-1]]);P(g,'#d9463c',[[-14,1],[-9,4.5],[-6,4.5],[-9,1]]);g.restore()},
 torch:g=>{g.save();g.translate(16,17);g.rotate(Math.PI/5);R(g,'#8a5a30',-2,-3,4,18);R(g,'#a87440',-2,-3,1.4,18);R(g,'#3a2a1a',-3.5,-8,7,6);R(g,'#5a4430',-3.5,-8,7,1.5);P(g,'#ff7a12',[[0,-19],[-5.5,-9],[5.5,-9]]);P(g,'#ffc233',[[0,-15],[-3,-9],[3,-9]]);P(g,'#fff1b0',[[0,-12.5],[-1.4,-9],[1.4,-9]]);g.restore()},
 bandage:g=>{R(g,'#cfc9bb',5,12,22,10);R(g,'#f1eee6',5,12,22,4);R(g,'#d9463c',14,12,4,10);R(g,'#b8b2a4',5,20,22,2);R(g,'#ffffff',6,13,20,1)}
});
function tool(kind,tier){
 const col=['','#8d8d8d','#c8743a','#c3c9d0'][tier];
 return g=>{
  g.save();g.translate(16,16);g.rotate(Math.PI/4);
  R(g,'#8a5a30',-2,-12,4,26);R(g,'#a87440',-2,-12,1.5,26);
  if(kind==='axe'){P(g,col,[[2,-12],[12,-14],[12,-2],[2,-4]]);R(g,'rgba(255,255,255,.35)',3,-12,8,2)}
  else{g.strokeStyle=col;g.lineWidth=4;g.beginPath();g.arc(0,-6,12,Math.PI*1.15,Math.PI*1.85);g.stroke();g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=1.2;g.beginPath();g.arc(0,-7,12,Math.PI*1.2,Math.PI*1.8);g.stroke()}
  g.restore();
 };
}
function buildIcons(){
 for(const k in IT){
  const it=IT[k];
  const c=cv(32,32),g=c.getContext('2d');
  if(it.place){const s={fire:SP.fire,bench:SP.bench,furn:SP.furn,wallw:SP.wallw,walls:SP.walls,door:SP.door}[k];g.drawImage(s,0,0)}
  else if(it.tool&&it.tool!=='rod'&&!IC[k])tool(it.tool,it.tier)(g);
  else IC[k](g);
  ICON[k]=c.toDataURL();
  it.cv=c;
 }
}

buildSprites();buildIcons();
HG.ICON=ICON;
})();
