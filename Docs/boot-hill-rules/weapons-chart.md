---
title: Weapons Chart
aliases: [Weapon Statistics, Weapon Data, Boot Hill Weapons Guide, Firearms Reference]
tags: [rules, weapons, boot-hill-v2, combat, equipment, reference]
created: 2024-12-28
updated: 2024-12-28
---

# Weapons Reference

## Overview
The weapons types in BOOT HILL are representative of the various weapons used in the West from the times following the Civil War until about 1900. Each type of weapon can be employed up to its maximum range although effectiveness will decrease as the target increases in range.

## Weapons Chart

| Weapon                | Short   | Medium    | Long     | Extreme    | Rate of Fire | Reload Rate | Weapon Speed  |
|-----------------------|---------|-----------|----------|------------|--------------|-------------|---------------|
| Knife or Tomahawk     | 0 to 1  | 1+ to 2   | 2+ to 3  | 3+ to 4    | 1            | -           | Average       |
| Bow                   | 0 to 7  | 7+ to 18  | 18+ to 30| 30+ to 50  | 1            | 1           | Below Average |
| Lance                 | 0 to 2  | 2+ to 5   | 5+ to 10 | 10+ to 15  | 1            | -           | Below Average |
| Derringer             | 0 to 1  | 1+ to 3   | 3+ to 6  | 6+ to 10   | 1*           | 2           | Average       |
| Cap & Ball Revolver   | 0 to 3  | 3+ to 7   | 7+ to 12 | 12+ to 26  | 3            | 1           | Below Average |
| Single Action Revolver| 0 to 4  | 4+ to 10  | 10+ to 20| 20+ to 40  | 3            | 3           | Fast          |
| Double Action Revolver| 0 to 4  | 4+ to 10  | 10+ to 20| 20+ to 40  | 3            | 3           | Average       |
| Fast Draw Revolver    | 0 to 3  | 3+ to 7   | 7+ to 15 | 15+ to 30  | 3            | 3           | Very Fast     |
| Long Barrel Revolver  | 0 to 6  | 6+ to 12  | 12+ to 25| 25+ to 45  | 1            | 3           | Below Average |
| Scatter Gun           | 0 to 2  | 2+ to 4   | 4+ to 8  | 8+ to 15   | 1*           | 2           | Below Average |
| Shotgun               | 0 to 6  | 6+ to 12  | 12+ to 18| 18+ to 36  | 1*           | 2           | Slow          |
| Civil War Rifle       | 0 to 15 | 15+ to 30 | 30+ to 60| 60+ to 120 | 1            | 2           | Slow          |
| Civil War Carbine     | 0 to 12 | 12+ to 24 | 24+ to 50| 50+ to 100 | 1            | 2           | Slow          |
| Buffalo Rifle         | 0 to 30 | 30+ to 60 | 60+ to 120| 120+ to 300| 1            | 1           | Very Slow     |

## Weapon Speed Modifiers
* Very Slow: -10
* Slow: -5
* Below Average: 0
* Average: +5
* Fast: +8
* Very Fast: +10

## Detailed Weapon Statistics

### Handguns

#### Colt Army (.44)
| Stat | Value | Notes |
|------|-------|-------|
| Range | 50 yds | Maximum effective |
| Shots | 6 | Cylinder capacity |
| Reload | 3 turns | Full reload time |
| Damage | 2d10 | Base damage |
| Malfunction | 00 | Jam on roll |

#### Remington (.44)
| Stat | Value | Notes |
|------|-------|-------|
| Range | 45 yds | Maximum effective |
| Shots | 6 | Cylinder capacity |
| Reload | 3 turns | Full reload time |
| Damage | 2d10 | Base damage |
| Malfunction | 00 | Jam on roll |

#### Derringer (.41)
| Stat | Value | Notes |
|------|-------|-------|
| Range | 15 yds | Maximum effective |
| Shots | 2 | Double barrel |
| Reload | 2 turns | Full reload time |
| Damage | 1d10 | Base damage |
| Malfunction | 98-00 | Higher jam chance |

### Rifles

#### Winchester '73 (.44-40)
| Stat | Value | Notes |
|------|-------|-------|
| Range | 150 yds | Maximum effective |
| Shots | 15 | Magazine capacity |
| Reload | 1/shot | Individual loading |
| Damage | 3d10 | Base damage |
| Malfunction | 99-00 | Reliable action |

#### Springfield (.45-70)
| Stat | Value | Notes |
|------|-------|-------|
| Range | 200 yds | Maximum effective |
| Shots | 1 | Single shot |
| Reload | 1 turn | Quick reload |
| Damage | 4d10 | Base damage |
| Malfunction | 00 | Very reliable |

### Shotguns

#### Double Barrel (12g)
| Stat | Value | Notes |
|------|-------|-------|
| Range | 20 yds | Maximum effective |
| Shots | 2 | Double barrel |
| Reload | 2 turns | Full reload time |
| Damage | 4d10 | Close range |
| Spread | +20% | Hit bonus close |

### Shotgun/Scatter Gun Effects Table
| Die Roll | Scatter Gun Range | | | | Shotgun Range | | | |
|----------|--------------------|---|---|---|----------------|---|---|---|
| | Short | Med. | Long | Ext. | Short | Med. | Long | Ext. |
| 1 | 1 | 1 | 0 | 0 | 1 | 1 | 1 | 0 |
| 2 | 1 | 1 | 0 | 0 | 2 | 1 | 1 | 0 |
| 3 | 1 | 1 | 1 | 0 | 2 | 1 | 1 | 1 |
| 4 | 1 | 1 | 1 | 0 | 2 | 2 | 1 | 1 |
| 5 | 2 | 1 | 1 | 1 | 3 | 2 | 1 | 1 |
| 6 | 2 | 1 | 1 | 1 | 3 | 2 | 1 | 1 |
| 7 | 2 | 1 | 1 | 1 | 3 | 2 | 1 | 1 |
| 8 | 2 | 2 | 1 | 1 | 4 | 2 | 1 | 1 |
| 9 | 3 | 2 | 1 | 1 | 4 | 3 | 1 | 1 |
| 10 | 3 | 2 | 1 | 1 | 4 | 3 | 2 | 1 |

## Technical Implementation

### Weapon Properties
```typescript
interface Weapon {
  type: 'handgun' | 'rifle' | 'shotgun';
  name: string;
  caliber: string;
  range: {
    pointBlank: number;
    short: number;
    medium: number;
    long: number;
    extreme: number;
  };
  damage: DiceRoll;
  capacity: number;
  reloadTime: number;
  malfunction: number[];
}
```

### Range Modifiers
```typescript
interface RangeModifiers {
  pointBlank: number;  // +20%
  short: number;       // +10%
  medium: number;      // +0%
  long: number;        // -20%
  extreme: number;     // -40%
}
```

## Combat Integration

### Action Types
- Aim: Improve accuracy
- Fire: Attack with weapon
- Reload: Replenish ammunition
- Clear: Fix malfunction

For combat details, see [[combat-rules|Combat Rules]].

### Special Rules
- Fanning: Rapid fire technique
- Two Guns: Dual wielding
- Called Shots: Aimed attacks
- Quick Draw: Fast deployment

## Related Systems

### Inventory Management
- Ammunition tracking
- Weapon condition
- Maintenance requirements

For inventory details, see [[equipment|Equipment Rules]].

### Combat Implementation
- [[../core-systems/combat-system|Combat System]]
- [[../features/_current/inventory-interactions|Inventory System]]
- [[../core-systems/state-management|State Management]]

## Related Documentation
- [[combat-rules|Combat Rules]]
- [[equipment|Equipment Rules]]
- [[base-numbers|Base Numbers Calculation]]
- [[../technical-guides/testing|Weapon Testing Guide]]