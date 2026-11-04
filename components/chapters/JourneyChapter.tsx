'use client';

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { JOURNEY_STAGES } from '@/data/portfolio-data';
import ChapterHeader from '@/components/ui/ChapterHeader';
import TiltCard from '@/components/ui/TiltCard';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const STAGE_PRACTICE_NOTES: Record<string, string[]> = {
  'stage-01': [
    'Built responsive multi-section layouts from scratch without UI frameworks.',
    'Practiced semantic HTML5 tags, keyboard tab order, and clean CSS architecture.',
  ],
  'stage-02': [
    'Structured reusable component hierarchies in both Angular and React.',
    'Adopted RxJS operators and NgRx Store to eliminate race conditions in async UI.',
  ],
  'stage-03': [
    'Designed Express.js REST endpoints and connected MongoDB persistence layers.',
    'Configured Dockerfiles and compose services for reproducible local setups.',
  ],
  'stage-04': [
    'Focused on compositor-friendly GSAP ScrollTrigger storytelling and UX polish.',
    'Prepared clean, modular codebases ready for collaborative team code reviews.',
  ],
};

export default function JourneyChapter() {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineWrapRef = useRef<HTMLDivElement>(null);
  const progressBeamRef = useRef<HTMLDivElement>(null);

  const [expandedStageId, setExpandedStageId] = useState<string>('stage-01');

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (progressBeamRef.current && timelineWrapRef.current) {
          gsap.set(progressBeamRef.current, { scaleY: 0 });

          gsap.to(progressBeamRef.current, {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: timelineWrapRef.current,
              start: 'top 68%',
              end: 'bottom 68%',
              scrub: 0.4,
            },
          });
        }

        const cards = gsap.utils.toArray<HTMLElement>('.journey-stage-card');
        cards.forEach((card, index) => {
          const isEven = index % 2 === 0;
          gsap.from(card, {
            x: isEven ? -28 : 28,
            y: 22,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 82%',
              once: true,
            },
          });
        });

        const nodes = gsap.utils.toArray<HTMLElement>('.journey-node-dot');
        nodes.forEach((node) => {
          gsap.fromTo(
            node,
            { scale: 0.75 },
            {
              scale: 1.2,
              duration: 0.35,
              ease: 'back.out(2)',
              scrollTrigger: {
                trigger: node,
                start: 'top 70%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });
      });
    },
    { scope: sectionRef }
  );

  const handleSelectAndScrollStage = (stageId: string) => {
    setExpandedStageId((prev) => (prev === stageId ? '' : stageId));
    const el = document.getElementById(`journey-node-${stageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section
      id="journey"
      ref={sectionRef}
      aria-label="Chapter 05: My Journey"
      className="relative py-24 sm:py-32 bg-[#0B0B0E] border-b border-zinc-800/80"
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <ChapterHeader
          chapterNumber="05"
          chapterLabel="My Journey"
          title="Step by step: from static markup to full-stack engineering."
          description="Scroll to draw the active progression spine or click any stage card to expand hands-on practice takeaways."
          rightSlot={
            <div className="flex flex-wrap items-center gap-1.5">
              {JOURNEY_STAGES.map((st) => {
                const isOpen = expandedStageId === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleSelectAndScrollStage(st.id)}
                    className={`h-8 px-3 rounded-md font-[family-name:var(--font-mono)] tabular-nums text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      isOpen
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-[#121218] text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    Stage {st.stageNumber}
                  </button>
                );
              })}
            </div>
          }
        />

        <div
          ref={timelineWrapRef}
          className="relative mt-16 sm:mt-24 pl-8 md:pl-0"
        >
          {/* Background Static Spine */}
          <div
            aria-hidden="true"
            className="absolute left-3 md:left-1/2 top-2 bottom-2 w-px bg-zinc-800 md:-translate-x-1/2"
          />

          {/* Scroll-Scrubbed Active Cobalt Spine */}
          <div
            ref={progressBeamRef}
            aria-hidden="true"
            className="absolute left-3 md:left-1/2 top-2 bottom-2 w-0.5 bg-[#2563EB] origin-top md:-translate-x-1/2 will-change-transform"
          />

          <div className="space-y-14 md:space-y-20">
            {JOURNEY_STAGES.map((stage, idx) => {
              const isLeftOnDesktop = idx % 2 === 0;
              const isExpanded = expandedStageId === stage.id;
              const practiceNotes = STAGE_PRACTICE_NOTES[stage.id] ?? [];

              return (
                <div
                  id={`journey-node-${stage.id}`}
                  key={stage.id}
                  className="relative grid grid-cols-1 md:grid-cols-12 items-start gap-6 md:gap-10"
                >
                  {/* Center / Rail Milestone Node */}
                  <button
                    type="button"
                    aria-label={`Toggle Stage ${stage.stageNumber}`}
                    onClick={() =>
                      setExpandedStageId((prev) =>
                        prev === stage.id ? '' : stage.id
                      )
                    }
                    className={`journey-node-dot absolute -left-[26px] md:left-1/2 top-6 h-4 w-4 rounded-full border-2 md:-translate-x-1/2 z-10 cursor-pointer transition-colors will-change-transform ${
                      isExpanded
                        ? 'border-[#60A5FA] bg-[#2563EB]'
                        : 'border-[#3B82F6] bg-[#0B0B0E]'
                    }`}
                  />

                  <div
                    className={`md:col-span-6 ${
                      isLeftOnDesktop ? 'md:pr-12' : 'md:order-2 md:pl-12'
                    }`}
                  >
                    <TiltCard
                      maxTilt={4}
                      cursorLabel={isExpanded ? 'Collapse' : 'Expand'}
                      className="journey-stage-card rounded-xl"
                    >
                      <article
                        onClick={() =>
                          setExpandedStageId((prev) =>
                            prev === stage.id ? '' : stage.id
                          )
                        }
                        className={`rounded-xl border p-6 sm:p-8 transition-colors cursor-pointer ${
                          isExpanded
                            ? 'border-[#2563EB]/80 bg-[#111522]'
                            : 'border-zinc-800/90 bg-[#0F0F14] hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs text-zinc-400 mb-3">
                          <span className="font-[family-name:var(--font-mono)] tabular-nums text-[#3B82F6] font-medium">
                            Stage {stage.stageNumber}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-[family-name:var(--font-mono)] tabular-nums text-zinc-500">
                              {stage.periodPlaceholder}
                            </span>
                            <ChevronDown
                              className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180 text-[#3B82F6]' : ''
                              }`}
                            />
                          </div>
                        </div>

                        <h3 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-semibold text-[#F4F4F5]">
                          {stage.title}
                        </h3>

                        <p className="mt-1.5 text-xs text-zinc-400">
                          {stage.subtitlePlaceholder}
                        </p>

                        <p className="mt-4 text-sm sm:text-[15px] text-zinc-300 leading-relaxed">
                          {stage.narrativePlaceholder}
                        </p>

                        <div className="mt-5 pt-4 border-t border-zinc-800/80 space-y-1.5">
                          {stage.keyMilestones.map((milestone) => (
                            <p
                              key={milestone}
                              className="font-[family-name:var(--font-mono)] text-xs text-zinc-400"
                            >
                              {milestone}
                            </p>
                          ))}
                        </div>

                        {/* Expandable Interactive Practice Takeaways */}
                        <AnimatePresence initial={false}>
                          {isExpanded && practiceNotes.length > 0 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-5 pt-4 border-t border-[#2563EB]/30 space-y-2">
                                <p className="text-xs font-semibold text-[#60A5FA]">
                                  Hands-On Practice Notes
                                </p>
                                {practiceNotes.map((note) => (
                                  <p
                                    key={note}
                                    className="text-xs sm:text-sm text-zinc-300 leading-relaxed"
                                  >
                                    · {note}
                                  </p>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </article>
                    </TiltCard>
                  </div>

                  <div
                    aria-hidden="true"
                    className={`hidden md:block md:col-span-6 ${
                      isLeftOnDesktop ? 'md:order-2' : 'md:order-1'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
