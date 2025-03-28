import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAppDispatch } from '../../store/hooks';
import { register } from '../../store/slices/authSlice';
import GitHubLoginButton from '../../components/GitHubLoginButton';
import GoogleLoginButton from '../../components/GoogleLoginButton';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password: string) => {
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*]/.test(password)) return 'Password must contain at least one special character (!@#$%^&*)';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Password validation
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Confirm password check
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await dispatch(register({ name, email, password })).unwrap();
      setSuccess('Registration successful! Please check your email to verify your account.');
      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '93vh',
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
        <Box sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'right' }}>
          <Typography variant="body2" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
            Already have an account?
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
            mb: 0.5,
            fontSize: { xs: '1.75rem', sm: '2rem' }
          }}
        >
          Create Account
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            mb: { xs: 2, sm: 3 },
            color: 'rgba(71, 85, 105, 0.9)',
            fontWeight: 500,
            fontSize: '0.95rem'
          }}
        >
          Join us today! Please enter your details.
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
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

        {success && (
          <Alert 
            severity="success"
            sx={{ 
              mb: 2,
              borderRadius: '12px',
              backgroundColor: 'rgba(34, 197, 94, 0.08)',
              color: '#22c55e',
              border: '1px solid rgba(34, 197, 94, 0.16)',
              '& .MuiAlert-icon': {
                color: '#22c55e'
              }
            }}
          >
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            placeholder="Full name"
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{
              mb: 1.5,
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
                  padding: { xs: '12px', sm: '14px' },
                  fontSize: '0.95rem'
                }
              }
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            placeholder="Email address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              mb: 1.5,
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
                  padding: { xs: '12px', sm: '14px' },
                  fontSize: '0.95rem'
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              mb: 1.5,
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
                  padding: { xs: '12px', sm: '14px' },
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

          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            placeholder="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
                  padding: { xs: '12px', sm: '14px' },
                  fontSize: '0.95rem'
                }
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    sx={{ color: '#94a3b8' }}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              py: { xs: 1.5, sm: 2 },
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
            Create Account
          </Button>

          <Box sx={{ my: { xs: 1.5, sm: 2 }, position: 'relative', textAlign: 'center' }}>
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

export default Register; 