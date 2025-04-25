/**
 * Test case for the starting inventory fix.
 * This test verifies that the starting inventory is correctly generated
 * and used in character creation.
 */

import { getStartingInventory } from '../../utils/startingInventory';
import { gameInitializer } from '../../utils/storage/gameInitializer';

describe('Starting Inventory', () => {
  it('getStartingInventory should generate frontier-appropriate items', () => {
    // Mock the Date.now() function to ensure consistent IDs for comparison
    const originalDateNow = Date.now;
    const mockTimestamp = 1234567890;
    global.Date.now = jest.fn(() => mockTimestamp);
    
    try {
      // Get items from the function
      const startingItems = getStartingInventory();
      
      // Verify items are returned
      expect(startingItems.length).toBeGreaterThan(0);
      expect(startingItems.length).toBeLessThanOrEqual(5); // Should be 4-5 items
      
      // Verify the items match the expected starting inventory pattern
      startingItems.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('quantity');
        expect(item).toHaveProperty('category');
        
        // Verify ID matches the pattern used in startingInventory.ts
        expect(item.id).toMatch(/^starting_.*_\d+$/);
      });
      
      // Verify at least one expected item name is present (exact names may vary)
      const itemNames = startingItems.map(item => item.name.toLowerCase());
      expect(
        itemNames.some(name => 
          name.includes('canteen') || 
          name.includes('rope') || 
          name.includes('match') || 
          name.includes('blanket') || 
          name.includes('tobacco')
        )
      ).toBeTruthy();
    } finally {
      // Restore the original Date.now function
      global.Date.now = originalDateNow;
    }
  });
  
  it('gameInitializer should use getStartingInventory', () => {
    // Mock the Date.now() function to ensure consistent IDs for comparison
    const originalDateNow = Date.now;
    const mockTimestamp = 1234567890;
    global.Date.now = jest.fn(() => mockTimestamp);
    
    try {
      // Get items from the function
      const defaultItems = gameInitializer.getDefaultInventoryItems();
      
      // Verify items are returned
      expect(defaultItems.length).toBeGreaterThan(0);
      
      // Verify the items match the expected starting inventory pattern
      defaultItems.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('quantity');
        expect(item).toHaveProperty('category');
        
        // Verify ID matches the pattern used in startingInventory.ts
        expect(item.id).toMatch(/^starting_.*_\d+$/);
      });
    } finally {
      // Restore the original Date.now function
      global.Date.now = originalDateNow;
    }
  });
});
