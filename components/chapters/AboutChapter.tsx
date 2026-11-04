'use client';

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { SlidersHorizontal } from 'lucide-react';
import {
  ABOUT_EDUCATION_TIMELINE,
  ABOUT_PARAGRAPHS,
  DEVELOPER_PROFILE,
} from '@/data/portfolio-data';
import dynamic from 'next/dynamic';
import ChapterHeader from '@/components/ui/ChapterHeader';

const ThreePortraitStage = dynamic(
  () => import('@/components/three/ThreePortraitStage'),
  {
    ssr: false,
    loading: () => (
      <div className="relative aspect-[3/4] w-full rounded-xl border border-zinc-800/90 bg-[#0B0B0F] flex items-center justify-center text-xs text-zinc-500">
        Initializing 3D Portrait Viewport...
      </div>
    ),
  }
);

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function AboutChapter() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeBeatId, setActiveBeatId] = useState<string>(
    ABOUT_PARAGRAPHS[0].id
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const storyBlocks =
          gsap.utils.toArray<HTMLElement>('.about-story-block');

        storyBlocks.forEach((block) => {
          const beatId = block.getAttribute('data-beat-id');
          const words = block.querySelectorAll('.about-word');

          if (words.length > 0) {
            gsap.fromTo(
              words,
              { opacity: 0.22 },
              {
                opacity: 1,
                stagger: 0.04,
                ease: 'none',
                scrollTrigger: {
                  trigger: block,
                  start: 'top 80%',
                  end: 'bottom 58%',
                  scrub: 0.35,
                  onEnter: () => {
                    if (beatId) setActiveBeatId(beatId);
                  },
                  onEnterBack: () => {
                    if (beatId) setActiveBeatId(beatId);
                  },
                },
              }
            );
          }
        });

        const milestones = gsap.utils.toArray<HTMLElement>('.about-milestone');
        if (milestones.length > 0) {
          gsap.from(milestones, {
            y: 26,
            opacity: 0,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '.about-timeline-wrap',
              start: 'top 84%',
              once: true,
            },
          });
        }
      });
    },
    { scope: sectionRef }
  );

  const handleJumpToBeat = (beatId: string) => {
    setActiveBeatId(beatId);
    const el = document.getElementById(`about-beat-${beatId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section
      id="about"
      ref={sectionRef}
      aria-label="Chapter 02: About Me"
      className="relative py-24 sm:py-32 border-b border-zinc-800/80"
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <ChapterHeader
          chapterNumber="02"
          chapterLabel="About Me"
          title="Every interface begins with curiosity about how people think and interact."
          description="Interact with the Three.js 3D Portrait Monolith — drag to orbit, move your pointer to ripple the relief surface, adjust 3D exploded depth, or switch studio finishes."
        />

        <div className="mt-14 lg:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Sticky Interactive Three.js 3D Portrait Monolith Column */}
          <div className="lg:col-span-5 lg:sticky lg:top-20">
            <ThreePortraitStage
              portraitSrc={DEVELOPER_PROFILE.portraitSrc}
              developerName={DEVELOPER_PROFILE.fullNamePlaceholder}
              developerRole={DEVELOPER_PROFILE.role}
            />
          </div>

          {/* Scrolling Word-Illuminated Narrative & Learning Timeline Column */}
          <div className="lg:col-span-7 space-y-14">
            {/* Interactive Story Beat Quick-Jumper */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <SlidersHorizontal className="h-3.5 w-3.5 text-[#3B82F6]" />
                <span>Story Beats</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {ABOUT_PARAGRAPHS.map((p, idx) => {
                  const isActive = activeBeatId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleJumpToBeat(p.id)}
                      className={`h-7 px-2.5 rounded text-xs font-[family-name:var(--font-mono)] tabular-nums transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-[#121217] text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      Beat 0{idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Word-by-Word Scroll-Scrubbed Story Paragraphs */}
            <div className="space-y-12">
              {ABOUT_PARAGRAPHS.map((paragraph) => {
                const words = paragraph.content.split(' ');
                const isActive = activeBeatId === paragraph.id;
                return (
                  <article
                    id={`about-beat-${paragraph.id}`}
                    data-beat-id={paragraph.id}
                    key={paragraph.id}
                    onClick={() => setActiveBeatId(paragraph.id)}
                    className={`about-story-block pb-10 border-b border-zinc-800/60 last:border-b-0 transition-colors cursor-pointer ${
                      isActive ? 'text-[#F4F4F5]' : 'text-zinc-300'
                    }`}
                  >
                    <p className="font-[family-name:var(--font-mono)] tabular-nums text-xs text-[#3B82F6] mb-3">
                      {paragraph.kicker}
                    </p>
                    <p className="text-lg sm:text-xl leading-relaxed max-w-[62ch]">
                      {words.map((word, wIdx) => (
                        <React.Fragment key={`${paragraph.id}-${wIdx}`}>
                          <span className="about-word inline-block will-change-[opacity]">
                            {word}
                          </span>
                          {wIdx < words.length - 1 ? ' ' : ''}
                        </React.Fragment>
                      ))}
                    </p>
                  </article>
                );
              })}
            </div>

            {/* Education & Learning Progression Timeline */}
            <div className="about-timeline-wrap pt-6 border-t border-zinc-800/90">
              <div className="flex items-center justify-between gap-4 mb-8">
                <h3 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-semibold text-[#F4F4F5]">
                  Education &amp; Growth Snapshot
                </h3>
                <span className="font-[family-name:var(--font-mono)] tabular-nums text-xs text-zinc-500">
                  Academic &amp; Self-Study
                </span>
              </div>

              <div className="relative pl-6 sm:pl-8 space-y-10 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-zinc-800">
                {ABOUT_EDUCATION_TIMELINE.map((item, idx) => (
                  <div
                    key={`${item.periodPlaceholder}-${idx}`}
                    className="about-milestone group relative"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute -left-[22px] sm:-left-[30px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[#3B82F6] bg-[#09090B] group-hover:scale-125 group-hover:bg-[#3B82F6] transition-transform"
                    />
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-zinc-400 mb-1.5">
                      <span className="font-[family-name:var(--font-mono)] tabular-nums text-[#60A5FA]">
                        {item.periodPlaceholder}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{item.institutionPlaceholder}</span>
                    </div>
                    <h4 className="text-base sm:text-lg font-semibold text-[#F4F4F5]">
                      {item.titlePlaceholder}
                    </h4>
                    <p className="mt-2 text-sm sm:text-[15px] text-zinc-400 leading-relaxed max-w-[62ch]">
                      {item.summaryPlaceholder}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
