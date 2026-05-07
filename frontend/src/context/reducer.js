import { initialState } from '../data/mockData';

export function reducer(state, action) {
  switch (action.type) {

    // ── User ──────────────────────────────────────────────────────────────────
    case 'SET_USER_NAME':
      return { ...state, user: { ...state.user, name: action.payload } };

    case 'SET_USER_EMAIL':
      return { ...state, user: { ...state.user, email: action.payload } };

    case 'SET_PHONE':
      return { ...state, user: { ...state.user, phone: action.payload } };

    case 'SET_MODE':
      return { ...state, user: { ...state.user, mode: action.payload } };

    case 'SET_AUTHORITY':
      return { ...state, user: { ...state.user, authority: action.payload } };

    // Shared role toggle that drives Dashboard + Analytics role-aware rendering.
    case 'SET_ACTIVE_DASHBOARD_ROLE':
      return { ...state, activeDashboardRole: action.payload };

    case 'SET_ACTIVE_MAIN_TAB':
      return { ...state, activeMainTab: action.payload };

    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };

    case 'DISMISS_TRIAL_MODAL':
      return { ...state, user: { ...state.user, trialModalDismissed: true } };

    // ── Jobs ──────────────────────────────────────────────────────────────────
    case 'ADD_JOB':
      return { ...state, jobs: [action.payload, ...state.jobs] };

    case 'UPDATE_JOB':
      return {
        ...state,
        jobs: state.jobs.map(j => j.id === action.payload.id ? { ...j, ...action.payload } : j),
      };

    case 'ASSIGN_JOB':
      return {
        ...state,
        jobs: state.jobs.map(j =>
          j.id === action.payload.jobId
            ? { ...j, assignedTo: action.payload.memberId, status: 'assigned' }
            : j
        ),
      };

    case 'DELETE_JOB':
      return { ...state, jobs: state.jobs.filter(j => j.id !== action.payload) };

    // ── Job Requests ──────────────────────────────────────────────────────────
    case 'SEND_JOB_REQUEST':
      return {
        ...state,
        jobRequests: [action.payload, ...state.jobRequests],
      };

    case 'RESPOND_JOB_REQUEST': {
      const { id, status, payment } = action.payload;
      return {
        ...state,
        jobRequests: state.jobRequests.map(r =>
          r.id === id
            ? { ...r, status, payment: payment ?? r.payment, respondedAt: new Date().toISOString() }
            : r
        ),
        // If accepted, mark job as assigned
        jobs: status === 'accepted'
          ? state.jobs.map(j => {
              const req = state.jobRequests.find(r => r.id === id);
              return req && j.id === req.jobId ? { ...j, status: 'assigned' } : j;
            })
          : state.jobs,
      };
    }

    case 'DELETE_AVAILABILITY': {
      const newAvail = { ...state.availability };
      delete newAvail[action.payload];
      return { ...state, availability: newAvail };
    }

    case 'ADD_TASK':
      return { ...state, jobTasks: [...state.jobTasks, action.payload] };
    
    case 'TOGGLE_TASK':
      return { ...state, jobTasks: state.jobTasks.map(t => t.id === action.payload ? { ...t, completed: !t.completed } : t) };
    
    case 'UPDATE_TASK':
      return { ...state, jobTasks: state.jobTasks.map(t => t.id === action.payload.id ? { ...t, text: action.payload.text } : t) };
    
    case 'DELETE_TASK':
      return { ...state, jobTasks: state.jobTasks.filter(t => t.id !== action.payload) };

    case 'CANCEL_ACCEPTED_REQUEST':
      return {
        ...state,
        jobRequests: state.jobRequests.map(r => 
          r.id === action.payload ? { ...r, status: 'cancelled', respondedAt: new Date().toISOString() } : r
        ),
      };

    // ── Team ──────────────────────────────────────────────────────────────────
    case 'ADD_TEAM_MEMBER':
      return { ...state, team: [...state.team, action.payload] };

    case 'UPDATE_TEAM_MEMBER':
      return {
        ...state,
        team: state.team.map(m => m.id === action.payload.id ? { ...m, ...action.payload } : m),
      };

    // ── Calendar ──────────────────────────────────────────────────────────────
    case 'SET_AVAILABILITY':
      return {
        ...state,
        availability: { ...state.availability, [action.payload.date]: action.payload.status },
      };

    case 'TOGGLE_AVAILABILITY': {
      const current = state.availability[action.payload] || 'available';
      const cycle = { available: 'blocked', blocked: 'available', booked: 'booked', partial: 'available' };
      return {
        ...state,
        availability: { ...state.availability, [action.payload]: cycle[current] },
      };
    }

    case 'UPDATE_CALENDAR_ROLES':
      return {
        ...state,
        calendarRoles: {
          ...state.calendarRoles,
          [action.payload.date]: action.payload.roles,
        },
      };

    // ── Freelancer Profile ────────────────────────────────────────────────────
    case 'UPDATE_FREELANCER_PROFILE':
      return {
        ...state,
        freelancerProfile: { ...state.freelancerProfile, ...action.payload },
      };

    case 'ADD_EQUIPMENT': {
      const newItem = { id: Date.now(), ...action.payload };
      return {
        ...state,
        freelancerProfile: {
          ...state.freelancerProfile,
          equipment: [...state.freelancerProfile.equipment, newItem],
        },
      };
    }

    case 'REMOVE_EQUIPMENT':
      return {
        ...state,
        freelancerProfile: {
          ...state.freelancerProfile,
          equipment: state.freelancerProfile.equipment.filter(e => e.id !== action.payload),
        },
      };

    // ── Notifications ─────────────────────────────────────────────────────────
    case 'MARK_NOTIFICATION_READ': {
      // Handles both API payloads (`is_read`) and local demo payloads (`read`) consistently.
      // If unreadCount is not initialized yet, compute it from the current array first.
      const currentUnread = state.unreadCount ?? state.notifications.filter(n => !n.is_read && !n.read).length;
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, currentUnread - 1),
      };
    }

    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: (state.unreadCount ?? 0) + 1,
      };

    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.is_read && !n.read).length,
      };

    case 'SET_INVITES':
      return { ...state, invites: action.payload };

    case 'SET_ACCEPTED_JOBS':
      return { ...state, acceptedJobs: action.payload };

    case 'SET_COLLABORATIONS':
      return { ...state, collaborations: { ...state.collaborations, ...action.payload } };

    case 'SET_DASHBOARD_STATS':
      return { ...state, dashboardStats: action.payload };

    case 'SET_LATEST_REQUESTS':
      return { ...state, latestRequests: action.payload };

    case 'SET_LATEST_JOBS':
      return { ...state, latestJobs: action.payload };

    case 'SET_NEXT_WEEK_JOBS':
      return { ...state, nextWeekJobs: action.payload };

    case 'SET_EARNINGS_BY_ROLE':
      return { ...state, earningsByRole: action.payload };

    case 'SET_ANALYTICS_ROLE':
      return { ...state, analyticsRole: action.payload };

    case 'SET_ANALYTICS_TIMEFRAME':
      return { ...state, analyticsTimeframe: action.payload };

    case 'SET_ANALYTICS_DATA':
      return { ...state, analyticsData: action.payload };

    // ── Toasts ────────────────────────────────────────────────────────────────
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, { id: Date.now(), ...action.payload }],
      };

    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.payload),
      };

    // ── Reset ─────────────────────────────────────────────────────────────────
    case 'RESET_ALL':
      return initialState;

    default:
      return state;
  }
}
