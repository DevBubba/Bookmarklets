// Background particle animation system
// All code uses camelCase naming convention

// Global particle system reference for saving state
export let globalParticleSystem = null;

/**
 * Particle System Class
 * Manages canvas particles, their movement, and mouse interaction
 */
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
    
    // Mouse tracking
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.isActive = true;
    });
    
    canvas.addEventListener('mouseleave', () => {
      this.mouse.isActive = false;
    });
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.initParticles();
  }
  
  initParticles() {
    // Try to restore particles from sessionStorage for seamless transition
    const savedParticles = sessionStorage.getItem('particleSystemState');
    if (savedParticles) {
      try {
        const parsed = JSON.parse(savedParticles);
        // Adjust particles to new canvas size if needed
        const scaleX = this.canvas.width / (parsed.canvasWidth || this.canvas.width);
        const scaleY = this.canvas.height / (parsed.canvasHeight || this.canvas.height);
        
        // Restore particles with their velocities preserved for seamless animation
        this.particles = parsed.particles.map(p => ({
          x: p.x * scaleX,
          y: p.y * scaleY,
          vx: p.vx || (Math.random() - 0.5) * 0.5, // Preserve velocity
          vy: p.vy || (Math.random() - 0.5) * 0.5,
          radius: p.radius || (Math.random() * 2 + 1)
        }));
        
        // Don't clear saved state - keep it for potential re-use
        // The periodic save will update it anyway
        return;
      } catch (e) {
        // If restore fails, create new particles
        console.warn('Failed to restore particle state:', e);
      }
    }
    
    // Create new particles
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
    // Save particle state before navigation
    const state = {
      particles: this.particles,
      canvasWidth: this.canvas.width,
      canvasHeight: this.canvas.height
    };
    sessionStorage.setItem('particleSystemState', JSON.stringify(state));
  }
  
  init() {
    // Save state periodically for seamless transitions
    this.saveInterval = setInterval(() => {
      if (this.particles && this.particles.length > 0) {
        this.saveState();
      }
    }, 100); // Save every 100ms
    
    this.animate();
  }
  
  destroy() {
    // Clean up interval
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and draw particles
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Bounce off edges
      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
      
      // Keep particles in bounds
      particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
      particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
      
      // Mouse interaction
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
      
      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(34, 197, 94, 0.8)`;
      this.ctx.fill();
      
      // Draw connections
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

/**
 * Initialize background particle animation
 * Creates canvas and initializes particle system
 */
export function initializeBackgroundAnimation() {
  const backgroundElement = document.getElementById('backgroundAnimation');
  if (!backgroundElement) return;
  
  // Check if canvas already exists (shouldn't on fresh load, but check anyway)
  let canvas = document.getElementById('particleCanvas');
  if (!canvas) {
    // Create canvas for particles
    canvas = document.createElement('canvas');
    canvas.id = 'particleCanvas';
    canvas.className = 'particleCanvas';
    backgroundElement.appendChild(canvas);
  }
  
  // Initialize particle system with saved state (if available)
  // This will restore particles immediately, making transition seamless
  globalParticleSystem = new ParticleSystem(canvas);
  globalParticleSystem.init();
  
  // Add CSS for canvas
  const style = document.createElement('style');
  style.textContent = `
    .particleCanvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: auto;
      z-index: 0;
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

