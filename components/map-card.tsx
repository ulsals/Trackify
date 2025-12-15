import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

interface TrackedDeviceMapData {
  firestoreId: string;
  name: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  color?: string;
}

interface LocationHistoryPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface MapCardProps {
  userLocation?: { latitude: number; longitude: number };
  devices?: any[];
  zones?: any[];
  history?: LocationHistoryPoint[];
  trackedDevices: TrackedDeviceMapData[];
  selectedDeviceId?: string;
}

const leafletCdn = `
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
`;

// --- SOLUSI 3: GANTI KE TILE OSM STANDAR (WARNA-WARNI) ---
// Sebelumnya: CartoDB Light (Pucat)
// Sekarang: OpenStreetMap Standard (Seperti Gambar 3)
const tileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export function MapCard({
  userLocation,
  history = [],
  trackedDevices = [],
  selectedDeviceId,
}: MapCardProps) {
  const html = useMemo(() => {
    const user = userLocation;
    const historyPoints = history.map((h) => [h.latitude, h.longitude]);

    const markers = trackedDevices.map((d) => ({
      name: d.name,
      lat: d.latitude,
      lng: d.longitude,
      ts: d.timestamp,
      color: d.color || "#ff6d00",
    }));

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        ${leafletCdn}
        <style>
          /* Reset Margin */
          html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #e5e3df; }
          
          /* Kustomisasi Ukuran Font Attribution agar tidak terlalu mencolok */
          .leaflet-control-attribution { font-size: 9px !important; color: #666; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          // Inisialisasi Peta
          var map = L.map('map', { 
            zoomControl: false, // Matikan tombol zoom (+/-) agar bersih di HP
            attributionControl: true 
          });

          // --- SOLUSI 2: HAPUS TULISAN "Leaflet" BIRU ---
          // Ini menghapus prefix "Leaflet" tapi tetap membiarkan copyright OpenStreetMap (Wajib)
          map.attributionControl.setPrefix(false); 
          
          L.tileLayer('${tileUrl}', { 
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);

          var markersData = ${JSON.stringify(markers)};
          var historyPath = ${JSON.stringify(historyPoints)};
          var userLoc = ${user ? JSON.stringify(user) : "null"};
          var bounds = [];

          // 1. User Marker (Biru)
          if (userLoc) {
            var userMarker = L.circleMarker([userLoc.latitude, userLoc.longitude], {
              radius: 8, color: '#1a73e8', fillColor: '#1a73e8', fillOpacity: 0.8, weight: 2
            }).addTo(map);
            bounds.push([userLoc.latitude, userLoc.longitude]);
          }

          // 2. History Path (Garis Biru)
          if (historyPath.length > 1) {
            L.polyline(historyPath, { color: '#2196f3', weight: 4, opacity: 0.7 }).addTo(map);
            historyPath.forEach(p => bounds.push(p));
          }

          // 3. Tracked Devices (Warna-Warni)
          markersData.forEach(function(d) {
            L.circleMarker([d.lat, d.lng], {
              radius: 10,
              color: 'white',       // Border Putih agar kontras dengan peta warna-warni
              weight: 2,
              fillColor: d.color,   // Warna Isi sesuai device
              fillOpacity: 1,
              opacity: 1
            }).addTo(map); // Popup dihapus sementara agar tidak menutupi peta kecil
            
            bounds.push([d.lat, d.lng]);
          });

          // 4. Auto Zoom
          if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [30, 30] });
          } else {
            // Default View (Monas, Jakarta)
            map.setView([-6.1754, 106.8272], 13);
          }
        </script>
      </body>
      </html>
    `;
  }, [userLocation, history, trackedDevices, selectedDeviceId]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Peta Lokasi
      </ThemedText>
      <View style={styles.mapWrapper}>
        <WebView
          originWhitelist={["*"]}
          source={{ html }}
          style={styles.webview}
          nestedScrollEnabled
          androidLayerType="hardware"
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scrollEnabled={false} // PENTING: Agar peta tidak mengganggu scroll halaman
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  title: {
    fontSize: 18,
    marginBottom: 4,
  },
  mapWrapper: {
    height: 200, // --- SOLUSI 1: TINGGI DIPERKECIL (Dari 350 ke 200) ---
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: "#f0f0f0",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
