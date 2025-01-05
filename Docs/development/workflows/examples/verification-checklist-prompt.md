---
title: Verification Checklist Prompt
aliases: [Implementation Verification Checklist]
tags: [development, process, ai, claude, verification]
created: 2025-01-01
updated: 2025-01-01
---

# Verification Checklist Creation Prompt

```markdown
Based on the implementation task we've identified, let's create a focused checklist of what needs to work for this to be considered complete.

<verification_checklist>
Task: [Brief task description]

Core Functionality:
- [ ] [Key function/feature 1]
- [ ] [Key function/feature 2]
- [ ] [Key function/feature 3]

Required Tests:
- [ ] [Core behavior test]
- [ ] [Essential edge case]

Documentation:
- [ ] Basic inline comments
- [ ] Update relevant docs
</verification_checklist>
```

## Example Usage

For a weapon damage calculation implementation:

Input:
```markdown
[Paste the prompt above]
```

Example Response:
```markdown
<verification_checklist>
Task: Implement weapon damage calculation system

Core Functionality:
- [ ] Basic damage calculation works (2d6 + modifiers)
- [ ] Critical hits apply correct multiplier
- [ ] Hit location modifiers affect final damage

Required Tests:
- [ ] Basic damage calculation test
- [ ] Critical hit calculation test

Documentation:
- [ ] Comment key calculations
- [ ] Update combat system docs
</verification_checklist>
```