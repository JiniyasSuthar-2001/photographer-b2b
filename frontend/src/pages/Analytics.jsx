import { useState } from 'react';
import { useApp, usePermission } from '../context/AppContext';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, DollarSign, Briefcase, Star, Lock, BarChart2 } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import { ROLE_TYPES } from '../data/mockData';
import './Analytics.css';

// ── Time range config ───────────────────────────────────────────────────────
const RANGES = [
  { label:'1M',  value:1  },
  { label:'3M',  value:3  },
  { label:'6M',  value:6  },
  { label:'12M', value:12 },
  { label:'2Y',  value:24 },
  { label:'3Y',  value:36 },
];

const ROLE_COLORS = {
  Candid:      ROLE_TYPES.Candid.color,
  Drone:       ROLE_TYPES.Drone.color,
  Traditional: ROLE_TYPES.Traditional.color,
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',padding:'10px 14px',boxShadow:'var(--shadow-lg)',fontSize:13}}>
      <div style={{fontWeight:600,marginBottom:4,color:'var(--text-primary)'}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{color:p.color,display:'flex',justifyContent:'space-between',gap:16}}>
          <span>{p.name}</span>
          <strong>{typeof p.value==='number'&&String(p.name).includes('$')?`$${p.value.toLocaleString()}`:p.value}</strong>
        </div>
      ))}
    </div>
  );
};

// ── Financial Gate Overlay ──────────────────────────────────────────────────
function FinancialLock({ children }) {
  return (
    <div className="financial-lock-wrapper">
      <div className="financial-lock-blur">{children}</div>
      <div className="financial-lock-overlay">
        <Lock size={28} style={{color:'var(--text-muted)'}}/>
        <div className="financial-lock-title">Manager Access Only</div>
        <div className="financial-lock-desc">Switch to Manager authority to view financial data</div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const { canViewAnalytics } = usePermission();
  // Freelancer lockout is handled by App.jsx AnalyticsGuard (redirects to /)
  // This component only renders for Studio Owners
  return <StudioAnalytics />;
}

function StudioAnalytics() {
  const { state } = useApp();
  const { analytics } = state;
  const { isManager } = usePermission();
  const [range, setRange] = useState(12);

  const trendData    = analytics.bookingTrends.slice(-range);
  const revenueData  = trendData.map(d=>({ month:d.month, amount:d.amount, jobs:d.jobs }));
  const totalRev     = revenueData.reduce((s,d)=>s+d.amount,0);
  const totalJobs    = revenueData.reduce((s,d)=>s+d.jobs,0);

  const revenueByRole = analytics.revenueByRole;
  const totalByRole   = revenueByRole.reduce((s,d)=>s+d.value,0);

  return (
    <div className="analytics-page">
      {/* Range selector */}
      <div style={{display:'flex',justifyContent:'flex-end'}}>
        <div className="toggle-group">
          {RANGES.map(r=>(
            <button key={r.value} className={`toggle-option toggle-option-sm ${range===r.value?'active':''}`} onClick={()=>setRange(r.value)}>
              {r.label}
            </button>
          ))}

        </div>
      </div>

      {/* KPI Row */}
      <div className="grid-4">
        {isManager ? (
          <>
            <StatCard label="Total Revenue"   value={`$${(totalRev/1000).toFixed(1)}k`}     change="18.4%" changeDir="up" icon={<DollarSign size={18} style={{color:'var(--accent-blue)'}}/>}   iconBg="rgba(59,130,246,0.1)"/>
            <StatCard label="Avg Job Value"   value={`$${analytics.avgJobValue.toLocaleString()}`} change="5.2%" changeDir="up" icon={<TrendingUp size={18} style={{color:'var(--accent-purple)'}}/>} iconBg="rgba(139,92,246,0.1)"/>
          </>
        ) : (
          <>
            <StatCard label="Total Revenue"   value="—"         icon={<Lock size={18} style={{color:'var(--text-muted)'}}/>} iconBg="rgba(0,0,0,0.05)" desc="Manager only"/>
            <StatCard label="Avg Job Value"   value="—"         icon={<Lock size={18} style={{color:'var(--text-muted)'}}/>} iconBg="rgba(0,0,0,0.05)" desc="Manager only"/>
          </>
        )}
        <StatCard label="Jobs Booked"     value={totalJobs}  change="2" changeDir="up"  icon={<Briefcase size={18} style={{color:'var(--accent-teal)'}}/>}  iconBg="rgba(45,212,191,0.1)"/>
        <StatCard label="Satisfaction"    value={analytics.clientSatisfaction} suffix="/5" change="0.2" changeDir="up" icon={<Star size={18} style={{color:'var(--accent-amber)'}}/>} iconBg="rgba(245,158,11,0.1)"/>
      </div>

      {/* Chart 1: Booking Trends — Line Chart */}
      <div className="card card-padding">
        <div className="card-header">
          <div>
            <div className="card-title">Booking Trends by Role</div>
            <div className="card-subtitle">Monthly bookings — Candid, Drone, Traditional</div>
          </div>
          <div style={{display:'flex',gap:16}}>
            {Object.entries(ROLE_COLORS).map(([key,color])=>(
              <div key={key} style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:'var(--text-secondary)'}}>
                <div style={{width:12,height:2,background:color,borderRadius:2}}/>
                {key}
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
            <XAxis dataKey="month" tick={{fontSize:11,fill:'var(--text-muted)'}} axisLine={false} tickLine={false} interval={Math.max(0,Math.floor(trendData.length/8)-1)}/>
            <YAxis tick={{fontSize:11,fill:'var(--text-muted)'}} axisLine={false} tickLine={false}/>
            <Tooltip content={<CustomTooltip/>}/>
            {Object.entries(ROLE_COLORS).map(([key,color])=>(
              <Line key={key} type="monotone" dataKey={key} name={key} stroke={color} strokeWidth={2.5} dot={false} activeDot={{r:4}}/>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Row 2: Revenue by Role (Donut) + Monthly Breakdown (Stacked Bar) */}
      <div className="analytics-row">
        {/* Revenue by Role Donut */}
        {isManager ? (
          <div className="card card-padding">
            <div className="card-header">
              <div>
                <div className="card-title">Revenue by Role</div>
                <div className="card-subtitle">Distribution across photography types</div>
              </div>
              <div style={{fontWeight:700,fontSize:17,color:'var(--accent-blue)'}}>${(totalByRole/1000).toFixed(1)}k</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'var(--space-6)'}}>
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={revenueByRole} cx="50%" cy="50%" innerRadius={50} outerRadius={82} dataKey="value" paddingAngle={3}>
                    {revenueByRole.map((entry,i)=>(
                      <Cell key={i} fill={entry.color}/>
                    ))}
                  </Pie>
                  <Tooltip formatter={(v)=>`$${v.toLocaleString()}`}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend" style={{flex:1}}>
                {revenueByRole.map(r=>(
                  <div key={r.name} className="pie-legend-item">
                    <div className="pie-legend-dot" style={{background:r.color}}/>
                    <span style={{flex:1}}>{r.name}</span>
                    <span style={{fontWeight:700,color:'var(--text-primary)'}}>${(r.value/1000).toFixed(1)}k</span>
                    <span style={{color:'var(--text-muted)',fontSize:11.5}}>{Math.round(r.value/totalByRole*100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <FinancialLock>
            <div className="card card-padding" style={{minHeight:240}}>
              <div className="card-title">Revenue by Role</div>
            </div>
          </FinancialLock>
        )}

        {/* Stacked Monthly Bar */}
        {isManager ? (
          <div className="card card-padding">
            <div className="card-header">
              <div>
                <div className="card-title">Monthly Breakdown</div>
                <div className="card-subtitle">Revenue stacked by role</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData.slice(-8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                <XAxis dataKey="month" tick={{fontSize:10.5,fill:'var(--text-muted)'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10.5,fill:'var(--text-muted)'}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="amount" name="Revenue $" fill="#3B82F6" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <FinancialLock>
            <div className="card card-padding" style={{minHeight:240}}>
              <div className="card-title">Monthly Breakdown</div>
            </div>
          </FinancialLock>
        )}
      </div>

      {/* Team Utilization */}
      <div className="card card-padding">
        <div className="card-header">
          <div>
            <div className="card-title">Team Utilization</div>
            <div className="card-subtitle">Booking rate per member</div>
          </div>
        </div>
        <div className="util-list">
          {analytics.teamUtilization.map((m,i)=>{
            const colors = ['#3B82F6','#8B5CF6','#2DD4BF','#F59E0B','#F43F5E','#10B981'];
            return (
              <div key={m.name} className="util-row">
                <div className="util-name">{m.name.split(' ')[0]}</div>
                <div className="progress-bar util-bar">
                  <div className="progress-fill" style={{width:m.percent+'%',background:colors[i%colors.length]}}/>
                </div>
                <div className="util-pct">{m.percent}%</div>
                <div style={{fontSize:11.5,color:'var(--text-muted)',width:50}}>{m.jobs} jobs</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Clients */}
      {isManager && (
        <div className="card">
          <div className="card-padding" style={{paddingBottom:0}}>
            <div className="card-header">
              <div className="card-title">Top Clients</div>
            </div>
          </div>
          <div className="table-wrapper" style={{border:'none',borderTop:'1px solid var(--border)',borderRadius:0}}>
            <table className="table">
              <thead><tr><th>Client</th><th>Jobs</th><th>Revenue</th><th>Rating</th></tr></thead>
              <tbody>
                {analytics.topClients.map((c,i)=>{
                  const cols=['#3B82F6','#8B5CF6','#2DD4BF','#F59E0B','#10B981'];
                  return (
                    <tr key={c.name}>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <div style={{width:28,height:28,borderRadius:'50%',background:cols[i%5],display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:12,flexShrink:0}}>{c.name[0]}</div>
                          <span style={{fontWeight:500}}>{c.name}</span>
                        </div>
                      </td>
                      <td>{c.jobs}</td>
                      <td style={{fontWeight:600,color:'var(--accent-blue)'}}>${c.revenue.toLocaleString()}</td>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:4}}>
                          <span style={{color:'var(--accent-amber)'}}>★</span>
                          <span style={{fontWeight:600}}>{c.satisfaction}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
