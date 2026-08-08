// frontend/src/components/AgentActivityDrawer.jsx
/**
 * Real-Time AI Agent Activity Feed Component (Phase 19)
 * -----------------------------------------------------
 * EXPLAINABLE ARCHITECTURE & PHASE 19 REQUIREMENT:
 * Displays live audit event stream of agentic system events:
 * - Vacancy scans
 * - Fit score calculations
 * - Recovery Mission launches
 * - Pitch generations
 */

import React, { useState, useEffect } from 'react';
import { Activity, X, RefreshCw, CheckCircle2, Zap } from 'lucide-react';

export default function AgentActivityDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/agent/activities');
      const data = await res.json();
      setActivities(data.activities || []);
    } catch (e) {
      console.error('Failed to fetch activities:', e);
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
      
      <div className="glass-panel" style={{ width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', borderRadius: '16px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity style={{ color: 'var(--primary-cyan)', width: '22px', height: '22px' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>AI Agent Real-Time Activity Log</h2>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X style={{ width: '22px', height: '22px' }} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activities.map(act => (
            <div 
              key={act.id}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{act.action_type}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{act.timestamp}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#fff', marginTop: '4px', lineHeight: '1.4' }}>
                  {act.message}
                </p>
              </div>

              <CheckCircle2 style={{ width: '16px', height: '16px', color: '#34d399', flexShrink: 0 }} />
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
