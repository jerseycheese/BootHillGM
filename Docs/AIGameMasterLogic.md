# BootHillGM AI Game Master Logic Document (MVP)

## 1. Overview
The AI Game Master (GM) is the core component of BootHillGM, responsible for creating and managing the game world, narrating the story, and facilitating player interactions within a simplified Boot Hill RPG framework. This document outlines the essential logic for implementing the AI GM in the MVP version.

## 2. Core Functions (MVP)

### 2.1 Narrative Generation
- [ ] Create a linear main storyline with minimal branching
- [x] Generate basic descriptive text for locations, characters, and events
- [x] Adapt narrative based on limited player choices

### 2.2 Character Interaction
- [x] Generate simple NPC dialogues based on predefined personality types
- [x] Respond to player inputs using pattern matching and predefined responses
- [ ] Maintain basic consistency in NPC behavior throughout a game session

### 2.3 Game Mechanics Implementation
- [x] Interpret and apply simplified Boot Hill RPG rules
- [x] Manage basic skill checks and simplified combat resolution
- [x] Track and update essential game state (character stats, inventory, quest progress)

### 2.4 World Management
- [ ] Maintain a small-scale world state (one town and immediate surroundings)
- [ ] Manage simple time progression (day/night cycle)

### 2.5 Journal Management
- [x] Generate narrative summaries for player actions
  - Input: Raw player action (e.g., "drink health potion")
  - Output: Narrative summary (e.g., "CHARACTER_NAME drank his last health potion")
- [x] Ensure summaries are concise (1-2 sentences)
- [x] Include relevant context (e.g., "last health potion" if it's the last one)
- [x] Use character name and appropriate pronouns

## 3. AI Model Integration

### 3.1 Prompt Engineering
- [x] Design a set of base prompts for common game scenarios (e.g., dialogue, exploration, combat)
- [x] Include simplified Boot Hill RPG rules and Western setting details in prompts
- [x] Implement a basic system to construct prompts based on current game state

### 3.2 Context Management
- [x] Maintain a limited context of recent game events and player actions
- [x] Implement a simple summarization mechanism to keep context within token limits

## 4. Game Master Personality

### 4.1 Tone and Style
- [x] Adopt a consistent, neutral tone for narration
- [x] Use basic Western-themed language and terminology

### 4.2 Consistency
- [x] Implement simple checks to ensure narrative consistency
- [x] Maintain a basic log of key decisions and events

## 5. Error Handling and Fallback Mechanisms

### 5.1 Input Interpretation
- [x] Implement basic keyword matching for player inputs
- [x] Provide clarification prompts for ambiguous inputs

### 5.2 Output Validation
- [x] Implement basic checks for AI-generated content relevance
- [x] Use predefined fallback responses for unsuitable AI outputs

### 5.3 Connection Issues
- [x] Implement basic error messages for API timeouts or failures

## 6. Boot Hill RPG Specific Logic

### 6.1 Character Creation
- [x] Guide players through a simplified character creation process
- [x] Generate basic starting equipment

### 6.2 Skill Checks
- [x] Implement basic skill checks using simplified Boot Hill rules

### 6.3 Combat System
- [x] Manage simplified turn-based combat
- [x] Resolve basic attacks and damage

## 7. Web Application Considerations

### 7.1 State Management
- [x] Utilize React Context for managing essential game state
- [x] Implement basic state updates to reflect game progress

### 7.2 API Integration
- [x] Use Next.js API routes for fundamental AI interactions
- [x] Implement basic error handling for API calls

### 7.3 User Interface
- [x] Generate text-based responses for rendering in the UI
- [x] Provide simple formatted output (e.g., character stats, inventory lists)

## 8. Performance Considerations

### 8.1 Response Time Optimization
- [x] Implement basic caching for frequently used game data
- [x] Optimize prompt construction to minimize token usage

### 8.2 Memory Management
- [x] Implement efficient storage of essential game state
- [ ] Regularly clear non-essential information from the AI context

This document serves as a guide for implementing the core AI Game Master functionalities in the MVP version of BootHillGM. The focus is on essential features to create a functional and enjoyable basic game experience.
