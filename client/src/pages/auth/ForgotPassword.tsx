import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert
} from '@mui/material';
import { api } from '../../api/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/forgot-password', { email });
      setStatus({
        type: 'success',
        message: 'Password reset instructions have been sent to your email.'
      });
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'An error occurred'
      });
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
          p: { xs: 3, sm: 5 },
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          position: 'relative',
          zIndex: 2,
          mx: 2
        }}
      >
        <Box sx={{ mb: 4, textAlign: 'right' }}>
          <Typography variant="body2" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
            Remember your password?
            <Link 
              component={RouterLink} 
              to="/login" 
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
              Sign in
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
            fontSize: { xs: '1.75rem', sm: '2rem' }
          }}
        >
          Forgot Password?
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 4,
            color: 'rgba(71, 85, 105, 0.9)',
            fontWeight: 500,
            fontSize: '0.95rem'
          }}
        >
          No worries! Enter your email and we'll send you reset instructions.
        </Typography>

        {status && (
          <Alert 
            severity={status.type}
            sx={{ 
              mb: 3,
              borderRadius: '12px',
              backgroundColor: status.type === 'success' 
                ? 'rgba(34, 197, 94, 0.08)'
                : 'rgba(239, 68, 68, 0.08)',
              color: status.type === 'success' ? '#22c55e' : '#ef4444',
              border: `1px solid ${status.type === 'success' 
                ? 'rgba(34, 197, 94, 0.16)'
                : 'rgba(239, 68, 68, 0.16)'}`,
              '& .MuiAlert-icon': {
                color: status.type === 'success' ? '#22c55e' : '#ef4444'
              }
            }}
          >
            {status.message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            placeholder="Enter your email"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              mb: 3,
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
          />

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
            Send Reset Instructions
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotPassword; 