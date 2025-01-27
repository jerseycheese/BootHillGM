---
title: Project Analysis Prompt
aliases: [Analysis Phase]
tags: [analysis, planning, workflow, prompt]
created: 2025-01-13
updated: 2025-01-13
---

# Project Analysis Prompt

```markdown
Help me select and analyze the next task to implement from my GitHub issues.

Please review these planning documents for context:
- /Docs/planning/roadmap.md
- /Docs/architecture/technical-specification.md
- /Docs/core-systems/_index.md

Consider:
1. Priority (using high-priority label)
2. Blocking status
3. Dependencies
4. Technical complexity
5. Value/effort ratio

Please provide analysis in this format:

TASK ANALYSIS
GitHub Issue: #[number] [title]
Labels: [labels]
Description: [1-2 sentences]
Priority: [High/Medium/Low] ([reasoning])
Current State: [1-2 sentences]

IMPLEMENTATION STEPS
1. [ ] [First step]
2. [ ] [Second step]
...

NEXT IMPLEMENTATION TASK
Description: [Clear description]
Files to Modify:
- [path]: [changes]
Files to Create:
- [path]: [purpose]

SUCCESS CRITERIA
- [ ] [criterion]
- [ ] [criterion]

TECHNICAL NOTES
- [technical detail]
- [technical detail]

FUTURE TASKS
- [ ] [future task]
- [ ] [future task]
```

## Analysis Handoff
When completing this phase, provide a summary in this format:

```markdown
ANALYSIS COMPLETE
Issue: #[number]
Priority: [High/Medium/Low]

KEY POINTS
1. [Major point 1]
2. [Major point 2]

NEXT STEPS
- [immediate next step]
- [following step]

CONSIDERATIONS
- [important consideration]
- [important consideration]
```