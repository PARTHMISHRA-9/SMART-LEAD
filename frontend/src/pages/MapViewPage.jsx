// frontend/src/pages/MapViewPage.jsx
// Uses /api/hoardings which returns real latitude/longitude directly from hoardings.csv.
// No fallback coordinates. No index-based offsets. Uses Leaflet fitBounds() for auto-zoom.

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import MinimalHeader from '../components/MinimalHeader';
import AIAgentChatDrawer from '../components/AIAgentChatDrawer';
import GlobalSearchModal from '../components/GlobalSearchModal';

/* ─── Marker Icon Factory ─────────────────────────────────────── */
const createMarker = (color, label) => L.divIcon({
  className: '',
  html: `<div style="
    width:32px;height:32px;border-radius:50%;
    background:${color};border:2.5px solid #fff;
    box-shadow:0 2px 8px rgba(0,0,0,0.25);
    display:flex;align-items:center;justify-content:center;
    color:#fff;font-weight:800;font-size:10px;
    font-family:'Manrope',sans-serif;
  ">${label}</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -18],
});

const icons = {
  OCCUPIED:        createMarker('#2E8B57', 'OCC'),
  VACANT:          createMarker('#C94040', 'VAC'),
  VACATING_SOON:   createMarker('#D79527', 'VAC'),
  HIGH_OPPORTUNITY:createMarker('#7654A6', 'AI'),
};

const statusMeta = {
  OCCUPIED:         { label: 'Occupied',         color: '#2E8B57', dot: '#2E8B57' },
  VACANT:           { label: 'Vacant',            color: '#C94040', dot: '#C94040' },
  VACATING_SOON:    { label: 'Vacating Soon',     color: '#D79527', dot: '#D79527' },
  HIGH_OPPORTUNITY: { label: 'High Opportunity',  color: '#7654A6', dot: '#7654A6' },
};

/* ─── FitBounds Component ─────────────────────────────────────── */
// Automatically adjusts the map viewport to fit all visible markers.
function FitBoundsToMarkers({ markers }) {
  const map = useMap();
  useEffect(() => {
    if (!markers || markers.length === 0) return;
    const valid = markers.filter(m => m.latitude && m.longitude);
    if (valid.length === 0) return;
    const bounds = L.latLngBounds(valid.map(m => [m.latitude, m.longitude]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
  }, [markers, map]);
  return null;
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function MapViewPage() {
  const navigate = useNavigate();

  const [allSites, setAllSites]       = useState([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery]   = useState('');
  const [loading, setLoading]           = useState(true);
  const [validationStats, setValidationStats] = useState(null);

  const [isAIAgentOpen, setIsAIAgentOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen]   = useState(false);

  useEffect(() => { fetchMapData(); }, []);

  const fetchMapData = async () => {
    setLoading(true);
    try {
      // Use /api/hoardings — the only endpoint that includes real lat/lng from hoardings.csv
      const res = await fetch('/api/hoardings');
      const data = await res.json();

      setValidationStats({
        total:              data.total,
        valid_coordinates:  data.valid_coordinates,
        invalid_coordinates: data.invalid_coordinates,
        duplicate_coordinates: data.duplicate_coordinates,
      });

      // Fetch vacancies to apply HIGH_OPPORTUNITY override
      const vacRes = await fetch('/api/vacancies?strategy=BALANCED');
      const vacData = await vacRes.json();
      const highOppSet = new Set(
        (vacData.vacancies || [])
          .filter(v => v.top_leads?.[0]?.overall_fit_score >= 82 && v.days_until_vacant <= 60)
          .map(v => v.site_id)
      );

      const sites = (data.sites || []).map(site => ({
        ...site,
        status: highOppSet.has(site.site_id) && site.status !== 'OCCUPIED'
          ? 'HIGH_OPPORTUNITY'
          : site.status,
      }));

      setAllSites(sites);
    } catch (err) {
      console.error('[MapViewPage] Error fetching map data:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ── Filtering & Search ─────────────────────────────────────── */
  const filteredSites = allSites.filter(site => {
    // Status filter
    if (activeFilter !== 'ALL' && site.status !== activeFilter) return false;

    // Search: site_id, location_name, zone, pincode
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchSiteId   = site.site_id.toLowerCase().includes(q);
      const matchLocation = (site.location_name || '').toLowerCase().includes(q);
      const matchZone     = (site.zone || '').toLowerCase().includes(q);
      const matchPincode  = (site.pincode || '').includes(q);
      if (!matchSiteId && !matchLocation && !matchZone && !matchPincode) return false;
    }

    return true;
  });

  // Only render sites with validated coordinates
  const mappableSites = filteredSites.filter(s => s.coordinates_valid);
  const unavailableSites = filteredSites.filter(s => !s.coordinates_valid);

  /* ── Status counts for legend ─────────────────────────────────── */
  const statusCounts = allSites.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="app-layout">
      <MinimalHeader
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAIAgent={() => setIsAIAgentOpen(true)}
      />

      {/* Toolbar */}
      <div className="filter-bar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#18352A' }}>City Hoarding Map</h2>
            <span style={{ fontSize: '0.8rem', color: '#68736B' }}>
              {mappableSites.length} of {filteredSites.length} sites mapped · Mumbai & MMR
            </span>
            {validationStats && (
              <span style={{
                fontSize: '0.72rem', fontWeight: 600, padding: '3px 8px',
                background: validationStats.invalid_coordinates > 0 ? '#F9E9E7' : '#E5EEE7',
                color: validationStats.invalid_coordinates > 0 ? '#C94040' : '#2E8B57',
                borderRadius: 9999
              }}>
                {validationStats.invalid_coordinates > 0
                  ? `⚠ ${validationStats.invalid_coordinates} unavailable`
                  : `✓ All ${validationStats.valid_coordinates} coordinates verified`}
              </span>
            )}
          </div>

          {/* Search */}
          <div className="search-input-box" style={{ minWidth: 260 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#68736B" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search site, location, zone, pincode…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#68736B', fontSize: 14 }}>✕</button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'ALL',              label: `All (${allSites.length})` },
            { id: 'OCCUPIED',         label: `Occupied (${statusCounts.OCCUPIED || 0})` },
            { id: 'VACANT',           label: `Vacant (${statusCounts.VACANT || 0})` },
            { id: 'VACATING_SOON',    label: `Vacating Soon (${statusCounts.VACATING_SOON || 0})` },
            { id: 'HIGH_OPPORTUNITY', label: `High Opportunity (${statusCounts.HIGH_OPPORTUNITY || 0})` },
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
      </div>

      {/* Map */}
      <div style={{
        width: '100%', height: 620, borderRadius: 16,
        overflow: 'hidden', border: '1px solid #D8D5CA',
        boxShadow: '0 2px 8px rgba(24,53,42,0.06)', marginBottom: 20,
      }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#68736B', flexDirection: 'column', gap: 12, background: '#FBFAF5' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #D8D5CA', borderTopColor: '#18352A', animation: 'spin 0.8s linear infinite' }} />
            Loading site coordinates from hoardings.csv…
          </div>
        ) : (
          <MapContainer
            center={[19.1200, 72.8800]}
            zoom={11}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Auto-fit bounds to all visible valid markers */}
            <FitBoundsToMarkers markers={mappableSites} />

            {mappableSites.map(site => {
              const meta = statusMeta[site.status] || statusMeta.OCCUPIED;
              const icon = icons[site.status] || icons.OCCUPIED;

              return (
                <Marker
                  key={site.site_id}
                  position={[site.latitude, site.longitude]}
                  icon={icon}
                >
                  <Popup minWidth={230} maxWidth={260}>
                    <div style={{ fontFamily: "'Inter', sans-serif", padding: '4px 2px' }}>
                      {/* Site ID + Zone */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#18352A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          {site.site_id}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: '#68736B', fontWeight: 600 }}>{site.zone}</span>
                      </div>

                      {/* Location name */}
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#18352A', marginBottom: 2, lineHeight: 1.3 }}>
                        {site.location_name}
                      </div>

                      {/* City + Pincode */}
                      <div style={{ fontSize: '0.77rem', color: '#68736B', marginBottom: 10 }}>
                        {site.city}{site.pincode ? ` · PIN ${site.pincode}` : ''}
                      </div>

                      {/* Status badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: meta.dot, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: meta.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {meta.label}
                        </span>
                      </div>

                      {/* Rate */}
                      <div style={{ fontSize: '0.78rem', color: '#68736B', marginBottom: 12 }}>
                        Monthly Rate: <strong style={{ color: '#18352A' }}>₹{(site.monthly_rate || 0).toLocaleString()}/mo</strong>
                      </div>

                      {/* Revenue at risk (if vacant/vacating) */}
                      {site.revenue_at_risk > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#C94040', marginBottom: 10, padding: '6px 10px', background: '#F9E9E7', borderRadius: 6 }}>
                          Revenue at risk: <strong>₹{(site.revenue_at_risk / 100000).toFixed(1)}L</strong>
                          {site.days_until_vacant !== null && ` · ${Math.max(0, site.days_until_vacant)}d remaining`}
                        </div>
                      )}

                      {/* CTA */}
                      <button
                        onClick={() => navigate(`/hoarding/${site.site_id}`)}
                        style={{
                          width: '100%', background: '#18352A', color: '#FFFFFF',
                          border: 'none', padding: '9px 12px', borderRadius: 7,
                          fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                          fontFamily: "'Manrope', sans-serif",
                        }}
                        onMouseOver={e => e.target.style.background = '#285943'}
                        onMouseOut={e => e.target.style.background = '#18352A'}
                      >
                        View Hoarding →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>

      {/* Unavailable coordinates notice */}
      {unavailableSites.length > 0 && (
        <div style={{ fontSize: '0.8rem', color: '#C94040', padding: '12px 16px', background: '#F9E9E7', borderRadius: 10, border: '1px solid rgba(201,64,64,0.15)', marginBottom: 20 }}>
          <strong>Location Unavailable:</strong> {unavailableSites.map(s => s.site_id).join(', ')} — coordinates could not be verified.
        </div>
      )}

      {/* Map Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '14px 20px', background: '#FBFAF5', borderRadius: 10, border: '1px solid #D8D5CA', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#68736B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Legend</span>
        {Object.entries(statusMeta).map(([key, meta]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: meta.dot }} />
            <span style={{ fontSize: '0.78rem', color: '#18352A', fontWeight: 600 }}>{meta.label}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#68736B' }}>
          Coordinates sourced from <code style={{ fontSize: '0.7rem' }}>hoardings.csv</code> · Validated against MMR bounds
        </div>
      </div>

      {/* Validation debug block (development visibility) */}
      {validationStats && (
        <div style={{ marginTop: 12, padding: '10px 16px', background: '#E5EEE7', borderRadius: 8, fontSize: '0.75rem', color: '#2E8B57', fontFamily: 'monospace' }}>
          LOCATION VALIDATION &nbsp;|&nbsp; Total: {validationStats.total} &nbsp;|&nbsp;
          Valid coords: {validationStats.valid_coordinates} &nbsp;|&nbsp;
          Invalid: {validationStats.invalid_coordinates} &nbsp;|&nbsp;
          Duplicate: {validationStats.duplicate_coordinates} &nbsp;|&nbsp;
          {validationStats.invalid_coordinates === 0 && validationStats.duplicate_coordinates === 0 ? '✓ PASS' : '⚠ REVIEW NEEDED'}
        </div>
      )}

      <AIAgentChatDrawer
        isOpen={isAIAgentOpen}
        onClose={() => setIsAIAgentOpen(false)}
        onSelectMission={v => navigate(`/hoarding/${v.site_id}`)}
        onSelectPitch={v => navigate(`/hoarding/${v.site_id}`)}
      />
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        vacancies={[]}
        onSelectMission={v => navigate(`/hoarding/${v.site_id}`)}
        onSelectPitch={v => navigate(`/hoarding/${v.site_id}`)}
        onSelectSimulator={v => navigate(`/hoarding/${v.site_id}`)}
      />

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
