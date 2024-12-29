---
title: Boot Hill v2 Rules Training Data
aliases: [Rules Training Data, Game Rules AI Training]
tags: [ai, training-data, rules, boot-hill]
created: 2024-12-28
updated: 2024-12-28
---

# Boot Hill v2 Rules Training Data

This document outlines the training data structure and content used to train the AI system on Boot Hill v2 rules.

## Data Structure

### Core Rules Categories
```json
{
  "categories": [
    "character_creation",
    "combat_system",
    "equipment",
    "game_mechanics",
    "campaign_rules"
  ]
}
```

## Training Data Sets

### Character Creation
```json
{
  "character_creation": {
    "attributes": {
      "speed": "Roll 3d6 for base speed",
      "gun_accuracy": "Roll 3d6 for shooting accuracy",
      "throwing_accuracy": "Roll 3d6 for throwing accuracy",
      "strength": "Roll 3d6 for physical strength",
      "brawling": "Roll 3d6 for hand-to-hand combat"
    },
    "modifiers": {
      "professional": "+1 to chosen skill",
      "gunfighter": "+2 to gun accuracy",
      "brawler": "+2 to brawling"
    }
  }
}
```

### Combat System
```json
{
  "combat_system": {
    "initiative": "Based on Speed attribute",
    "actions": ["move", "aim", "shoot", "reload", "take_cover"],
    "modifiers": {
      "range": ["point_blank", "short", "medium", "long"],
      "cover": ["none", "partial", "full"],
      "movement": ["stationary", "walking", "running"]
    }
  }
}
```

### Equipment Rules
```json
{
  "equipment": {
    "weapons": {
      "categories": ["pistols", "rifles", "shotguns", "melee"],
      "attributes": ["damage", "range", "rate_of_fire", "reload_time"]
    },
    "armor": {
      "types": ["none", "light", "heavy"],
      "effects": ["damage_reduction", "speed_penalty"]
    }
  }
}
```

## Training Examples

### Combat Scenarios
```json
{
  "scenarios": [
    {
      "situation": "Gunfight at short range",
      "conditions": {
        "range": "short",
        "cover": "partial",
        "movement": "stationary"
      },
      "expected_outcome": {
        "modifiers": {
          "accuracy": -2,
          "damage": "standard"
        }
      }
    }
  ]
}
```

### Character Interactions
```json
{
  "interactions": [
    {
      "type": "negotiation",
      "factors": ["reputation", "charisma", "current_situation"],
      "possible_outcomes": ["peaceful", "hostile", "neutral"]
    }
  ]
}
```

## Data Processing

### Preprocessing Steps
1. Rule normalization
2. Context embedding
3. Relationship mapping
4. Validation checks

### Data Augmentation
- Scenario generation
- Variation creation
- Edge case handling

## Integration Points

### Core Systems
- [[../game-master-logic|Game Master Logic]]
- [[../../core-systems/combat-system|Combat System]]
- [[../../core-systems/state-management|State Management]]

### Game Rules
- [[../../boot-hill-rules/combat-rules|Combat Rules]]
- [[../../boot-hill-rules/character-creation|Character Creation]]
- [[../../boot-hill-rules/equipment|Equipment Rules]]

## Training Guidelines

### Data Quality
- Accuracy verification
- Consistency checking
- Edge case coverage
- Rule interaction validation

### Model Training
- Context window optimization
- Token efficiency
- Response accuracy
- Rule adherence

## Related Documentation
- [[../prompt-engineering/core-prompts|Core Prompts]]
- [[../prompt-engineering/combat|Combat Prompts]]
- [[../prompt-engineering/character-creation|Character Creation Prompts]]
- [[western-themes|Western Themes Training Data]]