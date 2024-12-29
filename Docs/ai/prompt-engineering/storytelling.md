---
title: Storytelling Prompt Engineering
aliases: [Narrative Prompts, Story Generation Guidelines]
tags: [ai, prompts, storytelling, narrative, gemini]
created: 2024-12-28
updated: 2024-12-28
---

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
```typescript
interface StoryContext {
  playerCharacter: {
    background: string;
    motivation: string;
    relationships: Relationship[];
    reputation: number;
  };
  worldState: {
    location: string;
    time: TimeOfDay;
    activeQuests: Quest[];
    knownNPCs: NPC[];
  };
  themeContext: {
    currentThemes: string[];
    toneSettings: string[];
    genreElements: string[];
  };
}
```

## Prompt Templates

### Scene Setting
```typescript
const sceneSetup = `
${systemContext}
Location: ${location}
Time: ${timeOfDay}
Atmosphere: ${atmosphere}

Generate an immersive scene description that:
1. Establishes the setting
2. Introduces key elements
3. Suggests potential interactions
4. Maintains Western authenticity
`;
```

### NPC Interactions
```typescript
const npcDialog = `
${systemContext}
NPC: ${npcDetails}
Relationship: ${relationshipStatus}
Current Situation: ${situation}

Generate dialog that:
1. Reflects NPC personality
2. Acknowledges relationship history
3. Provides meaningful choices
4. Advances current objectives
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
Current Tone: ${tone}
Situation: ${situation}

Generate narrative that:
1. Maintains consistent tone
2. Balances drama and action
3. Respects genre conventions
4. Enables player agency
`;
```

## Response Formatting

### Narrative Structure
```typescript
interface StoryResponse {
  description: string;    // Scene narrative
  options: {             // Player choices
    action: string;
    consequence: string;
    difficulty?: number;
  }[];
  stateUpdates: {        // World state changes
    location?: string;
    time?: TimeOfDay;
    relationships?: RelationshipUpdate[];
  };
}
```

## Special Scenarios

### Quest Generation
```typescript
const questPrompt = `
${systemContext}
Location: ${location}
Available NPCs: ${npcs}
Current Themes: ${themes}

Generate quest that:
1. Fits current themes
2. Provides clear motivation
3. Offers meaningful choices
4. Suggests potential consequences
`;
```

### Character Development
```typescript
const characterMoment = `
${systemContext}
Character: ${character}
Recent Events: ${events}
Current Arc: ${arc}

Generate character moment that:
1. Reflects personal growth
2. Acknowledges past choices
3. Presents new challenges
4. Deepens character development
`;
```

## Token Optimization

### Context Management
- Prioritize recent events
- Summarize background information
- Focus on relevant relationships
- Track key decision points

### Memory Structure
```typescript
interface NarrativeMemory {
  keyEvents: string[];
  activeThreads: string[];
  characterDevelopment: string[];
  worldChanges: string[];
}
```

## Error Recovery

### Narrative Continuity
```typescript
const continuityPrompt = `
${systemContext}
Last Valid State: ${lastState}
Continuity Break: ${breakPoint}

Generate recovery that:
1. Maintains story coherence
2. Explains any gaps
3. Provides path forward
4. Preserves player agency
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