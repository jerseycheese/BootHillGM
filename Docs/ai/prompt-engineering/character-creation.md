---
title: Character Creation Prompt Engineering
aliases: [Character Prompts, Player Creation Guidelines]
tags: [ai, prompts, character, creation, integration]
created: 2024-12-28
updated: 2024-12-28
author: Jack Haas
---

# Character Creation Prompt Engineering

## Overview
This document outlines the prompt engineering strategies for creating authentic Western characters in BootHillGM.

## Purpose
The Character Creation Prompts documentation aims to:
- Provide technical implementation details for developers
- Document character generation patterns and architecture
- Serve as a reference for character-related components
- Maintain consistency across system integrations

## Base Character Structure

### System Context
```typescript
const characterContext = `
You are the AI Game Master for a Boot Hill RPG campaign.
Create authentic Western characters.
Maintain consistent world state.
Focus on player agency and consequences.
`;
```

### Character Attributes
```typescript
interface CharacterAttributes {
  background: string;
  motivation: string;
  personalityTraits: string[];
  skills: string[];
  appearance: string;
  relationships: Relationship[];
}
```

## Prompt Templates

### Character Background
```typescript
const backgroundPrompt = `
${characterContext}
Player Preferences: ${preferences}
World Context: ${worldState}

Generate character background that:
1. Fits Western setting
2. Provides clear motivation
3. Establishes key relationships
4. Suggests potential story hooks
`;
```

### Personality Development
```typescript
const personalityPrompt = `
${characterContext}
Character Background: ${background}
Current Situation: ${situation}

Generate personality traits that:
1. Reflect background
2. Provide roleplay opportunities
3. Suggest potential conflicts
4. Enable character growth
`;
```

## Integration Points

### Core Systems
- [[../../core-systems/state-management|State Management]]
- [[../../core-systems/journal-system|Journal System]]
- [[../game-master-logic|GM Logic]]

### Related Prompts
- [[core-prompts|Core Prompts]]
- [[storytelling|Storytelling Prompts]]
- [[combat|Combat Prompts]]

## Related Documentation
- [[../../boot-hill-rules/character-creation|Character Creation Rules]]
- [[../../features/_completed/character-creation|Character Creation System]]
- [[../../training-data/western-archetypes|Western Archetypes]]
