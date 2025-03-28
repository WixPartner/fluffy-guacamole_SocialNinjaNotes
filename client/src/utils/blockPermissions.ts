import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Block types organized by category
export const BLOCK_CATEGORIES = {
  BASIC: [
    'text',
    'heading1',
    'heading2',
    'heading3',
    'picture',
  ],
  LISTS: [
    'bullet-list',
    'number-list',
    'todo-list',
    'toggle-list',
  ],
  ADVANCED: [
    'code',
    'table',
    'schedule',
    'equation',
    'file',
  ]
};

// All block types
export const ALL_BLOCK_TYPES = [
  ...BLOCK_CATEGORIES.BASIC,
  ...BLOCK_CATEGORIES.LISTS,
  ...BLOCK_CATEGORIES.ADVANCED
];

// Block types allowed for each subscription tier
export const SUBSCRIPTION_BLOCK_TYPES = {
  free: [
    'text',
    'bullet-list',
    'numbered-list',
    'todo-list',
    'heading1',
    'heading2',
    'heading3',
    'picture'
  ],
  pro: [
    'text',
    'bullet-list',
    'number-list',
    'todo-list',
    'toggle-list',
    'heading1',
    'heading2',
    'heading3',
    'picture',
    'code',
    'table',
    'file',
    'equation'
  ],
  team: [
    'text',
    'bullet-list',
    'number-list',
    'todo-list',
    'toggle-list',
    'heading1',
    'heading2',
    'heading3',
    'picture',
    'code',
    'table',
    'schedule',
    'file',
    'equation'
  ]
};

/**
 * Hook to check if a block type is allowed for the current user's subscription tier
 */
export const useBlockPermissions = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const isBlockTypeAllowed = (blockType: string): boolean => {
    if (!user || !user.subscription) {
      // Default to free tier if user or subscription info is not available
      return SUBSCRIPTION_BLOCK_TYPES.free.includes(blockType);
    }
    
    const tier = user.subscription.tier || 'free';
    return SUBSCRIPTION_BLOCK_TYPES[tier as keyof typeof SUBSCRIPTION_BLOCK_TYPES].includes(blockType);
  };
  
  const getAllowedBlockTypes = (): string[] => {
    if (!user || !user.subscription) {
      return SUBSCRIPTION_BLOCK_TYPES.free;
    }
    
    const tier = user.subscription.tier || 'free';
    return SUBSCRIPTION_BLOCK_TYPES[tier as keyof typeof SUBSCRIPTION_BLOCK_TYPES];
  };
  
  return {
    isBlockTypeAllowed,
    getAllowedBlockTypes
  };
};

/**
 * Utility function to check if a block type is allowed for a specific subscription tier
 */
export const isBlockTypeAllowedForTier = (blockType: string, tier: 'free' | 'pro' | 'team'): boolean => {
  return SUBSCRIPTION_BLOCK_TYPES[tier].includes(blockType);
}; 