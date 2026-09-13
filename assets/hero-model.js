/* V12. Loads only the simple, single-mesh GLBs produced by prepare-hummingbird.py.
   Static sculpture: object/camera motion, not a fabricated skeletal wingbeat. */
(()=>{
 'use strict';
 const T=window.THREE,host=document.getElementById('sculpture'),canvas=document.getElementById('sculptureCanvas');
 if(!T||!host||!canvas)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:930px)'),button=document.getElementById('motionToggle');
 const scene=new T.Scene(),bird=new T.Group();scene.add(bird);
 const camera=new T.PerspectiveCamera(32,1,.1,30);camera.position.set(0,.08,4.6);camera.lookAt(0,0,0);
 let renderer,material=null,loaded=false,lost=false,visible=true,paused=false,raf=0,last=0,time=0,progress=0,px=0,py=0,tx=0,ty=0;
 const clamp=v=>Math.max(0,Math.min(1,v));
 const ease=v=>v*v*(3-2*v);
 try{renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,mobile.matches?1.25:1.6));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;}catch{host.dataset.render='fallback';}
 scene.add(new T.HemisphereLight('#fff9ef','#56617f',1.8));
 const key=new T.DirectionalLight('#fff6e9',2.5);key.position.set(-2,3,4);scene.add(key);
 const rim=new T.DirectionalLight('#bfdff2',2.2);rim.position.set(2,1,-2);scene.add(rim);
 const fill=new T.DirectionalLight('#e0d8f4',.8);fill.position.set(-2,-1,2);scene.add(fill);
 // This is intentionally a restricted reader, not a general glTF loader.
 function geometry(buffer){
  const view=new DataView(buffer);if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2)throw Error('Invalid GLB');
  const length=view.getUint32(12,true),json=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,20,length))),bin=28+length;
  const primitive=json.meshes[0].primitives[0],g=new T.BufferGeometry();
  function attribute(index){const a=json.accessors[index],b=json.bufferViews[a.bufferView],size={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type],Ctor={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType];if(!Ctor||b.byteStride||a.sparse)throw Error('Unsupported optimized asset');return new T.BufferAttribute(new Ctor(buffer,bin+(b.byteOffset||0)+(a.byteOffset||0),a.count*size),size,!!a.normalized);}
  for(const [semantic,name] of [['POSITION','position'],['NORMAL','normal'],['TEXCOORD_0','uv'],['COLOR_0','color']])if(primitive.attributes[semantic]!==undefined)g.setAttribute(name,attribute(primitive.attributes[semantic]));
  g.setIndex(attribute(primitive.indices));if(!g.getAttribute('normal'))g.computeVertexNormals();g.computeBoundingSphere();return g;
 }
 function draw(){
  if(!renderer||!loaded||lost)return;
  const still=paused||reduced.matches,p=still?0:progress;
  const gather=ease(clamp((p-.18)/.22)),distill=ease(clamp((p-.38)/.20)),form=ease(clamp((p-.58)/.20)),fly=ease(clamp((p-.80)/.20));
  // Positive Z (beak) maps to the right. Never mirror the branded silhouette.
  bird.rotation.set((still?0:py*.11),Math.PI/2-.16-gather*.04+form*.09+(still?0:px*.18),-fly*.075+(still?0:Math.sin(time*.8)*.011));
  bird.position.set(fly*.34,gather*.025+fly*.27+(still?0:Math.sin(time*.95)*.014),0);
  bird.scale.setScalar(.93+gather*.07+fly*.035);
  camera.position.x=still?0:px*.025;camera.position.y=.08+(still?0:py*.025);camera.lookAt(0,0,0);
  key.position.x=-2+(still?0:Math.sin(time*.17)*.6+distill*.8);
  if(material){material.roughness=.34-distill*.14;material.clearcoat=.68+distill*.3;material.emissiveIntensity=.22+distill*.2+form*.08;}
  renderer.render(scene,camera);host.classList.add('webgl-ready');host.dataset.render='webgl';
  document.querySelectorAll('[data-phase]').forEach((el,i)=>el.classList.toggle('active',i===Math.min(4,Math.floor(p*5))));
 }
 function stop(){cancelAnimationFrame(raf);raf=0;last=0;}
 function frame(now){raf=0;if(!visible||document.hidden||paused||reduced.matches||!loaded||lost)return;time+=last?Math.min((now-last)/1000,.05):0;last=now;px+=(tx-px)*.04;py+=(ty-py)*.04;const rect=document.getElementById('top').getBoundingClientRect();progress+=(clamp(-rect.top/rect.height)-progress)*.06;draw();raf=requestAnimationFrame(frame);}
 function start(){if(!raf&&renderer&&loaded&&!lost&&visible&&!document.hidden&&!paused&&!reduced.matches)raf=requestAnimationFrame(frame);}
 function resize(){const r=host.getBoundingClientRect();if(!r.width||!r.height||!renderer)return;camera.aspect=r.width/r.height;camera.position.z=Math.max(4.3,4.1/camera.aspect);camera.updateProjectionMatrix();renderer.setSize(r.width,r.height,false);draw();}
 function state(){stop();document.documentElement.classList.toggle('motion-paused',paused||reduced.matches);if(button){button.hidden=false;button.disabled=reduced.matches;button.setAttribute('aria-pressed',String(paused||reduced.matches));button.textContent=document.documentElement.lang==='zh-CN'?(paused||reduced.matches?'动态已暂停':'暂停动态'):(paused||reduced.matches?'Motion paused':'Pause motion');}document.dispatchEvent(new CustomEvent('malttrix:motion'));draw();start();}
 if(button)button.addEventListener('click',()=>{paused=!paused;state();});reduced.addEventListener('change',state);document.addEventListener('malttrix:language',state);
 host.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const r=host.getBoundingClientRect();tx=(e.clientX-r.left)/r.width-.5;ty=(e.clientY-r.top)/r.height-.5;});host.addEventListener('pointerleave',()=>{tx=ty=0;});
 new ResizeObserver(resize).observe(host);new IntersectionObserver(([e])=>{visible=e.isIntersecting;visible?start():stop();}).observe(host);
 document.addEventListener('visibilitychange',()=>document.hidden?stop():start());window.addEventListener('pagehide',stop);window.addEventListener('pageshow',start);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;stop();host.classList.remove('webgl-ready');host.dataset.render='fallback';});canvas.addEventListener('webglcontextrestored',()=>{lost=false;resize();start();});
 state();
 if(renderer){
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000),loader=new T.TextureLoader(),anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const texture=(name,srgb=false)=>new Promise((resolve,reject)=>loader.load(`./assets/${name}?v=13`,map=>{map.flipY=false;map.anisotropy=anisotropy;if(srgb)map.colorSpace=T.SRGBColorSpace;resolve(map);},undefined,reject));
  Promise.all([
   fetch('./assets/hummingbird-v13.glb?v=13',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Model unavailable');return r.arrayBuffer();}),
   texture('hummingbird-diffuse.webp',true),texture('hummingbird-normal.webp'),texture('hummingbird-metalrough.webp'),texture('hummingbird-emissive.webp',true)
  ]).then(([buffer,map,normal,metalrough,emissive])=>{
   const g=geometry(buffer);material=new T.MeshPhysicalMaterial({map,normalMap:normal,normalScale:new T.Vector2(.72,.72),metalnessMap:metalrough,roughnessMap:metalrough,metalness:.55,roughness:.34,clearcoat:.68,clearcoatRoughness:.16,iridescence:.42,iridescenceIOR:1.32,iridescenceThicknessRange:[110,310],emissive:new T.Color('#ffffff'),emissiveMap:emissive,emissiveIntensity:.22,side:T.DoubleSide});
   const sculpture=new T.Mesh(g,material);sculpture.position.y=-.5;bird.add(sculpture);loaded=true;host.dataset.triangles=String(g.index.count/3);host.dataset.material='pbr-prismatic-crystal';host.dataset.motion='hover-gather-distill-form-fly';resize();start();
  }).catch(()=>{host.dataset.render='fallback';}).finally(()=>clearTimeout(timeout));
 }
})();
