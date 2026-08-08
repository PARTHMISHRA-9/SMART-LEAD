// frontend/src/components/CampaignSimulatorModal.jsx
/**
 * "What-If?" Campaign Simulator Modal Component
 * --------------------------------------------
 * EXPLAINABLE ARCHITECTURE & PHASE 9 REQUIREMENT:
 * Provides interactive sliders for:
 * - Customer Budget ($5,000 to $50,000)
 * - Duration (1 to 12 months)
 * - Rate Card Discount (0% to 25%)
 * 
 * Recalculates lead fit score, rank position shift (#7 -> #2), total contract value,
 * and provides human-explainable rank shift rationale.
 */

import React, { useState, useEffect } from 'react';
import { Sliders, X, Sparkles, TrendingUp, TrendingDown, DollarSign, Calendar, RefreshCw } from 'lucide-react';

export default function CampaignSimulatorModal({ isOpen, onClose, vacancy, customer, strategyMode }) {
  if (!isOpen || !vacancy || !customer) return null;

  const [budget, setBudget] = useState(customer.max_budget_monthly || vacancy.monthly_rate);
  const [duration, setDuration] = useState(3);
  const [discount, setDiscount] = useState(5);
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    runSimulator();
  }, [budget, duration, discount, vacancy, customer, strategyMode]);

  const runSimulator = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/simulator/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: vacancy.site_id,
          customerId: customer.customer_id,
          budget: Number(budget),
          duration: Number(duration),
          discount: Number(discount),
          strategyMode: strategyMode
        })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setSimulation(data.simulation);
      }
    } catch (e) {
      console.error('Simulator error:', e);
    } finally {
      setLoading(false);
    }
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
      
      <div className="glass-panel" style={{ width: '100%', maxWidth: '780px', padding: '24px', borderRadius: '16px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders style={{ color: 'var(--primary-cyan)', width: '22px', height: '22px' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>"What-If?" Campaign Proposal Simulator</h2>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X style={{ width: '22px', height: '22px' }} />
          </button>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Simulating offer adjustments for <strong style={{ color: '#fff' }}>{customer.company_name}</strong> on site <strong style={{ color: '#60a5fa' }}>{vacancy.site_id} ({vacancy.location_name})</strong>
        </p>

        {/* Sliders Box */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
          
          {/* Budget Slider */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Customer Monthly Budget:</span>
              <strong style={{ color: '#34d399' }}>${Number(budget).toLocaleString()}/mo</strong>
            </div>
            <input 
              type="range" min="5000" max="40000" step="1000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--primary-blue)', cursor: 'pointer' }}
            />
          </div>

          {/* Duration Slider */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Contract Duration:</span>
              <strong style={{ color: '#60a5fa' }}>{duration} Months</strong>
            </div>
            <input 
              type="range" min="1" max="12" step="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--primary-cyan)', cursor: 'pointer' }}
            />
          </div>

          {/* Discount Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Rate Card Tier Discount:</span>
              <strong style={{ color: '#f59e0b' }}>{discount}% Discount</strong>
            </div>
            <input 
              type="range" min="0" max="25" step="1"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--accent-amber)', cursor: 'pointer' }}
            />
          </div>

        </div>

        {/* Results Card */}
        {simulation && (
          <div style={{ background: 'rgba(26, 36, 60, 0.8)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rank Shift</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: simulation.rank_shift >= 0 ? '#34d399' : '#fb7185' }}>
                  #{simulation.baseline_rank} → #{simulation.simulated_rank}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fit Score</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#60a5fa' }}>
                  {simulation.simulated_score}% Match
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Effective Monthly Rate</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                  ${simulation.effective_monthly_rate.toLocaleString()}/mo
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Contract Value</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#c084fc' }}>
                  ${simulation.total_contract_value.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Shift Explanation */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px dashed var(--border-color)', fontSize: '0.85rem', color: 'var(--text-main)' }}>
              {simulation.shift_explanation}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
