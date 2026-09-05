/**
 * Domain types live in @inswipe/core so the company dashboard reads the same shapes.
 * This file re-exports them, plus the few types only the student app has.
 */
export * from '@inswipe/core';

export interface Notification {
  id: string;
  kind: 'selected' | 'message' | 'status' | 'view' | 'matches';
  title: string;
  body: string;
  time: string;
  group: string;
  unread: boolean;
}
