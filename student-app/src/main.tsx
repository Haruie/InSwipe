import React from 'react';
import ReactDOM from 'react-dom/client';
import { emptyStudentWorkspace, loadCatalog, loadStudentWorkspace } from '@inswipe/data';
import type { StudentWorkspace } from '@inswipe/data';
import App from './App';
import { setCatalog } from './data/catalog';
import { db } from './lib/db';
import { clearSession, readSession } from './lib/session';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);

/**
 * Supabase owns the data, so it is loaded before anything renders: the catalogue into a
 * module-level registry the screens read synchronously, and this student's own state
 * into the store. Nothing in the app holds a second copy.
 */
async function bootstrap() {
  const catalog = await loadCatalog(db);
  setCatalog(catalog);

  // Whoever was signed in last, if anyone. A session can outlive its account — a demo
  // reset rebuilds the dataset and takes accounts created during the run-through with
  // it — so a student id that no longer resolves signs out rather than failing to boot.
  const session = readSession();
  let workspace: StudentWorkspace = emptyStudentWorkspace(catalog);
  if (session) {
    try {
      workspace = await loadStudentWorkspace(db, session.studentId, catalog);
    } catch {
      clearSession();
    }
  }

  root.render(
    <React.StrictMode>
      <App workspace={workspace} />
    </React.StrictMode>,
  );
}

function renderFailure(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  root.render(
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: 'Inter, system-ui, sans-serif',
        background: '#F7F7FB',
      }}
    >
      <div style={{ maxWidth: 420 }}>
        <h1 style={{ fontSize: 17, fontWeight: 700, color: '#0F1117', margin: 0 }}>
          Could not reach Supabase
        </h1>
        <p style={{ fontSize: 13.5, lineHeight: 1.55, color: '#6B7280', marginTop: 10 }}>
          {message}
        </p>
        <p style={{ fontSize: 12.5, lineHeight: 1.55, color: '#9CA3AF', marginTop: 14 }}>
          Check <code>student-app/.env</code>, and that the migrations in{' '}
          <code>supabase/migrations/</code> have been applied to the project.
        </p>
      </div>
    </div>,
  );
}

bootstrap().catch(renderFailure);
