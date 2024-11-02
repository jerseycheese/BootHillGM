# BootHillGM Project Overview

## 1. Project Description
BootHillGM is a web-based application providing an AI-driven virtual Game Master for the Boot Hill tabletop RPG, offering an engaging, user-friendly experience for solo players in the Western genre. The app is built with Next.js, a React-based framework, allowing for a responsive web experience accessible from various devices.

## 2. Project Objectives
- Develop an AI-driven virtual Game Master app specifically for Boot Hill RPG
- Automate Western-themed campaign management via AI
- Create an engaging, user-friendly experience for solo players
- Faithfully implement Boot Hill RPG rules and mechanics
- Build a flexible and scalable app architecture using Next.js

## 3. Target Audience
### MVP
- Personal use, family, and friends interested in Western-themed RPGs
- Boot Hill RPG enthusiasts within the developer's circle

### Post-MVP
- Broader audience of solo players interested in Western-themed RPGs
- Newcomers to tabletop RPGs seeking an accessible entry point

## 4. Key Features
### MVP
- [x] AI-driven Boot Hill Character Creation (basic)
- [x] AI-powered Game Mastering for Western settings (limited scope)
- [ ] AI-powered NPCs with basic persistence
- [x] Simple Game Session and State Management
- [x] Boot Hill's combat system implementation
- [x] Basic Character Sheet View
- [x] Simple Inventory System
- [ ] Linear Quest System
- [x] Uncensored AI responses for unrestricted player agency
- [x] Combat log system with scrollable history
- [x] Persistent game state across sessions
- [x] Journal system with action summaries

### Post-MVP
- [ ] Advanced AI-driven Character Creation with more options
- [ ] Enhanced Game Mastering with dynamic storytelling
- [ ] Complex NPC system with advanced persistence and relationships
- [ ] Advanced Game Session and State Management
- [ ] Expanded Character Sheet with progression tracking
- [ ] Comprehensive Inventory System with economics
- [ ] Complex Quest System with branching narratives
- [ ] Multiple Campaign and Character Management
- [ ] Rich Media Integration (images, ambient sounds)
- [ ] Customization Options (house rules, custom items)
- [ ] Mobile-optimized version

## 5. Boot Hill RPG Core Elements
- Percentile dice (d100) system
- Quick-action combat emphasizing gunfighting
- Extensive skill selection
- High lethality gameplay
- Historical Western setting and themes

## 6. App Architecture
The BootHillGMApp app is built using Next.js 14.x with the App Router, featuring a modular component structure, including:
- Core Game Engine
- AI Integration Service
- Character Management System
- Narrative Engine
- Combat System
- Inventory System
- NPC Management
- Quest System
- User Interface
- Data Persistence
- Next.js API routes for server-side logic

This modular approach, combined with the App Router structure, allows for easier development, testing, and future expansions.

## 7. Development Status
The project has made significant progress:
- Implemented the basic Next.js 14.x project structure using the App Router.
- Set up the core game engine using React Context for state management.
- Created the main layout and home page.
- Implemented a fully functional character creation page, including:
  - Multi-step, AI-guided character creation process
  - Dynamic attribute and skill input with validation
  - AI-generated prompts and descriptions for character traits
  - Character summary generation at the final step
- Implemented a functional Game Session page, including:
  - AI-driven narrative generation
  - User input processing
  - Structured AI responses for location tracking
  - Basic character status display
  - Turn-based combat system with Boot Hill rules
  - Scrollable combat log
  - Persistent game state
- Implemented uncensored AI responses for unrestricted player agency
- Updated AI service to handle player actions without censorship or moral judgment
- Implemented a Journal Viewer component with automatic entry creation
- Added inventory system with item tracking
- Implemented state persistence across navigation and page reloads

## 8. MVP Development Focus
- Implement core gameplay loop for personal/family/friends use
- Prioritize basic AI integration for character creation and simple storytelling
- Develop essential UI components for game interaction
- Implement basic data persistence for game sessions
- Enhance character creation with AI-generated summaries and descriptions
- Ensure uncensored and adaptable storytelling based on player actions

## 9. Post-MVP Considerations
- Enhance AI capabilities for more dynamic and complex gameplay
- Expand features for a broader audience
- Implement advanced UI/UX improvements
- Develop infrastructure for user accounts and online features
- Consider content warnings or age verification for uncensored content

## 10. Project Documentation
The project's documentation is organized in the Docs folder:

### Core Documentation
- ProjectOverview.md (this file): High-level project overview and architecture
- TechnicalSpecification.md: Detailed technical specifications and implementation details
- DevelopmentRoadmap.md: Development timeline and milestone tracking
- ComponentBreakdown.md: Detailed component structure and relationships
- ArchitectureDecisionRecord.md: Key architectural decisions and their rationales
- UserStories.md: User stories and feature tracking
- CompletedUserStories.md: Archive of completed user stories
- OpenBugs.md: List of known bugs and issues
- ClosedBugs.md: History of resolved bugs and their solutions

### Reference Documentation
- BootHillRules/: Boot Hill RPG rules documentation and reference materials
- Reference/: Additional reference materials and integration guides
- Wireframes/: UI/UX design wireframes and mockups
