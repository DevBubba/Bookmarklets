// Featured Bookmarklets Carousel
// All code uses camelCase naming convention

/**
 * Initialize featured bookmarklets carousel
 * Handles navigation and auto-play functionality
 */
export function initializeFeaturedCarousel() {
  const carouselTrack = document.getElementById('featuredCarouselTrack');
  const prevButton = document.querySelector('.carouselButtonPrev');
  const nextButton = document.querySelector('.carouselButtonNext');
  const indicators = document.querySelectorAll('.carouselIndicator');
  
  if (!carouselTrack || !prevButton || !nextButton) return;
  
  const cards = carouselTrack.querySelectorAll('.featuredCard');
  if (cards.length === 0) return;
  
  let currentIndex = 0;
  const totalCards = cards.length;
  
  // Update carousel position
  function updateCarousel() {
    const carousel = carouselTrack.parentElement;
    const carouselWidth = carousel.offsetWidth;
    const translateX = -(currentIndex * carouselWidth);
    carouselTrack.style.transform = `translateX(${translateX}px)`;
    
    // Update indicators
    indicators.forEach((indicator, index) => {
      if (index === currentIndex) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
    
    // Update button states
    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === totalCards - 1;
  }
  
  // Go to next slide
  function nextSlide() {
    if (currentIndex < totalCards - 1) {
      currentIndex++;
    } else {
      currentIndex = 0; // Loop back to start
    }
    updateCarousel();
  }
  
  // Go to previous slide
  function prevSlide() {
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = totalCards - 1; // Loop to end
    }
    updateCarousel();
  }
  
  // Go to specific slide
  function goToSlide(index) {
    if (index >= 0 && index < totalCards) {
      currentIndex = index;
      updateCarousel();
    }
  }
  
  // Event listeners
  nextButton.addEventListener('click', nextSlide);
  prevButton.addEventListener('click', prevSlide);
  
  // Indicator clicks
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => goToSlide(index));
  });
  
  // Keyboard navigation
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
  
  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateCarousel();
    }, 250);
  });
  
  // Initialize
  updateCarousel();
  
  // Auto-play functionality
  let autoPlayInterval;
  function startAutoPlay() {
    autoPlayInterval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds
  }
  
  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
  }
  
  // Start auto-play
  startAutoPlay();
  
  // Pause on hover
  const carouselWrapper = document.querySelector('.featuredCarouselWrapper');
  if (carouselWrapper) {
    carouselWrapper.addEventListener('mouseenter', stopAutoPlay);
    carouselWrapper.addEventListener('mouseleave', startAutoPlay);
  }
  
  // Pause when user interacts with buttons
  [prevButton, nextButton, ...indicators].forEach(element => {
    if (element) {
      element.addEventListener('click', () => {
        stopAutoPlay();
        setTimeout(startAutoPlay, 10000); // Resume after 10 seconds
      });
    }
  });
}

