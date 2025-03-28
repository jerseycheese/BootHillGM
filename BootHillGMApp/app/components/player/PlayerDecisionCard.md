# PlayerDecisionCard Component

## Overview

The `PlayerDecisionCard` component displays interactive decision points to the player in an engaging and visually appealing way. It's part of the Player Decision Impact System and presents decisions extracted from AI responses with proper styling based on importance levels.

This component is designed to be integrated into the narrative flow of the game, allowing players to make meaningful choices that impact the story.

## Usage

### Basic Usage

```tsx
import PlayerDecisionCard from '../components/player/PlayerDecisionCard';
import { PlayerDecision } from '../types/narrative.types';

// Sample decision data
const decision: PlayerDecision = {
  id: 'decision-123',
  prompt: 'What will you do about the suspicious stranger?',
  timestamp: Date.now(),
  options: [
    { id: 'option1', text: 'Confront them directly', impact: 'May lead to conflict' },
    { id: 'option2', text: 'Observe from a distance', impact: 'Could learn more information' }
  ],
  context: 'You notice a stranger watching you from across the saloon.',
  importance: 'significant',
  characters: ['Suspicious Stranger'],
  aiGenerated: true
};

// In your component
function GameScreen() {
  const handleDecisionMade = (decisionId, optionId) => {
    console.log(`Decision ${decisionId}, option ${optionId} selected`);
    // Handle recording the decision...
  };

  return (
    <div className="game-screen">
      <PlayerDecisionCard 
        decision={decision}
        onDecisionMade={handleDecisionMade}
      />
    </div>
  );
}
```

### Integration with NarrativeContext

The recommended way to use this component is with the `NarrativeWithDecisions` component, which handles integration with the narrative system:

```tsx
import NarrativeWithDecisions from '../components/narrative/NarrativeWithDecisions';

function GameScreen() {
  return (
    <div className="game-screen">
      <NarrativeWithDecisions />
      {/* Other game UI elements... */}
    </div>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `decision` | `PlayerDecision \| undefined` | No | The decision to display. If undefined, nothing will be rendered. |
| `onDecisionMade` | `(decisionId: string, optionId: string) => void` | No | Callback function called when a decision is made. |
| `className` | `string` | No | Additional CSS class name to apply to the component. |

## Decision Importance

The component will apply different styling based on the `importance` field in the decision:

- `critical`: Red highlighting, indicates a major story-changing decision
- `significant`: Orange highlighting, indicates an important decision
- `moderate`: Grey highlighting, standard decision (default)
- `minor`: Green highlighting, indicates a less impactful decision

## CSS Classes

Following the Boot Hill GM naming convention, the component uses these CSS classes:

- `bhgm-decision-card`: Main container element for the decision card
- `bhgm-decision-importance-indicator`: Visual indicator of decision importance
- `bhgm-decision-importance-label`: Text label showing importance level
- `bhgm-decision-prompt`: Container for the decision prompt text
- `bhgm-decision-options-container`: Wrapper for option buttons
- `bhgm-decision-option-button`: Individual option button
- `bhgm-decision-option-selected`: Selected option state
- `bhgm-decision-action-container`: Container for action buttons
- `bhgm-decision-submit-button`: Decision submission button
- `bhgm-decision-critical`, `bhgm-decision-significant`, etc.: Importance-specific classes

## States

The component handles several states:

- **Initial State**: Shows the decision prompt and options
- **Selected State**: An option is selected but not yet confirmed
- **Submitting State**: The decision is being processed, shows a loading indicator
- **Error State**: If an error occurs during submission, an error message is displayed

## Accessibility

The component includes the following accessibility features:

- Proper ARIA attributes for option selection
- Keyboard navigation support
- Focus states for interactive elements
- Responsive design for different screen sizes
- Data test IDs for testing (`player-decision-card`, `option-<id>`, etc.)

## Error Handling

The component handles several error cases:

- Missing decision data: Renders nothing
- Empty options array: Shows a message indicating no options are available
- Submission errors: Displays error message with error details

## Related Components

- `NarrativeWithDecisions`: Integrates this component with the narrative display
- `NarrativeDisplay`: Shows the narrative text content

## Related Hooks

- `useNarrativeContext`: Provides access to the narrative state and methods for handling decisions

## Example

Here's a complete example with error handling:

```tsx
import React from 'react';
import PlayerDecisionCard from '../components/player/PlayerDecisionCard';
import { useNarrativeContext } from '../hooks/useNarrativeContext';

function GameDecisionSection() {
  const { currentDecision, recordPlayerDecision } = useNarrativeContext();
  const [error, setError] = useState<string | null>(null);

  const handleDecisionMade = async (decisionId: string, optionId: string) => {
    try {
      setError(null);
      await recordPlayerDecision(decisionId, optionId);
      // Success handling here if needed
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  // Only render if we have an active decision
  if (!currentDecision) {
    return null;
  }

  return (
    <div className="decision-section">
      <PlayerDecisionCard 
        decision={currentDecision}
        onDecisionMade={handleDecisionMade}
      />
      {error && (
        <div className="bhgm-decision-error">
          Error: {error}
        </div>
      )}
    </div>
  );
}
```

## CSS Customization

The component uses CSS modules for styling. To customize the appearance, you can either:

1. Override the CSS variables used in the component:

```css
:root {
  --card-bg: #2d2d2d;
  --critical-color: #e63946;
  --significant-color: #f4a261;
  --moderate-color: #6c757d;
  --minor-color: #2a9d8f;
  /* ... other variables */
}
```

2. Pass a custom className and add your styles:

```tsx
<PlayerDecisionCard 
  decision={decision}
  className="custom-decision-card"
/>
```

```css
.custom-decision-card {
  /* Your custom styles */
}
```
