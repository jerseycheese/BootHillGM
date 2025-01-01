---
title: Feature Development Workflow
aliases: [Feature Process]
tags: [development, feature, process]
created: 2025-01-01
updated: 2025-01-01
---

# Feature Development Workflow

> [!info]
> Core development workflow using Claude Desktop and API integration.

## Process
```mermaid
graph TD
    A[Planning] --> B[Implementation]
    B --> C[Cleanup]
    A -->|Desktop| D[Prompts/Checklists]
    B -->|API| E[Code/Tests]
    C -->|API| F[Review/Commit]
```

## Stages

### 1. Planning (Desktop)
- Review requirements
- Generate implementation prompt
- Create verification list

### 2. Implementation (API)
- Generate code/tests
- Document changes
- Initial verification

### 3. Cleanup (API)
- Fix issues
- Update docs
- Commit changes

## Examples
> [!example]
> See [[examples/weapon-combat|Weapon Combat Example]] for complete workflow

## Related
- [[prompt-guide|Prompt Writing Guide]]
- [[testing-workflow|Testing Workflow]]