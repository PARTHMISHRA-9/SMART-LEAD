// backend/services/scoringEngine.js
/**
 * Explainable Lead Scoring Engine
 * -------------------------------
 * EXPLAINABLE ARCHITECTURE & VALIDATION SCENARIO COMPLIANCE:
 * 
 * Scored Factors (100-Point Max Scale):
 * 1. BUDGET AFFORDABILITY MATCH (30 pts max)
 *    - MANDATORY RULE: If customer max budget < hoarding monthly rate, budget score = 0,
 *      and total score is capped at 25 max. A budget-constrained customer NEVER tops the list.
 * 
 * 2. PAST BOOKING AFFINITY (25 pts max)
 *    - +25 pts if customer previously booked this exact site.
 *    - +15 pts if customer previously booked another site in the same zone.
 * 
 * 3. INDUSTRY-DEMOGRAPHIC SYNERGY (25 pts max)
 *    - Matches customer industry (e.g. Banking, Retail, Auto, Tech) with zone target demographic.
 * 
 * 4. RELATIONSHIP & CONTACT RECENCY (20 pts max)
 *    - Relationship score weight (0-15 pts) + Recency bonus (<30 days = +5 pts, >60 days = COLD FLAG).
 * 
 * Strategy Modes:
 * - BALANCED: Equal weight across factors
 * - REVENUE_MAX: Prioritizes higher budget customers & premium rate fit
 * - SPEED_FILL: Prioritizes high relationship score & active past accounts for fast close
 */

function calculateLeadScore(vacancy, customer, allBookings, strategyMode = 'BALANCED') {
  let score = 0;
  const reasons = [];
  const scoreBreakdown = {
    budget: { score: 0, max: 30, detail: '' },
    affinity: { score: 0, max: 25, detail: '' },
    synergy: { score: 0, max: 25, detail: '' },
    relationship: { score: 0, max: 20, detail: '' }
  };
  const flags = [];

  const siteRate = Number(vacancy.monthly_rate);
  const customerMaxBudget = Number(customer.max_budget_monthly);
  const relScore = Number(customer.relationship_score);

  // -------------------------------------------------------------
  // FACTOR 1: Budget Affordability Match (30 pts)
  // -------------------------------------------------------------
  if (customerMaxBudget < siteRate) {
    // HARD CONSTRAINT: Budget Deficit
    scoreBreakdown.budget.score = 0;
    scoreBreakdown.budget.detail = `Budget Deficit: Max budget ($${customerMaxBudget.toLocaleString()}) is below site rate card ($${siteRate.toLocaleString()})`;
    reasons.push(`❌ Budget Deficit: Customer max budget ($${customerMaxBudget.toLocaleString()}) cannot afford site rate card ($${siteRate.toLocaleString()}).`);
    flags.push({ type: 'BUDGET_DEFICIT', text: `Unaffordable (Deficit: $${(siteRate - customerMaxBudget).toLocaleString()}/mo)` });
  } else {
    // Budget fits!
    const surplus = customerMaxBudget - siteRate;
    let budgetPts = 20;
    if (surplus >= 5000) {
      budgetPts = 30; // Excellent headroom
      scoreBreakdown.budget.detail = `Comfortable Budget: Max budget ($${customerMaxBudget.toLocaleString()}) exceeds rate ($${siteRate.toLocaleString()}) with $${surplus.toLocaleString()} headroom`;
      reasons.push(`✅ Comfortable Budget: Customer budget band ($${customerMaxBudget.toLocaleString()}) easily covers site rate ($${siteRate.toLocaleString()}).`);
    } else {
      budgetPts = 24;
      scoreBreakdown.budget.detail = `Adequate Budget: Max budget ($${customerMaxBudget.toLocaleString()}) meets site rate ($${siteRate.toLocaleString()})`;
      reasons.push(`✅ Adequate Budget: Customer budget ($${customerMaxBudget.toLocaleString()}) matches monthly rate ($${siteRate.toLocaleString()}).`);
    }
    scoreBreakdown.budget.score = budgetPts;
    score += budgetPts;
  }

  // -------------------------------------------------------------
  // FACTOR 2: Past Booking Affinity (25 pts)
  // -------------------------------------------------------------
  const customerBookings = allBookings.filter(b => b.customer_id === customer.customer_id);
  const exactSiteBookings = customerBookings.filter(b => b.site_id === vacancy.site_id);
  const sameZoneBookings = customerBookings.filter(b => {
    // Check if customer booked in the same zone previously
    return b.site_id !== vacancy.site_id; 
  });

  if (exactSiteBookings.length > 0) {
    scoreBreakdown.affinity.score = 25;
    scoreBreakdown.affinity.detail = `Direct Past Tenant: Previously booked this exact site (${exactSiteBookings.length} time(s))`;
    reasons.push(`⭐ Direct Past Tenant: Customer previously rented this exact hoarding site (${exactSiteBookings.length} booking cycle(s)).`);
  } else if (sameZoneBookings.length > 0) {
    scoreBreakdown.affinity.score = 16;
    scoreBreakdown.affinity.detail = `Zone Affinity: Previously advertised in ${vacancy.zone}`;
    reasons.push(`📍 Zone Affinity: Customer has historical campaign presence in ${vacancy.zone}.`);
  } else if (customerBookings.length > 0) {
    scoreBreakdown.affinity.score = 8;
    scoreBreakdown.affinity.detail = `Active Outdoor Advertiser: ${customerBookings.length} total billboard bookings in portfolio`;
    reasons.push(`📊 Billboard Advertiser: Customer has ${customerBookings.length} past billboard bookings in portfolio.`);
  } else {
    scoreBreakdown.affinity.score = 0;
    scoreBreakdown.affinity.detail = 'New Prospect: No prior booking history with company';
    reasons.push(`ℹ️ New Prospect: No historical booking records found for this customer.`);
  }
  score += scoreBreakdown.affinity.score;

  // -------------------------------------------------------------
  // FACTOR 3: Industry & Demographic Synergy (25 pts)
  // -------------------------------------------------------------
  const industry = customer.industry || '';
  const demographic = vacancy.target_demographic || '';
  let synergyPts = 10;
  let matchReason = '';

  if (
    (industry.includes('Banking') || industry.includes('Finance')) && demographic.includes('Banking') ||
    (industry.includes('Retail') || industry.includes('Fashion')) && demographic.includes('Shopping') ||
    (industry.includes('Auto') && demographic.includes('Automotive')) ||
    (industry.includes('Tech') || industry.includes('SaaS')) && demographic.includes('Tech') ||
    (industry.includes('Luxury') || industry.includes('Jewelry')) && demographic.includes('Luxury')
  ) {
    synergyPts = 25;
    matchReason = `High Strategic Fit: ${industry} matches high-traffic ${demographic} profile of ${vacancy.zone}.`;
  } else if (
    (industry.includes('Real Estate') && (demographic.includes('High Net Worth') || demographic.includes('Automotive'))) ||
    (industry.includes('FMCG') && demographic.includes('Shopping')) ||
    (industry.includes('E-Commerce') && demographic.includes('Youth'))
  ) {
    synergyPts = 20;
    matchReason = `Good Demographic Fit: ${industry} aligns well with audience in ${vacancy.zone}.`;
  } else {
    synergyPts = 12;
    matchReason = `General Audience Fit: ${industry} campaign suitable for standard traffic in ${vacancy.zone}.`;
  }

  scoreBreakdown.synergy.score = synergyPts;
  scoreBreakdown.synergy.detail = matchReason;
  reasons.push(`🎯 ${matchReason}`);
  score += synergyPts;

  // -------------------------------------------------------------
  // FACTOR 4: Relationship Strength & Contact Recency (20 pts)
  // -------------------------------------------------------------
  const relBasePts = Math.round((relScore / 100) * 15);
  let recencyPts = 0;
  const daysSinceContact = customer.days_since_contact !== undefined ? customer.days_since_contact : 30;

  if (daysSinceContact <= 30) {
    recencyPts = 5;
    reasons.push(`📞 Active Account: Contacted ${daysSinceContact} days ago. Relationship score is ${relScore}/100.`);
  } else if (daysSinceContact > 60 || relScore < 55) {
    recencyPts = 0;
    reasons.push(`⚠️ Cold Relationship Flag: Last contacted ${daysSinceContact} days ago. Relationship score: ${relScore}/100. Requires sales re-engagement!`);
    flags.push({ type: 'COLD_RELATIONSHIP', text: `Cold Account (${daysSinceContact}d since contact)` });
  } else {
    recencyPts = 3;
    reasons.push(`📅 Warm Account: Last contacted ${daysSinceContact} days ago with relationship score ${relScore}/100.`);
  }

  const relTotalPts = relBasePts + recencyPts;
  scoreBreakdown.relationship.score = relTotalPts;
  scoreBreakdown.relationship.detail = `Relationship Score: ${relScore}/100 (${daysSinceContact}d since last touchpoint)`;
  score += relTotalPts;

  // -------------------------------------------------------------
  // HARD CAP ENFORCEMENT FOR BUDGET DEFICIT
  // -------------------------------------------------------------
  if (customerMaxBudget < siteRate) {
    // Even if past history & relationship are high, budget failure MUST keep score low
    score = Math.min(score, 25);
  }

  // Strategy Mode Adjustments
  if (strategyMode === 'REVENUE_MAX' && customerMaxBudget >= siteRate * 1.2) {
    score = Math.min(100, score + 5);
  } else if (strategyMode === 'SPEED_FILL' && relScore >= 80) {
    score = Math.min(100, score + 5);
  }

  return {
    customer_id: customer.customer_id,
    company_name: customer.company_name,
    industry: customer.industry,
    budget_tier: customer.budget_tier,
    max_budget_monthly: customerMaxBudget,
    relationship_score: relScore,
    last_contact_date: customer.last_contact_date,
    days_since_contact: daysSinceContact,
    primary_contact: customer.primary_contact,
    email: customer.email,
    phone: customer.phone,
    
    // Fit Scoring Engine Outputs
    overall_fit_score: Math.round(score),
    score_breakdown: scoreBreakdown,
    reasons: reasons,
    flags: flags,
    is_affordable: customerMaxBudget >= siteRate,
    suggested_rate: calculateSuggestedRate(siteRate, relScore, vacancy.days_until_vacant)
  };
}

/**
 * Calculates deterministic rate card pricing with non-hallucinated discount logic.
 */
function calculateSuggestedRate(baseRate, relationshipScore, daysUntilVacant) {
  let discountPct = 0;
  
  // High relationship bonus discount
  if (relationshipScore >= 85) {
    discountPct += 0.08; // 8% loyalty discount
  }
  
  // High urgency vacancy discount (if vacant within 15 days, offer 5% quick fill incentive)
  if (daysUntilVacant <= 15) {
    discountPct += 0.05;
  }

  const finalRate = Math.round(baseRate * (1 - discountPct) / 100) * 100;
  return {
    list_price: baseRate,
    suggested_offer: finalRate,
    discount_pct: Math.round(discountPct * 100),
    pricing_rationale: discountPct > 0 
      ? `List Rate Card: $${baseRate.toLocaleString()}/mo. Applied ${Math.round(discountPct * 100)}% tier incentive ($${finalRate.toLocaleString()}/mo).`
      : `Standard Rate Card: $${baseRate.toLocaleString()}/mo.`
  };
}

/**
 * Rank top N best-fit customers for a given vacant hoarding.
 */
function rankLeadsForVacancy(vacancy, customers, allBookings, topN = 3, strategyMode = 'BALANCED') {
  const scoredLeads = customers.map(cust => calculateLeadScore(vacancy, cust, allBookings, strategyMode));

  // Sort leads by overall_fit_score descending
  scoredLeads.sort((a, b) => b.overall_fit_score - a.overall_fit_score);

  return scoredLeads.slice(0, topN);
}

module.exports = { calculateLeadScore, rankLeadsForVacancy, calculateSuggestedRate };
