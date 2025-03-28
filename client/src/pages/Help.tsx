import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  Container,
  GlobalStyles,
  Fade,
  Zoom,
  keyframes
} from '@mui/material';
import { 
  QuestionIcon, 
  Message01Icon, 
  Book01Icon, 
  Video01Icon, 
  School01Icon,
  Search01Icon,
  ArrowRight01Icon,
  File01Icon,
  Calendar01Icon,
  Settings01Icon,
  ArrowDown01Icon,
  Notebook01Icon,
  Briefcase01Icon,
  HeartCheckIcon,
  StarsIcon,
  SmileIcon,
  SparklesIcon,
  RocketIcon,
  PuzzleIcon,
  Compass01Icon,
  BulbIcon
} from 'hugeicons-react';
import { Link } from 'react-router-dom';

// Define animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
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

const rotateGlow = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Help = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | false>(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);
  const [isLiveChatAvailable, setIsLiveChatAvailable] = useState(false);

  // Check if live chat is available based on GMT business hours
  useEffect(() => {
    const checkLiveChatAvailability = () => {
      const now = new Date();
      // Convert to GMT time
      const gmtHours = now.getUTCHours();
      const gmtDay = now.getUTCDay();
      
      // Check if current time is between 9am-5pm GMT, Monday-Friday (1-5)
      const isBusinessHours = gmtHours >= 9 && gmtHours < 17;
      const isWeekday = gmtDay >= 1 && gmtDay <= 5;
      
      setIsLiveChatAvailable(isBusinessHours && isWeekday);
    };
    
    // Check immediately
    checkLiveChatAvailability();
    
    // Set up interval to check every minute
    const interval = setInterval(checkLiveChatAvailability, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleFaqChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

  // Intersection Observer for animation on scroll
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

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const helpCategories = [
    { 
      id: 'getting-started',
      title: 'Getting Started', 
      icon: <School01Icon size={24} />, 
      description: 'Learn the basics of using Mentor',
      link: '/learn/what-is-block',
      color: theme.palette.primary.main
    },
    { 
      id: 'video-tutorials',
      title: 'Video Tutorials', 
      icon: <Video01Icon size={24} />, 
      description: 'Watch step-by-step guides',
      link: '#video-tutorials',
      color: theme.palette.primary.main
    },
    { 
      id: 'documentation',
      title: 'Documentation', 
      icon: <Book01Icon size={24} />, 
      description: 'Detailed feature documentation',
      link: '#documentation',
      color: theme.palette.primary.main
    },
    { 
      id: 'contact-support',
      title: 'Contact Support', 
      icon: <Message01Icon size={24} />, 
      description: 'Get help from our team',
      link: '#contact-support',
      color: theme.palette.primary.main
    },
  ];

  const faqs = [
    {
      id: 'faq1',
      question: 'How do I create a new page?',
      answer: 'To create a new page, click on the "+" icon in the Private section of the sidebar. Enter a name for your page and press Enter. Your new page will be created and you will be automatically redirected to it.',
      category: 'basics',
      icon: <File01Icon size={18} />
    },
    {
      id: 'faq2',
      question: 'How do I organize my pages?',
      answer: 'You can organize your pages by dragging and dropping them in the sidebar. You can also add pages to your Favorites by clicking the star icon or by right-clicking on a page and selecting "Add to Favorites".',
      category: 'basics',
      icon: <File01Icon size={18} />
    },
    {
      id: 'faq3',
      question: 'Can I recover deleted pages?',
      answer: 'Yes, when you delete a page, it is moved to the Trash. You can access the Trash by clicking on the Trash icon in the Workspace section of the sidebar. From there, you can restore deleted pages or permanently delete them.',
      category: 'basics',
      icon: <File01Icon size={18} />
    },
    {
      id: 'faq4',
      question: 'How do I use the calendar feature?',
      answer: 'The Calendar feature allows you to schedule and manage events. Navigate to the Calendar page by clicking on the Calendar icon in the sidebar. You can create new events by clicking on a date or time slot, and manage existing events by clicking on them.',
      category: 'features',
      icon: <Calendar01Icon size={18} />
    },
    {
      id: 'faq5',
      question: 'How do I customize my page?',
      answer: 'You can customize your page by adding different types of blocks. Click on the "+" button that appears when you hover over your page, or use the slash command by typing "/" to see available block types. You can add text, images, code blocks, and more.',
      category: 'customization',
      icon: <Settings01Icon size={18} />
    },
    {
      id: 'faq6',
      question: 'How do I share my pages with others?',
      answer: 'Currently, pages are private to your account. We are working on collaboration features that will allow you to share pages with specific users or make them public. Stay tuned for updates!',
      category: 'sharing',
      icon: <Message01Icon size={18} />
    },
    {
      id: 'faq7',
      question: 'Can I use Mentor on mobile devices?',
      answer: 'Yes! Mentor is fully responsive and works on mobile devices. You can access all features through your mobile browser. We\'re also working on dedicated mobile apps for iOS and Android to provide an even better experience on the go.',
      category: 'access',
      icon: <Compass01Icon size={18} />
    },
    {
      id: 'faq8',
      question: 'How does AI content generation work?',
      answer: 'Mentor\'s AI content generation uses advanced language models to help you create content. Simply type "/" followed by "AI" to access AI commands. You can ask the AI to write paragraphs, summarize text, generate ideas, and more based on your instructions.',
      category: 'ai',
      icon: <StarsIcon size={18} />
    },
    {
      id: 'faq9',
      question: 'Is my data secure?',
      answer: 'Absolutely. We take data security very seriously. All your data is encrypted both in transit and at rest. We use industry-standard security practices and regularly audit our systems to ensure your information remains protected.',
      category: 'security',
      icon: <BulbIcon size={18} />
    },
    {
      id: 'faq10',
      question: 'What subscription plans are available?',
      answer: 'Mentor offers several subscription tiers to meet different needs. We have a free plan with basic features, and premium plans that include advanced features like AI content generation, unlimited storage, and priority support. Visit our Pricing page to see all options.',
      category: 'billing',
      icon: <Briefcase01Icon size={18} />
    },
  ];

  // Group FAQs by category for the UI
  const faqCategories = [
    { id: 'basics', name: 'Basics', icon: <File01Icon size={20} /> },
    { id: 'features', name: 'Features', icon: <PuzzleIcon size={20} /> },
    { id: 'customization', name: 'Customization', icon: <Settings01Icon size={20} /> },
    { id: 'ai', name: 'AI & Content', icon: <StarsIcon size={20} /> },
    { id: 'security', name: 'Security', icon: <BulbIcon size={20} /> },
    { id: 'billing', name: 'Billing', icon: <Briefcase01Icon size={20} /> },
    { id: 'sharing', name: 'Sharing', icon: <Message01Icon size={20} /> },
    { id: 'access', name: 'Access', icon: <Compass01Icon size={20} /> },
  ];

  // Popular questions for quick access
  const popularQuestions = [
    { id: 'faq1', question: 'How do I create a new page?' },
    { id: 'faq5', question: 'How do I customize my page?' },
    { id: 'faq8', question: 'How does AI content generation work?' },
    { id: 'faq10', question: 'What subscription plans are available?' },
  ];

  const learningResources = [
    {
      title: 'Getting Started Guide',
      description: 'Learn the basics of using the platform',
      icon: <Notebook01Icon size={20} />,
      link: '/learn/getting-started',
      color: theme.palette.primary.main,
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.3)}, ${alpha(theme.palette.primary.main, 0.1)})`
    },
    {
      title: 'Task Management',
      description: 'Create, organize, and track your tasks',
      icon: <File01Icon size={20} />,
      link: '/learn/task-management',
      color: theme.palette.primary.main,
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.3)}, ${alpha(theme.palette.primary.main, 0.1)})`
    },
    {
      title: 'Mentor Features',
      description: 'Overview of all features available in Mentor',
      icon: <StarsIcon size={20} />,
      link: '/learn/features',
      color: theme.palette.primary.main,
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.3)}, ${alpha(theme.palette.primary.main, 0.1)})`
    },
    {
      title: 'Collaboration Tools',
      description: 'Resources for effective teamwork',
      icon: <SmileIcon size={20} />,
      link: '/learn/collaboration',
      color: theme.palette.primary.main,
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.3)}, ${alpha(theme.palette.primary.main, 0.1)})`
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
          '@keyframes pulse': {
            '0%': {
              transform: 'scale(1)',
            },
            '50%': {
              transform: 'scale(1.05)',
            },
            '100%': {
              transform: 'scale(1)',
            },
          },
          '.animate-on-scroll': {
            opacity: 0,
            transform: 'translateY(20px)',
            transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
          },
          '.animate-in': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        }}
      />
      
      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '5%',
          left: '10%',
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
          bottom: '15%',
          right: '10%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, rgba(236, 72, 153, 0) 70%)',
          filter: 'blur(40px)',
          animation: `${float} 12s ease-in-out infinite alternate`,
          zIndex: 0
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 6 }}>
        <Fade in={true} timeout={1000}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Box 
              sx={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 1.5,
                mb: 3,
                borderRadius: '16px',
                background: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: `conic-gradient(from 0deg at 50% 50%, ${alpha(theme.palette.primary.main, 0)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 50%, ${alpha(theme.palette.primary.main, 0)} 100%)`,
                  animation: `${rotateGlow} 4s linear infinite`,
                  zIndex: -1
                }
              }}
            >
              <QuestionIcon size={28} />
            </Box>
            
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 800,
                color: theme.palette.mode === 'light' ? '#1e293b' : '#f8fafc',
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
                  background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.7)}, ${theme.palette.primary.main})`,
                }
              }}
            >
        Help Center
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
        Find answers, learn how to use Mentor, and get support when you need it.
      </Typography>
          </Box>
        </Fade>

      {/* Search */}
      <Paper 
        elevation={0} 
        sx={{ 
            p: { xs: 3, md: 4 },
          mb: 5, 
            borderRadius: 4,
            background: theme.palette.mode === 'light'
              ? 'rgba(255, 255, 255, 0.8)'
              : 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: theme.palette.mode === 'light'
              ? '0 10px 40px -10px rgba(0, 0, 0, 0.05), 0 2px 10px -3px rgba(0, 0, 0, 0.02)'
              : '0 10px 40px -10px rgba(0, 0, 0, 0.2), 0 2px 10px -3px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)',
              opacity: isSearchFocused ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 3, 
              fontWeight: 700,
              color: theme.palette.mode === 'light' ? '#1e293b' : '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}
          >
            <SparklesIcon size={24} style={{ color: theme.palette.primary.main }} />
          What can we help you with?
        </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, position: 'relative' }}>
          <TextField
            fullWidth
            placeholder="Search for help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            InputProps={{
                startAdornment: (
                  <Search01Icon 
                    size={20} 
                    style={{ 
                      marginRight: 8, 
                      opacity: 0.7,
                      color: isSearchFocused ? theme.palette.primary.main : 'inherit',
                      transition: 'color 0.3s ease'
                    }} 
                  />
                ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                  transition: 'all 0.3s ease',
                  backgroundColor: theme.palette.mode === 'light' 
                    ? 'rgba(255, 255, 255, 0.8)' 
                    : 'rgba(15, 23, 42, 0.3)',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'light' 
                      ? 'rgba(255, 255, 255, 1)' 
                      : 'rgba(15, 23, 42, 0.4)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: theme.palette.mode === 'light' 
                      ? 'rgba(255, 255, 255, 1)' 
                      : 'rgba(15, 23, 42, 0.5)',
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`
                  }
              }
            }}
          />
          <Button 
            variant="contained" 
            sx={{ 
              borderRadius: 2,
                px: 3,
                background: theme.palette.gradient?.primary,
                '&:hover': {
                  background: theme.palette.gradient?.hover
                }
            }}
          >
            Search
          </Button>
        </Box>

          {/* Popular questions */}
          {popularQuestions.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 2, 
                  color: 'text.secondary',
                  fontWeight: 500
                }}
              >
                Popular questions:
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1 
                }}
              >
                {popularQuestions.map((q) => (
                  <Button
                    key={q.id}
                    size="small"
                    variant="outlined"
                    onClick={() => setExpandedFaq(q.id)}
                    sx={{
                      borderRadius: '20px',
                      px: 2,
                      py: 0.5,
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                      color: 'text.primary',
                      backgroundColor: alpha(theme.palette.background.paper, 0.5),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                      }
                    }}
                  >
                    {q.question}
                  </Button>
                ))}
              </Box>
            </Box>
          )}
      </Paper>

      {/* Help Categories */}
        <Typography 
          variant="h5" 
          component="h2" 
          sx={{ 
            fontWeight: 700, 
            mb: 3,
            color: theme.palette.mode === 'light' ? '#1e293b' : '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}
        >
          <Compass01Icon size={24} style={{ color: theme.palette.primary.main }} />
          Help Categories
        </Typography>
        
      <Grid container spacing={3} mb={6}>
        {helpCategories.map((category, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
              <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
            <Card 
              elevation={0}
              sx={{ 
                    borderRadius: 4,
                height: '100%',
                    background: theme.palette.mode === 'light'
                      ? 'rgba(255, 255, 255, 0.8)'
                      : 'rgba(30, 41, 59, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 20px 40px ${alpha(category.color, 0.15)}`
                }
              }}
            >
              <CardActionArea 
                component={Link} 
                to={category.link}
                sx={{ 
                  height: '100%',
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start'
                }}
              >
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        mb: 2.5,
                        background: `linear-gradient(135deg, ${alpha(category.color, 0.2)} 0%, ${alpha(category.color, 0.1)} 100%)`,
                        color: category.color,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'rotate(5deg) scale(1.1)'
                        }
                    }}
                  >
                    {category.icon}
                  </Box>
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      sx={{ 
                        fontWeight: 600, 
                        mb: 1,
                        color: theme.palette.mode === 'light' ? '#1e293b' : '#f8fafc'
                      }}
                    >
                    {category.title}
                  </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                    {category.description}
                  </Typography>
                    <Box 
                      sx={{ 
                        mt: 'auto', 
                        display: 'flex', 
                        alignItems: 'center',
                        color: category.color,
                        fontWeight: 500,
                        fontSize: '0.875rem'
                      }}
                    >
                      Explore <ArrowRight01Icon size={16} style={{ marginLeft: 4 }} />
                    </Box>
              </CardActionArea>
            </Card>
              </Zoom>
          </Grid>
        ))}
      </Grid>

      {/* Learning Resources */}
        <Typography 
          variant="h5" 
          component="h2" 
          sx={{ 
            fontWeight: 700, 
            mb: 3,
            color: theme.palette.mode === 'light' ? '#1e293b' : '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}
        >
          <BulbIcon size={24} style={{ color: theme.palette.primary.main }} />
        Learning Resources
      </Typography>
        
        <Grid container spacing={3} mb={6} ref={featuresRef}>
        {learningResources.map((resource, index) => (
            <Grid item xs={12} md={6} key={index} className="animate-on-scroll">
            <Card 
              elevation={0}
              sx={{ 
                  borderRadius: 4,
                  background: theme.palette.mode === 'light'
                    ? 'rgba(255, 255, 255, 0.8)'
                    : 'rgba(30, 41, 59, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  transition: 'all 0.3s ease',
                  overflow: 'hidden',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: resource.bgGradient,
                    opacity: 0.5,
                    zIndex: 0
                  },
                '&:hover': {
                    boxShadow: `0 15px 30px ${alpha(resource.color, 0.15)}`
                }
              }}
            >
              <CardActionArea 
                component={Link} 
                to={resource.link}
                  sx={{ 
                    p: 3,
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                        width: 48,
                        height: 48,
                        borderRadius: 2.5,
                        mr: 2.5,
                        background: `linear-gradient(135deg, ${alpha(resource.color, 0.3)} 0%, ${alpha(resource.color, 0.2)} 100%)`,
                        color: resource.color,
                        flexShrink: 0,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'rotate(5deg)'
                        }
                    }}
                  >
                    {resource.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          mb: 0.5,
                          color: theme.palette.mode === 'light' ? '#1e293b' : '#f8fafc'
                        }}
                      >
                      {resource.title}
                    </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ mb: 1.5 }}
                      >
                      {resource.description}
                    </Typography>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          color: resource.color,
                          fontWeight: 500,
                          fontSize: '0.875rem'
                        }}
                      >
                        Learn more <ArrowRight01Icon size={16} style={{ marginLeft: 4 }} />
                  </Box>
                    </Box>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

        {/* FAQs - Creative Redesign */}
        <Typography 
          variant="h5" 
          component="h2" 
          sx={{ 
            fontWeight: 700, 
            mb: 3,
            color: theme.palette.mode === 'light' ? '#1e293b' : '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}
        >
          <QuestionIcon size={24} style={{ color: theme.palette.primary.main }} />
        Frequently Asked Questions
      </Typography>

        {/* FAQ Category Tabs */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1, 
            mb: 4,
            mx: -1,
            px: 1,
            pb: 1,
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
              borderRadius: '10px',
            }
          }}
        >
          <Button
            size="small"
            variant={activeCategory === null ? "contained" : "outlined"}
            onClick={() => setActiveCategory(null)}
            sx={{
              borderRadius: '20px',
              px: 2,
              py: 0.75,
              minWidth: 'auto',
              background: activeCategory === null ? theme.palette.gradient?.primary : 'transparent',
              '&:hover': {
                background: activeCategory === null 
                  ? theme.palette.gradient?.hover 
                  : alpha(theme.palette.primary.main, 0.1),
              }
            }}
          >
            All
          </Button>
          {faqCategories.map((category) => (
            <Button
              key={category.id}
              size="small"
              variant={activeCategory === category.id ? "contained" : "outlined"}
              onClick={() => setActiveCategory(category.id)}
              startIcon={category.icon}
              sx={{
                borderRadius: '20px',
                px: 2,
                py: 0.75,
                minWidth: 'auto',
                background: activeCategory === category.id ? theme.palette.gradient?.primary : 'transparent',
                '&:hover': {
                  background: activeCategory === category.id 
                    ? theme.palette.gradient?.hover 
                    : alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              {category.name}
            </Button>
          ))}
        </Box>
        
        {/* Creative FAQ Cards */}
        <Box sx={{ mb: 6 }}>
          <Grid container spacing={3}>
            {faqs
              .filter(faq => activeCategory === null || faq.category === activeCategory)
              .map((faq, index) => (
                <Grid item xs={12} md={6} key={faq.id}>
                  <Card
        elevation={0} 
        sx={{ 
                      height: '100%',
          borderRadius: 3,
                      background: theme.palette.mode === 'light'
                        ? 'rgba(255, 255, 255, 0.8)'
                        : 'rgba(30, 41, 59, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      transition: 'all 0.3s ease-in-out',
                      position: 'relative',
          overflow: 'hidden',
                      zIndex: expandedFaq === faq.id ? 2 : 1,
                      boxShadow: expandedFaq === faq.id 
                        ? `0 15px 30px ${alpha(theme.palette.primary.main, 0.15)}`
                        : theme.palette.mode === 'light'
                          ? '0 4px 20px -5px rgba(0, 0, 0, 0.05)'
                          : '0 4px 20px -5px rgba(0, 0, 0, 0.2)',
                      '&::before': expandedFaq === faq.id ? {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '4px',
                        height: '100%',
                        background: theme.palette.gradient?.primary,
                        transition: 'all 0.3s ease'
                      } : {}
                    }}
                  >
                    <Box
                      onClick={() => setExpandedFaq(expandedFaq === faq.id ? false : faq.id)}
            sx={{ 
                        cursor: 'pointer',
                        p: 3,
                        position: 'relative',
                        zIndex: 1
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: expandedFaq === faq.id ? 2 : 0 }}>
                        <Box 
              sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            background: expandedFaq === faq.id
                              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.3)} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`
                              : alpha(theme.palette.divider, 0.1),
                            color: expandedFaq === faq.id
                              ? theme.palette.primary.main
                              : 'text.secondary',
                            transition: 'all 0.3s ease-in-out',
                            transform: expandedFaq === faq.id ? 'rotate(5deg)' : 'rotate(0deg)'
                          }}
                        >
                          {faq.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600,
                              fontSize: '1rem',
                              color: expandedFaq === faq.id ? 'primary.main' : 'text.primary',
                              transition: 'color 0.3s ease-in-out'
                            }}
                          >
                {faq.question}
              </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: 'inline-block',
                              px: 1.5,
                              py: 0.5,
                              mt: 1,
                              borderRadius: '12px',
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              color: 'text.secondary',
                              textTransform: 'capitalize'
                            }}
                          >
                            {faq.category}
                          </Typography>
                        </Box>
                        <Box 
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            ml: 'auto',
                            transform: expandedFaq === faq.id ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                          }}
                        >
                          <ArrowDown01Icon size={20} />
                        </Box>
                      </Box>
                      
                      <Box 
                        sx={{ 
                          maxHeight: expandedFaq === faq.id ? '500px' : '0px',
                          opacity: expandedFaq === faq.id ? 1 : 0,
                          overflow: 'hidden',
                          pl: 7,
                          transition: expandedFaq === faq.id 
                            ? 'max-height 0.5s cubic-bezier(0.44, 0.05, 0.21, 1), opacity 0.4s ease-in 0.1s, margin 0.3s ease'
                            : 'max-height 0.3s cubic-bezier(0.44, 0.05, 0.21, 1), opacity 0.2s ease-out, margin 0.1s ease 0.2s',
                          mb: expandedFaq === faq.id ? 1.5 : 0,
                          mt: expandedFaq === faq.id ? 2 : 0,
                          transform: `translateY(${expandedFaq === faq.id ? '0' : '-8px'})`,
                          transformOrigin: 'top'
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            position: 'relative',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: -25,
                              width: '2px',
                              height: '100%',
                              background: theme.palette.mode === 'light' 
                                ? alpha(theme.palette.primary.main, 0.2)
                                : alpha(theme.palette.primary.main, 0.3),
                              borderRadius: '2px'
                            }
                          }}
                        >
                {faq.answer}
              </Typography>
                        
                        {/* Interactive elements */}
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'flex-start',
                          gap: 2,
                          mt: 2,
                          opacity: expandedFaq === faq.id ? 1 : 0,
                          transition: 'opacity 0.3s ease-in 0.2s',
                        }}>
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<SparklesIcon size={16} />}
                            sx={{ 
                              borderRadius: '20px',
                              px: 1.5,
                              py: 0.5,
                              color: theme.palette.primary.main,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1)
                              }
                            }}
                          >
                            Helpful
                          </Button>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'text.secondary'
                            }}
                          >
                            Was this helpful?
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
          </Grid>
          
          {activeCategory !== null && 
            faqs.filter(faq => faq.category === activeCategory).length === 0 && (
              <Box 
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  borderRadius: 3,
                  background: theme.palette.mode === 'light'
                    ? 'rgba(255, 255, 255, 0.8)'
                    : 'rgba(30, 41, 59, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Box 
                  sx={{ 
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: alpha(theme.palette.divider, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  <QuestionIcon size={28} style={{ opacity: 0.5 }} />
                </Box>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No FAQs found
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  No FAQs found in this category. Please select another category.
                </Typography>
              </Box>
            )
          }
        </Box>

      {/* Contact Support */}
        <Box id="contact-support" sx={{ scrollMarginTop: '100px' }}>
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              fontWeight: 700, 
              mb: 3,
              color: theme.palette.mode === 'light' ? '#1e293b' : '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}
          >
            <Message01Icon size={24} style={{ color: theme.palette.primary.main }} />
        Contact Support
      </Typography>
          
      <Paper 
        elevation={0} 
        sx={{ 
              p: { xs: 3, md: 4 }, 
          mb: 6, 
              borderRadius: 4,
              background: theme.palette.mode === 'light'
                ? 'rgba(255, 255, 255, 0.8)'
                : 'rgba(30, 41, 59, 0.8)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: theme.palette.mode === 'light'
                ? '0 10px 40px -10px rgba(0, 0, 0, 0.05), 0 2px 10px -3px rgba(0, 0, 0, 0.02)'
                : '0 10px 40px -10px rgba(0, 0, 0, 0.2), 0 2px 10px -3px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 4,
                  color: theme.palette.mode === 'light' ? '#1e293b' : '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  '&::after': {
                    content: '""',
                    display: 'block',
                    width: '40px',
                    height: '3px',
                    background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.7)}, ${alpha(theme.palette.primary.main, 0.3)})`,
                    borderRadius: '2px',
                    marginLeft: 'auto'
                  }
                }}
              >
                <SparklesIcon size={20} style={{ color: theme.palette.primary.main }} />
                Ways to get help
              </Typography>
              
              <Grid container spacing={3}>
                {/* Email Support */}
                <Grid item xs={12} sm={6}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
          borderRadius: 3,
                      background: theme.palette.mode === 'light'
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(15, 23, 42, 0.4)',
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      transition: 'all 0.3s ease',
                      overflow: 'hidden',
                      position: 'relative',
                      '&:hover': {
                        boxShadow: `0 12px 20px ${alpha(theme.palette.primary.main, 0.1)}`
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
                        <Box 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 48,
                            height: 48,
                            borderRadius: 2.5,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                            color: theme.palette.primary.main,
                            flexShrink: 0,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'rotate(5deg) scale(1.1)'
                            }
                          }}
                        >
                          <Message01Icon size={24} />
                        </Box>
                        <Box>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600, 
                              mb: 0.5,
                              color: theme.palette.mode === 'light' ? '#1e293b' : '#f8fafc'
                            }}
                          >
                            Email Support
            </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Get help directly from our support team
            </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500,
                              color: theme.palette.primary.main,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            support@mentor.uknes
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Community Forum */}
                <Grid item xs={12} sm={6}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      background: theme.palette.mode === 'light'
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(15, 23, 42, 0.4)',
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      transition: 'all 0.3s ease',
                      overflow: 'hidden',
                      position: 'relative',
                      '&:hover': {
                        boxShadow: `0 12px 20px ${alpha(theme.palette.primary.main, 0.1)}`
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
                        <Box 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 48,
                            height: 48,
                            borderRadius: 2.5,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                            color: theme.palette.primary.main,
                            flexShrink: 0,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'rotate(5deg) scale(1.1)'
                            }
                          }}
                        >
                          <HeartCheckIcon size={24} />
                        </Box>
                        <Box>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600, 
                              mb: 0.5,
                              color: theme.palette.mode === 'light' ? '#1e293b' : '#f8fafc'
                            }}
                          >
                            Community Forum
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Join our community to get help from other users
                          </Typography>
                          <Button
                size="small"
                variant="outlined"
                            sx={{
                              borderRadius: '20px',
                              textTransform: 'none',
                              px: 2,
                              py: 0.5,
                              borderColor: alpha(theme.palette.primary.main, 0.3),
                              '&:hover': {
                                borderColor: theme.palette.primary.main,
                                background: alpha(theme.palette.primary.main, 0.05)
                              }
                            }}
                          >
                            Visit Forum
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Business Support */}
                <Grid item xs={12} sm={6}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      background: theme.palette.mode === 'light'
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(15, 23, 42, 0.4)',
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      transition: 'all 0.3s ease',
                      overflow: 'hidden',
                      position: 'relative',
                      '&:hover': {
                        boxShadow: `0 12px 20px ${alpha(theme.palette.primary.main, 0.1)}`
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
                        <Box 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 48,
                            height: 48,
                            borderRadius: 2.5,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                            color: theme.palette.primary.main,
                            flexShrink: 0,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'rotate(5deg) scale(1.1)'
                            }
                          }}
                        >
                          <Briefcase01Icon size={24} />
                        </Box>
                        <Box>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600, 
                              mb: 0.5,
                              color: theme.palette.mode === 'light' ? '#1e293b' : '#f8fafc'
                            }}
                          >
                            Business Support
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            For enterprise customers and special requests
                          </Typography>
                          <Button
                size="small"
                variant="outlined"
                sx={{ 
                              borderRadius: '20px',
                              textTransform: 'none',
                              px: 2,
                              py: 0.5,
                              borderColor: alpha(theme.palette.primary.main, 0.3),
                              '&:hover': {
                                borderColor: theme.palette.primary.main,
                                background: alpha(theme.palette.primary.main, 0.05)
                              }
                            }}
                          >
                            Contact Sales
              </Button>
            </Box>
                      </Box>
                    </CardContent>
                  </Card>
          </Grid>
                
                {/* Live Chat */}
                <Grid item xs={12} sm={6}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      background: theme.palette.mode === 'light'
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(15, 23, 42, 0.4)',
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      transition: 'all 0.3s ease',
                      overflow: 'hidden',
                      position: 'relative',
                      '&:hover': {
                        boxShadow: `0 12px 20px ${alpha(theme.palette.primary.main, 0.1)}`
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
                        <Box 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 48,
                            height: 48,
                            borderRadius: 2.5,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                            color: theme.palette.primary.main,
                            flexShrink: 0,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'rotate(5deg) scale(1.1)'
                            }
                          }}
                        >
                          <SmileIcon size={24} />
                        </Box>
                        <Box>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600, 
                              mb: 0.5,
                              color: theme.palette.mode === 'light' ? '#1e293b' : '#f8fafc'
                            }}
                          >
                            Live Chat
            </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Available Monday-Friday, 9am-5pm GMT
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box 
                              sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: isLiveChatAvailable ? '#10b981' : '#ef4444',
                                animation: isLiveChatAvailable ? `${pulse} 2s infinite` : 'none'
                              }} 
                            />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 500,
                                color: isLiveChatAvailable ? '#10b981' : '#ef4444'
                              }}
                            >
                              {isLiveChatAvailable ? 'Online Now' : 'Offline'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
          </Grid>
        </Grid>
              
              <Box 
                sx={{ 
                  mt: 4, 
                  pt: 3, 
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Can't find what you're looking for? Check our <Link to="#" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>Help Documentation</Link>.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<QuestionIcon size={18} />}
                  sx={{
                    borderRadius: '20px',
                    textTransform: 'none',
                    px: 3,
                    background: theme.palette.gradient?.primary,
                    '&:hover': {
                      background: theme.palette.gradient?.hover
                    }
                  }}
                >
                  Help Center
                </Button>
              </Box>
            </Box>
      </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Help; 