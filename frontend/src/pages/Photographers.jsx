import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Search, MapPin, Phone, Camera, Filter, RefreshCw, X } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import { ROLE_TYPES } from '../data/mockData';
import { GUJARAT_CITIES } from '../data/gujaratCities';

const ROLE_KEYS = Object.keys(ROLE_TYPES);

export default function Photographers() {
  const { state } = useApp();
  const { user, team } = state;
  const userCity = user.studioLocation || 'Ahmedabad';
  
  const [cityFilter, setCityFilter] = useState(userCity);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [equipSearch, setEquipSearch] = useState('');
  
  // Random pool of photographers to pick from
  const [randomSeed, setRandomSeed] = useState(0);

  // Mock "other photographers" (in reality this would fetch from a global database)
  const allPhotographers = useMemo(() => {
    const names = ['Aarav Patel', 'Diya Shah', 'Kavya Desai', 'Rohan Mehta', 'Ishaan Joshi', 'Myra Trivedi', 'Vivaan Gandhi', 'Ananya Jani', 'Vihaan Rathod', 'Nisha Solanki'];
    const equipOptions = ['Sony A7 III', 'Canon R6', 'Nikon Z7', 'DJI Mavic Air 2', 'DJI Mini 3 Pro', 'Sony FX3'];
    
    // Generate 50 random photographers
    let list = [];
    for (let i = 0; i < 50; i++) {
      const name = names[i % names.length] + ' ' + String.fromCharCode(65 + (i%26));
      const roleKey = ROLE_KEYS[i % ROLE_KEYS.length];
      const city = GUJARAT_CITIES[i % GUJARAT_CITIES.length];
      const eq = equipOptions[i % equipOptions.length];
      list.push({
        id: `P${i}`,
        name,
        specialties: [roleKey],
        city,
        phone: `+91 98${String(Math.floor(Math.random()*100000000)).padStart(8, '0')}`,
        equipment: [eq]
      });
    }
    return list;
  }, []);

  const teamIds = new Set(team.map(t => t.id)); // Assuming team members have distinct IDs, but team IDs are numbers, these are string. 
  // Let's just filter by exact name to be safe since it's mock
  const teamNames = new Set(team.map(t => t.name));

  const filteredPhotographers = useMemo(() => {
    // Force city selection (if empty, show none, but we enforce default)
    if (!cityFilter) return [];

    let filtered = allPhotographers.filter(p => !teamNames.has(p.name));
    filtered = filtered.filter(p => p.city === cityFilter);

    if (categoryFilter) {
      filtered = filtered.filter(p => p.specialties.includes(categoryFilter));
    }
    if (phoneSearch) {
      filtered = filtered.filter(p => p.phone.includes(phoneSearch));
    }
    if (equipSearch) {
      filtered = filtered.filter(p => p.equipment.some(e => e.toLowerCase().includes(equipSearch.toLowerCase())));
    }
    
    // "every refresh will jenerate rendom photographer if any spascfic catagoty is not selacted"
    // To simulate this without actually regenerating, we shuffle the array based on randomSeed 
    // IF category is not selected.
    if (!categoryFilter) {
      // Simple pseudo-shuffle using seed
      filtered = [...filtered].sort((a,b) => {
        const hashA = (a.id.charCodeAt(1) + randomSeed) % 10;
        const hashB = (b.id.charCodeAt(1) + randomSeed) % 10;
        return hashA - hashB;
      });
    }

    return filtered;
  }, [allPhotographers, cityFilter, categoryFilter, phoneSearch, equipSearch, teamNames, randomSeed]);

  return (
    <div className="page-container" style={{padding: 'var(--space-6)'}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'var(--space-4)',alignItems:'center'}}>
        <div>
          <h1 className="page-title" style={{margin:0}}>Photographers Hub</h1>
          <div style={{fontSize:13,color:'var(--text-muted)',marginTop:3}}>Find and connect with photographers in Gujarat</div>
        </div>
        <button className="btn btn-secondary" onClick={() => setRandomSeed(prev => prev + 1)}>
          <RefreshCw size={15}/> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card card-padding" style={{marginBottom: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center'}}>
        <div style={{flex: 1, minWidth: 200}}>
          <label style={{display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4}}>City (Required)</label>
          <div className="input-with-icon">
            <MapPin size={14} className="input-icon" />
            <select className="input-field" value={cityFilter} onChange={e => setCityFilter(e.target.value)} style={{paddingLeft: 32}}>
              {GUJARAT_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        
        <div style={{flex: 1, minWidth: 200}}>
          <label style={{display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4}}>Category</label>
          <div className="input-with-icon">
            <Filter size={14} className="input-icon" />
            <select className="input-field" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{paddingLeft: 32}}>
              <option value="">All Categories</option>
              {ROLE_KEYS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div style={{flex: 1, minWidth: 150}}>
          <label style={{display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4}}>Phone Number</label>
          <div className="input-with-icon">
            <Phone size={14} className="input-icon" />
            <input className="input-field" placeholder="Search phone" value={phoneSearch} onChange={e => setPhoneSearch(e.target.value)} style={{paddingLeft: 32}}/>
          </div>
        </div>

        <div style={{flex: 1, minWidth: 150}}>
          <label style={{display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4}}>Equipment</label>
          <div className="input-with-icon">
            <Camera size={14} className="input-icon" />
            <input className="input-field" placeholder="Search equipment" value={equipSearch} onChange={e => setEquipSearch(e.target.value)} style={{paddingLeft: 32}}/>
          </div>
        </div>
      </div>

      {/* Results */}
      {!cityFilter ? (
        <div className="card card-padding" style={{textAlign: 'center', padding: 'var(--space-8)'}}>
          <MapPin size={32} style={{color: 'var(--text-muted)', margin: '0 auto var(--space-3)'}}/>
          <h3 style={{margin: '0 0 var(--space-2)'}}>Please select a city</h3>
          <p style={{color: 'var(--text-secondary)', fontSize: 14}}>You must select a city to view available photographers.</p>
        </div>
      ) : filteredPhotographers.length === 0 ? (
        <div className="card card-padding" style={{textAlign: 'center', padding: 'var(--space-8)'}}>
          <Search size={32} style={{color: 'var(--text-muted)', margin: '0 auto var(--space-3)'}}/>
          <h3 style={{margin: '0 0 var(--space-2)'}}>No photographers found</h3>
          <p style={{color: 'var(--text-secondary)', fontSize: 14}}>Try adjusting your filters or checking a different city.</p>
        </div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)'}}>
          {filteredPhotographers.map(p => (
            <div key={p.id} className="card card-padding" style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-3)'}}>
              <div style={{display: 'flex', gap: 'var(--space-3)', alignItems: 'center'}}>
                <Avatar name={p.name} size="md"/>
                <div>
                  <div style={{fontWeight: 600, fontSize: 15}}>{p.name}</div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)', marginTop: 2}}>
                    <MapPin size={12}/> {p.city}
                  </div>
                </div>
              </div>
              
              <div>
                <div style={{display: 'flex', gap: 4, flexWrap: 'wrap'}}>
                  {p.specialties.map(r => (
                    <span key={r} style={{background: ROLE_TYPES[r]?.bg || 'var(--surface-hover)', color: ROLE_TYPES[r]?.color || 'var(--text-secondary)', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600}}>
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--text-secondary)', marginTop: 4}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                  <Phone size={14} style={{color: 'var(--text-muted)'}}/>
                  {p.phone}
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                  <Camera size={14} style={{color: 'var(--text-muted)'}}/>
                  {p.equipment.join(', ')}
                </div>
              </div>

              <div style={{marginTop: 'auto', paddingTop: 'var(--space-3)'}}>
                <button className="btn btn-secondary" style={{width: '100%', justifyContent: 'center'}}>
                  Send Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
