---
title: Current User Stories (MVP)
created: 2024-12-28
updated: 2024-12-28
---

# Current User Stories (MVP)

This document provides a list of features and functionalities currently in development, along with high-level test plans. For more detailed explanations of game mechanics and overall vision, see [[../../meta/game-design|Game Design Document]].

## Character Creation

- [ ] As a player, I want to receive a simple background for my character so that I have a starting point for roleplaying.
  **Test Plan:**
  - Confirm that each character receives a unique background
  - Verify that the background is consistent with the character's attributes
  - Ensure the background is displayed clearly in the character sheet
  **Status:** Not yet implemented.
  **Related:** [[../../features/_completed/character-creation|Character Creation]]

- [ ] As a player, I want to see a reference table showing Boot Hill rulebook ratings during character creation.
  **Test Plan:**
  - Verify that appropriate rating tables from Boot Hill rules are displayed for each step
  - Ensure tables are clearly formatted and readable
  - Check that tables match the current attribute being set
  - Test table display on different screen sizes
  **Related:** [[../../boot-hill-rules/character-creation|Character Creation Rules]]

- [ ] As a player, I want to see "Roll Dice" instead of "Generate" for numerical values.
  **Test Plan:**
  - Verify button text is changed to "Roll Dice"
  - Ensure dice roll results are displayed with clear explanation
  - Check that rolls follow Boot Hill rules
  - Verify dice roll explanation appears before the Next Step button
  **Related:** [[../../boot-hill-rules/base-numbers|Base Numbers Calculation]]

## Game Session

- [ ] As a player, I want to view the game narrative and dialogue in a scrollable text display.
  **Priority:** High
  **Test Plan:**
  - Check that new narrative text is added to the display correctly
  - Verify that the text display scrolls automatically to show new content
  - Ensure that past dialogue remains accessible by scrolling up
  **Status:** Partially implemented with NarrativeDisplay component
  **Related:** [[../../features/_current/narrative-formatting|Narrative Formatting]]

- [ ] As a player, I want to experience a linear narrative with minimal branching.
  **Priority:** High
  **Test Plan:**
  - Verify that the main storyline progresses in a logical sequence
  - Test decision points to ensure they don't create major narrative branches
  - Check that player choices influence the story without derailing the main plot
  **Related:** [[../../ai/game-master-logic|AI Game Master Logic]]

## Combat System

- [ ] As a player, I want an enhanced critical hit system.
  **Priority:** Medium
  **Test Plan:**
  - Implement expanded critical hit rules
  - Test critical hit effects in various combat scenarios
  - Verify critical hits add excitement without unbalancing combat
  **Related:** [[../../core-systems/combat-system|Combat System]]

- [ ] As a player, I want to have the option to end combat early if my opponent agrees.
  **Priority:** Medium
  **Test Plan:**
  - Implement a "Call Truce" button in the combat interface
  - Verify that using this option prompts the AI to consider ending the combat
  - Ensure that combat can end early if the AI agrees to the truce
  **Related:** [[../../core-systems/combat-system|Combat System]]

- [ ] As a developer, I want to integrate the `rollDice` function from `diceUtils.ts` into the `CombatSystem.tsx` component, so that the combat system uses the new, comprehensive dice rolling logic.
  **Test Plan:**
  - Verify that `CombatSystem.tsx` uses the `rollDice` function from `diceUtils.ts` for all dice rolls.
  - Test various combat scenarios to ensure that dice rolls are handled correctly and consistently.
  - Check that the results of dice rolls are accurately reflected in the combat log and game state.
  **Related:** [[../../core-systems/combat-system|Combat System]], [[../../../BootHillGMApp/app/utils/diceUtils.ts|diceUtils.ts]]

## Weapon Combat System

- [ ] As a player, I want to see available weapons during combat initiation.
  **Priority:** High
  **Risk Level:** Low
  **Test Plan:**
  - Confirm available weapons are displayed for both combatants
  - Verify weapon availability matches inventory state
  - Ensure UI clearly distinguishes between player and opponent weapons
  - Test cases where either combatant has no weapons
  **Related:** [[../../core-systems/combat-system|Combat System]]

- [ ] As a player, I want weapons to have distinct base damage values.
  **Priority:** High
  **Risk Level:** Low
  **Test Plan:**
  - Verify each weapon type has appropriate damage values
  - Test damage calculation for different weapons
  - Ensure damage values affect combat outcomes
  - Check that damage is properly logged in combat records
  **Related:** [[../../boot-hill-rules/weapons-chart|Weapons Chart]]

## Inventory and Economy

- [ ] As a player, I want to buy and sell basic goods.
  **Test Plan:**
  - Verify that buying items deducts the correct amount of money
  - Test selling items adds the correct amount of money
  - Ensure inventory and money totals update correctly after transactions
  **Related:** [[../../core-systems/inventory-system|Inventory System]]

- [ ] As a player, I want to see a visual notification when new items are added.
  **Test Plan:**
  - Implement and test a notification system for inventory updates
  - Verify that notifications are visible but not intrusive
  - Check that notifications accurately reflect inventory changes
  - Ensure that multiple rapid inventory changes are handled appropriately
  **Related:** [[../../features/_current/inventory-interactions|Inventory Interactions]]

## Campaign Persistence

- [ ] As a player, I want important story information to be recorded in a journal.
  **Test Plan:**
  - Verify that significant story events are automatically added to the journal
  - Check that journal entries include a timestamp and relevant content
  - Ensure that the journal is saved as part of the campaign state
  **Related:** [[../../core-systems/journal-system|Journal System]]

- [ ] As a player, I want the AI Game Master to remember important story details.
  **Test Plan:**
  - Test that AI responses reference events from previous sessions
  - Verify that the AI maintains consistent NPC personalities
  - Check that the AI doesn't contradict established story elements
  **Related:** [[../../ai/game-master-logic|AI Game Master Logic]]

## Setting and Atmosphere

- [ ] As a player, I want to explore one frontier town and its surroundings.
  **Priority:** High
  **Test Plan:**
  - Verify that all areas of the town and surroundings are accessible
  - Test interactions with various locations and objects
  - Ensure the setting is consistently portrayed
  **Related:** [[../../ai/training-data/western-themes|Western Themes]]

## Technical Improvements

- [ ] As a developer, I want to add identifying IDs/classes to page markup.
  **Test Plan:**
  - Review all components and add appropriate IDs and classes
  - Verify that added IDs and classes are unique and descriptive
  - Test that added identifiers don't break existing styles
  - Ensure Boot Hill rules tables have clear identifying classes
  **Related:** [[../../technical-guides/testing|Testing Guide]]

- [ ] As a user, I want the journal to be on its own separate page.
  **Test Plan:**
  - Create a new page for the journal
  - Add navigation to the journal page
  - Verify that the journal displays correctly
  - Ensure that the Game Session page layout improves
  **Related:** [[../../core-systems/journal-system|Journal System]]

- [ ] As a developer, I want to research the specific Boot Hill rule tables needed for the game (e.g., hit location, damage modifiers, range modifiers, skill check difficulties), so that I can expand and refine the `RuleTable`, `TableEntry`, and `TableModifier` type definitions in `ruleTableTypes.ts` to accurately represent these tables.
  **Test Plan:**
  - Identify all required rule tables from the Boot Hill rulebook.
  - Verify that the `RuleTable`, `TableEntry`, and `TableModifier` types can accommodate all necessary data for each table.
  - Test the type definitions with mock data to ensure they work as expected.
  **Related:** [[../../boot-hill-rules/|Boot Hill Rules]], [[../../../BootHillGMApp/app/types/ruleTableTypes.ts|ruleTableTypes.ts]]

- [ ] As a developer, I want to create a test suite for the rule table system, so that I can ensure the accuracy and robustness of the system once it's implemented.
  **Test Plan:**
  - Create test cases for each rule table, covering different scenarios and edge cases.
  - Verify that the system correctly retrieves and applies data from the rule tables.
  - Test the system's handling of invalid or missing data.
  **Related:** [[../../technical-guides/testing|Testing Guide]], [[../../../BootHillGMApp/app/types/ruleTableTypes.ts|ruleTableTypes.ts]]