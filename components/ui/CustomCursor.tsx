'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import gsap from 'gsap';

function subscribeCursorCapability(callback: () => void) {
  const fineMql = window.matchMedia('(pointer: fine)');
  const motionMql = window.matchMedia('(prefers-reduced-motion: reduce)');
  fineMql.addEventListener('change', callback);
  motionMql.addEventListener('change', callback);
  return () => {
    fineMql.removeEventListener('change', callback);
    motionMql.removeEventListener('change', callback);
  };
}

function getCursorCapabilitySnapshot() {
  return (
    window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function getServerCursorCapabilitySnapshot() {
  return false;
}

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [cursorLabel, setCursorLabel] = useState<string>('');
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);

  const isEnabled = useSyncExternalStore(
    subscribeCursorCapability,
    getCursorCapabilitySnapshot,
    getServerCursorCapabilitySnapshot
  );

  useEffect(() => {
    if (!isEnabled || !dotRef.current || !ringRef.current) return;

    const dot = dotRef.current;
    const ring = ringRef.current;

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });

    const xDot = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3.out' });
    const yDot = gsap.quickTo(yDotTarget(dot), 'y', {
      duration: 0.08,
      ease: 'power3.out',
    });

    const xRing = gsap.quickTo(ring, 'x', {
      duration: 0.28,
      ease: 'power3.out',
    });
    const yRing = gsap.quickTo(ring, 'y', {
      duration: 0.28,
      ease: 'power3.out',
    });

    let hasMoved = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!hasMoved) {
        hasMoved = true;
        gsap.to([dot, ring], { opacity: 1, duration: 0.25 });
      }

      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const labeledEl = target.closest<HTMLElement>('[data-cursor]');
      const clickableEl = target.closest<HTMLElement>(
        'a, button, input, textarea, [role="button"], [role="tab"]'
      );

      if (labeledEl) {
        const nextLabel = labeledEl.getAttribute('data-cursor') || '';
        setCursorLabel(nextLabel);
        setIsHoveringInteractive(true);
      } else if (clickableEl) {
        setCursorLabel('');
        setIsHoveringInteractive(true);
      } else {
        setCursorLabel('');
        setIsHoveringInteractive(false);
      }
    };

    const handleMouseDown = () => {
      gsap.to(ring, { scale: 0.86, duration: 0.12, ease: 'power2.out' });
    };

    const handleMouseUp = () => {
      gsap.to(ring, { scale: 1, duration: 0.2, ease: 'elastic.out(1, 0.4)' });
    };

    const handleMouseLeaveWindow = () => {
      gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
      hasMoved = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeaveWindow);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className={`pointer-events-none fixed top-0 left-0 z-[80] h-1.5 w-1.5 rounded-full bg-[#3B82F6] transition-transform duration-150 will-change-transform ${
          cursorLabel ? 'scale-0' : 'scale-100'
        }`}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className={`pointer-events-none fixed top-0 left-0 z-[79] flex items-center justify-center rounded-full border transition-all duration-200 will-change-transform ${
          cursorLabel
            ? 'h-16 w-16 border-[#3B82F6] bg-[#2563EB]/90 text-white shadow-lg'
            : isHoveringInteractive
              ? 'h-10 w-10 border-[#3B82F6]/80 bg-[#3B82F6]/10'
              : 'h-7 w-7 border-zinc-500/45 bg-transparent'
        }`}
      >
        {cursorLabel && (
          <span className="font-[family-name:var(--font-mono)] text-[10px] font-medium tracking-tight whitespace-nowrap px-1">
            {cursorLabel}
          </span>
        )}
      </div>
    </>
  );
}

function yDotTarget(el: HTMLDivElement) {
  return el;
}
