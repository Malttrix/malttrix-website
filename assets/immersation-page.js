/* Immersation: native anchors, a shared language preference and bounded motion. */
(()=>{'use strict';
const root=document.querySelector('.im-main');if(!root)return;
const copy=JSON.parse(document.getElementById('immersation-copy').textContent),buttons=[...document.querySelectorAll('.lang-btn')],menu=document.getElementById('primaryMenu'),toggle=document.getElementById('menuToggle'),header=document.getElementById('siteHeader');
function apply(lang,persist=false){lang=copy[lang]?lang:'en';const dict=copy[lang];document.documentElement.lang=lang==='zh'?'zh-CN':'en';document.title=dict['imm.meta.title'];
 document.querySelector('meta[name="description"]').content=dict['imm.meta.description'];document.querySelector('meta[property="og:title"]').content=dict['imm.meta.title'];document.querySelector('meta[property="og:description"]').content=dict['imm.meta.description'];
 document.querySelectorAll('[data-i18n]').forEach(el=>{const value=dict[el.dataset.i18n];if(value===undefined)return;if(el.dataset.i18n==='footer.signature'){el.replaceChildren();value.split(/<br\s*\/?\s*>/i).forEach((line,i)=>{if(i)el.append(document.createElement('br'));el.append(document.createTextNode(line));});}else el.textContent=value;});
 document.querySelectorAll('[data-i18n-aria]').forEach(el=>{if(dict[el.dataset.i18nAria])el.setAttribute('aria-label',dict[el.dataset.i18nAria]);});buttons.forEach(b=>{const on=b.dataset.lang===lang;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});toggle.setAttribute('aria-label',lang==='zh'?'打开或关闭导航':'Open or close navigation');if(persist)try{localStorage.setItem('malttrix_lang_pref',lang);}catch(_){}
}
let saved='en';try{saved=localStorage.getItem('malttrix_lang_pref')||'en';}catch(_){}apply(saved);buttons.forEach(b=>b.addEventListener('click',()=>apply(b.dataset.lang,true)));
function closeMenu(){menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));menu.classList.toggle('open',open);});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('pointerdown',e=>{if(!header.contains(e.target))closeMenu();});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),hero=document.querySelector('.im-hero'),art=document.querySelector('.im-hero-art'),playing=new Set();let frame=0,heroVisible=true;
function update(){frame=0;header.classList.toggle('scrolled',scrollY>30);if(art&&(heroVisible||reduced.matches)){const r=hero.getBoundingClientRect();art.style.setProperty('--im-depth',reduced.matches?'0px':Math.max(-16,Math.min(16,-r.top*.025)).toFixed(2)+'px');}}
function request(){if(!frame)frame=requestAnimationFrame(update);}
function reveal(el){el.classList.add('is-seen');if(reduced.matches||typeof el.animate!=='function')return;const a=el.animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:650,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});playing.add(a);a.onfinish=()=>playing.delete(a);a.oncancel=()=>playing.delete(a);}
if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){reveal(e.target);io.unobserve(e.target);}}),{threshold:.1});document.querySelectorAll('.im-section h2,.im-principle,.im-pillar-copy,.im-format,.im-journey-step,.im-article,.im-noise-study,.im-journey-loop').forEach(el=>io.observe(el));
 new IntersectionObserver(([e])=>{heroVisible=e.isIntersecting;request();},{threshold:0}).observe(hero);
 const links=[...document.querySelectorAll('[data-pillar-link]')];
 const pillarIO=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting);if(!visible.length)return;const current=visible[0].target.dataset.pillar;links.forEach(a=>{if(a.dataset.pillarLink===current)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});},{rootMargin:'-20% 0px -35%',threshold:0});document.querySelectorAll('[data-pillar]').forEach(el=>pillarIO.observe(el));
}else document.querySelectorAll('.im-noise-study,.im-journey-loop').forEach(el=>el.classList.add('is-seen'));
reduced.addEventListener?.('change',()=>{if(reduced.matches){playing.forEach(a=>a.cancel());playing.clear();}request();});addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});request();
})();
