import foundations from './01-foundations.mjs';
import line from './02-production-line.mjs';
import loop from './03-loop-state.mjs';
import risks from './04-failure-modes.mjs';
import build from './05-build-yours.mjs';
import parallel from './06-example-parallel.mjs';
import closing from './07-closing.mjs';

export const chapters = [foundations, line, loop, risks, build, parallel, closing];
export const slides = chapters.flatMap(chapter => chapter.slides);
