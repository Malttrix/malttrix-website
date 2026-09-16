/* V14 — full-hero ambient prismatic particle field.
   Independent from the hummingbird mesh so depth spans the complete scene. */
(()=>{
 'use strict';
 const hero=document.getElementById('top'),stage=hero&&hero.querySelector('.hero-stage'),canvas=document.getElementById('heroAmbientCanvas');
 if(!hero||!stage||!canvas)return;
 const ctx=canvas.getContext('2d',{alpha:true}),reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:930px)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
 if(!ctx)return;
 const palette=['53,89,199','53,183,196','118,86,200','215,94,154','213,164,71'];
 let width=0,height=0,dpr=1,particles=[],raf=0,last=0,time=0,visible=true,mouseX=.7,mouseY=.42,targetX=.7,targetY=.42,pointerActive=0;
 const clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>v*v*(3-2*v),fract=v=>v-Math.floor(v),lerp=(a,b,t)=>a+(b-a)*t;
 const rand=n=>fract(Math.sin(n*91.345+17.17)*47453.5453);
 function heroProgress(){
  const r=hero.getBoundingClientRect(),span=r.height>innerHeight*1.25?r.height-innerHeight:r.height;
  return clamp(-r.top/Math.max(1,span));
 }
 function pulse(p,start,peak,end){
  return ease(clamp((p-start)/Math.max(.001,peak-start)))*(1-ease(clamp((p-peak)/Math.max(.001,end-peak))));
 }
 function build(){
  const area=width*height,count=Math.round(Math.max(mobile.matches?80:130,Math.min(mobile.matches?145:280,area/6600)));
  particles=Array.from({length:count},(_,i)=>{
   const seed=rand(i+1);
   return{
    x:rand(i+11),y:rand(i+37),z:.18+rand(i+71)*.82,seed,
    vx:(.0025+rand(i+101)*.0065)*(rand(i+131)>.28?1:-.35),
    vy:(rand(i+151)-.5)*.0048,
    size:.55+rand(i+181)*1.75,
    kind:i%7===0?2:(i%4===0?1:0),
    color:Math.floor(rand(i+211)*palette.length),
    phase:rand(i+251)*Math.PI*2
   };
  });
 }
 function resize(){
  const r=stage.getBoundingClientRect();if(!r.width||!r.height)return;
  width=Math.round(r.width);height=Math.round(r.height);dpr=Math.min(devicePixelRatio||1,mobile.matches?1.25:1.6);
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.width=width+'px';canvas.style.height=height+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);build();draw(0);
 }
 function draw(dt){
  ctx.clearRect(0,0,width,height);
  const p=reduced.matches||document.documentElement.classList.contains('motion-paused')?0:heroProgress(),phase=Math.min(4,Math.floor(p*5));
  const gather=pulse(p,.10,.29,.45),distill=pulse(p,.28,.48,.64),form=pulse(p,.48,.68,.83),fly=ease(clamp((p-.76)/.24));
  canvas.dataset.phase=String(phase);
  mouseX+=(targetX-mouseX)*.055;mouseY+=(targetY-mouseY)*.055;pointerActive*=.985;
  for(const q of particles){
   if(dt){q.x+=q.vx*dt*(1+distill*1.5+fly*3.2);q.y+=q.vy*dt*(1+gather*.7);if(q.x>1.12)q.x=-.12;if(q.x<-.12)q.x=1.12;if(q.y>1.1)q.y=-.1;if(q.y<-.1)q.y=1.1;}
   let x=q.x*width,y=q.y*height;
   const lane=height*(.14+q.x*.56+(q.seed-.5)*.22);
   y=lerp(y,lane,gather*.72);
   const arcY=height*(.48+Math.sin(q.x*Math.PI*1.35+q.phase)*(.08+.1*q.z));
   y=lerp(y,arcY,form*.52);
   x+=(mouseX-.5)*(q.z-.35)*42*pointerActive;
   y+=(mouseY-.5)*(q.z-.35)*26*pointerActive+(q.z-.5)*p*150;
   x+=fly*q.z*150;
   const dissolve=ease(clamp((fly-q.seed*.72)/.28));
   let alpha=(.055+q.z*.12)*(1+gather*.55+distill*.95+form*.48+fly*.3)*(1-dissolve*.82);
   if(x<width*.57&&y>height*.14&&y<height*.82)alpha*=.30;
   if(q.kind===2)alpha*=.72;
   const shimmer=.78+.22*Math.sin(time*.0012+q.phase+distill*3.0),size=q.size*(.72+q.z*.8)*(1+distill*.22);
   ctx.fillStyle='rgba('+palette[(q.color+phase)%palette.length]+','+(alpha*shimmer)+')';
   ctx.strokeStyle='rgba('+palette[(q.color+phase+1)%palette.length]+','+(alpha*.72)+')';
   if(q.kind===0){
    ctx.beginPath();ctx.arc(x,y,size,0,Math.PI*2);ctx.fill();
   }else if(q.kind===1){
    ctx.save();ctx.translate(x,y);ctx.rotate(time*.00008*(q.seed>.5?1:-1)+q.phase);ctx.fillRect(-size,-size,size*2,size*2);ctx.restore();
   }else{
    const trail=8+q.z*18+fly*20;
    ctx.lineWidth=Math.max(.45,q.z*1.05);ctx.beginPath();ctx.moveTo(x-trail,y+trail*.12);ctx.lineTo(x,y);ctx.stroke();
   }
  }
 }
 function stop(){cancelAnimationFrame(raf);raf=0;last=0;}
 function frame(now){
  raf=0;if(!visible||document.hidden||reduced.matches||document.documentElement.classList.contains('motion-paused')){draw(0);return;}
  const dt=last?Math.min((now-last)/1000,.05):0;last=now;time=now;draw(dt);raf=requestAnimationFrame(frame);
 }
 function start(){if(!raf&&visible&&!document.hidden&&!reduced.matches&&!document.documentElement.classList.contains('motion-paused'))raf=requestAnimationFrame(frame);else draw(0);}
 stage.addEventListener('pointermove',e=>{if(!fine.matches||e.pointerType!=='mouse')return;const r=stage.getBoundingClientRect();targetX=clamp((e.clientX-r.left)/r.width);targetY=clamp((e.clientY-r.top)/r.height);pointerActive=1;});
 stage.addEventListener('pointerleave',()=>{targetX=.7;targetY=.42;pointerActive=.25;});
 new ResizeObserver(resize).observe(stage);
 new IntersectionObserver(([e])=>{visible=e.isIntersecting;visible?start():stop();},{rootMargin:'15% 0px'}).observe(hero);
 addEventListener('scroll',()=>{if(reduced.matches||document.documentElement.classList.contains('motion-paused'))draw(0);},{passive:true});
 document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
 document.addEventListener('malttrix:motion',()=>{stop();start();});
 reduced.addEventListener('change',()=>{stop();start();});
 mobile.addEventListener('change',resize);
 resize();start();
})();
