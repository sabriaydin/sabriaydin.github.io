/* Hunger 3D - dünya verileri: eşyalar, tarifler, harita üretimi */
(()=>{
'use strict';
const TS=32,W=112,H=112,DAY=420,REACH=2.7,SLOTS=24,HOT=8;
const T={DEEP:0,SHAL:1,SAND:2,GRASS:3,ROCK:4,POND:5};
const O={NONE:0,TREE:1,PALM:2,ROCK:3,COAL:4,COPPER:5,IRON:6,BUSH:7,BUSH0:8,PALM0:9,FIRE:10,BENCH:11,FURN:12,WALLW:13,WALLS:14,DOOR:15};
const SAVE='hunger-save-v3';
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const smooth=(a,b,x)=>{x=clamp((x-a)/(b-a),0,1);return x*x*(3-2*x)};

/* ---------- Eşyalar ---------- */
const IT={
 wood:{n:'Odun',s:50},stone:{n:'Taş',s:50},coal:{n:'Kömür',s:50},sand:{n:'Kum',s:50},
 copper_ore:{n:'Bakır Cevheri',s:50},iron_ore:{n:'Demir Cevheri',s:50},
 copper_ingot:{n:'Bakır Külçe',s:50},iron_ingot:{n:'Demir Külçe',s:50},
 berries:{n:'Yaban Meyvesi',s:30,food:{h:9,t:3},d:'Yenir: +9 açlık'},
 coconut:{n:'Hindistan Cevizi',s:20,food:{h:10,t:16},d:'Yenir: +10 açlık, +16 susuzluk'},
 fish:{n:'Çiğ Balık',s:20,food:{h:10,t:0,hp:-6},d:'Çiğ yenirse sağlığa zarar verir. Ateşte pişirin.'},
 cfish:{n:'Pişmiş Balık',s:20,food:{h:38,t:0},d:'Yenir: +38 açlık'},
 bottle:{n:'Boş Şişe',s:10,d:'Tatlı su gölüne bakıp sol tıkla doldurun.'},
 wbottle:{n:'Su Şişesi',s:10,food:{h:0,t:45,ret:'bottle'},d:'İçilir: +45 susuzluk'},
 axe1:{n:'Taş Balta',s:1,tool:'axe',tier:1},axe2:{n:'Bakır Balta',s:1,tool:'axe',tier:2},axe3:{n:'Demir Balta',s:1,tool:'axe',tier:3},
 pick1:{n:'Taş Kazma',s:1,tool:'pick',tier:1},pick2:{n:'Bakır Kazma',s:1,tool:'pick',tier:2},pick3:{n:'Demir Kazma',s:1,tool:'pick',tier:3},
 rod:{n:'Olta',s:1,tool:'rod',tier:1,d:'Suya bakıp sol tıkı basılı tutun.'},
 fire:{n:'Kamp Ateşi',s:10,place:O.FIRE,d:'Isıtır, aydınlatır. Balık pişirilir.'},
 bench:{n:'Çalışma Tezgâhı',s:10,place:O.BENCH,d:'Bakır ve demir aletler yakınında üretilir.'},
 furn:{n:'Ocak',s:10,place:O.FURN,d:'Cevher eritilir, şişe yapılır.'},
 wallw:{n:'Tahta Duvar',s:50,place:O.WALLW},walls:{n:'Taş Duvar',s:50,place:O.WALLS},
 door:{n:'Kapı',s:20,place:O.DOOR,d:'Geçilebilir, barınağı kapalı tutar.'}
};
const PLACE_ITEM={};for(const k in IT)if(IT[k].place)PLACE_ITEM[IT[k].place]=k;
const STN={fire:'Kamp Ateşi',bench:'Çalışma Tezgâhı',furn:'Ocak'};
const RC=[
 ['axe1',1,{wood:3,stone:3}],['pick1',1,{wood:3,stone:4}],['rod',1,{wood:4,stone:1}],
 ['fire',1,{wood:5,stone:3}],['bench',1,{wood:10,stone:2}],['furn',1,{stone:12}],
 ['wallw',2,{wood:3}],['walls',2,{stone:3}],['door',1,{wood:4}],
 ['cfish',1,{fish:1},'fire'],
 ['copper_ingot',1,{copper_ore:1,coal:1},'furn'],['iron_ingot',1,{iron_ore:1,coal:1},'furn'],['bottle',1,{sand:2,coal:1},'furn'],
 ['axe2',1,{wood:3,copper_ingot:3},'bench'],['pick2',1,{wood:3,copper_ingot:4},'bench'],
 ['axe3',1,{wood:3,iron_ingot:3},'bench'],['pick3',1,{wood:3,iron_ingot:4},'bench']
];
const POWER=[0.5,1.3,2.0,3.0];
/* düğümler: hp (saniye, güç=1), alet türü, gereken kademe, verilen */
const NODE={};
NODE[O.TREE]={hp:3.5,tool:'axe',req:0,give:()=>['wood',3+(Math.random()*3|0)],rm:O.NONE};
NODE[O.ROCK]={hp:3,tool:'pick',req:0,give:()=>['stone',2+(Math.random()*2|0)],rm:O.NONE};
NODE[O.COAL]={hp:5,tool:'pick',req:1,give:()=>['coal',2+(Math.random()*2|0)],rm:O.NONE,msg:'Kömür için en az Taş Kazma gerekir.'};
NODE[O.COPPER]={hp:6,tool:'pick',req:1,give:()=>['copper_ore',1+(Math.random()*2|0)],rm:O.NONE,msg:'Bakır için en az Taş Kazma gerekir.'};
NODE[O.IRON]={hp:8,tool:'pick',req:2,give:()=>['iron_ore',1+(Math.random()*2|0)],rm:O.NONE,msg:'Demir için en az Bakır Kazma gerekir.'};
NODE[O.BUSH]={hp:.7,tool:null,req:0,give:()=>['berries',2+(Math.random()*2|0)],rm:O.BUSH0,regrow:[O.BUSH,110]};
NODE[O.PALM]={hp:1.1,tool:null,req:0,give:()=>['coconut',1],rm:O.PALM0,regrow:[O.PALM,160]};
const SOLID=o=>o!==O.NONE&&o!==O.DOOR;

/* ---------- Gürültü ve rastgelelik ---------- */
function mulberry32(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hash(x,y,s){let h=Math.imul(x,374761393)^Math.imul(y,668265263)^Math.imul(s,1013904223);h=Math.imul(h^h>>>13,1274126177);return((h^h>>>16)>>>0)/4294967296}
function vnoise(x,y,s){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);const a=hash(xi,yi,s),b=hash(xi+1,yi,s),c=hash(xi,yi+1,s),d=hash(xi+1,yi+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function fbm(x,y,s){let t=0,a=.5,f=1;for(let i=0;i<4;i++){t+=a*vnoise(x*f,y*f,s+i*17);f*=2;a*=.5}return t/.9375}

/* ---------- Dünya üretimi ---------- */
function genWorld(seed){
 const rnd=mulberry32(seed^0x9e3779b9);
 const tile=new Uint8Array(W*H),obj=new Uint8Array(W*H);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const dx=(x+.5-W/2)/(W/2),dy=(y+.5-H/2)/(H/2),d=Math.sqrt(dx*dx+dy*dy);
  const n=fbm(x/22,y/22,seed),e=(1-Math.pow(d,1.7))+(n-.5)*.75;
  let t;
  if(e<.1)t=T.DEEP;else if(e<.2)t=T.SHAL;else if(e<.28)t=T.SAND;
  else{
   t=T.GRASS;
   if(e>.86||(e>.5&&fbm(x/9,y/9,seed+99)>.7))t=T.ROCK;
   else if(e>.4&&e<.82&&fbm(x/7,y/7,seed+7)>.74)t=T.POND;
  }
  tile[y*W+x]=t;
 }
 /* oyuncu başlangıcı: merkeze en yakın çimen */
 let sx=W>>1,sy=H>>1,best=1e9;
 for(let y=10;y<H-10;y++)for(let x=10;x<W-10;x++){
  if(tile[y*W+x]!==T.GRASS)continue;
  let ok=true;for(let j=-3;j<=3&&ok;j++)for(let i=-3;i<=3;i++){const t=tile[(y+j)*W+x+i];if(t!==T.GRASS&&t!==T.SAND){ok=false;break}}
  if(!ok)continue;
  const dd=(x-W/2)**2+(y-H/2)**2;if(dd<best){best=dd;sx=x;sy=y}
 }
 /* garanti tatlı su gölü */
 const pcx=sx+8,pcy=sy+3;
 for(let y=-3;y<=3;y++)for(let x=-4;x<=4;x++){
  const X=pcx+x,Y=pcy+y;if(X<1||Y<1||X>=W-1||Y>=H-1)continue;
  if((x*x)/16+(y*y)/9<=1&&tile[Y*W+X]>=T.SAND&&tile[Y*W+X]!==T.POND)tile[Y*W+X]=T.POND;
 }
 /* nesneler */
 for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
  const i=y*W+x,t=tile[i],r=rnd();
  if(t===T.GRASS){
   const f=fbm(x/12,y/12,seed+33);
   if(f>.55){if(r<.5)obj[i]=O.TREE;else if(r<.52)obj[i]=O.BUSH}
   else if(r<.05)obj[i]=O.TREE;else if(r<.062)obj[i]=O.ROCK;else if(r<.08)obj[i]=O.BUSH;
  }else if(t===T.SAND){if(r<.03)obj[i]=O.PALM}
  else if(t===T.ROCK){
   const o=fbm(x/6,y/6,seed+55);
   if(o>.6&&r<.3){const q=rnd();obj[i]=q<.42?O.COAL:q<.8?O.COPPER:O.IRON}
   else if(r<.12)obj[i]=O.ROCK;
  }
 }
 /* başlangıç çevresi */
 for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++)obj[(sy+y)*W+sx+x]=O.NONE;
 const seeds=[[O.TREE,8],[O.ROCK,4],[O.BUSH,3],[O.TREE,4]];
 for(const [ob,cnt] of seeds){let c=0,g=0;while(c<cnt&&g++<400){
  const a=rnd()*Math.PI*2,rr=4+rnd()*5,x=Math.round(sx+Math.cos(a)*rr),y=Math.round(sy+Math.sin(a)*rr),i=y*W+x;
  if(tile[i]===T.GRASS&&!obj[i]){obj[i]=ob;c++}
 }}
 /* kıyı köpüğü maskesi */
 const shore=new Uint8Array(W*H);
 const wat=t=>t<=T.SHAL||t===T.POND;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const i=y*W+x;if(!wat(tile[i]))continue;
  let m=0;
  if(y>0&&!wat(tile[i-W]))m|=1;if(x<W-1&&!wat(tile[i+1]))m|=2;if(y<H-1&&!wat(tile[i+W]))m|=4;if(x>0&&!wat(tile[i-1]))m|=8;
  shore[i]=m;
 }
 return {tile,obj,shore,sx:sx+.5,sy:sy+.5};
}

window.HG=Object.assign(window.HG||{},{TS,W,H,DAY,REACH,SLOTS,HOT,T,O,SAVE,clamp,smooth,IT,PLACE_ITEM,STN,RC,POWER,NODE,SOLID,genWorld,mulberry32,hash});
})();
