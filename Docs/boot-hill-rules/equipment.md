---
title: Equipment Price Chart
aliases: [Equipment List, Price List, Boot Hill Equipment Guide, Equipment Reference]
tags: [rules, equipment, boot-hill-v2, prices, inventory, reference]
created: 2024-12-28
updated: 2024-12-28
---

# Equipment Guide

## Overview
This document lists available equipment and prices in Boot Hill v2. For implementation details, see [[../features/_current/inventory-interactions|Inventory System]].

## Weapons

### Handguns
| Item | Abbreviation | Cost | Availability | Weapon Speed |
|------|--------------|------|--------------|--------------|
| Hunting Knife | KN | $ 1.00 | | Average |
| Single Shot Derringer | 1D | $ 5.00 | | Average |
| Two-Shot Derringer | 2D | $ 15.00 | after 1870 | Average |
| Cap & Ball Revolver (6 shot) | CBR | $ 20.00 | | Below Average |
| Single Action Revolver (6 shot) | SAR6 | $ 30.00 | after 1869 | Fast |
| Single Action Revolver (5 shot) | SAR5 | $ 26.00 | after 1869 | Fast |
| Double Action Revolver (6 shot) | DAR6 | $ 28.00 | after 1869 | Average |
| Double Action Revolver (5 shot) | DAR5 | $ 25.00 | after 1869 | Average |
| Fast Draw Revolver (6 shot)** | FDR6 | $ 40.00 | after 1870 | Very Fast |
| Fast Draw Revolver (5 shot)** | FDR5 | $ 35.00 | after 1870 | Very Fast |
| Long Barrel Revolver (6 shot) | LBR | $ 35.00 | after 1870 | Below Average |

### Long Guns
| Item | Abbreviation | Cost | Availability | Weapon Speed |
|------|--------------|------|--------------|--------------|
| Shotgun (single barrel) | 1SG | $ 20.00 | | Slow |
| Shotgun (double barrel) | 2SG | $ 30.00 | | Slow |
| Repeating Shotgun (6 shot) | 6SG | $ 75.00 | after 1885 | Slow |
| Scatter Gun (double barrel) | SCG | $ 40.00 | | Below Average |
| Civil War Type Repeating Rifle (7 shot) | CWR | $ 25.00 | | Slow |
| Civil War Type Repeating Carbine (7 shot) | CWC | $ 20.00 | | Slow |
| Repeating Rifle (15 shot) | 15R | $ 50.00 | after 1872 | Slow |
| Repeating Rifle (9 shot) | 9R | $ 40.00 | after 1872 | Slow |
| Repeating Rifle (6 shot) | 6R | $ 30.00 | after 1872 | Slow |
| Repeating Carbine (12 shot) | 12C | $ 48.00 | after 1872 | Slow |
| Repeating Carbine (9 shot) | 9C | $ 38.00 | after 1872 | Slow |
| Repeating Carbine (6 shot) | 6C | $ 28.00 | after 1872 | Slow |
| "Buffalo" Rifle (1 shot) | BR | $ 30.00 | | Very Slow |
| "Army" Rifle (1 shot) | AR | $ 20.00 | | Very Slow |

** Includes holster and belt in price

For weapon details, see [[weapons-chart|Weapons Reference]].

## Ammunition and Accessories
| Item | Cost | Notes |
|------|------|-------|
| Ammunition (except Shotgun loads) | $ 2.00 per box of 100 | Standard rounds |
| Shotgun loads | $ 2.00 per box of 25 | Buckshot |
| Holster & Gun Belt | $ 5.00 | Weapon carry |
| Rifle Sheath | $ 4.00 | Long gun storage |

## Transportation

### Horses
| Type | Cost | Notes |
|------|------|-------|
| Poor horse | $ 20.00 | Basic mount |
| Fair horse | $ 50.00 | Standard quality |
| Good horse | $100.00 | Superior mount |
| Excellent horse | $150.00 | Premium quality |
| Mule | $ 20.00 | Pack animal |
| Oxen | $ 25.00 | Draft animal |

### Tack and Equipment
| Item | Cost | Notes |
|------|------|-------|
| Saddle, Bridle & Pads | $ 40.00 | Complete set |
| Basic Saddle | $ 15.00 | Riding only |
| Bridle | $ 2.00 | Horse control |
| Saddlebags | $ 4.00 | Storage |

## Personal Equipment

### Clothing
| Item | Cost | Notes |
|------|------|-------|
| Basic Outfit | $ 5.00 | Standard clothing |
| Heavy Coat | $ 8.00 | Weather protection |
| Boots | $ 3.00 | Sturdy footwear |
| Hat | $ 1.00 | Sun protection |

### Tools
| Item | Cost | Notes |
|------|------|-------|
| Canteen | $ 0.50 | Water storage |
| Rope (50') | $ 1.00 | Utility item |
| Field Glasses | $ 8.00 | Observation |
| Pocket Watch | $ 5.00 | Time keeping |

## Special Equipment

### Professional Tools
| Item | Cost | Notes |
|------|------|-------|
| Doctor's Kit | $ 25.00 | Medical supplies |
| Lockpicks | $ 10.00 | Security tools |
| Mining Tools | $ 15.00 | Prospecting gear |

## Technical Implementation

### Equipment Properties
```typescript
interface EquipmentItem {
  name: string;
  abbreviation?: string;
  type: 'weapon' | 'ammo' | 'clothing' | 'tool' | 'transport' | 'special';
  price: number;
  weight: number;
  availability?: {
    startYear?: number;
    endYear?: number;
  };
  properties: string[];
  effects?: ItemEffect[];
}
```

### Integration Points
- [[../core-systems/state-management|State Management]]
- [[../core-systems/combat-system|Combat System]]
- [[../features/_current/inventory-interactions|Inventory System]]

## Usage Guidelines

### Starting Equipment
- Characters begin with $150.00
- Must purchase essential items
- Consider role requirements
- Balance weapons and gear

For character creation details, see [[character-creation|Character Creation Guide]].

### Combat Equipment
- Weapon selection affects combat options
- Ammunition tracking is automatic
- Equipment affects movement
- Some items provide combat bonuses

For combat rules, see [[combat-rules|Combat Rules]].

## Related Documentation
- [[weapons-chart|Weapons Reference]]
- [[../features/_current/inventory-interactions|Inventory System]]
- [[../core-systems/combat-system|Combat Implementation]]
- [[../technical-guides/testing|Equipment Testing]]