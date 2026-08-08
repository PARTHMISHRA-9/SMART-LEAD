// frontend/src/components/MapView.jsx
/**
 * Upgraded Intelligent City Map Component (Phase 12)
 * --------------------------------------------------
 * EXPLAINABLE ARCHITECTURE & PHASE 12 REQUIREMENT:
 * Provides 5 Map Visual Modes:
 * 1. Revenue Opportunity: High monthly rate hoardings
 * 2. Vacancy Risk: High revenue risk score billboards
 * 3. Lead Density: Sites with multiple high-fit affordable candidates
 * 4. Churn Risk: Sites with high incumbent churn probability
 * 5. Recovery Priority: Combined P1, P2, P3 recovery urgency
 */

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, DollarSign, Eye, Clock, Send, Zap, Layers } from 'lucide-react';

const createCustomMarker = (color, text = '📍') => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: ${color};
        border: 2px solid #ffffff;
        box-shadow: 0 0 12px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 11px;
      ">
        ${text}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const redIcon = createCustomMarker('#f43f5e', '🚨');
const orangeIcon = createCustomMarker('#f59e0b', '🟠');
const yellowIcon = createCustomMarker('#eab308', '🟡');
const greenIcon = createCustomMarker('#10b981', '🟢');
const purpleIcon = createCustomMarker('#8b5cf6', '💜');

export default function MapView({ vacancies, onSelectForPitch, onSelectMission }) {
  const [mapMode, setMapMode] = useState('VACANCY_RISK');

  const centerLat = 19.0760;
  const centerLng = 72.8777;

  return (
    <div className="glass-panel" style={{ padding: '20px', minHeight: '680px', position: 'relative' }}>
      
      {/* Map Control Bar & 5 Mode Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Intelligent Billboard Operations Map</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Real-time geographical distribution across 5 operational views
          </p>
        </div>

        {/* 5 Map Visual Modes Selector */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '4px' }}>
          {[
            { id: 'VACANCY_RISK', label: '1. Vacancy Risk' },
            { id: 'REVENUE_OPP', label: '2. Revenue Opportunity' },
            { id: 'LEAD_DENSITY', label: '3. Lead Density' },
            { id: 'CHURN_RISK', label: '4. Churn Risk' },
            { id: 'RECOVERY_PRIORITY', label: '5. Recovery Priority' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMapMode(m.id)}
              style={{
                background: mapMode === m.id ? 'var(--primary-blue)' : 'transparent',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Box */}
      <div style={{ width: '100%', height: '580px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <MapContainer 
          center={[centerLat, centerLng]} 
          zoom={11} 
          scrollWheelZoom={true} 
          style={{ width: '100%', height: '100%', background: '#0b0f19' }}
        >
          <TileLayer
            attribution='&copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {vacancies && vacancies.map(vac => {
            let markerIcon = yellowIcon;

            // Color coding based on selected Map Mode
            if (mapMode === 'VACANCY_RISK') {
              if (vac.days_until_vacant <= 30) markerIcon = redIcon;
              else if (vac.days_until_vacant <= 60) markerIcon = orangeIcon;
            } else if (mapMode === 'REVENUE_OPP') {
              if (vac.monthly_rate >= 20000) markerIcon = purpleIcon;
              else if (vac.monthly_rate >= 14000) markerIcon = greenIcon;
            } else if (mapMode === 'CHURN_RISK') {
              const churn = vac.incumbent_churn_analysis;
              if (churn && churn.churn_risk_pct > 60) markerIcon = redIcon;
              else markerIcon = greenIcon;
            } else if (mapMode === 'RECOVERY_PRIORITY') {
              const risk = vac.revenue_risk;
              if (risk && risk.priority === 'P1') markerIcon = redIcon;
              else if (risk && risk.priority === 'P2') markerIcon = orangeIcon;
              else markerIcon = yellowIcon;
            }

            const lat = parseFloat(vac.latitude) || centerLat;
            const lng = parseFloat(vac.longitude) || centerLng;

            return (
              <Marker key={vac.site_id} position={[lat, lng]} icon={markerIcon}>
                <Popup>
                  <div style={{ padding: '4px', minWidth: '240px', fontFamily: 'sans-serif' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb' }}>
                      {vac.site_id} ({vac.zone})
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, margin: '2px 0 6px 0', color: '#0f172a' }}>
                      {vac.location_name}
                    </div>
                    
                    <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '8px' }}>
                      • Monthly Rate: <strong>${vac.monthly_rate.toLocaleString()}</strong><br />
                      • Free From: <strong style={{ color: '#d97706' }}>{vac.free_from_date}</strong><br />
                      • Risk Exposure: <strong style={{ color: '#dc2626' }}>${vac.revenue_at_risk.toLocaleString()}</strong>
                    </div>

                    {vac.top_leads && vac.top_leads.length > 0 && (
                      <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#059669' }}>
                          🎯 Rank #1: {vac.top_leads[0].company_name} ({vac.top_leads[0].overall_fit_score}% match)
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => onSelectMission(vac)}
                        style={{
                          flex: 1,
                          background: '#f59e0b',
                          color: '#000',
                          border: 'none',
                          padding: '6px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Launch Mission
                      </button>

                      {vac.top_leads && vac.top_leads[0] && (
                        <button 
                          onClick={() => onSelectForPitch(vac, vac.top_leads[0])}
                          style={{
                            flex: 1,
                            background: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            padding: '6px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Pitch Lead
                        </button>
                      )}
                    </div>

                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

    </div>
  );
}
