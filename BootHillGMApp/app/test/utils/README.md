# Test Utilities

This directory contains utility functions and helpers for testing the Boot Hill GM application.

## Organization

Our test utilities are organized in this single location to prevent duplication and provide a consistent testing approach throughout the application.

```
/app/test/utils/
  campaignTestWrappers.tsx  # Wrappers for testing with CampaignStateContext (legacy)
  testWrappers.tsx          # Wrappers for testing with GameStateProvider (current)
  gameStateTestUtils.ts     # Utilities for working with GameState objects
  localStorageMock.ts       # Mock implementation of localStorage for tests
  narrativeProviderMock.tsx # Mock for the NarrativeProvider
  ...
```

## Key Utilities

### Test Wrappers

- `renderWithGameProvider` - Renders components with GameStateProvider
- `renderWithMockContext` - Renders with a mocked GameStateContext
- `TestWrapper` - Simple wrapper component with all providers
- `TestCampaignStateProvider` - Campaign state provider for tests (legacy)

### State Utilities

- `createMockGameState` - Creates a GameState object with overrides
- `createMockCharacterState` - Creates a GameState with a mock character
- `mockPlayerCharacter` - Standard mock player character for tests
- `setupGameStorageMocks` - Configures GameStorage mocks consistently

### Usage Examples

```tsx
// Rendering a component with GameStateProvider
import { renderWithGameProvider } from '../../test/utils/testWrappers';
import { createMockGameState } from '../../test/utils/gameStateTestUtils';

it('renders player stats', () => {
  const mockState = createMockGameState({
    character: {
      player: {
        name: 'Test Character',
        // ...other properties
      },
      opponent: null
    }
  });
  
  const { getByText } = renderWithGameProvider(<PlayerStats />, mockState);
  expect(getByText('Test Character')).toBeInTheDocument();
});

// Using mock localStorage
import { mockLocalStorage } from '../../test/utils/gameStateTestUtils';

beforeEach(() => {
  mockLocalStorage.clear();
});

it('saves to localStorage', () => {
  // Test code...
  expect(mockLocalStorage.setItem).toHaveBeenCalledWith('game-state', expect.any(String));
});
```

## Best Practices

1. **Import from test/utils, not __tests__/utils**: Always import utilities from this directory
2. **Properly type mocks**: Use TypeScript interfaces for type-safe mocks
3. **Don't duplicate utilities**: If you need a new utility, add it here
4. **Use the appropriate wrapper**: Use GameStateProvider (current) instead of CampaignStateContext (legacy) when possible
