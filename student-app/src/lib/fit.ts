import { createFitEngine } from '@inswipe/core';
import { gapHints } from '../data/student';

/**
 * The student-voiced view of the shared engine. The scoring lives in @inswipe/core;
 * what this file decides is the wording — gaps read as next steps, not failures
 * (CLAUDE.md section 3, rule 6) — and how many rows a phone screen shows.
 */
const engine = createFitEngine({ voice: 'student', hints: gapHints });

export const computeFit = engine.computeFit;
export const skillSplit = engine.skillSplit;
export const learningList = engine.learningList;

export { bandColor, bandOf, fitBand, heldSkills, WEIGHTS } from '@inswipe/core';
