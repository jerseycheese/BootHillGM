---
title: Component Breakdown
aliases: [Component Structure, Component Architecture, UI Components]
tags: [architecture, components, mvp, implementation, ui]
created: 2024-12-28
updated: 2025-03-23
---

# Component Breakdown (MVP Focus)

## Overview
This document provides a comprehensive breakdown of the application's component structure, focusing on MVP features and implementation status. For implementation details, see:
- [[state-management|State Management]]
- [[api-integration|API Integration]]
- [[../core-systems/combat-system|Combat System]]
- [[../core-systems/journal-system|Journal System]]
- [Storybook Usage Guide](../../BootHillGMApp/app/docs/storybook-usage.md)

## Component Development

Components are developed using a combination of:

1. **Next.js App Router**: Core framework for routing and rendering
2. **React**: UI component library
3. **TypeScript**: Type safety for component props and state
4. **Tailwind CSS**: Utility-first CSS framework for styling
5. **Storybook**: Visual component development and testing environment

Key components have Storybook stories for isolated development and testing.

## Essential Components (MVP)

### App Directory Structure
- **Main Functionality:** Serves as the core of the Next.js application using the App Router
- **Key Components:**
  - [x] app/layout.tsx (Main layout component)
  - [x] app/page.tsx (Home page)
  - [x] app/character-creation/page.tsx
  - [x] app/game-session/page.tsx
  - [x] app/character-sheet/page.tsx
- **Potential Challenges:** Ensuring consistent state management across pages

### Game Session Components
- **GameSession**: Root component that orchestrates the game interface
  - [x] Two-column layout with main game area and side panel
  - [x] Handles initialization and loading states
  - [x] Distributes game state to child components
  - [x] Manages item acquisition and usage notifications
- **MainGameArea**: Primary game interaction space
  - [x] Displays narrative content
  - [x] Manages combat and input interfaces
  - [x] Handles state transitions between normal and combat modes
- **SidePanel**: Secondary information display
  - [x] Shows character status
  - [x] Displays inventory
  - [x] Shows journal entries
- **GameplayControls**: Manages user interaction methods
  - [x] Switches between combat and normal input modes
  - [x] Handles loading states during AI responses
  - [x] Displays suggested actions
- **LoadingScreen**: Simple loading state display
  - [x] Shown during initialization
  - [x] Accessible loading indicator
- **AI Integration**: Dynamic suggested actions generation
  - [x] Context-aware action suggestions
  - [x] Character-specific recommendations
  - [x] Fallback suggestion system
  - [x] Error handling with graceful degradation

### Combat System Components
- **CombatSystem**: Core combat interface
  - [x] Uses useCombatEngine hook for logic
  - [x] Manages turn-based combat flow using Character references
  - [x] Handles damage calculation based on Character attributes
  - [x] Maintains combat log
- **BrawlingEngine**: Core combat calculation engine
  - [x] Handles pure combat logic
  - [x] Manages damage calculations based on Character attributes
  - [x] Processes combat rules
  - [x] Provides testable interface
- **Combat UI Components:**
  - [x] CombatStatus: Health display for both combatants
  - [x] CombatControls: Turn and action management (with Storybook stories)
  - [x] CombatLog: Scrollable combat history
- **Current Status:** Implemented with improved architecture with Character references
  - Combat logic extracted to dedicated hook
  - UI components focused on presentation
  - Strength is derived from Character references, not duplicated in state
  - Enhanced maintainability and testability

### State Management
- **CampaignStateManager**: Core state provider
  - [x] Implements React Context for global state
  - [x] Handles localStorage persistence
  - [x] Provides custom hooks for state access
  - [x] Manages automated saving
- **Custom Hooks:**
  - [x] useGameInitialization
  - [x] useGameSession
  - [x] useCombatEngine
  - [x] useAIInteractions
  - [x] useCombatStateRestoration

### AI Integration Components
- **AIService**: Core AI communication
  - [x] Handles Gemini API interactions
  - [x] Processes responses and updates state
  - [x] Manages error handling and retries
- **useAIInteractions Hook**: Enhanced state management
  - [x] Separated response processing logic
  - [x] Improved error handling
  - [x] Added last action tracking for retries
  - [x] Structured state updates
- **Integration Features:**
  - [x] Context management
  - [x] Response parsing
  - [x] Narrative generation
  - [x] Combat initiation
  - [x] Inventory updates

### Character Management
- **Character Creation System:**
  - [x] useCharacterCreation hook for centralized logic
  - [x] Separate form and summary components
  - [x] Multi-step, AI-guided creation flow
  - [x] Automatic progress saving
  - Components:
    - CharacterCreationForm: Handles step-by-step input
    - CharacterSummary: Displays final character review
    - Parent page component for orchestration
  - Features:
    - [x] State management with automatic saving
    - [x] Progress restoration
    - [x] Validation and error handling
    - [x] AI integration for generation
    - [x] Comprehensive test coverage
- **CharacterSheet Component:**
  - [x] Displays character information
  - [x] Updates in real-time with state changes
  - [x] CharacterSheetContent component with Storybook stories

### Inventory Component
- **Main Features:**
  - [x] Displays current inventory items
  - [x] Provides Use buttons for items
  - [x] Shows descriptions on hover
  - [x] Integrates with CampaignStateManager
- **State Integration:**
  - [x] Uses CampaignStateManager
  - [x] Handles quantity updates
  - [x] Maintains persistence
  - [x] Coordinates with narrative for item notifications

### Journal System
- **JournalViewer Component:**
  - [x] Displays chronological entries
  - [x] Shows narrative summaries
  - [x] Includes combat results
  - [x] Maintains formatting
  - [x] Implements virtualized scrolling for performance
  - [x] Handles different entry types with type safety
  - [x] Optimized for large journal lists
  - [x] Component has Storybook stories for visual testing
- **Implementation Status:** Complete with tests and performance optimization

### UI Components
- **NarrativeDisplay:**
  - **Main Features:**
    - [x] Shows game text with consistent formatting
    - [x] Auto-scrolls for new content
    - [x] Handles error states
    - [x] Displays item notifications
    - [x] Streamlined content processing
    - [x] Memory-efficient item updates
    - [x] Optimized rendering performance
    - [x] Improved metadata cleaning
  - **Implementation Status:** Complete with optimized content processing
- **InputManager:**
  - [x] Processes player input
  - [x] Shows loading states
  - [x] Validates input
- **StatusDisplayManager:**
  - [x] Shows character info
  - [x] Displays location
  - [x] Provides save functionality

### Visual Testing with Storybook
- **Core Components with Stories:**
  - [x] CharacterSheetContent
  - [x] CombatControls
  - [x] JournalViewer
- **Implementation Status:** Complete with basic stories for key components
- **Storybook Configuration:**
  - [x] Next.js App Router integration
  - [x] Tailwind CSS support
  - [x] TypeScript support

## Development Status
- [x] Enhanced loading screen implementation
- [x] Removed unused components
- [x] Optimized component architecture
- [x] Improved state management integration
- [x] Added Storybook for isolated component development

## Related Documentation
- [[state-management|State Management Architecture]]
- [[api-integration|API Integration]]
- [[../core-systems/combat-system|Combat System]]
- [[../core-systems/journal-system|Journal System]]
- [[../wireframes/ui-wireframes|UI Wireframes]]
- [[../technical-guides/testing|Testing Guide]]
- [[../features/_current/narrative-formatting|Narrative Display]]
- [Storybook Usage Guide](../../BootHillGMApp/app/docs/storybook-usage.md)
