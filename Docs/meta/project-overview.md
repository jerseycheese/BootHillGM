---
title: BootHillGM Project Overview
aliases: [Project Overview, Overview]
tags: [meta, documentation, overview]
created: 2024-12-28
updated: 2024-12-28
---

# BootHillGM Project Overview

## 1. Project Description
BootHillGM is a Next.js-based web application that provides an AI-driven Game Master experience for the Boot Hill tabletop RPG. The application uses the Gemini 1.5 Pro API to deliver dynamic, uncensored storytelling while maintaining the authentic feel of the Boot Hill RPG system. Built with modern web technologies, it offers an accessible and responsive single-player experience.

## 2. Current Development Status

### 2.1 Implemented Core Features
- AI-driven character creation with Boot Hill v2 rules integration
- Uncensored AI storytelling for authentic Western narratives
- Turn-based combat system with Boot Hill mechanics
- Persistent game state management
- Automatic journal entry system
- Basic inventory management
- Combat logging and state restoration

### 2.2 In Development
- Enhanced combat mechanics with weapon modifiers
- Improved narrative formatting and display
- Advanced inventory interactions
- Journal system enhancements

## 3. Technical Foundation
- Framework: Next.js 14.x with App Router
- AI Integration: Gemini 1.5 Pro API
- State Management: React Context with useReducer
- Data Persistence: localStorage with automated saving
- UI: Tailwind CSS with wireframe styling
- Testing: Jest with React Testing Library

## 4. Project Objectives
- Deliver an engaging, AI-driven Boot Hill RPG experience
- Maintain authentic Western atmosphere through uncensored AI responses
- Implement faithful Boot Hill v2 rule adaptations
- Create an intuitive, responsive web interface
- Ensure reliable game state management and persistence

## 5. Target Audience
- Personal use, family, and friends interested in Western RPGs
- Boot Hill RPG enthusiasts seeking a solo play experience
- Players interested in AI-driven narrative experiences

## 6. Development Approach
- Focus on essential MVP features
- Iterative development with regular testing
- Emphasis on reliable state management
- Regular documentation updates
- Systematic testing implementation

## 7. Key Components
### 7.1 Core Systems
- GameProviderWrapper: Global state provider
- CampaignStateManager: Game state persistence
- AIService: Modularized Gemini API integration.
- CombatSystem: Turn-based combat management
- JournalSystem: Automatic history tracking

### 7.2 User Interface
- Character Creation Wizard
- Game Session Interface
- Combat Controls and Log
- Inventory Management
- Journal Viewer

## 8. Current Priorities
- Complete core combat system enhancements
- Improve narrative display and formatting
- Enhance inventory interactions
- Expand journal functionality
- Implement comprehensive testing

## 9. Development Status
The project has established its core architecture and implemented several key features. Current focus is on enhancing existing functionality and completing remaining MVP features while maintaining code quality and testing coverage.

## 10. Next Steps
- Complete remaining MVP features
- Enhance existing component functionality
- Implement comprehensive testing
- Refine user interface and experience
- Prepare for initial testing with target audience

## 11. Project Documentation
The project's documentation is organized in the Docs folder:

### Core Documentation
- [[project-overview|Project Overview]] (this file): High-level project overview and architecture
- [[../architecture/technical-specification|Technical Specification]]: Detailed technical specifications
- [[../planning/roadmap|Development Roadmap]]: Development timeline and milestone tracking
- [[../architecture/component-structure|Component Structure]]: Detailed component relationships
- [[../architecture/architecture-decisions|Architecture Decisions]]: Key architectural decisions

### Reference Documentation
- [[../boot-hill-rules/game-overview|Boot Hill Rules]]: Boot Hill RPG rules documentation
- [[../reference/gemini-api-guide|API Reference]]: Integration guides and references
- [[../wireframes/ui-wireframes|UI Wireframes]]: Interface design and mockups
