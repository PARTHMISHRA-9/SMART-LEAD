// frontend/src/components/RecoveryMissionModal.jsx
/**
 * Autonomous Revenue Recovery Mission Modal Component
 * ----------------------------------------------------
 * EXPLAINABLE AGENTIC ARCHITECTURE & PHASE 4 WOW FEATURE:
 * Executes and displays an animated 8-step agentic workflow for any target vacant site:
 * STEP 1: Analyzing Vacancy Parameters & Exposure
 * STEP 2: Analyzing Customer History & Portfolio
 * STEP 3: Checking Budget Compatibility & Financial Constraints
 * STEP 4: Evaluating Industry & Location Demographic Synergy
 * STEP 5: Ranking Lead Candidates
 * STEP 6: Selecting Next Best Action Strategy
 * STEP 7: Formulating Zero-Hallucination Pitch
 * STEP 8: Calculating Revenue Recovery Forecast & Confidence
 * 
 * Displays MISSION READY executive card with 1-click pitch trigger!
 */

import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle2, ShieldCheck, DollarSign, Send, X, ArrowRight, Loader2, Sparkles, Clock } from 'lucide-react';

export default function RecoveryMissionModal({ isOpen, onClose, vacancy, strategyMode = 'BALANCED', onSelectForPitch }) {
  if (!isOpen || !vacancy) return null;

  const [missionData, setMissionData] = useState(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    runMission();
  }, [vacancy, strategyMode]);

  const runMission = async () => {
    setRunning(true);
    setActiveStepIndex(0);
    setMissionData(null);

    try {
      const res = await fetch('/api/mission/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: vacancy.site_id,
          strategyMode: strategyMode
        })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setMissionData(data.mission);

        // Animate progression through the 8 workflow steps
        for (let i = 0; i < 8; i++) {
          await new Promise(r => setTimeout(r, 450)); // 450ms smooth transition per step
          setActiveStepIndex(i + 1);
        }
        setRunning(false);
      }
    } catch (err) {
      console.error('Failed to run recovery mission:', err);
      setRunning(false);
    }
  };

  const stepsList = missionData ? missionData.agent_steps : [
    { step_number: 1, title: 'Analyzing Vacancy Parameters', detail: 'Calculating days until vacant and 90d revenue exposure...' },
    { step_number: 2, title: 'Analyzing Customer History', detail: 'Scanning past bookings and zone preferences...' },
    { step_number: 3, title: 'Checking Budget Compatibility', detail: 'Verifying max budget vs site rate card...' },
    { step_number: 4, title: 'Checking Industry/Location Fit', detail: 'Matching target demographic with industry categories...' },
    { step_number: 5, title: 'Ranking Best-Fit Customers', detail: 'Computing 100-point multi-factor fit scores...' },
    { step_number: 6, title: 'Selecting Outreach Strategy', detail: 'Determining Next Best Action & optimal channel...' },
    { step_number: 7, title: 'Generating Personalised Pitch', detail: 'Drafting facts-based pitch email and WhatsApp...' },
    { step_number: 8, title: 'Calculating Expected Recovery', detail: 'Computing statistical confidence & recovery forecast...' }
  ];

  const topLead = missionData ? missionData.top_customer : null;
  const nextAction = missionData ? missionData.next_action : null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '20px'
    }}>
      
      <div className="glass-panel" style={{ width: '100%', maxWidth: '840px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)' }}>
              <Zap style={{ color: '#fff', width: '24px', height: '24px' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }} className="gradient-text">
                  RECOVERY MISSION #{missionData ? missionData.mission_id : 'RM-101'}
                </h2>
                <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>
                  {vacancy.urgency_tier}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Target Site: <strong style={{ color: '#fff' }}>{vacancy.site_id} ({vacancy.location_name})</strong>
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}>
            <X style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        {/* 8-Step Agent Workflow Execution Grid */}
        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '14px', padding: '16px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-cyan)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles style={{ width: '14px', height: '14px' }} />
            Agentic Workflow Execution Engine (Real Calculations)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '10px' }}>
            {stepsList.map((st, idx) => {
              const isDone = activeStepIndex > idx;
              const isCurrent = activeStepIndex === idx + 1 && running;

              return (
                <div 
                  key={st.step_number}
                  style={{
                    background: isDone ? 'rgba(16, 185, 129, 0.08)' : isCurrent ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isDone ? 'rgba(16, 185, 129, 0.3)' : isCurrent ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: '10px',
                    padding: '10px 12px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isDone ? '#34d399' : isCurrent ? '#60a5fa' : 'var(--text-dim)' }}>
                      STEP {st.step_number}: {st.title}
                    </span>
                    {isDone ? (
                      <CheckCircle2 style={{ width: '16px', height: '16px', color: '#34d399' }} />
                    ) : isCurrent ? (
                      <Loader2 style={{ width: '16px', height: '16px', color: '#60a5fa', animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <Clock style={{ width: '14px', height: '14px', color: 'var(--text-dim)' }} />
                    )}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.3' }}>
                    {st.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* MISSION READY EXECUTIVE CARD */}
        {!running && missionData && (
          <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(59, 130, 246, 0.12) 100%)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
              <div>
                <span className="badge badge-green" style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
                  ✓ MISSION READY
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '6px', color: '#fff' }}>
                  Target Lead: {topLead.company_name} ({missionData.fit_match_pct}% Match)
                </h3>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>EXPECTED RECOVERY</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>
                  ${missionData.expected_recovery_value.toLocaleString()}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#60a5fa' }}>
                  {missionData.confidence_pct}% Confidence Score
                </span>
              </div>
            </div>

            {/* Quick Next Action Callout */}
            {nextAction && (
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>RECOMMENDED NEXT ACTION:</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f59e0b', marginTop: '2px' }}>
                    {nextAction.action} via {nextAction.channel} (Priority: {nextAction.priority})
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {nextAction.reason}
                  </p>
                </div>

                <button 
                  onClick={() => { onClose(); onSelectForPitch(vacancy, topLead); }}
                  className="btn-primary"
                  style={{ padding: '10px 18px', fontSize: '0.9rem' }}
                >
                  <Send style={{ width: '16px', height: '16px' }} />
                  Execute Pitch Lead
                </button>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
