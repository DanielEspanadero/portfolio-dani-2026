import foundations from './01-foundations.mjs';
import anatomy from './02-anatomy.mjs';
import risks from './03-risks.mjs';
import create from './04-create.mjs';
import execute from './05-execute.mjs';
import parallel from './06-parallel.mjs';
import workshop from './07-workshop.mjs';

export const chapters = [foundations, anatomy, risks, create, execute, parallel, workshop];
export const slides = chapters.flatMap(chapter => chapter.slides);
