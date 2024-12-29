# Implementation Prompt Template

## Context Section
```
I'm working on [project name], a [brief description].
Current task: [task description]

Project conventions:
- [List key conventions]
- [Architectural patterns]
- [Code style preferences]

Affected files:
- [File paths and their purposes]
```

## Requirements Section
```
Implementation requirements:
1. [Specific requirement]
2. [Another requirement]
...

Technical constraints:
- [List any constraints]
- [Performance requirements]
- [Integration points]

Expected behavior:
- [Describe expected behavior]
- [Edge cases to handle]
```

## Code Generation Request
```
Please generate:
1. [Type definitions/interfaces]
2. [Component implementation]
3. [Integration code]
4. [Tests]

Focus on:
- Type safety
- Error handling
- Performance considerations
- Documentation
```

## Example Filled Template
```
I'm working on BootHillGM, a React-based game master assistant.
Current task: Implementing Boot Hill rulebook reference tables

Project conventions:
- React functional components with hooks
- TypeScript with strict type checking
- State management via React Context
- Modular file structure

Affected files:
- /app/components/Combat/RuleTable.tsx (new)
- /app/hooks/useRuleTable.ts (new)
- /app/types/combat.ts (update)

Implementation requirements:
1. Create type-safe table definitions
2. Implement dice rolling utilities
3. Add table lookup functionality
4. Integrate with combat system

Technical constraints:
- Must support dynamic modifiers
- Need efficient lookup performance
- Must handle invalid inputs gracefully

Please generate the implementation following these specifications...
```