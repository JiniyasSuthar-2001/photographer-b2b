import { AlertCircle } from 'lucide-react';
import './EmptyState.css';

export default function EmptyState({ 
  title = "No Data Found", 
  message = "Try adjusting your filters or check back later.",
  action = null 
}) {
  return (
    <div className="empty-state-container">
      <div className="empty-state-visual">
        <AlertCircle size={40} strokeWidth={1.5} color="var(--text-muted)" />
        <div className="empty-state-glow" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
