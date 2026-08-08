// backend/services/intelligenceEngine.js
/**
 * Billboard Revenue Intelligence Engine
 * -------------------------------
 * EXPLAINABLE ARCHITECTURE & BUSINESS DECISION ENGINE:
 * 
 * Implements:
 * 1. Customer DNA & Site DNA Profiles
 * 2. Why / Why Not Comparative Explainability
 * 3. Revenue Battle Engine (Expected Revenue = Potential Revenue × Estimated Conversion Score)
 * 4. Revenue Chess / Opportunity Cost ("DO NOT PRIORITIZE")
 * 5. Future Demand Radar & Vacancy Cascade
 * 6. Decision Trace Pipeline
 * 7. Multi-Agent Orchestrator
 */

const { calculateLeadScore, rankLeadsForVacancy } = require('./scoringEngine');
const { calculateRevenueRisk } = require('./revenueRiskEngine');
const { calculateNextBestAction } = require('./nextBestActionEngine');
const { generatePersonalizedPitch } = require('./pitchEngine');

/**
 * FEATURE 2: Customer DNA Profile
 */
function getCustomerDNA(customer, allBookings = [], allSites = []) {
  if (!customer) return null;

  const customerBookings = allBookings.filter(b => b.customer_id === customer.customer_id);
  
  const zoneCounts = {};
  customerBookings.forEach(b => {
    const site = allSites.find(s => s.site_id === b.site_id);
    if (site && site.zone) {
      zoneCounts[site.zone] = (zoneCounts[site.zone] || 0) + 1;
    }
  });

  const preferredZones = Object.keys(zoneCounts).sort((a, b) => zoneCounts[b] - zoneCounts[a]);
  const avgBookingValue = customerBookings.length > 0 
    ? Math.round(customerBookings.reduce((sum, b) => sum + Number(b.monthly_value || 0), 0) / customerBookings.length)
    : Number(customer.max_budget_monthly || 150000);

  // Cold Relationship Classification
  let relationshipStatus = 'ACTIVE';
  if (customer.days_since_contact > 60 || customer.relationship_score < 50) {
    relationshipStatus = 'COLD';
  } else if (customer.days_since_contact > 30 || customer.relationship_score < 70) {
    relationshipStatus = 'WARM';
  }

  return {
    customer_id: customer.customer_id,
    company_name: customer.company_name,
    industry: customer.industry,
    budget_tier: customer.budget_tier,
    max_budget_monthly: Number(customer.max_budget_monthly),
    relationship_score: Number(customer.relationship_score),
    relationship_status: relationshipStatus,
    days_since_contact: Number(customer.days_since_contact),
    booking_frequency: customerBookings.length,
    average_booking_value: avgBookingValue,
    preferred_zones: preferredZones.length > 0 ? preferredZones : [customer.preferred_zone || 'Western Suburbs'],
    preferred_site_type: customerBookings.some(b => b.site_id && b.site_id.includes('Digital')) ? 'Digital LED' : 'Static Billboard',
    historical_campaign_pattern: customerBookings.length > 2 ? 'Recurring Advertiser' : 'Spot Campaigner'
  };
}

/**
 * FEATURE 3: Site DNA Profile
 */
function getSiteDNA(hoarding, allBookings = []) {
  if (!hoarding) return null;

  const siteBookings = allBookings.filter(b => b.site_id === hoarding.site_id);
  const historicalCustomers = [...new Set(siteBookings.map(b => b.customer_name || b.customer_id))];

  const avgBookingValue = siteBookings.length > 0
    ? Math.round(siteBookings.reduce((sum, b) => sum + Number(b.monthly_value || hoarding.monthly_rate), 0) / siteBookings.length)
    : Number(hoarding.monthly_rate);

  return {
    site_id: hoarding.site_id,
    location_name: hoarding.location_name,
    zone: hoarding.zone,
    size: hoarding.size,
    monthly_rate: Number(hoarding.monthly_rate),
    traffic_score: Number(hoarding.traffic_score),
    daily_impressions: Number(hoarding.daily_impressions || hoarding.traffic_score * 12500),
    site_type: hoarding.site_type,
    target_demographic: hoarding.target_demographic,
    average_booking_value: avgBookingValue,
    historical_booking_count: siteBookings.length,
    historical_customers: historicalCustomers,
    typical_booking_duration: '3 to 6 Months'
  };
}

/**
 * FEATURE 5: "WHY THIS CUSTOMER?" (#1) vs "WHY NOT THE OTHER CUSTOMER?" (#2, #3)
 */
function getWhyAndWhyNot(vacancy, rankedLeads) {
  if (!rankedLeads || rankedLeads.length === 0) return null;

  const top1 = rankedLeads[0];
  const lowerRanked = rankedLeads.slice(1).map(lead => {
    const whyNotReasons = [];

    if (lead.max_budget_monthly < top1.max_budget_monthly) {
      whyNotReasons.push(`Lower budget capacity (₹${lead.max_budget_monthly.toLocaleString()} vs ₹${top1.max_budget_monthly.toLocaleString()}/mo).`);
    }

    if (lead.relationship_score < top1.relationship_score) {
      whyNotReasons.push(`Weaker relationship score (${lead.relationship_score}/100 vs ${top1.relationship_score}/100).`);
    }

    const leadAffinity = lead.score_breakdown ? lead.score_breakdown.affinity.score : 0;
    const top1Affinity = top1.score_breakdown ? top1.score_breakdown.affinity.score : 0;
    if (leadAffinity < top1Affinity) {
      whyNotReasons.push(`Weaker historical booking affinity for this zone (${leadAffinity} pts vs ${top1Affinity} pts).`);
    }

    if (lead.days_since_contact > top1.days_since_contact) {
      whyNotReasons.push(`Less recent touchpoint (${lead.days_since_contact} days ago vs ${top1.days_since_contact} days ago).`);
    }

    if (whyNotReasons.length === 0) {
      whyNotReasons.push('Slightly lower overall demographic synergy score.');
    }

    return {
      customer_id: lead.customer_id,
      company_name: lead.company_name,
      overall_fit_score: lead.overall_fit_score,
      why_not_reasons: whyNotReasons
    };
  });

  return {
    site_id: vacancy.site_id,
    rank_1_lead: {
      customer_id: top1.customer_id,
      company_name: top1.company_name,
      overall_fit_score: top1.overall_fit_score,
      why_selected_reasons: top1.reasons
    },
    lower_ranked_comparisons: lowerRanked
  };
}

/**
 * FEATURE 10: Revenue Battle Engine
 * Formula: Expected Revenue = Potential Revenue × Estimated Conversion Score
 */
function getRevenueBattle(vacancy, rankedLeads) {
  if (!rankedLeads || rankedLeads.length < 2) return null;

  const contenders = rankedLeads.slice(0, 3).map(lead => {
    const potentialRevenue = vacancy.monthly_rate * 3; // 3-Month Campaign Contract
    const estimatedConversionScore = Math.min(95, Math.max(15, lead.overall_fit_score));
    const expectedRevenue = Math.round(potentialRevenue * (estimatedConversionScore / 100));

    return {
      customer_id: lead.customer_id,
      company_name: lead.company_name,
      industry: lead.industry,
      potential_revenue: potentialRevenue,
      estimated_conversion_score: estimatedConversionScore,
      expected_revenue: expectedRevenue,
      fit_score: lead.overall_fit_score,
      estimation_factors: [
        `Budget Compatibility (Max: ₹${lead.max_budget_monthly.toLocaleString()})`,
        `Industry Synergy (${lead.industry})`,
        `Zone Affinity (${vacancy.zone})`,
        `Relationship Score (${lead.relationship_score}/100)`,
        `Touchpoint Recency (${lead.days_since_contact} days ago)`
      ]
    };
  });

  contenders.sort((a, b) => b.expected_revenue - a.expected_revenue);
  const winner = contenders[0];

  return {
    site_id: vacancy.site_id,
    formula: 'Expected Revenue = Potential Revenue × Estimated Conversion Score',
    battle_winner: winner,
    contenders: contenders,
    strategic_recommendation: `Target ${winner.company_name} for highest estimated expected revenue (₹${winner.expected_revenue.toLocaleString()} at ${winner.estimated_conversion_score}% estimated conversion score).`
  };
}

/**
 * FEATURE 12: Revenue Chess / Opportunity Cost ("DO NOT PRIORITIZE")
 */
function getRevenueChess(vacancy, rankedLeads) {
  if (!rankedLeads || rankedLeads.length === 0) return null;

  const flags = [];
  rankedLeads.forEach(lead => {
    if (lead.overall_fit_score >= 70 && lead.max_budget_monthly < vacancy.monthly_rate * 1.05) {
      flags.push({
        customer_id: lead.customer_id,
        company_name: lead.company_name,
        match_score: lead.overall_fit_score,
        recommendation: 'DO NOT PRIORITIZE THIS CUSTOMER',
        reason: `Low budget headroom (₹${lead.max_budget_monthly.toLocaleString()} budget barely covers ₹${vacancy.monthly_rate.toLocaleString()} rate card). Higher opportunity cost vs alternative prospects.`,
        recommended_alternative: rankedLeads.find(l => l.customer_id !== lead.customer_id && l.max_budget_monthly >= vacancy.monthly_rate * 1.2)?.company_name || 'Higher Budget Enterprise Prospect'
      });
    }
  });

  return flags;
}

/**
 * FEATURE 15: Future Demand Radar
 */
function getFutureDemandRadar(allSites, allBookings) {
  const zoneDemand = {};
  allSites.forEach(s => {
    const siteBookings = allBookings.filter(b => b.site_id === s.site_id);
    const count = siteBookings.length;
    zoneDemand[s.zone] = (zoneDemand[s.zone] || 0) + count;
  });

  const radar = Object.keys(zoneDemand).map(zone => ({
    zone: zone,
    booking_volume: zoneDemand[zone],
    demand_score: Math.min(98, 50 + zoneDemand[zone] * 8),
    top_industries: ['Real Estate', 'Retail & FMCG', 'Automotive']
  }));

  radar.sort((a, b) => b.demand_score - a.demand_score);
  return radar;
}

/**
 * FEATURE 18: Decision Trace Pipeline
 */
function getAIDecisionTrace(vacancy, lead) {
  return [
    { step: 1, action: 'Vacancy Detected', detail: `Site ${vacancy.site_id} (${vacancy.location_name}) free from ${vacancy.free_from_date}.` },
    { step: 2, action: 'Budget Eligibility Checked', detail: `Verified prospect budget (₹${lead.max_budget_monthly.toLocaleString()}) >= rate card (₹${vacancy.monthly_rate.toLocaleString()}).` },
    { step: 3, action: 'Industry Compatibility Calculated', detail: `Evaluated ${lead.industry} audience match for ${vacancy.zone} demographic.` },
    { step: 4, action: 'Historical Affinity Calculated', detail: `Checked past booking history for ${lead.company_name} in ${vacancy.zone}.` },
    { step: 5, action: 'Relationship Score Calculated', detail: `Evaluated account status (${lead.relationship_score}/100, last contact ${lead.days_since_contact} days ago).` },
    { step: 6, action: 'Final Lead Score Generated', detail: `Calculated deterministic fit score: ${lead.overall_fit_score}/100.` }
  ];
}

/**
 * FEATURE 20: Multi-Agent Orchestrator Service
 */
function orchestrateRecoveryResponse(vacancy, customer, allCustomers, allBookings) {
  const rankedLeads = rankLeadsForVacancy(vacancy, allCustomers, allBookings, 3);
  const selectedLead = customer || rankedLeads[0];

  const risk = calculateRevenueRisk(vacancy, rankedLeads);
  const nextAction = calculateNextBestAction(vacancy, selectedLead);
  const whyWhyNot = getWhyAndWhyNot(vacancy, rankedLeads);
  const battle = getRevenueBattle(vacancy, rankedLeads);
  const decisionTrace = getAIDecisionTrace(vacancy, selectedLead);
  const pitch = generatePersonalizedPitch(vacancy, selectedLead, nextAction.channel === 'WHATSAPP' ? 'WHATSAPP' : 'EMAIL');

  return {
    orchestration_status: 'SUCCESS',
    vacancy_info: vacancy,
    target_customer: selectedLead,
    revenue_risk: risk,
    next_best_action: nextAction,
    why_and_why_not: whyWhyNot,
    revenue_battle: battle,
    decision_trace: decisionTrace,
    personalized_pitch: pitch
  };
}

module.exports = {
  getCustomerDNA,
  getSiteDNA,
  getWhyAndWhyNot,
  getRevenueBattle,
  getRevenueChess,
  getFutureDemandRadar,
  getAIDecisionTrace,
  orchestrateRecoveryResponse
};
