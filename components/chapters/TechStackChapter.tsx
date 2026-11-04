'use client';

import React, { useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Check,
  Code2,
  Layers,
  Play,
  Server,
  Terminal,
  Wrench,
  Workflow,
} from 'lucide-react';
import {
  TECH_CATEGORIES,
  TECH_STACK_ITEMS,
  TechCategory,
  TechStackItem,
} from '@/data/portfolio-data';
import ChapterHeader from '@/components/ui/ChapterHeader';
import TiltCard from '@/components/ui/TiltCard';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface StackPreset {
  id: string;
  label: string;
  techIds: string[];
  description: string;
}

const STACK_PRESETS: StackPreset[] = [
  {
    id: 'angular-spa',
    label: 'Angular Reactive SPA',
    techIds: [
      'html',
      'css',
      'typescript',
      'angular',
      'rxjs',
      'ngrx',
      'tailwind',
    ],
    description:
      'Enterprise front-end stack using Standalone Angular components, RxJS streams, and NgRx Store.',
  },
  {
    id: 'react-ui',
    label: 'Modern React Client',
    techIds: [
      'html',
      'css',
      'javascript',
      'typescript',
      'react',
      'tailwind',
      'git',
      'github',
    ],
    description:
      'Composable declarative UI architecture with strict TypeScript contracts and utility-first tokens.',
  },
  {
    id: 'fullstack-docker',
    label: 'Full-Stack & Docker',
    techIds: [
      'typescript',
      'react',
      'nodejs',
      'expressjs',
      'mongodb',
      'docker',
      'git',
    ],
    description:
      'End-to-end web application connecting typed front-end clients to Express REST APIs and containerized MongoDB.',
  },
];

const PIPELINE_STEPS: Record<
  Exclude<TechCategory, 'all'>,
  [string, string, string]
> = {
  core: ['Semantic Markup', 'Type-Checked Logic', 'Accessible DOM Paint'],
  frameworks: ['Typed Props / Input', 'Component Tree Diff', 'Reactive View'],
  reactive: ['Event Observable$', 'switchMap / Reducer', 'Memoized Selector'],
  backend: ['HTTP Request DTO', 'Express Middleware', 'MongoDB Document'],
  workflow: ['Feature Branch Commit', 'GitHub Pull Request', 'Docker Container'],
};

function getCategoryIcon(category: Exclude<TechCategory, 'all'>) {
  switch (category) {
    case 'core':
      return <Code2 className="h-4 w-4 text-[#3B82F6] shrink-0" />;
    case 'frameworks':
      return <Layers className="h-4 w-4 text-[#3B82F6] shrink-0" />;
    case 'reactive':
      return <Terminal className="h-4 w-4 text-[#3B82F6] shrink-0" />;
    case 'backend':
      return <Server className="h-4 w-4 text-[#3B82F6] shrink-0" />;
    case 'workflow':
      return <Wrench className="h-4 w-4 text-[#3B82F6] shrink-0" />;
  }
}

interface TechStackChapterProps {
  selectedTechId: string;
  onSelectTechId: (techId: string) => void;
}

export default function TechStackChapter({
  selectedTechId,
  onSelectTechId,
}: TechStackChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const matrixRef = useRef<HTMLDivElement>(null);

  const [activeCategory, setActiveCategory] = useState<TechCategory>('all');
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [simStep, setSimStep] = useState<number>(-1);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return TECH_STACK_ITEMS;
    return TECH_STACK_ITEMS.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const activeTech: TechStackItem = useMemo(() => {
    const match = filteredItems.find((item) => item.id === selectedTechId);
    return match ?? filteredItems[0] ?? TECH_STACK_ITEMS[0];
  }, [filteredItems, selectedTechId]);

  const activePreset = useMemo(
    () => STACK_PRESETS.find((p) => p.id === activePresetId) ?? null,
    [activePresetId]
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.stack-explorer-shell', {
          y: 32,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.stack-explorer-shell',
            start: 'top 84%',
            once: true,
          },
        });
      });
    },
    { scope: sectionRef }
  );

  const handleCategoryChange = (cat: TechCategory) => {
    setActiveCategory(cat);
    setActivePresetId(null);
    const nextList =
      cat === 'all'
        ? TECH_STACK_ITEMS
        : TECH_STACK_ITEMS.filter((t) => t.category === cat);
    if (nextList.length > 0 && !nextList.some((t) => t.id === selectedTechId)) {
      onSelectTechId(nextList[0].id);
    }
  };

  const handleApplyPreset = (preset: StackPreset) => {
    if (activePresetId === preset.id) {
      setActivePresetId(null);
      return;
    }
    setActiveCategory('all');
    setActivePresetId(preset.id);
    onSelectTechId(preset.techIds[0]);

    // GSAP pulse across highlighted stack cards
    requestAnimationFrame(() => {
      if (!matrixRef.current) return;
      const highlighted = matrixRef.current.querySelectorAll(
        '[data-preset-match="true"]'
      );
      if (highlighted.length > 0) {
        gsap.fromTo(
          highlighted,
          { y: -5, scale: 0.97 },
          {
            y: 0,
            scale: 1,
            duration: 0.45,
            stagger: 0.04,
            ease: 'back.out(2)',
          }
        );
      }
    });
  };

  const runPipelineSimulation = () => {
    if (simStep >= 0 && simStep < 2) return;
    setSimStep(0);
    setTimeout(() => setSimStep(1), 320);
    setTimeout(() => setSimStep(2), 640);
  };

  const currentSteps = PIPELINE_STEPS[activeTech.category];

  return (
    <section
      id="stack"
      ref={sectionRef}
      aria-label="Chapter 03: My Tech Stack"
      className="relative py-24 sm:py-32 bg-[#0B0B0E] border-b border-zinc-800/80"
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <ChapterHeader
          chapterNumber="03"
          chapterLabel="My Tech Stack"
          title="Tools chosen for clarity, reactive data flow, and maintainable scale."
          description="Filter by architectural layer, test real-world stack combinations, or simulate how each technology processes events in production — zero arbitrary percentage bars."
        />

        {/* Controls Row: Category Tabs + Interactive Stack Architecture Presets */}
        <div className="mt-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Interactive Category Segmented Filter Bar */}
          <div
            role="tablist"
            aria-label="Filter technologies by architectural layer"
            className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-lg bg-[#111116] border border-zinc-800/90 w-fit max-w-full"
          >
            {TECH_CATEGORIES.map((tab) => {
              const isSelected = activeCategory === tab.id && !activePresetId;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  aria-selected={isSelected}
                  onClick={() => handleCategoryChange(tab.id)}
                  className={`h-8 px-3.5 rounded-md text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] ${
                    isSelected
                      ? 'bg-[#2563EB] text-white'
                      : 'text-zinc-400 hover:text-[#F4F4F5] hover:bg-zinc-800/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Interactive Architecture Combination Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 mr-1 whitespace-nowrap">
              <Workflow className="h-3.5 w-3.5 text-[#3B82F6]" />
              <span>Stack Recipes:</span>
            </span>
            {STACK_PRESETS.map((preset) => {
              const isPresetActive = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  data-cursor="Combine"
                  className={`h-8 px-3 rounded-md border text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                    isPresetActive
                      ? 'border-[#3B82F6] bg-[#162038] text-white'
                      : 'border-zinc-800 bg-[#0F0F14] text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Preset Context Strip */}
        {activePreset && (
          <div className="mt-4 rounded-lg border border-[#2563EB]/40 bg-[#101626] px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <p className="text-zinc-200">
              <span className="font-semibold text-[#60A5FA] mr-2">
                {activePreset.label}:
              </span>
              {activePreset.description}
            </p>
            <button
              type="button"
              onClick={() => setActivePresetId(null)}
              className="text-zinc-400 hover:text-white font-[family-name:var(--font-mono)] cursor-pointer whitespace-nowrap"
            >
              Reset View
            </button>
          </div>
        )}

        {/* Interactive Stack Matrix + Live Architecture Inspector */}
        <div className="stack-explorer-shell mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Matrix Grid */}
          <div
            ref={matrixRef}
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredItems.map((tech, index) => {
                const isSelected = activeTech.id === tech.id;
                const isInPreset = activePreset
                  ? activePreset.techIds.includes(tech.id)
                  : true;

                return (
                  <motion.button
                    layout
                    key={tech.id}
                    type="button"
                    data-cursor="Inspect"
                    data-preset-match={
                      activePreset && isInPreset ? 'true' : 'false'
                    }
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{
                      opacity: isInPreset ? 1 : 0.34,
                      scale: 1,
                    }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    onClick={() => {
                      onSelectTechId(tech.id);
                      setSimStep(-1);
                    }}
                    onMouseEnter={() => {
                      onSelectTechId(tech.id);
                    }}
                    className={`group text-left rounded-lg border p-4 transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] ${
                      isSelected
                        ? 'border-[#2563EB] bg-[#121624] -translate-y-0.5'
                        : activePreset && isInPreset
                          ? 'border-[#2563EB]/60 bg-[#101420]'
                          : 'border-zinc-800/90 bg-[#0F0F13] hover:border-zinc-700 hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-[family-name:var(--font-mono)] tabular-nums text-[11px] text-zinc-500">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[11px] text-zinc-500 truncate">
                        {tech.categoryLabel}
                      </span>
                    </div>

                    <div className="font-[family-name:var(--font-display)] text-base font-semibold text-[#F4F4F5] group-hover:text-white">
                      {tech.name}
                    </div>

                    <p className="mt-1 text-xs text-zinc-400 line-clamp-1">
                      {tech.layer}
                    </p>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Right Sticky Architecture Inspector & Interactive Flow Simulator */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <TiltCard
              maxTilt={4}
              className="rounded-xl border border-zinc-800/90 bg-[#0F0F13] p-6 sm:p-8"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeTech.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="flex items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
                    <div className="flex items-center gap-2 text-xs text-zinc-400 min-w-0">
                      {getCategoryIcon(activeTech.category)}
                      <span className="truncate">{activeTech.categoryLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-zinc-300 truncate">
                        {activeTech.layer}
                      </span>
                    </div>
                  </div>

                  <h3 className="mt-5 font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-semibold text-[#F4F4F5]">
                    {activeTech.name}
                  </h3>

                  <p className="mt-3 text-sm sm:text-[15px] text-zinc-300 leading-relaxed">
                    {activeTech.summary}
                  </p>

                  <div className="mt-6 pt-5 border-t border-zinc-800/80">
                    <p className="text-xs font-medium text-zinc-400 mb-3">
                      Practical Application &amp; Focus
                    </p>
                    <ul className="space-y-2.5">
                      {activeTech.practicalFocus.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-2.5 text-sm text-zinc-300"
                        >
                          <Check className="h-4 w-4 text-[#3B82F6] shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Interactive Execution Pipeline Simulator */}
                  <div className="mt-6 pt-5 border-t border-zinc-800/80">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-medium text-zinc-400">
                        Execution Flow Trace
                      </span>
                      <button
                        type="button"
                        onClick={runPipelineSimulation}
                        data-cursor="Run"
                        className="h-7 px-2.5 rounded bg-[#2563EB] hover:bg-[#1D4ED8] text-[11px] font-semibold text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Play className="h-3 w-3 shrink-0" />
                        <span>Simulate Flow</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {currentSteps.map((stepLabel, idx) => {
                        const isLit = simStep >= idx;
                        return (
                          <div
                            key={stepLabel}
                            className={`rounded border p-2.5 transition-colors duration-200 ${
                              isLit
                                ? 'border-[#3B82F6] bg-[#141D33] text-white'
                                : 'border-zinc-800 bg-[#0B0B0F] text-zinc-500'
                            }`}
                          >
                            <div className="font-[family-name:var(--font-mono)] text-[10px] mb-1">
                              0{idx + 1}
                            </div>
                            <div className="text-[11px] font-medium leading-snug">
                              {stepLabel}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}
