import { logout } from './actions'

export default function DashboardLayout({ children }) {
  return (
    <div style={{ flex: 1, width: '100%' }}>
      {children}
    </div>
  )
}
