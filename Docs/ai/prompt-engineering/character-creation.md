---
title: Character Creation Prompt Engineering
aliases: [Character Prompts, Player Creation Guidelines]
tags: [ai, prompts, character, creation, integration]
created: 2024-12-28
updated: 2025-04-07
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

### Attribute Generation (`characterService.ts`)
This prompt is used by `generateCompleteCharacter` to get the core numerical attributes and name.
```typescript
const attributePrompt = `
  Generate a complete character for the Boot Hill RPG. Respond with a valid JSON object containing:
  - A top-level "name" property (string). Ensure the generated name is distinct and fitting for a character in the American Old West. IMPORTANT: If the name includes quotes (like nicknames), they MUST be properly escaped with a backslash (e.g., "Clayton \\"Cutter\\" McBride"). Do not include unescaped quotes within the name string.
  - A nested "attributes" object containing the following numeric properties:
    - speed (1-20)
    - gunAccuracy (1-20)
    - throwingAccuracy (1-20)
    - strength (8-20)
    - baseStrength (8-20, should generally match strength)
    - bravery (1-20)
    - experience (0-11)

  Example structure: { "name": "...", "attributes": { "speed": ..., "gunAccuracy": ..., ... } }
  
  Ensure the response is ONLY the JSON object, with no additional text or formatting.
`;
```
**Note:** The specific structure (nested `attributes`) and the requirement for escaped quotes are crucial for successful parsing and validation in the `characterService.ts` implementation.


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
