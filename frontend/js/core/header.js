// Header functionality - scroll behavior and dropdown menus
// All code uses camelCase naming convention

/**
 * Initialize header scroll behavior
 * Adds 'scrolled' class when user scrolls past 50px
 * Also sets active navigation link based on current page
 */
export function initializeHeader() {
  const siteHeader = document.getElementById('siteHeader');
  if (!siteHeader) return;
  
  // Set active navigation link based on current page
  setActiveNavLink();
  
  let ticking = false;

  function handleScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 50) {
          siteHeader.classList.add('scrolled');
        } else {
          siteHeader.classList.remove('scrolled');
        }
        
        ticking = false;
      });
      
      ticking = true;
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
}

/**
 * Set the active navigation link based on current page URL
 * Exported so it can be called after page transitions
 */
export function setActiveNavLink() {
  const navLinks = document.querySelectorAll('.navLink');
  if (!navLinks.length) return;
  
  // Get current page path
  const currentPath = window.location.pathname;
  
  // Normalize path for comparison
  const normalizePath = (path) => {
    // Remove trailing slashes and handle index.html
    path = path.replace(/\/$/, '');
    if (path.endsWith('/index.html') || path.endsWith('index.html')) {
      path = path.replace(/\/?index\.html$/, '') || '/';
    }
    return path;
  };
  
  const normalizedCurrent = normalizePath(currentPath);
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Skip hash links
    if (href.startsWith('#')) return;
    
    // Skip external links
    if (href.startsWith('http://') || href.startsWith('https://')) {
      return;
    }
    
    // Get target path
    let targetPath;
    try {
      targetPath = new URL(href, window.location.href).pathname;
    } catch (e) {
      return;
    }
    
    const normalizedTarget = normalizePath(targetPath);
    
    // Set active if paths match
    if (normalizedCurrent === normalizedTarget) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Initialize dropdown menu functionality
 * Closes dropdowns when clicking outside
 */
export function initializeDropdowns() {
  // Close dropdowns when clicking outside
  document.addEventListener('click', function(event) {
    const dropdowns = document.querySelectorAll('.navDropdown');
    dropdowns.forEach(dropdown => {
      if (!dropdown.contains(event.target)) {
        dropdown.classList.remove('active');
      }
    });
  });
}

/**
 * Toggle dropdown function (called from HTML)
 * @param {string} dropdownId - ID of the dropdown to toggle
 */
window.toggleDropdown = function(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  if (dropdown) {
    // Close all other dropdowns
    document.querySelectorAll('.navDropdown').forEach(dd => {
      if (dd.id !== dropdownId) {
        dd.classList.remove('active');
      }
    });
    // Toggle the clicked dropdown
    dropdown.classList.toggle('active');
  }
};

