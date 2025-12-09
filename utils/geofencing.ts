import { GeofenceZone } from '@/types/models';
import { calculateDistance } from './distance';

export interface GeofenceStatus {
  zone: GeofenceZone;
  distance: number;
  isInside: boolean;
}

/**
 * Check if a point is inside a geofence zone
 */
export function isInsideGeofence(
  latitude: number,
  longitude: number,
  zone: GeofenceZone
): boolean {
  const distance = calculateDistance(
    latitude,
    longitude,
    zone.latitude,
    zone.longitude
  );
  return distance <= zone.radius;
}

/**
 * Get status for all zones of a device
 */
export function checkAllGeofences(
  latitude: number,
  longitude: number,
  zones: GeofenceZone[]
): GeofenceStatus[] {
  return zones.map((zone) => {
    const distance = calculateDistance(
      latitude,
      longitude,
      zone.latitude,
      zone.longitude
    );
    return {
      zone,
      distance,
      isInside: distance <= zone.radius,
    };
  });
}

/**
 * Get the highest priority zone that is breached
 */
export function getHighestPriorityBreach(
  statuses: GeofenceStatus[]
): GeofenceStatus | null {
  const priorityOrder = ['critical', 'caution', 'warning', 'safe'];
  
  const breached = statuses.filter(s => !s.isInside && s.zone.enabled);
  if (breached.length === 0) return null;

  breached.sort((a, b) => {
    return priorityOrder.indexOf(a.zone.type) - priorityOrder.indexOf(b.zone.type);
  });

  return breached[0];
}
