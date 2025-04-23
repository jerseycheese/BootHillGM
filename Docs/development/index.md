---
title: Development Documentation
aliases: [Development]
tags: [development, documentation]
created: 2025-01-01
updated: 2025-03-19
---

# Development Documentation

## Core Methodology
- 🧠 [[workflows/tdd-with-kiss|TDD with KISS Principles]]
- 💡 [[workflows/kiss-principles-react|KISS Principles for React]]

## Workflows
- 🔄 [[workflows/index|Development Workflows]]
- 🤖 [[workflows/claude-app-workflow|AI Development (App)]]
- 🧪 [[workflows/testing-workflow|Testing]]
- 💬 [[workflows/claude-workflow|AI Development (API)]]

## Technical Guides
- 🚀 [[../technical-guides/setup|Setup]]
- 📝 [[../technical-guides/contributing|Contributing]]
- 📦 [[../technical-guides/deployment|Deployment]]

## Planning
- 📋 [[../planning/roadmap|Roadmap]]

## Development Tools
- 🛠️ [[workflows/claude-app-mcp-optimization|MCP Optimization Guide]]
- 📝 [[claude-app-prompt-templates|Prompt Templates]]
- 🔄 [[workflows/claude-app-workflow-handoffs|Handoff Templates]]

## Templates
- 🐛 [[bug-report|Bug Report Template]]
- ✨ [[feature-request|Feature Request Template]]

## Quick Start
```bash
# Start a new component with TDD workflow
./scripts/tdd-workflow.sh ComponentName

# Fix build errors first, then Jest tests, then manually test
npm run build && npm test && npm run dev
```