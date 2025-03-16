# Narrative Types System

This directory contains the type definitions for the BootHillGM narrative system. The system has been modularized for better maintainability and organization.

## Directory Structure

- `narrative.types.ts` - Main entry point that re-exports all types (for backward compatibility)
- `narrative/` - Directory containing all specialized type modules:
  - `actions.types.ts` - Action types for state management
  - `arc.types.ts` - Types for narrative arcs and branches
  - `choice.types.ts` - Types for narrative choices and display modes
  - `context.types.ts` - Types for narrative context and state
  - `decision.types.ts` - Types for player decisions
  - `error.types.ts` - Error handling types
  - `hooks.types.ts` - Interface types for hooks
  - `progression.types.ts` - Types for story progression
  - `segment.types.ts` - Types for narrative segments
  - `story-point.types.ts` - Types for story points
  - `utils.ts` - Utility functions and initial states
  - `index.ts` - Barrel file for easy importing

## Usage Guide

### Preferred Import Method

For better maintainability, import specific types directly from their module:

```typescript
// Importing specific types from their modules
import { StoryPoint } from '../types/narrative/story-point.types';
import { NarrativeAction } from '../types/narrative/actions.types';
```

### Alternative Import Method

For backward compatibility, you can still import all types from the main file:

```typescript
// All types are re-exported from the main file for backward compatibility
import { StoryPoint, NarrativeAction } from '../types/narrative.types';
```

However, this approach is less efficient and should be gradually migrated to the specific imports.

## Benefits of the New Structure

1. **Improved Maintainability**: Each file has a clear, single responsibility
2. **Better Navigation**: Easier to find and update specific types
3. **Type Safety**: Logical grouping of types makes it easier to ensure correct usage
4. **Smaller Files**: All files are now under 300 lines
5. **Better Organization**: Related types are grouped together

## Backward Compatibility

The refactoring maintains full backward compatibility through re-exports from the main `narrative.types.ts` file. Existing code will continue to work without changes, but it's recommended to update imports to use the new structure.