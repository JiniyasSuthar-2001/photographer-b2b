import { GUJARAT_CITIES } from './gujaratCities';

const NAMES = [
  'Aarav Patel', 'Aanya Shah', 'Arjun Mehta', 'Aditi Desai', 'Ishaan Joshi', 
  'Ananya Trivedi', 'Vivaan Gandhi', 'Myra Jani', 'Vihaan Rathod', 'Kavya Solanki',
  'Aditya Bhatt', 'Saanvi Vyas', 'Reyansh Dave', 'Kyra Parmar', 'Aryan Chauhan',
  'Diya Vaghela', 'Kabir Makwana', 'Anika Gadhvi', 'Ayaan Barot', 'Zoya Jadeja',
  'Rohan Sanghavi', 'Ishani Mistry', 'Shaurya Panchal', 'Aavya Soni', 'Dev Kothari',
  'Siya Parekh', 'Atharv Gajjar', 'Navya Kansara', 'Krish Chokshi', 'Riya Modi',
  'Vedant Thakar', 'Amara Rawal', 'Eshan Kulkarni', 'Sara Iyer', 'Aman Hegde',
  'Tara Reddy', 'Neil Kapoor', 'Inaya Khanna', 'Yash Malhotra', 'Sana Singhal',
  'Rishi Gupta', 'Alisha Verma', 'Manav Saxena', 'Kiara Bansal', 'Karan Mehra',
  'Tanya Oberoi', 'Varun Bajaj', 'Rhea Grover', 'Sid Mittal', 'Avni Jain'
];

const ROLES = ['Candid', 'Traditional', 'Drone', 'Videographer', 'Reel Expert', 'Corporate'];

function generatePool() {
  const pool = [];
  for (let i = 1; i <= 100; i++) {
    const firstName = NAMES[i % NAMES.length];
    const lastName = NAMES[(i + 5) % NAMES.length].split(' ')[1];
    const name = `${firstName.split(' ')[0]} ${lastName}`;
    const city = GUJARAT_CITIES[i % GUJARAT_CITIES.length];
    const roleCount = (i % 3) + 1;
    const specialties = [];
    for(let r=0; r<roleCount; r++) {
      const role = ROLES[(i + r) % ROLES.length];
      if(!specialties.includes(role)) specialties.push(role);
    }
    
    pool.push({
      id: `POOL_${i}`,
      name,
      city,
      phone: `+91 ${9800000000 + i + Math.floor(Math.random() * 1000000)}`,
      specialties,
      rating: (4 + Math.random()).toFixed(1),
      jobsCompleted: Math.floor(Math.random() * 100),
      equipment: ['Sony A7 IV', 'DJI Mavic 3', 'Canon EOS R6'].slice(0, (i % 2) + 1)
    });
  }
  return pool;
}

export const photographerPool = generatePool();
