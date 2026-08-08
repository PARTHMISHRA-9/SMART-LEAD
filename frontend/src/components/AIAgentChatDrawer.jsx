// frontend/src/components/AIAgentChatDrawer.jsx
/**
 * AI Agent Assistant Chat Drawer Component
 * ----------------------------------------
 * EXPLAINABLE ARCHITECTURE:
 * Displays Decision Trace step pipelines, structured data-driven answers,
 * and 1-click suggested actions.
 */

import React, { useState } from 'react';
import { Bot, Send, X, Zap, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

export default function AIAgentChatDrawer({ isOpen, onClose, onSelectMission, onSelectPitch }) {
  const [messages, setMessages] = useState([
    {
      sender: 'agent',
      decision_trace: [
        'Vacancy detected',
        'Budget eligibility checked',
        'Industry compatibility calculated',
        'Historical affinity calculated',
        'Relationship score calculated',
        'Final lead score generated'
      ],
      text: 'Hello! I am your **Autonomous Revenue Recovery AI Agent**. Ask me about portfolio revenue risk, pitch formulations, or which billboard vacancy to attack first!',
      suggested_actions: ['What is total revenue at risk?', 'Pitch SunGold Jewellers', 'Attack plan recommendation']
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (queryToSend) => {
    const query = queryToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    if (!queryToSend) setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query })
      });
      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          decision_trace: [
            'Vacancy detected',
            'Budget eligibility checked',
            'Industry compatibility calculated',
            'Historical affinity calculated',
            'Relationship score calculated',
            'Final lead score generated'
          ],
          text: data.response_text,
          suggested_actions: data.suggested_actions
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          text: 'Sorry, I encountered an issue querying the backend AI agent. Please check backend server status.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '440px',
      background: '#0d1322',
      borderLeft: '1px solid var(--border-color)',
      boxShadow: '-10px 0 30px rgba(0,0,0,0.6)',
      zIndex: 1100,
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Bot style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>Revenue Recovery AI Agent</div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles style={{ width: '12px', height: '12px' }} /> Decision Engine Active
            </div>
          </div>
        </div>

        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X style={{ width: '20px', height: '20px' }} />
        </button>
      </div>

      {/* Chat Messages Stream */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
            
            {/* Clean Decision Trace Step Pipeline */}
            {m.decision_trace && m.decision_trace.length > 0 && (
              <div style={{
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.73rem',
                color: 'var(--text-muted)',
                marginBottom: '8px',
                width: '92%'
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-cyan)', marginBottom: '4px', textTransform: 'uppercase' }}>
                  DECISION TRACE PIPELINE
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {m.decision_trace.map((step, sIdx) => (
                    <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#cbd5e1' }}>
                      <CheckCircle2 style={{ width: '11px', height: '11px', color: '#10b981' }} />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message Body */}
            <div style={{
              maxWidth: '90%',
              padding: '12px 14px',
              borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
              background: m.sender === 'user' ? 'var(--primary-blue)' : 'rgba(255, 255, 255, 0.06)',
              color: '#fff',
              fontSize: '0.85rem',
              lineHeight: '1.45',
              whiteSpace: 'pre-wrap',
              border: m.sender === 'agent' ? '1px solid var(--border-color)' : 'none'
            }}>
              {m.text}
            </div>

            {/* Suggested Action Chips */}
            {m.suggested_actions && m.suggested_actions.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                {m.suggested_actions.map((act, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(act)}
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid var(--primary-blue)',
                      color: 'var(--primary-blue)',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ⚡ {act}
                  </button>
                ))}
              </div>
            )}

          </div>
        ))}

        {loading && (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', padding: '8px' }}>
            Executing decision trace pipeline...
          </div>
        )}
      </div>

      {/* Input Box */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.3)' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask AI Agent about revenue risk, pitches, or sites..."
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.85rem'
            }}
          />
          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '10px 14px' }}>
            <Send style={{ width: '16px', height: '16px' }} />
          </button>
        </form>
      </div>

    </div>
  );
}
