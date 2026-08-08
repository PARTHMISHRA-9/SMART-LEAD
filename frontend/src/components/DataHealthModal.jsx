// frontend/src/components/DataHealthModal.jsx
/**
 * Data Quality & Health Audit Modal Component (Phase 22)
 * -----------------------------------------------------
 * EXPLAINABLE ARCHITECTURE & PHASE 22 REQUIREMENT:
 * Displays Data Health Score (0-100), audit scan summary, and list of issues:
 * - Missing or zero rate cards
 * - Missing GPS coordinates
 * - Dormant account alerts
 * - Duplicate customer checks
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, X, CheckCircle2, FileText } from 'lucide-react';

export default function DataHealthModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [auditData, setAuditData] = useState(null);

  useEffect(() => {
    fetch('/api/data/health')
      .then(r => r.json())
      .then(d => setAuditData(d))
      .catch(e => console.error('Failed to fetch data health:', e));
  }, []);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck style={{ color: '#34d399', width: '24px', height: '24px' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Dataset Health & Quality Audit</h2>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X style={{ width: '22px', height: '22px' }} />
          </button>
        </div>

        {/* Audit Summary Box */}
        {auditData ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Overall Data Health Score</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: auditData.data_health_score >= 85 ? '#34d399' : '#f59e0b' }}>
                  {auditData.data_health_score}/100
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{auditData.summary}</p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className={auditData.data_health_score >= 85 ? 'badge badge-green' : 'badge badge-yellow'}>
                  Status: {auditData.status}
                </span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Critical Errors: {auditData.critical_errors}
                </div>
              </div>
            </div>

            {/* Audit Issues List */}
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Audit Log Details ({auditData.issues ? auditData.issues.length : 0})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              {auditData.issues && auditData.issues.map((iss, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <span className={iss.level === 'ERROR' ? 'badge badge-red' : 'badge badge-yellow'} style={{ fontSize: '0.6rem', marginRight: '8px' }}>
                      {iss.level}
                    </span>
                    <strong style={{ color: '#fff' }}>[{iss.table}] Record {iss.record_id}:</strong> {iss.message}
                  </div>
                </div>
              ))}
            </div>

          </div>
        ) : null}

      </div>

    </div>
  );
}
