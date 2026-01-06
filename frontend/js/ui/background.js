export let globalParticleSystem = null;

export class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) {
      console.error('Failed to get 2d context for canvas');
      return;
    }
    this.particles = [];
    this.particleCount = 50;
    this.maxDistance = 180;
    this.mouse = { x: 0, y: 0, isActive: false };
    this.lastFrameTime = 0;
    this.targetFPS = 30;
    this.frameInterval = 1000 / this.targetFPS;
    
    if (canvas.width === 0 || canvas.height === 0) {
      canvas.width = window.innerWidth || 1920;
      canvas.height = window.innerHeight || 1080;
    }
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
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
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.right = '0';
    this.canvas.style.bottom = '0';
    this.initParticles();
  }
  
  initParticles() {
    if (this.canvas.width === 0 || this.canvas.height === 0) {
      this.canvas.width = window.innerWidth || 1920;
      this.canvas.height = window.innerHeight || 1080;
    }
    
    const savedParticles = sessionStorage.getItem('particleSystemState');
    if (savedParticles) {
      try {
        const parsed = JSON.parse(savedParticles);
        const scaleX = this.canvas.width / (parsed.canvasWidth || this.canvas.width);
        const scaleY = this.canvas.height / (parsed.canvasHeight || this.canvas.height);
        
        this.particles = parsed.particles.map(p => ({
          x: p.x * scaleX,
          y: p.y * scaleY,
          vx: p.vx || (Math.random() - 0.5) * 1.5,
          vy: p.vy || (Math.random() - 0.5) * 1.5,
          radius: p.radius || (Math.random() * 2 + 1)
        }));
        
        if (this.particles.length === 0) {
          this.createNewParticles();
        }
        
        if (this.ctx && this.particles.length > 0) {
          this.drawFrame();
        }
        
        return;
      } catch (e) {
        console.warn('Failed to restore particle state:', e);
        this.createNewParticles();
      }
    } else {
      this.createNewParticles();
    }
  }
  
  drawFrame() {
    if (!this.ctx || !this.particles || this.particles.length === 0) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(34, 197, 94, 1)`;
      this.ctx.fill();
      
      for (let j = i + 1; j < this.particles.length; j++) {
        const otherParticle = this.particles[j];
        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.maxDistance) {
          const opacity = (1 - distance / this.maxDistance) * 0.5;
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(otherParticle.x, otherParticle.y);
          this.ctx.strokeStyle = `rgba(34, 197, 94, ${opacity})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
    }
  }
  
  createNewParticles() {
    this.particles = [];
    const width = this.canvas.width || window.innerWidth || 1920;
    const height = this.canvas.height || window.innerHeight || 1080;
    
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
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
    if (this.canvas.width === 0 || this.canvas.height === 0) {
      this.resize();
    }
    
    if (!this.particles || this.particles.length === 0) {
      this.initParticles();
    }
    
    if (this.particles && this.particles.length > 0) {
      this.drawFrame();
    }
    
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
    if (!this.ctx) {
      console.error('Canvas context not available');
      requestAnimationFrame(() => this.animate());
      return;
    }
    
    if (this.canvas.width === 0 || this.canvas.height === 0) {
      this.resize();
    }
    
    if (!this.particles || this.particles.length === 0) {
      this.initParticles();
    }
    
    const now = performance.now();
    const elapsed = now - this.lastFrameTime;
    
    if (elapsed >= this.frameInterval) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      for (let i = 0; i < this.particles.length; i++) {
        const particle = this.particles[i];
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        const wasOutOfBoundsX = particle.x < 0 || particle.x > this.canvas.width;
        const wasOutOfBoundsY = particle.y < 0 || particle.y > this.canvas.height;
        
        particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
        
        if (wasOutOfBoundsX) {
          particle.vx = -particle.vx;
        }
        if (wasOutOfBoundsY) {
          particle.vy = -particle.vy;
        }
        
        if (this.mouse.isActive) {
          const dx = this.mouse.x - particle.x;
          const dy = this.mouse.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const angle = Math.atan2(dy, dx);
            const force = (100 - distance) / 100;
            particle.vx -= Math.cos(angle) * force * 0.025;
            particle.vy -= Math.sin(angle) * force * 0.025;
          }
        }
        
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(34, 197, 94, 1)`;
        this.ctx.fill();
        
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = 'rgba(34, 197, 94, 0.8)';
        
        for (let j = i + 1; j < this.particles.length; j++) {
          const otherParticle = this.particles[j];
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < this.maxDistance) {
            const opacity = (1 - distance / this.maxDistance) * 0.5;
            this.ctx.beginPath();
            this.ctx.moveTo(particle.x, particle.y);
            this.ctx.lineTo(otherParticle.x, otherParticle.y);
            this.ctx.strokeStyle = `rgba(34, 197, 94, ${opacity})`;
            this.ctx.lineWidth = 1;
            this.ctx.shadowBlur = 0;
            this.ctx.stroke();
          }
        }
      }
      
      this.lastFrameTime = now - (elapsed % this.frameInterval);
    }
    
    requestAnimationFrame(() => this.animate());
  }
}

export function initializeBackgroundAnimation() {
  if (globalParticleSystem && globalParticleSystem.canvas) {
    const existingCanvas = globalParticleSystem.canvas;
    if (document.body.contains(existingCanvas) || document.getElementById('backgroundAnimation')?.contains(existingCanvas)) {
      existingCanvas.style.display = 'block';
      existingCanvas.style.visibility = 'visible';
      existingCanvas.style.opacity = '1';
      existingCanvas.style.setProperty('pointer-events', 'none', 'important');
      if (existingCanvas.width !== window.innerWidth || existingCanvas.height !== window.innerHeight) {
        globalParticleSystem.resize();
      }
      return;
    }
  }
  
  let canvas = document.getElementById('particleCanvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'particleCanvas';
    canvas.className = 'particleCanvas';
    
    const bgContainer = document.getElementById('backgroundAnimation');
    if (bgContainer) {
      bgContainer.appendChild(canvas);
    } else {
      document.body.insertBefore(canvas, document.body.firstChild);
    }
  }
  
  const width = window.innerWidth || 1920;
  const height = window.innerHeight || 1080;
  canvas.width = width;
  canvas.height = height;
  
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.right = '0';
  canvas.style.bottom = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.minWidth = '100vw';
  canvas.style.minHeight = '100vh';
  canvas.style.maxWidth = 'none';
  canvas.style.maxHeight = 'none';
  canvas.style.zIndex = '0';
  canvas.style.display = 'block';
  canvas.style.visibility = 'visible';
  canvas.style.opacity = '1';
  canvas.style.background = 'transparent';
  canvas.style.pointerEvents = 'none';
  canvas.style.setProperty('pointer-events', 'none', 'important');
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Failed to get canvas 2d context');
    return;
  }
  
  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, width, height);
  
  const forcePointerEventsNone = () => {
    if (canvas) {
      canvas.style.setProperty('pointer-events', 'none', 'important');
    }
  };
  
  forcePointerEventsNone();
  
  try {
    if (!globalParticleSystem) {
      globalParticleSystem = new ParticleSystem(canvas);
    } else {
      globalParticleSystem.canvas = canvas;
      globalParticleSystem.ctx = ctx;
    }
    
    if (globalParticleSystem && globalParticleSystem.ctx) {
      if (!globalParticleSystem.particles || globalParticleSystem.particles.length === 0) {
        globalParticleSystem.initParticles();
      }
      
      if (globalParticleSystem.particles && globalParticleSystem.particles.length > 0) {
        globalParticleSystem.drawFrame();
      }
      
      globalParticleSystem.init();
    } else {
      console.error('Failed to create particle system - no context available');
    }
  } catch (error) {
    console.error('Error setting up canvas:', error);
  }
  
  forcePointerEventsNone();
  requestAnimationFrame(forcePointerEventsNone);
  setTimeout(forcePointerEventsNone, 0);
  setTimeout(forcePointerEventsNone, 10);
  setTimeout(forcePointerEventsNone, 50);
  setTimeout(forcePointerEventsNone, 100);
  setTimeout(forcePointerEventsNone, 200);
  setTimeout(forcePointerEventsNone, 500);
  setTimeout(forcePointerEventsNone, 1000);
  
  const observer = new MutationObserver(() => {
    if (canvas && canvas.style.getPropertyValue('pointer-events') !== 'none') {
      forcePointerEventsNone();
    }
  });
  observer.observe(canvas, { 
    attributes: true, 
    attributeFilter: ['style'],
    attributeOldValue: false
  });
  
  window.addEventListener('resize', () => {
    setTimeout(forcePointerEventsNone, 0);
  });
  
  setInterval(() => {
    if (canvas) {
      const current = canvas.style.getPropertyValue('pointer-events');
      if (current !== 'none' && current !== '') {
        forcePointerEventsNone();
      }
    }
  }, 25);
  
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
      z-index: 0 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      background: transparent !important;
      right: 0 !important;
      bottom: 0 !important;
    }
    
    .mainContent {
      position: relative;
      z-index: 2;
    }
    
    .section {
      position: relative;
      z-index: 2;
    }
  `;
  document.head.appendChild(style);
}

