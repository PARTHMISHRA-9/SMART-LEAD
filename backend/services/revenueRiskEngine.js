// backend/services/revenueRiskEngine.js
/**
 * Revenue Risk Engine
 * -------------------
 * EXPLAINABLE ARCHITECTURE & PHASE 5 REQUIREMENT:
 * Calculates a deterministic Revenue Risk Score (0 - 100) for every vacant hoarding.
 * 
 * Formula Components:
 * 1. Vacancy Urgency (0-30 pts): Fewer days until vacant -> Higher risk score.
 * 2. Revenue Exposure Value (0-35 pts): Higher monthly rate -> Higher risk score.
 * 3. Historical Fill Difficulty (0-20 pts): Rate card tier & past fill duration.
 * 4. Lead Availability Deficit (0-15 pts): Scarcity of high-fit budget-matching customers.
 */

function calculateRevenueRisk(vacancy, topLeads = []) {
  let riskScore = 0;
  const breakdown = {
    urgency_points: 0,
    revenue_points: 0,
    fill_difficulty_points: 0,
    lead_deficit_points: 0
  };
  const riskFactors = [];

  const daysVacant = vacancy.days_until_vacant !== undefined ? vacancy.days_until_vacant : 30;
  const monthlyRate = Number(vacancy.monthly_rate || 10000);
  const revenueAtRisk = monthlyRate * 3;

  // 1. Vacancy Urgency Component (30 pts max)
  if (daysVacant <= 0) {
    breakdown.urgency_points = 30;
    riskFactors.push(`🚨 Overdue / Vacant Now: Currently unbooked (Immediate revenue loss of $${monthlyRate.toLocaleString()}/mo).`);
  } else if (daysVacant <= 15) {
    breakdown.urgency_points = 26;
    riskFactors.push(`⚠️ Critical Expiration: Only ${daysVacant} days until site goes dark.`);
  } else if (daysVacant <= 30) {
    breakdown.urgency_points = 20;
    riskFactors.push(`📅 High Urgency: Expiring within 30 days (${daysVacant}d remaining).`);
  } else if (daysVacant <= 60) {
    breakdown.urgency_points = 12;
    riskFactors.push(`📆 Moderate Horizon: ${daysVacant} days until contract expiration.`);
  } else {
    breakdown.urgency_points = 5;
    riskFactors.push(`ℹ️ Long-term Pipeline: ${daysVacant} days until vacancy.`);
  }
  riskScore += breakdown.urgency_points;

  // 2. Revenue Exposure Value Component (35 pts max)
  if (monthlyRate >= 20000) {
    breakdown.revenue_points = 35;
    riskFactors.push(`💰 High Financial Exposure: Premium rate card ($${monthlyRate.toLocaleString()}/mo | $${revenueAtRisk.toLocaleString()} 90-day risk).`);
  } else if (monthlyRate >= 14000) {
    breakdown.revenue_points = 25;
    riskFactors.push(`💵 Mid-High Financial Exposure: Rate card ($${monthlyRate.toLocaleString()}/mo).`);
  } else if (monthlyRate >= 9000) {
    breakdown.revenue_points = 16;
    riskFactors.push(`💵 Standard Exposure: Monthly rate ($${monthlyRate.toLocaleString()}/mo).`);
  } else {
    breakdown.revenue_points = 8;
    riskFactors.push(`🏷️ Lower Financial Impact: Rate card ($${monthlyRate.toLocaleString()}/mo).`);
  }
  riskScore += breakdown.revenue_points;

  // 3. Historical Fill Difficulty Component (20 pts max)
  const isDigital = vacancy.site_type && vacancy.site_type.includes('Digital');
  if (monthlyRate >= 18000 && !isDigital) {
    breakdown.fill_difficulty_points = 18;
    riskFactors.push(`📊 Fill Complexity: Premium static inventory in ${vacancy.zone} requires high-budget enterprise prospects.`);
  } else if (vacancy.traffic_score < 75) {
    breakdown.fill_difficulty_points = 14;
    riskFactors.push(`📊 Traffic Score Penalty: Traffic density score ${vacancy.traffic_score}/100 requires targeted pitch strategy.`);
  } else {
    breakdown.fill_difficulty_points = 8;
    riskFactors.push(`📊 Normal Turnaround: Standard historical fill duration for ${vacancy.zone}.`);
  }
  riskScore += breakdown.fill_difficulty_points;

  // 4. Lead Availability Deficit Component (15 pts max)
  const highFitLeads = topLeads.filter(l => l.overall_fit_score >= 70 && l.is_affordable);
  if (highFitLeads.length === 0) {
    breakdown.lead_deficit_points = 15;
    riskFactors.push(`🛑 Lead Scarcity: Zero high-confidence affordable leads currently identified for this site.`);
  } else if (highFitLeads.length === 1) {
    breakdown.lead_deficit_points = 10;
    riskFactors.push(`⚠️ Single Fit Lead: Only 1 high-fit affordable customer candidate available.`);
  } else {
    breakdown.lead_deficit_points = 3;
    riskFactors.push(`✅ Healthy Pipeline: ${highFitLeads.length} strong customer candidates matching budget & profile.`);
  }
  riskScore += breakdown.lead_deficit_points;

  // Final Risk Level
  const finalScore = Math.min(100, Math.max(0, Math.round(riskScore)));
  let riskLevel = 'LOW';
  let priority = 'P3';
  if (finalScore >= 75) {
    riskLevel = 'CRITICAL';
    priority = 'P1';
  } else if (finalScore >= 50) {
    riskLevel = 'HIGH';
    priority = 'P2';
  } else if (finalScore >= 30) {
    riskLevel = 'MEDIUM';
    priority = 'P3';
  }

  // Estimated Recovery Calculation (Deterministic)
  const topFit = topLeads[0] ? topLeads[0].overall_fit_score : 50;
  const recoveryProbabilityPct = Math.round(Math.min(95, Math.max(20, (topFit * 0.7) + (100 - finalScore) * 0.3)));
  const expectedRecoveryValue = Math.round(revenueAtRisk * (recoveryProbabilityPct / 100));

  return {
    site_id: vacancy.site_id,
    revenue_risk_score: finalScore,
    risk_level: riskLevel,
    priority: priority,
    recovery_probability_pct: recoveryProbabilityPct,
    expected_recovery_value: expectedRecoveryValue,
    revenue_at_risk_90d: revenueAtRisk,
    breakdown: breakdown,
    risk_factors: riskFactors,
    explainable_formula: `Risk Score (${finalScore}) = Urgency (${breakdown.urgency_points}/30) + Value (${breakdown.revenue_points}/35) + Fill Difficulty (${breakdown.fill_difficulty_points}/20) + Lead Scarcity (${breakdown.lead_deficit_points}/15)`
  };
}

module.exports = { calculateRevenueRisk };
