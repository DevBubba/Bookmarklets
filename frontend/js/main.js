// Main JavaScript entry point for DevBubba's Bookmarklet Collection
// All code uses camelCase naming convention

// Core modules
import { initializeHeader, initializeDropdowns } from './core/header.js';
import { initializeBackgroundAnimation } from './core/background.js';
import { initializeSmoothScroll, initializePageTransitions } from './core/navigation.js';

// Feature modules
import { initializeSearch, initializeBrowseSearch } from './features/search.js';
import { initializeFilters, filterBookmarklets } from './features/filters.js';
import { initializeCategories } from './features/categories.js';
import { initializeStats, updateStat } from './features/stats.js';
import { initializeChangelog } from './features/changelog.js';

// API modules
import { initializeGitHubStats, updateGitHubStat } from './api/github.js';

// Easter eggs
import { initializeSecretAnimation } from './easterEggs/rickroll.js';

// Utils (exported for use in other modules)
export { updateStat } from './features/stats.js';
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
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

// Also ensure commit links are updated after page fully loads
window.addEventListener('load', () => {
  if (window.updateLatestCommitLinks) {
    setTimeout(() => {
      window.updateLatestCommitLinks();
    }, 500);
  }
});
