// Main JavaScript entry point for DevBubba's Bookmarklet Collection
// All code uses camelCase naming convention

// Core modules
import { initializeSmoothScroll, initializePageTransitions } from './core/navigation.js';

// UI components
import { initializeHeader, initializeDropdowns } from './ui/header.js';
import { initializeBackgroundAnimation } from './ui/background.js';
import { initializeStats, updateStat } from './ui/stats.js';
import { initializeFeaturedCarousel } from './ui/featuredCarousel.js';
import { initializeScrollArrow } from './ui/scrollArrow.js';
import { initializeTypewriter } from './ui/typewriter.js';

// Feature modules
import { initializeSearch, initializeBrowseSearch } from './features/search.js';
import { initializeFilters, filterBookmarklets } from './features/filters.js';
import { initializeCategories } from './features/categories.js';
import { initializeChangelog } from './features/changelog.js';

// API modules
import { initializeGitHubStats, updateGitHubStat } from './api/github.js';

// Easter eggs
import { initializeSecretAnimation } from './easterEggs/rickroll.js';

// Utils (exported for use in other modules)
export { updateStat } from './ui/stats.js';
export { filterBookmarklets } from './features/filters.js';
export { animateNumber } from './utils/animations.js';
export { updateGitHubStat } from './api/github.js';

/**
 * Main initialization function
 * Initializes all app features
 */
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

// Prevent scroll restoration and force scroll to top
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Track if user has manually scrolled (set up early)
let userHasScrolled = false;
let scrollCheckInterval = null;

// Detect user-initiated scrolling - set up immediately
function detectUserScroll() {
  if (!userHasScrolled) {
    userHasScrolled = true;
    // Stop the scroll check interval if user is scrolling
    if (scrollCheckInterval) {
      clearInterval(scrollCheckInterval);
      scrollCheckInterval = null;
    }
  }
}

// Set up user scroll detection immediately
window.addEventListener('scroll', detectUserScroll, { passive: true, once: false });
window.addEventListener('wheel', detectUserScroll, { passive: true, once: false });
window.addEventListener('touchmove', detectUserScroll, { passive: true, once: false });
document.addEventListener('keydown', function(e) {
  if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Space'].includes(e.key)) {
    detectUserScroll();
  }
}, { once: false });

// Prevent scrolling above the top (only prevent negative scroll, don't force to 0)
function preventOverscroll() {
  // Don't interfere at all if user has scrolled - let them scroll freely
  if (userHasScrolled) return;
  
  // Only prevent negative scroll values (overscroll bounce), don't force scroll to 0
  // This only prevents scrolling above the top, not forcing scroll to top
  if (window.scrollY < 0 || document.documentElement.scrollTop < 0 || document.body.scrollTop < 0) {
    // Only reset negative values, don't touch positive scroll positions
    if (document.documentElement.scrollTop < 0) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body.scrollTop < 0) {
      document.body.scrollTop = 0;
    }
  }
}

// Don't force scroll to top here - wait for DOMContentLoaded
// This prevents interfering with user scrolling during page load

// Scroll to top on page load/reload
window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
});

// Prevent overscroll on scroll events
window.addEventListener('scroll', preventOverscroll, { passive: true });

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Don't force scroll to top - let the browser handle it naturally
  // User can scroll immediately without interference
  
  initializeApp();
});

// Also ensure commit links are updated after page fully loads
window.addEventListener('load', () => {
  // Don't force scroll to top on load - user may have already scrolled
  // Only prevent automatic scroll restoration, not user scrolling
  
  if (window.updateLatestCommitLinks) {
    setTimeout(() => {
      window.updateLatestCommitLinks();
    }, 500);
  }
});
