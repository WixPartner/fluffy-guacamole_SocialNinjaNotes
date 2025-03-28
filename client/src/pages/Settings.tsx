import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Switch,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  alpha,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Zoom,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  UserIcon,
  Settings01Icon,
  Notification01Icon,
  Globe02Icon,
  UserIcon as UserGroupIcon,
  BrowserIcon,
  SmileIcon,
  ShieldKeyIcon,
  Key01Icon,
  ArrowLeftRightIcon,
  CreditCardIcon,
  CompassIcon,
  Link01Icon,
  UserIcon as Users2Icon,
  Logout01Icon,
  WavingHand01Icon
} from 'hugeicons-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout, getCurrentUser } from '../store/slices/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import { format } from 'date-fns';
import PaymentHistory from '../components/billing/PaymentHistory';
import { api } from '../api/axios';

interface UsageStats {
  currentCount: number;
  maxAllowed: number;
  tier: string;
  percentageUsed: number;
  remaining: number;
}

interface AiStats {
  currentUsage: number;
  maxAllowed: number;
  tier: string;
  percentageUsed: number;
  remaining: number;
}

interface StorageStats {
  currentUsage: number;
  maxAllowed: number;
  tier: string;
  percentageUsed: number;
  remaining: number;
  formattedCurrentUsage: string;
  formattedMaxAllowed: string;
  formattedRemaining: string;
}

const Settings = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const customPages = useSelector((state: RootState) => state.ui.customPages);
  const { status, loading, error } = useSubscription();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [aiStats, setAiStats] = useState<AiStats | null>(null);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [supportAccess, setSupportAccess] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'profile';

  const fetchUsageStats = async () => {
    try {
      setUsageLoading(true);
      const response = await api.get('/pages/usage');
      setUsageStats(response.data);
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    } finally {
      setUsageLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    dispatch(getCurrentUser());
    if (currentTab === 'billing') {
      fetchUsageStats();
    }
  }, [dispatch, currentTab]);

  // Update usage stats when pages or subscription changes
  useEffect(() => {
    if (currentTab === 'billing') {
      // Calculate page usage
      const maxPages = status?.features?.maxPages || 5;
      const currentCount = customPages.length;
      const percentageUsed = (currentCount / maxPages) * 100;
      
      setUsageStats({
        currentCount,
        maxAllowed: maxPages,
        tier: status?.tier || 'free',
        percentageUsed,
        remaining: maxPages - currentCount
      });

      // Calculate AI credits usage
      const maxCredits = status?.features?.aiCredits || 10;
      const creditsUsed = user?.aiCredits?.used || 0;
      const aiPercentageUsed = (creditsUsed / maxCredits) * 100;
      
      setAiStats({
        currentUsage: creditsUsed,
        maxAllowed: maxCredits,
        tier: status?.tier || 'free',
        percentageUsed: aiPercentageUsed,
        remaining: maxCredits - creditsUsed
      });

      // Calculate storage usage
      const maxStorage = status?.features?.maxStorage || (100 * 1024 * 1024); // 100MB default
      const currentStorage = user?.storageUsed || 0;
      const storagePercentageUsed = (currentStorage / maxStorage) * 100;
      
      setStorageStats({
        currentUsage: currentStorage,
        maxAllowed: maxStorage,
        tier: status?.tier || 'free',
        percentageUsed: storagePercentageUsed,
        remaining: maxStorage - currentStorage,
        formattedCurrentUsage: formatBytes(currentStorage),
        formattedMaxAllowed: formatBytes(maxStorage),
        formattedRemaining: formatBytes(maxStorage - currentStorage)
      });
    }
  }, [customPages, user?.aiCredits?.used, user?.storageUsed, status, currentTab]);

  const handleTabChange = (tab: string) => {
    navigate(`/settings?tab=${tab}`, { replace: true });
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    dispatch(logout());
    navigate('/login');
    setLogoutDialogOpen(false);
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const handleCancelSubscription = () => {
    setCancelDialogOpen(true);
    setError(null);
  };

  const handleConfirmCancel = async () => {
    try {
      setCancelLoading(true);
      setError(null);
      
      await api.post('/subscription/cancel', {
        immediate: false // Cancel at period end
      });

      // Refresh user data and subscription status
      await dispatch(getCurrentUser());
      
      setCancelDialogOpen(false);
      setSuccessMessage('Your subscription has been cancelled and will end at the current billing period.');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleUpgradeClick = () => {
    navigate('/plans');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fff' }}>
      {/* Settings Sidebar */}
      <Box
        sx={{
          width: 270,
          minWidth: 270,
          borderRight: '1px solid',
          borderColor: 'divider',
          height: '100vh',
          position: 'sticky',
          top: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          bgcolor: alpha('#f8f8f8', 0.6),
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha('#000', 0.1),
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: alpha('#000', 0.15),
          }
        }}
      >
        {/* Account Section */}
        <Box sx={{ p: 2.5, pb: 2 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 600, 
              fontSize: '0.875rem',
              color: (theme) => theme.palette.text.primary,
              mb: 0.5,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {user?.name}
            </Typography>
            <Typography variant="body2" sx={{ 
              fontSize: '0.75rem',
              color: (theme) => alpha(theme.palette.text.primary, 0.6),
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {user?.email}
            </Typography>
          </Box>
        </Box>

        <List
          sx={{
            '& .MuiListItemIcon-root': {
              minWidth: 32,
              color: (theme) => alpha(theme.palette.text.primary, 0.6)
            },
            '& .MuiListItem-root': {
              py: 0.5,
              px: 2,
              mx: 1,
              mb: 0.5,
              borderRadius: 1,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                '& .MuiListItemIcon-root': {
                  color: (theme) => theme.palette.primary.main
                },
                '& .MuiTypography-root': {
                  color: (theme) => theme.palette.primary.main
                }
              }
            },
            '& .MuiListItemText-root': {
              margin: 0,
              '& .MuiTypography-root': {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }
            }
          }}
          subheader={
            <ListSubheader sx={{ 
              bgcolor: 'transparent', 
              fontSize: '0.75rem', 
              color: (theme) => alpha(theme.palette.text.primary, 0.5),
              lineHeight: '2em', 
              py: 1,
              px: 2.5,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              fontWeight: 600
            }}>
              Account
            </ListSubheader>
          }
        >
          <ListItem 
            button 
            onClick={() => handleTabChange('profile')}
            selected={currentTab === 'profile' || !currentTab}
            sx={{ 
              '&.Mui-selected': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                '& .MuiListItemIcon-root': {
                  color: (theme) => theme.palette.primary.main
                },
                '& .MuiTypography-root': {
                  color: (theme) => theme.palette.primary.main,
                  fontWeight: 500
                }
              }
            }}
          >
            <ListItemIcon><UserIcon size={20} /></ListItemIcon>
            <ListItemText primary="My account" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </ListItem>
          <ListItem button>
            <ListItemIcon><Settings01Icon size={20} /></ListItemIcon>
            <ListItemText primary="My settings" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </ListItem>
          <ListItem button>
            <ListItemIcon><Notification01Icon size={20} /></ListItemIcon>
            <ListItemText primary="My notifications" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </ListItem>
          <ListItem button>
            <ListItemIcon><Link01Icon size={20} /></ListItemIcon>
            <ListItemText primary="My connections" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </ListItem>
          <ListItem button>
            <ListItemIcon><Globe02Icon size={20} /></ListItemIcon>
            <ListItemText primary="Language & region" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </ListItem>
        </List>

        <List
          sx={{ 
            mt: 1,
            '& .MuiListItem-root': {
              py: 0.5,
              px: 2,
              mx: 1,
              mb: 0.5,
              borderRadius: 1,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                '& .MuiListItemIcon-root': {
                  color: (theme) => theme.palette.primary.main
                },
                '& .MuiTypography-root': {
                  color: (theme) => theme.palette.primary.main
                }
              }
            }
          }}
          subheader={
            <ListSubheader sx={{ 
              bgcolor: 'transparent', 
              fontSize: '0.75rem', 
              color: (theme) => alpha(theme.palette.text.primary, 0.5),
              lineHeight: '2em', 
              py: 1,
              px: 2.5,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              fontWeight: 600
            }}>
              Workspace
            </ListSubheader>
          }
        >
          <ListItem button>
            <ListItemIcon><Settings01Icon size={20} /></ListItemIcon>
            <ListItemText primary="Settings" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </ListItem>
          <ListItem button>
            <ListItemIcon><UserGroupIcon size={20} /></ListItemIcon>
            <ListItemText primary="Teamspaces" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </ListItem>
          <ListItem button>
            <ListItemIcon><Users2Icon size={20} /></ListItemIcon>
            <ListItemText primary="People" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </ListItem>
          <ListItem button>
            <ListItemIcon><BrowserIcon size={20} /></ListItemIcon>
            <ListItemText primary="Sites" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </ListItem>
          <ListItem button>
            <ListItemIcon><SmileIcon size={20} /></ListItemIcon>
            <ListItemText primary="Emoji" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </ListItem>
          <ListItem button>
            <ListItemIcon><ShieldKeyIcon size={20} /></ListItemIcon>
            <ListItemText primary="Security & data" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </ListItem>
          <ListItem button>
            <ListItemIcon><Key01Icon size={20} /></ListItemIcon>
            <ListItemText primary="Identity & provisioning" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </ListItem>
          <ListItem button>
            <ListItemIcon><Link01Icon size={20} /></ListItemIcon>
            <ListItemText primary="Connections" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </ListItem>
          <ListItem button>
            <ListItemIcon><ArrowLeftRightIcon size={20} /></ListItemIcon>
            <ListItemText primary="Import" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </ListItem>
          <ListItem 
            button 
            onClick={() => navigate('/plans')}
          >
            <ListItemIcon><CompassIcon size={20} /></ListItemIcon>
            <ListItemText 
              primary="Explore plans" 
              primaryTypographyProps={{ fontSize: '0.875rem' }}
            />
          </ListItem>
          <ListItem 
            button 
            onClick={() => handleTabChange('billing')}
            selected={currentTab === 'billing'}
          >
            <ListItemIcon><CreditCardIcon size={20} /></ListItemIcon>
            <ListItemText 
              primary="Billing" 
              primaryTypographyProps={{ fontSize: '0.875rem' }}
              secondary={status?.tier.toUpperCase()}
              secondaryTypographyProps={{ 
                fontSize: '0.75rem',
                color: (theme) => theme.palette.primary.main
              }}
            />
          </ListItem>
        </List>

        {/* Logout Button */}
        <Box sx={{ p: 2, mt: 'auto' }}>
          <Divider sx={{ mb: 2 }} />
          <Button
            variant="outlined"
            size="small"
            startIcon={<Logout01Icon size={18} />}
            onClick={handleLogoutClick}
            fullWidth
            sx={{
              textTransform: 'none',
              borderColor: (theme) => alpha(theme.palette.divider, 0.8),
              color: (theme) => theme.palette.text.primary,
              '&:hover': {
                borderColor: (theme) => theme.palette.primary.main,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04)
              }
            }}
          >
            Log out
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 4 }}>
        <Box sx={{ maxWidth: 800 }}>
          {currentTab === 'profile' && (
            <>
              <Typography variant="h6" sx={{ 
                mb: 4,
                fontWeight: 600,
                color: (theme) => theme.palette.text.primary
              }}>
                My profile
              </Typography>

              {/* Profile Section */}
              <Box sx={{ mb: 6 }}>
                <Box sx={{ mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 72,
                      height: 72,
                      bgcolor: (theme) => theme.palette.primary.main,
                      fontSize: '2rem',
                      mb: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    {user?.name?.charAt(0)}
                  </Avatar>
                  <Typography variant="body2" sx={{ 
                    mb: 1,
                    color: (theme) => alpha(theme.palette.text.primary, 0.6),
                    fontWeight: 500
                  }}>
                    Preferred name
                  </Typography>
                  <TextField
                    value={user?.name || ''}
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ 
                      maxWidth: 400,
                      '& .MuiOutlinedInput-root': {
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: (theme) => alpha(theme.palette.primary.main, 0.5)
                          }
                        },
                        '&.Mui-focused': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderWidth: '1px'
                          }
                        }
                      }
                    }}
                  />
                </Box>
              </Box>

              {/* Account Security Section */}
              <Typography variant="h6" sx={{ 
                mt: 6,
                mb: 3,
                fontWeight: 600,
                color: (theme) => theme.palette.text.primary
              }}>
                Account security
              </Typography>

              <Box sx={{ mb: 6 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start', 
                  mb: 3,
                  pb: 3,
                  borderBottom: '1px solid',
                  borderColor: (theme) => alpha(theme.palette.divider, 0.5)
                }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ 
                      mb: 0.5,
                      fontWeight: 500
                    }}>Email</Typography>
                    <Typography variant="body2" sx={{ 
                      color: (theme) => alpha(theme.palette.text.primary, 0.6)
                    }}>{user?.email}</Typography>
                  </Box>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ 
                      textTransform: 'none',
                      borderColor: (theme) => alpha(theme.palette.primary.main, 0.5),
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04)
                      }
                    }}
                  >
                    Change email
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ mb: 0.5 }}>Password</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Set a permanent password to log in to your account.
                    </Typography>
                  </Box>
                  <Switch checked={true} />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ mb: 0.5 }}>2-step verification</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add an additional layer of security to your account during login.
                    </Typography>
                  </Box>
                  <Button variant="outlined" size="small" sx={{ textTransform: 'none' }}>
                    Add verification method
                  </Button>
                </Box>
              </Box>

              {/* Support */}
              <Typography variant="h6" sx={{ mb: 3 }}>
                Support
              </Typography>

              <Box sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ mb: 0.5 }}>Support access</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Grant support temporary access to your account to help troubleshoot problems or recover content.
                    </Typography>
                  </Box>
                  <Switch
                    checked={supportAccess}
                    onChange={(e) => setSupportAccess(e.target.checked)}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ mb: 0.5, color: '#d32f2f' }}>Delete my account</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Permanently delete the account and remove access from all workspaces.
                    </Typography>
                  </Box>
                  <Button variant="text" color="error" size="small" sx={{ textTransform: 'none' }}>
                    Delete my account
                  </Button>
                </Box>
              </Box>

              {/* Devices */}
              <Typography variant="h6" sx={{ mb: 3 }}>
                Devices
              </Typography>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ mb: 0.5 }}>Log out of all devices</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Log out of all other active sessions on other devices besides this one.
                    </Typography>
                  </Box>
                  <Button variant="outlined" size="small" sx={{ textTransform: 'none' }}>
                    Log out all devices
                  </Button>
                </Box>
              </Box>
            </>
          )}

          {currentTab === 'billing' && (
            <>
              <Typography variant="h6" sx={{ 
                mb: 4,
                fontWeight: 600,
                color: (theme) => theme.palette.text.primary
              }}>
                Billing & Subscription
              </Typography>
              {loading || usageLoading ? (
                <LinearProgress />
              ) : (
                <>
                  <Card sx={{ mb: 3, overflow: 'visible' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Box>
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            {status?.tier.toUpperCase()} Plan
                            <Chip 
                              label={status?.cancelAtPeriodEnd ? 'Cancels at period end' : 'Active'} 
                              color={status?.cancelAtPeriodEnd ? 'warning' : 'success'}
                              size="small"
                              sx={{ ml: 2 }}
                            />
                          </Typography>
                          {status?.currentPeriodEnd && (
                            <Typography variant="body2" color="text.secondary">
                              Next billing date: {format(new Date(status.currentPeriodEnd), 'MMMM dd, yyyy')}
                            </Typography>
                          )}
                        </Box>
                        <Box>
                          {status?.tier === 'free' ? (
                            <Button 
                              variant="contained" 
                              color="primary"
                              onClick={handleUpgradeClick}
                            >
                              Upgrade Plan
                            </Button>
                          ) : status?.cancelAtPeriodEnd ? (
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                Subscription ends: {status?.currentPeriodEnd && format(new Date(status.currentPeriodEnd), 'MMMM dd, yyyy')}
                              </Typography>
                              <Button 
                                variant="outlined" 
                                color="primary"
                                onClick={handleUpgradeClick}
                                size="small"
                              >
                                Renew Subscription
                              </Button>
                            </Box>
                          ) : (
                            <Button 
                              variant="outlined" 
                              color="error"
                              onClick={handleCancelSubscription}
                            >
                              Cancel Subscription
                            </Button>
                          )}
                        </Box>
                      </Box>

                      <Divider sx={{ my: 3 }} />

                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                        Usage Overview
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 4 }}>
                        {/* Pages Usage */}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Pages
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={usageStats ? (usageStats.currentCount / usageStats.maxAllowed * 100) : 0}
                            sx={{ 
                              mb: 1, 
                              height: 8, 
                              borderRadius: 4,
                              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                backgroundColor: (theme) => 
                                  usageStats && usageStats.percentageUsed > 90 
                                    ? theme.palette.error.main 
                                    : usageStats && usageStats.percentageUsed > 75
                                    ? theme.palette.warning.main
                                    : theme.palette.primary.main
                              }
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {usageStats 
                              ? `${usageStats.currentCount} of ${usageStats.maxAllowed} pages used (${Math.round(usageStats.percentageUsed)}%)`
                              : 'Loading...'}
                          </Typography>
                          {usageStats && usageStats.percentageUsed > 90 && (
                            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                              You're almost at your limit! Consider upgrading your plan.
                            </Typography>
                          )}
                        </Box>

                        {/* Storage Usage */}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Storage
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={storageStats ? storageStats.percentageUsed : 0}
                            sx={{ 
                              mb: 1, 
                              height: 8, 
                              borderRadius: 4,
                              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                backgroundColor: (theme) => 
                                  storageStats && storageStats.percentageUsed > 90 
                                    ? theme.palette.error.main 
                                    : storageStats && storageStats.percentageUsed > 75
                                    ? theme.palette.warning.main
                                    : theme.palette.primary.main
                              }
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {storageStats 
                              ? `${storageStats.formattedCurrentUsage} of ${storageStats.formattedMaxAllowed} used (${Math.round(storageStats.percentageUsed)}%)`
                              : 'Loading...'}
                          </Typography>
                          {storageStats && storageStats.percentageUsed > 90 && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" color="error" sx={{ display: 'block' }}>
                                Critical: Storage almost full! Upgrade your plan to avoid service interruption.
                              </Typography>
                              <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                onClick={handleUpgradeClick}
                                sx={{ mt: 1 }}
                              >
                                Upgrade Now
                              </Button>
                            </Box>
                          )}
                          {storageStats && storageStats.percentageUsed > 75 && storageStats.percentageUsed <= 90 && (
                            <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
                              Warning: Storage usage is high. Consider upgrading your plan.
                            </Typography>
                          )}
                        </Box>

                        {/* AI Credits */}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            AI Credits
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={aiStats ? aiStats.percentageUsed : 0}
                            sx={{ 
                              mb: 1, 
                              height: 8, 
                              borderRadius: 4,
                              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                backgroundColor: (theme) => 
                                  aiStats && aiStats.percentageUsed > 90 
                                    ? theme.palette.error.main 
                                    : aiStats && aiStats.percentageUsed > 75
                                    ? theme.palette.warning.main
                                    : theme.palette.primary.main
                              }
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {aiStats 
                              ? `${aiStats.currentUsage} of ${aiStats.maxAllowed} credits used (${Math.round(aiStats.percentageUsed)}%)`
                              : 'Loading...'}
                          </Typography>
                          {aiStats && aiStats.percentageUsed > 90 && (
                            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                              You're almost out of AI credits! Consider upgrading your plan.
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Payment History */}
                  <Card sx={{ mt: 4 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 3 }}>Payment History</Typography>
                      <PaymentHistory />
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Logout Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to log out?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel}>Cancel</Button>
          <Button onClick={handleLogoutConfirm} color="error">Logout</Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => !cancelLoading && setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancel Subscription</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to cancel your subscription? You'll still have access to premium features until the end of your current billing period.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current period ends: {status?.currentPeriodEnd && format(new Date(status.currentPeriodEnd), 'MMMM dd, yyyy')}
          </Typography>
          {cancelError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {cancelError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setCancelDialogOpen(false)}
            disabled={cancelLoading}
          >
            Keep Subscription
          </Button>
          <Button 
            color="error" 
            variant="contained"
            onClick={handleConfirmCancel}
            disabled={cancelLoading}
            startIcon={cancelLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {cancelLoading ? 'Cancelling...' : 'Cancel Subscription'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccessMessage(null)} 
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings; 