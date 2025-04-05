---
title: AI Fallback Service Architecture
aliases: [Fallback System, AI Backup Response System]
tags: [ai, services, fallback, architecture]
created: 2025-04-05
updated: 2025-04-05
---

# AI Fallback Service Architecture

This document outlines the architecture of the fallback service used within the Boot Hill GM application. The fallback service provides responses when the AI service is unavailable or times out, ensuring players always receive appropriate feedback.

## Overview

The fallback service is designed to generate context-appropriate responses based on player prompts when the primary AI service is not available. It analyzes the player's input to determine the appropriate context and generates narrative text and suggested actions accordingly.

## Component Structure

The fallback service has been organized into the following components:

```
/app/services/ai/fallback/
├── constants.ts            # Constants and enums
├── contextActions.ts       # Action generation by context
├── fallbackService.ts      # Main service entry point
├── narrativeGenerator.ts   # Narrative text generation
└── utils/
    └── promptAnalyzer.ts   # Prompt analysis utilities
```

## Component Responsibilities

### constants.ts

Contains configuration values, enums, and constants used by the fallback service:

- `AI_RESPONSE_TIMEOUT_MS`: Timeout threshold for AI responses (15 seconds)
- `ResponseContextType`: Enum of response context types
- `DEFAULT_LOCATION_NAME`: Default location name used in fallback responses

### promptAnalyzer.ts

Analyzes user prompts to determine the appropriate response context:

- `analyzePrompt()`: Examines prompt text to categorize as initializing, looking, moving, etc.
- Uses regex patterns to identify action words that indicate player intent

### narrativeGenerator.ts

Generates narrative text based on context and character information:

- `generateNarrative()`: Creates appropriate descriptive text for each context type
- Handles inventory descriptions with proper grammar based on item count

### contextActions.ts

Creates suggested actions based on context and action types:

- `createContextAction()`: Main function that dispatches to context-specific creators
- Context-specific action creators for different scenarios (initializing, moving, etc.)
- Generates unique IDs for each action to prevent collisions

### fallbackService.ts

Main entry point that coordinates the fallback response generation:

- `generateFallbackResponse()`: Creates complete fallback responses
- Integrates narrative text and suggested actions
- Handles error recovery with ultra-minimal fallback if needed
- Maintains test compatibility with existing test fixtures

## Data Flow

1. Player input is received by `generateFallbackResponse()`
2. `analyzePrompt()` determines the appropriate context type
3. `generateNarrative()` creates context-appropriate narrative text
4. `createContextAction()` generates suggested actions for the context
5. The complete response is assembled and returned to the player

## Error Handling

The service includes robust error handling:

- Safe handling of undefined or null inputs
- Try/catch block around the entire generation process
- Ultra-minimal fallback response if any errors occur in the fallback generation itself
- Test compatibility is maintained even in error cases

## Testing Approach

The fallback service is designed for testability:

- Compatible with existing test fixtures and mocks
- IDs from test fixtures are preserved while updating content
- Clear boundaries between components allow for isolated testing

## Usage Example

```typescript
import { generateFallbackResponse } from '../services/ai/fallback/fallbackService';

// Generate a fallback response for a looking action
const response = generateFallbackResponse(
  "Look around the town",
  "John Smith",
  playerInventory
);

// Use the response to update the game state
updateGameState(response);
```

## Related Documentation

- [[ai-service-architecture|AI Service Architecture]]
- [[game-response-types|Game Response Types]]
- [[testing-ai-fallbacks|Testing AI Fallbacks]]
