// frontend/src/pages/DashboardOverview.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import MinimalHeader from '../components/MinimalHeader';
import AIAgentChatDrawer from '../components/AIAgentChatDrawer';
import GlobalSearchModal from '../components/GlobalSearchModal';

export default function DashboardOverview() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [vacancies, setVacancies] = useState([]);
  const [allHoardings, setAllHoardings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAIAgentOpen, setIsAIAgentOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resMetrics, resVacancies, resTimeline] = await Promise.all([
        fetch('/api/metrics').then(r => r.json()),
        fetch('/api/vacancies?strategy=BALANCED').then(r => r.json()),
        fetch('/api/timeline').then(r => r.json())
      ]);

      setMetrics(resMetrics);
      const vacList = resVacancies.vacancies || [];
      setVacancies(vacList);

      // Process complete hoarding list from timeline or vacancies
      const timelineSites = resTimeline.sites || [];
      const vacMap = new Map(vacList.map(v => [v.site_id, v]));

      const processedHoardings = timelineSites.map(site => {
        const vacObj = vacMap.get(site.site_id);
        let status = 'OCCUPIED';
        let daysUntilVacant = site.days_until_vacant ?? 999;

        if (vacObj) {
          if (vacObj.days_until_vacant <= 0) {
            status = 'VACANT';
          } else if (vacObj.days_until_vacant <= 60) {
            status = 'VACATING_SOON';
          } else {
            status = 'OCCUPIED';
          }
          // High opportunity flag if top lead match score >= 82
          if (vacObj.top_leads && vacObj.top_leads[0] && vacObj.top_leads[0].overall_fit_score >= 82) {
            if (status === 'VACANT' || status === 'VACATING_SOON') {
              status = 'HIGH_OPPORTUNITY';
            }
          }
        }

        return {
          site_id: site.site_id,
          location_name: site.location_name,
          zone: site.zone,
          monthly_rate: site.monthly_rate,
          status: status,
          days_until_vacant: daysUntilVacant,
          vacancy_record: vacObj || null
        };
      });

      setAllHoardings(processedHoardings);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcut listener Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter & Search Logic
  const filteredHoardings = allHoardings.filter(h => {
    // Status Filter
    let statusMatch = true;
    if (activeFilter === 'OCCUPIED') statusMatch = h.status === 'OCCUPIED';
    if (activeFilter === 'VACANT') statusMatch = h.status === 'VACANT';
    if (activeFilter === 'VACATING_SOON') statusMatch = h.status === 'VACATING_SOON';
    if (activeFilter === 'HIGH_OPPORTUNITY') statusMatch = h.status === 'HIGH_OPPORTUNITY';

    // Search Query Filter
    const query = searchTerm.toLowerCase().trim();
    let searchMatch = true;
    if (query) {
      searchMatch = h.site_id.toLowerCase().includes(query) ||
                    h.location_name.toLowerCase().includes(query) ||
                    h.zone.toLowerCase().includes(query);
    }

    return statusMatch && searchMatch;
  });

  // Dynamic KPI counts
  const totalCount = allHoardings.length || 25;
  const occupiedCount = allHoardings.filter(h => h.status === 'OCCUPIED').length;
  const vacantCount = allHoardings.filter(h => h.status === 'VACANT').length;
  const vacatingSoonCount = allHoardings.filter(h => h.status === 'VACATING_SOON' || h.status === 'HIGH_OPPORTUNITY').length;

  return (
    <div className="app-layout">
      {/* Clean Minimal Header */}
      <MinimalHeader 
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAIAgent={() => setIsAIAgentOpen(true)}
      />

      {/* Dashboard Hero */}
      <div className="dashboard-hero">
        <h1 className="hero-title">Hoarding Intelligence</h1>
        <p className="hero-subtitle">Monitor your city-wide outdoor advertising inventory.</p>

        {/* 4 Compact Statistics */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{totalCount}</div>
            <div className="stat-label">TOTAL HOARDINGS</div>
            <div className="stat-subtext">{totalCount} sample sites · designed for 300-site scale</div>
          </div>

          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--status-occupied)' }}>
              {occupiedCount}
            </div>
            <div className="stat-label">OCCUPIED</div>
            <div className="stat-subtext">Active client bookings</div>
          </div>

          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--status-vacant)' }}>
              {vacantCount}
            </div>
            <div className="stat-label">VACANT</div>
            <div className="stat-subtext">Immediate revenue risk</div>
          </div>

          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--status-vacating)' }}>
              {vacatingSoonCount}
            </div>
            <div className="stat-label">VACATING SOON</div>
            <div className="stat-subtext">Expiring in &le; 60 days</div>
          </div>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="filter-bar">
        <div className="filter-tabs">
          {[
            { id: 'ALL', label: 'ALL' },
            { id: 'OCCUPIED', label: 'OCCUPIED' },
            { id: 'VACANT', label: 'VACANT' },
            { id: 'VACATING_SOON', label: 'VACATING SOON' },
            { id: 'HIGH_OPPORTUNITY', label: 'HIGH OPPORTUNITY' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`filter-tab ${activeFilter === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="search-input-box">
          <Search style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Search site, location or zone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Clean Hoarding Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading inventory status...
        </div>
      ) : filteredHoardings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          No hoardings match the selected filter.
        </div>
      ) : (
        <div className="hoarding-grid">
          {filteredHoardings.map(hoarding => {
            // Render Status Indicator
            let statusDotClass = 'occupied';
            let statusLabel = '● OCCUPIED';
            
            if (hoarding.status === 'VACANT') {
              statusDotClass = 'vacant';
              statusLabel = '● VACANT';
            } else if (hoarding.status === 'VACATING_SOON') {
              statusDotClass = 'vacating';
              statusLabel = '● VACATING SOON';
            } else if (hoarding.status === 'HIGH_OPPORTUNITY') {
              statusDotClass = 'opportunity';
              statusLabel = '● HIGH OPPORTUNITY';
            }

            return (
              <div 
                key={hoarding.site_id} 
                className="hoarding-card"
                onClick={() => navigate(`/hoarding/${hoarding.site_id}`)}
              >
                <div>
                  <div className="card-site-id">{hoarding.site_id}</div>
                  <div className="card-location">{hoarding.location_name}</div>
                  <div className="card-zone">{hoarding.zone}</div>
                </div>

                <div>
                  <div className="card-status-indicator" style={{ marginBottom: '14px' }}>
                    <span className={`status-dot ${statusDotClass}`}></span>
                    <span className={`status-text ${statusDotClass}`}>
                      {statusLabel.replace('● ', '')}
                    </span>
                  </div>

                  <div className="card-action-link">
                    <span>View Hoarding</span>
                    <ArrowRight style={{ width: 14, height: 14 }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
        vacancies={vacancies}
        onSelectMission={(v) => navigate(`/hoarding/${v.site_id}`)}
        onSelectPitch={(v) => navigate(`/hoarding/${v.site_id}`)}
        onSelectSimulator={(v) => navigate(`/hoarding/${v.site_id}`)}
      />
    </div>
  );
}
