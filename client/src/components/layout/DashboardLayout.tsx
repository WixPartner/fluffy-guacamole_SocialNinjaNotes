import { Box, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const DashboardLayout = () => {
  const theme = useTheme();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { token } = useSelector((state: RootState) => state.auth);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'light' 
          ? 'linear-gradient(180deg, #F9FAFB 0%, #F3F4F6 100%)'
          : 'linear-gradient(180deg, #111827 0%, #1F2937 100%)'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
        }}
      >
        {token && <Sidebar />}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: '100vh',
            marginLeft: token ? (sidebarOpen ? '240px' : '64px') : 0,
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen
            })
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout; 