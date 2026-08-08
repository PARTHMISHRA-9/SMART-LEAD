// backend/services/dataQualityService.js
/**
 * Data Quality & Health Audit Service
 * ------------------------------------
 * EXPLAINABLE ARCHITECTURE & PHASE 22 REQUIREMENT:
 * Audits hoardings.csv, bookings.csv, and customers.csv datasets for data health:
 * - Missing or invalid budget bands / monthly rates
 * - Invalid lat/lng coordinates
 * - Duplicate customer entries
 * - Booking end dates earlier than start dates
 * - Uncontacted accounts > 90 days
 * 
 * Computes an overall Data Health Score (0 - 100) and detailed audit log.
 */

function auditDataHealth(hoardings, bookings, customers) {
  const issues = [];
  let errorCount = 0;

  // 1. Audit Hoardings
  hoardings.forEach(h => {
    if (!h.monthly_rate || h.monthly_rate <= 0) {
      issues.push({ level: 'ERROR', table: 'hoardings.csv', record_id: h.site_id, message: 'Missing or zero monthly rate card.' });
      errorCount++;
    }
    if (!h.latitude || !h.longitude) {
      issues.push({ level: 'WARNING', table: 'hoardings.csv', record_id: h.site_id, message: 'Missing GPS latitude/longitude coordinates.' });
    }
  });

  // 2. Audit Customers
  const customerIds = new Set();
  customers.forEach(c => {
    if (customerIds.has(c.customer_id)) {
      issues.push({ level: 'ERROR', table: 'customers.csv', record_id: c.customer_id, message: 'Duplicate customer ID detected.' });
      errorCount++;
    }
    customerIds.add(c.customer_id);

    if (!c.max_budget_monthly || c.max_budget_monthly <= 0) {
      issues.push({ level: 'WARNING', table: 'customers.csv', record_id: c.customer_id, message: 'Customer max budget missing or zero.' });
    }
    if (c.days_since_contact > 90) {
      issues.push({ level: 'INFO', table: 'customers.csv', record_id: c.customer_id, message: `Dormant customer account (${c.days_since_contact} days since contact).` });
    }
  });

  // 3. Audit Bookings
  bookings.forEach(b => {
    if (new Date(b.end_date) < new Date(b.start_date)) {
      issues.push({ level: 'ERROR', table: 'bookings.csv', record_id: b.booking_id, message: 'Invalid booking date range: end_date is prior to start_date.' });
      errorCount++;
    }
  });

  // Calculate Data Health Score
  const totalRecords = hoardings.length + customers.length + bookings.length;
  const healthScore = Math.max(0, Math.round(100 - (errorCount * 5) - (issues.length * 0.5)));

  return {
    data_health_score: healthScore,
    status: healthScore >= 85 ? 'HEALTHY' : healthScore >= 70 ? 'WARNING' : 'CRITICAL',
    total_records_scanned: totalRecords,
    total_issues_found: issues.length,
    critical_errors: errorCount,
    issues: issues.slice(0, 20),
    summary: `Scanned ${hoardings.length} sites, ${customers.length} customers, ${bookings.length} bookings. Data health score: ${healthScore}/100.`
  };
}

module.exports = { auditDataHealth };
