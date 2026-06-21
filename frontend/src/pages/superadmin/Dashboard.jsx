const sf = '-apple-system, "SF Pro Display", "SF Pro Text", BlinkMacSystemFont, "Inter", "Helvetica Neue", sans-serif'

export default function SuperAdminDashboard() {
  return (
    <div style={{
      fontFamily: sf,
      background: '#fff',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#0a0a0a',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', fontWeight: '600', letterSpacing: '-1.2px', marginBottom: '8px' }}>
          Superadmin
        </div>
        <div style={{ fontSize: '15px', color: '#9ca3af' }}>
          Dashboard en cours de construction
        </div>
      </div>
    </div>
  )
}