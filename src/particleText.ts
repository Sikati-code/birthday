export class ParticleText {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private text: string;
  private mouse = { x: -9999, y: -9999, radius: 100 };
  private canvasRect: DOMRect;
  private isRunning = false;
  private animationId: number = 0;

  constructor(canvasId: string, text: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
    this.text = text;
    this.canvasRect = this.canvas.getBoundingClientRect();
    
    this.resize = this.resize.bind(this);
    this.animate = this.animate.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    
    window.addEventListener('resize', this.resize);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: true });
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
    
    this.resize();
  }

  private handleMouseMove(e: MouseEvent) {
    this.mouse.x = e.clientX - this.canvasRect.left;
    this.mouse.y = e.clientY - this.canvasRect.top;
  }

  private handleTouchMove(e: TouchEvent) {
    if(e.touches.length > 0) {
      this.mouse.x = e.touches[0].clientX - this.canvasRect.left;
      this.mouse.y = e.touches[0].clientY - this.canvasRect.top;
    }
  }

  private handleMouseLeave() {
    this.mouse.x = -9999;
    this.mouse.y = -9999;
  }

  private resize() {
    // Determine bounds based on parent
    const parent = this.canvas.parentElement;
    if (parent) {
      this.canvas.width = parent.clientWidth;
      this.canvas.height = parent.clientHeight;
    } else {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
    
    this.canvasRect = this.canvas.getBoundingClientRect();
    this.initParticles();
  }

  private initParticles() {
    this.particles = [];
    
    // Create an offscreen canvas to measure and draw text
    const offCanvas = document.createElement('canvas');
    const offCtx = offCanvas.getContext('2d', { willReadFrequently: true })!;
    offCanvas.width = this.canvas.width;
    offCanvas.height = this.canvas.height;
    
    // Scale font size based on screen width
    let fontSize = Math.min(this.canvas.width / 10, 80);
    offCtx.fillStyle = 'white';
    offCtx.font = `italic 700 ${fontSize}px "Playfair Display", serif`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    
    offCtx.fillText(this.text, this.canvas.width / 2, this.canvas.height / 2);
    
    const textCoordinates = offCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    
    // Scan pixel data to spawn particles (skip pixels to avoid lag)
    const gap = 3; 
    for (let y = 0, y2 = textCoordinates.height; y < y2; y += gap) {
      for (let x = 0, x2 = textCoordinates.width; x < x2; x += gap) {
        if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
          let originX = x;
          let originY = y;
          this.particles.push(new Particle(originX, originY));
        }
      }
    }
  }

  public start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.animate();
    }
  }

  public stop() {
    this.isRunning = false;
    cancelAnimationFrame(this.animationId);
  }

  private animate() {
    if(!this.isRunning) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].update(this.mouse);
      this.particles[i].draw(this.ctx);
    }
    
    this.animationId = requestAnimationFrame(this.animate);
  }
}

class Particle {
  x: number;
  y: number;
  size: number;
  originX: number;
  originY: number;
  vx: number = 0;
  vy: number = 0;
  friction: number = 0.85; // Air resistance
  ease: number = 0.08;     // Spring elasticity returning to origin
  color: string;

  constructor(x: number, y: number) {
    // Start randomly scattered
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    this.originX = x;
    this.originY = y;
    this.size = Math.random() * 1.5 + 0.5;
    
    // Golden-ish colors
    const r = Math.floor(Math.random() * 55 + 200); // 200-255
    const g = Math.floor(Math.random() * 70 + 170); // 170-240
    const b = Math.floor(Math.random() * 50 + 50);  // 50-100
    this.color = `rgba(${r}, ${g}, ${b}, ${Math.random() * 0.5 + 0.5})`;
  }

  update(mouse: { x: number, y: number, radius: number }) {
    // Mouse repel physics
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < mouse.radius) {
      const forceDirectionX = dx / distance;
      const forceDirectionY = dy / distance;
      const force = (mouse.radius - distance) / mouse.radius;
      
      const pushX = forceDirectionX * force * 5;
      const pushY = forceDirectionY * force * 5;
      
      this.vx -= pushX;
      this.vy -= pushY;
    }
    
    // Magnetic pull back to origin
    this.vx += (this.originX - this.x) * this.ease;
    this.vy += (this.originY - this.y) * this.ease;
    
    // Apply friction (dampening)
    this.vx *= this.friction;
    this.vy *= this.friction;
    
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
