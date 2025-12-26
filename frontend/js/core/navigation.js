// Navigation functionality - smooth scroll and page transitions
// All code uses camelCase naming convention

import { globalParticleSystem } from '../ui/background.js';

/**
 * Initialize smooth scroll for navigation links
 * Handles anchor links with smooth scrolling animation
 */
export function initializeSmoothScroll() {
  // Smooth scroll function with easing - works for all anchor links
  function smoothScrollTo(targetElement, offset = 100) {
    if (!targetElement) return;
    
    const startY = window.pageYOffset;
    const targetY = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
    const distance = targetY - startY;
    const duration = 300; // 300ms for fast smooth scroll
    let startTime = null;
    
    // Easing function for smooth animation
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
        // Final position to ensure accuracy
        window.scrollTo(0, targetY);
      }
    }
    
    requestAnimationFrame(animateScroll);
  }
  
  // Handle all anchor links on the page
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    
    // Skip links with onclick handlers (they handle their own behavior)
    if (link.hasAttribute('onclick')) {
      return;
    }
    
    const href = link.getAttribute('href');
    if (!href || href === '#' || href === '#privacy' || href === '#terms') {
      return; // Skip placeholder links
    }
    
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      e.stopPropagation();
      
      // Fast smooth scroll to target
      smoothScrollTo(target, 100);
      
      // Update active nav link (only for main nav links)
      if (link.classList.contains('navLink')) {
        document.querySelectorAll('.navLink').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    }
  });
  
  // Update active nav link on scroll (only for hash links, not page links)
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.navLink');
  const observerOptions = {
    root: null,
    rootMargin: '-120px 0px -66%',
    threshold: 0
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          // Only update active state for hash links (section navigation)
          // Don't touch page navigation links - they're handled by setActiveNavLink()
          const href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
            if (link.classList.contains('navLink')) {
              link.classList.remove('active');
              if (href === `#${id}`) {
                link.classList.add('active');
              }
            }
          }
        });
      }
    });
  }, observerOptions);
  
  sections.forEach(section => observer.observe(section));
}

/**
 * Initialize page transition animations
 * Handles fade-in on page load and fade-out on navigation
 */
export function initializePageTransitions() {
  // Add fade-in animation on page load
  const mainContent = document.querySelector('.mainContent');
  if (mainContent) {
    // Small delay to ensure DOM is ready, then trigger animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        mainContent.classList.add('page-transition-in');
      });
    });
  }
  
  // Handle navigation clicks
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Skip links that open in new tab/window
    if (link.getAttribute('target') === '_blank') {
      return;
    }
    
    // Skip hash links (handled by smooth scroll)
    if (href.startsWith('#')) return;
    
    // Skip external links
    if (href.startsWith('http://') || href.startsWith('https://')) {
      // Check if it's an external link
      try {
        const url = new URL(href);
        if (url.origin !== window.location.origin) {
          return; // External link, no transition
        }
      } catch (e) {
        return; // Invalid URL
      }
    }
    
    // Skip links with onclick handlers (they handle their own behavior)
    if (link.hasAttribute('onclick')) return;
    
    // Skip if it's a form submission or special link
    if (link.getAttribute('download')) {
      return;
    }
    
    // Check if it's the same page - just scroll to top, no navigation
    const currentPath = window.location.pathname;
    let targetPath;
    try {
      targetPath = new URL(href, window.location.href).pathname;
    } catch (e) {
      return; // Invalid URL
    }
    
    // Normalize paths for comparison
    const normalizePath = (path) => {
      // Remove trailing slashes and handle index.html
      path = path.replace(/\/$/, '');
      if (path.endsWith('/index.html') || path.endsWith('index.html')) {
        path = path.replace(/\/?index\.html$/, '') || '/';
      }
      return path;
    };
    
    const normalizedCurrent = normalizePath(currentPath);
    const normalizedTarget = normalizePath(targetPath);
    
    if (normalizedCurrent === normalizedTarget) {
      // Same page - just scroll to top smoothly, no reload or animation
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Prevent default navigation
    e.preventDefault();
    
    // Save particle system state before navigation (already saved periodically, but save one more time)
    if (globalParticleSystem) {
      globalParticleSystem.saveState();
    }
    
    // Add fade-out class
    const mainContent = document.querySelector('.mainContent');
    if (mainContent) {
      mainContent.style.opacity = '0';
      mainContent.style.transform = 'translateY(20px)';
    }
    
    // Navigate after fade-out animation
    setTimeout(() => {
      window.location.href = href;
    }, 300); // Match CSS transition duration
  });
}

