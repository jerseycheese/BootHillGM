import React, { useState, useEffect, useRef } from 'react';
import { useNarrativeContext } from '../../hooks/useNarrativeContext';
import PlayerDecisionCard from '../player/PlayerDecisionCard';
import { NarrativeDisplay } from '../NarrativeDisplay';
import styles from './NarrativeWithDecisions.module.css';
import { EVENTS, listenForCustomEvent } from '../../utils/events';
import { PlayerDecision } from '../../types/narrative.types';

interface NarrativeWithDecisionsProps {
  className?: string;
  narrative: string;
  error?: string | null;
  onRetry?: () => void;
  id?: string;
  "data-testid"?: string;
}


/**
 * Component that integrates narrative display with decision cards
 * Handles the flow between narrative and decision states.
 * 
 * This component combines two key elements:
 * 1. The narrative text display (using NarrativeDisplay)
 * 2. Decision cards that appear when the player needs to make choices
 * 
 * State transitions between narrative and decision modes are handled
 * with CSS animations for smooth visual flow.
 */
const NarrativeWithDecisions: React.FC<NarrativeWithDecisionsProps> = ({
  className = '',
  narrative,
  error,
  onRetry,
  id,
  "data-testid": dataTestId
}) => {

  const {
    currentDecision, 
    hasActiveDecision, 
    recordPlayerDecision,
    clearPlayerDecision
  } = useNarrativeContext();
  
  // Direct tracking of current decision
  const [showDecision, setShowDecision] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [lastProcessedDecisionId, setLastProcessedDecisionId] = useState<string | null>(null);
  
  // Reference to track if component is mounted
  const isMounted = useRef(true);
  
  // Listen for our custom events
  useEffect(() => {
    // Handler for when a new decision is ready to be displayed
    const cleanupDecisionReady = listenForCustomEvent<PlayerDecision>(
      EVENTS.DECISION_READY, 
      (decision) => {
        if (decision && isMounted.current) {
          console.log('NarrativeWithDecisions: Decision ready event received', decision.id);
          setShowDecision(true);
          setLastProcessedDecisionId(decision.id);
          setIsTransitioning(false);
        }
      }
    );
    
    // Handler for when a decision has been cleared
    const cleanupDecisionCleared = listenForCustomEvent(
      EVENTS.DECISION_CLEARED, 
      () => {
        if (isMounted.current) {
          console.log('NarrativeWithDecisions: Decision cleared event received');
          setShowDecision(false);
          setLastProcessedDecisionId(null);
          setIsTransitioning(false);
        }
      }
    );
    
    // Handler for UI force updates
    const cleanupForceUpdate = listenForCustomEvent(
      EVENTS.UI_FORCE_UPDATE, 
      () => {
        if (isMounted.current) {
          // Force a recheck of the active decision
          if (hasActiveDecision && currentDecision) {
            setShowDecision(true);
            setLastProcessedDecisionId(currentDecision.id);
          } else {
            setShowDecision(false);
            setLastProcessedDecisionId(null);
          }
          setIsTransitioning(false);
        }
      }
    );
    
    // Handler for traditional storage events (backward compatibility)
    const handleStorageEvent = () => {
      if (isMounted.current) {
        if (hasActiveDecision && currentDecision) {
          setShowDecision(true);
          setLastProcessedDecisionId(currentDecision.id);
        } else {
          setShowDecision(false);
          setLastProcessedDecisionId(null);
        }
        setIsTransitioning(false);
      }
    };
    
    window.addEventListener('storage', handleStorageEvent);
    
    // Cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      cleanupDecisionReady();
      cleanupDecisionCleared();
      cleanupForceUpdate();
    };
  }, [hasActiveDecision, currentDecision]);
  
  // Track component mounting state to prevent state updates after unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Immediately mirror context state when it changes
  useEffect(() => {
    // On first mount or context change, check if there's already a decision
    if (hasActiveDecision && currentDecision) {
      if (!showDecision || currentDecision.id !== lastProcessedDecisionId) {
        setShowDecision(true);
        setLastProcessedDecisionId(currentDecision.id);
        setIsTransitioning(false);
      }
    } else if (!hasActiveDecision && showDecision) {
      setShowDecision(false);
      setLastProcessedDecisionId(null);
      setIsTransitioning(false);
    }
  }, [hasActiveDecision, currentDecision, showDecision, lastProcessedDecisionId]);
  
  /**
   * Handle when a decision is made by the player
   * Records the choice and manages UI transitions
   * 
   * @param decisionId - ID of the decision being responded to
   * @param optionId - ID of the option selected by the player
   */
  const handleDecisionMade = async (decisionId: string, optionId: string) => {
    try {
      setDecisionError(null);
      
      // Start the transition out
      setIsTransitioning(true);
      
      // Record the decision - this will also clear it from context
      await recordPlayerDecision(decisionId, optionId);
      
      // Hide the decision card after a short delay
      setTimeout(() => {
        if (isMounted.current) {
          setShowDecision(false);
          setIsTransitioning(false);
          setLastProcessedDecisionId(null);
        }
      }, 500);
      
    } catch (error) {
      console.error('Failed to record decision:', error);
      setDecisionError(error instanceof Error ? error.message : 'An unexpected error occurred');
      // Make sure we're not transitioning if there's an error
      setIsTransitioning(false);
    }
  };
  
  /**
   * Emergency handler for clearing decisions that might be stuck
   * Acts as a safety valve for edge cases
   */
  const handleForceClear = () => {
    // Clear in the state
    clearPlayerDecision();
    
    // Clear in the local component state
    setIsTransitioning(false);
    setShowDecision(false);
    setLastProcessedDecisionId(null);
  };
  
  return (
    <div 
      className={`${styles['bhgm-narrative-container']} ${className}`} 
      data-testid={dataTestId || "narrative-with-decisions"}
      id={id || "bhgmNarrativeWithDecisions"}
    >
      {/* Show decision card when applicable - note the explicit hasActiveDecision check */}
      {showDecision && hasActiveDecision && currentDecision && (
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
          {decisionError && (
            <div 
              className={styles['bhgm-narrative-error-message']}
              data-testid="narrative-error-message"
            >
              {decisionError}
              <div className="flex gap-2 mt-2">
                <button 
                  className={styles['bhgm-narrative-dismiss-button']}
                  onClick={() => setDecisionError(null)}
                  data-testid="dismiss-error-button"
                >
                  Dismiss
                </button>
                <button 
                  className={styles['bhgm-narrative-clear-button']}
                  onClick={handleForceClear}
                  data-testid="force-clear-button"
                >
                  Force Clear
                </button>
              </div>
            </div>
          )}
          
          {/* Emergency clear button for stuck decisions */}
          <div className={styles['bhgm-narrative-emergency-clear']}>
            <button 
              onClick={handleForceClear}
              className={styles['bhgm-narrative-emergency-button']}
              data-testid="emergency-clear"
              aria-label="Force clear decision"
            >
              ✖
            </button>
          </div>
        </div>
      )}
      
      {/* Always show narrative, but fade it when a decision is active */}
      <div 
        className={`
          ${styles['bhgm-narrative-wrapper']}
          ${showDecision && hasActiveDecision ? styles['bhgm-narrative-faded'] : ''}
        `}
        data-testid="narrative-content-wrapper"
      >
        <NarrativeDisplay 
          narrative={narrative}
          error={error}
          onRetry={onRetry}
          data-testid="narrative-display"
        />
      </div>
    </div>
  );
};

export default NarrativeWithDecisions;