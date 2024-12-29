---
title: Observation and Sighting Rules
aliases: [Visibility Rules, Line of Sight]
tags: [rules, combat, visibility, core]
created: 2024-12-28
updated: 2024-12-28
---

# Observation and Sighting Rules

## Overview
These rules govern character visibility, observation, and targeting in Boot Hill v2. For implementation details, see [[../core-systems/combat-system|Combat System Implementation]].

## Character Facing

### Basic Rules
- All characters must indicate their facing for observation and sighting purposes
- A character's field of view is defined by a 90° arc in the direction they are facing
- Facing changes can be made during movement or as a free action

### Technical Implementation
```typescript
interface CharacterFacing {
  direction: number;  // 0-359 degrees
  fieldOfView: number;  // 90 degrees
  lastUpdateTime: number;
}
```

## Movement and Observation

### Movement Rules
- When moving, a character can indicate desired facing
- Arc of observation is determined from the midpoint of the move
- No penalty for observation while moving due to 10-second turn duration

### Special Cases
- Running affects observation checks
- Mounted movement has specific rules
- Terrain may affect observation

For movement details, see [[CombatRules|Combat Rules]].

## Visibility System

### Basic Visibility
- Characters can observe movement within their 90° arc
- Details may not be immediately noticeable
- Weather and lighting affect visibility
- Cover and concealment modify detection

### Environmental Effects
| Condition | Visibility Modifier |
|-----------|-------------------|
| Darkness | -40% |
| Fog | -20% |
| Rain | -10% |
| Dust | -30% |
| Smoke | -50% |

### Cover Types
| Cover | Protection |
|-------|------------|
| Light | 20% |
| Medium | 40% |
| Heavy | 60% |
| Full | 100% |

## Combat Sighting

### Target Acquisition
- A character may shoot at any target whose location they are aware of
- This includes anyone firing at the character
- Awareness can come from various sources:
  - Direct observation
  - Sound
  - Movement
  - Muzzle flash
  - Third-party information

### Surprise Rules
- Turning to fire at someone behind incurs a "total surprise" penalty
- Surprise modifiers stack with other penalties
- Recovery from surprise takes one full turn

For combat details, see [[CombatRules|Combat Rules]].

## Technical Implementation

### Visibility State
```typescript
interface VisibilityState {
  characterId: string;
  facing: CharacterFacing;
  visibleTargets: string[];
  environmentalModifiers: VisibilityModifier[];
  coverState: CoverState;
}

interface VisibilityModifier {
  type: 'weather' | 'lighting' | 'terrain' | 'special';
  value: number;
  duration?: number;
}
```

### Line of Sight
```typescript
interface LineOfSight {
  origin: Position;
  target: Position;
  distance: number;
  blocked: boolean;
  coverType?: string;
  modifiers: number[];
}
```

## Integration Points

### Combat System
- Target validation
- Range calculation
- Cover effects
- Surprise mechanics

For implementation details, see [[../core-systems/combat-system|Combat System]].

### AI Integration
- NPC awareness
- Target selection
- Tactical positioning
- Cover utilization

For AI details, see [[../core-systems/ai-integration|AI Integration]].

## Advanced Rules

### Hidden Movement
- Optional rules for stealth
- Detection mechanics
- Tracking system
- Ambush rules

### Special Conditions
- Night fighting
- Smoke effects
- Flash blindness
- Tunnel vision

## Implementation Notes

### Performance Considerations
- Efficient line of sight calculations
- Visibility state caching
- Update batching
- Memory optimization

### Error Handling
- Invalid facing validation
- Line of sight verification
- State consistency checks
- Recovery mechanisms

## Related Documentation
- [[CombatRules|Combat Rules]]
- [[../core-systems/combat-system|Combat Implementation]]
- [[../technical-guides/testing|Visibility Testing]]
- [[../features/_current/combat-modifiers|Combat Modifiers]]

## Usage Guidelines
The gamemaster (AI system) should use discretion in applying these rules to maintain game balance and realism. These rules form the foundation for all visibility-based mechanics in the game, from combat targeting to exploration and stealth.