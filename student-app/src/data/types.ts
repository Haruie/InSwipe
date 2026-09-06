/**
 * Domain types live in @inswipe/core so the company dashboard reads the same shapes,
 * and the row-backed extensions live in @inswipe/data. This file re-exports both, so
 * screens can keep importing from one place.
 */
export * from '@inswipe/core';
export type {
  ApplicationRecord,
  JobListing,
  NotificationRecord,
  StudentRecord,
} from '@inswipe/data';
