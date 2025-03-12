# Player Decision Relevance System

## Overview
The Decision Relevance System allows the AI to remember and reference the player's past decisions when generating narrative content. This creates a more cohesive narrative experience where choices have lasting impact on the story.

## Key Components

### 1. Decision Scoring
The system scores each past decision based on:
- **Recency**: More recent decisions score higher
- **Context Matching**: Decisions related to current characters, locations and themes score higher
- **Importance**: Critical or significant decisions receive priority
- **Impact**: Decisions with strong narrative impacts are emphasized


### 2. Context Generation
For each narrative request, the system:
- Analyzes the current game context (location, characters, themes)
- Filters the decision history to find the most relevant decisions
- Creates a compact representation optimized for AI token usage
- Includes this context in AI prompts

### 3. AI Integration
The game service now:
- Accepts narrative context with decision history
- Includes relevant decisions in AI prompts

## Usage Example

```typescript
// In your game session component:
import { useNarrativeContext } from '../hooks/useNarrativeContext';
import { getAIResponse } from '../services/ai/gameService';

function GameSession() {
  const { narrativeContext } = useNarrativeContext();
  
  const handlePlayerAction = async (action) => {
    // Pass narrativeContext to include decision history
    const response = await getAIResponse(
      action,
      journalContext,
      inventory,
      storyProgressionContext,
      narrativeContext  // Contains decision history
    );
    
    // Process response...
  };
  
  // ...
}
```

## Configuration

The decision relevance scoring can be adjusted through the `RelevanceConfig` interface:

```typescript
const customConfig: RelevanceConfig = {
  recencyWeight: 0.4,    // Increase focus on recent decisions
  tagMatchWeight: 0.3,   // Reduce context matching emphasis
  importanceWeight: 0.2, // Keep importance the same
  impactWeight: 0.1,     // Keep impact weight the same
  maxAge: 30 * 24 * 60 * 60 * 1000, // Extend to 30 days
  minRelevanceScore: 0.2 // Lower threshold to include more decisions
};
```
- Instructs the AI to reference past decisions appropriately
## Decision Scoring Algorithm

The Decision Relevance System employs a scoring algorithm to dynamically assess the relevance of past player decisions to the current game context. This algorithm considers several factors to determine a relevance score for each decision, which is then used to filter and prioritize the most relevant decisions for inclusion in the AI prompt.

### Scoring Factors

The relevance score is calculated based on a weighted combination of the following factors:

1. **Recency:**  Recent decisions are considered more relevant as they are more likely to have a direct impact on the current narrative. The recency score is calculated based on the time elapsed since the decision was made, with a higher score for more recent decisions and a score of 0 for decisions older than the `maxAge` configured in `RelevanceConfig`.

2. **Tag Match:** Decisions tagged with terms that match the current game context (e.g., location, characters, themes) are considered more relevant. The tag match score is calculated based on the number and quality of matching tags between the decision and the current context tags. A more sophisticated scoring logic is used to give higher scores for full tag matches and partial matches when more tags are present.

3. **Importance:**  Decisions can be assigned a static importance score (0-10) at the time of creation, reflecting their inherent significance in the game narrative. This importance score is normalized to a 0-1 scale and contributes to the overall relevance score.

4. **Impact:** Decisions that have a significant narrative impact (e.g., major consequences, character relationship changes) are considered more relevant. The impact score is calculated based on the severity of the impacts associated with the decision, if impact data is available.

### Weighting Rationale

The relevance score is calculated as a weighted sum of these factors, using the weights defined in the `RelevanceConfig` interface. The default weights are configured as follows:

- `recencyWeight`: 0.3 (30%) - Moderate emphasis on recency.
- `tagMatchWeight`: 0.4 (40%) - Highest emphasis on context relevance through tag matching.
- `importanceWeight`: 0.2 (20%) - Moderate emphasis on pre-defined decision importance.
- `impactWeight`: 0.1 (10%) - Lower emphasis on impact severity, as impact data may not always be available or precisely quantified.

These weights can be customized via the `RelevanceConfig` to adjust the system's behavior and prioritize different relevance factors based on specific game design needs.

### Formulas

The relevance score is calculated using the following formulas:

- **Recency Score:** 
  ```
  recencyScore = age > config.maxAge ? 0 : 1 - (age / config.maxAge)
  ```
  where `age` is the time elapsed since the decision and `config.maxAge` is the maximum age to consider.

- **Tag Match Score:** (Simplified representation)
  ```
  tagMatchScore = (matchingTagsCount / totalDecisionTags) * tagCountFactor
  ```
  where `matchingTagsCount` is the number of tags matching the current context, `totalDecisionTags` is the total number of tags for the decision, and `tagCountFactor` is a factor that increases with the number of decision tags (up to a limit).

- **Importance Score:**
  ```
  importanceScore = relevanceScore / 10 
  ```
  where `relevanceScore` is the static relevance score (0-10) assigned to the decision.

- **Impact Score:** (Simplified representation)
  ```
  impactScore = totalImpactValue / normalizationFactor
  ```
  where `totalImpactValue` is the sum of absolute values of impacts, and `normalizationFactor` is a value used to normalize the score to a 0-1 scale.

- **Final Relevance Score:**
  ```
  relevanceScore = (recencyScore * config.recencyWeight) + 
                   (tagMatchScore * config.tagMatchWeight) +
                   (importanceScore * config.importanceWeight) +
                   (impactScore * config.impactWeight)
  ```

### Configuration

## System Diagram

```mermaid
graph LR
    PlayerInput[Player Input] --> GameService
    GameService --> DecisionRecorder[Decision Recorder]
    DecisionRecorder --> DecisionHistory[Decision History];
    GameService --> ContextGenerator[Context Generator];
    ContextGenerator --> CurrentContext[Current Context Tags];
    DecisionHistory --> RelevanceScorer[Relevance Scorer];
    CurrentContext --> RelevanceScorer;
    RelevanceScorer --> RelevantDecisions[Relevant Decisions];
    RelevantDecisions --> PromptBuilder[AI Prompt Builder];
    CurrentContext --> PromptBuilder;
    GameService --> PromptBuilder;
    PromptBuilder --> AIModel[AI Model];
    AIModel --> AIResponse[AI Response (Narrative, Decisions, etc.)];
    AIResponse --> NarrativeDisplay[Narrative Display];
    DecisionRecorder --> NarrativeDisplay; 
    style PlayerInput fill:#f9f,stroke:#333,stroke-width:2px
    style AIModel fill:#ccf,stroke:#333,stroke-width:2px
    style NarrativeDisplay fill:#cfc,stroke:#333,stroke-width:2px
    style DecisionHistory fill:#eee,stroke:#333,stroke-width:2px
    linkStyle 0,1,2,3,4,5,6,7,8,9 stroke:#555,stroke-width:1px
```
