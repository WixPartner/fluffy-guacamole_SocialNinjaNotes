import { createTheme, alpha } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    gradient: {
      primary: string;
      hover: string;
    };
  }
  interface PaletteOptions {
    gradient?: {
      primary: string;
      hover: string;
    };
  }
}

export const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      light: '#849ef7',
      dark: '#5a6fd6'
    },
    secondary: {
      main: '#764ba2',
      light: '#8d5db8',
      dark: '#6a4494'
    },
    gradient: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      hover: 'linear-gradient(135deg, #5a6fd6 0%, #6a4494 100%)'
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '0.5rem 1.5rem',
          fontSize: '0.875rem',
          fontWeight: 500,
        },
        contained: {
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            backgroundImage: 'linear-gradient(135deg, #5a6fd6 0%, #6a4494 100%)',
          },
        },
        outlined: {
          borderColor: 'rgba(0, 0, 0, 0.1)',
          color: 'rgba(0, 0, 0, 0.6)',
          backgroundColor: alpha('#ffffff', 0.5),
          '&:hover': {
            backgroundColor: alpha('#ffffff', 0.8),
            borderColor: 'rgba(0, 0, 0, 0.2)'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: alpha('#ffffff', 0.5),
            '&:hover': {
              backgroundColor: alpha('#ffffff', 0.8),
            },
            '&.Mui-focused': {
              backgroundColor: alpha('#ffffff', 0.8),
            }
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backdropFilter: 'blur(20px)',
          backgroundColor: alpha('#ffffff', 0.8),
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backdropFilter: 'blur(20px)',
          backgroundColor: alpha('#ffffff', 0.8),
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha('#ffffff', 0.8),
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          color: 'rgba(0, 0, 0, 0.87)'
        }
      }
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#667eea',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline'
          }
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        standardError: {
          backgroundColor: alpha('#ef4444', 0.1),
          color: '#ef4444',
          border: '1px solid',
          borderColor: alpha('#ef4444', 0.2)
        },
        standardSuccess: {
          backgroundColor: alpha('#10b981', 0.1),
          color: '#10b981',
          border: '1px solid',
          borderColor: alpha('#10b981', 0.2)
        },
        standardWarning: {
          backgroundColor: alpha('#f59e0b', 0.1),
          color: '#f59e0b',
          border: '1px solid',
          borderColor: alpha('#f59e0b', 0.2)
        },
        standardInfo: {
          backgroundColor: alpha('#3b82f6', 0.1),
          color: '#3b82f6',
          border: '1px solid',
          borderColor: alpha('#3b82f6', 0.2)
        }
      }
    }
  }
}); 