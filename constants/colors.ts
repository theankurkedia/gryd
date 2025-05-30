/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';
const defaultDarkCell = '#151B23';

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
  green: '#56D364',
  red: '#f94144',
  orange: '#f8961e',
  lightOrange: '#f9844a',
  yellow: '#eeef20',
  cyan: '#06B6D4',
  purple: '#e0aaff',
  violet: '#8B5CF6',
  gitlab: '#4e65cd',
  pink: '#EC4899',
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
export const withOpacity = (hex: string, opacity: number): string => {
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
export const getContributionColor = (
  baseColor: string,
  currentFrequency: number,
  maxFrequency: number
): string => {
  // If no frequency, return the lightest version
  if (currentFrequency === 0) {
    return defaultDarkCell;
  }

  // If maxFrequency is 1, we only need two states
  if (maxFrequency === 1) {
    return currentFrequency === 1 ? baseColor : withOpacity(baseColor, 0.2);
  }

  // Calculate which level (1-5) the current frequency falls into
  const numLevels = Math.min(5, maxFrequency);
  const stepSize = maxFrequency / numLevels;

  // Determine which level (1-based) the current frequency belongs to
  const level = Math.min(Math.ceil(currentFrequency / stepSize), numLevels);

  // Map level to opacity (0.2 to 1.0 across 5 levels)
  const opacityLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
  const opacity = opacityLevels[level - 1];

  return withOpacity(baseColor, opacity);
};
