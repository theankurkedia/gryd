/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// Store only the base colors
export const COLORS_PALETTE: Record<string, string> = {
  green: '#39D353',
  red: '#f94144',
  orange: '#f8961e',
  lightOrange: '#f9844a',
  yellow: '#eeef20',
  cyan: '#06B6D4',
  blue: '#168aad',
  purple: '#e0aaff',
  violet: '#8B5CF6',
  pink: '#EC4899',
  darkGreen: '#1b4332',
  teal: '#43aa8b',
  lightGreen: '#66BB6A',
  navy: '#277da1',
  slate: '#577590',
  gray: '#687076',
  white: '#FFFFFF',
};

/**
 * Converts a hex color to RGB values
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error('Invalid hex color');
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
};

/**
 * Generates a color variant with the specified opacity
 */
const withOpacity = (hex: string, opacity: number): string => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Gets the appropriate color variant based on current frequency and max frequency
 * @param baseColor The base color from COLORS_PALETTE
 * @param currentFrequency Current frequency of completion
 * @param maxFrequency Maximum possible frequency
 * @returns The appropriate color variant
 */
export const getColorVariant = (
  baseColor: string,
  currentFrequency: number,
  maxFrequency: number
): string => {
  if (maxFrequency <= 0) throw new Error('maxFrequency must be greater than 0');
  if (currentFrequency < 0)
    throw new Error('currentFrequency cannot be negative');
  if (currentFrequency > maxFrequency)
    throw new Error('currentFrequency cannot be greater than maxFrequency');

  // If maxFrequency is 1, we only need two states
  if (maxFrequency === 1) {
    return currentFrequency === 1 ? baseColor : withOpacity(baseColor, 0.2);
  }

  // Calculate opacity based on the ratio of current frequency to max frequency
  // This creates a smooth gradient from dim (0.2) to full (1.0)
  const opacity = 0.2 + (currentFrequency / maxFrequency) * 0.8;
  return withOpacity(baseColor, opacity);
};
