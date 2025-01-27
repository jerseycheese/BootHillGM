---
title: Implementation Planning Prompt
aliases: [Planning Phase]
tags: [planning, implementation, workflow, prompt]
created: 2025-01-13
updated: 2025-01-13
---

# Implementation Planning Prompt

```markdown
Help me create a technical specification for implementing this task. Here's the task analysis:

[PASTE TASK ANALYSIS HERE]

Please provide specification in this format:

IMPLEMENTATION SPECIFICATION
Component: [name]
Issue: [reference]

TECHNICAL DESIGN
Data Flow:
- [Data flow point 1]
- [Data flow point 2]

Core Changes:
1. [Change Area 1]
   - Location: [file]
   - Details: [specifics]
   
2. [Change Area 2]
   - Location: [file]
   - Details: [specifics]

INTERFACES
[Interface definitions]

TEST PLAN
1. Unit Tests:
   - [test scenario]
   - [test scenario]
2. Integration Tests:
   - [test scenario]
   - [test scenario]

MIGRATION PLAN
1. [Step 1]
2. [Step 2]
```

## Implementation Planning Handoff
When completing this phase, provide a summary in this format:

```markdown
IMPLEMENTATION PLAN COMPLETE
Component: [name]
Issue: #[number]

KEY CHANGES
1. [Major change 1]
2. [Major change 2]

CRITICAL FILES
- [file]: [purpose]
- [file]: [purpose]

TESTING REQUIREMENTS
- [key test requirement]
- [key test requirement]

HANDOFF NOTES
- [important note]
- [important note]
```