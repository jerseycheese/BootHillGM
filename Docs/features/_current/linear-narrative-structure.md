---
title: Linear Narrative Structure
aliases: [AI-Driven Narrative, Story Progression System]
tags: [feature, current, narrative, ai]
created: 2025-03-06
updated: 2025-03-06
---

# Linear Narrative Structure

## Overview
This document outlines the implementation plan for the linear narrative structure in BootHillGM. The system enables an AI-driven storyline that progresses in a logical sequence while allowing for player agency through meaningful choices that affect story details without derailing the main plot.

## Key Objectives
- Create a coherent linear narrative with minimal branching
- Allow player choices to influence story details while maintaining overall direction
- Ensure narrative consistency across long gameplay sessions
- Track and maintain narrative state and important story elements
- Balance player agency with narrative progression

## Implementation Approach
The implementation of the linear narrative structure is divided into several GitHub issues, organized by priority:

### MVP Components (High Priority)

#### 1. Narrative State Management Foundation (#164)
- Core state tracking for narrative elements
- Scalable narrative reducer to handle state updates
- Context provider with efficient storage patterns
- Persistence mechanism for large narrative datasets

#### 2. Main Storyline Progression System (#165)
- Story points tracking for AI-generated main storyline
- Mechanism to extract key story points from AI responses (currently, story points are predefined)
- System to determine current point in the main storyline
- Story progression summarization for AI context

#### 3. Decision Impact System (#166)
- Track significant player decisions (currently, `selectedChoice` is tracked)
- Record player choices with context and impact metadata
- Flexible impact system that avoids rigid branching
- Mechanism for AI to incorporate past player choices

#### 4. Narrative Context Optimization (#167)
- Select relevant narrative elements for AI context
- Prioritize context based on recency, importance, and relevance
- Prevent context window overflow for long-running games
- Dynamic context generation based on current game situation

#### 5. Lore Management System (#168)
- Dedicated store for tracking world facts and lore
- Extract and update lore from AI responses (currently, no dedicated lore system)
- Ensure AI responses maintain consistency with established lore
- Categorization system for different types of lore

#### 6. Narrative Reducer and Action Creators (#174)
- Implemented the `narrativeReducer` to handle narrative state updates.
- Created action creators for navigating story points, selecting choices, managing narrative history, setting display mode, and handling narrative arcs and branches.
- Ensured immutable state updates and proper error handling.

### Enhancement Components (Medium/Low Priority)

#### 6. Narrative-Journal Integration (#169)
- Automatically extract significant events from AI responses
- Create journal entries for important narrative moments
- Add story point references and categorization to journal entries
- Implement journal filtering by story elements

#### 7. AI Prompt Engineering for Narrative Depth (#170)
- Specialized prompts for rich world-building
- System to elaborate on aspects players show interest in
- Narrative enrichment for character development, themes, and plot
- Consistent tone and narrative style

#### 8. Narrative Variables System (#171)
- Track character relationships, preferences, and small story details
- Record player-NPC interactions and attitudes
- Extract variables from player actions and AI responses
- Incorporate relevant variables into AI context

#### 9. Narrative Display Enhancements (#172)
- Visual indicators for significant story moments
- Special formatting for key narrative revelations
- Visual distinction between main story and side content
- Animations for story transitions and mood shifts

## Technical Architecture

### State Management
```typescript
export interface NarrativeState {
  currentStoryPoint: StoryPoint | null;
  visitedPoints: string[];
  availableChoices: NarrativeChoice[];
  narrativeHistory: string[];
  displayMode: NarrativeDisplayMode;
  narrativeContext?: NarrativeContext;
  selectedChoice?: string;
}

export interface NarrativeContext {
  tone?: 'serious' | 'lighthearted' | 'tense' | 'mysterious';
  characterFocus: string[];
  themes: string[];
  worldContext: string;
  importantEvents: string[];
  playerChoices: Array<{
    choice: string;
    consequence: string;
    timestamp: number;
  }>;
  storyPoints: Record<string, StoryPoint>;
  narrativeArcs: Record<string, NarrativeArc>;
  narrativeBranches: Record<string, NarrativeBranch>;
  currentArcId?: string;
  currentBranchId?: string;
}

export interface NarrativeArc {
  id: string;
  title: string;
  description: string;
  branches: NarrativeBranch[];
  startingBranch: string;
  isCompleted: boolean;
}

export interface NarrativeBranch {
  id: string;
  title: string;
  startPoint: string;
  endPoints: string[];
  requirements?: {
    items?: string[];
    attributes?: Array<{
      attribute: keyof Character['attributes'];
      minValue: number;
    }>;
    visitedPoints?: string[];
  };
  isActive: boolean;
  isCompleted?: boolean;
}
```

## Integration with Other Systems

### AI Integration
- Narrative context will be provided to the AI system for generating responses
- AI responses will be analyzed to extract narrative elements
- Lore and narrative variables will influence AI responses

### Journal System
- Key story events will be automatically recorded in the journal
- Journal entries will be linked to story points
- Special formatting will highlight story-critical entries

### Game Session
- Player actions will be analyzed for narrative relevance
- Decision points will be presented to players at appropriate moments
- Visual feedback will indicate story progression

## Success Criteria
- Story progresses in a clear, linear fashion
- Player decisions affect story details while maintaining overall direction
- Narrative state is properly tracked across game sessions
- Story elements remain consistent throughout gameplay
- AI responses align with established narrative
- Key story points are properly recorded in journal

## Related Documentation
- [[../core-systems/ai-integration|AI Integration]]
- [[../core-systems/journal-system|Journal System]]
- [[../features/_current/narrative-formatting|Narrative Formatting]]
- [[../planning/roadmap|Development Roadmap]]
