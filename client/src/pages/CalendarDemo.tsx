import { Box, Typography, Paper, Button, Avatar, useTheme } from '@mui/material';
import { Clock01Icon, Calendar01Icon, ArrowRight01Icon } from 'hugeicons-react';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    gapi: any;
  }
}

const CalendarDemo = () => {
  const theme = useTheme();
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

  useEffect(() => {
    const initializeGoogleAPI = async () => {
      try {
        await new Promise((resolve) => {
          window.gapi.load('client:auth2', resolve);
        });

        await window.gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: [DISCOVERY_DOC],
          scope: SCOPES,
        });

        setIsInitialized(true);
      } catch (err) {
        console.error('Error initializing Google API:', err);
        setError('Failed to initialize Google Calendar. Please try again.');
      }
    };

    initializeGoogleAPI();
  }, [API_KEY, CLIENT_ID]);

  const handleSignIn = async () => {
    try {
      if (!isInitialized) {
        throw new Error('Google API not initialized');
      }

      const googleAuth = window.gapi.auth2.getAuthInstance();
      await googleAuth.signIn();
      
      // After successful sign in, you can fetch calendar events here
      console.log('Successfully signed in');
      setError(null);
    } catch (err) {
      console.error('Error signing in:', err);
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  // Mock calendar events
  const mockEvents = [
    {
      id: 1,
      summary: "Team Weekly Meeting",
      start: { dateTime: "2024-01-04T10:00:00" },
      end: { dateTime: "2024-01-04T11:00:00" },
      attendees: ["john@example.com", "sarah@example.com"],
      location: "Google Meet"
    },
    {
      id: 2,
      summary: "Project Review",
      start: { dateTime: "2024-01-04T14:00:00" },
      end: { dateTime: "2024-01-04T15:00:00" },
      attendees: ["mike@example.com"],
      location: "Office Room 2"
    },
    {
      id: 3,
      summary: "Client Presentation",
      start: { dateTime: "2024-01-05T09:30:00" },
      end: { dateTime: "2024-01-05T10:30:00" },
      attendees: ["client@company.com", "manager@example.com"],
      location: "Zoom Meeting"
    }
  ];

  return (
    <Box 
      sx={{ 
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: 1200,
        mx: 'auto',
        minHeight: '100vh',
        background: theme.palette.mode === 'light' 
          ? 'linear-gradient(180deg, #F9FAFB 0%, #F3F4F6 100%)'
          : 'linear-gradient(180deg, #111827 0%, #1F2937 100%)'
      }}
    >
      {/* Header */}
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 4, 
          fontWeight: 700,
          background: 'linear-gradient(45deg, #6366F1 30%, #8B5CF6 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Calendar01Icon size={32} style={{ color: '#6366F1' }} /> Calendar Integration Demo
      </Typography>

      {/* Error Message */}
      {error && (
        <Paper 
          elevation={0}
          sx={{ 
            p: 2, 
            mb: 4, 
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'error.main',
            bgcolor: 'error.soft',
            color: 'error.main'
          }}
        >
          <Typography>{error}</Typography>
        </Paper>
      )}

      {/* Sign In Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: '20px',
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.9) 100%)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Step 1: Sign in with Google</Typography>
        <Button
          variant="contained"
          onClick={handleSignIn}
          disabled={!isInitialized}
          sx={{ 
            bgcolor: '#4285F4',
            color: 'white',
            px: 4,
            py: 1.5,
            borderRadius: '32px',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            '&:hover': { 
              bgcolor: '#3367D6'
            },
            '&.Mui-disabled': {
              bgcolor: 'action.disabledBackground',
              color: 'action.disabled'
            }
          }}
          startIcon={
            <Box
              sx={{
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'white',
                borderRadius: '50%',
                p: 0.5
              }}
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" 
                alt="Google"
                style={{ width: '100%', height: '100%' }}
              />
            </Box>
          }
        >
          {isInitialized ? 'Sign in with Google' : 'Initializing...'}
        </Button>
      </Paper>

      {/* Calendar Access Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: '20px',
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.9) 100%)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Step 2: Calendar Access</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Calendar01Icon size={24} style={{ color: theme.palette.primary.main }} />
          <Typography>
            We'll request read-only access to your Google Calendar
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          This allows us to display your upcoming events in our dashboard
        </Typography>
      </Paper>

      {/* Events Display Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          borderRadius: '20px',
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.9) 100%)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Step 3: View Your Events</Typography>
        
        {mockEvents.map((event) => (
          <Paper
            key={event.id}
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '16px',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
                transform: 'translateY(-1px)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <Clock01Icon />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {event.summary}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(event.start.dateTime).toLocaleString()} • {event.location}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  {event.attendees.map((attendee, index) => (
                    <Avatar
                      key={index}
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        fontSize: '0.875rem',
                        bgcolor: `hsl(${index * 60}, 70%, 50%)`
                      }}
                    >
                      {attendee[0].toUpperCase()}
                    </Avatar>
                  ))}
                </Box>
              </Box>
              <ArrowRight01Icon style={{ color: theme.palette.primary.main }} />
            </Box>
          </Paper>
        ))}
      </Paper>

      {/* Privacy Notice */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mt: 4, 
          borderRadius: '20px',
          border: '1px solid',
          borderColor: 'primary.main',
          background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>Privacy & Security</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 2 }}>
          • We only request read-only access to your calendar
          <br />
          • Your data is never stored on our servers
          <br />
          • You can revoke access at any time through your Google Account settings
        </Typography>
      </Paper>
    </Box>
  );
};

export default CalendarDemo; 