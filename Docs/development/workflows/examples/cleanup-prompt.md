---
title: Cleanup & Documentation Prompt
aliases: [Cleanup Phase]
tags: [cleanup, documentation, workflow, prompt]
created: 2025-01-13
updated: 2025-01-13
---

# Cleanup & Documentation Prompt

## Quick Use Prompt
```markdown
Help me review, clean up, and document this implementation. Here's what we've completed:

[PASTE IMPLEMENTATION SUMMARY]

Please:
1. Review code changes for quality and consistency
2. Update all affected documentation
3. Review test coverage
4. Create GitHub updates
5. Identify any follow-up tasks

Use this format:

CLEANUP COMPLETE
GitHub Issue: #[number] [title]
Branch: [branch-name]

CODE REVIEW
Quality:
- [ ] Code follows project standards
- [ ] Error handling is complete
- [ ] Performance considerations addressed
- [ ] Security best practices followed

Consistency:
- [ ] Naming follows conventions
- [ ] File organization matches project structure
- [ ] Component patterns match existing code
- [ ] State management follows patterns

DOCUMENTATION UPDATES
Files Updated:
- [ ] README.md changes
- [ ] Component documentation
- [ ] API documentation
- [ ] Architecture updates

TEST COVERAGE
Coverage Report:
- Unit Tests: [percentage]
- Integration Tests: [percentage]
- Edge Cases: [list]
- Missing Coverage: [areas]

GITHUB UPDATES
Commit Message:
```
[type](scope): Brief description

- Detailed change 1
- Detailed change 2

Issue: #[number]
```

FOLLOW-UP TASKS
- [ ] [Future task 1]
- [ ] [Future task 2]
```

## Purpose
Ensure code quality, maintainability, and comprehensive documentation before completing a feature implementation.

## Input Requirements
1. Completed implementation
2. Test results
3. Project documentation standards
4. Coding guidelines

## Cleanup Process

### 1. Code Review
- Check code quality
  - Error handling
  - Performance
  - Security
  - Clean code principles
- Verify consistency
  - Naming conventions
  - File organization
  - Component patterns
  - State management
- Review type safety
  - TypeScript usage
  - Interface completeness
  - Type exports

### 2. Documentation
- Update README
  - New features
  - Changed APIs
  - Configuration updates
- Component docs
  - Props/interfaces
  - Usage examples
  - Edge cases
- Architecture docs
  - System changes
  - New patterns
  - Integration points

### 3. Testing
- Review coverage
  - Unit tests
  - Integration tests
  - Edge cases
- Verify quality
  - Test organization
  - Naming patterns
  - Documentation
- Check performance
  - Load testing
  - Memory usage
  - Response times

### 4. GitHub Updates
- Write commits
  - Clear messages
  - Detailed bodies
  - Issue references
- Update issues
  - Close completed
  - Update related
  - Add labels
- Create PRs
  - Clear description
  - Review points
  - Test notes

## Output Format

```markdown
CLEANUP REPORT
Component: [name]
Issue: [reference]

CODE QUALITY
Standards Review:
- [ ] Naming conventions
- [ ] Code organization
- [ ] Error handling
- [ ] Performance
- [ ] Security

Pattern Consistency:
- [ ] Component structure
- [ ] State management
- [ ] Event handling
- [ ] Error boundaries

DOCUMENTATION
Updated Files:
1. [file]: [changes]
2. [file]: [changes]

New Documentation:
1. [file]: [purpose]
2. [file]: [purpose]

TEST REVIEW
Coverage:
- Unit: [percentage]
- Integration: [percentage]
- E2E: [percentage]

Areas Needing Coverage:
1. [area]: [tests needed]
2. [area]: [tests needed]

GITHUB UPDATES
Commits:
1. [commit message]
2. [commit message]

Issues:
- Closed: #[number]
- Updated: #[number]
- Created: #[number]

FOLLOW-UP
Tasks:
1. [ ] [task]: [details]
2. [ ] [task]: [details]

Next Steps:
1. [step]: [details]
2. [step]: [details]
```

## Guidelines

### Code Review
- Focus on maintainability
- Check error handling
- Verify type safety
- Review performance
- Validate security

### Documentation
- Keep docs current
- Include examples
- Document changes
- Update diagrams
- Note decisions

### Testing
- Maintain coverage
- Test edge cases
- Document scenarios
- Include performance
- Verify integration

### Issue Management
- Clear status
- Link commits
- Update labels
- Plan follow-up
- Document decisions

## Example

```markdown
CLEANUP REPORT
Component: AuthenticationManager
Issue: #45 Add User Authentication

CODE QUALITY
Standards Review:
- [x] Naming follows auth service patterns
- [x] Code organized by feature
- [x] Comprehensive error handling
- [x] Token validation security
- [x] Session performance

Pattern Consistency:
- [x] Matches service structure
- [x] Uses context for state
- [x] Standard event handling
- [x] Error boundaries added

DOCUMENTATION
Updated Files:
1. /docs/architecture/auth.md: Added OAuth flow
2. /docs/api/auth-service.md: New endpoints
3. /README.md: Auth configuration

New Documentation:
1. /docs/features/authentication.md: Setup guide
2. /docs/security/oauth-config.md: Security notes

TEST REVIEW
Coverage:
- Unit: 94%
- Integration: 87%
- E2E: 100%

Areas Needing Coverage:
1. Token refresh: Add timeout tests
2. Session recovery: Add state tests

GITHUB UPDATES
Commits:
1. feat(auth): Add OAuth authentication
2. test(auth): Add auth flow tests
3. docs(auth): Update documentation

Issues:
- Closed: #45
- Updated: #46 (token refresh)
- Created: #52 (session timeout)

FOLLOW-UP
Tasks:
1. [ ] Implement token refresh
2. [ ] Add session timeout
3. [ ] Monitor auth performance

Next Steps:
1. Plan token refresh implementation
2. Schedule security review
3. Document upgrade guide
```
