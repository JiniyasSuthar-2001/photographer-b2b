import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Briefcase, Calendar, Clock, DollarSign, MapPin } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import { useApp } from '../context/AppContext';
import { dashboardService, requestService } from '../services/api';
import './Dashboard.css';

const ROLE_OPTIONS = [
  { id: 'photographer', label: 'Photographer' },
  { id: 'freelancer', label: 'Freelancer' },
];

export default function Dashboard() {
  const { state, dispatch, addToast } = useApp();
  const navigate = useNavigate();
  const activeRole = state.activeDashboardRole || 'freelancer';

  useEffect(() => {
    // Shared Dashboard aggregator used by cards, navigation, analytics cross-links, and role toggles.
    const loadDashboard = async () => {
      try {
        const [myJobs, invites, acceptedJobs, acceptedRequests] = await Promise.all([
          dashboardService.getMyJobs(),
          requestService.getInvites(),
          dashboardService.getAcceptedJobs(),
          requestService.getRequests({ role: 'receiver', status: 'accepted' }),
        ]);

        const latestRequests = invites.slice(0, 4);
        const latestJobs = myJobs.slice(0, 4);

        // Role-aware earnings contract:
        // freelancer = accepted payouts, photographer = owned job revenue.
        const freelancerEarnings = acceptedRequests.reduce((sum, item) => sum + (Number(item.budget) || 0), 0);
        const photographerRevenue = myJobs
          .filter(job => ['assigned', 'completed', 'in_progress'].includes(job.status))
          .reduce((sum, item) => sum + ((Number(item.accepted_count) || 0) * 5000), 0);

        // Connected schedule: always combines owned jobs + accepted assignments irrespective of active role.
        const now = new Date();
        const weekAhead = new Date();
        weekAhead.setDate(now.getDate() + 7);
        const nextWeekJobs = [...myJobs, ...acceptedJobs]
          .filter(item => item.date && new Date(item.date) >= now && new Date(item.date) <= weekAhead)
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        dispatch({ type: 'SET_LATEST_REQUESTS', payload: latestRequests });
        dispatch({ type: 'SET_LATEST_JOBS', payload: latestJobs });
        dispatch({ type: 'SET_ACCEPTED_JOBS', payload: acceptedJobs });
        dispatch({ type: 'SET_INVITES', payload: invites });
        dispatch({ type: 'SET_NEXT_WEEK_JOBS', payload: nextWeekJobs });
        dispatch({
          type: 'SET_EARNINGS_BY_ROLE',
          payload: { freelancer: freelancerEarnings, photographer: photographerRevenue },
        });
        dispatch({
          type: 'SET_DASHBOARD_STATS',
          payload: {
            pendingRequests: invites.length,
            activeAssignments: acceptedJobs.length,
            myJobs: myJobs.length,
          },
        });
      } catch {
        addToast('Failed to refresh dashboard', 'error');
      }
    };

    loadDashboard();
  }, [addToast, dispatch]);

  const earnings = state.earningsByRole?.[activeRole] || 0;
  const dashboardStats = state.dashboardStats || {};
  const latestRequests = state.latestRequests || [];
  const latestJobs = state.latestJobs || [];
  const nextWeekJobs = state.nextWeekJobs || [];

  const rolePanelTitle = useMemo(
    () => activeRole === 'freelancer' ? 'My Requests' : 'My Jobs',
    [activeRole],
  );

  return (
    <div className="dashboard">
      <div className="card card-padding">
        <div style={{ display: 'flex', gap: 8 }}>
          {ROLE_OPTIONS.map(role => (
            <button
              key={role.id}
              className={`toggle-btn ${activeRole === role.id ? 'active' : ''}`}
              onClick={() => {
                dispatch({ type: 'SET_ACTIVE_DASHBOARD_ROLE', payload: role.id });
                dispatch({ type: 'SET_ANALYTICS_ROLE', payload: role.id });
              }}
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-3">
        {activeRole === 'freelancer' && (
          <div onClick={() => navigate('/job-hub?main=accepted-jobs&tab=invites')}>
            <StatCard label="Pending Requests" value={dashboardStats.pendingRequests || 0} icon={<Bell size={18} />} />
          </div>
        )}
        <div onClick={() => navigate('/job-hub')}>
          <StatCard label="Active Assignments" value={dashboardStats.activeAssignments || 0} icon={<Briefcase size={18} />} />
        </div>
        <div onClick={() => navigate('/analytics')}>
          <StatCard label="Earnings This Month" value={`₹${Number(earnings).toLocaleString()}`} icon={<DollarSign size={18} />} />
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-left">
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-title">{rolePanelTitle}</div>
            </div>
            <div className="request-list">
              {(activeRole === 'freelancer' ? latestRequests : latestJobs).map(item => (
                <div
                  key={item.id}
                  className="request-row"
                  onClick={() => navigate(activeRole === 'freelancer' ? '/job-hub?main=accepted-jobs&tab=invites' : '/job-hub?main=my-jobs')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="request-info">
                    <div className="request-title">{item.job_title || item.title}</div>
                    <div className="request-meta">
                      <Clock size={12} />
                      <span>{item.job_date ? new Date(item.job_date).toLocaleDateString('en-GB') : new Date(item.date).toLocaleDateString('en-GB')}</span>
                    </div>
                  </div>
                  <span className="request-status-chip">{item.status || 'open'}</span>
                </div>
              ))}
              {(activeRole === 'freelancer' ? latestRequests : latestJobs).length === 0 && (
                <div className="empty-state">No items yet</div>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-right">
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-title">Next Week Work</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {nextWeekJobs.slice(0, 6).map((job, idx) => (
                <div key={`${job.id}-${idx}`} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{job.title || job.job_title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 8 }}>
                    <span><Clock size={11} /> {new Date(job.date || job.job_date).toLocaleDateString('en-GB')}</span>
                    <span><MapPin size={11} /> {job.location || 'Location pending'}</span>
                  </div>
                </div>
              ))}
              {nextWeekJobs.length === 0 && <div className="empty-state">No upcoming jobs</div>}
            </div>
          </div>
          <MiniCalendar />
        </div>
      </div>

      <button className="fab" onClick={() => navigate('/calendar')}>
        <Calendar size={20} /> Add Job
      </button>
    </div>
  );
}

function MiniCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="card card-padding mini-calendar">
      <div className="card-title" style={{ marginBottom: 8 }}>Calendar</div>
      <div className="mini-cal-grid-header">
        {DAYS.map(d => <div key={d} className="mini-cal-day-name">{d}</div>)}
      </div>
      <div className="mini-cal-grid">
        {Array.from({ length: firstDay }, (_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => <div key={i + 1} className="mini-cal-cell">{i + 1}</div>)}
      </div>
    </div>
  );
}
