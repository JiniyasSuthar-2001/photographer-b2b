import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, BarChart2, UserCircle,
  Briefcase, ChevronRight, Sparkles, Settings, Lock, Camera,
  ClipboardList
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Avatar from '../ui/Avatar';
import './Sidebar.css';

const studioOwnerNav = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/job-hub', icon: Briefcase, label: 'Job Hub' },
  { path: '/team', icon: Users, label: 'Team' },
  { path: '/analytics', icon: BarChart2, label: 'Analytics' },
  { path: '/notes', icon: ClipboardList, label: 'Notes' },
  { path: '/profile', icon: UserCircle, label: 'Profile' },
];

const freelancerNav = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/calendar', icon: Calendar, label: 'My Calendar' },
  { path: '/job-hub', icon: Briefcase, label: 'Job Hub' },
  { path: '/team', icon: Users, label: 'Team' },
  { path: '/notes', icon: ClipboardList, label: 'Notes' },
  { path: '/profile', icon: UserCircle, label: 'Profile' },
];

export default function Sidebar() {
  const { state } = useApp();
  const { user } = state;
  const navItems = user.mode === 'freelancer' ? freelancerNav : studioOwnerNav;

  const pendingRequests = state.jobRequests.filter(r =>
    user.mode === 'freelancer'
      ? r.status === 'pending'
      : false
  ).length;

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Sparkles size={16} />
        </div>
        <span className="sidebar-logo-text">Lumière</span>
      </div>

      {/* Mode Badge */}
      <div className="sidebar-mode-badge">
        <span>{user.mode === 'freelancer' ? 'Freelancer' : 'Studio Owner'}</span>
        {user.authority === 'manager' && user.mode === 'studio_owner' && (
          <span className="sidebar-authority">Manager</span>
        )}
        {user.authority === 'staff' && user.mode === 'studio_owner' && (
          <span className="sidebar-authority staff">Staff</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">Navigation</div>
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path + label}
            to={path}
            end={path === '/'}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-nav-bar" />
            <Icon size={18} className="sidebar-nav-icon" />
            <span className="sidebar-nav-label-text">{label}</span>
            {path === '/job-hub' && pendingRequests > 0 && (
              <span className="sidebar-nav-badge">{pendingRequests}</span>
            )}
          </NavLink>
        ))}

        {/* Locked Analytics item for Freelancer */}
        {user.mode === 'freelancer' && (
          <div className="sidebar-nav-item disabled" title="Analytics is available for Studio Owners">
            <span className="sidebar-nav-bar" />
            <BarChart2 size={18} className="sidebar-nav-icon" />
            <span className="sidebar-nav-label-text">Analytics</span>
            <Lock size={12} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
          </div>
        )}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Trial Banner */}
      {user.isOnTrial && (
        <div className="sidebar-trial">
          <div className="sidebar-trial-text">
            <strong>{user.trialDaysLeft} days</strong> left on trial
          </div>
          <NavLink to="/profile" className="sidebar-trial-cta">Upgrade to Pro</NavLink>
        </div>
      )}

      {/* Profile */}
      <div className="sidebar-profile">
        <Avatar name={user.name} size="sm" />
        <div className="sidebar-profile-info">
          <div className="sidebar-profile-name">{user.name}</div>
          <div className="sidebar-profile-email">{user.email}</div>
        </div>
        <NavLink to="/profile" className="sidebar-profile-settings">
          <Settings size={15} />
        </NavLink>
      </div>
    </aside>
  );
}
