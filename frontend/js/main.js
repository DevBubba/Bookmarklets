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

export { updateStat } from './ui/stats.js';
export { filterBookmarklets } from './features/filters.js';
export { animateNumber } from './utils/animations.js';
export { updateGitHubStat } from './api/github.js';

function initializeApp() {
  initializeHeader();
  initializeBackgroundAnimation();
  initializeStats();
  initializeSearch();
  initializeBrowseSearch();
  initializeFilters();
  initializeCategories();
  initializeGitHubStats();
  initializeSmoothScroll();
  initializeSecretAnimation();
  initializeDropdowns();
  initializePageTransitions();
  initializeChangelog();
  initializeFeaturedCarousel();
  initializeScrollArrow();
  initializeTypewriter();
}

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
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

window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
});

window.addEventListener('scroll', preventOverscroll, { passive: true });

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

window.addEventListener('load', () => {
  if (window.updateLatestCommitLinks) {
    setTimeout(() => {
      window.updateLatestCommitLinks();
    }, 500);
  }
});
