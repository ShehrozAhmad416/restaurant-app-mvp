// One theme file with both palettes (Question 6).
// Brand colours: sky blue, white and light green.
// Text/background pairs are chosen for at least 4.5:1 contrast.

export const lightColors = {
  background: '#F4FAFF',
  card: '#FFFFFF',
  text: '#0F2A3D',
  muted: '#4B6478',
  border: '#D6E9F5',
  chip: '#EAF6FD',
  primary: '#0369A1', // sky blue, dark enough for white text
  primarySoft: '#E0F2FE', // pale sky
  onPrimary: '#FFFFFF',
  accent: '#38BDF8', // bright sky for decoration only
  success: '#15803D',
  successSoft: '#DCFCE7', // light green
  onSuccess: '#FFFFFF',
  warning: '#92400E',
  warningSoft: '#FEF3C7',
  danger: '#B91C1C',
  dangerSoft: '#FEE2E2',
  disabled: '#C9D9E4',
  overlay: 'rgba(15, 42, 61, 0.45)',
};

export const darkColors = {
  background: '#0B1A26',
  card: '#122536',
  text: '#E6F4FF',
  muted: '#9DB6C8',
  border: '#22384A',
  chip: '#17304A',
  primary: '#38BDF8',
  primarySoft: '#0E3350',
  onPrimary: '#062033',
  accent: '#7DD3FC',
  success: '#86EFAC',
  successSoft: '#123524',
  onSuccess: '#052E16',
  warning: '#FCD34D',
  warningSoft: '#3A2E10',
  danger: '#FCA5A5',
  dangerSoft: '#3B1616',
  disabled: '#2C4356',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };
export const font = { small: 12, body: 15, title: 18, heading: 24, display: 30 };
