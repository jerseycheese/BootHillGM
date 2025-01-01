---
title: Development Workflows
aliases: [Workflows, Development Process]
tags: [development, workflow, process]
created: 2025-01-01
updated: 2025-01-01
---

# Development Workflows

> [!note]
> Start here to understand development processes for BootHillGM.

## Core Workflows
- 🔄 [[feature-workflow|Feature Development]]
- 🧪 [[testing-workflow|Testing]]
- 📝 [[documentation-workflow|Documentation]]

## AI-Assisted Development
- 🤖 [[claude-workflow|Claude Workflow]] - Primary development workflow
- ✍️ [[prompt-guide|Prompt Writing Guide]]
- 📚 [[examples/weapon-combat|Example: Weapon Combat]]

## Quick Reference

```mermaid
graph TD
    A[Development] --> B[Desktop/Planning]
    A --> C[API/Implementation]
    A --> D[API/Cleanup]
    B --> E[Requirements]
    B --> F[Prompt]
    B --> G[Checklist]
    C --> H[Code]
    C --> I[Tests]
    C --> J[Docs]
    D --> K[Verify]
    D --> L[Update]
    D --> M[Commit]
```

## Further Reading
- [[../../technical-guides/contributing|Contributing Guide]]
- [[../../boot-hill-rules/index|Boot Hill Rules]]