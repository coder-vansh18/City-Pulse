import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { SideNav } from './SideNav';
import { BottomNav } from './BottomNav';
import { DegradedBanner } from './DegradedBanner';
import { DemoPanel } from './DemoPanel';
import { useLiveData } from '../../hooks/useLiveData';

export const AppShell: React.FC = () => {
  // Mount live telemetry ingestion
  useLiveData();

  return (
    <div className="h-screen flex flex-col bg-bg text-text overflow-hidden">
      <TopBar />
      <DegradedBanner />

      <div className="flex-1 flex overflow-hidden">
        <SideNav />
        
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-8 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      <BottomNav />
      <DemoPanel />
    </div>
  );
};
