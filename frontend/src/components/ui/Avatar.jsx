import { useApp } from '../../context/AppContext';

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const COLORS = [
  '#3B82F6', '#8B5CF6', '#2DD4BF', '#F59E0B', '#F43F5E',
  '#10B981', '#EC4899', '#6366F1', '#14B8A6', '#F97316',
];

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function Avatar({ name, size = 'md', color, showStatus, status, className = '' }) {
  const initials = getInitials(name || '??');
  const bg = color || stringToColor(name || 'user');

  const sizeClass = {
    sm: 'avatar-sm',
    md: 'avatar-md',
    lg: 'avatar-lg',
    xl: 'avatar-xl',
    '2xl': 'avatar-2xl',
  }[size] || 'avatar-md';

  return (
    <div
      className={`avatar ${sizeClass} ${className}`}
      style={{ background: `linear-gradient(135deg, ${bg}, ${bg}cc)` }}
      title={name}
    >
      {initials}
      {showStatus && status && (
        <span className={`avatar-status ${status}`} />
      )}
    </div>
  );
}
