import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axios';

export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  pagesCount: number;
  storageUsed: number;
  aiCredits: {
    used: number;
    lastResetDate: string;
  };
  subscription: {
    tier: 'free' | 'pro' | 'team';
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
  };
  templateSubscribed: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isLoading: false,
  error: null,
};

// Helper function to set auth tokens
const setAuthTokens = (token: string, refreshToken: string) => {
  localStorage.setItem('token', token);
  localStorage.setItem('refreshToken', refreshToken);
  // Set token in API headers
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Helper function to clear auth tokens
const clearAuthTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  delete api.defaults.headers.common['Authorization'];
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    const { token, refreshToken, user } = response.data;
    setAuthTokens(token, refreshToken);
    return { token, refreshToken, user };
  }
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      const refreshToken = auth.refreshToken || localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      const response = await api.post('/auth/refresh', { refreshToken });
      const { token, newRefreshToken } = response.data;
      setAuthTokens(token, newRefreshToken);
      return { token, refreshToken: newRefreshToken };
    } catch (error: any) {
      clearAuthTokens();
      return rejectWithValue(error.message);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      const token = auth.token || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No token found');
      }

      try {
        const response = await api.get('/users/me');
        return response.data;
      } catch (error: any) {
        // If token is expired, try to refresh it
        if (error.response?.status === 401) {
          await dispatch(refreshAccessToken()).unwrap();
          // Retry the request with new token
          const retryResponse = await api.get('/users/me');
          return retryResponse.data;
        }
        throw error;
      }
    } catch (error: any) {
      clearAuthTokens();
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState }) => {
    const { auth } = getState() as { auth: AuthState };
    if (auth.refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken: auth.refreshToken });
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }
    clearAuthTokens();
    return null;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (credentials: { name: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  }
);

export const googleAuth = createAsyncThunk(
  'auth/googleAuth',
  async (code: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/google', { code });
      const { token: authToken, user } = response.data;
      setAuthTokens(authToken, authToken); // Using the same token for refresh for simplicity
      return { token: authToken, refreshToken: authToken, user };
    } catch (error: any) {
      // Clear any existing tokens on error
      clearAuthTokens();
      
      // Extract the error message from the response if available
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Google authentication failed';
                          
      return rejectWithValue(errorMessage);
    }
  }
);

export const githubAuth = createAsyncThunk(
  'auth/githubAuth',
  async (code: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/github', { code });
      const { token: authToken, user } = response.data;
      setAuthTokens(authToken, authToken); // Using the same token for refresh for simplicity
      return { token: authToken, refreshToken: authToken, user };
    } catch (error: any) {
      // Clear any existing tokens on error
      clearAuthTokens();
      
      // Extract the error message from the response if available
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'GitHub authentication failed';
                          
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.error = null;
      clearAuthTokens();
    },
    setToken: (state, action) => {
      const { token, refreshToken } = action.payload;
      state.token = token;
      state.refreshToken = refreshToken;
      if (token && refreshToken) {
        setAuthTokens(token, refreshToken);
      }
    },
    updateAiCredits: (state, action) => {
      if (state.user) {
        state.user.aiCredits = {
          used: action.payload.used,
          lastResetDate: action.payload.lastResetDate
        };
      }
    },
    updateTemplateSubscribed: (state, action) => {
      if (state.user) {
        state.user.templateSubscribed = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Google Auth
      .addCase(googleAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Google authentication failed';
      })
      // GitHub Auth
      .addCase(githubAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(githubAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(githubAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'GitHub authentication failed';
      })
      // Refresh token
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = action.error.message || 'Failed to get user';
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = null;
      });
  },
});

export const { clearCredentials, setToken, updateAiCredits, updateTemplateSubscribed } = authSlice.actions;
export default authSlice.reducer; 