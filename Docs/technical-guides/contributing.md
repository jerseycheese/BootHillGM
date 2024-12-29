---
title: Contributing Guide
aliases: [Development Guidelines, Contribution Guidelines]
tags: [technical, contributing, development, guidelines, workflow]
created: 2024-12-28
updated: 2024-12-28
---

# Contributing Guide

## Overview
This guide outlines the process and standards for contributing to the BootHillGM project. It covers development workflow, coding standards, and submission guidelines.

## Getting Started

### 1. Environment Setup
Follow the [[setup|Development Setup Guide]] to configure your development environment.

### 2. Project Understanding
- Review [[../meta/project-overview|Project Overview]]
- Study [[../architecture/component-structure|Component Structure]]
- Read [[../core-systems/state-management|State Management]]

## Development Workflow

### 1. Branch Strategy
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Create bugfix branch
git checkout -b fix/bug-description

# Create documentation branch
git checkout -b docs/topic-name
```

### 2. Commit Guidelines
Follow conventional commits:
```bash
# Feature
feat: add inventory sorting

# Bug fix
fix: resolve combat state persistence

# Documentation
docs: update API integration guide

# Refactor
refactor: optimize combat calculations
```

## Code Standards

### 1. TypeScript Guidelines
- Use strict type checking
- Avoid `any` type
- Document complex types
- Use interfaces for objects

```typescript
interface CombatAction {
  type: 'attack' | 'defend' | 'move';
  target?: string;
  modifier?: number;
}
```

### 2. React Components
- Use functional components
- Implement proper hooks
- Maintain component purity
- Document props interface

```typescript
interface Props {
  /** Description of the prop */
  propName: string;
}

const Component: React.FC<Props> = ({ propName }) => {
  // Implementation
};
```

### 3. Testing Requirements
- Write unit tests for new features
- Update existing tests when modifying code
- Maintain test coverage standards
- Document test scenarios

## Documentation

### 1. Code Documentation
- Use JSDoc comments
- Document complex logic
- Explain non-obvious decisions
- Update relevant documentation

```typescript
/**
 * Calculates combat damage based on weapon type and modifiers.
 * @param weapon - The weapon being used
 * @param modifiers - Combat situation modifiers
 * @returns Calculated damage value
 */
function calculateDamage(weapon: Weapon, modifiers: CombatModifiers): number {
  // Implementation
}
```

### 2. Documentation Updates
- Update relevant .md files
- Follow Obsidian formatting
- Add proper frontmatter
- Include related documentation links

## Pull Request Process

### 1. Preparation
- [ ] Run test suite
- [ ] Update documentation
- [ ] Check code formatting
- [ ] Review changes
- [ ] Update changelog

### 2. Submission
1. Create detailed PR description
2. Link related issues
3. Add appropriate labels
4. Request code review
5. Address feedback

### 3. Review Criteria
- Code quality
- Test coverage
- Documentation updates
- Performance impact
- Security considerations

## Development Tools

### 1. Required Extensions
- ESLint
- Prettier
- TypeScript
- Jest Runner
- Tailwind CSS IntelliSense

### 2. Recommended Tools
- React DevTools
- Chrome DevTools
- VS Code Debugger
- Git GUI client

## Best Practices

### 1. State Management
- Use appropriate hooks
- Maintain atomic updates
- Document state changes
- Consider performance

### 2. Component Design
- Follow single responsibility
- Implement proper error boundaries
- Use proper prop typing
- Maintain reasonable file size

### 3. Performance
- Optimize renders
- Use proper memoization
- Implement code splitting
- Monitor bundle size

## Common Tasks

### 1. Adding Features
1. Create feature branch
2. Implement functionality
3. Add tests
4. Update documentation
5. Submit PR

### 2. Fixing Bugs
1. Create bug fix branch
2. Add failing test
3. Implement fix
4. Verify solution
5. Submit PR

## Related Documentation
- [[setup|Development Setup]]
- [[testing|Testing Guide]]
- [[deployment|Deployment Guide]]
- [[../architecture/component-structure|Component Structure]]
- [[../meta/project-overview|Project Overview]]