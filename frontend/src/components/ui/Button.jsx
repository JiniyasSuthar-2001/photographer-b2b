export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  pill = false,
  icon = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  style,
}) {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const pillClass = pill ? 'btn-pill' : '';
  const iconClass = icon ? 'btn-icon' : '';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={style}
      className={`btn btn-${variant} ${sizeClass} ${pillClass} ${iconClass} ${className}`}
    >
      {children}
    </button>
  );
}
