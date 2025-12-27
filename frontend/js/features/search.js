
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
      const url = new URL('./pages/browse.html', window.location.href);
      url.searchParams.set('search', query);
      window.location.href = url.toString();
    } else {
      window.location.href = './pages/browse.html';
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
  
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search');
  if (searchParam) {
    browseSearchInput.value = searchParam;
  }
  
  const categoryParam = urlParams.get('category');
  if (categoryParam) {
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
      categoryFilter.value = categoryParam;
    }
  }
  
  function performBrowseSearch() {
    const query = browseSearchInput.value.trim().toLowerCase();
    filterBookmarklets();
  }
  
  browseSearchButton.addEventListener('click', performBrowseSearch);
  
  browseSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performBrowseSearch();
    }
  });
  
  let searchTimeout;
  browseSearchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performBrowseSearch, 300);
  });
  
  if (searchParam || categoryParam) {
    setTimeout(() => filterBookmarklets(), 100);
  }
}

