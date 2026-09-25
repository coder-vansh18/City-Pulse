import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicRoute } from './components/auth/PublicRoute';

// Pages
import { LivePulse } from './pages/LivePulse';
import { MapView } from './pages/MapView';
import { ZoneDetail } from './pages/ZoneDetail';
import { Insights } from './pages/Insights';
import { Replay } from './pages/Replay';
import { FeedHealth } from './pages/FeedHealth';
import { Alerts } from './pages/Alerts';
import { About } from './pages/About';
import { CitizenReportPage } from './pages/CitizenReportPage';
import { DisputedItemsPage } from './pages/DisputedItemsPage';
import { ActionPlanPage } from './pages/ActionPlanPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password/:token"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      {/* Protected CityPulse Application Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<LivePulse />} />
        <Route path="map" element={<MapView />} />
        <Route path="zone/:id" element={<ZoneDetail />} />
        <Route path="insights" element={<Insights />} />
        <Route path="replay" element={<Replay />} />
        <Route path="feeds" element={<FeedHealth />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="report" element={<CitizenReportPage />} />
        <Route path="reports" element={<CitizenReportPage />} />
        <Route path="disputed" element={<DisputedItemsPage />} />
        <Route path="disputes" element={<DisputedItemsPage />} />
        <Route path="action-plan" element={<ActionPlanPage />} />
        <Route path="action-plans" element={<ActionPlanPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="about" element={<About />} />
      </Route>

      {/* Fallback to Root (which triggers auth check) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
