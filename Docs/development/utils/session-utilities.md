---
title: Session Utilities
aliases: [Session Props Generator, User Input Handler]
tags: [documentation, utils, session]
created: 2025-04-15
updated: 2025-04-15
author: System
---

# Session Utilities

## Overview
This document describes the session utilities for the Boot Hill GM application. These utilities are responsible for generating game session props and handling user input in the game.

## Purpose
These utilities serve as the bridge between the game state, user interactions, and AI responses. They ensure consistent props are delivered to game components and that user inputs are properly processed.

## Implementation Details

### Session Props Generator
The `sessionPropsGenerator.ts` file generates all props needed for game components, including:

- State access
- Dispatch functions
- Event handlers
- Game status indicators

```typescript
// Example usage
const sessionProps = generateSessionProps(
  gameState,
  dispatch,
  currentCharacter,
  isLoadingState
);
```

### User Input Handler
The `userInputHandler.ts` file processes user text inputs and coordinates:

- AI response retrieval
- Journal entry creation
- Inventory updates
- Location changes
- Combat initiation

```typescript
// Example usage within sessionPropsGenerator
const result = await processUserInput(
  input,
  actionType,
  state,
  dispatch
);
```

### Item Extract Utilities
The `itemExtractUtils.ts` file handles item data extraction from AI responses:

- Name extraction from different data structures
- Category mapping and validation
- Default values for missing properties

## File Structure
```
app/
└── utils/
    ├── sessionPropsGenerator.ts
    └── session/
        ├── userInputHandler.ts
        └── itemExtractUtils.ts
```

## Related Documentation
- [[../architecture/state-management|State Management]]
- [[../core-systems/ai-integration|AI Integration]]
- [[../core-systems/journal-system|Journal System]]

## Tags
#documentation #utils #session #gamestate

## Changelog
- 2025-04-15: Initial version documenting refactored session utilities
