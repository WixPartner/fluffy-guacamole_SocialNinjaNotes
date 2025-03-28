import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../api/axios';
import { RootState } from '../store';

interface SubscriptionStatus {
  tier: 'free' | 'pro' | 'team';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  features?: {
    maxPages: number;
    maxStorage: number;
    aiCredits: number;
    collaborators: number;
  };
}

interface SubscriptionContextType {
  status: SubscriptionStatus | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get auth state from Redux
  const token = useSelector((state: RootState) => state.auth.token);
  const isAuthenticated = useSelector((state: RootState) => !!state.auth.token);

  const fetchSubscriptionStatus = async () => {
    // Only fetch if user is authenticated
    if (!isAuthenticated || !token) {
      setStatus({
        tier: 'free',
        features: {
          maxPages: 5,
          maxStorage: 100 * 1024 * 1024, // 100MB
          aiCredits: 10,
          collaborators: 0
        }
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/subscription/status', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStatus({
        ...response.data.subscription,
        features: response.data.features
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch subscription status');
      // Set default free tier if there's an error
      setStatus({
        tier: 'free',
        features: {
          maxPages: 5,
          maxStorage: 100 * 1024 * 1024, // 100MB
          aiCredits: 10,
          collaborators: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch subscription status when auth state changes
  useEffect(() => {
    fetchSubscriptionStatus();
  }, [isAuthenticated, token]);

  const refreshSubscription = async () => {
    await fetchSubscriptionStatus();
  };

  const value = {
    status,
    loading,
    error,
    refreshSubscription
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}; 