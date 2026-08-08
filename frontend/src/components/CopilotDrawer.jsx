// frontend/src/components/CopilotDrawer.jsx
/**
 * Autonomous Sales Copilot & Objection Handler Drawer
 * ----------------------------------------------------
 * EXPLAINABLE ARCHITECTURE & PHASES 10 & 11:
 * - Generates zero-hallucination pitch content across Email, WhatsApp, and Call Scripts.
 * - Interactive 5-Button Customer Objection Simulator:
 *   1. "Too expensive"
 *   2. "Need more audience"
 *   3. "Not interested"
 *   4. "Call me later"
 *   5. "Already using another site"
 * - Quotes exact rate card pricing, size, and traffic auditor metrics without inventing numbers.
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, PhoneCall, Mail, Copy, Check, ShieldAlert, X, HelpCircle } from 'lucide-react';

export default function CopilotDrawer({ isOpen, onClose, vacancy, lead }) {
  if (!isOpen || !vacancy || !lead) return null;

  const [channel, setChannel] = useState('EMAIL');
  const [pitchContent, setPitchContent] = useState(null);
  const [activeObjection, setActiveObjection] = useState(null);
  const [objectionResponse, setObjectionResponse] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPitch();
  }, [channel, vacancy, lead]);

  const fetchPitch = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pitch/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: vacancy.site_id,
          customerId: lead.customer_id,
          channel: channel
        })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') setPitchContent(data.pitch);
    } catch (e) {
      console.error('Pitch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const simulateObjection = async (objectionType) => {
    setActiveObjection(objectionType);
    try {
      const res = await fetch('/api/objection/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectionType: objectionType,
          siteId: vacancy.site_id,
          customerId: lead.customer_id
        })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setObjectionResponse(data.handling);
      }
    } catch (e) {
      console.error('Objection simulation error:', e);
    }
  };

  const copyText = (txt) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '20px'
    }}>
      
      <div className="glass-panel" style={{ width: '100%', maxWidth: '820px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', borderRadius: '16px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles style={{ color: 'var(--primary-cyan)', width: '22px', height: '22px' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Autonomous Sales Copilot</h2>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X style={{ width: '22px', height: '22px' }} />
          </button>
        </div>

        {/* Fact Card Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target Site</span>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{vacancy.site_id} ({vacancy.zone})</div>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Customer</span>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#60a5fa' }}>{lead.company_name}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Quoted Monthly Rate</span>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399' }}>${lead.suggested_rate ? lead.suggested_rate.suggested_offer.toLocaleString() : vacancy.monthly_rate.toLocaleString()}/mo</div>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fit Score</span>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#c084fc' }}>{lead.overall_fit_score}% Match</div>
          </div>
        </div>

        {/* Outreach Channel Switcher */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px' }}>
          {[
            { id: 'EMAIL', label: 'Email Outreach', icon: Mail },
            { id: 'WHATSAPP', label: 'WhatsApp Quick Pitch', icon: MessageSquare },
            { id: 'PHONE_SCRIPT', label: 'Call Script', icon: PhoneCall }
          ].map(ch => {
            const Icon = ch.icon;
            return (
              <button
                key={ch.id}
                onClick={() => setChannel(ch.id)}
                style={{
                  flex: 1,
                  background: channel === ch.id ? 'var(--primary-blue)' : 'transparent',
                  color: '#fff',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Icon style={{ width: '14px', height: '14px' }} />
                {ch.label}
              </button>
            );
          })}
        </div>

        {/* Pitch Content Display Box */}
        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
          {pitchContent ? (
            <div>
              {pitchContent.subject && (
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  Subject: {pitchContent.subject}
                </div>
              )}
              <pre style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', whiteSpace: 'pre-wrap', lineHeight: '1.5', color: 'var(--text-main)' }}>
                {pitchContent.content}
              </pre>

              <button 
                onClick={() => copyText(pitchContent.content)}
                className="btn-secondary"
                style={{ marginTop: '12px', padding: '6px 12px', fontSize: '0.75rem' }}
              >
                {copied ? <Check style={{ width: '12px', height: '12px', color: '#10b981' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
                {copied ? 'Copied Pitch Text!' : 'Copy Outreach Text'}
              </button>
            </div>
          ) : null}
        </div>

        {/* CUSTOMER OBJECTION SIMULATOR (Phase 11) */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-amber)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HelpCircle style={{ width: '14px', height: '14px' }} />
            Customer Objection Simulator (Data-Driven Factual Responses)
          </div>

          {/* 5 Objection Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
            {[
              { id: 'TOO_EXPENSIVE', label: '💰 "Too expensive"' },
              { id: 'NEED_MORE_AUDIENCE', label: '👁️ "Need more audience"' },
              { id: 'NOT_INTERESTED', label: '🙅 "Not interested"' },
              { id: 'CALL_ME_LATER', label: '📅 "Call me later"' },
              { id: 'ALREADY_USING_ANOTHER_SITE', label: '🏢 "Using another site"' }
            ].map(obj => (
              <button
                key={obj.id}
                onClick={() => simulateObjection(obj.id)}
                style={{
                  background: activeObjection === obj.id ? 'var(--accent-amber)' : 'rgba(255,255,255,0.06)',
                  color: activeObjection === obj.id ? '#000' : '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {obj.label}
              </button>
            ))}
          </div>

          {/* Objection Handling Script Box */}
          {objectionResponse && (
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '10px', border: '1px border-color' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-cyan)', marginBottom: '4px' }}>
                STRATEGY: {objectionResponse.response_strategy}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#fff', lineHeight: '1.5', fontStyle: 'italic', marginBottom: '10px' }}>
                "{objectionResponse.script}"
              </p>

              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Factual Anchors: {objectionResponse.factual_anchors.join(' • ')}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
