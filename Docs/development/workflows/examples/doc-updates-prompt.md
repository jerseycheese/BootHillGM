# Documentation Updates (Haiku)

> [!note]
> Update planning docs after implementation.

## Initial Prompt Template
```markdown
aawadw
```

## Example Conversation
Human: [Sends prompt with implementation handoff]

Claude: Updating documentation...

Updated /docs/planning/roadmap.md:
```markdown
## Phase 3: Game Mechanics
3.4 Inventory System
- [x] Add item validation system
```

Updated /docs/features/inventory.md with validation details.

Commit message:
```
feat(inventory): Add item validation system

- Add validation utils and helpers
- Update inventory hook with checks
- Add test coverage
- Prevent invalid item usage

Story: INV-2
```