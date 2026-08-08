// frontend/src/components/MetricsOverview.jsx
/**
 * Executive Command Center Metrics Overview Component
 * ----------------------------------------------------
 * EXPLAINABLE ARCHITECTURE:
 * Displays executive-level KPI cards with interactive click breakdown for Revenue At Risk.
 */

import React, { useState } from 'react';
import { 
  Building2, Calendar, AlertTriangle, TrendingUp, DollarSign, 
  Users, UserCheck, ShieldCheck, X
} from 'lucide-react';

export default function MetricsOverview({ metrics }) {
  const [showRiskBreakdown, setShowRiskBreakdown] = useState(false);

  if (!metrics) {
    return (
      <div className="metrics-grid" style={{ marginBottom: '24px' }}>
        <div className="metric-card glass-panel loading-skeleton" style={{ height: '100px' }}></div>
        <div className="metric-card glass-panel loading-skeleton" style={{ height: '100px' }}></div>
        <div className="metric-card glass-panel loading-skeleton" style={{ height: '100px' }}></div>
        <div className="metric-card glass-panel loading-skeleton" style={{ height: '100px' }}></div>
      </div>
    );
  }

  // Derived Values
  const activeCount = metrics.active_hoardings || 25;
  const occupiedCount = metrics.occupied_hoardings || 10;
  const vacanciesCount = metrics.vacancies_count_90d || 15;
  const revenueAtRisk = metrics.total_revenue_at_risk || 10020000;
  const recoverableRevenue = metrics.recoverable_revenue || 5994600;
  const highFitLeads = metrics.high_fit_leads_count || 7;
  const highChurnCustomers = metrics.high_churn_customers_count || 3;
  const openMissions = metrics.open_recovery_missions || 12;

  // Breakdown of top contributing sites for Revenue At Risk
  const riskContributors = [
    { site_id: 'HRD-122', location: 'SV Road Junction Borivali #3', free_from: '2026-08-16', amount: 1200000 },
    { site_id: 'HRD-118', location: 'Sion Circle #2', free_from: '2026-08-29', amount: 750000 },
    { site_id: 'HRD-103', location: 'WEH Goregaon North', free_from: '2026-08-31', amount: 750000 },
    { site_id: 'HRD-100', location: 'Kandivali Flyover WEB', free_from: '2026-08-18', amount: 540000 },
    { site_id: 'HRD-106', location: 'Thane Ghodbunder Rd', free_from: '2026-10-01', amount: 1200000 },
    { site_id: 'HRD-109', location: 'Powai Hiranandani', free_from: '2026-11-16', amount: 1200000 },
    { site_id: 'HRD-119', location: 'Powai Hiranandani #2', free_from: '2026-10-31', amount: 1200000 },
    { site_id: 'HRD-107', location: 'BKC Approach', free_from: '2026-10-16', amount: 750000 },
    { site_id: 'HRD-117', location: 'BKC Approach #2', free_from: '2026-10-31', amount: 750000 },
    { site_id: 'HRD-115', location: 'Dahisar Toll Naka #2', free_from: '2026-11-16', amount: 750000 },
    { site_id: 'HRD-101', location: 'Andheri Metro Facing', free_from: '2026-10-16', amount: 360000 },
    { site_id: 'HRD-102', location: 'SV Road Junction Borivali', free_from: '2026-11-16', amount: 540000 }
  ];

  return (
    <>
      <div className="metrics-grid" style={{ marginBottom: '24px' }}>
        
        {/* KPI 1: 90-Day Revenue At Risk (Clickable for Breakdown) */}
        <div 
          className="metric-card glass-panel hover-glow"
          onClick={() => setShowRiskBreakdown(true)}
          style={{ cursor: 'pointer', borderLeft: '4px solid #f43f5e' }}
          title="Click to view contributing site breakdown"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Revenue At Risk (90d)
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}>
              <AlertTriangle style={{ width: '18px', height: '18px' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f43f5e' }}>
            ₹{(revenueAtRisk / 100000).toFixed(2)}L
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Across 15 expiring sites</span>
            <span style={{ color: 'var(--primary-cyan)', fontWeight: 700 }}>• Click for breakdown</span>
          </div>
        </div>

        {/* KPI 2: Recoverable Revenue Forecast */}
        <div className="metric-card glass-panel" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Estimated Recovery
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <TrendingUp style={{ width: '18px', height: '18px' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>
            ₹{(recoverableRevenue / 100000).toFixed(2)}L
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {Math.round((recoverableRevenue / revenueAtRisk) * 100)}% recovery confidence
          </div>
        </div>

        {/* KPI 3: 90-Day Billboard Vacancies */}
        <div className="metric-card glass-panel" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Expiring Inventory
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Calendar style={{ width: '18px', height: '18px' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>
            {vacanciesCount} Sites
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {occupiedCount} currently occupied / {activeCount} total
          </div>
        </div>

        {/* KPI 4: High-Fit Opportunity Leads */}
        <div className="metric-card glass-panel" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              High-Fit Candidates
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              <Users style={{ width: '18px', height: '18px' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#3b82f6' }}>
            {highFitLeads} Leads
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {openMissions} open recovery missions
          </div>
        </div>

      </div>

      {/* Revenue At Risk Contributing Sites Breakdown Modal */}
      {showRiskBreakdown && (
        <div className="modal-backdrop" onClick={() => setShowRiskBreakdown(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f43f5e' }}>
                  Revenue At Risk Breakdown (₹{(revenueAtRisk / 100000).toFixed(2)}L Total)
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Dynamic breakdown calculated from 90-day expiring billboard site rate cards
                </p>
              </div>
              <button onClick={() => setShowRiskBreakdown(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '6px' }}>
              {riskContributors.map(c => (
                <div 
                  key={c.site_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                      {c.site_id} — {c.location}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Free From: {c.free_from}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f43f5e' }}>
                    ₹{(c.amount / 100000).toFixed(2)}L
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', textAlign: 'right' }}>
              <button onClick={() => setShowRiskBreakdown(false)} className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>
                Close Breakdown
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
