# Implementation & Testing (Sonnet)

> [!note]
> Implement task and verify functionality.

## Initial Prompt Template
```markdown
Help me implement and test this task. Here's the analysis handoff:

[PASTE HANDOFF]

Project paths:
- /Users/jackhaas/Projects/BootHillGM/src/
- /Users/jackhaas/Projects/BootHillGM/src/tests/

Please:
1. Implement required changes
2. Add essential tests
3. Verify build/tests
4. Create review handoff using standard template
```

## Example Conversation
Human: [Sends prompt with handoff about inventory validation]

Claude: Implementing inventory validation...

[Implementation code...]

Running verification:
```bash
npm run build  # Pass
npm test      # Pass
```

```markdown
IMPLEMENTATION COMPLETE
Task: Add inventory item validation system
Story/Issue: INV-2 Inventory Validation
Build Status: Pass
Test Status: Pass

CHANGES MADE
Files Modified:
- src/components/Inventory.tsx: Added validation checks
- src/hooks/useInventory.ts: Added validation methods
Files Created:
- src/utils/inventoryUtils.ts: Added validation helpers

DOCUMENTATION UPDATES
Files to Update:
- /docs/planning/roadmap.md: Mark inventory validation complete
- /docs/features/inventory.md: Document validation system
Items to Mark Complete:
- Inventory system validation
- Item usage restrictions
Future Improvements:
- Add validation HOC
- Enhance error message system
```