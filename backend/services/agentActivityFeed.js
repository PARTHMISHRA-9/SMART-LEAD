// backend/services/agentActivityFeed.js
/**
 * Real-Time AI Agent Activity Feed Service
 * ----------------------------------------
 * EXPLAINABLE ARCHITECTURE & PHASE 19 REQUIREMENT:
 * Maintains a live audit stream of agentic system events:
 * - Vacancy detections
 * - Lead fit evaluations & score recalculations
 * - Recovery mission launches
 * - Pitch generations
 * - Strategy mode changes
 */

const activityLogs = [];

function logAgentActivity(actionType, message, metadata = {}) {
  const logItem = {
    id: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action_type: actionType,
    message: message,
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    metadata: metadata
  };

  activityLogs.unshift(logItem);
  if (activityLogs.length > 50) {
    activityLogs.pop();
  }
  return logItem;
}

function getRecentActivities(limit = 15) {
  if (activityLogs.length === 0) {
    // Populate initial sample activity stream
    logAgentActivity('SYSTEM_INIT', 'Autonomous Billboard Revenue Recovery Agent initialized.');
    logAgentActivity('VACANCY_SCAN', 'Scanned 300 hoardings for 90-day vacancy boundaries.');
    logAgentActivity('FIT_CALCULATION', 'Evaluated multi-factor lead fit scores for 80 enterprise customers.');
    logAgentActivity('REVENUE_RISK', 'Calculated $11.4M total 90-day revenue exposure across inventory.');
  }
  return activityLogs.slice(0, limit);
}

module.exports = { logAgentActivity, getRecentActivities };
