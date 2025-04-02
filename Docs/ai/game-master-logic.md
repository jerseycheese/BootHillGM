---
title: AI Game Master Logic
aliases: [AI GM Logic, Game Master System]
tags: [ai, core-system, mvp]
created: 2024-12-28
updated: 2025-04-01
---

# AI Game Master Logic (MVP)

## Overview
The AI Game Master (GM) is the core component of BootHillGM, responsible for creating and managing the game world, narrating the story, and facilitating player interactions within a simplified Boot Hill RPG framework. This document outlines the essential logic for implementing the AI GM in the MVP version.

For implementation details, see:
- [[gemini-integration|Gemini Integration]]
- [[ai-game-service|AI Game Service Architecture]]

## Core Functions (MVP)

### Narrative Generation
- [x] Create a linear main storyline with player choices influencing story details.
- [x] Generate basic descriptive text for locations, characters, and events
- [x] Adapt narrative based on limited player choices
- [x] Theme analysis system for contextual storytelling
- [x] Automatic theme detection from player actions
- [x] Enhanced prompts incorporating relevant Western themes
- [x] Utilize `narrativeReducer` to manage narrative state, including story points, choices, arcs, and branches.
- [x] Use action creators (e.g., `navigateToPoint`, `selectChoice`) to update the narrative state.
- [ ] Story points are currently predefined, driving the narrative progression.

For prompt details, see [[prompt-engineering/storytelling|Storytelling Prompts]].

### Character Interaction
- [x] Generate simple NPC dialogues based on predefined personality types
- [x] Respond to player inputs using pattern matching and predefined responses
- [ ] Maintain basic consistency in NPC behavior throughout a game session

### Game Mechanics Implementation
- [x] Interpret and apply simplified Boot Hill RPG rules
- [x] Manage basic skill checks and simplified combat resolution
- [x] Track and update essential game state (character stats, inventory, quest progress)

For rules implementation, see [[../boot-hill-rules/combat-rules|Boot Hill Combat Rules]].

### World Management
- [ ] Maintain a small-scale world state (one town and immediate surroundings)
- [ ] Manage simple time progression (day/night cycle)

### Journal Management
- [x] Generate narrative summaries for player actions
  - Input: Raw player action (e.g., "drink health potion")
  - Output: Narrative summary (e.g., "CHARACTER_NAME drank his last health potion")
- [x] Ensure summaries are concise (1-2 sentences)
- [x] Include relevant context (e.g., "last health potion" if it's the last one)
- [x] Use character name and appropriate pronouns
- [x] Journal entries can be optionally added at specific story points via the `journalEntry` property in the `StoryPoint` interface.

For journal system details, see [[../core-systems/journal-system|Journal System]].

## AI Model Integration

### Prompt Engineering
- [x] Design a set of base prompts for common game scenarios (e.g., dialogue, exploration, combat)
- [x] Include simplified Boot Hill RPG rules and Western setting details in prompts
- [x] Implement a basic system to construct prompts based on current game state

For prompt templates, see [[prompt-engineering/core-prompts|Core Prompts]].

### Context Management
- [x] Maintain a limited context of recent game events and player actions
- [x] Implement a simple summarization mechanism to keep context within token limits

## Game Master Personality

### Tone and Style
- [x] Adopt a consistent, neutral tone for narration
- [x] Use basic Western-themed language and terminology

For theme guidelines, see [[training-data/western-themes|Western Themes]].

### Consistency
- [x] Implement simple checks to ensure narrative consistency
- [x] Maintain a basic log of key decisions and events

## Error Handling and Fallback Mechanisms

### Input Interpretation
- [x] Implement basic keyword matching for player inputs
- [x] Provide clarification prompts for ambiguous inputs

### Output Validation
- [x] Implement basic checks for AI-generated content relevance
- [x] Use predefined fallback responses for unsuitable AI outputs

### Connection Issues
- [x] Implement basic error messages for API timeouts or failures
- [x] Context-aware fallback responses for different player actions

For implementation details, see [[ai-game-service|AI Game Service Architecture]].

## Boot Hill RPG Specific Logic

### Character Creation
- [x] Guide players through a simplified character creation process
- [x] Generate basic starting equipment

For character creation details, see [[../features/_completed/character-creation|Character Creation]].

### Skill Checks
- [x] Implement basic skill checks using simplified Boot Hill rules

For rules reference, see [[../boot-hill-rules/base-numbers|Base Numbers Calculation]].

### Combat System
- [x] Manage simplified turn-based combat
- [x] Resolve basic attacks and damage

For combat implementation, see [[../core-systems/combat-system|Combat System]].

## Web Application Considerations

### State Management
- [x] Utilize React Context for managing essential game state
- [x] Implement basic state updates to reflect game progress

For state management details, see [[../core-systems/state-management|State Management]].

### API Integration
- [x] Use Next.js API routes for fundamental AI interactions
- [x] Implement basic error handling for API calls

For API details, see [[../architecture/api-integration|API Integration]].

### User Interface
- [x] Generate text-based responses for rendering in the UI
- [x] Provide simple formatted output (e.g., character stats, inventory lists)

For UI implementation, see [[../architecture/ui-wireframes|UI Wireframes]].

## Performance Considerations

### Response Time Optimization
- [x] Implement basic caching for frequently used game data
- [x] Optimize prompt construction to minimize token usage
- [x] Modular service architecture for improved maintainability

### Memory Management
- [x] Implement efficient storage of essential game state
- [ ] Regularly clear non-essential information from the AI context

This document serves as a guide for implementing the core AI Game Master functionalities in the MVP version of BootHillGM. The focus is on essential features to create a functional and enjoyable basic game experience.