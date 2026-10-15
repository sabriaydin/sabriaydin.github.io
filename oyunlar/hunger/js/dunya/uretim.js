/* Hunger 3D - harita üretimi (ada, göller, nesneler) */
(()=>{
'use strict';
const {W,H,T,O,mulberry32,hash,fbm,clamp,smooth,ANIMAL}=HG;
function genWorld(seed){
 const rnd=mulberry32(seed^0x9e3779b9);
 const sp=mulberry32(seed^0x51ed270b),SC=W*H/65536;
 /* her tohum farklı ada biçimi: eksen oranı, dönüş, kayma ve kıyı bükülmesi */
 const rot=sp()*6.283,cr=Math.cos(rot),sr=Math.sin(rot),axr=.8+sp()*.4,ayr=.8+sp()*.4,ox=(sp()-.5)*.14,oy=(sp()-.5)*.14,wp=.18+sp()*.3;
 const tile=new Uint8Array(W*H),obj=new Uint8Array(W*H),hgt=new Float32Array(W*H);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const u=((x+.5)/W-.5-ox)*2,v=((y+.5)/H-.5-oy)*2,ru=(u*cr+v*sr)/axr,rv=(-u*sr+v*cr)/ayr,d=Math.max(0,Math.sqrt(ru*ru+rv*rv)+(fbm(x/46,y/46,seed+3)-.5)*wp);
  const n=fbm(x/26,y/26,seed),isle=Math.max(0,fbm(x/9,y/9,seed+777)-.66)*2.4*smooth(.62,.9,d)*(1-smooth(.96,1.05,d)),e=(1-Math.pow(d,1.7))+(n-.5)*.75+isle;
  let t,hh=0;
  if(e<.1){t=T.DEEP;hh=-Math.min(3.4,(.1-e)*13)}   /* açıklara doğru derinleşir */
  else if(e<.2)t=T.SHAL;else if(e<.28)t=T.SAND;
  else{
   /* yükseklik: dağlık bölgeler (kıyıya yaklaştıkça alçalır) */
   const m=clamp((fbm(x/22,y/22,seed+5)-.46)/.3,0,1);
   hh=Math.pow(m,1.3)*6.5*clamp((e-.32)/.25,0,1)+fbm(x/5,y/5,seed+8)*.5*clamp((e-.3)/.2,0,1);
   t=T.GRASS;
   if(hh>3.2||e>.9||(e>.5&&fbm(x/9,y/9,seed+99)>.76))t=T.ROCK;
   else if(e>.4&&e<.6&&hh<.7&&fbm(x/7,y/7,seed+7)>.74)t=T.POND;
  }
  tile[y*W+x]=t;hgt[y*W+x]=hh;
 }
 /* oyuncu başlangıcı: merkeze en yakın çimen */
 let sx=W>>1,sy=H>>1,best=1e9;
 for(let y=10;y<H-10;y++)for(let x=10;x<W-10;x++){
  if(tile[y*W+x]!==T.GRASS)continue;
  let ok=true;for(let j=-3;j<=3&&ok;j++)for(let i=-3;i<=3;i++){const t=tile[(y+j)*W+x+i];if(t!==T.GRASS&&t!==T.SAND){ok=false;break}}
  if(!ok)continue;
  const dd=(x-W/2)**2+(y-H/2)**2;if(dd<best){best=dd;sx=x;sy=y}
 }
 /* başlangıç çevresi düz kalır */
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const d=Math.hypot(x-sx-4,y-sy-1.5),f=clamp((d-9)/9,0,1),i=y*W+x;
  hgt[i]*=f*f*(3-2*f);
  if(tile[i]===T.ROCK&&hgt[i]<1&&d<20)tile[i]=T.GRASS;
 }
 /* garanti tatlı su gölü */
 const pcx=sx+8,pcy=sy+3;
 for(let y=-3;y<=3;y++)for(let x=-4;x<=4;x++){
  const X=pcx+x,Y=pcy+y;if(X<1||Y<1||X>=W-1||Y>=H-1)continue;
  if((x*x)/16+(y*y)/9<=1&&tile[Y*W+X]>=T.SAND&&tile[Y*W+X]!==T.POND){tile[Y*W+X]=T.POND;hgt[Y*W+X]=0}
 }
 /* nesneler */
 for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
  const i=y*W+x,t=tile[i],r=rnd();
  if(t===T.GRASS){
   const f=fbm(x/12,y/12,seed+33);
   if(f>.6){if(r<.17)obj[i]=O.TREE;else if(r<.185)obj[i]=O.BUSH}
   else if(r<.018)obj[i]=O.TREE;else if(r<.0200)obj[i]=O.ROCK;else if(r<.0350)obj[i]=O.BUSH;
  }else if(t===T.SAND){if(r<.014)obj[i]=O.PALM}
  else if(t===T.ROCK){
   const o=fbm(x/6,y/6,seed+55);
   if(o>.64&&r<.02){const q=rnd(),h=hgt[i];if(q<.72)obj[i]=O.COAL;else if(q<.93){if(h>1.6)obj[i]=O.COPPER}else if(h>3.4)obj[i]=O.IRON}
   else if(r<.008)obj[i]=O.ROCK;
  }
 }
 /* aralık: ağaçlar en az 2, kaya ve madenler en az 3 kare arayla durur (sıkışık olanlar seyreltilir) */
 {const isR=v=>v===O.ROCK||v===O.COAL||v===O.COPPER||v===O.IRON,rare=v=>v===O.IRON?3:v===O.COPPER?2:v===O.COAL?1:0;
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
   const i=y*W+x,v=obj[i];if(!v)continue;
   const tr=v===O.TREE||v===O.PALM,rk=isR(v);if(!tr&&!rk)continue;
   const R=tr?2:3;let bad=false;
   for(let j=-R;j<=R&&!bad;j++)for(let k=-R;k<=R;k++){
    if(!j&&!k)continue;const X=x+k,Y=y+j;if(X<1||Y<1||X>=W-1||Y>=H-1||j*j+k*k>R*R)continue;
    const w=obj[Y*W+X];if(!w)continue;
    if(tr?(w===O.TREE||w===O.PALM):isR(w)){
     /* daha değerli olan korunur; eşitse önce işlenen kalır */
     if(!rk||rare(w)>rare(v)||(rare(w)===rare(v)&&(Y<y||(Y===y&&X<x)))){bad=true;break}
    }
   }
   if(bad)obj[i]=O.NONE;
  }}
 /* başlangıç çevresi */
 for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++)obj[(sy+y)*W+sx+x]=O.NONE;
 const seeds=[[O.TREE,8],[O.ROCK,4],[O.BUSH,3],[O.TREE,4]];
 for(const [ob,cnt] of seeds){let c=0,g=0;while(c<cnt&&g++<400){
  const a=rnd()*Math.PI*2,rr=4+rnd()*5,x=Math.round(sx+Math.cos(a)*rr),y=Math.round(sy+Math.sin(a)*rr),i=y*W+x;
  if(tile[i]===T.GRASS&&!obj[i]){
  let near=false;const R=ob===O.TREE?2:ob===O.ROCK?3:1;
  for(let j=-R;j<=R&&!near;j++)for(let k=-R;k<=R;k++){const w=obj[i+j*W+k];if(w&&(ob===O.TREE?(w===O.TREE||w===O.PALM):ob===O.ROCK?(w===O.ROCK||w===O.COAL||w===O.COPPER||w===O.IRON):w===ob)){near=true;break}}
  if(!near){obj[i]=ob;c++}}
 }}


 /* köyler: düz çimenlik alanlarda evler, avlular, kuyu, fener direkleri ve köylüler */
 const villages=[],VN=['Çamlık','Taşova','Derebaşı','Kuzeyyaka','Gölbaşı','Yeşilköy','Kayalık','Sazlıdere','Ormanönü','Güneşli'],
  NN=['Ayşe','Mehmet','Fatma','Hasan','Zeynep','Ali','Elif','Hüseyin','Emine','Yusuf','Hatice','Osman','Selim','Meryem','Kemal','Nur'],
  FEM=new Set(['Ayşe','Fatma','Zeynep','Elif','Emine','Hatice','Meryem','Nur']),
  PR=['farmer','hunter','fisher','smith','healer','woodcut','miner'];
 {
  const want=Math.max(3,Math.round(2.6*SC));let tries=0;
  const shuf=a=>{for(let i=a.length-1;i>0;i--){const j=(rnd()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]]}return a};
  while(villages.length<want&&tries++<4000){
   const cx=20+((rnd()*(W-40))|0),cy=20+((rnd()*(H-40))|0);
   if(Math.hypot(cx-sx,cy-sy)<48)continue;
   let ok=true;for(const v of villages)if(Math.hypot(v.cx-cx,v.cy-cy)<62){ok=false;break}
   if(!ok)continue;
   let hmin=9,hmax=-9,hs=0,hn=0;
   for(let j=-10;j<=10&&ok;j++)for(let k=-10;k<=10;k++){
    const i=(cy+j)*W+cx+k,t=tile[i];
    if(t!==T.GRASS){ok=false;break}
    const h=hgt[i];hmin=Math.min(hmin,h);hmax=Math.max(hmax,h);hs+=h;hn++;
   }
   if(!ok||hmax-hmin>2.4)continue;
   const h0=hs/hn;
   for(let j=-14;j<=14;j++)for(let k=-14;k<=14;k++){
    const x=cx+k,y=cy+j;if(x<1||y<1||x>=W-1||y>=H-1)continue;
    const i=y*W+x,dd=Math.max(Math.abs(j),Math.abs(k)),f=clamp((dd-11)/3,0,1),w=1-f*f*(3-2*f);
    if(tile[i]===T.GRASS||tile[i]===T.ROCK){hgt[i]=hgt[i]*(1-w)+h0*w;if(dd<=12){obj[i]=O.NONE;if(tile[i]===T.ROCK)tile[i]=T.GRASS}}
   }
   const spots=shuf([[-6,-5],[3,-5],[-6,3],[3,3]]),nh=3+((rnd()*2)|0),profs=shuf(PR.slice()).slice(0,nh),npcs=[],houses=[],extras=[];
   const names=shuf(NN.slice());
   const dec=(k,x,y,ry,solid,extra)=>{
    const tx=Math.floor(x),ty=Math.floor(y);
    if(solid&&!obj[ty*W+tx])obj[ty*W+tx]=O.VDEC;
    extras.push(Object.assign({k,x,z:y,ry:ry||0},extra||{}));
   };
   for(let h=0;h<nh;h++){
    const [ox2,oy2]=spots[h],x0=cx+ox2,y0=cy+oy2,prof=profs[h],stone=prof==='smith'||prof==='miner';
    for(let j=0;j<5;j++)for(let k=0;k<5;k++){
     if(j>0&&j<4&&k>0&&k<4)continue;
     obj[(y0+j)*W+x0+k]=O.VWALL;
    }
    /* kapı: köyün merkezine bakan kenarın ortası */
    const dxh=cx-(x0+2),dyh=cy-(y0+2);let dxp=2,dyp=2,ex=0,ey=0;
    if(Math.abs(dxh)>Math.abs(dyh)){dxp=dxh>0?4:0;dyp=2;ex=dxh>0?1:-1}else{dyp=dyh>0?4:0;dxp=2;ey=dyh>0?1:-1}
    obj[(y0+dyp)*W+x0+dxp]=O.VDOOR;
    const hx=x0+2.5,hz=y0+2.5,sxv=Math.abs(ey),szv=Math.abs(ex);   /* yan yön */
    const dX=x0+dxp+.5,dZ=y0+dyp+.5;
    houses.push({x:hx,z:hz,prof,stone,ex,ey,dX,dZ,ry:Math.atan2(ex,ey)});
    npcs.push({prof,name:names[h],f:FEM.has(names[h]),h,x:dX+ex*2,z:dZ+ey*2,ix:hx,iz:hz,yaw:Math.atan2(-ex,-ey)});
    /* kapı yanında fener direği */
    dec('lamp',Math.floor(dX+ex*1.2+sxv*1.6),Math.floor(dZ+ey*1.2+szv*1.6),0,true);
    /* arka avlu: meslek malzemeleri */
    const bx=-ex,bz=-ey,yX=hx+bx*4.2,yZ=hz+bz*4.2;
    const P=(u,v)=>[Math.floor(yX+bx*u+sxv*v)+.5,Math.floor(yZ+bz*u+szv*v)+.5];
    const ry=Math.atan2(ex,ey);
    if(prof==='farmer'){
     for(let u=-1;u<=1;u++)for(let v=-1;v<=1;v++){const [x,y]=P(u,v);dec('crop',x,y,0,false)}
     dec('scarecrow',...P(0,0),ry,true);dec('hay',...P(0,2),ry,true);dec('hay',...P(-2,-2),ry+1,true);
    }else if(prof==='hunter'){
     dec('rack',...P(0,0),ry,true,{pelts:1});dec('dummy',...P(0,2),ry,true);dec('crate',...P(-1,-2),ry,true);
    }else if(prof==='fisher'){
     dec('boat',...P(0,0),ry,true);dec('barrel',...P(0,2),ry,true);dec('rack',...P(0,-2),ry,true,{fish:1});
    }else if(prof==='smith'){
     dec('forge',...P(0,0),ry,true);dec('weapons',...P(0,-2),ry,true);dec('coal',...P(0,2),ry,false);
    }else if(prof==='healer'){
     for(let v=-2;v<=2;v++){const [x,y]=P(0,v);dec('flowers',x,y,0,false)}
     for(let v=-1;v<=1;v++){const [x,y]=P(1,v);dec('flowers',x,y,0,false)}
     dec('pots',...P(-1,2),ry,true);
    }else if(prof==='woodcut'){
     dec('logs',...P(0,0),ry,true);dec('stump',...P(0,2),ry,true);dec('logs',...P(-1,-2),ry+1.6,true);
    }else if(prof==='miner'){
     dec('cart',...P(0,0),ry,true);dec('rocks',...P(0,2),ry,true);dec('weapons',...P(0,-2),ry,true,{picks:1});
    }
   }
   const wx=cx+2,wy=cy+2;
   dec('well',wx+.5,wy+.5,0,true);
   obj[cy*W+cx]=O.FIRE;obj[(cy-1)*W+cx+3]=O.BENCH;obj[(cy+2)*W+cx-3]=O.BENCH;
   dec('sign',cx+.5,cy-9.5,0,false,{text:VN[villages.length%VN.length]});
   for(let k=0;k<22;k++){const a=rnd()*6.28,rr=3+rnd()*7.5,x=Math.round(cx+Math.cos(a)*rr),y=Math.round(cy+Math.sin(a)*rr),i=y*W+x;if(!obj[i]&&tile[i]===T.GRASS)extras.push({k:'tuft',x:x+.3+rnd()*.4,z:y+.3+rnd()*.4,ry:rnd()*6,c:(rnd()*5)|0})}
   villages.push({cx,cy,name:VN[villages.length%VN.length],npcs,houses,extras});
  }
 }
 /* terk edilmiş kamplar: ada geneline dağılmış sandıklı yerler (uzak kamplar daha değerli) */
 const camps=[];
 {
  const want=Math.max(4,Math.round(4.6*SC)),nN=(HG.NOTES&&HG.NOTES.length)||14;let tries=0;
  const order=[];for(let i=0;i<nN;i++)order.push(i);
  for(let i=order.length-1;i>0;i--){const j=(rnd()*(i+1))|0;[order[i],order[j]]=[order[j],order[i]]}
  while(camps.length<want&&tries++<6000){
   const x=8+((rnd()*(W-16))|0),y=8+((rnd()*(H-16))|0);
   if(Math.hypot(x-sx,y-sy)<34)continue;
   if(villages.some(v=>Math.hypot(v.cx-x,v.cy-y)<26))continue;
   if(camps.some(c=>Math.hypot(c.x-x,c.y-y)<36))continue;
   let ok=true,hmin=9,hmax=-9;
   for(let j=-4;j<=4&&ok;j++)for(let k=-4;k<=4;k++){const i=(y+j)*W+x+k;if(tile[i]!==T.GRASS||obj[i]===O.FIRE){ok=false;break}hmin=Math.min(hmin,hgt[i]);hmax=Math.max(hmax,hgt[i])}
   if(!ok||hmax-hmin>1.2)continue;
   const q=(rnd()*4)|0,kind=['tent','ruin','stash'][(rnd()*3)|0],dd=Math.hypot(x-sx,y-sy)/(W/2),tier=dd>.62?2:dd>.38?1:0;
   const cq=Math.round(Math.cos(q*Math.PI/2)),sq=Math.round(Math.sin(q*Math.PI/2));
   for(let j=-4;j<=4;j++)for(let k=-4;k<=4;k++)obj[(y+j)*W+x+k]=O.NONE;
   const mk=(a,b)=>{obj[(y+Math.round(-a*sq+b*cq))*W+x+Math.round(a*cq+b*sq)]=O.VDEC};
   mk(0,0);
   if(kind==='tent'){for(let a=-3;a<=-1;a++)for(let b=-1;b<=1;b++)mk(a,b)}
   else if(kind==='ruin'){for(let a=-2;a<=2;a++)mk(a,-1)}
   else{for(let a=-1;a<=1;a++)mk(a,-1)}
   camps.push({id:camps.length,x,y,kind,q,tier,note:order[camps.length%nN],open:false});
  }
 }
 /* mağara girişleri: dağ eteklerinde rastgele yerler (içerisi girişte seed ile üretilir) */
 const caves=[];
 {
  const want=Math.max(3,Math.round(2.3*SC));let tries=0;
  while(caves.length<want&&tries++<9000){
   const x=10+((rnd()*(W-20))|0),y=10+((rnd()*(H-20))|0),relax=tries>5000;
   if(Math.hypot(x-sx,y-sy)<40)continue;
   if(villages.some(v=>Math.hypot(v.cx-x,v.cy-y)<30))continue;
   if(camps.some(c=>Math.hypot(c.x-x,c.y-y)<24))continue;
   if(caves.some(c=>Math.hypot(c.x-x,c.y-y)<(relax?40:62)))continue;
   let ok=true,hmin=9,hmax=-9,rk=0;
   for(let j=-4;j<=4&&ok;j++)for(let k=-4;k<=4;k++){const i=(y+j)*W+x+k,t=tile[i];if(t<=T.SHAL||t===T.POND||obj[i]===O.VDEC||obj[i]===O.FIRE){ok=false;break}if(t===T.ROCK)rk++;hmin=Math.min(hmin,hgt[i]);hmax=Math.max(hmax,hgt[i])}
   if(!ok||hmax-hmin>(relax?2.4:1.8)||rk<(relax?4:14))continue;
   const q=(rnd()*4)|0,dd=Math.hypot(x-sx,y-sy)/(W/2),tier=dd>.6?2:dd>.34?1:0;
   const cq=Math.round(Math.cos(q*Math.PI/2)),sq=Math.round(Math.sin(q*Math.PI/2));
   for(let j=-4;j<=4;j++)for(let k=-4;k<=4;k++)obj[(y+j)*W+x+k]=O.NONE;
   /* yapı: arkada ve yanlarda kaya kütlesi, ortada geçit (yerel b yönü: ön) */
   const mk=(a,b)=>{obj[(y+Math.round(-a*sq+b*cq))*W+x+Math.round(a*cq+b*sq)]=O.VDEC};
   mk(-2,0);mk(2,0);mk(-2,-1);mk(-1,-1);mk(0,-1);mk(1,-1);mk(2,-1);
   for(let j=-4;j<=4;j++)for(let k=-4;k<=4;k++)tile[(y+j)*W+x+k]===T.GRASS&&Math.hypot(j,k)<3&&(tile[(y+j)*W+x+k]=T.ROCK);
   caves.push({id:caves.length,x,y,q,tier,seed:((rnd()*2147483647)|0),open:false});
  }
 }
 /* kıyı köpüğü maskesi */
 const shore=new Uint8Array(W*H);
 const wat=t=>t<=T.SHAL||t===T.POND;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const i=y*W+x;if(!wat(tile[i]))continue;
  let m=0;
  if(y>0&&!wat(tile[i-W]))m|=1;if(x<W-1&&!wat(tile[i+1]))m|=2;if(y<H-1&&!wat(tile[i+W]))m|=4;if(x>0&&!wat(tile[i-1]))m|=8;
  shore[i]=m;
 }
 /* hayvanlar: otlaklarda koyun/inek, ormanda geyik/domuz, her yerde tavşan */
 const animals=[],used=new Set();
 for(const type in ANIMAL){
  const def=ANIMAL[type];let c=0,g=0;
  const want=Math.round(def.want*SC);
  while(c<want&&g++<want*90){
   const x=2+((rnd()*(W-4))|0),y=2+((rnd()*(H-4))|0),i=y*W+x;
   if(tile[i]!==T.GRASS||obj[i]||used.has(i))continue;
   if(Math.hypot(x-sx,y-sy)<14||hgt[i]>3)continue;
   if(villages.some(v=>Math.hypot(v.cx-x,v.cy-y)<16))continue;
   const f=fbm(x/12,y/12,seed+33);
   if((type==='deer'||type==='boar'||type==='wolf')&&f<.5)continue;
   if((type==='sheep'||type==='cow')&&f>.55)continue;
   /* bölgesellik: aynı tür başka bir kümeye yakın olamaz; farklı türler ise birbirine denk gelebilir */
   if(animals.some(q=>q.t===type?Math.hypot(q.x-x,q.z-y)<(def.sp||16):Math.hypot(q.x-x,q.z-y)<5))continue;
   const herd=(type==='sheep'||type==='cow'||type==='wolf')?1+((rnd()*2)|0):1;
   for(let k=0;k<herd;k++){
    const xx=x+k*2.2*(rnd()-.3),yy=y+k*2.2*(rnd()-.3),j=Math.floor(yy)*W+Math.floor(xx);
    if(tile[j]!==T.GRASS||obj[j]||used.has(j))continue;
    used.add(j);animals.push({t:type,x:Math.floor(xx)+.5,z:Math.floor(yy)+.5,yaw:rnd()*6.28});c++;
   }
  }
 }
 return {tile,obj,hgt,shore,animals,villages,camps,caves,sx:sx+.5,sy:sy+.5};
}
HG.genWorld=genWorld;
})();
