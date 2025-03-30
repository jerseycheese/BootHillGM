# Lore Management System

## Overview

The Lore Management System enables BootHillGM to maintain consistent world facts and lore details by systematically tracking, organizing, and applying world knowledge during AI-driven narrative generation. This system enhances narrative coherence and prevents fact contradictions in long play sessions.

## Core Concepts

The lore system is built on several key concepts:

1. **Lore Facts**: Individual pieces of factual information about the game world
2. **Lore Categories**: Organizational groupings for different types of facts
3. **Lore Store**: Central repository for all lore with efficient indexing
4. **Extraction**: Process of deriving facts from AI narrative responses
5. **Context Building**: Including relevant facts in AI prompts

## Data Model

### Lore Fact

A `LoreFact` represents a single piece of factual information about the game world:

```typescript
interface LoreFact {
  id: string;                     // Unique identifier
  content: string;                // The actual factual statement
  category: LoreCategory;         // Categorical classification
  createdAt: number;              // Timestamp of creation
  updatedAt: number;              // Timestamp of last update
  sourceId?: string;              // Original source (journal entry, AI response)
  confidence: number;             // Confidence score (1-10)
  importance: number;             // Importance score (1-10)
  version: number;                // Version number
  isValid: boolean;               // Validation status
  relatedFactIds: string[];       // Related facts by ID
  tags: string[];                 // Searchable tags
}
```

### Lore Categories

Facts are organized into five main categories:

```typescript
type LoreCategory = 
  | 'character'    // Information about NPCs and PCs
  | 'location'     // Places, landmarks, regions
  | 'history'      // Past events of significance
  | 'item'         // Notable objects and artifacts
  | 'concept';     // Abstract ideas, rules, customs
```

### Lore Store

The `LoreStore` acts as the central repository for all lore facts and provides efficient access through indexes:

```typescript
interface LoreStore {
  facts: Record<string, LoreFact>;             // All facts by ID
  categorizedFacts: Record<LoreCategory, string[]>; // Fact IDs by category
  factsByTag: Record<string, string[]>;        // Fact IDs by tag
  factVersions: Record<string, LoreFact[]>;    // Version history by fact ID
  latestUpdate: number;                        // Timestamp of last update
}
```

## System Components

### State Management

The lore system extends the existing narrative state management:

1. **Lore Reducer**: Handles all actions related to managing lore state
2. **Narrative Integration**: Lore is a property of the `NarrativeState`
3. **Immutable Updates**: All state changes follow Redux-style immutable patterns

### Lore Extraction

The system automatically extracts lore from AI responses:

1. **Response Format**: The AI includes structured lore in its responses
2. **Extraction Process**: The `extractLoreFromAIResponse` utility processes these fields
3. **Processing**: New facts are added to the store, while updates modify existing facts

### Context Building

When generating new AI prompts, relevant lore is included:

1. **Selection**: `selectLoreForContext` chooses facts based on relevance and importance
2. **Relevance**: Facts related to current characters, locations, and themes are prioritized
3. **Token Budget**: A portion of the context token budget is allocated to lore

### Developer Tools

The system includes utilities for inspection and debugging:

1. **Inspection**: `inspectLoreStore` provides ways to examine lore data
2. **Statistics**: `getLoreStats` generates insights about the lore collection
3. **Visualization**: `visualizeLoreRelations` helps visualize relationships
4. **Contradiction Detection**: `findContradictions` identifies potential conflicts

## Usage Guide

### Using the Lore Hook

The `useLore` hook provides components with access to lore functionality:

```typescript
const LorePanel = () => {
  const { 
    loreStore, 
    getFactsByCategory, 
    getFactsByTag,
    invalidateFact,
    // ... other methods
  } = useLore();
  
  // Example: Get character facts
  const characterFacts = getFactsByCategory('character');
  
  // ...
};
```

### Available Methods

The lore hook provides these primary methods:

- `addFact`: Add a new fact to the store
- `updateFact`: Update an existing fact
- `invalidateFact` / `validateFact`: Change a fact's validity
- `getFactsByCategory`: Retrieve facts by category
- `getFactsByTag`: Retrieve facts by tag
- `getRelatedFacts`: Find facts related to a specific fact
- `processLoreExtraction`: Process lore extraction from AI

### Lore Debugging

The debugging system provides tools for inspecting lore:

```typescript
// Enable lore debugging
enableLoreDebugging();

// Inspect lore store
const inspectionResult = debugLore(loreStore, 'inspect', {
  category: 'character',
  includeInvalid: true
});

// Get statistics
const stats = debugLore(loreStore, 'stats');

// Find contradictions
const contradictions = debugLore(loreStore, 'contradictions', {
  minConfidence: 5
});
```

## Implementation Details

### Lore Extraction Flow

1. AI response includes a `lore` field with `newFacts` and `updatedFacts`
2. `extractLoreFromAIResponse` processes the response
3. `processLoreExtraction` action updates the store
4. Facts are now available for context building

### Context Building Flow

1. The narrative context builder allocates token budget
2. `selectLoreForContext` chooses the most relevant facts
3. `buildLoreContextPrompt` formats selected facts
4. Facts are included in the AI prompt

### State Update Flow

1. Lore action is dispatched (e.g., `ADD_LORE_FACT`)
2. `narrativeReducer` delegates to `loreReducer`
3. `loreReducer` creates immutable state update
4. Component re-renders with new lore data

## Best Practices

1. **Fact Quality**: Write facts as clear, concise statements
2. **Tagging**: Use consistent tags to help relationships emerge
3. **Validation**: Mark questionable facts as invalid until confirmed
4. **Importance Scores**: Assign appropriate importance to facts (higher for core world elements)
5. **Confidence Scores**: Use confidence to represent certainty (higher for established facts)

## Limitations

1. No complex NLP for extraction - relies on structured AI output
2. No semantic analysis for contradiction detection - uses simple text-based detection
3. No UI for lore browsing - primarily for internal consistency
4. No external database integration - uses in-memory state

## Future Enhancements

Potential future improvements include:

1. Advanced contradiction detection with better NLP
2. Player-facing lore codex for browsing established facts
3. Better visualization tools for lore relationships
4. Automatic tagging based on content analysis
5. Integration with external knowledge bases

## Technical Reference

For detailed technical information, refer to:

- `app/types/narrative/lore.types.ts` - Core type definitions
- `app/reducers/loreReducer.ts` - State management
- `app/utils/loreExtraction.ts` - Extraction utilities
- `app/utils/loreContextBuilder.ts` - Context building
- `app/utils/loreDebug.ts` - Debug utilities
- `app/hooks/useLore.ts` - Component access hook
