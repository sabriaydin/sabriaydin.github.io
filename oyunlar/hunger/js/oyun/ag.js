/* Hunger 3D - co-op (iki oyunculu) ağ çekirdeği.
   Oyuncular WebRTC üzerinden doğrudan bağlanır (PeerJS yalnızca ilk el sıkışma için kullanılır): ev sahibi "kod" üretir, konuk kodu girerek katılır.
   Ev sahibi dünyayı yürütür (hayvanlar, düşmanlar, köylüler, zaman); konuk dünyanın kaydını alır, kendi hareketini ve hayatta kalma durumunu kendisi yürütür.
   Bu dosya: bağlantı, mesaj yolu, büyük veri aktarımı, el sıkışma, oyuncu konumları, saat, sohbet. Dünya ve varlık eşitlemesi ag-dunya.js ve ag-varlik.js içindedir. */
(()=>{
'use strict';
const {G,ui,look}=HG;
const PROTO=1,PFX='hunger3d-',AL='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',CH=12000,MAXG=1;
const POSHZ=16,TIMEOUT=16000,TIMEOUT_LOAD=150000;
const now=()=>performance.now();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const r2=v=>Math.round(v*100)/100,r3=v=>Math.round(v*1000)/1000;

const H=Object.create(null);                       /* ileti türü → işleyiciler */
const net=HG.net={
 role:'solo',st:'idle',msg:'',code:'',peer:null,peers:[],hostP:null,lat:0,
 name:'',wid:'',seq0:0,rules:null,
 cfg:{server:null,ice:null},                       /* server: PeerJS aracı sunucusu ({host,port,path,secure}); boşsa genel PeerJS bulutu */
 initFns:[],ticks:[],stl:[],baselines:[],banned:new Set(),pwp:null,
 PROTO,MAXG
};
HG.coop.mode='solo';HG.coop.host=true;
HG.coopLive=()=>HG.coop.mode!=='solo';
HG.netGuest=()=>HG.coop.mode==='guest';
HG.netHost=()=>HG.coop.mode==='host';

net.on=(t,f)=>{(H[t]||(H[t]=[])).push(f)};
net.onStatus=f=>{net.stl.push(f)};
net.tick=f=>{net.ticks.push(f)};
net.baseline=()=>{for(const f of net.baselines){try{f()}catch(e){console.error('taban',e)}}};   /* eşitleme modülleri 'son bilinen durum' tablolarını sıfırlar */
function dispatch(t,d,P){const a=H[t];if(!a)return;for(const f of a){try{f(d,P)}catch(e){console.error('ağ:'+t,e)}}}
net.dispatch=dispatch;
function setStatus(st,msg){
 net.st=st;net.msg=msg||'';
 for(const f of net.stl){try{f(st,net.msg)}catch(e){console.error(e)}}
}
net.setStatus=setStatus;

/* ---- Kod ---- */
const genCode=()=>{let s='';for(let i=0;i<6;i++)s+=AL[(Math.random()*AL.length)|0];return s};
const fmtCode=c=>c?c.slice(0,3)+'-'+c.slice(3):'';
const normCode=t=>String(t||'').toUpperCase().replace(/[^0-9A-Z]/g,'').slice(0,6);
net.fmtCode=fmtCode;net.normCode=normCode;

/* ---- Adı ---- */
const NKEY='hunger-coop-ad';
function readName(){
 let n='';
 try{n=localStorage.getItem(NKEY)||''}catch(e){}
 n=String(n||HG.me.name||'Oyuncu').replace(/\s+/g,' ').trim().slice(0,16);
 return n||'Oyuncu';
}
net.name=readName();
net.setName=t=>{
 const n=String(t||'').replace(/[<>&"]/g,'').replace(/\s+/g,' ').trim().slice(0,16);
 if(!n)return net.name;
 net.name=n;HG.me.name=n;try{localStorage.setItem(NKEY,n)}catch(e){}
 return n;
};
HG.me.name=net.name;

/* ---- PeerJS ---- */
function serverPref(){
 try{const s=JSON.parse(localStorage.getItem('hunger-peer-server')||'null');if(s&&typeof s==='object'&&typeof s.host==='string')return s}catch(e){}
 return null;
}
function mkPeer(id){
 if(typeof Peer==='undefined')throw new Error('PeerJS yüklenemedi');
 const o={debug:0};
 const sv=net.cfg.server||serverPref();
 if(sv)Object.assign(o,sv);
 if(net.cfg.ice)o.config={iceServers:net.cfg.ice};
 return id?new Peer(id,o):new Peer(o);
}
const ERR={
 'peer-unavailable':'Bu kodla açık bir oyun bulunamadı. Kodu ve ev sahibinin çevrimiçi olduğunu denetleyin.',
 'network':'Ağ bağlantısı kurulamadı. İnternet bağlantısını denetleyin.',
 'server-error':'Bağlantı sunucusu yanıt vermiyor. Biraz sonra yeniden deneyin.',
 'socket-error':'Bağlantı sunucusuna ulaşılamadı. Biraz sonra yeniden deneyin.',
 'socket-closed':'Bağlantı sunucusu bağlantıyı kapattı.',
 'webrtc':'Doğrudan bağlantı kurulamadı (güvenlik duvarı veya ağ kısıtı olabilir).',
 'browser-incompatible':'Tarayıcı doğrudan bağlantıyı (WebRTC) desteklemiyor.',
 'ssl-unavailable':'Güvenli bağlantı kurulamadı.',
 'unavailable-id':'Kod kullanımda.'
};
const errText=e=>ERR[e&&e.type]||('Bağlantı hatası'+(e&&e.type?' ('+e.type+')':'')+'.');

/* ---- İletim ---- */
function tx(conn,m){try{if(conn&&conn.open)conn.send(m)}catch(e){}}
net.sendTo=(P,m)=>tx(P&&P.conn,m);
net.send=(m,except)=>{for(const P of net.peers)if(P.ready&&P!==except)tx(P.conn,m)};
let bigN=0;
const BIG={};
/* Büyük veri: parçalara bölünür, kanal dolarsa beklenir */
async function sendBig(P,type,obj,meta){
 const conn=P.conn,s=typeof obj==='string'?obj:JSON.stringify(obj),id=++bigN,N=Math.max(1,Math.ceil(s.length/CH));
 for(let i=0;i<N;i++){
  while(conn.open&&conn.dataChannel&&conn.dataChannel.bufferedAmount>1500000)await sleep(25);
  if(!conn.open)return false;
  try{conn.send({t:'~b',id,i,n:N,ty:type,m:i===0?meta:undefined,d:s.slice(i*CH,(i+1)*CH)})}catch(e){return false}
  if(i%24===23)await sleep(0);
 }
 return true;
}
net.sendBig=sendBig;
function bigPart(P,d){
 const k=P.id+':'+d.id;
 let b=BIG[k];if(!b)b=BIG[k]={a:new Array(d.n),c:0,ty:d.ty,m:null};
 if(d.m!==undefined)b.m=d.m;
 if(b.a[d.i]===undefined){b.a[d.i]=d.d;b.c++}
 if(b.c>=d.n){
  delete BIG[k];
  dispatch(b.ty,{t:b.ty,big:true,raw:b.a.join(''),meta:b.m},P);
 }
}
function recv(P,d){
 if(!d||typeof d!=='object')return;
 P.last=now();
 if(d.t==='~b'){bigPart(P,d);return}
 dispatch(d.t,d,P);
}

/* ---- Oyuncu kayıtları (HG.remote): ağ katmanı yalnızca konum, can ve bayrak alanlarını günceller ---- */
function mkRec(P){
 return {id:'u-'+P.id,peerId:P.id,name:P.name||'Oyuncu',remote:true,x:0,z:0,y:0,yaw:0,pitch:0,hp:100,alive:true,fl:0,h:'',seen:now(),sh:false,tl:false,mv:false,P};
}
net.rec=P=>P.rec;
function addRemote(P){
 if(P.rec)return P.rec;
 P.rec=mkRec(P);HG.remote.push(P.rec);return P.rec;
}
function dropRemote(P){
 if(!P.rec)return;
 const i=HG.remote.indexOf(P.rec);if(i>=0)HG.remote.splice(i,1);
 P.rec=null;
}

/* ---- Tanımlayıcı: dünya kimliği (kayıtla birlikte saklanır) ---- */
HG.x2reg('wid',()=>'',v=>typeof v==='string'&&/^[a-z0-9]{6,12}$/.test(v)?v:'');
function worldId(){
 const x=HG.X2();
 if(!x.wid)x.wid=Math.random().toString(36).slice(2,10).padEnd(8,'0');
 return x.wid;
}
net.worldId=worldId;

/* ============================================================ Ev sahibi ============================================================ */
function hostFail(msg){
 try{if(net.peer)net.peer.destroy()}catch(e){}
 net.peer=null;net.code='';
 if(net.role==='host'){shutdown(true);return}
 setStatus('error',msg);
}
net.host=function(){
 if(net.role!=='solo'||HG.busy)return false;
 if(!G.obj||ui.state==='menu'||ui.state==='dead'){HG.toast('Önce bir oyuna girin; ardından Duraklat menüsünden co-op oyunu açın.');return false}
 if(G.cave){HG.toast('Mağaradayken co-op oyun açılamaz. Önce dışarı çıkın.');return false}
 if(typeof Peer==='undefined'){setStatus('error','Ağ kütüphanesi yüklenemedi.');return false}
 setStatus('connecting','Bağlantı sunucusuna ulaşılıyor…');
 let tries=0,done=false;
 const attempt=()=>{
  const code=genCode();let peer;
  try{peer=mkPeer(PFX+code)}catch(e){hostFail(String(e.message||e));return}
  net.peer=peer;
  const to=setTimeout(()=>{if(!done){try{peer.destroy()}catch(e){}if(net.peer===peer)net.peer=null;setStatus('error','Bağlantı sunucusuna ulaşılamadı. İnternet bağlantısını denetleyin.')}},15000);
  peer.on('open',()=>{
   clearTimeout(to);done=true;
   net.code=code;net.role='host';HG.coop.mode='host';HG.coop.host=true;net.hostP=null;
   worldId();net.baseline();
   setStatus('open','Kod: '+fmtCode(code));
   HG.emit('coop',{mode:'host',code});
  });
  peer.on('connection',onIncoming);
  peer.on('disconnected',()=>{if(net.peer===peer&&!peer.destroyed)setTimeout(()=>{try{peer.reconnect()}catch(e){}},1500)});
  peer.on('error',e=>{
   if(e&&e.type==='unavailable-id'&&tries++<5&&!done){clearTimeout(to);try{peer.destroy()}catch(x){}attempt();return}
   clearTimeout(to);
   if(!done){try{peer.destroy()}catch(x){}if(net.peer===peer)net.peer=null;setStatus('error',errText(e));return}
   /* kurulu oyunda araç sunucu hataları bağlı oyuncuları bozmaz */
   if(e&&e.type!=='peer-unavailable')console.warn('peer',e);
  });
 };
 attempt();
 return true;
};
function onIncoming(conn){
 if(net.role!=='host'){try{conn.close()}catch(e){}return}
 const P={id:conn.peer,conn,slot:0,name:'',pid:'',ready:false,joined:false,state:'new',last:now(),rec:null};
 conn.on('open',()=>{P.last=now()});
 conn.on('data',d=>recv(P,d));
 conn.on('close',()=>dropPeer(P,'bağlantı kapandı'));
 conn.on('error',()=>dropPeer(P,'bağlantı hatası'));
 if(net.peers.filter(q=>q.joined).length>=MAXG){
  conn.on('open',()=>{tx(conn,{t:'deny',r:'Oyun dolu: en fazla '+(MAXG+1)+' oyuncu katılabilir.'});setTimeout(()=>{try{conn.close()}catch(e){}},400)});
  return;
 }
 net.peers.push(P);
}
function deny(P,r){tx(P.conn,{t:'deny',r});setTimeout(()=>{try{P.conn.close()}catch(e){}},400);const i=net.peers.indexOf(P);if(i>=0)net.peers.splice(i,1)}
net.on('hello',(m,P)=>{
 if(net.role!=='host'||P.joined)return;
 if(m.v!==PROTO||(m.ver||'')!==(HG.VERSION||'')){deny(P,'Sürüm uyuşmuyor (ev sahibi '+(HG.VERSION||'?')+', siz '+(m.ver||'?')+'): iki oyuncu da aynı oyun sürümünü kullanmalı. Sayfayı yenileyin (Ctrl+F5).');return}
 if(HG.busy||G.cave||!(ui.state==='play'||ui.state==='pause')){deny(P,'Ev sahibi şu an katılımı kabul edemiyor (yükleniyor veya mağarada). Birkaç saniye sonra yeniden deneyin.');return}
 if(m.pid&&net.banned.has(String(m.pid))){deny(P,'Ev sahibi sizi bu oyundan çıkardı.');return}
 P.joined=true;P.name=String(m.name||'Oyuncu').replace(/[<>&"]/g,'').slice(0,16)||'Oyuncu';P.pid=String(m.pid||'').slice(0,12);P.state='snap';P.last=now();
 {const taken=new Set([net.name].concat(net.peers.filter(q=>q!==P&&q.joined).map(q=>q.name)));let nm=P.name,k=2;while(taken.has(nm))nm=P.name.slice(0,13)+' '+k++;P.name=nm}      /* aynı ad: sonuna sayı eklenir */
 tx(P.conn,{t:'welcome',v:PROTO,host:net.name,wid:worldId(),rules:rulesNow(),ver:HG.VERSION||''});
 HG.toast(P.name+' bağlanıyor…');
 sendSnapshot(P);
});
const rulesNow=()=>({diff:HG.cfg.diff,death:HG.cfg.death,season:HG.cfg.season,wear:HG.cfg.wear,peace:HG.cfg.peace});
async function sendSnapshot(P){
 try{
  const s=HG.snapshotRaw('Co-op');
  s.meta.th='';
  const hp=HG.x2stand?HG.x2stand(G.px+1.5,G.py+1.5,6):null;
  if(hp){s.px=hp.x;s.py=hp.z}
  s.rf=0;
  net.seq0=HG.journal.seq;P.seq0=net.seq0;
  const ok=await sendBig(P,'snap',s,{seq0:P.seq0,clock:G.clock});
  if(!ok)dropPeer(P,'aktarım kesildi');
 }catch(e){console.error('anlık görüntü',e);deny(P,'Dünya aktarılamadı.')}
}
net.on('ready',(m,P)=>{
 if(net.role!=='host'||!P.joined||P.ready)return;
 P.ready=true;P.state='play';P.last=now();
 addRemote(P);
 tx(P.conn,{t:'start',clk:G.clock,name:net.name});
 for(const f of net.initFns){try{f(P)}catch(e){console.error('init',e)}}
 net.send({t:'joined',name:P.name},P);
 HG.toast(P.name+' oyuna katıldı.');HG.feed(P.name+' katıldı');
 chatLine('', P.name+' oyuna katıldı.',true);
 HG.emit('coop-join',{name:P.name});
 setStatus(net.st,net.msg);
});
function dropPeer(P,why){
 const i=net.peers.indexOf(P);
 const wasReady=P.ready;
 if(i>=0)net.peers.splice(i,1);
 try{if(P.conn.open)P.conn.close()}catch(e){}
 if(net.role==='host'){
  dropRemote(P);
  if(P.joined&&wasReady){HG.toast(P.name+' oyundan ayrıldı.');chatLine('',P.name+' oyundan ayrıldı.',true);HG.emit('coop-leave',{name:P.name,why})}
  setStatus(net.st,net.msg);
 }else if(net.role==='guest'||HG.coop.mode==='guest'){
  hostLost(why);
 }
}
net.on('bye',(m,P)=>dropPeer(P,'ayrıldı'));
/* Ev sahibi bir oyuncuyu çıkarır; çıkarılan bu oturumda aynı kimlikle yeniden katılamaz */
net.kick=P=>{
 if(net.role!=='host'||!P||!P.joined)return false;
 if(P.pid)net.banned.add(P.pid);
 tx(P.conn,{t:'kick'});chatLine('',P.name+' oyundan çıkarıldı.',true);
 setTimeout(()=>dropPeer(P,'çıkarıldı'),300);
 return true;
};
net.on('kick',(m,P)=>{if(HG.coop.mode!=='guest'||P!==net.hostP)return;hostLost('kick')});
net.on('deny',(m)=>{
 if(net.role!=='solo'&&HG.coop.mode!=='guest')return;
 resetGuest();
 setStatus('error',m.r||'Katılım reddedildi.');
});

/* ============================================================ Konuk ============================================================ */
function resetGuest(){
 try{if(net.hostP&&net.hostP.conn)net.hostP.conn.close()}catch(e){}
 try{if(net.peer)net.peer.destroy()}catch(e){}
 net.peer=null;net.hostP=null;net.peers.length=0;
 if(net.role!=='guest'||ui.state==='menu'){net.role='solo';HG.coop.mode='solo';HG.coop.host=true}
 HG.remote.length=0;
}
net.join=function(text){
 const code=normCode(text);
 if(net.role!=='solo'||HG.busy){return false}
 if(code.length!==6){setStatus('error','Kod 6 karakterden oluşur (örnek: ABC-DEF).');return false}
 if(typeof Peer==='undefined'){setStatus('error','Ağ kütüphanesi yüklenemedi.');return false}
 setStatus('connecting','Ev sahibine bağlanılıyor…');
 let peer;
 try{peer=mkPeer()}catch(e){setStatus('error',String(e.message||e));return false}
 net.peer=peer;
 let opened=false;
 const to=setTimeout(()=>{if(!opened){resetGuest();setStatus('error','Ev sahibine ulaşılamadı. Kodu ve ev sahibinin çevrimiçi olduğunu denetleyin.')}},25000);
 peer.on('open',()=>{
  const conn=peer.connect(PFX+code,{reliable:true,serialization:'json'});
  const P={id:conn.peer,conn,slot:0,name:'',ready:false,joined:true,state:'hello',last:now(),rec:null};
  net.hostP=P;net.peers=[P];
  conn.on('open',()=>{
   opened=true;clearTimeout(to);P.last=now();
   HG.coop.mode='guest';HG.coop.host=false;net.role='guest';net.code=code;
   tx(conn,{t:'hello',v:PROTO,ver:HG.VERSION||'',name:net.name,pid:HG.me.id});
   setStatus('connecting','Bağlandı. Dünya bekleniyor…');
  });
  conn.on('data',d=>recv(P,d));
  conn.on('close',()=>{if(net.role==='guest'||!opened){if(!opened){clearTimeout(to);resetGuest();setStatus('error','Bağlantı kurulamadı.')}else dropPeer(P,'ev sahibi ayrıldı')}});
  conn.on('error',()=>{});
 });
 peer.on('error',e=>{
  clearTimeout(to);
  if(!opened){resetGuest();setStatus('error',errText(e));return}
  console.warn('peer',e);
 });
 return true;
};
net.on('welcome',(m,P)=>{
 if(HG.coop.mode!=='guest')return;
 P.name=m.host||'Ev sahibi';net.wid=m.wid||'';net.rules=m.rules||null;
 net.applyRules(net.rules);
 setStatus('loading','Dünya aktarılıyor…');
});
net.applyRules=r=>{
 if(!r)return;
 net.myRules=net.myRules||{diff:HG.cfg.diff,death:HG.cfg.death,season:HG.cfg.season,wear:HG.cfg.wear,peace:HG.cfg.peace};
 if(r.diff!==undefined)HG.cfg.diff=r.diff;
 HG.cfg.death=r.death==='perm'?'bed':r.death;                /* konuk, kendi tarayıcı kaydını silmesin diye kalıcı ölüm uygulanmaz */
 HG.cfg.season=r.season;HG.cfg.peace=r.peace;if(typeof r.wear==='boolean')HG.cfg.wear=r.wear;
};
net.on('snap',async(m,P)=>{
 if(HG.coop.mode!=='guest'||P!==net.hostP)return;
 let s;
 try{s=JSON.parse(m.raw)}catch(e){resetGuest();setStatus('error','Dünya verisi okunamadı.');return}
 net.seq0=(m.meta&&m.meta.seq0)||0;
 setStatus('loading','Dünya kuruluyor…');
 HG.netSnap=s;
 P.state='loading';
 try{await HG.startGame(true)}catch(e){console.error(e);resetGuest();setStatus('error','Dünya kurulamadı.');return}
 if(HG.coop.mode!=='guest')return;
 P.last=now();P.ready=true;P.state='play';
 net.baseline();
 const rec=addRemote(P);rec.name=P.name;
 tx(P.conn,{t:'ready'});
 setStatus('open','Bağlı: '+P.name);
 HG.emit('coop',{mode:'guest',host:P.name});
});
net.on('start',(m,P)=>{
 if(HG.coop.mode!=='guest')return;
 if(typeof m.clk==='number')G.clock=m.clk;
 HG.toast('Co-op oyununa katıldınız. Ev sahibi: '+P.name);
});
net.on('joined',(m)=>{HG.toast(m.name+' oyuna katıldı.');chatLine('',m.name+' oyuna katıldı.',true)});

let lostShown=false;
function hostLost(why){
 if(lostShown)return;lostShown=true;
 net.lostWhy=why||'';
 HG.emit('coop-lost',{why});
 setStatus('lost','Ev sahibi ile bağlantı koptu.');
}
net.leave=function(){
 const P=net.peers.slice();
 for(const p of P){tx(p.conn,{t:'bye'})}
 setTimeout(()=>{try{if(net.peer)net.peer.destroy()}catch(e){}},200);
 const wasGuest=HG.coop.mode==='guest';
 shutdown(false);
 if(wasGuest)location.reload();
};
/* Ev sahibi co-op'u kapatır: oyun tek kişilik olarak sürer */
function shutdown(soft){
 for(const p of net.peers){try{p.conn.close()}catch(e){}dropRemote(p)}
 net.peers.length=0;
 try{if(net.peer)net.peer.destroy()}catch(e){}
 net.peer=null;net.code='';net.hostP=null;
 HG.remote.length=0;
 net.role='solo';HG.coop.mode='solo';HG.coop.host=true;
 setStatus('idle','');
 HG.emit('coop',{mode:'solo'});
}
net.shutdown=shutdown;
net.dropPeer=dropPeer;

/* ============================================================ Ortak: ping, konum, saat, sohbet ============================================================ */
net.on('ping',(m,P)=>tx(P.conn,{t:'pong',ts:m.ts}));
net.on('pong',(m)=>{let d=now()-m.ts;if(d>=0&&d<10000){d=Math.min(d,1500);net.lat=net.lat?net.lat*.7+d*.3:d}});

const FL={MV:1,SP:2,SW:4,RF:8,SH:16,TL:32,SL:64,DD:128,BW:256,HD:512,AT:1024};
net.FL=FL;
function flagsNow(){
 let f=0;
 if(G.moving)f|=FL.MV;if(G.sprint)f|=FL.SP;if(G.swim)f|=FL.SW;if(G.onRaft)f|=FL.RF;if(G.sheltered)f|=FL.SH;if(G.torchLit)f|=FL.TL;
 if(ui.sleeping)f|=FL.SL;if(ui.state==='dead')f|=FL.DD;if(HG.bow&&HG.bow.on)f|=FL.BW;if(G.head)f|=FL.HD;
 if(HG.A&&HG.A.hitT>0)f|=FL.AT;
 return f;
}
function heldId(){const s=G.inv&&G.inv[G.sel];return s?s.id:''}
let posT=0,pingT=0,clkT=0,seq=0;
let lastSig='',lastTx=0;
function sendPos(){
 const m={t:'p',q:0,x:r2(G.px),z:r2(G.py),y:G.pz===undefined?null:r2(G.pz),yw:r3(look.yaw),pt:r3(look.pitch),f:flagsNow(),h:heldId(),hp:Math.max(0,Math.round(G.hp)),w:r2(G.walk||0),s:r2(G.spdNow||0)};
 const sig=m.x+'|'+m.z+'|'+m.y+'|'+m.yw+'|'+m.pt+'|'+m.f+'|'+m.h+'|'+m.hp+'|'+m.w+'|'+m.s;
 if(sig===lastSig&&now()-lastTx<600)return;          /* durağan oyuncu: yarım saniyede bir konum yeter (ağ trafiği azalır) */
 lastSig=sig;lastTx=now();m.q=++seq;
 net.send(m);
}
net.on('p',(m,P)=>{
 const r=P.rec;if(!r)return;
 if(!(m.x>=0&&m.x<HG.W&&m.z>=0&&m.z<HG.H&&isFinite(m.yw)&&isFinite(m.pt)))return;          /* bozuk veya harita dışı konum paketi yok sayılır */
 if(m.q<=(P.pq||0)&&m.q>(P.pq||0)-50)return;
 P.pq=m.q;
 r.x=m.x;r.z=m.z;r.y=m.y;r.yaw=m.yw;r.pitch=m.pt;r.fl=m.f|0;r.h=m.h||'';r.hp=m.hp;r.walk=m.w;r.spd=m.s;
 r.alive=!(r.fl&FL.DD);r.sh=!!(r.fl&FL.SH);r.tl=!!(r.fl&FL.TL);r.mv=!!(r.fl&FL.MV);r.seen=now();
 if(!r.init){r.init=true;r.rx=r.x;r.rz=r.z}
});
net.on('clk',(m)=>{
 if(HG.coop.mode!=='guest'||typeof m.c!=='number')return;
 const d=m.c+net.lat/2000-G.clock;
 if(Math.abs(d)>4)G.clock+=d;else G.clock+=d*.35;
});

/* Sohbet */
const CHAT=[];
net.chatLog=CHAT;
function chatLine(name,text,sys){
 const e={n:name,x:String(text).slice(0,200),sys:!!sys,t:Date.now()};
 CHAT.push(e);if(CHAT.length>60)CHAT.shift();
 HG.emit('chat',e);
}
net.chatLine=chatLine;
const outQ=[];
function chatCmd(t){
 const c=t.split(' ')[0].toLowerCase();
 if(c==='/yardim'||c==='/yardım'){chatLine('','Komutlar: /konum (konumunuzu gönderir) · /ping (gecikmeyi gösterir) · /yardim',true);return null}
 if(c==='/ping'){chatLine('','Gecikme: '+(net.lat?Math.round(net.lat)+' ms':'ölçülmedi'),true);return null}
 if(c==='/konum')return 'Konumum: '+Math.round(G.px)+', '+Math.round(G.py);
 chatLine('','Bilinmeyen komut. /yardim yazın.',true);return null;
}
net.chat=function(text){
 text=String(text||'').replace(/[\u0000-\u001f\u007f]/g,'').replace(/\s+/g,' ').trim().slice(0,200);
 if(!text||!HG.coopLive())return false;
 if(text[0]==='/'){text=chatCmd(text);if(!text)return true}
 {const t=now();while(outQ.length&&t-outQ[0]>4000)outQ.shift();if(outQ.length>=5){HG.toast('Çok hızlı yazıyorsunuz; biraz bekleyin.');return false}outQ.push(t)}
 chatLine(net.name,text,false);
 net.send({t:'chat',x:text});
 return true;
};
net.on('chat',(m,P)=>{
 const t=now();P.cq=(P.cq||[]).filter(q=>t-q<5000);
 if(P.cq.length>=6||typeof m.x!=='string')return;          /* sohbet taşkınlığı ve bozuk ileti engellenir */
 P.cq.push(t);
 const x=m.x.replace(/[\u0000-\u001f\u007f]/g,'').replace(/\s+/g,' ').trim().slice(0,200);
 if(!x)return;
 chatLine(P.name||'Oyuncu',x,false);
 try{HG.snd('ui')}catch(e){}
});

/* ============================================================ Kare güncellemesi ============================================================ */
net.pump=function(dt){
 if(net.role==='solo')return;
 const t=now();
 /* zaman aşımı */
 for(const P of net.peers.slice()){
  const lim=P.state==='play'?TIMEOUT:TIMEOUT_LOAD;
  if(t-P.last>lim)dropPeer(P,'zaman aşımı');
 }
 if(!net.peers.some(P=>P.ready))return;
 posT-=dt;if(posT<=0){posT=1/POSHZ;sendPos()}
 pingT-=dt;if(pingT<=0){pingT=2.5;net.send({t:'ping',ts:t})}
 if(net.role==='host'){clkT-=dt;if(clkT<=0){clkT=1;net.send({t:'clk',c:G.clock})}}
 for(const f of net.ticks){try{f(dt,t)}catch(e){console.error('ağ tick',e)}}
};
{
 const u0=HG.update;
 HG.update=function(dt){
  u0.call(this,dt);
  net.pump(dt);
 };
}
addEventListener('beforeunload',()=>{for(const P of net.peers)tx(P.conn,{t:'bye'})});
})();
