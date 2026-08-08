// backend/services/churnEngine.js
/**
 * Incumbent Renewal vs Churn Predictor Engine
 * --------------------------------------------
 * EXPLAINABLE ARCHITECTURE & BONUS REQUIREMENT:
 * Evaluates incumbent tenants on soon-to-expire hoardings to predict:
 * 1. Churn Risk Probability (%)
 * 2. Renewal Likelihood (HIGH, MEDIUM, LOW)
 * 3. Key Churn Drivers (e.g. Price Increase, Uncontacted >60d, Low Relationship Score)
 */

function predictIncumbentChurn(vacancy, customer, booking) {
  if (!customer || !booking) {
    return {
      churn_risk_pct: 0,
      renewal_likelihood: 'UNKNOWN',
      drivers: ['No active incumbent tenant recorded for this site.']
    };
  }

  let churnScore = 30; // Base churn risk
  const drivers = [];

  const relScore = Number(customer.relationship_score || 50);
  const daysSinceContact = Number(customer.days_since_contact || 45);
  const maxBudget = Number(customer.max_budget_monthly || vacancy.monthly_rate);
  const monthlyRate = Number(vacancy.monthly_rate);

  // Driver 1: Relationship Score
  if (relScore < 50) {
    churnScore += 35;
    drivers.push(`Low Relationship Score (${relScore}/100) indicates dissatisfaction or weak engagement.`);
  } else if (relScore > 80) {
    churnScore -= 20;
    drivers.push(`High Relationship Score (${relScore}/100) fosters strong tenant loyalty.`);
  }

  // Driver 2: Contact Recency
  if (daysSinceContact > 60) {
    churnScore += 25;
    drivers.push(`Account Cold: No sales contact in ${daysSinceContact} days.`);
  } else if (daysSinceContact <= 15) {
    churnScore -= 10;
    drivers.push(`Recently Engaged: Touched base ${daysSinceContact} days ago.`);
  }

  // Driver 3: Budget Strain
  if (maxBudget < monthlyRate * 1.05) {
    churnScore += 20;
    drivers.push(`Budget Constraint: Current rate ($${monthlyRate.toLocaleString()}) exhausts customer's monthly cap.`);
  }

  // Bound churn score between 5% and 95%
  const finalChurnRiskPct = Math.min(95, Math.max(5, Math.round(churnScore)));
  
  let likelihood = 'MEDIUM';
  if (finalChurnRiskPct > 60) {
    likelihood = 'HIGH RISK (Likely to Churn)';
  } else if (finalChurnRiskPct < 30) {
    likelihood = 'LOW RISK (Likely to Renew)';
  }

  return {
    incumbent_id: customer.customer_id,
    incumbent_name: customer.company_name,
    churn_risk_pct: finalChurnRiskPct,
    renewal_likelihood: likelihood,
    drivers: drivers,
    recommended_action: finalChurnRiskPct > 50 
      ? `🚨 Schedule proactive retention call offering multi-month lock-in discount.`
      : `✅ Send standard 60-day early renewal agreement with current rate lock.`
  };
}

module.exports = { predictIncumbentChurn };
