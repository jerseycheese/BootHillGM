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

Please review (with MCP):
1. Open issues at https://github.com/jerseycheese/BootHillGM/issues
2. Project documentation in /Docs, such as:
    - /Docs/planning/roadmap.md
    - /Docs/architecture/technical-specification.md
    - /Docs/core-systems/_index.md

Based on these sources, help identify:
- Highest priority open issues
- Dependencies between issues
- Implementation complexity
- Value to effort assessment
- Alignment with roadmap goals

Please analyze the selected task using the format below.

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