// frontend/src/pages/TimelineViewPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MinimalHeader from '../components/MinimalHeader';
import AIAgentChatDrawer from '../components/AIAgentChatDrawer';
import GlobalSearchModal from '../components/GlobalSearchModal';

export default function TimelineViewPage() {
  const navigate = useNavigate();

  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAIAgentOpen, setIsAIAgentOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    fetchTimelineData();
  }, []);

  const fetchTimelineData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/timeline');
      const data = await res.json();
      setTimelineData(data.sites || []);
    } catch (err) {
      console.error('Error fetching timeline data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Header */}
      <MinimalHeader 
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAIAgent={() => setIsAIAgentOpen(true)}
      />

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>90-Day Vacancy Timeline</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Visual schedule of active contracts and upcoming vacancy windows. Click any site to open intelligence detail.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          Loading 90-day contract timeline...
        </div>
      ) : (
        <div className="info-card">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '12px', minWidth: '120px' }}>Site ID</th>
                  <th style={{ padding: '12px', minWidth: '200px' }}>Location</th>
                  <th style={{ padding: '12px', minWidth: '120px' }}>Current Status</th>
                  <th style={{ padding: '12px', minWidth: '340px' }}>90-Day Contract &amp; Vacancy Schedule</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {timelineData.map(site => {
                  const isVacant = site.is_vacant_in_90d && site.days_until_vacant <= 0;
                  const isVacatingSoon = site.is_vacant_in_90d && site.days_until_vacant > 0;

                  return (
                    <tr 
                      key={site.site_id}
                      style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
                      onClick={() => navigate(`/hoarding/${site.site_id}`)}
                    >
                      <td style={{ padding: '14px 12px', fontWeight: 800 }}>{site.site_id}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ fontWeight: 600 }}>{site.location_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{site.zone}</div>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <span className="card-status-indicator">
                          <span className={`status-dot ${isVacant ? 'vacant' : isVacatingSoon ? 'vacating' : 'occupied'}`}></span>
                          <span className={`status-text ${isVacant ? 'vacant' : isVacatingSoon ? 'vacating' : 'occupied'}`}>
                            {isVacant ? 'VACANT' : isVacatingSoon ? 'VACATING SOON' : 'OCCUPIED'}
                          </span>
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ background: 'var(--bg-subtle)', height: '24px', borderRadius: '6px', overflow: 'hidden', display: 'flex', border: '1px solid var(--border-color)' }}>
                          {isVacant ? (
                            <div style={{ width: '100%', background: 'var(--status-vacant-bg)', color: 'var(--status-vacant)', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              VACANT NOW &middot; Free From {site.free_from_date || 'Immediate'}
                            </div>
                          ) : isVacatingSoon ? (
                            <>
                              <div style={{ width: '65%', background: 'var(--status-occupied-bg)', color: 'var(--status-occupied)', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', paddingLeft: '8px' }}>
                                Active Contract
                              </div>
                              <div style={{ width: '35%', background: 'var(--status-vacating-bg)', color: 'var(--status-vacating)', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                Free {site.free_from_date}
                              </div>
                            </>
                          ) : (
                            <div style={{ width: '100%', background: 'var(--status-occupied-bg)', color: 'var(--status-occupied)', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', paddingLeft: '12px' }}>
                              Booked &middot; Contract Secured
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                        <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                          View Hoarding &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
        vacancies={[]}
        onSelectMission={(v) => navigate(`/hoarding/${v.site_id}`)}
        onSelectPitch={(v) => navigate(`/hoarding/${v.site_id}`)}
        onSelectSimulator={(v) => navigate(`/hoarding/${v.site_id}`)}
      />
    </div>
  );
}
