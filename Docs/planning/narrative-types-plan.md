# Narrative Types Implementation Plan

This document outlines the plan for implementing the narrative types as specified in Issue #173.

## Goal

Create the `/app/types/narrative.types.ts` file and a minimal viable test file (`/app/types/__tests__/narrative.types.test.ts`) according to the provided specification.

## Steps

1.  **Create `/app/types/narrative.types.ts`:**
    *   Create the file.
    *   Populate it with the provided content.
    *   Adjust import paths to:
        *   `import { Character } from './character';`
        *   `import { InventoryItem } from './item.types';`
        *   `import { JournalEntry } from './journal';`
        *   `import { LocationType } from '../services/locationService';`

2.  **Create `/app/types/__tests__/narrative.types.test.ts`:**
    *   Create a minimal test file.
    *   Include basic tests to verify:
        *   Correct import of types.
        *   Basic structure of `StoryPoint`, `NarrativeState`, and `initialNarrativeState`.
        *   Type guards (`isStoryPoint`, `isNarrativeChoice`) function correctly.

## Visual Representation

```mermaid
graph LR
    A[Create narrative.types.ts] --> B(Import statements);
    B --> C(Define interfaces and types);
    C --> D(Define initial state);
    A --> E[Create narrative.types.test.ts];
    E --> F(Import types);
    F --> G(Basic structural tests);
    F --> H(Type guard tests);