# Test Utilities Migration

## Overview

We've consolidated and organized test utilities in the project to improve maintainability and reduce duplication. This document explains the changes made and how to use the new structure.

## Key Changes

1. Moved utility files from `__tests__/utils/` to `test/utils/`:
   - `gameStateTestUtils.ts` → Now in `/test/utils/`
   - `narrativeProviderMock.tsx` → Now in `/test/utils/`
   - `testWrappers.tsx` → Renamed to `campaignTestWrappers.tsx` in `/test/utils/`

2. Created a central index file at `/test/utils/index.ts` that exports all utilities:
   - Uses namespaced exports to avoid naming conflicts
   - Provides a consistent import path for all test utilities

3. Fixed TypeScript errors in the moved files:
   - Added proper interfaces for test state objects
   - Fixed type errors in mock implementations
   - Ensured compatibility with existing tests

## How to Use the New Structure

### Importing Test Utilities

```typescript
// Old way (don't use this anymore)
import { createMockGameState } from '../../__tests__/utils/gameStateTestUtils';

// New way using namespaced imports (preferred)
import { gameStateUtils } from '../../test/utils';
// Then use as:
gameStateUtils.createMockGameState({ ... });

// Alternative: direct import
import { createMockGameState } from '../../test/utils/gameStateTestUtils';
```

### Common Utilities

The most frequently used utilities are:

1. **Game State Utilities**:
   ```typescript
   import { gameStateUtils } from '../../test/utils';
   
   // Mock game state
   const mockState = gameStateUtils.createMockGameState({
     character: { ... }
   });
   
   // Mock localStorage
   gameStateUtils.mockLocalStorage.clear();
   
   // Set up mocks
   gameStateUtils.setupGameStorageMocks(GameStorage);
   
   // Render with provider
   gameStateUtils.renderWithGameProvider(<Component />, mockState);
   ```

2. **Campaign Test Wrappers**:
   ```typescript
   import { campaignWrappers } from '../../test/utils';
   
   // Use campaign state provider
   campaignWrappers.TestCampaignStateProvider({
     children: <Component />,
     initialState: { ... }
   });
   ```

3. **Narrative Mocks**:
   ```typescript
   import { MockNarrativeProvider } from '../../test/utils/narrativeProviderMock';
   
   // Wrap component with narrative provider
   render(
     <MockNarrativeProvider>
       <YourComponent />
     </MockNarrativeProvider>
   );
   ```

## React Testing Best Practices

Remember these key principles when writing tests:

1. **Component-Based Testing**: Test components as a user would interact with them
2. **Isolation**: Mock dependencies for focused testing
3. **Type Safety**: Use proper interfaces for mocks to catch errors early
4. **Jest Hoisting**: Always declare mocks before using them
5. **Centralized Utilities**: Import utilities from `test/utils` to maintain consistency

## Further Improvements

Future work that could further improve the test structure:

1. Convert more direct utility imports to use the namespaced imports
2. Add more documentation to utility functions
3. Standardize test patterns across the codebase
4. Add integration tests for complex interactions between components

## React Testing Principles

React testing follows a component hierarchy similar to how Drupal renders templates:

- In Drupal, you test theme output as a whole rather than individual preprocessing functions
- In React, you test components by rendering them and asserting on their output
- Just as Drupal includes systems work with Twig files, React includes hooks and context providers

This migration helps keep test utilities organized similarly to how you might organize theme includes in Drupal, putting common functions in a central, reusable location.
