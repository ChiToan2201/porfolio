export interface ChapterMeta {
  id: string;
  number: string;
  shortLabel: string;
  title: string;
}

export interface DeveloperProfile {
  brandWordmark: string;
  fullNamePlaceholder: string;
  role: string;
  locationPlaceholder: string;
  headlineLines: string[];
  introSummaryPlaceholder: string;
  portraitSrc: string;
  portraitAlt: string;
  emailPlaceholder: string;
  githubUrlPlaceholder: string;
  githubDisplay: string;
  linkedinUrlPlaceholder: string;
  linkedinDisplay: string;
}

export interface AboutParagraph {
  id: string;
  kicker: string;
  content: string;
}

export interface AboutMilestone {
  periodPlaceholder: string;
  titlePlaceholder: string;
  institutionPlaceholder: string;
  summaryPlaceholder: string;
}

export type TechCategory =
  | 'all'
  | 'core'
  | 'frameworks'
  | 'reactive'
  | 'backend'
  | 'workflow';

export interface TechCategoryTab {
  id: TechCategory;
  label: string;
}

export interface TechStackItem {
  id: string;
  name: string;
  category: Exclude<TechCategory, 'all'>;
  categoryLabel: string;
  layer: string;
  summary: string;
  practicalFocus: string[];
}

export type ProjectBlueprintVariant = 'reactive-workspace' | 'modular-commerce' | 'fullstack-portal';

export interface ProjectItem {
  id: string;
  index: string;
  titlePlaceholder: string;
  rolePlaceholder: string;
  timelinePlaceholder: string;
  summaryPlaceholder: string;
  challengePlaceholder: string;
  architectureHighlights: string[];
  techStack: string[];
  liveDemoUrlPlaceholder: string;
  sourceCodeUrlPlaceholder: string;
  blueprintVariant: ProjectBlueprintVariant;
}

export interface JourneyStage {
  id: string;
  stageNumber: string;
  periodPlaceholder: string;
  title: string;
  subtitlePlaceholder: string;
  narrativePlaceholder: string;
  keyMilestones: string[];
}

export const CHAPTERS: ChapterMeta[] = [
  {
    id: 'intro',
    number: '01',
    shortLabel: 'Intro',
    title: 'Chapter 01 — Introduction',
  },
  {
    id: 'about',
    number: '02',
    shortLabel: 'About',
    title: 'Chapter 02 — About Me',
  },
  {
    id: 'stack',
    number: '03',
    shortLabel: 'Stack',
    title: 'Chapter 03 — My Tech Stack',
  },
  {
    id: 'projects',
    number: '04',
    shortLabel: 'Projects',
    title: 'Chapter 04 — Featured Projects',
  },
  {
    id: 'journey',
    number: '05',
    shortLabel: 'Journey',
    title: 'Chapter 05 — My Journey',
  },
  {
    id: 'contact',
    number: '06',
    shortLabel: 'Contact',
    title: 'Chapter 06 — Contact',
  },
];

export const DEVELOPER_PROFILE: DeveloperProfile = {
  brandWordmark: '[Your Name]',
  fullNamePlaceholder: '[Your Full Name]',
  role: 'Junior Front-end Developer',
  locationPlaceholder: '[Your City, Vietnam]',
  headlineLines: [
    'I turn ideas into',
    'interactive digital',
    'experiences.',
  ],
  introSummaryPlaceholder:
    '[Placeholder Bio Summary — Introduce who you are, what excites you about crafting responsive web interfaces, and the engineering mindset you bring to modern front-end teams.]',
  portraitSrc: '/assets/aistudio/myPicture_f9c594f0.jpg',
  portraitAlt: 'Personal portrait of Junior Front-end Developer',
  emailPlaceholder: 'your.email@example.com',
  githubUrlPlaceholder: 'https://github.com/your-username',
  githubDisplay: 'github.com/your-username',
  linkedinUrlPlaceholder: 'https://linkedin.com/in/your-profile',
  linkedinDisplay: 'linkedin.com/in/your-profile',
};

export const ABOUT_PARAGRAPHS: AboutParagraph[] = [
  {
    id: 'origin',
    kicker: '01 · Curiosity First',
    content:
      '[Placeholder Paragraph 01 — Share the moment that sparked your interest in web development: discovering how clean HTML, CSS, and JavaScript transform static concepts into living interfaces people can touch and explore.]',
  },
  {
    id: 'craft',
    kicker: '02 · Disciplined Front-end Craft',
    content:
      '[Placeholder Paragraph 02 — Describe how your focus evolved from styling simple layouts to architecting maintainable component trees with TypeScript, Angular, React, and reactive state streams.]',
  },
  {
    id: 'systems',
    kicker: '03 · End-to-End Perspective',
    content:
      '[Placeholder Paragraph 03 — Explain how learning Node.js, Express.js, MongoDB, and Docker helps you collaborate smoothly with backend engineers and understand the full lifecycle of data on the web.]',
  },
  {
    id: 'direction',
    kicker: '04 · Where I Am Headed',
    content:
      '[Placeholder Paragraph 04 — State what kind of engineering team, mentorship culture, and user-facing product challenges you are looking to contribute to as a Junior Front-end Developer.]',
  },
];

export const ABOUT_EDUCATION_TIMELINE: AboutMilestone[] = [
  {
    periodPlaceholder: '[YYYY – YYYY]',
    titlePlaceholder: '[Degree / Major in Software Engineering or IT]',
    institutionPlaceholder: '[Your University / College / Academy Name]',
    summaryPlaceholder:
      '[Placeholder: Core coursework in web programming, data structures, object-oriented design, and collaborative capstone projects.]',
  },
  {
    periodPlaceholder: '[YYYY – Present]',
    titlePlaceholder: '[Self-Directed Front-end & Full-Stack Practice]',
    institutionPlaceholder: '[Personal Lab / Coursework / Open Source Practice]',
    summaryPlaceholder:
      '[Placeholder: Intensive hands-on practice building responsive interfaces with Angular, React, TypeScript, Tailwind CSS, RxJS, and NgRx.]',
  },
];

export const TECH_CATEGORIES: TechCategoryTab[] = [
  { id: 'all', label: 'All Technologies' },
  { id: 'core', label: 'Core Languages & Styling' },
  { id: 'frameworks', label: 'Front-end Frameworks' },
  { id: 'reactive', label: 'Reactive & State' },
  { id: 'backend', label: 'Backend & Database' },
  { id: 'workflow', label: 'Workflow & DevOps' },
];

export const TECH_STACK_ITEMS: TechStackItem[] = [
  {
    id: 'html',
    name: 'HTML5',
    category: 'core',
    categoryLabel: 'Core Web',
    layer: 'Semantic Document Structure',
    summary:
      'Accessible landmark architecture, semantic forms, and SEO-friendly document hierarchy.',
    practicalFocus: [
      'Semantic HTML5 landmarks & ARIA roles',
      'Accessible keyboard navigation order',
      'Structured metadata & OpenGraph semantics',
    ],
  },
  {
    id: 'css',
    name: 'CSS3',
    category: 'core',
    categoryLabel: 'Core Web',
    layer: 'Layout & Visual Motion',
    summary:
      'Modern CSS Grid, Flexbox, responsive fluid typography, and hardware-accelerated transitions.',
    practicalFocus: [
      'Responsive Grid & Flexbox layout math',
      'Compositor-friendly transform & opacity motion',
      'Media queries & prefers-reduced-motion support',
    ],
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'core',
    categoryLabel: 'Core Language',
    layer: 'Interactive Runtime',
    summary:
      'ES6+ modules, asynchronous control flow, closures, DOM APIs, and event-driven architecture.',
    practicalFocus: [
      'Async/Await, Promises & Fetch pipelines',
      'Array/Object immutability patterns',
      'DOM observers & performance debouncing',
    ],
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'core',
    categoryLabel: 'Core Language',
    layer: 'Static Type Safety',
    summary:
      'Strict interfaces, generics, discriminated unions, and predictable API data contracts.',
    practicalFocus: [
      'Typed component props & state contracts',
      'Discriminated unions for async UI states',
      'Reusable generic utility functions',
    ],
  },
  {
    id: 'angular',
    name: 'Angular',
    category: 'frameworks',
    categoryLabel: 'UI Framework',
    layer: 'Structured SPA Architecture',
    summary:
      'Standalone components, reactive forms, dependency injection, routing guards, and modular scale.',
    practicalFocus: [
      'Standalone components & lazy-loaded routes',
      'Reactive Forms with custom validation',
      'HTTP interceptors & modular services',
    ],
  },
  {
    id: 'react',
    name: 'React',
    category: 'frameworks',
    categoryLabel: 'UI Library',
    layer: 'Declarative Component Systems',
    summary:
      'Composable functional components, custom hooks, unidirectional data flow, and clean rendering.',
    practicalFocus: [
      'Reusable UI primitives & composition patterns',
      'Custom hooks for state & browser APIs',
      'Render optimization & clean effect lifecycles',
    ],
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    category: 'core',
    categoryLabel: 'Styling System',
    layer: 'Utility-First Design Tokens',
    summary:
      'Consistent spacing scales, responsive breakpoints, typography systems, and maintainable UI styling.',
    practicalFocus: [
      'Mobile-first responsive breakpoint design',
      'Consistent spacing, contrast & dark surfaces',
      'Zero-bloat co-located component styling',
    ],
  },
  {
    id: 'rxjs',
    name: 'RxJS',
    category: 'reactive',
    categoryLabel: 'Reactive Programming',
    layer: 'Asynchronous Event Streams',
    summary:
      'Declarative observable streams for search inputs, API race-condition prevention, and live state.',
    practicalFocus: [
      'Stream composition (switchMap, combineLatest)',
      'Subscription cleanup & memory-leak prevention',
      'Debounced user input & cancellation flows',
    ],
  },
  {
    id: 'ngrx',
    name: 'NgRx',
    category: 'reactive',
    categoryLabel: 'State Management',
    layer: 'Predictable Store Architecture',
    summary:
      'Unidirectional state management in Angular using Actions, Reducers, Selectors, and Effects.',
    practicalFocus: [
      'Immutable state slices & memoized selectors',
      'Side-effect isolation with NgRx Effects',
      'Predictable loading, success & error states',
    ],
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'backend',
    categoryLabel: 'Backend Runtime',
    layer: 'Server-Side JavaScript',
    summary:
      'Event-driven backend runtime for building REST services, build scripts, and full-stack tooling.',
    practicalFocus: [
      'Asynchronous I/O & environment configuration',
      'REST API integration & JSON payload validation',
      'Modular backend service organization',
    ],
  },
  {
    id: 'expressjs',
    name: 'Express.js',
    category: 'backend',
    categoryLabel: 'Web Framework',
    layer: 'REST APIs & Middleware',
    summary:
      'Clean route controllers, authentication middleware, request validation, and error handling.',
    practicalFocus: [
      'RESTful resource routing & status codes',
      'Middleware chains for auth & error handling',
      'CORS & secure client-server communication',
    ],
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'backend',
    categoryLabel: 'Database',
    layer: 'Document Data Modeling',
    summary:
      'Flexible document schemas, CRUD operations, indexing fundamentals, and aggregation queries.',
    practicalFocus: [
      'Schema modeling for web application entities',
      'CRUD queries, filtering & pagination',
      'Connecting persistence layers to Express APIs',
    ],
  },
  {
    id: 'git',
    name: 'Git',
    category: 'workflow',
    categoryLabel: 'Version Control',
    layer: 'Source History & Branching',
    summary:
      'Clean atomic commits, feature-branch workflows, interactive rebasing, and conflict resolution.',
    practicalFocus: [
      'Conventional commit messages & clean history',
      'Feature branching & safe merge resolution',
      'Code review readiness & diff hygiene',
    ],
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'workflow',
    categoryLabel: 'Collaboration',
    layer: 'Pull Requests & Project Tracking',
    summary:
      'Collaborative pull requests, issue tracking, repository documentation, and automated checks.',
    practicalFocus: [
      'Structured Pull Requests & peer code reviews',
      'README documentation & setup instructions',
      'GitHub Actions workflow fundamentals',
    ],
  },
  {
    id: 'docker',
    name: 'Docker',
    category: 'workflow',
    categoryLabel: 'Containerization',
    layer: 'Reproducible Environments',
    summary:
      'Containerizing front-end and Node/Mongo services so development matches production reliably.',
    practicalFocus: [
      'Multi-stage Dockerfiles for web apps',
      'Docker Compose for local full-stack services',
      'Consistent environment parity across machines',
    ],
  },
];

export const FEATURED_PROJECTS: ProjectItem[] = [
  {
    id: 'project-01',
    index: '01',
    titlePlaceholder: '[Project 01 Title — Reactive Web Application]',
    rolePlaceholder: '[Your Role — e.g., Front-end Developer]',
    timelinePlaceholder: '[Placeholder Timeline — e.g., 2025]',
    summaryPlaceholder:
      '[Placeholder Project Description — Describe the core user problem this project solves, who it was built for, and how the interface streamlines complex workflows.]',
    challengePlaceholder:
      '[Placeholder Engineering Notes — Highlight a specific front-end challenge you solved here, such as reactive state synchronization with RxJS/NgRx, complex form validation, or responsive table/board rendering.]',
    architectureHighlights: [
      '[Placeholder Highlight 01: Modular standalone component structure & typed state]',
      '[Placeholder Highlight 02: Asynchronous data streams with clean loading/error states]',
      '[Placeholder Highlight 03: Responsive layout tested across desktop, tablet, and mobile]',
    ],
    techStack: ['Angular', 'TypeScript', 'RxJS', 'NgRx', 'Tailwind CSS'],
    liveDemoUrlPlaceholder: '#replace-with-project-01-live-demo',
    sourceCodeUrlPlaceholder: '#replace-with-project-01-github-repo',
    blueprintVariant: 'reactive-workspace',
  },
  {
    id: 'project-02',
    index: '02',
    titlePlaceholder: '[Project 02 Title — Interactive Front-end Experience]',
    rolePlaceholder: '[Your Role — e.g., Solo Front-end Developer]',
    timelinePlaceholder: '[Placeholder Timeline — e.g., 2025]',
    summaryPlaceholder:
      '[Placeholder Project Description — Replace with an overview of your React & TypeScript project, focusing on UI responsiveness, clean component reusability, and smooth user interactions.]',
    challengePlaceholder:
      '[Placeholder Engineering Notes — Explain how you structured reusable components, managed client state cleanly, and optimized asset rendering and accessibility.]',
    architectureHighlights: [
      '[Placeholder Highlight 01: Reusable TypeScript UI components & custom React hooks]',
      '[Placeholder Highlight 02: Client-side filtering, search, and URL-synced UI state]',
      '[Placeholder Highlight 03: Keyboard accessibility & smooth motion transitions]',
    ],
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'REST API'],
    liveDemoUrlPlaceholder: '#replace-with-project-02-live-demo',
    sourceCodeUrlPlaceholder: '#replace-with-project-02-github-repo',
    blueprintVariant: 'modular-commerce',
  },
  {
    id: 'project-03',
    index: '03',
    titlePlaceholder: '[Project 03 Title — Full-Stack Web Platform]',
    rolePlaceholder: '[Your Role — e.g., Full-Stack / Front-end Developer]',
    timelinePlaceholder: '[Placeholder Timeline — e.g., 2026]',
    summaryPlaceholder:
      '[Placeholder Project Description — Detail an end-to-end application connecting a modern front-end client to a Node.js, Express.js, and MongoDB backend environment.]',
    challengePlaceholder:
      '[Placeholder Engineering Notes — Describe API contract design, authentication flow, MongoDB schema modeling, and containerized local setup with Docker.]',
    architectureHighlights: [
      '[Placeholder Highlight 01: End-to-end TypeScript contracts between client and Express API]',
      '[Placeholder Highlight 02: MongoDB persistence with structured validation & pagination]',
      '[Placeholder Highlight 03: Containerized local development environment using Docker]',
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'Express.js', 'MongoDB', 'Docker'],
    liveDemoUrlPlaceholder: '#replace-with-project-03-live-demo',
    sourceCodeUrlPlaceholder: '#replace-with-project-03-github-repo',
    blueprintVariant: 'fullstack-portal',
  },
];

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: 'stage-01',
    stageNumber: '01',
    periodPlaceholder: '[Phase 01 · YYYY]',
    title: 'Foundations of the Web',
    subtitlePlaceholder: '[Placeholder Context — First steps into HTML, CSS & JavaScript]',
    narrativePlaceholder:
      '[Placeholder Milestone Story — Describe how you started building static layouts, mastering semantic HTML5, Flexbox/Grid, and core JavaScript DOM manipulation.]',
    keyMilestones: [
      'HTML5 · CSS3 · Responsive Layouts',
      'JavaScript ES6+ Fundamentals',
      'Git & GitHub Version Control Habits',
    ],
  },
  {
    id: 'stage-02',
    stageNumber: '02',
    periodPlaceholder: '[Phase 02 · YYYY]',
    title: 'Typed Components & Reactive Thinking',
    subtitlePlaceholder: '[Placeholder Context — Adopting TypeScript, React, Angular & Tailwind CSS]',
    narrativePlaceholder:
      '[Placeholder Milestone Story — Share how transitioning to TypeScript, React, and Angular taught you component boundaries, reactive data flow with RxJS/NgRx, and scalable design systems.]',
    keyMilestones: [
      'TypeScript Strict Interfaces & Generics',
      'Angular & React Component Architecture',
      'RxJS Streams · NgRx Store · Tailwind CSS',
    ],
  },
  {
    id: 'stage-03',
    stageNumber: '03',
    periodPlaceholder: '[Phase 03 · YYYY]',
    title: 'Connecting the Full Stack',
    subtitlePlaceholder: '[Placeholder Context — Expanding into Node.js, Express, MongoDB & Docker]',
    narrativePlaceholder:
      '[Placeholder Milestone Story — Explain how building REST APIs with Express.js, persisting documents in MongoDB, and containerizing services with Docker broadened your engineering perspective.]',
    keyMilestones: [
      'Node.js & Express.js REST API Design',
      'MongoDB Document Modeling',
      'Dockerized Local Environments',
    ],
  },
  {
    id: 'stage-04',
    stageNumber: '04',
    periodPlaceholder: '[Phase 04 · Present]',
    title: 'Crafting Interactive Digital Stories',
    subtitlePlaceholder: '[Placeholder Context — Stepping into a Junior Front-end Developer role]',
    narrativePlaceholder:
      '[Placeholder Milestone Story — Summarize your current focus: combining clean code, accessible UX, and purposeful scroll choreography to contribute meaningfully to a product engineering team.]',
    keyMilestones: [
      'Performance-Conscious UI Motion (GSAP)',
      'Clean Reusable Component Architecture',
      'Ready for Production Team Collaboration',
    ],
  },
];
