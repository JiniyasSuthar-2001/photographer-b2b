// ─── Role Types ───────────────────────────────────────────────────────────────
export const ROLE_TYPES = {
  Candid:      { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  label: 'Candid'      },
  Drone:       { color: '#10B981', bg: 'rgba(16,185,129,0.12)',  label: 'Drone'       },
  Traditional: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', label: 'Traditional' },
  Videographer: { color: '#2DD4BF', bg: 'rgba(45,212,191,0.12)',  label: 'Videographer'},
  'Reel Expert': { color: '#F43F5E', bg: 'rgba(244,63,94,0.12)',   label: 'Reel Expert' },
  Corporate:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  label: 'Corporate'   },
};

// ─── Mock Team Members ────────────────────────────────────────────────────────
export const mockTeam = [
  { id: 1, name: 'Sofia Reyes',   role: 'Lead Photographer',     status: 'available', jobsCompleted: 47, rating: 4.9, joinedDate: '2024-02-10', color: '#3B82F6', specialties: ['Candid', 'Traditional'], city: 'Ahmedabad', phone: '+91 91234 56780', equipment: ['Sony A7R V', '24-70mm lens'] },
  { id: 2, name: 'Marcus Chen',   role: 'Assistant Photographer', status: 'busy',      jobsCompleted: 23, rating: 4.7, joinedDate: '2024-06-15', color: '#8B5CF6', specialties: ['Traditional'], city: 'Surat', phone: '+91 91234 56781', equipment: ['Canon R5'] },
  { id: 3, name: 'Priya Nair',    role: 'Videographer',           status: 'available', jobsCompleted: 31, rating: 4.8, joinedDate: '2024-03-22', color: '#2DD4BF', specialties: ['Candid'], city: 'Vadodara', phone: '+91 91234 56782', equipment: ['Panasonic GH6'] },
  { id: 4, name: 'James Okafor',  role: 'Editor',                 status: 'offline',   jobsCompleted: 58, rating: 4.6, joinedDate: '2023-11-01', color: '#F59E0B', specialties: ['Traditional'], city: 'Rajkot', phone: '+91 91234 56783', equipment: ['MacBook Pro'] },
  { id: 5, name: 'Lena Müller',   role: 'Second Shooter',         status: 'available', jobsCompleted: 15, rating: 4.5, joinedDate: '2025-01-18', color: '#F43F5E', specialties: ['Candid'], city: 'Ahmedabad', phone: '+91 91234 56784', equipment: ['Nikon Z6 II'] },
  { id: 6, name: 'Diego Santos',  role: 'Drone Operator',         status: 'busy',      jobsCompleted: 19, rating: 4.9, joinedDate: '2024-09-05', color: '#10B981', specialties: ['Drone'], city: 'Surat', phone: '+91 91234 56785', equipment: ['DJI Mavic 3'] },
  { id: 7, name: 'Arjun Varma',   role: 'Videographer',           status: 'available', jobsCompleted: 42, rating: 4.8, joinedDate: '2024-01-12', color: '#2DD4BF', specialties: ['Videographer'], city: 'Ahmedabad', phone: '+91 91234 56786', equipment: ['Sony FX3', 'Ronin RS3'] },
  { id: 8, name: 'Ishani Bhatt',  role: 'Reel Expert',            status: 'available', jobsCompleted: 67, rating: 4.9, joinedDate: '2024-04-05', color: '#F43F5E', specialties: ['Reel Expert'], city: 'Surat', phone: '+91 91234 56787', equipment: ['iPhone 15 Pro Max', 'Insta360 Flow'] },
  { id: 9, name: 'Karan Mehta',   role: 'Corporate Lead',         status: 'busy',      jobsCompleted: 28, rating: 4.7, joinedDate: '2024-02-20', color: '#F59E0B', specialties: ['Corporate'], city: 'Vadodara', phone: '+91 91234 56788', equipment: ['Canon EOS R3', '24-105mm'] },
];

// ─── Mock Jobs ────────────────────────────────────────────────────────────────
export const mockJobs = [
  { id: 'J001', title: 'Sorrento Wedding',        client: 'Isabella Romano',    date: '2026-05-18', budget: 42000, status: 'assigned',    assignedTo: 1, roles: ['Traditional', 'Candid'], tags: ['wedding', 'outdoor'],          location: 'Ahmedabad, IN',    venue: 'Taj Skyline',     notes: 'Golden hour shoot, ceremony at 5PM' },
  { id: 'J002', title: 'Chen Corporate Headshots', client: 'TechNova Inc.',      date: '2026-05-20', budget: 18000, status: 'open',        assignedTo: null, roles: ['Traditional'],         tags: ['corporate', 'portrait'],       location: 'Surat, IN',        venue: 'Diamond Bourse',   notes: '25 executives, 2 hour session' },
  { id: 'J003', title: 'Milan Fashion Editorial',  client: 'Vogue Italia',       date: '2026-05-25', budget: 65000, status: 'in_progress', assignedTo: 3, roles: ['Candid', 'Traditional'], tags: ['fashion', 'editorial'],        location: 'Vadodara, IN',        venue: 'Laxmi Vilas Palace',     notes: 'Spring collection, 8 outfits' },
  { id: 'J004', title: 'Rivera Quinceanera',       client: 'Maria Rivera',       date: '2026-04-30', budget: 29000, status: 'completed',   assignedTo: 2, roles: ['Traditional'],         tags: ['event', 'portrait'],           location: 'Rajkot, IN', venue: 'Imperial Palace',          notes: '' },
  { id: 'J005', title: 'Coastal Elopement',        client: 'Alex & Jordan Kim',  date: '2026-06-02', budget: 34000, status: 'open',        assignedTo: null, roles: ['Candid'],              tags: ['wedding', 'intimate', 'outdoor'], location: 'Ahmedabad, IN',   venue: 'Sabarmati Riverfront',    notes: 'Sunrise shoot, 6AM start' },
  { id: 'J006', title: 'Bloom Brand Campaign',     client: 'Bloom Cosmetics',    date: '2026-05-22', budget: 89000, status: 'assigned',    assignedTo: 3, roles: ['Candid', 'Traditional'], tags: ['commercial', 'beauty'],        location: 'Surat, IN',        venue: 'Dumas Beach',  notes: 'Full day, studio + location' },
  { id: 'J007', title: 'Park Family Session',      client: 'The Park Family',    date: '2026-04-15', budget: 8500,  status: 'completed',   assignedTo: 5, roles: ['Candid'],              tags: ['family', 'portrait'],          location: 'Ahmedabad, IN', venue: 'Kankaria Lake',     notes: '' },
  { id: 'J008', title: 'Rooftop Engagement',       client: 'Zara & Finn Cole',   date: '2026-06-08', budget: 16000, status: 'open',        assignedTo: null, roles: ['Candid'],              tags: ['engagement', 'urban'],         location: 'Vadodara, IN',     venue: 'Sayaji Hotel Roof',notes: 'Blue hour preferred' },
  { id: 'J009', title: 'Aerial Estate Survey',     client: 'Prestige Realty',    date: '2026-05-28', budget: 32000, status: 'assigned',    assignedTo: 6, roles: ['Drone'],               tags: ['drone', 'real estate'],        location: 'Rajkot, IN',       venue: 'Race Course Ring Road', notes: '4K footage + stills' },
  { id: 'J010', title: 'Jazz Festival Coverage',   client: 'NewPort Music Fest', date: '2026-06-14', budget: 26000, status: 'open',        assignedTo: null, roles: ['Candid'],              tags: ['event', 'music'],              location: 'Ahmedabad, IN',      venue: 'Sardar Patel Stadium', notes: '3-day coverage' },
  { id: 'J011', title: 'Santana Product Launch',   client: 'Santana Motors',     date: '2026-05-30', budget: 120000,status: 'in_progress', assignedTo: 1, roles: ['Drone', 'Candid'],      tags: ['commercial', 'automotive'],    location: 'Surat, IN',  venue: 'VR Mall Event Space',     notes: '' },
  { id: 'J012', title: 'Yuki Maternity',           client: 'Yuki Tanaka',        date: '2026-06-01', budget: 9500,  status: 'open',        assignedTo: null, roles: ['Traditional'],         tags: ['maternity', 'portrait'],       location: 'Ahmedabad, IN',           venue: 'Lumière Studio',     notes: 'In-studio, natural light' },
  { id: 'J013', title: 'Villa Paradiso Elopement', client: 'Emma & Louis Petit', date: '2026-07-12', budget: 52000, status: 'open',        assignedTo: null, roles: ['Traditional', 'Drone'], tags: ['wedding', 'outdoor'],         location: 'Vadodara, IN',      venue: 'Sursagar Lake',        notes: 'Sunset ceremony 7PM' },
  { id: 'J014', title: 'Summit Tech Conference',   client: 'GlobeTech Inc.',     date: '2026-07-20', budget: 38000, status: 'open',        assignedTo: null, roles: ['Candid', 'Traditional'], tags: ['corporate', 'event'],        location: 'Ahmedabad, IN', venue: 'Mahatma Mandir',      notes: '2-day event, 500 attendees' },
  { id: 'J015', title: 'Surat Corporate Gala',     client: 'Reliance Ind.',      date: '2026-06-15', budget: 45000, status: 'open',        assignedTo: null, roles: ['Corporate'],           tags: ['corporate', 'black-tie'],      location: 'Surat, IN',        venue: 'Avadh Utopia',     notes: 'CEO arrival shots mandatory' },
  { id: 'J016', title: 'Ahmedabad Sangeet Night',  client: 'Mehta Family',       date: '2026-06-18', budget: 32000, status: 'open',        assignedTo: null, roles: ['Videographer'],        tags: ['wedding', 'dance'],            location: 'Ahmedabad, IN',    venue: 'Karnavati Club',   notes: 'Focus on dance performances' },
  { id: 'J017', title: 'Vadodara Fashion Reel',    client: 'Nandini Boutique',   date: '2026-06-22', budget: 15000, status: 'open',        assignedTo: null, roles: ['Reel Expert'],         tags: ['fashion', 'reels'],            location: 'Vadodara, IN',     venue: 'In-Studio',        notes: '10 cinematic reels for IG' },
  { id: 'J018', title: 'Rajkot Palace Wedding',    client: 'Goyal & Singh',      date: '2026-07-05', budget: 68000, status: 'open',        assignedTo: null, roles: ['Drone', 'Traditional'], tags: ['wedding', 'luxury'],           location: 'Rajkot, IN',       venue: 'The Imperial Palace', notes: 'Grand entries from air' },
];

// ─── Mock Job Requests ────────────────────────────────────────────────────────
export const mockJobRequests = [
  { id: 'REQ001', jobId: 'J002', jobTitle: 'Chen Corporate Headshots', sentBy: 'Alex Morgan', sentTo: 'Sofia Reyes',  role: 'Traditional', date: '2026-05-20', venue: 'Diamond Bourse', budget: 18000, payment: null, status: 'pending',  sentAt: '2026-05-03T09:00:00Z', respondedAt: null, notes: 'Need top-tier executive portraits' },
  { id: 'REQ002', jobId: 'J005', jobTitle: 'Coastal Elopement',        sentBy: 'Alex Morgan', sentTo: 'Lena Müller',  role: 'Candid',      date: '2026-06-02', venue: 'Sabarmati Riverfront',  budget: 34000, payment: null, status: 'pending',  sentAt: '2026-05-03T10:30:00Z', respondedAt: null, notes: 'Sunrise, very early start' },
  { id: 'REQ003', jobId: 'J008', jobTitle: 'Rooftop Engagement',       sentBy: 'Alex Morgan', sentTo: 'Marcus Chen',  role: 'Candid',      date: '2026-06-08', venue: 'Sayaji Hotel Roof', budget: 16000, payment: 14000, status: 'accepted', sentAt: '2026-05-01T14:00:00Z', respondedAt: '2026-05-01T16:00:00Z', notes: '' },
  { id: 'REQ004', jobId: 'J010', jobTitle: 'Jazz Festival Coverage',   sentBy: 'Alex Morgan', sentTo: 'Priya Nair',   role: 'Candid',      date: '2026-06-14', venue: 'Sardar Patel Stadium',    budget: 26000, payment: null, status: 'declined', sentAt: '2026-04-30T11:00:00Z', respondedAt: '2026-04-30T13:00:00Z', notes: '' },
  { id: 'REQ005', jobId: 'J012', jobTitle: 'Yuki Maternity',           sentBy: 'Alex Morgan', sentTo: 'Sofia Reyes',  role: 'Traditional', date: '2026-06-01', venue: 'Lumière Studio',   budget: 9500,  payment: null, status: 'pending',  sentAt: '2026-05-03T11:00:00Z', respondedAt: null, notes: 'Natural light specialist needed' },
  { id: 'REQ006', jobId: 'J013', jobTitle: 'Villa Paradiso Elopement', sentBy: 'Alex Morgan', sentTo: 'Diego Santos', role: 'Drone',       date: '2026-07-12', venue: 'Sursagar Lake',      budget: 52000, payment: null, status: 'pending',  sentAt: '2026-05-03T08:00:00Z', respondedAt: null, notes: 'Drone coverage of ceremony' },
  { id: 'REQ007', jobId: 'J014', jobTitle: 'Summit Tech Conference',   sentBy: 'Alex Morgan', sentTo: 'James Okafor', role: 'Traditional', date: '2026-07-20', venue: 'Mahatma Mandir',     budget: 38000, payment: 35000, status: 'accepted', sentAt: '2026-05-02T09:00:00Z', respondedAt: '2026-05-02T10:30:00Z', notes: '' },
  { id: 'REQ008', jobId: 'J001', jobTitle: 'Sorrento Wedding',         sentBy: 'Alex Morgan', sentTo: 'Marcus Chen',  role: 'Candid',      date: '2026-05-18', venue: 'Taj Skyline',   budget: 42000, payment: null, status: 'declined', sentAt: '2026-04-28T15:00:00Z', respondedAt: '2026-04-28T18:00:00Z', notes: 'Conflict with personal booking' },
  { id: 'REQ009', jobId: 'J015', jobTitle: 'Surat Corporate Gala',     sentBy: 'Alex Morgan', sentTo: 'Karan Mehta',   role: 'Corporate',   date: '2026-06-15', venue: 'Avadh Utopia',     budget: 45000, payment: null, status: 'pending',  sentAt: '2026-05-04T09:00:00Z', respondedAt: null, notes: 'Need formal coverage' },
  { id: 'REQ010', jobId: 'J016', jobTitle: 'Ahmedabad Sangeet Night',  sentBy: 'Alex Morgan', sentTo: 'Arjun Varma',   role: 'Videographer',date: '2026-06-18', venue: 'Karnavati Club',   budget: 32000, payment: null, status: 'pending',  sentAt: '2026-05-04T10:00:00Z', respondedAt: null, notes: 'Capture all dance moves' },
  { id: 'REQ011', jobId: 'J017', jobTitle: 'Vadodara Fashion Reel',    sentBy: 'Alex Morgan', sentTo: 'Ishani Bhatt',  role: 'Reel Expert', date: '2026-06-22', venue: 'In-Studio',        budget: 15000, payment: null, status: 'pending',  sentAt: '2026-05-04T11:00:00Z', respondedAt: null, notes: 'Focus on vertical video' },
];

// ─── Calendar Role Assignments ────────────────────────────────────────────────
export const mockCalendarRoles = {
  '2026-05-18': ['Traditional', 'Candid'],
  '2026-05-20': ['Traditional'],
  '2026-05-22': ['Candid', 'Traditional'],
  '2026-05-25': ['Candid', 'Traditional'],
  '2026-05-28': ['Drone'],
  '2026-05-30': ['Drone', 'Candid'],
  '2026-06-01': ['Traditional'],
  '2026-06-02': ['Candid'],
  '2026-06-08': ['Candid'],
  '2026-06-14': ['Candid'],
};

// ─── Mock Calendar Availability ───────────────────────────────────────────────
export const mockAvailability = {
  '2026-05-01': 'booked',  '2026-05-02': 'available', '2026-05-03': 'available',
  '2026-05-05': 'booked',  '2026-05-06': 'partial',   '2026-05-07': 'available',
  '2026-05-08': 'blocked', '2026-05-09': 'blocked',   '2026-05-10': 'available',
  '2026-05-12': 'booked',  '2026-05-14': 'available', '2026-05-15': 'booked',
  '2026-05-16': 'available','2026-05-18': 'booked',   '2026-05-19': 'partial',
  '2026-05-20': 'booked',  '2026-05-21': 'available', '2026-05-22': 'booked',
  '2026-05-23': 'available','2026-05-24': 'available', '2026-05-25': 'booked',
  '2026-05-26': 'partial', '2026-05-27': 'available', '2026-05-28': 'booked',
  '2026-05-29': 'available','2026-05-30': 'booked',   '2026-06-01': 'booked',
  '2026-06-02': 'booked',  '2026-06-05': 'available', '2026-06-08': 'booked',
};

// ─── Freelancer Profile ───────────────────────────────────────────────────────
export const mockFreelancerProfile = {
  bio: 'Lifestyle & wedding photographer with 5+ years of experience capturing authentic moments. Specialising in natural light and candid storytelling across three continents.',
  skills: ['Wedding', 'Portrait', 'Editorial', 'Street', 'Documentary'],
  specialties: ['Candid', 'Traditional'],
  equipment: [
    { id: 1, name: 'Sony A7R V',         type: 'Camera'    },
    { id: 2, name: 'Canon 85mm f/1.4',   type: 'Lens'      },
    { id: 3, name: 'Sony 24-70mm f/2.8', type: 'Lens'      },
    { id: 4, name: 'DJI Mavic 3 Pro',    type: 'Drone'     },
    { id: 5, name: 'Profoto B10',        type: 'Lighting'  },
  ],
  yearsExperience: 5,
  instagramHandle: '@alex.lumiere',
  portfolioUrl: 'lumiere.io/alex',
  availableForBookings: true,
};

// ─── Mock Analytics ────────────────────────────────────────────────────────────
// 36 months of booking trend data (for 1M–3Y range filter)
function buildTrends() {
  const months = [];
  const startDate = new Date(2023, 5, 1); // Jun 2023
  const seeds = [6,8,11,9,13,8,16,7,10,12,11,14, 7,9,12,10,14,9,17,8,11,13,12,15, 8,10,13,11,15,10,18,9,12,14,13,16];
  for (let i = 0; i < 36; i++) {
    const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
    const label = d.toLocaleString('default', { month: 'short' }) + " '" + String(d.getFullYear()).slice(2);
    const base = seeds[i] || 10;
    months.push({
      month: label,
      bookings: base,
      Candid: Math.round(base * 0.42),
      Drone: Math.round(base * 0.22),
      Traditional: Math.round(base * 0.36),
      amount: base * 820 + Math.round(Math.random() * 2000),
      jobs: base,
    });
  }
  return months;
}
export const mockBookingTrends = buildTrends();

export const mockRevenue = mockBookingTrends.slice(-12).map(d => ({ month: d.month, amount: d.amount, jobs: d.jobs }));

export const mockRevenueByRole = [
  { name: 'Traditional', value: 48200, color: '#8B5CF6' },
  { name: 'Candid',      value: 31600, color: '#3B82F6' },
  { name: 'Drone',       value: 18400, color: '#10B981' },
];

export const mockTeamUtilization = [
  { name: 'Sofia Reyes',  percent: 92, jobs: 8 },
  { name: 'Marcus Chen',  percent: 74, jobs: 6 },
  { name: 'Priya Nair',   percent: 88, jobs: 7 },
  { name: 'James Okafor', percent: 61, jobs: 5 },
  { name: 'Lena Müller',  percent: 45, jobs: 4 },
  { name: 'Diego Santos', percent: 79, jobs: 6 },
];

export const mockTopClients = [
  { name: 'Vogue Italia',       jobs: 6, revenue: 34200, satisfaction: 5.0 },
  { name: 'Bloom Cosmetics',    jobs: 4, revenue: 28600, satisfaction: 4.9 },
  { name: 'TechNova Inc.',      jobs: 8, revenue: 14400, satisfaction: 4.7 },
  { name: 'Santana Motors',     jobs: 2, revenue: 24000, satisfaction: 4.8 },
  { name: 'NewPort Music Fest', jobs: 5, revenue: 13000, satisfaction: 4.6 },
];

export const mockBookingSources = [
  { name: 'Instagram', value: 38 },
  { name: 'Direct',    value: 27 },
  { name: 'Referral',  value: 21 },
  { name: 'Platform',  value: 14 },
];

export const mockFreelancerEarnings = mockBookingTrends.slice(-12).map(d => ({
  month: d.month,
  amount: Math.round(d.amount * 0.46),
  jobs: Math.round(d.jobs * 0.48),
}));

// ─── Mock Notifications ────────────────────────────────────────────────────────
export const mockNotifications = [
  { id: 1, type: 'request', message: 'New job request: Chen Corporate Headshots',         time: '2m ago',  read: false },
  { id: 2, type: 'request', message: 'New job request: Coastal Elopement',                time: '1h ago',  read: false },
  { id: 3, type: 'team',    message: 'Marcus Chen accepted Rooftop Engagement',           time: '2h ago',  read: false },
  { id: 4, type: 'payment', message: 'Payment received: ₹42,000 from Isabella Romano',    time: '3h ago',  read: true  },
  { id: 5, type: 'job',     message: 'Milan Fashion Editorial moved to In Progress',      time: '5h ago',  read: true  },
  { id: 6, type: 'team',    message: 'Priya Nair declined Jazz Festival Coverage',        time: '1d ago',  read: true  },
];

// ─── Initial Global State ─────────────────────────────────────────────────────
export const initialState = {
  user: {
    name: 'Alex Morgan',
    email: 'alex@lumiere.io',
    phone: '+91 98765 01822',
    mode: 'studio_owner',     // 'studio_owner' | 'freelancer'
    authority: 'manager',     // 'manager' | 'staff'
    isOnTrial: true,
    trialDaysLeft: 11,
    trialModalDismissed: false,
    studioName: 'Lumière Studio',
    studioLocation: 'Ahmedabad, Gujarat',
    studioEmail: 'studio@lumiere.io',
    rolesOffered: ['Candid', 'Traditional', 'Drone'],
  },
  team: mockTeam,
  jobs: mockJobs,
  jobRequests: mockJobRequests,
  calendarRoles: mockCalendarRoles,
  availability: mockAvailability,
  freelancerProfile: mockFreelancerProfile,
  analytics: {
    revenue: mockRevenue,
    bookingTrends: mockBookingTrends,
    revenueByRole: mockRevenueByRole,
    teamUtilization: mockTeamUtilization,
    topClients: mockTopClients,
    bookingSources: mockBookingSources,
    freelancerEarnings: mockFreelancerEarnings,
    totalRevenue: 112400,
    jobsThisMonth: 14,
    growthRate: 18.4,
    clientSatisfaction: 4.8,
    avgJobValue: 3847,
    totalJobsCompleted: 193,
    responseRate: 94,
    acceptRate: 87,
  },
  jobTasks: [
    { id: 1, jobId: 'J001', text: 'Confirm arrival time with venue', completed: true },
    { id: 2, jobId: 'J001', text: 'Check battery levels for all cameras', completed: false },
    { id: 3, jobId: 'J002', text: 'Prepare lighting setup for corporate portraits', completed: false },
    { id: 4, jobId: 'J002', text: 'Get list of executives for headshots', completed: true },
    { id: 5, jobId: 'J003', text: 'Coordinate with makeup artists and stylists', completed: false },
    { id: 6, jobId: 'J003', text: 'Scout locations at Laxmi Vilas Palace', completed: true },
    { id: 7, jobId: 'J004', text: 'Edit and deliver final photo album', completed: false },
    { id: 8, jobId: 'J005', text: 'Check weather forecast for sunrise shoot', completed: false },
    { id: 9, jobId: 'J006', text: 'Rent additional lighting equipment', completed: true },
    { id: 10, jobId: 'J008', text: 'Confirm rooftop access permissions', completed: false },
    { id: 11, jobId: 'J009', text: 'Ensure drone permits are approved', completed: true },
    { id: 12, jobId: 'J010', text: 'Prepare press pass for 3-day coverage', completed: false },
    { id: 13, jobId: 'J013', text: 'Verify sunset times for ceremony', completed: false },
  ],
  notifications: mockNotifications,
  toasts: [],
};
