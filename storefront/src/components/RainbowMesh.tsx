import React, { useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface RainbowMeshProps {
  intensity?: number; // 0 to 1
  speed?: number;
  interactive?: boolean;
}

const RAINBOW_COLORS = [
  '#FF5F6D', // Red
  '#FF9A3C', // Orange
  '#FFD93D', // Yellow
  '#5BE37D', // Green
  '#4DA8FF', // Blue
  '#6C63FF', // Indigo
  '#B067FF', // Violet
];

export const RainbowMesh: React.FC<RainbowMeshProps> = ({
  intensity = 1,
  speed = 1,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false, radius: 400, strength: 0 });
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', resize);
    resize();

    // Fluid particles for the mesh
    const particles = Array.from({ length: 18 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      originX: Math.random() * window.innerWidth,
      originY: Math.random() * window.innerHeight,
      vx: 0,
      vy: 0,
      radius: 500 + Math.random() * 500,
      color: RAINBOW_COLORS[i % RAINBOW_COLORS.length],
      phase: Math.random() * Math.PI * 2,
      offset: Math.random() * 1000,
    }));

    const render = (time: number) => {
      const t = time * 0.0003 * speed;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.globalAlpha = 0.5 * intensity;
      ctx.globalCompositeOperation = 'screen';
      ctx.filter = 'blur(120px)';

      // Smoothly animate interaction strength
      if (mouseRef.current.active) {
        mouseRef.current.strength = Math.min(1, mouseRef.current.strength + 0.05);
      } else {
        mouseRef.current.strength = Math.max(0, mouseRef.current.strength - 0.01); // Slower decay: ~2-4 seconds at 60fps
      }

      particles.forEach((p, i) => {
        // Natural drift
        p.originX += Math.sin(t + p.phase) * 0.5;
        p.originY += Math.cos(t + p.phase) * 0.5;

        // Target position
        let targetX = p.originX + Math.sin(t * 0.8 + p.offset) * 100;
        let targetY = p.originY + Math.cos(t * 0.8 + p.offset) * 100;

        // Interaction - stronger and silk-like
        if (interactive && mouseRef.current.strength > 0) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < mouseRef.current.radius) {
            const force = (1 - dist / mouseRef.current.radius);
            // Push & Pull feeling with easing
            const easeForce = force * force * (3 - 2 * force); // cubic-bezier(0.22, 1, 0.36, 1) approximate
            const strength = 200 * easeForce * mouseRef.current.strength;
            targetX -= dx * strength * 0.08;
            targetY -= dy * strength * 0.08;
          }
        }

        // Spring movement
        p.vx += (targetX - p.x) * 0.012;
        p.vy += (targetY - p.y) * 0.012;
        p.vx *= 0.90; // Silkier friction
        p.vy *= 0.90;
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around bounds softly
        const padding = p.radius;
        if (p.x < -padding) p.x = window.innerWidth + padding;
        if (p.x > window.innerWidth + padding) p.x = -padding;
        if (p.y < -padding) p.y = window.innerHeight + padding;
        if (p.y > window.innerHeight + padding) p.y = -padding;

        ctx.beginPath();
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(0.5, p.color + '66'); // Semi-transparent
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    const handlePointerDown = (e: PointerEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handlePointerMove = (e: PointerEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handlePointerUp = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    render(0);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity, speed, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none transition-opacity duration-1000"
      style={{ 
        width: '100%', 
        height: '100%',
        background: '#0D0D0D', // Slightly warmer dark base
      }}
    />
  );
};
