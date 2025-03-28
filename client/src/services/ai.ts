import { api } from '../api/axios';
import { store } from '../store';
import { updateAiCredits } from '../store/slices/authSlice';

export const aiService = {
  async generateBlocks(prompt: string) {
    const response = await api.post('/ai/generate-blocks', { prompt });
    
    // Update AI credits from response headers
    const creditsUsed = response.headers['x-ai-credits-used'];
    const lastResetDate = response.headers['x-ai-credits-last-reset'];
    
    if (creditsUsed) {
      store.dispatch(updateAiCredits({
        used: parseInt(creditsUsed, 10),
        lastResetDate: lastResetDate || new Date().toISOString()
      }));
    }

    return response.data;
  },

  async getCreditsUsage() {
    const response = await api.get('/ai/credits');
    store.dispatch(updateAiCredits({
      used: response.data.currentUsage,
      lastResetDate: response.data.lastResetDate
    }));
    return response.data;
  }
}; 