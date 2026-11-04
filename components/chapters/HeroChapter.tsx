'use client';

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowDown, ArrowUpRight, Command, Mail } from 'lucide-react';
import { CHAPTERS, DEVELOPER_PROFILE } from '@/data/portfolio-data';
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider';
import HeroInteractiveCanvas from '@/components/ui/HeroInteractiveCanvas';
import MagneticWrap from '@/components/ui/MagneticWrap';
import TiltCard from '@/components/ui/TiltCard';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const CHAPTER_PREVIEWS: Record<string, string> = {
  intro: 'Opening statement, interactive physics grid & quick story index.',
  about: 'Word-by-word scroll reading, portrait tone switcher & education.',
  stack: 'Interactive 15-tech matrix, stack presets & live pipeline simulator.',
  projects: 'Horizontal pinned showcase with interactive wireframe prototypes.',
  journey: 'Scroll-scrubbed timeline spine with expandable learning stages.',
  contact: 'One-click email copy, social channels & topic inquiry composer.',
};

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/-+';

interface HeroChapterProps {
  onOpenCommandPalette?: () => void;
}

export default function HeroChapter({
  onOpenCommandPalette,
}: HeroChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgFrameRef = useRef<HTMLDivElement>(null);
  const contentWrapRef = useRef<HTMLDivElement>(null);
  const { scrollToSection } = useSmoothScroll();

  const [hoveredChapterId, setHoveredChapterId] = useState<string>('about');
  const [roleText, setRoleText] = useState<string>(DEVELOPER_PROFILE.role);
  const isScramblingRef = useRef(false);

  const triggerRoleDecode = () => {
    if (isScramblingRef.current) return;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) return;

    isScramblingRef.current = true;
    const target = DEVELOPER_PROFILE.role;
    let iteration = 0;

    const interval = window.setInterval(() => {
      setRoleText(
        target
          .split('')
          .map((char, idx) => {
            if (char === ' ') return ' ';
            if (idx < iteration) return target[idx];
            return SCRAMBLE_CHARS[
              Math.floor(Math.random() * SCRAMBLE_CHARS.length)
            ];
          })
          .join('')
      );

      iteration += 1.2;
      if (iteration >= target.length) {
        window.clearInterval(interval);
        setRoleText(target);
        isScramblingRef.current = false;
      }
    }, 28);
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

        tl.from('.hero-kicker', {
          y: 20,
          opacity: 0,
          duration: 0.7,
        })
          .from(
            '.hero-line-inner',
            {
              yPercent: 118,
              rotate: 1.5,
              opacity: 0,
              duration: 0.95,
              stagger: 0.12,
            },
            '-=0.45'
          )
          .from(
            '.hero-subcopy',
            {
              y: 22,
              opacity: 0,
              duration: 0.75,
            },
            '-=0.55'
          )
          .from(
            '.hero-cta-group',
            {
              y: 18,
              opacity: 0,
              duration: 0.65,
            },
            '-=0.5'
          )
          .from(
            '.hero-index-panel',
            {
              y: 34,
              opacity: 0,
              duration: 0.85,
            },
            '-=0.65'
          )
          .from(
            '.hero-vector-ring',
            {
              scale: 0.88,
              opacity: 0,
              duration: 1.25,
              stagger: 0.15,
              ease: 'power2.out',
            },
            0.1
          );

        gsap.to('.hero-float-slow', {
          y: -22,
          rotation: 6,
          duration: 6.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });

        gsap.to('.hero-float-reverse', {
          y: 18,
          rotation: -5,
          duration: 5.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });

        if (contentWrapRef.current && sectionRef.current) {
          gsap.to(contentWrapRef.current, {
            yPercent: -10,
            opacity: 0.3,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.5,
            },
          });
        }

        if (bgFrameRef.current && sectionRef.current) {
          gsap.to(bgFrameRef.current, {
            yPercent: 18,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.6,
            },
          });
        }
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="intro"
      ref={sectionRef}
      aria-label="Chapter 01: Introduction"
      className="relative min-h-[100svh] flex flex-col justify-between pt-20 pb-8 sm:pt-24 sm:pb-10 overflow-hidden border-b border-zinc-800/80"
    >
      {/* Interactive Spring-Physics Canvas & Kinetic Architectural Rings */}
      <div
        ref={bgFrameRef}
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden will-change-transform"
      >
        <HeroInteractiveCanvas />

        <div className="pointer-events-none hero-vector-ring hero-float-slow absolute -right-24 top-16 h-[460px] w-[460px] rounded-full border border-zinc-800/65" />
        <div className="pointer-events-none hero-vector-ring hero-float-reverse absolute -right-6 top-36 h-[330px] w-[330px] rounded-full border border-[#2563EB]/25" />
      </div>

      {/* Main Split-Screen Hero Content */}
      <div
        ref={contentWrapRef}
        className="relative z-10 mx-auto w-full max-w-[1280px] px-5 sm:px-8 my-auto py-8 lg:py-12 will-change-transform"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-stretch">
          {/* Left Column: Primary Narrative & Interactive Word-Hover Headline */}
          <div className="lg:col-span-8 flex flex-col justify-center">
            <div className="hero-kicker flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-zinc-400 mb-6">
              <span className="font-[family-name:var(--font-mono)] tabular-nums text-[#3B82F6] font-medium">
                Chapter 01
              </span>
              <span aria-hidden="true" className="text-zinc-600">
                ·
              </span>
              <span className="text-zinc-200 font-medium">
                {DEVELOPER_PROFILE.fullNamePlaceholder}
              </span>
              <span aria-hidden="true" className="text-zinc-600">
                ·
              </span>
              <button
                type="button"
                onMouseEnter={triggerRoleDecode}
                onClick={triggerRoleDecode}
                data-cursor="Decode"
                className="font-[family-name:var(--font-mono)] text-xs sm:text-sm text-zinc-300 hover:text-[#60A5FA] transition-colors cursor-pointer whitespace-nowrap"
              >
                {roleText}
              </button>
            </div>

            {/* Line-by-line Reveal + Word-Level Kinetic Lift */}
            <h1 className="font-[family-name:var(--font-display)] text-[2.5rem] sm:text-6xl lg:text-[4.15rem] font-semibold tracking-tight text-[#F4F4F5] leading-[1.06]">
              {DEVELOPER_PROFILE.headlineLines.map((line, lineIndex) => (
                <span key={line} className="block overflow-hidden py-1">
                  <span
                    className={`hero-line-inner block will-change-transform ${
                      lineIndex === 1 ? 'text-[#3B82F6]' : 'text-[#F4F4F5]'
                    }`}
                  >
                    {line.split(' ').map((word, wordIdx, arr) => (
                      <React.Fragment key={`${lineIndex}-${word}-${wordIdx}`}>
                        <span className="inline-block transition-transform duration-200 hover:-translate-y-1.5">
                          {word}
                        </span>
                        {wordIdx < arr.length - 1 ? ' ' : ''}
                      </React.Fragment>
                    ))}
                  </span>
                </span>
              ))}
            </h1>

            <p className="hero-subcopy mt-6 text-base sm:text-lg text-zinc-400 leading-relaxed max-w-[60ch]">
              {DEVELOPER_PROFILE.introSummaryPlaceholder}
            </p>

            {/* Magnetic Primary & Secondary CTAs */}
            <div className="hero-cta-group mt-9 flex flex-wrap items-center gap-4">
              <MagneticWrap strength={0.32}>
                <button
                  type="button"
                  data-cursor="Explore"
                  onClick={() => scrollToSection('projects')}
                  className="h-11 px-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-md inline-flex items-center gap-2 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
                >
                  <span>View My Work</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0" />
                </button>
              </MagneticWrap>

              <MagneticWrap strength={0.26}>
                <button
                  type="button"
                  data-cursor="Say Hi"
                  onClick={() => scrollToSection('contact')}
                  className="h-11 px-6 bg-[#111114] hover:bg-zinc-800/80 text-[#F4F4F5] border border-zinc-800 text-sm font-medium rounded-md inline-flex items-center gap-2 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
                >
                  <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
                  <span>Contact Me</span>
                </button>
              </MagneticWrap>
            </div>
          </div>

          {/* Right Column: 3D Tilt Interactive Story Table of Contents */}
          <div className="hero-index-panel lg:col-span-4 flex">
            <TiltCard
              maxTilt={5}
              className="w-full flex flex-col justify-between rounded-xl border border-zinc-800/90 bg-[#0E0E12]/92 p-6 sm:p-7"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-4 mb-3">
                  <span className="text-xs font-medium text-zinc-300">
                    Interactive Story Index
                  </span>
                  {onOpenCommandPalette && (
                    <button
                      type="button"
                      onClick={onOpenCommandPalette}
                      data-cursor="Search"
                      className="h-7 px-2.5 rounded border border-zinc-800 bg-[#14141B] hover:border-[#3B82F6]/60 text-[11px] font-medium text-zinc-300 inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Command className="h-3 w-3 text-[#3B82F6]" />
                      <span className="font-[family-name:var(--font-mono)]">
                        Quick Jump · ⌘K
                      </span>
                    </button>
                  )}
                </div>

                <ol className="divide-y divide-zinc-800/60">
                  {CHAPTERS.map((chap) => {
                    const isHovered = hoveredChapterId === chap.id;
                    return (
                      <li key={chap.id}>
                        <button
                          type="button"
                          onMouseEnter={() => setHoveredChapterId(chap.id)}
                          onFocus={() => setHoveredChapterId(chap.id)}
                          onClick={() => scrollToSection(chap.id)}
                          data-cursor={`Ch.${chap.number}`}
                          className="w-full py-2.5 flex items-center justify-between gap-4 text-left group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`font-[family-name:var(--font-mono)] tabular-nums text-xs transition-colors ${
                                isHovered
                                  ? 'text-[#3B82F6] font-medium'
                                  : 'text-zinc-500 group-hover:text-[#3B82F6]'
                              }`}
                            >
                              {chap.number}
                            </span>
                            <span
                              className={`text-sm transition-transform duration-150 truncate ${
                                isHovered
                                  ? 'text-[#F4F4F5] translate-x-1 font-medium'
                                  : 'text-zinc-300 group-hover:text-[#F4F4F5]'
                              }`}
                            >
                              {chap.shortLabel}
                            </span>
                          </div>
                          <ArrowUpRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-[#3B82F6] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>

              {/* Dynamic Chapter Synopsis Preview */}
              <div className="pt-4 mt-4 border-t border-zinc-800/80 space-y-2.5">
                <p className="text-xs text-zinc-400 leading-relaxed min-h-[2.25rem]">
                  <span className="font-[family-name:var(--font-mono)] text-[#60A5FA] mr-1.5">
                    [{hoveredChapterId.toUpperCase()}]
                  </span>
                  {CHAPTER_PREVIEWS[hoveredChapterId]}
                </p>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-800/50">
                  <span>Move cursor or click canvas to ripple grid</span>
                  <span className="text-zinc-300">
                    {DEVELOPER_PROFILE.locationPlaceholder}
                  </span>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>

      {/* Full-Width Bottom Metadata & Scroll Invitation Row */}
      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 sm:px-8 pt-6 border-t border-zinc-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Front-end Architecture</span>
            <span aria-hidden="true">·</span>
            <span>Angular &amp; React</span>
            <span aria-hidden="true">·</span>
            <span>TypeScript &amp; Reactive State</span>
          </div>

          <button
            type="button"
            data-cursor="Scroll"
            onClick={() => scrollToSection('about')}
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#F4F4F5] transition-colors self-start sm:self-auto cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3B82F6]"
          >
            <span>Scroll to Chapter 02</span>
            <ArrowDown className="h-3.5 w-3.5 text-[#3B82F6]" />
          </button>
        </div>
      </div>
    </section>
  );
}
