import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Paper, Grid, IconButton, Avatar, useTheme, Card, CardContent, Skeleton } from '@mui/material';
import {
  ClipboardIcon,
  GraduateMaleIcon,
  Briefcase01Icon,
  Clock01Icon,
  Calendar01Icon,
  ArrowRight01Icon,
  CheckmarkCircle01Icon,
  Sun01Icon,
  Sun03Icon,
  Moon01Icon,
  Moon02Icon,
  File01Icon,
  DocumentAttachmentIcon,
  FileEditIcon,
  FolderCheckIcon,
  FileDownloadIcon,
  Image01Icon,
  Video01Icon,
  MusicNote01Icon,
  HeadphonesIcon,
  School01Icon,
  Book01Icon,
  GlobalEducationIcon,
  Notebook01Icon,
  Calculator01Icon,
  ChartAverageIcon,
  Presentation01Icon,
  HeartCheckIcon,
  StarsIcon,
  SmileIcon,
  Home01Icon,
  Leaf01Icon,
  AiCloud01Icon,
  FlowerIcon,
  Database01Icon,
  CloudServerIcon,
  TextWrapIcon,
  ComputerDesk01Icon,
  DatabaseIcon
} from 'hugeicons-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAppDispatch } from '../store/hooks';
import { fetchRecentlyVisited } from '../store/slices/uiSlice';

interface IconCategory {
  name: string;
  icons: {
    icon: React.ReactNode;
    value: string;
  }[];
}

const iconCategories: IconCategory[] = [
  {
    name: 'Document',
    icons: [
      { icon: <DocumentAttachmentIcon size={20} />, value: 'DocumentAttachmentIcon' },
      { icon: <File01Icon size={20} />, value: 'File01Icon' },
      { icon: <FileEditIcon size={20} />, value: 'FileEditIcon' },
      { icon: <FolderCheckIcon size={20} />, value: 'FolderCheckIcon' },
      { icon: <FileDownloadIcon size={20} />, value: 'FileDownloadIcon' },
    ]
  },
  {
    name: 'Media',
    icons: [
      { icon: <Image01Icon size={20} />, value: 'Image01Icon' },
      { icon: <Video01Icon size={20} />, value: 'Video01Icon' },
      { icon: <MusicNote01Icon size={20} />, value: 'MusicNote01Icon' },
      { icon: <HeadphonesIcon size={20} />, value: 'HeadphonesIcon' },
    ]
  },
  {
    name: 'Education',
    icons: [
      { icon: <School01Icon size={20} />, value: 'School01Icon' },
      { icon: <Book01Icon size={20} />, value: 'Book01Icon' },
      { icon: <GlobalEducationIcon size={20} />, value: 'GlobalEducationIcon' },
      { icon: <Notebook01Icon size={20} />, value: 'Notebook01Icon' },
    ]
  },
  {
    name: 'Work',
    icons: [
      { icon: <Briefcase01Icon size={20} />, value: 'Briefcase01Icon' },
      { icon: <Calculator01Icon size={20} />, value: 'Calculator01Icon' },
      { icon: <ChartAverageIcon size={20} />, value: 'ChartAverageIcon' },
      { icon: <Presentation01Icon size={20} />, value: 'Presentation01Icon' },
    ]
  },
  {
    name: 'Personal',
    icons: [
      { icon: <HeartCheckIcon size={20} />, value: 'HeartCheckIcon' },
      { icon: <StarsIcon size={20} />, value: 'StarsIcon' },
      { icon: <SmileIcon size={20} />, value: 'SmileIcon' },
      { icon: <Home01Icon size={20} />, value: 'Home01Icon' },
    ]
  },
  {
    name: 'Nature',
    icons: [
      { icon: <Leaf01Icon size={20} />, value: 'Leaf01Icon' },
      { icon: <Sun01Icon size={20} />, value: 'Sun01Icon' },
      { icon: <AiCloud01Icon size={20} />, value: 'AiCloud01Icon' },
      { icon: <FlowerIcon size={20} />, value: 'FlowerIcon' },
    ]
  },
  {
    name: 'Tech',
    icons: [
      { icon: <Database01Icon size={20} />, value: 'Database01Icon' },
      { icon: <CloudServerIcon size={20} />, value: 'CloudServerIcon' },
      { icon: <TextWrapIcon size={20} />, value: 'TextWrapIcon' },
      { icon: <ComputerDesk01Icon size={20} />, value: 'ComputerDesk01Icon' },
    ]
  },
];

const RecentItem = ({ title, time, icon, onClick }: { title: string; time: string; icon: React.ReactNode; onClick: () => void }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      borderRadius: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: '1px solid',
      borderColor: 'divider',
      backgroundColor: 'background.paper',
      '&:hover': {
        boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.08)',
        borderColor: 'primary.main',
        '& .arrow-icon': {
          color: 'primary.main'
        }
      }
    }}
    onClick={onClick}
  >
    {icon}
    <Box sx={{ flex: 1 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <CheckmarkCircle01Icon size={14} />
        {time}
      </Typography>
    </Box>
    <IconButton size="small" className="arrow-icon" sx={{ transition: 'all 0.3s ease' }}>
      <ArrowRight01Icon size={20} />
    </IconButton>
  </Paper>
);

const LearningItem = ({ title, duration, icon }: { title: string; duration: string; icon: React.ReactNode }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: '20px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: '1px solid',
      borderColor: 'divider',
      backgroundColor: 'background.paper',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      '&:hover': {
        boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.08)',
        borderColor: 'primary.main',
        '& .learn-icon': {
          color: 'primary.main'
        }
      }
    }}
  >
    <Box className="learn-icon" sx={{ transition: 'all 0.3s ease' }}>
      {icon}
    </Box>
    <Box sx={{ mt: 'auto', pt: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontSize: '1.1rem' }}>
        {title}
      </Typography>
      <Typography 
        variant="caption" 
        sx={{ 
          color: 'text.secondary',
          display: 'inline-block',
          px: 1.5,
          py: 0.5,
          bgcolor: 'action.hover',
          borderRadius: '12px',
          fontSize: '0.75rem'
        }}
      >
        {duration}
      </Typography>
    </Box>
  </Paper>
);

const CalendarEvent = ({ event }: { event: any }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      mb: 2,
      borderRadius: '16px',
      border: '1px solid',
      borderColor: 'divider',
      background: 'linear-gradient(145deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.9) 100%)',
      backdropFilter: 'blur(20px)'
    }}
  >
    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
      {event.summary}
    </Typography>
    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
      <Clock01Icon size={14} />
      {new Date(event.start.dateTime).toLocaleString()}
    </Typography>
  </Paper>
);

const RecentlyVisitedSkeleton = () => (
  <Grid container spacing={3}>
    {[1, 2, 3].map((item) => (
      <Grid item xs={12} sm={6} md={4} key={item}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            borderRadius: '16px',
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            height: '94px',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(20px)'
          }}
        >
          <Skeleton 
            variant="circular" 
            width={32} 
            height={32} 
            sx={{ bgcolor: 'action.hover', flexShrink: 0 }}
          />
          <Box sx={{ flex: 1 }}>
            <Skeleton 
              variant="text" 
              width={160} 
              height={24}
              sx={{ 
                bgcolor: 'action.hover',
                borderRadius: 1,
                mb: 0.5
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Skeleton 
                variant="circular" 
                width={14} 
                height={14} 
                sx={{ bgcolor: 'action.hover', flexShrink: 0 }}
              />
              <Skeleton 
                variant="text" 
                width={100} 
                height={20}
                sx={{ 
                  bgcolor: 'action.hover',
                  borderRadius: 1
                }}
              />
            </Box>
          </Box>
          <Skeleton 
            variant="circular" 
            width={32} 
            height={32}
            sx={{ 
              bgcolor: 'action.hover',
              flexShrink: 0
            }}
          />
        </Paper>
      </Grid>
    ))}
  </Grid>
);

const Dashboard = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { recentlyVisited, isInitializing, customPages, trashedPages } = useSelector((state: RootState) => state.ui);
  const navigate = useNavigate();
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  
  // Filter to only show pages that exist in customPages (active pages)
  const filteredRecentlyVisited = useMemo(() => {
    const activePageIds = customPages.map(page => page._id);
    return recentlyVisited.filter(item => activePageIds.includes(item.id));
  }, [recentlyVisited, customPages]);

  // Fetch recently visited pages when component mounts or when pages change
  // Only depend on customPages, not on trashedPages
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    setIsLoadingRecent(true);
    
    dispatch(fetchRecentlyVisited())
      .finally(() => {
        if (isMounted) {
          // Small delay to prevent flickering during rapid state changes
          timeoutId = setTimeout(() => {
            setIsLoadingRecent(false);
          }, 100);
        }
      });
      
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [dispatch, customPages]); // Only depend on customPages, not on trashedPages

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: 'Good morning', icon: <Sun01Icon size={28} style={{ color: '#FDB813' }} /> };
    if (hour >= 12 && hour < 17) return { text: 'Good afternoon', icon: <Sun03Icon size={28} style={{ color: '#FF9800' }} /> };
    if (hour >= 17 && hour < 22) return { text: 'Good evening', icon: <Moon01Icon size={28} style={{ color: '#5C6BC0' }} /> };
    return { text: 'Good night', icon: <Moon02Icon size={28} style={{ color: '#3F51B5' }} /> };
  };

  const getIconComponent = (iconName?: string) => {
    if (!iconName) return <File01Icon size={32} style={{ color: 'var(--mui-palette-primary-main)' }} />;
    const IconComponent = iconCategories
      .flatMap((cat: IconCategory) => cat.icons)
      .find((i: { icon: React.ReactNode; value: string }) => i.value === iconName);
    if (IconComponent) {
      return React.cloneElement(IconComponent.icon as React.ReactElement, { 
        size: 32,
        style: { color: 'var(--mui-palette-primary-main)' }
      });
    }
    return <File01Icon size={32} style={{ color: 'var(--mui-palette-primary-main)' }} />;
  };

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
        {getGreeting().icon} {getGreeting().text}, {user?.name}
      </Typography>

      {/* Recently visited section */}
      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 3, 
            fontWeight: 600,
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: 'text.primary'
          }}
        >
          <Calendar01Icon size={20} /> Recently visited
        </Typography>
        {isInitializing || isLoadingRecent ? (
          <RecentlyVisitedSkeleton />
        ) : filteredRecentlyVisited.length > 0 ? (
          <Grid container spacing={3}>
            {filteredRecentlyVisited.slice(0, 3).map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <RecentItem
                  title={item.title}
                  time={formatDistanceToNow(new Date(item.visitedAt)) + ' ago'}
                  icon={getIconComponent(item.icon)}
                  onClick={() => navigate(item.path)}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary">
            No recently visited pages yet
          </Typography>
        )}
      </Box>

      {/* Learn section */}
      <Box>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 3, 
            fontWeight: 600,
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: 'text.primary'
          }}
        >
          <GraduateMaleIcon size={20} /> Learn
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box onClick={() => navigate('/learn/what-is-block')}>
              <LearningItem
                title="What is a block?"
                duration="2m read"
                icon={<Box component="img" src="/block-icon.svg" alt="Block" sx={{ width: 48, height: 48 }} />}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box onClick={() => navigate('/learn/create-first-page')}>
              <LearningItem
                title="Create your first page"
                duration="2m read"
                icon={<Box component="img" src="/page-icon.svg" alt="Page" sx={{ width: 48, height: 48 }} />}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box onClick={() => navigate('/learn/use-ai-content')}>
              <LearningItem
                title="Use AI to create content"
                duration="2m read"
                icon={<Box component="img" src="/subpage-icon.svg" alt="Subpage" sx={{ width: 48, height: 48 }} />}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box onClick={() => navigate('/learn/customize-style-content')}>
              <LearningItem
                title="Customize & style content"
                duration="8m read"
                icon={<Box component="img" src="/customize-icon.svg" alt="Customize" sx={{ width: 48, height: 48 }} />}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Calendar section */}
      <Box sx={{ mt: 6 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 3, 
            fontWeight: 600,
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: 'text.primary'
          }}
        >
          <Clock01Icon size={20} /> Upcoming events
        </Typography>
        <Paper 
          elevation={0}
          sx={{ 
            p: 4,
            textAlign: 'center', 
            borderRadius: '20px',
            border: '1px solid',
            borderColor: 'divider',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(20px)'
          }}
        >
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, maxWidth: 400, mx: 'auto' }}>
            See your upcoming events and join meetings from Home.
          </Typography>
          <Typography
            component="a"
            href="#"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: '12px',
              bgcolor: 'primary.soft',
              transition: 'all 0.3s ease',
              display: 'inline-block',
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'white'
              }
            }}
          >
            Connect to Google Calendar
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard; 