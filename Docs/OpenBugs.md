# BootHillGM opem Bugs

This document tracks bugs found during development and testing. Each bug entry should include a description, steps to reproduce, expected behavior, actual behavior, and current status.

[BUG-003] AI Pacing Issues
  - Description: AI advances the story too quickly, not adjusting for the current setting.
  - Steps to Reproduce: 
    1. Start a game session in different settings (e.g., busy saloon, desert travel).
    2. Observe AI responses to player actions.
  - Expected Behavior: Story progression should be slower in busy locations and faster in travel scenarios.
  - Actual Behavior: Story progresses at the same pace regardless of setting.
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
