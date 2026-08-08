// backend/services/generateData.js
// Synthetic CSV Data Generator for Smart Leads Agent for Hoardings
// Generates realistic hoardings, bookings, and customer datasets with clean edge-cases.

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 1. Generate 300 Hoardings
const LOCATIONS = [
  { zone: 'Financial District', lat: 19.0657, lng: 72.8687, demo: 'Corporate, Banking, Tech' },
  { zone: 'Bandra Retail Hub', lat: 19.0596, lng: 72.8295, demo: 'Shopping, Fashion, Youth' },
  { zone: 'Western Express Highway', lat: 19.1176, lng: 72.8481, demo: 'Automotive, Real Estate, Telecom' },
  { zone: 'Airport Approach Road', lat: 19.0968, lng: 72.8530, demo: 'Travel, Luxury, Banking' },
  { zone: 'Lower Parel Tech Park', lat: 19.0010, lng: 72.8270, demo: 'SaaS, Finance, Lifestyle' },
  { zone: 'Andheri Commercial Hub', lat: 19.1197, lng: 72.8464, demo: 'FMCG, Education, Healthcare' },
  { zone: 'South Mumbai Heritage Corridor', lat: 18.9388, lng: 72.8353, demo: 'Jewelry, Luxury, High Net Worth' },
  { zone: 'Navi Mumbai Expressway', lat: 19.0330, lng: 73.0297, demo: 'Logistics, E-commerce, Auto' }
];

const SIZES = ['20x40 ft', '30x60 ft', '15x30 ft', '40x80 ft (Unipole)', '25x50 ft (Digital LED)'];

function generateHoardings() {
  const hoardings = [];
  for (let i = 1; i <= 300; i++) {
    const loc = LOCATIONS[i % LOCATIONS.length];
    const size = SIZES[i % SIZES.length];
    const isDigital = size.includes('Digital') || i % 4 === 0;
    const trafficScore = Math.floor(65 + Math.random() * 32); // 65 - 97
    const dailyImpressions = trafficScore * 1250 + Math.floor(Math.random() * 5000);
    
    // Monthly rate ranges from $5,000 to $25,000
    const baseRate = trafficScore * 180 + (isDigital ? 5000 : 0);
    const monthlyRate = Math.round(baseRate / 500) * 500; // round to nearest 500

    // Add small random offset to lat/lng for map display
    const latOffset = (Math.random() - 0.5) * 0.08;
    const lngOffset = (Math.random() - 0.5) * 0.08;

    hoardings.push({
      site_id: `HRD-${100 + i}`,
      location_name: `${loc.zone} - Site #${i}`,
      zone: loc.zone,
      latitude: (loc.lat + latOffset).toFixed(5),
      longitude: (loc.lng + lngOffset).toFixed(5),
      size: size,
      traffic_score: trafficScore,
      daily_impressions: dailyImpressions,
      monthly_rate: monthlyRate,
      site_type: isDigital ? 'Digital Billboard' : 'Static Unipole',
      target_demographic: loc.demo
    });
  }
  return hoardings;
}

// 2. Generate 80 Customers
const INDUSTRIES = [
  'Banking & Finance', 'Retail & Fashion', 'Automotive', 'Real Estate',
  'FMCG', 'Tech & SaaS', 'Healthcare & Pharma', 'E-Commerce', 'Luxury & Jewelry'
];

const CUSTOMER_NAMES = [
  'Apex Global Bank', 'Vanguard Motors', 'Zenith Real Estate', 'Starlight Fashion',
  'Nova Tech Solutions', 'PureLife Pharma', 'UrbanCart E-Com', 'Crown Luxury Goods',
  'Optima Financial', 'Titan Auto Corp', 'Skyline Infra', 'Velvet Couture',
  'CloudPulse Systems', 'BioCare Health', 'ShopMatrix', 'Aura Fine Jewelry',
  'Horizon Capital', 'DriveX Mobility', 'Metropolis Heights', 'Knit & Thread',
  'HyperScale AI', 'MedTech Solutions', 'QuickDeliver App', 'Gilded Gems',
  'FirstNational Wealth', 'Velocity EV', 'Grandeur Estates', 'Chic Threads',
  'DataSphere Cloud', 'Helix Wellness', 'SwiftCart Global', 'Imperial Diamond Co',
  'Summit Investment', 'Apex Heavy Electric', 'Pinnacle Living', 'Moda Elegance',
  'CyberGuard Tech', 'Vitality Health', 'FlexiOrder Retail', 'Luxe Timepieces',
  'Pioneer Financial', 'EcoDrive Mobility', 'Prestige Towers', 'Glamour Trends',
  'CodeCraft Inc', 'Quantum Labs', 'PrimeMart Retail', 'Elegance Fine Arts',
  'Crestline Insurance', 'Falcon Logistics', 'Vista Reality', 'TrendSet Clothing',
  'ByteSpeed Net', 'AeroCare Global', 'BargainBox Superstore', 'Monarch Jewels',
  'Veritas Asset Management', 'Torque Motors', 'Urban Residency', 'Silken Apparel',
  'InfiniCloud AI', 'Sanctuary Healthcare', 'DirectBazaar', 'Royal Gemological',
  'Anchor Trust Bank', 'Summit Automotive', 'Emerald City Heights', 'Vogue Atelier',
  'NexGen Software', 'CureAll Pharmaceuticals', 'ExpressBuy India', 'Opulent Gold',
  'Capital One Finance', 'Volt Electric', 'Skyline Horizons', 'Prestige Wear',
  'Sync Logic', 'CareFirst Clinics', 'SuperMart Hypermarket', 'Majestic Gold & Diamond'
];

function generateCustomers() {
  const customers = [];
  const referenceDate = new Date('2026-08-01');

  for (let i = 0; i < CUSTOMER_NAMES.length; i++) {
    const customerId = `CUST-${200 + i + 1}`;
    const name = CUSTOMER_NAMES[i];
    const industry = INDUSTRIES[i % INDUSTRIES.length];
    
    // Budget Band: Tier 1 ($20k+), Tier 2 ($12k-$20k), Tier 3 ($5k-$12k)
    let budgetTier, maxBudget;
    if (i % 3 === 0) {
      budgetTier = 'Tier 1 (Premium: $20,000+)';
      maxBudget = 25000 + Math.floor(Math.random() * 10000);
    } else if (i % 3 === 1) {
      budgetTier = 'Tier 2 (Standard: $12,000 - $20,000)';
      maxBudget = 12000 + Math.floor(Math.random() * 7000);
    } else {
      budgetTier = 'Tier 3 (Budget: $5,000 - $12,000)';
      maxBudget = 5000 + Math.floor(Math.random() * 6000);
    }

    const relationshipScore = Math.floor(40 + Math.random() * 58); // 40 to 98
    
    // Days since last contact (0 to 120 days)
    const daysAgo = Math.floor(Math.random() * 120);
    const lastContact = new Date(referenceDate);
    lastContact.setDate(lastContact.getDate() - daysAgo);

    customers.push({
      customer_id: customerId,
      company_name: name,
      industry: industry,
      budget_tier: budgetTier,
      max_budget_monthly: maxBudget,
      relationship_score: relationshipScore,
      last_contact_date: lastContact.toISOString().split('T')[0],
      days_since_contact: daysAgo,
      is_cold_relationship: daysAgo > 60 || relationshipScore < 55,
      primary_contact: `Contact Person ${i + 1}`,
      email: `contact@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      phone: `+1 (555) ${100 + i}-${2000 + i}`
    });
  }
  return customers;
}

// 3. Generate Bookings (Past & Active)
function generateBookings(hoardings, customers) {
  const bookings = [];
  const refDate = new Date('2026-08-01');
  let bookingCounter = 500;

  hoardings.forEach((site, index) => {
    // Determine vacancy timeline scenario for this site:
    // Scenario 0: Booking ends in 12 days (High Urgency Vacancy within 30d)
    // Scenario 1: Booking ends in 40 days (Medium Urgency Vacancy within 60d)
    // Scenario 2: Booking ends in 75 days (Upcoming Vacancy within 90d)
    // Scenario 3: Booking ends in 180 days (Fully Booked outside 90d)
    // Scenario 4: Ended 5 days ago (Currently vacant)
    
    const scenario = index % 5;
    const custIndex = (index * 7) % customers.length;
    const customer = customers[custIndex];

    let startDate, endDate;

    if (scenario === 0) { // Ends in 12 days (Aug 13)
      startDate = new Date('2026-02-15');
      endDate = new Date('2026-08-13');
    } else if (scenario === 1) { // Ends in 40 days (Sept 10)
      startDate = new Date('2026-03-10');
      endDate = new Date('2026-09-10');
    } else if (scenario === 2) { // Ends in 75 days (Oct 15)
      startDate = new Date('2026-04-15');
      endDate = new Date('2026-10-15');
    } else if (scenario === 3) { // Ends in 180 days (Outside 90d window)
      startDate = new Date('2026-06-01');
      endDate = new Date('2027-01-31');
    } else { // Ended 5 days ago (July 27)
      startDate = new Date('2026-01-20');
      endDate = new Date('2026-07-27');
    }

    bookingCounter++;
    bookings.push({
      booking_id: `BKG-${bookingCounter}`,
      site_id: site.site_id,
      customer_id: customer.customer_id,
      customer_name: customer.company_name,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      monthly_value: site.monthly_rate,
      status: endDate >= refDate ? 'ACTIVE' : 'EXPIRED',
      renewal_intent: customer.relationship_score > 75 ? 'HIGH' : customer.relationship_score > 55 ? 'MEDIUM' : 'LOW'
    });

    // Add historical past booking for affinity matching (1 year prior)
    if (index % 2 === 0) {
      bookingCounter++;
      const pastCust = customers[(custIndex + 3) % customers.length];
      const pStart = new Date(startDate);
      pStart.setFullYear(pStart.getFullYear() - 1);
      const pEnd = new Date(endDate);
      pEnd.setFullYear(pEnd.getFullYear() - 1);

      bookings.push({
        booking_id: `BKG-${bookingCounter}`,
        site_id: site.site_id,
        customer_id: pastCust.customer_id,
        customer_name: pastCust.company_name,
        start_date: pStart.toISOString().split('T')[0],
        end_date: pEnd.toISOString().split('T')[0],
        monthly_value: site.monthly_rate * 0.95,
        status: 'EXPIRED',
        renewal_intent: 'COMPLETED'
      });
    }
  });

  return bookings;
}

// Convert objects to CSV string
function toCSV(arr) {
  if (!arr || !arr.length) return '';
  const headers = Object.keys(arr[0]);
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of arr) {
    const values = headers.map(header => {
      const val = row[header] === undefined || row[header] === null ? '' : row[header];
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  return csvRows.join('\n');
}

function runGenerator() {
  console.log('Generating synthetic dataset...');
  const hoardings = generateHoardings();
  const customers = generateCustomers();
  const bookings = generateBookings(hoardings, customers);

  fs.writeFileSync(path.join(DATA_DIR, 'hoardings.csv'), toCSV(hoardings));
  fs.writeFileSync(path.join(DATA_DIR, 'customers.csv'), toCSV(customers));
  fs.writeFileSync(path.join(DATA_DIR, 'bookings.csv'), toCSV(bookings));

  console.log(`Successfully generated:
- ${hoardings.length} Hoardings in hoardings.csv
- ${customers.length} Customers in customers.csv
- ${bookings.length} Bookings in bookings.csv`);
}

if (require.main === module) {
  runGenerator();
}

module.exports = { runGenerator, generateHoardings, generateCustomers, generateBookings, toCSV };
