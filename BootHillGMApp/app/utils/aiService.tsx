// BootHillGMApp/app/utils/aiService.tsx

import { /* Intentionally empty */ } from '../types/character';
import { /* Intentionally empty */ } from './retry';
import { getAIResponse } from '../services/ai/gameService';
import { getAIModel } from './ai/aiConfig';
import { getCharacterCreationStep } from './ai/characterCreationPrompts';
import { validateAttributeValue } from './ai/attributeValidation';
import { generateCompleteCharacter } from './ai/characterGeneration';
import { generateFieldValue } from './ai/fieldValueGeneration';
import { generateNarrativeSummary } from './ai/narrativeSummary';
import { determineIfWeapon } from './ai/weaponDetermination';
import { generateCharacterSummary } from './ai/characterSummary';

export {
  getAIResponse,
  getAIModel,
  getCharacterCreationStep,
  validateAttributeValue,
  generateCompleteCharacter,
  generateFieldValue,
  generateNarrativeSummary,
  determineIfWeapon,
  generateCharacterSummary,
};
