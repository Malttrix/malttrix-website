(() => {
  'use strict';
  const root = document.documentElement;
  const shell={
    en:{'nav.about':'About','nav.ecosystem':'Ecosystem','nav.capabilities':'Capabilities','nav.philosophy':'Philosophy','nav.founder':'Founder','nav.overview':'Ecosystem overview','nav.soon':'SOON','nav.enter':'Explore','footer.signature':'Born from imagination.<br>Refined into form.','footer.copy':'An independent creative intelligence ecosystem built around sound, vision and cognition.','footer.portfolio':'Portfolio','footer.explore':'Explore','footer.rights':'All rights reserved.','nav.archetypes':'Principles'},
    zh:{'nav.about':'关于','nav.ecosystem':'生态','nav.capabilities':'能力','nav.philosophy':'理念','nav.founder':'创始人','nav.overview':'生态概览','nav.soon':'即将推出','nav.enter':'探索','footer.signature':'为梦而生，<br>以萃成形。','footer.copy':'一个围绕声音、视觉与认知构建的独立创意智能生态。','footer.portfolio':'品牌矩阵','footer.explore':'探索','footer.rights':'版权所有。','nav.archetypes':'原则'}
  };
  const capsules = JSON.parse(document.getElementById('vm-capsule-data').textContent);
  const tracks = JSON.parse(document.getElementById('vm-track-data').textContent);
  const audio = document.getElementById('vm-audio');
  const player = document.getElementById('vm-player');
  const status = document.getElementById('vm-audio-status');
  const seek = document.getElementById('player-seek');
  const playToggle = document.getElementById('player-toggle');
  const muteToggle = document.getElementById('player-mute');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let lang = 'en', currentCapsule = capsules[0], currentTrack = null, opener = null, request = 0;
  const text = (en, zh) => lang === 'zh' ? zh : en;
  const announce = (en, zh) => { status.textContent = text(en, zh); };
  const trackById = id => tracks.find(track => track.id === id);
  const signal = (action, detail = {}) => document.dispatchEvent(new CustomEvent('vanmoira:interaction', {detail:{action,...detail}}));
  function updateCapsule() {
    const c = currentCapsule;
    document.getElementById('capsule-number').textContent = `${String(capsules.indexOf(c) + 1).padStart(2,'0')} / 07`;
    document.getElementById('capsule-title').textContent = text(c.en,c.zh);
    document.getElementById('capsule-tags').textContent = text(c.tags,c.ztags);
    document.getElementById('capsule-description').textContent = text(c.description,c.zdescription);
    const image = document.querySelector('.vm-capsule-image');
    image.src = `./assets/vanmoira/${c.id}.webp`;
    image.alt = text(`${c.en} official mood capsule artwork`,`${c.zh}官方情绪胶囊视觉`);
    document.getElementById('capsule-listen').dataset.play = c.track;
    document.querySelectorAll('[data-capsule]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.capsule === c.id)));
  }
  function renderPlayback() {
    const playing = !!currentTrack && !audio.paused && !audio.ended && audio.readyState >= 3;
    document.querySelectorAll('[data-play]').forEach(button => {
      const track = trackById(button.dataset.play);
      const active = playing && track?.id === currentTrack?.id;
      button.setAttribute('aria-pressed', String(active));
      if(track) button.setAttribute('aria-label',text(`${active?'Pause':'Play'} ${track.title} preview`,`${active?'暂停':'试听'} ${track.title}`));
      const icon = button.querySelector('b'); if(icon) icon.textContent = active ? '❚❚' : '▶';
    });
    document.querySelectorAll('[data-track]').forEach(row => row.classList.toggle('vm-playing',playing && row.dataset.track === currentTrack?.id));
    playToggle.textContent = playing ? '❚❚' : '▶';
    playToggle.setAttribute('aria-label',text(playing?'Pause preview':'Play preview',playing?'暂停试听':'继续试听'));
    muteToggle.setAttribute('aria-pressed', String(audio.muted));
    muteToggle.textContent = text(audio.muted?'Unmute':'Mute',audio.muted?'取消静音':'静音');
    if(currentTrack) document.getElementById('player-type').textContent = text(currentTrack.type,currentTrack.ztype);
  }
  function setLang(value) {
    lang = value === 'zh' ? 'zh' : 'en';
    root.lang = lang === 'zh' ? 'zh-CN' : 'en'; root.dataset.language = lang;
    document.querySelectorAll('.lang-btn').forEach(button => {const active=button.dataset.lang===lang;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
    document.querySelectorAll('[data-i18n]').forEach(el => {if(shell[lang][el.dataset.i18n])el.textContent=shell[lang][el.dataset.i18n];});
    document.querySelectorAll('[data-i18n-html]').forEach(el => {if(shell[lang][el.dataset.i18nHtml])el.innerHTML=shell[lang][el.dataset.i18nHtml];});
    document.title=text('VANMOIRA｜梵·暮汐 — Cinematic Emotional Music | Malttrix','VANMOIRA｜梵·暮汐 — 电影感情绪音乐 | 梦萃');
    const description=text('Discover VANMOIRA, an emotion-led music brand by Malttrix. Explore original songs, cinematic storytelling, instrumental soundscapes, and seven mood capsules.','梵·暮汐是梦萃旗下以情绪驱动的电影感听觉艺术品牌。探索原创音乐、双角色叙事、沉浸式器乐声景与七颗情绪胶囊。');
    document.querySelector('meta[name="description"]').content=description;
    document.querySelector('meta[property="og:title"]').content=document.title;
    document.querySelector('meta[property="og:description"]').content=description;
    document.getElementById('player-close').setAttribute('aria-label',text('Close player','关闭播放器'));
    player.setAttribute('aria-label',text('VANMOIRA audio preview player','VANMOIRA 试听播放器'));
    updateCapsule(); renderPlayback();
    try{localStorage.setItem('malttrix-language',lang);}catch(_){ }
    document.dispatchEvent(new CustomEvent('malttrix:language',{detail:{lang}}));
  }
  document.querySelectorAll('.lang-btn').forEach(button => button.addEventListener('click',()=>setLang(button.dataset.lang)));
  let saved='en';try{saved=localStorage.getItem('malttrix-language')||'en';}catch(_){ }
  setLang(saved);
  function selectGroup(group, focus=false) {
    if(!['vocal','soundscape'].includes(group))return;
    document.querySelectorAll('[data-group-tab]').forEach(tab => {const active=tab.dataset.groupTab===group;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;if(active&&focus)tab.focus();});
    document.getElementById('capsule-vocal').hidden=group!=='vocal';
    document.getElementById('capsule-soundscape').hidden=group!=='soundscape';
    currentCapsule=group==='vocal'?capsules[0]:capsules[4];updateCapsule();
    signal('capsule-group',{group});
  }
  document.querySelectorAll('[data-group-tab]').forEach(tab => {
    tab.addEventListener('click',()=>selectGroup(tab.dataset.groupTab));
    tab.addEventListener('keydown',event=>{
      if(['ArrowRight','ArrowLeft','Home','End'].includes(event.key)){
        event.preventDefault();selectGroup(event.key==='Home'?'vocal':event.key==='End'?'soundscape':tab.dataset.groupTab==='vocal'?'soundscape':'vocal',true);
      }
    });
  });
  document.querySelectorAll('[data-expression]').forEach(link=>link.addEventListener('click',()=>selectGroup(link.dataset.expression)));
  document.querySelectorAll('[data-capsule]').forEach(button=>button.addEventListener('click',()=>{currentCapsule=capsules.find(c=>c.id===button.dataset.capsule);updateCapsule();renderPlayback();signal('capsule-select',{capsule:currentCapsule.id});}));
  async function playTrack(id, source) {
    const track=trackById(id);if(!track)return;
    const token=++request;
    opener=source;
    if(currentTrack?.id===id && !audio.paused){audio.pause();return;}
    if(currentTrack?.id!==id){
      audio.pause();currentTrack=track;audio.src=track.src;audio.load();seek.value='0';
      document.getElementById('player-title').textContent=track.title;
      document.getElementById('player-cover').src=track.cover;
    } else if(audio.ended || audio.currentTime>=29.9) audio.currentTime=0;
    player.hidden=false;document.body.classList.add('vm-has-player');renderPlayback();
    announce(`Loading ${track.title} preview.`,`正在载入 ${track.title} 试听。`);
    try{await audio.play();if(token!==request)return;signal('preview-play',{track:id});}
    catch(error){if(token===request && error.name!=='AbortError')announce('The preview could not play. Try again, or listen at vanmoira.com.','试听暂时无法播放，请重试或前往 vanmoira.com 聆听。');}
  }
  document.addEventListener('click',event=>{const button=event.target.closest('[data-play]');if(button)playTrack(button.dataset.play,button);});
  playToggle.addEventListener('click',()=>{if(currentTrack)playTrack(currentTrack.id,opener);});
  muteToggle.addEventListener('click',()=>{audio.muted=!audio.muted;renderPlayback();});
  document.getElementById('player-close').addEventListener('click',()=>{++request;audio.pause();audio.removeAttribute('src');audio.load();currentTrack=null;player.hidden=true;document.body.classList.remove('vm-has-player');renderPlayback();opener?.focus();announce('Player closed.','播放器已关闭。');signal('preview-close');});
  seek.addEventListener('input',()=>{if(audio.readyState>=1){audio.currentTime=Math.min(Number(seek.value),audio.duration||30);}});
  audio.addEventListener('timeupdate',()=>{
    const seconds=Math.min(30,Math.max(0,audio.currentTime||0));seek.value=String(seconds);
    document.getElementById('player-time').textContent=`0:${String(Math.floor(seconds)).padStart(2,'0')} / 0:30`;
    if(audio.currentTime>=30 && !audio.paused)audio.pause();
  });
  for(const name of ['playing','pause','ended','waiting','volumechange'])audio.addEventListener(name,renderPlayback);
  audio.addEventListener('playing',()=>{if(currentTrack)announce(`Playing ${currentTrack.title}, 30-second excerpt.`,`正在播放 ${currentTrack.title}，30 秒片段。`);});
  audio.addEventListener('error',()=>{renderPlayback();if(currentTrack)announce('Audio unavailable. Please try the official VANMOIRA website.','音频暂不可用，请前往 VANMOIRA 官方网站聆听。');});
  window.addEventListener('pagehide',()=>audio.pause());
  document.querySelectorAll('a[href^="https://"]').forEach(link=>link.addEventListener('click',()=>signal('outbound',{destination:link.href})));
  const menu=document.getElementById('primaryMenu'),toggle=document.getElementById('menuToggle');
  function closeMenu(){toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label',text('Open navigation','打开导航'));menu.classList.remove('open');document.body.classList.remove('menu-open');}
  toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',text(open?'Close navigation':'Open navigation',open?'关闭导航':'打开导航'));menu.classList.toggle('open',open);document.body.classList.toggle('menu-open',open);});
  menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.classList.contains('open')){closeMenu();toggle.focus();}});
  const header=document.getElementById('siteHeader');
  const onScroll=()=>header.classList.toggle('scrolled',scrollY>24);onScroll();addEventListener('scroll',onScroll,{passive:true});
  if('IntersectionObserver' in window){
    root.classList.add('vm-js');
    const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');reveal.unobserve(entry.target);}}),{threshold:.08});
    document.querySelectorAll('.vm-reveal').forEach(el=>reveal.observe(el));
    const hero=document.querySelector('.vm-hero-art');let heroVisible=false;
    function motion(){hero.classList.toggle('vm-in-view',heroVisible&&!document.hidden&&!reduced.matches);}
    new IntersectionObserver(([entry])=>{heroVisible=entry.isIntersecting;motion();}).observe(hero);
    document.addEventListener('visibilitychange',motion);reduced.addEventListener('change',motion);
  }
})();
