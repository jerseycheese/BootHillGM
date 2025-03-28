import { migrateGameState } from '../../utils/stateMigration';
import { GameState } from '../../types/gameState';
import { Character } from '../../types/character';

// Define a test-specific version that exactly matches what's expected
const expectedNarrativeState = {
  currentStoryPoint: null,
  visitedPoints: [],
  availableChoices: [],
  narrativeHistory: [],
  displayMode: 'standard',
  error: null
};

describe('migrateGameState', () => {
  it('should add initial narrative state if missing', () => {
    const oldState: Partial<GameState> = {
      character: { 
        name: 'Test Character',
        isNPC: false,
        isPlayer: true,
        id: 'test-id',
        inventory: [],
        attributes: {
          speed: 10,
          gunAccuracy: 10,
          throwingAccuracy: 10,
          strength: 10,
          baseStrength: 10,
          bravery: 10,
          experience: 5
        },
        minAttributes: {
          speed: 5,
          gunAccuracy: 5,
          throwingAccuracy: 5,
          strength: 5,
          baseStrength: 5,
          bravery: 5,
          experience: 5
        },
        maxAttributes: {
          speed: 15,
          gunAccuracy: 15,
          throwingAccuracy: 15,
          strength: 15,
          baseStrength: 15,
          bravery: 15,
          experience: 15,
        },
        wounds: [],
        isUnconscious: false,
       } as Character
    };
    const migratedState = migrateGameState(oldState as GameState);
    
    // Extract only the expected properties for comparison
    const actualNarrativeState = {
      currentStoryPoint: migratedState.narrative.currentStoryPoint,
      visitedPoints: migratedState.narrative.visitedPoints,
      availableChoices: migratedState.narrative.availableChoices,
      narrativeHistory: migratedState.narrative.narrativeHistory,
      displayMode: migratedState.narrative.displayMode,
      error: migratedState.narrative.error
    };
    
    expect(actualNarrativeState).toEqual(expectedNarrativeState);
  });

  it('should not modify existing narrative state', () => {
    const existingNarrativeState = {
      ...expectedNarrativeState,
      narrativeHistory: ['Some history'],
    };
    const oldState: Partial<GameState> = {
      narrative: existingNarrativeState,
    };
    const migratedState = migrateGameState(oldState as GameState);
    
    // Extract only the expected properties for comparison
    const actualNarrativeState = {
      currentStoryPoint: migratedState.narrative.currentStoryPoint,
      visitedPoints: migratedState.narrative.visitedPoints,
      availableChoices: migratedState.narrative.availableChoices,
      narrativeHistory: migratedState.narrative.narrativeHistory,
      displayMode: migratedState.narrative.displayMode,
      error: migratedState.narrative.error
    };
    
    // Compare only the properties we care about
    expect(actualNarrativeState).toEqual(existingNarrativeState);
  });

  it('should handle undefined state', () => {
      const migratedState = migrateGameState(undefined);
      
      // Extract only the expected properties for comparison
      const actualNarrativeState = {
        currentStoryPoint: migratedState.narrative.currentStoryPoint,
        visitedPoints: migratedState.narrative.visitedPoints,
        availableChoices: migratedState.narrative.availableChoices,
        narrativeHistory: migratedState.narrative.narrativeHistory,
        displayMode: migratedState.narrative.displayMode,
        error: migratedState.narrative.error
      };
      
      expect(actualNarrativeState).toEqual(expectedNarrativeState);
  });

  it('should return a valid GameState object', () => {
    const oldState: Partial<GameState> = {};
    const migratedState = migrateGameState(oldState as GameState);
    expect(migratedState).toHaveProperty('narrative');
    // Add more checks for other required properties if needed
  });
});