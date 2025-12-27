 * Initialize secret animation (Rick Roll easter egg)
 * Detects triple click on logo and triggers rick roll
 */
export function initializeSecretAnimation() {
  const logoLink = document.querySelector('.logoLink');
  if (!logoLink) return;
  
  let clickTimes = [];
  let navigationTimeout;
  const href = logoLink.getAttribute('href');
  const TRIPLE_CLICK_WINDOW = 800; // 800ms window for 3 normal clicks
  const NAVIGATION_DELAY = 200; // Delay to allow triple-click detection
  const opensInNewTab = logoLink.getAttribute('target') === '_blank';
  
  logoLink.addEventListener('click', (e) => {
    const now = Date.now();
    
    e.preventDefault();
    e.stopPropagation();
    
    clickTimes.push(now);
    clickTimes = clickTimes.filter(time => now - time < TRIPLE_CLICK_WINDOW);
    clearTimeout(navigationTimeout);
    
    if (clickTimes.length === 3) {
      const timeSpan = clickTimes[2] - clickTimes[0];
      if (timeSpan < TRIPLE_CLICK_WINDOW) {
        clickTimes = [];
        triggerRickRoll();
        return false;
      }
    }
    
    const currentClickCount = clickTimes.length;
    navigationTimeout = setTimeout(() => {
      if (clickTimes.length === currentClickCount && currentClickCount < 3) {
        if (opensInNewTab) {
          window.open(href, '_blank', 'noopener,noreferrer');
        } else {
          const currentPath = window.location.pathname;
          const targetPath = new URL(href, window.location.href).pathname;
          
          if (currentPath === targetPath || currentPath.endsWith(targetPath)) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            window.location.href = href;
          }
        }
        clickTimes = [];
      } else if (clickTimes.length >= 3) {
        clickTimes = [];
      }
    }, NAVIGATION_DELAY);
    
    return false;
  });
}

function triggerRickRoll() {
  const overlay = document.createElement('div');
  overlay.id = 'rickRollOverlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
  overlay.style.zIndex = '99999';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.5s ease-out';
  overlay.style.pointerEvents = 'auto';
  
  const message = document.createElement('div');
  message.style.color = '#ffffff';
  message.style.fontSize = 'clamp(1.5rem, 4vw, 2.5rem)';
  message.style.fontWeight = '700';
  message.style.textAlign = 'center';
  message.style.marginBottom = '2rem';
  message.style.textShadow = '0 0 10px rgba(34, 197, 94, 0.5)';
  message.style.opacity = '0';
  message.style.transition = 'opacity 0.5s ease-out';
  message.style.pointerEvents = 'auto';
  message.textContent = 'you shouldn\'t have seen this';
  
  const videoContainer = document.createElement('div');
  videoContainer.style.position = 'relative';
  videoContainer.style.width = '90%';
  videoContainer.style.maxWidth = '800px';
  videoContainer.style.aspectRatio = '16/9';
  videoContainer.style.marginBottom = '2rem';
  videoContainer.style.opacity = '0';
  videoContainer.style.transition = 'opacity 0.5s ease-out';
  videoContainer.style.pointerEvents = 'auto';
  
  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '1rem';
  iframe.allow = 'autoplay; encrypted-media';
  iframe.allowFullscreen = true;
  iframe.style.pointerEvents = 'auto';
  
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.padding = '0.75rem 2rem';
  closeButton.style.backgroundColor = '#22c55e';
  closeButton.style.color = '#ffffff';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '0.5rem';
  closeButton.style.fontSize = '1.125rem';
  closeButton.style.fontWeight = '600';
  closeButton.style.cursor = 'pointer';
  closeButton.style.transition = 'background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease, opacity 0.5s ease-out';
  closeButton.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
  closeButton.style.opacity = '0';
  closeButton.style.pointerEvents = 'auto';
  closeButton.style.zIndex = '100000';
  
  closeButton.addEventListener('mouseenter', () => {
    closeButton.style.backgroundColor = '#16a34a';
    closeButton.style.transform = 'translateY(-2px)';
    closeButton.style.boxShadow = '0 6px 16px rgba(34, 197, 94, 0.4)';
  });
  
  closeButton.addEventListener('mouseleave', () => {
    closeButton.style.backgroundColor = '#22c55e';
    closeButton.style.transform = 'translateY(0)';
    closeButton.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
  });
  
  closeButton.addEventListener('click', () => {
    overlay.style.animation = 'none';
    message.style.animation = 'none';
    videoContainer.style.animation = 'none';
    closeButton.style.animation = 'none';
    
    void overlay.offsetWidth;
    
    overlay.style.opacity = '0';
    message.style.opacity = '0';
    videoContainer.style.opacity = '0';
    closeButton.style.opacity = '0';
    
    setTimeout(() => {
      overlay.remove();
    }, 500);
  });
  
  videoContainer.appendChild(iframe);
  overlay.appendChild(message);
  overlay.appendChild(videoContainer);
  overlay.appendChild(closeButton);
  
  document.body.appendChild(overlay);
  
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      message.style.opacity = '1';
      videoContainer.style.opacity = '1';
      closeButton.style.opacity = '1';
    });
  });
}

