# Boot Hill Tables Implementation Guide

## Overview
This guide outlines the implementation approach for Boot Hill v2 rule tables and dice rolling system.

## Core Components

### 1. Table System

#### Data Structure
```typescript
export interface RuleTable {
  id: string;
  name: string;
  description: string;
  entries: TableEntry[];
  modifiers?: TableModifier[];
}

export interface TableEntry {
  roll: number | [number, number];
  result: string;
  effect?: string;
  modifiers?: string[];
}

export interface TableModifier {
  condition: string;
  value: number;
  description: string;
}
```

#### Implementation Pattern
```typescript
export class TableManager {
  private tables: Map<string, RuleTable>;
  
  constructor(tables: RuleTable[]) {
    this.tables = new Map(tables.map(table => [table.id, table]));
  }
  
  lookup(tableId: string, roll: number, modifiers: string[] = []): TableEntry {
    const table = this.tables.get(tableId);
    if (!table) throw new Error(`Table ${tableId} not found`);
    
    const modifiedRoll = this.applyModifiers(roll, table, modifiers);
    return this.findEntry(table, modifiedRoll);
  }
  
  private applyModifiers(roll: number, table: RuleTable, modifiers: string[]): number {
    // Implementation
  }
  
  private findEntry(table: RuleTable, roll: number): TableEntry {
    // Implementation
  }
}
```

### 2. Dice Rolling System

#### Core Interface
```typescript
export interface DiceRoll {
  count: number;
  sides: number;
  modifier?: number;
  advantage?: boolean;
  disadvantage?: boolean;
}

export interface RollResult {
  total: number;
  rolls: number[];
  modifier?: number;
  advantage?: boolean;
  disadvantage?: boolean;
}
```

#### Implementation
```typescript
export class DiceRoller {
  roll(params: DiceRoll): RollResult {
    const rolls = this.generateRolls(params);
    const total = this.calculateTotal(rolls, params.modifier);
    
    return {
      total,
      rolls,
      modifier: params.modifier,
      advantage: params.advantage,
      disadvantage: params.disadvantage
    };
  }
  
  private generateRolls(params: DiceRoll): number[] {
    // Implementation
  }
  
  private calculateTotal(rolls: number[], modifier?: number): number {
    // Implementation
  }
}
```

## Integration Patterns

### 1. Combat System Integration

```typescript
export class CombatRollManager {
  private tableManager: TableManager;
  private diceRoller: DiceRoller;
  
  constructor(tables: RuleTable[]) {
    this.tableManager = new TableManager(tables);
    this.diceRoller = new DiceRoller();
  }
  
  resolveAttack(params: AttackParams): AttackResult {
    const roll = this.diceRoller.roll({
      count: 2,
      sides: 6,
      modifier: params.modifier
    });
    
    const hitLocation = this.tableManager.lookup('hitLocation', roll.total);
    const damage = this.calculateDamage(hitLocation, params.weapon);
    
    return {
      roll: roll.total,
      location: hitLocation,
      damage,
      effects: this.getEffects(hitLocation)
    };
  }
}
```

### 2. React Component Integration

```typescript
interface CombatTableProps {
  tableId: string;
  modifiers?: string[];
}

const CombatTable: React.FC<CombatTableProps> = ({ tableId, modifiers = [] }) => {
  const tableManager = useTableManager();
  const table = tableManager.getTable(tableId);
  
  return (
    <div>
      <h3>{table.name}</h3>
      <table>
        <thead>
          <tr>
            <th>Roll</th>
            <th>Result</th>
            <th>Effect</th>
          </tr>
        </thead>
        <tbody>
          {table.entries.map(entry => (
            <tr key={entry.roll.toString()}>
              <td>{formatRoll(entry.roll)}</td>
              <td>{entry.result}</td>
              <td>{entry.effect}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

## Table Data Structure

### Example: Hit Location Table
```typescript
const hitLocationTable: RuleTable = {
  id: 'hitLocation',
  name: 'Hit Location',
  description: 'Determines where a successful attack hits',
  entries: [
    {
      roll: [2, 3],
      result: 'Head',
      effect: 'Double damage'
    },
    {
      roll: [4, 7],
      result: 'Torso',
      effect: 'Normal damage'
    },
    // Additional entries...
  ],
  modifiers: [
    {
      condition: 'Prone',
      value: -2,
      description: 'Target is lying down'
    }
  ]
};
```

## Testing Strategy

### 1. Unit Tests
```typescript
describe('DiceRoller', () => {
  const roller = new DiceRoller();
  
  test('rolls within valid range', () => {
    const result = roller.roll({ count: 2, sides: 6 });
    expect(result.total).toBeGreaterThanOrEqual(2);
    expect(result.total).toBeLessThanOrEqual(12);
  });
  
  // Additional tests...
});
```

### 2. Integration Tests
```typescript
describe('CombatRollManager', () => {
  const manager = new CombatRollManager(mockTables);
  
  test('resolves attack with modifiers', () => {
    const result = manager.resolveAttack({
      modifier: 2,
      weapon: 'pistol'
    });
    
    expect(result.roll).toBeDefined();
    expect(result.location).toBeDefined();
    expect(result.damage).toBeGreaterThan(0);
  });
});
```

## Usage Guidelines

1. Table Access
   - Use TableManager for all table lookups
   - Always validate table existence
   - Handle missing entries gracefully

2. Dice Rolling
   - Use DiceRoller for all random number generation
   - Include modifiers in roll parameters
   - Store roll history for logging

3. Combat Integration
   - Integrate through CombatRollManager
   - Handle all combat-related rolls
   - Apply appropriate modifiers

4. State Management
   - Store tables in game context
   - Cache commonly used tables
   - Update UI on roll results