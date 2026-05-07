import { useState, useRef, useEffect } from 'react';
import { Bell, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { notificationService } from '../../services/api';
import './NotificationBell.css';

export default function NotificationBell() {
  const { state, dispatch } = useApp();
  const { notifications = [] } = state;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = state.unreadCount ?? notifications.filter(n => !n.is_read && !n.read).length;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getNotifications();
        dispatch({ type: 'SET_NOTIFICATIONS', payload: data });
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    try {
      // Notification lifecycle:
      // 1) mark as read 2) sync shared unread counter 3) redirect to linked workflow page.
      if (!notif.is_read && !notif.read) {
        await notificationService.markAsRead(notif.id);
        dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notif.id });
      }
      
      setIsOpen(false);
      if (notif.redirect_to) {
        navigate(notif.redirect_to);
      }
    } catch (err) {
      console.error('Error handling notification click:', err);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notif-bell-container" ref={dropdownRef}>
      <button 
        className="notif-bell-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="mark-all-btn"
                onClick={async () => {
                  await notificationService.markAllRead();
                  dispatch({ type: 'MARK_ALL_READ' });
                }}
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">No notifications yet</div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`notif-item ${!notif.is_read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="notif-content">
                    <p className="notif-message">{notif.message}</p>
                    <div className="notif-meta">
                      <Clock size={12} />
                      <span>{formatTime(notif.created_at)}</span>
                    </div>
                  </div>
                  {!notif.is_read && <div className="unread-dot" />}
                  <ChevronRight size={14} className="notif-arrow" />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
