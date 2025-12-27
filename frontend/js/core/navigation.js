import { globalParticleSystem } from '../ui/background.js';

export function initializeSmoothScroll() {
  function smoothScrollTo(targetElement, offset = 100) {
    if (!targetElement) return;
    
    const startY = window.pageYOffset;
    const targetY = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
    const distance = targetY - startY;
    const duration = 300;
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
  }
  
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
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
      
      smoothScrollTo(target, 100);
      
      if (link.classList.contains('navLink')) {
        document.querySelectorAll('.navLink').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    }
  });
  
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

export function initializePageTransitions() {
  const mainContent = document.querySelector('.mainContent');
  if (mainContent) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        mainContent.classList.add('page-transition-in');
      });
    });
  }
  
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (!href) return;
    
    if (link.getAttribute('target') === '_blank') {
      return;
    }
    
    if (href.startsWith('#')) return;
    
    if (href.startsWith('http://') || href.startsWith('https://')) {
      try {
        const url = new URL(href);
        if (url.origin !== window.location.origin) {
          return;
        }
      } catch (e) {
        return;
      }
    }
    
    if (link.hasAttribute('onclick')) return;
    
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
    
    const normalizePath = (path) => {
      path = path.replace(/\/$/, '');
      if (path.endsWith('/index.html') || path.endsWith('index.html')) {
        path = path.replace(/\/?index\.html$/, '') || '/';
      }
      return path;
    };
    
    const normalizedCurrent = normalizePath(currentPath);
    const normalizedTarget = normalizePath(targetPath);
    
    if (normalizedCurrent === normalizedTarget) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    e.preventDefault();
    
    if (globalParticleSystem) {
      globalParticleSystem.saveState();
    }
    
    const mainContent = document.querySelector('.mainContent');
    if (mainContent) {
      mainContent.style.opacity = '0';
      mainContent.style.transform = 'translateY(20px)';
    }
    
    setTimeout(() => {
      window.location.href = href;
    }, 300);
  });
}

