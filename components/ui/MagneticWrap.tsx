'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP);
}

interface MagneticWrapProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export default function MagneticWrap({
  children,
  strength = 0.28,
  className = 'inline-block',
}: MagneticWrapProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        '(pointer: fine) and (prefers-reduced-motion: no-preference)',
        () => {
          const el = wrapRef.current;
          if (!el) return;

          const xTo = gsap.quickTo(el, 'x', {
            duration: 0.45,
            ease: 'power3.out',
          });
          const yTo = gsap.quickTo(el, 'y', {
            duration: 0.45,
            ease: 'power3.out',
          });

          const onMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            const relX = e.clientX - (rect.left + rect.width / 2);
            const relY = e.clientY - (rect.top + rect.height / 2);
            xTo(relX * strength);
            yTo(relY * strength);
          };

          const onLeave = () => {
            gsap.to(el, {
              x: 0,
              y: 0,
              duration: 0.7,
              ease: 'elastic.out(1, 0.35)',
            });
          };

          el.addEventListener('mousemove', onMove);
          el.addEventListener('mouseleave', onLeave);

          return () => {
            el.removeEventListener('mousemove', onMove);
            el.removeEventListener('mouseleave', onLeave);
          };
        }
      );
    },
    { scope: wrapRef }
  );

  return (
    <div ref={wrapRef} className={`${className} will-change-transform`}>
      {children}
    </div>
  );
}
