export function initializePageLoadAnimation() {
  const currentPath = window.location.pathname;
  const isHomePage = currentPath.includes('index.html') || currentPath === '/' || currentPath.endsWith('/');
  
  if (isHomePage) {
    return;
  }
  
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const heroTitle = document.querySelector('.aboutHeroTitle, .authHeroTitle, h1.aboutHeroTitle, h1.authHeroTitle, main h1:first-of-type');
      const heroSubtitle = document.querySelector('.aboutHeroSubtitle, .authHeroSubtitle, main p:first-of-type');
      const firstSection = document.querySelector('.section:first-of-type, main > section:first-of-type');
      
      if (heroTitle && !heroTitle.classList.contains('animatedHeroTitle') && !heroTitle.classList.contains('heroTitle')) {
        heroTitle.classList.remove('pageLoadTitle');
        heroTitle.style.opacity = '0';
        void heroTitle.offsetHeight;
        heroTitle.classList.add('pageLoadTitle');
        void heroTitle.offsetHeight;
      }
      
      if (heroSubtitle && !heroSubtitle.classList.contains('animatedDescription') && !heroSubtitle.classList.contains('heroDescription')) {
        heroSubtitle.classList.remove('pageLoadSubtitle');
        heroSubtitle.style.opacity = '0';
        void heroSubtitle.offsetHeight;
        heroSubtitle.classList.add('pageLoadSubtitle');
        void heroSubtitle.offsetHeight;
      }
      
      if (firstSection && !firstSection.classList.contains('pageLoadSection')) {
        firstSection.classList.remove('pageLoadSection');
        firstSection.style.opacity = '0';
        void firstSection.offsetHeight;
        firstSection.classList.add('pageLoadSection');
        void firstSection.offsetHeight;
      }
      
      const sections = document.querySelectorAll('.section:not(:first-of-type)');
      sections.forEach((section, index) => {
        if (!section.classList.contains('pageLoadSection') && section !== firstSection) {
          section.classList.remove('pageLoadSection');
          section.style.opacity = '0';
          void section.offsetHeight;
          section.classList.add('pageLoadSection');
          void section.offsetHeight;
        }
      });
      
      const sectionTitles = document.querySelectorAll('.aboutSectionTitle, .sectionTitle:not(:first-of-type), h2.sectionTitle, section h2');
      sectionTitles.forEach((title, index) => {
        if (!title.classList.contains('pageLoadTitle') && !title.classList.contains('animatedHeroTitle')) {
          title.style.animation = '';
          title.style.opacity = '0';
          title.style.willChange = 'opacity, transform';
          void title.offsetHeight;
          title.style.animation = `pageTitleFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${0.02 + index * 0.03}s forwards`;
          void title.offsetHeight;
        }
      });
    });
  });
}

export function resetPageLoadAnimation() {
  document.querySelectorAll('.pageLoadTitle, .pageLoadSubtitle, .pageLoadContent, .pageLoadSection').forEach(el => {
    el.classList.remove('pageLoadTitle', 'pageLoadSubtitle', 'pageLoadContent', 'pageLoadSection');
    el.style.animation = '';
  });
  
  requestAnimationFrame(() => {
    initializePageLoadAnimation();
  });
}

