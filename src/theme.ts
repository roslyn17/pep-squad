// Design tokens from CLAUDE.md > Design. Screens should use these, not raw values.

export const colors = {
  background: '#FBF6EE', // warm cream
  surface: '#FFFFFF', // cards, inputs, tab bar
  border: '#E8DFD3',
  text: '#1F1B16',
  textSecondary: '#6B6259',
  accent: '#C2410C', // tomato orange: primary buttons, active tab
  onAccent: '#FFFFFF', // text and icons on orange
  gold: '#F4C56A', // accents on dark surfaces
  dark: '#1F1B16', // reaction screen, featured card
  darkRaised: '#34302A', // cards and buttons on dark screens
  textOnDark: '#FBF6EE',
  textOnDarkSecondary: '#CFC6BA',
};

export const fonts = {
  heading: 'BricolageGrotesque_800ExtraBold',
  headingBold: 'BricolageGrotesque_700Bold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
};

export const radius = {
  card: 20,
  pill: 999,
};

export const spacing = {
  screen: 20, // horizontal padding on every screen
};

// Minimum touch target size from the design rules.
export const minTouchSize = 44;
