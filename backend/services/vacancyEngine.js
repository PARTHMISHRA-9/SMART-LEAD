// backend/services/vacancyEngine.js
/**
 * Vacancy Pipeline Engine
 * -----------------------
 * EXPLAINABLE ARCHITECTURE & VALIDATION RULES:
 * 1. Analyzes site bookings relative to a reference date (default: 2026-08-01).
 * 2. Identifies all sites whose active booking ends within 90 days (0 to 90 days ahead) 
 *    or has already expired without a renewed contract.
 * 3. HARD CONSTRAINT: Ensures no follow-on future booking exists for that site.
 *    If a site has a future booking starting after the current booking's end date, it is NOT vacant.
 * 4. Computes free-from date (end_date + 1 day), urgency tier, and revenue at risk.
 */

/**
 * Calculates vacancies across all hoardings for the next 90 days.
 * @param {Array<Object>} hoardings - List of all 300 hoardings
 * @param {Array<Object>} bookings - History of all bookings
 * @param {string} referenceDateStr - ISO date string (YYYY-MM-DD)
 * @returns {Array<Object>} List of verified vacant hoardings with metadata
 */
function detectVacancies(hoardings, bookings, referenceDateStr = '2026-08-01') {
  const refDate = new Date(referenceDateStr);
  const maxWindowDate = new Date(refDate);
  maxWindowDate.setDate(maxWindowDate.getDate() + 90); // Exact 90-day forward limit

  const vacancies = [];

  // Group bookings by site_id for fast lookup
  const siteBookingsMap = new Map();
  bookings.forEach(b => {
    if (!siteBookingsMap.has(b.site_id)) {
      siteBookingsMap.set(b.site_id, []);
    }
    siteBookingsMap.get(b.site_id).push(b);
  });

  hoardings.forEach(hoarding => {
    const siteBookings = siteBookingsMap.get(hoarding.site_id) || [];
    
    // Sort bookings by end_date descending to find the latest booking
    siteBookings.sort((a, b) => new Date(b.end_date) - new Date(a.end_date));

    const latestBooking = siteBookings[0];

    if (!latestBooking) {
      // Site has no bookings at all -> Vacant immediately
      vacancies.push(createVacancyRecord(hoarding, null, refDate, 'IMMEDIATE_NO_BOOKINGS'));
      return;
    }

    const endDate = new Date(latestBooking.end_date);

    // Rule 1: Check if booking end date falls within the 90-day window
    // (i.e. endDate <= maxWindowDate)
    if (endDate <= maxWindowDate) {
      
      // Rule 2: Verify NO follow-on booking exists starting after this endDate
      const hasFollowOn = siteBookings.some(b => {
        const start = new Date(b.start_date);
        return start > endDate;
      });

      if (!hasFollowOn) {
        // Calculate free-from date (day after current booking ends)
        const freeFrom = new Date(endDate);
        freeFrom.setDate(freeFrom.getDate() + 1);

        // Days until vacant (from reference date)
        const diffMs = endDate.getTime() - refDate.getTime();
        const daysUntilVacant = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        vacancies.push(createVacancyRecord(hoarding, latestBooking, freeFrom, daysUntilVacant));
      }
    }
  });

  // Sort vacancies by urgency (most urgent / fewest days remaining first)
  vacancies.sort((a, b) => a.days_until_vacant - b.days_until_vacant);

  return vacancies;
}

/**
 * Creates a formatted vacancy record with explainable metrics.
 */
function createVacancyRecord(hoarding, latestBooking, freeFromDateObj, daysUntilVacant) {
  let urgencyTier = 'CRITICAL (0-30 Days)';
  let urgencyColor = 'red';
  
  if (daysUntilVacant < 0) {
    urgencyTier = 'OVERDUE / VACANT NOW';
    urgencyColor = 'purple';
  } else if (daysUntilVacant > 60) {
    urgencyTier = 'UPCOMING (61-90 Days)';
    urgencyColor = 'yellow';
  } else if (daysUntilVacant > 30) {
    urgencyTier = 'MODERATE (31-60 Days)';
    urgencyColor = 'orange';
  }

  const freeFromFormatted = freeFromDateObj ? freeFromDateObj.toISOString().split('T')[0] : 'Immediate';
  // Revenue at risk over 3 months if left vacant
  const revenueAtRisk = hoarding.monthly_rate * 3;

  return {
    site_id: hoarding.site_id,
    location_name: hoarding.location_name,
    zone: hoarding.zone,
    latitude: hoarding.latitude,
    longitude: hoarding.longitude,
    size: hoarding.size,
    traffic_score: hoarding.traffic_score,
    daily_impressions: hoarding.daily_impressions,
    monthly_rate: hoarding.monthly_rate,
    site_type: hoarding.site_type,
    target_demographic: hoarding.target_demographic,
    
    // Vacancy Pipeline Specifics
    free_from_date: freeFromFormatted,
    days_until_vacant: daysUntilVacant,
    urgency_tier: urgencyTier,
    urgency_color: urgencyColor,
    revenue_at_risk: revenueAtRisk,
    
    // Incumbent Tenant Info
    incumbent_customer_id: latestBooking ? latestBooking.customer_id : 'None',
    incumbent_customer_name: latestBooking ? latestBooking.customer_name : 'N/A',
    current_booking_end: latestBooking ? latestBooking.end_date : 'N/A',
    incumbent_renewal_intent: latestBooking ? latestBooking.renewal_intent : 'NONE'
  };
}

module.exports = { detectVacancies };
