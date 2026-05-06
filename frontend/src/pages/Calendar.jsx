import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft, ChevronRight, Download, Clock, MapPin, X, Plus,
  Briefcase, AlertTriangle, Check, Info, Calendar as CalendarIcon
} from 'lucide-react';
import { ROLE_TYPES } from '../data/mockData';
import './Calendar.css';

const AVAIL_COLORS = {
  available: '#10B981',
  booked: '#3B82F6',
  partial: '#F59E0B',
  blocked: '#F43F5E',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ROLE_KEYS = Object.keys(ROLE_TYPES);

export default function Calendar() {
  const { state, dispatch, addToast } = useApp();
  const { jobs, jobRequests, availability } = state;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [showConflictModal, setShowConflictModal] = useState(null);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [myJobsReason, setMyJobsReason] = useState('Unavailable');

  const [showPicker, setShowPicker] = useState(false); // Month/Year picker
  const [pickerYear, setPickerYear] = useState(currentDate.getFullYear());

  const [newJob, setNewJob] = useState({ title: '', client: '', venue: '', budget: '', roles: [], notes: '' });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getDateStr = (day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const isPast = (day) => {
    const d = new Date(year, month, day);
    return d < today;
  };

  const getDayJobs = (day) => {
    const ds = typeof day === 'string' ? day : getDateStr(day);
    const posted = jobs.filter(j => j.date === ds);
    const acceptedReqs = jobRequests.filter(r => r.status === 'accepted' && r.date === ds);
    return { posted, acceptedReqs };
  };

  const isToday = (day) => {
    const n = new Date();
    return day === n.getDate() && month === n.getMonth() && year === n.getFullYear();
  };

  const selectedDateStr = selectedDate ? getDateStr(selectedDate) : null;
  const { posted: selectedPosted, acceptedReqs: selectedAccepted } = selectedDate ? getDayJobs(selectedDate) : { posted: [], acceptedReqs: [] };

  const checkConflicts = (type) => {
    const conflicts = [];
    selectedDates.forEach(ds => {
      const { posted, acceptedReqs } = getDayJobs(ds);
      if (posted.length > 0 || acceptedReqs.length > 0) {
        conflicts.push({ date: ds, jobs: [...posted, ...acceptedReqs] });
      }
    });

    if (conflicts.length > 0) {
      setShowConflictModal({ type, jobs: conflicts });
    } else {
      if (type === 'newJob') setShowNewJobModal(true);
      else proceedUnavailable();
    }
  };

  const proceedUnavailable = () => {
    selectedDates.forEach(date => {
      const userAccepted = jobRequests.filter(r => r.status === 'accepted' && r.date === date);
      userAccepted.forEach(req => {
        dispatch({ type: 'CANCEL_ACCEPTED_REQUEST', payload: req.id });
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now() + Math.random(),
            type: 'job',
            message: `⚠️ alex@lumiere.io marked ${date} as ${myJobsReason}. Job "${req.jobTitle}" role "${req.role}" is now FREE.`,
            time: 'just now',
            read: false
          }
        });
      });
      dispatch({ type: 'SET_AVAILABILITY', payload: { date, status: 'blocked' } });
    });

    addToast(`📅 ${selectedDates.length} days marked as ${myJobsReason}`, 'info');
    setSelectedDates([]);
  };

  const handleAddJob = () => {
    if (!newJob.title || selectedDates.length === 0) return;
    selectedDates.forEach(date => {
      const id = 'J' + String(Date.now() + Math.floor(Math.random() * 1000)).slice(-4);
      dispatch({ type: 'ADD_JOB', payload: { ...newJob, id, date, status: 'open', assignedTo: null, budget: parseFloat(newJob.budget) || 0, tags: [], roles: newJob.roles } });
    });
    addToast(`✅ Job posted for ${selectedDates.length} date(s)`, 'success');
    setShowNewJobModal(false);
    setSelectedDates([]);
    setNewJob({ title: '', client: '', venue: '', budget: '', roles: [], notes: '' });
  };

  const handlePickerSelect = (mIndex) => {
    setCurrentDate(new Date(pickerYear, mIndex, 1));
    setShowPicker(false);
  };

  return (
    <div className="calendar-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)', alignItems: 'center' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Calendar</h1>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>Select dates to manage your schedule</div>
        </div>
        {selectedDates.length > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDates([])}>
            <X size={14} /> Clear Selection
          </button>
        )}
      </div>

      <div className="calendar-layout">
        <div className="calendar-main">
          <div className="calendar-nav">
            <button className="btn btn-secondary btn-icon" onClick={prevMonth}><ChevronLeft size={16} /></button>
            <h2 className="calendar-month-title clickable" onClick={() => { setShowPicker(true); setPickerYear(year); }}>
              {MONTHS[month]} {year}
              <ChevronRight size={16} className={`picker-arrow ${showPicker ? 'open' : ''}`} />
            </h2>
            <button className="btn btn-secondary btn-icon" onClick={nextMonth}><ChevronRight size={16} /></button>
          </div>

          <div className="calendar-grid-header">
            {DAYS.map(d => <div key={d} className="calendar-day-name">{d}</div>)}
          </div>

          <div className="calendar-grid">
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`e${i}`} className="calendar-cell empty" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const ds = getDateStr(day);
              const avail = availability[ds] || null;
              const { posted, acceptedReqs } = getDayJobs(day);
              const isSelected = selectedDates.includes(ds);
              const isCellDetail = selectedDate === day;
              const jobCount = posted.length + acceptedReqs.length;
              const past = isPast(day);

              return (
                <div key={day}
                  className={`calendar-cell ${isToday(day) ? 'today' : ''} ${isCellDetail ? 'cell-detail' : ''} ${isSelected ? 'selected' : ''} ${past ? 'past' : ''}`}
                  onClick={() => {
                    if (past) return;
                    if (isSelected) {
                      setSelectedDates(prev => prev.filter(d => d !== ds));
                    } else {
                      setSelectedDates(prev => [...prev, ds]);
                      setSelectedDate(day);
                    }
                  }}
                  style={{ cursor: past ? 'default' : 'pointer' }}>
                  <span className="calendar-day-num">{day}</span>
                  {isSelected && <div className="selected-indicator"><Check size={10} color="white" /></div>}
                  {avail && (
                    <div className="calendar-avail-dot" style={{ background: AVAIL_COLORS[avail] }} title={avail} />
                  )}
                  {jobCount > 0 && (
                    <div className="calendar-job-count">{jobCount}</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="calendar-legend">
            <div className="calendar-legend-section">
              <span className="calendar-legend-heading">Availability</span>
              {Object.entries(AVAIL_COLORS).map(([key, color]) => (
                <div key={key} className="calendar-legend-item">
                  <div className="calendar-legend-dot" style={{ background: color }} />
                  <span style={{ textTransform: 'capitalize' }}>{key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="calendar-sidebar">
          {selectedDate ? (
            <>
              <div className="calendar-day-detail-header">
                <h3 className="card-title">{MONTHS[month]} {selectedDate}, {year}</h3>
              </div>

              {availability[selectedDateStr] && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--space-3)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: AVAIL_COLORS[availability[selectedDateStr]] }} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                    {availability[selectedDateStr]}
                  </span>
                </div>
              )}

              {selectedPosted.length === 0 && selectedAccepted.length === 0 ? (
                <div className="empty-state" style={{ paddingTop: 'var(--space-6)' }}>
                  <div className="empty-state-title">No bookings</div>
                  <div className="empty-state-desc">No jobs scheduled for this day</div>
                </div>
              ) : (
                <div className="calendar-day-jobs">
                  {selectedPosted.map(job => (
                    <div key={job.id} className="calendar-day-job-card">
                      <div className="calendar-day-job-title">{job.title}</div>
                      <div className="calendar-day-job-client">{job.client}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6 }}>
                        <MapPin size={11} /> {job.venue}
                      </div>
                    </div>
                  ))}
                  {selectedAccepted.map(req => (
                    <div key={req.id} className="calendar-day-job-card" style={{ borderLeftColor: 'var(--accent-teal)' }}>
                      <div className="calendar-day-job-title">{req.jobTitle}</div>
                      <div className="calendar-day-job-client">From: {req.sentBy}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6 }}>
                        <MapPin size={11} /> {req.venue}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state" style={{ paddingTop: 'var(--space-8)' }}>
              <div className="empty-state-icon"><Info size={24} /></div>
              <div className="empty-state-title">Select a date</div>
              <div className="empty-state-desc">Click any day to view details</div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bar */}
      {selectedDates.length > 0 && (
        <div className="calendar-floating-bar">
          <div className="floating-bar-info">
            <span className="selection-count">{selectedDates.length}</span>
            <span className="selection-label">Dates Selected</span>
          </div>
          <div className="floating-bar-actions">
            <select className="input-field input-sm" value={myJobsReason} onChange={e => setMyJobsReason(e.target.value)} style={{ width: 140, height: 36 }}>
              <option value="Unavailable">Unavailable</option>
              <option value="Vacation">Vacation</option>
            </select>
            <button className="btn btn-secondary btn-sm" onClick={() => checkConflicts('unavailable')}>
              <Briefcase size={14} /> Mark {myJobsReason}
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => checkConflicts('newJob')}>
              <Plus size={14} /> Add New Job
            </button>
            <button className="btn-icon-ghost" onClick={() => setSelectedDates([])} style={{ marginLeft: 8 }}>
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Picker Modal */}
      {showPicker && (
        <div className="modal-overlay" onClick={() => setShowPicker(false)} style={{ zIndex: 4000 }}>
          <div className="modal card-padding" onClick={e => e.stopPropagation()} style={{ maxWidth: 340 }}>
            <div className="picker-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <button className="btn-icon-ghost" onClick={() => setPickerYear(p => p - 1)}><ChevronLeft size={20} /></button>
              <span style={{ fontSize: 18, fontWeight: 700 }}>{pickerYear}</span>
              <button className="btn-icon-ghost" onClick={() => setPickerYear(p => p + 1)}><ChevronRight size={20} /></button>
            </div>
            <div className="picker-months-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {MONTHS.map((m, i) => (
                <button
                  key={m}
                  className={`btn ${pickerYear === year && i === month ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={() => handlePickerSelect(i)}
                  style={{ padding: '12px 0', justifyContent: 'center' }}
                >
                  {m.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Conflict Modal */}
      {showConflictModal && (
        <div className="modal-overlay" style={{ zIndex: 3000 }}>
          <div className="modal card-padding" style={{ maxWidth: 450 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, color: 'var(--accent-rose)' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0 }}>Schedule Conflict Warning</h3>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
              You already have jobs scheduled on some of the selected dates. Proceeding will overlap with:
            </p>
            <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {showConflictModal.jobs.map((item, idx) => (
                <div key={idx} style={{ padding: 12, background: 'var(--surface-hover)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>{item.date}</div>
                  {item.jobs.map(j => (
                    <div key={j.id} style={{ fontSize: 13, fontWeight: 600 }}>• {j.title || j.jobTitle}</div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowConflictModal(null)}>Cancel</button>
              <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => {
                const type = showConflictModal.type;
                setShowConflictModal(null);
                if (type === 'newJob') setShowNewJobModal(true);
                else proceedUnavailable();
              }}>Confirm & Proceed</button>
            </div>
          </div>
        </div>
      )}

      {/* New Job Modal */}
      {showNewJobModal && (
        <div className="modal-overlay" onClick={() => setShowNewJobModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div className="modal-title">Job Details</div>
              <button className="modal-close" onClick={() => setShowNewJobModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'var(--surface-hover)', padding: '12px', borderRadius: 8 }}>
                <strong>Selected Dates ({selectedDates.length}):</strong><br />
                {selectedDates.sort().join(', ')}
              </div>
              {[
                { label: 'Job Title *', key: 'title', placeholder: 'e.g. Santorini Wedding' },
                { label: 'Client', key: 'client', placeholder: 'Client name' },
                { label: 'Venue', key: 'venue', placeholder: 'e.g. Villa Rosita' },
                { label: 'Budget (₹)', key: 'budget', type: 'number', placeholder: '0' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>{f.label}</label>
                  <input className="input-field" type={f.type || 'text'} placeholder={f.placeholder || ''} value={newJob[f.key] || ''} onChange={e => setNewJob(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Roles Required</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ROLE_KEYS.map(r => (
                    <button key={r} onClick={() => setNewJob(p => ({ ...p, roles: p.roles.includes(r) ? p.roles.filter(x => x !== r) : [...p.roles, r] }))}
                      className="btn btn-sm"
                      style={{ border: `1.5px solid ${newJob.roles.includes(r) ? ROLE_TYPES[r].color : 'var(--border)'}`, background: newJob.roles.includes(r) ? ROLE_TYPES[r].bg : 'transparent', color: newJob.roles.includes(r) ? ROLE_TYPES[r].color : 'var(--text-secondary)' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: ROLE_TYPES[r].color, display: 'inline-block', marginRight: 4 }} />
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowNewJobModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddJob} disabled={!newJob.title}>Post Jobs</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
