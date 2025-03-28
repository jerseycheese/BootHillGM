---
title: Decision Service Architecture
aliases: [Decision System]
tags: [architecture, AI, decisions, game-mechanics]
created: 2025-03-16
updated: 2025-03-16
---

# Decision Service Architecture

The Decision Service is responsible for generating contextually appropriate decisions for the player based on the narrative state. It uses AI to create meaningful choices that reflect the player's character traits, recent actions, and the game world state.

## System Overview

The Decision Service follows a modular architecture with clear separation of concerns. This design prioritizes:

- **Testability** through dependency injection
- **Flexibility** with swappable components
- **Maintainability** through focused, single-responsibility modules
- **Extensibility** through well-defined interfaces

## Component Architecture

![Decision Service Architecture](../assets/decision-service-architecture.png)

### Core Components

1. **DecisionService** (Orchestrator)
   - **Purpose**: Central coordination point that delegates to specialized components
   - **Responsibilities**: Configuration, orchestration, public API
   - **Location**: `/services/ai/decision-service/index.ts`

2. **NarrativeDecisionDetector**
   - **Purpose**: Determines when a decision point should be presented
   - **Responsibilities**: Context analysis, decision scoring, timing control
   - **Location**: `/services/ai/decision-service/decision-detector.ts`

3. **AIDecisionGenerator**
   - **Purpose**: Generates AI-driven contextual decisions
   - **Responsibilities**: Context preparation, prompt building, response parsing
   - **Location**: `/services/ai/decision-service/decision-generator.ts`

4. **DecisionHistoryService**
   - **Purpose**: Manages the history of player decisions
   - **Responsibilities**: Recording choices, maintaining history, providing context
   - **Location**: `/services/ai/decision-service/decision-history.ts`

5. **AIServiceClient**
   - **Purpose**: Handles communication with AI services
   - **Responsibilities**: API requests, rate limiting, error handling, retries
   - **Location**: `/services/ai/decision-service/ai-client.ts`

## Data Flow

1. **Decision Detection**:
   - Game state triggers a check for potential decision points
   - The detector evaluates narrative context using various factors:
     - Recent dialogue/action balance
     - Time since last decision
     - Story importance
     - Character situation
   - A relevance score is calculated and compared to a threshold

2. **Decision Generation**:
   - If a decision point is detected, narrative context is extracted
   - Character information, recent events, and previous decisions are compiled
   - A prompt is sent to the AI service via the client
   - The response is parsed, validated, and enhanced if needed

3. **Decision Presentation**:
   - The generated decision is converted to the PlayerDecision format
   - It's presented to the player through the UI
   - The player makes a choice, which is recorded in history
   - The narrative continues with the consequences of that choice

## Configuration

The Decision Service can be configured through the `DecisionServiceConfig` interface:

```typescript
interface DecisionServiceConfig {
  minDecisionInterval: number;
  relevanceThreshold: number;
  maxOptionsPerDecision: number;
  apiConfig: AIServiceConfig;
}
```

Default values are defined in `constants/decision-service.constants.ts`.

## Extension Points

The modular architecture makes it easy to extend or replace components:

1. **Custom Detection Logic**: Implement the `DecisionDetector` interface
2. **Alternative Generation**: Implement the `DecisionGenerator` interface
3. **Different History Management**: Implement the `DecisionHistoryManager` interface
4. **Custom AI Providers**: Implement the `AIClient` interface

## Integration with Narrative System

The Decision Service integrates with the narrative system through:

1. The `useNarrativeContext` hook which manages player decisions
2. The `DecisionContext` which provides decision state to components
3. The `PlayerDecisionCard` component which displays decisions to the player
4. Various utility functions for processing decision impacts (see [[../core-systems/player-decision-system#Technical Implementation Notes|Player Decision System]] for details).

## Related Documentation

- [[state-management|State Management]]
- [[../ai/ai-integration|AI Integration]]
- [[../core-systems/narrative-system|Narrative System]]
