import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
import { Provider } from 'react-redux';
import { theme } from './styles/theme';
import { store } from './store';
import { useEffect, useState } from 'react';
import { useAppDispatch } from './store/hooks';
import { getCurrentUser, setToken, clearCredentials } from './store/slices/authSlice';
import { fetchPages, setInitialized } from './store/slices/uiSlice';
import { SubscriptionProvider } from './contexts/SubscriptionContext';

// Layouts
import Layout from './components/layout/Layout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthRoute from './components/auth/AuthRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import GitHubCallback from './pages/auth/GitHubCallback';
import GoogleCallback from './pages/auth/GoogleCallback';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Workspace from './pages/workspace/Workspace';
import Document from './pages/document/Document';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Trash from './pages/Trash';
import CustomPage from './pages/CustomPage';
import Calendar from './pages/Calendar';
import Plans from './pages/subscription/Plans';
import WhatIsBlock from './pages/learn/WhatIsBlock';
import CreateFirstPage from './pages/learn/CreateFirstPage';
import UseAiContent from './pages/learn/UseAiContent';
import CustomizeStyleContent from './pages/learn/CustomizeStyleContent';
import Help from './pages/Help';
import Templates from './pages/Templates';

const AppContent = () => {
  const dispatch = useAppDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (token && refreshToken) {
          // Set tokens in redux state
          dispatch(setToken({ token, refreshToken }));
          
          try {
            // First get user data
            const user = await dispatch(getCurrentUser()).unwrap();
            if (user) {
              // Only fetch pages if we have a valid user
              await dispatch(fetchPages()).unwrap();
            }
          } catch (error) {
            dispatch(clearCredentials());
          }
        }
        
        dispatch(setInitialized());
      } catch (error) {
        dispatch(clearCredentials());
        dispatch(setInitialized());
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [dispatch]);

  if (isInitializing) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="register" element={<AuthRoute><Register /></AuthRoute>} />
        <Route path="forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
        <Route path="reset-password/:token" element={<AuthRoute><ResetPassword /></AuthRoute>} />
        <Route path="verify-email/:token" element={<VerifyEmail />} />
        <Route path="github-callback" element={<GitHubCallback />} />
        <Route path="google-callback" element={<GoogleCallback />} />
      </Route>

      {/* Dashboard routes */}
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="settings" element={<Settings />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="trash" element={<Trash />} />
        <Route path="pages/:pagePath" element={<CustomPage />} />
        <Route path="plans" element={<Plans />} />
        <Route path="help" element={<Help />} />
        <Route path="templates" element={<Templates />} />
        
        {/* Learning routes */}
        <Route path="learn/what-is-block" element={<WhatIsBlock />} />
        <Route path="learn/create-first-page" element={<CreateFirstPage />} />
        <Route path="learn/use-ai-content" element={<UseAiContent />} />
        <Route path="learn/customize-style-content" element={<CustomizeStyleContent />} />
      </Route>

      {/* Protected routes */}
      <Route path="/" element={<Layout />}>
        <Route path="workspace/:workspaceId" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
        <Route path="document/:documentId" element={<ProtectedRoute><Document /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Route>

      {/* Static pages */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<Terms />} />

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SubscriptionProvider>
          <AppContent />
        </SubscriptionProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App; 