import { createTheme } from '@mui/material/styles';

const display = "'Fraunces', Georgia, serif";
const body = "'DM Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1F1B16', contrastText: '#FBF8F2' },
    secondary: { main: '#85586F', dark: '#6B4459', contrastText: '#FBF8F2' },
    background: { default: '#FBF8F2', paper: '#FFFFFF' },
    text: { primary: '#1F1B16', secondary: '#6B635A' },
    divider: '#E3DCCD',
  },
  shape: { borderRadius: 6 },
  typography: {
    fontFamily: body,
    h1: { fontFamily: display, fontWeight: 600, letterSpacing: '-0.02em' },
    h2: { fontFamily: display, fontWeight: 600, letterSpacing: '-0.02em' },
    h3: { fontFamily: display, fontWeight: 600, letterSpacing: '-0.015em' },
    h4: { fontFamily: display, fontWeight: 600 },
    h5: { fontFamily: display, fontWeight: 600 },
    h6: { fontFamily: display, fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
  },
});

export default theme;
