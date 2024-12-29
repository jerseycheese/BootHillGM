# BootHillGM Development Roadmap (MVP Focus)

## Phase 1: Project Setup and Learning ✓

1.1 Environment Setup ✓
- [x] Set up Next.js development environment
- [x] Configure TypeScript
- [x] Set up version control with Git

1.2 Learning and Experimentation ✓
- [x] Complete Next.js tutorial
- [x] Experiment with basic React concepts (components, props, state)
- [x] Learn about React Hooks (useState, useEffect, useContext)

1.3 Project Structure ✓
- [x] Set up basic Next.js project structure
- [x] Create initial pages (Home, Character Creation, Game Session)
- [x] Experiment with API routes

## Phase 2: Core Functionality Development ✓

2.1 State Management ✓
- [x] Implement basic game state using React Context
- [x] Create reducers for state updates
- [x] Implement dispatch function for all state updates
- [x] Optimized character creation flow with static descriptions and targeted AI usage

2.2 AI Integration ✓
- [x] Set up Gemini API integration
- [x] Implement basic AI response generation using Next.js API routes
- [x] Develop simple context management for game elements
- [x] Implement uncensored AI responses for unrestricted player agency
- [x] Implement focused AI usage for specific features (character names, backgrounds)

2.3 Character System ✓
- [x] Implement simplified character creation flow
- [x] Implement AI-driven random character generation
- [x] Create basic character sheet display

2.4 User Interface ✓
- [x] Design and implement essential UI components
- [x] Develop responsive layout for game session page
- [x] Implement wireframe styling across all pages

2.5 Status Display Improvements
- [ ] Enhance health display format
- [ ] Ensure consistent state persistence
- [ ] Implement cross-page state management

2.6 Boot Hill Integration
- [ ] Add rulebook reference tables
- [ ] Implement dice rolling system
- [ ] Create roll result explanations

## Phase 3: Game Mechanics Implementation (Current Phase)

3.1 Game Session Enhancement
- [ ] Implement contextual action buttons
- [ ] Separate action suggestions from narrative
- [x] Extract status display into separate component
- [x] Add visual distinction for player actions
- [x] Implement typed narrative content processing
- [x] Implement BrawlingEngine for combat system
- [x] Add state protection pattern
- [x] Enhance campaign state restoration

3.2 State Management Improvements
- [ ] Implement progressive state saving
- [x] Add state persistence across navigation
- [x] Implement weapon equipment state management
- [x] Add inventory-weapon integration
- [ ] Create error recovery system

3.3 Combat System Enhancements
- [x] Implement simplified Boot Hill combat rules
- [x] Create basic combat UI
- [x] Implement turn-based combat flow
- [x] Add health tracking for player and opponent
- [x] Create combat log for narrating fight progression
- [x] Add initial weapon combat framework
- [x] Implement critical hits and misses
- [x] Add combat-specific inventory interactions
- [x] Refactor combat hooks (`useWeaponCombat`, `useWeaponCombatAction`, `useWeaponCombatState`)
- [x] Improve combat log with detailed action descriptions and outcomes
- [x] Implement core dice rolling system (diceUtils.ts)

3.4 Inventory System Refinements
- [x] Implement basic inventory data structure
- [x] Create Inventory component for displaying items
- [x] Implement add and remove item functionality
- [ ] Implement item usage restrictions and logical checks
  - Prevent usage of items not in inventory
  - Provide feedback for attempted use of unavailable items
- [x] Integrate inventory with other game systems

3.5 Journal Integration
- [x] Implement automatic journal entry creation
- [x] Update CombatSystem to trigger journal updates
- [x] Modify GameSession to handle combat journal entries
- [x] Enhance journal system with narrative summaries
  - [x] Type-safe journal entries
  - [x] Virtualized scrolling for performance
  - [x] Enhanced entry formatting
  - [x] Comprehensive test coverage
- [x] Update combat log entries in combat system for detailed combat results and summaries

## Phase 4: Polish and Testing (Next Phase)

4.1 UI/UX Improvements
- [ ] Add loading indicators for AI responses
- [ ] Improve combat feedback and animations
- [ ] Enhance narrative text formatting
- [ ] Add tooltips and help text

4.2 Performance Optimization
- [ ] Optimize state updates
- [ ] Improve AI response handling
- [ ] Enhance combat system performance
- [ ] Optimize journal context selection

4.3 Error Handling
- [ ] Implement comprehensive error boundaries
- [ ] Add recovery mechanisms for failed AI calls
- [ ] Improve error messaging
- [ ] Add state recovery options

4.4 Testing Implementation
- [ ] Complete unit test coverage for core components
- [ ] Add integration tests for main game flows
- [ ] Implement combat system testing
- [ ] Add journal system tests

## Ongoing Tasks
- Bug fixes and issue resolution
- Documentation updates
- Code refactoring for maintainability
- Performance monitoring and optimization
- Regular testing and validation

## Critical Path Items
1. Complete combat system enhancements (Core dice rolling system implemented)
2. Finish inventory system logical checks
3. Implement journal narrative summaries
4. Add loading indicators and feedback
5. Complete testing implementation

## Success Criteria (MVP)
- [ ] Functional character creation with AI guidance
- [x] Working combat system with Boot Hill rules
- [x] Basic inventory management
- [x] Persistent game state
- [x] Automated journal system
- [ ] Complete error handling
- [ ] Comprehensive test coverage

This roadmap focuses on completing the MVP features while maintaining code quality and user experience. Priority is given to essential gameplay features and system stability.
