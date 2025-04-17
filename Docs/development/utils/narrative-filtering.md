---
title: Narrative Filtering
aliases: [Story Point Metadata Filtering]
tags: [documentation, utils, narrative, metadata]
created: 2025-04-17
updated: 2025-04-17
author: System
---

# Narrative Filtering

## Overview
This document describes the narrative filtering system that ensures system metadata and special markers like STORY_POINT JSON blocks are filtered out from the user-facing narrative display.

## Purpose
When generating narrative content, the AI system sometimes includes special metadata markers like STORY_POINT JSON blocks that help track story progression but shouldn't be visible to the end user. The narrative filtering system:

1. Identifies and removes system metadata from the narrative display
2. Ensures a clean reading experience for the player
3. Allows the system to maintain rich metadata without affecting the user interface

## Implementation Details

The filtering logic is primarily implemented in the `NarrativeContent` component through the `isStoryPointMetadata` function, which detects various patterns of system messages:

```typescript
const isStoryPointMetadata = (content: string): boolean => {
  // System prefixes to check for
  const systemPrefixes = [
    'STORY_POINT:',
    'Game Event:',
    'Context:'
  ];
  
  // Check for prefixes
  if (systemPrefixes.some(prefix => content.includes(prefix))) {
    return true;
  }
  
  // Check for duplicate content with Game Event prefix
  if (content.trim().startsWith('Game Event:')) {
    return true;
  }
  
  // Check for JSON component parts
  return (
    content.trim() === 'STORY_POINT: {' ||
    content.trim().startsWith('"title":') ||
    content.trim().startsWith('"description":') ||
    content.trim().startsWith('"significance":') ||
    content.trim().startsWith('"characters":') ||
    content.trim().startsWith('"isMilestone":') ||
    content.trim() === '}'
  );
};
```

This function is used in the render logic of the `NarrativeContent` component to filter out content that shouldn't be displayed:

```typescript
// Filter out story point metadata JSON and system messages
if (!item.content || 
    item.content.includes('undefined') || 
    isStoryPointMetadata(item.content)) {
  return null;
}
```

## Related Components

The filtering system works alongside these related components:

- `NarrativeDisplay`: Parent component that renders narrative items
- `StoryPointProcessor`: Processes and extracts story points from narrative
- `useDecisionTriggering`: Ensures decisions don't trigger on metadata content

## Testing

Unit tests for the narrative filtering system verify that various forms of metadata are correctly filtered out:

- STORY_POINT JSON blocks
- System message prefixes
- JSON property markers
- Closing braces from JSON blocks

These tests ensure the system correctly identifies and filters all types of metadata while preserving normal narrative content.

## Related Documentation
- [[../architecture/narrative-system|Narrative System]]
- [[../components/narrative-display|Narrative Display Components]]
- [[../core-systems/story-points|Story Points System]]

## Tags
#narrative #filtering #metadata #story-points

## Changelog
- 2025-04-17: Initial documentation of the narrative filtering system
