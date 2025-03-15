/**
 * Debug-related type definitions
 */

import { LocationType } from '../services/locationService';
import type { NarrativeState } from './narrative.types';

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
