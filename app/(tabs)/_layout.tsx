import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons'; // Menggunakan icon bawaan Expo yang pasti ada

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      
      {/* --- TAB KIRI: GPS (Mengarah ke index.tsx) --- */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'GPS',
          // Menggunakan MaterialIcons 'location-on' (Icon Pin Lokasi)
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name="location-on" color={color} />
          ),
        }}
      />

      {/* --- TAB KANAN: Bluetooth (Mengarah ke bluetooth.tsx) --- */}
      <Tabs.Screen
        name="bluetooth"
        options={{
          title: 'Bluetooth',
          // Menggunakan MaterialIcons 'bluetooth' (Icon Logo Bluetooth)
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name="bluetooth" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}