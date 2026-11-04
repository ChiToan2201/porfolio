'use client';

import React from 'react';
import { CHAPTERS } from '@/data/portfolio-data';
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider';

interface ChapterRailProps {
  activeChapterId: string;
}

export default function ChapterRail({ activeChapterId }: ChapterRailProps) {
  const { scrollToSection } = useSmoothScroll();

  return (
    <aside
      aria-label="Chapter Progress Indicator"
      className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-3"
    >
      {CHAPTERS.map((chapter) => {
        const isActive = activeChapterId === chapter.id;
        return (
          <button
            key={chapter.id}
            type="button"
            onClick={() => scrollToSection(chapter.id)}
            aria-label={`Jump to ${chapter.title}`}
            aria-current={isActive ? 'location' : undefined}
            className="group flex items-center gap-2.5 py-1 text-right cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
          >
            <span
              className={`text-xs transition-all duration-150 whitespace-nowrap ${
                isActive
                  ? 'opacity-100 translate-x-0 text-[#F4F4F5] font-medium'
                  : 'opacity-0 translate-x-1 text-zinc-500 group-hover:opacity-100 group-hover:translate-x-0'
              }`}
            >
              {chapter.shortLabel}
            </span>
            <span
              className={`font-[family-name:var(--font-mono)] tabular-nums text-[11px] transition-colors duration-150 ${
                isActive
                  ? 'text-[#3B82F6] font-medium'
                  : 'text-zinc-600 group-hover:text-zinc-300'
              }`}
            >
              {chapter.number}
            </span>
            <span
              aria-hidden="true"
              className={`h-px transition-all duration-200 origin-right ${
                isActive
                  ? 'w-6 bg-[#2563EB]'
                  : 'w-2.5 bg-zinc-700 group-hover:w-4 group-hover:bg-zinc-400'
              }`}
            />
          </button>
        );
      })}
    </aside>
  );
}
