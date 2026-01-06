import { initializeSmoothScroll, initializePageTransitions } from './core/navigation.js';
import { initializeHeader, initializeDropdowns } from './ui/header.js';
import { initializeBackgroundAnimation } from './ui/background.js';
import { initializeStats, updateStat } from './ui/stats.js';
import { initializeFeaturedCarousel } from './ui/featuredCarousel.js';
import { initializeScrollArrow } from './ui/scrollArrow.js';
import { initializeTypewriter } from './ui/typewriter.js';
import { initializeSearch, initializeBrowseSearch } from './features/search.js';
import { initializeFilters, filterBookmarklets } from './features/filters.js';
import { initializeCategories } from './features/categories.js';
import { initializeChangelog } from './features/changelog.js';
import { initializeGitHubStats, updateGitHubStat } from './api/github.js';
import { initializeSecretAnimation } from './easterEggs/rickroll.js';
import { initializePageLoadAnimation, resetPageLoadAnimation } from './ui/pageLoadAnimation.js';
import { initializeCustomScrollbar } from './ui/customScrollbar.js';

export { updateStat } from './ui/stats.js';
export { filterBookmarklets } from './features/filters.js';
export { animateNumber } from './utils/animations.js';
export { updateGitHubStat } from './api/github.js';

async function initializeApp() {
  try {
    initializeBackgroundAnimation();
    initializeHeader();
    initializeCustomScrollbar();
    initializePageTransitions();
    initializeStats();
    initializeSearch();
    initializeBrowseSearch();
    initializeFilters();
    initializeCategories();
    initializeSmoothScroll();
    initializeSecretAnimation();
    initializeDropdowns();
    initializeFeaturedCarousel();
    initializeScrollArrow();
    initializeTypewriter();
    
    requestAnimationFrame(() => {
      initializePageLoadAnimation();
    });
    
    Promise.all([
      initializeGitHubStats(),
      initializeChangelog()
    ]).catch(err => console.warn('Async initialization warning:', err));
  } catch (error) {
    console.error('Error in initializeApp:', error);
    throw error;
  }
}

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'auto';
}

let scrollPositionSaved = false;
window.addEventListener('beforeunload', () => {
  const scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
  if (scrollPos > 0) {
    sessionStorage.setItem('scrollPosition', scrollPos.toString());
    scrollPositionSaved = true;
  }
});

const navigationEntry = performance.getEntriesByType('navigation')[0];
const isReload = navigationEntry && (navigationEntry.type === 'reload' || navigationEntry.type === 'back_forward');

if (isReload) {
  window.addEventListener('load', () => {
    const savedScrollPosition = sessionStorage.getItem('scrollPosition');
    if (savedScrollPosition) {
      const scrollPos = parseInt(savedScrollPosition, 10);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({
            top: scrollPos,
            behavior: 'auto'
          });
          sessionStorage.removeItem('scrollPosition');
        });
      });
    }
  }, { once: true });
}

let userHasScrolled = false;
let scrollCheckInterval = null;

function detectUserScroll() {
  if (!userHasScrolled) {
    userHasScrolled = true;
    if (scrollCheckInterval) {
      clearInterval(scrollCheckInterval);
      scrollCheckInterval = null;
    }
  }
}

window.addEventListener('scroll', detectUserScroll, { passive: true, once: false });
window.addEventListener('wheel', detectUserScroll, { passive: true, once: false });
window.addEventListener('touchmove', detectUserScroll, { passive: true, once: false });
document.addEventListener('keydown', function(e) {
  if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Space'].includes(e.key)) {
    detectUserScroll();
  }
}, { once: false });

function preventOverscroll() {
  if (userHasScrolled) return;
  
  if (window.scrollY < 0 || document.documentElement.scrollTop < 0 || document.body.scrollTop < 0) {
    if (document.documentElement.scrollTop < 0) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body.scrollTop < 0) {
      document.body.scrollTop = 0;
    }
  }
}

window.addEventListener('scroll', preventOverscroll, { passive: true });

function initApp() {
  try {
    initializeApp();
  } catch (error) {
    console.error('Error initializing app:', error);
    console.error('Error stack:', error.stack);
  }
}

function normalizeCurrentUrl() {
  const currentPath = normalizePathname(window.location.pathname);
  if (currentPath !== window.location.pathname) {
    window.history.replaceState(
      window.history.state,
      '',
      currentPath + window.location.search + window.location.hash
    );
  }
}

function normalizePathname(pathname) {
  if (!pathname) return '/';
  let normalized = pathname.replace(/\/+/g, '/');
  const segments = normalized.split('/').filter(seg => seg !== '' && seg !== '.');
  const uniqueSegments = [];
  for (let i = 0; i < segments.length; i++) {
    if (i === 0 || segments[i] !== segments[i - 1]) {
      uniqueSegments.push(segments[i]);
    }
  }
  normalized = '/' + uniqueSegments.join('/');
  if (normalized !== '/' && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  return normalized;
}

normalizeCurrentUrl();

document.addEventListener('DOMContentLoaded', initApp);

window.addEventListener('pageChanged', async (e) => {
  try {
    const { initializeStats } = await import('./ui/stats.js');
    const { initializeFeaturedCarousel } = await import('./ui/featuredCarousel.js');
    const { initializeScrollArrow } = await import('./ui/scrollArrow.js');
    const { initializeTypewriter } = await import('./ui/typewriter.js');
    const { initializeSearch, initializeBrowseSearch } = await import('./features/search.js');
    const { initializeFilters } = await import('./features/filters.js');
    const { initializeCategories } = await import('./features/categories.js');
    const { initializeChangelog } = await import('./features/changelog.js');
    const { initializeGitHubStats } = await import('./api/github.js');
    
    const currentPath = window.location.pathname;
    const isHomePage = currentPath.includes('index.html') || currentPath === '/' || currentPath.endsWith('/');
    const isBrowsePage = currentPath.includes('browse');
    
    if (isHomePage || isBrowsePage) {
      initializeSearch();
      initializeBrowseSearch();
      initializeFilters();
      initializeCategories();
      
      await Promise.all([
        initializeGitHubStats(),
        initializeChangelog()
      ]);
      
      if (isHomePage) {
        const mainContent = document.querySelector('.mainContent');
        if (mainContent) {
          mainContent.style.opacity = '1';
          mainContent.style.visibility = 'visible';
        }
      }
      
      requestAnimationFrame(() => {
        if (isHomePage) {
          initializeStats();
          initializeFeaturedCarousel();
          initializeScrollArrow();
          initializeTypewriter();
        } else {
          resetPageLoadAnimation();
        }
      });
    } else {
      initializeSearch();
      initializeBrowseSearch();
      initializeFilters();
      initializeCategories();
      
      await Promise.all([
        initializeGitHubStats(),
        initializeChangelog()
      ]);
      
      requestAnimationFrame(() => {
        initializeStats();
        initializeFeaturedCarousel();
        initializeScrollArrow();
        initializeTypewriter();
        resetPageLoadAnimation();
        
        import('./ui/header.js').then(({ setActiveNavLink }) => {
          requestAnimationFrame(() => {
            setActiveNavLink();
          });
        });
      });
    }
  } catch (error) {
    console.error('Error reinitializing page features:', error);
  }
});

window.addEventListener('load', () => {
  if (window.updateLatestCommitLinks) {
    setTimeout(() => {
      window.updateLatestCommitLinks();
    }, 500);
  }
});
