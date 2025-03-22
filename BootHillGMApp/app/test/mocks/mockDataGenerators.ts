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
export function generateMockCharacter(overrides = {}) {
  return {
    id: 'mock-character-1',
    name: 'Mock Character',
    strength: 10,
    dexterity: 8,
    will: 6,
    health: 20,
    maxHealth: 20,
    inventory: [],
    skills: {
      shooting: 3,
      riding: 2,
      gambling: 1
    },
    ...overrides
  };
}

/**
 * Generator for mock opponent data
 * 
 * @param overrides Properties to override in the mock opponent
 * @returns A mock opponent object
 */
export function generateMockOpponent(overrides = {}) {
  return {
    id: 'mock-opponent-1',
    name: 'Mock Opponent',
    strength: 8,
    dexterity: 7,
    will: 5,
    health: 16,
    maxHealth: 16,
    inventory: [],
    skills: {
      shooting: 2,
      riding: 1,
      brawling: 3
    },
    ...overrides
  };
}

/**
 * Generator for mock combat state
 * 
 * @param overrides Properties to override in the mock combat state
 * @returns A mock combat state object
 */
export function generateMockCombatState(overrides = {}) {
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
