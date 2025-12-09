import { LocationHistoryPoint } from '@/types/models';

const MAX_HISTORY_POINTS = 1000;

/**
 * Add a location point to history and manage cleanup
 */
export function addLocationToHistory(
  history: LocationHistoryPoint[],
  newPoint: LocationHistoryPoint
): LocationHistoryPoint[] {
  const updated = [...history, newPoint];
  
  // Keep only the most recent points
  if (updated.length > MAX_HISTORY_POINTS) {
    return updated.slice(updated.length - MAX_HISTORY_POINTS);
  }
  
  return updated;
}

/**
 * Clean up old history based on retention days
 */
export function cleanupOldHistory(
  history: LocationHistoryPoint[],
  retentionDays: number
): LocationHistoryPoint[] {
  const cutoffTime = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  return history.filter(point => point.timestamp > cutoffTime);
}

/**
 * Filter history by date range
 */
export function filterHistoryByDateRange(
  history: LocationHistoryPoint[],
  startDate: number,
  endDate: number
): LocationHistoryPoint[] {
  return history.filter(
    point => point.timestamp >= startDate && point.timestamp <= endDate
  );
}

/**
 * Calculate total distance traveled in history
 */
export function calculateTotalDistance(history: LocationHistoryPoint[]): number {
  if (history.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1];
    const curr = history[i];
    
    // Haversine formula
    const R = 6371e3;
    const φ1 = (prev.latitude * Math.PI) / 180;
    const φ2 = (curr.latitude * Math.PI) / 180;
    const Δφ = ((curr.latitude - prev.latitude) * Math.PI) / 180;
    const Δλ = ((curr.longitude - prev.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    totalDistance += R * c;
  }

  return totalDistance;
}

/**
 * Get storage size estimate for history in bytes
 */
export function estimateHistoryStorageSize(history: LocationHistoryPoint[]): number {
  return JSON.stringify(history).length;
}

/**
 * Format storage size for display
 */
export function formatStorageSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
