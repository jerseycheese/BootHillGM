---
title: Next.js Setup
aliases: [Next.js Configuration, Framework Setup]
tags: [architecture, setup, nextjs, framework]
created: 2024-12-28
updated: 2024-12-28
author: Jack Haas
---

# Next.js Setup

## Overview
This document outlines the setup and configuration of the Next.js framework for BootHillGM. It covers the initial project setup, configuration files, and integration with other systems.

## Purpose
The Next.js Setup documentation aims to:
- Provide technical implementation details for developers
- Document framework configuration and setup
- Serve as a reference for Next.js-related components
- Maintain consistency across system integrations

## Configuration Files

### next.config.mjs
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./app/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
  "exclude": ["node_modules"]
}
```

## Integration Points

### State Management
- React Context integration
- State persistence
- Error handling

For details, see [[../core-systems/state-management|State Management]].

### AI Integration
- API route configuration
- Error handling
- Response processing

For AI details, see [[../core-systems/ai-integration|AI Integration]].

### Combat System
- Turn management
- State updates
- UI rendering

For combat details, see [[../core-systems/combat-system|Combat System]].

## Related Documentation
- [[../architecture/architecture-decisions|Architecture Decision Record]]
- [[../technical-guides/testing|Testing Guide]]
- [[../core-systems/state-management|State Management]]
- [[../core-systems/ai-integration|AI Integration]]
