// frontend/src/components/DemoBar.jsx
/**
 * 2-Minute Hackathon Judge Demo Bar Component (Phase 30)
 * ------------------------------------------------------
 * EXPLAINABLE ARCHITECTURE & PHASE 30 REQUIREMENT:
 * Provides an interactive 6-step guided walkthrough bar for hackathon judges:
 * 1. View Revenue at Risk (Cockpit)
 * 2. Launch Recovery Mission (8-step Agentic Workflow)
 * 3. What-If Campaign Simulator
 * 4. Interactive City Map
 * 5. Sales Pipeline Kanban
 * 6. Hidden Opportunities
 */

import React from 'react';
import { Zap, Play, MapPin, Sliders, Layers, Sparkles, HelpCircle } from 'lucide-react';

export default function DemoBar({ activeStep, onStepClick }) {
  return (
    <div style={{
      background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
      border: '1px solid rgba(245, 158, 11, 0.4)',
      borderRadius: '12px',
      padding: '10px 16px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '10px'
    }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Zap style={{ color: '#fbbf24', width: '18px', height: '18px' }} />
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>
          ⚡ 2-MINUTE JUDGE DEMO MODE:
        </span>
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {[
          { id: 'cockpit', label: '1. Cockpit & KPIs', icon: Play },
          { id: 'mission', label: '2. Launch Recovery Mission', icon: Zap },
          { id: 'simulator', label: '3. What-If Simulator', icon: Sliders },
          { id: 'map', label: '4. City Map', icon: MapPin },
          { id: 'pipeline', label: '5. Sales Kanban', icon: Layers },
          { id: 'opportunities', label: '6. Hidden Opps', icon: Sparkles }
        ].map(step => {
          const Icon = step.icon;
          return (
            <button
              key={step.id}
              onClick={() => onStepClick(step.id)}
              style={{
                background: activeStep === step.id ? '#f59e0b' : 'rgba(0,0,0,0.3)',
                color: activeStep === step.id ? '#000' : '#fff',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Icon style={{ width: '12px', height: '12px' }} />
              {step.label}
            </button>
          );
        })}
      </div>

    </div>
  );
}
