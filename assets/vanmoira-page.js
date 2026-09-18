(()=>{
  const root=document.documentElement;
  const buttons=[...document.querySelectorAll('.lang-btn')];
  const shell={
    en:{'nav.about':'About','nav.ecosystem':'Ecosystem','nav.capabilities':'Capabilities','nav.philosophy':'Philosophy','nav.founder':'Founder','nav.overview':'Ecosystem overview','nav.soon':'SOON','nav.enter':'Explore','footer.signature':'Born from imagination.<br>Refined into form.','footer.copy':'An independent creative intelligence ecosystem built around sound, vision and cognition.','footer.portfolio':'Portfolio','footer.explore':'Explore','footer.rights':'All rights reserved.','nav.archetypes':'Principles'},
    zh:{'nav.about':'关于','nav.ecosystem':'生态','nav.capabilities':'能力','nav.philosophy':'理念','nav.founder':'创始人','nav.overview':'生态概览','nav.soon':'即将推出','nav.enter':'探索','footer.signature':'为梦而生，<br>以萃成形。','footer.copy':'一个围绕声音、视觉与认知构建的独立创意智能生态。','footer.portfolio':'品牌矩阵','footer.explore':'探索','footer.rights':'版权所有。','nav.archetypes':'原则'}
  };
  const setLang=(lang)=>{
    const isZh=lang==='zh';
    root.lang=isZh?'zh-CN':'en';
    root.dataset.language=lang;
    buttons.forEach(b=>{const on=b.dataset.lang===lang;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
    document.querySelectorAll('[data-i18n]').forEach(el=>{const value=shell[lang][el.dataset.i18n];if(value)el.textContent=value;});
    document.querySelectorAll('[data-i18n-html]').forEach(el=>{const value=shell[lang][el.dataset.i18nHtml];if(value)el.innerHTML=value;});
    document.title=isZh?'VANMOIRA｜梵·暮汐 — 电影感情绪音乐宇宙':'VANMOIRA｜梵·暮汐 — Cinematic Emotional Music Universe';
    const meta=document.querySelector('meta[name="description"]');
    if(meta)meta.content=isZh?'探索梦萃旗下听觉艺术品牌 VANMOIRA｜梵·暮汐：原创音乐、电影感声景、情绪胶囊与声音授权。':'Explore VANMOIRA, Malttrix’s auditory-art brand: original music, cinematic soundscapes, Mood Capsules and licensing.';
    try{localStorage.setItem('malttrix-language',lang);}catch(e){}
  };
  buttons.forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));
  let saved='en';try{saved=localStorage.getItem('malttrix-language')||'en';}catch(e){}setLang(saved==='zh'?'zh':'en');

  const menu=document.getElementById('primaryMenu'),toggle=document.getElementById('menuToggle');
  toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));menu?.classList.toggle('open',!open);document.body.classList.toggle('menu-open',!open);});
  document.querySelectorAll('#primaryMenu a').forEach(a=>a.addEventListener('click',()=>{toggle?.setAttribute('aria-expanded','false');menu?.classList.remove('open');document.body.classList.remove('menu-open');}));
  const header=document.getElementById('siteHeader');
  const onScroll=()=>header?.classList.toggle('scrolled',scrollY>24);onScroll();addEventListener('scroll',onScroll,{passive:true});

  const reveal=[...document.querySelectorAll('.vm-reveal')];
  if('IntersectionObserver'in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target);}}),{threshold:.12,rootMargin:'0px 0px -7%'});reveal.forEach(el=>io.observe(el));}else reveal.forEach(el=>el.classList.add('is-visible'));

  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas=document.getElementById('vanmoiraField');
  if(canvas&&!reduced){
    const ctx=canvas.getContext('2d');let w=0,h=0,dpr=1,raf=0;
    const points=Array.from({length:54},(_,i)=>({x:Math.random(),y:Math.random(),r:.5+Math.random()*1.4,s:.00008+Math.random()*.00018,p:i%3}));
    const resize=()=>{const b=canvas.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,2);w=b.width;h=b.height;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)};
    const draw=(t)=>{ctx.clearRect(0,0,w,h);points.forEach(p=>{p.y-=p.s*16;if(p.y<-.03)p.y=1.03;const x=p.x*w+Math.sin(t*.00025+p.y*9)*12,y=p.y*h;ctx.beginPath();ctx.fillStyle=['rgba(99,191,208,.46)','rgba(118,86,200,.42)','rgba(213,164,71,.34)'][p.p];ctx.arc(x,y,p.r,0,Math.PI*2);ctx.fill();});for(let n=0;n<3;n++){ctx.beginPath();for(let x=0;x<=w;x+=18){const y=h*(.33+n*.18)+Math.sin(x*.008+t*.00035+n)*14;if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.strokeStyle=`rgba(${n===1?'99,191,208':'174,159,218'},${.045+n*.014})`;ctx.stroke();}raf=requestAnimationFrame(draw)};
    resize();addEventListener('resize',resize,{passive:true});raf=requestAnimationFrame(draw);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(raf);else raf=requestAnimationFrame(draw)});
  }
})();
