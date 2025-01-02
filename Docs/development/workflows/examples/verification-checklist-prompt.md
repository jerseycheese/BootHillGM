---
title: Verification Checklist Prompt
aliases: [Implementation Verification Checklist]
tags: [development, process, ai, claude, verification]
created: 2025-01-01
updated: 2025-01-01
---

# Verification Checklist Creation Prompt

```markdown
Now that we've identified the next development task, let's create a verification checklist to define when it's complete.

Review the task details and create a comprehensive checklist considering:
1. Core functionality requirements
2. User interface elements
3. Data handling
4. Error scenarios
5. Testing needs
6. Documentation requirements

<verification_checklist>
Task: [Brief task description]

## Functional Requirements
- [ ] List specific functionality that must work
- [ ] Include any Boot Hill rule requirements
- [ ] Note important edge cases

## Technical Implementation
- [ ] Required files/components completed
- [ ] Type definitions in place
- [ ] Error handling implemented
- [ ] State management working

## Testing Coverage
- [ ] Unit tests added for new code
- [ ] Key scenarios tested
- [ ] Edge cases covered

## Documentation
- [ ] Code comments added
- [ ] Documentation updated
- [ ] Issues/stories referenced

## Integration
- [ ] Works with existing components
- [ ] No regressions introduced
- [ ] Clean console output

Notes:
[Any additional considerations or context]
</verification_checklist>
```

## Example Usage

After receiving a task recommendation for weapon damage calculations:

Input:
```markdown
[Paste the prompt above]
```

Example Response:
```markdown
<verification_checklist>
Task: Implement weapon damage calculation system

## Functional Requirements
- [ ] Base weapon damage calculation works
- [ ] Critical hit multipliers applied correctly
- [ ] Hit location modifiers implemented
- [ ] Follows Boot Hill v2 damage tables
- [ ] Handles all weapon types correctly
- [ ] Validates input parameters

## Technical Implementation
- [ ] calculateDamage.ts function complete
- [ ] DamageTypes.ts contains all needed types
- [ ] Input validation in place
- [ ] Error messages clear and helpful
- [ ] Performance acceptable for combat flow

## Testing Coverage
- [ ] Basic damage calculation tests
- [ ] Critical hit scenario tests
- [ ] Hit location modifier tests
- [ ] Error case tests
- [ ] Edge case handling (min/max damage)

## Documentation
- [ ] Function documentation complete
- [ ] Boot Hill rule references added
- [ ] Example usage documented
- [ ] Test cases documented
- [ ] BUG-45 can be closed

## Integration
- [ ] Works with combat resolution system
- [ ] Updates character health correctly
- [ ] Displays results clearly
- [ ] No errors in dev console
- [ ] No impact on other combat features

Notes:
- Pay special attention to critical hit calculation formulas
- Ensure clear error messages for invalid weapons
- Consider adding damage type enum for future expansion
</verification_checklist>
```