/**
 * Debug-related type definitions
 */

import { LocationType } from '../services/locationService';
import type { NarrativeState, NarrativeAction, PlayerDecisionRecord } from './narrative.types';
import { ReactNode, Dispatch } from 'react';
import { GameState, GameAction } from '../types/campaign';

/**
 * Error Boundary component types
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Debug UI component props
 */
export interface DevToolsPanelProps {
  gameState: GameState;
  dispatch: Dispatch<GameAction>;
}

export interface GameControlSectionProps {
  dispatch: Dispatch<GameAction>;
  loading: string | null;
  setLoading: (state: string | null) => void;
  setError: (error: string | null) => void;
}

export interface GameStateDisplayProps {
  gameState: GameState;
}

export interface ContextualDecisionSectionProps {
  selectedLocationType: LocationType;
  setSelectedLocationType: (location: LocationType) => void;
  loading: string | null;
  hasActiveDecision: boolean;
  handleContextualDecision: () => void;
}

export interface DecisionTestingSectionProps {
  narrativeContext: {
    state: NarrativeState;
    dispatch: Dispatch<NarrativeAction>;
  };
  loading: string | null;
  setLoading: (state: string | null) => void;
  setError: (error: string | null) => void;
  forceRender: () => void;
  hasActiveDecision: boolean;
  handleClearDecision: () => void;
}

/**
 * Narrative Debug Panel component props
 */
export interface NarrativeDebugPanelProps {
  narrativeContext: {
    state: NarrativeState;
    dispatch: Dispatch<NarrativeAction>;
  };
  renderCount: number;
  showDecisionHistory: boolean;
  decisionHistory: PlayerDecisionRecord[];
}

export interface DebugMessage {
  id: string;
  timestamp: number;
  message: string;
  details?: string;
  level: 'info' | 'warning' | 'error' | 'success';
  category?: string;
  source?: string;
}

export interface DebugPanel {
  id: string;
  title: string;
  content: string | object;
  expanded?: boolean;
  createdAt: number;
  updatedAt: number;
  category?: string;
}

export interface DebugState {
  messages: DebugMessage[];
  panels: DebugPanel[];
  isEnabled: boolean;
  showInUi: boolean;
  isExpanded: boolean;
  activeView: 'messages' | 'panels' | 'timeline';
  filters: {
    levels: ('info' | 'warning' | 'error' | 'success')[];
    categories: string[];
    sources: string[];
    searchTerm: string;
  };
}

export interface DebugAction {
  type: string;
  payload?: unknown;
}

export interface GameDebugState {
  // Narrative state
  narrativeState?: Partial<NarrativeState>;
  
  // Location information
  currentLocation?: LocationType | string;
  previousLocations?: Array<LocationType | string>;
  
  // Engine state
  activeRules?: string[];
  evaluationResults?: Record<string, boolean>;
  
  // Performance metrics
  narrativeRenderTime?: number;
  ruleEvaluationTime?: number;
  decisionDetectionTime?: number;
  
  // Decision tracking
  decisionsGenerated?: number;
  decisionsShown?: number;
  decisionSatisfactionRating?: number;
  
  // Metrics specific to location
  locationSpecificData?: Record<string, unknown>;
}

export interface DebugConfig {
  maxMessages: number;
  maxPanels: number;
  autoExpand: boolean;
  persistBetweenSessions: boolean;
  defaultActiveView: 'messages' | 'panels' | 'timeline';
  categoriesEnabled: string[];
  levelsEnabled: ('info' | 'warning' | 'error' | 'success')[];
}
