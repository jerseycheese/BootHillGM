---
title: Contextual Decision Generation
aliases: [Decision Generator, Fresh Context System]
tags: [documentation, utils, decisions, narrative]
created: 2025-04-17
updated: 2025-04-17
author: System
---

# Contextual Decision Generation

## Overview
The contextual decision generation system creates player decisions based on the current narrative context. This document describes the implementation and recent improvements to the system.

## Purpose
The decision generation system serves as the core interaction mechanism for the game, allowing players to make meaningful choices that impact the story. Key purposes include:

1. Creating contextually appropriate decision points
2. Ensuring decision options feel natural within the current narrative
3. Preventing stale context from affecting decision generation
4. Supporting multiple generation modes (template-based, AI-driven, and hybrid)

## Implementation Details

### State Refreshing
To fix issue #210 (stale context in decisions), the system now ensures state is refreshed before decision generation:

```typescript
export async function generateEnhancedDecision(
  gameState: GameState,
  narrativeContext?: NarrativeContext,
  locationType?: LocationType,
  forceGeneration: boolean = false
): Promise<PlayerDecision | null> {
  try {
    // Prevent multiple concurrent generations
    if (isGeneratingDecision) return null;
    isGeneratingDecision = true;
    
    // Get fresh game state and context - FIX FOR ISSUE #210
    const freshGameState = getRefreshedGameState(gameState);
    const recentContext = extractRecentNarrativeContext(freshGameState);
    
    // ... decision generation logic
  }
  // ... error handling
}
```

### Context Extraction
The system extracts recent narrative history to provide better context for decisions:

```typescript
export function extractRecentNarrativeContext(gameState: GameState): string {
  // Get the most recent entries for context
  const recentEntries = gameState.narrative.narrativeHistory.slice(-15);
  
  // Extract player actions specifically to highlight player agency
  const playerActions = gameState.narrative.narrativeHistory
    .filter(entry => 
      entry.startsWith("Player:") || 
      entry.includes("player action")
    )
    .slice(-5);
  
  // ... additional processing and context formatting
  
  return contextText;
}
```

### Decision Generation Modes
The system supports multiple generation modes:

1. **Template**: Uses predefined decision templates based on narrative context
2. **AI**: Generates decisions using the AI service based on narrative context
3. **Hybrid**: Tries AI generation first, with template fallback if AI fails

```typescript
export type DecisionGenerationMode = 'template' | 'ai' | 'hybrid';

// Set the current mode
export function setDecisionGenerationMode(mode: DecisionGenerationMode): void {
  currentGenerationMode = mode;
}

// Generate based on the selected mode
async function generateDecisionByMode(
  gameState: GameState,
  narrativeContext?: NarrativeContext,
  locationType?: LocationType,
  forceGeneration: boolean = false
): Promise<PlayerDecision | null> {
  switch (currentGenerationMode) {
    case 'ai': 
      return await generateAIDecision(gameState, narrativeContext, forceGeneration);
    
    case 'template':
      return generateContextualDecision(gameState, narrativeContext, locationType);
    
    case 'hybrid':
    default:
      return await generateHybridDecision(
        gameState, narrativeContext, locationType, forceGeneration
      );
  }
}
```

## Recent Improvements

1. **Fixed Stale Context Issue (#210)**: Ensures decisions are generated with the most up-to-date narrative context by refreshing state before generation
2. **Enhanced Context Extraction**: Improved the quality of extracted context to focus on recent narrative events and player actions
3. **Robust Error Handling**: Added better fallback mechanisms when AI generation fails
4. **File Structure Reorganization**: Consolidated decision generation into a more maintainable structure

## Testing

The system includes comprehensive tests to verify:

1. Proper state refreshing before decision generation
2. Context extraction from different narrative states
3. Generation modes function correctly
4. Error handling and fallback mechanisms work as expected

## Related Documentation
- [[../core-systems/decision-system|Decision System]]
- [[../architecture/narrative-system|Narrative System]]
- [[./narrative-filtering|Narrative Filtering]]

## Tags
#decisions #generation #context #ai #narrative

## Changelog
- 2025-04-17: Updated documentation to reflect fixes for issue #210 (stale context)
- 2025-04-15: Initial documentation of contextual decision generation system
