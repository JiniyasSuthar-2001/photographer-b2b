export default function Badge({ children, variant = 'blue', className = '' }) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const labels = {
    open: 'Open',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return <Badge variant={status}>{labels[status] || status}</Badge>;
}

export function AvailabilityBadge({ status }) {
  const labels = {
    available: 'Available',
    booked: 'Booked',
    partial: 'Partial',
    blocked: 'Blocked',
  };
  return <Badge variant={status}>{labels[status] || status}</Badge>;
}
