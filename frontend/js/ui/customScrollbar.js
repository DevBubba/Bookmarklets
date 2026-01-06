export function initializeCustomScrollbar() {
  if (document.getElementById('customScrollbar')) {
    return;
  }

  const scrollbarContainer = document.createElement('div');
  scrollbarContainer.id = 'customScrollbar';
  scrollbarContainer.className = 'customScrollbar';
  
  const track = document.createElement('div');
  track.className = 'customScrollbarTrack';
  
  const thumb = document.createElement('div');
  thumb.className = 'customScrollbarThumb';
  
  track.appendChild(thumb);
  scrollbarContainer.appendChild(track);
  document.body.appendChild(scrollbarContainer);
  
  let isDragging = false;
  let startY = 0;
  let startScrollTop = 0;
  let startThumbTop = 0;
  let visibleTrackHeight = 0;
  
  let cachedHeader = null;
  let cachedFooter = null;
  let cachedHeaderHeight = 64;
  let lastWindowHeight = 0;
  let lastDocumentHeight = 0;
  
  function updateScrollbar() {
    if (!cachedHeader) {
      cachedHeader = document.querySelector('.siteHeader');
      if (cachedHeader) {
        cachedHeaderHeight = cachedHeader.offsetHeight;
      }
    }
    if (!cachedFooter) {
      cachedFooter = document.querySelector('.siteFooter');
    }
    
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (windowHeight !== lastWindowHeight) {
      if (cachedHeader) {
        cachedHeaderHeight = cachedHeader.offsetHeight;
      }
      lastWindowHeight = windowHeight;
    }
    
    const headerSpacing = 8;
    const availableHeight = windowHeight - cachedHeaderHeight - headerSpacing;
    const finalHeight = Math.max(0, availableHeight);
    
    const currentTop = `${cachedHeaderHeight + headerSpacing}px`;
    if (scrollbarContainer.style.top !== currentTop) {
      scrollbarContainer.style.top = currentTop;
    }
    if (scrollbarContainer.style.height !== `${finalHeight}px`) {
      scrollbarContainer.style.height = `${finalHeight}px`;
      scrollbarContainer.style.maxHeight = `${finalHeight}px`;
      scrollbarContainer.style.minHeight = `${finalHeight}px`;
    }
    
    let clipBottom = null;
    if (cachedFooter) {
      const footerRect = cachedFooter.getBoundingClientRect();
      const footerTop = footerRect.top;
      
      if (footerTop < windowHeight && footerTop > (cachedHeaderHeight + headerSpacing)) {
        const scrollbarTop = cachedHeaderHeight + headerSpacing;
        const clipPosition = footerTop - headerSpacing - scrollbarTop;
        clipBottom = clipPosition;
      }
    }
    lastDocumentHeight = documentHeight;
    
    if (clipBottom !== null && clipBottom > 0 && clipBottom < finalHeight) {
      const clipAmount = finalHeight - clipBottom;
      scrollbarContainer.style.clipPath = `inset(0 0 ${clipAmount}px 0)`;
      scrollbarContainer.style.overflow = 'hidden';
    } else {
      if (scrollbarContainer.style.clipPath !== 'none') {
        scrollbarContainer.style.clipPath = 'none';
        scrollbarContainer.style.overflow = 'visible';
      }
    }
    
    const thumbHeight = Math.max(30, (finalHeight / documentHeight) * finalHeight);
    const visibleHeight = clipBottom !== null && clipBottom > 0 && clipBottom < finalHeight ? clipBottom : finalHeight;
    const maxThumbTop = Math.max(0, visibleHeight - thumbHeight);
    const maxScroll = documentHeight - windowHeight;
    const thumbTop = maxScroll > 0 ? (scrollTop / maxScroll) * maxThumbTop : 0;
    const clampedThumbTop = Math.min(thumbTop, maxThumbTop);
    
    thumb.style.transition = 'none';
    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translateY(${clampedThumbTop}px)`;
    thumb.style.top = '0';
    
    if (documentHeight <= windowHeight) {
      scrollbarContainer.style.opacity = '0';
      scrollbarContainer.style.pointerEvents = 'none';
    } else {
      scrollbarContainer.style.pointerEvents = 'none';
      const currentOpacity = parseFloat(scrollbarContainer.style.opacity) || 0;
      if (currentOpacity === 0) {
        scrollbarContainer.style.opacity = '1';
        isInactive = false;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          scrollbarContainer.style.opacity = '0.3';
          isInactive = true;
        }, INACTIVITY_DELAY);
      }
    }
  }
  
  thumb.style.cursor = 'default';
  thumb.style.pointerEvents = 'none';
  track.style.cursor = 'default';
  
  let scrollTimeout;
  let mouseMoveTimeout;
  let lastScrollTop = 0;
  const INACTIVITY_DELAY = 5000;
  
  let isInactive = false;
  
  function showScrollbar() {
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    if (documentHeight <= windowHeight) {
      return;
    }
    
    scrollbarContainer.style.opacity = '1';
    isInactive = false;
    clearTimeout(scrollTimeout);
    clearTimeout(mouseMoveTimeout);
    scrollTimeout = setTimeout(() => {
      scrollbarContainer.style.opacity = '0.3';
      isInactive = true;
    }, INACTIVITY_DELAY);
  }
  
  function hideScrollbar() {
    clearTimeout(scrollTimeout);
    clearTimeout(mouseMoveTimeout);
    scrollbarContainer.style.opacity = '0.3';
    isInactive = true;
  }
  
  let lastFullUpdate = 0;
  
  window.addEventListener('scroll', () => {
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const now = performance.now();
    
    showScrollbar();
    
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const maxScroll = documentHeight - windowHeight;
    
    if (maxScroll > 0) {
      const headerSpacing = 8;
      const availableHeight = windowHeight - cachedHeaderHeight - headerSpacing;
      const finalHeight = Math.max(0, availableHeight);
      
      let visibleHeight = finalHeight;
      if (cachedFooter) {
        const footerRect = cachedFooter.getBoundingClientRect();
        const footerTop = footerRect.top;
        if (footerTop < windowHeight && footerTop > (cachedHeaderHeight + headerSpacing)) {
          const scrollbarTop = cachedHeaderHeight + headerSpacing;
          visibleHeight = footerTop - headerSpacing - scrollbarTop;
        }
      }
      
      const thumbHeight = Math.max(30, (finalHeight / documentHeight) * finalHeight);
      const maxThumbTop = Math.max(0, visibleHeight - thumbHeight);
      const thumbTop = (currentScrollTop / maxScroll) * maxThumbTop;
      const clampedThumbTop = Math.min(thumbTop, maxThumbTop);
      
      thumb.style.transition = 'none';
      thumb.style.transform = `translateY(${clampedThumbTop}px)`;
      
      if (now - lastFullUpdate > 100) {
        updateScrollbar();
        lastFullUpdate = now;
      }
    }
    
    lastScrollTop = currentScrollTop;
  }, { passive: true });
  
  let lastMouseMoveTime = 0;
  document.addEventListener('mousemove', () => {
    const now = Date.now();
    if (now - lastMouseMoveTime > 200) {
      showScrollbar();
      lastMouseMoveTime = now;
    }
  }, { passive: true });
  
  document.addEventListener('wheel', () => {
    showScrollbar();
  }, { passive: true });
  
  document.addEventListener('touchmove', () => {
    showScrollbar();
  }, { passive: true });
  
  window.addEventListener('resize', updateScrollbar, { passive: true });
  
  window.addEventListener('pageChanged', () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        updateScrollbar();
        scrollbarContainer.classList.remove('scrollbarLoaded');
        void scrollbarContainer.offsetHeight;
        setTimeout(() => {
          requestAnimationFrame(() => {
            scrollbarContainer.classList.add('scrollbarLoaded');
            showScrollbar();
          });
        }, 10);
      });
    });
  });
  
  const observer = new MutationObserver(() => {
    updateScrollbar();
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false
  });
  
  updateScrollbar();
  
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scrollbarContainer.classList.remove('scrollbarLoaded');
      void scrollbarContainer.offsetHeight;
      scrollbarContainer.classList.add('scrollbarLoaded');
      showScrollbar();
    });
  });
  
  document.addEventListener('keydown', (e) => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', 'Space'].includes(e.key)) {
      showScrollbar();
    }
  }, { passive: true });
  
  document.documentElement.classList.add('customScrollbarActive');
}

