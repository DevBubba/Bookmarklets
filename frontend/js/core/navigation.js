import { globalParticleSystem } from '../ui/background.js';

const prefetchCache = new Map();

const pathMap = {
  // Pages
  'pages/about.html': '/pages/about.html',
  'pages/browse.html': '/pages/browse.html',
  'pages/help.html': '/pages/help.html',
  'pages/contact.html': '/pages/contact.html',
  'pages/changelog.html': '/pages/changelog.html',
  './about.html': '/pages/about.html',
  './browse.html': '/pages/browse.html',
  './help.html': '/pages/help.html',
  './contact.html': '/pages/contact.html',
  './changelog.html': '/pages/changelog.html',
  '../pages/about.html': '/pages/about.html',
  '../pages/browse.html': '/pages/browse.html',
  '../pages/help.html': '/pages/help.html',
  '../pages/contact.html': '/pages/contact.html',
  '../pages/changelog.html': '/pages/changelog.html',
  
  // Forms
  'forms/request.html': '/forms/request.html',
  'forms/reportIssue.html': '/forms/reportIssue.html',
  './request.html': '/forms/request.html',
  './reportIssue.html': '/forms/reportIssue.html',
  '../forms/request.html': '/forms/request.html',
  '../forms/reportIssue.html': '/forms/reportIssue.html',
  
  // Auth
  'auth/login.html': '/auth/login.html',
  'auth/signup.html': '/auth/signup.html',
  'auth/forgotPassword.html': '/auth/forgotPassword.html',
  './login.html': '/auth/login.html',
  './signup.html': '/auth/signup.html',
  './forgotPassword.html': '/auth/forgotPassword.html',
  '../auth/login.html': '/auth/login.html',
  '../auth/signup.html': '/auth/signup.html',
  '../auth/forgotPassword.html': '/auth/forgotPassword.html',
  
  // Legal
  'legal/license.html': '/legal/license.html',
  './license.html': '/legal/license.html',
  '../legal/license.html': '/legal/license.html',
  
  // Root
  'index.html': '/index.html',
  './index.html': '/index.html',
  '../index.html': '/index.html',
  '/': '/',
  '': '/'
};

export function resolveUrl(href) {
  try {
    if (href.startsWith('http://') || href.startsWith('https://')) {
      const url = new URL(href);
      url.pathname = normalizePathname(url.pathname);
      return url.href;
    }
    
    if (href.startsWith('/')) {
      const normalized = normalizePathname(href);
      return window.location.origin + normalized;
    }
    
    if (pathMap[href]) {
      const mappedPath = normalizePathname(pathMap[href]);
      return window.location.origin + mappedPath;
    }
    
    const cleanHref = href.replace(/^\.+\//, '');
    if (pathMap[cleanHref]) {
      const mappedPath = normalizePathname(pathMap[cleanHref]);
      return window.location.origin + mappedPath;
    }
    
    const pathParts = cleanHref.split('/');
    if (pathParts.length >= 2) {
      const dirAndFile = pathParts.slice(-2).join('/');
      if (pathMap[dirAndFile]) {
        const mappedPath = normalizePathname(pathMap[dirAndFile]);
        return window.location.origin + mappedPath;
      }
    }
    
    const currentUrl = new URL(window.location.href);
    let currentPath = normalizePathname(currentUrl.pathname);
    
    if (currentPath !== currentUrl.pathname) {
      if (window.history.replaceState) {
        window.history.replaceState(
          window.history.state,
          '',
          currentPath + currentUrl.search + currentUrl.hash
        );
      }
    }
    
    const cleanBaseUrl = window.location.origin + currentPath;
    const resolvedUrl = new URL(href, cleanBaseUrl);
    resolvedUrl.pathname = normalizePathname(resolvedUrl.pathname);
    
    return resolvedUrl.href;
  } catch (e) {
    console.warn('URL resolution error:', e, 'for href:', href);
    try {
      const rootUrl = window.location.origin + '/';
      const fallbackUrl = new URL(href, rootUrl);
      fallbackUrl.pathname = normalizePathname(fallbackUrl.pathname);
      return fallbackUrl.href;
    } catch (e2) {
      return window.location.origin + normalizePathname(href);
    }
  }
}

function normalizePathname(pathname) {
  if (!pathname) return '/';
  
  let normalized = pathname.replace(/\/+/g, '/');
  let segments = normalized.split('/').filter(seg => seg !== '' && seg !== '.');
  
  const deduplicated = [];
  for (let i = 0; i < segments.length; i++) {
    if (i === 0 || segments[i] !== segments[i - 1]) {
      deduplicated.push(segments[i]);
    }
  }
  
  const cleaned = [];
  for (let i = 0; i < deduplicated.length; i++) {
    if (i >= 4) {
      const pattern1 = deduplicated.slice(i - 4, i - 2).join('/');
      const pattern2 = deduplicated.slice(i - 2, i).join('/');
      const pattern3 = deduplicated.slice(i, i + 2).join('/');
      
      if (pattern1 === pattern2 && pattern2 === pattern3) {
        i += 1;
        continue;
      }
    }
    
    if (i >= 4) {
      const prev2 = deduplicated.slice(i - 2, i).join('/');
      const next2 = deduplicated.slice(i, i + 2).join('/');
      if (prev2 === next2) {
        i += 1;
        continue;
      }
    }
    
    cleaned.push(deduplicated[i]);
  }
  
  normalized = '/' + cleaned.join('/');
  
  if (normalized !== '/' && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  
  return normalized;
}

function prefetchPage(href) {
  if (prefetchCache.has(href)) return;
  
  const absoluteHref = resolveUrl(href);
  fetch(absoluteHref)
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const mainContent = doc.querySelector('.mainContent');
      const header = doc.querySelector('.siteHeader');
      if (mainContent) {
        prefetchCache.set(href, {
          mainContent: mainContent.innerHTML,
          header: header ? header.innerHTML : null,
          title: doc.title
        });
      }
    })
    .catch(() => {});
}

async function navigateToPage(href) {
  try {
    if (globalParticleSystem && globalParticleSystem.canvas) {
      const canvas = globalParticleSystem.canvas;
      canvas.style.display = 'block';
      canvas.style.visibility = 'visible';
      canvas.style.opacity = '1';
    }
    
    const absoluteHref = resolveUrl(href);
    let cachedContent = prefetchCache.get(href);
    let newMainContentHTML, newHeaderHTML, newTitle;
    
    if (cachedContent) {
      newMainContentHTML = cachedContent.mainContent;
      newHeaderHTML = cachedContent.header;
      newTitle = cachedContent.title;
    } else {
      const response = await fetch(absoluteHref);
      if (!response.ok) {
        window.location.href = absoluteHref;
        return;
      }
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const newMainContent = doc.querySelector('.mainContent');
      const newHeader = doc.querySelector('.siteHeader');
      if (!newMainContent) {
        window.location.href = absoluteHref;
        return;
      }
      
      newMainContentHTML = newMainContent.innerHTML;
      newHeaderHTML = newHeader ? newHeader.innerHTML : null;
      newTitle = doc.title;
      
      prefetchCache.set(href, {
        mainContent: newMainContentHTML,
        header: newHeaderHTML,
        title: newTitle
      });
    }
    
    if (newTitle) {
      document.title = newTitle;
    }
    
    if (newHeaderHTML) {
      const currentHeader = document.querySelector('.siteHeader');
      if (currentHeader) {
        const tempHeader = document.createElement('div');
        tempHeader.innerHTML = newHeaderHTML;
        const newNavLinks = tempHeader.querySelectorAll('.navLink');
        const currentNavLinks = currentHeader.querySelectorAll('.navLink');
        newNavLinks.forEach((newLink, index) => {
          if (index < currentNavLinks.length) {
            const currentLink = currentNavLinks[index];
            if (newLink.classList.contains('active')) {
              currentLink.classList.add('active');
            } else {
              currentLink.classList.remove('active');
            }
          }
        });
      }
    }
    
    const urlObj = new URL(absoluteHref);
    const finalPathname = normalizePathname(urlObj.pathname);
    window.history.pushState({}, '', finalPathname + urlObj.search + urlObj.hash);
    
    const mainContent = document.querySelector('.mainContent');
    if (!mainContent || !newMainContentHTML) return;
    
    const normalizePathForComparison = (path) => {
      if (!path) return '';
      if (path.startsWith('#')) return '';
      if (path.startsWith('http://') || path.startsWith('https://')) {
        try {
          const url = new URL(path);
          if (url.origin !== window.location.origin) return '';
          path = url.pathname;
        } catch {
          return '';
        }
      }
      
      try {
        const resolved = resolveUrl(path);
        const url = new URL(resolved);
        let normalized = url.pathname.replace(/\/$/, '');
        if (normalized.endsWith('/index.html') || normalized.endsWith('index.html')) {
          normalized = normalized.replace(/\/?index\.html$/, '') || '/';
        }
        return normalized;
      } catch {
        return '';
      }
    };
    
    const normalizedCurrentPath = normalizePathForComparison(finalPathname);
    const navLinksToUpdate = Array.from(document.querySelectorAll('.navLink')).map(link => {
      const linkHref = link.getAttribute('href');
      if (!linkHref) return { element: link, shouldBeActive: false };
      
      const normalizedLinkPath = normalizePathForComparison(linkHref);
      const shouldBeActive = normalizedLinkPath === normalizedCurrentPath && normalizedLinkPath !== '';
      
      return { element: link, shouldBeActive };
    });
    
    const hiddenContainer = document.createElement('div');
    hiddenContainer.style.position = 'absolute';
    hiddenContainer.style.visibility = 'hidden';
    hiddenContainer.style.opacity = '0';
    hiddenContainer.style.pointerEvents = 'none';
    hiddenContainer.style.top = '-9999px';
    hiddenContainer.style.left = '-9999px';
    hiddenContainer.innerHTML = newMainContentHTML;
    document.body.appendChild(hiddenContainer);
    void hiddenContainer.offsetHeight;
    
    const originalTransition = mainContent.style.transition;
    mainContent.style.transition = 'none';
    mainContent.style.willChange = 'contents';
    
    const isHomePage = absoluteHref.includes('index.html') || absoluteHref.endsWith('/') || finalPathname === '/' || finalPathname.endsWith('/index.html');
    
    mainContent.innerHTML = newMainContentHTML;
    mainContent.style.opacity = '1';
    mainContent.style.visibility = 'visible';
    mainContent.style.willChange = 'auto';
    document.body.removeChild(hiddenContainer);
    
    if (!isHomePage) {
      const heroTitle = mainContent.querySelector('.aboutHeroTitle, .authHeroTitle, h1:first-of-type');
      const heroSubtitle = mainContent.querySelector('.aboutHeroSubtitle, .authHeroSubtitle');
      const sections = mainContent.querySelectorAll('.section');
      
      if (heroTitle) {
        heroTitle.style.opacity = '0';
      }
      if (heroSubtitle) {
        heroSubtitle.style.opacity = '0';
      }
      sections.forEach(section => {
        section.style.opacity = '0';
      });
    }
    
    window.scrollTo({ top: 0, behavior: 'instant' });
    navLinksToUpdate.forEach(({ element, shouldBeActive }) => {
      if (shouldBeActive) {
        element.classList.add('active');
      } else {
        element.classList.remove('active');
      }
    });
    
    requestAnimationFrame(() => {
      mainContent.style.transition = originalTransition;
      window.dispatchEvent(new CustomEvent('pageChanged', { detail: { href } }));
      
      import('../ui/header.js').then(({ setActiveNavLink }) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setActiveNavLink();
          });
        });
      }).catch(() => {});
    });
  } catch (error) {
    console.warn('SPA navigation failed, using full reload:', error);
    window.location.href = href;
  }
}

window.addEventListener('popstate', () => {
  const normalizedPath = normalizePathname(window.location.pathname);
  const fullPath = normalizedPath + window.location.search + window.location.hash;
  navigateToPage(fullPath);
});

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
      return;
    }
    
    const targetId = href.substring(1);
    const target = targetId ? document.getElementById(targetId) : null;
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
    mainContent.style.opacity = '1';
    mainContent.style.transform = 'translateY(0)';
    mainContent.classList.add('page-transition-in');
  }
  
  document.addEventListener('mouseenter', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || link.getAttribute('target') === '_blank') return;
    
    if (href.startsWith('http://') || href.startsWith('https://')) {
      try {
        const url = new URL(href);
        if (url.origin !== window.location.origin) return;
      } catch {
        return;
      }
    }
    
    prefetchPage(href);
  }, true);
  
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
    navigateToPage(href);
  });
}

