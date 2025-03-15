# BootHillGM Debug Tools

The game includes a set of developer tools for testing and debugging the narrative and decision systems.

## Browser Console API

The `window.bhgmDebug` namespace provides utilities for testing the decision system:

### Methods

- `triggerDecision(locationType?: LocationType)`: Triggers a contextual decision for the specified location type
- `clearDecision()`: Clears the current decision
- `listLocations()`: Lists available location types
- `getGameState()`: Returns the current game state

### Usage

```javascript
// Trigger a town decision
window.bhgmDebug.triggerDecision({ type: 'town', name: 'Boot Hill' });

// Clear the current decision
window.bhgmDebug.clearDecision();

// Get the current game state
const state = window.bhgmDebug.getGameState();
```

## Custom Events System

The game uses a custom events system for cross-component communication:

### Key Events

- `bhgm:decision:ready`: Fired when a new decision is ready to be displayed
- `bhgm:decision:cleared`: Fired when a decision is cleared
- `bhgm:decision:made`: Fired when a player makes a decision
- `bhgm:ui:force-update`: Forces a UI update across components
- `bhgm:ui:state-changed`: Notifies components of UI state changes

### Event Handling

Our implementation uses browser standard CustomEvent for reliable cross-component communication:

```javascript
// Listen for a decision event
listenForCustomEvent(EVENTS.DECISION_READY, (decision) => {
  // Handle the new decision
  console.log('Decision ready:', decision);
});

// Trigger an event
triggerCustomEvent(EVENTS.DECISION_MADE, {
  decisionId: 'decision-123',
  optionId: 'option-456'
});
```

## DevTools UI

The DevTools panel is accessible in development mode and provides a visual interface for:

- Testing contextual decisions
- Clearing decisions
- Viewing decision history
- Inspecting game state

### Component Structure

The DevTools UI has been refactored into a modular component structure:

- `DevToolsPanel`: Main container component that orchestrates the debug UI
- `GameControlSection`: Controls for resetting the game and testing combat
- `DecisionTestingSection`: Interface for creating and testing decisions
- `ContextualDecisionSection`: Location-based decision testing tools
- `NarrativeDebugPanel`: Displays narrative context and decision history
- `GameStateDisplay`: Shows the current game state for debugging
- `AIDecisionControls`: AI-specific decision testing tools
- `ErrorBoundary`: Catches and displays rendering errors

This modular structure makes the debug tools more maintainable and easier to extend.

### Location Types

The system supports these location types for testing:

- Town
- Wilderness
- Ranch
- Mine
- Camp

Each location type has unique templates and can trigger different types of decisions.

## Contextual Decision Generation

Decisions are generated based on current game state including:

- Current location
- Active NPCs
- Narrative themes
- Past decisions

The generator uses a template-matching system to find the most contextually relevant decision for the current state.

## Error Handling

All debug tools include appropriate error handling with meaningful error messages displayed in:

- DevTools UI panel
- Browser console

### Console Debug Output

Console logs are conditionally displayed based on environment:

- Development: Full debug info is logged
- Production: Only essential errors are logged

## Extending the Tools

To add new debug functionality:

1. Update `debugConsole.ts` with new functions
2. Add UI controls in the appropriate component (previously all in `DevToolsPanel.tsx`)
3. Register any new event types in `events.ts`
4. Document the new functionality in this file

### Adding New Debug Components

With the refactored structure, you can now add new debug UI sections by:

1. Creating a new component in the `components/Debug/` directory
2. Adding appropriate props interface in `types/debug.types.ts`
3. Importing and using the component in `DevToolsPanel.tsx`
4. Adding tests in `app/__tests__/components/Debug/`

## Related Systems

- **Narrative Context**: Powers the decision system and handles state
- **Event System**: Provides cross-component communication
- **Location Service**: Manages game locations and their types
- **Template System**: Provides contextual decision templates
