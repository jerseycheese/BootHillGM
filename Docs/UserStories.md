# BootHillGM User Stories with Test Plans

**Note:** This document provides a list of features and functionalities for development tracking, along with high-level test plans. For more detailed explanations of game mechanics and overall vision, please refer to the [Game Design Document](link-to-game-design-document).

## MVP Features

### Character Creation
- [x] As a player, I want to create a character using AI-guided prompts so that I can quickly generate a unique persona for the game.
  **Test Plan:**
  - Verify that AI prompts are generated and displayed to the user
  - Check that user input is correctly captured and processed
  - Ensure that a complete character is created based on user responses
  **Status:** Implemented.

- [ ] As a player, I want to view my character's attributes (Strength, Agility, Intelligence) so that I understand my character's capabilities.
  **Test Plan:**
  - Confirm that all required attributes are displayed
  - Verify that attribute values are within expected ranges
  - Check that changes to attributes are reflected in the display
  **Status:** Partially implemented. Character attributes are defined in the data model, but the display needs to be completed.

- [ ] As a player, I want to see my character's essential skills (Shooting, Riding, Brawling) so that I know my character's specialties.
  **Test Plan:**
  - Ensure all essential skills are listed
  - Verify that skill values are calculated correctly based on character attributes
  - Check that skill updates are reflected immediately in the display
  **Status:** Partially implemented. Skills are defined in the data model, but display and calculation need completion.

- [ ] As a player, I want to generate a character name using AI so that it fits the Western theme.
  **Test Plan:**
  - Verify that the AI generates names appropriate to the Western setting
  - Ensure the user can regenerate names if desired
  - Check that the chosen name is correctly associated with the character
  **Status:** Not yet implemented.

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
- [x] As a player, I want to start a new game session so that I can begin my adventure in the Old West.
  **Test Plan:**
  - Verify that a new game session initializes correctly
  - Ensure all necessary game state variables are set to their starting values
  - Check that the player's character data is loaded into the session
  **Status:** Implemented.

- [x] As a player, I want to interact with the AI Game Master through text input so that I can make decisions and progress the story.
  **Test Plan:**
  - Test various types of player input (commands, dialogue choices, etc.)
  - Verify that the AI responds appropriately to different inputs
  - Ensure the game state updates correctly based on player decisions
  **Status:** Implemented.

- [ ] As a player, I want to view the game narrative and dialogue in a scrollable text display so that I can follow the story easily.
  **Test Plan:**
  - Check that new narrative text is added to the display correctly
  - Verify that the text display scrolls automatically to show new content
  - Ensure that past dialogue remains accessible by scrolling up
  **Status:** Not yet implemented.

- [ ] As a player, I want to experience a linear narrative with minimal branching so that I can enjoy a focused storyline.
  **Test Plan:**
  - Verify that the main storyline progresses in a logical sequence
  - Test decision points to ensure they don't create major narrative branches
  - Check that player choices influence the story without derailing the main plot
  **Status:** Not yet implemented.

- [ ] As a player, I want my game progress to be automatically saved, so that I don't lose my progress if I need to stop playing.
  **Test Plan:**
  - Verify that game state is saved after significant events (e.g., completing a conversation, finishing a combat encounter)
  - Check that saved state includes character information, current location, and game progress
  - Ensure that saving occurs without noticeable impact on game performance

- [ ] As a player, I want to be able to resume my game from where I left off, so that I can continue my adventure across multiple play sessions.
  **Test Plan:**
  - Test loading a saved game from the main menu
  - Verify that the game resumes with the correct character, location, and narrative context
  - Ensure that all relevant game state (inventory, quest progress, etc.) is correctly restored

- [ ] As a player, I want to see three contextual action buttons suggested by the AI, alongside the free text input option, so that I have quick access to logical choices while maintaining freedom of action.
  **Test Plan:**
  - Verify that three contextual actions are displayed as buttons
  - Ensure buttons update based on current game context
  - Check that free text input remains available
  - Verify suggested actions are not duplicated in the narrative text

- [ ] As a player, I want the narrative to focus on describing the scene and events, without including suggested actions in the text itself, so that the narrative flow is cleaner and more immersive.
  **Test Plan:**
  - Verify that narrative text doesn't include explicit action suggestions
  - Ensure narrative remains descriptive and engaging
  - Check that suggested actions appear only as UI buttons
  - Test that narrative and action buttons work together cohesively

- [ ] As a player, I want to see my character's health displayed as "current/total" format, so that I can better understand my character's health status.
  **Test Plan:**
  - Verify health is displayed in "current/total" format
  - Ensure health updates are reflected correctly in both numbers
  - Check that the format remains consistent after taking damage or healing
  - Test that the display handles edge cases (0 health, max health, etc.)


### Journal and Campaign Persistence

- [x] As a player, I want to view my journal entries during a game session, so that I can keep track of important story events.
  **Test Plan:**
  - Implement a basic UI for viewing journal entries
  - Verify that journal entries are displayed in chronological order
  - Ensure that the journal UI is accessible during gameplay without disrupting the game flow
  **Status:** Implemented. Journal entries now include narrative summaries.

- [x] As a player, I want to see narrative summaries of my actions in the journal, so that I can better recall and understand the story progression.
  **Test Plan:**
  - Verify that the AI service generates appropriate narrative summaries for different types of player actions
  - Ensure that generated summaries are concise (1-2 sentences) and informative
  - Check that narrative summaries are correctly added to journal entries
  - Verify that the JournalViewer displays narrative summaries clearly
  **Status:** Implemented. AI-generated narrative summaries are now included in journal entries.

- [ ] As a player, I want my game progress and journal entries to persist when I navigate away from the game session, so that I can resume my game where I left off.
  **Test Plan:**
  - Start a game session and make several interactions
  - Navigate away from the game session and then return
  - Verify that the game state, including journal entries, is restored correctly
  **Status:** Partially implemented, needs testing.


### Combat System
- [ ] As a player, I want to engage in simple turn-based combat so that I can experience the dangers of the Old West.
  **Test Plan:**
  - Verify that combat initializes correctly with proper turn order
  - Test that each combatant can perform actions on their turn
  - Ensure combat resolves correctly (victory, defeat, or escape)
  **Status:** Not yet implemented.

- [ ] As a player, I want to use my character's skills and attributes in combat so that the fights feel personalized to my character.
  **Test Plan:**
  - Confirm that character skills and attributes affect combat calculations
  - Test different character builds to ensure varied combat experiences
  - Verify that skill/attribute improvements reflect in combat performance
  **Status:** Not yet implemented.

- [ ] As a player, I want to see the results of combat actions quickly so that fights maintain a fast pace.
  **Test Plan:**
  - Measure the time between player action and result display
  - Ensure combat messages are clear and concise
  - Verify that the UI updates promptly to reflect combat outcomes
  **Status:** Not yet implemented.

- [ ] As a player, I want to see a scrollable or collapsible combat log, so that I can review the entire combat history without it taking up too much screen space.
  **Test Plan:**
  - Verify that the combat log is scrollable or has a collapse/expand functionality
  - Check that all combat actions are recorded in the log
  - Ensure the log is readable and doesn't interfere with other UI elements
  **Status:** Not yet implemented.


### Inventory and Economy
- [x] As a player, I want to view my character's inventory so that I know what items I have available.
  **Test Plan:**
  - Verify that all items in the inventory are displayed correctly
  - Test adding and removing items from the inventory
  - Ensure the inventory display updates in real-time based on narrative actions
  **Status:** Implemented. Inventory component has been added to the game session.

- [x] As a player, I want to use items from my inventory so that I can interact with the game world.
  **Test Plan:**
  - Test using different types of items through the Use button
  - Verify that items are removed from inventory when used
  - Ensure that items can't be used if they're not in the inventory
  **Status:** Implemented. Item usage is now handled through dedicated Use buttons with proper state management.

- [ ] As a player, I want to see short descriptions of items in my inventory, so I can understand their purpose and any gameplay-relevant stats.
  **Test Plan:**
  - Verify that each item in the inventory has a short description
  - Verify that item effects are applied correctly
  - Ensure used items are removed from the inventory when appropriate
  **Status:** Not yet implemented.

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

- [ ] As a player, I want to have the option to end combat early if my opponent agrees, so that I can resolve conflicts peacefully when possible.
  **Test Plan:**
  - Implement a "Call Truce" button in the combat interface
  - Verify that using this option prompts the AI to consider ending the combat
  - Ensure that combat can end early if the AI agrees to the truce
  **Status:** Not yet implemented.


### Game State
- [x] As a player, I want to save my game progress so that I can continue my adventure later.
  **Test Plan:**
  - Verify that all relevant game state data is included in the save
  - Test saving at different points in the game
  - Ensure saved games are stored correctly and can be accessed later
  **Status:** Implemented. Automatic saving occurs 10 seconds after state changes, and manual saving is available.

- [x] As a player, I want to load a saved game so that I can resume my previous adventure.
  **Test Plan:**
  - Verify that loading a saved game restores all game state correctly
  - Test loading games from different points in the story
  - Ensure the game continues seamlessly from the loaded state
  **Status:** Implemented. Game state is loaded automatically when returning to the game session.


### Setting and Atmosphere
- [ ] As a player, I want to explore one frontier town and its immediate surroundings so that I can immerse myself in a focused Western setting.
  **Test Plan:**
  - Verify that all areas of the town and surroundings are accessible
  - Test interactions with various locations and objects in the environment
  - Ensure the setting is consistently portrayed throughout the game
  **Status:** Not yet implemented.

- [ ] As a player, I want to experience themes of survival, law vs. outlaw, and frontier justice so that I feel like I'm in an authentic Western story.
  **Test Plan:**
  - Verify that these themes are present in the main storyline and side quests
  - Test player choices that relate to these themes
  - Ensure the game's atmosphere consistently reflects these Western themes
  **Status:** Not yet implemented.

- [ ] As a player, I want to see a loading indicator when content is being generated or fetched, so that I understand the system is working and not frozen.
  **Test Plan:**
  - Verify that a loading indicator appears when generating a random character
  - Check that the loading indicator is visible when transitioning between steps
  - Ensure the loading indicator disappears once content is loaded
  **Status:** Not yet implemented.

- [ ] As a player, I want to start with 4-5 genre-appropriate, inexpensive (non-combat) items, so that I have a realistic and thematic starting inventory.
  **Test Plan:**
  - Verify that each new character starts with 4-5 items
  - Check that the items are appropriate for the Western genre
  - Ensure the items are non-combat and relatively inexpensive
  - Confirm that the items are displayed correctly in the character's inventory
  **Status:** Not yet implemented.


### UI/UX Improvements
- [ ] As a developer, I want to add identifying IDs/classes to page markup, including specific classes for Boot Hill rules tables and dice roll results.
  **Test Plan:**
  - Review all components and add appropriate IDs and classes
  - Verify that added IDs and classes are unique and descriptive
  - Test that added identifiers don't break existing styles or functionality
  - Ensure Boot Hill rules tables and dice roll results have clear identifying classes

- [ ] As a player, I want my character creation progress to be saved automatically after each step, so that I don't lose progress if I need to refresh or encounter an error.
  **Test Plan:**
  - Verify that progress is saved after each step completion
  - Test recovery of progress after page refresh
  - Ensure partial character data is properly stored and retrieved

- [ ] As a player, I want to see a loading indicator when content is being generated or fetched, so that I understand the system is working and not frozen.
  **Test Plan:**
  - Verify that a loading indicator appears when generating a random character
  - Check that the loading indicator is visible when transitioning between steps
  - Ensure the loading indicator disappears once content is loaded




### Technical Improvements
- [x] As a developer, I want to use a dispatch function for state updates so that I can manage game state more efficiently and consistently.
  **Test Plan:**
  - Verify that all state updates use the dispatch function
  - Check that different types of state updates (character, inventory, etc.) work correctly
  - Ensure that the state remains consistent across different components
  **Status:** Implemented. The game session now uses a dispatch function for state updates.

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


## Post-MVP Features

### Advanced Character Creation
- [ ] As a player, I want to choose from multiple character backgrounds so that I can create more diverse characters.
- [ ] As a player, I want to customize my character's appearance so that I can better visualize my persona.
- [ ] As a player, I want to select from an expanded list of skills (20+ skills) so that I can create more specialized characters.

### Enhanced Game Session
- [ ] As a player, I want to explore multiple towns and wilderness areas so that I can experience a more expansive Old West setting.
- [ ] As a player, I want to engage in branching narratives so that my choices have more significant impacts on the story.
- [ ] As a player, I want to experience dynamic world events so that the game world feels alive and changing.

### Expanded Combat System
- [ ] As a player, I want to use advanced combat tactics so that fights are more strategic and engaging.
- [ ] As a player, I want to engage in duels with specific NPCs so that I can experience iconic Western showdowns.
- [ ] As a player, I want to consider positioning and environmental factors in combat so that battles feel more realistic.
- [ ] As a player, I want to experience critical hits and misses in combat to add more excitement and unpredictability to fights.
- [ ] As a player, I want to use different weapons and items during combat to add more tactical depth to battles.

### NPC Interaction
- [ ] As a player, I want to form relationships with NPCs so that the game world feels more dynamic and responsive to my actions.
- [ ] As a player, I want to recruit NPC companions so that I can form a posse for adventures.
- [ ] As a player, I want NPCs to remember past interactions so that the world feels persistent and my actions have consequences.

### Economy and Progression
- [ ] As a player, I want to earn and manage in-game currency so that I can experience the economic aspects of the Old West.
- [ ] As a player, I want to improve my character's skills and attributes over time so that I can experience long-term character growth.
- [ ] As a player, I want to engage with a complex economic system with supply/demand dynamics so that the game world feels more realistic.

### Enhanced UI and Media
- [ ] As a player, I want to see thematic graphics and animations so that the game is more visually engaging.
- [ ] As a player, I want to use an interactive map for navigation and exploration so that I can better understand the game world.
- [ ] As a player, I want to hear ambient sounds and music so that I feel more immersed in the Western setting.

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

- [ ] As a player, I want combat results to be automatically added to my journal, so that I can keep track of significant battles and their outcomes.
  **Test Plan:**
  - Confirm that a summary of each combat is added to the journal upon completion
  - Verify that the combat entry includes relevant details (opponent, outcome, any significant events)
  - Check that the journal entry is formatted consistently with other entries
  **Status:** Not yet implemented.


## Completed Tasks
- [x] As a developer, I want to set up the Next.js project structure so that I have a solid foundation for the app.
- [x] As a developer, I want to implement basic state management using React Context so that I can manage game state effectively.
- [x] As a developer, I want to create a responsive layout for the main pages so that the app is usable on various devices.
- [x] As a player, I want to view the main menu of the game so that I can navigate to different sections of the app.
- [x] As a player, I want complete freedom of action without AI censorship or resistance, so that I can fully immerse myself in the game world and make any choices I desire.
- [x] As a developer, I want to implement a basic combat system to allow players to engage in turn-based fights with AI-generated opponents.
- [x] As a developer, I want to implement proper state management in the GameSession component to prevent unnecessary page reloads and improve user experience.
- [x] As a developer, I want to update the CombatSystem integration in the GameSession component to ensure smooth transitions between normal gameplay and combat scenarios.
- [x] As a developer, I want to implement proper journal narrative summaries for player actions.
- [x] As a developer, I want to implement proper state management in the GameSession component to prevent unnecessary page reloads and improve user experience.
- [x] As a developer, I want to ensure reliable game state initialization to provide a consistent starting experience for players.
- [x] As a player, I want my initial game state (narrative, inventory) to be properly set up when starting a new game.

## Bug Tracking

This section is for tracking bugs found during development and testing. Each bug entry should include a description, steps to reproduce, expected behavior, actual behavior, and current status.

### Open Bugs

[BUG-003] AI Pacing Issues
  - Description: AI advances the story too quickly, not adjusting for the current setting.
  - Steps to Reproduce: 
    1. Start a game session in different settings (e.g., busy saloon, desert travel).
    2. Observe AI responses to player actions.
  - Expected Behavior: Story progression should be slower in busy locations and faster in travel scenarios.
  - Actual Behavior: Story progresses at the same pace regardless of setting.
  - Status: Open
  - Priority: Medium

[BUG-004] Narrative Display UX Issue
  - Description: New AI messages are not automatically visible to the user.
  - Steps to Reproduce: 
    1. Engage in a conversation with the AI that generates multiple messages.
    2. Observe the scrollable area after each AI response.
  - Expected Behavior: View should automatically scroll to show the latest AI message at the top.
  - Actual Behavior: User must manually scroll to see new messages.
  - Status: Open
  - Priority: Medium

[BUG-005] Incomplete Game State Restoration
  - Description: Some elements of the game state are not properly restored when loading a saved game.
  - Steps to Reproduce: 
    1. Play a game session and make various character and world state changes.
    2. Save the game and exit.
    3. Load the saved game and check all game state elements.
  - Expected Behavior: All game state elements should be fully restored to their saved state.
  - Actual Behavior: Some state elements (e.g., NPC relationships, quest flags) are not correctly restored.
  - Status: Open
  - Priority: High

[BUG-021] Delayed Content Update and Incorrect Step Information on Character Summary
  - Description: When generating a random character, there's a delay in updating the UI, and outdated step information is briefly shown.
  - Steps to Reproduce: 
    1. Go to the Character Creation page
    2. Click "Generate Random Character"
    3. Observe the transition to the summary page
  - Expected Behavior: Immediate update of step information and character description, with a loading indicator if there's a delay.
  - Actual Behavior: 
    - "Step 1: name" text remains visible for a few seconds before changing to "Step 11: summary"
    - Character description takes several seconds to load without any loading indication
  - Status: Open
  - Priority: Medium

[BUG-022] Generate Random Character Button Malfunction on Summary Page
  - Description: The Generate Random Character button doesn't generate a new character when clicked on the summary page.
  - Steps to Reproduce: 
    1. Go to the Character Creation page
    2. Click "Generate Random Character"
    3. On the summary page, click "Generate Random Character" again
  - Expected Behavior: A new random character should be generated and displayed
  - Actual Behavior: Only the instruction text is reloaded, no new character is generated
  - Status: Open
  - Priority: Medium

[BUG-023] Duplicate Inventory Items in Game Session
  - Description: Inventory items are loading twice in the Game Session.
  - Steps to Reproduce: 
    1. Start a game session
    2. Observe the inventory section
  - Expected Behavior: Inventory items should load once and display correctly
  - Actual Behavior: Inventory items are displayed twice
  - Status: Open
  - Priority: Medium

[BUG-024] Duplicate AI Text Generation in Character Creation
  - Description: The AI text for "Step 1" is generated twice, with the second version replacing the first.
  - Steps to Reproduce: 
    1. Go to the Create Character page
    2. Observe the AI text generation for "Step 1"
  - Expected Behavior: AI text should be generated once and displayed
  - Actual Behavior: AI text is generated twice, with visible replacement
  - Status: Open
  - Priority: Medium

[BUG-025] Unnecessary Reload of AI Messages on Generate Button Click
  - Description: Clicking the "Generate" button reloads all AI messages on the character creation page, including the step description.
  - Steps to Reproduce: 
    1. Go to the Create Character page
    2. Click the "Generate" button for any field
  - Expected Behavior: Only the field value should be generated, leaving the step description unchanged
  - Actual Behavior: Both the field value and step description are regenerated
  - Impact: Wastes API calls and creates unnecessary visual changes
  - Status: Open
  - Priority: Medium

[BUG-026] Character Creation Progress Not Saved During Process
  - Description: Character creation progress is not saved incrementally, risking loss of progress if page is refreshed
  - Steps to Reproduce: 
    1. Begin character creation
    2. Complete several steps
    3. Encounter an error or refresh the page
  - Expected Behavior: Progress should be saved after each step completion
  - Actual Behavior: Progress is lost on page refresh
  - Status: Open
  - Priority: High

[BUG-027] Incorrect Location Display in Game Session
  - Description: The location display sometimes includes more information than just the location name.
  - Steps to Reproduce: 
    1. Start a new game session
    2. Observe the location display in the status area
  - Expected Behavior: Only the location name should be displayed (e.g., "Dusty Crossroads")
  - Actual Behavior: Additional narrative text is included in the location display
  - Status: Open
  - Priority: Medium

[BUG-028] Player Actions Not Visually Distinct in Narrative
  - Description: Player actions are not visually emphasized in the game narrative.
  - Steps to Reproduce: 
    1. Start a game session
    2. Perform several actions
    3. Review the narrative text
  - Expected Behavior: Player actions should be visually distinct from the rest of the narrative
  - Actual Behavior: Player actions blend in with the rest of the narrative text
  - Status: Open
  - Priority: Medium

[BUG-029] Game State Not Persisting Across Pages
  - Description: Character Sheet page shows "No character found" message despite having an active character in the game session.
  - Steps to Reproduce:
    1. Generate a character and start a game session
    2. Navigate to the Character Sheet page
  - Expected Behavior: Character Sheet should display the current character's information
  - Actual Behavior: Page shows "No character found" message
  - Root Cause: Likely issue with state persistence between pages
  - Status: Open
  - Priority: High

[BUG-030] Combat State Not Persisting After Page Navigation
  - Description: When leaving the Game Session page during combat and returning, the combat state is not maintained.
  - Steps to Reproduce:
    1. Start a game session and enter combat
    2. Navigate to the homepage
    3. Return to the Game Session page
  - Expected Behavior: Combat should resume from where it left off
  - Actual Behavior: Combat state is lost, and the game resumes as if combat never occurred
  - Status: Open
  - Priority: Medium


### Closed Bugs

[BUG-09] API Error: Insufficient Resources
  - Description: API calls to the Gemini model are failing due to insufficient resources.
  - Resolution: Updated API key and adjusted rate limiting to prevent resource exhaustion.
  - Closed Date: 2024-10-08

[BUG-010] Infinite Rendering Loop in Combat System
  - Description: The CombatSystem component is causing an infinite loop of updates.
  - Resolution: Fixed dependency array in useEffect hook to prevent unnecessary re-renders.
  - Closed Date: 2024-10-09

[BUG-012] Page Reload on Action Submission in Game Session
  - Description: Submitting an action in the text field causes the page to reload before showing the response.
  - Resolution: Updated GameSession component to handle form submission asynchronously and prevent default form behavior. Implemented proper state management to update the UI without page reload.
  - Closed Date: 2024-10-09

[BUG-015] Combat System State Update Error
   - Description: After entering combat and attacking more than once, a React state update error occurred.
   - Resolution: Separated state updates from callback functions in the CombatSystem component to prevent updating state during render cycle.
   - Closed Date: 2024-10-09

[BUG-008] Incorrect Location Display in Game Session
  - Description: The location in the status area shows as "Unknown" despite being named in the AI's first message.
  - Steps to Reproduce: 
    1. Create a character
    2. Click "Finish Character Creation"
    3. Observe the Game Session screen
  - Expected Behavior: The location in the status area should match the location named in the AI's first message
  - Actual Behavior: Location is displayed as "Unknown"
  - Resolution: Updated the GameSession component to explicitly request a location from the AI and set a default "Unknown Location" if not provided. Modified the Character Status section to display the correct location.
  - Closed Date: 2024-10-10

[BUG-002] Game Session State Reset
- Description: Game state resets when navigating away from and back to the Game Session page.
- Steps to Reproduce:
  1. Start a game session and interact with the AI.
  2. Navigate away from the Game Session page.
  3. Return to the Game Session page.
- Expected Behavior: Game session should continue from where it left off.
- Actual Behavior: Game session resets to the initial message.
- Status: Closed
- Resolution: Implemented robust game state persistence using localStorage and added fallback mechanism for character data.
- Closed Date: 2024-10-18
