'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP);
}

interface TiltCardProps {
  children: React.ReactNode;
  maxTilt?: number;
  className?: string;
  cursorLabel?: string;
}

export default function TiltCard({
  children,
  maxTilt = 6,
  className = '',
  cursorLabel,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        '(pointer: fine) and (prefers-reduced-motion: no-preference)',
        () => {
          const card = cardRef.current;
          const glare = glareRef.current;
          if (!card) return;

          gsap.set(card, { transformPerspective: 950 });

          const rotXTo = gsap.quickTo(card, 'rotationX', {
            duration: 0.4,
            ease: 'power3.out',
          });
          const rotYTo = gsap.quickTo(card, 'rotationY', {
            duration: 0.4,
            ease: 'power3.out',
          });

          const glareXTo = glare
            ? gsap.quickTo(glare, 'x', { duration: 0.35, ease: 'power3.out' })
            : null;
          const glareYTo = glare
            ? gsap.quickTo(glare, 'y', { duration: 0.35, ease: 'power3.out' })
            : null;

          const handleMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width;
            const py = (e.clientY - rect.top) / rect.height;

            const tiltX = (0.5 - py) * maxTilt * 2;
            const tiltY = (px - 0.5) * maxTilt * 2;

            rotXTo(tiltX);
            rotYTo(tiltY);

            if (glare && glareXTo && glareYTo) {
              glareXTo(e.clientX - rect.left - 160);
              glareYTo(e.clientY - rect.top - 160);
            }
          };

          const handleEnter = () => {
            if (glare) {
              gsap.to(glare, { opacity: 1, duration: 0.25 });
            }
          };

          const handleLeave = () => {
            rotXTo(0);
            rotYTo(0);
            if (glare) {
              gsap.to(glare, { opacity: 0, duration: 0.3 });
            }
          };

          card.addEventListener('mousemove', handleMove);
          card.addEventListener('mouseenter', handleEnter);
          card.addEventListener('mouseleave', handleLeave);

          return () => {
            card.removeEventListener('mousemove', handleMove);
            card.removeEventListener('mouseenter', handleEnter);
            card.removeEventListener('mouseleave', handleLeave);
          };
        }
      );
    },
    { scope: cardRef }
  );

  return (
    <div
      ref={cardRef}
      data-cursor={cursorLabel}
      className={`relative overflow-hidden will-change-transform ${className}`}
    >
      <div
        ref={glareRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-20 h-80 w-80 rounded-full bg-white/[0.045] blur-2xl opacity-0 will-change-transform"
      />
      {children}
    </div>
  );
}
