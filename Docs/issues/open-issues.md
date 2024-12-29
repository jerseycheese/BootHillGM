---
title: Open Issues
created: 2024-12-28
updated: 2024-12-28
---

# Open Issues

This document tracks active bugs in the BootHillGM project. For resolved issues, see [[closed-issues|Closed Issues]].

## AI System Issues

### [BUG-003] AI Pacing Issues
- **Description**: AI advances the story too quickly, not adjusting for the current setting.
- **Steps to Reproduce**: 
  1. Start a game session in different settings (e.g., busy saloon, desert travel)
  2. Observe AI responses to player actions
- **Expected Behavior**: Story progression should be slower in busy locations and faster in travel scenarios
- **Actual Behavior**: Story progresses at the same pace regardless of setting
- **Status**: Open
- **Priority**: Medium
- **Related**: [[../ai/game-master-logic|AI Game Master Logic]], [[../core-systems/ai-integration|AI Integration]]

### [BUG-024] Duplicate AI Text Generation in Character Creation
- **Description**: The AI text for "Step 1" is generated twice, with the second version replacing the first
- **Steps to Reproduce**:
  1. Go to the Create Character page
  2. Observe the AI text generation for "Step 1"
- **Expected Behavior**: AI text should be generated once and displayed
- **Actual Behavior**: AI text is generated twice, with visible replacement
- **Status**: Open
- **Priority**: Medium
- **Related**: [[../features/_completed/character-creation|Character Creation]]

### [BUG-025] Unnecessary Reload of AI Messages
- **Description**: Clicking the "Generate" button reloads all AI messages on the character creation page
- **Steps to Reproduce**:
  1. Go to the Create Character page
  2. Click the "Generate" button for any field
- **Expected Behavior**: Only the field value should be generated
- **Actual Behavior**: Both field value and step description are regenerated
- **Impact**: Wastes API calls and creates unnecessary visual changes
- **Status**: Open
- **Priority**: Medium
- **Related**: [[../features/_completed/character-creation|Character Creation]]

## Character System Issues

### [BUG-022] Generate Random Character Button Malfunction
- **Description**: Generate Random Character button doesn't work on summary page
- **Steps to Reproduce**:
  1. Go to the Character Creation page
  2. Click "Generate Random Character"
  3. On the summary page, click "Generate Random Character" again
- **Expected Behavior**: A new random character should be generated and displayed
- **Actual Behavior**: Only instruction text is reloaded, no new character generated
- **Status**: Open
- **Priority**: Medium
- **Related**: [[../features/_completed/character-creation|Character Creation]]

## Inventory System Issues

### [BUG-023] Duplicate Inventory Items
- **Description**: Inventory items are loading twice in the Game Session
- **Steps to Reproduce**:
  1. Start a game session
  2. Observe the inventory section
- **Expected Behavior**: Inventory items should load once and display correctly
- **Actual Behavior**: Inventory items are displayed twice
- **Status**: Open
- **Priority**: Medium
- **Related**: [[../core-systems/inventory-system|Inventory System]]

## State Management Issues

### [BUG-035] State Protection Timeout Handling
- **Description**: State protection utility triggers timeout too early during complex operations
- **Steps to Reproduce**:
  1. Enter combat with multiple opponents
  2. Perform rapid actions during combat
  3. Observe state update behavior
- **Expected Behavior**: Operations should complete before timeout
- **Actual Behavior**: Some operations timeout prematurely
- **Status**: Open
- **Priority**: High
- **Impact**: Combat System Reliability
- **Related**: [[../core-systems/state-management|State Management]], [[../core-systems/combat-system|Combat System]]

## UI/UX Issues

### [BUG-027] Incorrect Location Display
- **Description**: Location display includes more information than just the location name
- **Steps to Reproduce**:
  1. Start a new game session
  2. Observe the location display in the status area
- **Expected Behavior**: Only location name should be displayed (e.g., "Dusty Crossroads")
- **Actual Behavior**: Additional narrative text included in location display
- **Status**: Open
- **Priority**: Medium
- **Related**: [[../features/_current/narrative-formatting|Narrative Formatting]]