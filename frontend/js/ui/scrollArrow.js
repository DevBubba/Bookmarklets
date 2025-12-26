// Scroll Down Arrow functionality
// All code uses camelCase naming convention

/**
 * Initialize scroll down arrow
 * Handles click to scroll and hide/show on scroll
 */
export function initializeScrollArrow() {
  const scrollArrow = document.getElementById('scrollDownArrow');
  if (!scrollArrow) return;

  const nextSection = document.querySelector('.featuredBookmarklets');
  if (!nextSection) return;

  // Scroll to next section on click
  scrollArrow.addEventListener('click', () => {
    const targetY = nextSection.getBoundingClientRect().top + window.pageYOffset - 80; // Account for header
    
    // Smooth scroll
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    const duration = 600;
    let startTime = null;

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animateScroll(currentTime) {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const ease = easeInOutCubic(progress);
      const currentY = startY + distance * ease;
      
      window.scrollTo(0, currentY);
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        window.scrollTo(0, targetY);
      }
    }

    requestAnimationFrame(animateScroll);
  });

  // Hide arrow when scrolled down
  let lastScrollTop = 0;
  function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
      scrollArrow.classList.add('hidden');
    } else {
      scrollArrow.classList.remove('hidden');
    }
    
    lastScrollTop = scrollTop;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check
}

