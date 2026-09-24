import { MOCK_CONFIG, MOCK_FEEDS, MOCK_PULSE, MOCK_ALERTS, MOCK_ALERT_RULES } from './fixtures';
import { Pulse, NormalizedEvent, Insight, FeedStatus, Alert } from '../types';

class MockServer {
  private timer: any = null;
  private subscribers: ((data: { type: string; payload: any }) => void)[] = [];
  private pulse: Pulse = { ...MOCK_PULSE };
  private feeds: FeedStatus[] = [...MOCK_FEEDS];

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.tick();
    }, 2000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  subscribe(cb: (data: { type: string; payload: any }) => void) {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== cb);
    };
  }

  private tick() {
    // Subtle score variation
    const jitter = (Math.random() - 0.48) * 0.4;
    this.pulse.score = Math.max(20, Math.min(99, +(this.pulse.score + jitter).toFixed(1)));
    this.pulse.bpm = Math.round(60 + (100 - this.pulse.score) * 0.9);
    this.pulse.updated_at = new Date().toISOString();

    this.notify('pulse', this.pulse);
  }

  private notify(type: string, payload: any) {
    for (const sub of this.subscribers) {
      sub({ type, payload });
    }
  }

  triggerScenario(name: string) {
    if (name === 'storm') {
      this.pulse.score = 54.2;
      this.pulse.status = 'strained';
      this.pulse.bpm = 101;
      this.pulse.summary = {
        headline: 'City Pulse is STRAINED — Storm surge impacting transit.',
        body: 'Heavy rain coincides with 14-min transit delays and 4 flooding reports in Riverside. This may be related — causality unconfirmed.',
        generated_by: 'template',
        grounded_on: ['Open-Meteo Weather', 'GTFS-RT Transit'],
        updated_at: new Date().toISOString(),
      };
    } else if (name === 'clear') {
      this.pulse = { ...MOCK_PULSE, updated_at: new Date().toISOString() };
    }
    this.notify('pulse', this.pulse);
  }
}

export const mockServer = new MockServer();
