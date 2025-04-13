# Test Utilities

## TestCampaignStateProvider

The `TestCampaignStateProvider` is a specialized React context provider for testing components that rely on the CampaignStateContext.

### Purpose

The primary purpose of this provider is to:

1. Create a consistent testing environment for components that use campaign state
2. Handle both legacy and new state formats automatically
3. Provide mock dispatch and other context functions
4. Ensure all required state properties exist to prevent test failures

### Usage

```typescript
import { TestCampaignStateProvider } from '../utils/testWrappers';

// Basic usage with empty state
const { result } = renderHook(() => useMyHook(), {
  wrapper: ({ children }) => (
    <TestCampaignStateProvider>
      {children}
    </TestCampaignStateProvider>
  )
});

// With custom initial state
const { result } = renderHook(() => useMyHook(), {
  wrapper: ({ children }) => (
    <TestCampaignStateProvider initialState={{
      inventory: [{ id: 'test1', name: 'Test Item' }]
    }}>
      {children}
    </TestCampaignStateProvider>
  )
});
```

### State Normalization

The provider automatically normalizes state to work with both the legacy CampaignState format and the new GameState format. It ensures that:

- Character data is available both as `character.player` and as `player`
- Inventory items are accessible both as `inventory` array and as `inventory.items`
- Journal entries are accessible both as `journal` array and as `journal.entries`

### Mock Functions

The provider includes these mock functions:

- `dispatch`: Mock function that logs actions when called
- `saveGame`: Mock function for saving game state
- `loadGame`: Mock function for loading game state
- `cleanupState`: Mock function for cleaning up state

### Example: Testing a Selector Hook

```typescript
import { renderHook } from '@testing-library/react';
import { useInventoryItems } from '../../hooks/selectors/useInventoryItems';
import { TestCampaignStateProvider } from '../utils/testWrappers';

describe('useInventoryItems', () => {
  it('should return items from legacy array format', () => {
    const testItems = [
      { id: '1', name: 'Test Item 1', category: 'weapon' },
      { id: '2', name: 'Test Item 2', category: 'medical' },
    ];
    
    const { result } = renderHook(() => useInventoryItems(), {
      wrapper: ({ children }) => (
        <TestCampaignStateProvider initialState={{ inventory: testItems }}>
          {children}
        </TestCampaignStateProvider>
      )
    });
    
    expect(result.current).toEqual(testItems);
  });
  
  it('should return items from new domain slice format', () => {
    const testItems = [
      { id: '1', name: 'Test Item 1', category: 'weapon' },
      { id: '2', name: 'Test Item 2', category: 'medical' },
    ];
    
    const { result } = renderHook(() => useInventoryItems(), {
      wrapper: ({ children }) => (
        <TestCampaignStateProvider initialState={{ 
          inventory: { items: testItems } 
        }}>
          {children}
        </TestCampaignStateProvider>
      )
    });
    
    expect(result.current).toEqual(testItems);
  });
});