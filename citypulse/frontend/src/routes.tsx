import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { LivePulse } from './pages/LivePulse';
import { MapView } from './pages/MapView';
import { ZoneDetail } from './pages/ZoneDetail';
import { Insights } from './pages/Insights';
import { Replay } from './pages/Replay';
import { FeedHealth } from './pages/FeedHealth';
import { Alerts } from './pages/Alerts';
import { About } from './pages/About';
import { CitizenReportPage } from './pages/CitizenReportPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<LivePulse />} />
        <Route path="map" element={<MapView />} />
        <Route path="zone/:id" element={<ZoneDetail />} />
        <Route path="insights" element={<Insights />} />
        <Route path="replay" element={<Replay />} />
        <Route path="feeds" element={<FeedHealth />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="report" element={<CitizenReportPage />} />
        <Route path="reports" element={<CitizenReportPage />} />
        <Route path="about" element={<About />} />
        {/* Fallback */}
        <Route path="*" element={<LivePulse />} />
      </Route>
    </Routes>
  );
};
