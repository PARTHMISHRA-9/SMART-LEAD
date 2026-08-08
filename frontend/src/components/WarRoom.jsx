import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Radar, RefreshCw, Rocket, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 1 }).format(value || 0);
const labels = { total_active_hoardings: 'Active hoardings', occupied_sites: 'Occupied sites', upcoming_vacancies: 'Upcoming vacancies', critical_vacancies: 'Critical vacancies', revenue_at_risk: 'Revenue at risk', predicted_revenue_recovery: 'Predicted recovery', renewal_opportunities: 'Renewal opportunities', average_vacancy_risk: 'Average vacancy risk', pipeline_value: 'Pipeline value' };
const isMoney = key => ['revenue_at_risk', 'predicted_revenue_recovery', 'pipeline_value'].includes(key);

export default function WarRoom({ onPitch, onLaunchMission }) {
  const [data, setData] = useState(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); setError(''); api.warRoom().then(setData).catch(e => setError(e.message)).finally(() => setLoading(false)); };
  useEffect(load, []);
  if (loading) return <div className="glass-panel state-panel">Loading executive portfolio intelligence…</div>;
  if (error) return <div className="glass-panel state-panel">{error}<button className="btn-secondary" onClick={load}><RefreshCw size={15} /> Retry</button></div>;
  return <section>
    <div className="section-heading"><div><span className="eyebrow">Executive mode · deterministic calculations</span><h2>Revenue War Room</h2><p>Prioritize revenue exposure, renewals, and the next site to protect.</p></div><ShieldCheck color="var(--accent-emerald)" /></div>
    <div className="grid-metrics">{Object.entries(data.metrics).map(([key, value]) => <article className="glass-card kpi-card" key={key}><span>{labels[key]}</span><strong>{isMoney(key) ? money(value) : key === 'average_vacancy_risk' ? `${value}%` : value}</strong><small>{key === 'revenue_at_risk' ? 'Three-month exposure from available rate cards' : 'Calculated from current portfolio records'}</small></article>)}</div>
    <div className="glass-panel radar-panel"><div className="section-heading"><div><span className="eyebrow">Vacancy Radar</span><h3>Predictive Risk Score</h3></div><Radar color="var(--primary-cyan)" /></div><p className="muted">Rule-based risk—not machine learning. Scores are reproducible from booking and customer records.</p>
      <div className="radar-list">{data.radar.slice(0, 6).map(({ vacancy, risk }) => <article className="radar-row" key={vacancy.site_id}><div><b>{vacancy.site_id}</b><span>{vacancy.location_name}</span></div><span className={`risk risk-${risk.risk_category.toLowerCase()}`}>{risk.risk_category} · {risk.vacancy_probability}%</span><div><b>{money(risk.revenue_risk)}</b><span>{risk.days_to_likely_vacancy} days to likely vacancy</span></div><div className="radar-action"><small>{risk.factors[0]}</small><button className="btn-primary" onClick={() => onLaunchMission(vacancy.site_id)}><Rocket size={14}/> Launch mission</button></div></article>)}</div>
    </div>
  </section>;
}
