# BootHillGM Closed Bugs

This document tracks resolved bugs in the BootHillGM project. For active bugs, see UserStories.md.

## Closed Bugs

[BUG-004] Narrative Display UX Issue
- Description: New AI messages are not automatically visible to the user
- Steps to Reproduce: 
  1. Engage in a conversation with the AI that generates multiple messages
  2. Observe the scrollable area after each AI response
- Expected Behavior: View should automatically scroll to show the latest AI message at the top
- Actual Behavior: User must manually scroll to see new messages
- Status: Fixed
- Resolution: Implemented smart auto-scrolling with manual override and visual message distinction
- Closed Date: 2024-10-27

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
- Closed Date: 2024-10-24

[BUG-031] Combat Log Text Metadata
- Description: Combat log displayed raw metadata and suggested actions in the text output
- Steps to Reproduce:
  1. Enter combat with an NPC
  2. Perform combat actions
  3. Observe combat log entries
- Expected Behavior: Combat log should show clean narrative text without metadata
- Actual Behavior: SUGGESTED_ACTIONS JSON and other metadata appeared in combat messages
- Status: Fixed
- Resolution: Implemented enhanced text cleaning in combatUtils.ts to remove all metadata markers
- Closed Date: 2024-10-31

[BUG-005] Incomplete Game State Restoration
- Description: Some elements of the game state are not properly restored when loading a saved game.
- Steps to Reproduce: 
  1. Play a game session and make various character and world state changes.
  2. Save the game and exit.
  3. Load the saved game and check all game state elements.
- Expected Behavior: All game state elements should be fully restored to their saved state.
- Actual Behavior: Some state elements (e.g., NPC relationships, quest flags) are not correctly restored.
- Status: Fixed
- Priority: High
- Closed Date: 2024-11-02

[BUG-021] Delayed Content Update and Incorrect Step Information on Character Summary
  - Description: When generating a random character, there's a delay in updating the UI, and outdated step information is briefly shown.
  - Resolution: 
    - Implemented granular loading states for different operations
    - Added proper async/await handling for step transitions
    - Removed unnecessary loading state from step changes
    - Improved loading indicator visibility
  - Fixed in commit: [commit-hash] "fix: eliminate loading indicator flash in character creation"
  - Date Closed: 2024-11-03

[BUG-034] Post-Combat Narrative Cleanup
- Description: Narrative updates after combat ends contain confusing or redundant information
- Resolution: Implemented cleaner combat end messages with formatCombatEndMessage function and improved state management
- Closed Date: 2024-11-22

[BUG-028] Player Actions Not Visually Distinct in Narrative
- Description: Player actions are not visually emphasized in the game narrative.
- Steps to Reproduce: 
  1. Start a game session
  2. Perform several actions
  3. Review the narrative text
- Expected Behavior: Player actions should be visually distinct from the rest of the narrative
- Actual Behavior: Player actions blend in with the rest of the narrative text
- Status: Fixed
- Resolution: Implemented distinct styling for player actions in NarrativeDisplay.tsx and added visual emphasis
- Closed Date: 2024-11-25

[BUG-032] Combat System UI Polish
- Description: Combat system UI needed improvements for better user experience
- Steps to Reproduce:
  1. Enter combat with an opponent
  2. Observe health bars and wound displays
  3. Take damage and observe feedback
- Expected Behavior: Clear visual feedback for health changes and combat status
- Actual Behavior: Basic display without enhanced visual feedback
- Status: Fixed
- Resolution: Implemented new StrengthDisplay component with progress bars, color-coded wound severity, and improved accessibility
- Closed Date: 2024-11-27

[BUG-033] Narrative Metadata Cleanup
- Description: Metadata markers appearing in narrative text and combat logs
- Steps to Reproduce:
  1. Engage in combat or narrative interactions
  2. Check output text for metadata markers
- Expected Behavior: Clean text without any metadata markers
- Actual Behavior: Metadata markers visible in output
- Status: Fixed
- Resolution: Enhanced text cleaning implementation and improved metadata handling in narrative processing
- Closed Date: 2024-11-27