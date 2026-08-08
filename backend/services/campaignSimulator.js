// backend/services/campaignSimulator.js
/**
 * "What-If?" Campaign Simulator Engine
 * -------------------------------------
 * EXPLAINABLE ARCHITECTURE & PHASE 9 REQUIREMENT:
 * Allows sales directors to dynamically adjust proposal parameters:
 * - Customer Budget ($)
 * - Booking Duration (months)
 * - Rate Discount (%)
 * - Strategy Mode
 * 
 * Recalculates lead fit score, rank position shift, monthly pricing,
 * total campaign value, expected recovery, and provides explainable rank shift reasons.
 */

const { calculateLeadScore, rankLeadsForVacancy } = require('./scoringEngine');

function simulateCampaignScenario(vacancy, customer, allCustomers, allBookings, params = {}) {
  const customBudget = params.budget !== undefined ? Number(params.budget) : Number(customer.max_budget_monthly);
  const durationMonths = params.duration !== undefined ? Number(params.duration) : 3;
  const discountPct = params.discount !== undefined ? Number(params.discount) : 0;
  const strategyMode = params.strategyMode || 'BALANCED';

  // Create virtual customer object with updated budget
  const virtualCustomer = {
    ...customer,
    max_budget_monthly: customBudget
  };

  // Calculate discounted rate card
  const baseRate = Number(vacancy.monthly_rate);
  const discountedRate = Math.round(baseRate * (1 - (discountPct / 100)));

  // Calculate new fit score for virtual customer
  const newLeadScore = calculateLeadScore(vacancy, virtualCustomer, allBookings, strategyMode);

  // Recalculate rank position against all customers
  const virtualCustomersList = allCustomers.map(c => c.customer_id === customer.customer_id ? virtualCustomer : c);
  const reRankedLeads = rankLeadsForVacancy(vacancy, virtualCustomersList, allBookings, allCustomers.length, strategyMode);

  const newRank = reRankedLeads.findIndex(l => l.customer_id === customer.customer_id) + 1;

  // Calculate baseline rank for comparison
  const baselineLeads = rankLeadsForVacancy(vacancy, allCustomers, allBookings, allCustomers.length, strategyMode);
  const baselineRank = baselineLeads.findIndex(l => l.customer_id === customer.customer_id) + 1;
  const baselineScore = baselineLeads.find(l => l.customer_id === customer.customer_id)?.overall_fit_score || 0;

  const rankShift = baselineRank - newRank; // positive means improved rank
  let shiftExplanation = '';

  if (rankShift > 0) {
    shiftExplanation = `📈 Rank Improved from #${baselineRank} to #${newRank} (+${rankShift} positions)! Reason: Budget increase to $${customBudget.toLocaleString()}/mo resolved affordability constraints.`;
  } else if (rankShift < 0) {
    shiftExplanation = `📉 Rank Shifted from #${baselineRank} to #${newRank} (${rankShift} positions). Reason: Lower budget parameters relative to competitor candidates.`;
  } else {
    shiftExplanation = `↔️ Rank Unchanged at #${newRank}. Score shifted from ${baselineScore}% to ${newLeadScore.overall_fit_score}%.`;
  }

  const totalContractValue = discountedRate * durationMonths;

  return {
    site_id: vacancy.site_id,
    customer_id: customer.customer_id,
    company_name: customer.company_name,
    original_budget: customer.max_budget_monthly,
    simulated_budget: customBudget,
    simulated_duration_months: durationMonths,
    simulated_discount_pct: discountPct,
    
    // Financial Results
    list_monthly_rate: baseRate,
    effective_monthly_rate: discountedRate,
    total_contract_value: totalContractValue,
    
    // Rank & Fit Results
    baseline_rank: baselineRank,
    baseline_score: baselineScore,
    simulated_rank: newRank,
    simulated_score: newLeadScore.overall_fit_score,
    rank_shift: rankShift,
    shift_explanation: shiftExplanation,
    score_breakdown: newLeadScore.score_breakdown,
    reasons: newLeadScore.reasons
  };
}

module.exports = { simulateCampaignScenario };
