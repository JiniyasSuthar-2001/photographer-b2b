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

    case 'DELETE_AVAILABILITY':
      const newAvail = { ...state.availability };
      delete newAvail[action.payload];
      return { ...state, availability: newAvail };

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
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };

    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };

    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
      };

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
