import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Divider, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  useTheme
} from '@mui/material';
import { CheckmarkCircle01Icon, XVariableCircleIcon } from 'hugeicons-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import BlockTypeFeatures from '../components/subscription/BlockTypeFeatures';
import { useSubscription } from '../contexts/SubscriptionContext';
import { api } from '../api/axios';
import { useSnackbar } from 'notistack';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe outside component to avoid re-initialization
let stripePromise: ReturnType<typeof loadStripe>;

const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.REACT_APP_STRIPE_PUBLIC_KEY?.trim();
    if (!key) {
      throw new Error('Stripe public key is missing');
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

const PricingTier = ({ 
  title, 
  price, 
  features, 
  buttonText, 
  buttonVariant = 'contained',
  buttonColor = 'primary',
  current = false,
  onSelect
}: { 
  title: string; 
  price: string; 
  features: { text: string; included: boolean }[]; 
  buttonText: string; 
  buttonVariant?: 'text' | 'outlined' | 'contained';
  buttonColor?: 'primary' | 'secondary' | 'success' | 'info';
  current?: boolean;
  onSelect: () => void;
}) => {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={current ? 4 : 1} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderColor: current ? 'primary.main' : 'divider',
        borderWidth: current ? 2 : 1,
        borderStyle: 'solid',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      {current && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: -12, 
            left: '50%', 
            transform: 'translateX(-50%)',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}
        >
          CURRENT PLAN
        </Box>
      )}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div" gutterBottom>
          {price}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <List sx={{ flexGrow: 1, mb: 2 }}>
          {features.map((feature, index) => (
            <ListItem key={index} sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {feature.included ? (
                  <CheckmarkCircle01Icon size={20} style={{ color: theme.palette.success.main }} />
                ) : (
                  <XVariableCircleIcon size={20} style={{ color: theme.palette.text.disabled }} />
                )}
              </ListItemIcon>
              <ListItemText 
                primary={feature.text} 
                primaryTypographyProps={{ 
                  variant: 'body2',
                  color: feature.included ? 'textPrimary' : 'textSecondary'
                }} 
              />
            </ListItem>
          ))}
        </List>
        <Button 
          fullWidth 
          variant={buttonVariant} 
          color={buttonColor as any}
          onClick={onSelect}
          disabled={current}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

const Subscription = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { status, refreshSubscription } = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const [selectedTier, setSelectedTier] = useState<'free' | 'pro' | 'team'>(
    user?.subscription?.tier || 'free'
  );
  
  const handleSelectTier = (tier: 'free' | 'pro' | 'team') => {
    setSelectedTier(tier);
  };
  
  const handleSubscribe = async (priceId: string) => {
    try {
      setLoading(priceId);
      
      // 1. Create the checkout session
      const response = await api.post('/subscription', { priceId });
      const { sessionId } = response.data;
      
      // 2. Get Stripe instance and redirect
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Failed to load payment system');
      }
      
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw error;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to process subscription';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(null);
    }
  };
  
  const tiers = [
    {
      title: 'Free',
      price: '$0',
      features: [
        { text: '5 pages', included: true },
        { text: '100MB storage', included: true },
        { text: '10 AI credits per month', included: true },
        { text: 'Basic blocks only', included: true },
        { text: 'No collaborators', included: true },
        { text: 'Basic support', included: true },
      ],
      buttonText: 'Current Plan',
      buttonVariant: 'outlined',
      tier: 'free',
      current: user?.subscription?.tier === 'free'
    },
    {
      title: 'Pro',
      price: '$10/month',
      features: [
        { text: '100 pages', included: true },
        { text: '5GB storage', included: true },
        { text: '100 AI credits per month', included: true },
        { text: 'Advanced blocks', included: true },
        { text: 'No collaborators', included: true },
        { text: 'Priority support', included: true },
      ],
      buttonText: user?.subscription?.tier === 'pro' ? 'Current Plan' : 'Upgrade',
      buttonVariant: 'contained',
      tier: 'pro',
      current: user?.subscription?.tier === 'pro'
    },
    {
      title: 'Team',
      price: '$25/month',
      features: [
        { text: '1000 pages', included: true },
        { text: '20GB storage', included: true },
        { text: '500 AI credits per month', included: true },
        { text: 'All blocks', included: true },
        { text: '10 collaborators', included: true },
        { text: 'Premium support', included: true },
      ],
      buttonText: user?.subscription?.tier === 'team' ? 'Current Plan' : 'Upgrade',
      buttonVariant: 'contained',
      buttonColor: 'secondary',
      tier: 'team',
      current: user?.subscription?.tier === 'team'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Subscription Plans
      </Typography>
      <Typography variant="subtitle1" align="center" color="textSecondary" paragraph>
        Choose the plan that works best for you and your team
      </Typography>
      
      <Grid container spacing={4} sx={{ mt: 4, mb: 8 }}>
        {tiers.map((tier) => (
          <Grid item key={tier.title} xs={12} md={4}>
            <PricingTier
              title={tier.title}
              price={tier.price}
              features={tier.features}
              buttonText={tier.buttonText}
              buttonVariant={tier.buttonVariant as any}
              buttonColor={tier.buttonColor as any}
              current={tier.current}
              onSelect={() => {
                handleSelectTier(tier.tier as 'free' | 'pro' | 'team');
                if (tier.tier !== 'free' && tier.tier !== user?.subscription?.tier) {
                  handleSubscribe(tier.tier === 'pro' ? 'price_pro' : 'price_team');
                }
              }}
            />
          </Grid>
        ))}
      </Grid>
      
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 6, mb: 3 }}>
        Plan Features Comparison
      </Typography>
      
      <Box sx={{ mb: 6 }}>
        <BlockTypeFeatures tier={selectedTier} />
      </Box>
      
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          All plans include basic features like page management, trash, favorites, and more.
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Need a custom plan? <Button color="primary">Contact us</Button>
        </Typography>
      </Box>
    </Container>
  );
};

export default Subscription; 