/* Hunger 3D - tuş atamaları: her eylem için iki tuş, kullanıcı tarafından değiştirilebilir, tarayıcıda saklanır */
(()=>{
'use strict';
const KEY='hunger-tuslar';
/* eylem: [ad, birinci tuş, ikinci tuş] */
const ACTS=[
 ['fwd','İleri','KeyW','ArrowUp'],['back','Geri','KeyS','ArrowDown'],['left','Sola','KeyA','ArrowLeft'],['right','Sağa','KeyD','ArrowRight'],
 ['sprint','Koş','ShiftLeft','ShiftRight'],['jump','Zıpla / yüzerken yüzeye çık','Space',''],['dive','Suya dal (yüzerken)','KeyX',''],
 ['use','Kullan / al / konuş','KeyE',''],['place','Yapıyı yerleştir','KeyF',''],
 ['inv','Envanter','KeyI','Tab'],['craft','Üretim','KeyC',''],['map','Harita','KeyM',''],['jr','Günlük','KeyK',''],
 ['guide','Rehber','KeyH',''],['mute','Sesi aç/kapat','KeyN',''],['qsave','Hızlı kaydet','F5',''],
 ['drop','Seçili eşyadan 1 adet at','KeyQ',''],['sort','Çantayı düzenle','KeyR','']
];
const DEF={};for(const [k,,a,b] of ACTS)DEF[k]=[a,b];
const bind=HG.bind={};
const reset=()=>{for(const k in DEF)bind[k]=DEF[k].slice()};
reset();
try{
 const s=JSON.parse(localStorage.getItem(KEY)||'null');
 if(s&&typeof s==='object')for(const k in DEF)if(Array.isArray(s[k])&&s[k].length===2&&s[k].every(x=>typeof x==='string'))bind[k]=s[k].slice();
}catch(e){}
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(bind))}catch(e){}};
/* sorgular */
const keyDown=a=>{const b=bind[a],k=HG.inp.keys;return !!((b[0]&&k[b[0]])||(b[1]&&k[b[1]]))};
const keyIs=(a,code)=>{const b=bind[a];return !!code&&(b[0]===code||b[1]===code)};
/* tuşun okunur adı */
const NAMES={Space:'Boşluk',ShiftLeft:'Sol Shift',ShiftRight:'Sağ Shift',ControlLeft:'Sol Ctrl',ControlRight:'Sağ Ctrl',AltLeft:'Sol Alt',AltRight:'Sağ Alt',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',Tab:'Tab',Enter:'Enter',Backquote:'`',Minus:'-',Equal:'=',BracketLeft:'[',BracketRight:']',Semicolon:';',Quote:"'",Comma:',',Period:'.',Slash:'/',Backslash:'\\',CapsLock:'Caps Lock'};
function label(code){
 if(!code)return '—';
 if(NAMES[code])return NAMES[code];
 if(code.startsWith('Key'))return code.slice(3);
 if(code.startsWith('Digit'))return code.slice(5);
 if(code.startsWith('Numpad'))return 'Num '+code.slice(6);
 return code;
}
const RESERVED=new Set(['Escape','Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','MetaLeft','MetaRight','ContextMenu']);
let capture=null;
function assign(a,slot,code){
 /* aynı tuş başka eylemde kullanılıyorsa oradan kaldırılır */
 for(const k in bind)for(let i=0;i<2;i++)if(bind[k][i]===code&&!(k===a&&i===slot))bind[k][i]='';
 bind[a][slot]=code;
 /* birinci tuş boşsa ikinci tuş öne alınır */
 for(const k in bind)if(!bind[k][0]&&bind[k][1]){bind[k][0]=bind[k][1];bind[k][1]=''}
 persist();
}
function keyUI(body){
 const wrap=document.createElement('div');wrap.className='kb';
 const draw=()=>{
  wrap.innerHTML='<h3>Tuş atamaları</h3><p class="kh">Bir kutuya tıklayıp yeni tuşa basın. Esc: vazgeç, Delete: boşalt. Aynı tuş başka eylemde varsa oradan alınır.</p>';
  for(const [k,name] of ACTS.map(a=>[a[0],a[1]])){
   const r=document.createElement('div');r.className='kr';
   const l=document.createElement('span');l.textContent=name;r.appendChild(l);
   for(let i=0;i<2;i++){
    const b=document.createElement('button');b.type='button';b.className='kk ghost'+(capture&&capture.a===k&&capture.i===i?' wait':'');
    b.textContent=capture&&capture.a===k&&capture.i===i?'Tuşa bas…':label(bind[k][i]);
    b.onclick=()=>{capture={a:k,i,draw};draw()};
    r.appendChild(b);
   }
   wrap.appendChild(r);
  }
  const f=document.createElement('div');f.className='kf';
  const rb=document.createElement('button');rb.type='button';rb.className='ghost';rb.textContent='Tuşları varsayılana döndür';
  rb.onclick=()=>{reset();persist();capture=null;draw()};f.appendChild(rb);wrap.appendChild(f);
  const fx=document.createElement('div');fx.className='kfix';
  fx.innerHTML='<h3>Sabit kontroller</h3><div class="keys"><kbd>Sol tık</kbd><span>Kes, topla, kaz, vur; yayı ger (basılı tut)</span><kbd>Sağ tık</kbd><span>Eşyayı kullan, yerdekini al</span><kbd>1 - 8</kbd><span>Hızlı erişim kutuları</span><kbd>Tekerlek</kbd><span>Eşya seç</span><kbd>Fare</kbd><span>Etrafa bak (oyuna tıklayınca fare kilitlenir)</span><kbd>Esc</kbd><span>Pencereyi kapat / duraklat</span></div>';
  wrap.appendChild(fx);
 };
 draw();body.appendChild(wrap);
}
/* tuş yakalama: ayar penceresi açıkken, diğer tüm tuş işleyicilerinden önce */
addEventListener('keydown',e=>{
 if(!capture)return;
 e.preventDefault();e.stopImmediatePropagation();
 const c=capture;
 if(e.code==='Escape'){capture=null;c.draw();return}
 if(e.code==='Delete'||e.code==='Backspace'){bind[c.a][c.i]='';if(!bind[c.a][0]&&bind[c.a][1]){bind[c.a][0]=bind[c.a][1];bind[c.a][1]=''}persist();capture=null;c.draw();return}
 if(RESERVED.has(e.code)){HG.toast&&HG.toast('Bu tuş atanamaz.');return}
 assign(c.a,c.i,e.code);capture=null;c.draw();
},true);
Object.assign(HG,{keyDown,keyIs,keyLabel:label,keyUI,keyCapturing:()=>!!capture});
})();
