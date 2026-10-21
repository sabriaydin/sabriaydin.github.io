/* Hunger 3D - harita üretimi (ada, göller, nesneler) */
(()=>{
'use strict';
const {T,O,mulberry32,hash,fbm,vnoise,clamp,smooth,ANIMAL}=HG;
/* size: yalnızca eski (384) kayıtları yeniden kurmak için; verilmezse güncel harita boyutu kullanılır.
   Eski boyutta üretim, eski sürümle birebir aynı dünyayı verir (kayıtlı nesne dizisi uyuşsun diye). */
/* Tatlı su gölleri: içlerinde ve çevrelerinde (2 kare) ağaç, palmiye ve meyve çalısı bulunmaz. Rastgele sayı kullanmaz; üretimin sonunda ve kayıt yüklenince uygulanır. */
const PONDR=2,pondProt=o=>o===O.TREE||o===O.PALM||o===O.PALM0||o===O.BUSH||o===O.BUSH0;
function pondNear(tile,N,i,R){
 const x=i%N,y=(i/N)|0,r=R===undefined?PONDR:R;
 for(let j=-r;j<=r;j++){const Y=y+j;if(Y<0||Y>=N)continue;for(let k=-r;k<=r;k++){const X=x+k;if(X>=0&&X<N&&tile[Y*N+X]===T.POND)return true}}
 return false;
}
function pondClean(tile,obj,N){
 let n=0;
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  if(tile[y*N+x]!==T.POND)continue;
  for(let j=-PONDR;j<=PONDR;j++){const Y=y+j;if(Y<0||Y>=N)continue;for(let k=-PONDR;k<=PONDR;k++){const X=x+k;if(X<0||X>=N)continue;const i=Y*N+X;if(pondProt(obj[i])){obj[i]=O.NONE;n++}}}
 }
 return n;
}
HG.pondNear=pondNear;HG.pondClean=pondClean;
function genWorld(seed,size){
 const LEG=!!size&&size!==HG.W,W=size||HG.W,H=W;
 const rnd=mulberry32(seed^0x9e3779b9);
 const sp=mulberry32(seed^0x51ed270b),SC=LEG?W*H/65536:W*H/65536*.64;      /* yeni haritada kara oranı ~%64: sayılar karaya göre ölçeklenir */
 const LAND=LEG?1:.8;                                                     /* ana adanın harita içindeki göreli genişliği; kalan alan açık deniz */
 const half=W/2*LAND;
 const rs=mulberry32(seed^0x5ea5c0de);                                    /* deniz özellikleri ayrı bir akıştan üretilir (ana akış değişmez) */
 /* her tohum farklı ada biçimi: eksen oranı, dönüş, kayma ve kıyı bükülmesi */
 const rot=sp()*6.283,cr=Math.cos(rot),sr=Math.sin(rot),axr=.8+sp()*.4,ayr=.8+sp()*.4,ox=(sp()-.5)*.14,oy=(sp()-.5)*.14,wp=.18+sp()*.3;
 const tile=new Uint8Array(W*H),obj=new Uint8Array(W*H),hgt=new Float32Array(W*H);
 /* Gürültü alanları: her karede yeniden hesaplamak yerine seyrek ızgarada bir kez hesaplanır ve
    aradaki değerler karıştırılarak bulunur. Harita dört kat büyüdüğü hâlde üretim süresi artmaz. */
 const field=(step,fn)=>{
  const gw=Math.ceil(W/step)+2,gh=Math.ceil(H/step)+2,a=new Float32Array(gw*gh);
  for(let j=0;j<gh;j++)for(let i=0;i<gw;i++)a[j*gw+i]=fn(i*step,j*step);
  return (x,y)=>{
   const fx=x/step,fy=y/step,ix=fx|0,iy=fy|0,tx=fx-ix,ty=fy-iy,o=iy*gw+ix;
   const a0=a[o],a1=a[o+1],a2=a[o+gw],a3=a[o+gw+1];
   return (a0+(a1-a0)*tx)+((a2+(a3-a2)*tx)-(a0+(a1-a0)*tx))*ty;
  };
 };
 /* Alan sekizlikleri: ızgara adımının altındaki ayrıntı zaten görünmediğinden az sekizlik yeter.
    (Eski harita bu alanları kullanmaz; kayıt uyumu için orada özgün fbm çağrıları korunur.) */
 const fbmN=(x,y,s,n)=>{let t=0,a=.5,f=1,m=0;for(let i=0;i<n;i++){t+=a*vnoise(x*f,y*f,s+i*17);m+=a;f*=2;a*=.5}return t/m};
 const NUL=()=>.5;
 const mk=(st,sc,sd,oc)=>LEG?NUL:field(st,(x,y)=>fbmN(x/sc,y/sc,sd,oc));
 const F_warp=mk(8,46,seed+3,2);
 const F_base=mk(4,26,seed,2);
 const F_isle=mk(4,9,seed+777,2);
 const F_mount=mk(4,22,seed+5,2);
 const F_det=mk(3,5,seed+8,1);
 const F_rock=mk(4,9,seed+99,2);
 const F_pond=mk(4,7,seed+7,2);
 const F_for=mk(4,12,seed+33,2);
 const F_ore=mk(3,6,seed+55,1);
 /* sırtlı dağ dizileri, tepeler, nem ve sıcaklık (biyomlar) */
 const F_rdg=LEG?NUL:field(5,(x,y)=>{const n=fbmN(x/34,y/34,seed+21,3);return 1-Math.abs(2*n-1)});
 const F_rdg2=LEG?NUL:field(4,(x,y)=>{const n=fbmN(x/15,y/15,seed+23,2);return 1-Math.abs(2*n-1)});
 const F_hill=mk(5,30,seed+27,2);
 const F_moist=mk(6,38,seed+31,2);
 const F_warm=mk(8,52,seed+37,2);
 const dMain=(x,y)=>{const u=((x+.5)/W-.5-ox)*2/LAND,v=((y+.5)/H-.5-oy)*2/LAND,ru=(u*cr+v*sr)/axr,rv=(-u*sr+v*cr)/ayr;return Math.max(0,Math.sqrt(ru*ru+rv*rv)+((LEG?fbm(x/46,y/46,seed+3):F_warp(x,y))-.5)*wp)};
 /* açık deniz adacıkları: ana adadan uzak, birbirinden ayrık küçük kara parçaları */
 const islets=[],reefs=[];
 if(!LEG){
  const want=Math.round(W*H/65536*1.6),sizes=[15,13,11,10,9,8,8,7,6,6,5,5,5,4,4];
  for(let tr=0;tr<9000&&islets.length<want;tr++){
   const r=sizes[islets.length%sizes.length]+rs()*2,x=Math.round(r+14+rs()*(W-2*r-28)),y=Math.round(r+14+rs()*(H-2*r-28));
   if(dMain(x,y)<1.2+r/half*1.1)continue;
   if(islets.some(q=>Math.hypot(q.x-x,q.y-y)<q.r+r+30))continue;
   islets.push({x,y,r,id:islets.length});
  }
  /* mercan resifleri: açık denizde sığ (yürünebilir) sığlıklar */
  const wantR=Math.round(W*H/65536*1.2);
  for(let tr=0;tr<9000&&reefs.length<wantR;tr++){
   const r=5+rs()*5,x=Math.round(r+14+rs()*(W-2*r-28)),y=Math.round(r+14+rs()*(H-2*r-28));
   if(dMain(x,y)<1.14+r/half*1.1)continue;
   if(islets.some(q=>Math.hypot(q.x-x,q.y-y)<q.r+r+16)||reefs.some(q=>Math.hypot(q.x-x,q.y-y)<q.r+r+22))continue;
   reefs.push({x,y,r,id:reefs.length});
  }
 }
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const d=dMain(x,y);
  const n=LEG?fbm(x/26,y/26,seed):F_base(x,y),isle=Math.max(0,(LEG?fbm(x/9,y/9,seed+777):F_isle(x,y))-.66)*2.4*smooth(.62,.9,d)*(1-smooth(.96,1.05,d));
  let e=(1-Math.pow(d,1.7))+(n-.5)*.75+isle,onIslet=false;
  if((islets.length||reefs.length)&&e<.3){
   for(const q of islets){
    const ax=x-q.x,ay=y-q.y;if(ax>q.r*1.3||ax<-q.r*1.3||ay>q.r*1.3||ay<-q.r*1.3)continue;
    const ei=Math.min(.74,1-Math.pow(Math.hypot(ax,ay)/q.r,1.8)+(fbm(x/6,y/6,seed+91)-.5)*.55);
    if(ei>e){e=ei;onIslet=true}
   }
   for(const q of reefs){
    const ax=x-q.x,ay=y-q.y;if(ax>q.r*1.3||ax<-q.r*1.3||ay>q.r*1.3||ay<-q.r*1.3)continue;
    const ei=Math.min(.17,1.05-Math.pow(Math.hypot(ax,ay)/q.r,1.4)+(fbm(x/5,y/5,seed+93)-.5)*.5);
    if(ei>e)e=ei;
   }
  }
  let t,hh=0;
  if(e<.1){t=T.DEEP;hh=-Math.min(3.4,(.1-e)*13)}   /* açıklara doğru derinleşir */
  else if(e<.2)t=T.SHAL;else if(e<.28)t=T.SAND;
  else if(LEG){
   /* eski harita (kayıt uyumu): önceki yükseklik üretimi olduğu gibi korunur */
   const m=clamp((fbm(x/22,y/22,seed+5)-.46)/.3,0,1);
   hh=Math.pow(m,1.3)*6.5*clamp((e-.32)/.25,0,1)+fbm(x/5,y/5,seed+8)*.5*clamp((e-.3)/.2,0,1);
   if(onIslet)hh*=.2;
   t=T.GRASS;
   if(onIslet){if(hh>.9)t=T.ROCK}
   else if(hh>3.2||e>.9||(e>.5&&fbm(x/9,y/9,seed+99)>.76))t=T.ROCK;
   else if(e>.4&&e<.6&&hh<.7&&fbm(x/7,y/7,seed+7)>.74)t=T.POND;
  }else{
   /* Yeni harita: sırtlı dağ dizileri, aralarında vadiler, kıyıya doğru alçalan tepeler.
      rg: sırt gürültüsü (1 = sırt çizgisi), mMask: dağlık bölge, shelf: kıyıdan içeri geçiş. */
   const shelf=clamp((e-.3)/.26,0,1);
   const mMask=clamp((F_mount(x,y)-.47)/.2,0,1);
   const rg=F_rdg(x,y),rg2=F_rdg2(x,y);
   const hills=F_hill(x,y);
   const ridge=Math.pow(rg,2.1)*.78+Math.pow(rg2,2.6)*.22;
   hh=shelf*(hills*1.15+(.1+.9*mMask)*(ridge*7.6+Math.pow(ridge,3.2)*4.2))+F_det(x,y)*.5*shelf;
   if(onIslet)hh*=.18;
   const moist=F_moist(x,y);
   t=T.GRASS;
   if(onIslet){if(hh>.9)t=T.ROCK}
   else if(hh>3.9||e>.93||(hh>2.3&&F_rock(x,y)>.8))t=T.ROCK;                  /* yayla ve kayalık yamaçlar */
   else if(hh<.8&&moist>.56&&F_pond(x,y)>.645&&e>.34)t=T.POND;                /* bataklık gözleri */
   hgt[y*W+x]=hh;tile[y*W+x]=t;
   continue;
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
 /* ---- dereler: dağ eteklerinden denize inen vadiler; alçak kesimlerinde tatlı su akar ----
    Su yüzeyi tüm haritada tek düzeydedir, bu yüzden yüksekte kalan kesim kuru dere yatağı olarak
    oyulur; deniz seviyesine yaklaşan kesim göl karesine (içilebilir tatlı su) çevrilir. */
 const rivers=[];
 if(!LEG){
  const rr=mulberry32(seed^0x7a17e2),want=Math.max(4,Math.round(W*H/65536*.75));
  const inb=(x,y)=>x>2&&y>2&&x<W-3&&y<H-3;
  for(let n=0,tr=0;n<want&&tr<6000;tr++){
   const x0=8+((rr()*(W-16))|0),y0=8+((rr()*(H-16))|0),i0=y0*W+x0;
   if(hgt[i0]<3.4||tile[i0]<=T.SAND)continue;
   if(rivers.some(r=>Math.hypot(r.x-x0,r.y-y0)<W*.055))continue;
   const path=[];let x=x0,y=y0,px=0,py=0,ok=false,up=0;
   for(let st=0;st<4000;st++){
    path.push(y*W+x);
    let bx=0,by=0,bh=1e9;const jit=(rr()-.5)*.12;
    for(let j=-1;j<=1;j++)for(let k=-1;k<=1;k++){
     if(!j&&!k)continue;
     const X=x+k,Y=y+j;if(!inb(X,Y))continue;
     const q=Y*W+X;
     let h=tile[q]<=T.SHAL?-99:hgt[q];
     if(k===px&&j===py)h-=.14;                       /* yön sürekliliği: keskin dönüş azalır */
     h+=jit*(k*.31+j*.17);                           /* hafif kıvrım */
     if(h<bh){bh=h;bx=k;by=j}
    }
    if(!bx&&!by)break;
    px=bx;py=by;x+=bx;y+=by;
    const q=y*W+x;
    if(tile[q]<=T.SHAL){path.push(q);ok=true;break}  /* denize ulaştı */
    if(hgt[q]>hgt[path[path.length-1]]+.5){if(++up>70)break}  /* sığ çukurlar aşılır, derin çukurda durur */
   }
   if(!ok||path.length<30)continue;
   for(let st=0;st<path.length;st++){
    const i=path[st],cx=i%W,cy=(i/W)|0,p=st/path.length;
    const wd=1+Math.round(p*1.6);                    /* denize yaklaştıkça genişler */
    const deep=.9+p*.8;
    for(let j=-wd-1;j<=wd+1;j++)for(let k=-wd-1;k<=wd+1;k++){
     const X=cx+k,Y=cy+j;if(!inb(X,Y))continue;
     const q=Y*W+X,dd=Math.hypot(j,k);
     if(tile[q]<=T.SHAL)continue;
     const cut=deep*Math.max(0,1-dd/(wd+1.2));
     if(cut<=0)continue;
     hgt[q]=hgt[q]-cut;
     if(dd<=wd&&hgt[q]<.55){tile[q]=T.POND;hgt[q]=Math.min(hgt[q],0);obj[q]=O.NONE}
     else if(tile[q]===T.ROCK&&hgt[q]<1.2)tile[q]=T.GRASS;
    }
   }
   rivers.push({x:x0,y:y0,n:path.length});n++;
  }
 }
 /* nesneler */
 for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
  const i=y*W+x,t=tile[i],r=rnd();
  if(t===T.GRASS){
   const f=LEG?fbm(x/12,y/12,seed+33):F_for(x,y);
   if(LEG){
    if(f>.6){if(r<.17)obj[i]=O.TREE;else if(r<.185)obj[i]=O.BUSH}
    else if(r<.018)obj[i]=O.TREE;else if(r<.0200)obj[i]=O.ROCK;else if(r<.0350)obj[i]=O.BUSH;
   }else{
    /* Biyomlar: nem ve sıcaklığa göre orman, çayır, kurak ova ve bataklık kenarı.
       Bitki örtüsünün sıklığı bölgeden bölgeye belirgin biçimde değişir. */
    const moist=F_moist(x,y),warm=F_warm(x,y),h=hgt[i];
    if(moist>.56&&f>.5){                                   /* çam ormanı: sık ağaç */
     if(r<.19)obj[i]=O.TREE;else if(r<.215)obj[i]=O.BUSH;else if(r<.219)obj[i]=O.ROCK;
    }else if(moist>.66&&h<.8){                             /* bataklık kenarı: çalılık */
     if(r<.012)obj[i]=O.TREE;else if(r<.075)obj[i]=O.BUSH;
    }else if(moist<.38){                                   /* kurak ova: seyrek, taşlık */
     if(r<.004)obj[i]=O.TREE;else if(r<.026)obj[i]=O.ROCK;else if(r<.034)obj[i]=O.BUSH;
     if(!obj[i]&&warm>.62&&r<.038)obj[i]=O.PALM;           /* sıcak kesimde tek tük palmiye */
    }else{                                                 /* çayır: açık alan, öbekli ağaç */
     if(f>.62){if(r<.075)obj[i]=O.TREE;else if(r<.115)obj[i]=O.BUSH}
     else if(r<.013)obj[i]=O.TREE;else if(r<.019)obj[i]=O.ROCK;else if(r<.045)obj[i]=O.BUSH;
    }
   }
  }else if(t===T.SAND){if(r<.014)obj[i]=O.PALM}
  else if(t===T.ROCK){
   const o=LEG?fbm(x/6,y/6,seed+55):F_ore(x,y);
   if(o>.64&&r<.02){const q=rnd(),h=hgt[i];if(q<.72)obj[i]=O.COAL;else if(q<.93){if(h>1.6)obj[i]=O.COPPER}else if(h>3.4)obj[i]=O.IRON}
   else if(r<.008)obj[i]=O.ROCK;
  }
 }
 /* adacıklar: kumsalda palmiye, çimenlikte ağaç ve çalı (ayrı akıştan) */
 for(const q of islets){
  for(let y=Math.max(1,Math.floor(q.y-q.r*1.3));y<=Math.min(H-2,Math.ceil(q.y+q.r*1.3));y++)for(let x=Math.max(1,Math.floor(q.x-q.r*1.3));x<=Math.min(W-2,Math.ceil(q.x+q.r*1.3));x++){
   const i=y*W+x,t=tile[i],r=rs();if(obj[i])continue;
   if(t===T.SAND){if(r<.16)obj[i]=O.PALM}
   else if(t===T.GRASS){if(r<.07)obj[i]=O.TREE;else if(r<.12)obj[i]=O.BUSH;else if(r<.14)obj[i]=O.ROCK}
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
 /* Köy türleri: her köy farklı meslek karışımı ve farklı bir ayrıcalık taşır.
    Köy sayısı azdır; bu yüzden hangi köye gidileceği oyuncu için bir karar hâline gelir. */
 const VTYPE=[
  {k:'ciftlik',n:'Çiftlik köyü',pr:['farmer','farmer','healer','woodcut'],p:'Tahıl, ekmek ve şifalı ot'},
  {k:'maden',n:'Maden köyü',pr:['miner','smith','smith','hunter'],p:'Cevher, külçe ve alet'},
  {k:'avci',n:'Avcı köyü',pr:['hunter','hunter','woodcut','healer'],p:'Et, deri ve kürk'},
  {k:'balikci',n:'Balıkçı kasabası',pr:['fisher','fisher','smith','healer'],p:'İskele, kayık ve balık',coast:true},
  {k:'zanaat',n:'Zanaat köyü',pr:['smith','woodcut','farmer','healer'],p:'Alet onarımı ve karma ticaret'}
 ];
 {
  const want=LEG?Math.max(3,Math.round(2.6*SC)):Math.max(2,Math.round(.33*SC));
  const MIND=LEG?62:Math.max(90,Math.round(W*.115));      /* yeni haritada köyler birbirinden uzaktır */
  let tries=0,nCoast=0,ti=(rnd()*VTYPE.length)|0;
  const shuf=a=>{for(let i=a.length-1;i>0;i--){const j=(rnd()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]]}return a};
  const maxTry=LEG?4000:7000;
  while(villages.length<want&&tries++<maxTry){
   const cx=20+((rnd()*(W-40))|0),cy=20+((rnd()*(H-40))|0);
   if(Math.hypot(cx-sx,cy-sy)<48)continue;
   let ok=true;for(const v of villages)if(Math.hypot(v.cx-cx,v.cy-cy)<MIND){ok=false;break}
   if(!ok)continue;
   /* kıyı yoklaması: yakında deniz varsa burası balıkçı kasabası olabilir (kumsal kareleri kabul edilir).
      İlk denemeler yalnızca kıyı adaylarını kabul eder: her haritada kasaba kurulabilsin. */
   let wd=null;
   if(!LEG&&nCoast<2){
    let bd=1e9;
    for(let j=-17;j<=17;j++)for(let k=-17;k<=17;k++){
     const X=cx+k,Y=cy+j;if(X<3||Y<3||X>=W-3||Y>=H-3)continue;
     if(tile[Y*W+X]>T.SHAL)continue;
     const d2=j*j+k*k;if(d2<bd){bd=d2;wd={x:k,y:j}}
    }
    if(bd>17*17)wd=null;
   }
   if(!LEG&&nCoast<2&&tries<Math.round(maxTry*.45)&&!wd)continue;
   let hmin=9,hmax=-9,hs=0,hn=0;
   for(let j=-10;j<=10&&ok;j++)for(let k=-10;k<=10;k++){
    const i=(cy+j)*W+cx+k,t=tile[i];
    if(t!==T.GRASS&&!(wd&&t===T.SAND)){ok=false;break}
    const h=hgt[i];hmin=Math.min(hmin,h);hmax=Math.max(hmax,h);hs+=h;hn++;
   }
   if(!ok||hmax-hmin>2.4)continue;
   const h0=hs/hn;
   for(let j=-14;j<=14;j++)for(let k=-14;k<=14;k++){
    const x=cx+k,y=cy+j;if(x<1||y<1||x>=W-1||y>=H-1)continue;
    const i=y*W+x,dd=Math.max(Math.abs(j),Math.abs(k)),f=clamp((dd-11)/3,0,1),w=1-f*f*(3-2*f);
    if(tile[i]===T.GRASS||tile[i]===T.ROCK||tile[i]===T.SAND){hgt[i]=hgt[i]*(1-w)+h0*w;if(dd<=12){obj[i]=O.NONE;if(tile[i]===T.ROCK)tile[i]=T.GRASS}}
   }
   /* tür seçimi: sırayla dolaşılır; balıkçı kasabası yalnızca kıyıda ve en çok iki tane olur */
   let vt=null;const wdir=wd;
   if(LEG)vt={k:'',n:'',pr:shuf(PR.slice()),p:''};
   else if(wd){vt=VTYPE.find(c=>c.coast);nCoast++}
   else{
    for(let a=0;a<VTYPE.length&&!vt;a++){
     const c=VTYPE[(ti+a)%VTYPE.length];
     if(c.coast)continue;
     vt=c;ti=(ti+a+1)%VTYPE.length;
    }
   }
   const spots=shuf([[-6,-5],[3,-5],[-6,3],[3,3]]),nh=LEG?3+((rnd()*2)|0):4,profs=(LEG?vt.pr:vt.pr.slice()).slice(0,nh),npcs=[],houses=[],extras=[];
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
    dec('lamp',Math.floor(dX+ex*1.2+sxv*1.6)+.5,Math.floor(dZ+ey*1.2+szv*1.6)+.5,0,true);   /* direk karenin ortasında durur: köşede olursa kare boş görünür ama engel olurdu */
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
   obj[cy*W+cx]=O.FIRE;obj[(cy+1)*W+cx+4]=O.BENCH;obj[(cy+2)*W+cx-3]=O.BENCH;   /* ev duvarlarının dışında: (cx+3,cy-1) evin köşe duvarını eziyordu */
   dec('sign',cx+.5,cy-9.5,0,false,{text:VN[villages.length%VN.length]+(vt.n?' · '+vt.n:'')});
   /* türe özgü ek yapılar ve iskele */
   if(!LEG){
    const put=(ox2,oy2,v)=>{const X=cx+ox2,Y=cy+oy2;if(X>1&&Y>1&&X<W-2&&Y<H-2&&!obj[Y*W+X]&&tile[Y*W+X]===T.GRASS)obj[Y*W+X]=v};
    if(vt.k==='ciftlik'){for(let j=-2;j<=2;j++)for(let k=-2;k<=2;k++)dec('crop',cx+8.5+k,cy+8.5+j,0,false);dec('hay',cx+11.5,cy+6.5,0,true)}
    else if(vt.k==='maden'){dec('cart',cx-8.5,cy+8.5,0,true);dec('rocks',cx-6.5,cy+8.5,0,true);put(-7,6,O.FURN);put(-5,6,O.BENCH)}
    else if(vt.k==='avci'){dec('rack',cx+8.5,cy-8.5,0,true,{pelts:1});dec('dummy',cx+6.5,cy-8.5,0,true)}
    else if(vt.k==='zanaat'){put(4,-6,O.BENCH);put(6,-6,O.FURN);dec('logs',cx+8.5,cy-6.5,0,true)}
    else if(vt.k==='balikci'&&wdir){
     /* İskele: köyden denize uzanan üç kare genişliğinde taş-kum dil; üzerinde fıçı ve sandıklar,
        ucunda bağlı kayıklar ve geceleri yanan bir fener. */
     const L=Math.hypot(wdir.x,wdir.y)||1,ux=wdir.x/L,uy=wdir.y/L;
     let st=5,X=cx,Y=cy;
     while(st<32){X=Math.round(cx+ux*st);Y=Math.round(cy+uy*st);if(X<3||Y<3||X>=W-3||Y>=H-3)break;if(tile[Y*W+X]<=T.SHAL)break;st++}
     let last=null,n0=0;
     for(;n0<17;n0++,st++){
      X=Math.round(cx+ux*st);Y=Math.round(cy+uy*st);
      if(X<3||Y<3||X>=W-3||Y>=H-3)break;
      if(tile[Y*W+X]>T.SHAL&&n0>3)break;                 /* karaya geri çıktı */
      for(let j=-1;j<=1;j++)for(let k=-1;k<=1;k++){
       const X2=X+k,Y2=Y+j,q=Y2*W+X2;
       if(X2<2||Y2<2||X2>=W-2||Y2>=H-2)continue;
       if(tile[q]>T.SHAL)continue;
       tile[q]=T.SAND;hgt[q]=0;obj[q]=O.NONE;
      }
      if(n0===4)dec('barrel',X+1.5,Y+.5,0,true);
      if(n0===8)dec('crate',X-1.5,Y+.5,0,true);
      last={x:X,y:Y};
     }
     if(last&&n0>5){
      dec('boat',last.x+1.5,last.y+.5,1.57,true);
      dec('boat',last.x-1.5,last.y+.5,1.57,true);
      dec('lamp',last.x+.5,last.y+.5,0,true);
      dec('rack',last.x+.5,last.y-1.5,0,true,{fish:1});
     }
    }
   }
   for(let k=0;k<22;k++){const a=rnd()*6.28,rr=3+rnd()*7.5,x=Math.round(cx+Math.cos(a)*rr),y=Math.round(cy+Math.sin(a)*rr),i=y*W+x;if(!obj[i]&&tile[i]===T.GRASS)extras.push({k:'tuft',x:x+.3+rnd()*.4,z:y+.3+rnd()*.4,ry:rnd()*6,c:(rnd()*5)|0})}
   villages.push({cx,cy,name:VN[villages.length%VN.length],type:vt.k||'',typeName:vt.n||'',perk:vt.p||'',npcs,houses,extras});
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
   const q=(rnd()*4)|0,kind=['tent','ruin','stash'][(rnd()*3)|0],dd=Math.hypot(x-sx,y-sy)/half,tier=dd>.62?2:dd>.38?1:0;
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
   const q=(rnd()*4)|0,dd=Math.hypot(x-sx,y-sy)/half,tier=dd>.6?2:dd>.34?1:0;
   const cq=Math.round(Math.cos(q*Math.PI/2)),sq=Math.round(Math.sin(q*Math.PI/2));
   for(let j=-4;j<=4;j++)for(let k=-4;k<=4;k++)obj[(y+j)*W+x+k]=O.NONE;
   /* yapı: arkada ve yanlarda kaya kütlesi, ortada geçit (yerel b yönü: ön) */
   const mk=(a,b)=>{obj[(y+Math.round(-a*sq+b*cq))*W+x+Math.round(a*cq+b*sq)]=O.VDEC};
   mk(-2,0);mk(2,0);mk(-2,-1);mk(-1,-1);mk(0,-1);mk(1,-1);mk(2,-1);
   for(let j=-4;j<=4;j++)for(let k=-4;k<=4;k++)tile[(y+j)*W+x+k]===T.GRASS&&Math.hypot(j,k)<3&&(tile[(y+j)*W+x+k]=T.ROCK);
   caves.push({id:caves.length,x,y,q,tier,seed:((rnd()*2147483647)|0),open:false});
  }
 }
 /* ---- deniz özellikleri (yalnızca yeni harita): gemi enkazları, adacık sığınakları, deniz fenerleri ---- */
 if(!LEG){
  const PI2=Math.PI/2,WYv=-.16,isWat=i=>tile[i]<=T.SHAL,depthAt=i=>WYv-(tile[i]===T.DEEP?-1.3+hgt[i]:-.5);
  const nN2=(HG.NOTES&&HG.NOTES.length)||14;
  const map=(x,y,q,a,b)=>{const cq=Math.round(Math.cos(q*PI2)),sq=Math.round(Math.sin(q*PI2));return [x+Math.round(a*cq+b*sq),y+Math.round(-a*sq+b*cq)]};
  const area=(x,y,q,a0,a1,b0,b1,ok)=>{for(let a=a0;a<=a1;a++)for(let b=b0;b<=b1;b++){const [X,Y]=map(x,y,q,a,b);if(X<2||Y<2||X>=W-2||Y>=H-2||!ok(Y*W+X))return false}return true};
  const mark=(x,y,q,a0,a1,b0,b1)=>{for(let a=a0;a<=a1;a++)for(let b=b0;b<=b1;b++){const [X,Y]=map(x,y,q,a,b);obj[Y*W+X]=O.VDEC}};
  const addCamp=(x,y,kind,q,tier)=>{camps.push({id:camps.length,x,y,kind,q,tier,note:(camps.length*5+3)%nN2,open:false});return camps[camps.length-1]};
  /* batıklar: kıyıya yakın, 1,5-2,7 m derin sularda yan yatmış gemi gövdesi ve dibinde sandık */
  const wantW=Math.max(4,Math.round(W*H/65536*.9));let nW=0;
  for(let tr=0;tr<40000&&nW<wantW;tr++){
   const x=16+((rs()*(W-32))|0),y=16+((rs()*(H-32))|0),i=y*W+x;
   if(tile[i]!==T.DEEP)continue;
   const dp=depthAt(i);if(dp<1.5||dp>2.7)continue;
   if(camps.some(c=>Math.hypot(c.x-x,c.y-y)<(c.kind==='wreck'?64:18)))continue;
   const q=(rs()*4)|0;
   if(!area(x,y,q,-5,4,-3,2,j=>isWat(j)&&obj[j]===0&&depthAt(j)>=1.0))continue;
   addCamp(x,y,'wreck',q,Math.min(2,1+((rs()*2.4)|0)));nW++;
   mark(x,y,q,0,0,0,0);mark(x,y,q,-4,3,-2,-1);
  }
  /* adacık sığınakları: iri adacıkların ortasında sandıklı küçük barınak */
  for(const t of islets){
   if(t.r<7)continue;
   let best=null,bd=1e9;
   for(let y=Math.floor(t.y-t.r*.6);y<=Math.ceil(t.y+t.r*.6);y++)for(let x=Math.floor(t.x-t.r*.6);x<=Math.ceil(t.x+t.r*.6);x++){
    const i=y*W+x;if(x<4||y<4||x>=W-4||y>=H-4||tile[i]<T.SAND||tile[i]===T.POND||tile[i]===T.ROCK)continue;
    const q=(rs()*4)|0;
    if(!area(x,y,q,-3,2,-2,2,j=>tile[j]===T.GRASS||tile[j]===T.SAND))continue;
    const dd=Math.hypot(x-t.x,y-t.y);if(dd<bd){bd=dd;best={x,y,q}}
   }
   if(!best)continue;
   const {x,y,q}=best;
   for(let a=-3;a<=2;a++)for(let b=-2;b<=2;b++){const [X,Y]=map(x,y,q,a,b);obj[Y*W+X]=O.NONE}
   addCamp(x,y,'castaway',q,dMain(x,y)>1.7?2:1);
   mark(x,y,q,0,0,0,0);mark(x,y,q,-2,-1,-1,1);
   t.camp=camps.length-1;
  }
  /* deniz fenerleri: ana ada kıyısında ve en büyük adacıklarda; yanında bekçi sandığı */
  let nL=0;const wantL=Math.max(3,Math.round(W*H/65536*.45));
  for(let tr=0;tr<60000&&nL<wantL;tr++){
   const x=8+((rs()*(W-16))|0),y=8+((rs()*(H-16))|0),i=y*W+x;
   if(tile[i]!==T.SAND)continue;
   if(Math.hypot(x-sx,y-sy)<60||villages.some(v=>Math.hypot(v.cx-x,v.cy-y)<30)||camps.some(c=>Math.hypot(c.x-x,c.y-y)<(c.kind==='lighthouse'?150:20)))continue;
   let wc=0;for(let j=-6;j<=6;j++)for(let k=-6;k<=6;k++){const X=x+k,Y=y+j;if(X>0&&Y>0&&X<W-1&&Y<H-1&&isWat(Y*W+X))wc++}
   if(wc<46)continue;
   const q=(rs()*4)|0;
   if(!area(x,y,q,-2,2,-3,1,j=>tile[j]===T.SAND||tile[j]===T.GRASS))continue;
   for(let a=-2;a<=2;a++)for(let b=-3;b<=1;b++){const [X,Y]=map(x,y,q,a,b);obj[Y*W+X]=O.NONE}
   addCamp(x,y,'lighthouse',q,1);nL++;
   mark(x,y,q,0,0,0,0);mark(x,y,q,-1,1,-3,-1);
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
   const f=LEG?fbm(x/12,y/12,seed+33):F_for(x,y);
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
 pondClean(tile,obj,W);
 return {tile,obj,hgt,shore,animals,villages,camps,caves,sx:sx+.5,sy:sy+.5,islets,reefs,rivers,size:W,entSC:SC};
}
/* Eski (384) dünyayı güncel büyük haritanın ortasına yerleştirir; çevresi açık denizdir. off: kaydırma (kare). */
function embedLegacy(w,size,seed){
 const N=HG.W,off=(N-size)>>1,tile=new Uint8Array(N*N),obj=new Uint8Array(N*N),hgt=new Float32Array(N*N).fill(-3.4),shore=new Uint8Array(N*N);
 for(let y=0;y<size;y++){
  const d=(y+off)*N+off,r=y*size;
  tile.set(w.tile.subarray(r,r+size),d);obj.set(w.obj.subarray(r,r+size),d);hgt.set(w.hgt.subarray(r,r+size),d);shore.set(w.shore.subarray(r,r+size),d);
 }
 for(const a of w.animals){a.x+=off;a.z+=off}
 for(const v of w.villages){
  v.cx+=off;v.cy+=off;
  for(const n of v.npcs){n.x+=off;n.z+=off;n.ix+=off;n.iz+=off}
  for(const h of v.houses){h.x+=off;h.z+=off;h.dX+=off;h.dZ+=off}
  for(const e of v.extras){e.x+=off;e.z+=off}
 }
 for(const c of w.camps){c.x+=off;c.y+=off}
 for(const c of w.caves){c.x+=off;c.y+=off}
 /* Çevredeki geniş denize deniz özellikleri eklenir: aynı tohumun yeni haritasından uzak adacıklar, resifler ve
    adacık kampları aktarılır; batıklar ayrı bir akıştan yerleştirilir. Yeni kamplar listenin sonuna eklenir (eski kayıt sırası bozulmaz). */
 const islets=[],reefs=[],camps=w.camps,lo=off-10,hi=off+size+10;
 const inSq=(x,y,R)=>x+R>lo&&x-R<hi&&y+R>lo&&y-R<hi;
 if(seed!==undefined){
  const nw=genWorld(seed);
  const copyBox=(x,y,R)=>{for(let j=Math.max(1,Math.floor(y-R));j<=Math.min(N-2,Math.ceil(y+R));j++)for(let k=Math.max(1,Math.floor(x-R));k<=Math.min(N-2,Math.ceil(x+R));k++){const i=j*N+k;tile[i]=nw.tile[i];obj[i]=nw.obj[i];hgt[i]=nw.hgt[i];shore[i]=nw.shore[i]}};
  const cmap=new Map();
  for(const q of nw.islets){
   const R=Math.ceil(q.r*1.3)+2;if(inSq(q.x,q.y,R))continue;
   copyBox(q.x,q.y,R);const n={x:q.x,y:q.y,r:q.r,id:islets.length};islets.push(n);
   if(q.camp!==undefined)cmap.set(q.camp,n);
   for(let ci=0;ci<nw.camps.length;ci++){
    const c=nw.camps[ci];if(c.kind==='wreck'||Math.abs(c.x-q.x)>R||Math.abs(c.y-q.y)>R)continue;
    camps.push({id:camps.length,x:c.x,y:c.y,kind:c.kind,q:c.q,tier:c.tier,note:c.note,open:false});
    if(cmap.get(q.camp)===n&&ci===q.camp)n.camp=camps.length-1;
   }
  }
  for(const q of nw.reefs){
   const R=Math.ceil(q.r*1.3)+2;if(inSq(q.x,q.y,R))continue;
   copyBox(q.x,q.y,R);reefs.push({x:q.x,y:q.y,r:q.r,id:reefs.length});
  }
  /* batıklar: ayrı akış, 1,5-2,7 m derinlikte yan yatmış gövde (dibi kubbe biçiminde yükseltilir) */
  const rw=mulberry32((seed^0x2c9f77b1)>>>0),PI2=Math.PI/2,nN2=(HG.NOTES&&HG.NOTES.length)||14;
  const map=(x,y,q,a,b)=>{const cq=Math.round(Math.cos(q*PI2)),sq=Math.round(Math.sin(q*PI2));return [x+Math.round(a*cq+b*sq),y+Math.round(-a*sq+b*cq)]};
  const wantW=Math.max(3,Math.round((N*N-size*size)/65536*.9));let nW=0;
  for(let tr=0;tr<30000&&nW<wantW;tr++){
   const x=16+((rw()*(N-32))|0),y=16+((rw()*(N-32))|0),i=y*N+x;
   if(inSq(x,y,16)||tile[i]!==T.DEEP||obj[i])continue;
   if(islets.some(q=>Math.hypot(q.x-x,q.y-y)<q.r*1.3+12)||reefs.some(q=>Math.hypot(q.x-x,q.y-y)<q.r*1.3+10))continue;
   if(camps.some(c=>c.kind==='wreck'&&Math.hypot(c.x-x,c.y-y)<64))continue;
   const q=(rw()*4)|0;let ok=true;
   for(let a=-5;a<=4&&ok;a++)for(let b=-3;b<=2;b++){const [X,Y]=map(x,y,q,a,b),j=Y*N+X;if(tile[j]!==T.DEEP||obj[j]){ok=false;break}}
   if(!ok)continue;
   for(let j=y-11;j<=y+11;j++)for(let k=x-11;k<=x+11;k++){
    const m=j*N+k,d=Math.hypot(k-x,j-y);if(d>11||tile[m]!==T.DEEP)continue;
    hgt[m]=Math.max(hgt[m],-3.4+2.4*(1-smooth(5,11,d)));
   }
   camps.push({id:camps.length,x,y,kind:'wreck',q,tier:Math.min(2,1+((rw()*2.4)|0)),note:(camps.length*5+3)%nN2,open:false});
   const mark=(a0,a1,b0,b1)=>{for(let a=a0;a<=a1;a++)for(let b=b0;b<=b1;b++){const [X,Y]=map(x,y,q,a,b);obj[Y*N+X]=O.VDEC}};
   mark(0,0,0,0);mark(-4,3,-2,-1);nW++;
  }
  /* deniz fenerleri: en iri adacıkların kumsalında (en fazla 2) */
  let nL=0;const big=islets.filter(q=>q.r>=8);
  for(let tr=0;tr<20000&&nL<2&&big.length;tr++){
   const t0=big[(rw()*big.length)|0],x=Math.round(t0.x+(rw()*2-1)*t0.r*1.2),y=Math.round(t0.y+(rw()*2-1)*t0.r*1.2),i=y*N+x;
   if(x<8||y<8||x>=N-8||y>=N-8||tile[i]!==T.SAND)continue;
   if(camps.some(c=>Math.hypot(c.x-x,c.y-y)<(c.kind==='lighthouse'?150:c.kind==='castaway'?8:20)))continue;
   let wc=0;for(let j=-6;j<=6;j++)for(let k=-6;k<=6;k++)if(tile[(y+j)*N+x+k]<=T.SHAL)wc++;
   if(wc<46)continue;
   const q=(rw()*4)|0;let ok=true;
   for(let a=-2;a<=2&&ok;a++)for(let b=-3;b<=1;b++){const [X,Y]=map(x,y,q,a,b),tt=tile[Y*N+X];if(tt!==T.SAND&&tt!==T.GRASS){ok=false;break}}
   if(!ok)continue;
   for(let a=-2;a<=2;a++)for(let b=-3;b<=1;b++){const [X,Y]=map(x,y,q,a,b);obj[Y*N+X]=O.NONE}
   camps.push({id:camps.length,x,y,kind:'lighthouse',q,tier:1,note:(camps.length*5+3)%nN2,open:false});
   const mk2=(a0,a1,b0,b1)=>{for(let a=a0;a<=a1;a++)for(let b=b0;b<=b1;b++){const [X,Y]=map(x,y,q,a,b);obj[Y*N+X]=O.VDEC}};
   mk2(0,0,0,0);mk2(-1,1,-3,-1);nL++;
  }
 }
 return Object.assign({},w,{tile,obj,hgt,shore,camps,sx:w.sx+off,sy:w.sy+off,islets,reefs,size:N,off,entSC:size*size/65536});
}
/* Karadan uzaklık alanı (kare): kara ve göl 0; açık denizde artar (255'e kadar). Köpekbalığı, martı vb. için kullanılır. */
function seaDistField(tile,N){
 const d=new Uint8Array(N*N).fill(255),q=new Int32Array(N*N);let h=0,t=0;
 for(let i=0;i<N*N;i++)if(tile[i]>=T.SAND){d[i]=0;q[t++]=i}
 while(h<t){
  const i=q[h++],v=d[i]+1;if(v>=250)continue;
  const x=i%N;
  if(x>0&&d[i-1]===255){d[i-1]=v;q[t++]=i-1}
  if(x<N-1&&d[i+1]===255){d[i+1]=v;q[t++]=i+1}
  if(i>=N&&d[i-N]===255){d[i-N]=v;q[t++]=i-N}
  if(i<N*N-N&&d[i+N]===255){d[i+N]=v;q[t++]=i+N}
 }
 return d;
}
HG.genWorld=genWorld;HG.embedLegacy=embedLegacy;HG.seaDistField=seaDistField;
})();
