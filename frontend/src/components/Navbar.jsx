// frontend/src/components/Navbar.jsx
/**
 * Navigation & Header Control Bar Component
 * ----------------------------------------
 * Provides brand identity, 8-tab view navigation, reference date selector for vacancy simulation,
 * strategy mode switcher, CSV dataset export buttons, and trigger for AI Copilot Agent drawer.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Calendar, Zap, Download, Search, ShieldCheck, 
  Map, BarChart2, Cpu, Grid, Sparkles, Bot, ArrowLeft
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  referenceDate, 
  setReferenceDate, 
  strategyMode, 
  setStrategyMode,
  dataHealthScore = 96,
  onOpenSearch,
  onOpenHealth,
  onOpenActivities,
  onOpenAIAgent
}) {
  
  const handleExport = (dataset) => {
    window.open(`/api/export/${dataset}`, '_blank');
  };

  return (
    <header className="glass-panel" style={{ padding: '14px 24px', marginBottom: '20px' }}>
      
      {/* Top Row: Brand, Health Score, Strategy Selector, Export Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Back to Landing Page */}
          <Link to="/" title="Back to Overview" style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            color: 'var(--text-dim)', fontSize: '0.72rem', fontWeight: 600,
            textDecoration: 'none', padding: '4px 8px', borderRadius: '6px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)',
            transition: 'all 0.18s ease', whiteSpace: 'nowrap',
          }}>
            <ArrowLeft style={{ width: 12, height: 12 }} />
            Overview
          </Link>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
          }}>
            <Building2 style={{ width: '24px', height: '24px', color: '#ffffff' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Smart Leads Agent
              </h1>
              <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                AUTONOMOUS BILLBOARD REVENUE INTELLIGENCE
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              DigiPlus IT Agentic AI Hackathon • 90-Day Vacancy & Fit Scoring Engine
            </p>
          </div>
        </div>

        {/* Global Search & AI Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Global Search (Ctrl + K) Button */}
          <button 
            onClick={onOpenSearch}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Search style={{ width: '14px', height: '14px' }} />
            <span>Search...</span>
            <kbd style={{ background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', color: '#fff' }}>Ctrl K</kbd>
          </button>

          {/* AI Copilot Agent Drawer Trigger Button */}
          <button
            onClick={onOpenAIAgent}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: '#fff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(139, 92, 246, 0.4)'
            }}
          >
            <Bot style={{ width: '16px', height: '16px' }} />
            <span>Ask AI Agent</span>
          </button>

          {/* Data Quality & Health Badge */}
          <button 
            onClick={onOpenHealth}
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <ShieldCheck style={{ width: '14px', height: '14px' }} />
            <span>Data Health: {dataHealthScore}%</span>
          </button>

          {/* Agent Activity Stream Drawer Button */}
          <button
            onClick={onOpenActivities}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Cpu style={{ width: '14px', height: '14px', color: 'var(--primary-blue)' }} />
            <span>Activity Feed</span>
          </button>

          {/* Reference Date Selector for Vacancy Simulation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <Calendar style={{ width: '14px', height: '14px', color: 'var(--primary-blue)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ref Date:</span>
            <input 
              type="date"
              value={referenceDate}
              onChange={(e) => setReferenceDate(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 600,
                outline: 'none'
              }}
            />
          </div>

          {/* Strategy Mode Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <Zap style={{ width: '14px', height: '14px', color: '#f59e0b' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Strategy:</span>
            <select
              value={strategyMode}
              onChange={(e) => setStrategyMode(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="BALANCED" style={{ background: '#131b2e' }}>Balanced Fit</option>
              <option value="REVENUE_MAX" style={{ background: '#131b2e' }}>Revenue Maximizer</option>
              <option value="SPEED_FILL" style={{ background: '#131b2e' }}>Speed Fill (Quick Close)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { id: 'cockpit', label: '1. Vacancy Cockpit', icon: Grid },
          { id: 'map', label: '2. Intelligent Map', icon: Map },
          { id: 'timeline', label: '3. 90-Day Timeline', icon: BarChart2 },
          { id: 'pipeline', label: '4. Sales Kanban', icon: Cpu },
          { id: 'opportunities', label: '5. Hidden Opportunities', icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'var(--primary-blue)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon style={{ width: '14px', height: '14px' }} />
              {tab.label}
            </button>
          );
        })}
      </div>

    </header>
  );
}
