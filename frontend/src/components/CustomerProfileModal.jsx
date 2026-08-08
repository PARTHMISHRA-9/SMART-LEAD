// frontend/src/components/CustomerProfileModal.jsx
/**
 * Customer Intelligence Panel Modal (Phase 7)
 * -------------------------------------------
 * EXPLAINABLE ARCHITECTURE & PHASE 7 REQUIREMENT:
 * Comprehensive customer profile view:
 * - Company Name, Industry, Monthly Budget Band, Relationship Score (0-100)
 * - Touchpoint Recency (days since contact)
 * - Past Booking History Portfolio
 * - Explicit "WHY THIS CUSTOMER?" Bullet Points & Risk Analysis
 */

import React from 'react';
import { Building, DollarSign, Calendar, Clock, CheckCircle, ShieldAlert, X, Star } from 'lucide-react';

export default function CustomerProfileModal({ isOpen, onClose, customer, vacancy }) {
  if (!isOpen || !customer) return null;

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
      
      <div className="glass-panel" style={{ width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', borderRadius: '16px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building style={{ color: '#60a5fa', width: '22px', height: '22px' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{customer.company_name}</h2>
                <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>{customer.industry}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customer ID: {customer.customer_id}</p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X style={{ width: '22px', height: '22px' }} />
          </button>
        </div>

        {/* Intelligence Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Monthly Budget</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>
              ${customer.max_budget_monthly ? customer.max_budget_monthly.toLocaleString() : 'N/A'}/mo
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{customer.budget_tier}</span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Relationship Score</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#60a5fa', marginTop: '2px' }}>
              {customer.relationship_score}/100
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{customer.relationship_score >= 75 ? 'Tier 1 Preferred Partner' : 'Standard Partner'}</span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Touchpoint Recency</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: customer.days_since_contact > 60 ? '#fb7185' : '#fff', marginTop: '2px' }}>
              {customer.days_since_contact} Days Ago
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Last Contact: {customer.last_contact_date}</span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Primary Contact</span>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
              {customer.primary_contact}
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{customer.email}</span>
          </div>

        </div>

        {/* WHY THIS CUSTOMER? Section */}
        {vacancy && (
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#34d399', marginBottom: '8px' }}>
              WHY THIS CUSTOMER FOR SITE {vacancy.site_id}?
            </h4>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {customer.reasons ? customer.reasons.map((r, idx) => (
                <li key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                  {r}
                </li>
              )) : (
                <li style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                  ✓ Budget of ${customer.max_budget_monthly.toLocaleString()} covers site rate card ($${vacancy.monthly_rate.toLocaleString()}).
                </li>
              )}
            </ul>
          </div>
        )}

      </div>

    </div>
  );
}
