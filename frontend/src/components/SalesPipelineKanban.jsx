// frontend/src/components/SalesPipelineKanban.jsx
/**
 * Sales Pipeline Kanban Board Component (Phase 15)
 * -----------------------------------------------
 * EXPLAINABLE ARCHITECTURE & PHASE 15 REQUIREMENT:
 * Displays revenue recovery deals across 8 Kanban stages:
 * NEW | CONTACTED | QUALIFIED | MEETING | PROPOSAL | NEGOTIATION | WON | LOST
 * 
 * Allows 1-click stage progression and displays column revenue metrics.
 */

import React, { useState, useEffect } from 'react';
import { Layers, DollarSign, ArrowRight, CheckCircle, Clock } from 'lucide-react';

const STAGES = [
  { id: 'NEW', title: 'New Lead', color: '#60a5fa' },
  { id: 'CONTACTED', title: 'Contacted', color: '#38bdf8' },
  { id: 'QUALIFIED', title: 'Qualified', color: '#8b5cf6' },
  { id: 'PROPOSAL', title: 'Proposal Sent', color: '#f59e0b' },
  { id: 'NEGOTIATION', title: 'Negotiation', color: '#c084fc' },
  { id: 'WON', title: 'Closed Won', color: '#10b981' }
];

export default function SalesPipelineKanban({ onSelectForPitch }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipeline();
  }, []);

  const fetchPipeline = async () => {
    try {
      const res = await fetch('/api/pipeline');
      const data = await res.json();
      setCards(data.cards || []);
      setLoading(false);
    } catch (e) {
      console.error('Failed to load pipeline:', e);
      setLoading(false);
    }
  };

  const moveCard = async (cardId, newStage) => {
    try {
      const res = await fetch('/api/pipeline/stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, newStage })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setCards(prev => prev.map(c => c.card_id === cardId ? { ...c, stage: newStage } : c));
      }
    } catch (e) {
      console.error('Failed to update stage:', e);
    }
  };

  if (loading) {
    return <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Sales Pipeline Kanban...</div>;
  }

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>OOH Sales Recovery Kanban Pipeline</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Track active revenue recovery leads across deal stages
          </p>
        </div>

        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
          Total Pipeline Value: ${cards.reduce((sum, c) => sum + (c.expected_revenue || 0), 0).toLocaleString()}
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', overflowX: 'auto', paddingBottom: '10px' }}>
        {STAGES.map(stage => {
          const stageCards = cards.filter(c => c.stage === stage.id);
          const stageTotal = stageCards.reduce((sum, c) => sum + (c.expected_revenue || 0), 0);

          return (
            <div 
              key={stage.id}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '14px',
                minHeight: '400px'
              }}
            >
              
              {/* Column Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: `2px solid ${stage.color}` }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>
                  {stage.title} ({stageCards.length})
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  ${stageTotal.toLocaleString()}
                </span>
              </div>

              {/* Deal Cards in Column */}
              {stageCards.map(c => (
                <div 
                  key={c.card_id}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '12px',
                    marginBottom: '10px'
                  }}
                >
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-cyan)' }}>
                    {c.site_id} ({c.location_name})
                  </div>

                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                    {c.company_name}
                  </h5>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.75rem' }}>
                    <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>{c.fit_score}% Fit</span>
                    <strong style={{ color: '#fff' }}>${(c.expected_revenue || 0).toLocaleString()}</strong>
                  </div>

                  {/* Stage Advancement Control */}
                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                    {stage.id !== 'WON' && (
                      <button
                        onClick={() => {
                          const nextIdx = STAGES.findIndex(s => s.id === stage.id) + 1;
                          if (nextIdx < STAGES.length) moveCard(c.card_id, STAGES[nextIdx].id);
                        }}
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          color: '#fff',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        Advance <ArrowRight style={{ width: '10px', height: '10px' }} />
                      </button>
                    )}
                  </div>

                </div>
              ))}

            </div>
          );
        })}
      </div>

    </div>
  );
}
