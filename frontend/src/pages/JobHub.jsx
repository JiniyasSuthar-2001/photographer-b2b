import { useState, useEffect } from 'react';
import { useApp, usePermission } from '../context/AppContext';
import {
  Briefcase, MapPin, Clock, Users, Plus, Send, Check, X, Edit2, Trash2,
  ChevronDown, Tag, Building, DollarSign, Filter, Search, Phone
} from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import { StatusBadge } from '../components/ui/Badge';
import { ROLE_TYPES } from '../data/mockData';
import { photographerPool } from '../data/photographerPool';
import DatePicker from '../components/ui/DatePicker';
import './JobHub.css';

const ROLE_KEYS = Object.keys(ROLE_TYPES);
const today = new Date().toISOString().split('T')[0];

function getFirstDate(dateStr) {
  if (typeof dateStr === 'string' && dateStr.includes(',')) return dateStr.split(',')[0].trim();
  return dateStr;
}

function isFuture(date)  { return getFirstDate(date) > today; }
function isPast(date)    { return getFirstDate(date) < today; }
function isCurrent(job)  { return (job.status==='in_progress'||job.status==='assigned') && !isPast(job.date); }

function RolePill({ role }) {
  const r = ROLE_TYPES[role];
  if (!r) return null;
  return (
    <span className="role-pill" style={{background:r.bg, color:r.color}}>
      <span className="role-pill-dot" style={{background:r.color}}/>
      {r.label}
    </span>
  );
}

export default function JobHub() {
  const { state, dispatch, addToast } = useApp();
  const { jobs, team, jobRequests } = state;
  const { canPostJob, canSendRequest, canViewFinancials } = usePermission();

  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [showNewJob, setShowNewJob] = useState(false);
  const [showEditJob, setShowEditJob] = useState(null); // job object
  const [showRequestModal, setShowRequestModal] = useState(null); // jobId

  const [newJob, setNewJob] = useState({ title:'',client:'',date:'',venue:'',budget:'',roles:[],notes:'' });

  const [reqForm, setReqForm] = useState({ memberId:'', role:'', budget:'', phone: state.user.phone });
  const [isSearchingPool, setIsSearchingPool] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setShowNewJob(false);
        setShowEditJob(null);
        setShowRequestModal(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const filterJobs = () => {
    let filtered = jobs;
    if (search) filtered = filtered.filter(j => j.title.toLowerCase().includes(search.toLowerCase()) || j.client.toLowerCase().includes(search.toLowerCase()));
    switch(tab) {
      case 'current': return filtered.filter(isCurrent);
      case 'future':  return filtered.filter(j => isFuture(j.date) && !isCurrent(j));
      case 'past':    return filtered.filter(j => j.status==='completed' || isPast(j.date));
      default:        return filtered;
    }
  };

  const filteredJobs = filterJobs();

  const handleAddJob = () => {
    if (!newJob.title || !newJob.date) return;
    const id = 'J' + String(Date.now()).slice(-4);
    dispatch({ type:'ADD_JOB', payload:{...newJob, id, status:'open', assignedTo:null, budget:parseFloat(newJob.budget)||0, tags:[], roles:newJob.roles} });
    addToast('✅ Job posted successfully', 'success');
    setShowNewJob(false);
    setNewJob({title:'',client:'',date:'',venue:'',budget:'',roles:[],notes:''});
  };

  const handleEditJob = (e) => {
    e.preventDefault();
    if (!showEditJob.title || !showEditJob.date) return addToast('Title and Date are required', 'error');
    dispatch({ type: 'UPDATE_JOB', payload: showEditJob });
    addToast('✅ Job updated successfully', 'success');
    setShowEditJob(null);
  };

  const handleDeleteJob = (id) => {
    if (confirm('Are you sure you want to delete this job?')) {
      dispatch({ type: 'DELETE_JOB', payload: id });
      addToast('🗑️ Job deleted', 'info');
    }
  };

  const handleSendRequest = (job) => {
    if (!reqForm.memberId || !reqForm.role) { addToast('Please select a member and role', 'error'); return; }
    const member = team.find(m => String(m.id) === String(reqForm.memberId));
    const req = {
      id: 'REQ' + Date.now(),
      jobId: job.id,
      jobTitle: job.title,
      sentBy: state.user.name,
      sentTo: member.name,
      role: reqForm.role,
      date: job.date,
      venue: job.venue,
      budget: parseFloat(reqForm.budget) || job.budget,
      phone: reqForm.phone || state.user.phone,
      payment: null,
      status: 'pending',
      sentAt: new Date().toISOString(),
      respondedAt: null,
      notes: '',
    };
    dispatch({ type:'SEND_JOB_REQUEST', payload:req });
    dispatch({ type:'ADD_NOTIFICATION', payload:{ id:Date.now(), type:'request', message:`Request sent to ${member.name} for ${job.title}`, time:'just now', read:false }});
    addToast(`📨 Request sent to ${member.name}`, 'success');
    setShowRequestModal(null);
    setReqForm({memberId:'',role:'',budget:'',phone:state.user.phone});
    setSearchQuery('');
    setIsSearchingPool(false);
  };

  const TABS = [
    { key:'all',     label:'All Jobs',     count:jobs.length },
    { key:'current', label:'Current',      count:jobs.filter(isCurrent).length },
    { key:'future',  label:'Future',       count:jobs.filter(j=>isFuture(j.date)&&!isCurrent(j)).length },
    { key:'past',    label:'Past',         count:jobs.filter(j=>j.status==='completed'||isPast(j.date)).length },
  ];

  return (
    <div className="jobhub-page">
      <div className="jobhub-header">
        <div>
          <h1 className="page-title" style={{margin:0}}>Job Hub</h1>
          <div style={{fontSize:13,color:'var(--text-muted)',marginTop:3}}>Manage your jobs and assignments</div>
        </div>
        <button className="btn btn-primary" onClick={()=>setShowNewJob(true)}>
          <Plus size={15}/> Post New Job
        </button>
      </div>

      <div className="jobhub-layout" style={{ display: 'block' }}>
        <div className="jobhub-main" style={{ marginLeft: 0 }}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'var(--space-4)',flexWrap:'wrap',marginBottom:'var(--space-4)'}}>
            <div className="tabs">
              {TABS.map(t=>(
                <button key={t.key} className={`tab ${tab===t.key?'active':''}`} onClick={()=>setTab(t.key)}>
                  {t.label}
                  <span className="tab-count">{t.count}</span>
                </button>
              ))}
            </div>
            <div style={{position:'relative'}}>
              <Search size={14} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}}/>
              <input className="input-field" style={{paddingLeft:30,width:220,fontSize:13}} placeholder="Search jobs…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="empty-state" style={{paddingTop:'var(--space-10)'}}>
              <div className="empty-state-icon"><Briefcase size={24} style={{color:'var(--accent-blue)'}}/></div>
              <div className="empty-state-title">No jobs found</div>
            </div>
          ) : (
            <div className="jobhub-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
              {filteredJobs.map(job=>{
                const assignedMember = job.assignedTo ? team.find(m=>m.id===job.assignedTo) : null;
                const jobReqs = jobRequests.filter(r=>r.jobId===job.id);
                return (
                  <div key={job.id} className="jh-card">
                    <div className="jh-card-header">
                      <div>
                        <div className="jh-card-title">{job.title}</div>
                        <div className="jh-card-client">{job.client}</div>
                      </div>
                      <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                        <button className="btn btn-secondary btn-sm" style={{padding: '4px'}} onClick={() => setShowEditJob(job)} title="Edit Job"><Edit2 size={12} /></button>
                        <button className="btn btn-danger btn-sm" style={{padding: '4px'}} onClick={() => handleDeleteJob(job.id)} title="Delete Job"><Trash2 size={12} /></button>
                      </div>
                    </div>

                    {showEditJob && showEditJob.id === job.id ? (
                      <form onSubmit={handleEditJob} className="jh-card-edit-form" style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--surface-hover)', borderRadius: 8}}>
                        <div>
                          <label style={{fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)'}}>Job Title</label>
                          <input className="input-field input-sm" value={showEditJob.title} onChange={e=>setShowEditJob(p=>({...p, title:e.target.value}))} required />
                        </div>
                        <div style={{display: 'flex', gap: 8}}>
                          <div style={{flex: 1}}>
                            <label style={{fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)'}}>Date(s)</label>
                            <DatePicker multiple={true} value={showEditJob.date} onChange={val => setShowEditJob(p=>({...p, date:val}))} />
                          </div>
                          <div style={{flex: 1}}>
                            <label style={{fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)'}}>Budget (₹)</label>
                            <input className="input-field input-sm" type="number" value={showEditJob.budget} onChange={e=>setShowEditJob(p=>({...p, budget:Number(e.target.value)}))} required />
                          </div>
                        </div>
                        <div style={{display: 'flex', gap: 8}}>
                          <div style={{flex: 1}}>
                            <label style={{fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)'}}>Venue</label>
                            <input className="input-field input-sm" value={showEditJob.venue} onChange={e=>setShowEditJob(p=>({...p, venue:e.target.value}))} />
                          </div>
                          <div style={{flex: 1}}>
                            <label style={{fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)'}}>Client</label>
                            <input className="input-field input-sm" value={showEditJob.client} onChange={e=>setShowEditJob(p=>({...p, client:e.target.value}))} />
                          </div>
                        </div>
                        <div style={{display: 'flex', gap: 8, marginTop: 8}}>
                          <button type="button" className="btn btn-secondary btn-sm" style={{flex: 1, justifyContent: 'center'}} onClick={()=>setShowEditJob(null)}>Cancel</button>
                          <button type="submit" className="btn btn-primary btn-sm" style={{flex: 1, justifyContent: 'center'}}>Save</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="jh-card-meta">
                          <StatusBadge status={job.status}/>
                          <span><Clock size={11}/> {job.date}</span>
                          <span><Building size={11}/> {job.venue}</span>
                        </div>

                    {(!showEditJob || showEditJob.id !== job.id) && (
                      <>
                        <div style={{display:'flex',gap:5,flexWrap:'wrap',marginTop:'var(--space-2)'}}>
                          {(job.roles||[]).map(r=><RolePill key={r} role={r}/>)}
                        </div>

                        {assignedMember && (
                          <div className="jh-card-assignee" style={{marginTop:'var(--space-3)'}}>
                            <Avatar name={assignedMember.name} size="sm"/>
                            <span style={{fontSize:12.5,color:'var(--text-secondary)'}}>{assignedMember.name}</span>
                          </div>
                        )}

                        {jobReqs.length>0 && (
                          <div className="jh-req-summary" style={{marginTop:'var(--space-3)'}}>
                            <div style={{fontSize:11, fontWeight:600, color:'var(--text-muted)', marginBottom:4}}>REQUEST STATUS</div>
                            {jobReqs.map(r=>(
                              <span key={r.id} className="jh-req-chip"
                                    style={{
                                      background: r.status==='accepted'?'rgba(16,185,129,0.1)':r.status==='declined'?'rgba(244,63,94,0.1)':'rgba(245,158,11,0.1)',
                                      color: r.status==='accepted'?'#10B981':r.status==='declined'?'#F43F5E':'#F59E0B',
                                      display: 'inline-flex', alignItems: 'center', padding: '4px 8px', borderRadius: '4px', fontSize: 11, fontWeight: 600, marginRight: 4, marginBottom: 4
                                    }}>
                                {r.sentTo} · {r.status === 'pending' ? 'Pending' : r.status}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="jh-card-footer" style={{marginTop:'var(--space-3)'}}>
                          <div className="jh-card-budget">₹{job.budget.toLocaleString()}</div>
                          {job.status==='open' && (
                            <button className="btn btn-secondary btn-sm"
                                    onClick={()=>{ setShowRequestModal(job); setReqForm({memberId:'',role:job.roles?.[0]||'',budget:String(job.budget),phone:state.user.phone}); }}>
                              <Send size={12}/> Send Request
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showNewJob && (
        <div className="modal-overlay" onClick={()=>setShowNewJob(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Post New Job</div>
              <button className="modal-close" onClick={()=>setShowNewJob(false)}><X size={18}/></button>
            </div>
            <div className="modal-body" style={{display:'flex',flexDirection:'column',gap:'var(--space-4)'}}>
              {[
                {label:'Job Title *', key:'title', placeholder:'e.g. Santorini Wedding'},
                {label:'Client',      key:'client', placeholder:'Client name'},
                {label:'Venue',       key:'venue',  placeholder:'e.g. Villa Rosita'},
                {label:'Location',    key:'location',placeholder:'City, Country'},
                {label:'Budget (₹)',  key:'budget', type:'number', placeholder:'0'},
              ].map(f=>(
                <div key={f.key}>
                  <label style={{display:'block',fontSize:12.5,fontWeight:600,color:'var(--text-secondary)',marginBottom:4}}>{f.label}</label>
                  <input className="input-field" type={f.type||'text'} placeholder={f.placeholder||''} value={newJob[f.key]||''} onChange={e=>setNewJob(p=>({...p,[f.key]:e.target.value}))}/>
                </div>
              ))}
              <div>
                <label style={{display:'block',fontSize:12.5,fontWeight:600,color:'var(--text-secondary)',marginBottom:4}}>Date(s) *</label>
                <DatePicker multiple={true} value={newJob.date} onChange={val => setNewJob(p=>({...p, date:val}))} />
              </div>
              <div>
                <label style={{display:'block',fontSize:12.5,fontWeight:600,color:'var(--text-secondary)',marginBottom:6}}>Roles Required</label>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {ROLE_KEYS.map(r=>(
                    <button key={r} onClick={()=>setNewJob(p=>({...p,roles:p.roles.includes(r)?p.roles.filter(x=>x!==r):[...p.roles,r]}))}
                            className="btn btn-sm"
                            style={{border:`1.5px solid ${newJob.roles.includes(r)?ROLE_TYPES[r].color:'var(--border)'}`,background:newJob.roles.includes(r)?ROLE_TYPES[r].bg:'transparent',color:newJob.roles.includes(r)?ROLE_TYPES[r].color:'var(--text-secondary)'}}>
                      <span style={{width:6,height:6,borderRadius:'50%',background:ROLE_TYPES[r].color,display:'inline-block',marginRight:4}}/>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={()=>setShowNewJob(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddJob}><Plus size={14}/> Post Job</button>
            </div>
          </div>
        </div>
      )}


      {showRequestModal && (
        <div className="modal-overlay" onClick={()=>setShowRequestModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Send Job Request</div>
                <div style={{fontSize:13,color:'var(--text-muted)',marginTop:2}}>{showRequestModal.title}</div>
              </div>
              <button className="modal-close" onClick={()=>setShowRequestModal(null)}><X size={18}/></button>
            </div>
            <div className="modal-body" style={{display:'flex',flexDirection:'column',gap:'var(--space-4)'}}>
              <div>
                <label style={{display:'block',fontSize:12.5,fontWeight:600,color:'var(--text-secondary)',marginBottom:6}}>Assign Role</label>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {ROLE_KEYS.map(r=>(
                    <button key={r} onClick={()=>setReqForm(p=>({...p,role:r, memberId:''}))}
                            className="btn btn-sm"
                            style={{border:`1.5px solid ${reqForm.role===r?ROLE_TYPES[r].color:'var(--border)'}`,background:reqForm.role===r?ROLE_TYPES[r].bg:'transparent',color:reqForm.role===r?ROLE_TYPES[r].color:'var(--text-secondary)'}}>
                      <span style={{width:6,height:6,borderRadius:'50%',background:ROLE_TYPES[r].color,display:'inline-block',marginRight:4}}/>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{marginTop: 'var(--space-2)'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
                  <label style={{fontSize:12.5,fontWeight:600,color:'var(--text-secondary)'}}>
                    {isSearchingPool ? 'Find New Photographer' : 'Select Team Member'}
                  </label>
                  <button className={`btn btn-sm ${isSearchingPool ? 'btn-primary' : 'btn-secondary'}`} 
                          style={{padding:'2px 8px', fontSize:11}}
                          onClick={() => { setIsSearchingPool(!isSearchingPool); setSearchQuery(''); setReqForm(p=>({...p, memberId:''})); }}>
                    {isSearchingPool ? 'Back to Team' : <><Plus size={12}/> Find New</>}
                  </button>
                </div>

                <div style={{position:'relative'}}>
                  <Search size={14} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}}/>
                  <input className="input-field" style={{paddingLeft:30}} 
                         placeholder={isSearchingPool ? "Search by name, city, or phone..." : "Search team by name, city, or phone..."}
                         value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} />
                </div>

                <div style={{marginTop:8, maxHeight:160, overflowY:'auto', border:'1px solid var(--border)', borderRadius:8, background:'var(--surface)'}}>
                  {(() => {
                    if (isSearchingPool && !searchQuery.trim()) {
                      return <div style={{padding:12, fontSize:12, color:'var(--text-muted)', textAlign:'center'}}>Search by name, city, or phone number to find photographers...</div>;
                    }

                    const source = isSearchingPool ? photographerPool : team;
                    const filtered = source.filter(m => {
                      const matchesSearch = !searchQuery || 
                        m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        m.city?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        m.phone?.includes(searchQuery);
                      const matchesRole = isSearchingPool ? true : (m.specialties || []).includes(reqForm.role);
                      return matchesSearch && matchesRole;
                    });

                    if (filtered.length === 0) {
                      return <div style={{padding:12, fontSize:12, color:'var(--text-muted)', textAlign:'center'}}>No matches found</div>;
                    }

                    return filtered.map(m => (
                      <div key={m.id} 
                           onClick={() => setReqForm(p => ({...p, memberId: m.id}))}
                           style={{
                             padding: '8px 12px', 
                             cursor: 'pointer', 
                             display: 'flex', 
                             justifyContent: 'space-between', 
                             alignItems: 'center',
                             background: String(reqForm.memberId) === String(m.id) ? 'var(--surface-hover)' : 'transparent',
                             borderBottom: '1px solid var(--border)'
                           }}>
                        <div>
                          <div style={{fontSize:13, fontWeight:600}}>{m.name}</div>
                          <div style={{fontSize:11, color:'var(--text-muted)'}}>{m.city} • {m.phone}</div>
                        </div>
                        {String(reqForm.memberId) === String(m.id) && <Check size={14} style={{color:'var(--accent-blue)'}}/>}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={()=>setShowRequestModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={()=>handleSendRequest(showRequestModal)}><Send size={14}/> Send Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
