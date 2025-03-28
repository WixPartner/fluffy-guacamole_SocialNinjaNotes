import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme,
  Paper,
  Container,
  Divider,
  alpha,
  Zoom,
  Fade,
  GlobalStyles
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import StarIcon from '@mui/icons-material/Star';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import GroupsIcon from '@mui/icons-material/Groups';
import { useSnackbar } from 'notistack';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { api } from '../../api/axios';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { loadStripe, Stripe } from '@stripe/stripe-js';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      '5 pages',
      '100MB storage',
      '10 AI credits',
      'Basic support'
    ],
    buttonText: 'Basic Plan',
    priceId: '',
    icon: <StarIcon fontSize="large" />,
    color: '#6366f1'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$10',
    period: 'per month',
    features: [
      '100 pages',
      '5GB storage',
      '100 AI credits',
      'Priority support',
      'Advanced features'
    ],
    buttonText: 'Upgrade to Pro',
    priceId: 'price_1Qv5GFRJrLzXxZ1zJ3TaI2SB',
    highlight: true,
    icon: <RocketLaunchIcon fontSize="large" />,
    color: '#8b5cf6'
  },
  {
    id: 'team',
    name: 'Team',
    price: '$25',
    period: 'per month',
    features: [
      '1000 pages',
      '20GB storage',
      '500 AI credits',
      '10 team members',
      'Premium support',
      'All features'
    ],
    buttonText: 'Upgrade to Team',
    priceId: 'price_1Qv5HERJrLzXxZ1z9N3IkyZw',
    icon: <GroupsIcon fontSize="large" />,
    color: '#ec4899'
  }
];

// Initialize Stripe outside component to avoid re-initialization
let stripePromise: Promise<Stripe | null>;

const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.REACT_APP_STRIPE_PUBLIC_KEY?.trim();
    console.log('Stripe key status:', {
      exists: !!key,
      length: key?.length,
      preview: key ? `${key.substring(0, 8)}...` : 'missing'
    });
    
    if (!key) {
      throw new Error('Stripe public key is missing');
    }
    
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

const Plans = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState<string | null>(null);
  const { status, refreshSubscription } = useSubscription();
  const [stripeReady, setStripeReady] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  
  // Get auth state from Redux
  const isAuthenticated = useSelector((state: RootState) => !!state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);

  // Initialize Stripe when component mounts
  useEffect(() => {
    const initStripe = async () => {
      try {
        const stripe = await getStripe();
        console.log('Stripe initialization result:', !!stripe);
        setStripeReady(!!stripe);
      } catch (error) {
        console.error('Failed to initialize Stripe:', error);
        enqueueSnackbar('Failed to initialize payment system. Please refresh the page.', {
          variant: 'error',
          autoHideDuration: 5000
        });
      }
    };

    initStripe();
  }, [enqueueSnackbar]);

  const handleSubscribe = async (priceId: string) => {
    console.log('Subscribe clicked:', {
      priceId,
      stripeReady
    });

    if (!priceId) {
      navigate('/dashboard');
      return;
    }

    if (!stripeReady) {
      enqueueSnackbar('Payment system is not ready. Please refresh the page.', { 
        variant: 'error',
        autoHideDuration: 5000
      });
      return;
    }

    try {
      setLoading(priceId);
      console.log('Creating checkout session...', { priceId });

      // 1. Create the checkout session
      const response = await api.post('/subscription', { priceId });
      const { sessionId } = response.data;
      console.log('Checkout session created:', { sessionId });

      // 2. Get Stripe instance and redirect
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Failed to load payment system');
      }

      console.log('Redirecting to checkout...');
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw error;
      }

    } catch (error: any) {
      console.error('Subscription error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      enqueueSnackbar(
        error.message || 'Failed to process subscription. Please try again.', 
        { variant: 'error', autoHideDuration: 5000 }
      );
    } finally {
      setLoading(null);
    }
  };

  // Handle subscription status from URL params
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const subscriptionStatus = searchParams.get('subscription');
    
    if (subscriptionStatus === 'success') {
      refreshSubscription();
      enqueueSnackbar('Subscription updated successfully', { variant: 'success' });
      navigate('/dashboard');
    } else if (subscriptionStatus === 'cancelled') {
      enqueueSnackbar('Subscription process was cancelled', { variant: 'info' });
    }
  }, [navigate, enqueueSnackbar, refreshSubscription]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        py: 8,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
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
      {/* Add global keyframes for animations */}
      <GlobalStyles
        styles={{
          '@keyframes shimmer': {
            '0%': {
              backgroundPosition: '0px 0px',
            },
            '100%': {
              backgroundPosition: '800px 800px',
            },
          },
          '@keyframes float': {
            '0%': {
              transform: 'translateY(0px)',
            },
            '50%': {
              transform: 'translateY(-20px)',
            },
            '100%': {
              transform: 'translateY(0px)',
            },
          },
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
          animation: 'float 15s ease-in-out infinite',
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, rgba(236, 72, 153, 0) 70%)',
          filter: 'blur(40px)',
          animation: 'float 12s ease-in-out infinite alternate',
          zIndex: 0
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in={true} timeout={1000}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 800,
                color: '#1e293b',
                mb: 2,
                textAlign: 'center',
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
                  background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)',
                }
              }}
            >
              Choose Your Plan
            </Typography>

            <Typography
              variant="subtitle1"
              sx={{
                mb: 4,
                textAlign: 'center',
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto',
                fontSize: '1.1rem',
                lineHeight: 1.6
              }}
            >
              Select a plan that best fits your needs. You can upgrade or downgrade at any time.
            </Typography>
          </Box>
        </Fade>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
            justifyContent: 'center',
            alignItems: 'stretch',
            maxWidth: 1200,
            px: 3,
            mx: 'auto',
            '@media (min-width: 1100px)': {
              flexDirection: 'row',
              alignItems: 'stretch',
              '& > div': {
                flex: 1
              }
            }
          }}
        >
          {plans.map((plan, index) => (
            <Zoom in={true} style={{ transitionDelay: `${index * 150}ms` }} key={plan.id}>
              <Card
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
                sx={{
                  flex: 1,
                  minWidth: { xs: '100%', md: 0 },
                  background: plan.highlight 
                    ? `linear-gradient(135deg, ${alpha(plan.color, 0.12)} 0%, ${alpha(plan.color, 0.05)} 100%)`
                    : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '24px',
                  border: '1px solid',
                  borderColor: plan.highlight 
                    ? alpha(plan.color, 0.3)
                    : 'rgba(255, 255, 255, 0.3)',
                  position: 'relative',
                  transition: 'all 0.3s ease-in-out',
                  transform: hoveredPlan === plan.id ? 'translateY(-8px)' : 'translateY(0)',
                  boxShadow: hoveredPlan === plan.id 
                    ? `0 20px 30px -10px ${alpha(plan.color, 0.2)}`
                    : plan.highlight 
                      ? `0 10px 20px -5px ${alpha(plan.color, 0.15)}`
                      : '0 4px 12px rgba(0,0,0,0.05)',
                  overflow: 'visible',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {plan.highlight && (
                  <Chip
                    label="Popular"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: -12,
                      right: 24,
                      borderRadius: '12px',
                      px: 1,
                      background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                    }}
                  />
                )}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    left: 24,
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${plan.color}, ${alpha(plan.color, 0.8)})`,
                    color: 'white',
                    boxShadow: `0 4px 12px ${alpha(plan.color, 0.4)}`,
                    transition: 'transform 0.3s ease',
                    transform: hoveredPlan === plan.id ? 'scale(1.1) rotate(5deg)' : 'scale(1)'
                  }}
                >
                  {plan.icon}
                </Box>
                <CardContent sx={{ p: 4, pt: 5 }}>
                  <Typography variant="h5" component="h2" gutterBottom sx={{ 
                    fontWeight: 700,
                    color: plan.color,
                    mt: 1
                  }}>
                    {plan.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                    <Typography variant="h3" component="span" sx={{ 
                      fontWeight: 800,
                      background: `linear-gradient(90deg, ${plan.color}, ${alpha(plan.color, 0.7)})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {plan.price}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ ml: 1, color: 'text.secondary' }}>
                      /{plan.period}
                    </Typography>
                  </Box>
                  <Divider sx={{ 
                    my: 2, 
                    opacity: 0.6,
                    background: `linear-gradient(90deg, transparent, ${alpha(plan.color, 0.3)}, transparent)`
                  }} />
                  <List disablePadding>
                    {plan.features.map((feature) => (
                      <ListItem key={feature} disablePadding sx={{ mb: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleOutlineIcon sx={{ color: plan.color }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature} 
                          primaryTypographyProps={{ 
                            fontWeight: 500,
                            fontSize: '0.95rem'
                          }} 
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <CardActions sx={{ p: 4, pt: 2 }}>
                  <Button
                    fullWidth
                    variant={plan.highlight ? 'contained' : 'outlined'}
                    color="primary"
                    size="large"
                    onClick={() => handleSubscribe(plan.priceId)}
                    disabled={
                      loading === plan.priceId || 
                      (status?.tier === plan.id) || 
                      (plan.id === 'free' && (status?.tier === 'pro' || status?.tier === 'team')) ||
                      (plan.id === 'pro' && status?.tier === 'team')
                    }
                    sx={{
                      borderRadius: '12px',
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      background: plan.highlight 
                        ? `linear-gradient(90deg, ${plan.color}, ${alpha(plan.color, 0.8)})`
                        : 'transparent',
                      borderColor: plan.color,
                      color: plan.highlight ? 'white' : plan.color,
                      boxShadow: plan.highlight ? `0 4px 12px ${alpha(plan.color, 0.4)}` : 'none',
                      '&:hover': {
                        background: plan.highlight 
                          ? `linear-gradient(90deg, ${plan.color}, ${alpha(plan.color, 0.9)})`
                          : alpha(plan.color, 0.1),
                        borderColor: plan.color,
                        boxShadow: plan.highlight ? `0 6px 16px ${alpha(plan.color, 0.5)}` : 'none',
                      }
                    }}
                  >
                    {loading === plan.priceId ? 'Processing...' : 
                     status?.tier === plan.id ? 'Current Plan' : 
                     (plan.id === 'free' && (status?.tier === 'pro' || status?.tier === 'team')) ? 'Included' : 
                     (plan.id === 'pro' && status?.tier === 'team') ? 'Included' :
                     plan.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Zoom>
          ))}
        </Box>

        <Box sx={{ textAlign: 'center', mt: 8, opacity: 0.8 }}>
          <Typography variant="body2" color="text.secondary">
            All plans include our core features. Upgrade anytime as your needs grow.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Questions? Contact our <Box component="span" sx={{ color: '#6366f1', fontWeight: 500, cursor: 'pointer' }}>support team</Box>.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Plans; 