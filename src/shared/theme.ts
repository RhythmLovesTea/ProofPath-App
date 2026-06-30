// ProofPath design tokens — refreshed visual system

export const Colors = {
  primary: '#1A56DB',
  secondary: '#7E3AF2',
  primaryOnDark: '#ffffff',

  ink: '#111928',
  inkMuted80: '#374151',
  inkMuted48: '#6B7280',

  canvas: '#FFFFFF',
  canvasParchment: '#F9FAFB',
  surfacePearl: '#FFFFFF',
  surfaceTile1: '#111928',
  surfaceBlack: '#111928',
  surfaceChipTranslucent: '#E5E7EB',

  onPrimary: '#ffffff',
  onDark: '#ffffff',
  bodyMuted: '#6B7280',

  hairline: '#E5E7EB',
  dividerSoft: '#E5E7EB',

  success: '#057A55',
  successBg: '#D1FAE5',
  warning: '#C27803',
  warningBg: '#FEF3C7',
  error: '#E02424',
  errorBg: '#FEE2E2',

  badgeGold: '#C27803',
  badgeGoldBg: '#FEF3C7',
  badgeBlue: '#1A56DB',
  badgeBlueBg: '#DBEAFE',
  badgeGreen: '#057A55',
  badgeGreenBg: '#D1FAE5',
};

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 17,
  lg: 24,
  xl: 32,
  xxl: 48,
  section: 80,
};

export const Radii = {
  none: 0,
  xs: 5,
  sm: 8,
  md: 12,
  lg: 16,
  pill: 9999,
  full: 9999,
};

export const Typography = {
  screenTitle: { fontSize: 24, fontWeight: '700' as const, color: Colors.ink },
  heroName: { fontSize: 28, fontWeight: '700' as const, color: Colors.onPrimary },
  cardTitle: { fontSize: 18, fontWeight: '600' as const, color: Colors.ink },
  bodyStrong: { fontSize: 14, fontWeight: '600' as const, color: Colors.inkMuted80 },
  body: { fontSize: 14, fontWeight: '400' as const, color: Colors.inkMuted80 },
  captionStrong: { fontSize: 12, fontWeight: '600' as const, color: Colors.inkMuted48 },
  caption: { fontSize: 12, fontWeight: '400' as const, color: Colors.inkMuted48 },
  finePrint: { fontSize: 12, fontWeight: '400' as const, color: Colors.inkMuted48 },
  // Backward-compatible aliases for existing screens
  displayLg: { fontSize: 28, fontWeight: '700' as const, color: Colors.ink },
  displayMd: { fontSize: 22, fontWeight: '700' as const, color: Colors.ink },
  tagline: { fontSize: 17, fontWeight: '600' as const, color: Colors.ink },
};
