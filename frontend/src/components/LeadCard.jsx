// frontend/src/components/LeadCard.jsx
/**
 * Lead Card Component (Top Customer Match)
 * ----------------------------------------
 * EXPLAINABLE ARCHITECTURE:
 * Displays match score %, rank badge, factor breakdown, cold-relationship indicator badges,
 * incumbent churn/renewal status, and pitch generation triggers.
 */

import React from 'react';
import { 
  Building, DollarSign, Calendar, MessageSquare, ArrowUpRight, 
  Send, AlertTriangle, ShieldCheck, Zap, HelpCircle
} from 'lucide-react';

export default function LeadCard({ 
  lead, 
  vacancy, 
  rank = 1, 
  onSelectForPitch, 
  onOpenSimulator, 
  onOpenProfile 
}) {
  if (!lead) return null;

  const isRank1 = rank === 1;
  const fitScore = lead.overall_fit_score || 0;
  const maxBudget = lead.max_budget_monthly || 0;
  const siteRate = vacancy ? vacancy.monthly_rate : 0;
  const isBudgetComfortable = maxBudget >= siteRate;

  // Relationship Status Classification
  const daysAgo = lead.days_since_contact || 0;
  const relScore = lead.relationship_score || 0;
  let relBadge = { text: 'ACTIVE', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: '🟢' };

  if (daysAgo > 60 || relScore < 50) {
    relBadge = { text: 'COLD (RE-ENGAGE)', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)', icon: '🔴' };
  } else if (daysAgo > 30 || relScore < 70) {
    relBadge = { text: 'WARM', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: '🟡' };
  }

  return (
    <div 
      className={`glass-panel hover-glow ${isRank1 ? 'rank-1-border' : ''}`}
      style={{
        padding: '16px',
        position: 'relative',
        background: isRank1 ? 'linear-gradient(180deg, rgba(59, 130, 246, 0.08) 0%, rgba(19, 27, 46, 0.8) 100%)' : 'rgba(19, 27, 46, 0.6)',
        border: isRank1 ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid var(--border-color)',
        borderRadius: '12px'
      }}
    >
      
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span 
            className="badge" 
            style={{ 
              background: isRank1 ? 'var(--primary-blue)' : 'rgba(255,255,255,0.1)', 
              color: '#ffffff',
              fontWeight: 800
            }}
          >
            Rank #{rank}
          </span>

          {/* Relationship Status Badge */}
          <span 
            className="badge" 
            style={{ 
              background: relBadge.bg, 
              color: relBadge.color,
              border: `1px solid ${relBadge.color}`,
              fontWeight: 700,
              fontSize: '0.7rem'
            }}
          >
            {relBadge.icon} {relBadge.text}
          </span>
        </div>

        {/* Match Fit Score */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: fitScore >= 80 ? '#10b981' : (fitScore >= 60 ? '#f59e0b' : '#f43f5e') }}>
            {fitScore}%
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Match Fit</div>
        </div>
      </div>

      {/* Customer Name & Industry */}
      <div style={{ marginBottom: '12px' }}>
        <h4 
          onClick={() => onOpenProfile && onOpenProfile(lead, vacancy)}
          style={{ fontSize: '1rem', fontWeight: 800, cursor: 'pointer', color: '#fff', textDecoration: 'underline' }}
        >
          {lead.company_name}
        </h4>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Industry: <strong style={{ color: 'var(--primary-cyan)' }}>{lead.industry}</strong> • Budget Tier: <strong style={{ color: '#fff' }}>{lead.budget_tier}</strong>
        </div>
      </div>

      {/* Financials & Contact Recency */}
      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Max Monthly Budget: </span>
          <strong style={{ color: isBudgetComfortable ? '#10b981' : '#f43f5e' }}>
            ₹{maxBudget.toLocaleString()} INR
          </strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Last Contact: </span>
          <strong style={{ color: daysAgo > 60 ? '#f43f5e' : '#fff' }}>{daysAgo}d ago</strong>
        </div>
      </div>

      {/* Rationale Bullet Points ("Why This Customer?") */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
          WHY THIS CUSTOMER MATCHES:
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {lead.reasons && lead.reasons.map((reason, idx) => (
            <li key={idx} style={{ color: 'var(--text-light)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onSelectForPitch(vacancy, lead)}
          className="btn-primary"
          style={{ flex: 1, padding: '6px 10px', fontSize: '0.75rem', justifyContent: 'center' }}
        >
          <Send style={{ width: '12px', height: '12px' }} />
          Pitch Lead
        </button>

        {onOpenSimulator && (
          <button
            onClick={() => onOpenSimulator(vacancy, lead)}
            className="btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)' }}
            title="Open Campaign Simulator"
          >
            <Zap style={{ width: '12px', height: '12px', color: '#f59e0b' }} />
            Simulator
          </button>
        )}
      </div>

    </div>
  );
}
