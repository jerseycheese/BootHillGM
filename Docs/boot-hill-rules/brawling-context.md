---
title: Brawling Context
aliases: [Hand-to-Hand Combat, Melee Combat]
tags: [rules, combat, brawling]
created: 2024-12-28
updated: 2024-12-28
---

# Brawling Rules

## Overview
Brawling in Boot Hill v2 represents hand-to-hand combat including fistfights, general melee, and bar-room brawls. For implementation details, see [[../core-systems/combat-system|Combat System Implementation]].

## Core Rules

### Key Points
1. Brawling occurs after the firing portion of a game turn
2. Characters within 6 feet of each other can engage in brawling
3. Each brawling portion consists of two rounds
4. In each round a character chooses to punch or grapple

### Procedure
1. Determine who has the first blow (highest speed ability unless surprised)
2. First character chooses to punch or grapple and rolls on appropriate table
3. Apply effects of the action
4. Second character responds with punch or grapple after effects are determined
5. Repeat for a second round

### Special Considerations
- Weapons can be used as striking weapons in brawling
- Knife or cutting weapons use the PUNCHING table but refer to the WOUND chart for effects
- Other striking weapons (gun butts, chairs) add damage but reduce hit chance
- Holds (arm locks, head locks, bear hugs) require special rules to break

### Effects
- Damage reduces opponent's strength
- Some actions provide advantages or disadvantages in subsequent rounds
- Characters reaching 0 strength are knocked unconscious

## Core Mechanics

### Base Numbers
- Brawling Base (BB): Used for hit chance
- Strength Base (STB): Used for damage
- Speed Base (SB): Used for initiative

For calculation details, see [[base-numbers|Base Numbers Calculation]].

### Hit Determination
```
Hit Chance = (BB × 10) + Situation Modifiers
```
Modifiers:
- Opponent Prone: +20%
- Attacking from Behind: +10%
- Poor Footing: -20%
- Multiple Opponents: -10% per extra opponent

## Brawling Actions

### Basic Actions
1. **Punch**
   - Base Damage: STB
   - Hit Chance: Standard
   - Special: Can be used twice per turn

2. **Kick**
   - Base Damage: STB + 2
   - Hit Chance: -10%
   - Special: Once per turn

3. **Grapple**
   - Base Chance: BB × 10
   - Success: Opponent restrained
   - Special: Both hands occupied

4. **Break Free**
   - Base Chance: STB × 10
   - Success: End grapple
   - Special: Uses entire turn

### Special Moves

#### Wrestling Moves
- **Throw**
  - Requires: Successful grapple
  - Damage: STB + 3
  - Effect: Opponent prone

- **Pin**
  - Requires: Opponent prone
  - Effect: Opponent immobilized
  - Special: Both characters prone

#### Dirty Fighting
- **Eye Gouge**
  - Hit Chance: -20%
  - Effect: Opponent -20% next turn
  - Special: Reputation loss

- **Groin Strike**
  - Hit Chance: -30%
  - Damage: STB + 4
  - Special: Male opponents only

## Combat Flow

### Turn Structure
1. Initiative determination
2. Action declaration
3. Resolution in speed order
4. Effect application
5. Position adjustment

### Multiple Opponents
- -10% per additional opponent
- Must declare targets
- Can split actions
- Defensive penalties

## Technical Implementation

### Brawling State
```typescript
interface BrawlingState {
  isGrappled: boolean;
  isProne: boolean;
  currentHold: string | null;
  temporaryModifiers: BrawlingModifier[];
  lastAction: BrawlingAction;
}

interface BrawlingAction {
  type: 'punch' | 'kick' | 'grapple' | 'throw';
  target: string;
  modifiers: number[];
  result?: BrawlingResult;
}
```

### Combat Resolution
```typescript
interface BrawlingResult {
  success: boolean;
  damage?: number;
  effects: BrawlingEffect[];
  message: string;
}
```

## Integration Points

### Combat System
- Turn management
- Damage resolution
- State tracking

For combat details, see [[combat-rules|Combat Rules]].

### Character Stats
- Attribute utilization
- Skill checks
- Experience gains

For character details, see [[character-creation|Character Creation]].

### AI Integration
- NPC behavior
- Action selection
- Narrative generation

For AI details, see [[../core-systems/ai-integration|AI Integration]].

## Special Conditions

### Environmental Effects
- Slippery Ground: -20% to all actions
- Confined Space: No kicks allowed
- Darkness: -30% to all actions
- Water: Special rules apply

### Status Effects
- Prone: -20% to actions, +20% to be hit
- Stunned: -40% to all actions
- Grappled: Limited action options
- Blinded: -50% to all actions

## Implementation Notes

### State Management
- Automatic status tracking
- Effect duration monitoring
- Position updates
- Modifier calculation

For technical details, see [[../core-systems/state-management|State Management]].

### Combat Display
- Status indicators
- Available actions
- Success chances
- Combat log

For UI details, see [[../features/_current/narrative-formatting|Narrative Formatting]].

## Related Documentation
- [[combat-rules|Combat Rules]]
- [[base-numbers|Base Numbers Calculation]]
- [[../core-systems/combat-system|Combat Implementation]]
- [[../technical-guides/testing|Combat Testing]]

Brawling is part of the [[combat-rules|Combat System]] and uses the same turn structure while providing unique close-combat options.