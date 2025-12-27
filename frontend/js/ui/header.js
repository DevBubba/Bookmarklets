 * Initialize header scroll behavior
 * Adds 'scrolled' class when user scrolls past 50px
 * Also sets active navigation link based on current page
 */
export function initializeHeader() {
  const siteHeader = document.getElementById('siteHeader');
  if (!siteHeader) return;
  
  setActiveNavLink();
  
  function updateHeaderState() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > 50) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  }
  
  updateHeaderState();
  
  let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
  let ticking = false;

  function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (!ticking || Math.abs(scrollTop - lastScrollTop) > 10) {
      updateHeaderState();
      lastScrollTop = scrollTop;
      ticking = false;
    }
    
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateHeaderState();
        lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  
  window.addEventListener('resize', updateHeaderState, { passive: true });
}

/**
 * Set the active navigation link based on current page URL
 * Exported so it can be called after page transitions
 */
export function setActiveNavLink() {
  const navLinks = document.querySelectorAll('.navLink');
  if (!navLinks.length) return;
  
  const currentPath = window.location.pathname;
  
  const normalizePath = (path) => {
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
    
    if (href.startsWith('#')) return;
    
    if (href.startsWith('http://') || href.startsWith('https://')) {
      return;
    }
    
    let targetPath;
    try {
      targetPath = new URL(href, window.location.href).pathname;
    } catch (e) {
      return;
    }
    
    const normalizedTarget = normalizePath(targetPath);
    
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
    document.querySelectorAll('.navDropdown').forEach(dd => {
      if (dd.id !== dropdownId) {
        dd.classList.remove('active');
      }
    });
    dropdown.classList.toggle('active');
  }
};

