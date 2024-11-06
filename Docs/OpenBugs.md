# BootHillGM Open Bugs

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

[BUG-032] Combat System UI Polish Needed
  - Description: While the combat system has been refactored for better maintainability, some UI improvements could enhance user experience
  - Areas for Improvement:
    - Animations for health changes
    - More prominent turn indicators
    - Enhanced visual feedback for critical hits
  - Status: Open
  - Priority: Low

[BUG-033] Clean Up Narrative Metadata
- Description: Metadata markers still appear in some narrative text and combat logs
- Priority: Medium
- Impact: User Experience
- Status: Open

[BUG-034] Post-Combat Narrative Cleanup
- Description: Narrative updates after combat ends contain confusing or redundant information
- Priority: Medium
- Impact: User Experience
- Status: Open

[BUG-035] Remove Manual Save Game Button
- Description: Manual save functionality is redundant with automatic state saving
- Priority: Low
- Impact: User Interface Cleanup
- Status: Open
