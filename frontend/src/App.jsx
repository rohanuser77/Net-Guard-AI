import React from 'react';
import { useDashboard } from './hooks/useDashboard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatusBanner from './components/StatusBanner';
import StatsCards from './components/StatsCards';
import ControlPanel from './components/ControlPanel';
import TrafficChart from './components/TrafficChart';
import ThreatDonut from './components/ThreatDonut';
import LiveAlertFeed from './components/LiveAlertFeed';
import ThreatTimeline from './components/ThreatTimeline';
import EvidenceModal from './components/EvidenceModal';
import ModelPerformanceView from './components/ModelPerformanceView';
import ThreatIntelView from './components/ThreatIntelView';
import SettingsView from './components/SettingsView';

export function App() {
  const {
    activeTab,
    setActiveTab,
    stats,
    replayStatus,
    alerts,
    modelPerf,
    selectedAlert,
    setSelectedAlert,
    wsStatus,
    isLoading,
    errorMsg,
    actionSuccessMsg,
    startSimulation,
    stopSimulation,
    injectAttack,
    resetSimulation,
  } = useDashboard();

  const isUnderAttack = stats.active_threat_level === 'ATTACK';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b0f19] text-slate-100 font-sans antialiased">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isUnderAttack={isUnderAttack}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          wsStatus={wsStatus}
          flowsPerSecond={stats.flows_per_second}
        />

        {/* Dynamic View Scrollable Container */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Status Banner */}
              <StatusBanner
                isUnderAttack={isUnderAttack}
                lastThreat={stats.last_threat}
                replayMode={replayStatus.mode}
              />

              {/* 4 Top Stats Cards */}
              <StatsCards stats={stats} />

              {/* Control Panel */}
              <ControlPanel
                replayStatus={replayStatus}
                onStart={startSimulation}
                onStop={stopSimulation}
                onInject={injectAttack}
                onReset={resetSimulation}
                isLoading={isLoading}
                successMsg={actionSuccessMsg}
                errorMsg={errorMsg}
              />

              {/* Charts Row: Traffic Flow Volume & Threat Donut */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <TrafficChart data={stats.recent_history} />
                </div>
                <div className="lg:col-span-1">
                  <ThreatDonut distribution={stats.threat_distribution} />
                </div>
              </div>

              {/* Real-Time Alerts Feed & Timeline Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <LiveAlertFeed
                    alerts={alerts}
                    onSelectAlert={setSelectedAlert}
                  />
                </div>
                <div className="lg:col-span-1">
                  <ThreatTimeline alerts={alerts} />
                </div>
              </div>
            </>
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <StatusBanner
                isUnderAttack={isUnderAttack}
                lastThreat={stats.last_threat}
                replayMode={replayStatus.mode}
              />
              <ControlPanel
                replayStatus={replayStatus}
                onStart={startSimulation}
                onStop={stopSimulation}
                onInject={injectAttack}
                onReset={resetSimulation}
                isLoading={isLoading}
                successMsg={actionSuccessMsg}
                errorMsg={errorMsg}
              />
              <TrafficChart data={stats.recent_history} />
              <LiveAlertFeed
                alerts={alerts}
                onSelectAlert={setSelectedAlert}
              />
            </div>
          )}

          {activeTab === 'intelligence' && <ThreatIntelView />}

          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <LiveAlertFeed
                alerts={alerts}
                onSelectAlert={setSelectedAlert}
              />
              <ThreatTimeline alerts={alerts} />
            </div>
          )}

          {activeTab === 'models' && (
            <ModelPerformanceView modelPerf={modelPerf} />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              wsStatus={wsStatus}
              replayStatus={replayStatus}
            />
          )}
        </main>
      </div>

      {/* Forensic Evidence Modal */}
      {selectedAlert && (
        <EvidenceModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </div>
  );
}

export default App;
