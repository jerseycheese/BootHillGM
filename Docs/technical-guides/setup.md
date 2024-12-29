---
title: Development Setup Guide
aliases: [Setup Guide, Installation Guide, Development Environment]
tags: [technical, setup, development, next-js, environment]
created: 2024-12-28
updated: 2024-12-28
---

# Development Setup Guide

## Prerequisites

### Required Software
- Node.js (v18.17 or later)
- npm (v9.0 or later)
- Git
- VSCode (recommended)

### Environment Setup
1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Verify installation:
```bash
node --version
npm --version
```

## Project Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/BootHillGM.git
cd BootHillGM
```

### 2. Install Dependencies
```bash
cd BootHillGMApp
npm install
```

### 3. Environment Configuration
Create `.env.local` in the BootHillGMApp directory:
```env
GEMINI_API_KEY=your_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Development Tools

### VSCode Extensions
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Jest Runner

### Configuration Files
- `.eslintrc.json`: ESLint configuration
- `jest.config.js`: Jest testing setup
- `tailwind.config.ts`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration
- `next.config.mjs`: Next.js configuration

## Running the Application

### Development Server
```bash
npm run dev
```
Access the application at: http://localhost:3000

### Building for Production
```bash
npm run build
npm start
```

### Running Tests
```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

## Project Structure

### Key Directories
```
BootHillGMApp/
├── app/                 # Next.js app directory
│   ├── components/     # React components
│   ├── hooks/         # Custom React hooks
│   ├── services/      # External services
│   ├── styles/        # CSS styles
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
├── public/            # Static assets
└── tests/             # Test files
```

## Development Workflow

### 1. Code Style
- Follow ESLint rules
- Use Prettier for formatting
- Follow TypeScript best practices
- Maintain consistent component structure

### 2. Git Workflow
- Create feature branches
- Write descriptive commit messages
- Follow conventional commits
- Submit pull requests for review

### 3. Testing Requirements
- Write tests for new features
- Maintain test coverage
- Run test suite before commits
- Update tests for changes

## Troubleshooting

### Common Issues
1. Node Version Mismatch
   - Solution: Use nvm to manage Node versions
   - Run: `nvm use` in project root

2. Build Errors
   - Clear next cache: `npm run clean`
   - Remove node_modules: `rm -rf node_modules`
   - Fresh install: `npm install`

3. Test Failures
   - Check Jest configuration
   - Verify test environment
   - Update test snapshots if needed

## API Integration

### Gemini API Setup
1. Obtain API key from Google Cloud Console
2. Add key to `.env.local`
3. Configure API client in `services/ai/`
4. Test connection with provided utilities

## Performance Optimization

### Development Tips
- Use React DevTools
- Monitor bundle size
- Implement code splitting
- Optimize image assets

## Related Documentation
- [[../architecture/next-js-setup|Next.js Architecture]]
- [[testing|Testing Guide]]
- [[deployment|Deployment Guide]]
- [[contributing|Contributing Guide]]
- [[../reference/gemini-api-guide|Gemini API Guide]]