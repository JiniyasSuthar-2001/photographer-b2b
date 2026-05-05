import { useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import {
  DollarSign, Briefcase, Eye, Calendar,
  ArrowRight, MapPin, Clock, Check, X,
  Bell, AlertCircle, Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/ui/StatCard';
import { ROLE_TYPES } from '../data/mockData';
import './Dashboard.css';

const REQUEST_STATUS_STYLES = {
  pending:  { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  label: 'Pending'  },
  accepted: { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  label: 'Accepted' },
  declined: { color: '#F43F5E', bg: 'rgba(244,63,94,0.1)',   label: 'Declined' },
};

export default function Dashboard() {
  const { state, dispatch, addToast } = useApp();
  const { jobs, jobRequests, analytics } = state;
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'jobs'
  const [acceptingId, setAcceptingId] = useState(null);
  const [paymentInput, setPaymentInput] = useState('');

  const incomingRequests = jobRequests.filter(r => r.status === 'pending');
  // For 'My Jobs', we include accepted requests and jobs assigned directly.
  const myAssignments = jobRequests.filter(r => r.status === 'accepted');
  const earnings = analytics.freelancerEarnings.at(-1)?.amount || 0;

  const today = new Date();
  const isSunday = today.getDay() === 0;

  // Next week's jobs mock logic
  const nextWeekJobs = myAssignments.slice(0, 3); // Mocking 3 jobs for next week

  const handleAccept = (req) => {
    if (acceptingId === req.id) {
      dispatch({ type: 'RESPOND_JOB_REQUEST', payload: { id: req.id, status: 'accepted', payment: parseFloat(paymentInput) || req.budget } });
      addToast(`✅ Accepted: ${req.jobTitle}`, 'success');
      setAcceptingId(null); setPaymentInput('');
    } else {
      setAcceptingId(req.id); setPaymentInput(String(req.budget));
    }
  };

  const handleDecline = (req) => {
    dispatch({ type: 'RESPOND_JOB_REQUEST', payload: { id: req.id, status: 'declined' } });
    addToast(`Declined: ${req.jobTitle}`, 'info');
    if (acceptingId === req.id) { setAcceptingId(null); setPaymentInput(''); }
  };

  return (
    <div className="dashboard">
      {isSunday && nextWeekJobs.length > 0 && (
        <div className="alert-banner" style={{background: 'var(--accent-blue)', color: '#fff', padding: '12px 16px', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8}}>
          <Bell size={18} />
          <span><strong>Sunday Update:</strong> You have {nextWeekJobs.length} jobs scheduled for next week! Check your Next Week Work panel.</span>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid-3">
        <StatCard label="Pending Requests"   value={incomingRequests.length} icon={<Bell size={18} style={{color:'#F43F5E'}}/>}    iconBg="rgba(244,63,94,0.1)"/>
        <StatCard label="Active Assignments" value={myAssignments.length}    icon={<Briefcase size={18} style={{color:'#3B82F6'}}/>} iconBg="rgba(59,130,246,0.1)"/>
        <StatCard label="Earnings This Month" value={`₹${earnings.toLocaleString()}`} change="11.5%" changeDir="up" icon={<DollarSign size={18} style={{color:'#10B981'}}/>} iconBg="rgba(16,185,129,0.1)"/>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="dashboard-left">
          
          {/* Toggles Panel */}
          <div className="card card-padding" style={{ paddingBottom: 0 }}>
            <div style={{display: 'flex', gap: 16, borderBottom: '1px solid var(--border)'}}>
              <button 
                className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('requests')}
                style={{padding: '12px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'requests' ? '2px solid var(--accent-blue)' : '2px solid transparent', color: activeTab === 'requests' ? 'var(--accent-blue)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', fontSize: 14}}
              >
                My Requests {incomingRequests.length > 0 && <span className="badge badge-rose" style={{marginLeft: 8}}>{incomingRequests.length}</span>}
              </button>
              <button 
                className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
                onClick={() => setActiveTab('jobs')}
                style={{padding: '12px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'jobs' ? '2px solid var(--accent-blue)' : '2px solid transparent', color: activeTab === 'jobs' ? 'var(--accent-blue)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', fontSize: 14}}
              >
                My Jobs
              </button>
            </div>
          </div>

          {activeTab === 'requests' ? (
            <div className="incoming-requests-grid" style={{marginTop: 16}}>
              {incomingRequests.length === 0 ? (
                <div className="empty-state" style={{padding:'var(--space-8) 0'}}>
                  <div className="empty-state-icon"><Bell size={22} style={{color:'var(--text-muted)'}}/></div>
                  <div className="empty-state-title">No pending requests</div>
                </div>
              ) : incomingRequests.map(req=>(
                <div key={req.id} className="incoming-req-card" style={{background: 'var(--surface)', borderRadius: 8, padding: 16, border: '1px solid var(--border)'}}>
                  <div className="incoming-req-top" style={{display: 'flex', justifyContent: 'space-between', marginBottom: 12}}>
                    <div>
                      <div className="incoming-req-title" style={{fontWeight: 600, fontSize: 15}}>{req.jobTitle}</div>
                      <div className="incoming-req-from" style={{fontSize: 12.5, color: 'var(--text-secondary)'}}>From {req.sentBy}</div>
                    </div>
                    <div className="incoming-req-budget" style={{fontWeight: 700, color: 'var(--accent-green)'}}>₹{req.budget.toLocaleString()}</div>
                  </div>
                  <div className="incoming-req-meta" style={{display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)', marginBottom: 16}}>
                    <span style={{display: 'flex', alignItems: 'center', gap: 4}}><MapPin size={12}/> {req.venue}</span>
                    <span style={{display: 'flex', alignItems: 'center', gap: 4}}><Clock size={12}/> {req.date}</span>
                    <span className="role-dot-pill" style={{background:ROLE_TYPES[req.role]?.bg,color:ROLE_TYPES[req.role]?.color, padding: '2px 8px', borderRadius: 12}}>
                      {req.role}
                    </span>
                  </div>
                  {req.notes && <div className="incoming-req-notes" style={{fontSize: 13, fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: 16}}>{req.notes}</div>}

                  {acceptingId === req.id ? (
                    <div className="incoming-req-payment">
                      <div style={{fontSize:12.5,fontWeight:600,color:'var(--text-secondary)',marginBottom:6}}>
                        Enter your payment amount (optional):
                      </div>
                      <div style={{display:'flex',gap:8}}>
                        <input
                          type="number"
                          className="input-field input-sm"
                          placeholder={`Default: ₹${req.budget}`}
                          value={paymentInput}
                          onChange={e=>setPaymentInput(e.target.value)}
                          style={{flex:1}}
                        />
                        <button className="btn btn-primary btn-sm" onClick={()=>handleAccept(req)}>
                          <Check size={13}/> Confirm
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={()=>setAcceptingId(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="incoming-req-actions" style={{display: 'flex', gap: 8}}>
                      <button className="btn btn-primary" onClick={()=>handleAccept(req)} style={{flex: 1, justifyContent: 'center'}}>
                        <Check size={14}/> Accept
                      </button>
                      <button className="btn btn-danger" onClick={()=>handleDecline(req)} style={{flex: 1, justifyContent: 'center'}}>
                        <X size={14}/> Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card card-padding" style={{marginTop: 16}}>
              {myAssignments.length === 0 ? (
                <div className="empty-state" style={{padding:'var(--space-8) 0'}}>
                  <div className="empty-state-icon"><Briefcase size={22} style={{color:'var(--accent-blue)'}}/></div>
                  <div className="empty-state-title">No active assignments</div>
                  <div className="empty-state-desc">Accept incoming requests to see them here</div>
                </div>
              ) : (
                <div className="upcoming-jobs-list" style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                  {myAssignments.map(req=>(
                    <div key={req.id} className="upcoming-job-row" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, border: '1px solid var(--border)', borderRadius: 8}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                        <div className="role-dot-circle" style={{background:ROLE_TYPES[req.role]?.color,width:10,height:10,borderRadius:'50%',flexShrink:0}}/>
                        <div className="upcoming-job-info">
                          <div className="upcoming-job-title" style={{fontWeight: 600, fontSize: 14}}>{req.jobTitle}</div>
                          <div className="upcoming-job-meta" style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-secondary)', marginTop: 4}}>
                            <span style={{display: 'flex', alignItems: 'center', gap: 4}}><Clock size={11}/> {req.date}</span>
                            <span style={{display: 'flex', alignItems: 'center', gap: 4}}><MapPin size={11}/> {req.venue}</span>
                          </div>
                        </div>
                      </div>
                      <span className="role-dot-pill" style={{background:ROLE_TYPES[req.role]?.bg,color:ROLE_TYPES[req.role]?.color, padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600}}>
                        {req.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="dashboard-right">
          {/* Next Week Work Panel */}
          <div className="card card-padding" style={{marginBottom: 16}}>
            <div className="card-header" style={{marginBottom: 16}}>
              <div>
                <div className="card-title">Next Week Work</div>
                <div className="card-subtitle">Upcoming jobs starting Sunday</div>
              </div>
            </div>
            {nextWeekJobs.length === 0 ? (
              <div style={{color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '16px 0'}}>No jobs scheduled for next week.</div>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                {nextWeekJobs.map((job, idx) => (
                  <div key={idx} style={{background: 'var(--surface-hover)', padding: 12, borderRadius: 6}}>
                    <div style={{fontWeight: 600, fontSize: 13, marginBottom: 4}}>{job.jobTitle}</div>
                    <div style={{fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4}}>
                      <Clock size={10} /> {job.date}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Mini Calendar widget here if needed */}
          <MiniCalendar />
        </div>
      </div>

      {/* Floating Action Button */}
      {createPortal(
        <NavLink to="/calendar" className="fab" style={{
          position: 'fixed', bottom: 32, right: 32, 
          height: 56, borderRadius: 28, padding: '0 24px',
          background: 'var(--accent-blue)', color: '#fff', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          boxShadow: '0 4px 12px rgba(59,130,246,0.4)', cursor: 'pointer',
          zIndex: 1000, textDecoration: 'none', fontWeight: 600, fontSize: 15
        }}>
          <Calendar size={20} />
          Add Job
        </NavLink>,
        document.body
      )}
    </div>
  );
}

function MiniCalendar() {
  const { state } = useApp();
  const today = new Date();
  const year  = today.getFullYear();
  const month = today.getMonth();
  const AVAIL_COLORS = { booked:'#3B82F6', available:'#10B981', partial:'#F59E0B', blocked:'#F43F5E' };
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const DAYS = ['S','M','T','W','T','F','S'];
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="card card-padding mini-calendar">
      <div className="card-header">
        <div className="card-title">
          {MONTHS[month]} {year}
        </div>
      </div>
      <div className="mini-cal-grid-header" style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8}}>
        {DAYS.map((d,i)=><div key={i}>{d}</div>)}
      </div>
      <div className="mini-cal-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4}}>
        {Array.from({length:firstDay},(_, i)=><div key={`e${i}`}/>)}
        {Array.from({length:daysInMonth},(_,i)=>{
          const day = i + 1;
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const avail   = state.availability[dateStr];
          const isToday = day === today.getDate();
          return (
            <div key={day} style={{textAlign: 'center', padding: '6px 0', borderRadius: 4, background: isToday ? 'var(--surface-hover)' : 'transparent', fontWeight: isToday ? 700 : 500, fontSize: 12}}>
              <span>{day}</span>
              {avail && <div style={{width:4,height:4,borderRadius:'50%',background:AVAIL_COLORS[avail],margin:'2px auto 0'}}/>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
