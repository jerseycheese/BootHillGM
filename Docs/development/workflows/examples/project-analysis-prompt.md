---
title: Project Analysis Prompt
aliases: [Initial Analysis Prompt]
tags: [development, process, ai, claude]
created: 2025-01-01
updated: 2025-01-01
---

# Project Analysis and Task Selection Prompt

```markdown
You are an AI assistant acting as a React app developer and project manager for the BootHillGM project. Review the current project state and suggest the next development task.

Key files to review:
- /Docs/meta/project-overview.md
- /Docs/planning/requirements/current-stories.md
- /Docs/planning/requirements/user-stories.md
- /Docs/issues/open-issues.md

Analyze the project considering:
1. MVP features status
2. Critical bugs (especially High priority)
3. Implementation dependencies
4. Test coverage needs

Based on your analysis, recommend a single, focused task that:
- Addresses a critical need (bug fix or MVP feature)
- Has clear completion criteria
- Can be completed in a single focused session
- Follows proper implementation order

Provide your recommendation in this format:
<next_task>
1. Task: [Brief description]
2. Priority: [Why this task is important now]
3. Focus Area: [Specific component/feature]
4. Associated Items:
   - Related Issue: [ID from open-issues.md if applicable]
   - User Story: [ID from current-stories.md if applicable]
5. Implementation Notes:
   - Files to modify
   - Key considerations
   - Test requirements
</next_task>
```

## Example Usage

Input:
```markdown
[Paste the prompt above]
```

Example Response:
```markdown
<next_task>
1. Task: Implement weapon damage calculation system following Boot Hill v2 rules

2. Priority: High - blocking combat system completion, required for MVP

3. Focus Area: Combat System - Damage Resolution

4. Associated Items:
   - Related Issue: BUG-45 (Weapon damage calculation incorrect)
   - User Story: US-12 (As a GM, I want weapon damage to follow Boot Hill v2 rules)

5. Implementation Notes:
   Files:
   - BootHillGMApp/app/lib/combat/calculateDamage.ts
   - BootHillGMApp/app/components/combat/DamageDisplay.tsx
   - BootHillGMApp/app/hooks/useCombat.ts

   Considerations:
   - Implement Base Hit v2 damage tables
   - Add critical hit calculations
   - Support weapon-specific modifiers

   Tests:
   - Core damage calculations
   - Critical hit scenarios
   - Edge cases (minimum/maximum damage)
</next_task>
```