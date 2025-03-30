# Using the Lore Management System

This guide explains how to use the Lore Management System in your components and game logic. The system provides a structured way to track and maintain world facts and lore details to ensure narrative consistency.

## Overview

The Lore Management System helps maintain consistent world facts by:

1. Extracting lore facts from AI responses
2. Storing facts with categories, tags, and metadata
3. Managing relationships between facts
4. Including relevant facts in AI context to ensure consistency

## Accessing Lore Functionality

### Using the `useLore` Hook

The primary way to interact with the lore system is through the `useLore` hook:

```tsx
import { useLore } from '../hooks/useLore';

function MyComponent() {
  const { 
    loreStore,
    addFact,
    updateFact,
    invalidateFact,
    validateFact,
    // ...more methods
  } = useLore();

  // Now you can use these methods to interact with lore
}
```

### Available Methods

The `useLore` hook provides the following methods:

#### Reading Lore

- `loreStore`: The complete lore store state
- `getFactsByCategory(category)`: Get facts by category (character, location, etc.)
- `getFactsByTag(tag)`: Get facts by tag
- `getRelatedFacts(factId)`: Get facts related to a specific fact
- `getAllFactsSortedByImportance(includeInvalid?)`: Get facts sorted by importance

#### Adding & Updating Lore

- `addFact(fact)`: Add a new fact to the store
- `updateFact(id, updates)`: Update an existing fact
- `invalidateFact(id)`: Mark a fact as invalid
- `validateFact(id)`: Mark a fact as valid
- `addRelatedFacts(factId, relatedIds)`: Add relationships between facts
- `removeRelatedFacts(factId, relatedIds)`: Remove relationships between facts
- `addFactTags(factId, tags)`: Add tags to a fact
- `removeFactTags(factId, tags)`: Remove tags from a fact
- `processLoreExtraction(extraction)`: Process lore extraction from AI

## Adding New Facts

To add a new fact to the lore system:

```tsx
const { addFact } = useLore();

addFact({
  content: "Sheriff Johnson has been the law in Redemption for 15 years.",
  category: "character",
  importance: 7,  // 1-10 scale
  confidence: 8,  // 1-10 scale
  tags: ["sheriff johnson", "redemption", "law"],
  relatedFactIds: [], // IDs of related facts
  isValid: true
});
```

The system will automatically:
- Generate a unique ID for the fact
- Add timestamps (createdAt, updatedAt)
- Set the initial version to 1
- Index the fact by category and tags

## Updating Facts

To update an existing fact:

```tsx
const { updateFact } = useLore();

updateFact("fact-123", {
  content: "Updated content for the fact",
  importance: 8,
  confidence: 9
});
```

Only the specified fields will be updated. The system will:
- Increment the version number
- Update the timestamp
- Maintain proper indexes if category or tags change

## Managing Fact Validity

Facts can be marked as valid or invalid as needed:

```tsx
const { invalidateFact, validateFact } = useLore();

// Mark a fact as invalid (contradicted or outdated)
invalidateFact("fact-123");

// Mark a fact as valid again
validateFact("fact-123");
```

Invalid facts are still stored but are excluded from context building by default.

## Working with Categories and Tags

Facts are organized by categories and tags:

```tsx
const { getFactsByCategory, getFactsByTag } = useLore();

// Get all character facts
const characterFacts = getFactsByCategory("character");

// Get facts related to a specific location
const redemptionFacts = getFactsByTag("redemption");
```

Available categories:
- `character`: Information about NPCs and PCs
- `location`: Places, landmarks, regions
- `history`: Past events of significance
- `item`: Notable objects and artifacts
- `concept`: Abstract ideas, rules, customs

## Managing Relationships Between Facts

Facts can be related to each other:

```tsx
const { addRelatedFacts, removeRelatedFacts } = useLore();

// Mark facts as related
addRelatedFacts("fact-123", ["fact-456", "fact-789"]);

// Remove a relationship
removeRelatedFacts("fact-123", ["fact-456"]);
```

You can retrieve related facts:

```tsx
const { getRelatedFacts } = useLore();

// Get all facts related to a specific fact
const relatedFacts = getRelatedFacts("fact-123");
```

## Processing AI Lore Extraction

The AI service automatically extracts lore from responses. You can process this extraction:

```tsx
const { processLoreExtraction } = useLore();

// Extracted lore from AI
const extraction = {
  newFacts: [
    {
      content: "Redemption has a population of about 500 people.",
      category: "location",
      importance: 6,
      confidence: 7,
      tags: ["redemption", "population"]
    }
  ],
  updatedFacts: [
    {
      id: "fact-123",
      content: "Updated content from AI",
      importance: 7
    }
  ]
};

// Process the extraction
processLoreExtraction(extraction);
```

This will add the new facts and update the existing ones.

## Debugging Lore

For debugging purposes, you can import special utilities:

```tsx
import { 
  inspectLoreStore, 
  getLoreStats, 
  findContradictions 
} from '../utils/loreDebug';

// In your component or debug tool
const { loreStore } = useLore();

// Inspect specific aspects of the lore store
const characterFacts = inspectLoreStore(loreStore, {
  category: "character",
  includeInvalid: true
});

// Get statistics about the lore store
const stats = getLoreStats(loreStore);

// Find potential contradictions
const contradictions = findContradictions(loreStore, {
  minConfidence: 5
});
```

## Example Components

For a complete example of using the lore system, refer to:
- `/app/examples/LoreExample.tsx`: Demonstrates adding, searching, and viewing lore facts

## Best Practices

1. **Assign Appropriate Importance**:
   - High importance (8-10): Core facts about the world or main characters
   - Medium importance (4-7): Supplementary details that add depth
   - Low importance (1-3): Minor background details

2. **Use Consistent Tags**:
   - Always tag facts with relevant character names, locations, and concepts
   - Use lowercase tags for consistency
   - Be specific but not overly granular

3. **Set Realistic Confidence**:
   - High confidence (8-10): Definitively established facts
   - Medium confidence (4-7): Likely but not certain facts
   - Low confidence (1-3): Speculative or uncertain information

4. **Manage Relationships**:
   - Connect related facts to build a web of knowledge
   - Be selective about relationships to avoid noise

5. **Handle Contradictions**:
   - When facts contradict, invalidate the less reliable one
   - Consider keeping both with different confidence levels if uncertain

## Integration with Narrative Context

The lore system automatically integrates with the AI context building system. When generating a narrative context, relevant lore facts are selected based on:

1. Relevance to current location
2. Relevance to focused characters
3. Relevance to current themes
4. Overall importance
5. Recency

The system respects token budgets and prioritizes the most relevant facts for the context.

## Implementation Details

For a deeper understanding of how the lore system works internally, refer to:
- `/Docs/core-systems/lore-management-system.md`: Core technical documentation
- `/app/types/narrative/lore.types.ts`: Type definitions
- `/app/reducers/loreReducer.ts`: State management
- `/app/utils/loreExtraction.ts`: AI integration
- `/app/utils/loreContextBuilder.ts`: Context building
