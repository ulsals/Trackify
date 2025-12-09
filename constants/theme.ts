/**
 * Monochrome color scheme for Trackify
 * Soft and minimalist design with grayscale palette
 */

import { Platform } from 'react-native';

const tintColorLight = '#4a4a4a';
const tintColorDark = '#e0e0e0';

export const Colors = {
  light: {
    text: '#1a1a1a',
    textSecondary: '#6b6b6b',
    background: '#ffffff',
    backgroundSecondary: '#f5f5f5',
    tint: tintColorLight,
    icon: '#6b6b6b',
    tabIconDefault: '#9e9e9e',
    tabIconSelected: tintColorLight,
    border: '#e0e0e0',
    card: '#fafafa',
    // Status colors
    online: '#4caf50',
    offline: '#9e9e9e',
    // Geofence zone colors
    zoneSafe: '#4caf50',
    zoneWarning: '#ffc107',
    zoneCaution: '#ff9800',
    zoneCritical: '#f44336',
    // Battery colors
    batteryGood: '#4caf50',
    batteryMedium: '#ffc107',
    batteryLow: '#f44336',
    // Historical trail
    historicalPath: '#2196f3',
    lastKnownLocation: '#f44336',
  },
  dark: {
    text: '#e0e0e0',
    textSecondary: '#9e9e9e',
    background: '#121212',
    backgroundSecondary: '#1e1e1e',
    tint: tintColorDark,
    icon: '#9e9e9e',
    tabIconDefault: '#6b6b6b',
    tabIconSelected: tintColorDark,
    border: '#2a2a2a',
    card: '#1e1e1e',
    // Status colors
    online: '#66bb6a',
    offline: '#757575',
    // Geofence zone colors
    zoneSafe: '#66bb6a',
    zoneWarning: '#ffca28',
    zoneCaution: '#ffa726',
    zoneCritical: '#ef5350',
    // Battery colors
    batteryGood: '#66bb6a',
    batteryMedium: '#ffca28',
    batteryLow: '#ef5350',
    // Historical trail
    historicalPath: '#42a5f5',
    lastKnownLocation: '#ef5350',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
