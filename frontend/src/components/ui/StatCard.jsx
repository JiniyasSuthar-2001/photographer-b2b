export default function StatCard({ label, value, change, changeDir = 'up', icon, iconBg, prefix = '', suffix = '', desc = '' }) {
  return (
    <div className="stat-card">
      {icon && (
        <div className="stat-icon" style={{ background: iconBg || 'var(--gradient-soft)' }}>
          {icon}
        </div>
      )}
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {prefix}<CountUp value={value} />{suffix}
      </div>
      {change !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className={`stat-change ${changeDir}`}>
            {changeDir === 'up' ? '↑' : '↓'} {change}
          </span>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>vs last month</span>
        </div>
      )}
    </div>
  );
}

function CountUp({ value }) {
  // Simple display — animation via CSS
  if (typeof value === 'number') {
    return <>{value.toLocaleString()}</>;
  }
  return <>{value}</>;
}
