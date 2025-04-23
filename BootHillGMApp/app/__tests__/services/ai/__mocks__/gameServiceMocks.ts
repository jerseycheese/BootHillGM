/**
 * Mock data for AI Game Service tests
 * 
 * Contains mock response data, suggested actions, and other test fixtures
 * used to test the AI Game Service functionality.
 */
import { SuggestedAction } from '../../../../types/campaign';
import { Character } from '../../../../types/character';
import { GameServiceResponse } from '../../../../services/ai/types/gameService.types';

/**
 * Mock suggested actions used in test cases.
 * These are used to test both the success path and fallback path.
 */

// Default suggested actions generated within getAIResponse success path
export const successPathDefaultActions: SuggestedAction[] = [
  { id: 'fallback-ai-1', title: "Look around", type: "basic", description: "Survey your surroundings" },
  { id: 'fallback-ai-2', title: "Continue forward", type: "main", description: "Proceed on your journey" },
  { id: 'fallback-ai-3', title: "Check your inventory", type: "interaction", description: "See what you're carrying" }
];

// Default suggested actions from generateFallbackResponse
export const fallbackPathDefaultActions: SuggestedAction[] = [
  { id: 'fallback-gen-1', title: "Look around", type: "basic", description: "Survey your surroundings" },
  { id: 'fallback-gen-2', title: "Check your inventory", type: "interaction", description: "See what you're carrying" },
  { id: 'fallback-gen-3', title: "Rest for a while", type: "optional", description: "Recover your energy" },
  { id: 'fallback-gen-4', title: "Continue forward", type: "main", description: "Press on with your journey" }
];

/**
 * Mock response objects for various test scenarios.
 * 
 * These objects simulate different AI response types:
 * - Basic successful responses
 * - Player decision test cases
 * - Location type variations
 * - Combat scenarios
 * - Error test cases
 */

// Basic successful response
export const mockBasicResponse: Partial<GameServiceResponse> = {
  narrative: 'Test narrative',
  location: { type: 'town', name: 'Testville' },
  combatInitiated: false,
  opponent: null,
  acquiredItems: [],
  removedItems: [],
  suggestedActions: [],
  lore: undefined,
  playerDecision: undefined,
  storyProgression: undefined,
};

/**
 * Player decision response fixtures
 */

// Response with valid player decision (two options)
export const mockPlayerDecisionResponse: Partial<GameServiceResponse> = {
  narrative: 'Test narrative',
  location: { type: 'town', name: 'Test Town' },
  combatInitiated: false,
  acquiredItems: [],
  removedItems: [],
  suggestedActions: [],
  playerDecision: {
    id: 'mock-decision-1', // Added
    timestamp: Date.now(), // Added
    aiGenerated: true, // Added
    prompt: 'What will you do?',
    options: [
      { id: 'decision-opt-1', text: 'Option 1', impact: 'Impact 1' },
      { id: 'decision-opt-2', text: 'Option 2', impact: 'Impact 2' }
    ],
    importance: 'significant',
    context: 'Decision context'
  }
};

// Response with invalid player decision (only one option)
export const mockInvalidPlayerDecisionResponse: Partial<GameServiceResponse> = {
  narrative: 'Test narrative',
  location: { type: 'town', name: 'Test Town' },
  combatInitiated: false,
  acquiredItems: [],
  removedItems: [],
  suggestedActions: [],
  playerDecision: {
    id: 'mock-invalid-decision-1', // Added
    timestamp: Date.now(), // Added
    aiGenerated: true, // Added
    prompt: 'What will you do?',
    options: [{ id: 'invalid-decision-opt-1', text: 'Option 1', impact: 'Impact 1' }], // Only one option, should be invalid
    importance: 'significant',
    context: 'Invalid decision context' // Added
  }
};

/**
 * Location type response fixtures
 */

// Town location response
export const mockTownResponse: Partial<GameServiceResponse> = {
  narrative: 'You are in a town.',
  location: { type: 'town', name: 'Dusty Gulch' },
  combatInitiated: false,
  opponent: null,
  acquiredItems: [],
  removedItems: [],
  suggestedActions: [], 
  lore: undefined,
  playerDecision: undefined,
  storyProgression: undefined,
};

// Wilderness location response
export const mockWildernessResponse: Partial<GameServiceResponse> = {
  narrative: 'You are in the wilderness.',
  location: { type: 'wilderness', description: 'Open plains' },
  combatInitiated: false,
  opponent: null,
  acquiredItems: [],
  removedItems: [],
  suggestedActions: [],
  lore: undefined,
  playerDecision: undefined,
  storyProgression: undefined,
};

// Landmark location response
export const mockLandmarkResponse: Partial<GameServiceResponse> = {
  narrative: 'You see a landmark.',
  location: { type: 'landmark', name: 'Hidden Valley', description: 'A secluded valley' },
  combatInitiated: false,
  opponent: null,
  acquiredItems: [],
  removedItems: [],
  suggestedActions: [],
  lore: undefined,
  playerDecision: undefined,
  storyProgression: undefined,
};

// Unknown location response
export const mockUnknownResponse: Partial<GameServiceResponse> = {
  narrative: 'You are lost.',
  location: { type: 'unknown' },
  combatInitiated: false,
  opponent: null,
  acquiredItems: [],
  removedItems: [],
  suggestedActions: [],
  lore: undefined,
  playerDecision: undefined,
  storyProgression: undefined,
};

/**
 * Combat response fixtures
 */

// Combat response with opponent
export const mockCombatResponse: Partial<GameServiceResponse> = {
  narrative: 'You are attacked!',
  location: { type: 'wilderness', description: 'Open plains' },
  combatInitiated: true,
  opponent: {
    id: 'opponent-1',
    name: 'Bandit',
    attributes: {
      strength: 10,
      baseStrength: 10,
      speed: 5,
      gunAccuracy: 5,
      throwingAccuracy: 5,
      bravery: 5,
      experience: 0,
    },
    // Add missing properties required by Character type
    minAttributes: { strength: 0, baseStrength: 0, speed: 0, gunAccuracy: 0, throwingAccuracy: 0, bravery: 0, experience: 0 },
    maxAttributes: { strength: 20, baseStrength: 20, speed: 10, gunAccuracy: 10, throwingAccuracy: 10, bravery: 10, experience: 100 },
    wounds: [],
    isUnconscious: false,
    inventory: { items: [] },
    isNPC: true,
    isPlayer: false,
  } as Character,
  acquiredItems: [],
  removedItems: [],
  suggestedActions: [],
  lore: undefined,
  playerDecision: undefined,
  storyProgression: undefined,
};

// Response with missing opponent
export const mockMissingOpponentResponse: Partial<GameServiceResponse> = {
  narrative: 'All is quiet.',
  location: { type: 'town', name: 'Peaceful Town' },
  combatInitiated: false,
  // opponent intentionally omitted
  acquiredItems: [],
  removedItems: [],
  suggestedActions: [],
};

/**
 * Error case response fixtures
 */

// Invalid JSON structure response
export const mockInvalidJsonResponse = {
  narrative: 'Test narrative',
  location: 'invalid location', // Should be an object
};

// Invalid location type response
export const mockInvalidLocationResponse: Partial<GameServiceResponse> = {
  narrative: 'Test narrative',
  // @ts-expect-error - Intentionally using invalid type for testing error handling
  location: { type: 'invalid', name: 'Invalid Location' }, // Invalid type
  combatInitiated: false,
  opponent: null,
  acquiredItems: [],
  removedItems: [],
  suggestedActions: [],
};

/**
 * Special case response fixtures
 */

// Location consistency response
export const mockLocationConsistencyResponse: Partial<GameServiceResponse> = {
  narrative: 'You arrive in the town of Redemption. The dusty streets are quiet under the midday sun.',
  location: { type: 'town', name: 'Redemption' },
  combatInitiated: false,
  opponent: null,
  acquiredItems: [],
  removedItems: [],
  suggestedActions: [],
};

// Wilderness description response
export const mockWildernessDescriptionResponse: Partial<GameServiceResponse> = {
  narrative: 'You trek through rolling hills dotted with scrub brush and cacti.',
  location: { type: 'wilderness', description: 'Rolling hills dotted with scrub brush and cacti' },
  combatInitiated: false,
  opponent: null,
  acquiredItems: [],
  removedItems: [],
  suggestedActions: [],
};

/**
 * Fallback response fixture
 */

// Default fallback response
export const defaultFallbackResponse: GameServiceResponse = {
  narrative: "the player considers their next move. The western frontier stretches out before you, full of opportunity and danger. The decisions you make here could shape your fortune - for better or worse. A moment's consideration might be the difference between success and disaster.",
  location: { type: 'town', name: 'Boot Hill' },
  combatInitiated: false,
  opponent: null,
  acquiredItems: [],
  removedItems: [],
  suggestedActions: [
    { id: 'fallback-gen-1', title: "Focus on your objective", description: "Remember why you're here", type: 'main' },
    { id: 'fallback-gen-2', title: "Look for interesting details", description: "Find something worth investigating", type: 'side' },
    { id: 'fallback-gen-3', title: "Prepare for trouble", description: "Stay ready for action", type: 'combat' },
    { id: 'fallback-gen-4', title: "Find someone to talk to", description: "Look for information from others", type: 'interaction' }
  ],
  lore: undefined,
  playerDecision: undefined,
  storyProgression: undefined,
};