import { useState, useEffect } from 'react';
import { useApp, usePermission } from '../context/AppContext';
import { 
  Briefcase, MapPin, Clock, Users, Plus, Send, Check, X, 
  ChevronRight, Tag, Building, Search, User
} from 'lucide-react';
import { jobService, requestService, teamService } from '../services/api';
import Avatar from '../components/ui/Avatar';
import { StatusBadge } from '../components/ui/Badge';
import DatePicker from '../components/ui/DatePicker';
import './JobHub.css';

const ROLE_TYPES = {
  'Lead': { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', label: 'Lead' },
  'Candid': { color: '#10B981', bg: 'rgba(16,185,129,0.1)', label: 'Candid' },
  'Drone': { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', label: 'Drone' },
  'Reel': { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: 'Reel' },
};

export default function JobHub() {
  const { state, dispatch, addToast } = useApp();
  const { user } = state;
  const { canPostJob } = usePermission();

  const [activeMainTab, setActiveMainTab] = useState('my-jobs'); // 'my-jobs' | 'accepted-jobs'
  const [activeSubTab, setActiveSubTab] = useState('accepted'); // 'accepted' | 'invites' (for accepted-jobs)
  const [jobFilter, setJobFilter] = useState('all'); // 'all' | 'current' | 'yet_to_assign' | 'past'

  const [myJobs, setMyJobs] = useState([]);
  const [acceptedJobs, setAcceptedJobs] = useState([]);
  const [invites, setInvites] = useState([]);
  const [declinedInvites, setDeclinedInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [showNewJob, setShowNewJob] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(null);
  const [showCollaborationModal, setShowCollaborationModal] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeMainTab, activeSubTab, jobFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeMainTab === 'my-jobs') {
        const data = await jobService.getJobs();
        setMyJobs(data);
      } else {
        if (activeSubTab === 'accepted') {
          const data = await requestService.getAcceptedJobs();
          setAcceptedJobs(data);
        } else if (activeSubTab === 'invites') {
          const data = await requestService.getInvites();
          setInvites(data);
        } else {
          const data = await requestService.getDeclinedInvites();
          setDeclinedInvites(data);
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
      addToast('Failed to load data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateJob = async (jobData) => {
    try {
      await jobService.createJob(jobData);
      addToast('Job created successfully', 'success');
      setShowNewJob(false);
      fetchData();
    } catch (err) {
      addToast('Failed to create job', 'error');
    }
  };

  const handleRespondToInvite = async (id, status) => {
    try {
      await requestService.respondToRequest(id, status);
      addToast(`Invite ${status}`, 'success');
      fetchData();
    } catch (err) {
      addToast('Error responding to invite', 'error');
    }
  };

  const filterMyJobs = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return myJobs.filter(job => {
      const jobDate = new Date(job.date);
      jobDate.setHours(0, 0, 0, 0);

      switch (jobFilter) {
        case 'current': 
          return job.accepted_count > 0 && jobDate.getTime() === today.getTime();
        case 'yet_to_assign': 
          return job.accepted_count === 0 && job.status !== 'completed';
        case 'past': 
          return job.status === 'completed' || jobDate.getTime() < today.getTime();
        default: 
          return true;
      }
    });
  };

  return (
    <div className="jobhub-page">
      <div className="jobhub-header">
        <div>
          <h1 className="page-title">Job Hub</h1>
          <p className="page-subtitle">Manage assignments and invitations</p>
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
              <div className="empty-state">No jobs found</div>
            ) : (
              filterMyJobs().map(job => (
                <div key={job.id} className="job-card">
                  <div className="job-card-header">
                    <h3>{job.title}</h3>
                    <StatusBadge status={job.status} />
                  </div>
                  <div className="job-card-body">
                    <p><Clock size={14} /> {new Date(job.date).toLocaleDateString('en-GB')}</p>
                    <p><Tag size={14} /> {job.category}</p>
                    <div className="job-counts">
                      {job.pending_count > 0 && <span className="count-badge pending">{job.pending_count} Pending</span>}
                      {job.accepted_count > 0 && <span className="count-badge accepted">{job.accepted_count} Accepted</span>}
                    </div>
                  </div>
                  <div className="job-card-footer">
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowRequestModal(job)}>
                      <Send size={14} /> Send Request
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="accepted-jobs-section">
          <div className="sub-tabs">
            <button 
              className={`sub-tab ${activeSubTab === 'accepted' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('accepted')}
            >
              Accepted Jobs
            </button>
            <button 
              className={`sub-tab ${activeSubTab === 'invites' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('invites')}
            >
              Invites {invites.length > 0 && <span className="badge">{invites.length}</span>}
            </button>
            <button 
              className={`sub-tab ${activeSubTab === 'declined' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('declined')}
            >
              Declined Jobs
            </button>
          </div>

          <div className="job-grid">
            {activeSubTab === 'accepted' ? (
              acceptedJobs.length === 0 ? (
                <div className="empty-state">No accepted jobs yet</div>
              ) : (
                acceptedJobs.map(job => (
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
                    </div>
                  </div>
                ))
              )
            ) : activeSubTab === 'invites' ? (
              invites.length === 0 ? (
                <div className="empty-state">No pending invites</div>
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

      {/* Collaboration Modal */}
      {showCollaborationModal && (
        <CollaborationModal 
          job={showCollaborationModal} 
          onClose={() => setShowCollaborationModal(null)} 
        />
      )}

      {/* New Job Modal (Simplified) */}
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
                date: fd.get('date')
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
