// backend/server.js
/**
 * Autonomous Billboard Revenue Intelligence Platform - Express REST API Server
 * ------------------------------------------------------------------------
 * EXPLAINABLE ARCHITECTURE & FULL API SUITE:
 * Mounts all engines: Vacancies, Lead Scoring, Revenue Risk Engine, Next Best Action Engine,
 * Recovery Mission Engine, Campaign Simulator, Objection Handler, Cross-Sell & Hidden Opportunities,
 * Customer & Site DNA, Why/Why Not Explainability, Revenue Battle, Revenue Chess, Demand Radar,
 * Data Quality Audit, Agent Activity Feed, Sales Kanban Pipeline, Vector Similarity, and AI Agent Chat.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { loadAllData } = require('./services/dataLoader');
const { detectVacancies } = require('./services/vacancyEngine');
const { rankLeadsForVacancy, calculateLeadScore } = require('./services/scoringEngine');
const { predictIncumbentChurn } = require('./services/churnEngine');
const { generatePersonalizedPitch } = require('./services/pitchEngine');

// New Engines & Services
const { calculateRevenueRisk } = require('./services/revenueRiskEngine');
const { calculateNextBestAction } = require('./services/nextBestActionEngine');
const { launchRecoveryMission } = require('./services/recoveryMissionEngine');
const { findSimilarCustomers, findSimilarSites } = require('./services/similarityEngine');
const { getTwoWayCrossSell, detectHiddenOpportunities } = require('./services/crossSellEngine');
const { auditDataHealth } = require('./services/dataQualityService');
const { simulateCampaignScenario } = require('./services/campaignSimulator');
const { handleCustomerObjection } = require('./services/objectionHandler');
const { initPipelineStore, getPipelineCards, updateCardStage } = require('./services/salesPipelineService');
const { logAgentActivity, getRecentActivities } = require('./services/agentActivityFeed');
const { updateSessionMemory, getSessionMemory } = require('./services/agentMemoryService');

// Advanced Intelligence & AI Agent Extensions
const { 
  getCustomerDNA, 
  getSiteDNA, 
  getWhyAndWhyNot, 
  getRevenueBattle, 
  getRevenueChess, 
  getFutureDemandRadar, 
  getAIDecisionTrace, 
  orchestrateRecoveryResponse 
} = require('./services/intelligenceEngine');

const { askAIAgent } = require('./services/aiAgent');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

let currentReferenceDate = '2026-08-01';

// Initialize Sales Kanban Pipeline Store on startup
try {
  const { hoardings, bookings, customers } = loadAllData();
  const initialVacancies = detectVacancies(hoardings, bookings, currentReferenceDate).map(v => ({
    ...v,
    top_leads: rankLeadsForVacancy(v, customers, bookings, 3)
  }));
  initPipelineStore(initialVacancies, customers);
} catch (e) {
  console.warn('Initial pipeline setup deferred:', e.message);
}

// 1. Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Autonomous Billboard Revenue Intelligence Platform',
    reference_date: currentReferenceDate,
    timestamp: new Date().toISOString()
  });
});

// 2. AI Agent Chat Assistant Endpoint
app.post('/api/agent/chat', async (req, res) => {
  try {
    const userQuery = req.body.message || req.body.query || '';
    const conversationId = req.body.conversationId || 'default_session';
    const context = req.body.context || {};

    const aiResponse = await askAIAgent(userQuery, {
      referenceDate: currentReferenceDate,
      conversationId: conversationId,
      ...context
    });
    
    logAgentActivity('AI_AGENT_CHAT', `AI Agent executed tools for query: "${userQuery}"`, { query: userQuery, toolsUsed: aiResponse.toolsUsed });

    res.json({
      status: 'SUCCESS',
      query: userQuery,
      answer: aiResponse.response_text,
      agent_thought: aiResponse.agent_thought,
      intent: aiResponse.intent,
      confidence: aiResponse.confidence,
      toolsUsed: aiResponse.toolsUsed,
      decision_trace: aiResponse.decision_trace,
      toolSteps: aiResponse.decision_trace,
      entities: aiResponse.entities,
      actions: aiResponse.actions,
      suggested_actions: aiResponse.suggested_actions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Executive Command Center Metrics Endpoint
app.get('/api/metrics', (req, res) => {
  try {
    const { hoardings, bookings, customers } = loadAllData();
    const vacancies = detectVacancies(hoardings, bookings, currentReferenceDate);
    
    const totalHoardings = hoardings.length;
    const vacanciesCount = vacancies.length;
    const occupiedHoardings = Math.max(0, totalHoardings - vacanciesCount);

    const totalRevenueAtRisk = vacancies.reduce((sum, v) => sum + v.revenue_at_risk, 0);

    let totalRecoverableRevenue = 0;
    let highFitLeadsCount = 0;
    let highChurnCustomersCount = 0;

    vacancies.forEach(vac => {
      const topLeads = rankLeadsForVacancy(vac, customers, bookings, 3);
      const risk = calculateRevenueRisk(vac, topLeads);
      totalRecoverableRevenue += risk.expected_recovery_value;
      if (topLeads[0] && topLeads[0].overall_fit_score >= 75) highFitLeadsCount++;

      const incumbentCust = customers.find(c => c.customer_id === vac.incumbent_customer_id);
      const incumbentBooking = bookings.find(b => b.site_id === vac.site_id && b.customer_id === vac.incumbent_customer_id);
      const churn = predictIncumbentChurn(vac, incumbentCust, incumbentBooking);
      if (churn.churn_risk_pct > 50) highChurnCustomersCount++;
    });

    const dataHealth = auditDataHealth(hoardings, bookings, customers);

    res.json({
      active_hoardings: totalHoardings,
      occupied_hoardings: occupiedHoardings,
      vacancies_count_90d: vacanciesCount,
      total_revenue_at_risk: totalRevenueAtRisk,
      recoverable_revenue: totalRecoverableRevenue,
      high_fit_leads_count: highFitLeadsCount,
      high_churn_customers_count: highChurnCustomersCount,
      open_recovery_missions: Math.min(12, vacanciesCount),
      data_health_score: dataHealth.data_health_score,
      reference_date: currentReferenceDate
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Vacancy Pipeline Endpoint
app.get('/api/vacancies', (req, res) => {
  try {
    const { hoardings, bookings, customers } = loadAllData();
    const strategyMode = req.query.strategy || 'BALANCED';
    const zoneFilter = req.query.zone;
    const urgencyFilter = req.query.urgency;
    const searchQuery = req.query.search ? req.query.search.toLowerCase() : null;

    let vacancies = detectVacancies(hoardings, bookings, currentReferenceDate);

    if (zoneFilter && zoneFilter !== 'ALL') vacancies = vacancies.filter(v => v.zone === zoneFilter);
    if (urgencyFilter && urgencyFilter !== 'ALL') {
      if (urgencyFilter === '0-30') vacancies = vacancies.filter(v => v.days_until_vacant <= 30);
      if (urgencyFilter === '31-60') vacancies = vacancies.filter(v => v.days_until_vacant > 30 && v.days_until_vacant <= 60);
      if (urgencyFilter === '61-90') vacancies = vacancies.filter(v => v.days_until_vacant > 60);
    }

    if (searchQuery) {
      vacancies = vacancies.filter(v => 
        v.site_id.toLowerCase().includes(searchQuery) ||
        v.location_name.toLowerCase().includes(searchQuery) ||
        v.zone.toLowerCase().includes(searchQuery)
      );
    }

    const resultVacancies = vacancies.map(vac => {
      const topLeads = rankLeadsForVacancy(vac, customers, bookings, 3, strategyMode);
      const revenueRisk = calculateRevenueRisk(vac, topLeads);
      const nextAction = topLeads[0] ? calculateNextBestAction(vac, topLeads[0]) : null;

      const incumbentCust = customers.find(c => c.customer_id === vac.incumbent_customer_id);
      const incumbentBooking = bookings.find(b => b.site_id === vac.site_id && b.customer_id === vac.incumbent_customer_id);
      const churnAnalysis = predictIncumbentChurn(vac, incumbentCust, incumbentBooking);

      return {
        ...vac,
        top_leads: topLeads,
        revenue_risk: revenueRisk,
        next_best_action: nextAction,
        incumbent_churn_analysis: churnAnalysis
      };
    });

    res.json({
      count: resultVacancies.length,
      reference_date: currentReferenceDate,
      vacancies: resultVacancies
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Customer DNA & Matching Sites
app.get('/api/customer/:customerId/dna', (req, res) => {
  try {
    const { customerId } = req.params;
    const { hoardings, bookings, customers } = loadAllData();
    const customer = customers.find(c => c.customer_id === customerId);

    if (!customer) return res.status(404).json({ error: `Customer ${customerId} not found.` });

    const dna = getCustomerDNA(customer, bookings, hoardings);
    const vacancies = detectVacancies(hoardings, bookings, currentReferenceDate);
    const matchingSites = vacancies.filter(v => Number(v.monthly_rate) <= Number(customer.max_budget_monthly)).map(v => ({
      ...v,
      match_score: calculateLeadScore(v, customer, bookings).overall_fit_score
    })).sort((a, b) => b.match_score - a.match_score).slice(0, 5);

    res.json({ customer_dna: dna, matching_sites: matchingSites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Site DNA & Matching Customers
app.get('/api/site/:siteId/dna', (req, res) => {
  try {
    const { siteId } = req.params;
    const { hoardings, bookings, customers } = loadAllData();
    const hoarding = hoardings.find(h => h.site_id === siteId);

    if (!hoarding) return res.status(404).json({ error: `Site ${siteId} not found.` });

    const dna = getSiteDNA(hoarding, bookings);
    const vacancies = detectVacancies(hoardings, bookings, currentReferenceDate);
    const vacancy = vacancies.find(v => v.site_id === siteId) || hoarding;

    const matchingCustomers = rankLeadsForVacancy(vacancy, customers, bookings, 5);

    res.json({ site_dna: dna, matching_customers: matchingCustomers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Why & Why Not Explainability
app.get('/api/vacancies/:siteId/why-why-not', (req, res) => {
  try {
    const { siteId } = req.params;
    const { hoardings, bookings, customers } = loadAllData();
    const vacancies = detectVacancies(hoardings, bookings, currentReferenceDate);
    const vacancy = vacancies.find(v => v.site_id === siteId) || vacancies[0];

    const rankedLeads = rankLeadsForVacancy(vacancy, customers, bookings, 4);
    const whyWhyNot = getWhyAndWhyNot(vacancy, rankedLeads);

    res.json(whyWhyNot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Revenue Battle
app.get('/api/vacancies/:siteId/revenue-battle', (req, res) => {
  try {
    const { siteId } = req.params;
    const { hoardings, bookings, customers } = loadAllData();
    const vacancies = detectVacancies(hoardings, bookings, currentReferenceDate);
    const vacancy = vacancies.find(v => v.site_id === siteId) || vacancies[0];

    const rankedLeads = rankLeadsForVacancy(vacancy, customers, bookings, 4);
    const battle = getRevenueBattle(vacancy, rankedLeads);

    res.json(battle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Future Demand Radar
app.get('/api/demand-radar', (req, res) => {
  try {
    const { hoardings, bookings } = loadAllData();
    const radar = getFutureDemandRadar(hoardings, bookings);
    res.json({ demand_radar: radar });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 10. Launch Recovery Mission Endpoint
app.post('/api/mission/launch', (req, res) => {
  try {
    const { siteId, strategyMode = 'BALANCED' } = req.body;
    const { hoardings, bookings, customers } = loadAllData();

    const vacancies = detectVacancies(hoardings, bookings, currentReferenceDate);
    const vacancy = vacancies.find(v => v.site_id === siteId) || vacancies[0];

    const mission = launchRecoveryMission(vacancy, customers, bookings, `RM-${Date.now()}`, strategyMode);
    
    logAgentActivity('RECOVERY_MISSION_LAUNCHED', `Launched Autonomous Recovery Mission for site ${vacancy.site_id} (${vacancy.location_name}). Expected recovery: ₹${mission.expected_recovery_value.toLocaleString()}.`, { site_id: vacancy.site_id });
    updateSessionMemory({ selected_site_id: vacancy.site_id, selected_customer_id: mission.top_customer.customer_id });

    res.json({ status: 'SUCCESS', mission: mission });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 11. Multi-Agent Orchestrator Endpoint
app.post('/api/orchestrator/run', (req, res) => {
  try {
    const { siteId, customerId } = req.body;
    const { hoardings, bookings, customers } = loadAllData();

    const vacancies = detectVacancies(hoardings, bookings, currentReferenceDate);
    const vacancy = vacancies.find(v => v.site_id === siteId) || vacancies[0];
    const customer = customers.find(c => c.customer_id === customerId);

    const orchestrated = orchestrateRecoveryResponse(vacancy, customer, customers, bookings);
    logAgentActivity('ORCHESTRATOR_EXECUTED', `Multi-Agent Orchestrator executed unified recovery response for site ${vacancy.site_id}.`, { site_id: vacancy.site_id });

    res.json(orchestrated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 12. Personalised AI Pitch Generation Endpoint
app.post('/api/pitch/generate', (req, res) => {
  try {
    const { siteId, customerId, channel = 'EMAIL', tone = 'CONSULTATIVE' } = req.body;
    const { hoardings, bookings, customers } = loadAllData();

    const vacancy = detectVacancies(hoardings, bookings, currentReferenceDate).find(v => v.site_id === siteId);
    const customer = customers.find(c => c.customer_id === customerId);

    if (!vacancy || !customer) return res.status(400).json({ error: 'Invalid siteId or customerId for pitch generation.' });

    const leadScore = calculateLeadScore(vacancy, customer, bookings);
    const pitch = generatePersonalizedPitch(vacancy, leadScore, channel, tone);

    logAgentActivity('PITCH_GENERATED', `Generated ${channel} pitch for customer ${customer.company_name} on site ${vacancy.site_id}. Quoted rate: ₹${pitch.quoted_rate.toLocaleString()}/mo.`, { site_id: siteId, customer_id: customerId });

    res.json({ status: 'SUCCESS', pitch: pitch, lead_score: leadScore.overall_fit_score, reasons: leadScore.reasons });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 13. "What-If?" Campaign Simulator Endpoint
app.post('/api/simulator/run', (req, res) => {
  try {
    const { siteId, customerId, budget, duration, discount, strategyMode = 'BALANCED' } = req.body;
    const { hoardings, bookings, customers } = loadAllData();

    const vacancy = detectVacancies(hoardings, bookings, currentReferenceDate).find(v => v.site_id === siteId) || detectVacancies(hoardings, bookings, currentReferenceDate)[0];
    const customer = customers.find(c => c.customer_id === customerId) || customers[0];

    const simulation = simulateCampaignScenario(vacancy, customer, customers, bookings, { budget, duration, discount, strategyMode });
    logAgentActivity('SIMULATOR_EXECUTED', `Ran Campaign Simulator for ${customer.company_name} on ${vacancy.site_id}. Rank shifted: ${simulation.shift_explanation}`, { site_id: vacancy.site_id });

    res.json({ status: 'SUCCESS', simulation: simulation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 14. Customer Objection Handler Endpoint
app.post('/api/objection/simulate', (req, res) => {
  try {
    const { objectionType = 'TOO_EXPENSIVE', siteId, customerId } = req.body;
    const { hoardings, bookings, customers } = loadAllData();

    const vacancy = detectVacancies(hoardings, bookings, currentReferenceDate).find(v => v.site_id === siteId) || detectVacancies(hoardings, bookings, currentReferenceDate)[0];
    const customer = customers.find(c => c.customer_id === customerId) || customers[0];

    const handling = handleCustomerObjection(objectionType, vacancy, customer);
    res.json({ status: 'SUCCESS', objection_type: objectionType, handling: handling });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 15. Cross-Sell & Hidden Opportunities
app.get('/api/cross-sell', (req, res) => {
  try {
    const { siteId, customerId } = req.query;
    const { hoardings, bookings, customers } = loadAllData();

    const vacancies = detectVacancies(hoardings, bookings, currentReferenceDate);
    const vacancy = vacancies.find(v => v.site_id === siteId) || vacancies[0];
    const customer = customers.find(c => c.customer_id === customerId) || customers[0];

    const crossSell = getTwoWayCrossSell(vacancy, customer, hoardings, customers, bookings);
    res.json({ site_id: vacancy.site_id, customer_id: customer.customer_id, cross_sell: crossSell });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/opportunities/hidden', (req, res) => {
  try {
    const { hoardings, bookings, customers } = loadAllData();
    const vacancies = detectVacancies(hoardings, bookings, currentReferenceDate);
    const opps = detectHiddenOpportunities(vacancies, customers, bookings);

    res.json({ count: opps.length, opportunities: opps });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 16. Sales Kanban Pipeline
app.get('/api/pipeline', (req, res) => {
  res.json({ cards: getPipelineCards() });
});

app.post('/api/pipeline/stage', (req, res) => {
  const { cardId, newStage } = req.body;
  const updated = updateCardStage(cardId, newStage);
  if (!updated) return res.status(404).json({ error: 'Pipeline card not found.' });
  
  logAgentActivity('PIPELINE_STAGE_UPDATED', `Moved lead card ${cardId} to stage: ${newStage}`, { card_id: cardId, stage: newStage });
  res.json({ status: 'SUCCESS', card: updated });
});

// 17. Data Quality Audit
app.get('/api/data/health', (req, res) => {
  try {
    const { hoardings, bookings, customers } = loadAllData();
    const audit = auditDataHealth(hoardings, bookings, customers);
    res.json(audit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 18. Activity Stream & Memory
app.get('/api/agent/activities', (req, res) => {
  res.json({ activities: getRecentActivities(20) });
});

app.get('/api/agent/memory', (req, res) => {
  res.json(getSessionMemory());
});

// 19. Vector Similarity Search
app.get('/api/analytics/similarity/customers', (req, res) => {
  try {
    const { customerId } = req.query;
    const { customers } = loadAllData();
    const target = customers.find(c => c.customer_id === customerId) || customers[0];

    const similar = findSimilarCustomers(target, customers, 5);
    res.json({ target_customer: target, similar_customers: similar });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/analytics/similarity/sites', (req, res) => {
  try {
    const { siteId } = req.query;
    const { hoardings } = loadAllData();
    const target = hoardings.find(h => h.site_id === siteId) || hoardings[0];

    const similar = findSimilarSites(target, hoardings, 5);
    res.json({ target_site: target, similar_sites: similar });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 20. All Hoardings with Geographic Data (for Map)
// Returns every site with its real latitude, longitude, and location info directly from hoardings.csv
app.get('/api/hoardings', (req, res) => {
  try {
    const { hoardings, bookings } = loadAllData();
    const vacancies = detectVacancies(hoardings, bookings, currentReferenceDate);
    const vacMap = new Map(vacancies.map(v => [v.site_id, v]));

    // Zone → pincode mapping derived from known Mumbai locality pincodes
    const zonePincodes = {
      'Kandivali':  '400067',
      'Borivali':   '400066',
      'Dahisar':    '400068',
      'Malad':      '400064',
      'Goregaon':   '400063',
      'Andheri':    '400053',
      'Powai':      '400076',
      'BKC':        '400051',
      'Sion':       '400022',
      'Thane':      '400601',
    };

    const sites = hoardings.map(h => {
      const vacObj = vacMap.get(h.site_id);
      let status = 'OCCUPIED';
      if (vacObj) {
        if (vacObj.days_until_vacant <= 0) status = 'VACANT';
        else if (vacObj.days_until_vacant <= 60) status = 'VACATING_SOON';
      }

      // Validate coordinates — must be real numbers within Mumbai Metropolitan Region bounds
      // MMR approx bounds: lat 18.9–19.45, lng 72.75–73.15
      const lat = typeof h.latitude === 'number' ? h.latitude : null;
      const lng = typeof h.longitude === 'number' ? h.longitude : null;
      const inMMR = lat && lng && lat >= 18.9 && lat <= 19.45 && lng >= 72.75 && lng <= 73.15;

      return {
        site_id: h.site_id,
        location_name: h.location_name,
        zone: h.zone,
        monthly_rate: h.monthly_rate,
        size: h.size,
        traffic_score: h.traffic_score,
        latitude: inMMR ? lat : null,
        longitude: inMMR ? lng : null,
        pincode: zonePincodes[h.zone] || null,
        city: 'Mumbai',
        status: status,
        days_until_vacant: vacObj ? vacObj.days_until_vacant : null,
        revenue_at_risk: vacObj ? vacObj.revenue_at_risk : null,
        coordinates_valid: !!inMMR
      };
    });

    // Validation summary
    const validCount = sites.filter(s => s.coordinates_valid).length;
    const invalidCount = sites.length - validCount;
    const latlngs = sites.filter(s => s.coordinates_valid).map(s => `${s.latitude},${s.longitude}`);
    const uniqueCoords = new Set(latlngs);
    const duplicateCount = latlngs.length - uniqueCoords.size;

    res.json({
      total: sites.length,
      valid_coordinates: validCount,
      invalid_coordinates: invalidCount,
      duplicate_coordinates: duplicateCount,
      reference_date: currentReferenceDate,
      sites: sites
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 21. 90-Day Timeline Visual Endpoint
app.get('/api/timeline', (req, res) => {
  try {
    const { hoardings, bookings } = loadAllData();
    const vacancies = detectVacancies(hoardings, bookings, currentReferenceDate);

    const sampleSites = hoardings.slice(0, 35).map(h => {
      const siteBookings = bookings.filter(b => b.site_id === h.site_id);
      const vacancyObj = vacancies.find(v => v.site_id === h.site_id);

      return {
        site_id: h.site_id,
        location_name: h.location_name,
        zone: h.zone,
        monthly_rate: h.monthly_rate,
        is_vacant_in_90d: !!vacancyObj,
        free_from_date: vacancyObj ? vacancyObj.free_from_date : null,
        days_until_vacant: vacancyObj ? vacancyObj.days_until_vacant : 999,
        bookings: siteBookings.map(b => ({
          booking_id: b.booking_id,
          customer_name: b.customer_name,
          start_date: b.start_date,
          end_date: b.end_date,
          status: b.status
        }))
      };
    });

    res.json({ reference_date: currentReferenceDate, sites: sampleSites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 21. CSV Export Endpoint
app.get('/api/export/:dataset', (req, res) => {
  const { dataset } = req.params;
  const filePath = path.join(__dirname, 'data', `${dataset}.csv`);

  if (!fs.existsSync(filePath)) return res.status(404).json({ error: `Dataset ${dataset}.csv not found.` });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${dataset}.csv"`);
  res.sendFile(filePath);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Autonomous Billboard Revenue Intelligence Platform running on http://localhost:${PORT}`);
});
