---
title: Claude App Workflow Handoffs
aliases: [Chat Transition Templates, Handoff Templates]
tags: [development, workflow, claude, process, transitions, handoffs]
created: 2025-03-16
updated: 2025-03-16
---

# Claude App Workflow Handoffs

> [!note]
> Template messages for transitioning between chats when hitting Claude app length limits.

## Purpose
These templates help maintain continuity when you need to start a new chat due to reaching Claude's context limits. They ensure that critical information is transferred efficiently between chats.

## When to Use Handoffs

- When you see the warning: "Long chats cause you to reach your usage limits faster"
- When you notice Claude's responses becoming shorter or less helpful
- Proactively before reaching limits if you're in the middle of a complex task
- When transitioning between major workflow phases

## 1. Analysis to Implementation Handoff

### Request in Current Chat
```
We're approaching the chat length limit. Could you create a summary artifact of our task analysis and technical spec that I can use to continue implementation in a fresh chat?
```

### Expected Artifact Content
```markdown
# Task Analysis Summary

## Task Overview
[Brief description of task]
Issue: #[number] if applicable
Priority: [High/Medium/Low]

## Technical Specification
Key Components:
- [Component 1]: [Purpose]
- [Component 2]: [Purpose]

Files to Modify:
- [Path 1]: [Changes needed]
- [Path 2]: [Changes needed]

Implementation Steps:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Data Flow:
[Brief description of data flow]

## Context Notes
- [Any special consideration 1]
- [Any special consideration 2]
```

### Starting the New Chat
```
I'm continuing work on a BootHillGM task from a previous chat. Here's the technical specification we developed:

[Paste the summary artifact]

Let's now proceed with implementation. Please help me write the code for this feature, starting with [specific component or step].
```

## 2. Implementation to Test Fixes Handoff

### Request in Current Chat
```
We're approaching the chat length limit. Could you create a summary artifact of our implementation progress and remaining test issues that I can use to continue in a fresh chat?
```

### Expected Artifact Content
```markdown
# Implementation Summary

## Feature Overview
[Brief description of implemented feature]

## Components Implemented
- [Component 1]: [Status - Complete/Partial]
- [Component 2]: [Status - Complete/Partial]

## Current Test Status
Passing Tests:
- [Test 1]
- [Test 2]

Failing Tests:
- [Test 3]: [Issue description]
- [Test 4]: [Issue description]

## Next Steps
1. Fix test [Test 3] by addressing [specific issue]
2. Complete implementation of [remaining component]
3. Add test coverage for [edge case]

## Implementation Notes
- [Important note about implementation approach]
- [Any technical decisions made]
```

### Starting the New Chat
```
I'm continuing work on test fixes for a BootHillGM feature from a previous chat. Here's our implementation summary:

[Paste the summary artifact]

Let's focus on fixing the failing tests, starting with [specific test].
```

## 3. Test Fixes to Build Issues Handoff

### Request in Current Chat
```
We're approaching the chat length limit. Could you create a summary artifact of our test fixes and current build issues that I can use to continue in a fresh chat?
```

### Expected Artifact Content
```markdown
# Test & Build Status Summary

## Feature Overview
[Brief description of implemented feature]

## Test Status
- All unit tests: [Passing/Some failing]
- Integration tests: [Passing/Some failing]
- Remaining test issues: [List any]

## Current Build Issues
Error 1:
```
[Error message]
```
Location: [File path]
Probable cause: [Brief analysis]

Error 2:
```
[Error message]
```
Location: [File path]
Probable cause: [Brief analysis]

## Next Steps
1. Address build error in [specific file]
2. Fix remaining test issue with [specific test]
3. Verify build completes successfully
```

### Starting the New Chat
```
I'm continuing work on build issues for a BootHillGM feature from a previous chat. Here's our current status:

[Paste the summary artifact]

Let's focus on resolving these build errors, starting with the issue in [specific file].
```

## 4. Build Issues to Cleanup & Documentation Handoff

### Request in Current Chat
```
We're approaching the chat length limit. Could you create a summary artifact of our implementation and build fixes to use for cleanup and documentation in a fresh chat?
```

### Expected Artifact Content
```markdown
# Implementation Complete Summary

## Feature Overview
[Brief description of implemented feature]

## Components Implemented
- [Component 1]: [Brief description]
- [Component 2]: [Brief description]

## Technical Approach
[Brief description of implementation approach]

## Cleanup Needed
- Remove console.logs in [specific files]
- Fix TODOs in [specific files]
- Address commented code in [specific files]

## Documentation Needed
- Update [specific documentation file]
- Add JSDoc comments to [specific functions]
- Create usage examples for [specific component]

## GitHub Issue
Issue #[number]: [title]
Status: Ready to close after documentation
```

### Starting the New Chat
```
I've completed implementation of a BootHillGM feature and now need to handle cleanup and documentation. Here's the implementation summary:

[Paste the summary artifact]

Please help me with the cleanup and documentation tasks, starting with removing debug code and then updating the documentation.
```

## 5. General Continuation Template

Use this template for any transition not covered above:

### Request in Current Chat
```
We're approaching the chat length limit. Could you create a summary artifact of our current progress and next steps that I can use to continue in a fresh chat?
```

### Expected Artifact Content
```markdown
# Work Progress Summary

## Task Overview
[Brief description of overall task]

## Current Status
- [Major component 1]: [Status]
- [Major component 2]: [Status]

## Completed Steps
1. [Step 1]
2. [Step 2]

## Next Steps
1. [Next step 1]
2. [Next step 2]

## Technical Context
- [Important technical detail 1]
- [Important technical detail 2]

## Pending Decisions
- [Decision point 1]
- [Decision point 2]
```

### Starting the New Chat
```
I'm continuing work on a BootHillGM task from a previous chat. Here's our current progress:

[Paste the summary artifact]

Let's continue with [specific next step].
```

## Best Practices for Effective Handoffs

1. **Request Summaries Proactively**: Don't wait until you hit the limit
2. **Be Specific About Next Steps**: Include clear direction for the next chat
3. **Include Critical Context**: Technical decisions, approaches, and constraints
4. **Save Artifacts**: Copy summary artifacts to a local file for safekeeping
5. **Reference Related Files**: Include specific file paths in summaries

## Related Documents
- [[claude-app-workflow|Claude App Workflow]]
- [[claude-app-prompt-templates|Prompt Templates]]
- [[claude-app-mcp-optimization|MCP Optimization Guide]]