---
title: Test Creation/Updates Prompt
aliases: [Implementation Testing Prompt]
tags: [development, process, ai, claude, testing]
created: 2025-01-01
updated: 2025-01-01
---

# Test Creation and Updates Prompt

```markdown
Based on the implementation we just completed, I'll write appropriate unit tests. I'll focus on core functionality while keeping the test scope practical.

Test implementation format:
<test_implementation>
1. File Location: [path to test file]

2. Test Code:
```typescript
[Complete test implementation]
```

3. Notes:
   - Key scenarios covered
   - Any test assumptions
</test_implementation>
```

## Example Usage

After implementing a dice roll calculation component:

Input:
```markdown
Component: DiceRoll implementation
Files Changed:
- BootHillGMApp/app/lib/dice/calculateRoll.ts
- BootHillGMApp/app/types/dice.ts

Implementation adds:
- Basic 2d6 roll calculation
- Roll modifiers
- Advantage/disadvantage handling
```

Example Response:
```markdown
<test_implementation>
1. File Location: BootHillGMApp/app/__tests__/calculateRoll.test.ts

2. Test Code:
```typescript
import { calculateRoll, RollParams } from '../lib/dice/calculateRoll'

describe('calculateRoll', () => {
  // Mock Math.random for consistent test results
  const mockRandom = jest.spyOn(Math, 'random')
  
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('calculates basic 2d6 roll correctly', () => {
    // Mock two d6 rolls: 4 and 3
    mockRandom
      .mockReturnValueOnce(0.5) // 0.5 * 6 = 3 + 1 = 4
      .mockReturnValueOnce(0.33) // 0.33 * 6 = 1.98 + 1 = 3
    
    const result = calculateRoll({ dice: '2d6' })
    expect(result.rolls).toEqual([4, 3])
    expect(result.total).toBe(7)
    expect(result.modifier).toBe(0)
  })

  it('applies modifiers correctly', () => {
    mockRandom
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.33)
    
    const result = calculateRoll({ 
      dice: '2d6',
      modifier: 2
    })
    expect(result.rolls).toEqual([4, 3])
    expect(result.total).toBe(9) // 7 + 2
    expect(result.modifier).toBe(2)
  })

  it('handles advantage correctly', () => {
    // First roll: 4, 3 = 7
    // Second roll: 5, 6 = 11
    mockRandom
      .mockReturnValueOnce(0.5) // 4
      .mockReturnValueOnce(0.33) // 3
      .mockReturnValueOnce(0.66) // 5
      .mockReturnValueOnce(0.83) // 6
    
    const result = calculateRoll({ 
      dice: '2d6',
      advantage: true
    })
    expect(result.rolls).toEqual([5, 6]) // Takes higher roll
    expect(result.total).toBe(11)
    expect(result.advantage).toBe(true)
    expect(result.discardedRolls).toEqual([4, 3])
  })
})
```

3. Notes:
   - Uses jest's Math.random mock for deterministic results
   - Covers core roll calculation, modifiers, and advantage
   - Verifies both final results and individual die values
   - More complex scenarios (e.g., combined advantage + modifiers) can be added if needed
</test_implementation>
```