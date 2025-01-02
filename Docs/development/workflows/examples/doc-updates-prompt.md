---
title: Documentation Updates Prompt
aliases: [End-of-Session Documentation]
tags: [development, process, ai, claude, documentation]
created: 2025-01-01
updated: 2025-01-01
---

# Documentation Updates Prompt

```markdown
Now that we've completed this implementation session, let's update the documentation:

1. Create Session Log
<session_log>
Path: /Docs/mcp-brain/session-logs/[YYYY-MM-DD]-[focus-area].md

Content:
# Claude Session Log - [Current Date]

## Session Focus
- Primary implementation goal
- Key components worked on

## Key Decisions
- Important technical decisions made
- Implementation approach chosen
- Rationale for choices

## Implementation Progress
- Components/features completed
- Code structure and patterns used
- Technical challenges solved
- Example code snippets if relevant

## Action Items
- [ ] Immediate follow-up tasks
- [ ] Future considerations
- [ ] Required testing

## Knowledge Base Updates
- New patterns or approaches documented
- Changes to existing documentation needed
- Cross-references to add

## Notes for Next Session
- Areas needing further work
- Questions to address
- Related features to consider

## Technical Considerations
- State management details
- Error handling approach
- Testing requirements
</session_log>

2. Documentation Review
<doc_updates>
Status Updates:
1. Issue Tracking:
   - Check /Docs/issues/open-issues.md
   - Move resolved issues to /Docs/issues/closed-issues.md
   - Update any related issue statuses

2. User Stories:
   - Check /Docs/planning/requirements/current-stories.md
   - Move completed stories to /Docs/planning/requirements/completed-user-stories.md

3. Technical Documentation:
   - Component documentation
   - Implementation guides
   - API documentation

4. Planning Documents:
   - Project status
   - Sprint planning
   - Feature roadmap

Changes needed:
[List specific documents and proposed updates]
</doc_updates>

3. Commit Message
<commit_message>
[type(scope)]: [concise change description]

[Detailed description if needed]
- Key changes
- Breaking changes (if any)
- Migration notes (if needed)

[Issue/story references]
</commit_message>
```

## Example Usage

After implementing a combat feature:

Input:
```markdown
[Having just finished implementation, paste the prompt above]
```

Example Response:
```markdown
1. Session Log
<session_log>
Path: /Docs/mcp-brain/session-logs/2025-01-01-combat-damage-system.md

[Session log content following template above]
</session_log>

2. Documentation Review
<doc_updates>
Status Updates:

1. Issue Tracking:
   Move from open-issues.md to closed-issues.md:
   - BUG-45: Weapon damage calculation incorrect
   - IMPL-32: Missing critical hit system

2. User Stories:
   Move from current-stories.md to completed-user-stories.md:
   - "As a GM, I want weapon damage to follow Boot Hill v2 rules"
   - "As a player, I want critical hits to be clearly indicated"

3. Technical Documentation:
   Update /Docs/technical/combat-system.md:
   - Add damage calculation documentation
   - Document critical hit mechanics
   - Update combat flow diagrams

4. Planning Documents:
   Update /Docs/meta/project-status.md:
   - Mark combat damage system as complete
   - Update progress on combat system epic
</doc_updates>

3. Commit Message
<commit_message>
feat(combat): implement Boot Hill v2 damage calculation system

Add comprehensive damage calculation including:
- Base weapon damage processing
- Critical hit multipliers
- Hit location effects
- Full unit test coverage

Breaking: None
Migration: None required

Closes #45, #32
Completes US-12, US-13
</commit_message>
```