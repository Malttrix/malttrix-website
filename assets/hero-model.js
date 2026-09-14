/* V13.5. Loads only the simple, single-mesh GLBs produced by prepare-pbr-hummingbird.py.
   Static sculpture: object/camera motion, not a fabricated skeletal wingbeat. */
(()=>{
 'use strict';
 const T=window.THREE,host=document.getElementById('sculpture'),canvas=document.getElementById('sculptureCanvas');
 if(!T||!host||!canvas)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:930px)'),button=document.getElementById('motionToggle');
 const scene=new T.Scene(),bird=new T.Group();scene.add(bird);
 const camera=new T.PerspectiveCamera(32,1,.1,30);camera.position.set(0,.08,4.6);camera.lookAt(0,0,0);
 let renderer,material=null,particleMaterial=null,particles=null,loaded=false,lost=false,visible=true,paused=false,raf=0,last=0,time=0,progress=0,px=0,py=0,tx=0,ty=0,hover=0,hoverTarget=0,baseCameraZ=4.6;
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
 function particleField(g){
  const source=g.getAttribute('position'),stride=Math.max(1,Math.ceil(source.count/(mobile.matches?2600:5200))),count=Math.ceil(source.count/stride);
  const positions=new Float32Array(count*3),scatter=new Float32Array(count*3),seeds=new Float32Array(count);
  let n=0;
  for(let i=0;i<source.count;i+=stride){
   const seed=Math.abs(Math.sin((i+1)*12.9898)*43758.5453)%1,a=Math.abs(Math.sin((i+1)*78.233)*12345.6789)%1,b=Math.abs(Math.sin((i+1)*39.425)*9631.417)%1;
   positions[n*3]=source.getX(i);positions[n*3+1]=source.getY(i);positions[n*3+2]=source.getZ(i);
   let x=a*2-1,y=b*2-1,z=seed*2-1,l=Math.hypot(x,y,z)||1,r=.45+seed*.75;
   scatter[n*3]=x/l*r;scatter[n*3+1]=y/l*r;scatter[n*3+2]=z/l*r;seeds[n]=seed;n++;
  }
  const pg=new T.BufferGeometry();
  pg.setAttribute('position',new T.BufferAttribute(positions,3));pg.setAttribute('aScatter',new T.BufferAttribute(scatter,3));pg.setAttribute('aSeed',new T.BufferAttribute(seeds,1));
  particleMaterial=new T.ShaderMaterial({
   transparent:true,depthWrite:false,depthTest:true,blending:T.AdditiveBlending,
   uniforms:{uTime:{value:0},uGather:{value:0},uDistill:{value:0},uForm:{value:0},uFly:{value:0},uOpacity:{value:.07}},
   vertexShader:`precision highp float;
    attribute vec3 aScatter;attribute float aSeed;
    uniform float uTime,uGather,uDistill,uForm,uFly,uOpacity;
    varying vec3 vColor;varying float vAlpha;
    void main(){
     float dissolve=smoothstep(aSeed-.18,aSeed+.18,uFly);
     float pulse=sin(uTime*1.7+aSeed*18.0)*.015;
     vec3 pos=position+aScatter*(1.0-uGather)*.32;
     pos+=normalize(aScatter+vec3(.001))*pulse*(.4+uDistill);
     pos.x-=dissolve*(.18+aSeed*.72);
     pos.y+=dissolve*sin(uTime*1.4+aSeed*11.0)*.16;
     pos.z+=dissolve*cos(uTime*1.1+aSeed*9.0)*.18;
     vec3 cyan=vec3(.208,.718,.769),violet=vec3(.463,.337,.784),rose=vec3(.843,.369,.604),gold=vec3(.835,.643,.278);
     vColor=mix(mix(cyan,violet,smoothstep(0.0,.45,aSeed)),mix(rose,gold,smoothstep(.55,1.0,aSeed)),smoothstep(.36,.78,aSeed));
     vColor=mix(vColor,vec3(1.0,.97,.9),uDistill*.22+uForm*.1);
     vAlpha=uOpacity*(.55+aSeed*.45)*(1.0-dissolve*.92);
     vec4 mvPosition=modelViewMatrix*vec4(pos,1.0);
     gl_PointSize=clamp((2.0+aSeed*2.4)*(6.0/max(1.0,-mvPosition.z)),1.0,5.2);
     gl_Position=projectionMatrix*mvPosition;
    }`,
   fragmentShader:`precision highp float;varying vec3 vColor;varying float vAlpha;
    void main(){vec2 p=gl_PointCoord-.5;float d=dot(p,p);if(d>.25)discard;float glow=smoothstep(.25,0.0,d);gl_FragColor=vec4(vColor,vAlpha*glow);}`
  });
  particles=new T.Points(pg,particleMaterial);particles.position.y=-.5;particles.frustumCulled=false;bird.add(particles);host.dataset.particles=String(count);
 }
 function draw(){
  if(!renderer||!loaded||lost)return;
  const still=paused||reduced.matches,p=still?0:progress;
  const depth=ease(clamp(p/.82)),gather=ease(clamp((p-.18)/.22)),distill=ease(clamp((p-.38)/.20)),form=ease(clamp((p-.58)/.20)),fly=ease(clamp((p-.80)/.20));
  // The supplied PBR model is authored in side profile at Y = 0. Keep that profile as the resting view.
  const idleYaw=still?0:Math.sin(time*.38)*.018;
  bird.rotation.set((still?0:py*.24*hover),-.035-gather*.025+form*.055+idleYaw+(still?0:px*.46*hover),-fly*.075+(still?0:Math.sin(time*.8)*.017));
  bird.position.set(depth*.08+fly*.30,gather*.025+fly*.25-depth*.045+(still?0:Math.sin(time*.95)*.022),depth*.16);
  bird.scale.setScalar(1.23+gather*.085+fly*.04+(still?0:Math.sin(time*1.12)*.006));
  camera.position.x=still?0:px*.025;camera.position.y=.08+(still?0:py*.025);camera.position.z=baseCameraZ-(still?0:depth*.14);camera.lookAt(0,0,0);
  key.position.x=-2+(still?0:Math.sin(time*.17)*.6+distill*.8);rim.position.y=1+(still?0:Math.sin(time*.32)*.28);rim.intensity=2.2+(still?0:Math.sin(time*.55)*.14+form*.18);
  if(material){material.roughness=.34-distill*.14;material.clearcoat=.68+distill*.3;material.emissiveIntensity=.22+distill*.2+form*.08;}
  if(particleMaterial){particleMaterial.uniforms.uTime.value=time;particleMaterial.uniforms.uGather.value=gather;particleMaterial.uniforms.uDistill.value=distill;particleMaterial.uniforms.uForm.value=form;particleMaterial.uniforms.uFly.value=fly;particleMaterial.uniforms.uOpacity.value=still?.06:.07+gather*.38+distill*.18-form*.24+fly*.34;}
  renderer.render(scene,camera);host.classList.add('webgl-ready');host.dataset.render='webgl';
  document.querySelectorAll('[data-phase]').forEach((el,i)=>el.classList.toggle('active',i===Math.min(4,Math.floor(p*5))));
 }
 function stop(){cancelAnimationFrame(raf);raf=0;last=0;}
 function frame(now){raf=0;if(!visible||document.hidden||paused||reduced.matches||!loaded||lost)return;time+=last?Math.min((now-last)/1000,.05):0;last=now;px+=(tx-px)*.065;py+=(ty-py)*.065;hover+=(hoverTarget-hover)*.08;const rect=document.getElementById('top').getBoundingClientRect();progress+=(clamp(-rect.top/rect.height)-progress)*.06;draw();raf=requestAnimationFrame(frame);}
 function start(){if(!raf&&renderer&&loaded&&!lost&&visible&&!document.hidden&&!paused&&!reduced.matches)raf=requestAnimationFrame(frame);}
 function resize(){const r=host.getBoundingClientRect();if(!r.width||!r.height||!renderer)return;camera.aspect=r.width/r.height;baseCameraZ=Math.max(4.3,4.1/camera.aspect);camera.position.z=baseCameraZ;camera.updateProjectionMatrix();renderer.setSize(r.width,r.height,false);draw();}
 function state(){stop();document.documentElement.classList.toggle('motion-paused',paused||reduced.matches);if(button){button.hidden=false;button.disabled=reduced.matches;button.setAttribute('aria-pressed',String(paused||reduced.matches));button.textContent=document.documentElement.lang==='zh-CN'?(paused||reduced.matches?'动态已暂停':'暂停动态'):(paused||reduced.matches?'Motion paused':'Pause motion');}document.dispatchEvent(new CustomEvent('malttrix:motion'));draw();start();}
 if(button)button.addEventListener('click',()=>{paused=!paused;state();});reduced.addEventListener('change',state);document.addEventListener('malttrix:language',state);
 host.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')hoverTarget=1;});
 host.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const r=host.getBoundingClientRect();hoverTarget=1;tx=(e.clientX-r.left)/r.width-.5;ty=(e.clientY-r.top)/r.height-.5;});
 host.addEventListener('pointerleave',()=>{hoverTarget=0;tx=ty=0;});
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
   const sculpture=new T.Mesh(g,material);sculpture.position.y=-.5;bird.add(sculpture);particleField(g);loaded=true;host.dataset.triangles=String(g.index.count/3);host.dataset.material='pbr-prismatic-crystal';host.dataset.motion='hover-gather-distill-form-fly-particle-dissolve';resize();start();
  }).catch(()=>{host.dataset.render='fallback';}).finally(()=>clearTimeout(timeout));
 }
})();
