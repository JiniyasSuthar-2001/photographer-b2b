// ==================================================================================
// CONTEXT: APP STATE MANAGEMENT
// Purpose: Centralized "Source of Truth" for the entire platform.
// Impact: Changes here affect EVERY component using useApp() or usePermission().
// Connectivity:
// - services/api.js (Supplies the data via API calls)
// - reducer.js (Handles all state transitions)
// ==================================================================================

import { createContext, useContext, useReducer, useEffect } from 'react';
import { reducer } from './reducer';
import { getAppInitialState } from '../data/mockData';
import { jobService, requestService, notificationService, teamService, taskService, subscriptionService } from '../services/api';



const today = new Date().toISOString().split('T')[0];
function getFirstDate(dateStr) {
  if (typeof dateStr === 'string' && dateStr.includes(',')) return dateStr.split(',')[0].trim();
  return dateStr;
}

// --- INITIAL STATE ---
// We prioritize data from localStorage for a persistent session.
const getSessionInitialState = () => {
  const savedUser = localStorage.getItem('user');
  const initialUser = savedUser ? (typeof savedUser === 'string' && savedUser !== 'undefined' ? JSON.parse(savedUser) : null) : null;
  
  const baseState = getAppInitialState(initialUser?.username);
  
  return {
    ...baseState,
    user: {
      ...baseState.user,
      ...(initialUser || {}),
      mode: initialUser?.user_type || 'photographer',
    },
    // --- CORE ECOSYSTEM STATE ---
    // ROLE SYSTEM: 
    // - photographer: (Old Studio Owner) Can post jobs, manage teams.
    // - freelancer: (Old Photographer) Can accept invites, view assigned work.
    activeDashboardRole: initialUser?.user_type || 'photographer',
    activeMainTab: 'my-jobs',
    activeSubTab: 'accepted',
    analyticsRole: initialUser?.user_type || 'photographer',

    analyticsTimeframe: '1M',

    
    // Dynamic data: Initialize as empty for everyone EXCEPT admin (who uses mock data as fallback)
    jobs: initialUser?.username === 'admin' ? baseState.jobs : [],
    jobRequests: initialUser?.username === 'admin' ? baseState.jobRequests : [],
    jobTasks: initialUser?.username === 'admin' ? baseState.jobTasks : [],
    notifications: initialUser?.username === 'admin' ? baseState.notifications : [],
    unreadCount: initialUser?.username === 'admin' ? (baseState.notifications?.filter(n => !n.is_read).length || 0) : 0,
  };
};


const initialState = getSessionInitialState();

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // --- GLOBAL SYNC ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const syncBackendData = async () => {
      try {
        const [jobs, notifications, team, tasks, userStatus] = await Promise.all([
          jobService.getJobs(),
          notificationService.getNotifications(),
          teamService.getTeam(),
          taskService.getTasks(),
          subscriptionService.getStatus()
        ]);
        
        dispatch({ type: 'INITIALIZE_USER_DATA', payload: userStatus });
        dispatch({ type: 'SET_JOBS', payload: jobs });
        dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
        dispatch({ type: 'SET_TEAM', payload: team });
        dispatch({ type: 'SET_TASKS', payload: tasks });


        // Fetch requests based on role
        if (state.user.mode === 'freelancer' || state.user.user_type === 'freelancer') {
          const [invites, accepted] = await Promise.all([
            requestService.getInvites(),
            requestService.getAcceptedJobs()
          ]);
          dispatch({ type: 'SET_JOB_REQUESTS', payload: [...invites, ...accepted] });
        }

      } catch (err) {
        console.error('Initial data sync failed:', err);
      }
    };

    syncBackendData();

    // --- SESSION SAFETY: Handle cross-tab login/logout ---
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        if (!e.newValue) {
          // If token was removed in another tab, logout this tab too
          window.location.href = '/auth';
        } else {
          // If token was changed (new login), refresh to sync state
          window.location.reload();
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [state.user.id]);

  // --- UTILITY: TOAST NOTIFICATIONS ---
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

// --- CUSTOM HOOKS ---

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// --- PERMISSION HELPERS ---
export function usePermission() {
  /**
   * Defines what a user can see/do based on their profile.
   * NOTE: Currently most permissions are hardcoded to 'true' for the demo.
   * Modification Impact: Setting 'canPostJob' to false will hide the 
   * 'Post New Job' button in JobHub.jsx globally.
   */
  const { state } = useApp();
  const { user } = state;
  const authority = user.authority;
  const role = user.user_type || user.mode;

  /**
   * ROLE RENAMING ARCHITECTURE:
   * - isPhotographer (True if role === 'photographer'): This is the OLD 'studio_owner'.
   *   They have administrative power: posting jobs, inviting team members.
   * - isFreelancer (True if role === 'freelancer'): This is the OLD 'photographer'.
   *   They are the work force: applying for jobs, receiving invites.
   */
  const isPhotographer = role === 'photographer';
  const isFreelancer = role === 'freelancer';

  return {
    isPhotographer,
    isFreelancer,
    isManager:         isPhotographer && authority === 'manager',
    isStaff:           isPhotographer && authority === 'staff',
    canPostJob:        isPhotographer,
    canInviteMember:   isPhotographer,
    canMoveJob:        isPhotographer,
    canSendRequest:    isPhotographer,
    canApplyJob:       isFreelancer,
    canViewTeam:       isPhotographer,
    canViewFinancials: isPhotographer && authority === 'manager',
    canChangeAuthority:isPhotographer && authority === 'manager',
    canViewAnalytics:  true, // Open to all as per requirements
  };

}
