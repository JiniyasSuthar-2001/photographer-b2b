import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Avatar from '../ui/Avatar';
import './TopBar.css';

const PAGE_TITLES = {
  '/':          'Dashboard',
  '/job-hub':   'Job Hub',
  '/calendar':  'Calendar',
  '/analytics': 'Analytics',
  '/profile':   'Profile',
};

const PAGE_TITLES_FREELANCER = {
  '/':          'Dashboard',
  '/job-hub':   'Job Hub',
  '/calendar':  'My Calendar',
  '/profile':   'Profile',
};

export default function TopBar() {
  const { state, dispatch } = useApp();
  const { user, notifications } = state;
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const titles = user.mode === 'freelancer' ? PAGE_TITLES_FREELANCER : PAGE_TITLES;
  const title = titles[location.pathname] || 'Lumière';
  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const notifIcons = { job: '💼', team: '👥', payment: '💰' };

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.02 + 'em' }}>{title}</h1>
        <span className="topbar-greeting">
          Welcome back, {user.name.split(' ')[0]} ✦
        </span>
      </div>

      <div className="topbar-right">
        {/* Mode Chip */}
        <div className="topbar-mode-chip">
          <span className="topbar-mode-dot" />
          {user.mode === 'freelancer' ? 'Freelancer' : 'Studio Owner'}
        </div>

        {/* Notifications */}
        <div className="topbar-notif-wrapper" ref={notifRef}>
          <button
            className="topbar-icon-btn"
            onClick={() => setNotifOpen(v => !v)}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unread > 0 && <span className="topbar-notif-dot">{unread}</span>}
          </button>

          {notifOpen && (
            <div className="topbar-notif-panel">
              <div className="topbar-notif-header">
                <span>Notifications</span>
                {unread > 0 && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => dispatch({ type: 'MARK_ALL_READ' })}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="topbar-notif-list">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`topbar-notif-item ${n.read ? 'read' : 'unread'}`}
                    onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id })}
                  >
                    <span className="topbar-notif-icon">{notifIcons[n.type] || '🔔'}</span>
                    <div className="topbar-notif-content">
                      <div className="topbar-notif-msg">{n.message}</div>
                      <div className="topbar-notif-time">{n.time}</div>
                    </div>
                    {!n.read && <span className="topbar-notif-unread-dot" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <Avatar name={user.name} size="sm" />
      </div>
    </header>
  );
}
