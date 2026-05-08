import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, ExternalLink, Inbox } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { notificationService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './NotificationBell.css';

/**
 * COMPONENT: NotificationBell
 * Purpose: Centralized alert system replacing the legacy notifications page.
 * Logic:
 * 1. Fetches notifications on mount.
 * 2. Displays unread count from global state.
 * 3. On click: marks as read and redirects based on 'redirect_to' field.
 */
export default function NotificationBell() {
  const { state, dispatch, addToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const { notifications, unreadCount } = state;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.is_read) {
        await notificationService.markAsRead(notif.id);
        dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notif.id });
      }
      setIsOpen(false);
      
      // Redirect logic: Connected Platform Behavior
      if (notif.redirect_to) {
        navigate(notif.redirect_to);
      }
    } catch (err) {
      console.error('Failed to process notification click:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      dispatch({ type: 'MARK_ALL_READ' });
      addToast('All notifications marked as read');
    } catch (err) {
      addToast('Failed to mark all as read', 'error');
    }
  };

  return (
    <div className="notif-bell-container" ref={dropdownRef}>
      <button 
        className={`notif-bell-trigger ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="notif-mark-all">
                Mark all as read
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <Inbox size={32} />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`notif-item ${!notif.is_read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="notif-item-icon">
                    {notif.type === 'job_invite' ? <ExternalLink size={16} /> : <Check size={16} />}
                  </div>
                  <div className="notif-item-content">
                    <div className="notif-item-title">{notif.title}</div>
                    <div className="notif-item-message">{notif.message}</div>
                    <div className="notif-item-time">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {!notif.is_read && <div className="notif-unread-dot" />}
                </div>
              ))
            )}
          </div>

          <div className="notif-footer">
            <span>Powered by Lumière Real-time</span>
          </div>
        </div>
      )}
    </div>
  );
}
