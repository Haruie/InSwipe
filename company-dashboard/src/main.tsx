import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AccountProvider } from './lib/account'
import { DashboardProvider, loadDashboard, type DashboardBoot } from './data/store'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root')!)

function Booted({ boot }: { boot: DashboardBoot }) {
  return (
    <React.StrictMode>
      <AccountProvider>
        <DashboardProvider boot={boot}>
          <App />
        </DashboardProvider>
      </AccountProvider>
    </React.StrictMode>
  )
}

function Failure({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-screen px-6" style={{ background: '#F7F7FB' }}>
      <div style={{ maxWidth: 460 }}>
        <h1 className="text-[17px] font-semibold" style={{ color: '#0F1117' }}>Could not reach Supabase</h1>
        <p className="text-[13px] leading-relaxed mt-2.5" style={{ color: '#6B7280' }}>{message}</p>
        <p className="text-[12px] leading-relaxed mt-3.5" style={{ color: '#9CA3AF' }}>
          Check <code>company-dashboard/.env</code>, and that the migrations in{' '}
          <code>supabase/migrations/</code> have been applied to the project.
        </p>
      </div>
    </div>
  )
}

/**
 * Supabase owns the data, so the company's workspace is loaded before anything renders.
 * The dashboard holds no copy of it — every list on screen is a view of these rows.
 */
loadDashboard()
  .then((boot) => root.render(<Booted boot={boot} />))
  .catch((error) => root.render(<Failure message={error instanceof Error ? error.message : String(error)} />))
