import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Button,
  Container
} from '@mui/material';
import {
  AccountCircle,
  KeyboardArrowDown
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../store/hooks';
import { RootState } from '../../store';
import { logout, getCurrentUser } from '../../store/slices/authSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    navigate('/settings');
  };

  const handleLogout = async () => {
    handleClose();
    await dispatch(logout()).unwrap();
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        '& .MuiToolbar-root': {
          px: { xs: 1, sm: 2, md: 4 }
        }
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <Toolbar
          sx={{
            py: { xs: 1, sm: 1.5 },
            gap: { xs: 1, sm: 2 },
            justifyContent: 'space-between',
            minHeight: { xs: '48px', sm: '56px', md: '64px' }
          }}
        >
          <Typography
            component={RouterLink}
            to="/"
            sx={{
              fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.5rem' },
              fontWeight: 800,
              color: '#ffffff',
              textDecoration: 'none',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              position: 'relative',
              whiteSpace: 'nowrap',
              '&::after': {
                content: '""',
                position: 'absolute',
                width: '0',
                height: '2px',
                bottom: -4,
                left: '50%',
                background: '#ffffff',
                transition: 'all 0.3s ease'
              },
              '&:hover': {
                '&::after': {
                  width: '100%',
                  left: '0'
                }
              }
            }}
          >
            Mentor
          </Typography>

          <Box 
            sx={{ 
              height: '1px', 
              flex: { xs: 0, sm: 1 },
              background: 'rgba(255, 255, 255, 0.2)',
              mx: { xs: 1, sm: 2, md: 4 },
              display: { xs: 'none', sm: 'block' }
            }} 
          />

          {!token ? (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 1, sm: 2 }
            }}>
              <Button
                component={RouterLink}
                to="/login"
                endIcon={<KeyboardArrowDown />}
                sx={{
                  color: '#ffffff',
                  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                  py: { xs: 0.75, sm: 1 },
                  px: { xs: 1.5, sm: 2 },
                  borderRadius: '12px',
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  minWidth: 'fit-content',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Log in
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                  py: { xs: 0.75, sm: 1 },
                  px: { xs: 2, sm: 3 },
                  borderRadius: '12px',
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  minWidth: 'fit-content',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.15)'
                  }
                }}
              >
                Sign up
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
              <Tooltip title="Account settings" arrow>
                <IconButton
                  onClick={handleMenu}
                  sx={{
                    p: { xs: 0.25, sm: 0.5 },
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  {user?.avatar ? (
                    <Avatar
                      src={user.avatar}
                      alt={user.name}
                      sx={{
                        width: { xs: 32, sm: 36 },
                        height: { xs: 32, sm: 36 },
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'rgba(255, 255, 255, 0.4)'
                        }
                      }}
                    />
                  ) : (
                    <Avatar 
                      sx={{
                        width: { xs: 32, sm: 36 },
                        height: { xs: 32, sm: 36 },
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'rgba(255, 255, 255, 0.2)'
                        }
                      }}
                    >
                      <AccountCircle sx={{ 
                        color: '#ffffff',
                        fontSize: { xs: '1.2rem', sm: '1.4rem' }
                      }} />
                    </Avatar>
                  )}
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                disableScrollLock
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right'
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    mt: 1.5,
                    overflow: 'visible',
                    background: 'rgba(15, 14, 23, 0.7)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '24px',
                    minWidth: 280,
                    p: '3px',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      inset: -1,
                      padding: '1px',
                      borderRadius: '24px',
                      background: 'linear-gradient(130deg, #3b82f6, #8b5cf6, #d946ef)',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude',
                      opacity: 0.5
                    },
                    '& .MuiMenuItem-root': {
                      fontSize: '0.95rem',
                      color: '#ffffff',
                      py: 1.5,
                      px: 2,
                      mx: 0.5,
                      my: 0.5,
                      borderRadius: '20px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(130deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1), rgba(217, 70, 239, 0.1))',
                        opacity: 0,
                        transition: 'all 0.3s ease'
                      },
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.03)',
                        '&:before': {
                          opacity: 1
                        }
                      },
                      '&:active': {
                        background: 'rgba(255, 255, 255, 0.06)'
                      }
                    }
                  }
                }}
              >
                <MenuItem onClick={handleProfile}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    width: '100%',
                    gap: 2,
                    pb: 2,
                    mb: 1,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <Box sx={{ 
                      position: 'relative',
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        inset: -2,
                        padding: '2px',
                        borderRadius: '50%',
                        background: 'linear-gradient(130deg, #3b82f6, #8b5cf6, #d946ef)',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude'
                      }
                    }}>
                      {user?.avatar ? (
                        <Avatar
                          src={user.avatar}
                          alt={user.name}
                          sx={{
                            width: 52,
                            height: 52,
                            border: '2px solid transparent',
                            background: 'rgba(255, 255, 255, 0.03)'
                          }}
                        />
                      ) : (
                        <Avatar
                          sx={{
                            width: 52,
                            height: 52,
                            border: '2px solid transparent',
                            background: 'linear-gradient(130deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
                            fontSize: '1.4rem',
                            fontWeight: 600
                          }}
                        >
                          {user?.name?.charAt(0).toUpperCase()}
                        </Avatar>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ 
                        fontSize: '1.1rem', 
                        fontWeight: 600,
                        background: 'linear-gradient(130deg, #3b82f6, #8b5cf6, #d946ef)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '0.01em'
                      }}>
                        {user?.name}
                      </Typography>
                      <Typography sx={{ 
                        fontSize: '0.85rem', 
                        color: 'rgba(255, 255, 255, 0.5)',
                        mt: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}>
                        <Box sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: '#10b981',
                          boxShadow: '0 0 12px #10b981'
                        }} />
                        Active now
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
                <MenuItem onClick={handleProfile} sx={{ 
                  color: '#ffffff !important',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    Settings
                  </Box>
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ 
                  color: '#ffffff !important',
                  '&:before': {
                    background: 'linear-gradient(130deg, rgba(239, 68, 68, 0.1), rgba(248, 113, 113, 0.1)) !important'
                  },
                  '&:hover': {
                    color: '#ef4444 !important'
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    Logout
                  </Box>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 