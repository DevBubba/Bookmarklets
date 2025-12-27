export let globalParticleSystem = null;

export class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 80;
    this.maxDistance = 150;
    this.mouse = { x: 0, y: 0, isActive: false };
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    // Track mouse from document instead of canvas so canvas can have pointer-events: none
    document.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.isActive = true;
    });
    
    document.addEventListener('mouseleave', () => {
      this.mouse.isActive = false;
    });
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.initParticles();
  }
  
  initParticles() {
    const savedParticles = sessionStorage.getItem('particleSystemState');
    if (savedParticles) {
      try {
        const parsed = JSON.parse(savedParticles);
        const scaleX = this.canvas.width / (parsed.canvasWidth || this.canvas.width);
        const scaleY = this.canvas.height / (parsed.canvasHeight || this.canvas.height);
        
        this.particles = parsed.particles.map(p => ({
          x: p.x * scaleX,
          y: p.y * scaleY,
          vx: p.vx || (Math.random() - 0.5) * 0.5,
          vy: p.vy || (Math.random() - 0.5) * 0.5,
          radius: p.radius || (Math.random() * 2 + 1)
        }));
        
        return;
      } catch (e) {
        console.warn('Failed to restore particle state:', e);
      }
    }
    
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1
      });
    }
  }
  
  saveState() {
    const state = {
      particles: this.particles,
      canvasWidth: this.canvas.width,
      canvasHeight: this.canvas.height
    };
    sessionStorage.setItem('particleSystemState', JSON.stringify(state));
  }
  
  init() {
    this.saveInterval = setInterval(() => {
      if (this.particles && this.particles.length > 0) {
        this.saveState();
      }
    }, 100);
    
    this.animate();
  }
  
  destroy() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }
  }
  
  animate() {
    if (this.canvas.width === 0 || this.canvas.height === 0) {
      this.resize();
    }
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
      
      particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
      particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
      
      if (this.mouse.isActive) {
        const dx = this.mouse.x - particle.x;
        const dy = this.mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const angle = Math.atan2(dy, dx);
          const force = (100 - distance) / 100;
          particle.vx -= Math.cos(angle) * force * 0.02;
          particle.vy -= Math.sin(angle) * force * 0.02;
        }
      }
      
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(34, 197, 94, 0.8)`;
      this.ctx.fill();
      
      for (let j = i + 1; j < this.particles.length; j++) {
        const otherParticle = this.particles[j];
        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.maxDistance) {
          const opacity = (1 - distance / this.maxDistance) * 0.3;
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(otherParticle.x, otherParticle.y);
          this.ctx.strokeStyle = `rgba(34, 197, 94, ${opacity})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
    }
    
    requestAnimationFrame(() => this.animate());
  }
}

export function initializeBackgroundAnimation() {
  let canvas = document.getElementById('particleCanvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'particleCanvas';
    canvas.className = 'particleCanvas';
    document.body.appendChild(canvas);
  }
  
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = '-1';
  canvas.style.display = 'block';
  canvas.style.visibility = 'visible';
  canvas.style.background = 'transparent';
  
  // CRITICAL: Set pointer-events to none immediately and keep it
  canvas.style.setProperty('pointer-events', 'none', 'important');
  
  // Force pointer-events to none using setProperty with important
  const forcePointerEventsNone = () => {
    if (canvas) {
      // Always set it with important flag - this overrides everything
      canvas.style.setProperty('pointer-events', 'none', 'important');
    }
  };
  
  // Set it immediately before anything else
  forcePointerEventsNone();
  
  globalParticleSystem = new ParticleSystem(canvas);
  globalParticleSystem.init();
  
  // Immediately after init, force it again
  forcePointerEventsNone();
  
  // Force it multiple times after init to catch any code that sets it back
  requestAnimationFrame(forcePointerEventsNone);
  setTimeout(forcePointerEventsNone, 0);
  setTimeout(forcePointerEventsNone, 10);
  setTimeout(forcePointerEventsNone, 50);
  setTimeout(forcePointerEventsNone, 100);
  setTimeout(forcePointerEventsNone, 200);
  setTimeout(forcePointerEventsNone, 500);
  setTimeout(forcePointerEventsNone, 1000);
  
  // Watch for ANY style attribute changes and immediately fix it
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      if (canvas && canvas.style.getPropertyValue('pointer-events') !== 'none') {
        forcePointerEventsNone();
      }
    });
  });
  observer.observe(canvas, { 
    attributes: true, 
    attributeFilter: ['style'],
    attributeOldValue: false
  });
  
  // Also force it on any resize
  window.addEventListener('resize', () => {
    setTimeout(forcePointerEventsNone, 0);
  });
  
  // Continuously monitor and fix pointer-events every 25ms (very aggressive)
  setInterval(() => {
    if (canvas) {
      const current = canvas.style.getPropertyValue('pointer-events');
      if (current !== 'none' && current !== '') {
        forcePointerEventsNone();
      }
    }
  }, 25);
  
  // Also check on every animation frame
  function checkPointerEvents() {
    if (canvas) {
      const current = canvas.style.getPropertyValue('pointer-events');
      if (current !== 'none' && current !== '') {
        forcePointerEventsNone();
      }
    }
    requestAnimationFrame(checkPointerEvents);
  }
  requestAnimationFrame(checkPointerEvents);
  
  // Also run on page load complete
  if (document.readyState === 'complete') {
    forcePointerEventsNone();
  } else {
    window.addEventListener('load', forcePointerEventsNone);
  }
  
  const style = document.createElement('style');
  style.textContent = `
    #particleCanvas,
    .particleCanvas {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      pointer-events: none !important;
      z-index: -1 !important;
      display: block !important;
      visibility: visible !important;
      background: transparent !important;
    }
    
    .mainContent {
      position: relative;
      z-index: 1;
    }
    
    .section {
      position: relative;
      z-index: 1;
    }
  `;
  document.head.appendChild(style);
}

