# Quick Test Creation Guide (Haiku)

> [!note]
> Basic test creation for rapid development with Claude 3 Haiku.

## Initial Prompt to Copy
```markdown
I need basic tests for the code just implemented. Here's the context from previous steps:

[PASTE PREVIOUS HANDOFFS INCLUDING:
- Original task & success criteria
- Implemented code changes]

Please help create basic tests for this implementation. Focus only on testing the core functionality and basic error handling. Skip edge cases for MVP but note them for later.

After examining the existing test files, please provide:
1. Unit tests for new code
2. Notes on what we're not testing yet
```

## Example Full Conversation
Human: [Sends prompt above with context:]
```markdown
Original task: Add basic attack resolution to combat
Success criteria:
- [ ] Attack action reduces target HP
- [ ] Combat UI updates to show damage

Implemented code:
// src/utils/combat.ts
export function resolveAttack(attacker: Character, defender: Character): number {
    const damage = calculateBaseDamage(attacker);
    return Math.max(0, damage);
}

// src/components/combat/CombatManager.tsx
export function CombatManager({ attacker, defender, onCombatUpdate }) {
    const handleAttack = () => {
        const damage = resolveAttack(attacker, defender);
        defender.hp -= damage;
        onCombatUpdate({ damage, target: defender });
    };
    return (...)
}
```

Claude: Let me check the existing test files:

[Claude uses MCP tools to read relevant test files]

I'll help create the essential tests:

```typescript
// src/utils/__tests__/combat.test.ts
import { resolveAttack } from '../combat';

describe('Combat Utils - Attack Resolution', () => {
    const mockAttacker = { strength: 5, hp: 10 };
    const mockDefender = { hp: 10 };

    test('resolveAttack calculates basic damage', () => {
        const damage = resolveAttack(mockAttacker, mockDefender);
        expect(damage).toBe(6); // strength + 1
    });

    test('damage is never negative', () => {
        const weakAttacker = { strength: -5, hp: 10 };
        const damage = resolveAttack(weakAttacker, mockDefender);
        expect(damage).toBe(0);
    });
});

// src/components/combat/__tests__/CombatManager.test.tsx
import { render, fireEvent, screen } from '@testing-library/react';
import { CombatManager } from '../CombatManager';

describe('CombatManager', () => {
    test('handles attack and updates HP', () => {
        const mockUpdate = jest.fn();
        const attacker = { strength: 5, hp: 10 };
        const defender = { hp: 10 };
        
        render(
            <CombatManager 
                attacker={attacker}
                defender={defender}
                onCombatUpdate={mockUpdate}
            />
        );

        fireEvent.click(screen.getByText('Attack'));
        expect(defender.hp).toBe(4); // 10 - (5 + 1)
        expect(mockUpdate).toHaveBeenCalledWith({
            damage: 6,
            target: defender
        });
    });
});

// Future test cases to add:
// - Test critical hits
// - Test damage reduction
// - Test weapon modifiers
// - Test status effects
```