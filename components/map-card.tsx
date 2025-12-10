import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { Device, GeofenceZone, LocationHistoryPoint } from '@/types/models';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export interface TrackedDeviceLocation {
  firestoreId: string;
  name: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface MapCardProps {
  userLocation?: { latitude: number; longitude: number };
  devices: Device[];
  zones: GeofenceZone[];
  history: LocationHistoryPoint[];
  selectedDeviceId?: string;
  trackedDevices?: TrackedDeviceLocation[];
}

const leafletCdn = `
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin="" />
  <script
    src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
    crossorigin=""></script>
`;

const tileUrl = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';

export function MapCard({ userLocation, devices, zones, history, selectedDeviceId, trackedDevices = [] }: MapCardProps) {
  const html = useMemo(() => {
    const deviceMarkers = devices.map((d) => ({
      id: d.id,
      name: d.name,
      lat: d.latitude,
      lng: d.longitude,
      status: d.status,
    }));
    const geoZones = zones.map((z) => ({
      id: z.id,
      name: z.name,
      lat: z.latitude,
      lng: z.longitude,
      radius: z.radius,
      type: z.type,
      enabled: z.enabled,
      deviceId: z.deviceId,
    }));
    const historyPoints = history.map((h) => ({
      lat: h.latitude,
      lng: h.longitude,
      ts: h.timestamp,
    }));
    const trackedMarkers = trackedDevices.map((d) => ({
      firestoreId: d.firestoreId,
      name: d.name,
      lat: d.latitude,
      lng: d.longitude,
      ts: d.timestamp,
    }));
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="initial-scale=1, maximum-scale=1">
        ${leafletCdn}
        <style>
          html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #fff; }
          .legend { position: absolute; bottom: 50px; right: 12px; background: rgba(255,255,255,0.95); padding: 10px 12px; border-radius: 8px; font-family: sans-serif; font-size: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 140px; }
          .legend h4 { margin: 0 0 6px 0; font-size: 12px; font-weight: 600; }
          .legend div { display: flex; gap: 6px; align-items: center; margin-bottom: 4px; }
          .dot { width: 10px; height: 10px; border-radius: 50%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="legend">
          <h4>Legend</h4>
          <div><span class="dot" style="background:#1a73e8"></span><span>Your Location</span></div>
          <div><span class="dot" style="background:#4caf50"></span><span>Online Device</span></div>
          <div><span class="dot" style="background:#9e9e9e"></span><span>Offline Device</span></div>
          <div><span class="dot" style="background:#ff6d00"></span><span>Tracked Device</span></div>
          <div><span class="dot" style="background:#2196f3"></span><span>History Path</span></div>
          <div><span class="dot" style="background:#f44336"></span><span>Last Known</span></div>
        </div>
        <script>
          const map = L.map('map', { zoomControl: true });
          L.tileLayer('${tileUrl}', { maxZoom: 19 }).addTo(map);

          const user = ${userLocation ? JSON.stringify(userLocation) : 'null'};
          const devices = ${JSON.stringify(deviceMarkers)};
          const zones = ${JSON.stringify(geoZones)};
          const history = ${JSON.stringify(historyPoints)};
          const tracked = ${JSON.stringify(trackedMarkers)};
          const selectedId = ${selectedDeviceId ? JSON.stringify(selectedDeviceId) : 'null'};

          const markers = [];
          const zoneLayers = [];

          if (user) {
            const userMarker = L.circleMarker([user.latitude, user.longitude], {
              radius: 8,
              color: '#1a73e8',
              fillColor: '#1a73e8',
              fillOpacity: 0.8,
            }).addTo(map).bindPopup('You');
            markers.push(userMarker);
          }

          devices.forEach(d => {
            const marker = L.circleMarker([d.lat, d.lng], {
              radius: selectedId === d.id ? 10 : 8,
              color: d.status === 'online' ? '#4caf50' : '#9e9e9e',
              fillColor: d.status === 'online' ? '#4caf50' : '#9e9e9e',
              fillOpacity: 0.9,
            }).addTo(map).bindPopup(d.name || d.id);
            markers.push(marker);
          });

          zones.forEach(z => {
            if (!z.enabled) return;
            const colors = {
              safe: '#4caf50',
              warning: '#ffc107',
              caution: '#ff9800',
              critical: '#f44336',
            };
            const circle = L.circle([z.lat, z.lng], {
              radius: z.radius,
              color: colors[z.type] || '#9e9e9e',
              weight: 1,
              fillColor: colors[z.type] || '#9e9e9e',
              fillOpacity: 0.08,
            }).addTo(map).bindPopup(z.name + ' (' + z.type + ')');
            zoneLayers.push(circle);
          });

          tracked.forEach(t => {
            const marker = L.circleMarker([t.lat, t.lng], {
              radius: 9,
              color: '#ff6d00',
              fillColor: '#ff6d00',
              fillOpacity: 0.85,
            }).addTo(map).bindPopup(t.name + ' (Firestore)');
            markers.push(marker);
          });

          if (history.length > 1) {
            const latlngs = history.map(p => [p.lat, p.lng]);
            L.polyline(latlngs, { color: '#2196f3', weight: 3, opacity: 0.8 }).addTo(map);
            const last = history[history.length - 1];
            L.circleMarker([last.lat, last.lng], {
              radius: 7,
              color: '#f44336',
              fillColor: '#f44336',
              fillOpacity: 0.9,
            }).addTo(map).bindPopup('Last known');
          }

          if (markers.length > 0) {
            const group = L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.3));
          } else {
            map.setView([0, 0], 2);
          }
        </script>
      </body>
      </html>
    `;
  }, [devices, zones, history, userLocation, selectedDeviceId, trackedDevices]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Live Map (OpenStreetMap)
      </ThemedText>
      <View style={styles.mapWrapper}>
        <WebView
          originWhitelist={["*"]}
          source={{ html }}
          style={styles.webview}
          nestedScrollEnabled
          androidLayerType="hardware"
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  title: {
    fontSize: 18,
  },
  mapWrapper: {
    height: 360,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  webview: {
    flex: 1,
  },
});
