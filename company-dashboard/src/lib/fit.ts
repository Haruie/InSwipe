import { createFitEngine } from '@inswipe/core';

/**
 * Recruiter-voiced hints. Same slot the student app fills with "here's your next step" —
 * on this side it reads as a risk assessment, because the reader is deciding, not learning.
 */
export const recruiterHints: Record<string, string> = {
  React: 'Ramp time on a React-first team would be four weeks or more.',
  TypeScript: 'A short take-home would tell you how quickly they pick it up.',
  'HTML/CSS': 'Unusual to be missing. Worth confirming it is an omission, not a gap.',
  Git: 'Solo-project Git only. No branching or review experience to point to.',
  'Tailwind CSS': 'Transfers from any utility-CSS background in days.',
  Figma: 'Handoff will need more hand-holding from the design team.',
  'REST APIs': 'All projects use mock data. No API integration to point to.',
  Testing: 'No test files in any public repository. Worth a direct question.',
  'Design Systems': 'Has consumed component libraries but never maintained one.',
  Prototyping: 'Static mockups only — no interactive prototypes in the portfolio.',
  'UX Research': 'No research artefacts: no interviews, surveys or usability write-ups.',
  Framer: 'Close enough to Figma that it is a days-long pickup.',
  'Motion Design': 'Nice to have. Rarely blocks an intern hire.',
  'User Testing': 'Has never run a session. Pairable with a senior designer.',
  Copywriting: 'Writing samples are academic rather than product voice.',
  Analytics: 'No evidence of working with an analytics tool.',
  SEO: 'No organic-growth work in the history.',
  'Content Strategy': 'No published portfolio of content work.',
  'Social Media': 'Personal accounts only, no owned brand channel.',
  HubSpot: 'Tool-specific. Learnable in the first fortnight.',
  'A/B Testing': 'No experiment design in the history. Mentorable.',
};

/**
 * The company-voiced view of the shared engine in @inswipe/core. The score is computed
 * by exactly the same code the student app runs — only the wording differs, and the
 * dashboard shows more rows than a phone card has room for.
 */
const engine = createFitEngine({
  voice: 'company',
  hints: recruiterHints,
  limits: { fits: 8, gaps: 6 },
});

export const computeFit = engine.computeFit;
export const skillSplit = engine.skillSplit;

export { bandColor, bandOf, fitBand, heldSkills, WEIGHTS } from '@inswipe/core';
