# Journal Utilities

This directory contains utilities for managing journal entries in the Boot Hill GM application.

## Overview

The journal utilities provide specialized functions for creating and managing different types of journal entries. These utilities work in conjunction with the main `JournalManager` class to provide a comprehensive journal system.

## Files

- **journalUtils.ts**: Common utilities shared across all journal entry types
- **narrativeEntryUtils.ts**: Functions for creating and managing narrative entries
- **combatEntryUtils.ts**: Functions for creating and managing combat entries
- **inventoryEntryUtils.ts**: Functions for creating and managing inventory entries

## Usage

These utilities are designed to be used through the `JournalManager` class, but can also be used directly when more specialized functionality is needed.

### Example: Creating a narrative entry

```typescript
import { createNarrativeEntry } from './journal/narrativeEntryUtils';
import { AIService } from '../services/ai/aiService';

const aiService = new AIService();
const newEntry = await createNarrativeEntry(
  "Player entered the saloon.", // content
  "The player is in Boot Hill town.", // context
  undefined, // previous entry
  aiService // AI service
);
```

### Example: Creating a combat entry

```typescript
import { createCombatEntry } from './journal/combatEntryUtils';

const newEntry = createCombatEntry(
  "John Smith", // player name
  "Outlaw", // opponent name
  "victory", // outcome
  "John Smith draws his revolver and fires, hitting the outlaw." // summary
);
```

### Example: Creating an inventory entry

```typescript
import { createInventoryEntry } from './journal/inventoryEntryUtils';

const newEntry = createInventoryEntry(
  ["Revolver", "Ammunition"], // acquired items
  ["Money"], // removed items
  "John Smith purchased a revolver and ammunition at the general store." // context
);
```

## Error Handling

All utility functions include appropriate error handling and fallback mechanisms. In particular, the narrative entry utilities handle AI service failures gracefully by providing fallback summary generation.

## See Also

- [Journal System Documentation](/Docs/core-systems/journal-system.md)
- [Journal Architecture](/Docs/architecture/journal-architecture.md)
