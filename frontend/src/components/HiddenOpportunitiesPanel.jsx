// frontend/src/components/HiddenOpportunitiesPanel.jsx
/**
 * Hidden Opportunities & Cross-Sell Panel Component (Phases 16 & 17)
 * -----------------------------------------------------------------
 * EXPLAINABLE ARCHITECTURE & PHASES 16 & 17:
 * Displays uncontacted enterprise prospects, high loyalty unbooked accounts,
 * budget upgrade matches, and two-way cross-sell recommendations.
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowUpRight, DollarSign, Building, CheckCircle2, Shuffle } from 'lucide-react';

export default function HiddenOpportunitiesPanel({ vacancies, onSelectMission, onSelectPitch }) {
  const [opportunities, setOpportunities] = useState([]);
  const [crossSellData, setCrossSellData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resOpp = await fetch('/api/opportunities/hidden');
      const dataOpp = await resOpp.json();
      setOpportunities(dataOpp.opportunities || []);

      const resCross = await fetch('/api/cross-sell');
      const dataCross = await resCross.json();
      setCrossSellData(dataCross.cross_sell);
      setLoading(false);
    } catch (e) {
      console.error('Failed to load opportunities:', e);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Analyzing Hidden Opportunities & Cross-Sell Patterns...</div>;
  }

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Hidden Revenue Opportunities & Two-Way Cross-Sell</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Detected uncontacted enterprise leads, unbooked loyal accounts, and nearby site alternatives
          </p>
        </div>
      </div>

      {/* Opportunities Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {opportunities.map((opp, idx) => (
          <div 
            key={idx}
            className="glass-card"
            style={{ padding: '16px', borderLeft: '4px solid var(--accent-amber)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-yellow" style={{ fontSize: '0.65rem' }}>{opp.type}</span>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                  {opp.company_name}
                </h4>
              </div>
              <strong style={{ fontSize: '1.1rem', color: '#34d399' }}>
                ${(opp.expected_value || 0).toLocaleString()}
              </strong>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
              {opp.reason}
            </p>

            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary-cyan)' }}>
                Rec Site: {opp.recommended_site_id}
              </span>

              <button
                onClick={() => {
                  const targetVac = vacancies.find(v => v.site_id === opp.recommended_site_id) || vacancies[0];
                  onSelectMission(targetVac);
                }}
                className="btn-primary"
                style={{ padding: '6px 12px', fontSize: '0.75rem' }}
              >
                <Sparkles style={{ width: '12px', height: '12px' }} />
                {opp.action_prompt || 'Launch Mission'}
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Two-Way Cross-Sell Section */}
      {crossSellData && (
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-cyan)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shuffle style={{ width: '16px', height: '16px' }} />
            Two-Way Cross-Sell Matrix Recommendations
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Sites this customer should also consider:
              </h5>
              {crossSellData.suggested_sites_for_customer.map(s => (
                <div key={s.site_id} style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px', marginBottom: '6px', fontSize: '0.8rem' }}>
                  <strong style={{ color: '#fff' }}>{s.site_id} ({s.location_name})</strong> - ${s.monthly_rate.toLocaleString()}/mo ({s.similarity_score_pct}% Match)
                </div>
              ))}
            </div>

            <div>
              <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Customers who should also see this site:
              </h5>
              {crossSellData.target_customers_for_site.map(c => (
                <div key={c.customer_id} style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px', marginBottom: '6px', fontSize: '0.8rem' }}>
                  <strong style={{ color: '#60a5fa' }}>{c.company_name}</strong> - Budget: ${c.max_budget_monthly.toLocaleString()}/mo ({c.similarity_score_pct}% Similarity)
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
