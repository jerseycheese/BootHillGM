---
title: Feature Flag System Example
aliases: [Feature Toggle System]
tags: [development, feature-flags, example]
created: 2025-03-23
updated: 2025-03-23
---

# Feature Flag System Example

> [!info]
> This document provides a simple feature flag implementation that follows KISS principles.

## Implementation Files

### 1. Feature Flags Definition

```typescript
// lib/featureFlags.ts
export interface FeatureFlags {
  enableCharacterCreation: boolean;
  enableCombat: boolean;
  enableJournal: boolean;
  enableInventory: boolean;
  enableNarrativeGeneration: boolean;
  // New features in development
  enableExtendedCombat: boolean;
  enableMultiCharacter: boolean;
}

const defaultFlags: FeatureFlags = {
  enableCharacterCreation: true,
  enableCombat: true,
  enableJournal: true,
  enableInventory: true,
  enableNarrativeGeneration: true,
  // New features in development
  enableExtendedCombat: false,
  enableMultiCharacter: false,
};

// Environment-specific overrides
const envFlags = process.env.NEXT_PUBLIC_FEATURE_FLAGS
  ? JSON.parse(process.env.NEXT_PUBLIC_FEATURE_FLAGS)
  : {};

// Merge default flags with environment overrides
export const featureFlags: FeatureFlags = {
  ...defaultFlags,
  ...envFlags,
};
```

### 2. Feature Flag Hook

```typescript
// lib/featureFlags.ts (continued)
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  // Allow for dynamic override in development
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const urlParams = new URLSearchParams(window.location.search);
    const paramValue = urlParams.get(`feature_${String(flag)}`);
    
    if (paramValue === 'true') return true;
    if (paramValue === 'false') return false;
  }
  
  return featureFlags[flag];
}
```

### 3. Feature Flag Component

```tsx
// components/ui/FeatureFlag.tsx
'use client';

import { useFeatureFlag } from '@/lib/featureFlags';

interface FeatureFlagProps {
  name: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureFlag({ name, children, fallback = null }: FeatureFlagProps) {
  const isEnabled = useFeatureFlag(name);
  
  return isEnabled ? <>{children}</> : <>{fallback}</>;
}
```

## Usage Examples

### Basic Usage

```tsx
import { FeatureFlag } from '@/components/ui/FeatureFlag';

export function GameLayout({ children }) {
  return (
    <div className="game-layout">
      <FeatureFlag name="enableCombat">
        <CombatControls />
      </FeatureFlag>
      
      <FeatureFlag 
        name="enableExtendedCombat" 
        fallback={<BasicCombatUI />}
      >
        <AdvancedCombatUI />
      </FeatureFlag>
      
      {children}
    </div>
  );
}
```

### Usage with Hook

```tsx
'use client';

import { useFeatureFlag } from '@/lib/featureFlags';

export function CharacterSheet() {
  const enableMultiCharacter = useFeatureFlag('enableMultiCharacter');
  
  return (
    <div>
      <h1>Character Sheet</h1>
      {enableMultiCharacter && (
        <CharacterSelector />
      )}
      {/* Other character sheet content */}
    </div>
  );
}
```

### Environment Configuration

```
# .env.local
NEXT_PUBLIC_FEATURE_FLAGS={"enableExtendedCombat":true,"enableMultiCharacter":false}
```

### URL Override (Development Only)

```
http://localhost:3000/characters?feature_enableMultiCharacter=true
```

## Benefits of this Approach

1. **Simplicity**: Plain JavaScript objects and a simple React component
2. **Typesafe**: TypeScript ensures feature flag names are valid
3. **Environment-based**: Configure via environment variables
4. **Development Overrides**: Test features via URL parameters in development
5. **Minimal Dependencies**: No external libraries required
6. **Incremental Adoption**: Gradually add feature flags as needed

## When to Add New Feature Flags

1. For features under active development
2. For features that need to be toggled in different environments
3. For A/B testing different implementations
4. For gradual rollout of major changes

## When to Remove Feature Flags

1. When a feature is stable and fully adopted
2. When a feature has been live without issues for at least 2 release cycles
3. When a feature experiment has concluded

Always document the removal of feature flags in commit messages and update the `FeatureFlags` interface.
