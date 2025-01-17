---
title: Implementation Prompt
aliases: [Implementation Phase]
tags: [implementation, development, workflow, prompt]
created: 2025-01-13
updated: 2025-01-13
---

# Implementation Prompt

## Quick Use Prompt
```markdown
Help me implement this technical specification. Here's the spec:

[PASTE TECHNICAL SPEC]

Please:
1. Write required tests first
2. Implement the core changes
3. Add/update interfaces
4. Verify against success criteria
5. Create implementation summary using standard format
```

## Purpose
Execute the technical specification through concrete code changes while maintaining project quality standards.

## Input Requirements
1. Complete technical specification document
2. Access to relevant codebase files
3. Project coding standards
4. Testing requirements

## Implementation Process

### 1. Test Implementation
- Create test files first
- Cover specified scenarios
- Test edge cases
- Verify error handling

### 2. Interface Creation
- Add type definitions
- Create/update interfaces
- Document public APIs
- Verify type safety

### 3. Core Implementation
- Follow specification
- Handle errors
- Update state
- Add logging

### 4. Documentation
- Update comments
- Add JSDoc
- Update README
- Note decisions

## Output Format

```markdown
IMPLEMENTATION COMPLETE
Task: [task name]
Story/Issue: [reference]
Branch: [branch name]
Build Status: [Pass/Fail]
Test Status: [Pass/Fail]

CHANGES MADE
Files Modified:
- [path]: [what changed]
Files Created:
- [path]: [purpose]

TEST COVERAGE
New Tests:
- [test description]
- [test description]

DOCUMENTATION
Updates Required:
- [doc path]: [what to update]
- [doc path]: [what to update]

VERIFICATION
Success Criteria:
- [ ] [criterion from spec]
- [ ] [criterion from spec]

NOTES
- [implementation note]
- [implementation note]
```

## Guidelines

### Test-First Development
- Write tests before implementation
- Cover edge cases
- Test error conditions
- Verify success criteria

### Clean Code Standards
- Follow project patterns
- Use clear naming
- Add proper documentation
- Maintain consistency

### Incremental Changes
- Make small, focused changes
- Verify each change
- Maintain working state
- Document as you go

### Error Handling
- Handle edge cases
- Provide clear errors
- Maintain type safety
- Consider recovery

## Example Implementation

```markdown
IMPLEMENTATION COMPLETE
Task: Add User Authentication
Story/Issue: AUTH-123
Branch: feature/auth-system
Build Status: Pass
Test Status: Pass

CHANGES MADE
Files Modified:
- src/services/auth.ts: Added OAuth handlers
- src/contexts/UserContext.tsx: Added auth state
Files Created:
- src/components/Auth/LoginForm.tsx: OAuth login UI
- src/services/__tests__/auth.test.ts: Auth tests

TEST COVERAGE
New Tests:
- OAuth initialization tests
- Token validation tests
- Session management tests
- Error handling tests

DOCUMENTATION
Updates Required:
- README.md: Add OAuth setup steps
- docs/api/auth.md: Document new methods
- docs/deployment.md: Add OAuth config

VERIFICATION
Success Criteria:
- [x] OAuth flow works end-to-end
- [x] Session persists on refresh
- [x] Error states handled
- [x] Test coverage >90%

NOTES
- Used httpOnly cookies for tokens
- Added rate limiting to auth endpoints
- Browser compatibility verified
```