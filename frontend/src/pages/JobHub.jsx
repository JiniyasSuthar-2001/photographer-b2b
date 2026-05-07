import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, Plus, User, Check, X, MapPin } from 'lucide-react';
import { useApp, usePermission } from '../context/AppContext';
import { jobService, requestService, teamService } from '../services/api';
import { StatusBadge } from '../components/ui/Badge';
import './JobHub.css';

export default function JobHub() {
  const { state, dispatch, addToast } = useApp();
  const { canPostJob } = usePermission();
  const [searchParams, setSearchParams] = useSearchParams();

  // Deep-link contract used by Dashboard cards + Notification redirects.
  const [activeSubTab, setActiveSubTab] = useState(searchParams.get('tab') || 'accepted');
  const [jobFilter, setJobFilter] = useState('all');

  const [myJobs, setMyJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewJob, setShowNewJob] = useState(false);
  const [showCollaborationModal, setShowCollaborationModal] = useState(null);

  const activeMainTab = state.activeMainTab || searchParams.get('main') || 'my-jobs';

  useEffect(() => {
    const main = searchParams.get('main');
    const tab = searchParams.get('tab');
    if (main) dispatch({ type: 'SET_ACTIVE_MAIN_TAB', payload: main });
    if (tab) setActiveSubTab(tab);
  }, [dispatch, searchParams]);

  const syncHubQuery = (main, tab) => {
    const next = new URLSearchParams(searchParams);
    next.set('main', main);
    if (tab) next.set('tab', tab);
    else next.delete('tab');
    setSearchParams(next, { replace: true });
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeMainTab === 'my-jobs') {
        const data = await jobService.getJobs();
        setMyJobs(data);
        dispatch({ type: 'SET_LATEST_JOBS', payload: data.slice(0, 4) });
      } else if (activeSubTab === 'accepted') {
        const data = await requestService.getAcceptedJobs();
        dispatch({ type: 'SET_ACCEPTED_JOBS', payload: data });
      } else {
        const data = await requestService.getInvites();
        dispatch({ type: 'SET_INVITES', payload: data });
      }
    } catch {
      addToast('Failed to load Job Hub data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [activeMainTab, activeSubTab, addToast, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateJob = async (jobData) => {
    try {
      await jobService.createJob(jobData);
      addToast('Job created successfully', 'success');
      setShowNewJob(false);
      fetchData();
    } catch {
      addToast('Failed to create job', 'error');
    }
  };

  const handleRespondToInvite = async (id, status) => {
    try {
      await requestService.respondToRequest(id, status);
      addToast(`Invite ${status}`, 'success');
      fetchData();
    } catch {
      addToast('Error responding to invite', 'error');
    }
  };

  const filterMyJobs = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return myJobs.filter(job => {
      const jobDate = new Date(job.date);
      jobDate.setHours(0, 0, 0, 0);
      switch (jobFilter) {
        case 'current': return jobDate.getTime() === today.getTime() && job.status !== 'completed';
        case 'future': return jobDate.getTime() > today.getTime();
        case 'past': return jobDate.getTime() < today.getTime() || job.status === 'completed';
        default: return true;
      }
    });
  }, [jobFilter, myJobs]);

  return (
    <div className="jobhub-page">
      <div className="jobhub-header">
        <div>
          <h1 className="page-title">Job Hub</h1>
          <p className="page-subtitle">Connected job pipeline across owner jobs and freelancer assignments</p>
        </div>
        {canPostJob && (
          <button className="btn btn-primary" onClick={() => setShowNewJob(true)}>
            <Plus size={18} /> Post New Job
          </button>
        )}
      </div>

      <div className="job-hub-toggles">
        <button
          className={`toggle-btn ${activeMainTab === 'my-jobs' ? 'active' : ''}`}
          onClick={() => {
            dispatch({ type: 'SET_ACTIVE_MAIN_TAB', payload: 'my-jobs' });
            syncHubQuery('my-jobs');
          }}
        >
          My Jobs
        </button>
        <button
          className={`toggle-btn ${activeMainTab === 'accepted-jobs' ? 'active' : ''}`}
          onClick={() => {
            dispatch({ type: 'SET_ACTIVE_MAIN_TAB', payload: 'accepted-jobs' });
            syncHubQuery('accepted-jobs', activeSubTab);
          }}
        >
          Accepted Jobs
        </button>
      </div>

      {activeMainTab === 'my-jobs' ? (
        <div className="my-jobs-section">
          <div className="sub-tabs">
            {[
              { id: 'all', label: 'All' },
              { id: 'current', label: 'Current' },
              { id: 'future', label: 'Future' },
              { id: 'past', label: 'Past' },
            ].map(t => (
              <button key={t.id} className={`sub-tab ${jobFilter === t.id ? 'active' : ''}`} onClick={() => setJobFilter(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="job-grid">
            {isLoading ? <div className="loading-state">Loading jobs...</div> : filterMyJobs.length === 0 ? (
              <div className="empty-state">No jobs found</div>
            ) : filterMyJobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-card-header">
                  <h3>{job.title}</h3>
                  <StatusBadge status={job.status} />
                </div>
                <div className="job-card-body">
                  <p><Clock size={14} /> {new Date(job.date).toLocaleDateString('en-GB')}</p>
                  <p><MapPin size={14} /> {job.location || 'Location pending'}</p>
                  <div className="job-counts">
                    {job.pending_count > 0 && <span className="count-badge pending">{job.pending_count} Pending</span>}
                    {job.accepted_count > 0 && <span className="count-badge accepted">{job.accepted_count} Accepted</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="accepted-jobs-section">
          <div className="sub-tabs">
            <button className={`sub-tab ${activeSubTab === 'accepted' ? 'active' : ''}`} onClick={() => { setActiveSubTab('accepted'); syncHubQuery('accepted-jobs', 'accepted'); }}>
              Accepted Jobs
            </button>
            <button className={`sub-tab ${activeSubTab === 'invites' ? 'active' : ''}`} onClick={() => { setActiveSubTab('invites'); syncHubQuery('accepted-jobs', 'invites'); }}>
              Invites {state.invites.length > 0 && <span className="badge">{state.invites.length}</span>}
            </button>
          </div>

          <div className="job-grid">
            {activeSubTab === 'accepted' ? (
              state.acceptedJobs.length === 0 ? (
                <div className="empty-state">No accepted jobs yet</div>
              ) : (
                state.acceptedJobs.map(job => (
                  <div key={job.id} className="job-card accepted">
                    <div className="job-card-header">
                      <h3>{job.title}</h3>
                      <span className="role-tag">{job.role}</span>
                    </div>
                    <div className="job-card-body">
                      <p className="owner-link" onClick={() => setShowCollaborationModal(job)}>
                        <User size={14} /> {job.owner_name}
                      </p>
                      <p><Clock size={14} /> {new Date(job.date).toLocaleDateString('en-GB')}</p>
                      <p><MapPin size={14} /> {job.location || 'Location pending'}</p>
                    </div>
                  </div>
                ))
              )
            ) : state.invites.length === 0 ? (
              <div className="empty-state">No pending invites</div>
            ) : (
              state.invites.map(invite => (
                <div key={invite.id} className="job-card invite">
                  <div className="job-card-header">
                    <h3>{invite.job_title}</h3>
                    <span className="role-tag">{invite.role}</span>
                  </div>
                  <div className="invite-details">
                    <p><strong>From:</strong> {invite.sender_name}</p>
                    <p><strong>Date:</strong> {new Date(invite.job_date).toLocaleDateString('en-GB')}</p>
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
            )}
          </div>
        </div>
      )}

      {showCollaborationModal && (
        <CollaborationModal job={showCollaborationModal} onClose={() => setShowCollaborationModal(null)} />
      )}

      {showNewJob && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Post New Job</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              handleCreateJob({
                title: fd.get('title'),
                category: fd.get('category'),
                date: fd.get('date'),
              });
            }}>
              <input name="title" className="input-field" placeholder="Job Title" required />
              <input name="category" className="input-field" placeholder="Category (e.g. Wedding)" required />
              <input name="date" type="date" className="input-field" required />
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewJob(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Job</button>
              </div>
            </form>
          </div>
        </div>
      )}
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
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [history.page, job.owner_id]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal collaboration-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Collaboration History with {job.owner_name}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          {loading ? <div>Loading...</div> : history.data.length === 0 ? (
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
              <div className="modal-pagination">
                <button disabled={history.page === 1} onClick={() => setHistory(h => ({ ...h, page: h.page - 1 }))}>&lt;</button>
                <span>Page {history.page} of {history.total_pages}</span>
                <button disabled={history.page === history.total_pages} onClick={() => setHistory(h => ({ ...h, page: h.page + 1 }))}>&gt;</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
