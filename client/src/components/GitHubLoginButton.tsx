import React, { useState } from 'react';
import { Button, Box, CircularProgress } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

interface GitHubLoginButtonProps {
  onError?: (error: string) => void;
}

const GitHubLoginButton: React.FC<GitHubLoginButtonProps> = ({ onError }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (isLoading) return; // Prevent multiple clicks
    
    try {
      setIsLoading(true);
      
      // Create a more reliable state parameter with timestamp to ensure uniqueness
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const state = `${randomString}_${timestamp}`;
      
      // Store state in sessionStorage to verify when GitHub redirects back
      sessionStorage.setItem('githubOAuthState', state);
      
      // IMPORTANT: This must match exactly what's registered in GitHub OAuth app settings
      // The exact URL registered in GitHub should be: http://localhost:3000/github-callback
      const redirectUri = 'http://localhost:3000/github-callback';
      const scope = encodeURIComponent('user:email read:user');
      
      // Use the GitHub Client ID from environment variable or fallback to the hardcoded value
      // This must match exactly what's registered in GitHub
      const clientId = 'Ov23lit49x8Zq6zXgd7i';
      
      // Construct the GitHub authorization URL with properly encoded redirect URI
      const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
      
      // Redirect to GitHub
      window.location.href = url;
    } catch (error) {
      console.error('GitHub login error:', error);
      setIsLoading(false);
      if (onError) onError('Failed to initiate GitHub login');
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
          <GitHubIcon sx={{ fontSize: 20 }} />
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
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>GitHub</Box>
    </Button>
  );
};

export default GitHubLoginButton; 