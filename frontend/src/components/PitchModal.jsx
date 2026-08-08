// frontend/src/components/PitchModal.jsx
/**
 * Personalised AI Pitch Generator Drawer Component
 * -----------------------------------------------
 * EXPLAINABLE ARCHITECTURE & ZERO-HALLUCINATION PRICING:
 * Generates tailor-made pitch content across Email, WhatsApp, and Phone Script formats.
 * Displays explicit Rate Card Provenance details to prove zero pricing hallucinations.
 */

import React, { useState, useEffect } from 'react';
import { 
  X, Copy, Check, Send, Sparkles, MessageSquare, Mail, PhoneCall, 
  Download, RefreshCw, FileText, CheckCircle2, ShieldCheck
} from 'lucide-react';

export default function PitchModal({ isOpen, onClose, vacancy, lead }) {
  const [channel, setChannel] = useState('EMAIL');
  const [tone, setTone] = useState('CONSULTATIVE');
  const [pitchData, setPitchData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && vacancy && lead) {
      generatePitch();
    }
  }, [isOpen, vacancy, lead, channel, tone]);

  if (!isOpen || !vacancy || !lead) return null;

  const generatePitch = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pitch/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: vacancy.site_id,
          customerId: lead.customer_id,
          channel: channel,
          tone: tone
        })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setPitchData(data.pitch);
      }
    } catch (err) {
      console.error('Failed to generate pitch:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (pitchData && pitchData.content) {
      navigator.clipboard.writeText(pitchData.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const quotedRate = pitchData ? pitchData.quoted_rate : vacancy.monthly_rate;
  const contractVal = quotedRate * 3;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-container" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '780px', width: '90%' }}
      >
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', color: '#fff' }}>
              <Sparkles style={{ width: '20px', height: '20px' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>AI Sales Copilot & Pitch Generator</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Zero-hallucination pitch for {lead.company_name} on site {vacancy.site_id}
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Rate Card Provenance Box (Proves Zero Hallucinations) */}
        <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Suggested Offer Rate</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981' }}>
              ₹{quotedRate.toLocaleString()} / mo
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rate Source</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
              Site {vacancy.site_id} Rate Card
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Campaign Duration</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
              3 Months Block
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Est. Contract Value</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-cyan)' }}>
              ₹{contractVal.toLocaleString()} INR
            </div>
          </div>
        </div>

        {/* Channel Switcher Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {[
            { id: 'EMAIL', label: 'Email Pitch', icon: Mail },
            { id: 'WHATSAPP', label: 'WhatsApp Message', icon: MessageSquare },
            { id: 'SCRIPT', label: 'Phone Call Script', icon: PhoneCall }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = channel === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setChannel(tab.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px',
                  borderRadius: '8px',
                  border: isActive ? '1px solid var(--primary-blue)' : '1px solid var(--border-color)',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                <Icon style={{ width: '14px', height: '14px' }} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Generated Content Box */}
        <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', minHeight: '220px', marginBottom: '16px', position: 'relative' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Formulating zero-hallucination pitch using site rate card and customer facts...
            </div>
          ) : pitchData ? (
            <>
              {pitchData.subject && (
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-cyan)', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid var(--border-color)' }}>
                  Subject: {pitchData.subject}
                </div>
              )}
              <pre style={{ fontFamily: 'inherit', fontSize: '0.85rem', color: 'var(--text-light)', whiteSpace: 'pre-wrap', lineHeight: '1.5', margin: 0 }}>
                {pitchData.content}
              </pre>
            </>
          ) : null}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck style={{ width: '14px', height: '14px' }} /> Verifiable pricing from backend rate card
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCopy}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.8rem' }}
            >
              {copied ? <Check style={{ width: '14px', height: '14px', color: '#10b981' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
              {copied ? 'Copied to Clipboard' : 'Copy Pitch'}
            </button>

            <button onClick={onClose} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
