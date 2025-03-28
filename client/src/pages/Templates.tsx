import { 
  Box, 
  Typography, 
  Container, 
  Paper,
  Button,
  useTheme,
  alpha,
  GlobalStyles,
  keyframes,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  RocketIcon,
  SparklesIcon,
  Calendar01Icon,
  Notebook01Icon,
  Layout01Icon,
  Briefcase01Icon,
  CheckmarkCircle01Icon
} from 'hugeicons-react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { subscribeToTemplateNotifications } from '../store/slices/uiSlice';
import { useAppDispatch } from '../store/hooks';

// Define animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 0.5; }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const Templates = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const notified = user?.templateSubscribed || false;

  const handleNotifyClick = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      await dispatch(subscribeToTemplateNotifications(user.email)).unwrap();
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Failed to subscribe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEmail('');
  };

  const upcomingTemplates = [
    {
      icon: <Calendar01Icon size={24} />,
      title: 'Project Planning',
      description: 'Streamline your project management with ready-to-use templates'
    },
    {
      icon: <Notebook01Icon size={24} />,
      title: 'Study Notes',
      description: 'Organize your learning materials effectively'
    },
    {
      icon: <Layout01Icon size={24} />,
      title: 'Content Creation',
      description: 'Create engaging content with structured templates'
    },
    {
      icon: <Briefcase01Icon size={24} />,
      title: 'Business Plans',
      description: 'Professional templates for business documentation'
    }
  ];

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: theme.palette.mode === 'light' 
          ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
          : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("/pattern.svg")',
          backgroundSize: '800px 800px',
          opacity: 0.05,
          zIndex: 0,
          animation: `${shimmer} 60s linear infinite`,
          pointerEvents: 'none'
        }
      }}
    >
      <GlobalStyles
        styles={{
          '@keyframes shimmer': {
            '0%': {
              backgroundPosition: '0px 0px',
            },
            '100%': {
              backgroundPosition: '800px 800px',
            },
          }
        }}
      />

      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%)',
          filter: 'blur(40px)',
          animation: `${float} 15s ease-in-out infinite`,
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, rgba(236, 72, 153, 0) 70%)',
          filter: 'blur(40px)',
          animation: `${float} 12s ease-in-out infinite alternate`,
          zIndex: 0
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Box 
            sx={{ 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
              mb: 3,
              borderRadius: '20px',
              background: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              animation: `${pulse} 3s ease-in-out infinite`
            }}
          >
            <RocketIcon size={32} />
          </Box>
          
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 800,
              color: theme.palette.mode === 'light' ? '#1e293b' : '#f8fafc',
              mb: 2,
              position: 'relative',
              display: 'inline-block',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80px',
                height: '4px',
                borderRadius: '2px',
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.3)})`
              }
            }}
          >
            Templates
          </Typography>

          <Typography
            variant="h5"
            sx={{
              mb: 2,
              color: theme.palette.primary.main,
              fontWeight: 600
            }}
          >
            Coming Soon
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              mb: 4,
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            We're crafting a collection of professional templates to help streamline your workflow. 
            Stay tuned for ready-to-use templates that will enhance your productivity.
          </Typography>

          <Button
            variant="contained"
            startIcon={notified ? <CheckmarkCircle01Icon size={20} /> : <SparklesIcon size={20} />}
            onClick={handleNotifyClick}
            disabled={!user || notified || loading}
            sx={{
              borderRadius: '20px',
              px: 4,
              py: 1.5,
              background: notified 
                ? theme.palette.success.main 
                : theme.palette.gradient?.primary,
              '&:hover': {
                background: notified 
                  ? theme.palette.success.dark 
                  : theme.palette.gradient?.hover
              }
            }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" sx={{ mx: 1 }} />
            ) : notified ? (
              "You'll Be Notified"
            ) : !user ? (
              'Sign in to Get Notified'
            ) : (
              'Notify Me When Available'
            )}
          </Button>
        </Box>

        {/* Upcoming Templates Preview */}
        <Box sx={{ mt: 8 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              textAlign: 'center', 
              mb: 4,
              fontWeight: 700,
              color: theme.palette.mode === 'light' ? '#1e293b' : '#f8fafc'
            }}
          >
            What's Coming
          </Typography>
          
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
              gap: 3
            }}
          >
            {upcomingTemplates.map((template, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: theme.palette.mode === 'light'
                    ? 'rgba(255, 255, 255, 0.8)'
                    : 'rgba(30, 41, 59, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`
                  }
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    mb: 2,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                    color: theme.palette.primary.main
                  }}
                >
                  {template.icon}
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 1,
                    fontWeight: 600,
                    color: theme.palette.mode === 'light' ? '#1e293b' : '#f8fafc'
                  }}
                >
                  {template.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {template.description}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Templates; 