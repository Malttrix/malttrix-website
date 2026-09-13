/* Sparse, portrait-only constellation. Never covers the face or copy. */
(()=>{
 'use strict';
 const canvas=document.querySelector('.founder-particles');if(!canvas)return;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const palette=['53,89,199','53,183,196','118,86,200','213,164,71'];
 const dots=Array.from({length:34},(_,i)=>({x:.08+(Math.sin(i*43.7)*.5+.5)*.84,y:.08+(Math.cos(i*19.3)*.5+.5)*.84,r:.8+(i%4)*.32,c:palette[i===33?3:i%3]}));
 let w=0,h=0,raf=0,t=0,last=0,visible=false;
 const paused=()=>reduced.matches||document.documentElement.classList.contains('motion-paused');
 function draw(){
  ctx.clearRect(0,0,w,h);const count=w<400?18:34;
  const points=dots.slice(0,count).map((p,i)=>({...p,x:p.x*w+Math.sin(t*.16+i)*5,y:p.y*h+Math.cos(t*.13+i)*6}));
  points.forEach((p,i)=>{
   ctx.shadowColor=`rgba(${p.c},.32)`;ctx.shadowBlur=6;ctx.fillStyle=`rgba(${p.c},.27)`;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
   points.slice(i+1).forEach(q=>{const d=Math.hypot(q.x-p.x,q.y-p.y);if(d<76){ctx.strokeStyle=`rgba(118,86,200,${.085*(1-d/76)})`;ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}});
  });
 }
 function stop(){cancelAnimationFrame(raf);raf=0;last=0;}
 function frame(now){raf=0;if(!visible||document.hidden||paused())return;t+=last?Math.min((now-last)/1000,.05):0;last=now;draw();raf=requestAnimationFrame(frame);}
 function sync(){stop();draw();if(visible&&!document.hidden&&!paused())raf=requestAnimationFrame(frame);}
 new ResizeObserver(()=>{const r=canvas.getBoundingClientRect();w=r.width;h=r.height;const d=Math.min(devicePixelRatio,1.5);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);draw();}).observe(canvas);
 new IntersectionObserver(([e])=>{visible=e.isIntersecting;sync();}).observe(canvas);
 reduced.addEventListener('change',sync);document.addEventListener('malttrix:motion',sync);document.addEventListener('visibilitychange',sync);window.addEventListener('pagehide',stop);window.addEventListener('pageshow',sync);
})();
