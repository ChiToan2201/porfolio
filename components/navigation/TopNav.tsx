'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { DEVELOPER_PROFILE } from '@/data/portfolio-data';
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface TopNavProps {
  activeChapterId: string;
}

const NAV_ITEMS = [
  { id: 'about', label: 'About' },
  { id: 'stack', label: 'Stack' },
  { id: 'projects', label: 'Projects' },
  { id: 'journey', label: 'Journey' },
  { id: 'contact', label: 'Contact' },
];

export default function TopNav({ activeChapterId }: TopNavProps) {
  const headerRef = useRef<HTMLElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const { scrollToSection } = useSmoothScroll();

  useGSAP(
    () => {
      if (!progressBarRef.current) return;

      gsap.set(progressBarRef.current, { scaleX: 0 });

      gsap.to(progressBarRef.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.15,
        },
      });
    },
    { scope: headerRef }
  );

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    e.preventDefault();
    scrollToSection(targetId);
  };

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#09090B]/88 backdrop-blur-md border-b border-zinc-800/80"
    >
      {/* Scroll Progress Indicator (Transform-Only scaleX) */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-900 overflow-hidden"
      >
        <div
          ref={progressBarRef}
          className="h-full w-full bg-[#2563EB] origin-left scale-x-0 will-change-transform"
        />
      </div>

      {/* Strict 3-Zone Top Bar Contract */}
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-8 px-5 sm:px-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#intro"
          onClick={(e) => handleNavClick(e, 'intro')}
          className="font-[family-name:var(--font-display)] text-base font-semibold tracking-tight text-[#F4F4F5] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3B82F6]"
        >
          {DEVELOPER_PROFILE.brandWordmark}
        </a>

        {/* Zone 2: 5 Single-Line Navigation Links */}
        <nav
          aria-label="Story Chapters"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeChapterId === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`relative py-1 transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3B82F6] ${
                  isActive
                    ? 'text-[#F4F4F5]'
                    : 'text-zinc-400 hover:text-[#F4F4F5]'
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute left-0 right-0 -bottom-0.5 h-px bg-[#3B82F6] transition-transform duration-200 origin-left ${
                    isActive ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => scrollToSection('contact')}
            className="h-9 px-4 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
          >
            Contact Me
          </button>
        </div>
      </div>
    </header>
  );
}
