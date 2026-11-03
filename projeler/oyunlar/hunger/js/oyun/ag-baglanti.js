/* Hunger 3D - co-op bağlantı katmanı (güncelleme 65).
   Farklı ağlardaki iki bilgisayar neden bağlanamıyordu: WebRTC, iki taraf da ev ağının arkasındayken
   doğrudan yol bulamaz. Aynı ağda yerel adresler yettiği için bağlantı kuruluyor, farklı ağlarda ise
   dışarıdan görünen adresi öğrenmek (STUN) ve gerekirse veriyi bir aktarma sunucusundan geçirmek (TURN)
   gerekir. Oyun şimdiye kadar yalnızca PeerJS'in kendi varsayılan sunucularını kullanıyordu; bunlar
   tek bir UDP kapısından (3478) çalıştığı için çoğu ev ve mobil ağında işe yaramıyordu.

   Bu dosya:
   - geniş bir STUN listesi ve birden çok kapı/aktarım (UDP 80/443, TCP 443) kullanan TURN listesi kurar,
   - oyuncunun kendi TURN sunucusunu (veya erişim bilgisi veren bir adresi) girmesine izin verir,
   - "Bağlantıyı sına" ile ağın hangi aşamada takıldığını Türkçe anlatır,
   - bağlantı kurulduktan sonra yolun doğrudan mı yoksa aktarmalı mı olduğunu bildirir.
   Özgün ağ dosyalarına dokunmaz; yalnızca HG.net.cfg alanlarını doldurur. */
(()=>{
'use strict';
const net=HG.net;
if(!net)return;
const KEY='hunger-coop-ag';

/* ---------------------------------------------------------- Varsayılan sunucular ----------------------------------------------------------
   STUN: dışarıdan görünen adresi öğretir, bedava ve hafiftir; birkaç tane verilir, biri yanıt vermezse öbürü çalışır.
   TURN: iki taraf da birbirine ulaşamazsa veriyi üstünden geçirir. Buradaki genel sunucular herkese açık
   olduğundan yoğun saatlerde yanıt vermeyebilir; kalıcı çözüm için oyuncu kendi TURN bilgisini girebilir. */
const STUN=[
 'stun:stun.l.google.com:19302',
 'stun:stun1.l.google.com:19302',
 'stun:stun2.l.google.com:19302',
 'stun:stun.cloudflare.com:3478',
 'stun:stun.nextcloud.com:443'
];
const TURN=[
 {urls:['turn:eu-0.turn.peerjs.com:3478','turn:us-0.turn.peerjs.com:3478'],username:'peerjs',credential:'peerjsp'},
 {urls:['turn:openrelay.metered.ca:80','turn:openrelay.metered.ca:443','turn:openrelay.metered.ca:443?transport=tcp'],username:'openrelayproject',credential:'openrelayproject'}
];

/* ---------------------------------------------------------- Oyuncunun ayarları ---------------------------------------------------------- */
const DEF={turn:'',user:'',pass:'',relay:false,srv:''};
let cfg=Object.assign({},DEF);
try{
 const s=JSON.parse(localStorage.getItem(KEY)||'null');
 if(s&&typeof s==='object')for(const k in DEF)if(typeof s[k]===typeof DEF[k])cfg[k]=s[k];
}catch(e){}
const store=()=>{try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){}};
const trim=s=>String(s||'').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,300);

/* Aracı (PeerJS) sunucusu: boşsa genel PeerJS bulutu kullanılır. "sunucu:kapı" biçiminde yazılır. */
function parseSrv(t){
 t=trim(t);if(!t)return null;
 const m=/^([a-z0-9.-]+)(?::(\d{2,5}))?(\/.*)?$/i.exec(t.replace(/^https?:\/\//i,''));
 if(!m)return null;
 return {host:m[1],port:m[2]?+m[2]:443,path:m[3]||'/',secure:true};
}

/* ---------------------------------------------------------- ICE listesi ---------------------------------------------------------- */
let cache=null,cacheT=0;
/* Oyuncunun girdiği TURN: ya doğrudan turn: adresi, ya da erişim bilgilerini JSON olarak veren bir https adresi */
async function userIce(){
 const t=trim(cfg.turn);
 if(!t)return [];
 if(/^https:\/\//i.test(t)){
  try{
   const r=await fetch(t,{cache:'no-store'});
   const j=await r.json();
   const L=Array.isArray(j)?j:(j&&Array.isArray(j.iceServers)?j.iceServers:null);
   if(!L)throw new Error('biçim');
   return L.filter(s=>s&&(s.urls||s.url)).slice(0,12);
  }catch(e){
   net.iceWarn='Kendi TURN adresinizden bilgi alınamadı ('+(e&&e.message||e)+'); genel sunucular kullanılıyor.';
   return [];
  }
 }
 const urls=t.split(/[\s,]+/).filter(u=>/^turns?:/i.test(u)).slice(0,6);
 if(!urls.length)return [];
 const o={urls};
 if(cfg.user)o.username=cfg.user;
 if(cfg.pass)o.credential=cfg.pass;
 return [o];
}
async function iceList(){
 const t=Date.now();
 if(cache&&t-cacheT<600000)return cache;
 net.iceWarn='';
 const mine=await userIce();
 const list=mine.concat([{urls:STUN}],TURN);
 cache=list;cacheT=t;
 return list;
}
/* Bağlantıdan hemen önce çağrılır: ag.js içindeki mkPeer bu alanları okur */
net.prepare=async function(){
 try{
  net.cfg.ice=await iceList();
  net.cfg.relayOnly=!!cfg.relay;
  net.cfg.server=parseSrv(cfg.srv);
 }catch(e){net.cfg.ice=[{urls:STUN}].concat(TURN)}
 return true;
};

/* ---------------------------------------------------------- Bağlantı sınaması ----------------------------------------------------------
   Üç aşama ölçülür: yerel aday (her zaman olmalı), dışarıdan görünen adres (STUN) ve aktarma (TURN).
   Ayrıca aracı sunucuya ulaşılıp ulaşılmadığına bakılır. Sonuç Türkçe cümlelerle döner. */
function gatherTest(ice,only){
 return new Promise(resolve=>{
  const out={host:false,srflx:false,relay:false,err:''};
  let pc;
  try{
   const o={iceServers:ice};
   if(only)o.iceTransportPolicy='relay';
   pc=new RTCPeerConnection(o);
  }catch(e){out.err=String(e&&e.message||e);resolve(out);return}
  let done=false;
  const fin=()=>{if(done)return;done=true;try{pc.close()}catch(e){}resolve(out)};
  const to=setTimeout(fin,9000);
  pc.onicecandidate=e=>{
   if(!e.candidate){clearTimeout(to);fin();return}
   const c=String(e.candidate.candidate||'');
   if(/ typ host/.test(c))out.host=true;
   else if(/ typ srflx/.test(c))out.srflx=true;
   else if(/ typ relay/.test(c))out.relay=true;
   if(out.relay&&out.srflx&&out.host){clearTimeout(to);fin()}
  };
  try{
   pc.createDataChannel('t');
   pc.createOffer().then(d=>pc.setLocalDescription(d)).catch(e=>{out.err=String(e&&e.message||e);clearTimeout(to);fin()});
  }catch(e){out.err=String(e&&e.message||e);clearTimeout(to);fin()}
 });
}
/* Aracı sunucu (kod alışverişi) ulaşılabiliyor mu */
function brokerTest(){
 return new Promise(resolve=>{
  if(typeof Peer==='undefined'){resolve({ok:false,err:'Ağ kütüphanesi yüklenemedi.'});return}
  let p,done=false;
  const fin=r=>{if(done)return;done=true;try{p&&p.destroy()}catch(e){}resolve(r)};
  const to=setTimeout(()=>fin({ok:false,err:'yanıt yok'}),12000);
  try{
   const o={debug:0},sv=parseSrv(cfg.srv);
   if(sv)Object.assign(o,sv);
   p=new Peer(o);
  }catch(e){clearTimeout(to);fin({ok:false,err:String(e&&e.message||e)});return}
  p.on('open',()=>{clearTimeout(to);fin({ok:true})});
  p.on('error',e=>{clearTimeout(to);fin({ok:false,err:(e&&e.type)||'hata'})});
 });
}
HG.netTest=async function(log){
 const say=m=>{try{log&&log(m)}catch(e){}};
 say('Sunucuya ulaşılıyor…');
 const ice=await iceList();
 const br=await brokerTest();
 say(br.ok?'Aracı sunucu: ulaşıldı.':'Aracı sunucu: ulaşılamadı.');
 say('Ağ yolları deneniyor…');
 const g=await gatherTest(ice,false);
 const r={broker:br.ok,host:g.host,srflx:g.srflx,relay:g.relay,err:g.err||br.err||'',ice:ice.length};
 /* Sonucun anlamı */
 const L=[];
 L.push(br.ok?'✓ Aracı sunucuya ulaşıldı (kod alışverişi çalışıyor).':'✗ Aracı sunucuya ulaşılamadı: internet bağlantınızı veya güvenlik duvarını denetleyin.');
 L.push(g.host?'✓ Yerel ağ adresi bulundu (aynı ağdaki bilgisayarlarla bağlanabilirsiniz).':'✗ Yerel ağ adresi bulunamadı: tarayıcı WebRTC\'yi engelliyor olabilir.');
 L.push(g.srflx?'✓ Dışarıdan görünen adres öğrenildi (farklı ağdan bağlantı denenebilir).':'✗ Dışarıdan görünen adres öğrenilemedi: ağınız STUN\'u engelliyor, farklı ağdaki biriyle oynamak için aktarma sunucusu şart.');
 L.push(g.relay?'✓ Aktarma sunucusu çalışıyor (her ağdan bağlanılabilir).':'✗ Aktarma sunucusu yanıt vermedi: internet sağlayıcınız bağlantıyı gizliyorsa (operatör ağı, mobil internet) bağlanamayabilirsiniz. Aşağıdan kendi TURN bilgilerinizi girin.');
 r.satir=L;
 r.ozet=!br.ok?'Aracı sunucuya ulaşılamıyor.':g.relay?'Her ağdan bağlanabilirsiniz.':g.srflx?'Çoğu ağdan bağlanabilirsiniz; bazı ağlarda aktarma sunucusu gerekir.':'Yalnızca aynı ağdaki bilgisayarlarla bağlanabilirsiniz.';
 net.testSon=r;
 return r;
};

/* ---------------------------------------------------------- Kurulan bağlantının türü ----------------------------------------------------------
   Bağlantı kurulduktan sonra hangi yolun kullanıldığı okunur: doğrudan mı, aktarma sunucusu üzerinden mi. */
async function pairType(conn){
 try{
  const pc=conn&&conn.peerConnection;
  if(!pc||!pc.getStats)return '';
  const s=await pc.getStats();
  let pair=null;const cand={};
  s.forEach(v=>{
   if(v.type==='candidate-pair'&&(v.state==='succeeded'||v.nominated))pair=v;
   if(v.type==='local-candidate'||v.type==='remote-candidate')cand[v.id]=v;
  });
  if(!pair)return '';
  const a=cand[pair.localCandidateId],b=cand[pair.remoteCandidateId];
  const ta=a&&a.candidateType,tb=b&&b.candidateType;
  if(ta==='relay'||tb==='relay')return 'aktarmalı';
  if(ta==='host'&&tb==='host')return 'yerel ağ';
  return 'doğrudan';
 }catch(e){return ''}
}
net.pairType=pairType;
/* Oyuncu kaydına bağlantı türünü yazar (arayüzde görünür) */
net.probeType=P=>{
 if(!P||!P.conn)return;
 setTimeout(()=>{pairType(P.conn).then(t=>{if(t)P.yol=t})},1200);
};

/* ---------------------------------------------------------- Ayar arayüzü için ---------------------------------------------------------- */
net.agCfg={
 get:()=>Object.assign({},cfg),
 set:o=>{
  if(!o||typeof o!=='object')return;
  if('turn' in o)cfg.turn=trim(o.turn);
  if('user' in o)cfg.user=trim(o.user).slice(0,64);
  if('pass' in o)cfg.pass=trim(o.pass).slice(0,128);
  if('srv' in o)cfg.srv=trim(o.srv);
  if('relay' in o)cfg.relay=!!o.relay;
  cache=null;store();
 },
 sifirla:()=>{cfg=Object.assign({},DEF);cache=null;store()},
 varsayilanStun:STUN.slice()
};
})();
