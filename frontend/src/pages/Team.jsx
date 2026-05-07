import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Search, ChevronLeft, ChevronRight, UserPlus, Clock, Send, Edit2, Trash2 } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Modal from '../components/ui/Modal';
import JobSelectionModal from '../components/team/JobSelectionModal';
import axios from 'axios';
import './Team.css';

const API_BASE_URL = 'http://localhost:8000/api';

export default function Team() {
  const { state, addToast } = useApp();
  const { team } = state;
  const [searchParams] = useSearchParams();
  
  // Collaboration History State
  const [selectedPhotographer, setSelectedPhotographer] = useState(null);
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Add Teammate State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', category: 'Wedding', city: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Teammate State
  const [showEditModal, setShowEditModal] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', category: '', city: '' });
  
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

  useEffect(() => {
    // Cross-page dependency:
    // Analytics row click deep-links here with memberId + openHistory query params.
    const memberId = Number(searchParams.get('memberId'));
    const shouldOpen = searchParams.get('openHistory') === '1';
    if (!shouldOpen || !memberId || teamMembers.length === 0) return;
    const member = teamMembers.find(item => Number(item.id) === memberId);
    if (member) {
      setSelectedPhotographer(member);
      setPage(1);
    }
  }, [searchParams, teamMembers]);

  const handleNameClick = (member) => {
    setSelectedPhotographer(member);
    setPage(1);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!addForm.phone || !addForm.name) return;
    setIsSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/team/request`, 
        { 
          phone: addForm.phone,
          display_name: addForm.name,
          display_category: addForm.category,
          display_city: addForm.city
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      addToast('Team request sent successfully');
      setShowAddModal(false);
      setAddForm({ name: '', category: 'Wedding', city: '', phone: '' });
      fetchTeam();
    } catch (error) {
      addToast(error.response?.data?.detail || 'Failed to send request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`${API_BASE_URL}/team/${memberToEdit.id}`, 
        { 
          display_name: editForm.name,
          display_category: editForm.category,
          display_city: editForm.city
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      addToast('Member info updated');
      setShowEditModal(false);
      fetchTeam();
    } catch (error) {
      addToast('Update failed', 'error');
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/team/${memberId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      addToast('Member removed');
      fetchTeam();
    } catch (error) {
      addToast('Delete failed', 'error');
    }
  };

  const openEditModal = (member) => {
    setMemberToEdit(member);
    setEditForm({ name: member.name, category: member.category, city: member.city });
    setShowEditModal(true);
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
            {teamMembers.map(m => (
              <tr key={m.id}>
                <td>
                  <div className="team-member-name-cell" onClick={() => handleNameClick(m)} style={{cursor:'pointer'}}>
                    <Avatar name={m.name} size="sm" />
                    <span className="member-name-link">{m.name}</span>
                  </div>
                </td>
                <td>{m.jobsCompleted}</td>
                <td>
                  <div className="team-category-cell">
                    <span className="category-pill">{m.category}</span>
                  </div>
                </td>
                <td>{m.city}</td>
                <td>{m.phone}</td>
                <td>
                  <div className="team-action-cell">
                    <button className="btn btn-ghost btn-sm" title="Invite to Job" onClick={() => {
                      setMemberToInvite(m);
                      setIsInviteModalOpen(true);
                    }}>
                      <Send size={16} />
                    </button>
                    <button className="btn btn-ghost btn-sm" title="Edit Info" onClick={() => openEditModal(m)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-ghost btn-sm" title="View History" onClick={() => handleNameClick(m)}>
                      <Clock size={16} />
                    </button>
                    <button className="btn btn-danger btn-sm" title="Remove Member" onClick={() => handleDeleteMember(m.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {teamMembers.length === 0 && (
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
        onClose={() => setShowAddModal(false)}
        title="Add New Teammate"
        size="md"
      >
        <form onSubmit={handleAddMember} className="add-teammate-form">
          <p className="modal-desc">Enter photographer details to send a team invitation. They will be identified by this info on your side.</p>
          
          <div className="form-group">
            <label>Photographer Name</label>
            <input 
              type="text" 
              className="input-field" 
              required
              value={addForm.name}
              onChange={(e) => setAddForm({...addForm, name: e.target.value})}
              placeholder="e.g. Marcus Chen"
            />
          </div>

          <div className="form-group">
            <label>Phone Number (Unique ID)</label>
            <input 
              type="text" 
              className="input-field" 
              required
              value={addForm.phone}
              onChange={(e) => setAddForm({...addForm, phone: e.target.value})}
              placeholder="e.g. 9876543210"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select 
                className="input-field"
                value={addForm.category}
                onChange={(e) => setAddForm({...addForm, category: e.target.value})}
              >
                <option value="Wedding">Wedding</option>
                <option value="Portrait">Portrait</option>
                <option value="Event">Event</option>
                <option value="Fashion">Fashion</option>
                <option value="General">General</option>
              </select>
            </div>
            <div className="form-group">
              <label>City</label>
              <input 
                type="text" 
                className="input-field"
                value={addForm.city}
                onChange={(e) => setAddForm({...addForm, city: e.target.value})}
                placeholder="e.g. Mumbai"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Teammate Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Photographer Info"
        size="md"
      >
        <form onSubmit={handleUpdateMember} className="add-teammate-form">
          <p className="modal-desc">Update how this photographer appears in your team. Phone number cannot be changed.</p>
          
          <div className="form-group">
            <label>Photographer Name</label>
            <input 
              type="text" 
              className="input-field" 
              required
              value={editForm.name}
              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select 
                className="input-field"
                value={editForm.category}
                onChange={(e) => setEditForm({...editForm, category: e.target.value})}
              >
                <option value="Wedding">Wedding</option>
                <option value="Portrait">Portrait</option>
                <option value="Event">Event</option>
                <option value="Fashion">Fashion</option>
                <option value="General">General</option>
              </select>
            </div>
            <div className="form-group">
              <label>City</label>
              <input 
                type="text" 
                className="input-field"
                value={editForm.city}
                onChange={(e) => setEditForm({...editForm, city: e.target.value})}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowEditModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
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
