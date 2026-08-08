// frontend/src/components/VacancyList.jsx
/**
 * Vacancy List & Cockpit Grid Component
 * -------------------------------------
 * EXPLAINABLE ARCHITECTURE & PHASES 3, 4, 5, 6:
 * Displays search bar, zone filter dropdown, urgency filter tabs, and individual
 * vacancy cards with:
 * - Revenue Risk Score (0-100) & Priority Badge (P1, P2, P3)
 * - Next Best Action recommendation callout
 * - LAUNCH RECOVERY MISSION button (8-Step Agent Workflow)
 * - Top-3 best fit customer leads
 * - Incumbent Renewal Churn Alerts
 */

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  AlertOctagon, 
  Eye, 
  Zap, 
  ArrowRight, 
  ShieldAlert 
} from 'lucide-react';
import LeadCard from './LeadCard';

export default function VacancyList({ vacancies, onSelectForPitch, onSelectMission, onOpenSimulator, onOpenProfile }) {
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState('ALL');

  const zones = ['ALL', ...new Set((vacancies || []).map(v => v.zone))];

  const filteredVacancies = (vacancies || []).filter(vac => {
    const searchMatch = !search || 
      vac.site_id.toLowerCase().includes(search.toLowerCase()) ||
      vac.location_name.toLowerCase().includes(search.toLowerCase()) ||
      vac.zone.toLowerCase().includes(search.toLowerCase());

    const zoneMatch = selectedZone === 'ALL' || vac.zone === selectedZone;

    let urgencyMatch = true;
    if (selectedUrgency === '0-30') urgencyMatch = vac.days_until_vacant <= 30;
    if (selectedUrgency === '31-60') urgencyMatch = vac.days_until_vacant > 30 && vac.days_until_vacant <= 60;
    if (selectedUrgency === '61-90') urgencyMatch = vac.days_until_vacant > 60;

    return searchMatch && zoneMatch && urgencyMatch;
  });

  return (
    <div>
      
      {/* Filter & Search Toolbar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '400px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search site ID, location, or zone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 38px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Zone Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter style={{ width: '15px', height: '15px', color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Zone:</span>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                padding: '8px 12px',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            >
              {zones.map(z => (
                <option key={z} value={z} style={{ background: '#131b2e' }}>{z}</option>
              ))}
            </select>
          </div>

          {/* Urgency Filter Tabs */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            {[
              { id: 'ALL', label: 'All (90d)' },
              { id: '0-30', label: 'Critical (0-30d)' },
              { id: '31-60', label: 'Moderate (31-60d)' },
              { id: '61-90', label: 'Upcoming (61-90d)' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedUrgency(tab.id)}
                style={{
                  background: selectedUrgency === tab.id ? 'var(--primary-blue)' : 'transparent',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
          Upcoming Vacancies ({filteredVacancies.length})
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing top 3 best-fit customers per site
        </span>
      </div>

      {/* Vacancy Cards List */}
      <div className="grid-vacancies">
        {filteredVacancies.map(vac => {
          let badgeColor = 'badge-yellow';
          if (vac.days_until_vacant <= 30) badgeColor = 'badge-red';

          const churn = vac.incumbent_churn_analysis;
          const risk = vac.revenue_risk;
          const nextAction = vac.next_best_action;

          return (
            <div key={vac.site_id} className="glass-panel" style={{ padding: '20px' }}>
              
              {/* Site Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-cyan)' }}>
                      {vac.site_id}
                    </span>
                    <span className={`badge ${badgeColor}`} style={{ fontSize: '0.65rem' }}>
                      {vac.urgency_tier}
                    </span>
                    {risk && (
                      <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                        Risk Score: {risk.revenue_risk_score}/100 ({risk.priority})
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '4px' }}>
                    {vac.location_name}
                  </h3>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                    ${vac.monthly_rate.toLocaleString()}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#fb7185' }}>
                    Risk: ${vac.revenue_at_risk.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Site Specs Strip */}
              <div style={{ display: 'flex', gap: '16px', background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  📐 Size: <strong style={{ color: '#fff' }}>{vac.size}</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  👁️ Traffic: <strong style={{ color: '#fff' }}>{vac.daily_impressions ? vac.daily_impressions.toLocaleString() : '85,000'} /day</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  📅 Free From: <strong style={{ color: '#60a5fa' }}>{vac.free_from_date}</strong>
                </div>
              </div>

              {/* NEXT BEST ACTION Callout (Phase 6) */}
              {nextAction && (
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase' }}>
                      ⚡ NEXT BEST ACTION: {nextAction.action}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {nextAction.reason}
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectMission(vac)}
                    className="btn-primary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' }}
                  >
                    <Zap style={{ width: '13px', height: '13px' }} />
                    LAUNCH MISSION
                  </button>
                </div>
              )}

              {/* Incumbent Churn Risk Alert */}
              {churn && churn.incumbent_name !== 'N/A' && (
                <div style={{ 
                  background: churn.churn_risk_pct > 50 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                  border: `1px solid ${churn.churn_risk_pct > 50 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                  borderRadius: '10px',
                  padding: '10px 14px',
                  marginBottom: '14px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: churn.churn_risk_pct > 50 ? '#fb7185' : '#34d399' }}>
                      Incumbent Tenant: {churn.incumbent_name}
                    </span>
                    <span className={churn.churn_risk_pct > 50 ? 'badge badge-red' : 'badge badge-green'} style={{ fontSize: '0.65rem' }}>
                      Churn Risk: {churn.churn_risk_pct}%
                    </span>
                  </div>
                </div>
              )}

              {/* Top-3 Best Fit Customer Leads Header */}
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
                🎯 Top 3 Best-Fit Customer Leads
              </h4>

              {/* Top Leads Cards */}
              {vac.top_leads && vac.top_leads.map((lead, idx) => (
                <LeadCard 
                  key={lead.customer_id} 
                  lead={lead} 
                  rank={idx + 1} 
                  vacancy={vac} 
                  onSelectForPitch={onSelectForPitch}
                  onOpenSimulator={onOpenSimulator}
                  onOpenProfile={onOpenProfile}
                />
              ))}

            </div>
          );
        })}
      </div>

    </div>
  );
}
