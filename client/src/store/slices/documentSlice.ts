import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Permission {
  public: boolean;
  canEdit: string[];
  canView: string[];
}

interface Collaborator {
  userId: string;
  email: string;
  permission: 'view' | 'edit' | 'admin';
}

interface Document {
  _id: string;
  title: string;
  content: any;
  description?: string;
  owner: string;
  workspace: string;
  parent?: string;
  type: 'document' | 'folder';
  permissions: Permission;
  collaborators: Collaborator[];
  version: number;
  lastModified: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DocumentState = {
  documents: [],
  currentDocument: null,
  isLoading: false,
  error: null
};

// Async thunks
export const fetchWorkspaceDocuments = createAsyncThunk(
  'document/fetchByWorkspace',
  async (workspaceId: string) => {
    const response = await axios.get(`/api/documents/workspace/${workspaceId}`);
    return response.data;
  }
);

export const fetchDocumentById = createAsyncThunk(
  'document/fetchById',
  async (documentId: string) => {
    const response = await axios.get(`/api/documents/${documentId}`);
    return response.data;
  }
);

export const createDocument = createAsyncThunk(
  'document/create',
  async (data: {
    title: string;
    description?: string;
    content?: any;
    workspaceId: string;
    parentId?: string;
    type?: 'document' | 'folder';
  }) => {
    const response = await axios.post('/api/documents', data);
    return response.data;
  }
);

export const updateDocument = createAsyncThunk(
  'document/update',
  async ({
    documentId,
    data
  }: {
    documentId: string;
    data: Partial<Document>;
  }) => {
    const response = await axios.put(`/api/documents/${documentId}`, data);
    return response.data;
  }
);

export const deleteDocument = createAsyncThunk(
  'document/delete',
  async (documentId: string) => {
    await axios.delete(`/api/documents/${documentId}`);
    return documentId;
  }
);

export const updateDocumentPermissions = createAsyncThunk(
  'document/updatePermissions',
  async ({
    documentId,
    collaborators
  }: {
    documentId: string;
    collaborators: Collaborator[];
  }) => {
    const response = await axios.put(`/api/documents/${documentId}/permissions`, {
      collaborators
    });
    return response.data;
  }
);

const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    setCurrentDocument: (state, action: PayloadAction<Document>) => {
      state.currentDocument = action.payload;
    },
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
    },
    updateDocumentContent: (
      state,
      action: PayloadAction<{ content: any; version: number }>
    ) => {
      if (state.currentDocument) {
        state.currentDocument.content = action.payload.content;
        state.currentDocument.version = action.payload.version;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch workspace documents
      .addCase(fetchWorkspaceDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaceDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = action.payload;
      })
      .addCase(fetchWorkspaceDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch documents';
      })
      // Fetch document by ID
      .addCase(fetchDocumentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDocument = action.payload;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch document';
      })
      // Create document
      .addCase(createDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents.push(action.payload);
        state.currentDocument = action.payload;
      })
      .addCase(createDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create document';
      })
      // Update document
      .addCase(updateDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.documents.findIndex(d => d._id === action.payload._id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        if (state.currentDocument?._id === action.payload._id) {
          state.currentDocument = action.payload;
        }
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update document';
      })
      // Delete document
      .addCase(deleteDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = state.documents.filter(d => d._id !== action.payload);
        if (state.currentDocument?._id === action.payload) {
          state.currentDocument = null;
        }
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete document';
      })
      // Update document permissions
      .addCase(updateDocumentPermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDocumentPermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.documents.findIndex(d => d._id === action.payload._id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        if (state.currentDocument?._id === action.payload._id) {
          state.currentDocument = action.payload;
        }
      })
      .addCase(updateDocumentPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update document permissions';
      });
  }
});

export const {
  setCurrentDocument,
  clearCurrentDocument,
  updateDocumentContent
} = documentSlice.actions;
export default documentSlice.reducer; 