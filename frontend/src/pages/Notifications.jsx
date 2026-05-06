import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Check, Trash2, MailOpen, UserPlus, Info } from 'lucide-react';
import axios from 'axios';
import './Notifications.css';

const API_BASE_URL = 'http://localhost:8000/api';

export default function Notifications() {
  const { addToast } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      addToast('Failed to load notifications', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      addToast('Error updating notification', 'error');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(`${API_BASE_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      addToast('All notifications marked as read');
    } catch (error) {
      addToast('Error updating notifications', 'error');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'team_request': return <UserPlus size={18} className="icon-request" />;
      case 'job_invite': return <Briefcase size={18} className="icon-job" />;
      case 'request_response':
      case 'job_invite_response': return <Check size={18} className="icon-success" />;
      default: return <Info size={18} className="icon-info" />;
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div className="title-section">
          <Bell size={24} style={{ marginRight: 12, color: 'var(--primary-color)' }} />
          <h1 className="page-title">Notifications</h1>
        </div>
        {notifications.some(n => !n.is_read) && (
          <button className="btn btn-ghost" onClick={markAllAsRead}>
            <MailOpen size={16} style={{ marginRight: 8 }} /> Mark all as read
          </button>
        )}
      </div>

      <div className="notifications-container">
        {isLoading ? (
          <div className="loading-state">Loading your notifications...</div>
        ) : notifications.length > 0 ? (
          <div className="notifications-list">
            {notifications.map(n => (
              <div key={n.id} className={`notification-item ${n.is_read ? 'read' : 'unread'}`}>
                <div className="notification-icon">
                  {getIcon(n.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-title-row">
                    <h3 className="notification-title">{n.title}</h3>
                    <span className="notification-time">
                      {new Date(n.created_at).toLocaleDateString()} at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="notification-message">{n.message}</p>
                  {!n.is_read && (
                    <button className="mark-read-btn" onClick={() => markAsRead(n.id)}>
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon"><Bell size={48} /></div>
            <h3>No notifications yet</h3>
            <p>We'll notify you when something important happens.</p>
          </div>
        )}
      </div>
    </div>
  );
}
