import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Paper, 
  alpha,
  useTheme
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useAppDispatch } from '../../store/hooks';
import { googleAuth } from '../../store/slices/authSlice';
import { useSubscription } from '../../contexts/SubscriptionContext';

const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { status } = useSubscription();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const processedCode = useRef<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    // Create a function to process the Google auth
    const processGoogleAuth = async () => {
      // Get the code from URL parameters
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      
      // If no code or already processing, don't proceed
      if (!code || isProcessing) return;
      
      // Check if this code has already been processed
      if (processedCode.current === code) {
        console.log('This code has already been processed, skipping');
        return;
      }
      
      try {
        setIsProcessing(true);
        // Mark this code as being processed
        processedCode.current = code;
        
        // Verify state to prevent CSRF attacks - use sessionStorage
        const savedState = sessionStorage.getItem('googleOAuthState');
        
        // Clean up the state after retrieving it
        sessionStorage.removeItem('googleOAuthState');
        
        // Skip state verification in development for easier testing
        if (process.env.NODE_ENV !== 'development' && state !== savedState) {
          throw new Error('Invalid state parameter. Authentication attempt may have been compromised.');
        }
        
        // Dispatch the Google auth action
        await dispatch(googleAuth(code)).unwrap();
        
        // Navigate based on subscription status
        if (!status?.tier || status.tier === 'free') {
          navigate('/plans');
        } else {
          navigate('/dashboard');
        }
      } catch (err: any) {
        console.error('Google authentication error:', err);
        setError(err.message || 'Failed to authenticate with Google');
        
        // Navigate back to login after a delay
        setTimeout(() => {
          navigate('/login', { 
            state: { error: err.message || 'Google authentication failed' }
          });
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };
    
    processGoogleAuth();
    
    // Cleanup function to abort any pending requests if component unmounts
    return () => {
      // Nothing to clean up with the current implementation
      // But this is a good place to add cleanup if needed in the future
    };
  }, [dispatch, navigate, status, isProcessing]);

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          p: 3,
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
        <Paper
          elevation={4}
          sx={{
            maxWidth: 440,
            width: '100%',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '32px',
            p: { xs: 3, sm: 5 },
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            textAlign: 'center'
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}
          >
            <ErrorOutlineIcon 
              color="error" 
              sx={{ fontSize: 40 }}
            />
          </Box>
          <Typography 
            variant="h5" 
            color="error.main" 
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            Authentication Error
          </Typography>
          <Typography 
            variant="body1"
            sx={{ 
              mb: 3,
              color: 'text.secondary',
              fontWeight: 500
            }}
          >
            {error}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 2,
              color: 'text.secondary',
              fontWeight: 500,
              fontSize: '0.85rem',
              opacity: 0.8
            }}
          >
            Redirecting back to login page...
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        p: 3,
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
      <Paper
        elevation={4}
        sx={{
          maxWidth: 440,
          width: '100%',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '32px',
          p: { xs: 3, sm: 5 },
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          textAlign: 'center'
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: alpha('#333', 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}
        >
          <GoogleIcon 
            sx={{ 
              fontSize: 40,
              color: '#333'
            }}
          />
        </Box>
        
        <CircularProgress 
          size={60} 
          thickness={4} 
          sx={{ 
            mb: 3,
            color: '#6366f1'
          }} 
        />
        
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            color: '#1e293b'
          }}
        >
          Authenticating with Google
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'rgba(71, 85, 105, 0.9)',
            fontWeight: 500
          }}
        >
          Please wait while we complete the process...
        </Typography>
        
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#6366f1',
              animation: 'pulse 1.5s infinite ease-in-out',
              '@keyframes pulse': {
                '0%': { transform: 'scale(0.8)', opacity: 0.5 },
                '50%': { transform: 'scale(1)', opacity: 1 },
                '100%': { transform: 'scale(0.8)', opacity: 0.5 },
              }
            }}
          />
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#6366f1',
              animation: 'pulse 1.5s infinite ease-in-out 0.3s',
            }}
          />
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#6366f1',
              animation: 'pulse 1.5s infinite ease-in-out 0.6s',
            }}
          />
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#6366f1',
              animation: 'pulse 1.5s infinite ease-in-out 0.9s',
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default GoogleCallback; 