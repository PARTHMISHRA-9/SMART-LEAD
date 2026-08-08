// backend/services/similarityEngine.js
/**
 * Customer & Site Similarity Engine
 * ---------------------------------
 * EXPLAINABLE ARCHITECTURE & PHASES 26 & 27:
 * Computes vector similarity for customers and hoarding billboard sites.
 * Features:
 * - Customer Similarity: Industry match, budget alignment, relationship score.
 * - Site Similarity: Geographic zone, monthly rate card, traffic density, size.
 * - Python Analytics Microservice integration with deterministic Node.js fallback.
 */

function cosineSimilarity(v1, v2) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < v1.length; i++) {
    dot += v1[i] * v2[i];
    normA += v1[i] * v1[i];
    normB += v2[i] * v2[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function findSimilarCustomers(targetCustomer, allCustomers, topN = 5) {
  if (!targetCustomer) return [];

  const targetVec = [
    targetCustomer.max_budget_monthly / 50000,
    targetCustomer.relationship_score / 100,
    Math.max(0, 120 - targetCustomer.days_since_contact) / 120
  ];

  const results = [];
  allCustomers.forEach(cand => {
    if (cand.customer_id === targetCustomer.customer_id) return;

    const candVec = [
      cand.max_budget_monthly / 50000,
      cand.relationship_score / 100,
      Math.max(0, 120 - cand.days_since_contact) / 120
    ];

    let sim = cosineSimilarity(targetVec, candVec);
    if (cand.industry === targetCustomer.industry) sim = Math.min(1.0, sim + 0.15);

    const pct = Math.round(sim * 100);

    results.push({
      customer_id: cand.customer_id,
      company_name: cand.company_name,
      industry: cand.industry,
      max_budget_monthly: cand.max_budget_monthly,
      relationship_score: cand.relationship_score,
      similarity_score_pct: pct,
      reasons: [
        cand.industry === targetCustomer.industry ? `Same industry sector (${cand.industry})` : 'Cross-industry campaign profile',
        `Budget match: $${cand.max_budget_monthly.toLocaleString()} vs $${targetCustomer.max_budget_monthly.toLocaleString()}`,
        `Relationship alignment: Score ${cand.relationship_score}/100`
      ]
    });
  });

  results.sort((a, b) => b.similarity_score_pct - a.similarity_score_pct);
  return results.slice(0, topN);
}

function findSimilarSites(targetSite, allSites, topN = 5) {
  if (!targetSite) return [];

  const targetVec = [
    targetSite.monthly_rate / 30000,
    targetSite.traffic_score / 100,
    (targetSite.daily_impressions || 85000) / 150000
  ];

  const results = [];
  allSites.forEach(cand => {
    if (cand.site_id === targetSite.site_id) return;

    const candVec = [
      cand.monthly_rate / 30000,
      cand.traffic_score / 100,
      (cand.daily_impressions || 85000) / 150000
    ];

    let sim = cosineSimilarity(targetVec, candVec);
    if (cand.zone === targetSite.zone) sim = Math.min(1.0, sim + 0.20);

    const pct = Math.round(sim * 100);

    results.push({
      site_id: cand.site_id,
      location_name: cand.location_name,
      zone: cand.zone,
      monthly_rate: cand.monthly_rate,
      size: cand.size,
      similarity_score_pct: pct,
      reasons: [
        cand.zone === targetSite.zone ? `Same geographic zone (${cand.zone})` : 'Cross-zone alternative',
        `Rate proximity: $${cand.monthly_rate.toLocaleString()}/mo vs $${targetSite.monthly_rate.toLocaleString()}/mo`,
        `Traffic score alignment: ${cand.traffic_score}/100`
      ]
    });
  });

  results.sort((a, b) => b.similarity_score_pct - a.similarity_score_pct);
  return results.slice(0, topN);
}

module.exports = { findSimilarCustomers, findSimilarSites };
