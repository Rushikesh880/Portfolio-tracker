import './globals.css'
import { logout } from './dashboard/actions'
import ThemeToggle from '@/components/ThemeToggle'
import { getUserDb } from '@/lib/db'
import Link from 'next/link'

export const metadata = {
  title: 'StockBeacon - Portfolio Tracker',
  description: 'Track your stocks, mutual funds, gold, and cash.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default async function RootLayout({ children }) {
  const supabase = await getUserDb()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="en">
      <body>
        <nav style={{ 
          backgroundColor: 'var(--bg-card)', 
          padding: '0.875rem 2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderBottom: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
              <img src="/logo.png" alt="StockBeacon Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
              <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>StockBeacon</span>
            </Link>

            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link href="/dashboard" className="nav-link" style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: 'var(--text-main)',
                }}>
                  Dashboard
                </Link>
                <Link href="/analytics" className="nav-link" style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>Analytics & Insights</span>
                  <span style={{
                    fontSize: '0.625rem',
                    backgroundColor: 'rgba(79, 70, 229, 0.12)',
                    color: 'var(--primary)',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontWeight: 700
                  }}>NEW</span>
                </Link>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <ThemeToggle />
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '500', borderRight: '1px solid var(--border)', paddingRight: '1rem' }}>
                  {user.email}
                </span>
                <form action={logout}>
                  <button className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem', borderRadius: '10px' }}>Logout</button>
                </form>
              </div>
            )}
          </div>
        </nav>

        <main className="container" style={{ marginTop: '1rem' }}>
          {children}
        </main>
      </body>
    </html>

  )
}

