// frontend/src/main.jsx
/**
 * Application entry point.
 * Wraps the app in React Router so the landing page (/),
 * dashboard (/dashboard), detail page (/hoarding/:siteId),
 * map (/map), and timeline (/timeline) can coexist as separate routes.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardOverview from './pages/DashboardOverview';
import HoardingDetailPage from './pages/HoardingDetailPage';
import MapViewPage from './pages/MapViewPage';
import TimelineViewPage from './pages/TimelineViewPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Landing page — marketing / entry overview */}
        <Route path="/" element={<LandingPage />} />

        {/* Dashboard — main hoarding inventory overview */}
        <Route path="/dashboard" element={<DashboardOverview />} />

        {/* Hoarding Detail Page — deep intelligence view */}
        <Route path="/hoarding/:siteId" element={<HoardingDetailPage />} />

        {/* City Operations Map */}
        <Route path="/map" element={<MapViewPage />} />

        {/* 90-Day Contract Timeline */}
        <Route path="/timeline" element={<TimelineViewPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
