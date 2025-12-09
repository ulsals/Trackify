import * as Battery from 'expo-battery';

export interface BatteryStatus {
  level: number; // 0-1
  state: Battery.BatteryState;
  isLowPowerMode: boolean;
}

export async function getBatteryStatus(): Promise<BatteryStatus> {
  const level = await Battery.getBatteryLevelAsync();
  const state = await Battery.getBatteryStateAsync();
  const isLowPowerMode = await Battery.isLowPowerModeEnabledAsync();

  return { level, state, isLowPowerMode };
}

/**
 * Calculate optimal tracking interval based on battery level
 */
export function getOptimalTrackingInterval(
  batteryLevel: number,
  batterySaverMode: boolean
): number {
  if (batterySaverMode) {
    if (batteryLevel > 0.5) return 30; // 30 seconds
    if (batteryLevel > 0.2) return 60; // 1 minute
    return 120; // 2 minutes
  }

  // Normal mode
  if (batteryLevel > 0.5) return 10; // 10 seconds
  if (batteryLevel > 0.2) return 30; // 30 seconds
  return 60; // 1 minute
}

/**
 * Get battery color based on level
 */
export function getBatteryColor(level: number, colors: any): string {
  if (level > 0.5) return colors.batteryGood;
  if (level > 0.2) return colors.batteryMedium;
  return colors.batteryLow;
}

/**
 * Format battery level for display
 */
export function formatBatteryLevel(level: number): string {
  return `${Math.round(level * 100)}%`;
}
