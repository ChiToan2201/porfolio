'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  ArrowUpRight,
  Columns3,
  ExternalLink,
  Github,
  Rows3,
  X,
} from 'lucide-react';
import { FEATURED_PROJECTS, ProjectItem } from '@/data/portfolio-data';
import dynamic from 'next/dynamic';
import ChapterHeader from '@/components/ui/ChapterHeader';
import MagneticWrap from '@/components/ui/MagneticWrap';

const ThreeProjectShowcase = dynamic(
  () => import('@/components/three/ThreeProjectShowcase'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-[#0B0B0F] flex items-center justify-center text-xs text-zinc-500">
        Initializing 3D Project Stage...
      </div>
    ),
  }
);

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

type LayoutMode = 'horizontal' | 'vertical';

interface ModalState {
  project: ProjectItem;
  focusTab: 'overview' | 'demo' | 'source';
}

export default function ProjectsChapter() {
  const sectionRef = useRef<HTMLElement>(null);
  const horizontalStageRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);
  const reelProgressRef = useRef<HTMLDivElement>(null);
  const scrollTriggerInstanceRef = useRef<ScrollTrigger | null>(null);

  const [layoutMode, setLayoutMode] = useState<LayoutMode>('horizontal');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [modalState, setModalState] = useState<ModalState | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalState(null);
      }
    };
    if (modalState) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalState]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      if (layoutMode === 'horizontal') {
        mm.add(
          '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
          () => {
            const stage = horizontalStageRef.current;
            const track = horizontalTrackRef.current;
            if (!stage || !track) return;

            const panels = gsap.utils.toArray<HTMLElement>(
              '.project-horizontal-panel',
              track
            );
            if (panels.length <= 1) return;

            const getScrollAmount = () => track.scrollWidth - window.innerWidth;

            const horizontalTween = gsap.to(track, {
              x: () => -getScrollAmount(),
              ease: 'none',
              scrollTrigger: {
                trigger: stage,
                pin: true,
                scrub: 0.65,
                start: 'top top',
                end: () => `+=${getScrollAmount()}`,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                  scrollTriggerInstanceRef.current = self;
                  const idx = Math.min(
                    panels.length - 1,
                    Math.round(self.progress * (panels.length - 1))
                  );
                  setActiveSlideIndex(idx);

                  if (reelProgressRef.current) {
                    gsap.set(reelProgressRef.current, {
                      scaleX: self.progress,
                    });
                  }
                },
              },
            });

            panels.forEach((panel, idx) => {
              if (idx === 0) return;
              const artwork = panel.querySelector('.project-artwork-scale');
              if (artwork) {
                gsap.fromTo(
                  artwork,
                  { scale: 0.92, opacity: 0.6 },
                  {
                    scale: 1,
                    opacity: 1,
                    ease: 'power2.out',
                    scrollTrigger: {
                      trigger: panel,
                      containerAnimation: horizontalTween,
                      start: 'left 85%',
                      end: 'left 35%',
                      scrub: 0.4,
                    },
                  }
                );
              }
            });
          }
        );

        mm.add(
          '(max-width: 1023px) and (prefers-reduced-motion: no-preference)',
          () => {
            const cards = gsap.utils.toArray<HTMLElement>(
              '.project-mobile-section'
            );
            cards.forEach((card) => {
              const art = card.querySelector('.project-artwork-mobile');
              if (art) {
                gsap.from(art, {
                  scale: 0.94,
                  opacity: 0,
                  duration: 0.8,
                  ease: 'power3.out',
                  scrollTrigger: {
                    trigger: card,
                    start: 'top 82%',
                    once: true,
                  },
                });
              }
            });
          }
        );
      } else {
        scrollTriggerInstanceRef.current = null;
        mm.add('(prefers-reduced-motion: no-preference)', () => {
          const sections = gsap.utils.toArray<HTMLElement>(
            '.project-vertical-section'
          );
          sections.forEach((sec) => {
            const art = sec.querySelector('.project-vertical-artwork');
            if (art) {
              gsap.from(art, {
                scale: 0.94,
                y: 24,
                opacity: 0,
                duration: 0.85,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: sec,
                  start: 'top 80%',
                  once: true,
                },
              });
            }
          });
        });
      }
    },
    { scope: sectionRef, dependencies: [layoutMode], revertOnUpdate: true }
  );

  const handleModeSwitch = (nextMode: LayoutMode) => {
    if (nextMode === layoutMode) return;
    setLayoutMode(nextMode);
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  };

  const handleJumpToSlide = (slideIdx: number) => {
    const st = scrollTriggerInstanceRef.current;
    if (!st || FEATURED_PROJECTS.length <= 1) return;
    const ratio = slideIdx / (FEATURED_PROJECTS.length - 1);
    const targetScroll = st.start + (st.end - st.start) * ratio;
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  };

  const renderProjectActions = (project: ProjectItem) => {
    const isRealLiveUrl = project.liveDemoUrlPlaceholder.startsWith('http');
    const isRealSourceUrl = project.sourceCodeUrlPlaceholder.startsWith('http');

    return (
      <div className="mt-7 flex flex-wrap items-center gap-3.5">
        <MagneticWrap strength={0.25}>
          {isRealLiveUrl ? (
            <a
              href={project.liveDemoUrlPlaceholder}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="Demo"
              className="h-10 px-5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors duration-150 whitespace-nowrap shrink-0"
            >
              <span>Live Demo</span>
              <ArrowUpRight className="h-4 w-4 shrink-0" />
            </a>
          ) : (
            <button
              type="button"
              data-cursor="Demo"
              onClick={() => setModalState({ project, focusTab: 'demo' })}
              className="h-10 px-5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
            >
              <span>Live Demo</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </button>
          )}
        </MagneticWrap>

        <MagneticWrap strength={0.22}>
          {isRealSourceUrl ? (
            <a
              href={project.sourceCodeUrlPlaceholder}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="Code"
              className="h-10 px-5 rounded-md border border-zinc-800 bg-[#121217] hover:bg-zinc-800/80 text-[#F4F4F5] text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-colors duration-150 whitespace-nowrap shrink-0"
            >
              <Github className="h-4 w-4 text-zinc-400 shrink-0" />
              <span>Source Code</span>
            </a>
          ) : (
            <button
              type="button"
              data-cursor="Code"
              onClick={() => setModalState({ project, focusTab: 'source' })}
              className="h-10 px-5 rounded-md border border-zinc-800 bg-[#121217] hover:bg-zinc-800/80 text-[#F4F4F5] text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
            >
              <Github className="h-4 w-4 text-zinc-400 shrink-0" />
              <span>Source Code</span>
            </button>
          )}
        </MagneticWrap>
      </div>
    );
  };

  return (
    <section
      id="projects"
      ref={sectionRef}
      aria-label="Chapter 04: Featured Projects"
      className="relative border-b border-zinc-800/80"
    >
      {/* Chapter Intro Header */}
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 pt-24 sm:pt-32 pb-12">
        <ChapterHeader
          chapterNumber="04"
          chapterLabel="Featured Projects"
          title="Selected works presented as interactive Three.js 3D architectural stages."
          description="Drag any 3D viewport to orbit in real space, hover 3D components to inspect layers, or click Explode 3D to separate the hardware & software stack."
          rightSlot={
            <div
              role="group"
              aria-label="Project gallery layout mode"
              className="hidden lg:inline-flex items-center gap-1 p-1 rounded-lg bg-[#111116] border border-zinc-800/90"
            >
              <button
                type="button"
                onClick={() => handleModeSwitch('horizontal')}
                className={`h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                  layoutMode === 'horizontal'
                    ? 'bg-[#2563EB] text-white'
                    : 'text-zinc-400 hover:text-[#F4F4F5]'
                }`}
              >
                <Columns3 className="h-3.5 w-3.5 shrink-0" />
                <span>Horizontal Reel</span>
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('vertical')}
                className={`h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                  layoutMode === 'vertical'
                    ? 'bg-[#2563EB] text-white'
                    : 'text-zinc-400 hover:text-[#F4F4F5]'
                }`}
              >
                <Rows3 className="h-3.5 w-3.5 shrink-0" />
                <span>Sticky Stack</span>
              </button>
            </div>
          }
        />
      </div>

      {/* MODE A: Desktop Horizontal Pinned Scrollytelling + Mobile Vertical Sections */}
      {layoutMode === 'horizontal' ? (
        <>
          <div
            ref={horizontalStageRef}
            className="hidden lg:flex relative h-[100svh] w-full flex-col justify-between overflow-hidden bg-[#09090B]"
          >
            {/* Top Horizontal Reel Interactive Stepper & Progress Bar */}
            <div className="mx-auto w-full max-w-[1280px] px-8 pt-20 pb-4 flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                {FEATURED_PROJECTS.map((proj, sIdx) => {
                  const isCurrent = activeSlideIndex === sIdx;
                  return (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => handleJumpToSlide(sIdx)}
                      className={`h-7 px-3 rounded font-[family-name:var(--font-mono)] tabular-nums text-xs transition-colors cursor-pointer whitespace-nowrap ${
                        isCurrent
                          ? 'bg-[#2563EB] text-white font-medium'
                          : 'bg-[#121218] text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      Case {proj.index}
                    </button>
                  );
                })}
                <span className="ml-2 text-xs text-zinc-500">
                  Drag inside 3D viewport to orbit · Scroll page to switch case
                </span>
              </div>

              <div className="w-48 h-0.5 bg-zinc-800 overflow-hidden rounded-full">
                <div
                  ref={reelProgressRef}
                  className="h-full w-full bg-[#2563EB] origin-left scale-x-0 will-change-transform"
                />
              </div>
            </div>

            {/* Horizontal Sliding Track */}
            <div
              ref={horizontalTrackRef}
              className="flex flex-1 items-center will-change-transform"
            >
              {FEATURED_PROJECTS.map((project) => (
                <article
                  key={project.id}
                  className="project-horizontal-panel w-screen shrink-0 px-8"
                >
                  <div className="mx-auto max-w-[1280px] grid grid-cols-12 gap-12 items-center">
                    {/* Large Interactive Three.js 3D Viewport (Left 7 Columns) */}
                    <div className="col-span-7">
                      <div className="project-artwork-scale relative aspect-[16/10] w-full rounded-2xl border border-zinc-800/90 overflow-hidden will-change-transform">
                        <ThreeProjectShowcase
                          variant={project.blueprintVariant}
                          projectIndex={project.index}
                          techStack={project.techStack}
                          onExpandModal={() =>
                            setModalState({ project, focusTab: 'overview' })
                          }
                        />
                      </div>
                    </div>

                    {/* Project Narrative & Metadata (Right 5 Columns) */}
                    <div className="col-span-5">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-zinc-400 mb-3">
                        <span className="font-[family-name:var(--font-mono)] tabular-nums text-[#3B82F6] font-medium">
                          Case {project.index}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{project.rolePlaceholder}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-[family-name:var(--font-mono)] tabular-nums">
                          {project.timelinePlaceholder}
                        </span>
                      </div>

                      <h3 className="font-[family-name:var(--font-display)] text-2xl xl:text-3xl font-semibold text-[#F4F4F5] leading-tight [text-wrap:balance]">
                        {project.titlePlaceholder}
                      </h3>

                      <p className="mt-4 text-[15px] text-zinc-300 leading-relaxed">
                        {project.summaryPlaceholder}
                      </p>

                      <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                        {project.challengePlaceholder}
                      </p>

                      <div className="mt-6 pt-5 border-t border-zinc-800/80">
                        <p className="text-xs text-zinc-500 mb-1.5">
                          Technologies Used
                        </p>
                        <p className="font-[family-name:var(--font-mono)] text-xs text-zinc-200 leading-relaxed">
                          {project.techStack.join(' · ')}
                        </p>
                      </div>

                      {renderProjectActions(project)}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="h-8" aria-hidden="true" />
          </div>

          {/* Mobile & Tablet Dedicated Project Sections */}
          <div className="lg:hidden divide-y divide-zinc-800/80">
            {FEATURED_PROJECTS.map((project) => (
              <article
                key={project.id}
                className="project-mobile-section mx-auto max-w-[1280px] px-5 sm:px-8 py-16"
              >
                <div className="project-artwork-mobile relative aspect-[16/10] w-full rounded-xl border border-zinc-800/90 overflow-hidden mb-8">
                  <ThreeProjectShowcase
                    variant={project.blueprintVariant}
                    projectIndex={project.index}
                    techStack={project.techStack}
                    onExpandModal={() =>
                      setModalState({ project, focusTab: 'overview' })
                    }
                  />
                </div>

                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-zinc-400 mb-3">
                  <span className="font-[family-name:var(--font-mono)] tabular-nums text-[#3B82F6] font-medium">
                    Case {project.index}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{project.rolePlaceholder}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-[family-name:var(--font-mono)] tabular-nums">
                    {project.timelinePlaceholder}
                  </span>
                </div>

                <h3 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-semibold text-[#F4F4F5] [text-wrap:balance]">
                  {project.titlePlaceholder}
                </h3>

                <p className="mt-4 text-[15px] text-zinc-300 leading-relaxed">
                  {project.summaryPlaceholder}
                </p>

                <div className="mt-5 pt-4 border-t border-zinc-800/80">
                  <p className="text-xs text-zinc-500 mb-1">Technologies Used</p>
                  <p className="font-[family-name:var(--font-mono)] text-xs text-zinc-200">
                    {project.techStack.join(' · ')}
                  </p>
                </div>

                {renderProjectActions(project)}
              </article>
            ))}
          </div>
        </>
      ) : (
        /* MODE B: Dedicated Full-Section Sticky Stack */
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 pb-24 space-y-20">
          {FEATURED_PROJECTS.map((project) => (
            <article
              key={project.id}
              className="project-vertical-section lg:sticky lg:top-20 rounded-2xl border border-zinc-800/90 bg-[#0C0C10] p-6 sm:p-10 lg:p-12"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7">
                  <div className="project-vertical-artwork relative aspect-[16/10] w-full rounded-xl border border-zinc-800/90 overflow-hidden">
                    <ThreeProjectShowcase
                      variant={project.blueprintVariant}
                      projectIndex={project.index}
                      techStack={project.techStack}
                      onExpandModal={() =>
                        setModalState({ project, focusTab: 'overview' })
                      }
                    />
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-zinc-400 mb-3">
                    <span className="font-[family-name:var(--font-mono)] tabular-nums text-[#3B82F6] font-medium">
                      Case {project.index}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{project.rolePlaceholder}</span>
                  </div>

                  <h3 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-semibold text-[#F4F4F5] [text-wrap:balance]">
                    {project.titlePlaceholder}
                  </h3>

                  <p className="mt-4 text-[15px] text-zinc-300 leading-relaxed">
                    {project.summaryPlaceholder}
                  </p>

                  <div className="mt-6 pt-5 border-t border-zinc-800/80">
                    <p className="text-xs text-zinc-500 mb-1.5">
                      Technologies Used
                    </p>
                    <p className="font-[family-name:var(--font-mono)] text-xs text-zinc-200">
                      {project.techStack.join(' · ')}
                    </p>
                  </div>

                  {renderProjectActions(project)}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Fullscreen Accessible 3D Case Study & Link Placeholder Modal */}
      {modalState && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85"
          onClick={() => setModalState(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-[#0E0E12] p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-zinc-800/90">
              <div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1.5">
                  <span className="font-[family-name:var(--font-mono)] tabular-nums text-[#3B82F6]">
                    Case {modalState.project.index}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{modalState.project.rolePlaceholder}</span>
                </div>
                <h3
                  id="project-modal-title"
                  className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-semibold text-[#F4F4F5]"
                >
                  {modalState.project.titlePlaceholder}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setModalState(null)}
                aria-label="Close project preview modal"
                className="h-9 w-9 rounded-md border border-zinc-800 bg-[#14141A] hover:bg-zinc-800 flex items-center justify-center text-zinc-300 cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 aspect-[16/9] w-full rounded-xl border border-zinc-800 overflow-hidden">
              <ThreeProjectShowcase
                variant={modalState.project.blueprintVariant}
                projectIndex={modalState.project.index}
                techStack={modalState.project.techStack}
              />
            </div>

            <div className="mt-6 space-y-4">
              <p className="text-sm sm:text-[15px] text-zinc-300 leading-relaxed">
                {modalState.project.summaryPlaceholder}
              </p>

              <div className="pt-4 border-t border-zinc-800/80">
                <h4 className="text-xs font-semibold text-zinc-300 mb-2.5">
                  Architecture &amp; Role Highlights
                </h4>
                <ul className="space-y-2 text-sm text-zinc-400">
                  {modalState.project.architectureHighlights.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="text-[#3B82F6] font-bold">·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 rounded-lg bg-[#121218] p-4">
                <p className="text-xs font-medium text-[#60A5FA] mb-1">
                  {modalState.focusTab === 'demo'
                    ? 'Live Demo URL Placeholder'
                    : modalState.focusTab === 'source'
                      ? 'Source Code Repository Placeholder'
                      : 'Repository & Deployment Links'}
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  No fabricated URLs are attached by default. Update{' '}
                  <code className="font-[family-name:var(--font-mono)] text-zinc-200">
                    liveDemoUrlPlaceholder
                  </code>{' '}
                  and{' '}
                  <code className="font-[family-name:var(--font-mono)] text-zinc-200">
                    sourceCodeUrlPlaceholder
                  </code>{' '}
                  in{' '}
                  <code className="font-[family-name:var(--font-mono)] text-zinc-200">
                    /data/portfolio-data.ts
                  </code>{' '}
                  with your real deployment and GitHub URLs.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
