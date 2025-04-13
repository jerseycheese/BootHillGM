# Boot Hill GM Utilities

This directory contains utility functions used throughout the Boot Hill GM application. These utilities provide consistent interfaces for common operations and promote code reuse.

## Directory Structure

```
/utils
  /storage       - Utilities for data persistence
  /character     - Character management utilities
  /narrative     - Narrative state management
  /...           - Other utility categories
```

## Storage Utilities

The storage utilities handle saving and retrieving game state data from localStorage with proper error handling and type safety.

### Key Components:

- **gameStateStorage.ts**: Main interface for game state persistence
- **gameElementsStorage.ts**: Handles game elements (actions, items)
- **storageKeys.ts**: Constants for localStorage key names
- **storageUtils.ts**: Common localStorage helper functions

### Usage Example:

```typescript
import { GameStorage } from '../utils/storage/gameStateStorage';

// Save game state
GameStorage.saveGameState(currentGameState);

// Initialize a new game
const newGame = GameStorage.initializeNewGame();
```

## Character Utilities

Functions for managing character data, ensuring valid character objects, and providing defaults.

### Key Features:

- Character creation with proper defaults
- Validation and completion of partial character data
- Type-safe character data handling

## Narrative Utilities

Functions for managing narrative state, creating default narratives, and updating narrative content.

### Key Features:

- Default narrative state creation
- Narrative content updating
- Compatibility with AI-generated content

## Best Practices

1. **Error Handling**: All localStorage operations should be wrapped in try/catch blocks
2. **Type Safety**: Use proper TypeScript typing for all parameters and return values
3. **Defaults**: Always provide sensible defaults for optional parameters
4. **Backward Compatibility**: Maintain support for legacy data formats
5. **Debug Logging**: Use the module's debug function for diagnostic information

## Documentation

Each utility file includes JSDoc comments describing its purpose and functions. See individual files for detailed documentation.
