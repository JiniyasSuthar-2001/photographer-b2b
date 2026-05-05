import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Trash2, Send } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import './Team.css';

export default function Team() {
  const { state } = useApp();
  const { team } = state;
  const [showRequestModal, setShowRequestModal] = useState(null); // Member ID

  return (
    <div className="team-page">
      <div className="team-header">
        <div>
          <h1 className="page-title" style={{margin:0}}>My Team</h1>
          <div style={{fontSize:13,color:'var(--text-muted)',marginTop:3}}>Manage your connected photographers and team members</div>
        </div>
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
                  <div className="team-member-name-cell">
                    <Avatar name={m.name} size="sm" showStatus status={m.status} />
                    <span>{m.name}</span>
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
                    <button className="btn btn-primary btn-sm" onClick={() => setShowRequestModal(m)}>
                      <Send size={12} style={{marginRight: 4}} /> Request
                    </button>
                    <button className="btn btn-danger btn-sm"><Trash2 size={12} /></button>
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

      {showRequestModal && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Send Direct Request</div>
              <button className="modal-close" onClick={() => setShowRequestModal(null)}>×</button>
            </div>
            <div className="modal-body" style={{padding: 'var(--space-4)'}}>
              <p>Send a direct job request to <strong>{showRequestModal.name}</strong>.</p>
              <div style={{marginTop: 'var(--space-4)'}}>
                <label style={{display:'block', fontSize:12, fontWeight:600, marginBottom:4}}>Select Job</label>
                <select className="input-field">
                  <option>— Choose an open job —</option>
                  {state.jobs.filter(j => j.status === 'open').map(j => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowRequestModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                // Mock send request
                setShowRequestModal(null);
              }}>Send Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
