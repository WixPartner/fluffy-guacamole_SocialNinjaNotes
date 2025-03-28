import { api } from './axios';
import { Block } from './pages';

export const aiApi = {
  // Generate blocks from prompt
  generateBlocks: async (prompt: string): Promise<Block[]> => {
    try {
      const response = await api.post('/ai/generate-blocks', { prompt });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate blocks');
    }
  }
}; 