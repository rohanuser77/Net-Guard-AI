import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import useWebSocket from './useWebSocket';

export function useDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    total_flows: 0,
    flows_per_second: 0.0,
    total_threats: 0,
    normal_flows: 0,
    average_confidence: 0.0,
    active_threat_level: 'NORMAL',
    threat_distribution: {},
    recent_history: [],
    last_threat: null,
  });

  const [replayStatus, setReplayStatus] = useState({
    is_running: false,
    mode: 'STOPPED',
    active_attack_type: null,
    speed_factor: 1.0,
    flows_replayed: 0,
    available_attack_types: ['DoS', 'DDoS', 'PortScan', 'Bot', 'Web Attack', 'Infiltration'],
  });

  const [alerts, setAlerts] = useState([]);
  const [modelPerf, setModelPerf] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);

  // Clear notifications after 4s
  const notifySuccess = (msg) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const notifyError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  };

  // Initial load via REST
  const refreshData = useCallback(async () => {
    try {
      const [statsData, replayData, alertsData, perfData] = await Promise.all([
        api.getStats().catch(() => null),
        api.getReplayStatus().catch(() => null),
        api.getAlerts(50, 0).catch(() => ({ alerts: [] })),
        api.getModelPerformance().catch(() => null),
      ]);

      if (statsData) setStats(statsData);
      if (replayData) setReplayStatus(replayData);
      if (alertsData?.alerts) setAlerts(alertsData.alerts);
      if (perfData) setModelPerf(perfData);
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handle incoming live WebSocket updates
  const handleWebSocketMessage = useCallback((payload) => {
    if (!payload) return;

    if (payload.type === 'INITIAL_STATE') {
      if (payload.stats) setStats(payload.stats);
      if (payload.replay) setReplayStatus(payload.replay);
    } else if (payload.type === 'TRAFFIC_UPDATE') {
      if (payload.stats) {
        setStats(payload.stats);
      }
      if (payload.replay) {
        setReplayStatus(payload.replay);
      }
      if (payload.new_alert) {
        setAlerts((prev) => [payload.new_alert, ...prev.slice(0, 99)]);
      }
    }
  }, []);

  const { status: wsStatus } = useWebSocket(handleWebSocketMessage);

  // Actions
  const startSimulation = async (speed = 1.0) => {
    setIsLoading(true);
    try {
      const res = await api.startReplay(speed);
      if (res?.status) setReplayStatus(res.status);
      notifySuccess('Traffic replay started. Streaming benign flows.');
    } catch (err) {
      notifyError(err.message || 'Failed to start simulation.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopSimulation = async () => {
    setIsLoading(true);
    try {
      const res = await api.stopReplay();
      if (res?.status) setReplayStatus(res.status);
      notifySuccess('Simulation stopped.');
    } catch (err) {
      notifyError(err.message || 'Failed to stop simulation.');
    } finally {
      setIsLoading(false);
    }
  };

  const injectAttack = async (attackType, burst = 25) => {
    setIsLoading(true);
    try {
      const res = await api.injectAttack(attackType, burst);
      if (res?.status) setReplayStatus(res.status);
      notifySuccess(`Injected burst of ${burst} ${attackType} flows.`);
    } catch (err) {
      notifyError(err.message || 'Failed to inject attack.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSimulation = async () => {
    setIsLoading(true);
    try {
      const res = await api.resetReplay();
      if (res?.status) setReplayStatus(res.status);
      setAlerts([]);
      setStats({
        total_flows: 0,
        flows_per_second: 0.0,
        total_threats: 0,
        normal_flows: 0,
        average_confidence: 0.0,
        active_threat_level: 'NORMAL',
        threat_distribution: {},
        recent_history: [],
        last_threat: null,
      });
      notifySuccess('Simulation reset successfully.');
    } catch (err) {
      notifyError(err.message || 'Failed to reset simulation.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
    refreshData,
  };
}

export default useDashboard;
