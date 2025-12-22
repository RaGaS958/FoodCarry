
export type DemoStep = 'idle' | 'searching' | 'transit' | 'delivered';

export interface TelemetryData {
  gForce: string;
  temp: number;
  tilt: number;
}

export interface BlogItem {
  id: number;
  title: string;
  hook: string;
  content: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: string;
}
