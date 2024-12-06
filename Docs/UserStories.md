# BootHillGM User Stories with Test Plans

**Note:** This document provides a list of features and functionalities for development tracking, along with high-level test plans. For more detailed explanations of game mechanics and overall vision, please refer to the [Game Design Document](link-to-game-design-document).

## MVP Features

### Character Creation
- [ ] As a player, I want to see my character's essential skills (Shooting, Riding, Brawling) so that I know my character's specialties.
  **Test Plan:**
  - Ensure all essential skills are listed
  - Verify that skill values are calculated correctly based on character attributes
  - Check that skill updates are reflected immediately in the display
  **Status:** Partially implemented. Skills are defined in the data model, but display and calculation need completion.

- [ ] As a player, I want to receive a simple background for my character so that I have a starting point for roleplaying.
  **Test Plan:**
  - Confirm that each character receives a unique background
  - Verify that the background is consistent with the character's attributes and skills
  - Ensure the background is displayed clearly in the character sheet
  **Status:** Not yet implemented.

- [ ] As a player, I want to see a reference table showing Boot Hill rulebook ratings during character creation, so that I understand the meaning of numerical values without AI explanation.
  **Test Plan:**
  - Verify that appropriate rating tables from Boot Hill rules are displayed for each step
  - Ensure tables are clearly formatted and readable
  - Check that tables match the current attribute/skill being set
  - Test table display on different screen sizes

- [ ] As a player, I want to see "Roll Dice" instead of "Generate" for numerical values, with an explanation of the dice roll result.
  **Test Plan:**
  - Verify button text is changed to "Roll Dice"
  - Ensure dice roll results are displayed with clear explanation
  - Check that rolls follow Boot Hill rules
  - Verify dice roll explanation appears before the Next Step button

### Game Session
- [ ] As a player, I want to view the game narrative and dialogue in a scrollable text display so that I can follow the story easily.
  **Priority:** High
  **Test Plan:**
  - Check that new narrative text is added to the display correctly
  - Verify that the text display scrolls automatically to show new content
  - Ensure that past dialogue remains accessible by scrolling up
  **Status:** Partially implemented. Basic narrative display is in place with NarrativeDisplay component, but needs enhanced formatting for dialogue.

- [ ] As a player, I want to experience a linear narrative with minimal branching so that I can enjoy a focused storyline.
  **Priority:** High
  **Test Plan:**
  - Verify that the main storyline progresses in a logical sequence
  - Test decision points to ensure they don't create major narrative branches
  - Check that player choices influence the story without derailing the main plot
  **Status:** Not yet implemented.

### Combat System
- [ ] As a player, I want an enhanced critical hit system, so that combat has more exciting moments.
  **Priority:** Medium
  **Test Plan:**
  - Implement expanded critical hit rules
  - Test critical hit effects in various combat scenarios
  - Verify critical hits add excitement without unbalancing combat
  **Status:** Not yet implemented.

- [ ] As a player, I want to have the option to end combat early if my opponent agrees, so that I can resolve conflicts peacefully when possible.
  **Priority:** Medium
  **Test Plan:**
  - Implement a "Call Truce" button in the combat interface
  - Verify that using this option prompts the AI to consider ending the combat
  - Ensure that combat can end early if the AI agrees to the truce
  **Status:** Not yet implemented.

### Weapon Combat System - Core

- [ ] As a player, I want to see what weapons (if any) both myself and my opponent have available during combat initiation, so that I can make informed combat decisions.
  **Priority:** High
  **Risk Level:** Low
  **Test Plan:**
  - Confirm available weapons are displayed for both combatants
  - Verify weapon availability matches inventory state
  - Ensure UI clearly distinguishes between player and opponent weapons
  - Test cases where either combatant has no weapons
  **Status:** Not yet implemented.

- [ ] As a player, I want weapons to have distinct base damage values, so that different weapons feel meaningful in combat.
  **Priority:** High
  **Risk Level:** Low
  **Test Plan:**
  - Verify each weapon type has appropriate damage values
  - Test damage calculation for different weapons
  - Ensure damage values affect combat outcomes
  - Check that damage is properly logged in combat records
  **Status:** Not yet implemented.

- [ ] As a player, I want to see weapon information in the combat log, so that I can follow the flow of combat clearly.
  **Priority:** Medium
  **Risk Level:** Low
  **Test Plan:**
  - Verify weapon names appear in combat log entries
  - Check that weapon-specific results are clearly communicated
  - Ensure combat log formatting remains consistent
  - Test readability of weapon-related combat entries
  **Status:** Not yet implemented.

- [ ] As a player, I want weapon-specific combat modifiers, so that my choice of weapon matters more in combat.
  **Priority:** High
  **Risk Level:** Low
  **Test Plan:**
  - Implement weapon-specific bonuses and penalties
  - Test different weapons in combat scenarios
  - Verify modifiers affect combat outcomes appropriately
  **Status:** Not yet implemented.

### Inventory and Economy

- [ ] As a player, I want to buy and sell basic goods so that I can experience a simple economy system.
  **Test Plan:**
  - Verify that buying items deducts the correct amount of money
  - Test selling items adds the correct amount of money
  - Ensure inventory and money totals update correctly after transactions
  **Status:** Not yet implemented.

- [ ] As a player, I want to see a visual notification when new items are added to my inventory, so that I'm aware of my character's changing possessions without constantly checking the inventory.
  **Test Plan:**
  - Implement and test a notification system for inventory updates
  - Verify that notifications are visible but not intrusive
  - Check that notifications accurately reflect inventory changes
  - Ensure that multiple rapid inventory changes are handled appropriately
  **Status:** Not yet implemented.

### Campaign Persistence
- [ ] As a player, I want important story information to be recorded in a journal, so that I can keep track of the game's narrative.
  **Test Plan:**
  - Verify that significant story events are automatically added to the journal
  - Check that journal entries include a timestamp and relevant content
  - Ensure that the journal is saved as part of the campaign state

- [ ] As a player, I want the AI Game Master to remember important story details from previous sessions, so that the narrative remains consistent across play sessions.
  **Test Plan:**
  - Test that AI responses reference events and information from previous play sessions
  - Verify that the AI maintains consistent NPC personalities and plot points across sessions
  - Check that the AI doesn't contradict previously established story elements

- [ ] As a player, I want to be able to view my journal entries, so that I can refresh my memory on important story details.
  **Test Plan:**
  - Implement a basic UI for viewing journal entries
  - Verify that journal entries are displayed in chronological order
  - Ensure that the journal UI is accessible during gameplay without disrupting the game flow

- As a player, I want combat results to be automatically added to my journal, so that I can keep track of significant battles and their outcomes.
  **Test Plan:**
  - Confirm that a summary of each combat is added to the journal upon completion
  - Verify that the combat entry includes relevant details (opponent, outcome, any significant events)
  - Check that the journal entry is formatted consistently with other entries
  **Status:** Not yet implemented.

### Setting and Atmosphere
- [ ] As a player, I want to explore one frontier town and its immediate surroundings so that I can immerse myself in a focused Western setting.
  **Priority:** High
  **Test Plan:**
  - Verify that all areas of the town and surroundings are accessible
  - Test interactions with various locations and objects in the environment
  - Ensure the setting is consistently portrayed throughout the game
  **Status:** Not yet implemented.

- [ ] As a player, I want to experience themes of survival, law vs. outlaw, and frontier justice so that I feel like I'm in an authentic Western story.
  **Priority:** High
  **Test Plan:**
  - Verify that these themes are present in the main storyline and side quests
  - Test player choices that relate to these themes
  - Ensure the game's atmosphere consistently reflects these Western themes
  **Status:** Not yet implemented.

### UI/UX Improvements

- [ ] As a developer, I want to add identifying IDs/classes to page markup, including specific classes for Boot Hill rules tables and dice roll results.
  **Test Plan:**
  - Review all components and add appropriate IDs and classes
  - Verify that added IDs and classes are unique and descriptive
  - Test that added identifiers don't break existing styles or functionality
  - Ensure Boot Hill rules tables and dice roll results have clear identifying classes
  

### Technical Improvements
- [ ] As a developer, I want to add identifying IDs/classes to page markup to make debugging and testing easier.
  **Test Plan:**
  - Review all components and add appropriate IDs and classes
  - Verify that added IDs and classes are unique and descriptive
  - Test that added identifiers don't break existing styles or functionality

- [ ] As a user, I want to see character attributes and skills in title case for better readability.
  **Test Plan:**
  - Check all instances where character attributes and skills are displayed
  - Verify that attributes and skills are consistently displayed in title case

- [ ] As a user, I want the journal to be on its own separate page, so that it doesn't take up too much space on the Game Session page.
  **Test Plan:**
  - Create a new page for the journal
  - Add navigation to the journal page from the Game Session page
  - Verify that the journal displays correctly on its own page
  - Ensure that the Game Session page layout improves with the journal removed

- [ ] As a user, I want to see a more condensed combat log, so that I can quickly review the combat history without excessive scrolling.
  **Test Plan:**
  - Redesign the combat log to display information more concisely
  - Ensure that all important combat information is still visible
  - Verify that the condensed log is easy to read and understand

- [ ] As a user, I want to see weapon information in each combat turn, so that I know what weapons are being used.
  **Test Plan:**
  - Update the combat system to include weapon information in each turn
  - Verify that weapon names are displayed correctly for both player and opponent
  - Ensure that weapon changes during combat are reflected in the log

- [ ] As a user, I want to see the dice rolls for each combat turn, so that I understand how the results are determined.
  **Test Plan:**
  - Implement dice roll display in the combat system
  - Verify that displayed rolls align with Boot Hill rules
  - Ensure that the relationship between rolls and outcomes is clear

- [ ] As a user, I want to see my actions emphasized in the narrative, so that I can easily distinguish them from the rest of the text.
  **Test Plan:**
  - Implement visual distinction for player actions in the narrative
  - Verify that player actions are easily identifiable
  - Ensure that the emphasis doesn't disrupt the overall readability of the narrative

### Weapon Combat System

- [ ] As a GM, I want NPCs to be dynamically assigned appropriate weapons when combat begins, based on their character type, location, and story context.
  **Priority:** High
  **Risk Level:** Medium
  **Test Plan:**
  - Verify AI assigns weapons based on NPC type (lawman, outlaw, civilian)
  - Test weapon assignment considers location context
  - Ensure some NPCs remain unarmed when appropriate
  - Check that combat handles both armed/unarmed NPCs gracefully
  - Verify weapon selections are period-accurate
  **Dependencies:** Combat system, NPC system
  **Status:** Not yet implemented.

- [ ] As a player, I want to be able to equip weapons from my inventory, so that I can use them in combat.
  **Priority:** High
  **Risk Level:** Low
  **Test Plan:**
  - Verify weapons can be equipped from inventory
  - Test equip/unequip functionality
  - Ensure equipped weapon status persists
  **Status:** Not yet implemented.

- [ ] As a player, I want to see what weapon (if any) opponents are wielding during encounters, so I can make informed combat decisions.
  **Priority:** High
  **Risk Level:** Low
  **Test Plan:**
  - Verify opponent weapon information is visible
  - Test different opponent weapon configurations
  - Ensure weapon info updates if opponent changes weapons
- As a player, I want to use different weapons and items during combat to add more tactical depth to battles.

- [ ] As a player, I want the Aim action to provide accuracy bonuses that persist until I fire or move, so that careful aiming is rewarded.
  **Priority:** Medium
  **Risk Level:** Low
  **Test Plan:**
  - Verify aim bonus is applied correctly
  - Test bonus reset conditions
  - Check stacking limits
  **Status:** Partially implemented - needs testing and balance.

- [ ] As a player, I want the Reload action to restore my weapon's ammunition, so that I can continue fighting after running out.
  **Priority:** High
  **Risk Level:** Low
  **Test Plan:**
  - Verify reload restores ammunition
  - Test reload timing/limitations
  - Check ammunition tracking
  **Status:** UI implemented, functionality missing.

- [ ] As a player, I want the Move action to affect combat modifiers based on range, so that positioning matters in gunfights.
  **Priority:** Medium
  **Risk Level:** Medium
  **Test Plan:**
  - Verify range affects accuracy
  - Test movement limitations
  - Check range calculation
  **Status:** UI implemented, effects missing.

- [ ] As a player, I want clear feedback when I cannot use a weapon combat action (like Fire) and why, so that I understand what I need to do.
  **Priority:** High
  **Risk Level:** Low
  **Test Plan:**
  - Test all button disabled states
  - Verify helpful error messages
  - Check state updates
  **Status:** Partially implemented.

- [ ] As a player, I want weapon combat to properly initialize when triggered from narrative events, so that combat flow feels natural.
  **Priority:** High
  **Risk Level:** Medium
  **Test Plan:**
  - Test combat initialization from narrative
  - Verify narrative stops at combat start
  - Ensure proper state transition
  **Status:** Needs improvement.

### Ammunition System
- As a player, I want to manage weapon ammunition and reliability during combat, so that gunfights feel more tactical.
  **Priority:** High
  **Risk Level:** Medium
  **Status:** To Do
  **Dependencies:** Weapon equipment system
- [ ] As a player, I want to track ammunition for my weapons, so that reloading becomes a tactical consideration.
  **Priority:** Medium
  **Risk Level:** Low
  **Test Plan:**
  - Implement ammunition counting
  - Test reload mechanics
  - Verify ammo persistence
  **Status:** Not yet implemented.

## Post-MVP Features

### Advanced Weapon Combat
- [ ] As a player, I want different weapon types to have unique characteristics (rate of fire, reliability, etc.), so that weapon choice matters more.
- [ ] As a player, I want the option to draw/holster weapons outside of combat, so that I can be prepared for encounters.
- [ ] As a player, I want the ability to switch weapons during combat, so that I can adapt to changing situations.
- [ ] As a player, I want weapon malfunctions to occur occasionally, so that combat feels more realistic.
- [ ] As a player, I want different ammunition types to affect combat, so that I have more tactical options.
- [ ] As a player, I want to see a visual representation of range and positioning in weapon combat, so that tactical movement is more intuitive.

### Advanced Character Creation
- As a player, I want to choose from multiple character backgrounds so that I can create more diverse characters.
- As a player, I want to customize my character's appearance so that I can better visualize my persona.
- As a player, I want to select from an expanded list of skills (20+ skills) so that I can create more specialized characters.

### Enhanced Game Session
- As a player, I want to explore multiple towns and wilderness areas so that I can experience a more expansive Old West setting.
- As a player, I want to engage in branching narratives so that my choices have more significant impacts on the story.
- As a player, I want to experience dynamic world events so that the game world feels alive and changing.

### Expanded Combat System
- As a player, I want to use advanced combat tactics so that fights are more strategic and engaging.
- As a player, I want to engage in duels with specific NPCs so that I can experience iconic Western showdowns.
- As a player, I want to consider positioning and environmental factors in combat so that battles feel more realistic.
- As a player, I want to experience critical hits and misses in combat to add more excitement and unpredictability to fights.
- As a player, I want to use different weapons and items during combat to add more tactical depth to battles.
- As a player, I want weapon-specific combat modifiers (range, accuracy, speed), so that weapon choice provides tactical depth.
- As a player, I want to be able to switch weapons during combat, so that I can adapt to changing combat situations.
- As a player, I want weapons to have special properties (two-handed, reload required, etc.), so that combat feels more authentic to the Western setting.
- As a player, I want different ammunition types to affect combat, so that I have more tactical options in gunfights.
- As a player, I want weapon condition and reliability to factor into combat, so that equipment maintenance feels important.

### NPC Interaction
- As a player, I want to form relationships with NPCs so that the game world feels more dynamic and responsive to my actions.
- As a player, I want to recruit NPC companions so that I can form a posse for adventures.
- As a player, I want NPCs to remember past interactions so that the world feels persistent and my actions have consequences.

### Economy and Progression
- As a player, I want to earn and manage in-game currency so that I can experience the economic aspects of the Old West.
- As a player, I want to improve my character's skills and attributes over time so that I can experience long-term character growth.
- As a player, I want to engage with a complex economic system with supply/demand dynamics so that the game world feels more realistic.

### Enhanced UI and Media
- As a player, I want to see thematic graphics and animations so that the game is more visually engaging.
- As a player, I want to use an interactive map for navigation and exploration so that I can better understand the game world.
- As a player, I want to hear ambient sounds and music so that I feel more immersed in the Western setting.

### Future Enhancements
+ [ ] As a player, I want a visual representation of my character that shows wound locations and severity, so I can better understand my character's condition.
+ [ ] As a player, I want clearer item usage prompts when my intentions aren't clear, so I can specify how I want to use items like rope.
+ [ ] As a player, I want a clear understanding of what happens when my character reaches 0 strength, based on Boot Hill rules.
