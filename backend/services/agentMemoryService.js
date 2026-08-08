// backend/services/agentMemoryService.js
/**
 * Agent Session Memory Service
 * ----------------------------
 * EXPLAINABLE ARCHITECTURE & PHASE 20 REQUIREMENT:
 * Maintains lightweight in-session memory context for:
 * - Currently selected site ID & customer ID
 * - Active strategy mode
 * - Recent recommendations & generated pitch cache
 * - Dismissed alerts
 * 
 * Enables natural follow-up queries (e.g. "Show me the best alternative to the currently selected customer").
 */

let sessionMemory = {
  selected_site_id: null,
  selected_customer_id: null,
  strategy_mode: 'BALANCED',
  recent_pitches: [],
  dismissed_alerts: []
};

function updateSessionMemory(updates = {}) {
  sessionMemory = {
    ...sessionMemory,
    ...updates
  };
  return sessionMemory;
}

function getSessionMemory() {
  return sessionMemory;
}

function recordPitchInMemory(siteId, customerId, pitchContent) {
  sessionMemory.recent_pitches.unshift({
    site_id: siteId,
    customer_id: customerId,
    pitch: pitchContent,
    timestamp: new Date().toISOString()
  });
  if (sessionMemory.recent_pitches.length > 10) {
    sessionMemory.recent_pitches.pop();
  }
}

module.exports = { updateSessionMemory, getSessionMemory, recordPitchInMemory };
