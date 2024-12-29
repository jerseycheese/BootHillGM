---
title: Environment Configuration
aliases: [Dev Environment Config, Environment Setup]
tags: [technical, configuration, development, environment]
created: 2024-12-28
updated: 2024-12-28
---

# Environment Configuration

This guide covers the environment configuration requirements and setup for BootHillGM development.

## Required Software

### Node.js Environment
- Node.js v18.17 or higher
- npm v9.x or higher
- yarn (optional)

### Development Tools
- Git
- VS Code (recommended)
- Chrome/Firefox Developer Tools

## Environment Variables

### Development Environment
```env
NEXT_PUBLIC_GEMINI_API_KEY=your-api-key
NEXT_PUBLIC_API_ENDPOINT=http://localhost:3000/api
NODE_ENV=development
```

### Production Environment
```env
NEXT_PUBLIC_GEMINI_API_KEY=production-api-key
NEXT_PUBLIC_API_ENDPOINT=https://api.boothillgm.com
NODE_ENV=production
```

## VS Code Configuration

### Recommended Extensions
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense

### Workspace Settings
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Local Development Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local`
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Troubleshooting

### Common Issues
1. Node version mismatch
   - Solution: Use nvm to switch to the correct version
2. Missing environment variables
   - Solution: Verify all required variables in `.env.local`
3. Port conflicts
   - Solution: Change port in `next.config.mjs`

## Related Documentation
- [[setup|Development Setup]]
- [[deployment|Deployment Guide]]
- [[../architecture/next-js-setup|Next.js Setup]]
- [[contributing|Contributing Guide]]