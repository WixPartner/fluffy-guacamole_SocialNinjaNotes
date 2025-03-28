import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Member {
  userId: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
}

interface Workspace {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  members: Member[];
  settings: {
    defaultDocumentPermission: 'private' | 'public';
  };
  createdAt: string;
  updatedAt: string;
}

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: WorkspaceState = {
  workspaces: [],
  currentWorkspace: null,
  isLoading: false,
  error: null
};

// Async thunks
export const fetchWorkspaces = createAsyncThunk('workspace/fetchAll', async () => {
  const response = await axios.get('/api/workspaces');
  return response.data;
});

export const fetchWorkspaceById = createAsyncThunk(
  'workspace/fetchById',
  async (workspaceId: string) => {
    const response = await axios.get(`/api/workspaces/${workspaceId}`);
    return response.data;
  }
);

export const createWorkspace = createAsyncThunk(
  'workspace/create',
  async (data: { name: string; description?: string }) => {
    const response = await axios.post('/api/workspaces', data);
    return response.data;
  }
);

export const updateWorkspace = createAsyncThunk(
  'workspace/update',
  async ({ workspaceId, data }: { workspaceId: string; data: Partial<Workspace> }) => {
    const response = await axios.put(`/api/workspaces/${workspaceId}`, data);
    return response.data;
  }
);

export const deleteWorkspace = createAsyncThunk(
  'workspace/delete',
  async (workspaceId: string) => {
    await axios.delete(`/api/workspaces/${workspaceId}`);
    return workspaceId;
  }
);

export const updateWorkspaceMembers = createAsyncThunk(
  'workspace/updateMembers',
  async ({
    workspaceId,
    members
  }: {
    workspaceId: string;
    members: Member[];
  }) => {
    const response = await axios.put(`/api/workspaces/${workspaceId}/members`, {
      members
    });
    return response.data;
  }
);

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setCurrentWorkspace: (state, action: PayloadAction<Workspace>) => {
      state.currentWorkspace = action.payload;
    },
    clearCurrentWorkspace: (state) => {
      state.currentWorkspace = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all workspaces
      .addCase(fetchWorkspaces.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workspaces = action.payload;
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch workspaces';
      })
      // Fetch workspace by ID
      .addCase(fetchWorkspaceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentWorkspace = action.payload;
      })
      .addCase(fetchWorkspaceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch workspace';
      })
      // Create workspace
      .addCase(createWorkspace.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workspaces.push(action.payload);
        state.currentWorkspace = action.payload;
      })
      .addCase(createWorkspace.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create workspace';
      })
      // Update workspace
      .addCase(updateWorkspace.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateWorkspace.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.workspaces.findIndex(w => w._id === action.payload._id);
        if (index !== -1) {
          state.workspaces[index] = action.payload;
        }
        if (state.currentWorkspace?._id === action.payload._id) {
          state.currentWorkspace = action.payload;
        }
      })
      .addCase(updateWorkspace.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update workspace';
      })
      // Delete workspace
      .addCase(deleteWorkspace.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteWorkspace.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workspaces = state.workspaces.filter(w => w._id !== action.payload);
        if (state.currentWorkspace?._id === action.payload) {
          state.currentWorkspace = null;
        }
      })
      .addCase(deleteWorkspace.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete workspace';
      })
      // Update workspace members
      .addCase(updateWorkspaceMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateWorkspaceMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.workspaces.findIndex(w => w._id === action.payload._id);
        if (index !== -1) {
          state.workspaces[index] = action.payload;
        }
        if (state.currentWorkspace?._id === action.payload._id) {
          state.currentWorkspace = action.payload;
        }
      })
      .addCase(updateWorkspaceMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update workspace members';
      });
  }
});

export const { setCurrentWorkspace, clearCurrentWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer; 