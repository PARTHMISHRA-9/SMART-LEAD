// backend/services/crossSellEngine.js
/**
 * Cross-Sell & Hidden Opportunities Engine
 * ----------------------------------------
 * EXPLAINABLE ARCHITECTURE & PHASES 16 & 17:
 * 1. Two-Way Cross-Sell Engine:
 *    - "Customers who should also see this site"
 *    - "Other sites this customer should also consider"
 * 2. Hidden Opportunities Engine:
 *    - Uncontacted high-budget prospects.
 *    - Customers whose budget fits premium sites.
 *    - Customers with high relationship score but no active booking.
 *    - Nearby alternative recommendations.
 */

const { findSimilarSites, findSimilarCustomers } = require('./similarityEngine');

function getTwoWayCrossSell(vacancy, topLead, allSites, allCustomers, allBookings) {
  if (!vacancy || !topLead) return { suggested_sites: [], target_customers: [] };

  // 1. Sites this customer should also consider
  const candidateSites = allSites.filter(s => s.site_id !== vacancy.site_id && s.monthly_rate <= topLead.max_budget_monthly);
  const similarSites = findSimilarSites(vacancy, candidateSites, 4);

  // 2. Customers who should also see this site
  const similarCustomers = findSimilarCustomers(topLead, allCustomers, 4);

  return {
    suggested_sites_for_customer: similarSites,
    target_customers_for_site: similarCustomers
  };
}

function detectHiddenOpportunities(vacancies, customers, bookings) {
  const opportunities = [];

  // Opportunity 1: Uncontacted High-Budget Enterprise Accounts (> $20k budget & > 60d uncontacted)
  customers.forEach(cust => {
    if (cust.max_budget_monthly >= 20000 && cust.days_since_contact > 60) {
      // Find matching vacant site
      const matchingVacant = vacancies.find(v => v.monthly_rate <= cust.max_budget_monthly);
      if (matchingVacant) {
        opportunities.push({
          type: 'UNCONTACTED_ENTERPRISE_PROSPECT',
          title: 'Uncontacted Enterprise Lead',
          company_name: cust.company_name,
          customer_id: cust.customer_id,
          recommended_site_id: matchingVacant.site_id,
          recommended_site_name: matchingVacant.location_name,
          reason: `High budget tier ($${cust.max_budget_monthly.toLocaleString()}/mo) but uncontacted for ${cust.days_since_contact} days. Perfect fit for ${matchingVacant.zone}.`,
          expected_value: matchingVacant.monthly_rate * 3,
          action_prompt: 'Re-engage Enterprise Account'
        });
      }
    }
  });

  // Opportunity 2: High Relationship Score Accounts without Active Booking
  const activeCustomerIds = new Set(bookings.filter(b => b.status === 'ACTIVE').map(b => b.customer_id));
  customers.forEach(cust => {
    if (cust.relationship_score >= 80 && !activeCustomerIds.has(cust.customer_id)) {
      const topSite = vacancies[0];
      if (topSite) {
        opportunities.push({
          type: 'HIGH_LOYALTY_UNBOOKED_ACCOUNT',
          title: 'High Loyalty Unbooked Account',
          company_name: cust.company_name,
          customer_id: cust.customer_id,
          recommended_site_id: topSite.site_id,
          recommended_site_name: topSite.location_name,
          reason: `Relationship score is ${cust.relationship_score}/100, but has no active billboard booking. Prime candidate for quick lock-in.`,
          expected_value: topSite.monthly_rate * 3,
          action_prompt: 'Offer VIP Loyalty Package'
        });
      }
    }
  });

  // Opportunity 3: Budget Expansion Match
  vacancies.slice(0, 5).forEach(vac => {
    const budgetUpgradeCust = customers.find(c => c.max_budget_monthly >= vac.monthly_rate * 1.3);
    if (budgetUpgradeCust) {
      opportunities.push({
        type: 'BUDGET_UPGRADE_MATCH',
        title: 'Premium Budget Headroom Match',
        company_name: budgetUpgradeCust.company_name,
        customer_id: budgetUpgradeCust.customer_id,
        recommended_site_id: vac.site_id,
        recommended_site_name: vac.location_name,
        reason: `Customer max budget ($${budgetUpgradeCust.max_budget_monthly.toLocaleString()}) provides $${(budgetUpgradeCust.max_budget_monthly - vac.monthly_rate).toLocaleString()} headroom above site rate card.`,
        expected_value: vac.monthly_rate * 3,
        action_prompt: 'Pitch Premium Unipole Upgrade'
      });
    }
  });

  return opportunities.slice(0, 8);
}

module.exports = { getTwoWayCrossSell, detectHiddenOpportunities };
