---
title: Closed Issues
created: 2024-12-28
updated: 2024-12-28
---

# Closed Issues

This document tracks resolved bugs in the BootHillGM project. For active bugs, see [[open-issues|Open Issues]].

## UI/UX Issues

### [BUG-004] Narrative Display UX Issue
- **Description**: New AI messages are not automatically visible to the user
- **Steps to Reproduce**:
  1. Engage in a conversation with the AI that generates multiple messages
  2. Observe the scrollable area after each AI response
- **Expected Behavior**: View should automatically scroll to show the latest AI message at the top
- **Actual Behavior**: User must manually scroll to see new messages
- **Status**: Fixed
- **Resolution**: Implemented smart auto-scrolling with manual override and visual message distinction
- **Closed Date**: 2024-10-27
- **Related**: [[../features/_current/narrative-formatting|Narrative Formatting]]

### [BUG-028] Player Actions Not Visually Distinct
- **Description**: Player actions are not visually emphasized in the game narrative
- **Steps to Reproduce**:
  1. Start a game session
  2. Perform several actions
  3. Review the narrative text
- **Expected Behavior**: Player actions should be visually distinct from the rest of the narrative
- **Actual Behavior**: Player actions blend in with the rest of the narrative text
- **Status**: Fixed
- **Resolution**: Implemented distinct styling for player actions in NarrativeDisplay.tsx
- **Closed Date**: 2024-11-25
- **Related**: [[../features/_current/narrative-formatting|Narrative Formatting]]

### [BUG-032] Combat System UI Polish
- **Description**: Combat system UI needed improvements for better user experience
- **Steps to Reproduce**:
  1. Enter combat with an opponent
  2. Observe health bars and wound displays
  3. Take damage and observe feedback
- **Expected Behavior**: Clear visual feedback for health changes and combat status
- **Actual Behavior**: Basic display without enhanced visual feedback
- **Status**: Fixed
- **Resolution**: Implemented new StrengthDisplay component with progress bars and color-coded wound severity
- **Closed Date**: 2024-11-27
- **Related**: [[../core-systems/combat-system|Combat System]]

## State Management Issues

### [BUG-002] Game Session State Reset
- **Description**: Game state resets when navigating away from and back to the Game Session page
- **Steps to Reproduce**:
  1. Start a game session and interact with the AI
  2. Navigate away from the Game Session page
  3. Return to the Game Session page
- **Expected Behavior**: Game session should continue from where it left off
- **Actual Behavior**: Game session resets to the initial message
- **Status**: Fixed
- **Resolution**: Implemented robust game state persistence using localStorage
- **Closed Date**: 2024-10-24
- **Related**: [[../core-systems/state-management|State Management]]

### [BUG-005] Incomplete Game State Restoration
- **Description**: Some elements of the game state not properly restored when loading a saved game
- **Steps to Reproduce**:
  1. Play a game session and make various character and world state changes
  2. Save the game and exit
  3. Load the saved game and check all game state elements
- **Expected Behavior**: All game state elements should be fully restored
- **Actual Behavior**: Some state elements not correctly restored
- **Status**: Fixed
- **Resolution**: Enhanced state restoration logic and validation
- **Closed Date**: 2024-11-02
- **Related**: [[../core-systems/state-management|State Management]]

## Combat System Issues

### [BUG-031] Combat Log Text Metadata
- **Description**: Combat log displayed raw metadata and suggested actions in text output
- **Steps to Reproduce**:
  1. Enter combat with an NPC
  2. Perform combat actions
  3. Observe combat log entries
- **Expected Behavior**: Combat log should show clean narrative text without metadata
- **Actual Behavior**: SUGGESTED_ACTIONS JSON and metadata appeared in combat messages
- **Status**: Fixed
- **Resolution**: Implemented enhanced text cleaning in combatUtils.ts
- **Closed Date**: 2024-10-31
- **Related**: [[../core-systems/combat-system|Combat System]]

### [BUG-034] Post-Combat Narrative Cleanup
- **Description**: Narrative updates after combat ends contain confusing or redundant information
- **Status**: Fixed
- **Resolution**: Implemented cleaner combat end messages with formatCombatEndMessage function
- **Closed Date**: 2024-11-22
- **Related**: [[../core-systems/combat-system|Combat System]], [[../features/_current/narrative-formatting|Narrative Formatting]]

## Character Creation Issues

### [BUG-021] Delayed Content Update
- **Description**: When generating a random character, there's a delay in updating the UI
- **Resolution**:
  - Implemented granular loading states
  - Added proper async/await handling
  - Removed unnecessary loading states
  - Improved loading indicator visibility
- **Closed Date**: 2024-11-03
- **Related**: [[../features/_completed/character-creation|Character Creation]]

### [BUG-026] Character Creation Progress Not Saved
- **Description**: Character creation progress not saved incrementally
- **Resolution**: Character creation is no longer a multi-step process
- **Closed Date**: 2024-12-26
- **Related**: [[../features/_completed/character-creation|Character Creation]]

## Text Processing Issues

### [BUG-033] Narrative Metadata Cleanup
- **Description**: Metadata markers appearing in narrative text and combat logs
- **Steps to Reproduce**:
  1. Engage in combat or narrative interactions
  2. Check output text for metadata markers
- **Expected Behavior**: Clean text without metadata markers
- **Actual Behavior**: Metadata markers visible in output
- **Status**: Fixed
- **Resolution**: Enhanced text cleaning implementation
- **Closed Date**: 2024-11-27
- **Related**: [[../features/_current/narrative-formatting|Narrative Formatting]]