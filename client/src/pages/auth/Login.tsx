import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  IconButton,
  InputAdornment,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAppDispatch } from '../../store/hooks';
import { login, githubAuth } from '../../store/slices/authSlice';
import { useSubscription } from '../../contexts/SubscriptionContext';
import GitHubLoginButton from '../../components/GitHubLoginButton';
import GoogleLoginButton from '../../components/GoogleLoginButton';

// Declare the google type
declare global {
  interface Window {
    google: any;
  }
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { status } = useSubscription();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Function to handle GitHub code in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      handleGithubAuth(code);
    }
  }, []);

  // Check for error in location state (from callbacks)
  useEffect(() => {
    const locationState = location.state as { error?: string } | null;
    if (locationState?.error) {
      setError(locationState.error);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(login({ email, password })).unwrap();
      
      // Check if user has a subscription plan
      if (!status?.tier || status.tier === 'free') {
        navigate('/plans');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleGithubAuth = async (code: string) => {
    try {
      await dispatch(githubAuth(code)).unwrap();
      
      // Check if user has a subscription plan
      if (!status?.tier || status.tier === 'free') {
        navigate('/plans');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'GitHub authentication failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("/pattern.svg")',
          backgroundSize: '800px 800px',
          opacity: 0.1,
          animation: 'shimmer 60s linear infinite',
          pointerEvents: 'none'
        }
      }}
    >
      <Box
        sx={{
          maxWidth: 440,
          width: '100%',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '32px',
          p: { xs: 2.5, sm: 5 },
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          position: 'relative',
          zIndex: 2,
          mx: 2
        }}
      >
        <Box sx={{ mb: { xs: 2, sm: 4 }, textAlign: 'right' }}>
          <Typography variant="body2" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
            Not a member?
            <Link 
              component={RouterLink} 
              to="/register" 
              sx={{ 
                color: '#6366f1',
                textDecoration: 'none',
                fontWeight: 600,
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                px: 2,
                py: 1,
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.15)'
                }
              }}
            >
              Register now
            </Link>
          </Typography>
        </Box>

        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            color: '#1e293b',
            mb: 1,
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}
        >
          Hello Again!
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            mb: { xs: 2, sm: 4 },
            color: 'rgba(71, 85, 105, 0.9)',
            fontWeight: 500,
            fontSize: '0.95rem'
          }}
        >
          Welcome back you've been missed!
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.16)',
              '& .MuiAlert-icon': {
                color: '#ef4444'
              }
            }}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            placeholder="Enter username"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              mb: { xs: 1.5, sm: 2 },
              '& .MuiOutlinedInput-root': {
                borderRadius: { xs: '12px', sm: '16px' },
                backgroundColor: '#f8fafc',
                '& fieldset': {
                  borderColor: 'transparent'
                },
                '&:hover fieldset': {
                  borderColor: '#e2e8f0'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#6366f1'
                },
                '& input': {
                  padding: { xs: '12px', sm: '16px' },
                  fontSize: { xs: '0.9rem', sm: '0.95rem' }
                }
              }
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            placeholder="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                backgroundColor: '#f8fafc',
                '& fieldset': {
                  borderColor: 'transparent'
                },
                '&:hover fieldset': {
                  borderColor: '#e2e8f0'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#6366f1'
                },
                '& input': {
                  padding: '16px',
                  fontSize: '0.95rem'
                }
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: '#94a3b8' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ textAlign: 'right', mb: { xs: 2, sm: 3 } }}>
            <Link 
              component={RouterLink} 
              to="/forgot-password"
              sx={{ 
                color: '#6366f1',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#4f46e5',
                  textDecoration: 'none'
                }
              }}
            >
              Recovery Password
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              py: 2,
              borderRadius: '16px',
              backgroundColor: '#6366f1',
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#4f46e5'
              }
            }}
          >
            Sign In
          </Button>

          <Box sx={{ my: { xs: 2, sm: 4 }, position: 'relative', textAlign: 'center' }}>
          <Typography 
              variant="body2" 
              sx={{ 
                color: '#94a3b8',
                fontSize: '0.85rem',
                position: 'relative',
                display: 'inline-block',
                px: 2,
                '&::before, &::after': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  width: { xs: '50px', sm: '80px', md: '100px' },
                  height: '1px',
                  backgroundColor: '#e2e8f0'
                },
                '&::before': {
                  right: '100%'
                },
                '&::after': {
                  left: '100%'
                }
              }}
            >
              Or continue with
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 } }}>
            <GitHubLoginButton onError={(errorMsg) => setError(errorMsg)} />
            <GoogleLoginButton onError={(errorMsg) => setError(errorMsg)} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login; 