// frontend/src/components/TimelineView.jsx
/**
 * 90-Day War Room Timeline Component (Phase 13)
 * ---------------------------------------------
 * EXPLAINABLE ARCHITECTURE & PHASE 13 REQUIREMENT:
 * Displays active occupancy vs upcoming vacancy gaps.
 * Filters: 7 Days | 30 Days | 60 Days | 90 Days.
 * Direct click on any vacant bar launches Autonomous Recovery Mission!
 */

import React, { useEffect, useState } from 'react';
import { Clock, Calendar, Zap, AlertCircle, Building } from 'lucide-react';

export default function TimelineView({ referenceDate, onSelectMission }) {
  const [timelineData, setTimelineData] = useState(null);
  const [horizonFilter, setHorizonFilter] = useState('90');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/timeline')
      .then(res => res.json())
      .then(data => {
        setTimelineData(data.sites);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load timeline:', err);
        setLoading(false);
      });
  }, [referenceDate]);

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading 90-Day War Room Visual Timeline...
      </div>
    );
  }

  const maxHorizonDays = Number(horizonFilter);
  const filteredSites = (timelineData || []).filter(s => s.days_until_vacant <= maxHorizonDays);

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>90-Day Visual War Room Timeline</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Gantt view of active bookings, expiration dates, and vacant windows
          </p>
        </div>

        {/* Time Horizon Selector (7d, 30d, 60d, 90d) */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          {[
            { id: '7', label: '7 Days' },
            { id: '30', label: '30 Days' },
            { id: '60', label: '60 Days' },
            { id: '90', label: '90 Days' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setHorizonFilter(f.id)}
              style={{
                background: horizonFilter === f.id ? 'var(--primary-blue)' : 'transparent',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 140px', gap: '16px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          Site ID & Location
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-cyan)', textAlign: 'center' }}>
          <div>Horizon Phase 1</div>
          <div>Horizon Phase 2</div>
          <div>Horizon Phase 3</div>
        </div>

        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>
          Action
        </div>
      </div>

      {/* Timeline Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredSites.map(site => {
          const daysLeft = site.days_until_vacant;
          
          let occupiedPct = 100;
          if (daysLeft < maxHorizonDays) {
            occupiedPct = Math.max(0, Math.min(100, Math.round((daysLeft / maxHorizonDays) * 100)));
          }
          const vacantPct = 100 - occupiedPct;

          return (
            <div 
              key={site.site_id}
              style={{
                display: 'grid',
                gridTemplateColumns: '240px 1fr 140px',
                gap: '16px',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.2)',
                padding: '10px 14px',
                borderRadius: '10px',
                border: site.is_vacant_in_90d ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid var(--border-color)'
              }}
            >
              
              {/* Site Info */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>
                  {site.site_id}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {site.location_name}
                </div>
              </div>

              {/* Gantt Bar */}
              <div 
                onClick={() => onSelectMission && onSelectMission(site)}
                style={{ height: '26px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden', display: 'flex', cursor: 'pointer' }}
                title="Click to launch Recovery Mission"
              >
                {occupiedPct > 0 && (
                  <div 
                    style={{
                      width: `${occupiedPct}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '8px',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 600
                    }}
                  >
                    {occupiedPct > 15 && `Occupied (${daysLeft}d)`}
                  </div>
                )}

                {vacantPct > 0 && (
                  <div 
                    style={{
                      width: `${vacantPct}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #f43f5e, #e11d48)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}
                  >
                    {vacantPct > 20 && `VACANT from ${site.free_from_date}`}
                  </div>
                )}
              </div>

              {/* Mission Launch Button */}
              <div style={{ textAlign: 'right' }}>
                <button
                  onClick={() => onSelectMission && onSelectMission(site)}
                  className="btn-primary"
                  style={{ padding: '4px 8px', fontSize: '0.7rem', background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' }}
                >
                  <Zap style={{ width: '10px', height: '10px' }} />
                  Mission
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
