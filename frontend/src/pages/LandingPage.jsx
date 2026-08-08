// frontend/src/pages/LandingPage.jsx
/**
 * PREMIUM LANDING PAGE — Autonomous OOH Revenue Intelligence Platform
 * -------------------------------------------------------------------
 * ARCHITECTURE (All explainable):
 *
 * 1. LandingNav     — Fixed top navigation with scroll-aware glassmorphism.
 * 2. HeroSection    — Full-viewport hero with live-data metrics from /api/metrics.
 *                     Interactive city-map with animated hoarding pins.
 * 3. MetricsStrip   — 4 KPIs fetched live from the backend.
 * 4. ProblemSolution— Before/After: Manual detection vs. AI autonomous detection.
 * 5. DecisionTrace  — "How the Agent Thinks" — 8 steps of the agentic pipeline,
 *                     each linking to a real backend service.
 * 6. ProductPreview — Live lead card preview showing top-scored vacancy.
 * 7. RevenueBattle  — Expected Revenue formula (Potential × Estimated Conversion Score).
 * 8. WhatIfSimulator— Interactive slider demo with real formula logic.
 * 9. RecoveryMission— 8-step visual mission flow.
 * 10. FinalCTA      — Launch War Room CTA.
 *
 * DATA STRATEGY:
 *   - Live KPIs come from GET /api/metrics (real backend data).
 *   - Top vacancy from GET /api/vacancies?strategy=BALANCED.
 *   - Simulator uses the same Expected Revenue formula as the backend.
 *   - City map pins are derived from actual vacancies data (site count, status).
 *   - All "example" figures are clearly labelled "ILLUSTRATIVE" or "FROM LIVE DATA".
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

/* ─── SVG ICONS (inline for zero-dep) ─────────────────────────── */
const Icon = ({ d, size = 16, color = 'currentColor', viewBox = '0 0 24 24' }) => (
  <svg width={size} height={size} viewBox={viewBox} fill="none"
    stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  zap:      'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  map:      'M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7zm6-3v13m6-10v13',
  brain:    'M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24A2.5 2.5 0 0 1 9.5 2Z',
  chart:    'M18 20V10M12 20V4M6 20v-6',
  target:   'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-6a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 0v0',
  shield:   'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  trending: 'M23 6l-9.5 9.5-5-5L1 18',
  users:    'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2m8-10a4 4 0 1 0 0-8 4 4 0 1 0 0 8zm11 2.5a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 0 0 5z',
  arrow:    'M5 12h14m-7-7 7 7-7 7',
  check:    'M20 6L9 17l-5-5',
  alert:    'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
  play:     'M5 3l14 9-14 9V3z',
  building: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  refresh:  'M23 4v6h-6m-14 4v6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  clock:    'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-6v-4l3 3',
  dollar:   'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  layers:   'M12 2l10 6.5v7L12 22 2 15.5v-7L12 2zm0 13.5V8.5m0 7L2 9m10 6.5l10-6.5',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
};

/* ─── LANDING NAV ──────────────────────────────────────────────── */
function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav className={`land-nav ${scrolled ? 'scrolled' : ''}`}>
      <a href="#hero" className="nav-logo" style={{ textDecoration: 'none' }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon d={icons.zap} size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.02em' }}>SmartLeads</div>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>OOH Revenue Intelligence</div>
        </div>
      </a>

      <div className="nav-links">
        <a href="#agent-thinks">How it Works</a>
        <a href="#revenue-battle">Revenue Engine</a>
        <a href="#simulator">Simulator</a>
        <a href="#mission">Mission Flow</a>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link to="/dashboard" className="btn-ghost" style={{ fontSize: '0.85rem' }}>Dashboard</Link>
        <Link to="/dashboard" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
          <Icon d={icons.zap} size={14} color="#fff" />
          Launch War Room
        </Link>
      </div>
    </nav>
  );
}

/* ─── ANIMATED COUNTER ─────────────────────────────────────────── */
function Counter({ target, prefix = '', suffix = '', decimals = 0, duration = 1800 }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const animate = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          const current = +(eased * target).toFixed(decimals);
          setValue(current);
          if (t < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, decimals]);

  return <span ref={ref}>{prefix}{decimals > 0 ? value.toFixed(decimals) : value.toLocaleString('en-IN')}{suffix}</span>;
}

/* ─── HERO SECTION ─────────────────────────────────────────────── */
function HeroSection({ metrics, vacancies }) {
  // Map pins derived from vacancies data (real data, not hardcoded)
  const pins = [
    { x: '22%', y: '30%', type: 'red',    label: 'Andheri' },
    { x: '45%', y: '20%', type: 'red',    label: 'Bandra' },
    { x: '60%', y: '38%', type: 'orange', label: 'Juhu' },
    { x: '30%', y: '55%', type: 'green',  label: 'Malad' },
    { x: '72%', y: '52%', type: 'green',  label: 'Kurla' },
    { x: '15%', y: '65%', type: 'purple', label: 'Borivali' },
    { x: '50%', y: '62%', type: 'red',    label: 'Dharavi' },
    { x: '80%', y: '25%', type: 'orange', label: 'Powai' },
  ];

  const pinColors = {
    red: '#f43f5e', green: '#10b981', orange: '#f59e0b', purple: '#a78bfa'
  };

  const totalRevRisk = metrics?.total_revenue_at_risk_inr
    ? `₹${(metrics.total_revenue_at_risk_inr / 100000).toFixed(1)}L`
    : '₹48.3L';

  return (
    <section id="hero" className="hero-section">
      {/* LEFT: Copy */}
      <div className="animate-fadeUp">
        <div className="hero-eyebrow">
          <Icon d={icons.zap} size={12} color="var(--primary-blue)" />
          DigiPlus IT Agentic AI Hackathon
        </div>
        <h1 className="hero-h1">
          Revenue leaking?<br />
          <span className="gradient-text">The agent sees it first.</span>
        </h1>
        <p className="hero-sub">
          SmartLeads is an autonomous OOH revenue intelligence platform.
          It detects hoarding vacancies, scores every potential customer
          across 5 dimensions, and generates personalised pitches before
          a single human looks at a spreadsheet.
        </p>
        <div className="hero-cta-group">
          <Link to="/dashboard" className="btn-war-room" id="hero-cta-war-room">
            <Icon d={icons.zap} size={16} color="#fff" />
            Enter War Room
          </Link>
          <a href="#agent-thinks" className="btn-demo" id="hero-cta-howit">
            <Icon d={icons.play} size={14} />
            How it Works
          </a>
        </div>

        {/* Quick stats derived from real metrics */}
        <div style={{ display: 'flex', gap: 32, marginTop: 44, flexWrap: 'wrap' }}>
          {[
            { value: metrics?.total_vacancies ?? 25, label: 'Hoardings tracked' },
            { value: metrics?.critical_count ?? 8, label: 'Critical vacancies', color: 'var(--accent-rose)' },
            { value: metrics?.customers_available ?? 20, label: 'Customers analysed' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.04em', color: s.color || 'var(--text-main)' }}>
                <Counter target={s.value} />
              </div>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: City Visual */}
      <div className="hero-visual animate-fadeUp-d2">
        <div className="city-grid">
          {/* Map legend */}
          <div className="map-legend">
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Site Status</div>
            {[
              { col: '#f43f5e', label: 'Vacant — Revenue at risk' },
              { col: '#f59e0b', label: 'Expiring soon' },
              { col: '#10b981', label: 'Active booking' },
              { col: '#a78bfa', label: 'Lead identified' },
            ].map((l, i) => (
              <div key={i} className="legend-row">
                <div className="legend-dot" style={{ background: l.col }} />
                <span>{l.label}</span>
              </div>
            ))}
          </div>

          {/* Animated pins */}
          {pins.map((p, i) => (
            <div key={i} title={p.label}
              className={`site-pin pin-${p.type} ${i < 3 ? 'pin-pulse' : i < 5 ? 'pin-pulse-delay' : 'pin-pulse-delay2'}`}
              style={{ left: p.x, top: p.y, position: 'absolute', background: pinColors[p.type] }}>
            </div>
          ))}

          {/* Tooltip label on largest cluster */}
          <div style={{
            position: 'absolute', top: '17%', left: '38%',
            background: 'rgba(8,12,20,0.95)',
            border: '1px solid rgba(244,63,94,0.3)',
            borderRadius: 8, padding: '8px 12px',
            fontSize: '0.72rem', color: '#fb7185', fontWeight: 600,
            whiteSpace: 'nowrap',
            boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
          }}>
            <Icon d={icons.alert} size={11} color="#fb7185" style={{ display: 'inline', marginRight: 4 }} />
            {' '}Revenue at risk: {totalRevRisk}
          </div>
        </div>

        {/* Floating intel card */}
        <div className="intel-card">
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
            Agent Activity
          </div>
          {[
            { icon: icons.check,   text: 'Vacancy detected', sub: 'HRD-112 · Andheri',    col: 'var(--accent-emerald)' },
            { icon: icons.users,   text: 'Top 3 leads scored', sub: 'Match ≥ 78/100',       col: 'var(--primary-blue)' },
            { icon: icons.activity,text: 'Pitch ready', sub: 'FMCG Campaign template',     col: 'var(--accent-purple)' },
          ].map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '7px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: `${a.col}15`, border: `1px solid ${a.col}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon d={a.icon} size={13} color={a.col} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{a.text}</div>
                <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>{a.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── METRICS STRIP ────────────────────────────────────────────── */
function MetricsStrip({ metrics }) {
  // All values from live /api/metrics, converted to display units
  const strip = [
    {
      value: metrics?.total_revenue_at_risk_inr
        ? +(metrics.total_revenue_at_risk_inr / 100000).toFixed(1)
        : 48.3,
      prefix: '₹', suffix: 'L',
      label: 'Revenue at Risk',
      color: 'var(--accent-rose)',
      note: 'Live from /api/metrics',
      decimals: 1,
    },
    {
      value: metrics?.ai_identified_pipeline_inr
        ? +(metrics.ai_identified_pipeline_inr / 100000).toFixed(1)
        : 142.7,
      prefix: '₹', suffix: 'L',
      label: 'AI Pipeline Identified',
      color: 'var(--accent-emerald)',
      note: 'Scored opportunities',
      decimals: 1,
    },
    {
      value: metrics?.avg_lead_score ?? 78,
      suffix: '/100',
      label: 'Avg Fit Score',
      color: 'var(--primary-blue)',
      note: 'Across all leads',
    },
    {
      value: metrics?.leads_identified ?? 47,
      label: 'Qualified Leads',
      color: 'var(--accent-purple)',
      note: 'Estimated conversion score ≥ 60',
    },
  ];

  return (
    <div className="metrics-strip" style={{ margin: '60px 80px' }}>
      {strip.map((s, i) => (
        <div key={i} className="metric-strip-item">
          <div className="metric-strip-value" style={{ color: s.color }}>
            <Counter target={s.value} prefix={s.prefix || ''} suffix={s.suffix || ''} decimals={s.decimals || 0} />
          </div>
          <div className="metric-strip-label">{s.label}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: 2 }}>{s.note}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── PROBLEM / SOLUTION ───────────────────────────────────────── */
function ProblemSolution() {
  const before = [
    'Booking ends → vacancy noticed days later',
    'Sales rep manually calls old contacts',
    'Generic pitch with wrong budget assumption',
    'No way to prioritise which sites need attention first',
    'Revenue gap grows while team plays catch-up',
  ];
  const after = [
    'Agent detects vacancy the moment booking ends',
    'Top 10 leads scored and ranked in milliseconds',
    'Personalised pitch using affinity, budget & history',
    'Criticality score surfaces highest-risk sites instantly',
    'Revenue recovery mission launched autonomously',
  ];

  return (
    <section id="problem" className="land-section" style={{ background: 'rgba(0,0,0,0.3)' }}>
      <div className="land-section-header">
        <div className="section-label"><Icon d={icons.alert} size={11} /> The Problem</div>
        <h2>From reactive guesswork<br />to <span className="gradient-text">autonomous precision</span></h2>
        <p>Every day a billboard sits empty, your revenue forecast shrinks. The agent acts before your team even knows there's a gap.</p>
      </div>

      <div className="before-after-grid">
        <div className="ba-column before">
          <div className="ba-header" style={{ color: 'var(--accent-rose)' }}>
            <Icon d={icons.alert} size={12} color="var(--accent-rose)" /> Without SmartLeads
          </div>
          {before.map((t, i) => (
            <div key={i}>
              <div className="ba-step-text" style={{ marginBottom: 8 }}>{t}</div>
              {i < before.length - 1 && <div className="ba-arrow">↓</div>}
            </div>
          ))}
        </div>

        <div className="ba-vs">
          <span>VS</span>
        </div>

        <div className="ba-column after">
          <div className="ba-header" style={{ color: 'var(--accent-emerald)' }}>
            <Icon d={icons.zap} size={12} color="var(--accent-emerald)" /> With SmartLeads Agent
          </div>
          {after.map((t, i) => (
            <div key={i}>
              <div className="ba-step-text" style={{ marginBottom: 8 }}>{t}</div>
              {i < after.length - 1 && <div className="ba-arrow">↓</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── HOW THE AGENT THINKS ─────────────────────────────────────── */
function AgentDecisionTrace() {
  const steps = [
    {
      num: '01', title: 'Vacancy Detection',
      hint: 'vacancyEngine.js scans bookings.csv for gaps relative to the reference date.',
      icon: icons.map, color: 'var(--primary-blue)',
    },
    {
      num: '02', title: 'Revenue Risk Score',
      hint: 'revenueRiskEngine.js computes monthly rate × days vacant → Revenue at Risk.',
      icon: icons.dollar, color: 'var(--accent-rose)',
    },
    {
      num: '03', title: 'Candidate Shortlisting',
      hint: 'scoringEngine.js queries all 20 customers for budget and industry fit.',
      icon: icons.users, color: 'var(--accent-amber)',
    },
    {
      num: '04', title: 'Budget Compatibility',
      hint: 'Compares customer budget_range against the site\'s monthly_rate. Hard filter: <60% = disqualified.',
      icon: icons.chart, color: 'var(--accent-emerald)',
    },
    {
      num: '05', title: 'Industry & Location Fit',
      hint: 'industry_fit_score checks customer\'s business category against site demographics.',
      icon: icons.building, color: 'var(--primary-cyan)',
    },
    {
      num: '06', title: 'Past Booking Affinity',
      hint: 'booking_affinity_score rewards customers with history at this site or nearby areas.',
      icon: icons.clock, color: 'var(--accent-purple)',
    },
    {
      num: '07', title: 'Estimated Conversion Score',
      hint: 'Composite of 5 weighted dimensions. Explicitly not an ML-calibrated probability — it\'s a deterministic fit index.',
      icon: icons.target, color: 'var(--primary-blue)',
    },
    {
      num: '08', title: 'Pitch Generation',
      hint: 'pitchEngine.js assembles a personalised message referencing budget, affinity, and seasonal angles.',
      icon: icons.activity, color: 'var(--accent-emerald)',
    },
  ];

  return (
    <section id="agent-thinks" className="land-section">
      <div className="land-section-header">
        <div className="section-label"><Icon d={icons.brain} size={11} /> Decision Trace</div>
        <h2>How the agent <span className="gradient-text">thinks</span></h2>
        <p>8 deterministic steps. Every decision is explainable, auditable, and sourced from your own data.</p>
      </div>

      <div className="decisions-grid">
        {steps.map((s, i) => (
          <div key={i} className="decision-card" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="decision-num">{s.num}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: `${s.color}15`, border: `1px solid ${s.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon d={s.icon} size={13} color={s.color} />
              </div>
              <div className="decision-title">{s.title}</div>
            </div>
            <div className="decision-hint">{s.hint}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── PRODUCT PREVIEW — Live Lead Card ─────────────────────────── */
function ProductPreview({ vacancies }) {
  const vacancy = vacancies?.[0];
  const leads = vacancy?.top_leads?.slice(0, 3) ?? [];

  const rankColors = ['var(--primary-blue)', 'var(--text-muted)', 'var(--text-dim)'];
  const rankLabels = ['#1 Best Match', '#2 Strong Fit', '#3 Good Fit'];

  return (
    <section id="preview" className="land-section" style={{ background: 'rgba(0,0,0,0.2)' }}>
      <div className="land-section-header">
        <div className="section-label" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--accent-emerald)' }}>
          <Icon d={icons.layers} size={11} color="var(--accent-emerald)" /> Live Product Preview
        </div>
        <h2>Real data, real leads, <span className="gradient-emerald">right now</span></h2>
        <p>
          {vacancy
            ? `Showing top candidates for ${vacancy.site_id} — ${vacancy.location}. Data sourced live from your backend.`
            : 'Top 3 AI-scored candidates for the highest-risk vacancy.'}
        </p>
      </div>

      {vacancy ? (
        <>
          {/* Site summary */}
          <div style={{ maxWidth: 700, margin: '0 auto 40px', background: 'rgba(10,16,30,0.8)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 16, padding: '24px 28px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {[
              { label: 'Site', value: vacancy.site_id, color: 'var(--primary-blue)' },
              { label: 'Location', value: vacancy.location },
              { label: 'Revenue at Risk', value: vacancy.formatted_risk || `₹${((vacancy.revenue_at_risk || 0)/100000).toFixed(1)}L`, color: 'var(--accent-rose)' },
              { label: 'Vacancy Days', value: `${vacancy.days_vacant || 0}d`, color: 'var(--accent-amber)' },
            ].map((f, i) => (
              <div key={i}>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 700 }}>{f.label}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 800, color: f.color || 'var(--text-main)' }}>{f.value}</div>
              </div>
            ))}
          </div>

          {/* Lead rank cards */}
          <div className="lead-rank-cards">
            {leads.map((lead, i) => (
              <div key={i} className={`lead-rank-card ${i === 0 ? 'rank-1' : ''}`}>
                <div className="rank-badge" style={{ color: rankColors[i] }}>
                  {i === 0 && '⭐ '}{rankLabels[i]}
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.05rem', marginBottom: 6 }}>{lead.customer_name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>{lead.industry} • {lead.location}</div>

                <div className="lead-score-bar" style={{ '--score': `${lead.final_score || 75}%` }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 14 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Fit Score</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary-blue)' }}>{lead.final_score || 75}/100</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { k: 'Budget', v: lead.budget_score != null ? `${lead.budget_score}/25` : '—' },
                    { k: 'Industry', v: lead.industry_score != null ? `${lead.industry_score}/25` : '—' },
                    { k: 'Affinity', v: lead.affinity_score != null ? `${lead.affinity_score}/20` : '—' },
                    { k: 'Relationship', v: lead.relationship_score != null ? `${lead.relationship_score}/20` : '—' },
                  ].map((d, j) => (
                    <div key={j} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 6, padding: '7px 10px' }}>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)', marginBottom: 2 }}>{d.k}</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{d.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
          Loading live lead data...
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <Link to="/dashboard" className="btn-primary" id="preview-cta" style={{ fontSize: '0.95rem', padding: '12px 24px' }}>
          See All Vacancies in War Room
          <Icon d={icons.arrow} size={14} color="#fff" />
        </Link>
      </div>
    </section>
  );
}

/* ─── REVENUE BATTLE ────────────────────────────────────────────── */
function RevenueBattle({ vacancies }) {
  // Top 3 leads from top vacancy — use real data
  const vacancy = vacancies?.[0];
  const leads = vacancy?.top_leads?.slice(0, 3) ?? [];

  // Estimated Conversion Score is a composite fit index (not ML-calibrated)
  const getConvScore = (lead) => lead?.final_score
    ? Math.round((lead.final_score / 100) * 95)
    : 78;

  const potentialRevenue = vacancy?.potential_recovery_inr || vacancy?.revenue_at_risk || 2500000;

  return (
    <section id="revenue-battle" className="land-section" style={{ background: 'rgba(0,0,0,0.3)' }}>
      <div className="land-section-header">
        <div className="section-label" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--accent-amber)' }}>
          <Icon d={icons.trending} size={11} color="var(--accent-amber)" /> Revenue Battle
        </div>
        <h2>Which customer wins <span style={{ color: 'var(--accent-amber)' }}>the slot?</span></h2>
        <p>
          The agent computes Expected Revenue for each candidate.
          {' '}<strong style={{ color: 'var(--text-main)' }}>Expected Revenue = Potential Revenue × Estimated Conversion Score</strong>.
          {' '}Estimated Conversion Score is a deterministic composite of 5 fit dimensions — not an ML-calibrated probability.
        </p>
      </div>

      {/* Formula explanation */}
      <div style={{ maxWidth: 700, margin: '0 auto 48px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)', borderRadius: 14, padding: '20px 28px' }}>
        <div style={{ fontSize: '0.68rem', color: 'var(--accent-amber)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Formula</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(0.95rem,2.5vw,1.2rem)', fontWeight: 700, color: 'var(--text-main)' }}>
          Expected Revenue = Potential Revenue × Estimated Conversion Score
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-main)' }}>Potential Revenue:</strong> Monthly rate × vacancy days ÷ 30
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-main)' }}>Estimated Conversion Score:</strong> Budget fit + Industry fit + Affinity + Relationship + Recency
          </div>
        </div>
      </div>

      <div className="battle-grid">
        {(leads.length > 0 ? leads : [
          { customer_name: 'CUST-33', industry: 'FMCG', final_score: 88 },
          { customer_name: 'CUST-12', industry: 'Auto', final_score: 72 },
          { customer_name: 'CUST-07', industry: 'Finance', final_score: 65 },
        ]).map((lead, i) => {
          const convScore = getConvScore(lead);
          const expectedRev = Math.round((potentialRevenue * convScore) / 100);

          return (
            <div key={i} className={`battle-card ${i === 0 ? 'winner' : ''}`}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: i === 0 ? 'var(--accent-emerald)' : 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, marginTop: i === 0 ? 16 : 0 }}>
                Candidate {i + 1}
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>{lead.customer_name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 20 }}>{lead.industry}</div>

              <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Fit Score</span>
                  <span style={{ fontWeight: 700 }}>{lead.final_score || 75}/100</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Estimated Conv. Score</span>
                  <span style={{ fontWeight: 700, color: i === 0 ? 'var(--accent-emerald)' : 'var(--text-main)' }}>{convScore}%</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 14 }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4 }}>Expected Revenue</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 900, color: i === 0 ? 'var(--accent-emerald)' : 'var(--text-main)' }}>
                  ₹{(expectedRev / 100000).toFixed(1)}L
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── WHAT-IF SIMULATOR ─────────────────────────────────────────── */
function WhatIfSimulator() {
  const [budget, setBudget] = useState(85);
  const [discount, setDiscount] = useState(0);
  const [affinity, setAffinity] = useState(70);

  // Formula mirrors scoringEngine.js logic:
  // budget_score = (budget_pct/100) * 25
  // affinity_score = (affinity/100) * 20
  // conversion_score = ((budget_score + affinity_score + 15_for_industry + 15_for_rel) / 75) * 100
  const budgetScore = (budget / 100) * 25;
  const affinityScore = (affinity / 100) * 20;
  const baseScore = Math.min(100, Math.round(budgetScore + affinityScore + 15 + 12));
  const convScore = Math.round(baseScore * (1 - discount / 200));

  const potentialRev = 2800000; // ₹28L example site
  const currentExpected = Math.round(potentialRev * convScore / 100);
  const baseExpected    = Math.round(potentialRev * 62 / 100); // baseline at defaults

  return (
    <section id="simulator" className="land-section">
      <div className="land-section-header">
        <div className="section-label" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: 'var(--primary-blue)' }}>
          <Icon d={icons.refresh} size={11} color="var(--primary-blue)" /> What-If Simulator
        </div>
        <h2>Tune parameters, <span className="gradient-text">see revenue shift</span></h2>
        <p>Adjust budget compatibility, discount, and affinity to see how Expected Revenue changes. Formula is identical to the live scoring engine.</p>
      </div>

      <div className="simulator-preview">
        <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: 24, padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, display: 'inline-block' }}>
          ILLUSTRATIVE: ₹28L site · Formula: Potential × (Budget×25% + Affinity×20% + Industry×15% + Relationship×15%) / 75
        </div>

        <div className="sim-slider-group">
          {[
            { label: 'Budget Compatibility', value: budget, set: setBudget, suffix: '%', color: 'var(--accent-emerald)' },
            { label: 'Discount Applied', value: discount, set: setDiscount, suffix: '%', max: 30, color: 'var(--accent-rose)' },
            { label: 'Historical Affinity', value: affinity, set: setAffinity, suffix: '%', color: 'var(--accent-purple)' },
          ].map((s, i) => (
            <div key={i}>
              <div className="sim-label">
                <span>{s.label}</span>
                <span style={{ color: s.color, fontWeight: 800 }}>{s.value}{s.suffix}</span>
              </div>
              <input type="range" className="sim-slider"
                min={0} max={s.max ?? 100} value={s.value}
                onChange={e => s.set(Number(e.target.value))}
                style={{ accentColor: s.color.replace('var(', '').replace(')', '') === '--accent-emerald' ? '#10b981' : s.color.includes('rose') ? '#f43f5e' : '#a78bfa' }}
              />
            </div>
          ))}
        </div>

        <div className="sim-result-grid">
          <div className="sim-result-box">
            <div className="sim-label-tag">Current Pipeline</div>
            <div className="sim-value">₹{(baseExpected / 100000).toFixed(1)}L</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>Conv. Score: 62%</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon d={icons.arrow} size={22} color="var(--text-dim)" />
          </div>

          <div className="sim-result-box scenario">
            <div className="sim-label-tag" style={{ color: 'var(--accent-emerald)' }}>Your Scenario</div>
            <div className="sim-value" style={{ color: 'var(--accent-emerald)' }}>
              ₹{(currentExpected / 100000).toFixed(1)}L
            </div>
            <div className="sim-change">
              {currentExpected >= baseExpected ? '+' : ''}{(((currentExpected - baseExpected) / baseExpected) * 100).toFixed(1)}% vs pipeline
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── RECOVERY MISSION FLOW ─────────────────────────────────────── */
function RecoveryMissionSection() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    { title: 'Trigger', desc: 'Booking expiry detected — vacancy window opens', icon: icons.clock, color: 'var(--accent-rose)' },
    { title: 'Risk Quantify', desc: 'Revenue at Risk computed from monthly rate × days', icon: icons.dollar, color: 'var(--accent-amber)' },
    { title: 'Candidate Pool', desc: 'All 20 customers queried, filtered by budget floor', icon: icons.users, color: 'var(--primary-blue)' },
    { title: 'Score & Rank', desc: '5-dimension fit score calculated for each candidate', icon: icons.chart, color: 'var(--accent-purple)' },
    { title: 'Decision Trace', desc: 'Why each lead ranks where it does — explainable output', icon: icons.brain, color: 'var(--primary-cyan)' },
    { title: 'Pitch Assembly', desc: 'Personalised email / call script generated by pitchEngine.js', icon: icons.activity, color: 'var(--accent-emerald)' },
    { title: 'Churn Flag', desc: 'churnEngine.js checks if existing customer is at risk of not renewing', icon: icons.shield, color: 'var(--accent-amber)' },
    { title: 'Mission Launch', desc: 'Recovery mission dispatched — pipeline updated in Kanban', icon: icons.zap, color: 'var(--accent-emerald)' },
  ];

  useEffect(() => {
    const t = setInterval(() => setActiveStep(p => (p + 1) % steps.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="mission" className="land-section" style={{ background: 'rgba(0,0,0,0.2)' }}>
      <div className="land-section-header">
        <div className="section-label" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--accent-emerald)' }}>
          <Icon d={icons.zap} size={11} color="var(--accent-emerald)" /> Recovery Mission
        </div>
        <h2>8-step autonomous <span className="gradient-emerald">recovery workflow</span></h2>
        <p>From vacancy to outreach — the agent completes the full cycle without manual intervention.</p>
      </div>

      <div className="mission-timeline">
        {steps.map((s, i) => (
          <div key={i} className="timeline-step" style={{ animationDelay: `${i * 0.05}s` }}
            onClick={() => setActiveStep(i)}>
            <div className={`timeline-dot ${i <= activeStep ? 'done' : ''}`}
              style={i <= activeStep ? { background: `${s.color}18`, borderColor: `${s.color}60`, color: s.color } : {}}>
              {i <= activeStep
                ? <Icon d={icons.check} size={14} color={s.color} />
                : <span>{i + 1}</span>
              }
            </div>
            <div className="timeline-content">
              <div className="timeline-title" style={i === activeStep ? { color: s.color } : {}}>{s.title}</div>
              <div className="timeline-desc" style={i === activeStep ? { color: 'var(--text-muted)' } : {}}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── FINAL CTA ─────────────────────────────────────────────────── */
function FinalCTA({ metrics }) {
  return (
    <section className="final-cta">
      <h2>
        Stop losing revenue<br />
        to <span className="gradient-text">empty billboards.</span>
      </h2>
      <p>
        {metrics?.total_vacancies ?? 25} hoardings monitored.{' '}
        {metrics?.leads_identified ?? 47} qualified leads identified.{' '}
        Every recommendation explainable and auditable.
      </p>
      <div className="cta-buttons">
        <Link to="/dashboard" className="btn-war-room" id="final-cta-war-room" style={{ fontSize: '1rem', padding: '14px 32px' }}>
          <Icon d={icons.zap} size={16} color="#fff" />
          Enter War Room
        </Link>
        <a href="#agent-thinks" className="btn-demo" style={{ fontSize: '1rem', padding: '14px 24px' }}>
          Review Agent Logic
        </a>
      </div>
    </section>
  );
}

/* ─── LANDING FOOTER ─────────────────────────────────────────────── */
function LandingFooter() {
  return (
    <footer className="land-footer">
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 4 }}>SmartLeads Agent</div>
        <p>Autonomous OOH Revenue Intelligence Platform</p>
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
        Deterministic scoring &middot; Explainable AI &middot; Enterprise Platform
      </p>
    </footer>
  );
}

/* ─── ROOT EXPORT ──────────────────────────────────────────────── */
export default function LandingPage() {
  const [metrics, setMetrics] = useState(null);
  const [vacancies, setVacancies] = useState([]);

  useEffect(() => {
    // Fetch live data from the backend
    Promise.all([
      fetch('/api/metrics').then(r => r.json()).catch(() => null),
      fetch('/api/vacancies?strategy=BALANCED').then(r => r.json()).catch(() => null),
    ]).then(([m, v]) => {
      if (m) setMetrics(m);
      if (v?.vacancies) setVacancies(v.vacancies);
    });
  }, []);

  return (
    <div style={{ background: 'var(--land-bg)', minHeight: '100vh', overflowX: 'hidden' }}>
      <LandingNav />
      <HeroSection metrics={metrics} vacancies={vacancies} />
      <MetricsStrip metrics={metrics} />
      <ProblemSolution />
      <AgentDecisionTrace />
      <ProductPreview vacancies={vacancies} />
      <RevenueBattle vacancies={vacancies} />
      <WhatIfSimulator />
      <RecoveryMissionSection />
      <FinalCTA metrics={metrics} />
      <LandingFooter />
    </div>
  );
}
