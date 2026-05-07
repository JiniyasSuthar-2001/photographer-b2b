import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { DollarSign, Briefcase, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/ui/StatCard';
import { analyticsService, jobService, requestService, teamService } from '../services/api';
import './Analytics.css';

const ROLE_OPTIONS = ['photographer', 'freelancer'];
const RANGE_OPTIONS = ['1W', '1M', '3M', '6M', '1Y', '2Y'];
const RANGE_SIZE = { '1W': 1, '1M': 1, '3M': 3, '6M': 6, '1Y': 12, '2Y': 24 };

export default function Analytics() {
  const { state, dispatch, addToast } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    // Analytics aggregation flow:
    // combines owned jobs, accepted freelancer jobs, request payouts, and team aggregates.
    const loadAnalytics = async () => {
      try {
        const [jobs, acceptedJobs, acceptedRequests, teamMembers, topPhotographers] = await Promise.all([
          jobService.getJobs(),
          requestService.getAcceptedJobs(),
          requestService.getRequests({ role: 'receiver', status: 'accepted' }),
          teamService.getTeam(),
          analyticsService.getTopPhotographers(),
        ]);

        const photographerRevenue = jobs.reduce((sum, item) => sum + ((Number(item.accepted_count) || 0) * 5000), 0);
        const freelancerRevenue = acceptedRequests.reduce((sum, item) => sum + (Number(item.budget) || 0), 0);

        dispatch({
          type: 'SET_ANALYTICS_DATA',
          payload: {
            photographerRevenue,
            freelancerRevenue,
            jobs,
            acceptedJobs,
            acceptedRequests,
            teamMembers,
            topPhotographers,
          },
        });
      } catch {
        addToast('Failed to load analytics data', 'error');
      }
    };
    loadAnalytics();
  }, [addToast, dispatch]);

  const role = state.analyticsRole || 'photographer';
  const timeframe = state.analyticsTimeframe || '1M';
  const analytics = state.analyticsData;
  const trendSource = state.analytics.bookingTrends || [];
  const filteredTrend = trendSource.slice(-RANGE_SIZE[timeframe]);

  const revenue = role === 'photographer' ? analytics?.photographerRevenue || 0 : analytics?.freelancerRevenue || 0;
  const jobsCount = role === 'photographer' ? analytics?.jobs?.length || 0 : analytics?.acceptedJobs?.length || 0;

  // Role-aware chart system:
  // photographer uses owned-job volume; freelancer uses accepted assignment volume.
  const breakdownData = useMemo(() => (
    filteredTrend.map((point, index) => ({
      month: point.month,
      revenue: role === 'photographer'
        ? Math.round((analytics?.photographerRevenue || 0) / (filteredTrend.length || 1))
        : Math.round((analytics?.freelancerRevenue || 0) / (filteredTrend.length || 1)),
      jobs: role === 'photographer'
        ? Math.max(1, Math.round((analytics?.jobs?.length || 0) / (filteredTrend.length || 1))) + index
        : Math.max(1, Math.round((analytics?.acceptedJobs?.length || 0) / (filteredTrend.length || 1))) + index,
    }))
  ), [analytics, filteredTrend, role]);

  return (
    <div className="analytics-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div className="toggle-group">
          {ROLE_OPTIONS.map(item => (
            <button
              key={item}
              className={`toggle-option toggle-option-sm ${role === item ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_ANALYTICS_ROLE', payload: item })}
            >
              {item === 'photographer' ? 'Photographer' : 'Freelancer'}
            </button>
          ))}
        </div>
        <div className="toggle-group">
          {RANGE_OPTIONS.map(item => (
            <button
              key={item}
              className={`toggle-option toggle-option-sm ${timeframe === item ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_ANALYTICS_TIMEFRAME', payload: item })}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-3">
        <StatCard label="Revenue" value={`₹${revenue.toLocaleString()}`} icon={<DollarSign size={18} />} />
        <StatCard label="Jobs" value={jobsCount} icon={<Briefcase size={18} />} />
        <StatCard label="Avg Rating" value="4.8" icon={<Star size={18} />} />
      </div>

      <div className="card card-padding">
        <div className="card-title">Revenue Trend</div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={breakdownData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Line dataKey="revenue" stroke="#3B82F6" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card card-padding">
        <div className="card-title">Jobs Breakdown</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={breakdownData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="jobs" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <div className="card-padding" style={{ paddingBottom: 0 }}>
          <div className="card-title">Top Photographers</div>
        </div>
        <div className="table-wrapper" style={{ border: 'none', borderTop: '1px solid var(--border)', borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Photographer</th>
                <th>Jobs Together</th>
                <th>Earnings Generated</th>
                <th>Rating</th>
                <th>Latest Collaboration</th>
              </tr>
            </thead>
            <tbody>
              {(analytics?.topPhotographers || []).map(item => (
                <tr
                  key={item.member_id}
                  onClick={() => navigate(`/team?memberId=${item.member_id}&openHistory=1`)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{item.photographer_name}</td>
                  <td>{item.jobs_done_together}</td>
                  <td>₹{Number(item.earnings_generated || 0).toLocaleString()}</td>
                  <td>{item.rating}</td>
                  <td>{item.latest_collaboration_date ? new Date(item.latest_collaboration_date).toLocaleDateString('en-GB') : '-'}</td>
                </tr>
              ))}
              {(analytics?.topPhotographers || []).length === 0 && (
                <tr><td colSpan={5}>No collaboration analytics yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
