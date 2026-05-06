import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, ChevronLeft, ChevronRight, UserPlus, Clock, Send } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Modal from '../components/ui/Modal';
import JobSelectionModal from '../components/team/JobSelectionModal';
import axios from 'axios';
import './Team.css';

const API_BASE_URL = 'http://localhost:8000/api';

export default function Team() {
  const { state, addToast } = useApp();
  const { team } = state;
  
  // Collaboration History State
  const [selectedPhotographer, setSelectedPhotographer] = useState(null);
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Add Teammate State
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null); // 'pending', 'sent'
  
  // Job Selection Modal State
  const [teamMembers, setTeamMembers] = useState([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [memberToInvite, setMemberToInvite] = useState(null);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);

  // Fetch Collaboration History
  const fetchHistory = async (memberId, currentPage) => {
    setIsLoadingHistory(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/team/collaborations/${memberId}`, {
        params: { page: currentPage, limit: 10 },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setHistory(response.data.data);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Error fetching history:', error);
      addToast('Failed to fetch collaboration history', 'error');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (selectedPhotographer) {
      fetchHistory(selectedPhotographer.id, page);
    }
  }, [selectedPhotographer, page]);

  const fetchTeam = async () => {
    setIsLoadingTeam(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/team/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Error fetching team:', error);
      // Fallback to mock data if backend fails or is empty for demo
      setTeamMembers(team); 
    } finally {
      setIsLoadingTeam(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleNameClick = (member) => {
    setSelectedPhotographer(member);
    setPage(1);
  };

  const handleSearch = async () => {
    if (!searchPhone) return;
    setIsSearching(true);
    setSearchResult(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/team/users/search`, {
        params: { phone: searchPhone }
      });
      setSearchResult(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        addToast('User not found', 'error');
      } else {
        addToast('Search failed', 'error');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const sendRequest = async () => {
    if (!searchResult) return;
    try {
      await axios.post(`${API_BASE_URL}/team/request`, 
        { receiver_id: searchResult.id },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setRequestStatus('sent');
      addToast('Team request sent successfully');
    } catch (error) {
      addToast(error.response?.data?.detail || 'Failed to send request', 'error');
    }
  };

  return (
    <div className="team-page">
      <div className="team-header">
        <div>
          <h1 className="page-title" style={{margin:0}}>My Team</h1>
          <div style={{fontSize:13,color:'var(--text-muted)',marginTop:3}}>Manage your connected photographers and team members</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} style={{marginRight: 8}} /> Add Teammate
        </button>
      </div>

      <div className="team-table-container">
        <table className="team-table">
          <thead>
            <tr>
              <th>Photographer Name</th>
              <th>Jobs Done Together</th>
              <th>Category</th>
              <th>City</th>
              <th>Phone Number</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {team.map(m => (
              <tr key={m.id}>
                <td>
                  <div className="team-member-name-cell" onClick={() => handleNameClick(m)} style={{cursor:'pointer'}}>
                    <Avatar name={m.name} size="sm" showStatus status={m.status} />
                    <span className="member-name-link">{m.name}</span>
                  </div>
                </td>
                <td>{m.jobsCompleted}</td>
                <td>
                  <div className="team-category-cell">
                    {(m.specialties || []).map(s => (
                      <span key={s} className="category-pill">{s}</span>
                    ))}
                  </div>
                </td>
                <td>{m.city || 'Ahmedabad'}</td>
                <td>{m.phone || '+91 9876543210'}</td>
                <td>
                  <div className="team-action-cell">
                    <button className="btn btn-ghost btn-sm" title="Invite to Job" onClick={() => {
                      setMemberToInvite(m);
                      setIsInviteModalOpen(true);
                    }}>
                      <Send size={16} />
                    </button>
                    <button className="btn btn-ghost btn-sm" title="View History" onClick={() => handleNameClick(m)}>
                      <Clock size={16} />
                    </button>
                    <button className="btn btn-danger btn-sm" title="Remove Member"><UserPlus size={16} style={{transform:'rotate(45deg)'}} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {team.length === 0 && (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)'}}>
                  No team members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Collaboration History Modal */}
      <Modal 
        isOpen={!!selectedPhotographer} 
        onClose={() => setSelectedPhotographer(null)}
        title={`Collaboration History - ${selectedPhotographer?.name}`}
        size="lg"
      >
        <div className="history-modal-content">
          {isLoadingHistory ? (
            <div className="loading-state">Loading history...</div>
          ) : history.length > 0 ? (
            <>
              <div className="history-list">
                {history.map(job => (
                  <div key={job.job_id} className="history-item">
                    <div className="history-info">
                      <div className="history-date">{new Date(job.date).toLocaleDateString()}</div>
                      <div className="history-title">{job.title}</div>
                    </div>
                    <div className="history-meta">
                      <span className="history-role">{job.role}</span>
                      {job.status && <span className={`status-pill ${job.status}`}>{job.status}</span>}
                    </div>
                  </div>
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-btn" 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="page-info">Page {page} of {totalPages}</span>
                  <button 
                    className="pagination-btn" 
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">No shared jobs found yet.</div>
          )}
        </div>
      </Modal>

      {/* Add Teammate Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSearchResult(null);
          setSearchPhone('');
          setRequestStatus(null);
        }}
        title="Add New Teammate"
        size="md"
      >
        <div className="add-teammate-content">
          <p className="modal-desc">Search for photographers by their phone number to invite them to your team.</p>
          
          <div className="search-box">
            <input 
              type="text" 
              className="input-field" 
              placeholder="Enter phone number (e.g. 9876543210)"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleSearch} disabled={isSearching}>
              <Search size={18} />
            </button>
          </div>

          {isSearching && <div className="loading-state">Searching...</div>}

          {searchResult && (
            <div className="search-result-card">
              <div className="result-header">
                <Avatar name={searchResult.full_name} size="md" />
                <div className="result-info">
                  <div className="result-name">{searchResult.full_name}</div>
                  <div className="result-location">{searchResult.city || 'Location not set'}</div>
                </div>
              </div>
              <div className="result-category">
                <span className="category-pill">{searchResult.category || 'Freelancer'}</span>
              </div>
              <div className="result-actions">
                {requestStatus === 'sent' ? (
                  <button className="btn btn-secondary w-full" disabled>Request Sent</button>
                ) : (
                  <button className="btn btn-primary w-full" onClick={sendRequest}>
                    <Send size={16} style={{marginRight:8}} /> Send Request
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      <JobSelectionModal 
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        photographer={memberToInvite}
        onSelect={() => {
          addToast('Job request sent successfully!');
          setIsInviteModalOpen(false);
        }}
      />
    </div>
  );
}
