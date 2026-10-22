/* 3D kasa */
(()=>{if(!window.THREE)return;const T=THREE,cv=$('#c');
let r;try{r=new T.WebGLRenderer({canvas:cv,alpha:true,antialias:true})}catch(e){return}
r.setPixelRatio(Math.min(devicePixelRatio,2));
const sc=new T.Scene(),cam=new T.PerspectiveCamera(45,1,.1,100);
sc.add(new T.AmbientLight(0xffffff,.55));
const l1=new T.PointLight(0xf2b441,2.4,40);l1.position.set(5,4,6);
const l2=new T.PointLight(0x5ad1ff,2,40);l2.position.set(-6,-3,5);sc.add(l1,l2);
const V=new T.Group();sc.add(V);

const body=new T.Mesh(new T.BoxGeometry(2.6,2,1),new T.MeshStandardMaterial({color:0x2d3436,metalness:.7,roughness:.32}));
body.add(new T.LineSegments(new T.EdgesGeometry(body.geometry),new T.LineBasicMaterial({color:0x5ad1ff})));
const dk=new T.MeshBasicMaterial({color:0x06090b}),k1=new T.Mesh(new T.CircleGeometry(.22,32),dk),k2=new T.Mesh(new T.PlaneGeometry(.12,.45),dk);
k1.position.set(0,.15,.505);k2.position.set(0,-.2,.505);body.add(k1,k2);V.add(body);

const brass=new T.MeshStandardMaterial({color:0xf2b441,metalness:.9,roughness:.22,emissive:0x3a2606});
const sh=new T.Group();sh.position.set(.85,1,0);V.add(sh);
const arc=new T.Mesh(new T.TorusGeometry(.85,.17,16,48,Math.PI),brass);arc.position.x=-.85;
const lg=new T.CylinderGeometry(.17,.17,.4,16),a=new T.Mesh(lg,brass),b=new T.Mesh(lg,brass);
a.position.set(-1.7,-.2,0);b.position.set(0,-.2,0);sh.add(arc,a,b);

const rings=[1,2,3].map(i=>{const m=new T.Mesh(new T.TorusGeometry(2.6+i*.55,.012,8,120),new T.MeshBasicMaterial({color:i%2?0xf2b441:0x5ad1ff,transparent:true,opacity:.75}));m.rotation.set(i*1.1,i*.7,0);V.add(m);return m});
V.add(new T.Mesh(new T.IcosahedronGeometry(3.5,1),new T.MeshBasicMaterial({color:0x5ad1ff,wireframe:true,transparent:true,opacity:.12})));

const N=1800,pa=new Float32Array(N*3);
for(let i=0;i<N;i++){const R=4+Math.random()*6,u=Math.random()*6.283,v=Math.acos(2*Math.random()-1);pa.set([R*Math.sin(v)*Math.cos(u),R*Math.sin(v)*Math.sin(u),R*Math.cos(v)],i*3)}
const pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(pa,3));
const pts=new T.Points(pg,new T.PointsMaterial({color:0x5ad1ff,size:.045,transparent:true,opacity:.8}));sc.add(pts);

const rs=()=>{r.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()};rs();addEventListener('resize',rs);
let mx=0,my=0,sp=0;addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
const clk=new T.Clock();
(function loop(){requestAnimationFrame(loop);
const t=rm?0:clk.getElapsedTime(),w=innerWidth>860,
tp=scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight);sp+=(tp-sp)*.06;
const o=Math.sin(sp*Math.PI)**2;
V.position.x+=((w?Math.cos(sp*Math.PI*3)*2.4:0)-V.position.x)*.05;
V.position.y=(w?0:1.7)+Math.sin(t*1.2)*.12;V.scale.setScalar(w?1:.68);
V.rotation.y+=((sp*Math.PI*4+mx*1.2)-V.rotation.y)*.05;
V.rotation.x+=(my*.5-V.rotation.x)*.05;
sh.rotation.y=o*2.3;sh.position.y=1+o*.35;
rings.forEach((m,i)=>{m.rotation.z=t*(.2+i*.12);m.scale.setScalar(1+o*.25)});
pts.rotation.y=t*.03+sp;cam.position.z=9-o*1.6;l1.intensity=2.4+o*2;
r.render(sc,cam)})()})();
