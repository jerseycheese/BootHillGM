# BootHillGM Project

BootHillGM is a cross-platform mobile app providing an AI-driven virtual Game Master for the Boot Hill tabletop RPG, offering an engaging, user-friendly experience for solo players in the Western genre. Built with React Native, it's designed to run on both iOS and Android devices.

## Key Features (MVP)

- Boot Hill Character Creation
- AI-powered Game Mastering for Western settings
- AI-powered NPCs with persistent memory
- Game Session and State Management
- Boot Hill's percentile dice system for chance-based outcomes
- Character Sheet View
- Basic Inventory and Quest Systems

## Technical Stack

- Platform: Cross-platform mobile app using React Native
- AI Model: Gemini 1.5 Pro API (Google Generative AI)
- Development Environment: Visual Studio Code or WebStorm, Git for version control
- User Interface: React Native components for cross-platform UI
- State Management: Redux for global state management
- Data Persistence: AsyncStorage for simple data storage (MVP phase)

## Getting Started

1. Clone the repository
2. Install Node.js and npm if not already installed
3. Install React Native CLI: `npm install -g react-native-cli`
4. Navigate to the project directory and run: `npm install`
5. Set up your Gemini API key:
   - Create a `.env` file in the root directory
   - Add your API key to this file: `GEMINI_API_KEY=your_api_key_here`
   - Ensure this file is added to .gitignore to keep your API key secure
6. To run the app:
   - For iOS: `npx react-native run-ios`
   - For Android: `npx react-native run-android`

[Include any additional setup instructions or requirements]

## Contributing

[Include guidelines for contributing to the project, coding standards, and the process for submitting pull requests.]

## License

[Include information about the project's license.]

## Project Documentation

### Docs Folder Structure

- [AIGameMasterLogic.md](Docs/AIGameMasterLogic.md): Details on the AI Game Master's logic and decision-making processes.
- [ArchitectureDecisionRecord.md](Docs/ArchitectureDecisionRecord.md): Record of key architectural decisions made for the project.
- [ComponentBreakdown.md](Docs/ComponentBreakdown.md): Breakdown of the main components of the BootHillGM project.
- [DevelopmentRoadmap.md](Docs/DevelopmentRoadmap.md): Roadmap outlining the development phases and milestones.
- [GameDesignDocument.md](Docs/GameDesignDocument.md): Comprehensive game design document.
- [ProjectOverview.md](Docs/ProjectOverview.md): High-level overview of the BootHillGM project.
- [RiskAssessment.md](Docs/RiskAssessment.md): Assessment of potential risks and mitigation strategies.
- [TechnicalSpecification.md](Docs/TechnicalSpecification.md): Detailed technical specifications for the project.

#### BootHill Folder
- [Boot Hill v2 Basic Rules.txt](Docs/BootHill/Boot%20Hill%20v2%20Basic%20Rules.txt): Basic rules for Boot Hill version 2.

#### Technical Folder
- [Gemini-API-Integration-Guide.md](Docs/Technical/Gemini-API-Integration-Guide.md): Guide for integrating the Gemini API.
- [React-Native-Best-Practices.md](Docs/Technical/React-Native-Best-Practices.md): Best practices for React Native development.

#### Wireframes Folder
- [UIWireframes.md](Docs/Wireframes/UIWireframes.md): User interface wireframes for the app.