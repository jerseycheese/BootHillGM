# BootHillGM Project

BootHillGM is a web application providing an AI-driven Game Master for the Boot Hill tabletop RPG, offering an engaging, user-friendly experience for solo players in the Western genre. Built with Next.js, it's designed to run in modern web browsers.

## Key Features (MVP)

- Boot Hill Character Creation with AI-driven generation
- AI-powered Game Mastering for Western settings using Gemini 1.5 Pro
- AI-powered NPCs with persistent memory
- Game Session and State Management with automatic saving and restoration
- Boot Hill's percentile dice system for chance-based outcomes
- Character Sheet View with stat and status displays
- Inventory Management with item usage and tracking
- Turn-based combat system with Boot Hill mechanics, including weapon and brawling combat
- Strength system implementation with derived stats and modifiers
- Automatic journal entry system with search and filtering
- Player Decision Tracking System: Tracks player choices, calculates their relevance, and makes them available for influencing future narrative content.

## Technical Stack

- Platform: Web application using Next.js 14.x with App Router
- AI Model: Gemini 1.5 Pro API (Google Generative AI)
- Development Environment: Visual Studio Code, Git for version control
- User Interface: React with Tailwind CSS for wireframe styling
- State Management: React Context with useReducer for global state management
- Data Persistence: localStorage for simple data storage

## Getting Started

1. Clone the repository
2. Install Node.js and npm if not already installed
3. Navigate to the `BootHillGMApp` directory and run: `npm install`
4. Set up your Gemini API key:
   - Create a `.env` file in the `BootHillGMApp` directory
   - Add your API key to this file: `GEMINI_API_KEY=your_api_key_here`
   - Ensure this file is added to .gitignore to keep your API key secure
5. To run the app:
    - `npm run dev`

## Project Documentation

### Docs Folder Structure

- [AIGameMasterLogic.md](Docs/ai/game-master-logic.md): Details on the AI Game Master's logic and decision-making processes.
- [ArchitectureDecisionRecord.md](Docs/architecture/architecture-decisions.md): Record of key architectural decisions made for the project.
- [ComponentBreakdown.md](Docs/architecture/component-structure.md): Breakdown of the main components of the BootHillGM project.
- [DevelopmentRoadmap.md](Docs/planning/roadmap.md): Roadmap outlining the development phases and milestones.
- [GameDesignDocument.md](Docs/meta/game-design.md): Comprehensive game design document.
- [ProjectOverview.md](Docs/meta/project-overview.md): High-level overview of the BootHillGM project.
- [RiskAssessment.md](Docs/meta/risk-assessment.md): Assessment of potential risks and mitigation strategies.
- [TechnicalSpecification.md](Docs/architecture/technical-specification.md): Detailed technical specifications for the project.
- [UIWireframes.md](Docs/architecture/ui-wireframes.md): User interface wireframes for the app.

#### BootHill Folder

- [Boot Hill v2 Basic Rules.txt](Docs/boot-hill-rules/game-overview.md): Basic rules for Boot Hill version 2.

#### Core Systems Folder
- [AI Integration](Docs/core-systems/ai-integration.md): Details on AI system integration
- [Character Generation](Docs/core-systems/character-generation.md): Character creation process and rules
- [Combat System](Docs/core-systems/combat-system.md): Combat mechanics and rules
- [Journal System](Docs/core-systems/journal-system.md): Journal system functionality and design
- [State Management](Docs/core-systems/state-management.md): State management approach and implementation
- [Strength System](Docs/core-systems/strength-system.md): Strength system mechanics and calculations
- [Combat Modifiers](Docs/core-systems/combat-modifiers.md): Combat modifiers and their effects

#### Development Workflows
- [Claude Workflow](Docs/development/workflows/claude-workflow.md): Guidelines for using Claude in development
- [Project Analysis Prompt Example](Docs/development/workflows/examples/project-analysis-prompt.md): Example prompt for project analysis

#### Technical Folder

- [Gemini-API-Integration-Guide.md](Docs/reference/gemini-api-guide.md): Guide for integrating the Gemini API.
- [Setup Guide](Docs/technical-guides/setup.md): Instructions for setting up the development environment
- [Dependencies](Docs/technical-guides/dependencies.md): Overview of project dependencies
- [Environment Configuration](Docs/technical-guides/environment-configuration.md): Guide to configuring environment variables
- [Testing Guide](Docs/technical-guides/testing.md): Information on testing procedures and tools
- [Development Workflow](Docs/technical-guides/workflow.md): Best practices for development workflow