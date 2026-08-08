// backend/services/salesPipelineService.js
/**
 * Sales Pipeline Kanban Service
 * -----------------------------
 * EXPLAINABLE ARCHITECTURE & PHASE 15 REQUIREMENT:
 * Manages sales pipeline stages for Billboard revenue recovery:
 * Stages: NEW | CONTACTED | QUALIFIED | MEETING | PROPOSAL | NEGOTIATION | WON | LOST
 * 
 * Persists lead pipeline stage transitions in memory and disk state.
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '../data/pipeline_state.json');

// In-memory state store
let pipelineStore = {};

function initPipelineStore(vacancies, customers) {
  if (fs.existsSync(STATE_FILE)) {
    try {
      pipelineStore = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      return;
    } catch (e) {
      console.warn('Could not load pipeline_state.json, reinitializing...');
    }
  }

  // Initialize pipeline items for initial vacancies
  pipelineStore = {};
  vacancies.slice(0, 15).forEach((vac, idx) => {
    const topLead = vac.top_leads ? vac.top_leads[0] : null;
    if (!topLead) return;

    let stage = 'NEW';
    if (idx % 5 === 1) stage = 'CONTACTED';
    if (idx % 5 === 2) stage = 'QUALIFIED';
    if (idx % 5 === 3) stage = 'PROPOSAL';
    if (idx % 5 === 4) stage = 'NEGOTIATION';

    const cardId = `CARD-${vac.site_id}-${topLead.customer_id}`;
    pipelineStore[cardId] = {
      card_id: cardId,
      site_id: vac.site_id,
      location_name: vac.location_name,
      customer_id: topLead.customer_id,
      company_name: topLead.company_name,
      industry: topLead.industry,
      fit_score: topLead.overall_fit_score,
      monthly_rate: vac.monthly_rate,
      expected_revenue: vac.monthly_rate * 3,
      days_until_vacant: vac.days_until_vacant,
      stage: stage,
      updated_at: new Date().toISOString()
    };
  });

  savePipelineStore();
}

function savePipelineStore() {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(pipelineStore, null, 2));
  } catch (err) {
    console.error('Failed to save pipeline state:', err);
  }
}

function getPipelineCards() {
  return Object.values(pipelineStore);
}

function updateCardStage(cardId, newStage) {
  if (pipelineStore[cardId]) {
    pipelineStore[cardId].stage = newStage;
    pipelineStore[cardId].updated_at = new Date().toISOString();
    savePipelineStore();
    return pipelineStore[cardId];
  }
  return null;
}

module.exports = { initPipelineStore, getPipelineCards, updateCardStage };
