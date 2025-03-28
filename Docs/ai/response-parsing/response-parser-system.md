# AI Response Parser System

## Overview

The Response Parser system processes raw text outputs from AI models and transforms them into structured game data that can be used by the game engine. It handles multiple formats of AI responses and extracts metadata, narrative text, and structured objects.

## System Components

The Response Parser system consists of the following components:

### Main Response Parser
- **Location**: `app/services/ai/responseParser.ts`
- **Purpose**: Entry point for AI response processing
- **Responsibilities**:
  - Detects response type (character or game state update)
  - Delegates parsing to specialized functions
  - Handles error recovery and fallbacks

### Character Parser
- **Location**: `app/services/ai/parsers/characterParser.ts`
- **Purpose**: Handles creation and parsing of Character objects
- **Responsibilities**:
  - Parses JSON character data
  - Validates character attributes
  - Creates opponent characters with default values

### Player Decision Parser
- **Location**: `app/services/ai/parsers/playerDecisionParser.ts`
- **Purpose**: Processes player decision points from AI responses
- **Responsibilities**:
  - Validates decision data
  - Transforms raw data into structured PlayerDecision objects
  - Handles different formats of decision options

### Utility Components
- **JSON Extractor** (`app/services/ai/utils/jsonExtractor.ts`): Extracts JSON objects from mixed text responses
- **Raw Types** (`app/services/ai/types/rawTypes.ts`): Defines interfaces for unprocessed AI data and regex patterns

## Response Formats

The system handles multiple formats of AI responses:

### 1. JSON Character Data

Used for NPC generation, returns a complete character object:

```json
{
  "name": "John Smith",
  "attributes": {
    "speed": 12,
    "gunAccuracy": 14,
    "throwingAccuracy": 10,
    "strength": 11,
    "baseStrength": 11,
    "bravery": 8,
    "experience": 6
  }
}
```

### 2. Structured Text with Metadata

Used for game state updates, narrative progression:

```
The saloon doors swing open as you step inside. The piano player stops his tune, and all eyes turn to you.

LOCATION: Dusty Gulch Saloon
ACQUIRED_ITEMS: [Whiskey Bottle]
SUGGESTED_ACTIONS: [
  {"text": "Approach the bar", "type": "basic"},
  {"text": "Talk to the piano player", "type": "interaction"},
  {"text": "Leave the saloon", "type": "basic"}
]
```

### 3. Mixed Format with JSON Decision Points

Used for important player decision moments:

```
You find yourself at a critical juncture.

LOCATION: Crossroads

"playerDecision": {
  "prompt": "Which path will you take?",
  "options": [
    {
      "text": "Take the mountain pass",
      "impact": "Dangerous but faster route",
      "tags": ["risky", "adventure"]
    },
    {
      "text": "Follow the river valley",
      "impact": "Safer but longer journey",
      "tags": ["safe", "scenic"]
    }
  ],
  "importance": "significant",
  "context": "The weather is worsening, and you need to reach town soon."
}
```

## Parsing Process

1. The system first attempts to parse the input as JSON character data
2. If that fails, it processes the text to extract:
   - Location information
   - Acquired and removed items
   - Combat status and opponent details
   - Suggested player actions
   - Narrative text (cleaned of metadata)
   - Player decision points (if present)

3. The result is a structured `AIResponse` or `Character` object that can be used by the game engine

## Error Handling

The system implements robust error handling:

- JSON parsing errors are caught and alternate extraction methods are attempted
- Missing or invalid fields are handled with default values where appropriate
- Complete parsing failures fallback to treating the entire text as narrative
- Debug logs provide detailed information in non-production environments

## Integration Points

The Response Parser integrates with several other systems:

- **AI Service**: Provides raw AI model outputs to be parsed
- **Game State Manager**: Consumes the structured response data
- **Decision System**: Uses parsed player decisions to present choices to the player
- **Combat System**: Uses opponent data generated during parsing

## Usage Examples

### Basic Usage

```typescript
import { parseAIResponse } from './services/ai/responseParser';

// Example raw response from AI
const aiOutputText = "You enter the sheriff's office. The sheriff looks up from his desk.\n\nLOCATION: Sheriff's Office";

// Parse the response
const response = parseAIResponse(aiOutputText);

// Use the structured data
console.log(response.location.name); // "Sheriff's Office"
console.log(response.narrative); // "You enter the sheriff's office. The sheriff looks up from his desk."
```

### Handling Player Decisions

```typescript
// Check if the response contains a player decision
if (response.playerDecision) {
  // Present options to the player
  const options = response.playerDecision.options;
  
  // Display each option
  options.forEach(option => {
    console.log(`- ${option.text} (Impact: ${option.impact})`);
  });
}
```

## Performance Considerations

- The parser uses regular expressions for pattern matching, which can be expensive for large inputs
- JSON extraction implements progressive strategies to balance accuracy and performance
- Character name detection uses simple heuristics that may need adjustment for complex narratives
