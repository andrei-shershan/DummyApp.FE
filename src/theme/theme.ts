import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#475569',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#60a5fa',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#334155',
      secondary: '#64748b',
    },
    action: {
      hover: '#e2e8f0',
      selected: '#dbeafe',
    },
  },
  typography: {
    fontFamily: ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
    h1: { fontWeight: 700, color: '#2563eb' },
    h2: { fontWeight: 700, color: '#2563eb' },
    h3: { fontWeight: 700, color: '#2563eb' },
    h4: { fontWeight: 700, color: '#2563eb' },
    h5: { fontWeight: 700, color: '#2563eb' },
    h6: { fontWeight: 700, color: '#2563eb' },
    body1: { color: '#334155' },
    body2: { color: '#64748b' },
  },
  shape: {
    borderRadius: 0,
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        color: 'inherit',
      },
      styleOverrides: {
        root: {
          backgroundColor: '#eef2ff',
          color: '#0f172a',
          boxShadow: 'none',
          borderBottom: '1px solid #cbd5e1',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#f8fafc',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
          border: '1px solid #e2e8f0',
          borderRadius: 0,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        color: 'secondary',
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 0,
          minHeight: 40,
        },
        containedSecondary: {
          backgroundColor: '#2563eb',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#1d4ed8',
          },
        },
        outlinedSecondary: {
          borderColor: '#93c5fd',
          color: '#2563eb',
          '&:hover': {
            backgroundColor: '#eff6ff',
          },
        },
        textSecondary: {
          color: '#2563eb',
        },
      },
    },
  },
});

export default theme;
