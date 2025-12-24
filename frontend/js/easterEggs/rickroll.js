// Rick Roll easter egg - triple click on logo
// All code uses camelCase naming convention

/**
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
  
  // Handle click event
  logoLink.addEventListener('click', (e) => {
    const now = Date.now();
    
    // Add current click time
    clickTimes.push(now);
    
    // Keep only clicks within the triple-click window
    clickTimes = clickTimes.filter(time => now - time < TRIPLE_CLICK_WINDOW);
    
    // Clear any pending navigation
    clearTimeout(navigationTimeout);
    
    // Check if this is a triple click (3 clicks within the window)
    if (clickTimes.length === 3) {
      // Verify all 3 clicks happened within the window
      const timeSpan = clickTimes[2] - clickTimes[0];
      if (timeSpan < TRIPLE_CLICK_WINDOW) {
        e.preventDefault();
        e.stopPropagation();
        clickTimes = [];
        triggerRickRoll();
        return false;
      }
    }
    
    // If link opens in new tab, don't prevent default - let browser handle it normally
    if (opensInNewTab) {
      // For new tab links, only track clicks for triple-click detection
      // Don't interfere with browser's default behavior at all
      // Clear click tracking after a delay
      navigationTimeout = setTimeout(() => {
        clickTimes = [];
      }, NAVIGATION_DELAY);
      // Don't call preventDefault() - let the browser handle opening in new tab
      // Just return without doing anything else
      return; // Allow default behavior to proceed normally
    }
    
    // For single/double clicks on same-tab links, navigate after a delay
    // This allows us to detect if more clicks are coming
    const currentClickCount = clickTimes.length;
    navigationTimeout = setTimeout(() => {
      // Only navigate if no new clicks were added (not a triple click)
      if (clickTimes.length === currentClickCount && currentClickCount < 3) {
        // Check if we're already on the target page
        const currentPath = window.location.pathname;
        const targetPath = new URL(href, window.location.href).pathname;
        
        if (currentPath === targetPath || currentPath.endsWith(targetPath)) {
          // Already on home page - scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // Navigate to home page
          window.location.href = href;
        }
        clickTimes = [];
      } else if (clickTimes.length >= 3) {
        // Was a triple click, already handled
        clickTimes = [];
      }
    }, NAVIGATION_DELAY);
    
    // Prevent default to control navigation timing (only for same-tab links)
    e.preventDefault();
  });
}

/**
 * Trigger Rick Roll overlay
 * Creates and displays the rick roll video overlay
 */
function triggerRickRoll() {
  // Create overlay
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
  
  // Create message
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
  
  // Create video container
  const videoContainer = document.createElement('div');
  videoContainer.style.position = 'relative';
  videoContainer.style.width = '90%';
  videoContainer.style.maxWidth = '800px';
  videoContainer.style.aspectRatio = '16/9';
  videoContainer.style.marginBottom = '2rem';
  videoContainer.style.opacity = '0';
  videoContainer.style.transition = 'opacity 0.5s ease-out';
  videoContainer.style.pointerEvents = 'auto';
  
  // Create YouTube iframe (short rick roll video)
  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '1rem';
  iframe.allow = 'autoplay; encrypted-media';
  iframe.allowFullscreen = true;
  iframe.style.pointerEvents = 'auto';
  
  // Create close button
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
    // Remove animation and use transition for smooth fade out
    overlay.style.animation = 'none';
    message.style.animation = 'none';
    videoContainer.style.animation = 'none';
    closeButton.style.animation = 'none';
    
    // Force reflow to ensure animation removal takes effect
    void overlay.offsetWidth;
    
    // Set opacity to 0 with transition
    overlay.style.opacity = '0';
    message.style.opacity = '0';
    videoContainer.style.opacity = '0';
    closeButton.style.opacity = '0';
    
    // Remove after transition completes
    setTimeout(() => {
      overlay.remove();
    }, 500);
  });
  
  // Assemble
  videoContainer.appendChild(iframe);
  overlay.appendChild(message);
  overlay.appendChild(videoContainer);
  overlay.appendChild(closeButton);
  
  document.body.appendChild(overlay);
  
  // Trigger fade-in after a brief delay to ensure DOM is ready
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      message.style.opacity = '1';
      videoContainer.style.opacity = '1';
      closeButton.style.opacity = '1';
    });
  });
}

