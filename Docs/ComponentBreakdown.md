# BootHillGM Component Breakdown (MVP Focus)

## Essential Components (MVP)

### 1. App Directory Structure
- **Main Functionality:** Serves as the core of the Next.js application using the App Router
- **Key Components:**
  - [x] app/layout.tsx (Main layout component)
  - [x] app/page.tsx (Home page)
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
  - [x] GameContext (app/utils/gameEngine.tsx)
  - [x] GameReducer (integrated in app/utils/gameEngine.tsx)
    - Now includes handling for character state
- **Potential Challenges:** Balancing complexity with maintainability as game state grows

### 4. AIService
- **Main Functionality:** Handles communication with Gemini API
- **Key Components:**
  - [ ] AIProvider (providers/AIProvider.tsx)
  - [ ] useAI hook (hooks/useAI.ts)
- **Potential Challenges:** Managing API calls, handling responses and errors

### 5. CharacterManager
- **Main Functionality:** Handles character creation and management
- **Key Components:**
  - [x] CharacterCreation (app/character-creation/page.tsx)
    - Implements a multi-step, AI-guided character creation process
    - Uses state management to control the flow of character creation
    - Integrates with AIService for dynamic prompts and attribute descriptions
    - Includes input validation and error handling
    - Provides a summary review step before finalizing character creation
    - Generates and displays an AI-created character summary
  - [x] CharacterSheet (app/character-sheet/page.tsx)
    - Displays character information
- **Implemented Features:**
  - Dynamic generation of character creation steps based on character attributes and skills
  - AI-generated prompts and descriptions for each character attribute and skill
  - Real-time input validation with error messaging
  - Performance optimization using React hooks (useMemo, useCallback)
  - Integration with game state management for storing created character
  - AI-generated character summary at the final step of character creation
- **Potential Challenges:** 
  - Balancing AI response time with user experience
  - Ensuring consistent and appropriate AI-generated content
  - Handling edge cases in character attribute values and combinations

### 6. Inventory Component
- **Main Functionality:** Manages character inventory display and item usage
- **Key Components:**
  - [x] Inventory (components/Inventory.tsx)
    - Displays current inventory items with quantities
    - Provides Use buttons for direct item interaction
    - Shows item descriptions on hover
    - Integrates with CampaignStateManager for state persistence
  - [x] State Management Integration
    - Uses CampaignStateManager for inventory state
    - Handles item quantity updates
    - Maintains inventory state across sessions

### 7. NarrativeEngine
- **Main Functionality:** Generates and manages basic storylines and narrative elements
- **Key Components:**
  - [ ] StoryGenerator (utils/StoryGenerator.ts)
  - [ ] NarrativeDisplay (components/NarrativeDisplay.tsx)
- **Potential Challenges:** Integrating AI-generated content, maintaining narrative consistency

### 8. Status Display:
- **Main Functionality:** Displays character status information and provides game save functionality
- **Key Components:**
  - [x] StatusPanel (components/StatusPanel.tsx)
    - Shows character name, location, and health
    - Provides game save functionality
    - Uses a two-column grid layout for better organization
    - Maintains consistency with the wireframe styling theme
- **Potential Challenges:** Ensuring consistent state persistence across game sessions

### 9. CombatSystem
- **Main Functionality:** Manages simplified combat mechanics
- **Key Components:**
  - [x] CombatSystem (components/CombatSystem.tsx)
  - [ ] ActionResolver (utils/ActionResolver.ts)
- **Implemented Features:**
  - Handles optional opponents (Character | null)
  - Implements null checks before performing opponent-related actions
  - Uses useEffect to update opponent health when the opponent changes
  - Enhances error handling and edge case management
  - Comprehensive test coverage including rendering with/without opponent, player attacks, and combat end scenarios
- **Potential Challenges:** Implementing turn-based logic, integrating with game state

### 10. UIComponents
- **Main Functionality:** Reusable UI elements for consistent look and feel
- **Key Components:**
  - [ ] Button (components/ui/Button.tsx)
  - [ ] Input (components/ui/Input.tsx)
  - [ ] Card (components/ui/Card.tsx)
- **Potential Challenges:** Creating reusable components, styling with CSS Modules

### 11. DataPersistence
- **Main Functionality:** Handles saving and loading game states
- **Key Components:**
  - [x] CampaignStateManager (app/components/CampaignStateManager.tsx)
    - Implements a React Context for global state management
    - Handles saving and loading state from localStorage
    - Provides a custom hook (useCampaignState) for easy access to state and dispatch function
  - [ ] LocalStorageManager (utils/LocalStorageManager.ts)
- **Implemented Features:**
  - Global state management using React Context and useReducer
  - Persistence of game state in localStorage
  - Journal system integrated into campaign state
  - Journal entries include narrative summaries of player actions
  - Robust date formatting and entry organization
- **Potential Challenges:** Managing complex state serialization/deserialization, ensuring data consistency across saves

### 12. GameSession
- **Main Functionality:** Manages the main game play experience
- **Key Components:**
  - GameSession (app/game-session/page.tsx)
    - Integrates with CampaignStateManager for state management
    - Handles user input and AI responses
    - Manages combat initiation and resolution
    - Renders game UI including narrative, inventory, and user input
  - **GameSession Components**:
    - **GameSession**: Root component that orchestrates the game interface
      - [x] Two-column layout with main game area and side panel
      - [x] Handles initialization and loading states
      - [x] Distributes game state to child components
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
- **Implemented Features:**
  - Integration with AI service for dynamic game narration
  - Journal system for tracking important story elements
  - Basic combat initiation based on AI responses
  - Robust state initialization handling saved games and new sessions
  - Proper preservation of narrative and inventory between sessions
- **Potential Challenges:** Balancing complexity with performance, managing asynchronous AI interactions

### 13. NarrativeDisplay Component
- **Main Functionality:** Handles the display of game narrative text and error states
- **Key Components:**
  - NarrativeDisplay (components/NarrativeDisplay.tsx)
    - Displays scrollable narrative content
    - Handles error display with retry functionality
    - Manages text formatting and whitespace
- **Implemented Features:**
  - Scrollable narrative display
  - Error state handling with retry option
  - Proper text formatting preservation
  - Full test coverage including accessibility tests
- **Status:** Implemented and tested

### InputManager
- **Main Functionality:** Handles user input during game sessions with loading states and validation
- **Key Features:**
  - [x] Text input for player actions
  - [x] Loading state management
  - [x] Input validation
  - [x] Accessibility support
- **Status:** Implemented and tested
- **Potential Challenges:** Handling very long inputs, maintaining responsiveness during loading

### StatusDisplayManager
- **Main Functionality:** Displays current game status and provides save functionality
- **Key Features:**
  - [x] Character name display
  - [x] Location tracking
  - [x] Health display with current/max format
  - [x] Manual save functionality
- **Status:** Implemented and tested
- **Potential Challenges:** Handling long character/location names, ensuring save state consistency

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
