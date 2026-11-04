import type {Metadata} from 'next';
import {
  Bricolage_Grotesque,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
} from 'next/font/google';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Interactive Scrollytelling Portfolio — Junior Front-end Developer',
  description:
    'A modern scroll-based storytelling portfolio for a Junior Front-end Developer crafted with Next.js, TypeScript, Tailwind CSS, and GSAP.',
  openGraph: {
    title: 'Interactive Scrollytelling Portfolio — Junior Front-end Developer',
    description:
      'A modern scroll-based storytelling portfolio for a Junior Front-end Developer crafted with Next.js, TypeScript, Tailwind CSS, and GSAP.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interactive Scrollytelling Portfolio — Junior Front-end Developer',
    description:
      'A modern scroll-based storytelling portfolio for a Junior Front-end Developer crafted with Next.js, TypeScript, Tailwind CSS, and GSAP.',
  },
};

const EXTENSION_ATTR_SANITIZER = `
(function () {
  try {
    var ATTRS = ['fdprocessedid', 'bis_skin_checked', 'data-dashlane-rid'];
    var counts = new WeakMap();
    var cleanNode = function (el) {
      if (!el || !el.removeAttribute) return;
      var c = counts.get(el) || 0;
      if (c > 4) return;
      var removed = false;
      for (var j = 0; j < ATTRS.length; j++) {
        if (el.hasAttribute && el.hasAttribute(ATTRS[j])) {
          el.removeAttribute(ATTRS[j]);
          removed = true;
        }
      }
      if (removed) counts.set(el, c + 1);
    };
    var sweep = function (root) {
      if (!root || !root.querySelectorAll) return;
      var selector = ATTRS.map(function (a) { return '[' + a + ']'; }).join(',');
      var nodes = root.querySelectorAll(selector);
      for (var i = 0; i < nodes.length; i++) {
        cleanNode(nodes[i]);
      }
    };
    sweep(document);
    document.addEventListener('DOMContentLoaded', function () { sweep(document); }, { once: true });
    var obs = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type === 'attributes' && m.target) {
          cleanNode(m.target);
        } else if (m.addedNodes && m.addedNodes.length) {
          for (var k = 0; k < m.addedNodes.length; k++) {
            sweep(m.addedNodes[k]);
          }
        }
      }
    });
    obs.observe(document.documentElement, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ATTRS
    });
    window.addEventListener('load', function () {
      setTimeout(function () { obs.disconnect(); }, 4000);
    }, { once: true });
  } catch (e) {}
})();
`;

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} dark scroll-smooth`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: EXTENSION_ATTR_SANITIZER }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="bg-[#09090B] text-[#F4F4F5] font-[family-name:var(--font-sans)] antialiased selection:bg-[#2563EB] selection:text-white overflow-x-hidden"
      >
        {children}
      </body>
    </html>
  );
}
