---
title: Story Progression System
aliases: [Main Storyline Progression]
tags: [narrative, ai, feature]
created: 2025-03-09
updated: 2025-03-09
---

# Story Progression System

The Story Progression System enables tracking of AI-generated narrative events while maintaining a coherent storyline for players. Unlike traditional hard-coded narrative systems, this approach allows the AI to generate dynamic content while still providing structure for players to follow.

## Core Concepts

### StoryProgressionPoint

A `StoryProgressionPoint` represents a significant moment in the narrative, with the following key attributes:

- **ID**: Unique identifier
- **Title**: Brief title of the story point
- **Description**: Detailed description of the narrative moment
- **Significance**: How important this point is (major, minor, background, character, milestone)
- **Characters**: Characters involved in this story point
- **Location**: Where this story point occurred
- **Timestamp**: When this story point was recorded
- **Previous Point**: Optional link to the previous point in the storyline

### StoryProgressionState

The `StoryProgressionState` stores the overall state of the story progression:

- **Current Point**: The active story point ID
- **Progression Points**: All recorded story points
- **Main Storyline Points**: Ordered array of major story point IDs
- **Branching Points**: Record of narrative branch points
- **Last Updated**: Timestamp of last update

## Technical Implementation

### Story Point Extraction

The system extracts story points from AI responses using two approaches:

1. **Marker-based extraction**: Looks for explicit `STORY_POINT` tags in the AI response
2. **Content analysis**: Analyzes narrative text for keywords indicating significant story developments

Example of a marker in AI response:

```
STORY_POINT: {
  title: "Discovery of the Hidden Map",
  description: "Found an old map hidden in the floorboards of the saloon",
  significance: "major",
  characters: "Player, Barkeep",
  isMilestone: true
}
```

### AI Response Extension

The `gameService.ts` file has been extended to:

1. Include story progression data in the JSON response structure
2. Add a prompt extension requesting story point identification
3. Process and validate the storyProgression field in responses

### Story Progression Context

For AI continuity, story progression context is provided in the prompt:

```typescript
// Add story progression context to the prompt
const storyContext = storyProgressionContext 
  ? `\nCurrent story progression:\n${storyProgressionContext}\n` 
  : '';
```

## Integration With Other Systems

### Narrative State Management

The Story Progression System integrates with the existing narrative state management:

1. The `narrativeReducer` has been extended with story progression actions
2. Story points can be added to the narrative state
3. The narrative context includes story progression information

### UI Components 

The system connects to UI through:

1. The `useStoryProgression` hook for accessing story state
2. The `NarrativeDisplay` component highlighting key story points

## Usage Examples

### Accessing Story Progression

```typescript
// In a component
const { 
  currentPoint, 
  allPoints, 
  mainStoryline,
  addStoryPoint 
} = useStoryProgression();

// Access current story point
if (currentPoint) {
  const pointDetails = allPoints[currentPoint];
  // Use point details...
}
```

### Generating Story Summary

```typescript
import { generateStoryProgressionSummary } from '../utils/storyUtils';

// Generate a summary for AI context
const summary = generateStoryProgressionSummary(storyProgressionState, 5);
```

## Future Enhancements

The following enhancements are planned:

1. **Improved Extraction Accuracy**: Enhancing the accuracy of story point detection (see issue #185)
2. **Visual Story Map**: Creating a visual representation of story progression (see issue #186)
3. **Journal Integration**: Connecting story points to the journal system
4. **Story Branching**: Better support for narrative branching based on player decisions

## Related Files

- `BootHillGMApp/app/types/narrative.types.ts`: Contains StoryProgressionPoint interface and related types
- `BootHillGMApp/app/utils/storyUtils.ts`: Utility functions for story point extraction and summarization
- `BootHillGMApp/app/services/ai/gameService.ts`: AI response handling with story progression integration
- `BootHillGMApp/app/hooks/useStoryProgression.ts`: Hook for accessing story progression state

## Related Issues

- [#165: Main Storyline Progression System](https://github.com/jerseycheese/BootHillGM/issues/165)
- [#185: Enhance Story Progression Extraction Accuracy](https://github.com/jerseycheese/BootHillGM/issues/185)
- [#186: Add Visual Story Map Component](https://github.com/jerseycheese/BootHillGM/issues/186)
