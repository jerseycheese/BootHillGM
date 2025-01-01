---
title: Claude Workflow Prompts
aliases: [Claude Development Examples]
tags: [development, process, ai, claude, examples]
created: 2025-01-01
updated: 2025-01-01
---

# Claude Workflow Prompts

> [!note]
> Example prompts and templates for each stage of the Claude development workflow.

## 1. Planning Stage (Desktop)

### Requirements Review Prompt
```
I'm working on [feature name] for BootHillGM. Here are the relevant files and rules:

1. Boot Hill Rules:
   - [paste relevant rule sections]

2. Current Implementation:
   - File: [path]
   - [paste relevant code]

Could you analyze the requirements and identify key implementation points?
```

### Implementation Planning Prompt
```
Based on the requirements, here's what we need to implement:
[list implementation points]

Could you:
1. Outline a component structure
2. Suggest test scenarios
3. Identify potential edge cases
```

### Verification Checklist Prompt
```
For this implementation of [feature], could you create a verification checklist covering:

1. Core functionality
2. Edge cases
3. Boot Hill rule compliance
4. Test coverage
```

## 2. Implementation Stage (API)

### Code Generation Prompt
```
Please implement [component name] with these requirements:

1. Location: [file path]
2. Features:
   - [list features]
3. Boot Hill Rules:
   - [relevant rules]

Use TypeScript and follow our component conventions.
```

### Test Creation Prompt
```
Create test cases for [component] covering:

1. Core functionality
2. Edge cases: [list]
3. Boot Hill rules: [list]

Use Jest and React Testing Library.
```

### Documentation Prompt
```
Generate documentation for [component] including:

1. Usage examples
2. Props API
3. Related Boot Hill rules
4. Test coverage details

Follow our Obsidian documentation format.
```

## 3. Cleanup Stage (API)

### Issue Resolution Prompt
```
These issues were found in [component]:
[list issues]

Please:
1. Analyze each issue
2. Suggest fixes
3. Update affected tests
```

### Documentation Update Prompt
```
Based on implementation changes:

1. Update [doc path]
2. Add usage examples
3. Update related sections:
   - [list sections]
```

### Commit Message Prompt
```
Generate a commit message for [component] changes:

1. Implementation: [summary]
2. Tests: [summary]
3. Documentation: [summary]

Follow conventional commit format.
```

## Example Usage

Input:
```markdown
Please implement a weapon selection component with these requirements:

1. Location: BootHillGMApp/app/components/combat/WeaponSelector.tsx
2. Features:
   - Display available weapons
   - Show damage values
   - Handle weapon selection
3. Boot Hill Rules:
   - Weapons chart page 36
   - Combat modifiers page 38

Use TypeScript and follow our component conventions.
```

Response:
```markdown
I'll help implement the WeaponSelector component following our conventions and Boot Hill rules.

Let's start with the implementation:

1. Component Structure:
```typescript
import React from 'react';
import { WeaponData } from '@/types';

interface WeaponSelectorProps {
  weapons: WeaponData[];
  onSelect: (weapon: WeaponData) => void;
  selectedWeapon?: WeaponData;
}

export const WeaponSelector = ({
  weapons,
  onSelect,
  selectedWeapon
}: WeaponSelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select Weapon</h3>
      <div className="grid gap-2">
        {weapons.map((weapon) => (
          <button
            key={weapon.id}
            className={`p-2 border rounded ${
              selectedWeapon?.id === weapon.id ? 'border-primary' : ''
            }`}
            onClick={() => onSelect(weapon)}
          >
            <div className="flex justify-between">
              <span>{weapon.name}</span>
              <span>Damage: {weapon.damage}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WeaponSelector;
```

2. Test Implementation:
```typescript
import { render, fireEvent } from '@testing-library/react';
import { WeaponSelector } from './WeaponSelector';

describe('WeaponSelector', () => {
  const mockWeapons = [
    { id: 1, name: 'Colt .45', damage: '2d6' },
    { id: 2, name: 'Winchester', damage: '2d8' }
  ];

  it('displays all available weapons', () => {
    const { getByText } = render(
      <WeaponSelector weapons={mockWeapons} onSelect={() => {}} />
    );

    expect(getByText('Colt .45')).toBeInTheDocument();
    expect(getByText('Winchester')).toBeInTheDocument();
  });

  // Add more tests...
});
```

Would you like me to:
1. Add more tests
2. Implement weapon modifiers
3. Add damage calculation logic
