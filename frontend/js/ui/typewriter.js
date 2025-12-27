 * Initialize typewriter effect for hero tagline
 * Cycles through different taglines with typing animation in random order
 */
export function initializeTypewriter() {
  const taglineElement = document.querySelector('.heroTagline');
  if (!taglineElement) return;

  const textElement = taglineElement.querySelector('.typewriterText');
  if (!textElement) return;

  const taglines = [
    'Supercharge Your Browsing Experience',
    'Transform Your Browser Into a Powerhouse',
    'Enhance Your Productivity Online',
    'Unlock Your Browser\'s Potential',
    'Boost Your Web Workflow'
  ];

  let currentTagline = '';
  let currentCharIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;
  let deletingSpeed = 50;
  let pauseTime = 2000;

  function getRandomTagline() {
    let randomTagline;
    do {
      randomTagline = taglines[Math.floor(Math.random() * taglines.length)];
    } while (randomTagline === currentTagline && taglines.length > 1);
    return randomTagline;
  }

  function typeWriter() {
    if (isDeleting) {
      textElement.textContent = currentTagline.substring(0, currentCharIndex - 1);
      currentCharIndex--;
      typingSpeed = deletingSpeed;
      
      if (currentCharIndex === 0) {
        isDeleting = false;
        currentTagline = getRandomTagline();
        typingSpeed = pauseTime; // Pause before typing next
      }
    } else {
      textElement.textContent = currentTagline.substring(0, currentCharIndex + 1);
      currentCharIndex++;
      typingSpeed = 100;
      
      if (currentCharIndex === currentTagline.length) {
        typingSpeed = pauseTime; // Pause at end
        setTimeout(() => {
          isDeleting = true;
        }, pauseTime);
      }
    }
    
    setTimeout(typeWriter, typingSpeed);
  }

  currentTagline = getRandomTagline();
  textElement.textContent = '';
  setTimeout(typeWriter, 500); // Small delay before starting
}

