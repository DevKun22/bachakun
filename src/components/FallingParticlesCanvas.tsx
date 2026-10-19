import React, { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  flip: number;
  flipSpeed: number;
  opacity: number;
  color: string;
  type: 'petal' | 'heart' | 'sparkle';
}

interface SparkleTrail {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speedX: number;
  speedY: number;
  color: string;
}

export const FallingParticlesCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparklesRef = useRef<SparkleTrail[]>([]);
  const mousePosRef = useRef<{ x: number; y: number; moved: boolean }>({
    x: -100,
    y: -100,
    moved: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Color palettes for petals and hearts
    const petalColors = [
      'rgba(244, 63, 94, 0.75)',   // rose-500
      'rgba(251, 113, 133, 0.75)', // rose-400
      'rgba(243, 24, 87, 0.65)',   // deep crimson
      'rgba(254, 205, 211, 0.85)', // rose-200
      'rgba(244, 114, 182, 0.7)',  // pink-400
    ];

    const heartColors = [
      'rgba(244, 63, 94, 0.7)',
      'rgba(236, 72, 153, 0.65)',
      'rgba(251, 146, 60, 0.55)',
    ];

    // Initialize particles
    const particleCount = Math.min(38, Math.floor(width / 35));
    const particles: Petal[] = [];

    for (let i = 0; i < particleCount; i++) {
      const isHeart = Math.random() > 0.6;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: isHeart ? 10 + Math.random() * 12 : 12 + Math.random() * 16,
        speedX: -0.8 + Math.random() * 1.6,
        speedY: 0.8 + Math.random() * 1.6,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        flip: Math.random() * Math.PI,
        flipSpeed: 0.015 + Math.random() * 0.03,
        opacity: 0.4 + Math.random() * 0.5,
        color: isHeart
          ? heartColors[Math.floor(Math.random() * heartColors.length)]
          : petalColors[Math.floor(Math.random() * petalColors.length)],
        type: isHeart ? 'heart' : 'petal',
      });
    }

    // Helper to draw a heart
    const drawHeart = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      color: string,
      opacity: number
    ) => {
      context.save();
      context.translate(x, y);
      context.globalAlpha = opacity;
      context.fillStyle = color;
      context.beginPath();
      const topCurveHeight = size * 0.3;
      context.moveTo(0, topCurveHeight);
      // top left curve
      context.bezierCurveTo(
        -size / 2,
        -size / 2,
        -size,
        topCurveHeight / 2,
        0,
        size
      );
      // top right curve
      context.bezierCurveTo(
        size,
        topCurveHeight / 2,
        size / 2,
        -size / 2,
        0,
        topCurveHeight
      );
      context.closePath();
      context.fill();
      context.restore();
    };

    // Helper to draw a delicate rose petal
    const drawPetal = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rotation: number,
      flip: number,
      color: string,
      opacity: number
    ) => {
      context.save();
      context.translate(x, y);
      context.rotate(rotation);
      context.scale(Math.cos(flip), 1);
      context.globalAlpha = opacity;

      // Petal shape
      context.beginPath();
      context.moveTo(0, 0);
      context.bezierCurveTo(-size * 0.6, -size * 0.8, -size * 0.8, size * 0.6, 0, size);
      context.bezierCurveTo(size * 0.8, size * 0.6, size * 0.6, -size * 0.8, 0, 0);
      context.fillStyle = color;
      context.fill();

      // Subtle vein highlight
      context.beginPath();
      context.moveTo(0, 0);
      context.quadraticCurveTo(size * 0.1, size * 0.5, 0, size * 0.9);
      context.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      context.lineWidth = 1;
      context.stroke();

      context.restore();
    };

    // Mouse interactive listener
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      mousePosRef.current = { x: clientX, y: clientY, moved: true };

      // Spawn interactive sparkles on cursor move
      const trailColors = ['#f43f5e', '#ec4899', '#fbcfe8', '#fbbf24', '#ffffff'];
      for (let i = 0; i < 2; i++) {
        sparklesRef.current.push({
          x: clientX + (Math.random() - 0.5) * 20,
          y: clientY + (Math.random() - 0.5) * 20,
          size: 2 + Math.random() * 4,
          alpha: 0.9,
          speedX: (Math.random() - 0.5) * 1.5,
          speedY: (Math.random() - 0.5) * 1.5 - 0.5,
          color: trailColors[Math.floor(Math.random() * trailColors.length)],
        });
      }

      if (sparklesRef.current.length > 80) {
        sparklesRef.current.splice(0, 20);
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    // Main animation loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render & update falling particles
      const mouse = mousePosRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Interactive wind effect from mouse
        if (mouse.moved) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const force = (120 - dist) / 120;
            p.x += (dx / dist) * force * 5;
            p.y += (dy / dist) * force * 4;
            p.rotation += 0.05;
          }
        }

        p.y += p.speedY;
        p.x += Math.sin(p.flip) * 0.8 + p.speedX;
        p.rotation += p.rotationSpeed;
        p.flip += p.flipSpeed;

        // Wrap around screen
        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        if (p.type === 'heart') {
          drawHeart(ctx, p.x, p.y, p.size, p.color, p.opacity);
        } else {
          drawPetal(ctx, p.x, p.y, p.size, p.rotation, p.flip, p.color, p.opacity);
        }
      }

      // Render & update cursor trail sparkles
      const sparkles = sparklesRef.current;
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.x += s.speedX;
        s.y += s.speedY;
        s.alpha -= 0.025;

        if (s.alpha <= 0) {
          sparkles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, s.alpha);
        ctx.fillStyle = s.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ width: '100%', height: '100%' }}
    />
  );
};
