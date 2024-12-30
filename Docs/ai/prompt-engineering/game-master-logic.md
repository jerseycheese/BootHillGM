---
title: Game Master Logic Prompt Engineering
aliases: [GM Logic, Decision Making Guidelines]
tags: [ai, prompts, gm, logic, integration]
created: 2024-12-28
updated: 2024-12-28
author: Jack Haas
---

# Game Master Logic Prompt Engineering

## Overview
This document outlines the prompt engineering strategies for Game Master decision-making in BootHillGM.

## Purpose
The GM Logic documentation aims to:
- Provide technical implementation details for developers
- Document decision-making patterns and architecture
- Serve as a reference for GM-related components
- Maintain consistency across system integrations

## Base GM Logic Structure

### System Context
```typescript
const gmContext = `
You are the AI Game Master for a Boot Hill RPG campaign.
Make decisions that maintain narrative consistency.
Balance player agency with story progression.
Follow Boot Hill v2 rules.
`;
```

### Decision Context
```typescript
interface DecisionContext {
  playerState: {
    character: Character;
    status: PlayerStatus;
    inventory: InventoryItem[];
    location: Location;
  };
  worldState: {
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

## Prompt Templates

### Decision Making
```typescript
const decisionPrompt = `
${gmContext}
Current Situation: ${situation}
Player Action: ${action}

Generate decision that:
1. Maintains narrative consistency
2. Follows game rules
3. Provides meaningful consequences
4. Enables story progression
`;
```

### Rule Interpretation
```typescript
const rulePrompt = `
${gmContext}
Rule: ${rule}
Situation: ${situation}

Generate interpretation that:
1. Applies rule correctly
2. Maintains game balance
3. Provides clear explanation
4. Suggests implementation
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
- [[../../boot-hill-rules/game-overview|Game Overview]]
- [[../../features/_completed/gm-logic|GM Logic System]]
- [[../../training-data/decision-making|Decision Making Patterns]]
