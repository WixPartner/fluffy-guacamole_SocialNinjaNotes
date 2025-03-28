import { api } from './axios';

export interface Block {
  id: string;
  type: 'text' | 'bullet-list' | 'number-list' | 'todo-list' | 'toggle-list' | 'heading1' | 'heading2' | 'heading3' | 'table' | 'schedule' | 'picture' | 'code' | 'equation' | 'file';
  content: string;
  checked?: boolean;
  toggleContent?: Block[];
  rows?: TableRow[];
  columns?: number;
  scheduleType?: 'daily' | 'weekly' | 'project';
  timeFormat?: '12h' | '24h';
  showWeekends?: boolean;
  defaultDuration?: number;
  defaultStatus?: string;
  defaultPriority?: string;
  colorCoding?: boolean;
  showRowHeaders?: boolean;
  showColumnHeaders?: boolean;
  autoSort?: boolean;
  language?: string;
  mathMode?: 'inline' | 'display';  // For equation blocks
  latex?: string;  // Raw LaTeX content
  // File block properties
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  fileKey?: string;  // S3 key
  downloadUrl?: string;  // Presigned URL
}

export interface TableCell {
  id: string;
  content: string;
}

export interface TableRow {
  id: string;
  cells: TableCell[];
  columnWidths?: number[];
}

export interface Page {
  _id: string;
  name: string;
  path: string;
  icon?: string;
  blocks: Block[];
  order: number;
  isDeleted: boolean;
  deletedAt?: string;
  lastEditedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecentlyVisited {
  pageId: {
    _id: string;
    name: string;
    path: string;
    icon?: string;
  };
  visitedAt: string;
}

export const pagesApi = {
  // Get all pages
  getPages: async (): Promise<Page[]> => {
    try {
      const response = await api.get('/pages');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch pages');
    }
  },

  // Get page by path
  getPageByPath: async (path: string): Promise<Page> => {
    try {
      const response = await api.get(`/pages/by-path/${path}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch page');
    }
  },

  // Create a new page
  createPage: async (page: Partial<Page>): Promise<Page> => {
    try {
      const response = await api.post('/pages', page);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create page');
    }
  },

  // Update a page
  updatePage: async (id: string, updates: Partial<Page>): Promise<Page> => {
    try {
      const response = await api.put(`/pages/${id}`, updates);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update page');
    }
  },

  // Delete a page (move to trash)
  deletePage: async (id: string): Promise<Page> => {
    try {
      const response = await api.delete(`/pages/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete page');
    }
  },

  // Get trashed pages
  getTrashedPages: async (): Promise<Page[]> => {
    try {
      const response = await api.get('/pages/trash');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch trashed pages');
    }
  },

  // Restore page from trash
  restorePage: async (id: string): Promise<Page> => {
    try {
      const response = await api.post(`/pages/${id}/restore`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to restore page');
    }
  },

  // Permanently delete page
  permanentlyDeletePage: async (id: string): Promise<{ message: string; _id: string }> => {
    try {
      const response = await api.delete(`/pages/${id}/permanent`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to permanently delete page');
    }
  },

  // Reorder pages
  reorderPages: async (pages: { _id: string; order: number }[]): Promise<Page[]> => {
    try {
      const response = await api.post('/pages/reorder', { pages });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reorder pages');
    }
  },

  // Add page to recently visited
  addToRecentlyVisited: async (id: string): Promise<RecentlyVisited[]> => {
    try {
      const response = await api.post(`/pages/${id}/visit`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update recently visited pages');
    }
  },

  // Get recently visited pages
  getRecentlyVisited: async (): Promise<RecentlyVisited[]> => {
    try {
      const response = await api.get('/pages/recent');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recently visited pages');
    }
  },

  // Get favorite pages
  getFavorites: async (): Promise<Page[]> => {
    try {
      const response = await api.get('/pages/favorites');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch favorite pages');
    }
  },

  // Add page to favorites
  addToFavorites: async (id: string): Promise<Page[]> => {
    try {
      const response = await api.post(`/pages/${id}/favorite`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add page to favorites');
    }
  },

  // Remove page from favorites
  removeFromFavorites: async (id: string): Promise<Page[]> => {
    try {
      const response = await api.delete(`/pages/${id}/favorite`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to remove page from favorites');
    }
  }
}; 