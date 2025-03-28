import React, { useEffect, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  keyframes,
  IconButton,
  Link
} from '@mui/material';
import {
  SaveEnergy01Icon,
  ShieldKeyIcon,
  BrainIcon,
  SparklesIcon,
  ArrowRight01Icon,
  GithubIcon,
  TwitterIcon,
  InstagramIcon,
  File01Icon,
  Book01Icon,
  Target01Icon,
  RoboticIcon,
  Calendar01Icon,
  Medal01Icon,
  Globe02Icon,
  Copy01Icon,
  Linkedin01Icon
} from 'hugeicons-react';

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const Home = () => {
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const features = document.querySelectorAll('.feature-card');
    features.forEach((feature) => observer.observe(feature));

    return () => observer.disconnect();
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
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
          zIndex: 0,
          animation: `${shimmer} 60s linear infinite`,
          pointerEvents: 'none'
        }
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          minHeight: '100vh',
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch'
        }}
      >
        {/* Hero Section */}
        <Container maxWidth="lg" sx={{ position: 'relative', background: 'transparent' }}>
          <Box
            sx={{
              minHeight: { xs: 'auto', md: '100vh' },
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              gap: { xs: 8, md: 6 },
              py: { xs: 8, md: 8 },
              background: 'transparent'
            }}
          >
            {/* Left side - Content */}
            <Box sx={{ 
              flex: 1,
              width: { xs: '100%', md: 'auto' },
              px: { xs: 2, sm: 0 }
            }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '4rem' },
                  fontWeight: 800,
                  color: '#ffffff',
                  lineHeight: 1.1,
                  mb: { xs: 3, md: 2 },
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -10,
                    left: 0,
                    width: { xs: 60, sm: 80, md: 100 },
                    height: 4,
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: 2
                  }
                }}
              >
                Create something
                <Box 
                  component="span" 
                  sx={{ 
                    display: 'block',
                    color: '#ffffff'
                  }}
                >
                  beautiful.
                </Box>
              </Typography>
              <Typography
                sx={{
                  fontSize: '1.25rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  mb: 4,
                  maxWidth: '30rem'
                }}
              >
                Mentor helps you do more, more easily. Experience the future of productivity.
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: { xs: 1, sm: 2 },
                  flexDirection: { xs: 'column', sm: 'row' },
                  width: { xs: '100%', sm: 'auto' },
                  '& .MuiButton-root': {
                    transition: 'all 0.3s ease',
                    width: { xs: '100%', sm: 'auto' }
                  }
                }}
              >
                <Button
                  component={RouterLink}
                  to="/register"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    color: '#ffffff',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    py: { xs: 1, sm: 1.5 },
                    px: { xs: 2, sm: 4 },
                    textTransform: 'none',
                    borderRadius: 2,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    whiteSpace: 'nowrap',
                    minWidth: 'auto',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.25)',
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  Try Mentor for free
                </Button>
                <Button
                  component={RouterLink}
                  to="/login"
                  endIcon={<ArrowRight01Icon size={16} />}
                  sx={{
                    color: '#ffffff',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    py: { xs: 1, sm: 1.5 },
                    px: { xs: 2, sm: 4 },
                    textTransform: 'none',
                    borderRadius: 2,
                    whiteSpace: 'nowrap',
                    minWidth: 'auto',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiSvgIcon-root': {
                        transform: 'translateX(4px)'
                      }
                    },
                    '& .MuiSvgIcon-root': {
                      transition: 'transform 0.2s ease'
                    }
                  }}
                >
                  Request a demo
                </Button>
              </Box>
            </Box>

            {/* Right side - Animated Illustration */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                animation: `${float} 6s ease-in-out infinite`,
                width: { xs: '100%', md: 'auto' },
                mt: { xs: 2, md: 0 }
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  p: { xs: 4, sm: 5, md: 6 },
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transform: { xs: 'none', md: 'perspective(1000px) rotateY(-10deg)' },
                  transition: 'transform 0.3s ease',
                  width: { xs: '230px', sm: '280px', md: '320px' },
                  mx: 'auto',
                  '&:hover': {
                    transform: { xs: 'none', md: 'perspective(1000px) rotateY(0deg)' }
                  }
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    gap: { xs: 2, sm: 3 },
                    alignItems: 'flex-end',
                    justifyContent: { xs: 'center', md: 'flex-start' }
                  }}
                >
                  {[
                    { color: '#3b82f6', height: { xs: 120, sm: 140, md: 160 }, delay: 0 },
                    { color: '#ec4899', height: { xs: 90, sm: 100, md: 120 }, delay: 0.2 },
                    { color: '#10b981', height: { xs: 150, sm: 180, md: 200 }, delay: 0.4 }
                  ].map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: { xs: 40, sm: 50, md: 60 },
                        height: item.height,
                        bgcolor: item.color,
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        pb: 1,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        animation: `${pulse} 2s ease-in-out infinite`,
                        animationDelay: `${item.delay}s`
                      }}
                    >
                      <Box
                        sx={{
                          width: { xs: 16, sm: 20, md: 24 },
                          height: { xs: 16, sm: 20, md: 24 },
                          borderRadius: '50%',
                          bgcolor: '#ffffff',
                          mx: 'auto',
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.2)'
                          }
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>
          </Box>
        </Container>

        {/* Features Grid Section */}
        <Container maxWidth="lg" sx={{ mt: { xs: 8, md: 12 }, mb: { xs: 8, md: 12 }, px: { xs: 2, sm: 3, md: 3 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
              fontWeight: 800,
              color: '#ffffff',
              textAlign: { xs: 'center', md: 'left' },
              mb: 3,
              maxWidth: '800px'
            }}
          >
            Everything you need to work effectively.
          </Typography>

          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mt: { xs: 2, md: 4 } }}>
            {[
              {
                icon: <File01Icon size={40} />,
                title: 'Documents',
                description: 'Create any page, communicate any idea.'
              },
              {
                icon: <Book01Icon size={40} />,
                title: 'Wiki',
                description: 'Centralize all your knowledge.'
              },
              {
                icon: <Target01Icon size={40} />,
                title: 'Projects',
                description: 'Manage any initiative from A to Z.'
              },
              {
                icon: <RoboticIcon size={40} />,
                title: 'Mentor AI',
                description: 'All our AI tools in one assistant.'
              },
              {
                icon: <Calendar01Icon size={40} />,
                title: 'Calendar',
                description: 'Keep all your events in one place.'
              },
              {
                icon: <Medal01Icon size={40} />,
                title: 'Goals',
                description: 'Set objectives, organize work and track progress.'
              },
              {
                icon: <Globe02Icon size={40} />,
                title: 'Sites',
                description: 'Turn any page into a website in minutes.'
              },
              {
                icon: <Copy01Icon size={40} />,
                title: 'Templates',
                description: 'Start with one of our 20,000 templates.'
              }
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box
                  sx={{
                    p: 3,
                    height: '100%',
                    cursor: 'pointer',
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.03)',
                      '& .arrow-icon': {
                        transform: 'translateX(4px)'
                      },
                      '& .icon-container': {
                        transform: 'perspective(1000px) rotateY(15deg)',
                        background: 'rgba(255, 255, 255, 0.1)'
                      }
                    }
                  }}
                >
                  <Box
                    className="icon-container"
                    sx={{
                      width: 60,
                      height: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      mb: 2,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      background: 'rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      mb: 1
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: '#ffffff'
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <ArrowRight01Icon size={18} className="arrow-icon" style={{ color: '#ffffff', transition: 'transform 0.2s ease' }} />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: '0.95rem',
                      color: 'rgba(255, 255, 255, 0.7)',
                      lineHeight: 1.5
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Features Section */}
        <Box 
          ref={featuresRef}
          sx={{ 
            py: { xs: 8, md: 12 },
            px: { xs: 2, sm: 3, md: 3 },
            background: 'transparent'
          }}
        >
          <Container maxWidth="lg">
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 800,
                color: '#ffffff',
                textAlign: 'center',
                mb: 2,
                letterSpacing: '-0.02em',
                px: { xs: 2, sm: 0 }
              }}
            >
              Why choose Mentor?
            </Typography>
            <Typography
              sx={{
                fontSize: '1.25rem',
                color: 'rgba(255, 255, 255, 0.8)',
                textAlign: 'center',
                mb: 8,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Experience a new way of learning and growing with our innovative platform.
            </Typography>

            <Grid container spacing={4}>
              {[
                {
                  icon: <SaveEnergy01Icon size={32} />,
                  title: 'Fast & Efficient',
                  description: 'Get things done quickly with our streamlined interface and powerful tools.'
                },
                {
                  icon: <ShieldKeyIcon size={32} />,
                  title: 'Secure & Reliable',
                  description: 'Your data is protected with enterprise-grade security measures.'
                },
                {
                  icon: <BrainIcon size={32} />,
                  title: 'Smart Learning',
                  description: 'AI-powered recommendations help you learn more effectively.'
                },
                {
                  icon: <SparklesIcon size={32} />,
                  title: 'Beautiful Design',
                  description: 'A thoughtfully crafted interface that makes work a pleasure.'
                }
              ].map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper
                    className="feature-card"
                    elevation={0}
                    sx={{
                      p: 4,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      borderRadius: '24px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'all 0.3s ease',
                      opacity: 0,
                      transform: 'translateY(20px)',
                      '&.animate-in': {
                        opacity: 1,
                        transform: 'translateY(0)',
                      },
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        mb: 3,
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'rotate(5deg) scale(1.1)'
                        }
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        color: '#ffffff',
                        letterSpacing: '-0.01em'
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        lineHeight: 1.6,
                        fontSize: '0.95rem'
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Footer Section */}
        <Box 
          sx={{ 
            py: { xs: 4, md: 3 },
            background: 'rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            width: '100%'
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={{ xs: 4, md: 8 }}>
              {/* Left Column - Logo and Social */}
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  textAlign: { xs: 'center', md: 'left' }
                }}>
                  <Typography
                    variant="h6"
                    component={RouterLink}
                    to="/"
                    sx={{
                      fontSize: { xs: '1.5rem', sm: '1.25rem' },
                      fontWeight: 800,
                      color: '#ffffff',
                      textDecoration: 'none',
                      display: 'inline-block',
                      mb: 1.5,
                      background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Mentor
                  </Typography>
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.9rem',
                      lineHeight: 1.6,
                      mb: 2
                    }}
                  >
                    Empowering learners worldwide with innovative educational technology.
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1.5,
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    mb: { xs: 2, md: 0 }
                  }}>
                    {[
                      { icon: <GithubIcon />, link: '#', label: 'GitHub' },
                      { icon: <TwitterIcon />, link: '#', label: 'Twitter' },
                      { icon: <Linkedin01Icon />, link: '#', label: 'LinkedIn' },
                      { icon: <InstagramIcon />, link: '#', label: 'Instagram' }
                    ].map((social, index) => (
                      <IconButton
                        key={index}
                        component="a"
                        href={social.link}
                        aria-label={social.label}
                        size="small"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            color: '#ffffff',
                            transform: 'translateY(-2px)',
                            background: 'rgba(255, 255, 255, 0.1)'
                          }
                        }}
                      >
                        {React.cloneElement(social.icon, { size: 18 })}
                      </IconButton>
                    ))}
                  </Box>
                </Box>
              </Grid>

              {/* Right Column - Navigation Links */}
              <Grid item xs={12} md={8}>
                <Grid container spacing={4}>
                  {[
                    {
                      title: 'Product',
                      links: ['Features', 'Pricing', 'Case Studies', 'Reviews']
                    },
                    {
                      title: 'Company',
                      links: ['About', 'Careers', 'Blog', 'Press']
                    },
                    {
                      title: 'Resources',
                      links: ['Documentation', 'Help Center', 'Community', 'Contact']
                    }
                  ].map((section, index) => (
                    <Grid item xs={4} key={index}>
                      <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                        <Typography
                          sx={{
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            mb: 2,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {section.title}
                        </Typography>
                        <Box
                          component="ul"
                          sx={{
                            listStyle: 'none',
                            p: 0,
                            m: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5
                          }}
                        >
                          {section.links.map((link, linkIndex) => (
                            <Box
                              component="li"
                              key={linkIndex}
                            >
                              <Link
                                component={RouterLink}
                                to="#"
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  textDecoration: 'none',
                                  fontSize: '0.85rem',
                                  transition: 'all 0.2s ease',
                                  display: 'inline-block',
                                  '&:hover': {
                                    color: '#ffffff',
                                    transform: 'translateX(4px)'
                                  }
                                }}
                              >
                                {link}
                              </Link>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>

            {/* Footer Bottom */}
            <Box
              sx={{
                pt: 3,
                mt: 3,
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.8rem',
                  order: { xs: 2, sm: 1 }
                }}
              >
                © {new Date().getFullYear()} Mentor. All rights reserved.
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: { xs: 3, sm: 4 },
                  order: { xs: 1, sm: 2 }
                }}
              >
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item, index) => (
                  <Link
                    key={index}
                    component={RouterLink}
                    to="#"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: '#ffffff'
                      }
                    }}
                  >
                    {item}
                  </Link>
                ))}
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Home; 