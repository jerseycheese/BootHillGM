---
title: Required Dependencies
aliases: [Project Dependencies, Dependencies Guide]
tags: [technical, dependencies, packages, development]
created: 2024-12-28
updated: 2024-12-28
---

# Required Dependencies

This guide covers all required dependencies for BootHillGM development, including core dependencies, development tools, and testing frameworks.

## Core Dependencies

### Framework
- Next.js 14
- React 18
- TypeScript 5

### Styling
- Tailwind CSS
- PostCSS
- Autoprefixer

### State Management
- React Context API
- React Hooks

## Development Dependencies

### Code Quality
```json
{
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "14.0.0",
    "prettier": "^3.0.0"
  }
}
```

### Testing
```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/react": "^14.0.0",
    "@types/jest": "^29.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0"
  }
}
```

## Installation

### Fresh Install
```bash
npm install
```

### Updating Dependencies
```bash
npm update
```

### Dependency Maintenance
- Regular security audits: `npm audit`
- Vulnerability fixes: `npm audit fix`
- Outdated packages check: `npm outdated`

## Version Management

### Package Versioning
- Use exact versions for core dependencies
- Use caret ranges (^) for development dependencies
- Lock file maintenance: `npm shrinkwrap`

### Version Compatibility
| Package | Required Version | Notes |
|---------|-----------------|-------|
| Node.js | ≥18.17.0 | LTS version |
| npm | ≥9.0.0 | Included with Node |
| TypeScript | ≥5.0.0 | Required for build |
| React | ≥18.0.0 | Required for hooks |

## Troubleshooting

### Common Issues
1. Peer dependency conflicts
   - Solution: Check package compatibility
2. Version mismatches
   - Solution: Update package.json and reinstall
3. Build errors
   - Solution: Clear cache and node_modules

## Related Documentation
- [[./environment-configuration|Environment Configuration]]
- [[./setup|Development Setup]]
- [[../architecture/next-js-setup|Next.js Setup]]
- [[./workflow|Development Workflow]]
