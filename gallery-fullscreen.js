// 簡潔版：タップ/クリックで全画面、ダブルタップ/ダブルクリックでズーム、背景クリック/Escapeで閉じる
(function(){
  const overlay = document.getElementById('gallery-fullscreen');
  const img = document.getElementById('gallery-fullscreen-img');
  const closeBtn = document.getElementById('gallery-fullscreen-close');
  if(!overlay || !img) return;

  let scale = 1;
  let lastTap = 0;

  const clamp = (v,min,max)=> Math.max(min, Math.min(max, v));
  const apply = ()=> img.style.transform = `translate3d(0,0,0) scale(${scale})`;

  function open(src, alt){
    img.src = src||'';
    img.alt = alt||'';
    scale = 1; apply();
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden','false');
    document.documentElement.style.overflow = 'hidden';
  }
  function close(){
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden','true');
    img.src = '';
    document.documentElement.style.overflow = '';
    img.style.transform = '';
  }
  function toggleZoom(){
    scale = (scale > 1.1) ? 1 : 2;
    apply();
  }

  document.querySelectorAll('.gallery-grid img').forEach(el=>{
    el.style.cursor = 'zoom-in';
    el.addEventListener('click', ()=> open(el.getAttribute('data-full') || el.src, el.alt || ''));
    el.addEventListener('touchend', (e)=>{
      const now = Date.now();
      if(now - lastTap < 300){ // double-tap on thumb: open + zoom
        open(el.getAttribute('data-full') || el.src, el.alt || '');
        setTimeout(()=>{ scale = 2; apply(); }, 50);
        lastTap = 0;
        return;
      }
      lastTap = now;
      setTimeout(()=>{
        if(Date.now() - lastTap > 290) open(el.getAttribute('data-full') || el.src, el.alt || '');
      }, 300);
    }, {passive:true});
  });

  closeBtn && closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if(e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') close(); });

  // overlay interactions
  img.addEventListener('dblclick', toggleZoom);
  img.addEventListener('touchend', (e)=>{
    const now = Date.now();
    if(now - lastTap < 300){ toggleZoom(); lastTap = 0; }
    else lastTap = now;
  }, {passive:true});

  // wheel zoom
  overlay.addEventListener('wheel', e=>{
    if(!overlay.classList.contains('open')) return;
    e.preventDefault();
    scale = clamp(scale - e.deltaY*0.0015, 1, 4);
    apply();
  }, {passive:false});
})();