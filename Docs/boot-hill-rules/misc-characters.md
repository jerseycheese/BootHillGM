---
title: NPC Character Reference
aliases: [NPC Chart, Character Types, Miscellaneous Characters]
tags: [rules, npcs, characters, reference]
created: 2024-12-28
updated: 2024-12-28
---

# NPC Character Reference

## Overview
This document provides baseline statistics and characteristics for various NPC types in Boot Hill v2. For implementation details, see [[../core-systems/ai-integration|AI NPC Generation]].

## Character Types

### Law Enforcement

#### Town Marshal/Deputies
| Attribute | Range |
|-----------|-------|
| Speed | Quick-Very Fast |
| Gun Accuracy | Fair-Excellent |
| Throwing Accuracy | Average-Good |
| Bravery | Brave-Fearless |
| Strength | Any |
| Experience | 1-5 |

#### Sheriff/Stage Guard
| Attribute | Range |
|-----------|-------|
| Speed | Average-Fast |
| Gun Accuracy | Above Average-Very Good |
| Throwing Accuracy | Average-Good |
| Bravery | Any |
| Strength | Any |
| Experience | 0-4 |

#### Deputy US Marshal/Gunfighter
| Attribute | Range |
|-----------|-------|
| Speed | Fast-Lightning |
| Gun Accuracy | Good-Crack Shot |
| Throwing Accuracy | Fair-Very Good |
| Bravery | Very Brave-Fearless |
| Strength | 15+ |
| Experience | 2-6 |

### Frontier Professionals

#### Detective/Drifter
| Attribute | Range |
|-----------|-------|
| Speed | Quick-Lightning |
| Gun Accuracy | Fair-Excellent |
| Throwing Accuracy | Any |
| Bravery | Above Average |
| Strength | Any |
| Experience | 1-4 |

#### Bounty Hunter
| Attribute | Range |
|-----------|-------|
| Speed | Fast+ |
| Gun Accuracy | Good+ |
| Throwing Accuracy | Fair+ |
| Bravery | Very Brave+ |
| Strength | Any |
| Experience | 3-8 |

### Military/Native

#### Cavalry Trooper
| Attribute | Range |
|-----------|-------|
| Speed | Any |
| Gun Accuracy | Fair-Excellent |
| Throwing Accuracy | Any |
| Bravery | Any |
| Strength | Any |
| Experience | 0-4 |

#### Indian
| Attribute | Range |
|-----------|-------|
| Speed | Above Average-Lightning |
| Gun Accuracy | Fair+ |
| Throwing Accuracy | Good+ |
| Bravery | Brave-Fearless |
| Strength | Any |
| Experience | 0-3 |

### Civilians

#### Cowboy
| Attribute | Range |
|-----------|-------|
| Speed | Any |
| Gun Accuracy | Above Average-Crack Shot |
| Throwing Accuracy | Fair-Excellent |
| Bravery | Any |
| Strength | Any |
| Experience | 0-2 |

#### Homesteader
| Attribute | Range |
|-----------|-------|
| Speed | Below Average-Quick |
| Gun Accuracy | Any |
| Throwing Accuracy | Any |
| Bravery | Any |
| Strength | Any |
| Experience | 0 |

#### Miner
| Attribute | Range |
|-----------|-------|
| Speed | Average-Fast |
| Gun Accuracy | Above Average-Very Good |
| Throwing Accuracy | Any |
| Bravery | Above Average+ |
| Strength | Any |
| Experience | 0-2 |

### Town Folk

#### Bartender
| Attribute | Range |
|-----------|-------|
| Speed | Above Average-Very Fast |
| Gun Accuracy | Fair-Excellent |
| Throwing Accuracy | Above Average-Excellent |
| Bravery | Brave+ |
| Strength | Any |
| Experience | 1-3 |

#### Gambler
| Attribute | Range |
|-----------|-------|
| Speed | Very Quick+ |
| Gun Accuracy | Fair+ |
| Throwing Accuracy | Fair-Excellent |
| Bravery | Any |
| Strength | Any |
| Experience | 0-4 |

#### Bank Teller
| Attribute | Range |
|-----------|-------|
| Speed | Any |
| Gun Accuracy | Above Average-Very Good |
| Throwing Accuracy | Any |
| Bravery | Any |
| Strength | Any |
| Experience | 0-2 |

#### Merchant/Clerk
| Attribute | Range |
|-----------|-------|
| Speed | Slow-Quick |
| Gun Accuracy | Any |
| Throwing Accuracy | Any |
| Bravery | Any |
| Strength | Any |
| Experience | 0 |

#### Saloon Girl
| Attribute | Range |
|-----------|-------|
| Speed | Below Avg.-Very Quick |
| Gun Accuracy | Any |
| Throwing Accuracy | Any |
| Bravery | Any |
| Strength | 13+ |
| Experience | 0-1 |

## Technical Implementation

### NPC Generation
```typescript
interface NPCTemplate {
  type: string;
  attributes: {
    speed: AttributeRange;
    gunAccuracy: AttributeRange;
    throwingAccuracy: AttributeRange;
    bravery: AttributeRange;
    strength: AttributeRange;
    experience: Range;
  };
  equipment?: EquipmentTemplate[];
  specialAbilities?: string[];
}
```

### Integration Points
- [[../core-systems/ai-integration|AI NPC Generation]]
- [[../core-systems/state-management|State Management]]
- [[CampaignRules|Campaign System]]

## Usage Guidelines

### Character Creation
Use this reference in conjunction with [[CharacterCreation|Character Creation Rules]] for NPC generation.

### Equipment Selection
For standard equipment loadouts, see [[Equipment|Equipment Guide]].

### Combat Statistics
For combat-related calculations, see [[BaseNumbersCalculation|Base Numbers Calculation]].

## Related Documentation
- [[../ai/prompt-engineering/character-creation|NPC Generation Prompts]]
- [[../features/_current/narrative-formatting|NPC Dialogue Formatting]]
- [[../technical-guides/testing|NPC Testing Guidelines]]