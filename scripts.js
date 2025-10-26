// ギャラリー画像クリックでライトボックス表示（data-full 使用・全画面）
document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.grid .grid-item, .gallery-grid .grid-item, .gallery .grid-item');
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    const backdrop = document.querySelector('.lightbox-backdrop');

    function lockScroll() {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
    }
    function unlockScroll() {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
    }

    function open(src, alt) {
        lbImg.src = src;
        lbImg.alt = alt || '';
        lightbox.setAttribute('aria-hidden', 'false');
        lockScroll();
        if (closeBtn) closeBtn.focus();
    }
    function close() {
        lightbox.setAttribute('aria-hidden', 'true');
        lbImg.src = '';
        unlockScroll();
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const full = btn.dataset.full || btn.getAttribute('data-full');
            const img = btn.querySelector('img');
            const src = full || (img && (img.currentSrc || img.src));
            const alt = img ? img.alt : '';
            if (!src) return;
            open(src, alt);
        });
    });

    // 閉じる動作
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);

    // ESC で閉じる
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.getAttribute('aria-hidden') === 'false') close();
    });
});

/* Fullscreen gallery open/close (uses .gallery-grid img) */
document.addEventListener('DOMContentLoaded', function () {
    const overlay = document.getElementById('gallery-fullscreen');
    const overlayImg = document.getElementById('gallery-fullscreen-img');
    const overlayCaption = document.getElementById('gallery-fullscreen-caption');
    const closeBtn = document.getElementById('gallery-fullscreen-close');

    if (!overlay || !overlayImg) return;

    const lockScroll = () => {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
    };
    const unlockScroll = () => {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
    };

    function openFullscreen(src, caption) {
        overlayImg.src = src;
        overlayImg.alt = caption || '';
        overlayCaption.textContent = caption || '';
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
        lockScroll();
        closeBtn && closeBtn.focus();
    }

    function closeFullscreen() {
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
        overlayImg.src = '';
        overlayCaption.textContent = '';
        unlockScroll();
    }

    // 画像クリックでオープン（data-full 優先）
    document.querySelectorAll('.gallery-grid img, .gallery img').forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', (e) => {
            const parent = img.closest('[data-full],[data-large]');
            const src = (parent && (parent.dataset.full || parent.dataset.large)) || img.dataset.large || img.currentSrc || img.src;
            const caption = img.dataset.caption || img.alt || '';
            // 親が a の場合、デフォルト遷移を防ぐ
            if (e.currentTarget.closest && e.currentTarget.closest('a')) e.preventDefault();
            if (src) openFullscreen(src, caption);
        });
    });

    // 閉じる操作
    closeBtn && closeBtn.addEventListener('click', closeFullscreen);
    overlay.addEventListener('click', (e) => {
        // 画像クリックは閉じないようにし、背景クリックで閉じる
        if (e.target === overlay || e.target === overlay.querySelector('.gallery-fullscreen-inner')) {
            closeFullscreen();
        }
    });

    // ESC キーで閉じる・画像クリックで閉じる（ズームアウト） 
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('open')) closeFullscreen();
    });
});

(function(){
  // create overlay (only once)
  let overlay = document.createElement('div');
  overlay.className = 'gallery-fullscreen-overlay';
  overlay.innerHTML = '<div class="gallery-fullscreen-inner"><button class="gallery-fullscreen-close" aria-label="閉じる">&times;</button><img alt=""><div class="gallery-fullscreen-caption"></div></div>';
  document.body.appendChild(overlay);

  const overlayImg = overlay.querySelector('img');
  const closeBtn = overlay.querySelector('.gallery-fullscreen-close');
  const captionEl = overlay.querySelector('.gallery-fullscreen-caption');

  function open(src, alt){
    overlayImg.style.transform = 'scale(1)';
    overlayImg.src = src || '';
    overlayImg.alt = alt || '';
    captionEl.textContent = alt || '';
    overlay.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    overlayImg.dataset.scale = '1';
  }

  function close(){
    overlay.classList.remove('open');
    overlayImg.src = '';
    captionEl.textContent = '';
    document.documentElement.style.overflow = '';
  }

  document.querySelectorAll('.gallery-grid img').forEach(img=>{
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', function(){
      const full = img.getAttribute('data-full') || img.src;
      const alt = img.getAttribute('alt') || '';
      open(full, alt);
    });
  });

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function(e){
    if(e.target === overlay) close();
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') close();
    if((e.key === '+' || e.key === '=') && overlay.classList.contains('open')) {
      const cur = parseFloat(overlayImg.dataset.scale || '1');
      const next = Math.min(cur + 0.25, 3);
      overlayImg.style.transform = 'scale(' + next + ')';
      overlayImg.dataset.scale = String(next);
    }
    if((e.key === '-' || e.key === '_') && overlay.classList.contains('open')) {
      const cur = parseFloat(overlayImg.dataset.scale || '1');
      const next = Math.max(cur - 0.25, 1);
      overlayImg.style.transform = 'scale(' + next + ')';
      overlayImg.dataset.scale = String(next);
    }
  });

  overlayImg.addEventListener('dblclick', function(){
    const cur = parseFloat(overlayImg.dataset.scale || '1');
    const next = cur > 1.1 ? 1 : 2;
    overlayImg.style.transform = 'scale(' + next + ')';
    overlayImg.dataset.scale = String(next);
  });

  overlayImg.addEventListener('touchstart', function(e){
    // tap-to-close handled by overlay background; pinch not implemented here
  }, {passive:true});
})();