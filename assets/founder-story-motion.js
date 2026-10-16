/* Founder v10: narrative motion and local analytics events; no tracking requests. */
(()=>{'use strict';
const page=document.querySelector('.bio-main');if(!page)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const ease='cubic-bezier(0.22,1,0.36,1)',playing=new Set(),seen=new WeakSet();
function animate(el,frames,options){if(!el||reduced.matches||typeof el.animate!=='function')return;try{const a=el.animate(frames,{easing:ease,fill:'backwards',...options});playing.add(a);a.onfinish=()=>playing.delete(a);a.oncancel=()=>playing.delete(a);}catch(_){}}
const title=page.querySelectorAll('.bio-title-mask>span');
function entry(){animate(page.querySelector('.bio-hero-copy>.bio-label'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:600});title.forEach((el,i)=>animate(el,[{transform:'translateY(110%)'},{transform:'translateY(0)'}],{duration:750,delay:300+i*130}));animate(page.querySelector('.bio-founder-identity'),[{opacity:0},{opacity:1}],{duration:600,delay:100});animate(page.querySelector('.bio-portrait'),[{opacity:0,transform:'translateY(25px)'},{opacity:1,transform:'none'}],{duration:1000,delay:700});animate(page.querySelector('.bio-portrait-light'),[{opacity:0},{opacity:1}],{duration:1200,delay:950});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',entry,{once:true});else entry();
const hero=page.querySelector('#top'),turn=page.querySelector('#turning-point'),freedom=page.querySelector('.bio-freedom'),manifesto=page.querySelector('#why');
const approach=page.querySelector('#approach'),dual=page.querySelector('.bio-dual-mind');
const worlds=[...page.querySelectorAll('.bio-world')],rail=[...page.querySelectorAll('.bio-matrix-rail a')],activeScenes=new Set();
let frame=0,energy=0,lastScroll=typeof scrollY==='number'?scrollY:0,idleTimer=0;
const clamp=n=>Math.max(0,Math.min(1,n));
function update(){frame=0;
 const light=page.querySelector('.bio-portrait-light');if(light)light.dataset.active=String(!reduced.matches&&!document.hidden&&activeScenes.has(hero));
 if(reduced.matches){hero?.style.setProperty('--portrait-y','0px');hero?.style.setProperty('--light-y','0px');freedom?.style.setProperty('--freedom','1');manifesto?.style.setProperty('--gather','0px');dual?.style.setProperty('--integration','1');worlds.forEach(el=>{el.style.setProperty('--world-progress','1');el.style.setProperty('--scroll-energy','0');});}
 const vh=innerHeight||800;
 if(!reduced.matches){
 if(hero&&activeScenes.has(hero)){const r=hero.getBoundingClientRect(),p=clamp(-r.top/Math.max(r.height,1));hero.style.setProperty('--portrait-y',(-p*25).toFixed(2)+'px');hero.style.setProperty('--light-y',(p*18).toFixed(2)+'px');}
 if(turn&&freedom&&activeScenes.has(turn)){const r=turn.getBoundingClientRect(),p=clamp((vh*.8-r.top)/Math.max(1,r.height-vh*.2));freedom.style.setProperty('--freedom',p.toFixed(4));}
 if(manifesto&&activeScenes.has(manifesto)){const r=manifesto.getBoundingClientRect(),p=clamp((vh*.75-r.top)/Math.max(1,r.height*.65));manifesto.style.setProperty('--gather',((1-p)*18).toFixed(2)+'px');}
 if(approach&&dual&&activeScenes.has(approach)){const r=dual.getBoundingClientRect(),p=clamp((vh*.85-r.top)/(vh*.65));dual.style.setProperty('--integration',p.toFixed(4));}
 worlds.forEach(el=>{if(!activeScenes.has(el))return;const r=el.getBoundingClientRect(),p=clamp((vh*.9-r.top)/(vh*.7));el.style.setProperty('--world-progress',p.toFixed(4));el.style.setProperty('--scroll-energy',energy.toFixed(3));});
 }
 if(worlds.length){const visible=worlds.map(el=>({el,r:el.getBoundingClientRect()})).filter(x=>x.r.bottom>vh*.2&&x.r.top<vh*.8);if(visible.length){const current=visible.reduce((a,b)=>Math.abs(a.r.top-vh*.25)<Math.abs(b.r.top-vh*.25)?a:b).el.dataset.dimension;rail.forEach(a=>{if(a.dataset.world===current)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});}}
}
function request(){if(!frame)frame=requestAnimationFrame(update);}
if('IntersectionObserver'in window){
 const sceneObserver=new IntersectionObserver(entries=>{entries.forEach(e=>e.isIntersecting?activeScenes.add(e.target):activeScenes.delete(e.target));request();},{rootMargin:'15% 0px',threshold:0});
 [hero,turn,manifesto,approach,...worlds].filter(Boolean).forEach(el=>sceneObserver.observe(el));
 const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;revealObserver.unobserve(e.target);if(seen.has(e.target))return;seen.add(e.target);const el=e.target,world=el.closest('.bio-world'),stagger=el.classList.contains('bio-system')?[...el.parentElement.children].indexOf(el)*100:0;
 const lateral=world&&innerWidth>720?(world.dataset.direction==='right'?38:-38):0;
 animate(el,[{opacity:0,transform:lateral?'translateX('+lateral+'px)':'translateY(16px)'},{opacity:1,transform:'none'}],{duration:world?850:650,delay:world&&el.classList.contains('bio-world-copy')?130:stagger});
 if(el.classList.contains('bio-signature-art'))animate(el,[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:1200});}),{threshold:.08,rootMargin:'0px 0px -5%'});
 page.querySelectorAll('.bio-heading,.bio-prose,.bio-principle,.bio-world-art,.bio-world-copy,.bio-system,.bio-reflection,.bio-note-portrait,.bio-signature-art,.bio-practice,.bio-support-diagram,.bio-support-heading').forEach(el=>revealObserver.observe(el));
 const wave=page.querySelector('.bio-sensory-study svg path');if(wave){const io=new IntersectionObserver(([e])=>{if(!e.isIntersecting)return;io.disconnect();animate(wave,[{strokeDasharray:1,strokeDashoffset:1},{strokeDasharray:1,strokeDashoffset:0}],{duration:1500});},{threshold:.2});io.observe(wave);}
}else [hero,turn,manifesto,approach,...worlds].filter(Boolean).forEach(el=>activeScenes.add(el));
function onScroll(){const y=typeof scrollY==='number'?scrollY:0;energy=clamp(Math.abs(y-lastScroll)/120);lastScroll=y;if(typeof setTimeout==='function'){clearTimeout(idleTimer);idleTimer=setTimeout(()=>{energy=0;request();},180);}request();}
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',request,{passive:true});document.addEventListener?.('visibilitychange',request);
function reset(){if(reduced.matches){playing.forEach(a=>a.cancel());playing.clear();}request();}
reduced.addEventListener?.('change',reset);
if(typeof MutationObserver==='function'){new MutationObserver(request).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});}
// The diagram is a decorative companion to ordinary About links, never a tab trap.
const supportDiagram=page.querySelector('.bio-support-diagram');
const capabilityLinks=[...page.querySelectorAll('.bio-system[data-capability]')];
if(supportDiagram){
 const syncSupport=()=>{const active=capabilityLinks.find(a=>a===document.activeElement)||capabilityLinks.find(a=>typeof a.matches==='function'&&a.matches(':hover'));supportDiagram.dataset.active=active?.dataset.capability||'all';};
 capabilityLinks.forEach(a=>{const activate=()=>{supportDiagram.dataset.active=a.dataset.capability;};a.addEventListener('pointerenter',activate);a.addEventListener('focus',activate);a.addEventListener('pointerleave',syncSupport);a.addEventListener('blur',syncSupport);});
}
reset();
// Instrumentation hook for the site's analytics adapter. No cookies, identity or network calls.
if(typeof CustomEvent==='function'&&typeof page.dispatchEvent==='function'){
 const emit=(name,detail)=>page.dispatchEvent(new CustomEvent('malttrix:founder',{bubbles:true,detail:{name,language:document.documentElement.lang,...detail}}));
 page.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>emit('cta_click',{section:a.closest('section')?.id||'main',action:a.classList.contains('bio-system')?'capability':a.dataset.world||'explore'})));
 const viewed=new WeakSet();if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting||viewed.has(e.target))return;viewed.add(e.target);emit('section_view',{section:e.target.id});io.unobserve(e.target);}),{threshold:.18});page.querySelectorAll('section[id]').forEach(el=>io.observe(el));}
 const milestones=new Set();addEventListener('scroll',()=>{const total=document.documentElement.scrollHeight-innerHeight;if(total<=0)return;const depth=Math.min(100,Math.round((scrollY/total)*100));[25,50,75,100].forEach(value=>{if(depth>=value&&!milestones.has(value)){milestones.add(value);emit('scroll_depth',{percent:value});}});},{passive:true});
}
})();



