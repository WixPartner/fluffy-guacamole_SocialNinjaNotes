import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { pagesApi, Page as ApiPage, Block, RecentlyVisited, TableRow } from '../../api/pages';
import { RootState } from '../../store';
import { api } from '../../api/axios';

type ModalType = 'createDocument' | 'createWorkspace' | 'share' | 'shareDocument' | 'documentHistory' | 'documentSettings' | 'members' | 'manageMembers' | 'workspaceSettings' | 'settings' | null;

interface UiState {
  sidebarOpen: boolean;
  currentTheme: 'light' | 'dark';
  notifications: {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }[];
  isLoading: boolean;
  isInitializing: boolean;
  modal: {
    isOpen: boolean;
    type: ModalType;
    data: any;
  };
  customPages: ApiPage[];
  trashedPages: ApiPage[];
  recentlyVisited: TransformedRecentlyVisited[];
  favorites: ApiPage[];
  error?: string;
  templateNotificationEmails: string[];
}

const initialState: UiState = {
  sidebarOpen: true,
  currentTheme: 'light',
  notifications: [],
  isLoading: false,
  isInitializing: true,
  modal: {
    isOpen: false,
    type: null,
    data: null
  },
  customPages: [],
  trashedPages: [],
  recentlyVisited: [],
  favorites: [],
  templateNotificationEmails: []
};

// Define a type for the transformed recently visited data
type TransformedRecentlyVisited = {
  id: string;
  title: string;
  path: string;
  icon?: string;
  visitedAt: string;
};

export const fetchRecentlyVisited = createAsyncThunk<TransformedRecentlyVisited[]>(
  'ui/fetchRecentlyVisited',
  async (_, { getState }) => {
    try {
      const response = await pagesApi.getRecentlyVisited();
      const state = getState() as RootState;
      
      // Get IDs of active pages
      const activePageIds = state.ui.customPages.map(page => page._id);
      
      // Filter and transform the response
      return response
        .filter(visit => {
          // Only include visits where:
          // 1. The visit and pageId are valid
          // 2. The page exists in customPages (is active)
          return visit && 
                 visit.pageId && 
                 activePageIds.includes(visit.pageId._id);
        })
        .map(visit => ({
          id: visit.pageId._id,
          title: visit.pageId.name,
          path: visit.pageId.path,
          icon: visit.pageId.icon,
          visitedAt: visit.visitedAt
        }));
    } catch (error: any) {
      console.error('Error fetching recently visited pages:', error);
      return []; // Return empty array on error to prevent UI issues
    }
  }
);

export const fetchPageByPath = createAsyncThunk(
  'ui/fetchPageByPath',
  async (path: string) => {
    try {
      const page = await pagesApi.getPageByPath(path);
      return page;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch page');
    }
  }
);

export const fetchPages = createAsyncThunk(
  'ui/fetchPages',
  async (_, { dispatch }) => {
    try {
      const [pages, recentlyVisited] = await Promise.all([
        pagesApi.getPages(),
        pagesApi.getRecentlyVisited()
      ]);
      
      // Transform recentlyVisited data to match the expected format
      if (recentlyVisited && Array.isArray(recentlyVisited)) {
        const transformedRecent = recentlyVisited
          .filter(visit => visit && visit.pageId)
          .map(visit => ({
            id: visit.pageId._id,
            title: visit.pageId.name,
            path: visit.pageId.path,
            icon: visit.pageId.icon,
            visitedAt: visit.visitedAt
          }));
        dispatch(fetchRecentlyVisited.fulfilled(transformedRecent, ''));
      }
      
      return pages.filter(page => page && page._id);
    } catch (error: any) {
      console.error('Error fetching pages:', error);
      throw error;
    }
  }
);

export const fetchTrashedPages = createAsyncThunk(
  'ui/fetchTrashedPages',
  async () => {
    const pages = await pagesApi.getTrashedPages();
    return pages;
  }
);

export const createPage = createAsyncThunk(
  'ui/createPage',
  async (page: { name: string; path: string; icon?: string; blocks?: Block[] }) => {
    const newPage = await pagesApi.createPage(page);
    return newPage;
  }
);

export const updatePage = createAsyncThunk(
  'ui/updatePage',
  async ({ id, page }: { id: string; page: Partial<ApiPage> }) => {
    const updatedPage = await pagesApi.updatePage(id, page);
    return updatedPage;
  }
);

export const deletePage = createAsyncThunk(
  'ui/deletePage',
  async (id: string) => {
    const page = await pagesApi.deletePage(id);
    return page;
  }
);

export const restorePage = createAsyncThunk(
  'ui/restorePage',
  async (id: string) => {
    const page = await pagesApi.restorePage(id);
    return page;
  }
);

export const permanentlyDeletePage = createAsyncThunk(
  'ui/permanentlyDeletePage',
  async (id: string) => {
    await pagesApi.permanentlyDeletePage(id);
    return id;
  }
);

export const reorderPages = createAsyncThunk(
  'ui/reorderPages',
  async (pages: { _id: string; order: number }[], { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const originalPages = [...state.ui.customPages];
      
      // Create reordered pages array
      const reorderedPages = originalPages.map(page => {
        const updatedPage = pages.find(p => p._id === page._id);
        if (updatedPage) {
          return { ...page, order: updatedPage.order };
        }
        return page;
      }).sort((a, b) => (a.order || 0) - (b.order || 0));

      // Optimistically update UI
      dispatch(reorderPagesOptimistic(reorderedPages));

      // Update server
      const updatedPages = await pagesApi.reorderPages(pages);
      return updatedPages;
    } catch (error: any) {
      // Revert to original state on error
      const state = getState() as RootState;
      const originalPages = [...state.ui.customPages];
      dispatch(revertPagesReorder(originalPages));
      
      console.error('Error reordering pages:', error);
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

// Add block thunk
export const addBlock = createAsyncThunk(
  'ui/addBlock',
  async ({ pageId, block }: { pageId: string; block: Block }, { dispatch, getState, rejectWithValue }) => {
    try {
      // Optimistically add the block to the UI
      dispatch(addBlockOptimistic({ pageId, block }));
      
      const state = getState() as RootState;
      const page = state.ui.customPages.find(p => p._id === pageId);
      if (!page) {
        dispatch(revertBlockAdd({ pageId, blockId: block.id }));
        return rejectWithValue('Page not found');
      }
      
      // Get all blocks including the new one from the current state
      const allBlocks = page.blocks;
      
      // Save to server
      const updatedPage = await pagesApi.updatePage(pageId, { blocks: allBlocks });
      
      return { pageId, block, updatedPage };
    } catch (error: any) {
      // Revert the optimistic update on error
      dispatch(revertBlockAdd({ pageId, blockId: block.id }));
      console.error('Error adding block:', error);
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

// Update block thunk
export const updateBlock = createAsyncThunk(
  'ui/updateBlock',
  async ({ 
    pagePath, 
    blockId, 
    content, 
    checked, 
    toggleContent, 
    type, 
    rows, 
    columns, 
    language,
    mathMode,
    latex,
    fileName,
    fileSize,
    mimeType,
    fileKey,
    downloadUrl
  }: { 
    pagePath: string; 
    blockId: string; 
    content: string;
    type: Block['type'];
    checked?: boolean;
    toggleContent?: Block[];
    rows?: TableRow[];
    columns?: number;
    language?: string;
    mathMode?: 'inline' | 'display';
    latex?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    fileKey?: string;
    downloadUrl?: string;
  }, { getState }) => {
    const state = getState() as RootState;
    const page = state.ui.customPages.find(p => p._id === pagePath);
    if (!page) throw new Error('Page not found');

    const updatedBlocks = page.blocks.map(block => 
      block.id === blockId 
        ? { 
            ...block, 
            content, 
            checked, 
            toggleContent, 
            rows, 
            columns, 
            language,
            mathMode,
            latex,
            fileName,
            fileSize,
            mimeType,
            fileKey,
            downloadUrl
          }
        : block
    );

    const updatedPage = await pagesApi.updatePage(pagePath, { 
      blocks: updatedBlocks
    });
    
    return { 
      pagePath, 
      blockId, 
      content, 
      type, 
      checked, 
      toggleContent, 
      rows, 
      columns, 
      language,
      mathMode,
      latex,
      fileName,
      fileSize,
      mimeType,
      fileKey,
      downloadUrl,
      updatedPage 
    };
  }
);

// Delete block thunk
export const deleteBlock = createAsyncThunk(
  'ui/deleteBlock',
  async ({ pagePath, blockId }: { pagePath: string; blockId: string }, { getState }) => {
    const state = getState() as RootState;
    const page = state.ui.customPages.find(p => p._id === pagePath);
    if (!page) throw new Error('Page not found');

    // Find the block to be deleted
    const blockToDelete = page.blocks.find(block => block.id === blockId);
    
    // If it's a file block with a fileKey, delete the file from S3 first
    if (blockToDelete?.type === 'file' && blockToDelete.fileKey) {
      try {
        await api.delete(`/files/${encodeURIComponent(blockToDelete.fileKey)}`);
      } catch (error) {
        console.error('Error deleting file from S3:', error);
        // Continue with block deletion even if file deletion fails
      }
    }

    const updatedBlocks = page.blocks.filter(block => block.id !== blockId);
    const updatedPage = await pagesApi.updatePage(pagePath, { 
      blocks: updatedBlocks
    });
    
    return { pagePath, blockId, updatedPage };
  }
);

// Update page icon thunk
export const updatePageIcon = createAsyncThunk(
  'ui/updatePageIcon',
  async ({ pageId, icon }: { pageId: string; icon: string }, { dispatch, getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const page = state.ui.customPages.find(p => p._id === pageId);
    const previousIcon = page?.icon;

    try {
      // Optimistically update the UI
      dispatch(updatePageIconOptimistic({ pageId, icon }));

      // Make API call
      const updatedPage = await pagesApi.updatePage(pageId, { icon });
      return { pageId, icon };
    } catch (error: any) {
      // Revert on error
      dispatch(revertPageIcon({ pageId: pageId, previousIcon: previousIcon }));
      return rejectWithValue(error.message);
    }
  }
);

// Add to recently visited action
export const addToRecentlyVisited = createAsyncThunk(
  'ui/addToRecentlyVisited',
  async (page: { id: string; title: string; path: string; icon?: string }) => {
    const recentlyVisited = await pagesApi.addToRecentlyVisited(page.id);
    return recentlyVisited;
  }
);

// Fetch favorites
export const fetchFavorites = createAsyncThunk(
  'ui/fetchFavorites',
  async () => {
    try {
      const favorites = await pagesApi.getFavorites();
      return favorites;
    } catch (error: any) {
      throw error;
    }
  }
);

// Add to favorites
export const addToFavorites = createAsyncThunk(
  'ui/addToFavorites',
  async (pageId: string) => {
    try {
      const favorites = await pagesApi.addToFavorites(pageId);
      return favorites;
    } catch (error: any) {
      throw error;
    }
  }
);

// Remove from favorites
export const removeFromFavorites = createAsyncThunk(
  'ui/removeFromFavorites',
  async (pageId: string) => {
    try {
      const favorites = await pagesApi.removeFromFavorites(pageId);
      return favorites;
    } catch (error: any) {
      throw error;
    }
  }
);

// Add new thunk for template notifications
export const subscribeToTemplateNotifications = createAsyncThunk(
  'ui/subscribeToTemplateNotifications',
  async (email: string, { dispatch, getState }) => {
    const state = getState() as RootState;
    const user = state.auth.user;
    const response = await api.post('/templates/subscribe', { 
      email,
      name: user?.name // Send the user's actual name if they're logged in
    });

    // Update the user's templateSubscribed status in the auth slice
    if (user) {
      dispatch({
        type: 'auth/updateTemplateSubscribed',
        payload: true
      });
    }

    return response.data.email;
  }
);

// Add new action
export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.currentTheme = action.payload;
    },
    addNotification: (
      state,
      action: PayloadAction<{
        type: 'success' | 'error' | 'info' | 'warning';
        message: string;
      }>
    ) => {
      const id = Date.now().toString();
      state.notifications.push({
        id,
        ...action.payload
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    resetState: (state) => {
      state.customPages = [];
      state.trashedPages = [];
      state.recentlyVisited = [];
      state.isInitializing = true;
    },
    setInitialized: (state) => {
      state.isInitializing = false;
    },
    openModal: (
      state,
      action: PayloadAction<{ type: ModalType; data?: any }>
    ) => {
      state.modal = {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data || null
      };
    },
    closeModal: (state) => {
      state.modal = {
        isOpen: false,
        type: null,
        data: null
      };
    },
    addBlockOptimistic: (state, action: PayloadAction<{ pageId: string; block: Block }>) => {
      const { pageId, block } = action.payload;
      const pageIndex = state.customPages.findIndex(p => p._id === pageId);
      if (pageIndex !== -1) {
        if (!state.customPages[pageIndex].blocks) {
          state.customPages[pageIndex].blocks = [];
        }
        state.customPages[pageIndex].blocks.push(block);
      }
    },
    revertBlockAdd: (state, action: PayloadAction<{ pageId: string; blockId: string }>) => {
      const { pageId, blockId } = action.payload;
      const pageIndex = state.customPages.findIndex(p => p._id === pageId);
      if (pageIndex !== -1) {
        state.customPages[pageIndex].blocks = state.customPages[pageIndex].blocks.filter(
          b => b.id !== blockId
        );
      }
    },
    reorderPagesOptimistic: (state, action: PayloadAction<ApiPage[]>) => {
      state.customPages = action.payload;
    },
    revertPagesReorder: (state, action: PayloadAction<ApiPage[]>) => {
      state.customPages = action.payload;
    },
    updatePageIconOptimistic: (state, action: PayloadAction<{ pageId: string; icon: string }>) => {
      const page = state.customPages.find(p => p._id === action.payload.pageId);
      if (page) {
        page.icon = action.payload.icon;
      }
    },
    revertPageIcon: (state, action: PayloadAction<{ pageId: string; previousIcon: string | undefined }>) => {
      const page = state.customPages.find(p => p._id === action.payload.pageId);
      if (page) {
        page.icon = action.payload.previousIcon;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPages.pending, (state) => {
        state.isInitializing = true;
      })
      .addCase(fetchPages.fulfilled, (state, action) => {
        state.customPages = action.payload;
        state.isInitializing = false;
      })
      .addCase(fetchPages.rejected, (state) => {
        state.isInitializing = false;
      })
      .addCase(fetchPageByPath.fulfilled, (state, action) => {
        const index = state.customPages.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.customPages[index] = action.payload;
        } else {
          state.customPages.push(action.payload);
        }
      })
      .addCase(fetchTrashedPages.fulfilled, (state, action) => {
        state.trashedPages = action.payload;
      })
      .addCase(createPage.fulfilled, (state, action) => {
        state.customPages.push(action.payload);
      })
      .addCase(updatePage.fulfilled, (state, action) => {
        // Update in customPages
        const index = state.customPages.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.customPages[index] = action.payload;
        }
        
        // Also update in favorites if the page exists there
        const favoriteIndex = state.favorites.findIndex(p => p._id === action.payload._id);
        if (favoriteIndex !== -1) {
          state.favorites[favoriteIndex] = action.payload;
        }
      })
      .addCase(deletePage.fulfilled, (state, action) => {
        // Remove from customPages
        state.customPages = state.customPages.filter(p => p._id !== action.payload._id);
        
        // Add to trashedPages
        state.trashedPages.push(action.payload);
        
        // Immediately remove from recently visited
        state.recentlyVisited = state.recentlyVisited.filter(item => item.id !== action.payload._id);
        
        // Also remove from favorites if present
        state.favorites = state.favorites.filter(p => p._id !== action.payload._id);
      })
      .addCase(restorePage.fulfilled, (state, action) => {
        state.trashedPages = state.trashedPages.filter(p => p._id !== action.payload._id);
        state.customPages.push(action.payload);
      })
      .addCase(permanentlyDeletePage.fulfilled, (state, action) => {
        state.trashedPages = state.trashedPages.filter(p => p._id !== action.payload);
        // Also filter out the permanently deleted page from recently visited
        state.recentlyVisited = state.recentlyVisited.filter(item => item.id !== action.payload);
      })
      .addCase(reorderPages.fulfilled, (state, action) => {
        // Server update successful, no need to do anything as UI is already updated
      })
      .addCase(reorderPages.rejected, (state, action) => {
        // UI has already been reverted in the thunk
      })
      .addCase(addBlock.fulfilled, (state, action) => {
        const index = state.customPages.findIndex(p => p._id === action.payload.pageId);
        if (index !== -1) {
          const currentBlocks = state.customPages[index].blocks;
          state.customPages[index] = {
            ...action.payload.updatedPage,
            blocks: currentBlocks
          };
        }
      })
      .addCase(updateBlock.fulfilled, (state, action) => {
        const index = state.customPages.findIndex(p => p._id === action.payload.pagePath);
        if (index !== -1) {
          state.customPages[index] = action.payload.updatedPage;
        }
      })
      .addCase(deleteBlock.fulfilled, (state, action) => {
        const index = state.customPages.findIndex(p => p._id === action.payload.pagePath);
        if (index !== -1) {
          state.customPages[index] = action.payload.updatedPage;
        }
      })
      .addCase(updatePageIcon.fulfilled, (state, action) => {
        const page = state.customPages.find(p => p._id === action.payload.pageId);
        if (page) {
          page.icon = action.payload.icon;
        }
      })
      .addCase(addToRecentlyVisited.fulfilled, (state, action) => {
        // Transform server response to client format, with null checks
        state.recentlyVisited = action.payload
          .filter((visit: any) => visit?.pageId) // Filter out any null or undefined entries
          .map((visit: any) => ({
            id: visit.pageId?._id || '',
            title: visit.pageId?.name || '',
            path: visit.pageId?.path || '',
            icon: visit.pageId?.icon || 'File01Icon',
            visitedAt: visit.visitedAt || new Date().toISOString()
          }));
      })
      .addCase(fetchRecentlyVisited.fulfilled, (state, action) => {
        state.recentlyVisited = action.payload;
      })
      .addCase(fetchFavorites.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favorites = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch favorites';
      })
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.favorites = action.payload;
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to add to favorites';
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.favorites = action.payload;
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to remove from favorites';
      })
      .addCase(subscribeToTemplateNotifications.fulfilled, (state, action) => {
        if (!state.templateNotificationEmails.includes(action.payload)) {
          state.templateNotificationEmails.push(action.payload);
        }
      });
  }
});

export const {
  toggleSidebar,
  setTheme,
  addNotification,
  removeNotification,
  setLoading,
  openModal,
  closeModal,
  addBlockOptimistic,
  revertBlockAdd,
  reorderPagesOptimistic,
  revertPagesReorder,
  setInitialized,
  updatePageIconOptimistic,
  revertPageIcon,
  resetState
} = uiSlice.actions;

export default uiSlice.reducer; 