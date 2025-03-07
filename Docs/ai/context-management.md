---
title: AI Context Management
aliases: [Narrative Context Optimization, Long-term AI Memory]
tags: [ai, narrative, documentation, technical]
created: 2025-03-06
updated: 2025-03-06
---

# AI Context Management

## Overview
This document outlines the approach for managing AI context in BootHillGM, with a particular focus on maintaining narrative coherence in long-running games. The context management system ensures that the AI has access to the most relevant information at all times, regardless of how long a game has been running.

## Key Challenges
- **Context Window Limitations**: LLMs have fixed context window sizes, limiting how much previous conversation can be included
- **Growing Narrative History**: As gameplay progresses, the amount of narrative history continuously grows
- **Relevance Determination**: Not all past events are equally relevant to the current situation
- **Lore Consistency**: Ensuring the AI doesn't contradict previously established facts
- **Response Quality**: Maintaining high-quality, coherent responses without overloading context

## Solution Architecture

### 1. Context Optimization System (#167)
The core of our approach is a context optimization system that intelligently selects the most relevant narrative elements to include in the AI's context window.

#### Scoring Mechanisms
```typescript
interface ContextElement {
  id: string;
  type: 'story_point' | 'decision' | 'lore' | 'variable';
  content: string;
  tags: string[]; // For topic-based filtering
  metadata: {
    timestamp: number;
    importance: number; // 1-10 scale
    location?: string;
    characters?: string[];
  };
}

// Calculate relevance score for each context element
function calculateRelevanceScore(
  element: ContextElement,
  currentContext: GameContext
): number {
  // Base score starts with importance
  let score = element.metadata.importance;
  
  // Recency bonus (more recent = higher score)
  const ageInHours = (Date.now() - element.metadata.timestamp) / (1000 * 60 * 60);
  score += Math.max(0, 10 - Math.log(ageInHours + 1));
  
  // Location relevance (if in same location, bonus points)
  if (element.metadata.location === currentContext.currentLocation) {
    score += 3;
  }
  
  // Character relevance (if involves current NPCs, bonus points)
  const characterOverlap = element.metadata.characters?.filter(
    char => currentContext.activeNPCs.includes(char)
  ).length || 0;
  score += characterOverlap;
  
  // Topic relevance (based on recent player interests)
  const topicOverlap = element.tags.filter(
    tag => currentContext.recentTopics.includes(tag)
  ).length;
  score += topicOverlap * 2;
  
  return score;
}
```

#### Token Budget Management
```typescript
const MAX_TOKENS = 3000; // Example max token limit

function optimizeContext(
  availableElements: ContextElement[],
  currentContext: GameContext,
  maxTokens: number = MAX_TOKENS
): string {
  // Score all elements
  const scoredElements = availableElements.map(element => ({
    element,
    score: calculateRelevanceScore(element, currentContext)
  }));
  
  // Sort by relevance score (descending)
  scoredElements.sort((a, b) => b.score - a.score);
  
  // Select elements until we hit token budget
  let tokenCount = 0;
  const selectedElements: ContextElement[] = [];
  
  for (const {element} of scoredElements) {
    const elementTokens = estimateTokenCount(element.content);
    if (tokenCount + elementTokens <= maxTokens) {
      selectedElements.push(element);
      tokenCount += elementTokens;
    } else {
      break;
    }
  }
  
  // Format selected elements into context string
  return formatContextElements(selectedElements);
}
```

### 2. Lore Management System (#168)
The lore management system ensures narrative consistency by tracking established facts about the game world.

#### Lore Structure
```typescript
interface LoreItem {
  id: string;
  category: 'character' | 'location' | 'history' | 'item' | 'concept';
  content: string;
  importance: number; // 1-10 scale
  confidence: number; // 1-10 scale
  sourceTimestamp: number;
  lastReferencedTimestamp: number;
  relatedLoreIds: string[];
}
```

#### Lore Extraction
```typescript
// Example approach for extracting lore from AI responses
function extractLoreFromResponse(response: string): LoreItem[] {
  const loreItems: LoreItem[] = [];
  
  // Use NLP techniques to identify factual statements
  // Example patterns: "The town of X was founded in Y"
  // "Character Z is known for W"
  
  // For each identified lore statement:
  // - Categorize it (character, location, etc.)
  // - Assign importance (based on narrative significance)
  // - Set confidence (based on statement clarity)
  // - Link to related lore items
  
  return loreItems;
}
```

#### Conflict Detection
```typescript
function detectLoreConflicts(newLore: LoreItem, existingLore: LoreItem[]): Conflict[] {
  const conflicts: Conflict[] = [];
  
  // Compare with existing lore items in same category
  const relevantLore = existingLore.filter(
    item => item.category === newLore.category
  );
  
  for (const existingItem of relevantLore) {
    // Check for semantic contradictions
    // e.g., if existing lore says "Town X was founded in 1850"
    // and new lore says "Town X was established in 1872"
    
    // If contradiction found, add to conflicts list
  }
  
  return conflicts;
}
```

### 3. Content Summarization
For very long gameplay sessions, we implement content summarization to condense lengthy narrative history.

```typescript
function summarizeNarrativeSection(
  narrativeSection: string,
  targetTokenCount: number
): string {
  // Use AI to generate a concise summary of the narrative section
  // Focus on preserving key plot points, character developments,
  // and important decisions while reducing token count
  
  // Return the summarized content
}
```

## Implementation Strategy

### Phase 1: Foundation (High Priority)
- Implement core data structures for context elements
- Create basic scoring algorithm based on recency and importance
- Develop token counting and budget management
- Implement initial lore tracking for critical facts

### Phase 2: Optimization (High Priority)
- Enhance scoring with location, character, and topic relevance
- Implement sophisticated lore extraction from AI responses
- Add conflict detection for contradicting lore
- Create basic content summarization for long sessions

### Phase 3: Advanced Features (Medium Priority)
- Implement dynamic token budget adjustment based on response quality
- Add automatic decay for less important context elements
- Develop pattern recognition for recurring player interests
- Create visualization tools for context selection

## Testing Strategy
- Simulate long gameplay sessions with growing narrative history
- Measure context selection effectiveness with different scenarios
- Test narrative consistency with contradictory information
- Benchmark performance with large datasets
- Evaluate quality of AI responses with optimized context

## Related Documentation
- [[linear-narrative-structure|Linear Narrative Structure]]
- [[../core-systems/ai-integration|AI Integration]]
- [[../core-systems/state-management|State Management]]
- [[prompt-engineering/storytelling|Storytelling Prompts]]
