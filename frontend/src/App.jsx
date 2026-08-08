// frontend/src/App.jsx
/**
 * Autonomous OOH Revenue Recovery Platform - Executive Cockpit Application
 * ------------------------------------------------------------------------
 * EXPLAINABLE ARCHITECTURE & AGENTIC AI COMMAND CENTER:
 * Orchestrates all 8 operating views, interactive modals, AI Agent Activity feed,
 * Global Command Palette (Ctrl+K), AI Copilot Assistant Drawer, and 2-Minute Hackathon Judge Demo Bar.
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MetricsOverview from './components/MetricsOverview';
import VacancyList from './components/VacancyList';
import MapView from './components/MapView';
import TimelineView from './components/TimelineView';
import SalesPipelineKanban from './components/SalesPipelineKanban';
import HiddenOpportunitiesPanel from './components/HiddenOpportunitiesPanel';

// Modals & Drawers
import RecoveryMissionModal from './components/RecoveryMissionModal';
import CopilotDrawer from './components/CopilotDrawer';
import CampaignSimulatorModal from './components/CampaignSimulatorModal';
import CustomerProfileModal from './components/CustomerProfileModal';
import GlobalSearchModal from './components/GlobalSearchModal';
import DataHealthModal from './components/DataHealthModal';
import AgentActivityDrawer from './components/AgentActivityDrawer';
import AIAgentChatDrawer from './components/AIAgentChatDrawer';
import DemoBar from './components/DemoBar';

export default function App() {
  const [activeTab, setActiveTab] = useState('cockpit'); // cockpit, map, timeline, pipeline, opportunities
  const [referenceDate, setReferenceDate] = useState('2026-08-01');
  const [strategyMode, setStrategyMode] = useState('BALANCED');
  const [demoStep, setDemoStep] = useState('cockpit');

  const [metrics, setMetrics] = useState(null);
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & Drawer States
  const [isMissionOpen, setIsMissionOpen] = useState(false);
  const [selectedMissionVacancy, setSelectedMissionVacancy] = useState(null);

  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [selectedCopilotVacancy, setSelectedCopilotVacancy] = useState(null);
  const [selectedCopilotLead, setSelectedCopilotLead] = useState(null);

  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [selectedSimVacancy, setSelectedSimVacancy] = useState(null);
  const [selectedSimCustomer, setSelectedSimCustomer] = useState(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedProfileCustomer, setSelectedProfileCustomer] = useState(null);
  const [selectedProfileVacancy, setSelectedProfileVacancy] = useState(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHealthOpen, setIsHealthOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isAIAgentOpen, setIsAIAgentOpen] = useState(false);

  // Keyboard shortcut listener for Ctrl + K
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

  // Fetch API data on parameter change
  useEffect(() => {
    fetchData();
  }, [referenceDate, strategyMode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resMetrics = await fetch(`/api/metrics`);
      const dataMetrics = await resMetrics.json();
      setMetrics(dataMetrics);

      const resVacancies = await fetch(`/api/vacancies?strategy=${strategyMode}`);
      const dataVacancies = await resVacancies.json();
      setVacancies(dataVacancies.vacancies || []);
    } catch (err) {
      console.error('Error fetching API data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Triggers
  const handleLaunchMission = (vacancy) => {
    setSelectedMissionVacancy(vacancy || vacancies[0]);
    setIsMissionOpen(true);
  };

  const handleOpenPitch = (vacancy, lead) => {
    setSelectedCopilotVacancy(vacancy);
    setSelectedCopilotLead(lead);
    setIsCopilotOpen(true);
  };

  const handleOpenSimulator = (vacancy, customer) => {
    setSelectedSimVacancy(vacancy);
    setSelectedSimCustomer(customer);
    setIsSimulatorOpen(true);
  };

  const handleOpenProfile = (customer, vacancy) => {
    setSelectedProfileCustomer(customer);
    setSelectedProfileVacancy(vacancy);
    setIsProfileOpen(true);
  };

  // Judge Demo Walkthrough Controller
  const handleDemoStep = (stepId) => {
    setDemoStep(stepId);
    if (stepId === 'cockpit') setActiveTab('cockpit');
    if (stepId === 'mission') handleLaunchMission(vacancies[0]);
    if (stepId === 'simulator') {
      const v = vacancies[0];
      const c = v && v.top_leads ? v.top_leads[0] : null;
      if (v && c) handleOpenSimulator(v, c);
    }
    if (stepId === 'map') setActiveTab('map');
    if (stepId === 'pipeline') setActiveTab('pipeline');
    if (stepId === 'opportunities') setActiveTab('opportunities');
  };

  return (
    <div className="app-container">
      
      {/* Header & Controls */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        referenceDate={referenceDate}
        setReferenceDate={setReferenceDate}
        strategyMode={strategyMode}
        setStrategyMode={setStrategyMode}
        dataHealthScore={metrics ? metrics.data_health_score : 96}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenHealth={() => setIsHealthOpen(true)}
        onOpenActivities={() => setIsActivityOpen(true)}
        onOpenAIAgent={() => setIsAIAgentOpen(true)}
      />

      {/* 2-Minute Hackathon Judge Demo Walkthrough Bar */}
      <DemoBar activeStep={demoStep} onStepClick={handleDemoStep} />

      {/* Executive Command Center KPIs */}
      <MetricsOverview metrics={metrics} />

      {/* Main Operating Views */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>
            Analyzing Billboard Vacancy Pipeline & Calculating Revenue Risk Scores...
          </div>
          <p style={{ fontSize: '0.85rem' }}>Evaluating 100-point fit scores, Next Best Actions, and recovery confidence</p>
        </div>
      ) : (
        <>
          {activeTab === 'cockpit' && (
            <VacancyList 
              vacancies={vacancies} 
              onSelectForPitch={handleOpenPitch}
              onSelectMission={handleLaunchMission}
              onOpenSimulator={handleOpenSimulator}
              onOpenProfile={handleOpenProfile}
            />
          )}

          {activeTab === 'map' && (
            <MapView 
              vacancies={vacancies} 
              onSelectForPitch={handleOpenPitch}
              onSelectMission={handleLaunchMission}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineView 
              referenceDate={referenceDate}
              onSelectMission={handleLaunchMission}
            />
          )}

          {activeTab === 'pipeline' && (
            <SalesPipelineKanban 
              onSelectForPitch={handleOpenPitch}
            />
          )}

          {activeTab === 'opportunities' && (
            <HiddenOpportunitiesPanel 
              vacancies={vacancies}
              onSelectMission={handleLaunchMission}
              onSelectPitch={handleOpenPitch}
            />
          )}
        </>
      )}

      {/* Modals & Drawers */}
      <RecoveryMissionModal 
        isOpen={isMissionOpen}
        onClose={() => setIsMissionOpen(false)}
        vacancy={selectedMissionVacancy}
        strategyMode={strategyMode}
        onSelectForPitch={handleOpenPitch}
      />

      <CopilotDrawer 
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        vacancy={selectedCopilotVacancy}
        lead={selectedCopilotLead}
      />

      <CampaignSimulatorModal 
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        vacancy={selectedSimVacancy}
        customer={selectedSimCustomer}
        strategyMode={strategyMode}
      />

      <CustomerProfileModal 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        customer={selectedProfileCustomer}
        vacancy={selectedProfileVacancy}
      />

      <GlobalSearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        vacancies={vacancies}
        onSelectMission={handleLaunchMission}
        onSelectPitch={handleOpenPitch}
        onSelectSimulator={handleOpenSimulator}
      />

      <DataHealthModal 
        isOpen={isHealthOpen}
        onClose={() => setIsHealthOpen(false)}
      />

      <AgentActivityDrawer 
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
      />

      <AIAgentChatDrawer 
        isOpen={isAIAgentOpen}
        onClose={() => setIsAIAgentOpen(false)}
        onSelectMission={handleLaunchMission}
        onSelectPitch={handleOpenPitch}
      />

      {/* Footer */}
      <footer style={{ marginTop: '40px', padding: '20px 0', borderTop: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
        Autonomous OOH Revenue Recovery Platform • DigiPlus IT Agentic AI Hackathon Solution • Thakur College of Engineering & Technology
      </footer>

    </div>
  );
}
