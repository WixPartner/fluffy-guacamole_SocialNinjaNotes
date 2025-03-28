import React, { useEffect, useRef } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Alert,
  Link,
  AlertColor
} from '@mui/material';
import { api } from '../../api/axios';

const VerifyEmail = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = React.useState<AlertColor>('info');
  const [message, setMessage] = React.useState('Please wait while we verify your email...');
  const verificationAttemptedRef = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      if (verificationAttemptedRef.current) {
        return;
      }

      try {
        verificationAttemptedRef.current = true;
        const response = await api.get(`/auth/verify/${token}`);
        setStatus(response.data.success ? 'success' : 'error');
        setMessage(response.data.message);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Email verification failed');
      }
    };

    verifyEmail();
  }, [token]);

  if (!token) {
    return (
      <Alert severity="error">Invalid verification link</Alert>
    );
  }

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
          p: { xs: 3, sm: 5 },
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          position: 'relative',
          zIndex: 2,
          mx: 2,
          textAlign: 'center'
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            color: '#1e293b',
            mb: 3,
            fontSize: { xs: '1.75rem', sm: '2rem' }
          }}
        >
          Email Verification
        </Typography>

        <Alert 
          severity={status}
          sx={{ 
            mb: 4,
            borderRadius: '12px',
            backgroundColor: status === 'success' 
              ? 'rgba(34, 197, 94, 0.08)'
              : 'rgba(239, 68, 68, 0.08)',
            color: status === 'success' ? '#22c55e' : '#ef4444',
            border: `1px solid ${status === 'success' 
              ? 'rgba(34, 197, 94, 0.16)'
              : 'rgba(239, 68, 68, 0.16)'}`,
            '& .MuiAlert-icon': {
              color: status === 'success' ? '#22c55e' : '#ef4444'
            }
          }}
        >
          {message}
        </Alert>

        <Link 
          component={RouterLink} 
          to="/login" 
          sx={{ 
            color: '#6366f1',
            textDecoration: 'none',
            fontWeight: 600,
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            px: 3,
            py: 1.5,
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(99, 102, 241, 0.15)'
            }
          }}
        >
          Go to Login
        </Link>
      </Box>
    </Box>
  );
};

export default VerifyEmail; 