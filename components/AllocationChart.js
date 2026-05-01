'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function AllocationChart({ holdings }) {
  // Aggregate values by asset type
  const allocation = holdings.reduce((acc, holding) => {
    const value = holding.quantity * holding.current_price
    acc[holding.asset_type] = (acc[holding.asset_type] || 0) + value
    return acc
  }, {})

  const data = Object.keys(allocation).map(type => ({
    name: type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
    value: allocation[type]
  })).filter(item => item.value > 0)

  const totalValue = data.reduce((sum, item) => sum + item.value, 0)

  // 2025 Modern Palette - Trust & Growth
  const COLORS = [
    '#4f46e5', // Indigo
    '#0d9488', // Teal
    '#f59e0b', // Amber
    '#6366f1', // Indigo Light
    '#10b981', // Emerald
  ]

  if (data.length === 0) {
    return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No allocation data</div>
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          padding: '12px 16px', 
          border: '1px solid var(--border)', 
          borderRadius: '12px',
          boxShadow: 'var(--shadow-lg)',
          backdropFilter: 'blur(8px)'
        }}>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{payload[0].name}</p>
          <p style={{ margin: '4px 0 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(payload[0].value)}
          </p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--success)', fontWeight: 500 }}>
            {((payload[0].value / totalValue) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{ 
        position: 'absolute', 
        top: '46%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        textAlign: 'center',
        pointerEvents: 'none'
      }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
          ₹{(totalValue / 1000).toFixed(1)}k
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="46%"
            innerRadius={75}
            outerRadius={105}
            paddingAngle={6}
            cornerRadius={8}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            formatter={(value) => <span style={{ color: 'var(--text-main)', fontSize: '0.8125rem', fontWeight: 500 }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

