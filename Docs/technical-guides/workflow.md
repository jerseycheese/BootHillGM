---
title: Development Workflow
aliases: [Local Development Workflow, Development Process]
tags: [technical, workflow, development, process]
created: 2024-12-28
updated: 2024-12-28
---

# Development Workflow

This guide outlines the standard development workflow for contributing to BootHillGM.

## Local Development Setup

### Initial Setup
1. Clone the repository
2. Install dependencies ([[dependencies|see Dependencies Guide]])
3. Configure environment ([[environment-configuration|see Environment Configuration]])
4. Start development server

### Development Server
```bash
# Start the development server
npm run dev

# Run with specific port
npm run dev -- -p 3001

# Run with debugging
npm run dev -- --inspect
```

## Development Process

### 1. Feature Development
1. Create feature branch
   ```bash
   git checkout -b feature/feature-name
   ```
2. Implement changes
3. Run tests locally
   ```bash
   npm run test
   npm run test:watch # for development
   ```
4. Update documentation

### 2. Code Quality
- Run linting
  ```bash
  npm run lint
  npm run lint:fix
  ```
- Format code
  ```bash
  npm run format
  ```
- Type checking
  ```bash
  npm run type-check
  ```

### 3. Testing
- Unit tests
- Integration tests
- E2E tests (when applicable)
- Performance testing

### 4. Documentation
- Update relevant documentation
- Add JSDoc comments
- Update changelog
- Update README if needed

## Build Process

### Development Build
```bash
npm run build
npm run start
```

### Production Build
```bash
npm run build
npm run start:prod
```

## Git Workflow

### Branch Strategy
- main: Production-ready code
- develop: Development branch
- feature/*: New features
- bugfix/*: Bug fixes
- release/*: Release preparation

### Commit Guidelines
- Use conventional commits
- Include ticket numbers
- Keep commits focused

Example:
```bash
feat(combat): add weapon switching functionality (#123)
fix(ui): correct inventory display alignment (#124)
docs(api): update combat system documentation
```

## Code Review Process

### Pre-Review Checklist
- [ ] Tests passing
- [ ] Linting passing
- [ ] Documentation updated
- [ ] No console errors
- [ ] Performance verified

### Review Guidelines
1. Code quality
2. Test coverage
3. Performance impact
4. Security considerations
5. Documentation completeness

## Debugging

### Development Tools
- Chrome DevTools
- React Developer Tools
- Next.js Debug Tools

### Common Debug Commands
```bash
# Verbose logging
DEBUG=* npm run dev

# Node inspector
npm run dev -- --inspect

# Test debugging
npm run test:debug
```

## Related Documentation
- [[setup|Development Setup]]
- [[environment-configuration|Environment Configuration]]
- [[dependencies|Required Dependencies]]
- [[../technical-guides/testing|Testing Guide]]
- [[../technical-guides/contributing|Contributing Guide]]