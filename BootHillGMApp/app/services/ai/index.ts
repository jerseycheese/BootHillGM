import { determineIfWeapon } from '../../utils/ai/aiUtils';
import { generateNarrativeSummary } from '../../utils/ai/narrativeSummary';

export { AIService } from './aiService';
export { generateCompleteCharacter, generateCharacterSummary } from './characterService';
export { getAIResponse } from './gameService';
export { generateNarrativeSummary, determineIfWeapon };
export * from './types';

// Export AI Decision Service
export { default as AIDecisionService } from './aiDecisionService';

// Export type definitions
export * from './types/aiDecisionTypes';

// Export utility functions for direct access if needed
export * from './utils/aiDecisionDetector';
export * from './utils/aiDecisionGenerator';
