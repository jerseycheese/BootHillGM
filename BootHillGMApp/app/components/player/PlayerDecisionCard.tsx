import React, { useState, useCallback, useEffect } from 'react';
import { useNarrativeContext } from '../../hooks/useNarrativeContext';
import { PlayerDecision, DecisionImportance } from '../../types/narrative.types';
import styles from './PlayerDecisionCard.module.css';

interface PlayerDecisionCardProps {
  /**
   * The decision to display to the player.
   * If not provided, the component will not render.
   */
  decision?: PlayerDecision;
  
  /**
   * Optional callback that's called when the player makes a decision.
   * Receives the decision ID and the selected option ID.
   */
  onDecisionMade?: (decisionId: string, optionId: string) => void;
  
  /**
   * Optional CSS class to apply to the component.
   */
  className?: string;
}

/**
 * Maps decision importance to CSS classes for visual styling
 */
const importanceClasses: Record<DecisionImportance, string> = {
  critical: styles['bhgm-decision-critical'],
  significant: styles['bhgm-decision-significant'],
  moderate: styles['bhgm-decision-moderate'],
  minor: styles['bhgm-decision-minor']
};

/**
 * Component for displaying an interactive decision card to the player
 * 
 * Decisions are presented as options that can be selected, with contextual information about potential
 * impacts. Once the player makes their choice, the decision is recorded in the
 * narrative context.
 */
const PlayerDecisionCard: React.FC<PlayerDecisionCardProps> = ({
  decision,
  onDecisionMade,
  className = ''
}) => {
  // Local state for tracking selection and loading state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoverOptionId, setHoverOptionId] = useState<string | null>(null);
  
  // Get narrative context functions
  const { recordPlayerDecision, isGeneratingNarrative } = useNarrativeContext();
  
  // Combine local and context loading states
  const isLoading = isSubmitting || isGeneratingNarrative;
  
  // Add a storage event listener to force re-renders
  useEffect(() => {
    const forceUpdate = () => {
      // No state change needed - the event just triggers a re-render
    };
    
    window.addEventListener('storage', forceUpdate);
    return () => window.removeEventListener('storage', forceUpdate);
  }, [decision]);

  /**
   * Handle option selection
   * Similar to a radio button in a form
   */
  const handleOptionSelect = (optionId: string) => {
    if (!isLoading) {
      setSelectedOptionId(optionId);
      setError(null); // Clear any previous errors when making a new selection
    }
  };

  /**
   * Handle decision submission
   */
  const handleSubmit = useCallback(async () => {
    if (!selectedOptionId || !decision || isLoading) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      // Record the decision in the narrative context
      await recordPlayerDecision(decision.id, selectedOptionId);
      
      // Call the callback if provided
      if (onDecisionMade) {
        onDecisionMade(decision.id, selectedOptionId);
      }
    } catch (error) {
      console.error('Failed to record decision:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setIsSubmitting(false);
    }
    // We don't set isSubmitting to false here as it will be cleared when the component unmounts
    // after the decision is processed
  }, [decision, selectedOptionId, isLoading, recordPlayerDecision, onDecisionMade]);

  // If no decision is provided, don't render anything
  if (!decision) {
    return null;
  }

  // Get the appropriate importance class
  const importanceClass = importanceClasses[decision.importance] || styles['bhgm-decision-moderate'];

  // Check if we have valid options
  const hasOptions = Array.isArray(decision.options) && decision.options.length > 0;

  return (
    <div 
      className={`${styles['bhgm-decision-card']} ${importanceClass} ${className} ${isGeneratingNarrative ? styles['bhgm-decision-loading'] : ''}`} 
      data-testid="player-decision-card"
    >
      {/* Loading overlay */}
      {isGeneratingNarrative && (
        <div className={styles['bhgm-decision-overlay']}>
          <div className={styles['bhgm-decision-spinner-large']}></div>
          <p>Generating narrative response...</p>
        </div>
      )}
        
      {/* Importance indicator */}
      <div className={styles['bhgm-decision-importance-indicator']}>
        <span className={styles['bhgm-decision-importance-label']}>{decision.importance}</span>
      </div>
      
      {/* Decision prompt */}
      <div className={styles['bhgm-decision-prompt']}>
        <h3>{decision.prompt}</h3>
        
        {/* Context display */}
        {decision.context && (
          <p className={styles['bhgm-decision-context']}>{decision.context}</p>
        )}
      </div>
      
      {/* Decision options */}
      {hasOptions ? (
        <div 
          className={styles['bhgm-decision-options-container']} 
          role="radiogroup" 
          aria-labelledby="decision-options-label"
        >
          <div id="decision-options-label" className="sr-only">Available options</div>
          {decision.options.map(option => (
            <button
              key={option.id}
              className={`${styles['bhgm-decision-option-button']} ${selectedOptionId === option.id ? styles['bhgm-decision-option-selected'] : ''}`}
              onClick={() => handleOptionSelect(option.id)}
              onMouseEnter={() => setHoverOptionId(option.id)}
              onMouseLeave={() => setHoverOptionId(null)}
              disabled={isLoading}
              aria-pressed={selectedOptionId === option.id}
              data-testid={`option-${option.id}`}
            >
              <div className={styles['bhgm-decision-option-text']}>{option.text}</div>
              {option.impact && (selectedOptionId === option.id || hoverOptionId === option.id) && (
                <div className={styles['bhgm-decision-option-impact']}>{option.impact}</div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className={styles['bhgm-decision-no-options']} data-testid="no-options-message">
          No options available for this decision.
        </div>
      )}
      
      {/* Error message if applicable */}
      {error && (
        <div className={styles['bhgm-decision-error']} data-testid="decision-error-message" role="alert">
          {error}
        </div>
      )}
      
      {/* Submit button with loading state */}
      <div className={styles['bhgm-decision-action-container']}>
        <button
          className={styles['bhgm-decision-submit-button']}
          onClick={handleSubmit}
          disabled={!selectedOptionId || isLoading || !hasOptions}
          data-testid="decision-submit-button"
        >
          {isSubmitting ? 'Confirming...' : isGeneratingNarrative ? 'Generating response...' : 'Confirm Decision'}
        </button>
      </div>
    </div>
  );
};

/**
 * Optimized version of PlayerDecisionCard that only re-renders when props actually change.
 * This significantly improves performance by preventing unnecessary re-renders
 * when game state changes but the decision itself remains the same.
 */
export default React.memo(PlayerDecisionCard, (prevProps, nextProps) => {
  // Only re-render if the decision ID changes, or if the decision becomes null/defined
  if (!prevProps.decision && !nextProps.decision) return true; // Both null, no change
  if (!prevProps.decision || !nextProps.decision) return false; // One is null, one isn't
  return prevProps.decision.id === nextProps.decision.id; // Compare IDs
});