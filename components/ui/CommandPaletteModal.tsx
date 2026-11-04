'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Check,
  Code2,
  Compass,
  Copy,
  FolderKanban,
  Search,
  X,
} from 'lucide-react';
import {
  CHAPTERS,
  DEVELOPER_PROFILE,
  FEATURED_PROJECTS,
  TECH_STACK_ITEMS,
} from '@/data/portfolio-data';
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTech?: (techId: string) => void;
}

interface PaletteCommand {
  id: string;
  group: 'Chapters' | 'Projects' | 'Technologies' | 'Quick Actions';
  label: string;
  meta: string;
  action: () => void;
}

export default function CommandPaletteModal({
  isOpen,
  onClose,
  onSelectTech,
}: CommandPaletteModalProps) {
  const { scrollToSection } = useSmoothScroll();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: PaletteCommand[] = useMemo(() => {
    const chapterCmds: PaletteCommand[] = CHAPTERS.map((chap) => ({
      id: `chap-${chap.id}`,
      group: 'Chapters',
      label: chap.title,
      meta: `Jump to #${chap.id}`,
      action: () => {
        scrollToSection(chap.id);
        onClose();
      },
    }));

    const projectCmds: PaletteCommand[] = FEATURED_PROJECTS.map((proj) => ({
      id: `proj-${proj.id}`,
      group: 'Projects',
      label: `Case ${proj.index} · ${proj.titlePlaceholder}`,
      meta: proj.techStack.slice(0, 3).join(' · '),
      action: () => {
        scrollToSection('projects');
        onClose();
      },
    }));

    const techCmds: PaletteCommand[] = TECH_STACK_ITEMS.map((tech) => ({
      id: `tech-${tech.id}`,
      group: 'Technologies',
      label: tech.name,
      meta: `${tech.categoryLabel} · ${tech.layer}`,
      action: () => {
        if (onSelectTech) {
          onSelectTech(tech.id);
        }
        scrollToSection('stack');
        onClose();
      },
    }));

    const quickCmds: PaletteCommand[] = [
      {
        id: 'copy-email',
        group: 'Quick Actions',
        label: `Copy Email (${DEVELOPER_PROFILE.emailPlaceholder})`,
        meta: 'Clipboard',
        action: async () => {
          try {
            await navigator.clipboard.writeText(
              DEVELOPER_PROFILE.emailPlaceholder
            );
            setCopiedNotice(true);
            setTimeout(() => {
              setCopiedNotice(false);
              onClose();
            }, 700);
          } catch {
            onClose();
          }
        },
      },
    ];

    return [...chapterCmds, ...quickCmds, ...projectCmds, ...techCmds];
  }, [onClose, onSelectTech, scrollToSection]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands.slice(0, 12);
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.meta.toLowerCase().includes(q) ||
        cmd.group.toLowerCase().includes(q)
    );
  }, [commands, query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 40);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) =>
          filtered.length > 0 ? (prev + 1) % filtered.length : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) =>
          filtered.length > 0
            ? (prev - 1 + filtered.length) % filtered.length
            : 0
        );
      } else if (e.key === 'Enter' && filtered[activeIndex]) {
        e.preventDefault();
        filtered[activeIndex].action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, activeIndex, onClose]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setActiveIndex(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Interactive Story Command Palette"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={onClose}
          className="fixed inset-0 z-[70] flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-xl border border-zinc-800 bg-[#0E0E13] shadow-2xl overflow-hidden"
          >
            {/* Search Input Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800/90">
              <Search className="h-4 w-4 text-[#3B82F6] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Jump to a chapter, search Angular, RxJS, Docker, or projects..."
                className="flex-1 bg-transparent text-sm text-[#F4F4F5] placeholder:text-zinc-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close command palette"
                className="h-7 w-7 rounded border border-zinc-800 bg-[#15151C] flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Command Results */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {copiedNotice ? (
                <div className="py-8 flex items-center justify-center gap-2 text-sm text-emerald-400">
                  <Check className="h-4 w-4" />
                  <span>Email copied to clipboard</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No matching story chapters or technologies found.
                </div>
              ) : (
                filtered.map((cmd, idx) => {
                  const isSelected = idx === activeIndex;
                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={cmd.action}
                      className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between gap-3 text-left transition-colors duration-100 cursor-pointer ${
                        isSelected
                          ? 'bg-[#2563EB] text-white'
                          : 'text-zinc-300 hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {cmd.group === 'Chapters' && (
                          <Compass
                            className={`h-3.5 w-3.5 shrink-0 ${
                              isSelected ? 'text-white' : 'text-[#3B82F6]'
                            }`}
                          />
                        )}
                        {cmd.group === 'Technologies' && (
                          <Code2
                            className={`h-3.5 w-3.5 shrink-0 ${
                              isSelected ? 'text-white' : 'text-[#3B82F6]'
                            }`}
                          />
                        )}
                        {cmd.group === 'Projects' && (
                          <FolderKanban
                            className={`h-3.5 w-3.5 shrink-0 ${
                              isSelected ? 'text-white' : 'text-[#3B82F6]'
                            }`}
                          />
                        )}
                        {cmd.group === 'Quick Actions' && (
                          <Copy
                            className={`h-3.5 w-3.5 shrink-0 ${
                              isSelected ? 'text-white' : 'text-[#3B82F6]'
                            }`}
                          />
                        )}
                        <span className="text-xs sm:text-sm font-medium truncate">
                          {cmd.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`font-[family-name:var(--font-mono)] text-[11px] hidden sm:inline ${
                            isSelected ? 'text-blue-100' : 'text-zinc-500'
                          }`}
                        >
                          {cmd.meta}
                        </span>
                        <ArrowRight
                          className={`h-3.5 w-3.5 ${
                            isSelected ? 'text-white' : 'text-zinc-600'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Keyboard Hint Footer */}
            <div className="px-4 py-2.5 border-t border-zinc-800/90 bg-[#0B0B0F] flex items-center justify-between text-[11px] text-zinc-500">
              <span>Use ↑ ↓ arrows to navigate · Enter to jump</span>
              <span className="font-[family-name:var(--font-mono)]">
                ESC to close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
