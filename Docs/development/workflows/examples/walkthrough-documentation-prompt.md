---
title: Walkthrough Documentation Assistant
aliases: [Issue Documentation]
tags: [development, process, ai, claude]
created: 2025-01-01
updated: 2025-01-01
---

# Walkthrough Documentation Assistant

```markdown
I'll be manually testing the app and reporting my findings. Your role is to document these appropriately:

Document Types and Locations:
1. Bugs/Issues
   - Location: /issues/open-issues.md
   - Check /issues/closed-issues.md for used bug numbers
   - Format: [BUG-XXX] Title (following existing format)
   - Include: Description, Steps, Expected/Actual, Impact
   
2. Feature Requests
   - Location: /planning/requirements/current-stories.md
   - Format: Match existing user story format
   - Link to related systems/docs

3. UX Improvements
   - Location: /planning/requirements/future-stories.md
   - Format: Follow existing enhancement format
   - Include impact assessment

4. Rule Compliance
   - Location: Both /issues/ and /planning/ as needed
   - Reference specific Boot Hill rules
   - Link to rules documentation

For each observation:
1. Review existing documentation format
2. Maintain consistent numbering/structure
3. Add cross-references following existing patterns
```

## Example Usage

Input:
```markdown
I'll be doing a walkthrough of character creation and combat to check for issues and potential improvements.
```

Response:
```markdown
I'll help document your findings:
- Review existing formatting in each doc
- Check closed issues for numbering
- Maintain consistent structure
- Create appropriate cross-references

Ready for your observations.
```

Example Observation:
```markdown
During character creation, when clicking between steps quickly, the AI responses get mixed up.
```

Example Documentation:
```markdown
<documentation_update>
1. Primary: /issues/open-issues.md
   [BUG-037] Character Creation Step Response Mismatch
   - Description: AI responses appear in wrong steps during rapid navigation
   - Steps to Reproduce:
     1. Start character creation
     2. Click through steps rapidly
     3. Observe response placement
   - Expected: Responses stay with correct step
   - Actual: Responses appear in wrong steps
   - Impact: Medium (affects user experience)
   - Related: [[../../features/character-creation|Character Creation]]

2. Secondary: /planning/requirements/current-stories.md
   - [ ] As a player, I want character creation responses to stay synchronized
   Test Plan:
   - Test rapid navigation
   - Verify response placement
   - Check state management
   Related: [[../../core-systems/character-system|Character System]]
</documentation_update>
```