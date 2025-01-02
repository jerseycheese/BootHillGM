---
title: Test Creation/Updates Prompt
aliases: [Implementation Testing Prompt]
tags: [development, process, ai, claude, testing]
created: 2025-01-01
updated: 2025-01-01
---

# Test Creation and Updates Prompt

```markdown
Based on the implementation we just completed, let's add appropriate unit tests. Focus on the key functionality that should be verified while keeping the test scope practical.

Review the implementation and suggest tests for:
1. Core functionality
2. Important edge cases
3. Any complex calculations or game rules

<test_suite>
1. Test File: [path to test file]
2. Key Areas to Test:
   - [List 2-3 key aspects that need test coverage]
3. Implementation:
   ```typescript
   // Test implementation code
   ```
4. Notes:
   - Any specific testing considerations
   - Suggestions for future test coverage
</test_suite>
```

## Example Usage

After implementing a dice roll calculation component:

Input:
```markdown
[Having just implemented the dice roll component, paste the prompt above]
```

Example Response:
```markdown
<test_suite>
1. Test File: BootHillGMApp/app/__tests__/DiceRoll.test.tsx

2. Key Areas to Test:
   - Basic dice roll calculations (2d6)
   - Modifier application (+1 to hit)

3. Implementation:
   ```typescript
   import { render, screen } from '@testing-library/react'
   import { calculateDiceRoll } from '../lib/dice'

   describe('DiceRoll', () => {
     it('correctly adds modifiers to roll', () => {
       const result = calculateDiceRoll({
         dice: '2d6',
         modifier: 1
       })
       expect(result.total).toBeGreaterThanOrEqual(3)
       expect(result.total).toBeLessThanOrEqual(13)
       expect(result.modifier).toBe(1)
     })

     it('handles negative modifiers', () => {
       const result = calculateDiceRoll({
         dice: '2d6',
         modifier: -1
       })
       expect(result.total).toBeGreaterThanOrEqual(1)
       expect(result.total).toBeLessThanOrEqual(11)
       expect(result.modifier).toBe(-1)
     })
   })
   ```

4. Notes:
   - Using fixed seeds for random rolls to ensure consistent tests
   - Later we may want to add tests for different dice combinations
</test_suite>
```