// ==================================================================================
// PAGE: JOB HUB
// Purpose: Centralized management for all job postings, invitations, and work history.
// Connected Pages: 
// - Dashboard.jsx (Triggers navigation to specific tabs via global state)
// - Sidebar.jsx (Notification badge indicators)
// - Team.jsx (Redirects for adding teammates)
// Role Architecture:
// - Photographer: (Studio Owner) Sees 'My Jobs', posts new jobs, manages requests.
// - Freelancer: (Worker) Sees 'Accepted Jobs', 'Invites', and 'Declined Jobs'.
// ==================================================================================

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp, usePermission } from '../context/AppContext';
import { 
  Plus, Search, Filter, Clock, MapPin, Tag, Users, MoreVertical, 
  Send, Trash2, Calendar, Edit2, X, UserPlus, Briefcase, Building, Check, User 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobService, requestService, teamService } from '../services/api';
import { sortChronologically } from '../utils/sorting';
import Avatar from '../components/ui/Avatar';

import { StatusBadge } from '../components/ui/Badge';
import DatePicker from '../components/ui/DatePicker';
import './JobHub.css';


const ROLE_STYLES = {
  'Wedding': { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  'Candid': { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  'Traditional': { color: '#F43F5E', bg: 'rgba(244,63,94,0.1)' },
  'Corporate': { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  'Event': { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  'Portrait': { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  'Lead': { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  'Drone': { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  'Reel': { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  'Default': { color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
};

const getRoleStyle = (type) => {
  if (!type) return ROLE_STYLES.Default;
  const key = Object.keys(ROLE_STYLES).find(k => k.toLowerCase() === type.toLowerCase());
  return ROLE_STYLES[key] || ROLE_STYLES.Default;
};

export default function JobHub() {
  const { state, dispatch, addToast } = useApp();
  const { canPostJob } = usePermission();
  const navigate = useNavigate();

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    // If it's an ISO string, just take the date part
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }
    // If it's already a date string like YYYY-MM-DD, return it
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    // Fallback for Date objects or other formats
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // --- STATE MANAGEMENT (CONNECTED TO ECOSYSTEM) ---

  const activeMainTab = state.activeMainTab || 'my-jobs';
  const [activeSubTab, setActiveSubTab] = useState('accepted'); // sub-filters for freelancers


  const setActiveMainTab = (tab) => {
    dispatch({ type: 'SET_MAIN_TAB', payload: tab });
  };
  const [jobFilter, setJobFilter] = useState('all'); // specific filters for Photographers


  const [myJobs, setMyJobs] = useState([]);
  const [acceptedJobs, setAcceptedJobs] = useState([]);
  const [invites, setInvites] = useState([]);
  const [declinedInvites, setDeclinedInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [showNewJob, setShowNewJob] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(null);
  const [showCollaborationModal, setShowCollaborationModal] = useState(null);
  const [showJobStatusModal, setShowJobStatusModal] = useState(null);

  useEffect(() => {
    if (state.activeMainTab) {
      setActiveMainTab(state.activeMainTab);
    }
    if (state.activeSubTab) {
      setActiveSubTab(state.activeSubTab);
    }
  }, [state.activeMainTab, state.activeSubTab]);


  // Sync local state with global real-time state
  useEffect(() => {
    if (activeMainTab === 'my-jobs') {
      setMyJobs(state.jobs);
    } else {
      const allAccepted = state.jobRequests.filter(r => r.status === 'accepted' || r.status === 'assigned');
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (activeSubTab === 'accepted') {
        const filtered = allAccepted.filter(r => {
          const jobDate = new Date(r.job_date);
          jobDate.setHours(0, 0, 0, 0);
          return jobDate.getTime() >= now.getTime();
        });
        setAcceptedJobs(sortChronologically(filtered, 'job_date'));
      } else if (activeSubTab === 'past') {
        const filtered = allAccepted.filter(r => {
          const jobDate = new Date(r.job_date);
          jobDate.setHours(0, 0, 0, 0);
          return jobDate.getTime() < now.getTime();
        });
        setAcceptedJobs(sortChronologically(filtered, 'job_date'));
      } else {
        setAcceptedJobs([]); 
      }

      setInvites(sortChronologically(state.jobRequests.filter(r => r.status === 'pending'), 'job_date'));
      setDeclinedInvites(sortChronologically(state.jobRequests.filter(r => r.status === 'declined'), 'job_date'));

    }
  }, [state.jobs, state.jobRequests, activeMainTab, activeSubTab]);


  // --- DATA FETCHING ---
  const fetchData = async () => {
    /**
     * Logic: Switches endpoints based on the active tab and user role.
     * Connects to: backend/routers/jobs.py & backend/routers/requests.py
     */
    setIsLoading(true);
    try {
      if (activeMainTab === 'my-jobs') {
        const data = await jobService.getJobs();
        setMyJobs(sortChronologically(data, 'date'));
        dispatch({ type: 'SET_JOBS', payload: data });

      } else {
        if (activeSubTab === 'accepted') {
          const data = await requestService.getAcceptedJobs();
          setAcceptedJobs(sortChronologically(data, 'date'));

          // Update global requests too
          const otherRequests = state.jobRequests.filter(r => r.status !== 'accepted' && r.status !== 'assigned');
          dispatch({ type: 'SET_JOB_REQUESTS', payload: [...data, ...otherRequests] });
        } else if (activeSubTab === 'invites') {
          const data = await requestService.getInvites();
          setInvites(sortChronologically(data, 'job_date'));

          const otherRequests = state.jobRequests.filter(r => r.status !== 'pending');
          dispatch({ type: 'SET_JOB_REQUESTS', payload: [...data, ...otherRequests] });
        } else if (activeSubTab === 'past_assignments') {
          // Re-use accepted jobs but logic in render will filter for past
          const data = await requestService.getAcceptedJobs();
          setAcceptedJobs(sortChronologically(data, 'date'));
        } else {
          const data = await requestService.getDeclinedInvites();
          setDeclinedInvites(data);
          const otherRequests = state.jobRequests.filter(r => r.status !== 'declined');
          dispatch({ type: 'SET_JOB_REQUESTS', payload: [...data, ...otherRequests] });
        }

      }
    } catch (err) {
      console.error('Fetch error:', err);
      addToast('Failed to load data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // --- ACTIONS ---

  const handleCreateJob = async (jobData) => {
    /**
     * Trigger: 'Create Job' button in modal.
     * Side Effect: Moves job into 'Yet to Assign' tab automatically (status=open).
     */
    try {
      await jobService.createJob(jobData);
      addToast('Job created successfully', 'success');
      setShowNewJob(false);
      fetchData();
    } catch (err) {
      console.error('Create job error:', err.response?.data || err);
      addToast(err.response?.data?.detail || 'Failed to create job', 'error');
    }
  };

  const handleUpdateJob = async (id, jobData) => {
    try {
      await jobService.updateJob(id, jobData);
      addToast('Job updated successfully', 'success');
      setEditingJob(null);
      fetchData();
    } catch (err) {
      console.error('Update job error:', err.response?.data || err);
      addToast(err.response?.data?.detail || 'Failed to update job', 'error');
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await jobService.deleteJob(id);
      addToast('Job deleted successfully', 'success');
      fetchData();
    } catch (err) {
      addToast('Failed to delete job', 'error');
    }
  };

  const handleRespondToInvite = async (id, status) => {
    /**
     * Trigger: Accept/Decline buttons.
     * Side Effect: 
     * - If accepted: Job moves to 'Accepted Jobs' tab.
     * - If declined: Job moves to 'Declined Jobs' tab.
     */
    try {
      await requestService.respondToRequest(id, status);
      addToast(`Invite ${status}`, 'success');
      fetchData();
    } catch (err) {
      addToast('Error responding to invite', 'error');
    }
  };

  // --- UI FILTERING LOGIC ---
  // These functions do NOT fetch data; they filter existing state for the UI.

  const filterMyJobs = () => {
    /**
     * Logic for 'My Jobs' tab (Photographer view).
     * JOB LIFECYCLE DEFINITIONS:
     * - 'Yet to Assign': 0 accepted requests and NOT completed.
     * - 'Current': At least 1 assignment and happening TODAY.
     * - 'Past': Date is older than today or manually marked completed.
     */

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const filtered = myJobs.filter(job => {
      const jobDate = new Date(job.date);
      jobDate.setHours(0, 0, 0, 0);
      
      const isPast = job.is_completed || jobDate.getTime() < now.getTime();
      const isTodayOrFuture = jobDate.getTime() >= now.getTime();

      switch (jobFilter) {
        case 'current': 
          // Assigned jobs that are today or in the future
          return job.accepted_count > 0 && isTodayOrFuture;
        case 'yet_to_assign': 
          // Jobs that are today or in the future but have 0 accepted requests
          return job.accepted_count === 0 && isTodayOrFuture;
        case 'past': 
          // Jobs that have passed the date or are completed
          return isPast;
        default: 
          return true;
      }
    });


    return sortChronologically(filtered);
  };


  return (
    <div className="jobhub-page">
      <div className="jobhub-header">
        <div>
          <h1 className="page-title">Job Hub</h1>
          <p className="page-subtitle">Manage assignments and invitations</p>
        </div>
        {/* Permission logic: Only Photographers (Owners) can post */}

        {canPostJob && (
          <button className="btn btn-primary" onClick={() => setShowNewJob(true)}>
            <Plus size={18} /> Post New Job
          </button>
        )}
      </div>

      {/* Main Tab Switcher: Persists across the session */}
      <div className="job-hub-toggles">
        <button 
          className={`toggle-btn ${activeMainTab === 'my-jobs' ? 'active' : ''}`}
          onClick={() => setActiveMainTab('my-jobs')}
        >
          My Jobs
        </button>
        <button 
          className={`toggle-btn ${activeMainTab === 'accepted-jobs' ? 'active' : ''}`}
          onClick={() => setActiveMainTab('accepted-jobs')}
        >
          Accepted Jobs
        </button>
      </div>

      {/* VIEW: MY JOBS (PHOTOGRAPHER) */}

      {activeMainTab === 'my-jobs' ? (
        <div className="my-jobs-section">
          <div className="sub-tabs">
            {[
              { id: 'all', label: 'All' },
              { id: 'current', label: 'Current' },
              { id: 'yet_to_assign', label: 'Yet to Assign' },
              { id: 'past', label: 'Past' }
            ].map(t => (
              <button 
                key={t.id} 
                className={`sub-tab ${jobFilter === t.id ? 'active' : ''}`}
                onClick={() => setJobFilter(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="job-grid">
            {isLoading ? (
              <div className="loading-state">Loading jobs...</div>
            ) : filterMyJobs().length === 0 ? (
              <div className="empty-state">
                <Briefcase size={40} style={{color:'var(--text-muted)',marginBottom:16}}/>
                <p>No jobs found yet. Post your first job to get started!</p>
              </div>

            ) : (
              filterMyJobs().map(job => (
                <div key={job.id} className={`job-card redesigned-card ${job.is_completed ? 'completed-lifecycle' : ''}`}>
                  <div className="redesigned-card-header">
                    <div className="header-top">
                      <h3 className="card-client-name">{job.client || job.title || 'Untitled Job'}</h3>
                      <div className="card-admin-actions">
                        <button className="card-icon-btn" onClick={() => setShowJobStatusModal(job)} title="Tracking">
                          <Users size={14} />
                        </button>
                        <button 
                          className="card-icon-btn" 
                          onClick={() => setEditingJob(job)} 
                          title="Edit"
                          disabled={job.is_completed}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button className="card-icon-btn delete" onClick={() => handleDeleteJob(job.id)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className={`status-pill ${job.status || 'open'}`}>
                      {job.is_completed ? 'Completed' : (job.status || 'open').charAt(0).toUpperCase() + (job.status || 'open').slice(1)}
                    </div>
                  </div>

                  <div className="redesigned-card-body">
                    <div className="detail-row">
                      <Clock size={14} />
                      <span>{job.date ? new Date(job.date).toLocaleDateString('en-GB') : 'No date'}</span>
                    </div>
                    <div className="detail-row">
                      <Building size={14} />
                      <span>{job.location || job.venue || 'No location set'}</span>
                    </div>

                    <div className="card-category-tag" style={{
                      backgroundColor: getRoleStyle(job.category).bg,
                      color: getRoleStyle(job.category).color
                    }}>
                      <span className="dot" style={{backgroundColor: getRoleStyle(job.category).color}}></span>
                      {job.category}
                    </div>

                    {job.roles && job.roles.length > 0 && (
                      <div className="card-roles-list">
                        {job.roles.map((role, idx) => (
                          <span key={role + idx} className="role-tag-small" style={{
                            borderColor: getRoleStyle(role).color,
                            color: getRoleStyle(role).color,
                            backgroundColor: getRoleStyle(role).bg
                          }}>
                            {role}
                          </span>
                        ))}
                      </div>
                    )}

                    {job.pending_count > 0 && (
                      <div className="request-status-section">
                        <label>REQUEST STATUS</label>
                        <div className="status-indicator-pill pending">
                          {job.pending_count} Photographer{job.pending_count > 1 ? 's' : ''} · Pending
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="redesigned-card-footer">
                    <div className="card-budget">₹{job.budget?.toLocaleString() || '0'}</div>
                    <button 
                      className="btn-send-request-redesigned" 
                      onClick={() => setShowRequestModal(job)}
                      disabled={job.is_completed}
                    >
                      <Send size={14} /> Send Request
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* VIEW: ACCEPTED JOBS / INVITES (PHOTOGRAPHER) */
        <div className="accepted-jobs-section">
          <div className="sub-tabs">
            <button className={`sub-tab-btn ${activeSubTab === 'accepted' ? 'active' : ''}`} onClick={() => setActiveSubTab('accepted')}>
              Accepted Jobs
            </button>

            <button className={`sub-tab-btn ${activeSubTab === 'invites' ? 'active' : ''}`} onClick={() => setActiveSubTab('invites')}>
              Invites {invites.length > 0 && <span className="badge">{invites.length}</span>}
            </button>
            <button className={`sub-tab-btn ${activeSubTab === 'past_assignments' ? 'active' : ''}`} onClick={() => setActiveSubTab('past_assignments')}>
              Past Assignments
            </button>
            <button className={`sub-tab-btn ${activeSubTab === 'declined' ? 'active' : ''}`} onClick={() => setActiveSubTab('declined')}>
              Declined Jobs
            </button>
          </div>


          <div className="job-grid">
            {activeSubTab === 'accepted' ? (
              /* VIEW: ACCEPTED JOBS (Upcoming) */
              acceptedJobs.filter(j => new Date(j.date || j.job_date).getTime() >= new Date().setHours(0,0,0,0)).length === 0 ? (
                <div className="empty-state">No data available yet. Your accepted jobs will appear here.</div>
              ) : (

                acceptedJobs.filter(j => new Date(j.date || j.job_date).getTime() >= new Date().setHours(0,0,0,0)).map(job => (
                  <div key={job.id} className="job-card accepted">
                    <div className="job-card-header">
                      <h3>{job.title || job.job_title}</h3>
                      <span className="role-tag">{job.role}</span>
                    </div>
                    <div className="job-card-body">
                      <p className="owner-link" onClick={() => setShowCollaborationModal(job)}>
                        <User size={14} /> {job.owner_name || job.sender_name}
                      </p>
                      <p><Clock size={14} /> {new Date(job.date || job.job_date).toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>
                ))
              )
            ) : activeSubTab === 'past_assignments' ? (
              /* VIEW: PAST ASSIGNMENTS (History) */
              acceptedJobs.filter(j => new Date(j.date || j.job_date).getTime() < new Date().setHours(0,0,0,0)).length === 0 ? (
                <div className="empty-state">No past assignments found</div>
              ) : (
                acceptedJobs.filter(j => new Date(j.date || j.job_date).getTime() < new Date().setHours(0,0,0,0)).map(job => (
                  <div key={job.id} className="job-card accepted completed-lifecycle">
                    <div className="job-card-header">
                      <h3>{job.title || job.job_title}</h3>
                      <span className="role-tag">{job.role}</span>
                    </div>
                    <div className="job-card-body">
                      <p className="owner-link" onClick={() => setShowCollaborationModal(job)}>
                        <User size={14} /> {job.owner_name || job.sender_name}
                      </p>
                      <p><Clock size={14} /> {new Date(job.date || job.job_date).toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>
                ))
              )
            ) : activeSubTab === 'invites' ? (
              invites.length === 0 ? (
                <div className="empty-state">No pending invites. Your incoming job requests will appear here.</div>
              ) : (

                invites.map(invite => (
                  <div key={invite.id} className="job-card invite">
                    <div className="job-card-header">
                      <h3>{invite.job_title}</h3>
                      <span className="role-tag">{invite.role}</span>
                    </div>
                    <div className="invite-details">
                      <p><strong>From:</strong> {invite.sender_name}</p>
                      <p><strong>Date:</strong> {new Date(invite.job_date).toLocaleDateString('en-GB')}</p>
                      <p><strong>Budget:</strong> ₹{invite.budget}</p>
                    </div>
                    <div className="invite-actions">
                      <button className="btn btn-primary btn-sm" onClick={() => handleRespondToInvite(invite.id, 'accepted')}>
                        <Check size={14} /> Accept
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleRespondToInvite(invite.id, 'declined')}>
                        <X size={14} /> Decline
                      </button>
                    </div>
                  </div>
                ))
              )
            ) : (
              /* VIEW: DECLINED JOBS HISTORY */
              declinedInvites.length === 0 ? (
                <div className="empty-state">No declined jobs</div>
              ) : (
                declinedInvites.map(invite => (
                  <div key={invite.id} className="job-card declined">
                    <div className="job-card-header">
                      <h3>{invite.job_title}</h3>
                      <span className="role-tag">{invite.role}</span>
                    </div>
                    <div className="invite-details">
                      <p><strong>Studio:</strong> {invite.sender_name}</p>
                      <p><strong>Date:</strong> {new Date(invite.job_date).toLocaleDateString('en-GB')}</p>
                      <p><strong>Budget:</strong> ₹{invite.budget}</p>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      )}

      {/* Send Request Modal: Smart matching ecosystem */}
      {showRequestModal && createPortal(
        <SendRequestModal 
          initialJob={showRequestModal} 
          allJobs={myJobs.filter(j => j.status !== 'completed')}
          team={state.team || []}
          onClose={() => setShowRequestModal(null)}
          onSend={async (data) => {
            try {
              await requestService.sendRequest(data);
              addToast('Request sent successfully!', 'success');
              setShowRequestModal(null);
              fetchData();
            } catch (err) {
              addToast('Failed to send request', 'error');
            }
          }}
          onAddTeammate={() => navigate('/team', { state: { openAddModal: true } })}
        />,
        document.body
      )}

      {/* Collaboration Modal: Fetches paginated shared history */}
      {showCollaborationModal && createPortal(
        <CollaborationModal 
          job={showCollaborationModal} 
          onClose={() => setShowCollaborationModal(null)} 
        />,
        document.body
      )}

      {/* Job Status Modal: Shows Accepted, Pending, Declined requests */}
      {showJobStatusModal && createPortal(
        <JobStatusModal 
          job={showJobStatusModal} 
          onClose={() => setShowJobStatusModal(null)} 
          fetchData={fetchData}
        />,
        document.body
      )}

      {/* Job Modal (Redesigned to match mockup) */}
      {(showNewJob || editingJob) && createPortal(
        <div className="modal-overlay ecosystem-overlay" onClick={() => { setShowNewJob(false); setEditingJob(null); }}>
          <div className="modal redesigned-job-modal" onClick={e => e.stopPropagation()}>
            <div className="redesigned-modal-header-info">
              <p className="date-summary-label">Selected Dates (1):</p>
              <p className="date-summary-value">
                {editingJob?.date ? new Date(editingJob.date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}
              </p>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const rolesInput = fd.get('roles_text') || '';
              // Parse roles like "2x Drone, Lead" into ["Drone", "Drone", "Lead"]
              const parsedRoles = [];
              rolesInput.split(',').forEach(part => {
                const trimmed = part.trim();
                if (!trimmed) return;
                
                const match = trimmed.match(/^(\d+)[xX]\s*(.+)$/);
                if (match) {
                  const qty = parseInt(match[1]);
                  const role = match[2].trim();
                  for(let i=0; i<qty; i++) parsedRoles.push(role);
                } else {
                  parsedRoles.push(trimmed);
                }
              });

              const data = {
                title: fd.get('title'),
                client: fd.get('client'),
                venue: fd.get('venue'),
                budget: parseInt(fd.get('budget')) || 0,
                category: fd.get('category'),
                date: fd.get('date'),
                roles: parsedRoles
              };

              if (editingJob) {
                handleUpdateJob(editingJob.id, data);
              } else {
                handleCreateJob(data);
              }
            }} className="mockup-form">
              <div className="mockup-input-group">
                <div className="mockup-field">
                  <label>Job Title *</label>
                  <input 
                    name="title" 
                    className="mockup-input" 
                    placeholder="e.g. Santorini Wedding" 
                    defaultValue={editingJob?.title} 
                    required 
                  />
                </div>

                <div className="mockup-field">
                  <label>Client</label>
                  <input 
                    name="client" 
                    className="mockup-input" 
                    placeholder="Client name" 
                    defaultValue={editingJob?.client} 
                  />
                </div>

                <div className="mockup-field">
                  <label>Venue</label>
                  <input 
                    name="venue" 
                    className="mockup-input" 
                    placeholder="e.g. Villa Rosita" 
                    defaultValue={editingJob?.venue} 
                  />
                </div>

                <div className="mockup-field">
                  <label>Budget (₹)</label>
                  <input 
                    name="budget" 
                    type="number" 
                    className="mockup-input" 
                    placeholder="0" 
                    defaultValue={editingJob?.budget || 0} 
                  />
                </div>

                <div className="mockup-field">
                  <label>Category *</label>
                  <input 
                    name="category" 
                    className="mockup-input" 
                    placeholder="e.g. Luxury Wedding, Cinematic BTS" 
                    defaultValue={editingJob?.category || 'Wedding'}
                    required
                  />
                  <p className="field-hint">Free text category. Does not affect role matching.</p>
                </div>

                <div className="mockup-field">
                  <label>Date</label>
                  <input 
                    name="date" 
                    type="date" 
                    className="mockup-input" 
                    defaultValue={formatDateForInput(editingJob?.date)} 
                    required 
                  />
                </div>

                <div className="mockup-roles-section">
                  <label className="mockup-section-label">Roles & Quantities Required</label>
                  <div className="roles-input-wrapper">
                    <input 
                      name="roles_text"
                      className="mockup-input"
                      placeholder="e.g. 2x Drone, 1x Lead, 3x Candid"
                      defaultValue={editingJob?.roles?.length > 0 ? editingJob.roles.join(', ') : ''}
                    />
                    <p className="field-hint">Comma separated roles with quantities (e.g. 2x Drone, Lead, 3x Candid)</p>
                  </div>
                </div>

              </div>

              <div className="redesigned-modal-actions">
                <button type="button" className="btn-cancel-ghost" onClick={() => { setShowNewJob(false); setEditingJob(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-create-ecosystem">
                  {editingJob ? 'Update Job' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/**
 * COMPONENT: CollaborationModal
 * Connects to: backend/routers/team.py -> /collaborations/{id}
 * Purpose: Displays 'Trust' metrics through shared work history.
 */
/**
 * COMPONENT: SendRequestModal
 * Logic: Matches selected job category with team member specialties.
 */
function SendRequestModal({ initialJob, allJobs, team, onClose, onSend, onAddTeammate }) {
  const [selectedJob, setSelectedJob] = useState(initialJob);
  // Default to first role or job category if no roles
  const [selectedRole, setSelectedRole] = useState(initialJob.roles?.[0] || initialJob.category);
  const [selectedMember, setSelectedMember] = useState(null);
  const [budget, setBudget] = useState(selectedJob.budget || 0);
  const [searchQuery, setSearchQuery] = useState('');

  // No longer filtering by category matching. All teammates are available.
  const filteredTeam = team.filter(m => 
    (m.name || m.display_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="modal-overlay ecosystem-overlay" onClick={onClose}>
      <div className="modal request-modal redesigned-request-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-icon-title">
            <Send size={20} className="header-icon" />
            <h3>Send Job Request</h3>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-body">
          <div className="request-flow-grid">
            {/* Left: Job & Role Selection */}
            <div className="request-config-panel">
              <div className="request-form-group">
                <label>Target Job</label>
                <select 
                  value={selectedJob.id} 
                  onChange={(e) => {
                    const job = allJobs.find(j => j.id === parseInt(e.target.value));
                    setSelectedJob(job);
                    setSelectedRole(job.roles?.[0] || job.category);
                    setBudget(job.budget || 0);
                  }}
                  className="redesigned-input"
                >
                  {allJobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                </select>
              </div>

              <div className="request-form-group">
                <label>Invite For Specific Role</label>
                <select 
                  value={selectedRole} 
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="redesigned-input"
                >
                  {/* Flatten roles to show each unique role required */}
                  {[...new Set(selectedJob.roles?.length > 0 ? selectedJob.roles : [selectedJob.category])].map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <p className="field-hint">Select which role this person will fill.</p>
              </div>

              <div className="request-form-group">
                <label>Offered Budget (₹)</label>
                <div className="budget-input-wrapper">
                  <span className="currency-prefix">₹</span>
                  <input 
                    type="number" 
                    value={budget} 
                    onChange={(e) => setBudget(e.target.value)}
                    className="redesigned-input budget-input"
                  />
                </div>
              </div>
            </div>

            {/* Right: Teammate Selection */}
            <div className="teammate-selection-panel">
              <div className="panel-header">
                <label>Select Teammate</label>
                <div className="search-mini">
                  <Search size={14} />
                  <input 
                    placeholder="Search team..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="teammate-scroll-list">
                {filteredTeam.length === 0 ? (
                  <div className="empty-mini-state">
                    <p>No teammates found.</p>
                    <button className="btn-link" onClick={onAddTeammate}>+ Add New</button>
                  </div>
                ) : (
                  filteredTeam.map(member => (
                    <div 
                      key={member.id} 
                      className={`teammate-item-request ${selectedMember?.id === member.id ? 'active' : ''}`}
                      onClick={() => setSelectedMember(member)}
                    >
                      <Avatar name={member.name || member.display_name} size="sm" />
                      <div className="member-meta">
                        <p className="name">{member.name || member.display_name}</p>
                        <p className="info">
                          {member.category || member.display_category} · {member.city || member.display_city}
                        </p>
                      </div>
                      {selectedMember?.id === member.id && <Check size={16} className="check-icon" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel-ghost" onClick={onClose}>Cancel</button>
          <button 
            className="btn-create-ecosystem" 
            disabled={!selectedMember}
            onClick={() => onSend({
              job_id: selectedJob.id,
              receiver_id: (selectedMember.member_id || selectedMember.id),
              role: selectedRole,
              budget: parseInt(budget)
            })}
          >
            <Send size={14} /> Send Invitation
          </button>
        </div>
      </div>
    </div>
  );
}


function CollaborationModal({ job, onClose }) {
  const [history, setHistory] = useState({ data: [], page: 1, total_pages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await teamService.getCollaborations(job.owner_id, history.page);
        setHistory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [job.owner_id, history.page]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal collaboration-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Collaboration History with {job.owner_name}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div>Loading...</div>
          ) : history.data.length === 0 ? (
            <div className="empty-state">No shared work history yet.</div>
          ) : (
            <>
              <div className="collab-list">
                {history.data.map(item => (
                  <div key={item.job_id} className="collab-item">
                    <div className="collab-info">
                      <p className="collab-title">{item.title}</p>
                      <p className="collab-date">{new Date(item.date).toLocaleDateString('en-GB')}</p>
                    </div>
                    <span className="collab-role">{item.role}</span>
                  </div>
                ))}
              </div>
              {/* Pagination Impact: Changing history.page triggers a new API call */}
              <div className="modal-pagination">
                <button 
                  disabled={history.page === 1} 
                  onClick={() => setHistory(h => ({ ...h, page: h.page - 1 }))}
                >
                  &lt;
                </button>
                <span>Page {history.page} of {history.total_pages}</span>
                <button 
                  disabled={history.page === history.total_pages} 
                  onClick={() => setHistory(h => ({ ...h, page: h.page + 1 }))}
                >
                  &gt;
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
// --- SUB-COMPONENT: JOB STATUS MODAL ---
function JobStatusModal({ job, onClose, fetchData }) {
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('accepted');
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const data = await requestService.getRequestsByJob(job.id);
      setRequests(data);
    } catch (err) {
      console.error('Error fetching job requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [job.id]);

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      await requestService.cancelRequest(requestId);
      // Local refresh
      fetchRequests();
      // Global refresh for JobHub counts
      fetchData(); 
    } catch (err) {
      console.error('Error cancelling request:', err);
    }
  };

  const filteredRequests = requests.filter(r => r.status === activeTab);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal status-tracking-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <Users size={20} color="var(--accent-purple)" />
            <h2>Request Status: {job.title}</h2>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="status-tabs">
          {[
            { id: 'accepted', label: 'Accepted', color: '#10B981' },
            { id: 'pending', label: 'Pending', color: '#F59E0B' },
            { id: 'declined', label: 'Declined', color: '#F43F5E' }
          ].map(tab => (
            <button 
              key={tab.id}
              className={`status-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ '--tab-color': tab.color }}
            >
              {tab.label}
              <span className="tab-count">{requests.filter(r => r.status === tab.id).length}</span>
            </button>
          ))}
        </div>

        <div className="modal-content">
          {isLoading ? (
            <div className="loading-state">Loading status...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="empty-state">No {activeTab} requests for this job.</div>
          ) : (
            <div className="status-list">
              {filteredRequests.map(req => (
                <div key={req.id} className="status-item">
                  <div className="status-item-left">
                    <Avatar name={req.receiver_name} size="sm" />
                    <div>
                      <div className="photographer-name">{req.receiver_name}</div>
                      <div className="photographer-role">Role: {req.role}</div>
                    </div>
                  </div>
                  <div className="status-item-right" style={{display:'flex', alignItems:'center', gap:10}}>
                    {activeTab === 'pending' && (
                      <button 
                        className="btn btn-ghost btn-sm" 
                        onClick={() => handleCancelRequest(req.id)}
                        style={{color:'var(--accent-rose)', fontSize:12}}
                      >
                        Cancel
                      </button>
                    )}
                    <div className={`status-pill-small ${req.status}`}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
