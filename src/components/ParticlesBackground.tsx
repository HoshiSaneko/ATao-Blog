import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedY: number;
  speedX: number;
  opacity: number;
  fadeSpeed: number;
  type: 'circle' | 'star';
  rotation: number;
  rotationSpeed: number;
  update(): void;
  reset(initial?: boolean): void;
}

export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let isDark = document.documentElement.classList.contains('dark');

    // Genshin Style Colors - Unified Starry/Magical Feel
    const getColors = (dark: boolean) => {
      // Dark Mode: Gold, White, Deep Blue
      if (dark) return [
        'rgba(211, 188, 142, 0.6)', // Gold (Primogem-like)
        'rgba(255, 255, 255, 0.5)', // White
        'rgba(66, 133, 244, 0.4)',  // Blue
        'rgba(252, 211, 77, 0.4)',  // Amber
      ];
      // Light Mode: Darker Gold, Blue, Slate (Visible on white)
      return [
        'rgba(180, 83, 9, 0.3)',    // Dark Amber/Gold
        'rgba(59, 130, 246, 0.3)',  // Blue
        'rgba(148, 163, 184, 0.4)'  // Slate
      ];
    };

    let colors = getColors(isDark);
    const particleCount = 35; // Increased count for visibility

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class ParticleImpl implements Particle {
      x!: number;
      y!: number;
      size!: number;
      color!: string;
      speedY!: number;
      speedX!: number;
      opacity!: number;
      fadeSpeed!: number;
      type!: 'circle' | 'star';
      rotation!: number;
      rotationSpeed!: number;

      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * canvas!.width;
        this.y = initial ? Math.random() * canvas!.height : canvas!.height + 20;
        this.size = Math.random() * 5 + 3; // Slightly larger: 3px to 8px radius
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speedY = Math.random() * -0.5 - 0.1; // Slow upward float
        this.speedX = (Math.random() - 0.5) * 0.2; // Slight drift
        this.opacity = 0;
        this.fadeSpeed = Math.random() * 0.01 + 0.005;
        this.type = Math.random() > 0.7 ? 'star' : 'circle'; // 30% stars
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;

        if (this.type === 'star') {
          // Draw 4-pointed star (Genshin Primogem-ish sparkle)
          ctx.rotate(this.rotation);
          ctx.beginPath();
          // Draw a diamond/star shape using curves or lines
          const r = this.size * 2; // Stars slightly larger
          ctx.moveTo(0, -r);
          ctx.quadraticCurveTo(0.5, -0.5, r, 0);
          ctx.quadraticCurveTo(0.5, 0.5, 0, r);
          ctx.quadraticCurveTo(-0.5, 0.5, -r, 0);
          ctx.quadraticCurveTo(-0.5, -0.5, 0, -r);
          ctx.fill();
        } else {
          // Soft Circle
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      update() {
        if (!canvas) return;

        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;

        // Fade in/out logic
        // If high in the sky (y < 20%), start fading out
        if (this.y < canvas.height * 0.2) {
          this.opacity -= this.fadeSpeed;
        } else if (this.opacity < 1) { // Fade in initially
          this.opacity += this.fadeSpeed;
        }

        // Reset if off screen or invisible
        if (this.y < -20 || this.opacity <= 0) {
          this.reset();
        }

        this.draw();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new ParticleImpl());
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => p.update());
      animationFrameId = requestAnimationFrame(animate);
    };

    // Observer for Dark Mode changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const newIsDark = document.documentElement.classList.contains('dark');
          if (newIsDark !== isDark) {
            isDark = newIsDark;
            colors = getColors(isDark);
            // Update existing particles eventually or immediately? 
            // Let's let them respawn with new colors naturally or force update
            particles.forEach(p => p.color = colors[Math.floor(Math.random() * colors.length)]);
          }
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    init();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none transition-opacity duration-1000 z-0"
      // Ensure it is above the background gradient but below content (assuming content is z-10 or higher)
      // If content is covering it, we might need a higher z-index, but typical content is usually static/relative.
      // BaseLayout body has background. 
      style={{ zIndex: 0 }}
    />
  );
}
