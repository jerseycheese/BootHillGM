---
title: Campaign Rules
aliases: [Campaign System, Long-term Play]
tags: [rules, campaign, core]
created: 2024-12-28
updated: 2024-12-28
---

# Campaign Rules

## Overview
These rules govern long-term play in Boot Hill v2, including character advancement, town management, and campaign progression. For implementation details, see [[../core-systems/state-management|State Management]].

## 1. Healing Wounds
- Non-brawling wounds: Heal 1 point per week per wound
- Brawling damage: Heal 1 point per hour of rest
- Special penalties due to certain wounds no longer in effect after wounds are more than 50% healed

## 2. Aging & Physical Characteristics
- Determine character's age: Roll d100 three times for 1-10 result sum rolls add 12 (age range 15-42)
- Age effects on abilities:
  - Speed: Add 1% to SPEED percentile roll for each game year survived up to age 25; after age 35 subtract 1% per year
  - Accuracy: Add 1% for every other game year survived up to age 25; subtract 1% every other game year after age 40
  - Bravery: No effect
  - Strength: Add 2% for each game year survived up to age 25; subtract 2% each year after age 35

## 3. Campaign Map Movement
Use hex map with 2 miles per hex:
- Men on foot: 1 hex per hour for up to 16 hours then 8 hours rest
- Men on foot running: 2 hexes per hour for 3 hours then 1 hour rest
- Mounted men: 2 hexes per hour for up to 16 hours then 8 hours rest

### Strategic Mounted Movement Table
| Horse Type | 1st Hour | 2nd Hour | 3rd Hour | 4th Hour | 5th Hour |
|------------|----------|----------|----------|----------|----------|
| Excellent | 8 | 6 | 4 | 2 | must rest |
| Good | 7 | 5 | 3 | 1 | must rest |
| Fair | 6 | 4 | 2 | 1 | must rest |
| Poor | 5 | 3 | 1 | must rest | — |

## 4. Posses
- Assemble 1-10 additional persons per hour of waiting
- Start pursuit one hex behind on campaign map
- Follow TRACKING rules when more than one hex behind

## 5. Tracking
Use the following table when entering each hex:

| Terrain | Chance to follow correct trail | Chance to follow incorrect trail | Chance that the trail ends | Chance to notice lost trail if recrossed |
|---------|-------------------------------|--------------------------------|---------------------------|----------------------------------------|
| Normal | 01-90 | 91-95 | 96-00 | 01-10 |
| Hard or rocky | 01-75 | 76-80 | 81-00 | 01-02 |
| Settled area | 01-90 | 91-99 | 00 | 01-15 |
| Large town | 01-60 | 61-70 | 71-00 | 01-05 |

Additional tracking rules:
1. If trail ends spend one hour trying to pick it up again
2. Scouts and experienced trackers: -5 to percentile rolls
3. Indian scouts tracking Indians: Additional -5 to die roll (except in settled areas/towns)
4. If tracking Indians: +5 to die roll (except in settled areas/towns)
5. If trail crosses stream: Lose one hex of movement
6. If it rains: Trail automatically lost

## 6. Cost of Living

### Clothing
- Hat: $2.00
- Shirt: $1.00
- Vest: $1.00
- Trousers: $2.00
- Socks: 25¢ per pair
- Boots: $10.00
- Chaps: $5.00
- Spurs: $7.00 per pair

### Entertainment and Miscellaneous
- Tobacco: 10¢ per plug
- Whiskey: 10¢ per shot or $2.00 per bottle
- Beer: 5¢ per mug or glass
- Shave and haircut: 25¢
- Bath: 75¢ with fresh water $1.00

### Lodging
- Sleazy hotel: 25¢ per night
- Average hotel: 75¢ per night
- "Deluxe" hotel: $2.00 per night
- Corral space for horses: 25¢ per day
- Rooming house: $1.00 per day meals included

### Food
- Coffee: 30¢ per pound
- Bacon: 20¢ per pound
- Beef: 7¢ per pound
- Flour: 4¢ per pound
- Cheap meal: 25¢
- Mess kit: $2.00
- Canteen: $1.00
- Survival rations: $1.50 per day

### Wages and Salary
- Cowboy: $30.00 per month
- Cowboy foreman: $45.00 per month
- Lawmen: $75.00 per month plus $2.00 per arrest leading to conviction
- Deputies: $50.00 per month plus arrest bonus as above
- Bartender: $50.00 per month
- Hired gunfighter: $5.00 per day plus expenses

Note: A character can live cheaply for about $25.00 per month in town (two meals per day and lodging in a sleazy hotel).

## Technical Implementation

### Campaign State
```typescript
interface CampaignState {
  worldState: WorldState;
  playerState: PlayerState;
  timeState: TimeState;
  eventQueue: EventQueue;
  relationshipGraph: RelationshipNetwork;
}
```

### State Management
- Automatic saving
- State restoration
- History tracking
- Error recovery

For details, see [[../core-systems/state-management|State Management]].

## AI Integration

### Story Generation
- Dynamic plot creation
- NPC behavior
- Event generation
- Dialogue system

For AI details, see [[../core-systems/ai-integration|AI Integration]].

### World Simulation
- Population dynamics
- Economic simulation
- Political changes
- Environmental effects

## Journal System

### Record Keeping
- Event logging
- Character notes
- Quest tracking
- Relationship status

For journal details, see [[../core-systems/journal-system|Journal System]].

## Related Documentation
- [[game-overview|Game Overview]]
- [[../features/_current/journal-enhancements|Journal System]]
- [[../core-systems/state-management|State Management]]
- [[../ai/game-master-logic|AI Game Master Logic]]
- [[../technical-guides/testing|Campaign Testing]]
- [[misc-characters|NPC Reference]]