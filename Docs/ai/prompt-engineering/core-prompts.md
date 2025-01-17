---
title: Core AI Prompts
aliases: [Base Prompts, Common Prompts, Foundation Prompts]
tags: [ai, prompts, core, gemini, foundation, integration]
created: 2024-12-28
updated: 2024-12-28
---

# Core AI Prompts

## Overview
This document outlines the base prompt engineering system used for common game scenarios.

## Purpose
The Core Prompts documentation aims to:
- Provide technical implementation details for developers
- Document prompt engineering patterns and architecture
- Serve as a reference for prompt-related components
- Maintain consistency across system integrations

# Core AI Prompts

## Overview
This document outlines the base prompt engineering system used for common game scenarios. These prompts form the foundation of AI-driven gameplay interactions and serve as building blocks for more specific prompt types.

## Base System Context

### Global Context Template
```typescript
const baseContext = `
You are an AI Game Master for Boot Hill RPG, focusing on:
1. Western setting authenticity
2. Consistent narrative voice
3. Rule-compliant interactions
4. Player agency support
5. Dynamic world responses
`;
```

### State Management
```typescript
interface GameState {
  player: {
    character: Character;
    status: PlayerStatus;
    inventory: InventoryItem[];
    location: Location;
  };
  world: {
    time: TimeOfDay;
    weather: Weather;
    activeEvents: Event[];
    nearbyNPCs: NPC[];
  };
  session: {
    recentEvents: GameEvent[];
    activeQuests: Quest[];
    narrativeThemes: string[];
  };
}
```

## Core Prompt Templates

### Basic Interaction
```typescript
const baseInteraction = `
${baseContext}
Current State:
${formatGameState(gameState)}

Player Action: ${action}

Generate response that:
1. Acknowledges action context
2. Provides realistic outcome
3. Updates relevant state
4. Suggests next options
`;
```

### Environment Description
```typescript
const environmentPrompt = `
${baseContext}
Location: ${location}
Time: ${time}
Weather: ${weather}
Notable Elements: ${elements}

Generate description that:
1. Sets scene atmosphere
2. Highlights key features
3. Suggests interactions
4. Maintains setting authenticity
`;
```

## Response Formatting

### Standard Response Structure
```typescript
interface BaseResponse {
  narrative: string;          // Main response text
  stateUpdates: StateUpdate;  // Required state changes
  suggestions: string[];      // Available actions
  metadata: {
    tone: string;
    urgency: number;
    significance: number;
  };
}
```

### Validation Rules
```typescript
const validationChecks = {
  narrative: {
    minLength: 50,
    maxLength: 300,
    requiredElements: [
      'setting',
      'action',
      'consequence'
    ]
  },
  suggestions: {
    minCount: 2,
    maxCount: 5,
    uniqueness: true
  }
};
```

## Common Scenarios

### Location Change
```typescript
const locationTransition = `
${baseContext}
From: ${currentLocation}
To: ${newLocation}
Method: ${transitionMethod}

Generate transition that:
1. Describes journey
2. Notes environmental changes
3. Maintains continuity
4. Introduces new elements
`;
```

### Time Passage
```typescript
const timeProgress = `
${baseContext}
Time Elapsed: ${duration}
Events: ${significantEvents}

Generate passage that:
1. Summarizes duration
2. Highlights changes
3. Updates atmosphere
4. Maintains story flow
`;
```

## Error Prevention

### Context Validation
```typescript
function validateContext(context: GameState): ValidationResult {
  return {
    isValid: boolean;
    missingElements: string[];
    inconsistencies: string[];
    suggestions: string[];
  };
}
```

### Recovery Templates
```typescript
const recoveryPrompt = `
${baseContext}
Error Type: ${errorType}
Last Valid State: ${lastState}

Generate recovery that:
1. Maintains continuity
2. Explains discrepancies
3. Restores coherence
4. Enables progression
`;
```

## Integration Guidelines

### State Updates
- Atomic changes only
- Validate before applying
- Log all modifications
- Maintain consistency

### Context Management
- Prioritize recent events
- Limit context window
- Track key elements
- Manage token usage

## Token Optimization

### Context Pruning
```typescript
const contextPriorities = {
  immediate: ['current_location', 'active_npcs', 'current_quest'],
  high: ['player_status', 'recent_events', 'active_threats'],
  medium: ['background_info', 'secondary_quests', 'world_state'],
  low: ['historical_events', 'distant_locations', 'inactive_npcs']
};
```

### Response Efficiency
- Use concise descriptions
- Limit redundant information
- Focus on relevant details
- Optimize suggestion count

## Related Documentation
- [[combat|Combat Prompts]]
- [[storytelling|Storytelling Prompts]]
- [[character-creation|Character Creation Prompts]]
- [[../../core-systems/ai-integration|AI Integration]]
- [[../../reference/gemini-api-guide|Gemini API Guide]]
- [[../../features/_current/narrative-formatting|Narrative Formatting]]
