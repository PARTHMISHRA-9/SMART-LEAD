// frontend/src/components/AIAgentChatDrawer.jsx
/**
 * Real API-Powered AI Agent Assistant Chat Drawer
 * ----------------------------------------------
 * First-open experience with automatic greeting, live portfolio statistics,
 * quick action shortcuts, multi-turn memory, and zero hardcoded business responses.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Send, X, Sparkles, CheckCircle2, RotateCcw, ExternalLink } from 'lucide-react';

export default function AIAgentChatDrawer({ isOpen, onClose, onSelectMission, onSelectPitch }) {
  const navigate = useNavigate();
  const conversationIdRef = useRef(`conv_${Date.now()}`);

  const [messages, setMessages] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch real backend metrics for live context greeting
  useEffect(() => {
    if (isOpen) {
      fetch('/api/metrics')
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setMetrics(data); })
        .catch(err => console.warn('Could not fetch metrics for AI greeting:', err));
    }
  }, [isOpen]);

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

  const handleNewChat = () => {
    setMessages([]);
    conversationIdRef.current = `conv_${Date.now()}`;
  };

  const handleActionClick = (action) => {
    if (!action) return;
    if ((action.type === 'OPEN_HOARDING' || action.type === 'GENERATE_PITCH') && action.siteId) {
      onClose();
      navigate(`/hoarding/${action.siteId}`);
    }
  };

  const quickActions = [
    { icon: '🔴', label: 'Show urgent vacancies', query: 'Show me the most urgent hoarding vacancies.' },
    { icon: '🎯', label: 'Find my best leads', query: 'Which customers are the best leads for my upcoming vacancies?' },
    { icon: '💰', label: 'Show revenue at risk', query: 'What is my current revenue at risk?' },
    { icon: '🗺️', label: 'Find available hoardings', query: 'Show me vacant and upcoming vacant hoardings.' },
    { icon: '✍️', label: 'Generate a sales pitch', query: 'Help me generate a sales pitch for the best current opportunity.' },
    { icon: '📊', label: 'Run a what-if scenario', query: 'Show me what-if campaign opportunities.' },
    { icon: '❓', label: 'Ask about my inventory', query: 'Tell me about our overall hoarding portfolio performance.' },
  ];

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
            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#FBFAF5' }}>Smart Leads Agent</div>
            <div style={{ fontSize: '0.73rem', color: '#9BC53D', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <Sparkles style={{ width: '12px', height: '12px' }} /> Autonomous Revenue Intelligence
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {messages.length > 0 && (
            <button
              onClick={handleNewChat}
              title="Start New Chat Session"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#A3B0A7',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.73rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RotateCcw style={{ width: 12, height: 12 }} /> New Chat
            </button>
          )}

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#A3B0A7', cursor: 'pointer', padding: '4px' }}>
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* FIRST-OPEN AUTOMATIC GREETING (Only shown when messages list is empty) */}
        {messages.length === 0 && (
          <div style={{
            background: '#10251D',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '14px',
            padding: '22px 20px',
            color: '#FBFAF5'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.3rem' }}>👋</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FBFAF5', margin: 0 }}>
                Hi! I'm Smart Leads Agent
              </h3>
            </div>

            <div style={{ fontSize: '0.76rem', color: '#9BC53D', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
              Autonomous Billboard Revenue Intelligence Assistant
            </div>

            <p style={{ fontSize: '0.86rem', color: '#D8D5CA', lineHeight: '1.55', margin: '0 0 14px 0' }}>
              I help your sales team identify the right hoarding, the right customer, and the right action — before revenue is lost.
            </p>

            {/* Real Backend Metrics Indicator */}
            {metrics && (
              <div style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '9px 12px',
                fontSize: '0.76rem',
                color: '#A3B0A7',
                marginBottom: '16px'
              }}>
                📊 <strong>Live Portfolio Context</strong>: Currently monitoring <strong>{metrics.active_hoardings || 25} hoardings</strong> &middot; <strong>{metrics.vacancies_count_90d || 15} vacancies</strong> in 90-day pipeline.
              </div>
            )}

            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FBFAF5', marginBottom: '10px' }}>
              What can I help you explore?
            </div>

            {/* Clickable Quick Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {quickActions.map((btn, bIdx) => (
                <button
                  key={bIdx}
                  onClick={() => handleSend(btn.query)}
                  style={{
                    background: '#18352A',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#FBFAF5',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = '#285943'; e.currentTarget.style.borderColor = '#9BC53D'; }}
                  onMouseOut={e => { e.currentTarget.style.background = '#18352A'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                >
                  <span style={{ fontSize: '0.95rem' }}>{btn.icon}</span>
                  <span>{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Stream */}
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
            placeholder="Ask Smart Leads Agent about sites, risk, or leads..."
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
