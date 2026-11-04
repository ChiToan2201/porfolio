'use client';

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  ArrowUp,
  ArrowUpRight,
  Check,
  Copy,
  Github,
  Linkedin,
  Mail,
  Send,
} from 'lucide-react';
import { DEVELOPER_PROFILE } from '@/data/portfolio-data';
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider';
import MagneticWrap from '@/components/ui/MagneticWrap';
import TiltCard from '@/components/ui/TiltCard';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface InquiryTopic {
  id: string;
  label: string;
  template: string;
}

const INQUIRY_TOPICS: InquiryTopic[] = [
  {
    id: 'junior-role',
    label: 'Junior Front-end Role',
    template:
      'Hi! We reviewed your portfolio and would love to discuss a Junior Front-end Developer opening on our team.',
  },
  {
    id: 'internship',
    label: 'Internship / Fresher',
    template:
      'Hello! We have an upcoming Front-end Fresher / Internship opportunity and would like to connect.',
  },
  {
    id: 'collaboration',
    label: 'Project Collaboration',
    template:
      'Hi! Would you be interested in collaborating on an upcoming React / Angular web application?',
  },
];

const CLOSING_HEADLINE_WORDS = [
  "Let's",
  'build',
  'something',
  'meaningful',
  'together.',
];

export default function ContactChapter() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollToSection } = useSmoothScroll();

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('junior-role');
  const [senderName, setSenderName] = useState('');
  const [messageBody, setMessageBody] = useState(INQUIRY_TOPICS[0].template);
  const [copiedDraft, setCopiedDraft] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.contact-word-inner', {
          yPercent: 110,
          opacity: 0,
          duration: 0.85,
          stagger: 0.08,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            once: true,
          },
        });

        gsap.from('.contact-reveal-item', {
          y: 28,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 76%',
            once: true,
          },
        });
      });
    },
    { scope: sectionRef }
  );

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(DEVELOPER_PROFILE.emailPlaceholder);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      setCopiedEmail(false);
    }
  };

  const handleSelectTopic = (topic: InquiryTopic) => {
    setSelectedTopicId(topic.id);
    setMessageBody(topic.template);
  };

  const handleCopyFormattedDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = `To: ${DEVELOPER_PROFILE.emailPlaceholder}\nFrom: ${
      senderName.trim() || '[Visitor Name]'
    }\n\n${messageBody.trim()}`;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 2500);
    } catch {
      setCopiedDraft(false);
    }
  };

  const mailtoHref = `mailto:${DEVELOPER_PROFILE.emailPlaceholder}?subject=${encodeURIComponent(
    `Portfolio Inquiry — ${senderName.trim() || 'Hello'}`
  )}&body=${encodeURIComponent(messageBody.trim())}`;

  return (
    <footer
      id="contact"
      ref={sectionRef}
      aria-label="Chapter 06: Contact"
      className="relative pt-24 sm:pt-36 pb-12 bg-[#09090B]"
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="contact-reveal-item flex items-center gap-2.5 text-xs text-zinc-400 mb-5">
          <span className="font-[family-name:var(--font-mono)] tabular-nums text-[#3B82F6] font-medium">
            Chapter 06
          </span>
          <span aria-hidden="true" className="text-zinc-600">
            ·
          </span>
          <span>Contact &amp; Next Chapter</span>
        </div>

        {/* Word-Masked Closing Headline */}
        <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#F4F4F5] leading-[1.1] max-w-3xl">
          {CLOSING_HEADLINE_WORDS.map((word, idx) => (
            <React.Fragment key={word}>
              <span className="inline-block overflow-hidden py-1 align-bottom">
                <span
                  className={`contact-word-inner inline-block transition-transform duration-200 hover:-translate-y-1 will-change-transform ${
                    word === 'meaningful' ? 'text-[#3B82F6]' : 'text-[#F4F4F5]'
                  }`}
                >
                  {word}
                </span>
              </span>
              {idx < CLOSING_HEADLINE_WORDS.length - 1 ? ' ' : ''}
            </React.Fragment>
          ))}
        </h2>

        <p className="contact-reveal-item mt-5 text-base sm:text-lg text-zinc-400 max-w-[60ch] leading-relaxed">
          Currently open to Junior / Fresher Front-end Developer opportunities,
          internships, and collaborative web projects. Reach out directly via
          email or connect on GitHub and LinkedIn.
        </p>

        {/* Magnetic Primary Contact CTA Row */}
        <div className="contact-reveal-item mt-9 flex flex-wrap items-center gap-4">
          <MagneticWrap strength={0.3}>
            <a
              href={`mailto:${DEVELOPER_PROFILE.emailPlaceholder}`}
              data-cursor="Email"
              className="h-12 px-7 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold inline-flex items-center gap-2.5 transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
            >
              <Mail className="h-4 w-4 shrink-0" />
              <span>Get In Touch</span>
            </a>
          </MagneticWrap>

          <MagneticWrap strength={0.24}>
            <button
              type="button"
              data-cursor="Compose"
              onClick={() => setComposerOpen((prev) => !prev)}
              aria-expanded={composerOpen}
              className="h-12 px-6 rounded-md border border-zinc-800 bg-[#111115] hover:bg-zinc-800/80 text-[#F4F4F5] text-sm font-medium inline-flex items-center gap-2 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
            >
              <Send className="h-4 w-4 text-[#3B82F6] shrink-0" />
              <span>
                {composerOpen ? 'Hide Quick Message' : 'Write Quick Message'}
              </span>
            </button>
          </MagneticWrap>
        </div>

        {/* Interactive Quick Message Composer with Topic Templates */}
        {composerOpen && (
          <form
            onSubmit={handleCopyFormattedDraft}
            className="mt-8 max-w-2xl rounded-xl border border-zinc-800/90 bg-[#0E0E13] p-6 sm:p-7 space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[#F4F4F5]">
                Compose Direct Inquiry
              </h3>
              <span className="font-[family-name:var(--font-mono)] text-xs text-zinc-500">
                To: {DEVELOPER_PROFILE.emailPlaceholder}
              </span>
            </div>

            {/* Interactive Topic Quick-Fill Buttons */}
            <div>
              <span className="block text-xs font-medium text-zinc-400 mb-2">
                Select Inquiry Topic
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {INQUIRY_TOPICS.map((topic) => {
                  const isActive = selectedTopicId === topic.id;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => handleSelectTopic(topic)}
                      className={`h-8 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-[#2563EB] text-white'
                          : 'border border-zinc-800 bg-[#09090B] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {topic.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="visitor-name"
                className="block text-xs font-medium text-zinc-400 mb-1.5"
              >
                Your Name or Team
              </label>
              <input
                id="visitor-name"
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g., Minh Tran · Engineering Lead"
                className="w-full h-10 px-3.5 rounded-md border border-zinc-800 bg-[#09090B] text-sm text-[#F4F4F5] placeholder:text-zinc-600 focus:outline-none focus:border-[#3B82F6]"
              />
            </div>

            <div>
              <label
                htmlFor="visitor-message"
                className="block text-xs font-medium text-zinc-400 mb-1.5"
              >
                Message
              </label>
              <textarea
                id="visitor-message"
                rows={3}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="w-full p-3.5 rounded-md border border-zinc-800 bg-[#09090B] text-sm text-[#F4F4F5] placeholder:text-zinc-600 focus:outline-none focus:border-[#3B82F6]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={mailtoHref}
                className="h-10 px-5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span>Open in Email Client</span>
              </a>

              <button
                type="submit"
                className="h-10 px-4 rounded-md border border-zinc-800 bg-[#14141A] hover:bg-zinc-800 text-xs font-medium text-zinc-200 inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copiedDraft ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Draft Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span>Copy Message Draft</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* 3D Tilt Direct Contact Channels Grid (Email, GitHub, LinkedIn) */}
        <div className="contact-reveal-item mt-16 pt-12 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Email Channel */}
          <TiltCard
            maxTilt={5}
            cursorLabel="Copy"
            className="rounded-xl border border-zinc-800/90 bg-[#0D0D11]"
          >
            <div
              onClick={handleCopyEmail}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCopyEmail();
                }
              }}
              className="p-6 h-full flex flex-col justify-between gap-5 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Email</span>
                <Mail className="h-4 w-4 text-[#3B82F6]" />
              </div>
              <div>
                <p className="font-[family-name:var(--font-mono)] text-sm text-[#F4F4F5] break-all">
                  {DEVELOPER_PROFILE.emailPlaceholder}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#60A5FA]">
                  {copiedEmail ? (
                    <>
                      <Check className="h-3.5 w-3.5 shrink-0" />
                      <span>Copied to clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 shrink-0" />
                      <span>Click to copy email</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </TiltCard>

          {/* GitHub Channel */}
          <TiltCard
            maxTilt={5}
            cursorLabel="GitHub"
            className="rounded-xl border border-zinc-800/90 bg-[#0D0D11] hover:border-zinc-700 transition-colors"
          >
            <a
              href={DEVELOPER_PROFILE.githubUrlPlaceholder}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 h-full flex flex-col justify-between gap-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">
                  GitHub
                </span>
                <Github className="h-4 w-4 text-zinc-400 group-hover:text-[#F4F4F5] transition-colors" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-[family-name:var(--font-mono)] text-sm text-[#F4F4F5] truncate">
                  {DEVELOPER_PROFILE.githubDisplay}
                </span>
                <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-[#3B82F6] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
              </div>
            </a>
          </TiltCard>

          {/* LinkedIn Channel */}
          <TiltCard
            maxTilt={5}
            cursorLabel="LinkedIn"
            className="rounded-xl border border-zinc-800/90 bg-[#0D0D11] hover:border-zinc-700 transition-colors"
          >
            <a
              href={DEVELOPER_PROFILE.linkedinUrlPlaceholder}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 h-full flex flex-col justify-between gap-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">
                  LinkedIn
                </span>
                <Linkedin className="h-4 w-4 text-zinc-400 group-hover:text-[#F4F4F5] transition-colors" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-[family-name:var(--font-mono)] text-sm text-[#F4F4F5] truncate">
                  {DEVELOPER_PROFILE.linkedinDisplay}
                </span>
                <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-[#3B82F6] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
              </div>
            </a>
          </TiltCard>
        </div>

        {/* Quiet Editorial Colophon Footer */}
        <div className="mt-16 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-zinc-500">
          <p suppressHydrationWarning>
            © {new Date().getFullYear()} {DEVELOPER_PROFILE.fullNamePlaceholder}{' '}
            · {DEVELOPER_PROFILE.role}
          </p>

          <button
            type="button"
            data-cursor="Top"
            onClick={() => scrollToSection('intro')}
            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-[#F4F4F5] transition-colors self-start sm:self-auto cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3B82F6]"
          >
            <span>Back to Chapter 01</span>
            <ArrowUp className="h-3.5 w-3.5 text-[#3B82F6]" />
          </button>
        </div>
      </div>
    </footer>
  );
}
