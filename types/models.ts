export interface Device {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: 'online' | 'offline';
  lastSeen: number; // timestamp
  batteryLevel?: number;
}

export interface GeofenceZone {
  id: string;
  deviceId: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  type: 'safe' | 'warning' | 'caution' | 'critical';
  enabled: boolean;
  notificationSound: boolean;
  notificationVibration: boolean;
}

export interface LocationHistoryPoint {
  deviceId: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  batteryLevel?: number;
}

export interface GeofenceEvent {
  id: string;
  timestamp: number;
  deviceId: string;
  zoneId: string;
  eventType: 'enter' | 'exit' | 'breach';
  latitude: number;
  longitude: number;
}

export interface AppSettings {
  trackingInterval: number; // seconds
  batterySaverMode: boolean;
  historicalDataRetentionDays: number;
  notificationChannelEnabled: boolean;
  backgroundTrackingEnabled: boolean;
}
