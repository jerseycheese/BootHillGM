# Narrative Context Builder

The Narrative Context Builder is a utility for creating optimized AI prompts with intelligent content filtering, prioritization, and compression techniques.

## Overview

This module creates structured, token-efficient narrative context by:

1. Compressing narrative history based on configurable parameters
2. Extracting and prioritizing relevant decisions 
3. Allocating tokens based on content importance
4. Building structured context with appropriate sections

## File Structure

This module is organized into the following files:

| File | Purpose |
|------|---------|
| `narrativeContextBuilder.ts` | Main context building orchestrator |
| `narrativeContextDefaults.ts` | Default configuration values |
| `narrativeContextProcessors.ts` | Compression and extraction utilities |
| `narrativeContextPrioritization.ts` | Element prioritization logic |
| `narrativeContextFormatters.ts` | Text formatting utilities |
| `narrativeContextScoring.ts` | Relevance scoring algorithms | 
| `narrativeContextTokens.ts` | Token allocation and budget management |
| `narrativeContextTypes.ts` | Internal type definitions |
| `index.ts` | Public API exports |

## Usage

```typescript
import { buildNarrativeContext } from '../utils/narrative';
import { NarrativeState } from '../types/narrative.types';

// Get the current narrative state from your application
const narrativeState: NarrativeState = getCurrentState();

// Build optimized context
const optimizedContext = buildNarrativeContext(narrativeState, {
  maxHistoryEntries: 10, 
  compressionLevel: 'medium',
  maxTokens: 2000
});

// Use the formatted context with your AI service
const aiResponse = await aiService.getResponse({
  prompt: userPrompt,
  context: optimizedContext.formattedContext
});
```

## Configuration Options

The context builder accepts these configuration options:

```typescript
const options = {
  // Maximum history entries to include
  maxHistoryEntries: 10,
  
  // Maximum decisions to include
  maxDecisionHistory: 5,
  
  // Compression level for narrative text
  compressionLevel: 'medium', // 'none' | 'low' | 'medium' | 'high'
  
  // Minimum relevance score (0-10) for inclusion
  relevanceThreshold: 5,
  
  // Boost recent content
  prioritizeRecentEvents: true,
  
  // Include specific context sections
  includeWorldState: true,
  includeCharacterRelationships: true,
  
  // Token budget and allocation
  maxTokens: 2000,
  tokenAllocation: {
    narrativeHistory: 40, // percentages
    decisionHistory: 30,
    worldState: 15,
    relationships: 10,
    storyContext: 5
  }
};
```

## Context Structure

The generated context follows this structure:

```
## Story Progression
[Current story points and arcs]

## World State
[Current world state and impacts]

## Narrative History
[Compressed narrative history entries]

## Decisions
[Relevant player decisions]

## Character Relationships
[Character relationship information]

## Guidance
[AI guidance instructions]
```

## Testing

Unit tests for the narrative context builder are located in:
```
/app/__tests__/utils/narrative/narrativeContextBuilder.test.ts
```

## Performance Considerations

- For longer narratives, consider using `maxHistoryEntries` and higher compression
- Token allocation can be adjusted based on the importance of different content types
- The `buildNarrativeContext` function returns metadata with performance metrics