---
title: Combat Prompt Engineering
aliases: [Combat Prompts, Combat AI Guidelines]
tags: [ai, prompts, combat, gemini, integration]
created: 2024-12-28
updated: 2024-12-28
author: Jack Haas
---

# Combat Prompt Engineering

## Overview
This document outlines the prompt engineering strategies for combat scenarios.

## Purpose
The Combat Prompts documentation aims to:
- Provide technical implementation details for developers
- Document combat generation patterns and architecture
- Serve as a reference for combat-related components
- Maintain consistency across system integrations

# Combat Prompt Engineering

## Overview
This document outlines the prompt engineering strategies for combat scenarios in BootHillGM, focusing on generating engaging and mechanically accurate combat narratives using the Gemini API.

## Base Combat Prompt Structure

### System Context
```typescript
const systemContext = `
You are the AI Game Master for a Boot Hill RPG combat scenario.
Follow Boot Hill v2 rules for combat resolution.
Maintain Western genre authenticity.
Focus on tactical decisions and consequences.
`;
```

### Combat State Context
```typescript
const combatContext = {
  playerState: {
    health: number,
    position: string,
    weapon: WeaponType,
    ammunition: number
  },
  opponentState: {
    health: number,
    position: string,
    weapon: WeaponType,
    ammunition: number
  },
  environment: {
    range: number,
    cover: CoverType[],
    lighting: LightingCondition
  }
};
```

## Prompt Templates

### Combat Initialization
```typescript
const initializeCombat = `
${systemContext}
Current Situation:
- Location: ${location}
- Opponents: ${opponents}
- Initial Range: ${range} yards
- Environmental Conditions: ${conditions}

Generate an engaging combat introduction that:
1. Sets the tactical situation
2. Describes opponent positions
3. Highlights environmental factors
4. Suggests initial tactical options
`;
```

### Turn Resolution
```typescript
const resolveTurn = `
${systemContext}
${combatContext}
Last Action: ${action}
Result: ${result}

Generate a narrative that:
1. Describes the action's outcome
2. Updates tactical situation
3. Suggests next options
4. Maintains tension
`;
```

## Narrative Guidelines

### Combat Description Elements
1. Physical Actions
   - Weapon handling
   - Movement
   - Use of cover
   - Environmental interaction

2. Tactical Elements
   - Range considerations
   - Ammunition management
   - Position advantages
   - Cover utilization

3. Character Reactions
   - Physical responses
   - Emotional states
   - Tactical decisions
   - Environmental awareness

## Token Optimization

### Context Management
- Include only relevant state
- Summarize previous actions
- Focus on current tactical situation
- Remove redundant information

### Response Format
```typescript
interface CombatResponse {
  narrative: string;      // Combat description
  suggestions: string[];  // Tactical options
  state_updates: {        // Required state changes
    health: number;
    position: string;
    ammunition: number;
  };
}
```

## Special Scenarios

### Critical Hits
```typescript
const criticalHitPrompt = `
${systemContext}
Critical Hit Details:
- Location: ${hitLocation}
- Weapon: ${weapon}
- Damage: ${damage}

Generate dramatic but realistic outcome that:
1. Describes the exceptional hit
2. Details immediate effects
3. Suggests lasting consequences
`;
```

### Weapon Malfunctions
```typescript
const malfunctionPrompt = `
${systemContext}
Malfunction Type: ${type}
Weapon: ${weapon}
Situation: ${situation}

Generate realistic malfunction scenario that:
1. Describes the malfunction
2. Explains immediate effects
3. Suggests recovery options
`;
```

## Error Handling

### Recovery Prompts
```typescript
const recoveryPrompt = `
${systemContext}
Error Type: ${errorType}
Last Valid State: ${lastState}

Generate recovery narrative that:
1. Maintains continuity
2. Explains state changes
3. Provides new options
`;
```

## Integration Points

### Combat System
- [[../../core-systems/combat-system|Combat System]]
- [[../../boot-hill-rules/combat-rules|Combat Rules]]
- [[../../boot-hill-rules/weapons-chart|Weapons Reference]]

### AI Integration
- [[../game-master-logic|GM Logic]]
- [[../gemini-integration|Gemini Integration]]
- [[core-prompts|Core Prompts]]

### State Management
- [[../../core-systems/state-management|State Management]]
- [[../../features/_current/journal-enhancements|Combat Logging]]

## Related Documentation
- [[storytelling|Storytelling Prompts]]
- [[../../reference/gemini-api-guide|Gemini API Guide]]
- [[../../technical-guides/testing|Testing Combat Prompts]]
