---
title: Development Workflows
aliases: [Workflows, Development Process]
tags: [development, workflow, process]
created: 2025-01-01
updated: 2025-03-19
---

# Development Workflows

> [!note]
> Start here to understand development processes for BootHillGM.

## Core Workflows
- 🔄 [[feature-workflow|Feature Development]]
- 🧪 [[testing-workflow|Testing]]
- 📝 [[documentation-workflow|Documentation]]
- 🔧 [[claude-app-prompt-templates#component-refactoring|Refactoring Guide]]

## TDD with KISS Principles
- 🧠 [[tdd-with-kiss|Test-Driven Development with KISS]] - Recommended workflow
- 💡 [[kiss-principles-react|KISS Principles for React]] - Simplicity guidelines

## AI-Assisted Development
- 🤖 [[claude-app-workflow|Claude App Workflow]] - Primary development workflow
- 💬 [[claude-workflow|Claude Legacy Workflow]] - API-based workflow (legacy)
- ✍️ [[prompt-guide|Prompt Writing Guide]]

### Claude App Tools
- 🔄 [[claude-app-workflow-handoffs|Handoff Templates]]
- 🛠️ [[claude-app-mcp-optimization|MCP Optimization Guide]]
- 📝 [[claude-app-prompt-templates|Prompt Templates]]
- 📊 [[api-vs-app-comparison|API vs App Comparison]]

## Development Workflow Diagram

```mermaid
graph TD
    A[Task Analysis] --> B[Define Tests First]
    B --> C[Implementation]
    C --> D{Build OK?}
    D -->|No| E[Fix Build Errors]
    E --> C
    D -->|Yes| F{Jest Tests Pass?}
    F -->|No| G[Fix Test Issues]
    G --> C
    F -->|Yes| H[Manual Testing]
    H -->|Issues| C
    H -->|Pass| I[Cleanup & Documentation]
    I --> J[Verify Tests Pass]
    J -->|No| G
    J -->|Yes| K[Commit]
```

## Quick Reference Checklist

1. ✅ Define and write tests first
2. ✅ Implement simplest solution that passes tests
3. ✅ Fix build errors before running tests
4. ✅ Fix failing tests before manual testing
5. ✅ Cleanup only after all tests pass
6. ✅ Verify tests still pass after cleanup
7. ✅ Commit and close GitHub issue

## Further Reading
- [[../../technical-guides/contributing|Contributing Guide]]
- [[../../boot-hill-rules/index|Boot Hill Rules]]