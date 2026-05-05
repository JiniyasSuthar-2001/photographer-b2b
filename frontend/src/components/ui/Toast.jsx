import { useApp } from '../../context/AppContext';

export default function Toast() {
  const { state, dispatch } = useApp();

  return (
    <div className="toast-container">
      {state.toasts.map(t => (
        <div
          key={t.id}
          className={`toast ${t.toastType || 'success'}`}
          onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: t.id })}
        >
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
