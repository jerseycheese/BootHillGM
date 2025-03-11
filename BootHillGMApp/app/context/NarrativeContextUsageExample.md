# NarrativeContext Usage Example

This document provides examples of how to use the NarrativeContext in your React components.

## 1. Wrapping Your App with NarrativeProvider

First, wrap your application (or the relevant part) with the `NarrativeProvider`:

```tsx
// In app/layout.tsx or another parent component
import { NarrativeProvider } from './context/NarrativeContext';

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>
        <NarrativeProvider>
          {children}
        </NarrativeProvider>
      </body>
    </html>
  );
}
```

## 2. Using the Narrative Context in a Component

Use the `useNarrative` hook to access the narrative state and dispatch actions:

```tsx
// In your component
import { useNarrative } from '../context/NarrativeContext';
import { 
  addNarrativeHistory, 
  setDisplayMode, 
  startNarrativeArc 
} from '../reducers/narrativeReducer';

const NarrativeComponent = () => {
  const { state, dispatch } = useNarrative();
  
  const handleNewNarrative = (text) => {
    dispatch(addNarrativeHistory(text));
  };
  
  const changeDisplayMode = (mode) => {
    dispatch(setDisplayMode(mode));
  };
  
  const startNewArc = (arcId) => {
    dispatch(startNarrativeArc(arcId));
  };
  
  return (
    <div>
      <h2>Current Display Mode: {state.displayMode}</h2>
      
      <div className="narrative-history">
        {state.narrativeHistory.map((text, index) => (
          <div key={index} className="narrative-entry">
            {text}
          </div>
        ))}
      </div>
      
      <div className="controls">
        <button onClick={() => handleNewNarrative("New narrative text")}>
          Add Narrative
        </button>
        
        <select 
          value={state.displayMode} 
          onChange={(e) => changeDisplayMode(e.target.value)}
        >
          <option value="standard">Standard</option>
          <option value="flashback">Flashback</option>
          <option value="dream">Dream</option>
          <option value="letter">Letter</option>
          <option value="journal">Journal</option>
          <option value="dialogue">Dialogue</option>
        </select>
      </div>
    </div>
  );
};
```

## 3. Integration with Other Context Providers

If you need to use the `NarrativeContext` alongside other context providers, here's a pattern to follow:

```tsx
// In app/layout.tsx or another parent component
import { NarrativeProvider } from './context/NarrativeContext';
import { CampaignStateProvider } from './components/CampaignStateManager';

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>
        <CampaignStateProvider>
          <NarrativeProvider>
            {children}
          </NarrativeProvider>
        </CampaignStateProvider>
      </body>
    </html>
  );
}
```

## 4. Accessing Narrative State for AI Interactions

When you need to provide narrative history to AI services:

```tsx
import { useNarrative } from '../context/NarrativeContext';
import { getAIResponse } from '../services/ai/gameService';

const AIInteractionComponent = () => {
  const { state } = useNarrative();
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAIInteraction = async () => {
    setIsLoading(true);
    
    try {
      // Get narrative context for AI
      const narrativeContext = state.narrativeHistory.join('\n');
      
      // Call AI service with narrative context
      const response = await getAIResponse(
        userInput,
        narrativeContext,
        [] // inventory or other context
      );
      
      // Handle response...
      
    } catch (error) {
      console.error('Error in AI interaction:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <textarea 
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Enter your action..."
      />
      
      <button 
        onClick={handleAIInteraction}
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Submit'}
      </button>
    </div>
  );
};
```

## 5. Persisting Game State with Narrative Data

The NarrativeContext includes state saving/loading capabilities:

```tsx
import { useNarrative } from '../context/NarrativeContext';

const GameSaveComponent = () => {
  const { saveNarrativeState, loadNarrativeState, resetNarrativeState } = useNarrative();
  
  const handleManualSave = () => {
    // Get current narrative state and save it
    const { state } = useNarrative();
    saveNarrativeState(state);
    // Show a notification to the user
    alert('Game narrative saved!');
  };
  
  const handleManualLoad = () => {
    const loadedState = loadNarrativeState();
    if (loadedState) {
      alert('Game narrative loaded!');
    } else {
      alert('No saved narrative found!');
    }
  };
  
  const handleReset = () => {
    if (confirm('Are you sure you want to reset the narrative? This cannot be undone.')) {
      resetNarrativeState();
      alert('Narrative reset to initial state.');
    }
  };
  
  return (
    <div className="save-controls">
      <button onClick={handleManualSave}>Save Narrative</button>
      <button onClick={handleManualLoad}>Load Narrative</button>
      <button onClick={handleReset}>Reset Narrative</button>
    </div>
  );
};
```

## 6. Migrating from an existing setup

If you were previously accessing narrative state through the `CampaignStateManager`:

**Before:**
```tsx
import { useCampaignState } from '../components/CampaignStateManager';

const NarrativeComponent = () => {
  const { state, dispatch } = useCampaignState();
  
  const addToNarrative = (text) => {
    dispatch({
      type: 'UPDATE_NARRATIVE',
      payload: {
        ...state.narrative,
        narrativeHistory: [...state.narrative.narrativeHistory, text]
      }
    });
  };
  
  // Rest of component...
};
```

**After:**
```tsx
import { useNarrative } from '../context/NarrativeContext';
import { addNarrativeHistory } from '../reducers/narrativeReducer';

const NarrativeComponent = () => {
  const { state, dispatch } = useNarrative();
  
  const addToNarrative = (text) => {
    dispatch(addNarrativeHistory(text));
  };
  
  // Rest of component...
};
```

## 7. Using the Player Decision Tracking System

This section demonstrates how to create, present, and record player decisions using the `NarrativeContext` and related utility functions.

```typescript
// In your component
import { useNarrative } from '../context/NarrativeContext';
import {
  presentDecision,
  recordDecision,
  clearCurrentDecision,
} from '../reducers/narrativeReducer';
import {
  createDecision,
  createDecisionOption,
} from '../utils/decisionUtils';

const DecisionComponent = () => {
  const { state, dispatch } = useNarrative();

  const handlePresentDecision = () => {
    // Create decision options
    const option1 = createDecisionOption(
      'Go to the saloon',
      'You might find some information at the saloon.'
    );
    const option2 = createDecisionOption(
      'Visit the sheriff\'s office',
      'The sheriff might have some leads.'
    );

    // Create the decision
    const decision = createDecision(
      'You arrive at a crossroads. Which way do you go?',
      [option1, option2],
      'The player has just arrived in town.',
      'moderate',
      { type: 'town', name: 'Dusty Gulch' }
    );

    // Present the decision to the player
    dispatch(presentDecision(decision));
  };

  const handleRecordDecision = (selectedOptionId) => {
    if (state.currentDecision) {
      // Record the decision with a placeholder narrative for now
      dispatch(
        recordDecision(state.currentDecision.id, selectedOptionId, 'You chose an option.')
      );
    }
  };

  return (
    <div>
      {state.currentDecision ? (
        <div>
          <h2>{state.currentDecision.prompt}</h2>
          <ul>
            {state.currentDecision.options.map((option) => (
              <li key={option.id}>
                <button onClick={() => handleRecordDecision(option.id)}>
                  {option.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <button onClick={handlePresentDecision}>Present Decision</button>
      )}

      <h3>Decision History:</h3>
      <ul>
        {state.narrativeContext?.decisionHistory.map((record, index) => (
          <li key={index}>
            Decision: {record.decisionId}, Option Chosen: {record.selectedOptionId}
          </li>
        ))}
      </ul>
    </div>
  );
};
