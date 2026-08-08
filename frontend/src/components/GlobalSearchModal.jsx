// frontend/src/components/GlobalSearchModal.jsx
/**
 * Global Command Palette Search Modal (Ctrl + K)
 * ----------------------------------------------
 * EXPLAINABLE ARCHITECTURE & PHASE 21 REQUIREMENT:
 * Quick search across Companies, Billboard Sites, Vacancies, and Actions.
 * Triggers directly on Ctrl + K or header search button.
 */

import React, { useState, useEffect } from 'react';
import { Search, X, Building, MapPin, Send, Zap, ChevronRight } from 'lucide-react';

export default function GlobalSearchModal({ isOpen, onClose, vacancies, onSelectMission, onSelectPitch, onSelectSimulator }) {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filteredVacancies = (vacancies || []).filter(v => {
    if (!query) return true;
    const q = query.toLowerCase();
    const siteMatch = v.site_id.toLowerCase().includes(q) || v.location_name.toLowerCase().includes(q) || v.zone.toLowerCase().includes(q);
    const leadMatch = v.top_leads && v.top_leads.some(l => l.company_name.toLowerCase().includes(q) || l.industry.toLowerCase().includes(q));
    return siteMatch || leadMatch;
  }).slice(0, 8);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '80px',
      zIndex: 99999
    }}>
      
      <div className="glass-panel" style={{ width: '100%', maxWidth: '680px', padding: '20px', borderRadius: '16px' }}>
        
        {/* Search Input Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <Search style={{ width: '20px', height: '20px', color: 'var(--primary-cyan)' }} />
          <input 
            type="text"
            autoFocus
            placeholder="Type company, site ID, zone, or action (e.g. Bandra, HRD-105)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '1rem',
              outline: 'none',
              fontWeight: 500
            }}
          />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
            ESC
          </span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Quick Results List */}
        <div style={{ marginTop: '16px', maxHeight: '420px', overflowY: 'auto' }}>
          
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Matching Billboard Vacancies & Leads ({filteredVacancies.length})
          </div>

          {filteredVacancies.map(vac => {
            const topLead = vac.top_leads ? vac.top_leads[0] : null;

            return (
              <div 
                key={vac.site_id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-cyan)' }}>{vac.site_id}</span>
                    <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>{vac.zone}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Free From: {vac.free_from_date}</span>
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px', color: '#fff' }}>
                    {vac.location_name}
                  </h4>

                  {topLead && (
                    <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '2px' }}>
                      🎯 Top Match: <strong>{topLead.company_name}</strong> ({topLead.overall_fit_score}% match)
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => { onClose(); onSelectMission(vac); }}
                    className="btn-primary"
                    style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                  >
                    <Zap style={{ width: '12px', height: '12px' }} />
                    Mission
                  </button>

                  <button 
                    onClick={() => { onClose(); onSelectPitch(vac, topLead); }}
                    className="btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                  >
                    <Send style={{ width: '12px', height: '12px' }} />
                    Pitch
                  </button>
                </div>

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
}
