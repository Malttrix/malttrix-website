/* V12. Loads only the simple, single-mesh GLBs produced by prepare-hummingbird.py.
   Static sculpture: object/camera motion, not a fabricated skeletal wingbeat. */
(()=>{
 'use strict';
 const T=window.THREE,host=document.getElementById('sculpture'),canvas=document.getElementById('sculptureCanvas');
 if(!T||!host||!canvas)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:930px)'),button=document.getElementById('motionToggle');
 const scene=new T.Scene(),bird=new T.Group();scene.add(bird);
 const camera=new T.PerspectiveCamera(32,1,.1,30);camera.position.set(0,.08,4.6);camera.lookAt(0,0,0);
 let renderer,loaded=false,lost=false,visible=true,paused=false,raf=0,last=0,time=0,progress=0,px=0,py=0,tx=0,ty=0;
 const clamp=v=>Math.max(0,Math.min(1,v));
 try{renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,mobile.matches?1.25:1.6));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;}catch{host.dataset.render='fallback';}
 scene.add(new T.HemisphereLight('#fff9ef','#56617f',1.8));
 const key=new T.DirectionalLight('#fff6e9',2.5);key.position.set(-2,3,4);scene.add(key);
 const rim=new T.DirectionalLight('#bfdff2',2.2);rim.position.set(2,1,-2);scene.add(rim);
 const fill=new T.DirectionalLight('#e0d8f4',.8);fill.position.set(-2,-1,2);scene.add(fill);
 // Geometry stays untouched. This view-dependent material remains colourful
 // without requiring an environment map or baked texture.
 const material=new T.ShaderMaterial({
  vertexColors:true,side:T.DoubleSide,transparent:false,
  uniforms:{uTime:{value:0},uProgress:{value:0}},
  vertexShader:`
   varying vec3 vColour;varying vec3 vNormal;varying vec3 vWorld;
   void main(){vColour=color;vNormal=normalize(normalMatrix*normal);vec4 world=modelMatrix*vec4(position,1.0);vWorld=world.xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`
   uniform float uTime;uniform float uProgress;varying vec3 vColour;varying vec3 vNormal;varying vec3 vWorld;
   void main(){
    vec3 n=normalize(vNormal),viewDir=normalize(cameraPosition-vWorld),lightDir=normalize(vec3(-.45,.82,.55));
    float diffuse=.48+.52*max(dot(n,lightDir),0.0),fresnel=pow(1.0-abs(dot(n,viewDir)),2.15);
    float band=vWorld.y*1.28+vWorld.x*.37+fresnel*.58+uTime*.018+uProgress*.12;
    vec3 spectrum=.54+.46*cos(6.283185*(vec3(0.0,.34,.68)+band));
    vec3 jewel=pow(clamp(vColour,0.0,1.0),vec3(.64));
    vec3 crystal=mix(jewel,spectrum,.22+fresnel*.28);
    float spec=pow(max(dot(reflect(-lightDir,n),viewDir),0.0),44.0);
    vec3 colour=crystal*(.76+.34*diffuse)+spec*vec3(1.0,.96,.86)*1.25;
    colour+=fresnel*mix(vec3(.08,.38,.85),vec3(.88,.24,.72),clamp(vWorld.y+.35,0.0,1.0))*.38;
    gl_FragColor=vec4(colour,1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`
 });
 // This is intentionally a restricted reader, not a general glTF loader.
 function geometry(buffer){
  const view=new DataView(buffer);if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2)throw Error('Invalid GLB');
  const length=view.getUint32(12,true),json=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,20,length))),bin=28+length;
  const primitive=json.meshes[0].primitives[0],g=new T.BufferGeometry();
  function attribute(index){const a=json.accessors[index],b=json.bufferViews[a.bufferView],size={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type],Ctor={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType];if(!Ctor||b.byteStride||a.sparse)throw Error('Unsupported optimized asset');return new T.BufferAttribute(new Ctor(buffer,bin+(b.byteOffset||0)+(a.byteOffset||0),a.count*size),size,!!a.normalized);}
  for(const [semantic,name] of [['POSITION','position'],['NORMAL','normal'],['COLOR_0','color']])if(primitive.attributes[semantic]!==undefined)g.setAttribute(name,attribute(primitive.attributes[semantic]));
  g.setIndex(attribute(primitive.indices));if(!g.getAttribute('normal'))g.computeVertexNormals();g.computeBoundingSphere();return g;
 }
 function draw(){
  if(!renderer||!loaded||lost)return;
  const still=paused||reduced.matches,p=still?0:progress;
  // Positive Z (beak) maps to the right. Never mirror the branded silhouette.
  bird.rotation.set(0,Math.PI/2-.16+p*.18+(still?0:px*.08),still?0:Math.sin(time*.8)*.012);
  bird.position.set(p*.08,p*.10+(still?0:Math.sin(time*.95)*.012),0);
  camera.position.x=still?0:px*.018;camera.position.y=.08+(still?0:py*.018);camera.lookAt(0,0,0);
  key.position.x=-2+(still?0:Math.sin(time*.17)*.6+p*.6);material.uniforms.uTime.value=still?0:time;material.uniforms.uProgress.value=p;
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
 if(renderer){const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);fetch(`./assets/hummingbird-${mobile.matches?'mobile':'desktop'}.glb?v=12.1`,{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Model unavailable');return r.arrayBuffer();}).then(buffer=>{const g=geometry(buffer);bird.add(new T.Mesh(g,material));loaded=true;host.dataset.triangles=String(g.index.count/3);host.dataset.material='prismatic-crystal';resize();start();}).catch(()=>{host.dataset.render='fallback';}).finally(()=>clearTimeout(timeout));}
})();
