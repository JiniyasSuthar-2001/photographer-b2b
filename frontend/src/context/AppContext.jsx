import { createContext, useContext, useReducer } from 'react';
import { reducer } from './reducer';
import { initialState as rawInitialState } from '../data/mockData';

const today = new Date().toISOString().split('T')[0];
function getFirstDate(dateStr) {
  if (typeof dateStr === 'string' && dateStr.includes(',')) return dateStr.split(',')[0].trim();
  return dateStr;
}

const filteredState = { ...rawInitialState };

// Filter out tasks (notes) for past or current jobs
filteredState.jobTasks = rawInitialState.jobTasks.filter(task => {
  const job = rawInitialState.jobs.find(j => j.id === task.jobId);
  return job ? getFirstDate(job.date) > today : true;
});

// Filter out requests for past or current jobs
filteredState.jobRequests = rawInitialState.jobRequests.filter(req => {
  return getFirstDate(req.date) > today;
});

// Filter out notifications related to past or current jobs
filteredState.notifications = rawInitialState.notifications.filter(notif => {
  const job = rawInitialState.jobs.find(j => notif.message.includes(j.title));
  return job ? getFirstDate(job.date) > today : true;
});
filteredState.unreadCount = filteredState.notifications.filter(n => !n.read && !n.is_read).length;

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, filteredState);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    dispatch({ type: 'ADD_TOAST', payload: { id, message, toastType: type } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 3500);
  };


  return (
    <AppContext.Provider value={{ state, dispatch, addToast }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// ── Permission helpers ────────────────────────────────────────────────────────
export function usePermission() {
  const { state } = useApp();
  const { mode: _mode, authority: _authority } = state.user;

  return {
    isStudioOwner:     true,
    isFreelancer:      true,
    isManager:         true,
    isStaff:           false,
    canPostJob:        true,
    canInviteMember:   true,
    canMoveJob:        true,
    canSendRequest:    true,
    canApplyJob:       true,
    canViewTeam:       true,
    canViewFinancials: true,
    canChangeAuthority:true,
    canViewAnalytics:  true,
  };
}
