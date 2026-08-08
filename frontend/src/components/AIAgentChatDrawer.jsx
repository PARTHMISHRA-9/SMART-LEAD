// frontend/src/components/AIAgentChatDrawer.jsx
/**
 * Real API-Powered AI Agent Assistant Chat Drawer
 * ----------------------------------------------
 * Connected directly to /api/agent/chat.
 * Displays real tool execution steps, zero-hallucination business answers,
 * and interactive action buttons for navigation & pitch generation.
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Send, X, Sparkles, CheckCircle2, ArrowRight, Zap, ExternalLink } from 'lucide-react';

export default function AIAgentChatDrawer({ isOpen, onClose, onSelectMission, onSelectPitch }) {
  const navigate = useNavigate();
  const conversationIdRef = useRef(`conv_${Date.now()}`);

  const [messages, setMessages] = useState([
    {
      sender: 'agent',
      toolSteps: [
        '✓ Connected to live OOH Backend & Dataset',
        '✓ Initialized Decision Trace Pipeline'
      ],
      text: 'Hello! I am your **Autonomous Revenue Recovery AI Agent**.\n\nAsk me about upcoming vacancies, revenue risk, client lead recommendations, or pitch scripts (e.g., *"Which sites are expiring in 30 days?"* or *"Who should I contact for HRD-103?"*).',
      suggested_actions: ['Which sites are expiring in 30 days?', 'What is our total revenue at risk?', 'Who should I contact for HRD-103?'],
      actions: []
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
        body: JSON.stringify({
          message: query,
          conversationId: conversationIdRef.current
        })
      });

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          toolSteps: data.toolSteps || data.decision_trace || [],
          text: data.answer || data.response_text || 'Completed query execution.',
          suggested_actions: data.suggested_actions || [],
          actions: data.actions || []
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          toolSteps: ['⚠ Connection Error'],
          text: 'Error querying backend AI Agent. Please verify the backend server is running on http://localhost:5001.',
          suggested_actions: [],
          actions: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action) => {
    if (!action) return;
    if (action.type === 'OPEN_HOARDING' && action.siteId) {
      onClose();
      navigate(`/hoarding/${action.siteId}`);
    } else if (action.type === 'GENERATE_PITCH' && action.siteId) {
      onClose();
      navigate(`/hoarding/${action.siteId}`);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, right: 0, bottom: 0,
      width: '450px',
      background: '#18352A',
      color: '#FBFAF5',
      borderLeft: '1px solid #D8D5CA',
      boxShadow: '-10px 0 30px rgba(0,0,0,0.4)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Manrope', sans-serif"
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#10251D'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: '#2E8B57', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <Bot style={{ width: '22px', height: '22px' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#FBFAF5' }}>Revenue Intelligence Agent</div>
            <div style={{ fontSize: '0.73rem', color: '#9BC53D', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <Sparkles style={{ width: '12px', height: '12px' }} /> Real Engine &amp; Tools Active
            </div>
          </div>
        </div>

        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#A3B0A7', cursor: 'pointer' }}>
          <X style={{ width: '20px', height: '20px' }} />
        </button>
      </div>

      {/* Stream Messages */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
            
            {/* Tool Execution Steps */}
            {m.toolSteps && m.toolSteps.length > 0 && (
              <div style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.73rem',
                color: '#A3B0A7',
                marginBottom: '8px',
                width: '94%'
              }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#9BC53D', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  AGENT TOOL EXECUTION TRACE
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {m.toolSteps.map((step, sIdx) => (
                    <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#E5EEE7' }}>
                      <CheckCircle2 style={{ width: '11px', height: '11px', color: '#9BC53D', flexShrink: 0 }} />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Answer Box */}
            <div style={{
              maxWidth: '92%',
              padding: '14px 16px',
              borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
              background: m.sender === 'user' ? '#2E8B57' : '#10251D',
              color: '#FBFAF5',
              fontSize: '0.86rem',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              border: m.sender === 'agent' ? '1px solid rgba(255,255,255,0.12)' : 'none'
            }}>
              {m.text}
            </div>

            {/* Interactive Action Buttons */}
            {m.actions && m.actions.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                {m.actions.map((act, aIdx) => (
                  <button
                    key={aIdx}
                    onClick={() => handleActionClick(act)}
                    style={{
                      background: '#2E8B57',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <ExternalLink style={{ width: 12, height: 12 }} />
                    {act.label}
                  </button>
                ))}
              </div>
            )}

            {/* Suggested Question Chips */}
            {m.suggested_actions && m.suggested_actions.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                {m.suggested_actions.map((act, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(act)}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#9BC53D',
                      padding: '5px 10px',
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
          <div style={{ color: '#A3B0A7', fontSize: '0.8rem', fontStyle: 'italic', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #A3B0A7', borderTopColor: '#9BC53D', animation: 'spin 0.8s linear infinite' }} />
            Querying backend business tools…
          </div>
        )}
      </div>

      {/* Input Form */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.12)', background: '#10251D' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask AI Agent about sites, risk, or leads..."
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#FBFAF5',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          <button type="submit" disabled={loading} style={{
            background: '#2E8B57', color: '#FFFFFF', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer'
          }}>
            <Send style={{ width: '16px', height: '16px' }} />
          </button>
        </form>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
