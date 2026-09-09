/* Malttrix V11 — authored prismatic sculpture, shared WebGL / SVG geometry. */
function makeMalttrixBird(T) {
 const bird=new T.Group(), feathers=[];
 const cool=['#183e82','#3559c7','#35b7c4','#69a982'];
 const warm=['#7656c8','#d75e9a','#e86d60','#d5a447'];
 const material=new T.MeshPhysicalMaterial({vertexColors:true,metalness:.24,roughness:.32,clearcoat:.7,clearcoatRoughness:.25,flatShading:true});
 function mesh(vertices,colors,parent=bird){
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();const m=new T.Mesh(g,material);parent.add(m);return m;
 }
 function leaf(root,tip,width,color,parent=bird){
  const r=new T.Vector3(...root),end=new T.Vector3(...tip),d=end.clone().sub(r);
  const cross=new T.Vector3(-d.y,d.x,0).normalize(), vertices=[],colors=[];
  const base=new T.Color(color),ice=new T.Color('#e5eff0');
  const points=[];
  for(let i=0;i<=5;i++){
   const t=i/5, center=r.clone().addScaledVector(d,t);center.z+=Math.sin(t*Math.PI)*.10;
   const w=Math.pow(Math.sin(t*Math.PI),.85)*width;
   points.push([center.clone().addScaledVector(cross,-w*.46),center.clone().add(new T.Vector3(0,0,w*.36)),center.clone().addScaledVector(cross,w*.54)]);
  }
  for(let i=0;i<5;i++)for(let side=0;side<2;side++){
   const a=points[i][side],b=points[i+1][side],c=points[i+1][side+1],d=points[i][side+1];
   const col=base.clone().lerp(ice,(side===0?.10:.33)+i*.035);
   for(const p of [a,b,c,a,c,d]){vertices.push(...p.toArray());colors.push(...col.toArray());}
  }
  const m=mesh(vertices,colors,parent);m.material=material.clone();m.material.side=T.DoubleSide;
  feathers.push({mesh:m,base:m.rotation.clone()});return m;
 }
 const back=new T.Group();bird.add(back);
 for(let i=0;i<8;i++)leaf([-.48,.13,-.16],[-.58-i*.19,2.38-i*.125,-.42-i*.012],.23,cool[i%4],back);
 // A single tapered curved body connects throat and tail; no stacked polyhedra.
 const centers=[[-.83,-.74,.015,.045],[-.67,-.53,.01,.17],[-.43,-.22,0,.255],[-.16,.06,0,.275],[.10,.32,0,.23],[.28,.43,0,.19],[.42,.57,0,.185],[.58,.66,0,.205],[.74,.64,0,.14],[.83,.59,0,.045]];
 const rings=centers.map(([x,y,z,r])=>Array.from({length:16},(_,j)=>{const a=j/16*Math.PI*2;return new T.Vector3(x-Math.cos(a)*r*.66,y+Math.cos(a)*r*.66,z+Math.sin(a)*r*.82);}));
 const vertices=[],colors=[];
 for(let i=0;i<rings.length-1;i++)for(let j=0;j<16;j++){
  const k=(j+1)%16,col=new T.Color(cool[Math.min(3,Math.floor(j/4))]);
  if(i<3)col.lerp(new T.Color('#7656c8'),.35);if(i>5)col.lerp(new T.Color('#35b7c4'),.3);
  col.multiplyScalar(.87+(j%4)*.07);
  for(const p of [rings[i][j],rings[i+1][k],rings[i+1][j],rings[i][j],rings[i][k],rings[i+1][k]]){vertices.push(...p.toArray());colors.push(...col.toArray());}
 }
 mesh(vertices,colors);
 const front=new T.Group();bird.add(front);
 const tips=[[-2.48,2.16],[-2.43,1.84],[-2.27,1.49],[-2.04,1.13],[-1.83,.83],[-1.59,.56],[-1.36,.31],[-1.13,.09]];
 tips.forEach(([x,y],i)=>leaf([-.45+i*.018,.13-i*.025,.16],[x,y,.21+i*.018],.32-i*.013,i<4?warm[3-i]:cool[7-i],front));
 for(let i=0;i<4;i++)leaf([-.27,.18,.27],[-1.36+i*.16,1.01-i*.25,.31],.20,cool[(i+1)%4],front);
 for(let i=0;i<5;i++)leaf([-.63,-.53,-.03],[-1.72+i*.18,-1.15-i*.14,-.08+i*.065],.18,i%2?warm[0]:cool[i%4]);
 const beakMat=new T.MeshStandardMaterial({color:'#182334',metalness:.35,roughness:.3});
 const beak=new T.Mesh(new T.ConeGeometry(.036,.99,10),beakMat);beak.position.set(1.24,.73,0);beak.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(1,.18,0).normalize());bird.add(beak);
 for(const side of [-1,1]){
  const eye=new T.Mesh(new T.SphereGeometry(.027,12,8),new T.MeshStandardMaterial({color:'#081522',roughness:.14}));eye.position.set(.64,.69,side*.152);bird.add(eye);
  const glint=new T.Mesh(new T.SphereGeometry(.007,6,4),new T.MeshBasicMaterial({color:'#ffffff'}));glint.position.set(.647,.699,side*.176);bird.add(glint);
 }
 return {bird,front,back,feathers,material};
}
function malttrixPoster(T,bird,camera){
 bird.updateMatrixWorld(true);camera.updateMatrixWorld(true);const polygons=[];
 bird.traverse(m=>{if(!m.isMesh)return;const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry,p=g.getAttribute('position'),colors=g.getAttribute('color');
 for(let i=0;i<p.count;i+=3){const pts=[],depth=[];for(let j=0;j<3;j++){const v=new T.Vector3().fromBufferAttribute(p,i+j).applyMatrix4(m.matrixWorld).project(camera);pts.push([(v.x+1)*450,(1-v.y)*450]);depth.push(v.z);}
 const col=colors?new T.Color().fromBufferAttribute(colors,i):m.material.color.clone();
 polygons.push({depth:depth.reduce((a,b)=>a+b,0)/3,markup:`<polygon points="${pts.map(p=>p.map(n=>n.toFixed(2)).join(',')).join(' ')}" fill="#${col.getHexString()}" stroke="#${col.getHexString()}" stroke-width=".4"/>`});}
 if(g!==m.geometry)g.dispose();});
 polygons.sort((a,b)=>b.depth-a.depth);return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900" role="img" aria-label="Malttrix prismatic hummingbird sculpture">${polygons.map(p=>p.markup).join('')}</svg>`;
}
(() => {
 if(typeof document==='undefined'||!window.THREE)return;
 const T=window.THREE,host=document.getElementById('sculpture'),canvas=document.getElementById('sculptureCanvas');if(!host||!canvas)return;
 const scene=new T.Scene(),{bird,front,back,feathers,material}=makeMalttrixBird(T);scene.add(bird);
 const camera=new T.PerspectiveCamera(32,1,.1,50);camera.position.set(.3,.65,9);camera.lookAt(-.4,.35,0);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:930px)'),button=document.getElementById('motionToggle');
 let renderer=null,progress=0,paused=false,visible=true,raf=0,last=0,time=0,trigger=null,px=0,py=0,tx=0,ty=0;
 const clamp=v=>Math.max(0,Math.min(1,v));
 try{renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,mobile.matches?1.25:1.6));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;}catch(e){host.dataset.render='fallback';}
 const hemi=new T.HemisphereLight('#fff9f0','#48536e',2.5);scene.add(hemi);
 const key=new T.DirectionalLight('#fff5e6',3.2);key.position.set(-3,4,5);scene.add(key);
 const rim=new T.DirectionalLight('#b9e4ed',2);rim.position.set(3,2,-3);scene.add(rim);
 const fill=new T.DirectionalLight('#e9d3ee',.8);fill.position.set(-2,-1,2);scene.add(fill);
 function pose(){const moving=!paused&&!reduced.matches,fly=clamp((progress-.82)/.18);bird.position.y=fly*.24+(moving?Math.sin(time*.9)*.025:0);bird.rotation.y=.10+Math.sin(progress*Math.PI)*.16+px*.10;bird.rotation.z=fly*.018;front.rotation.y=-.04+(moving?Math.sin(time*1.25)*.028:0);back.rotation.y=.08-(moving?Math.sin(time*1.25)*.025:0);camera.position.x=.3+progress*.35;camera.position.y=.65+py*.06;camera.lookAt(-.4,.35,0);material.roughness=.32-Math.sin(progress*Math.PI)*.05;key.position.x=-3+progress*3;
 document.querySelectorAll('[data-phase]').forEach((el,i)=>el.classList.toggle('active',i===Math.min(4,Math.floor(progress*5))));}
 function draw(){pose();if(renderer){renderer.render(scene,camera);host.classList.add('webgl-ready');host.dataset.render='webgl';}}
 function stop(){cancelAnimationFrame(raf);raf=0;last=0;}
 function frame(now){raf=0;if(!visible||document.hidden||paused||reduced.matches||!renderer)return;time+=last?Math.min((now-last)/1000,.05):0;last=now;px+=(tx-px)*.05;py+=(ty-py)*.05;draw();raf=requestAnimationFrame(frame);}
 function start(){if(!raf&&visible&&!document.hidden&&!paused&&!reduced.matches&&renderer)raf=requestAnimationFrame(frame);}
 function resize(){const r=host.getBoundingClientRect();if(!r.width||!r.height)return;camera.aspect=r.width/r.height;camera.position.z=Math.max(8.4,8.1/camera.aspect);camera.updateProjectionMatrix();if(renderer)renderer.setSize(r.width,r.height,false);draw();}
 function scroll(){if(trigger){trigger.kill(true);trigger=null;}progress=0;if(window.gsap&&window.ScrollTrigger&&!reduced.matches&&!paused&&renderer){const state={p:0};window.gsap.registerPlugin(window.ScrollTrigger);trigger=window.gsap.to(state,{p:1,ease:'none',onUpdate:()=>{progress=state.p;if(!raf)draw();},scrollTrigger:{trigger:'#top',start:'top top',end:'bottom top',scrub:.7}}).scrollTrigger;}resize();}
 function buttonState(){document.documentElement.classList.toggle('motion-paused',paused||reduced.matches);if(button){button.hidden=false;button.disabled=reduced.matches;button.setAttribute('aria-pressed',String(paused||reduced.matches));button.textContent=document.documentElement.lang==='zh-CN'?(paused||reduced.matches?'动态已暂停':'暂停动态'):(paused||reduced.matches?'Motion paused':'Pause motion');}document.dispatchEvent(new CustomEvent('malttrix:motion',{detail:{paused:paused||reduced.matches}}));}
 if(button)button.addEventListener('click',()=>{paused=!paused;stop();scroll();buttonState();start();});
 reduced.addEventListener('change',()=>{stop();scroll();buttonState();start();});document.addEventListener('malttrix:language',buttonState);
 host.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const r=host.getBoundingClientRect();tx=(e.clientX-r.left)/r.width-.5;ty=(e.clientY-r.top)/r.height-.5;});host.addEventListener('pointerleave',()=>{tx=ty=0;});
 new ResizeObserver(resize).observe(host);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else stop();},{rootMargin:'80px'}).observe(host);
 document.addEventListener('visibilitychange',()=>document.hidden?stop():start());window.addEventListener('pagehide',stop);window.addEventListener('pageshow',start);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stop();renderer=null;host.classList.remove('webgl-ready');host.dataset.render='fallback';if(trigger){trigger.kill(true);trigger=null;}});
 scroll();buttonState();start();window.malttrixSceneInfo=Object.freeze({version:11,feathers:feathers.length,renderer:renderer?'WebGL':'SVG fallback'});
})();
