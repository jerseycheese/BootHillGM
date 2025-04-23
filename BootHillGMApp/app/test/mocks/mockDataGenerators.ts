/**
 * Mock Data Generators
 * 
 * Provides functions to generate consistent mock data for tests.
 */

/**
 * Generator for mock character data
 * 
 * @param overrides Properties to override in the mock character
 * @returns A mock character object
 */
export function generateMockCharacter(overrides = { /* Intentionally empty */ }) {
  return {
    id: 'mock-character-1',
    name: 'Mock Character',
    isNPC: false,
    isPlayer: true,
    inventory: { items: [] },
    attributes: {
      strength: 10,
      baseStrength: 10,
      speed: 8,
      gunAccuracy: 7,
      throwingAccuracy: 6,
      bravery: 7,
      experience: 3
    },
    minAttributes: {
      strength: 8,
      baseStrength: 8,
      speed: 1,
      gunAccuracy: 1,
      throwingAccuracy: 1,
      bravery: 1,
      experience: 0
    },
    maxAttributes: {
      strength: 20,
      baseStrength: 20,
      speed: 20,
      gunAccuracy: 20,
      throwingAccuracy: 20,
      bravery: 20,
      experience: 11
    },
    wounds: [],
    isUnconscious: false,
    ...overrides
  };
}

/**
 * Generator for mock opponent data
 * 
 * @param overrides Properties to override in the mock opponent
 * @returns A mock opponent object
 */
export function generateMockOpponent(overrides = { /* Intentionally empty */ }) {
  return {
    id: 'mock-opponent-1',
    name: 'Mock Opponent',
    isNPC: true,
    isPlayer: false,
    inventory: { items: [] },
    attributes: {
      strength: 9,
      baseStrength: 9,
      speed: 7,
      gunAccuracy: 6,
      throwingAccuracy: 5,
      bravery: 8,
      experience: 4
    },
    minAttributes: {
      strength: 8,
      baseStrength: 8,
      speed: 1,
      gunAccuracy: 1,
      throwingAccuracy: 1,
      bravery: 1,
      experience: 0
    },
    maxAttributes: {
      strength: 20,
      baseStrength: 20,
      speed: 20,
      gunAccuracy: 20,
      throwingAccuracy: 20,
      bravery: 20,
      experience: 11
    },
    wounds: [],
    isUnconscious: false,
    ...overrides
  };
}

/**
 * Generator for mock combat state
 * 
 * @param overrides Properties to override in the mock combat state
 * @returns A mock combat state object
 */
export function generateMockCombatState(overrides = { /* Intentionally empty */ }) {
  return {
    active: true,
    type: 'brawling',
    state: {
      round: 1,
      isPlayerTurn: true,
      playerActions: [],
      opponentActions: []
    },
    history: [],
    ...overrides
  };
}

/**
 * Generator for mock inventory items
 * 
 * @param count Number of items to generate
 * @returns An array of mock inventory items
 */
export function generateMockInventoryItems(count = 3) {
  const itemTypes = ['weapon', 'consumable', 'key', 'armor'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `mock-item-${i + 1}`,
    name: `Mock Item ${i + 1}`,
    type: itemTypes[i % itemTypes.length],
    description: `Description for mock item ${i + 1}`,
    value: (i + 1) * 10
  }));
}

/**
 * Generator for mock journal entries
 * 
 * @param count Number of entries to generate
 * @returns An array of mock journal entries
 */
export function generateMockJournalEntries(count = 3) {
  return Array.from({ length: count }, (_, i) => ({
    id: `entry-${i + 1}`,
    title: `Journal Entry ${i + 1}`,
    content: `This is the content for journal entry ${i + 1}`,
    timestamp: new Date(2025, 0, i + 1).toISOString(),
    location: `Location ${i + 1}`
  }));
}
