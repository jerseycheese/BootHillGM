---
title: KISS Principles for React Development
aliases: [React Simplicity Guide, KISS React]
tags: [development, react, best-practices, kiss]
created: 2025-03-19
updated: 2025-03-19
---

# KISS Principles for React Development

> [!tip]
> Keep It Simple, Stupid (KISS): The art of maximizing the work not done — by doing only what's absolutely necessary.

## Core KISS Principles

```mermaid
graph TD
    A[Simple Props] --> B[Simple State]
    B --> C[Simple JSX]
    C --> D[Simple Side Effects]
    A --> E[Simple Tests]
    E --> F[Simple Docs]
    A -.-> G[Refactor Only When Needed]
    G -.-> A
```

## From Drupal to React: Simplicity Mapping

| Drupal Pattern | React Anti-Pattern | KISS React Pattern |
|----------------|-------------------|-------------------|
| Complex theme hooks with too many variables | Components with too many props | Focused components with minimal, well-typed props |
| Nested preprocess functions | Deeply nested components with prop drilling | Flat component hierarchies with context where needed |
| Over-engineered Drupal modules | Premature abstraction into utility hooks/components | Start concrete, extract patterns only when they repeat |
| "Just in case" theme variables | Components that accept unused props | Props that directly map to component needs |
| jQuery spaghetti | Imperative DOM manipulations | Declarative state-driven rendering |

## Principles in Practice

### 1. Simple Props
Like Drupal's theme hook variables, props define your component's API:

```tsx
// ❌ Too complex - Drupal equivalent: theme hook with 10+ variables
interface CharacterCardProps {
  character: Character;
  onSave: (character: Character) => void;
  onDelete: (id: string) => void;
  editable?: boolean;
  showStats?: boolean;
  showInventory?: boolean;
  showSpells?: boolean;
  showNotes?: boolean;
  className?: string;
  style?: React.CSSProperties;
  renderCustomHeader?: (character: Character) => React.ReactNode;
  // ...and more props
}

// ✅ KISS approach - Drupal equivalent: focused theme hook
interface CharacterCardProps {
  character: Character;
  onSave: (character: Character) => void;
  variant: 'compact' | 'full';
}
```

### 2. Simple State

Like Drupal's form state, React state should be minimal:

```tsx
// ❌ Too complex - Drupal equivalent: overly complex form_state
const CharacterForm = () => {
  const [name, setName] = useState('');
  const [class, setClass] = useState('');
  const [level, setLevel] = useState(1);
  const [strength, setStrength] = useState(10);
  const [dexterity, setDexterity] = useState(10);
  // ...20 more useState calls
  
  // Complex state synchronization logic
}

// ✅ KISS approach - Drupal equivalent: form_state['values']
const CharacterForm = () => {
  const [character, setCharacter] = useState({
    name: '',
    class: '',
    level: 1,
    // ...other fields with defaults
  });
  
  const updateField = (field, value) => {
    setCharacter({...character, [field]: value});
  };
}
```

### 3. Simple JSX

Like Drupal's twig templates, JSX should be readable:

```tsx
// ❌ Too complex - Drupal equivalent: template with too many conditionals
return (
  <div className={classNames(styles.card, { 
    [styles.editing]: isEditing,
    [styles.highlighted]: isHighlighted,
    [styles.selected]: isSelected,
    [styles.disabled]: isDisabled
  })}>
    {showHeader && <Header title={title} subtitle={subtitle} />}
    {isEditing ? (
      <EditMode 
        fields={fields} 
        values={values} 
        onChange={handleChange} 
        onSave={handleSave} 
      />
    ) : (
      <ViewMode 
        fields={fields} 
        values={values} 
        onEdit={handleEdit} 
      />
    )}
    {showFooter && (
      <Footer>
        {canDelete && <DeleteButton onClick={handleDelete} />}
        {canSave && <SaveButton onClick={handleSave} disabled={!isValid} />}
        {canCancel && <CancelButton onClick={handleCancel} />}
      </Footer>
    )}
  </div>
);

// ✅ KISS approach - Drupal equivalent: separate template files 
// Split into smaller components with clearer responsibility
return (
  <CharacterCard mode={isEditing ? 'edit' : 'view'}>
    <CardContent character={character} onChange={handleChange} />
    <CardActions onSave={handleSave} onCancel={handleCancel} />
  </CharacterCard>
);
```

### 4. Simple Side Effects

Like Drupal's hook architecture, side effects should be focused:

```tsx
// ❌ Too complex - Drupal equivalent: module with too many hooks
useEffect(() => {
  // Load character data
  // Update URL
  // Sync with localStorage
  // Track analytics event
  // Update document title
  // Calculate derived stats
  // Check permissions
}, [characterId, userId]);

// ✅ KISS approach - Drupal equivalent: single-purpose hooks
// Split into multiple, focused effects
useEffect(() => {
  // Only load character data
}, [characterId]);

useEffect(() => {
  // Only update document title
}, [character.name]);

// Extract complex logic to custom hooks
const characterStats = useCharacterStats(character);
```

### 5. Simple Testing

Like Drupal's SimpleTest, focus on behavior not implementation:

```tsx
// ❌ Too complex - Drupal equivalent: brittle tests that test implementation
test('character card component', () => {
  const { getByTestId } = render(<CharacterCard character={mockCharacter} />);
  
  // Testing too many things
  expect(getByTestId('character-name')).toHaveTextContent('Aragorn');
  expect(getByTestId('character-level')).toHaveTextContent('5');
  expect(getByTestId('character-class')).toHaveTextContent('Ranger');
  expect(getByTestId('character-race')).toHaveTextContent('Human');
  expect(getByTestId('character-strength')).toHaveTextContent('16');
  expect(getByTestId('character-health')).toHaveTextContent('45/45');
  expect(getByTestId('character-stamina')).toHaveTextContent('30/30');
  
  // And 20 more expectations...
});

// ✅ KISS approach - Drupal equivalent: testing key behaviors only
test('displays character name and level', () => {
  const { getByTestId } = render(<CharacterCard character={mockCharacter} />);
  expect(getByTestId('character-name')).toHaveTextContent('Aragorn');
  expect(getByTestId('character-level')).toHaveTextContent('5');
});

test('saving updates character data', async () => {
  const handleSave = jest.fn();
  const { getByText } = render(
    <CharacterCard character={mockCharacter} onSave={handleSave} />
  );
  
  await userEvent.click(getByText('Edit'));
  await userEvent.type(screen.getByLabelText('Name'), 'Strider');
  await userEvent.click(getByText('Save'));
  
  expect(handleSave).toHaveBeenCalledWith({
    ...mockCharacter,
    name: 'Strider'
  });
});
```

## When to Add Complexity

Complexity should only be added when there's clear evidence it's needed:

1. **Repetition**: The same pattern appears in 3+ places
2. **Performance**: Measured (not assumed) performance issues
3. **Maintainability**: When simpler code becomes harder to understand
4. **Requirements**: Only when explicitly required by specifications

## AI-Assisted KISS Development

When working with Claude:

### 1. Request Simple Solutions
```
Please provide the simplest React component that handles [requirement].
Focus on readability over cleverness.
```

### 2. Emphasize Core Functionality First
```
Let's implement the core functionality first, without any optimizations 
or edge cases. We can add those later if needed.
```

### 3. Ask for Simplifications
```
This implementation seems complex. How could we simplify it while 
maintaining the same functionality?
```

## Red Flags: When You're Violating KISS

1. Component file exceeds 150 lines
2. More than 5-7 props for a component
3. Nested ternary operators
4. Multiple levels of nested components
5. useEffect with multiple dependencies
6. Complex state calculations
7. "What does this code do?" moments when reviewing

## From Drupal to React: Mental Model Shifts

| Drupal Thinking | React KISS Thinking |
|-----------------|---------------------|
| "I need to account for every theme variation" | "I'll build for the current use case and refactor when patterns emerge" |
| "Let's add this variable just in case" | "Props should reflect actual usage, not potential future needs" |
| "I need to build a complex system of templates" | "I'll build focused components and compose them together" |
| "Performance comes from clever preprocessing" | "Performance comes from minimizing re-renders and focused updates" |

## React Component Structure Simplified

Much like how you'd organize a Drupal theme with base components, molecules, and organisms, React components can follow a similar hierarchy:

```
src/
├── components/
│   ├── atoms/           // Like Drupal's base components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Text.tsx
│   ├── molecules/       // Like Drupal's composite components
│   │   ├── CharacterStat.tsx
│   │   ├── SkillRow.tsx
│   │   └── InventoryItem.tsx
│   └── organisms/       // Like Drupal's template regions
│       ├── CharacterSheet.tsx
│       ├── CombatTracker.tsx
│       └── SpellBook.tsx
├── pages/               // Like Drupal's page templates
│   ├── CharacterPage.tsx
│   ├── CampaignPage.tsx
│   └── EncounterPage.tsx
└── hooks/               // Like Drupal's preprocess functions
    ├── useCharacter.ts
    ├── useCampaign.ts
    └── useEncounter.ts
```

## Practical Examples for BootHillGM

### Simplified Character Sheet Component

```tsx
// components/organisms/CharacterSheet.tsx

// ✅ KISS approach
interface CharacterSheetProps {
  character: Character;
  onUpdate: (character: Character) => void;
  readOnly?: boolean;
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({ 
  character, 
  onUpdate,
  readOnly = false
}) => {
  // Single state object rather than multiple state variables
  const [editedCharacter, setEditedCharacter] = useState(character);
  
  // Simple event handler with field abstraction
  const handleChange = (field: keyof Character, value: any) => {
    setEditedCharacter({
      ...editedCharacter,
      [field]: value
    });
  };
  
  // Simple save handler
  const handleSave = () => {
    onUpdate(editedCharacter);
  };
  
  // Simplified render with component composition
  return (
    <div className="character-sheet">
      <CharacterHeader 
        name={character.name} 
        level={character.level}
        characterClass={character.characterClass}
        editable={!readOnly}
        onChange={handleChange}
      />
      
      <CharacterStats 
        stats={character.stats}
        editable={!readOnly}
        onChange={(stats) => handleChange('stats', stats)}
      />
      
      {!readOnly && (
        <Button onClick={handleSave}>Save Character</Button>
      )}
    </div>
  );
};
```

## Related Documents
- [[tdd-with-kiss|Test-Driven Development with KISS]]
- [[claude-app-workflow|Claude App Development Workflow]]
