import { useEffect, useRef } from 'react';
import { useCityStore } from '../store/useCityStore';
import { apiClient } from '../api/client';
import { wsClient } from '../api/ws';
import { mockServer } from '../api/mock/mockServer';

// Synthesizer for subtle heartbeat audio when soundOn is enabled
class HeartbeatAudio {
  private ctx: AudioContext | null = null;

  playBeat(pitch: number = 80) {
    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.12);
      
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {
      // Audio playback silently catches if browser permissions block autoplay
    }
  }
}

const audioSynth = new HeartbeatAudio();

export function useLiveData() {
  const {
    setConfig,
    setPulse,
    setZonesGeoJSON,
    setEvents,
    addEvent,
    setInsights,
    upsertInsight,
    setFeeds,
    setAlerts,
    addAlert,
    setRules,
    setReplay,
    setConnection,
    mockMode,
    soundOn,
    resetToMockFixtures,
  } = useCityStore();

  const failedAttemptsRef = useRef(0);
  const pollTimerRef = useRef<any>(null);

  // Initial Snapshot Fetch
  const loadInitialData = async () => {
    try {
      const [config, pulse, zones, insights, feeds, events, alerts, rules] = await Promise.all([
        apiClient.getConfig(),
        apiClient.getPulse(),
        apiClient.getZonesGeoJSON(),
        apiClient.getInsights('all'),
        apiClient.getFeedsStatus(),
        apiClient.getEvents({ limit: 100 }),
        apiClient.getAlerts(),
        apiClient.getAlertRules(),
      ]);

      setConfig(config);
      setPulse(pulse);
      setZonesGeoJSON(zones);
      setInsights(insights);
      setFeeds(feeds);
      setEvents(events);
      setAlerts(alerts);
      setRules(rules);
      failedAttemptsRef.current = 0;
    } catch (err) {
      console.warn('Initial live data fetch failed, using mock fixtures:', err);
      failedAttemptsRef.current++;
      if (failedAttemptsRef.current >= 2) {
        resetToMockFixtures();
      }
    }
  };

  useEffect(() => {
    if (mockMode) {
      resetToMockFixtures();
      mockServer.start();
      const unsub = mockServer.subscribe((msg) => {
        if (msg.type === 'pulse') setPulse(msg.payload);
      });
      return () => {
        unsub();
        mockServer.stop();
      };
    }

    // 1. Fetch initial snapshot
    loadInitialData();

    // 2. Connect WebSocket
    wsClient.connect();

    const unsubStatus = wsClient.onStatusChange((status) => {
      setConnection(status);
      if (status === 'disconnected' || status === 'reconnecting') {
        // Start backup 5s polling loop if WS is failing
        if (!pollTimerRef.current) {
          pollTimerRef.current = setInterval(loadInitialData, 5000);
        }
      } else if (status === 'connected') {
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }
      }
    });

    const unsubMsg = wsClient.onMessage((envelope) => {
      switch (envelope.type) {
        case 'pulse':
          setPulse(envelope.payload);
          break;
        case 'zones':
          setZonesGeoJSON(envelope.payload);
          break;
        case 'event':
          addEvent(envelope.payload);
          break;
        case 'insight':
          upsertInsight(envelope.payload);
          break;
        case 'alert':
          addAlert(envelope.payload);
          break;
        case 'feed_status':
          setFeeds(envelope.payload);
          break;
        case 'replay_state':
          setReplay(envelope.payload);
          break;
      }
    });

    return () => {
      unsubStatus();
      unsubMsg();
      wsClient.disconnect();
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [mockMode]);

  // Audio heartbeat listener
  const pulse = useCityStore((s) => s.pulse);
  useEffect(() => {
    if (soundOn && pulse) {
      audioSynth.playBeat(pulse.status === 'critical' ? 120 : pulse.status === 'strained' ? 95 : 75);
    }
  }, [pulse?.score, soundOn]);
}
