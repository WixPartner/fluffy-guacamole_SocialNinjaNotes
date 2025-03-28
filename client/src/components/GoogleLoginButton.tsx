import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAppDispatch } from '../store/hooks';
import { googleAuth } from '../store/slices/authSlice';
import { useSubscription } from '../contexts/SubscriptionContext';

interface GoogleLoginButtonProps {
  onError?: (error: string) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onError }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { status } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleLogin = () => {
    if (isLoading) return; // Prevent multiple clicks
    
    try {
      setIsLoading(true);
      
      // Create a more reliable state parameter with timestamp to ensure uniqueness
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const state = `${randomString}_${timestamp}`;
      
      // Store state in sessionStorage to verify when Google redirects back
      sessionStorage.setItem('googleOAuthState', state);
      
      // IMPORTANT: This must match exactly what's registered in Google OAuth app settings
      const redirectUri = `${window.location.origin}/google-callback`;
      
      // Use the Google Client ID from environment variable
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '986409310375-5dpf0ging3qir2rqr6cpkrcivm45ggpo.apps.googleusercontent.com';
      
      // Construct the Google authorization URL
      const scope = encodeURIComponent('email profile');
      const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}&access_type=offline&prompt=select_account`;
      
      // Redirect to Google
      window.location.href = url;
    } catch (error) {
      console.error('Google login error:', error);
      setIsLoading(false);
      if (onError) onError('Failed to initiate Google login');
    }
  };

  return (
    <Button
      fullWidth
      variant="outlined"
      startIcon={
        isLoading ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          <GoogleIcon sx={{ fontSize: 20, color: '#64748b' }} />
        )
      }
      onClick={handleLogin}
      disabled={isLoading}
      sx={{
        py: 1.5,
        borderRadius: '16px',
        borderColor: '#e2e8f0',
        color: '#64748b',
        backgroundColor: '#f8fafc',
        textTransform: 'none',
        fontSize: '0.85rem',
        fontWeight: 500,
        transition: 'all 0.2s ease',
        display: 'flex',
        '& .MuiButton-startIcon': {
          mr: { xs: 0, sm: 1 },
          marginLeft: { xs: 0, sm: -0.5 }
        },
        '& .MuiButton-endIcon': {
          display: { xs: 'none', sm: 'inherit' }
        },
        '&:hover': {
          backgroundColor: '#f1f5f9',
          borderColor: '#cbd5e1'
        }
      }}
    >
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Google</Box>
    </Button>
  );
};

export default GoogleLoginButton; 