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

export function setActiveNavLink() {
  const navLinks = document.querySelectorAll('.navLink');
  if (!navLinks.length) return;
  
  const currentPath = window.location.pathname;
  
  const normalizePath = (path) => {
    if (!path) return '';
    path = path.replace(/\/$/, '');
    if (path.endsWith('/index.html') || path.endsWith('index.html')) {
      path = path.replace(/\/?index\.html$/, '') || '/';
    }
    return path;
  };
  
  const normalizedCurrent = normalizePath(currentPath);
  
  import('../core/navigation.js').then(({ resolveUrl }) => {
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      
      if (href.startsWith('#')) return;
      
      if (href.startsWith('http://') || href.startsWith('https://')) {
        try {
          const url = new URL(href);
          if (url.origin !== window.location.origin) return;
          const normalizedTarget = normalizePath(url.pathname);
          if (normalizedCurrent === normalizedTarget) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        } catch {
          return;
        }
        return;
      }
      
      try {
        const resolvedUrl = resolveUrl(href);
        const url = new URL(resolvedUrl);
        let normalizedTarget = url.pathname.replace(/\/$/, '');
        if (normalizedTarget.endsWith('/index.html') || normalizedTarget.endsWith('index.html')) {
          normalizedTarget = normalizedTarget.replace(/\/?index\.html$/, '') || '/';
        }
        
        if (normalizedCurrent === normalizedTarget) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      } catch (e) {
        try {
          const targetPath = new URL(href, window.location.href).pathname;
          const normalizedTarget = normalizePath(targetPath);
          if (normalizedCurrent === normalizedTarget) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        } catch {
          return;
        }
      }
    });
  }).catch(() => {
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http://') || href.startsWith('https://')) return;
      
      try {
        const targetPath = new URL(href, window.location.href).pathname;
        const normalizedTarget = normalizePath(targetPath);
        if (normalizedCurrent === normalizedTarget) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      } catch {
        return;
      }
    });
  });
}

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
