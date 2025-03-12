import React, { useState, useCallback } from 'react';
import { useNarrativeContext } from '../../hooks/useNarrativeContext';
import { PlayerDecision, DecisionImportance } from '../../types/narrative.types';
import styles from './PlayerDecisionCard.module.css';

interface PlayerDecisionCardProps {
  decision?: PlayerDecision;
  onDecisionMade?: (decisionId: string, optionId: string) => void;
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
 * Handles displaying the decision prompt, options, and submitting player choices
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
  
  // Get narrative context functions
  const { recordPlayerDecision } = useNarrativeContext();

  // Handle option selection
  const handleOptionSelect = (optionId: string) => {
    if (!isSubmitting) {
      setSelectedOptionId(optionId);
      setError(null); // Clear any previous errors when making a new selection
    }
  };

  // Handle decision submission - this must be defined even if decision is null
  const handleSubmit = useCallback(async () => {
    if (!selectedOptionId || !decision || isSubmitting) {
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
    } finally {
      setIsSubmitting(false);
    }
  }, [decision, selectedOptionId, isSubmitting, recordPlayerDecision, onDecisionMade]);

  // If no decision is provided, don't render anything
  if (!decision) {
    return null;
  }

  // Get the appropriate importance class
  const importanceClass = importanceClasses[decision.importance] || styles['bhgm-decision-moderate'];

  // Check if we have valid options
  const hasOptions = Array.isArray(decision.options) && decision.options.length > 0;

  return (
    <div className={`${styles['bhgm-decision-card']} ${importanceClass} ${className}`} data-testid="player-decision-card">
      {/* Importance indicator */}
      <div className={styles['bhgm-decision-importance-indicator']}>
        <span className={styles['bhgm-decision-importance-label']}>{decision.importance}</span>
      </div>
      
      {/* Decision prompt */}
      <div className={styles['bhgm-decision-prompt']}>
        <h3>{decision.prompt}</h3>
      </div>
      
      {/* Decision options */}
      {hasOptions ? (
        <div className={styles['bhgm-decision-options-container']}>
          {decision.options.map(option => (
            <button
              key={option.id}
              className={`${styles['bhgm-decision-option-button']} ${selectedOptionId === option.id ? styles['bhgm-decision-option-selected'] : ''}`}
              onClick={() => handleOptionSelect(option.id)}
              disabled={isSubmitting}
              aria-selected={selectedOptionId === option.id ? true : false}
              data-testid={`option-${option.id}`}
            >
              {option.text}
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
        <div className={styles['bhgm-decision-error']} data-testid="decision-error-message">
          {error}
        </div>
      )}
      
      {/* Submit button */}
      <div className={styles['bhgm-decision-action-container']}>
        <button
          className={styles['bhgm-decision-submit-button']}
          onClick={handleSubmit}
          disabled={!selectedOptionId || isSubmitting || !hasOptions}
          data-testid="decision-submit-button"
        >
          {isSubmitting ? 'Deciding...' : 'Confirm Decision'}
        </button>
      </div>
    </div>
  );
};

export default PlayerDecisionCard;