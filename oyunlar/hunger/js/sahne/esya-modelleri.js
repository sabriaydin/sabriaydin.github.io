/* Hunger 3D - sahne: yerde duran eşyaların ayrıntılı 3B modelleri (et, deri, yün, kemik, şişe, külçe, balık ve diğerleri) */
(()=>{
'use strict';
const S=HG.Scene,sc=HG.sc,{IT}=HG;
const {blob,rbox,merge,part,cyl,cone,alongPart,fb3,box}=sc.g;
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const PI=Math.PI;
const geos={};
let mat=null;
/* Modeller yere yatık, tabanı y=0'da, yaklaşık .2-.6 m boyutlarındadır */
const noise=(x,y,z,s)=>fb3(x*9+s,y*9,z*9,s|0);
const tint=(hex,k)=>{const c=new THREE.Color(hex);return c.multiplyScalar(k)};
function boneOf(from,dir,len,r){
 const d=dir.clone().normalize(),e1=from.clone().addScaledVector(d,len),c=0xe9e1cc;
 return [alongPart(cyl(r*.8,r,len,8,1),c,from,d,len),part(blob(r*1.5,1,.05,3),c,from.x,from.y,from.z),part(blob(r*1.5,1,.05,4),c,e1.x,e1.y,e1.z),
  part(blob(r*1.3,1,.05,5),c,from.x+0.0,from.y,from.z+r*1.1),part(blob(r*1.3,1,.05,6),c,e1.x,e1.y,e1.z+r*1.1)];
}
const B={};
B.meat=()=>{
 const m=part(blob(.14,2,.14,11,1.25,.8,1),0xb83a3e,0,.1,0);
 m.cf=(x,y,z,nx,ny,nz,c)=>{const v=noise(x,y,z,4);if(v>.6)c.setHex(0xe8c2b8);else if(ny<-.3)c.setHex(0x8a2a30)};
 return [m,part(blob(.1,1,.1,12,1.2,.3,.9),0xf0dcc0,.01,.2,.01),...boneOf(V(.1,.1,0),V(1,.08,0),.17,.022)];
};
B.cmeat=()=>{
 const m=part(blob(.13,2,.14,13,1.25,.8,1),0x8a5128,0,.1,0);
 m.cf=(x,y,z,nx,ny,nz,c)=>{const v=noise(x,y,z,6);if(v>.55)c.setHex(0x4a2813);else if(v<.3)c.setHex(0xa8703f);};
 return [m,part(blob(.09,1,.1,14,1.2,.3,.9),0xc79256,.01,.19,.01),...boneOf(V(.09,.1,0),V(1,.08,0),.16,.021)];
};
B.leather=()=>{
 const a=part(blob(.2,2,.1,21,1.5,.1,1.1),0x7c4f2c,0,.03,0);
 a.cf=(x,y,z,nx,ny,nz,c)=>{const v=noise(x,y,z,8);c.multiplyScalar(.85+v*.35);if(Math.hypot(x*.8,z)>.3)c.lerp(new THREE.Color(0xa87a4c),.5)};
 const b=part(blob(.15,2,.1,22,1.4,.12,.9),0x8a5c36,.07,.075,.02,1,1,1,0,.5,.05);
 b.cf=a.cf;
 return [a,b,alongPart(cyl(.026,.03,.34,8),0x6e4526,V(-.2,.07,-.13),V(.7,0,.5),.3),part(blob(.04,1,.1,23),0x6e4526,-.2,.07,-.13)];
};
B.wool=()=>{
 const ps=[],w=0xf2efe6;
 [[0,.1,0,.12],[.1,.08,.05,.09],[-.09,.08,.06,.1],[.02,.09,-.1,.09],[.0,.19,.01,.08],[-.1,.07,-.07,.07],[.11,.07,-.06,.07]].forEach((q,i)=>{
  const p=part(blob(q[3],2,.22,30+i),w,q[0],q[1],q[2]);p.cf=(x,y,z,nx,ny,nz,c)=>{const v=noise(x,y,z,9);c.multiplyScalar(.9+v*.16);if(ny<-.2)c.multiplyScalar(.85)};ps.push(p);
 });
 return ps;
};
B.bone=()=>[...boneOf(V(-.16,.04,0),V(1,0,0),.32,.028),...boneOf(V(-.1,.035,.1),V(.8,0,-.5),.2,.02)];
const bottle=(body,neck)=>()=>[
 part(cyl(.07,.075,.2,14),body,0,.1,0),part(cyl(.05,.07,.06,14),body,0,.22,0),part(cyl(.03,.035,.1,12),neck,0,.3,0),part(cyl(.036,.034,.04,10),0x9a6a3c,0,.37,0),
 part(cyl(.072,.072,.05,14),0xe8e4da,0,.12,0)
];
B.bottle=bottle(0xbfe6f0,0xcfe8ee);
B.wbottle=()=>{const l=bottle(0x5fb0e0,0xcfe8ee)();l[4]=part(cyl(.072,.072,.05,14),0x2f8fcf,0,.12,0);return l};
B.milk=()=>{const l=bottle(0xf4f1e8,0xe6e2d6)();l[4]=part(cyl(.072,.072,.05,14),0xc9423a,0,.12,0);return l};
B.wood=()=>{
 const bark=(x,y,z,nx,ny,nz,c)=>{if(Math.abs(nx)>.85)c.setHex(0xd9b078);else{const v=noise(x*2,y,z*2,10);c.multiplyScalar(.75+v*.5)}};
 const a=part(cyl(.075,.08,.5,10,3),0x6b4423,0,.08,0,1,1,1,0,0,PI/2);a.cf=bark;
 const b=part(cyl(.065,.07,.44,10,3),0x73492a,.02,.07,.15,1,1,1,0,.35,PI/2);b.cf=bark;
 const c=part(cyl(.06,.065,.4,10,3),0x66401f,.03,.2,.07,1,1,1,0,-.2,PI/2);c.cf=bark;
 return [a,b,c,part(cone(.025,.12,5),0x5a381b,.1,.16,-.06,1,1,1,0,0,-1.2)];
};
const rockCf=(base,vein)=>(x,y,z,nx,ny,nz,c)=>{const v=noise(x,y,z,12);c.multiplyScalar(.82+v*.4);if(vein!==undefined&&Math.abs(fb3(x*7,y*7,z*7,5)-.5)<.07)c.setHex(vein)};
B.stone=()=>{
 const a=part(blob(.12,2,.25,41,1.2,.75,1),0x8d8d92,0,.08,0),b=part(blob(.09,2,.25,42,1,.8,1.1),0x9a9aa0,.15,.06,.08),c=part(blob(.07,2,.25,43),0x7d7d83,-.1,.05,.14);
 a.cf=b.cf=c.cf=rockCf();return [a,b,c];
};
B.coal=()=>{
 const mk=(r,x,z,s)=>{const p=part(blob(r,1,.3,s,1,.8,1),0x17171c,x,r*.7,z);p.cf=(X,Y,Z,nx,ny,nz,c)=>{if(noise(X,Y,Z,14)>.68)c.setHex(0x40404c)};return p};
 return [mk(.1,0,0,51),mk(.075,.13,.07,52),mk(.07,-.1,.09,53),mk(.06,.02,-.12,54)];
};
B.sand=()=>{const p=part(blob(.2,2,.08,61,1,.38,1),0xdac68c,0,.04,0);p.cf=(x,y,z,nx,ny,nz,c)=>{c.multiplyScalar(.9+noise(x,y,z,15)*.22)};return [p]};
const ore=(c)=>()=>{
 const a=part(blob(.14,2,.22,71,1.1,.8,1),0x77777e,0,.1,0),b=part(blob(.08,2,.22,72),0x6c6c72,.14,.06,.09);
 a.cf=b.cf=(x,y,z,nx,ny,nz,col)=>{const v=noise(x,y,z,16);col.multiplyScalar(.85+v*.3);if(noise(x,y,z,17)>.64)col.setHex(c)};
 return [a,b];
};
B.copper_ore=ore(0xd37a3c);B.iron_ore=ore(0xb98862);
const ingot=c=>()=>{
 const mk=(x,y,z,ry)=>{const p=part(rbox(.3,.075,.13,.3,3),c,x,y,z,1,1,1,0,ry,0);p.cf=(X,Y,Z,nx,ny,nz,col)=>{if(ny>.7)col.multiplyScalar(1.18)};return p};
 return [mk(0,.04,0,0),mk(.02,.115,.0,.5)];
};
B.copper_ingot=ingot(0xd9854a);B.iron_ingot=ingot(0xbcc2c8);
B.berries=()=>{
 const ps=[alongPart(cyl(.008,.01,.3,5),0x5a4a2a,V(-.15,.02,0),V(1,.25,.2),.3),part(blob(.05,1,.1,81,1.6,.15,.8),0x3f7a35,-.04,.08,.05,1,1,1,0,.4,0),part(blob(.05,1,.1,82,1.6,.15,.8),0x4a8a3c,.06,.1,-.04,1,1,1,0,-.5,0)];
 [[0,.05,0],[.06,.05,.03],[-.05,.05,.04],[.03,.05,-.06],[-.04,.05,-.04],[.02,.1,.01],[.09,.05,-.04],[-.09,.06,.0]].forEach((q,i)=>{
  ps.push(part(blob(.035,1,.05,83+i),i%3?0xc42d3a:0x9a1c34,q[0],q[1],q[2]));
 });
 return ps;
};
B.coconut=()=>{
 const p=part(blob(.12,2,.06,91),0x5b3a1c,0,.12,0);p.cf=(x,y,z,nx,ny,nz,c)=>{c.multiplyScalar(.8+noise(x,y,z,18)*.5)};
 return [p,part(blob(.016,1,0,92),0x1a0f08,.04,.22,.07),part(blob(.016,1,0,93),0x1a0f08,-.02,.23,.08),part(blob(.016,1,0,94),0x1a0f08,.01,.2,.1)];
};
const fish=(back,belly,fin,cooked)=>()=>{
 const b=part(blob(.1,2,.04,101,2.7,.85,.55),back,0,.075,0);
 b.cf=(x,y,z,nx,ny,nz,c)=>{if(ny<-.15)c.setHex(belly);else if(cooked){if(noise(x,y,z,19)>.58)c.multiplyScalar(.6)}else{c.multiplyScalar(.85+Math.abs(Math.sin(x*38))*.22)}};
 return [b,alongPart(cone(.08,.16,4,1),fin,V(-.26,.075,0),V(-1,0,0),.16,1,.22),part(cone(.045,.09,3,1),fin,-.02,.16,0,1,1,.2),
  part(cone(.03,.06,3,1),fin,.07,.025,.05,1,1,.25,0,0,PI),part(blob(.015,1,0,102),cooked?0xd8d0c0:0x0a0a0a,.2,.095,.045),part(blob(.015,1,0,103),cooked?0xd8d0c0:0x0a0a0a,.2,.095,-.045)];
};
B.fish=fish(0x6fa0c0,0xd8e2e8,0x5a8aa8,false);
B.cfish=fish(0xb07a35,0xd9b070,0x8a5a22,true);
B.coin=()=>[0,1,2,3].map(i=>part(cyl(.06,.06,.012,14),i%2?0xd9985a:0xc27a3c,(i%2)*.02,.008+i*.013,(i%2?.01:0)))
 .concat([part(cyl(.055,.055,.012,14),0xefc07c,.14,.01,.05,1,1,1,0,.4,0),part(cyl(.055,.055,.012,14),0xd9985a,.12,.024,.07,1,1,1,.1,.2,0)]);
B.bag=()=>[part(cyl(.1,.1,.4,12),0x4a6a8a,0,.1,0,1,1,1,0,0,PI/2),part(cyl(.1,.1,.02,12),0x7a9aba,.2,.1,0,1,1,1,0,0,PI/2),part(cyl(.1,.1,.02,12),0x7a9aba,-.2,.1,0,1,1,1,0,0,PI/2),
 part(cyl(.104,.104,.03,12),0xd9c07a,.07,.1,0,1,1,1,0,0,PI/2),part(cyl(.104,.104,.03,12),0xd9c07a,-.07,.1,0,1,1,1,0,0,PI/2)];
B.arrow=()=>[alongPart(cyl(.008,.008,.52,5),0xa87440,V(-.26,.012,0),V(1,0,0),.52),alongPart(cone(.022,.07,4,1),0xc3c9d0,V(.26,.012,0),V(1,0,0),.07),
 part(box(.07,.002,.035),0xd9463c,-.23,.014,.0),part(box(.07,.035,.002),0xd9463c,-.23,.014,0)];
B.torch=()=>[alongPart(cyl(.025,.032,.7,6),0x6b4423,V(-.35,.03,0),V(1,0,0),.7),alongPart(cyl(.05,.04,.16,7),0x2b2018,V(.28,.04,0),V(1,0,0),.16),part(blob(.04,1,.15,111),0x15100c,.45,.04,0)];
B.bandage=()=>[part(cyl(.055,.055,.12,14),0xe8e4da,0,.055,0,1,1,1,0,0,PI/2),part(cyl(.058,.058,.03,14),0xd9463c,0,.055,0,1,1,1,0,0,PI/2),part(cyl(.04,.04,.125,10),0xc9c4b8,0,.055,0,1,1,1,0,0,PI/2),part(box(.18,.003,.07),0xe8e4da,.14,.003,.02,1,1,1,0,.3,0)];
B.spear=()=>[alongPart(cyl(.016,.02,1,6),0x8a5a30,V(-.5,.02,0),V(1,0,0),1),alongPart(cone(.032,.2,4,1),0xe9e1cc,V(.5,.02,0),V(1,0,0),.2,1,.4),alongPart(cyl(.02,.02,.06,6),0x4a3a22,V(.42,.02,0),V(1,0,0),.06)];
B.shears=()=>[alongPart(cyl(.012,.014,.22,5),0xbcc2c8,V(-.02,.015,0),V(1,0,.25),.22),alongPart(cyl(.012,.014,.22,5),0xbcc2c8,V(-.02,.015,0),V(1,0,-.25),.22),
 part(new THREE.TorusGeometry(.035,.009,6,12),0x8a5a30,-.07,.02,.045,1,1,1,PI/2,0,0),part(new THREE.TorusGeometry(.035,.009,6,12),0x8a5a30,-.07,.02,-.045,1,1,1,PI/2,0,0),part(cyl(.006,.006,.02,5),0x555560,0,.02,0)];
B.coat=()=>{
 const a=part(rbox(.4,.07,.32,.35,3),0x7a4d28,0,.04,0);a.cf=(x,y,z,nx,ny,nz,c)=>{c.multiplyScalar(.85+noise(x,y,z,20)*.3)};
 return [a,part(rbox(.14,.06,.3,.35,2),0x6b4423,.26,.045,.04,1,1,1,0,.5,0),part(rbox(.14,.06,.3,.35,2),0x6b4423,-.26,.045,.04,1,1,1,0,-.5,0),part(blob(.1,1,.1,121,1.3,.3,.9),0xe8e4da,0,.09,-.12),part(cyl(.012,.012,.03,6),0x2b2018,0,.085,.06)];
};
const toolHead={1:0x8d8d92,2:0xc8743a,3:0xc3c9d0};
B.axe=it=>[alongPart(cyl(.022,.028,.8,6),0x8a5a30,V(-.4,.03,0),V(1,0,0),.8),part(box(.2,.07,.07),toolHead[it.tier]||0x8d8d92,.34,.05,.0),part(box(.04,.07,.07),0x555560,.26,.05,0)];
B.pick=it=>[alongPart(cyl(.022,.028,.8,6),0x8a5a30,V(-.4,.03,0),V(1,0,0),.8),part(box(.07,.07,.62),toolHead[it.tier]||0x8d8d92,.36,.05,0),
 alongPart(cone(.04,.14,4,1),toolHead[it.tier]||0x8d8d92,V(.36,.05,.31),V(0,0,1),.14),alongPart(cone(.04,.14,4,1),toolHead[it.tier]||0x8d8d92,V(.36,.05,-.31),V(0,0,-1),.14)];
B.rod=()=>[alongPart(cyl(.012,.02,1.1,5),0x8a5a30,V(-.5,.03,0),V(1,0,.05),1.1),part(cyl(.025,.025,.04,8),0x555560,-.3,.045,0,1,1,1,PI/2,0,0),alongPart(cyl(.003,.003,.4,3),0xdddddd,V(.55,.03,.05),V(.4,0,1),.4)];
B.bow=()=>{
 const ps=[],N=8,H=.5;
 for(let i=-N;i<N;i++){const y0=i/N*H,y1=(i+1)/N*H;const z0=-.14*(1-(y0/H)**2),z1=-.14*(1-(y1/H)**2);
  const a=V(z0,.03,y0),b=V(z1,.03,y1),d=b.clone().sub(a);ps.push(alongPart(cyl(.014,.017,d.length()+.004,5),0x8a5a30,a,d,d.length()+.004))}
 ps.push(part(box(.06,.04,.18),0x3a2a1a,-.14,.03,0));
 ps.push(alongPart(cyl(.003,.003,H*2,3),0xe8e4da,V(0,.03,-H),V(0,0,1),H*2));
 return ps;
};
/* yerleştirilebilir yapılar: küçültülmüş modeller */
B.fire=()=>[
 ...[0,1,2,3,4].map(i=>{const a=i*PI*.4;return part(cyl(.04,.045,.3,6),0x6b4423,Math.cos(a)*.08,.06,Math.sin(a)*.08,1,1,1,0,-a,PI/2)}),
 ...[0,1,2,3,4,5,6].map(i=>{const a=i*PI*2/7;return part(blob(.05,1,.2,131+i),0x7d7d83,Math.cos(a)*.2,.04,Math.sin(a)*.2)}),
 part(blob(.07,1,.2,140),0x1a1a1f,0,.03,0)
];
B.bench=()=>[part(rbox(.4,.05,.26,.2,2),0xa47544,0,.24,0),...[[-.16,-.09],[.16,-.09],[-.16,.09],[.16,.09]].map(q=>part(cyl(.025,.03,.22,5),0x7a4f29,q[0],.11,q[1])),part(box(.1,.02,.06),0x8d8d92,.1,.28,0)];
B.furn=()=>{const a=part(rbox(.32,.34,.32,.15,3),0x77777f,0,.17,0);a.cf=rockCf();return [a,part(box(.14,.1,.02),0x15100c,0,.12,.16),part(cyl(.04,.05,.12,6),0x66666e,0,.4,0)]};
B.wallw=()=>[0,1,2,3].map(i=>part(box(.34,.07,.05),i%2?0xa67848:0xb08050,0,.04+i*.075,0));
B.walls=()=>{const a=part(rbox(.34,.3,.1,.2,3),0x8c8c94,0,.15,0);a.cf=rockCf();return [a]};
B.door=()=>[part(box(.26,.38,.04),0x6b4a29,0,.19,0),part(box(.26,.03,.045),0x4a3220,0,.1,0),part(box(.26,.03,.045),0x4a3220,0,.3,0),part(blob(.018,1,0,150),0xbcc2c8,.09,.2,.03)];
/* modelleri üret: kimliğe göre */
function build(id){
 const it=IT[id];let fn=B[id];
 if(!fn&&it){if(it.tool&&B[it.tool])fn=()=>B[it.tool](it)}
 if(!fn)fn=()=>[part(blob(.1,2,.1,160),0xcccccc,0,.1,0)];
 const list=fn(it);
 return merge(list,{jit:.07});
}
sc.dropModel=id=>{
 if(!mat)mat=sc.mat({roughness:.78});
 if(!geos[id])geos[id]=build(id);
 const g=new THREE.Group(),m=new THREE.Mesh(geos[id],mat);m.castShadow=true;m.receiveShadow=true;g.add(m);
 return g;
};
})();
