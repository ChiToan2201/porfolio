'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface SectionTransitionRibbonProps {
  phrases: string[];
  direction?: 'left' | 'right';
}

export default function SectionTransitionRibbon({
  phrases,
  direction = 'left',
}: SectionTransitionRibbonProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (!trackRef.current || !wrapperRef.current) return;

        const xDelta = direction === 'left' ? -12 : 12;

        gsap.fromTo(
          trackRef.current,
          { xPercent: direction === 'left' ? 0 : -12 },
          {
            xPercent: xDelta,
            ease: 'none',
            scrollTrigger: {
              trigger: wrapperRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
            },
          }
        );
      });
    },
    { scope: wrapperRef }
  );

  const repeated = [...phrases, ...phrases, ...phrases, ...phrases];

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="relative overflow-hidden border-y border-zinc-900 bg-[#0B0B0E] py-3.5 select-none"
    >
      <div
        ref={trackRef}
        className="flex items-center gap-8 whitespace-nowrap will-change-transform"
      >
        {repeated.map((phrase, idx) => (
          <div
            key={`${phrase}-${idx}`}
            className="flex items-center gap-8 shrink-0 text-xs text-zinc-500 tracking-wide"
          >
            <span>{phrase}</span>
            <span className="text-[#2563EB]">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}
