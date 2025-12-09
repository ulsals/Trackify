import { GeofenceZone } from '@/types/models';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

let Notifications: any = null;

try {
  Notifications = require('expo-notifications');
  // Configure notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (error) {
  console.warn('Notifications not available in this environment');
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Notifications) return false;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.warn('Notification permission request failed', error);
    return false;
  }
}

export async function createNotificationChannels(): Promise<void> {
  if (!Notifications) return;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('safe', {
      name: 'Safe Zone',
      importance: Notifications.AndroidImportance.LOW,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });

    await Notifications.setNotificationChannelAsync('warning', {
      name: 'Warning Zone',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });

    await Notifications.setNotificationChannelAsync('caution', {
      name: 'Caution Zone',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 500, 250],
    });

    await Notifications.setNotificationChannelAsync('critical', {
      name: 'Critical Zone',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 500, 250, 500],
    });

    await Notifications.setNotificationChannelAsync('offline', {
      name: 'Device Offline',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 1000],
    });
  }
}

export async function sendGeofenceNotification(
  deviceName: string,
  zone: GeofenceZone,
  eventType: 'enter' | 'exit' | 'breach'
): Promise<void> {
  if (!Notifications) return;

  const messages = {
    enter: `${deviceName} entered ${zone.name}`,
    exit: `${deviceName} exited ${zone.name}`,
    breach: `${deviceName} breached ${zone.name}!`,
  };

  if (zone.notificationVibration) {
    if (zone.type === 'critical') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (zone.type === 'caution') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Geofence Alert - ${zone.type.toUpperCase()}`,
      body: messages[eventType],
      data: { deviceName, zoneId: zone.id, eventType },
      sound: zone.notificationSound,
    },
    trigger: null,
  });
}

export async function sendDeviceOfflineNotification(
  deviceName: string,
  minutesOffline: number
): Promise<void> {
  if (!Notifications) return;

  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Device Offline',
      body: `${deviceName} hasn't updated its location for ${minutesOffline} minutes`,
      data: { deviceName, minutesOffline },
      sound: true,
    },
    trigger: null,
  });
}
