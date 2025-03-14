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

- `bhgm:decision:ready`: Fired when a new decision is ready to be displayed
- `bhgm:decision:cleared`: Fired when a decision is cleared
- `bhgm:decision:made`: Fired when a player makes a decision choice
- `bhgm:ui:force-update`: Forces a UI update
- `bhgm:ui:state-changed`: Notifies of a UI state change

### Events Usage

```javascript
import { EVENTS, triggerCustomEvent, listenForCustomEvent } from "../utils/events";

// Listening for an event
const cleanup = listenForCustomEvent(EVENTS.DECISION_READY, (decision) => {
  // Handle the decision becoming ready
  console.log('Decision is ready:', decision);
});

// Triggering an event
triggerCustomEvent(EVENTS.DECISION_MADE, { 
  decisionId: 'some-id', 
  optionId: 'selected-option' 
});

// Clean up event listener when component unmounts
useEffect(() => {
  return cleanup;
}, []);
```

## DevTools Panel

The DevTools panel provides a visual interface for testing and debugging:

- **Reset Game**: Resets the game state to initial values
- **Test Combat**: Initializes a test combat scenario
- **Force Re-render**: Forces a UI refresh
- **Show History Debug**: Displays decision history details
- **Test Player Decision**: Generates test decisions with configurable importance
- **Contextual Decision Testing**: Generates context-aware decisions based on location

## Development Usage

The debug tools are particularly useful when:

1. Testing narrative flows without having to play through the game
2. Troubleshooting decision rendering issues
3. Testing location-specific content
4. Examining the current game state
5. Forcing UI updates when components aren't refreshing properly

## Implementation Details

The debug system consists of:

- **DevToolsPanel.tsx**: UI interface for triggering debug actions
- **debugConsole.ts**: Browser console integration
- **events.ts**: Custom events system for cross-component communication
- **contextualDecisionGenerator.ts**: Generates context-aware decisions
- **decisionTemplates.ts**: Template system for different location types

This debugging architecture provides a foundation that will support the planned AI-driven decision system in future iterations.
