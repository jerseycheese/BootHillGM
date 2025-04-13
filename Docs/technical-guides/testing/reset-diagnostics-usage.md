# Reset Diagnostics Usage Guide

## Overview
The reset diagnostics tools provide debugging and monitoring capabilities for the game reset functionality, particularly focusing on AI content generation and state preservation during reset operations.

## Available Diagnostic Tools

### Initialization Diagnostics
Located in `app/utils/initializationDiagnostics.ts`, these utilities help monitor the reset process:

- `logDiagnostic`: Logs detailed diagnostic information with categories, timestamps, and structured data
- `captureStateSnapshot`: Captures the game state for comparison before and after operations
- `validateStateConsistency`: Verifies that critical content is preserved across reset
- `repairStateConsistency`: Automatically repairs common state inconsistencies

### Usage Examples

```typescript
// Example of monitoring a reset operation
import { logDiagnostic, captureStateSnapshot } from '../utils/initializationDiagnostics';

// Define tracking for diagnostics
const trackResetProcess = {
  beforeActionDispatch: (actionType, actionPayload) => {
    // Log detailed action information before dispatch
    logDiagnostic('RESET', `Before dispatch: ${actionType}`, {
      actionType,
      hasPayload: !!actionPayload,
      timestamp: new Date().toISOString()
    });
    
    // Capture state snapshot before reset
    const beforeSnapshot = captureStateSnapshot();
    if (beforeSnapshot) {
      logDiagnostic('RESET', 'State snapshot before reset', {
        totalKeys: beforeSnapshot.totalKeys,
        characterName: beforeSnapshot.gameStateKeys['saved-game-state']?.characterName
      });
    }
  },
  
  afterActionDispatch: () => {
    // Capture state after reset for verification
    const afterSnapshot = captureStateSnapshot();
    if (afterSnapshot) {
      logDiagnostic('RESET', 'State snapshot after reset', {
        totalKeys: afterSnapshot.totalKeys,
        characterName: afterSnapshot.gameStateKeys['saved-game-state']?.characterName
      });
    }
  }
};

function handleResetGame() {
  // Log start of reset process
  logDiagnostic('RESET', 'User initiated reset');
  
  // Extract character data before reset
  const characterData = extractCharacterData(gameState);
  
  // Clear localStorage except for essential data
  // ...
  
  // Before action dispatch
  trackResetProcess.beforeActionDispatch('RESET_STATE');
  
  // Dispatch reset action
  dispatch({ type: 'RESET_STATE' });
  
  // Verify results after action
  trackResetProcess.afterActionDispatch();
}
```

## Integration with Testing

The reset diagnostics tools can be used in integration tests:

```typescript
// In reset integration tests
import { validateStateConsistency } from '../utils/initializationDiagnostics';

test('reset preserves character data correctly', async () => {
  // Setup test
  renderGameComponent();
  
  // Click reset button
  fireEvent.click(screen.getByTestId('reset-button'));
  
  // Wait for reset to complete
  await waitFor(() => {
    // Verify state using diagnostic validation
    const validation = validateStateConsistency();
    expect(validation.isConsistent).toBe(true);
  });
  
  // Verify character data was preserved
  const character = screen.getByTestId('character-name');
  expect(character).toHaveTextContent('Test Character');
});
```

## Monitoring State During Reset

The reset process involves several critical steps that can be monitored:

1. **Before Reset**:
   - The `captureStateSnapshot` function captures the initial state
   - Character data should be extracted and preserved

2. **During Reset**:
   - `logDiagnostic` can be used to track the reset process
   - Storage keys can be verified before and after cleaning

3. **After Reset**:
   - `validateStateConsistency` validates the final state
   - AI-generated content should be present
   - Character data should be preserved

## State Validation and Repair

The diagnostic module also provides tools to validate and repair state:

```typescript
// Validate state consistency
const validation = validateStateConsistency();

// If inconsistent, repair the state
if (!validation.isConsistent) {
  const repairResult = await repairStateConsistency();
  logDiagnostic('REPAIR', 'State repair attempted', {
    repairsAttempted: repairResult.repairsAttempted,
    repairsSucceeded: repairResult.repairsSucceeded
  });
}
```

## Journal Entry Helpers

When creating new journal entries during reset, use the utility functions:

```typescript
import { createTypedNarrativeEntry } from '../utils/initialization/journalEntryHelpers';

// Create a narrative journal entry
const journalEntry = createTypedNarrativeEntry(
  narrativeContent,
  'New Adventure',
  Date.now(),
  narrativeSummary
);

// Add to journal state
dispatch({
  type: 'journal/ADD_ENTRY',
  payload: journalEntry
});
```

## Best Practices

1. Add reset monitoring to critical paths:
   - Reset button click handler
   - Game initialization process
   - Any component that needs to preserve state across reset

2. Ensure character data persistence across reset:
   - Extract character data before reset
   - Store in designated localStorage keys
   - Verify character data after reset

3. Verify complete game state after reset:
   - Character data preserved
   - Inventory items maintained
   - New AI content generated
   - Journal entries properly created

4. Always check for and clear loading indicators after reset completes:
   ```typescript
   setLoading(null);
   setLoadingIndicator(null);
   ```

5. Implement fallbacks for AI generation failures:
   ```typescript
   try {
     // Try AI generation
     const aiResponse = await aiService.generateGameContent(characterData);
     // Process AI content
   } catch (error) {
     // Log diagnostic
     logDiagnostic('RESET', 'AI generation failed', { error: String(error) });
     // Use fallback content
   }
   ```