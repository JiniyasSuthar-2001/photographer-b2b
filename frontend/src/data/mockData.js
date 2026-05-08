// ─── Role Types ───────────────────────────────────────────────────────────────
export const ROLE_TYPES = {
  'Candid': { color: '#10B981', bg: 'rgba(16,185,129,0.12)', label: 'Candid' },
  'Traditional': { color: '#F43F5E', bg: 'rgba(244,63,94,0.12)', label: 'Traditional' },
  'Wedding': { color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', label: 'Wedding' },
  'Corporate': { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', label: 'Corporate' },
  'Event': { color: '#10B981', bg: 'rgba(16,185,129,0.12)', label: 'Event' },
  'Portrait': { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'Portrait' },
  'Lead': { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', label: 'Lead' },
  'Drone': { color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', label: 'Drone' },
  'Reel': { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'Reel' },
  'Other': { color: '#64748b', bg: 'rgba(100,116,139,0.12)', label: 'Other' },
};

// ─── Mock Team Members ────────────────────────────────────────────────────────
export const mockTeam = [
  { id: 1, name: 'Sofia Reyes',   role: 'Lead',     status: 'available', jobsCompleted: 47, rating: 4.9, joinedDate: '2024-02-10', color: '#3B82F6', specialties: ['Candid', 'Lead'], city: 'Ahmedabad', phone: '+91 91234 56780', equipment: ['Sony A7R V', '24-70mm lens'] },
  { id: 2, name: 'Marcus Chen',   role: 'Candid', status: 'busy',      jobsCompleted: 23, rating: 4.7, joinedDate: '2024-06-15', color: '#8B5CF6', specialties: ['Candid'], city: 'Surat', phone: '+91 91234 56781', equipment: ['Canon R5'] },
  { id: 3, name: 'Priya Nair',    role: 'Event',           status: 'available', jobsCompleted: 31, rating: 4.8, joinedDate: '2024-03-22', color: '#2DD4BF', specialties: ['Event'], city: 'Baroda', phone: '+91 91234 56782', equipment: ['Panasonic GH6'] },
  { id: 4, name: 'James Okafor',  role: 'Portrait',                 status: 'offline',   jobsCompleted: 58, rating: 4.6, joinedDate: '2023-11-01', color: '#F59E0B', specialties: ['Portrait'], city: 'Rajkot', phone: '+91 91234 56783', equipment: ['MacBook Pro'] },
  { id: 5, name: 'Lena Müller',   role: 'Candid',         status: 'available', jobsCompleted: 15, rating: 4.5, joinedDate: '2025-01-18', color: '#F43F5E', specialties: ['Candid'], city: 'Ahmedabad', phone: '+91 91234 56784', equipment: ['Nikon Z6 II'] },
  { id: 6, name: 'Diego Santos',  role: 'Drone',         status: 'busy',      jobsCompleted: 19, rating: 4.9, joinedDate: '2024-09-05', color: '#10B981', specialties: ['Drone'], city: 'Surat', phone: '+91 91234 56785', equipment: ['DJI Mavic 3'] },
];

// ─── Mock Jobs ────────────────────────────────────────────────────────────────
export const mockJobs = [
  { id: 'J001', title: 'Sorrento Wedding',        client: 'Isabella Romano',    date: '2026-05-18', budget: 42000, status: 'assigned',    assignedTo: 1, category: 'Wedding', roles: ['Lead', 'Candid', 'Drone'], tags: ['wedding', 'outdoor'],          location: 'Ahmedabad, IN',    venue: 'Taj Skyline',     notes: 'Golden hour shoot, ceremony at 5PM' },
  { id: 'J002', title: 'Chen Corporate Headshots', client: 'TechNova Inc.',      date: '2026-05-20', budget: 18000, status: 'open',        assignedTo: null, category: 'Corporate', roles: ['Lead', 'Portrait'],         tags: ['corporate', 'portrait'],       location: 'Surat, IN',        venue: 'Diamond Bourse',   notes: '25 executives, 2 hour session' },
  { id: 'J003', title: 'Milan Fashion Editorial',  client: 'Vogue Italia',       date: '2026-05-25', budget: 65000, status: 'in_progress', assignedTo: 3, category: 'Event', roles: ['Lead', 'Candid'], tags: ['fashion', 'editorial'],        location: 'Baroda, IN',        venue: 'Laxmi Vilas Palace',     notes: 'Spring collection, 8 outfits' },
];

// ─── Mock Job Requests ────────────────────────────────────────────────────────
export const mockJobRequests = [
  { id: 'REQ001', jobId: 'J002', jobTitle: 'Chen Corporate Headshots', sentBy: 'Studio Owner', sentTo: 'Sofia Reyes',  role: 'Traditional', date: '2026-05-20', venue: 'Diamond Bourse', budget: 18000, payment: null, status: 'pending',  sentAt: '2026-05-03T09:00:00Z', respondedAt: null, notes: 'Need top-tier executive portraits' },
  { id: 'REQ003', jobId: 'J008', jobTitle: 'Rooftop Engagement',       sentBy: 'Studio Owner', sentTo: 'Marcus Chen',  role: 'Candid',      date: '2026-06-08', venue: 'Sayaji Hotel Roof', budget: 16000, payment: 14000, status: 'accepted', sentAt: '2026-05-01T14:00:00Z', respondedAt: '2026-05-01T16:00:00Z', notes: '' },
];

// ─── Calendar Role Assignments ────────────────────────────────────────────────
export const mockCalendarRoles = {
  '2026-05-18': ['Wedding', 'Candid'],
  '2026-05-20': ['Lead'],
};

// ─── Mock Calendar Availability ───────────────────────────────────────────────
export const mockAvailability = {
  '2026-05-01': 'booked',  '2026-05-02': 'available', '2026-05-03': 'available',
  '2026-05-18': 'booked',  '2026-05-20': 'booked',
};

// ─── Photographer Profile ───────────────────────────────────────────────────────
export const mockPhotographerProfile = {
  bio: 'Lifestyle & wedding photographer with 10+ years of experience capturing authentic moments. Specialising in natural light and candid storytelling across three continents.',
  skills: ['Wedding', 'Portrait', 'Editorial', 'Street', 'Documentary'],
  specialties: ['Candid', 'Traditional'],
  equipment: [
    { id: 1, name: 'Sony A7R V',         type: 'Camera'    },
    { id: 2, name: 'Sony 24-70mm f/2.8', type: 'Lens'      },
    { id: 4, name: 'DJI Mavic 3 Pro',    type: 'Drone'     },
  ],
  yearsExperience: 10,
  instagramHandle: '@admin.lumiere',
  portfolioUrl: 'lumiere.io/admin',
  availableForBookings: true,
};

// ─── Mock Analytics ────────────────────────────────────────────────────────────
export const mockBookingTrends = Array.from({length: 12}, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    amount: 15000 + Math.random() * 30000,
    jobs: 5 + Math.floor(Math.random() * 10)
}));

export const mockRevenue = mockBookingTrends.map(d => ({ month: d.month, amount: d.amount, jobs: d.jobs }));

export const mockRevenueByRole = [
  { name: 'Wedding', value: 48200, color: '#8B5CF6' },
  { name: 'Candid',      value: 31600, color: '#3B82F6' },
  { name: 'Drone',       value: 18400, color: '#10B981' },
];

export const mockPhotographerEarnings = mockBookingTrends.map(d => ({
  month: d.month,
  amount: Math.round(d.amount * 0.46),
  jobs: Math.round(d.jobs * 0.48),
}));

// ─── Mock Notifications ────────────────────────────────────────────────────────
export const mockNotifications = [
  { id: 1, type: 'job_invite', title: 'New Job Invite', message: 'Chen Corporate Headshots from Studio Owner', created_at: new Date().toISOString(), is_read: false },
  { id: 2, type: 'system', title: 'Payment Received', message: '₹14,000 for Rooftop Engagement', created_at: new Date().toISOString(), is_read: true },
];

// ─── Demo Initial State (ONLY for Admin) ──────────────────────────────────────────
export const demoInitialState = {
  user: {
    full_name: 'System Admin',
    username: 'admin',
    email: 'admin@lumiere.io',
    phone: '+91 00000 00000',
    user_type: 'photographer',
    mode: 'photographer',
    authority: 'manager',
    is_pro: true,
    plan: 'Enterprise',
    is_on_trial: false,
    trialDaysLeft: 0,
    trialModalDismissed: true,
    studioName: 'Lumière Studios',
    studioLocation: 'Ahmedabad',
  },
  team: mockTeam,
  jobs: mockJobs,
  jobRequests: mockJobRequests,
  calendarRoles: mockCalendarRoles,
  availability: mockAvailability,
  photographerProfile: mockPhotographerProfile,
  analytics: {
    revenue: mockRevenue,
    bookingTrends: mockBookingTrends,
    revenueByRole: mockRevenueByRole,
    photographerEarnings: mockPhotographerEarnings,
    totalRevenue: 452000,
    photographerRevenue: 84000,
    jobsThisMonth: 12,
    growthRate: 14.2,
    clientSatisfaction: 4.9,
    utilizationRate: 82,
    avgJobValue: 12500,
    totalJobsCompleted: 28,
    responseRate: 94,
    acceptRate: 87,
  },
  jobTasks: [
    { id: 1, jobId: 'J001', text: 'Confirm arrival time with venue', completed: true },
    { id: 2, jobId: 'J001', text: 'Check battery levels', completed: false },
  ],
  notifications: mockNotifications,
  toasts: [],
};

// ─── Empty Initial State (For Normal Accounts) ──────────────────────────────────
export const emptyInitialState = {
  user: {
    full_name: 'New User',
    email: '',
    phone: '',
    mode: 'photographer',
    authority: 'manager',
    isOnTrial: true,
    trialDaysLeft: 14,
    trialModalDismissed: false,
    studioName: 'My Studio',
    studioLocation: '',
    studioEmail: '',
    rolesOffered: [],
  },
  team: [],
  jobs: [],
  jobRequests: [],
  calendarRoles: {},
  availability: {},
  photographerProfile: {
    bio: '',
    skills: [],
    specialties: [],
    equipment: [],
    yearsExperience: 0,
    instagramHandle: '',
    portfolioUrl: '',
    availableForBookings: true,
  },
  analytics: {
    revenue: [],
    bookingTrends: [],
    revenueByRole: [],
    teamUtilization: [],
    topClients: [],
    bookingSources: [],
    photographerEarnings: [],
    totalRevenue: 0,
    photographerRevenue: 0,
    jobsThisMonth: 0,
    growthRate: 0,
    clientSatisfaction: 0,
    utilizationRate: 0,
    avgJobValue: 0,
    totalJobsCompleted: 0,
    responseRate: 0,
    acceptRate: 0,
  },
  jobTasks: [],
  notifications: [],
  toasts: [],
};

// ─── State Selector Logic ───────────────────────────────────────────────────
export function getAppInitialState(username) {
  // REQUIREMENT: Admin account uses the rich mock environment as a baseline.
  // All other accounts start 100% clean and build data via the database.
  if (username === 'admin') return demoInitialState;
  return emptyInitialState;
}
