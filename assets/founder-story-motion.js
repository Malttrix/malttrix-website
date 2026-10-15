/* Founder v5: narrative motion, event-driven and readable without JavaScript. */
(()=>{'use strict';
const page=document.querySelector('.bio-main');if(!page)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const ease='cubic-bezier(0.22,1,0.36,1)',playing=new Set(),seen=new WeakSet();
function animate(el,frames,options){if(!el||reduced.matches||typeof el.animate!=='function')return;try{const a=el.animate(frames,{easing:ease,fill:'backwards',...options});playing.add(a);a.onfinish=()=>playing.delete(a);a.oncancel=()=>playing.delete(a);}catch(_){}}
const title=page.querySelectorAll('.bio-title-mask>span');
function entry(){animate(page.querySelector('.bio-hero-copy>.bio-label'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:600});title.forEach((el,i)=>animate(el,[{transform:'translateY(110%)'},{transform:'translateY(0)'}],{duration:750,delay:200+i*130}));animate(page.querySelector('.bio-founder-identity'),[{opacity:0},{opacity:1}],{duration:600,delay:100});animate(page.querySelector('.bio-portrait'),[{opacity:0,transform:'translateY(25px)'},{opacity:1,transform:'none'}],{duration:1100,delay:300});page.querySelectorAll('.bio-prism-lines path').forEach((el,i)=>animate(el,[{strokeDashoffset:1100},{strokeDashoffset:0}],{duration:1600,delay:1100+i*200}));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',entry,{once:true});else entry();
const hero=page.querySelector('#top'),turn=page.querySelector('#turning-point'),freedom=page.querySelector('.bio-freedom'),manifesto=page.querySelector('#why');
const worlds=[...page.querySelectorAll('.bio-world')],rail=[...page.querySelectorAll('.bio-matrix-rail a')],activeScenes=new Set();
let frame=0;
const clamp=n=>Math.max(0,Math.min(1,n));
function update(){frame=0;
 if(reduced.matches){hero?.style.setProperty('--portrait-y','0px');hero?.style.setProperty('--line-y','0px');freedom?.style.setProperty('--freedom','1');manifesto?.style.setProperty('--gather','0px');worlds.forEach(el=>el.style.setProperty('--world-progress','1'));}
 const vh=innerHeight||800;
 if(!reduced.matches){
 if(hero&&activeScenes.has(hero)){const r=hero.getBoundingClientRect(),p=clamp(-r.top/Math.max(r.height,1));hero.style.setProperty('--portrait-y',(-p*25).toFixed(2)+'px');hero.style.setProperty('--line-y',(p*18).toFixed(2)+'px');}
 if(turn&&freedom&&activeScenes.has(turn)){const r=turn.getBoundingClientRect(),p=clamp((vh*.8-r.top)/Math.max(1,r.height-vh*.2));freedom.style.setProperty('--freedom',p.toFixed(4));}
 if(manifesto&&activeScenes.has(manifesto)){const r=manifesto.getBoundingClientRect(),p=clamp((vh*.75-r.top)/Math.max(1,r.height*.65));manifesto.style.setProperty('--gather',((1-p)*18).toFixed(2)+'px');}
 worlds.forEach(el=>{if(!activeScenes.has(el))return;const r=el.getBoundingClientRect(),p=clamp((vh*.9-r.top)/(vh*.7));el.style.setProperty('--world-progress',p.toFixed(4));});
 }
 if(worlds.length){const visible=worlds.map(el=>({el,r:el.getBoundingClientRect()})).filter(x=>x.r.bottom>vh*.2&&x.r.top<vh*.8);if(visible.length){const current=visible.reduce((a,b)=>Math.abs(a.r.top-vh*.25)<Math.abs(b.r.top-vh*.25)?a:b).el.dataset.dimension;rail.forEach(a=>{if(a.dataset.world===current)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});}}
}
function request(){if(!frame)frame=requestAnimationFrame(update);}
if('IntersectionObserver'in window){
 const sceneObserver=new IntersectionObserver(entries=>{entries.forEach(e=>e.isIntersecting?activeScenes.add(e.target):activeScenes.delete(e.target));request();},{rootMargin:'15% 0px',threshold:0});
 [hero,turn,manifesto,...worlds].filter(Boolean).forEach(el=>sceneObserver.observe(el));
 const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;revealObserver.unobserve(e.target);if(seen.has(e.target))return;seen.add(e.target);const el=e.target,world=el.closest('.bio-world'),stagger=el.classList.contains('bio-system')?[...el.parentElement.children].indexOf(el)*100:0;
 const lateral=world&&innerWidth>720?(world.dataset.direction==='right'?38:-38):0;
 animate(el,[{opacity:0,transform:lateral?'translateX('+lateral+'px)':'translateY(16px)'},{opacity:1,transform:'none'}],{duration:world?850:650,delay:world&&el.classList.contains('bio-world-copy')?130:stagger});
 if(el.classList.contains('bio-signature-art'))animate(el,[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:1200});}),{threshold:.08,rootMargin:'0px 0px -5%'});
 page.querySelectorAll('.bio-heading,.bio-prose,.bio-principle,.bio-world-art,.bio-world-copy,.bio-system,.bio-reflection,.bio-note-portrait,.bio-signature-art').forEach(el=>revealObserver.observe(el));
 const wave=page.querySelector('.bio-sensory-study svg path');if(wave){const io=new IntersectionObserver(([e])=>{if(!e.isIntersecting)return;io.disconnect();animate(wave,[{strokeDasharray:1,strokeDashoffset:1},{strokeDasharray:1,strokeDashoffset:0}],{duration:1500});},{threshold:.2});io.observe(wave);}
}else [hero,turn,manifesto,...worlds].filter(Boolean).forEach(el=>activeScenes.add(el));
addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});
function reset(){if(reduced.matches){playing.forEach(a=>a.cancel());playing.clear();}request();}
reduced.addEventListener?.('change',reset);
if(typeof MutationObserver==='function'){new MutationObserver(request).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});}
reset();
})();
