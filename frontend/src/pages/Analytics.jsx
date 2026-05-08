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
  Candid:      ROLE_TYPES.Candid?.color || '#10B981',
  Traditional: ROLE_TYPES.Traditional?.color || '#F43F5E',
  Wedding:     ROLE_TYPES.Wedding?.color || '#8B5CF6',
  Corporate:   ROLE_TYPES.Corporate?.color || '#3B82F6',
  Event:       ROLE_TYPES.Event?.color || '#10B981',
  Portrait:    ROLE_TYPES.Portrait?.color || '#F59E0B',
  Lead:        ROLE_TYPES.Lead?.color || '#3B82F6',
  Drone:       ROLE_TYPES.Drone?.color || '#8B5CF6',
  Reel:        ROLE_TYPES.Reel?.color || '#F59E0B',
  Other:       ROLE_TYPES.Other?.color || '#64748b',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'12px',padding:'12px 16px',boxShadow:'var(--shadow-lg)',fontSize:13}}>
      <div style={{fontWeight:700,marginBottom:8,color:'var(--text-primary)'}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{color:p.color,display:'flex',justifyContent:'space-between',gap:24,alignItems:'center'}}>
          <span style={{color: 'var(--text-secondary)'}}>{p.name}</span>
          <strong style={{color: 'var(--text-primary)'}}>
            {typeof p.value==='number' ? `₹${p.value.toLocaleString()}` : p.value}
          </strong>
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
  const { state, dispatch } = useApp();
  const { analyticsRole, analyticsTimeframe, analytics } = state;

  const isPhotographerMode = analyticsRole === 'photographer';

  const handleRoleChange = (role) => {
    dispatch({ type: 'SET_ANALYTICS_ROLE', payload: role });
  };


  const handleTimeframeChange = (tf) => {
    dispatch({ type: 'SET_ANALYTICS_TIMEFRAME', payload: tf });
  };

  // Dynamic data based on role
  const trendData = isPhotographerMode 
    ? analytics.bookingTrends.slice(-12) 
    : analytics.photographerEarnings;
    
  const revenueByRole = analytics.revenueByRole;

  
  return (
    <div className="analytics-container">
      {/* ─── FILTERS BAR ─── */}
      <div className="analytics-filters">
        <div className="role-switch">
          <button 
            className={`switch-btn ${isPhotographerMode ? 'active' : ''}`}
            onClick={() => handleRoleChange('photographer')}
          >
            Photographer
          </button>
          <button 
            className={`switch-btn ${!isPhotographerMode ? 'active' : ''}`}
            onClick={() => handleRoleChange('freelancer')}
          >
            Freelancer
          </button>
        </div>


        <div className="timeframe-group">
          {['1W', '1M', '3M', '6M', '1Y', '2Y'].map(tf => (
            <button 
              key={tf}
              className={`tf-btn ${analyticsTimeframe === tf ? 'active' : ''}`}
              onClick={() => handleTimeframeChange(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* ─── KPI ROW ─── */}
      <div className="grid-4">
        <StatCard 
          label="Total Revenue" 
          value={`₹${(isPhotographerMode ? (analytics.totalRevenue || 0) : (analytics.photographerRevenue || 0)).toLocaleString()}`} 
          change="0%" 
          changeDir="up" 
          icon={<DollarSign size={18} />} 
          iconBg="rgba(16,185,129,0.1)"
        />

        <StatCard 
          label="Jobs Completed" 
          value={isPhotographerMode ? (analytics.totalJobsCompleted || 0) : (analytics.jobsThisMonth || 0)} 
          change="0" 
          changeDir="up" 
          icon={<Briefcase size={18} />} 
          iconBg="rgba(59,130,246,0.1)"
        />

        <StatCard 
          label="Utilization Rate" 
          value={`${analytics.utilizationRate || 0}%`} 
          change="0%" 
          changeDir="up" 
          icon={<TrendingUp size={18} />} 
          iconBg="rgba(139,92,246,0.1)"
        />

        <StatCard 
          label="Avg Rating" 
          value={analytics.clientSatisfaction || 0} 
          suffix="/5" 
          icon={<Star size={18} />} 
          iconBg="rgba(245,158,11,0.1)"
        />

      </div>


      <div className="analytics-main-grid">
        {/* ─── REVENUE CHART ─── */}
        <div className="card card-padding chart-main">
          <div className="section-header">
            <h2 className="section-title">Revenue Growth</h2>
            <div className="chart-legend">
              <span className="legend-item"><div className="dot blue" /> Revenue</span>
              <span className="legend-item"><div className="dot purple" /> Volume</span>
            </div>
          </div>
          {trendData.length === 0 ? (
            <div className="empty-chart-msg">
              <BarChart2 size={40} style={{color:'var(--text-muted)',marginBottom:16}}/>
              <p>Your analytics will appear here once data is created.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 11}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 11}} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>


        {/* ─── DISTRIBUTION ─── */}
        <div className="card card-padding chart-side">
          <div className="section-header">
            <h2 className="section-title">Category Share</h2>
          </div>
          {revenueByRole.length === 0 ? (
            <div className="empty-mini" style={{textAlign:'center',marginTop:40}}>No categories yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={revenueByRole}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {revenueByRole.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="distribution-legend">
            {revenueByRole.map(r => (
              <div key={r.name} className="dist-item">
                <div className="dist-dot" style={{background: r.color}} />
                <span className="dist-name">{r.name}</span>
                <span className="dist-val">{Math.round(r.value/1000)}k</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ─── TOP PHOTOGRAPHERS (Photographer View Only) ─── */}
      {isPhotographerMode && (
        <div className="card rankings-section">
          <div className="card-padding">
            <h2 className="section-title">Top Collaborative Photographers</h2>
          </div>
          {state.team.length === 0 ? (
            <div className="card-padding" style={{textAlign:'center',color:'var(--text-muted)',paddingBottom:40}}>
               No collaborative data available yet. Add team members to start tracking rankings.
            </div>
          ) : (
            <div className="table-container">
              <table className="ecosystem-table">
                <thead>
                  <tr>
                    <th>Photographer</th>
                    <th>Jobs Together</th>
                    <th>Earnings Generated</th>
                    <th>Rating</th>
                    <th>Latest Work</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Actual team data would be mapped here in a real scenario */}
                  <tr style={{textAlign:'center'}}><td colSpan={5}>No collaborative rankings found.</td></tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

      )}
    </div>
  );
}
