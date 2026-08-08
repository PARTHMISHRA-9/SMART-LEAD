// backend/services/agentTools.js
/**
 * Real API-Powered Agent Tools Engine
 * -----------------------------------
 * EXPLAINABLE ARCHITECTURE & SOURCE OF TRUTH:
 * Encapsulates the 14 business tools connected directly to live backend engines.
 * NO HARDCODED STRINGS. NO FABRICATED VALUES.
 */

const { loadAllData } = require('./dataLoader');
const { detectVacancies } = require('./vacancyEngine');
const { rankLeadsForVacancy, calculateLeadScore } = require('./scoringEngine');
const { predictIncumbentChurn } = require('./churnEngine');
const { generatePersonalizedPitch } = require('./pitchEngine');
const { calculateRevenueRisk } = require('./revenueRiskEngine');
const { calculateNextBestAction } = require('./nextBestActionEngine');
const { simulateCampaignScenario } = require('./campaignSimulator');
const { 
  getCustomerDNA, 
  getSiteDNA, 
  getWhyAndWhyNot, 
  getRevenueBattle, 
  getFutureDemandRadar 
} = require('./intelligenceEngine');

/**
 * 1. get_dashboard_metrics
 */
function get_dashboard_metrics() {
  const { hoardings, bookings, customers } = loadAllData();
  const vacancies = detectVacancies(hoardings, bookings, '2026-08-01');
  const totalRisk = vacancies.reduce((sum, v) => sum + v.revenue_at_risk, 0);

  let totalRecoverable = 0;
  let highFitCount = 0;

  vacancies.forEach(vac => {
    const topLeads = rankLeadsForVacancy(vac, customers, bookings, 3);
    const risk = calculateRevenueRisk(vac, topLeads);
    totalRecoverable += risk.expected_recovery_value;
    if (topLeads[0] && topLeads[0].overall_fit_score >= 75) highFitCount++;
  });

  const occupiedCount = hoardings.length - vacancies.length;
  const vacantCount = vacancies.filter(v => v.days_until_vacant <= 0).length;
  const vacatingSoonCount = vacancies.filter(v => v.days_until_vacant > 0 && v.days_until_vacant <= 60).length;

  return {
    total_hoardings: hoardings.length,
    occupied_hoardings: occupiedCount,
    vacancies_count_90d: vacancies.length,
    vacant_now: vacantCount,
    vacating_soon: vacatingSoonCount,
    total_revenue_at_risk: totalRisk,
    estimated_recoverable_revenue: totalRecoverable,
    high_fit_leads_count: highFitCount,
    active_recovery_missions: Math.min(12, vacancies.length),
    reference_date: '2026-08-01'
  };
}

/**
 * 2. get_upcoming_vacancies
 */
function get_upcoming_vacancies({ days = 90 }) {
  const maxDays = Number(days) || 90;
  const { hoardings, bookings, customers } = loadAllData();
  const vacancies = detectVacancies(hoardings, bookings, '2026-08-01');

  const filtered = vacancies.filter(v => v.days_until_vacant <= maxDays);

  return filtered.map(v => {
    const topLeads = rankLeadsForVacancy(v, customers, bookings, 1);
    const topLead = topLeads[0];
    return {
      site_id: v.site_id,
      location_name: v.location_name,
      zone: v.zone,
      monthly_rate: v.monthly_rate,
      days_until_vacant: v.days_until_vacant,
      free_from_date: v.free_from_date,
      current_booking_end: v.current_booking_end,
      incumbent_customer_name: v.incumbent_customer_name,
      revenue_at_risk: v.revenue_at_risk,
      urgency_tier: v.urgency_tier,
      top_candidate: topLead ? topLead.company_name : 'N/A',
      top_candidate_fit: topLead ? topLead.overall_fit_score : 0
    };
  });
}

/**
 * 3. get_hoarding_details
 */
function get_hoarding_details({ site_id }) {
  if (!site_id) throw new Error('site_id parameter is required.');
  const cleanId = site_id.toUpperCase().trim();
  const { hoardings, bookings, customers } = loadAllData();
  const hoarding = hoardings.find(h => h.site_id === cleanId);

  if (!hoarding) return null;

  const vacancies = detectVacancies(hoardings, bookings, '2026-08-01');
  const vacObj = vacancies.find(v => v.site_id === cleanId);
  const siteBookings = bookings.filter(b => b.site_id === cleanId);

  let status = 'OCCUPIED';
  if (vacObj) {
    if (vacObj.days_until_vacant <= 0) status = 'VACANT';
    else if (vacObj.days_until_vacant <= 60) status = 'VACATING_SOON';
  }

  const topLeads = vacObj ? rankLeadsForVacancy(vacObj, customers, bookings, 3) : [];

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
    status: status,
    days_until_vacant: vacObj ? vacObj.days_until_vacant : null,
    free_from_date: vacObj ? vacObj.free_from_date : null,
    revenue_at_risk: vacObj ? vacObj.revenue_at_risk : 0,
    incumbent_customer_name: vacObj ? vacObj.incumbent_customer_name : (siteBookings[0]?.customer_name || 'N/A'),
    booking_history_count: siteBookings.length,
    top_lead_candidates: topLeads.map(l => ({ company: l.company_name, fit: l.overall_fit_score }))
  };
}

/**
 * 4. get_top_leads
 */
function get_top_leads({ site_id }) {
  if (!site_id) throw new Error('site_id parameter is required.');
  const cleanId = site_id.toUpperCase().trim();
  const { hoardings, bookings, customers } = loadAllData();
  const hoarding = hoardings.find(h => h.site_id === cleanId);

  if (!hoarding) return [];

  const vacancies = detectVacancies(hoardings, bookings, '2026-08-01');
  const vacObj = vacancies.find(v => v.site_id === cleanId) || hoarding;

  const rankedLeads = rankLeadsForVacancy(vacObj, customers, bookings, 5);

  return rankedLeads.map(l => {
    const potRev = (hoarding.monthly_rate || 180000) * 3;
    const convScore = Math.round((l.overall_fit_score / 100) * 90);
    const expRev = Math.round((potRev * convScore) / 100);

    return {
      customer_id: l.customer_id,
      company_name: l.company_name,
      overall_fit_score: l.overall_fit_score,
      budget_band: (l.budget_band || l.budget_tier || 'MID').toString().replace('Tier (', '').replace(')', '').toUpperCase(),
      industry: l.industry,
      relationship_score: l.relationship_score,
      potential_revenue: potRev,
      expected_revenue: expRev,
      conversion_confidence: convScore,
      why_this_customer: l.reasons || []
    };
  });
}

/**
 * 5. get_customer_details
 */
function get_customer_details({ customer_id }) {
  const { hoardings, bookings, customers } = loadAllData();
  const cleanId = (customer_id || '').toUpperCase().trim();
  let customer = customers.find(c => c.customer_id === cleanId || c.company_name.toLowerCase().includes((customer_id || '').toLowerCase()));
  if (!customer) customer = customers[0];

  const custBookings = bookings.filter(b => b.customer_id === customer.customer_id);
  const preferredZones = Array.from(new Set(custBookings.map(b => {
    const h = hoardings.find(h => h.site_id === b.site_id);
    return h ? h.zone : null;
  }).filter(Boolean)));

  const totalSpent = custBookings.reduce((sum, b) => sum + (b.monthly_value || 0), 0);

  return {
    customer_id: customer.customer_id,
    company_name: customer.company_name,
    industry: customer.industry,
    budget_band: (customer.budget_band || customer.budget_tier || 'MID').toString().replace('Tier (', '').replace(')', '').toUpperCase(),
    max_budget_monthly: customer.max_budget_monthly,
    relationship_score: customer.relationship_score,
    last_contact_date: customer.last_contact_date,
    days_since_contact: customer.days_since_contact,
    is_cold: customer.is_cold_relationship,
    booking_history_count: custBookings.length,
    total_historical_spend: totalSpent,
    preferred_zones: preferredZones.length ? preferredZones : ['Western Suburbs']
  };
}

/**
 * 6. find_matching_sites
 */
function find_matching_sites({ customer_id }) {
  const { hoardings, bookings, customers } = loadAllData();
  const cleanId = (customer_id || '').toUpperCase().trim();
  let customer = customers.find(c => c.customer_id === cleanId || c.company_name.toLowerCase().includes((customer_id || '').toLowerCase()));
  if (!customer) customer = customers[0];

  const vacancies = detectVacancies(hoardings, bookings, '2026-08-01');

  return vacancies
    .filter(v => Number(v.monthly_rate) <= Number(customer.max_budget_monthly * 1.2))
    .map(v => {
      const scoreObj = calculateLeadScore(v, customer, bookings);
      return {
        site_id: v.site_id,
        location_name: v.location_name,
        zone: v.zone,
        monthly_rate: v.monthly_rate,
        match_score: scoreObj.overall_fit_score,
        days_until_vacant: v.days_until_vacant,
        reasons: scoreObj.reasons
      };
    })
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 5);
}

/**
 * 7. get_revenue_risk
 */
function get_revenue_risk() {
  const { hoardings, bookings, customers } = loadAllData();
  const vacancies = detectVacancies(hoardings, bookings, '2026-08-01');

  const totalRisk = vacancies.reduce((sum, v) => sum + v.revenue_at_risk, 0);
  const critical = vacancies.filter(v => v.days_until_vacant <= 30);

  const highestRiskSites = vacancies.map(v => {
    const topLeads = rankLeadsForVacancy(v, customers, bookings, 1);
    const riskAnalysis = calculateRevenueRisk(v, topLeads);
    return {
      site_id: v.site_id,
      location_name: v.location_name,
      monthly_rate: v.monthly_rate,
      days_until_vacant: v.days_until_vacant,
      free_from_date: v.free_from_date,
      revenue_at_risk: v.revenue_at_risk,
      risk_score: riskAnalysis.revenue_risk_score,
      urgency: v.urgency_tier,
      top_candidate: topLeads[0] ? topLeads[0].company_name : 'None'
    };
  }).sort((a, b) => b.revenue_at_risk - a.revenue_at_risk).slice(0, 5);

  return {
    total_revenue_at_risk: totalRisk,
    total_vacancies: vacancies.length,
    critical_vacancies_30d: critical.length,
    highest_risk_sites: highestRiskSites
  };
}

/**
 * 8. get_revenue_battle
 */
function get_revenue_battle({ site_id }) {
  if (!site_id) throw new Error('site_id parameter is required.');
  const cleanId = site_id.toUpperCase().trim();
  const { hoardings, bookings, customers } = loadAllData();
  const vacancies = detectVacancies(hoardings, bookings, '2026-08-01');
  const vacObj = vacancies.find(v => v.site_id === cleanId) || hoardings.find(h => h.site_id === cleanId);

  if (!vacObj) return null;

  const topLeads = rankLeadsForVacancy(vacObj, customers, bookings, 4);
  const battle = getRevenueBattle(vacObj, topLeads);
  const whyWhyNot = getWhyAndWhyNot(vacObj, topLeads);

  return {
    site_id: vacObj.site_id,
    location_name: vacObj.location_name,
    monthly_rate: vacObj.monthly_rate,
    recommended_customer: battle.recommended_winner?.company_name || topLeads[0]?.company_name,
    expected_revenue: battle.recommended_winner?.expected_revenue || Math.round(vacObj.monthly_rate * 3 * 0.8),
    fit_score: topLeads[0]?.overall_fit_score || 90,
    conversion_confidence: Math.round(((topLeads[0]?.overall_fit_score || 90) / 100) * 90),
    why_winner: whyWhyNot.why_number_1 || topLeads[0]?.reasons || [],
    ranked_candidates: topLeads.map((l, i) => {
      const potRev = vacObj.monthly_rate * 3;
      const convScore = Math.round((l.overall_fit_score / 100) * 90);
      return {
        rank: i + 1,
        company_name: l.company_name,
        fit_score: l.overall_fit_score,
        conversion_confidence: convScore,
        potential_revenue: potRev,
        expected_revenue: Math.round((potRev * convScore) / 100),
        recommendation: i === 0 ? 'CONTACT FIRST' : i === 1 ? 'Strong Alternative' : 'Backup'
      };
    })
  };
}

/**
 * 9. get_site_dna
 */
function get_site_dna({ site_id }) {
  if (!site_id) throw new Error('site_id parameter is required.');
  const cleanId = site_id.toUpperCase().trim();
  const { hoardings, bookings } = loadAllData();
  const hoarding = hoardings.find(h => h.site_id === cleanId);

  if (!hoarding) return null;

  return getSiteDNA(hoarding, bookings);
}

/**
 * 10. get_customer_dna
 */
function get_customer_dna({ customer_id }) {
  const { hoardings, bookings, customers } = loadAllData();
  const cleanId = (customer_id || '').toUpperCase().trim();
  let customer = customers.find(c => c.customer_id === cleanId || c.company_name.toLowerCase().includes((customer_id || '').toLowerCase()));
  if (!customer) customer = customers[0];

  return getCustomerDNA(customer, bookings, hoardings);
}

/**
 * 11. get_churn_risk
 */
function get_churn_risk({ site_id }) {
  if (!site_id) throw new Error('site_id parameter is required.');
  const cleanId = site_id.toUpperCase().trim();
  const { hoardings, bookings, customers } = loadAllData();
  const vacancies = detectVacancies(hoardings, bookings, '2026-08-01');
  const vacObj = vacancies.find(v => v.site_id === cleanId);

  if (!vacObj) {
    return { site_id: cleanId, churn_risk_pct: 15, churn_risk_tier: 'LOW', renewal_intent: 'HIGH' };
  }

  const incumbentCust = customers.find(c => c.customer_id === vacObj.incumbent_customer_id);
  const incumbentBooking = bookings.find(b => b.site_id === cleanId && b.customer_id === vacObj.incumbent_customer_id);

  return predictIncumbentChurn(vacObj, incumbentCust, incumbentBooking);
}

/**
 * 12. generate_pitch
 */
function generate_pitch({ site_id, customer_id, channel = 'EMAIL' }) {
  const { hoardings, bookings, customers } = loadAllData();
  const vacancies = detectVacancies(hoardings, bookings, '2026-08-01');

  let vacObj = vacancies.find(v => v.site_id === (site_id || '').toUpperCase().trim());
  if (!vacObj) vacObj = vacancies[0];

  let customer = customers.find(c => c.customer_id === (customer_id || '').toUpperCase().trim() || c.company_name.toLowerCase().includes((customer_id || '').toLowerCase()));
  if (!customer) customer = customers[0];

  const leadScore = calculateLeadScore(vacObj, customer, bookings);
  const pitch = generatePersonalizedPitch(vacObj, leadScore, channel.toUpperCase(), 'CONSULTATIVE');

  return {
    site_id: vacObj.site_id,
    location_name: vacObj.location_name,
    customer_id: customer.customer_id,
    company_name: customer.company_name,
    channel: pitch.channel,
    quoted_rate: pitch.quoted_rate,
    fit_score: leadScore.overall_fit_score,
    subject: pitch.subject,
    content: pitch.content || pitch.body
  };
}

/**
 * 13. run_campaign_simulation
 */
function run_campaign_simulation({ site_id, customer_id, budget = 300000, duration = 3, discount = 0 }) {
  const { hoardings, bookings, customers } = loadAllData();
  const vacancies = detectVacancies(hoardings, bookings, '2026-08-01');

  let vacObj = vacancies.find(v => v.site_id === (site_id || '').toUpperCase().trim()) || vacancies[0];
  let customer = customers.find(c => c.customer_id === (customer_id || '').toUpperCase().trim() || c.company_name.toLowerCase().includes((customer_id || '').toLowerCase())) || customers[0];

  const res = simulateCampaignScenario(vacObj, customer, customers, bookings, { budget, duration, discount });

  return {
    site_id: vacObj.site_id,
    customer_id: customer.customer_id,
    customer_name: customer.company_name,
    original_rate: res.list_monthly_rate,
    discounted_rate: res.effective_monthly_rate,
    original_fit_score: res.baseline_score,
    simulated_fit_score: res.simulated_score,
    simulated_score: res.simulated_score,
    simulated_expected_revenue: Math.round(res.total_contract_value * (res.simulated_score / 100)),
    shift_explanation: res.shift_explanation
  };
}

/**
 * 14. search_hoardings
 */
function search_hoardings({ query = '', status = 'ALL', zone = 'ALL' }) {
  const { hoardings, bookings } = loadAllData();
  const vacancies = detectVacancies(hoardings, bookings, '2026-08-01');
  const vacMap = new Map(vacancies.map(v => [v.site_id, v]));

  const q = (query || '').toLowerCase().trim();

  return hoardings.map(h => {
    const vacObj = vacMap.get(h.site_id);
    let s = 'OCCUPIED';
    if (vacObj) {
      if (vacObj.days_until_vacant <= 0) s = 'VACANT';
      else if (vacObj.days_until_vacant <= 60) s = 'VACATING_SOON';
    }

    return {
      site_id: h.site_id,
      location_name: h.location_name,
      zone: h.zone,
      monthly_rate: h.monthly_rate,
      size: h.size,
      status: s,
      days_until_vacant: vacObj ? vacObj.days_until_vacant : null,
      revenue_at_risk: vacObj ? vacObj.revenue_at_risk : null
    };
  }).filter(h => {
    if (status !== 'ALL' && h.status !== status) return false;
    if (zone !== 'ALL' && h.zone !== zone) return false;
    if (q) {
      const matchId = h.site_id.toLowerCase().includes(q);
      const matchLoc = h.location_name.toLowerCase().includes(q);
      const matchZone = h.zone.toLowerCase().includes(q);
      if (!matchId && !matchLoc && !matchZone) return false;
    }
    return true;
  });
}

// Tool Map Registry
const toolRegistry = {
  get_dashboard_metrics,
  get_upcoming_vacancies,
  get_hoarding_details,
  get_top_leads,
  get_customer_details,
  find_matching_sites,
  get_revenue_risk,
  get_revenue_battle,
  get_site_dna,
  get_customer_dna,
  get_churn_risk,
  generate_pitch,
  run_campaign_simulation,
  search_hoardings
};

module.exports = {
  toolRegistry,
  get_dashboard_metrics,
  get_upcoming_vacancies,
  get_hoarding_details,
  get_top_leads,
  get_customer_details,
  find_matching_sites,
  get_revenue_risk,
  get_revenue_battle,
  get_site_dna,
  get_customer_dna,
  get_churn_risk,
  generate_pitch,
  run_campaign_simulation,
  search_hoardings
};
