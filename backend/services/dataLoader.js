// backend/services/dataLoader.js
/**
 * CSV Data Loader & Normalizer Service
 * ------------------------------------
 * EXPLAINABLE ARCHITECTURE:
 * Reads hoardings.csv, bookings.csv, and customers.csv.
 * Normalizes field names across sample dataset schemas:
 * - hoardings: site_id, location, size_sqft, traffic_score, monthly_rate_inr, latitude, longitude, zone
 * - customers: customer_id, name, industry, budget_band, relationship_score, last_contact_date
 * - bookings: booking_id, site_id, customer_id, start_date, end_date, value_inr
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

function parseCSV(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  const headers = parseCSVRow(lines[0]);
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVRow(lines[i]);
    if (values.length === headers.length) {
      const obj = {};
      headers.forEach((header, index) => {
        const cleanHeader = header.trim();
        let val = values[index].trim();
        if (!isNaN(val) && val !== '') {
          val = Number(val);
        } else if (val === 'true' || val === 'TRUE') {
          val = true;
        } else if (val === 'false' || val === 'FALSE') {
          val = false;
        }
        obj[cleanHeader] = val;
      });
      results.push(obj);
    }
  }
  return results;
}

function parseCSVRow(rowText) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < rowText.length; i++) {
    const char = rowText[i];
    if (char === '"' && (i === 0 || rowText[i - 1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.replace(/^"|"$/g, '').trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.replace(/^"|"$/g, '').trim());
  return result;
}

function loadAllData() {
  const hoardingsPath = path.join(DATA_DIR, 'hoardings.csv');
  const bookingsPath = path.join(DATA_DIR, 'bookings.csv');
  const customersPath = path.join(DATA_DIR, 'customers.csv');

  const hoardingsText = fs.readFileSync(hoardingsPath, 'utf8');
  const bookingsText = fs.readFileSync(bookingsPath, 'utf8');
  const customersText = fs.readFileSync(customersPath, 'utf8');

  const rawHoardings = parseCSV(hoardingsText);
  const rawBookings = parseCSV(bookingsText);
  const rawCustomers = parseCSV(customersText);

  // Normalize Hoardings
  const hoardings = rawHoardings.map(h => {
    const monthlyRate = Number(h.monthly_rate_inr || h.monthly_rate || 180000);
    const trafficScore = Number(h.traffic_score || 8.0);
    // Convert 1-10 traffic scale to 1-100 & daily impressions
    const scaledTraffic = trafficScore <= 10 ? Math.round(trafficScore * 10) : trafficScore;
    const dailyImpressions = scaledTraffic * 12500;

    return {
      site_id: h.site_id,
      location_name: h.location || h.location_name || 'Mumbai Highway Billboard',
      zone: h.zone || (h.location ? h.location.split(' ')[0] : 'Western Suburbs'),
      latitude: h.latitude || 19.0760,
      longitude: h.longitude || 72.8777,
      size: h.size_sqft ? `${h.size_sqft} sq ft` : (h.size || '800 sq ft'),
      traffic_score: scaledTraffic,
      daily_impressions: dailyImpressions,
      monthly_rate: monthlyRate,
      site_type: (h.size_sqft && h.size_sqft >= 800) ? 'Digital LED Unipole' : 'Static Billboard',
      target_demographic: 'High Traffic Urban Commuters & Commercial Decision Makers'
    };
  });

  // Normalize Customers
  const customers = rawCustomers.map(c => {
    let maxBudget = Number(c.max_budget_monthly || 0);
    const budgetBand = (c.budget_band || '').toLowerCase();

    if (maxBudget <= 0) {
      if (budgetBand === 'high') maxBudget = 500000;
      else if (budgetBand === 'mid' || budgetBand === 'medium') maxBudget = 250000;
      else maxBudget = 150000;
    }

    const relScore = Number(c.relationship_score || 5);
    const scaledRelScore = relScore <= 10 ? Math.round(relScore * 10) : relScore;
    const lastContactStr = c.last_contact_date || '2026-05-01';
    
    // Calculate days since contact from 2026-08-01
    const refDate = new Date('2026-08-01');
    const contactDate = new Date(lastContactStr);
    const diffMs = refDate.getTime() - contactDate.getTime();
    const daysAgo = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    return {
      customer_id: c.customer_id,
      company_name: c.name || c.company_name || c.customer_id,
      industry: c.industry || 'General Commerce',
      budget_tier: c.budget_band ? `Tier (${c.budget_band.toUpperCase()})` : 'Tier (MID)',
      max_budget_monthly: maxBudget,
      relationship_score: scaledRelScore,
      last_contact_date: lastContactStr,
      days_since_contact: daysAgo,
      is_cold_relationship: daysAgo > 60 || scaledRelScore < 50,
      primary_contact: `Brand Manager (${c.name || c.customer_id})`,
      email: `marketing@${(c.name || c.customer_id).toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      phone: `+91 98200 ${Math.floor(10000 + Math.random() * 90000)}`
    };
  });

  // Normalize Bookings
  const custMap = new Map(customers.map(c => [c.customer_id, c.company_name]));
  const bookings = rawBookings.map(b => {
    return {
      booking_id: b.booking_id,
      site_id: b.site_id,
      customer_id: b.customer_id,
      customer_name: custMap.get(b.customer_id) || b.customer_id,
      start_date: b.start_date,
      end_date: b.end_date,
      monthly_value: Number(b.value_inr || 150000),
      status: new Date(b.end_date) >= new Date('2026-08-01') ? 'ACTIVE' : 'EXPIRED',
      renewal_intent: 'MEDIUM'
    };
  });

  return { hoardings, bookings, customers };
}

module.exports = { parseCSV, loadAllData };
