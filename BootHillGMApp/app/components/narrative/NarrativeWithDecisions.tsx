import React, { useState, useEffect } from 'react';
import { useNarrativeContext } from '../../hooks/useNarrativeContext';
import PlayerDecisionCard from '../player/PlayerDecisionCard';
import { NarrativeDisplay } from '../NarrativeDisplay';
import styles from './NarrativeWithDecisions.module.css';

interface NarrativeWithDecisionsProps {
  className?: string;
}

/**
 * Component that integrates narrative display with decision cards
 * Handles the flow between narrative and decision states
 */
const NarrativeWithDecisions: React.FC<NarrativeWithDecisionsProps> = ({
  className = ''
}) => {
  const { 
    currentDecision, 
    hasActiveDecision, 
    recordPlayerDecision 
  } = useNarrativeContext();
  
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showDecision, setShowDecision] = useState(hasActiveDecision);
  const [error, setError] = useState<string | null>(null);
  
  // Update showDecision when hasActiveDecision changes
  useEffect(() => {
    if (hasActiveDecision && !showDecision) {
      // Add a slight delay before showing the decision to allow for animations
      const timer = setTimeout(() => {
        setShowDecision(true);
        setError(null); // Clear any previous errors
      }, 500);
      
      return () => clearTimeout(timer);
    } else if (!hasActiveDecision && showDecision) {
      // Start transition out
      setIsTransitioning(true);
      
      // After transition completes, hide the decision
      const timer = setTimeout(() => {
        setShowDecision(false);
        setIsTransitioning(false);
      }, 500); // Match this with your CSS transition time
      
      return () => clearTimeout(timer);
    }
  }, [hasActiveDecision, showDecision]);
  
  /**
   * Handle when a decision is made
   */
  const handleDecisionMade = async (decisionId: string, optionId: string) => {
    try {
      setError(null);
      await recordPlayerDecision(decisionId, optionId);
    } catch (error) {
      console.error('Failed to record decision:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };
  
  return (
    <div 
      className={`${styles['bhgm-narrative-container']} ${className}`} 
      data-testid="narrative-with-decisions"
      id="bhgmNarrativeWithDecisions"
    >
      {/* Show decision card when applicable */}
      {showDecision && (
        <div 
          className={`
            ${styles['bhgm-narrative-decision-wrapper']} 
            ${isTransitioning 
              ? styles['bhgm-narrative-transition-out'] 
              : styles['bhgm-narrative-transition-in']}
          `}
          data-testid="decision-wrapper"
        >
          <PlayerDecisionCard 
            decision={currentDecision}
            onDecisionMade={handleDecisionMade}
          />
          
          {/* Show error message if there was a problem */}
          {error && (
            <div 
              className={styles['bhgm-narrative-error-message']}
              data-testid="narrative-error-message"
            >
              {error}
              <button 
                className={styles['bhgm-narrative-dismiss-button']}
                onClick={() => setError(null)}
                data-testid="dismiss-error-button"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Always show narrative, but fade it when a decision is active */}
      <div 
        className={`
          ${styles['bhgm-narrative-wrapper']}
          ${showDecision ? styles['bhgm-narrative-faded'] : ''}
        `}
        data-testid="narrative-content-wrapper"
      >
        <NarrativeDisplay 
          narrative="" 
        />
      </div>
    </div>
  );
};

export default NarrativeWithDecisions;