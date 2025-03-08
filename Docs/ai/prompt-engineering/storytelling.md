---
title: Storytelling Prompt Engineering
aliases: [Narrative Prompts, Story Generation Guidelines]
tags: [ai, prompts, storytelling, narrative, gemini, integration]
created: 2024-12-28
updated: 2024-12-28
---

# Storytelling Prompt Engineering

## Overview
This document outlines the prompt engineering strategies for generating engaging Western narratives.

## Purpose
The Storytelling Prompts documentation aims to:
- Provide technical implementation details for developers
- Document narrative generation patterns and architecture
- Serve as a reference for storytelling-related components
- Maintain consistency across system integrations

# Storytelling Prompt Engineering

## Overview
This document outlines the prompt engineering strategies for generating engaging Western narratives in BootHillGM using the Gemini API, focusing on dynamic storytelling and player agency.

## Base Narrative Structure

### System Context
```typescript
const systemContext = `
You are the AI Game Master for a Boot Hill RPG campaign.
Create authentic Western narratives.
Maintain consistent world state.
Focus on player agency and consequences.
`;
```

### Story State Context
The narrative system uses the `NarrativeContext` interface (defined in `narrative.types.ts`) to provide context to the AI. This includes information about the current story point, player choices, narrative history, and other relevant details.

```typescript
// See narrative.types.ts for the full NarrativeContext definition
interface NarrativeContext {
  // ... (Refer to narrative.types.ts for the complete interface)
}
```

## Prompt Templates

**Note:** These are example prompts and may need further refinement. The AI primarily interacts with the system through actions like `NAVIGATE_TO_POINT` and `SELECT_CHOICE`, and the narrative is driven by predefined story points.

### Scene Setting
```typescript
const sceneSetup = `
${systemContext}
Current Story Point: ${storyPoint.title}
${storyPoint.content}

// Additional context from NarrativeContext
Tone: ${narrativeContext.tone}
Themes: ${narrativeContext.themes.join(', ')}
World Context: ${narrativeContext.worldContext}
// ... other relevant context

Generate an immersive scene description that builds upon the current story point and context.
`;
```

### NPC Interactions
```typescript
const npcDialog = `
${systemContext}
Current Story Point: ${storyPoint.title}
${storyPoint.content}

NPC: ${npcDetails}
Relationship: ${relationshipStatus}
// ... other relevant context

Generate dialog that reflects the NPC's personality, the current situation, and the overall narrative context.
`;
```

## Narrative Guidelines

### Scene Elements
1. Environmental Description
   - Visual details
   - Ambient sounds
   - Weather conditions
   - Time-specific elements

2. Character Integration
   - NPC behaviors
   - Social dynamics
   - Character motivations
   - Relationship development

3. Story Progression
   - Plot advancement
   - Quest opportunities
   - Character development
   - Consequence revelation

## Theme Management

### Western Elements
```typescript
const westernThemes = {
  core: [
    'frontier justice',
    'personal honor',
    'survival',
    'lawlessness'
  ],
  settings: [
    'dusty towns',
    'saloons',
    'ranches',
    'wilderness'
  ],
  conflicts: [
    'law vs chaos',
    'civilization vs wilderness',
    'honor vs necessity',
    'loyalty vs survival'
  ]
};
```

### Tone Control
```typescript
const tonePrompt = `
${systemContext}
Current Story Point: ${storyPoint.title}
${storyPoint.content}

Current Tone: ${narrativeContext.tone}
// ... other relevant context

Generate narrative that maintains a consistent tone and respects the genre conventions.
`;
```

## Response Formatting

The narrative system primarily uses actions to update the game state. The AI doesn't directly return a structured `StoryResponse` object. Instead, the system processes AI-generated text and dispatches actions like `NAVIGATE_TO_POINT` (based on player choices or story progression) and `ADD_NARRATIVE_HISTORY` (to update the narrative log).

## Special Scenarios

### Quest Generation
```typescript
const questPrompt = `
${systemContext}
Current Story Point: ${storyPoint.title}
${storyPoint.content}

Location: ${location}
Available NPCs: ${npcs}
Current Themes: ${themes}
// ... other relevant context

Generate a quest that fits the current themes, provides clear motivation, and potentially offers choices.
`;
```

### Character Development
```typescript
const characterMoment = `
${systemContext}
Current Story Point: ${storyPoint.title}
${storyPoint.content}

Character: ${character}
Recent Events: ${events}
// ... other relevant context

Generate a character moment that reflects personal growth, acknowledges past choices, and potentially presents new challenges.
`;
```

## Token Optimization

### Context Management
- Prioritize recent events (from `narrativeHistory` and `narrativeContext.playerChoices`)
- Summarize background information (from `narrativeContext.worldContext`, `narrativeContext.importantEvents`)
- Focus on relevant relationships (character information can be included in prompts as needed)
- Track key decision points (using `narrativeContext.playerChoices`)

### Memory Structure
The narrative system primarily uses `NarrativeState` (including `narrativeHistory` and `narrativeContext`) to manage the narrative memory.  There is no separate `NarrativeMemory` interface.

## Error Recovery

### Narrative Continuity
```typescript
const continuityPrompt = `
${systemContext}
// ... relevant context, including recent narrative history

There seems to be a discontinuity in the narrative. Generate text that bridges the gap and maintains story coherence while preserving player agency.
`;
```

## Integration Points

### Core Systems
- [[../../core-systems/state-management|State Management]]
- [[../../core-systems/journal-system|Journal System]]
- [[../game-master-logic|GM Logic]]

### Content Generation
- [[../../features/_completed/storytelling|Storytelling System]]
- [[character-creation|Character Creation Prompts]]
- [[core-prompts|Core Prompts]]

### Reference Material
- [[../../boot-hill-rules/game-overview|Game Overview]]
- [[../../training-data/western-themes|Western Themes]]

## Related Documentation
- [[combat|Combat Prompts]]
- [[../../reference/gemini-api-guide|Gemini API Guide]]
- [[../../features/_current/narrative-formatting|Narrative Formatting]]
