---
title: Cleanup & Documentation Prompt
aliases: [Cleanup & Docs Phase]
tags: [cleanup, documentation, workflow, prompt]
created: 2025-01-26
updated: 2025-01-27
---

# Cleanup & Documentation Prompt

```markdown
Help me review, clean up, and document this implementation:

[PASTE IMPLEMENTATION SUMMARY]

Please provide in this format:

CLEANUP & DOCS
GitHub Issue: #[number] [title]
Branch: [branch-name]

CODE REVIEW
Quality:
- [ ] Code standards & style
- [ ] Error handling
- [ ] Performance
- [ ] Security
- [ ] Debug cleanup (logs, test outputs, flags)

Documentation:
- [ ] Code comments
- [ ] README updates
- [ ] API documentation
- [ ] Architecture changes
- [ ] System documentation

TEST COVERAGE
- Unit Tests: [percentage]
- Integration Tests: [percentage]
- Edge Cases: [list]
- Missing Coverage: [areas]

GITHUB UPDATES
Issues to Close:
- [ ] #[number]: [completion notes]
  Use format from [[../../issue_templates/bug_report|Bug Report Template]] or [[../../issue_templates/feature_request|Feature Request Template]]

Issues to Create:
- [ ] Title: [new issue title]
  Follow [[../../issue_templates/bug_report|Bug Report Template]] or [[../../issue_templates/feature_request|Feature Request Template]]
  Labels: [labels]
  Description: [details]
  # Include any identified follow-up tasks here as new issues

Commit Message:
```
[type](scope): Brief description

- Change detail 1
- Change detail 2

Issue: #[number]
```
```

## Phase Handoff
When completing this phase, provide a summary:

```markdown
CLEANUP & DOCS COMPLETE
Issue: #[number]
Branch: [branch-name]

QUALITY CHECK
- Code Standards: [Pass/Needs Work]
- Test Coverage: [percentage]
- Documentation: [Complete/Needs Work]

DOCS UPDATED
- [file]: [changes]
- [file]: [changes]

ISSUES
Closed:
- #[number]: [summary with completion criteria from template]
Created:
- #[number]: [summary following template format]

FINAL COMMIT
[commit message]
```

## References
- [[../../issue_templates/bug_report|Bug Report Template]]
- [[../../issue_templates/feature_request|Feature Request Template]]
- [[../claude-workflow|Claude Development Workflow]]