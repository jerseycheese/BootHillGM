/**
 * Decision Reducer
 * 
 * This file contains the reducer logic for handling decision-related state updates.
 * It is used by the main narrative reducer to process decision-specific actions.
 */

import {
  NarrativeState,
  NarrativeAction,
  PlayerDecisionRecordWithImpact,
  DecisionImpact
} from '../types/narrative.types';

import { createDecisionRecord } from '../utils/decisionUtils';
import {
  processDecisionImpacts as processImpacts,
  evolveImpactsOverTime,
  addImpactsToDecisionRecord
} from '../utils/decisionImpactUtils';

/**
 * Processes a PRESENT_DECISION action
 * @param state - Current narrative state
 * @param action - The action to process
 * @returns Updated narrative state
 */
export const handlePresentDecision = (
  state: NarrativeState,
  action: Extract<NarrativeAction, { type: 'PRESENT_DECISION' }>
): NarrativeState => {
  return {
    ...state,
    currentDecision: action.payload,
    error: null // Clear any previous errors
  };
};

/**
 * Processes a RECORD_DECISION action
 * @param state - Current narrative state
 * @param action - The action to process
 * @returns Updated narrative state
 */
export const handleRecordDecision = (
  state: NarrativeState,
  action: Extract<NarrativeAction, { type: 'RECORD_DECISION' }>
): NarrativeState => {
  // Ensure we have a decision to record and a context to store it in
  if (!state.currentDecision) {
    return {
      ...state,
      error: {
        code: 'decision_not_found',
        message: 'No active decision to record.',
        context: { actionPayload: action.payload },
        timestamp: Date.now()
      }
    };
  }

  if (!state.narrativeContext) {
    return {
      ...state,
      error: {
        code: 'state_corruption',
        message: 'Narrative context is missing when trying to record a decision.',
        context: { decisionId: action.payload.decisionId },
        timestamp: Date.now()
      }
    };
  }

  const { decisionId, selectedOptionId, narrative } = action.payload;
  
  // Verify this is for the current decision
  if (state.currentDecision.id !== decisionId) {
    return {
      ...state,
      error: {
        code: 'decision_mismatch',
        message: `Decision ID mismatch: recording "${decisionId}" but current is "${state.currentDecision.id}".`,
        context: { 
          expected: state.currentDecision.id,
          received: decisionId
        },
        timestamp: Date.now()
      }
    };
  }
  
  try {
    // Create the decision record
    const decisionRecord = createDecisionRecord(
      state.currentDecision,
      selectedOptionId,
      narrative
    );

    // Update the narrative context with the new decision record
    return {
      ...state,
      currentDecision: undefined, // Clear the current decision
      narrativeContext: {
        ...state.narrativeContext,
        decisionHistory: [
          ...(state.narrativeContext.decisionHistory || []),
          decisionRecord
        ]
      },
      error: null // Clear any previous errors
    };
  } catch (error) {
    return {
      ...state,
      error: {
        code: 'validation_failed',
        message: error instanceof Error ? error.message : 'Failed to record decision',
        context: { decisionId, selectedOptionId },
        timestamp: Date.now()
      }
    };
  }
};

/**
 * Processes a CLEAR_CURRENT_DECISION action
 * @param state - Current narrative state
 * @returns Updated narrative state
 */
export const handleClearCurrentDecision = (
  state: NarrativeState
): NarrativeState => {
  return {
    ...state,
    currentDecision: undefined,
  };
};

/**
 * Processes a PROCESS_DECISION_IMPACTS action
 * @param state - Current narrative state
 * @param action - The action to process
 * @returns Updated narrative state
 */
export const handleProcessDecisionImpacts = (
  state: NarrativeState,
  action: Extract<NarrativeAction, { type: 'PROCESS_DECISION_IMPACTS' }>
): NarrativeState => {
  // The payload is now an array of DecisionImpact objects rather than a decision ID
  const impacts: DecisionImpact[] = action.payload;

  if (!state.narrativeContext?.impactState) {
    return {
      ...state,
      error: {
        code: 'state_corruption',
        message: 'Impact state is missing or undefined.',
        context: { impacts },
        timestamp: Date.now()
      }
    };
  }

  // Check for narrativeContext again
  if (!state.narrativeContext) {
    return {
      ...state,
      error: {
        code: 'state_corruption',
        message: 'Narrative context is missing or undefined.',
        context: { impacts },
        timestamp: Date.now()
      }
    };
  }

  // Check if we have decision history
  if (!state.narrativeContext.decisionHistory || state.narrativeContext.decisionHistory.length === 0) {
    return {
      ...state,
      error: {
        code: 'decision_not_found',
        message: 'No decision records found to process impacts for.',
        context: { impacts },
        timestamp: Date.now()
      }
    };
  }

  try {
    // Find the latest decision record to add impacts to
    const latestDecision = state.narrativeContext.decisionHistory[
      state.narrativeContext.decisionHistory.length - 1
    ];

    // Add impacts to the latest decision record
    const decisionWithImpacts = addImpactsToDecisionRecord(latestDecision, impacts);

    // Process the impacts
    const updatedImpactState = processImpacts(
      state.narrativeContext.impactState,
      decisionWithImpacts
    );

    // Update the latest decision in the history with the impacts
    const updatedHistory = [...state.narrativeContext.decisionHistory];
    updatedHistory[updatedHistory.length - 1] = decisionWithImpacts;

    return {
      ...state,
      narrativeContext: {
        ...state.narrativeContext,
        impactState: updatedImpactState,
        decisionHistory: updatedHistory
      },
      error: null // Clear any previous errors
    };
  } catch (error) {
    return {
      ...state,
      error: {
        code: 'system_error',
        message: error instanceof Error ? error.message : 'Failed to process decision impacts',
        context: { impacts },
        timestamp: Date.now()
      }
    };
  }
};

/**
 * Processes an UPDATE_IMPACT_STATE action
 * @param state - Current narrative state
 * @param action - The action to process
 * @returns Updated narrative state
 */
export const handleUpdateImpactState = (
  state: NarrativeState,
  action: Extract<NarrativeAction, { type: 'UPDATE_IMPACT_STATE' }>
): NarrativeState => {
  // Direct update to the impact state with provided values
  if (!state.narrativeContext?.impactState) {
    return {
      ...state,
      error: {
        code: 'state_corruption',
        message: 'Impact state is missing or undefined.',
        context: { update: action.payload },
        timestamp: Date.now()
      }
    };
  }

  return {
    ...state,
    narrativeContext: {
      ...state.narrativeContext,
      impactState: {
        ...state.narrativeContext.impactState,
        ...action.payload,
        lastUpdated: Date.now()
      }
    },
    error: null // Clear any previous errors
  };
};

/**
 * Processes an EVOLVE_IMPACTS action
 * @param state - Current narrative state
 * @returns Updated narrative state
 */
export const handleEvolveImpacts = (
  state: NarrativeState
): NarrativeState => {
  // Update impact values based on time passed and other factors
  if (!state.narrativeContext?.impactState) {
    return {
      ...state,
      error: {
        code: 'state_corruption',
        message: 'Impact state is missing or undefined.',
        timestamp: Date.now()
      }
    };
  }

  // Make sure narrativeContext exists
  if (!state.narrativeContext) {
    return {
      ...state,
      error: {
        code: 'state_corruption',
        message: 'Narrative context is missing or undefined.',
        timestamp: Date.now()
      }
    };
  }

  // Make sure decisionHistory exists
  if (!state.narrativeContext.decisionHistory) {
    return {
      ...state,
      error: {
        code: 'state_corruption',
        message: 'Decision history is missing or undefined.',
        timestamp: Date.now()
      }
    };
  }

  try {
    const impactRecords = state.narrativeContext.decisionHistory.filter(
      (record): record is PlayerDecisionRecordWithImpact => 
        'impacts' in record && 'processedForImpact' in record
    );

    const updatedImpactState = evolveImpactsOverTime(
      state.narrativeContext.impactState,
      impactRecords,
      Date.now()
    );

    return {
      ...state,
      narrativeContext: {
        ...state.narrativeContext,
        impactState: updatedImpactState
      },
      error: null // Clear any previous errors
    };
  } catch (error) {
    return {
      ...state,
      error: {
        code: 'system_error',
        message: error instanceof Error ? error.message : 'Failed to evolve impacts',
        timestamp: Date.now()
      }
    };
  }
};