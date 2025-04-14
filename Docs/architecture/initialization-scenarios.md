---
title: Initialization Scenarios
aliases: [Game Initialization, State Setup]
tags: [initialization, architecture, state-management]
created: 2025-04-14
updated: 2025-04-14
---

# Initialization Scenarios

This document outlines the different scenarios for initializing the game state in Boot Hill GM.

## Overview

The game initialization process has been refactored into modular components, each handling a specific initialization pathway. This makes the code more maintainable and testable, with clearer separation of concerns.

## Initialization Scenarios

The system supports four main initialization scenarios:

1. **Direct AI Generation** - Using pre-generated content for a reset
2. **Reset Initialization** - Complete reset with fresh AI-generated content
3. **Restored Game State** - Resuming from a saved game state
4. **First-time Initialization** - Setting up a new game for first-time players

## Architecture

All scenarios are organized in the `/app/utils/initialization/scenarios` directory, with a main entry point in `initScenarios.ts` that exports all scenario handlers.

```
/app/utils/initialization/
  ├── initScenarios.ts           # Main entry point
  └── scenarios/
      ├── directAIGeneration.ts  # Direct AI content initialization
      ├── resetInitialization.ts # Reset with new content
      ├── restoredGameState.ts   # Restore from saved state
      └── firstTimeInitialization.ts # New game setup
```

## Service Integration

The initialization scenarios integrate with existing services:

- **LocationService** - For managing location data conversion
- **GameStorage** - For managing game state persistence
- **AIService** - For generating narrative content

## Error Handling

Each scenario includes comprehensive error handling:

- Fallback content generation when AI generation fails
- Proper error propagation to calling code
- Type validation to ensure state integrity

## Environmental Awareness

Debug statements are conditionally included based on the environment:

```typescript
if (process.env.NODE_ENV !== 'production') {
  debug('Debug message');
}
```

## Usage

The initialization scenarios are used by the `useGameInitialization` hook to properly initialize the game state based on different conditions:

```typescript
import { 
  handleDirectAIGeneration,
  handleResetInitialization,
  handleRestoredGameState,
  handleFirstTimeInitialization
} from '../utils/initialization/initScenarios';

// In useGameInitialization hook:
if (savedState) {
  await handleRestoredGameState({ character, savedState, dispatch });
} else if (initRef.resetDetected) {
  await handleResetInitialization({ 
    initRef, character, narrativeContent, journalContent, 
    suggestedActionsContent, dispatch 
  });
} else {
  await handleFirstTimeInitialization({ character, dispatch });
}
```
