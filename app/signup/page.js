import { handleSignup } from './actions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function SignupPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams?.error;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)' }}>
      <div className="card card-elevated" style={{ width: '100%', maxWidth: '440px', padding: '3rem', border: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/logo.png" alt="StockBeacon Logo" style={{ width: '64px', height: '64px', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }} />
        </div>
        <h2 style={{ marginBottom: '0.75rem', textAlign: 'center', fontSize: '2.25rem', color: 'var(--primary)', letterSpacing: '-0.02em' }}>
          Get Started
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '0.9375rem' }}>
          Create your account to start tracking assets
        </p>
        
        {error && (
          <div style={{ padding: '0.875rem 1rem', marginBottom: '1.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--radius)', fontSize: '0.875rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form action={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="label" htmlFor="email">Email Address</label>
            <input 
              className="input"
              id="email" 
              name="email" 
              type="email" 
              required 
              placeholder="name@company.com"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input 
                className="input"
                id="password" 
                name="password" 
                type="password" 
                required 
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="label" htmlFor="confirm_password">Confirm</label>
              <input 
                className="input"
                id="confirm_password" 
                name="confirm_password" 
                type="password" 
                required 
                placeholder="••••••••"
              />
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', borderRadius: '10px', fontSize: '1rem' }}>
              Create Account
            </button>
            <div style={{ textAlign: 'center', fontSize: '0.875rem', marginTop: '1.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Already have an account?</span>{' '}
              <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Log In</Link>
            </div>
          </div>
        </form>
      </div>
    </div>

  )
}
