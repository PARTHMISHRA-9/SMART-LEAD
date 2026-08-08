// backend/tests/verifyAgent.js
// Run: node backend/tests/verifyAgent.js
// Tests the API-Powered Agent Orchestrator & 14 Backend Tools against live dataset.

const tools = require('../services/agentTools');
const { processAgentQuery } = require('../services/agentOrchestrator');

console.log('\n═════════════════════════════════════════════════════════════');
console.log('   AI AGENTIC SALES INTELLIGENCE VERIFICATION TEST SUITE');
console.log('═════════════════════════════════════════════════════════════\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ✕ [FAIL] ${message}`);
  }
}

async function runTests() {
  // Test 1: Tool get_dashboard_metrics
  try {
    const metrics = tools.get_dashboard_metrics();
    assert(metrics.total_hoardings === 25, 'Tool 1: get_dashboard_metrics returns 25 total hoardings');
    assert(typeof metrics.total_revenue_at_risk === 'number' && metrics.total_revenue_at_risk > 0, 'Tool 1: total_revenue_at_risk is valid number');
  } catch (e) {
    assert(false, `Tool 1 Failed: ${e.message}`);
  }

  // Test 2: Tool get_upcoming_vacancies
  try {
    const vacs = tools.get_upcoming_vacancies({ days: 30 });
    assert(Array.isArray(vacs), 'Tool 2: get_upcoming_vacancies returns array');
    assert(vacs.length > 0, 'Tool 2: returns 30-day vacancies');
  } catch (e) {
    assert(false, `Tool 2 Failed: ${e.message}`);
  }

  // Test 3: Tool get_hoarding_details
  try {
    const detail = tools.get_hoarding_details({ site_id: 'HRD-100' });
    assert(detail && detail.site_id === 'HRD-100', 'Tool 3: get_hoarding_details returns site HRD-100');
    assert(detail.location_name.includes('Kandivali'), 'Tool 3: location is Kandivali Flyover WEB');
  } catch (e) {
    assert(false, `Tool 3 Failed: ${e.message}`);
  }

  // Test 4: Tool get_top_leads
  try {
    const leads = tools.get_top_leads({ site_id: 'HRD-103' });
    assert(Array.isArray(leads) && leads.length > 0, 'Tool 4: get_top_leads returns candidates');
    assert(leads[0].overall_fit_score > 0, 'Tool 4: lead has fit score');
  } catch (e) {
    assert(false, `Tool 4 Failed: ${e.message}`);
  }

  // Test 5: Tool get_customer_details
  try {
    const cust = tools.get_customer_details({ customer_id: 'CUST-30' });
    assert(cust && cust.customer_id === 'CUST-30', 'Tool 5: get_customer_details returns CUST-30');
  } catch (e) {
    assert(false, `Tool 5 Failed: ${e.message}`);
  }

  // Test 6: Tool find_matching_sites
  try {
    const matches = tools.find_matching_sites({ customer_id: 'CUST-30' });
    assert(Array.isArray(matches) && matches.length > 0, 'Tool 6: find_matching_sites returns matches');
  } catch (e) {
    assert(false, `Tool 6 Failed: ${e.message}`);
  }

  // Test 7: Tool get_revenue_risk
  try {
    const risk = tools.get_revenue_risk();
    assert(risk.total_revenue_at_risk > 0, 'Tool 7: get_revenue_risk calculates portfolio risk');
  } catch (e) {
    assert(false, `Tool 7 Failed: ${e.message}`);
  }

  // Test 8: Tool get_revenue_battle
  try {
    const battle = tools.get_revenue_battle({ site_id: 'HRD-103' });
    assert(battle && battle.site_id === 'HRD-103', 'Tool 8: get_revenue_battle returns battle analysis');
  } catch (e) {
    assert(false, `Tool 8 Failed: ${e.message}`);
  }

  // Test 9: Tool get_site_dna
  try {
    const dna = tools.get_site_dna({ site_id: 'HRD-100' });
    assert(dna && dna.site_id === 'HRD-100', 'Tool 9: get_site_dna returns DNA profile');
  } catch (e) {
    assert(false, `Tool 9 Failed: ${e.message}`);
  }

  // Test 10: Tool get_customer_dna
  try {
    const dna = tools.get_customer_dna({ customer_id: 'CUST-30' });
    assert(dna && dna.customer_id === 'CUST-30', 'Tool 10: get_customer_dna returns DNA profile');
  } catch (e) {
    assert(false, `Tool 10 Failed: ${e.message}`);
  }

  // Test 11: Tool get_churn_risk
  try {
    const churn = tools.get_churn_risk({ site_id: 'HRD-103' });
    assert(churn && typeof churn.churn_risk_pct === 'number', 'Tool 11: get_churn_risk calculates churn risk');
  } catch (e) {
    assert(false, `Tool 11 Failed: ${e.message}`);
  }

  // Test 12: Tool generate_pitch
  try {
    const pitch = tools.generate_pitch({ site_id: 'HRD-103', customer_id: 'CUST-01', channel: 'WHATSAPP' });
    assert(pitch && pitch.channel === 'WHATSAPP' && pitch.content.length > 20, 'Tool 12: generate_pitch generates real pitch');
  } catch (e) {
    assert(false, `Tool 12 Failed: ${e.message}`);
  }

  // Test 13: Tool run_campaign_simulation
  try {
    const sim = tools.run_campaign_simulation({ site_id: 'HRD-100', discount: 10 });
    assert(sim && sim.simulated_fit_score > 0, 'Tool 13: run_campaign_simulation simulates scenario');
  } catch (e) {
    assert(false, `Tool 13 Failed: ${e.message}`);
  }

  // Test 14: Tool search_hoardings
  try {
    const res = tools.search_hoardings({ query: 'Borivali' });
    assert(Array.isArray(res) && res.length > 0, 'Tool 14: search_hoardings finds Borivali sites');
  } catch (e) {
    assert(false, `Tool 14 Failed: ${e.message}`);
  }

  // Test 15: Agent Orchestrator Multi-Step Flow
  try {
    const queryRes = await processAgentQuery('Which customer should I contact for HRD-103?');
    assert(queryRes.answer.includes('HRD-103'), 'Agent Flow: Query returns response for HRD-103');
    assert(queryRes.toolSteps.length > 0, 'Agent Flow: Query returns tool execution steps');
    assert(queryRes.actions.length > 0, 'Agent Flow: Query returns interactive action triggers');
  } catch (e) {
    assert(false, `Agent Flow Failed: ${e.message}`);
  }

  // Test 16: Multi-Turn Context Memory Test
  try {
    const sessionID = `test_sess_${Date.now()}`;
    await processAgentQuery('Tell me about HRD-103', sessionID);
    const followUp = await processAgentQuery('Who should I contact?', sessionID);
    assert(followUp.answer.includes('HRD-103'), 'Multi-Turn Context: Follow-up question remembers HRD-103 context');
  } catch (e) {
    assert(false, `Multi-Turn Context Test Failed: ${e.message}`);
  }

  console.log('\n─────────────────────────────────────────────────────────────');
  console.log(`  Tests Passed: ${passedTests} / ${totalTests}`);
  console.log(`  Result: ${passedTests === totalTests ? '✓ PASS — Agent Orchestrator & All 14 Tools Verified' : '✕ FAIL'}`);
  console.log('═════════════════════════════════════════════════════════════\n');
}

runTests();
