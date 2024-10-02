# BootHillGM Component Breakdown (MVP Focus)

This document outlines the main components of the BootHillGM project for the MVP, their core functionalities, and a suggested development order. It's tailored for implementation by a single developer new to React and Next.js.

## Essential Components (MVP)

### 1. App Directory Structure
- **Main Functionality:** Serves as the core of the Next.js application using the App Router
- **Key Components:**
  - [ ] app/layout.tsx (Main layout component)
  - [ ] app/page.tsx (Home page)
  - [ ] app/character-creation/page.tsx
  - [ ] app/game-session/page.tsx
  - [ ] app/character-sheet/page.tsx
- **Potential Challenges:** Understanding and implementing the App Router structure and conventions

### 2. API Routes
- **Main Functionality:** Handle server-side logic and AI interactions
- **Key Routes:**
  - [ ] app/api/ai-interaction/route.ts
  - [ ] app/api/game-state/route.ts
- **Potential Challenges:** Implementing API routes within the App Router structure

### 3. GameEngine
- **Main Functionality:** Manages game state and basic game flow
- **Key Components:**
  - [ ] GameContext (contexts/GameContext.tsx)
  - [ ] GameReducer (reducers/gameReducer.ts)
- **Potential Challenges:** Implementing state management with Context API

### 4. AIService
- **Main Functionality:** Handles communication with Gemini API
- **Key Components:**
  - [ ] AIProvider (providers/AIProvider.tsx)
  - [ ] useAI hook (hooks/useAI.ts)
- **Potential Challenges:** Managing API calls, handling responses and errors

### 5. CharacterManager
- **Main Functionality:** Handles character creation and management
- **Key Components:**
  - [ ] CharacterCreationForm (components/CharacterCreationForm.tsx)
  - [ ] CharacterSheet (components/CharacterSheet.tsx)
- **Potential Challenges:** Implementing form logic, state updates

### 6. NarrativeEngine
- **Main Functionality:** Generates and manages basic storylines and narrative elements
- **Key Components:**
  - [ ] StoryGenerator (utils/StoryGenerator.ts)
  - [ ] NarrativeDisplay (components/NarrativeDisplay.tsx)
- **Potential Challenges:** Integrating AI-generated content, maintaining narrative consistency

### 7. CombatSystem
- **Main Functionality:** Manages simplified combat mechanics
- **Key Components:**
  - [ ] CombatManager (components/CombatManager.tsx)
  - [ ] ActionResolver (utils/ActionResolver.ts)
- **Potential Challenges:** Implementing turn-based logic, integrating with game state

### 8. UIComponents
- **Main Functionality:** Reusable UI elements for consistent look and feel
- **Key Components:**
  - [ ] Button (components/ui/Button.tsx)
  - [ ] Input (components/ui/Input.tsx)
  - [ ] Card (components/ui/Card.tsx)
- **Potential Challenges:** Creating reusable components, styling with CSS Modules

### 9. DataPersistence
- **Main Functionality:** Handles saving and loading game states
- **Key Components:**
  - [ ] LocalStorageManager (utils/LocalStorageManager.ts)
- **Potential Challenges:** Managing complex state serialization/deserialization

## Recommended Development Order (MVP Focus)

1. Set up Next.js project and familiarize with its structure
2. Implement basic Pages and routing
3. Create essential UIComponents
4. Develop GameEngine with basic state management
5. Implement AIService for fundamental AI interactions
6. Create CharacterManager for basic character creation and display
7. Develop simplified NarrativeEngine
8. Implement basic CombatSystem
9. Add DataPersistence for saving/loading games
10. Refine and connect all components in the Game Session page

This order allows for building core functionality first, then gradually adding more complex systems. It's designed to be more manageable for a single developer new to React and Next.js, allowing for learning and iterative development.

Note: While developing these components, you may need to work on multiple components simultaneously due to their interconnected nature. This order is a general guideline and may need adjustment based on your learning progress and specific implementation challenges.