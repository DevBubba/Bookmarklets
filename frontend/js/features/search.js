// Search functionality for home and browse pages
// All code uses camelCase naming convention

import { filterBookmarklets } from './filters.js';

/**
 * Initialize home page search functionality
 * Links to browse page with search query
 */
export function initializeSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('homeSearchButton');
  
  if (!searchInput || !searchButton) return;
  
  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (query) {
      // Navigate to browse page with search query
      const url = new URL('./browse.html', window.location.href);
      url.searchParams.set('search', query);
      window.location.href = url.toString();
    } else {
      // Just navigate to browse page
      window.location.href = './browse.html';
    }
  }
  
  searchButton.addEventListener('click', performSearch);
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch();
    }
  });
}

/**
 * Initialize browse page search functionality
 * Handles URL parameters and real-time search
 */
export function initializeBrowseSearch() {
  const browseSearchInput = document.getElementById('browseSearchInput');
  const browseSearchButton = document.getElementById('browseSearchButton');
  
  if (!browseSearchInput || !browseSearchButton) return;
  
  // Check for search parameter in URL
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search');
  if (searchParam) {
    browseSearchInput.value = searchParam;
  }
  
  // Check for category parameter in URL
  const categoryParam = urlParams.get('category');
  if (categoryParam) {
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
      categoryFilter.value = categoryParam;
    }
  }
  
  function performBrowseSearch() {
    const query = browseSearchInput.value.trim().toLowerCase();
    // Search functionality will filter bookmarklets
    console.log('Browse search:', query);
    filterBookmarklets();
  }
  
  browseSearchButton.addEventListener('click', performBrowseSearch);
  
  browseSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performBrowseSearch();
    }
  });
  
  // Real-time search as user types
  let searchTimeout;
  browseSearchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performBrowseSearch, 300);
  });
  
  // Apply filters on page load if URL params exist
  if (searchParam || categoryParam) {
    setTimeout(() => filterBookmarklets(), 100);
  }
}

