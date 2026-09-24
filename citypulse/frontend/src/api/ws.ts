import { WSEnvelope } from './types';

export type WSConnectionStatus = 'connected' | 'connecting' | 'reconnecting' | 'disconnected';

type MessageHandler = (envelope: WSEnvelope) => void;
type StatusHandler = (status: WSConnectionStatus) => void;

class CityPulseWSClient {
  private ws: WebSocket | null = null;
  private url: string;
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectDelay = 15000;
  private reconnectTimer: any = null;
  private shouldConnect = false;
  private status: WSConnectionStatus = 'disconnected';

  constructor() {
    const defaultWsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:8000/ws/stream`;
    this.url = import.meta.env.VITE_WS_URL || defaultWsUrl;
  }

  connect() {
    this.shouldConnect = true;
    this._initWebSocket();
  }

  disconnect() {
    this.shouldConnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this._setStatus('disconnected');
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  onStatusChange(handler: StatusHandler) {
    this.statusHandlers.add(handler);
    handler(this.status);
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  private _setStatus(status: WSConnectionStatus) {
    this.status = status;
    for (const h of this.statusHandlers) {
      h(status);
    }
  }

  private _initWebSocket() {
    if (!this.shouldConnect) return;

    this._setStatus(this.reconnectAttempts === 0 ? 'connecting' : 'reconnecting');

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this._setStatus('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const envelope: WSEnvelope = JSON.parse(event.data);
          for (const handler of this.messageHandlers) {
            handler(envelope);
          }
        } catch (err) {
          console.warn('Malformed WS message payload:', event.data, err);
        }
      };

      this.ws.onclose = () => {
        this.ws = null;
        if (this.shouldConnect) {
          this._scheduleReconnect();
        } else {
          this._setStatus('disconnected');
        }
      };

      this.ws.onerror = () => {
        if (this.ws) {
          this.ws.close();
        }
      };
    } catch (e) {
      this._scheduleReconnect();
    }
  }

  private _scheduleReconnect() {
    this.reconnectAttempts++;
    this._setStatus('reconnecting');
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), this.maxReconnectDelay);
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.reconnectTimer = setTimeout(() => {
      this._initWebSocket();
    }, delay);
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }
}

export const wsClient = new CityPulseWSClient();
