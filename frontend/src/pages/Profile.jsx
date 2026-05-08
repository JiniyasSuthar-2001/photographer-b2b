// ==================================================================================
// PAGE: PROFILE
// Purpose: Management of user identity, business settings, and professional portfolio.
// Connected Pages: 
// - Dashboard.jsx (Displays user welcome name)
// - Sidebar.jsx (Displays user avatar and email)
// - Team.jsx (Photography aliases are based on user registration info)
// Role Logic:
// - Photographers (Owners) manage studio/business settings here.
// - Freelancers manage their skills, equipment, and portfolio for discovery.
// ==================================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  User, Mail, Briefcase, MapPin, Link, AtSign, Phone,
  Plus, Trash2, Camera, Settings, AlertTriangle, Star, LogOut
} from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import { ROLE_TYPES } from '../data/mockData';
import { GUJARAT_CITIES } from '../data/gujaratCities';
import { authService } from '../services/api';
import './Profile.css';


const ALL_SKILLS = ['Wedding','Portrait','Editorial','Street','Documentary','Commercial','Fashion','Event','Product','Architecture'];
const ROLE_KEYS  = Object.keys(ROLE_TYPES);

export default function Profile() {
  const { state, dispatch, addToast } = useApp();
  const navigate = useNavigate();
  const { user, photographerProfile: fp } = state;

  const [name,  setName]  = useState(user.full_name || user.username);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [studio, setStudio] = useState(user.studioName || 'My Studio');
  const [location, setLocation] = useState(user.studioLocation || 'Ahmedabad');

  const [bio,   setBio]   = useState(fp.bio);
  const [skills,     setSkills]     = useState([...fp.skills]);
  const [specialties,setSpecialties]= useState([...fp.specialties]);
  const [yearsExp,   setYearsExp]   = useState(fp.yearsExperience);
  const [insta,      setInsta]      = useState(fp.instagramHandle);
  const [portfolio,  setPortfolio]  = useState(fp.portfolioUrl);

  const [newEquipName, setNewEquipName] = useState('');
  const [newEquipType, setNewEquipType] = useState('Camera');
  const [showReset, setShowReset] = useState(false);
  const [customCat, setCustomCat] = useState('');

  const handleDismissTrial = () => {
    dispatch({ type: 'DISMISS_TRIAL_MODAL' });
  };

  const handleSaveAll = () => {
    dispatch({ type:'UPDATE_USER', payload:{ full_name: name, email, phone, studioName:studio, studioLocation:location }});
    dispatch({type:'UPDATE_PHOTOGRAPHER_PROFILE', payload:{ bio, skills, specialties, yearsExperience:yearsExp, instagramHandle:insta, portfolioUrl:portfolio }});
    addToast('✅ Profile saved', 'success');
  };

  const toggleSkill = (s) => setSkills(prev=>prev.includes(s)?prev.filter(x=>x!==s):[...prev,s]);
  const toggleSpecialty = (r) => setSpecialties(prev=>prev.includes(r)?prev.filter(x=>x!==r):[...prev,r]);

  const addEquip = () => {
    if (!newEquipName.trim()) return;
    dispatch({type:'ADD_EQUIPMENT', payload:{name:newEquipName,type:newEquipType}});
    setNewEquipName(''); setNewEquipType('Camera');
    addToast('Equipment added','success');
  };

  const removeEquip = (id) => {
    dispatch({type:'REMOVE_EQUIPMENT', payload:id});
    addToast('Equipment removed','info');
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/auth');
    addToast('Logged out successfully', 'info');
  };

  return (
    <>


      <div className="profile-page">
        <div className="profile-grid">
          {/* Left column */}
          <div className="profile-left">
            {/* Identity */}
            <div className="card card-padding">
              <div className="profile-avatar-section">
                <div className="profile-avatar-wrap">
                  <Avatar name={name} size="xl"/>
                </div>
                <div>
                  <div className="profile-display-name">{name}</div>
                  <div className="profile-display-email">{email}</div>
                  <div style={{display:'flex',gap:6,marginTop:6}}>
                    <span className="badge badge-purple">
                      {user.user_type === 'photographer' ? 'Photographer' : 'Freelancer'}
                    </span>
                  </div>
                </div>

              </div>

              <div className="profile-fields">
                <ProfileField label="Display Name" icon={<User size={14}/>} value={name} onChange={setName}/>
                <ProfileField label="Email Address" icon={<Mail size={14}/>} value={email} onChange={setEmail} type="email"/>
                <ProfileField label="Phone Number" icon={<Phone size={14}/>} value={phone} onChange={setPhone}/>
              </div>
            </div>

            {/* Business Settings */}
            <div className="card card-padding">
              <div className="profile-section-title"><Settings size={14}/> Business Settings</div>
              <div className="profile-fields">
                <ProfileField label="Studio/Business Name" icon={<Briefcase size={14}/>} value={studio} onChange={setStudio}/>
                <div className="profile-field">
                  <label className="profile-field-label">
                    <span style={{color:'var(--text-muted)'}}><MapPin size={14}/></span>
                    City
                  </label>
                  <select className="input-field" value={location} onChange={e=>setLocation(e.target.value)}>
                    {GUJARAT_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="card card-padding danger-zone">
              <div className="profile-section-title" style={{color:'var(--accent-rose)'}}>
                <AlertTriangle size={14}/> Danger Zone
              </div>
              <p style={{fontSize:13,color:'var(--text-secondary)',margin:'var(--space-2) 0 var(--space-3)'}}>
                Reset all data to default state. This cannot be undone.
              </p>
              {!showReset ? (
                <button className="btn btn-danger" onClick={()=>setShowReset(true)}>Reset All Data</button>
              ) : (
                <div style={{display:'flex',gap:'var(--space-2)'}}>
                  <button className="btn btn-secondary" onClick={()=>setShowReset(false)}>Cancel</button>
                  <button className="btn btn-danger" onClick={()=>{ dispatch({type:'RESET_ALL'}); addToast('Data reset complete','info'); setShowReset(false); }}>
                    Confirm Reset
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="profile-right">
            {/* Skills & Specialties */}
            <div className="card card-padding">
              <div className="profile-section-title"><Star size={14}/> Professional Details</div>

              <div style={{marginBottom:'var(--space-4)'}}>
                <label style={{display:'block',fontSize:12.5,fontWeight:600,color:'var(--text-secondary)',marginBottom:'var(--space-2)'}}>Bio</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={bio}
                  onChange={e=>setBio(e.target.value)}
                  style={{resize:'vertical',fontFamily:'inherit'}}
                  placeholder="Describe your photography style and experience…"
                />
              </div>

              <div style={{marginBottom:'var(--space-4)'}}>
                <label style={{display:'block',fontSize:12.5,fontWeight:600,color:'var(--text-secondary)',marginBottom:'var(--space-2)'}}>Skills</label>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {ALL_SKILLS.map(s=>{
                    const active=skills.includes(s);
                    return (
                      <button key={s} onClick={()=>toggleSkill(s)}
                              style={{padding:'4px 12px',borderRadius:'var(--radius-pill)',border:`1.5px solid ${active?'var(--accent-blue)':'var(--border)'}`,background:active?'rgba(59,130,246,0.1)':'transparent',color:active?'var(--accent-blue)':'var(--text-secondary)',fontSize:12.5,fontWeight:active?600:400,cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{marginBottom:'var(--space-4)'}}>
                <label style={{display:'block',fontSize:12.5,fontWeight:600,color:'var(--text-secondary)',marginBottom:'var(--space-2)'}}>Specialized Roles</label>

                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {specialties.map(r=>{
                    const rt=ROLE_TYPES[r] || { color: '#6366F1', bg: 'rgba(99,102,241,0.12)' };
                    return (
                      <button key={r} onClick={()=>toggleSpecialty(r)}
                              style={{display:'inline-flex',alignItems:'center',gap:5,padding:'5px 14px',borderRadius:'var(--radius-pill)',border:`1.5px solid ${rt.color}`,background:rt.bg,color:rt.color,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>
                        <span style={{width:7,height:7,borderRadius:'50%',background:rt.color}}/>
                        {r}
                      </button>
                    );
                  })}
                  {ROLE_KEYS.filter(rk => !specialties.includes(rk)).map(r=>{
                    const rt=ROLE_TYPES[r];
                    return (
                      <button key={r} onClick={()=>toggleSpecialty(r)}
                              style={{display:'inline-flex',alignItems:'center',gap:5,padding:'5px 14px',borderRadius:'var(--radius-pill)',border:`1.5px solid var(--border)`,background:'transparent',color:'var(--text-secondary)',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>
                        <span style={{width:7,height:7,borderRadius:'50%',background:rt.color}}/>
                        {r}
                      </button>
                    );
                  })}
                </div>
                <div style={{display:'flex', gap:8, marginTop:10}}>
                  <input className="input-field input-sm" placeholder="Add custom role..." value={customCat} onChange={e=>setCustomCat(e.target.value)} style={{flex:1}} />
                  <button className="btn btn-secondary btn-sm" onClick={() => { if(customCat.trim()) { toggleSpecialty(customCat.trim()); setCustomCat(''); } }}>
                    <Plus size={14}/> Add
                  </button>
                </div>

              </div>

              <div>
                <label style={{display:'block',fontSize:12.5,fontWeight:600,color:'var(--text-secondary)',marginBottom:'var(--space-2)'}}>Years of Experience</label>
                <input type="number" className="input-field" value={yearsExp} onChange={e=>setYearsExp(parseInt(e.target.value)||0)} style={{width:120}}/>
              </div>
            </div>

            {/* Portfolio & Links */}
            <div className="card card-padding">
              <div className="profile-section-title"><Link size={14}/> Portfolio & Links</div>
              <div className="profile-fields">
                <ProfileField label="Instagram Handle" icon={<AtSign size={14}/>} value={insta} onChange={setInsta} placeholder="@yourhandle"/>
                <ProfileField label="Portfolio URL" icon={<Link size={14}/>} value={portfolio} onChange={setPortfolio} placeholder="yoursite.com"/>
              </div>
            </div>

            {/* Equipment */}
            <div className="card card-padding">
              <div className="profile-section-title"><Camera size={14}/> Equipment</div>
              <div className="equipment-list">
                {fp.equipment.map(e=>(
                  <div key={e.id} className="equipment-row">
                    <div className="equipment-info">
                      <div className="equipment-name">{e.name}</div>
                      <span className="badge badge-gray" style={{fontSize:10.5}}>{e.type}</span>
                    </div>
                    <button className="btn-icon-ghost" onClick={()=>removeEquip(e.id)}>
                      <Trash2 size={14} style={{color:'var(--accent-rose)'}}/>
                    </button>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',gap:'var(--space-2)',marginTop:'var(--space-3)',flexWrap:'wrap'}}>
                <input className="input-field input-sm" placeholder="Equipment name" value={newEquipName} onChange={e=>setNewEquipName(e.target.value)} style={{flex:1,minWidth:140}}/>
                <select className="input-field input-sm" value={newEquipType} onChange={e=>setNewEquipType(e.target.value)} style={{width:110}}>
                  {['Camera','Lens','Lighting','Drone','Accessory','Other'].map(t=><option key={t}>{t}</option>)}
                </select>
                <button className="btn btn-secondary btn-sm" onClick={addEquip}><Plus size={13}/> Add</button>
              </div>
            </div>

            <div style={{display:'flex', gap:'var(--space-3)', marginTop:'var(--space-5)'}}>
              <button className="btn btn-primary" style={{flex:2, justifyContent:'center'}} onClick={handleSaveAll}>
                Save Profile
              </button>
              <button className="btn btn-danger" style={{flex:1, justifyContent:'center', background:'var(--accent-rose)', borderColor:'var(--accent-rose)'}} onClick={handleLogout}>
                <LogOut size={15}/> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ProfileField({ label, icon, value, onChange, type='text', placeholder='' }) {
  return (
    <div className="profile-field">
      <label className="profile-field-label">
        {icon && <span style={{color:'var(--text-muted)'}}>{icon}</span>}
        {label}
      </label>
      <input type={type} className="input-field" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>
    </div>
  );
}
