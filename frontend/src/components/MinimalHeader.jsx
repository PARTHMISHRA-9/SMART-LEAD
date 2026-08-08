// frontend/src/components/MinimalHeader.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Map, Calendar, Bot, LayoutGrid, ArrowLeft } from 'lucide-react';

export default function MinimalHeader({ onOpenSearch, onOpenAIAgent }) {
  const location = useLocation();

  return (
    <header className="minimal-header">
      {/* Brand Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {location.pathname !== '/' && (
          <Link to="/" className="nav-link-btn" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
            <ArrowLeft style={{ width: 14, height: 14 }} />
            Landing
          </Link>
        )}
        <div>
          <div className="brand-title">SMART LEADS</div>
          <div className="brand-subtitle">Autonomous OOH Revenue Intelligence</div>
        </div>
      </div>

      {/* Minimal Header Navigation */}
      <nav className="header-nav">
        <Link 
          to="/dashboard" 
          className={`nav-link-btn ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          <LayoutGrid style={{ width: 15, height: 15 }} />
          <span>Dashboard</span>
        </Link>

        <button 
          onClick={onOpenSearch} 
          className="nav-link-btn"
          title="Search sites, locations, zones (Ctrl+K)"
        >
          <Search style={{ width: 15, height: 15 }} />
          <span>Search</span>
        </button>

        <Link 
          to="/map" 
          className={`nav-link-btn ${location.pathname === '/map' ? 'active' : ''}`}
        >
          <Map style={{ width: 15, height: 15 }} />
          <span>Map</span>
        </Link>

        <Link 
          to="/timeline" 
          className={`nav-link-btn ${location.pathname === '/timeline' ? 'active' : ''}`}
        >
          <Calendar style={{ width: 15, height: 15 }} />
          <span>Timeline</span>
        </Link>

        <button 
          onClick={onOpenAIAgent} 
          className="nav-link-btn btn-ai"
        >
          <Bot style={{ width: 15, height: 15 }} />
          <span>AI Agent</span>
        </button>
      </nav>
    </header>
  );
}
