# AI Response Formats

This document outlines the expected formats for AI responses and how they are processed by the system.

## Standard Response Format

The most common format is a narrative text with metadata markers:

```
[Narrative text content]

LOCATION: [Location name]
ACQUIRED_ITEMS: [Item1, Item2, ...]
REMOVED_ITEMS: [Item1, Item2, ...]
SUGGESTED_ACTIONS: [
  {"text": "Action description", "type": "basic|combat|interaction"},
  {"text": "Another action", "type": "basic|combat|interaction"}
]
```

### Metadata Markers

Each marker serves a specific purpose:

| Marker | Description | Format |
|--------|-------------|--------|
| `LOCATION` | Current location | Text string |
| `ACQUIRED_ITEMS` | Items gained | Comma-separated list or JSON array |
| `REMOVED_ITEMS` | Items lost | Comma-separated list or JSON array |
| `SUGGESTED_ACTIONS` | Possible player actions | JSON array of action objects |
| `COMBAT` | Combat opponent | Text string (opponent name) |

### Action Types

Suggested actions have specific types:

- `basic`: General movement and interaction
- `combat`: Combat-related actions
- `interaction`: Character interactions

## Character Generation Format

When generating NPCs, the AI returns a JSON object:

```json
{
  "name": "Character Name",
  "attributes": {
    "speed": 10,
    "gunAccuracy": 12,
    "throwingAccuracy": 8,
    "strength": 11,
    "baseStrength": 11,
    "bravery": 9,
    "experience": 5
  }
}
```

### Required Attributes

All character objects must include the following attributes:

- `speed`: Movement and reaction speed (0-20)
- `gunAccuracy`: Accuracy with firearms (0-20)
- `throwingAccuracy`: Accuracy with thrown weapons (0-20)
- `strength`: Physical strength (0-20)
- `baseStrength`: Natural strength without modifiers (0-20)
- `bravery`: Courage under pressure (0-20)
- `experience`: Overall experience level (0-20)

## Player Decision Format

For decision points, the AI includes a `playerDecision` object:

```json
"playerDecision": {
  "prompt": "Decision description",
  "options": [
    {
      "text": "Option 1 description",
      "impact": "Consequence description",
      "tags": ["tag1", "tag2"]
    },
    {
      "text": "Option 2 description",
      "impact": "Consequence description",
      "tags": ["tag3", "tag4"]
    }
  ],
  "importance": "critical|significant|moderate|minor",
  "context": "Additional decision context",
  "characters": ["Character1", "Character2"]
}
```

### Decision Fields

| Field | Required | Description |
|-------|----------|-------------|
| `prompt` | Yes | The main decision question |
| `options` | Yes | Array of at least 2 choices |
| `importance` | No | Narrative importance level |
| `context` | No | Additional context information |
| `characters` | No | Characters involved in the decision |

### Option Fields

| Field | Required | Description |
|-------|----------|-------------|
| `text` | Yes | The option text shown to player |
| `impact` | Yes | Description of consequences |
| `tags` | No | Categorization tags |

## Mixed Format Responses

Some responses contain both narrative text and structured JSON:

```
[Narrative text]

LOCATION: [Location name]

"playerDecision": {
  [Decision JSON]
}
```

The system uses a multi-step process to parse these mixed formats, extracting both the narrative elements and structured data.

## Processing Format Variations

The response parser handles several variations:

1. **Inline metadata**: Metadata embedded within paragraphs
2. **Character dialog blocks**: Character names followed by their actions
3. **Missing markers**: Incomplete metadata that defaults to reasonable values
4. **Malformed JSON**: Attempt to recover from JSON syntax errors

## Example Responses

### Standard Narrative Example

```
You enter the dusty saloon. The bartender nods in your direction.

LOCATION: Silver Gulch Saloon
SUGGESTED_ACTIONS: [
  {"text": "Approach the bar", "type": "basic"},
  {"text": "Look around the room", "type": "basic"},
  {"text": "Talk to the bartender", "type": "interaction"}
]
```

### Combat Initiation Example

```
A shadowy figure steps out from the alley, revolver drawn.

LOCATION: Dark Alley
COMBAT: Mysterious Gunslinger
SUGGESTED_ACTIONS: [
  {"text": "Draw your weapon", "type": "combat"},
  {"text": "Try to talk your way out", "type": "interaction"},
  {"text": "Dive for cover", "type": "combat"}
]
```

### Decision Point Example

```
The sheriff offers you a deputy badge.

LOCATION: Sheriff's Office

"playerDecision": {
  "prompt": "Do you accept the sheriff's offer to become a deputy?",
  "options": [
    {
      "text": "Accept the badge",
      "impact": "You'll gain authority but also responsibility",
      "tags": ["lawful", "commitment"]
    },
    {
      "text": "Decline politely",
      "impact": "You'll maintain your freedom but may miss opportunities",
      "tags": ["neutral", "independence"]
    },
    {
      "text": "Laugh at the offer",
      "impact": "You'll offend the sheriff but impress outlaws",
      "tags": ["rude", "reputation"]
    }
  ],
  "importance": "significant",
  "characters": ["Sheriff Wilson"]
}
```
