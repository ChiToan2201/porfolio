'use client';

import React, { useEffect, useRef } from 'react';

interface GridNode {
  originX: number;
  originY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function HeroInteractiveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationFrameId = 0;
    let nodes: GridNode[] = [];

    const pointer = {
      x: -1000,
      y: -1000,
      active: false,
    };

    const buildGrid = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth;
      height = parent.clientHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const spacing = width < 768 ? 56 : 48;
      nodes = [];

      for (let gx = spacing / 2; gx < width; gx += spacing) {
        for (let gy = spacing / 2; gy < height; gy += spacing) {
          nodes.push({
            originX: gx,
            originY: gy,
            x: gx,
            y: gy,
            vx: 0,
            vy: 0,
          });
        }
      }
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(161, 161, 170, 0.16)';
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        ctx.beginPath();
        ctx.arc(n.originX, n.originY, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const renderLoop = () => {
      ctx.clearRect(0, 0, width, height);

      const radius = 155;
      const radiusSq = radius * radius;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        if (pointer.active) {
          const dx = pointer.x - n.x;
          const dy = pointer.y - n.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < radiusSq && distSq > 0.1) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / radius) * 2.4;
            n.vx -= (dx / dist) * force;
            n.vy -= (dy / dist) * force;
          }
        }

        // Spring back to architectural grid origin
        n.vx += (n.originX - n.x) * 0.085;
        n.vy += (n.originY - n.y) * 0.085;

        // Damping
        n.vx *= 0.8;
        n.vy *= 0.8;

        n.x += n.vx;
        n.y += n.vy;

        const displacement = Math.hypot(n.x - n.originX, n.y - n.originY);
        const isEnergized = displacement > 1.2;

        if (isEnergized) {
          const alpha = Math.min(0.85, 0.25 + displacement * 0.04);
          ctx.fillStyle = `rgba(59, 130, 246, ${alpha.toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 1.75, 0, Math.PI * 2);
          ctx.fill();

          // Subtle architectural tether back to origin
          ctx.strokeStyle = 'rgba(37, 99, 235, 0.22)';
          ctx.lineWidth = 0.75;
          ctx.beginPath();
          ctx.moveTo(n.originX, n.originY);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();
        } else {
          ctx.fillStyle = 'rgba(161, 161, 170, 0.18)';
          ctx.beginPath();
          ctx.arc(n.x, n.y, 1.05, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = window.requestAnimationFrame(renderLoop);
    };

    buildGrid();

    if (prefersReducedMotion) {
      drawStatic();
      const handleResizeStatic = () => {
        buildGrid();
        drawStatic();
      };
      window.addEventListener('resize', handleResizeStatic);
      return () => window.removeEventListener('resize', handleResizeStatic);
    }

    const handlePointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;
        pointer.active = true;
      } else {
        pointer.active = false;
      }
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    const handleClickBurst = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const dx = n.x - cx;
        const dy = n.y - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < 220 && dist > 1) {
          const impulse = (1 - dist / 220) * 12;
          n.vx += (dx / dist) * impulse;
          n.vy += (dy / dist) * impulse;
        }
      }
    };

    const handleResize = () => {
      buildGrid();
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('click', handleClickBurst);
    window.addEventListener('resize', handleResize);
    document.addEventListener('mouseleave', handlePointerLeave);

    animationFrameId = window.requestAnimationFrame(renderLoop);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('click', handleClickBurst);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
