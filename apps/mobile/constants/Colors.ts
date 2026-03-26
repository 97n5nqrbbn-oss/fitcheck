/**
 * FitCheck design system colors
 * Dark theme only — fashion-forward purple/violet palette
 */
export const Colors = {
  // Brand
  primary: '#6c63ff',
  primaryLight: '#8b85ff',
  primaryDark: '#4c45cc',
  accent: '#a78bfa',
  accentLight: '#c4b5fd',
  // Backgrounds
  background: '#0a0a0f',
  backgroundPrimary: '#0a0a0f', // alias
  surface: '#111118',
  surfaceElevated: '#1a1a2e',
  surfaceHighlight: '#2d1b69',
  card: '#16162a',
  // Text
  text: '#f1f5f9',
  textPrimary: '#f1f5f9', // alias
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  textDisabled: '#475569',
  // Borders
  border: '#1e293b',
  borderLight: '#2d3748',
  divider: '#0f172a',
  // Semantic
  success: '#22c55e',
  successBg: '#052e16',
  warning: '#f59e0b',
  warningBg: '#1c1206',
  error: '#ef4444',
  errorBg: '#1c0707',
  info: '#3b82f6',
  infoBg: '#0c1b3a',
  // Score tiers
  scoreExcellent: '#22c55e',
  scoreGood: '#84cc16',
  scoreDecent: '#f59e0b',
  scorePoor: '#ef4444',
  // Gradients (start, end)
  gradientPrimary: ['#6c63ff', '#a855f7'] as const,
  gradientDark: ['#0a0a0f', '#111118'] as const,
  gradientCard: ['#1a1a2e', '#111118'] as const,
  // Tab bar
  tabBarBackground: '#0d0d1a',
  tabBarActive: '#a78bfa',
  tabBarInactive: '#475569',
  tabBarBorder: '#1a1a2e',
  // Misc
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
  shimmer: '#1e1e3a',
  transparent: 'transparent',
  white: '#ffffff',
  black: '#000000',
} as const;

export type ColorKey = keyof typeof Colors;
export default Colors;
