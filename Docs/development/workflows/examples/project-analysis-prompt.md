# Project Analysis (Sonnet)

> [!note]
> Select and analyze next highest-value task.

## Initial Prompt Template
```markdown
Help me select and analyze the next task to implement.

Review these paths:
- /Users/jackhaas/Projects/BootHillGM/Docs/planning/
- /Users/jackhaas/Projects/BootHillGM/Docs/issues/
- /Users/jackhaas/Projects/BootHillGM/Docs/features/

Selection criteria:
1. MVP status
2. Blocking status - does it block other critical features?
3. Dependencies - are its dependencies complete?
4. Technical complexity
5. Value/effort ratio

Provide:
1. Selected task with rationale
2. Clear implementation handoff using standard template
```

## Example Conversation
Human: [Sends prompt above]

Claude: Analyzing project state and priorities...

Task Selection Analysis:
1. MVP Requirements: Inventory validation needed
2. Blockers: Blocking combat improvements
3. Dependencies: None pending
4. Complexity: Low
5. Value/Effort: High - quick win with big impact

```markdown
TASK ANALYSIS
Story/Issue: INV-2 Inventory Validation
Description: Prevent usage of non-existent items in inventory
Priority: High (blocks combat system improvements)
MVP Status: Required
Current State: Basic inventory exists but lacks validation

IMPLEMENTATION PLAN
Files to Modify:
- src/components/Inventory.tsx: Add validation checks
- src/hooks/useInventory.ts: Add validation methods
Files to Create:
- src/utils/inventoryUtils.ts: Validation helper functions

SUCCESS CRITERIA
- [ ] Attempting to use missing item throws error
- [ ] Error messages clearly indicate the issue
- [ ] Edge cases (null/undefined) handled gracefully

TECHNICAL NOTES
- Use TypeScript strict null checks
- Add error messages to constants file
- Consider adding validation HOC for reuse
```