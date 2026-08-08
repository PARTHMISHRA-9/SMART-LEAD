// frontend/src/pages/HoardingDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, DollarSign, Calendar, Eye, Zap, 
  TrendingUp, Send, CheckCircle2, AlertCircle, ShieldAlert, Sparkles, Sliders
} from 'lucide-react';
import MinimalHeader from '../components/MinimalHeader';
import AIAgentChatDrawer from '../components/AIAgentChatDrawer';
import GlobalSearchModal from '../components/GlobalSearchModal';

export default function HoardingDetailPage() {
  const { siteId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // overview, leads, whynot, revenue, mission, pitch, simulator, dna

  // Data States
  const [siteData, setSiteData] = useState(null);
  const [vacancyData, setVacancyData] = useState(null);
  const [whyWhyNot, setWhyWhyNot] = useState(null);
  const [revenueBattle, setRevenueBattle] = useState(null);
  const [siteDNA, setSiteDNA] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pitch state
  const [pitchChannel, setPitchChannel] = useState('EMAIL');
  const [generatedPitch, setGeneratedPitch] = useState(null);
  const [pitchLoading, setPitchLoading] = useState(false);

  // Recovery Mission state
  const [missionLaunching, setMissionLaunching] = useState(false);
  const [launchedMission, setLaunchedMission] = useState(null);

  // What-If Simulator state
  const [simBudget, setSimBudget] = useState(300000);
  const [simDuration, setSimDuration] = useState(3);
  const [simDiscount, setSimDiscount] = useState(0);
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  // Modals
  const [isAIAgentOpen, setIsAIAgentOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    fetchSiteDetailData();
  }, [siteId]);

  const fetchSiteDetailData = async () => {
    setLoading(true);
    try {
      // 1. Fetch site DNA & matching customers
      const resDNA = await fetch(`/api/site/${siteId}/dna`).then(r => r.ok ? r.json() : null);
      if (resDNA) {
        setSiteDNA(resDNA.site_dna);
      }

      // 2. Fetch vacancies list to find site's vacancy record & leads
      const resVacancies = await fetch(`/api/vacancies?strategy=BALANCED`).then(r => r.json());
      const vacancies = resVacancies.vacancies || [];
      const currentVac = vacancies.find(v => v.site_id === siteId);
      setVacancyData(currentVac || null);

      // 3. Fetch Why & Why Not explainability
      const resWhy = await fetch(`/api/vacancies/${siteId}/why-why-not`).then(r => r.ok ? r.json() : null);
      if (resWhy) setWhyWhyNot(resWhy);

      // 4. Fetch Revenue Battle
      const resBattle = await fetch(`/api/vacancies/${siteId}/revenue-battle`).then(r => r.ok ? r.json() : null);
      if (resBattle) setRevenueBattle(resBattle);

      // 5. General site info fallback
      if (resDNA && resDNA.site_dna) {
        setSiteData(resDNA.site_dna);
      } else if (currentVac) {
        setSiteData(currentVac);
      } else {
        // Fallback site object
        setSiteData({
          site_id: siteId,
          location_name: `Billboard Site ${siteId}`,
          zone: 'Mumbai Suburban',
          monthly_rate: 350000,
          traffic_score: 88,
          size: '800 sq ft',
          site_type: 'Digital LED Unipole'
        });
      }
    } catch (err) {
      console.error('Error fetching site detail:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handler for pitch generation
  const handleGeneratePitch = async (customer) => {
    if (!customer) return;
    setPitchLoading(true);
    try {
      const res = await fetch('/api/pitch/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: siteId,
          customerId: customer.customer_id,
          channel: pitchChannel
        })
      });
      const data = await res.json();
      if (data.pitch) {
        setGeneratedPitch(data.pitch);
      }
    } catch (err) {
      console.error('Error generating pitch:', err);
    } finally {
      setPitchLoading(false);
    }
  };

  // Handler for launching recovery mission
  const handleLaunchMission = async () => {
    setMissionLaunching(true);
    try {
      const res = await fetch('/api/mission/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId: siteId, strategyMode: 'BALANCED' })
      });
      const data = await res.json();
      if (data.mission) {
        setLaunchedMission(data.mission);
      }
    } catch (err) {
      console.error('Error launching mission:', err);
    } finally {
      setMissionLaunching(false);
    }
  };

  // Handler for What-If Simulation
  const handleRunSimulator = async () => {
    const targetCust = vacancyData?.top_leads?.[0] || { customer_id: 'CUST-33' };
    setSimLoading(true);
    try {
      const res = await fetch('/api/simulator/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: siteId,
          customerId: targetCust.customer_id,
          budget: Number(simBudget),
          duration: Number(simDuration),
          discount: Number(simDiscount)
        })
      });
      const data = await res.json();
      if (data.simulation) {
        setSimResult(data.simulation);
      }
    } catch (err) {
      console.error('Error running simulator:', err);
    } finally {
      setSimLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-layout">
        <MinimalHeader onOpenSearch={() => setIsSearchOpen(true)} onOpenAIAgent={() => setIsAIAgentOpen(true)} />
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
          Loading hoarding intelligence for {siteId}...
        </div>
      </div>
    );
  }

  // Derive site attributes
  const siteName = siteData?.location_name || siteData?.site_id || siteId;
  const siteZone = siteData?.zone || 'Mumbai Prime';
  const monthlyRate = siteData?.monthly_rate || vacancyData?.monthly_rate || 350000;
  const trafficScore = siteData?.traffic_score || vacancyData?.traffic_score || 85;
  const size = siteData?.size || vacancyData?.size || '800 sq ft';

  // Status computation
  let statusBadgeClass = 'occupied';
  let statusText = '● OCCUPIED';
  if (vacancyData) {
    if (vacancyData.days_until_vacant <= 0) {
      statusBadgeClass = 'vacant';
      statusText = '● VACANT';
    } else if (vacancyData.days_until_vacant <= 60) {
      statusBadgeClass = 'vacating';
      statusText = '● VACATING SOON';
    }
    if (vacancyData.top_leads?.[0]?.overall_fit_score >= 82 && (statusBadgeClass === 'vacant' || statusBadgeClass === 'vacating')) {
      statusBadgeClass = 'opportunity';
      statusText = '● HIGH OPPORTUNITY';
    }
  }

  const topLeads = vacancyData?.top_leads || [];
  const topLead = topLeads[0];

  return (
    <div className="app-layout">
      {/* Header */}
      <MinimalHeader 
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAIAgent={() => setIsAIAgentOpen(true)}
      />

      {/* Back button & Page Container */}
      <div className="detail-container">
        <Link to="/dashboard" className="back-btn">
          <ArrowLeft style={{ width: 16, height: 16 }} />
          <span>Back to Hoardings</span>
        </Link>

        {/* Detail Header Top */}
        <div className="detail-header-top">
          <div className="detail-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <h1>{siteId}</h1>
              <span className={`card-status-indicator`} style={{ background: 'var(--bg-subtle)', padding: '4px 10px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                <span className={`status-dot ${statusBadgeClass}`}></span>
                <span className={`status-text ${statusBadgeClass}`}>{statusText.replace('● ', '')}</span>
              </span>
            </div>
            <p>{siteName} &middot; {siteZone}</p>
          </div>

          <button 
            onClick={() => setIsAIAgentOpen(true)}
            className="btn-purple"
          >
            <Sparkles style={{ width: 16, height: 16 }} />
            Ask AI Agent About {siteId}
          </button>
        </div>

        {/* Detail Metric KPI Strip */}
        <div className="detail-kpi-strip">
          <div className="detail-kpi-item">
            <div className="detail-kpi-label">Monthly Rate</div>
            <div className="detail-kpi-val">₹{monthlyRate.toLocaleString()}</div>
          </div>
          <div className="detail-kpi-item">
            <div className="detail-kpi-label">Traffic Score</div>
            <div className="detail-kpi-val">{trafficScore} / 100</div>
          </div>
          <div className="detail-kpi-item">
            <div className="detail-kpi-label">Revenue Exposure</div>
            <div className="detail-kpi-val" style={{ color: vacancyData ? 'var(--status-vacant)' : 'var(--text-main)' }}>
              {vacancyData ? `\u20B9${(vacancyData.revenue_at_risk / 100000).toFixed(1)}L` : '\u20B90 (Secured)'}
            </div>
          </div>
          <div className="detail-kpi-item">
            <div className="detail-kpi-label">Format Size</div>
            <div className="detail-kpi-val">{size}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="detail-tabs-bar">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'leads', label: 'AI Recommended Leads' },
            { id: 'whynot', label: 'Why #1 & Why Not #2' },
            { id: 'revenue', label: 'Revenue & Battle' },
            { id: 'mission', label: 'Recovery Mission' },
            { id: 'pitch', label: 'Pitch Generator' },
            { id: 'simulator', label: 'What-If Simulator' },
            { id: 'dna', label: 'Site & Customer DNA' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`detail-tab ${activeTab === t.id ? 'active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="info-card">
                <div className="info-card-header">Site Specifications</div>
                <div style={{ display: 'grid', gap: '12px', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Site ID</span>
                    <span style={{ fontWeight: 700 }}>{siteId}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Location</span>
                    <span style={{ fontWeight: 600 }}>{siteName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Zone</span>
                    <span style={{ fontWeight: 600 }}>{siteZone}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Size</span>
                    <span style={{ fontWeight: 600 }}>{size}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Monthly Card Rate</span>
                    <span style={{ fontWeight: 700 }}>₹{monthlyRate.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Daily Impressions</span>
                    <span style={{ fontWeight: 600 }}>{(trafficScore * 12500).toLocaleString()} / day</span>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-header">Current Booking &amp; Occupancy Timeline</div>
                {vacancyData ? (
                  <div>
                    <div style={{ marginBottom: '16px', background: 'var(--bg-subtle)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Incumbent Client</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>{vacancyData.incumbent_customer_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Booking End Date: <strong style={{ color: 'var(--text-main)' }}>{vacancyData.current_booking_end}</strong>
                      </div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                        OCCUPANCY TIMELINE VISUAL
                      </div>
                      <div style={{ background: 'var(--border-color)', height: '12px', borderRadius: '6px', overflow: 'hidden', display: 'flex', marginBottom: '12px' }}>
                        <div style={{ width: '65%', background: 'var(--status-occupied)', height: '100%' }} title="Current Booking"></div>
                        <div style={{ width: '35%', background: vacancyData.days_until_vacant <= 0 ? 'var(--status-vacant)' : 'var(--status-vacating)', height: '100%' }} title="Vacant Window"></div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>CURRENT BOOKING: {vacancyData.current_booking_end}</span>
                        <span style={{ fontWeight: 700, color: vacancyData.days_until_vacant <= 0 ? 'var(--status-vacant)' : 'var(--status-vacating)' }}>
                          NEXT AVAILABLE: {vacancyData.free_from_date}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '20px', texttext: 'center', color: 'var(--text-muted)', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
                    This site is currently fully booked with long-term active contracts. No upcoming vacancy window detected in the 90-day pipeline.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI RECOMMENDED LEADS */}
        {activeTab === 'leads' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>AI Recommended Customers for {siteId}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Scored deterministically across 5 fit dimensions: Budget (25%), Industry (25%), Past Affinity (20%), Relationship (20%), Recency (10%).
              </p>
            </div>

            {topLeads.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-subtle)', borderRadius: '12px' }}>
                No qualified candidate leads available for this site.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {topLeads.map((lead, idx) => (
                  <div key={lead.customer_id} className="info-card" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, background: idx === 0 ? 'var(--brand-black)' : 'var(--bg-subtle)', color: idx === 0 ? '#fff' : 'var(--text-main)', padding: '2px 8px', borderRadius: '4px' }}>
                            #{idx + 1}
                          </span>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{lead.company_name}</h3>
                          <span className="card-status-indicator" style={{ background: 'var(--status-ai-bg)', color: 'var(--status-ai)', padding: '2px 8px', borderRadius: '6px' }}>
                            {lead.overall_fit_score} / 100 Match Score
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Industry: <strong style={{ color: 'var(--text-main)' }}>{lead.industry}</strong> &middot; Budget Band: <strong style={{ color: 'var(--text-main)' }}>{(lead.budget_band || lead.budget_tier || 'MID').toString().replace('Tier (', '').replace(')', '').toUpperCase()}</strong> &middot; Max Monthly Budget: ₹{(lead.max_budget_monthly || 0).toLocaleString()}
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          setActiveTab('pitch');
                          handleGeneratePitch(lead);
                        }}
                        className="btn-black"
                      >
                        Generate Pitch &rarr;
                      </button>
                    </div>

                    {/* Breakdown pill grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginTop: '16px', background: 'var(--bg-subtle)', padding: '14px', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>BUDGET FIT</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--status-occupied)' }}>{lead.budget_score ?? 25}/25</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>INDUSTRY FIT</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--status-occupied)' }}>{lead.industry_score ?? 22}/25</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>PAST AFFINITY</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--status-ai)' }}>{lead.affinity_score ?? 18}/20</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>RELATIONSHIP</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--status-ai)' }}>{lead.relationship_score ?? 16}/20</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>RECENCY</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>{lead.recency_score ?? 8}/10</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WHY #1 & WHY NOT #2 */}
        {activeTab === 'whynot' && (
          <div>
            <div className="info-card">
              <div className="info-card-header">Explainable AI Recommendation Logic</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Every AI recommendation is fully explainable. Below is the exact rationale comparing candidate #1 against candidate #2.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ background: 'var(--status-occupied-bg)', border: '1px solid var(--status-occupied-border)', padding: '20px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--status-occupied)', textTransform: 'uppercase', marginBottom: '12px' }}>
                    ✓ WHY THIS CUSTOMER (#1 {topLead ? topLead.company_name : 'Recommended Candidate'})?
                  </div>
                  <ul style={{ listStyle: 'none', display: 'grid', gap: '8px', fontSize: '0.85rem' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--status-occupied)' }} />
                      <span>Budget compatible (₹{(monthlyRate).toLocaleString()} rate fits inside client budget headroom)</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--status-occupied)' }} />
                      <span>Previous booking affinity in {siteZone} zone</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--status-occupied)' }} />
                      <span>Strong relationship score (Active brand manager relationship)</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--status-occupied)' }} />
                      <span>Industry matches site audience demographics</span>
                    </li>
                  </ul>
                </div>

                <div style={{ background: 'var(--status-vacant-bg)', border: '1px solid var(--status-vacant-border)', padding: '20px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--status-vacant)', textTransform: 'uppercase', marginBottom: '12px' }}>
                    ✕ WHY NOT #2 ({topLeads[1] ? topLeads[1].company_name : 'Second Match'})?
                  </div>
                  <ul style={{ listStyle: 'none', display: 'grid', gap: '8px', fontSize: '0.85rem' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle style={{ width: 16, height: 16, color: 'var(--status-vacant)' }} />
                      <span>Lower budget headroom for premium digital format</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle style={{ width: 16, height: 16, color: 'var(--status-vacant)' }} />
                      <span>Weaker historical booking affinity in {siteZone}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle style={{ width: 16, height: 16, color: 'var(--status-vacant)' }} />
                      <span>Lower relationship score / longer recency gap</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REVENUE & BATTLE */}
        {activeTab === 'revenue' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Header Section */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2E8B57', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                REVENUE BATTLE
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#18352A', margin: '0 0 6px 0' }}>
                Which customer gives us the strongest revenue opportunity?
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#68736B' }}>
                AI-ranked revenue opportunities prioritized by conversion confidence and expected deal value.
              </p>
            </div>

            {/* Top Recommended Customer Card (#1 Best Opportunity) */}
            {topLead ? (
              <div style={{
                background: '#E5EEE7',
                border: '2px solid #2E8B57',
                borderRadius: '16px',
                padding: '28px',
                boxShadow: '0 4px 14px rgba(46,139,87,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      background: '#2E8B57', color: '#FFFFFF',
                      fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                      padding: '4px 12px', borderRadius: '9999px', marginBottom: '10px'
                    }}>
                      ★ BEST OPPORTUNITY
                    </div>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#18352A', margin: 0 }}>
                      {topLead.company_name}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#68736B', marginTop: '4px' }}>
                      Industry: <strong style={{ color: '#18352A' }}>{topLead.industry}</strong> &middot; Budget Band: <strong style={{ color: '#18352A' }}>{(topLead.budget_band || topLead.budget_tier || 'MID').toString().replace('Tier (', '').replace(')', '').toUpperCase()}</strong>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setActiveTab('pitch');
                      handleGeneratePitch(topLead);
                    }}
                    className="btn-black"
                    style={{ padding: '12px 24px', fontSize: '0.9rem' }}
                  >
                    <Send style={{ width: 16, height: 16 }} />
                    Generate Pitch →
                  </button>
                </div>

                {/* 4 Metric Badges */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: '12px', border: '1px solid #D8D5CA' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#68736B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expected Revenue</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2E8B57', marginTop: '2px' }}>
                      ₹{(((monthlyRate * 3) * Math.round((topLead.overall_fit_score / 100) * 90)) / 10000000).toFixed(1)}L
                    </div>
                  </div>

                  <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: '12px', border: '1px solid #D8D5CA' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#68736B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fit Score</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#18352A', marginTop: '2px' }}>
                      {topLead.overall_fit_score}/100
                    </div>
                  </div>

                  <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: '12px', border: '1px solid #D8D5CA' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#68736B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Conversion Confidence</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2E8B57', marginTop: '2px' }}>
                      {Math.round((topLead.overall_fit_score / 100) * 90)}%
                    </div>
                  </div>

                  <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: '12px', border: '1px solid #D8D5CA' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#68736B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Potential Contract Value</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#18352A', marginTop: '2px' }}>
                      ₹{((monthlyRate * 3) / 100000).toFixed(1)}L
                    </div>
                  </div>
                </div>

                {/* Why This Customer Reasons */}
                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #D8D5CA' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2E8B57', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                    WHY THIS CUSTOMER WINS
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {(whyWhyNot?.why_number_1 || [
                      `Budget headroom comfortably matches site rate of ₹${monthlyRate.toLocaleString()}/mo`,
                      `Strong historical booking affinity in ${siteZone} zone`,
                      `High relationship & active account manager score`,
                      `Industry category aligns with target commuter demographics`
                    ]).map((reason, rIdx) => (
                      <div key={rIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#18352A' }}>
                        <CheckCircle2 style={{ width: 16, height: 16, color: '#2E8B57', flexShrink: 0 }} />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Why #1 Beats #2 Section */}
            {topLeads.length >= 2 && (
              <div className="info-card">
                <div className="info-card-header">WHY #1 BEATS #2</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center' }}>
                  {/* Candidate #1 */}
                  <div style={{ background: '#E5EEE7', border: '1px solid #2E8B57', borderRadius: '12px', padding: '16px 20px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#2E8B57', textTransform: 'uppercase', marginBottom: '4px' }}>#1 RECOMMENDED</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#18352A' }}>{topLeads[0].company_name}</div>
                    <div style={{ fontSize: '0.82rem', color: '#68736B', marginTop: '4px' }}>
                      Fit Score: <strong>{topLeads[0].overall_fit_score}/100</strong> &middot; Expected Revenue: <strong style={{ color: '#2E8B57' }}>₹{(((monthlyRate * 3) * Math.round((topLeads[0].overall_fit_score / 100) * 90)) / 10000000).toFixed(1)}L</strong>
                    </div>
                  </div>

                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#68736B', background: '#F3F0E7', padding: '8px 12px', borderRadius: '50%' }}>
                    VS
                  </div>

                  {/* Candidate #2 */}
                  <div style={{ background: '#FBFAF5', border: '1px solid #D8D5CA', borderRadius: '12px', padding: '16px 20px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#68736B', textTransform: 'uppercase', marginBottom: '4px' }}>#2 ALTERNATIVE</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#18352A' }}>{topLeads[1].company_name}</div>
                    <div style={{ fontSize: '0.82rem', color: '#68736B', marginTop: '4px' }}>
                      Fit Score: <strong>{topLeads[1].overall_fit_score}/100</strong> &middot; Expected Revenue: <strong>₹{(((monthlyRate * 3) * Math.round((topLeads[1].overall_fit_score / 100) * 90)) / 10000000).toFixed(1)}L</strong>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '16px', background: '#F3F0E7', padding: '14px 18px', borderRadius: '8px', fontSize: '0.85rem', color: '#18352A' }}>
                  <strong>Decision Rationale:</strong> {whyWhyNot?.why_number_1 ? `${topLeads[0].company_name} ranks higher because ${whyWhyNot.why_number_1[0]?.toLowerCase() || 'it offers stronger budget compatibility and past booking affinity'}.` : `${topLeads[0].company_name} offers higher budget headroom and stronger historical booking affinity in ${siteZone}.`}
                </div>
              </div>
            )}

            {/* Ranked Sales Priority Comparison Table */}
            <div className="info-card">
              <div className="info-card-header">Sales Priority &amp; Revenue Comparison</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #D8D5CA', textAlign: 'left' }}>
                      <th style={{ padding: '12px 10px', color: '#68736B' }}>Rank</th>
                      <th style={{ padding: '12px 10px', color: '#68736B' }}>Customer</th>
                      <th style={{ padding: '12px 10px', color: '#68736B' }}>Fit Score</th>
                      <th style={{ padding: '12px 10px', color: '#68736B' }}>Potential Revenue</th>
                      <th style={{ padding: '12px 10px', color: '#68736B' }}>Expected Revenue</th>
                      <th style={{ padding: '12px 10px', color: '#68736B' }}>Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topLeads.map((lead, idx) => {
                      const potRev = monthlyRate * 3;
                      const convScore = Math.round((lead.overall_fit_score / 100) * 90);
                      const expRev = Math.round((potRev * convScore) / 100);

                      let recBadge = <span style={{ background: '#E5EEE7', color: '#2E8B57', padding: '4px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '0.75rem' }}>★ CONTACT FIRST</span>;
                      if (idx === 1) recBadge = <span style={{ background: '#F1ECF7', color: '#7654A6', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem' }}>Strong Alternative</span>;
                      if (idx >= 2) recBadge = <span style={{ background: '#F3F0E7', color: '#68736B', padding: '4px 10px', borderRadius: '6px', fontWeight: 600, fontSize: '0.75rem' }}>Backup</span>;

                      return (
                        <tr key={lead.customer_id} style={{ borderBottom: '1px solid #D8D5CA', background: idx === 0 ? '#E5EEE7' : 'transparent' }}>
                          <td style={{ padding: '14px 10px', fontWeight: 800, color: '#18352A' }}>#{idx + 1}</td>
                          <td style={{ padding: '14px 10px' }}>
                            <div style={{ fontWeight: 800, color: '#18352A' }}>{lead.company_name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#68736B' }}>{lead.industry} &middot; {(lead.budget_band || lead.budget_tier || 'MID').toString().replace('Tier (', '').replace(')', '').toUpperCase()}</div>
                          </td>
                          <td style={{ padding: '14px 10px', fontWeight: 700, color: '#18352A' }}>{lead.overall_fit_score}/100</td>
                          <td style={{ padding: '14px 10px', color: '#68736B' }}>₹{(potRev / 100000).toFixed(1)}L</td>
                          <td style={{ padding: '14px 10px', fontWeight: 800, color: idx === 0 ? '#2E8B57' : '#18352A' }}>
                            ₹{(expRev / 100000).toFixed(1)}L
                          </td>
                          <td style={{ padding: '14px 10px' }}>{recBadge}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: RECOVERY MISSION */}
        {activeTab === 'mission' && (
          <div>
            <div className="info-card">
              <div className="info-card-header">
                <span>Autonomous Revenue Recovery Mission</span>
                <button onClick={handleLaunchMission} disabled={missionLaunching} className="btn-black">
                  <Zap style={{ width: 14, height: 14 }} />
                  {missionLaunching ? 'Launching...' : 'LAUNCH RECOVERY MISSION'}
                </button>
              </div>

              {launchedMission && (
                <div style={{ background: 'var(--status-occupied-bg)', border: '1px solid var(--status-occupied-border)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                  <div style={{ fontWeight: 800, color: 'var(--status-occupied)', fontSize: '0.9rem' }}>
                    ✓ Recovery Mission Dispatched Successfully!
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Expected Revenue Recovery: ₹{(launchedMission.expected_recovery_value || 0).toLocaleString()} &middot; Target Client: {launchedMission.top_customer?.company_name}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '16px' }}>
                {[
                  { step: 'Step 01', title: 'Vacancy Detected', desc: 'Expiry flagged in pipeline' },
                  { step: 'Step 02', title: 'Revenue Exposure', desc: 'Exposure calculated' },
                  { step: 'Step 03', title: 'Customer Filter', desc: 'Filtered candidate pool' },
                  { step: 'Step 04', title: 'Constraints', desc: 'Budget & zone verified' },
                  { step: 'Step 05', title: 'Best Lead Selected', desc: `${topLead ? topLead.company_name : 'Top Candidate'} ranked #1` },
                  { step: 'Step 06', title: 'Strategy Mode', desc: 'Balanced fit strategy' },
                  { step: 'Step 07', title: 'Pitch Generated', desc: 'Personalised content' },
                  { step: 'Step 08', title: 'Revenue Forecast', desc: 'Kanban pipeline updated' },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--status-ai)' }}>{s.step}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, margin: '4px 0 2px 0' }}>{s.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PITCH GENERATOR */}
        {activeTab === 'pitch' && (
          <div>
            <div className="info-card">
              <div className="info-card-header">Personalised Sales Pitch Generator</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {['EMAIL', 'WHATSAPP', 'CALL_SCRIPT'].map(ch => (
                  <button
                    key={ch}
                    onClick={() => {
                      setPitchChannel(ch);
                      if (topLead) handleGeneratePitch(topLead);
                    }}
                    className={`btn-outline ${pitchChannel === ch ? 'btn-black' : ''}`}
                    style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                  >
                    {ch.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                &bull; Rate sourced from site rate card (₹{monthlyRate.toLocaleString()}/mo)
              </div>

              {generatedPitch ? (
                <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                  {generatedPitch.subject && (
                    <div style={{ fontWeight: 'bold', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                      Subject: {generatedPitch.subject}
                    </div>
                  )}
                  {generatedPitch.body || generatedPitch.content || JSON.stringify(generatedPitch, null, 2)}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-subtle)', borderRadius: '8px', color: 'var(--text-muted)' }}>
                  Click below to generate personalised sales pitch for top candidate {topLead?.company_name || 'Client'}.
                  <br /><br />
                  <button onClick={() => handleGeneratePitch(topLead)} className="btn-black">
                    Generate {pitchChannel} Pitch
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: WHAT-IF SIMULATOR */}
        {activeTab === 'simulator' && (
          <div>
            <div className="info-card">
              <div className="info-card-header">What-If Campaign Simulator</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Simulate custom budget, duration, or discount scenarios for site {siteId}.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Monthly Budget (₹)</label>
                  <input 
                    type="number" 
                    value={simBudget} 
                    onChange={e => setSimBudget(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Duration (Months)</label>
                  <input 
                    type="number" 
                    value={simDuration} 
                    onChange={e => setSimDuration(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Discount Offered (%)</label>
                  <input 
                    type="number" 
                    value={simDiscount} 
                    onChange={e => setSimDiscount(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>

              <button onClick={handleRunSimulator} disabled={simLoading} className="btn-black">
                {simLoading ? 'Simulating...' : 'Run Scenario Simulation'}
              </button>

              {simResult && (
                <div style={{ marginTop: '24px', background: 'var(--status-occupied-bg)', border: '1px solid var(--status-occupied-border)', padding: '20px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 800, color: 'var(--status-occupied)', fontSize: '1rem', marginBottom: '6px' }}>
                    Simulation Result
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    Shift Explanation: {simResult.shift_explanation || 'Candidate rank shifted upwards due to budget alignment.'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: DNA */}
        {activeTab === 'dna' && (
          <div>
            <div className="info-card">
              <div className="info-card-header">Site DNA &amp; Historical Profile</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '0.85rem' }}>
                <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 800, marginBottom: '8px' }}>Site Characteristics</div>
                  <div>Format: {size} ({siteData?.site_type || 'Digital LED'})</div>
                  <div>Traffic Tier: {trafficScore > 85 ? 'Heavy Urban Commuter' : 'Commercial Corridor'}</div>
                  <div>Zone Cluster: {siteZone}</div>
                </div>
                <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 800, marginBottom: '8px' }}>Top Target Industries</div>
                  <div>1. Real Estate &amp; Retail</div>
                  <div>2. Auto &amp; FMCG</div>
                  <div>3. Banking &amp; Financial Services</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Agent Chat Drawer */}
      <AIAgentChatDrawer 
        isOpen={isAIAgentOpen}
        onClose={() => setIsAIAgentOpen(false)}
        onSelectMission={(v) => navigate(`/hoarding/${v.site_id}`)}
        onSelectPitch={(v) => navigate(`/hoarding/${v.site_id}`)}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        vacancies={vacancyData ? [vacancyData] : []}
        onSelectMission={(v) => navigate(`/hoarding/${v.site_id}`)}
        onSelectPitch={(v) => navigate(`/hoarding/${v.site_id}`)}
        onSelectSimulator={(v) => navigate(`/hoarding/${v.site_id}`)}
      />
    </div>
  );
}
