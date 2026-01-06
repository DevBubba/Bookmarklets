let globalCarouselInterval = null;

export function initializeFeaturedCarousel() {
  if (globalCarouselInterval) {
    clearInterval(globalCarouselInterval);
    globalCarouselInterval = null;
  }
  
  const carouselTrack = document.getElementById('featuredCarouselTrack');
  const prevButton = document.querySelector('.carouselButtonPrev');
  const nextButton = document.querySelector('.carouselButtonNext');
  const indicators = document.querySelectorAll('.carouselIndicator');
  
  if (!carouselTrack || !prevButton || !nextButton) return;
  
  const cards = carouselTrack.querySelectorAll('.featuredCard');
  if (cards.length === 0) return;
  
  let currentIndex = 0;
  const totalCards = cards.length;
  
  function updateCarousel() {
    const carousel = carouselTrack.parentElement;
    const carouselWidth = carousel.offsetWidth;
    const translateX = -(currentIndex * carouselWidth);
    carouselTrack.style.transform = `translateX(${translateX}px)`;
    
    indicators.forEach((indicator, index) => {
      if (index === currentIndex) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
    
    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === totalCards - 1;
  }
  
  function nextSlide() {
    if (currentIndex < totalCards - 1) {
      currentIndex++;
    } else {
      currentIndex = 0;
    }
    updateCarousel();
  }
  
  function prevSlide() {
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = totalCards - 1;
    }
    updateCarousel();
  }
  
  function goToSlide(index) {
    if (index >= 0 && index < totalCards) {
      currentIndex = index;
      updateCarousel();
    }
  }
  
  nextButton.addEventListener('click', nextSlide);
  prevButton.addEventListener('click', prevSlide);
  
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => goToSlide(index));
  });
  
  document.addEventListener('keydown', (e) => {
    const featuredSection = document.querySelector('.featuredBookmarklets');
    if (!featuredSection) return;
    
    const rect = featuredSection.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isVisible) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      }
    }
  });
  
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateCarousel();
    }, 250);
  });
  
  updateCarousel();
  
  let autoPlayInterval = null;
  
  function startAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
    if (globalCarouselInterval) {
      clearInterval(globalCarouselInterval);
      globalCarouselInterval = null;
    }
    autoPlayInterval = setInterval(() => {
      nextSlide();
    }, 4000);
    globalCarouselInterval = autoPlayInterval;
  }
  
  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
    if (globalCarouselInterval) {
      clearInterval(globalCarouselInterval);
      globalCarouselInterval = null;
    }
  }
  
  startAutoPlay();
  
  const carouselWrapper = document.querySelector('.featuredCarouselWrapper');
  if (carouselWrapper) {
    carouselWrapper.addEventListener('mouseenter', stopAutoPlay);
    carouselWrapper.addEventListener('mouseleave', () => {
      setTimeout(() => {
        startAutoPlay();
      }, 100);
    });
  }
  
  [prevButton, nextButton, ...indicators].forEach(element => {
    if (element) {
      element.addEventListener('click', () => {
        stopAutoPlay();
        setTimeout(() => {
          startAutoPlay();
        }, 5000);
      });
    }
  });
}

