// backend/services/aiAgent.js
/**
 * AI Agentic Reasoning & LLM Integration Engine
 * ---------------------------------------------
 * Delegates directly to agentOrchestrator.js which runs live tool calls
 * against backend engines (vacancyEngine, scoringEngine, pitchEngine, etc.).
 * Zero hardcoded canned responses.
 */

const { processAgentQuery } = require('./agentOrchestrator');

async function askAIAgent(userQuery, context = {}) {
  const conversationId = context.conversationId || 'default_session';
  const result = await processAgentQuery(userQuery, conversationId);

  return {
    agent_thought: result.toolSteps.length ? result.toolSteps.join(' · ') : 'Executed decision trace pipeline',
    response_text: result.answer,
    intent: result.intent,
    confidence: result.confidence,
    toolsUsed: result.toolsUsed,
    decision_trace: result.toolSteps,
    entities: result.entities,
    actions: result.actions,
    suggested_actions: result.actions.map(a => a.label)
  };
}

module.exports = { askAIAgent };
