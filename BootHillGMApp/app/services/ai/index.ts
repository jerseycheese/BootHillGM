/**
 * Centralized AI service exports
 */

import { AIService } from './aiService';

export { AIService };

// Create and export a default instance for shared use
export const aiServiceInstance = new AIService();

// Export default for module pattern
export default AIService;