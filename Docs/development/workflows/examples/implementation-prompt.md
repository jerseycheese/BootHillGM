---
title: Implementation Prompt
aliases: [Implementation Phase]
tags: [implementation, development, workflow, prompt]
created: 2025-01-13
updated: 2025-01-13
---

# Implementation Prompt

```markdown
Help me implement this technical specification:

[PASTE IMPLEMENTATION PLAN HERE]

Please follow these requirements:
1. Test-driven development
2. Incremental implementation
3. Clean code principles
4. Error handling
5. Edge cases

Use this format:

IMPLEMENTATION PROGRESS
Component: [name]
Current Step: [step number/name]

CURRENT IMPLEMENTATION
File: [current file]
Status: [In Progress/Complete]

CODE CHANGES
```[language]
[Actual code changes]
```

VERIFICATION
- [ ] Unit tests
- [ ] Integration tests
- [ ] Code standards
- [ ] Error handling
```

## Implementation Handoff
When completing this phase, provide a summary in this format:

```markdown
IMPLEMENTATION COMPLETE
Component: [name]
Issue: #[number]

CHANGES MADE
Files Modified:
- [file]: [changes]
- [file]: [changes]

Files Created:
- [file]: [purpose]
- [file]: [purpose]

TEST STATUS
- Unit Tests: [status]
- Integration: [status]
- Coverage: [percentage]

MANUAL TESTING STEPS
- [manual testing step]
- [manual testing step]

CLEANUP NOTES
- [cleanup task]
- [cleanup task]
```