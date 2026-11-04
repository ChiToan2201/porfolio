'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { CHAPTERS } from '@/data/portfolio-data';
import dynamic from 'next/dynamic';
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider';
import TopNav from '@/components/navigation/TopNav';
import ChapterRail from '@/components/navigation/ChapterRail';
import CommandPaletteModal from '@/components/ui/CommandPaletteModal';
import SectionTransitionRibbon from '@/components/ui/SectionTransitionRibbon';
import HeroChapter from '@/components/chapters/HeroChapter';
import AboutChapter from '@/components/chapters/AboutChapter';
import TechStackChapter from '@/components/chapters/TechStackChapter';
import ProjectsChapter from '@/components/chapters/ProjectsChapter';
import JourneyChapter from '@/components/chapters/JourneyChapter';
import ContactChapter from '@/components/chapters/ContactChapter';

const CustomCursor = dynamic(() => import('@/components/ui/CustomCursor'), {
  ssr: false,
});

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function PortfolioExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeChapterId, setActiveChapterId] = useState<string>('intro');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState<string>('typescript');

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useGSAP(
    () => {
      CHAPTERS.forEach((chapter) => {
        const element = document.getElementById(chapter.id);
        if (!element) return;

        ScrollTrigger.create({
          trigger: element,
          start: 'top 45%',
          end: 'bottom 45%',
          onEnter: () => setActiveChapterId(chapter.id),
          onEnterBack: () => setActiveChapterId(chapter.id),
        });
      });
    },
    { scope: rootRef }
  );

  return (
    <SmoothScrollProvider>
      <div ref={rootRef} className="relative min-h-screen bg-[#09090B]">
        <a
          href="#intro"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-md focus:bg-[#2563EB] focus:text-white focus:text-xs focus:font-semibold"
        >
          Skip to story content
        </a>

        <CustomCursor />

        <CommandPaletteModal
          isOpen={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          onSelectTech={(techId) => setSelectedTechId(techId)}
        />

        <TopNav activeChapterId={activeChapterId} />
        <ChapterRail activeChapterId={activeChapterId} />

        <main>
          <HeroChapter onOpenCommandPalette={() => setPaletteOpen(true)} />

          <SectionTransitionRibbon
            phrases={[
              'Chapter 02 · Origin & Perspective',
              'Word-by-Word Scroll Reading',
              'Clean Component Architecture',
              'User-Centered Engineering',
            ]}
            direction="left"
          />

          <AboutChapter />

          <TechStackChapter
            selectedTechId={selectedTechId}
            onSelectTechId={setSelectedTechId}
          />

          <SectionTransitionRibbon
            phrases={[
              'Chapter 04 · Selected Works',
              'Angular · React · TypeScript',
              'Interactive Blueprint Prototypes',
              'Horizontal Scrollytelling Reel',
            ]}
            direction="right"
          />

          <ProjectsChapter />

          <JourneyChapter />
        </main>

        <ContactChapter />
      </div>
    </SmoothScrollProvider>
  );
}
