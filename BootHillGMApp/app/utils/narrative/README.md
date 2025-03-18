# Narrative Context Optimization System

This module provides intelligent optimization of narrative context for AI requests, improving response quality while reducing token usage.

## Overview

The Narrative Context Optimization system performs several key functions:

1. **Content Prioritization**: Identifies the most relevant narrative elements for the current context
2. **Adaptive Compression**: Applies appropriate compression based on content size
3. **Token Budget Management**: Allocates tokens to different content types based on importance
4. **Context Synchronization**: Ensures narrative state is fresh before AI requests

## Core Components

### 🧠 Context Builder (`narrativeContextBuilder.ts`)

The brain of the system. Extracts, prioritizes, and structures narrative elements:

```typescript
import { buildNarrativeContext } from './narrativeContextBuilder';

const optimizedContext = buildNarrativeContext(narrativeState, {
  compressionLevel: 'medium',
  maxTokens: 2000,
  prioritizeRecentEvents: true
});
```

### 🗜️ Compression Utilities (`narrativeCompression.ts`)

Handles intelligent compression of narrative text:

```typescript
import { compressNarrativeText, estimateTokenCount } from './narrativeCompression';

const compressed = compressNarrativeText(longText, 'medium');
const tokenCount = estimateTokenCount(compressed);
```

### 🔄 Context Integration (`narrativeContextIntegration.ts`)

Provides hooks and utilities for integrating optimized context:

```typescript
import { useOptimizedNarrativeContext, useNarrativeContextSynchronization } from './narrativeContextIntegration';

// In your component
const { getDefaultContext, getFocusedContext } = useOptimizedNarrativeContext();
const { ensureFreshContext } = useNarrativeContextSynchronization();
```

### 🤖 AI Integration (`useAIWithOptimizedContext.ts`)

Main hook for making AI requests with optimized context:

```typescript
import { useAIWithOptimizedContext } from './useAIWithOptimizedContext';

// In your component
const { makeAIRequest, isLoading, error } = useAIWithOptimizedContext();

// Make an AI request
const handleAction = async (prompt) => {
  try {
    const response = await makeAIRequest(prompt, inventory);
    // Handle response...
  } catch (error) {
    // Handle error...
  }
};
```

## Usage Examples

### Basic Usage

```tsx
import { useAIWithOptimizedContext } from '../utils/narrative/useAIWithOptimizedContext';

function AIPromptComponent() {
  const { makeAIRequest, isLoading } = useAIWithOptimizedContext();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await makeAIRequest(prompt, inventory);
      setResponse(result.narrative);
    } catch (error) {
      console.error('AI request failed:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="What do you want to do?"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Thinking...' : 'Submit'}
      </button>
      {response && (
        <div className="narrative">
          {response}
        </div>
      )}
    </form>
  );
}
```

### Focused Context for Specific Scenarios

```tsx
import { useAIWithOptimizedContext } from '../utils/narrative/useAIWithOptimizedContext';

function CharacterInteractionPrompt({ characterName }) {
  const { makeAIRequestWithFocus } = useAIWithOptimizedContext();
  
  const handleInteract = async (action) => {
    // Focus context on this character and relevant themes
    const result = await makeAIRequestWithFocus(
      `I want to ${action} with ${characterName}`,
      inventory,
      [characterName, 'interaction', 'dialogue']
    );
    
    // Handle response...
  };
  
  // Component JSX...
}
```

### Limited Context for Quick Responses

```tsx
import { useAIWithOptimizedContext } from '../utils/narrative/useAIWithOptimizedContext';

function QuickActionPrompt() {
  const { makeAIRequestWithCompactContext } = useAIWithOptimizedContext();
  
  const handleQuickAction = async (action) => {
    // Use compact context for faster, token-efficient responses
    const result = await makeAIRequestWithCompactContext(
      `I ${action}`,
      inventory
    );
    
    // Handle response...
  };
  
  // Component JSX...
}
```

## Error Handling

The system includes built-in error handling:

```tsx
import { useAIWithOptimizedContext } from '../utils/narrative/useAIWithOptimizedContext';

function AIPromptWithErrorHandling() {
  const { makeAIRequest, isLoading, error } = useAIWithOptimizedContext();
  
  // Component logic...
  
  return (
    <div>
      {/* Form elements... */}
      
      {error && (
        <div className="error-message">
          Error: {error.message}
        </div>
      )}
    </div>
  );
}
```

## Further Documentation

For more detailed information, see:

- [Narrative Context Optimization Architecture](/Docs/architecture/narrative-optimization.md)
- [Stale Context Fix](/Docs/issues/issue-210-fix.md)
- [Narrative System Overview](/Docs/core-systems/narrative-system.md)
