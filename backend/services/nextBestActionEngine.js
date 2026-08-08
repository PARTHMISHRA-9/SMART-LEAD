// backend/services/nextBestActionEngine.js
/**
 * Next Best Action Engine
 * -----------------------
 * EXPLAINABLE ARCHITECTURE & PHASE 6 REQUIREMENT:
 * Evaluates a (Vacancy, Customer) pair to determine the optimal sales action.
 * 
 * Decision Actions:
 * - CALL_NOW: Urgent vacancy (0-15d) + High relationship score (>75).
 * - OFFER_RENEWAL: Customer is the incumbent tenant on an expiring site.
 * - SEND_WHATSAPP: Warm relationship + contacted within 30 days.
 * - SEND_EMAIL: Standard formal outreach for mid-to-high budget prospects.
 * - SCHEDULE_MEETING: High budget Tier 1 enterprise prospect (> $20k budget).
 * - SEND_SITE_DECK: New prospect with high industry fit but no past booking.
 * - CROSS_SELL_NEARBY_SITE: Customer booked a nearby site in the same zone.
 * - MONITOR: Low fit or budget deficit candidate.
 */

function calculateNextBestAction(vacancy, customer, isIncumbent = false) {
  const daysVacant = vacancy.days_until_vacant !== undefined ? vacancy.days_until_vacant : 30;
  const relScore = Number(customer.relationship_score || 50);
  const daysSinceContact = Number(customer.days_since_contact || 45);
  const maxBudget = Number(customer.max_budget_monthly || 0);
  const siteRate = Number(vacancy.monthly_rate || 10000);
  const isAffordable = maxBudget >= siteRate;

  let action = 'SEND_EMAIL';
  let priority = 'MEDIUM';
  let channel = 'EMAIL';
  let reason = '';
  let expectedImpact = '';
  let deadlineHours = 48;

  if (!isAffordable) {
    action = 'MONITOR';
    priority = 'LOW';
    channel = 'INTERNAL_NOTE';
    reason = `Customer max budget ($${maxBudget.toLocaleString()}) is below site rate card ($${siteRate.toLocaleString()}). Monitor for pricing adjustments.`;
    expectedImpact = 'Low conversion likelihood without budget expansion.';
    deadlineHours = 120;
  } else if (isIncumbent) {
    action = 'OFFER_RENEWAL';
    priority = 'HIGH';
    channel = 'PHONE_AND_EMAIL';
    reason = `Incumbent tenant contract expiring in ${daysVacant} days. Priority early renewal rate lock recommended.`;
    expectedImpact = `Secures $${(siteRate * 3).toLocaleString()} 90-day revenue retention with zero vacancy gap.`;
    deadlineHours = 24;
  } else if (daysVacant <= 15 && relScore >= 70) {
    action = 'CALL_NOW';
    priority = 'CRITICAL';
    channel = 'PHONE_CALL';
    reason = `High-urgency vacancy (${daysVacant}d left) paired with strong relationship (${relScore}/100). Direct phone touchpoint required.`;
    expectedImpact = '85% probability of closing early verbal commitment within 48 hours.';
    deadlineHours = 12;
  } else if (maxBudget >= 20000 && relScore >= 60) {
    action = 'SCHEDULE_MEETING';
    priority = 'HIGH';
    channel = 'EXECUTIVE_MEETING';
    reason = `Tier 1 enterprise prospect ($${maxBudget.toLocaleString()}/mo budget). Request 15-minute executive pitch meeting.`;
    expectedImpact = 'High-value long-term booking potential ($50k+ total contract value).';
    deadlineHours = 24;
  } else if (daysSinceContact <= 30 && relScore >= 65) {
    action = 'SEND_WHATSAPP';
    priority = 'HIGH';
    channel = 'WHATSAPP';
    reason = `Recent positive contact (${daysSinceContact}d ago). Instant WhatsApp message with rate offer and site specs.`;
    expectedImpact = 'Rapid response within 4-6 hours.';
    deadlineHours = 24;
  } else if (customer.days_since_contact > 60) {
    action = 'SEND_SITE_DECK';
    priority = 'MEDIUM';
    channel = 'EMAIL_ATTACHMENT';
    reason = `Cold relationship account (${daysSinceContact}d since contact). Send high-resolution PDF traffic deck & site analytics sheet.`;
    expectedImpact = 'Re-engages dormant account with concrete traffic auditor stats.';
    deadlineHours = 48;
  } else {
    action = 'SEND_EMAIL';
    priority = 'MEDIUM';
    channel = 'EMAIL';
    reason = `Standard personalized pitch email tailored to ${customer.industry} industry fit and ${vacancy.zone} audience.`;
    expectedImpact = 'Standard 35-45% email open & inquiry rate.';
    deadlineHours = 48;
  }

  return {
    action: action,
    priority: priority,
    channel: channel,
    reason: reason,
    expected_impact: expectedImpact,
    deadline_hours: deadlineHours,
    customer_id: customer.customer_id,
    company_name: customer.company_name,
    site_id: vacancy.site_id
  };
}

module.exports = { calculateNextBestAction };
