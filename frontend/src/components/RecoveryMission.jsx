import React, { useEffect, useState } from 'react';
import { CheckCircle2, LoaderCircle, Rocket, X } from 'lucide-react';
import { api } from '../services/api';

const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);

export default function RecoveryMission({ siteId, strategy, onClose, onPitch }) {
  const [mission, setMission] = useState(null); const [error, setError] = useState(''); const [active, setActive] = useState(-1);
  useEffect(() => { api.launchMission(siteId, strategy).then(setMission).catch(e => setError(e.message)); }, [siteId, strategy]);
  useEffect(() => {
    if (!mission) return undefined;
    setActive(0); const timers = mission.steps.slice(1).map((_, index) => setTimeout(() => setActive(index + 1), (index + 1) * 520));
    return () => timers.forEach(clearTimeout);
  }, [mission]);
  return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Recovery mission">
    <div className="glass-panel mission-modal"><button className="icon-button" onClick={onClose}><X /></button>
      <span className="eyebrow">Autonomous Billboard Revenue Recovery Agent</span><h2>Recovery Mission</h2>
      {error ? <p className="error-text">{error}</p> : !mission ? <div className="state-panel"><LoaderCircle className="spin" />Preparing deterministic mission…</div> : <>
        <div className="mission-summary"><div><small>Mission</small><b>{mission.mission_id}</b></div><div><small>Site</small><b>{mission.vacancy.site_id}</b></div><div><small>Top customer</small><b>{mission.top_lead?.company_name || 'Data unavailable'}</b></div><div><small>Expected recovery</small><b>{money(mission.revenue_risk.expected_recovery)}</b></div><div><small>Confidence</small><b>{mission.confidence}%</b></div></div>
        <div className="mission-steps">{mission.steps.map((step, index) => <div className={index <= active ? 'mission-step done' : 'mission-step'} key={step.id}>{index < active ? <CheckCircle2 /> : index === active ? <LoaderCircle className="spin" /> : <span className="step-dot" />}<div><b>{step.label}</b>{index <= active && <small>{step.evidence}</small>}</div></div>)}</div>
        {active === mission.steps.length - 1 && <div className="mission-ready"><Rocket /> <div><b>MISSION READY</b><small>{mission.next_best_action.action} · {mission.next_best_action.channel}</small></div>{mission.top_lead && <button className="btn-primary" onClick={() => onPitch(mission.vacancy, mission.top_lead)}>Generate pitch</button>}</div>}
      </>}
    </div>
  </div>;
}
