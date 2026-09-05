import type { Catalog } from '@inswipe/data';
import type { Company, Job } from '@inswipe/core';

/**
 * The catalogue of companies and postings, loaded once from Supabase before the app
 * mounts (see `main.tsx`). Screens look jobs and companies up synchronously, exactly as
 * they did when this was a pair of TypeScript files — the difference is where the rows
 * came from, not how they are read.
 */
let loadedCatalog: Catalog | null = null;

export function setCatalog(next: Catalog) {
  loadedCatalog = next;
}

function loaded(): Catalog {
  if (!loadedCatalog) {
    throw new Error('The catalogue is read before it is loaded. bootstrap() runs in main.tsx.');
  }
  return loadedCatalog;
}

export const allJobs = (): Job[] => loaded().jobs;

export const allCompanies = (): Record<string, Company> => loaded().companies;

export const getJob = (id: string): Job => {
  const job = loaded().jobsById[id];
  if (!job) throw new Error(`No job ${id} in the catalogue`);
  return job;
};

export const getCompany = (id: string): Company => {
  const company = loaded().companies[id];
  if (!company) throw new Error(`No company ${id} in the catalogue`);
  return company;
};

/** The whole catalogue, for the queries in @inswipe/data that need it. */
export const catalog = (): Catalog => loaded();
