# Narrative Decision Context Architecture

## Overview

The Narrative Decision Context system is a critical component in the BootHillGM architecture, responsible for ensuring AI-generated decisions are contextually relevant and aware of the player's recent actions. This document explains how the system integrates with other components and its role in the broader narrative experience.

## System Integration

![Narrative Decision Context Integration](../assets/diagrams/narrative-decision-context.png)

The Enhanced Decision Context system integrates with multiple layers of the application:

### 1. React Component Layer

At the UI level, components use the `useNarrativeContext` hook to interact with decisions:

```tsx
// Component requesting a decision based on fresh context
function GamePrompt() {
  const { triggerAIDecision, hasActiveDecision } = useNarrativeContext();
  
  return (
    <div>
      {!hasActiveDecision && (
        <button onClick={() => triggerAIDecision()}>
          What should I do?
        </button>
      )}
    </div>
  );
}

// Component displaying the current decision
function DecisionDisplay() {
  const { currentDecision, recordPlayerDecision } = useNarrativeContext();
  
  return currentDecision ? (
    <div className="decision-panel">
      <h3>{currentDecision.prompt}</h3>
      <div className="options">
        {currentDecision.options.map(option => (
          <button 
            key={option.id}
            onClick={() => recordPlayerDecision(currentDecision.id, option.id)}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  ) : null;
}
```

### 2. State Management Layer

The state layer manages narrative context and decision state:

```typescript
// Narrative Context Provider
<NarrativeProvider>
  <GameContent />
</NarrativeProvider>

// State update flow
dispatch(addNarrativeHistory(text))
  → narrativeReducer
    → state update
      → useNarrativeContext hook receives fresh state
```

### 3. Service Layer

The AI service layer handles decision generation:

```typescript
// Decision service flow
DecisionService.generateDecision(narrativeState, character)
  → AIDecisionGenerator.generateDecision(narrativeState, character)
    → refreshNarrativeContext(narrativeState)
      → buildDecisionPrompt(narrativeState, character)
        → aiClient.makeRequest(prompt)
          → validateDecision(response)
```

## Decision Generation Flow

The enhanced decision generation process follows these steps:

1. **State Refresh**: Ensure narrative state is up-to-date
   ```typescript
   const freshGameState = getRefreshedGameState(gameState);
   ```

2. **Context Extraction**: Pull context from multiple sources
   ```typescript
   const narrativeContext = extractComprehensiveContext(narrativeState);
   const relationships = extractCharacterRelationships(character, narrativeState);
   const recentEvents = extractRecentEvents(narrativeState);
   ```

3. **Context Refresh**: Pre-generation refresh of crucial context
   ```typescript
   const refreshedContext = refreshNarrativeContext(narrativeState);
   prompt.narrativeContext = refreshedContext + '\n\n' + prompt.narrativeContext;
   ```

4. **Prompt Building**: Craft the AI prompt with fresh context
5. **AI Generation**: Send prompt to AI service
6. **Response Processing**: Validate and process the decision
7. **Presentation**: Present the decision to the player

## Data Flow Diagram

```
┌─────────────┐      ┌───────────────┐      ┌──────────────┐
│ React UI    │◄────►│ State Context │◄────►│ Narrative    │
│ Components  │      │ Providers     │      │ State        │
└─────────────┘      └───────────────┘      └──────────────┘
                            │                       ▲
                            ▼                       │
                     ┌───────────────┐      ┌──────────────┐
                     │ useNarrative  │─────►│ Dispatch     │
                     │ Context Hook  │      │ Actions      │
                     └───────────────┘      └──────────────┘
                            │                       ▲
                            ▼                       │
┌─────────────┐      ┌───────────────┐      ┌──────────────┐
│ Fresh State │◄────►│ Decision      │─────►│ AI Service   │
│ Retrieval   │      │ Service       │      │ Client       │
└─────────────┘      └───────────────┘      └──────────────┘
                            │                       ▲
                            ▼                       │
                     ┌───────────────┐      ┌──────────────┐
                     │ Context       │─────►│ Prompt       │
                     │ Extraction    │      │ Building     │
                     └───────────────┘      └──────────────┘
```

## Configuration Points

The system can be configured at several points:

### 1. Context Limits

Configure how much context is extracted:

```typescript
const CONTEXT_LIMITS = {
  MAX_HISTORY_ENTRIES: 8,  // Adjust for more/less history
  MAX_DECISION_HISTORY: 3, // Adjust for more/less decision history
  MAX_IMPORTANT_EVENTS: 3  // Adjust for more/less important events
};
```

### 2. Detection Parameters

Configure when decisions should be presented:

```typescript
const DETECTION_CONFIG = {
  BASE_SCORE: 0.6,          // Base score for all decisions
  DIALOGUE_BONUS: 0.15,     // Increase for more dialogue-triggered decisions
  ACTION_PENALTY: 0.2,      // Adjust for action-sequence sensitivity
  DECISION_POINT_BONUS: 0.3 // Bonus for explicit decision points
  // ...other params
};
```

### 3. Generation Mode

Set the generation mode:

```typescript
// In initialization or settings management
import { setDecisionGenerationMode } from '../utils/contextualDecisionGenerator.enhanced';

// AI-only mode - prioritizes context awareness
setDecisionGenerationMode('ai');

// Template-only mode - faster but less context aware
setDecisionGenerationMode('template');

// Hybrid mode - balances both approaches
setDecisionGenerationMode('hybrid');
```

## Debug and Testing Tools

The system includes built-in tools for debugging and testing:

### Console Debugging

```javascript
// Trace decision generation
window.bhgmDebug.decisions.generateDecision(
  window.bhgmDebug.getState(),
  undefined,
  undefined,
  true
);

// Check decision score for current state
window.bhgmDebug.decisions.lastDetectionScore;

// Force a specific generation mode for testing
window.bhgmDebug.decisions.setMode('ai');
```

### Integration Testing

Integration tests verify that decisions properly reflect narrative context:

```typescript
// Test that dialogue influences decisions
it('should generate decisions aware of dialogue context', async () => {
  // Setup narrative with dialogue
  const narrativeState = createTestNarrative();
  narrativeState.narrativeHistory.push('Sheriff: "What brings you to town, stranger?"');
  
  // Generate decision
  const decision = await service.generateDecision(narrativeState, mockCharacter);
  
  // Verify decision references dialogue
  expect(decision.prompt.toLowerCase()).toContain('sheriff');
  expect(decision.options.some(o => o.text.toLowerCase().includes('reply'))).toBe(true);
});
```

## Performance Considerations

The enhanced context system has some performance implications:

1. **Memory Usage**: More comprehensive context extraction uses more memory
2. **Context Size**: Increased context size increases token usage in AI requests
3. **Refresh Overhead**: State refresh operations add some processing overhead

For environments with performance constraints, consider:

- Reducing `CONTEXT_LIMITS` values
- Implementing caching for relationship data
- Setting update thresholds to prevent excessive refreshes

## Error Handling

The system includes robust error handling:

```typescript
try {
  // Generate decision with fresh context
  const decision = await generateEnhancedDecision(gameState, narrativeContext);
  return decision;
} catch (error) {
  console.error('Error generating decision:', error);
  
  // Fallback to template decision
  return generateTemplateFallback();
}
```

## Related Documentation

- [Enhanced Decision Context Implementation](../features/_completed/enhanced-decision-context.md)
- [Narrative System Overview](../core-systems/narrative-system.md)
- [AI Integration Architecture](./ai-integration.md)
- [React State Management in BootHillGM](../technical-guides/state-management.md)
