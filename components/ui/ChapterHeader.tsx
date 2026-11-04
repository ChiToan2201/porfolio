'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface ChapterHeaderProps {
  chapterNumber: string;
  chapterLabel: string;
  title: string;
  description?: string;
  rightSlot?: React.ReactNode;
}

export default function ChapterHeader({
  chapterNumber,
  chapterLabel,
  title,
  description,
  rightSlot,
}: ChapterHeaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const items = containerRef.current?.querySelectorAll('.chapter-reveal');
        if (!items || items.length === 0) return;

        gsap.from(items, {
          y: 28,
          opacity: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 84%',
            once: true,
          },
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="pb-10 sm:pb-12 border-b border-zinc-800/80"
    >
      <div className="chapter-reveal flex items-center gap-2.5 text-xs text-zinc-400 mb-4">
        <span className="font-[family-name:var(--font-mono)] tabular-nums text-[#3B82F6] font-medium">
          Chapter {chapterNumber}
        </span>
        <span aria-hidden="true" className="text-zinc-600">
          ·
        </span>
        <span>{chapterLabel}</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="max-w-2xl">
          <h2 className="chapter-reveal font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-[2.65rem] font-semibold tracking-tight text-[#F4F4F5] leading-[1.12] [text-wrap:balance]">
            {title}
          </h2>
          {description && (
            <p className="chapter-reveal mt-4 text-[15px] sm:text-base text-zinc-400 leading-relaxed max-w-[65ch]">
              {description}
            </p>
          )}
        </div>

        {rightSlot && (
          <div className="chapter-reveal shrink-0">{rightSlot}</div>
        )}
      </div>
    </div>
  );
}
