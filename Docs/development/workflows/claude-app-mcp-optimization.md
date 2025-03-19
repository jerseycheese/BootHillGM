---
title: Claude App MCP Optimization Guide
aliases: [MCP Tools Guide, Contextual Programming Optimization]
tags: [development, workflow, claude, mcp, optimization, tools]
created: 2025-03-16
updated: 2025-03-16
---

# Claude App MCP Optimization Guide

> [!note]
> Best practices for efficient use of Machine Contextual Programming (MCP) tools in the Claude app.

## MCP Tool Overview

MCP tools allow Claude to interact with your codebase directly, examining files and providing context-aware assistance without requiring you to paste large amounts of code.

### Available MCP Tools
- `list_directory`: View files and folders in a directory
- `read_file`: Read the contents of a specific file
- `read_multiple_files`: Read several files at once
- `search_files`: Find files matching a pattern
- `get_file_info`: Get metadata about a file without reading it

## File Reading Strategy

### Tiered Approach
1. **First-level exploration**: `list_directory` to see what's available
2. **Targeted file identification**: `search_files` with specific patterns
3. **Smart file selection**: `read_file` only for essential files
4. **Multi-file analysis**: `read_multiple_files` for related components

### Reading Order
1. Start with **documentation** to understand context
2. Review **similar components** to understand patterns
3. Examine **interfaces/types** before implementation
4. Look at **tests** to understand expected behavior

### Example: React Component Implementation
```
Please use MCP to help me understand our component patterns:

1. First, check /Users/jackhaas/Projects/BootHillGM/BootHillGMApp/app/components for similar components
2. Then examine our type definitions in /Users/jackhaas/Projects/BootHillGM/BootHillGMApp/app/types
3. Finally, look at test patterns in /Users/jackhaas/Projects/BootHillGMApp/app/__tests__
```

## Query Optimization

### For Component Implementation
```
Please use MCP to:
1. First check if we have similar components at /Users/jackhaas/Projects/BootHillGM/BootHillGMApp/app/components
2. Then look at how we implement tests for these components
3. Finally, check our types directory to see related interfaces
```

### For Bug Fixing
```
Please use MCP to:
1. First read the failing test at [path]
2. Then read the component code at [path]
3. Compare to similar working components (if relevant)
```

### For Documentation
```
Please use MCP to:
1. First check existing documentation structure in /Users/jackhaas/Projects/BootHillGM/Docs
2. Then review similar documentation for format consistency
3. Only then suggest documentation updates
```

## Minimizing Context Length

### Selective Reading
- Only read files that are directly relevant
- Use `get_file_info` instead of `read_file` when only metadata is needed
- Use line numbers or grep-like searches when only part of a file is relevant

### Progressive Disclosure
- Start with high-level files, then drill down
- Begin with reading minimal context, add more if needed
- Use small, focused MCP requests instead of large batch requests

### Example: Component Implementation Sequence
```
1. First MCP request: Read similar component
2. Second MCP request: Read related types/interfaces
3. Third MCP request: Read related tests
4. Implementation in artifact
5. Fourth MCP request: Only if needed for specific patterns
```

## Batch Processing for Efficiency

### Component Creation Bundle
```
Please use MCP to analyze these related items in a single request:
1. Similar component: [path]
2. Related types: [path]
3. Test pattern: [path]
```

### Documentation Bundle
```
Please use MCP to check all documentation locations in a single request:
1. Main docs index: /Users/jackhaas/Projects/BootHillGM/Docs/index.md
2. Component docs: /Users/jackhaas/Projects/BootHillGM/Docs/components/
3. Feature docs: /Users/jackhaas/Projects/BootHillGM/Docs/features/
```

## File Size Management

### For Large Files
- Request specific sections using line numbers if possible
- Focus on structure first, then details
- Ask for summaries of large files before deciding to read them fully

### For Complex Directories
- Use `list_directory` first to get an overview
- Use targeted `search_files` to find relevant files
- Prioritize reading files that match your current task

## Common MCP Patterns

### Finding Similar Components
```
Please use MCP to search for components similar to what we're building:

search_files /Users/jackhaas/Projects/BootHillGM/BootHillGMApp/app/components "Button"
```

### Exploring File Structure
```
Please use MCP to explore our component structure:

list_directory /Users/jackhaas/Projects/BootHillGM/BootHillGMApp/app/components
```

### Checking Component Implementation
```
Please use MCP to check how we've implemented similar features:

read_file /Users/jackhaas/Projects/BootHillGM/BootHillGMApp/app/components/SimilarComponent.tsx
```

### Finding Documentation Patterns
```
Please use MCP to check our documentation format:

read_file /Users/jackhaas/Projects/BootHillGM/Docs/features/similar-feature.md
```

## Error Recovery Strategy

If an MCP tool fails:
1. Try a more specific path
2. Break request into smaller chunks
3. Use alternative tools (e.g., `search_files` instead of `list_directory` + `read_file`)
4. Ask for file existence before trying to read unknown files

### Common MCP Errors and Solutions

#### File Not Found
```
Error: ENOENT: no such file or directory
```
**Solution:** 
- Verify the path is correct
- Use `list_directory` to check available files
- Use `search_files` to find the correct file

#### Path Too Long
**Solution:**
- Break up the request into multiple smaller requests
- Navigate to subdirectories first, then explore further

#### Too Many Files
**Solution:**
- Be more specific in your search criteria
- Use pattern matching to narrow down results

## Project-Specific Paths Reference

### Key Directories
- Components: `/Users/jackhaas/Projects/BootHillGM/BootHillGMApp/app/components`
- Types: `/Users/jackhaas/Projects/BootHillGM/BootHillGMApp/app/types`
- Tests: `/Users/jackhaas/Projects/BootHillGM/BootHillGMApp/app/__tests__`
- Documentation: `/Users/jackhaas/Projects/BootHillGM/Docs`
- Utilities: `/Users/jackhaas/Projects/BootHillGM/BootHillGMApp/app/utils`
- Services: `/Users/jackhaas/Projects/BootHillGM/BootHillGMApp/app/services`

### Common File Patterns
- Component: `ComponentName.tsx`
- Type definitions: `filename.types.ts`
- Tests: `ComponentName.test.tsx`
- Documentation: `feature-name.md`

## Related Documents
- [[claude-app-workflow|Claude App Workflow]]
- [[claude-app-workflow-handoffs|Handoff Templates]]
- [[claude-app-prompt-templates|Prompt Templates]]