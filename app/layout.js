import './globals.css'
import { logout } from './dashboard/actions'
import ThemeToggle from '@/components/ThemeToggle'
import { getUserDb } from '@/lib/db'

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
          padding: '1rem 2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderBottom: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <img src="/logo.png" alt="StockBeacon Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
             <h1 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>StockBeacon</h1>
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

