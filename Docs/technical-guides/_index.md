---
title: Technical Guides Overview
aliases: [Technical Guides MOC, Development Guides]
tags: [moc, technical, guides, development]
created: 2024-12-28
updated: 2024-12-28
---

# Technical Guides Overview

This Map of Content (MOC) provides a comprehensive overview of technical guides and development documentation for BootHillGM.

## Development Setup
- [[setup|Development Setup]] - Initial development environment setup
- [[environment-configuration|Environment Configuration]] - Development environment setup
- [[dependencies|Required Dependencies]] - Project dependencies
- [[workflow|Development Workflow]] - Local development process

## Deployment
- [[deployment|Deployment Guide]] - Production deployment procedures
- Environment variables
- Build process
- Deployment verification

## Testing
- [[testing|Testing Guide]] - Comprehensive testing documentation
- Unit testing
- Integration testing
- E2E testing
- Test coverage requirements

## Contributing
- [[contributing|Contributing Guide]] - Contribution guidelines
- Code standards
- PR process
- Review guidelines

## Development Workflow
```mermaid
graph TD
    A[Setup] --> B[Development]
    B --> C[Testing]
    C --> D[PR Review]
    D --> E[Deployment]
    B --> F[Documentation]
```

## Quick Reference
| Guide | Primary Use | Required |
|-------|-------------|-----------|
| Setup | Initial Dev | Yes |
| Deployment | Production | Yes |
| Testing | Quality | Yes |
| Contributing | Collaboration | Yes |

## Technical Stack
### Frontend
- Next.js 14
- React
- TypeScript
- Tailwind CSS

### Development Tools
- VS Code
- Jest
- React Testing Library
- ESLint

## Integration Points
### Architecture
- [[../architecture/next-js-setup|Next.js Setup]]
- [[../architecture/component-structure|Component Structure]]
- [[../architecture/api-integration|API Integration]]

### Core Systems
- [[../core-systems/state-management|State Management]]
- [[../core-systems/ai-integration|AI Integration]]

## Best Practices
### Code Quality
- TypeScript usage
- Testing requirements
- Code style
- Documentation standards

### Performance
- Build optimization
- Runtime performance
- Testing performance
- Deployment efficiency

## Related Documentation
- [[../meta/project-overview|Project Overview]]
- [[../planning/roadmap|Development Roadmap]]
- [[../issues/open-issues|Open Issues]]