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

### Journal and Campaign Persistence

- [ ] As a player, I want to view my journal entries during a game session, so that I can keep track of important story events.
  **Test Plan:**
  - Implement a basic UI for viewing journal entries
  - Verify that journal entries are displayed in chronological order
  - Ensure that the journal UI is accessible during gameplay without disrupting the game flow
  **Status:** Not yet implemented.

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

### Inventory and Economy
- [x] As a player, I want to view my character's inventory so that I know what items I have available.
  **Test Plan:**
  - Verify that all items in the inventory are displayed correctly
  - Test adding and removing items from the inventory
  - Ensure the inventory display updates in real-time
  **Status:** Implemented. Inventory component has been added to the game session.

- [ ] As a player, I want to use items from my inventory so that I can interact with the game world.
  **Test Plan:**
  - Test using different types of items (consumables, equipment, etc.)
  - Verify that item effects are applied correctly
  - Ensure used items are removed from the inventory when appropriate
  **Status:** Not yet implemented.

- [ ] As a player, I want to buy and sell basic goods so that I can experience a simple economy system.
  **Test Plan:**
  - Verify that buying items deducts the correct amount of money
  - Test selling items adds the correct amount of money
  - Ensure inventory and money totals update correctly after transactions
  **Status:** Not yet implemented.

### Game State
- [ ] As a player, I want to save my game progress so that I can continue my adventure later.
  **Test Plan:**
  - Verify that all relevant game state data is included in the save
  - Test saving at different points in the game
  - Ensure saved games are stored correctly and can be accessed later
  **Status:** Not yet implemented.

- [ ] As a player, I want to load a saved game so that I can resume my previous adventure.
  **Test Plan:**
  - Verify that loading a saved game restores all game state correctly
  - Test loading games from different points in the story
  - Ensure the game continues seamlessly from the loaded state
  **Status:** Not yet implemented.

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

- [x] As a developer, I want to use a dispatch function for state updates so that I can manage game state more efficiently and consistently.
  **Test Plan:**
  - Verify that all state updates use the dispatch function
  - Check that different types of state updates (character, inventory, etc.) work correctly
  - Ensure that the state remains consistent across different components
  **Status:** Implemented. The game session now uses a dispatch function for state updates.

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

## Completed Tasks
- [x] As a developer, I want to set up the Next.js project structure so that I have a solid foundation for the app.
- [x] As a developer, I want to implement basic state management using React Context so that I can manage game state effectively.
- [x] As a developer, I want to create a responsive layout for the main pages so that the app is usable on various devices.
- [x] As a player, I want to view the main menu of the game so that I can navigate to different sections of the app.
- [x] As a player, I want complete freedom of action without AI censorship or resistance, so that I can fully immerse myself in the game world and make any choices I desire.
- [x] As a developer, I want to implement a basic combat system to allow players to engage in turn-based fights with AI-generated opponents.

## Bug Tracking

This section is for tracking bugs found during development and testing. Each bug entry should include a description, steps to reproduce, expected behavior, actual behavior, and current status.

### Open Bugs

[BUG-002] Game Session State Reset
   - Description: Game state resets when navigating away from and back to the Game Session page.
   - Steps to Reproduce: 
     1. Start a game session and interact with the AI.
     2. Navigate away from the Game Session page.
     3. Return to the Game Session page.
   - Expected Behavior: Game session should continue from where it left off.
   - Actual Behavior: Game session resets to the initial message.
   - Status: Open
   - Priority: High

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

[BUG-006] Delayed Content Update and Incorrect Step Information on Character Summary
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
   - Priority: Medium (impacts user experience but doesn't prevent core functionality)

[BUG-007] Generate Random Character Button Malfunction on Summary Page
   - Description: The Generate Random Character button doesn't generate a new character when clicked on the summary page.
   - Steps to Reproduce: 
     1. Go to the Character Creation page
     2. Click "Generate Random Character"
     3. On the summary page, click "Generate Random Character" again
   - Expected Behavior: A new random character should be generated and displayed
   - Actual Behavior: Only the instruction text is reloaded, no new character is generated
   - Status: Open
   - Priority: Medium

[BUG-008] Incorrect Location Display in Game Session
   - Description: The location in the status area shows as "Unknown" despite being named in the AI's first message.
   - Steps to Reproduce: 
     1. Create a character
     2. Click "Finish Character Creation"
     3. Observe the Game Session screen
   - Expected Behavior: The location in the status area should match the location named in the AI's first message
   - Actual Behavior: Location is displayed as "Unknown"
   - Status: Open
   - Priority: Medium

[BUG-011] Duplicate Inventory Items in Game Session
  - Description: Inventory items are loading twice in the Game Session.
  - Steps to Reproduce: 
    1. Start a game session
    2. Observe the inventory section
  - Expected Behavior: Inventory items should load once and display correctly
  - Actual Behavior: Inventory items are displayed twice
  - Status: Open
  - Priority: Medium


[BUG-012] Page Reload on Action Submission in Game Session
  - Description: Submitting an action in the text field causes the page to reload before showing the response.
  - Steps to Reproduce: 
    1. Start a game session
    2. Enter an action in the text field and submit
  - Expected Behavior: The action should be processed without a full page reload
  - Actual Behavior: The page reloads ("Loading Game Session" appears) before showing the response
  - Status: Open
  - Priority: High (impacts user experience significantly)

[BUG-013] Duplicate AI Text Generation in Character Creation
  - Description: The AI text for "Step 1" is generated twice, with the second version replacing the first.
  - Steps to Reproduce: 
    1. Go to the Create Character page
    2. Observe the AI text generation for "Step 1"
  - Expected Behavior: AI text should be generated once and displayed
  - Actual Behavior: AI text is generated twice, with visible replacement
  - Status: Open
  - Priority: Medium

[BUG-014] Unnecessary Reload of AI Messages on Generate Button Click
  - Description: Clicking the "Generate" button reloads all AI messages on the character creation page.
  - Steps to Reproduce: 
    1. Go to the Create Character page
    2. Click the "Generate" button for any field
  - Expected Behavior: Only the relevant field should be updated
  - Actual Behavior: All AI messages on the page are reloaded
  - Status: Open
  - Priority: Medium

### Closed Bugs

[BUG-000] Example Resolved Bug
   - Description: Brief description of the resolved bug
   - Resolution: How the bug was fixed
   - Closed Date: YYYY-MM-DD

[BUG-09] API Error: Insufficient Resources
- Description: API calls to the Gemini model are failing due to insufficient resources.
- Steps to Reproduce: 
  1. Interact with the AI in the Game Session
  2. Observe console errors
- Expected Behavior: API calls should succeed and return content
- Actual Behavior: POST request fails with ERR_INSUFFICIENT_RESOURCES
- Status: Open
- Priority: Critical (prevents core functionality)

[BUG-010] Infinite Rendering Loop in Combat System
    - Description: The CombatSystem component is causing an infinite loop of updates.
    - Steps to Reproduce: 
      1. Enter a combat scenario in the Game Session
      2. Observe console warnings and application behavior
    - Expected Behavior: Combat system should render and update normally
    - Actual Behavior: Maximum update depth is exceeded, causing continuous re-renders
    - Status: Open
    - Priority: Critical (causes application instability and poor performance)
