import { Outlet, useLocation } from 'react-router-dom';
import { Box, Container, useTheme } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const Layout = () => {
  const theme = useTheme();
  const location = useLocation();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { token } = useSelector((state: RootState) => state.auth);
  const isDashboard = location.pathname === '/dashboard';
  const isHome = location.pathname === '/';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.gradient.primary,
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("/pattern.svg")',
          opacity: 0.1,
          zIndex: 0,
          pointerEvents: 'none'
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Show sidebar on all routes except home */}
        {!isHome && token && <Sidebar />}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            marginLeft: !isHome && token ? (sidebarOpen ? '240px' : '64px') : 0,
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen
            })
          }}
        >
          {/* Show navbar on all routes except dashboard */}
          {!isDashboard && <Navbar />}
          <Container 
            maxWidth="lg" 
            sx={{ 
              flex: 1,
              py: 4,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Outlet />
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 